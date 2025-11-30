/**
 * InitiationWithoutCulture - Harpur's Modern Ordeal Recognition
 * 
 * "Modern people have to create their own initiations because culture provides none.
 * Addiction, breakdown, depression - these are often self-created sacred ordeals
 * when culture fails to provide proper initiation." - Harpur
 * 
 * This system recognizes life crises as self-initiated sacred ordeals and frames
 * them as meaningful rites of passage rather than pathologies to be cured.
 */

import { logger } from '../utils/logger';

export type OrdealType = 
  | 'addiction_crisis' 
  | 'mental_breakdown' 
  | 'relationship_dissolution'
  | 'career_destruction' 
  | 'health_crisis'
  | 'financial_collapse'
  | 'spiritual_crisis'
  | 'creative_block'
  | 'identity_dissolution'
  | 'family_rejection'
  | 'social_exile'
  | 'other';

export interface InitiatoryElements {
  separation: string;    // What was left behind or stripped away
  ordeal: string;       // The suffering/trial that had to be endured
  revelation: string;   // What became undeniably clear through the ordeal
  return: string;       // How life is lived differently now
  ongoing: boolean;     // Is this initiation still in process?
}

export interface CulturalVoid {
  missing_rite: string;           // What traditional initiation this replaced
  cultural_failure: string;       // How culture failed to guide this transition
  self_creation: string;          // How the person unconsciously created their ordeal
  wisdom_necessity: string;       // Why this particular ordeal was needed
}

export interface SelfInitiation {
  ordeal_type: OrdealType;
  initiation_elements: InitiatoryElements;
  cultural_void: CulturalVoid;
  meaning_frame: string;                    // Sacred rather than pathological framing
  integration_status: 'in_ordeal' | 'returning' | 'integrated' | 'unrecognized';
  collective_gift: string;                  // What wisdom this offers others
  still_teaching: boolean;                  // Is this ordeal still revealing wisdom?
}

export interface InitiationPattern {
  phase: 'separation' | 'ordeal' | 'return' | 'integration';
  duration_estimate: string;                // How long this phase typically lasts
  phase_guidance: string;                   // Specific guidance for current phase
  next_threshold: string;                   // What transition is approaching
  danger_signs: string[];                   // Warning signs to watch for
  support_needs: string[];                  // What kinds of support serve this phase
}

export interface InitiationCommunity {
  ordeal_type: OrdealType;
  others_on_path: number;                   // How many others in similar initiation
  collective_learning: string;              // What the group is learning together
  mutual_support: string[];                 // How people in this initiation help each other
  cultural_healing: string;                 // How this ordeal heals cultural wounds
}

/**
 * InitiationWithoutCultureService: Recognizes life crises as sacred ordeals
 */
export class InitiationWithoutCultureService {
  private user_initiations: Map<string, SelfInitiation[]>; // User ID -> initiation history
  private collective_initiations: Map<OrdealType, number>; // Track prevalence of each ordeal type
  private cultural_healing_patterns: Map<string, string[]>; // What each ordeal heals culturally
  
  constructor() {
    this.user_initiations = new Map();
    this.collective_initiations = new Map();
    this.cultural_healing_patterns = this.initializeCulturalHealingPatterns();
  }

  /**
   * Primary recognition method - identify if experience represents sacred ordeal
   */
  recognizeInitiation(experience: any, context?: any): SelfInitiation | null {
    const ordeal_type = this.identifyOrdealType(experience);
    if (!ordeal_type) return null;
    
    const initiation_elements = this.extractInitiatoryElements(experience, ordeal_type);
    const cultural_void = this.identifyCulturalVoid(ordeal_type, context);
    const meaning_frame = this.createMeaningFrame(ordeal_type, initiation_elements);
    const integration_status = this.assessIntegrationStatus(initiation_elements, experience);
    const collective_gift = this.identifyCollectiveGift(ordeal_type, initiation_elements);
    const still_teaching = this.isStillTeaching(integration_status, initiation_elements);
    
    return {
      ordeal_type,
      initiation_elements,
      cultural_void,
      meaning_frame,
      integration_status,
      collective_gift,
      still_teaching
    };
  }

