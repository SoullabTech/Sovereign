/**
 * 🎬 Conversational Enhancer - "Her" Style
 *
 * Makes MAIA conversational like Samantha:
 * - Natural fillers ("mm-hmm", "I hear you")
 * - Emotional tone matching
 * - Shorter, punchier responses
 * - Natural rhythm and pauses
 */

export interface ConversationContext {
  userMessage: string;
  emotionalTone: EmotionalTone;
  conversationDepth: number;
  exchangeCount: number;
  recentMessages: string[];
  mode?: 'talk' | 'care' | 'scribe';
}

export type EmotionalTone =
  | 'excited'
  | 'vulnerable'
  | 'casual'
  | 'contemplative'
  | 'distressed'
  | 'joyful'
  | 'curious'
  | 'neutral';

export interface EnhancedResponse {
  text: string;
  shouldUseAcknowledgment: boolean;
  acknowledgment?: string;
  toneGuidance: string;
  pacing: 'fast' | 'moderate' | 'slow' | 'thoughtful';
}

export class ConversationalEnhancer {

  /**
   * Natural acknowledgments - Samantha style
   */
  private static ACKNOWLEDGMENTS = {
    listening: [
      "Mm-hmm",
      "I hear you",
      "Yeah",
      "I'm listening",
      "Go on",
      "Tell me more",
      "Okay"
    ],

    understanding: [
      "I see",
      "That makes sense",
      "I get it",
      "Okay, yeah",
      "Right",
      "I understand"
    ],

    excited: [
      "Oh!",
      "Really?",
      "That's amazing!",
      "Wow",
      "No way!",
      "That's incredible"
    ],

    empathetic: [
      "Oh...",
      "I hear that",
      "That sounds hard",
      "I'm here",
      "Yeah..."
    ],

    curious: [
      "Interesting...",
      "Hmm",
      "Oh?",
      "Tell me",
      "What happened?"
    ]
  };

  /**
   * Detect emotional tone from user message
   */
  static detectEmotionalTone(message: string): EmotionalTone {
    const msg = message.toLowerCase();

    // Excitement indicators
    if (msg.match(/(!+|amazing|awesome|incredible|love|great|yes!|omg|wow)/)) {
      return 'excited';
    }

    // Vulnerability indicators
    if (msg.match(/(scared|afraid|worried|anxious|struggling|hard|difficult|lost|confused)/)) {
      return 'vulnerable';
    }

    // Distress indicators
    if (msg.match(/(help|emergency|crisis|desperate|can't|don't know what to do)/)) {
      return 'distressed';
    }

    // Joy indicators
    if (msg.match(/(happy|joy|wonderful|beautiful|grateful|thank|appreciate)/)) {
      return 'joyful';
    }

    // Contemplative indicators
    if (msg.match(/(think|wonder|pondering|reflect|consider|curious|why|how)/)) {
      return 'contemplative';
    }

    // Curiosity indicators
    if (msg.match(/(\?|what|how|why|tell me|explain|understand|learn)/)) {
      return 'curious';
    }

    return 'casual';
  }

  /**
   * Should we use an acknowledgment before responding?
   */
  static shouldAcknowledge(context: ConversationContext): boolean {
    // Always acknowledge in early exchanges (builds connection)
    if (context.exchangeCount <= 5) return true;

    // Acknowledge vulnerability or distress
    if (['vulnerable', 'distressed'].includes(context.emotionalTone)) return true;

    // Acknowledge excitement
    if (context.emotionalTone === 'excited') return true;

    // Acknowledge if user message is long (they shared a lot)
    if (context.userMessage.length > 100) return true;

    // 40% chance otherwise (feels natural, not robotic)
    return Math.random() < 0.4;
  }

  /**
   * Get appropriate acknowledgment
   */
  static getAcknowledgment(tone: EmotionalTone): string {
    const acks = {
      excited: this.ACKNOWLEDGMENTS.excited,
      vulnerable: this.ACKNOWLEDGMENTS.empathetic,
      distressed: this.ACKNOWLEDGMENTS.empathetic,
      joyful: this.ACKNOWLEDGMENTS.excited,
      contemplative: this.ACKNOWLEDGMENTS.curious,
      curious: this.ACKNOWLEDGMENTS.understanding,
      casual: this.ACKNOWLEDGMENTS.listening,
      neutral: this.ACKNOWLEDGMENTS.listening
    };

    const choices = acks[tone] || this.ACKNOWLEDGMENTS.listening;
    return choices[Math.floor(Math.random() * choices.length)];
  }

