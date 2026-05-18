import { ref, watch } from 'vue'
import { marked } from 'marked'
import { useSettings } from '../stores/settings'

const { settings } = useSettings()

// ====== 地点详情抽屉 ======

interface PlaceInfo {
  name: string
  icon?: string
  category?: string
  rating?: string
  distance?: string
  description?: string
  address?: string
  openTime?: string
  ticket?: string
  content?: string
  city?: string
  province?: string
}

export function usePlaceDrawer() {
  const showPlaceDrawer = ref(false)
  const selectedPlace = ref<PlaceInfo | null>(null)
  const activePlaceTab = ref('detail')
  const weatherLoading = ref(false)
  const weatherInfo = ref<any>(null)

  const placeTabs = [
    { id: 'detail', label: '详情', icon: '🏛️' },
    { id: 'weather', label: '天气', icon: '🌤️' },
    { id: 'food', label: '美食', icon: '🍜' },
    { id: 'hotel', label: '住宿', icon: '🏨' },
    { id: 'tips', label: '提示', icon: '💡' }
  ]

  const mockFoods = ref([
    { emoji: '🍜', name: '老北京炸酱面', distance: '500m', price: '35', rating: '4.8' },
    { emoji: '🥟', name: '鼎香坊水饺', distance: '800m', price: '45', rating: '4.6' },
    { emoji: '🦆', name: '全聚德烤鸭', distance: '1.2km', price: '180', rating: '4.9' },
    { emoji: '🍲', name: '东来顺火锅', distance: '1.5km', price: '120', rating: '4.7' }
  ])

  const mockHotels = ref([
    { icon: '🏨', name: '格林豪泰酒店', type: '经济型', price: '180', rating: '4.2' },
    { icon: '🏩', name: '如家精选酒店', type: '舒适型', price: '280', rating: '4.5' },
    { icon: '🏨', name: '香格里拉大酒店', type: '豪华型', price: '680', rating: '4.8' }
  ])

  const getPlaceIcon = (type: string) => {
    if (!type) return '📍'
    if (type.includes('公园') || type.includes('景区') || type.includes('景点')) return '🏞️'
    if (type.includes('博物馆') || type.includes('纪念馆') || type.includes('展览')) return '🏛️'
    if (type.includes('寺庙') || type.includes('宫') || type.includes('殿') || type.includes('塔')) return '⛩️'
    if (type.includes('购物') || type.includes('商场')) return '🛍️'
    if (type.includes('美食') || type.includes('餐厅') || type.includes('餐馆')) return '🍜'
    if (type.includes('酒店') || type.includes('住宿') || type.includes('宾馆')) return '🏨'
    if (type.includes('大学') || type.includes('学校')) return '🏫'
    if (type.includes('医院')) return '🏥'
    if (type.includes('车站') || type.includes('机场')) return '🚉'
    return '📍'
  }

  const openPlaceDrawer = async (placeName: string) => {
    try {
      selectedPlace.value = {
        name: placeName,
        icon: '📍',
        category: '加载中...',
        description: '正在获取景点信息...'
      }
      showPlaceDrawer.value = true
      activePlaceTab.value = 'detail'

      const apiUrl = `/api/baidumap/place/v2/search?query=${encodeURIComponent(placeName)}&city=全国&ak=${import.meta.env.VITE_BAIDU_MAP_AK}&output=json&scope=2&page_size=1`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.status === 0 && data.results && data.results.length > 0) {
        const poi = data.results[0]
        let city = ''
        let province = ''
        if (poi.city) {
          city = poi.city
        } else if (poi.address) {
          const addrParts = poi.address.split(/\s+/)
          if (addrParts.length >= 2) {
            if (/省$/.test(addrParts[0])) {
              province = addrParts[0]
              city = addrParts[1]
            } else if (/市$/.test(addrParts[0])) {
              city = addrParts[0]
            }
          }
        }

        selectedPlace.value = {
          name: poi.name,
          icon: getPlaceIcon(poi.type),
          category: poi.type || '景点',
          rating: poi.detail_info?.overall_rating?.toString() || '4.5',
          distance: poi.address ? poi.address.split(' ')[0] || '市中心' : '市中心',
          description: poi.detail_info?.abstract || poi.address || '这是一个非常值得一去的景点。',
          address: poi.address || '地址信息暂无',
          openTime: poi.detail_info?.opening_hours || '09:00 - 18:00',
          ticket: poi.detail_info?.price?.toString() || '免费',
          city: city,
          province: province
        }
      } else {
        const mockPlace = getMockPlaceInfo(placeName)
        selectedPlace.value = { name: placeName, ...mockPlace }
      }
    } catch (error) {
      console.error('获取景点信息失败:', error)
      selectedPlace.value = {
        name: placeName,
        icon: '📍',
        category: '景点',
        rating: '暂无评分',
        distance: '市中心',
        description: '获取景点信息失败，请稍后重试',
        address: '地址信息暂无',
        openTime: '开放时间暂无',
        ticket: '门票信息暂无'
      }
    }
  }

  const closePlaceDrawer = () => {
    showPlaceDrawer.value = false
    selectedPlace.value = null
    weatherInfo.value = null
    weatherLoading.value = false
  }

  watch(activePlaceTab, async (newTab) => {
    if (newTab === 'weather' && selectedPlace.value && !weatherInfo.value) {
      await loadWeatherInfo(selectedPlace.value.name, selectedPlace.value.city)
    }
  })

  const loadWeatherInfo = async (placeName: string, city?: string) => {
    weatherLoading.value = true
    weatherInfo.value = null

    try {
      const cityName = city || extractCityName(placeName) || '北京市'
      const searchUrl = `/api/baidumap/weather/v1/?district=${encodeURIComponent(cityName)}&data_type=all&ak=${import.meta.env.VITE_BAIDU_MAP_AK}`
      const response = await fetch(searchUrl)
      const data = await response.json()

      if (data.status === 0 && data.result) {
        const { location, now, forecasts, indexes } = data.result
        weatherInfo.value = {
          city: location.city || location.name,
          updateTime: now.uptime ? now.uptime.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2-$3 $4:$5') : '最近更新',
          now: {
            temp: now.temp,
            feelsLike: now.feels_like,
            text: now.text,
            weatherIcon: getWeatherIcon(now.text),
            humidity: now.rh,
            windDir: now.wind_dir,
            windClass: now.wind_class,
            visibility: now.vis ? (parseInt(now.vis) / 1000).toFixed(1) : '未知'
          },
          forecasts: forecasts?.slice(0, 3).map((item: any) => ({
            date: item.date,
            week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][parseInt(item.week)],
            textDay: item.text_day, textNight: item.text_night,
            high: item.high, low: item.low,
            weatherIcon: getWeatherIcon(item.text_day)
          })) || [],
          indexes: indexes?.slice(0, 4).map((item: any) => ({
            name: item.name, brief: item.brief, detail: item.detail,
            icon: getIndexIcon(item.name)
          })) || []
        }
      } else {
        weatherInfo.value = buildMockWeather(cityName)
      }
    } catch (error) {
      console.error('获取天气失败:', error)
      weatherInfo.value = buildMockWeather(city || placeName)
    } finally {
      weatherLoading.value = false
    }
  }

  return {
    showPlaceDrawer, selectedPlace, activePlaceTab,
    weatherLoading, weatherInfo, placeTabs, mockFoods, mockHotels,
    openPlaceDrawer, closePlaceDrawer
  }
}