  /**
   * Identify the type of self-created ordeal from experience markers
   */
  private identifyOrdealType(experience: any): OrdealType | null {
    const text = this.extractText(experience).toLowerCase();
    
    // Addiction crisis markers
    if (this.containsMarkers(text, [
      'addiction', 'alcoholism', 'substance abuse', 'withdrawal', 'recovery', 
      'hit bottom', 'rock bottom', 'lost everything to', 'clean and sober'
    ])) {
      return 'addiction_crisis';
    }
    
    // Mental breakdown markers
    if (this.containsMarkers(text, [
      'breakdown', 'mental health crisis', 'hospitalization', 'couldn\'t function',
      'lost my mind', 'psychotic break', 'severe depression', 'suicidal', 
      'psychiatric ward', 'therapy intensive'
    ])) {
      return 'mental_breakdown';
    }
    
    // Relationship dissolution markers
    if (this.containsMarkers(text, [
      'divorce', 'separation', 'marriage ended', 'relationship over', 
      'breakup destroyed me', 'custody battle', 'lost my family',
      'alone for the first time'
    ])) {
      return 'relationship_dissolution';
    }
    
    // Career destruction markers
    if (this.containsMarkers(text, [
      'fired', 'laid off', 'career ended', 'business failed', 'bankruptcy',
      'professional reputation ruined', 'lost my job', 'career crisis',
      'professional identity shattered'
    ])) {
      return 'career_destruction';
    }
    
    // Health crisis markers
    if (this.containsMarkers(text, [
      'diagnosis', 'chronic illness', 'disability', 'medical emergency',
      'life-threatening', 'chronic pain', 'terminal diagnosis', 
      'body failing', 'health scare'
    ])) {
      return 'health_crisis';
    }
    
    // Financial collapse markers
    if (this.containsMarkers(text, [
      'bankruptcy', 'foreclosure', 'lost everything financially', 'debt crisis',
      'financial ruin', 'poverty', 'homeless', 'financial bottom',
      'money problems destroyed'
    ])) {
      return 'financial_collapse';
    }
    
    // Spiritual crisis markers
    if (this.containsMarkers(text, [
      'faith crisis', 'lost belief', 'spiritual emergency', 'dark night of the soul',
      'existential crisis', 'meaning crisis', 'spiritual breakdown',
      'religious crisis', 'questioned everything'
    ])) {
      return 'spiritual_crisis';
    }
    
    // Creative block markers
    if (this.containsMarkers(text, [
      'creative block', 'artistic crisis', 'lost inspiration', 'creative death',
      'artistic identity crisis', 'creative breakdown', 'imposter syndrome',
      'creative paralysis'
    ])) {
      return 'creative_block';
    }
    
    // Identity dissolution markers
    if (this.containsMarkers(text, [
      'don\'t know who I am', 'identity crisis', 'lost sense of self',
      'personality dissolution', 'ego death', 'identity breakdown',
      'who am I really'
    ])) {
      return 'identity_dissolution';
    }
    
    return null;
  }

  /**
   * Extract the four elements of initiation from the experience
   */
  private extractInitiatoryElements(experience: any, ordeal_type: OrdealType): InitiatoryElements {
    const text = this.extractText(experience);
    
    // Look for separation language
    const separation = this.extractSeparationElements(text, ordeal_type);
    
    // Look for ordeal/trial language
    const ordeal = this.extractOrdealElements(text, ordeal_type);
    
    // Look for revelation/insight language
    const revelation = this.extractRevelationElements(text, ordeal_type);
    
    // Look for return/integration language
    const return_element = this.extractReturnElements(text, ordeal_type);
    
    // Check if still ongoing
    const ongoing = this.isInitiationOngoing(text);
    
    return {
      separation,
      ordeal,
      revelation,
      return: return_element,
      ongoing
    };
  }

  /**
   * Extract separation elements - what was left behind
   */
  private extractSeparationElements(text: string, ordeal_type: OrdealType): string {
    const separation_patterns = {
      addiction_crisis: 'old life, drinking buddies, denial, false sense of control',
      mental_breakdown: 'facade of normalcy, pretending to be okay, old identity, sense of safety',
      relationship_dissolution: 'coupled identity, shared dreams, family unit, partnership security',
      career_destruction: 'professional identity, status, financial security, work relationships',
      health_crisis: 'sense of invincibility, taken-for-granted body, future plans, physical freedom',
      financial_collapse: 'material security, social status, consumer identity, financial pride',
      spiritual_crisis: 'religious certainty, inherited beliefs, spiritual community, easy answers',
      creative_block: 'artistic confidence, creative identity, inspirational flow, expressive ease',
      identity_dissolution: 'fixed sense of self, personality certainties, role definitions, ego structure',
      family_rejection: 'family belonging, generational identity, inherited values, blood bonds',
      social_exile: 'social belonging, community acceptance, cultural identity, group membership'
    };
    
    return separation_patterns[ordeal_type] || 'familiar ways of being, old certainties, previous identity';
  }

