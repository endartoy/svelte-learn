<script>
	let { title, type, data, buttonFilter = null } = $props();

	import { viewRupiah, dateOption } from "$lib/tools";
	import { fade } from "svelte/transition";
	import { modalForm } from "./ModalForm.svelte";
</script>

<div class="table-container {type}">
	<span class="table-title"> {title.toUpperCase()} </span>

	<div class="table-body">
		<table>
			<thead>
				<tr>
					<th class="text-center" style="width: 30px">#</th>
					<th class="text-center" style="width: 90px">Tanggal</th>
					<th>Keterangan</th>
					<th class="text-center" style="width: 90px">Jumlah</th>
				</tr>
			</thead>
			<tbody>
				{#each data.data as res, i}
				<tr transition:fade
					onclick={() => res.id ? modalForm.show(res) : buttonFilter()} 
				>
					<td class="text-center text-bold nomor"> {i+1} </td>
					<td class="lg-tgl" > {res?.tanggal.toLocaleDateString('id-ID', dateOption.duadigit)} </td>
					<td data-label={`${i + 1}. `} class="sm-tgl" > {res?.tanggal.toLocaleDateString('id-ID', dateOption.dateForKasList)} </td>
                    <td class="ket" style="white-space: pre-line;">{res?.ket.replace(/\\n/g, '\n')}</td>
					<td class="text-end jumlah"> {viewRupiah(res?.jumlah)} </td>
				</tr>
                {:else}
                <tr>
					<th class="text-center" colSpan="4"> Tidak ada data </th>
				</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="table-footer">
		<span>TOTAL</span>
		<span> {viewRupiah(data.jumlah)} </span>
	</div>
</div>

<style>
	:root {
		--debit: #a5d6a7;
        --kredit: #ffe082;

        --cel-gap: 8px;
	}

	.table-container {
        --color-table: white;
        background-color: color-mix(in srgb, var(--color-table), white 50%);
        height: 100%;
        padding: var(--cel-gap);
        padding-bottom: 50px;
        position: relative;
        width: 100%;
        overflow-x: auto;

        > .table-title { 
            display: block;
            padding: var(--cel-gap); 
            font-weight: bold;
        }

        > .table-body {
            > table {
                /* reset table bg color */
                --pico-background-color: transparent !important;

                font-family: monospace;
                font-size: 13pt;

                width: 100%;
                border: 1px solid black;
                border-collapse: collapse;
                th, td {
                    padding: 2px;
                    vertical-align: text-top;
                    border: 1px solid black;

                    &.sm-tgl { display: none; }
                }
    
                thead > tr {
                    background-color: var(--color-table) !important;
                }
        
                tbody > tr {
					background-color: color-mix(in srgb, var(--color-table), white 80%);
                    transition: background-color 0.2s ease;

                    &:nth-child(even) {
                        background-color: color-mix(in srgb, var(--color-table), white 45%);
                    }
        
                    &:hover {
                        background-color: var(--color-table);
                    }
                }
            }
        }

        > .table-footer {
            font-family: monospace;
            font-size: 13pt;

            width: calc(100% - 2 * var(--cel-gap));
            padding: var(--cel-gap); 
            display: flex;
            justify-content:space-between;

            position: absolute;
            bottom: 0;

            > span { font-weight: bold; font-size: large; }
        }
        
        &.debit {
            --color-table: var(--debit);
        }

        &.kredit {
            --color-table: var(--kredit);
        }

        container-type: inline-size; /* Makes it responsive to width */
        
        @container (max-width: 500px) {
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

            td {
                display: flex;
                padding: 6px !important;
                border-bottom: 1px solid black !important;

                &.nomor, &.lg-tgl { display: none; }
                &.sm-tgl {
                    display: flex !important; 
                    justify-content: space-between; 
                    font-weight: bold;
                    text-transform: capitalize;
                }
                &.jumlah { justify-content: end; font-weight: 500; }
            }

            td::before, th::before {
                content: attr(data-label);
                font-weight: bold;
                text-transform: capitalize;
                padding-right: 5px;
            }

            td:last-child {
                border: none !important;
            }
        }
    }
</style>
