/**
 * A1 — the seven address defeat candidates. Each is plausible, competent and
 * WRONG in exactly one way, and each must die on its named check.
 * ⛔ A surviving candidate repairs the SUITE, never the candidate.
 */

import { readFileSync } from 'fs';
import { query } from '@/lib/db/postgres';
import type { ResolveOutcome } from '@/lib/manuscript/developmentalReading/observationAddress';

export interface Candidate {
  readonly name: string;
  readonly resolve: (id: string, memberId: string) => Promise<ResolveOutcome>;
}

const rowsFor = async (id: string, memberId: string, scoped = true) =>
  (await query<{ reading_id: string; observation_key: string; admission_index: string }>(
    `SELECT r.id AS reading_id, o->>'key' AS observation_key, o->>'admissionIndex' AS admission_index
       FROM developmental_readings r, LATERAL jsonb_array_elements(r.observations) AS o
      WHERE ${scoped ? 'r.member_id = $2 AND' : '($2::uuid IS NOT NULL) AND'}
            o ? 'observationId' AND o->>'observationId' = $1`,
    [id, memberId])).rows;

/** ⭐ AD1 — DERIVES the key from admissionIndex instead of reading it.
 *  Passes on every well-formed row; ⛔ stops being a resolver. */
export const AD1_DERIVES_KEY: Candidate = {
  name: 'AD1_DERIVES_KEY',
  resolve: async (id, m) => {
    const rows = await rowsFor(id, m);
    if (rows.length === 0) return { kind: 'unknown' };
    if (rows.length > 1) return { kind: 'ambiguous', count: rows.length };
    const r = rows[0]!;
    const ai = Number.parseInt(r.admission_index, 10);
    /* ⛔ computed, never read */
    return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: `o${ai + 1}`, admissionIndex: ai } };
  },
};

/** AD2 — ignores member scope: resolves another member's reading. */
export const AD2_NO_MEMBER_SCOPE: Candidate = {
  name: 'AD2_NO_MEMBER_SCOPE',
  resolve: async (id, m) => {
    const rows = await rowsFor(id, m, false);
    if (rows.length === 0) return { kind: 'unknown' };
    if (rows.length > 1) return { kind: 'ambiguous', count: rows.length };
    const r = rows[0]!;
    return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: r.observation_key, admissionIndex: Number(r.admission_index) } };
  },
};

/** AD3 — picks the first match on duplicate instead of refusing. */
export const AD3_FIRST_WINS: Candidate = {
  name: 'AD3_FIRST_WINS',
  resolve: async (id, m) => {
    const rows = await rowsFor(id, m);
    if (rows.length === 0) return { kind: 'unknown' };
    const r = rows[0]!;
    return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: r.observation_key, admissionIndex: Number(r.admission_index) } };
  },
};

/** ⭐ AD4 — falls back to legacy ordinal when identity is unknown.
 *  MANUFACTURES an address for an observation that has no identity. */
export const AD4_LEGACY_ORDINAL_FALLBACK: Candidate = {
  name: 'AD4_LEGACY_ORDINAL_FALLBACK',
  resolve: async (id, m) => {
    const rows = await rowsFor(id, m);
    if (rows.length === 1) {
      const r = rows[0]!;
      return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: r.observation_key, admissionIndex: Number(r.admission_index) } };
    }
    if (rows.length > 1) return { kind: 'ambiguous', count: rows.length };
    const guess = /^dobs_o(\d+)$/.exec(id);
    if (guess) {
      const legacy = await query<{ id: string }>(
        `SELECT id FROM developmental_readings WHERE member_id = $1 ORDER BY frozen_at LIMIT 1`, [m]);
      if (legacy.rows[0]) return { kind: 'resolved', address: { readingId: legacy.rows[0].id, observationKey: `o${guess[1]}`, admissionIndex: Number(guess[1]) - 1 } };
    }
    return { kind: 'unknown' };
  },
};

