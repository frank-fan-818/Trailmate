import { CONCIERGE_TOOLS, type ToolDef } from './useToolRegistry'
import { createLogger, generateTraceId, type StructuredLogger } from '@trailmate/shared'

// ====== Config ======

/** LLM 调用超时时间（毫秒）
 *  选择依据：
 *  - OpenRouter minimax 模型典型响应时间：2-8 秒
 *  - 包含 3 次重试（间隔 2s/4s），最坏情况 ≈ 30s + 6s = 36s
 *  - 30s 为行业常用 LLM API 超时值（OpenAI 默认 600s 但非流式通常 30-60s）
 *  - 低于 30s：高峰期容易误超时
 *  - 高于 60s：用户体验下降，用户不会等那么久
 *  - 30s 为平衡点：给正常调用+一次重试留足余量，同时尽快失败让用户手动重试
 */
const LLM_TIMEOUT_MS = 30000

/** 降级回复：当 LLM 服务完全不可用时使用 */
const FALLBACK_RESPONSE = '抱歉，AI 服务暂时不可用。请稍后重试或检查网络连接。您仍然可以浏览已有的行程和旅伴信息。'

// ====== Helpers ======

function extractContent(message: any): string {
  if (message?.content) return message.content
  // Some providers return reasoning text when content is null
  if (message?.reasoning) return message.reasoning
  const details = message?.reasoning_details
  if (Array.isArray(details) && details.length > 0) {
    return details.map((d: any) => d.text || '').join('')
  }
  return ''
}

// ====== Shared LLM call ======

export async function callLLM(
  messages: Array<{ role: string; content: string | null; tool_calls?: any[]; tool_call_id?: string; name?: string }>,
  options?: { model?: string; tools?: ToolDef[]; log?: StructuredLogger }
): Promise<any> {
  const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY as string
  const apiUrl = (import.meta as any).env.VITE_OPENROUTER_API_URL as string || 'https://openrouter.ai/api/v1/chat/completions'
  const model = options?.model || 'minimax/minimax-m2.5:free'

  const body: any = {
    model,
    messages,
    max_tokens: 2000
  }
  if (options?.tools && options.tools.length > 0) body.tools = options.tools

  const log = options?.log

  for (let attempt = 0; attempt < 3; attempt++) {
    const callStart = Date.now()

    // AbortController 超时控制：30 秒未响应则主动中断
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)

    try {
      log?.step('llm-http-call', `发起 LLM 请求 (第 ${attempt + 1}/3 次)`, {
        model,
        msgCount: messages.length,
        hasTools: !!options?.tools,
        attempt: attempt + 1
      })

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const callDuration = Date.now() - callStart

      if (res.ok) {
        const json = res.json()
        log?.step('llm-http-call', `LLM 请求成功 (第 ${attempt + 1}/3 次)`, {
          attempt: attempt + 1,
          durationMs: callDuration,
          model: json.model || model
        })
        return json
      }

      if (res.status === 429 && attempt < 2) {
        log?.step('llm-http-call', `遇到限流 (429)，等待重试`, {
          attempt: attempt + 1,
          waitMs: 2000 * (attempt + 1)
        })
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
        continue
      }

      if (res.status === 429) {
        log?.error('llm-http-call', 'LLM 限流重试耗尽', new Error('AI 服务繁忙，请稍后重试'), { attempt: attempt + 1 })
        throw new Error('AI 服务繁忙，请稍后重试')
      }

      log?.error('llm-http-call', `LLM API 返回错误状态`, new Error(`API 请求失败 (${res.status})`), {
        attempt: attempt + 1,
        status: res.status
      })
      throw new Error(`API 请求失败 (${res.status})`)
    } catch (e: any) {
      clearTimeout(timeoutId)

      if (e.name === 'AbortError') {
        log?.error('llm-http-call', `LLM 请求超时 (${LLM_TIMEOUT_MS}ms)`, new Error(`请求超时`), {
          attempt: attempt + 1,
          timeoutMs: LLM_TIMEOUT_MS
        })
        if (attempt < 2) continue
        throw new Error(`AI 服务响应超时，请稍后重试`)
      }

      // Re-throw non-retryable errors immediately (status errors already thrown above)
      if (attempt >= 2 || !e.message?.includes('API 请求失败')) {
        throw e
      }
      // For retryable errors on attempts 0-1, continue loop
    }
  }

  throw new Error('API 请求失败')
}

// ====== Shared tool execution (with cached Core singleton) ======

let _cachedCore: any = null

async function getCore(): Promise<any> {
  if (_cachedCore) return _cachedCore
  const { Core } = await import('@trailmate/core')
  const { default: Plugin } = await import('@trailmate/perception')
  const { default: CompanionPlugin } = await import('@trailmate/companion-matching')
  const { default: MockAdapter } = await import('@trailmate/adapters/mock-adapter')

  const core = new Core()
  await core.pluginManager.install(new MockAdapter())
  await core.pluginManager.install(new Plugin())
  await core.pluginManager.install(new CompanionPlugin())
  await core.pluginManager.mount()
  _cachedCore = core
  return core
}

