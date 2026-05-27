import type { StructuredLogger } from '../../utils/logger'
import type { Flight, FlightQueryInput, FlightQueryOutput } from '../types'
import { BaseWorker } from '../base-worker'

const MOCK_FLIGHTS: Record<string, Flight[]> = {
  '北京': [
    { id: 'f-001', flightNo: 'CA1234', depCity: '上海', arrCity: '北京', depTime: '08:00', arrTime: '10:30', airline: '中国国航', price: 680, discount: 0.85, remainingSeats: 23 },
    { id: 'f-002', flightNo: 'MU5678', depCity: '上海', arrCity: '北京', depTime: '13:00', arrTime: '15:20', airline: '东方航空', price: 520, discount: 0.9, remainingSeats: 45 },
    { id: 'f-003', flightNo: 'CZ9012', depCity: '上海', arrCity: '北京', depTime: '18:30', arrTime: '21:00', airline: '南方航空', price: 450, discount: 0.8, remainingSeats: 12 },
  ],
  '上海': [
    { id: 'f-101', flightNo: 'CA1111', depCity: '北京', arrCity: '上海', depTime: '07:30', arrTime: '09:50', airline: '中国国航', price: 720, discount: 0.88, remainingSeats: 30 },
    { id: 'f-102', flightNo: 'MU2222', depCity: '北京', arrCity: '上海', depTime: '14:00', arrTime: '16:15', airline: '东方航空', price: 550, discount: 0.9, remainingSeats: 18 },
  ],
  '成都': [
    { id: 'f-201', flightNo: 'CA3333', depCity: '上海', arrCity: '成都', depTime: '09:00', arrTime: '12:00', airline: '中国国航', price: 890, discount: 0.85, remainingSeats: 40 },
    { id: 'f-202', flightNo: '3U4444', depCity: '上海', arrCity: '成都', depTime: '16:00', arrTime: '19:10', airline: '四川航空', price: 620, discount: 0.75, remainingSeats: 25 },
  ],
  '杭州': [
    { id: 'f-301', flightNo: 'MU5555', depCity: '上海', arrCity: '杭州', depTime: '08:30', arrTime: '09:15', airline: '东方航空', price: 320, discount: 0.95, remainingSeats: 56 },
    { id: 'f-302', flightNo: 'CA6666', depCity: '上海', arrCity: '杭州', depTime: '17:00', arrTime: '17:45', airline: '中国国航', price: 280, discount: 0.9, remainingSeats: 34 },
  ],
  '广州': [
    { id: 'f-401', flightNo: 'CZ7777', depCity: '上海', arrCity: '广州', depTime: '10:00', arrTime: '12:30', airline: '南方航空', price: 780, discount: 0.85, remainingSeats: 28 },
    { id: 'f-402', flightNo: 'MU8888', depCity: '上海', arrCity: '广州', depTime: '19:00', arrTime: '21:20', airline: '东方航空', price: 650, discount: 0.9, remainingSeats: 15 },
  ],
}

export class FlightWorker extends BaseWorker<FlightQueryInput, FlightQueryOutput> {
  readonly name = 'flight-worker'

  protected async execute(input: FlightQueryInput, log: StructuredLogger): Promise<FlightQueryOutput> {
    const flights = MOCK_FLIGHTS[input.destination] || [
      { id: 'f-default-1', flightNo: 'DEFAULT01', depCity: '上海', arrCity: input.destination, depTime: '09:00', arrTime: '11:30', airline: '通用航空', price: 500, discount: 0.9, remainingSeats: 20 },
      { id: 'f-default-2', flightNo: 'DEFAULT02', depCity: '上海', arrCity: input.destination, depTime: '15:00', arrTime: '17:30', airline: '通用航空', price: 400, discount: 0.85, remainingSeats: 35 },
    ]

    // 按预算过滤
    const filtered = flights.filter(f => f.price <= input.budget)

    log.step(this.name, `found ${filtered.length} flights within budget`, {
      destination: input.destination,
      budget: input.budget,
      total: flights.length,
      filtered: filtered.length
    })

    return {
      flights: filtered.length > 0 ? filtered : flights.slice(0, 1),
      totalCount: flights.length
    }
  }
}
