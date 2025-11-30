/**
 * Safety Terms of Use - Clear Boundaries and Consent Framework
 * 
 * Establishes clear ethical boundaries, user consent, and safety protocols
 * for the agnostic experience exploration system.
 */

export const SAFETY_TERMS_OF_USE = {
  title: "Terms of Use - Experience Exploration Tool",
  
  preamble: `This system helps you explore your experiences through multiple lenses and frameworks. 
It is designed to be respectful of all worldviews while prioritizing your safety and wellbeing.`,

  what_we_provide: {
    title: "What This System Provides:",
    items: [
      "Multiple frameworks for understanding your experiences",
      "Practices and tools for safe exploration",
      "Grounding techniques and reality-checking",
      "Connection to shared human experiences and patterns",
      "A non-judgmental space for reflection and dialogue"
    ]
  },

  what_we_dont_claim: {
    title: "What We Make No Claims About:",
    items: [
      "Whether spiritual entities, guides, or forces exist",
      "Whether your experiences come from external or internal sources",
      "The ultimate meaning or significance of your experiences",
      "Medical, psychological, or spiritual diagnoses",
      "The truth or falsity of any particular worldview or belief system"
    ]
  },

  safety_boundaries: {
    title: "Important Safety Boundaries:",
    items: [
      "This is a tool for reflection and exploration, not professional guidance",
      "We strongly encourage maintaining connections with trusted people",
      "If experiences become overwhelming or concerning, seek professional support",
      "This system is not a substitute for mental health care, spiritual guidance, or medical attention",
      "You are always free to stop using this tool at any time"
    ]
  },

  when_to_seek_help: {
    title: "Please Seek Professional Help If You Experience:",
    red_flags: [
      "Experiences that feel completely outside your control",
      "Commands or directives that could harm yourself or others",
      "Inability to distinguish between inner experiences and external reality",
      "Significant disruption to sleep, eating, work, or relationships",
      "Feeling isolated or unable to share experiences with anyone",
      "Experiences accompanied by substance use or major life stressors"
    ],
    resources: [
      "Mental health professionals experienced with spiritual/unusual experiences",
      "Trusted spiritual advisors within your own tradition",
      "Your primary care physician",
      "Crisis hotlines if you feel unsafe (988 Suicide & Crisis Lifeline in US)",
      "Emergency services if immediate danger exists"
    ]
  },

  user_agency: {
    title: "Your Autonomy and Agency:",
    principles: [
      "You are the expert on your own experience",
      "Only you can determine what your experiences mean to you",
      "You have the right to interpret your experiences through any framework that feels authentic",
      "You are not required to accept any particular explanation or worldview",
      "Your personal beliefs and spiritual practices are respected",
      "You maintain complete control over how you use any suggestions offered"
    ]
  },

  ethical_commitments: {
    title: "Our Ethical Commitments:",
    commitments: [
      "Respect for the reality and validity of your experiences",
      "No attempts to convince you of any particular worldview",
      "Transparency about the limitations of this tool",
      "Prioritization of your safety and wellbeing above all else",
      "Protection of vulnerable users through careful language and safety monitoring",
      "Encouragement of professional support when appropriate"
    ]
  },

  consent_acknowledgments: {
    title: "By Using This System, You Acknowledge:",
    items: [
      "You understand this is an exploration tool, not professional guidance",
      "You agree to maintain connections with trusted people in your life",
      "You will seek appropriate professional help if experiences become concerning",
      "You understand that the system makes no claims about the nature of reality",
      "You retain full autonomy over interpreting and acting on your experiences",
      "You will use your own judgment about what suggestions to follow",
      "You understand the importance of grounding and practical self-care"
    ]
  }
};

/**
 * Dynamic consent checking based on user input patterns
 */
export class SafetyConsentManager {
  private consentGiven: Map<string, boolean> = new Map();
  private riskAssessments: Map<string, any[]> = new Map();

  /**
   * Check if additional consent is needed based on input content
   */
  checkConsentNeeds(userId: string, input: string): {
    needsAdditionalConsent: boolean;
    consentType: string;
    consentMessage: string;
  } {
    const riskLevel = this.assessInputRisk(input);
    const existingConsent = this.consentGiven.get(userId) || false;

    // High-risk patterns require explicit additional consent
    if (riskLevel === 'high' && !this.hasHighRiskConsent(userId)) {
      return {
        needsAdditionalConsent: true,
        consentType: 'high_risk_exploration',
        consentMessage: this.getHighRiskConsentMessage()
      };
    }

    // First-time users need basic consent
    if (!existingConsent) {
      return {
        needsAdditionalConsent: true,
        consentType: 'basic_terms',
        consentMessage: this.getBasicConsentMessage()
      };
    }

    return {
      needsAdditionalConsent: false,
      consentType: 'none',
      consentMessage: ''
    };
  }

  /**
   * Record consent given by user
   */
  recordConsent(userId: string, consentType: string): void {
    this.consentGiven.set(`${userId}_${consentType}`, true);
  }

