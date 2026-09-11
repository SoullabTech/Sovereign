/**
 * RC-GEN-01 · A-P and C-P — analyser PROTOCOL acceptance. Automated, falsifiable.
 *
 * ⛔ This suite proves the SEPARATION is structural and that the schema cannot
 * express a judgement. It proves NOTHING about whether the analysers produce
 * correct graphs from real prose — that is A-S / C-S / AC-1 / AC-2, a provider
 * witness, NOT WITNESSED.
 */
import {
  analyzerSystemPrompt, analyzerToolSchema, admitAnalysis,
  analyzeSource, analyzeCandidate, ANALYZER_TOOL_NAME, ANALYZER_VERSION,
} from '../lib/manuscript/revision/analyze';

describe('⛔ an analyser DESCRIBES; the schema cannot express a judgement', () => {
  const json = JSON.stringify(analyzerToolSchema).toLowerCase();

  it('⭐ no verdict, score, advice or self-assessment field is representable', () => {
    for (const banned of ['faithful', 'should_pass', 'similarity', 'score', 'advice',
                          'matches', 'correct', 'verdict', 'admit', 'preserve', 'fidelity']) {
      expect(json).not.toContain(banned);
    }
  });

  it('additionalProperties is false at every level, so nothing can be smuggled in', () => {
    expect(analyzerToolSchema.additionalProperties).toBe(false);
    const nodes = (analyzerToolSchema.properties as any).nodes.items;
    expect(nodes.additionalProperties).toBe(false);
    expect(nodes.properties.properties.additionalProperties).toBe(false);
    expect((analyzerToolSchema.properties as any).edges.items.additionalProperties).toBe(false);
  });

  it('property values are a CLOSED enum — never free prose', () => {
    const props = (analyzerToolSchema.properties as any).nodes.items.properties.properties.properties;
    for (const spec of Object.values<any>(props)) {
      expect(Array.isArray(spec.enum)).toBe(true);
      expect(spec.enum).toContain('unspecified');
    }
  });
});

