import type { Flight, Hotel, Attraction } from '../types/travel.types'
export type { Flight, Hotel, Attraction }

// ====== Agent 间通信的标准消息格式 ======
export interface AgentMessage<T = unknown> {
  id: string
  type: 'task' | 'result' | 'error'
  from: string
  to: string
  payload: T
  timestamp: number
  correlationId: string
}

// ====== Flight Worker ======
export interface FlightQueryInput {
  destination: string
  date: string
  budget: number
}

export interface FlightQueryOutput {
  flights: Flight[]
  totalCount: number
}

// ====== Hotel Worker ======
export interface HotelQueryInput {
  destination: string
  checkIn: string
  starLevel: number
  budget: number
}

export interface HotelQueryOutput {
  hotels: Hotel[]
  totalCount: number
}

// ====== Attraction Worker ======
export interface AttractionQueryInput {
  destination: string
  tags: string[]
}

export interface AttractionQueryOutput {
  attractions: Attraction[]
  totalCount: number
}

// ====== Intent 解析结果 ======
export interface ParsedIntent {
  destination: string
  days: number
  budget: number
  tags: string[]
  checkIn?: string
}

// ====== Exchange Worker ======
export interface ExchangeQueryInput {
  fromCurrency: string
  toCurrency: string
  amount: number
}

export interface ExchangeQueryOutput {
  rate: number
  result: number
  fromCurrency: string
  toCurrency: string
  date: string
}

// ====== Orchestrator 汇总输出 ======
export interface OrchestratorOutput {
  traceId: string
  intent: ParsedIntent
  flights: FlightQueryOutput | null
  hotels: HotelQueryOutput | null
  attractions: AttractionQueryOutput | null
  exchange: ExchangeQueryOutput | null
  summary: string
  durationMs: number
  errors: string[]
}
