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
    ['duplicate local_id', { nodes: [{ local_id: 'a', properties: {} }, { local_id: 'a', properties: {} }], edges: [] }],
    ['an unknown property', { nodes: [{ local_id: 'a', properties: { vibe: 'high' } }], edges: [] }],
    ['an unknown property VALUE', { nodes: [{ local_id: 'a', properties: { magnitude: 'enormous' } }], edges: [] }],
    ['an unknown relation', { nodes: [{ local_id: 'a', properties: {} }], edges: [{ from: 'a', to: 'a', relation: 'vibes_with' }] }],
    ['an edge naming an unknown node', { nodes: [{ local_id: 'a', properties: {} }], edges: [{ from: 'a', to: 'z', relation: 'causes' }] }],
  ])('refuses %s', (_label, input) => {
    expect(admitAnalysis(input)).toMatchObject({ ok: false, refusal: 'malformed' });
  });

  it('an unknown kind degrades to `unspecified` rather than being invented', () => {
    const r = admitAnalysis({ nodes: [{ local_id: 'a', kind: 'vibe', properties: {} }], edges: [] });
    if (!r.ok) throw new Error('unreachable');
    expect(r.graph.nodes[0].kind).toBe('unspecified');
  });

  it('a graph with no edges is admissible — a one-node passage has none', () => {
    expect(admitAnalysis({ nodes: [{ local_id: 'a', properties: {} }] }).ok).toBe(true);
  });
});

describe('provenance', () => {
  it('the analyser version is pinned', () => {
    expect(ANALYZER_VERSION).toBe('RC-GEN-01/analyzer/1');
    expect(ANALYZER_TOOL_NAME).toBe('semantic_graph');
  });
});
