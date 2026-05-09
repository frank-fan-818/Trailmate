import type { ItineraryPlan, ItineraryRequest } from '../types/index.js'
import type { Flight, Hotel, Attraction } from '../../../../../shared/types/travel.types.js'
import {
  WorkflowEngine,
  WorkflowStatus,
  type WorkflowStepConfig,
  type WorkflowExecutionLog,
  type WorkflowTaskPersister
} from '../../../../../shared/workflow-engine.ts'
import { WorkflowStep, type WorkflowTask, type ParsedIntent, type WorkflowContext } from './types.js'

export { WorkflowStep, WorkflowStatus }
export type { WorkflowTask, ParsedIntent, WorkflowContext, WorkflowExecutionLog }

export interface WorkflowTaskService {
  createTask(params: { requestId: string; workflowType?: string }): Promise<{ id: string }>
  updateTask(taskId: string, params: {
    status?: string
    currentStep?: string
    errorMsg?: string | null
    errorStep?: string | null
    startedAt?: string
    completedAt?: string
    durationMs?: number
  }): Promise<void>
  appendLog(taskId: string, entry: WorkflowExecutionLog): Promise<void>
  getTask?(taskId: string): Promise<WorkflowTask | null>
  getLogs?(taskId: string): Promise<WorkflowExecutionLog[]>
}

function createMockWorkflowTaskService(): WorkflowTaskService {
  return {
    createTask: async (params) => {
      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('[MockDB] 创建工作流任务:', id)
      return { id }
    },
    updateTask: async (taskId, params) => {
      console.log('[MockDB] 更新工作流任务:', taskId, '步骤:', params.currentStep, '状态:', params.status)
    },
    appendLog: async (taskId, entry) => {
      console.log('[MockDB] 追加执行日志:', taskId, entry.step, `${entry.durationMs}ms`)
    }
  }
}

function createPersisterFromService(service: WorkflowTaskService): WorkflowTaskPersister {
  return {
    createTask: async (params) => {
      await service.createTask({ requestId: params.taskId, workflowType: params.workflowType })
    },
    updateTask: async (taskId, state) => {
      await service.updateTask(taskId, {
        status: state.status,
        currentStep: state.currentStep,
        errorMsg: state.errorMsg || null,
        errorStep: state.errorStep || null,
        startedAt: state.startedAt ? new Date(state.startedAt).toISOString() : undefined,
        completedAt: state.completedAt ? new Date(state.completedAt).toISOString() : undefined,
        durationMs: state.durationMs
      })
    },
    appendLog: async (taskId, entry) => {
      await service.appendLog(taskId, entry)
    },
    getTask: service.getTask
      ? async (taskId) => {
        const task = await service.getTask!(taskId)
        if (!task) return null
        return {
          id: task.id,
          status: task.status as WorkflowStatus,
          currentStep: task.currentStep,
          errorMsg: task.errorMsg,
          errorStep: task.errorStep,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          startedAt: task.startedAt,
          completedAt: task.completedAt,
          durationMs: task.durationMs
        }
      }
      : undefined,
    getLogs: service.getLogs || undefined
  }
}

const mockDB = {
  itineraryRequests: {
    create: async (data: any) => {
      console.log('[DB] 保存请求:', data.id)
      return data
    },
    update: async (query: any) => {
      console.log('[DB] 更新请求:', query.where.id, '状态:', query.data.status)
      return query.data
    }
  },
  itineraryPlans: {
    create: async (data: any) => {
      console.log('[DB] 保存方案:', data.name)
      return data
    }
  }
}

