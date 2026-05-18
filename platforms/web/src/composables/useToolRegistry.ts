export interface ToolDef {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

export const CONCIERGE_TOOLS: ToolDef[] = [
  // ---- Perception ----
  {
    type: 'function',
    function: {
      name: 'perception_getCurrentLocation',
      description: '获取用户当前模拟或真实位置（城市、地址、坐标）',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'perception_getTimeline',
      description: '获取指定行程计划的时间线（所有日程节点）',
      parameters: {
        type: 'object',
        properties: { planId: { type: 'string', description: '行程计划ID' } },
        required: ['planId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'perception_getNotifications',
      description: '获取用户所有通知消息，可按计划或未读状态过滤',
      parameters: {
        type: 'object',
        properties: {
          planId: { type: 'string', description: '可选：按计划ID过滤' },
          unreadOnly: { type: 'boolean', description: '可选：仅返回未读通知' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'perception_getAllRules',
      description: '获取所有感知规则（时间提醒、位置推荐、天气预警等）',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  // ---- Companion ----
  {
    type: 'function',
    function: {
      name: 'companion_filterCompanions',
      description: '搜索和筛选旅行同伴，可按目的地、预算、性格等条件过滤',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词（目的地或姓名）' },
          budget: { type: 'string', enum: ['budget', 'medium', 'luxury'], description: '预算级别' },
          personalityType: { type: 'string', enum: ['planner', 'spontaneous'], description: '性格类型' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'companion_calculateMatch',
      description: '计算当前用户与指定同伴的匹配分数',
      parameters: {
        type: 'object',
        properties: { companionId: { type: 'string', description: '同伴ID' } },
        required: ['companionId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'companion_createTeamRequest',
      description: '创建组队请求，邀请同伴一起旅行',
      parameters: {
        type: 'object',
        properties: {
          toUserId: { type: 'string', description: '目标用户ID' },
          destination: { type: 'string', description: '旅行目的地' },
          date: { type: 'string', description: '出发日期' },
          message: { type: 'string', description: '邀请消息' },
          splitType: { type: 'string', enum: ['aa', 'host', 'custom'], description: '费用分摊方式' }
        },
        required: ['toUserId', 'destination', 'date', 'message', 'splitType']
      }
    }
  },
  // ---- Itinerary ----
  {
    type: 'function',
    function: {
      name: 'itinerary_generate',
      description: '生成完整的旅行行程方案（含航班、酒店、景点）',
      parameters: {
        type: 'object',
        properties: { content: { type: 'string', description: '用自然语言描述你想要的行程' } },
        required: ['content']
      }
    }
  }
]

/** 用户可读的工具名称映射 */
export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  perception_getCurrentLocation: '获取当前位置',
  perception_getTimeline: '获取行程时间线',
  perception_getNotifications: '获取通知列表',
  perception_getAllRules: '获取规则列表',
  companion_filterCompanions: '搜索旅伴',
  companion_calculateMatch: '计算匹配分数',
  companion_createTeamRequest: '创建组队请求',
  itinerary_generate: '生成行程方案'
}
