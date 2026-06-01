import type { ExchangeRate } from '../../types'

export const exchangeRateData: Record<string, ExchangeRate> = {
  CNY: {
    base: 'CNY',
    date: '2026-06-01',
    rates: {
      CNY: 1, USD: 0.138, EUR: 0.127, JPY: 18.95, GBP: 0.109,
      KRW: 189.5, THB: 5.05, AUD: 0.208, SGD: 0.187, HKD: 1.08,
      CAD: 0.188, CHF: 0.124, SEK: 1.45, NZD: 0.226, MXN: 2.47,
      BRL: 0.704, INR: 11.52, RUB: 12.45, ZAR: 2.52, TRY: 4.48,
      SAR: 0.518, AED: 0.507, MYR: 0.645, PHP: 7.98, IDR: 2265,
      VND: 3515, TWD: 4.47, MOP: 1.11, PLN: 0.546, DKK: 0.947, NOK: 1.48
    }
  }
}

// Generate rates for all other currencies using cross-rate calculation
function generateCrossRates(): void {
  const cnyRates = exchangeRateData.CNY.rates
  for (const code of Object.keys(cnyRates)) {
    if (code === 'CNY') continue
    const baseRate = cnyRates[code]
    const rates: Record<string, number> = {}
    for (const [targetCode, targetRate] of Object.entries(cnyRates)) {
      rates[targetCode] = targetRate / baseRate
    }
    exchangeRateData[code] = {
      base: code,
      date: '2026-06-01',
      rates
    }
  }
}

generateCrossRates()
