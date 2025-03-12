<script>
	// Page data
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

<main>
    {#if isSideBar}
    <div class="modal-container transparent">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={() => openSidebar(false)} class="modal-backdrop"></div>

        <nav transition:fly={{ x: -300, duration: 300 }} > 
            <div class="nav-header">
                <span class="title"> KAS P2G </span>
    
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <ul onclick={() => openSidebar(false)} class="nav-link">
                    <li class:is-active={page.url.pathname === '/kas-p2g'}>
                        <a href="/kas-p2g" > KAS P2G </a>
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
        </nav>
    </div>
    {/if}

    <div class="head">
        <div>
            <button class="button primary bt-sidebar" onclick={(e) => {e.stopPropagation(); openSidebar(true)}} aria-label="side bar" >
                <span><i class="fa-solid fa-bars"></i></span>
            </button>
            <span class="title">
                {_currentPage?.title ? _currentPage.title : 'KAS P2G'}
            </span>
        </div>

        <div>
            <img src="/p2g.png" alt="Avatar" class="logo" />
        </div>
    </div>

    <div class="body">
        {@render children()}
    </div>

    <!-- Loading -->
    {#if $loadingStore > 0}
        <div class='modal-container' transition:fade>
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <h2>Loading</h2>
                <progress class="progress"></progress>
            </div>
        </div>
    {/if}

    <!-- Alert -->
    <ComponentAlert />
</main>

<style>
    main {
        position: relative;
        max-width: 100dvw;
        min-height: 100dvh;

        > .head {
            position: fixed;
            top: 0px;
            width: 100%;
            padding: 5px;
            z-index: 100;
            background-color: rgb(255, 255, 255);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
            border-radius: 5px;
            display: flex;
            column-gap: 6px;
            align-items: center;
            justify-content: space-between;

            .title { font-weight: 500; color: darkblue; padding-left: 1em; }

            .logo { width: 30px; height: 30px; }
        }

        > .body {
            padding-top: 50px;
        }

        nav {
            /* Nav Variabel */
            --nav-bg: #1de9b6;
            --nav-link: color-mix(in srgb, var(--nav-bg) 50%, white 50%);
            --nav-hover: #80cbc4;

            position: fixed;
            top: 1dvh;
            left: 1dvh;
            min-width: 30dvw;
            max-width: 90dvw;
            height: 98dvh;
            background-color: var(--nav-bg);
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
                    font-size: large;
                    font-weight: 800;
                    text-align: center;
                    padding: 1em;
                }

                >.nav-link {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    text-align: left;
                    font-weight: 500;

                    > li {
                        margin: 0px;
                        list-style: none;
                        background-color: var(--nav-link);
                        border-left: 3px solid var(--nav-hover);

                        &.sp-link {
                            background-color: color-mix(in srgb, var(--nav-hover) 10%, white 90%);
                        }

                        a {
                            display:block;
                            padding: 10px;
                            text-decoration: none;
                            color: black;
                        }

                        &:hover, &.is-active {
                            background-color: var(--nav-hover);
                        }
                    }
                }
            }

            > .nav-footer {
                width: 100%;
                padding: 6px;
                background-color: var(--nav-hover);
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
    }
</style>