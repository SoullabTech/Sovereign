/**
 * PubSub Manager for AIN Communication
 * Event-driven communication between elemental services
 */

import { EventEmitter } from "events";
import { SpiralogicEvent, TopicConfig, ElementalService } from "../types";

export class PubSubManager extends EventEmitter {
  private static instance: PubSubManager;
  private topics: Map<string, Topic> = new Map();
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private messageQueue: Map<string, QueuedMessage[]> = new Map();
  private metrics: PubSubMetrics = {
    messages_published: 0,
    messages_delivered: 0,
    active_subscribers: 0,
    topics_created: 0,
  };

  private constructor() {
    super();
    this.initializeCorePubSub();
  }

  static getInstance(): PubSubManager {
    if (!PubSubManager.instance) {
      PubSubManager.instance = new PubSubManager();
    }
    return PubSubManager.instance;
  }

  /**
   * Initialize core pub/sub infrastructure
   */
  private initializeCorePubSub(): void {
    // Create core elemental topics
    Object.values(ElementalService).forEach((element) => {
      this.createTopic(`${element}.channel`);
      this.createTopic(`${element}.private`);
      this.createTopic(`${element}.response`);
    });

    // Create system topics
    this.createTopic("system.events");
    this.createTopic("emergency.broadcast");
    this.createTopic("elemental.council");
    this.createTopic("quantum.coherence");
    this.createTopic("collective.wisdom");

    // Setup message processing
    this.startMessageProcessor();
  }

  /**
   * Create a new topic
   */
  createTopic(name: string, config?: Partial<TopicConfig>): void {
    if (this.topics.has(name)) {
      console.warn(`Topic ${name} already exists`);
      return;
    }

    const defaultConfig: TopicConfig = {
      name,
      retention_policy: "short",
      max_subscribers: 1000,
      delivery_guarantee: "at_least_once",
    };

    const finalConfig = { ...defaultConfig, ...config };

    const topic = new Topic(finalConfig);
    this.topics.set(name, topic);
    this.subscribers.set(name, new Set());
    this.messageQueue.set(name, []);

    this.metrics.topics_created++;

    this.emit("topic.created", { topic: name, config: finalConfig });
  }

  /**
   * Subscribe to a topic
   */
  subscribe(
    topic: string,
    callback: (event: SpiralogicEvent) => Promise<void>,
    options?: SubscriptionOptions,
  ): Subscription {
    const topicObj = this.topics.get(topic);
    if (!topicObj) {
      throw new Error(`Topic ${topic} does not exist`);
    }

    const subscriber: Subscriber = {
      id: this.generateSubscriberId(),
      callback,
      topic,
      created_at: Date.now(),
      options: options || {},
    };

    const subscribers = this.subscribers.get(topic)!;

    // Check subscriber limit
    if (subscribers.size >= topicObj.config.max_subscribers) {
      throw new Error(`Topic ${topic} has reached maximum subscribers`);
    }

    subscribers.add(subscriber);
    this.metrics.active_subscribers++;

    const subscription: Subscription = {
      id: subscriber.id,
      topic,
      unsubscribe: () => this.unsubscribe(topic, subscriber.id),
    };

    this.emit("subscriber.added", { topic, subscriber: subscriber.id });

    return subscription;
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string, subscriberId: string): boolean {
    const subscribers = this.subscribers.get(topic);
    if (!subscribers) return false;

    const subscriber = Array.from(subscribers).find(
      (s) => s.id === subscriberId,
    );
    if (!subscriber) return false;

    subscribers.delete(subscriber);
    this.metrics.active_subscribers--;

    this.emit("subscriber.removed", { topic, subscriber: subscriberId });

    return true;
  }

