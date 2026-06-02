import { getSupabaseClient } from '../lib/supabase-client'

export async function getProfile(userId: string): Promise<any | null> {
  const { data, error } = await getSupabaseClient()
    .from('companion_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[companion-profile service] getProfile error:', error)
    return null
  }

  return data
}

export async function upsertProfile(userId: string, data: any): Promise<any> {
  const payload = { ...data, user_id: userId }

  const { data: result, error } = await getSupabaseClient()
    .from('companion_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('[companion-profile service] upsertProfile error:', error)
    throw error
  }

  return result
}

export async function listProfiles(filters?: any, excludeUserId?: string): Promise<any[]> {
  let query = getSupabaseClient()
    .from('companion_profiles')
    .select('*')
    .eq('is_visible', true)

  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId)
  }

  if (filters?.destination) {
    query = query.ilike('destination', `%${filters.destination}%`)
  }

  if (filters?.budgetType) {
    query = query.eq('budget_type', filters.budgetType)
  }

  if (filters?.personalityType) {
    query = query.eq('personality_type', filters.personalityType)
  }

  if (filters?.keyword) {
    query = query.or(
      `name.ilike.%${filters.keyword}%,bio.ilike.%${filters.keyword}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('[companion-profile service] listProfiles error:', error)
    return []
  }

  return data || []
}

export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('companion_profiles')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('[companion-profile service] deleteProfile error:', error)
    throw error
  }
}
