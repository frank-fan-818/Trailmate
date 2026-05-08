export interface Companion {
  id: string
  name: string
  avatar?: string
  bio: string
  destination: string
  travelDays: number
  departureInfo: string
  departureDate: string
  budget: string
  budgetType: 'budget' | 'medium' | 'luxury'
  personality: string
  personalityType: 'planner' | 'spontaneous'
  overlapDays: number
  rating: number
  creditScore: string
  creditLevel: '钻石' | '黄金' | '白银'
  creditBadge: 'diamond' | 'gold' | 'silver'
  totalTrips: number
  interested: boolean
  sameday: boolean
  matchScore?: number
  travelTypes: string[]
  wakeTime: string
  sleepTime: string
  gender: '男' | '女' | '保密'
  age: number
}

export const currentUserProfile = {
  destination: '云南大理',
  travelDays: 5,
  budgetType: 'medium' as const,
  personalityType: 'spontaneous' as const,
  travelTypes: ['休闲', '美食', '摄影'],
  wakeTime: '08:00',
  sleepTime: '23:00',
  gender: '男' as const,
  age: 28
}

export function calculateMatchScore(companion: Companion): number {
  let score = 50

  if (companion.destination === currentUserProfile.destination) {
    score += 20
  } else {
    return score
  }

  if (companion.budgetType === currentUserProfile.budgetType) {
    score += 10
  } else if (
    (companion.budgetType as string === 'medium' && currentUserProfile.budgetType !== 'medium') ||
    (currentUserProfile.budgetType === 'medium')
  ) {
    score += 5
  }

  const dayOverlap = Math.min(companion.overlapDays, currentUserProfile.travelDays)
  score += dayOverlap * 3

  if (companion.personalityType === currentUserProfile.personalityType) {
    score += 8
  }

  const typeOverlap = companion.travelTypes.filter(t => currentUserProfile.travelTypes.includes(t)).length
  score += typeOverlap * 3

  if (companion.sameday) {
    score += 5
  }

  const creditBonus = companion.creditBadge === 'diamond' ? 5 : companion.creditBadge === 'gold' ? 3 : 0
  score += creditBonus

  return Math.min(score, 98)
}

export function getCreditBadgeText(level: string): string {
  switch (level) {
    case '钻石': return '钻石'
    case '黄金': return '黄金'
    case '白银': return '白银'
    default: return '白银'
  }
}

