import { getSupabaseClient } from '../client'
import type { Hotel } from '../../mock-adapter/types'

export async function queryHotels(params: { 
  city: string 
  checkin?: string 
  checkout?: string 
  starLevel?: number
}): Promise<Hotel[]> {
  const supabase = getSupabaseClient()
  const query = supabase
    .from('hotels')
    .select('*')
    .eq('city', params.city)

  if (params.starLevel) {
    query.eq('star_level', params.starLevel)
  }

  const { data, error } = await query.limit(15)

  if (error) {
    console.error('Supabase酒店查询失败:', error)
    throw error
  }

  return data?.map(item => ({
    id: item.id,
    name: item.name,
    starLevel: item.star_level,
    address: item.address,
    price: item.price,
    rating: item.rating,
    reviewCount: item.review_count,
    distanceFromCityCenter: item.distance_from_center,
    remainingRooms: item.remaining_rooms
  })) || []
}
