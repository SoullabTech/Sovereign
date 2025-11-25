/**
 * Maya Response Configuration
 * Standards for conversational AI response patterns
 */

export interface ResponseConfig {
  maxTokens: number;
  temperature: number;
  style: ResponseStyle;
}

export interface ResponseStyle {
  brevity: 'minimal' | 'concise' | 'balanced' | 'detailed';
  tone: 'playful' | 'serious' | 'empathic' | 'direct' | 'adaptive';
  engagement: 'questioning' | 'reflective' | 'supportive' | 'challenging';
}

/**
 * Industry standards and best practices for conversational AI
 * Based on research from:
 * - Carl Rogers' Person-Centered Therapy
 * - Irvin Yalom's Existential Psychotherapy  
 * - Modern trauma-informed care practices
 * - Voice assistant UX patterns (Apple, Google)
 * - Counseling communication frameworks
 * - DBT (Dialectical Behavior Therapy) validation techniques
 */
export const RESPONSE_STANDARDS = {
  // UNLEASHED: Token limits expanded for complete insights (1 token ≈ 0.75 words)
  greeting: 200,        // ~150 words, allowing for warm connection
  acknowledgment: 400,  // ~300 words, space for full validation
  question: 350,        // ~260 words, room for thoughtful exploration
  emotional: 800,       // ~600 words, complete emotional processing
  exploration: 1200,    // ~900 words, deep insights and connections
  complex: 2000,        // ~1500 words, full philosophical/spiritual insights

  // Default for most interactions - unleashed for complete thoughts
  default: 1000         // ~750 words, allowing natural flow of consciousness
};

/**
 * Analyze user input to determine appropriate response length
 */
export function analyzeInputContext(input: string): {
  suggestedTokens: number;
  contextType: string;
  adaptations: string[];
} {
  const adaptations: string[] = [];
  let contextType = 'default';
  let suggestedTokens = RESPONSE_STANDARDS.default;
  
  // Analyze input characteristics
  const wordCount = input.split(' ').length;
  const hasQuestion = input.includes('?');
  const isGreeting = /^(hi|hey|hello|good morning|good evening)/i.test(input);
  const isEmotional = /feel|hurt|sad|angry|happy|excited|worried|anxious|scared|lonely|afraid/i.test(input);
  const isCrisis = /suicide|kill myself|end it|die|hopeless|can't go on/i.test(input);
  const isPhilosophical = /meaning|purpose|why|existence|reality|consciousness/i.test(input);
  const isShort = wordCount < 5;
  const isLong = wordCount > 30;
  
  // Determine context and response length
  if (isCrisis) {
    contextType = 'crisis';
    suggestedTokens = RESPONSE_STANDARDS.emotional;
    adaptations.push('immediate_support', 'validate_feelings', 'offer_resources');
  } else if (isGreeting) {
    contextType = 'greeting';
    suggestedTokens = RESPONSE_STANDARDS.greeting;
    adaptations.push('warm', 'brief', 'inviting');
  } else if (isEmotional) {
    contextType = 'emotional';
    suggestedTokens = RESPONSE_STANDARDS.emotional;
    adaptations.push('empathic', 'validating', 'gentle');
  } else if (isPhilosophical) {
    contextType = 'philosophical';
    suggestedTokens = RESPONSE_STANDARDS.complex;
    adaptations.push('thoughtful', 'open-ended', 'exploratory');
  } else if (hasQuestion && isShort) {
    contextType = 'brief_question';
    suggestedTokens = RESPONSE_STANDARDS.question;
    adaptations.push('direct', 'clear', 'concise');
  } else if (isLong) {
    contextType = 'detailed_share';
    suggestedTokens = RESPONSE_STANDARDS.exploration;
    adaptations.push('reflective', 'acknowledging', 'curious');
  } else if (isShort) {
    contextType = 'brief_input';
    suggestedTokens = RESPONSE_STANDARDS.acknowledgment;
    adaptations.push('matching_brevity', 'open');
  }
  
  // Conversation flow adaptations
  if (hasQuestion) {
    adaptations.push('answer_first_then_explore');
  }
  
  return {
    suggestedTokens,
    contextType,
    adaptations
  };
}

/**
 * Response tone calibration based on emotional indicators
 */
export function calibrateTone(input: string): ResponseStyle['tone'] {
  const lowerInput = input.toLowerCase();
  
  if (/\b(fun|funny|lol|haha|joke)\b/.test(lowerInput)) {
    return 'playful';
  }
  if (/\b(hurt|pain|sad|depressed|anxious|scared)\b/.test(lowerInput)) {
    return 'empathic';
  }
  if (/\b(explain|how|why|what|understand)\b/.test(lowerInput)) {
    return 'direct';
  }
  if (/\b(serious|important|urgent|need)\b/.test(lowerInput)) {
    return 'serious';
  }
  
  return 'adaptive';
}

/**
 * Best practices for therapeutic conversational AI
 * Based on Carl Rogers' Person-Centered Therapy & Modern Counseling Frameworks
 */
export const CONVERSATION_PRINCIPLES = {
  // Core principles from counseling psychology
  unconditionalPositiveRegard: true,  // Accept without judgment
  activeListening: true,               // Fully present attention
  nonJudgmental: true,                 // No evaluation or criticism
  clientCentered: true,                // User's needs drive conversation
  genuineness: true,                   // Authentic, not performative
  
  // Disarming friend qualities
  naturalEase: true,                   // Comfortable like old friends
  gentleHumor: true,                   // Lightness without deflection
  understatedWisdom: true,             // Insight without preaching
  expansivePresence: true,             // Spacious, not crowding
  trustworthyAlly: true,               // Reliable without dependency
  
  // Response patterns
  mirrorEnergyLevel: true,             // Match user's energy
  validateBeforeExploring: true,       // Acknowledge feelings first
  oneThoughtPerResponse: true,         // Focus on single ideas
  inviteElaboration: true,             // Use open-ended questions
  allowSilence: true,                  // Comfortable with pauses
  
  // Avoid patterns (therapy clichés)
  avoidTherapySpeak: true,            // No clinical jargon
  avoidAdviceGiving: true,            // Unless directly asked
  avoidAssumptions: true,             // Stay curious
  avoidOverExplaining: true,          // Keep it simple
  avoidRapidFireQuestions: true,      // One question at a time
  avoidToxicPositivity: true,         // No forced optimism
  avoidPlatitudes: true,              // No empty reassurances
};

/**
 * Therapy clichés to avoid - mapped to natural alternatives
 */
export const LANGUAGE_ALTERNATIVES = {
  // Instead of therapy-speak, use friend-speak
  "How does that make you feel?": ["What's that like for you?", "How's that sitting with you?"],
  "I hear you saying...": ["So...", "Sounds like..."],
  "That must be difficult": ["That sounds tough", "That's a lot"],
  "Thank you for sharing": ["I appreciate you telling me", "I'm glad you told me"],
  "Let's unpack that": ["Tell me more", "What else?"],
  "What I'm hearing is...": ["So you're saying...", "It sounds like..."],
  "How are you coping?": ["How are you doing with all this?", "How are you managing?"],
  "That's valid": ["That makes sense", "I get it"],
  "Let's explore that": ["Say more about that", "What's that about?"],
  "Can you elaborate?": ["Tell me more", "Go on"],
};