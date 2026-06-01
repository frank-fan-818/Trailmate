import { describe, it, expect } from 'vitest'
import { FlightWorker } from '../workers/flight-worker'

describe('FlightWorker', () => {
  const worker = new FlightWorker()

  it('should have name flight-worker', () => {
    expect(worker.name).toBe('flight-worker')
  })

  it('should return flights for known destination within budget', async () => {
    const result = await worker.run(
      { destination: '北京', date: '2026-06-01', budget: 1000 },
      'test-trace-1'
    )
    expect(result.type).toBe('result')
    expect(result.payload.flights.length).toBeGreaterThan(0)
    expect(result.payload.totalCount).toBeGreaterThan(0)
  })

  it('should filter flights by budget', async () => {
    const result = await worker.run(
      { destination: '北京', date: '2026-06-01', budget: 200 },
      'test-trace-2'
    )
    expect(result.type).toBe('result')
    // Should return at least one flight even if all are over budget (fallback)
    expect(result.payload.flights.length).toBeGreaterThan(0)
  })

  it('should handle unknown destination with default flights', async () => {
    const result = await worker.run(
      { destination: '火星', date: '2026-06-01', budget: 5000 },
      'test-trace-3'
    )
    expect(result.type).toBe('result')
    expect(result.payload.flights.length).toBeGreaterThan(0)
    expect(result.payload.flights[0].arrCity).toBe('火星')
  })

  it('should return valid agent message structure', async () => {
    const result = await worker.run(
      { destination: '上海', date: '2026-06-01', budget: 1000 },
      'test-trace-4'
    )
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('type')
    expect(result).toHaveProperty('from', 'flight-worker')
    expect(result).toHaveProperty('to', 'orchestrator')
    expect(result).toHaveProperty('payload')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('correlationId', 'test-trace-4')
  })
})
