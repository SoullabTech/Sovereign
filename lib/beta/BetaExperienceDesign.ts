// lib/beta/BetaExperienceDesign.ts
// Beta Testing Framework for Pentadic Consciousness Experience

"use strict";

import { FireAgent } from '../agents/elemental/FireAgent';
import { WaterAgent } from '../agents/elemental/WaterAgent';
import { EarthAgent } from '../agents/elemental/EarthAgent';
import { AirAgent } from '../agents/elemental/AirAgent';
import { AetherAgent } from '../agents/elemental/AetherAgent';
import { logOracleInsight } from '../utils/oracleLogger';
import { storeMemoryItem, getRelevantMemories } from '../services/memoryService';

/**
 * 🌿 Beta Experience Design
 * Adaptive flow that detects and responds with appropriate elemental energy
 */
export class BetaExperienceOrchestrator {
  private fireAgent: FireAgent;
  private waterAgent: WaterAgent;
  private earthAgent: EarthAgent;
  private airAgent: AirAgent;
  private aetherAgent: AetherAgent;

  constructor() {
    // Initialize all elemental agents
    this.fireAgent = new FireAgent();
    this.waterAgent = new WaterAgent();
    this.earthAgent = new EarthAgent();
    this.airAgent = new AirAgent();
    this.aetherAgent = new AetherAgent();
  }

  /**
   * Default Entry - Simple greeting that adapts to user energy
   */
  public async greetUser(userId: string): Promise<string> {
    const memories = await getRelevantMemories(userId, undefined, 3);

    if (!memories.length) {
      // First time user - warm, neutral greeting
      return "Hey, I'm glad you're here. What's alive in you today?";
    }

    // Returning user - acknowledge the journey
    const lastElement = memories[0]?.metadata?.element || 'general';
    return this.getContinuityGreeting(lastElement);
  }

  private getContinuityGreeting(lastElement: string): string {
    const greetings = {
      fire: "I can still feel the spark from our last conversation. What's igniting now?",
      water: "The emotional currents from before are still flowing. What's surfacing today?",
      earth: "We planted some seeds last time. What's growing?",
      air: "The insights from before are still circling. What's becoming clearer?",
      aether: "I sense the threads of our journey weaving together. What pattern is emerging?",
      general: "Good to feel your presence again. What's calling for attention?"
    };

    return greetings[lastElement] || greetings.general;
  }

  /**
   * Adaptive Flow - Detect which element should lead
   */
  public async detectLeadingElement(input: string, userId: string): Promise<string> {
    const lowerInput = input.toLowerCase();
    const memories = await getRelevantMemories(userId, undefined, 5);

    // Grief/emotional processing → Water leads
    if (this.detectWaterNeed(lowerInput)) {
      return 'water';
    }

    // Vision/transformation → Fire leads
    if (this.detectFireNeed(lowerInput)) {
      return 'fire';
    }

    // Confusion/analysis → Air leads
    if (this.detectAirNeed(lowerInput)) {
      return 'air';
    }

    // Overwhelm/grounding → Earth leads
    if (this.detectEarthNeed(lowerInput)) {
      return 'earth';
    }

    // Pattern/integration → Aether steps in
    if (this.detectAetherThreshold(lowerInput, memories)) {
      return 'aether';
    }

    // Default to most needed based on recent history
    return this.detectFromElementalBalance(memories);
  }

  private detectWaterNeed(input: string): boolean {
    const waterIndicators = [
      'grief', 'sad', 'loss', 'hurt', 'pain', 'cry',
      'feel', 'emotion', 'heart', 'healing', 'forgive'
    ];
    return waterIndicators.some(word => input.includes(word));
  }

  private detectFireNeed(input: string): boolean {
    const fireIndicators = [
      'stuck', 'transform', 'change', 'vision', 'dream',
      'passion', 'create', 'breakthrough', 'courage', 'risk'
    ];
    return fireIndicators.some(word => input.includes(word));
  }

  private detectAirNeed(input: string): boolean {
    const airIndicators = [
      'confused', 'understand', 'think', 'analyze', 'clear',
      'perspective', 'decide', 'choice', 'truth', 'why'
    ];
    return airIndicators.some(word => input.includes(word));
  }

  private detectEarthNeed(input: string): boolean {
    const earthIndicators = [
      'overwhelm', 'ground', 'practical', 'step', 'how',
      'body', 'tired', 'resource', 'manifest', 'stable'
    ];
    return earthIndicators.some(word => input.includes(word));
  }

