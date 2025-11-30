/**
 * EnhancedSHIFtNarrative - Triadic Integration of Jung, McGilchrist, and Kastrup
 * 
 * This service weaves together:
 * - McGilchrist's attention insights (manner of attending creates reality)
 * - Jung's individuation process (shadow, anima/animus, Self)
 * - Kastrup's daimonic recognition (natural vs adaptive desires)
 * - Existing Spiralogic elemental framework
 * - Sacrificial wisdom transformation (regret into collective intelligence)
 * 
 * Creates narratives that honor the depth and mystery of consciousness
 * while providing practical guidance for authentic development.
 */

import { SHIFtNarrativeService, NarrativeLength, IndividualNarrative, GroupNarrative, CollectiveNarrative } from './SHIFtNarrativeService';
import { AttentionField, McGilchristAttentionMode, AttentionLayer } from '../core/AttentionField';
import { IndividuationService, IndividuationStage } from '../core/IndividuationProcess';
import { DaimonicResonanceSystem, DaimonicResonance, LifeThread } from '../core/DaimonicResonance';
import { SacrificialWisdomService, SacrificialOffering } from '../core/SacrificialWisdom';
import { ElementalAlignment, AlignmentAssessment } from './ElementalAlignment';
import { SHIFtProfile, GroupSHIFtSnapshot, Element } from '../types/shift';
import { CollectivePattern } from '../types/collectiveDashboard';
import { logger } from '../utils/logger';

export interface EnhancedNarrativeLayers {
  attention: {
    layers: AttentionLayer;
    hemispheric_analysis: McGilchristAttentionMode;
    master_emissary_guidance: string;
  };
  alignment: {
    assessment: AlignmentAssessment[];
    synthesis: {
      natural: AlignmentAssessment[];
      adaptive: AlignmentAssessment[];
      guidance: string;
    };
  };
  individuation: IndividuationStage;
  daimonic: DaimonicResonance;
  offerings: SacrificialOffering[];
  profile: SHIFtProfile | GroupSHIFtSnapshot | CollectivePattern[];
}

export interface TriadicInsight {
  type: 'attention' | 'shadow' | 'daimonic' | 'elemental' | 'sacrificial' | 'integration';
  level: 'surface' | 'depth' | 'archetypal';
  message: string;
  guidance?: string;
  integration_invitation?: string;
}

export interface EnhancedNarrative {
  opening: string;
  insights: TriadicInsight[];
  closing: string;
  integration_guidance: string;
  developmental_edge: string;
  mystery_honoring: string; // Points toward the inexplicable without reducing it
}

/**
 * EnhancedSHIFtNarrative: Integrates depth psychology with AI narrative generation
 */
export class EnhancedSHIFtNarrativeService extends SHIFtNarrativeService {
  private attentionField: AttentionField;
  private individuationService: IndividuationService;
  private daimonicResonance: DaimonicResonanceSystem;
  private sacrificialWisdom: SacrificialWisdomService;

  constructor() {
    super();
    this.attentionField = new AttentionField();
    this.individuationService = new IndividuationService();
    this.daimonicResonance = new DaimonicResonanceSystem(this.attentionField);
    this.sacrificialWisdom = new SacrificialWisdomService();
  }

