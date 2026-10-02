/**
 * `EDITORIAL-READING-01 / A2` — the falsifier suite.
 *
 * ⭐⭐ LETHALITY FIRST (`CONVERGENCE-TESTING-01 §0`, ratified): author the suite,
 * build a deliberately WRONG candidate per law, prove each dies — ⛔ a
 * surviving candidate repairs the SUITE, never the candidate.
 *
 * ⚠️ A suite written against a conforming implementation passes by construction
 * and proves nothing. Every law here has a named defeat candidate in
 * `candidates.ts`, and `matrix.ts` proves each one dead.
 *
 * ⛔ Each falsifier states a law the COMPOSER must obey. None of them tests
 * storage, runtime, prompt or UI — there is none, and A2 authorizes none.
 */

import {
  type AdmittedObservation, type AdmittedReading, type Composer,
  type CompositionContext, type NonConclusion, PERMANENT_NON_CONCLUSIONS,
} from './contract';

/* ── fixtures ───────────────────────────────────────────────────────────── */

const DIGEST_A = 'a'.repeat(64);
const DIGEST_B = 'b'.repeat(64);

export function obs(
  id: string, over: Partial<AdmittedObservation> = {},
): AdmittedObservation {
  return {
    observationId: id,
    admissionIndex: 0,
    doesNotEstablish: ['author-intent'],
    citedSectionIds: ['s1'],
    position: { sectionId: 's1', codePointStart: 10 },
    text: `claim ${id}`,
    ...over,
  };
}

export function reading(
  id: string, observations: readonly AdmittedObservation[],
  over: Partial<AdmittedReading> = {},
): AdmittedReading {
  return {
    readingId: id,
    manuscriptId: 'm1',
    commissionedLens: 'structure',
    revisionDigest: DIGEST_A,
    coverage: { s1: 'body', s2: 'body' },
    observations,
    ...over,
  };
}

export function ctx(over: Partial<CompositionContext> = {}): CompositionContext {
  return {
    readings: [reading('r1', [obs('dobs_1')])],
    structure: { revisionDigest: DIGEST_A, sectionIds: ['s1', 's2'] },
    ...over,
  };
}

/* ── the suite ──────────────────────────────────────────────────────────── */

export interface FalsifierResult { readonly pass: boolean; readonly detail: string }
export interface Falsifier {
  readonly id: string;
  readonly law: string;
  run(c: Composer): FalsifierResult;
}

const ok = (detail = ''): FalsifierResult => ({ pass: true, detail });
const no = (detail: string): FalsifierResult => ({ pass: false, detail });

