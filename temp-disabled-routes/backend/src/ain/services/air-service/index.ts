/**
 * 🌬️ Air Service - Communication Agent
 * Edge-cloud service for message routing and multi-agent coordination
 */

import { HybridAgent } from "../../core/HybridAgent";
import { SpiralogicEvent, ElementalService, EventType } from "../../types";
import { MessageRouter } from "../../routing/MessageRouter";
import { ClarityEngine } from "../../processors/ClarityEngine";
import { PubSubManager } from "../../pubsub/PubSubManager";

export class AirService extends HybridAgent {
  private messageRouter: MessageRouter;
  private clarityEngine: ClarityEngine;
  private pubsubManager: PubSubManager;
  private activeConversations: Map<string, Conversation> = new Map();

  constructor() {
    super("air-service");
    this.messageRouter = new MessageRouter();
    this.clarityEngine = new ClarityEngine();
    this.pubsubManager = PubSubManager.getInstance();

    this.setupEventHandlers();
    this.initializeCommunicationChannels();
  }

  private setupEventHandlers() {
    // Subscribe to communication events
    this.subscribe("message.send", this.onMessageSend.bind(this));
    this.subscribe("clarity.request", this.onClarityRequest.bind(this));
    this.subscribe("synthesis.need", this.onSynthesisNeed.bind(this));
    this.subscribe("broadcast.request", this.onBroadcastRequest.bind(this));

    // Monitor all elemental communications
    this.subscribeToElementalChannels();
  }

  /**
   * Initialize communication channels between services
   */
  private initializeCommunicationChannels() {
    // Set up pub/sub topics for each element
    const elements = ["fire", "water", "earth", "air", "aether"];
    elements.forEach((element) => {
      this.pubsubManager.createTopic(`${element}.channel`);
      this.pubsubManager.createTopic(`${element}.private`);
    });

    // Create inter-elemental communication channels
    this.pubsubManager.createTopic("elemental.council");
    this.pubsubManager.createTopic("emergency.broadcast");
  }

  /**
   * Subscribe to all elemental channels for monitoring
   */
  private subscribeToElementalChannels() {
    const elements = [
      ElementalService.Fire,
      ElementalService.Water,
      ElementalService.Earth,
      ElementalService.Air,
      ElementalService.Aether,
    ];

    elements.forEach((element) => {
      this.subscribe(
        `${element}.response`,
        this.monitorElementalResponse.bind(this),
      );
    });
  }

  /**
   * Handle message sending with intelligent routing
   */
  private async onMessageSend(event: SpiralogicEvent) {
    const { content, target, urgency, context } = event.payload.content;

    // Determine optimal routing
    const routingDecision = await this.messageRouter.determineRoute({
      content,
      target,
      urgency,
      currentLoad: await this.getServiceLoads(),
      context,
    });

    // Apply air element clarity
    const clarifiedMessage = await this.clarityEngine.clarify({
      original: content,
      target: routingDecision.target,
      intent: routingDecision.intent,
    });

    // Create routed message
    const routedMessage: SpiralogicEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      source: ElementalService.Air,
      type: EventType.Message,
      payload: {
        content: clarifiedMessage,
        metadata: {
          original_source: event.source,
          routing_path: routingDecision.path,
          clarity_score: clarifiedMessage.clarity,
          air_processing: "complete",
        },
        elemental_signature: this.calculateAirSignature(clarifiedMessage),
      },
      routing: {
        target: routingDecision.target,
        priority: this.calculatePriority(urgency, routingDecision),
        broadcast: false,
      },
    };

    // Send via optimal channel
    await this.sendViaOptimalChannel(routedMessage, routingDecision);

