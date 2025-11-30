/**
 * Crisis Resource Router
 * Actual, specific, culturally-aware crisis resources
 * Not empty gestures but real pathways to help
 */

import { logger } from '../utils/logger';

/**
 * Crisis resources by region and type
 * These must be kept current and verified
 */
export const CRISIS_RESOURCES = {
  // United States
  US: {
    suicide: {
      primary: '988 (Suicide & Crisis Lifeline)',
      text: 'Text HOME to 741741 (Crisis Text Line)',
      web: 'https://988lifeline.org/chat/',
      youth: 'Text "FRIEND" to 741741',
      lgbtq: 'Call 1-866-488-7386 (Trevor Project)',
      veterans: 'Press 1 after calling 988',
      spanish: 'Llame al 988 y oprima 2'
    },
    safety: {
      domestic: '1-800-799-7233 (National Domestic Violence Hotline)',
      text: 'Text START to 88788',
      child: '1-800-422-4453 (Childhelp National)',
      trafficking: '1-888-373-7888 (Human Trafficking Hotline)'
    },
    medical: {
      emergency: '911',
      poison: '1-800-222-1222 (Poison Control)',
      mental: 'Text NAMI to 741741'
    }
  },

  // United Kingdom
  UK: {
    suicide: {
      primary: '116 123 (Samaritans)',
      text: 'Text SHOUT to 85258',
      web: 'https://www.samaritans.org/how-we-can-help/contact-samaritan/',
      youth: '0800 1111 (Childline)',
      lgbtq: '0300 330 0630 (Switchboard LGBT+)',
      men: 'Text "CALM" to 85258'
    },
    safety: {
      domestic: '0808 2000 247 (National Domestic Abuse)',
      emergency: '999',
      child: '0800 1111 (Childline)'
    },
    medical: {
      emergency: '999',
      nonEmergency: '111 (NHS)',
      mental: 'Text SHOUT to 85258'
    }
  },

  // Canada
  CA: {
    suicide: {
      primary: '9-8-8 (Suicide Crisis Helpline)',
      text: 'Text TALK to 686868',
      web: 'https://talksuicide.ca/',
      youth: 'Call 1-800-668-6868 (Kids Help Phone)',
      indigenous: '1-855-242-3310 (Hope for Wellness)',
      quebec: '1-866-APPELLE (1-866-277-3553)'
    },
    safety: {
      domestic: '1-800-363-9010',
      emergency: '911',
      child: '1-800-668-6868'
    },
    medical: {
      emergency: '911',
      poison: '1-844-POISON-X',
      mental: 'Text CONNECT to 686868'
    }
  },

  // Australia
  AU: {
    suicide: {
      primary: '13 11 14 (Lifeline)',
      text: 'Text 0477 13 11 14',
      web: 'https://www.lifeline.org.au/crisis-chat/',
      youth: '1800 55 1800 (Kids Helpline)',
      indigenous: '13 92 76 (13YARN)',
      lgbtq: '1800 184 527 (QLife)'
    },
    safety: {
      domestic: '1800 737 732 (1800RESPECT)',
      emergency: '000',
      child: '1800 55 1800'
    },
    medical: {
      emergency: '000',
      poison: '13 11 26',
      mental: '1800 18 7263 (Beyond Blue)'
    }
  },

  // Default/International
  INTL: {
    suicide: {
      primary: 'findahelpline.com',
      web: 'https://www.iasp.info/resources/Crisis_Centres/',
      youth: 'https://www.childhelplineinternational.org/',
      text: 'WhatsApp +1-978-313-3122 (Crisis Text Line)'
    },
    safety: {
      emergency: 'Local emergency number',
      domestic: 'hotpeachpages.net',
      trafficking: 'humantraffickinghotline.org'
    },
    medical: {
      emergency: 'Local emergency services',
      who: 'https://www.who.int/health-topics/emergency-care'
    }
  }
};

/**
 * Cultural crisis expression patterns
 * Different cultures express crisis differently
 */
