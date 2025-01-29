<script>
	import { fade } from "svelte/transition";

	import { updateUser, deleteUser } from "$lib/firebase";
	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";

    // Get props data
    let { user, getUsers } = $props()

    let formData = $state({
        id: user?.id,
        displayName: user?.displayName,
        email: user?.email,
        role: user?.role ? user?.role : null
    })
    $effect(() => {
        formData = {
            id: user?.id,
            displayName: user?.displayName,
            email: user?.email,
            role: user?.role
        }
    })

    let isEdit = $state(false)
    const toggleEdit = () => {isEdit = !isEdit}

    const toggleUpdate = async() => {
        try {
            loadingStore.show()

            await updateUser(formData, (res, error) => {
                if (res) {
                    toggleEdit()
                    getUsers()
                    alertStore.show(res)
                }
                if (error) throw new Error(error);
                
            })
        } catch (error) {
            alertStore.show(error, 'danger')
        } finally {
            loadingStore.hide()
        }
    }

    const fnDeleteUser = async() => {
        const _confirm = confirm(`Hapus user ${formData?.displayName} ?`)
        if (!_confirm) return
        
        try {
            loadingStore.show()

            await deleteUser(formData, (res, error) => {
                if (res) {
                    alertStore.show(res)
                }
                if (error) throw new Error(error);
            })
        } catch (error) {
            alertStore.show(error, 'danger')
        } finally {
            loadingStore.hide()
        }

        getUsers()
    }
</script>

<div class="user-card {!user?.role ? 'unregistered' : ''}">
    <div class="body">
        <img class="avatar" src={user?.photoURL ? user?.photoURL : '/p2g.png'} alt="user avatar">
        <span class="username"> {user?.displayName || 'Username'} </span>
        <span class="email"> ({user?.email || 'dummyemail@email.com'}) </span>
        <div class="field">
            <input id={user?.id} class="input" disabled={!isEdit} type="text" bind:value={formData.role} placeholder="" />
            <label for={user?.id} class="label" > Role </label>
        </div>
    </div>

    <div class="footer" >
        <button onclick={() => fnDeleteUser()} class="button danger"> HAPUS </button>
        <button onclick={() => {!isEdit ? toggleEdit() : toggleUpdate()}} class="button {!isEdit ? 'warning' : 'primary'}"> {!isEdit ? 'EDIT' : 'SIMPAN'} </button>
    </div>
</div>

<style>
    .user-card {
        min-height: 100px;
        padding: 4%;
        background-color: #64ffda ;

        >.body {
            display: flex;
            flex-direction: column;
            column-gap: 2%;
            align-items: center;

            >.avatar {
                height: 150px;
                width: 150px;
                border-radius: 75px;
                object-fit: cover;
            }

            >.username {
                font-size: larger;
                font-weight: 500;
                text-transform: uppercase;
            }
            >.email {
                font-weight: 200;
                font-style: italic;
            }
        }

        >.footer {
            margin-top: 10px;
            display: flex;
            gap: var(--cel-gap);
            background-color: transparent;

            > * {
                flex: 1;
            }
        }

        &.unregistered {
            background-color: #bdbdbd;
        } 

    }
</style>