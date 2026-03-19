import { getSupabaseClient } from '../client'
import type { Weather } from '../../mock-adapter/types'

export async function queryWeather(params: { 
  city: string 
  startDate?: string 
  endDate?: string
}): Promise<Weather[]> {
  const supabase = getSupabaseClient()
  const query = supabase
    .from('weathers')
    .select('*')
    .eq('city', params.city)

  if (params.startDate && params.endDate) {
    query.gte('date', params.startDate)
    query.lte('date', params.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Supabase天气查询失败:', error)
    throw error
  }

  return data?.map(item => ({
    date: item.date,
    city: item.city,
    condition: item.condition,
    temperatureMin: item.temp_min,
    temperatureMax: item.temp_max,
    windLevel: item.wind_level,
    airQuality: item.air_quality
  })) || []
}