async function callLLM(prompt: string): Promise<string> {
  console.log('[LLM] 调用大模型...')
  await new Promise(resolve => setTimeout(resolve, 500))

  if (prompt.includes('解析用户意图')) {
    return JSON.stringify({
      destination: '青岛',
      days: 3,
      budget: 'medium',
      travelers: { adults: 2, children: 1 },
      preferences: ['亲子', '海滩', '美食']
    })
  }

  if (prompt.includes('生成行程方案')) {
    return JSON.stringify({
      plans: [
        {
          name: '亲子休闲版',
          description: '节奏舒缓，适合带孩子的家庭',
          tags: ['亲子', '休闲', '美食'],
          totalDays: 3,
          totalCost: 3500,
          days: [
            {
              day: 1,
              items: [
                { type: 'flight', name: '北京-青岛', startTime: '08:00', endTime: '10:00', cost: 800 },
                { type: 'hotel', name: '海景酒店', startTime: '11:00', endTime: '12:00', cost: 500 },
                { type: 'meal', name: '海鲜午餐', startTime: '12:30', endTime: '13:30', cost: 200 },
                { type: 'attraction', name: '金沙滩', startTime: '14:00', endTime: '17:00', cost: 0 }
              ]
            },
            {
              day: 2,
              items: [
                { type: 'attraction', name: '极地海洋世界', startTime: '09:00', endTime: '12:00', cost: 280 },
                { type: 'meal', name: '特色午餐', startTime: '12:30', endTime: '13:30', cost: 150 },
                { type: 'attraction', name: '栈桥', startTime: '14:00', endTime: '16:00', cost: 0 }
              ]
            },
            {
              day: 3,
              items: [
                { type: 'attraction', name: '八大关', startTime: '09:00', endTime: '11:00', cost: 0 },
                { type: 'meal', name: '告别午餐', startTime: '11:30', endTime: '12:30', cost: 180 },
                { type: 'flight', name: '青岛-北京', startTime: '15:00', endTime: '17:00', cost: 800 }
              ]
            }
          ]
        },
        {
          name: '探索打卡版',
          description: '覆盖经典景点，适合喜欢探索的旅行者',
          tags: ['打卡', '摄影', '风景'],
          totalDays: 3,
          totalCost: 3200,
          days: [
            {
              day: 1,
              items: [
                { type: 'flight', name: '北京-青岛', startTime: '08:00', endTime: '10:00', cost: 800 },
                { type: 'attraction', name: '栈桥', startTime: '11:00', endTime: '12:00', cost: 0 },
                { type: 'meal', name: '午餐', startTime: '12:30', endTime: '13:30', cost: 120 },
                { type: 'attraction', name: '信号山公园', startTime: '14:00', endTime: '16:00', cost: 15 }
              ]
            },
            {
              day: 2,
              items: [
                { type: 'attraction', name: '崂山风景区', startTime: '08:00', endTime: '16:00', cost: 180 },
                { type: 'meal', name: '山间午餐', startTime: '12:00', endTime: '13:00', cost: 100 }
              ]
            },
            {
              day: 3,
              items: [
                { type: 'attraction', name: '五四广场', startTime: '09:00', endTime: '11:00', cost: 0 },
                { type: 'attraction', name: '奥帆中心', startTime: '11:30', endTime: '13:00', cost: 0 },
                { type: 'meal', name: '午餐', startTime: '13:30', endTime: '14:30', cost: 150 },
                { type: 'flight', name: '青岛-北京', startTime: '17:00', endTime: '19:00', cost: 800 }
              ]
            }
          ]
        }
      ]
    })
  }

  return '{}'
}

const flightService = {
  query: async (params: { arrCity: string }): Promise<Flight[]> => {
    console.log('[Tool] 查询航班数据:', params.arrCity)
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      { id: 'flight_001', flightNo: 'CA1234', depCity: '北京', arrCity: '青岛', depTime: '08:00', arrTime: '10:00', airline: '中国国航', price: 800, discount: 0.8, remainingSeats: 20 },
      { id: 'flight_002', flightNo: 'MU5678', depCity: '北京', arrCity: '青岛', depTime: '14:00', arrTime: '16:00', airline: '东方航空', price: 750, discount: 0.75, remainingSeats: 15 }
    ]
  }
}

const hotelService = {
  query: async (params: { city: string }): Promise<Hotel[]> => {
    console.log('[Tool] 查询酒店数据:', params.city)
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      { id: 'hotel_001', name: '海景大酒店', starLevel: 5, address: '青岛市南区', price: 500, rating: 4.8, reviewCount: 1200, distanceFromCityCenter: 2.5, remainingRooms: 30 },
      { id: 'hotel_002', name: '栈桥假日酒店', starLevel: 4, address: '青岛市北区', price: 350, rating: 4.5, reviewCount: 800, distanceFromCityCenter: 1.2, remainingRooms: 20 }
    ]
  }
}

