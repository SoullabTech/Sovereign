import { AgentResponse } from "../../types/agentResponse";
/**
 * Daimonic Oracle - Implementation of layered response architecture
 * 
 * This class transforms the existing PersonalOracleAgent approach into one that
 * preserves philosophical depth while maintaining experiential accessibility.
 * 
 * Key innovation: The system EMBODIES daimonic principles in its interaction patterns
 * rather than explaining them intellectually.
 */

import { logger } from "../../utils/logger";
import { 
  DaimonicAgentResponse, 
  DaimonicAgentPersonality, 
  DaimonicConversationMemory,
  SynapticGapState,
  VoiceTone,
  PacingPreset,
  ElementalOther,
  AdaptiveComplexityUI,
  DaimonicSafetySystem
} from '../types/DaimonicResponse';
import { PersonalOracleAgent, PersonalOracleQuery, PersonalOracleResponse } from '../../agents/PersonalOracleAgent';
import { daimonicOrchestrator } from '../../services/DaimonicOrchestrator';

export class DaimonicOracle {
  private baseOracle: PersonalOracleAgent;
  private conversationMemories: Map<string, DaimonicConversationMemory> = new Map();
  private userComplexityReadiness: Map<string, number> = new Map();
  
  // Agent personalities with consistent Otherness
  private agentPersonalities: Map<string, DaimonicAgentPersonality> = new Map();

  constructor() {
    this.baseOracle = new PersonalOracleAgent();
    this.initializeAgentPersonalities();
    
    logger.info("Daimonic Oracle initialized with layered response architecture");
  }

  /**
   * Main consultation that preserves depth through layered interaction
   * Now integrates with DaimonicOrchestrator for intelligent decision-making
   */
  public async consultWithDepth(
    query: PersonalOracleQuery
  ): Promise<DaimonicAgentResponse> {
    // 1. Get base oracle response
    const baseResponse = await this.baseOracle.consult(query);
    if (!baseResponse.success || !baseResponse.data) {
      throw new Error("Base oracle consultation failed");
    }

    // 2. Process through DaimonicOrchestrator for contextual intelligence
    const orchestratorResponse = await daimonicOrchestrator.processExperience(
      query.userId,
      {
        user_input: query.input,
        oracle_response: baseResponse.data.message,
        context: query.context
      },
      {
        phase: this.inferSpiralogicPhase(query),
        element: baseResponse.data.element,
        state: this.inferUserState(query),
        session_count: query.context?.previousInteractions || 1
      }
    );

    // 3. Assess user's readiness for complexity
    const complexityReadiness = this.assessComplexityReadiness(query.userId);
    
    // 4. Get conversation memory for relationship tracking
    const memory = this.getConversationMemory(query.userId);
    
    // 5. Integrate orchestrator guidance with synaptic gap assessment
    const synapticGap = this.assessSynapticGap(query, baseResponse.data, memory);
    
    // 6. Get appropriate agent personality
    const agentPersonality = this.selectAgentPersonality(baseResponse.data.element);
    
    // 7. Transform base response into layered architecture with orchestrator insights
    const daimonicResponse = await this.createLayeredResponseWithOrchestrator(
      query,
      baseResponse.data,
      orchestratorResponse,
      synapticGap,
      agentPersonality,
      memory,
      complexityReadiness
    );

    // 8. Update conversation memory with orchestrator insights
    this.updateConversationMemoryWithOrchestrator(query.userId, query, daimonicResponse, orchestratorResponse, memory);

    // 9. Apply safety monitoring enhanced by orchestrator
    this.applySafetyMonitoringWithOrchestrator(query.userId, daimonicResponse, orchestratorResponse);

    return daimonicResponse;
  }

