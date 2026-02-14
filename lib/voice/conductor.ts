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

import type { VoiceIntent, Element, VoiceArchetype } from '@/lib/types/voiceIntent';

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

  // Apply hysteresis — don't twitch
  const element = applyHysteresis(memberId, rawElement, intensity);

  const intent: VoiceIntent = {
    element,
    phase: normalizePhase(cell?.phase),
    intensity,
    motion: cell?.motion,
    archetype: normalizeArchetype(cell?.archetype),
  };

  // Attach member prefs if present (does not override element/phase identity)
  if (input.memberVoicePrefs?.speed) intent.speed = input.memberVoicePrefs.speed;
  if (input.memberVoicePrefs?.timbre) intent.timbre = input.memberVoicePrefs.timbre;

  return intent;
}
