<script module>
    const initialFormData = {
        id: null,
        tanggal: new Date().toLocaleDateString('en-CA'),
        type: 'debit',
        ket: '',
        jumlah: ''
    }

    class classModalForm {
        isVisible = $state(false)
        formData = $state(initialFormData)
        setFormData(val = null) { 
            if (val) {
                this.formData = { ...val, 
                    tanggal: val.tanggal.toLocaleDateString('en-CA'),
                    jumlah: viewRupiah(val.jumlah)
                }
            } else {
                this.formData = initialFormData
            }         
        }
        show(val = null)  { 
            this.isVisible = true 
            this.setFormData(val) 
            disableBodyScroll()
            // Push a new state to the history to allow back button detection
            pushState("")
        }
        ___hide() { 
            this.isVisible = false 
            this.setFormData() 
            disableBodyScroll(false);
        }
        hide() {
            history.back()
        }
    }
    export let modalForm = new classModalForm
</script>

<script>
    let { role } = $props()
    const isAllow = ['superadmin', 'admin'].includes(role)

    import { fade } from "svelte/transition";
    import { disableBodyScroll, viewRupiah, formatRupiah } from "$lib/tools";
	import { addKas, updateKas, deleteKas } from "$lib/firebase";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";
	import { onMount } from "svelte";
	import { pushState } from "$app/navigation";
	import { page } from "$app/state";

    let formData = modalForm.formData

    // do after crud
    const _do = (res = null, error = null) => {
        if (error) {
            throw new Error(error);
        }
        if (res) {
            alertStore.show(res)
            modalForm.hide()
        }
    }

    // save
    const saveData = async(e) => {
        e.preventDefault()

        try {
            loadingStore.show()
            let data = { ...formData }

            if (formData?.id) {
                await updateKas(data, (res, error) => {
                    _do(res, error)
                })
            } else {
                await addKas(data, (res, error) => {
                    _do(res, error)
                })
            }
        } catch (error) {
            alertStore.show(error, 'danger')
        } finally {
            loadingStore.hide()
        }
    }

    // delete
    const deleteData = async(id) => {
        const _confirm = confirm("Hapus data ?")
        if (!_confirm) return

        try {
            loadingStore.show()
            await deleteKas(id, (res, error) => {
                _do(res, error)
            })
        } catch (error) {
            alertStore.show(error, 'danger')
        } finally {
            loadingStore.hide()
        }
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

    // $inspect(formData)
</script>

<dialog open transition:fade={{duration: 100}}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="backdrop" onclick={() => modalForm.hide()}> </div>
    
    <div class="content">
        <form onsubmit={(e) => {saveData(e)}} class='kas-form {formData.type}' >
            <fieldset>
                <legend>
                    <span class="title">
                        {#if role}
                            Form {formData.id ? 'Update' : 'Tambah'} 
                        {:else}
                            Detail
                        {/if}
                    </span>

                    <button onclick={(e) => modalForm.hide()} type="button" class="close" aria-label="close"> </button>
                </legend>

                <div>
                    <p>
                        <!-- <label class="label" for="tanggal">Tanggal</label>   -->
                        <input id='tanggal' bind:value={formData.tanggal} disabled={!isAllow} required type="date" class="input" placeholder="" />
                    </p>
                    <p class="field">
                        <!-- <label for="type" class="label fixed"> Pemasukan / Pengeluaran </label> -->
                        <select id='type' bind:value={formData.type} disabled={!isAllow} required>
                            <option value='debit'> Pemasukan / Debit </option>
                            <option value='kredit'> Pengeluaran / Kredit </option>
                        </select>
                    </p>
                    <p class="field">
                        <input id='jumlah' value={formData.jumlah} onkeyup={(e) => {formatRupiah(e.target); formData.jumlah = e.target.value}} disabled={!isAllow} required type="text" class="input" placeholder="Jumlah" />
                        <!-- <label for="jumlah" class="label">Jumlah</label> -->
                    </p>
                    <p class="field">
                        <textarea id='ket' bind:value={formData.ket} disabled={!isAllow} required rows='7' placeholder="Keterangan" ></textarea>
                        <!-- <label for="ket" class="label fixed">Keterangan</label> -->
                    </p>
                </div>

                {#if isAllow}
                    <div class="form-footer">
                        {#if formData.id}
                            <button onclick={() => deleteData(formData.id)} type="button" class="button error icon-only" aria-label="hapus">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        {/if}

                        <button type="submit"> 
                            <span>{formData?.id ? 'SIMPAN' : 'TAMBAH'}</span>
                        </button>
                    </div>
                {/if}
            </fieldset>
        </form>
    </div>
</dialog>

<style>
    /* variabel */
    :root {
        --kas-form-width: 100vw;
        --kas-form-height: 100vh;

        @media (min-width: 480px) { --kas-form-width: 95vw; --kas-form-height: 95vh;}
        @media (min-width: 768px) { --kas-form-width: 75vw; --kas-form-height: 85vh;}
        @media (min-width: 1024px) { --kas-form-width: 50vw; --kas-form-height: 80vh;}
    }

    /* .content {
        bottom: 0;
        transform: translate(-50%, 0);
    } */

    /* style */
    .kas-form {
        --debit: #a5d6a7;
        --kredit: #ffe082;

        width: var(--kas-form-width);
        height: var(--kas-form-height);
        padding: 1rem;
        font-family: monospace;

        overflow: scroll;
        transition: background-color 500ms ease;

        fieldset {
            height: 100%;
            position: relative;
            padding-bottom: 50px;
        }

        /* header */
        fieldset > legend {
            width: 100%;
            background-color: transparent;
            display: inline-flex;
            justify-content: space-between;
            align-items: center;

            .title {
                font-size: 20px;
                font-weight: bold;
            }

            .close {
                height: 20px;
                width: 20px;
                padding: 0;
                background-color: #ff5252;
                border-radius: 8px;
                border: none
            }
        }    
    
        /* Footer */
        fieldset > .form-footer {
            position: absolute;
            width: 100%;
            bottom: 0;
            left: 0;
            padding: 1rem 2rem;

            display: inline-flex;
            justify-content: end;
            gap: 10px;
        }
    
        &.debit {
            background-color: var(--debit);
        }
        
        &.kredit {
            background-color: var(--kredit);
        }

        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar */
        }
    }
</style>
