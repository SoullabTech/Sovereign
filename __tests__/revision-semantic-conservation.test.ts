/**
 * RC-GEN-01 · SC-1..SC-11 — the design gate the founder set:
 *
 *   "If this architecture cannot reject that exact run-8/run-9 candidate from a
 *    graph derived solely from the source, stop. Don't build the rest."
 *
 * ⚠️ WHAT THIS SUITE PROVES AND WHAT IT DOES NOT. It proves the COMPARATOR
 * rejects the real candidate given correct graphs. Whether the ANALYSERS produce
 * correct graphs from real prose is a separate provider witness and is NOT
 * established here.
 */
import {
  compareConservation,
  type SemanticGraph,
  type ConservationFinding,
} from '../lib/manuscript/revision/semanticGraph';

/* ── the real fixture, as a source-only analysis would encode it ──────────────
   "The experience facilitated a significant transformation in his relational
    orientation toward the natural world, and the resulting shift in perspective
    constituted a meaningful development in his ongoing process of integration." */
const SOURCE: SemanticGraph = {
  nodes: [
    { label: 'experience', properties: {} },
    { label: 'transformation_in_relational_orientation',
      properties: { significance: 'asserted', magnitude: 'unspecified', valence: 'unspecified' } },
    { label: 'shift_in_perspective', properties: { valence: 'unspecified' } },
    { label: 'development', properties: { meaningfulness: 'asserted', direction: 'unspecified' } },
    { label: 'process_of_integration',
      properties: { temporality: 'ongoing', valence: 'unspecified' } },
  ],
  edges: [
    { from: 0, to: 1, kind: 'causes' },
    { from: 1, to: 2, kind: 'results_in' },
    { from: 2, to: 3, kind: 'constitutes' },
    { from: 3, to: 4, kind: 'within' },
  ],
};

/* The run-8 / run-9 candidate, as a candidate-only analysis would encode it:
   "...a LARGE change in how he related... the process of integration he was
    ALREADY ENGAGED IN." */
const RUN_8_9: SemanticGraph = {
  nodes: [
    { label: 'experience', properties: {} },
    { label: 'change_in_relation', properties: { magnitude: 'high', significance: 'unspecified' } },
    { label: 'shift_in_seeing', properties: {} },
    { label: 'development', properties: { meaningfulness: 'asserted' } },
    { label: 'process_of_integration',
      properties: { temporality: 'ongoing' } },
  ],
  edges: [
    { from: 0, to: 1, kind: 'causes' },
    { from: 1, to: 2, kind: 'results_in' },
    { from: 2, to: 3, kind: 'constitutes' },
    { from: 3, to: 4, kind: 'within' },
  ],
};

const kinds = (f: readonly ConservationFinding[]) => f.map((x) => x.kind);

