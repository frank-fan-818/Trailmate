/**
 * 工作流演示脚本
 * 运行: npx ts-node src/workflow/demo.ts
 */

import { runItineraryWorkflow } from './index.js'
import type { ItineraryRequest } from '../types/index.js'

async function demo() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║     Trailmate 伴旅 - 智能行程规划工作流演示               ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // 模拟用户请求
  const request: ItineraryRequest = {
    id: `req_${Date.now()}`,
    userId: 'user_demo_001',
    content: '我想带家人去青岛玩3天，预算中等，喜欢海滩和美食',
    createTime: Date.now()
  }

  console.log('📋 用户请求:')
  console.log(`   ${request.content}\n`)

  try {
    // 执行工作流
    const { plans, task, logs } = await runItineraryWorkflow(request)

    // 展示结果
    console.log('\n📊 工作流执行结果:')
    console.log(`   任务ID: ${task.id}`)
    console.log(`   执行状态: ${task.status}`)
    console.log(`   总耗时: ${task.durationMs}ms\n`)

    console.log('📈 各步骤耗时:')
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.step}: ${log.durationMs}ms`)
    })

    console.log('\n🎯 生成的行程方案:')
    plans.forEach((plan, index) => {
      console.log(`\n   方案 ${index + 1}: ${plan.name}`)
      console.log(`   描述: ${plan.description}`)
      console.log(`   标签: ${plan.tags.join(', ')}`)
      console.log(`   天数: ${plan.totalDays}天`)
      console.log(`   总费用: ¥${plan.totalCost}`)
      console.log(`   每日行程:`)
      plan.days.forEach(day => {
        console.log(`     第${day.day}天: ${day.items.length}个项目`)
        day.items.forEach(item => {
          console.log(`       - ${item.type}: ${item.name} (${item.startTime}-${item.endTime}) ¥${item.cost}`)
        })
      })
    })

    console.log('\n✅ 工作流演示完成!')

  } catch (error) {
    console.error('\n❌ 工作流执行失败:', (error as Error).message)
  }
}

// 运行演示
demo()