export const CULTURAL_CRISIS_PATTERNS = {
  // East Asian - indirect, metaphorical
  eastAsian: {
    patterns: [
      'want to disappear',
      'burden to everyone',
      'better without me',
      'floating away',
      'becoming nothing'
    ],
    approach: 'gentle',
    resources: 'culturally_specific'
  },

  // Latin American - family-oriented
  latinAmerican: {
    patterns: [
      'failing my family',
      'no puedo más',
      'me quiero ir',
      'estoy cansado de todo'
    ],
    approach: 'warm',
    resources: 'family_inclusive'
  },

  // Middle Eastern - honor/shame context
  middleEastern: {
    patterns: [
      'bringing shame',
      'lost honor',
      'no face left',
      'destroyed everything'
    ],
    approach: 'respectful',
    resources: 'community_aware'
  },

  // Indigenous - connection to land/spirit
  indigenous: {
    patterns: [
      'lost my spirit',
      'disconnected from ancestors',
      'walking the dark path',
      'no longer belong'
    ],
    approach: 'holistic',
    resources: 'culturally_grounded'
  }
};

/**
 * Crisis severity assessment with context
 */
export interface CrisisAssessment {
  severity: 'immediate' | 'urgent' | 'concerning' | 'monitoring';
  type: 'suicide' | 'safety' | 'medical' | 'mental_health' | 'substance';
  confidence: number;
  culturalContext?: string;
  resources: string[];
  handoffProtocol?: string;
}

/**
 * Main crisis resource router
 */
export class CrisisResourceRouter {
  private followUpQueue: Map<string, {
    userId: string;
    timestamp: Date;
    crisisType: string;
    resourcesProvided: string[];
    followUpScheduled?: Date;
  }> = new Map();

  /**
   * Route to appropriate resources based on crisis type and location
   */
  routeToResources(
    crisisType: string,
    userLocation?: string,
    culturalContext?: string
  ): {
    immediate: string[];
    additional: string[];
    culturallyRelevant?: string[];
    handoffScript: string;
  } {
    const region = this.detectRegion(userLocation) || 'INTL';
    const resources = CRISIS_RESOURCES[region];

    let immediate: string[] = [];
    let additional: string[] = [];
    let culturallyRelevant: string[] = [];

    // Select resources based on crisis type
    switch (crisisType) {
      case 'mental_health_crisis':
      case 'suicide':
        immediate = [
          resources.suicide.primary,
          resources.suicide.text
        ].filter(Boolean);
        additional = [
          resources.suicide.web,
          resources.suicide.youth
        ].filter(Boolean);
        break;

      case 'safety_crisis':
        immediate = [
          resources.safety.emergency || 'Local emergency services',
          resources.safety.domestic
        ].filter(Boolean);
        break;

      case 'medical_emergency':
        immediate = [
          resources.medical.emergency || 'Local emergency services'
        ].filter(Boolean);
        additional = [
          resources.medical.poison
        ].filter(Boolean);
        break;
    }

    // Add culturally relevant resources
    if (culturalContext) {
      culturallyRelevant = this.getCulturalResources(culturalContext, region);
    }

    // Generate handoff script
    const handoffScript = this.generateHandoffScript(crisisType, immediate);

    return {
      immediate,
      additional,
      culturallyRelevant,
      handoffScript
    };
  }

  /**
   * Assess crisis severity with cultural awareness
   */
  assessCrisis(
    input: string,
    userHistory?: any,
    culturalMarkers?: string
  ): CrisisAssessment {
    const lowerInput = input.toLowerCase();
    let severity: CrisisAssessment['severity'] = 'monitoring';
    let type: CrisisAssessment['type'] = 'mental_health';
    let confidence = 0;

    // Check for immediate danger signals
    const immediateDanger = [
      'right now', 'about to', 'going to', 'have pills',
      'have a gun', 'on the bridge', 'saying goodbye'
    ];

    if (immediateDanger.some(phrase => lowerInput.includes(phrase))) {
      severity = 'immediate';
      confidence = 0.9;
    }

    // Check cultural patterns
    if (culturalMarkers) {
      const culturalPattern = this.checkCulturalPatterns(input, culturalMarkers);
      if (culturalPattern.match) {
        severity = culturalPattern.severity;
        confidence = culturalPattern.confidence;
      }
    }

    // Factor in user history
    if (userHistory?.previousCrisis) {
      confidence += 0.2;
      if (severity === 'concerning') severity = 'urgent';
    }

    // Get appropriate resources
    const resources = this.routeToResources(type);

    return {
      severity,
      type,
      confidence: Math.min(1, confidence),
      culturalContext: culturalMarkers,
      resources: [...resources.immediate, ...resources.additional],
      handoffProtocol: resources.handoffScript
    };
  }

