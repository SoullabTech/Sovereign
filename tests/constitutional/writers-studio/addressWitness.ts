/**
 * `OBSERVATION-ADDRESS-01 / A1` — REAL POSTGRESQL WITNESS.
 *
 * ⭐ Runs against a disposable PostgreSQL carrying the ACTUAL canonical schema
 * and the ACTUAL I1A validator, applied verbatim from the migration. ⛔ Not a
 * model of the durable shape — the durable shape itself.
 *
 * ⛔ Standing writes, UI, legacy backfill and deployment are all out of A1.
 */

import { readFileSync } from 'fs';
import { query } from '@/lib/db/postgres';
import {
  readingIdentityState, resolveObservationAddress, type ResolveOutcome,
} from '@/lib/manuscript/developmentalReading/observationAddress';

export interface Check { readonly id: string; readonly ok: boolean; readonly detail: string }

/* ── fixture ─────────────────────────────────────────────────────────────── */

const REF = [{ kind: 'section', sectionId: 's0' }];
const DNE = ['across-unread-span'];

const legacyObs = (i: number, text: string) => ({
  key: `o${i + 1}`, lens: 'development', evidenceRefs: REF,
  observation: text, doesNotEstablish: DNE, structureDependency: { kind: 'independent' },
});
const canonicalObs = (i: number, text: string, id: string, position: unknown = { sectionPosition: i, codePointStart: 0 }) => ({
  ...legacyObs(i, text),
  observationId: id, admissionIndex: i,
  basisFingerprint: 'a'.repeat(64), position,
});

export interface Seed {
  memberA: string; memberB: string;
  canonicalReading: string; legacyReading: string; mixedReading: string;
  duplicateReadingA: string; duplicateReadingB: string; foreignReading: string;
}

async function insertReading(memberId: string, manuscriptId: string, observations: unknown[]): Promise<string> {
  const r = await query<{ id: string }>(
    `INSERT INTO developmental_readings
       (manuscript_id, member_id, draft_id, revision_number, commissioned_lens, scope,
        read_state, coverage, input_fingerprint, outcome, observations,
        reader_provenance, classifier_provenance)
     VALUES ($1,$2,$3,1,'development',$4,$5,$6,$7,'reading',$8,$9,$10) RETURNING id`,
    [manuscriptId, memberId, manuscriptId,
     JSON.stringify({ commissionedLens: 'development', bodyScope: ['s0'], withStructure: false }),
     JSON.stringify({ draftId: manuscriptId, revisionNumber: 1, revisionDigest: 'd', sectionTopology: ['s0'], sections: {}, inputFingerprint: 'fp' }),
     JSON.stringify({ sections: { s0: 'body' } }), 'fp',
     JSON.stringify(observations),
     JSON.stringify({ provider: 'anthropic', model: 'm', promptHash: 'p', readerVersion: 'v' }),
     /* INV-0: outcome='reading' requires classifier provenance to be present. */
     JSON.stringify({ provider: 'anthropic', model: 'm', promptHash: 'p', classifierVersion: 'c' })]);
  return r.rows[0]!.id;
}

