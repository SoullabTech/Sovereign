/**
 * Voice Conductor — the ONLY place that turns oracle state into voice state.
 *
 * Downstream voice layers must not invent identity.
 * This enforces: "All layers may suggest. Only the Conductor decides."
 *
 * Includes element hysteresis: don't switch dominant element unless
 * it appears 2 turns in a row or intensity is high. Reduces AI twitch.
 * This is in-memory only — no persistence needed (pre-Bridge D).
 */

import type { VoiceIntent, Element, VoiceArchetype, RouteScore } from '@/lib/types/voiceIntent';

// ═══════════════════════════════════════════════════════════════
// Normalization
// ═══════════════════════════════════════════════════════════════

function normalizeElement(value: any): Element {
  const v = String(value || '').toLowerCase();
  if (v === 'fire' || v === 'water' || v === 'earth' || v === 'air' || v === 'aether') return v;
  return 'aether';
}

function normalizePhase(value: any): number {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return Math.floor(n);
  return 1;
}

function normalizeArchetype(value: any): VoiceArchetype {
  const v = String(value || '').toLowerCase();
  if (v === 'oracle' || v === 'guide' || v === 'companion') return v;
  return 'guide';
}

// ═══════════════════════════════════════════════════════════════
// Element Hysteresis
// ═══════════════════════════════════════════════════════════════

/** High-intensity threshold — bypass hysteresis if the signal is strong */
const HIGH_INTENSITY_THRESHOLD = 0.8;

/**
 * Per-session element stability buffer.
 * Key: memberId or 'anon'. Value: last confirmed element + pending candidate.
 * In-memory only — resets on server restart. Bridge D replaces this.
 */
const elementBuffer: Map<string, {
  confirmed: Element;
  candidate: Element | null;
  candidateCount: number;
}> = new Map();

/**
 * Apply hysteresis: only switch element if new element appears 2+ turns
 * in a row, or intensity is high enough to justify immediate switch.
 */
function applyHysteresis(
  memberId: string,
  proposed: Element,
  intensity?: number,
): Element {
  const buf = elementBuffer.get(memberId);

  // First call for this member — accept immediately, set baseline
  if (!buf) {
    elementBuffer.set(memberId, {
      confirmed: proposed,
      candidate: null,
      candidateCount: 0,
    });
    return proposed;
  }

  // Same as confirmed — reset any pending candidate
  if (proposed === buf.confirmed) {
    buf.candidate = null;
    buf.candidateCount = 0;
    return buf.confirmed;
  }

  // High intensity — trust the signal, switch immediately
  if (typeof intensity === 'number' && intensity >= HIGH_INTENSITY_THRESHOLD) {
    buf.confirmed = proposed;
    buf.candidate = null;
    buf.candidateCount = 0;
    return proposed;
  }

  // New candidate or continuing candidate
  if (proposed === buf.candidate) {
    buf.candidateCount++;
  } else {
    buf.candidate = proposed;
    buf.candidateCount = 1;
  }

  // 2 turns in a row — confirm the switch
  if (buf.candidateCount >= 2) {
    buf.confirmed = proposed;
    buf.candidate = null;
    buf.candidateCount = 0;
    return proposed;
  }

  // Not enough evidence — hold current element
  return buf.confirmed;
}

// ═══════════════════════════════════════════════════════════════
// Route Scoring
// ═══════════════════════════════════════════════════════════════

/** Override only when confidence clearly exceeds this */
const ROUTE_SCORE_THRESHOLD = 0.6;

/** Top-two delta must exceed this to avoid jitter on close calls */
const ROUTE_SCORE_DELTA_MIN = 0.1;

/** Archetype override requires stronger confidence than element */
const ARCHETYPE_OVERRIDE_THRESHOLD = 0.75;

/**
 * Shallow cue maps — max ~10 cues per element, simple includes() only.
 * No regex, no embeddings, no external libs.
 */
