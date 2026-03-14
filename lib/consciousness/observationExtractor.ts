/**
 * lib/consciousness/observationExtractor.ts
 *
 * OS-native observation extraction from oracle turn output.
 *
 * Converts a completed oracle turn into candidate observations
 * ready for the accumulating hypothesis buffer.
 *
 * Design principles:
 *   - Heuristic and deterministic — no LLM call, no model variance
 *   - Conservative by default — emit only when signal is clear
 *   - Structured output — NormalizedObservation[] ready for hypothesisBuffer
 *   - Contradiction-aware — explicit corrections generate ContradictionSignal[]
 *   - original_language captured for audit; OS-normalized fields are operational
 *
 * Extraction criteria (only emit when one or more of these is present):
 *   1. Explicit self-description   ("I tend to...", "I'm someone who...", "I always...")
 *   2. Clear elemental activation  (strong element signal with matching content domain)
 *   3. Avoidance / deflection      ("but anyway", "never mind", topic shift mid-thought)
 *   4. Emotional register spike    (strong affective language in a coherent domain)
 *   5. Explicit correction         ("that's not right", "actually...", "no, I mean...")
 *      → generates ContradictionSignal, not evidence event
 *
 * Conservative threshold: if signal_strength < 0.40, the observation is dropped.
 * This prevents the buffer from filling with noise in early operation.
 */

import type {
  Element,
  EvidenceType,
  InterpretationType,
  NormalizedObservation,
  SpiralogicPhase,
  TargetStore,
  VoiceMode,
} from '@/lib/types/interpretive-ledger';

import { EVIDENCE_WEIGHTS, CONTRADICTION_WEIGHTS } from '@/lib/types/interpretive-ledger';

// ─── Input / output types ─────────────────────────────────────────────────────

export interface TurnContext {
  sessionId: string;
  memberId: string;
  userMessage: string;
  maiaResponse: string;
  currentElement: Element;
  currentPhase: SpiralogicPhase;
  currentMode: VoiceMode;
  conversationDepth: number;
}

/** Ready for hypothesisBuffer.enqueueObservation */
export type ExtractionResult = {
  observations: NormalizedObservation[];
  corrections: ContradictionSignal[];
};

/** Ready for hypothesisBuffer.enqueueContradiction (caller matches to hypothesis) */
export interface ContradictionSignal {
  sessionId: string;
  observation: string;
  context_domain: string;
  context_element: Element;
  source: 'user_correction' | 'explicit_statement' | 'behavioral_pattern';
  contradiction_weight: number;
  user_initiated: boolean;
  /** Candidate interpretation keywords to match against active hypotheses */
  target_keywords: string[];
}

// Minimum signal strength to emit an observation
const SIGNAL_FLOOR = 0.40;

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Extract candidate observations from a completed oracle turn.
 * Returns observations (evidence candidates) and corrections (contradiction signals).
 *
 * Conservative: only emits when one of the five criteria clearly fires.
 */
export function extractObservations(ctx: TurnContext): ExtractionResult {
  const observations: NormalizedObservation[] = [];
  const corrections: ContradictionSignal[] = [];

  const domain = classifyDomain(ctx.userMessage);

  // ── 1. Explicit corrections (highest priority — check first) ────────────────
  const correctionSignal = detectCorrection(ctx, domain);
  if (correctionSignal) {
    corrections.push(correctionSignal);
    // Corrections indicate a prior reading may be wrong — don't also emit an
    // evidence observation from the same turn to avoid double-counting.
    return { observations, corrections };
  }

  // ── 2. Explicit self-description ────────────────────────────────────────────
  const selfDesc = detectSelfDescription(ctx, domain);
  if (selfDesc) observations.push(selfDesc);

  // ── 3. Clear elemental activation ───────────────────────────────────────────
  // Only emit if activation is strong AND domain is identifiable
  if (!selfDesc) {
    const elemental = detectElementalActivation(ctx, domain);
    if (elemental) observations.push(elemental);
  }

  // ── 4. Avoidance / deflection ────────────────────────────────────────────────
  const avoidance = detectAvoidance(ctx, domain);
  if (avoidance && !selfDesc) observations.push(avoidance);

  // ── 5. Emotional register spike ──────────────────────────────────────────────
  // Only emit if no other signal already covers this turn
  if (observations.length === 0) {
    const emotional = detectEmotionalRegister(ctx, domain);
    if (emotional) observations.push(emotional);
  }

  // Apply signal floor: drop any observation below minimum strength
  const filtered = observations.filter(
    o => o.initial_evidence_event.signal_strength >= SIGNAL_FLOOR,
  );

  return { observations: filtered, corrections };
}

// ─── Detection functions ──────────────────────────────────────────────────────

