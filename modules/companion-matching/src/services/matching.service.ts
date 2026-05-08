import type { CompanionProfile, UserProfile, CompanionFilters, MatchResult } from '../types/index'

const mockCompanions: CompanionProfile[] = [
  {
    id: 'comp_001',
    name: '旅行达人小王',
    bio: '热爱摄影和美食，去过20+国家，喜欢深度游而非打卡式旅行',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '2026-05-15',
    departureDate: '2026-05-15',
    budget: '经济 ¥3000-8000',
    budgetType: 'medium',
    personality: '随性自由',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.8,
    creditScore: '4.9',
    creditLevel: '钻石',
    creditBadge: 'diamond',
    totalTrips: 23,
    interested: false,
    sameday: true,
    travelTypes: ['休闲', '美食', '摄影'],
    wakeTime: '08:00',
    sleepTime: '23:00',
    gender: '男',
    age: 28
  },
  {
    id: 'comp_002',
    name: '背包客小李',
    bio: '喜欢徒步和户外探险，预算有限但体验不打折',
    destination: '云南大理',
    travelDays: 7,
    departureInfo: '2026-05-18',
    departureDate: '2026-05-18',
    budget: '穷游 ¥0-3000',
    budgetType: 'budget',
    personality: '计划周密',
    personalityType: 'planner',
    overlapDays: 2,
    rating: 4.5,
    creditScore: '4.7',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 12,
    interested: false,
    sameday: false,
    travelTypes: ['徒步', '探险', '自然'],
    wakeTime: '06:00',
    sleepTime: '22:00',
    gender: '男',
    age: 24
  },
  {
    id: 'comp_003',
    name: '文艺小张',
    bio: '喜欢逛博物馆和咖啡馆，享受慢节奏的旅行',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '2026-05-15',
    departureDate: '2026-05-15',
    budget: '品质 ¥8000+',
    budgetType: 'luxury',
    personality: '随性自由',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.6,
    creditScore: '4.8',
    creditLevel: '钻石',
    creditBadge: 'diamond',
    totalTrips: 8,
    interested: false,
    sameday: true,
    travelTypes: ['文化', '美食', '休闲'],
    wakeTime: '09:00',
    sleepTime: '00:00',
    gender: '女',
    age: 26
  },
  {
    id: 'comp_004',
    name: '户外老赵',
    bio: '退休后开始环游中国，经验丰富，擅长规划路线',
    destination: '四川成都',
    travelDays: 10,
    departureInfo: '2026-05-20',
    departureDate: '2026-05-20',
    budget: '经济 ¥3000-8000',
    budgetType: 'medium',
    personality: '计划周密',
    personalityType: 'planner',
    overlapDays: 0,
    rating: 4.9,
    creditScore: '5.0',
    creditLevel: '钻石',
    creditBadge: 'diamond',
    totalTrips: 35,
    interested: false,
    sameday: false,
    travelTypes: ['自驾', '摄影', '美食'],
    wakeTime: '05:30',
    sleepTime: '21:00',
    gender: '男',
    age: 58
  },
  {
    id: 'comp_005',
    name: '吃货小陈',
    bio: '旅行的意义就是吃遍各地美食，顺便看看风景',
    destination: '云南大理',
    travelDays: 4,
    departureInfo: '2026-05-16',
    departureDate: '2026-05-16',
    budget: '经济 ¥3000-8000',
    budgetType: 'medium',
    personality: '随性自由',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.3,
    creditScore: '4.5',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 5,
    interested: false,
    sameday: false,
    travelTypes: ['美食', '休闲', '购物'],
    wakeTime: '10:00',
    sleepTime: '01:00',
    gender: '女',
    age: 22
  },
  {
    id: 'comp_006',
    name: '摄影师阿明',
    bio: '专业摄影师，寻找同样热爱拍照的旅伴一起创作',
    destination: '云南大理',
    travelDays: 6,
    departureInfo: '2026-05-14',
    departureDate: '2026-05-14',
    budget: '品质 ¥8000+',
    budgetType: 'luxury',
    personality: '计划周密',
    personalityType: 'planner',
    overlapDays: 4,
    rating: 4.7,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 15,
    interested: false,
    sameday: false,
    travelTypes: ['摄影', '自然', '文化'],
    wakeTime: '05:00',
    sleepTime: '22:00',
    gender: '男',
    age: 30
  }
]

