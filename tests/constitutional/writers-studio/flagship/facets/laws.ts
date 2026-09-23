/**
 * FCT1…FCT12 — FACET INVARIANCE AS MECHANICAL LAW.
 *
 * Source: `MAIA_RELATIONAL_CONVERSATION_AND_FACET_CANON_v1.md` §35.
 *
 * ⭐⭐ THIS IS THE SUITE I REFUSED TO WRITE TWICE, AND THE REASON IS THE POINT.
 * Facets currently differ only by a chip label, so a conformance test written
 * against the candidate would pass **by proving nothing** — and the beta's
 * Task 9 would fail by **measuring nothing**. Same gap, both directions. The
 * canon supplies the behaviour, so the law can finally be written against
 * something real.
 *
 * ⭐ FCT1 is NOT re-derived here. Observation identity is already ratified law
 * (`WRITERS-STUDIO-OBSERVATION-IDENTITY-01`): opaque, minted at admission,
 * ⛔ never derived from rendered text — *which facets vary BY DESIGN*. This
 * suite CONSUMES that identity; ⛔ it does not redefine it.
 *
 * ⭐⭐ THE LAWS COMPARE A TRIPLE, NOT A RENDERING. A single facet cannot
 * violate invariance — invariance is a relation. ⛔ Testing one rendering at a
 * time is how a facet suite passes while the three disagree.
 */

export type Facet = 'guided' | 'learning' | 'direct';
export type ProposalScope = 'none' | 'sentence' | 'paragraph' | 'section';

export interface Rendering {
  readonly facet: Facet;
  /** ⭐ From the ratified minter. ⛔ Never computed from `text`. */
  readonly observationId: string;
  readonly evidenceRefs: readonly string[];
  readonly coverage: readonly string[];
  readonly doesNotEstablish: readonly string[];
  readonly proposalMaxScope: ProposalScope;
  readonly alternativeCount: number;
  /** The ceiling on how much of the member's prose MAIA may replace. */
  readonly mayReplaceCodePoints: number;
  /** Readings this rendering caused. ⛔ Rendering must cause none. */
  readonly readsCommissioned: number;
  readonly seam: string;
  readonly text: string;
  readonly provenanceShown: boolean;
  /** Questions asked before any help arrives. */
  readonly setupQuestions: number;
  /** Learning only: is the teaching tied to this Work's evidence? */
  readonly teachingTiedToEvidence: boolean | null;
  /** After "I disagree": does MAIA restate the claim rather than yield? */
  readonly restatesClaimAfterDisagreement: boolean | null;
  /** Spoken rendering, when speech was used. ⛔ Must equal the governed text. */
  readonly spokenText: string | null;
}

/** One observation, rendered three ways. */
export interface FacetTriple {
  readonly guided: Rendering;
  readonly learning: Rendering;
  readonly direct: Rendering;
  /** Did a facet SWITCH produce these, and did the seam survive it? */
  readonly seamAfterSwitch: string | null;
}

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string; }
const law = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

const all = (t: FacetTriple): readonly Rendering[] => [t.guided, t.learning, t.direct];
const same = <T>(xs: readonly T[]): boolean => xs.every((x) => x === xs[0]);
const sameSet = (xs: readonly (readonly string[])[]): boolean => {
  const key = (a: readonly string[]) => [...a].sort().join('\u0000');
  return xs.every((a) => key(a) === key(xs[0] ?? []));
};

const SCOPE_ORDER: Readonly<Record<ProposalScope, number>> = {
  none: 0, sentence: 1, paragraph: 2, section: 3,
};

/** ⛔ §13 — stance is relational; verdict is grading. */
const VERDICT = [
  'this is the key', 'the strongest', 'especially luminous', 'stronger',
  'brilliant', 'excellent writing', 'perfect', 'the best version',
  'readers will', 'you should', 'you need to', 'fix this by',
];

