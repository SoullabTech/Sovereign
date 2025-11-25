/**
 * Conversational Magic Enhancement System
 * Beyond basic voice recognition - creating truly magical conversation flow
 */

export interface ConversationalContext {
  // Emotional tone detection
  emotionalTone: 'neutral' | 'excited' | 'contemplative' | 'stressed' | 'joyful' | 'seeking';

  // Conversation pace
  pace: 'slow' | 'moderate' | 'fast' | 'variable';

  // User speaking patterns
  averagePauseDuration: number;
  averageUtteranceLength: number;

  // Engagement indicators
  interruptionAttempts: number;
  backChanneling: boolean; // "mm-hmm", "yeah", "right"

  // Topic depth
  topicDepth: 'surface' | 'exploring' | 'deep' | 'philosophical';

  // Energy level
  energyLevel: number; // 0-100

  // Time of day awareness
  timeContext: 'morning' | 'afternoon' | 'evening' | 'late-night';
}

export class ConversationalMagicEngine {
  private context: ConversationalContext;
  private speechRateAnalyzer: SpeechRateAnalyzer;
  private emotionalToneDetector: EmotionalToneDetector;
  private interruptionHandler: InterruptionHandler;

  constructor() {
    this.context = this.initializeContext();
    this.speechRateAnalyzer = new SpeechRateAnalyzer();
    this.emotionalToneDetector = new EmotionalToneDetector();
    this.interruptionHandler = new InterruptionHandler();
  }

  /**
   * 1. INTERRUPTION HANDLING
   * Allow user to interrupt Maya mid-response naturally
   */
  handleInterruption(isUserSpeaking: boolean, isMayaSpeaking: boolean): void {
    if (isUserSpeaking && isMayaSpeaking) {
      // Gracefully pause Maya's speech
      this.pauseMayaGracefully();

      // Mark as interruption attempt
      this.context.interruptionAttempts++;

      // Adjust future response timing to be more concise
      this.adjustResponseStyle('more-concise');
    }
  }

  /**
   * 2. BACK-CHANNELING DETECTION
   * Recognize "mm-hmm", "yeah", "go on" as encouragement, not interruption
   */
  detectBackChanneling(transcript: string): boolean {
    const backChannels = [
      'mm-hmm', 'mmhmm', 'uh-huh', 'yeah', 'yes', 'right',
      'okay', 'i see', 'go on', 'continue', 'interesting',
      'tell me more', 'wow', 'really', 'oh', 'ah'
    ];

    const normalized = transcript.toLowerCase().trim();
    const isBackChannel = backChannels.some(bc => normalized === bc || normalized === bc + '?');

    if (isBackChannel) {
      this.context.backChanneling = true;
      // Don't interrupt Maya, just acknowledge
      return true;
    }

    return false;
  }

  /**
   * 3. DYNAMIC SILENCE TIMING
   * Adjust silence threshold based on conversation flow
   */
  getDynamicSilenceThreshold(): number {
    let baseThreshold = 1800; // Default 1.8 seconds

    // Adjust based on pace
    if (this.context.pace === 'fast') {
      baseThreshold = 1200; // 1.2 seconds for fast conversations
    } else if (this.context.pace === 'slow') {
      baseThreshold = 2500; // 2.5 seconds for contemplative pace
    }

    // Adjust based on topic depth
    if (this.context.topicDepth === 'philosophical') {
      baseThreshold += 700; // Add time for deeper thoughts
    }

    // Adjust based on time of day
    if (this.context.timeContext === 'late-night') {
      baseThreshold += 500; // Slower pace at night
    }

    // Learn from user's patterns
    if (this.context.averagePauseDuration > 0) {
      // Adapt to user's natural speaking rhythm
      baseThreshold = Math.min(
        baseThreshold,
        this.context.averagePauseDuration * 1.5
      );
    }

    return baseThreshold;
  }

  /**
   * 4. EMOTIONAL TONE MATCHING
   * Match Maya's response style to user's emotional state
   */
  getResponseStyle(): ResponseStyle {
    const style: ResponseStyle = {
      speed: 1.0,
      pitch: 1.0,
      warmth: 0.7,
      formality: 0.5,
      brevity: 0.5,
      enthusiasm: 0.5
    };

    switch (this.context.emotionalTone) {
      case 'excited':
        style.speed = 1.1;
        style.pitch = 1.05;
        style.enthusiasm = 0.8;
        style.warmth = 0.8;
        break;

      case 'contemplative':
        style.speed = 0.9;
        style.pitch = 0.95;
        style.formality = 0.3;
        style.warmth = 0.8;
        break;

      case 'stressed':
        style.speed = 0.95;
        style.warmth = 0.9;
        style.brevity = 0.7; // Shorter, clearer responses
        break;

      case 'joyful':
        style.enthusiasm = 0.9;
        style.warmth = 0.9;
        style.speed = 1.05;
        break;

      case 'seeking':
        style.formality = 0.4;
        style.warmth = 0.85;
        style.brevity = 0.3; // More detailed responses
        break;
    }

    return style;
  }

  /**
   * 5. PROSODIC MIRRORING
   * Subtly match user's speech patterns
   */
  analyzeSpeechPatterns(audioData: Float32Array): void {
    // Analyze pitch variance
    const pitchVariance = this.calculatePitchVariance(audioData);

    // Analyze speaking rate
    const speakingRate = this.speechRateAnalyzer.analyze(audioData);

    // Update context
    if (speakingRate > 180) {
      this.context.pace = 'fast';
    } else if (speakingRate < 120) {
      this.context.pace = 'slow';
    } else {
      this.context.pace = 'moderate';
    }

    // High pitch variance might indicate excitement or stress
    if (pitchVariance > 0.3) {
      this.context.energyLevel = Math.min(100, this.context.energyLevel + 10);
    }
  }

