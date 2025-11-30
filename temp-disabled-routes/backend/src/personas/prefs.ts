/**
 * Worldview-aware preference system for Maya
 * Adapts to user's worldview while keeping clarity and care
 */

export type Worldview = 'grounded' | 'balanced' | 'metaphysical';

export interface PersonaPrefs {
  worldview: Worldview;              // User's metaphysical orientation
  metaphysics_confidence?: number;   // 0..1 learned confidence in metaphysical language
  formality?: 'plain' | 'warm' | 'poetic'; // Communication style
  concreteness_level?: number;       // 0..1 how concrete vs abstract to be
  max_words?: number;               // Response length preference
  voice_enabled?: boolean;          // Voice synthesis preference
  
  // Onboarding and relationship preferences
  sessionCount?: number;            // Number of sessions with this user
  trustLevel?: number;              // 0..1 user's comfort level with the Oracle
  challengeComfort?: number;        // 0..1 user's comfort with being challenged
  humorAppreciation?: number;       // 0..1 user's appreciation for humor
  onboardingTone?: 'hesitant' | 'curious' | 'enthusiastic' | 'neutral'; // First impression
}

export const DEFAULT_PREFS: PersonaPrefs = {
  worldview: 'balanced',
  metaphysics_confidence: 0.3,
  formality: 'warm', 
  concreteness_level: 0.7,
  max_words: 130,
  voice_enabled: true,
  
  // Default relationship metrics
  sessionCount: 0,
  trustLevel: 0.3,
  challengeComfort: 0.2,
  humorAppreciation: 0.3,
  onboardingTone: 'neutral'
};

/**
 * Worldview detector - nudges default based on user language patterns
 */
export function detectWorldview(sample: string): Worldview | null {
  const t = sample.toLowerCase();
  
  // Metaphysical vocabulary
  const metaphysicalTerms = [
    'akashic', '5d', 'vibration', 'manifest', 'chakra', 'shadow work', 
    'synchronicity', 'astrology', 'mercury retrograde', 'oracle deck',
    'light codes', 'portal', 'downloads', 'ascension', 'divine feminine',
    'sacred masculine', 'twin flame', 'soul purpose', 'higher self',
    'spirit guides', 'past life', 'karma', 'dharma', 'awakening',
    'consciousness expansion', 'energy healing', 'crystal', 'sage',
    'moon phase', 'tarot', 'numerology', 'aura', 'third eye'
  ];
  
  // Grounded/scientific vocabulary  
  const groundedTerms = [
    'evidence', 'baseline', 'metric', 'hypothesis', 'protocol', 'study',
    'pilot', 'iterate', 'postmortem', 'data', 'research', 'analysis',
    'objective', 'measurable', 'quantify', 'validate', 'test',
    'scientific', 'rational', 'logical', 'empirical', 'systematic',
    'methodology', 'statistical', 'correlation', 'causation'
  ];
  
  // Count matches
  const metaphysicalMatches = metaphysicalTerms.filter(term => 
    new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'i').test(t)
  ).length;
  
  const groundedMatches = groundedTerms.filter(term =>
    new RegExp(`\\b${term}\\b`, 'i').test(t)
  ).length;
  
  // Decision thresholds
  if (metaphysicalMatches >= 2 && metaphysicalMatches > groundedMatches) {
    return 'metaphysical';
  }
  
  if (groundedMatches >= 2 && groundedMatches > metaphysicalMatches) {
    return 'grounded';  
  }
  
  return null; // Keep current worldview
}

/**
 * Adapt preferences gradually based on worldview signals
 */
export function adaptPrefs(
  currentPrefs: PersonaPrefs, 
  worldviewSignal: Worldview | null
): PersonaPrefs {
  if (!worldviewSignal) return currentPrefs;
  
  const delta = worldviewSignal === 'metaphysical' ? +0.15 : -0.15;
  const newConfidence = Math.min(1, Math.max(0, 
    (currentPrefs.metaphysics_confidence ?? 0.3) + delta
  ));
  
  // Update worldview based on confidence level
  const newWorldview: Worldview = 
    newConfidence > 0.66 ? 'metaphysical' : 
    newConfidence < 0.33 ? 'grounded' : 'balanced';
  
  return {
    ...currentPrefs,
    metaphysics_confidence: newConfidence,
    worldview: newWorldview
  };
}

/**
 * Get vocabulary policy based on worldview
 */
export function getVocabularyPolicy(worldview: Worldview) {
  return {
    allowMetaphysical: worldview === 'metaphysical',
    preferConcrete: worldview === 'grounded',
    bannedTerms: worldview === 'metaphysical' ? 
      [] : // Allow all metaphysical terms
      ['ascension', '5d', 'light codes', 'portal downloads'], // Ban only extreme terms
    encouragedTerms: worldview === 'grounded' ? 
      ['evidence', 'research', 'practice', 'method'] :
      worldview === 'metaphysical' ?
      ['intuition', 'sacred', 'wisdom', 'consciousness'] :
      ['understanding', 'insight', 'awareness', 'growth'] // balanced
  };
}

/**
 * Get formality adjustments for different worldviews
 */
export function getFormalityAdjustments(formality: PersonaPrefs['formality']) {
  const adjustments = {
    plain: {
      greeting: "Let's look at this.",
      transition: "Here's what I see:",
      closing: "What's your next step?"
    },
    warm: {
      greeting: "I hear you.",
      transition: "Here's what comes up for me:",
      closing: "What feels right to you now?"
    },
    poetic: {
      greeting: "Your words find me.",
      transition: "What emerges is this:",  
      closing: "What wants to unfold through you?"
    }
  };
  
  return adjustments[formality || 'warm'];
}

/**
 * Validate preferences object
 */
export function validatePrefs(prefs: Partial<PersonaPrefs>): PersonaPrefs {
  return {
    worldview: prefs.worldview || DEFAULT_PREFS.worldview,
    metaphysics_confidence: Math.min(1, Math.max(0, 
      prefs.metaphysics_confidence ?? DEFAULT_PREFS.metaphysics_confidence!
    )),
    formality: prefs.formality || DEFAULT_PREFS.formality,
    concreteness_level: Math.min(1, Math.max(0,
      prefs.concreteness_level ?? DEFAULT_PREFS.concreteness_level!
    )),
    max_words: Math.min(300, Math.max(50,
      prefs.max_words ?? DEFAULT_PREFS.max_words!
    )),
    voice_enabled: prefs.voice_enabled ?? DEFAULT_PREFS.voice_enabled,
    
    // Validate relationship metrics
    sessionCount: Math.max(0, prefs.sessionCount ?? DEFAULT_PREFS.sessionCount!),
    trustLevel: Math.min(1, Math.max(0, 
      prefs.trustLevel ?? DEFAULT_PREFS.trustLevel!
    )),
    challengeComfort: Math.min(1, Math.max(0,
      prefs.challengeComfort ?? DEFAULT_PREFS.challengeComfort!
    )),
    humorAppreciation: Math.min(1, Math.max(0,
      prefs.humorAppreciation ?? DEFAULT_PREFS.humorAppreciation!
    )),
    onboardingTone: prefs.onboardingTone || DEFAULT_PREFS.onboardingTone
  };
}