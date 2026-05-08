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
      eventPattern: /^social\..*(?:\.request|\.publish)$/,
      check: async (core, data) => {
        try {
          return await core.service.call<boolean>('user.realname.isVerified', {
            userId: data.userId
          })
        } catch {
          return false
        }
      },
      errorMessage: 'Please complete identity verification before using social features.'
    },
    {
      eventPattern: /^perception\.location_changed$/,
      check: async (core, data) => {
        try {
          return await core.service.call<boolean>('user.permission.check', {
            permission: 'location',
            userId: data.userId
          })
        } catch {
          return false
        }
      },
      errorMessage: 'Please grant location access before using perception features.'
    }
  ]

  constructor(private core: ICore) {}

  async intercept(event: GlobalEvent, data: any): Promise<{ pass: boolean; message?: string }> {
    for (const rule of this.rules) {
      if (rule.eventPattern.test(event as string)) {
        const pass = await rule.check(this.core, data, event)
        if (!pass) {
          return { pass: false, message: rule.errorMessage ?? 'Security validation failed' }
        }
      }
    }

    return { pass: true }
  }

  addRule(rule: SecurityRule): void {
    this.rules.push(rule)
  }
}
