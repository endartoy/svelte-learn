import { supabase } from "./supabaseClient";

const getSisaPinjamByPeriode = async(id) => {
    try {
        const { data : data_pinjam, error : error_pinjam } = await supabase
            .rpc('sisa_pinjam')
            .eq('periode_id', id)
        if (error_pinjam) throw error_pinjam

        const { data : sum, error : error_sum } = await supabase
            .rpc('sum_sisa_pinjam')
            .eq('periode_id', id)
            .single()
        if (error_sum) throw error_sum
        
        return {
            data : data_pinjam,
            sum : sum
        }
    } catch (error) {
        throw error
    }    
}

const getSisaPinjamByAnggota = async(id) => {
    try {
        const { data : data_pinjam, error : error_pinjam } = await supabase
            .rpc('sisa_pinjam')
            .eq('anggota_id', id)
        if (error_pinjam) throw error_pinjam
        
        return {
            data : data_pinjam,
        }
    } catch (error) {
        throw error
    }    
}

export { getSisaPinjamByPeriode, getSisaPinjamByAnggota }