describe('⭐⭐ THE DESIGN GATE — the real run-8/9 candidate must be REFUSED', () => {
  const v = compareConservation(SOURCE, RUN_8_9);

  it('refuses', () => {
    expect(v.admitted).toBe(false);
  });

  it('⭐ SC-7 — catches `significant transformation` -> `large change` as an ADDED property', () => {
    if (v.admitted) throw new Error('unreachable');
    expect(v.findings).toContainEqual(
      { kind: 'added_property', node: 1, property: 'magnitude', candidate: 'high' });
  });

  it('⭐ catches the DROPPED significance on that same node', () => {
    if (v.admitted) throw new Error('unreachable');
    expect(v.findings).toContainEqual(
      { kind: 'dropped_property', node: 1, property: 'significance', source: 'asserted' });
  });

  /**
   * ⭐⭐ SV-4 CHANGED HOW THIS DRIFT IS CAUGHT, AND THE CHANGE IS WORTH NAMING.
   *
   * Under analyzer/2 the run-8/9 drift `ongoing process` -> `he was already engaged
   * in` was an ADDED PROPERTY on node 4 (`agency = active_participation`). Under
   * analyzer/3 participation is not a property of the process at all — it is an edge
   * from the PERSON to it, and the person is a node in his own right.
   *
   * ⚠️ SO THE DETECTION MOVES FROM THE PROPERTY PASS TO THE STRUCTURE PASS, and
   * that has a real consequence: a structural difference short-circuits alignment,
   * so an added participation edge and a property drift are no longer reported in
   * one findings list. The VERDICT is unchanged — both refuse — but the findings are
   * less granular when both occur together. ⛔ Recorded as a consequence of the
   * ruling, not designed around.
   */
  it('⭐ the run-8/9 participation drift is caught as an ADDED EDGE, not a property', () => {
    const withParticipant = (participates: boolean): SemanticGraph => ({
      nodes: [
        { label: 'person', kind: 'entity', properties: {} },
        { label: 'process_of_integration', kind: 'process', properties: { temporality: 'ongoing' } },
      ],
      edges: participates
        ? [{ from: 0, to: 1, kind: 'actively_participates_in' }]
        : [],
    });
    /* The source says the process is ongoing and HIS. It does not say he was
       already engaged in it. The candidate says he was. */
    const drift = compareConservation(withParticipant(false), withParticipant(true));
    expect(drift.admitted).toBe(false);
    if (drift.admitted) throw new Error('unreachable');
    expect(drift.refusal).toBe('structure_mismatch');
    expect(kinds((drift as Extract<typeof drift, { findings: readonly ConservationFinding[] }>).findings))
      .toContain('added_edge');
  });

  it('⛔ and the process itself carries no participation property to drift', () => {
    expect(SOURCE.nodes[4].properties).not.toHaveProperty('agency');
    expect(RUN_8_9.nodes[4].properties).not.toHaveProperty('agency');
  });

  it('names the refusal exactly', () => {
    if (v.admitted) throw new Error('unreachable');
    expect(v.refusal).toBe('revision_not_semantically_conservative');
  });
});

describe('⭐ SC-10 — the run-9 property MIGRATION, which no per-phrase rule can reach', () => {
  /* source: SIGNIFICANT on node 1, MEANINGFUL on node 3
     run 9:  LARGE on node 1,       SIGNIFICANT on node 3 */
  const RUN_9_MIGRATION: SemanticGraph = {
    ...RUN_8_9,
    nodes: RUN_8_9.nodes.map((n, i) =>
      i === 1 ? { ...n, properties: { magnitude: 'high' as const } }
      : i === 3 ? { label: n.label, properties: { significance: 'asserted' as const } }
      : n),
  };
  const v = compareConservation(SOURCE, RUN_9_MIGRATION);

  it('reports the property as REASSIGNED, not merely dropped and added', () => {
    if (v.admitted) throw new Error('unreachable');
    expect(v.findings).toContainEqual({
      kind: 'reassigned_property', property: 'significance', value: 'asserted',
      sourceNode: 1, candidateNode: 3,
    });
  });

  it('⭐ every word could be defensible while the DISTRIBUTION changed', () => {
    if (v.admitted) throw new Error('unreachable');
    expect(kinds(v.findings)).toContain('reassigned_property');
  });
});

describe('SC-8 · SC-9 — edges and nodes', () => {
  it('SC-8 a dropped edge fails', () => {
    const c = { ...RUN_8_9, edges: RUN_8_9.edges.filter((e) => !(e.from === 1 && e.to === 2)) };
    const v = compareConservation(SOURCE, c);
    if (v.admitted) throw new Error('unreachable');
    expect(kinds(v.findings)).toContain('dropped_edge');
  });

  it('a changed edge KIND fails — constitutes -> qualifies', () => {
    const c = { ...SOURCE, edges: SOURCE.edges.map((e) =>
      e.from === 2 && e.to === 3 ? { ...e, kind: 'qualifies' as const } : e) };
    const v = compareConservation(SOURCE, c);
    if (v.admitted) throw new Error('unreachable');
    expect(kinds(v.findings)).toContain('changed_edge_kind');
  });

  it('SC-9 merged nodes fail', () => {
    const c = { nodes: SOURCE.nodes.slice(0, 4), edges: SOURCE.edges.slice(0, 3) };
    const v = compareConservation(SOURCE, c);
    if (v.admitted) throw new Error('unreachable');
    expect(v.findings).toContainEqual({ kind: 'node_count', source: 5, candidate: 4 });
  });
});

