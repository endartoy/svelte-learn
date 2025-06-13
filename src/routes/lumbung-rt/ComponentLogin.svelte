<script module>
	import { writable } from "svelte/store";
    let isShowLogin = writable(false)

    const showLogin = () => { isShowLogin.set(true) }
    const hideLogin = () => { isShowLogin.set(false) }

    export { isShowLogin, showLogin }
</script>

<script>
    import { supabaseSignIn } from "$lib/supabase/supabaseAuth";
    import { loadingStore } from "$lib/stores/loadingStore";
    import { alertStore } from "$lib/stores/alertStore";

	import { fade } from "svelte/transition";

    let email = $state(null)
    const signInSupabase = () => {
        if (!email) {
            alertStore.show('Email tidak boleh kosng', 'danger')
            return
        }

        loadingStore.show()
        supabaseSignIn(email)
            .then(() => {
                alertStore.show('Silahkan cek email anda')
                hideLogin()
            })
            .catch((error) => {
                alertStore.show(error.message, 'danger')
            })
            .finally(() => loadingStore.hide())
    }
</script>

<dialog open transition:fade>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dialog-backdrop" onclick={hideLogin}></div>

    <div class="dialog-content">
        <form onsubmit={(e) => { e.preventDefault(); signInSupabase() }} class="form-login">
            <input bind:value={email} type="email" class="input" placeholder="Email" required />
            <button type="submit" class="button primary"> Login </button>
        </form>
    </div>
</dialog>

<style>
    /* variabel */
    :root {
        --form-width: 95vw;
        @media (min-width: 480px) { --form-width: 95vw;}
        @media (min-width: 768px) { --form-width: 50vw;}
        @media (min-width: 1024px) { --form-width: 30vw;}
    }

    .form-login {
        width: var(--form-width);
        display: flex;
        flex-direction: column;
        row-gap: 5px;

        --bg-color: #FADA7A;
        background-color: color-mix(in srgb, var(--bg-color) 80%, white);
        border-radius: 5px;
        padding: 1em;
    }
</style>

