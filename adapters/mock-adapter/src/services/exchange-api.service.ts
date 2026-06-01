import type { ExchangeRate, ExchangeResult } from '../../types'
import { exchangeRateData } from '../data/exchange.data'

// 新浪财经汇率接口 — 免费、无需密钥、国内服务器直接访问
const SINA_API = 'https://hq.sinajs.cn/list='

// 新浪支持的货币代码 → fx symbol
function toSinaSymbol(code: string): string {
  return `fx_s${code.toLowerCase()}cny`
}

// 解析新浪返回格式：
// var hq_str_fx_susdcny="日期,开盘价,昨收价,最新价,最高价,最低价,买入价,卖出价,名称,更新时间";
function parseSinaResponse(text: string): Record<string, { rate: number; date: string }> {
  const result: Record<string, { rate: number; date: string }> = {}
  // 匹配 var hq_str_fx_sXXXcny="...";
  const regex = /fx_s(\w+?)cny="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    const code = match[1].toUpperCase()
    const parts = match[2].split(',')
    const rate = parseFloat(parts[3]) // 最新价
    const date = parts[0]             // 日期
    if (!isNaN(rate) && rate > 0) {
      result[code] = { rate, date }
    }
  }
  return result
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

// 所有支持的货币（需查 CNY 对它们的汇率）
const ALL_CURRENCIES = [
  'USD', 'EUR', 'JPY', 'GBP', 'HKD', 'AUD', 'CAD', 'CHF', 'SGD',
  'KRW', 'THB', 'NZD', 'MYR', 'PHP', 'IDR', 'VND', 'RUB', 'ZAR',
  'BRL', 'INR', 'TRY', 'SAR', 'AED', 'MOP', 'TWD', 'PLN', 'DKK',
  'NOK', 'SEK', 'MXN',
]

/**
 * 批量从新浪获取所有货币对 CNY 的汇率
 */
async function fetchSinaRates(codes: string[]): Promise<{ rates: Record<string, number>; date: string }> {
  const symbols = codes.map(toSinaSymbol).join(',')
  const res = await fetchWithTimeout(`${SINA_API}${symbols}`)
  if (!res.ok) throw new Error(`Sina API returned ${res.status}`)
  const text = await res.text()
  const parsed = parseSinaResponse(text)

  const rates: Record<string, number> = { CNY: 1 }
  let date = new Date().toISOString().slice(0, 10)

  for (const code of codes) {
    const entry = parsed[code]
    if (entry) {
      rates[code] = entry.rate
      date = entry.date
    }
  }

  return { rates, date }
}

// 新浪返回的汇率含义：1 外币 = X CNY（如 1 USD = 7.24 CNY）
// cnyRates[code] = "1 单位 code 等于多少 CNY"
// 通用交叉汇率公式：X → Y 的汇率 = cnyRates[X] / cnyRates[Y]
// 例：USD→EUR = 7.24 / 7.89 = 0.918（1 USD = 0.918 EUR）
function calcCrossRate(cnyRates: Record<string, number>, from: string, to: string): number {
  return cnyRates[from] / cnyRates[to]
}

/**
 * 查询实时汇率（新浪财经 → mock 降级）
 */
export async function queryExchangeRateReal(params: {
  from: string
  to: string
  amount?: number
}): Promise<ExchangeResult> {
  const { from, to, amount = 1 } = params

  // Step 1: 新浪财经实时汇率
  try {
    const neededCodes = [from, to].filter(c => c !== 'CNY')
    const { rates: cnyRates, date } = await fetchSinaRates(neededCodes)

    if (cnyRates[from] !== undefined || from === 'CNY') {
      const rate = calcCrossRate(cnyRates, from, to)
      return { from, to, amount, result: parseFloat((amount * rate).toFixed(6)), rate, date }
    }
  } catch {
    console.warn('[ExchangeAPI] Sina API unavailable, using mock fallback')
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
  // Step 1: 新浪财经实时汇率
  try {
    const { rates: cnyRates, date } = await fetchSinaRates(ALL_CURRENCIES)

    const rates: Record<string, number> = { [base]: 1 }
    for (const code of Object.keys(cnyRates)) {
      if (code === base) continue
      rates[code] = cnyRates[base] / cnyRates[code]
    }
    return { base, date, rates }
  } catch {
    console.warn('[ExchangeAPI] Sina API unavailable for getAllRates, using mock fallback')
  }

  // Step 2: mock 降级
  const mockData = exchangeRateData[base]
  if (!mockData) throw new Error(`不支持的货币: ${base}`)
  return mockData
}