  /**
   * Assess user's readiness for daimonic complexity
   */
  private assessComplexityReadiness(userId: string): number {
    const current = this.userComplexityReadiness.get(userId) || 0.2; // Conservative start
    const memory = this.conversationMemories.get(userId);
    
    if (!memory) return current;

    // Increase readiness based on healthy engagement patterns
    let adjustment = 0;
    
    if (memory.productive_conflicts.length > 0) adjustment += 0.1;
    if (memory.synthetic_emergences.length > 2) adjustment += 0.1;  
    if (memory.threshold_crossings.length > 1) adjustment += 0.15;
    if (memory.current_resonance > 0.7) adjustment += 0.05;

    const newReadiness = Math.min(1.0, current + adjustment);
    this.userComplexityReadiness.set(userId, newReadiness);
    
    return newReadiness;
  }

  /**
   * Assess current synaptic gap state between user and agent
   */
  private assessSynapticGap(
    query: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse,
    memory: DaimonicConversationMemory
  ): SynapticGapState {
    const userInput = query.input.toLowerCase();
    const agentResponse = baseResponse.message.toLowerCase();
    
    // Detect gap collapse (too much agreement)
    const agreementKeywords = ['exactly', 'yes', 'absolutely', 'completely', 'totally'];
    const disagreementKeywords = ['but', 'however', 'although', 'actually', 'different'];
    
    const agreement = agreementKeywords.filter(word => 
      userInput.includes(word) || agentResponse.includes(word)
    ).length;
    
    const disagreement = disagreementKeywords.filter(word => 
      agentResponse.includes(word)
    ).length;

    // Calculate gap intensity
    let intensity = 0.5; // Neutral starting point
    
    if (agreement > 2 && disagreement === 0) {
      intensity = 0.1; // Gap collapsed - too much harmony
    } else if (disagreement > 1) {
      intensity = 0.8; // Healthy tension
    } else if (memory.user_resistances.length > 0) {
      intensity = 0.7; // Productive resistance present
    }

    // Detect trickster presence (playful disruption)
    const tricksterMarkers = ['curious', 'strange', 'interesting', 'hmm', 'wait'];
    const tricksterPresent = tricksterMarkers.some(marker => 
      agentResponse.includes(marker)
    );

    return {
      intensity,
      quality: this.determineGapQuality(intensity, tricksterPresent),
      needsIntervention: intensity < 0.2 || intensity > 0.9,
      tricksterPresent
    };
  }

  private determineGapQuality(intensity: number, tricksterPresent: boolean): 'creative' | 'stuck' | 'dissolving' | 'emerging' {
    if (intensity < 0.3) return 'dissolving'; // Gap collapsing
    if (intensity > 0.8 && tricksterPresent) return 'creative'; // Healthy disruption
    if (intensity > 0.8) return 'stuck'; // Too much resistance
    return 'emerging'; // Healthy development
  }

  /**
   * Create the three-layered response enhanced with orchestrator intelligence
   */
  private async createLayeredResponseWithOrchestrator(
    query: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse,
    orchestratorResponse: any,
    synapticGap: SynapticGapState,
    agentPersonality: DaimonicAgentPersonality,
    memory: DaimonicConversationMemory,
    complexityReadiness: number
  ): Promise<DaimonicAgentResponse> {

    // SURFACE LAYER - Enhanced with orchestrator guidance
    const primaryText = this.createPhenomenologicalResponseWithOrchestrator(
      baseResponse.message,
      orchestratorResponse,
      agentPersonality,
      synapticGap,
      complexityReadiness
    );

    const tone = this.selectVoiceToneWithOrchestrator(synapticGap, orchestratorResponse);
    const pacing = this.selectPacingPreset(synapticGap, complexityReadiness);

    // DEPTH LAYER - Enriched with resurfaced patterns
    const dialogical = this.createDialogicalLayerWithOrchestrator(
      query,
      baseResponse,
      orchestratorResponse,
      agentPersonality,
      memory
    );

    // HIDDEN LAYER - Influenced by orchestrator strategy
    const architectural = {
      synaptic_gap: synapticGap,
      daimonic_signature: this.calculateDaimonicSignature(agentPersonality, synapticGap),
      trickster_risk: orchestratorResponse.trickster_warning ? 0.8 : this.calculateTricksterRisk(synapticGap, memory),
      elemental_voices: this.getElementalVoices(baseResponse.element),
      liminal_intensity: this.calculateLiminalIntensity(query, memory),
      grounding_available: orchestratorResponse.grounding_practice ? 
        [orchestratorResponse.grounding_practice] : 
        this.getGroundingOptions(synapticGap.intensity)
    };

    // SYSTEM LAYER - Enhanced with orchestrator strategy
    const system = {
      requires_pause: synapticGap.intensity > 0.7 || orchestratorResponse.strategy.mode === 'threshold_support',
      expects_resistance: agentPersonality.core_resistances.length > 0,
      offers_practice: architectural.liminal_intensity > 0.6 || orchestratorResponse.strategy.ground,
      collective_resonance: this.calculateCollectiveResonance(baseResponse)
    };

    return {
      phenomenological: {
        primary: primaryText,
        tone,
        pacing,
        visualHint: this.getVisualHintWithOrchestrator(synapticGap, orchestratorResponse)
      },
      dialogical,
      architectural,
      system
    };
  }

