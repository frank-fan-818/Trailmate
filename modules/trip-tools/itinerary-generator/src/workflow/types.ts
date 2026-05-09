import type { ItineraryPlan, ItineraryRequest } from '../types'
import type { Flight, Hotel, Attraction } from '../../../../../shared/types/travel.types'

export enum WorkflowStep {
  INIT = 'init',
  VALIDATE_INPUT = 'validate_input',
  SAVE_REQUEST = 'save_request',
  PARSE_INTENT = 'parse_intent',
  QUERY_DATA = 'query_data',
  GENERATE_PLANS = 'generate_plans',
  VALIDATE_PLANS = 'validate_plans',
  SAVE_PLANS = 'save_plans',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface WorkflowTask {
  id: string
  status: WorkflowStatus
  currentStep: WorkflowStep
  requestId: string
  errorMsg?: string
  errorStep?: WorkflowStep
  createdAt: number
  updatedAt: number
  startedAt?: number
  completedAt?: number
  durationMs?: number
}

export interface ParsedIntent {
  destination: string
  days: number
  budget?: 'low' | 'medium' | 'high'
  travelers?: {
    adults: number
    children: number
  }
  preferences?: string[]
}

export interface WorkflowContext {
  request: ItineraryRequest
  parsedIntent?: ParsedIntent
  flights?: Flight[]
  hotels?: Hotel[]
  attractions?: Attraction[]
  plans?: ItineraryPlan[]
  error?: string
}

export interface WorkflowExecutionLog {
  step: WorkflowStep
  startedAt: number
  completedAt?: number
  durationMs?: number
  error?: string
}
