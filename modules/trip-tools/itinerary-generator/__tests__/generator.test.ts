import { describe, test, expect } from 'vitest'
import { generatePlans } from '../src/generator'
import type { ItineraryRequest } from '../src/types'

describe('行程生成器单元测试', () => {
  const mockRequest: ItineraryRequest = {
    id: 'test_req_001',
    userId: 'user_123',
    content: '带孩子去青岛玩4天，要沙滩、人少',
    createTime: Date.now()
  }

  test('应生成至少2套不同侧重点的行程方案', () => {
    const plans = generatePlans(mockRequest)
    expect(plans.length).toBe(2)
    expect(plans[0].tags).toContain('亲子')
    expect(plans[0].tags).toContain('少步行')
    expect(plans[1].tags).toContain('探索')
    expect(plans[1].tags).toContain('打卡')
    expect(plans[0].name).not.toBe(plans[1].name)
  })

  test('生成的行程时间逻辑应自洽，无时间冲突', () => {
    const plans = generatePlans(mockRequest)
    plans.forEach(plan => {
      plan.days.forEach(day => {
        for (let i = 1; i < day.items.length; i++) {
          const prevEnd = timeToMinutes(day.items[i - 1].endTime)
          const currStart = timeToMinutes(day.items[i].startTime)
          expect(currStart).toBeGreaterThanOrEqual(prevEnd)
        }
      })
    })
  })

  test('行程总花费计算应准确', () => {
    const plans = generatePlans(mockRequest)
    plans.forEach(plan => {
      const calculatedCost = plan.days.reduce((total, day) => {
        return total + day.items.reduce((dayTotal, item) => dayTotal + item.cost, 0)
      }, 0)
      expect(plan.totalCost).toBeGreaterThanOrEqual(calculatedCost)
    })
  })

  test('亲子方案应包含适合儿童的景点', () => {
    const plans = generatePlans(mockRequest)
    const familyPlan = plans.find(p => p.tags.includes('亲子'))
    expect(familyPlan).toBeDefined()
    const hasKidFriendlyAttraction = familyPlan?.days.some(day =>
      day.items.some(item =>
        item.type === 'attraction' && (item.name.includes('海洋') || item.name.includes('沙滩'))
      )
    )
    expect(hasKidFriendlyAttraction).toBe(true)
  })
})

/**
 * 时间字符串转分钟数，用于比较
 */
function timeToMinutes(timeStr: string): number {
  const [hour, minute] = timeStr.split(':').map(Number)
  return hour * 60 + minute
}