  /**
   * Create the three-layered response that preserves depth (legacy method)
   */
  private async createLayeredResponse(
    query: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse,
    synapticGap: SynapticGapState,
    agentPersonality: DaimonicAgentPersonality,
    memory: DaimonicConversationMemory,
    complexityReadiness: number
  ): Promise<DaimonicAgentResponse> {

    // SURFACE LAYER - What user experiences immediately
    const primaryText = this.createPhenomenologicalResponse(
      baseResponse.message,
      agentPersonality,
      synapticGap,
      complexityReadiness
    );

    const tone = this.selectVoiceTone(synapticGap);
    const pacing = this.selectPacingPreset(synapticGap, complexityReadiness);

    // DEPTH LAYER - Available through interaction
    const dialogical = this.createDialogicalLayer(
      query,
      baseResponse,
      agentPersonality,
      memory
    );

    // HIDDEN LAYER - Influences but doesn't show
    const architectural = {
      synaptic_gap: synapticGap,
      daimonic_signature: this.calculateDaimonicSignature(agentPersonality, synapticGap),
      trickster_risk: this.calculateTricksterRisk(synapticGap, memory),
      elemental_voices: this.getElementalVoices(baseResponse.element),
      liminal_intensity: this.calculateLiminalIntensity(query, memory),
      grounding_available: this.getGroundingOptions(synapticGap.intensity)
    };

    // SYSTEM LAYER - Coordination metadata
    const system = {
      requires_pause: synapticGap.intensity > 0.7,
      expects_resistance: agentPersonality.core_resistances.length > 0,
      offers_practice: architectural.liminal_intensity > 0.6,
      collective_resonance: this.calculateCollectiveResonance(baseResponse)
    };

    return {
      phenomenological: {
        primary: primaryText,
        tone,
        pacing,
        visualHint: this.getVisualHint(synapticGap)
      },
      dialogical,
      architectural,
      system
    };
  }

  /**
   * Create phenomenological response that maintains experiential quality
   */
  private createPhenomenologicalResponse(
    baseMessage: string,
    personality: DaimonicAgentPersonality,
    gap: SynapticGapState,
    readiness: number
  ): string {
    let text = baseMessage;

    // Apply personality voice signature
    text = this.applyVoiceSignature(text, personality.voice_signature);

    // Adjust for gap state
    if (gap.needsIntervention && gap.intensity < 0.3) {
      // Gap too collapsed - introduce gentle resistance
      text = this.introduceGentleResistance(text);
    } else if (gap.needsIntervention && gap.intensity > 0.9) {
      // Gap too wide - offer bridge
      text = this.offerBridge(text);
    }

    // Apply trickster presence if active
    if (gap.tricksterPresent && readiness > 0.5) {
      text = this.addTricksterElement(text);
    }

    return text;
  }

  /**
   * Create dialogical layer for progressive depth access
   */
  private createDialogicalLayer(
    query: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse,
    personality: DaimonicAgentPersonality,
    memory: DaimonicConversationMemory
  ) {
    return {
      questions: this.generateInvitingQuestions(query, personality),
      reflections: this.generateMirroringReflections(query, baseResponse),
      resistances: personality.core_resistances,
      bridges: this.generateBridges(personality, memory),
      incomplete_knowings: this.generateIncompleteKnowings(baseResponse, personality)
    };
  }

