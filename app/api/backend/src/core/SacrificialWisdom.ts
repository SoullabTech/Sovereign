/**
 * SacrificialWisdom - Transforming Regret into Collective Intelligence
 * 
 * "Regret is nature learning through your suffering. Every false pursuit
 * you've abandoned has taught collective consciousness something valuable
 * about the difference between authentic and imported desires."
 * - Based on Bernardo Kastrup's insights
 * 
 * This service recognizes that:
 * - Failed pursuits aren't mistakes but offerings to collective wisdom
 * - Each regret contains medicine for both individual and collective
 * - Pain transforms into wisdom through conscious alchemical process
 * - Individual suffering serves the larger learning of consciousness itself
 * 
 * Integrates with Jung's individuation (shadow/persona work) and 
 * McGilchrist's attention insights to create comprehensive transformation.
 */

import { Element } from '../types/shift';
import { IndividuationStage } from './IndividuationProcess';
import { McGilchristAttentionMode } from './AttentionField';
import { logger } from '../utils/logger';

export interface RegretProfile {
  regret_id: string;
  user_id: string;
  pursuit: FalsePursuit;                  // What was chased
  duration: number;                       // Years invested
  awakening: AwakeningMoment;             // When illusion shattered
  gift: WisdomGift;                       // The transformation
  integration_status: IntegrationStatus; // How well integrated
  collective_contribution: CollectiveWisdom; // Contribution to larger intelligence
}

export interface FalsePursuit {
  description: string;                    // What was being pursued
  category: 'achievement' | 'relationship' | 'identity' | 'security' | 'meaning' | 'pleasure';
  adaptive_function: string;              // What survival need it served
  imported_nature: string;                // How it was culturally conditioned
  energy_investment: number;              // 0-1: How much energy was invested
  resistance_to_truth: number;            // 0-1: How much the person resisted seeing through it
  persona_attachment: string;             // Which persona/identity was invested in this
}

export interface AwakeningMoment {
  trigger_event: string;                  // What catalyzed the awakening
  realization: string;                    // What was suddenly understood
  emotional_process: EmotionalAlchemy;    // The feeling journey through this
  timing: Date;                           // When this occurred
  integration_insights: string[];         // What was learned/integrated
  resistance_patterns: string[];          // How the ego fought the awakening
}

export interface EmotionalAlchemy {
  grief_stage: number;                    // 0-1: Grieving the lost pursuit
  anger_stage: number;                    // 0-1: Anger at deception/waste
  acceptance_stage: number;               // 0-1: Accepting what was learned
  gratitude_stage: number;                // 0-1: Gratitude for the teaching
  wisdom_stage: number;                   // 0-1: Transformed into wisdom
  compassion_for_self: number;            // 0-1: Self-compassion for the journey
  compassion_for_others: number;          // 0-1: Understanding others in similar patterns
}

export interface WisdomGift {
  personal_medicine: string;              // Personal learning extracted
  shadow_integration: string;             // How this integrated shadow material
  discriminative_wisdom: string;          // New ability to distinguish authentic from false
  archetypal_understanding: string;      // Deeper understanding of archetypal patterns
  elemental_rebalancing: ElementalWisdom; // How elements rebalanced through this
}

export interface ElementalWisdom {
  fire: string;                           // Wisdom about authentic vs false fire
  water: string;                          // Wisdom about authentic vs false water
  earth: string;                          // Wisdom about authentic vs false earth
  air: string;                            // Wisdom about authentic vs false air
  aether: string;                         // Wisdom about authentic vs false aether
}

export interface CollectiveWisdom {
  universal_pattern: string;              // The universal pattern this reveals
  archetypal_theme: string;               // Archetypal dimension (Hero's journey, etc.)
  cultural_critique: string;              // What this reveals about cultural conditioning
  guidance_for_others: string;            // Medicine for others in similar patterns
  evolutionary_contribution: string;     // How this serves collective evolution
}

