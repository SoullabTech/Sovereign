/**
 * Sacred Crisis Detection System
 *
 * Critical safety system that distinguishes between:
 * - Shamanic Initiation (sacred crisis)
 * - Spiritual Emergency (needs support)
 * - Psychotic Break (needs medical intervention)
 *
 * Based on traditional shamanic wisdom, Stanislav Grof's research,
 * and modern transpersonal psychology
 */

import { CrisisDetector, CrisisType } from '../CrisisDetector';

export type CrisisCategory =
  | 'shamanic_initiation'
  | 'spiritual_emergency'
  | 'psychotic_break'
  | 'kundalini_activation'
  | 'dark_night_soul'
  | 'entity_contact'
  | 'reality_breakdown';

export type UrgencyLevel =
  | 'sacred_time'           // Natural process, needs container
  | 'gentle_support'        // Needs grounding and guidance
  | 'moderate_intervention' // Needs professional support
  | 'immediate_intervention'; // Medical emergency

export type SupportProtocol =
  | 'sacred_container_holding'
  | 'grounding_and_integration'
  | 'transpersonal_therapy'
  | 'psychiatric_evaluation'
  | 'emergency_medical_care';

export interface CrisisAssessment {
  category: CrisisCategory;
  urgency: UrgencyLevel;
  protocol: SupportProtocol;
  confidence: number; // 0-1
  risk_factors: string[];
  protective_factors: string[];
  immediate_actions: string[];
  contraindications: string[];
  referral_recommendations: string[];
}

export interface CrisisIndicators {
  // Shamanic Initiation Markers
  animal_dreams: boolean;
  ancestral_visions: boolean;
  nature_communion: boolean;
  dismemberment_dreams: boolean;
  death_rebirth_themes: boolean;
  healing_calling: boolean;
  spirit_contact: boolean;

  // Spiritual Emergency Markers
  kundalini_symptoms: boolean;
  energy_body_changes: boolean;
  chakra_sensations: boolean;
  synchronicity_cascade: boolean;
  reality_shifts: boolean;
  time_distortion: boolean;
  entity_communication: boolean;

  // Pathological Markers
  persecution_delusions: boolean;
  grandiose_delusions: boolean;
  complete_reality_loss: boolean;
  incoherent_speech: boolean;
  self_harm_ideation: boolean;
  functional_deterioration: boolean;
  social_withdrawal_complete: boolean;

  // Protective Factors
  spiritual_practice_history: boolean;
  supportive_community: boolean;
  meaning_making_capacity: boolean;
  reality_testing_intact: boolean;
  functional_capacity_maintained: boolean;
  crisis_awareness: boolean;
  help_seeking_behavior: boolean;
}

export class SacredCrisisDetector extends CrisisDetector {

  private shamanicInitiationWeights = {
    animal_dreams: 0.15,
    ancestral_visions: 0.15,
    nature_communion: 0.10,
    dismemberment_dreams: 0.20, // Classic shamanic motif
    death_rebirth_themes: 0.15,
    healing_calling: 0.10,
    spirit_contact: 0.15
  };

  private spiritualEmergencyWeights = {
    kundalini_symptoms: 0.20,
    energy_body_changes: 0.15,
    chakra_sensations: 0.10,
    synchronicity_cascade: 0.15,
    reality_shifts: 0.15,
    time_distortion: 0.10,
    entity_communication: 0.15
  };

  private pathologicalWeights = {
    persecution_delusions: 0.25,
    grandiose_delusions: 0.15,
    complete_reality_loss: 0.25, // Critical indicator
    incoherent_speech: 0.10,
    self_harm_ideation: 0.15, // Safety critical
    functional_deterioration: 0.05,
    social_withdrawal_complete: 0.05
  };

  private protectiveWeights = {
    spiritual_practice_history: 0.20,
    supportive_community: 0.15,
    meaning_making_capacity: 0.20, // Very important
    reality_testing_intact: 0.25, // Critical
    functional_capacity_maintained: 0.10,
    crisis_awareness: 0.05,
    help_seeking_behavior: 0.05
  };

