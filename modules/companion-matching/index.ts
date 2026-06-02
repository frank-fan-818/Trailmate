import type { IPlugin, ICore } from '@trailmate/core'
import type { CompanionProfile, UserProfile, CompanionFilters, MatchResult, TeamRequest, RealNameVerification, CompanionProfileUpdate } from './src/types/index'
export type { CompanionProfile, UserProfile, CompanionFilters, MatchResult, TeamRequest, RealNameVerification, CompanionProfileUpdate } from './src/types/index'
import { calculateMatchScore, filterCompanions, getMockCompanions, getCompanionById } from './src/services/matching.service'
import { createTeamRequest, getTeamRequestsByUser, getPendingTeamRequests, updateTeamRequestStatus, getTeamRequestById } from './src/services/team-request.service'
import { runCompanionMatchingWorkflow, type CompanionMatchingRequest } from './src/workflow/companion-matching-workflow'

export default class CompanionMatchingModule implements IPlugin {
  pluginId = 'companion-matching'
  pluginName = '社交匹配模块'
  version = '1.0.0'
  dependencies = []

  protected core: ICore | null = null

  onInstall(core: ICore) {
    this.core = core

    core.service.register('companion.getCompanions', () => getMockCompanions())
    core.service.register('companion.getCompanionById', (id: string) => getCompanionById(id))
    core.service.register('companion.calculateMatch', (companion: CompanionProfile, userProfile: UserProfile) =>
      calculateMatchScore(companion, userProfile)
    )
    core.service.register('companion.filterCompanions', (filters: CompanionFilters, userProfile: UserProfile) =>
      filterCompanions(getMockCompanions(), filters, userProfile)
    )
    core.service.register('companion.filterCompanionsFromData', (companions: CompanionProfile[], filters: CompanionFilters, userProfile: UserProfile) =>
      filterCompanions(companions, filters, userProfile)
    )
    core.service.register('companion.createTeamRequest', (params: {
      fromUserId: string
      toUserId: string
      destination: string
      date: string
      message: string
      splitType: 'aa' | 'host' | 'custom'
    }) => createTeamRequest(params))
    core.service.register('companion.getTeamRequests', (userId: string) => getTeamRequestsByUser(userId))
    core.service.register('companion.getPendingTeamRequests', (userId: string) => getPendingTeamRequests(userId))
    core.service.register('companion.updateTeamRequestStatus', (requestId: string, status: 'accepted' | 'rejected') =>
      updateTeamRequestStatus(requestId, status)
    )
    core.service.register('companion.getTeamRequestById', (requestId: string) => getTeamRequestById(requestId))
    core.service.register('companion.runWorkflow', (request: CompanionMatchingRequest) =>
      runCompanionMatchingWorkflow(request)
    )
  }

  onMount(core: ICore) {
    console.log('✅ 社交匹配模块启动成功')
  }

  onUnmount(core: ICore) {
    console.log('🛑 社交匹配模块已卸载')
  }
}