const attractionService = {
  query: async (params: { city: string }): Promise<Attraction[]> => {
    console.log('[Tool] 查询景点数据:', params.city)
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      { id: 'attr_001', name: '栈桥', address: '市南区', ticketPrice: 0, openTime: '00:00', closeTime: '23:59', rating: 4.6, reviewCount: 5000, estimatedVisitTime: 1.5, tags: ['免费', '地标'] },
      { id: 'attr_002', name: '崂山风景区', address: '崂山区', ticketPrice: 180, openTime: '08:00', closeTime: '17:00', rating: 4.7, reviewCount: 3000, estimatedVisitTime: 6, tags: ['5A景区', '山海'] },
      { id: 'attr_003', name: '金沙滩', address: '黄岛区', ticketPrice: 0, openTime: '00:00', closeTime: '23:59', rating: 4.7, reviewCount: 2500, estimatedVisitTime: 3, tags: ['免费', '沙滩'] },
      { id: 'attr_004', name: '极地海洋世界', address: '崂山区', ticketPrice: 280, openTime: '09:00', closeTime: '17:00', rating: 4.6, reviewCount: 2000, estimatedVisitTime: 4, tags: ['亲子', '海洋'] }
    ]
  }
}

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export class ItineraryWorkflow extends WorkflowEngine<WorkflowContext> {
  private taskService: WorkflowTaskService

  constructor(request: ItineraryRequest, taskService?: WorkflowTaskService) {
    const service = taskService || createMockWorkflowTaskService()
    const persister = createPersisterFromService(service)
    const context: WorkflowContext = { request }
    super(generateTaskId(), context, persister)
    this.taskService = service
  }

  protected get workflowType(): string {
    return 'itinerary_generation'
  }

  protected defineSteps(): WorkflowStepConfig<WorkflowContext>[] {
    return [
      {
        name: WorkflowStep.VALIDATE_INPUT,
        description: '输入校验',
        controlType: 'code',
        execute: this.stepValidateInput.bind(this)
      },
      {
        name: WorkflowStep.SAVE_REQUEST,
        description: '保存请求到数据库',
        controlType: 'code',
        execute: this.stepSaveRequest.bind(this)
      },
      {
        name: WorkflowStep.PARSE_INTENT,
        description: 'AI解析用户意图',
        controlType: 'llm',
        execute: this.stepParseIntent.bind(this)
      },
      {
        name: WorkflowStep.QUERY_DATA,
        description: '查询航班/酒店/景点数据',
        controlType: 'tool_calling',
        execute: this.stepQueryData.bind(this)
      },
      {
        name: WorkflowStep.GENERATE_PLANS,
        description: 'AI生成多套行程方案',
        controlType: 'llm',
        execute: this.stepGeneratePlans.bind(this)
      },
      {
        name: WorkflowStep.VALIDATE_PLANS,
        description: '校验方案完整性',
        controlType: 'code',
        execute: this.stepValidatePlans.bind(this)
      },
      {
        name: WorkflowStep.SAVE_PLANS,
        description: '保存方案到数据库',
        controlType: 'code',
        execute: this.stepSavePlans.bind(this)
      },
      {
        name: WorkflowStep.COMPLETE,
        description: '完成工作流',
        controlType: 'code',
        execute: this.stepComplete.bind(this)
      }
    ]
  }

  async execute(): Promise<ItineraryPlan[]> {
    console.log('\n========== 工作流开始执行 ==========')
    await super.execute()
    console.log(`========== 工作流执行完成，耗时: ${this.getTask().durationMs}ms ==========\n`)
    return this.getContext().plans!
  }

  private async stepValidateInput(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 1/8] 输入校验 (代码控制)`)
    const { content } = context.request

    if (!content || content.trim().length < 5) {
      throw new Error('行程描述至少需要5个字符')
    }
    if (content.length > 2000) {
      throw new Error('行程描述不能超过2000个字符')
    }
    console.log('✓ 输入校验通过')
  }

  private async stepSaveRequest(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 2/8] 保存请求 (代码控制)`)
    await mockDB.itineraryRequests.create({
      id: context.request.id,
      content: context.request.content,
      imageUrl: context.request.imageUrl,
      status: 'processing',
      createdAt: new Date()
    })
    console.log('✓ 请求已保存到数据库')
  }

  private async stepParseIntent(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 3/8] AI解析意图 (LLM控制)`)
    const prompt = `
请解析用户的行程需求，提取以下结构化信息：
用户输入："${context.request.content}"

请返回JSON格式：
{
  "destination": "目的地城市",
  "days": 天数(数字),
  "budget": "预算级别: low/medium/high",
  "travelers": { "adults": 成人数量, "children": 儿童数量 },
  "preferences": ["偏好标签1", "偏好标签2"]
}`
    const response = await callLLM(prompt)
    context.parsedIntent = JSON.parse(response) as ParsedIntent
    console.log('✓ 意图解析结果:', JSON.stringify(context.parsedIntent, null, 2))
  }

  private async stepQueryData(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 4/8] 查询基础数据 (Tool Calling)`)
    const { destination } = context.parsedIntent!
    const [flights, hotels, attractions] = await Promise.all([
      flightService.query({ arrCity: destination }),
      hotelService.query({ city: destination }),
      attractionService.query({ city: destination })
    ])
    context.flights = flights
    context.hotels = hotels
    context.attractions = attractions
    console.log(`✓ 查询完成: ${flights.length}个航班, ${hotels.length}个酒店, ${attractions.length}个景点`)
  }

  private async stepGeneratePlans(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 5/8] AI生成方案 (LLM控制)`)
    const { parsedIntent, flights, hotels, attractions } = context
    const prompt = `