describe('⭐ the comparator admits a genuinely conservative revision', () => {
  it('an identical graph is admitted — the gate is not simply "always refuse"', () => {
    expect(compareConservation(SOURCE, SOURCE)).toEqual({ admitted: true });
  });

  it('⭐ different LABELS with identical structure are admitted', () => {
    /* The two analysers never see each other, so labels differ by construction.
       Label mismatch must never be a finding. */
    const relabelled: SemanticGraph = {
      nodes: SOURCE.nodes.map((n, i) => ({ ...n, label: `node_${i}` })),
      edges: SOURCE.edges,
    };
    expect(compareConservation(SOURCE, relabelled)).toEqual({ admitted: true });
  });

  it('absence and `unspecified` are the same claim', () => {
    const explicit: SemanticGraph = {
      nodes: SOURCE.nodes.map((n) => ({ ...n, properties: { ...n.properties, polarity: 'unspecified' as const } })),
      edges: SOURCE.edges,
    };
    expect(compareConservation(SOURCE, explicit)).toEqual({ admitted: true });
  });
});

describe('SC-11 — failure refuses; it never asks for another attempt', () => {
  it('the verdict carries no retry, revise or regenerate affordance', () => {
    const v = compareConservation(SOURCE, RUN_8_9);
    expect(JSON.stringify(v)).not.toMatch(/retry|regenerate|revise|again|attempt/i);
  });

  it('the refusal is a terminal name, not a suggestion', () => {
    if (compareConservation(SOURCE, RUN_8_9).admitted) throw new Error('unreachable');
  });
});

describe('SC-5 · SC-6 — the comparator is deterministic and self-contained', () => {
  it('same inputs, same verdict', () => {
    expect(compareConservation(SOURCE, RUN_8_9)).toEqual(compareConservation(SOURCE, RUN_8_9));
  });

  it('⛔ the module imports no model, no provider and no prompt', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '../lib/manuscript/revision/semanticGraph.ts'), 'utf8');
    for (const forbidden of ['runStructured', 'anthropic', 'import {', 'require(']) {
      expect(src).not.toContain(forbidden);
    }
  });
});

/* ── founder rulings after the design gate ──────────────────────────────────── */

/** Reorder a graph's node array without changing the graph it denotes. */
function reorder(g: SemanticGraph, order: readonly number[]): SemanticGraph {
  const pos = new Map(order.map((old, neu) => [old, neu]));
  return {
    nodes: order.map((old) => g.nodes[old]),
    edges: g.edges.map((e) => ({ ...e, from: pos.get(e.from)!, to: pos.get(e.to)! })),
  };
}

describe('⭐⭐ node correspondence is NOT positional (founder refused to ratify it)', () => {
  it('⭐ the SAME graph in a DIFFERENT node order is ADMITTED', () => {
    /* A faithful revision may reorder its expression. Two independent analysers
       emitting in textual encounter order would then disagree about nodes that
       correspond perfectly. A positional comparator reports corruption here. */
    const shuffled = reorder(SOURCE, [4, 0, 3, 1, 2]);
    expect(compareConservation(SOURCE, shuffled)).toEqual({ admitted: true });
  });

  it('a full reversal is ADMITTED', () => {
    expect(compareConservation(SOURCE, reorder(SOURCE, [4, 3, 2, 1, 0]))).toEqual({ admitted: true });
  });

  it('⛔ and reordering does NOT launder a real defect', () => {
    const v = compareConservation(SOURCE, reorder(RUN_8_9, [4, 0, 3, 1, 2]));
    expect(v.admitted).toBe(false);
  });
});

