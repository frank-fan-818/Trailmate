export enum GlobalEvent {
  // 行程规划类事件
  PLAN_REQUEST = 'plan.request',
  PLAN_GENERATED = 'plan.generated',
  PLAN_UPDATED = 'plan.updated',
  FLIGHT_QUERY_REQUEST = 'flight.query.request',
  FLIGHT_QUERY_RESULT = 'flight.query.result',
  HOTEL_QUERY_REQUEST = 'hotel.query.request',
  HOTEL_QUERY_RESULT = 'hotel.query.result',
  EXCHANGE_QUERY_REQUEST = 'exchange.query.request',
  EXCHANGE_QUERY_RESULT = 'exchange.query.result',

  // 情境感知类事件
  LOCATION_CHANGED = 'perception.location_changed',
  NOTIFICATION_PUSHED = 'perception.notification_pushed',
  NOTIFICATION_UPDATED = 'perception.notification_updated',
  TIMELINE_UPDATED = 'perception.timeline_updated',
  ALERT_TRIGGERED = 'perception.alert_triggered',

  // 社交类事件
  SOCIAL_MATCH_REQUEST = 'social.match.request',
  SOCIAL_MATCH_RESULT = 'social.match.result',
  SOCIAL_CARPOOL_PUBLISH = 'social.carpool.publish',
  SOCIAL_DINE_PUBLISH = 'social.dine.publish'
}

export type EventCallback<T = any> = (data: T) => void