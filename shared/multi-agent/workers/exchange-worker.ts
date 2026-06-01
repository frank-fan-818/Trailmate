import type { StructuredLogger } from '../../utils/logger'
import type { ExchangeQueryInput, ExchangeQueryOutput } from '../types'
import { BaseWorker } from '../base-worker'

const MOCK_RATES: Record<string, Record<string, number>> = {
  CNY: { CNY: 1, USD: 0.138, EUR: 0.127, JPY: 18.95, GBP: 0.109, KRW: 189.5, THB: 5.05, AUD: 0.208, SGD: 0.187, HKD: 1.08 },
  USD: { CNY: 7.25, USD: 1, EUR: 0.92, JPY: 137.5, GBP: 0.79, KRW: 1375, THB: 36.6, AUD: 1.51, SGD: 1.36, HKD: 7.83 },
  EUR: { CNY: 7.88, USD: 1.09, EUR: 1, JPY: 149.5, GBP: 0.86, KRW: 1495, THB: 39.8, AUD: 1.64, SGD: 1.48, HKD: 8.51 },
  JPY: { CNY: 0.053, USD: 0.0073, EUR: 0.0067, JPY: 1, GBP: 0.0058, KRW: 10.0, THB: 0.27, AUD: 0.011, SGD: 0.0099, HKD: 0.057 },
  GBP: { CNY: 9.17, USD: 1.27, EUR: 1.16, JPY: 172.5, GBP: 1, KRW: 1737, THB: 46.3, AUD: 1.91, SGD: 1.72, HKD: 9.91 },
  KRW: { CNY: 0.0053, USD: 0.00073, EUR: 0.00067, JPY: 0.10, GBP: 0.00058, KRW: 1, THB: 0.027, AUD: 0.0011, SGD: 0.00099, HKD: 0.0057 },
  THB: { CNY: 0.20, USD: 0.027, EUR: 0.025, JPY: 3.75, GBP: 0.022, KRW: 37.5, THB: 1, AUD: 0.041, SGD: 0.037, HKD: 0.21 },
  AUD: { CNY: 4.81, USD: 0.66, EUR: 0.61, JPY: 90.0, GBP: 0.52, KRW: 909, THB: 24.2, AUD: 1, SGD: 0.90, HKD: 5.19 },
  SGD: { CNY: 5.35, USD: 0.74, EUR: 0.68, JPY: 101.0, GBP: 0.58, KRW: 1010, THB: 27.0, AUD: 1.11, SGD: 1, HKD: 5.78 },
  HKD: { CNY: 0.93, USD: 0.13, EUR: 0.12, JPY: 17.5, GBP: 0.10, KRW: 175, THB: 4.67, AUD: 0.19, SGD: 0.17, HKD: 1 },
}

export class ExchangeWorker extends BaseWorker<ExchangeQueryInput, ExchangeQueryOutput> {
  readonly name = 'exchange-worker'

  protected async execute(input: ExchangeQueryInput, log: StructuredLogger): Promise<ExchangeQueryOutput> {
    const { fromCurrency, toCurrency, amount } = input

    const baseRates = MOCK_RATES[fromCurrency]
    if (!baseRates) {
      // Default to USD if source currency not in mock data
      const usdRates = MOCK_RATES.USD
      const rate = usdRates[toCurrency] ?? 1
      const result = amount * rate

      log.step(this.name, `converted ${amount} ${fromCurrency} to ${result.toFixed(2)} ${toCurrency} (via USD fallback)`, {
        from: fromCurrency,
        to: toCurrency,
        amount,
        rate,
        result
      })

      return { rate, result, fromCurrency, toCurrency, date: new Date().toISOString().split('T')[0] }
    }

    const rate = baseRates[toCurrency]
    if (rate === undefined) {
      // If target not found, assume 1:1
      log.step(this.name, `rate not found for ${fromCurrency}->${toCurrency}, assuming 1:1`, {
        from: fromCurrency,
        to: toCurrency
      })
      return { rate: 1, result: amount, fromCurrency, toCurrency, date: new Date().toISOString().split('T')[0] }
    }

    const result = parseFloat((amount * rate).toFixed(6))

    log.step(this.name, `converted ${amount} ${fromCurrency} to ${result} ${toCurrency}`, {
      from: fromCurrency,
      to: toCurrency,
      amount,
      rate,
      result
    })

    return { rate, result, fromCurrency, toCurrency, date: new Date().toISOString().split('T')[0] }
  }
}
