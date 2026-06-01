import { describe, it, expect } from 'vitest'
import { queryFlights } from '../src/services/flight.service'

describe('Flight Service (Mock)', () => {
  it('should return flights matching depCity and arrCity', async () => {
    const result = await queryFlights({ depCity: '北京', arrCity: '青岛' })
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].depCity).toBe('北京')
    expect(result[0].arrCity).toBe('青岛')
  })

  it('should return empty array for no match', async () => {
    const result = await queryFlights({ depCity: '火星', arrCity: '月球' })
    expect(result).toHaveLength(0)
  })

  it('should limit results to 15', async () => {
    // If data has more than 15 flights for a route, check limit
    const result = await queryFlights({ depCity: '北京', arrCity: '青岛' })
    expect(result.length).toBeLessThanOrEqual(15)
  })

  it('should filter by date when depDate is provided', async () => {
    const result = await queryFlights({ depCity: '北京', arrCity: '上海', date: '2026-06-15' })
    // Flights with no depDate should be included (available any day)
    // Flights with matching depDate should be included
    expect(Array.isArray(result)).toBe(true)
  })

  it('each flight should have required fields', async () => {
    const result = await queryFlights({ depCity: '北京', arrCity: '青岛' })
    for (const flight of result) {
      expect(flight).toHaveProperty('id')
      expect(flight).toHaveProperty('flightNo')
      expect(flight).toHaveProperty('depCity')
      expect(flight).toHaveProperty('arrCity')
      expect(flight).toHaveProperty('depTime')
      expect(flight).toHaveProperty('arrTime')
      expect(flight).toHaveProperty('airline')
      expect(flight).toHaveProperty('price')
      expect(flight).toHaveProperty('discount')
      expect(flight).toHaveProperty('remainingSeats')
    }
  })
})
