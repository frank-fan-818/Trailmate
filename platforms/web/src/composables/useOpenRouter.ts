import { CONCIERGE_TOOLS, type ToolDef } from './useToolRegistry'

// ====== Shared LLM call ======

export async function callLLM(
  messages: Array<{ role: string; content: string | null; tool_calls?: any[]; tool_call_id?: string; name?: string }>,
  options?: { model?: string; tools?: ToolDef[] }
): Promise<any> {
  const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY as string
  const apiUrl = (import.meta as any).env.VITE_OPENROUTER_API_URL as string || 'https://openrouter.ai/api/v1/chat/completions'

  const body: any = {
    model: options?.model || 'minimax/minimax-m2.5',
    messages,
    max_tokens: 2000
  }
  if (options?.tools && options.tools.length > 0) body.tools = options.tools

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    if (res.status === 429) throw new Error('AI 服务繁忙，请稍后重试（免费模型请求量较大）')
    throw new Error(`API 请求失败 (${res.status})`)
  }

  return res.json()
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
  systemPrompt: string
): Promise<{ content: string; toolCalls?: Array<{ name: string; result: any }> }> {
  const apiMessages: any[] = [
    { role: 'system', content: systemPrompt },
    ...messages
  ]

  // First call
  const res1 = await callLLM(apiMessages, { tools: CONCIERGE_TOOLS })
  const choice1 = res1.choices?.[0]

  if (!choice1?.message?.tool_calls?.length) {
    return { content: choice1?.message?.content || '' }
  }

  // Execute tools
  const executedTools: Array<{ name: string; result: any }> = []
  const toolResults: any[] = []
  for (const tc of choice1.message.tool_calls) {
    const execName = tc.function.name
    try {
      const args = JSON.parse(tc.function.arguments || '{}')
      const result = await Promise.race([
        executeToolCall(execName, args),
        new Promise((_, reject) => setTimeout(() => reject(new Error('超时')), 15000))
      ])
      executedTools.push({ name: execName, result })
      toolResults.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify(result) })
    } catch (e: any) {
      executedTools.push({ name: execName, result: { error: e.message } })
      toolResults.push({ tool_call_id: tc.id, role: 'tool', content: JSON.stringify({ error: e.message }) })
    }
  }

  // Second call with tool results
  apiMessages.push({ role: 'assistant', content: null, tool_calls: choice1.message.tool_calls })
  apiMessages.push(...toolResults)

  const res2 = await callLLM(apiMessages)
  return {
    content: res2.choices?.[0]?.message?.content || choice1.message.content || '',
    toolCalls: executedTools
  }
}
