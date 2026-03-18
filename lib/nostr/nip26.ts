/**
 * lib/nostr/nip26.ts
 *
 * Manual NIP-26 delegation implementation.
 * nostr-tools 2.x removed its nip26 module; we implement the spec directly.
 *
 * NIP-26 spec: https://github.com/nostr-protocol/nips/blob/master/26.md
 *
 * The delegation mechanism:
 *   1. Delegator (root) signs: sha256("nostr:delegation:{delegateePubkey}:{conditions}")
 *   2. Delegatee (service key) publishes events with a delegation tag
 *   3. Verifiers check the tag's signature against the root pubkey
 *
 * Safe to import in both server and browser contexts.
 */

import { schnorr } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Nip26Conditions {
  kinds?: number[];         // allowed event kinds
  since?: number;           // unix timestamp: events not before this
  until?: number;           // unix timestamp: events not after this
}

export interface DelegationTag {
  delegatorPubkey: string;  // root pubkey hex
  conditions: string;       // condition query string
  token: string;            // Schnorr sig hex (128 chars)
}

// ─── Condition string ─────────────────────────────────────────────────────────

/**
 * Build the NIP-26 condition query string.
 * Format: "kind=1&created_at>1700000000&created_at<1708000000"
 */
export function buildConditions(params: Nip26Conditions): string {
  const parts: string[] = [];
  if (params.kinds && params.kinds.length > 0) {
    // NIP-26 only supports a single kind per condition string
    // Use the first kind; to delegate multiple kinds, create multiple certs
    parts.push(`kind=${params.kinds[0]}`);
  }
  if (params.since !== undefined) parts.push(`created_at>${params.since}`);
  if (params.until !== undefined) parts.push(`created_at<${params.until}`);
  return parts.join('&');
}

// ─── Delegation string ────────────────────────────────────────────────────────

/**
 * Build the string that the root key must sign.
 * "nostr:delegation:{delegateePubkeyHex}:{conditionQuery}"
 */
export function buildDelegationString(delegateePubkeyHex: string, conditions: string): string {
  return `nostr:delegation:${delegateePubkeyHex}:${conditions}`;
}

// ─── Token creation (requires root privkey — run offline only) ────────────────

/**
 * Create a NIP-26 delegation token.
 * This requires the ROOT private key — call ONLY in the offline generation script.
 * NEVER call from the running application.
 *
 * @param rootPrivkeyBytes  Root private key as Uint8Array
 * @param delegateePubkeyHex  Hot service key pubkey (hex)
 * @param conditions  NIP-26 condition query string
 * @returns  Schnorr signature hex (128 chars)
 */
export function createDelegationToken(
  rootPrivkeyBytes: Uint8Array,
  delegateePubkeyHex: string,
  conditions: string
): string {
  const delegationString = buildDelegationString(delegateePubkeyHex, conditions);
  const hash = sha256(new TextEncoder().encode(delegationString));
  const sig = schnorr.sign(hash, rootPrivkeyBytes);
  return bytesToHex(sig);
}

// ─── Token verification ───────────────────────────────────────────────────────

/**
 * Verify a NIP-26 delegation token.
 * Used by relay write policy and receiving clients to validate MAIA events.
 */
export function verifyDelegationToken(
  rootPubkeyHex: string,
  delegateePubkeyHex: string,
  conditions: string,
  tokenHex: string
): boolean {
  try {
    const delegationString = buildDelegationString(delegateePubkeyHex, conditions);
    const hash = sha256(new TextEncoder().encode(delegationString));
    const sigBytes = hexToBytes(tokenHex);
    const pubkeyBytes = hexToBytes(rootPubkeyHex);
    return schnorr.verify(sigBytes, hash, pubkeyBytes);
  } catch {
    return false;
  }
}

// ─── Tag building ─────────────────────────────────────────────────────────────

/**
 * Build the NIP-26 delegation tag to include in a MAIA event.
 * ["delegation", delegatorPubkey, conditions, delegationToken]
 */
export function buildDelegationTag(
  rootPubkeyHex: string,
  conditions: string,
  delegationToken: string
): string[] {
  return ['delegation', rootPubkeyHex, conditions, delegationToken];
}

/**
 * Check that a delegation tag is currently valid (time + token).
 * Does NOT verify the event signature — call verifyDelegationToken separately.
 */
export function isDelegationTagValid(
  tag: string[],
  delegateePubkeyHex: string,
  eventKind: number,
  eventCreatedAt: number
): boolean {
  if (tag[0] !== 'delegation' || tag.length < 4) return false;
  const [, rootPubkeyHex, conditions, token] = tag;

  // Verify signature
  if (!verifyDelegationToken(rootPubkeyHex, delegateePubkeyHex, conditions, token)) return false;

  // Verify conditions are satisfied
  return conditionsSatisfied(conditions, eventKind, eventCreatedAt);
}

function conditionsSatisfied(conditions: string, kind: number, createdAt: number): boolean {
  for (const part of conditions.split('&')) {
    const kindMatch = part.match(/^kind=(\d+)$/);
    if (kindMatch && parseInt(kindMatch[1]) !== kind) return false;

    const sinceMatch = part.match(/^created_at>(\d+)$/);
    if (sinceMatch && createdAt <= parseInt(sinceMatch[1])) return false;

    const untilMatch = part.match(/^created_at<(\d+)$/);
    if (untilMatch && createdAt >= parseInt(untilMatch[1])) return false;
  }
  return true;
}

// ─── Hex helpers (local — avoid importing from 'use client' crypto.ts) ────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
