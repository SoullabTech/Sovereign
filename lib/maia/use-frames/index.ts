/**
 * Use-Frame Activation — v1
 *
 * Spec: docs/canon/use-frames/USE_FRAME_ACTIVATION.md
 *
 * Implements the seven boundaries from the design doc:
 *   1. similarity threshold gate
 *   2. source-set scoping
 *   3. single-frame-per-turn ceiling
 *   4. (member-language boost — DEFERRED to v2)
 *   5. provisional phrasing in the block (see frame files)
 *   6. telemetry on every fire
 *   7. per-frame env kill switch (default off)
 *
 * v1 scope: John of the Cross only.
 */

import { query } from '@/lib/database/postgres';
import {
  JOHN_OF_THE_CROSS_FRAME_ID,
  JOHN_OF_THE_CROSS_ENV_KEY,
  JOHN_OF_THE_CROSS_THRESHOLD,
  JOHN_OF_THE_CROSS_CHECKSUMS,
  JOHN_OF_THE_CROSS_FRAME_BLOCK,
} from './john-of-the-cross';

// =============================================================================
// TYPES
// =============================================================================

export interface UseFrameDefinition {
  id: string;
  envKey: string;
  threshold: number;
  checksums: string[];
  block: string;
}

export interface RetrievalHit {
  source_id: string;
  score: number;
}

export interface UseFrameActivation {
  active: boolean;
  frameId: string | null;
  block: string;
  sourceIds: string[];
  topScore: number | null;
}

// =============================================================================
// REGISTRY
// =============================================================================

const FRAMES: UseFrameDefinition[] = [
  {
    id: JOHN_OF_THE_CROSS_FRAME_ID,
    envKey: JOHN_OF_THE_CROSS_ENV_KEY,
    threshold: JOHN_OF_THE_CROSS_THRESHOLD,
    checksums: JOHN_OF_THE_CROSS_CHECKSUMS,
    block: JOHN_OF_THE_CROSS_FRAME_BLOCK,
  },
];

// =============================================================================
// ENV KILL SWITCH (boundary #7)
// =============================================================================

export function isFrameEnabled(frame: UseFrameDefinition): boolean {
  return process.env[frame.envKey] === '1';
}

export function getEnabledFrames(): UseFrameDefinition[] {
  return FRAMES.filter(isFrameEnabled);
}

// =============================================================================
// JOTC-ADJACENT TRIGGER GATE (per user spec — narrow JOTC-adjacent terms)
// =============================================================================

const JOTC_ADJACENT_TRIGGERS = [
  'dark night',
  'purification',
  'purgation',
  'detachment',
  'nothing',
  'naught',
  'union with god',
  'ascent',
  'mount carmel',
  'john of the cross',
  'mystical night',
];

/**
 * Returns the union of LIBRARY_TRIGGERS-style matching with the JOTC-adjacent
 * narrow set. Caller should still apply LibraryService.shouldConsultLibrary
 * separately if they want the broader trigger set.
 */
export function hasJotcAdjacentSignal(message: string): boolean {
  const lower = message.toLowerCase();
  return JOTC_ADJACENT_TRIGGERS.some((t) => lower.includes(t));
}

// =============================================================================
// SOURCE ID RESOLUTION (boundary #2: source-set scoping)
//
// Source IDs differ across DB instances (dev localhost, dev docker, prod).
// Checksums are stable. We resolve checksums → IDs lazily on first use and
// cache per process.
// =============================================================================

const _sourceIdCache = new Map<string, string[]>();

async function resolveSourceIds(checksums: string[]): Promise<string[]> {
  const cacheKey = [...checksums].sort().join(',');
  const cached = _sourceIdCache.get(cacheKey);
  if (cached) return cached;

  try {
    const rows = await query<{ id: string }>(
      `SELECT id FROM library_sources WHERE checksum = ANY($1::text[])`,
      [checksums]
    );
    const ids = rows.map((r) => r.id);
    _sourceIdCache.set(cacheKey, ids);
    return ids;
  } catch (err) {
    console.warn('[use-frame] source ID resolution failed:', err);
    return [];
  }
}

// =============================================================================
// ACTIVATION
//
// Given a retrieval result, decide whether any registered (and enabled) frame
// should fire. Implements boundaries #1 (threshold), #2 (source set),
// #3 (single-frame-per-turn — pick highest top score).
// =============================================================================

const NO_ACTIVATION: UseFrameActivation = {
  active: false,
  frameId: null,
  block: '',
  sourceIds: [],
  topScore: null,
};

export async function activateFrameFromRetrieval(
  hits: RetrievalHit[]
): Promise<UseFrameActivation> {
  const enabled = getEnabledFrames();
  if (enabled.length === 0 || hits.length === 0) return NO_ACTIVATION;

  // Compute candidate activation per enabled frame
  const candidates: Array<{
    frame: UseFrameDefinition;
    topScore: number;
    matchedSourceIds: string[];
  }> = [];

  for (const frame of enabled) {
    const frameSourceIds = new Set(await resolveSourceIds(frame.checksums));
    if (frameSourceIds.size === 0) continue;

    const matched = hits.filter((h) => frameSourceIds.has(h.source_id));
    if (matched.length === 0) continue;

    const topScore = Math.max(...matched.map((m) => m.score));
    if (topScore < frame.threshold) continue; // boundary #1

    candidates.push({
      frame,
      topScore,
      matchedSourceIds: Array.from(new Set(matched.map((m) => m.source_id))),
    });
  }

  if (candidates.length === 0) return NO_ACTIVATION;

  // Boundary #3: single-frame-per-turn — highest top score wins
  candidates.sort((a, b) => b.topScore - a.topScore);
  const winner = candidates[0];

  if (candidates.length > 1) {
    console.log(
      `[use-frame] suppressed ${candidates.length - 1} competing frame(s); winner: ${winner.frame.id} (top=${winner.topScore.toFixed(3)})`
    );
  }

  return {
    active: true,
    frameId: winner.frame.id,
    block: winner.frame.block,
    sourceIds: winner.matchedSourceIds,
    topScore: winner.topScore,
  };
}
