import { ref } from 'vue'

// 定义设置类型
export interface UserSettings {
  nickname: string
  bio: string
  budget: [number, number]
  travelTypes: string[]
  transports: string[]
  accommodations: string[]
  notifications: {
    itinerary: boolean
    context: boolean
    matching: boolean
  }
  darkMode: boolean
  language: 'zh' | 'en'
  privacy: {
    visibleInMatching: boolean
  }
}

// 全局状态
const settings = ref<UserSettings>({
  nickname: '旅行者',
  bio: '',
  budget: [3000, 10000],
  travelTypes: ['休闲'],
  transports: ['飞机'],
  accommodations: ['酒店'],
  notifications: {
    itinerary: true,
    context: true,
    matching: true
  },
  darkMode: false,
  language: 'zh',
  privacy: {
    visibleInMatching: true
  }
})

// 保存到本地存储
const saveSettings = () => {
  localStorage.setItem('trailmate-settings', JSON.stringify(settings.value))
}

// 从本地存储加载
const loadSettings = () => {
  const saved = localStorage.getItem('trailmate-settings')
  if (saved) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    } catch (e) {
      console.error('加载设置失败:', e)
    }
  }
}

// 初始化加载
loadSettings()

export function useSettings() {
  return {
    settings,
    saveSettings,
    loadSettings
  }
}
