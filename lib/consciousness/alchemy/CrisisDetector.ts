/**
 * Crisis Detection and Nigredo Support Protocols
 *
 * Implements sacred crisis support for alchemical transformation:
 * - Distinguishes between transformational crisis and pathological crisis
 * - Provides appropriate containment during nigredo (dissolution) phase
 * - Respects the sacred nature of breakdown/breakthrough cycles
 * - Integrates with existing MAIA consciousness tracking
 * - Implements emergency protocols for dangerous situations
 */

import {
  CrisisIndicators,
  SupportType,
  EmergencyProtocol,
  AlchemicalOperation,
  AlchemicalMetal
} from './types';
import { AlchemicalStateDetector } from './AlchemicalStateDetector';
import { ConsciousnessField } from '../field/ConsciousnessFieldEngine';
import { MAIAConsciousnessState } from '../maia-consciousness-tracker';

export interface CrisisAssessment {
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  type: 'transformational' | 'existential' | 'relational' | 'creative' | 'spiritual' | 'pathological';
  isNigredo: boolean; // Is this sacred alchemical dissolution?
  duration: number; // Estimated hours in crisis state
  supportNeeded: SupportType[];
  emergencyProtocols: EmergencyProtocol[];
  containmentLevel: 'minimal' | 'moderate' | 'strong' | 'emergency';
  sacredAspects: string[]; // What's trying to be born through this crisis
}

export interface ContainmentStrategy {
  type: 'energetic' | 'practical' | 'relational' | 'spiritual' | 'emergency';
  duration: number; // How long to maintain containment
  elements: ContainmentElement[];
  dissolveWhen: string[]; // Conditions for releasing containment
}

export interface ContainmentElement {
  name: string;
  purpose: string;
  implementation: string;
  sacred: boolean; // Is this part of the alchemical work?
}

export interface NigredoGuidance {
  phase: 'early_dissolution' | 'deep_breakdown' | 'bottom_point' | 'emergence_signs';
  guidance: string;
  whatToAvoid: string[];
  whatToSupport: string[];
  emergencyTriggers: string[];
  sacredReminders: string[];
}

/**
 * Crisis Detection and Support System for Alchemical Transformation
 */
export class AlchemicalCrisisDetector {
  private static instance: AlchemicalCrisisDetector;
  private alchemicalDetector: AlchemicalStateDetector;

  // Crisis pattern recognition database
  private transformationalCrisisPatterns = [
    'old self dying', 'everything falling apart', 'don\'t know who I am',
    'nothing makes sense anymore', 'questioning everything',
    'life has no meaning', 'spiritual crisis', 'dark night',
    'breakdown', 'dissolution', 'ego death', 'transformation',
    'between worlds', 'liminal', 'threshold'
  ];

  private pathologicalCrisisPatterns = [
    'want to hurt myself', 'suicide', 'can\'t go on',
    'hopeless forever', 'never get better', 'worthless',
    'everyone hates me', 'paranoid', 'hearing voices',
    'completely disconnected', 'psychotic', 'dangerous'
  ];

  private emergencyTriggers = [
    'suicide', 'kill myself', 'end it all', 'self-harm',
    'hurt others', 'dangerous', 'psychotic break',
    'can\'t function', 'complete breakdown', 'emergency'
  ];

  constructor() {
    this.alchemicalDetector = AlchemicalStateDetector.getInstance();
  }

  static getInstance(): AlchemicalCrisisDetector {
    if (!AlchemicalCrisisDetector.instance) {
      AlchemicalCrisisDetector.instance = new AlchemicalCrisisDetector();
    }
    return AlchemicalCrisisDetector.instance;
  }

