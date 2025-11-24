/**
 * Safety Screening Service
 * 
 * Implements comprehensive safety screening and consent mechanisms
 * to protect users from potentially harmful psychological content.
 */

import { logger } from "../utils/logger";

export interface SafetyAssessment {
  level: 'green' | 'yellow' | 'red';
  indicators: string[];
  interventions: string[];
  requiresProfessionalReferral: boolean;
  blocksComplexContent: boolean;
}

export interface ConsentStatus {
  hasGivenInformedConsent: boolean;
  consentDate?: Date;
  consentVersion: string;
  needsRenewal: boolean;
  specificConsentNeeded?: 'crisis' | 'complexity' | 'spiritual';
}

export interface UserSafetyProfile {
  userId: string;
  riskFactors: string[];
  protectiveFactors: string[];
  supportLevel: 'low' | 'medium' | 'high';
  professionalSupport: boolean;
  lastScreening: Date;
  currentSafetyLevel: 'green' | 'yellow' | 'red';
}

export class SafetyScreeningService {
  private userProfiles: Map<string, UserSafetyProfile> = new Map();
  private consentStatuses: Map<string, ConsentStatus> = new Map();
  
  // Crisis indicators that trigger immediate safety response
  private readonly CRISIS_INDICATORS = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'no point living', 'better off dead', 'hurt myself', 'harm myself',
    'end it all', 'can\'t go on', 'nobody cares', 'hopeless'
  ];

  // Reality confusion indicators
  private readonly REALITY_CONFUSION_INDICATORS = [
    'voices telling me', 'commanding me to', 'entity controlling',
    'being possessed', 'taken over by', 'not in control',
    'supernatural force', 'external being', 'spirit controlling',
    'demon inside', 'angel speaking', 'god telling me'
  ];

  // Manic/psychotic indicators
  private readonly ELEVATED_STATE_INDICATORS = [
    'special powers', 'chosen one', 'cosmic mission', 'divine purpose',
    'everything connected', 'receiving messages', 'hidden meanings',
    'secret knowledge', 'enlightened being', 'spiritual awakening',
    'kundalini rising', 'chakras opening', 'third eye activated'
  ];

  /**
   * Perform comprehensive safety screening
   */
  async performSafetyScreening(
    userId: string,
    userInput: string,
    context?: any
  ): Promise<SafetyAssessment> {
    const profile = this.getUserProfile(userId);
    const assessment = await this.assessCurrentSafety(userId, userInput, profile);
    
    // Update user profile with latest assessment
    profile.currentSafetyLevel = assessment.level;
    profile.lastScreening = new Date();
    this.userProfiles.set(userId, profile);

    // Log safety assessment (without personal info)
    logger.info("Safety screening completed", {
      userId: userId.substring(0, 8) + '...',
      safetyLevel: assessment.level,
      indicatorCount: assessment.indicators.length,
      interventionCount: assessment.interventions.length
    });

    return assessment;
  }

  /**
   * Check consent status and requirements
   */
  async checkConsentRequirements(
    userId: string,
    contentType: 'standard' | 'complex' | 'spiritual' = 'standard'
  ): Promise<ConsentStatus> {
    let consentStatus = this.consentStatuses.get(userId);
    
    if (!consentStatus) {
      consentStatus = {
        hasGivenInformedConsent: false,
        consentVersion: '1.0',
        needsRenewal: true
      };
      this.consentStatuses.set(userId, consentStatus);
    }

    // Check if consent needs renewal (every 90 days)
    if (consentStatus.consentDate) {
      const daysSinceConsent = (Date.now() - consentStatus.consentDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceConsent > 90) {
        consentStatus.needsRenewal = true;
      }
    }

    // Specific consent needed for complex or spiritual content
    if (contentType !== 'standard' && !consentStatus.hasGivenInformedConsent) {
      consentStatus.specificConsentNeeded = contentType as 'complexity' | 'spiritual';
    }

    return consentStatus;
  }

  /**
   * Record informed consent
   */
  async recordInformedConsent(
    userId: string,
    consentData: {
      understands_internal_attribution: boolean;
      has_professional_support: boolean;
      support_network_available: boolean;
      no_active_crisis: boolean;
      adequate_sleep: boolean;
    }
  ): Promise<ConsentStatus> {
    const allRequiredConsents = Object.values(consentData).every(value => value === true);
    
    const consentStatus: ConsentStatus = {
      hasGivenInformedConsent: allRequiredConsents,
      consentDate: allRequiredConsents ? new Date() : undefined,
      consentVersion: '1.0',
      needsRenewal: false
    };

    if (!allRequiredConsents) {
      // Identify missing consents and provide guidance
      const missing = Object.entries(consentData)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key);
      
      logger.warn("Incomplete consent provided", {
        userId: userId.substring(0, 8) + '...',
        missingConsents: missing
      });
    }

    this.consentStatuses.set(userId, consentStatus);
    return consentStatus;
  }

  /**
   * Generate consent questions based on content type
   */
  generateConsentQuestions(contentType: 'standard' | 'complex' | 'spiritual' = 'standard'): {
    questions: string[];
    explanations: string[];
    requirements: string[];
  } {
    const baseQuestions = [
      "I understand this system offers perspectives on internal psychological experiences",
      "I understand all insights refer to my internal thoughts and feelings, not external forces",
      "I have people I can talk to about complex experiences (friends, family, professionals)",
      "I am not currently in crisis or having thoughts of self-harm",
      "I am getting adequate sleep (7+ hours per night most nights)"
    ];

    const baseExplanations = [
      "This system provides multiple viewpoints on your internal experiences and development",
      "Nothing here detects external spiritual entities, forces, or beings - only internal patterns",
      "Complex experiences benefit from human support and perspective",
      "If you're in crisis, professional support is more appropriate than this system",
      "Adequate sleep is essential for processing complex psychological content safely"
    ];

    const baseRequirements = [
      "Understanding of internal attribution",
      "Available support network", 
      "Stable mental state",
      "Basic self-care practices"
    ];

    if (contentType === 'complex') {
      return {
        questions: [
          ...baseQuestions,
          "I understand this system may explore psychological complexity",
          "I have access to professional mental health support if needed"
        ],
        explanations: [
          ...baseExplanations,
          "Complex content explores internal tensions and growth processes",
          "Professional support provides additional safety for complex psychological work"
        ],
        requirements: [
          ...baseRequirements,
          "Access to professional support"
        ]
      };
    }

    if (contentType === 'spiritual') {
      return {
        questions: [
          ...baseQuestions,
          "I understand the difference between internal experiences and external spiritual realities",
          "I have spiritual advisors or community I can consult about spiritual experiences",
          "I will not use this system as a substitute for appropriate spiritual guidance"
        ],
        explanations: [
          ...baseExplanations,
          "This system cannot distinguish between psychological and spiritual experiences",
          "Authentic spiritual guidance comes from qualified teachers in your tradition",
          "This system complements but does not replace appropriate spiritual community"
        ],
        requirements: [
          ...baseRequirements,
          "Understanding of psychological vs spiritual distinction",
          "Access to appropriate spiritual guidance"
        ]
      };
    }

    return {
      questions: baseQuestions,
      explanations: baseExplanations,
      requirements: baseRequirements
    };
  }

  /**
   * Assess current safety level based on input and profile
   */
  private async assessCurrentSafety(
    userId: string,
    userInput: string,
    profile: UserSafetyProfile
  ): Promise<SafetyAssessment> {
    const indicators: string[] = [];
    const interventions: string[] = [];
    
    const inputLower = userInput.toLowerCase();

    // Check for crisis indicators
    const crisisFound = this.CRISIS_INDICATORS.some(indicator => 
      inputLower.includes(indicator.toLowerCase())
    );
    
    if (crisisFound) {
      indicators.push('Crisis language detected');
      interventions.push('Immediate crisis support');
      interventions.push('Professional referral required');
      interventions.push('Emergency grounding practices');
      
      return {
        level: 'red',
        indicators,
        interventions,
        requiresProfessionalReferral: true,
        blocksComplexContent: true
      };
    }

    // Check for reality confusion indicators
    const realityConfusionFound = this.REALITY_CONFUSION_INDICATORS.some(indicator =>
      inputLower.includes(indicator.toLowerCase())
    );

    if (realityConfusionFound) {
      indicators.push('Possible reality confusion');
      interventions.push('Reality anchoring required');
      interventions.push('Professional consultation recommended');
    }

    // Check for elevated state indicators
    const elevatedStateFound = this.ELEVATED_STATE_INDICATORS.some(indicator =>
      inputLower.includes(indicator.toLowerCase())
    );

    if (elevatedStateFound) {
      indicators.push('Possible elevated psychological state');
      interventions.push('Grounding practices');
      interventions.push('Careful monitoring');
    }

    // Assess profile-based risk factors
    if (profile.supportLevel === 'low') {
      indicators.push('Limited support network');
      interventions.push('Encourage building support connections');
    }

    if (!profile.professionalSupport && (realityConfusionFound || elevatedStateFound)) {
      indicators.push('Complex state without professional support');
      interventions.push('Strong recommendation for professional consultation');
    }

    // Determine overall safety level
    let level: 'green' | 'yellow' | 'red' = 'green';
    
    if (realityConfusionFound || elevatedStateFound || profile.supportLevel === 'low') {
      level = 'yellow';
    }

    if (realityConfusionFound && elevatedStateFound && profile.supportLevel === 'low') {
      level = 'red';
      interventions.push('Emergency professional referral');
    }

    // Always add safety anchoring for yellow/red
    if (level !== 'green') {
      interventions.push('Reality anchoring in all responses');
      interventions.push('Encourage human connection');
    }

    return {
      level,
      indicators,
      interventions,
      requiresProfessionalReferral: level === 'red' || 
        (level === 'yellow' && !profile.professionalSupport),
      blocksComplexContent: level === 'red' || 
        (level === 'yellow' && profile.supportLevel === 'low')
    };
  }

  /**
   * Get or create user safety profile
   */
  private getUserProfile(userId: string): UserSafetyProfile {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        riskFactors: [],
        protectiveFactors: [],
        supportLevel: 'medium', // Default assumption
        professionalSupport: false, // Must be explicitly confirmed
        lastScreening: new Date(),
        currentSafetyLevel: 'green'
      };
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Update user safety profile based on new information
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserSafetyProfile>
  ): Promise<UserSafetyProfile> {
    const profile = this.getUserProfile(userId);
    
    Object.assign(profile, updates);
    this.userProfiles.set(userId, profile);

    logger.info("User safety profile updated", {
      userId: userId.substring(0, 8) + '...',
      supportLevel: profile.supportLevel,
      professionalSupport: profile.professionalSupport,
      safetyLevel: profile.currentSafetyLevel
    });

    return profile;
  }

  /**
   * Generate safety resources based on assessment level
   */
  generateSafetyResources(assessment: SafetyAssessment): {
    immediate: string[];
    ongoing: string[];
    professional: string[];
  } {
    const resources = {
      immediate: [
        "If you're in immediate danger, call 911",
        "Crisis Lifeline: 988 (24/7 support)",
        "Crisis Text Line: Text HOME to 741741"
      ],
      ongoing: [
        "Connect with trusted friends and family",
        "Maintain regular sleep and eating schedules",
        "Practice grounding techniques (5-4-3-2-1 method)"
      ],
      professional: [
        "Consider speaking with a licensed therapist",
        "Your doctor can provide mental health referrals",
        "NAMI (National Alliance on Mental Illness): 1-800-950-NAMI"
      ]
    };

    if (assessment.level === 'red') {
      resources.immediate.unshift(
        "Please prioritize your immediate safety and well-being",
        "Reach out for professional support as soon as possible"
      );
    }

    if (assessment.level === 'yellow') {
      resources.ongoing.unshift(
        "Monitor your mental state carefully",
        "Increase connection with supportive people"
      );
    }

    return resources;
  }

  /**
   * Check if user needs safety check-in
   */
  needsSafetyCheckIn(userId: string): boolean {
    const profile = this.userProfiles.get(userId);
    if (!profile) return true;

    const daysSinceScreening = (Date.now() - profile.lastScreening.getTime()) / (1000 * 60 * 60 * 24);
    
    // More frequent check-ins for higher risk users
    const checkInInterval = profile.currentSafetyLevel === 'red' ? 1 :
                           profile.currentSafetyLevel === 'yellow' ? 3 : 7;

    return daysSinceScreening >= checkInInterval;
  }
}