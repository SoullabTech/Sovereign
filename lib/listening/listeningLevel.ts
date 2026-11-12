/**
 * The member's Sound Studio level (0–100): one setting for every sound the shared player plays.
 * It is remembered on this device only, and it changes only when the member changes it.
 * A fade or sleep timer moves the audible level for a moment but never rewrites the remembered one.
 */
export const LISTENING_LEVEL_STORAGE_KEY = 'soullab.listen.level.v1';
export const DEFAULT_LISTENING_LEVEL = 45;

/** Generated sound (sketches, soundscapes) reaches the speaker at level/100 × this, through its master gain. */
export const GENERATED_OUTPUT_SCALE = 0.027;

export function normalizeListeningLevel(value: unknown): number | null {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

type LevelStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function readStoredListeningLevel(storage: LevelStorage | null | undefined): number {
  try {
    const stored = normalizeListeningLevel(storage?.getItem(LISTENING_LEVEL_STORAGE_KEY) ?? null);
    return stored ?? DEFAULT_LISTENING_LEVEL;
  } catch {
    return DEFAULT_LISTENING_LEVEL;
  }
}

export function writeStoredListeningLevel(storage: LevelStorage | null | undefined, level: number): void {
  const next = normalizeListeningLevel(level);
  if (next === null) return;
  try { storage?.setItem(LISTENING_LEVEL_STORAGE_KEY, String(next)); } catch { /* private window or blocked storage */ }
}

/** The master gain a generated sound should have at this level (never exactly 0: Web Audio ramps need >0). */
export function generatedGainForLevel(level: number): number {
  return Math.max(0.0001, (normalizeListeningLevel(level) ?? 0) / 100 * GENERATED_OUTPUT_SCALE);
}
