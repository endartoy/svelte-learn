import { writable } from "svelte/store";

function createLoading() {
    let { subscribe, update } = writable(false)

    return {
        subscribe,
        show:() => { update(() => (true)) },
        hide:() => { update(() => (false)) }
    }
}

export const loadingStore = createLoading()