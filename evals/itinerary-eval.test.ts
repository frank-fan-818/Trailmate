/**
 * 行程生成 Evals 评测逻辑单元测试
 *
 * 验证 checkFormat / checkContent 函数对已知输入输出的判断是否正确。
 * 无需真实 API Key 即可运行。
 *
 * 用法: npx vitest run evals/
 */

import { describe, it, expect } from 'vitest'

// ---- 从 evals 脚本提取的评测函数 ----

function checkFormat(content: string): { ok: boolean; errors: string[]; parsed: any } {
  const errors: string[] = []

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (!jsonMatch) {
    errors.push('缺少 ```json 代码块')
    return { ok: false, errors, parsed: null }
  }

  let parsed
  try {
    parsed = JSON.parse(jsonMatch[1])
  } catch (e: any) {
    errors.push(`JSON 解析失败: ${e.message}`)
    return { ok: false, errors, parsed: null }
  }

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
      for (const day of plan.days) {
        if (!day.items || day.items.length === 0) {
          errors.push(`Day ${day.day} 缺少 items`)
        }
      }
      const firstItem = plan.days[0]?.items?.[0]
      if (firstItem) {
        if (!firstItem.name) errors.push('item.name 缺失')
        if (!firstItem.type) errors.push('item.type 缺失')
      }
    }
  }

  return { ok: errors.length === 0, errors, parsed }
}