const rawCompanions: Omit<Companion, 'matchScore'>[] = [
  {
    id: '1', name: '林小夏',
    bio: '热爱旅行，喜欢探索小众目的地。计划型选手，擅长做详细攻略。摄影爱好者，喜欢记录旅途中的美好瞬间。',
    destination: '云南大理', travelDays: 5, departureInfo: '3天后出发', departureDate: '2026-05-01',
    budget: '品质游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 4, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 12, interested: false, sameday: false,
    travelTypes: ['休闲', '自然', '摄影'], wakeTime: '07:00', sleepTime: '22:00', gender: '女', age: 26
  },
  {
    id: '2', name: '张明',
    bio: '自由摄影师，四处漂泊。随性而为，享受旅途中的意外惊喜。希望找到志同道合的伙伴一起探索世界。',
    destination: '西藏拉萨', travelDays: 7, departureInfo: '下周出发', departureDate: '2026-05-03',
    budget: '经济游', budgetType: 'medium', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 3, rating: 4.7, creditScore: '4.7', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 8, interested: false, sameday: false,
    travelTypes: ['冒险', '人文', '摄影'], wakeTime: '09:00', sleepTime: '00:00', gender: '男', age: 32
  },
  {
    id: '3', name: '王建国',
    bio: '退休教师，热爱大自然。喜欢慢节奏旅行，享受每一个地方的风景和文化。正在寻找同样喜欢慢旅行的伴友。',
    destination: '四川成都', travelDays: 4, departureInfo: '5天后出发', departureDate: '2026-05-02',
    budget: '穷游', budgetType: 'budget', personality: '计划型', personalityType: 'planner',
    overlapDays: 2, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 5, interested: false, sameday: true,
    travelTypes: ['休闲', '文化', '美食'], wakeTime: '06:30', sleepTime: '21:30', gender: '男', age: 58
  },
  {
    id: '4', name: '陈思思',
    bio: '互联网从业者，利用假期旅行。喜欢购物和美食，对日本文化很感兴趣。希望找到行程相似的伙伴同行。',
    destination: '日本东京', travelDays: 6, departureInfo: '本月底出发', departureDate: '2026-05-20',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 5, rating: 5.0, creditScore: '5.0', creditLevel: '钻石', creditBadge: 'diamond',
    totalTrips: 15, interested: false, sameday: false,
    travelTypes: ['购物', '美食', '文化'], wakeTime: '10:00', sleepTime: '00:00', gender: '女', age: 27
  },
  {
    id: '5', name: '刘德华',
    bio: '背包客，已经走过30多个国家。喜欢深度游而非打卡式旅行。善于规划行程，可以照顾同行伙伴。',
    destination: '泰国清迈', travelDays: 8, departureInfo: '2周后出发', departureDate: '2026-05-10',
    budget: '经济游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 6, rating: 4.6, creditScore: '4.6', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 30, interested: false, sameday: false,
    travelTypes: ['冒险', '人文', '自然'], wakeTime: '07:00', sleepTime: '22:00', gender: '男', age: 35
  },
  {
    id: '6', name: '赵小雨',
    bio: '学生党，预算有限但热情满满。第一次独自旅行，希望找到有经验的伙伴带一带。很好相处，不矫情。',
    destination: '厦门鼓浪屿', travelDays: 3, departureInfo: '下周出发', departureDate: '2026-05-04',
    budget: '穷游', budgetType: 'budget', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 3, rating: 4.5, creditScore: '4.5', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 3, interested: false, sameday: false,
    travelTypes: ['休闲', '美食', '拍照打卡'], wakeTime: '09:00', sleepTime: '23:00', gender: '女', age: 22
  },
  {
    id: '7', name: '孙海',
    bio: '程序员一枚，利用年假旅行。喜欢自然风光，摄影和爬山是最大的爱好。希望找到体力好的伙伴一起徒步。',
    destination: '云南大理', travelDays: 6, departureInfo: '5天后出发', departureDate: '2026-05-01',
    budget: '经济游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 5, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 10, interested: false, sameday: true,
    travelTypes: ['自然', '摄影', '徒步'], wakeTime: '06:00', sleepTime: '22:00', gender: '男', age: 30
  },
  {
    id: '8', name: '周莉',
    bio: '瑜伽教练，热爱健康生活方式。旅行中也会坚持每日练习。喜欢宁静的地方，适合放松身心的目的地。',
    destination: '云南大理', travelDays: 7, departureInfo: '10天后出发', departureDate: '2026-05-05',
    budget: '品质游', budgetType: 'luxury', personality: '计划型', personalityType: 'planner',
    overlapDays: 5, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 8, interested: false, sameday: false,
    travelTypes: ['休闲', '自然', '养生'], wakeTime: '06:00', sleepTime: '21:00', gender: '女', age: 34
  },
  {
    id: '9', name: '吴斌',
    bio: '销售达人，能说会道。旅行中喜欢结交新朋友，善于活跃气氛。喜欢吃吃喝喝，探寻当地美食是必做之事。',
    destination: '四川成都', travelDays: 4, departureInfo: '下周出发', departureDate: '2026-05-03',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 3, rating: 4.7, creditScore: '4.7', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 12, interested: false, sameday: false,
    travelTypes: ['美食', '夜生活', '社交'], wakeTime: '08:00', sleepTime: '01:00', gender: '男', age: 29
  },
  {
    id: '10', name: '郑小芳',
    bio: '小学老师有两个月暑假。喜欢和文化相关的东西，历史古迹博物馆是首选。安静型选手，不喜欢太吵的地方。',
    destination: '陕西西安', travelDays: 5, departureInfo: '3周后出发', departureDate: '2026-05-15',
    budget: '经济游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 4, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 7, interested: false, sameday: false,
    travelTypes: ['文化', '历史', '慢节奏'], wakeTime: '07:30', sleepTime: '22:00', gender: '女', age: 42
  },
  {
    id: '11', name: '黄大伟',
    bio: '健身教练，体能超级好。旅行中也每天锻炼。喜欢挑战性的活动，徒步、攀岩、潜水都在行。',
    destination: '云南大理', travelDays: 5, departureInfo: '下周出发', departureDate: '2026-05-01',
    budget: '经济游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 5, rating: 4.6, creditScore: '4.6', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 6, interested: false, sameday: true,
    travelTypes: ['冒险', '运动', '自然'], wakeTime: '06:00', sleepTime: '22:00', gender: '男', age: 28
  },
  {
    id: '12', name: '许晴',
    bio: '时尚杂志编辑，对美有极致追求。旅行中不停拍照，品味独特。喜欢小众有设计感的地方，不喜欢大众景点。',
    destination: '云南大理', travelDays: 4, departureInfo: '下周出发', departureDate: '2026-05-02',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 4, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 20, interested: false, sameday: false,
    travelTypes: ['休闲', '摄影', '艺术'], wakeTime: '10:00', sleepTime: '00:00', gender: '女', age: 25
  },
  {
    id: '13', name: '冯小刚',
    bio: '退休军官，体力充沛。喜欢红色旅游和历史景点。做事雷厉风行，旅行中喜欢把一切都安排妥当。',
    destination: '北京', travelDays: 5, departureInfo: '本月出发', departureDate: '2026-05-08',
    budget: '经济游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 3, rating: 4.7, creditScore: '4.7', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 15, interested: false, sameday: false,
    travelTypes: ['历史', '红色旅游', '文化'], wakeTime: '06:00', sleepTime: '21:30', gender: '男', age: 62
  },
  {
    id: '14', name: '丁一',
    bio: '自由插画师，在线接单边旅行边工作。喜欢有故事感的地方，安静的小镇、古老的村落是心头好。',
    destination: '云南大理', travelDays: 10, departureInfo: '随时出发', departureDate: '2026-05-01',
    budget: '穷游', budgetType: 'budget', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 5, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 18, interested: false, sameday: true,
    travelTypes: ['艺术', '小众', '慢节奏'], wakeTime: '09:30', sleepTime: '23:30', gender: '保密', age: 27
  },
  {
    id: '15', name: '蒋薇薇',
    bio: '护士小姐姐，利用调休旅行。喜欢体验当地生活，去菜市场逛逛、和当地人聊聊天是最大的乐趣。',
    destination: '云南大理', travelDays: 5, departureInfo: '下下周出发', departureDate: '2026-05-07',
    budget: '经济游', budgetType: 'medium', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 4, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 9, interested: false, sameday: false,
    travelTypes: ['休闲', '美食', '人文'], wakeTime: '07:00', sleepTime: '22:30', gender: '女', age: 31
  },
  {
    id: '16', name: '韩寒',
    bio: '作家，经常需要换个环境写作。喜欢有文化氛围的地方，咖啡馆、书店、文创园是必去之处。',
    destination: '福建厦门', travelDays: 6, departureInfo: '2周后出发', departureDate: '2026-05-12',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 4, rating: 4.7, creditScore: '4.7', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 11, interested: false, sameday: false,
    travelTypes: ['文艺', '美食', '慢节奏'], wakeTime: '10:00', sleepTime: '01:00', gender: '男', age: 38
  },
  {
    id: '17', name: '谢娜',
    bio: '舞蹈老师，活泼开朗。喜欢有活力的目的地，夜生活、表演、节庆活动都想参与。',
    destination: '云南大理', travelDays: 4, departureInfo: '本周出发', departureDate: '2026-05-01',
    budget: '经济游', budgetType: 'medium', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 4, rating: 4.6, creditScore: '4.6', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 6, interested: false, sameday: true,
    travelTypes: ['夜生活', '社交', '表演'], wakeTime: '09:00', sleepTime: '00:00', gender: '女', age: 26
  },
  {
    id: '18', name: '杜海涛',
    bio: '美食博主，到处找好吃的。旅行目的就是吃遍当地美食，自带吃货基因，探店是核心行程。',
    destination: '四川成都', travelDays: 4, departureInfo: '下周出发', departureDate: '2026-05-04',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 3, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 25, interested: false, sameday: false,
    travelTypes: ['美食', '探店', '夜市'], wakeTime: '08:00', sleepTime: '23:00', gender: '男', age: 33
  },
  {
    id: '19', name: '彭于晏',
    bio: '咖啡师，对咖啡有研究。旅行中必去当地咖啡馆，也喜欢探索有特色的小店。喜欢简约有设计感的东西。',
    destination: '云南大理', travelDays: 5, departureInfo: '下周出发', departureDate: '2026-05-02',
    budget: '经济游', budgetType: 'medium', personality: '计划型', personalityType: 'planner',
    overlapDays: 4, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 8, interested: false, sameday: false,
    travelTypes: ['文艺', '咖啡', '小众'], wakeTime: '08:00', sleepTime: '22:00', gender: '男', age: 29
  },
  {
    id: '20', name: '薛之谦',
    bio: '音乐人，经常各地演出顺便旅行。喜欢livehouse和音乐节，有演出机会都会去看看。随性而为型选手。',
    destination: '云南大理', travelDays: 3, departureInfo: '随时出发', departureDate: '2026-05-01',
    budget: '穷游', budgetType: 'budget', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 3, rating: 4.7, creditScore: '4.7', creditLevel: '白银', creditBadge: 'silver',
    totalTrips: 14, interested: false, sameday: true,
    travelTypes: ['音乐', '社交', '夜生活'], wakeTime: '10:00', sleepTime: '02:00', gender: '男', age: 36
  },
  {
    id: '21', name: '叶子',
    bio: '植物学研究生，喜欢大自然。旅行中关注当地植被和花卉，偶尔做植物标本。喜欢徒步和露营。',
    destination: '云南大理', travelDays: 7, departureInfo: '下周出发', departureDate: '2026-05-03',
    budget: '穷游', budgetType: 'budget', personality: '计划型', personalityType: 'planner',
    overlapDays: 5, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 5, interested: false, sameday: false,
    travelTypes: ['自然', '徒步', '露营'], wakeTime: '06:00', sleepTime: '21:00', gender: '女', age: 25
  },
  {
    id: '22', name: '林俊杰',
    bio: '游戏主播，边旅行边直播。粉丝众多，旅途中会偶尔开播分享见闻。喜欢有趣的地方和事物。',
    destination: '重庆', travelDays: 4, departureInfo: '2周后出发', departureDate: '2026-05-10',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 3, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 16, interested: false, sameday: false,
    travelTypes: ['网红打卡', '美食', '夜生活'], wakeTime: '12:00', sleepTime: '03:00', gender: '男', age: 24
  },
  {
    id: '23', name: '唐老鸭',
    bio: '心理咨询师，需要放松心情。喜欢安静疗愈型的目的地，温泉、SPA、冥想都是最爱。',
    destination: '云南大理', travelDays: 5, departureInfo: '下周出发', departureDate: '2026-05-01',
    budget: '品质游', budgetType: 'luxury', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 4, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 10, interested: false, sameday: true,
    travelTypes: ['休闲', '养生', '自然'], wakeTime: '08:00', sleepTime: '22:00', gender: '女', age: 35
  },
  {
    id: '24', name: '董小姐',
    bio: '律师，逻辑清晰做事严谨。旅行前会做详尽的攻略，每小时行程都安排好。喜欢高效的旅行方式。',
    destination: '上海', travelDays: 4, departureInfo: '本月出发', departureDate: '2026-05-18',
    budget: '品质游', budgetType: 'luxury', personality: '计划型', personalityType: 'planner',
    overlapDays: 2, rating: 4.8, creditScore: '4.8', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 12, interested: false, sameday: false,
    travelTypes: ['都市', '购物', '美食'], wakeTime: '07:00', sleepTime: '23:00', gender: '女', age: 40
  },
  {
    id: '25', name: '白落梅',
    bio: '茶艺师，喜欢慢生活。旅行中会找当地茶馆坐坐，感受茶文化。喜欢有历史底蕴的古城古镇。',
    destination: '云南大理', travelDays: 6, departureInfo: '下周出发', departureDate: '2026-05-04',
    budget: '经济游', budgetType: 'medium', personality: '随性型', personalityType: 'spontaneous',
    overlapDays: 4, rating: 4.9, creditScore: '4.9', creditLevel: '黄金', creditBadge: 'gold',
    totalTrips: 7, interested: false, sameday: false,
    travelTypes: ['文化', '休闲', '慢节奏'], wakeTime: '08:00', sleepTime: '21:00', gender: '女', age: 45
  }
]

export const companions: Companion[] = rawCompanions.map(c => ({
  ...c,
  matchScore: calculateMatchScore(c as Companion)
} as Companion))
