<script>
	import { fade } from "svelte/transition";
    
    import { modalForm } from "./ModalFormAnggota.svelte";

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
					<td class="text-center text-bold"> {i + 1} </td>
					<td> {res?.nama} </td>
                    <td>{res?.ket?.replace(/\\n/g, '\n')}</td>
                    <td class="text-center" >
                        <a href='./anggota/{res?.id}' aria-label="detail anggota" >
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
        --color-table: #9DC08B;

        background-color: color-mix(in srgb, var(--color-table), white 50%);
        height: 100%;
        padding: var(--cel-gap);
        /* padding-bottom: 50px; */
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
    }
</style>
