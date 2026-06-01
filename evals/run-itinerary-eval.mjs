/**
 * Trailmate LLM 节点 Evals 脚本 —— 行程生成 (itinerary_generate)
 *
 * 用法:
 *   node evals/run-itinerary-eval.mjs
 *
 * 前置条件: .env 文件中有 VITE_OPENROUTER_API_KEY
 *
 * 评测维度:
 *   1. 格式合规率 — JSON 可解析 + 必填字段完整
 *   2. 内容准确率 — 目的地匹配 + 天数 > 0 + 每天有活动
 *
 * 运行次数: 15 次（不同目的地 / 天数组合）
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- 加载 API Key ----
function loadApiKey() {
  const envPath = resolve(__dirname, '..', '.env')
  try {
    const content = readFileSync(envPath, 'utf-8')
    const match = content.match(/VITE_OPENROUTER_API_KEY\s*=\s*(.+)/)
    if (match) return match[1].trim()
  } catch { /* ignore */ }
  return process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || ''
}

const API_KEY = loadApiKey()
const API_URL  = process.env.VITE_OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
const MODEL    = 'minimax/minimax-m2.5:free'

// ---- 系统提示词（与生产环境一致） ----
const SYSTEM_PROMPT = `你是伴旅智能旅行助手，擅长规划详细旅行行程。
你可以使用工具来查询实时信息（如天气、位置、旅伴等），在需要准确数据时优先调用工具而非编造。
用户偏好：预算¥1000-5000，休闲、美食旅行，不限交通。

【输出格式 - 必须严格遵守】：
用以下结构输出，内容要详细、有深度（至少300字）。

🎯 **行程主题：** [一个吸引人的主题名称]
📅 **建议天数：** X天  💰 **预估总预算：** ¥X

---
### 📍 Day 1：第一天主题
| 时间 | 活动 | 地点 | 备注 |
|------|------|------|------|
| 08:00-10:00 | 具体活动 | [[景点名]] | 详细说明和tips

---
### 🍜 美食推荐
列出当地必吃美食（用 [[餐厅名]] 格式）

### 🏨 住宿建议
按预算推荐 2-3 个区域和酒店类型

### 💡 实用贴士
用 【提示内容】 格式列出交通/天气/预定/避坑建议

---
最后必须附 JSON：
\`\`\`json
{"plans":[{"name":"方案名称","description":"方案描述","totalDays":天数,"totalCost":总预算,"tags":["标签1"],"days":[{"day":1,"items":[{"type":"attraction|meal|hotel|transport|flight","name":"地点名","startTime":"08:00","endTime":"10:00","cost":费用,"address":"地址"}]}]}]}
\`\`\``

// ---- 测试用例 ----
const TEST_CASES = [
  { query: '帮我规划一个北京3天行程', destination: '北京', expectedDays: 3 },
  { query: '我想去上海玩2天，预算2000', destination: '上海', expectedDays: 2 },
  { query: '杭州4天3晚深度游怎么安排', destination: '杭州', expectedDays: 4 },
  { query: '成都3天美食之旅', destination: '成都', expectedDays: 3 },
  { query: '西安2天历史文化游', destination: '西安', expectedDays: 2 },
  { query: '重庆3天网红打卡行程', destination: '重庆', expectedDays: 3 },
  { query: '广州2天亲子游', destination: '广州', expectedDays: 2 },
  { query: '深圳4天购物美食之旅', destination: '深圳', expectedDays: 4 },
  { query: '南京3天古都游', destination: '南京', expectedDays: 3 },
  { query: '厦门3天鼓浪屿悠闲假期', destination: '厦门', expectedDays: 3 },
  { query: '长沙2天吃货之旅', destination: '长沙', expectedDays: 2 },
  { query: '大理3天风花雪月之旅', destination: '大理', expectedDays: 3 },
  { query: '武汉2天赏樱美食之旅', destination: '武汉', expectedDays: 2 },
  { query: '苏州3天园林古镇游', destination: '苏州', expectedDays: 3 },
  { query: '昆明3天春城之旅', destination: '昆明', expectedDays: 3 },
]

// ---- 评测结果类型 ----
/**
 * @typedef {Object} EvalResult
 * @property {string} query
 * @property {string} destination
 * @property {number} expectedDays
 * @property {boolean} formatOk      - JSON 可解析 + 必填字段完整
 * @property {string[]} formatErrors
 * @property {boolean} contentOk     - 目的地匹配 + 天数 >= 1 + 有活动
 * @property {string[]} contentErrors
 * @property {number} responseLength
 * @property {number} durationMs
 * @property {string|null} error
 */

// ---- LLM 调用 ----
async function callLLM(userQuery) {
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery }
    ],
    max_tokens: 2000
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text().catch(() => '')}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ---- 格式检查 ----
function checkFormat(content) {
  const errors = []

  // 1. JSON code block 存在
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (!jsonMatch) {
    errors.push('缺少 ```json 代码块')
    return { ok: false, errors, parsed: null }
  }

  // 2. JSON 可解析
  let parsed
  try {
    parsed = JSON.parse(jsonMatch[1])
  } catch (e) {
    errors.push(`JSON 解析失败: ${e.message}`)
    return { ok: false, errors, parsed: null }
  }

  // 3. 必填字段检查
  if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.length === 0) {
    errors.push('缺少 plans 数组或为空')
  } else {
    const plan = parsed.plans[0]
    if (!plan.name) errors.push('plan.name 缺失')
    if (plan.totalDays == null || plan.totalDays <= 0) errors.push('plan.totalDays 无效')
    if (plan.totalCost == null) errors.push('plan.totalCost 缺失')
    if (!plan.days || !Array.isArray(plan.days) || plan.days.length === 0) {
      errors.push('plan.days 缺失或为空')
    } else {
      // 检查每天是否有 items
      for (const day of plan.days) {
        if (!day.items || day.items.length === 0) {
          errors.push(`Day ${day.day} 缺少 items`)
        }
      }
      // 检查 items 必填字段
      const firstItem = plan.days[0]?.items?.[0]
      if (firstItem) {
        if (!firstItem.name) errors.push('item.name 缺失')
        if (!firstItem.type) errors.push('item.type 缺失')
      }
    }
  }

  return { ok: errors.length === 0, errors, parsed }
}

