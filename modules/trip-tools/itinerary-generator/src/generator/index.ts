import type { ItineraryRequest, ItineraryPlan, ItineraryItem } from '../types'

interface FlightInfo {
  flightNumber: string
  depCity: string
  arrCity: string
  depTime: string
  arrTime: string
  price: number
  airline: string
}

interface HotelInfo {
  name: string
  address: string
  price: number
  star: number
  checkin: string
  checkout: string
  facilities: string[]
}

interface AttractionInfo {
  name: string
  address: string
  price: number
  duration: string
  tags: string[]
  position: { lat: number; lng: number }
}

export function generatePlans(
  request: ItineraryRequest,
  flights: FlightInfo[] = [],
  hotels: HotelInfo[] = [],
  attractions: AttractionInfo[] = []
): ItineraryPlan[] {
  return [
    generateFamilyPlan(request, flights, hotels, attractions),
    generateAdventurePlan(request, flights, hotels, attractions)
  ]
}

function generateFamilyPlan(
  request: ItineraryRequest,
  flights: any[],
  hotels: any[],
  attractions: any[]
): ItineraryPlan {
  return {
    id: `plan_${Date.now()}_family`,
    requestId: request.id,
    name: '亲子休闲4日游',
    description: '专为带娃家庭设计，节奏宽松，景点友好',
    tags: ['亲子', '休闲', '少步行'],
    totalDays: 4,
    totalCost: 3200,
    days: [
      {
        day: 1,
        items: [
          {
            id: 'item_1_1',
            type: 'flight',
            name: '北京→青岛',
            startTime: '08:00',
            endTime: '11:30',
            cost: 680,
            description: '国航CA1501，经济舱',
            address: '北京大兴国际机场'
          },
          {
            id: 'item_1_2',
            type: 'traffic',
            name: '机场→酒店',
            startTime: '12:00',
            endTime: '13:00',
            cost: 80,
            description: '出租车，约40分钟车程'
          },
          {
            id: 'item_1_3',
            type: 'food',
            name: '午餐',
            startTime: '13:30',
            endTime: '14:30',
            cost: 200,
            description: '本地海鲜家常菜，儿童友好'
          },
          {
            id: 'item_1_4',
            type: 'hotel',
            name: '青岛海景度假酒店',
            startTime: '14:00',
            endTime: '次日12:00',
            cost: 890,
            description: '近沙滩，有儿童乐园，含双早',
            address: '黄岛区金沙滩路1377号'
          },
          {
            id: 'item_1_5',
            type: 'attraction',
            name: '金沙滩',
            startTime: '15:00',
            endTime: '18:00',
            cost: 0,
            description: '沙质细腻，适合孩子玩沙，有免费冲水处',
            address: '黄岛区金沙滩景区',
            position: { lat: 35.9487, lng: 120.2236 }
          },
          {
            id: 'item_1_6',
            type: 'food',
            name: '晚餐',
            startTime: '18:30',
            endTime: '20:00',
            cost: 300,
            description: '沙滩附近海鲜烧烤'
          }
        ]
      },
      {
        day: 2,
        items: [
          {
            id: 'item_2_1',
            type: 'food',
            name: '酒店早餐',
            startTime: '08:30',
            endTime: '09:30',
            cost: 0,
            description: '酒店自助早餐，品类丰富'
          },
          {
            id: 'item_2_2',
            type: 'attraction',
            name: '青岛海昌极地海洋公园',
            startTime: '10:00',
            endTime: '14:00',
            cost: 490,
            description: '有白鲸表演、企鹅馆，孩子超喜欢',
            address: '崂山区东海东路60号',
            position: { lat: 36.0640, lng: 120.4083 }
          },
          {
            id: 'item_2_3',
            type: 'food',
            name: '午餐',
            startTime: '12:30',
            endTime: '13:30',
            cost: 200,
            description: '公园内餐厅用餐'
          },
          {
            id: 'item_2_4',
            type: 'attraction',
            name: '石老人海水浴场',
            startTime: '14:30',
            endTime: '17:30',
            cost: 0,
            description: '水质清澈，可挖沙、赶海',
            position: { lat: 36.0905, lng: 120.4341 }
          }
        ]
      }
    ],
    createTime: Date.now()
  }
}

function generateAdventurePlan(
  request: ItineraryRequest,
  flights: any[],
  hotels: any[],
  attractions: any[]
): ItineraryPlan {
  return {
    id: `plan_${Date.now()}_adventure`,
    requestId: request.id,
    name: '探索打卡4日游',
    description: '经典景点全覆盖，美食打卡两不误',
    tags: ['探索', '打卡', '美食'],
    totalDays: 4,
    totalCost: 2800,
    days: [
      {
        day: 1,
        items: [
          {
            id: 'item_1_1',
            type: 'flight',
            name: '北京→青岛',
            startTime: '07:30',
            endTime: '11:00',
            cost: 520,
            description: '东方航空MU5196',
            address: '北京首都国际机场'
          },
          {
            id: 'item_1_2',
            type: 'hotel',
            name: '市南区商务酒店',
            startTime: '12:00',
            endTime: '次日12:00',
            cost: 450,
            description: '位于市中心，近地铁站',
            address: '市南区香港中路'
          },
          {
            id: 'item_1_3',
            type: 'attraction',
            name: '栈桥',
            startTime: '13:00',
            endTime: '15:00',
            cost: 0,
            description: '青岛地标，可喂海鸥',
            position: { lat: 36.0655, lng: 120.3168 }
          },
          {
            id: 'item_1_4',
            type: 'food',
            name: '劈柴院美食街',
            startTime: '15:30',
            endTime: '17:30',
            cost: 150,
            description: '本地特色小吃：烤鱿鱼、豆腐脑、锅贴'
          }
        ]
      }
    ],
    createTime: Date.now()
  }
}