  /**
   * Publish message to topic
   */
  async publish(topic: string, event: SpiralogicEvent): Promise<PublishResult> {
    const topicObj = this.topics.get(topic);
    if (!topicObj) {
      throw new Error(`Topic ${topic} does not exist`);
    }

    const subscribers = this.subscribers.get(topic)!;

    // Add message to queue
    const queuedMessage: QueuedMessage = {
      id: this.generateMessageId(),
      event,
      topic,
      published_at: Date.now(),
      delivery_attempts: 0,
    };

    const queue = this.messageQueue.get(topic)!;
    queue.push(queuedMessage);

    // Apply retention policy
    this.applyRetentionPolicy(topic, queue);

    this.metrics.messages_published++;

    // Immediate delivery for real-time subscribers
    const deliveryResults = await this.deliverToSubscribers(
      topic,
      event,
      Array.from(subscribers),
    );

    const result: PublishResult = {
      message_id: queuedMessage.id,
      topic,
      subscribers_notified: deliveryResults.successful.length,
      failed_deliveries: deliveryResults.failed,
      delivery_guarantee: topicObj.config.delivery_guarantee,
    };

    this.emit("message.published", result);

    return result;
  }

  /**
   * Deliver message to subscribers
   */
  private async deliverToSubscribers(
    topic: string,
    event: SpiralogicEvent,
    subscribers: Subscriber[],
  ): Promise<DeliveryResult> {
    const successful: string[] = [];
    const failed: DeliveryFailure[] = [];

    await Promise.allSettled(
      subscribers.map(async (subscriber) => {
        try {
          // Apply subscriber filters if any
          if (this.shouldDeliver(event, subscriber)) {
            await subscriber.callback(event);
            successful.push(subscriber.id);
            this.metrics.messages_delivered++;
          }
        } catch (error) {
          failed.push({
            subscriber_id: subscriber.id,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
          });
        }
      }),
    );

    return { successful, failed };
  }

