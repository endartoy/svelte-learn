import { page } from "$app/state";
import { supabase } from "$lib/supabase/supabaseClient";

const supabaseSignIn = async(email) => {
    try {
        if (!email) throw { message: 'Silakan login terlebih dahulu.' }

        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${page.url.origin}/lumbung-rt`
            }
        })

        if (error) throw error
        return data
    } catch (error) {
        throw error
    }
}

const supabaseSignOut = async() => {
    try {
        const { error } = await supabase.auth.signOut()

        if (error) throw error
        return null
    } catch (error) {
        throw error
    }
}

const getUserRole = async(id) => {
    try {
        if (!id) throw ('Email tidak boleh kosong')
        
        const { data, error } = await supabase
            .from('profiles')
            .select()
            .eq('id', id)
            .single()

        if (error) return { role: null }
        return data
    } catch (error) {
        throw error
    }
}

export { supabaseSignIn, supabaseSignOut, getUserRole }
