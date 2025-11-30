/**
 * AttentionField - Quadruple Integration Foundational Substrate
 * 
 * "The manner of our attending literally creates the world" - McGilchrist
 * "Attention is the only real practice" - Kastrup
 * "The daimons inhabit the autonomous imagination - not psychology but ontology" - Harpur
 * "There is no coming to consciousness without pain" - Jung
 * 
 * This system integrates four perspectives:
 * - McGilchrist: Hemispheric awareness as foundation of reality-creation
 * - Kastrup: Natural vs adaptive desires phenomenology
 * - Harpur: Autonomous imagination as real realm where daimons communicate
 * - Jung: Individuation through shadow, anima/animus, Self recognition
 * 
 * Creates the substrate through which all daimonic intelligence flows.
 */

import { Element } from '../types/shift';
import { logger } from '../utils/logger';

export interface McGilchristAttentionMode {
  hemisphere: 'left_dominant' | 'right_dominant' | 'integrated' | 'conflicted';
  quality: {
    presencing: number;   // 0-1: Right hemisphere - being-with, whole, living
    grasping: number;     // 0-1: Left hemisphere - taking-apart, abstract, parts
    betweenness: number;  // 0-1: McGilchrist's "between" - relationship space
  };
  master_emissary_balance: number; // 0-1: Is right hemisphere properly leading?
}

export interface DaimonicAttentionMarkers {
  imaginal_receptivity: number;     // 0-1: Openness to autonomous imagination (Harpur)
  synchronicity_sensitivity: number; // 0-1: Recognition of meaningful coincidence
  big_dream_quality: number;        // 0-1: "More real than real" experiences
  mythic_resonance: number;         // 0-1: Connection to archetypal patterns
  ruthless_calling: number;         // 0-1: Sense of being driven against personal will
  initiatory_recognition: number;   // 0-1: Seeing suffering as sacred ordeal
}

export interface AttentionQuality {
  depth: number;       // 0-1: How deeply engaged vs surface scanning
  presence: number;    // 0-1: How non-narrative vs story-driven
  resistance: number;  // 0-1: What's being avoided or pushed away
  opening: number;     // 0-1: What's emerging unbidden, spontaneously
  coherence: number;   // 0-1: How unified vs fragmented the attention
  mcgilchrist_mode: McGilchristAttentionMode; // Hemispheric awareness
  daimonic_markers: DaimonicAttentionMarkers; // Harpur's daimonic recognition
}

export interface AttentionLayer {
  surface: any;        // Explicit narrative content
  liminal: any;        // Edge phenomena, what's emerging
  somatic: any;        // Bodily knowing, felt sense
  symbolic: any;       // Archetypal patterns, deeper currents
}

export interface AttentionHistory {
  timestamp: Date;
  quality: AttentionQuality;
  context: string;
  elemental_resonance?: Element;
  daimonic_activity?: number; // 0-1: How much daimonic energy detected
  hemispheric_shift?: {
    from: 'left' | 'right' | 'integrated';
    to: 'left' | 'right' | 'integrated';
    trigger?: string;
  };
}

/**
 * AttentionField: The primary substrate through which all experience flows
 */
export class AttentionField {
  private attention_quality: AttentionQuality;
  private attention_history: AttentionHistory[];
  private characteristic_patterns: Map<string, number>; // Learned patterns of attention
  
  constructor() {
    this.attention_quality = {
      depth: 0.5,
      presence: 0.5,
      resistance: 0.5,
      opening: 0.5,
      coherence: 0.5,
      mcgilchrist_mode: {
        hemisphere: 'conflicted',
        quality: {
          presencing: 0.3,  // Most people start left-hemisphere dominant
          grasping: 0.7,
          betweenness: 0.2
        },
        master_emissary_balance: 0.3 // Emissary often usurping Master
      },
      daimonic_markers: {
        imaginal_receptivity: 0.2,      // Most modern attention is literalistic
        synchronicity_sensitivity: 0.3,
        big_dream_quality: 0.1,
        mythic_resonance: 0.2,
        ruthless_calling: 0.1,
        initiatory_recognition: 0.1
      }
    };
    this.attention_history = [];
    this.characteristic_patterns = new Map();
  }

