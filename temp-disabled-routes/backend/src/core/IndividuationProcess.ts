/**
 * IndividuationProcess - Jungian Depth Psychology Integration
 * 
 * "Individuation means becoming a single, homogeneous being, and,
 * in so far as 'individuality' embraces our innermost, last, and
 * incomparable uniqueness, it also implies becoming one's own self."
 * - C.G. Jung
 * 
 * This service tracks the Jungian individuation process through:
 * - Shadow recognition and integration
 * - Anima/Animus relationship dynamics
 * - Ego-Self axis development
 * - Archetypal constellation patterns
 * 
 * Integrates with Spiralogic's elemental framework and McGilchrist's
 * attention insights to create a comprehensive depth psychology system.
 */

import { Element } from '../types/shift';
import { McGilchristAttentionMode, AttentionLayer } from './AttentionField';
import { logger } from '../utils/logger';

export interface ShadowProfile {
  recognized: ShadowAspect[];      // Consciously acknowledged shadows
  integrated: ShadowAspect[];      // Actively being integrated
  projected: ShadowAspect[];       // Still projected onto others
  elemental_shadows: ElementalShadowMap; // Shadow distributed across elements
}

export interface ShadowAspect {
  aspect: string;                  // Name of shadow aspect (e.g. 'rage', 'neediness')
  trigger_patterns: string[];      // What activates this shadow
  projection_targets: string[];    // Where/who this gets projected onto
  integration_stage: 'unconscious' | 'recognized' | 'engaging' | 'integrated';
  emotional_charge: number;        // 0-1: How activated this shadow is
  elemental_home: Element;         // Which element houses this shadow
  archetypal_pattern?: string;     // Associated archetype (Shadow, Anima, etc.)
}

export interface ElementalShadowMap {
  fire: ShadowAspect[];           // Suppressed passion, rage, drive
  water: ShadowAspect[];          // Rejected vulnerability, emotion, flow
  earth: ShadowAspect[];          // Denied instincts, body, groundedness
  air: ShadowAspect[];            // Banished thoughts, perspectives, clarity
  aether: ShadowAspect[];         // Lost connection to meaning, wholeness
}

export interface AnimaAnimusProfile {
  constellation: 'anima' | 'animus' | 'both' | 'unclear';
  relationship_stage: 'unconscious' | 'projected' | 'fascinated' | 'withdrawing' | 'differentiated' | 'integrated';
  projection_patterns: {
    positive: string[];            // Idealization patterns
    negative: string[];            // Demonization patterns
    current_target?: string;       // Current projection holder
  };
  inner_relationship: {
    dialogue_quality: number;      // 0-1: How well inner dialogue flows
    creative_collaboration: number; // 0-1: How well anima/animus serves creativity
    wisdom_access: number;         // 0-1: Access to deeper wisdom
  };
  developmental_stage: string;     // Current developmental focus
}

export interface SelfAxis {
  axis_strength: number;           // 0-1: Ego-Self axis development
  self_glimpses: SelfGlimpse[];    // Moments of Self-recognition
  ego_inflation: number;           // 0-1: How inflated ego currently is
  ego_resilience: number;          // 0-1: Healthy ego strength
  self_alignment: number;          // 0-1: How aligned with deeper Self
  archetypal_guidance: string[];   // Active archetypal patterns offering guidance
}

export interface SelfGlimpse {
  timestamp: Date;
  experience: string;              // Description of Self-experience
  context: string;                 // What triggered it
  integration_insights: string[];  // What was learned/integrated
  lasting_impact: number;          // 0-1: How much this changed the person
}

export interface IndividuationStage {
  overall_stage: 'identification' | 'shadow_work' | 'anima_animus' | 'self_realization' | 'integration';
  shadow: ShadowProfile;
  anima_animus: AnimaAnimusProfile;
  self_axis: SelfAxis;
  active_complexes: ArchetypalComplex[];
  individuation_progress: number;   // 0-1: Overall development
  current_developmental_edge: string;
}

export interface ArchetypalComplex {
  archetype: string;               // Persona, Shadow, Anima/Animus, Self, Mother, Father, Hero, etc.
  constellation_strength: number;  // 0-1: How active/charged this complex is
  integration_level: number;       // 0-1: How well integrated
  manifestation_patterns: string[]; // How this archetype shows up
  compensation_needed?: string;    // What other archetypal energy is needed for balance
}

/**
 * IndividuationProcess: Tracks and supports Jungian individuation
 */
