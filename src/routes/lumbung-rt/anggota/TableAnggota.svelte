<script>
	import { fade } from "svelte/transition";
    
    import { modalForm } from "./ModalFormAnggota.svelte";
	import { goto } from "$app/navigation";

	let { tb_anggota } = $props();
</script>

<div class="table-container">
	<span class="table-title">Anggota Lumbung</span>

	<div class="table-body">
		<table>
			<thead>
				<tr>
                    <th style="width: 50px;" >#</th>
					<th>Nama</th>
					<th>Keterangan</th>
                    <th></th>
				</tr>
			</thead>
			<tbody>
				{#each tb_anggota as res, i}
				<tr in:fade>
					<td class="text-center text-bold sm-hide"> {i + 1} </td>
					<td class="nama sm-hide"> {res?.nama} </td>
                    <td class="sm-hide">{res?.ket ? res.ket.replace(/\\n/g, '\n') : '---'}</td>
                    <td data-label={`${i+1}. ${res.nama}`} class="text-center" onclick={() => goto(`./anggota/${res?.id}`)} >
                        <!-- svelte-ignore a11y_invalid_attribute -->
                        <a href="#" aria-label="detail anggota" >
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </td>
				</tr>
                {:else}
                <tr>
					<th class="text-center" colSpan="4"> Tidak ada data </th>
				</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.table-container {
        --color-table: #FADA7A;
        --cel-gap: 8px;

        background-color: color-mix(in srgb, var(--color-table), white 50%);
        border: 2px solid var(--color-table);
        border-radius: var(--pico-border-radius);
        height: 100%;
        padding: var(--cel-gap);
        position: relative;
        overflow-x: auto;

        > .table-title { 
            display: block;
            margin-bottom: var(--cel-gap); 
            font-weight: bold;
        }

        > .table-body {
            > table {
                /* reset table bg color */
                --pico-background-color: transparent !important;

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
                    > th { text-align: center; }
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

        @media (max-width: 600px) {
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
                justify-content: space-between;
                padding: 6px !important;
                border-bottom: 1px solid black !important;

                &.sm-hide { display: none; }
            }

            td::before {
                content: attr(data-label);
                font-weight: 500;
                text-transform: capitalize;
                padding-right: 5px;
            }

            td:last-child {
                border: none !important;
            }
        }
    }
</style>
