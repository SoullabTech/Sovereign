/**
 * Voice streaming guard — memory-canon protection for text that is emitted
 * incrementally.
 *
 * Text MAIA scrubs a COMPLETED response. Voice cannot: by the time a response is
 * "complete", the member has already read it and heard it spoken. Protection must
 * therefore happen before each fragment leaves the server.
 *
 * A naive per-chunk probe has a hole the completed-text scrub does not:
 *
 *     chunk 1: "I don't have"
 *     chunk 2: "memory between conversations."
 *
 * Neither fragment matches a forbidden pattern alone, yet the member reads and
 * hears the forbidden statement. This module closes that with a short rolling
 * tail — the last N characters already emitted — used as DETECTION CONTEXT only.
 * The whole response is never buffered, so streaming (and first-audio latency)
 * is unchanged.
 *
 * When a violation spans the boundary, the completing fragment is DROPPED rather
 * than rewritten. Rewriting would require positionally re-aligning a replacement
 * across a boundary whose earlier half is already on the member's screen; dropping
 * invents no words and cannot complete the forbidden claim. The already-emitted
 * prefix ("I don't have") is not itself the amnesia posture.
 *
 * `hasLoadedContext` must reflect what the turn ACTUALLY loaded. When continuity
 * genuinely failed, MAIA is still permitted to say she cannot recall — the canon
 * governs false claims of memorylessness, not honest ones.
 */

import { scrubMemoryAmnesia } from './memoryCanonGuard';

/** Characters of already-emitted text retained as cross-chunk detection context. */
export const VOICE_GUARD_TAIL_CHARS = 160;

export type VoiceChunkVerdict = {
  /** Text safe to emit, speak, and persist. Empty string means "emit nothing". */
  safeText: string;
  /** True when the canon guard altered or suppressed this chunk. */
  scrubbed: boolean;
  /** Which probe fired — for logs and tests. */
  reason: 'clean' | 'chunk' | 'cross-chunk';
};

/**
 * Decide what may be emitted for a single streamed chunk.
 *
 * @param chunkText   the chunk as produced (already identity-checked upstream)
 * @param recentTail  safe text already emitted this response (tail window)
 */
export function guardVoiceChunk(
  chunkText: string,
  opts: { recentTail: string; hasLoadedContext: boolean },
): VoiceChunkVerdict {
  if (!chunkText) return { safeText: '', scrubbed: false, reason: 'clean' };

  // 1. Does the chunk violate on its own? Canonical scrub applies directly.
  const direct = scrubMemoryAmnesia(chunkText, { hasLoadedContext: opts.hasLoadedContext });
  if (direct !== null) {
    return { safeText: direct, scrubbed: true, reason: 'chunk' };
  }

  // 2. Does it COMPLETE a violation begun in already-emitted text?
  const tail = (opts.recentTail || '').slice(-VOICE_GUARD_TAIL_CHARS);
  if (tail) {
    const spanning = scrubMemoryAmnesia(`${tail} ${chunkText}`.trim(), {
      hasLoadedContext: opts.hasLoadedContext,
    });
    if (spanning !== null) {
      // Drop the completing fragment. See module header for why not a rewrite.
      return { safeText: '', scrubbed: true, reason: 'cross-chunk' };
    }
  }

  return { safeText: chunkText, scrubbed: false, reason: 'clean' };
}

/** Roll the detection window forward with text that was actually emitted. */
export function advanceVoiceGuardTail(recentTail: string, emitted: string): string {
  if (!emitted) return recentTail;
  return `${recentTail} ${emitted}`.trim().slice(-VOICE_GUARD_TAIL_CHARS);
}
