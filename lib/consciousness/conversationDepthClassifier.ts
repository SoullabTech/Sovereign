/**
 * Conversation Depth Classifier
 *
 * MAIA meets the member at their present level of awareness and only invokes
 * deeper processing when the conversation actually asks for it.
 *
 * Three execution tiers map to the 7 awareness levels:
 *
 *   Tier A — Presence / Threshold (levels 1–2)
 *     Simple contact, settling, reassurance, basic orientation.
 *     No deep model. Threshold engine or minimal Claude pass.
 *     Prosody carries more weight than cognition.
 *
 *   Tier B — Conversational Core (levels 3–5)
 *     Ordinary guidance, light reflection, relational continuity.
 *     Standard Claude path with moderate context.
 *
 *   Tier C — Deep Process (levels 6–7)
 *     Shadow work, dream material, threshold experiences, grief, rupture,
 *     symbolic emergence, transformational turns.
 *     Full Claude with enriched memory and symbolic layers.
 *
 * The classifier uses linguistic, emotional, symbolic, and relational signals.
 * It is intentionally lightweight — a scoring heuristic, not an LLM call.
 * Speed matters: this runs BEFORE any model call.
 *
 * SOVEREIGNTY: The classifier informs, never commands.
 * MAIA can always be pushed to a higher tier by posture, activation, or explicit
 * override. The tier score is a starting position, not a ceiling.
 */

export type ConversationTier = 'threshold' | 'core' | 'deep';
export type AwarenessLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DepthClassification {
  /** Execution tier: which model path to invoke */
  tier: ConversationTier;
  /** Estimated awareness level (1–7) within the tier */
  awarenessLevel: AwarenessLevel;
  /** Score 0–1 — higher = more toward deep process */
  depthScore: number;
  /** What signals drove the classification */
  signals: string[];
}

export interface DepthClassifierContext {
  /** Relational maturation stage (1=orientation, 2=capacity, 3=autonomy, 4=seasonal) */
  relationalPhase?: number;
  /** Spiralogic phase 1–12 */
  spiralPhase?: number;
  /** Activation 0–1 from relational stack smoother */
  activation?: number;
  /** Number of turns in current session */
  conversationLength?: number;
  /** Current posture from guidance stack */
  posture?: string;
  /** Current voice mode */
  mode?: string;
}

// ─── SIGNAL LEXICONS ─────────────────────────────────────────────────────────

/**
 * Emotional intensity signals — rupture, grief, fear, urgency, vulnerability.
 * These pull strongly toward Tier C.
 */
const DEEP_EMOTIONAL_SIGNALS = [
  'afraid', 'terrified', 'terror', 'scared', 'panic', 'panic', 'devastated',
  'destroyed', 'breaking', 'broken', 'shattered', 'grief', 'grieving',
  'mourning', 'loss', 'lost everything', 'can\'t go on', 'hopeless',
  'suicidal', 'want to die', 'numb', 'dissociated', 'not real',
  'rage', 'furious', 'hatred', 'ashamed', 'humiliated', 'worthless',
  'trauma', 'traumatized', 'abuse', 'neglect', 'abandoned', 'rejected',
  'betrayed', 'violated', 'hurt deeply', 'falling apart', 'unraveling',
  'overwhelmed', 'can\'t breathe', 'suffocating',
];

/**
 * Symbolic / archetypal density signals — dream, shadow, ritual, myth.
 * These pull toward Tier C.
 */
const DEEP_SYMBOLIC_SIGNALS = [
  'dream', 'dreamed', 'dreaming', 'nightmare', 'vision', 'visioned',
  'shadow', 'the shadow', 'my shadow', 'dark side', 'the dark',
  'archetype', 'symbol', 'symbolic', 'metaphor', 'myth', 'mythic',
  'sacred', 'ritual', 'ceremony', 'initiation', 'threshold', 'liminal',
  'death', 'rebirth', 'transformation', 'transmutation', 'alchemy',
  'ancestor', 'lineage', 'blood memory', 'soul', 'spirit', 'divine',
  'god', 'goddess', 'the infinite', 'the void', 'eternity', 'the beyond',
  'unconscious', 'subconscious', 'deep self', 'true self', 'higher self',
  'calling', 'destiny', 'purpose', 'path', 'why am I here',
  'meaning', 'what does it mean', 'what is this showing me',
];

