import { describe, test, expect, beforeEach } from 'vitest'
import {
  createTeamRequest,
  getTeamRequestsByUser,
  getPendingTeamRequests,
  updateTeamRequestStatus,
  getTeamRequestById,
} from '../src/services/team-request.service'

// 注意：teamRequests 数组是模块级单例，测试间会累积
// 通过验证返回数据结构来保证测试隔离

describe('createTeamRequest', () => {
  test('创建组队请求返回正确结构', () => {
    const req = createTeamRequest({
      fromUserId: 'user_a',
      toUserId: 'user_b',
      destination: '云南大理',
      date: '2026-05-15',
      message: '一起旅行吧',
      splitType: 'aa',
    })

    expect(req.id).toMatch(/^team_/)
    expect(req.fromUserId).toBe('user_a')
    expect(req.toUserId).toBe('user_b')
    expect(req.destination).toBe('云南大理')
    expect(req.status).toBe('pending')
    expect(req.splitType).toBe('aa')
    expect(req.createdAt).toBeGreaterThan(0)
  })

  test('创建的请求可通过ID查询', () => {
    const req = createTeamRequest({
      fromUserId: 'user_c',
      toUserId: 'user_d',
      destination: '西藏拉萨',
      date: '2026-06-01',
      message: '求组队',
      splitType: 'host',
    })

    const found = getTeamRequestById(req.id)
    expect(found).toBeDefined()
    expect(found!.id).toBe(req.id)
  })
})

describe('getTeamRequestsByUser', () => {
  test('查询发起方用户的请求', () => {
    const req = createTeamRequest({
      fromUserId: 'sender_x',
      toUserId: 'receiver_x',
      destination: '北京',
      date: '2026-07-01',
      message: 'hi',
      splitType: 'custom',
    })

    const results = getTeamRequestsByUser('sender_x')
    expect(results.some(r => r.id === req.id)).toBe(true)
  })

  test('查询接收方用户的请求', () => {
    const req = createTeamRequest({
      fromUserId: 'sender_y',
      toUserId: 'receiver_y',
      destination: '上海',
      date: '2026-08-01',
      message: 'hello',
      splitType: 'aa',
    })

    const results = getTeamRequestsByUser('receiver_y')
    expect(results.some(r => r.id === req.id)).toBe(true)
  })

  test('不相关用户查询为空', () => {
    const results = getTeamRequestsByUser('nonexistent_user')
    expect(results.length).toBe(0)
  })
})

describe('getPendingTeamRequests', () => {
  test('查询待处理的请求', () => {
    const req = createTeamRequest({
      fromUserId: 'sender_z',
      toUserId: 'receiver_z',
      destination: '杭州',
      date: '2026-09-01',
      message: 'pending test',
      splitType: 'aa',
    })

    const pending = getPendingTeamRequests('receiver_z')
    expect(pending.some(r => r.id === req.id)).toBe(true)
  })

  test('已接受的请求不出现在待处理列表中', () => {
    const req = createTeamRequest({
      fromUserId: 'sender_w',
      toUserId: 'receiver_w',
      destination: '成都',
      date: '2026-10-01',
      message: 'accept test',
      splitType: 'host',
    })

    updateTeamRequestStatus(req.id, 'accepted')
    const pending = getPendingTeamRequests('receiver_w')
    expect(pending.some(r => r.id === req.id)).toBe(false)
  })
})

describe('updateTeamRequestStatus', () => {
  test('接受组队请求', () => {
    const req = createTeamRequest({
      fromUserId: 'user_e',
      toUserId: 'user_f',
      destination: '西安',
      date: '2026-11-01',
      message: 'accept me',
      splitType: 'aa',
    })

    const updated = updateTeamRequestStatus(req.id, 'accepted')
    expect(updated).toBeDefined()
    expect(updated!.status).toBe('accepted')
  })

  test('拒绝组队请求', () => {
    const req = createTeamRequest({
      fromUserId: 'user_g',
      toUserId: 'user_h',
      destination: '重庆',
      date: '2026-12-01',
      message: 'reject me',
      splitType: 'custom',
    })

    const updated = updateTeamRequestStatus(req.id, 'rejected')
    expect(updated).toBeDefined()
    expect(updated!.status).toBe('rejected')
  })

  test('更新不存在的请求返回undefined', () => {
    const updated = updateTeamRequestStatus('nonexistent_id', 'accepted')
    expect(updated).toBeUndefined()
  })
})

describe('getTeamRequestById', () => {
  test('不存在的ID返回undefined', () => {
    const result = getTeamRequestById('fake_id_12345')
    expect(result).toBeUndefined()
  })
})
