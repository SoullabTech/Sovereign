/**
 * ⭐⭐ `analyzer/3` DETERMINISTIC ACCEPTANCE — V3-1 … V3-7.
 *
 * The founder's required falsifiers, run BEFORE any provider witness. They decide
 * whether the SV-4 repair is structurally real. They decide NOTHING about whether a
 * real analyser produces correct graphs from real prose — that is A-S / C-S / AC-1 /
 * AC-2, a provider witness, and it must be re-run against v3.
 *
 * ⛔ THE POINT OF V3-2/V3-3/V3-6 IS THAT THE OLD ERROR IS INADMISSIBLE, NOT RARER.
 * Adding two relation names without typing their endpoints would have moved the
 * category error from a property into an edge and called it a repair.
 */
import {
  admitAnalysis, analyzerToolSchema, analyzerSystemPrompt,
  ANALYZER_VERSION, RELATION_ENDPOINTS,
} from '../lib/manuscript/revision/analyze';
import { EDGE_KINDS, PARTICIPATION_EDGE_KINDS } from '../lib/manuscript/revision/semanticGraph';

const n = (local_id: string, kind: string, properties: Record<string, string> = {}) =>
  ({ local_id, kind, properties });
const e = (from: string, to: string, relation: string) => ({ from, to, relation });

const schemaProps = (analyzerToolSchema.properties as any).nodes.items.properties.properties.properties;
const schemaRelations: string[] = (analyzerToolSchema.properties as any).edges.items.properties.relation.enum;

/* ── V3-1 ─────────────────────────────────────────────────────────────────── */

describe('V3-1 · the analyser schema contains no node property `agency`', () => {
  it('the tool schema has no such property', () => {
    expect(schemaProps).not.toHaveProperty('agency');
  });

  it('⛔ and admission refuses it at every node kind and every legacy value', () => {
    for (const kind of ['event', 'state', 'process', 'relation', 'entity', 'unspecified']) {
      for (const agency of ['unspecified', 'active_participation', 'undergone']) {
        expect(admitAnalysis({ nodes: [n('x', kind, { agency })], edges: [] }))
          .toMatchObject({ ok: false, refusal: 'malformed' });
      }
    }
  });

  it('⛔ nothing was substituted for it — no participation property under another name', () => {
    for (const name of Object.keys(schemaProps)) {
      expect(name).not.toMatch(/agen|particip|patient|undergo|active/i);
    }
  });

  it('⛔ and `not_applicable` was not introduced anywhere', () => {
    expect(JSON.stringify(analyzerToolSchema)).not.toContain('not_applicable');
    for (const spec of Object.values<any>(schemaProps)) {
      expect(spec.enum).not.toContain('not_applicable');
      expect(spec.enum).not.toContain('active_participation');
      expect(spec.enum).not.toContain('undergone');
    }
  });
});

/* ── V3-2 · V3-3 · V3-6 — typed endpoints ─────────────────────────────────── */

const PARTICIPATION = ['actively_participates_in', 'undergoes'] as const;

describe('V3-2 · V3-3 · participation relations are admitted ONLY entity -> event|process', () => {
  it('both relations exist in the schema', () => {
    for (const r of PARTICIPATION) expect(schemaRelations).toContain(r);
    expect([...PARTICIPATION_EDGE_KINDS].sort()).toEqual([...PARTICIPATION].sort());
  });

  it.each(PARTICIPATION)('%s: entity -> event ACCEPTED', (relation) => {
    expect(admitAnalysis({
      nodes: [n('lena', 'entity'), n('scan', 'event')],
      edges: [e('lena', 'scan', relation)],
    }).ok).toBe(true);
  });

  it.each(PARTICIPATION)('%s: entity -> process ACCEPTED', (relation) => {
    expect(admitAnalysis({
      nodes: [n('lena', 'entity'), n('calculation', 'process')],
      edges: [e('lena', 'calculation', relation)],
    }).ok).toBe(true);
  });

  /* ⛔ EVERY OTHER GEOMETRY. Exhaustive over the kind vocabulary, so a future kind
     cannot quietly become an eligible participant by being forgotten here. */
  const KINDS = ['event', 'state', 'process', 'relation', 'entity', 'unspecified'] as const;
  const legal = (from: string, to: string) =>
    from === 'entity' && (to === 'event' || to === 'process');

  it.each(PARTICIPATION)('%s: every illegal endpoint pair is REFUSED', (relation) => {
    let refused = 0;
    for (const from of KINDS) {
      for (const to of KINDS) {
        const r = admitAnalysis({
          nodes: [n('a', from), n('b', to)],
          edges: [e('a', 'b', relation)],
        });
        if (legal(from, to)) { expect(r.ok).toBe(true); continue; }
        expect(r).toMatchObject({ ok: false, refusal: 'malformed' });
        refused += 1;
      }
    }
    /* 36 pairs, 2 legal. A repair that silently widened the table would show here. */
    expect(refused).toBe(KINDS.length * KINDS.length - 2);
  });

  it('⛔ the endpoint table is the authority, and it is not empty', () => {
    for (const r of PARTICIPATION) {
      expect(RELATION_ENDPOINTS[r]).toEqual({ from: ['entity'], to: ['event', 'process'] });
    }
  });

  it('⚠️ non-participation relations are deliberately UNCONSTRAINED — bounded repair', () => {
    expect(RELATION_ENDPOINTS).not.toHaveProperty('causes');
    expect(admitAnalysis({
      nodes: [n('a', 'event'), n('b', 'state')],
      edges: [e('a', 'b', 'causes')],
    }).ok).toBe(true);
  });
});

