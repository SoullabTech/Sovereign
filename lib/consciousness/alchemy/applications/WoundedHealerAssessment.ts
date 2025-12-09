/**
 * Wounded Healer Assessment System
 *
 * "Only the wounded physician heals" - Carl Jung
 *
 * Comprehensive assessment system for the wounded healer archetype,
 * mapping the journey from personal crisis through healing to service.
 *
 * Based on:
 * - Jungian analytical psychology
 * - Traditional shamanic initiation patterns
 * - Modern transpersonal psychology
 * - Grof's spiritual emergency framework
 */

import { AlchemicalMetal, MercuryAspect } from '../types';

export type WoundedHealerStage = 'wounded' | 'healing' | 'healer' | 'master' | 'shadow_healer';

export type WoundType =
  | 'spiritual_crisis'      // Dark night of soul, spiritual emergency
  | 'psychological_trauma'  // PTSD, abuse, severe depression
  | 'physical_illness'      // Serious disease, disability, near-death
  | 'relational_wound'      // Abandonment, betrayal, heartbreak
  | 'existential_crisis'    // Meaning loss, identity breakdown
  | 'ancestral_trauma'      // Generational trauma patterns
  | 'addiction_recovery'    // Substance abuse, behavioral addictions
  | 'life_transition'       // Death of loved ones, career loss, aging

export type HealingCapacity =
  | 'self_healing'          // Can manage own healing process
  | 'peer_support'          // Can support others with similar wounds
  | 'professional_healing'  // Trained to work therapeutically
  | 'shamanic_healing'      // Can facilitate spiritual/energetic healing
  | 'master_teacher'        // Can train other healers

export type ShadowRisk =
  | 'healer_inflation'      // God complex, superiority
  | 'rescuer_complex'       // Compulsive need to save others
  | 'wounded_identity'      // Identity stuck in victim role
  | 'spiritual_bypassing'   // Avoiding psychological work
  | 'power_abuse'           // Using healing role for control
  | 'professional_burnout'  // Depleted from overgiving
  | 'unintegrated_shadow'   // Projecting darkness on others

export interface WoundProfile {
  primaryWound: WoundType;
  secondaryWounds: WoundType[];
  woundAge: number; // Years since initial wounding
  woundDepth: 'surface' | 'moderate' | 'profound' | 'soul_level';
  traumaResolution: number; // 0-1, how much trauma is integrated
  meaningMaking: number; // 0-1, ability to find meaning in wound
  postTraumaticGrowth: number; // 0-1, growth from the experience
}

export interface HealingProgress {
  currentStage: WoundedHealerStage;
  healingDuration: number; // Years in active healing
  therapeuticWork: boolean;
  spiritualPractice: boolean;
  peerSupport: boolean;
  selfCompassion: number; // 0-1
  shadowIntegration: number; // 0-1
  wisdom_extraction: number; // 0-1, wisdom gained from wound
}

export interface HealingCapacityAssessment {
  canHelpWith: WoundType[];
  currentCapacity: HealingCapacity;
  readinessToHelp: number; // 0-1
  boundaries: number; // 0-1, healthy boundaries
  selfCare: number; // 0-1, self-care practices
  continuingEducation: boolean;
  supervision: boolean;
  ethicalGrounding: number; // 0-1
}

export interface ShadowAssessment {
  primaryRisks: ShadowRisk[];
  inflationLevel: number; // 0-1
  projectionTendency: number; // 0-1
  powerDynamicsAwareness: number; // 0-1
  humilityLevel: number; // 0-1
  acknowledgmentOfLimits: boolean;
  ongoingShadowWork: boolean;
}

export interface WoundedHealerAssessment {
  woundProfile: WoundProfile;
  healingProgress: HealingProgress;
  healingCapacity: HealingCapacityAssessment;
  shadowAssessment: ShadowAssessment;
  alchemicalCorrespondence: AlchemicalMetal;
  mercuryAspect: MercuryAspect;
  developmentalNeeds: string[];
  readinessGates: string[];
  warnings: string[];
  nextSteps: string[];
  overallReadiness: number; // 0-1
}

