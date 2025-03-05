<script>
	import Anggota from "./Anggota.svelte";
	import Periode from "./Periode.svelte";

    let tb = $state('tb_periode')
</script>

<div class="container">
    <div class="row center">
        <div class="col-4 sm:col-4 md:col-2 lg:col-2">
            <select id='tb' class="input query" bind:value={tb} >
                <option value="tb_anggota" > DATA ANGGOTA </option>
                <option value="tb_periode" > DATA PERIODE </option>
            </select>
        </div>
    </div>

    {#if tb === 'tb_periode'}
        <Periode />
    {/if}

    {#if tb === 'tb_anggota'}
        <Anggota />
    {/if}
</div>

<style>
    .center { align-items: center; justify-content: center; }
    .query { text-align: center; }
</style>