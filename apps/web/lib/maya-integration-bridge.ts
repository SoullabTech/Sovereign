/**
 * 🎭 Maya Integration Bridge — Orchestration System
 * 
 * Central hub that coordinates all Maya's capabilities:
 * - Role management (Mirror, Teacher, Guide, Consultant, Coach)
 * - Language tier calibration (everyday → metaphorical → alchemical)
 * - Memory weaving and story thread management
 * - Metadata generation and pattern recognition
 */

import type {
  SoulLabMetadata,
  ElementalSignature,
  ArchetypalSignal,
  ConsciousnessProfile,
  MayaRole,
  ConversationState,
  UserSoulProfile,
  TieredResponse,
  ElementType
} from './types/soullab-metadata';

import { resonanceEngine } from './resonanceEngine';
import { archetypeEvolutionEngine } from './archetypeEvolutionEngine';
import { getStyleResonanceCalibrator } from './styleResonanceCalibrator';
import { getSweetSpotCalibration } from './sweetSpotCalibration';
import { journalQueries, storyQueries, momentQueries, threadQueries, profileQueries, conversationQueries, patternQueries } from './supabase/soullab-queries';

/**
 * Maya's Core Integration System
 */
export class MayaIntegrationBridge {
  private userId: string;
  private sessionId: string;
  private conversationState?: ConversationState;
  private userProfile?: UserSoulProfile;

  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;
  }

  /**
   * Initialize Maya for a conversation
   */
  async initialize() {
    // Load user profile and conversation state
    this.userProfile = await profileQueries.getOrCreate(this.userId);
    this.conversationState = await conversationQueries.getOrCreate(this.userId, this.sessionId);
    
    return {
      profile: this.userProfile,
      state: this.conversationState
    };
  }

  /**
   * 1. Resonance Detection - Analyze elemental signature
   */
  async detectResonance(input: string): Promise<ElementalSignature> {
    const response = await resonanceEngine.processInput(input);
    
    // Extract elemental data from resonance engine response
    const elements = this.extractElementalSignature(response);
    
    return {
      dominant: elements.dominant,
      balance: elements.balance,
      intensity: elements.intensity,
      dynamics: elements.dynamics
    };
  }

  /**
   * 2. Archetypal Classification
   */
  async classifyArchetypes(input: string): Promise<ArchetypalSignal[]> {
    const archetypeData = await archetypeEvolutionEngine.detectActiveArchetype(input);
    
    return archetypeData.map(arch => ({
      archetype: arch.name,
      confidence: arch.confidence,
      fusion: arch.fusion,
      shadow: arch.shadow,
      evolution: arch.evolution
    }));
  }

  /**
   * 3. Novelty Witnessing - Detect what doesn't fit categories
   */
  async attendNovelty(input: string): Promise<string | null> {
    // Look for patterns that don't map to known archetypes/elements
    const knownPatterns = await this.detectKnownPatterns(input);
    
    if (knownPatterns.confidence < 0.5) {
      return "Something unnamed is stirring here — a pattern I haven't seen before...";
    }
    
    return null;
  }

  /**
   * 4. Style Calibration - Determine response style
   */
  async calibrateStyle(input: string): Promise<"technical" | "philosophical" | "dramatic" | "soulful"> {
    const userStyle = this.userProfile?.preferred_style || "soulful";
    const contextStyle = await getStyleResonanceCalibrator().calibrate(input);
    
    // Blend user preference with context
    return this.blendStyles(userStyle, contextStyle);
  }

  /**
   * 5. Role Orchestration - Manage Maya's roles
   */
  async orchestrateRole(input: string, context: any): Promise<MayaRole> {
    const currentRole = this.conversationState?.current_role || { primary: "mirror" };
    
    // Detect if a role shift is needed
    const roleSignals = this.detectRoleSignals(input);
    
    let activeRole = currentRole.active;
    
    if (roleSignals.needsTeaching && !activeRole) {
      activeRole = "teacher";
    } else if (roleSignals.needsGuidance && !activeRole) {
      activeRole = "guide";
    } else if (roleSignals.needsPractical && !activeRole) {
      activeRole = "consultant";
    } else if (roleSignals.needsAction && !activeRole) {
      activeRole = "coach";
    }
    
    const style = await this.calibrateStyle(input);
    const languageTier = this.userProfile?.language_tier || "everyday";
    
    return {
      primary: "mirror",
      active: activeRole,
      style,
      languageTier
    };
  }

  /**
   * 6. Generate Metadata - Create rich metadata for entries
   */
  async generateMetadata(input: string): Promise<SoulLabMetadata> {
    const [elemental, archetypal] = await Promise.all([
      this.detectResonance(input),
      this.classifyArchetypes(input)
    ]);
    
    const consciousness = this.assessConsciousness(input, elemental, archetypal);
    const sentiment = this.detectSentiment(input);
    const symbols = this.extractSymbols(input);
    const themes = this.extractThemes(input, archetypal);
    
    return {
      elemental,
      archetypal,
      consciousness,
      sentiment,
      symbols,
      themes,
      collectiveResonance: this.calculateCollectiveResonance(elemental, archetypal),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 7. Language Tier Translation - Generate responses at different depths
   */
  async generateTieredResponse(
    coreMessage: string,
    metadata: SoulLabMetadata
  ): Promise<TieredResponse> {
    const element = metadata.elemental.dominant;
    const archetype = metadata.archetypal[0]?.archetype;
    
    return {
      // Plain language
      everyday: this.translateToEveryday(coreMessage, element, archetype),
      
      // Gentle metaphor
      metaphorical: this.translateToMetaphorical(coreMessage, element, archetype),
      
      // Full alchemical depth
      alchemical: this.translateToAlchemical(coreMessage, element, archetype)
    };
  }

  /**
   * 8. Memory Capture & Weaving
   */
  async captureAndWeave(
    input: string,
    type: "journal" | "story" | "moment",
    metadata?: SoulLabMetadata
  ) {
    // Generate metadata if not provided
    const meta = metadata || await this.generateMetadata(input);
    
    let entry;
    switch (type) {
      case "journal":
        entry = await journalQueries.create(this.userId, input, meta);
        break;
      case "story":
        entry = await storyQueries.create(this.userId, input, meta);
        break;
      case "moment":
        entry = await momentQueries.create(this.userId, input, meta);
        break;
    }
    
    // Find resonant threads to weave into
    const threads = await this.findResonantThreads(meta);
    if (threads.length > 0) {
      await threadQueries.linkEntry(threads[0].id, type, entry.id);
    }
    
    // Find past resonant entries
    const resonantMemories = await patternQueries.findResonantEntries(
      this.userId,
      meta,
      3
    );
    
    return {
      entry,
      threads,
      resonantMemories
    };
  }

  /**
   * 9. Conversation Flow Management
   */
  async manageFlow(): Promise<"continue" | "redirect" | "close"> {
    const exchangeCount = this.conversationState?.exchange_count || 0;
    const momentum = this.conversationState?.momentum || "building";
    
    // Use sweet spot calibration
    const flowDecision = await getSweetSpotCalibration().calibrate({
      exchangeCount,
      momentum,
      lastElement: this.conversationState?.last_element
    });
    
    // Update conversation state
    await conversationQueries.incrementExchange(this.sessionId);
    
    return flowDecision;
  }

  /**
   * 10. Pattern Recognition & Insights
   */
  async generateInsights(): Promise<string[]> {
    const growthEdges = await patternQueries.detectGrowthEdges(this.userId);
    const insights: string[] = [];
    
    if (growthEdges.growthEdge) {
      insights.push(
        `Your ${growthEdges.strongestElement} energy is strong, ` +
        `but ${growthEdges.growthEdge} might be calling for attention.`
      );
    }
    
    // Check for archetypal evolution
    const recentArchetypes = await this.getRecentArchetypes();
    if (recentArchetypes.evolution) {
      insights.push(
        `I notice movement from ${recentArchetypes.from} ` +
        `toward ${recentArchetypes.toward} in your recent journey.`
      );
    }
    
    return insights;
  }

  // === Helper Methods ===

  private extractElementalSignature(response: any): ElementalSignature {
    // Parse resonance engine response into elemental signature
    const elements = response.elemental || {};
    
    return {
      dominant: elements.primary as ElementType || "fire",
      balance: {
        fire: elements.fire || 0,
        water: elements.water || 0,
        earth: elements.earth || 0,
        air: elements.air || 0,
        aether: elements.aether || 0
      },
      intensity: elements.intensity || 0.5,
      dynamics: elements.dynamics
    };
  }

  private async detectKnownPatterns(input: string): Promise<{ confidence: number }> {
    // Check if input matches known patterns
    const archetypes = await this.classifyArchetypes(input);
    const maxConfidence = Math.max(...archetypes.map(a => a.confidence), 0);
    
    return { confidence: maxConfidence };
  }

  private blendStyles(
    userStyle: string,
    contextStyle: string
  ): "technical" | "philosophical" | "dramatic" | "soulful" {
    // Weight user preference higher but allow context to influence
    if (userStyle === contextStyle) return userStyle as any;
    
    // If user prefers technical but context is soulful, go philosophical
    const blendMap: Record<string, any> = {
      "technical-soulful": "philosophical",
      "soulful-technical": "philosophical",
      "dramatic-technical": "philosophical",
      "technical-dramatic": "philosophical"
    };
    
    const key = `${userStyle}-${contextStyle}`;
    return blendMap[key] || userStyle as any;
  }

  private detectRoleSignals(input: string) {
    const signals = {
      needsTeaching: false,
      needsGuidance: false,
      needsPractical: false,
      needsAction: false
    };
    
    // Teaching signals
    if (input.match(/what is|how does|explain|tell me about|understand/i)) {
      signals.needsTeaching = true;
    }
    
    // Guidance signals
    if (input.match(/should i|what if|i'm lost|help me see|meaning/i)) {
      signals.needsGuidance = true;
    }
    
    // Practical signals
    if (input.match(/how to|steps|practical|implement|build|create/i)) {
      signals.needsPractical = true;
    }
    
    // Action signals
    if (input.match(/accountability|commit|experiment|try|practice/i)) {
      signals.needsAction = true;
    }
    
    return signals;
  }

  private assessConsciousness(
    input: string,
    elemental: ElementalSignature,
    archetypal: ArchetypalSignal[]
  ): ConsciousnessProfile {
    // Assess consciousness level based on content
    let level: ConsciousnessLevel = "ego";
    let phase: DevelopmentalPhase = "awakening";
    
    if (input.match(/oneness|unity|cosmic|universal|all is one/i)) {
      level = "cosmic";
      phase = "embodiment";
    } else if (input.match(/soul|purpose|calling|deeper meaning/i)) {
      level = "soul";
      phase = "integration";
    }
    
    return {
      level,
      developmentalPhase: phase,
      readinessForTruth: elemental.intensity,
      hemisphericBalance: {
        leftBrain: archetypal[0]?.confidence || 0.5,
        rightBrain: elemental.intensity
      }
    };
  }

  private detectSentiment(input: string): string {
    // Simple sentiment detection
    if (input.match(/joy|happy|excited|grateful|love/i)) return "joyful";
    if (input.match(/sad|grief|loss|pain|hurt/i)) return "grief";
    if (input.match(/fear|scared|anxious|worry/i)) return "anxious";
    if (input.match(/anger|frustrated|annoyed|rage/i)) return "anger";
    if (input.match(/peace|calm|serene|still/i)) return "peaceful";
    if (input.match(/awe|wonder|amazing|profound/i)) return "awe";
    if (input.match(/threshold|edge|between|transition/i)) return "threshold";
    
    return "neutral";
  }

  private extractSymbols(input: string): string[] {
    const symbols: string[] = [];
    
    // Extract metaphorical language
    const metaphors = input.match(/like a?|as if|feels like|reminds me of/gi);
    if (metaphors) {
      symbols.push(...metaphors.map(m => m.toLowerCase()));
    }
    
    // Common archetypal symbols
    const archetypals = input.match(/fire|water|earth|air|light|dark|shadow|sun|moon|tree|river|mountain|ocean|sky/gi);
    if (archetypals) {
      symbols.push(...archetypals.map(a => a.toLowerCase()));
    }
    
    return [...new Set(symbols)];
  }

  private extractThemes(input: string, archetypal: ArchetypalSignal[]): string[] {
    const themes: string[] = [];
    
    // Add archetypal themes
    themes.push(...archetypal.map(a => a.archetype.toLowerCase()));
    
    // Common life themes
    if (input.match(/transform|change|evolve|grow/i)) themes.push("transformation");
    if (input.match(/love|connection|relationship/i)) themes.push("connection");
    if (input.match(/create|build|make|design/i)) themes.push("creation");
    if (input.match(/heal|repair|mend|restore/i)) themes.push("healing");
    if (input.match(/discover|explore|seek|quest/i)) themes.push("seeking");
    
    return [...new Set(themes)];
  }

  private calculateCollectiveResonance(
    elemental: ElementalSignature,
    archetypal: ArchetypalSignal[]
  ): number {
    // Calculate how strongly this resonates with collective patterns
    const elementalStrength = elemental.intensity;
    const archetypeStrength = Math.max(...archetypal.map(a => a.confidence), 0);
    
    return (elementalStrength + archetypeStrength) / 2;
  }

  private translateToEveryday(
    message: string,
    element: ElementType,
    archetype?: string
  ): string {
    // Translate to plain language
    return message
      .replace(/fire energy/gi, "passion and drive")
      .replace(/water energy/gi, "emotions and flow")
      .replace(/earth energy/gi, "grounding and stability")
      .replace(/air energy/gi, "thoughts and clarity")
      .replace(/aether/gi, "spiritual connection")
      .replace(new RegExp(archetype || '', 'gi'), "your journey");
  }

  private translateToMetaphorical(
    message: string,
    element: ElementType,
    archetype?: string
  ): string {
    // Keep gentle metaphors
    return message
      .replace(/(\w+) energy/gi, "$1")
      .replace(/archetype/gi, "pattern");
  }

  private translateToAlchemical(
    message: string,
    element: ElementType,
    archetype?: string
  ): string {
    // Full depth - return as is
    return message;
  }

  private async findResonantThreads(metadata: SoulLabMetadata): Promise<any[]> {
    const threads = await threadQueries.getByUser(this.userId);
    
    // Find threads with matching elements or archetypes
    return threads.filter(thread => 
      thread.element === metadata.elemental.dominant ||
      thread.archetype === metadata.archetypal[0]?.archetype
    );
  }

  private async getRecentArchetypes(): Promise<any> {
    const entries = await journalQueries.getByUser(this.userId, 10);
    
    const archetypes = entries.flatMap(e => 
      e.metadata.archetypal.map(a => a.archetype)
    );
    
    // Detect evolution
    if (archetypes.length >= 2) {
      const recent = archetypes[0];
      const previous = archetypes[archetypes.length - 1];
      
      if (recent !== previous) {
        return {
          evolution: true,
          from: previous,
          toward: recent
        };
      }
    }
    
    return { evolution: false };
  }
}

/**
 * Factory function to create Maya instance
 */
export function createMaya(userId: string, sessionId: string) {
  return new MayaIntegrationBridge(userId, sessionId);
}