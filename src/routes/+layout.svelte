<!-- JS -->
<script lang="ts">
    // Page data
    let { children } = $props()
	import { page } from "$app/state";
    import { onMount } from "svelte";

    // Alert and Loading
    import { alertStore } from "$lib/stores/alertStore.js";
    import { loadingStore } from "$lib/stores/loadingStore.js";
	import { fade } from 'svelte/transition';

    // User Auth
    import { authStateListener, fnSignIn, fnSignOut } from "$lib/firebase.js";
    import { userStore } from "$lib/stores/userStores";

    // local import
	import ComponentAlert from "./ComponentAlert.svelte";

    const signIn = async() => {
        try {
            loadingStore.show()
            await fnSignIn()           
        } catch (error) {
            alertStore.show(`${error?.code} : ${error?.message}`, 'danger')
        } finally {
            loadingStore.hide()
        }
    }

    const signOut = async() => {
        try {
            loadingStore.show()
            await fnSignOut().then(() => userStore.set())           
        } catch (error) {
            alertStore.show(`${error?.code} : ${error?.message}`, 'danger')
        } finally {
            loadingStore.hide()
        }
    }

    onMount(() => {
        let unSubscribe
        try {
            unSubscribe = authStateListener((userLogin) => {
                if (userLogin) {
                    if (userLogin?.role) {
                        alertStore.show(`Selamat datang ${userLogin.displayName}`)
                        userStore.set(userLogin)
                    } else {
                        alertStore.show('User belum terverifikasi. Silakan hubungi admin.', 'alert')
                    }
                }
            })
        } catch (error) {
            alertStore.show(`${error?.code} : ${error?.message}`, 'danger')
        }
        return() => unSubscribe()
    })

    const _userLink = [
        {
            title: 'KAS P2G',
            url: '/kas-p2g',
            class: ''
        },
        {
            title: 'USER MANAGEMEN',
            url: '/manage-user',
            class: 'sp-link'
        }
    ]

    let _currentPage = $derived(_userLink.find(val => val.url === page.url.pathname))
</script>

