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
	import ComponentAlert from "./ComponentAlert.svelte";
    import ComponentLogin, { isShowLogin, showLogin } from "./ComponentLogin.svelte";

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

    let _currentPage = $derived(_userLink.find(val => val.url === page.url.pathname))
    
    let isSideBar = $state(false)
    // svelte-ignore non_reactive_update
    let navElement
    let fnMainClick = (event) => {
        if (navElement && !navElement.contains(event.target)) {
            isSideBar = false
        }
    }

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main onclick={fnMainClick}>
    {#if isSideBar}
    <nav bind:this={navElement} class="side-bar" transition:fly={{ x: -300, duration: 300 }} > 
        <div class="nav-header">
            <span class="title"> LUMBUNG RT </span>

            <ul onclick={() => isSideBar = false} class="nav-link">
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

            <button onclick={() => {isSideBar = false; $userSupabaseStore?.user ? signOutSupabase() : showLogin()}} class="button small" aria-label="logout">
                <span class="icon"><i class="fa-solid fa-right-to-bracket"></i></span>
            </button>
        </div>
    </nav>
    {/if}

    <div class="head">
        <div>
            <button class="button primary bt-sidebar" onclick={(e) => {e.stopPropagation(); isSideBar = !isSideBar}} aria-label="side bar" >
                <span><i class="fa-solid fa-bars"></i></span>
            </button>
            <span class="title">
                LUMBUNG RT
            </span>
        </div>

        <div>
            <img src="/p2g.png" alt="Avatar" class="logo" />
        </div>
    </div>

    <div class="body">
        {@render children()}
    </div>

    <!-- Login form -->
    {#if $isShowLogin}
    <ComponentLogin />
    {/if}

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

        > .side-bar {
            /* Nav Variabel */
            --nav-bg: #FADA7A;
            --nav-link: color-mix(in srgb, var(--nav-bg) 50%, white 50%);
            --nav-hover: #F0A04B;

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
                    .avatar { width: 38px; height: 38px; }
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