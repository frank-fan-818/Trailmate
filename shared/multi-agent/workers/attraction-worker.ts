import type { StructuredLogger } from '../../utils/logger'
import type { Attraction, AttractionQueryInput, AttractionQueryOutput } from '../types'
import { BaseWorker } from '../base-worker'

const MOCK_ATTRACTIONS: Record<string, Attraction[]> = {
  '北京': [
    { id: 'a-001', name: '故宫博物院', address: '东城区景山前街4号', ticketPrice: 60, openTime: '08:30', closeTime: '17:00', rating: 4.8, reviewCount: 125000, estimatedVisitTime: 240, tags: ['历史文化', '博物馆', '古迹'] },
    { id: 'a-002', name: '八达岭长城', address: '延庆区G6京藏高速58号出口', ticketPrice: 40, openTime: '06:30', closeTime: '19:00', rating: 4.7, reviewCount: 98000, estimatedVisitTime: 300, tags: ['古迹', '自然风光', '徒步'] },
    { id: 'a-003', name: '颐和园', address: '海淀区新建宫门路19号', ticketPrice: 30, openTime: '06:30', closeTime: '18:00', rating: 4.6, reviewCount: 87000, estimatedVisitTime: 180, tags: ['园林', '古迹', '自然风光'] },
    { id: 'a-004', name: '南锣鼓巷', address: '东城区南锣鼓巷', ticketPrice: 0, openTime: '全天', closeTime: '全天', rating: 4.4, reviewCount: 45000, estimatedVisitTime: 90, tags: ['美食', '胡同文化', '购物'] },
  ],
  '上海': [
    { id: 'a-101', name: '外滩', address: '黄浦区中山东一路', ticketPrice: 0, openTime: '全天', closeTime: '全天', rating: 4.7, reviewCount: 156000, estimatedVisitTime: 60, tags: ['城市风光', '夜景', '建筑'] },
    { id: 'a-102', name: '上海迪士尼乐园', address: '浦东新区川沙镇', ticketPrice: 475, openTime: '09:00', closeTime: '21:00', rating: 4.5, reviewCount: 89000, estimatedVisitTime: 600, tags: ['主题乐园', '亲子', '娱乐'] },
    { id: 'a-103', name: '豫园', address: '黄浦区福佑路168号', ticketPrice: 40, openTime: '08:30', closeTime: '17:00', rating: 4.4, reviewCount: 34000, estimatedVisitTime: 120, tags: ['园林', '古迹', '美食'] },
  ],
  '成都': [
    { id: 'a-201', name: '大熊猫繁育研究基地', address: '成华区熊猫大道1375号', ticketPrice: 55, openTime: '07:30', closeTime: '18:00', rating: 4.6, reviewCount: 67000, estimatedVisitTime: 180, tags: ['动物', '自然', '亲子'] },
    { id: 'a-202', name: '宽窄巷子', address: '青羊区长顺街', ticketPrice: 0, openTime: '全天', closeTime: '全天', rating: 4.4, reviewCount: 52000, estimatedVisitTime: 90, tags: ['美食', '民俗文化', '购物'] },
    { id: 'a-203', name: '锦里古街', address: '武侯区武侯祠大街231号', ticketPrice: 0, openTime: '全天', closeTime: '22:00', rating: 4.3, reviewCount: 41000, estimatedVisitTime: 60, tags: ['美食', '古街', '夜景'] },
    { id: 'a-204', name: '青城山', address: '都江堰市青城山路', ticketPrice: 90, openTime: '08:00', closeTime: '17:30', rating: 4.5, reviewCount: 23000, estimatedVisitTime: 360, tags: ['自然风光', '道教文化', '徒步'] },
  ],
  '杭州': [
    { id: 'a-301', name: '西湖', address: '西湖区龙井路1号', ticketPrice: 0, openTime: '全天', closeTime: '全天', rating: 4.8, reviewCount: 234000, estimatedVisitTime: 180, tags: ['自然风光', '园林', '游船'] },
    { id: 'a-302', name: '灵隐寺', address: '西湖区法云弄1号', ticketPrice: 45, openTime: '07:00', closeTime: '18:00', rating: 4.6, reviewCount: 56000, estimatedVisitTime: 120, tags: ['寺庙', '古迹', '自然'] },
    { id: 'a-303', name: '宋城景区', address: '西湖区之江路148号', ticketPrice: 320, openTime: '09:00', closeTime: '21:00', rating: 4.3, reviewCount: 34000, estimatedVisitTime: 300, tags: ['主题乐园', '演出', '历史文化'] },
  ],
  '广州': [
    { id: 'a-401', name: '广州塔', address: '海珠区阅江西路222号', ticketPrice: 150, openTime: '09:30', closeTime: '22:30', rating: 4.5, reviewCount: 78000, estimatedVisitTime: 90, tags: ['城市风光', '地标', '夜景'] },
    { id: 'a-402', name: '长隆野生动物世界', address: '番禺区大石镇', ticketPrice: 300, openTime: '09:30', closeTime: '18:00', rating: 4.7, reviewCount: 45000, estimatedVisitTime: 360, tags: ['动物', '亲子', '自然'] },
    { id: 'a-403', name: '沙面岛', address: '荔湾区沙面大街', ticketPrice: 0, openTime: '全天', closeTime: '全天', rating: 4.4, reviewCount: 12000, estimatedVisitTime: 60, tags: ['建筑', '历史街区', '摄影'] },
  ],
}

export class AttractionWorker extends BaseWorker<AttractionQueryInput, AttractionQueryOutput> {
  readonly name = 'attraction-worker'

  protected async execute(input: AttractionQueryInput, log: StructuredLogger): Promise<AttractionQueryOutput> {
    const attractions = MOCK_ATTRACTIONS[input.destination] || [
      { id: 'a-default-1', name: `${input.destination}市中心公园`, address: `${input.destination}市中心`, ticketPrice: 0, openTime: '全天', closeTime: '全天', rating: 4.2, reviewCount: 5000, estimatedVisitTime: 60, tags: ['自然风光', '休闲'] },
      { id: 'a-default-2', name: `${input.destination}博物馆`, address: `${input.destination}文化路1号`, ticketPrice: 20, openTime: '09:00', closeTime: '17:00', rating: 4.3, reviewCount: 3000, estimatedVisitTime: 120, tags: ['博物馆', '历史文化'] },
      { id: 'a-default-3', name: `${input.destination}美食街`, address: `${input.destination}美食路`, ticketPrice: 0, openTime: '10:00', closeTime: '23:00', rating: 4.5, reviewCount: 8000, estimatedVisitTime: 90, tags: ['美食', '购物'] },
    ]

    // 按标签匹配
    const matched = input.tags.length > 0
      ? attractions.filter(a => input.tags.some(t => a.tags.includes(t)))
      : attractions

    log.step(this.name, `found ${matched.length} attractions matching tags`, {
      destination: input.destination,
      tags: input.tags,
      total: attractions.length,
      matched: matched.length
    })

    return {
      attractions: matched.length > 0 ? matched : attractions,
      totalCount: attractions.length
    }
  }
}