基于以下信息生成2套不同风格的行程方案：
用户需求：
- 目的地：${parsedIntent!.destination}
- 天数：${parsedIntent!.days}天
- 预算：${parsedIntent!.budget || 'medium'}
- 偏好：${parsedIntent!.preferences?.join(', ') || '无'}
可用资源：
- 航班：${flights?.length || 0}个选项
- 酒店：${hotels?.length || 0}个选项
- 景点：${attractions?.length || 0}个选项
请生成JSON格式（包含2套方案）：...`
    const response = await callLLM(prompt)
    const result = JSON.parse(response)
    context.plans = result.plans.map((plan: any) => ({
      ...plan,
      id: generatePlanId(),
      requestId: context.request.id,
      createTime: Date.now()
    })) as ItineraryPlan[]
    console.log(`✓ 生成完成: ${context.plans!.length}套方案`)
    console.log('  -', context.plans![0].name, `(¥${context.plans![0].totalCost})`)
    console.log('  -', context.plans![1].name, `(¥${context.plans![1].totalCost})`)
  }

  private async stepValidatePlans(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 6/8] 校验方案完整性 (代码控制)`)
    const { plans, parsedIntent } = context
    if (!plans || plans.length === 0) throw new Error('未生成任何行程方案')
    for (const plan of plans) {
      if (!plan.name || !plan.description) throw new Error('方案缺少名称或描述')
      if (plan.totalDays !== parsedIntent!.days) throw new Error(`方案天数不匹配：期望${parsedIntent!.days}天，实际${plan.totalDays}天`)
      if (plan.totalCost <= 0) throw new Error('方案总成本必须大于0')
      if (!plan.days || plan.days.length === 0) throw new Error('方案缺少每日行程')
    }
    console.log('✓ 方案校验通过')
  }

  private async stepSavePlans(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 7/8] 保存方案到数据库 (代码控制)`)
    for (const plan of context.plans!) {
      await mockDB.itineraryPlans.create({ ...plan, requestId: context.request.id, createdAt: new Date() })
    }
    console.log(`✓ 已保存${context.plans!.length}套方案到数据库`)
  }

  private async stepComplete(context: WorkflowContext): Promise<void> {
    console.log(`\n[Step 8/8] 完成工作流 (代码控制)`)
    await mockDB.itineraryRequests.update({
      where: { id: context.request.id },
      data: { status: 'completed', completedAt: new Date() }
    })
    console.log('✓ 工作流完成，请求状态已更新')
    console.log('\n========== 执行日志 ==========')
    this.getExecutionLogs().forEach(log => {
      console.log(`${log.step}: ${log.durationMs}ms`)
    })
  }
}

export async function runItineraryWorkflow(
  request: ItineraryRequest,
  taskService?: WorkflowTaskService
): Promise<{ plans: ItineraryPlan[], task: WorkflowTask, logs: WorkflowExecutionLog[] }> {
  const workflow = new ItineraryWorkflow(request, taskService)
  const plans = await workflow.execute()
  return {
    plans,
    task: workflow.getTask() as WorkflowTask,
    logs: workflow.getExecutionLogs()
  }
}

export async function resumeItineraryWorkflow(
  taskId: string,
  request: ItineraryRequest,
  taskService: WorkflowTaskService
): Promise<{ plans: ItineraryPlan[], task: WorkflowTask, logs: WorkflowExecutionLog[] }> {
  const persister = createPersisterFromService(taskService)
  const snapshot = await WorkflowEngine.load<WorkflowContext>(taskId, persister, () => ({ request }))

  if (!snapshot) {
    throw new Error(`无法加载工作流任务: ${taskId}`)
  }

  if (snapshot.task.status !== WorkflowStatus.FAILED) {
    throw new Error(`工作流任务状态不是失败状态，无法恢复: ${snapshot.task.status}`)
  }

  const workflow = new ItineraryWorkflow(request, taskService)
  workflow.restoreState(snapshot)

  const plans = await workflow.resume()
  return {
    plans,
    task: workflow.getTask() as WorkflowTask,
    logs: workflow.getExecutionLogs()
  }
}
