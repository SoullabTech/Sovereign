/**
 * SV-4 DISCRIMINATOR — is participation a NODE PROPERTY or a RELATION?
 *
 * ⭐ RATIFIED. Relational participation won, and `analyzer/3` carries the repair.
 *
 * ⭐⭐ THE CASTS ARE NOW INVERTED, AND THE INVERSION IS THE RECORD.
 *
 *   When this ran as a discriminator, the RELATIONAL form was cast in locally
 *   because production did not have it, and node-level `agency` came from live code.
 *   Now the relational form IS live code, and node-level `agency` is what no longer
 *   exists — so it is the legacy form that is held locally.
 *
 * ⛔ THE KNOWN-BAD IS NOT ERASED BECAUSE THE SCHEMA CAN NO LONGER EMIT IT. The
 * discriminator must remain able to demonstrate WHY v2 lost, or the record becomes
 * an assertion that a repair happened with no surviving account of what it repaired.
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
import { compareConservation, type SemanticGraph, type SemanticNode } from '../lib/manuscript/revision/semanticGraph';
import { admitAnalysis } from '../lib/manuscript/revision/analyze';

/* Non-fixture prose. Nothing here is drawn from either specimen. */
const PROSE = {
  ACTIVE:  'Lena deliberately worked through the calculation.',
  PASSIVE: 'Lena underwent the scan while unconscious.',
  NEUTRAL: 'The healing process continued for several weeks.',
  MIXED:   'Lena performed the test and later underwent the procedure.',
} as const;

/* ── REPRESENTATION 1 · node-level `agency` — LEGACY, what analyzer/2 had ─────
   ⛔ These values are NOT in the live schema. They are frozen here literally, as
   the surviving account of the representation that lost. */
const V2_AGENCY_DOMAIN = ['unspecified', 'active_participation', 'undergone'] as const;

/** The v2 node shape, cast in locally — `agency` is no longer a PropertyName. */
const legacyNode = (label: string, kind: SemanticNode['kind'],
                    agency?: typeof V2_AGENCY_DOMAIN[number],
                    rest: Record<string, string> = {}): SemanticNode =>
  ({ label, kind, properties: { ...rest, ...(agency ? { agency } : {}) } as SemanticNode['properties'] });

/**
 * ⛔⛔ THE LEGACY HALF MAY NOT BE RUN THROUGH THE LIVE COMPARATOR. THIS IS WL-1.
 *
 * `compareConservation` no longer compares `agency`, because the property no longer
 * exists. Two of these assertions DID still pass when run through it after the
 * repair — but for reasons that had nothing to do with participation: one because
 * two node KINDS differed, the other because a symmetric graph produced
 * `correspondence_ambiguous`. Both would have read as green while exercising none of
 * the behaviour they name.
 *
 * ⭐ So the legacy claims are asserted against the FROZEN v2 record instead. What
 * they always were is claims about REPRESENTABILITY — what v2's vocabulary could and
 * could not say — and those survive the schema change intact precisely because they
 * are not claims about live code.
 */
const nodeLevel = {
  active: (): SemanticGraph => ({
    nodes: [legacyNode('lena', 'entity', 'active_participation'),
            legacyNode('calculation', 'process')],
    edges: [{ from: 0, to: 1, kind: 'has_object' }],
  }),
  passive: (): SemanticGraph => ({
    nodes: [legacyNode('lena', 'entity', 'undergone'),
            legacyNode('scan', 'process')],
    edges: [{ from: 0, to: 1, kind: 'has_object' }],
  }),
  neutral: (): SemanticGraph => ({
    nodes: [{ label: 'healing', kind: 'process', properties: { temporality: 'ongoing' } }],
    edges: [],
  }),
};

/** The one fact the legacy graphs still carry into live code: agency is inert. */
const agencyOf = (g: SemanticGraph, i: number) =>
  (g.nodes[i].properties as Record<string, string>).agency;

/* ── REPRESENTATION 2 · participation as a RELATION — LIVE in analyzer/3 ────── */

