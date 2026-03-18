import type { Hotel } from '../../types'
import { hotelData } from '../data/hotel.data'

export async function queryHotels(params: { 
  city: string 
  checkin?: string 
  checkout?: string 
  starLevel?: number
}): Promise<Hotel[]> {
  let result = hotelData

  if (params.starLevel) {
    result = result.filter(hotel => hotel.starLevel === params.starLevel)
  }

  return result.slice(0, 15)
}