/** AD5 — matches on basisFingerprint: identity via basis (the D2 family). */
export const AD5_BASIS_AS_IDENTITY: Candidate = {
  name: 'AD5_BASIS_AS_IDENTITY',
  resolve: async (id, m) => {
    const rows = (await query<{ reading_id: string; observation_key: string; admission_index: string }>(
      `SELECT r.id AS reading_id, o->>'key' AS observation_key, o->>'admissionIndex' AS admission_index
         FROM developmental_readings r, LATERAL jsonb_array_elements(r.observations) AS o
        WHERE r.member_id = $2 AND (o->>'basisFingerprint' = $1 OR o->>'observationId' = $1)`,
      [id, m])).rows;
    if (rows.length === 0) return { kind: 'unknown' };
    if (rows.length > 1) return { kind: 'ambiguous', count: rows.length };
    const r = rows[0]!;
    return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: r.observation_key, admissionIndex: Number(r.admission_index) } };
  },
};

/** ⭐ AD6 — treats a legacy reading as resolvable by position, giving a legacy
 *  observation an address it never had a canonical identity for. */
export const AD6_LEGACY_TREATED_AS_CANONICAL: Candidate = {
  name: 'AD6_LEGACY_TREATED_AS_CANONICAL',
  resolve: async (id, m) => {
    const rows = await rowsFor(id, m);
    if (rows.length === 1) {
      const r = rows[0]!;
      return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: r.observation_key, admissionIndex: Number(r.admission_index) } };
    }
    if (rows.length > 1) return { kind: 'ambiguous', count: rows.length };
    const any = await query<{ reading_id: string; observation_key: string }>(
      `SELECT r.id AS reading_id, o->>'key' AS observation_key
         FROM developmental_readings r, LATERAL jsonb_array_elements(r.observations) AS o
        WHERE r.member_id = $1 AND NOT (o ? 'observationId') LIMIT 1`, [m]);
    if (any.rows[0]) return { kind: 'resolved', address: { readingId: any.rows[0].reading_id, observationKey: any.rows[0].observation_key, admissionIndex: 0 } };
    return { kind: 'unknown' };
  },
};

/** ⛔ AD7 — writes standing while resolving. A1 is read-only. */
export const AD7_WRITES_STANDING: Candidate = {
  name: 'AD7_WRITES_STANDING',
  resolve: async (id, m) => {
    const rows = await rowsFor(id, m);
    if (rows.length === 0) return { kind: 'unknown' };
    if (rows.length > 1) return { kind: 'ambiguous', count: rows.length };
    const r = rows[0]!;
    await query(
      `INSERT INTO developmental_observation_standing_events (member_id, reading_id, observation_key, event_index, standing)
       VALUES ($1,$2,$3,0,'unresolved')`, [m, r.reading_id, r.observation_key]);
    return { kind: 'resolved', address: { readingId: r.reading_id, observationKey: r.observation_key, admissionIndex: Number(r.admission_index) } };
  },
};

export const CANDIDATES: readonly Candidate[] = [
  AD1_DERIVES_KEY, AD2_NO_MEMBER_SCOPE, AD3_FIRST_WINS, AD4_LEGACY_ORDINAL_FALLBACK,
  AD5_BASIS_AS_IDENTITY, AD6_LEGACY_TREATED_AS_CANONICAL, AD7_WRITES_STANDING,
];

/**
 * ⭐ Each candidate's OWN source, sliced from this real file — so a static law
 * can be applied to the implementation under test rather than to the reference.
 * ⛔ Not a declared flag: a candidate cannot lie about what it does by setting
 * a boolean, because this reads the code.
 */
export function sourceOf(name: string): string {
  const src = readFileSync('tests/constitutional/writers-studio/addressCandidates.ts', 'utf8');
  const start = src.indexOf(`export const ${name}`);
  if (start < 0) return '';
  const next = src.indexOf('\nexport const ', start + 1);
  return src.slice(start, next < 0 ? src.length : next);
}