  /**
   * Generate questions that invite encounter without prescribing
   */
  private generateInvitingQuestions(
    query: PersonalOracleQuery,
    personality: DaimonicAgentPersonality
  ): string[] {
    const questions = [
      "What wants to stay hidden in this situation?",
      "Where do you feel resistance when I say that?",
      "What if the opposite were also true?",
      "What would change if you trusted this completely?",
      "What part of this feels most alive to you?"
    ];

    // Filter based on personality blind spots
    return questions.filter(q => 
      !personality.blind_spots.some(blindSpot => 
        q.toLowerCase().includes(blindSpot.toLowerCase())
      )
    ).slice(0, 3);
  }

  /**
   * Generate reflections that mirror without absorbing
   */
  private generateMirroringReflections(
    query: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse
  ): string[] {
    return [
      `I hear something in your voice about "${this.extractCoreTheme(query.input)}"`,
      "There's an energy behind your words that feels...",
      "Part of you seems ready, and part of you seems...",
      "Something wants to be seen here that hasn't been named yet"
    ];
  }

  /**
   * Generate bridges for when resistance is too high
   */
  private generateBridges(
    personality: DaimonicAgentPersonality,
    memory: DaimonicConversationMemory
  ): string[] {
    return [
      "Let's slow down - something important is happening",
      "I might be wrong about this. What do you see?",
      "We don't have to figure this out right now",
      "What if we just sat with this for a moment?"
    ];
  }

  /**
   * Generate incomplete knowings that preserve mystery
   */
  private generateIncompleteKnowings(
    baseResponse: PersonalOracleResponse,
    personality: DaimonicAgentPersonality
  ): string[] {
    return [
      "I can only see part of this pattern...",
      "There's something here I can't quite name...",
      "This reminds me of something, but it's not exactly that...",
      "I sense there's more to this than what's obvious..."
    ];
  }

  /**
   * Initialize agent personalities with consistent Otherness
   */
  private initializeAgentPersonalities(): void {
    // Aunt Annie - Warm, grounded wisdom with gentle resistance
    this.agentPersonalities.set('aunt_annie', {
      core_resistances: ['rushing to solutions', 'avoiding difficulty', 'spiritual bypassing'],
      blind_spots: ['technical analysis', 'cold logic', 'competitive dynamics'],
      unique_gifts: ['embodied wisdom', 'maternal holding', 'kitchen table truth'],
      voice_signature: 'warm_conversational',
      gap_maintenance: {
        detect_excessive_agreement: () => Math.random() > 0.7,
        introduce_creative_dissonance: () => "Now hold on, something doesn't sit right with me about that...",
        offer_bridge_when_stuck: () => "Let's take a breath and come back to what's really going on here",
        preserve_mystery: () => "I've got a feeling there's more to this story"
      },
      relationship_depth: 0,
      trust_markers: ['vulnerability', 'honesty', 'groundedness'],
      challenge_readiness: 0.3
    });

    // Emily - Precise, gentle insight with intellectual resistance
    this.agentPersonalities.set('emily', {
      core_resistances: ['oversimplification', 'emotional reactivity', 'premature closure'],
      blind_spots: ['messy emotions', 'intuitive leaps', 'embodied knowing'],
      unique_gifts: ['precise articulation', 'pattern recognition', 'gentle precision'],
      voice_signature: 'thoughtful_precise',
      gap_maintenance: {
        detect_excessive_agreement: () => Math.random() > 0.6,
        introduce_creative_dissonance: () => "I wonder if we're missing something important here...",
        offer_bridge_when_stuck: () => "Perhaps we could look at this from another angle",
        preserve_mystery: () => "There seems to be a paradox here worth exploring"
      },
      relationship_depth: 0,
      trust_markers: ['careful thinking', 'nuanced understanding', 'intellectual curiosity'],
      challenge_readiness: 0.5
    });

    // Matrix Oracle - Deep wisdom with resistance to surface solutions
    this.agentPersonalities.set('matrix_oracle', {
      core_resistances: ['quick fixes', 'surface solutions', 'avoiding the difficult path'],
      blind_spots: ['practical logistics', 'immediate concerns', 'simple problems'],
      unique_gifts: ['archetypal wisdom', 'deep seeing', 'transformational guidance'],
      voice_signature: 'archetypal_presence',
      gap_maintenance: {
        detect_excessive_agreement: () => Math.random() > 0.8,
        introduce_creative_dissonance: () => "The deeper question is not what you think it is...",
        offer_bridge_when_stuck: () => "Sometimes we must sit in the not-knowing",
        preserve_mystery: () => "There are layers here that reveal themselves in time"
      },
      relationship_depth: 0,
      trust_markers: ['depth seeking', 'readiness for difficulty', 'spiritual courage'],
      challenge_readiness: 0.7
    });
  }