export const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'ER-L1-single-revision-digest',
    law: 'Ruling 2 — all constituent readings share one exact revisionDigest; mixed digests REFUSE.',
    run(c) {
      const r = c(ctx({
        readings: [
          reading('r1', [obs('dobs_1')]),
          reading('r2', [obs('dobs_2')], { revisionDigest: DIGEST_B }),
        ],
      }));
      if (r.outcome !== 'refused') return no('composed across two revisionDigests');
      return r.refusal.code === 'MIXED_REVISION_DIGEST'
        ? ok() : no(`refused as ${r.refusal.code}`);
    },
  },
  {
    id: 'ER-L2-whole-work-warrant-requires-complete-body-coverage',
    law: 'A0 §IV — a whole-Work warrant requires body depth on EVERY authored section.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1')], { coverage: { s1: 'body', s2: 'position' } })],
      }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      return r.value.warrant.kind === 'covered-span'
        ? ok() : no('claimed whole-work warrant on partial body coverage');
    },
  },
  {
    id: 'ER-L3-warrant-never-from-prose',
    law: 'A0 §V — no prose or model intuition may substitute for the warrant predicate.',
    run(c) {
      const partial = { coverage: { s1: 'body', s2: 'position' } as const };
      const a = c(ctx({ readings: [reading('r1', [obs('dobs_1')], partial)] }));
      const b = c(ctx({
        readings: [reading('r1', [obs('dobs_1')], partial)],
        rawProse: 'the whole manuscript, in full, right here',
      }));
      if (a.outcome !== 'reading' || b.outcome !== 'reading') return no('unexpected refusal');
      return a.value.warrant.kind === b.value.warrant.kind
        ? ok() : no('prose changed the warrant');
    },
  },
  {
    id: 'ER-L4-non-conclusion-inheritance',
    law: 'A0 §VI — source non-conclusions flow upward into the synthesized claim.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1', { doesNotEstablish: ['chronology', 'author-intent'] })],
          { coverage: { s1: 'body', s2: 'position' } })],
      }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      const claim = r.value.claims[0];
      if (claim === undefined) return no('no claim emitted');
      const has = (n: NonConclusion) => claim.doesNotEstablish.includes(n);
      return has('chronology') && has('author-intent')
        ? ok() : no(`inherited ${JSON.stringify(claim.doesNotEstablish)}`);
    },
  },
  {
    id: 'ER-L5-permanent-non-conclusions-never-discharged',
    law: 'A0 §VI — author-intent, reader-effect and editorial-consequence are PERMANENT.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1', {
          doesNotEstablish: [...PERMANENT_NON_CONCLUSIONS, 'whole-work-pattern'],
        })])],
      }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      if (r.value.warrant.kind !== 'whole-work') return no('fixture did not earn whole-work warrant');
      const claim = r.value.claims[0];
      if (claim === undefined) return no('no claim emitted');
      const missing = PERMANENT_NON_CONCLUSIONS.filter((p) => !claim.doesNotEstablish.includes(p));
      return missing.length === 0 ? ok() : no(`discharged permanent: ${missing.join(',')}`);
    },
  },
  {
    id: 'ER-L6-dischargeable-only-under-whole-work',
    law: 'CONVERGENCE step 6 — coverage terms discharge only on complete body coverage.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1', { doesNotEstablish: ['whole-work-pattern'] })],
          { coverage: { s1: 'body', s2: 'position' } })],
      }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      const claim = r.value.claims[0];
      if (claim === undefined) return no('no claim emitted');
      return claim.doesNotEstablish.includes('whole-work-pattern')
        ? ok() : no('discharged whole-work-pattern without a whole-Work warrant');
    },
  },
  {
    id: 'ER-L7-ambiguous-observation-id-refused',
    law: 'Ruling 5 — duplicate observationId REFUSES; never dedupe, choose, merge or equate.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_dup')]), reading('r2', [obs('dobs_dup')])],
      }));
      if (r.outcome !== 'refused') return no('composed over an ambiguous identity');
      return r.refusal.code === 'AMBIGUOUS_OBSERVATION_ID'
        ? ok() : no(`refused as ${r.refusal.code}`);
    },
  },
  {
    id: 'ER-L8-identity-distinct-from-editorial-synthesis',
    law: 'Ruling 1 — EditorialReading is not, wraps not, aliases not editorialSynthesis.',
    run(c) {
      const r = c(ctx({ existingEditorialSynthesis: { thesis: 'THESIS FROM THE OTHER OBJECT' } }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      if (r.value.kind !== 'editorial-reading') return no(`kind is ${String(r.value.kind)}`);
      const leaked = r.value.claims.some((cl) => cl.text.includes('THESIS FROM THE OTHER OBJECT'));
      return leaked ? no('constructed from the existing editorialSynthesis') : ok();
    },
  },
  {
    id: 'ER-L9-provenance-retains-exact-identities',
    law: 'A0 §III — every claim names its exact constituent reading and observation.',
    run(c) {
      const r = c(ctx({ readings: [reading('r1', [obs('dobs_1'), obs('dobs_2')])] }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      for (const cl of r.value.claims) {
        if (cl.sources.length === 0) return no('a claim carries no source identity');
        for (const s of cl.sources) {
          if (!s.observationId.startsWith('dobs_')) return no(`source id ${s.observationId}`);
          if (s.readingId !== 'r1') return no(`source readingId ${s.readingId}`);
        }
      }
      return ok();
    },
  },
  {
    id: 'ER-L10-return-precision-never-fabricated',
    law: 'Ruling 4 — position null yields SECTION_RESOLVED · POSITION_UNRESOLVED.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1', { position: null, citedSectionIds: ['s2'] })])],
      }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      const claim = r.value.claims[0];
      if (claim === undefined) return no('no claim emitted');
      return claim.returnTo.kind === 'SECTION_RESOLVED_POSITION_UNRESOLVED'
        ? ok() : no(`fabricated ${claim.returnTo.kind}`);
    },
  },
  {
    id: 'ER-L11-evidence-not-suppressed',
    law: 'A0 §IX — every constituent observation stays reachable; compression never discards.',
    run(c) {
      const many = ['dobs_1', 'dobs_2', 'dobs_3', 'dobs_4', 'dobs_5'].map((i) => obs(i));
      const r = c(ctx({ readings: [reading('r1', many)] }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      const reach = new Set(r.value.constituentObservations.map((s) => s.observationId));
      const missing = many.filter((o) => !reach.has(o.observationId));
      return missing.length === 0
        ? ok() : no(`unreachable: ${missing.map((m) => m.observationId).join(',')}`);
    },
  },
  {
    id: 'ER-L12-refuse-never-repair-by-inference',
    law: 'A2 — unresolved required evidence REFUSES; it is never dropped and composed around.',
    run(c) {
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1', { citedSectionIds: ['s_gone'] })])],
      }));
      if (r.outcome !== 'refused') return no('composed around unresolved evidence');
      return r.refusal.code === 'UNRESOLVED_REQUIRED_EVIDENCE'
        ? ok() : no(`refused as ${r.refusal.code}`);
    },
  },
  {
    id: 'ER-L13-no-ranking',
    law: 'A0 §VIII — claims carry no severity, priority or consequentiality ordering.',
    run(c) {
      /* ⭐ The fixture must make a ranking VISIBLE: the observations differ in
         breadth of cited evidence, which is a signal a composer actually holds.
         Manuscript order here is dobs_1 (narrow) → dobs_2 (broad) → dobs_3, so
         any consequentiality sort reorders it. */
      const ordered = [
        obs('dobs_1', { citedSectionIds: ['s1'] }),
        obs('dobs_2', { citedSectionIds: ['s1', 's2', 's3'] }),
        obs('dobs_3', { citedSectionIds: ['s1', 's2'] }),
      ];
      const r = c(ctx({
        readings: [reading('r1', ordered)],
        structure: { revisionDigest: 'a'.repeat(64), sectionIds: ['s1', 's2', 's3'] },
      }));
      if (r.outcome !== 'reading') return no(`refused: ${r.refusal.code}`);
      const got = r.value.claims.flatMap((cl) => cl.sources.map((s) => s.observationId));
      const want = ordered.map((o) => o.observationId);
      return JSON.stringify(got) === JSON.stringify(want)
        ? ok() : no(`reordered to ${JSON.stringify(got)}`);
    },
  },
  {
    id: 'ER-L15-whole-work-commission-refuses-never-downgrades',
    law: 'A2R1 — a commissioned whole-Work reading whose predicate is unsatisfied REFUSES;'
      + ' it is never silently downgraded to covered-span and returned as fulfilled.',
    run(c) {
      const partial = { coverage: { s1: 'body', s2: 'position' } as const };
      /* ⭐ The SAME evidence, asked two different ways. Unrequested, a
         covered-span result is lawful; commissioned whole-work, it is a
         misrepresentation of what was earned. */
      const uncommissioned = c(ctx({ readings: [reading('r1', [obs('dobs_1')], partial)] }));
      if (uncommissioned.outcome !== 'reading') return no('lawful covered-span result was refused');
      if (uncommissioned.value.warrant.kind !== 'covered-span') return no('fixture did not yield covered-span');

      const commissioned = c(ctx({
        readings: [reading('r1', [obs('dobs_1')], partial)],
        commissionedWarrant: 'whole-work',
      }));
      if (commissioned.outcome !== 'refused') {
        return no(`commissioned whole-work returned a ${commissioned.value.warrant.kind} reading`);
      }
      return commissioned.refusal.code === 'INSUFFICIENT_WHOLE_WORK_COVERAGE'
        ? ok() : no(`refused as ${commissioned.refusal.code}`);
    },
  },
  {
    id: 'ER-L14-refusal-discloses-no-authored-text',
    law: 'A refusal is not an occasion to disclose — identities only, never prose.',
    run(c) {
      const secret = 'THE MEMBERS AUTHORED SENTENCE';
      const r = c(ctx({
        readings: [reading('r1', [obs('dobs_1', { citedSectionIds: ['s_gone'], text: secret })])],
        rawProse: secret,
      }));
      if (r.outcome !== 'refused') return no('did not refuse');
      const blob = JSON.stringify(r.refusal);
      return blob.includes(secret) ? no('refusal carried authored text') : ok();
    },
  },
];