  /**
   * Extract ordeal elements - the trial that had to be endured
   */
  private extractOrdealElements(text: string, ordeal_type: OrdealType): string {
    if (text.toLowerCase().includes('had to endure') || 
        text.toLowerCase().includes('went through') ||
        text.toLowerCase().includes('suffered through')) {
      // Extract user's own description
      const matches = text.match(/(?:had to endure|went through|suffered through)([^.!?]*)/i);
      if (matches && matches[1]) {
        return matches[1].trim();
      }
    }
    
    const ordeal_patterns = {
      addiction_crisis: 'withdrawal, shame, losing everything, hitting bottom, detox agony',
      mental_breakdown: 'psychological collapse, hospitalization, losing grip on reality, isolation',
      relationship_dissolution: 'heartbreak, custody battles, loneliness, financial strain, social judgment',
      career_destruction: 'unemployment, financial fear, professional shame, identity confusion',
      health_crisis: 'physical pain, medical procedures, mortality fear, disability adjustment',
      financial_collapse: 'poverty, homelessness, debt stress, survival mode, social shame',
      spiritual_crisis: 'meaninglessness, existential terror, loss of faith, spiritual desolation',
      creative_block: 'artistic impotence, creative despair, professional anxiety, inspirational drought',
      identity_dissolution: 'psychological confusion, personality instability, existential vertigo',
      family_rejection: 'family abandonment, generational betrayal, cultural exile, inheritance loss',
      social_exile: 'community rejection, social isolation, cultural displacement, belonging loss'
    };
    
    return ordeal_patterns[ordeal_type] || 'profound suffering, disorientation, loss of familiar supports';
  }

  /**
   * Extract revelation elements - what became clear through the ordeal
   */
  private extractRevelationElements(text: string, ordeal_type: OrdealType): string {
    // Look for insight language
    const insight_indicators = [
      'realized', 'learned', 'discovered', 'understood', 'became clear',
      'revelation', 'insight', 'breakthrough', 'awakening', 'recognition'
    ];
    
    for (const indicator of insight_indicators) {
      if (text.toLowerCase().includes(indicator)) {
        const regex = new RegExp(`${indicator}([^.!?]*(?:[.!?]|$))`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          return match[1].replace(/[.!?]$/, '').trim();
        }
      }
    }
    
    // Default revelations by ordeal type
    const revelation_patterns = {
      addiction_crisis: 'powerlessness over addiction, need for spiritual connection, surrender as strength',
      mental_breakdown: 'importance of mental health, limits of willpower, need for support',
      relationship_dissolution: 'capacity for independence, patterns in relationships, self-worth',
      career_destruction: 'work is not identity, resilience, different definition of success',
      health_crisis: 'body\'s wisdom, mortality\'s gift, present moment precious',
      financial_collapse: 'security is internal, material simplicity, community support',
      spiritual_crisis: 'authentic vs inherited beliefs, spiritual sovereignty, mystery tolerance',
      creative_block: 'creativity cycles, artistic humility, inspiration not controllable',
      identity_dissolution: 'identity is fluid, ego is construction, authentic self beneath roles',
      family_rejection: 'chosen family, individual path, breaking generational patterns',
      social_exile: 'belonging to self, cultural critique, authentic community'
    };
    
    return revelation_patterns[ordeal_type] || 'deeper truths about life, resilience, authentic values';
  }

  /**
   * Extract return elements - how life is different now
   */
  private extractReturnElements(text: string, ordeal_type: OrdealType): string {
    const return_patterns = {
      addiction_crisis: 'living in recovery, helping others heal, spiritual practice, honest relationships',
      mental_breakdown: 'mental health awareness, therapy integration, boundary setting, self-care',
      relationship_dissolution: 'independent life, healthier relationships, self-partnership, boundaries',
      career_destruction: 'work-life balance, different career path, entrepreneurship, value alignment',
      health_crisis: 'health prioritization, lifestyle changes, medical advocacy, presence practice',
      financial_collapse: 'financial wisdom, simple living, economic resilience, generous spirit',
      spiritual_crisis: 'spiritual autonomy, interfaith understanding, mystical practice, doubt integration',
      creative_block: 'creative discipline, artistic patience, multiple projects, process trust',
      identity_dissolution: 'fluid identity, authentic expression, role flexibility, continuous becoming',
      family_rejection: 'chosen family, healthy boundaries, generational healing, individual path',
      social_exile: 'authentic community, cultural bridge-building, social critique, inclusive belonging'
    };
    
    return return_patterns[ordeal_type] || 'more authentic living, wisdom integration, service to others';
  }

