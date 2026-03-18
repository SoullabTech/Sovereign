/**
 * lib/nostr/dm.ts
 *
 * NIP-17 Private Direct Messages — gift-wrapped, end-to-end encrypted.
 *
 * Protocol:
 *   Send:  wrapManyEvents() → kind 1059 gift wraps (one per recipient + self copy)
 *   Fetch: subscribeToEvents(kind 1059, #p: [myPubkey]) + unwrapEvent() per event
 *
 * Privacy model:
 *   • Message content encrypted with NIP-44 (sender ⟶ recipient conversationKey)
 *   • Seal (kind 13) hides sender identity in transit
 *   • Gift wrap (kind 1059) uses an ephemeral random key → nobody learns who messaged whom
 *   • Private key NEVER leaves the browser; all crypto happens here (client-side only)
 *
 * This module is client-only. Never import in server/API routes.
 */

'use client';

import { wrapManyEvents, unwrapEvent } from 'nostr-tools/nip17';
import type { NostrEvent, Filter } from 'nostr-tools';
import { hexToBytes } from './crypto';
import { publishEvent, subscribeToEvents, fetchEvents } from './client';
import { SOULLAB_RELAY_URL } from './utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DecryptedDM {
  /** Gift wrap event ID — used for deduplication */
  id: string;
  senderPubkey: string;
  recipientPubkey: string;
  content: string;
  /** Actual send timestamp (from the inner rumor's created_at) */
  createdAt: number;
  /** Gift wrap timestamp (slightly randomised by NIP-59 for metadata privacy) */
  wrapCreatedAt: number;
}

// ─── Send ──────────────────────────────────────────────────────────────────────

/**
 * Send a NIP-17 gift-wrapped DM.
 *
 * Creates two gift wraps: one addressed to the recipient, one to ourselves
 * so we can see sent messages when fetching our own #p events.
 */
export async function sendDM(
  senderPrivkeyHex: string,
  senderPubkeyHex: string,
  recipientPubkeyHex: string,
  message: string
): Promise<void> {
  const senderPrivkey = hexToBytes(senderPrivkeyHex);

  const wraps = wrapManyEvents(
    senderPrivkey,
    [
      { publicKey: recipientPubkeyHex, relayUrl: SOULLAB_RELAY_URL },
      // Self-copy so the sender can read their own sent messages
      { publicKey: senderPubkeyHex, relayUrl: SOULLAB_RELAY_URL },
    ],
    message
  );

  // Publish both gift wraps (recipient copy + self copy)
  await Promise.all(wraps.map(publishEvent));
}

// ─── Decrypt ──────────────────────────────────────────────────────────────────

/**
 * Attempt to decrypt a single kind 1059 gift-wrap event.
 * Returns null if decryption fails (event is not for us or is malformed).
 */
export function decryptGiftWrap(
  event: NostrEvent,
  recipientPrivkeyHex: string,
  myPubkeyHex: string
): DecryptedDM | null {
  try {
    const rumor = unwrapEvent(event, hexToBytes(recipientPrivkeyHex));

    // Only handle kind 14 DM content events
    if (rumor.kind !== 14) return null;

    const recipientTag = rumor.tags.find(t => t[0] === 'p');
    const recipientPubkey = recipientTag?.[1] ?? myPubkeyHex;

    return {
      id: event.id,
      senderPubkey: rumor.pubkey,
      recipientPubkey,
      content: rumor.content,
      createdAt: rumor.created_at,
      wrapCreatedAt: event.created_at,
    };
  } catch {
    // Decryption failed — event may be from a different keypair or malformed
    return null;
  }
}

// ─── Peer resolution ──────────────────────────────────────────────────────────

/**
 * Given a DM, return the "other party" relative to myPubkeyHex.
 * For sent messages (senderPubkey === mine) → the recipient.
 * For received messages → the sender.
 */
export function getDMPeer(dm: DecryptedDM, myPubkeyHex: string): string {
  return dm.senderPubkey === myPubkeyHex ? dm.recipientPubkey : dm.senderPubkey;
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

/**
 * Subscribe to all gift-wrapped DMs (incoming + sent self-copies).
 * Decrypts each event and calls onMessage with the result.
 * Returns an unsubscribe function.
 */
export function subscribeToDMs(
  privkeyHex: string,
  pubkeyHex: string,
  onMessage: (dm: DecryptedDM) => void,
  onEose?: () => void
): () => void {
  return subscribeToEvents(
    [{ kinds: [1059], '#p': [pubkeyHex] }],
    (event: NostrEvent) => {
      const dm = decryptGiftWrap(event, privkeyHex, pubkeyHex);
      if (dm) onMessage(dm);
    },
    onEose
  );
}

// ─── Fetch (one-shot) ─────────────────────────────────────────────────────────

/**
 * Fetch all gift-wrapped DMs for a member from the relay (one-shot).
 * Returns decrypted messages sorted oldest-first.
 */
export async function fetchAllDMs(
  privkeyHex: string,
  pubkeyHex: string,
  since?: number
): Promise<DecryptedDM[]> {
  const filter: Filter = {
    kinds: [1059],
    '#p': [pubkeyHex],
    ...(since !== undefined ? { since } : {}),
  };

  const events = await fetchEvents([filter]);
  const dms: DecryptedDM[] = [];

  for (const event of events) {
    const dm = decryptGiftWrap(event, privkeyHex, pubkeyHex);
    if (dm) dms.push(dm);
  }

  // Oldest first for display
  return dms.sort((a, b) => a.createdAt - b.createdAt);
}

// ─── Thread grouping ──────────────────────────────────────────────────────────

/**
 * Group DMs by peer pubkey.
 * Returns Map<peerPubkeyHex, DecryptedDM[]> with messages sorted oldest-first.
 */
export function groupDMsByPeer(
  dms: DecryptedDM[],
  myPubkeyHex: string
): Map<string, DecryptedDM[]> {
  const threads = new Map<string, DecryptedDM[]>();

  for (const dm of dms) {
    const peer = getDMPeer(dm, myPubkeyHex);
    if (!peer) continue;
    const list = threads.get(peer) ?? [];
    list.push(dm);
    threads.set(peer, list);
  }

  return threads;
}
