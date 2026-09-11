/**
 * SV-2 · SV-3 — schema adequacy repairs for `analyzer/2`.
 *
 * ⛔ PROMPT TUNING IS HELD. These test what the REPRESENTATION can hold, not what
 * an analyser chooses to say. A1 is an analyser question and is not addressed here.
 */
import { admitAnalysis, analyzerToolSchema, ANALYZER_VERSION } from '../lib/manuscript/revision/analyze';
import { compareConservation } from '../lib/manuscript/revision/semanticGraph';

const node = (over: Record<string, unknown> = {}) =>
  ({ local_id: 'n', kind: 'state', properties: {}, ...over });

describe('⛔ version is evidence — a schema repair creates a NEW SUBJECT', () => {
  it('the analyser is now v2; v1 keeps the A-S failure', () => {
    expect(ANALYZER_VERSION).toBe('RC-GEN-01/analyzer/2');
  });
});

describe('⭐ SV-2 RELATION ADEQUACY — directedness is now representable', () => {
  const relations = (analyzerToolSchema.properties as any).edges.items.properties.relation.enum;

  it('the schema admits `has_object`', () => {
    expect(relations).toContain('has_object');
  });

  it('⛔ and nothing fixture-shaped was added', () => {
    for (const r of relations) {
      expect(r).not.toMatch(/natural|world|orientation|integration|perspective/i);
    }
  });

  /* The founder's three non-fixture cases. Each must encode without inventing a
     property and without borrowing a relation that means something else. */
  it.each([
    ['attention directed toward the sound', 'attention', 'sound'],
    ['hostility directed toward the stranger', 'hostility', 'stranger'],
    ['orientation directed toward the landscape', 'orientation', 'landscape'],
  ])('represents: %s', (_label, subject, object) => {
    const r = admitAnalysis({
      nodes: [
        { local_id: subject, kind: 'state', properties: {} },
        { local_id: object, kind: 'entity', properties: {} },
      ],
      edges: [{ from: subject, to: object, relation: 'has_object' }],
    });
    expect(r.ok).toBe(true);
  });

  it('⭐ the A-S v1 gap closes: a relation node can now be joined to its object', () => {
    const withObject = admitAnalysis({
      nodes: [
        { local_id: 'orientation', kind: 'relation', properties: {} },
        { local_id: 'world', kind: 'entity', properties: {} },
      ],
      edges: [{ from: 'orientation', to: 'world', relation: 'has_object' }],
    });
    if (!withObject.ok) throw new Error('unreachable');
    expect(withObject.graph.edges).toHaveLength(1);

    /* And the v1 shape — both nodes present, no edge — is now DISTINGUISHABLE
       from the correct one rather than being the only expressible option. */
    const v1Shape = admitAnalysis({
      nodes: [
        { local_id: 'orientation', kind: 'relation', properties: {} },
        { local_id: 'world', kind: 'entity', properties: {} },
      ],
      edges: [],
    });
    if (!v1Shape.ok) throw new Error('unreachable');
    const v = compareConservation(withObject.graph, v1Shape.graph);
    expect(v.admitted).toBe(false);
  });
});

describe('⭐ SV-3 DISCRIMINATOR — can the agency dimension hold all three, unforced?', () => {
  /* The founder's three fixtures, encoded by hand. The question is
     REPRESENTABILITY, not what an analyser would choose. */
  it.each([
    ['ACTIVE   "He deliberately worked on integrating the experience."', 'active_participation'],
    ['PASSIVE  "He underwent the procedure while unconscious."', 'undergone'],
    ['NEUTRAL  "Integration continued over the following months."', 'unspecified'],
  ])('%s', (_label, agency) => {
    const r = admitAnalysis({
      nodes: [node({ kind: 'process', properties: { agency } })],
      edges: [],
    });
    expect(r.ok).toBe(true);
  });

  it('⭐ the three are mutually DISTINGUISHABLE by the comparator', () => {
    const g = (agency: string) => {
      const r = admitAnalysis({ nodes: [node({ kind: 'process', properties: { agency } })], edges: [] });
      if (!r.ok) throw new Error('unreachable');
      return r.graph;
    };
    expect(compareConservation(g('active_participation'), g('undergone')).admitted).toBe(false);
    expect(compareConservation(g('unspecified'), g('undergone')).admitted).toBe(false);
    expect(compareConservation(g('unspecified'), g('active_participation')).admitted).toBe(false);
  });

  it('⭐ neutral is representable WITHOUT choosing a participation role', () => {
    /* The decisive question: does the schema FORCE a commitment where the prose
       makes none? It does not — omitting the property is legal and admitted. */
    expect(admitAnalysis({ nodes: [node({ kind: 'process', properties: {} })], edges: [] }).ok).toBe(true);
  });
});

describe('⚠️ SV-4 — a THIRD adequacy gap, found while running the SV-3 discriminator', () => {
  /**
   * ⭐ THE SCHEMA LETS ANY PROPERTY ATTACH TO ANY NODE KIND.
   *
   * In A-S v1, `agency` was attached to the TRANSFORMATION node. But a
   * transformation does not act or undergo — the PERSON does. The dimension may
   * not apply to that node at all, and the schema offered no way to say so: the
   * analyser's only options were to pick a participation role or omit a property
   * that was never applicable.
   *
   * ⛔ `unspecified` and `not applicable` are DIFFERENT CLAIMS. "The source does
   * not say whether he participated" is not "participation is not a property of
   * this node." Collapsing them is the same shape as SV-1.
   *
   * ⛔ NOT REPAIRED. Surfaced for a founder ruling, because the repair is a schema
   * change and prompt tuning is held.
   */
  it('⚠️ agency is currently attachable to ANY kind, including ones it may not apply to', () => {
    for (const kind of ['event', 'state', 'process', 'relation', 'entity']) {
      expect(admitAnalysis({
        nodes: [{ local_id: 'n', kind, properties: { agency: 'undergone' } }], edges: [],
      }).ok).toBe(true);
    }
  });

  it('⚠️ and the vocabulary cannot distinguish `unspecified` from `not applicable`', () => {
    const values = (analyzerToolSchema.properties as any).nodes.items
      .properties.properties.properties.agency.enum;
    expect(values).toContain('unspecified');
    expect(values).not.toContain('not_applicable');
  });
});
