/**
 * RC-GEN-01 · EVIDENCE-FIRST ANALYSIS — the gate between "did the source say this?"
 * and "what kind of relation is it?"
 *
 * ⭐⭐ THE ARCHITECTURAL CHANGE THIS IMPLEMENTS (founder ruling, after A-S FAILED):
 *
 *   BEFORE   source -> LLM interpretation -> graph
 *   AFTER    source -> explicit proposition extraction
 *                   -> EVIDENCE / ENTAILMENT CHECK
 *                   -> ontology mapping
 *                   -> graph
 *
 * Two questions were being collapsed into one act:
 *
 *   1  DID THE SOURCE ACTUALLY SAY THIS?     <- this module
 *   2  IF IT DID, WHAT KIND OF RELATION?     <- the ontology (analyzer/3), unchanged
 *
 * ⛔ THE ONTOLOGY BOUNDARY REMAINS THE SECOND DEFENCE, NEVER THE TRUTH JUDGE. It
 * caught malformed participation live (a state, a relation, as the object of
 * `actively_participates_in`) and it keeps that job. It cannot decide whether a
 * participation claim was WARRANTED AT ALL, and it was never asked to.
 *
 * ⭐⭐⭐ WHAT IS DETERMINISTIC HERE, AND WHY IT MATTERS.
 *
 * A relation must cite the EXACT SOURCE PHRASE that licenses it, and that citation is
 * verified BY SEARCHING THE SOURCE — no second opinion, no model, no judgement. A
 * relation whose evidence does not occur in the passage is rejected mechanically.
 *
 * ⛔⛔ AND HERE IS WHAT THAT DOES *NOT* CLOSE, STATED PLAINLY SO IT CANNOT BE
 * OVERCLAIMED LATER:
 *
 *   span verification catches FABRICATED evidence.
 *   it does NOT catch MISJUDGED entailment.
 *
 * A-S's actual failure would survive this layer alone: `his ongoing process of
 * integration` is a REAL span, genuinely present, and citing it for
 * `actively_participates_in` is a true citation of a phrase that does not license the
 * claim. ⭐ The span gate bounds the space to real text and makes every claim
 * auditable against its source. The ENTAILMENT LABEL is then the only remaining
 * judgement — which is exactly where the founder's independence requirement bites:
 * a different verifier, or a constraint tight enough that it is a source-grounding
 * test rather than another free interpretation. ⛔ Neither is decided here.
 *
 * ⛔ ABSTENTION IS A VALID OUTPUT. "No participation relation is licensed here" is an
 * answer. Empty space in the graph is not a defect.
 *
 * ⛔⛔ AND ABSTENTION IS NOT A PASS. An analyser that labels everything `unsupported`
 * and emits nothing satisfies every negative case and fails the discipline entirely.
 * Acceptance requires SELECTIVITY — abstain where unsupported, ASSERT where the
 * source commits — and the falsifiers in `__tests__/revision-evidence-gate.test.ts`
 * treat blanket abstention as a failure, not a success.
 */

import { admitAnalysis, type AnalysisResult } from './analyze';
import type { EdgeKind } from './semanticGraph';
import { EDGE_KINDS } from './semanticGraph';

/**
 * ⭐ THREE LABELS, AND ONLY ONE PROMOTES.
 *
 * `inferred` is deliberately NOT a weaker kind of `entailed`. It names a claim the
 * analyser found plausible and the source did not commit to — the exact category A1b
 * lives in. Keeping it representable, and keeping it OUT of the canonical graph, is
 * how an overcommit becomes visible instead of silent.
 */
export type EntailmentLabel = 'entailed' | 'inferred' | 'unsupported';

export const ENTAILMENT_LABELS: readonly EntailmentLabel[] = ['entailed', 'inferred', 'unsupported'];

/** The only label that may enter the canonical graph. */
export const PROMOTING_LABEL: EntailmentLabel = 'entailed';

export interface ProposedNode {
  local_id: string;
  kind: string;
  properties: Record<string, string>;
}

export interface ProposedRelation {
  from: string;
  to: string;
  relation: string;
  /** ⛔ VERBATIM from the source. Verified by search, never taken on trust. */
  evidence: string;
  entailment: string;
}

export type EvidenceRejection =
  /** The cited phrase does not occur in the passage. ⭐ Caught deterministically. */
  | { kind: 'evidence_not_found'; relation: ProposedRelation }
  /** Cited, present, but the analyser itself did not claim the source commits to it. */
  | { kind: 'not_entailed'; relation: ProposedRelation; label: EntailmentLabel };

export interface EvidenceBoundResult {
  /** What survived BOTH gates, as the comparator's own types. */
  analysis: AnalysisResult;
  /** ⭐ Everything proposed and withheld, with its reason. Never discarded: a
   *  withheld claim is the visible form of an overcommit. */
  withheld: readonly EvidenceRejection[];
  /** Promoted relation count, for selectivity accounting. */
  promoted: number;
}

