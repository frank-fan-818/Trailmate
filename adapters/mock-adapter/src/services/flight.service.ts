import type { Flight } from '../../types'
import { flightData } from '../data/flight.data'

export async function queryFlights(params: { 
  depCity: string 
  arrCity: string 
  date?: string 
}): Promise<Flight[]> {
  return flightData.filter(flight => 
    flight.depCity === params.depCity && 
    flight.arrCity === params.arrCity
  ).slice(0, 15)
}
