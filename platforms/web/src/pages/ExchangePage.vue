<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-[1100px] mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span> <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">汇率查询</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-[1100px] mx-auto px-8 py-8">
      <!-- Converter -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
            <input v-model.number="amount" type="number" min="1"
              class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary" />
          </div>
          <div class="flex flex-col items-center gap-2">
            <button @click="swapCurrencies"
              class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg transition-colors">
              ⇄
            </button>
            <span class="text-xs text-gray-400">{{ rate ? (1 / rate).toFixed(4) : '...' }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">货币对</label>
            <div class="flex gap-2">
              <select v-model="fromCur"
                class="flex-1 px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary">
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.flag }} {{ c.code }} {{ c.name }}</option>
              </select>
              <select v-model="toCur"
                class="flex-1 px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary">
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.flag }} {{ c.code }} {{ c.name }}</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Result -->
        <div class="mt-6 p-6 bg-gray-50 rounded-xl text-center" v-if="rate">
          <p class="text-sm text-gray-500 mb-1">{{ amount || 1 }} {{ fromCur }} =</p>
          <p class="text-3xl font-bold text-gray-900">{{ converted.toFixed(2) }} {{ toCur }}</p>
          <p class="text-xs text-gray-400 mt-2">1 {{ fromCur }} = {{ rate }} {{ toCur }} · 更新于 {{ updateTime }}</p>
        </div>
      </div>

      <!-- Popular rates -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">常用汇率 (基准: {{ fromCur }})</h2>
        <div v-if="allRates" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div v-for="(val, code) in allRates" :key="code"
            class="p-3 bg-gray-50 rounded-xl text-center">
            <p class="text-xs text-gray-500">{{ code }}</p>
            <p class="text-sm font-semibold text-gray-900">{{ val.toFixed(4) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface CurrencyItem { code: string; name: string; flag: string }

const currencies: CurrencyItem[] = [
  { code: 'CNY', name: '人民币', flag: '🇨🇳' },
  { code: 'USD', name: '美元', flag: '🇺🇸' },
  { code: 'EUR', name: '欧元', flag: '🇪🇺' },
  { code: 'JPY', name: '日元', flag: '🇯🇵' },
  { code: 'GBP', name: '英镑', flag: '🇬🇧' },
  { code: 'KRW', name: '韩元', flag: '🇰🇷' },
  { code: 'THB', name: '泰铢', flag: '🇹🇭' },
  { code: 'AUD', name: '澳元', flag: '🇦🇺' },
  { code: 'SGD', name: '新币', flag: '🇸🇬' },
  { code: 'HKD', name: '港币', flag: '🇭🇰' }
]

const amount = ref(1)
const fromCur = ref('CNY')
const toCur = ref('USD')
const rate = ref<number | null>(null)
const allRates = ref<Record<string, number> | null>(null)
const updateTime = ref('')

const fetchRates = async (base: string) => {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`)
    const data = await res.json()
    allRates.value = data.rates
    rate.value = data.rates[toCur.value] || null
    updateTime.value = data.date
  } catch { /* silent */ }
}

const converted = computed(() => (amount.value || 1) * (rate.value || 0))

const swapCurrencies = () => {
  const tmp = fromCur.value
  fromCur.value = toCur.value
  toCur.value = tmp
}

watch([fromCur, toCur], ([from, to]) => {
  if (from && to) fetchRates(from)
})

onMounted(() => fetchRates(fromCur.value))
</script>
