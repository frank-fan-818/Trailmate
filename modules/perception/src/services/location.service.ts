import type PerceptionModule from '../../index'
import type { LocationInfo } from '../types'
import { GlobalEvent } from '@trailmate/core'

const BAIDU_MAP_AK = import.meta.env.VITE_BAIDU_MAP_AK as string

const userLocations = new Map<string, LocationInfo>()
const autoSimulateTimers = new Map<string, ReturnType<typeof setInterval>>()
const locationWatchers = new Map<string, number>()

/**
 * WGS84坐标转百度BD09坐标（REST API方式）
 * coords格式：经度,纬度
 * model=2: gps to bd09ll
 */
function convertWGSToBaidu(lat: number, lng: number): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    console.log('convertWGSToBaidu被调用, 原始坐标:', lat, lng)

    const url = `/api/baidumap/geoconv/v2/?coords=${lng},${lat}&model=2&ak=${BAIDU_MAP_AK}&output=json`
    console.log('坐标转换请求:', url)

    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('坐标转换响应:', data)
        if (data.status === 0 && data.result && data.result.length > 0) {
          console.log('坐标转换成功:', data.result[0])
          resolve({ lat: data.result[0].y, lng: data.result[0].x })
        } else {
          console.error('坐标转换失败，使用原始坐标, status:', data.status)
          resolve({ lat, lng })
        }
      })
      .catch(e => {
        console.error('坐标转换异常:', e)
        resolve({ lat, lng })
      })
  })
}

/**
 * 百度逆地理编码（V3 API）
 * location格式：纬度,经度
 * coordtype：bd09ll（百度经纬度坐标）
 */
function baiduGeocoder(lat: number, lng: number): Promise<{ address: string; city: string } | null> {
  return new Promise((resolve) => {
    console.log('baiduGeocoder被调用, 坐标:', lat, lng)

    const url = `/api/baidumap/reverse_geocoding/v3/?ak=${BAIDU_MAP_AK}&extensions_poi=1&entire_poi=1&sort_strategy=distance&output=json&coordtype=bd09ll&location=${lat},${lng}`
    console.log('逆地理编码请求:', url)

    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('逆地理编码响应:', data)
        if (data.status === 0 && data.result) {
          console.log('逆地理编码成功, 地址:', data.result.formatted_address)
          console.log('城市:', data.result.addressComponent?.city)
          resolve({
            address: data.result.formatted_address || '',
            city: data.result.addressComponent?.city || ''
          })
        } else {
          console.error('逆地理编码失败, status:', data.status)
          resolve(null)
        }
      })
      .catch(e => {
        console.error('逆地理编码异常:', e)
        resolve(null)
      })
  })
}

/**
 * 手动设置用户位置
 */
export async function simulateLocation(this: PerceptionModule, params: {
  userId: string
  latitude: number
  longitude: number
  city: string
  address: string
  accuracy?: number
  travelMode?: 'walking' | 'driving' | 'public_transport'
}): Promise<LocationInfo> {
  const { userId, latitude, longitude, city, address, accuracy = 10, travelMode = 'driving' } = params

  const location: LocationInfo = {
    id: `loc_${Date.now()}`,
    userId,
    latitude,
    longitude,
    city,
    address,
    accuracy,
    travelMode,
    updateTime: Date.now()
  }

  userLocations.set(userId, location)

  // 更新上下文
  const context = this.getContext(userId)
  if (context) {
    context.currentLocation = location
    context.travelMode = travelMode
    context.updatedAt = Date.now()
    this.setContext(userId, context)
  }

  // 发布位置变更事件
  await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, location)

  return location
}

/**
 * 获取用户当前位置
 */
export async function getCurrentLocation(this: PerceptionModule, userId: string): Promise<LocationInfo | null> {
  return userLocations.get(userId) || null
}

/**
 * 开启/关闭自动位置模拟
 */
export async function toggleAutoSimulate(this: PerceptionModule, params: {
  userId: string
  enabled: boolean
  speed?: number // 模拟移动速度，单位km/h
}): Promise<boolean> {
  const { userId, enabled, speed: _speed = 60 } = params

  if (!enabled) {
    // 停止自动模拟
    const timer = autoSimulateTimers.get(userId)
    if (timer) {
      clearInterval(timer)
      autoSimulateTimers.delete(userId)
    }

    const context = this.getContext(userId)
    if (context) {
      context.isAutoSimulate = false
      this.setContext(userId, context)
    }

    return true
  }

  // 开启自动模拟
  const context = this.getContext(userId)
  if (!context?.currentLocation) {
    throw new Error('请先设置初始位置')
  }

  // 停止现有定时器
  const existingTimer = autoSimulateTimers.get(userId)
  if (existingTimer) {
    clearInterval(existingTimer)
  }

  // 更新上下文状态
  context.isAutoSimulate = true
  this.setContext(userId, context)

  // 简单模拟：每10秒更新一次位置，模拟位置移动
  const timer = setInterval(async () => {
    const currentLocation = userLocations.get(userId)
    if (!currentLocation) return

    // 模拟微小的位置偏移
    const newLocation: LocationInfo = {
      ...currentLocation,
      id: `loc_${Date.now()}`,
      latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.001,
      longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.001,
      updateTime: Date.now()
    }

    userLocations.set(userId, newLocation)

    // 更新上下文
    const context = this.getContext(userId)
    if (context) {
      context.currentLocation = newLocation
      context.updatedAt = Date.now()
      this.setContext(userId, context)
    }

    // 发布位置变更事件
    await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, newLocation)
  }, 10000)

  autoSimulateTimers.set(userId, timer)

  return true
}