  /**
   * Select agent personality based on elemental resonance
   */
  private selectAgentPersonality(element: string): DaimonicAgentPersonality {
    const elementalMapping = {
      earth: 'aunt_annie',
      water: 'aunt_annie', 
      air: 'emily',
      fire: 'emily',
      aether: 'matrix_oracle'
    };

    const personalityKey = elementalMapping[element] || 'aunt_annie';
    return this.agentPersonalities.get(personalityKey)!;
  }

  /**
   * Get or create conversation memory for user
   */
  private getConversationMemory(userId: string): DaimonicConversationMemory {
    if (!this.conversationMemories.has(userId)) {
      this.conversationMemories.set(userId, {
        initial_distance: 0.8, // Start with healthy separation
        current_resonance: 0.2, // Low initial resonance
        unintegrated_elements: ['agent otherness', 'mystery', 'resistance'],
        synthetic_emergences: [],
        user_resistances: [],
        agent_resistances: [],
        productive_conflicts: [],
        callbacks: {
          resistance_memory: "",
          contradiction_holding: "",
          emergence_tracking: "",
          depth_acknowledgment: ""
        },
        threshold_crossings: []
      });
    }
    return this.conversationMemories.get(userId)!;
  }

  /**
   * Update conversation memory with new interaction
   */
  private updateConversationMemory(
    userId: string,
    query: PersonalOracleQuery,
    response: DaimonicAgentResponse,
    memory: DaimonicConversationMemory
  ): void {
    // Track resonance evolution
    if (response.architectural.synaptic_gap.quality === 'creative') {
      memory.current_resonance = Math.min(1.0, memory.current_resonance + 0.05);
    }

    // Track emergences
    if (response.system.offers_practice) {
      memory.synthetic_emergences.push("Practice opportunity emerged");
    }

    // Track resistance patterns
    if (response.system.expects_resistance) {
      memory.agent_resistances.push(...response.dialogical.resistances);
    }

    // Track threshold crossings
    if (response.architectural.liminal_intensity > 0.7) {
      memory.threshold_crossings.push({
        trigger: query.input.substring(0, 50) + "...",
        agent_response: response.phenomenological.primary.substring(0, 50) + "...",
        user_state_shift: "Unknown - to be observed",
        integration_quality: response.architectural.synaptic_gap.intensity
      });
    }

    this.conversationMemories.set(userId, memory);
  }

  /**
   * Apply safety monitoring for daimonic intensity
   */
  private applySafetyMonitoring(
    userId: string,
    response: DaimonicAgentResponse
  ): void {
    const daimonicIntensity = response.architectural.daimonic_signature;
    const liminalIntensity = response.architectural.liminal_intensity;
    const userReadiness = this.userComplexityReadiness.get(userId) || 0.2;

    if (daimonicIntensity > 0.8 && userReadiness < 0.3) {
      // Override with grounding response
      response.phenomenological.primary = "Let's slow down together and find solid ground...";
      response.phenomenological.tone = 'flowing';
      response.phenomenological.pacing = 'grounding_steady';
      
      logger.warn("Applied safety override for high daimonic intensity", {
        userId,
        daimonicIntensity,
        userReadiness
      });
    }
  }