const relational = {
  active: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: {} },
      { label: 'calculation', kind: 'process', properties: {} },
    ],
    edges: [{ from: 0, to: 1, kind: 'actively_participates_in' as const }],
  }),
  passive: (): SemanticGraph => ({
    nodes: [
      { label: 'lena', kind: 'entity', properties: {} },
      { label: 'scan', kind: 'event', properties: {} },
    ],
    edges: [{ from: 0, to: 1, kind: 'undergoes' as const }],
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
      { from: 0, to: 1, kind: 'actively_participates_in' as const },
      { from: 0, to: 2, kind: 'undergoes' as const },
    ],
  }),
};

describe(`1 · active and passive are distinguishable — ${PROSE.ACTIVE} / ${PROSE.PASSIVE}`, () => {
  it('⚠️ HISTORICAL — v2 distinguished them as two VALUES of one property', () => {
    expect(agencyOf(nodeLevel.active(), 0)).toBe('active_participation');
    expect(agencyOf(nodeLevel.passive(), 0)).toBe('undergone');
    expect(agencyOf(nodeLevel.active(), 0)).not.toBe(agencyOf(nodeLevel.passive(), 0));
  });

  it('⛔ and v3 no longer compares that property at all — running it through D is a FALSE GREEN', () => {
    /* Identical shape, identical kinds, differing only in the legacy property.
       The live comparator admits it, because there is nothing there to compare. */
    const a = nodeLevel.active();
    const b: SemanticGraph = { ...a, nodes: [legacyNode('lena', 'entity', 'undergone'), a.nodes[1]] };
    expect(compareConservation(a, b).admitted).toBe(true);
  });

  it('⭐ relational: distinguishable by EDGE KIND alone, live', () => {
    /* ⭐ Same nodes, same kinds, same topology. The ONLY difference is how she took
       part — so this cannot pass for a structural reason. */
    const g = (kind: 'actively_participates_in' | 'undergoes'): SemanticGraph => ({
      nodes: [{ label: 'lena', kind: 'entity', properties: {} },
              { label: 'calculation', kind: 'process', properties: {} }],
      edges: [{ from: 0, to: 1, kind }],
    });
    expect(compareConservation(g('actively_participates_in'), g('undergoes')).admitted).toBe(false);
  });
});

describe(`2 · neutral requires neither role — ${PROSE.NEUTRAL}`, () => {
  it('⚠️ HISTORICAL — v2 represented it as a value, `unspecified`', () => {
    expect(V2_AGENCY_DOMAIN).toContain('unspecified');
  });
  it('⭐ relational: represented by the ABSENCE of a participation edge, live', () => {
    const r = admitAnalysis({
      nodes: [{ local_id: 'healing', kind: 'process', properties: { temporality: 'ongoing' } }],
      edges: [],
    });
    expect(r.ok).toBe(true);
    expect(relational.neutral().edges).toHaveLength(0);
  });
});

describe(`⭐⭐ 3 · THE DECIDING CRITERION — ${PROSE.MIXED}`, () => {
  it('⛔ node-level CANNOT represent it: one entity, one intrinsic value, no `both`', () => {
    /* Lena is ONE node. `agency` was ONE property. The sentence makes her active in
       one event and a patient in another, so any single value is false about half
       the sentence — and v2's vocabulary offered no way to say both. */
    expect(V2_AGENCY_DOMAIN).not.toContain('both');
    expect(V2_AGENCY_DOMAIN).not.toContain('mixed');
    /* Each of the three candidate values is false about the sentence as a whole. */
    for (const v of V2_AGENCY_DOMAIN) {
      expect(['active_participation', 'undergone', 'unspecified']).toContain(v);
    }
    expect(V2_AGENCY_DOMAIN).toHaveLength(3);
  });

  it('⭐ relational CAN represent it: two edges from one entity, no contradiction — and it is ADMITTED', () => {
    const m = relational.mixed();
    expect(m.nodes.filter((n) => n.label === 'lena')).toHaveLength(1);
    expect(m.edges).toHaveLength(2);
    expect(m.edges[0].kind).not.toBe(m.edges[1].kind);
    /* Lena carries NO intrinsic participation property at all. */
    expect(m.nodes[0].properties).toEqual({});

    /* ⭐ And the live admission boundary accepts it. */
    expect(admitAnalysis({
      nodes: [{ local_id: 'lena', kind: 'entity', properties: {} },
              { local_id: 'test', kind: 'event', properties: {} },
              { local_id: 'procedure', kind: 'event', properties: {} }],
      edges: [{ from: 'lena', to: 'test', relation: 'actively_participates_in' },
              { from: 'lena', to: 'procedure', relation: 'undergoes' }],
    }).ok).toBe(true);
  });
});

