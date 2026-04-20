export interface ItineraryRequest {
  id: string
  userId: string
  content: string
  imageUrl?: string
  createTime: number
}

export type ItineraryItemType = 'flight' | 'hotel' | 'attraction' | 'meal' | 'transport'

export interface ItineraryItem {
  id: string
  type: ItineraryItemType
  name: string
  address?: string
  startTime: string
  endTime: string
  cost: number
  description: string
  position?: { lat: number; lng: number }
  tags?: string[]
}

export interface ItineraryDay {
  day: number
  date?: string
  items: ItineraryItem[]
}

export interface ItineraryPlan {
  id: string
  requestId: string
  name: string
  description: string
  tags: string[]
  totalDays: number
  totalCost: number
  days: ItineraryDay[]
  createTime: number
}