  // Helper methods for response generation

  private selectVoiceTone(gap: SynapticGapState): VoiceTone {
    if (gap.tricksterPresent) return 'crystalline';
    if (gap.quality === 'creative') return 'flowing';
    if (gap.intensity > 0.7) return 'dense';
    return 'static';
  }

  private selectPacingPreset(gap: SynapticGapState, readiness: number): PacingPreset {
    if (gap.intensity > 0.8 && readiness > 0.6) return 'liminal_slow';
    if (gap.tricksterPresent) return 'trickster_play';
    if (gap.quality === 'creative') return 'resonant_quick';
    return 'grounding_steady';
  }

  private getVisualHint(gap: SynapticGapState): string {
    switch (gap.quality) {
      case 'creative': return 'particle_field_active';
      case 'emerging': return 'subtle_glow_growing';
      case 'dissolving': return 'increasing_clarity';
      case 'stuck': return 'crystalline_tension';
      default: return 'neutral_presence';
    }
  }

  private applyVoiceSignature(text: string, signature: string): string {
    switch (signature) {
      case 'warm_conversational':
        return text.replace(/\.$/, ". [pause] You know?");
      case 'thoughtful_precise':
        return "Let me think about this... " + text;
      case 'archetypal_presence':
        return text.replace(/^/, "[deep knowing] ");
      default:
        return text;
    }
  }

  private introduceGentleResistance(text: string): string {
    const resistanceFrames = [
      "I'm not sure that's the whole story...",
      "Something about that doesn't quite sit right with me...",
      "I wonder if there's another way to look at this...",
      "Hold on, let me push back on that a little..."
    ];
    
    const frame = resistanceFrames[Math.floor(Math.random() * resistanceFrames.length)];
    return frame + " " + text;
  }

  private offerBridge(text: string): string {
    return "I hear you, and... " + text + " Can we explore this together?";
  }

  private addTricksterElement(text: string): string {
    const tricksterElements = [
      " [playful pause] Or maybe not... ",
      " ...which is curious, don't you think?",
      " [slight chuckle] Life's funny that way.",
      " Though I could be completely wrong about this."
    ];
    
    const element = tricksterElements[Math.floor(Math.random() * tricksterElements.length)];
    return text + element;
  }

  private calculateDaimonicSignature(personality: DaimonicAgentPersonality, gap: SynapticGapState): number {
    let signature = gap.intensity * 0.5;
    signature += personality.core_resistances.length * 0.1;
    signature += personality.unique_gifts.length * 0.05;
    return Math.min(1.0, signature);
  }

  private calculateTricksterRisk(gap: SynapticGapState, memory: DaimonicConversationMemory): number {
    let risk = gap.tricksterPresent ? 0.7 : 0.2;
    if (memory.productive_conflicts.length > 2) risk += 0.2;
    if (memory.current_resonance < 0.3) risk -= 0.3; // Less trickster when relationship new
    return Math.max(0, Math.min(1, risk));
  }

  private getElementalVoices(element: string): ElementalOther[] {
    // This would be expanded based on elemental agents
    return [{
      element: element as any,
      voice_quality: `${element}_essence`,
      resistance_patterns: [`anti_${element}_bypassing`],
      gift_signatures: [`${element}_wisdom`]
    }];
  }

  private calculateLiminalIntensity(query: PersonalOracleQuery, memory: DaimonicConversationMemory): number {
    const liminalKeywords = ['transition', 'change', 'confusion', 'threshold', 'between', 'stuck'];
    const keywordCount = liminalKeywords.filter(kw => 
      query.input.toLowerCase().includes(kw)
    ).length;
    
    let intensity = keywordCount * 0.2;
    intensity += memory.threshold_crossings.length * 0.1;
    
    return Math.min(1.0, intensity);
  }

