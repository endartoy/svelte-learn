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
        show(val = null) { this.isVisible = true, this.setFormData(val); disableBodyScroll() }
        hide() { this.isVisible = false, this.setFormData(); disableBodyScroll(false) }
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

    // $inspect(formData)
</script>

<dialog open transition:fade={{duration: 100}}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dialog-backdrop" onclick={() => modalForm.hide()}> </div>

    <div class="dialog-content">
        <form onsubmit={(e) => {saveData(e)}} class='kas-form {formData.type}' >
            <div class="form-header">
                <span class="header-title"> 
                    {#if role}
                        Form {formData.id ? 'Update' : 'Tambah'} 
                    {:else}
                        Detail
                    {/if}
                </span>
                <button onclick={(e) => modalForm.hide()} type="button" class="close" aria-label="close"> </button>
            </div>
    
            <div class="form-body">
                <div class="field">
                    <label class="label" for="tanggal">Tanggal</label>  
                    <input id='tanggal' bind:value={formData.tanggal} disabled={!isAllow} required type="date" class="input" placeholder="" />
                </div>
    
                <div class="field">
                    <label for="type" class="label fixed"> Pemasukan / Pengeluaran </label>
                    <select id='type' bind:value={formData.type} disabled={!isAllow} required>
                        <option value='debit'> Pemasukan / Debit </option>
                        <option value='kredit'> Pengeluaran / Kredit </option>
                    </select>
                </div>
                <div class="field">
                    <input id='jumlah' value={formData.jumlah} onkeyup={(e) => {formatRupiah(e.target); formData.jumlah = e.target.value}} disabled={!isAllow} required type="text" class="input" placeholder="Jumlah" />
                    <!-- <label for="jumlah" class="label">Jumlah</label> -->
                </div>
                <div class="field">
                    <textarea id='ket' bind:value={formData.ket} disabled={!isAllow} required rows='7' placeholder="Keterangan" ></textarea>
                    <!-- <label for="ket" class="label fixed">Keterangan</label> -->
                </div>
            </div>

            {#if isAllow}
            <div class="form-footer">
                <div class="row between-xs">
                    <div class="col">
                        {#if formData.id}
                        <button onclick={() => deleteData(formData.id)} type="button" class="danger">
                            <!-- <span>HAPUS</span> -->
                            <span class="icon"><i class="fa-solid fa-trash-can"></i></span>
                        </button>
                        {/if}
                    </div>
                    
                    <div class="col">
                        <button type="submit"> 
                            <span>{formData.id ? 'SIMPAN' : 'TAMBAH'}</span>
                        </button>
                    </div>
                </div>
            </div>
            {/if}
        </form>
    </div>
</dialog>

<style>
    /* variabel */
    :root {
        --kas-form-width: 95vw;
        @media (min-width: 480px) { --kas-form-width: 95vw; }
        @media (min-width: 768px) { --kas-form-width: 75vw; }
        @media (min-width: 1024px) { --kas-form-width: 50vw; }
    }

    /* style */
    .kas-form {
        --debit: #a5d6a7;
        --kredit: #ffe082;

        font-family: monospace;

        width: var(--kas-form-width);
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
    
            .header-title { padding: var(--btn-padding); font-size: larger; font-weight: 500; }
        }

        .form-body { padding: 1%; flex: 1 0 0; }
    
        .form-footer {
            position: sticky;
            width: 100%;
            padding: 6px;
            bottom: 0;
        }
    
        &.debit {
            background-color: var(--debit);
            .form-header, .form-footer {
                background-color: color-mix(in srgb, var(--debit), white 30%);
            }
        }
        
        &.kredit {
            background-color: var(--kredit);
            .form-header, .form-footer {
                background-color: color-mix(in srgb, var(--kredit), white 30%);
            }
        }

        -ms-overflow-style: none; /* IE 10+ */
        scrollbar-width: none; /* Firefox */
        &::-webkit-scrollbar {
            display: none; /* Hide scrollbar */
        }
    }
</style>