import { createLogger, generateTraceId } from '../utils/logger'
import { FlightWorker } from './workers/flight-worker'
import { HotelWorker } from './workers/hotel-worker'
import { AttractionWorker } from './workers/attraction-worker'
import { ExchangeWorker } from './workers/exchange-worker'
import type {
  ParsedIntent,
  FlightQueryInput,
  HotelQueryInput,
  AttractionQueryInput,
  ExchangeQueryInput,
  ExchangeQueryOutput,
  FlightQueryOutput,
  HotelQueryOutput,
  AttractionQueryOutput,
  OrchestratorOutput,
  AgentMessage
} from './types'

export class TravelOrchestrator {
  private flightWorker = new FlightWorker()
  private hotelWorker = new HotelWorker()
  private attractionWorker = new AttractionWorker()
  private exchangeWorker = new ExchangeWorker()

  async orchestrate(userInput: string): Promise<OrchestratorOutput> {
    const traceId = generateTraceId()
    const log = createLogger(traceId)
    const startTime = Date.now()
    const errors: string[] = []

    log.entry('orchestration started', { userInput })

    // ---- Step 1: 解析用户意图 ----
    const intent = this.parseIntent(userInput)
    log.step('intent-parsed', 'user intent extracted', { intent })

    // ---- Step 2: 并行分发给 Worker ----
    const flightInput: FlightQueryInput = {
      destination: intent.destination,
      date: intent.checkIn || '2026-06-01',
      budget: Math.round(intent.budget * 0.3) // 机票占预算 30%
    }

    const hotelInput: HotelQueryInput = {
      destination: intent.destination,
      checkIn: intent.checkIn || '2026-06-01',
      starLevel: intent.budget > 3000 ? 4 : 3,
      budget: Math.round(intent.budget * 0.4) // 酒店占预算 40%
    }

    const attractionInput: AttractionQueryInput = {
      destination: intent.destination,
      tags: intent.tags
    }

    // 检测是否需要查询汇率（用户提及外币相关关键词时）
    const hasExchangeIntent = /汇率|外币|美元|欧元|英镑|日元|韩元|泰铢|港币|exchange|currency|usd|eur|jpy|gbp/i.test(userInput)
    const exchangeInput: ExchangeQueryInput = {
      fromCurrency: 'CNY',
      toCurrency: hasExchangeIntent ? this.detectTargetCurrency(userInput) : 'USD',
      amount: intent.budget
    }

    log.step('dispatching', 'dispatching tasks to workers', {
      workers: ['flight-worker', 'hotel-worker', 'attraction-worker', 'exchange-worker']
    })

    const [flightSettled, hotelSettled, attractionSettled, exchangeSettled] = await Promise.allSettled([
      this.flightWorker.run(flightInput, traceId),
      this.hotelWorker.run(hotelInput, traceId),
      this.attractionWorker.run(attractionInput, traceId),
      this.exchangeWorker.run(exchangeInput, traceId)
    ])

    // ---- Step 3: 汇总结果 ----
    const flights = this.unwrapResult<FlightQueryOutput>(flightSettled, errors)
    const hotels = this.unwrapResult<HotelQueryOutput>(hotelSettled, errors)
    const attractions = this.unwrapResult<AttractionQueryOutput>(attractionSettled, errors)
    const exchange = this.unwrapResult<ExchangeQueryOutput>(exchangeSettled, errors)

    const summary = this.buildSummary(intent, flights, hotels, attractions, exchange)

    const durationMs = Date.now() - startTime
    log.exit('orchestration completed', durationMs, {
      flights: flights?.totalCount ?? 0,
      hotels: hotels?.totalCount ?? 0,
      attractions: attractions?.totalCount ?? 0,
      exchangeRate: exchange ? `${exchange.fromCurrency}→${exchange.toCurrency}: ${exchange.rate}` : null,
      errors: errors.length
    })

    return {
      traceId,
      intent,
      flights,
      hotels,
      attractions,
      exchange,
      summary,
      durationMs,
      errors
    }
  }

