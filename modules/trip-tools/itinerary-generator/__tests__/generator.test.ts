import { describe, expect, test } from 'vitest'
import { generatePlans } from '../src/generator'
import type { ItineraryRequest } from '../src/types'

describe('itinerary generator', () => {
  const request: ItineraryRequest = {
    id: 'test-request',
    userId: 'user-123',
    content: 'Plan a family trip to Qingdao',
    createTime: Date.now()
  }

  test('generates two distinct plan variants', () => {
    const plans = generatePlans(request)

    expect(plans).toHaveLength(2)
    expect(plans[0].name).not.toBe(plans[1].name)
    expect(plans[0].tags).toContain('family')
    expect(plans[1].tags).toContain('explore')
  })

  test('keeps day schedules chronological without overlaps', () => {
    const plans = generatePlans(request)

    plans.forEach((plan) => {
      plan.days.forEach((day) => {
        for (let index = 1; index < day.items.length; index += 1) {
          const previousEnd = timeToMinutes(day.items[index - 1].endTime)
          const currentStart = timeToMinutes(day.items[index].startTime)
          expect(currentStart).toBeGreaterThanOrEqual(previousEnd)
        }
      })
    })
  })

  test('uses timeline-compatible item types', () => {
    const plans = generatePlans(request)
    const validTypes = new Set(['flight', 'hotel', 'attraction', 'meal', 'transport'])

    plans.forEach((plan) => {
      plan.days.forEach((day) => {
        day.items.forEach((item) => {
          expect(validTypes.has(item.type)).toBe(true)
        })
      })
    })
  })

  test('keeps total cost in sync with item sums', () => {
    const plans = generatePlans(request)

    plans.forEach((plan) => {
      const calculatedCost = plan.days.reduce((planTotal, day) => {
        return planTotal + day.items.reduce((dayTotal, item) => dayTotal + item.cost, 0)
      }, 0)

      expect(plan.totalCost).toBe(calculatedCost)
    })
  })

  test('family plan keeps beach or ocean highlights', () => {
    const familyPlan = generatePlans(request).find((plan) => plan.tags.includes('family'))

    expect(familyPlan).toBeDefined()
    expect(
      familyPlan?.days.some((day) =>
        day.items.some((item) =>
          item.type === 'attraction' &&
          (item.name.toLowerCase().includes('beach') || item.name.toLowerCase().includes('ocean'))
        )
      )
    ).toBe(true)
  })
})

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}
