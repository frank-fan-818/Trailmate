import type { ExchangeRate, ExchangeResult } from '../../types'
import { exchangeRateData } from '../data/exchange.data'

// Frankfurter API — 免费、无需密钥、全球可用
// 国内浏览器 → Vercel 代理 → Frankfurter (绕过墙)
const PROXY_API = '/api/exchange-proxy'

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
 * 查询实时汇率（Frankfurter → mock 降级）
 */
export async function queryExchangeRateReal(params: {
  from: string
  to: string
  amount?: number
}): Promise<ExchangeResult> {
  const { from, to, amount = 1 } = params

  // Step 1: Frankfurter 实时汇率
  try {
    const url = `${PROXY_API}?from=${from}&to=${to}`
    const res = await fetchWithTimeout(url)
    if (res.ok) {
      const data = await res.json()
      const rate = data.rates?.[to]
      if (rate !== undefined) {
        return { from, to, amount, result: parseFloat((amount * rate).toFixed(6)), rate, date: data.date }
      }
    }
  } catch {
    console.warn('[ExchangeAPI] Frankfurter unavailable, using mock fallback')
  }

  // Step 2: mock 降级
  const baseData = exchangeRateData[from]
  if (!baseData) throw new Error(`不支持的货币: ${from}`)

  const rate = baseData.rates[to]
  if (rate === undefined) throw new Error(`不支持的货币: ${to}`)

  return { from, to, amount, result: parseFloat((amount * rate).toFixed(6)), rate, date: baseData.date }
}

/**
 * 获取某货币对全部 31 种货币的汇率
 */
export async function getAllRatesReal(base: string): Promise<ExchangeRate> {
  // Step 1: Frankfurter 实时汇率
  try {
    const url = `${PROXY_API}?from=${base}`
    const res = await fetchWithTimeout(url)
    if (res.ok) {
      const data = await res.json()
      return { base: data.base, date: data.date, rates: data.rates }
    }
  } catch {
    console.warn('[ExchangeAPI] Frankfurter unavailable for getAllRates, using mock fallback')
  }

  // Step 2: mock 降级
  const mockData = exchangeRateData[base]
  if (!mockData) throw new Error(`不支持的货币: ${base}`)
  return mockData
}
