/**
 * Prosody Packet — bounded delivery parameters for presence-encoded voice.
 *
 * No adjectives. No freeform style instructions. Only constrained numeric values
 * across semantically distinct lanes. Hard-clamped at creation time.
 *
 * This is the contract between the Mapping Layer and the Voice Engine.
 * The Voice Engine (Kokoro) receives these values and translates them
 * into provider-specific parameters. No downstream overrides.
 */

export type ProsodyPacket = {
  /** Speech rate multiplier. 1.0 = baseline. */
  tempo: number;            // 0.85–1.15
  /** Inter-phrase pause duration in milliseconds. */
  pauseMs: number;          // 80–420
  /** Forward energy / volume emphasis. 1.0 = baseline. */
  projection: number;       // 0.8–1.2
  /** Consonant clarity / diction sharpness. 1.0 = baseline. */
  articulation: number;     // 0.85–1.2
  /** Tonal color bias. Negative = cool/bright, Positive = warm/soft. */
  tonalWarmth: number;      // -0.3–0.3
  /** Phrase density. Higher = more packed, lower = more spacious. */
  cadenceDensity: number;   // 0.8–1.2
  /** Fraction of added pauses between phrases. 0 = none, 0.4 = frequent. */
  silenceBias: number;      // 0–0.4
  /** Word-level stress intensity. 1.0 = baseline. */
  emphasis: number;         // 0.8–1.2
};

/** Neutral prosody — no elemental, relational, or phase influence. */
export const NEUTRAL_PROSODY: ProsodyPacket = {
  tempo: 1.0,
  pauseMs: 160,
  projection: 1.0,
  articulation: 1.0,
  tonalWarmth: 0.0,
  cadenceDensity: 1.0,
  silenceBias: 0.1,
  emphasis: 1.0,
};

const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Hard-clamp all channels to their approved bounds. No exceptions. */
export function clampProsody(p: ProsodyPacket): ProsodyPacket {
  return {
    tempo: clampN(p.tempo, 0.85, 1.15),
    pauseMs: clampN(Math.round(p.pauseMs), 80, 420),
    projection: clampN(p.projection, 0.8, 1.2),
    articulation: clampN(p.articulation, 0.85, 1.2),
    tonalWarmth: clampN(p.tonalWarmth, -0.3, 0.3),
    cadenceDensity: clampN(p.cadenceDensity, 0.8, 1.2),
    silenceBias: clampN(p.silenceBias, 0, 0.4),
    emphasis: clampN(p.emphasis, 0.8, 1.2),
  };
}
