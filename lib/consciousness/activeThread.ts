/**
 * Active Thread Derivation
 *
 * Deterministically computes a one-sentence description of what the conversation
 * is actually tracking right now. No LLM calls. Zero latency overhead.
 *
 * Used to inject high-salience thread context into the system prompt so MAIA
 * can advance the frame rather than re-ask or drift.
 */

export type ActiveThreadResult = {
  /** One sentence describing the active thread */
  activeThread: string;
  /** 0–1 confidence in the derivation */
  confidence: number;
  /** What signals drove the derivation */
  sourceSignals: string[];
  detectedTopic?: string;
  detectedConcern?: string;
  detectedUserAim?: string;
};

// Concern language: user is worried, stuck, or the issue feels important
const CONCERN_WORDS = [
  'worried', 'concern', 'trust', 'failing', 'not working', 'broken',
  'embarrassed', 'frustrated', 'confused', 'lost', 'struggling',
  'anxious', 'afraid', 'fear', 'overwhelmed', 'stuck', 'problem',
  'issue', 'trouble', 'difficult', 'hard', 'can\'t', 'won\'t',
];

// Aim language: user is stating what they're trying to accomplish
const AIM_PATTERNS = [
  /\b(?:trying to|need to|want to|hoping to|working on|goal is|aim is)\b/i,
  /\bthe real issue is\b/i,
  /\bwhat I(?:'m| am) looking for\b/i,
  /\bwhat I need\b/i,
  /\bI want\b/i,
];

// Words to skip when extracting topics (stopwords + MAIA-specific noise)
const SKIP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
  'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these',
  'those', 'what', 'which', 'who', 'how', 'when', 'where', 'why', 'just',
  'also', 'so', 'then', 'than', 'not', 'no', 'yes', 'if', 'can', 'get',
  'like', 'think', 'know', 'see', 'feel', 'maia', 'conversation', 'say',
  'said', 'mean', 'meant', 'really', 'very', 'much', 'more', 'most',
  'some', 'any', 'all', 'one', 'two', 'three', 'time', 'make',
]);

/** Extract candidate topic nouns from a string */
function extractNouns(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !SKIP_WORDS.has(w));
}

/** Count noun frequency across multiple text strings */
function nounFrequency(texts: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const text of texts) {
    for (const noun of extractNouns(text)) {
      freq.set(noun, (freq.get(noun) ?? 0) + 1);
    }
  }
  return freq;
}

/** Find the most repeated noun in recent turns (must appear 2+ times) */
function findDominantTopic(turns: Array<{ role: string; content: string }>, userMessage: string): string | undefined {
  const userTexts = [
    ...turns.filter(t => t.role === 'user').map(t => t.content),
    userMessage,
  ];
  if (userTexts.length < 2) return undefined;

  const freq = nounFrequency(userTexts);
  let best: string | undefined;
  let bestCount = 1; // must appear at least twice
  for (const [noun, count] of freq) {
    if (count > bestCount) {
      best = noun;
      bestCount = count;
    }
  }
  return best;
}

/** Detect the strongest concern phrase in a string */
function findConcern(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const word of CONCERN_WORDS) {
    if (lower.includes(word)) return word;
  }
  return undefined;
}

/** Extract the aim phrase from a string if present */
function findAim(text: string): string | undefined {
  for (const pattern of AIM_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Return the phrase and a few words after it for context
      const idx = text.toLowerCase().indexOf(match[0].toLowerCase());
      return text.slice(idx, idx + 60).trim();
    }
  }
  return undefined;
}

/**
 * Derive a one-sentence active thread from the last 3–5 turns plus the current message.
 *
 * Priority:
 *   1. User's current aim (explicit statement of intent)
 *   2. User's current concern (emotional/strategic center)
 *   3. Dominant repeated topic (structural)
 *   4. Fallback: paraphrase of current message
 */
export function deriveActiveThread(args: {
  recentTurns: Array<{ role: string; content: string }>;
  latestUserMessage: string;
  mode?: string;
}): ActiveThreadResult {
  const { recentTurns, latestUserMessage } = args;
  const last5 = recentTurns.slice(-5);
  const sourceSignals: string[] = [];

  // 1. Detect aim from current message (highest priority)
  const detectedUserAim = findAim(latestUserMessage);
  if (detectedUserAim) sourceSignals.push('aim_language');

  // 2. Detect concern from current message, then recent turns
  const allUserText = [
    ...last5.filter(t => t.role === 'user').map(t => t.content),
    latestUserMessage,
  ].join(' ');
  const detectedConcern = findConcern(latestUserMessage) ?? findConcern(allUserText);
  if (detectedConcern) sourceSignals.push('concern_language');

  // 3. Find dominant repeated topic across turns
  const detectedTopic = findDominantTopic(last5, latestUserMessage);
  if (detectedTopic) sourceSignals.push('repeated_noun');

  // Compose thread sentence
  let activeThread: string;
  let confidence: number;

  if (detectedUserAim) {
    // Most precise: user stated their aim
    activeThread = `The user is ${detectedUserAim}`;
    confidence = 0.85;
  } else if (detectedConcern && detectedTopic) {
    // Concern + topic: rich signal
    activeThread = `The user is concerned about ${detectedTopic} (${detectedConcern})`;
    confidence = 0.75;
  } else if (detectedConcern) {
    // Concern without clear topic
    activeThread = `The user is dealing with something that feels like ${detectedConcern}`;
    confidence = 0.60;
  } else if (detectedTopic) {
    // Topic without concern
    activeThread = `The thread is about ${detectedTopic}`;
    confidence = 0.55;
  } else {
    // Fallback: truncate current message
    const snippet = latestUserMessage.length > 80
      ? latestUserMessage.slice(0, 80).trim() + '...'
      : latestUserMessage;
    activeThread = `The user said: "${snippet}"`;
    confidence = 0.30;
    sourceSignals.push('fallback');
  }

  return {
    activeThread,
    confidence,
    sourceSignals,
    detectedTopic,
    detectedConcern,
    detectedUserAim,
  };
}

/** Build the prompt block injected into the system prompt */
export function buildActiveThreadBlock(
  thread: ActiveThreadResult,
  hasCorrectionSignal: boolean
): string {
  const lines: string[] = [
    '\n\nACTIVE THREAD',
    `Active thread: ${thread.activeThread}`,
    '',
    'RESPONSE DISCIPLINE',
    '- Connect to, deepen, or advance the active thread unless the user clearly changes topics.',
    '- Do not ask for information already provided in the recent conversation.',
    '- If the user already named the core issue, work with it directly instead of re-asking.',
  ];

  if (hasCorrectionSignal) {
    lines.push('');
    lines.push('CONVERSATION REPAIR SIGNAL');
    lines.push('The user believes you lost the thread or repeated something already answered.');
    lines.push('Briefly reconnect to what they already said. Do not defend yourself.');
    lines.push('Do not restart the conversation. Move directly back onto the active thread.');
  }

  return lines.join('\n');
}