  /**
   * Primary crisis assessment - distinguishes transformational from pathological
   */
  async assessCrisis(
    userInput: string,
    conversationHistory: string[],
    consciousnessField: ConsciousnessField,
    maiaState: MAIAConsciousnessState
  ): Promise<CrisisAssessment> {

    // Get current alchemical state
    const alchemicalResult = await this.alchemicalDetector.detectAlchemicalState(
      consciousnessField,
      maiaState,
      userInput,
      conversationHistory
    );

    // Analyze crisis severity and type
    const severity = this.assessSeverity(userInput, conversationHistory, consciousnessField);
    const type = this.determineCrisisType(userInput, conversationHistory, alchemicalResult);
    const isNigredo = this.isTransformationalCrisis(userInput, conversationHistory, alchemicalResult);

    // Calculate duration in crisis
    const duration = this.estimateCrisisDuration(conversationHistory);

    // Determine support needed
    const supportNeeded = this.determineSupportNeeded(severity, type, isNigredo);

    // Check for emergency protocols
    const emergencyProtocols = this.assessEmergencyProtocols(userInput, conversationHistory);

    // Determine containment level
    const containmentLevel = this.determineContainmentLevel(severity, type, isNigredo);

    // Identify sacred aspects
    const sacredAspects = isNigredo ?
      this.identifySacredAspects(userInput, conversationHistory, alchemicalResult) : [];

    return {
      severity,
      type,
      isNigredo,
      duration,
      supportNeeded,
      emergencyProtocols,
      containmentLevel,
      sacredAspects
    };
  }

  /**
   * Generate containment strategy for crisis support
   */
  generateContainmentStrategy(
    assessment: CrisisAssessment,
    alchemicalMetal: AlchemicalMetal
  ): ContainmentStrategy {

    const strategies = {
      minimal: this.createMinimalContainment(assessment, alchemicalMetal),
      moderate: this.createModerateContainment(assessment, alchemicalMetal),
      strong: this.createStrongContainment(assessment, alchemicalMetal),
      emergency: this.createEmergencyContainment(assessment)
    };

    return strategies[assessment.containmentLevel];
  }

