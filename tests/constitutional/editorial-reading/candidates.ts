/**
 * `EDITORIAL-READING-01 / A2` — defeat candidates.
 *
 * ⭐ Fourteen deliberately WRONG composers, each the smallest competent
 * embodiment of one named constitutional error. ⛔ Disposable: none is a seed,
 * none is an implementation, none may be copied forward.
 *
 * ⚠️ LETHALITY IS DECISION-LEVEL, ⛔ NOT IMPLEMENTATION-INDEPENDENT. Every
 * candidate replaces exactly ONE decision on an identical substrate
 * (`buildComposer`). Fourteen standalone implementations would yield
 * unclassified collateral and WEAKER evidence, so the narrower claim is
 * deliberate — the `REVIEW-CUSTODY-01 / STEP 1` discipline, carried forward.
 *
 * ⭐ Some candidates kill more than their named law. That is CLASSIFIED
 * collateral where declared: a candidate narrowed until it kills only one
 * falsifier would no longer be the error it models.
 */

import {
  type AdmittedObservation, type Composer, type CompositionContext,
  type CompositionOutcome, type EditorialClaim, type NonConclusion, type SourceRef,
  type Warrant, COVERAGE_DISCHARGEABLE, EDITORIAL_READING_KIND,
  PERMANENT_NON_CONCLUSIONS, commissionRefusal, deriveWarrant, identityRefusal,
  returnPrecisionOf, revisionRefusal,
} from './contract';

interface Decisions {
  /** L1 */ readonly tolerateMixedDigest?: boolean;
  /** L2 */ readonly wholeWorkOnPartial?: boolean;
  /** L3 */ readonly warrantFromProse?: boolean;
  /** L4 */ readonly dropInheritance?: boolean;
  /** L5 */ readonly dischargePermanent?: boolean;
  /** L6 */ readonly dischargeAlways?: boolean;
  /** L7 */ readonly dedupeIdentity?: boolean;
  /** L8 */ readonly aliasSynthesis?: boolean;
  /** L9 */ readonly provenanceAsCount?: boolean;
  /** L10 */ readonly fabricatePosition?: boolean;
  /** L11 */ readonly suppressEvidence?: boolean;
  /** L12 */ readonly repairByInference?: boolean;
  /** L13 */ readonly rankClaims?: boolean;
  /** L14 */ readonly discloseInRefusal?: boolean;
  /** L15 */ readonly downgradeOnWholeWorkCommission?: boolean;
}

function inherit(
  sources: readonly AdmittedObservation[], warrant: Warrant, d: Decisions,
): readonly NonConclusion[] {
  if (d.dropInheritance) return [];
  const union = new Set<NonConclusion>();
  for (const s of sources) for (const n of s.doesNotEstablish) union.add(n);
  if (warrant.kind === 'whole-work' || d.dischargeAlways) {
    for (const x of COVERAGE_DISCHARGEABLE) union.delete(x);
  }
  if (d.dischargePermanent && warrant.kind === 'whole-work') {
    for (const p of PERMANENT_NON_CONCLUSIONS) union.delete(p);
  } else {
    for (const p of PERMANENT_NON_CONCLUSIONS) {
      if (sources.some((s) => s.doesNotEstablish.includes(p))) union.add(p);
    }
  }
  return [...union].sort();
}

