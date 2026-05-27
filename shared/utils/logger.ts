// ====== Structured JSON Logger ======
// Usage: const log = createLogger(traceId)
//   log.entry('request received', { userId, message })
//   log.step('llm-call-1', 'calling LLM', { model, msgCount })
//   log.exit('response sent', durationMs, { contentLength })
//   log.error('llm-call', 'LLM failed', error, { attempt })

export interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  traceId: string
  event: 'ENTRY' | 'STEP' | 'EXIT'
  step?: string
  message: string
  durationMs?: number
  error?: string
  data?: Record<string, unknown>
}

export interface StructuredLogger {
  entry(msg: string, data?: Record<string, unknown>): void
  step(stepName: string, msg: string, data?: Record<string, unknown>): void
  exit(msg: string, durationMs: number, data?: Record<string, unknown>): void
  error(stepName: string, msg: string, err: Error, data?: Record<string, unknown>): void
}

export function createLogger(traceId: string): StructuredLogger {
  function emit(entry: LogEntry) {
    // JSON-line output 便于日志采集工具解析
    console.log(JSON.stringify(entry))
  }

  return {
    entry(msg, data) {
      emit({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        traceId,
        event: 'ENTRY',
        message: msg,
        data
      })
    },

    step(stepName, msg, data) {
      emit({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        traceId,
        event: 'STEP',
        step: stepName,
        message: msg,
        data
      })
    },

    exit(msg, durationMs, data) {
      emit({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        traceId,
        event: 'EXIT',
        message: msg,
        durationMs,
        data
      })
    },

    error(stepName, msg, err, data) {
      emit({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        traceId,
        event: 'STEP',
        step: stepName,
        message: msg,
        error: err.message,
        data
      })
    }
  }
}

/** Generate a short unique trace ID */
export function generateTraceId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${ts}-${rand}`
}