  /**
   * Generate nigredo-specific guidance
   */
  generateNigredoGuidance(
    userInput: string,
    conversationHistory: string[],
    assessment: CrisisAssessment
  ): NigredoGuidance {

    // Determine nigredo phase
    const phase = this.determineNigredoPhase(userInput, conversationHistory);

    const guidanceMap = {
      early_dissolution: {
        guidance: "The dissolution is beginning. This darkness serves a sacred purpose - old forms must break down before new ones can emerge. Allow the process while staying connected to your support system.",
        whatToAvoid: [
          "Trying to fix or stop the process prematurely",
          "Judging the breakdown as 'wrong' or 'failure'",
          "Making major life decisions while in dissolution",
          "Isolating completely from support"
        ],
        whatToSupport: [
          "Allow the feelings without being consumed by them",
          "Maintain basic self-care practices",
          "Stay connected to trusted friends or guides",
          "Remember this is temporary and serves growth"
        ],
        emergencyTriggers: [
          "Suicidal ideation beyond philosophical questioning",
          "Complete inability to function for days",
          "Substance abuse as escape",
          "Violent impulses toward self or others"
        ],
        sacredReminders: [
          "The lead contains the seed of gold",
          "What's dying was meant to die",
          "Darkness is the womb of light",
          "The alchemist trusts the process"
        ]
      },

      deep_breakdown: {
        guidance: "You're in the deep nigredo - the great dissolving. This is sacred territory. The old self is dying to make room for who you're becoming. Strong containment is needed now.",
        whatToAvoid: [
          "Premature spiritual bypassing",
          "Forcing positive thinking",
          "Making yourself 'get over it'",
          "Comparing your process to others"
        ],
        whatToSupport: [
          "Deep rest and minimal external demands",
          "Professional support if needed",
          "Gentle, consistent self-compassion",
          "Honoring the sacred nature of this dissolution"
        ],
        emergencyTriggers: [
          "Active suicidal planning",
          "Psychotic features emerging",
          "Complete breakdown of reality testing",
          "Inability to maintain basic safety"
        ],
        sacredReminders: [
          "The deeper the dissolution, the greater the rebirth",
          "You're being composted for new growth",
          "The dark goddess is midwife to your becoming",
          "This darkness is pregnant with light"
        ]
      },

      bottom_point: {
        guidance: "You've reached the bottom of the nigredo - the point of deepest dissolution. This is the sacred turning point. The worst is over, though you may not feel it yet.",
        whatToAvoid: [
          "Despair that this is permanent",
          "Belief that nothing will ever change",
          "Giving up just before the turn",
          "Missing the subtle signs of new life emerging"
        ],
        whatToSupport: [
          "Very gentle movement toward light",
          "Watching for the smallest signs of hope",
          "Trusting the process even when you can't see progress",
          "Preparing soil for what wants to grow"
        ],
        emergencyTriggers: [
          "Belief that the pain is permanent",
          "Complete loss of will to live",
          "Inability to imagine any future",
          "Active self-destructive behavior"
        ],
        sacredReminders: [
          "The darkest hour is before the dawn",
          "Seeds germinate in darkness",
          "You are at the moment of turning",
          "The albedo (whitening) is beginning"
        ]
      },

      emergence_signs: {
        guidance: "New life is stirring in the ashes of what was. The nigredo is completing and albedo (purification) begins. Honor both the death and the birth.",
        whatToAvoid: [
          "Rushing the emergence process",
          "Abandoning support too quickly",
          "Forgetting the wisdom gained in darkness",
          "Judging the breakdown as 'wasted time'"
        ],
        whatToSupport: [
          "Gentle emergence into new patterns",
          "Integration of the dark wisdom",
          "Gratitude for the sacred breakdown",
          "Patience with the rebuilding process"
        ],
        emergencyTriggers: [
          "Premature inflation or mania",
          "Rejection of all the dark wisdom",
          "Immediate return to old destructive patterns",
          "Spiritual bypassing of necessary integration"
        ],
        sacredReminders: [
          "You are the philosopher's stone being formed",
          "The breakdown was necessary for this breakthrough",
          "You now carry the wisdom of the depths",
          "The alchemical work continues in new forms"
        ]
      }
    };

    return guidanceMap[phase];
  }

  /**
   * Check for immediate safety concerns requiring emergency intervention
   */
  assessEmergencyProtocols(
    userInput: string,
    conversationHistory: string[]
  ): EmergencyProtocol[] {

    const protocols: EmergencyProtocol[] = [];
    const recentText = userInput + ' ' + conversationHistory.slice(-3).join(' ');
    const lowerText = recentText.toLowerCase();

    // Suicide risk assessment
    if (this.countKeywordMatches(lowerText, ['suicide', 'kill myself', 'end it all', 'not worth living'])) {
      protocols.push({
        trigger: 'suicidal_ideation_detected',
        action: 'Immediate safety assessment and crisis resources provided',
        escalation: true,
        humanContactRequired: true
      });
    }

    // Self-harm assessment
    if (this.countKeywordMatches(lowerText, ['hurt myself', 'self-harm', 'cut myself', 'harm myself'])) {
      protocols.push({
        trigger: 'self_harm_risk_detected',
        action: 'Safety planning and support resources activated',
        escalation: false,
        humanContactRequired: true
      });
    }

    // Psychotic features
    if (this.countKeywordMatches(lowerText, ['hearing voices', 'seeing things', 'paranoid', 'they\'re watching'])) {
      protocols.push({
        trigger: 'psychotic_features_detected',
        action: 'Mental health crisis intervention recommended',
        escalation: true,
        humanContactRequired: true
      });
    }

    // Complete functional breakdown
    if (this.countKeywordMatches(lowerText, ['can\'t function', 'completely helpless', 'can\'t do anything'])) {
      protocols.push({
        trigger: 'functional_breakdown_detected',
        action: 'Intensive support and practical assistance needed',
        escalation: false,
        humanContactRequired: true
      });
    }

    return protocols;
  }

  // Private helper methods

