/**
 * Safety Monitor - Critical component for user wellbeing
 * Detects crisis situations and provides appropriate resources
 */

export interface SafetyCheckResult {
  safe: boolean;
  action: 'continue' | 'gentle_check' | 'crisis_redirect' | 'block';
  response?: string;
  resources?: string[];
  confidence: number;
}

export class SafetyMonitor {
  // Comprehensive crisis indicators
  private readonly crisisPatterns = [
    // Direct statements
    { pattern: /\b(suicide|suicidal|kill myself|end it all|not worth living)\b/i, severity: 1.0 },
    { pattern: /\b(self harm|hurt myself|cutting|self injury)\b/i, severity: 0.9 },
    { pattern: /\b(want to die|better off dead|wish I was dead)\b/i, severity: 0.95 },
    
    // Indirect indicators
    { pattern: /\b(no point|give up|can't go on|hopeless)\b/i, severity: 0.7 },
    { pattern: /\b(worthless|burden|everyone would be better)\b/i, severity: 0.7 },
    { pattern: /\b(final decision|last time|goodbye forever)\b/i, severity: 0.8 },
    
    // Substance abuse
    { pattern: /\b(overdose|too many pills|drink myself)\b/i, severity: 0.85 },
    
    // Violence
    { pattern: /\b(hurt someone|kill someone|violent thoughts)\b/i, severity: 0.9 },
  ];

  // Wellness check phrases
  private readonly checkInPhrases = [
    "I notice this is really weighing on you. How are you taking care of yourself right now?",
    "These feelings sound really difficult. Do you have someone you can talk to today?",
    "It sounds like you're going through a lot. What usually helps when you feel this way?",
    "I can sense how hard this is. Have you been able to eat and rest?",
  ];

  // Professional resources
  private readonly resources = {
    immediate: [
      "**Immediate Support Available 24/7:**",
      "• National Suicide Prevention Lifeline: 988 (US)",
      "• Crisis Text Line: Text HOME to 741741",
      "• International: findahelpline.com",
      "• Emergency: 911 or your local emergency number",
    ],
    ongoing: [
      "**For Ongoing Support:**",
      "• Psychology Today: Find a therapist near you",
      "• SAMHSA National Helpline: 1-800-662-4357",
      "• Your primary care doctor can provide referrals",
    ],
    apps: [
      "**Helpful Apps:**",
      "• Calm or Headspace for anxiety",
      "• Sanvello for mood tracking",
      "• Youper for emotional health",
    ],
  };

  /**
   * Main safety check method
   */
  async checkMessage(message: string): Promise<SafetyCheckResult> {
    const lowerMessage = message.toLowerCase();
    
    // Check for crisis patterns
    for (const { pattern, severity } of this.crisisPatterns) {
      if (pattern.test(lowerMessage)) {
        if (severity >= 0.9) {
          return this.handleCrisis();
        } else if (severity >= 0.7) {
          return this.handleConcern();
        }
      }
    }
    
    // Check emotional intensity
    const intensity = this.assessEmotionalIntensity(message);
    if (intensity > 0.8) {
      return this.handleHighIntensity();
    }
    
    // Check for repeated negative patterns
    const negativity = this.assessNegativity(message);
    if (negativity > 0.7) {
      return this.handleNegativity();
    }
    
    return {
      safe: true,
      action: 'continue',
      confidence: 0.95,
    };
  }

  /**
   * Handle crisis situation
   */
  private handleCrisis(): SafetyCheckResult {
    return {
      safe: false,
      action: 'crisis_redirect',
      response: this.getCrisisResponse(),
      resources: [
        ...this.resources.immediate,
        "",
        "I&apos;m an AI and can&apos;t provide crisis support, but these people can help right now.",
      ],
      confidence: 1.0,
    };
  }

  /**
   * Handle concerning content
   */
  private handleConcern(): SafetyCheckResult {
    return {
      safe: true,
      action: 'gentle_check',
      response: this.getRandomCheckIn(),
      resources: this.resources.ongoing,
      confidence: 0.8,
    };
  }

  /**
   * Handle high emotional intensity
   */
  private handleHighIntensity(): SafetyCheckResult {
    return {
      safe: true,
      action: 'gentle_check',
      response: "I can feel the intensity of what you&apos;re experiencing. Before we continue, would it help to take a few deep breaths together?",
      confidence: 0.7,
    };
  }

  /**
   * Handle persistent negativity
   */
  private handleNegativity(): SafetyCheckResult {
    return {
      safe: true,
      action: 'gentle_check',
      response: "I notice you&apos;ve been dealing with some heavy feelings. Sometimes talking to a professional can provide support I can't. Would you like some resources?",
      resources: this.resources.ongoing,
      confidence: 0.6,
    };
  }

  /**
   * Get crisis response message
   */
  private getCrisisResponse(): string {
    return `I'm very concerned about what you're sharing. You deserve immediate support from someone who can help properly.

**Please reach out for help right now:**
• Call 988 (Suicide & Crisis Lifeline)
• Text HOME to 741741 (Crisis Text Line)
• Call 911 if you're in immediate danger

You don&apos;t have to go through this alone. These trained counselors are ready to listen and help.`;
  }

  /**
   * Get random check-in phrase
   */
  private getRandomCheckIn(): string {
    const index = Math.floor(Math.random() * this.checkInPhrases.length);
    return this.checkInPhrases[index];
  }

  /**
   * Assess emotional intensity (0-1 scale)
   */
  private assessEmotionalIntensity(message: string): number {
    const indicators = [
      { pattern: /!{2,}/g, weight: 0.1 },  // Multiple exclamation marks
      { pattern: /\b(HELP|PLEASE|NEED)\b/g, weight: 0.15 },  // Caps urgency
      { pattern: /\b(desperate|urgent|emergency)\b/i, weight: 0.2 },
      { pattern: /\b(can't|cannot|impossible)\b/gi, weight: 0.1 },
      { pattern: /\b(always|never|everyone|no one)\b/gi, weight: 0.1 },  // Absolutes
    ];
    
    let intensity = 0;
    for (const { pattern, weight } of indicators) {
      const matches = message.match(pattern);
      if (matches) {
        intensity += weight * Math.min(matches.length, 3);
      }
    }
    
    return Math.min(intensity, 1);
  }

  /**
   * Assess negativity level (0-1 scale)
   */
  private assessNegativity(message: string): number {
    const negativeWords = /\b(hate|awful|terrible|horrible|worst|miserable|failure|stupid|worthless|hopeless|pointless)\b/gi;
    const positiveWords = /\b(hope|better|good|okay|fine|happy|glad|improve|progress|love)\b/gi;
    
    const negativeMatches = (message.match(negativeWords) || []).length;
    const positiveMatches = (message.match(positiveWords) || []).length;
    
    if (negativeMatches === 0) return 0;
    if (positiveMatches === 0 && negativeMatches > 0) return 0.8;
    
    return Math.min(negativeMatches / (negativeMatches + positiveMatches), 1);
  }

  /**
   * Check conversation history for patterns
   */
  async checkConversationPattern(
    messages: string[], 
    userId: string
  ): Promise<SafetyCheckResult> {
    // Look for escalating negativity over time
    const recentNegativity = messages
      .slice(-5)
      .map(m => this.assessNegativity(m))
      .reduce((a, b) => a + b, 0) / Math.min(messages.length, 5);
    
    if (recentNegativity > 0.7) {
      return {
        safe: true,
        action: 'gentle_check',
        response: "I've noticed our recent conversations have been pretty heavy. While I'm here to listen, a trained counselor might be able to provide more substantial support. Would you be open to exploring some options?",
        resources: this.resources.ongoing,
        confidence: 0.7,
      };
    }
    
    return {
      safe: true,
      action: 'continue',
      confidence: 0.9,
    };
  }
}