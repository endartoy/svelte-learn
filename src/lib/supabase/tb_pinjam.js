import { supabase } from "./supabaseClient"

const upsertPinjam = async(formData) => {
    try {
        if (!formData.periode_id || !formData.anggota_id) throw {message: 'Data belum lengkap !'}

        const { data, error } = await supabase
            .from('tb_pinjam')
            .upsert(
                {
                    // periode_id: '',
                    // anggota_id: '',
                    // pinjam: 0,
                    // simpan: 0,
                    ...formData,
                    _updated_at: new Date().toISOString() 
                },
                { onConflict: ['periode_id', 'anggota_id'] }
            )
            .select()

        if (error) throw error
        return 'Transaksi berhasil !'
    } catch (error) {
        throw error
    }    
}

export {upsertPinjam}