import type { ICore } from './interfaces/core.interface'
import type { GlobalEvent } from './interfaces/event.types'

interface SecurityRule {
  eventPattern: RegExp
  check: (core: ICore, data: any, event: GlobalEvent) => boolean | Promise<boolean>
  errorMessage?: string
}

export class SecurityInterceptor {
  private rules: SecurityRule[] = [
    {
      eventPattern: /^social\..*(request|publish)$/,
      check: async (core, data) => {
        const isVerified = await core.service.call('user.realname.isVerified', { userId: data.userId })
        return isVerified
      },
      errorMessage: '请先完成实名认证后再使用社交功能'
    },
    {
      eventPattern: /^location\..*/,
      check: async (core, data) => {
        const hasPermission = await core.service.call('user.permission.check', { permission: 'location' })
        return hasPermission
      },
      errorMessage: '请先开启位置权限'
    }
  ]

  constructor(private core: ICore) {}

  async intercept(event: GlobalEvent, data: any): Promise<{ pass: boolean; message?: string }> {
    for (const rule of this.rules) {
      if (rule.eventPattern.test(event as string)) {
        const pass = await rule.check(this.core, data, event)
        if (!pass) {
          return { pass: false, message: rule.errorMessage || '安全校验未通过' }
        }
      }
    }
    return { pass: true }
  }

  addRule(rule: SecurityRule): void {
    this.rules.push(rule)
  }
}