describe('⭐ the metamorphic pair — distribution, not textual resemblance', () => {
  it('GOOD PARAPHRASE — different labels, different order, same semantics -> ADMIT', () => {
    const good: SemanticGraph = reorder({
      nodes: SOURCE.nodes.map((n, i) => ({ label: `renamed_${i}`, properties: n.properties })),
      edges: SOURCE.edges,
    }, [2, 4, 1, 3, 0]);
    expect(compareConservation(SOURCE, good)).toEqual({ admitted: true });
  });

  it('⭐ BAD PARAPHRASE — same inventory, same node count, ONE property reassigned -> REFUSE', () => {
    /* The vocabulary is entirely the source's own. Only the DISTRIBUTION moved. */
    const bad: SemanticGraph = {
      nodes: SOURCE.nodes.map((n, i) =>
        i === 1 ? { ...n, properties: { ...n.properties, significance: 'unspecified' as const } }
        : i === 2 ? { ...n, properties: { ...n.properties, significance: 'asserted' as const } }
        : n),
      edges: SOURCE.edges,
    };
    const v = compareConservation(SOURCE, bad);
    expect(v.admitted).toBe(false);
    if (v.admitted || v.refusal !== 'revision_not_semantically_conservative') throw new Error('wrong refusal');
    expect(kinds(v.findings)).toContain('reassigned_property');
  });
});

describe('⛔ SV-1 REPRESENTATIONAL ADEQUACY — the known-bad that must be preserved', () => {
  /**
   * ⭐ A semantic-conservation system can only conserve distinctions its
   * representation can express. This is the schema's own acceptance criterion,
   * and being CLOSED does not satisfy it.
   *
   * The known-bad is the first draft of this module's vocabulary, which collapsed
   * the source's two distinct degree words — SIGNIFICANT transformation and
   * MEANINGFUL development — into one `significance` property.
   */
  const flatten = (g: SemanticGraph): SemanticGraph => ({
    nodes: g.nodes.map((n) => {
      const { meaningfulness, ...rest } = n.properties;
      return { ...n, properties: meaningfulness ? { ...rest, significance: meaningfulness } : n.properties };
    }),
    edges: g.edges,
  });

  const RUN_9 = {
    ...RUN_8_9,
    nodes: RUN_8_9.nodes.map((n, i) =>
      i === 1 ? { ...n, properties: { magnitude: 'high' as const } }
      : i === 3 ? { label: n.label, properties: { significance: 'asserted' as const } }
      : n),
  };

  it('⭐ the ADEQUATE vocabulary reports the migration', () => {
    const v = compareConservation(SOURCE, RUN_9);
    if (v.admitted || v.refusal !== 'revision_not_semantically_conservative') throw new Error('unreachable');
    expect(kinds(v.findings)).toContain('reassigned_property');
  });

  it('⛔ the FLATTENED vocabulary loses it — the migration becomes invisible', () => {
    const v = compareConservation(flatten(SOURCE), flatten(RUN_9));
    const lost = v.admitted || !('findings' in v) ||
      !kinds(v.findings as ConservationFinding[]).includes('reassigned_property');
    expect(lost).toBe(true);
  });
});

describe('ambiguity is reported, never guessed', () => {
  it('⭐ a symmetric graph with no distinguishing properties refuses as ambiguous', () => {
    /* Two nodes, one edge each way: two topology-valid alignments, neither
       distinguishable by properties. The comparator must NOT pick one. */
    const sym: SemanticGraph = {
      nodes: [{ label: 'a', properties: {} }, { label: 'b', properties: {} }],
      edges: [{ from: 0, to: 1, kind: 'distinct_from' }, { from: 1, to: 0, kind: 'distinct_from' }],
    };
    const other: SemanticGraph = {
      nodes: [{ label: 'x', properties: { magnitude: 'high' } }, { label: 'y', properties: {} }],
      edges: sym.edges,
    };
    const v = compareConservation(sym, other);
    expect(v.admitted).toBe(false);
    if (v.admitted) throw new Error('unreachable');
    expect(v.refusal).toBe('correspondence_ambiguous');
  });

  it('a differing node count refuses as structure_mismatch, not ambiguity', () => {
    const v = compareConservation(SOURCE, { nodes: SOURCE.nodes.slice(0, 4), edges: SOURCE.edges.slice(0, 3) });
    if (v.admitted) throw new Error('unreachable');
    expect(v.refusal).toBe('structure_mismatch');
  });
});

