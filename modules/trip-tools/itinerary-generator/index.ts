import { GlobalEvent, type ICore, type IPlugin } from '../../../core'
import { generatePlans } from './src/generator'
import type { ItineraryDay, ItineraryItem, ItineraryPlan, ItineraryRequest } from './src/types'

interface PlanRequestPayload {
  userId: string
  content: string
  imageUrl?: string
}

interface AdjustByTextParams {
  userId: string
  planId: string
  instruction: string
}

interface AdjustByDragParams {
  userId: string
  planId: string
  updatedItems: Record<number, ItineraryItem[]>
}

export default class ItineraryGeneratorModule implements IPlugin {
  pluginId = 'trip-itinerary-generator'
  pluginName = 'Itinerary Generator'
  version = '1.1.0'
  dependencies: string[] = []

  public core: ICore | null = null

  private readonly boundPlanRequestHandler = this.handlePlanRequest.bind(this)

  onInstall(core: ICore) {
    this.core = core

    core.service.register('itinerary.generate', this.generate.bind(this))
    core.service.register('itinerary.adjustByText', this.adjustByText.bind(this))
    core.service.register('itinerary.adjustByDrag', this.adjustByDrag.bind(this))
    core.service.register('itinerary.getPlan', this.getPlan.bind(this))

    core.eventBus.on(GlobalEvent.PLAN_REQUEST, this.boundPlanRequestHandler)
  }

  onMount(): void {
    console.log('[trailmate] itinerary generator mounted')
  }

  onUnmount(core: ICore): void {
    core.eventBus.off(GlobalEvent.PLAN_REQUEST, this.boundPlanRequestHandler)
    console.log('[trailmate] itinerary generator unmounted')
  }

  private async handlePlanRequest(data: PlanRequestPayload): Promise<void> {
    await this.generate({
      id: `req_${Date.now()}`,
      userId: data.userId,
      content: data.content,
      imageUrl: data.imageUrl,
      createTime: Date.now()
    })
  }

  async generate(request: ItineraryRequest): Promise<ItineraryPlan[]> {
    const core = this.ensureCore()
    const [flights, hotels, attractions] = await Promise.all([
      this.queryService<any[]>('flight.query', {
        depCity: 'Beijing',
        arrCity: 'Qingdao',
        date: '2026-05-01'
      }),
      this.queryService<any[]>('hotel.query', {
        city: 'Qingdao',
        checkin: '2026-05-01',
        checkout: '2026-05-05'
      }),
      this.queryService<any[]>('attraction.query', {
        city: 'Qingdao'
      })
    ])

    const plans = generatePlans(request, flights, hotels, attractions)

    core.state.set('current.userId', request.userId)
    core.state.set('current.plans', plans)
    core.state.set('current.selectedPlanId', plans[0]?.id ?? null)
    plans.forEach((plan) => {
      core.state.set(`plan.${plan.id}`, plan)
    })

    await core.eventBus.emit(GlobalEvent.PLAN_GENERATED, {
      userId: request.userId,
      plans
    })

    return plans
  }

  async adjustByText(params: AdjustByTextParams): Promise<ItineraryPlan> {
    const core = this.ensureCore()
    const plan = core.state.get<ItineraryPlan>(`plan.${params.planId}`)
    if (!plan) {
      throw new Error(`Plan ${params.planId} was not found`)
    }

    const adjustedPlan = clonePlan(plan)
    const instruction = params.instruction.toLowerCase()

    if (instruction.includes('free afternoon') || instruction.includes('afternoon')) {
      adjustedPlan.days = adjustedPlan.days.map((day) => ({
        ...day,
        items: day.items.filter((item) => {
          const startHour = Number(item.startTime.split(':')[0] ?? '0')
          return startHour < 12 || startHour >= 18
        })
      }))
    }

    if (instruction.includes('less walking') || instruction.includes('relaxed')) {
      adjustedPlan.tags = Array.from(new Set([...adjustedPlan.tags.filter((tag) => tag !== 'explore'), 'low-walking']))
    }

    core.state.set(`plan.${params.planId}`, adjustedPlan)
    await core.eventBus.emit(GlobalEvent.PLAN_UPDATED, {
      userId: params.userId,
      plan: adjustedPlan
    })

    return adjustedPlan
  }

  async adjustByDrag(params: AdjustByDragParams): Promise<ItineraryPlan> {
    const core = this.ensureCore()
    const plan = core.state.get<ItineraryPlan>(`plan.${params.planId}`)
    if (!plan) {
      throw new Error(`Plan ${params.planId} was not found`)
    }

    const adjustedPlan = clonePlan(plan)
    Object.entries(params.updatedItems).forEach(([dayIndex, items]) => {
      const targetDay = adjustedPlan.days[Number(dayIndex)]
      if (targetDay) {
        targetDay.items = items
      }
    })

    adjustedPlan.totalCost = adjustedPlan.days.reduce((sum, day) => {
      return sum + day.items.reduce((daySum, item) => daySum + item.cost, 0)
    }, 0)

    core.state.set(`plan.${params.planId}`, adjustedPlan)
    await core.eventBus.emit(GlobalEvent.PLAN_UPDATED, {
      userId: params.userId,
      plan: adjustedPlan
    })

    return adjustedPlan
  }

  async getPlan(planId: string): Promise<ItineraryPlan | null> {
    return this.ensureCore().state.get<ItineraryPlan>(`plan.${planId}`) ?? null
  }

  private async queryService<T>(serviceName: string, params: Record<string, unknown>): Promise<T> {
    try {
      return await this.ensureCore().service.call<T>(serviceName, params)
    } catch {
      return [] as T
    }
  }

  private ensureCore(): ICore {
    if (!this.core) {
      throw new Error('Itinerary generator has not been installed')
    }

    return this.core
  }
}

function clonePlan(plan: ItineraryPlan): ItineraryPlan {
  return {
    ...plan,
    tags: [...plan.tags],
    days: plan.days.map((day) => ({
      ...day,
      items: day.items.map((item) => ({ ...item }))
    }))
  }
}