/**
 * 获取真实位置（混合定位模式）
 * 1. 优先使用浏览器H5定位
 * 2. 获取坐标后调用百度逆地理编码获取地址
 */
export async function getRealLocation(this: PerceptionModule, userId: string): Promise<LocationInfo | null> {
  return new Promise(async (resolve) => {
    try {
      if (!navigator.geolocation) {
        console.warn('浏览器不支持定位')
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const browserLat = position.coords.latitude
          const browserLng = position.coords.longitude

          console.log(`浏览器定位成功: ${browserLat}, ${browserLng}`)

          try {
            // WGS84转百度坐标
            const bdCoord = await convertWGSToBaidu(browserLat, browserLng)
            console.log(`转换后坐标: ${bdCoord.lng}, ${bdCoord.lat}`)

            // 使用百度SDK进行逆地理编码
            const addressInfo = await baiduGeocoder(bdCoord.lat, bdCoord.lng)
            console.log(`逆地理编码结果:`, addressInfo)

            if (addressInfo) {
              const location: LocationInfo = {
                id: `loc_${Date.now()}`,
                userId,
                latitude: browserLat,
                longitude: browserLng,
                city: addressInfo.city,
                address: addressInfo.address,
                accuracy: position.coords.accuracy,
                travelMode: 'walking',
                updateTime: Date.now()
              }
              userLocations.set(userId, location)

              // 更新上下文
              const context = this.getContext(userId)
              if (context) {
                context.currentLocation = location
                context.updatedAt = Date.now()
                this.setContext(userId, context)
              }

              // 发布位置变更事件
              await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, location)

              resolve(location)
            } else {
              const location: LocationInfo = {
                id: `loc_${Date.now()}`,
                userId,
                latitude: browserLat,
                longitude: browserLng,
                city: '未知城市',
                address: `${browserLat.toFixed(4)}, ${browserLng.toFixed(4)}`,
                accuracy: position.coords.accuracy,
                travelMode: 'walking',
                updateTime: Date.now()
              }
              userLocations.set(userId, location)
              resolve(location)
            }
          } catch (e) {
            console.error('逆地理编码失败:', e)
            resolve(null)
          }
        },
        (error) => {
          console.warn('浏览器定位失败:', error.message)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } catch (e) {
      console.error('获取真实位置异常:', e)
      resolve(null)
    }
  })
}

/**
 * 启动真实位置持续跟踪
 * 返回停止函数
 */
export function startRealLocationWatcher(this: PerceptionModule, userId: string, onLocationUpdate: (loc: LocationInfo) => void): () => void {
  if (!navigator.geolocation) {
    console.warn('浏览器不支持定位')
    return () => {}
  }

  // 清除之前的watcher
  stopRealLocationWatcher.call(this, userId)

  const watcherId = navigator.geolocation.watchPosition(
    async (position) => {
      const browserLat = position.coords.latitude
      const browserLng = position.coords.longitude

      try {
        // WGS84转百度坐标
        const bdCoord = await convertWGSToBaidu(browserLat, browserLng)
        const addressInfo = await baiduGeocoder(bdCoord.lat, bdCoord.lng)
        const city = addressInfo?.city || '未知城市'
        const address = addressInfo?.address || `${browserLat.toFixed(4)}, ${browserLng.toFixed(4)}`

        const location: LocationInfo = {
          id: `loc_${Date.now()}`,
          userId,
          latitude: browserLat,
          longitude: browserLng,
          city,
          address,
          accuracy: position.coords.accuracy,
          travelMode: 'walking',
          updateTime: Date.now()
        }

        userLocations.set(userId, location)

        // 更新上下文
        const context = this.getContext(userId)
        if (context) {
          context.currentLocation = location
          context.updatedAt = Date.now()
          this.setContext(userId, context)
        }

        // 发布位置变更事件
        await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, location)

        onLocationUpdate(location)
      } catch (e) {
        console.error('位置更新失败:', e)
      }
    },
    (error) => {
      console.warn('位置跟踪失败:', error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }
  )

  locationWatchers.set(userId, watcherId)
  return () => {
    stopRealLocationWatcher.call(this, userId)
  }
}

/**
 * 停止真实位置跟踪
 */
export function stopRealLocationWatcher(this: PerceptionModule, userId: string): void {
  const watcherId = locationWatchers.get(userId)
  if (watcherId !== undefined) {
    navigator.geolocation.clearWatch(watcherId)
    locationWatchers.delete(userId)
  }
}