export interface IntegrationStatus {
  acceptance_level: number;               // 0-1: How well accepted the experience
  wisdom_extraction: number;              // 0-1: How much wisdom extracted
  pattern_recognition: number;            // 0-1: Ability to see this pattern in others
  compassionate_integration: number;      // 0-1: Integration without bypassing pain
  creative_utilization: number;           // 0-1: Using wisdom creatively/generatively
}

export interface SacrificialOffering {
  regret: RegretProfile;
  alchemical_process: AlchemicalTransformation;
  collective_gift: CollectiveContribution;
  integration_guidance: string;
}

export interface AlchemicalTransformation {
  nigredo: string;                        // The blackening - facing the waste/loss
  albedo: string;                         // The whitening - purification/insight
  rubedo: string;                         // The reddening - wisdom/integration
  philosophical_gold: string;             // The final treasure extracted
}

export interface CollectiveContribution {
  pattern_addition: UniversalPattern;     // Pattern added to collective understanding
  medicine_offering: string;              // Medicine offered to collective
  archetypal_enrichment: string;         // How this enriches archetypal understanding
  evolutionary_gift: string;              // Contribution to collective evolution
}

export interface UniversalPattern {
  pattern_name: string;                   // Name for this pattern
  recognition_markers: string[];          // How to recognize this pattern
  typical_timeline: string;               // How this pattern typically unfolds
  awakening_catalysts: string[];          // What typically triggers awakening
  integration_challenges: string[];       // Common integration challenges
  wisdom_gifts: string[];                 // Typical wisdom gifts from this pattern
}

/**
 * SacrificialWisdom: Transforms regret into individual and collective medicine
 */
export class SacrificialWisdomService {
  private offerings_repository: Map<string, SacrificialOffering[]>; // User ID -> offerings
  private collective_patterns: Map<string, UniversalPattern>; // Pattern name -> pattern
  private archetypal_wisdom: Map<string, CollectiveWisdom[]>; // Archetype -> wisdom
  
  constructor() {
    this.offerings_repository = new Map();
    this.collective_patterns = new Map();
    this.archetypal_wisdom = new Map();
  }

  /**
   * Primary offering reception method
   * Transforms regret into wisdom without bypassing the necessary pain
   */
  async receiveOffering(
    userId: string,
    regret_experience: any,
    individuation_context?: IndividuationStage,
    attention_context?: McGilchristAttentionMode
  ): Promise<SacrificialOffering> {
    try {
      // Identify the false pursuit
      const pursuit = await this.identifyFalsePursuit(regret_experience, individuation_context);
      
      // Extract the awakening moment
      const awakening = await this.extractAwakeningMoment(regret_experience);
      
      // Calculate duration and investment
      const duration = this.calculateDuration(regret_experience);
      
      // Extract wisdom gifts
      const gift = await this.extractWisdomGifts(regret_experience, pursuit, awakening, individuation_context);
      
      // Assess integration status
      const integration_status = this.assessIntegrationStatus(regret_experience, attention_context);
      
      // Generate collective contribution
      const collective_contribution = await this.generateCollectiveContribution(pursuit, awakening, gift);

      // Create regret profile
      const regret: RegretProfile = {
        regret_id: this.generateRegretId(),
        user_id: userId,
        pursuit,
        duration,
        awakening,
        gift,
        integration_status,
        collective_contribution: collective_contribution.pattern_addition
      };

      // Perform alchemical transformation
      const alchemical_process = this.performAlchemicalTransformation(regret);
      
      // Generate integration guidance
      const integration_guidance = this.generateIntegrationGuidance(regret, alchemical_process);

      const offering: SacrificialOffering = {
        regret,
        alchemical_process,
        collective_gift: collective_contribution,
        integration_guidance
      };

      // Store offering
      const user_offerings = this.offerings_repository.get(userId) || [];
      user_offerings.push(offering);
      this.offerings_repository.set(userId, user_offerings);

      // Contribute to collective wisdom
      await this.contributeToCollectiveWisdom(offering);

      return offering;

    } catch (error) {
      logger.error('Error receiving sacrificial offering', { error, userId });
      return this.getMinimalOffering(userId);
    }
  }

