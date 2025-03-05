import { supabase } from "$lib/supabase/supabaseClient";

const getListAnggota = async() => {
    try {
        let { data, error } = await supabase
            .from('tb_anggota')
            .select('*')
            .is('_delete', null)
            .order('nama')

        if (error) throw error

        return data
    } catch (error) {
        throw error
    }
}

const getAnggotaById = async(id) => {
    try {
        let { data : data_periode , error : error_periode } = await supabase
            .from('tb_anggota')
            .select('*')
            .is('_delete', null)
            .eq('id', id)
            .single()
        if (error_periode) throw error_periode
        return data_periode    
    } catch (error) {
        throw error
    }
}

const addAnggota = async(formData) => {
    try {
        // build formdata
        let { _history, ...value } = formData

        // Update data
        let update_value = {
            nama: value?.nama?.toUpperCase(),
            ket: value?.ket,
            _updated_at: new Date().toISOString(),
        }

        // history data
        _history = [
            {
                action: 'add',
                data: { ...value, ...update_value }
            }
        ]

        let { data, error } = await supabase
        .from('tb_anggota')
        .insert([{
            ...update_value,
            _history: _history
        }])
        .select()
        if (error) throw error

        return `${formData?.nama.toUpperCase()} berhasil ditambahkan`
    } catch (error) {
        throw error
    }
}

const updateAnggota = async(formData) => {
    try {
        // build formdata
        let { _history, ...value } = formData

        // Update data
        let update_value = {
            nama: value?.nama?.toUpperCase(),
            ket: value?.ket,
            _updated_at: new Date().toISOString(),
        }

        // history data
        _history = [
            {
                action: 'update',
                data: { ...value, ...update_value }
            },
            ..._history
        ]

        let { data, error } = await supabase
        .from('tb_anggota')
        .update({
            ...update_value,
            _history: _history
        })
        .eq('id', formData?.id)
        .select()

        if (error) throw error
        return `Update data ${formData?.nama.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
}

const softDelAnggota = async(formData) => {
    try {
        // build formdata
        let { _history, ...value } = formData

        // Update data
        let update_value = {
            _updated_at: new Date().toISOString(), 
            _delete: new Date().toISOString()
        }

        // history data
        _history = [
            {
                action: 'delete',
                data: { ...value, ...update_value }
            },
            ..._history
        ]

        let { data, error } = await supabase
        .from('tb_anggota')
        .update({
            ...update_value,
            _history: _history
        })
        .eq('id', formData?.id)
        .select()

        if (error) throw error
        return `Hapus data ${formData?.nama.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
    
}

const getAllListAnggota = async() => {
    try {
        let { data, error } = await supabase
            .from('tb_anggota')
            .select('*')
            .order('nama')

        if (error) throw error

        return data
    } catch (error) {
        throw error
    }
}

const restoreDelAnggota = async(formData) => {
    try {
        // build formdata
        let { _history, ...value } = formData

        // Update data
        let update_value = {
            _updated_at: new Date().toISOString(),
            _delete: null
        }

        // history data
        _history = [
            {
                action: 'restore',
                data: { ...value, ...update_value }
            },
            ..._history
        ]

        let { data, error } = await supabase
        .from('tb_anggota')
        .update({
            ...update_value,
            _history: _history
        })
        .eq('id', formData?.id)
        .select()

        if (error) throw error
        return `Restore data ${formData?.nama.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
}

const hardDelAnggota = async(formData) => {
    try {
        if (!formData?.id) throw {message: 'Error: Terjadi kesalahan.'}

        const { error } = await supabase
            .from('tb_anggota')
            .delete()
            .eq('id', formData.id)

        if (error) throw error
        return `Hapus data ${formData?.nama.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
}

export { getListAnggota, getAnggotaById, addAnggota, updateAnggota, softDelAnggota }
export { getAllListAnggota, restoreDelAnggota, hardDelAnggota }