  /**
   * Generate enhanced individual narrative integrating all three thinkers
   */
  async generateEnhancedIndividual(
    profile: SHIFtProfile,
    length: NarrativeLength = 'medium'
  ): Promise<IndividualNarrative & { enhanced: EnhancedNarrative }> {
    try {
      // Layer 1: McGilchrist's Attention Assessment
      const attention_analysis = this.attentionField.processExperience(profile, 'individual_profile');
      
      // Layer 2: Current Natural/Adaptive Alignment
      const alignment_assessment = ElementalAlignment.assessIndividual(profile);
      const alignment_synthesis = ElementalAlignment.synthesizeAlignment(alignment_assessment);
      
      // Layer 3: Jungian Individuation Stage
      const individuation = await this.individuationService.trackIndividuation(
        profile.userId, 
        profile,
        attention_analysis
      );
      
      // Layer 4: Daimonic Recognition
      const life_thread: LifeThread = this.convertProfileToLifeThread(profile);
      const daimonic = this.daimonicResonance.attune(life_thread);
      
      // Layer 5: Sacrificial Wisdom (if applicable)
      const offerings = await this.processPotentialOfferings(profile.userId, profile, individuation, attention_analysis.hemispheric_analysis);

      // Create enhanced layers object
      const layers: EnhancedNarrativeLayers = {
        attention: {
          layers: attention_analysis.layers,
          hemispheric_analysis: attention_analysis.hemispheric_analysis,
          master_emissary_guidance: attention_analysis.master_emissary_guidance || ''
        },
        alignment: {
          assessment: alignment_assessment,
          synthesis: alignment_synthesis
        },
        individuation,
        daimonic,
        offerings,
        profile
      };

      // Generate enhanced narrative
      const enhanced_narrative = await this.weaveTriadicNarrative(layers, length);
      
      // Generate base narrative for compatibility
      const base_narrative = super.generateIndividual(profile, length);

      return {
        ...base_narrative,
        enhanced: enhanced_narrative
      };

    } catch (error) {
      logger.error('Error generating enhanced individual narrative', { error, userId: profile.userId });
      const fallback = super.generateIndividual(profile, length);
      return {
        ...fallback,
        enhanced: this.getMinimalEnhancedNarrative()
      };
    }
  }

  /**
   * Weave triadic narrative integrating Jung, McGilchrist, and Kastrup
   */
  private async weaveTriadicNarrative(
    layers: EnhancedNarrativeLayers, 
    length: NarrativeLength
  ): Promise<EnhancedNarrative> {
    
    // Opening addresses manner of attending (McGilchrist foundation)
    const opening = this.craftTriadicOpening(layers);
    
    // Insights integrate all frameworks
    const insights = this.generateTriadicInsights(layers, length);
    
    // Closing points toward integration and mystery
    const closing = this.craftTriadicClosing(layers);
    
    // Integration guidance from all three perspectives
    const integration_guidance = this.generateTriadicIntegrationGuidance(layers);
    
    // Current developmental edge
    const developmental_edge = this.identifyDevelopmentalEdge(layers);
    
    // Mystery honoring - pointing toward the inexplicable
    const mystery_honoring = this.generateMysteryHonoring(layers);

    return {
      opening,
      insights,
      closing,
      integration_guidance,
      developmental_edge,
      mystery_honoring
    };
  }

  /**
   * Craft opening that addresses manner of attending as foundational
   */
  private craftTriadicOpening(layers: EnhancedNarrativeLayers): string {
    const hemisphere = layers.attention.hemispheric_analysis.hemisphere;
    const dominant_alignment = ElementalAlignment.getDominantAlignmentMode(
      [...layers.alignment.synthesis.natural, ...layers.alignment.synthesis.adaptive]
    );
    const individuation_stage = layers.individuation.overall_stage;
    const daimonic_resonance = layers.daimonic.overall_resonance;

    // McGilchrist foundation
    if (hemisphere === 'left_dominant') {
      if (dominant_alignment === 'adaptive') {
        return `Your attention fragments between controlling and allowing — the left hemisphere ` +
               `grasping while elemental currents carry both diamond and shadow. Notice: the very ` +
               `manner of your attending may be what keeps authentic expression at bay.`;
      } else {
        return `Though natural currents move through you, your attention remains caught in ` +
               `left-hemisphere dominance — analyzing life rather than presencing it. ` +
               `McGilchrist would say: let the Master return to guide the Emissary.`;
      }
    } else if (hemisphere === 'right_dominant' || hemisphere === 'integrated') {
      if (daimonic_resonance > 0.6) {
        return `Your attention presences the whole beautifully, and something inexplicable ` +
               `calls through you. The right hemisphere leads while the daimon whispers — ` +
               `this is optimal condition for authentic becoming.`;
      } else {
        return `The Master (right hemisphere) attends wisely, yet the daimonic call remains ` +
               `faint. Trust this embodied awareness while listening for what wants to emerge ` +
               `without justification.`;
      }
    } else {
      return `Attention conflicts between hemispheres while elemental forces seek direction. ` +
             `In ${individuation_stage} stage, the psyche asks: which manner of attending ` +
             `serves wholeness versus which serves survival?`;
    }
  }