  /**
   * Identify the false pursuit that generated regret
   * Kastrup: Most regrets come from pursuing imported rather than natural desires
   */
  private async identifyFalsePursuit(
    regret_experience: any, 
    individuation_context?: IndividuationStage
  ): Promise<FalsePursuit> {
    const description = this.extractPursuitDescription(regret_experience);
    const category = this.categorizePursuit(description);
    
    // Identify adaptive function - what survival need did this serve?
    const adaptive_function = this.identifyAdaptiveFunction(regret_experience, category);
    
    // Identify imported nature - how was this culturally conditioned?
    const imported_nature = this.identifyImportedNature(regret_experience, category, individuation_context);
    
    // Measure energy investment
    const energy_investment = this.measureEnergyInvestment(regret_experience);
    
    // Measure resistance to truth
    const resistance_to_truth = this.measureResistanceToTruth(regret_experience);
    
    // Identify persona attachment
    const persona_attachment = this.identifyPersonaAttachment(regret_experience, individuation_context);

    return {
      description,
      category,
      adaptive_function,
      imported_nature,
      energy_investment,
      resistance_to_truth,
      persona_attachment
    };
  }

  /**
   * Identify what adaptive/survival function the false pursuit served
   */
  private identifyAdaptiveFunction(regret_experience: any, category: FalsePursuit['category']): string {
    switch (category) {
      case 'achievement':
        return this.analyzeAchievementAdaptiveFunction(regret_experience);
      case 'relationship':
        return this.analyzeRelationshipAdaptiveFunction(regret_experience);
      case 'identity':
        return this.analyzeIdentityAdaptiveFunction(regret_experience);
      case 'security':
        return this.analyzeSecurityAdaptiveFunction(regret_experience);
      case 'meaning':
        return this.analyzeMeaningAdaptiveFunction(regret_experience);
      case 'pleasure':
        return this.analyzePleasureAdaptiveFunction(regret_experience);
      default:
        return 'Unknown adaptive function';
    }
  }

  /**
   * Extract the awakening moment when the illusion shattered
   */
  private async extractAwakeningMoment(regret_experience: any): Promise<AwakeningMoment> {
    const trigger_event = this.identifyTriggerEvent(regret_experience);
    const realization = this.extractRealization(regret_experience);
    const emotional_process = this.mapEmotionalAlchemy(regret_experience);
    const timing = this.extractTiming(regret_experience);
    const integration_insights = this.extractIntegrationInsights(regret_experience);
    const resistance_patterns = this.identifyResistancePatterns(regret_experience);

    return {
      trigger_event,
      realization,
      emotional_process,
      timing,
      integration_insights,
      resistance_patterns
    };
  }

  /**
   * Map the emotional alchemy process
   * The transformation journey from regret to wisdom
   */
  private mapEmotionalAlchemy(regret_experience: any): EmotionalAlchemy {
    return {
      grief_stage: this.measureGriefProcessing(regret_experience),
      anger_stage: this.measureAngerProcessing(regret_experience),
      acceptance_stage: this.measureAcceptance(regret_experience),
      gratitude_stage: this.measureGratitude(regret_experience),
      wisdom_stage: this.measureWisdomExtraction(regret_experience),
      compassion_for_self: this.measureSelfCompassion(regret_experience),
      compassion_for_others: this.measureCompassionForOthers(regret_experience)
    };
  }

