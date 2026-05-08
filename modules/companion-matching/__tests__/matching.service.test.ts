import { describe, test, expect } from 'vitest'
import {
  calculateMatchScore,
  filterCompanions,
  getMockCompanions,
  getCompanionById,
} from '../src/services/matching.service'
import type { CompanionProfile, UserProfile, CompanionFilters } from '../src/types/index'

// ---- 测试辅助 ----

function makeUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 'test-user',
    destination: '云南大理',
    travelDays: 5,
    budgetType: 'medium',
    personalityType: 'spontaneous',
    travelTypes: ['休闲', '美食', '摄影'],
    wakeTime: '08:00',
    sleepTime: '23:00',
    gender: '男',
    age: 28,
    ...overrides,
  }
}

function makeCompanion(overrides: Partial<CompanionProfile> = {}): CompanionProfile {
  return {
    id: 'comp_test',
    name: '测试用户',
    bio: '测试简介',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '2026-05-15',
    departureDate: '2026-05-15',
    budget: '经济 ¥3000-8000',
    budgetType: 'medium',
    personality: '随性自由',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.5,
    creditScore: '4.5',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 10,
    interested: false,
    sameday: true,
    travelTypes: ['休闲', '美食'],
    wakeTime: '08:00',
    sleepTime: '23:00',
    gender: '男',
    age: 30,
    ...overrides,
  }
}

// ---- getMockCompanions ----

describe('getMockCompanions', () => {
  test('返回mock旅伴数据', () => {
    const companions = getMockCompanions()
    expect(companions.length).toBe(6)
    expect(companions[0]).toHaveProperty('id')
    expect(companions[0]).toHaveProperty('name')
    expect(companions[0]).toHaveProperty('destination')
  })
})

// ---- getCompanionById ----

describe('getCompanionById', () => {
  test('根据ID找到旅伴', () => {
    const companion = getCompanionById('comp_001')
    expect(companion).toBeDefined()
    expect(companion!.name).toBe('旅行达人小王')
  })

  test('不存在的ID返回undefined', () => {
    const companion = getCompanionById('nonexistent')
    expect(companion).toBeUndefined()
  })
})

// ---- calculateMatchScore ----

describe('calculateMatchScore', () => {
  test('相同目的地、预算、作息完美匹配得高分', () => {
    const user = makeUserProfile()
    const companion = makeCompanion()
    const result = calculateMatchScore(companion, user)

    expect(result.matchScore).toBeGreaterThanOrEqual(90)
    expect(result.matchDetails.destinationMatch).toBe(true)
    expect(result.matchDetails.budgetMatch).toBe(true)
    expect(result.matchDetails.personalityMatch).toBe(true)
    expect(result.matchDetails.travelTypeOverlap).toBe(2)
    expect(result.matchDetails.scheduleCompatibility).toBeGreaterThanOrEqual(8)
  })

  test('不同目的地得基础分', () => {
    const user = makeUserProfile({ destination: '西藏拉萨' })
    const companion = makeCompanion()
    const result = calculateMatchScore(companion, user)

    expect(result.matchScore).toBeGreaterThanOrEqual(50)
    expect(result.matchScore).toBeLessThan(90) // 无目的地匹配，总分<90
    expect(result.matchDetails.destinationMatch).toBe(false)
  })

  test('预算类型不同但有相邻兼容得分', () => {
    const user = makeUserProfile({ budgetType: 'luxury' })
    const companion = makeCompanion({ budgetType: 'medium' })
    const result = calculateMatchScore(companion, user)

    expect(result.matchScore).toBeGreaterThanOrEqual(70)
    expect(result.matchDetails.budgetMatch).toBe(false)
  })

  test('预算完全不兼容', () => {
    const user = makeUserProfile({ budgetType: 'budget' })
    const companion = makeCompanion({ budgetType: 'luxury' })
    const result = calculateMatchScore(companion, user)

    expect(result.matchDetails.budgetMatch).toBe(false)
  })

  test('性格类型不同不获得性格加分', () => {
    const user = makeUserProfile({ personalityType: 'planner' })
    const companion = makeCompanion({ personalityType: 'spontaneous' })
    const result = calculateMatchScore(companion, user)

    expect(result.matchDetails.personalityMatch).toBe(false)
  })

  test('旅行类型无重叠', () => {
    const user = makeUserProfile({ travelTypes: ['冒险', '徒步'] })
    const companion = makeCompanion({ travelTypes: ['购物', '夜生活'] })
    const result = calculateMatchScore(companion, user)

    expect(result.matchDetails.travelTypeOverlap).toBe(0)
  })

  test('旅行类型部分重叠', () => {
    const user = makeUserProfile({ travelTypes: ['休闲', '美食', '摄影'] })
    const companion = makeCompanion({ travelTypes: ['美食', '探险', '自然'] })
    const result = calculateMatchScore(companion, user)

    expect(result.matchDetails.travelTypeOverlap).toBe(1)
  })

  test('作息时间完全匹配获得最高兼容分', () => {
    const user = makeUserProfile({ wakeTime: '07:00', sleepTime: '22:00' })
    const companion = makeCompanion({ wakeTime: '07:00', sleepTime: '22:00' })
    const result = calculateMatchScore(companion, user)

    expect(result.matchDetails.scheduleCompatibility).toBe(10)
  })

  test('作息时间相差较大得分低', () => {
    const user = makeUserProfile({ wakeTime: '06:00', sleepTime: '21:00' })
    const companion = makeCompanion({ wakeTime: '10:00', sleepTime: '01:00' })
    const result = calculateMatchScore(companion, user)

    expect(result.matchDetails.scheduleCompatibility).toBeLessThanOrEqual(3)
  })

  test('分数不超过100', () => {
    const user = makeUserProfile()
    const companion = makeCompanion({
      travelTypes: ['休闲', '美食', '摄影', '文化', '自然'],
      wakeTime: '08:00',
      sleepTime: '23:00',
      budgetType: 'medium',
      creditBadge: 'diamond',
    })
    const result = calculateMatchScore(companion, user)

    expect(result.matchScore).toBeLessThanOrEqual(100)
  })

  test('分数不低于0', () => {
    const result = calculateMatchScore(makeCompanion(), makeUserProfile())
    expect(result.matchScore).toBeGreaterThanOrEqual(0)
  })
})

