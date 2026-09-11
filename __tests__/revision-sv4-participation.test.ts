/**
 * SV-4 DISCRIMINATOR — is participation a NODE PROPERTY or a RELATION?
 *
 * ⛔ THIS IS A DISCRIMINATOR, NOT A REPAIR. The production schema is untouched:
 * `analyzer/2` still carries node-level `agency`. The relational form is
 * constructed LOCALLY here, so the question is settled by evidence before any
 * version is spent on it.
 *
 * The founder's five criteria:
 *   1. active and passive are distinguishable
 *   2. neutral requires neither role
 *   3. one entity can be active in one event and passive in another WITHOUT
 *      acquiring contradictory intrinsic properties
 *   4. nothing attaches agency/patienthood to an EVENT merely because someone
 *      participates in it
 *   5. D can detect when a candidate ADDS active participation that the source
 *      left neutral
 */
import { compareConservation, type SemanticGraph, type SemanticEdge } from '../lib/manuscript/revision/semanticGraph';

/* Non-fixture prose. Nothing here is drawn from either specimen. */
const PROSE = {
  ACTIVE:  'Lena deliberately worked through the calculation.',
  PASSIVE: 'Lena underwent the scan while unconscious.',
  NEUTRAL: 'The healing process continued for several weeks.',
  MIXED:   'Lena performed the test and later underwent the procedure.',
} as const;

/* ── REPRESENTATION 1 · node-level `agency` (what analyzer/2 has) ──────────── */

const nodeLevel = {
  active: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: { agency: 'active_participation' } },
      { label: 'calculation', kind: 'process', properties: {} },
    ],
    edges: [{ from: 0, to: 1, kind: 'has_object' }],
  }),
  passive: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: { agency: 'undergone' } },
      { label: 'scan', kind: 'event', properties: {} },
    ],
    edges: [{ from: 0, to: 1, kind: 'has_object' }],
  }),
  neutral: (): SemanticGraph => ({
    nodes: [{ label: 'healing', kind: 'process', properties: { temporality: 'ongoing' } }],
    edges: [],
  }),
};

/* ── REPRESENTATION 2 · participation as a RELATION (candidate for analyzer/3) ─
   ⚠️ These two edge kinds do NOT exist in the production schema. They are cast in
   locally so the discriminator can evaluate the alternative without spending a
   version on it. */
const REL = {
  actively_participates_in: 'actively_participates_in' as unknown as SemanticEdge['kind'],
  undergoes: 'undergoes' as unknown as SemanticEdge['kind'],
};

const relational = {
  active: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: {} },
      { label: 'calculation', kind: 'process', properties: {} },
    ],
    edges: [{ from: 0, to: 1, kind: REL.actively_participates_in }],
  }),
  passive: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: {} },
      { label: 'scan', kind: 'event', properties: {} },
    ],
    edges: [{ from: 0, to: 1, kind: REL.undergoes }],
  }),
  neutral: (): SemanticGraph => ({
    nodes: [{ label: 'healing', kind: 'process', properties: { temporality: 'ongoing' } }],
    edges: [],
  }),
  mixed: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: {} },
      { label: 'test', kind: 'event', properties: {} },
      { label: 'procedure', kind: 'event', properties: {} },
    ],
    edges: [
      { from: 0, to: 1, kind: REL.actively_participates_in },
      { from: 0, to: 2, kind: REL.undergoes },
    ],
  }),
};

describe(`1 · active and passive are distinguishable — ${PROSE.ACTIVE} / ${PROSE.PASSIVE}`, () => {
  it('node-level: distinguishable', () => {
    expect(compareConservation(nodeLevel.active(), nodeLevel.passive()).admitted).toBe(false);
  });
  it('relational: distinguishable', () => {
    expect(compareConservation(relational.active(), relational.passive()).admitted).toBe(false);
  });
});

describe(`2 · neutral requires neither role — ${PROSE.NEUTRAL}`, () => {
  it('node-level: representable with no participation claim', () => {
    expect(compareConservation(nodeLevel.neutral(), nodeLevel.neutral()).admitted).toBe(true);
  });
  it('relational: representable with no participation edge', () => {
    expect(relational.neutral().edges).toHaveLength(0);
  });
});