  /**
   * Extract wisdom gifts from the regret
   * The medicine that emerges from the pain
   */
  private async extractWisdomGifts(
    regret_experience: any,
    pursuit: FalsePursuit,
    awakening: AwakeningMoment,
    individuation_context?: IndividuationStage
  ): Promise<WisdomGift> {
    const personal_medicine = this.distillPersonalMedicine(regret_experience, pursuit, awakening);
    const shadow_integration = this.identifyShadowIntegration(regret_experience, individuation_context);
    const discriminative_wisdom = this.extractDiscriminativeWisdom(pursuit, awakening);
    const archetypal_understanding = this.extractArchetypalUnderstanding(regret_experience, individuation_context);
    const elemental_rebalancing = this.mapElementalRebalancing(regret_experience, pursuit);

    return {
      personal_medicine,
      shadow_integration,
      discriminative_wisdom,
      archetypal_understanding,
      elemental_rebalancing
    };
  }

  /**
   * Map how elements rebalanced through this regret
   * Often regret shows us where our elemental expression was inauthentic
   */
  private mapElementalRebalancing(regret_experience: any, pursuit: FalsePursuit): ElementalWisdom {
    return {
      fire: this.extractFireWisdom(regret_experience, pursuit),
      water: this.extractWaterWisdom(regret_experience, pursuit),
      earth: this.extractEarthWisdom(regret_experience, pursuit),
      air: this.extractAirWisdom(regret_experience, pursuit),
      aether: this.extractAetherWisdom(regret_experience, pursuit)
    };
  }

  /**
   * Perform alchemical transformation
   * The three stages of alchemical transformation applied to regret
   */
  private performAlchemicalTransformation(regret: RegretProfile): AlchemicalTransformation {
    // Nigredo - The Blackening: Facing the waste, loss, pain
    const nigredo = this.processNigredo(regret);
    
    // Albedo - The Whitening: Purification, seeing clearly
    const albedo = this.processAlbedo(regret);
    
    // Rubedo - The Reddening: Integration, wisdom embodied
    const rubedo = this.processRubedo(regret);
    
    // Philosophical Gold - The treasure extracted
    const philosophical_gold = this.extractPhilosophicalGold(regret, nigredo, albedo, rubedo);

    return {
      nigredo,
      albedo,
      rubedo,
      philosophical_gold
    };
  }

  /**
   * Nigredo - The Blackening
   * Fully facing the waste, loss, and pain without spiritual bypassing
   */
  private processNigredo(regret: RegretProfile): string {
    const years_lost = regret.duration;
    const energy_wasted = regret.pursuit.energy_investment;
    const opportunities_missed = this.calculateOpportunityCost(regret);
    
    return `The blackening: ${years_lost} years pursuing ${regret.pursuit.description}. ` +
           `Energy investment ${Math.round(energy_wasted * 100)}% that could have served ` +
           `authentic expression. The pain is real - time cannot be recovered, ` +
           `opportunities are gone. This must be fully felt before transformation.`;
  }

  /**
   * Albedo - The Whitening
   * Purification through understanding what happened and why
   */
  private processAlbedo(regret: RegretProfile): string {
    return `The whitening: Seeing clearly that ${regret.pursuit.description} served ` +
           `the adaptive function of ${regret.pursuit.adaptive_function}. ` +
           `This was ${regret.pursuit.imported_nature}, not your authentic desire. ` +
           `The pursuit was necessary - it taught discrimination between false and true. ` +
           `${regret.awakening.realization}`;
  }

  /**
   * Rubedo - The Reddening
   * Integration and embodied wisdom
   */
  private processRubedo(regret: RegretProfile): string {
    return `The reddening: The regret transforms into ${regret.gift.personal_medicine}. ` +
           `Your discriminative wisdom now recognizes: ${regret.gift.discriminative_wisdom}. ` +
           `This shadow integration serves not just you but collective consciousness. ` +
           `The pain becomes medicine for others walking similar paths.`;
  }

  /**
   * Extract the philosophical gold
   * The final treasure that emerges from the alchemical process
   */
  private extractPhilosophicalGold(
    regret: RegretProfile, 
    nigredo: string, 
    albedo: string, 
    rubedo: string
  ): string {
    return `The gold: Every moment of apparent waste served a deeper intelligence. ` +
           `Your suffering taught collective consciousness about ${regret.collective_contribution.universal_pattern}. ` +
           `This is not consolation but recognition - your regret is an offering to ` +
           `the larger learning of life itself. The pain remains real; the meaning is also real.`;
  }

