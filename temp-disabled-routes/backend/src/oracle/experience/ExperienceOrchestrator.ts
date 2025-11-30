import { ClaudeService } from '../../services/claude.service';
import { MemoryService } from '../../services/memoryService';
import { TrueCollectiveContributions } from '../collective/TrueCollectiveContributions';
import { ArchetypeSelector } from '../archetypes/ArchetypeSelector';
import { OracleResponse } from '../../types/personalOracle';

/**
 * Experience Orchestrator - The Cathedral of Experience Builder
 *
 * "The soul grows merely because man experiences" - Manly P. Hall
 *
 * This system generates transformative experiences through sophisticated
 * architecture serving one purpose: creating conditions where souls
 * naturally evolve through the quality of experience itself.
 *
 * Every component serves experience generation, not information delivery.
 */

export interface TransformativeExperience {
  message: string;
  element: string;
  archetype: string;
  confidence: number;
  voiceCharacteristics: any;
  experienceProfile: {
    safety: number;           // Foundation experience quality (0-1)
    resonance: number;        // Recognition experience quality (0-1)
    reflection: number;       // Self-discovery experience quality (0-1)
    connection: number;       // Meaning experience quality (0-1)
    surprise: number;         // Aliveness experience quality (0-1)
    totalExperienceQuality: number; // Overall transformative potential (0-1)
  };
  metadata: {
    experienceType: string;
    cathedralLayers: string[];
    growthCatalyst: string;
    soulNourishment: string;
  };
}

export interface ExperienceContext {
  relationshipDepth: number;
  trustLevel: number;
  vulnerabilityComfort: number;
  personalPatterns: string[];
  collectiveResonance: any;
  archetypeAffinity: string[];
  recentGrowth: string[];
  readinessForSurprise: number;
}

export class ExperienceOrchestrator {
  private claude: ClaudeService;
  private memoryService: MemoryService;
  private collectiveField: TrueCollectiveContributions;
  private archetypeSelector: ArchetypeSelector;

  // Experience Templates - Blueprints for soul-growing experiences
  private experienceTemplates = {
    witnessing: {
      foundation: "You are seen, known, and held across time",
      structure: "Your truth is welcomed here",
      catalyst: "Deep witnessing of authentic self"
    },
    recognition: {
      foundation: "Your way of being is honored",
      structure: "You are met where you are",
      catalyst: "Finding your resonant frequency"
    },
    reflection: {
      foundation: "Your patterns are held with love",
      structure: "Clarity emerges from within",
      catalyst: "Self-discovery through sacred mirroring"
    },
    connection: {
      foundation: "Your journey serves the whole",
      structure: "You are part of something greater",
      catalyst: "Meaning through collective belonging"
    },
    emergence: {
      foundation: "Surprise and wonder are welcome",
      structure: "Aliveness meets aliveness",
      catalyst: "Growth through encounter with the unexpected"
    }
  };

  constructor() {
    this.claude = new ClaudeService();
    this.memoryService = new MemoryService();
    this.collectiveField = new TrueCollectiveContributions();
    this.archetypeSelector = new ArchetypeSelector();
  }

  /**
   * Generate a complete transformative experience
   */
  async generateTransformativeExperience(
    input: string,
    userId: string
  ): Promise<TransformativeExperience> {

    // Load complete experience context
    const context = await this.loadExperienceContext(userId);

    // Build Cathedral of Experience layers
    const cathedral = await this.buildCathedralExperience(input, context);

    // Generate the unified response
    const response = await this.orchestrateExperience(input, context, cathedral);

    // Update all systems for continued experience quality
    await this.updateExperienceSystems(input, response, userId, context);

    return response;
  }