  /**
   * 6. BREATH DETECTION
   * Detect natural breath pauses vs end of thought
   */
  isBreathPause(silenceDuration: number, audioLevel: number): boolean {
    // Breath pauses are typically 200-600ms with low but not zero audio
    if (silenceDuration < 600 && audioLevel > 0.01 && audioLevel < 0.1) {
      return true;
    }
    return false;
  }

  /**
   * 7. TOPIC TRANSITION DETECTION
   * Recognize when user is changing topics
   */
  detectTopicTransition(currentText: string, previousText: string): boolean {
    const transitionPhrases = [
      'by the way', 'speaking of', 'that reminds me',
      'on another note', 'anyway', 'so anyway',
      'actually', 'oh and', 'also', 'wait',
      'before i forget', 'one more thing'
    ];

    const normalized = currentText.toLowerCase();
    return transitionPhrases.some(phrase => normalized.includes(phrase));
  }

  /**
   * 8. ENGAGEMENT SCORING
   * Track how engaged the user is
   */
  calculateEngagementScore(): number {
    let score = 50; // Baseline

    // Longer utterances suggest engagement
    if (this.context.averageUtteranceLength > 50) score += 10;
    if (this.context.averageUtteranceLength > 100) score += 10;

    // Back-channeling is positive
    if (this.context.backChanneling) score += 15;

    // High energy is engaging
    score += this.context.energyLevel * 0.2;

    // Too many interruptions might indicate frustration
    if (this.context.interruptionAttempts > 3) score -= 10;

    // Deep topics suggest engagement
    if (this.context.topicDepth === 'deep' ||
        this.context.topicDepth === 'philosophical') {
      score += 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 9. ADAPTIVE RESPONSE TIMING
   * Learn and adapt to user's conversational rhythm
   */
  learnUserRhythm(pauseDurations: number[], utteranceLengths: number[]): void {
    // Calculate rolling averages
    if (pauseDurations.length > 5) {
      const recentPauses = pauseDurations.slice(-5);
      this.context.averagePauseDuration =
        recentPauses.reduce((a, b) => a + b, 0) / recentPauses.length;
    }

    if (utteranceLengths.length > 3) {
      const recentUtterances = utteranceLengths.slice(-3);
      this.context.averageUtteranceLength =
        recentUtterances.reduce((a, b) => a + b, 0) / recentUtterances.length;
    }
  }

  /**
   * 10. NATURAL TURN-TAKING
   * Predict when user is done speaking
   */
  predictEndOfTurn(features: TurnFeatures): number {
    let confidence = 0;

    // Falling intonation suggests end of turn
    if (features.intonationPattern === 'falling') confidence += 0.3;

    // Syntactic completion
    if (features.syntacticallyComplete) confidence += 0.3;

    // Pause duration
    if (features.pauseDuration > this.context.averagePauseDuration) {
      confidence += 0.2;
    }

    // Filled pauses ("um", "uh") suggest continuation
    if (features.hasFilledPause) confidence -= 0.3;

    // Speed changes - slowing down often indicates ending
    if (features.speedChange < 0) confidence += 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  // Helper methods
  private initializeContext(): ConversationalContext {
    const hour = new Date().getHours();
    let timeContext: ConversationalContext['timeContext'] = 'afternoon';

    if (hour >= 5 && hour < 12) timeContext = 'morning';
    else if (hour >= 12 && hour < 17) timeContext = 'afternoon';
    else if (hour >= 17 && hour < 22) timeContext = 'evening';
    else timeContext = 'late-night';

    return {
      emotionalTone: 'neutral',
      pace: 'moderate',
      averagePauseDuration: 0,
      averageUtteranceLength: 0,
      interruptionAttempts: 0,
      backChanneling: false,
      topicDepth: 'surface',
      energyLevel: 50,
      timeContext
    };
  }

  private pauseMayaGracefully(): void {
    // Implementation would pause TTS gracefully
    console.log('Gracefully pausing Maya...');
  }

  private adjustResponseStyle(style: string): void {
    // Adjust Maya's response style
    console.log(`Adjusting response style to: ${style}`);
  }

  private calculatePitchVariance(audioData: Float32Array): number {
    // Simplified pitch variance calculation
    // In production, use proper pitch detection algorithm
    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i];
      sumSquares += audioData[i] * audioData[i];
    }

    const mean = sum / audioData.length;
    const variance = (sumSquares / audioData.length) - (mean * mean);

    return Math.sqrt(variance);
  }
}

// Supporting classes
class SpeechRateAnalyzer {
  analyze(audioData: Float32Array): number {
    // Simplified - returns words per minute estimate
    // In production, use proper speech rate detection
    return 150; // Default moderate pace
  }
}

class EmotionalToneDetector {
  detect(audioFeatures: any): ConversationalContext['emotionalTone'] {
    // Simplified emotional tone detection
    // In production, use proper emotion recognition
    return 'neutral';
  }
}

class InterruptionHandler {
  handle(interruption: any): void {
    // Handle interruption gracefully
  }
}

interface ResponseStyle {
  speed: number;
  pitch: number;
  warmth: number;
  formality: number;
  brevity: number;
  enthusiasm: number;
}

interface TurnFeatures {
  intonationPattern: 'rising' | 'falling' | 'flat';
  syntacticallyComplete: boolean;
  pauseDuration: number;
  hasFilledPause: boolean;
  speedChange: number;
}