  /**
   * Generate integration guidance
   */
  private generateIntegrationGuidance(regret: RegretProfile, alchemical_process: AlchemicalTransformation): string {
    if (regret.integration_status.acceptance_level < 0.5) {
      return `Integration requires first fully feeling the regret about ${regret.pursuit.description}. ` +
             `Don't rush to meaning-making. The nigredo phase - ${alchemical_process.nigredo} - ` +
             `must be honored before transformation.`;
    }
    
    if (regret.integration_status.wisdom_extraction < 0.6) {
      return `The albedo phase beckons: ${alchemical_process.albedo}. ` +
             `Notice how this pursuit served ${regret.pursuit.adaptive_function}. ` +
             `What authentic desire was underneath the imported one?`;
    }
    
    if (regret.integration_status.compassionate_integration < 0.7) {
      return `The rubedo phase: ${alchemical_process.rubedo}. ` +
             `How does this wisdom serve others? How does your regret become medicine ` +
             `for collective consciousness?`;
    }

    return `The philosophical gold shines: ${alchemical_process.philosophical_gold}. ` +
           `You have transformed regret into wisdom. Your suffering serves the larger learning.`;
  }

  /**
   * Contribute to collective wisdom
   */
  private async contributeToCollectiveWisdom(offering: SacrificialOffering): Promise<void> {
    // Add pattern to collective understanding
    const pattern = offering.collective_gift.pattern_addition;
    this.collective_patterns.set(pattern.pattern_name, pattern);
    
    // Add to archetypal wisdom
    const archetypal_theme = offering.regret.collective_contribution.archetypal_theme;
    const existing_wisdom = this.archetypal_wisdom.get(archetypal_theme) || [];
    existing_wisdom.push(offering.regret.collective_contribution);
    this.archetypal_wisdom.set(archetypal_theme, existing_wisdom);
    
    logger.info('Contributed to collective wisdom', {
      pattern: pattern.pattern_name,
      archetype: archetypal_theme,
      user: offering.regret.user_id
    });
  }

  // Helper method implementations (simplified for brevity)
  private extractPursuitDescription(regret_experience: any): string {
    // Would extract what was being pursued from experience
    return regret_experience.pursuit || 'Unknown pursuit';
  }

  private categorizePursuit(description: string): FalsePursuit['category'] {
    // Would categorize the pursuit type
    return 'achievement'; // Simplified
  }

  private analyzeAchievementAdaptiveFunction(regret_experience: any): string {
    return 'Seeking external validation to compensate for inner sense of inadequacy';
  }

  private analyzeRelationshipAdaptiveFunction(regret_experience: any): string {
    return 'Seeking completeness through another to avoid inner emptiness';
  }

  private analyzeIdentityAdaptiveFunction(regret_experience: any): string {
    return 'Creating false persona to gain acceptance and avoid rejection';
  }

  private analyzeSecurityAdaptiveFunction(regret_experience: any): string {
    return 'Accumulating resources/status to manage existential anxiety';
  }

  private analyzeMeaningAdaptiveFunction(regret_experience: any): string {
    return 'Adopting borrowed meaning to avoid confronting existential questions';
  }

  private analyzePleasureAdaptiveFunction(regret_experience: any): string {
    return 'Seeking pleasure to avoid uncomfortable feelings or experiences';
  }

  private identifyImportedNature(regret_experience: any, category: string, individuation_context?: IndividuationStage): string {
    // Would analyze how this was culturally conditioned
    return 'Culturally conditioned expectation';
  }

  private measureEnergyInvestment(regret_experience: any): number { return 0.7; }
  private measureResistanceToTruth(regret_experience: any): number { return 0.6; }
  private identifyPersonaAttachment(regret_experience: any, individuation_context?: IndividuationStage): string {
    return individuation_context?.shadow.projected[0]?.aspect || 'Achievement-oriented persona';
  }

