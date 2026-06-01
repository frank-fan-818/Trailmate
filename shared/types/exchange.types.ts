export interface CurrencyInfo {
  code: string    // ISO 4217, e.g. 'CNY'
  name: string    // Chinese name, e.g. '人民币'
  flag: string    // Emoji flag
  symbol: string  // Currency symbol, e.g. '¥'
}

export interface ExchangeRate {
  base: string
  date: string
  rates: Record<string, number>
}

export interface ExchangeResult {
  from: string
  to: string
  amount: number
  result: number
  rate: number
  date: string
}

export interface HistoricalRate {
  date: string
  rate: number
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'CNY', name: '人民币', flag: '🇨🇳', symbol: '¥' },
  { code: 'USD', name: '美元', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: '欧元', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', name: '日元', flag: '🇯🇵', symbol: '¥' },
  { code: 'GBP', name: '英镑', flag: '🇬🇧', symbol: '£' },
  { code: 'KRW', name: '韩元', flag: '🇰🇷', symbol: '₩' },
  { code: 'THB', name: '泰铢', flag: '🇹🇭', symbol: '฿' },
  { code: 'AUD', name: '澳元', flag: '🇦🇺', symbol: 'A$' },
  { code: 'SGD', name: '新币', flag: '🇸🇬', symbol: 'S$' },
  { code: 'HKD', name: '港币', flag: '🇭🇰', symbol: 'HK$' },
  { code: 'CAD', name: '加元', flag: '🇨🇦', symbol: 'C$' },
  { code: 'CHF', name: '瑞士法郎', flag: '🇨🇭', symbol: 'Fr' },
  { code: 'SEK', name: '瑞典克朗', flag: '🇸🇪', symbol: 'kr' },
  { code: 'NZD', name: '新西兰元', flag: '🇳🇿', symbol: 'NZ$' },
  { code: 'MXN', name: '墨西哥比索', flag: '🇲🇽', symbol: 'Mex$' },
  { code: 'BRL', name: '巴西雷亚尔', flag: '🇧🇷', symbol: 'R$' },
  { code: 'INR', name: '印度卢比', flag: '🇮🇳', symbol: '₹' },
  { code: 'RUB', name: '俄罗斯卢布', flag: '🇷🇺', symbol: '₽' },
  { code: 'ZAR', name: '南非兰特', flag: '🇿🇦', symbol: 'R' },
  { code: 'TRY', name: '土耳其里拉', flag: '🇹🇷', symbol: '₺' },
  { code: 'SAR', name: '沙特里亚尔', flag: '🇸🇦', symbol: '﷼' },
  { code: 'AED', name: '阿联酋迪拉姆', flag: '🇦🇪', symbol: 'د.إ' },
  { code: 'MYR', name: '马来西亚林吉特', flag: '🇲🇾', symbol: 'RM' },
  { code: 'PHP', name: '菲律宾比索', flag: '🇵🇭', symbol: '₱' },
  { code: 'IDR', name: '印尼盾', flag: '🇮🇩', symbol: 'Rp' },
  { code: 'VND', name: '越南盾', flag: '🇻🇳', symbol: '₫' },
  { code: 'TWD', name: '新台币', flag: '🇹🇼', symbol: 'NT$' },
  { code: 'MOP', name: '澳门元', flag: '🇲🇴', symbol: 'MOP$' },
  { code: 'PLN', name: '波兰兹罗提', flag: '🇵🇱', symbol: 'zł' },
  { code: 'DKK', name: '丹麦克朗', flag: '🇩🇰', symbol: 'kr' },
  { code: 'NOK', name: '挪威克朗', flag: '🇳🇴', symbol: 'kr' },
]