  /**
   * Generate insights that integrate all three thinkers
   */
  private generateTriadicInsights(
    layers: EnhancedNarrativeLayers, 
    length: NarrativeLength
  ): TriadicInsight[] {
    const insights: TriadicInsight[] = [];
    
    // Always include attention insight (McGilchrist foundation)
    insights.push(this.generateAttentionInsight(layers));
    
    // Shadow work insight (Jung) - especially important if shadow material is active
    if (layers.individuation.shadow.recognized.length > 0 || layers.individuation.shadow.projected.length > 0) {
      insights.push(this.generateShadowInsight(layers));
    }
    
    // Daimonic insight (Kastrup) - if daimonic activity detected
    if (layers.daimonic.overall_resonance > 0.4) {
      insights.push(this.generateDaimonicInsight(layers));
    }
    
    // Elemental insight integrating natural/adaptive
    insights.push(this.generateElementalIntegrationInsight(layers));
    
    // Sacrificial wisdom insight (if offerings present)
    if (layers.offerings.length > 0) {
      insights.push(this.generateSacrificialWisdomInsight(layers));
    }
    
    // Integration insight (how all layers work together)
    if (length !== 'short') {
      insights.push(this.generateIntegrationInsight(layers));
    }

    return insights;
  }

  /**
   * Generate McGilchrist attention insight
   */
  private generateAttentionInsight(layers: EnhancedNarrativeLayers): TriadicInsight {
    const mode = layers.attention.hemispheric_analysis;
    
    if (mode.hemisphere === 'left_dominant') {
      return {
        type: 'attention',
        level: 'depth',
        message: `You're caught in left-hemisphere dominance — analyzing life rather than living it. ` +
                `McGilchrist would say: let the Master return, make the Emissary serve again.`,
        guidance: layers.attention.master_emissary_guidance,
        integration_invitation: `Try softening your gaze, feeling into your body, noticing the whole before the parts.`
      };
    } else if (mode.hemisphere === 'integrated') {
      return {
        type: 'attention',
        level: 'depth',
        message: `Beautiful integration: the Master leads while the Emissary serves. This is optimal attention ` +
                `for authentic development.`,
        guidance: `Trust this integrated awareness while remaining vigilant against the Emissary's tendency to usurp.`
      };
    } else {
      return {
        type: 'attention',
        level: 'surface',
        message: `Notice how you're attending right now — is it grasping or presencing? ` +
                `The manner creates the world that appears.`,
        guidance: `Experiment with shifting between focused analysis and embodied presencing.`
      };
    }
  }

