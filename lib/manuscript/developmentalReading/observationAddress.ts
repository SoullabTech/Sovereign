/**
 * `WRITERS-STUDIO-OBSERVATION-ADDRESS-01 / A1` — the read-only resolver.
 *
 *      observationId → member-owned frozen reading → exact canonical
 *      observation → STORED observationKey
 *
 * ⭐ The Observation Address Law, in one object: `observationId` answers WHICH
 * ADMITTED OBSERVATION THIS IS; `(readingId, observationKey)` answers WHERE IT
 * IS ADDRESSED IN THIS FROZEN READING. This resolves the first to the second.
 * ⛔ It does not make them interchangeable, and ⛔ it does not touch standing.
 *
 * ⛔⛔ TWO PROHIBITIONS, AND THE FIRST IS THE ONE A COMPETENT IMPLEMENTATION
 * BREAKS BY ACCIDENT:
 *
 *   ⛔ NEVER DERIVE THE ADDRESS. The I1A validator enforces
 *      `admissionIndex = i - 1` and `key = 'o' || i`, so `key` is *computable*
 *      from `admissionIndex`. ⭐ Computing it would pass every test on
 *      well-formed data and would silently stop being a RESOLVER — it would be
 *      a formula that never reads the record. The stored `key` is the answer;
 *      this module returns what the frozen reading says, or nothing.
 *
 *   ⛔ NEVER MANUFACTURE IDENTITY. A legacy observation has no canonical
 *      identity, and A1 does not give it one. ⛔ No backfill, ⛔ no fallback to
 *      ordinal position, ⛔ no derivation from basis.
 *
 * ⚠️ WHAT THE DATABASE DOES NOT GUARANTEE. The I1A validator refuses a PARTIAL
 * identity group (0 or 4, never 1–3) — but it enforces ⛔ NO UNIQUENESS on
 * `observationId`, within a reading or across them. ⭐ So a duplicate identity
 * is REPRESENTABLE IN THE DURABLE RECORD, and this resolver must detect it
 * rather than assume it away. It refuses; ⛔ it never picks one.
 *
 * ⛔ READ-ONLY. No INSERT, UPDATE or DELETE appears in this file, and a guard
 * asserts that.
 */

import { query } from '@/lib/db/postgres';

/** The canonical identity, as the durable record spells it (I1A: `^dobs_.+$`). */
export type ObservationIdInput = string;

export interface ObservationAddress {
  readonly readingId: string;
  /** ⭐ READ FROM THE RECORD. ⛔ Never computed from `admissionIndex`. */
  readonly observationKey: string;
  /** Carried for the caller's own 1:1 assertion; ⛔ not used to derive the key. */
  readonly admissionIndex: number;
}

export type ResolveOutcome =
  /** Exactly one canonical observation in this member's readings carries it. */
  | { readonly kind: 'resolved'; readonly address: ObservationAddress }
  /**
   * ⭐ No canonical observation of this member carries this identity.
   * ⛔ Deliberately NOT split into "wrong owner" vs "does not exist": telling a
   * caller that an identity exists under a different member would disclose the
   * existence of another member's reading. A refusal is not an occasion to
   * disclose.
   */
  | { readonly kind: 'unknown' }
  /**
   * ⚠️ More than one canonical observation carries it. ⛔ REFUSED, never
   * arbitrated — the record is ambiguous and picking a winner would invent an
   * answer the data does not contain.
   */
  | { readonly kind: 'ambiguous'; readonly count: number };

/**
 * ⭐ Member scope is in the PREDICATE, not a post-filter — a foreign reading
 * never produces a row to choose from, so there is nothing to accidentally
 * return. (The claim-in-the-mutation discipline, applied to a read.)
 */
export async function resolveObservationAddress(
  observationId: ObservationIdInput,
  memberId: string,
): Promise<ResolveOutcome> {
  /* ⛔ An identity the durable shape cannot hold matches nothing, and is
     answered without a query rather than by a scan that would find nothing. */
  if (typeof observationId !== 'string' || !/^dobs_.+$/.test(observationId)) {
    return { kind: 'unknown' };
  }

  const rows = await query<{ reading_id: string; observation_key: string; admission_index: string }>(
    `SELECT r.id AS reading_id,
            o->>'key'            AS observation_key,
            o->>'admissionIndex' AS admission_index
       FROM developmental_readings r,
            LATERAL jsonb_array_elements(r.observations) AS o
      WHERE r.member_id = $2
        AND o ? 'observationId'
        AND o->>'observationId' = $1`,
    [observationId, memberId],
  );

  if (rows.rows.length === 0) return { kind: 'unknown' };
  if (rows.rows.length > 1) return { kind: 'ambiguous', count: rows.rows.length };

  const row = rows.rows[0]!;
  return {
    kind: 'resolved',
    address: {
      readingId: row.reading_id,
      observationKey: row.observation_key,
      admissionIndex: Number.parseInt(row.admission_index, 10),
    },
  };
}

/**
 * ⭐ The population state of one reading, as a first-class observable fact.
 *
 * ⚠️ `legacy` is NOT an error and NOT missing data: production carries 21
 * readings and 245 observations, all lawfully legacy. A legacy reading simply
 * predates canonical identity, and ⛔ A1 does not give it one.
 */
export type ReadingIdentityState = 'canonical' | 'legacy' | 'mixed' | 'not_found';

export async function readingIdentityState(
  readingId: string,
  memberId: string,
): Promise<ReadingIdentityState> {
  const rows = await query<{ total: string; identified: string }>(
    `SELECT count(*)::text AS total,
            count(*) FILTER (WHERE o ? 'observationId')::text AS identified
       FROM developmental_readings r,
            LATERAL jsonb_array_elements(r.observations) AS o
      WHERE r.id = $1 AND r.member_id = $2`,
    [readingId, memberId],
  );
  const row = rows.rows[0];
  if (row === undefined || row.total === '0') return 'not_found';
  const total = Number.parseInt(row.total, 10);
  const identified = Number.parseInt(row.identified, 10);
  if (identified === 0) return 'legacy';
  if (identified === total) return 'canonical';
  return 'mixed';
}
