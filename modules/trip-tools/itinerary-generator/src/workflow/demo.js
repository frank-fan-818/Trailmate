/**
 * 工作流演示脚本（JavaScript版本）
 * 运行: node src/workflow/demo.js
 */

// 模拟类型定义
// 工作流步骤枚举
const WorkflowStep = {
  INIT: 'init',
  VALIDATE_INPUT: 'validate_input',
  SAVE_REQUEST: 'save_request',
  PARSE_INTENT: 'parse_intent',
  QUERY_DATA: 'query_data',
  GENERATE_PLANS: 'generate_plans',
  VALIDATE_PLANS: 'validate_plans',
  SAVE_PLANS: 'save_plans',
  COMPLETE: 'complete',
  ERROR: 'error'
}

// 工作流状态枚举
const WorkflowStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// 模拟数据库操作
const mockDB = {
  itineraryRequests: {
    create: async (data) => {
      console.log('[DB] 保存请求:', data.id)
      return data
    },
    update: async (query) => {
      console.log('[DB] 更新请求:', query.where.id, '状态:', query.data.status)
      return query.data
    }
  },
  itineraryPlans: {
    create: async (data) => {
      console.log('[DB] 保存方案:', data.name)
      return data
    }
  }
}

// 模拟LLM调用
async function callLLM(prompt) {
  console.log('[LLM] 调用大模型...')
  // 模拟LLM响应延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 根据prompt内容返回模拟响应
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

// 模拟数据查询服务
const flightService = {
  query: async (params) => {
    console.log('[Tool] 查询航班数据:', params.arrCity)
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      { id: 'flight_001', flightNo: 'CA1234', depCity: '北京', arrCity: '青岛', depTime: '08:00', arrTime: '10:00', airline: '中国国航', price: 800, discount: 0.8, remainingSeats: 20 },
      { id: 'flight_002', flightNo: 'MU5678', depCity: '北京', arrCity: '青岛', depTime: '14:00', arrTime: '16:00', airline: '东方航空', price: 750, discount: 0.75, remainingSeats: 15 }
    ]
  }
}

const hotelService = {
  query: async (params) => {
    console.log('[Tool] 查询酒店数据:', params.city)
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      { id: 'hotel_001', name: '海景大酒店', starLevel: 5, address: '青岛市南区', price: 500, rating: 4.8, reviewCount: 1200, distanceFromCityCenter: 2.5, remainingRooms: 30 },
      { id: 'hotel_002', name: '栈桥假日酒店', starLevel: 4, address: '青岛市北区', price: 350, rating: 4.5, reviewCount: 800, distanceFromCityCenter: 1.2, remainingRooms: 20 }
    ]
  }
}