/**
 * Detects explicit self-description:
 * "I tend to...", "I always...", "I'm someone who...", "I struggle with...", etc.
 */
function detectSelfDescription(
  ctx: TurnContext,
  domain: string,
): NormalizedObservation | null {
  const text = ctx.userMessage.toLowerCase();

  const patterns = [
    /\bi(?:'m| am) someone who\b/,
    /\bi tend to\b/,
    /\bi always\b/,
    /\bi never\b/,
    /\bi(?:'ve| have) always\b/,
    /\bi find (?:it )?(?:hard|difficult|impossible|easy) to\b/,
    /\bi struggle with\b/,
    /\bfor me,?\s+(?:it's|it is|i)\b/,
    /\bmy (?:pattern|tendency|habit|way) (?:is|of)\b/,
    /\bpeople (?:say|tell me) i\b/,
    /\bi (?:know|realize|notice) i\b/,
  ];

  const matched = patterns.find(p => p.test(text));
  if (!matched) return null;

  const excerpt = extractMatchExcerpt(ctx.userMessage, matched, 120);
  const signal  = scoreExplicitStatement(text);

  return buildObservation({
    ctx,
    domain,
    observation:            `Explicit self-description: "${excerpt}"`,
    candidateInterpretation: inferSelfDescriptionPattern(text, domain),
    interpretationType:      inferInterpretationType(text, domain),
    targetStore:             'interpretive_ledger',
    evidenceType:            'explicit_statement',
    evidenceWeight:          EVIDENCE_WEIGHTS.explicit_statement,
    signalStrength:          signal,
    originalLanguage:        excerpt,
  });
}

/**
 * Detects strong elemental activation:
 * current element is consistent with message content AND signal is strong.
 */
function detectElementalActivation(
  ctx: TurnContext,
  domain: string,
): NormalizedObservation | null {
  const text  = ctx.userMessage.toLowerCase();
  const el    = ctx.currentElement;
  const score = scoreElementalAlignment(text, el);

  if (score < 0.55) return null;

  const observation = `${capitalize(el)}-element activation in ${domain} domain`;
  const candidate   = `${capitalize(el)}-phase orientation when engaging with ${domain}`;

  return buildObservation({
    ctx,
    domain,
    observation,
    candidateInterpretation: candidate,
    interpretationType:      'elemental',
    targetStore:             'state_store',
    evidenceType:            'elemental_activation',
    evidenceWeight:          EVIDENCE_WEIGHTS.elemental_activation,
    signalStrength:          score,
    originalLanguage:        ctx.userMessage.slice(0, 100),
  });
}

/**
 * Detects avoidance / deflection:
 * "but anyway", "never mind", abrupt topic shift, self-interruption.
 */
function detectAvoidance(
  ctx: TurnContext,
  domain: string,
): NormalizedObservation | null {
  const text = ctx.userMessage.toLowerCase();

  const avoidancePatterns = [
    /\bbut anyway\b/,
    /\bnever mind\b/,
    /\bforget (?:i )?said that\b/,
    /\blet'?s? (?:not )?(?:talk about|get into) that\b/,
    /\bi don't (?:want|need) to (?:get into|talk about|go there)\b/,
    /\bmaybe i'?m? (?:overthinking|reading too much into)\b/,
    /\bactually[,.]?\s+(?:it'?s? )?(?:fine|okay|not important|not a big deal)\b/,
    /\bwhatever[,.]?\s+(?:it'?s? )?(?:fine|okay|not important)\b/,
  ];

  const matched = avoidancePatterns.find(p => p.test(text));
  if (!matched) return null;

  const excerpt = extractMatchExcerpt(ctx.userMessage, matched, 100);

  return buildObservation({
    ctx,
    domain,
    observation:            `Avoidance signal in ${domain} context: "${excerpt}"`,
    candidateInterpretation: `Possible deflection pattern when engaging with ${domain}`,
    interpretationType:      'relational',
    targetStore:             'interpretive_ledger',
    evidenceType:            'topic_avoidance',
    evidenceWeight:          EVIDENCE_WEIGHTS.topic_avoidance,
    signalStrength:          0.45,
    originalLanguage:        excerpt,
  });
}

/**
 * Detects strong emotional register:
 * concentrated affective language suggesting significant activation.
 */
function detectEmotionalRegister(
  ctx: TurnContext,
  domain: string,
): NormalizedObservation | null {
  const text  = ctx.userMessage.toLowerCase();
  const score = scoreEmotionalIntensity(text);

  if (score < SIGNAL_FLOOR) return null;

  const register = classifyEmotionalRegister(text);

  return buildObservation({
    ctx,
    domain,
    observation:            `${capitalize(register)} emotional register in ${domain} context`,
    candidateInterpretation: `${capitalize(register)} activation pattern in ${domain} domain`,
    interpretationType:      'elemental',
    targetStore:             'state_store',
    evidenceType:            'emotional_register',
    evidenceWeight:          EVIDENCE_WEIGHTS.emotional_register,
    signalStrength:          score,
    originalLanguage:        ctx.userMessage.slice(0, 100),
  });
}

/**
 * Detects explicit corrections / contradictions:
 * "that's not right", "actually...", "no, I mean...", "I don't do that".
 * Returns a ContradictionSignal rather than an evidence event.
 */
function detectCorrection(
  ctx: TurnContext,
  domain: string,
): ContradictionSignal | null {
  const text = ctx.userMessage.toLowerCase();

  const correctionPatterns = [
    /\bthat'?s? not (?:right|true|accurate|correct|me|what i said)\b/,
    /\bi don'?t (?:actually )?do that\b/,
    /\bactually[,.]?\s+(?:no|i|that)\b/,
    /\bno[,.]?\s+(?:i mean|actually|that'?s? not)\b/,
    /\bwait[,.]?\s+(?:no|that'?s?|i)\b/,
    /\bi wouldn'?t say (?:i'm|i am|that)\b/,
    /\bthat doesn'?t (?:sound|feel|seem) like (?:me|i do)\b/,
    /\bi'?m? not (?:really|actually) (?:like that|someone who)\b/,
  ];

  const matched = correctionPatterns.find(p => p.test(text));
  if (!matched) return null;

  const excerpt = extractMatchExcerpt(ctx.userMessage, matched, 120);

  // Extract keywords from surrounding text for hypothesis matching
  const keywords = extractKeywords(ctx.userMessage);

  return {
    sessionId:            ctx.sessionId,
    observation:          `Member correction: "${excerpt}"`,
    context_domain:       domain,
    context_element:      ctx.currentElement,
    source:               'user_correction',
    contradiction_weight: CONTRADICTION_WEIGHTS.user_correction,
    user_initiated:       true,
    target_keywords:      keywords,
  };
}

// ─── Domain classification ────────────────────────────────────────────────────

const DOMAIN_PATTERNS: Array<[string, RegExp]> = [
  ['work',          /\b(?:work|job|career|profession|colleague|boss|meeting|project|deadline|office|client)\b/i],
  ['relationship',  /\b(?:partner|relationship|marriage|love|friend|connection|intimacy|trust|bond)\b/i],
  ['family',        /\b(?:family|parent|child|mother|father|sibling|brother|sister|son|daughter)\b/i],
  ['creativity',    /\b(?:creative|art|music|writing|making|build|create|design|vision|project)\b/i],
  ['health',        /\b(?:health|body|sleep|energy|tired|exhausted|anxiety|stress|pain|illness)\b/i],
  ['identity',      /\b(?:who i am|identity|sense of self|purpose|meaning|values|authenticity|truth)\b/i],
  ['spirituality',  /\b(?:spiritual|soul|divine|sacred|meaning|depth|consciousness|awareness|meditation)\b/i],
  ['finances',      /\b(?:money|financial|income|debt|savings|afford|wealth|poverty)\b/i],
];

function classifyDomain(text: string): string {
  for (const [domain, pattern] of DOMAIN_PATTERNS) {
    if (pattern.test(text)) return domain;
  }
  return 'general';
}

// ─── Signal scoring ───────────────────────────────────────────────────────────

function scoreExplicitStatement(text: string): number {
  // Higher score for more specific / vulnerable self-disclosures
  let score = 0.65;
  if (/\bi (?:struggle|find it hard|find it difficult)\b/.test(text)) score = 0.85;
  if (/\b(?:always|never|every time|constantly)\b/.test(text)) score = Math.min(score + 0.10, 0.95);
  if (/\bpeople (?:say|tell me)\b/.test(text)) score = 0.75;
  return score;
}

function scoreElementalAlignment(text: string, element: Element): number {
  const elementWords: Record<Element, RegExp> = {
    fire:    /\b(?:vision|create|inspire|energy|passion|bold|courage|ignite|drive|spark|power|action|launch)\b/i,
    water:   /\b(?:feel|emotion|flow|sense|intuition|depth|reflect|nurture|connect|hold|grieve|love|heal)\b/i,
    earth:   /\b(?:ground|practical|build|stable|structure|plan|steps|real|concrete|body|resource|sustain)\b/i,
    air:     /\b(?:think|analyze|understand|pattern|communicate|clarity|perspective|idea|concept|articulate)\b/i,
    aether:  /\b(?:meaning|mystery|spirit|wholeness|integrate|transcend|witness|presence|awareness|sacred)\b/i,
  };

  const pattern = elementWords[element];
  const matches = (text.match(pattern) ?? []).length;
  return Math.min(0.90, 0.40 + matches * 0.15);
}

function scoreEmotionalIntensity(text: string): number {
  const intensifiers = /\b(?:extremely|really|very|so|incredibly|deeply|profoundly|utterly|completely)\b/gi;
  const emotionWords = /\b(?:afraid|angry|ashamed|devastated|ecstatic|exhausted|frustrated|grief|heartbroken|hopeless|lonely|overwhelmed|terrified|vulnerable|worthless)\b/gi;
  const intensifierCount = (text.match(intensifiers) ?? []).length;
  const emotionCount     = (text.match(emotionWords) ?? []).length;
  return Math.min(0.90, emotionCount * 0.25 + intensifierCount * 0.10);
}

function classifyEmotionalRegister(text: string): string {
  if (/\b(?:afraid|terrified|anxious|scared|worry)\b/i.test(text))  return 'fear';
  if (/\b(?:angry|frustrated|resentful|furious|rage)\b/i.test(text)) return 'anger';
  if (/\b(?:grief|sad|heartbroken|loss|mourn|devastated)\b/i.test(text)) return 'grief';
  if (/\b(?:shame|ashamed|embarrassed|humiliated|worthless)\b/i.test(text)) return 'shame';
  if (/\b(?:lonely|isolated|disconnected|unseen|invisible)\b/i.test(text)) return 'isolation';
  if (/\b(?:hope|excited|inspired|energized|alive|expansive)\b/i.test(text)) return 'expansive';
  return 'affective';
}

// ─── Interpretation inference ─────────────────────────────────────────────────

function inferSelfDescriptionPattern(text: string, domain: string): string {
  if (/\b(?:struggle|hard|difficult|can'?t)\b/.test(text)) {
    return `Pattern of difficulty or resistance in ${domain} domain`;
  }
  if (/\b(?:always|every time|constantly)\b/.test(text)) {
    return `Recurring behavioral tendency in ${domain} context`;
  }
  if (/\b(?:people say|told me)\b/.test(text)) {
    return `Externally reflected pattern in ${domain} domain`;
  }
  return `Self-identified pattern related to ${domain}`;
}

function inferInterpretationType(text: string, domain: string): InterpretationType {
  if (domain === 'identity') return 'identity_arc';
  if (/\b(?:people|relationship|friend|partner|colleague)\b/.test(text)) return 'relational';
  if (/\b(?:always|never|pattern|tendency|habit)\b/.test(text)) return 'identity_arc';
  return 'relational';
}

// ─── Observation builder ──────────────────────────────────────────────────────

interface BuildParams {
  ctx: TurnContext;
  domain: string;
  observation: string;
  candidateInterpretation: string;
  interpretationType: InterpretationType;
  targetStore: TargetStore;
  evidenceType: EvidenceType;
  evidenceWeight: number;
  signalStrength: number;
  originalLanguage: string;
}

function buildObservation(p: BuildParams): NormalizedObservation {
  return {
    session_id:         p.ctx.sessionId,
    originating_agent:  'oracle',
    originating_model:  'os_extractor',  // marks as OS-native, not model-generated

    observation_summary:      p.observation,
    candidate_interpretation: p.candidateInterpretation,
    interpretation_type:      p.interpretationType,
    target_store:             p.targetStore,

    initial_evidence_event: {
      session_id:       p.ctx.sessionId,
      timestamp:        new Date(),
      observation:      p.observation,
      context_domain:   p.domain,
      context_element:  p.ctx.currentElement,
      context_mode:     p.ctx.currentMode,
      evidence_type:    p.evidenceType,
      evidence_weight:  p.evidenceWeight,
      signal_strength:  p.signalStrength,
      is_immutable:     true,
    },

    initial_confidence: {
      signal_confidence:       p.signalStrength,
      interpretive_confidence: p.evidenceWeight,
    },
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function extractMatchExcerpt(text: string, pattern: RegExp, maxLen: number): string {
  const match = pattern.exec(text);
  if (!match) return text.slice(0, maxLen);
  const start = Math.max(0, match.index - 20);
  const end   = Math.min(text.length, match.index + match[0].length + 60);
  return text.slice(start, end).trim().slice(0, maxLen);
}

function extractKeywords(text: string): string[] {
  // Simple extraction: remove stopwords, return meaningful words
  const stopwords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'i','me','my','you','your','it','is','are','was','were','be','been',
    'have','has','had','do','does','did','will','would','could','should',
    'not','no','yes','so','if','as','by','up','out','this','that','these',
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 8);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