  /**
   * Check if message should be delivered to subscriber
   */
  private shouldDeliver(
    event: SpiralogicEvent,
    subscriber: Subscriber,
  ): boolean {
    const options = subscriber.options;

    // Check elemental filters
    if (options.elemental_filter) {
      const signature = event.payload.elemental_signature;
      const requiredElement = options.elemental_filter;

      if (signature[requiredElement] < (options.elemental_threshold || 0.5)) {
        return false;
      }
    }

    // Check priority filter
    if (options.priority_filter) {
      if (event.routing.priority !== options.priority_filter) {
        return false;
      }
    }

    // Check content filter
    if (options.content_filter) {
      const content = JSON.stringify(event.payload.content).toLowerCase();
      if (!content.includes(options.content_filter.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply retention policy to message queue
   */
  private applyRetentionPolicy(topic: string, queue: QueuedMessage[]): void {
    const topicObj = this.topics.get(topic)!;
    const policy = topicObj.config.retention_policy;

    const now = Date.now();
    let retentionTime: number;

    switch (policy) {
      case "none":
        // Remove immediately after delivery
        queue.splice(0, queue.length);
        return;
      case "short":
        retentionTime = 5 * 60 * 1000; // 5 minutes
        break;
      case "long":
        retentionTime = 24 * 60 * 60 * 1000; // 24 hours
        break;
      default:
        retentionTime = 5 * 60 * 1000;
    }

    // Remove old messages
    const cutoffTime = now - retentionTime;
    const filteredQueue = queue.filter((msg) => msg.published_at > cutoffTime);

    queue.splice(0, queue.length, ...filteredQueue);
  }

  /**
   * Start background message processor
   */
  private startMessageProcessor(): void {
    setInterval(() => {
      this.processQueuedMessages();
    }, 1000); // Process every second
  }

  /**
   * Process queued messages for guaranteed delivery
   */
  private async processQueuedMessages(): Promise<void> {
    for (const [topic, queue] of this.messageQueue.entries()) {
      const topicObj = this.topics.get(topic)!;

      if (topicObj.config.delivery_guarantee === "at_least_once") {
        const pendingMessages = queue.filter(
          (msg) =>
            msg.delivery_attempts < 3 && Date.now() - msg.published_at < 300000, // 5 minutes
        );

        for (const message of pendingMessages) {
          const subscribers = Array.from(this.subscribers.get(topic)!);

          try {
            await this.deliverToSubscribers(topic, message.event, subscribers);
            message.delivery_attempts++;
          } catch (error) {
            console.error(`Failed to deliver message ${message.id}:`, error);
          }
        }
      }
    }
  }

  /**
   * Get topic statistics
   */
  getTopicStats(topic: string): TopicStats | null {
    const topicObj = this.topics.get(topic);
    const subscribers = this.subscribers.get(topic);
    const queue = this.messageQueue.get(topic);

    if (!topicObj || !subscribers || !queue) {
      return null;
    }

    return {
      name: topic,
      subscriber_count: subscribers.size,
      queued_messages: queue.length,
      config: topicObj.config,
      created_at: topicObj.created_at,
    };
  }

  /**
   * Get overall pub/sub metrics
   */
  getMetrics(): PubSubMetrics {
    return { ...this.metrics };
  }

  /**
   * Broadcast to all elemental services
   */
  async broadcastToElements(event: SpiralogicEvent): Promise<BroadcastResult> {
    const results: PublishResult[] = [];

    for (const element of Object.values(ElementalService)) {
      try {
        const result = await this.publish(`${element}.channel`, event);
        results.push(result);
      } catch (error) {
        console.error(`Failed to broadcast to ${element}:`, error);
      }
    }

    return {
      total_topics: results.length,
      successful_broadcasts: results.filter((r) => r.subscribers_notified > 0)
        .length,
      total_subscribers: results.reduce(
        (sum, r) => sum + r.subscribers_notified,
        0,
      ),
    };
  }

  /**
   * Emergency broadcast with highest priority
   */
  async emergencyBroadcast(event: SpiralogicEvent): Promise<void> {
    // Override routing for emergency
    const emergencyEvent: SpiralogicEvent = {
      ...event,
      routing: {
        ...event.routing,
        priority: "critical",
        broadcast: true,
      },
    };

    await this.publish("emergency.broadcast", emergencyEvent);
    await this.broadcastToElements(emergencyEvent);

    this.emit("emergency.broadcast", { event: emergencyEvent });
  }

  /**
   * Generate unique subscriber ID
   */
  private generateSubscriberId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.topics.clear();
    this.subscribers.clear();
    this.messageQueue.clear();
    this.removeAllListeners();
  }
}

// Supporting classes and interfaces
class Topic {
  public created_at: number;

  constructor(public config: TopicConfig) {
    this.created_at = Date.now();
  }
}

interface Subscriber {
  id: string;
  callback: (event: SpiralogicEvent) => Promise<void>;
  topic: string;
  created_at: number;
  options: SubscriptionOptions;
}

interface SubscriptionOptions {
  elemental_filter?: keyof typeof ElementalService;
  elemental_threshold?: number;
  priority_filter?: "critical" | "high" | "medium" | "low";
  content_filter?: string;
  max_delivery_attempts?: number;
}

interface Subscription {
  id: string;
  topic: string;
  unsubscribe: () => boolean;
}

interface QueuedMessage {
  id: string;
  event: SpiralogicEvent;
  topic: string;
  published_at: number;
  delivery_attempts: number;
}

interface PublishResult {
  message_id: string;
  topic: string;
  subscribers_notified: number;
  failed_deliveries: DeliveryFailure[];
  delivery_guarantee: string;
}

interface DeliveryResult {
  successful: string[];
  failed: DeliveryFailure[];
}

interface DeliveryFailure {
  subscriber_id: string;
  error: string;
  timestamp: number;
}

interface TopicStats {
  name: string;
  subscriber_count: number;
  queued_messages: number;
  config: TopicConfig;
  created_at: number;
}

interface PubSubMetrics {
  messages_published: number;
  messages_delivered: number;
  active_subscribers: number;
  topics_created: number;
}

interface BroadcastResult {
  total_topics: number;
  successful_broadcasts: number;
  total_subscribers: number;
}

export default PubSubManager;