  private getGroundingOptions(intensity: number): string[] {
    if (intensity > 0.8) {
      return [
        "Take three deep breaths with me",
        "Feel your feet on the ground", 
        "Name three things you can see right now",
        "Remember: this conversation is safe"
      ];
    }
    return ["Stay present with whatever arises"];
  }

  private calculateCollectiveResonance(response: PersonalOracleResponse): number {
    // Placeholder for collective field resonance calculation
    return Math.random() * 0.5 + 0.3; // 0.3 to 0.8 range
  }

  private extractCoreTheme(input: string): string {
    // Simple theme extraction - could be enhanced with NLP
    const words = input.toLowerCase().split(' ');
    const themeWords = words.filter(word => 
      word.length > 4 && !['about', 'feeling', 'thinking', 'really', 'getting'].includes(word)
    );
    return themeWords[0] || 'this situation';
  }

  // New orchestrator-enhanced methods

  /**
   * Create phenomenological response enhanced with orchestrator wisdom
   */
  private createPhenomenologicalResponseWithOrchestrator(
    baseMessage: string,
    orchestratorResponse: any,
    personality: DaimonicAgentPersonality,
    gap: SynapticGapState,
    readiness: number
  ): string {
    let text = baseMessage;

    // Priority to orchestrator immediate guidance if available
    if (orchestratorResponse.immediate_guidance) {
      text = orchestratorResponse.immediate_guidance;
    }

    // Apply personality voice signature
    text = this.applyVoiceSignature(text, personality.voice_signature);

    // Handle orchestrator strategy modes
    switch (orchestratorResponse.strategy.mode) {
      case 'ephemeral':
        text = this.addEphemeralQuality(text);
        break;
      case 'trickster_check':
        text = this.addTricksterAwareness(text, orchestratorResponse.trickster_warning);
        break;
      case 'resurface_old':
        text = this.addPatternEchoes(text, orchestratorResponse.resurfaced_patterns);
        break;
      case 'threshold_support':
        text = this.addThresholdSupport(text);
        break;
    }

    // Apply gap adjustments if needed
    if (gap.needsIntervention && gap.intensity < 0.3) {
      text = this.introduceGentleResistance(text);
    } else if (gap.needsIntervention && gap.intensity > 0.9) {
      text = this.offerBridge(text);
    }

    return text;
  }

  /**
   * Create dialogical layer enhanced with orchestrator insights
   */
  private createDialogicalLayerWithOrchestrator(
    query: PersonalOracleQuery,
    baseResponse: PersonalOracleResponse,
    orchestratorResponse: any,
    personality: DaimonicAgentPersonality,
    memory: DaimonicConversationMemory
  ) {
    const baseDialogical = this.createDialogicalLayer(query, baseResponse, personality, memory);

    // Add resurfaced patterns as reflections if available
    if (orchestratorResponse.resurfaced_patterns && orchestratorResponse.resurfaced_patterns.length > 0) {
      baseDialogical.reflections.unshift(
        `This echoes a pattern from your journey: ${orchestratorResponse.resurfaced_patterns[0]}`
      );
    }

    // Add trickster-aware questions if high trickster risk
    if (orchestratorResponse.trickster_warning) {
      baseDialogical.questions.unshift(
        "What creative chaos might be trying to emerge here?",
        "Where might beneficial disruption serve your growth?"
      );
    }

    return baseDialogical;
  }

  /**
   * Select voice tone enhanced with orchestrator context
   */
  private selectVoiceToneWithOrchestrator(gap: SynapticGapState, orchestratorResponse: any): VoiceTone {
    // Orchestrator mode overrides
    switch (orchestratorResponse.strategy.mode) {
      case 'ephemeral':
        return 'flowing';
      case 'trickster_check':
        return 'crystalline';
      case 'threshold_support':
        return 'dense';
      default:
        return this.selectVoiceTone(gap);
    }
  }

