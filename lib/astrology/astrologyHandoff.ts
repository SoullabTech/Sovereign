/**
 * Astrology Handoff — Structured Transition Payload
 *
 * When MAIA transitions a conversation into the Cosmic Blueprint,
 * this module detects that intent and produces a structured FieldContext
 * the frontend renders as a real threshold card — not a vague invitation.
 *
 * Design principles:
 * - No extra API call (pure text analysis)
 * - Astrology is not receiving data — it is receiving a state of being
 * - Detection guards keep astrology sacred, not frequent
 * - "state → lens → deepening → return" not "chat → feature → page"
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A living state of being carried from the conversation into the astrology screen.
 * Richer than a context object — it captures what the person is actually in.
 */
export interface FieldContext {
  origin: 'maia_conversation';
  /** Comma-separated emotional signature, e.g. "grief, protective instinct, collective weight" */
  emotionalSignature: string;
  /** The live inquiry being carried forward */
  inquiry: string;
  /** Body-sense or somatic tone if present, e.g. "pressure in chest, flooding" */
  somaticTone?: string;
  /** Symbolic frame if present, e.g. "witness vs absorber, burden vs boundary" */
  symbolicFrame?: string;
  /** Suggested astrological lenses for this field state */
  suggestedLens: string[];
  timestamp: number;
  sessionId?: string;
}

export interface AstrologyHandoff {
  /** Destination page */
  destination: '/journey' | '/astrology';
  /** Why astrology is relevant to this exact moment */
  reason: string;
  /** Structured field state for the astrology screen */
  fieldContext: FieldContext;
  /** Copy for the threshold card body in chat */
  cardBody: string;
}

// ---------------------------------------------------------------------------
// Keyword detection
// ---------------------------------------------------------------------------

const HANDOFF_SIGNALS = [
  /cosmic blueprint/i,
  /birth chart/i,
  /your chart/i,
  /personal transits/i,
  /natal chart/i,
  /look at your/i,
  /move into your/i,
  /step into your/i,
  /through your blueprint/i,
  /through your chart/i,
];

const EMOTIONAL_KEYWORDS: Record<string, string[]> = {
  grief: ['grief', 'grieving', 'loss', 'lost', 'mourning', 'sorrow', 'heartbreak', 'heartbroken', 'sadness', 'sad'],
  burden: ['burden', 'heavy', 'weight', 'carrying', 'overwhelmed', 'crushed', 'exhausted', 'bearing', 'shouldering'],
  collective: ['collective', 'world', 'everyone', 'humanity', 'field', 'collective dread', 'collective weight', 'wider field', 'external'],
  anxiety: ['anxiety', 'anxious', 'worried', 'dread', 'fear', 'scared', 'terrified', 'panic', 'overwhelm', 'apprehensive'],
  anger: ['anger', 'angry', 'rage', 'furious', 'frustrated', 'resentment', 'indignant'],
  confusion: ['confused', 'lost', 'unclear', 'unsure', 'uncertain', 'disoriented', 'foggy'],
  transition: ['transition', 'change', 'ending', 'beginning', 'threshold', 'turning point', 'crossroads'],
  isolation: ['alone', 'lonely', 'isolated', 'disconnected', 'unseen', 'invisible', 'unheard'],
  purpose: ['purpose', 'meaning', 'direction', 'calling', 'path', 'mission', 'vocation'],
  nervous_system: ['nervous system', 'body', 'somatic', 'physical', 'tight', 'tense', 'numb', 'pressure', 'flooding'],
};

const SOMATIC_KEYWORDS = ['chest', 'body', 'tight', 'tense', 'numb', 'flooding', 'pressure', 'constricted', 'heavy', 'weight'];
const SYMBOLIC_KEYWORDS = ['witness', 'absorb', 'boundary', 'burden', 'hold', 'carry', 'contain', 'boundary', 'permeable'];

