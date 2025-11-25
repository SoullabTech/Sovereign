/**
 * Maya Feedback Detection
 * Learn from subtle user signals without explicit feedback
 */

export interface UserBehaviorSignals {
  responseTime: number; // How quickly they responded
  messageLength: number; // Length of their response
  emotionalMarkers: string[]; // Detected emotions
  continuationSignals: string[]; // "tell me more", "wow", etc.
  disconnectionSignals: string[]; // "ok", "sure", short responses
  questionAsked: boolean; // Did they ask a follow-up question?
  vulnerability: number; // 0-1 scale of openness shown
  energyShift: 'increased' | 'decreased' | 'maintained';
}

export class MayaFeedbackDetection {

  /**
   * Analyze user's response to detect engagement level
   */
  analyzeUserResponse(userMessage: string, responseTimeMs: number, previousMessage?: string): UserBehaviorSignals {
    const words = userMessage.trim().split(/\s+/);
    const lowerMessage = userMessage.toLowerCase();

    return {
      responseTime: responseTimeMs,
      messageLength: words.length,
      emotionalMarkers: this.detectEmotionalMarkers(lowerMessage),
      continuationSignals: this.detectContinuationSignals(lowerMessage),
      disconnectionSignals: this.detectDisconnectionSignals(lowerMessage),
      questionAsked: this.hasQuestion(userMessage),
      vulnerability: this.assessVulnerability(lowerMessage),
      energyShift: this.detectEnergyShift(userMessage, previousMessage)
    };
  }

  /**
   * Convert behavioral signals into engagement score
   */
  calculateEngagement(signals: UserBehaviorSignals): number {
    let score = 0.5; // Start neutral

    // Response time (sweet spot is 3-15 seconds)
    if (signals.responseTime > 3000 && signals.responseTime < 15000) {
      score += 0.1; // Thoughtful response time
    } else if (signals.responseTime < 1000) {
      score -= 0.1; // Too quick, might be dismissive
    }

    // Message length (longer usually means more engaged)
    if (signals.messageLength > 10) score += 0.2;
    else if (signals.messageLength < 3) score -= 0.2;

    // Emotional markers
    score += signals.emotionalMarkers.length * 0.1;

    // Continuation signals
    score += signals.continuationSignals.length * 0.15;

    // Disconnection signals
    score -= signals.disconnectionSignals.length * 0.2;

    // Questions show engagement
    if (signals.questionAsked) score += 0.15;

    // Vulnerability shows trust
    score += signals.vulnerability * 0.2;

    // Energy shifts
    if (signals.energyShift === 'increased') score += 0.1;
    else if (signals.energyShift === 'decreased') score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private detectEmotionalMarkers(message: string): string[] {
    const markers: string[] = [];

    const emotions = {
      joy: ['happy', 'excited', 'amazing', 'wonderful', 'love', 'beautiful', 'incredible'],
      sadness: ['sad', 'hurt', 'painful', 'difficult', 'hard', 'struggling'],
      anger: ['angry', 'frustrated', 'annoyed', 'mad', 'irritated'],
      fear: ['scared', 'worried', 'anxious', 'nervous', 'afraid'],
      surprise: ['wow', 'whoa', 'incredible', 'unbelievable', 'shocking'],
      gratitude: ['thank', 'grateful', 'appreciate', 'thankful'],
      curiosity: ['wonder', 'curious', 'interesting', 'fascinating']
    };

    for (const [emotion, words] of Object.entries(emotions)) {
      if (words.some(word => message.includes(word))) {
        markers.push(emotion);
      }
    }

    return markers;
  }

  private detectContinuationSignals(message: string): string[] {
    const signals: string[] = [];

    const continuationPhrases = [
      'tell me more',
      'go on',
      'what else',
      'and then',
      'wow',
      'really?',
      'that\'s interesting',
      'i see',
      'exactly',
      'yes!',
      'absolutely',
      'i love that',
      'beautiful',
      'powerful',
      'deep'
    ];

    for (const phrase of continuationPhrases) {
      if (message.includes(phrase)) {
        signals.push(phrase);
      }
    }

    return signals;
  }

  private detectDisconnectionSignals(message: string): string[] {
    const signals: string[] = [];

    const disconnectionPhrases = [
      'ok',
      'sure',
      'fine',
      'whatever',
      'i guess',
      'maybe',
      'not really',
      'i don\'t know',
      'hmm'
    ];

    // Only count these if they're the entire message or very short
    const words = message.trim().split(/\s+/);
    if (words.length <= 3) {
      for (const phrase of disconnectionPhrases) {
        if (message.includes(phrase)) {
          signals.push(phrase);
        }
      }
    }

    return signals;
  }

  private hasQuestion(message: string): boolean {
    return message.includes('?') ||
           message.toLowerCase().startsWith('what') ||
           message.toLowerCase().startsWith('how') ||
           message.toLowerCase().startsWith('why') ||
           message.toLowerCase().startsWith('when') ||
           message.toLowerCase().startsWith('where') ||
           message.toLowerCase().startsWith('do you') ||
           message.toLowerCase().startsWith('can you') ||
           message.toLowerCase().startsWith('will you');
  }

  private assessVulnerability(message: string): number {
    let vulnerability = 0;

    const vulnerabilityMarkers = [
      'i feel',
      'i\'m scared',
      'i\'m worried',
      'i don\'t know',
      'i\'m confused',
      'i\'m struggling',
      'i\'m not sure',
      'honestly',
      'to be honest',
      'i have to admit',
      'i\'ve never',
      'i\'m afraid',
      'i hope',
      'i wish',
      'i dream',
      'i long',
      'i ache',
      'i yearn'
    ];

    for (const marker of vulnerabilityMarkers) {
      if (message.includes(marker)) {
        vulnerability += 0.2;
      }
    }

    return Math.min(1, vulnerability);
  }

  private detectEnergyShift(currentMessage: string, previousMessage?: string): 'increased' | 'decreased' | 'maintained' {
    if (!previousMessage) return 'maintained';

    const currentEnergy = this.assessEnergyLevel(currentMessage);
    const previousEnergy = this.assessEnergyLevel(previousMessage);

    if (currentEnergy > previousEnergy + 0.2) return 'increased';
    if (currentEnergy < previousEnergy - 0.2) return 'decreased';
    return 'maintained';
  }

  private assessEnergyLevel(message: string): number {
    const lowerMessage = message.toLowerCase();
    let energy = 0.5;

    // Exclamation marks
    energy += (message.match(/!/g) || []).length * 0.1;

    // Caps
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    energy += capsRatio * 0.3;

    // High energy words
    const highEnergyWords = ['amazing', 'incredible', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'perfect', 'love', 'excited'];
    for (const word of highEnergyWords) {
      if (lowerMessage.includes(word)) energy += 0.1;
    }

    // Low energy words
    const lowEnergyWords = ['tired', 'exhausted', 'drained', 'overwhelmed', 'stuck', 'lost', 'confused'];
    for (const word of lowEnergyWords) {
      if (lowerMessage.includes(word)) energy -= 0.1;
    }

    return Math.max(0, Math.min(1, energy));
  }
}

export const mayaFeedbackDetection = new MayaFeedbackDetection();