// Assessment Questions and Scoring
export interface AssessmentQuestions {
  woundHistory: {
    question: string;
    type: 'single' | 'multiple' | 'scale' | 'text';
    options?: string[];
    category: 'wound_profile' | 'healing_progress' | 'healing_capacity' | 'shadow_risk';
  }[];
}

export const WOUNDED_HEALER_QUESTIONS: AssessmentQuestions = {
  woundHistory: [
    // Wound Profile Questions
    {
      question: "What was the primary crisis or wound that initiated your healing journey?",
      type: "single",
      options: [
        "Spiritual crisis or dark night of the soul",
        "Psychological trauma (abuse, PTSD, severe depression)",
        "Serious physical illness or injury",
        "Relational wound (abandonment, betrayal, heartbreak)",
        "Existential crisis (loss of meaning, identity breakdown)",
        "Ancestral or generational trauma patterns",
        "Addiction or recovery process",
        "Major life transition (death, loss, career change)"
      ],
      category: "wound_profile"
    },

    {
      question: "How many years ago did your primary wounding experience occur?",
      type: "scale",
      category: "wound_profile"
    },

    {
      question: "How would you describe the depth of this wound?",
      type: "single",
      options: [
        "Surface level - difficult but manageable",
        "Moderate - significantly impacted my life",
        "Profound - fundamentally changed who I am",
        "Soul level - touched the core of my existence"
      ],
      category: "wound_profile"
    },

    // Healing Progress Questions
    {
      question: "How much of your original trauma/wound feels resolved or integrated?",
      type: "scale",
      category: "healing_progress"
    },

    {
      question: "How much meaning have you been able to find in your wound/crisis?",
      type: "scale",
      category: "healing_progress"
    },

    {
      question: "What forms of healing work have you engaged in?",
      type: "multiple",
      options: [
        "Individual therapy/counseling",
        "Group therapy or support groups",
        "Spiritual practice (meditation, prayer)",
        "Body work (massage, somatic therapy)",
        "Creative/artistic expression",
        "Shamanic or energy healing",
        "Peer counseling or 12-step work",
        "Academic study of psychology/healing"
      ],
      category: "healing_progress"
    },

    // Healing Capacity Questions
    {
      question: "Do you currently help others with healing in any capacity?",
      type: "single",
      options: [
        "No, I'm focused on my own healing",
        "Informally - friends and family sometimes ask for support",
        "Peer support - I help others with similar experiences",
        "Professionally - I work as a therapist/counselor/healer",
        "I train others to become healers"
      ],
      category: "healing_capacity"
    },

    {
      question: "How well do you maintain boundaries when helping others?",
      type: "scale",
      category: "healing_capacity"
    },

    {
      question: "How consistently do you practice self-care?",
      type: "scale",
      category: "healing_capacity"
    },

    // Shadow Risk Questions
    {
      question: "Do you ever feel superior to others because of your healing experiences?",
      type: "scale",
      category: "shadow_risk"
    },

    {
      question: "Do you feel compelled to rescue or save others?",
      type: "scale",
      category: "shadow_risk"
    },

    {
      question: "How comfortable are you with acknowledging your limitations as a helper?",
      type: "scale",
      category: "shadow_risk"
    },

    {
      question: "Do you continue to work on your own shadow/unconscious patterns?",
      type: "single",
      options: [
        "No, I feel I've completed that work",
        "Occasionally, when something comes up",
        "Yes, it's an ongoing practice",
        "Yes, with professional support"
      ],
      category: "shadow_risk"
    }
  ]
};

export class WoundedHealerAssessor {