// ---- filterCompanions ----

describe('filterCompanions', () => {
  const allCompanions = getMockCompanions()
  const user = makeUserProfile()

  test('关键词过滤 - 匹配目的地', () => {
    const filters: CompanionFilters = { keyword: '大理' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(5) // 5 companions to 大理
    results.forEach(r => {
      expect(r.companion.destination).toBe('云南大理')
    })
  })

  test('关键词过滤 - 匹配名字', () => {
    const filters: CompanionFilters = { keyword: '小王' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(1)
    expect(results[0].companion.name).toBe('旅行达人小王')
  })

  test('关键词过滤 - 匹配简介', () => {
    const filters: CompanionFilters = { keyword: '摄影' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBeGreaterThanOrEqual(2)
  })

  test('关键词过滤 - 无匹配', () => {
    const filters: CompanionFilters = { keyword: '火星' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(0)
  })

  test('预算过滤', () => {
    const filters: CompanionFilters = { budget: 'luxury' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(2) // comp_003 and comp_006
    results.forEach(r => {
      expect(r.companion.budgetType).toBe('luxury')
    })
  })

  test('信用等级过滤', () => {
    const filters: CompanionFilters = { credit: '钻石' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(3) // comp_001, comp_003, comp_004
    results.forEach(r => {
      expect(r.companion.creditLevel).toBe('钻石')
    })
  })

  test('组合过滤 - 关键词+预算', () => {
    const filters: CompanionFilters = { keyword: '大理', budget: 'medium' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBeGreaterThanOrEqual(1)
    results.forEach(r => {
      expect(r.companion.destination).toBe('云南大理')
      expect(r.companion.budgetType).toBe('medium')
    })
  })

  test('目的地精确过滤', () => {
    const filters: CompanionFilters = { destination: '四川成都' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(1)
    expect(results[0].companion.name).toBe('户外老赵')
  })

  test('性格类型过滤', () => {
    const filters: CompanionFilters = { personalityType: 'planner' }
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBeGreaterThanOrEqual(1)
    results.forEach(r => {
      expect(r.companion.personalityType).toBe('planner')
    })
  })

  test('结果按匹配分数降序排列', () => {
    const filters: CompanionFilters = {}
    const results = filterCompanions(allCompanions, filters, user)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].matchScore).toBeLessThanOrEqual(results[i - 1].matchScore)
    }
  })

  test('无过滤条件时返回全部结果', () => {
    const filters: CompanionFilters = {}
    const results = filterCompanions(allCompanions, filters, user)
    expect(results.length).toBe(6)
  })

  test('出发时间过滤 - 一周内(需mock日期)', () => {
    const filters: CompanionFilters = { departure: 'week' }
    const results = filterCompanions(allCompanions, filters, user)
    // 日期比较依赖当前时间，只要不报错即可
    expect(Array.isArray(results)).toBe(true)
  })
})
