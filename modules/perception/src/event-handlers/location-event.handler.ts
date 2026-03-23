import type PerceptionModule from '../../index'
import type { LocationInfo } from '../types'
import { runRulesByType } from '../services/rule-engine.service'

/**
 * 处理位置变更事件
 */
export async function handleLocationChanged(this: PerceptionModule, data: LocationInfo) {
  const { userId } = data
  
  const context = this.getContext(userId)
  if (!context) return

  // 更新上下文位置信息
  context.currentLocation = data
  context.updatedAt = Date.now()
  this.setContext(userId, context)

  // 触发位置相关规则匹配
  await runRulesByType('location', {
    userId,
    location: data,
    context
  })

  console.log(`📍 用户${userId}位置更新：${data.address}`)
}