  /**
   * Generate Jungian shadow insight
   */
  private generateShadowInsight(layers: EnhancedNarrativeLayers): TriadicInsight {
    const shadow = layers.individuation.shadow;
    const alignment = layers.alignment.synthesis;
    
    if (alignment.adaptive.length > alignment.natural.length) {
      const primary_adaptive = alignment.adaptive[0];
      const shadow_connection = shadow.elemental_shadows[primary_adaptive.element];
      
      if (shadow_connection.length > 0) {
        const shadow_aspect = shadow_connection[0];
        return {
          type: 'shadow',
          level: 'archetypal',
          message: `Your volcanic ${primary_adaptive.element} may be compensating for suppressed ` +
                  `${shadow_aspect.aspect} — the ${shadow_aspect.elemental_home} shadow you've deemed too dangerous. ` +
                  `Jung would say: what you resist, persists.`,
          guidance: `Consider how integrating this ${shadow_aspect.aspect} might serve wholeness rather than threatening it.`,
          integration_invitation: `What if this rejected aspect contains medicine you need?`
        };
      }
    }
    
    if (shadow.projected.length > shadow.integrated.length) {
      return {
        type: 'shadow',
        level: 'depth',
        message: `You're projecting ${shadow.projected.length} shadow aspects onto others — ` +
                `strong reactions often reveal disowned parts of yourself.`,
        guidance: `When someone triggers you intensely, ask: "How is this quality also in me?"`,
        integration_invitation: `Shadow integration transforms projection into wisdom.`
      };
    }

    return {
      type: 'shadow',
      level: 'surface',
      message: `Shadow work progresses: ${shadow.integrated.length} aspects integrated, ` +
              `${shadow.recognized.length} being engaged.`,
      guidance: `Continue the courageous work of reclaiming disowned parts.`
    };
  }

  /**
   * Generate Kastrup daimonic insight
   */
  private generateDaimonicInsight(layers: EnhancedNarrativeLayers): TriadicInsight {
    const daimonic = layers.daimonic;
    
    if (daimonic.active_markers.some(m => m.marker_type === 'inexplicable_pull')) {
      const pull_marker = daimonic.active_markers.find(m => m.marker_type === 'inexplicable_pull')!;
      if (daimonic.active_markers.some(m => m.marker_type === 'skill_burden')) {
        return {
          type: 'daimonic',
          level: 'archetypal',
          message: `That inexplicable pull toward what you're naturally skilled at, despite your resistance — ` +
                  `Kastrup's 'chain that frees.' You're good at it, don't enjoy it, yet it generates meaning. ` +
                  `This IS your daimon speaking.`,
          guidance: daimonic.integration_guidance || 'Trust the burden that serves something larger.',
          integration_invitation: `What if your reluctant mastery is exactly how Nature wants to work through you?`
        };
      } else {
        return {
          type: 'daimonic',
          level: 'depth',
          message: `Something calls without explanation — ${pull_marker.phenomenology}. ` +
                  `Kastrup would say: trust this inexplicable pull over rational justification.`,
          guidance: `The daimon rarely explains itself. Small experiments honor the call without overwhelming your life.`,
          integration_invitation: `What tiny step toward this calling feels possible right now?`
        };
      }
    }
    
    if (daimonic.active_markers.some(m => m.marker_type === 'anti_utilitarian')) {
      return {
        type: 'daimonic',
        level: 'depth',
        message: `Your soul asks you to risk comfort for meaning. The daimon rarely serves the ego's agenda — ` +
                `it serves something larger that moves through you.`,
        guidance: `Consider what you're willing to sacrifice for authentic expression.`,
        integration_invitation: `Meaning emerges through surrender to what wants to be born through you.`
      };
    }

    return {
      type: 'daimonic',
      level: 'surface',
      message: `Daimonic activity detected (${Math.round(daimonic.overall_resonance * 100)}%). ` +
              `Listen for what wants to emerge without justification.`,
      guidance: `The daimon speaks in unreasonable desires and inexplicable attractions.`
    };
  }

