import { describe, it, expect } from 'vitest'
import { SUPPORTED_CURRENCIES } from '../exchange.types'

describe('Exchange Types', () => {
  it('SUPPORTED_CURRENCIES should have at least 30 currencies', () => {
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(30)
  })

  it('each currency should have required fields', () => {
    for (const currency of SUPPORTED_CURRENCIES) {
      expect(currency).toHaveProperty('code')
      expect(currency).toHaveProperty('name')
      expect(currency).toHaveProperty('flag')
      expect(currency).toHaveProperty('symbol')
      expect(currency.code.length).toBe(3)
    }
  })

  it('should include major currencies', () => {
    const codes = SUPPORTED_CURRENCIES.map(c => c.code)
    expect(codes).toContain('CNY')
    expect(codes).toContain('USD')
    expect(codes).toContain('EUR')
    expect(codes).toContain('JPY')
    expect(codes).toContain('GBP')
    expect(codes).toContain('HKD')
  })

  it('should have unique currency codes', () => {
    const codes = SUPPORTED_CURRENCIES.map(c => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})
