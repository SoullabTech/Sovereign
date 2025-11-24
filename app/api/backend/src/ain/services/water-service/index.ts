/**
 * 🌊 Water Service - Emotional Agent
 * Hybrid edge-cloud service for emotional sensing and intuitive guidance
 */

import { HybridAgent } from "../../core/HybridAgent";
import { SpiralogicEvent, ElementalService, EventType } from "../../types";
import { EmotionalSensor } from "../../sensors/EmotionalSensor";
import { SymbolicMemory } from "../../symbolic/SymbolicMemory";

export class WaterService extends HybridAgent {
  private emotionalSensor: EmotionalSensor;
  private symbolicMemory: SymbolicMemory;
  private emotionalState: EmotionalState = {
    current: "neutral",
    depth: 0.5,
    flow: 0.5,
    clarity: 0.7,
  };

  constructor() {
    super("water-service", ElementalService.Water);
    this.emotionalSensor = new EmotionalSensor();
    this.symbolicMemory = new SymbolicMemory("emotional-patterns");

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Subscribe to emotional and intuitive events
    this.subscribe("emotion.shift", this.onEmotionShift.bind(this));
    this.subscribe("dream.capture", this.onDreamCapture.bind(this));
    this.subscribe("memory.create", this.onMemoryCreate.bind(this));
    this.subscribe("intuition.request", this.onIntuitionRequest.bind(this));
  }

  /**
   * Process emotional shifts with both edge and cloud capabilities
   */
  private async onEmotionShift(event: SpiralogicEvent) {
    // Edge processing for immediate response
    const immediateReading = await this.emotionalSensor.readCurrent(event);

    // Update local emotional state
    this.updateEmotionalState(immediateReading);

    // Publish immediate state
    await this.publish("emotion.state", {
      current: this.emotionalState,
      timestamp: Date.now(),
      processing: "edge",
    });

    // If significant shift, request cloud processing
    if (immediateReading.magnitude > 0.7) {
      await this.requestCloudProcessing("deep-emotional-analysis", {
        event,
        currentState: this.emotionalState,
        historicalContext: await this.getLocalEmotionalHistory(),
      });
    }
  }

  /**
   * Process dream captures with symbolic analysis
   */
  private async onDreamCapture(event: SpiralogicEvent) {
    const { content, symbols, emotions } = event.payload.content;

    // Edge: Quick symbolic matching
    const immediateSymbols = await this.symbolicMemory.matchPatterns(symbols);

    // Create dream insight
    const dreamInsight = {
      type: "dream-wisdom",
      symbols: immediateSymbols,
      emotional_tone: this.analyzeEmotionalTone(emotions),
      water_message: this.generateWaterMessage(immediateSymbols, emotions),
    };

    await this.publish("water.response", dreamInsight);

    // Store in symbolic memory
    await this.symbolicMemory.store({
      type: "dream",
      content,
      symbols: immediateSymbols,
      timestamp: event.timestamp,
      emotional_signature: emotions,
    });
  }

  /**
   * Tag memories with emotional context
   */
  private async onMemoryCreate(event: SpiralogicEvent) {
    const memory = event.payload.content;

    // Add emotional context to memory
    const emotionalContext = {
      state_at_creation: this.emotionalState,
      emotional_significance: this.calculateEmotionalSignificance(memory),
      flow_pattern: this.identifyFlowPattern(memory),
      water_element_strength: this.calculateWaterStrength(memory),
    };

    // Publish enhanced memory
    await this.publish("memory.enhanced", {
      ...memory,
      emotional_context: emotionalContext,
      elemental_tagging: {
        water: emotionalContext.water_element_strength,
        primary_element: "water",
      },
    });
  }

  /**
   * Provide intuitive guidance
   */
  private async onIntuitionRequest(event: SpiralogicEvent) {
    const { question, context } = event.payload.content;

    // Access intuitive patterns
    const intuitivePatterns = await this.accessIntuitiveField(
      question,
      context,
    );

    // Generate water wisdom
    const waterWisdom = {
      intuitive_sense: intuitivePatterns.primaryInsight,
      emotional_guidance: this.generateEmotionalGuidance(intuitivePatterns),
      flow_recommendation: this.recommendFlow(context),
      depth_level: intuitivePatterns.depth,
      clarity_score: intuitivePatterns.clarity,
    };

    await this.publish("intuition.insight", waterWisdom);
  }