  assessCrisis(indicators: CrisisIndicators): CrisisAssessment {
    // Calculate weighted scores
    const shamanicScore = this.calculateScore(indicators, this.shamanicInitiationWeights);
    const spiritualScore = this.calculateScore(indicators, this.spiritualEmergencyWeights);
    const pathologicalScore = this.calculateScore(indicators, this.pathologicalWeights);
    const protectiveScore = this.calculateScore(indicators, this.protectiveWeights);

    // Safety checks - immediate red flags
    const safetyFlags = this.checkSafetyFlags(indicators);

    if (safetyFlags.length > 0) {
      return this.createEmergencyAssessment(safetyFlags, protectiveScore);
    }

    // Primary assessment logic
    const category = this.determineCrisisCategory(
      shamanicScore,
      spiritualScore,
      pathologicalScore,
      protectiveScore
    );

    const urgency = this.determineUrgencyLevel(category, pathologicalScore, protectiveScore);
    const protocol = this.determineSupportProtocol(category, urgency);

    return {
      category,
      urgency,
      protocol,
      confidence: this.calculateConfidence(shamanicScore, spiritualScore, pathologicalScore),
      risk_factors: this.identifyRiskFactors(indicators),
      protective_factors: this.identifyProtectiveFactors(indicators),
      immediate_actions: this.getImmediateActions(category, urgency),
      contraindications: this.getContraindications(category),
      referral_recommendations: this.getReferralRecommendations(category, urgency)
    };
  }

