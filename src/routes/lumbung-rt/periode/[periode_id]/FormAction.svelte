<script module>
    const initialFormData = {
        // id: null,
        nama: null,
        pinjam_lama: 0,
        pinjam_baru: 0,
        pinjam_total: 0,
        jasa: 0,
        pinjam_and_jasa: 0,

        periode_id: null,
        anggota_id: null, 
        pinjam: 0,
        bayar: 0,
    }

    class classForm {
        isVisible = $state(false)
        formData = $state(initialFormData)
        setFormData(val = null) { 
            if (val) {
                this.formData.nama = val?.nama
                this.formData.pinjam_lama = viewRupiah(val?.pinjam_lama)
                this.formData.pinjam_baru = viewRupiah(val?.pinjam_baru)
                this.formData.pinjam_total = viewRupiah(val?.pinjam_total)
                this.formData.jasa = viewRupiah(val?.jasa)
                this.formData.pinjam_and_jasa = viewRupiah(val?.pinjam_and_jasa)

                this.formData.periode_id = val?.periode_id
                this.formData.anggota_id = val?.anggota_id
                this.formData.pinjam = val?.pinjam_baru ? viewRupiah(val.pinjam_baru) : null
                this.formData.bayar = val?.jumlah_bayar ? viewRupiah(val.jumlah_bayar) : null
            } else {
                this.formData = initialFormData
            }         
        }
        show(val = null) { 
            this.isVisible = true
            this.setFormData(val)
            disableBodyScroll() 
            pushState("", "")
        }
        ___hide() { 
            this.isVisible = false, 
            this.setFormData(); 
            disableBodyScroll(false) 
        }
        hide() {
            history.back()
        }
    }
    export let formAction = new classForm
</script>

<script>
    import { fade, fly } from "svelte/transition";
    import { disableBodyScroll, dateOption, formatRupiah, viewRupiah, formatInterger } from "$lib/tools";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";

    import { addPeriode, updatePeriode, softDelPeriode  } from "$lib/supabase/tb_periode"
	import { goto, pushState } from "$app/navigation";
	import { upsertPinjam } from "$lib/supabase/tb_pinjam";
	import { onMount } from "svelte";

    // init formData
    let formData = formAction.formData
    let { getDataPinjam } = $props()
    let actionPinjam = $state(false)
    let actionBayar = $state(false)

    // save
    const saveData = async(e) => {
        e.preventDefault()
        const dumpFormData = {
            periode_id: formData.periode_id, 
            anggota_id: formData.anggota_id,
            pinjam: formData.pinjam ? formatInterger(formData.pinjam) : 0,
            bayar: formData.bayar ? formatInterger(formData.bayar) : 0
        }

        loadingStore.show()
        await upsertPinjam(dumpFormData)
            .then((data) => {
                getDataPinjam()
                formAction.hide()
                alertStore.show(data)
            })
            .catch((error) => {
                alertStore.show(error.message, 'danger')
            })
            .finally(() => loadingStore.hide())

    }

    // Handle popstate event (back/forward button)
    onMount(() => {
        const handlePopState = (event) => {
            // Close modal when back button is pressed
            if (formAction.isVisible) {
                formAction.___hide()
            }
        };

        // Add popstate event listener
        window.addEventListener('popstate', handlePopState);

        // Cleanup event listener on component destroy
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    });
</script>