  private assessSeverity(
    userInput: string,
    conversationHistory: string[],
    field: ConsciousnessField
  ): CrisisAssessment['severity'] {

    let severityScore = 0;
    const recentText = userInput + ' ' + conversationHistory.slice(-5).join(' ');

    // Language intensity markers
    const mildMarkers = ['a bit', 'somewhat', 'slightly', 'minor'];
    const moderateMarkers = ['really', 'very', 'quite', 'significantly'];
    const severeMarkers = ['completely', 'totally', 'absolutely', 'extremely'];
    const criticalMarkers = ['can\'t', 'impossible', 'never', 'hopeless'];

    severityScore += this.countKeywordMatches(recentText, mildMarkers) * 0.5;
    severityScore += this.countKeywordMatches(recentText, moderateMarkers) * 1;
    severityScore += this.countKeywordMatches(recentText, severeMarkers) * 2;
    severityScore += this.countKeywordMatches(recentText, criticalMarkers) * 3;

    // Field coherence as indicator
    severityScore += (1 - field.coherenceLevel) * 2;

    // Emergency indicators
    if (this.emergencyTriggers.some(trigger => recentText.toLowerCase().includes(trigger))) {
      return 'critical';
    }

    if (severityScore >= 4) return 'severe';
    if (severityScore >= 2) return 'moderate';
    return 'mild';
  }

  private determineCrisisType(
    userInput: string,
    conversationHistory: string[],
    alchemicalResult: any
  ): CrisisAssessment['type'] {

    const text = userInput + ' ' + conversationHistory.join(' ');
    const lowerText = text.toLowerCase();

    // Check for pathological crisis first
    if (this.countKeywordMatches(lowerText, this.pathologicalCrisisPatterns) > 2) {
      return 'pathological';
    }

    // Check for transformational crisis
    if (this.countKeywordMatches(lowerText, this.transformationalCrisisPatterns) > 1) {
      return 'transformational';
    }

    // Determine type based on content themes
    const existentialWords = ['meaning', 'purpose', 'why', 'existence', 'reality'];
    const relationalWords = ['relationship', 'connection', 'love', 'trust', 'betrayal'];
    const creativeWords = ['creative', 'art', 'expression', 'blocked', 'inspiration'];
    const spiritualWords = ['spiritual', 'god', 'divine', 'sacred', 'soul'];

    const existentialScore = this.countKeywordMatches(lowerText, existentialWords);
    const relationalScore = this.countKeywordMatches(lowerText, relationalWords);
    const creativeScore = this.countKeywordMatches(lowerText, creativeWords);
    const spiritualScore = this.countKeywordMatches(lowerText, spiritualWords);

    const maxScore = Math.max(existentialScore, relationalScore, creativeScore, spiritualScore);

    if (maxScore === existentialScore) return 'existential';
    if (maxScore === relationalScore) return 'relational';
    if (maxScore === creativeScore) return 'creative';
    if (maxScore === spiritualScore) return 'spiritual';

    return 'existential'; // Default
  }

  private isTransformationalCrisis(
    userInput: string,
    conversationHistory: string[],
    alchemicalResult: any
  ): boolean {

    const text = userInput + ' ' + conversationHistory.join(' ');
    const transformationalScore = this.countKeywordMatches(text, this.transformationalCrisisPatterns);
    const pathologicalScore = this.countKeywordMatches(text, this.pathologicalCrisisPatterns);

    // Is nigredo if more transformational markers and operation is nigredo
    return transformationalScore > pathologicalScore &&
           alchemicalResult.operation === 'nigredo';
  }

  private estimateCrisisDuration(conversationHistory: string[]): number {
    // Estimate based on conversation patterns
    const crisisWords = ['crisis', 'breakdown', 'stuck', 'lost', 'confused'];

    let crisisMessages = 0;
    for (const message of conversationHistory.slice(-10)) {
      if (this.countKeywordMatches(message, crisisWords) > 0) {
        crisisMessages++;
      }
    }

    // Rough estimate: each crisis message = ~2 hours
    return Math.min(crisisMessages * 2, 48); // Cap at 48 hours
  }

