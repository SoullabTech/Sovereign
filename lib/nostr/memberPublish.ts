'use client';

/**
 * MEMBER PUBLISH
 *
 * Client-side sovereign publishing — signs and publishes Nostr events
 * using the member's local key. Private keys never leave the browser.
 *
 * This is sovereign expression, not social sharing.
 * Every publish is deliberate, consented, per-item.
 */

import { finalizeEvent } from 'nostr-tools';
import type { UnsignedEvent, Event } from 'nostr-tools';
import { loadPrivkey, hexToBytes } from './crypto';
import { publishEvent } from './client';
import { SOULLAB_RELAY_URL } from './utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PublishContentType = 'reflection' | 'journal' | 'field_note' | 'insight';

export type SignatureMode = 'member' | 'maia_delegation';

export interface PublishRequest {
  memberId: string;
  content: string;
  contentType: PublishContentType;
  signatureMode: SignatureMode;
  anonymous?: boolean;
  tags?: string[];
}

export interface PublishResult {
  eventId: string;
  pubkey: string;
  publishedAt: number;
  relayUrl: string;
  signatureMode: SignatureMode;
  contentType: PublishContentType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Content type → Nostr tag mapping
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT_TYPE_TAGS: Record<PublishContentType, string[][]> = {
  reflection: [['t', 'maia-reflection'], ['client', 'maia-sovereign']],
  journal: [['t', 'maia-journal'], ['client', 'maia-sovereign']],
  field_note: [['t', 'maia-field-note'], ['client', 'maia-sovereign']],
  insight: [['t', 'maia-insight'], ['client', 'maia-sovereign']],
};

// ─────────────────────────────────────────────────────────────────────────────
// Publish (client-side)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prepare, sign, and publish a Nostr event using the member's local key.
 * This runs entirely in the browser — the private key never leaves.
 */
export async function publishAsMember(request: PublishRequest): Promise<PublishResult> {
  const { memberId, content, contentType, anonymous, tags: extraTags } = request;

  // Load private key from localStorage
  const privkeyHex = loadPrivkey(memberId);
  if (!privkeyHex) {
    throw new Error('No Nostr identity found. Set up your identity in Settings first.');
  }

  const now = Math.floor(Date.now() / 1000);

  // Build tags
  const eventTags: string[][] = [
    ...CONTENT_TYPE_TAGS[contentType],
  ];

  if (extraTags?.length) {
    for (const t of extraTags) {
      eventTags.push(['t', t]);
    }
  }

  if (anonymous) {
    eventTags.push(['anon', 'true']);
  }

  // Build unsigned event
  const unsigned: UnsignedEvent = {
    kind: 1,
    created_at: now,
    content: content.trim(),
    tags: eventTags,
  };

  // Sign with member's local key
  const privkeyBytes = hexToBytes(privkeyHex);
  const signed: Event = finalizeEvent(unsigned, privkeyBytes);

  // Publish to relay
  await publishEvent(signed);

  return {
    eventId: signed.id,
    pubkey: signed.pubkey,
    publishedAt: now,
    relayUrl: SOULLAB_RELAY_URL,
    signatureMode: 'member',
    contentType,
  };
}