export class IndividuationService {
  private individuation_history: Map<string, IndividuationStage[]>; // User ID -> stages over time
  private archetypal_patterns: Map<string, ArchetypalComplex>; // Learned archetypal patterns
  
  constructor() {
    this.individuation_history = new Map();
    this.archetypal_patterns = new Map();
  }

  /**
   * Primary individuation assessment
   * Analyzes current psychological material for individuation patterns
   */
  async trackIndividuation(
    userId: string, 
    experience: any, 
    attention_analysis?: { layers: AttentionLayer; hemispheric_analysis: McGilchristAttentionMode }
  ): Promise<IndividuationStage> {
    try {
      // Process shadow material
      const shadow = await this.processShadowMaterial(experience, attention_analysis);
      
      // Assess anima/animus dynamics
      const anima_animus = await this.assessAnimaAnimus(experience, attention_analysis);
      
      // Measure ego-self axis
      const self_axis = await this.measureEgoSelfAxis(experience, attention_analysis);
      
      // Identify active archetypal complexes
      const active_complexes = await this.identifyActiveComplexes(experience, shadow, anima_animus);
      
      // Determine overall individuation stage
      const overall_stage = this.determineIndividuationStage(shadow, anima_animus, self_axis);
      
      // Calculate overall progress
      const individuation_progress = this.calculateIndividuationProgress(shadow, anima_animus, self_axis);
      
      // Identify current developmental edge
      const current_developmental_edge = this.identifyDevelopmentalEdge(shadow, anima_animus, self_axis);

      const stage: IndividuationStage = {
        overall_stage,
        shadow,
        anima_animus,
        self_axis,
        active_complexes,
        individuation_progress,
        current_developmental_edge
      };

      // Store in history
      const history = this.individuation_history.get(userId) || [];
      history.push(stage);
      this.individuation_history.set(userId, history.slice(-20)); // Keep last 20 stages

      return stage;

    } catch (error) {
      logger.error('Error in individuation tracking', { error, userId });
      return this.getMinimalIndividuationStage();
    }
  }

  /**
   * Process shadow material
   * Jung: Shadow = everything we've rejected about ourselves
   */
  private async processShadowMaterial(
    experience: any, 
    attention_analysis?: any
  ): Promise<ShadowProfile> {
    // Find emotional charges - strong reactions often indicate shadow
    const emotional_charges = this.findEmotionalCharges(experience);
    
    // Identify projection patterns - what we strongly react to in others
    const projections = this.identifyProjections(emotional_charges);
    
    // Map shadow to elemental system
    const elemental_shadows = this.mapShadowToElements(emotional_charges, projections);
    
    // Assess integration progress
    const integration_assessment = this.assessShadowIntegration(elemental_shadows, attention_analysis);

    return {
      recognized: integration_assessment.recognized,
      integrated: integration_assessment.integrated,
      projected: integration_assessment.projected,
      elemental_shadows
    };
  }

  /**
   * Find emotional charges in experience
   * Strong emotional reactions often indicate shadow activation
   */
  private findEmotionalCharges(experience: any): Array<{emotion: string, intensity: number, trigger: string}> {
    const charges: Array<{emotion: string, intensity: number, trigger: string}> = [];
    
    // Look for intense emotional language
    const intense_emotions = this.extractIntenseEmotions(experience);
    
    // Look for "should" statements - often shadow projections
    const shoulds = this.findShouldStatements(experience);
    
    // Look for strong judgments of others
    const judgments = this.findJudgmentalLanguage(experience);
    
    // Look for what's being avoided or resisted
    const avoidances = this.findAvoidancePatterns(experience);

    charges.push(...intense_emotions, ...shoulds, ...judgments, ...avoidances);

    return charges.filter(charge => charge.intensity > 0.6); // Only strong charges
  }

  /**
   * Map shadow aspects to elemental homes
   * Each element tends to house specific types of shadow material
   */
  private mapShadowToElements(
    charges: Array<{emotion: string, intensity: number, trigger: string}>, 
    projections: any[]
  ): ElementalShadowMap {
    const elemental_shadows: ElementalShadowMap = {
      fire: [],
      water: [],
      earth: [],
      air: [],
      aether: []
    };

    for (const charge of charges) {
      const shadow_aspect: ShadowAspect = {
        aspect: charge.emotion,
        trigger_patterns: [charge.trigger],
        projection_targets: this.findProjectionTargetsForCharge(charge, projections),
        integration_stage: this.assessIntegrationStage(charge),
        emotional_charge: charge.intensity,
        elemental_home: this.determineElementalHome(charge),
        archetypal_pattern: this.identifyArchetypalPattern(charge)
      };

      elemental_shadows[shadow_aspect.elemental_home].push(shadow_aspect);
    }

    return elemental_shadows;
  }

