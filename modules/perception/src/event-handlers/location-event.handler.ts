import type PerceptionModule from '../../index'
import type { LocationInfo } from '../types'
import { runRulesByType } from '../services/rule-engine.service'
import { getTimelineSnapshot } from '../services/timeline.service'

/**
 * Fetch weather data from Baidu weather API.
 * Falls back gracefully when the API is unavailable (e.g. in test / no-network).
 */
async function fetchWeather(
  _lat: number,
  _lng: number
): Promise<{ condition: string; temperature: number } | null> {
  try {
    const BAIDU_MAP_AK = (import.meta as any).env?.VITE_BAIDU_MAP_AK as string | undefined
    if (!BAIDU_MAP_AK) {
      // No API key — return a safe fallback for dev / test
      return null
    }

    const url = `/api/baidumap/weather/v1/?district_id=${_lng.toFixed(4)},${_lat.toFixed(4)}&data_type=now&ak=${BAIDU_MAP_AK}`
    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    if (data.status === 0 && data.result?.now) {
      return {
        condition: data.result.now.text || '',
        temperature: data.result.now.temp ?? 0
      }
    }
    return null
  } catch {
    // Graceful degradation — weather rules simply won't fire
    return null
  }
}

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

  const timeline = context.planId ? getTimelineSnapshot(context.planId) : []
  const baseParams = {
    userId: data.userId,
    location: data,
    context: this.getContext(data.userId),
    timeline
  }

  // 并行执行位置类规则 + 拥堵规则
  await Promise.all([
    runRulesByType.call(this, 'location', baseParams),
    runRulesByType.call(this, 'congestion', baseParams)
  ])

  // 异步拉取天气并触发天气规则（不阻塞主流程）
  fetchWeather(data.latitude, data.longitude).then(async (weather) => {
    if (weather) {
      await runRulesByType.call(this, 'weather', {
        ...baseParams,
        weather
      })
    }
  }).catch(() => {
    // Silent fail — weather is best-effort
  })
}
