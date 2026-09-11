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
      properties: { temporality: 'ongoing', agency: 'unspecified', valence: 'unspecified' } },
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
      properties: { temporality: 'ongoing', agency: 'active_participation' } },
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

  it('⭐ catches `ongoing process` -> `he was already engaged in` as ADDED agency', () => {
    if (v.admitted) throw new Error('unreachable');
    expect(v.findings).toContainEqual(
      { kind: 'added_property', node: 4, property: 'agency', candidate: 'active_participation' });
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
