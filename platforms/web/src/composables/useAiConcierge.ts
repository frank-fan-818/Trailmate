import { ref } from 'vue'
import { useTrailmateCore } from './use-trailmate-core'
import { CONCIERGE_TOOLS, type ToolDef } from './useToolRegistry'
import type { CompanionProfile, CompanionFilters, UserProfile } from '@trailmate/companion-matching'

// ---- Types ----
export interface ToolCallState {
  id: string
  toolName: string
  displayName: string
  status: 'running' | 'success' | 'error'
  result?: any
  error?: string
}

export interface ConciergeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  toolCalls?: ToolCallState[]
}

// ---- User profile for context ----
const demoUserProfile: UserProfile = {
  userId: 'demo-user',
  destination: '云南大理',
  travelDays: 5,
  budgetType: 'medium',
  personalityType: 'spontaneous',
  travelTypes: ['休闲', '美食', '摄影'],
  wakeTime: '08:00',
  sleepTime: '23:00',
  gender: '男',
  age: 28
}

// ---- System prompt ----
function buildSystemPrompt(): string {
  return `你是 Trailmate 旅行管家，一个智能旅行助手。你可以调用工具来获取用户的实时信息。

=== 回复准则 ===
1. 用中文回复，语气亲切友好。
2. 在给出建议前先调用工具获取信息，不要编造数据。
3. 当用户询问位置/行程/通知时，使用对应的工具查询。
4. 当用户想找旅伴时，使用 companion_filterCompanions。
5. 当用户想生成行程时，使用 itinerary_generate。
6. 调用工具时简要说明你在做什么。
7. 行程方案用 emoji 标题呈现每一天。
8. 如果工具出错，向用户解释并建议替代方案。

=== 当前用户画像 ===
- 目的地偏好: ${demoUserProfile.destination}
- 预算: ${demoUserProfile.budgetType}
- 性格: ${demoUserProfile.personalityType === 'spontaneous' ? '随性自由' : '计划周全'}
- 旅行偏好: ${demoUserProfile.travelTypes.join('、')}

=== 重要提示 ===
用户ID是 "demo-user"。当需要 userId 参数时使用这个值。
调用 companion_createTeamRequest 时 fromUserId 填 "demo-user"。`
}

// ---- Composables ----
const STORAGE_KEY = 'trailmate-concierge-history'

