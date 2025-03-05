import { userSupabaseStore } from "$lib/stores/userStores";
import { get } from "svelte/store";
import { redirect } from "@sveltejs/kit";

export function load() {
    const session = get(userSupabaseStore);

    if (!['superadmin'].includes(session?.user?.user_role)) {
        throw redirect(308, '/lumbung-rt/'); 
    }
} 