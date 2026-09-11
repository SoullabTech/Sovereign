/**
 * RC-GEN-01 · SC — semantic conservation, as a separate operation.
 *
 * Nine runs established that the prompt lever is exhausted: the model can state
 * the preservation law, often preserve the graph, and still redistribute or
 * intensify properties while rewriting. Run 9 reproduced two ruled drifts
 * character-identically under an unchanged prompt.
 *
 * ⭐ THE ARCHITECTURE IS INFORMATION SEPARATION, NOT MODEL-BRAND SEPARATION.
 *
 *   A  SOURCE ANALYSIS     source only · no candidate · no rewrite task  -> Gs
 *   B  GENERATION          source + request + Gs                        -> C
 *   C  CANDIDATE ANALYSIS  candidate only · no source · no verdict       -> Gc
 *   D  COMPARISON          Gs vs Gc, DETERMINISTIC                       -> admit/refuse
 *
 * ⛔ Neither analyser emits the verdict. ⛔ The comparator runs no inference.
 * ⛔ A mismatch REFUSES. There is no automatic second attempt — otherwise the
 * verifier quietly becomes an iterative optimiser and the acceptance boundary
 * disappears.
 *
 * ⛔ CLOSED TYPED VOCABULARY, NEVER PROSE. An extractor that emits "the passage
 * says the change is important but not necessarily large" has drifted back into
 * interpretation, and the comparison would then need another semantic judgement.
 *
 * ⚠️ NODE CORRESPONDENCE IS POSITIONAL, AND THAT IS A DELIBERATE CHOICE. The two
 * analysers never see each other, so their labels differ by construction
 * (`relational_transformation` vs `relational_change`). Matching by label would
 * require deciding whether those name the same thing — exactly the judgement this
 * design exists to remove. Nodes are emitted in order of appearance and compared
 * by position; a difference in count is itself a finding.
 */

export type PropertyName =
  /**
   * ⚠️ `significance` AND `meaningfulness` ARE SEPARATE, and the separation is
   * load-bearing. A vocabulary that collapses the source's distinct degree words
   * into one property makes a MIGRATION BETWEEN THEM UNREPRESENTABLE — the
   * comparator would see the same property asserted on the same nodes and admit a
   * candidate that had moved meaning across the graph. Caught while building the
   * design gate, from the founder's own worked example.
   */
  | 'significance' | 'meaningfulness' | 'magnitude' | 'valence' | 'direction'
  | 'agency' | 'temporality' | 'modality' | 'polarity';

export type PropertyValue =
  | 'unspecified'
  | 'asserted' | 'negated'
  | 'low' | 'high'
  | 'positive' | 'negative'
  | 'forward' | 'none'
  | 'active_participation' | 'undergone'
  | 'ongoing' | 'complete'
  | 'certain' | 'possible';

export type EdgeKind =
  | 'causes' | 'results_in' | 'constitutes' | 'qualifies' | 'within' | 'distinct_from';

export interface SemanticNode {
  /** The analyser's own label. NEVER compared across graphs. */
  label: string;
  properties: Partial<Record<PropertyName, PropertyValue>>;
}

export interface SemanticEdge {
  /** Positional indices into `nodes`. */
  from: number;
  to: number;
  kind: EdgeKind;
}

export interface SemanticGraph {
  nodes: readonly SemanticNode[];
  edges: readonly SemanticEdge[];
}

export type ConservationFinding =
  | { kind: 'node_count'; source: number; candidate: number }
  | { kind: 'added_property'; node: number; property: PropertyName; candidate: PropertyValue }
  | { kind: 'dropped_property'; node: number; property: PropertyName; source: PropertyValue }
  | { kind: 'changed_property'; node: number; property: PropertyName; source: PropertyValue; candidate: PropertyValue }
  | { kind: 'reassigned_property'; property: PropertyName; value: PropertyValue; sourceNode: number; candidateNode: number }
  | { kind: 'dropped_edge'; edge: SemanticEdge }
  | { kind: 'added_edge'; edge: SemanticEdge }
  | { kind: 'changed_edge_kind'; from: number; to: number; source: EdgeKind; candidate: EdgeKind };

export type ConservationVerdict =
  | { admitted: true }
  | { admitted: false; refusal: 'revision_not_semantically_conservative'; findings: readonly ConservationFinding[] };

const PROPERTIES: readonly PropertyName[] = [
  'significance', 'meaningfulness', 'magnitude', 'valence', 'direction',
  'agency', 'temporality', 'modality', 'polarity',
];

/** `unspecified` and absence are the same claim: the source did not commit. */
const valueOf = (n: SemanticNode | undefined, p: PropertyName): PropertyValue =>
  n?.properties?.[p] ?? 'unspecified';

const edgeKey = (e: SemanticEdge) => `${e.from}->${e.to}`;

/**
 * Compare two frozen graphs. NO inference, NO heuristics, NO tolerance.
 *
 * ⭐ `reassigned_property` is the finding that per-phrase rules cannot reach: a
 * property the source asserted on one node appears on a DIFFERENT node in the
 * candidate. Every word can be individually defensible while the distribution of
 * meaning across the graph has changed.
 */
export function compareConservation(
  source: SemanticGraph,
  candidate: SemanticGraph,
): ConservationVerdict {
  const findings: ConservationFinding[] = [];

  if (source.nodes.length !== candidate.nodes.length) {
    findings.push({ kind: 'node_count', source: source.nodes.length, candidate: candidate.nodes.length });
  }

  const n = Math.min(source.nodes.length, candidate.nodes.length);
  for (let i = 0; i < n; i++) {
    for (const p of PROPERTIES) {
      const s = valueOf(source.nodes[i], p);
      const c = valueOf(candidate.nodes[i], p);
      if (s === c) continue;
      if (s === 'unspecified') findings.push({ kind: 'added_property', node: i, property: p, candidate: c });
      else if (c === 'unspecified') findings.push({ kind: 'dropped_property', node: i, property: p, source: s });
      else findings.push({ kind: 'changed_property', node: i, property: p, source: s, candidate: c });
    }
  }

  /* Reassignment: the same (property, value) leaves one node and appears on
     another. Reported IN ADDITION to the add/drop pair, because "moved" is a
     different fact about the Work than "lost here" and "invented there". */
  for (const p of PROPERTIES) {
    for (let i = 0; i < n; i++) {
      const s = valueOf(source.nodes[i], p);
      if (s === 'unspecified' || valueOf(candidate.nodes[i], p) === s) continue;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        if (valueOf(candidate.nodes[j], p) === s && valueOf(source.nodes[j], p) !== s) {
          findings.push({ kind: 'reassigned_property', property: p, value: s, sourceNode: i, candidateNode: j });
        }
      }
    }
  }

  const cEdges = new Map(candidate.edges.map((e) => [edgeKey(e), e]));
  const sEdges = new Map(source.edges.map((e) => [edgeKey(e), e]));
  for (const e of source.edges) {
    const match = cEdges.get(edgeKey(e));
    if (!match) findings.push({ kind: 'dropped_edge', edge: e });
    else if (match.kind !== e.kind) {
      findings.push({ kind: 'changed_edge_kind', from: e.from, to: e.to, source: e.kind, candidate: match.kind });
    }
  }
  for (const e of candidate.edges) {
    if (!sEdges.has(edgeKey(e))) findings.push({ kind: 'added_edge', edge: e });
  }

  return findings.length === 0
    ? { admitted: true }
    : { admitted: false, refusal: 'revision_not_semantically_conservative', findings };
}
