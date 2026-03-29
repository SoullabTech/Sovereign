/**
 * State-to-Prosody Mapping Layer — deterministic, no LLM.
 *
 * Converts live system signals (element, phase, relational depth)
 * into a bounded ProsodyPacket. This is the heart of presence encoding.
 *
 * Rules:
 * - Element nudges are additive from neutral baseline
 * - Phase modulates without overriding element
 * - Relational depth applies last as subtle maturation bias
 * - Member tone offsets merge after mapping (in Speech Director)
 * - All output is hard-clamped before return
 */

import { type ProsodyPacket, NEUTRAL_PROSODY, clampProsody } from './prosodyPacket';
import { aetherGuard } from './aetherGuard';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type Phase = 'emerging' | 'stabilizing' | 'peaking' | 'receding';

export interface PresenceState {
  /** Current dominant element from conductor */
  dominant: Element;
  /** Secondary element (optional, not blended — just context) */
  secondary?: Element;
  /** Expression phase of the dominant element */
  phase: Phase;
  /** Relational maturity 0–1 (derived from relational_phase + autonomy_streak) */
  relationalDepth: number;
  /** Voice mode dampening factor. Care = 0.7, Talk = 1.0, Scribe = 0 */
  modeDampening?: number;
}

/**
 * Map system state to a prosody packet.
 *
 * Pure function. Deterministic. No side effects. No LLM calls.
 */
export function mapStateToProsody(input: PresenceState): ProsodyPacket {
  const dampening = input.modeDampening ?? 1.0;

  // Start from neutral
  const p: ProsodyPacket = { ...NEUTRAL_PROSODY };

  // ─── Element nudges (bounded, additive) ───────────────────────

  switch (input.dominant) {
    case 'fire':
      p.tempo += 0.05 * dampening;
      p.projection += 0.08 * dampening;
      p.emphasis += 0.06 * dampening;
      p.pauseMs -= 20 * dampening;
      break;
    case 'water':
      p.tempo -= 0.06 * dampening;
      p.tonalWarmth += 0.12 * dampening;
      p.pauseMs += 60 * dampening;
      p.silenceBias += 0.08 * dampening;
      break;
    case 'earth':
      p.cadenceDensity += 0.06 * dampening;
      p.pauseMs += 30 * dampening;
      break;
    case 'air':
      p.articulation += 0.1 * dampening;
      p.tempo += 0.02 * dampening;
      break;
    case 'aether':
      p.silenceBias += 0.12 * dampening;
      p.pauseMs += 80 * dampening;
      p.emphasis -= 0.04 * dampening;
      break;
  }

  // ─── Phase modulation (no element override) ───────────────────

  if (input.phase === 'emerging') {
    p.pauseMs += 20 * dampening;
  }
  if (input.phase === 'peaking') {
    p.emphasis += 0.04 * dampening;
  }
  if (input.phase === 'receding') {
    p.tempo -= 0.03 * dampening;
  }

  // ─── Relational maturation (subtle, applied last) ─────────────
  // Deeper relationships → more economy, more trust in silence

  const rd = Math.max(0, Math.min(1, input.relationalDepth));
  p.pauseMs += Math.round(40 * rd * dampening);
  p.cadenceDensity -= 0.05 * rd * dampening;

  // ─── Aether guard (prevent collapse) then hard clamp ──────────

  return clampProsody(aetherGuard(p));
}