  assessWoundedHealer(responses: Record<string, any>): WoundedHealerAssessment {
    const woundProfile = this.assessWoundProfile(responses);
    const healingProgress = this.assessHealingProgress(responses);
    const healingCapacity = this.assessHealingCapacity(responses);
    const shadowAssessment = this.assessShadowRisks(responses);

    const currentStage = this.determineStage(woundProfile, healingProgress, healingCapacity, shadowAssessment);
    const alchemicalCorrespondence = this.mapToAlchemicalMetal(currentStage, woundProfile);
    const mercuryAspect = this.mapToMercuryAspect(currentStage, healingCapacity);

    return {
      woundProfile,
      healingProgress: { ...healingProgress, currentStage },
      healingCapacity,
      shadowAssessment,
      alchemicalCorrespondence,
      mercuryAspect,
      developmentalNeeds: this.identifyDevelopmentalNeeds(currentStage, healingProgress, shadowAssessment),
      readinessGates: this.identifyReadinessGates(currentStage, healingProgress, healingCapacity),
      warnings: this.identifyWarnings(shadowAssessment, healingCapacity),
      nextSteps: this.generateNextSteps(currentStage, healingProgress, healingCapacity),
      overallReadiness: this.calculateOverallReadiness(healingProgress, healingCapacity, shadowAssessment)
    };
  }

  private assessWoundProfile(responses: Record<string, any>): WoundProfile {
    return {
      primaryWound: responses.primaryWound || 'spiritual_crisis',
      secondaryWounds: responses.secondaryWounds || [],
      woundAge: responses.woundAge || 1,
      woundDepth: responses.woundDepth || 'moderate',
      traumaResolution: responses.traumaResolution || 0.3,
      meaningMaking: responses.meaningMaking || 0.4,
      postTraumaticGrowth: responses.postTraumaticGrowth || 0.3
    };
  }

  private assessHealingProgress(responses: Record<string, any>): HealingProgress {
    return {
      currentStage: 'wounded', // Will be determined later
      healingDuration: responses.healingDuration || 1,
      therapeuticWork: responses.therapeuticWork || false,
      spiritualPractice: responses.spiritualPractice || false,
      peerSupport: responses.peerSupport || false,
      selfCompassion: responses.selfCompassion || 0.4,
      shadowIntegration: responses.shadowIntegration || 0.3,
      wisdom_extraction: responses.wisdom_extraction || 0.3
    };
  }

  private assessHealingCapacity(responses: Record<string, any>): HealingCapacityAssessment {
    return {
      canHelpWith: responses.canHelpWith || [],
      currentCapacity: responses.currentCapacity || 'self_healing',
      readinessToHelp: responses.readinessToHelp || 0.3,
      boundaries: responses.boundaries || 0.5,
      selfCare: responses.selfCare || 0.5,
      continuingEducation: responses.continuingEducation || false,
      supervision: responses.supervision || false,
      ethicalGrounding: responses.ethicalGrounding || 0.6
    };
  }

  private assessShadowRisks(responses: Record<string, any>): ShadowAssessment {
    return {
      primaryRisks: responses.primaryRisks || [],
      inflationLevel: responses.inflationLevel || 0.3,
      projectionTendency: responses.projectionTendency || 0.4,
      powerDynamicsAwareness: responses.powerDynamicsAwareness || 0.5,
      humilityLevel: responses.humilityLevel || 0.6,
      acknowledgmentOfLimits: responses.acknowledgmentOfLimits || false,
      ongoingShadowWork: responses.ongoingShadowWork || false
    };
  }

  private determineStage(
    wound: WoundProfile,
    healing: HealingProgress,
    capacity: HealingCapacityAssessment,
    shadow: ShadowAssessment
  ): WoundedHealerStage {

    // Shadow healer check first (dangerous)
    if (shadow.inflationLevel > 0.7 || (shadow.primaryRisks.includes('power_abuse') && capacity.currentCapacity !== 'self_healing')) {
      return 'shadow_healer';
    }

    // Wounded stage
    if (wound.traumaResolution < 0.4 || healing.selfCompassion < 0.4) {
      return 'wounded';
    }

    // Healing stage
    if (wound.traumaResolution < 0.7 || healing.wisdom_extraction < 0.6 || capacity.readinessToHelp < 0.5) {
      return 'healing';
    }

    // Master stage
    if (capacity.currentCapacity === 'master_teacher' &&
        healing.shadowIntegration > 0.8 &&
        shadow.humilityLevel > 0.8 &&
        shadow.ongoingShadowWork) {
      return 'master';
    }

    // Healer stage
    return 'healer';
  }