// ---- 内容检查 ----
function checkContent(content, parsed, expectedDest, expectedDays) {
  const errors = []

  // 1. 目的地匹配（text 或 JSON 中出现目的地关键词）
  const combined = content + JSON.stringify(parsed)
  if (!combined.includes(expectedDest)) {
    errors.push(`未提及目的地 "${expectedDest}"`)
  }

  // 2. JSON 中的天数合理
  if (parsed?.plans?.[0]) {
    const plan = parsed.plans[0]
    if (plan.days && plan.days.length !== plan.totalDays) {
      errors.push(`days 数量 (${plan.days.length}) 与 totalDays (${plan.totalDays}) 不一致`)
    }
    if (plan.totalDays <= 0 || plan.totalDays > 30) {
      errors.push(`totalDays 不合理: ${plan.totalDays}`)
    }
  }

  return { ok: errors.length === 0, errors }
}

// ---- 主流程 ----
async function main() {
  if (!API_KEY) {
    console.error('❌ 未找到 VITE_OPENROUTER_API_KEY，请在 .env 文件中配置')
    process.exit(1)
  }

  console.log(`🚀 Trailmate Itinerary LLM Evals`)
  console.log(`   Model: ${MODEL}`)
  console.log(`   Test cases: ${TEST_CASES.length}`)
  console.log(`   Start time: ${new Date().toISOString()}\n`)

  /** @type {EvalResult[]} */
  const results = []

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i]
    const start = Date.now()
    console.log(`[${i + 1}/${TEST_CASES.length}] "${tc.query}" ...`)

    /** @type {EvalResult} */
    const result = {
      query: tc.query,
      destination: tc.destination,
      expectedDays: tc.expectedDays,
      formatOk: false,
      formatErrors: [],
      contentOk: false,
      contentErrors: [],
      responseLength: 0,
      durationMs: 0,
      error: null
    }

    try {
      const content = await callLLM(tc.query)
      result.responseLength = content.length

      // 格式检查
      const fmt = checkFormat(content)
      result.formatOk = fmt.ok
      result.formatErrors = fmt.errors

      // 内容检查
      const cnt = checkContent(content, fmt.parsed, tc.destination, tc.expectedDays)
      result.contentOk = cnt.ok
      result.contentErrors = cnt.errors

    } catch (e) {
      result.error = e.message
    }

    result.durationMs = Date.now() - start
    results.push(result)

    // 逐个输出简要结果
    const status = result.formatOk && result.contentOk ? '✅' : result.error ? '❌' : '⚠️'
    console.log(`   ${status} 格式:${result.formatOk ? '✓' : '✗'} 内容:${result.contentOk ? '✓' : '✗'} 耗时:${result.durationMs}ms`)
    if (result.formatErrors.length) console.log(`      格式错误: ${result.formatErrors.join('; ')}`)
    if (result.contentErrors.length) console.log(`      内容错误: ${result.contentErrors.join('; ')}`)
    if (result.error) console.log(`      异常: ${result.error}`)
  }

  // ---- 统计 ----
  const total = results.length
  const formatOk = results.filter(r => r.formatOk).length
  const contentOk = results.filter(r => r.contentOk).length
  const bothOk = results.filter(r => r.formatOk && r.contentOk).length
  const errored = results.filter(r => r.error).length
  const avgDuration = results.reduce((s, r) => s + r.durationMs, 0) / total

  console.log('\n' + '='.repeat(60))
  console.log('📊 评测统计结果')
  console.log('='.repeat(60))
  console.log(`  总测试数:        ${total}`)
  console.log(`  异常数:          ${errored} (${(errored/total*100).toFixed(1)}%)`)
  console.log(`  格式合规:        ${formatOk}/${total} = ${(formatOk/total*100).toFixed(1)}%`)
  console.log(`  内容准确:        ${contentOk}/${total} = ${(contentOk/total*100).toFixed(1)}%`)
  console.log(`  双项通过:        ${bothOk}/${total} = ${(bothOk/total*100).toFixed(1)}%`)
  console.log(`  平均响应时间:    ${avgDuration.toFixed(0)}ms`)

  // 常见错误汇总
  const allFmtErrors = results.flatMap(r => r.formatErrors)
  const allCntErrors = results.flatMap(r => r.contentErrors)
  if (allFmtErrors.length || allCntErrors.length) {
    console.log('\n📋 错误分布:')
    const freq = {}
    for (const e of [...allFmtErrors, ...allCntErrors]) {
      freq[e] = (freq[e] || 0) + 1
    }
    for (const [err, count] of Object.entries(freq).sort((a, b) => b[1] - a[1])) {
      console.log(`  [${count}x] ${err}`)
    }
  }

  // 输出 JSON 结果（方便 CI 采集）
  console.log('\n📄 JSON 结果:')
  console.log(JSON.stringify({
    summary: {
      total,
      formatComplianceRate: `${(formatOk/total*100).toFixed(1)}%`,
      contentAccuracyRate: `${(contentOk/total*100).toFixed(1)}%`,
      bothPassRate: `${(bothOk/total*100).toFixed(1)}%`,
      errorRate: `${(errored/total*100).toFixed(1)}%`,
      avgDurationMs: Math.round(avgDuration)
    },
    results
  }, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
