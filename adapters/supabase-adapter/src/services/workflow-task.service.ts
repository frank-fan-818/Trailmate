import { getSupabaseClient } from '../client'

export interface WorkflowTaskRow {
  id: string
  request_id: string
  workflow_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  current_step: string
  error_msg: string | null
  error_step: string | null
  execution_log: WorkflowExecutionLogEntry[]
  created_at: string
  started_at: string | null
  completed_at: string | null
  duration_ms: number | null
}

export interface WorkflowExecutionLogEntry {
  step: string
  startedAt: number
  completedAt?: number
  durationMs?: number
  error?: string
}

export interface CreateWorkflowTaskParams {
  requestId: string
  workflowType?: string
}

export interface UpdateWorkflowTaskParams {
  status?: 'pending' | 'running' | 'completed' | 'failed'
  currentStep?: string
  errorMsg?: string | null
  errorStep?: string | null
  startedAt?: string
  completedAt?: string
  durationMs?: number
}

export interface AppendExecutionLogParams {
  taskId: string
  entry: WorkflowExecutionLogEntry
}

export async function createWorkflowTask(params: CreateWorkflowTaskParams): Promise<WorkflowTaskRow> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('workflow_tasks')
    .insert({
      request_id: params.requestId,
      workflow_type: params.workflowType || 'itinerary_generation',
      status: 'pending',
      current_step: 'init',
      execution_log: []
    })
    .select()
    .single()

  if (error) {
    console.error('创建工作流任务失败:', error)
    throw error
  }

  return data as WorkflowTaskRow
}

export async function updateWorkflowTask(taskId: string, params: UpdateWorkflowTaskParams): Promise<WorkflowTaskRow> {
  const supabase = getSupabaseClient()

  const updateData: Record<string, unknown> = {}

  if (params.status !== undefined) updateData.status = params.status
  if (params.currentStep !== undefined) updateData.current_step = params.currentStep
  if (params.errorMsg !== undefined) updateData.error_msg = params.errorMsg
  if (params.errorStep !== undefined) updateData.error_step = params.errorStep
  if (params.startedAt !== undefined) updateData.started_at = params.startedAt
  if (params.completedAt !== undefined) updateData.completed_at = params.completedAt
  if (params.durationMs !== undefined) updateData.duration_ms = params.durationMs

  const { data, error } = await supabase
    .from('workflow_tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('更新工作流任务失败:', error)
    throw error
  }

  return data as WorkflowTaskRow
}

export async function appendExecutionLog(params: AppendExecutionLogParams): Promise<WorkflowTaskRow> {
  const supabase = getSupabaseClient()

  const { data: current, error: fetchError } = await supabase
    .from('workflow_tasks')
    .select('execution_log')
    .eq('id', params.taskId)
    .single()

  if (fetchError) {
    console.error('获取工作流任务日志失败:', fetchError)
    throw fetchError
  }

  const currentLog = (current?.execution_log || []) as WorkflowExecutionLogEntry[]
  const updatedLog = [...currentLog, params.entry]

  const { data, error } = await supabase
    .from('workflow_tasks')
    .update({ execution_log: updatedLog })
    .eq('id', params.taskId)
    .select()
    .single()

  if (error) {
    console.error('追加执行日志失败:', error)
    throw error
  }

  return data as WorkflowTaskRow
}

export async function getWorkflowTask(taskId: string): Promise<WorkflowTaskRow | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('workflow_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('获取工作流任务失败:', error)
    throw error
  }

  return data as WorkflowTaskRow
}

export async function getWorkflowTasksByRequestId(requestId: string): Promise<WorkflowTaskRow[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('workflow_tasks')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('查询工作流任务失败:', error)
    throw error
  }

  return (data || []) as WorkflowTaskRow[]
}

export async function getWorkflowTaskLogs(taskId: string): Promise<WorkflowExecutionLogEntry[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('workflow_tasks')
    .select('execution_log')
    .eq('id', taskId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return []
    console.error('获取工作流任务日志失败:', error)
    throw error
  }

  return (data?.execution_log || []) as WorkflowExecutionLogEntry[]
}