  private mapToAlchemicalMetal(stage: WoundedHealerStage, wound: WoundProfile): AlchemicalMetal {
    const stageToMetal: Record<WoundedHealerStage, AlchemicalMetal> = {
      wounded: 'lead',        // Heavy, dense, needs transformation
      healing: wound.woundDepth === 'soul_level' ? 'tin' : 'bronze', // Opening up, forming alliances
      healer: 'silver',       // Reflective wisdom, lunar consciousness
      master: 'gold',         // Solar consciousness, service
      shadow_healer: 'iron'   // Rigid, harsh, martial energy
    };

    return stageToMetal[stage];
  }

  private mapToMercuryAspect(stage: WoundedHealerStage, capacity: HealingCapacityAssessment): MercuryAspect {
    if (stage === 'wounded') return 'hermes-healer';
    if (stage === 'healing') return 'hermes-guide';
    if (stage === 'shadow_healer') return 'hermes-trickster'; // Can be destructive

    if (capacity.currentCapacity === 'master_teacher') return 'hermes-alchemist';
    if (capacity.currentCapacity === 'professional_healing') return 'hermes-teacher';
    if (capacity.currentCapacity === 'shamanic_healing') return 'hermes-psychopomp';

    return 'hermes-messenger'; // Default for healer stage
  }

  private identifyDevelopmentalNeeds(
    stage: WoundedHealerStage,
    healing: HealingProgress,
    shadow: ShadowAssessment
  ): string[] {
    const needs: string[] = [];

    if (stage === 'wounded') {
      needs.push('Professional therapeutic support');
      needs.push('Safe container for healing');
      needs.push('Self-compassion development');
      if (healing.spiritualPractice === false) needs.push('Spiritual practice');
    }

    if (stage === 'healing') {
      needs.push('Continued shadow work');
      needs.push('Meaning-making support');
      needs.push('Peer community');
      if (healing.shadowIntegration < 0.6) needs.push('Deeper shadow integration');
    }

    if (stage === 'healer') {
      needs.push('Professional development');
      needs.push('Supervision or mentorship');
      needs.push('Ongoing personal therapy');
      if (shadow.humilityLevel < 0.7) needs.push('Humility practices');
    }

    if (stage === 'shadow_healer') {
      needs.push('IMMEDIATE supervision or intervention');
      needs.push('Personal therapy focusing on power dynamics');
      needs.push('Humility practices');
      needs.push('Step back from helping others temporarily');
    }

    return needs;
  }

  private identifyReadinessGates(
    stage: WoundedHealerStage,
    healing: HealingProgress,
    capacity: HealingCapacityAssessment
  ): string[] {
    const gates: string[] = [];

    if (stage === 'wounded') {
      gates.push('Develop basic self-compassion (currently low)');
      gates.push('Achieve trauma resolution above 40%');
      gates.push('Establish consistent self-care practices');
    }

    if (stage === 'healing') {
      gates.push('Shadow integration above 60%');
      gates.push('Wisdom extraction above 60%');
      gates.push('Healthy boundaries (currently unclear)');
      gates.push('Readiness to help others above 50%');
    }

    if (stage === 'healer') {
      gates.push('Master level training or education');
      gates.push('Extensive supervision experience');
      gates.push('Shadow integration above 80%');
      gates.push('Humility level above 80%');
    }

    return gates;
  }