// ====== AI 对话与消息管理 ======

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  date: string
  messages: ChatMessage[]
}

export function useItineraryChat() {
  const chatHistory = ref<ChatSession[]>([])
  const currentSessionId = ref<string>('')
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const plans = ref<any[]>([])
  const aiResponse = ref('')
  const userInput = ref('')

  const loadHistoryFromStorage = () => {
    const saved = localStorage.getItem('trailmate-chat-history')
    if (saved) {
      try { chatHistory.value = JSON.parse(saved) } catch (e) {
        console.error('加载历史记录失败:', e)
      }
    }
  }

  const saveHistoryToStorage = () => {
    localStorage.setItem('trailmate-chat-history', JSON.stringify(chatHistory.value))
  }

  const clearHistory = () => {
    chatHistory.value = []
    messages.value = []
    currentSessionId.value = ''
    saveHistoryToStorage()
  }

  const loadChat = (chat: ChatSession) => {
    messages.value = chat.messages
    currentSessionId.value = chat.id
  }

  const saveCurrentChat = () => {
    if (messages.value.length === 0) return
    const title = messages.value[0]?.content?.slice(0, 30) || '新对话'
    const now = new Date()
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`

    if (currentSessionId.value) {
      const existing = chatHistory.value.find(c => c.id === currentSessionId.value)
      if (existing) {
        existing.messages = [...messages.value]
        existing.title = title
      }
    } else {
      const newChat: ChatSession = { id: `chat-${Date.now()}`, title, date: dateStr, messages: [...messages.value] }
      chatHistory.value.unshift(newChat)
      currentSessionId.value = newChat.id
      if (chatHistory.value.length > 20) {
        chatHistory.value = chatHistory.value.slice(0, 20)
      }
    }
    saveHistoryToStorage()
  }

  const startNewChat = () => {
    if (messages.value.length > 0) saveCurrentChat()
    messages.value = []
    currentSessionId.value = ''
    plans.value = []
    aiResponse.value = ''
  }

  const savePlansToStorage = (p: any[]) => {
    try {
      const existing = loadSavedPlans()
      const wrapped = p.map(plan => ({ ...plan, savedAt: Date.now() }))
      const merged = [...wrapped, ...existing.filter((e: any) => !wrapped.some(w => w.name === e.name))]
      localStorage.setItem('trailmate-saved-plans', JSON.stringify(merged.slice(0, 10)))
    } catch { /* silent */ }
  }

  const callOpenRouterAPI = async (messagesHistory: Array<{ role: 'user' | 'assistant', content: string }>) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string
    if (!apiKey) throw new Error('OpenRouter API Key 未配置')

    const userPreference = `用户偏好：
- 预算范围：¥${settings.value.budget[0]} - ¥${settings.value.budget[1]}
- 喜欢的旅行类型：${settings.value.travelTypes.join('、') || '无特别偏好'}
- 偏好的交通方式：${settings.value.transports.join('、') || '无特别偏好'}
- 偏好的住宿类型：${settings.value.accommodations.join('、') || '无特别偏好'}
- 语言：${settings.value.language === 'zh' ? '中文' : '英文'}
请严格按照用户偏好生成内容。`

    const isChinese = settings.value.language === 'zh'
    const systemPrompt = isChinese
      ? `【重要】你必须用中文回复所有内容。你是伴旅智能旅行助手，擅长规划旅行行程。

【强制输出规则 - 必须严格遵守】：
1. 所有景点、地标、酒店、餐厅等地点名称必须使用 [[地点名]] 格式包裹
   - ✅ 正确：去 [[故宫]] 参观，住在 [[如家酒店]]
   - ❌ 错误：去故宫参观，住在如家酒店
2. 所有注意事项必须使用 【提示内容】 格式
3. 在回复的最末尾，必须附上一个JSON格式的行程数据，格式如下：
\`\`\`json
{"plans":[{"name":"方案名称","description":"方案描述","totalDays":天数,"totalCost":总预算,"tags":["标签1","标签2"],"days":[{"day":1,"items":[{"type":"attraction|meal|hotel|transport|flight","name":"地点名","startTime":"08:00","endTime":"10:00","cost":费用,"address":"地址"}]}]}]}
\`\`\`
4. 不要使用其他格式来标注地点`
      : `【Important】You must respond in English. You are TrailMate, an intelligent travel assistant.

【Mandatory Output Rules】：
1. All place names must be wrapped in [[Place Name]] format
2. All tips must use 【Tip Content】 format`

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPreference },
      ...messagesHistory
    ]

    const response = await fetch(import.meta.env.VITE_OPENROUTER_API_URL as string, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'model': 'minimax/minimax-m2.5:free',
        'messages': fullMessages,
        'reasoning': { 'enabled': true }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (data.choices && Array.isArray(data.choices)) {
      return data.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题'
    }
    throw new Error('无法解析API响应')
  }

  const handleGenerate = async (input: string) => {
    if (!input) return
    isLoading.value = true
    plans.value = []

    try {
      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: input, timestamp: new Date() }
      messages.value.push(userMsg)

      const historyForApi = messages.value.map(msg => ({ role: msg.role, content: msg.content }))

      let response = ''
      let retryCount = 0
      const maxRetries = 2
      while (retryCount <= maxRetries) {
        try {
          response = await callOpenRouterAPI(historyForApi)
          break
        } catch (apiError) {
          retryCount++
          if (retryCount > maxRetries) throw apiError
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      const aiMsg: ChatMessage = { id: `ai-${Date.now()}`, role: 'assistant', content: response, timestamp: new Date() }
      messages.value.push(aiMsg)
      aiResponse.value = response
      saveCurrentChat()

      try {
        // 优先从 ```json 代码块中提取
        let jsonStr = ''
        const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1]
        } else {
          // 回退：从文本中匹配第一个完整 JSON 对象
          const jsonMatch = response.match(/\{[\s\S]*\}/)
          if (jsonMatch) jsonStr = jsonMatch[0]
        }
        if (jsonStr) {
          const result = JSON.parse(jsonStr)
          if (result.plans && Array.isArray(result.plans)) {
            plans.value = result.plans
            savePlansToStorage(result.plans)
          }
        }
      } catch (_) { /* 解析失败就展示文本回复 */ }
    } catch (error) {
      const err = error as any
      const errorMsg = err.message || '生成行程失败，请稍后重试'
      const aiMsg: ChatMessage = { id: `ai-${Date.now()}`, role: 'assistant', content: `抱歉，${errorMsg}`, timestamp: new Date() }
      messages.value.push(aiMsg)
      aiResponse.value = errorMsg
    } finally {
      isLoading.value = false
    }
  }

  const renderAIResponse = (content: string) => {
    content = content.replace(/\[\[([^\]]+)\]\]/g, (_match, placeName) => {
      return `<span class="place-name" data-place="${placeName.trim()}">📍 ${placeName.trim()}</span>`
    })
    content = content.replace(/【([^】]+)】/g, (_match, tipContent) => {
      return `<span class="ai-tip">💡 ${tipContent}</span>`
    })
    return marked(content) as string
  }

  const handlePlaceClick = (event: MouseEvent, onPlaceClick: (name: string) => void) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('place-name')) {
      const placeName = target.dataset.place
      if (placeName) onPlaceClick(placeName)
    }
  }

  loadHistoryFromStorage()

  return {
    messages, isLoading, plans, aiResponse, userInput,
    chatHistory, currentSessionId,
    loadChat, clearHistory, startNewChat, saveCurrentChat,
    handleGenerate, renderAIResponse, handlePlaceClick,
    saveHistoryToStorage
  }
}