describe('⭐⭐ THE SYMMETRY FALSIFIER — asserted semantics may never choose their own mapping', () => {
  /**
   * Two topology-equivalent nodes. The source asserts a property on node 1; the
   * candidate asserts it on node 2. A comparator that breaks the tie by
   * property-preservation will pick the swapped mapping, find everything lines
   * up, and ADMIT — laundering the exact migration this architecture exists to
   * catch. The answer would have defined the test by which it passed.
   */
  const symSource: SemanticGraph = {
    nodes: [
      { label: 'hub', properties: {} },
      { label: 'a', properties: { significance: 'asserted' } },
      { label: 'b', properties: {} },
    ],
    edges: [
      { from: 0, to: 1, kind: 'causes' },
      { from: 0, to: 2, kind: 'causes' },
    ],
  };
  /* Same structure; the property has moved from node 1 to node 2. */
  const symMigrated: SemanticGraph = {
    nodes: [
      { label: 'hub', properties: {} },
      { label: 'a', properties: {} },
      { label: 'b', properties: { significance: 'asserted' } },
    ],
    edges: symSource.edges,
  };

  it('⛔ NEVER ADMITS by swapping the correspondence', () => {
    const v = compareConservation(symSource, symMigrated);
    expect(v.admitted).toBe(false);
  });

  it('⭐ reports correspondence_ambiguous — structure alone cannot say which is which', () => {
    const v = compareConservation(symSource, symMigrated);
    if (v.admitted) throw new Error('unreachable');
    expect(v.refusal).toBe('correspondence_ambiguous');
  });

  it('⭐ and when an INDEPENDENT STRUCTURAL anchor makes identity determinate, it reports the migration', () => {
    /* `kind` is structural/identity-bearing, so it may disambiguate. The asserted
       semantics still play no part in choosing the mapping. */
    const anchoredSource: SemanticGraph = {
      nodes: [
        { label: 'hub', kind: 'event', properties: {} },
        { label: 'a', kind: 'state', properties: { significance: 'asserted' } },
        { label: 'b', kind: 'process', properties: {} },
      ],
      edges: symSource.edges,
    };
    const anchoredMigrated: SemanticGraph = {
      nodes: [
        { label: 'hub', kind: 'event', properties: {} },
        { label: 'a', kind: 'state', properties: {} },
        { label: 'b', kind: 'process', properties: { significance: 'asserted' } },
      ],
      edges: symSource.edges,
    };
    const v = compareConservation(anchoredSource, anchoredMigrated);
    if (v.admitted || v.refusal !== 'revision_not_semantically_conservative') throw new Error('wrong verdict');
    expect(kinds(v.findings)).toContain('reassigned_property');
  });

  it('⛔ a property-preserving swap is STILL not admitted where structure is symmetric', () => {
    /* The strongest form: the candidate is a perfect relabelling under a swapped
       mapping. A tie-breaking comparator admits this. Ours refuses. */
    const v = compareConservation(symSource, symMigrated);
    expect(JSON.stringify(v)).not.toContain('"admitted":true');
  });
});

describe('⛔ structural identity and asserted semantics are separated in the SCHEMA', () => {
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '../lib/manuscript/revision/semanticGraph.ts'), 'utf8');

  it('`kind` is documented as structural and may determine correspondence', () => {
    expect(src).toContain('STRUCTURAL / IDENTITY-BEARING');
  });

  it('⭐ `properties` is documented as never choosing a correspondence', () => {
    expect(src).toContain('ASSERTED SEMANTICS');
    expect(src).toContain('never chooses one');
  });

  it('⛔ the alignment search does not read `properties` at all', () => {
    const search = src.slice(src.indexOf('const walk ='), src.indexOf('walk();\n\n'));
    expect(search).not.toContain('properties');
    expect(search).not.toContain('valueOf');
  });
});