  /**
   * Determine which element houses a particular shadow aspect
   */
  private determineElementalHome(charge: {emotion: string, intensity: number, trigger: string}): Element {
    const emotion_lower = charge.emotion.toLowerCase();
    
    // Fire shadows: rage, ambition, pride, impatience
    if (['rage', 'anger', 'fury', 'impatience', 'arrogance', 'pride'].some(e => emotion_lower.includes(e))) {
      return 'fire';
    }
    
    // Water shadows: neediness, manipulation, victim, overwhelm
    if (['neediness', 'clingy', 'victim', 'overwhelm', 'depression', 'self-pity'].some(e => emotion_lower.includes(e))) {
      return 'water';
    }
    
    // Earth shadows: stubbornness, greed, laziness, materialism
    if (['stubborn', 'greedy', 'lazy', 'materialistic', 'possessive', 'rigid'].some(e => emotion_lower.includes(e))) {
      return 'earth';
    }
    
    // Air shadows: intellectualization, superiority, coldness, detachment
    if (['superior', 'cold', 'detached', 'critical', 'intellectual', 'aloof'].some(e => emotion_lower.includes(e))) {
      return 'air';
    }
    
    // Aether shadows: spiritual bypassing, grandiosity, meaninglessness
    if (['grandiose', 'spiritual', 'meaningless', 'empty', 'disconnected'].some(e => emotion_lower.includes(e))) {
      return 'aether';
    }

    return 'water'; // Default - most shadow tends to be emotional
  }

  /**
   * Assess anima/animus dynamics
   * The contrasexual archetype that mediates between ego and unconscious
   */
  private async assessAnimaAnimus(
    experience: any, 
    attention_analysis?: any
  ): Promise<AnimaAnimusProfile> {
    // Determine constellation (anima/animus)
    const constellation = this.determineAnimaAnimusConstellation(experience);
    
    // Assess relationship stage
    const relationship_stage = this.assessAnimaAnimusRelationshipStage(experience);
    
    // Identify projection patterns
    const projection_patterns = this.identifyAnimaAnimusProjections(experience);
    
    // Measure inner relationship quality
    const inner_relationship = this.measureInnerRelationship(experience, attention_analysis);
    
    // Determine developmental stage
    const developmental_stage = this.determineAnimaAnimusDevelopmentalStage(
      relationship_stage, 
      inner_relationship
    );

    return {
      constellation,
      relationship_stage,
      projection_patterns,
      inner_relationship,
      developmental_stage
    };
  }

  /**
   * Measure ego-self axis development
   * The relationship between ego and the deeper Self
   */
  private async measureEgoSelfAxis(
    experience: any, 
    attention_analysis?: any
  ): Promise<SelfAxis> {
    // Extract Self glimpses - moments of deeper recognition
    const self_glimpses = this.extractSelfGlimpses(experience);
    
    // Measure ego inflation vs healthy ego
    const ego_inflation = this.measureEgoInflation(experience, attention_analysis);
    const ego_resilience = this.measureEgoResilience(experience);
    
    // Assess alignment with deeper Self
    const self_alignment = this.measureSelfAlignment(experience, attention_analysis);
    
    // Calculate axis strength
    const axis_strength = this.calculateAxisStrength(ego_resilience, self_alignment, ego_inflation);
    
    // Identify active archetypal guidance
    const archetypal_guidance = this.identifyArchetypalGuidance(experience);

    return {
      axis_strength,
      self_glimpses,
      ego_inflation,
      ego_resilience,
      self_alignment,
      archetypal_guidance
    };
  }

  /**
   * Extract moments of Self-recognition
   * Jung: The Self makes itself known through numinous experiences
   */
  private extractSelfGlimpses(experience: any): SelfGlimpse[] {
    const glimpses: SelfGlimpse[] = [];
    
    // Look for numinous language - awe, transcendence, unity
    const numinous_moments = this.findNuminousExperiences(experience);
    
    // Look for synchronicity recognition
    const synchronicities = this.findSynchronicityRecognition(experience);
    
    // Look for wholeness experiences
    const wholeness_moments = this.findWholenessExperiences(experience);
    
    // Look for meaning-making breakthroughs
    const meaning_breakthroughs = this.findMeaningBreakthroughs(experience);

    for (const moment of [...numinous_moments, ...synchronicities, ...wholeness_moments, ...meaning_breakthroughs]) {
      if (moment.intensity > 0.7) { // Only strong Self-experiences
        glimpses.push({
          timestamp: new Date(),
          experience: moment.description,
          context: moment.context,
          integration_insights: moment.insights || [],
          lasting_impact: moment.intensity
        });
      }
    }

    return glimpses;
  }

