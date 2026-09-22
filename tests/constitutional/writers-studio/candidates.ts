/**
 * The conforming reference and the six named defeat candidates (§VIII), plus
 * the §IX prompt-boundary pair.
 *
 * ⛔ THE REFERENCE IS A TEST DOUBLE, NOT AN IMPLEMENTATION, and ⛔ never a seed:
 * it proves the laws are mutually satisfiable. It has no table, no reader, no
 * durability. Deriving an implementation from it would smuggle storage
 * decisions out of an object never designed to make them (S3 Class-B rule).
 */

import { createHash } from 'crypto';
import {
  computeBasisFingerprint, manuscriptOrder, positionOf,
  type BasisFingerprint, type CanonicalObservation, type Facet, type FacetContext,
  type FacetExpression, type FacetPresentation, type ObservationId,
  type ReaderClaimDraft, type ReadingId,
} from './observationContract';

export interface Engine {
  readonly name: string;
  readonly admit: (readingId: ReadingId, drafts: readonly ReaderClaimDraft[]) => readonly CanonicalObservation[];
  readonly render: (facet: Facet, obs: readonly CanonicalObservation[], ctx: FacetContext) => FacetPresentation;
}

/* ── shared lawful pieces ────────────────────────────────────────────────── */

let counter = 0;
const opaqueId = (): ObservationId => `obs_${(++counter).toString(36)}_${createHash('sha256')
  .update(String(counter) + ':' + Math.E).digest('hex').slice(0, 12)}` as ObservationId;

function buildObservation(
  readingId: ReadingId, d: ReaderClaimDraft, admissionIndex: number, id: ObservationId,
): CanonicalObservation {
  return {
    observationId: id,
    readingId,
    lens: d.lens,
    refs: d.refs,
    doesNotEstablish: d.doesNotEstablish,
    claim: d.claim,
    position: positionOf(d.refs),
    basisFingerprint: computeBasisFingerprint(d),
    admissionIndex,
  };
}

const lawfulAdmit = (readingId: ReadingId, drafts: readonly ReaderClaimDraft[]) =>
  drafts.map((d, i) => buildObservation(readingId, d, i, opaqueId()));

function express(facet: Facet, o: CanonicalObservation): FacetExpression {
  return {
    observationId: o.observationId,
    /* ⭐ Deliberately different prose per facet — §VII makes prose equality a
       NON-requirement, and a suite that accidentally demanded it would forbid
       the very thing facets exist to do. */
    rendered: facet === 'guided' ? `I'm noticing: ${o.claim}`
      : facet === 'learning' ? `I'm noticing: ${o.claim}`
      : `[${o.lens}] ${o.claim}`,
    teaching: facet === 'learning' ? `Why this matters: ${o.lens} concerns sequence and effect.` : null,
    machinery: facet === 'direct'
      ? { lens: o.lens, refs: o.refs, doesNotEstablish: o.doesNotEstablish, basis: o.basisFingerprint }
      : null,
    /* ⛔ Facet-invariant: what MAIA may author does not move with the facet. */
    maiaAuthoredProposals: [`proposal-for:${o.observationId}`],
    revisionAuthority: 'member-authorizes',
  };
}

/** ⭐ Progressive paging is lawful; the cut is a POSITIONAL PREFIX. */
function lawfulRender(facet: Facet, obs: readonly CanonicalObservation[]): FacetPresentation {
  const ordered = [...obs].sort(manuscriptOrder).map((o) => express(facet, o));
  return {
    reachable: ordered,
    initiallyExpanded: facet === 'direct' ? ordered : ordered.slice(0, 2),
  };
}

export const REFERENCE: Engine = { name: 'REFERENCE', admit: lawfulAdmit, render: (f, o) => lawfulRender(f, o) };

/* ── §VIII defeat candidates ─────────────────────────────────────────────── */

/** D1 — identity hashes the claim text. ⛔ Must die on §II. */
export const D1_TEXT_IDENTITY: Engine = {
  name: 'D1_TEXT_IDENTITY',
  admit: (readingId, drafts) => drafts.map((d, i) => buildObservation(
    readingId, d, i, createHash('sha256').update(d.claim).digest('hex') as ObservationId)),
  render: (f, o) => lawfulRender(f, o),
};

