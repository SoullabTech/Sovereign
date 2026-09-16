import type { TurnEvidence } from './turnArbiter';

export const TURN_BENCH_CLASSES = [
  'ordinary_pause', 'word_search', 'hesitation', 'emotional_pause', 'breath',
  'unfinished_syntax', 'explicit_yield', 'question_yield', 'reentry',
] as const;

export type TurnBenchClass = typeof TURN_BENCH_CLASSES[number];
export type TurnBenchGroundTruth = 'continue' | 'yield';
export type TurnBenchCase = {
  id: string;
  pauseClass: TurnBenchClass;
  label: TurnBenchGroundTruth;
  evidence: TurnEvidence;
  referenceLatencyMs?: number;
};

const TOP_LEVEL = new Set(['id', 'pauseClass', 'label', 'evidence', 'referenceLatencyMs']);
const EVIDENCE_KEYS = new Set([
  'explicitFloorHeld', 'speechActive', 'silenceMs', 'selectedSilenceMs', 'continuedPauseEmaMs',
  'acousticContinue', 'acousticYield', 'semanticIncomplete', 'semanticYield', 'backchannel',
]);

const finiteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const probability = (v: unknown): boolean => v == null || (finiteNumber(v) && v >= 0 && v <= 1);

export function parseTurnBenchCase(value: unknown): TurnBenchCase {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('case must be an object');
  const o = value as Record<string, unknown>;
  for (const key of Object.keys(o)) if (!TOP_LEVEL.has(key)) throw new Error(`field forbidden in repo corpus: ${key}`);
  if (typeof o.id !== 'string' || !o.id.trim()) throw new Error('id required');
  if (!TURN_BENCH_CLASSES.includes(o.pauseClass as TurnBenchClass)) throw new Error('invalid pauseClass');
  if (o.label !== 'continue' && o.label !== 'yield') throw new Error('invalid label');
  if (!o.evidence || typeof o.evidence !== 'object' || Array.isArray(o.evidence)) throw new Error('evidence required');

  const e = o.evidence as Record<string, unknown>;
  for (const key of Object.keys(e)) if (!EVIDENCE_KEYS.has(key)) throw new Error(`evidence field forbidden in repo corpus: ${key}`);
  if (typeof e.explicitFloorHeld !== 'boolean' || typeof e.speechActive !== 'boolean') throw new Error('evidence booleans required');
  if (!finiteNumber(e.silenceMs) || e.silenceMs < 0 || !finiteNumber(e.selectedSilenceMs) || e.selectedSilenceMs < 0) throw new Error('evidence timing required');
  if (e.continuedPauseEmaMs != null && (!finiteNumber(e.continuedPauseEmaMs) || e.continuedPauseEmaMs < 0)) throw new Error('invalid continuedPauseEmaMs');
  for (const key of ['acousticContinue', 'acousticYield', 'semanticIncomplete', 'semanticYield', 'backchannel'] as const) {
    if (!probability(e[key])) throw new Error(`invalid probability: ${key}`);
  }
  if (o.referenceLatencyMs != null && (!finiteNumber(o.referenceLatencyMs) || o.referenceLatencyMs < 0)) throw new Error('invalid referenceLatencyMs');
  return o as TurnBenchCase;
}