  /**
   * Identify what cultural initiation this replaced
   */
  private identifyCulturalVoid(ordeal_type: OrdealType, context?: any): CulturalVoid {
    const cultural_voids = {
      addiction_crisis: {
        missing_rite: 'Coming of age ritual teaching healthy relationship with substances and altered states',
        cultural_failure: 'Culture provides no guidance for spiritual emergency or consciousness exploration',
        self_creation: 'Unconsciously created crisis to force spiritual awakening and community connection',
        wisdom_necessity: 'Needed to learn surrender, spiritual connection, and service to others'
      },
      mental_breakdown: {
        missing_rite: 'Vision quest or ordeal testing psychological resilience and revealing life purpose',
        cultural_failure: 'Culture stigmatizes mental health struggles instead of honoring them as spiritual crises',
        self_creation: 'Psyche created breakdown to force attention to neglected aspects of self',
        wisdom_necessity: 'Needed to learn boundaries, self-care, and integration of shadow material'
      },
      relationship_dissolution: {
        missing_rite: 'Proper guidance for relationship transitions and redefinition of partnership',
        cultural_failure: 'Culture provides no framework for conscious uncoupling or relationship evolution',
        self_creation: 'Unconsciously created dissolution to force individual development and independence',
        wisdom_necessity: 'Needed to learn self-partnership and healthier relationship patterns'
      },
      career_destruction: {
        missing_rite: 'Midlife career transition ritual acknowledging changing values and life purpose',
        cultural_failure: 'Culture equates identity with job role, provides no career transition support',
        self_creation: 'Unconsciously sabotaged career to force alignment with authentic values',
        wisdom_necessity: 'Needed to separate identity from work and discover authentic calling'
      },
      health_crisis: {
        missing_rite: 'Illness as teacher ritual, honoring body wisdom and mortality preparation',
        cultural_failure: 'Culture medicalizes illness without honoring its spiritual and psychological dimensions',
        self_creation: 'Body created crisis to force attention to neglected physical and emotional needs',
        wisdom_necessity: 'Needed to learn body respect, present moment awareness, and mortality acceptance'
      }
    };
    
    return cultural_voids[ordeal_type] || {
      missing_rite: 'General life transition ritual with community support and wisdom guidance',
      cultural_failure: 'Culture pathologizes crisis instead of recognizing its initiatory potential',
      self_creation: 'Unconsciously created ordeal to force growth and development',
      wisdom_necessity: 'Needed to develop resilience, authenticity, and service capacity'
    };
  }

  /**
   * Create meaningful framing of ordeal as sacred rather than pathological
   */
  private createMeaningFrame(ordeal_type: OrdealType, elements: InitiatoryElements): string {
    const base_frame = `This ${ordeal_type.replace('_', ' ')} was not failure but sacred ordeal — `;
    
    if (elements.ongoing) {
      return base_frame + `an active initiation teaching ${elements.revelation.toLowerCase()}. ` +
             `The ordeal continues because the teaching is not complete.`;
    } else {
      return base_frame + `initiation through ${elements.ordeal.toLowerCase()}, ` +
             `revealing ${elements.revelation.toLowerCase()}, ` +
             `now expressed through ${elements.return.toLowerCase()}.`;
    }
  }

  /**
   * Assess where person is in integration of their initiation
   */
  private assessIntegrationStatus(
    elements: InitiatoryElements, 
    experience: any
  ): SelfInitiation['integration_status'] {
    if (elements.ongoing) {
      if (elements.revelation && elements.revelation.length > 10) {
        return 'returning'; // Ordeal continues but wisdom is emerging
      } else {
        return 'in_ordeal'; // Still in the thick of it
      }
    } else {
      if (elements.return && elements.return.length > 10) {
        return 'integrated'; // Living differently based on ordeal wisdom
      } else {
        return 'unrecognized'; // Went through ordeal but hasn't recognized its sacred nature
      }
    }
  }

