import { describe, it, expect } from 'vitest'
import { ItineraryWorkflow, WorkflowStep, WorkflowStatus, runItineraryWorkflow } from '../index'
import type { ItineraryRequest } from '../../types'

describe('ItineraryWorkflow', () => {
  const mockRequest: ItineraryRequest = {
    id: 'req_test_001',
    userId: 'user_001',
    content: '我想带家人去青岛玩3天，预算中等，喜欢海滩和美食',
    createTime: Date.now()
  }

  it('应该成功执行完整工作流', async () => {
    const workflow = new ItineraryWorkflow(mockRequest)
    const plans = await workflow.execute()
    const task = workflow.getTask()

    // 验证工作流完成
    expect(task.status).toBe(WorkflowStatus.COMPLETED)
    expect(task.currentStep).toBe(WorkflowStep.COMPLETE)
    expect(plans).toHaveLength(2)
    
    // 验证方案结构
    expect(plans[0]).toHaveProperty('name')
    expect(plans[0]).toHaveProperty('description')
    expect(plans[0]).toHaveProperty('totalDays')
    expect(plans[0]).toHaveProperty('totalCost')
    expect(plans[0]).toHaveProperty('days')
    
    // 验证方案内容
    expect(plans[0].totalDays).toBe(3)
    expect(plans[0].totalCost).toBeGreaterThan(0)
    expect(plans[0].days).toHaveLength(3)
  })

  it('应该记录执行日志', async () => {
    const workflow = new ItineraryWorkflow(mockRequest)
    await workflow.execute()
    const logs = workflow.getExecutionLogs()

    // 验证日志记录
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0]).toHaveProperty('step')
    expect(logs[0]).toHaveProperty('startedAt')
    expect(logs[0]).toHaveProperty('completedAt')
    expect(logs[0]).toHaveProperty('durationMs')
  })

  it('应该在输入校验失败时抛出错误', async () => {
    const invalidRequest: ItineraryRequest = {
      ...mockRequest,
      content: '短' // 少于5个字符
    }

    const workflow = new ItineraryWorkflow(invalidRequest)
    
    await expect(workflow.execute()).rejects.toThrow('行程描述至少需要5个字符')
    
    const task = workflow.getTask()
    expect(task.status).toBe(WorkflowStatus.FAILED)
    expect(task.errorStep).toBe(WorkflowStep.VALIDATE_INPUT)
  })

  it('应该通过便捷函数运行工作流', async () => {
    const result = await runItineraryWorkflow(mockRequest)

    expect(result.plans).toHaveLength(2)
    expect(result.task.status).toBe(WorkflowStatus.COMPLETED)
    expect(result.logs.length).toBeGreaterThan(0)
  })
})
