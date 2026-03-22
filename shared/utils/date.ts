/**
 * 格式化时间为HH:mm格式
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化日期为YYYY-MM-DD格式
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 计算两个时间的时间差，返回分钟数
 */
export function getTimeDiffMinutes(start: Date | string | number, end: Date | string | number): number {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return Math.round((endTime - startTime) / (1000 * 60))
}

/**
 * 判断时间是否在指定范围内
 */
export function isTimeInRange(time: string, start: string, end: string): boolean {
  const timeNum = parseInt(time.replace(':', ''), 10)
  const startNum = parseInt(start.replace(':', ''), 10)
  const endNum = parseInt(end.replace(':', ''), 10)
  return timeNum >= startNum && timeNum <= endNum
}
