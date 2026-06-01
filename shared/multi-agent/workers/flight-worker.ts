import type { StructuredLogger } from '../../utils/logger'
import type { Flight, FlightQueryInput, FlightQueryOutput } from '../types'
import { BaseWorker } from '../base-worker'

const MOCK_FLIGHTS: Record<string, Flight[]> = {
  '北京': [
    { id: 'f-001', flightNo: 'CA1234', depCity: '上海', arrCity: '北京', depTime: '08:00', arrTime: '10:30', airline: '中国国航', price: 680, discount: 0.85, remainingSeats: 23 },
    { id: 'f-002', flightNo: 'MU5678', depCity: '上海', arrCity: '北京', depTime: '13:00', arrTime: '15:20', airline: '东方航空', price: 520, discount: 0.9, remainingSeats: 45 },
    { id: 'f-003', flightNo: 'CZ9012', depCity: '上海', arrCity: '北京', depTime: '18:30', arrTime: '21:00', airline: '南方航空', price: 450, discount: 0.8, remainingSeats: 12 },
    { id: 'f-004', flightNo: 'HU7602', depCity: '广州', arrCity: '北京', depTime: '09:20', arrTime: '12:30', airline: '海南航空', price: 780, discount: 0.82, remainingSeats: 20 },
  ],
  '上海': [
    { id: 'f-101', flightNo: 'CA1111', depCity: '北京', arrCity: '上海', depTime: '07:30', arrTime: '09:50', airline: '中国国航', price: 720, discount: 0.88, remainingSeats: 30 },
    { id: 'f-102', flightNo: 'MU2222', depCity: '北京', arrCity: '上海', depTime: '14:00', arrTime: '16:15', airline: '东方航空', price: 550, discount: 0.9, remainingSeats: 18 },
    { id: 'f-103', flightNo: 'CZ8901', depCity: '广州', arrCity: '上海', depTime: '11:00', arrTime: '13:20', airline: '南方航空', price: 600, discount: 0.85, remainingSeats: 35 },
  ],
  '成都': [
    { id: 'f-201', flightNo: 'CA3333', depCity: '上海', arrCity: '成都', depTime: '09:00', arrTime: '12:00', airline: '中国国航', price: 890, discount: 0.85, remainingSeats: 40 },
    { id: 'f-202', flightNo: '3U4444', depCity: '上海', arrCity: '成都', depTime: '16:00', arrTime: '19:10', airline: '四川航空', price: 620, discount: 0.75, remainingSeats: 25 },
    { id: 'f-203', flightNo: 'CA4194', depCity: '北京', arrCity: '成都', depTime: '08:30', arrTime: '11:30', airline: '中国国航', price: 760, discount: 0.8, remainingSeats: 33, depDate: '2026-06-15' },
  ],
  '杭州': [
    { id: 'f-301', flightNo: 'MU5555', depCity: '上海', arrCity: '杭州', depTime: '08:30', arrTime: '09:15', airline: '东方航空', price: 320, discount: 0.95, remainingSeats: 56 },
    { id: 'f-302', flightNo: 'CA6666', depCity: '上海', arrCity: '杭州', depTime: '17:00', arrTime: '17:45', airline: '中国国航', price: 280, discount: 0.9, remainingSeats: 34 },
    { id: 'f-303', flightNo: 'CA1711', depCity: '北京', arrCity: '杭州', depTime: '10:00', arrTime: '12:15', airline: '中国国航', price: 620, discount: 0.82, remainingSeats: 29 },
  ],
  '广州': [
    { id: 'f-401', flightNo: 'CZ7777', depCity: '上海', arrCity: '广州', depTime: '10:00', arrTime: '12:30', airline: '南方航空', price: 780, discount: 0.85, remainingSeats: 28 },
    { id: 'f-402', flightNo: 'MU8888', depCity: '上海', arrCity: '广州', depTime: '19:00', arrTime: '21:20', airline: '东方航空', price: 650, discount: 0.9, remainingSeats: 15 },
    { id: 'f-403', flightNo: 'CA1831', depCity: '北京', arrCity: '广州', depTime: '14:30', arrTime: '17:45', airline: '中国国航', price: 850, discount: 0.78, remainingSeats: 16 },
  ],
  '深圳': [
    { id: 'f-501', flightNo: 'ZH9112', depCity: '北京', arrCity: '深圳', depTime: '08:00', arrTime: '11:15', airline: '深圳航空', price: 860, discount: 0.78, remainingSeats: 20 },
    { id: 'f-502', flightNo: 'CZ3155', depCity: '上海', arrCity: '深圳', depTime: '14:30', arrTime: '17:00', airline: '南方航空', price: 680, discount: 0.8, remainingSeats: 26 },
    { id: 'f-503', flightNo: 'HU3457', depCity: '成都', arrCity: '深圳', depTime: '11:00', arrTime: '13:50', airline: '海南航空', price: 750, discount: 0.82, remainingSeats: 18, depDate: '2026-06-20' },
  ],
  '西安': [
    { id: 'f-601', flightNo: 'CA1205', depCity: '北京', arrCity: '西安', depTime: '07:50', arrTime: '10:00', airline: '中国国航', price: 550, discount: 0.8, remainingSeats: 40 },
    { id: 'f-602', flightNo: 'MU2153', depCity: '上海', arrCity: '西安', depTime: '15:30', arrTime: '18:00', airline: '东方航空', price: 520, discount: 0.78, remainingSeats: 32 },
    { id: 'f-603', flightNo: '3U8883', depCity: '成都', arrCity: '西安', depTime: '10:30', arrTime: '12:00', airline: '四川航空', price: 380, discount: 0.8, remainingSeats: 34 },
  ],
  '重庆': [
    { id: 'f-701', flightNo: '3U8830', depCity: '北京', arrCity: '重庆', depTime: '08:20', arrTime: '11:10', airline: '四川航空', price: 720, discount: 0.78, remainingSeats: 26 },
    { id: 'f-702', flightNo: 'MU2866', depCity: '上海', arrCity: '重庆', depTime: '13:00', arrTime: '15:50', airline: '东方航空', price: 580, discount: 0.8, remainingSeats: 35 },
    { id: 'f-703', flightNo: 'CZ8119', depCity: '广州', arrCity: '重庆', depTime: '16:30', arrTime: '18:50', airline: '南方航空', price: 620, discount: 0.75, remainingSeats: 22 },
  ],
  '南京': [
    { id: 'f-801', flightNo: 'CA1509', depCity: '北京', arrCity: '南京', depTime: '07:00', arrTime: '09:00', airline: '中国国航', price: 530, discount: 0.82, remainingSeats: 34 },
    { id: 'f-802', flightNo: 'MU2802', depCity: '上海', arrCity: '南京', depTime: '14:00', arrTime: '15:00', airline: '东方航空', price: 380, discount: 0.85, remainingSeats: 45 },
    { id: 'f-803', flightNo: 'CZ5699', depCity: '成都', arrCity: '南京', depTime: '09:30', arrTime: '11:50', airline: '南方航空', price: 620, discount: 0.78, remainingSeats: 20, depDate: '2026-06-18' },
  ],
  '厦门': [
    { id: 'f-901', flightNo: 'MF8106', depCity: '北京', arrCity: '厦门', depTime: '07:40', arrTime: '10:30', airline: '厦门航空', price: 780, discount: 0.8, remainingSeats: 20 },
    { id: 'f-902', flightNo: 'MU5176', depCity: '上海', arrCity: '厦门', depTime: '12:00', arrTime: '14:00', airline: '东方航空', price: 560, discount: 0.78, remainingSeats: 30 },
    { id: 'f-903', flightNo: 'CZ8955', depCity: '广州', arrCity: '厦门', depTime: '17:30', arrTime: '19:00', airline: '南方航空', price: 440, discount: 0.8, remainingSeats: 38 },
  ],
  '长沙': [
    { id: 'f-1001', flightNo: 'CA1343', depCity: '北京', arrCity: '长沙', depTime: '08:10', arrTime: '10:30', airline: '中国国航', price: 580, discount: 0.78, remainingSeats: 31 },
    { id: 'f-1002', flightNo: 'MU5387', depCity: '上海', arrCity: '长沙', depTime: '15:30', arrTime: '17:30', airline: '东方航空', price: 480, discount: 0.75, remainingSeats: 28 },
    { id: 'f-1003', flightNo: 'CZ5693', depCity: '广州', arrCity: '长沙', depTime: '10:00', arrTime: '11:30', airline: '南方航空', price: 420, discount: 0.82, remainingSeats: 35, depDate: '2026-06-22' },
  ],
  '武汉': [
    { id: 'f-1101', flightNo: 'CA8201', depCity: '北京', arrCity: '武汉', depTime: '08:30', arrTime: '10:40', airline: '中国国航', price: 540, discount: 0.8, remainingSeats: 28 },
    { id: 'f-1102', flightNo: 'MU2456', depCity: '上海', arrCity: '武汉', depTime: '14:00', arrTime: '16:00', airline: '东方航空', price: 420, discount: 0.78, remainingSeats: 40 },
    { id: 'f-1103', flightNo: 'CZ3167', depCity: '广州', arrCity: '武汉', depTime: '19:00', arrTime: '20:50', airline: '南方航空', price: 460, discount: 0.75, remainingSeats: 25 },
  ],
  '昆明': [
    { id: 'f-1201', flightNo: 'CA4171', depCity: '北京', arrCity: '昆明', depTime: '07:20', arrTime: '11:00', airline: '中国国航', price: 1050, discount: 0.78, remainingSeats: 18 },
    { id: 'f-1202', flightNo: 'MU5708', depCity: '上海', arrCity: '昆明', depTime: '14:30', arrTime: '18:00', airline: '东方航空', price: 920, discount: 0.8, remainingSeats: 25, depDate: '2026-06-25' },
    { id: 'f-1203', flightNo: '3U8669', depCity: '成都', arrCity: '昆明', depTime: '09:00', arrTime: '10:30', airline: '四川航空', price: 380, discount: 0.85, remainingSeats: 42 },
  ],
  '三亚': [
    { id: 'f-1301', flightNo: 'HU7979', depCity: '北京', arrCity: '三亚', depTime: '07:00', arrTime: '11:00', airline: '海南航空', price: 1200, discount: 0.8, remainingSeats: 22 },
    { id: 'f-1302', flightNo: 'CZ6712', depCity: '上海', arrCity: '三亚', depTime: '14:00', arrTime: '17:30', airline: '南方航空', price: 980, discount: 0.78, remainingSeats: 16 },
    { id: 'f-1303', flightNo: 'MU5745', depCity: '成都', arrCity: '三亚', depTime: '11:30', arrTime: '14:40', airline: '东方航空', price: 860, discount: 0.75, remainingSeats: 30 },
  ],
  '哈尔滨': [
    { id: 'f-1401', flightNo: 'CA1603', depCity: '北京', arrCity: '哈尔滨', depTime: '07:30', arrTime: '09:30', airline: '中国国航', price: 480, discount: 0.78, remainingSeats: 36 },
    { id: 'f-1402', flightNo: 'MU5197', depCity: '上海', arrCity: '哈尔滨', depTime: '12:00', arrTime: '14:30', airline: '东方航空', price: 720, discount: 0.8, remainingSeats: 25 },
    { id: 'f-1403', flightNo: 'CZ6204', depCity: '广州', arrCity: '哈尔滨', depTime: '15:00', arrTime: '19:00', airline: '南方航空', price: 980, discount: 0.78, remainingSeats: 15, depDate: '2026-07-01' },
  ],
  '桂林': [
    { id: 'f-1501', flightNo: 'CA1471', depCity: '北京', arrCity: '桂林', depTime: '08:00', arrTime: '10:50', airline: '中国国航', price: 730, discount: 0.78, remainingSeats: 25 },
    { id: 'f-1502', flightNo: 'MU5832', depCity: '上海', arrCity: '桂林', depTime: '14:00', arrTime: '16:20', airline: '东方航空', price: 580, discount: 0.8, remainingSeats: 32 },
    { id: 'f-1503', flightNo: 'CZ3286', depCity: '广州', arrCity: '桂林', depTime: '09:30', arrTime: '10:50', airline: '南方航空', price: 320, discount: 0.88, remainingSeats: 48 },
  ],
  '丽江': [
    { id: 'f-1601', flightNo: 'CA1459', depCity: '北京', arrCity: '丽江', depTime: '07:10', arrTime: '10:50', airline: '中国国航', price: 1120, discount: 0.78, remainingSeats: 15 },
    { id: 'f-1602', flightNo: '3U8699', depCity: '上海', arrCity: '丽江', depTime: '13:00', arrTime: '16:30', airline: '四川航空', price: 980, discount: 0.8, remainingSeats: 22, depDate: '2026-07-05' },
    { id: 'f-1603', flightNo: 'CZ6683', depCity: '成都', arrCity: '丽江', depTime: '09:30', arrTime: '11:00', airline: '南方航空', price: 380, discount: 0.85, remainingSeats: 35 },
  ],
  '青岛': [
    { id: 'f-1701', flightNo: 'CA1234', depCity: '北京', arrCity: '青岛', depTime: '07:30', arrTime: '09:15', airline: '中国国航', price: 680, discount: 0.75, remainingSeats: 23 },
    { id: 'f-1702', flightNo: 'MU5679', depCity: '上海', arrCity: '青岛', depTime: '12:30', arrTime: '14:15', airline: '东方航空', price: 490, discount: 0.62, remainingSeats: 27 },
    { id: 'f-1703', flightNo: 'CZ9013', depCity: '广州', arrCity: '青岛', depTime: '09:45', arrTime: '12:30', airline: '南方航空', price: 980, discount: 0.78, remainingSeats: 12 },
  ],
  '拉萨': [
    { id: 'f-1801', flightNo: 'CA4123', depCity: '北京', arrCity: '拉萨', depTime: '06:30', arrTime: '11:00', airline: '中国国航', price: 1580, discount: 0.85, remainingSeats: 15 },
    { id: 'f-1802', flightNo: 'MU5821', depCity: '上海', arrCity: '拉萨', depTime: '07:00', arrTime: '12:30', airline: '东方航空', price: 1820, discount: 0.82, remainingSeats: 12 },
    { id: 'f-1803', flightNo: '3U8800', depCity: '成都', arrCity: '拉萨', depTime: '08:30', arrTime: '11:00', airline: '四川航空', price: 780, discount: 0.8, remainingSeats: 28, depDate: '2026-06-30' },
  ],
}

