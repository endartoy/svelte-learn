import { writable } from "svelte/store";

function creatUser() {
    let { subscribe, update } = writable(null)

    return {
        subscribe,
        set: (val = null) => {
            update(() => (val))
        },
    }
}
export const userStore = creatUser()

function creatUserSupabase() {
    let { subscribe, update } = writable(null)

    return {
        subscribe,
        set: (val = null) => {
            update(() => (val))
        },
    }
}
export const userSupabaseStore = creatUserSupabase()