import type { StructuredLogger } from '../../utils/logger'
import type { Hotel, HotelQueryInput, HotelQueryOutput } from '../types'
import { BaseWorker } from '../base-worker'

const MOCK_HOTELS: Record<string, Hotel[]> = {
  '北京': [
    { id: 'h-001', name: '北京王府井希尔顿酒店', starLevel: 5, address: '东城区王府井大街', price: 680, rating: 4.7, reviewCount: 2340, distanceFromCityCenter: 0.5, remainingRooms: 12 },
    { id: 'h-002', name: '北京前门建国饭店', starLevel: 3, address: '西城区前门西大街', price: 280, rating: 4.3, reviewCount: 1567, distanceFromCityCenter: 1.2, remainingRooms: 45 },
    { id: 'h-003', name: '北京国贸大酒店', starLevel: 5, address: '朝阳区建国门外大街1号', price: 980, rating: 4.8, reviewCount: 890, distanceFromCityCenter: 3.5, remainingRooms: 8 },
  ],
  '上海': [
    { id: 'h-101', name: '上海外滩华尔道夫酒店', starLevel: 5, address: '黄浦区中山东一路2号', price: 820, rating: 4.9, reviewCount: 3120, distanceFromCityCenter: 0.3, remainingRooms: 5 },
    { id: 'h-102', name: '上海全季酒店人民广场店', starLevel: 3, address: '黄浦区西藏中路', price: 260, rating: 4.2, reviewCount: 2100, distanceFromCityCenter: 0.8, remainingRooms: 67 },
    { id: 'h-103', name: '上海浦东香格里拉', starLevel: 5, address: '浦东新区富城路33号', price: 750, rating: 4.6, reviewCount: 1890, distanceFromCityCenter: 2.0, remainingRooms: 15 },
  ],
  '成都': [
    { id: 'h-201', name: '成都瑞吉酒店', starLevel: 5, address: '锦江区人民南路', price: 550, rating: 4.5, reviewCount: 1200, distanceFromCityCenter: 1.0, remainingRooms: 22 },
    { id: 'h-202', name: '成都宽窄巷子亚朵酒店', starLevel: 4, address: '青羊区长顺街', price: 320, rating: 4.4, reviewCount: 3400, distanceFromCityCenter: 0.6, remainingRooms: 38 },
  ],
  '杭州': [
    { id: 'h-301', name: '杭州西湖国宾馆', starLevel: 5, address: '西湖区杨公堤18号', price: 680, rating: 4.8, reviewCount: 4560, distanceFromCityCenter: 1.5, remainingRooms: 3 },
    { id: 'h-302', name: '杭州如家酒店西湖店', starLevel: 2, address: '上城区延安路', price: 180, rating: 3.8, reviewCount: 5600, distanceFromCityCenter: 0.5, remainingRooms: 89 },
  ],
  '广州': [
    { id: 'h-401', name: '广州四季酒店', starLevel: 5, address: '天河区珠江新城', price: 720, rating: 4.7, reviewCount: 2780, distanceFromCityCenter: 0.2, remainingRooms: 10 },
    { id: 'h-402', name: '广州越秀公园亚朵', starLevel: 4, address: '越秀区解放北路', price: 350, rating: 4.5, reviewCount: 1800, distanceFromCityCenter: 1.0, remainingRooms: 25 },
  ],
}

export class HotelWorker extends BaseWorker<HotelQueryInput, HotelQueryOutput> {
  readonly name = 'hotel-worker'

  protected async execute(input: HotelQueryInput, log: StructuredLogger): Promise<HotelQueryOutput> {
    const hotels = MOCK_HOTELS[input.destination] || [
      { id: 'h-default-1', name: `${input.destination}中心商务酒店`, starLevel: 4, address: `${input.destination}市中心`, price: 350, rating: 4.2, reviewCount: 800, distanceFromCityCenter: 0.5, remainingRooms: 50 },
      { id: 'h-default-2', name: `${input.destination}青年旅社`, starLevel: 2, address: `${input.destination}青年路`, price: 120, rating: 3.5, reviewCount: 2300, distanceFromCityCenter: 1.5, remainingRooms: 100 },
      { id: 'h-default-3', name: `${input.destination}度假酒店`, starLevel: 5, address: `${input.destination}度假区`, price: 600, rating: 4.4, reviewCount: 450, distanceFromCityCenter: 4.0, remainingRooms: 18 },
    ]

    // 按星级和预算过滤
    const filtered = hotels.filter(h => h.starLevel >= input.starLevel && h.price <= input.budget)

    log.step(this.name, `found ${filtered.length} hotels matching criteria`, {
      destination: input.destination,
      minStar: input.starLevel,
      budget: input.budget,
      total: hotels.length,
      filtered: filtered.length
    })

    return {
      hotels: filtered.length > 0 ? filtered : hotels.slice(0, 2),
      totalCount: hotels.length
    }
  }
}