<dialog open transition:fade={{duration: 100}}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dialog-backdrop" onclick={() => formAction.hide()}></div>

    <div class="dialog-content" transition:fly={{delay: 100}}>
        <div class='form' >
            <div class="form-header">
                <span class="header-title"> 
                    {formData?.nama} 
                </span>
                <button onclick={(e) => formAction.hide()} type="button" class="close" aria-label="close"> </button>
            </div>
    
            {#if actionPinjam}
            <form onsubmit={(e) => {saveData(e)}}>
                <div class="form-body" transition:fade>
                    <table class="table-info">
                        <tbody>
                            <tr>
                                <th class="text-start" style="width: 120px;">Pinj. Lama</th>
                                <th>:</th>
                                <th class="text-end">{formData?.pinjam_lama}</th>
                            </tr>
                        </tbody>
                    </table>
                    <div class="field">
                        <input type="text" id='pinjam' bind:value={formData.pinjam} onkeyup={(e) => {formatRupiah(e.target); formData.pinjam = e.target.value}} required  class="input" placeholder="" />
                        <label class="label" for="pinjam">Nominal Pinjamam Baru</label>
                    </div>
                </div>
    
                <div class="action-button">
                    <button type="submit" class="button warning"> 
                        <span>SIMPAN</span>
                    </button>
                </div>
            </form>
            {/if}
    
            {#if actionBayar}
            <form onsubmit={(e) => {saveData(e)}}>
                <div class="form-body" transition:fade>
                    <table class="table-info">
                        <tbody>
                            <tr>
                                <th class="text-start" style="width: 120px;">Pinj. Lama</th>
                                <th>:</th>
                                <th class="text-end">{formData?.pinjam_lama}</th>
                            </tr>
                            <tr>
                                <th class="text-start">Pinj. Baru</th>
                                <th>:</th>
                                <th class="text-end">{formData?.pinjam_baru}</th>
                            </tr>
                            <tr>
                                <th class="text-start">Total Pinj.</th>
                                <th>:</th>
                                <th class="text-end">{formData?.pinjam_total}</th>
                            </tr>
                            <tr onclick={() => formData.bayar = formData?.jasa}>
                                <th class="text-start">Jasa</th>
                                <th>:</th>
                                <th class="text-end">{formData?.jasa}</th>
                            </tr>
                            <tr onclick={() => formData.bayar = formData?.pinjam_and_jasa}>
                                <th class="text-start">Pinj. + Jasa</th>
                                <th>:</th>
                                <th class="text-end">{formData?.pinjam_and_jasa}</th>
                            </tr>
                        </tbody>
                    </table>
    
                    <div class="field">
                        <input type="text" id='bayar' bind:value={formData.bayar} onkeyup={(e) => {formatRupiah(e.target); formData.bayar = e.target.value}} required  class="input" placeholder="" />
                        <label class="label" for="bayar">Nominal Bayar</label>
                    </div>
                </div>
                
                <div class="action-button">
                    <button type="submit" class="button warning"> 
                        <span>SIMPAN</span>
                    </button>
                </div>
            </form>
            {/if}
      
            {#if !(actionPinjam || actionBayar)}
            <div class="action-button">
                <button onclick={() => actionPinjam = true} class="button primary"> 
                    <span>PINJAM</span>
                </button>
    
                <button onclick={() => actionBayar = true} disabled={formData.pinjam_total <= 0} class="button secondary"> 
                    <span>BAYAR</span>
                </button>
            </div>
            {/if}
        </div>
    </div>
</dialog>

<style>
    /* variabel */
    :root {
        --form-width: 95vw;
        --form-height: 100vh;
        @media (min-width: 480px) { --form-width: 95vw; --form-height: 100vh }
        @media (min-width: 768px) { --form-width: 75vw; --form-height: 85vh }
        @media (min-width: 1024px) { --form-width: 50vw; --form-height: 80vh }
    }

    /* style */
    .form {
        --bg-color: #FADA7A;
        --cel-gap: 8px;

        background-color: var(--bg-color);
        border-radius: var(--pico-border-radius);
        
        .form-header, .action-button {
            background-color: color-mix(in srgb, var(--bg-color), white 30%);
        }

        width: var(--form-width);
        /* height: var(--form-height); */
        padding: 0.8rem;
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

        .form-body { padding: 1%; flex: 1 0 0; }
    
        .action-button {
            width: 100%;
            padding: 6px;
            display: flex;
            gap: var(--cel-gap);

            * { flex: 1; }
        }

        .table-info {
            width: 100%;
            border-collapse: collapse;

            th { padding: 4px; }
            tr {
                background-color: color-mix(in srgb, var(--bg-color), white 60%);
                &:nth-child(even) {
                    background-color: color-mix(in srgb, var(--bg-color), white 90%);
                }
            }
        }

        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar */
        }
    }

    /* Custom Modal Style */
    @media (max-width: 600px) {
        .form { 
            min-height: calc(100vh - 100vh / 3) !important; 
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }

        dialog {
            display: flex;
            align-items: end;
        }
    }
</style>