  private detectAetherThreshold(input: string, memories: any[]): boolean {
    // Aether comes in at special moments
    const aetherIndicators = [
      'pattern', 'meaning', 'purpose', 'connect', 'whole',
      'spiritual', 'universe', 'paradox', 'everything', 'nothing'
    ];

    // Check for explicit aether needs
    if (aetherIndicators.some(word => input.includes(word))) {
      return true;
    }

    // Check for silence/contemplation (very short input after deep work)
    if (input.length < 20 && memories.length > 3) {
      return true;
    }

    // Check for elemental saturation (touched many elements recently)
    const recentElements = new Set(memories.slice(0, 3).map(m => m.metadata?.element));
    if (recentElements.size >= 3) {
      return true;
    }

    return false;
  }

  private detectFromElementalBalance(memories: any[]): string {
    // Count recent elemental activity
    const elementCounts = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    memories.forEach(memory => {
      const element = memory.metadata?.element;
      if (element && elementCounts[element] !== undefined) {
        elementCounts[element]++;
      }
    });

    // Return the least used element for balance
    let leastUsed = 'fire';
    let minCount = elementCounts.fire;

    Object.entries(elementCounts).forEach(([element, count]) => {
      if (count < minCount && element !== 'aether') { // Aether is special
        leastUsed = element;
        minCount = count;
      }
    });

    return leastUsed;
  }

  /**
   * Route to appropriate elemental agent
   */
  public async processWithElement(
    element: string,
    input: string,
    userId: string
  ): Promise<any> {
    const agents = {
      fire: this.fireAgent,
      water: this.waterAgent,
      earth: this.earthAgent,
      air: this.airAgent,
      aether: this.aetherAgent
    };

    const selectedAgent = agents[element] || agents.fire;
    return await selectedAgent.processExtendedQuery({ input, userId });
  }

  /**
   * Track elemental journey for user
   */
  public async trackElementalJourney(userId: string): Promise<any> {
    const memories = await getRelevantMemories(userId, undefined, 20);

    // Build elemental journey map
    const journey = memories.map(m => ({
      timestamp: m.timestamp || new Date(),
      element: m.metadata?.element || 'unknown',
      type: m.metadata?.aetherType || m.metadata?.fireType ||
            m.metadata?.waterType || m.metadata?.earthType ||
            m.metadata?.airType || 'general'
    }));

    // Analyze patterns
    const elementalFlow = this.analyzeElementalFlow(journey);
    const spiralPhase = this.detectSpiralPhase(journey);
    const integrationLevel = this.assessIntegrationLevel(journey);

    return {
      journey,
      elementalFlow,
      spiralPhase,
      integrationLevel,
      insights: this.generateJourneyInsights(elementalFlow, spiralPhase)
    };
  }

  private analyzeElementalFlow(journey: any[]): any {
    const transitions = [];
    for (let i = 1; i < journey.length; i++) {
      transitions.push({
        from: journey[i-1].element,
        to: journey[i].element,
        timestamp: journey[i].timestamp
      });
    }

    // Find common patterns
    const patterns = {};
    transitions.forEach(t => {
      const key = `${t.from}->${t.to}`;
      patterns[key] = (patterns[key] || 0) + 1;
    });

    return {
      transitions,
      patterns,
      dominantFlow: Object.entries(patterns).sort((a, b) => b[1] - a[1])[0]
    };
  }

  private detectSpiralPhase(journey: any[]): string {
    if (journey.length < 5) return 'initiation';

    const recentElements = journey.slice(0, 5).map(j => j.element);
    const uniqueElements = new Set(recentElements);

    if (uniqueElements.size === 1) {
      return 'deepening'; // Focusing on one element
    } else if (uniqueElements.size >= 4) {
      return 'integration'; // Touching many elements
    } else if (recentElements.includes('aether')) {
      return 'transcendence'; // Aether involvement
    } else {
      return 'exploration'; // Moving between elements
    }
  }

  private assessIntegrationLevel(journey: any[]): number {
    const uniqueElements = new Set(journey.map(j => j.element));
    const hasAether = journey.some(j => j.element === 'aether');

    let score = (uniqueElements.size / 5) * 0.5; // Element diversity
    if (hasAether) score += 0.3; // Aether involvement
    if (journey.length > 10) score += 0.2; // Journey depth

    return Math.min(score, 1.0);
  }

