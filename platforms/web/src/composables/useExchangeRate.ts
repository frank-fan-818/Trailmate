import { ref, readonly } from 'vue'

interface UseExchangeRateOptions {
  queryService?: (from: string, to: string, amount?: number) => Promise<{
    rate: number; result: number; date: string
  }>
  getAllRatesService?: (base: string) => Promise<{
    base: string; date: string; rates: Record<string, number>
  }>
}

export function useExchangeRate(options?: UseExchangeRateOptions) {
  const rates = ref<Record<string, number>>({})
  const baseCurrency = ref('CNY')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const updateTime = ref('')

  async function fetchRates(base: string = 'CNY'): Promise<void> {
    if (!options?.getAllRatesService) return

    loading.value = true
    error.value = null
    try {
      const result = await options.getAllRatesService(base)
      rates.value = result.rates
      baseCurrency.value = result.base
      updateTime.value = result.date
    } catch (e: any) {
      error.value = e.message || '获取汇率失败'
    } finally {
      loading.value = false
    }
  }

  async function convert(from: string, to: string, amount: number) {
    if (!options?.queryService) return null

    loading.value = true
    error.value = null
    try {
      return await options.queryService(from, to, amount)
    } catch (e: any) {
      error.value = e.message || '转换失败'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    rates: readonly(rates),
    baseCurrency: readonly(baseCurrency),
    loading: readonly(loading),
    error: readonly(error),
    updateTime: readonly(updateTime),
    fetchRates,
    convert,
  }
}
