import { getSupabaseClient } from '../client'
import type { Flight } from '../../mock-adapter/types'

export async function queryFlights(params: { 
  depCity: string 
  arrCity: string 
  date?: string 
}): Promise<Flight[]> {
  const supabase = getSupabaseClient()
  const query = supabase
    .from('flights')
    .select('*')
    .eq('dep_city', params.depCity)
    .eq('arr_city', params.arrCity)

  if (params.date) {
    query.eq('dep_date', params.date)
  }

  const { data, error } = await query.limit(15)

  if (error) {
    console.error('Supabase航班查询失败:', error)
    throw error
  }

  return data?.map(item => ({
    id: item.id,
    flightNo: item.flight_no,
    depCity: item.dep_city,
    arrCity: item.arr_city,
    depTime: item.dep_time,
    arrTime: item.arr_time,
    airline: item.airline,
    price: item.price,
    discount: item.discount,
    remainingSeats: item.remaining_seats
  })) || []
}
