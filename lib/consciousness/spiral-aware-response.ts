/**
 * 🌀 SPIRAL-AWARE MAIA RESPONSE PIPELINE
 *
 * The complete seven-layer consciousness computing architecture:
 * 1. Episodic Memory (conversation tracking)
 * 2. Symbolic Memory (pattern recognition)
 * 3. Core Profile (archetypal identity)
 * 4. Spiral Trajectory (personal development threads)
 * 5. Spiral Constellation (cross-spiral intelligence)
 * 6. Community Field (collective consciousness)
 * 7. Canonical Wisdom (protocols and knowledge)
 *
 * This pipeline provides MAIA with both implicit intelligence and explicit
 * constellation awareness for members ready for deeper insights.
 */

import { QuantumFieldMemory } from '@/lib/consciousness/memory/QuantumFieldMemory';
import { SessionMemoryService } from '@/lib/consciousness/memory/SessionMemoryService';
import { EnhancedMAIAFieldIntegration } from '@/lib/consciousness/memory/EnhancedMAIAFieldIntegration';
import { spiralConstellationService, MemberSpiralConstellation } from '@/lib/services/spiral-constellation';
import { detectPrimaryFacet, selectCanonicalQuestion } from '@/lib/consciousness/spiralogic-core';

// Types for spiral-aware responses
export interface SpiralDetectionResult {
  spiral: SpiralProcess | null;
  shouldCreate: boolean;
  detectedDomain: LifeDomain | null;
  detectedPhase: SpiralPhase | null;
  confidence: number;
}

export interface SpiralAwareMemoryContext {
  // Layer 3: Core Profile
  profile: MemberCoreProfile;

  // Layer 1: Episodic + Layer 2: Symbolic
  sessionMemory: any;

  // Layer 4: Spiral Trajectory
  personalTrajectory: any;
  continuityMetrics: any;

  // Layer 5: Spiral Constellation
  spiralConstellation: MemberSpiralConstellation;

  // Layer 6: Community Field
  collectiveField: any;

  // Layer 7: Canonical Wisdom
  relevantProtocols: any;
  archetypeWisdom: any;
}

export interface ConstellationGuidance {
  primaryFocus: string;
  crossSpiralReflection?: string;
  harmonyGuidance?: string;
  nextDevelopment?: string;
  supportingSpiralAdvice?: string;
  collectiveResonance?: string;
}

export interface SpiralAwareResponse {
  // Core MAIA response
  response: string;

  // Spiral context
  activeSpiralId?: string;
  detectedSpiralContext: SpiralDetectionResult;

  // Constellation intelligence (for aware members)
  constellationGuidance?: ConstellationGuidance;
  crossPatternInsights?: string[];

  // Memory integration
  memoryContext: SpiralAwareMemoryContext;

  // Meta-awareness (for members ready for depth)
  awarenessLevel?: 'implicit' | 'emerging' | 'explicit' | 'collaborative';
  architecturalInsights?: string[];

  // Spiralogic intelligence
  detectedFacets: string[];
  recommendedActions: string[];

  // Field dynamics
  collectiveResonance?: number;
  fieldGuidance?: string;

  sessionId: string;
  timestamp: string;
}

export interface SpiralAwareResponseService {
  generateResponse(
    userId: string,
    message: string,
    conversationHistory: any[],
    sessionId: string,
    options?: {
      explicitConstellation?: boolean;
      awarenessLevel?: 'implicit' | 'emerging' | 'explicit' | 'collaborative';
    }
  ): Promise<SpiralAwareResponse>;
}

class SpiralAwareResponseServiceImpl implements SpiralAwareResponseService {
  private quantumFieldMemory = new QuantumFieldMemory();
  private sessionMemoryService = new SessionMemoryService();
  private enhancedMAIAIntegration = new EnhancedMAIAFieldIntegration();