function checkContent(content: string, parsed: any, expectedDest: string, _expectedDays: number): { ok: boolean; errors: string[] } {
  const errors: string[] = []

  const combined = content + JSON.stringify(parsed)
  if (!combined.includes(expectedDest)) {
    errors.push(`未提及目的地 "${expectedDest}"`)
  }

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

// ---- 模拟完整的 LLM 响应 ----

const GOOD_RESPONSE = `🎯 **行程主题：** 古都风华·北京3日深度游
📅 **建议天数：** 3天  💰 **预估总预算：** ¥2500

---
### 📍 Day 1：皇城中轴线
| 时间 | 活动 | 地点 | 备注 |
|------|------|------|------|
| 08:00-10:00 | 参观故宫 | [[故宫]] | 建议提前预约 |

### 🍜 美食推荐
必吃：[[全聚德烤鸭]]、[[护国寺小吃]]

---
\`\`\`json
{"plans":[{"name":"北京3日深度游","description":"古都风华之旅","totalDays":3,"totalCost":2500,"tags":["历史文化","美食"],"days":[{"day":1,"items":[{"type":"attraction","name":"故宫","startTime":"08:00","endTime":"10:00","cost":60,"address":"北京市东城区"}]},{"day":2,"items":[{"type":"attraction","name":"八达岭长城","startTime":"08:00","endTime":"12:00","cost":40,"address":"北京市延庆区"}]},{"day":3,"items":[{"type":"attraction","name":"颐和园","startTime":"09:00","endTime":"12:00","cost":30,"address":"北京市海淀区"}]}]}]}
\`\`\``

const BAD_NO_JSON = `这是一个很好的行程！但没有 JSON 代码块。`

const BAD_INVALID_JSON = `\`\`\`json
{invalid json content here
\`\`\``

const BAD_MISSING_FIELDS = `\`\`\`json
{"plans":[{"name":"测试","totalDays":3}]}
\`\`\``

const BAD_EMPTY_PLANS = `\`\`\`json
{"plans":[]}
\`\`\``

const BAD_WRONG_DEST = `\`\`\`json
{"plans":[{"name":"上海游","description":"上海","totalDays":3,"totalCost":2000,"days":[{"day":1,"items":[{"type":"attraction","name":"外滩","startTime":"08:00","endTime":"10:00","cost":0,"address":"上海"}]}]}]}
\`\`\``

const BAD_DAYS_MISMATCH = `\`\`\`json
{"plans":[{"name":"北京游","description":"北京","totalDays":5,"totalCost":3000,"days":[{"day":1,"items":[{"type":"attraction","name":"故宫","startTime":"08:00","endTime":"10:00","cost":60,"address":"北京"}]}]}]}
\`\`\``

// ---- 测试用例 ----

describe('Evals - checkFormat (格式合规检查)', () => {
  it('完整合规响应 → 通过', () => {
    const r = checkFormat(GOOD_RESPONSE)
    expect(r.ok).toBe(true)
    expect(r.errors).toHaveLength(0)
    expect(r.parsed.plans[0].name).toBe('北京3日深度游')
  })

  it('缺少 JSON 代码块 → 不通过', () => {
    const r = checkFormat(BAD_NO_JSON)
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('缺少 ```json 代码块')
  })

  it('JSON 解析失败 → 不通过', () => {
    const r = checkFormat(BAD_INVALID_JSON)
    expect(r.ok).toBe(false)
    expect(r.errors.some((e: string) => e.includes('JSON 解析失败'))).toBe(true)
  })

  it('缺少 plans 字段 → 不通过', () => {
    const r = checkFormat('```json\n{"foo":"bar"}\n```')
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('缺少 plans 数组或为空')
  })

  it('plans 为空数组 → 不通过', () => {
    const r = checkFormat(BAD_EMPTY_PLANS)
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('缺少 plans 数组或为空')
  })

  it('缺少 totalCost → 不通过', () => {
    const r = checkFormat(BAD_MISSING_FIELDS)
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('plan.totalCost 缺失')
  })

  it('缺少 days → 不通过', () => {
    const r = checkFormat(BAD_MISSING_FIELDS)
    expect(r.errors).toContain('plan.days 缺失或为空')
  })

  it('totalDays 为 0 → 不通过', () => {
    const r = checkFormat('```json\n{"plans":[{"name":"x","totalDays":0,"totalCost":0,"days":[]}]}\n```')
    expect(r.ok).toBe(false)
    expect(r.errors).toContain('plan.totalDays 无效')
  })
})

describe('Evals - checkContent (内容准确检查)', () => {
  it('目的地匹配 + 天数一致 → 通过', () => {
    const parsed = JSON.parse(GOOD_RESPONSE.match(/```json\s*([\s\S]*?)\s*```/)![1])
    const r = checkContent(GOOD_RESPONSE, parsed, '北京', 3)
    expect(r.ok).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  it('目的地不匹配 → 不通过', () => {
    const parsed = JSON.parse(BAD_WRONG_DEST.match(/```json\s*([\s\S]*?)\s*```/)![1])
    const r = checkContent(BAD_WRONG_DEST, parsed, '北京', 2)
    expect(r.ok).toBe(false)
    expect(r.errors.some((e: string) => e.includes('未提及'))).toBe(true)
  })

  it('days 与 totalDays 不一致 → 不通过', () => {
    const parsed = JSON.parse(BAD_DAYS_MISMATCH.match(/```json\s*([\s\S]*?)\s*```/)![1])
    const r = checkContent(BAD_DAYS_MISMATCH, parsed, '北京', 5)
    expect(r.ok).toBe(false)
    expect(r.errors.some((e: string) => e.includes('不一致'))).toBe(true)
  })

  it('totalDays 超过 30 → 不通过', () => {
    const resp = '```json\n{"plans":[{"name":"x","totalDays":31,"totalCost":0,"days":[{"day":1,"items":[]}]}]}\n```'
    const parsed = JSON.parse(resp.match(/```json\s*([\s\S]*?)\s*```/)![1])
    const r = checkContent(resp, parsed, 'x', 31)
    expect(r.ok).toBe(false)
    expect(r.errors.some((e: string) => e.includes('不合理'))).toBe(true)
  })
})

describe('Evals - 完整评测流程 (模拟)', () => {
  it('统计: 4个好响应 + 1个无JSON + 1个字段缺失 = 66.7% 格式合规', () => {
    const cases = [
      { response: GOOD_RESPONSE, dest: '北京', days: 3 },
      { response: GOOD_RESPONSE, dest: '北京', days: 3 }, // Good
      { response: GOOD_RESPONSE, dest: '北京', days: 3 }, // Good
      { response: GOOD_RESPONSE, dest: '北京', days: 3 }, // Good
      { response: BAD_NO_JSON, dest: '北京', days: 3 },
      { response: BAD_MISSING_FIELDS, dest: '北京', days: 3 },
    ]

    const results = cases.map(c => {
      const fmt = checkFormat(c.response)
      const cnt = checkContent(c.response, fmt.parsed, c.dest, c.days)
      return { formatOk: fmt.ok, contentOk: cnt.ok }
    })

    const formatRate = results.filter(r => r.formatOk).length / results.length
    const contentRate = results.filter(r => r.contentOk).length / results.length

    expect(formatRate).toBeCloseTo(4 / 6, 2)  // 66.7% (4 good, 2 bad)
    expect(contentRate).toBeCloseTo(4 / 6, 2)  // 66.7% (cases 5+6 lack destination)
  })
})