export function runFacetLaws(t: FacetTriple): readonly LawResult[] {
  const out: LawResult[] = [];
  const r = all(t);

  /* ── FCT1 · OBSERVATION INVARIANT ────────────────────────────────────── */
  const ids = r.map((x) => x.observationId);
  out.push(law('FCT1-one-observation-identity', same(ids),
    same(ids) ? `all three render ${ids[0]}` : `three identities: ${ids.join(' · ')}`));

  /* ── FCT2 · EVIDENCE INVARIANT ───────────────────────────────────────── */
  out.push(law('FCT2-same-evidence', sameSet(r.map((x) => x.evidenceRefs)),
    sameSet(r.map((x) => x.evidenceRefs)) ? `${r[0]?.evidenceRefs.length ?? 0} ref(s), identical across facets`
      : `evidence differs: ${r.map((x) => `${x.facet}:${x.evidenceRefs.length}`).join(' · ')}`));

  /* ── FCT3 · COVERAGE INVARIANT ───────────────────────────────────────────
     ⭐ Two halves, and the second is the one D-F3 exploits: coverage must be
     equal AND rendering must commission nothing. A facet that reads more has
     changed what MAIA has read, which is the invariant in motion. */
  const covSame = sameSet(r.map((x) => x.coverage));
  const reads = r.filter((x) => x.readsCommissioned > 0);
  out.push(law('FCT3-facet-changes-neither-coverage-nor-reads', covSame && reads.length === 0,
    !covSame ? `coverage differs: ${r.map((x) => `${x.facet}:${x.coverage.length}`).join(' · ')}`
      : reads.length > 0 ? `${reads.map((x) => x.facet).join(', ')} commissioned a reading merely by rendering`
      : 'same coverage; no facet reads anything to render'));

  /* ── FCT4 · AUTHORITY INVARIANT ──────────────────────────────────────────
     ⭐⭐ §9.3's rider, the one most likely to be lost: a facet may change how
     much MAIA EXPLAINS, ⛔ never how much MAIA WRITES. *MAIA holds more of the
     process* is the exact phrase under which that drift arrives sounding like
     care — in the population where dependency risk is highest. */
  const replace = r.map((x) => x.mayReplaceCodePoints);
  out.push(law('FCT4-authorship-ceiling-is-facet-invariant', same(replace),
    same(replace) ? `every facet may replace at most ${replace[0]} code points`
      : `authorship ceiling varies: ${r.map((x) => `${x.facet}:${x.mayReplaceCodePoints}`).join(' · ')}`));

  /* ── FCT5 · PROPOSAL-SCOPE INVARIANT ─────────────────────────────────── */
  const scopes = r.map((x) => SCOPE_ORDER[x.proposalMaxScope]);
  const counts = r.map((x) => x.alternativeCount);
  out.push(law('FCT5-same-locus-same-proposal-breadth', same(scopes) && same(counts),
    !same(scopes) ? `scope varies: ${r.map((x) => `${x.facet}:${x.proposalMaxScope}`).join(' · ')}`
      : !same(counts) ? `alternative count varies: ${counts.join(' · ')}`
      : `${r[0]?.proposalMaxScope}-bound, ${counts[0]} alternative(s) in every facet`));

  /* ── FCT6 · READER-NONCONCLUSION · FCT7 · INTENT-NONINFERENCE ────────────
     ⭐ The permanent non-conclusions are permanent under ANY facet. Dropping
     one is how a facet quietly becomes more authoritative. */
  const dneSame = sameSet(r.map((x) => x.doesNotEstablish));
  out.push(law('FCT6-7-permanent-limits-survive-every-facet', dneSame,
    dneSame ? `${r[0]?.doesNotEstablish.length ?? 0} permanent limit(s) carried by all three`
      : `limits differ: ${r.map((x) => `${x.facet}:[${x.doesNotEstablish.join(',')}]`).join(' · ')}`));

  /* ── FCT8 · TEACHING ADDITIVE ────────────────────────────────────────────
     ⭐ Learning ADDS explanation to the same truth. Two ways it fails: the
     teaching is untethered from this Work (D-F8's generic lecture), or the
     teaching arrives as a verdict (D-F4). The first is tested here; the
     second falls to FCT12, which is why both are kept. */
  if (t.learning.teachingTiedToEvidence !== null) {
    out.push(law('FCT8-teaching-is-tied-to-this-work', t.learning.teachingTiedToEvidence,
      t.learning.teachingTiedToEvidence ? 'the craft point is shown in the member’s own passage'
        : 'a generic craft lecture unconnected to the evidence'));
  }

  /* ── FCT9 · DIRECT REMOVES SCAFFOLDING, NOT SAFEGUARDS ────────────────── */
  out.push(law('FCT9-direct-keeps-provenance', t.direct.provenanceShown,
    t.direct.provenanceShown ? 'Direct is concise and still says where this came from'
      : 'Direct dropped provenance to be brief'));

  /* ── FCT10 · GUIDED HUMAN LANGUAGE ───────────────────────────────────────
     ⭐ The law is the absence of a QUESTIONNAIRE, ⛔ not the absence of
     questions: §18 says one good question beats five, and §20 says do not
     require a questionnaire. Two is the line the canon itself draws in §5
     (*offer one or two next moves*). */
  out.push(law('FCT10-guided-does-not-interrogate', t.guided.setupQuestions <= 2,
    t.guided.setupQuestions <= 2 ? `${t.guided.setupQuestions} orienting question(s) before help`
      : `${t.guided.setupQuestions} setup questions before the member gets anything`));

  /* ── FCT11 · SWITCH PRESERVES SEAM ───────────────────────────────────── */
  if (t.seamAfterSwitch !== null) {
    const seams = r.map((x) => x.seam);
    const kept = same(seams) && t.seamAfterSwitch === seams[0];
    out.push(law('FCT11-switching-facet-keeps-the-conversation', kept,
      kept ? `same seam ${t.seamAfterSwitch} across the switch`
        : `switch moved the conversation: ${seams.join(' · ')} → ${t.seamAfterSwitch}`));
  }

  /* ── FCT12 · COPY LAW ────────────────────────────────────────────────── */
  const offenders = r.map((x) => ({ facet: x.facet, hits: VERDICT.filter((v) => x.text.toLowerCase().includes(v)) }))
    .filter((x) => x.hits.length > 0);
  out.push(law('FCT12-no-facet-introduces-verdict-language', offenders.length === 0,
    offenders.length === 0 ? 'no facet grades the Work'
      : offenders.map((o) => `${o.facet}: "${o.hits.join('", "')}"`).join(' · ')));

  /* ── §15 · DISAGREEMENT ──────────────────────────────────────────────────
     ⭐ *The system should not force convergence.* Modelled structurally: after
     "I disagree", MAIA may revise, clarify, withdraw or PRESERVE the
     disagreement — ⛔ what she may not do is restate the claim at the member. */
  const arguing = r.filter((x) => x.restatesClaimAfterDisagreement === true);
  if (r.some((x) => x.restatesClaimAfterDisagreement !== null)) {
    out.push(law('FCT13-disagreement-keeps-the-members-reading-primary', arguing.length === 0,
      arguing.length === 0 ? 'the member’s reading stays primary'
        : `${arguing.map((x) => x.facet).join(', ')} argued back after "I disagree"`));
  }

  /* ── §30 · SPEECH READS THE GOVERNED TEXT ────────────────────────────── */
  const spoken = r.filter((x) => x.spokenText !== null && x.spokenText !== x.text);
  if (r.some((x) => x.spokenText !== null)) {
    out.push(law('FCT14-speech-does-not-paraphrase', spoken.length === 0,
      spoken.length === 0 ? 'speech reads exactly the governed text'
        : `${spoken.map((x) => x.facet).join(', ')} spoke something other than the governed text`));
  }

  return out;
}

/**
 * ⛔ NOT MECHANICAL. Reported UNKNOWN, ⛔ never as passed.
 *
 * ⭐ D-F9 is the canon's own candidate and I am deliberately NOT building a
 * mechanical version of it: *Direct becomes curt or dismissive* is a judgment
 * about tone on generated prose. A proxy (word count, sentence length) would
 * report a pass while the prose was cold — ⛔ worse than no test, because it
 * would carry a green into a table. §7's own words are *fast, exact, NOT COLD*,
 * and "not cold" has no predicate.
 */
export const HUMAN_WITNESS_ONLY = [
  { id: 'D-F9-direct-is-not-cold', why: '§7 asks for fast and exact but not cold; "not cold" has no mechanical predicate' },
  { id: 'FCT8-teaching-illuminates', why: 'whether Learning actually taught the writer something is §37 q6 — a person' },
  { id: 'FCT10-guided-is-not-patronizing', why: '§37 q8. Supportive-without-patronizing is a felt distinction' },
] as const;
