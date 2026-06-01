import type { ExchangeRate, ExchangeResult } from '../../types'
import { exchangeRateData } from '../data/exchange.data'

export async function queryExchangeRate(params: {
  from: string
  to: string
  amount?: number
}): Promise<ExchangeResult> {
  const { from, to, amount = 1 } = params
  const baseData = exchangeRateData[from]

  if (!baseData) {
    throw new Error(`Unsupported base currency: ${from}`)
  }

  const rate = baseData.rates[to]
  if (rate === undefined) {
    throw new Error(`Unsupported target currency: ${to}`)
  }

  return {
    from,
    to,
    amount,
    result: parseFloat((amount * rate).toFixed(6)),
    rate,
    date: baseData.date
  }
}

export async function getAllRates(base: string): Promise<ExchangeRate> {
  const data = exchangeRateData[base]

  if (!data) {
    throw new Error(`Unsupported base currency: ${base}`)
  }

  return data
}
