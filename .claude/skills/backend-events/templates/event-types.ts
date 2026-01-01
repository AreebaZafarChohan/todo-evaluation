// Event types and interfaces
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: ISO8601Date;
  correlationId: string;
  source: string;
  version: string;
  metadata?: Record<string, unknown>;
}

export interface DomainEvent extends BaseEvent {
  payload: {
    aggregateId: string;
    aggregateType: string;
    data: Record<string, unknown>;
  };
}

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void> | void;
  eventType: string;
  priority?: number;
}

// Event types enumeration
export enum EventTypes {
  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',

  // Todo events
  TODO_CREATED = 'todo.created',
  TODO_UPDATED = 'todo.updated',
  TODO_DELETED = 'todo.deleted',
  TODO_COMPLETED = 'todo.completed',
  TODO_ASSIGNED = 'todo.assigned',

  // System events
  SYSTEM_HEALTH = 'system.health',
  SYSTEM_ERROR = 'system.error',
}

// Event factory
export function createEvent<T extends Record<string, unknown>>(
  eventType: string,
  payload: T,
  options: {
    aggregateId?: string;
    aggregateType?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  } = {}
): DomainEvent {
  return {
    eventId: generateEventId(),
    eventType,
    timestamp: new Date().toISOString(),
    correlationId: options.aggregateId || generateEventId(),
    source: options.source || 'app',
    version: '1.0',
    metadata: options.metadata,
    payload: {
      aggregateId: options.aggregateId || '',
      aggregateType: options.aggregateType || '',
      data: payload,
    },
  };
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
