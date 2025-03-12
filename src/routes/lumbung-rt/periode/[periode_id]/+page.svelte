<script>
	import { page } from "$app/state";
    import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { goto } from "$app/navigation";

    import { getPeriodeById } from "$lib/supabase/tb_periode";
	import { loadingStore } from "$lib/stores/loadingStore";
    import { alertStore } from "$lib/stores/alertStore";
    import { userSupabaseStore } from "$lib/stores/userStores";
    import { dateOption, viewRupiah } from "$lib/tools";
	import { getSisaPinjamByPeriode } from "$lib/supabase/sisa_pinjam";

	import ModalFormPeriode, { modalForm } from "../ModalFormPeriode.svelte";
	import FormAction, { formAction } from "./FormAction.svelte";
    import { printPDF } from "./PrintPDF.svelte"

    import jsPDF from "jspdf";
	import PrintPdf from "./PrintPDF.svelte";

    // get param
    let periode_id = page.params.periode_id

    // get data pinjam
    let filter_value = $state(false)
    let temp_data_pinjam = $state({ data: [], sum: {}})
    let data_pinjam = $derived(
        filter_value
            ? temp_data_pinjam.data.filter((res) => res.pinjam_total > 0)
            : temp_data_pinjam.data
    )
    const getDataPinjam = async() => {
        loadingStore.show()
        await getSisaPinjamByPeriode(periode_id)
            .then((data) => {
                temp_data_pinjam = data
            })
            .catch((error) => {
                alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
            })
            .finally(() => loadingStore.hide())
    }

    // get data periode
    let data_periode = $state({...modalForm.formData})    
    const getPeriode = async() => {
        loadingStore.show()
        await getPeriodeById(periode_id)
            .then((data) => {
                data_periode = data
                getDataPinjam()
            })
            .catch((error) => {
                alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
                goto('/lumbung-rt/periode', {replaceState: true})
            })
            .finally(() => loadingStore.hide())
    }

    // Check is admin or not
    let _isAdmin = $derived(
        ['admin', 'superadmin'].includes($userSupabaseStore?.user?.user_role)
    )

    // Show Action
    const showAction = (res) => {
        if (_isAdmin) {
            formAction.show(res)
        }
    }

    onMount(() => {
        if (!periode_id) {
            goto('/lumbung-rt/periode', {replaceState: true})
            return
        }
        
        getPeriode()
    })
</script>

