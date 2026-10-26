/**
 * WS-TIERS-R6 — independent WORM event-chain verification *research*.
 *
 * Hashes detect edits, gaps and truncation ONLY when the expected head
 * is freshly obtained from a separately trusted nonrollbackable authority.
 * This module does NOT make a mutable database or an S3 "latest" key WORM,
 * establish legal retention, or grant production Writer Pro access.
 */
import { createHash, timingSafeEqual } from 'node:crypto';

export const R20_CHAIN_GENESIS = '0'.repeat(64);
export const R20_CHAIN_PURPOSE = 'soullab.writer-beta.r20-event-chain.v1' as const;
export type R20ChainAction = 'issued' | 'accepted' | 'revoked';
export type R20ChainCore = Readonly<{
  version: 1;
  purpose: typeof R20_CHAIN_PURPOSE;
  sequence: number;
  grantId: string;
  subjectCommitment: string;
  action: R20ChainAction;
  occurredAtMs: number;
  previousHash: string;
}>;
export type R20ChainEvent = R20ChainCore & Readonly<{ eventHash: string }>;
export type R20TrustedHead = Readonly<{
  /** This head MUST be from independently protected, verified latest custody. */
  lastSequence: number;
  lastHash: string;
}>;
export type R20ChainResult = Readonly<{
  lastSequence: number;
  lastHash: string;
  seatsEverIssued: number;
  grants: ReadonlyArray<Readonly<{
    grantId: string;
    subjectCommitment: string;
    state: 'issued' | 'accepted' | 'revoked';
  }>>;
}>;

export class R20ChainRefused extends Error {
  constructor() {
    super('r20_immutable_chain_refused');
    this.name = 'R20ChainRefused';
  }
}
const CORE_KEYS = [
  'version', 'purpose', 'sequence', 'grantId', 'subjectCommitment',
  'action', 'occurredAtMs', 'previousHash',
] as const;

function exactKeys(value: object, expected: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === expected.length && actual.every((key) => expected.includes(key));
}
function hexHash(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}
function sameHash(first: string, second: string): boolean {
  const a = Buffer.from(first, 'hex');
  const b = Buffer.from(second, 'hex');
  return a.length === 32 && b.length === 32 && timingSafeEqual(a, b);
}
function validUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
}

/** Canonical data *only*. Never sign an entire untrusted JSON object. */
export function r20ChainHash(core: R20ChainCore): string {
  return createHash('sha256')
    .update('SOULLAB_WRITER_BETA_R20_EVENT_V1\n')
    .update(JSON.stringify(CORE_KEYS.map((key) => core[key])))
    .digest('hex');
}

/**
 * An independently witnessed head is a REQUIRED input, not a returned claim.
 * If the head is restored along with this event list, the earlier prefix
 * could pass. Never obtain it from Soullab DB, signer DB or a mutable alias.
 */
export function verifyR20AnchoredChain(
  events: readonly R20ChainEvent[],
  externallyVerifiedHead: R20TrustedHead,
  nowMs: number,
): R20ChainResult {
  try {
    if (!Array.isArray(events) || events.length === 0 || events.length > 2048
      || !externallyVerifiedHead || typeof externallyVerifiedHead !== 'object'
      || !exactKeys(externallyVerifiedHead, ['lastSequence', 'lastHash'])
      || !Number.isSafeInteger(externallyVerifiedHead.lastSequence)
      || externallyVerifiedHead.lastSequence !== events.length
      || !hexHash(externallyVerifiedHead.lastHash)
      || !Number.isSafeInteger(nowMs) || nowMs <= 0) {
      throw new R20ChainRefused();
    }

    const grants = new Map<string, {
      subjectCommitment: string;
      state: R20ChainAction;
    }>();
    let lastHash = R20_CHAIN_GENESIS;
    let lastAtMs = 0;
    let seatsEverIssued = 0;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event || typeof event !== 'object'
        || !exactKeys(event, [...CORE_KEYS, 'eventHash'])
        || event.version !== 1
        || event.purpose !== R20_CHAIN_PURPOSE
        || event.sequence !== i + 1
        || !validUuid(event.grantId)
        || !hexHash(event.subjectCommitment)
        || !['issued', 'accepted', 'revoked'].includes(event.action)
        || !Number.isSafeInteger(event.occurredAtMs)
        || event.occurredAtMs <= 0
        || event.occurredAtMs < lastAtMs
        || event.occurredAtMs > nowMs + 2000
        || !hexHash(event.previousHash)
        || !hexHash(event.eventHash)
        || !sameHash(event.previousHash, lastHash)
        || !sameHash(event.eventHash, r20ChainHash(event))) {
        throw new R20ChainRefused();
      }
      lastHash = event.eventHash;
      lastAtMs = event.occurredAtMs;
      const prior = grants.get(event.grantId);
      if (event.action === 'issued') {
        // A single writer cannot consume both first-canary seats under two
        // different grant IDs. Only distinct subject commitments are admitted.
        if (prior || seatsEverIssued >= 2
          || [...grants.values()].some(
            (existing) => existing.subjectCommitment === event.subjectCommitment,
          )) throw new R20ChainRefused();
        grants.set(event.grantId, {
          subjectCommitment: event.subjectCommitment,
          state: 'issued',
        });
        seatsEverIssued += 1;
      } else {
        if (!prior || prior.subjectCommitment !== event.subjectCommitment) {
          throw new R20ChainRefused();
        }
        if (event.action === 'accepted') {
          if (prior.state !== 'issued') throw new R20ChainRefused();
          prior.state = 'accepted';
        } else {
          if (prior.state === 'revoked') throw new R20ChainRefused();
          prior.state = 'revoked';
        }
      }
    }
    if (!sameHash(lastHash, externallyVerifiedHead.lastHash)) {
      throw new R20ChainRefused();
    }
    return Object.freeze({
      lastSequence: events.length,
      lastHash,
      seatsEverIssued,
      grants: Object.freeze([...grants.entries()].map(([grantId, value]) =>
        Object.freeze({ grantId, ...value }))),
    });
  } catch {
    throw new R20ChainRefused();
  }
}