export class FlightWorker extends BaseWorker<FlightQueryInput, FlightQueryOutput> {
  readonly name = 'flight-worker'

  protected async execute(input: FlightQueryInput, log: StructuredLogger): Promise<FlightQueryOutput> {
    const flights = MOCK_FLIGHTS[input.destination] || [
      { id: 'f-default-1', flightNo: 'DEFAULT01', depCity: '上海', arrCity: input.destination, depTime: '09:00', arrTime: '11:30', airline: '通用航空', price: 500, discount: 0.9, remainingSeats: 20 },
      { id: 'f-default-2', flightNo: 'DEFAULT02', depCity: '上海', arrCity: input.destination, depTime: '15:00', arrTime: '17:30', airline: '通用航空', price: 400, discount: 0.85, remainingSeats: 35 },
    ]

    // 按日期过滤：如果传入了日期，只保留 depDate 匹配或无 depDate 的航班
    const dateFiltered = input.date
      ? flights.filter(f => !f.depDate || f.depDate === input.date)
      : flights

    // 按预算过滤
    const filtered = dateFiltered.filter(f => f.price <= input.budget)

    log.step(this.name, `found ${filtered.length} flights within budget`, {
      destination: input.destination,
      date: input.date || 'any',
      budget: input.budget,
      total: dateFiltered.length,
      filtered: filtered.length
    })

    return {
      flights: filtered.length > 0 ? filtered : flights.slice(0, 1),
      totalCount: flights.length
    }
  }
}
