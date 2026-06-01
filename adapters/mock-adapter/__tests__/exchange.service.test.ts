import { describe, it, expect } from 'vitest'

describe('Exchange Service (Mock)', () => {
  it('should convert CNY to USD correctly', async () => {
    // Dynamic import to handle potential module resolution
    const { queryExchangeRate } = await import('../src/services/exchange.service')
    const result = await queryExchangeRate({ from: 'CNY', to: 'USD', amount: 100 })
    expect(result).toHaveProperty('from', 'CNY')
    expect(result).toHaveProperty('to', 'USD')
    expect(result).toHaveProperty('rate')
    expect(result).toHaveProperty('result')
    expect(result.rate).toBeGreaterThan(0)
    expect(result.result).toBeGreaterThan(0)
  })

  it('should return 1:1 rate for same currency', async () => {
    const { queryExchangeRate } = await import('../src/services/exchange.service')
    const result = await queryExchangeRate({ from: 'CNY', to: 'CNY', amount: 100 })
    expect(result.rate).toBe(1)
    expect(result.result).toBe(100)
  })

  it('should return all rates for a base currency', async () => {
    const { getAllRates } = await import('../src/services/exchange.service')
    const result = await getAllRates('CNY')
    expect(result).toHaveProperty('base', 'CNY')
    expect(result).toHaveProperty('rates')
    expect(result.rates).toHaveProperty('USD')
    expect(result.rates).toHaveProperty('EUR')
    expect(result.rates).toHaveProperty('JPY')
  })

  it('should default amount to 1 if not provided', async () => {
    const { queryExchangeRate } = await import('../src/services/exchange.service')
    const result = await queryExchangeRate({ from: 'CNY', to: 'USD' })
    expect(result.result).toBe(result.rate)
  })

  it('should handle unsupported currency gracefully', async () => {
    const { queryExchangeRate } = await import('../src/services/exchange.service')
    await expect(
      queryExchangeRate({ from: 'XXX', to: 'USD' })
    ).rejects.toThrow()
  })
})
