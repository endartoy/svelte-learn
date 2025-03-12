<script>
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";
	import { getAllListAnggota, hardDelAnggota, restoreDelAnggota } from "$lib/supabase/tb_anggota";
	import { dateOption, disableBodyScroll } from "$lib/tools";
	
    import { onMount } from "svelte";
	import { fade} from "svelte/transition";

    let query = $state('')
    let rawData = $state([])
    let tb_anggota = $derived(
        rawData.filter((res) => res.nama.toUpperCase().includes(query.toUpperCase()))
    )
    const getData = () => {
        loadingStore.show()
        getAllListAnggota()
            .then(data => rawData = data)
            .catch(error => alertStore.show(error.message, 'danger'))
            .finally(() => loadingStore.hide())
    }

    let selected_id = $state(null)
    let selected_data = $derived(
        rawData.find((res) => res.id === selected_id)
    )

    // restore data
    const restoreData = () => {
        const _do = confirm(`Restore data ${selected_data.nama} ?`)
        if (!_do) return

        loadingStore.show()
        restoreDelAnggota(selected_data)
            .then((data) => {
                alertStore.show(data)
                selected_id = null
                getData()
            })
            .catch((error) => alertStore.show(error?.message, 'danger'))
            .finally(() => loadingStore.hide()) 
    }

    // hard delete data
    const deleteData = () => {
        const _do = confirm(`Hapus permanen data ${selected_data.nama} ?`)
        if (!_do) return

        loadingStore.show()
        hardDelAnggota(selected_data)
            .then((data) => {
                alertStore.show(data)
                selected_id = null
                getData()
            })
            .catch((error) => alertStore.show(error?.message, 'danger'))
            .finally(() => loadingStore.hide()) 
    }

    onMount(() => {
        getData()
    })
</script>

<div class="row">
    <div class="col-4">
        <div class="table-container" in:fade >
            <div class="table-filter">
                <input type="search" class="input" bind:value={query} placeholder="Pencarian..." />
            </div>

            <div class="table-body">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;" >#</th>
                            <th style="width: 50px;" >ID</th>
                            <th>Nama</th>
                            <th>_delete</th>
                            <th>_updated_at</th>
                        </tr>
                    </thead>
                    <tbody in:fade>
                        {#each tb_anggota as res, i}
                        <tr onclick={() => {selected_id = res.id; disableBodyScroll()}} class:is-delete={res._delete}>
                            <td class="text-center text-bold"> {i + 1} </td>
                            <td class="text-center text-bold"> {res.id} </td>
                            <td>{res.nama} </td>
                            <td>
                                { res._delete 
                                    ? new Date(res._delete).toLocaleDateString('id-ID', dateOption.duadigit)
                                    : '-' }
                            </td>
                            <td>{new Date(res._updated_at).toLocaleDateString('id-ID', dateOption.duadigit)}</td>
                        </tr>
                        {:else}
                        <tr>
                            <th class="text-center" colSpan="5"> Tidak ada data </th>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{#if selected_id}
<div class="modal-container" transition:fade={{duration: 100}}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={() => {selected_id = null; disableBodyScroll(false)}} class="modal-backdrop"></div>
    <div class="modal-content">
        <div class="form">
            <div class="form-header">
                <span class="header-title"> 
                    { selected_data.id } - { selected_data.nama } 
                </span>
                <button onclick={() => {selected_id = null; disableBodyScroll(false)}} type="button" class="close" aria-label="close"> </button>
            </div>

            <div class="form-body">
                <span class="title-history"> Riwayat Data </span>
                <div class="table-container">
                    <div class="table-body">
                        <table>
                            <tbody in:fade>
                                {#each selected_data._history as res }
                                <tr style="text-align: left;">
                                    <th>{res.action}</th> 
                                    <td>
                                        <pre>{JSON.stringify(res.data, null, 2)}</pre>
                                    </td>
                                </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="form-footer">
            {#if selected_data._delete}
                <button onclick={() => restoreData()} type="submit" class="button warning"> 
                    <span>RESTORE DATA</span>
                    <span class="icon"><i class="fa-solid fa-floppy-disk"></i></span>
                </button>

                <button onclick={() => deleteData()} type="button" class="button danger">
                    <span>HAPUS PERMANEN</span>
                    <span class="icon"><i class="fa-solid fa-trash-can"></i></span>
                </button>
            {:else}
                <button href={`/lumbung-rt/anggota/${selected_data.id}`} class="button primary">
                    <span>Edit Data</span> 
                    <span class="icon"><i class="fa-solid fa-arrow-right"></i></span>
                </button>
            {/if}
            </div>
        </div>
    </div>
</div>
{/if}

<style>
	.table-container {
        --color-table: #9DC08B;

        background-color: color-mix(in srgb, var(--color-table), white 50%);
        padding: var(--cel-gap);
        /* padding-bottom: 50px; */
        position: relative;
        overflow-x: auto;

        > .table-filter { 
            margin-bottom: 20px;         
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

                    &.is-delete {
                        font-weight: 500;
                        color: #ff5252;
                    }
                }
            }
        }
    }

    /* variabel */
    :root {
        --form-width: 95vw;
        @media (min-width: 480px) { --form-width: 95vw; }
        @media (min-width: 768px) { --form-width: 75vw; }
        @media (min-width: 1024px) { --form-width: 50vw; }
    }

    /* style */
    .form {
        --bg-color: whitesmoke;
        background-color: var(--bg-color);
        .form-header, .form-footer {
            background-color: color-mix(in srgb, var(--bg-color), white 30%);
        }

        width: var(--form-width);
        height: 85vh;
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

        .form-body { 
            padding: 10px; 
            flex: 1 0 0;

            .title-history { font-weight: 500; font-size: large; }
        }
    
        .form-footer {
            position: sticky;
            width: 100%;
            padding: 6px;
            bottom: 0;
            display: flex;
            gap: var(--cel-gap);
            > button { flex: 1; }
        }

        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar */
        }
    }

</style>