<script lang="ts">
    import { userStore } from "$lib/stores/userStores";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";

    import ModalForm, { modalForm } from "./ModalForm.svelte";
    import ComponentTable from "./ComponentTable.svelte";
    import { getKasGfc } from "$lib/firebase";
	import { onDestroy, onMount } from "svelte";
	import { viewRupiah, dateOption } from "$lib/tools";
	import html2canvas from "html2canvas";
	import { error } from "@sveltejs/kit";

    let dataKas = $state([])
    let dataFitered = $state({
        debit: {
            data: [],
            jumlah: 0
        },
        kredit: {
            data: [],
            jumlah: 0
        },
        saldo: 0
    })

    const _filter = new Date().setDate(1)
    let dateFilter = $state(new Date(_filter).toLocaleDateString('en-CA'))
    
    const buttonFilter = () => {
        let newFilterDate
        newFilterDate = new Date(dateFilter)
        newFilterDate = newFilterDate.setFullYear(
            newFilterDate.getMonth() - 1 < 0 ? newFilterDate.getFullYear() - 1 : newFilterDate.getFullYear(), 
            newFilterDate.getMonth() - 1 < 0 ? 11 : newFilterDate.getMonth() - 1, 
            1
        )
        dateFilter = new Date(newFilterDate).toLocaleDateString('en-CA')
    }

    let captureEl: HTMLElement = $state(null)
    let doCapture = $state(false)
    const toPng = async() => {
        new Promise((resolve, reject) => {
            doCapture = true
            if (doCapture) {
                resolve(doCapture)
            } else {
                reject()
            }
        })
        .then(async(result) => {
            if (!captureEl && doCapture) return
        
            try {
                const canvas = await html2canvas(captureEl, {
                    useCORS: true
                })
                const pngUrl = canvas.toDataURL('image/png')
                const link = document.createElement("a")
                link.download = `Kas Gaden FC [${new Date().toLocaleDateString('id-ID', dateOption.dateForPdf as Intl.DateTimeFormatOptions)}].png`
                link.href = pngUrl
                link.click()
            } catch (error) {
                console.error(error)
            }
        })
        .catch((error) => {console.error(error)})
        .finally(() => { doCapture = false })
    }

    $effect(() => {
        loadingStore.show()
        const filterVal = new Date(dateFilter)
        const dataLama = dataKas.filter((kas) => new Date(kas.tanggal) < filterVal )
        const dataBaru = dataKas.filter((kas) => new Date(kas.tanggal) >= filterVal )

        // Saldo Lama
        const saldoLama = {
            debit: dataLama.filter(kas => kas.type === 'debit').reduce((sum, kas) => sum + kas.jumlah, 0),
            kredit: dataLama.filter(kas => kas.type === 'kredit').reduce((sum, kas) => sum + kas.jumlah, 0)
        }
        const kasLama = {
            id: null,
            tanggal: filterVal,
            ket: 'Saldo Kas Per ' + filterVal.toLocaleDateString('id-ID', dateOption.dateForKasList as Intl.DateTimeFormatOptions),
            jumlah: saldoLama.debit - saldoLama.kredit
        }
        
        // Data Debit
        const tempDebit = dataBaru.filter((kas) => kas.type === 'debit')
        const dataDebit = {
            data: dataLama.length > 0 ? [ kasLama, ...tempDebit ] : tempDebit,
            jumlah: kasLama.jumlah + tempDebit.reduce((sum, kas) => sum + kas.jumlah, 0) 
        }

        // Data Kredit
        const tempKredit = dataBaru.filter((kas) => kas.type === 'kredit')
        const dataKredit = {
            data: tempKredit,
            jumlah: tempKredit.reduce((sum, kas) => sum + kas.jumlah, 0) 
        }
        dataFitered.debit = dataDebit
        dataFitered.kredit = dataKredit
        dataFitered.saldo = dataDebit.jumlah - dataKredit.jumlah

        loadingStore.hide()
    })

    let unSbuscribe
    onMount(async() => {
        try {
            loadingStore.show()
            unSbuscribe = await getKasGfc((snapshot) => {  
                if (!snapshot.empty) {
                    dataKas = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        tanggal: doc.data().tanggal.toDate()
                    }))
                    // console.log(snapshot.docChanges())
                }
            })
            .catch(error => alertStore.show(error, 'danger'))
            .finally(() => loadingStore.hide())
        } catch (error) {
            alertStore.show(error, 'danger')
        }
    })

    onDestroy(() => {
        if (unSbuscribe) unSbuscribe();
    })
</script>