export type EvidenceAdmission =
  | { ok: true; result: EvidenceBoundResult }
  | { ok: false; refusal: 'malformed'; detail: string };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * ⭐ WHITESPACE IS NORMALISED; NOTHING ELSE IS.
 *
 * A model reproducing a span across a line break is citing the same words, so runs of
 * whitespace collapse. ⛔ Case and punctuation are NOT normalised, and no stemming,
 * no fuzzy match, no substring-of-a-substring leniency: any of those would let a
 * PARAPHRASE pass as a citation, and a paraphrased citation is precisely the failure
 * this gate exists to make impossible.
 */
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Does this exact phrase occur in the passage? ⛔ No model, no judgement. */
export function evidenceOccurs(passage: string, quote: string): boolean {
  const q = normalize(quote);
  if (q.length === 0) return false;
  return normalize(passage).includes(q);
}

const isLabel = (v: unknown): v is EntailmentLabel =>
  typeof v === 'string' && (ENTAILMENT_LABELS as readonly string[]).includes(v);

/**
 * Apply both gates, in the ruled order, and hand the survivors to the ontology
 * boundary as the SECOND defence.
 *
 * ⛔ Gate order is load-bearing and is not an optimisation. Evidence first: a claim
 * with no source phrase behind it is rejected before anything asks what KIND of
 * relation it would have been. Asking the ontology first would let a well-formed
 * fabrication look healthier than a malformed truth.
 *
 * ⛔ A rejection here NEVER silently drops the claim — it is returned in `withheld`.
 * An analyser that proposes twelve relations and promotes one has told you something
 * important, and a gate that hid the eleven would destroy exactly that signal.
 */
export function admitEvidenceBound(
  passage: string,
  nodes: unknown,
  relations: unknown,
): EvidenceAdmission {
  if (!Array.isArray(nodes)) {
    return { ok: false, refusal: 'malformed', detail: 'nodes absent or not an array' };
  }
  if (!Array.isArray(relations)) {
    return { ok: false, refusal: 'malformed', detail: 'relations absent or not an array' };
  }

  const withheld: EvidenceRejection[] = [];
  const promotedEdges: { from: string; to: string; relation: string }[] = [];

  for (const r of relations) {
    if (!isRecord(r)) {
      return { ok: false, refusal: 'malformed', detail: 'relation is not an object' };
    }
    const extra = Object.keys(r).find((k) => !['from', 'to', 'relation', 'evidence', 'entailment'].includes(k));
    if (extra) {
      return { ok: false, refusal: 'malformed', detail: `unexpected relation field ${extra}` };
    }
    if (typeof r.from !== 'string' || typeof r.to !== 'string' || typeof r.relation !== 'string') {
      return { ok: false, refusal: 'malformed', detail: 'relation endpoints or kind missing' };
    }
    if (!(EDGE_KINDS as readonly string[]).includes(r.relation)) {
      return { ok: false, refusal: 'malformed', detail: `unknown relation ${r.relation}` };
    }
    /* ⛔ EVIDENCE IS MANDATORY AND IS A STRING. An absent evidence field is a
       malformed answer, never an unevidenced claim quietly admitted. */
    if (typeof r.evidence !== 'string') {
      return { ok: false, refusal: 'malformed', detail: `relation ${r.relation}: evidence absent` };
    }
    if (!isLabel(r.entailment)) {
      return { ok: false, refusal: 'malformed', detail: `relation ${r.relation}: unknown entailment label` };
    }

    const proposed: ProposedRelation = {
      from: r.from, to: r.to, relation: r.relation,
      evidence: r.evidence, entailment: r.entailment,
    };

    /* GATE 1 — did the source actually say this? Deterministic. */
    if (!evidenceOccurs(passage, r.evidence)) {
      withheld.push({ kind: 'evidence_not_found', relation: proposed });
      continue;
    }
    /* GATE 2 — did the analyser claim the source COMMITS to it? */
    if (r.entailment !== PROMOTING_LABEL) {
      withheld.push({ kind: 'not_entailed', relation: proposed, label: r.entailment });
      continue;
    }
    promotedEdges.push({ from: r.from, to: r.to, relation: r.relation });
  }

  /* GATE 3 — the ontology boundary, unchanged, as the SECOND defence. */
  return {
    ok: true,
    result: {
      analysis: admitAnalysis({ nodes, edges: promotedEdges }),
      withheld,
      promoted: promotedEdges.length,
    },
  };
}

/**
 * ⭐ SELECTIVITY, NOT CONSERVATISM — the accounting the acceptance test rules on.
 *
 * ⛔ A run that promotes nothing across every case is NOT a pass. The founder's law:
 * *the test may not merely suppress participation, or the easy "fix" is to never
 * emit a participation edge and A-S passes for the wrong reason.*
 */
export interface SelectivityTally {
  /** Cases where the source commits and a participation edge was promoted. */
  assertedWhenLicensed: number;
  /** Cases where the source commits and NOTHING was promoted. ⛔ over-abstention. */
  missedWhenLicensed: number;
  /** Cases where the source does not commit and nothing was promoted. */
  abstainedWhenUnlicensed: number;
  /** Cases where the source does not commit and something was promoted. ⛔ A1b. */
  assertedWhenUnlicensed: number;
}

export const isSelective = (t: SelectivityTally): boolean =>
  t.assertedWhenUnlicensed === 0 && t.missedWhenLicensed === 0 && t.assertedWhenLicensed > 0;

export const PARTICIPATION: readonly EdgeKind[] = ['actively_participates_in', 'undergoes'];
