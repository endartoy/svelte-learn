<script>
    let { children } = $props()
    import { page } from "$app/state";
    import { onMount } from "svelte";
	import { fade, fly } from 'svelte/transition';

    // Alert and Loading
    import { alertStore } from "$lib/stores/alertStore.js";
    import { loadingStore } from "$lib/stores/loadingStore.js";
	import { disableBodyScroll } from "$lib/tools";

    // User Auth
    import { authStateListener, fnSignIn, fnSignOut } from "$lib/firebase.js";
    import { userStore } from "$lib/stores/userStores";

    // local import
	import ComponentAlert from "../ComponentAlert.svelte";

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
    
    // SideBar
    let isSideBar = $state(false)
    const openSidebar = (val = true) => {
        isSideBar = val
        disableBodyScroll(val)
    }
</script>

<div>
    {#if isSideBar}
    <dialog open transition:fade>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={() => openSidebar(false)} class="dialog-backdrop"> </div>

        <div id="sidebar" transition:fly={{ x: 300, duration: 300 }} > 
            <div class="nav-header">
                <h3 class="title"> KAS P2G </h3>
    
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <ul onclick={() => openSidebar(false)} class="nav-link">
                    <li class:is-active={page.url.pathname === '/kas-p2g'}>
                        <a href="/kas-p2g" > KAS P2G </a>
                    </li>

                    <li class:is-active={page.url.pathname.split('/').includes('gfc', 2)}>
                        <a href="/kas-p2g/gfc" > KAS GADEN FC </a>
                    </li>
    
                    {#if $userStore?.role === 'superadmin'}
                    <li class="sp-link" class:is-active={page.url.pathname.split('/').includes('manage-user', 2)}>
                        <a href="/kas-p2g/manage-user" > MANAGE USER </a>
                    </li>
                    {/if}
                </ul>
            </div>
            
            <div class="nav-footer">
                <div class="user">
                    <img src={$userStore ? $userStore.photoURL : "/p2g.png"} alt="Avatar" class="avatar" />
    
                    <div class="user-detail">
                        <span class="user-name"> {$userStore ? $userStore.displayName : 'Hello'} </span>
                        <span class="user-email"> {$userStore ? $userStore.email : 'Selamat datang'} </span>
                    </div>
                </div>
    
                <button onclick={() => {openSidebar(false); $userStore ? signOut() : signIn()}} class="button small" aria-label="logout">
                    <span class="icon"><i class="fa-solid fa-right-to-bracket"></i></span>
                </button>
            </div>
        </div>
    </dialog>
    {/if}

    <nav id="nav">
        <div class="container">
            <div class="row">                
                <div class="col-xs" style="display: flex; align-items: center;" >
                    <img src="/p2g.png" alt="Avatar" class="logo" /> 
                    <span class="title">{_currentPage?.title ? _currentPage.title : 'KAS P2G'}</span>
                </div>

                <div class="col">
                    <button class="btn-sidebar" onclick={(e) => {e.stopPropagation(); openSidebar(true)}} aria-label="side bar" >
                        <span><i class="fa-solid fa-bars"></i></span>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <main class="container">
        {@render children()}
    </main>

    <!-- Loading -->
    {#if $loadingStore > 0}
        <dialog open transition:fade>
            <div class="dialog-content">
                <!-- svelte-ignore element_invalid_self_closing_tag -->
                <progress style="max-width: 350px; width: 50vw; height: 25px;" />
            </div>
        </dialog>
    {/if}

    <!-- Alert -->
    <ComponentAlert />
</div>

<style>
    :root,:host {
        --nav-bg: var(--pico-color-jade-800);
    }

    :root:not([data-theme=dark]), :host(:not([data-theme=dark])) {
        --nav-bg: var(--pico-color-jade-300);
    }

    #nav {
        background-color: var(--nav-bg);
        position: sticky;
        top: 0;
        z-index: 1;
        margin-bottom: 10px;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;

        .logo { width: 30px; height: 30px; margin-right: 1rem; }
        .title { font-family: monospace; font-weight: bold; font-size: larger; }
        .btn-sidebar { width: 30px; height: 30px; padding: 0 !important;}
    }

    #sidebar {
        /* Nav Variabel */
        --color: color-mix(in srgb, var(--nav-bg), var(--pico-background-color) 50%);
        --color-outline: var(--nav-bg);

        position: fixed;
        top: 1dvh;
        right: 1dvh;
        min-width: 30dvw;
        max-width: 90dvw;
        height: 98dvh;
        background-color: var(--pico-background-color);
        border-radius: 5px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        row-gap: 1em;
        align-items: center;
        justify-content: space-between;

        > .nav-header {
            width: 100%;
            display: flex;
            flex-direction: column;
            row-gap: 1em;

            >.title {
                text-align: center;
                padding: 0.5em;
            }

            >.nav-link {
                width: 100%;
                margin: 0;
                padding: 0;
                text-align: right;
                font-weight: 500;

                > li {
                    margin: 0px;
                    list-style: none;
                    background-color: var(--color);
                    border-right: 5px solid var(--color-outline);

                    &.sp-link {
                        background-color: color-mix(in srgb, var(--color), white 90%);
                    }

                    a {
                        display:block;
                        padding: 10px;
                        text-decoration: none;
                        color: black;
                    }

                    &.is-active {
                        background-color: var(--color-outline);
                    }

                    &:hover {
                        background-color: color-mix(in srgb, var(--color-outline), white 60%);
                    }
                }
            }
        }

        > .nav-footer {
            width: 100%;
            padding: 6px;
            background-color: var(--color);
            border-radius: 5px;
            display: flex;
            column-gap: 10px;
            align-items: center;
            justify-content: space-between;

            .user {
                display: flex;
                column-gap: 6px;
                align-items: center;
                .avatar { width: 38px; height: 38px; border-radius: 19px; }
                .user-detail {
                    display: flex;
                    flex-direction: column;
                    .user-name { font-weight: 800; }
                    .user-email { font-size: small; font-style: italic; }
                }
            }
        }

    }
</style>