import type { ExchangeRate, ExchangeResult } from '../../types'
import { exchangeRateData } from '../data/exchange.data'

// Free exchange rate API — no key required, data from European Central Bank
const FRANKFURTER_API = 'https://api.frankfurter.app'

function getApiUrl(): string {
  return import.meta.env.VITE_EXCHANGE_API_URL || FRANKFURTER_API
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Query real-time exchange rate.
 * Tries Frankfurter API first, falls back to mock data.
 */
export async function queryExchangeRateReal(params: {
  from: string
  to: string
  amount?: number
}): Promise<ExchangeResult> {
  const { from, to, amount = 1 } = params
  const baseUrl = getApiUrl()

  // Step 1: Try Frankfurter live API
  try {
    const res = await fetchWithTimeout(`${baseUrl}/latest?from=${from}&to=${to}`)
    if (res.ok) {
      const data = await res.json()
      const rate = data.rates?.[to]
      if (rate !== undefined) {
        return {
          from, to, amount,
          result: parseFloat((amount * rate).toFixed(6)),
          rate,
          date: data.date,
        }
      }
    }
  } catch {
    console.warn('[ExchangeAPI] Frankfurter unavailable, using mock fallback')
  }

  // Step 2: Fallback to mock data
  const baseData = exchangeRateData[from]
  if (!baseData) throw new Error(`Unsupported currency: ${from}`)

  const rate = baseData.rates[to]
  if (rate === undefined) throw new Error(`Unsupported currency: ${to}`)

  return {
    from, to, amount,
    result: parseFloat((amount * rate).toFixed(6)),
    rate,
    date: baseData.date,
  }
}

/**
 * Get all exchange rates for a base currency.
 * Tries Frankfurter API first, falls back to mock data.
 */
export async function getAllRatesReal(base: string): Promise<ExchangeRate> {
  const baseUrl = getApiUrl()

  // Step 1: Try Frankfurter live API
  try {
    const res = await fetchWithTimeout(`${baseUrl}/latest?from=${base}`)
    if (res.ok) {
      const data = await res.json()
      return {
        base: data.base,
        date: data.date,
        rates: data.rates,
      }
    }
  } catch {
    console.warn('[ExchangeAPI] Frankfurter unavailable for getAllRates, using mock fallback')
  }

  // Step 2: Fallback to mock data
  const mockData = exchangeRateData[base]
  if (!mockData) throw new Error(`Unsupported currency: ${base}`)

  return mockData
}