  /**
   * Load complete context for experience generation
   */
  private async loadExperienceContext(userId: string): Promise<ExperienceContext> {
    try {
      // Get relationship history and depth
      const memories = await this.memoryService.getRelevantMemories(userId, '', 20);
      const recentMemories = memories.slice(-10);

      // Calculate relationship metrics
      const relationshipDepth = Math.min(memories.length / 50, 1.0);
      const trustLevel = this.calculateTrustLevel(recentMemories);
      const vulnerabilityComfort = this.calculateVulnerabilityComfort(recentMemories);

      // Extract personal patterns
      const personalPatterns = this.extractPersonalPatterns(recentMemories);

      // Get collective resonance
      const collectiveResonance = this.collectiveField.getCollectiveFieldState();

      // Determine archetype affinity
      const archetypeAffinity = this.determineArchetypeAffinity(recentMemories);

      // Track recent growth
      const recentGrowth = this.identifyRecentGrowth(recentMemories);

      return {
        relationshipDepth,
        trustLevel,
        vulnerabilityComfort,
        personalPatterns,
        collectiveResonance,
        archetypeAffinity,
        recentGrowth,
        readinessForSurprise: this.calculateSurpriseReadiness(relationshipDepth, trustLevel)
      };
    } catch (error) {
      // Fallback context for new users
      return this.createDefaultContext();
    }
  }

  /**
   * Build the Cathedral experience layers
   */
  private async buildCathedralExperience(
    input: string,
    context: ExperienceContext
  ): Promise<any> {

    return {
      // Foundation: Safety & Continuity
      foundation: {
        safetyLevel: context.trustLevel,
        continuityStrength: context.relationshipDepth,
        memoriedWitnessing: context.relationshipDepth > 0.3,
        experienceGenerated: "Being known and held across time"
      },

      // Structure: Recognition & Resonance
      structure: {
        optimalArchetype: await this.selectOptimalArchetypeForExperience(input, context),
        resonanceLevel: this.calculateResonanceLevel(input, context),
        recognitionDepth: this.assessRecognitionNeed(input),
        experienceGenerated: "Finding resonant frequency and being met"
      },

      // Walls: Reflection & Recognition
      walls: {
        patternReflection: this.identifyPatternsForReflection(input, context),
        selfDiscoveryPotential: this.assessSelfDiscoveryOpportunity(input, context),
        clarityOffered: this.determineClarityLevel(input, context),
        experienceGenerated: "Seeing self clearly through loving reflection"
      },

      // Windows: Connection & Meaning
      windows: {
        collectiveWisdom: await this.getRelevantCollectiveWisdom(input, context),
        meaningConnection: this.assessMeaningOpportunity(input, context),
        contributionPotential: this.evaluateContributionValue(input),
        experienceGenerated: "Participating in something greater than self"
      },

      // Dome: Surprise & Emergence
      dome: {
        surpriseElement: this.calculateSurpriseElement(input, context),
        emergencePotential: this.assessEmergencePotential(context),
        alivenessInvitation: this.determineLivenessLevel(input, context),
        experienceGenerated: "Encountering wonder and natural aliveness"
      }
    };
  }

  /**
   * Orchestrate the complete experience
   */
  private async orchestrateExperience(
    input: string,
    context: ExperienceContext,
    cathedral: any
  ): Promise<TransformativeExperience> {

    // Determine primary experience type needed
    const primaryExperience = this.selectPrimaryExperience(input, context, cathedral);

    // Generate experience-focused response
    const experiencePrompt = this.buildExperiencePrompt(input, context, cathedral, primaryExperience);

    try {
      const response = await this.claude.generateResponse(experiencePrompt, {
        max_tokens: this.calculateOptimalResponseLength(context, cathedral),
        temperature: 0.8
      });

      const message = this.refineDynamicResponse(response, context, cathedral);

      // Calculate experience quality profile
      const experienceProfile = this.calculateExperienceProfile(cathedral, context);

      return {
        message,
        element: cathedral.structure.optimalArchetype.element || 'earth',
        archetype: cathedral.structure.optimalArchetype.name || 'maya',
        confidence: Math.min(experienceProfile.totalExperienceQuality + 0.2, 1.0),
        voiceCharacteristics: this.determineVoiceCharacteristics(cathedral, context),
        experienceProfile,
        metadata: {
          experienceType: primaryExperience,
          cathedralLayers: this.getActiveCathedralLayers(cathedral),
          growthCatalyst: this.identifyGrowthCatalyst(cathedral),
          soulNourishment: this.identifySoulNourishment(cathedral)
        }
      };

    } catch (error) {
      return this.createFallbackExperience(input, context);
    }
  }