const LENS_MAP: Record<string, string[]> = {
  grief: ['Moon', '4th house', '8th house', '12th house', 'Chiron'],
  burden: ['Saturn', '10th house', '6th house', 'South Node'],
  collective: ['Pluto', 'Neptune', 'outer planets', '12th house'],
  anxiety: ['Mercury', 'Moon', '12th house', 'Pluto', 'Saturn'],
  anger: ['Mars', 'Pluto', '1st house', '8th house'],
  confusion: ['Neptune', '12th house', 'Mercury retrograde'],
  transition: ['Saturn', 'Pluto', 'North Node', 'Progressed Moon'],
  isolation: ['Moon', '4th house', '12th house', 'Saturn'],
  purpose: ['Sun', 'North Node', '10th house', 'Jupiter', 'MC'],
  nervous_system: ['Moon', 'Mercury', '6th house', 'Saturn'],
};

// ---------------------------------------------------------------------------
// Detection guard — keeps astrology sacred, not frequent
// ---------------------------------------------------------------------------

/**
 * Emotional intensity score 0–10.
 * Returns null if the conversation shows no personal emotional charge.
 */
function measureEmotionalIntensity(recentMessages: string[]): number {
  const combined = recentMessages.join(' ').toLowerCase();
  let score = 0;

  for (const keywords of Object.values(EMOTIONAL_KEYWORDS)) {
    for (const kw of keywords) {
      if (combined.includes(kw)) score += 1;
    }
  }

  // Boost if personal pronouns indicate first-person experience
  const personalCount = (combined.match(/\b(i am|i feel|i'm|i've|i was|my body|i notice)\b/g) || []).length;
  score += personalCount;

  return Math.min(score, 10);
}

function hasPersonalTimingInquiry(messages: string[]): boolean {
  const combined = messages.join(' ').toLowerCase();
  const personalTimingSignals = [
    'my own', 'personal', 'mine', 'my chart', 'my timing', 'what is mine',
    'my pattern', 'my experience', 'for me specifically', 'touches me',
    'landing on me', 'my nervous system', 'my grief', 'my life',
  ];
  return personalTimingSignals.some(s => combined.includes(s));
}

// ---------------------------------------------------------------------------
// Context extraction
// ---------------------------------------------------------------------------

function extractEmotionalThemes(userMessages: string[]): string[] {
  const combined = userMessages.join(' ').toLowerCase();
  const found: string[] = [];

  for (const [theme, keywords] of Object.entries(EMOTIONAL_KEYWORDS)) {
    if (keywords.some(k => combined.includes(k))) {
      found.push(theme);
    }
  }

  return found.length > 0 ? found : ['emotional weight'];
}

function extractSomaticTone(userMessages: string[]): string | undefined {
  const combined = userMessages.join(' ').toLowerCase();
  const found = SOMATIC_KEYWORDS.filter(k => combined.includes(k));
  return found.length > 0 ? found.slice(0, 3).join(', ') : undefined;
}

function extractSymbolicFrame(userMessages: string[]): string | undefined {
  const combined = userMessages.join(' ').toLowerCase();
  const found = SYMBOLIC_KEYWORDS.filter(k => combined.includes(k));
  if (found.length === 0) return undefined;

  // Common frame pairs
  if (found.includes('witness') || found.includes('absorb')) {
    return 'witness vs absorber';
  }
  if (found.includes('boundary') || found.includes('permeable')) {
    return 'burden vs boundary';
  }
  if (found.includes('carry') || found.includes('hold') || found.includes('contain')) {
    return 'what is mine to hold vs what belongs to the field';
  }
  return undefined;
}

function buildSuggestedLens(themes: string[]): string[] {
  const lenses = new Set<string>();
  for (const theme of themes) {
    (LENS_MAP[theme] || []).forEach(l => lenses.add(l));
  }
  lenses.add('Ascendant'); // always include angles
  return Array.from(lenses).slice(0, 6);
}

