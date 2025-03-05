import { supabase } from "$lib/supabase/supabaseClient";

const getListPeriode = async() => {
    try {
        let { data, error } = await supabase
            .from('tb_periode')
            .select('*')
            .is('_delete', null)
            .order('tgl_pinjam', {ascending: false})

        if (error) throw error

        return data
    } catch (error) {
        throw error
    }
}

const getPeriodeById = async(id) => {
    try {
        let { data : data_periode , error : error_periode } = await supabase
            .from('tb_periode')
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

const addPeriode = async(formData) => {
    try {
        // build formdata
        let { _history, ...value } = formData

        // Update data
        let update_value = {
            nama_periode: value?.nama_periode,
            jasa: value?.jasa,
            tgl_pinjam: value?.tgl_pinjam,
            tgl_bayar: value?.tgl_bayar ? value.tgl_bayar : null,
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
        .from('tb_periode')
        .insert([{
            ...update_value,
            _history: _history
        }])
        .select()
        if (error) throw error

        return `${formData?.nama_periode.toUpperCase()} berhasil ditambahkan`
    } catch (error) {
        throw error
    }
}

const updatePeriode = async(formData) => {
    try {
        // build formdata
        let { _history, ...value } = formData

        // Update data
        let update_value = {
            nama_periode: value?.nama_periode,
            jasa: value?.jasa,
            tgl_pinjam: value?.tgl_pinjam,
            tgl_bayar: value?.tgl_bayar ? value.tgl_bayar : null,
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
        .from('tb_periode')
        .update({
            ...update_value,
            _history: _history
        })
        .eq('id', formData?.id)
        .select()

        if (error) throw error
        return `Update data ${formData?.nama_periode.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
    
}

const softDelPeriode = async(formData) => {
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
        .from('tb_periode')
        .update({
            ...update_value,
            _history: _history
        })
        .eq('id', formData?.id)
        .select()

        if (error) throw error
        return `Hapus data ${formData?.nama_periode.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
    
}

const getAllListPeriode = async() => {
    try {
        let { data, error } = await supabase
            .from('tb_periode')
            .select('*')
            .order('tgl_pinjam')

        if (error) throw error

        return data
    } catch (error) {
        throw error
    }
}

const restoreDelPeriode = async(formData) => {
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
        .from('tb_periode')
        .update({
            ...update_value,
            _history: _history
        })
        .eq('id', formData?.id)
        .select()

        if (error) throw error
        return `Restore data ${formData?.nama_periode.toUpperCase()} berhasil.`
    } catch (error) {
        throw error
    }
}

const hardDelPeriode = async(formData) => {
    try {
        if (!formData?.id) throw {message: 'Error: Terjadi kesalahan.'}

        const { error } = await supabase
            .from('tb_periode')
            .delete()
            .eq('id', formData.id)

        if (error) throw error
        return `Hapus data ${formData?.nama_periode.toUpperCase()} berhasil`
    } catch (error) {
        throw error
    }
}

export { getListPeriode, getPeriodeById, addPeriode, updatePeriode, softDelPeriode }
export { getAllListPeriode, restoreDelPeriode, hardDelPeriode }