import { getSupabaseClient } from '../client'
import type { Attraction } from '../../mock-adapter/types'

export async function queryAttractions(params: { 
  city: string 
  tags?: string[]
}): Promise<Attraction[]> {
  const supabase = getSupabaseClient()
  const query = supabase
    .from('attractions')
    .select('*')
    .eq('city', params.city)

  if (params.tags && params.tags.length > 0) {
    query.contains('tags', params.tags)
  }

  const { data, error } = await query.limit(15)

  if (error) {
    console.error('Supabase景点查询失败:', error)
    throw error
  }

  return data?.map(item => ({
    id: item.id,
    name: item.name,
    address: item.address,
    ticketPrice: item.ticket_price,
    openTime: item.open_time,
    closeTime: item.close_time,
    rating: item.rating,
    reviewCount: item.review_count,
    estimatedVisitTime: item.visit_time,
    tags: item.tags
  })) || []
}
