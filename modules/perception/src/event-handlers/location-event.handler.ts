import type PerceptionModule from '../../index'
import type { LocationInfo } from '../types'
import { runRulesByType } from '../services/rule-engine.service'

export async function handleLocationChanged(this: PerceptionModule, data: LocationInfo): Promise<void> {
  const context = this.getContext(data.userId)
  if (!context) {
    return
  }

  this.setContext(data.userId, {
    ...context,
    currentLocation: data,
    travelMode: data.travelMode,
    updatedAt: Date.now()
  })

  await runRulesByType.call(this, 'location', {
    userId: data.userId,
    location: data,
    context: this.getContext(data.userId)
  })
}