<!-- UI -->
<main>
    <!-- Nav -->
    <nav>
        <div class="left">
            <a href="/"><img src="/p2g.png" alt="Avatar" class="logo" /></a>
        </div>

        <div class="center">
            <button class="nav-button" > {_currentPage?.title ? _currentPage.title : 'HOME'} </button>  
            <ul class="nav-link">
                <li>
                    <a href="/kas-p2g" > KAS P2G </a>
                </li>

                {#if $userStore?.role === 'superadmin'}
                <li class="sp-link">
                    <a href="/manage-user" > MANAGE USER </a>
                </li>
                {/if} 
            </ul>
        </div>

        <div class="right">
            {#if $userStore}
                <button class="btn-user">
                    <img class="avatar" src={$userStore?.photoURL} alt="user avatar" />
                </button>

                <div class="right-side">
                    <img class="avatar" src={$userStore?.photoURL} alt="user avatar" />
                    <p class="display-name"> {$userStore?.displayName} </p>
                    <p class="email"> {$userStore?.email} </p>
                    {#if $userStore?.role}
                        <p class="role"> ({$userStore?.role}) </p>
                    {/if}

                    <button onclick={signOut} class="button warning">
                        Log Out
                    </button>
                </div>
            {:else}
                <button onclick={signIn} class="btn-login">
                    Login
                </button>
            {/if}
        </div>
    </nav>

    <!-- Main -->
    <div class="body">
        {@render children()}

        <!-- test button -->
        <!-- <div class="test-button">
            <button onclick={() => alertStore.show('Pesan Tekirim')}> show alert </button>
            <button onclick={() => loadingStore.show()}> show loading </button>
            <button onclick={() => loadingStore.hide()}> hide loading </button>
        </div> -->
    </div>

    <!-- Loading -->
    {#if $loadingStore}
        <div class='modal-container' transition:fade>
            <h2>Loading</h2>
            <progress class="progress"></progress>
        </div>
    {/if}

    <!-- Alert -->
    <ComponentAlert />
</main>

<!-- CSS -->
<style>
    /* Main */
    main {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 100dvh;

        .body {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
    }
    
    /* Navigation */
    nav {
        --bg-color: #e8f5e9 ; 

        /* Nav Variabel */
        --nav-bg: #1de9b6;
        --nav-hover: #80cbc4;
        --nav-border-button: #fb8c00 ;
        --nav-button: #80cbc4 ;
        --nav-buton-hover: color-mix(in srgb, white 40%, var(--button));

        /* size */
        --gap:3px;

        position: sticky;
        top: 0;
        display: flex;
        flex-direction: row;
        column-gap: var(--gap);
        width: 100%;
        background-color: var(--nav-bg);
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        z-index: 100;

        > div {
            background-color: var(--nav-bg);
            display: flex;
            flex-direction: column;
            padding: 0.1em;
        }

        .left {
            padding-left: 1%;
            flex: 1;
            align-items:start;
            justify-content:center;
        }

        .center {
            align-items:center;
            justify-content:center;
            position: relative;

            .nav-button {
                padding: 0.5em;
                border-bottom: 0;
                border-left: 0;
                border-right: 0;
                border-top: 2px solid var(--nav-border-button);
                background-color: transparent;
                font-size: medium;
                cursor: pointer;
                transition: background-color 0.35s ease;
            }
            
            .nav-link {
                position: fixed;
                top: 45px;
                min-width: 10em;
                margin: 0;
                background-color:var(--nav-bg);
                padding: 0em ;
                opacity: 0;
                pointer-events: none;
                transform: translateY(-10px);
                transition: opacity 0.3s ease, transform 0.3s ease;

                > li {
                    margin: 0px !important;
                    list-style: none;

                    &.sp-link {
                        background-color: color-mix(in srgb, var(--nav-border-button) 40%, white 30%);
                    }

                    a {
                        display:block;
                        padding: 10px;
                        text-decoration: none;
                        color: black;
                    }

                    &:hover {
                        background-color: var(--nav-hover);
                    }
                }

            }

            &:focus-within {
                .nav-button {
                    background-color: var(--nav-hover);
                }

                .nav-link {
                    display: block;
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: all;
                }
            }
        }

        .right {
            flex: 1;
            align-items:end;
            justify-content:center;
            position: relative;

            .btn-user, .btn-login {
                padding: 0.5em;
                border: 2px solid transparent;
                background-color: transparent;
                font-size: medium;
                cursor: pointer;

                >  .avatar {
                    width: 20px;
                    height: 20px;
                    border-radius: 10px;
                    object-fit: cover;
                }

                &:hover {
                    border-top: 2px solid var(--nav-border-button)
                }
            }

            .right-side {
                position: fixed;
                top: 45px;
                right: 0%;
                background-color: var(--nav-bg);
                opacity: 0; /* Initially hidden */
                pointer-events: none; /* Prevent interaction while hidden */
                transform: translateY(-10px);
                transition: opacity 0.3s ease, transform 0.3s ease;

                align-items:center;
                justify-items: center;

                > img, p, button {
                    margin: 10px;
                }
        
                .avatar {
                    width: 100%;
                    height: 80px;
                    margin: 0;
                    object-fit:cover;
                }

                p {
                    margin: 2px;
                    padding-inline: 10px;
                 
                    &.display-name {
                        font-size: larger;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    &.email {
                        font-weight: bold;
                    }
                    &.role {
                        font-style: italic;
                    }
                }
            }

            &:focus-within {
                .btn-user {
                    border-top: 2px solid var(--nav-border-button)
                }

                .right-side {
                    display: block;
                    transform:  translateX(0);
                    opacity: 1;
                    pointer-events: all;
                }
            } 
        }

        .logo {
            width: 1.5em;
            height: 1.5em;
            object-fit: cover;
        }
    }
</style>