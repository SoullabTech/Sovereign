/**
 * lib/nostr/serverClient.ts
 *
 * Server-side Nostr relay client.
 * Used by API routes and background workers that need to publish events
 * without going through the browser WebSocket client.
 *
 * Uses SimplePool from nostr-tools, which supports Node.js environments.
 * Node.js 18+ has native WebSocket support. For Node.js < 18, the ws
 * package serves as the underlying transport (nostr-tools handles this).
 *
 * Unlike lib/nostr/client.ts (browser singleton), this module creates a
 * new pool per publish call — server routes are stateless.
 *
 * DO NOT add 'use client' to this file.
 */

import { SimplePool } from 'nostr-tools';
import type { Event } from 'nostr-tools';
import { SOULLAB_RELAY_URL } from './utils';

/**
 * Publish a signed Nostr event to the Soullab relay from a server context.
 * Creates a short-lived pool, publishes, then closes.
 * Timeout: 10 seconds.
 */
export async function publishEventFromServer(event: Event): Promise<void> {
  const pool = new SimplePool();

  try {
    await Promise.race([
      pool.publish([SOULLAB_RELAY_URL], event),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Relay publish timeout (10s)')), 10_000)
      ),
    ]);
  } finally {
    pool.close([SOULLAB_RELAY_URL]);
  }
}