<div class="container">
    <div class="row gap-0">
        <div class="col-4 gap-0">
            <div class="table-container detail">
                <div class="table-title"> 
                    <div>
                        <button class="button small" style="color: blue;" onclick={() => goto('/lumbung-rt/periode')} aria-label="back" > 
                            <i class="fa-solid fa-arrow-left"></i> 
                        </button>
                        Periode { data_periode.nama_periode }
                    </div>

                    {#if _isAdmin}
                    <div>
                        <button class="button small" aria-label="edit" onclick={() => printPDF.show()} >
                            <i class="fa-solid fa-print"></i>
                        </button>

                        <button class="button small" aria-label="edit" onclick={() => modalForm.show(data_periode)} >
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                    </div>
                    {/if}
                </div>
            
                <div class="table-body">
                    <table>
                        <tbody>
                            <tr>
                                <td style="width: 150px;">Jasa</td>
                                <td>{data_periode.jasa * 100} Persen</td>
                            </tr>
                            <tr>
                                <td>Tgl. Pinjam</td>
                                <td>{new Date(data_periode.tgl_pinjam).toLocaleDateString('id-ID', dateOption.dateForKasList)}</td>
                            </tr>
                            <tr>
                                <td>Tgl. Pembayaran</td>
                                <td>
                                    { data_periode?.tgl_bayar 
                                        ? new Date(data_periode.tgl_bayar).toLocaleDateString('id-ID', dateOption.dateForKasList)
                                        : '-' }
                                </td>
                            </tr>
                            <tr>
                                <td>Keterangan</td>
                                <td>{data_periode?.ket ? data_periode.ket.replace(/\\n/g, '\n') : '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="row gap-0">
        <div class="col-4">
            <div class="table-container list">
                <div class="table-title">
                    <span> Daftar Pinjaman </span>

                    <div class="toggle-filter">
                        <span>Filter anggota</span>
                        <div><input class="toggle" type="checkbox" bind:checked={filter_value} /></div>
                    </div>
                </div>
            
                <div class="table-body">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;" >#</th>
                                <th>Nama</th>
                                <th>Pinj. Lama</th>
                                <th>Pinj. Baru</th>
                                <th>Total Pinj.</th>
                                <th>Jasa</th>
                                <th>Pinj. + Jasa</th>
                                <th>Bayar</th>
                                <th>Ket</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each data_pinjam as res, i}
                            <tr 
                            in:fade
                            class:sisa_pinjam={res.sisa_pinjam > 0}
                            class:bayar={res.jumlah_bayar > 0 & res.sisa_pinjam > 0}
                            onclick={() => showAction(res)}
                            >
                                <td class="text-center text-bold nomor"> {i + 1} </td>
                                <td data-label={`${i + 1}. `} class="nama"> {res.nama} </td>
                                <td data-label="Pinj. Lama" class="text-end"> {res.pinjam_lama ? viewRupiah(res.pinjam_lama) : '-'} </td>
                                <td data-label="Pinj. Baru" class="text-end"> {res.pinjam_baru ? viewRupiah(res.pinjam_baru) : '-'} </td>
                                <td data-label="Total Pinj." class="text-end"> {res.pinjam_total ? viewRupiah(res.pinjam_total) : '-'} </td>
                                <td data-label="Jasa" class="text-end"> {res.jasa ? viewRupiah(res.jasa) : '-'} </td>
                                <td data-label="Pinj. + Jasa" class="text-end"> {res?.pinjam_and_jasa ? viewRupiah(res.pinjam_and_jasa) : '-'} </td>
                                <td data-label="Jumlah Bayar" class="text-end"> {res.jumlah_bayar ? viewRupiah(res.jumlah_bayar) : '-'} </td>
                                <th data-label="Keterangan" class="text-end"> 
                                    {#if res.sisa_pinjam > 0}
                                    - {viewRupiah(res.sisa_pinjam)}
                                    {:else if res.pinjam_total > 0}
                                        LUNAS
                                    {:else}
                                        -
                                    {/if} 
                                </th>
                            </tr>
                            {/each}

                            {#if temp_data_pinjam.data.length}
                            <tr>
                                <th class="text-end nama" colspan="2"> JUMLAH TOTAL </th>
                                <th data-label="Pinj. Lama" class="text-end"> {temp_data_pinjam.sum.pinjam_lama ? viewRupiah(temp_data_pinjam.sum.pinjam_lama) : '-'} </th>
                                <th data-label="Pinj. Baru" class="text-end"> {temp_data_pinjam.sum.pinjam_baru ? viewRupiah(temp_data_pinjam.sum.pinjam_baru)  : '-'} </th>
                                <th data-label="Total Pinj." class="text-end"> {temp_data_pinjam.sum.pinjam_total ? viewRupiah(temp_data_pinjam.sum.pinjam_total)  : '-'} </th>
                                <th data-label="Jasa" class="text-end"> {temp_data_pinjam.sum.jasa ? viewRupiah(temp_data_pinjam.sum.jasa) : '-'} </th>
                                <th data-label="Pinj. + Jasa" class="text-end"> {temp_data_pinjam.sum.pinjam_and_jasa ? viewRupiah(temp_data_pinjam.sum.pinjam_and_jasa) : '-'} </th>
                                <th data-label="Pembayaran" class="text-end"> {temp_data_pinjam.sum.jumlah_bayar ? viewRupiah(temp_data_pinjam.sum.jumlah_bayar) : '-'} </th>
                                <th data-label="Keterangan" class="text-end"> 
                                    {
                                        temp_data_pinjam.sum?.sisa_pinjam > 0
                                            ? '- ' + viewRupiah(temp_data_pinjam.sum.sisa_pinjam)
                                            : '-'
                                    } 
                                </th>
                            </tr>
                            {:else}
                            <tr>
                                <th class="error text-center" colSpan="9"> Tidak ada data </th>
                            </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{#if modalForm.isVisible && _isAdmin}
<ModalFormPeriode getPeriode={getPeriode} />
{/if}

{#if formAction.isVisible && _isAdmin}
<FormAction getDataPinjam={getDataPinjam} />
{/if}

{#if printPDF.isVisible && _isAdmin}
<PrintPdf dt_periode={data_periode} dt_laporan={temp_data_pinjam} />
{/if}

<style>
	.table-container {
        --color-table: #FADA7A;

        background-color: color-mix(in srgb, var(--color-table), white 50%);
        border: 2px solid var(--color-table);
        border-radius: 5px;
        padding: var(--cel-gap);
        /* padding-bottom: 50px; */
        position: relative;
        overflow-x: auto;

        > .table-title { 
            display: flex;
            justify-content: space-between;
            /* padding: var(--cel-gap);  */
            font-weight: bold;

            > .toggle-filter {
                font-weight: 400;
                display: flex;
                column-gap: 10px;
                
                input {min-height: 0; width: 24px !important; height: 24px !important; margin: 0; padding: 0;}
            }
        }

        > .table-body {
            > table {   
                width: 100%;
                border: 1px solid black;
                border-collapse: collapse;
                th, td {
                    padding: 2px;
                    vertical-align: text-top;
                    border: 1px solid black;
                }
    
                thead > tr {
                    background-color: var(--color-table);
                }
        
                > tbody > tr {
					background-color: color-mix(in srgb, var(--color-table), white 80%);
                    transition: background-color 0.2s ease;
        
                    &:nth-child(even) {
                        background-color: color-mix(in srgb, var(--color-table), white 45%);
                    }

                    &:hover {
                        background-color: var(--color-table);
                    }

                    &.sisa_pinjam {
                        color: #E52020;
                        font-weight: 500;
                    }

                    &.bayar {
                        color: #2E5077;
                        font-weight: 500;
                    }
                }
            }
        }

        &.detail {
            --color-table: white;
        }

        &.list {
            @media (max-width: 900px) {
                table, thead, tbody, th, td, tr {
                    display: block;
                    width: 100%;
                    border: none !important;
                }
                
                thead {
                    display: none; /* Hide table headers */
                }

                tr {
                    margin-bottom: 10px;
                    border: 1.5px solid black !important;
                }

                td, th {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px !important;
                    border-bottom: 1px solid black !important;

                    &.nomor { display: none; }
                    &.nama, &.error { 
                        justify-content: center; 
                        font-weight: 500;
                        text-transform: capitalize;
                    }

                }

                td::before, th::before {
                    content: attr(data-label);
                    font-weight: 500;
                    text-transform: capitalize;
                    padding-right: 5px;
                    text-align: left;
                }

                td:last-child, th:last-child {
                    border: none !important;
                }
            }
        }
    }
</style>