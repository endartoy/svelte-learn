<script module>
    const initialFormData = {
        id: null,
        nama_periode: null,
        jasa: 0.1,
        tgl_pinjam: new Date().toLocaleDateString('en-CA', dateOption.duadigit),
        tgl_bayar: null,
        ket: null,
        _updated_at: null,
        _delete: null,
        _history: []
    }

    class classModalForm {
        isVisible = $state(false)
        formData = $state(initialFormData)
        setFormData(val = null) { 
            if (val) {
                this.formData = { ...val }
            } else {
                this.formData = initialFormData
            }         
        }
        show(val = null) { this.isVisible = true, this.setFormData(val); disableBodyScroll() }
        hide() { this.isVisible = false, this.setFormData(); disableBodyScroll(false) }
    }
    export let modalForm = new classModalForm
</script>

<script>
    import { fade } from "svelte/transition";
    import { disableBodyScroll, dateOption } from "$lib/tools";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";

    import { addPeriode, updatePeriode, softDelPeriode  } from "$lib/supabase/tb_periode"
	import { goto } from "$app/navigation";

    // init formData
    let formData = modalForm.formData
    let { getPeriode } = $props()

    // add
    const addData = async() => {
        loadingStore.show()
        await addPeriode({...formData}).then((data) => {
            alertStore.show(data)
            getPeriode()
            modalForm.hide()
        })
        .catch((error) => {
            alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
        })
        .finally(() => loadingStore.hide())
    }

    // update
    const updateData = async() => {
        loadingStore.show()
        await updatePeriode({...formData}).then((data) => {
            alertStore.show(data)
            getPeriode()
            modalForm.hide()
        })
        .catch((error) => {
            alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
        })
        .finally(() => loadingStore.hide())
    }

    // save
    const saveData = (e) => {
        e.preventDefault()

        if (formData?.id) {
            // Update
            updateData()
        } else {
            // Add
            addData()
        }
        
    }

    // delete
    const deleteData = async() => {
        const _confirm = confirm("Hapus data ?")
        if (!_confirm) return

        loadingStore.show()
        await softDelPeriode({...formData}).then((data) => {
            goto('/lumbung-rt/periode')
            alertStore.show(data)
            modalForm.hide()
        })
        .catch((error) => {
            alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
        })
        .finally(() => loadingStore.hide())
    }
</script>

<div class='modal-container' transition:fade={{duration: 100}}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={() => modalForm.hide()}></div>
    
    <div class="modal-content">
        <form onsubmit={(e) => {saveData(e)}} class='form' >
            <div class="form-header">
                <span class="header-title"> 
                    Form {formData.id ? 'Update' : 'Tambah'} 
                </span>
                <button onclick={(e) => modalForm.hide()} type="button" class="close" aria-label="close"> </button>
            </div>
    
            <div class="form-body">
                <div class="field">
                  <input type="text" id='nama_periode' bind:value={formData.nama_periode} required  class="input" placeholder="" />
                  <label class="label" for="nama_periode">Periode</label>
                </div>
    
                <div class="field">
                    <input type="number" step="0.01"  id='jasa' bind:value={formData.jasa} required  class="input" placeholder="" />
                    <label class="label" for="jasa">Jasa</label>
                </div>
    
                <div class="field">
                    <input type="date" id='tgl_pinjam' bind:value={formData.tgl_pinjam} required  class="input" placeholder="" />
                    <label class="label" for="tgl_pinjam">Tanggal Pinjam</label>
                </div>
    
                <div class="field">
                    <input type="date" id='tgl_bayar' bind:value={formData.tgl_bayar} class="input" placeholder="" />
                    <label class="label" for="tgl_bayar">Tanggal Pembayaran</label>
                </div>
    
                <div class="field">
                    <textarea id='ket' bind:value={formData.ket} rows='7' ></textarea>
                    <label for="ket" class="label fixed">Keterangan</label>
                </div>
            </div>
      
            <div class="form-footer">
                {#if formData.id}
                <button onclick={() => deleteData()} type="button" class="button danger">
                    <span class="icon"><i class="fa-solid fa-trash-can"></i></span>
                    <span class="icon">HAPUS</span>
                </button>
                {/if}
                
                <button type="submit" class="button primary"> 
                    <span class="icon"><i class="fa-solid fa-floppy-disk"></i></span>
                    <span>{formData.id ? 'SIMPAN' : 'TAMBAH'}</span>
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    /* variabel */
    :root {
        --form-width: 95vw;
        @media (min-width: 480px) { --form-width: 95vw;}
        @media (min-width: 768px) { --form-width: 75vw;}
        @media (min-width: 1024px) { --form-width: 50vw;}
    }

    /* style */
    .form {
        --bg-color: #77B254;
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

        .form-body { padding: 1%; flex: 1 0 0; }
    
        .form-footer {
            position: sticky;
            width: 100%;
            padding: 6px;
            bottom: 0;
            display: flex;
            gap: var(--cel-gap);
            justify-content: end;
        }

        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar */
        }
    }
</style>