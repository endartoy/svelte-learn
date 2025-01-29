<script lang="ts">
    import { alertStore } from "$lib/stores/alertStore";
	import { fade } from "svelte/transition";
</script>

{#if $alertStore.length > 0}
<div class="alert-space" transition:fade={{duration:100}}>
    {#each $alertStore as alert}
    <div 
        role="alert"
        aria-live="assertive"
        class='alert-container {alert?.type}'
        transition:fade={{duration:300}}
    >
        <button onclick={() => alertStore.hide(alert?.id)} class="close" aria-label="close"></button>
        <p> {alert?.message} </p>
    </div>
    {/each}
</div>
{/if}

<style>
    /* Alert */
    .alert-space {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 300;
        justify-items:end;
    }

    .alert-container {
        max-width: 90%;
        text-align: end;
        padding: 1em;
        margin: 1em;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        position: relative;

        .close {
            height: 15px;
            width: 15px;
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #ff5252;
            border-radius: 8px;
            border: none
        }

        p {
            margin: 0%;
            margin-top: 10px;
            margin-right: 10px;
            font-weight: 500;
        }

        &.success {
            background-color: #81d4fa ;
        }

        &.danger {
            background-color: #ff8a80  ;
        }

        &.alert {
            background-color: #fff176 ;
        }

        &:hover {
            display: block;
            opacity: 1;
            pointer-events: visible;
        }
    }
</style>