const ELEMENT_CUES: Record<Element, string[]> = {
  fire: [
    'motivation', 'energy', 'vision', 'ignite', 'initiative',
    'courage', 'action', 'passionate', 'burning', 'drive',
  ],
  water: [
    'feeling', 'emotion', 'grief', 'tears', 'dream',
    'overwhelm', 'depth', 'sadness', 'vulnerability', 'intuition',
  ],
  earth: [
    'body', 'grounding', 'routine', 'structure', 'practice',
    'embodiment', 'stability', 'habit', 'discipline', 'anchor',
  ],
  air: [
    'clarity', 'perspective', 'reframe', 'pattern', 'insight',
    'understand', 'meaning', 'reflect', 'articulate', 'discern',
  ],
  aether: [
    'sacred', 'transcend', 'integration', 'mystery', 'wholeness',
    'soul', 'divine', 'paradox', 'unity', 'witness',
  ],
};

const ARCHETYPE_CUES: Record<VoiceArchetype, string[]> = {
  oracle: ['oracle', 'prophecy', 'vision', 'sacred', 'revelation', 'destiny'],
  companion: ['lonely', 'just need someone', 'be with me', 'hold space', 'listen'],
  guide: [], // default — no special cues needed
};

/**
 * Score route from multiple signals. Pure function, no side effects.
 * Returns the best element + archetype with confidence and reasons.
 */
export function scoreRoute(
  cell: { element: string; phase: number; context?: string; confidence?: number },
  userMessage?: string,
  persistedState?: { dominant_element: string; phase: number } | null,
): RouteScore {
  const scores: Record<Element, number> = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  const reasons: string[] = [];

  // Base: weight from inferSpiralogicCell (it already did keyword detection)
  const cellElement = normalizeElement(cell.element);
  scores[cellElement] += 0.3;
  reasons.push(`cell: ${cellElement}`);

  // Persisted state contributes a small continuity bias
  if (persistedState) {
    const persisted = normalizeElement(persistedState.dominant_element);
    scores[persisted] += 0.1;
    reasons.push(`persisted: ${persisted}`);
  }

  // Message cue scoring — only if message is long enough to be meaningful
  if (userMessage && userMessage.length >= 20) {
    const lower = userMessage.toLowerCase();
    for (const [el, cues] of Object.entries(ELEMENT_CUES) as [Element, string[]][]) {
      let hits = 0;
      for (const cue of cues) {
        if (lower.includes(cue)) hits++;
      }
      if (hits > 0) {
        // Each hit worth 0.15, capped at 0.45 (3 hits max contribution)
        scores[el] += Math.min(hits * 0.15, 0.45);
        reasons.push(`${el}: ${hits} cue${hits > 1 ? 's' : ''}`);
      }
    }
  }

  // Find top two elements
  const sorted = (Object.entries(scores) as [Element, number][])
    .sort((a, b) => b[1] - a[1]);
  const [topElement, topScore] = sorted[0];
  const [, secondScore] = sorted[1];

  // Agreement / disagreement bias
  let confidence = topScore;
  const agreesWithCell = topElement === cellElement;
  if (agreesWithCell) {
    confidence += 0.1;
    reasons.push('agrees with cell (+0.1)');
  } else {
    confidence -= 0.1;
    reasons.push('disagrees with cell (-0.1)');
  }

  // Archetype scoring
  let archetype: VoiceArchetype = 'guide';
  if (userMessage && userMessage.length >= 20) {
    const lower = userMessage.toLowerCase();
    let bestArchScore = 0;
    for (const [arch, cues] of Object.entries(ARCHETYPE_CUES) as [VoiceArchetype, string[]][]) {
      if (cues.length === 0) continue;
      let hits = 0;
      for (const cue of cues) {
        if (lower.includes(cue)) hits++;
      }
      const archScore = hits * 0.25;
      if (archScore > bestArchScore) {
        bestArchScore = archScore;
        archetype = arch;
      }
    }
    // Only override if strong enough
    if (bestArchScore < ARCHETYPE_OVERRIDE_THRESHOLD) {
      archetype = 'guide';
    }
  }

  return {
    element: topElement,
    archetype,
    confidence,
    reasons,
    elementScores: scores,
  };
}