<div style="padding-bottom: 40px;">
    <!--  -->
    <div class="row">
        <div class="col-xs">
            <input type="date" bind:value={dateFilter} class="input" />
        </div>
        
        {#if ['superadmin', 'gadenfc'].includes($userStore?.role)}
        <div class="col">
            <button onclick={toPng} class="button secondary">
                <span>Export</span>
            </button>
            <button onclick={() => modalForm.show()} class="button primary" aria-label='tambah data'>
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
            </button>
        </div>
        {/if}
    </div>

    <div class="row">
        <div class="col-xs-12 col-lg-6">
            <ComponentTable title="PEMASUKAN" type="debit" data={dataFitered.debit} buttonFilter={buttonFilter} />
        </div>

        <div class="col-xs-12 col-lg-6">
            <ComponentTable title="PENGELUARAN" type="kredit" data={dataFitered.kredit} />
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <!-- <div class="row">
            <div class="col-auto">
                <span> Jumlah Saldo </span>
            </div>
            <div class="col-0">
                <span> {viewRupiah(dataFitered.saldo)} </span>
            </div>
        </div> -->

        <div class="container">
            <div class="row" >
                <div class="col-xs">
                    <span> Jumlah Saldo </span>
                </div>
                
                <div class="col-xs total">
                    <span> {viewRupiah(dataFitered.saldo)} </span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- htmltoCanvas -->
<div bind:this={captureEl} class="html-to-canvas" class:hide={!doCapture}>
    <span class="text-center">
        <h5>KAS GADEN FC - 22/12/2025</h5>
    </span>
    <br>
    
    <div class="_1">
        <div>
            <h5 class="_t">Pemasukan</h5>
            <table class="striped">
                <thead>
                    <tr>
                        <th style="width: 80px;">tgl</th>
                        <th>ket</th>
                        <th style="width: 80px;">jumlah</th>
                    </tr>
                </thead>

                <tbody>
                    {#each dataFitered.debit.data as res, i}
                        <tr>
                            <td class="text-center">{res?.tanggal.toLocaleDateString('id-ID', dateOption.duadigit)}</td>
                            <td class="text-start" style="white-space: pre-line;">{res?.ket.replace(/\\n/g, '\n')}</td>
                            <td class="text-end">{viewRupiah(res?.jumlah)}</td>
                        </tr>
                    {/each}
                </tbody>

                <tfoot>
                    <tr>
                        <td class="text-end" colspan="2">TOTAL</td>
                        <td class="text-end">{viewRupiah(dataFitered.debit.jumlah)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div>
            <h5 class="_t">Pengeluaran</h5>
            <table class="striped">
                <thead>
                    <tr>
                        <th style="width: 80px;">tgl</th>
                        <th>ket</th>
                        <th style="width: 80px;">jumlah</th>
                    </tr>
                </thead>

                <tbody>
                    {#each dataFitered.kredit.data as res, i}
                        <tr>
                            <td class="text-center">{res?.tanggal.toLocaleDateString('id-ID', dateOption.duadigit)}</td>
                            <td class="text-start" style="white-space: pre-line;">{res?.ket.replace(/\\n/g, '\n')}</td>
                            <td class="text-end">{viewRupiah(res?.jumlah)}</td>
                        </tr>
                    {/each}
                </tbody>

                <tfoot>
                    <tr>
                        <td class="text-end" colspan="2">TOTAL</td>
                        <td class="text-end">{viewRupiah(dataFitered.kredit.jumlah)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
    <br>

    <div class="text-end" style="padding: 6px;">
        <h5>TOTAL SALDO : {viewRupiah(dataFitered.saldo)}</h5>
    </div>

</div>

{#if modalForm?.isVisible}
    <ModalForm role={$userStore?.role} />
{/if}

<style>
    .col-xs-12 {
        margin-bottom: 1rem;
    }

    .footer {
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
        background-color: var(--pico-background-color);

        .total {
            display: flex;
            justify-content: end;
        }
        
        span {
            font-size: larger;
            font-weight: bold;
        }
    }

    .html-to-canvas {
        width: 800px;
        min-height: 500px;
        padding: 10px;
        border: 1px dashed black;
        font-family: monospace;
        position: relative;
        overflow: hidden;
        
        h5 {
            font-family: monospace;

            &._t { text-decoration: underline; }
        }

        ._1{
            display: flex;

            > div { 
                flex: 1;
                padding: 6px; 
            }

            table {
                /* border: 1px solid black; */
                padding: 0;

                thead { th {background-color:wheat;}}

                th { text-align: center; }
                td { vertical-align: top; }
                th, td { padding: 5px; }
            }
        }

        &.hide {
            visibility: hidden;
            display: none;
        }
    }

    .html-to-canvas::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url('/gfc.png');
        /* background-size: contain; */
        background-size: 400px 400px;
        background-repeat: no-repeat;
        opacity: 0.1; /* adjust as needed */
        z-index: 0;
        background-position: center;
    }
</style>
