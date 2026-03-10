/**
 * lib/nostr/crypto.ts
 *
 * Client-side Nostr cryptography.
 * Private keys NEVER leave this module to the server — all signing and
 * encryption happens in the browser or native app.
 */

'use client';

import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools';
import { npubEncode, nsecEncode } from 'nostr-tools/nip19';
import * as nip44 from 'nostr-tools/nip44';
import type { UnsignedEvent } from 'nostr-tools';

// ─── Hex helpers ─────────────────────────────────────────────────────────────

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function isValidPubkeyHex(hex: string): boolean {
  return /^[0-9a-f]{64}$/.test(hex);
}

// ─── Key generation ───────────────────────────────────────────────────────────

export interface NostrKeypair {
  privkeyHex: string;
  pubkeyHex: string;
  npub: string;
  nsec: string;
}

/**
 * Generate a new Nostr keypair in the browser.
 * Returns hex strings (for storage) and bech32 encodings (for display).
 */
export function generateKeypair(): NostrKeypair {
  const secretKey = generateSecretKey();       // Uint8Array
  const pubkeyHex = getPublicKey(secretKey);   // hex string
  const privkeyHex = bytesToHex(secretKey);

  return {
    privkeyHex,
    pubkeyHex,
    npub: npubEncode(pubkeyHex),
    nsec: nsecEncode(secretKey),
  };
}

/**
 * Derive the public key from a stored hex private key.
 */
export function pubkeyFromPrivkeyHex(privkeyHex: string): string {
  return getPublicKey(hexToBytes(privkeyHex));
}

/**
 * Convert a hex pubkey to npub bech32 format.
 */
export function npubFromHex(pubkeyHex: string): string {
  return npubEncode(pubkeyHex);
}

/**
 * Convert a hex privkey to nsec bech32 format.
 */
export function nsecFromHex(privkeyHex: string): string {
  return nsecEncode(hexToBytes(privkeyHex));
}

// ─── Event signing ────────────────────────────────────────────────────────────

/**
 * Sign a Nostr event with the member's private key.
 * Returns the fully signed event ready to publish.
 */
export function signEvent(
  template: UnsignedEvent,
  privkeyHex: string
) {
  return finalizeEvent(template, hexToBytes(privkeyHex));
}

// ─── NIP-44 Encryption ────────────────────────────────────────────────────────

/**
 * Encrypt a message for a recipient (NIP-44, v2).
 * Used for private DMs and practitioner/client exchanges.
 */
export function encryptMessage(
  senderPrivkeyHex: string,
  recipientPubkeyHex: string,
  plaintext: string
): string {
  const conversationKey = nip44.getConversationKey(
    hexToBytes(senderPrivkeyHex),
    recipientPubkeyHex
  );
  return nip44.encrypt(plaintext, conversationKey);
}

/**
 * Decrypt a message from a sender (NIP-44, v2).
 */
export function decryptMessage(
  recipientPrivkeyHex: string,
  senderPubkeyHex: string,
  ciphertext: string
): string {
  const conversationKey = nip44.getConversationKey(
    hexToBytes(recipientPrivkeyHex),
    senderPubkeyHex
  );
  return nip44.decrypt(ciphertext, conversationKey);
}

// ─── Local key storage ────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'nostr_privkey_';

/**
 * Store private key in localStorage under a member-scoped key.
 * Never sent to the server.
 */
export function storePrivkey(memberId: string, privkeyHex: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${memberId}`, privkeyHex);
}

/**
 * Load private key from localStorage.
 * Returns null if not found.
 */
export function loadPrivkey(memberId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${memberId}`);
}

/**
 * Remove private key from localStorage (for identity reset).
 */
export function clearPrivkey(memberId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${memberId}`);
}