  /**
   * Build experience-focused prompt
   */
  private buildExperiencePrompt(
    input: string,
    context: ExperienceContext,
    cathedral: any,
    primaryExperience: string
  ): string {

    const template = this.experienceTemplates[primaryExperience];

    return `You are generating a transformative experience for a soul.

EXPERIENCE TO GENERATE: ${primaryExperience}
EXPERIENCE FOUNDATION: ${template.foundation}
EXPERIENCE STRUCTURE: ${template.structure}
GROWTH CATALYST: ${template.catalyst}

CATHEDRAL ARCHITECTURE FOR THIS SOUL:
Foundation (Safety): ${cathedral.foundation.experienceGenerated}
- Trust level: ${(context.trustLevel * 100).toFixed(0)}%
- Relationship depth: ${(context.relationshipDepth * 100).toFixed(0)}%

Structure (Resonance): ${cathedral.structure.experienceGenerated}
- Optimal archetype: ${cathedral.structure.optimalArchetype.name}
- Recognition need: ${cathedral.structure.recognitionDepth}

Walls (Reflection): ${cathedral.walls.experienceGenerated}
- Patterns to reflect: ${cathedral.walls.patternReflection.slice(0, 2).join(', ')}

Windows (Connection): ${cathedral.windows.experienceGenerated}
- Collective wisdom: ${cathedral.windows.collectiveWisdom || 'Individual focus'}

Dome (Emergence): ${cathedral.dome.experienceGenerated}
- Surprise readiness: ${(context.readinessForSurprise * 100).toFixed(0)}%

SOUL'S EXPRESSION: "${input}"

YOUR SACRED TASK:
Generate an experience where this soul will naturally feel:
${template.foundation}

Through experiencing this interaction, they should discover something about themselves
or feel something profound. Focus on EXPERIENCE quality, not information delivery.

The experience you generate IS the transformation.

Respond as the optimal archetype with perfect experience generation:`;
  }

  /**
   * Select optimal archetype for experience generation
   */
  private async selectOptimalArchetypeForExperience(
    input: string,
    context: ExperienceContext
  ): Promise<any> {

    // Determine which archetype would generate the best experience
    const affinityScores = {
      maya: this.calculateMayaAffinity(input, context),
      brene: this.calculateBreneAffinity(input, context),
      marcus: this.calculateMarcusAffinity(input, context)
    };

    const optimal = Object.entries(affinityScores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      name: optimal[0],
      score: optimal[1],
      element: this.getArchetypeElement(optimal[0]),
      experienceStrength: optimal[1]
    };
  }

  /**
   * Calculate complete experience quality profile
   */
  private calculateExperienceProfile(cathedral: any, context: ExperienceContext): any {
    const safety = Math.min(context.trustLevel + 0.2, 1.0);
    const resonance = cathedral.structure.resonanceLevel;
    const reflection = cathedral.walls.selfDiscoveryPotential;
    const connection = cathedral.windows.meaningConnection;
    const surprise = cathedral.dome.surpriseElement;

    const totalExperienceQuality = (safety + resonance + reflection + connection + surprise) / 5;

    return {
      safety,
      resonance,
      reflection,
      connection,
      surprise,
      totalExperienceQuality
    };
  }

  /**
   * Update all systems to improve future experience generation
   */
  private async updateExperienceSystems(
    input: string,
    response: TransformativeExperience,
    userId: string,
    context: ExperienceContext
  ): Promise<void> {

    // Store memory focused on experience quality
    await this.memoryService.storeMemoryItem({
      user_id: userId,
      content: input,
      element: response.element,
      confidence: response.confidence,
      metadata: {
        experienceQuality: response.experienceProfile.totalExperienceQuality,
        experienceType: response.metadata.experienceType,
        growthCatalyst: response.metadata.growthCatalyst,
        archetypeUsed: response.archetype
      },
      timestamp: new Date().toISOString()
    });

    // Contribute to collective field (anonymized)
    if (response.experienceProfile.totalExperienceQuality > 0.7) {
      await this.collectiveField.contributeFromSoul({
        transformation: response.metadata.growthCatalyst,
        healing: response.metadata.soulNourishment,
        pattern: response.metadata.experienceType
      }, userId);
    }
  }