const attractionService = {
  query: async (params) => {
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

function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generatePlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function createMockWorkflowTaskService() {
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

class ItineraryWorkflow {
  constructor(request, taskService) {
    this.taskService = taskService || createMockWorkflowTaskService()
    this.task = {
      id: generateTaskId(),
      status: WorkflowStatus.PENDING,
      currentStep: WorkflowStep.INIT,
      requestId: request.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    this.context = { request }
    this.executionLogs = []
  }

  async execute() {
    const startTime = Date.now()

    try {
      console.log('\n========== 工作流开始执行 ==========')
      this.updateStatus(WorkflowStatus.RUNNING)
      this.task.startedAt = Date.now()

      await this.taskService.createTask({
        requestId: this.context.request.id,
        workflowType: 'itinerary_generation'
      })
      await this.persistTaskState()

      await this.stepValidateInput()
      await this.stepSaveRequest()
      await this.stepParseIntent()
      await this.stepQueryData()
      await this.stepGeneratePlans()
      await this.stepValidatePlans()
      await this.stepSavePlans()
      await this.stepComplete()

      this.task.durationMs = Date.now() - startTime
      await this.persistTaskState()
      console.log(`========== 工作流执行完成，耗时: ${this.task.durationMs}ms ==========\n`)

      return this.context.plans
    } catch (error) {
      this.task.durationMs = Date.now() - startTime
      await this.stepError(error)
      throw error
    }
  }

  // Step 1: 输入校验（代码控制）
  async stepValidateInput() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.VALIDATE_INPUT)
    console.log(`\n[Step 1/8] 输入校验 (代码控制)`)

    const { content } = this.context.request

    // 确定性校验规则
    if (!content || content.trim().length < 5) {
      throw new Error('行程描述至少需要5个字符')
    }

    if (content.length > 2000) {
      throw new Error('行程描述不能超过2000个字符')
    }

    console.log('✓ 输入校验通过')
    this.logStep(WorkflowStep.VALIDATE_INPUT, stepStart)
  }

  // Step 2: 保存请求（代码控制）
  async stepSaveRequest() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.SAVE_REQUEST)
    console.log(`\n[Step 2/8] 保存请求 (代码控制)`)

    await mockDB.itineraryRequests.create({
      id: this.context.request.id,
      content: this.context.request.content,
      imageUrl: this.context.request.imageUrl,
      status: 'processing',
      createdAt: new Date()
    })

    console.log('✓ 请求已保存到数据库')
    this.logStep(WorkflowStep.SAVE_REQUEST, stepStart)
  }

  // Step 3: AI解析意图（LLM控制）
  async stepParseIntent() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.PARSE_INTENT)
    console.log(`\n[Step 3/8] AI解析意图 (LLM控制)`)

    // 模拟LLM解析结果
    this.context.parsedIntent = {
      destination: '青岛',
      days: 3,
      budget: 'medium',
      travelers: { adults: 2, children: 1 },
      preferences: ['亲子', '海滩', '美食']
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('✓ 意图解析结果:', JSON.stringify(this.context.parsedIntent, null, 2))
    this.logStep(WorkflowStep.PARSE_INTENT, stepStart)
  }

  // Step 4: 查询基础数据（Tool Calling）
  async stepQueryData() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.QUERY_DATA)
    console.log(`\n[Step 4/8] 查询基础数据 (Tool Calling)`)

    const { destination } = this.context.parsedIntent

    // 并行查询多个数据源
    const [flights, hotels, attractions] = await Promise.all([
      flightService.query({ arrCity: destination }),
      hotelService.query({ city: destination }),
      attractionService.query({ city: destination })
    ])

    this.context.flights = flights
    this.context.hotels = hotels
    this.context.attractions = attractions

    console.log(`✓ 查询完成: ${flights.length}个航班, ${hotels.length}个酒店, ${attractions.length}个景点`)
    this.logStep(WorkflowStep.QUERY_DATA, stepStart)
  }

  // Step 5: AI生成方案（LLM控制）
  async stepGeneratePlans() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.GENERATE_PLANS)
    console.log(`\n[Step 5/8] AI生成方案 (LLM控制)`)

    const { parsedIntent, flights, hotels, attractions } = this.context

    // 模拟LLM生成结果
    const result = {
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
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // 转换并补充ID
    this.context.plans = result.plans.map((plan) => ({
      ...plan,
      id: generatePlanId(),
      requestId: this.context.request.id,
      createTime: Date.now()
    }))

    console.log(`✓ 生成完成: ${this.context.plans.length}套方案`)
    console.log('  -', this.context.plans[0].name, `(¥${this.context.plans[0].totalCost})`)
    console.log('  -', this.context.plans[1].name, `(¥${this.context.plans[1].totalCost})`)
    this.logStep(WorkflowStep.GENERATE_PLANS, stepStart)
  }

  // Step 6: 校验方案（代码控制）
  async stepValidatePlans() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.VALIDATE_PLANS)
    console.log(`\n[Step 6/8] 校验方案完整性 (代码控制)`)

    const { plans, parsedIntent } = this.context

    if (!plans || plans.length === 0) {
      throw new Error('未生成任何行程方案')
    }

    for (const plan of plans) {
      // 校验必要字段
      if (!plan.name || !plan.description) {
        throw new Error('方案缺少名称或描述')
      }

      // 校验天数匹配
      if (plan.totalDays !== parsedIntent.days) {
        throw new Error(`方案天数不匹配：期望${parsedIntent.days}天，实际${plan.totalDays}天`)
      }

      // 校验成本为正数
      if (plan.totalCost <= 0) {
        throw new Error('方案总成本必须大于0')
      }

      // 校验每天有计划
      if (!plan.days || plan.days.length === 0) {
        throw new Error('方案缺少每日行程')
      }
    }

    console.log('✓ 方案校验通过')
    this.logStep(WorkflowStep.VALIDATE_PLANS, stepStart)
  }

  // Step 7: 保存方案（代码控制）
  async stepSavePlans() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.SAVE_PLANS)
    console.log(`\n[Step 7/8] 保存方案到数据库 (代码控制)`)

    for (const plan of this.context.plans) {
      await mockDB.itineraryPlans.create({
        ...plan,
        requestId: this.context.request.id,
        createdAt: new Date()
      })
    }

    console.log(`✓ 已保存${this.context.plans.length}套方案到数据库`)
    this.logStep(WorkflowStep.SAVE_PLANS, stepStart)
  }

  // Step 8: 完成
  async stepComplete() {
    const stepStart = Date.now()
    this.updateStep(WorkflowStep.COMPLETE)
    console.log(`\n[Step 8/8] 完成工作流 (代码控制)`)

    this.updateStatus(WorkflowStatus.COMPLETED)
    this.task.completedAt = Date.now()

    await mockDB.itineraryRequests.update({
      where: { id: this.context.request.id },
      data: { status: 'completed', completedAt: new Date() }
    })

    console.log('✓ 工作流完成，请求状态已更新')
    this.logStep(WorkflowStep.COMPLETE, stepStart)

    // 打印执行日志
    console.log('\n========== 执行日志 ==========')
    this.executionLogs.forEach(log => {
      console.log(`${log.step}: ${log.durationMs}ms`)
    })
  }

  // 错误处理
  async stepError(error) {
    this.updateStep(WorkflowStep.ERROR)
    this.updateStatus(WorkflowStatus.FAILED)
    this.context.error = error.message
    this.task.errorMsg = error.message
    this.task.errorStep = this.task.currentStep

    console.error(`\n✗ 工作流执行失败: ${error.message}`)
    console.error(`  失败步骤: ${this.task.currentStep}`)

    await this.persistTaskState()

    await mockDB.itineraryRequests.update({
      where: { id: this.context.request.id },
      data: { status: 'failed', errorMsg: error.message }
    })
  }

  updateStep(step) {
    this.task.currentStep = step
    this.task.updatedAt = Date.now()
  }

  updateStatus(status) {
    this.task.status = status
    this.task.updatedAt = Date.now()
  }

  async logStep(step, startTime) {
    const entry = {
      step,
      startedAt: startTime,
      completedAt: Date.now(),
      durationMs: Date.now() - startTime
    }
    this.executionLogs.push(entry)
    await this.taskService.appendLog(this.task.id, entry)
    await this.persistTaskState()
  }

  async persistTaskState() {
    await this.taskService.updateTask(this.task.id, {
      status: this.task.status,
      currentStep: this.task.currentStep,
      errorMsg: this.task.errorMsg || null,
      errorStep: this.task.errorStep || null,
      startedAt: this.task.startedAt ? new Date(this.task.startedAt).toISOString() : undefined,
      completedAt: this.task.completedAt ? new Date(this.task.completedAt).toISOString() : undefined,
      durationMs: this.task.durationMs
    })
  }

  getTask() {
    return this.task
  }

  getExecutionLogs() {
    return this.executionLogs
  }
}

