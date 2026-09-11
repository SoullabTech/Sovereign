/**
 * SV-2 · SV-3 · SV-4 — schema adequacy, across two analyser versions.
 *
 * ⛔ PROMPT TUNING IS HELD. These test what the REPRESENTATION can hold, not what an
 * analyser chooses to say.
 *
 * ⭐⭐ TWO KINDS OF ASSERTION LIVE IN THIS FILE, AND THEY MUST NOT BE CONFUSED.
 *
 *   LIVE       SV-2 — `has_object` survives into analyzer/3 unchanged, so these
 *              assertions run against the production schema.
 *   HISTORICAL SV-3 and SV-4 examined a vocabulary analyzer/3 NO LONGER HAS. They
 *              run against `V2`, a frozen literal copy of what analyzer/2 was.
 *
 * ⛔ THE FROZEN COPY IS THE POINT. Asserting the v2 findings against LIVE code would
 * make the historical record silently dependent on current behaviour — the evidence
 * would decay, or worse, quietly re-describe itself as the schema moved. A witness is
 * a reading at a time. So v2's vocabulary is written out here literally, and the live
 * schema is asserted to have MOVED PAST it rather than to still match it.
 */
import { admitAnalysis, analyzerToolSchema, ANALYZER_VERSION } from '../lib/manuscript/revision/analyze';
import { compareConservation } from '../lib/manuscript/revision/semanticGraph';

const node = (over: Record<string, unknown> = {}) =>
  ({ local_id: 'n', kind: 'state', properties: {}, ...over });

/**
 * ⛔ FROZEN LITERAL RECORD OF `analyzer/2`. Never imported from live code, never
 * regenerated. This is what the schema WAS when SV-3 and SV-4 were run against it.
 */
const V2 = {
  version: 'RC-GEN-01/analyzer/2',
  agencyDomain: ['unspecified', 'active_participation', 'undergone'] as const,
  /** v2 placed no constraint between a property and the kind of node it sat on. */
  propertiesAttachableToAnyKind: true,
  nodeKinds: ['event', 'state', 'process', 'relation', 'entity', 'unspecified'] as const,
} as const;

describe('⛔ version is evidence — a schema repair creates a NEW SUBJECT', () => {
  it('the live analyser is v3; v2 and v1 keep their own results permanently', () => {
    expect(ANALYZER_VERSION).toBe('RC-GEN-01/analyzer/3');
    expect(ANALYZER_VERSION).not.toBe(V2.version);
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

describe('⭐ SV-3 DISCRIMINATOR — HISTORICAL · could v2\'s agency dimension hold all three?', () => {
  /**
   * ⭐ THE ANSWER WAS YES, AND IT WAS THE WRONG QUESTION.
   *
   * The founder's three fixtures encoded cleanly in v2, and the schema forced no
   * commitment where the prose made none — so SV-3 found no inadequacy, and A1
   * remained an analyser error rather than a schema one. SV-4 then showed the
   * dimension was MIS-LOCATED, which SV-3 could not have detected because all three
   * of its fixtures have a single participant in a single relation.
   *
   * ⛔ The result is preserved, not rewritten. v2's vocabulary is frozen above.
   */
  it.each([
    ['ACTIVE   "He deliberately worked on integrating the experience."', 'active_participation'],
    ['PASSIVE  "He underwent the procedure while unconscious."', 'undergone'],
    ['NEUTRAL  "Integration continued over the following months."', 'unspecified'],
  ])('v2 represented: %s', (_label, agency) => {
    expect(V2.agencyDomain).toContain(agency);
  });

  it('⭐ the three were mutually distinct VALUES of one property — hence exclusive', () => {
    expect(new Set(V2.agencyDomain).size).toBe(V2.agencyDomain.length);
  });

  it('⭐ neutral was representable WITHOUT choosing a role — the schema forced nothing', () => {
    expect(V2.agencyDomain).toContain('unspecified');
  });

  it('⛔ AND NONE OF IT SURVIVES — v3 refuses the property outright', () => {
    for (const agency of V2.agencyDomain) {
      expect(admitAnalysis({ nodes: [node({ kind: 'process', properties: { agency } })], edges: [] }))
        .toMatchObject({ ok: false, refusal: 'malformed' });
    }
  });
});

describe('⭐⭐ SV-4 — RATIFIED · the gap SV-3 could not see, and its repair', () => {
  /**
   * ⭐ THE v2 SCHEMA LET ANY PROPERTY ATTACH TO ANY NODE KIND.
   *
   * In A-S v1, `agency` was attached to the TRANSFORMATION node. But a
   * transformation does not act or undergo — the PERSON does. The dimension did not
   * apply to that node at all, and the schema offered no way to say so.
   *
   * ⛔ `unspecified` and `not applicable` are DIFFERENT CLAIMS, and v2 collapsed
   * them. ⭐ The repair did NOT add `not_applicable`. It removed the property, so
   * there is no applicability question left to answer: the ABSENCE of a
   * participation edge is the whole representation of a source that makes no
   * participation claim.
   */
  it('⚠️ HISTORICAL — under v2, agency attached to ANY kind, including ones it could not apply to', () => {
    expect(V2.propertiesAttachableToAnyKind).toBe(true);
    for (const kind of V2.nodeKinds) expect(V2.nodeKinds).toContain(kind);
  });

  it('⛔ v3 has no agency property on any node kind', () => {
    const props = (analyzerToolSchema.properties as any).nodes.items
      .properties.properties.properties;
    expect(props).not.toHaveProperty('agency');
    for (const kind of V2.nodeKinds) {
      expect(admitAnalysis({
        nodes: [{ local_id: 'n', kind, properties: { agency: 'undergone' } }], edges: [],
      })).toMatchObject({ ok: false, refusal: 'malformed' });
    }
  });

  it('⛔ and `not_applicable` was NOT added anywhere — the dimension moved, it did not widen', () => {
    expect(JSON.stringify(analyzerToolSchema)).not.toContain('not_applicable');
  });
});