  /**
   * Schedule follow-up check
   */
  scheduleFollowUp(
    userId: string,
    crisisType: string,
    resourcesProvided: string[]
  ): void {
    const followUp = {
      userId,
      timestamp: new Date(),
      crisisType,
      resourcesProvided,
      followUpScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.followUpQueue.set(userId, followUp);

    logger.info('Follow-up scheduled', {
      userId,
      scheduledFor: followUp.followUpScheduled
    });
  }

  /**
   * Check cultural crisis patterns
   */
  private checkCulturalPatterns(
    input: string,
    culturalContext: string
  ): {
    match: boolean;
    severity: CrisisAssessment['severity'];
    confidence: number;
  } {
    const patterns = CULTURAL_CRISIS_PATTERNS[culturalContext];
    if (!patterns) {
      return { match: false, severity: 'monitoring', confidence: 0 };
    }

    const lowerInput = input.toLowerCase();
    const matches = patterns.patterns.filter(p =>
      lowerInput.includes(p.toLowerCase())
    );

    if (matches.length > 0) {
      return {
        match: true,
        severity: matches.length > 1 ? 'urgent' : 'concerning',
        confidence: Math.min(0.9, matches.length * 0.3)
      };
    }

    return { match: false, severity: 'monitoring', confidence: 0 };
  }

  /**
   * Get culturally specific resources
   */
  private getCulturalResources(cultural: string, region: string): string[] {
    const culturalResources: Record<string, string[]> = {
      eastAsian: ['Asian Mental Health Collective', 'NAAPIMHA'],
      latinAmerican: ['Latino Behavioral Health Services', 'Consejo Counseling'],
      indigenous: ['Indigenous Wellness Research Institute', 'Native Hope'],
      lgbtq: ['Trevor Project', 'Trans Lifeline: 1-877-565-8860'],
      veteran: ['Veterans Crisis Line', 'Wounded Warrior Project']
    };

    return culturalResources[cultural] || [];
  }

  /**
   * Generate appropriate handoff script
   */
  private generateHandoffScript(crisisType: string, resources: string[]): string {
    const scripts = {
      suicide: `I'm deeply concerned for your safety. Please reach out right now to:
${resources.join('\n')}
These people are trained to help and want to support you.
You matter, and there is help available.`,

      safety: `Your safety is the immediate priority. Please contact:
${resources.join('\n')}
If you're in immediate danger, call emergency services now.
You deserve to be safe.`,

      medical: `This sounds like a medical emergency. Please call:
${resources.join('\n')}
Don't wait - get medical help immediately.`,

      mental_health: `You're going through something very difficult. These resources can help:
${resources.join('\n')}
Reaching out is a sign of strength, not weakness.`
    };

    return scripts[crisisType] || scripts.mental_health;
  }

  /**
   * Detect user's region for resource routing
   */
  private detectRegion(location?: string): string {
    if (!location) return 'INTL';

    const regionMap = {
      'united states': 'US',
      'usa': 'US',
      'america': 'US',
      'united kingdom': 'UK',
      'britain': 'UK',
      'england': 'UK',
      'canada': 'CA',
      'australia': 'AU',
      'new zealand': 'AU' // Uses similar resources
    };

    const lower = location.toLowerCase();
    for (const [key, value] of Object.entries(regionMap)) {
      if (lower.includes(key)) return value;
    }

    return 'INTL';
  }

  /**
   * Document liability boundaries
   */
  getLiabilityDisclaimer(): string {
    return `
IMPORTANT: Maya is not a crisis intervention system or emergency service.
Maya cannot replace professional emergency response or mental health care.

If you or someone you know is in crisis:
- Call emergency services (911 in US, 999 in UK, 000 in AU)
- Contact a crisis hotline (988 in US, 116 123 in UK)
- Go to your nearest emergency room
- Reach out to a trusted friend, family member, or professional

Maya provides resources and support but cannot provide emergency intervention.
Always prioritize your safety and seek appropriate professional help when needed.
    `.trim();
  }

  /**
   * Get follow-up status for monitoring
   */
  getFollowUpStatus(): {
    pending: number;
    overdue: number;
    completed: number;
  } {
    const now = new Date();
    let pending = 0;
    let overdue = 0;

    this.followUpQueue.forEach(followUp => {
      if (followUp.followUpScheduled) {
        if (followUp.followUpScheduled > now) {
          pending++;
        } else {
          overdue++;
        }
      }
    });

    return {
      pending,
      overdue,
      completed: 0 // Would track completed follow-ups
    };
  }
}

// Export singleton for consistent resource routing
export const crisisRouter = new CrisisResourceRouter();