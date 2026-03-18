import type { Attraction } from '../../types'
import { attractionData } from '../data/attraction.data'

export async function queryAttractions(params: { 
  city: string 
  tags?: string[]
}): Promise<Attraction[]> {
  let result = attractionData

  if (params.tags && params.tags.length > 0) {
    result = result.filter(attraction => 
      params.tags!.some(tag => attraction.tags.includes(tag))
    )
  }

  return result.slice(0, 15)
}
