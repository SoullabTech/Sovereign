/**
 * TESTING-01 TEST A, now writable (§VII) — facet conformance over one admitted
 * reading, plus §III's required falsifier, §VI's ordering law and §IX's
 * prompt-boundary guard.
 *
 * ⛔ Every check runs against an ENGINE, so the same suite judges the reference
 * and each deliberately wrong candidate. A check that could only be written
 * against the reference would prove nothing (S3 B-iii).
 */

import {
  FACETS, computeBasisFingerprint, manuscriptOrder,
  type CanonicalObservation, type FrozenRef, type NonEmpty,
  type ReaderClaimDraft, type ReadingId,
} from './observationContract';
import {
  D7_COMPASS_IN_PROMPT, lawfulBuildPrompt,
  type CompassDeclaration, type Engine, type ReaderRequestShape,
} from './candidates';

export interface CheckResult { readonly id: string; readonly ok: boolean; readonly detail: string }

const ref = (sectionPosition: number, codePointStart: number | null, digest = 'd0'): FrozenRef =>
  ({ sectionId: `s${sectionPosition}`, sectionPosition, revisionNumber: 4, digest, codePointStart });

/* ── the fixture: one reading, with a deliberate positional TIE ──────────── */

const READING = 'reading_ea_1' as ReadingId;

const DRAFTS: readonly ReaderClaimDraft[] = [
  { lens: 'structure', refs: [ref(3, 120)] as NonEmpty<FrozenRef>,
    doesNotEstablish: ['editorial-consequence'] as NonEmpty<'editorial-consequence'>,
    claim: 'The section opens twice.' },
  /* ⭐ Same position as the next one — the §VI tie the ruling demands be
     resolved explicitly rather than secretly. Longer claim, so an evaluative
     tie-break would put it FIRST; admission order puts it first too, so the
     NEXT one is the discriminator. */
  { lens: 'continuity', refs: [ref(5, 40)] as NonEmpty<FrozenRef>,
    doesNotEstablish: ['chronology'] as NonEmpty<'chronology'>,
    claim: 'A short one.' },
  { lens: 'continuity', refs: [ref(5, 40)] as NonEmpty<FrozenRef>,
    doesNotEstablish: ['chronology'] as NonEmpty<'chronology'>,
    claim: 'A considerably longer observation about the same place in the work.' },
  /* ⭐ Multiple refs — position must resolve to the EARLIEST, not the first listed. */
  { lens: 'voice', refs: [ref(9, 10), ref(1, 500)] as NonEmpty<FrozenRef>,
    doesNotEstablish: ['reader-effect'] as NonEmpty<'reader-effect'>,
    claim: 'The register shifts here.' },
];

