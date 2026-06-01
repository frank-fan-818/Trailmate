import type { IPlugin, ICore } from '../../core'
import { queryFlights } from './src/services/flight.service'
import { queryFlightsReal } from './src/services/flight-api.service'
import { queryHotels } from './src/services/hotel.service'
import { queryAttractions } from './src/services/attraction.service'
import { queryWeather } from './src/services/weather.service'
import { queryExchangeRateReal, getAllRatesReal } from './src/services/exchange-api.service'

export default class MockAdapterModule implements IPlugin {
  pluginId = 'mock-adapter'
  pluginName = '数据适配器'
  version = '1.0.0'
  dependencies = []

  private core: ICore | null = null

  onInstall(core: ICore) {
    this.core = core

    // ====== 真实API服务 (优先调用) ======
    // 内部自带mock fallback，确保永远有数据返回
    core.service.register('flight.queryReal', queryFlightsReal)
    core.service.register('exchange.query', queryExchangeRateReal)
    core.service.register('exchange.getAllRates', getAllRatesReal)

    // ====== 传统服务 ======
    core.service.register('flight.query', queryFlights, { fallback: true })
    core.service.register('hotel.query', queryHotels, { fallback: true })
    core.service.register('attraction.query', queryAttractions, { fallback: true })
    core.service.register('weather.query', queryWeather, { fallback: true })
    core.service.register('user.permission.check', async () => true, { fallback: true })
  }

  onMount(core: ICore) {
    console.log('✅ 模拟数据适配器启动成功')
  }

  onUnmount(core: ICore) {
    console.log('🛑 模拟数据适配器已卸载')
  }
}
