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
 * ⚠️ NODE CORRESPONDENCE IS BY DETERMINISTIC ALIGNMENT, NOT BY LABEL AND NOT BY
 * POSITION.
 *
 *   BY LABEL    would require deciding whether `relational_transformation` and
 *               `relational_change` name the same thing — the judgement this
 *               design exists to remove.
 *   BY POSITION would compare SERIALISATION GEOMETRY, not semantic geometry. A
 *               faithful revision may reorder its expression, and two independent
 *               analysers emitting in textual encounter order would then disagree
 *               about nodes that correspond perfectly. An earlier draft of this
 *               module did exactly that; the founder refused to ratify it.
 *
 * ⭐ Alignment is found by EDGE TOPOLOGY, exhaustively, then properties are
 * compared under that alignment.
 *
 * ⚠️ THIS IS A DELIBERATE REFINEMENT OF THE RULED DESIGN, AND THE REASON MATTERS.
 * The ruling said to find an isomorphism preserving node properties AND edges. But
 * a defective candidate has NO property-preserving isomorphism — so that criterion
 * collapses every defect into one undifferentiated "semantic mismatch", losing
 * exactly the detailed findings (`added_property`, `reassigned_property`) that make
 * this architecture worth building. Aligning on TOPOLOGY answers "which node is
 * which"; comparing properties afterwards answers "what changed". Both stay
 * judgement-free.
 *
 * ⛔ AMBIGUITY IS REPORTED, NEVER GUESSED. Where more than one alignment survives,
 * the verdict says so rather than choosing.
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
  | { admitted: false; refusal: 'revision_not_semantically_conservative'; findings: readonly ConservationFinding[] }
  /** ⛔ More than one alignment survives. The comparator does NOT choose. */
  | { admitted: false; refusal: 'correspondence_ambiguous'; alignments: number }
  /** No alignment exists: the edge topologies are not the same shape. */
  | { admitted: false; refusal: 'structure_mismatch'; findings: readonly ConservationFinding[] }
  /** Beyond the exhaustive bound. Refuses rather than approximating. */
  | { admitted: false; refusal: 'graph_too_large'; nodes: number };

/** Exhaustive permutation is fine at this size and far easier to audit. */
export const MAX_ALIGNABLE_NODES = 8;

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
  if (source.nodes.length !== candidate.nodes.length) {
    return {
      admitted: false,
      refusal: 'structure_mismatch',
      findings: [{ kind: 'node_count', source: source.nodes.length, candidate: candidate.nodes.length }],
    };
  }
  if (source.nodes.length > MAX_ALIGNABLE_NODES) {
    return { admitted: false, refusal: 'graph_too_large', nodes: source.nodes.length };
  }

  const n = source.nodes.length;
  const sourceEdges = new Set(source.edges.map((e) => `${e.from}>${e.to}:${e.kind}`));

  /* A mapping sends CANDIDATE index -> SOURCE index. It is topology-valid when the
     candidate's edges, rewritten through it, are exactly the source's edges. */
  const valid: number[][] = [];
  const perm: number[] = [];
  const used = new Array<boolean>(n).fill(false);
  const walk = (): void => {
    if (perm.length === n) {
      if (candidate.edges.length !== source.edges.length) return;
      for (const e of candidate.edges) {
        if (!sourceEdges.has(`${perm[e.from]}>${perm[e.to]}:${e.kind}`)) return;
      }
      valid.push([...perm]);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true; perm.push(i);
      walk();
      perm.pop(); used[i] = false;
    }
  };
  walk();

  if (valid.length === 0) {
    /* No alignment: report the edge differences under the identity mapping, which
       is diagnostic only and is named as such in the refusal kind. */
    const findings: ConservationFinding[] = [];
    const cKeys = new Set(candidate.edges.map((e) => `${e.from}>${e.to}`));
    for (const e of source.edges) {
      const match = candidate.edges.find((x) => x.from === e.from && x.to === e.to);
      if (!match) findings.push({ kind: 'dropped_edge', edge: e });
      else if (match.kind !== e.kind) {
        findings.push({ kind: 'changed_edge_kind', from: e.from, to: e.to, source: e.kind, candidate: match.kind });
      }
    }
    for (const e of candidate.edges) {
      if (!source.edges.some((x) => x.from === e.from && x.to === e.to)) {
        findings.push({ kind: 'added_edge', edge: e });
      }
    }
    return { admitted: false, refusal: 'structure_mismatch', findings };
  }

  /* Several topology-valid alignments can exist when the graph has automorphisms.
     Prefer the one that also preserves properties — if exactly one does, it is the
     intended correspondence and no judgement was required to find it. */
  const propertyPreserving = valid.filter((m) =>
    m.every((si, ci) => PROPERTIES.every((p) =>
      valueOf(candidate.nodes[ci], p) === valueOf(source.nodes[si], p))));

  let mapping: number[];
  if (propertyPreserving.length === 1) mapping = propertyPreserving[0];
  else if (propertyPreserving.length > 1) return { admitted: true };
  else if (valid.length === 1) mapping = valid[0];
  else return { admitted: false, refusal: 'correspondence_ambiguous', alignments: valid.length };

  const findings: ConservationFinding[] = [];
  for (let ci = 0; ci < n; ci++) {
    const si = mapping[ci];
    for (const p of PROPERTIES) {
      const sv = valueOf(source.nodes[si], p);
      const cv = valueOf(candidate.nodes[ci], p);
      if (sv === cv) continue;
      if (sv === 'unspecified') findings.push({ kind: 'added_property', node: si, property: p, candidate: cv });
      else if (cv === 'unspecified') findings.push({ kind: 'dropped_property', node: si, property: p, source: sv });
      else findings.push({ kind: 'changed_property', node: si, property: p, source: sv, candidate: cv });
    }
  }

  /* ⭐ Reassignment: a (property, value) the source asserted on one node appears on
     a DIFFERENT node in the candidate. Reported IN ADDITION to the drop/add pair,
     because "moved" is a different fact about the Work than "lost here" and
     "invented there" — and it is the finding no per-phrase rule can reach. */
  for (const p of PROPERTIES) {
    for (let ci = 0; ci < n; ci++) {
      const si = mapping[ci];
      const sv = valueOf(source.nodes[si], p);
      if (sv === 'unspecified' || valueOf(candidate.nodes[ci], p) === sv) continue;
      for (let cj = 0; cj < n; cj++) {
        if (cj === ci) continue;
        const sj = mapping[cj];
        if (valueOf(candidate.nodes[cj], p) === sv && valueOf(source.nodes[sj], p) !== sv) {
          findings.push({ kind: 'reassigned_property', property: p, value: sv, sourceNode: si, candidateNode: sj });
        }
      }
    }
  }

  return findings.length === 0
    ? { admitted: true }
    : { admitted: false, refusal: 'revision_not_semantically_conservative', findings };
}