export function useAiConcierge() {
  const { getCurrentLocation, getTimeline, getNotifications, getAllRules,
    filterCompanions, getCompanionById, calculateMatch,
    createTeamRequest } = useTrailmateCore()

  const messages = ref<ConciergeMessage[]>([])
  const isProcessing = ref(false)
  const currentToolCalls = ref<ToolCallState[]>([])

  // ---- Load history ----
  function loadHistory(): ConciergeMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function saveHistory() {
    try {
      const toSave = messages.value.slice(-40) // keep last 40
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* silent */ }
  }

  // ---- LLM call ----
  async function callLLM(
    apiMessages: Array<{ role: string; content: string; tool_calls?: any[]; tool_call_id?: string; name?: string }>,
    tools?: ToolDef[]
  ): Promise<any> {
    const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY as string
    const apiUrl = (import.meta as any).env.VITE_OPENROUTER_API_URL as string || 'https://openrouter.ai/api/v1/chat/completions'

    const body: any = {
      model: 'minimax/minimax-m2.5:free',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...apiMessages
      ],
      max_tokens: 2000
    }
    if (tools && tools.length > 0) body.tools = tools

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('AI 服务繁忙，请稍后重试（免费模型请求量较大）')
      }
      const errText = await response.text().catch(() => '')
      throw new Error(`API 请求失败 (${response.status})`)
    }

    return response.json()
  }

  // ---- Execute a tool call ----
  async function executeToolCall(tc: any): Promise<any> {
    const name = tc.function.name
    const args = JSON.parse(tc.function.arguments || '{}')

    switch (name) {
      case 'perception_getCurrentLocation':
        return await getCurrentLocation()

      case 'perception_getTimeline':
        return await getTimeline(args.planId || 'demo-plan')

      case 'perception_getNotifications':
        return await getNotifications({ planId: args.planId, unreadOnly: args.unreadOnly })

      case 'perception_getAllRules':
        return await getAllRules()

      case 'companion_filterCompanions': {
        const filters: CompanionFilters = {}
        if (args.keyword) filters.keyword = args.keyword
        if (args.budget) filters.budget = args.budget
        if (args.personalityType) filters.personalityType = args.personalityType
        return await filterCompanions(filters, demoUserProfile)
      }

      case 'companion_calculateMatch': {
        const companion = await getCompanionById(args.companionId)
        if (!companion) return { error: '未找到该同伴' }
        return await calculateMatch(companion, demoUserProfile)
      }

      case 'companion_createTeamRequest':
        return await createTeamRequest({
          fromUserId: 'demo-user',
          toUserId: args.toUserId,
          destination: args.destination,
          date: args.date,
          message: args.message,
          splitType: args.splitType || 'aa'
        })

      case 'itinerary_generate': {
        // Call the module's itinerary.generate service
        try {
          const { Core } = await import('@trailmate/core')
          const coreInstance = new Core()
          await coreInstance.pluginManager.install(
            new (await import('@trailmate/adapters/mock-adapter')).default()
          )
          const result = await coreInstance.service.call<any[]>('itinerary.generate', {
            id: `concierge-${Date.now()}`,
            userId: 'demo-user',
            content: args.content,
            createTime: Date.now()
          })
          return result
        } catch (e: any) {
          return { error: `行程生成失败: ${e.message}`, fallback: 'mock计划已生成' }
        }
      }

      default:
        return { error: `未知工具: ${name}` }
    }
  }

  // ---- Main: process user message ----
  async function sendMessage(text: string) {
    if (!text.trim() || isProcessing.value) return

    const userMsg: ConciergeMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    }
    messages.value.push(userMsg)
    isProcessing.value = true
    currentToolCalls.value = []

    try {
      // Build API messages from conversation history
      const apiMessages: any[] = []
      for (const msg of messages.value.slice(-20)) {
        if (msg.role === 'user') {
          apiMessages.push({ role: 'user', content: msg.content })
        } else {
          apiMessages.push({ role: 'assistant', content: msg.content })
        }
      }

      // First LLM call
      const response1 = await callLLM(apiMessages, CONCIERGE_TOOLS)
      const choice = response1.choices?.[0]
      if (!choice) throw new Error('LLM 返回为空')

      // Case 1: Tool calls
      if (choice.message?.tool_calls?.length > 0) {
        const toolCalls: ToolCallState[] = choice.message.tool_calls.map((tc: any) => ({
          id: tc.id,
          toolName: tc.function.name,
          displayName: tc.function.name,
          status: 'running' as const
        }))
        currentToolCalls.value = toolCalls

        // Execute all tool calls
        const results: any[] = []
        for (const tc of toolCalls) {
          const state = currentToolCalls.value.find(s => s.id === tc.id)!
          try {
            const res = await Promise.race([
              executeToolCall(choice.message.tool_calls.find((t: any) => t.id === tc.id)),
              new Promise((_, reject) => setTimeout(() => reject(new Error('工具调用超时')), 15000))
            ])
            state.status = 'success'
            state.result = res
            state.displayName = (await import('./useToolRegistry')).TOOL_DISPLAY_NAMES[tc.toolName] || tc.toolName
            results.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify(res) })
          } catch (e: any) {
            state.status = 'error'
            state.error = e.message
            state.displayName = (await import('./useToolRegistry')).TOOL_DISPLAY_NAMES[tc.toolName] || tc.toolName
            results.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify({ error: e.message }) })
          }
        }

        // Second LLM call with tool results
        apiMessages.push({ role: 'assistant', content: null, tool_calls: choice.message.tool_calls })
        apiMessages.push(...results)

        const response2 = await callLLM(apiMessages)
        const finalContent = response2.choices?.[0]?.message?.content || '工具执行完成，请查看结果。'

        const assistantMsg: ConciergeMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: finalContent,
          timestamp: Date.now(),
          toolCalls: currentToolCalls.value
        }
        messages.value.push(assistantMsg)
      } else {
        // Case 2: Direct text response
        const assistantMsg: ConciergeMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: choice.message?.content || '抱歉，我无法理解您的请求。',
          timestamp: Date.now()
        }
        messages.value.push(assistantMsg)
      }

      saveHistory()
    } catch (e: any) {
      const errorMsg: ConciergeMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `抱歉，我遇到了一个问题：${e.message || '未知错误'}。请稍后重试。`,
        timestamp: Date.now()
      }
      messages.value.push(errorMsg)
    } finally {
      isProcessing.value = false
      currentToolCalls.value = []
    }
  }

  function clearHistory() {
    messages.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // Init
  messages.value = loadHistory()

  return {
    messages, isProcessing, currentToolCalls,
    sendMessage, clearHistory
  }
}
