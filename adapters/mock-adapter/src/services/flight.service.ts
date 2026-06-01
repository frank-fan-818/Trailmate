import type { Flight } from '../../types'
import { flightData } from '../data/flight.data'

export async function queryFlights(params: {
  depCity: string
  arrCity: string
  date?: string
}): Promise<Flight[]> {
  return flightData.filter(flight => {
    // 匹配出发地和目的地
    if (flight.depCity !== params.depCity || flight.arrCity !== params.arrCity) {
      return false
    }
    // 如果传入了日期，且有 depDate 的航班需要匹配日期
    if (params.date && flight.depDate) {
      return flight.depDate === params.date
    }
    // 没有 depDate 的航班视为每天可用，不过滤掉
    return true
  }).slice(0, 15)
}