/** D2 — identity IS the basis fingerprint. ⛔ Two distinct observations collapse. */
export const D2_EVIDENCE_IDENTITY: Engine = {
  name: 'D2_EVIDENCE_IDENTITY',
  admit: (readingId, drafts) => drafts.map((d, i) => buildObservation(
    readingId, d, i, (computeBasisFingerprint(d) as string) as ObservationId)),
  render: (f, o) => lawfulRender(f, o),
};

/** D3 — every facet re-invokes the reader and happens to look similar. */
export const D3_PER_FACET_REREAD: Engine = {
  name: 'D3_PER_FACET_REREAD',
  admit: lawfulAdmit,
  render: (facet, _obs, ctx) => {
    const fresh = ctx.reader();
    return lawfulRender(facet, lawfulAdmit('reading_refetched' as ReadingId, fresh));
  },
};

/** D4 — Guided adds a claim "to be helpful", and one more thing to author. */
export const D4_GUIDED_EXPANSION: Engine = {
  name: 'D4_GUIDED_EXPANSION',
  admit: lawfulAdmit,
  render: (facet, obs) => {
    const base = lawfulRender(facet, obs);
    if (facet !== 'guided') return base;
    const extra: FacetExpression = {
      observationId: 'obs_helpful_extra' as ObservationId,
      rendered: 'Also, I noticed something else that might help.',
      teaching: null, machinery: null,
      maiaAuthoredProposals: ['proposal-for:obs_helpful_extra'],
      revisionAuthority: 'member-authorizes',
    };
    return { reachable: [...base.reachable, extra], initiallyExpanded: base.initiallyExpanded };
  },
};

/** D5 — Direct gets everything; Guided is handed a subset with no route to the rest. */
export const D5_HIDDEN_REACHABILITY: Engine = {
  name: 'D5_HIDDEN_REACHABILITY',
  admit: lawfulAdmit,
  render: (facet, obs) => {
    const base = lawfulRender(facet, obs);
    if (facet === 'direct') return base;
    const cut = base.reachable.slice(0, 2);
    return { reachable: cut, initiallyExpanded: cut };
  },
};

/**
 * D6 — manuscript order, except ties resolved evaluatively.
 * ⭐ The suite asserts the DEFINED order, so it kills every alternative
 * tie-break, not merely this one — which is stronger than testing one
 * particular severity function.
 */
export const D6_TIE_RANKING: Engine = {
  name: 'D6_TIE_RANKING',
  admit: lawfulAdmit,
  render: (facet, obs) => {
    const severity = (o: CanonicalObservation) => o.claim.length;
    const ordered = [...obs].sort((a, b) => {
      if (a.position.sectionPosition !== b.position.sectionPosition) {
        return a.position.sectionPosition - b.position.sectionPosition;
      }
      if (a.position.codePointStart !== b.position.codePointStart) {
        return a.position.codePointStart - b.position.codePointStart;
      }
      return severity(b) - severity(a);
    }).map((o) => express(facet, o));
    return { reachable: ordered, initiallyExpanded: facet === 'direct' ? ordered : ordered.slice(0, 2) };
  },
};

export const DEFEAT_CANDIDATES: readonly Engine[] = [
  D1_TEXT_IDENTITY, D2_EVIDENCE_IDENTITY, D3_PER_FACET_REREAD,
  D4_GUIDED_EXPANSION, D5_HIDDEN_REACHABILITY, D6_TIE_RANKING,
];

/* ── §IX prompt-boundary pair ────────────────────────────────────────────── */

export interface ReaderRequestShape {
  readonly commissionedLens: string;
  readonly evidence: unknown;
  readonly recovered: readonly string[];
}
export interface CompassDeclaration { readonly dimension: string; readonly memberWording: string; }

/** ⭐ Lawful: the prompt is a pure function of the request. Nothing else is in scope. */
export const lawfulBuildPrompt = (req: ReaderRequestShape): string =>
  `LENS ${req.commissionedLens}\n${req.recovered.join('\n')}`;

/**
 * D7 — the evidence DTO stays clean and the Compass rides in the PROMPT.
 * ⭐ Exactly the candidate §IX requires to die: a guard that watched only
 * `evidence` would pass this.
 */
export const D7_COMPASS_IN_PROMPT = (req: ReaderRequestShape, compass: readonly CompassDeclaration[]): string =>
  `LENS ${req.commissionedLens}\nWHAT THE AUTHOR SAYS THE WORK IS: ${
    compass.map((c) => c.memberWording).join(' / ')}\n${req.recovered.join('\n')}`;
