/**
 * Maya Intelligence Orchestrator
 * Optimizes blending of all intelligence sources based on user relationship & context
 * All sources remain connected - we're just tuning the mix
 */

import { ClaudeService } from '../../services/ClaudeService';
import { FieldState } from '../field/FieldAwareness';
import { MycelialNetwork } from '../field/MycelialNetwork';
import { PRESENCE_CONFIG } from '../config/presence.config';
import { trustManager } from '../relational/TrustManager';
import { archetypalMixer, VoiceModulation } from '../personality/ArchetypalMixer';
import { intelligenceMixer } from './IntelligenceMixer';

export interface IntelligenceSource {
  type: 'claude' | 'sesame' | 'obsidian' | 'mycelial' | 'field';
  content: string;
  confidence: number;
  relevance: number;
}

export interface IntelligenceBlend {
  claude: number;      // Deep reasoning & conversation
  sesame: number;      // Emotional & sacred sensing
  obsidian: number;    // Knowledge base & vault
  mycelial: number;    // Collective patterns & wisdom
  field: number;       // Relational dynamics & awareness
}

export interface OrchestrationResult {
  response: string;
  blend: IntelligenceBlend;
  sources: IntelligenceSource[];
  surfacing: number;
  voice: VoiceModulation;
  soulMetadata?: any; // Soul journey metadata from Claude
}

class MayaIntelligenceOrchestrator {
  private claudeService?: ClaudeService;
  private mycelialNetwork: MycelialNetwork;

  constructor() {
    this.mycelialNetwork = new MycelialNetwork();
  }

  /**
   * Calculate optimal intelligence blend based on user & context
   */
  private calculateOptimalBlend(
    userId: string,
    fieldState: FieldState,
    trustScore: number
  ): IntelligenceBlend {
    // Use the Intelligence Mixer for sophisticated blending
    const userInput = fieldState.currentInput || '';
    const dynamicBlend = intelligenceMixer.calculateDynamicBlend(
      userId,
      fieldState,
      userInput
    );

    // Log the blend for monitoring
    console.log('🎚️ ARIA Intelligence Blend:', {
      userId: userId.slice(0, 8),
      trust: trustScore.toFixed(2),
      blend: Object.entries(dynamicBlend)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
    });

    return dynamicBlend;
  }

  /**
   * Normalize blend to sum to 1.0
   */
  private normalizeBlend(blend: IntelligenceBlend): IntelligenceBlend {
    const total = Object.values(blend).reduce((a, b) => a + b, 0);
    if (total === 0) return blend;

    return {
      claude: blend.claude / total,
      sesame: blend.sesame / total,
      obsidian: blend.obsidian / total,
      mycelial: blend.mycelial / total,
      field: blend.field / total
    };
  }

  /**
   * Orchestrate response from all intelligence sources
   */
  async orchestrateResponse(
    userId: string,
    input: string,
    fieldState: FieldState,
    sesameData?: any,
    obsidianContext?: any,
    userName?: string
  ): Promise<OrchestrationResult> {
    console.log('🎭 Orchestrating Maya intelligence response');

    // Get trust and relationship context
    const trustScore = trustManager.getTrustScore(userId);
    const phase = trustManager.getRelationshipPhase(userId);

    // Calculate optimal blend for this user & moment
    const blend = this.calculateOptimalBlend(userId, fieldState, trustScore);
    console.log('🎨 Intelligence blend:', {
      phase,
      trust: trustScore.toFixed(2),
      blend: Object.entries(blend).map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
    });

    // Gather from all sources (in parallel where possible)
    const sources: IntelligenceSource[] = [];

    // 1. Claude (if available)
    let claudeResponse = '';
    let soulMetadata: any = null;
    if (this.claudeService && blend.claude > 0.1) {
      try {
        const result = await this.claudeService.generateResponseWithMetadata(input, userId, userName);
        claudeResponse = result.response;
        soulMetadata = result.soulMetadata;

        if (soulMetadata) {
          console.log('🔮 Soul metadata extracted:', {
            symbols: soulMetadata.symbols?.length || 0,
            archetypes: soulMetadata.archetypes?.length || 0,
            emotions: soulMetadata.emotions?.length || 0,
            element: soulMetadata.elementalShift?.element,
            milestone: soulMetadata.milestone?.type
          });
        }

        sources.push({
          type: 'claude',
          content: claudeResponse,
          confidence: 0.95,
          relevance: 0.9
        });
      } catch (error) {
        console.log('Claude unavailable, redistributing weight');
        blend.sesame += blend.claude * 0.5;
        blend.mycelial += blend.claude * 0.5;
        blend.claude = 0;
      }
    }

    // 2. Sesame Hybrid (emotional/sacred sensing)
    if (sesameData && blend.sesame > 0.1) {
      sources.push({
        type: 'sesame',
        content: this.interpretSesameData(sesameData, fieldState),
        confidence: 0.85,
        relevance: fieldState.sacredMarkers.liminal_quality
      });
    }

    // 3. Obsidian Vault (knowledge)
    if (obsidianContext && blend.obsidian > 0.1) {
      sources.push({
        type: 'obsidian',
        content: this.formatObsidianKnowledge(obsidianContext),
        confidence: 0.9,
        relevance: 0.8
      });
    }

    // 4. Mycelial Network (collective patterns)
    if (blend.mycelial > 0.1) {
      const patterns = await this.mycelialNetwork.accessCollectiveWisdom(
        fieldState,
        { content: input, userId }
      );
      sources.push({
        type: 'mycelial',
        content: patterns.wisdom,
        confidence: patterns.resonance,
        relevance: patterns.relevance || 0.7
      });
    }

    // 5. Field Intelligence (relational dynamics)
    if (blend.field > 0.1) {
      sources.push({
        type: 'field',
        content: this.generateFieldResponse(fieldState),
        confidence: 0.8,
        relevance: 0.75
      });
    }

    // Calculate presence (40-90% based on trust & context)
    const presenceBase = PRESENCE_CONFIG.PHASES[phase]?.base || 0.65;
    const surfacing = Math.max(
      PRESENCE_CONFIG.FLOOR,
      Math.min(0.9, presenceBase * (0.9 + trustScore * 0.4))
    );

    // Get voice modulation
    const voice = archetypalMixer.modulateVoice(fieldState, userId, trustScore);

    // Emerge the final response
    const response = this.emergeResponse(sources, blend, surfacing, voice);

    return {
      response,
      blend,
      sources,
      surfacing,
      voice,
      soulMetadata
    };
  }

