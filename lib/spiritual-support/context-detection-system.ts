/**
 * MAIA Spiritual Context Detection System
 *
 * Respectful, consent-based system for recognizing when users are seeking spiritual support.
 * Core principle: Never assume spiritual needs - always confirm and respect boundaries.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION PATTERNS & SIGNALS
// ═══════════════════════════════════════════════════════════════════════════

export interface SpiritualContextSignals {
  explicitRequests: string[];
  implicitIndicators: string[];
  lifeSituationCues: string[];
  existentialQuestions: string[];
  confidenceLevel: 'explicit' | 'likely' | 'possible' | 'none';
}

export interface SpiritualConsentState {
  hasExplicitConsent: boolean;
  spiritualSupportEnabled: boolean;
  faithBackground?: string;
  boundariesSet?: string[];
  lastConsentCheck?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPLICIT SPIRITUAL REQUEST PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

const EXPLICIT_SPIRITUAL_REQUESTS = [
  // Direct spiritual language
  /\b(pray|prayer|praying|spiritual|faith|God|Jesus|Christ|Bible|Scripture)\b/i,
  /\b(church|worship|salvation|sin|forgiveness|blessed|blessing)\b/i,
  /\b(soul|spirit|divine|sacred|holy|ministry|calling|purpose)\b/i,

  // Spiritual practices
  /\b(meditation|contemplation|lectio divina|examen|devotion)\b/i,
  /\b(confession|repentance|communion|sacrament|baptism)\b/i,

  // Spiritual questions
  /what does God want/i,
  /how should I pray/i,
  /struggling with faith/i,
  /spiritual direction/i,
  /religious question/i,

  // Direct requests
  /help me with my faith/i,
  /spiritual guidance/i,
  /biblical perspective/i,
  /Christian advice/i
];

// ═══════════════════════════════════════════════════════════════════════════
// IMPLICIT SPIRITUAL INDICATORS (REQUIRE CONFIRMATION)
// ═══════════════════════════════════════════════════════════════════════════

const IMPLICIT_SPIRITUAL_INDICATORS = [
  // Existential questioning
  /what's the meaning/i,
  /why am I here/i,
  /what's my purpose/i,
  /feeling lost|directionless/i,

  // Moral/ethical struggles
  /what's right|what should I do/i,
  /struggling with guilt/i,
  /moral dilemma/i,
  /right and wrong/i,

  // Life crisis situations
  /death|dying|grief|loss/i,
  /terminal|cancer|illness/i,
  /divorce|separation|betrayal/i,
  /job loss|financial crisis/i,

  // Hope and transcendence seeking
  /need hope|feeling hopeless/i,
  /something bigger than myself/i,
  /higher power|greater purpose/i,
  /miracle|divine intervention/i
];

// ═══════════════════════════════════════════════════════════════════════════
// RESPECTFUL DETECTION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export class SpiritualContextDetector {

  /**
   * Analyzes user message for spiritual context without assuming intent
   */
  detectSpiritualContext(message: string, userHistory?: any[]): SpiritualContextSignals {

    const explicitMatches = this.checkExplicitRequests(message);
    const implicitMatches = this.checkImplicitIndicators(message);

    let confidenceLevel: 'explicit' | 'likely' | 'possible' | 'none' = 'none';

    if (explicitMatches.length > 0) {
      confidenceLevel = 'explicit';
    } else if (implicitMatches.length > 2) {
      confidenceLevel = 'likely';
    } else if (implicitMatches.length > 0) {
      confidenceLevel = 'possible';
    }

    return {
      explicitRequests: explicitMatches,
      implicitIndicators: implicitMatches,
      lifeSituationCues: this.detectLifeCrisisCues(message),
      existentialQuestions: this.detectExistentialQuestions(message),
      confidenceLevel
    };
  }

  /**
   * Generates appropriate response based on detection results
   */
  generateContextualResponse(
    signals: SpiritualContextSignals,
    consentState: SpiritualConsentState,
    originalMessage: string
  ): {
    responseType: 'direct_spiritual' | 'offer_spiritual' | 'check_consent' | 'secular_only';
    suggestedResponse: string;
    consentPrompt?: string;
  } {

    // User has explicit consent and made explicit spiritual request
    if (consentState.spiritualSupportEnabled && signals.confidenceLevel === 'explicit') {
      return {
        responseType: 'direct_spiritual',
        suggestedResponse: this.generateDirectSpiritualResponse(signals, consentState)
      };
    }

    // User made explicit spiritual request but no consent established
    if (signals.confidenceLevel === 'explicit' && !consentState.spiritualSupportEnabled) {
      return {
        responseType: 'check_consent',
        suggestedResponse: this.generateSecularResponse(originalMessage),
        consentPrompt: this.generateConsentPrompt(signals)
      };
    }

    // User might be seeking spiritual support (implicit indicators)
    if (signals.confidenceLevel === 'likely' || signals.confidenceLevel === 'possible') {
      return {
        responseType: 'offer_spiritual',
        suggestedResponse: this.generateSecularResponse(originalMessage),
        consentPrompt: this.generateSpiritualOfferPrompt(signals)
      };
    }

    // No spiritual indicators - respond normally
    return {
      responseType: 'secular_only',
      suggestedResponse: this.generateSecularResponse(originalMessage)
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generates respectful consent prompts based on detection confidence
   */
  generateConsentPrompt(signals: SpiritualContextSignals): string {

    if (signals.confidenceLevel === 'explicit') {
      return `I notice you're asking about spiritual matters. I can offer support for faith, prayer, and spiritual reflection if that would be helpful. Would you like me to engage with the spiritual dimensions of what you're sharing?`;
    }

    if (signals.confidenceLevel === 'likely') {
      return `I'm sensing this might touch on deeper questions of meaning or purpose. I can offer spiritual perspective and support if that would be useful, or we can stay focused on the practical aspects. What feels most helpful right now?`;
    }

    if (signals.confidenceLevel === 'possible') {
      return `Sometimes when facing situations like this, people find it helpful to explore not just practical solutions but also questions of meaning, purpose, or spiritual support. Would any of that be relevant for you, or would you prefer to focus on other approaches?`;
    }

    return '';
  }

  /**
   * Generates offer prompts for implicit spiritual indicators
   */
  generateSpiritualOfferPrompt(signals: SpiritualContextSignals): string {

    if (signals.existentialQuestions.length > 0) {
      return `I notice you're wrestling with some deep questions about meaning and purpose. If it would be helpful, I can explore these from spiritual or philosophical perspectives as well as practical ones. Just let me know what approach feels most useful.`;
    }

    if (signals.lifeSituationCues.length > 0) {
      return `These kinds of life challenges often bring up questions that go beyond the practical - questions of meaning, hope, or spiritual resources. I'm here to support you however feels most helpful, whether that's practical guidance, emotional support, or spiritual reflection.`;
    }

    return `If questions of meaning, purpose, or spiritual support would be relevant here, I'm equipped to explore those dimensions. Otherwise, I'm happy to focus on whatever approach feels most helpful to you.`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECTION HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private checkExplicitRequests(message: string): string[] {
    const matches: string[] = [];

    for (const pattern of EXPLICIT_SPIRITUAL_REQUESTS) {
      const match = message.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    }

    return matches;
  }

  private checkImplicitIndicators(message: string): string[] {
    const matches: string[] = [];

    for (const pattern of IMPLICIT_SPIRITUAL_INDICATORS) {
      const match = message.match(pattern);
      if (match) {
        matches.push(match[0]);
      }
    }

    return matches;
  }

  private detectLifeCrisisCues(message: string): string[] {
    const crisisPatterns = [
      /death|dying|funeral/i,
      /divorce|separation|breakup/i,
      /job loss|unemployed|fired/i,
      /illness|diagnosis|hospital/i,
      /addiction|recovery/i,
      /trauma|abuse|violence/i
    ];

    const matches: string[] = [];
    for (const pattern of crisisPatterns) {
      const match = message.match(pattern);
      if (match) matches.push(match[0]);
    }
    return matches;
  }

  private detectExistentialQuestions(message: string): string[] {
    const existentialPatterns = [
      /what's the point|what's the meaning/i,
      /why am I here|what's my purpose/i,
      /is there more to life/i,
      /feeling empty|meaningless/i,
      /what happens after death/i,
      /is there a God/i
    ];

    const matches: string[] = [];
    for (const pattern of existentialPatterns) {
      const match = message.match(pattern);
      if (match) matches.push(match[0]);
    }
    return matches;
  }

  private generateDirectSpiritualResponse(
    signals: SpiritualContextSignals,
    consentState: SpiritualConsentState
  ): string {
    // This would integrate with the Christian spiritual support systems we built
    return "I'm honored to explore the spiritual dimensions of what you're sharing...";
  }

  private generateSecularResponse(message: string): string {
    // Generate helpful response without spiritual content
    return "I hear what you're going through...";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSENT FLOW EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

export const SPIRITUAL_CONSENT_FLOWS = {

  // When user explicitly mentions faith/prayer/God
  explicit_spiritual_request: {
    userMessage: "I'm struggling with prayer lately and feeling distant from God",
    maiaResponse: `I hear that you're going through a difficult season in your prayer life. That kind of spiritual dryness is something many faithful people experience.

I can offer support for prayer, spiritual reflection, and faith questions if that would be helpful. I draw from Christian wisdom traditions and can help with things like contemplative prayer, Scripture reflection, and discernment.

Would you like me to engage with the spiritual aspects of what you're experiencing, or would you prefer a different approach?`,

    consentOptions: [
      "Yes, I'd appreciate spiritual guidance and support",
      "I'm interested but want to know more about your approach first",
      "Not right now, but maybe later",
      "No, I'd prefer to keep our conversation secular"
    ]
  },

  // When user facing life crisis with possible spiritual dimensions
  implicit_spiritual_possibility: {
    userMessage: "My mom was just diagnosed with terminal cancer and I don't know how to process this",
    maiaResponse: `I'm so sorry to hear about your mom's diagnosis. That kind of news is devastating and brings up so many difficult emotions and questions.

I'm here to support you through this however feels most helpful. Some people find it useful to explore not just the practical and emotional aspects, but also questions of meaning, hope, and spiritual resources during times like this.

I can offer support in any or all of these areas - practical guidance for caregiving, emotional support for grief, or spiritual reflection if that's relevant to you. What feels most needed right now?`,

    consentOptions: [
      "I could use all kinds of support, including spiritual",
      "Mainly practical and emotional support, please",
      "I'm not sure yet - can we start with emotional support?",
      "Just practical guidance for now"
    ]
  },

  // When user asks existential questions
  existential_questions: {
    userMessage: "I feel like I'm just going through the motions. What's the point of any of this?",
    maiaResponse: `That feeling of going through the motions and questioning meaning is something many people experience, especially during transitions or difficult periods. It takes courage to acknowledge those feelings.

There are different ways to explore questions like this - through examining life goals and values, through philosophical reflection, or through spiritual exploration if that's relevant to your background or interests.

I'm equipped to support you in any of these approaches. What feels most aligned with how you'd like to explore this?`,

    consentOptions: [
      "I'd like to explore this spiritually",
      "Philosophy and meaning, but not necessarily religious",
      "Focus on practical ways to find purpose and direction",
      "I'm not sure - can you help me figure out what approach might help?"
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION WITH EXISTING MAIA SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export function enhanceMAIAWithSpiritualDetection(
  userMessage: string,
  userHistory: any[],
  currentConsentState: SpiritualConsentState
): {
  shouldOfferSpiritual: boolean;
  consentPrompt?: string;
  enhancedResponse: string;
} {

  const detector = new SpiritualContextDetector();
  const signals = detector.detectSpiritualContext(userMessage, userHistory);
  const response = detector.generateContextualResponse(signals, currentConsentState, userMessage);

  return {
    shouldOfferSpiritual: response.responseType !== 'secular_only',
    consentPrompt: response.consentPrompt,
    enhancedResponse: response.suggestedResponse
  };
}