export function buildComposer(d: Decisions): Composer {
  return (ctx: CompositionContext): CompositionOutcome => {
    if (ctx.readings.length === 0) {
      return { outcome: 'refused', refusal: { code: 'NO_ADMITTED_INPUT', offending: [] } };
    }
    if (!d.tolerateMixedDigest) {
      const rev = revisionRefusal(ctx);
      if (rev) return { outcome: 'refused', refusal: rev };
    }
    let readings = ctx.readings;
    if (d.dedupeIdentity) {
      const seen = new Set<string>();
      readings = readings.map((r) => ({
        ...r,
        observations: r.observations.filter((o) => {
          if (seen.has(o.observationId)) return false;
          seen.add(o.observationId);
          return true;
        }),
      }));
    } else {
      const ident = identityRefusal(ctx);
      if (ident) return { outcome: 'refused', refusal: ident };
    }

    const known = new Set(ctx.structure.sectionIds);
    const unresolved = new Set<string>();
    for (const r of readings) {
      for (const o of r.observations) {
        for (const s of o.citedSectionIds) if (!known.has(s)) unresolved.add(o.observationId);
      }
    }
    if (unresolved.size > 0) {
      if (d.repairByInference) {
        readings = readings.map((r) => ({
          ...r,
          observations: r.observations.filter((o) => !unresolved.has(o.observationId)),
        }));
      } else {
        const offending = d.discloseInRefusal
          ? [...unresolved, ...readings.flatMap((r) => r.observations.map((o) => o.text))]
          : [...unresolved].sort();
        return { outcome: 'refused', refusal: { code: 'UNRESOLVED_REQUIRED_EVIDENCE', offending } };
      }
    }

    let warrant = deriveWarrant({ ...ctx, readings });
    if (d.wholeWorkOnPartial || (d.warrantFromProse && ctx.rawProse !== undefined)) {
      warrant = { kind: 'whole-work', revisionDigest: ctx.structure.revisionDigest };
    }
    if (!d.downgradeOnWholeWorkCommission) {
      const commission = commissionRefusal({ ...ctx, readings }, warrant);
      if (commission) return { outcome: 'refused', refusal: commission };
    }

    const claims: EditorialClaim[] = [];
    const ranked: { readonly claim: EditorialClaim; readonly weight: number }[] = [];
    const all: SourceRef[] = [];
    for (const r of readings) {
      for (const o of r.observations) {
        all.push({ readingId: r.readingId, observationId: o.observationId });
        const rt = d.fabricatePosition && o.position === null
          ? {
            kind: 'SECTION_AND_POSITION' as const,
            sectionId: o.citedSectionIds[0] ?? 'unknown',
            codePointStart: 0,
          }
          : returnPrecisionOf(o);
        const claim: EditorialClaim = {
          text: d.aliasSynthesis && ctx.existingEditorialSynthesis !== undefined
            ? ctx.existingEditorialSynthesis.thesis : '',
          scope: warrant.kind,
          doesNotEstablish: inherit([o], warrant, d),
          sources: d.provenanceAsCount ? [] : [{ readingId: r.readingId, observationId: o.observationId }],
          returnTo: rt,
        };
        claims.push(claim);
        /* ⚠️ The consequentiality heuristic, applied to data a composer really
           has: breadth of cited evidence. An earlier version of this candidate
           ranked on `claim.text`, which a conforming composer always empties —
           so it could not exhibit its own error and SURVIVED. The matrix caught
           an unfalsifiable law, not a wrong implementation. */
        ranked.push({ claim, weight: o.citedSectionIds.length });
      }
    }
    if (d.rankClaims) {
      const order = [...ranked].sort((x, y) => y.weight - x.weight).map((e) => e.claim);
      claims.length = 0;
      claims.push(...order);
    }
    const emitted = d.suppressEvidence ? all.slice(0, 2) : all;
    const first = readings[0];
    if (first === undefined) {
      return { outcome: 'refused', refusal: { code: 'NO_ADMITTED_INPUT', offending: [] } };
    }
    return {
      outcome: 'reading',
      value: {
        kind: EDITORIAL_READING_KIND,
        manuscriptId: first.manuscriptId,
        revisionDigest: ctx.structure.revisionDigest,
        warrant,
        claims,
        constituentObservations: emitted,
        constituentReadingIds: readings.map((r) => r.readingId),
      },
    };
  };
}

export interface DefeatCandidate {
  readonly id: string;
  readonly targets: string;
  readonly error: string;
  readonly composer: Composer;
  /** Declared collateral, with the reason further narrowing would destroy the model. */
  readonly classifiedCollateral?: Readonly<Record<string, string>>;
}