  /**
   * Identify what wisdom this initiation offers to others
   */
  private identifyCollectiveGift(ordeal_type: OrdealType, elements: InitiatoryElements): string {
    const collective_gifts = {
      addiction_crisis: 'Teaching others about surrender, spiritual connection, and recovery community',
      mental_breakdown: 'Normalizing mental health struggles and modeling healing integration',
      relationship_dissolution: 'Showing healthy boundaries, conscious uncoupling, self-partnership',
      career_destruction: 'Demonstrating work-life balance, authentic calling, resilience',
      health_crisis: 'Teaching body wisdom, present moment awareness, mortality preparation',
      financial_collapse: 'Modeling simple living, economic resilience, non-material values',
      spiritual_crisis: 'Demonstrating spiritual autonomy, doubt integration, mystical practice',
      creative_block: 'Teaching creative patience, artistic discipline, process trust',
      identity_dissolution: 'Modeling authentic expression, identity fluidity, continuous becoming',
      family_rejection: 'Showing healthy boundaries, chosen family, generational healing',
      social_exile: 'Demonstrating cultural bridge-building, inclusive belonging, social critique'
    };
    
    return collective_gifts[ordeal_type] || 
           'Showing others that crisis can be sacred, suffering can be meaningful, and wisdom emerges through ordeal';
  }

  // Helper methods
  private isInitiationOngoing(text: string): boolean {
    const ongoing_markers = [
      'still going through', 'current struggle', 'ongoing crisis',
      'still in the middle', 'haven\'t recovered', 'still dealing with',
      'current situation', 'right now I\'m', 'still suffering'
    ];
    
    return ongoing_markers.some(marker => text.toLowerCase().includes(marker));
  }

  private isStillTeaching(
    status: SelfInitiation['integration_status'], 
    elements: InitiatoryElements
  ): boolean {
    return status === 'in_ordeal' || status === 'returning' || elements.ongoing;
  }

  private containsMarkers(text: string, markers: string[]): boolean {
    return markers.some(marker => text.includes(marker));
  }

  private extractText(experience: any): string {
    if (typeof experience === 'string') return experience;
    if (experience.text) return experience.text;
    if (experience.content) return experience.content;
    if (experience.description) return experience.description;
    if (experience.story) return experience.story;
    return JSON.stringify(experience);
  }

  /**
   * Get current phase of initiation and appropriate guidance
   */
  public getInitiationPhaseGuidance(initiation: SelfInitiation): InitiationPattern {
    const phase = this.determineCurrentPhase(initiation);
    const duration_estimate = this.getPhraseDurationEstimate(phase, initiation.ordeal_type);
    const phase_guidance = this.getPhaseSpecificGuidance(phase, initiation);
    const next_threshold = this.getNextThreshold(phase, initiation);
    const danger_signs = this.getDangerSigns(phase, initiation.ordeal_type);
    const support_needs = this.getSupportNeeds(phase, initiation.ordeal_type);
    
    return {
      phase,
      duration_estimate,
      phase_guidance,
      next_threshold,
      danger_signs,
      support_needs
    };
  }

  private determineCurrentPhase(initiation: SelfInitiation): InitiationPattern['phase'] {
    switch (initiation.integration_status) {
      case 'in_ordeal': return 'ordeal';
      case 'returning': return 'return';
      case 'integrated': return 'integration';
      case 'unrecognized': return 'separation';
      default: return 'ordeal';
    }
  }

  private getPhraseDurationEstimate(
    phase: InitiationPattern['phase'], 
    ordeal_type: OrdealType
  ): string {
    const estimates = {
      separation: '1-6 months (recognizing what needs to be left behind)',
      ordeal: '6 months to 3 years (enduring the trial and receiving its teaching)',
      return: '1-2 years (integrating wisdom and finding new way of living)',
      integration: 'Ongoing (living from ordeal wisdom while serving others)'
    };
    
    return estimates[phase];
  }

  private getPhaseSpecificGuidance(
    phase: InitiationPattern['phase'], 
    initiation: SelfInitiation
  ): string {
    switch (phase) {
      case 'separation':
        return 'Honor what must be left behind. This crisis is calling you to release what no longer serves.';
      case 'ordeal':
        return 'Stay present to the teaching. This suffering has meaning - what is it trying to show you?';
      case 'return':
        return 'Begin integrating the wisdom. How does this revelation want to change how you live?';
      case 'integration':
        return 'Share your medicine. Your ordeal-wisdom is needed by others walking similar paths.';
      default:
        return 'Trust the sacred process. This ordeal is not punishment but initiation.';
    }
  }