  /**
   * Determine overall individuation stage
   */
  private determineIndividuationStage(
    shadow: ShadowProfile, 
    anima_animus: AnimaAnimusProfile, 
    self_axis: SelfAxis
  ): IndividuationStage['overall_stage'] {
    // Early stage: Identification with persona/ego
    if (shadow.recognized.length === 0 && self_axis.ego_inflation > 0.7) {
      return 'identification';
    }
    
    // Shadow work stage: Encountering the shadow
    if (shadow.recognized.length > shadow.integrated.length && shadow.projected.length > 3) {
      return 'shadow_work';
    }
    
    // Anima/Animus stage: Encountering the contrasexual
    if (anima_animus.relationship_stage === 'projected' || anima_animus.relationship_stage === 'fascinated') {
      return 'anima_animus';
    }
    
    // Self-realization: Ego-Self axis strengthening
    if (self_axis.axis_strength > 0.6 && self_axis.self_glimpses.length > 2) {
      return 'self_realization';
    }
    
    // Integration: Ongoing balance and wholeness
    if (shadow.integrated.length > shadow.projected.length && 
        anima_animus.relationship_stage === 'integrated' && 
        self_axis.axis_strength > 0.7) {
      return 'integration';
    }

    return 'shadow_work'; // Default - most people are working with shadow
  }

  /**
   * Calculate overall individuation progress
   */
  private calculateIndividuationProgress(
    shadow: ShadowProfile, 
    anima_animus: AnimaAnimusProfile, 
    self_axis: SelfAxis
  ): number {
    let progress = 0;
    
    // Shadow work progress (0-0.4)
    const shadow_progress = shadow.integrated.length / Math.max(1, shadow.recognized.length + shadow.projected.length);
    progress += shadow_progress * 0.4;
    
    // Anima/Animus progress (0-0.3)
    const anima_animus_stages = ['unconscious', 'projected', 'fascinated', 'withdrawing', 'differentiated', 'integrated'];
    const anima_animus_progress = anima_animus_stages.indexOf(anima_animus.relationship_stage) / (anima_animus_stages.length - 1);
    progress += anima_animus_progress * 0.3;
    
    // Self-axis progress (0-0.3)
    progress += self_axis.axis_strength * 0.3;

    return Math.min(1, Math.max(0, progress));
  }

  // Helper method implementations (simplified for brevity)
  private extractIntenseEmotions(experience: any): Array<{emotion: string, intensity: number, trigger: string}> {
    // Would analyze text for emotional intensity markers
    return [];
  }

  private findShouldStatements(experience: any): Array<{emotion: string, intensity: number, trigger: string}> {
    // Would look for "should", "must", "ought to" statements
    return [];
  }

  private findJudgmentalLanguage(experience: any): Array<{emotion: string, intensity: number, trigger: string}> {
    // Would identify judgmental language patterns
    return [];
  }

  private findAvoidancePatterns(experience: any): Array<{emotion: string, intensity: number, trigger: string}> {
    // Would identify what's being avoided or resisted
    return [];
  }

  private identifyProjections(charges: any[]): any[] {
    // Would identify projection patterns from emotional charges
    return [];
  }

  private assessShadowIntegration(elemental_shadows: ElementalShadowMap, attention_analysis?: any): {
    recognized: ShadowAspect[];
    integrated: ShadowAspect[];
    projected: ShadowAspect[];
  } {
    // Would assess integration level of shadow aspects
    const all_shadows = Object.values(elemental_shadows).flat();
    return {
      recognized: all_shadows.filter(s => s.integration_stage === 'recognized' || s.integration_stage === 'engaging'),
      integrated: all_shadows.filter(s => s.integration_stage === 'integrated'),
      projected: all_shadows.filter(s => s.integration_stage === 'unconscious')
    };
  }