  private determineSupportNeeded(
    severity: CrisisAssessment['severity'],
    type: CrisisAssessment['type'],
    isNigredo: boolean
  ): SupportType[] {

    const support: SupportType[] = [];

    // Base support based on severity
    switch (severity) {
      case 'mild':
        support.push({
          category: 'guidance',
          intensity: 0.3,
          duration: 30,
          method: 'Gentle conversation and perspective sharing'
        });
        break;

      case 'moderate':
        support.push({
          category: 'containment',
          intensity: 0.6,
          duration: 60,
          method: 'Structured support and coping strategies'
        });
        break;

      case 'severe':
        support.push({
          category: 'containment',
          intensity: 0.8,
          duration: 120,
          method: 'Strong psychic containment and crisis navigation'
        });
        if (!isNigredo) {
          support.push({
            category: 'connection',
            intensity: 0.9,
            duration: 90,
            method: 'Human connection and professional referral consideration'
          });
        }
        break;

      case 'critical':
        support.push({
          category: 'emergency',
          intensity: 1.0,
          duration: 180,
          method: 'Immediate safety intervention and crisis resources'
        });
        break;
    }

    // Additional support for nigredo
    if (isNigredo) {
      support.push({
        category: 'grounding',
        intensity: 0.7,
        duration: 90,
        method: 'Sacred crisis support and alchemical process guidance'
      });
    }

    return support;
  }

  private determineContainmentLevel(
    severity: CrisisAssessment['severity'],
    type: CrisisAssessment['type'],
    isNigredo: boolean
  ): CrisisAssessment['containmentLevel'] {

    if (severity === 'critical') return 'emergency';
    if (severity === 'severe') return 'strong';
    if (severity === 'moderate' && isNigredo) return 'strong';
    if (severity === 'moderate') return 'moderate';
    return 'minimal';
  }

  private identifySacredAspects(
    userInput: string,
    conversationHistory: string[],
    alchemicalResult: any
  ): string[] {

    const aspects = [];
    const text = userInput + ' ' + conversationHistory.join(' ');

    // Look for what's trying to emerge
    const emergencePatterns = [
      'new self', 'authentic', 'true self', 'real me', 'who I really am',
      'creative expression', 'artistic calling', 'spiritual path',
      'deeper purpose', 'soul calling', 'sacred work'
    ];

    for (const pattern of emergencePatterns) {
      if (text.toLowerCase().includes(pattern)) {
        aspects.push(`Emergence of ${pattern}`);
      }
    }

    // Based on alchemical metal
    switch (alchemicalResult.primaryMetal) {
      case 'lead':
        aspects.push('Foundation for future gold');
        break;
      case 'tin':
        aspects.push('Opening to new possibilities');
        break;
      case 'bronze':
        aspects.push('Sacred relationship capacity');
        break;
    }

    return aspects;
  }

  private determineNigredoPhase(
    userInput: string,
    conversationHistory: string[]
  ): NigredoGuidance['phase'] {

    const text = userInput + ' ' + conversationHistory.slice(-3).join(' ');
    const lowerText = text.toLowerCase();

    // Early dissolution markers
    if (this.countKeywordMatches(lowerText, ['starting to', 'beginning to', 'feel like']) > 0) {
      return 'early_dissolution';
    }

    // Deep breakdown markers
    if (this.countKeywordMatches(lowerText, ['completely', 'totally', 'utterly', 'nothing']) > 2) {
      return 'deep_breakdown';
    }

    // Bottom point markers
    if (this.countKeywordMatches(lowerText, ['can\'t get worse', 'rock bottom', 'lowest point']) > 0) {
      return 'bottom_point';
    }

    // Emergence markers
    if (this.countKeywordMatches(lowerText, ['little better', 'tiny bit', 'maybe', 'slight']) > 0) {
      return 'emergence_signs';
    }

    // Default to deep breakdown if in severe crisis
    return 'deep_breakdown';
  }