  private getNextThreshold(
    phase: InitiationPattern['phase'], 
    initiation: SelfInitiation
  ): string {
    switch (phase) {
      case 'separation':
        return 'Full engagement with the ordeal - no longer avoiding the crisis';
      case 'ordeal':
        return 'First glimpses of wisdom - understanding what this is teaching';
      case 'return':
        return 'Living differently - expressing ordeal wisdom through actions';
      case 'integration':
        return 'Serving as guide for others in similar initiations';
      default:
        return 'Greater trust in the sacred process';
    }
  }

  private getDangerSigns(phase: InitiationPattern['phase'], ordeal_type: OrdealType): string[] {
    const common_dangers = ['Refusing to see meaning in the crisis', 'Numbing the pain without learning from it'];
    
    const phase_dangers = {
      separation: ['Clinging to what needs to be released', 'Denying the need for change'],
      ordeal: ['Suicide ideation', 'Complete isolation', 'Substance abuse escalation'],
      return: ['Rushing integration', 'Avoiding the changed identity'],
      integration: ['Spiritual bypassing', 'Guru complex', 'Forgetting the ordeal lessons']
    };
    
    return [...common_dangers, ...(phase_dangers[phase] || [])];
  }

  private getSupportNeeds(phase: InitiationPattern['phase'], ordeal_type: OrdealType): string[] {
    const phase_supports = {
      separation: ['Witnessing without fixing', 'Help seeing the sacred in crisis'],
      ordeal: ['Crisis support', 'Professional help', 'Spiritual companionship'],
      return: ['Integration guidance', 'New community', 'Meaning-making support'],
      integration: ['Teaching opportunities', 'Service platforms', 'Continued learning']
    };
    
    return phase_supports[phase] || ['Understanding witness', 'Professional support when needed'];
  }

  /**
   * Initialize cultural healing patterns
   */
  private initializeCulturalHealingPatterns(): Map<string, string[]> {
    const patterns = new Map<string, string[]>();
    
    patterns.set('addiction_crisis', [
      'Healing cultural disconnection from spiritual practice',
      'Teaching healthy relationship with altered states',
      'Modeling community support and service'
    ]);
    
    patterns.set('mental_breakdown', [
      'Destigmatizing mental health struggles',
      'Honoring psychological complexity',
      'Teaching emotional intelligence and boundaries'
    ]);
    
    patterns.set('relationship_dissolution', [
      'Teaching conscious relationship skills',
      'Modeling healthy independence',
      'Healing cultural codependency patterns'
    ]);
    
    return patterns;
  }

  /**
   * Public interface for other systems
   */
  public processInitiationExperience(userId: string, experience: any, context?: any): SelfInitiation | null {
    const initiation = this.recognizeInitiation(experience, context);
    
    if (initiation) {
      // Store user's initiation pattern
      const user_initiations = this.user_initiations.get(userId) || [];
      user_initiations.push(initiation);
      this.user_initiations.set(userId, user_initiations);
      
      // Update collective tracking
      const current_count = this.collective_initiations.get(initiation.ordeal_type) || 0;
      this.collective_initiations.set(initiation.ordeal_type, current_count + 1);
    }
    
    return initiation;
  }

  /**
   * Get user's initiation history
   */
  public getUserInitiationHistory(userId: string): SelfInitiation[] {
    return this.user_initiations.get(userId) || [];
  }

  /**
   * Get collective initiation statistics
   */
  public getCollectiveInitiationStats(): Map<OrdealType, number> {
    return new Map(this.collective_initiations);
  }

  /**
   * Generate user-facing guidance for recognized initiation
   */
  public generateInitiationGuidance(initiation: SelfInitiation): string {
    const phase_pattern = this.getInitiationPhaseGuidance(initiation);
    
    return `${initiation.meaning_frame} ` +
           `Current phase: ${phase_pattern.phase} (${phase_pattern.duration_estimate}). ` +
           `${phase_pattern.phase_guidance} ` +
           `Your ordeal wisdom: ${initiation.collective_gift.toLowerCase()}`;
  }
}