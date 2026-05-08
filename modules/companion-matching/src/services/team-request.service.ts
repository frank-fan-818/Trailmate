import type { TeamRequest } from '../types/index'

const teamRequests: TeamRequest[] = []

export function createTeamRequest(params: {
  fromUserId: string
  toUserId: string
  destination: string
  date: string
  message: string
  splitType: 'aa' | 'host' | 'custom'
}): TeamRequest {
  const request: TeamRequest = {
    id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromUserId: params.fromUserId,
    toUserId: params.toUserId,
    destination: params.destination,
    date: params.date,
    message: params.message,
    splitType: params.splitType,
    status: 'pending',
    createdAt: Date.now()
  }

  teamRequests.push(request)
  console.log(`[TeamRequest] 创建组队请求: ${request.id} from ${params.fromUserId} to ${params.toUserId}`)
  return request
}

export function getTeamRequestsByUser(userId: string): TeamRequest[] {
  return teamRequests.filter(r => r.fromUserId === userId || r.toUserId === userId)
}

export function getPendingTeamRequests(userId: string): TeamRequest[] {
  return teamRequests.filter(r => r.toUserId === userId && r.status === 'pending')
}

export function updateTeamRequestStatus(
  requestId: string,
  status: 'accepted' | 'rejected'
): TeamRequest | undefined {
  const request = teamRequests.find(r => r.id === requestId)
  if (request) {
    request.status = status
    console.log(`[TeamRequest] 更新组队请求状态: ${requestId} -> ${status}`)
  }
  return request
}

export function getTeamRequestById(requestId: string): TeamRequest | undefined {
  return teamRequests.find(r => r.id === requestId)
}