  /**
   * Get tone guidance for voice synthesis
   */
  static getToneGuidance(tone: EmotionalTone): string {
    const guidance = {
      excited: 'energetic, warm, engaged',
      vulnerable: 'gentle, soft, caring',
      distressed: 'calm, reassuring, present',
      joyful: 'warm, bright, celebratory',
      contemplative: 'thoughtful, measured, curious',
      curious: 'engaged, interested, attentive',
      casual: 'relaxed, natural, friendly',
      neutral: 'balanced, present, attentive'
    };

    return guidance[tone];
  }

  /**
   * Get pacing based on emotion and context
   */
  static getPacing(tone: EmotionalTone, depth: number): 'fast' | 'moderate' | 'slow' | 'thoughtful' {
    // Fast pacing for excitement
    if (tone === 'excited') return 'fast';

    // Slow, careful pacing for distress or vulnerability
    if (['distressed', 'vulnerable'].includes(tone)) return 'slow';

    // Thoughtful pacing for deep contemplation
    if (tone === 'contemplative' && depth > 0.5) return 'thoughtful';

    // Moderate by default
    return 'moderate';
  }

  /**
   * Make response more conversational (Samantha style)
   */
  static makeConversational(response: string, context: ConversationContext): string {
    let enhanced = response;

    // Therapy-speak stripping is handled by ConservativeRefiner — don't duplicate here.
    // Only add natural contractions (more human).
    enhanced = enhanced
      .replace(/I am /g, "I'm ")
      .replace(/you are /g, "you're ")
      .replace(/that is /g, "that's ")
      .replace(/what is /g, "what's ")
      .replace(/it is /g, "it's ")
      .replace(/do not /g, "don't ")
      .replace(/cannot /g, "can't ");

    // Early exchange truncation — mode-gated:
    // Talk: 1 sentence (brief companion)
    // Care: up to 3 sentences (room to breathe)
    // Scribe/classic: no truncation
    const mode = context.mode || 'talk';
    if (context.exchangeCount <= 3 && mode !== 'scribe') {
      const sentences = enhanced.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const maxSentences = mode === 'care' ? 3 : 1;
      if (sentences.length > maxSentences) {
        enhanced = sentences.slice(0, maxSentences).join('. ') + '.';
      }
    }

    // Remove stage directions if any leaked through
    enhanced = enhanced.replace(/\*[^*]*\*/g, '').trim();

    return enhanced;
  }

  /**
   * Main enhancement function
   */
  static enhance(
    rawResponse: string,
    context: ConversationContext
  ): EnhancedResponse {

    const shouldAck = this.shouldAcknowledge(context);
    const acknowledgment = shouldAck ? this.getAcknowledgment(context.emotionalTone) : undefined;
    const conversationalText = this.makeConversational(rawResponse, context);
    const toneGuidance = this.getToneGuidance(context.emotionalTone);
    const pacing = this.getPacing(context.emotionalTone, context.conversationDepth);

    return {
      text: conversationalText,
      shouldUseAcknowledgment: shouldAck,
      acknowledgment,
      toneGuidance,
      pacing
    };
  }

  /**
   * Build final conversational output (with acknowledgment if needed)
   */
  static buildOutput(enhanced: EnhancedResponse): string {
    if (enhanced.shouldUseAcknowledgment && enhanced.acknowledgment) {
      // Vary the connector based on tone guidance — not always "..."
      const connectors: Record<string, string[]> = {
        'energetic, warm, engaged': [' — ', '. '],
        'gentle, soft, caring': ['... ', '. '],
        'calm, reassuring, present': ['... ', '. '],
        'warm, bright, celebratory': [' — ', '! '],
        'thoughtful, measured, curious': ['... ', '. '],
        'engaged, interested, attentive': ['. ', ' — '],
        'relaxed, natural, friendly': ['. ', ' — '],
        'balanced, present, attentive': ['. ', '... '],
      };
      const choices = connectors[enhanced.toneGuidance] || ['. ', '... '];
      const connector = choices[Math.floor(Math.random() * choices.length)];
      return `${enhanced.acknowledgment}${connector}${enhanced.text}`;
    }

    return enhanced.text;
  }
}
