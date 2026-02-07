/**
 * Shared helpers for retry idempotency across Studio and Portal paths.
 *
 * safeParseMeta — defensive JSONB parse (pg auto-parses, but edge cases exist)
 * dispatchHash  — canonical payload → stable JSON → sha256 → 16-char hex
 */

import crypto from 'crypto';

/** Safely parse error_meta — pg auto-parses JSONB, but defend against edge cases */
export function safeParseMeta(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return (raw as Record<string, unknown>) ?? {};
}

/** Canonical dispatch hash — structured payload → stable JSON → sha256 (16-char hex) */
export function dispatchHash(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}