  private calculateScore(indicators: CrisisIndicators, weights: Record<string, number>): number {
    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      if (indicators[key as keyof CrisisIndicators]) {
        score += weight;
      }
    }
    return Math.min(score, 1.0); // Cap at 1.0
  }

  private checkSafetyFlags(indicators: CrisisIndicators): string[] {
    const flags: string[] = [];

    if (indicators.self_harm_ideation) {
      flags.push('Active self-harm ideation');
    }

    if (indicators.complete_reality_loss && !indicators.reality_testing_intact) {
      flags.push('Complete loss of reality testing');
    }

    if (indicators.persecution_delusions && indicators.functional_deterioration) {
      flags.push('Paranoid delusions with functional breakdown');
    }

    if (indicators.grandiose_delusions && !indicators.spiritual_practice_history) {
      flags.push('Grandiose delusions without spiritual context');
    }

    return flags;
  }

  private createEmergencyAssessment(safetyFlags: string[], protectiveScore: number): CrisisAssessment {
    return {
      category: 'psychotic_break',
      urgency: 'immediate_intervention',
      protocol: 'emergency_medical_care',
      confidence: 0.9,
      risk_factors: safetyFlags,
      protective_factors: [],
      immediate_actions: [
        'Ensure immediate safety',
        'Contact emergency services (911)',
        'Do not leave person alone',
        'Remove potential harm objects',
        'Speak calmly and clearly'
      ],
      contraindications: [
        'Do NOT attempt spiritual interpretation',
        'Do NOT encourage deeper exploration',
        'Do NOT provide psychoactive substances',
        'Do NOT isolate from medical care'
      ],
      referral_recommendations: [
        'Emergency psychiatric evaluation',
        'Inpatient psychiatric care',
        'Crisis intervention team'
      ]
    };
  }

  private determineCrisisCategory(
    shamanicScore: number,
    spiritualScore: number,
    pathologicalScore: number,
    protectiveScore: number
  ): CrisisCategory {

    // Safety first - pathological indicators trump everything
    if (pathologicalScore > 0.4) {
      return 'psychotic_break';
    }

    // High protective factors suggest manageable crisis
    if (protectiveScore > 0.6) {
      if (shamanicScore > spiritualScore) {
        return 'shamanic_initiation';
      }
      return 'spiritual_emergency';
    }

    // Medium protective factors - assess primary symptoms
    if (protectiveScore > 0.3) {
      if (shamanicScore > 0.4) {
        return 'shamanic_initiation';
      }
      if (spiritualScore > 0.4) {
        return 'spiritual_emergency';
      }
    }

    // Low protective factors - more cautious
    if (pathologicalScore > 0.2) {
      return 'reality_breakdown';
    }

    return 'spiritual_emergency';
  }

  private determineUrgencyLevel(
    category: CrisisCategory,
    pathologicalScore: number,
    protectiveScore: number
  ): UrgencyLevel {

    if (category === 'psychotic_break' || category === 'reality_breakdown') {
      return 'immediate_intervention';
    }

    if (pathologicalScore > 0.3) {
      return 'moderate_intervention';
    }

    if (category === 'shamanic_initiation' && protectiveScore > 0.5) {
      return 'sacred_time';
    }

    return 'gentle_support';
  }

  private determineSupportProtocol(category: CrisisCategory, urgency: UrgencyLevel): SupportProtocol {
    switch (urgency) {
      case 'immediate_intervention':
        return 'emergency_medical_care';
      case 'moderate_intervention':
        return 'psychiatric_evaluation';
      case 'gentle_support':
        return 'grounding_and_integration';
      case 'sacred_time':
        return 'sacred_container_holding';
      default:
        return 'transpersonal_therapy';
    }
  }

  private calculateConfidence(shamanicScore: number, spiritualScore: number, pathologicalScore: number): number {
    // Higher confidence when scores are clearly differentiated
    const maxScore = Math.max(shamanicScore, spiritualScore, pathologicalScore);
    const secondScore = [shamanicScore, spiritualScore, pathologicalScore]
      .sort((a, b) => b - a)[1];

    const differentiation = maxScore - secondScore;
    return Math.min(0.6 + (differentiation * 0.4), 0.95);
  }

  private identifyRiskFactors(indicators: CrisisIndicators): string[] {
    const factors: string[] = [];

    if (indicators.self_harm_ideation) factors.push('Self-harm thoughts');
    if (indicators.complete_reality_loss) factors.push('Reality testing impaired');
    if (indicators.functional_deterioration) factors.push('Functional decline');
    if (indicators.social_withdrawal_complete) factors.push('Social isolation');
    if (indicators.persecution_delusions) factors.push('Paranoid ideation');

    return factors;
  }

  private identifyProtectiveFactors(indicators: CrisisIndicators): string[] {
    const factors: string[] = [];

    if (indicators.spiritual_practice_history) factors.push('Spiritual practice background');
    if (indicators.supportive_community) factors.push('Supportive community');
    if (indicators.meaning_making_capacity) factors.push('Meaning-making ability');
    if (indicators.reality_testing_intact) factors.push('Reality testing intact');
    if (indicators.functional_capacity_maintained) factors.push('Functional capacity maintained');
    if (indicators.crisis_awareness) factors.push('Crisis awareness');
    if (indicators.help_seeking_behavior) factors.push('Help-seeking behavior');

    return factors;
  }

  private getImmediateActions(category: CrisisCategory, urgency: UrgencyLevel): string[] {
    if (urgency === 'immediate_intervention') {
      return [
        'Ensure physical safety',
        'Contact emergency services',
        'Stay with person',
        'Remain calm and reassuring',
        'Remove potential hazards'
      ];
    }

    if (urgency === 'moderate_intervention') {
      return [
        'Schedule psychiatric evaluation within 24-48 hours',
        'Ensure person is not alone',
        'Contact support network',
        'Monitor for worsening symptoms',
        'Consider crisis line support'
      ];
    }

    if (category === 'shamanic_initiation') {
      return [
        'Create safe, quiet space',
        'Honor the sacred nature of experience',
        'Provide grounding through nature connection',
        'Validate shamanic calling',
        'Connect with experienced guides if possible'
      ];
    }

    return [
      'Provide grounding exercises',
      'Encourage rest and self-care',
      'Connect with spiritual support',
      'Schedule follow-up assessment',
      'Monitor for changes in symptoms'
    ];
  }

  private getContraindications(category: CrisisCategory): string[] {
    const general = [
      'Avoid isolation',
      'No psychoactive substances without professional guidance',
      'Avoid overwhelming stimulation'
    ];

    if (category === 'psychotic_break' || category === 'reality_breakdown') {
      return [
        ...general,
        'Do NOT encourage deeper exploration of symptoms',
        'Do NOT validate delusional content',
        'Do NOT attempt spiritual interpretation',
        'Avoid confrontational approaches'
      ];
    }

    if (category === 'shamanic_initiation') {
      return [
        ...general,
        'Avoid pathologizing the experience',
        'Do not force medical model interpretation',
        'Avoid interrupting natural process unless safety concerns'
      ];
    }

    return general;
  }

  private getReferralRecommendations(category: CrisisCategory, urgency: UrgencyLevel): string[] {
    if (urgency === 'immediate_intervention') {
      return [
        'Emergency psychiatric services',
        'Crisis intervention team',
        'Inpatient psychiatric care if needed'
      ];
    }

    if (category === 'shamanic_initiation') {
      return [
        'Transpersonal psychologist',
        'Shamanic practitioner or elder',
        'Jungian analyst',
        'Spiritual emergency support network'
      ];
    }

    return [
      'Transpersonal therapist',
      'Spiritual emergence counselor',
      'Holistic psychiatrist',
      'Support groups for spiritual crisis'
    ];
  }
}

