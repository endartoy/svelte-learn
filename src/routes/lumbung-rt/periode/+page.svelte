<script>
    import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";
    import { userSupabaseStore } from "$lib/stores/userStores";
    import { getListPeriode } from "$lib/supabase/tb_periode"

	import TablePeriode from "./TablePeriode.svelte";
	import ModalFormPeriode, { modalForm } from "./ModalFormPeriode.svelte";

    let raw_tb_periode = $state([])
    let filter_value = $state()
    let tb_periode = $derived(
        filter_value 
            ? raw_tb_periode.filter((res) => res.nama_periode.toUpperCase().includes(filter_value.toUpperCase()))
            : raw_tb_periode
    )

    const getPeriode = () => {
        loadingStore.show()
        getListPeriode()
        .then((data) => raw_tb_periode = data)
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
        getPeriode()
    })
</script>

<div class="container" style="padding-bottom: 80px;">
    <!--  -->
    <div class="row">
        <div class="col-auto">
            <input type="search" class="input" bind:value={filter_value} placeholder="Filter Berdasarkan Tahun" />
        </div>
        
        {#if _isAdmin}
        <div class="col-0">
            <button onclick={() => modalForm.show()} class="button secondary">
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
                <span>PERIODE</span>
            </button>
        </div>
        {/if}
    </div>

    <div class="row">
        <div class="col-4">
            <TablePeriode tb_periode={tb_periode} />
        </div>
    </div>

    <div class="footer">
        <div class="row periode-info">
            <span class="col-auto text-end">Jumlah Periode: {tb_periode?.length}</span>
        </div>
    </div>
</div>

{#if modalForm.isVisible && _isAdmin}
<ModalFormPeriode getPeriode={getPeriode} />
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
