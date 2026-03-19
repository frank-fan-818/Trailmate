import type { IPlugin, ICore } from '@trailmate/core'
import { initSupabaseClient } from './src/client'
import { queryFlights } from './src/services/flight.service'
import { queryHotels } from './src/services/hotel.service'
import { queryAttractions } from './src/services/attraction.service'
import { queryWeather } from './src/services/weather.service'

export default class SupabaseAdapterModule implements IPlugin {
  pluginId = 'supabase-adapter'
  pluginName = 'Supabase数据适配器'
  version = '1.0.0'
  dependencies = []

  private core: ICore | null = null

  onInstall(core: ICore) {
    this.core = core
    
    initSupabaseClient(core)

    core.service.register('flight.query', queryFlights)
    core.service.register('hotel.query', queryHotels)
    core.service.register('attraction.query', queryAttractions)
    core.service.register('weather.query', queryWeather)
  }

  onMount(core: ICore) {
    console.log('✅ Supabase数据适配器启动成功')
  }

  onUnmount(core: ICore) {
    console.log('🛑 Supabase数据适配器已卸载')
  }
}