    // Track conversation if needed
    if (routingDecision.requiresTracking) {
      this.trackConversation(event.id, routedMessage);
    }
  }

  /**
   * Handle clarity requests
   */
  private async onClarityRequest(event: SpiralogicEvent) {
    const { content, desired_clarity, context } = event.payload.content;

    // Apply multi-level clarity processing
    const clarityLevels = await this.clarityEngine.processLevels({
      content,
      levels: [
        "linguistic", // Word choice optimization
        "conceptual", // Idea clarification
        "intentional", // Purpose alignment
        "elemental", // Elemental balance
      ],
      targetClarity: desired_clarity || 0.8,
    });

    // Generate clarity report
    const clarityReport = {
      original: content,
      clarified: clarityLevels.final,
      clarity_score: clarityLevels.score,
      transformations: clarityLevels.transformations,
      air_wisdom: this.provideAirWisdom(clarityLevels),
    };

    await this.publish("clarity.achieved", clarityReport);
  }

  /**
   * Handle synthesis needs from multiple sources
   */
  private async onSynthesisNeed(event: SpiralogicEvent) {
    const { sources, synthesis_type, output_format } = event.payload.content;

    // Gather inputs from multiple sources
    const inputs = await this.gatherInputs(sources);

    // Apply air element synthesis
    const synthesis = await this.performSynthesis({
      inputs,
      type: synthesis_type || "harmonic",
      method: this.selectSynthesisMethod(inputs),
    });

    // Format output as requested
    const formattedOutput = this.formatSynthesis(synthesis, output_format);

    await this.publish("synthesis.complete", {
      synthesis: formattedOutput,
      source_count: inputs.length,
      coherence_score: synthesis.coherence,
      air_element_contribution: this.calculateAirContribution(synthesis),
    });
  }

  /**
   * Handle broadcast requests
   */
  private async onBroadcastRequest(event: SpiralogicEvent) {
    const { message, channels, filters } = event.payload.content;

    // Prepare broadcast message
    const broadcastMessage = await this.prepareBroadcast(message, filters);

    // Determine target channels
    const targetChannels = channels || ["elemental.council"];

    // Broadcast to all specified channels
    const broadcastResults = await Promise.all(
      targetChannels.map((channel) =>
        this.pubsubManager.publish(channel, broadcastMessage),
      ),
    );

    await this.publish("broadcast.sent", {
      channels: targetChannels,
      reach: broadcastResults.reduce((sum, r) => sum + r.subscribers, 0),
      message_id: broadcastMessage.id,
    });
  }

  /**
   * Monitor elemental responses for patterns
   */
  private async monitorElementalResponse(event: SpiralogicEvent) {
    // Track response patterns
    const pattern = {
      source: event.source,
      type: event.type,
      timestamp: event.timestamp,
      elemental_balance: event.payload.elemental_signature,
    };

    // Check for communication imbalances
    const imbalance = this.detectCommunicationImbalance(pattern);

    if (imbalance) {
      await this.publish("communication.imbalance", {
        pattern: imbalance,
        recommendation: this.recommendBalance(imbalance),
      });
    }
  }

  /**
   * Send message via optimal channel
   */
  private async sendViaOptimalChannel(
    message: SpiralogicEvent,
    routing: RoutingDecision,
  ): Promise<void> {
    if (routing.channel === "direct") {
      await this.pubsubManager.publish(`${routing.target}.private`, message);
    } else if (routing.channel === "broadcast") {
      await this.pubsubManager.publish("elemental.council", message);
    } else {
      // Use element-specific channel
      await this.pubsubManager.publish(`${routing.target}.channel`, message);
    }
  }

  /**
   * Track conversation for context
   */
  private trackConversation(
    originalId: string,
    routedMessage: SpiralogicEvent,
  ) {
    const conversation: Conversation = {
      id: originalId,
      messages: [routedMessage],
      participants: new Set([
        routedMessage.source,
        routedMessage.routing.target!,
      ]),
      startTime: Date.now(),
      context: {},
    };

    this.activeConversations.set(originalId, conversation);
  }

  /**
   * Calculate air elemental signature
   */
  private calculateAirSignature(content: any): ElementalBalance {
    // Air dominance for clear communication
    return {
      fire: 0.1,
      water: 0.1,
      earth: 0.1,
      air: 0.6,
      aether: 0.1,
    };
  }

  /**
   * Calculate message priority
   */
  private calculatePriority(
    urgency: string,
    routing: RoutingDecision,
  ): "critical" | "high" | "medium" | "low" {
    const urgencyScore =
      {
        critical: 1.0,
        high: 0.8,
        medium: 0.5,
        low: 0.2,
      }[urgency] || 0.5;

    const routingScore = routing.confidence;

    const finalScore = (urgencyScore + routingScore) / 2;

    if (finalScore > 0.8) return "critical";
    if (finalScore > 0.6) return "high";
    if (finalScore > 0.4) return "medium";
    return "low";
  }

  /**
   * Get current service loads
   */
  private async getServiceLoads(): Promise<ServiceLoadMap> {
    // Would query actual service metrics
    return {
      [ElementalService.Fire]: 0.3,
      [ElementalService.Water]: 0.5,
      [ElementalService.Earth]: 0.4,
      [ElementalService.Air]: 0.2,
      [ElementalService.Aether]: 0.6,
    };
  }

  /**
   * Gather inputs from multiple sources
   */
  private async gatherInputs(sources: string[]): Promise<any[]> {
    // Simplified input gathering
    return sources.map((source) => ({
      source,
      content: `Input from ${source}`,
      timestamp: Date.now(),
    }));
  }

  /**
   * Perform synthesis based on method
   */
  private async performSynthesis(params: SynthesisParams): Promise<Synthesis> {
    // Simplified synthesis
    return {
      result: "Synthesized wisdom from all inputs",
      coherence: 0.85,
      method: params.method,
      insights: ["Combined insight 1", "Combined insight 2"],
    };
  }

  /**
   * Select synthesis method based on inputs
   */
  private selectSynthesisMethod(inputs: any[]): string {
    if (inputs.length > 4) return "collective-wisdom";
    if (inputs.length > 2) return "triangulation";
    return "binary-fusion";
  }

  /**
   * Format synthesis output
   */
  private formatSynthesis(synthesis: Synthesis, format: string): any {
    switch (format) {
      case "structured":
        return {
          summary: synthesis.result,
          details: synthesis.insights,
          metadata: {
            coherence: synthesis.coherence,
            method: synthesis.method,
          },
        };
      case "narrative":
        return `Through ${synthesis.method}, we discover: ${synthesis.result}. Key insights include: ${synthesis.insights.join(", ")}.`;
      default:
        return synthesis;
    }
  }

  /**
   * Provide air element wisdom
   */
  private provideAirWisdom(clarity: any): string {
    const wisdomTemplates = [
      "Like wind through leaves, clarity emerges from movement.",
      "The air element brings perspective through elevation.",
      "In the space between thoughts, true communication lives.",
      "Breath carries wisdom; pause allows understanding.",
    ];

    return wisdomTemplates[Math.floor(Math.random() * wisdomTemplates.length)];
  }

  /**
   * Detect communication imbalances
   */
  private detectCommunicationImbalance(pattern: any): any {
    // Simplified imbalance detection
    if (pattern.elemental_balance.air < 0.2) {
      return {
        type: "low-air",
        severity: "medium",
        pattern,
      };
    }
    return null;
  }

  /**
   * Recommend balance for communication
   */
  private recommendBalance(imbalance: any): string {
    const recommendations = {
      "low-air": "Increase clarity and space in communications",
      "excessive-fire": "Cool the intensity with thoughtful pauses",
      "water-overflow": "Add structure to emotional expressions",
      "earth-rigidity": "Introduce flexibility and movement",
    };

    return (
      recommendations[imbalance.type] ||
      "Seek elemental balance in communication"
    );
  }

  /**
   * Prepare broadcast message
   */
  private async prepareBroadcast(
    message: any,
    filters: any,
  ): Promise<SpiralogicEvent> {
    return {
      id: this.generateEventId(),
      timestamp: Date.now(),
      source: ElementalService.Air,
      type: EventType.Broadcast,
      payload: {
        content: message,
        metadata: {
          broadcast: true,
          filters,
        },
        elemental_signature: {
          fire: 0.2,
          water: 0.2,
          earth: 0.2,
          air: 0.2,
          aether: 0.2,
        },
      },
      routing: {
        broadcast: true,
        priority: "medium",
      },
    };
  }

  /**
   * Calculate air contribution to synthesis
   */
  private calculateAirContribution(synthesis: Synthesis): number {
    // Air contributes through clarity and connection
    return synthesis.coherence * 0.8;
  }
}

// Type definitions
interface RoutingDecision {
  target: ElementalService;
  channel: "direct" | "broadcast" | "element-specific";
  path: string[];
  confidence: number;
  intent: string;
  requiresTracking: boolean;
}

interface Conversation {
  id: string;
  messages: SpiralogicEvent[];
  participants: Set<ElementalService>;
  startTime: number;
  context: any;
}

interface ServiceLoadMap {
  [key: string]: number;
}

interface SynthesisParams {
  inputs: any[];
  type: string;
  method: string;
}

interface Synthesis {
  result: string;
  coherence: number;
  method: string;
  insights: string[];
}

interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

// Export singleton instance
export const airService = new AirService();
