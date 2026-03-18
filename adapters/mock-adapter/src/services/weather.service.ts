import type { Weather } from '../../types'
import { weatherData } from '../data/weather.data'

export async function queryWeather(params: { 
  city: string 
  startDate?: string 
  endDate?: string
}): Promise<Weather[]> {
  let result = weatherData.filter(weather => weather.city === params.city)

  if (params.startDate && params.endDate) {
    result = result.filter(weather => 
      weather.date >= params.startDate! && 
      weather.date <= params.endDate!
    )
  }

  return result
}