describe('⭐⭐ A and C are information-starved BY CONSTRUCTION', () => {
  it('⭐ ONE shared prompt body — nothing about the task can differ between them', () => {
    expect(analyzerSystemPrompt()).toBe(analyzerSystemPrompt());
  });

  it('⛔ the prompt mentions no request, no candidate, no source-vs-candidate framing', () => {
    /* ⚠️ WHOLE-WORD matching. A substring check fails on "pass" inside "passage"
       — the same crudeness that produced a false leak on "integration" inside
       "developmental" in the generation guard. A guard that cannot tell a word
       from a syllable is not a guard. */
    const words = new Set((analyzerSystemPrompt().toLowerCase().match(/[a-z']+/g) ?? []));
    for (const leak of ['candidate', 'revision', 'rewrite', 'writer', 'proposal',
                        'compare', 'original', 'pass', 'fail', 'faithful']) {
      expect(words.has(leak)).toBe(false);
    }
  });

  it('⭐ it says there IS no other passage, and no answer being measured against', () => {
    const p = analyzerSystemPrompt();
    expect(p).toContain('There is no other passage');
    expect(p).toContain('no right answer you are being measured against');
  });

  it('⛔ the signatures ACCEPT no second passage — separation is not prompt discipline', () => {
    expect(analyzeSource.length).toBeLessThanOrEqual(2);
    expect(analyzeCandidate.length).toBeLessThanOrEqual(2);
  });

  it('⛔ the module contains no fixture vocabulary from either specimen', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '../lib/manuscript/revision/analyze.ts'), 'utf8');
    const words = new Set(src.toLowerCase().match(/[a-z']+/g) ?? []);
    for (const w of ['transformation', 'relational', 'perspective', 'kettle', 'mara', 'coffee']) {
      expect(words.has(w)).toBe(false);
    }
  });
});

describe('⭐ unspecified is taught as an ANSWER, not an omission', () => {
  const p = analyzerSystemPrompt();
  it('names unspecified as the most common correct answer', () => {
    expect(p).toContain('Unspecified is an');
    expect(p).toContain('the most common correct one');
  });
  it('forbids inferring a property because it reads naturally', () => {
    expect(p).toContain('Do not infer a property because it');
  });
  it('⭐ carries the three confusions every failed run made', () => {
    expect(p).toContain('Importance is not size');
    expect(p).toContain('Continuation is not effort');
    expect(p).toContain('Change is not improvement');
  });
});

describe('⚠️ `kind` carries correspondence authority, so the prompt constrains it', () => {
  it('tells the analyser that kind describes role, not phrasing', () => {
    const p = analyzerSystemPrompt();
    expect(p).toContain('same thing');
    expect(p).toContain('should yield the same kinds');
    expect(p).toContain('describes the role, not the');
  });
});

describe('admitAnalysis — admits or refuses, never coerces', () => {
  const ok = {
    nodes: [
      { local_id: 'a', kind: 'event', properties: {} },
      { local_id: 'b', kind: 'process', properties: { temporality: 'ongoing' } },
    ],
    edges: [{ from: 'a', to: 'b', relation: 'causes' }],
  };
  const node = (over: Record<string, unknown> = {}) =>
    ({ local_id: 'a', kind: 'event', properties: {}, ...over });

  it('admits a well-formed analysis and resolves local ids to indices', () => {
    const r = admitAnalysis(ok);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.graph.nodes).toHaveLength(2);
    expect(r.graph.edges[0]).toEqual({ from: 0, to: 1, kind: 'causes' });
  });

  it('⭐ local ids are opaque — they become labels, never compared across graphs', () => {
    const r = admitAnalysis(ok);
    if (!r.ok) throw new Error('unreachable');
    expect(r.graph.nodes[0].label).toBe('a');
  });

  it.each([
    ['not an object', 'a string'],
    ['no nodes', { nodes: [], edges: [] }],
    ['a node without local_id', { nodes: [{ kind: 'event', properties: {} }], edges: [] }],
    ['duplicate local_id', { nodes: [node(), node()], edges: [] }],
    ['an unknown property', { nodes: [node({ properties: { vibe: 'high' } })], edges: [] }],
    ['an unknown relation', { nodes: [node()], edges: [{ from: 'a', to: 'a', relation: 'vibes_with' }] }],
    ['an edge naming an unknown node', { nodes: [node()], edges: [{ from: 'a', to: 'z', relation: 'causes' }] }],
  ])('refuses %s', (_label, input) => {
    expect(admitAnalysis(input)).toMatchObject({ ok: false, refusal: 'malformed' });
  });

  describe('⛔ NON-COERCIVE ADMISSION — the last boundary before D obeys its own contract', () => {
    /* ⚠️ An earlier draft SAID "never coerces" and coerced three ways. A malformed
       analysis silently became a plausible graph, so D would have compared two
       graphs one of which the admission layer partly invented. */
    it.each([
      ['an UNKNOWN kind (was: degraded to unspecified)', { nodes: [node({ kind: 'vibe' })], edges: [] }],
      ['a MISSING kind', { nodes: [{ local_id: 'a', properties: {} }], edges: [] }],
      ['a MISSING properties object (was: became {})', { nodes: [{ local_id: 'a', kind: 'event' }], edges: [] }],
      ['MISSING edges (was: became [])', { nodes: [node()] }],
      ['an extra TOP-LEVEL field', { nodes: [node()], edges: [], faithful: true }],
      ['an extra NODE field', { nodes: [node({ confidence: 0.9 })], edges: [] }],
      ['an extra EDGE field', { nodes: [node()], edges: [{ from: 'a', to: 'a', relation: 'causes', note: 'x' }] }],
    ])('refuses %s', (_label, input) => {
      expect(admitAnalysis(input)).toMatchObject({ ok: false, refusal: 'malformed' });
    });

    it('⭐ a legitimate one-node analysis sends edges: [] and is admitted', () => {
      expect(admitAnalysis({ nodes: [node()], edges: [] }).ok).toBe(true);
    });
  });

  describe('⭐ PER-PROPERTY DOMAINS — legal for one dimension is not legal for another', () => {
    it.each([
      ['magnitude = ongoing', { magnitude: 'ongoing' }],
      ['agency = positive', { agency: 'positive' }],
      ['temporality = high', { temporality: 'high' }],
      ['significance = active_participation', { significance: 'active_participation' }],
      ['valence = asserted', { valence: 'asserted' }],
      ['modality = forward', { modality: 'forward' }],
    ])('refuses %s', (_label, properties) => {
      expect(admitAnalysis({ nodes: [node({ properties })], edges: [] }))
        .toMatchObject({ ok: false, refusal: 'malformed' });
    });

    it.each([
      ['magnitude = high', { magnitude: 'high' }],
      ['agency = active_participation', { agency: 'active_participation' }],
      ['temporality = ongoing', { temporality: 'ongoing' }],
      ['significance = asserted', { significance: 'asserted' }],
      ['every property = unspecified', Object.fromEntries(
        ['significance','meaningfulness','magnitude','valence','direction',
         'agency','temporality','modality','polarity'].map((k) => [k, 'unspecified']))],
    ])('admits %s', (_label, properties) => {
      expect(admitAnalysis({ nodes: [node({ properties })], edges: [] }).ok).toBe(true);
    });

    it('⭐ the SCHEMA carries the per-property domains, not one global enum', () => {
      const props = (analyzerToolSchema.properties as any).nodes.items.properties.properties.properties;
      expect(props.magnitude.enum).toEqual(['unspecified', 'low', 'high']);
      expect(props.agency.enum).toEqual(['unspecified', 'active_participation', 'undergone']);
      expect(props.magnitude.enum).not.toContain('ongoing');
      expect(props.temporality.enum).not.toContain('high');
    });
  });


});

describe('provenance', () => {
  it('the analyser version is pinned — v2 after the SV-2 schema repair', () => {
    /* ⛔ Version is EVIDENCE. v1 owns the A-S failure permanently; a schema change
       creates a new subject rather than editing the old one's record. */
    expect(ANALYZER_VERSION).toBe('RC-GEN-01/analyzer/2');
    expect(ANALYZER_TOOL_NAME).toBe('semantic_graph');
  });
});