/** 从 localStorage 读取已保存的行程计划 */
export function loadSavedPlans(): any[] {
  try {
    const raw = localStorage.getItem('trailmate-saved-plans')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ====== 辅助函数 ======

function getMockPlaceInfo(placeName: string): Partial<{
  icon: string; category: string; rating: string; distance: string;
  description: string; address: string; openTime: string; ticket: string; city: string
}> {
  const mockPlaces: Record<string, any> = {
    '故宫': { icon: '🏯', category: '历史古迹', rating: '4.9', distance: '北京市东城区', description: '北京故宫是中国明清两代的皇家宫殿，旧称紫禁城...', address: '北京市东城区景山前街4号', openTime: '08:30 - 17:00（周一闭馆）', ticket: '60', city: '北京市' },
    '颐和园': { icon: '🏞️', category: '皇家园林', rating: '4.8', distance: '北京市海淀区', description: '颐和园是中国清朝时期皇家园林...', address: '北京市海淀区新建宫门路19号', openTime: '06:30 - 18:00', ticket: '30', city: '北京市' },
    '天安门广场': { icon: '🇨🇳', category: '城市广场', rating: '4.7', distance: '北京市东城区', description: '天安门广场位于北京市中心...', address: '北京市东城区天安门广场', openTime: '全天开放', ticket: '免费', city: '北京市' },
    '八达岭长城': { icon: '🗼', category: '世界文化遗产', rating: '4.8', distance: '北京市延庆区', description: '八达岭长城位于北京市延庆区...', address: '北京市延庆区八达岭镇', openTime: '07:30 - 17:30', ticket: '40', city: '北京市' },
    '天坛': { icon: '⛩️', category: '祭祀场所', rating: '4.7', distance: '北京市东城区', description: '天坛公园在北京市南部...', address: '北京市东城区天坛东里甲1号', openTime: '06:00 - 22:00', ticket: '15', city: '北京市' },
    '南锣鼓巷': { icon: '🏮', category: '特色街区', rating: '4.6', distance: '北京市东城区', description: '南锣鼓巷是北京最古老的街区之一...', address: '北京市东城区南锣鼓巷胡同', openTime: '全天开放', ticket: '免费', city: '北京市' },
    '西湖': { icon: '🏞️', category: '自然风光', rating: '4.9', distance: '浙江省杭州市', description: '西湖位于浙江省杭州市西湖区...', address: '浙江省杭州市西湖区龙井路1号', openTime: '全天开放', ticket: '免费', city: '杭州市' },
    '东方明珠': { icon: '🗼', category: '现代建筑', rating: '4.7', distance: '上海市浦东新区', description: '东方明珠广播电视塔...', address: '上海市浦东新区世纪大道1号', openTime: '09:00 - 21:30', ticket: '199', city: '上海市' }
  }

  if (mockPlaces[placeName]) return mockPlaces[placeName]

  let extractedCity = ''
  const cityMatch = placeName.match(/([\u4e00-\u9fa5]+(?:市|州|盟|地区))/)
  if (cityMatch) extractedCity = cityMatch[1]
  else if (placeName.includes('北京')) extractedCity = '北京市'
  else if (placeName.includes('上海')) extractedCity = '上海市'
  else if (placeName.includes('广州')) extractedCity = '广州市'
  else if (placeName.includes('深圳')) extractedCity = '深圳市'
  else if (placeName.includes('杭州')) extractedCity = '杭州市'
  else if (placeName.includes('成都')) extractedCity = '成都市'
  else if (placeName.includes('重庆')) extractedCity = '重庆市'
  else if (placeName.includes('西安')) extractedCity = '西安市'

  return { icon: '📍', category: '景点', rating: '4.5', distance: '市中心', description: '这是一个非常值得一去的景点。', address: '当地', openTime: '09:00 - 18:00', ticket: '60', city: extractedCity }
}

function extractCityName(placeName: string): string | null {
  const cityMatch = placeName.match(/([\u4e00-\u9fa5]+(?:市|州|盟|地区))/)
  if (cityMatch) return cityMatch[1]
  if (placeName.includes('北京') || placeName.includes('故宫') || placeName.includes('八达岭') || placeName.includes('天安门') || placeName.includes('南锣鼓巷') || placeName.includes('天坛') || placeName.includes('颐和园')) return '北京市'
  if (placeName.includes('上海') || placeName.includes('东方明珠') || placeName.includes('外滩')) return '上海市'
  if (placeName.includes('杭州') || placeName.includes('西湖') || placeName.includes('灵隐寺')) return '杭州市'
  if (placeName.includes('成都') || placeName.includes('宽窄巷子') || placeName.includes('锦里')) return '成都市'
  if (placeName.includes('西安') || placeName.includes('兵马俑') || placeName.includes('大雁塔')) return '西安市'
  if (placeName.includes('重庆') || placeName.includes('洪崖洞') || placeName.includes('解放碑')) return '重庆市'
  if (placeName.includes('广州') || placeName.includes('广州塔') || placeName.includes('白云山')) return '广州市'
  if (placeName.includes('深圳') || placeName.includes('世界之窗') || placeName.includes('欢乐谷')) return '深圳市'
  return null
}

function getWeatherIcon(text: string) {
  if (/晴/.test(text)) return '☀️'
  if (/多云/.test(text)) return '☁️'
  if (/阴/.test(text)) return '☁️'
  if (/小雨|中雨|大雨|暴雨|雨/.test(text)) return '🌧️'
  if (/雷阵雨/.test(text)) return '⛈️'
  if (/雪/.test(text)) return '❄️'
  if (/雾|霾/.test(text)) return '🌫️'
  if (/风/.test(text)) return '💨'
  if (/沙/.test(text)) return '🌪️'
  return '🌤️'
}

function getIndexIcon(name: string) {
  if (/穿衣/.test(name)) return '👕'
  if (/感冒/.test(name)) return '🤧'
  if (/运动/.test(name)) return '🏃'
  if (/洗车/.test(name)) return '🚗'
  if (/紫外线/.test(name)) return '🧴'
  if (/晨练/.test(name)) return '🏋️'
  if (/旅游/.test(name)) return '🎒'
  return '💡'
}

function buildMockWeather(cityName: string) {
  return {
    city: cityName,
    updateTime: new Date().toLocaleTimeString(),
    now: { temp: '20', feelsLike: '18', text: '多云', weatherIcon: '☁️', humidity: '60', windDir: '东风', windClass: '2级', visibility: '10' },
    forecasts: [
      { week: '今天', textDay: '多云', high: '25', low: '18', weatherIcon: '☁️' },
      { week: '明天', textDay: '晴', high: '28', low: '20', weatherIcon: '☀️' },
      { week: '后天', textDay: '小雨', high: '22', low: '16', weatherIcon: '🌧️' }
    ],
    indexes: [
      { name: '穿衣指数', brief: '舒适', icon: '👕' },
      { name: '感冒指数', brief: '少发', icon: '🤧' },
      { name: '运动指数', brief: '适宜', icon: '🏃' },
      { name: '洗车指数', brief: '适宜', icon: '🚗' }
    ]
  }
}
