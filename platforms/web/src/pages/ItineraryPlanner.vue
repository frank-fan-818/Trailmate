<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between fixed top-0 left-0 right-0 z-20">
      <button
        @click="$emit('back')"
        class="flex items-center gap-2 h-full px-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span class="text-xl">←</span>
        <span>返回</span>
      </button>

      <h1 class="text-xl font-bold text-gray-900 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">智能行程规划</h1>

      <div class="flex items-center gap-2 h-full px-2">
        <button
          @click="startNewChat"
          class="flex items-center gap-2 px-4 py-2 h-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span class="text-xl">➕</span>
          <span class="hidden sm:inline">新对话</span>
        </button>
        <button
          @click="showHistorySidebar = true"
          class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>📋</span>
          <span class="hidden sm:inline">历史记录</span>
        </button>
      </div>
    </header>

    <!-- 历史记录侧边栏 -->
    <Teleport to="body">
      <div
        v-if="showHistorySidebar"
        class="fixed inset-0 z-50"
        @click.self="showHistorySidebar = false"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/30" @click="showHistorySidebar = false" />

        <!-- 侧边栏 -->
        <div class="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-hidden flex flex-col">
          <!-- 侧边栏头部 -->
          <div class="h-16 px-4 flex items-center justify-between border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">对话历史</h2>
            <button
              @click="showHistorySidebar = false"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- 清空按钮 -->
          <div class="px-4 py-3 border-b border-gray-100">
            <button
              @click="clearHistory"
              class="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              🗑️ 清空所有历史
            </button>
          </div>

          <!-- 历史列表 -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="chatHistory.length === 0" class="p-4 text-center text-gray-500">
              暂无历史对话
            </div>
            <div
              v-for="(chat, index) in chatHistory"
              :key="chat.id"
              @click="loadChat(chat)"
              class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="font-medium text-gray-900 truncate">{{ chat.title }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ chat.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8 pt-24">
      <div class="max-w-4xl mx-auto">
        <!-- 输入区域 -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">和AI对话规划行程</h2>
          <div class="flex gap-2">
            <input
              v-model="userInput"
              @keyup.enter="handleGenerate"
              placeholder="输入你的问题，例如：北京三日游怎么安排？"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="isLoading"
            />
            <button
              @click="handleGenerate"
              :disabled="!userInput.trim() || isLoading"
              class="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? '发送中' : '发送' }}
            </button>
          </div>
        </div>

        <!-- 对话历史展示区 -->
        <div class="space-y-6 mb-8">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex gap-4"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- AI 头像 -->
            <div v-if="message.role === 'assistant'" class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">🤖</span>
            </div>
            
            <!-- 消息内容 -->
            <div 
              class="max-w-[80%] rounded-2xl p-4"
              :class="message.role === 'user' 
                ? 'bg-black text-white rounded-tr-none' 
                : 'bg-white shadow-sm rounded-tl-none ai-markdown'"
              v-html="message.role === 'assistant' ? marked(message.content) : message.content"
            />
            
            <!-- 用户头像 -->
            <div v-if="message.role === 'user'" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">👤</span>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="flex gap-4 justify-start">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">🤖</span>
            </div>
            <div class="bg-white shadow-sm rounded-2xl rounded-tl-none p-4">
              <div class="flex items-center gap-2">
                <span class="animate-pulse">思考中</span>
                <span class="animate-bounce">...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 行程方案展示区 -->
        <div v-if="plans.length > 0" class="space-y-4">
          <h2 class="text-lg font-bold text-gray-900 mb-4">生成的行程方案</h2>
          
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
                <p class="text-gray-600">{{ plan.description }}</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {{ plan.days }}天行程
              </span>
            </div>
            
            <div class="flex items-center gap-6 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span>💰</span>
                <span>预计花费 ¥{{ plan.cost }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span>📍</span>
                <span>{{ plan.destinations.join('、') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="!isLoading"
          class="bg-white rounded-xl shadow-md p-12 text-center"
        >
          <div class="text-6xl mb-4">🗺️</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">开始你的智能旅行规划</h3>
          <p class="text-gray-600">
            在上方输入你的旅行计划，AI 将为你生成多套行程方案
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'
import { useSettings } from '../stores/settings'

const { settings } = useSettings()

// 历史记录侧边栏
const showHistorySidebar = ref(false)

// 对话历史类型
interface ChatSession {
  id: string
  title: string
  date: string
  messages: Message[]
}

// 所有对话历史（持久化存储）
const chatHistory = ref<ChatSession[]>([])

// 当前会话ID
const currentSessionId = ref<string>('')

// 加载历史记录
const loadHistoryFromStorage = () => {
  const saved = localStorage.getItem('trailmate-chat-history')
  if (saved) {
    try {
      chatHistory.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载历史记录失败:', e)
    }
  }
}

// 保存历史记录
const saveHistoryToStorage = () => {
  localStorage.setItem('trailmate-chat-history', JSON.stringify(chatHistory.value))
}

// 清空历史
const clearHistory = () => {
  if (confirm('确定要清空所有历史对话吗？')) {
    chatHistory.value = []
    messages.value = []
    currentSessionId.value = ''
    saveHistoryToStorage()
    showHistorySidebar.value = false
  }
}

// 加载某个历史会话
const loadChat = (chat: ChatSession) => {
  messages.value = chat.messages
  currentSessionId.value = chat.id
  showHistorySidebar.value = false
}

// 保存当前会话到历史
const saveCurrentChat = () => {
  if (messages.value.length === 0) return

  const title = messages.value[0]?.content?.slice(0, 30) || '新对话'
  const now = new Date()
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`

  if (currentSessionId.value) {
    // 更新现有会话
    const existingChat = chatHistory.value.find(c => c.id === currentSessionId.value)
    if (existingChat) {
      existingChat.messages = [...messages.value]
      existingChat.title = title
    }
  } else {
    // 创建新会话
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title,
      date: dateStr,
      messages: [...messages.value]
    }
    chatHistory.value.unshift(newChat)
    currentSessionId.value = newChat.id

    // 只保留最近20条会话
    if (chatHistory.value.length > 20) {
      chatHistory.value = chatHistory.value.slice(0, 20)
    }
  }

  saveHistoryToStorage()
}

// 初始化加载历史
loadHistoryFromStorage()

// 开始新对话
const startNewChat = () => {
  // 先保存当前对话到历史
  if (messages.value.length > 0) {
    saveCurrentChat()
  }
  // 清空当前消息，开始新对话
  messages.value = []
  currentSessionId.value = ''
  plans.value = []
  aiResponse.value = ''
}

const emit = defineEmits<{
  (e: 'back'): void
}>()

const userInput = ref('')
const isLoading = ref(false)
const plans = ref<any[]>([])
const aiResponse = ref('')

// 对话历史
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
const messages = ref<Message[]>([])

// 调用 MiniMax API
const callMiniMaxAPI = async (messagesHistory: Array<{role: 'user' | 'assistant', content: string}>) => {
  // 直接使用API Key测试
  const apiKey = 'sk-cp-AKJPm7S8lDxmEu4rABJ1Ypiwe-SrX-iicZfhBUR2mNvG64qLgS5O1GGtFosN1ECRx9e-T8lAMIZmfnZWhGlLShJmvrCKCBkPLWF_-HEvL624gURF_newOZQ'

  if (!apiKey) {
    throw new Error('MiniMax API Key 未配置')
  }

  console.log('开始调用MiniMax API...')
  console.log('历史消息:', messagesHistory)

  try {
      // 构建完整消息：系统提示 + 用户偏好 + 历史对话
      const userPreference = `用户偏好：
- 预算范围：¥${settings.value.budget[0]} - ¥${settings.value.budget[1]}
- 喜欢的旅行类型：${settings.value.travelTypes.join('、') || '无特别偏好'}
- 偏好的交通方式：${settings.value.transports.join('、') || '无特别偏好'}
- 偏好的住宿类型：${settings.value.accommodations.join('、') || '无特别偏好'}
- 语言：${settings.value.language === 'zh' ? '中文' : '英文'}

请严格按照用户偏好生成内容，输出格式使用Markdown。`

      const fullMessages = [
        {
          role: 'user',
          content: `你是伴旅智能旅行助手，擅长规划旅行行程，回答用户旅行相关问题。请用简洁清晰的中文回复。
${userPreference}
请严格按照用户问题和历史对话上下文回复。`
        },
        ...messagesHistory
      ]

    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
        top_p: 0.9
      })
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误响应:', errorText)
      throw new Error(`API请求失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API响应数据:', data)
    
    // 处理MiniMax响应格式（展开所有字段查看）
    console.log('响应所有字段:', Object.keys(data))
    console.log('完整响应:', JSON.stringify(data, null, 2))
    
    if (data.output && Array.isArray(data.output)) {
      return data.output[0]?.text || '抱歉，我暂时无法回答这个问题'
    } else if (data.choices && Array.isArray(data.choices)) {
      return data.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题'
    } else if (data.response) {
      return data.response
    } else if (data.reply) {
      return data.reply
    } else if (data.answer) {
      return data.answer
    } else if (data.content) {
      return data.content
    } else {
      console.error('无法解析API响应:', data)
      // 尝试直接返回所有内容
      return JSON.stringify(data, null, 2)
    }
  } catch (error) {
    console.error('调用MiniMax API失败:', error)
    const err = error as any
    const errorMsg = err.message || err.toString() || '未知错误'
    alert(`API调用失败: ${errorMsg}\n请检查网络连接`)
    throw error
  }
}

const handleGenerate = async () => {
  const input = userInput.value.trim()
  if (!input) return

  isLoading.value = true
  plans.value = []

  try {
    // 添加用户消息到历史
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    messages.value.push(userMsg)
    userInput.value = '' // 清空输入框

    // 转换消息格式供API使用
    const historyForApi = messages.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // 调用API（带重试机制）
    let response = ''
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        response = await callMiniMaxAPI(historyForApi)
        break
      } catch (apiError) {
        retryCount++
        if (retryCount > maxRetries) {
          throw apiError
        }
        console.log(`API调用失败，${retryCount}秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 添加AI回复到历史
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }
    messages.value.push(aiMsg)
    aiResponse.value = response

    // 保存当前会话到历史
    saveCurrentChat()

    // 尝试解析行程方案
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        if (result.plans && Array.isArray(result.plans)) {
          plans.value = result.plans
          return
        }
      }
    } catch (parseError) {
      // 解析失败就直接展示文本回复
    }
  } catch (error) {
    const err = error as any
    const errorMsg = err.message || '生成行程失败，请稍后重试'
    
    // 添加错误提示到历史
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `抱歉，${errorMsg}`,
      timestamp: new Date()
    }
    messages.value.push(aiMsg)
    aiResponse.value = errorMsg
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.ai-markdown :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: #1f2937;
}

.ai-markdown :deep(h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.8rem 0 0.4rem 0;
  color: #1f2937;
}

.ai-markdown :deep(h3) {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.6rem 0 0.3rem 0;
  color: #1f2937;
}

.ai-markdown :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.ai-markdown :deep(ul), .ai-markdown :deep(ol) {
  margin: 0.5rem 0 0.5rem 1.5rem;
  padding-left: 0;
}

.ai-markdown :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.ai-markdown :deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

.ai-markdown :deep(em) {
  font-style: italic;
}

.ai-markdown :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.ai-markdown :deep(pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.ai-markdown :deep(pre code) {
  background: none;
  padding: 0;
}

.ai-markdown :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: #6b7280;
}

.ai-markdown :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.ai-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
}

.ai-markdown :deep(th), .ai-markdown :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.ai-markdown :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}
</style>