  /**
   * Generate elemental integration insight
   */
  private generateElementalIntegrationInsight(layers: EnhancedNarrativeLayers): TriadicInsight {
    const profile = layers.profile as SHIFtProfile;
    const alignment = layers.alignment.synthesis;
    
    // Find most pronounced elemental imbalance
    const elements = Object.entries(profile.elements)
      .filter(([key]) => key !== 'confidence')
      .sort(([,a], [,b]) => Math.abs(50 - b) - Math.abs(50 - a));
    
    const [most_imbalanced_element, score] = elements[0];
    
    if (score > 75) {
      return {
        type: 'elemental',
        level: 'depth',
        message: `${most_imbalanced_element} blazes at ${score}% while other elements wait for integration. ` +
                `This intensity may be compensatory — what ${most_imbalanced_element} shadow are you fleeing from?`,
        guidance: `Strong elemental expression often masks its opposite. Look for the suppressed counterpoint.`,
        integration_invitation: `How might this powerful ${most_imbalanced_element} serve wholeness rather than escape?`
      };
    } else if (score < 25) {
      return {
        type: 'elemental',
        level: 'depth',
        message: `${most_imbalanced_element} underexpresses (${score}%) — what wisdom does this element ` +
                `carry that you've deemed too dangerous or unnecessary?`,
        guidance: `Suppressed elements often contain exactly what's needed for wholeness.`,
        integration_invitation: `What tiny experiment with ${most_imbalanced_element} energy feels possible?`
      };
    }

    return {
      type: 'elemental',
      level: 'surface',
      message: alignment.guidance,
      guidance: `Elements seek their natural expression through you.`
    };
  }

  /**
   * Generate sacrificial wisdom insight
   */
  private generateSacrificialWisdomInsight(layers: EnhancedNarrativeLayers): TriadicInsight {
    const latest_offering = layers.offerings[layers.offerings.length - 1];
    const regret = latest_offering.regret;
    
    if (regret.integration_status.acceptance_level < 0.5) {
      return {
        type: 'sacrificial',
        level: 'depth',
        message: `Your regret about ${regret.pursuit.description} seeks transformation. ` +
                `Kastrup would say: this apparent waste taught collective consciousness ` +
                `about ${regret.collective_contribution.universal_pattern}.`,
        guidance: latest_offering.integration_guidance,
        integration_invitation: `What if your suffering served a larger learning?`
      };
    } else {
      return {
        type: 'sacrificial',
        level: 'archetypal',
        message: `The philosophical gold emerges: ${latest_offering.alchemical_process.philosophical_gold}`,
        guidance: `Your transformed regret becomes medicine for others walking similar paths.`,
        integration_invitation: `How does this wisdom want to serve collective consciousness?`
      };
    }
  }

  /**
   * Generate integration insight showing how all layers work together
   */
  private generateIntegrationInsight(layers: EnhancedNarrativeLayers): TriadicInsight {
    const hemisphere = layers.attention.hemispheric_analysis.hemisphere;
    const individuation_stage = layers.individuation.overall_stage;
    const daimonic_resonance = layers.daimonic.overall_resonance;
    
    return {
      type: 'integration',
      level: 'archetypal',
      message: `Integration weaves the threads: ${hemisphere} attention, ${individuation_stage} individuation, ` +
              `${Math.round(daimonic_resonance * 100)}% daimonic resonance. Jung's individuation needs ` +
              `McGilchrist's right hemisphere leading, which enables Kastrup's daimonic recognition.`,
      guidance: `Development happens simultaneously across attention, shadow work, and authentic expression.`,
      integration_invitation: `Notice how presencing (not analyzing) creates space for both shadow and daimon.`
    };
  }

  /**
   * Craft closing that integrates all perspectives and points toward mystery
   */
  private craftTriadicClosing(layers: EnhancedNarrativeLayers): string {
    const guidance = layers.alignment.synthesis.guidance;
    const developmental_edge = layers.individuation.current_developmental_edge;
    
    return `The path forward isn't about fixing but about attending differently. ` +
           `Let the right hemisphere lead — it knows the whole. ${guidance} ` +
           `Your current edge: ${developmental_edge}. Trust the inexplicable pull even when ` +
           `it contradicts comfort. The very tension you feel between adaptive strategies and ` +
           `natural calling — that's where individuation happens.`;
  }

