import type { IPlugin, ICore, GlobalEvent } from '@trailmate/core'
import type { ItineraryRequest, ItineraryPlan } from './src/types'
import { generatePlans } from './src/generator'

export default class ItineraryGeneratorModule implements IPlugin {
  pluginId = 'trip-itinerary-generator'
  pluginName = '行程规划引擎模块'
  version = '1.0.0'
  // 演示版暂不依赖配置模块，后续开发完成后再恢复
  dependencies = []

  private core: ICore | null = null

  onInstall(core: ICore) {
    this.core = core

    // 注册对外服务
    core.service.register('itinerary.generate', this.generate.bind(this))
    core.service.register('itinerary.adjustByText', this.adjustByText.bind(this))
    core.service.register('itinerary.adjustByDrag', this.adjustByDrag.bind(this))
    core.service.register('itinerary.getPlan', this.getPlan.bind(this))

    // 订阅行程请求事件
    core.eventBus.on(GlobalEvent.PLAN_REQUEST, this.handlePlanRequest.bind(this))
  }

  onMount(core: ICore) {
    console.log('✅ 行程规划引擎模块启动成功')
  }

  onUnmount(core: ICore) {
    core.eventBus.off(GlobalEvent.PLAN_REQUEST, this.handlePlanRequest)
    console.log('🛑 行程规划引擎模块已卸载')
  }

  /**
   * 处理行程生成请求
   */
  private async handlePlanRequest(data: { userId: string; content: string; imageUrl?: string }) {
    const request: ItineraryRequest = {
      id: `req_${Date.now()}`,
      userId: data.userId,
      content: data.content,
      imageUrl: data.imageUrl,
      createTime: Date.now()
    }

    const plans = await this.generate(request)

    // 保存到全局状态，其他模块自动感知
    this.core?.state.set('current.plans', plans)
    // 保存单条行程缓存
    plans.forEach(plan => {
      this.core?.state.set(`plan.${plan.id}`, plan)
    })

    // 发布生成完成事件
    await this.core?.eventBus.emit(GlobalEvent.PLAN_GENERATED, { plans })
  }

  /**
   * 生成多套行程方案
   */
  async generate(request: ItineraryRequest): Promise<ItineraryPlan[]> {
    // 并行调用各基础服务获取数据，core为空时降级返回空数组
    const [flights, hotels, attractions] = await Promise.allSettled([
      this.core?.service.call('flight.query', {
        depCity: '北京',
        arrCity: '青岛',
        date: '2026-05-01'
      }).catch(() => []) ?? Promise.resolve([]),
      this.core?.service.call('hotel.query', {
        city: '青岛',
        checkin: '2026-05-01',
        checkout: '2026-05-05'
      }).catch(() => []) ?? Promise.resolve([]),
      this.core?.service.call('attraction.query', {
        city: '青岛'
      }).catch(() => []) ?? Promise.resolve([])
    ])

    return generatePlans(
      request,
      flights.status === 'fulfilled' ? flights.value : [],
      hotels.status === 'fulfilled' ? hotels.value : [],
      attractions.status === 'fulfilled' ? attractions.value : []
    )
  }

  /**
   * 根据文本指令调整行程
   */
  async adjustByText(planId: string, instruction: string): Promise<ItineraryPlan> {
    const plan = this.core?.state.get<ItineraryPlan>(`plan.${planId}`)
    if (!plan) {
      throw new Error('行程不存在')
    }

    // 演示版调整逻辑：简单的指令解析
    const adjustedPlan = JSON.parse(JSON.stringify(plan)) as ItineraryPlan

    if (instruction.includes('下午空出来') || instruction.includes('下午自由活动')) {
      adjustedPlan.days.forEach(day => {
        day.items = day.items.filter(item => {
          const hour = parseInt(item.startTime.split(':')[0])
          return hour < 12 || hour >= 19
        })
      })
    }

    if (instruction.includes('减少步行') || instruction.includes('少走路')) {
      adjustedPlan.tags = [...adjustedPlan.tags.filter(t => t !== '多步行'), '少步行']
    }

    // 更新状态并发布事件
    this.core?.state.set(`plan.${planId}`, adjustedPlan)
    await this.core?.eventBus.emit(GlobalEvent.PLAN_UPDATED, { plan: adjustedPlan })

    return adjustedPlan
  }

  /**
   * 拖拽调整行程
   */
  async adjustByDrag(planId: string, updatedItems: Record<number, any[]>): Promise<ItineraryPlan> {
    const plan = this.core?.state.get<ItineraryPlan>(`plan.${planId}`)
    if (!plan) {
      throw new Error('行程不存在')
    }

    const adjustedPlan = JSON.parse(JSON.stringify(plan)) as ItineraryPlan

    Object.entries(updatedItems).forEach(([dayIndex, items]) => {
      const day = adjustedPlan.days[parseInt(dayIndex)]
      if (day) {
        day.items = items
      }
    })

    this.core?.state.set(`plan.${planId}`, adjustedPlan)
    await this.core?.eventBus.emit(GlobalEvent.PLAN_UPDATED, { plan: adjustedPlan })

    return adjustedPlan
  }

  /**
   * 获取行程详情
   */
  async getPlan(planId: string): Promise<ItineraryPlan | null> {
    return this.core?.state.get<ItineraryPlan>(`plan.${planId}`) || null
  }
}
