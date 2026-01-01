import { EventEmitter } from 'events';
import { DomainEvent, EventHandler, EventTypes } from './event-types';

// In-memory event bus for single instance
export class EventBus extends EventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: DomainEvent[] = [];
  private maxHistorySize: number;

  constructor(options: { maxHistorySize?: number } = {}) {
    super();
    this.maxHistorySize = options.maxHistorySize || 1000;
    this.setMaxListeners(100);
  }

  // Subscribe to event type
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    // Also support wildcard subscriptions
    this.emit('subscribed', { eventType, handler });
  }

  // Unsubscribe from event type
  unsubscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    this.handlers.get(eventType)?.delete(handler as EventHandler);
  }

  // Publish event synchronously
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    // Store in history
    this.addToHistory(event);

    const handlers = this.handlers.get(event.eventType) || [];
    const promises: Promise<void>[] = [];

    for (const handler of handlers) {
      try {
        const result = handler.handle(event);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.eventType}:`, error);
        this.emit('handlerError', { event, error });
      }
    }

    await Promise.all(promises);

    // Emit for external listeners
    this.emit(event.eventType, event);
  }

  // Publish event asynchronously with queue
  async publishAsync<T extends DomainEvent>(event: T): Promise<void> {
    // Queue for background processing
    setImmediate(() => {
      this.publish(event).catch(error => {
        console.error('Async event publish failed:', error);
      });
    });
  }

  // Publish to specific channel (for pub/sub with external brokers)
  async publishToChannel<T extends DomainEvent>(
    channel: string,
    event: T
  ): Promise<void> {
    // Override in subclass for Redis/SQS/etc.
    this.publish(event);
  }

  // Request-response pattern for events
  async request<T extends DomainEvent, R extends DomainEvent>(
    event: T,
    timeoutMs: number = 5000
  ): Promise<R> {
    const correlationId = event.correlationId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Event timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const responseHandler = (response: R) => {
        if (response.correlationId === correlationId) {
          clearTimeout(timeout);
          this.off(event.eventType, responseHandler as any);
          resolve(response);
        }
      };

      this.on(event.eventType, responseHandler as any);
      this.publish(event);
    });
  }

  // Get event history
  getHistory(filter?: { eventType?: string; limit?: number }): DomainEvent[] {
    let history = [...this.eventHistory];

    if (filter?.eventType) {
      history = history.filter(e => e.eventType === filter.eventType);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  // Private helpers
  private addToHistory(event: DomainEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();
