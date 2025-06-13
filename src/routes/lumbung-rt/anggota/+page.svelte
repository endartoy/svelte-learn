<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";
    import { getListAnggota, } from "$lib/supabase/tb_anggota"
	import { userSupabaseStore } from "$lib/stores/userStores";

    import TableAnggota from "./TableAnggota.svelte";
	import ModalFormAnggota, { modalForm } from "./ModalFormAnggota.svelte";

    let raw_tb_anggota = $state([])
    let filter_value = $state()
    let tb_anggota = $derived(
        filter_value 
            ? raw_tb_anggota.filter((res) => res.nama.toUpperCase().includes(filter_value.toUpperCase()))
            : raw_tb_anggota
    )

    // Get list anggota
    const getAnggota = () => {
        loadingStore.show()
        getListAnggota()
        .then((data) => raw_tb_anggota = data)
        .catch((error) => {
            alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
        })
        .finally(() => loadingStore.hide())
    }

    // Check is admin or not
    const _isAdmin = $derived(
        ['admin', 'superadmin'].includes($userSupabaseStore?.user?.user_role)
    )

    onMount(() => {
        getAnggota()
    })
</script>

<div style="padding-bottom: 80px;">
    <!--  -->
    <div class="row">
        <div class="col-xs">
            <input type="search" class="filter" bind:value={filter_value} placeholder="Filter Berdasarkan Nama" />
        </div>
        
        {#if _isAdmin}
        <div class="col">
            <button onclick={() => modalForm.show()} class="button secondary">
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
                <span>Anggota</span>
            </button>
        </div>
        {/if}
    </div>

    <div class="row">
        <div class="col-xs-12">
            <TableAnggota tb_anggota={tb_anggota} />
        </div>
    </div>

    <div class="footer">
        <div class="container">
            <div class="row end-xs">
                <div class="col-xs">
                    <span class="periode-info text-end">Jumlah Anggota: {tb_anggota?.length}</span>
                </div>
            </div>
        </div>
    </div>
</div>

{#if modalForm.isVisible && _isAdmin}
<ModalFormAnggota getAnggota={getAnggota} />
{/if}

<style>
    .filter {
        border-radius: 0.25rem;
    }

    .periode-info {
        font-size: larger;
        font-weight:400;
    }
    
    .footer {
        width: 100%;
        background-color: white;
        position: fixed;
        bottom: 0;
        left: 0;
    }
</style>