  private findProjectionTargetsForCharge(charge: any, projections: any[]): string[] { return []; }
  private assessIntegrationStage(charge: any): ShadowAspect['integration_stage'] { return 'unconscious'; }
  private identifyArchetypalPattern(charge: any): string | undefined { return undefined; }
  private determineAnimaAnimusConstellation(experience: any): AnimaAnimusProfile['constellation'] { return 'unclear'; }
  private assessAnimaAnimusRelationshipStage(experience: any): AnimaAnimusProfile['relationship_stage'] { return 'unconscious'; }
  private identifyAnimaAnimusProjections(experience: any): AnimaAnimusProfile['projection_patterns'] {
    return { positive: [], negative: [], current_target: undefined };
  }
  private measureInnerRelationship(experience: any, attention_analysis?: any): AnimaAnimusProfile['inner_relationship'] {
    return { dialogue_quality: 0.3, creative_collaboration: 0.3, wisdom_access: 0.3 };
  }
  private determineAnimaAnimusDevelopmentalStage(stage: string, inner: any): string { return 'early_projection'; }
  private measureEgoInflation(experience: any, attention_analysis?: any): number { return 0.3; }
  private measureEgoResilience(experience: any): number { return 0.5; }
  private measureSelfAlignment(experience: any, attention_analysis?: any): number { return 0.4; }
  private calculateAxisStrength(ego_resilience: number, self_alignment: number, ego_inflation: number): number {
    return (ego_resilience + self_alignment - ego_inflation + 1) / 3; // Normalized
  }
  private identifyArchetypalGuidance(experience: any): string[] { return []; }
  private findNuminousExperiences(experience: any): Array<{description: string, context: string, intensity: number, insights?: string[]}> { return []; }
  private findSynchronicityRecognition(experience: any): Array<{description: string, context: string, intensity: number, insights?: string[]}> { return []; }
  private findWholenessExperiences(experience: any): Array<{description: string, context: string, intensity: number, insights?: string[]}> { return []; }
  private findMeaningBreakthroughs(experience: any): Array<{description: string, context: string, intensity: number, insights?: string[]}> { return []; }
  
  private async identifyActiveComplexes(experience: any, shadow: ShadowProfile, anima_animus: AnimaAnimusProfile): Promise<ArchetypalComplex[]> {
    // Would identify active archetypal complexes
    return [];
  }

  private identifyDevelopmentalEdge(shadow: ShadowProfile, anima_animus: AnimaAnimusProfile, self_axis: SelfAxis): string {
    if (shadow.recognized.length > shadow.integrated.length) {
      return 'Shadow integration - engaging with rejected aspects';
    } else if (anima_animus.relationship_stage === 'projected') {
      return 'Anima/Animus work - withdrawing projections';
    } else if (self_axis.axis_strength < 0.5) {
      return 'Ego-Self axis strengthening - building connection to deeper Self';
    } else {
      return 'Ongoing integration and wholeness';
    }
  }

  private getMinimalIndividuationStage(): IndividuationStage {
    return {
      overall_stage: 'identification',
      shadow: { recognized: [], integrated: [], projected: [], elemental_shadows: { fire: [], water: [], earth: [], air: [], aether: [] } },
      anima_animus: {
        constellation: 'unclear',
        relationship_stage: 'unconscious',
        projection_patterns: { positive: [], negative: [] },
        inner_relationship: { dialogue_quality: 0.3, creative_collaboration: 0.3, wisdom_access: 0.3 },
        developmental_stage: 'early'
      },
      self_axis: {
        axis_strength: 0.3,
        self_glimpses: [],
        ego_inflation: 0.5,
        ego_resilience: 0.4,
        self_alignment: 0.3,
        archetypal_guidance: []
      },
      active_complexes: [],
      individuation_progress: 0.2,
      current_developmental_edge: 'Beginning individuation journey'
    };
  }

  /**
   * Public interface for other systems
   */
  public async assessIndividuation(userId: string, experience: any, attention_analysis?: any): Promise<IndividuationStage> {
    return this.trackIndividuation(userId, experience, attention_analysis);
  }

  public getIndividuationHistory(userId: string): IndividuationStage[] {
    return this.individuation_history.get(userId) || [];
  }

  public getCurrentDevelopmentalEdge(userId: string): string | undefined {
    const history = this.individuation_history.get(userId);
    return history?.[history.length - 1]?.current_developmental_edge;
  }

  public getShadowWork(userId: string): ShadowProfile | undefined {
    const history = this.individuation_history.get(userId);
    return history?.[history.length - 1]?.shadow;
  }

  public getAnimaAnimusWork(userId: string): AnimaAnimusProfile | undefined {
    const history = this.individuation_history.get(userId);
    return history?.[history.length - 1]?.anima_animus;
  }
}