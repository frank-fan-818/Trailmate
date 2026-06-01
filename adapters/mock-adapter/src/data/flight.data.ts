import type { Flight } from '../../types'

export const flightData: Flight[] = [
  // ========== 北京 → 青岛 (existing) ==========
  {
    id: 'flight_001',
    flightNo: 'CA1234',
    depCity: '北京',
    arrCity: '青岛',
    depTime: '07:30',
    arrTime: '09:15',
    airline: '中国国航',
    price: 680,
    discount: 0.75,
    remainingSeats: 23
  },
  {
    id: 'flight_002',
    flightNo: 'MU5678',
    depCity: '北京',
    arrCity: '青岛',
    depTime: '10:20',
    arrTime: '12:05',
    airline: '东方航空',
    price: 590,
    discount: 0.68,
    remainingSeats: 15
  },
  {
    id: 'flight_003',
    flightNo: 'CZ9012',
    depCity: '北京',
    arrCity: '青岛',
    depTime: '14:15',
    arrTime: '16:00',
    airline: '南方航空',
    price: 720,
    discount: 0.8,
    remainingSeats: 32
  },
  {
    id: 'flight_004',
    flightNo: 'HU3456',
    depCity: '北京',
    arrCity: '青岛',
    depTime: '18:40',
    arrTime: '20:25',
    airline: '海南航空',
    price: 480,
    discount: 0.55,
    remainingSeats: 8
  },
  {
    id: 'flight_005',
    flightNo: 'SC8765',
    depCity: '北京',
    arrCity: '青岛',
    depTime: '21:10',
    arrTime: '22:55',
    airline: '山东航空',
    price: 420,
    discount: 0.48,
    remainingSeats: 45
  },

  // ========== 上海 → 青岛 (existing) ==========
  {
    id: 'flight_006',
    flightNo: 'CA1235',
    depCity: '上海',
    arrCity: '青岛',
    depTime: '08:15',
    arrTime: '10:00',
    airline: '中国国航',
    price: 560,
    discount: 0.7,
    remainingSeats: 18
  },
  {
    id: 'flight_007',
    flightNo: 'MU5679',
    depCity: '上海',
    arrCity: '青岛',
    depTime: '12:30',
    arrTime: '14:15',
    airline: '东方航空',
    price: 490,
    discount: 0.62,
    remainingSeats: 27
  },

  // ========== 广州 → 青岛 (existing) ==========
  {
    id: 'flight_008',
    flightNo: 'CZ9013',
    depCity: '广州',
    arrCity: '青岛',
    depTime: '09:45',
    arrTime: '12:30',
    airline: '南方航空',
    price: 980,
    discount: 0.78,
    remainingSeats: 12
  },

  // ========== 深圳 → 青岛 (existing) ==========
  {
    id: 'flight_009',
    flightNo: 'HU3457',
    depCity: '深圳',
    arrCity: '青岛',
    depTime: '11:20',
    arrTime: '14:10',
    airline: '海南航空',
    price: 1050,
    discount: 0.82,
    remainingSeats: 21
  },

  // ========== 成都 → 青岛 (existing) ==========
  {
    id: 'flight_010',
    flightNo: 'SC8766',
    depCity: '成都',
    arrCity: '青岛',
    depTime: '14:50',
    arrTime: '17:40',
    airline: '山东航空',
    price: 860,
    discount: 0.72,
    remainingSeats: 9
  },

  // ========== 北京 ⇄ 上海 ==========
  {
    id: 'flight_011',
    flightNo: 'CA1510',
    depCity: '北京',
    arrCity: '上海',
    depTime: '08:00',
    arrTime: '10:15',
    airline: '中国国航',
    price: 650,
    discount: 0.8,
    remainingSeats: 35,
    depDate: '2026-06-15'
  },
  {
    id: 'flight_012',
    flightNo: 'MU5102',
    depCity: '北京',
    arrCity: '上海',
    depTime: '12:30',
    arrTime: '14:45',
    airline: '东方航空',
    price: 580,
    discount: 0.75,
    remainingSeats: 42,
    depDate: '2026-06-15'
  },
  {
    id: 'flight_013',
    flightNo: 'CZ8901',
    depCity: '上海',
    arrCity: '北京',
    depTime: '09:00',
    arrTime: '11:20',
    airline: '南方航空',
    price: 700,
    discount: 0.85,
    remainingSeats: 28
  },
  {
    id: 'flight_014',
    flightNo: 'HU7602',
    depCity: '上海',
    arrCity: '北京',
    depTime: '16:30',
    arrTime: '18:50',
    airline: '海南航空',
    price: 520,
    discount: 0.7,
    remainingSeats: 50
  },

  // ========== 北京 ⇄ 广州 ==========
  {
    id: 'flight_015',
    flightNo: 'CZ3102',
    depCity: '北京',
    arrCity: '广州',
    depTime: '07:30',
    arrTime: '10:45',
    airline: '南方航空',
    price: 980,
    discount: 0.82,
    remainingSeats: 22
  },
  {
    id: 'flight_016',
    flightNo: 'CA1831',
    depCity: '北京',
    arrCity: '广州',
    depTime: '14:00',
    arrTime: '17:15',
    airline: '中国国航',
    price: 850,
    discount: 0.78,
    remainingSeats: 16
  },
  {
    id: 'flight_017',
    flightNo: 'MU5181',
    depCity: '广州',
    arrCity: '北京',
    depTime: '08:30',
    arrTime: '11:40',
    airline: '东方航空',
    price: 920,
    discount: 0.8,
    remainingSeats: 30
  },
  {
    id: 'flight_018',
    flightNo: 'HU7802',
    depCity: '广州',
    arrCity: '北京',
    depTime: '17:00',
    arrTime: '20:10',
    airline: '海南航空',
    price: 780,
    discount: 0.72,
    remainingSeats: 19
  },

  // ========== 北京 ⇄ 成都 ==========
  {
    id: 'flight_019',
    flightNo: '3U8882',
    depCity: '北京',
    arrCity: '成都',
    depTime: '07:00',
    arrTime: '10:00',
    airline: '四川航空',
    price: 760,
    discount: 0.78,
    remainingSeats: 33
  },
  {
    id: 'flight_020',
    flightNo: 'CA4194',
    depCity: '北京',
    arrCity: '成都',
    depTime: '15:30',
    arrTime: '18:30',
    airline: '中国国航',
    price: 680,
    discount: 0.75,
    remainingSeats: 25
  },
  {
    id: 'flight_021',
    flightNo: 'MU6642',
    depCity: '成都',
    arrCity: '北京',
    depTime: '08:30',
    arrTime: '11:20',
    airline: '东方航空',
    price: 720,
    discount: 0.8,
    remainingSeats: 27
  },
  {
    id: 'flight_022',
    flightNo: 'CZ6112',
    depCity: '成都',
    arrCity: '北京',
    depTime: '19:00',
    arrTime: '21:50',
    airline: '南方航空',
    price: 640,
    discount: 0.72,
    remainingSeats: 14
  },

  // ========== 北京 ⇄ 深圳 ==========
  {
    id: 'flight_023',
    flightNo: 'ZH9112',
    depCity: '北京',
    arrCity: '深圳',
    depTime: '08:00',
    arrTime: '11:15',
    airline: '深圳航空',
    price: 860,
    discount: 0.78,
    remainingSeats: 20
  },
  {
    id: 'flight_024',
    flightNo: 'CA1383',
    depCity: '北京',
    arrCity: '深圳',
    depTime: '13:30',
    arrTime: '16:45',
    airline: '中国国航',
    price: 780,
    discount: 0.75,
    remainingSeats: 31
  },
  {
    id: 'flight_025',
    flightNo: 'CZ3155',
    depCity: '深圳',
    arrCity: '北京',
    depTime: '09:30',
    arrTime: '12:40',
    airline: '南方航空',
    price: 820,
    discount: 0.8,
    remainingSeats: 18,
    depDate: '2026-06-20'
  },
  {
    id: 'flight_026',
    flightNo: 'MU5892',
    depCity: '深圳',
    arrCity: '北京',
    depTime: '18:00',
    arrTime: '21:10',
    airline: '东方航空',
    price: 740,
    discount: 0.72,
    remainingSeats: 36,
    depDate: '2026-06-22'
  },

  // ========== 北京 ⇄ 杭州 ==========
  {
    id: 'flight_027',
    flightNo: 'CA1711',
    depCity: '北京',
    arrCity: '杭州',
    depTime: '07:30',
    arrTime: '09:45',
    airline: '中国国航',
    price: 620,
    discount: 0.82,
    remainingSeats: 29
  },
  {
    id: 'flight_028',
    flightNo: 'MF8170',
    depCity: '北京',
    arrCity: '杭州',
    depTime: '14:00',
    arrTime: '16:15',
    airline: '厦门航空',
    price: 560,
    discount: 0.75,
    remainingSeats: 38
  },
  {
    id: 'flight_029',
    flightNo: 'MU5571',
    depCity: '杭州',
    arrCity: '北京',
    depTime: '08:15',
    arrTime: '10:30',
    airline: '东方航空',
    price: 600,
    discount: 0.8,
    remainingSeats: 24
  },
  {
    id: 'flight_030',
    flightNo: 'HU7178',
    depCity: '杭州',
    arrCity: '北京',
    depTime: '18:30',
    arrTime: '20:45',
    airline: '海南航空',
    price: 520,
    discount: 0.7,
    remainingSeats: 44
  },

  // ========== 北京 ⇄ 西安 ==========
  {
    id: 'flight_031',
    flightNo: 'CA1205',
    depCity: '北京',
    arrCity: '西安',
    depTime: '07:50',
    arrTime: '10:00',
    airline: '中国国航',
    price: 550,
    discount: 0.8,
    remainingSeats: 40
  },
  {
    id: 'flight_032',
    flightNo: 'MU2106',
    depCity: '北京',
    arrCity: '西安',
    depTime: '13:20',
    arrTime: '15:30',
    airline: '东方航空',
    price: 480,
    discount: 0.72,
    remainingSeats: 35
  },
  {
    id: 'flight_033',
    flightNo: 'CZ6948',
    depCity: '西安',
    arrCity: '北京',
    depTime: '09:00',
    arrTime: '11:10',
    airline: '南方航空',
    price: 510,
    discount: 0.78,
    remainingSeats: 22
  },
  {
    id: 'flight_034',
    flightNo: 'HU7238',
    depCity: '西安',
    arrCity: '北京',
    depTime: '17:30',
    arrTime: '19:40',
    airline: '海南航空',
    price: 460,
    discount: 0.68,
    remainingSeats: 48
  },

  // ========== 北京 ⇄ 重庆 ==========
  {
    id: 'flight_035',
    flightNo: '3U8830',
    depCity: '北京',
    arrCity: '重庆',
    depTime: '08:20',
    arrTime: '11:10',
    airline: '四川航空',
    price: 720,
    discount: 0.78,
    remainingSeats: 26,
    depDate: '2026-07-01'
  },
  {
    id: 'flight_036',
    flightNo: 'CA4136',
    depCity: '北京',
    arrCity: '重庆',
    depTime: '16:00',
    arrTime: '18:50',
    airline: '中国国航',
    price: 650,
    discount: 0.75,
    remainingSeats: 33,
    depDate: '2026-07-01'
  },
  {
    id: 'flight_037',
    flightNo: 'MU2866',
    depCity: '重庆',
    arrCity: '北京',
    depTime: '07:30',
    arrTime: '10:15',
    airline: '东方航空',
    price: 690,
    discount: 0.8,
    remainingSeats: 19
  },
  {
    id: 'flight_038',
    flightNo: 'CZ8119',
    depCity: '重庆',
    arrCity: '北京',
    depTime: '18:30',
    arrTime: '21:15',
    airline: '南方航空',
    price: 610,
    discount: 0.72,
    remainingSeats: 41
  },

  // ========== 北京 ⇄ 南京 ==========
  {
    id: 'flight_039',
    flightNo: 'CA1509',
    depCity: '北京',
    arrCity: '南京',
    depTime: '07:00',
    arrTime: '09:00',
    airline: '中国国航',
    price: 530,
    discount: 0.82,
    remainingSeats: 34
  },
  {
    id: 'flight_040',
    flightNo: 'MU2802',
    depCity: '北京',
    arrCity: '南京',
    depTime: '15:00',
    arrTime: '17:00',
    airline: '东方航空',
    price: 480,
    discount: 0.75,
    remainingSeats: 29
  },
  {
    id: 'flight_041',
    flightNo: 'CZ5699',
    depCity: '南京',
    arrCity: '北京',
    depTime: '08:30',
    arrTime: '10:30',
    airline: '南方航空',
    price: 500,
    discount: 0.78,
    remainingSeats: 23
  },
  {
    id: 'flight_042',
    flightNo: 'HU7682',
    depCity: '南京',
    arrCity: '北京',
    depTime: '19:00',
    arrTime: '21:00',
    airline: '海南航空',
    price: 450,
    discount: 0.7,
    remainingSeats: 46
  },

  // ========== 北京 ⇄ 厦门 ==========
  {
    id: 'flight_043',
    flightNo: 'MF8106',
    depCity: '北京',
    arrCity: '厦门',
    depTime: '07:40',
    arrTime: '10:30',
    airline: '厦门航空',
    price: 780,
    discount: 0.8,
    remainingSeats: 20
  },
  {
    id: 'flight_044',
    flightNo: 'CA1813',
    depCity: '北京',
    arrCity: '厦门',
    depTime: '14:20',
    arrTime: '17:10',
    airline: '中国国航',
    price: 720,
    discount: 0.75,
    remainingSeats: 27
  },
  {
    id: 'flight_045',
    flightNo: 'MU5176',
    depCity: '厦门',
    arrCity: '北京',
    depTime: '08:50',
    arrTime: '11:40',
    airline: '东方航空',
    price: 750,
    discount: 0.82,
    remainingSeats: 16
  },
  {
    id: 'flight_046',
    flightNo: 'CZ8955',
    depCity: '厦门',
    arrCity: '北京',
    depTime: '18:10',
    arrTime: '21:00',
    airline: '南方航空',
    price: 690,
    discount: 0.72,
    remainingSeats: 32
  },

  // ========== 北京 ⇄ 长沙 ==========
  {
    id: 'flight_047',
    flightNo: 'CA1343',
    depCity: '北京',
    arrCity: '长沙',
    depTime: '08:10',
    arrTime: '10:30',
    airline: '中国国航',
    price: 580,
    discount: 0.78,
    remainingSeats: 31,
    depDate: '2026-06-18'
  },
  {
    id: 'flight_048',
    flightNo: 'HU7635',
    depCity: '北京',
    arrCity: '长沙',
    depTime: '16:40',
    arrTime: '19:00',
    airline: '海南航空',
    price: 520,
    discount: 0.72,
    remainingSeats: 24,
    depDate: '2026-06-18'
  },
  {
    id: 'flight_049',
    flightNo: 'CZ5693',
    depCity: '长沙',
    arrCity: '北京',
    depTime: '07:50',
    arrTime: '10:10',
    airline: '南方航空',
    price: 560,
    discount: 0.8,
    remainingSeats: 18
  },
  {
    id: 'flight_050',
    flightNo: 'MU5387',
    depCity: '长沙',
    arrCity: '北京',
    depTime: '18:30',
    arrTime: '20:50',
    airline: '东方航空',
    price: 500,
    discount: 0.7,
    remainingSeats: 37
  },

  // ========== 北京 ⇄ 武汉 ==========
  {
    id: 'flight_051',
    flightNo: 'CA8201',
    depCity: '北京',
    arrCity: '武汉',
    depTime: '08:30',
    arrTime: '10:40',
    airline: '中国国航',
    price: 540,
    discount: 0.8,
    remainingSeats: 28
  },
  {
    id: 'flight_052',
    flightNo: 'MU2456',
    depCity: '北京',
    arrCity: '武汉',
    depTime: '15:00',
    arrTime: '17:10',
    airline: '东方航空',
    price: 490,
    discount: 0.72,
    remainingSeats: 35
  },
  {
    id: 'flight_053',
    flightNo: 'CZ3167',
    depCity: '武汉',
    arrCity: '北京',
    depTime: '09:20',
    arrTime: '11:30',
    airline: '南方航空',
    price: 520,
    discount: 0.78,
    remainingSeats: 22
  },
  {
    id: 'flight_054',
    flightNo: 'HU7186',
    depCity: '武汉',
    arrCity: '北京',
    depTime: '19:30',
    arrTime: '21:40',
    airline: '海南航空',
    price: 470,
    discount: 0.68,
    remainingSeats: 40
  },

  // ========== 北京 ⇄ 昆明 ==========
  {
    id: 'flight_055',
    flightNo: 'CA4171',
    depCity: '北京',
    arrCity: '昆明',
    depTime: '07:20',
    arrTime: '11:00',
    airline: '中国国航',
    price: 1050,
    discount: 0.78,
    remainingSeats: 18
  },
  {
    id: 'flight_056',
    flightNo: 'MU5708',
    depCity: '北京',
    arrCity: '昆明',
    depTime: '14:00',
    arrTime: '17:40',
    airline: '东方航空',
    price: 950,
    discount: 0.8,
    remainingSeats: 25
  },
  {
    id: 'flight_057',
    flightNo: 'CZ3997',
    depCity: '昆明',
    arrCity: '北京',
    depTime: '08:10',
    arrTime: '11:50',
    airline: '南方航空',
    price: 1000,
    discount: 0.82,
    remainingSeats: 15
  },
  {
    id: 'flight_058',
    flightNo: '3U8669',
    depCity: '昆明',
    arrCity: '北京',
    depTime: '16:30',
    arrTime: '20:10',
    airline: '四川航空',
    price: 920,
    discount: 0.75,
    remainingSeats: 29
  },

  // ========== 北京 ⇄ 三亚 ==========
  {
    id: 'flight_059',
    flightNo: 'HU7979',
    depCity: '北京',
    arrCity: '三亚',
    depTime: '07:00',
    arrTime: '11:00',
    airline: '海南航空',
    price: 1200,
    discount: 0.8,
    remainingSeats: 22,
    depDate: '2026-06-25'
  },
  {
    id: 'flight_060',
    flightNo: 'CZ6712',
    depCity: '北京',
    arrCity: '三亚',
    depTime: '14:30',
    arrTime: '18:30',
    airline: '南方航空',
    price: 1080,
    discount: 0.75,
    remainingSeats: 17,
    depDate: '2026-06-25'
  },
  {
    id: 'flight_061',
    flightNo: 'CA1378',
    depCity: '三亚',
    arrCity: '北京',
    depTime: '08:40',
    arrTime: '12:30',
    airline: '中国国航',
    price: 1150,
    discount: 0.82,
    remainingSeats: 14
  },
  {
    id: 'flight_062',
    flightNo: 'MU5745',
    depCity: '三亚',
    arrCity: '北京',
    depTime: '17:00',
    arrTime: '20:50',
    airline: '东方航空',
    price: 1020,
    discount: 0.78,
    remainingSeats: 28
  },

  // ========== 北京 ⇄ 哈尔滨 ==========
  {
    id: 'flight_063',
    flightNo: 'CA1603',
    depCity: '北京',
    arrCity: '哈尔滨',
    depTime: '07:30',
    arrTime: '09:30',
    airline: '中国国航',
    price: 480,
    discount: 0.78,
    remainingSeats: 36
  },
  {
    id: 'flight_064',
    flightNo: 'MU5197',
    depCity: '北京',
    arrCity: '哈尔滨',
    depTime: '14:50',
    arrTime: '16:50',
    airline: '东方航空',
    price: 420,
    discount: 0.72,
    remainingSeats: 44
  },
  {
    id: 'flight_065',
    flightNo: 'CZ6204',
    depCity: '哈尔滨',
    arrCity: '北京',
    depTime: '08:50',
    arrTime: '10:50',
    airline: '南方航空',
    price: 460,
    discount: 0.8,
    remainingSeats: 20
  },
  {
    id: 'flight_066',
    flightNo: 'HU7890',
    depCity: '哈尔滨',
    arrCity: '北京',
    depTime: '19:10',
    arrTime: '21:10',
    airline: '海南航空',
    price: 400,
    discount: 0.68,
    remainingSeats: 50
  },

  // ========== 北京 ⇄ 桂林 ==========
  {
    id: 'flight_067',
    flightNo: 'CA1471',
    depCity: '北京',
    arrCity: '桂林',
    depTime: '08:00',
    arrTime: '10:50',
    airline: '中国国航',
    price: 730,
    discount: 0.78,
    remainingSeats: 25
  },
  {
    id: 'flight_068',
    flightNo: 'CZ3286',
    depCity: '北京',
    arrCity: '桂林',
    depTime: '15:30',
    arrTime: '18:20',
    airline: '南方航空',
    price: 670,
    discount: 0.72,
    remainingSeats: 33
  },
  {
    id: 'flight_069',
    flightNo: 'MU5832',
    depCity: '桂林',
    arrCity: '北京',
    depTime: '09:20',
    arrTime: '12:10',
    airline: '东方航空',
    price: 700,
    discount: 0.8,
    remainingSeats: 18
  },
  {
    id: 'flight_070',
    flightNo: 'HU7210',
    depCity: '桂林',
    arrCity: '北京',
    depTime: '17:40',
    arrTime: '20:30',
    airline: '海南航空',
    price: 640,
    discount: 0.75,
    remainingSeats: 39
  },

  // ========== 北京 ⇄ 丽江 ==========
  {
    id: 'flight_071',
    flightNo: 'CA1459',
    depCity: '北京',
    arrCity: '丽江',
    depTime: '07:10',
    arrTime: '10:50',
    airline: '中国国航',
    price: 1120,
    discount: 0.78,
    remainingSeats: 15,
    depDate: '2026-07-05'
  },
  {
    id: 'flight_072',
    flightNo: '3U8699',
    depCity: '北京',
    arrCity: '丽江',
    depTime: '13:40',
    arrTime: '17:20',
    airline: '四川航空',
    price: 1050,
    discount: 0.82,
    remainingSeats: 22,
    depDate: '2026-07-05'
  },
  {
    id: 'flight_073',
    flightNo: 'MU5989',
    depCity: '丽江',
    arrCity: '北京',
    depTime: '08:30',
    arrTime: '12:10',
    airline: '东方航空',
    price: 1080,
    discount: 0.8,
    remainingSeats: 12
  },
  {
    id: 'flight_074',
    flightNo: 'CZ6683',
    depCity: '丽江',
    arrCity: '北京',
    depTime: '16:00',
    arrTime: '19:40',
    airline: '南方航空',
    price: 980,
    discount: 0.75,
    remainingSeats: 26
  },

  // ========== 上海 ⇄ 广州 ==========
  {
    id: 'flight_075',
    flightNo: 'CZ3532',
    depCity: '上海',
    arrCity: '广州',
    depTime: '08:00',
    arrTime: '10:20',
    airline: '南方航空',
    price: 620,
    discount: 0.78,
    remainingSeats: 30
  },
  {
    id: 'flight_076',
    flightNo: 'MU5301',
    depCity: '上海',
    arrCity: '广州',
    depTime: '15:30',
    arrTime: '17:50',
    airline: '东方航空',
    price: 560,
    discount: 0.72,
    remainingSeats: 38
  },
  {
    id: 'flight_077',
    flightNo: 'CA1869',
    depCity: '广州',
    arrCity: '上海',
    depTime: '08:45',
    arrTime: '11:05',
    airline: '中国国航',
    price: 600,
    discount: 0.8,
    remainingSeats: 24
  },
  {
    id: 'flight_078',
    flightNo: 'HU7211',
    depCity: '广州',
    arrCity: '上海',
    depTime: '17:15',
    arrTime: '19:35',
    airline: '海南航空',
    price: 540,
    discount: 0.75,
    remainingSeats: 42
  },

  // ========== 上海 ⇄ 成都 ==========
  {
    id: 'flight_079',
    flightNo: '3U8961',
    depCity: '上海',
    arrCity: '成都',
    depTime: '07:50',
    arrTime: '11:00',
    airline: '四川航空',
    price: 780,
    discount: 0.78,
    remainingSeats: 28,
    depDate: '2026-06-12'
  },
  {
    id: 'flight_080',
    flightNo: 'CA4501',
    depCity: '上海',
    arrCity: '成都',
    depTime: '14:10',
    arrTime: '17:20',
    airline: '中国国航',
    price: 720,
    discount: 0.72,
    remainingSeats: 35,
    depDate: '2026-06-12'
  },
  {
    id: 'flight_081',
    flightNo: 'MU5411',
    depCity: '成都',
    arrCity: '上海',
    depTime: '08:20',
    arrTime: '11:20',
    airline: '东方航空',
    price: 760,
    discount: 0.8,
    remainingSeats: 20
  },
  {
    id: 'flight_082',
    flightNo: 'CZ8101',
    depCity: '成都',
    arrCity: '上海',
    depTime: '16:40',
    arrTime: '19:40',
    airline: '南方航空',
    price: 690,
    discount: 0.75,
    remainingSeats: 33
  },

  // ========== 上海 ⇄ 深圳 ==========
  {
    id: 'flight_083',
    flightNo: 'ZH9512',
    depCity: '上海',
    arrCity: '深圳',
    depTime: '07:30',
    arrTime: '10:00',
    airline: '深圳航空',
    price: 680,
    discount: 0.78,
    remainingSeats: 26
  },
  {
    id: 'flight_084',
    flightNo: 'MU5192',
    depCity: '上海',
    arrCity: '深圳',
    depTime: '15:00',
    arrTime: '17:30',
    airline: '东方航空',
    price: 620,
    discount: 0.72,
    remainingSeats: 40
  },
  {
    id: 'flight_085',
    flightNo: 'CA1891',
    depCity: '深圳',
    arrCity: '上海',
    depTime: '08:50',
    arrTime: '11:20',
    airline: '中国国航',
    price: 660,
    discount: 0.8,
    remainingSeats: 22
  },
  {
    id: 'flight_086',
    flightNo: 'CZ9219',
    depCity: '深圳',
    arrCity: '上海',
    depTime: '18:00',
    arrTime: '20:30',
    airline: '南方航空',
    price: 590,
    discount: 0.72,
    remainingSeats: 45
  },

  // ========== 上海 ⇄ 杭州 ==========
  {
    id: 'flight_087',
    flightNo: 'CA1775',
    depCity: '上海',
    arrCity: '杭州',
    depTime: '07:00',
    arrTime: '07:45',
    airline: '中国国航',
    price: 280,
    discount: 0.88,
    remainingSeats: 50
  },
  {
    id: 'flight_088',
    flightNo: 'MU5643',
    depCity: '上海',
    arrCity: '杭州',
    depTime: '16:30',
    arrTime: '17:15',
    airline: '东方航空',
    price: 240,
    discount: 0.82,
    remainingSeats: 60
  },
  {
    id: 'flight_089',
    flightNo: 'MF8111',
    depCity: '杭州',
    arrCity: '上海',
    depTime: '08:10',
    arrTime: '08:55',
    airline: '厦门航空',
    price: 260,
    discount: 0.85,
    remainingSeats: 45
  },
  {
    id: 'flight_090',
    flightNo: 'HU7423',
    depCity: '杭州',
    arrCity: '上海',
    depTime: '18:20',
    arrTime: '19:05',
    airline: '海南航空',
    price: 220,
    discount: 0.78,
    remainingSeats: 55
  },

  // ========== 上海 ⇄ 西安 ==========
  {
    id: 'flight_091',
    flightNo: 'MU2153',
    depCity: '上海',
    arrCity: '西安',
    depTime: '08:30',
    arrTime: '11:00',
    airline: '东方航空',
    price: 520,
    discount: 0.78,
    remainingSeats: 32
  },
  {
    id: 'flight_092',
    flightNo: 'CA1217',
    depCity: '上海',
    arrCity: '西安',
    depTime: '14:50',
    arrTime: '17:20',
    airline: '中国国航',
    price: 480,
    discount: 0.72,
    remainingSeats: 38
  },
  {
    id: 'flight_093',
    flightNo: 'CZ6974',
    depCity: '西安',
    arrCity: '上海',
    depTime: '09:40',
    arrTime: '12:10',
    airline: '南方航空',
    price: 500,
    discount: 0.8,
    remainingSeats: 24
  },
  {
    id: 'flight_094',
    flightNo: 'HU7850',
    depCity: '西安',
    arrCity: '上海',
    depTime: '19:00',
    arrTime: '21:30',
    airline: '海南航空',
    price: 450,
    discount: 0.72,
    remainingSeats: 42
  },

  // ========== 广州 ⇄ 成都 ==========
  {
    id: 'flight_095',
    flightNo: '3U8736',
    depCity: '广州',
    arrCity: '成都',
    depTime: '08:10',
    arrTime: '10:40',
    airline: '四川航空',
    price: 680,
    discount: 0.8,
    remainingSeats: 28,
    depDate: '2026-06-28'
  },
  {
    id: 'flight_096',
    flightNo: 'CZ3401',
    depCity: '广州',
    arrCity: '成都',
    depTime: '16:00',
    arrTime: '18:30',
    airline: '南方航空',
    price: 620,
    discount: 0.72,
    remainingSeats: 36,
    depDate: '2026-06-28'
  },
  {
    id: 'flight_097',
    flightNo: 'CA4311',
    depCity: '成都',
    arrCity: '广州',
    depTime: '07:40',
    arrTime: '10:10',
    airline: '中国国航',
    price: 660,
    discount: 0.78,
    remainingSeats: 22
  },
  {
    id: 'flight_098',
    flightNo: 'MU5225',
    depCity: '成都',
    arrCity: '广州',
    depTime: '15:30',
    arrTime: '18:00',
    airline: '东方航空',
    price: 590,
    discount: 0.72,
    remainingSeats: 40
  },

  // ========== 广州 ⇄ 深圳 ==========
  {
    id: 'flight_099',
    flightNo: 'CZ6329',
    depCity: '广州',
    arrCity: '深圳',
    depTime: '07:20',
    arrTime: '08:10',
    airline: '南方航空',
    price: 320,
    discount: 0.9,
    remainingSeats: 55
  },
  {
    id: 'flight_100',
    flightNo: 'ZH9823',
    depCity: '广州',
    arrCity: '深圳',
    depTime: '17:00',
    arrTime: '17:50',
    airline: '深圳航空',
    price: 280,
    discount: 0.85,
    remainingSeats: 62
  },
  {
    id: 'flight_101',
    flightNo: 'CA1797',
    depCity: '深圳',
    arrCity: '广州',
    depTime: '08:30',
    arrTime: '09:20',
    airline: '中国国航',
    price: 300,
    discount: 0.88,
    remainingSeats: 48
  },
  {
    id: 'flight_102',
    flightNo: 'MU5217',
    depCity: '深圳',
    arrCity: '广州',
    depTime: '18:30',
    arrTime: '19:20',
    airline: '东方航空',
    price: 260,
    discount: 0.82,
    remainingSeats: 58
  },

  // ========== 成都 ⇄ 重庆 ==========
  {
    id: 'flight_103',
    flightNo: '3U8631',
    depCity: '成都',
    arrCity: '重庆',
    depTime: '07:30',
    arrTime: '08:30',
    airline: '四川航空',
    price: 240,
    discount: 0.88,
    remainingSeats: 52,
    depDate: '2026-06-10'
  },
  {
    id: 'flight_104',
    flightNo: 'CA4365',
    depCity: '成都',
    arrCity: '重庆',
    depTime: '16:00',
    arrTime: '17:00',
    airline: '中国国航',
    price: 200,
    discount: 0.82,
    remainingSeats: 60,
    depDate: '2026-06-10'
  },
  {
    id: 'flight_105',
    flightNo: 'CZ9877',
    depCity: '重庆',
    arrCity: '成都',
    depTime: '09:00',
    arrTime: '10:00',
    airline: '南方航空',
    price: 220,
    discount: 0.85,
    remainingSeats: 45
  },
  {
    id: 'flight_106',
    flightNo: 'MU2687',
    depCity: '重庆',
    arrCity: '成都',
    depTime: '19:00',
    arrTime: '20:00',
    airline: '东方航空',
    price: 190,
    discount: 0.78,
    remainingSeats: 55
  },

  // ========== 成都 ⇄ 西安 ==========
  {
    id: 'flight_107',
    flightNo: '3U8883',
    depCity: '成都',
    arrCity: '西安',
    depTime: '08:00',
    arrTime: '09:30',
    airline: '四川航空',
    price: 380,
    discount: 0.8,
    remainingSeats: 34
  },
  {
    id: 'flight_108',
    flightNo: 'CA4216',
    depCity: '成都',
    arrCity: '西安',
    depTime: '15:30',
    arrTime: '17:00',
    airline: '中国国航',
    price: 340,
    discount: 0.75,
    remainingSeats: 42
  },
  {
    id: 'flight_109',
    flightNo: 'CZ6483',
    depCity: '西安',
    arrCity: '成都',
    depTime: '09:10',
    arrTime: '10:40',
    airline: '南方航空',
    price: 360,
    discount: 0.82,
    remainingSeats: 28
  },
  {
    id: 'flight_110',
    flightNo: 'MU2368',
    depCity: '西安',
    arrCity: '成都',
    depTime: '18:00',
    arrTime: '19:30',
    airline: '东方航空',
    price: 320,
    discount: 0.72,
    remainingSeats: 48
  }
]
