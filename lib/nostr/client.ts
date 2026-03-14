/**
 * lib/nostr/client.ts
 *
 * Nostr relay client for Soullab.
 * Manages connection to the self-hosted relay at nostr.soullab.life.
 * Client-side only — never imported in server-side code.
 */

'use client';

import { SimplePool } from 'nostr-tools';
import type { Filter, Event } from 'nostr-tools';
import { SOULLAB_RELAY_URL } from './utils';

// ─── Relay pool singleton ─────────────────────────────────────────────────────

let _pool: SimplePool | null = null;

function getPool(): SimplePool {
  if (!_pool) {
    _pool = new SimplePool();
  }
  return _pool;
}

export function getRelayUrl(): string {
  return SOULLAB_RELAY_URL;
}

// ─── Publish ──────────────────────────────────────────────────────────────────

/**
 * Publish a signed Nostr event to the Soullab relay.
 */
export async function publishEvent(signedEvent: Event): Promise<void> {
  const pool = getPool();
  await pool.publish([SOULLAB_RELAY_URL], signedEvent);
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

/**
 * Subscribe to events matching a filter.
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(
  filters: Filter[],
  onEvent: (event: Event) => void,
  onEose?: () => void
): () => void {
  const pool = getPool();
  const sub = pool.subscribeMany([SOULLAB_RELAY_URL], filters, {
    onevent: onEvent,
    oneose: onEose,
  });
  return () => sub.close();
}

// ─── Fetch (one-shot) ─────────────────────────────────────────────────────────

/**
 * Fetch events matching a filter (one-shot, no subscription).
 */
export async function fetchEvents(filters: Filter[]): Promise<Event[]> {
  const pool = getPool();
  return pool.querySync([SOULLAB_RELAY_URL], filters[0]);
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export function closePool(): void {
  if (_pool) {
    _pool.close([SOULLAB_RELAY_URL]);
    _pool = null;
  }
}
