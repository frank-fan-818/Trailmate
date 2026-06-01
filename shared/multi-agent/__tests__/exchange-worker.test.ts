import { describe, it, expect } from 'vitest'
import { ExchangeWorker } from '../workers/exchange-worker'

describe('ExchangeWorker', () => {
  const worker = new ExchangeWorker()

  it('should have name exchange-worker', () => {
    expect(worker.name).toBe('exchange-worker')
  })

  it('should convert CNY to USD', async () => {
    const result = await worker.run(
      { fromCurrency: 'CNY', toCurrency: 'USD', amount: 100 },
      'test-trace-1'
    )
    expect(result.type).toBe('result')
    expect(result.payload.fromCurrency).toBe('CNY')
    expect(result.payload.toCurrency).toBe('USD')
    expect(result.payload.rate).toBeGreaterThan(0)
    expect(result.payload.result).toBeGreaterThan(0)
  })

  it('should return 1 for same currency', async () => {
    const result = await worker.run(
      { fromCurrency: 'CNY', toCurrency: 'CNY', amount: 100 },
      'test-trace-2'
    )
    expect(result.payload.rate).toBe(1)
    expect(result.payload.result).toBe(100)
  })

  it('should return valid agent message structure', async () => {
    const result = await worker.run(
      { fromCurrency: 'USD', toCurrency: 'EUR', amount: 50 },
      'test-trace-3'
    )
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('type')
    expect(result).toHaveProperty('from', 'exchange-worker')
    expect(result).toHaveProperty('to', 'orchestrator')
    expect(result).toHaveProperty('correlationId', 'test-trace-3')
    expect(result).toHaveProperty('timestamp')
  })

  it('should handle unsupported currency', async () => {
    const result = await worker.run(
      { fromCurrency: 'XXX', toCurrency: 'USD', amount: 100 },
      'test-trace-4'
    )
    expect(result.type).toBe('error')
  })
})