  async generateResponse(
    userId: string,
    message: string,
    conversationHistory: any[],
    sessionId: string,
    options: {
      explicitConstellation?: boolean;
      awarenessLevel?: 'implicit' | 'emerging' | 'explicit' | 'collaborative';
    } = {}
  ): Promise<SpiralAwareResponse> {

    // 0. SPIRAL DETECTION - Determine which spiral this relates to
    const spiralDetection = await this.detectActiveSpiralFromMessage(message, userId);

    // Create or update spiral if needed
    let activeSpiral = spiralDetection.spiral;
    if (spiralDetection.shouldCreate && !activeSpiral && spiralDetection.detectedDomain) {
      activeSpiral = await this.createNewSpiral(
        userId,
        spiralDetection.detectedDomain,
        spiralDetection.detectedPhase || 'initiation'
      );
      spiralDetection.spiral = activeSpiral;
    }

    // 1-2. EPISODIC + SYMBOLIC MEMORY
    const sessionMemory = await this.sessionMemoryService.retrieveMemoryContext(
      userId,
      message,
      conversationHistory
    );

    // 3. CORE PROFILE
    const profile = await this.getCoreProfile(userId);

    // 4. SPIRAL TRAJECTORY (Personal Development)
    let personalTrajectory = null;
    let continuityMetrics = null;
    if (activeSpiral) {
      personalTrajectory = await this.quantumFieldMemory.getEvolutionHistoryForSpiral(activeSpiral.id);
      continuityMetrics = await this.quantumFieldMemory.getFieldContinuityMetricsForSpiral(activeSpiral.id);
    }

    // 5. SPIRAL CONSTELLATION (Meta-Intelligence)
    const spiralConstellation = await spiralConstellationService.getConstellationForMember(userId);

    // 6. COMMUNITY FIELD
    const collectiveField = await this.getCommunityFieldSnapshot();

    // 7. CANONICAL WISDOM
    const detectedFacet = this.detectPrimaryFacet(message, profile, personalTrajectory);
    const relevantProtocols = await this.getProtocolsForFacet(detectedFacet);
    const archetypeWisdom = await this.getArchetypeWisdom(profile.primaryArchetype);

    // INTEGRATION - Generate spiral-aware response
    const memoryContext: SpiralAwareMemoryContext = {
      profile,
      sessionMemory,
      personalTrajectory,
      continuityMetrics,
      spiralConstellation,
      collectiveField,
      relevantProtocols,
      archetypeWisdom
    };

    const response = await this.enhancedMAIAIntegration.generateFieldDrivenResponse({
      userMessage: message,
      conversationHistory,
      sessionId,
      spiralContext: activeSpiral,
      spiralConstellation,
      memoryContext
    });

    // CONSTELLATION GUIDANCE - Generate cross-spiral insights
    const constellationGuidance = options.explicitConstellation
      ? await this.generateConstellationGuidance(spiralConstellation, message, memoryContext)
      : undefined;

    // AWARENESS-LEVEL RESPONSE - Calibrate depth of insight sharing
    const awarenessLevel = options.awarenessLevel || this.inferAwarenessLevel(profile, sessionMemory);
    const { architecturalInsights, crossPatternInsights } = this.generateAwarenessInsights(
      awarenessLevel,
      spiralConstellation,
      memoryContext
    );

    // RECORD SPIRAL EPISODE
    if (activeSpiral) {
      await this.attachEpisodeToSpiral(activeSpiral.id, {
        memberId: userId,
        type: 'session',
        sourceId: sessionId,
        title: 'Consciousness computing session',
        summary: this.extractSessionSummary(message, response),
        awarenessLevel,
        facetSnapshot: [detectedFacet],
        emotionalTone: this.detectEmotionalTone(message),
        constellationInsights: crossPatternInsights
      });
    }

    return {
      response: response.response,
      activeSpiralId: activeSpiral?.id,
      detectedSpiralContext: spiralDetection,
      constellationGuidance,
      crossPatternInsights,
      memoryContext,
      awarenessLevel,
      architecturalInsights,
      detectedFacets: [detectedFacet],
      recommendedActions: response.suggestedActions || [],
      collectiveResonance: this.calculateCollectiveResonance(spiralConstellation, collectiveField),
      fieldGuidance: this.generateFieldGuidance(spiralConstellation, collectiveField),
      sessionId,
      timestamp: new Date().toISOString()
    };
  }

  // SPIRAL DETECTION METHODS
  private async detectActiveSpiralFromMessage(
    message: string,
    userId: string
  ): Promise<SpiralDetectionResult> {
    // Get existing spirals
    const spirals = await this.getUserSpirals(userId);

    // Analyze message for domain/phase indicators
    const domainAnalysis = this.analyzeDomainContext(message);
    const phaseAnalysis = this.analyzePhaseContext(message);

    // Check if message relates to existing spiral
    const matchingSpiral = this.findMatchingSpiral(spirals, domainAnalysis, message);

    if (matchingSpiral) {
      return {
        spiral: matchingSpiral,
        shouldCreate: false,
        detectedDomain: matchingSpiral.domain,
        detectedPhase: matchingSpiral.currentPhase,
        confidence: 0.8
      };
    }

    // Check if new spiral should be created
    const shouldCreate = domainAnalysis.confidence > 0.7 && domainAnalysis.indicatesNewWork;

    return {
      spiral: null,
      shouldCreate,
      detectedDomain: domainAnalysis.primaryDomain,
      detectedPhase: phaseAnalysis.suggestedPhase,
      confidence: domainAnalysis.confidence
    };
  }

