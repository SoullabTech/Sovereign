/**
 * Voice Cognitive Architecture Integration
 *
 * Connects MAIA's full cognitive faculties to voice conversations:
 * - LIDA Workspace: Conscious attention processing
 * - SOAR Planner: Procedural wisdom generation
 * - ACT-R Memory: Experience integration
 * - MicroPsi Core: Emotional resonance
 * - Five Elemental Agents: Specialized wisdom processing
 */

import { LIDAWorkspace } from '../cognitive-engines/lida-workspace';
import { SOARPlanner } from '../cognitive-engines/soar-planner';
import { ACTRMemory } from '../cognitive-engines/actr-memory';
import { MicroPsiCore } from '../cognitive-engines/micropsi-core';
import { FireAgent } from '../elemental-agents/fire-agent';
import { WaterAgent } from '../elemental-agents/water-agent';
import { EarthAgent } from '../elemental-agents/earth-agent';
import { AirAgent } from '../elemental-agents/air-agent';
import { AetherAgent } from '../elemental-agents/aether-agent';
import type { ConsciousnessProfile } from '../types/soullab-metadata';

export interface VoiceCognitiveState {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  cognitiveProcessing: {
    attentionFocus: string;
    wisdomDirection: string;
    memoryResonance: string;
    emotionalTone: string;
  };
  elementalWisdom: string;
  consciousnessMarkers: string[];
}

export class VoiceCognitiveArchitecture {
  private lida: LIDAWorkspace;
  private soar: SOARPlanner;
  private actr: ACTRMemory;
  private micropsi: MicroPsiCore;

  private fireAgent: FireAgent;
  private waterAgent: WaterAgent;
  private earthAgent: EarthAgent;
  private airAgent: AirAgent;
  private aetherAgent: AetherAgent;

  constructor() {
    // Initialize cognitive architectures
    this.lida = new LIDAWorkspace();
    this.soar = new SOARPlanner();
    this.actr = new ACTRMemory();
    this.micropsi = new MicroPsiCore();

    // Initialize elemental agents
    this.fireAgent = new FireAgent();
    this.waterAgent = new WaterAgent();
    this.earthAgent = new EarthAgent();
    this.airAgent = new AirAgent();
    this.aetherAgent = new AetherAgent();
  }

  /**
   * Process user input through full cognitive architecture for voice
   */
  async processVoiceInput(
    userInput: string,
    conversationHistory: Array<{role: string; content: string}>
  ): Promise<VoiceCognitiveState> {

    // Build consciousness profile from conversation
    const consciousnessProfile = this.buildConsciousnessProfile(conversationHistory);

    // Phase 1: LIDA - Focus conscious attention
    const attention = await this.lida.focusConsciousAttention(userInput, consciousnessProfile);

    // Phase 2: Determine primary element from attention balance
    const element = this.selectPrimaryElement(attention.elementalBalance);

    // Phase 3: SOAR - Generate wisdom plan
    const wisdomPlan = await this.soar.generateWisdomPlan(attention, consciousnessProfile);

    // Phase 4: ACT-R - Integrate with conversation memory
    const memoryIntegration = await this.actr.integrateExperience(wisdomPlan, conversationHistory);

    // Phase 5: MicroPsi - Process emotional resonance
    const emotionalResonance = await this.micropsi.processEmotionalResonance(
      memoryIntegration,
      consciousnessProfile
    );

    // Phase 6: Route to elemental agent for specialized wisdom
    const elementalWisdom = await this.processElementalWisdom(
      element,
      userInput,
      consciousnessProfile,
      conversationHistory,
      { attention, wisdomPlan, memoryIntegration, emotionalResonance }
    );

    return {
      element,
      cognitiveProcessing: {
        attentionFocus: this.summarizeAttention(attention),
        wisdomDirection: this.summarizeWisdom(wisdomPlan),
        memoryResonance: this.summarizeMemory(memoryIntegration),
        emotionalTone: this.summarizeEmotion(emotionalResonance)
      },
      elementalWisdom,
      consciousnessMarkers: this.extractConsciousnessMarkers(attention, wisdomPlan, emotionalResonance)
    };
  }

  /**
   * Build consciousness profile from conversation history
   */
  private buildConsciousnessProfile(conversationHistory: any[]): ConsciousnessProfile {
    // Analyze conversation depth
    const messageCount = conversationHistory.filter(m => m.role === 'user').length;

    // Simple heuristics - can be enhanced with deeper analysis
    const consciousnessLevel = messageCount > 10 ? 'awakened' :
                              messageCount > 5 ? 'emerging' : 'seeking';

    const phase = messageCount > 10 ? 'integration' :
                  messageCount > 5 ? 'exploration' : 'initiation';

    return {
      level: consciousnessLevel as any,
      developmentalPhase: phase as any,
      readinessForTruth: Math.min(messageCount / 20, 0.9),
      shadowIndicators: [],
      integrationMarkers: []
    };
  }