export async function seed(): Promise<Seed> {
  await query('TRUNCATE developmental_observation_standing_events, developmental_readings, member_manuscripts, members CASCADE');
  const a = (await query<{ id: string }>('INSERT INTO members DEFAULT VALUES RETURNING id')).rows[0]!.id;
  const b = (await query<{ id: string }>('INSERT INTO members DEFAULT VALUES RETURNING id')).rows[0]!.id;
  const ma = (await query<{ id: string }>('INSERT INTO member_manuscripts (member_id) VALUES ($1) RETURNING id', [a])).rows[0]!.id;
  const mb = (await query<{ id: string }>('INSERT INTO member_manuscripts (member_id) VALUES ($1) RETURNING id', [b])).rows[0]!.id;

  return {
    memberA: a, memberB: b,
    /* ⭐ position:null on o2 — a lawful structural-only observation. */
    canonicalReading: await insertReading(a, ma, [
      canonicalObs(0, 'canonical one', 'dobs_c1'),
      canonicalObs(1, 'canonical two', 'dobs_c2', null),
    ]),
    legacyReading: await insertReading(a, ma, [legacyObs(0, 'legacy one'), legacyObs(1, 'legacy two')]),
    /* ⚠️ MIXED: legacy first, canonical second — so a resolver that assumed
       identity implies ordinal 0, or that read the FIRST element, is wrong. */
    mixedReading: await insertReading(a, ma, [legacyObs(0, 'mixed legacy'), canonicalObs(1, 'mixed canonical', 'dobs_m1')]),
    duplicateReadingA: await insertReading(a, ma, [canonicalObs(0, 'dup here', 'dobs_dup')]),
    duplicateReadingB: await insertReading(a, ma, [canonicalObs(0, 'dup there', 'dobs_dup')]),
    /* ⛔ Member B's reading, carrying an identity member A will ask for. */
    foreignReading: await insertReading(b, mb, [canonicalObs(0, 'foreign', 'dobs_foreign')]),
  };
}

/* ── the battery ─────────────────────────────────────────────────────────── */

export type Resolver = (id: string, memberId: string) => Promise<ResolveOutcome>;

export async function runBattery(resolve: Resolver, s: Seed): Promise<readonly Check[]> {
  const out: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });

  const c1 = await resolve('dobs_c1', s.memberA);
  add('A1-canonical-match', c1.kind === 'resolved' && c1.address.observationKey === 'o1'
    && c1.address.readingId === s.canonicalReading,
    `canonical id resolves to ${c1.kind === 'resolved' ? c1.address.observationKey : c1.kind}`);

  const c2 = await resolve('dobs_c2', s.memberA);
  add('A1-position-null-resolves', c2.kind === 'resolved' && c2.address.observationKey === 'o2',
    `a structural-only observation (position null) still resolves: ${c2.kind}`);

  /* ⭐ THE DISCRIMINATOR FOR DERIVATION. In the mixed reading the canonical
     observation sits at admissionIndex 1, so its STORED key is o2. A resolver
     that reads the record returns o2; one that derives from ordinal position
     of the match, or assumes identity implies first place, returns o1. */
  const m1 = await resolve('dobs_m1', s.memberA);
  add('A1-mixed-population-reads-stored-key',
    m1.kind === 'resolved' && m1.address.observationKey === 'o2' && m1.address.admissionIndex === 1,
    `mixed reading resolves to the STORED key: ${m1.kind === 'resolved' ? m1.address.observationKey : m1.kind}`);

  /* ⭐ AD5 KILL. A basis fingerprint is a real, present value in the record.
     Offered as an identity it must resolve to NOTHING — the basis witnesses
     integrity, ⛔ it never identifies. Without this probe a resolver that
     matched on either field passed every other check. */
  const basisAsId = await resolve('a'.repeat(64), s.memberA);
  add('A1-basis-is-not-identity', basisAsId.kind === 'unknown',
    `a basisFingerprint offered as an identity → ${basisAsId.kind}`);

  const unknown = await resolve('dobs_nothing_here', s.memberA);
  add('A1-unknown-identity', unknown.kind === 'unknown', `unknown identity → ${unknown.kind}`);

  const dup = await resolve('dobs_dup', s.memberA);
  add('A1-duplicate-refused', dup.kind === 'ambiguous',
    `a duplicate identity is REFUSED, never arbitrated → ${dup.kind}`);

  /* ⛔ Member A asking for member B's identity must learn nothing. */
  const foreign = await resolve('dobs_foreign', s.memberA);
  add('A1-wrong-owner-not-resolved', foreign.kind === 'unknown',
    `a foreign reading's identity → ${foreign.kind} (⛔ never 'resolved', ⛔ never a distinct 'forbidden')`);

  const owned = await resolve('dobs_foreign', s.memberB);
  add('A1-owner-still-resolves', owned.kind === 'resolved',
    `the true owner resolves the same identity → ${owned.kind}`);

  /* ⛔ Never manufacture identity for a legacy observation. */
  const legacyProbe = await resolve('dobs_o1', s.memberA);
  add('A1-legacy-not-manufactured', legacyProbe.kind === 'unknown',
    `a plausible-looking id over a legacy population → ${legacyProbe.kind}`);

  return out;
}

