import { createLogger, generateTraceId, type StructuredLogger } from '../utils/logger'
import type { AgentMessage } from './types'

export abstract class BaseWorker<TInput, TOutput> {
  abstract readonly name: string

  protected abstract execute(input: TInput, log: StructuredLogger): Promise<TOutput>

  async run(input: TInput, traceId: string): Promise<AgentMessage<TOutput>> {
    const log = createLogger(traceId)
    const startTime = Date.now()

    log.step(this.name, 'worker received task', { input })

    try {
      const result = await this.execute(input, log)

      const message: AgentMessage<TOutput> = {
        id: `${this.name}-${Date.now()}`,
        type: 'result',
        from: this.name,
        to: 'orchestrator',
        payload: result,
        timestamp: Date.now(),
        correlationId: traceId
      }

      log.step(this.name, 'worker completed', {
        durationMs: Date.now() - startTime
      })

      return message
    } catch (error) {
      const err = error as Error
      log.error(this.name, 'worker failed', err)

      return {
        id: `${this.name}-${Date.now()}`,
        type: 'error',
        from: this.name,
        to: 'orchestrator',
        payload: null as unknown as TOutput,
        timestamp: Date.now(),
        correlationId: traceId
      }
    }
  }
}