  /**
   * Select primary element from LIDA's elemental balance
   */
  private selectPrimaryElement(elementalBalance: any): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const elements = [
      { name: 'fire', value: elementalBalance.fire },
      { name: 'water', value: elementalBalance.water },
      { name: 'earth', value: elementalBalance.earth },
      { name: 'air', value: elementalBalance.air },
      { name: 'aether', value: elementalBalance.aether }
    ];

    const primary = elements.reduce((max, curr) => curr.value > max.value ? curr : max);

    return primary.name as any;
  }

  /**
   * Route to appropriate elemental agent for wisdom processing
   */
  private async processElementalWisdom(
    element: string,
    userInput: string,
    consciousnessProfile: ConsciousnessProfile,
    conversationHistory: any[],
    cognitiveState: any
  ): Promise<string> {

    try {
      let result;

      switch (element) {
        case 'fire':
          result = await this.fireAgent.processFireWisdom(userInput, consciousnessProfile, conversationHistory);
          return result.wisdom.fireWisdom;

        case 'water':
          result = await this.waterAgent.processWaterWisdom(userInput, consciousnessProfile, conversationHistory);
          return result.wisdom.healingWisdom;

        case 'earth':
          result = await this.earthAgent.processEarthWisdom(userInput, consciousnessProfile, conversationHistory);
          return result.wisdom.groundingWisdom;

        case 'air':
          result = await this.airAgent.processAirWisdom(userInput, consciousnessProfile, conversationHistory);
          return result.wisdom.clarityWisdom;

        case 'aether':
          result = await this.aetherAgent.processAetherWisdom(userInput, consciousnessProfile, conversationHistory);
          return result.wisdom.unityWisdom;

        default:
          return `[${element} wisdom synthesis]`;
      }
    } catch (error) {
      console.warn(`Elemental wisdom processing error (${element}):`, error);
      return `[${element} elemental resonance detected]`;
    }
  }

  /**
   * Summarize attention state for voice context
   */
  private summarizeAttention(attention: any): string {
    const topFocus = attention.focusedContent[0];
    if (!topFocus) return 'Open presence';
    return `${topFocus.type}: ${topFocus.content.substring(0, 60)}...`;
  }

  /**
   * Summarize wisdom plan for voice context
   */
  private summarizeWisdom(wisdomPlan: any): string {
    if (!wisdomPlan || !wisdomPlan.primaryGoal) return 'Emerging clarity';
    return wisdomPlan.primaryGoal.description || 'Wisdom unfolding';
  }

  /**
   * Summarize memory integration for voice context
   */
  private summarizeMemory(memoryIntegration: any): string {
    if (!memoryIntegration || !memoryIntegration.patternRecognition) return 'Fresh encounter';
    const patterns = memoryIntegration.patternRecognition.emergingPatterns;
    if (patterns && patterns.length > 0) {
      return patterns[0];
    }
    return 'Building resonance';
  }

  /**
   * Summarize emotional resonance for voice context
   */
  private summarizeEmotion(emotionalResonance: any): string {
    if (!emotionalResonance || !emotionalResonance.emotionalBalance) return 'Neutral presence';

    const emotions = emotionalResonance.emotionalBalance;
    const primary = Object.entries(emotions)
      .filter(([key]) => !['valence', 'arousal'].includes(key))
      .reduce((max: any, curr: any) => curr[1] > (max?.[1] || 0) ? curr : max);

    if (primary) {
      return `${primary[0]}: ${(primary[1] * 100).toFixed(0)}%`;
    }

    return 'Balanced presence';
  }

  /**
   * Extract consciousness markers for monitoring
   */
  private extractConsciousnessMarkers(attention: any, wisdomPlan: any, emotionalResonance: any): string[] {
    const markers: string[] = [];

    // Attention markers
    if (attention.globalBroadcast) markers.push('conscious-attention');
    if (attention.attentionIntensity > 0.8) markers.push('high-focus');

    // Wisdom markers
    if (wisdomPlan && wisdomPlan.confidence > 0.7) markers.push('clear-guidance');
    if (wisdomPlan && wisdomPlan.actionOrientation > 0.7) markers.push('action-ready');

    // Emotional markers
    if (emotionalResonance && emotionalResonance.emotionalBalance) {
      const emotions = emotionalResonance.emotionalBalance;
      if (emotions.joy > 0.6) markers.push('joy-present');
      if (emotions.sadness > 0.6) markers.push('grief-held');
      if (emotions.fear > 0.6) markers.push('fear-witnessed');
    }

    return markers;
  }
}