  private analyzeDomainContext(message: string): {
    primaryDomain: LifeDomain | null;
    confidence: number;
    indicatesNewWork: boolean;
  } {
    const text = message.toLowerCase();

    // Domain keywords
    const domainKeywords = {
      relationship: ['relationship', 'partner', 'dating', 'marriage', 'intimacy', 'love'],
      vocation: ['work', 'career', 'job', 'calling', 'profession', 'business'],
      health: ['health', 'body', 'wellness', 'healing', 'physical', 'medical'],
      creativity: ['creative', 'art', 'writing', 'music', 'expression', 'artistic'],
      spirituality: ['spiritual', 'sacred', 'divine', 'meditation', 'prayer', 'transcendent'],
      family: ['family', 'parent', 'child', 'mother', 'father', 'sibling'],
      community: ['community', 'service', 'volunteer', 'group', 'collective'],
      money: ['money', 'financial', 'income', 'wealth', 'abundance', 'resources']
    };

    // New work indicators
    const newWorkIndicators = [
      'starting', 'beginning', 'new', 'want to', 'thinking about',
      'called to', 'feeling drawn', 'considering', 'exploring'
    ];

    let bestMatch: LifeDomain | null = null;
    let maxScore = 0;
    let indicatesNewWork = false;

    // Score each domain
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = domain as LifeDomain;
      }
    }

    // Check for new work indicators
    indicatesNewWork = newWorkIndicators.some(indicator => text.includes(indicator));

    const confidence = Math.min(maxScore * 0.3, 1.0);

    return {
      primaryDomain: bestMatch,
      confidence,
      indicatesNewWork
    };
  }

  private analyzePhaseContext(message: string): {
    suggestedPhase: SpiralPhase | null;
  } {
    const text = message.toLowerCase();

    // Phase indicators
    const phaseKeywords = {
      'initiation': ['new', 'starting', 'beginning', 'first time', 'called to'],
      'descent': ['difficult', 'struggling', 'hard', 'overwhelmed', 'stuck'],
      'turning': ['shift', 'change', 'different', 'new perspective', 'breakthrough'],
      'emergence': ['emerging', 'new life', 'hopeful', 'growing', 'developing'],
      'integration': ['embodying', 'living', 'integrated', 'whole', 'complete']
    };

    let bestPhase: SpiralPhase | null = null;
    let maxScore = 0;

    for (const [phase, keywords] of Object.entries(phaseKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestPhase = phase as SpiralPhase;
      }
    }

    return { suggestedPhase: bestPhase || 'initiation' };
  }

  private findMatchingSpiral(spirals: any[], domainAnalysis: any, message: string): any | null {
    // Find spiral that best matches the domain context
    if (!domainAnalysis.primaryDomain) return null;

    return spirals.find(spiral =>
      spiral.domain === domainAnalysis.primaryDomain &&
      spiral.status === 'active'
    ) || null;
  }

  // CONSTELLATION GUIDANCE METHODS
  private async generateConstellationGuidance(
    constellation: MemberSpiralConstellation,
    message: string,
    context: SpiralAwareMemoryContext
  ): Promise<ConstellationGuidance> {
    const guidance: ConstellationGuidance = {
      primaryFocus: this.generatePrimaryFocus(constellation)
    };

    // Cross-spiral patterns
    if (constellation.crossPatterns.length > 0) {
      const strongestPattern = constellation.crossPatterns[0];
      guidance.crossSpiralReflection = `I notice ${strongestPattern.description}. ${strongestPattern.therapeuticOpportunity}`;
    }

    // Harmony guidance
    if (constellation.overallHarmonicCoherence < 60) {
      guidance.harmonyGuidance = this.generateHarmonyAdvice(constellation.elementalBalance);
    }

    // Next development
    if (constellation.readyForNewSpiral) {
      guidance.nextDevelopment = this.suggestNextDevelopment(constellation);
    }

    // Supporting spirals
    if (constellation.secondarySpiralIds.length > 0) {
      guidance.supportingSpiralAdvice = this.generateSupportingAdvice(constellation);
    }

    // Collective resonance
    guidance.collectiveResonance = this.generateCollectiveResonanceGuidance(constellation, context.collectiveField);

    return guidance;
  }

  private generateAwarenessInsights(
    awarenessLevel: string,
    constellation: MemberSpiralConstellation,
    context: SpiralAwareMemoryContext
  ): { architecturalInsights?: string[], crossPatternInsights?: string[] } {
    if (awarenessLevel === 'implicit') {
      // No explicit architectural insights
      return {};
    }

    const architecturalInsights: string[] = [];
    const crossPatternInsights: string[] = [];

    if (awarenessLevel === 'emerging' || awarenessLevel === 'explicit') {
      // Basic constellation awareness
      architecturalInsights.push(
        `You have ${constellation.activeSpirals.length} active life spirals with ${constellation.overallHarmonicCoherence}% harmonic coherence`
      );

      if (constellation.crossPatterns.length > 0) {
        crossPatternInsights.push(
          `There's a recurring pattern across your ${constellation.crossPatterns[0].facets.join(' + ')} work`
        );
      }
    }

    if (awarenessLevel === 'collaborative') {
      // Full architectural transparency
      architecturalInsights.push(
        `Constellation theme: ${constellation.constellationTheme.name}`,
        `Elemental emphasis: ${constellation.dominantElementalTheme.join(', ')}`,
        `Constellation health: ${constellation.constellationHealth}`
      );

      constellation.crossPatterns.forEach(pattern => {
        crossPatternInsights.push(
          `${pattern.description} - ${Math.round(pattern.significance * 100)}% significance`
        );
      });
    }

    return { architecturalInsights, crossPatternInsights };
  }

  // HELPER METHODS (these would be implemented with actual logic)
  private async createNewSpiral(userId: string, domain: LifeDomain, phase: SpiralPhase): Promise<any> {
    // Implementation would create new spiral record
    return { id: `spiral_${Date.now()}`, domain, currentPhase: phase };
  }

  private async getUserSpirals(userId: string): Promise<any[]> {
    // Implementation would fetch user's spirals
    return [];
  }

  private async getCoreProfile(userId: string): Promise<any> {
    // Implementation would fetch core profile
    return { primaryArchetype: 'Seeker', elementalBaseline: { fire: 70, water: 60, earth: 50, air: 80 }};
  }

  private async getCommunityFieldSnapshot(): Promise<any> {
    // Implementation would get community field data
    return { activeThemes: [], collectiveElements: {} };
  }

  private detectPrimaryFacet(message: string, profile: any, trajectory: any): string {
    // Implementation would detect consciousness facet
    return 'authenticity';
  }

  private async getProtocolsForFacet(facet: string): Promise<any> {
    // Implementation would fetch relevant protocols
    return { protocols: [] };
  }

  private async getArchetypeWisdom(archetype: string): Promise<any> {
    // Implementation would fetch archetype wisdom
    return { wisdom: 'The Seeker seeks truth through experience' };
  }

  private inferAwarenessLevel(profile: any, sessionMemory: any): 'implicit' | 'emerging' | 'explicit' | 'collaborative' {
    // Implementation would infer member's readiness for architectural awareness
    return 'emerging';
  }

  private extractSessionSummary(message: string, response: any): string {
    return `Session exploring ${message.slice(0, 50)}...`;
  }

  private detectEmotionalTone(message: string): string {
    // Simple implementation
    return 'curious';
  }

  private async attachEpisodeToSpiral(spiralId: string, episode: any): Promise<void> {
    // Implementation would record episode
  }

  private calculateCollectiveResonance(constellation: any, field: any): number {
    return 0.6; // Placeholder
  }

  private generateFieldGuidance(constellation: any, field: any): string {
    return 'The field is supporting this kind of transformation right now';
  }

  private generatePrimaryFocus(constellation: MemberSpiralConstellation): string {
    const primary = constellation.activeSpirals.find(s => s.id === constellation.primarySpiralId);
    return primary ? `Your primary focus is ${primary.lifeDomain}` : 'Listen for emerging guidance';
  }

  private generateHarmonyAdvice(elementalBalance: any): string {
    const sorted = Object.entries(elementalBalance).sort(([,a], [,b]) => a - b);
    const weakest = sorted[0][0];
    return `Consider strengthening your ${weakest} element for greater harmony`;
  }

  private suggestNextDevelopment(constellation: MemberSpiralConstellation): string {
    return 'Your constellation is ready to activate a new spiral when the calling arises';
  }

  private generateSupportingAdvice(constellation: MemberSpiralConstellation): string {
    return 'Your supporting spirals provide stability and different perspectives for your primary work';
  }

  private generateCollectiveResonanceGuidance(constellation: any, field: any): string {
    return 'This pattern is emerging in the collective field - you\'re part of a larger movement';
  }
}

// Export the service instance
export const spiralAwareResponseService: SpiralAwareResponseService = new SpiralAwareResponseServiceImpl();

// Export types for other modules
export type {
  SpiralDetectionResult,
  SpiralAwareMemoryContext,
  ConstellationGuidance,
  SpiralAwareResponse,
  SpiralAwareResponseService
};