import { getSupabaseClient } from '../lib/supabase-client'

export async function submitVerification(
  userId: string,
  data: {
    realName: string
    idNumber: string
    idCardFrontUrl?: string
    idCardBackUrl?: string
  }
): Promise<any> {
  // Check if user already has a record
  const existing = await getSupabaseClient()
    .from('real_name_verifications')
    .select('id, status')
    .eq('user_id', userId)
    .maybeSingle()

  // If a rejected record exists, delete it so we can insert fresh
  if (existing.data && existing.data.status === 'rejected') {
    await getSupabaseClient()
      .from('real_name_verifications')
      .delete()
      .eq('user_id', userId)
  }

  const payload = {
    user_id: userId,
    real_name: data.realName,
    id_number: data.idNumber,
    id_card_front_url: data.idCardFrontUrl || null,
    id_card_back_url: data.idCardBackUrl || null,
    status: 'pending',
  }

  const { data: result, error } = await getSupabaseClient()
    .from('real_name_verifications')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('[real-name-verification service] submitVerification error:', error)
    throw error
  }

  return result
}

export async function getMyVerification(userId: string): Promise<any | null> {
  const { data, error } = await getSupabaseClient()
    .from('real_name_verifications')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[real-name-verification service] getMyVerification error:', error)
    return null
  }

  return data
}

export async function listVerifications(status?: string): Promise<any[]> {
  let query = getSupabaseClient()
    .from('real_name_verifications')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('[real-name-verification service] listVerifications error:', error)
    return []
  }

  return data || []
}

export async function reviewVerification(
  id: string,
  adminId: string,
  status: 'approved' | 'rejected',
  remark?: string
): Promise<any> {
  const { data: verification, error: fetchError } = await getSupabaseClient()
    .from('real_name_verifications')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !verification) {
    console.error('[real-name-verification service] reviewVerification fetch error:', fetchError)
    throw fetchError || new Error('认证记录不存在')
  }

  const { data: result, error } = await getSupabaseClient()
    .from('real_name_verifications')
    .update({
      status,
      admin_id: adminId,
      admin_remark: remark || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[real-name-verification service] reviewVerification update error:', error)
    throw error
  }

  // If approved, also mark companion_profiles as verified
  if (status === 'approved') {
    const { error: profileError } = await getSupabaseClient()
      .from('companion_profiles')
      .update({ is_verified: true })
      .eq('user_id', verification.user_id)

    if (profileError) {
      console.error('[real-name-verification service] failed to update companion profile verified status:', profileError)
    }
  }

  return result
}