export function calculateMatchScore(companion: CompanionProfile, userProfile: UserProfile): MatchResult {
  let score = 50
  const details = {
    destinationMatch: false,
    budgetMatch: false,
    personalityMatch: false,
    travelTypeOverlap: 0,
    scheduleCompatibility: 0
  }

  if (companion.destination === userProfile.destination) {
    score += 20
    details.destinationMatch = true
  }

  if (companion.budgetType === userProfile.budgetType) {
    score += 10
    details.budgetMatch = true
  } else if (
    (companion.budgetType === 'medium' && userProfile.budgetType !== 'medium') ||
    (userProfile.budgetType === 'medium' && companion.budgetType !== 'medium')
  ) {
    score += 5
  }

  if (companion.personalityType === userProfile.personalityType) {
    score += 8
    details.personalityMatch = true
  }

  const commonTypes = companion.travelTypes.filter(t => userProfile.travelTypes.includes(t))
  details.travelTypeOverlap = commonTypes.length
  score += commonTypes.length * 3

  const companionWake = parseInt(companion.wakeTime.split(':')[0])
  const userWake = parseInt(userProfile.wakeTime.split(':')[0])
  const wakeDiff = Math.abs(companionWake - userWake)
  if (wakeDiff <= 1) {
    details.scheduleCompatibility += 5
    score += 5
  } else if (wakeDiff <= 2) {
    details.scheduleCompatibility += 3
    score += 3
  }

  const companionSleep = parseInt(companion.sleepTime.split(':')[0])
  const userSleep = parseInt(userProfile.sleepTime.split(':')[0])
  const sleepDiff = Math.abs(companionSleep - userSleep)
  if (sleepDiff <= 1) {
    details.scheduleCompatibility += 5
    score += 5
  } else if (sleepDiff <= 2) {
    details.scheduleCompatibility += 3
    score += 3
  }

  score = Math.min(100, Math.max(0, score))

  return {
    companion: { ...companion, matchScore: score },
    matchScore: score,
    matchDetails: details
  }
}

export function filterCompanions(
  companions: CompanionProfile[],
  filters: CompanionFilters,
  userProfile: UserProfile
): MatchResult[] {
  let filtered = [...companions]

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    filtered = filtered.filter(c =>
      c.destination.toLowerCase().includes(keyword) ||
      c.name.toLowerCase().includes(keyword) ||
      c.bio.toLowerCase().includes(keyword)
    )
  }

  if (filters.budget) {
    filtered = filtered.filter(c => c.budgetType === filters.budget)
  }

  if (filters.credit) {
    filtered = filtered.filter(c => c.creditLevel === filters.credit)
  }

  if (filters.departure === 'week') {
    const now = Date.now()
    const weekLater = now + 7 * 24 * 60 * 60 * 1000
    filtered = filtered.filter(c => {
      const depDate = new Date(c.departureDate).getTime()
      return depDate >= now && depDate <= weekLater
    })
  } else if (filters.departure === 'month') {
    const now = Date.now()
    const monthLater = now + 30 * 24 * 60 * 60 * 1000
    filtered = filtered.filter(c => {
      const depDate = new Date(c.departureDate).getTime()
      return depDate >= now && depDate <= monthLater
    })
  }

  if (filters.destination) {
    filtered = filtered.filter(c => c.destination === filters.destination)
  }

  if (filters.personalityType) {
    filtered = filtered.filter(c => c.personalityType === filters.personalityType)
  }

  const results = filtered.map(c => calculateMatchScore(c, userProfile))
  results.sort((a, b) => b.matchScore - a.matchScore)

  return results
}

export function getMockCompanions(): CompanionProfile[] {
  return mockCompanions
}

export function getCompanionById(id: string): CompanionProfile | undefined {
  return mockCompanions.find(c => c.id === id)
}
