/**
 * 计算两个经纬度之间的距离，单位：米
 * @param lat1 点1纬度
 * @param lng1 点1经度
 * @param lat2 点2纬度
 * @param lng2 点2经度
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radLat1 = (lat1 * Math.PI) / 180.0
  const radLat2 = (lat2 * Math.PI) / 180.0
  const a = radLat1 - radLat2
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
  let s = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
    )
  )
  s = s * 6378137 // 地球半径，单位米
  s = Math.round(s * 10000) / 10000
  return s
}

/**
 * 计算中心点坐标
 */
export function getCenterPoint(points: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (points.length === 0) {
    return { lat: 0, lng: 0 }
  }

  const sum = points.reduce(
    (acc, point) => {
      acc.lat += point.lat
      acc.lng += point.lng
      return acc
    },
    { lat: 0, lng: 0 }
  )

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length
  }
}

/**
 * 判断是否在圆形范围内
 */
export function isInCircle(
  targetLat: number,
  targetLng: number,
  centerLat: number,
  centerLng: number,
  radius: number
): boolean {
  const distance = getDistance(targetLat, targetLng, centerLat, centerLng)
  return distance <= radius
}
