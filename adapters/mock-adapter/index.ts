import type { IPlugin, ICore } from '../../core'
import { queryFlights } from './src/services/flight.service'
import { queryHotels } from './src/services/hotel.service'
import { queryAttractions } from './src/services/attraction.service'
import { queryWeather } from './src/services/weather.service'

export default class MockAdapterModule implements IPlugin {
  pluginId = 'mock-adapter'
  pluginName = '模拟数据适配器'
  version = '1.0.0'
  dependencies = []

  private core: ICore | null = null

  onInstall(core: ICore) {
    this.core = core

    core.service.register('flight.query', queryFlights, { fallback: true })
    core.service.register('hotel.query', queryHotels, { fallback: true })
    core.service.register('attraction.query', queryAttractions, { fallback: true })
    core.service.register('weather.query', queryWeather, { fallback: true })
  }

  onMount(core: ICore) {
    console.log('✅ 模拟数据适配器启动成功')
  }

  onUnmount(core: ICore) {
    console.log('🛑 模拟数据适配器已卸载')
  }
}