  /** 从用户输入中提取目的地、天数、预算 */
  private parseIntent(userInput: string): ParsedIntent {
    // 提取目的地（中文城市名）
    const cityPattern = /(北京|上海|成都|杭州|广州|深圳|西安|重庆|南京|厦门|长沙|大理|武汉|苏州|昆明|三亚|青岛|拉萨|哈尔滨|桂林|丽江)/
    const cityMatch = userInput.match(cityPattern)
    const destination = cityMatch ? cityMatch[1] : '北京'

    // 提取天数
    const dayPattern = /(\d+)\s*天/
    const dayMatch = userInput.match(dayPattern)
    const days = dayMatch ? parseInt(dayMatch[1]) : 3

    // 提取预算
    const budgetPattern = /预算\s*(\d+)/i
    const budgetMatch = userInput.match(budgetPattern)
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : 3000

    // 提取标签/偏好
    const tags: string[] = []
    if (/美食|吃/.test(userInput)) tags.push('美食')
    if (/历史|文化|古迹|古都/.test(userInput)) tags.push('历史文化')
    if (/自然|风景|山|水|海/.test(userInput)) tags.push('自然风光')
    if (/亲子|孩子|小孩/.test(userInput)) tags.push('亲子')
    if (/购物|买/.test(userInput)) tags.push('购物')

    return { destination, days, budget, tags, checkIn: '2026-06-01' }
  }

  /** 从 PromiseSettledResult 安全提取 Worker 结果 */
  private unwrapResult<T>(
    settled: PromiseSettledResult<AgentMessage<T>>,
    errors: string[]
  ): T | null {
    if (settled.status === 'rejected') {
      errors.push(`Worker rejected: ${(settled as PromiseRejectedResult).reason}`)
      return null
    }

    const msg = (settled as PromiseFulfilledResult<AgentMessage<T>>).value
    if (msg.type === 'error') {
      errors.push(`${msg.from} returned error`)
      return null
    }

    return msg.payload
  }

  /** 汇总生成自然语言描述 */
  private buildSummary(
    intent: ParsedIntent,
    flights: FlightQueryOutput | null,
    hotels: HotelQueryOutput | null,
    attractions: AttractionQueryOutput | null,
    exchange: ExchangeQueryOutput | null
  ): string {
    const parts: string[] = []

    parts.push(`为您规划${intent.destination}${intent.days}天旅行：`)

    if (flights && flights.flights.length > 0) {
      const cheapest = flights.flights.reduce((a, b) => a.price < b.price ? a : b)
      parts.push(`机票方面，找到 ${flights.totalCount} 个航班，最低 ¥${cheapest.price}（${cheapest.airline} ${cheapest.flightNo}）。`)
    } else {
      parts.push('机票暂未找到匹配航班。')
    }

    if (hotels && hotels.hotels.length > 0) {
      const names = hotels.hotels.map(h => h.name).join('、')
      parts.push(`酒店推荐 ${hotels.totalCount} 家，包括 ${names}。`)
    } else {
      parts.push('酒店暂未找到匹配选项。')
    }

    if (attractions && attractions.attractions.length > 0) {
      const names = attractions.attractions.map(a => a.name).join('、')
      parts.push(`景点推荐 ${attractions.totalCount} 个，包括 ${names}。`)
    } else {
      parts.push('景点暂未找到推荐。')
    }

    parts.push(`预估总预算 ¥${intent.budget}。`)

    if (exchange) {
      parts.push(`当前汇率参考：1 ${exchange.fromCurrency} ≈ ${exchange.rate} ${exchange.toCurrency}，${exchange.amount} ${exchange.fromCurrency} 约合 ${exchange.result.toFixed(2)} ${exchange.toCurrency}。`)
    }

    return parts.join('')
  }

  /** 从用户输入中检测用户关心的目标货币 */
  private detectTargetCurrency(userInput: string): string {
    if (/美元|usd/i.test(userInput)) return 'USD'
    if (/欧元|eur/i.test(userInput)) return 'EUR'
    if (/英镑|gbp/i.test(userInput)) return 'GBP'
    if (/日元|jpy/i.test(userInput)) return 'JPY'
    if (/韩元|krw/i.test(userInput)) return 'KRW'
    if (/泰铢|thb/i.test(userInput)) return 'THB'
    if (/港币|hkd/i.test(userInput)) return 'HKD'
    return 'USD'
  }
}
