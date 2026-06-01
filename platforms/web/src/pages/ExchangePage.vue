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
        <!-- Quick select -->
        <div class="flex flex-wrap gap-2 mb-6">
          <span class="text-xs text-gray-500 self-center">常用货币：</span>
          <button v-for="c in popularCurrencies" :key="c.code"
            @click="fromCur = c.code"
            :class="['px-3 py-1.5 rounded-full text-xs font-medium transition-colors', fromCur === c.code ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
            {{ c.flag }} {{ c.code }}
          </button>
        </div>

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
          <p class="text-xs text-gray-400 mt-2">1 {{ fromCur }} = {{ rate.toFixed(4) }} {{ toCur }} · {{ updateTime }}</p>
        </div>
      </div>

      <!-- Rates grid -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">常用汇率 (基准: {{ fromCur }})</h2>
          <input v-model="searchQuery" placeholder="搜索货币代码或名称..."
            class="w-48 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary" />
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div v-for="i in 15" :key="i" class="p-3 bg-gray-50 rounded-xl animate-pulse">
            <div class="h-3 bg-gray-200 rounded w-12 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-10"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-500 mb-4">{{ error }}</p>
          <button @click="fetchRates(fromCur.value)"
            class="px-6 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
            重新加载
          </button>
        </div>

        <!-- Grid -->
        <div v-else-if="filteredCurrencyRates.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div v-for="item in filteredCurrencyRates" :key="item.code"
            class="p-3 bg-gray-50 rounded-xl text-center cursor-pointer hover:bg-gray-100 transition-colors"
            @click="toCur = item.code">
            <p class="text-xs text-gray-500">{{ item.flag }} {{ item.code }}</p>
            <p class="text-xs text-gray-400 truncate">{{ item.name }}</p>
            <p class="text-sm font-semibold text-gray-900 mt-1">{{ item.rate !== null ? item.rate.toFixed(4) : '-' }}</p>
          </div>
        </div>

        <!-- No results -->
        <div v-else class="text-center py-8 text-gray-400 text-sm">
          未找到匹配的货币
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExchangeRate } from '../composables/useExchangeRate'
import { useTrailmateCore } from '../composables/use-trailmate-core'

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
  { code: 'HKD', name: '港币', flag: '🇭🇰' },
  { code: 'CAD', name: '加元', flag: '🇨🇦' },
  { code: 'CHF', name: '瑞士法郎', flag: '🇨🇭' },
  { code: 'SEK', name: '瑞典克朗', flag: '🇸🇪' },
  { code: 'NZD', name: '新西兰元', flag: '🇳🇿' },
  { code: 'MXN', name: '墨西哥比索', flag: '🇲🇽' },
  { code: 'BRL', name: '巴西雷亚尔', flag: '🇧🇷' },
  { code: 'INR', name: '印度卢比', flag: '🇮🇳' },
  { code: 'RUB', name: '俄罗斯卢布', flag: '🇷🇺' },
  { code: 'ZAR', name: '南非兰特', flag: '🇿🇦' },
  { code: 'TRY', name: '土耳其里拉', flag: '🇹🇷' },
  { code: 'SAR', name: '沙特里亚尔', flag: '🇸🇦' },
  { code: 'AED', name: '阿联酋迪拉姆', flag: '🇦🇪' },
  { code: 'MYR', name: '马来西亚林吉特', flag: '🇲🇾' },
  { code: 'PHP', name: '菲律宾比索', flag: '🇵🇭' },
  { code: 'IDR', name: '印尼盾', flag: '🇮🇩' },
  { code: 'VND', name: '越南盾', flag: '🇻🇳' },
  { code: 'TWD', name: '新台币', flag: '🇹🇼' },
  { code: 'MOP', name: '澳门元', flag: '🇲🇴' },
  { code: 'PLN', name: '波兰兹罗提', flag: '🇵🇱' },
  { code: 'DKK', name: '丹麦克朗', flag: '🇩🇰' },
  { code: 'NOK', name: '挪威克朗', flag: '🇳🇴' }
]

const popularCurrencies: CurrencyItem[] = [
  { code: 'CNY', name: '人民币', flag: '🇨🇳' },
  { code: 'USD', name: '美元', flag: '🇺🇸' },
  { code: 'EUR', name: '欧元', flag: '🇪🇺' },
  { code: 'JPY', name: '日元', flag: '🇯🇵' },
  { code: 'GBP', name: '英镑', flag: '🇬🇧' },
  { code: 'KRW', name: '韩元', flag: '🇰🇷' },
  { code: 'THB', name: '泰铢', flag: '🇹🇭' },
  { code: 'HKD', name: '港币', flag: '🇭🇰' }
]

const amount = ref(1)
const fromCur = ref('CNY')
const toCur = ref('USD')
const searchQuery = ref('')

// Use exchange rate composable with core service integration
const { queryExchangeRate, getAllExchangeRates } = useTrailmateCore()
const { rates: allRates, loading, error, updateTime, fetchRates } = useExchangeRate({
  queryService: queryExchangeRate,
  getAllRatesService: getAllExchangeRates,
})

// Computed rate for the selected currency pair
const rate = computed(() => {
  if (!allRates.value) return null
  return allRates.value[toCur.value] ?? null
})

const currencyRates = computed(() => {
  if (!allRates.value) return []
  return currencies.map(c => ({
    ...c,
    rate: allRates.value?.[c.code] ?? null
  }))
})

const filteredCurrencyRates = computed(() => {
  if (!searchQuery.value) return currencyRates.value
  const q = searchQuery.value.toLowerCase()
  return currencyRates.value.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.name.includes(q)
  )
})

const converted = computed(() => (amount.value || 1) * (rate.value || 0))

const swapCurrencies = () => {
  const tmp = fromCur.value
  fromCur.value = toCur.value
  toCur.value = tmp
}

watch([fromCur, toCur], ([from]) => {
  if (from) fetchRates(from)
})

onMounted(() => {
  fetchRates(fromCur.value)
})
</script>