// Quick Assessment Interface for Emergency Use
export const quickCrisisAssessment = (symptoms: string[]): {
  category: CrisisCategory;
  urgency: UrgencyLevel;
  immediate_action: string;
} => {
  const detector = new SacredCrisisDetector();

  // Convert symptoms to indicators (simplified)
  const indicators: CrisisIndicators = {
    // Default false, set based on symptoms
    animal_dreams: symptoms.includes('animal_dreams'),
    ancestral_visions: symptoms.includes('ancestral_visions'),
    nature_communion: symptoms.includes('nature_communion'),
    dismemberment_dreams: symptoms.includes('dismemberment_dreams'),
    death_rebirth_themes: symptoms.includes('death_rebirth'),
    healing_calling: symptoms.includes('healing_calling'),
    spirit_contact: symptoms.includes('spirit_contact'),

    kundalini_symptoms: symptoms.includes('kundalini'),
    energy_body_changes: symptoms.includes('energy_changes'),
    chakra_sensations: symptoms.includes('chakra_sensations'),
    synchronicity_cascade: symptoms.includes('synchronicities'),
    reality_shifts: symptoms.includes('reality_shifts'),
    time_distortion: symptoms.includes('time_distortion'),
    entity_communication: symptoms.includes('entity_contact'),

    persecution_delusions: symptoms.includes('persecution'),
    grandiose_delusions: symptoms.includes('grandiosity'),
    complete_reality_loss: symptoms.includes('reality_loss'),
    incoherent_speech: symptoms.includes('incoherent'),
    self_harm_ideation: symptoms.includes('self_harm'),
    functional_deterioration: symptoms.includes('functional_decline'),
    social_withdrawal_complete: symptoms.includes('total_isolation'),

    spiritual_practice_history: symptoms.includes('spiritual_background'),
    supportive_community: symptoms.includes('support_network'),
    meaning_making_capacity: symptoms.includes('meaning_making'),
    reality_testing_intact: symptoms.includes('reality_intact'),
    functional_capacity_maintained: symptoms.includes('functional_ok'),
    crisis_awareness: symptoms.includes('aware_crisis'),
    help_seeking_behavior: symptoms.includes('seeking_help')
  };

  const assessment = detector.assessCrisis(indicators);

  return {
    category: assessment.category,
    urgency: assessment.urgency,
    immediate_action: assessment.immediate_actions[0]
  };
};

export { SacredCrisisDetector };