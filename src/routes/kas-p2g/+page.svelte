<script lang="ts">
    import { userStore } from "$lib/stores/userStores";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";

    import ModalForm, { modalForm } from "./ModalForm.svelte";
    import ComponentTable from "./ComponentTable.svelte";
    import { getKasP2g } from "$lib/firebase";
	import { onDestroy, onMount } from "svelte";
	import { viewRupiah, dateOption } from "$lib/tools";
	import jsPDF from "jspdf";

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

    const _filter = new Date().setMonth(0, 1)
    let dateFilter = $state(new Date(_filter).toLocaleDateString('en-CA'))
    
    const buttonFilter = () => {
        let newFilterDate
        newFilterDate = new Date(dateFilter)
        newFilterDate = newFilterDate.setFullYear(newFilterDate.getFullYear() - 1, 0, 1)
        dateFilter = new Date(newFilterDate).toLocaleDateString('en-CA')
    }

    // print to pdf
    const buttonToPdf = async() => {
        const doPrint = confirm("Ekport to PDF ?")
        if (!doPrint) return
        
        // initial table header for pdf
        const tableHeader = [
            [
                { content: 'NO', styles: { halign: 'center' as 'center' } },
                { content: 'TANGGAL', styles: { halign: 'center' as 'center' } },
                { content: 'KETERANGAN', styles: { halign: 'center' as 'center' }  },
                { content: 'JUMLAH', styles: { halign: 'center' as 'center' } },
            ]
        ]

        // create debit data
        let tablePemasukan = []
        if (dataFitered.debit.data.length <= 0) {
            tablePemasukan = [{ content: 'TIDAK ADA PEMASUKAN', colSpan:4, styles: { halign: 'center' } }]
        } else {
            tablePemasukan = dataFitered.debit.data.map((res, index) => [
                { content: index + 1, styles: { halign: 'center' } },
                { content: new Date(res?.tanggal).toLocaleDateString('id-ID', dateOption.duadigit as Intl.DateTimeFormatOptions) },
                res?.ket,
                { content: viewRupiah(res?.jumlah), styles: { halign: 'right' } },
            ])

            tablePemasukan.push([
                { content: "TOTAL", colSpan:3, styles: { halign:'right', fontStyle: 'bold' } },
                { content: viewRupiah(dataFitered.debit.jumlah), styles: { halign: 'right', fontStyle: 'bold' } },
            ])
        }

        // create kredit data
        let tablePengeluaran = []
        if (dataFitered.kredit.data.length <= 0) {
            tablePengeluaran = [{ content: 'TIDAK ADA PENGELUARAN', colSpan:4, styles: { halign: 'center' } }]
        } else {
            tablePengeluaran = dataFitered.kredit.data.map((res, index) => [
                { content: index + 1, styles: { halign: 'center' } },
                { content: new Date(res?.tanggal).toLocaleDateString('id-ID', dateOption.duadigit as Intl.DateTimeFormatOptions) },
                res?.ket,
                { content: viewRupiah(res?.jumlah), styles: { halign: 'right' } },
            ])

            tablePengeluaran.push([
                { content: "TOTAL", colSpan:3, styles: { halign:'right', fontStyle: 'bold' } },
                { content: viewRupiah(dataFitered.kredit.jumlah), styles: { halign: 'right', fontStyle: 'bold' } },
            ])
        }

        // Call jsPDF
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const doc = new jsPDF() as jsPDF & {
            lastAutoTable? : any,
            internal? : any
        };

        const _pageWidth = doc.internal.pageSize.getWidth()

        // set Text using auto table
        const _setText = (val, style = {}, startY = doc.lastAutoTable?.finalY, maginTop = 10) => {
            return autoTable(doc, {
                theme: 'plain',
                startY: startY + maginTop,
                body: [
                    [{
                        content: val,
                        styles: {
                            textColor: 'black',
                            fontSize: 12,
                            halign: 'left',
                            ...style 
                        }
                    }]
                ],
            });
        };

        // is set new page
        const _isNewPage = (contentSize, maginTop = 10, maginBottom = 30) => {
            return (doc.lastAutoTable?.finalY + contentSize + maginTop + maginBottom > doc.internal.pageSize.getHeight())
        }

        // 1. Add a Page Title
        _setText(
            'LAPORAN KAS PEMUDA-PEMUDI GADEN \r\n TAHUN '+ new Date().getFullYear(),
            { fontSize: 16, halign: 'center', fontStyle: 'bold' },
            10, 0
        )

        // pemasukan
        _setText('1. Pemasukan', {fontStyle: 'bold'})

        // table pemasukan
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY,
            theme: 'grid',
            head: tableHeader,
            body: tablePemasukan,
            tableWidth: 'auto',
            rowPageBreak: 'avoid',
            headStyles: {
                textColor: 'black',
                lineColor: 'black',
                lineWidth: 0.2,
                fillColor: '#a5d6a7',
            },
            styles: {
                fontSize: 12,
                textColor: 'black',
                lineColor: 'black',
                lineWidth: 0.2
            }
        })

        // pengeluaran
        let _do = _isNewPage(50)
        _do && doc.addPage()
        _setText(
            '1. Pengeluaran', 
            {fontStyle: 'bold'},
            _do ? 10 : doc.lastAutoTable?.finalY,
            _do ? 0 : 10
        )

        // table pemasukan
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY,
            theme: 'grid',
            head: tableHeader,
            body: tablePengeluaran,
            tableWidth: 'auto',
            rowPageBreak: 'avoid',
            headStyles: {
                textColor: 'black',
                lineColor: 'black',
                lineWidth: 0.2,
                fillColor: '#ffe082',
            },
            styles: {
                fontSize: 12,
                textColor: 'black',
                lineColor: 'black',
                lineWidth: 0.2
            }
        })

        // total saldo
        _setText(
            'SALDO AKHIR      :       ' + viewRupiah(dataFitered.saldo),
            { halign: 'right', fontSize: 16, fontStyle: 'bold' }
        )

        // Paraf
        const paraf = [
            [
                { content: '', styles: { halign: 'center' as const } },
                { content: new Date().toLocaleDateString("id-ID", dateOption.dateForParaf as Intl.DateTimeFormatOptions), styles: { halign: 'center' as const } },
            ],
            [
                { content: 'Bendahara', styles: { halign: 'center' as const } },
                { content: 'Ketua', styles: { halign: 'center' as const } },
            ],
            [
                { content: '\r\n\r\n\r\n\r\n\r\n(                                                       )', styles: { halign: 'center' as const } },
                { content: '\r\n\r\n\r\n\r\n\r\n(                                                       )', styles: { halign: 'center' as const } },
            ]
        ]
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            theme: 'plain',
            body: paraf,
            tableWidth: 'auto',
            pageBreak: 'avoid',
            styles: {
                fontSize: 12,
                lineWidth: 0, 
                fillColor: null,
            },
        });

        // 4. Add a footer with page number (optional)
        let pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setFont('helvetica', 'italic')

            doc.text(
                'Halaman ' + i + ' dari ' + pageCount,
                 _pageWidth - 14, 
                 doc.internal.pageSize.getHeight() - 10, 
                { align: 'right' }
            );

            doc.text(
                'Dibuat tanggal ' + new Date().toLocaleDateString('id-ID', dateOption.duadigit as Intl.DateTimeFormatOptions), 
                14, 
                doc.internal.pageSize.getHeight() - 10, 
                { align: 'left' }
            );
        }

        // Save the PDF
        doc.save('Laporan KAS P2G ('+ new Date().toLocaleDateString('id-ID', dateOption.dateForPdf as Intl.DateTimeFormatOptions) +').pdf');
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
            unSbuscribe = await getKasP2g((snapshot) => {  
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

<div class="container" style="padding-bottom: 40px;">
    <!--  -->
    <div class="row">
        <div class="col-auto">
            <input type="date" bind:value={dateFilter} class="input" />
        </div>
        
        {#if ['superadmin', 'admin'].includes($userStore?.role)}
        <div class="col-0">
            <button onclick={buttonToPdf} class="button secondary">
                <span>Export PDF</span>
            </button>
            <button onclick={() => modalForm.show()} class="button primary" aria-label='tambah data'>
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
            </button>
        </div>
        {/if}
    </div>

    <div class="row">
        <div class="col-4 md:col-2">
            <ComponentTable title="PEMASUKAN" type="debit" data={dataFitered.debit} buttonFilter={buttonFilter} />
        </div>

        <div class="col-4 md:col-2">
            <ComponentTable title="PENGELUARAN" type="kredit" data={dataFitered.kredit} />
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div class="row">
            <div class="col-auto">
                <span> Jumlah Saldo </span>
            </div>
            <div class="col-0">
                <span> {viewRupiah(dataFitered.saldo)} </span>
            </div>
        </div>
    </div>
</div>

{#if modalForm?.isVisible}
    <ModalForm role={$userStore?.role} />
{/if}

<style>
    .footer {
        width: 100%;
        background-color: white;
        position: fixed;
        bottom: 0;
        span {
            font-size: large;
            font-weight: bold;
        }
    }
</style>