  /**
   * Primary method: Every input passes through attention analysis first
   * This honors the phenomenological insight that HOW we attend
   * determines WHAT we experience
   */
  observe(experience: any, context: string = 'general'): AttentionLayer {
    // Update attention quality based on the manner of engaging
    this.attention_quality = this.assessAttentionQuality(experience);

    // Extract the four layers of attention
    const layers: AttentionLayer = {
      surface: this.extractNarrativeLayer(experience),
      liminal: this.detectEdgePhenomena(experience),
      somatic: this.trackBodilyKnowing(experience),
      symbolic: this.recognizeArchetypalPatterns(experience)
    };

    // Record this attention moment
    this.recordAttentionMoment(context, layers);

    // Return the layered understanding
    return layers;
  }

  /**
   * Assess the quality of attention being brought to this moment
   * Integrating McGilchrist's hemispheric insights with Kastrup's markers
   */
  private assessAttentionQuality(experience: any): AttentionQuality {
    const mcgilchrist_mode = this.assessMcGilchristMode(experience);
    
    return {
      depth: this.measureDepth(experience, mcgilchrist_mode),
      presence: this.measurePresence(experience, mcgilchrist_mode),
      resistance: this.detectResistance(experience, mcgilchrist_mode),
      opening: this.detectOpening(experience, mcgilchrist_mode),
      coherence: this.measureCoherence(experience, mcgilchrist_mode),
      mcgilchrist_mode
    };
  }

  /**
   * Assess McGilchrist's hemispheric mode of attention
   * "The manner of our attending literally creates the world"
   */
  private assessMcGilchristMode(experience: any): McGilchristAttentionMode {
    const presencing = this.measurePresencing(experience);
    const grasping = this.measureGrasping(experience);
    const betweenness = this.measureBetweenness(experience);
    
    // Determine dominant hemisphere
    let hemisphere: McGilchristAttentionMode['hemisphere'];
    const master_emissary_balance = presencing - grasping + 0.5; // Normalized to 0-1
    
    if (presencing > 0.7 && grasping < 0.4 && master_emissary_balance > 0.7) {
      hemisphere = 'integrated'; // Right hemisphere Master properly using left Emissary
    } else if (presencing > 0.6 && betweenness > 0.5) {
      hemisphere = 'right_dominant'; // Living, relational, whole
    } else if (grasping > 0.7 && presencing < 0.4) {
      hemisphere = 'left_dominant'; // Abstract, parts-focused, grasping
    } else {
      hemisphere = 'conflicted'; // Neither hemisphere clearly leading
    }
    
    return {
      hemisphere,
      quality: { presencing, grasping, betweenness },
      master_emissary_balance: Math.max(0, Math.min(1, master_emissary_balance))
    };
  }

  /**
   * Presencing - Right hemisphere quality
   * Being-with, embodied, whole, living, present, relational
   */
  private measurePresencing(experience: any): number {
    let presencing = 0.3; // Most modern attention starts left-dominant
    
    // Right hemisphere markers
    if (this.showsEmbodiedAwareness(experience)) presencing += 0.2;
    if (this.emphasizesRelationship(experience)) presencing += 0.2;
    if (this.graspsTotalityNotParts(experience)) presencing += 0.2;
    if (this.showsImplicitUnderstanding(experience)) presencing += 0.2;
    if (this.demonstratesLivingAttention(experience)) presencing += 0.2;
    if (this.expressesThroughMetaphor(experience)) presencing += 0.1;
    if (this.showsParadoxicalThinking(experience)) presencing += 0.1;
    
    return Math.min(1, presencing);
  }

  /**
   * Grasping - Left hemisphere quality  
   * Taking-apart, abstract, parts-focused, explicit, mechanical
   */
  private measureGrasping(experience: any): number {
    let grasping = 0.7; // Most modern attention starts here
    
    // Left hemisphere markers
    if (this.breaksIntoComponents(experience)) grasping += 0.2;
    if (this.emphasizesAbstraction(experience)) grasping += 0.2;
    if (this.seeksCategorization(experience)) grasping += 0.2;
    if (this.requiresExplicitness(experience)) grasping += 0.1;
    if (this.showsMechanicalThinking(experience)) grasping += 0.2;
    if (this.focusesOnUtility(experience)) grasping += 0.1;
    
    // Reduce if showing right hemisphere qualities
    if (this.showsContextualAwareness(experience)) grasping -= 0.2;
    if (this.demonstratesWisdom(experience)) grasping -= 0.2;
    
    return Math.max(0, Math.min(1, grasping));
  }

