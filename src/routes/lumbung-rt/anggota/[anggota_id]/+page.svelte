<script>
	import { page } from "$app/state";
    import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { fade } from "svelte/transition";

    import { dateOption, viewRupiah } from "$lib/tools";
    import { loadingStore } from "$lib/stores/loadingStore";
    import { alertStore } from "$lib/stores/alertStore";
    import { userSupabaseStore } from "$lib/stores/userStores";
	import { getAnggotaById } from "$lib/supabase/tb_anggota";
	import { getSisaPinjamByAnggota } from "$lib/supabase/sisa_pinjam";

    import ModalFormAnggota, { modalForm } from "../ModalFormAnggota.svelte"

    // get param
    let anggota_id = page.params.anggota_id

    // get data pinjam
    let data_pinjam = $state({ data: {} })

    // get data periode
    let data_anggota = $state({...modalForm.formData})    
    const getAnggota = async() => {
        loadingStore.show()
        await getAnggotaById(anggota_id)
            .then(async(data) => {
                data_anggota = data
                
                await getSisaPinjamByAnggota(anggota_id)
                    .then((data) => data_pinjam = data)
                    .catch((error) => alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger'))
            })
            .catch((error) => {
                alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
                goto('/lumbung-rt/anggota', {replaceState: true})
            })
            .finally(() => loadingStore.hide())
    }

    // Check is admin or not
    const _isAdmin = $derived(
        ['admin', 'superadmin'].includes($userSupabaseStore?.user?.user_role)
    )

    onMount(() => {
        if (!anggota_id) {
            goto('/lumbung-rt/anggota', {replaceState: true})
            return
        }

        getAnggota()
    })
</script>

<div>
    <div class="row">
        <div class="col-xs-12">
            <div class="table-container detail">
                <div class="table-title"> 
                    <div>
                        <button class="plain" style="color: blue;" onclick={() => goto('/lumbung-rt/anggota')} aria-label="back" > 
                            <i class="fa-solid fa-arrow-left"></i> 
                        </button>
                        { data_anggota?.nama }
                    </div>

                    {#if _isAdmin}
                    <button aria-label="edit" onclick={() => modalForm.show(data_anggota)} >
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    {/if}
                </div>
            
                <div class="table-body">
                    <table>
                        <tbody>
                            <tr>
                                <td style="width: 120px;">Keterangan</td>
                                <td>{data_anggota?.ket ? data_anggota.ket.replace(/\\n/g, '\n') : '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="table-container list">
                <span class="table-title">Catatan Pinjaman dan Pembayaran</span>
            
                <div class="table-body">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;" >#</th>
                                <th>Periode</th>
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
                            {#each data_pinjam?.data as res, i}
                            <tr in:fade>
                                <td class="text-center text-bold nomor"> {i + 1} </td>
                                <td data-label={`${i + 1}. Periode`} class="nama"> {res.nama_periode} </td>
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
                            {:else}
                            <tr>
                                <th class="error text-center" colSpan="9"> Tidak ada data </th>
                            </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{#if modalForm.isVisible}
<ModalFormAnggota getAnggota={getAnggota} />
{/if}

<style>
	.table-container {
        --color-table: #FADA7A;
        --cel-gap: 8px;

        /* background-color: color-mix(in srgb, var(--color-table), white 50%);
        border: 2px solid var(--color-table);
        border-radius: var(--pico-border-radius); */
        padding: var(--cel-gap);
        position: relative;
        overflow-x: auto;

        > .table-title { 
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--cel-gap);
            font-weight: bold;
        }

        > .table-body {
            > table {   
                /* reset table bg color */
                --pico-background-color: transparent !important;
                font-family:sans-serif;

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
                    th { text-align: center; }
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