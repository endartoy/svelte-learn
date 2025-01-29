<script>
	let { title, type, data, buttonFilter = null } = $props();

	import { viewRupiah, dateOption } from "$lib/tools";
	import { modalForm } from "./ModalForm.svelte";
</script>

<div class="table-container {type}">
	<span class="table-title"> {title.toUpperCase()} </span>

	<div class="table-body">
		<table>
			<thead>
				<tr>
					<th style="width: 30px">#</th>
					<th style="width: 90px">Tanggal</th>
					<th>Keterangan</th>
					<th style="width: 90px">Jumlah</th>
				</tr>
			</thead>
			<tbody>
				{#each data.data as res, i}
				<tr 
					onclick={() => res.id ? modalForm.show(res) : buttonFilter()} 
				>
					<td class="text-center text-bold"> {i+1} </td>
					<td> {res?.tanggal.toLocaleDateString('id-ID', dateOption.duadigit)} </td>
                    <td style="white-space: pre-line;">{res?.ket.replace(/\\n/g, '\n')}</td>
					<td class="text-end"> {viewRupiah(res?.jumlah)} </td>
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
	}

	.table-container {
        --color-table: white;
        background-color: color-mix(in srgb, var(--color-table), white 50%);
        height: 100%;
        padding: var(--cel-gap);
        padding-bottom: 50px;
        position: relative;
        overflow-x: auto;

        > .table-title { 
            display: block;
            padding: var(--cel-gap); 
            font-weight: bold;
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
        
                tbody > tr {
					background-color: color-mix(in srgb, var(--color-table), white 50%);
                    transition: background-color 0.2s ease;
        
                    &:nth-child(even) {
                        background-color: color-mix(in srgb, var(--color-table), white 25%);
                    }
        
                    &:hover {
                        background-color: color-mix(in srgb, var(--color-table), white 70%);
                    }
                }
            }
        }

        > .table-footer {
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
    }
</style>