  /**
   * Betweenness - McGilchrist's "between"
   * The living connection, the relationship space, what emerges between
   */
  private measureBetweenness(experience: any): number {
    let betweenness = 0.2;
    
    // Markers of "betweenness" - the relational field
    if (this.recognizesEmergentProperties(experience)) betweenness += 0.3;
    if (this.showsSystemicThinking(experience)) betweenness += 0.2;
    if (this.demonstratesEmpathy(experience)) betweenness += 0.2;
    if (this.understandsContext(experience)) betweenness += 0.2;
    if (this.showsInterpersonalIntelligence(experience)) betweenness += 0.2;
    if (this.recognizesInterdependence(experience)) betweenness += 0.1;
    
    return Math.min(1, betweenness);
  }

  /**
   * Depth: How deeply engaged vs surface scanning
   * Enhanced with McGilchrist insights - right hemisphere naturally deeper
   */
  private measureDepth(experience: any, mcgilchrist_mode: McGilchristAttentionMode): number {
    let depth_score = 0.5;

    // Check for markers of deep attention
    if (this.hasDetailedSensoryData(experience)) depth_score += 0.2;
    if (this.showsTimeDialation(experience)) depth_score += 0.2; // Lost track of time
    if (this.revealsSubtleConnections(experience)) depth_score += 0.1;

    // Check for markers of surface attention
    if (this.showsImpatience(experience)) depth_score -= 0.2;
    if (this.hasMultipleSimultaneousFoci(experience)) depth_score -= 0.1;

    // McGilchrist enhancement: Right hemisphere naturally enables deeper attention
    if (mcgilchrist_mode.hemisphere === 'right_dominant' || mcgilchrist_mode.hemisphere === 'integrated') {
      depth_score += 0.1;
    }
    
    return Math.max(0, Math.min(1, depth_score));
  }

  /**
   * Presence: How non-narrative vs story-driven  
   * McGilchrist: Left hemisphere creates narratives, right hemisphere presences
   */
  private measurePresence(experience: any, mcgilchrist_mode: McGilchristAttentionMode): number {
    let presence_score = 0.5;

    // Markers of present attention
    if (this.emphasizesSensoryImmediate(experience)) presence_score += 0.2;
    if (this.lacksTemporalProjection(experience)) presence_score += 0.1;
    if (this.showsAcceptanceWithoutFixing(experience)) presence_score += 0.2;

    // Markers of narrative attention
    if (this.heavyOnPastFutureReference(experience)) presence_score -= 0.2;
    if (this.showsCompulsiveMeaningMaking(experience)) presence_score -= 0.1;

    // McGilchrist enhancement: Right hemisphere enables true presence
    if (mcgilchrist_mode.quality.presencing > 0.7) {
      presence_score += 0.2;
    }
    
    // Left hemisphere dominance reduces presence
    if (mcgilchrist_mode.hemisphere === 'left_dominant') {
      presence_score -= 0.1;
    }
    
    return Math.max(0, Math.min(1, presence_score));
  }

  /**
   * Resistance: What's being avoided or pushed away
   * Enhanced: Left hemisphere often resists right hemisphere insights
   */
  private detectResistance(experience: any, mcgilchrist_mode: McGilchristAttentionMode): number {
    let resistance_score = 0.5;

    // Markers of resistance
    if (this.showsAvoidancePatterns(experience)) resistance_score += 0.3;
    if (this.hasEmotionalNumbing(experience)) resistance_score += 0.2;
    if (this.showsIntellectualBypass(experience)) resistance_score += 0.2;

    // Markers of acceptance
    if (this.showsDirectEngagement(experience)) resistance_score -= 0.2;
    if (this.includesDifficultEmotions(experience)) resistance_score -= 0.1;

    // McGilchrist enhancement: Emissary usurping Master creates resistance
    if (mcgilchrist_mode.master_emissary_balance < 0.3) {
      resistance_score += 0.2; // Left hemisphere rejecting right hemisphere wisdom
    }
    
    return Math.max(0, Math.min(1, resistance_score));
  }

  /**
   * Opening: What's emerging unbidden, spontaneously
   * McGilchrist: Right hemisphere is receptive to emergence; left hemisphere controls
   */
  private detectOpening(experience: any, mcgilchrist_mode: McGilchristAttentionMode): number {
    let opening_score = 0.5;

    // Markers of opening
    if (this.containsSpontaneousInsight(experience)) opening_score += 0.3;
    if (this.showsUnexpectedEmotionalMovement(experience)) opening_score += 0.2;
    if (this.revealsNewPerspectives(experience)) opening_score += 0.2;
    if (this.containsInexplicablePull(experience)) opening_score += 0.3; // Daimonic marker

    // Markers of closure
    if (this.showsRigidControl(experience)) opening_score -= 0.2;
    if (this.resistsNewInformation(experience)) opening_score -= 0.1;

    // McGilchrist enhancement: Right hemisphere enables opening
    if (mcgilchrist_mode.quality.presencing > 0.6) {
      opening_score += 0.2;
    }
    
    // Left hemisphere dominance reduces opening
    if (mcgilchrist_mode.hemisphere === 'left_dominant') {
      opening_score -= 0.2;
    }
    
    return Math.max(0, Math.min(1, opening_score));
  }