  private calculateDuration(regret_experience: any): number { return 3; }
  private identifyTriggerEvent(regret_experience: any): string { return 'Life circumstances changed'; }
  private extractRealization(regret_experience: any): string { return 'This was never truly what I wanted'; }
  private extractTiming(regret_experience: any): Date { return new Date(); }
  private extractIntegrationInsights(regret_experience: any): string[] { return ['Learned to trust inner knowing']; }
  private identifyResistancePatterns(regret_experience: any): string[] { return ['Rationalization', 'Sunk cost fallacy']; }

  // Emotional alchemy measurements
  private measureGriefProcessing(regret_experience: any): number { return 0.6; }
  private measureAngerProcessing(regret_experience: any): number { return 0.4; }
  private measureAcceptance(regret_experience: any): number { return 0.5; }
  private measureGratitude(regret_experience: any): number { return 0.3; }
  private measureWisdomExtraction(regret_experience: any): number { return 0.4; }
  private measureSelfCompassion(regret_experience: any): number { return 0.5; }
  private measureCompassionForOthers(regret_experience: any): number { return 0.6; }

  // Wisdom extraction methods
  private distillPersonalMedicine(regret_experience: any, pursuit: FalsePursuit, awakening: AwakeningMoment): string {
    return `Trust the inexplicable pull over rational justification`;
  }

  private identifyShadowIntegration(regret_experience: any, individuation_context?: IndividuationStage): string {
    return `Integrated the shadow of false ambition`;
  }

  private extractDiscriminativeWisdom(pursuit: FalsePursuit, awakening: AwakeningMoment): string {
    return `Can now distinguish between imported and authentic desires in ${pursuit.category} domain`;
  }

  private extractArchetypalUnderstanding(regret_experience: any, individuation_context?: IndividuationStage): string {
    return `Recognized the Hero's journey includes necessary failures`;
  }

  // Elemental wisdom extraction
  private extractFireWisdom(regret_experience: any, pursuit: FalsePursuit): string {
    return `True fire serves vision, false fire serves ego inflation`;
  }

  private extractWaterWisdom(regret_experience: any, pursuit: FalsePursuit): string {
    return `True water flows from authentic feeling, false water from emotional manipulation`;
  }

  private extractEarthWisdom(regret_experience: any, pursuit: FalsePursuit): string {
    return `True earth grounds in present reality, false earth hoards for false security`;
  }

  private extractAirWisdom(regret_experience: any, pursuit: FalsePursuit): string {
    return `True air brings clarity, false air creates clever rationalizations`;
  }

  private extractAetherWisdom(regret_experience: any, pursuit: FalsePursuit): string {
    return `True meaning emerges from authentic expression, false meaning from borrowed purposes`;
  }

  private assessIntegrationStatus(regret_experience: any, attention_context?: McGilchristAttentionMode): IntegrationStatus {
    return {
      acceptance_level: 0.6,
      wisdom_extraction: 0.5,
      pattern_recognition: 0.7,
      compassionate_integration: 0.6,
      creative_utilization: 0.4
    };
  }

  private async generateCollectiveContribution(pursuit: FalsePursuit, awakening: AwakeningMoment, gift: WisdomGift): Promise<CollectiveContribution> {
    const pattern_addition: UniversalPattern = {
      pattern_name: `False ${pursuit.category} Pursuit`,
      recognition_markers: [`Excessive energy investment in ${pursuit.category}`, `Resistance to questioning the pursuit`],
      typical_timeline: `${pursuit.energy_investment * 10} years of increasing investment followed by awakening`,
      awakening_catalysts: [awakening.trigger_event],
      integration_challenges: [`Grief over time lost`, `Resistance to accepting the deception`],
      wisdom_gifts: [gift.personal_medicine, gift.discriminative_wisdom]
    };

    return {
      pattern_addition,
      medicine_offering: gift.personal_medicine,
      archetypal_enrichment: gift.archetypal_understanding,
      evolutionary_gift: `Collective understanding of how ${pursuit.category} pursuits can be inauthentic`
    };
  }