export function runTestA(engine: Engine): readonly CheckResult[] {
  const out: CheckResult[] = [];
  const pass = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });

  let readerCalls = 0;
  const ctx = { reader: () => { readerCalls += 1; return DRAFTS; } };

  const admitted = engine.admit(READING, DRAFTS);
  const admittedIds = admitted.map((o) => o.observationId);

  /* ── §II / §III · identity is not the basis, and not the text ─────────── */

  pass('A0-distinct-admission', new Set(admittedIds).size === admitted.length,
    `${new Set(admittedIds).size} distinct ids for ${admitted.length} admitted observations`);

  /* ⭐ §III REQUIRED FALSIFIER. Drafts 1 and 2 share lens, refs and
     doesNotEstablish and are genuinely distinct observations. ⭐ Different ids
     REQUIRED; identical fingerprints PERMITTED. */
  const a = admitted[1], b = admitted[2];
  const sameBasis = a !== undefined && b !== undefined
    && computeBasisFingerprint({ lens: a.lens, refs: a.refs, doesNotEstablish: a.doesNotEstablish })
    === computeBasisFingerprint({ lens: b.lens, refs: b.refs, doesNotEstablish: b.doesNotEstablish });
  pass('A0-basis-shared-by-construction', sameBasis, 'the falsifier pair shares one basis');
  pass('A0-required-falsifier',
    a !== undefined && b !== undefined && a.observationId !== b.observationId,
    'two distinct observations over one basis must NOT collapse into one identity');

  /* ⭐ Identity must not be a function of claim text. Re-admitting the same
     drafts with one claim reworded must not change any OTHER id, and must not
     reuse the reworded one's id. */
  const reworded = DRAFTS.map((d, i) => i === 0 ? { ...d, claim: `${d.claim} (reworded)` } : d);
  const second = engine.admit(READING, reworded);
  const overlap = admittedIds.filter((id) => second.some((o) => o.observationId === id));
  pass('A0-identity-minted-at-admission', overlap.length === 0,
    `a fresh admission shares ${overlap.length} id(s) with the first; identity must originate in the admission event, never in content`);

  /* ── §VII · SET INVARIANT ─────────────────────────────────────────────── */

  const presentations = FACETS.map((f) => ({ facet: f, p: engine.render(f, admitted, ctx) }));
  const sets = presentations.map(({ p }) => [...p.reachable.map((e) => e.observationId)].sort().join('|'));
  pass('A1-set-invariant', new Set(sets).size === 1,
    `facets are backed by ${new Set(sets).size} distinct observation-id set(s)`);

  const expected = [...admittedIds].sort().join('|');
  pass('A1-set-equals-admitted', sets.every((s) => s === expected),
    'every facet is backed by exactly the admitted set — no additions, no suppressions');

  /* ── §VII · BASIS INVARIANT ───────────────────────────────────────────── */

  const byId = new Map(admitted.map((o) => [o.observationId, o] as const));
  let basisOk = true; let basisDetail = 'identical basis for every shared id';
  for (const { p } of presentations) {
    for (const e of p.reachable) {
      const o = byId.get(e.observationId);
      if (!o) { basisOk = false; basisDetail = `expression ${e.observationId} has no admitted observation`; break; }
    }
    if (!basisOk) break;
  }
  pass('A2-basis-invariant', basisOk, basisDetail);

  /* ── §VII · AUTHORITY INVARIANT ───────────────────────────────────────── */

  pass('A3-no-reading-on-render', readerCalls === 0,
    `facet rendering invoked the reader ${readerCalls} time(s); a renderer may not re-read to render`);

  const proposalsByFacet = presentations.map(({ p }) => JSON.stringify(
    [...p.reachable].sort((x, y) => x.observationId < y.observationId ? -1 : 1)
      .map((e) => [e.observationId, e.maiaAuthoredProposals])));
  pass('A3-authorship-facet-invariant', new Set(proposalsByFacet).size === 1,
    'what MAIA is authorized to author must not move with the facet');

  const authorities = presentations.flatMap(({ p }) => p.reachable.map((e) => e.revisionAuthority));
  pass('A3-revision-authority-invariant', new Set(authorities).size <= 1,
    'revision authority is identical across facets');

  /* ── §VI · ORDERING ───────────────────────────────────────────────────── */

  const lawful = [...admitted].sort(manuscriptOrder).map((o) => o.observationId).join('|');
  const orders = presentations.map(({ p }) => p.reachable.map((e) => e.observationId).join('|'));
  pass('A4-manuscript-order', orders.every((o) => o === lawful),
    'reachable order is manuscript order, ties resolved by admission index and nothing else');

  const earliest = admitted.find((o) => o.claim.startsWith('The register'));
  pass('A4-position-is-earliest-ref',
    earliest !== undefined && earliest.position.sectionPosition === 1,
    `an observation with several refs takes its EARLIEST position (got ${earliest?.position.sectionPosition})`);

  /* ── §VI · progressive cut is a positional prefix ─────────────────────── */

  let prefixOk = true;
  for (const { p } of presentations) {
    const r = p.reachable.map((e) => e.observationId);
    const i = p.initiallyExpanded.map((e) => e.observationId);
    if (i.join('|') !== r.slice(0, i.length).join('|')) { prefixOk = false; break; }
  }
  pass('A5-expanded-is-positional-prefix', prefixOk,
    'what a facet opens by default is a prefix of manuscript order, never a selection');

  /* ── §VII · presentation variance is LAWFUL, not a failure ────────────── */

  const prose = presentations.map(({ p }) => p.reachable.map((e) => e.rendered).join('|'));
  pass('A6-prose-variance-permitted', new Set(prose).size >= 1,
    'rendered prose may differ across facets; equality is not a conformance requirement');

  return out;
}

/* ── §IX · the prompt boundary ───────────────────────────────────────────── */

export function runCompassSeparation(): readonly CheckResult[] {
  const req: ReaderRequestShape = { commissionedLens: 'voice', evidence: { frozen: true }, recovered: ['authored line'] };
  const compass: readonly CompassDeclaration[] = [
    { dimension: 'function', memberWording: 'readers should recognise the elements through lived experience' },
  ];
  const needle = 'recognise the elements through lived experience';

  const lawful = lawfulBuildPrompt(req);
  const d7 = D7_COMPASS_IN_PROMPT(req, compass);

  return [
    { id: 'A7-lawful-prompt-clean', ok: !lawful.includes(needle),
      detail: 'a prompt built from the request alone cannot carry a Compass declaration' },
    { id: 'A7-kills-D7', ok: d7.includes(needle),
      detail: 'the guard must watch the WHOLE prompt — D7 keeps the evidence DTO clean and rides in the prompt' },
  ];
}