  private identifyWarnings(shadow: ShadowAssessment, capacity: HealingCapacityAssessment): string[] {
    const warnings: string[] = [];

    if (shadow.inflationLevel > 0.6) {
      warnings.push('⚠️ HIGH INFLATION RISK - Seek supervision immediately');
    }

    if (shadow.primaryRisks.includes('rescuer_complex')) {
      warnings.push('⚠️ Rescuer complex detected - Focus on boundaries');
    }

    if (capacity.boundaries < 0.4) {
      warnings.push('⚠️ Poor boundaries - Risk of burnout and boundary violations');
    }

    if (!shadow.ongoingShadowWork && capacity.currentCapacity !== 'self_healing') {
      warnings.push('⚠️ No ongoing shadow work while helping others - RISK');
    }

    if (shadow.primaryRisks.includes('power_abuse')) {
      warnings.push('🚨 POWER ABUSE RISK - Immediate intervention required');
    }

    return warnings;
  }

  private generateNextSteps(
    stage: WoundedHealerStage,
    healing: HealingProgress,
    capacity: HealingCapacityAssessment
  ): string[] {
    const steps: string[] = [];

    if (stage === 'wounded') {
      steps.push('1. Prioritize your own healing - you cannot pour from an empty cup');
      steps.push('2. Find a qualified therapist who understands spiritual crisis');
      steps.push('3. Join a support group or peer community');
      steps.push('4. Develop daily self-compassion practices');
    }

    if (stage === 'healing') {
      steps.push('1. Continue deep shadow work with professional support');
      steps.push('2. Begin helping others only within your capacity and with supervision');
      steps.push('3. Develop your unique healing gifts and wisdom');
      steps.push('4. Study the ethics and boundaries of helping relationships');
    }

    if (stage === 'healer') {
      steps.push('1. Pursue professional development in your healing modality');
      steps.push('2. Seek ongoing supervision or consultation');
      steps.push('3. Maintain your own therapy and spiritual practice');
      steps.push('4. Consider training others when you feel called');
    }

    if (stage === 'master') {
      steps.push('1. Focus on training the next generation of healers');
      steps.push('2. Continue your own deep work - the journey never ends');
      steps.push('3. Serve as a wisdom keeper for your community');
      steps.push('4. Model humility and ongoing learning');
    }

    return steps;
  }

  private calculateOverallReadiness(
    healing: HealingProgress,
    capacity: HealingCapacityAssessment,
    shadow: ShadowAssessment
  ): number {
    const healingScore = (healing.selfCompassion + healing.shadowIntegration + healing.wisdom_extraction) / 3;
    const capacityScore = (capacity.readinessToHelp + capacity.boundaries + capacity.selfCare) / 3;
    const shadowScore = 1 - (shadow.inflationLevel + shadow.projectionTendency) / 2;

    return (healingScore + capacityScore + shadowScore) / 3;
  }
}

// Quick assessment helper
export const quickWoundedHealerCheck = (
  traumaResolution: number,
  selfCompassion: number,
  boundariesStrength: number,
  inflationLevel: number
): {
  stage: WoundedHealerStage;
  readinessToHelp: number;
  warnings: string[];
} => {
  const assessor = new WoundedHealerAssessor();

  const mockResponses = {
    traumaResolution,
    selfCompassion,
    boundaries: boundariesStrength,
    inflationLevel,
    meaningMaking: traumaResolution * 0.8,
    shadowIntegration: selfCompassion * 0.9,
    wisdom_extraction: traumaResolution * 0.7,
    readinessToHelp: Math.min(traumaResolution * boundariesStrength, 0.9),
    humilityLevel: 1 - inflationLevel,
    ongoingShadowWork: inflationLevel < 0.5
  };

  const assessment = assessor.assessWoundedHealer(mockResponses);

  return {
    stage: assessment.healingProgress.currentStage,
    readinessToHelp: assessment.overallReadiness,
    warnings: assessment.warnings
  };
};

export { WoundedHealerAssessor };