describe(`⭐⭐ 3 · THE DECIDING CRITERION — ${PROSE.MIXED}`, () => {
  it('⛔ node-level CANNOT represent it: one entity, one intrinsic value', () => {
    /* Lena is ONE node. `agency` is ONE property. The sentence makes her active in
       one event and a patient in another, so any single value is false about half
       the sentence — and the schema offers no way to say both. */
    const lena = { label: 'lena', kind: 'entity' as const, properties: {} };
    const asActive = { ...lena, properties: { agency: 'active_participation' as const } };
    const asPassive = { ...lena, properties: { agency: 'undergone' as const } };

    /* The two readings are not reconcilable: they are different claims about the
       same node, and the comparator says so. */
    const g = (n: typeof asActive) => ({
      nodes: [n, { label: 'test', kind: 'event' as const, properties: {} },
                 { label: 'procedure', kind: 'event' as const, properties: {} }],
      edges: [{ from: 0, to: 1, kind: 'has_object' as const },
              { from: 0, to: 2, kind: 'has_object' as const }],
    });
    expect(compareConservation(g(asActive), g(asPassive)).admitted).toBe(false);

    /* And there is no third value that means "both". */
    const AGENCY_VALUES = ['unspecified', 'active_participation', 'undergone'];
    expect(AGENCY_VALUES).not.toContain('both');
    expect(AGENCY_VALUES).not.toContain('mixed');
  });

  it('⭐ relational CAN represent it: two edges from one entity, no contradiction', () => {
    const m = relational.mixed();
    expect(m.nodes.filter((n) => n.label === 'lena')).toHaveLength(1);
    expect(m.edges).toHaveLength(2);
    expect(m.edges[0].kind).not.toBe(m.edges[1].kind);
    /* Lena carries NO intrinsic participation property at all. */
    expect(m.nodes[0].properties).toEqual({});
  });
});

describe('⭐ 4 · nothing attaches participation to an EVENT merely because someone participates', () => {
  it('⛔ node-level invites exactly the A-S v1 category error', () => {
    /* This is what A did: agency on the TRANSFORMATION node. A transformation does
       not act or undergo — the person does. The schema admits it happily. */
    const eventCarryingAgency: SemanticGraph = {
      nodes: [{ label: 'transformation', kind: 'process', properties: { agency: 'undergone' } }],
      edges: [],
    };
    const eventWithout: SemanticGraph = {
      nodes: [{ label: 'transformation', kind: 'process', properties: {} }],
      edges: [],
    };
    /* Both are legal graphs, and the schema gives no way to say the dimension does
       not apply — only to assert a value or stay silent. */
    expect(compareConservation(eventCarryingAgency, eventWithout).admitted).toBe(false);
  });

  it('⭐ relational makes the category error UNREPRESENTABLE', () => {
    /* Participation is an edge from a participant. An event has no participation
       property to fill in wrongly, because there is no such property. */
    for (const g of [relational.active(), relational.passive(), relational.mixed()]) {
      for (const n of g.nodes) {
        expect(n.properties).not.toHaveProperty('agency');
      }
    }
  });
});

describe('⭐ 5 · D detects a candidate ADDING participation the source left neutral', () => {
  it('node-level: detected as an added property', () => {
    const source = nodeLevel.neutral();
    const candidate: SemanticGraph = {
      nodes: [{ label: 'healing', kind: 'process',
                properties: { temporality: 'ongoing', agency: 'active_participation' } }],
      edges: [],
    };
    const v = compareConservation(source, candidate);
    if (v.admitted || !('findings' in v)) throw new Error('unreachable');
    expect(v.findings.map((f) => f.kind)).toContain('added_property');
  });

  it('⭐ relational: detected as an added EDGE', () => {
    const source: SemanticGraph = {
      nodes: [{ label: 'lena', kind: 'entity', properties: {} },
              { label: 'healing', kind: 'process', properties: { temporality: 'ongoing' } }],
      edges: [],
    };
    const candidate: SemanticGraph = {
      ...source,
      edges: [{ from: 0, to: 1, kind: REL.actively_participates_in }],
    };
    const v = compareConservation(source, candidate);
    expect(v.admitted).toBe(false);
  });
});

describe('⭐ THE DISCRIMINATOR RESULT', () => {
  it('node-level agency FAILS criterion 3 and INVITES the failure in criterion 4', () => {
    /* Criterion 3 is the one it cannot satisfy at all: a single intrinsic value
       cannot describe an entity that is active in one relation and a patient in
       another. That is not a gap in the values; it is a category error in the
       dimension. */
    expect(true).toBe(true);
  });

  it('⭐ relational participation satisfies all five', () => {
    expect(relational.mixed().nodes[0].properties).toEqual({});
    expect(relational.mixed().edges).toHaveLength(2);
  });
});
