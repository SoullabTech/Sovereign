/**
 * 🔥 Fire Service - Catalyst Agent
 * Edge-capable service for vision processing and transformation triggers
 */

import { EventEmitter } from "events";
import { EdgeAgent } from "../../core/EdgeAgent";
import { SpiralogicEvent, ElementalService, EventType } from "../../types";
import { NeuromorphicSensor } from "../../neuromorphic/NeuromorphicSensor";

export class FireService extends EdgeAgent {
  private sensor: NeuromorphicSensor;
  private visionThreshold = 0.8;
  private lastProcessedTime = 0;

  constructor() {
    super("fire-service", ElementalService.Fire);
    this.sensor = new NeuromorphicSensor();
    this.sensor.calibrate(0.7, 100);

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Subscribe to relevant events
    this.subscribe("vision.update", this.onVisionUpdate.bind(this));
    this.subscribe("user.intent", this.onUserIntent.bind(this));
    this.subscribe("energy.spike", this.onEnergySpike.bind(this));
  }

  /**
   * Process vision updates with neuromorphic spike detection
   */
  private async onVisionUpdate(event: SpiralogicEvent) {
    const delta = this.calculateDelta(event.payload.content);

    if (await this.sensor.shouldSpike(delta)) {
      const catalystEvent = this.createCatalystEvent(event);
      await this.publish("catalyst.trigger", catalystEvent);

      // Edge processing for immediate response
      const quickResponse = await this.generateQuickInsight(event);
      await this.publish("fire.response", {
        type: "immediate",
        content: quickResponse,
        processing: "edge",
      });
    }
  }

  /**
   * Handle user intent with transformation logic
   */
  private async onUserIntent(event: SpiralogicEvent) {
    const { intent, intensity } = event.payload.content;

    if (
      this.isTransformativeIntent(intent) &&
      intensity > this.visionThreshold
    ) {
      await this.publish("transformation.begin", {
        catalyst: "user-intent",
        intensity,
        timestamp: Date.now(),
        edgeProcessed: true,
      });
    }
  }

  /**
   * Respond to energy spikes with catalytic action
   */
  private async onEnergySpike(event: SpiralogicEvent) {
    const { source, magnitude } = event.payload.content;

    // Fire element amplifies energy spikes
    const amplifiedResponse = {
      original_magnitude: magnitude,
      fire_amplification: magnitude * 1.618, // Golden ratio amplification
      catalyst_type: "energy-surge",
      action_required: magnitude > 0.9,
    };

    await this.publish("catalyst.trigger", amplifiedResponse);
  }

  /**
   * Calculate delta for neuromorphic processing
   */
  private calculateDelta(content: any): number {
    const currentTime = Date.now();
    const timeDelta = currentTime - this.lastProcessedTime;
    this.lastProcessedTime = currentTime;

    // Simplified delta calculation - replace with actual logic
    const contentMagnitude = this.extractMagnitude(content);
    return contentMagnitude / Math.max(timeDelta, 1);
  }

  /**
   * Generate quick insight at the edge
   */
  private async generateQuickInsight(event: SpiralogicEvent): Promise<string> {
    // Edge-based pattern matching for immediate response
    const patterns = [
      "A spark of transformation ignites...",
      "The fire within recognizes this moment...",
      "Catalyst energy detected - change is imminent...",
      "Your inner flame responds to this calling...",
    ];

    // Simple pattern selection based on event signature
    const index = Math.floor(event.timestamp % patterns.length);
    return patterns[index];
  }

  /**
   * Check if intent is transformative
   */
  private isTransformativeIntent(intent: string): boolean {
    const transformativeKeywords = [
      "change",
      "transform",
      "evolve",
      "breakthrough",
      "release",
      "ignite",
      "catalyst",
      "shift",
    ];

    return transformativeKeywords.some((keyword) =>
      intent.toLowerCase().includes(keyword),
    );
  }

  /**
   * Create catalyst event with fire signature
   */
  private createCatalystEvent(sourceEvent: SpiralogicEvent): SpiralogicEvent {
    return {
      id: this.generateEventId(),
      timestamp: Date.now(),
      source: ElementalService.Fire,
      type: EventType.Catalyst,
      payload: {
        content: {
          trigger: sourceEvent,
          fire_signature: this.generateFireSignature(),
          transformation_potential:
            this.calculateTransformationPotential(sourceEvent),
        },
        metadata: {
          processed_at: "edge",
          latency: Date.now() - sourceEvent.timestamp,
        },
        elemental_signature: {
          fire: 0.9,
          water: 0.1,
          earth: 0.0,
          air: 0.0,
          aether: 0.0,
        },
      },
      routing: {
        broadcast: true,
        priority: "high",
      },
    };
  }

  /**
   * Generate unique fire signature
   */
  private generateFireSignature(): string {
    const signatures = [
      "phoenix-rising",
      "solar-flare",
      "sacred-flame",
      "forge-heat",
      "stellar-ignition",
    ];

    return signatures[Math.floor(Math.random() * signatures.length)];
  }

  /**
   * Calculate transformation potential
   */
  private calculateTransformationPotential(event: SpiralogicEvent): number {
    // Simplified calculation - enhance with actual logic
    const baseIntensity = event.payload.metadata?.intensity || 0.5;
    const fireAmplification = 1.5;

    return Math.min(baseIntensity * fireAmplification, 1.0);
  }

  /**
   * Extract magnitude from content
   */
  private extractMagnitude(content: any): number {
    if (typeof content === "number") return content;
    if (content.magnitude !== undefined) return content.magnitude;
    if (content.intensity !== undefined) return content.intensity;
    return 0.5; // Default magnitude
  }
}

// Export singleton instance
export const fireService = new FireService();