/**
 * Moderate depth signals — meaning-seeking, relational, reflective.
 * These suggest Tier B.
 */
const CORE_SIGNALS = [
  'help me understand', 'what do you think', 'am i', 'should i',
  'struggling with', 'working through', 'trying to figure out',
  'relationship', 'partner', 'family', 'mother', 'father', 'friend',
  'feeling', 'emotion', 'mood', 'thought', 'pattern', 'habit',
  'change', 'growth', 'better', 'different', 'why do i', 'how do i',
  'stuck', 'challenge', 'difficult', 'hard', 'problem', 'issue',
  'worry', 'anxious', 'nervous', 'uncertain', 'confused',
  'reflect', 'consider', 'wonder', 'curious about', 'exploring',
];

/**
 * Simple / threshold signals — contact, settling, basic orientation.
 * These suggest Tier A.
 */
const THRESHOLD_SIGNALS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
  'how are you', 'what can you do', 'who are you', 'what is maia',
  'yes', 'no', 'okay', 'ok', 'sure', 'thanks', 'thank you',
  'tell me more', 'continue', 'go on', 'and', 'hmm', 'mm',
  'interesting', 'i see', 'got it', 'i understand',
  'can you help', 'can you', 'do you', 'are you',
];

// ─── CLASSIFIER ──────────────────────────────────────────────────────────────

/**
 * Classify the depth of a conversational input.
 *
 * This is intentionally heuristic and fast — no LLM, no network calls.
 * The relational context (activation, phase, posture) is equally important
 * as the text content, because the same words land differently depending on
 * where the member is in their arc.
 */