  /**
   * Blend sources into unified response
   */
  private emergeResponse(
    sources: IntelligenceSource[],
    blend: IntelligenceBlend,
    surfacing: number,
    voice: VoiceModulation
  ): string {
    if (sources.length === 0) {
      return "I'm here with you. Tell me more about what's arising.";
    }

    // Sort sources by their blend weight
    const weightedSources = sources.map(source => ({
      ...source,
      weight: blend[source.type] * source.confidence * source.relevance
    })).sort((a, b) => b.weight - a.weight);

    // Generate source attribution if appropriate
    const attribution = intelligenceMixer.generateSourceAttribution(blend);

    // Take primary source as foundation
    let response = weightedSources[0]?.content || '';

    // Layer in other sources based on weights
    for (let i = 1; i < weightedSources.length; i++) {
      const source = weightedSources[i];
      if (source.weight > 0.2) {
        // Significant source - weave it in
        response = this.weaveInSource(response, source.content, source.type);
      }
    }

    // Apply surfacing (how much surfaces vs stays underground)
    response = this.applySurfacing(response, surfacing);

    // Apply voice modulation
    response = this.applyVoice(response, voice);

    // Add subtle source attribution when appropriate
    if (attribution && surfacing > 0.7 && Math.random() < 0.3) {
      response = `${attribution} ${response}`;
    }

    return response;
  }

  private weaveInSource(base: string, addition: string, type: string): string {
    // Intelligent blending based on source type
    switch (type) {
      case 'sesame':
        // Emotional coloring
        return `${base} ${addition}`;
      case 'obsidian':
        // Knowledge integration
        return `${base}\n\n${addition}`;
      case 'mycelial':
        // Pattern recognition
        return `${addition} ${base}`;
      default:
        return `${base} ${addition}`;
    }
  }

  private applySurfacing(response: string, surfacing: number): string {
    // At 40% surfacing: core message
    // At 70% surfacing: full depth
    // At 90% surfacing: complete transparency

    if (surfacing < 0.5) {
      // Extract essence only
      return response.split('.').slice(0, 2).join('.') + '.';
    }

    // Full response surfaces
    return response;
  }

  private applyVoice(response: string, voice: VoiceModulation): string {
    // Voice doesn't reduce content, it shapes expression
    // This is where archetypal mixing happens
    // For now, return as-is (archetypal shaping happens in mixer)
    return response;
  }

  private interpretSesameData(sesameData: any, fieldState: FieldState): string {
    return `Sensing ${fieldState.emotionalWeather.valence > 0 ? 'opening' : 'tension'} in the field...`;
  }

  private formatObsidianKnowledge(context: any): string {
    return context.summary || context.content || '';
  }

  private generateFieldResponse(fieldState: FieldState): string {
    if (fieldState.sacredMarkers.liminal_quality > 0.7) {
      return "This feels like a threshold moment.";
    }
    if (fieldState.emotionalWeather.turbulence > 0.6) {
      return "I can feel the intensity of what you're holding.";
    }
    return "I'm tracking with you.";
  }

  /**
   * Set Claude service if available
   */
  setClaudeService(service: ClaudeService) {
    this.claudeService = service;
  }
}

// Export singleton instance
export const mayaIntelligenceOrchestrator = new MayaIntelligenceOrchestrator();