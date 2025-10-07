<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	import { alertStore } from "$lib/stores/alertStore";
	import { loadingStore } from "$lib/stores/loadingStore";
    import { userStore } from "$lib/stores/userStores";
	import { getUser } from "$lib/firebase";

	import UserCard from "./UserCard.svelte";

    let _isAllow = $derived($userStore?.role === 'superadmin')

    let users = $state([])
    const getUsers = async() => {
        try {
            loadingStore.show()

            await getUser((res, err) => {
                if (res) {
                    users = res
                }
                if (err) alertStore.show(err, 'danger');
            })
        } catch (error) { 
            alertStore.show(error, 'danger');
        } finally {
            loadingStore.hide()
        }
    }

    onMount(() => {
        getUsers()
    })
</script>

{#if !_isAllow}
<h1 style="text-align: center;"> Akses ditolak </h1>
{:else}
<div class="row">
    {#each users as user}
        <div class="col-12 col-6-md col-4-lg" transition:fade>
            <UserCard user={user} getUsers={getUsers} />
        </div> 
    {/each}
</div>
{/if}

<style>
    [class^="col-"] { margin-bottom: 1rem; }
</style>