  /**
   * Generate triadic integration guidance
   */
  private generateTriadicIntegrationGuidance(layers: EnhancedNarrativeLayers): string {
    return `McGilchrist: Practice presencing before analyzing. ` +
           `Jung: ${layers.individuation.current_developmental_edge}. ` +
           `Kastrup: ${layers.daimonic.integration_guidance || 'Listen for what calls without explanation'}. ` +
           `Integration: All three work together — presence enables shadow work, which creates space for daimonic recognition.`;
  }

  /**
   * Identify current developmental edge
   */
  private identifyDevelopmentalEdge(layers: EnhancedNarrativeLayers): string {
    if (layers.attention.hemispheric_analysis.hemisphere === 'left_dominant') {
      return 'Cultivating right-hemisphere leadership through embodied presence';
    }
    
    return layers.individuation.current_developmental_edge;
  }

  /**
   * Generate mystery honoring - points toward inexplicable without reducing it
   */
  private generateMysteryHonoring(layers: EnhancedNarrativeLayers): string {
    const daimonic_resonance = layers.daimonic.overall_resonance;
    
    if (daimonic_resonance > 0.7) {
      return `Something moves through you that cannot be fully understood — only honored. ` +
             `The mystery is not a problem to be solved but a current to follow.`;
    } else if (layers.individuation.self_axis.self_glimpses.length > 0) {
      return `The Self reveals itself in glimpses, not explanations. What you've tasted ` +
             `cannot be grasped, only lived into more fully.`;
    } else {
      return `The most important movements in consciousness cannot be orchestrated — ` +
             `only welcomed when they arrive. Stay receptive to what wants to emerge.`;
    }
  }

  // Helper methods
  private convertProfileToLifeThread(profile: SHIFtProfile): LifeThread {
    // Convert SHIFt profile to LifeThread format for daimonic analysis
    return {
      domain: 'general_development',
      duration: profile.freshness || 1,
      intensity_pattern: [profile.confidence],
      stated_motivations: ['personal growth'], // Would extract from actual data
      actual_behaviors: ['engaging with development work'],
      emotional_signature: profile.elements,
      resistance_patterns: [],
      skill_development: profile.elements,
      sacrifices_made: []
    };
  }

  private async processPotentialOfferings(
    userId: string, 
    profile: SHIFtProfile, 
    individuation: IndividuationStage,
    attention_context: McGilchristAttentionMode
  ): Promise<SacrificialOffering[]> {
    // Look for regret indicators in profile
    const potential_regrets = this.identifyPotentialRegrets(profile);
    const offerings: SacrificialOffering[] = [];
    
    for (const regret_experience of potential_regrets) {
      const offering = await this.sacrificialWisdom.receiveOffering(
        userId, 
        regret_experience, 
        individuation, 
        attention_context
      );
      offerings.push(offering);
    }
    
    return offerings;
  }

  private identifyPotentialRegrets(profile: SHIFtProfile): any[] {
    // Would identify regret patterns in profile data
    // For now, returning empty array
    return [];
  }

  private getMinimalEnhancedNarrative(): EnhancedNarrative {
    return {
      opening: 'Your elemental pattern seeks expression.',
      insights: [{
        type: 'elemental',
        level: 'surface',
        message: 'Elements move within you, seeking their natural expression.',
        guidance: 'Trust your inner knowing.'
      }],
      closing: 'Trust the process of becoming.',
      integration_guidance: 'Stay present to what emerges.',
      developmental_edge: 'Continuing the journey of authentic development.',
      mystery_honoring: 'Some things can only be lived, not understood.'
    };
  }

  /**
   * Public interface
   */
  public async generateTriadicNarrative(
    profile: SHIFtProfile,
    length: NarrativeLength = 'medium'
  ): Promise<EnhancedNarrative> {
    const enhanced = await this.generateEnhancedIndividual(profile, length);
    return enhanced.enhanced;
  }
}