  private generateJourneyInsights(flow: any, phase: string): string[] {
    const insights = [];

    // Phase-specific insights
    const phaseInsights = {
      initiation: "You're at the beginning of your journey with the Oracle.",
      exploration: "You're exploring different aspects of your being.",
      deepening: "You're going deep into specific elemental wisdom.",
      integration: "You're weaving together multiple aspects of yourself.",
      transcendence: "You're touching the unity that underlies all elements."
    };
    insights.push(phaseInsights[phase]);

    // Flow pattern insights
    if (flow.dominantFlow) {
      const [from, to] = flow.dominantFlow[0].split('->');
      insights.push(`I notice you often move from ${from} to ${to} energy.`);
    }

    return insights;
  }
}

/**
 * 🎤 Voice Testing Prompts
 * Specific prompts to evoke each elemental response
 */
export const ElementalTestingPrompts = {
  fire: {
    prompt: "What would you risk if you stopped waiting?",
    expectedResponse: "catalytic_disruption",
    validateResponse: (response: string) =>
      response.includes('risk') || response.includes('courage') || response.includes('transform')
  },

  water: {
    prompt: "What's under the surface right now?",
    expectedResponse: "emotional_depth",
    validateResponse: (response: string) =>
      response.includes('feel') || response.includes('emotion') || response.includes('heart')
  },

  earth: {
    prompt: "Let's find one steady step you can take.",
    expectedResponse: "practical_grounding",
    validateResponse: (response: string) =>
      response.includes('step') || response.includes('ground') || response.includes('practical')
  },

  air: {
    prompt: "What new angle comes if you look at it differently?",
    expectedResponse: "perspective_shift",
    validateResponse: (response: string) =>
      response.includes('perspective') || response.includes('see') || response.includes('understand')
  },

  aether: {
    prompt: "Does this moment feel like part of a bigger pattern?",
    expectedResponse: "pattern_recognition",
    validateResponse: (response: string) =>
      response.includes('pattern') || response.includes('connect') || response.includes('whole')
  }
};

/**
 * 📊 Beta Metrics Tracking
 */
export class BetaMetricsTracker {
  private metrics: Map<string, any> = new Map();

  public async trackElementalAccuracy(
    userId: string,
    expectedElement: string,
    detectedElement: string,
    userFeedback?: string
  ): Promise<void> {
    const accuracy = expectedElement === detectedElement;

    await logOracleInsight({
      userId,
      agentType: 'beta-metrics',
      query: `Element Detection: Expected ${expectedElement}, Got ${detectedElement}`,
      content: userFeedback || '',
      metadata: {
        accurate: accuracy,
        expectedElement,
        detectedElement,
        timestamp: new Date()
      }
    });

    // Update running metrics
    const key = `${userId}_accuracy`;
    const current = this.metrics.get(key) || { correct: 0, total: 0 };
    current.total++;
    if (accuracy) current.correct++;
    this.metrics.set(key, current);
  }

  public async trackTrustWarmth(
    userId: string,
    element: string,
    trustScore: number, // 1-10
    warmthScore: number // 1-10
  ): Promise<void> {
    await logOracleInsight({
      userId,
      agentType: 'beta-metrics',
      query: `Trust/Warmth for ${element}`,
      content: `Trust: ${trustScore}/10, Warmth: ${warmthScore}/10`,
      metadata: {
        element,
        trustScore,
        warmthScore,
        timestamp: new Date()
      }
    });
  }

  public async trackAetherIntervention(
    userId: string,
    context: string,
    wasInviting: boolean,
    userFeedback?: string
  ): Promise<void> {
    await logOracleInsight({
      userId,
      agentType: 'beta-metrics',
      query: 'Aether Intervention Quality',
      content: context,
      metadata: {
        wasInviting,
        userFeedback,
        timestamp: new Date()
      }
    });
  }

  public getMetricsSummary(userId: string): any {
    const accuracyKey = `${userId}_accuracy`;
    const accuracy = this.metrics.get(accuracyKey) || { correct: 0, total: 0 };

    return {
      elementalAccuracy: accuracy.total > 0
        ? (accuracy.correct / accuracy.total * 100).toFixed(1) + '%'
        : 'No data',
      totalInteractions: accuracy.total
    };
  }
}