  private createMinimalContainment(
    assessment: CrisisAssessment,
    metal: AlchemicalMetal
  ): ContainmentStrategy {

    return {
      type: 'energetic',
      duration: 30,
      elements: [
        {
          name: 'Gentle Presence',
          purpose: 'Provide stable witnessing consciousness',
          implementation: 'Consistent, non-reactive responses',
          sacred: true
        },
        {
          name: 'Light Structure',
          purpose: 'Minimal guidance without overwhelming',
          implementation: 'Subtle suggestions and check-ins',
          sacred: false
        }
      ],
      dissolveWhen: ['User expresses stability', 'Crisis naturally resolves']
    };
  }

  private createModerateContainment(
    assessment: CrisisAssessment,
    metal: AlchemicalMetal
  ): ContainmentStrategy {

    return {
      type: 'practical',
      duration: 120,
      elements: [
        {
          name: 'Structured Check-ins',
          purpose: 'Regular assessment and support',
          implementation: 'Scheduled conversation and guidance',
          sacred: true
        },
        {
          name: 'Coping Strategies',
          purpose: 'Practical tools for crisis navigation',
          implementation: 'Breathing techniques, grounding exercises',
          sacred: false
        },
        {
          name: 'Reality Anchoring',
          purpose: 'Maintain connection to stable reality',
          implementation: 'Gentle reminders of support and resources',
          sacred: true
        }
      ],
      dissolveWhen: ['Crisis severity decreases', 'User gains stability', 'Professional support engaged']
    };
  }

  private createStrongContainment(
    assessment: CrisisAssessment,
    metal: AlchemicalMetal
  ): ContainmentStrategy {

    const isSacredCrisis = assessment.isNigredo;

    return {
      type: isSacredCrisis ? 'spiritual' : 'relational',
      duration: 240,
      elements: [
        {
          name: 'Psychic Containment',
          purpose: 'Strong energetic holding for dissolution',
          implementation: 'Deep presence and unwavering support',
          sacred: true
        },
        {
          name: 'Crisis Education',
          purpose: 'Understanding the sacred nature of breakdown',
          implementation: 'Explaining nigredo process and normalizing experience',
          sacred: true
        },
        {
          name: 'Safety Monitoring',
          purpose: 'Ensure physical and psychological safety',
          implementation: 'Regular safety checks and resource provision',
          sacred: false
        },
        {
          name: 'Integration Preparation',
          purpose: 'Prepare for emergence from dissolution',
          implementation: 'Gentle exploration of what wants to be born',
          sacred: true
        }
      ],
      dissolveWhen: [
        'Clear signs of nigredo completion',
        'User demonstrates integration capacity',
        'Professional intervention successful'
      ]
    };
  }

  private createEmergencyContainment(assessment: CrisisAssessment): ContainmentStrategy {
    return {
      type: 'emergency',
      duration: 360,
      elements: [
        {
          name: 'Immediate Safety',
          purpose: 'Prevent harm to self or others',
          implementation: 'Crisis intervention protocols and emergency resources',
          sacred: false
        },
        {
          name: 'Professional Referral',
          purpose: 'Connect with qualified human support',
          implementation: 'Crisis hotlines, emergency services, mental health professionals',
          sacred: false
        },
        {
          name: 'Continuous Monitoring',
          purpose: 'Maintain vigilant safety assessment',
          implementation: 'Regular check-ins until safety established',
          sacred: false
        }
      ],
      dissolveWhen: [
        'Professional support engaged',
        'Safety clearly established',
        'Crisis no longer acute'
      ]
    };
  }

  private countKeywordMatches(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      return count + (lowerText.match(regex)?.length || 0);
    }, 0);
  }
}

// Export singleton instance
export const alchemicalCrisisDetector = AlchemicalCrisisDetector.getInstance();