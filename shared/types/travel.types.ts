export interface Flight {
  id: string
  flightNo: string
  depCity: string
  arrCity: string
  depTime: string
  arrTime: string
  airline: string
  price: number
  discount: number
  remainingSeats: number
  depDate?: string  // 出发日期 YYYY-MM-DD, optional
}

export interface Hotel {
  id: string
  name: string
  starLevel: 1 | 2 | 3 | 4 | 5
  address: string
  price: number
  rating: number
  reviewCount: number
  distanceFromCityCenter: number
  remainingRooms: number
}

export interface Attraction {
  id: string
  name: string
  address: string
  ticketPrice: number
  openTime: string
  closeTime: string
  rating: number
  reviewCount: number
  estimatedVisitTime: number
  tags: string[]
}

export interface Weather {
  date: string
  city: string
  condition: '晴' | '多云' | '小雨' | '中雨' | '大雨' | '雪' | '阴'
  temperatureMin: number
  temperatureMax: number
  windLevel: number
  airQuality: '优' | '良' | '轻度污染' | '中度污染' | '重度污染'
}