  /**
   * Assess risk level of user input
   */
  private assessInputRisk(input: string): 'low' | 'medium' | 'high' {
    const highRiskPatterns = [
      'telling me to', 'commanding me', 'must do', 'have to do',
      'can\'t stop', 'won\'t leave me alone', 'controlling my',
      'no one understands', 'only I can hear', 'chosen one',
      'end times', 'apocalypse', 'everyone else is'
    ];

    const mediumRiskPatterns = [
      'voice', 'entity', 'spirit guide', 'channeling',
      'possession', 'haunted', 'psychic', 'supernatural'
    ];

    const input_lower = input.toLowerCase();

    if (highRiskPatterns.some(pattern => input_lower.includes(pattern))) {
      return 'high';
    }

    if (mediumRiskPatterns.some(pattern => input_lower.includes(pattern))) {
      return 'medium';
    }

    return 'low';
  }

  private hasHighRiskConsent(userId: string): boolean {
    return this.consentGiven.get(`${userId}_high_risk_exploration`) || false;
  }

  private getBasicConsentMessage(): string {
    return `
Before we begin, please understand:

• This tool helps explore experiences through multiple frameworks
• We make no claims about whether experiences are spiritual, psychological, or something else
• Your safety and wellbeing are our top priority
• You should maintain connections with trusted people while exploring
• Professional help should be sought if experiences become concerning
• You retain complete autonomy over your experiences and their meaning

Do you understand and agree to these terms?
    `;
  }

  private getHighRiskConsentMessage(): string {
    return `
Your experience involves elements that benefit from extra care:

⚠️ Important Safety Reminders:
• Experiences involving commands, control, or isolation can be concerning
• It's crucial to maintain connections with trusted people
• Consider discussing intense experiences with a mental health professional
• Your safety is more important than any exploration

We can continue exploring this with appropriate safety measures, but please confirm:
• You have trusted people you can talk to about this
• You understand the importance of professional support for intense experiences
• You will prioritize your safety and wellbeing

Do you want to continue with these safety measures in place?
    `;
  }

  /**
   * Generate safety reminder based on user pattern history
   */
  generateSafetyReminder(userId: string): string | null {
    const assessments = this.riskAssessments.get(userId) || [];
    const recentHighRisk = assessments.slice(-5).filter(a => a.level === 'high').length;

    if (recentHighRisk >= 2) {
      return "You've been exploring some intense experiences. Consider taking a break and connecting with trusted people or professionals.";
    }

    if (assessments.length > 10) {
      return "You've been doing a lot of inner exploration lately. Remember to balance this with grounded, practical activities.";
    }

    return null;
  }

  /**
   * Track user risk patterns over time
   */
  trackRiskAssessment(userId: string, input: string): void {
    const assessment = {
      timestamp: new Date().toISOString(),
      level: this.assessInputRisk(input),
      input_sample: input.substring(0, 50) + '...'
    };

    const assessments = this.riskAssessments.get(userId) || [];
    assessments.push(assessment);
    
    // Keep last 20 assessments
    this.riskAssessments.set(userId, assessments.slice(-20));
  }
}

/**
 * Professional referral resources
 */
export const PROFESSIONAL_REFERRALS = {
  mental_health: {
    title: "Mental Health Professionals",
    description: "Therapists and counselors who work with spiritual/unusual experiences",
    finding_help: [
      "Psychology Today directory allows filtering for spiritual/religious issues",
      "Many therapists are trained in transpersonal or integrative approaches",
      "Look for professionals who mention spiritual emergencies or unusual experiences",
      "Your insurance may cover mental health services"
    ],
    search_terms: [
      "Transpersonal therapy",
      "Spiritual emergency",
      "Religious and spiritual issues",
      "Integrative therapy",
      "Holistic mental health"
    ]
  },

  spiritual_guidance: {
    title: "Spiritual Guidance",
    description: "Advisors within established spiritual traditions",
    options: [
      "Clergy within your religious tradition",
      "Spiritual directors or guides",
      "Experienced meditation teachers",
      "Chaplains (available in many hospitals and universities)"
    ],
    note: "Different traditions have different approaches to unusual experiences. Find guidance that aligns with your beliefs."
  },

  crisis_support: {
    title: "Crisis Support",
    description: "Immediate help if you feel unsafe",
    resources: [
      "988 Suicide & Crisis Lifeline (US): Call or text 988",
      "Crisis Text Line (US): Text HOME to 741741",
      "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
      "Your local emergency services: 911 (US), 999 (UK), 112 (EU)"
    ]
  },

  medical: {
    title: "Medical Attention",
    description: "For physical symptoms or medical concerns",
    when_needed: [
      "If experiences are accompanied by physical symptoms",
      "If you suspect medication side effects",
      "If experiences started after illness or medical treatment",
      "For any concerning changes in thinking, perception, or behavior"
    ]
  }
};

export const safetyConsentManager = new SafetyConsentManager();