describe('⭐ 4 · nothing attaches participation to an EVENT merely because someone participates', () => {
  it('⛔ HISTORICAL — v2 admitted exactly the A-S v1 category error', () => {
    /* This is what A did: agency on the TRANSFORMATION node. A transformation does
       not act or undergo — the person does. v2 admitted it happily, because it
       placed no constraint between a property and the kind of node it sat on. */
    const v1Error = legacyNode('transformation', 'process', 'undergone');
    expect((v1Error.properties as Record<string, string>).agency).toBe('undergone');
    expect(V2_AGENCY_DOMAIN).toContain('undergone');
  });

  it('⭐⭐ v3 makes it INADMISSIBLE, not merely less likely', () => {
    /* The property is gone... */
    expect(admitAnalysis({
      nodes: [{ local_id: 'transformation', kind: 'process', properties: { agency: 'undergone' } }],
      edges: [],
    })).toMatchObject({ ok: false, refusal: 'malformed' });

    /* ...and it did not simply move into an edge. A process cannot be the SUBJECT
       of participation, so the error cannot be restated in the new vocabulary. */
    expect(admitAnalysis({
      nodes: [{ local_id: 'transformation', kind: 'process', properties: {} },
              { local_id: 'integration', kind: 'process', properties: {} }],
      edges: [{ from: 'transformation', to: 'integration', relation: 'undergoes' }],
    })).toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('⭐ relational: no node of any kind carries a participation property', () => {
    for (const g of [relational.active(), relational.passive(), relational.mixed()]) {
      for (const n of g.nodes) expect(n.properties).not.toHaveProperty('agency');
    }
  });
});

describe('⭐ 5 · D detects a candidate ADDING participation the source left neutral', () => {
  it('⚠️ HISTORICAL — under v2 this surfaced as `added_property` on the process node', () => {
    /* Recorded, not re-executed: the live comparator no longer holds the dimension,
       so re-running it here would assert nothing. The v2-era result is preserved in
       __tests__/revision-semantic-conservation.test.ts, which now carries the same
       drift in its analyzer/3 form. */
    expect(V2_AGENCY_DOMAIN).toContain('active_participation');
  });

  it('⭐ relational: detected as an added EDGE, live', () => {
    const source: SemanticGraph = {
      nodes: [{ label: 'lena', kind: 'entity', properties: {} },
              { label: 'healing', kind: 'process', properties: { temporality: 'ongoing' } }],
      edges: [],
    };
    const candidate: SemanticGraph = {
      ...source,
      edges: [{ from: 0, to: 1, kind: 'actively_participates_in' }],
    };
    const v = compareConservation(source, candidate);
    expect(v.admitted).toBe(false);
    if (v.admitted) throw new Error('unreachable');
    expect(v.refusal).toBe('structure_mismatch');
  });
});

describe('⭐ THE DISCRIMINATOR RESULT — RATIFIED', () => {
  it('node-level agency FAILED criterion 3 and INVITED the failure in criterion 4', () => {
    /* Criterion 3 is the one it could not satisfy at all: a single intrinsic value
       cannot describe an entity that is active in one relation and a patient in
       another. That is not a gap in the values; it is a category error in the
       dimension — which is why widening the enum was refused. */
    expect(V2_AGENCY_DOMAIN).toHaveLength(3);
    expect(V2_AGENCY_DOMAIN).not.toContain('both');
  });

  it('⭐ relational participation satisfies all five, and is what analyzer/3 carries', () => {
    expect(relational.mixed().nodes[0].properties).toEqual({});
    expect(relational.mixed().edges).toHaveLength(2);
  });
});