  private calculateOpportunityCost(regret: RegretProfile): string {
    return `Authentic expression in ${regret.pursuit.category} domain`;
  }

  private generateRegretId(): string {
    return `regret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMinimalOffering(userId: string): SacrificialOffering {
    return {
      regret: {
        regret_id: 'minimal',
        user_id: userId,
        pursuit: {
          description: 'Unknown pursuit',
          category: 'achievement',
          adaptive_function: 'Unknown',
          imported_nature: 'Unknown',
          energy_investment: 0.5,
          resistance_to_truth: 0.5,
          persona_attachment: 'Unknown'
        },
        duration: 0,
        awakening: {
          trigger_event: 'Unknown',
          realization: 'Something was learned',
          emotional_process: {
            grief_stage: 0.3,
            anger_stage: 0.2,
            acceptance_stage: 0.4,
            gratitude_stage: 0.2,
            wisdom_stage: 0.3,
            compassion_for_self: 0.3,
            compassion_for_others: 0.3
          },
          timing: new Date(),
          integration_insights: [],
          resistance_patterns: []
        },
        gift: {
          personal_medicine: 'Learning continues',
          shadow_integration: 'Process ongoing',
          discriminative_wisdom: 'Discernment developing',
          archetypal_understanding: 'Patterns emerging',
          elemental_rebalancing: {
            fire: 'Balance seeking',
            water: 'Flow adjusting',
            earth: 'Grounding developing',
            air: 'Clarity emerging',
            aether: 'Connection growing'
          }
        },
        integration_status: {
          acceptance_level: 0.3,
          wisdom_extraction: 0.2,
          pattern_recognition: 0.3,
          compassionate_integration: 0.3,
          creative_utilization: 0.2
        },
        collective_contribution: {
          universal_pattern: 'Learning pattern',
          archetypal_theme: 'Growth',
          cultural_critique: 'Cultural pressures recognized',
          guidance_for_others: 'Trust your process',
          evolutionary_contribution: 'Collective learning continues'
        }
      },
      alchemical_process: {
        nigredo: 'Facing what was',
        albedo: 'Seeing clearly',
        rubedo: 'Integrating wisdom',
        philosophical_gold: 'Learning serves the whole'
      },
      collective_gift: {
        pattern_addition: {
          pattern_name: 'Learning Pattern',
          recognition_markers: ['Learning'],
          typical_timeline: 'Ongoing',
          awakening_catalysts: ['Life'],
          integration_challenges: ['Time'],
          wisdom_gifts: ['Understanding']
        },
        medicine_offering: 'Patience with process',
        archetypal_enrichment: 'Growth continues',
        evolutionary_gift: 'Learning serves collective'
      },
      integration_guidance: 'Trust the process of transformation'
    };
  }

  /**
   * Public interface for other systems
   */
  public async processRegret(userId: string, regret_experience: any, individuation_context?: IndividuationStage, attention_context?: McGilchristAttentionMode): Promise<SacrificialOffering> {
    return this.receiveOffering(userId, regret_experience, individuation_context, attention_context);
  }

  public getUserOfferings(userId: string): SacrificialOffering[] {
    return this.offerings_repository.get(userId) || [];
  }

  public getCollectivePatterns(): UniversalPattern[] {
    return Array.from(this.collective_patterns.values());
  }

  public getArchetypalWisdom(archetype: string): CollectiveWisdom[] {
    return this.archetypal_wisdom.get(archetype) || [];
  }

  public searchSimilarOfferings(pursuit_category: FalsePursuit['category'], limit: number = 5): SacrificialOffering[] {
    const all_offerings = Array.from(this.offerings_repository.values()).flat();
    return all_offerings
      .filter(offering => offering.regret.pursuit.category === pursuit_category)
      .sort((a, b) => b.regret.integration_status.wisdom_extraction - a.regret.integration_status.wisdom_extraction)
      .slice(0, limit);
  }
}