// ═══════════════════════════════════════════════════════════════
// Core Conductor
// ═══════════════════════════════════════════════════════════════

/**
 * Create a VoiceIntent from oracle state + member preferences.
 * This is the Conductor's core function.
 *
 * @param input.memberId - For hysteresis tracking (defaults to 'anon')
 * @param input.persistedState - Bridge D: seed hysteresis from database
 */
export function createVoiceIntent(input: {
  spiralogicCell?: any;
  memberVoicePrefs?: { speed?: number; timbre?: VoiceIntent['timbre'] } | null;
  memberId?: string;
  persistedState?: { dominant_element: string; phase: number } | null;
  userMessage?: string;
}): VoiceIntent {
  const cell = input.spiralogicCell;
  const memberId = input.memberId || 'anon';

  // BRIDGE D: If persistedState exists and member has no hysteresis buffer,
  // seed from database to prevent treating returning members like new people
  if (input.persistedState && !elementBuffer.has(memberId)) {
    const persistedElement = normalizeElement(input.persistedState.dominant_element);
    elementBuffer.set(memberId, {
      confirmed: persistedElement,
      candidate: null,
      candidateCount: 0,
    });
  }

  const rawElement = normalizeElement(cell?.element);
  const intensity = typeof cell?.intensity === 'number' ? cell.intensity : undefined;

  // Route scoring: refine element + archetype from multiple signals
  let proposedElement = rawElement;
  let proposedArchetype: VoiceArchetype = normalizeArchetype(cell?.archetype);
  let routeDebug: VoiceIntent['routeDebug'] | undefined;

  if (cell) {
    // Fast path: skip scoring for short or absent messages
    if (!input.userMessage || input.userMessage.length < 20) {
      // No scoring — cell is authoritative
    } else {
      const score = scoreRoute(cell, input.userMessage, input.persistedState);
      const sorted = (Object.entries(score.elementScores) as [Element, number][])
        .sort((a, b) => b[1] - a[1]);
      const delta = sorted[0][1] - sorted[1][1];

      const passesThreshold = score.confidence >= ROUTE_SCORE_THRESHOLD && delta >= ROUTE_SCORE_DELTA_MIN;
      const agreesWithCell = score.element === rawElement;

      // Determine reason code for debug clarity
      let reasonCode: string;
      if (passesThreshold && score.archetype !== 'guide') {
        reasonCode = 'archetype_override';
        proposedElement = score.element;
        proposedArchetype = score.archetype;
      } else if (passesThreshold) {
        reasonCode = agreesWithCell ? 'message_agreed_with_cell' : 'score_override';
        proposedElement = score.element;
        proposedArchetype = score.archetype;
      } else if (delta < ROUTE_SCORE_DELTA_MIN) {
        reasonCode = 'tie_fallback_to_cell';
      } else {
        reasonCode = 'below_threshold';
      }

      // Debug log: only when scoring passes threshold OR disagrees with cell
      if (passesThreshold || !agreesWithCell) {
        routeDebug = {
          scores: score.elementScores,
          reasons: [...score.reasons, reasonCode],
          cellAgreement: agreesWithCell,
        };
        console.info('[conductor-score]', {
          scored: score.element,
          cell: rawElement,
          confidence: score.confidence.toFixed(2),
          delta: delta.toFixed(2),
          applied: passesThreshold,
          reasonCode,
          archetype: score.archetype,
          reasons: score.reasons,
        });
      }
    }
  }

  // Apply hysteresis — don't twitch
  const element = applyHysteresis(memberId, proposedElement, intensity);

  const intent: VoiceIntent = {
    element,
    phase: normalizePhase(cell?.phase),
    intensity,
    motion: cell?.motion,
    archetype: proposedArchetype,
  };

  if (routeDebug) intent.routeDebug = routeDebug;

  // Attach member prefs if present (does not override element/phase identity)
  if (input.memberVoicePrefs?.speed) intent.speed = input.memberVoicePrefs.speed;
  if (input.memberVoicePrefs?.timbre) intent.timbre = input.memberVoicePrefs.timbre;

  return intent;
}
