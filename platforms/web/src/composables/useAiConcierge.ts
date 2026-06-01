import { ref } from 'vue'
import { runWithTools } from './useOpenRouter'
import { TOOL_DISPLAY_NAMES } from './useToolRegistry'
import { createLogger, generateTraceId } from '@trailmate/shared'

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

=== 重要提示 ===
用户ID是 "demo-user"。查询同伴时 destination 默认 "云南大理"。`
}

// ---- Composable ----
const STORAGE_KEY = 'trailmate-concierge-history'

export function useAiConcierge() {
  const messages = ref<ConciergeMessage[]>([])
  const isProcessing = ref(false)
  const currentToolCalls = ref<ToolCallState[]>([])

  function loadHistory(): ConciergeMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function saveHistory() {
    try {
      const toSave = messages.value.slice(-40)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch { /* silent */ }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isProcessing.value) return

    const traceId = generateTraceId()
    const log = createLogger(traceId)
    const startTime = Date.now()

    const userMsg: ConciergeMessage = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() }
    messages.value.push(userMsg)

    log.entry('用户消息接收', {
      msgLength: text.length,
      msgPreview: text.slice(0, 100),
      historyCount: messages.value.length
    })

    isProcessing.value = true
    currentToolCalls.value = []

    try {
      log.step('send-message', '构建 API 消息并调用 runWithTools', {
        apiMsgCount: Math.min(messages.value.length, 20)
      })

      const apiMessages = messages.value.slice(-20).map(m => ({ role: m.role, content: m.content }))

      const { content, toolCalls } = await runWithTools(apiMessages, buildSystemPrompt(), traceId)

      // Build tool call states for UI
      const toolStates: ToolCallState[] = (toolCalls || []).map((tc, i) => ({
        id: `tc-${Date.now()}-${i}`,
        toolName: tc.name,
        displayName: TOOL_DISPLAY_NAMES[tc.name] || tc.name,
        status: tc.result?.error ? 'error' as const : 'success' as const,
        result: tc.result,
        error: tc.result?.error
      }))

      const assistantMsg: ConciergeMessage = {
        id: `a-${Date.now()}`, role: 'assistant', content: content || '工具执行完成，请查看结果。',
        timestamp: Date.now(), toolCalls: toolStates
      }
      messages.value.push(assistantMsg)
      saveHistory()

      log.exit('助手消息已添加到对话', Date.now() - startTime, {
        responseLength: content?.length || 0,
        toolCallCount: toolStates.length,
        isFallback: content === '抱歉，AI 服务暂时不可用。请稍后重试或检查网络连接。您仍然可以浏览已有的行程和旅伴信息。'
      })
    } catch (e: any) {
      const errorMsg = `抱歉，我遇到了问题：${e.message || '未知错误'}。请稍后重试。`
      messages.value.push({
        id: `a-${Date.now()}`, role: 'assistant',
        content: errorMsg,
        timestamp: Date.now()
      })

      log.error('send-message', 'AI 管家消息处理失败', e, {
        totalDurationMs: Date.now() - startTime
      })
    } finally {
      isProcessing.value = false
      currentToolCalls.value = []
    }
  }

  function clearHistory() {
    messages.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  messages.value = loadHistory()

  return { messages, isProcessing, currentToolCalls, sendMessage, clearHistory }
}