// 导出工作流运行函数
async function runItineraryWorkflow(request, taskService) {
  const workflow = new ItineraryWorkflow(request, taskService)
  const plans = await workflow.execute()
  return {
    plans,
    task: workflow.getTask(),
    logs: workflow.getExecutionLogs()
  }
}

// 演示函数
async function demo() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║     Trailmate 伴旅 - 智能行程规划工作流演示               ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // 模拟用户请求
  const request = {
    id: `req_${Date.now()}`,
    userId: 'user_demo_001',
    content: '我想带家人去青岛玩3天，预算中等，喜欢海滩和美食',
    createTime: Date.now()
  }

  console.log('📋 用户请求:')
  console.log(`   ${request.content}\n`)

  try {
    // 执行工作流
    const { plans, task, logs } = await runItineraryWorkflow(request)

    // 展示结果
    console.log('\n📊 工作流执行结果:')
    console.log(`   任务ID: ${task.id}`)
    console.log(`   执行状态: ${task.status}`)
    console.log(`   总耗时: ${task.durationMs}ms\n`)

    console.log('📈 各步骤耗时:')
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.step}: ${log.durationMs}ms`)
    })

    console.log('\n🎯 生成的行程方案:')
    plans.forEach((plan, index) => {
      console.log(`\n   方案 ${index + 1}: ${plan.name}`)
      console.log(`   描述: ${plan.description}`)
      console.log(`   标签: ${plan.tags.join(', ')}`)
      console.log(`   天数: ${plan.totalDays}天`)
      console.log(`   总费用: ¥${plan.totalCost}`)
      console.log(`   每日行程:`)
      plan.days.forEach(day => {
        console.log(`     第${day.day}天: ${day.items.length}个项目`)
        day.items.forEach(item => {
          console.log(`       - ${item.type}: ${item.name} (${item.startTime}-${item.endTime}) ¥${item.cost}`)
        })
      })
    })

    console.log('\n✅ 工作流演示完成!')

  } catch (error) {
    console.error('\n❌ 工作流执行失败:', error.message)
  }
}

// 运行演示
demo()
