/**
 * Voice Cache — in-memory LRU cache for synthesized audio.
 *
 * Huge leverage, low effort:
 *   - Reduces latency for repeated phrases
 *   - Stabilizes experience (same text = same audio)
 *   - Lowers compute load on Kokoro
 *
 * Cache key = sha256(text + voiceId + stylePreset + speed)
 * TTL = 24 hours
 * Max entries = configurable via MAIA_VOICE_CACHE_MAX (default 500)
 *
 * In-memory only — no persistence. Clears on container restart.
 * That's fine: common phrases re-cache quickly, and stale audio
 * should not outlive a deployment.
 */

import crypto from 'crypto';

// ── Types ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  audioBuffer: Buffer;
  contentType: string;
  createdAt: number;
  /** Approximate size in bytes for memory accounting */
  byteSize: number;
}

// ── Configuration ────────────────────────────────────────────────────────────

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ENTRIES = parseInt(process.env.MAIA_VOICE_CACHE_MAX || '500', 10);

// ── Cache Store ──────────────────────────────────────────────────────────────

const cache = new Map<string, CacheEntry>();

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a deterministic cache key from synthesis parameters.
 */
export function createCacheKey(opts: {
  text: string;
  voiceId: string;
  stylePreset: string;
  speed: number;
}): string {
  const input = `${opts.text}|${opts.voiceId}|${opts.stylePreset}|${opts.speed.toFixed(3)}`;
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
}

/**
 * Get cached audio, or null if not found / expired.
 */
export function getCached(key: string): { audioBuffer: Buffer; contentType: string } | null {
  const entry = cache.get(key);
  if (!entry) return null;

  // TTL check
  if (Date.now() - entry.createdAt > TTL_MS) {
    cache.delete(key);
    return null;
  }

  // Move to end (LRU refresh)
  cache.delete(key);
  cache.set(key, entry);

  return { audioBuffer: entry.audioBuffer, contentType: entry.contentType };
}

/**
 * Store synthesized audio in cache.
 * Evicts oldest entries when at capacity.
 */
export function setCache(key: string, audio: { audioBuffer: Buffer; contentType: string }): void {
  // Evict if at capacity
  while (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    } else {
      break;
    }
  }

  cache.set(key, {
    audioBuffer: audio.audioBuffer,
    contentType: audio.contentType,
    createdAt: Date.now(),
    byteSize: audio.audioBuffer.length,
  });
}

/**
 * Cache statistics for observability.
 */
export function getCacheStats(): {
  entries: number;
  maxEntries: number;
  totalBytes: number;
} {
  let totalBytes = 0;
  for (const entry of cache.values()) {
    totalBytes += entry.byteSize;
  }
  return { entries: cache.size, maxEntries: MAX_ENTRIES, totalBytes };
}

/**
 * Clear the entire cache. Used in tests or after deployment.
 */
export function clearCache(): void {
  cache.clear();
}