function buildInquiry(themes: string[], symbolicFrame?: string): string {
  if (symbolicFrame) {
    return `What does my chart reveal about ${symbolicFrame}?`;
  }
  if (themes.includes('collective') && (themes.includes('grief') || themes.includes('burden'))) {
    return 'What is mine to carry, and what belongs to the collective field?';
  }
  if (themes.includes('burden') || themes.includes('grief')) {
    return 'Which personal transits are pressing on my nervous system and emotional field right now?';
  }
  if (themes.includes('transition')) {
    return 'What does my chart reveal about this threshold I am crossing?';
  }
  if (themes.includes('purpose')) {
    return 'What is my chart showing about this moment of direction or calling?';
  }
  return 'Which current transits are shaping what I am moving through right now?';
}

function buildEmotionalSignature(themes: string[]): string {
  return themes
    .slice(0, 4)
    .map(t => t.replace(/_/g, ' '))
    .join(', ');
}

function buildCardBody(themes: string[], somaticTone?: string, symbolicFrame?: string): string {
  const themeLabel = themes.slice(0, 3).map(t => t.replace(/_/g, ' ')).join(', ');

  if (symbolicFrame) {
    return `See which transits are shaping the question of ${symbolicFrame} — and what your chart says about what is personally yours right now.`;
  }
  if (somaticTone) {
    return `See which current transits are pressing on your ${themeLabel} — including what is landing in your body — and what is yours to tend versus what belongs to the wider field.`;
  }
  if (themeLabel) {
    return `See which current transits are pressing on your ${themeLabel}, and sort what is personally yours from what you may be absorbing from the collective field.`;
  }
  return 'See which current transits are shaping what you are moving through right now, and what they ask of you.';
}

// ---------------------------------------------------------------------------
// Main detection function
// ---------------------------------------------------------------------------

/**
 * Detect whether a MAIA response is transitioning into astrology
 * and return a structured handoff payload if so.
 *
 * Returns null if:
 * - The response contains no astrology handoff signals
 * - Emotional intensity is too low (flat/practical conversation)
 * - No personal timing inquiry is present
 */
export function detectAstrologyHandoff(
  oracleResponse: string,
  conversationHistory: Array<{ role: string; content?: string; text?: string }>,
  sessionId?: string,
): AstrologyHandoff | null {
  // Stage 1: Signal check
  const isHandoff = HANDOFF_SIGNALS.some(re => re.test(oracleResponse));
  if (!isHandoff) return null;

  // Stage 2: Guard — keep astrology sacred, not frequent
  const recentUserMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content || m.text || '');

  const emotionalIntensity = measureEmotionalIntensity(recentUserMessages);
  const hasPersonalInquiry = hasPersonalTimingInquiry(recentUserMessages);

  // Do not trigger on flat/practical conversations
  if (emotionalIntensity < 2 && !hasPersonalInquiry) return null;

  // Stage 3: Build rich field context
  const emotionalThemes = extractEmotionalThemes(recentUserMessages);
  const somaticTone = extractSomaticTone(recentUserMessages);
  const symbolicFrame = extractSymbolicFrame(recentUserMessages);
  const suggestedLens = buildSuggestedLens(emotionalThemes);
  const inquiry = buildInquiry(emotionalThemes, symbolicFrame);
  const emotionalSignature = buildEmotionalSignature(emotionalThemes);
  const cardBody = buildCardBody(emotionalThemes, somaticTone, symbolicFrame);

  const fieldContext: FieldContext = {
    origin: 'maia_conversation',
    emotionalSignature,
    inquiry,
    somaticTone,
    symbolicFrame,
    suggestedLens,
    timestamp: Date.now(),
    sessionId,
  };

  const reason =
    'There may be collective weather here, but some of this is likely touching your own pattern precisely. To read that accurately, we should move into your Cosmic Blueprint rather than guessing from the general sky.';

  return {
    destination: '/journey',
    reason,
    fieldContext,
    cardBody,
  };
}
