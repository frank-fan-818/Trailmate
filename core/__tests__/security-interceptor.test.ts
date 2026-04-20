import { describe, expect, test, vi } from 'vitest'
import { SecurityInterceptor } from '../security-interceptor'
import { GlobalEvent } from '../interfaces/event.types'
import type { ICore } from '../interfaces/core.interface'

describe('security interceptor', () => {
  test('checks location permission for perception location events', async () => {
    const call = vi.fn(async () => true)
    const core = {
      service: { call },
      eventBus: null,
      state: null,
      pluginManager: null,
      di: null,
      config: null
    } as unknown as ICore

    const interceptor = new SecurityInterceptor(core)
    const result = await interceptor.intercept(GlobalEvent.LOCATION_CHANGED, {
      userId: 'demo-user'
    })

    expect(result.pass).toBe(true)
    expect(call).toHaveBeenCalledWith('user.permission.check', {
      permission: 'location',
      userId: 'demo-user'
    })
  })
})