export async function runPopulationChecks(s: Seed): Promise<readonly Check[]> {
  const st = async (id: string, m: string) => readingIdentityState(id, m);
  return [
    { id: 'A2-state-canonical', ok: (await st(s.canonicalReading, s.memberA)) === 'canonical', detail: 'all-identified reading reports canonical' },
    { id: 'A2-state-legacy', ok: (await st(s.legacyReading, s.memberA)) === 'legacy', detail: '⭐ a legacy reading is a lawful state, not missing data' },
    { id: 'A2-state-mixed', ok: (await st(s.mixedReading, s.memberA)) === 'mixed', detail: 'a mixed population is reported as mixed' },
    { id: 'A2-state-foreign-not-found', ok: (await st(s.foreignReading, s.memberA)) === 'not_found', detail: "another member's reading is not_found, ⛔ not 'legacy'" },
  ];
}

/** ⛔ A1 writes nothing. Proved at runtime AND statically. */
export async function runReadOnlyChecks(
  before: { readings: number; standing: number },
  /** ⭐ The source of the implementation UNDER TEST, so static laws bind it. */
  sourceUnderTest?: string,
): Promise<readonly Check[]> {
  const after = await counts();
  const src = (sourceUnderTest
    ?? readFileSync('lib/manuscript/developmentalReading/observationAddress.ts', 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  return [
    { id: 'A3-no-rows-written', ok: after.readings === before.readings && after.standing === before.standing,
      detail: `readings ${before.readings}→${after.readings}, standing ${before.standing}→${after.standing}` },
    { id: 'A3-no-mutating-sql-in-source', ok: !/\b(INSERT|UPDATE|DELETE|TRUNCATE)\b/i.test(src),
      detail: 'the implementation under test contains no mutating statement (comments stripped first)' },
    /* ⭐ The POSITIVE law, asserted only where the whole module is in view. */
    ...(sourceUnderTest === undefined
      ? [{ id: 'A3-resolver-reads-stored-key', ok: /o->>'key'/.test(src),
           detail: "the resolver SELECTs o->>'key' from the record" }]
      : []),
    { id: 'A3-standing-untouched', ok: after.standing === 0,
      detail: `standing events after the whole witness: ${after.standing}` },
    /* ⭐⭐ THE AD1 GUARD IS STATIC, AND IT HAS TO BE.
       The I1A validator enforces BOTH `admissionIndex = i - 1` AND
       `key = 'o' || i`, so on every state the database permits, deriving the
       key and reading it return the SAME STRING. ⛔ No behavioural probe can
       separate them, because there is no lawful row on which they differ.
       ⭐ The prohibition is therefore about what the code DEPENDS ON: a derived
       resolver silently couples itself to a validator invariant, and the day
       that invariant is relaxed it becomes wrong with no test failing.
       So the guard asserts the SOURCE reads the record. */
    /* ⚠️ TWO CHECKS, NOT ONE. A single check asserting BOTH "reads the stored
       key" AND "computes no address" fired as collateral on candidates that do
       not derive at all — their sliced source simply does not contain the
       shared SELECT, so the POSITIVE half failed for a reason that is an
       artifact of slicing rather than a property of the candidate.
       ⭐ A guard that kills for the wrong reason is not lethal, it is noisy. */
    { id: 'A3-computes-no-derived-address',
      ok: !/`o\$\{[^}]*\+\s*1[^}]*\}`/.test(src),
      detail: 'the implementation under test computes no `o${n+1}` address' },
  ];
}

export async function counts(): Promise<{ readings: number; standing: number }> {
  const r = await query<{ readings: string; standing: string }>(
    `SELECT (SELECT count(*) FROM developmental_readings)::text AS readings,
            (SELECT count(*) FROM developmental_observation_standing_events)::text AS standing`);
  return { readings: Number(r.rows[0]!.readings), standing: Number(r.rows[0]!.standing) };
}
