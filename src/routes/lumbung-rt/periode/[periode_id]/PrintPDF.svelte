<script module>
    class classForm {
        isVisible = $state(false)
        show() { this.isVisible = true; disableBodyScroll() }
        hide() { this.isVisible = false; disableBodyScroll(false) }
    }

    export const printPDF = new classForm
</script>

<script>
	import { disableBodyScroll, dateOption, viewRupiah } from "$lib/tools";
	import { fade } from "svelte/transition";
	import TablePeriode from "../TablePeriode.svelte";

    // get prop data
    let { dt_periode, dt_laporan } = $props() 

    const printTagihan = async() => {
        const doPrint = confirm("Print Tagihan Pinjaman to PDF ?")
        if (!doPrint) return

        // Call jsPDF
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

         // Initialize jsPDF with F4 paper size
        const doc = new jsPDF({
            orientation: 'portrait', // or 'landscape'
            unit: 'mm',
            format: [210, 330] // F4 size in millimeters
        });

        const _pageWidth = doc.internal.pageSize.getWidth()
        const _margin = {
            left: 15,
            top: 15,
            right: 15,
            bottom: 15,
        }

        // set Text using auto table
        const _setText = (val, style = {}, startY = doc.lastAutoTable?.finalY, maginTop = 10) => {
            return autoTable(doc, {
                margin: { left: _margin.left, right: _margin.right},
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

        // 1. Add page title
        _setText(`DAFTAR PINJAMAN LUMBUNG RT 02 DK. GADEN\r\nPERIODE ${dt_periode?.nama_periode}`, 
            {halign: 'center', fontStyle: 'bold'}, 
            10, 0
        )

        // 2. Tgl Tutup Buku
        _setText(`Tanggal Pinjam : ${new Date(dt_periode?.tgl_pinjam).toLocaleDateString('id-ID', dateOption.dateForPdf)}`)

        // 3. Table Laporan
        const tableHeader = [
            [
                { content: 'NO', styles: { halign: 'center'} },
                { content: 'NAMA', styles: { halign: 'center'} },
                { content: 'POKOK', styles: { halign: 'center'} },
                { content: 'JASA', styles: { halign: 'center'} },
                { content: 'TOTAL', styles: { halign: 'center'} },
                { content: 'KET', styles: { halign: 'center'} },
            ]
        ]

        let tableLaporan = []
        if (dt_periode?.data?.length <= 0) {
            tableLaporan = [{ content: 'TIDAK ADA DATA', colSpan:6, styles: { halign: 'center' } }]
        } else {
            const temp_tagihan = dt_laporan.data.filter((i) => i.pinjam_and_jasa > 0)
            tableLaporan = temp_tagihan.map((res, index) => {
                const p_total = res?.pinjam_total ? viewRupiah(res.pinjam_total) : '-'
                const jasa = res?.jasa ? viewRupiah(res.jasa) : '-'
                const p_and_j = res?.pinjam_and_jasa ? viewRupiah(res.pinjam_and_jasa) : '-'
                const bayar = res?.jumlah_bayar ? viewRupiah(res.jumlah_bayar) : '-'
                
                return [
                    { content: index + 1, styles: { halign: 'center' } },
                    res?.nama,
                    { content: p_total, styles: { halign: 'right' } },
                    { content: jasa, styles: { halign: 'right' } },
                    { content: p_and_j, styles: { halign: 'right' } },
                    '                       ',
                ]
            })

            tableLaporan.push([
                { content: "TOTAL", colSpan:2, styles: { halign:'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_total), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_and_jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                '',
            ])
        }

        autoTable(doc, {
            margin: { left: _margin.left, right: _margin.right},
            startY: doc.lastAutoTable.finalY,
            theme: 'grid',
            head: tableHeader,
            body: tableLaporan,
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

        // ** Paraf
        const paraf = [
            [
                { content: '', styles: { halign: 'center'} },
                { content: new Date().toLocaleDateString("id-ID", dateOption.dateForParaf), styles: { halign: 'center'} },
            ],
            [
                { content: '', styles: { halign: 'center'} },
                { content: 'Ketua RT 02 Dk. Gaden', styles: { halign: 'center'} },
            ],
            [
                { content: '\r\n\r\n\r\n\r\n\r\n                                                         ', styles: { halign: 'center'} },
                { content: '\r\n\r\n\r\n\r\n\r\n(                                                       )', styles: { halign: 'center'} },
            ]
        ]
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 5,
            margin: { left: _margin.left, right: _margin.right},
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

        // ** Add a footer with page number (optional)
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
                'Dibuat tanggal ' + new Date().toLocaleDateString('id-ID', dateOption.duadigit), 
                14, 
                doc.internal.pageSize.getHeight() - 10, 
                { align: 'left' }
            );
        }

        // Save the PDF
        doc.save(`Tagihan Pinjaman RT 02 Periode ${dt_periode.nama_periode} ( ${new Date().toLocaleDateString('id-ID', dateOption.dateForPdf)} ).pdf`);
    }

    const printPembayaran = async() => {
        const doPrint = confirm("Print Form Pembayaran Pinjaman to PDF ?")
        if (!doPrint) return

        // Call jsPDF
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

         // Initialize jsPDF with F4 paper size
        const doc = new jsPDF({
            orientation: 'landscape', // or 'landscape'
            unit: 'mm',
            format: [210, 330] // F4 size in millimeters
        });

        const _pageWidth = doc.internal.pageSize.getWidth()
        const _margin = {
            left: 15,
            top: 15,
            right: 15,
            bottom: 15,
        }

        // set Text using auto table
        const _setText = (val, style = {}, startY = doc.lastAutoTable?.finalY, maginTop = 10) => {
            return autoTable(doc, {
                margin: { left: _margin.left, right: _margin.right},
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

        // 1. Add page title
        _setText(`FORM PEMBAYARAN PINJAMAN LUMBUNG RT 02 DK. GADEN\r\nPERIODE ${dt_periode?.nama_periode}`, 
            {halign: 'center', fontStyle: 'bold'}, 
            10, 0
        )

        // 2. Tgl Tutup Buku
        _setText(`Tanggal Pinjam : ${new Date(dt_periode?.tgl_pinjam).toLocaleDateString('id-ID', dateOption.dateForPdf)}`)
        _setText(`Tanggal Pembayaran : ${new Date(dt_periode?.tgl_bayar).toLocaleDateString('id-ID', dateOption.dateForPdf)}`,
            {}, doc.lastAutoTable.finalY, 0
        )

        // 3. Table Laporan
        const tableHeader = [
            [
                { content: 'NO', styles: { halign: 'center'} },
                { content: 'NAMA', styles: { halign: 'center'} },
                { content: 'POKOK', styles: { halign: 'center'} },
                { content: 'JASA', styles: { halign: 'center'} },
                { content: 'TOTAL', styles: { halign: 'center'} },
                { content: 'BAYAR', styles: { halign: 'center'} },
                { content: 'KET', styles: { halign: 'center'} },
                { content: 'PARAF', colSpan:2, styles: { halign: 'center'} },
            ]
        ]

        let tableLaporan = []
        if (dt_periode?.data?.length <= 0) {
            tableLaporan = [{ content: 'TIDAK ADA DATA', colSpan:8, styles: { halign: 'center' } }]
        } else {
            const temp_tagihan = dt_laporan.data.filter((i) => i.pinjam_and_jasa > 0)
            tableLaporan = temp_tagihan.map((res, index) => {
                const p_total = res?.pinjam_total ? viewRupiah(res.pinjam_total) : '-'
                const jasa = res?.jasa ? viewRupiah(res.jasa) : '-'
                const p_and_j = res?.pinjam_and_jasa ? viewRupiah(res.pinjam_and_jasa) : '-'
                const bayar = res?.jumlah_bayar ? viewRupiah(res.jumlah_bayar) : '-'
                
                return [
                    { content: index + 1, styles: { halign: 'center' } },
                    res?.nama,
                    { content: p_total, styles: { halign: 'right' } },
                    { content: jasa, styles: { halign: 'right' } },
                    { content: p_and_j, styles: { halign: 'right' } },
                    '                           ',
                    '                           ',
                    (index + 1) % 2 !== 0 ? `${index+1})            ` : '' ,
                    (index + 1) % 2 === 0 ? `${index+1})            ` : '' , 
                ]
            })

            tableLaporan.push([
                { content: "TOTAL", colSpan:2, styles: { halign:'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_total), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_and_jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                '',
                '',
                '',
                '',
                '',
            ])
        }

        autoTable(doc, {
            margin: { left: _margin.left, right: _margin.right},
            startY: doc.lastAutoTable.finalY,
            theme: 'grid',
            head: tableHeader,
            body: tableLaporan,
            tableWidth: 'auto',
            rowPageBreak: 'avoid',
            headStyles: {
                textColor: 'black',
                lineColor: 'black',
                lineWidth: 0.2,
                fillColor: '#a5d6a7',
            },
            styles: {
                fontSize: 14,
                textColor: 'black',
                lineColor: 'black',
                lineWidth: 0.2,
                valign: 'middle'
            },
            didParseCell: (data) => {
                if (data.row.section !== 'head'){ data.cell.styles.minCellHeight = 15 }
            }
        })

        // ** Paraf
        const paraf = [
            [
                { content: '', styles: { halign: 'center'} },
                { content: new Date(dt_periode.tgl_bayar).toLocaleDateString("id-ID", dateOption.dateForParaf), styles: { halign: 'center'} },
            ],
            [
                { content: '', styles: { halign: 'center'} },
                { content: 'Ketua RT 02 Dk. Gaden', styles: { halign: 'center'} },
            ],
            [
                { content: '\r\n\r\n\r\n\r\n\r\n                                                                    ', styles: { halign: 'center'} },
                { content: '\r\n\r\n\r\n\r\n\r\n(                                                                  )', styles: { halign: 'center'} },
            ]
        ]
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 5,
            margin: { left: _margin.left, right: _margin.right},
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

        // ** Add a footer with page number (optional)
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
                'Dibuat tanggal ' + new Date(dt_periode.tgl_bayar).toLocaleDateString('id-ID', dateOption.duadigit), 
                14, 
                doc.internal.pageSize.getHeight() - 10, 
                { align: 'left' }
            );
        }

        // Save the PDF
        doc.save(`Form Pembayaran Pinjaman RT 02 Periode ${dt_periode.nama_periode} ( ${new Date().toLocaleDateString('id-ID', dateOption.dateForPdf)} ).pdf`);
    }

    const printLaporan = async() => {
        const doPrint = confirm("Print Laporan Pinjaman to PDF ?")
        if (!doPrint) return

        // Call jsPDF
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

         // Initialize jsPDF with F4 paper size
        const doc = new jsPDF({
            orientation: 'landscape', // or 'landscape'
            unit: 'mm',
            format: [210, 330] // F4 size in millimeters
        });

        const _pageWidth = doc.internal.pageSize.getWidth()
        const _margin = {
            left: 15,
            top: 15,
            right: 15,
            bottom: 15,
        }

        // set Text using auto table
        const _setText = (val, style = {}, startY = doc.lastAutoTable?.finalY, maginTop = 10) => {
            return autoTable(doc, {
                margin: { left: _margin.left, right: _margin.right},
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

        // 1. Add page title
        _setText(`LAPORAN LUMBUNG RT 02 DK. GADEN\r\nPERIODE ${dt_periode?.nama_periode}`, 
            {halign: 'center', fontStyle: 'bold'}, 
            10, 0
        )

        // 2. Tgl Tutup Buku
        _setText(`Tanggal Pinjam : ${new Date(dt_periode?.tgl_pinjam).toLocaleDateString('id-ID', dateOption.dateForPdf)}`)
        _setText(`Tanggal Pembayaran : ${new Date(dt_periode?.tgl_bayar).toLocaleDateString('id-ID', dateOption.dateForPdf)}`,
            {}, doc.lastAutoTable.finalY, 0
        )

        // 3. Table Laporan
        const tableHeader = [
            [
                { content: 'NO', styles: { halign: 'center'} },
                { content: 'NAMA', styles: { halign: 'center'} },
                { content: 'P. LAMA', styles: { halign: 'center'}  },
                { content: 'P. BARU', styles: { halign: 'center'} },
                { content: 'POKOK', styles: { halign: 'center'} },
                { content: 'JASA', styles: { halign: 'center'} },
                { content: 'TOTAL', styles: { halign: 'center'} },
                { content: 'BAYAR', styles: { halign: 'center'} },
                { content: 'KET', styles: { halign: 'center'} },
            ]
        ]

        let tableLaporan = []
        if (dt_periode?.data?.length <= 0) {
            tableLaporan = [{ content: 'TIDAK ADA DATA', colSpan:9, styles: { halign: 'center' } }]
        } else {
            tableLaporan = dt_laporan.data.map((res, index) => {
                const p_lama = res?.pinjam_lama ? viewRupiah(res.pinjam_lama) : '-'
                const p_baru = res?.pinjam_baru ? viewRupiah(res.pinjam_baru) : '-'
                const p_total = res?.pinjam_total ? viewRupiah(res.pinjam_total) : '-'
                const jasa = res?.jasa ? viewRupiah(res.jasa) : '-'
                const p_and_j = res?.pinjam_and_jasa ? viewRupiah(res.pinjam_and_jasa) : '-'
                const bayar = res?.jumlah_bayar ? viewRupiah(res.jumlah_bayar) : '-'
                const sisa = res?.pinjam_total 
                    ? res?.sisa_pinjam > 0 ? viewRupiah(-1 * res.sisa_pinjam) : 'LUNAS'
                    : '-'
                
                return [
                    { content: index + 1, styles: { halign: 'center' } },
                    res?.nama,
                    { content: p_lama, styles: { halign: 'right' } },
                    { content: p_baru, styles: { halign: 'right' } },
                    { content: p_total, styles: { halign: 'right' } },
                    { content: jasa, styles: { halign: 'right' } },
                    { content: p_and_j, styles: { halign: 'right' } },
                    { content: bayar, styles: { halign: 'right' } },
                    { content: sisa, styles: { halign: 'right' } },
                ]
            })

            tableLaporan.push([
                { content: "TOTAL", colSpan:2, styles: { halign:'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_lama), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_baru), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_total), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_and_jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.jumlah_bayar), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(-1 * dt_laporan.sum.sisa_pinjam), styles: { halign: 'right', fontStyle: 'bold' } },
            ])
        }

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY,
            margin: { left: _margin.left, right: _margin.right},
            theme: 'grid',
            head: tableHeader,
            body: tableLaporan,
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

        // ** Paraf
        const paraf = [
            [
                { content: '', styles: { halign: 'center'} },
                { content: new Date(dt_periode?.tgl_bayar).toLocaleDateString("id-ID", dateOption.dateForParaf), styles: { halign: 'center'} },
            ],
            [
                { content: '', styles: { halign: 'center'} },
                { content: 'Ketua RT 02 Dk. Gaden', styles: { halign: 'center'} },
            ],
            [
                { content: '\r\n\r\n\r\n\r\n\r\n                                                         ', styles: { halign: 'center'} },
                { content: '\r\n\r\n\r\n\r\n\r\n(                                                       )', styles: { halign: 'center'} },
            ]
        ]
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 5,
            margin: { left: _margin.left, right: _margin.right},
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

        // ** Add a footer with page number (optional)
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
                'Dibuat tanggal ' + new Date().toLocaleDateString('id-ID', dateOption.duadigit), 
                14, 
                doc.internal.pageSize.getHeight() - 10, 
                { align: 'left' }
            );
        }

        // Save the PDF
        doc.save(`Laporan Pinjaman RT 02 ${dt_periode.nama_periode} ( ${new Date().toLocaleDateString('id-ID', dateOption.dateForPdf)} ).pdf`);
    }

    const printDaftarAnggota = async() => {
        const doPrint = confirm("Print Daftar Anggota to PDF ?")
        if (!doPrint) return

        // Call jsPDF
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

         // Initialize jsPDF with F4 paper size
        const doc = new jsPDF({
            orientation: 'potrait', // or 'landscape'
            unit: 'mm',
            format: [210, 330] // F4 size in millimeters
        });

        const _pageWidth = doc.internal.pageSize.getWidth()
        const _margin = {
            left: 20,
            top: 10,
            right: 20,
            bottom: 10,
        }

        // Table Daftar anggota
        const tableHeader = [
            [
                { content: 'NO', styles: { halign: 'center'} },
                { content: 'NAMA', styles: { halign: 'center'} },
            ]
        ]

        let tableLaporan = []
        if (dt_periode?.data?.length <= 0) {
            alert('Tidak ada data.')
            return 
        } else {
            tableLaporan = dt_laporan.data.map((res, index) => {
                
                return [
                    { content: index + 1, styles: { halign: 'center' } },
                    res?.nama,
                ]
            })

            tableLaporan.push([
                { content: "TOTAL", colSpan:2, styles: { halign:'right', fontStyle: 'bold' } },
            ])
        }

        autoTable(doc, {
            startY: 10,
            margin: { left: _margin.left, right: _margin.right, top: 10, bottom: 5},
            theme: 'grid',
            head: tableHeader,
            body: tableLaporan,
            tableWidth: 90,
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
                lineWidth: 0.2,
                minCellHeight: 8,
                cellPadding: { top: 0, bottom: 0, right: 2, left: 2 },
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 13 }
            }
        })

        // Save the PDF
        doc.save(`Laporan Daftar Anggota ${dt_periode.nama_periode} ( ${new Date().toLocaleDateString('id-ID', dateOption.dateForPdf)} ).pdf`);
    }

    const printBukuBesar = async() => {
        const doPrint = confirm("Print Daftar Anggota to PDF ?")
        if (!doPrint) return

        // Call jsPDF
        const { default: jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

         // Initialize jsPDF with F4 paper size
        const doc = new jsPDF({
            orientation: 'potrait', // or 'landscape'
            unit: 'mm',
            format: [210, 330] // F4 size in millimeters
        });

        const _pageWidth = doc.internal.pageSize.getWidth()
        const _margin = {
            left: 10,
            top: 9,
            right: 10,
            bottom: 8,
        }

        // Table Daftar anggota
        const tableHeader = [
            [
                { content: '#', styles: { halign: 'center'} },
                { content: 'POKOK', styles: { halign: 'center'} },
                { content: 'JASA', styles: { halign: 'center'} },
                { content: 'TOTAL', styles: { halign: 'center'} },
                { content: 'BAYAR', styles: { halign: 'center'} },
                { content: 'KET', styles: { halign: 'center'} },
            ]
        ]

        let tableLaporan = []
        if (dt_periode?.data?.length <= 0) {
            alert('Tidak ada data.')
            return 
        } else {
            tableLaporan = dt_laporan.data.map((res, index) => {
                // const p_lama = res?.pinjam_lama ? viewRupiah(res.pinjam_lama) : '-'
                // const p_baru = res?.pinjam_baru ? viewRupiah(res.pinjam_baru) : '-'
                const p_total = res?.pinjam_total ? viewRupiah(res.pinjam_total) : '-'
                const jasa = res?.jasa ? viewRupiah(res.jasa) : '-'
                const p_and_j = res?.pinjam_and_jasa ? viewRupiah(res.pinjam_and_jasa) : '-'
                const bayar = res?.jumlah_bayar ? viewRupiah(res.jumlah_bayar) : '-'
                const sisa = res?.pinjam_total 
                    ? res?.sisa_pinjam > 0 ? viewRupiah(-1 * res.sisa_pinjam) : 'LUNAS'
                    : '-'
                
                return [
                    { content: index + 1, styles: { halign: 'center' } },
                    // res?.nama,
                    // { content: p_lama, styles: { halign: 'right' } },
                    // { content: p_baru, styles: { halign: 'right' } },
                    { content: p_total, styles: { halign: 'right' } },
                    { content: jasa, styles: { halign: 'right' } },
                    { content: p_and_j, styles: { halign: 'right' } },
                    { content: bayar, styles: { halign: 'right' } },
                    { content: sisa, styles: { halign: 'right' } },
                ]
            })

            tableLaporan.push([
                '',
                // { content: viewRupiah(dt_laporan.sum.pinjam_lama), styles: { halign: 'right', fontStyle: 'bold' } },
                // { content: viewRupiah(dt_laporan.sum.pinjam_baru), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_total), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.pinjam_and_jasa), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(dt_laporan.sum.jumlah_bayar), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: viewRupiah(-1 * dt_laporan.sum.sisa_pinjam), styles: { halign: 'right', fontStyle: 'bold' } },
            ])
        }

        autoTable(doc, {
            startY: 10,
            margin: { left: _margin.left, right: _margin.right, top: 10, bottom: 5},
            theme: 'grid',
            head: tableHeader,
            body: tableLaporan,
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
                lineWidth: 0.2,
                minCellHeight: 8,
                cellPadding: { top: 0, bottom: 0, right: 2, left: 2 },
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 13 }
            }
        })

        // Save the PDF
        doc.save(`Laporan Lumbung Buku Besar ${dt_periode.nama_periode} ( ${new Date().toLocaleDateString('id-ID', dateOption.dateForPdf)} ).pdf`);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class='modal-container' transition:fade={{duration: 100}} >
    <div class="modal-backdrop" onclick={() => printPDF.hide()}></div>
    <div class="modal-content">
        <div class='form' >
            <div class="form-header">
                <span class="header-title"> 
                    PRINT to PDF
                </span>
                <button onclick={(e) => printPDF.hide()} type="button" class="close" aria-label="close"> </button>
            </div>

            <div class="form-body">
                <div class="action-button">
                    <button onclick={() => printTagihan()} class="button secondary"> 
                        <span>TAGIHAN PINJ.</span>
                    </button>
        
                    <button onclick={() => printPembayaran()} class="button primary"> 
                        <span>FORM PEMBAYARAN</span>
                    </button>
                </div>

                <div class="action-button">
                    <button onclick={() => printLaporan()} class="button warning"> 
                        <span>LAPORAN PINJAMAN</span>
                    </button>
                </div>

                <span> * Buku Besar * </span>
                <div class="action-button">
                    <button onclick={() => printDaftarAnggota()} class="button secondary"> 
                        <span>Daftar Anggota</span>
                    </button>
        
                    <button class="button primary" onclick={() => printBukuBesar()}> 
                        <span>Laporan Buku Besar</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* variabel */
    :root {
        --form-width: 95vw;
        @media (min-width: 480px) { --form-width: 95vw; }
        @media (min-width: 768px) { --form-width: 50vw; }
        @media (min-width: 1024px) { --form-width: 40vw; }
    }

    /* style */
    .form {
        --bg-color: #FADA7A;
        background-color: var(--bg-color);
        .form-header {
            background-color: color-mix(in srgb, var(--bg-color), white 30%);
        }

        width: var(--form-width);
        /* height: 85%; */
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        overflow: auto;
        position: relative;
        transition: background-color 500ms ease;
        display: flex;
        flex-direction: column;

        .form-header {
            position: sticky;
            top: 0;
            width: 100%;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1;
            
            .close {
                height: 15px;
                width: 15px;
                background-color: #ff5252;
                border-radius: 8px;
                border: none
            }
    
            .header-title { padding: var(--btn-padding); font-size: large; font-weight: 500; }
        }

        .form-body { padding: 1%; flex: 1 0 0; display: flex; flex-direction: column; row-gap: 5px; }

        .action-button {
            display: flex;
            column-gap: 5px;
            > * { flex: 1; }
        }
    }
</style>