  /**
   * Coherence: How unified vs fragmented the attention
   * McGilchrist: Right hemisphere naturally coherent; left fragments
   */
  private measureCoherence(experience: any, mcgilchrist_mode: McGilchristAttentionMode): number {
    let coherence_score = 0.5;

    // Markers of coherent attention
    if (this.showsHolisticUnderstanding(experience)) coherence_score += 0.2;
    if (this.integratesSeemingContradictions(experience)) coherence_score += 0.2;
    if (this.maintainsSteadyFocus(experience)) coherence_score += 0.1;

    // Markers of fragmented attention
    if (this.showsScatteredFocus(experience)) coherence_score -= 0.2;
    if (this.cannotIntegrateOpposites(experience)) coherence_score -= 0.1;

    // McGilchrist enhancement: Right hemisphere enables natural coherence
    if (mcgilchrist_mode.hemisphere === 'right_dominant' || mcgilchrist_mode.hemisphere === 'integrated') {
      coherence_score += 0.2;
    }
    
    // Left hemisphere dominance can fragment
    if (mcgilchrist_mode.hemisphere === 'left_dominant') {
      coherence_score -= 0.1;
    }
    
    return Math.max(0, Math.min(1, coherence_score));
  }

  /**
   * Extract the explicit narrative content - what the person thinks is happening
   */
  private extractNarrativeLayer(experience: any): any {
    return {
      explicit_content: experience.content || experience.text || '',
      stated_intentions: this.extractStatedGoals(experience),
      conscious_emotions: this.extractExplicitEmotions(experience),
      narrative_arc: this.detectStoryStructure(experience)
    };
  }

  /**
   * Detect edge phenomena - what's emerging at the borders of awareness
   * This is often where the daimon first announces itself
   */
  private detectEdgePhenomena(experience: any): any {
    return {
      peripheral_impulses: this.scanForUnnamedImpulses(experience),
      somatic_edges: this.detectBodilyTensions(experience),
      emotional_undertones: this.scanEmotionalUndercurrents(experience),
      symbolic_intrusions: this.detectSymbolicContent(experience),
      resistance_edges: this.mapAvoidancePatterns(experience)
    };
  }

  /**
   * Track bodily knowing - the felt sense that often knows before the mind
   * Kastrup: The body is often the first to recognize daimonic movement
   */
  private trackBodilyKnowing(experience: any): any {
    return {
      energy_shifts: this.detectEnergyMovements(experience),
      felt_sense: this.extractFeltSense(experience),
      somatic_impulses: this.trackBodilyImpulses(experience),
      physiological_responses: this.detectPhysicalResponses(experience),
      elemental_resonance: this.detectElementalSomatics(experience)
    };
  }

  /**
   * Recognize archetypal patterns - deeper currents beyond personal psychology
   * The daimon often speaks through archetypal language
   */
  private recognizeArchetypalPatterns(experience: any): any {
    return {
      archetypal_motifs: this.scanArchetypalContent(experience),
      mythic_resonances: this.detectMythicParallels(experience),
      collective_currents: this.scanCollectiveThemes(experience),
      symbolic_clusters: this.groupSymbolicContent(experience),
      daimonic_signatures: this.scanForDaimonicMarkers(experience)
    };
  }

  /**
   * Record this moment of attention for pattern learning
   * Enhanced with hemispheric shift tracking
   */
  private recordAttentionMoment(context: string, layers: AttentionLayer): void {
    const previous_mode = this.attention_history.length > 0 ? 
      this.attention_history[this.attention_history.length - 1].quality.mcgilchrist_mode.hemisphere : 
      'conflicted';
    
    const current_mode = this.attention_quality.mcgilchrist_mode.hemisphere;
    
    const moment: AttentionHistory = {
      timestamp: new Date(),
      quality: { ...this.attention_quality },
      context,
      elemental_resonance: this.detectElementalResonance(layers),
      daimonic_activity: this.assessDaimonicActivity(layers)
    };
    
    // Track hemispheric shifts
    if (previous_mode !== current_mode) {
      moment.hemispheric_shift = {
        from: previous_mode as 'left' | 'right' | 'integrated',
        to: current_mode as 'left' | 'right' | 'integrated',
        trigger: context
      };
    }

    this.attention_history.push(moment);

    // Learn patterns over time including hemispheric patterns
    this.updateCharacteristicPatterns(context, moment);

    // Keep history manageable
    if (this.attention_history.length > 1000) {
      this.attention_history = this.attention_history.slice(-1000);
    }
  }