describe('V3-6 · an event or process as participation SUBJECT is refused', () => {
  it('⭐ the A-S v1 category error, restated as an edge, is INADMISSIBLE', () => {
    const r = admitAnalysis({
      nodes: [n('transformation', 'process'), n('integration', 'process')],
      edges: [e('transformation', 'integration', 'undergoes')],
    });
    expect(r).toMatchObject({ ok: false, refusal: 'malformed' });
    if (r.ok) throw new Error('unreachable');
    expect(r.detail).toContain('undergoes');
  });

  it('⛔ it is REFUSED, never dropped or re-kinded — the boundary never authors a graph', () => {
    /* A boundary that silently removed the bad edge would hand D a graph the
       admission layer partly wrote, which is the most dangerous failure here. */
    const r = admitAnalysis({
      nodes: [n('a', 'event'), n('b', 'process')],
      edges: [e('a', 'b', 'undergoes')],
    });
    expect(r.ok).toBe(false);
  });

  it('⛔ `unspecified` is not an eligible endpoint in either position', () => {
    for (const relation of PARTICIPATION) {
      expect(admitAnalysis({
        nodes: [n('a', 'unspecified'), n('b', 'event')], edges: [e('a', 'b', relation)],
      }).ok).toBe(false);
      expect(admitAnalysis({
        nodes: [n('a', 'entity'), n('b', 'unspecified')], edges: [e('a', 'b', relation)],
      }).ok).toBe(false);
    }
  });
});

/* ── V3-4 · V3-5 — the two readings that decided SV-4 ─────────────────────── */

