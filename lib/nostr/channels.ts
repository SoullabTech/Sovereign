/**
 * lib/nostr/channels.ts
 *
 * NIP-29 Community Channels — relay-based group messaging.
 *
 * Protocol:
 *   Post:      kind 9 event with `h` tag containing the channel ID
 *   Subscribe: filter { kinds: [9], '#h': [channelId] }
 *   Fetch:     one-shot querySync for history
 *
 * Channel IDs are Soullab slugs (e.g. 'cohort', 'practitioners').
 * The full NIP-29 group reference is: nostr.soullab.life'<id>
 *
 * Access control:
 *   - Open channels (cohort): any registered member can join
 *   - Closed channels: explicit membership granted by server
 *   - Phase 4: strfry write policy will enforce this at the relay level
 *
 * This module is client-only. Never import in server/API routes.
 */

'use client';

import { finalizeEvent } from 'nostr-tools';
import type { NostrEvent, Filter } from 'nostr-tools';
import { hexToBytes, signEvent } from './crypto';
import { publishEvent, subscribeToEvents, fetchEvents } from './client';
import { SOULLAB_RELAY_URL } from './utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderPubkey: string;
  content: string;
  createdAt: number;
  replyToId?: string;
}

export interface SoullabChannel {
  id: string;
  name: string;
  about: string;
  channelType: string;
  isOpen: boolean;
  relayUrl: string;
  /** Member's join status */
  joined: boolean;
  /** Whether the member is eligible to join */
  eligible: boolean;
}

// ─── Post ─────────────────────────────────────────────────────────────────────

/**
 * Post a message to a channel.
 * Creates a kind 9 event with an 'h' tag identifying the channel.
 */
export async function postChannelMessage(
  privkeyHex: string,
  channelId: string,
  content: string,
  replyToId?: string
): Promise<void> {
  const tags: string[][] = [['h', channelId, SOULLAB_RELAY_URL]];
  if (replyToId) tags.push(['e', replyToId, SOULLAB_RELAY_URL, 'reply']);

  const event = finalizeEvent({
    kind: 9,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags,
  }, hexToBytes(privkeyHex));

  await publishEvent(event);
}

// ─── Parse ────────────────────────────────────────────────────────────────────

export function parseChannelMessage(event: NostrEvent): ChannelMessage | null {
  const hTag = event.tags.find(t => t[0] === 'h');
  if (!hTag?.[1]) return null;

  const replyTag = event.tags.find(t => t[0] === 'e' && t[3] === 'reply');

  return {
    id: event.id,
    channelId: hTag[1],
    senderPubkey: event.pubkey,
    content: event.content,
    createdAt: event.created_at,
    replyToId: replyTag?.[1],
  };
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

/**
 * Subscribe to live messages in a channel.
 * Returns an unsubscribe function.
 */
export function subscribeToChannel(
  channelId: string,
  onMessage: (msg: ChannelMessage) => void,
  onEose?: () => void
): () => void {
  return subscribeToEvents(
    [{ kinds: [9], '#h': [channelId] }],
    (event: NostrEvent) => {
      const msg = parseChannelMessage(event);
      if (msg) onMessage(msg);
    },
    onEose
  );
}

// ─── Fetch (one-shot) ─────────────────────────────────────────────────────────

/**
 * Fetch channel history (most recent 100 messages, oldest-first).
 */
export async function fetchChannelHistory(
  channelId: string,
  opts?: { since?: number; limit?: number }
): Promise<ChannelMessage[]> {
  const filter: Filter = {
    kinds: [9],
    '#h': [channelId],
    limit: opts?.limit ?? 100,
    ...(opts?.since !== undefined ? { since: opts.since } : {}),
  };

  const events = await fetchEvents([filter]);
  const msgs: ChannelMessage[] = [];

  for (const event of events) {
    const msg = parseChannelMessage(event);
    if (msg) msgs.push(msg);
  }

  return msgs.sort((a, b) => a.createdAt - b.createdAt);
}