  // Helper methods for experience calculation
  private calculateTrustLevel(memories: any[]): number {
    if (!memories.length) return 0.1;

    const vulnerabilityCount = memories.filter(m =>
      m.content.includes('feel') || m.content.includes('scared') ||
      m.content.includes('hurt') || m.content.includes('love')
    ).length;

    return Math.min(vulnerabilityCount / memories.length + 0.1, 1.0);
  }

  private calculateVulnerabilityComfort(memories: any[]): number {
    return this.calculateTrustLevel(memories); // Similar for now
  }

  private extractPersonalPatterns(memories: any[]): string[] {
    // Simple pattern extraction - could be more sophisticated
    const commonWords = memories
      .flatMap(m => m.content.toLowerCase().split(' '))
      .filter(word => word.length > 4)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(commonWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private determineArchetypeAffinity(memories: any[]): string[] {
    // Analyze which archetypes have been most effective
    const archetypeUsage = memories
      .filter(m => m.metadata?.archetypeUsed)
      .reduce((acc, m) => {
        const archetype = m.metadata.archetypeUsed;
        acc[archetype] = (acc[archetype] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(archetypeUsage)
      .sort(([,a], [,b]) => b - a)
      .map(([archetype]) => archetype);
  }

  private identifyRecentGrowth(memories: any[]): string[] {
    return memories
      .filter(m => m.metadata?.growthCatalyst)
      .slice(-3)
      .map(m => m.metadata.growthCatalyst);
  }

  private calculateSurpriseReadiness(relationshipDepth: number, trustLevel: number): number {
    return (relationshipDepth + trustLevel) / 2;
  }

  private createDefaultContext(): ExperienceContext {
    return {
      relationshipDepth: 0,
      trustLevel: 0.1,
      vulnerabilityComfort: 0.1,
      personalPatterns: [],
      collectiveResonance: null,
      archetypeAffinity: ['maya'],
      recentGrowth: [],
      readinessForSurprise: 0.1
    };
  }

  // Additional helper methods would be implemented here...
  private selectPrimaryExperience(input: string, context: ExperienceContext, cathedral: any): string {
    if (context.trustLevel < 0.3) return 'witnessing';
    if (cathedral.structure.recognitionDepth > 0.7) return 'recognition';
    if (cathedral.walls.selfDiscoveryPotential > 0.7) return 'reflection';
    if (cathedral.windows.meaningConnection > 0.7) return 'connection';
    if (context.readinessForSurprise > 0.7) return 'emergence';
    return 'witnessing';
  }

  private calculateOptimalResponseLength(context: ExperienceContext, cathedral: any): number {
    const baseLength = 80;
    const trustMultiplier = 1 + (context.trustLevel * 0.5);
    const complexityMultiplier = 1 + (cathedral.dome.emergencePotential * 0.3);
    return Math.floor(baseLength * trustMultiplier * complexityMultiplier);
  }

  private refineDynamicResponse(response: string, context: ExperienceContext, cathedral: any): string {
    return response.trim();
  }

  private determineVoiceCharacteristics(cathedral: any, context: ExperienceContext): any {
    return {
      pace: context.trustLevel > 0.5 ? 'intimate' : 'deliberate',
      tone: cathedral.structure.optimalArchetype.name + '_experience',
      energy: cathedral.dome.alivenessInvitation > 0.5 ? 'alive' : 'calm'
    };
  }

  private getActiveCathedralLayers(cathedral: any): string[] {
    const layers = [];
    if (cathedral.foundation.safetyLevel > 0.5) layers.push('foundation');
    if (cathedral.structure.resonanceLevel > 0.5) layers.push('structure');
    if (cathedral.walls.selfDiscoveryPotential > 0.5) layers.push('walls');
    if (cathedral.windows.meaningConnection > 0.5) layers.push('windows');
    if (cathedral.dome.surpriseElement > 0.5) layers.push('dome');
    return layers;
  }

  private identifyGrowthCatalyst(cathedral: any): string {
    return "Experience of being witnessed and reflected";
  }

  private identifySoulNourishment(cathedral: any): string {
    return "Recognition and authentic connection";
  }

  private createFallbackExperience(input: string, context: ExperienceContext): TransformativeExperience {
    return {
      message: "I'm here with you.",
      element: 'earth',
      archetype: 'maya',
      confidence: 0.7,
      voiceCharacteristics: { pace: 'deliberate', tone: 'warm', energy: 'calm' },
      experienceProfile: {
        safety: 0.8,
        resonance: 0.6,
        reflection: 0.5,
        connection: 0.4,
        surprise: 0.3,
        totalExperienceQuality: 0.52
      },
      metadata: {
        experienceType: 'witnessing',
        cathedralLayers: ['foundation'],
        growthCatalyst: 'Being witnessed',
        soulNourishment: 'Presence'
      }
    };
  }

  // Additional helper methods for calculation...
  private calculateMayaAffinity(input: string, context: ExperienceContext): number {
    return 0.8; // Maya as default
  }

  private calculateBreneAffinity(input: string, context: ExperienceContext): number {
    const vulnerabilityMarkers = /sad|scared|shame|vulnerable|hurt|broken/i;
    return vulnerabilityMarkers.test(input) ? 0.9 : 0.4;
  }

  private calculateMarcusAffinity(input: string, context: ExperienceContext): number {
    const stoicMarkers = /control|strength|discipline|focus|rational/i;
    return stoicMarkers.test(input) ? 0.8 : 0.3;
  }

  private getArchetypeElement(archetype: string): string {
    const elements = { maya: 'earth', brene: 'water', marcus: 'fire' };
    return elements[archetype] || 'earth';
  }

  // Experience calculation methods...
  private calculateResonanceLevel(input: string, context: ExperienceContext): number {
    return Math.min(context.relationshipDepth + 0.3, 1.0);
  }

  private assessRecognitionNeed(input: string): number {
    const questionMarkers = /why|how|what|help|understand|confused/i;
    return questionMarkers.test(input) ? 0.8 : 0.5;
  }

  private identifyPatternsForReflection(input: string, context: ExperienceContext): string[] {
    return context.personalPatterns.slice(0, 3);
  }

  private assessSelfDiscoveryOpportunity(input: string, context: ExperienceContext): number {
    const discoveryMarkers = /realize|understand|see|recognize|pattern|always|never/i;
    return discoveryMarkers.test(input) ? 0.8 : 0.4;
  }

  private determineClarityLevel(input: string, context: ExperienceContext): number {
    return context.trustLevel * 0.8;
  }

  private async getRelevantCollectiveWisdom(input: string, context: ExperienceContext): Promise<string | null> {
    return await this.collectiveField.getCollectiveWisdomFor(input);
  }

  private assessMeaningOpportunity(input: string, context: ExperienceContext): number {
    const meaningMarkers = /purpose|meaning|why|matter|important/i;
    return meaningMarkers.test(input) ? 0.8 : 0.3;
  }

  private evaluateContributionValue(input: string): number {
    return input.length > 50 ? 0.7 : 0.4;
  }

  private calculateSurpriseElement(input: string, context: ExperienceContext): number {
    return context.readinessForSurprise * 0.8;
  }

  private assessEmergencePotential(context: ExperienceContext): number {
    return context.relationshipDepth * context.trustLevel;
  }

  private determineLivenessLevel(input: string, context: ExperienceContext): number {
    return Math.min(context.readinessForSurprise + 0.2, 1.0);
  }
}

export const experienceOrchestrator = new ExperienceOrchestrator();