  /**
   * Detect which element most resonates with this attention pattern
   */
  private detectElementalResonance(layers: AttentionLayer): Element | undefined {
    const scores = {
      fire: this.calculateFireResonance(layers),
      water: this.calculateWaterResonance(layers),
      earth: this.calculateEarthResonance(layers),
      air: this.calculateAirResonance(layers),
      aether: this.calculateAetherResonance(layers)
    };

    const max_element = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as Element] > scores[b[0] as Element] ? a : b
    )[0] as Element;

    return scores[max_element] > 0.6 ? max_element : undefined;
  }

  /**
   * Assess how much daimonic energy is present in this attention moment
   */
  private assessDaimonicActivity(layers: AttentionLayer): number {
    let activity = 0;

    // Kastrup's markers
    if (layers.liminal.peripheral_impulses?.inexplicable_pull) activity += 0.3;
    if (layers.symbolic.daimonic_signatures?.anti_utilitarian) activity += 0.2;
    if (layers.somatic.energy_shifts?.morphological) activity += 0.2;
    if (this.attention_quality.opening > 0.7) activity += 0.2;
    if (this.attention_quality.resistance > 0.6 && this.attention_quality.opening > 0.5) activity += 0.1; // Paradoxical resistance to call

    return Math.min(1, activity);
  }

  // McGilchrist-specific helper methods
  private showsEmbodiedAwareness(experience: any): boolean { 
    // Right hemisphere: body-integrated awareness
    return this.containsBodilyReferences(experience) || this.showsSomaticIntelligence(experience);
  }
  
  private emphasizesRelationship(experience: any): boolean {
    // Right hemisphere: relational, contextual
    return this.focusesOnConnections(experience) || this.showsContextualThinking(experience);
  }
  
  private graspsTotalityNotParts(experience: any): boolean {
    // Right hemisphere: sees wholes, Gestalt
    return this.demonstratesHolisticUnderstanding(experience) || this.showsPatternRecognition(experience);
  }
  
  private showsImplicitUnderstanding(experience: any): boolean {
    // Right hemisphere: knows implicitly, doesn't need explicit explanation
    return this.demonstratesIntuitiveKnowing(experience) || this.showsTacitKnowledge(experience);
  }
  
  private demonstratesLivingAttention(experience: any): boolean {
    // Right hemisphere: living, not mechanical
    return this.showsOrganicFlow(experience) || this.demonstratesVitalEngagement(experience);
  }
  
  private expressesThroughMetaphor(experience: any): boolean {
    // Right hemisphere: metaphorical, not literal
    return this.containsMetaphoricLanguage(experience) || this.showsSymbolicThinking(experience);
  }
  
  private showsParadoxicalThinking(experience: any): boolean {
    // Right hemisphere: comfortable with paradox
    return this.embracesContradiction(experience) || this.showsNonLinearLogic(experience);
  }
  
  private breaksIntoComponents(experience: any): boolean {
    // Left hemisphere: parts, analysis, breakdown
    return this.showsAnalyticalBreakdown(experience) || this.focusesOnComponents(experience);
  }
  
  private emphasizesAbstraction(experience: any): boolean {
    // Left hemisphere: abstract, not embodied
    return this.showsAbstractLanguage(experience) || this.lacksConcreteReferences(experience);
  }
  
  private seeksCategorization(experience: any): boolean {
    // Left hemisphere: categories, not individuals
    return this.createsCategories(experience) || this.generalizesFromSpecifics(experience);
  }
  
  private requiresExplicitness(experience: any): boolean {
    // Left hemisphere: explicit, not implicit
    return this.demandsClearDefinitions(experience) || this.resistsAmbiguity(experience);
  }
  
  private showsMechanicalThinking(experience: any): boolean {
    // Left hemisphere: mechanical, not living
    return this.treatsSelfAsMachine(experience) || this.showsReductionistThinking(experience);
  }
  
  private focusesOnUtility(experience: any): boolean {
    // Left hemisphere: utility, manipulation, control
    return this.emphasizesUsefulness(experience) || this.seeksControlOverOutcomes(experience);
  }
  
  private recognizesEmergentProperties(experience: any): boolean {
    // Betweenness: what emerges from relationship
    return this.identifiesSystemicProperties(experience) || this.recognizesWholeGreaterThanParts(experience);
  }
  
  private showsSystemicThinking(experience: any): boolean {
    // Betweenness: systems, not just individuals
    return this.thinksInSystems(experience) || this.recognizesInterconnection(experience);
  }
  
  // Placeholder implementations - would be enhanced with actual pattern detection
  private containsBodilyReferences(experience: any): boolean { return false; }
  private showsSomaticIntelligence(experience: any): boolean { return false; }
  private focusesOnConnections(experience: any): boolean { return false; }
  private showsContextualThinking(experience: any): boolean { return false; }
  private demonstratesHolisticUnderstanding(experience: any): boolean { return false; }
  private showsPatternRecognition(experience: any): boolean { return false; }
  private demonstratesIntuitiveKnowing(experience: any): boolean { return false; }
  private showsTacitKnowledge(experience: any): boolean { return false; }
  private showsOrganicFlow(experience: any): boolean { return false; }
  private demonstratesVitalEngagement(experience: any): boolean { return false; }
  private containsMetaphoricLanguage(experience: any): boolean { return false; }
  private showsSymbolicThinking(experience: any): boolean { return false; }
  private embracesContradiction(experience: any): boolean { return false; }
  private showsNonLinearLogic(experience: any): boolean { return false; }
  private showsAnalyticalBreakdown(experience: any): boolean { return false; }
  private focusesOnComponents(experience: any): boolean { return false; }
  private showsAbstractLanguage(experience: any): boolean { return false; }
  private lacksConcreteReferences(experience: any): boolean { return false; }
  private createsCategories(experience: any): boolean { return false; }
  private generalizesFromSpecifics(experience: any): boolean { return false; }
  private demandsClearDefinitions(experience: any): boolean { return false; }
  private resistsAmbiguity(experience: any): boolean { return false; }
  private treatsSelfAsMachine(experience: any): boolean { return false; }
  private showsReductionistThinking(experience: any): boolean { return false; }
  private emphasizesUsefulness(experience: any): boolean { return false; }
  private seeksControlOverOutcomes(experience: any): boolean { return false; }
  private identifiesSystemicProperties(experience: any): boolean { return false; }
  private recognizesWholeGreaterThanParts(experience: any): boolean { return false; }
  private thinksInSystems(experience: any): boolean { return false; }
  private recognizesInterconnection(experience: any): boolean { return false; }
  
  // Original helper methods for attention assessment
  private hasDetailedSensoryData(experience: any): boolean { /* Implementation */ return false; }
  private showsTimeDialation(experience: any): boolean { /* Implementation */ return false; }
  private revealsSubtleConnections(experience: any): boolean { /* Implementation */ return false; }
  private showsImpatience(experience: any): boolean { /* Implementation */ return false; }
  private hasMultipleSimultaneousFoci(experience: any): boolean { /* Implementation */ return false; }
  private emphasizesSensoryImmediate(experience: any): boolean { /* Implementation */ return false; }
  private lacksTemporalProjection(experience: any): boolean { /* Implementation */ return false; }
  private showsAcceptanceWithoutFixing(experience: any): boolean { /* Implementation */ return false; }
  private heavyOnPastFutureReference(experience: any): boolean { /* Implementation */ return false; }
  private showsCompulsiveMeaningMaking(experience: any): boolean { /* Implementation */ return false; }
  private showsAvoidancePatterns(experience: any): boolean { /* Implementation */ return false; }
  private hasEmotionalNumbing(experience: any): boolean { /* Implementation */ return false; }
  private showsIntellectualBypass(experience: any): boolean { /* Implementation */ return false; }
  private showsDirectEngagement(experience: any): boolean { /* Implementation */ return false; }
  private includesDifficultEmotions(experience: any): boolean { /* Implementation */ return false; }
  private containsSpontaneousInsight(experience: any): boolean { /* Implementation */ return false; }
  private showsUnexpectedEmotionalMovement(experience: any): boolean { /* Implementation */ return false; }
  private revealsNewPerspectives(experience: any): boolean { /* Implementation */ return false; }
  private containsInexplicablePull(experience: any): boolean { /* Implementation */ return false; }
  private showsRigidControl(experience: any): boolean { /* Implementation */ return false; }
  private resistsNewInformation(experience: any): boolean { /* Implementation */ return false; }
  private showsHolisticUnderstanding(experience: any): boolean { /* Implementation */ return false; }
  private integratesSeemingContradictions(experience: any): boolean { /* Implementation */ return false; }
  private maintainsSteadyFocus(experience: any): boolean { /* Implementation */ return false; }
  private showsScatteredFocus(experience: any): boolean { /* Implementation */ return false; }
  private cannotIntegrateOpposites(experience: any): boolean { /* Implementation */ return false; }

  // Layer extraction helpers
  private extractStatedGoals(experience: any): any { /* Implementation */ return {}; }
  private extractExplicitEmotions(experience: any): any { /* Implementation */ return {}; }
  private detectStoryStructure(experience: any): any { /* Implementation */ return {}; }
  private scanForUnnamedImpulses(experience: any): any { /* Implementation */ return {}; }
  private detectBodilyTensions(experience: any): any { /* Implementation */ return {}; }
  private scanEmotionalUndercurrents(experience: any): any { /* Implementation */ return {}; }
  private detectSymbolicContent(experience: any): any { /* Implementation */ return {}; }
  private mapAvoidancePatterns(experience: any): any { /* Implementation */ return {}; }
  private detectEnergyMovements(experience: any): any { /* Implementation */ return {}; }
  private extractFeltSense(experience: any): any { /* Implementation */ return {}; }
  private trackBodilyImpulses(experience: any): any { /* Implementation */ return {}; }
  private detectPhysicalResponses(experience: any): any { /* Implementation */ return {}; }
  private detectElementalSomatics(experience: any): any { /* Implementation */ return {}; }
  private scanArchetypalContent(experience: any): any { /* Implementation */ return {}; }
  private detectMythicParallels(experience: any): any { /* Implementation */ return {}; }
  private scanCollectiveThemes(experience: any): any { /* Implementation */ return {}; }
  private groupSymbolicContent(experience: any): any { /* Implementation */ return {}; }
  private scanForDaimonicMarkers(experience: any): any { /* Implementation */ return {}; }

  // Elemental resonance calculations
  private calculateFireResonance(layers: AttentionLayer): number {
    let resonance = 0;
    if (this.attention_quality.depth > 0.7) resonance += 0.3; // Fire loves depth
    if (layers.somatic.energy_shifts?.ascending) resonance += 0.2;
    if (layers.symbolic.archetypal_motifs?.hero_warrior) resonance += 0.2;
    return resonance;
  }

  private calculateWaterResonance(layers: AttentionLayer): number {
    let resonance = 0;
    if (this.attention_quality.opening > 0.7) resonance += 0.3; // Water is receptive
    if (layers.somatic.felt_sense?.flowing) resonance += 0.2;
    if (layers.liminal.emotional_undertones?.depth) resonance += 0.2;
    return resonance;
  }

  private calculateEarthResonance(layers: AttentionLayer): number {
    let resonance = 0;
    if (this.attention_quality.coherence > 0.7) resonance += 0.3; // Earth holds steady
    if (layers.somatic.somatic_impulses?.grounding) resonance += 0.2;
    if (this.attention_quality.presence > 0.7) resonance += 0.2; // Present moment
    return resonance;
  }

  private calculateAirResonance(layers: AttentionLayer): number {
    let resonance = 0;
    if (layers.surface.narrative_arc?.clear) resonance += 0.2; // Air articulates
    if (layers.liminal.peripheral_impulses?.connections) resonance += 0.3;
    if (this.attention_quality.coherence > 0.6 && this.attention_quality.depth > 0.6) resonance += 0.2;
    return resonance;
  }

  private calculateAetherResonance(layers: AttentionLayer): number {
    let resonance = 0;
    if (layers.symbolic.collective_currents?.present) resonance += 0.3; // Aether sees the whole
    if (this.attention_quality.coherence > 0.8) resonance += 0.2;
    if (layers.symbolic.daimonic_signatures?.integration) resonance += 0.3;
    return resonance;
  }

  private updateCharacteristicPatterns(context: string, moment: AttentionHistory): void {
    // Learn individual's characteristic attention patterns
    const pattern_key = `${context}_depth`;
    const current_avg = this.characteristic_patterns.get(pattern_key) || 0.5;
    const new_avg = current_avg * 0.9 + moment.quality.depth * 0.1;
    this.characteristic_patterns.set(pattern_key, new_avg);

    // Similar for other qualities...
  }

  /**
   * Public interface for checking attention patterns
   * Enhanced with McGilchrist insights
   */
  public getCurrentAttentionQuality(): AttentionQuality {
    return { ...this.attention_quality };
  }
  
  public getCurrentHemisphericMode(): McGilchristAttentionMode {
    return { ...this.attention_quality.mcgilchrist_mode };
  }
  
  public getCurrentDaimonicMarkers(): DaimonicAttentionMarkers {
    return { ...this.attention_quality.daimonic_markers };
  }
  
  public getDaimonicActivity(): number {
    const markers = this.attention_quality.daimonic_markers;
    return (markers.imaginal_receptivity + markers.big_dream_quality + 
            markers.ruthless_calling + markers.synchronicity_sensitivity) / 4;
  }
  
  public getMasterEmissaryBalance(): number {
    return this.attention_quality.mcgilchrist_mode.master_emissary_balance;
  }
  
  public getHemisphericShifts(limit: number = 10): AttentionHistory[] {
    return this.attention_history
      .filter(moment => moment.hemispheric_shift)
      .slice(-limit);
  }

  public getAttentionHistory(limit: number = 10): AttentionHistory[] {
    return this.attention_history.slice(-limit);
  }

  public getCharacteristicPattern(context: string, quality: keyof AttentionQuality): number {
    return this.characteristic_patterns.get(`${context}_${quality}`) || 0.5;
  }

  /**
   * Integration method for other systems to pass experience through attention field
   * Enhanced with McGilchrist + Harpur daimonic analysis
   */
  public processExperience(experience: any, context: string = 'general'): {
    layers: AttentionLayer;
    attention_quality: AttentionQuality;
    hemispheric_analysis: McGilchristAttentionMode;
    daimonic_activity: number;
    daimonic_markers: DaimonicAttentionMarkers;
    elemental_resonance?: Element;
    master_emissary_guidance?: string;
    daimonic_guidance?: string;
  } {
    const layers = this.observe(experience, context);
    const hemispheric_analysis = this.getCurrentHemisphericMode();
    const attention_quality = this.getCurrentAttentionQuality();
    
    return {
      layers,
      attention_quality,
      hemispheric_analysis,
      daimonic_activity: this.assessDaimonicActivity(layers),
      daimonic_markers: attention_quality.daimonic_markers,
      elemental_resonance: this.detectElementalResonance(layers),
      master_emissary_guidance: this.generateMasterEmissaryGuidance(hemispheric_analysis),
      daimonic_guidance: this.generateDaimonicGuidance(attention_quality.daimonic_markers)
    };
  }
  
  /**
   * Generate guidance based on daimonic markers
   * Harpur: Point toward mystery without explaining it away
   */
  private generateDaimonicGuidance(markers: DaimonicAttentionMarkers): string {
    if (markers.big_dream_quality > 0.7) {
      return 'This experience carries "Big Dream" quality — more real than ordinary reality. The autonomous imagination is speaking.';
    } else if (markers.ruthless_calling > 0.6) {
      return 'Something drives you against your personal will. Harpur would say: the daimon doesn\'t save you from suffering but brings great meaning.';
    } else if (markers.synchronicity_sensitivity > 0.6) {
      return 'The meaningful coincidences aren\'t random — the daimons communicate through the world\'s apparent chaos.';
    } else if (markers.imaginal_receptivity > 0.7) {
      return 'Your attention opens to the autonomous imagination — not psychology but ontology. The imaginal realm is real.';
    } else if (markers.initiatory_recognition > 0.6) {
      return 'You recognize suffering as sacred ordeal. Traditional cultures would call this initiation.';
    } else {
      return 'Stay receptive to what has no explanation. The daimon speaks through what cannot be grasped.';
    }
  }
  
  /**
   * Generate guidance based on Master-Emissary relationship
   */
  private generateMasterEmissaryGuidance(mode: McGilchristAttentionMode): string {
    if (mode.hemisphere === 'left_dominant') {
      return 'The Emissary (left hemisphere) has usurped the Master. Try softening your gaze, feeling into your body, noticing the whole rather than analyzing parts.';
    } else if (mode.hemisphere === 'right_dominant') {
      return 'The Master (right hemisphere) is present. Trust this embodied, holistic awareness while using focused analysis only when needed.';
    } else if (mode.hemisphere === 'integrated') {
      return 'Beautiful integration: the Master leads while the Emissary serves. This is optimal attention.';
    } else {
      return 'Attention is conflicted between hemispheres. Notice which mode serves this moment — presencing the whole or focusing on parts?';
    }
  }
}