describe('V3-4 · neutral participation is represented by NO participation edge', () => {
  it('⭐ "The healing process continued for several weeks." needs no participant', () => {
    const r = admitAnalysis({
      nodes: [n('healing', 'process', { temporality: 'ongoing' })], edges: [],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('unreachable');
    expect(r.graph.edges).toHaveLength(0);
    expect(r.graph.nodes[0].properties).toEqual({ temporality: 'ongoing' });
  });

  it('⛔ and there is no way to SAY "participation unspecified" — absence is the whole answer', () => {
    for (const relation of PARTICIPATION) {
      expect(JSON.stringify(analyzerToolSchema)).toContain(relation);
    }
    expect(schemaProps).not.toHaveProperty('agency');
  });
});

describe('V3-5 · mixed participation is admitted WITHOUT contradiction', () => {
  /* "Lena performed the test and later underwent the procedure." */
  const mixed = admitAnalysis({
    nodes: [n('lena', 'entity'), n('test', 'event'), n('procedure', 'event')],
    edges: [e('lena', 'test', 'actively_participates_in'),
            e('lena', 'procedure', 'undergoes')],
  });

  it('⭐ admitted', () => {
    expect(mixed.ok).toBe(true);
  });

  it('⭐ ONE entity node, TWO differently-kinded edges', () => {
    if (!mixed.ok) throw new Error('unreachable');
    expect(mixed.graph.nodes.filter((x) => x.kind === 'entity')).toHaveLength(1);
    expect(mixed.graph.edges).toHaveLength(2);
    expect(mixed.graph.edges[0].kind).not.toBe(mixed.graph.edges[1].kind);
  });

  it('⭐⭐ and the entity carries NO intrinsic participation property at all', () => {
    if (!mixed.ok) throw new Error('unreachable');
    expect(mixed.graph.nodes[0].properties).toEqual({});
  });
});

/* ── V3-7 — version evidence ──────────────────────────────────────────────── */

describe('V3-7 · analyzer/2 evidence remains intact; analyzer/3 is newly pinned', () => {
  it('the live version is v3', () => {
    expect(ANALYZER_VERSION).toBe('RC-GEN-01/analyzer/3');
  });

  it('⛔ v2 was not mutated into v3 — it is a distinct, frozen subject', () => {
    expect(ANALYZER_VERSION).not.toBe('RC-GEN-01/analyzer/2');
    expect(ANALYZER_VERSION).not.toBe('RC-GEN-01/analyzer/1');
  });

  it('⛔ the version is a pinned constant, not derived from the schema', () => {
    expect(ANALYZER_VERSION).toMatch(/^RC-GEN-01\/analyzer\/\d+$/);
  });
});

/* ── the prompt states the ontology without teaching a prohibition ─────────── */

describe('⛔ the prompt does not teach the analyser to avoid a word', () => {
  const p = analyzerSystemPrompt();

  it('⭐ A1 prompt repair DISSOLVED — no "do not say" instruction about participation', () => {
    expect(p).not.toMatch(/do not (say|use|write)/i);
    expect(p.toLowerCase()).not.toContain('undergone');
    expect(p.toLowerCase()).not.toContain('agency');
  });

  it('⭐ it describes participation as holding BETWEEN someone and what happens', () => {
    expect(p).toContain('PARTICIPATION IS SOMETHING THAT HOLDS BETWEEN SOMEONE AND WHAT HAPPENS');
  });

  it('⭐ and says absence is the representation when no claim is made', () => {
    expect(p).toContain('there is simply no such');
  });
});

/* ── E-1 … E-5 — edge vocabulary coherence ────────────────────────────────── */

/**
 * ⛔⛔ THE DEFECT THIS CLOSES WAS A BOUNDARY LIE, NOT A MISSING STRING.
 *
 * `admitAnalysis` verified a relation against its own private list and then cast the
 * result into the comparator's `EdgeKind` — a type that did not contain `has_object`.
 * The cast silenced exactly the check that would have caught the divergence.
 *
 * ⚠️ AND IT WOULD HAVE FAILED AT THE WORST MOMENT: `has_object` is the SV-2 repair
 * for A2, so the first v3 source graph that finally expresses A2 correctly is the one
 * the type system was quietly denying. Caught before A-S, not during it.
 *
 * ⛔ The repair is ONE canonical list with the type derived from it — not a second
 * string in a second place. A vocabulary maintained twice is a vocabulary that will
 * diverge again.
 */
describe('E-1 … E-5 · edge vocabulary coherence — one list, type derived from it', () => {
  it('E-1 · the tool schema relation enum IS the canonical list, identically ordered', () => {
    expect(schemaRelations).toEqual([...EDGE_KINDS]);
  });

  it('E-2 · `has_object` is present in the canonical list', () => {
    expect(EDGE_KINDS).toContain('has_object');
  });

  it('E-3 · admitAnalysis accepts a lawful has_object edge, and it SURVIVES into the graph', () => {
    /* The A2 shape: an orientation directed at something. */
    const r = admitAnalysis({
      nodes: [n('orientation', 'relation'), n('world', 'entity')],
      edges: [e('orientation', 'world', 'has_object')],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('unreachable');
    /* ⭐ Not merely admitted — the kind arrives at D intact. */
    expect(r.graph.edges).toEqual([{ from: 0, to: 1, kind: 'has_object' }]);
  });

  it('E-3b · every canonical relation admits under some lawful geometry', () => {
    for (const relation of EDGE_KINDS) {
      const participation = (PARTICIPATION_EDGE_KINDS as readonly string[]).includes(relation);
      const r = admitAnalysis({
        nodes: [n('a', participation ? 'entity' : 'state'), n('b', 'event')],
        edges: [e('a', 'b', relation)],
      });
      expect(r.ok).toBe(true);
      if (!r.ok) throw new Error('unreachable');
      expect(r.graph.edges[0].kind).toBe(relation);
    }
  });

  it('E-4 · participation endpoint constraints still apply after canonicalization', () => {
    for (const relation of PARTICIPATION_EDGE_KINDS) {
      expect(admitAnalysis({
        nodes: [n('a', 'process'), n('b', 'event')], edges: [e('a', 'b', relation)],
      })).toMatchObject({ ok: false, refusal: 'malformed' });
      expect(admitAnalysis({
        nodes: [n('a', 'entity'), n('b', 'state')], edges: [e('a', 'b', relation)],
      })).toMatchObject({ ok: false, refusal: 'malformed' });
    }
    /* ⛔ And the two concerns stay separate: existing is not the same as constrained. */
    for (const relation of EDGE_KINDS) {
      const constrained = Object.prototype.hasOwnProperty.call(RELATION_ENDPOINTS, relation);
      expect(constrained).toBe((PARTICIPATION_EDGE_KINDS as readonly string[]).includes(relation));
    }
  });

  it('E-5 · no private second relation list remains in analyze.ts', () => {
    const src = require('fs').readFileSync(
      require('path').join(__dirname, '../lib/manuscript/revision/analyze.ts'), 'utf8');
    /* No array literal of relation names, and no local RELATIONS binding. */
    expect(src).not.toMatch(/\b(const|let|var)\s+RELATIONS\b/);
    for (const relation of EDGE_KINDS) {
      expect(src).not.toContain(`'${relation}'`);
    }
    /* ⛔ AND NO CAST BACK INTO THE COMPARATOR'S TYPE. The boundary must say only
       what it has verified; a cast is how the original divergence stayed invisible. */
    expect(src).not.toMatch(/as\s+SemanticEdge\['kind'\]/);
    expect(src).not.toMatch(/as\s+EdgeKind\b/);
  });

  it('⛔ an unknown relation is still refused — canonicalization did not open the set', () => {
    expect(admitAnalysis({
      nodes: [n('a', 'state'), n('b', 'event')],
      edges: [e('a', 'b', 'reminds_one_of')],
    })).toMatchObject({ ok: false, refusal: 'malformed' });
  });
});
