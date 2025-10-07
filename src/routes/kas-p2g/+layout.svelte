<script>
    let { children } = $props()

    // css file
    // import '$lib/css/chota.css';

    // component alert
    import ComponentAlert from "./ComponentAlert.svelte";

    import { page } from "$app/state";

    import { onMount } from "svelte";
	import { fade, fly } from 'svelte/transition';

    // Alert and Loading
    import { alertStore } from "$lib/stores/alertStore.js";
    import { loadingStore } from "$lib/stores/loadingStore.js";

    // User Auth
    import { authStateListener, fnSignIn, fnSignOut } from "$lib/firebase.js";
    import { userStore } from "$lib/stores/userStores";

        const signIn = async() => {
        loadingStore.show()
        await fnSignIn()
        .catch((error) => { alertStore.show(`${error?.code} : ${error?.message}`, 'danger') })
        .finally(() => { loadingStore.hide() })
    }

    const signOut = async() => {
        loadingStore.show()
        await fnSignOut()
        .then(() => {userStore.set()})
        .catch(error => alertStore.show(`${error?.code} : ${error?.message}`, 'danger'))
        .finally(() => loadingStore.hide() )
    }

    const getUserLogin = () => {
        let unSubscribe
        try {
            loadingStore.show()
            unSubscribe = authStateListener((userLogin) => {
                alertStore.show(`Selamat datang ${userLogin.displayName}`)
                userStore.set(userLogin)
            })
            .catch((error) => { alertStore.show(error, 'alert') })
            .finally(() => loadingStore.hide())    
        } catch (error) {
            alertStore.show(error, 'alert')
        }

        return() => unSubscribe()
    }

    onMount(() => {
        getUserLogin()
    })


    let dropdownMenu = $state(null)
    
    const _userLink = [
        {
            title: 'KAS P2G',
            url: '/kas-p2g',
            class: ''
        },
        {
            title: 'KAS GADEN FC',
            url: '/kas-p2g/gfc',
            class: ''
        },
        {
            title: 'USER MANAGEMEN',
            url: '/kas-p2g/manage-user',
            class: 'sp-link'
        },
    ]

    let _currentPage = $derived(_userLink.find(val => val.url === page.url.pathname))
</script>

<svelte:head>
    <title> .rndm </title>

    <!-- style chota.css -->
    <link rel="stylesheet" href="/style/chota.css">
</svelte:head>

<nav class="nav bg-light">
    <div class="nav-left">
        <img class="logo" src="/p2g.png" alt="Avatar" />
        <!-- <a class="brand" href="/kas-p2g">HxH</a> -->
        <div class="tabs">
            <a class:active={page.url.pathname === '/kas-p2g'} href="/kas-p2g">KAS P2G</a>
            <a class:active={page.url.pathname.split('/').includes('gfc', 2)} href="/kas-p2g/gfc">KAS GADEN FC</a>

            {#if $userStore?.role === 'superadmin'}
            <a class:active={page.url.pathname.split('/').includes('manage-user', 2)} href="/kas-p2g/manage-user" >MANAGE USER</a>
            {/if}

            <details class="dropdown" bind:this={dropdownMenu}>
                <summary>
                    <!-- svelte-ignore a11y_missing_attribute -->
                    <a> {_currentPage.title} </a>
                </summary>

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class=card onclick={() => { dropdownMenu.removeAttribute("open") } }>
                    <p><a href="/kas-p2g">KAS P2G</a></p>
                    <p><a href="/kas-p2g/gfc">KAS GADEN FC</a></p>
                    
                    {#if $userStore?.role === 'superadmin'}
                    <hr/>
                    <p><a href="/kas-p2g/manage-user" class="text-primary" >MANAGE USER</a></p>
                    {/if}
                </div>
            </details>
        </div>
    </div>

    <div class="nav-right">
        {#if $userStore}
            <details class="dropdown" >
                <summary class="button outline primary icon-only">
                    <img src={$userStore ? $userStore.photoURL : "/p2g.png"} alt="Avatar" class="avatar" />
                </summary>

                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class=card>
                    <p>{$userStore.displayName}</p>
                    <hr/>
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_missing_attribute -->
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <p><a href="" onclick={() => {signOut()}} class="text-primary" > LOGOUT </a></p>
                </div>
            </details>
        {:else}
            <button onclick={() => {signIn()}} class="button outline primary icon-only" aria-label="logout" >
                <i class="fa-solid fa-right-to-bracket"></i>
            </button>
        {/if}
    </div>
</nav>

<main id="top" >
    {@render children()}
</main>

{#if $loadingStore > 0}
<dialog open>
    <div class="backdrop">
         
    </div>

    <div class="content">
        <progress class="loading"></progress>
    </div>
</dialog>
{/if}

<!-- Alert -->
<ComponentAlert />

<style>    
    /* NAV */
    nav {
        position: fixed;
        top: 0;
        z-index: 10;
        width: 100%;
        padding-inline: 5dvw;
    }
    nav .logo {
        max-height: none;
        height: 50px;
        width: 50px;
        padding: 6px;
    }
    nav > .nav-left,
    nav > .nav-right {
        align-items: center;
    }
    nav > .nav-right {
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: auto;
        width: auto;

        summary.button {
            max-height: 50px;
            padding: 0;
            align-items: center;
            display: flex;
            border-radius: 40px;
        }

        summary > .avatar {
            width: 40px;
            height: 40px;
            border-radius: 40px;
        }

        details.dropdown > :last-child {
            position: absolute;
            right: 0;
            left: auto;
            margin-top: 5px;
            white-space: nowrap;
        }
    }
    @media (min-width: 800px) {
        nav .tabs details { display: none; }  
    }
    @media (max-width: 800px) {
        nav .tabs > a { display: none; }
    }

    /* MAIN */
    main {
        padding-top: 60px;
        padding-inline: 5dvw;
    }

    /* loading */
    .loading {
        width: 80vw;
        height: 60px;
    }
</style>