export async function executeToolCall(name: string, args: Record<string, any>): Promise<any> {
  const core = await getCore()

  switch (name) {
    case 'perception_getCurrentLocation':
      return await core.service.call('perception.getCurrentLocation', 'demo-user')
    case 'perception_getTimeline':
      return await core.service.call('perception.getTimeline', { userId: 'demo-user', planId: args.planId || 'demo-plan' })
    case 'perception_getNotifications':
      return await core.service.call('perception.getNotifications', { userId: 'demo-user', ...args })
    case 'perception_getAllRules':
      return await core.service.call('perception.getAllRules')
    case 'companion_filterCompanions': {
      const filters: any = {}
      if (args.keyword) filters.keyword = args.keyword
      if (args.budget) filters.budget = args.budget
      if (args.personalityType) filters.personalityType = args.personalityType
      return await core.service.call('companion.filterCompanions', filters, {
        userId: 'demo-user', destination: '云南大理', travelDays: 5,
        budgetType: 'medium', personalityType: 'spontaneous',
        travelTypes: ['休闲', '美食'], wakeTime: '08:00', sleepTime: '23:00',
        gender: '男', age: 28
      })
    }
    case 'companion_calculateMatch': {
      const companion = await core.service.call('companion.getCompanionById', args.companionId)
      if (!companion) return { error: '未找到该同伴' }
      return await core.service.call('companion.calculateMatch', companion, {
        userId: 'demo-user', destination: '云南大理', travelDays: 5,
        budgetType: 'medium', personalityType: 'spontaneous',
        travelTypes: ['休闲', '美食'], wakeTime: '08:00', sleepTime: '23:00',
        gender: '男', age: 28
      })
    }
    case 'companion_createTeamRequest':
      return await core.service.call('companion.createTeamRequest', {
        fromUserId: 'demo-user', toUserId: args.toUserId,
        destination: args.destination, date: args.date,
        message: args.message, splitType: args.splitType || 'aa'
      })
    case 'itinerary_generate':
      return await core.service.call('itinerary.generate', {
        id: `planner-${Date.now()}`, userId: 'demo-user',
        content: args.content, createTime: Date.now()
      })
    default:
      return { error: `未知工具: ${name}` }
  }
}

// ====== Tool calling loop ======

export async function runWithTools(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  traceId?: string
): Promise<{ content: string; toolCalls?: Array<{ name: string; result: any }> }> {
  const tid = traceId || generateTraceId()
  const log = createLogger(tid)
  const startTime = Date.now()

  log.entry('AI 管家请求进入', {
    msgCount: messages.length,
    lastUserMsg: messages.filter(m => m.role === 'user').slice(-1)[0]?.content?.slice(0, 100)
  })

  const apiMessages: any[] = [
    { role: 'system', content: systemPrompt },
    ...messages
  ]

  try {
    // --- Step 1: First LLM call (with tools) ---
    log.step('llm-call-1', '第一次 LLM 调用（带工具定义）', {
      toolCount: CONCIERGE_TOOLS.length,
      toolNames: CONCIERGE_TOOLS.map(t => t.function.name)
    })

    const res1 = await callLLM(apiMessages, { tools: CONCIERGE_TOOLS, log })
    const choice1 = res1.choices?.[0]

    if (!choice1?.message?.tool_calls?.length) {
      const content = extractContent(choice1?.message)
      const durationMs = Date.now() - startTime
      log.exit('AI 管家响应完成（无需工具调用）', durationMs, {
        contentLength: content.length,
        model: res1.model
      })
      return { content }
    }

    // --- Step 2: Execute tools ---
    log.step('tool-execution', `执行工具调用 (${choice1.message.tool_calls.length} 个)`, {
      tools: choice1.message.tool_calls
        .filter((tc: any) => tc.function?.name)
        .map((tc: any) => tc.function.name)
    })

    const executedTools: Array<{ name: string; result: any }> = []
    const toolResults: any[] = []
    for (const tc of choice1.message.tool_calls) {
      // Skip non-standard tool calls (e.g. minimax:tool_call URI scheme)
      if (!tc.function || !tc.function.name) {
        continue
      }
      const execName = tc.function.name
      const toolStart = Date.now()
      try {
        const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
        const result = await Promise.race([
          executeToolCall(execName, args),
          new Promise((_, reject) => setTimeout(() => reject(new Error('超时')), 15000))
        ])
        const toolDuration = Date.now() - toolStart
        log.step('tool-execution', `工具 ${execName} 执行成功`, {
          tool: execName,
          durationMs: toolDuration,
          resultKeys: result ? Object.keys(result) : []
        })
        executedTools.push({ name: execName, result })
        toolResults.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify(result) })
      } catch (e: any) {
        log.error('tool-execution', `工具 ${execName} 执行失败`, e, {
          tool: execName,
          durationMs: Date.now() - toolStart
        })
        executedTools.push({ name: execName, result: { error: e.message } })
        toolResults.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify({ error: e.message }) })
      }
    }

    // --- Step 3: Second LLM call with tool results ---
    log.step('llm-call-2', '第二次 LLM 调用（携带工具结果）', {
      toolResultCount: toolResults.length
    })

    apiMessages.push({ role: 'assistant', content: null, tool_calls: choice1.message.tool_calls })
    apiMessages.push(...toolResults)

    const res2 = await callLLM(apiMessages, { log })
    const content = extractContent(res2.choices?.[0]?.message) || extractContent(choice1.message)
    const durationMs = Date.now() - startTime

    log.exit('AI 管家响应完成（含工具调用）', durationMs, {
      contentLength: content.length,
      toolCallCount: executedTools.length,
      toolNames: executedTools.map(t => t.name),
      model: res2.model
    })

    return { content, toolCalls: executedTools }
  } catch (e: any) {
    const durationMs = Date.now() - startTime
    log.error('run-with-tools', 'AI 管家链路失败，触发降级', e, {
      totalDurationMs: durationMs
    })

    // 降级方案：返回友好提示，不阻断用户操作
    return { content: FALLBACK_RESPONSE, toolCalls: [] }
  }
}
