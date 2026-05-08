export interface CompanionProfile {
  id: string
  name: string
  avatar?: string
  bio: string
  destination: string
  travelDays: number
  departureInfo: string
  departureDate: string
  budget: string
  budgetType: 'budget' | 'medium' | 'luxury'
  personality: string
  personalityType: 'planner' | 'spontaneous'
  overlapDays: number
  rating: number
  creditScore: string
  creditLevel: '钻石' | '黄金' | '白银'
  creditBadge: 'diamond' | 'gold' | 'silver'
  totalTrips: number
  interested: boolean
  sameday: boolean
  matchScore?: number
  travelTypes: string[]
  wakeTime: string
  sleepTime: string
  gender: '男' | '女' | '保密'
  age: number
}

export interface UserProfile {
  userId: string
  destination: string
  travelDays: number
  budgetType: 'budget' | 'medium' | 'luxury'
  personalityType: 'planner' | 'spontaneous'
  travelTypes: string[]
  wakeTime: string
  sleepTime: string
  gender: '男' | '女' | '保密'
  age: number
}

export interface CompanionFilters {
  keyword?: string
  budget?: string
  credit?: string
  departure?: string
  destination?: string
  travelDays?: number
  personalityType?: string
}

export interface TeamRequest {
  id: string
  fromUserId: string
  toUserId: string
  destination: string
  date: string
  message: string
  splitType: 'aa' | 'host' | 'custom'
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: number
}

export interface MatchResult {
  companion: CompanionProfile
  matchScore: number
  matchDetails: {
    destinationMatch: boolean
    budgetMatch: boolean
    personalityMatch: boolean
    travelTypeOverlap: number
    scheduleCompatibility: number
  }
}
