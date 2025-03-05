<script>
	let { tb_periode } = $props();
	import { dateOption } from "$lib/tools";
	import { fade } from "svelte/transition";
</script>

<div class="table-container">
	<span class="table-title">Periode Pinjaman</span>

	<div class="table-body">
		<table>
			<thead>
				<tr>
                    <th style="width: 50px;" >#</th>
					<th>Periode</th>
					<th>Jasa</th>
                    <th>Tgl. Pinjam</th>
                    <th>Tgl. Bayar</th>
                    <th></th>
				</tr>
			</thead>
			<tbody>
				{#each tb_periode as res, i}
				<tr in:fade>
					<td class="text-center text-bold"> {i + 1} </td>
					<td> {res?.nama_periode} </td>
                    <td class="text-center"> {res?.jasa} </td>
					<td class="text-center"> 
                        {new Date(res?.tgl_pinjam).toLocaleDateString('id-ID', dateOption.duadigit)} 
                    </td>
					<td class="text-center"> 
                        {res?.tgl_bayar ? new Date(res?.tgl_bayar).toLocaleDateString('id-ID', dateOption.duadigit) : '-'} 
                    </td>
                    <td class="text-center" >
                        <a href="./periode/{res?.id}" aria-label="laporan per periode" >
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </td>
				</tr>
                {:else}
                <tr>
					<th class="text-center" colSpan="6"> Tidak ada data </th>
				</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.table-container {
        --color-table: #B1C29E;

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
