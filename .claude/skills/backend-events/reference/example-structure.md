# Backend Events Module Structure Reference

```
src/
  domain/
    events/
      event-types.ts          # Event interfaces and types
      event.ts                # Base event class

  infrastructure/
    events/
      event-bus.ts            # In-memory event bus
      redis-event-bus.ts      # Distributed event bus (Redis)
      kafka-event-bus.ts      # Kafka event bus (optional)
      handlers/
        user.handlers.ts      # User event handlers
        todo.handlers.ts      # Todo event handlers

  application/
    services/
      event-publisher.ts      # Event publishing service
```

## Event Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Service    │───▶│   EventBus   │───▶│  Handlers    │
│  (Producer)  │    │   (Pub/Sub)  │    │ (Consumers)  │
└──────────────┘    └──────────────┘    └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Storage    │
                   │  (Optional)  │
                   └──────────────┘
```

## Event Publishing

```typescript
// Create and publish an event
const event = createEvent(
  EventTypes.TODO_CREATED,
  { title: 'Buy milk', priority: 'high' },
  { aggregateId: todoId, aggregateType: 'Todo' }
);

await eventBus.publish(event);
```

## Event Subscribing

```typescript
// Subscribe to event type
eventBus.subscribe(EventTypes.TODO_CREATED, {
  eventType: EventTypes.TODO_CREATED,
  handle: async (event) => {
    console.log('Todo created:', event.payload.data);
    // Send notification, update cache, etc.
  },
});
```

## Dead Letter Queue Pattern

```typescript
// For failed events
class DeadLetterQueue {
  private queue: DomainEvent[] = [];

  async add(event: DomainEvent, error: Error): Promise<void> {
    this.queue.push({
      ...event,
      metadata: {
        ...event.metadata,
        dlq: {
          originalError: error.message,
          failedAt: new Date().toISOString(),
          retryCount: (event.metadata?.retryCount as number) || 0,
        },
      },
    });
  }

  async retry(event: DomainEvent): Promise<void> {
    await eventBus.publish(event);
  }
}
```

## Event Sourcing (Optional)

```typescript
// Store events as source of truth
class EventStore {
  async save(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await db.events.insert({
        id: event.eventId,
        type: event.eventType,
        data: event.payload.data,
        timestamp: new Date(event.timestamp),
        aggregateId: event.payload.aggregateId,
      });
    }
  }

  async load(aggregateId: string): Promise<DomainEvent[]> {
    return db.events.find({ aggregateId }).orderBy('timestamp');
  }

  async replay(aggregateId: string): Promise<unknown> {
    const events = await this.load(aggregateId);
    return events.reduce((state, event) => {
      return applyEvent(state, event);
    }, null);
  }
}
```

## Best Practices

1. **Idempotency**: Handle duplicate events safely
2. **Ordering**: Use sequence numbers for ordered events
3. **Retry**: Implement exponential backoff for failed events
4. **DLQ**: Dead letter queue for unprocessable events
5. **Monitoring**: Track event processing metrics
6. **Schema Evolution**: Support event schema changes
