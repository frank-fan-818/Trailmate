import { getSupabaseClient } from '../client'
import type { Attraction } from '../../../../shared/types/travel.types'

interface AttractionRow {
  id: string
  name: string
  address: string
  ticket_price: number
  open_time: string
  close_time: string
  rating: number
  review_count: number
  visit_time: number
  tags: string[]
}

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

  const rows = (data ?? []) as AttractionRow[]

  return rows.map(item => ({
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
  }))
}
