// Redis-based event bus for distributed systems
import { EventBus } from './event-bus';
import { DomainEvent, EventHandler } from './event-types';
import { createClient, RedisClientType } from 'redis';

export interface RedisEventBusOptions {
  url: string;
  channelPrefix: string;
  consumerGroup?: string;
}

export class RedisEventBus extends EventBus {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private channelPrefix: string;
  private consumerGroup?: string;
  private isConnected: boolean = false;

  constructor(options: RedisEventBusOptions) {
    super();
    this.channelPrefix = options.channelPrefix;
    this.consumerGroup = options.consumerGroup;

    this.publisher = createClient({ url: options.url });
    this.subscriber = createClient({ url: options.url });

    this.setupConnection();
  }

  private async setupConnection(): Promise<void> {
    this.publisher.on('error', (err) => console.error('Redis publisher error:', err));
    this.subscriber.on('error', (err) => console.error('Redis subscriber error:', err));

    await Promise.all([
      this.publisher.connect(),
      this.subscriber.connect(),
    ]);

    this.isConnected = true;
    console.log('Redis event bus connected');

    // Create consumer group if specified
    if (this.consumerGroup) {
      await this.publisher.xGroupCreate(
        `${this.channelPrefix}:events`,
        this.consumerGroup,
        { MKSTREAM: true }
      );
    }

    // Subscribe to channels
    await this.subscriber.subscribe(
      `${this.channelPrefix}:*`,
      (message) => this.handleRedisMessage(message)
    );
  }

  private async handleRedisMessage(message: string): Promise<void> {
    try {
      const event: DomainEvent = JSON.parse(message);
      await super.publish(event);
    } catch (error) {
      console.error('Failed to parse Redis message:', error);
    }
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const channel = `${this.channelPrefix}:${event.eventType}`;
    const message = JSON.stringify(event);

    await this.publisher.publish(channel, message);

    // Also store in stream for persistence
    await this.publisher.xAdd(
      `${this.channelPrefix}:events`,
      '*',
      { event: message }
    );
  }

  async publishToChannel<T extends DomainEvent>(
    channel: string,
    event: T
  ): Promise<void> {
    const fullChannel = `${this.channelPrefix}:${channel}`;
    await this.publisher.publish(fullChannel, JSON.stringify(event));
  }

  // Consumer for processing events from stream
  async consume(
    consumerName: string,
    count: number = 10,
    blockMs: number = 5000
  ): Promise<void> {
    if (!this.consumerGroup) {
      throw new Error('Consumer group not configured');
    }

    while (this.isConnected) {
      const events = await this.publisher.xReadGroup(
        this.consumerGroup,
        consumerName,
        [{ key: `${this.channelPrefix}:events`, id: '>' }],
        { COUNT: count, BLOCK: blockMs }
      );

      if (events) {
        for (const stream of events) {
          for (const message of stream.messages) {
            try {
              const event: DomainEvent = JSON.parse(message.message.event);
              await super.publish(event);
              await this.publisher.xAck(
                `${this.channelPrefix}:events`,
                this.consumerGroup,
                message.id
              );
            } catch (error) {
              console.error('Failed to process event:', error);
            }
          }
        }
      }
    }
  }

  async close(): Promise<void> {
    this.isConnected = false;
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }
}
