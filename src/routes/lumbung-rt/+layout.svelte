<script>
	// Page data
    let { children } = $props()
	import { page } from "$app/state";
    import { onMount } from "svelte";

    // Alert and Loading
    import { alertStore } from "$lib/stores/alertStore.js";
    import { loadingStore } from "$lib/stores/loadingStore.js";
	import { fade, fly } from 'svelte/transition';

    // User Auth
    import { supabase } from "$lib/supabase/supabaseClient";
    import { supabaseSignOut, getUserRole } from "$lib/supabase/supabaseAuth";
    import { userSupabaseStore } from "$lib/stores/userStores";

    // local import
    import ComponentLogin, { isShowLogin, showLogin } from "./ComponentLogin.svelte";
	import { disableBodyScroll } from "$lib/tools";
	import ComponentAlert from "../ComponentAlert.svelte";

    const signOutSupabase = () => {
        const _confirm = confirm('Keluar dari aplikasi ?')
        if (!_confirm) return

        loadingStore.show()
        supabaseSignOut()
            .then(() => {
                userSupabaseStore.set(null)
            })
            .catch((error) => {
                alertStore.show(error.message, 'danger')
            })
            .finally(() => loadingStore.hide())
    }

    const getAuthChange = () => {
        const { data : { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'INITIAL_SESSION') {
                if (session?.user) {
                    getUserRole(session.user.id)
                        .then((data) => {
                            let user = { 
                                ...session.user,  
                                user_role: data?.role
                            }

                            userSupabaseStore.set({ ...session, user });
                            alertStore.show('Selamat datang.')
                        })
                }
            }
        })

        return () => subscription?.unsubscribe()
    }

    onMount(() => {
        const params = new URLSearchParams(page.url.hash.replace('#', ''))
        if (params.get('error')) {
            alertStore.show(`Error: ${params.get('error_description')}`, 'danger')
        }

        let unsubscribe
        unsubscribe = getAuthChange()

        return () => {
            if (unsubscribe) unsubscribe(); 
        };
    })

    const _userLink = [
        {
            title: 'LUMBUNG RT',
            url: '/lumbung-rt',
        },
        {
            title: 'ANGGOTA',
            url: '/lumbung-rt/anggota',
        },
        {
            title: 'PERIODE',
            url: '/lumbung-rt/periode',
        },
        {
            title: 'RIWAYAT DATA',
            url: '/lumbung-rt/riwayat',
        }
    ]

    let _currentPage = $derived(_userLink.find(val => val.url === `/lumbung-rt/${page.url.pathname.split('/')[2]}`))
    
    let isSideBar = $state(false)
    const openSidebar = (val = true) => {
        isSideBar = val
        disableBodyScroll(val)
    }
</script>

<main>
    {#if isSideBar}
    <dialog open transition:fade>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={() => openSidebar(false)} class="dialog-backdrop"> </div>

        <div id="sidebar" transition:fly={{ x: 300, duration: 300 }} > 
            <div class="nav-header">
                <span class="title"> LUMBUNG RT </span>

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <ul onclick={() => openSidebar(false)} class="nav-link">
                    <li class:is-active={page.url.pathname.split('/').includes('anggota', 2)}>
                        <a href="/lumbung-rt/anggota" > ANGGOTA </a>
                    </li>
                    <li class:is-active={page.url.pathname.split('/').includes('periode', 2)}>
                        <a href="/lumbung-rt/periode" > PERIODE </a>
                    </li>
                    
                    {#if $userSupabaseStore?.user?.user_role === 'superadmin'}
                    <li class="sp-link" class:is-active={page.url.pathname.split('/').includes('riwayat')}> 
                        <a href="/lumbung-rt/riwayat" > RIWAYAT DATA </a>
                    </li>
                    {/if}
                </ul>
            </div>
            
            <div class="nav-footer">
                <div class="user">
                    <img src="/p2g.png" alt="Avatar" class="avatar" />

                    <div class="user-detail">
                        <span class="user-name"> {$userSupabaseStore?.user ? $userSupabaseStore.user.user_role : 'Hello'} </span>
                        <span class="user-email"> {$userSupabaseStore?.user ? $userSupabaseStore.user.email : 'Selamat datang'} </span>
                    </div>
                </div>

                <button onclick={() => { openSidebar(false); $userSupabaseStore?.user ? signOutSupabase() : showLogin()}} class="button small" aria-label="logout">
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
                    <span class="title">{_currentPage?.title ? _currentPage.title : 'LUMBUNG RT'}</span>
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

    <!-- Login form -->
    {#if $isShowLogin}
    <ComponentLogin />
    {/if}

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
</main>

<style>
    :root,:host {
        --nav-bg: var(--pico-color-pumpkin-250);
    }

    :root:not([data-theme=dark]), :host(:not([data-theme=dark])) {
        --nav-bg: var(--pico-color-pumpkin-250);
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
        --color: color-mix(in srgb, var(--nav-bg), var(--pico-background-color) 90%);
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