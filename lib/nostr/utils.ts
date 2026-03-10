/**
 * lib/nostr/utils.ts
 *
 * Formatting and validation helpers for Nostr events and identities.
 * Safe to import in both browser and Node.js environments.
 */

import { noteEncode } from 'nostr-tools/nip19';

// ─── Identity formatting ──────────────────────────────────────────────────────

/**
 * Truncate an npub for display: npub1abcd...wxyz
 */
export function truncateNpub(npub: string, chars = 8): string {
  if (npub.length <= chars * 2 + 5) return npub;
  return `${npub.slice(0, chars + 5)}...${npub.slice(-chars)}`;
}

/**
 * Format a Nostr event ID (hex) as bech32 note ID.
 */
export function formatEventId(hex: string): string {
  try {
    return noteEncode(hex);
  } catch {
    return hex.slice(0, 12) + '...';
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidPubkeyHex(hex: string): boolean {
  return /^[0-9a-f]{64}$/.test(hex);
}

export function isValidEventId(hex: string): boolean {
  return /^[0-9a-f]{64}$/.test(hex);
}

export function isNpub(str: string): boolean {
  return str.startsWith('npub1') && str.length === 63;
}

// ─── Event kind constants ─────────────────────────────────────────────────────

export const NOSTR_KINDS = {
  METADATA: 0,           // NIP-01: user metadata / profile
  TEXT_NOTE: 1,          // NIP-01: short text note (MAIA public reflections)
  DM: 4,                 // NIP-04: encrypted DM (legacy, avoid)
  GROUP_MSG: 9,          // NIP-29: group chat message
  GROUP_ADMIN: 9000,     // NIP-29: group admin event
  ENCRYPTED_DM: 1059,    // NIP-17: gift-wrapped private DM (Phase 2)
  SEAL: 13,              // NIP-59: sealed event wrapper (Phase 2)
  GIFT_WRAP: 1059,       // NIP-59: gift wrap
} as const;

// ─── Relay ───────────────────────────────────────────────────────────────────

export const SOULLAB_RELAY_URL = 'wss://nostr.soullab.life';