  /**
   * Update emotional state based on sensor reading
   */
  private updateEmotionalState(reading: EmotionalReading) {
    this.emotionalState = {
      current: reading.primaryEmotion,
      depth: reading.depth,
      flow: reading.flow,
      clarity: reading.clarity,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Access intuitive field for guidance
   */
  private async accessIntuitiveField(
    question: string,
    context: any,
  ): Promise<IntuitivePattern> {
    // Simulate intuitive access - replace with actual implementation
    const patterns = [
      {
        primaryInsight: "Trust the flow of this moment",
        depth: 0.8,
        clarity: 0.9,
        resonance: 0.85,
      },
      {
        primaryInsight: "Deep waters are stirring - patience is wisdom",
        depth: 0.9,
        clarity: 0.7,
        resonance: 0.8,
      },
      {
        primaryInsight: "The emotional current guides you true",
        depth: 0.7,
        clarity: 0.85,
        resonance: 0.9,
      },
    ];

    // Select based on question resonance
    const index = question.length % patterns.length;
    return patterns[index];
  }

  /**
   * Generate emotional guidance based on patterns
   */
  private generateEmotionalGuidance(patterns: IntuitivePattern): string {
    const guidanceTemplates = [
      `With ${patterns.clarity * 100}% clarity, the waters show: ${patterns.primaryInsight}`,
      `Diving to depth level ${patterns.depth}, we find: ${patterns.primaryInsight}`,
      `The emotional currents resonate at ${patterns.resonance}: ${patterns.primaryInsight}`,
    ];

    return guidanceTemplates[
      Math.floor(Math.random() * guidanceTemplates.length)
    ];
  }

  /**
   * Recommend flow state based on context
   */
  private recommendFlow(context: any): FlowRecommendation {
    return {
      action:
        this.emotionalState.flow > 0.7 ? "ride-current" : "find-stillness",
      intensity: this.emotionalState.flow,
      duration: this.emotionalState.flow > 0.5 ? "sustained" : "brief",
      practice: this.suggestWaterPractice(),
    };
  }

  /**
   * Suggest water element practice
   */
  private suggestWaterPractice(): string {
    const practices = [
      "Ocean breathing meditation",
      "Emotional wave observation",
      "Flow state cultivation",
      "Intuitive journaling",
      "Dream water ritual",
    ];

    // Select based on current emotional state
    const index = Math.floor(this.emotionalState.depth * practices.length);
    return practices[Math.min(index, practices.length - 1)];
  }

  /**
   * Calculate emotional significance of memory
   */
  private calculateEmotionalSignificance(memory: any): number {
    // Simplified calculation - enhance with actual logic
    const emotionalKeywords = [
      "feel",
      "felt",
      "emotion",
      "heart",
      "soul",
      "love",
      "fear",
      "joy",
    ];
    const content = JSON.stringify(memory).toLowerCase();

    const keywordCount = emotionalKeywords.filter((keyword) =>
      content.includes(keyword),
    ).length;

    return Math.min(keywordCount / emotionalKeywords.length, 1.0);
  }

  /**
   * Identify flow pattern in memory
   */
  private identifyFlowPattern(memory: any): string {
    const patterns = ["tidal", "river", "rain", "ocean", "spring", "waterfall"];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Calculate water element strength
   */
  private calculateWaterStrength(memory: any): number {
    const significance = this.calculateEmotionalSignificance(memory);
    const currentWaterState =
      this.emotionalState.depth * this.emotionalState.flow;

    return (significance + currentWaterState) / 2;
  }

  /**
   * Analyze emotional tone from emotions array
   */
  private analyzeEmotionalTone(emotions: string[]): EmotionalTone {
    const toneMap: Record<string, number> = {
      joy: 1.0,
      love: 0.9,
      peace: 0.8,
      curiosity: 0.7,
      neutral: 0.5,
      concern: 0.3,
      fear: 0.2,
      sadness: 0.1,
    };

    const scores = emotions.map((e) => toneMap[e.toLowerCase()] || 0.5);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      value: average,
      primary: emotions[0] || "neutral",
      complexity: emotions.length,
    };
  }

  /**
   * Generate water element message
   */
  private generateWaterMessage(symbols: any[], emotions: string[]): string {
    const templates = [
      `The waters of ${emotions[0]} carry the symbol of ${symbols[0]?.name || "mystery"}`,
      `Deep currents reveal: ${symbols.map((s) => s.name).join(", ")}`,
      `Emotional tides bring wisdom through ${emotions.join(" and ")}`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Get local emotional history for context
   */
  private async getLocalEmotionalHistory(): Promise<EmotionalHistory> {
    // Return recent emotional states from local cache
    return {
      states: [], // Would be populated from local storage
      patterns: [],
      dominantEmotion: this.emotionalState.current,
      volatility: 0.5,
    };
  }
}

// Type definitions
interface EmotionalState {
  current: string;
  depth: number;
  flow: number;
  clarity: number;
  lastUpdated?: number;
}

interface EmotionalReading {
  primaryEmotion: string;
  depth: number;
  flow: number;
  clarity: number;
  magnitude: number;
}

interface IntuitivePattern {
  primaryInsight: string;
  depth: number;
  clarity: number;
  resonance: number;
}

interface FlowRecommendation {
  action: string;
  intensity: number;
  duration: string;
  practice: string;
}

interface EmotionalTone {
  value: number;
  primary: string;
  complexity: number;
}

interface EmotionalHistory {
  states: EmotionalState[];
  patterns: string[];
  dominantEmotion: string;
  volatility: number;
}

// Export singleton instance
export const waterService = new WaterService();
