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

<div class="container" style="padding-bottom: 80px;">
    <!--  -->
    <div class="row">
        <div class="col-auto">
            <input type="search" class="input" bind:value={filter_value} placeholder="Filter Berdasarkan Nama" />
        </div>
        
        {#if _isAdmin}
        <div class="col-0">
            <button onclick={() => modalForm.show()} class="button secondary">
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
                <span>Anggota</span>
            </button>
        </div>
        {/if}
    </div>

    <div class="row">
        <div class="col-4">
            <TableAnggota tb_anggota={tb_anggota} />
        </div>
    </div>

    <div class="footer">
        <div class="row periode-info">
            <span class="col-auto text-end">Jumlah Anggota: {tb_anggota?.length}</span>
        </div>
    </div>
</div>

{#if modalForm.isVisible && _isAdmin}
<ModalFormAnggota getAnggota={getAnggota} />
{/if}

<style>
    .container {
        width: 100%;
    }
    .periode-info {
        font-size: large;
        font-weight: 300;
    }
    
    .footer {
        width: 100%;
        background-color: white;
        position: fixed;
        bottom: 0;
    }
</style>
