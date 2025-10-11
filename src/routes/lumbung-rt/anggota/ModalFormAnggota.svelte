<script module>
    const initialFormData = {
        id: null,
        nama: null,
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
        show(val = null) { 
            this.isVisible = true
            this.setFormData(val)
            disableBodyScroll()
            
            pushState("", "")
        }
        ___hide() { 
            this.isVisible = false
            this.setFormData()
            disableBodyScroll(false) 
        }
        hide() {
            history.back()
        }
    }
    export let modalForm = new classModalForm
</script>

<script>
    import { fade } from "svelte/transition";
	import { goto, pushState } from "$app/navigation";

    import { disableBodyScroll } from "$lib/tools";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";

	import { addAnggota, updateAnggota, softDelAnggota } from "$lib/supabase/tb_anggota";
	import { onMount } from "svelte";

    // init formData
    let formData = modalForm.formData
    let { getAnggota } = $props()

    // add
    const addData = async() => {
        loadingStore.show()
        await addAnggota({...formData}).then((data) => {
            alertStore.show(data)
            getAnggota()
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
        await updateAnggota({...formData}).then((data) => {
            alertStore.show(data)
            getAnggota()
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
        await softDelAnggota({...formData})
        .then((data) => {
            modalForm.hide()
            alertStore.show(data)
            goto('/lumbung-rt/anggota', {replaceState: true})
        })
        .catch((error) => {
            alertStore.show(error.message ? error.message : 'Error: Terjadi kesalahan server', 'danger')
        })
        .finally(() => loadingStore.hide())
    }

    // Handle popstate event (back/forward button)
    onMount(() => {
        const handlePopState = (event) => {
            // Close modal when back button is pressed
            if (modalForm.isVisible) {
                modalForm.___hide()
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
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="dialog-backdrop" onclick={() => modalForm.hide()}></div>
    
    <div class="dialog-content">
        <form onsubmit={(e) => {saveData(e)}} class='form' >
            <div class="form-header">
                <span class="header-title"> 
                    Form {formData.id ? 'Update' : 'Tambah'} 
                </span>
                <button onclick={(e) => modalForm.hide()} type="button" class="close" aria-label="close"> </button>
            </div>
    
            <div class="form-body">
                <div class="field">
                    <label class="label" for="nama">Nama</label>
                    <input type="text" id='nama' bind:value={formData.nama} required  class="input" placeholder="" />
                </div>
    
                <div class="field">
                    <label for="ket" class="label fixed">Keterangan</label>
                    <textarea id='ket' bind:value={formData.ket} rows='7' ></textarea>
                </div>
            </div>
      
            <div class="form-footer">
                <div class="row between-xs">
                    <div class="col">
                        {#if formData.id}
                        <button onclick={() => deleteData()} type="button" class="button danger">
                            <span>HAPUS</span>
                            <span class="icon"><i class="fa-solid fa-trash-can"></i></span>
                        </button>
                        {/if}
                    </div>

                    <div class="col">
                        <button type="submit" class="button primary"> 
                            <span>{formData.id ? 'SIMPAN' : 'TAMBAH'}</span>
                            <span class="icon"><i class="fa-solid fa-floppy-disk"></i></span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</dialog>

<style>
    /* variabel */
    :root {
        --form-width: 100vw;
        --form-height: 100vh;
        @media (min-width: 480px) { --form-width: 100vw; --form-height: 100vh;}
        @media (min-width: 768px) { --form-width: 75vw; --form-height: 80vh;}
        @media (min-width: 1024px) { --form-width: 50vw; --form-height: 85vh;}
    }

    /* style */
    .form {
        --bg-color: #9DC08B;
        background-color: var(--bg-color);
        .form-header, .form-footer {
            background-color: color-mix(in srgb, var(--bg-color), white 30%);
        }

        width: var(--form-width);
        height: var(--form-height);
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
    
            .header-title { padding: var(--btn-padding); font-size: large; font-weight: 600; }
        }

        .form-body { padding: 1%; flex: 1 0 0; }
    
        .form-footer {
            position: sticky;
            width: 100%;
            padding: 0.5em;
            bottom: 0;
        }

        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar */
        }
    }
</style>