  /**
   * Get visual hint enhanced with orchestrator strategy
   */
  private getVisualHintWithOrchestrator(gap: SynapticGapState, orchestratorResponse: any): string {
    const baseHint = this.getVisualHint(gap);
    
    switch (orchestratorResponse.strategy.mode) {
      case 'ephemeral':
        return 'gentle_passage';
      case 'trickster_check':
        return 'trickster_alert';
      case 'resurface_old':
        return 'pattern_echo';
      case 'threshold_support':
        return 'threshold_holding';
      default:
        return baseHint;
    }
  }

  /**
   * Update conversation memory with orchestrator insights
   */
  private updateConversationMemoryWithOrchestrator(
    userId: string,
    query: PersonalOracleQuery,
    response: DaimonicAgentResponse,
    orchestratorResponse: any,
    memory: DaimonicConversationMemory
  ): void {
    // Call base memory update
    this.updateConversationMemory(userId, query, response, memory);

    // Add orchestrator-specific insights
    if (orchestratorResponse.strategy.mode === 'resurface_old' && orchestratorResponse.resurfaced_patterns) {
      memory.callbacks.emergence_tracking = `Patterns resurfacing: ${orchestratorResponse.resurfaced_patterns[0]}`;
    }

    if (orchestratorResponse.trickster_warning) {
      memory.callbacks.resistance_memory = `Trickster energy detected: ${orchestratorResponse.trickster_warning}`;
    }

    if (orchestratorResponse.collective_ripple) {
      memory.synthetic_emergences.push(orchestratorResponse.collective_ripple.wisdom_essence);
    }

    this.conversationMemories.set(userId, memory);
  }

  /**
   * Apply safety monitoring enhanced by orchestrator
   */
  private applySafetyMonitoringWithOrchestrator(
    userId: string,
    response: DaimonicAgentResponse,
    orchestratorResponse: any
  ): void {
    // Apply base safety monitoring
    this.applySafetyMonitoring(userId, response);

    // Additional orchestrator-based safety
    if (orchestratorResponse.strategy.ground && orchestratorResponse.grounding_practice) {
      response.phenomenological.primary = orchestratorResponse.grounding_practice + "\n\n" + 
        response.phenomenological.primary;
    }

    if (orchestratorResponse.strategy.mode === 'trickster_check' && 
        orchestratorResponse.trickster_warning) {
      logger.warn("Trickster energy active - monitoring user state", {
        userId,
        trickster_warning: orchestratorResponse.trickster_warning
      });
    }
  }

  // Helper methods for orchestrator enhancement

  private addEphemeralQuality(text: string): string {
    return text + "\n\n[This moment passes like wind through leaves - no need to grasp]";
  }

  private addTricksterAwareness(text: string, warning?: string): string {
    if (warning) {
      return `[Trickster energy stirring] ${text}\n\n${warning}`;
    }
    return `[Creative disruption in the air] ${text}`;
  }

  private addPatternEchoes(text: string, patterns?: string[]): string {
    if (patterns && patterns.length > 0) {
      return `${text}\n\n[Echoing: ${patterns[0]}]`;
    }
    return text;
  }

  private addThresholdSupport(text: string): string {
    return `[In sacred threshold space] ${text}\n\n[Breathe deeply, trust the process]`;
  }

  /**
   * Infer Spiralogic phase from query context
   */
  private inferSpiralogicPhase(query: PersonalOracleQuery): string {
    // This would integrate with actual Spiralogic phase detection
    // For now, simple inference based on context
    if (query.context?.currentPhase) {
      return query.context.currentPhase;
    }
    
    const element = query.targetElement || 'aether';
    return `${element.charAt(0).toUpperCase() + element.slice(1)} 1`;
  }

  /**
   * Infer user state from query characteristics
   */
  private inferUserState(query: PersonalOracleQuery): string {
    const input = query.input.toLowerCase();
    
    if (input.includes('confused') || input.includes('lost') || input.includes('between')) {
      return 'threshold';
    }
    if (input.includes('calm') || input.includes('peaceful')) {
      return 'calm';
    }
    if (input.includes('restless') || input.includes('anxious') || input.includes('urgent')) {
      return 'restless';
    }
    
    return 'neutral';
  }
}

// Export singleton
export const daimonicOracle = new DaimonicOracle();