export const CANDIDATES: readonly DefeatCandidate[] = [
  { id: 'D1-mixed-revision-tolerated', targets: 'ER-L1-single-revision-digest',
    error: 'composes readings taken from two different revisions of the Work',
    composer: buildComposer({ tolerateMixedDigest: true }) },
  { id: 'D2-whole-work-on-partial', targets: 'ER-L2-whole-work-warrant-requires-complete-body-coverage',
    error: 'asserts a whole-Work warrant without complete body coverage',
    composer: buildComposer({ wholeWorkOnPartial: true }),
    classifiedCollateral: {
      'ER-L6-dischargeable-only-under-whole-work':
        'a forged whole-Work warrant necessarily discharges the coverage terms that warrant licenses — removing this would mean the candidate no longer forges a warrant',
      'ER-L15-whole-work-commission-refuses-never-downgrades':
        'A2R1 collateral, found by the new law rather than assumed: the commission check consults the DERIVED warrant, and this candidate forges exactly that — so it satisfies a whole-Work commission it never earned. ⭐ The error is worse than first modelled: it does not merely overstate coverage, it defeats request fidelity too. Irreducible — a D2 that refused here would no longer be forging a warrant',
    } },
  { id: 'D3-warrant-from-prose', targets: 'ER-L3-warrant-never-from-prose',
    error: 'lets the presence of manuscript prose confer a whole-Work warrant',
    composer: buildComposer({ warrantFromProse: true }) },
  { id: 'D4-inheritance-dropped', targets: 'ER-L4-non-conclusion-inheritance',
    error: 'emits claims carrying no non-conclusions at all',
    composer: buildComposer({ dropInheritance: true }),
    classifiedCollateral: {
      'ER-L5-permanent-non-conclusions-never-discharged':
        'dropping every non-conclusion necessarily drops the permanent ones; a candidate that kept them would not be modelling lost inheritance',
      'ER-L6-dischargeable-only-under-whole-work':
        'same single decision — an empty inheritance set cannot retain a coverage term',
    } },
  { id: 'D5-permanent-discharged', targets: 'ER-L5-permanent-non-conclusions-never-discharged',
    error: 'treats author-intent and reader-effect as coverage-dischargeable',
    composer: buildComposer({ dischargePermanent: true }) },
  { id: 'D6-discharge-always', targets: 'ER-L6-dischargeable-only-under-whole-work',
    error: 'discharges coverage non-conclusions regardless of the warrant earned',
    composer: buildComposer({ dischargeAlways: true }) },
  { id: 'D7-dedupe-identity', targets: 'ER-L7-ambiguous-observation-id-refused',
    error: 'silently deduplicates an ambiguous observationId instead of refusing',
    composer: buildComposer({ dedupeIdentity: true }) },
  { id: 'D8-alias-editorial-synthesis', targets: 'ER-L8-identity-distinct-from-editorial-synthesis',
    error: 'constructs its claims from the existing editorialSynthesis thesis',
    composer: buildComposer({ aliasSynthesis: true }) },
  { id: 'D9-provenance-as-count', targets: 'ER-L9-provenance-retains-exact-identities',
    error: 'emits claims with no constituent identities',
    composer: buildComposer({ provenanceAsCount: true }),
    classifiedCollateral: {
      'ER-L13-no-ranking':
        'the no-ranking law reads claim order THROUGH source identities; a candidate with no identities cannot exhibit an order to check — irreducible without restoring provenance',
    } },
  { id: 'D10-fabricate-position', targets: 'ER-L10-return-precision-never-fabricated',
    error: 'invents codePointStart 0 so a structural observation looks position-precise',
    composer: buildComposer({ fabricatePosition: true }) },
  { id: 'D11-suppress-evidence', targets: 'ER-L11-evidence-not-suppressed',
    error: 'presents a few patterns and makes the remaining observations unreachable',
    composer: buildComposer({ suppressEvidence: true }) },
  { id: 'D12-repair-by-inference', targets: 'ER-L12-refuse-never-repair-by-inference',
    error: 'drops observations whose evidence will not resolve and composes around them',
    composer: buildComposer({ repairByInference: true }),
    classifiedCollateral: {
      'ER-L14-refusal-discloses-no-authored-text':
        'the disclosure law is checked on the refusal this candidate no longer issues; a candidate that still refused would not be repairing by inference',
    } },
  { id: 'D13-rank-claims', targets: 'ER-L13-no-ranking',
    error: 'orders claims by a consequentiality heuristic — breadth of cited evidence',
    composer: buildComposer({ rankClaims: true }) },
  { id: 'D15-whole-work-downgrade', targets: 'ER-L15-whole-work-commission-refuses-never-downgrades',
    error: 'silently returns a covered-span reading when whole-work was explicitly commissioned',
    composer: buildComposer({ downgradeOnWholeWorkCommission: true }) },
  { id: 'D14-disclose-in-refusal', targets: 'ER-L14-refusal-discloses-no-authored-text',
    error: 'puts the members authored sentences into the refusal payload',
    composer: buildComposer({ discloseInRefusal: true }) },
];
