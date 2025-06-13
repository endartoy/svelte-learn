<script>
	import Anggota from "./Anggota.svelte";
	import Periode from "./Periode.svelte";

    let tb = $state('tb_periode')
</script>

<div>
    <div class="row center-xs">
        <div class="col-xs-12 col-sm-8 col-md-6">
            <select id='tb' bind:value={tb} >
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