export function classifyConversationDepth(
  input: string,
  context: DepthClassifierContext = {}
): DepthClassification {
  const signals: string[] = [];
  let score = 0; // 0 = threshold, 1 = deep

  const lower = input.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  const charCount = lower.length;

  // ── LENGTH / COMPLEXITY ─────────────────────────────────────────────────
  // Very short inputs → threshold; longer, denser inputs → deeper
  if (wordCount <= 3) {
    score -= 0.3;
    signals.push('very_short_input');
  } else if (wordCount <= 8) {
    score -= 0.1;
    signals.push('short_input');
  } else if (wordCount >= 40) {
    score += 0.15;
    signals.push('long_input');
  }

  // Clause density: commas, semicolons, conjunctions suggest complexity
  const clauseMarkers = (lower.match(/[,;]|(\bbut\b|\bbecause\b|\balthough\b|\bwhereas\b|\bhowever\b)/g) || []).length;
  if (clauseMarkers >= 3) {
    score += 0.1;
    signals.push('high_clause_density');
  }

  // Explicit interpretive ask ("what does this mean", "why do i feel", "what is this")
  const interpretiveAsk = /what does (it|this|that) mean|why do i (feel|keep|always|never)|what is (this|happening|going on)|what am i (doing|feeling|missing|avoiding)/.test(lower);
  if (interpretiveAsk) {
    score += 0.15;
    signals.push('interpretive_ask');
  }

  // ── EMOTIONAL INTENSITY ─────────────────────────────────────────────────
  let deepEmotionalHits = 0;
  for (const word of DEEP_EMOTIONAL_SIGNALS) {
    if (lower.includes(word)) {
      deepEmotionalHits++;
      signals.push(`deep_emotion:${word}`);
    }
    if (deepEmotionalHits >= 3) break; // cap tracking, score continues
  }
  if (deepEmotionalHits >= 1) score += 0.25 * Math.min(deepEmotionalHits, 3) / 3;

  // ── SYMBOLIC DENSITY ────────────────────────────────────────────────────
  let deepSymbolHits = 0;
  for (const word of DEEP_SYMBOLIC_SIGNALS) {
    if (lower.includes(word)) {
      deepSymbolHits++;
      signals.push(`deep_symbol:${word}`);
    }
    if (deepSymbolHits >= 3) break;
  }
  if (deepSymbolHits >= 1) score += 0.2 * Math.min(deepSymbolHits, 3) / 3;

  // ── CORE SIGNALS ────────────────────────────────────────────────────────
  let coreHits = 0;
  for (const word of CORE_SIGNALS) {
    if (lower.includes(word)) coreHits++;
    if (coreHits >= 3) break;
  }
  if (coreHits >= 1) score += 0.1;

  // ── THRESHOLD SIGNALS ───────────────────────────────────────────────────
  // If the ENTIRE input is just a threshold word, pull hard toward threshold
  const isBareThreshold = THRESHOLD_SIGNALS.some(w => lower === w || lower === w + '.' || lower === w + '?');
  if (isBareThreshold) {
    score -= 0.4;
    signals.push('bare_threshold_phrase');
  }

  // ── RELATIONAL CONTEXT ──────────────────────────────────────────────────
  const { relationalPhase, spiralPhase, activation, conversationLength, posture } = context;

  // Phase 1 (orientation) → bias toward lighter unless strong depth signals
  if (relationalPhase === 1) {
    score -= 0.2;
    signals.push('orientation_phase');
  } else if (relationalPhase === 3 || relationalPhase === 4) {
    // Autonomy/seasonal return — member can handle depth
    score += 0.05;
  }

  // Activation level
  if (activation !== undefined) {
    if (activation >= 0.75) {
      score += 0.15;
      signals.push('high_activation');
    } else if (activation < 0.2) {
      score -= 0.1;
      signals.push('low_activation');
    }
  }

  // Deep postures in the guidance stack signal the system already senses depth
  if (posture && (posture.includes('HOLD') || posture.includes('WITNESS'))) {
    score += 0.15;
    signals.push(`depth_posture:${posture}`);
  }

  // Opening turns are typically lighter
  if (conversationLength !== undefined && conversationLength <= 2) {
    score -= 0.1;
    signals.push('opening_turn');
  }

  // ── CLAMP + TIER RESOLUTION ─────────────────────────────────────────────
  score = Math.max(0, Math.min(1, score));

  let tier: ConversationTier;
  let awarenessLevel: AwarenessLevel;

  if (score < 0.28) {
    tier = 'threshold';
    awarenessLevel = score < 0.14 ? 1 : 2;
  } else if (score < 0.62) {
    tier = 'core';
    if (score < 0.38) awarenessLevel = 3;
    else if (score < 0.50) awarenessLevel = 4;
    else awarenessLevel = 5;
  } else {
    tier = 'deep';
    awarenessLevel = score < 0.82 ? 6 : 7;
  }

  return { tier, awarenessLevel, depthScore: score, signals };
}

/**
 * Suggest a brevity preference based on tier and awareness level.
 * Used to align token budget with depth — Tier A gets brief, Tier C gets expansive.
 */
export function tierToBrevity(
  tier: ConversationTier,
  currentBrevity?: 'brief' | 'moderate' | 'expansive'
): 'brief' | 'moderate' | 'expansive' {
  // Never pull someone away from 'brief' if the relational stack already chose it
  if (currentBrevity === 'brief' && tier !== 'deep') return 'brief';

  switch (tier) {
    case 'threshold': return 'brief';
    case 'core':      return currentBrevity ?? 'moderate';
    case 'deep':      return currentBrevity === 'brief' ? 'moderate' : (currentBrevity ?? 'moderate');
  }
}
