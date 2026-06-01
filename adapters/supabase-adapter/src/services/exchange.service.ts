import { getSupabaseClient } from '../client'
import type { ExchangeRate, ExchangeResult } from '../../../../shared/types/exchange.types'

interface ExchangeRateRow {
  id: string
  base_currency: string
  target_currency: string
  rate: number
  rate_date: string
  source: string
  created_at: string
}

export async function queryExchangeRate(params: {
  from: string
  to: string
  amount?: number
}): Promise<ExchangeResult> {
  const supabase = getSupabaseClient()
  const { from, to, amount = 1 } = params

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate, rate_date')
    .eq('base_currency', from)
    .eq('target_currency', to)
    .order('rate_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Supabase汇率查询失败:', error)
    throw error
  }

  return {
    from,
    to,
    amount,
    result: parseFloat((amount * data.rate).toFixed(6)),
    rate: data.rate,
    date: data.rate_date
  }
}

export async function getAllRates(base: string): Promise<ExchangeRate> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('target_currency, rate, rate_date')
    .eq('base_currency', base)
    .order('rate_date', { ascending: false })
    .limit(31)

  if (error) {
    console.error('Supabase汇率批量查询失败:', error)
    throw error
  }

  const rows = (data ?? []) as Array<{ target_currency: string; rate: number; rate_date: string }>

  const rates: Record<string, number> = {}
  for (const row of rows) {
    rates[row.target_currency] = row.rate
  }

  return {
    base,
    date: rows[0]?.rate_date || new Date().toISOString().split('T')[0],
    rates
  }
}
