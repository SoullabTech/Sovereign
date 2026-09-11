/**
 * RC-GEN-01 · A and C — the two analysers.
 *
 * ⭐ THE SEPARATION IS THE ARCHITECTURE:
 *
 *   A sees the SOURCE, never the candidate.
 *   C sees the CANDIDATE, never the source.
 *   D sees the GRAPHS, never prose.
 *   B does not participate in deciding whether B succeeded.
 *
 * ⛔ AN ANALYSER DESCRIBES. IT NEVER JUDGES. The schema below cannot express
 * `faithful`, `should_pass`, a similarity score, a reason it matches, or rewrite
 * advice — not by convention, but because `additionalProperties: false` at every
 * level makes those fields unrepresentable. Nine runs of `reason` asserting a
 * fidelity the wording did not have is why this is structural.
 *
 * ⛔ ONE SCHEMA, SHARED. A and C emit the SAME shape. If they emitted different
 * shapes the comparison would need a translation step, and a translation step is a
 * place for judgement to re-enter.
 *
 * ⚠️ `kind` PARTICIPATES IN CORRESPONDENCE, so it carries more authority than an
 * ordinary property. It must describe a node's role consistently enough that
 * synonymous expression does not change identity. If `integration` reads as
 * `process` in A and an equivalent paraphrase reads as `state` in C merely because
 * the syntax changed, `kind` has become a hidden lexical matcher — and that must
 * FAIL A/C acceptance rather than masquerade as semantic mismatch downstream.
 */

import { runStructured } from '../../ai/structured/router';
import { logAskDiagnostic, sanitizeCause, requestIdOf } from '../ask/askDiagnostics';
import type { SemanticGraph, SemanticNode, SemanticEdge, NodeKind } from './semanticGraph';

export const ANALYZER_VERSION = 'RC-GEN-01/analyzer/1';
export const ANALYZER_TOOL_NAME = 'semantic_graph';

const DEFAULT_MODEL = process.env.MAIA_ASK_MODEL || 'claude-opus-5';

const KINDS: readonly NodeKind[] = ['event', 'state', 'process', 'relation', 'entity', 'unspecified'];
const RELATIONS = ['causes', 'results_in', 'constitutes', 'qualifies', 'within', 'distinct_from'];
/**
 * ⭐ PER-PROPERTY DOMAINS. A value legal for one semantic dimension is not
 * automatically legal for another.
 *
 * ⚠️ An earlier draft gave every property the SAME global enum, so the schema
 * admitted `magnitude = ongoing`, `agency = positive`, `temporality = high`. Closure
 * was present; TYPING was not, and a closed vocabulary that can state nonsense
 * offers the comparator no protection at all.
 */
const PROPERTY_DOMAINS: Readonly<Record<string, readonly string[]>> = {
  significance:   ['unspecified', 'asserted', 'negated'],
  meaningfulness: ['unspecified', 'asserted', 'negated'],
  magnitude:      ['unspecified', 'low', 'high'],
  valence:        ['unspecified', 'positive', 'negative'],
  direction:      ['unspecified', 'forward', 'none'],
  agency:         ['unspecified', 'active_participation', 'undergone'],
  temporality:    ['unspecified', 'ongoing', 'complete'],
  modality:       ['unspecified', 'certain', 'possible'],
  polarity:       ['unspecified', 'asserted', 'negated'],
};
const PROPERTY_NAMES = Object.keys(PROPERTY_DOMAINS);

export const analyzerToolSchema: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['nodes', 'edges'],
  properties: {
    nodes: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false,
        required: ['local_id', 'kind', 'properties'],
        properties: {
          local_id: { type: 'string', description: 'Opaque, yours. Nothing outside this analysis reads it.' },
          kind: { type: 'string', enum: KINDS,
            description: 'What KIND of thing this is — not what is claimed about it.' },
          properties: {
            type: 'object', additionalProperties: false,
            description: 'Only what the passage ASSERTS. Omit, or say unspecified, where it does not commit.',
            properties: Object.fromEntries(Object.entries(PROPERTY_DOMAINS).map(
              ([n, domain]) => [n, { type: 'string', enum: domain }])),
          },
        },
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['from', 'to', 'relation'],
        properties: {
          from: { type: 'string', description: 'local_id' },
          to: { type: 'string', description: 'local_id' },
          relation: { type: 'string', enum: RELATIONS },
        },
      },
    },
  },
};

/**
 * ⭐ ONE PROMPT BODY, SHARED BY BOTH ANALYSERS. The only difference between A and C
 * is the single line naming what the passage IS — so nothing about the task can
 * differ between them by accident, and neither is told what the other saw.
 */
export function analyzerSystemPrompt(): string {
  return [
    'Describe the semantic structure of one passage of prose.',
    '',
    'You are not editing, improving, comparing or judging anything. You are producing',
    'a structural description of what this passage asserts. There is no other passage.',
    'There is no right answer you are being measured against.',
    '',
    'NODES are the distinct things the passage asserts: events, states, processes,',
    'relations, entities. EDGES are what the passage says holds BETWEEN them —',
    'what causes what, what results from what, what constitutes what, what qualifies',
    'what, what lies within what.',
    '',
    '⛔ RECORD ONLY WHAT THE PASSAGE COMMITS TO.',
    'Where the passage does not say whether something is large, good, deliberate,',
    'certain, finished or directed, that property is UNSPECIFIED. Unspecified is an',
    'answer, and the most common correct one. Do not infer a property because it',
    'would be a natural reading; record it only where the passage asserts it.',
    '',
    'Importance is not size. Continuation is not effort. Change is not improvement.',
    'A word that is vague is not a word that means the vaguest thing.',
    '',
    '`kind` says what sort of thing a node IS. Two passages that say the same thing',
    'in different words should yield the same kinds — it describes the role, not the',
    'phrasing.',
    '',
    `Answer only through the ${ANALYZER_TOOL_NAME} tool.`,
  ].join('\n');
}

export type AnalysisResult =
  | { ok: true; graph: SemanticGraph }
  | { ok: false; refusal: 'unreachable' | 'no_answer' | 'malformed'; detail?: string };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Admit a tool input into the comparator's own types, or REFUSE it.
 *
 * ⛔ THIS IS THE LAST TRUSTWORTHY BOUNDARY BEFORE D. The structured router returns
 * the provider's result; it performs no second semantic validation. So this
 * function must obey its own contract.
 *
 * ⚠️ AN EARLIER DRAFT SAID "NEVER COERCES" AND COERCED THREE WAYS — an unknown
 * `kind` became `unspecified`, missing `properties` became `{}`, missing `edges`
 * became `[]` — and it enforced none of the schema's `additionalProperties: false`
 * independently. A malformed analysis was silently normalised into a plausible
 * graph, which is the most dangerous possible failure here: D would then compare
 * two graphs, one of which was partly invented by the admission layer.
 *
 * A legitimate one-node analysis sends `"edges": []`. The boundary does not
 * manufacture it.
 */
const NODE_KEYS = new Set(['local_id', 'kind', 'properties']);
const EDGE_KEYS = new Set(['from', 'to', 'relation']);
const TOP_KEYS = new Set(['nodes', 'edges']);

const extraKey = (o: Record<string, unknown>, allowed: ReadonlySet<string>): string | null => {
  for (const k of Object.keys(o)) if (!allowed.has(k)) return k;
  return null;
};

export function admitAnalysis(input: unknown): AnalysisResult {
  if (!isRecord(input)) return { ok: false, refusal: 'malformed', detail: 'not an object' };

  const extraTop = extraKey(input, TOP_KEYS);
  if (extraTop) return { ok: false, refusal: 'malformed', detail: `unexpected field ${extraTop}` };

  const rawNodes = input.nodes;
  const rawEdges = input.edges;
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    return { ok: false, refusal: 'malformed', detail: 'nodes absent or empty' };
  }
  /* ⛔ Absent edges is not an empty edge set. It is an incomplete answer. */
  if (!Array.isArray(rawEdges)) return { ok: false, refusal: 'malformed', detail: 'edges absent or not an array' };

  const index = new Map<string, number>();
  const nodes: SemanticNode[] = [];
  for (const n of rawNodes) {
    if (!isRecord(n)) return { ok: false, refusal: 'malformed', detail: 'node is not an object' };
    const extraNode = extraKey(n, NODE_KEYS);
    if (extraNode) return { ok: false, refusal: 'malformed', detail: `unexpected node field ${extraNode}` };
    if (typeof n.local_id !== 'string' || !n.local_id) {
      return { ok: false, refusal: 'malformed', detail: 'node without a local_id' };
    }
    if (index.has(n.local_id)) {
      return { ok: false, refusal: 'malformed', detail: `duplicate local_id ${n.local_id}` };
    }
    /* ⛔ An unknown kind is refused, never degraded. `kind` participates in
       correspondence, so inventing one would invent an identity. */
    if (typeof n.kind !== 'string' || !(KINDS as readonly string[]).includes(n.kind)) {
      return { ok: false, refusal: 'malformed', detail: `node ${n.local_id}: unknown or missing kind` };
    }
    if (!isRecord(n.properties)) {
      return { ok: false, refusal: 'malformed', detail: `node ${n.local_id}: properties absent` };
    }
    for (const [k, v] of Object.entries(n.properties)) {
      const domain = PROPERTY_DOMAINS[k];
      if (!domain) return { ok: false, refusal: 'malformed', detail: `unknown property ${k}` };
      if (typeof v !== 'string' || !domain.includes(v)) {
        return { ok: false, refusal: 'malformed', detail: `${k} cannot be ${String(v)}` };
      }
    }
    index.set(n.local_id, nodes.length);
    nodes.push({ label: n.local_id, kind: n.kind as NodeKind, properties: n.properties as SemanticNode['properties'] });
  }

  const edges: SemanticEdge[] = [];
  for (const e of rawEdges) {
    if (!isRecord(e)) return { ok: false, refusal: 'malformed', detail: 'edge is not an object' };
    const extraEdge = extraKey(e, EDGE_KEYS);
    if (extraEdge) return { ok: false, refusal: 'malformed', detail: `unexpected edge field ${extraEdge}` };
    if (typeof e.from !== 'string' || typeof e.to !== 'string'
        || typeof e.relation !== 'string' || !RELATIONS.includes(e.relation)) {
      return { ok: false, refusal: 'malformed', detail: 'malformed edge' };
    }
    const from = index.get(e.from); const to = index.get(e.to);
    if (from === undefined || to === undefined) {
      return { ok: false, refusal: 'malformed', detail: 'edge names an unknown node' };
    }
    edges.push({ from, to, kind: e.relation as SemanticEdge['kind'] });
  }

  return { ok: true, graph: { nodes, edges } };
}

/** One passage in, one graph out. ⛔ The caller decides which passage; this does not. */
async function analyze(passage: string, model: string): Promise<AnalysisResult> {
  try {
    const outcome = await runStructured({
      model, maxTokens: 2000,
      system: analyzerSystemPrompt(),
      messages: [{ role: 'user', content: passage }],
      tools: [{ name: ANALYZER_TOOL_NAME,
        description: 'The semantic structure of the passage you were given.',
        inputSchema: analyzerToolSchema }],
      toolChoice: { type: 'tool', name: ANALYZER_TOOL_NAME },
    });
    if (!outcome.ok) {
      logAskDiagnostic({ stage: 'structured_inference', refusal: outcome.refusal, model,
        cause: sanitizeCause(outcome.detail) });
      return { ok: false, refusal: 'unreachable' };
    }
    const calls = outcome.result.content.filter(
      (b): b is Extract<typeof b, { type: 'tool_use' }> =>
        b.type === 'tool_use' && b.name === ANALYZER_TOOL_NAME);
    if (calls.length === 0) return { ok: false, refusal: 'no_answer', detail: 'no tool call' };
    if (calls.length > 1) return { ok: false, refusal: 'malformed', detail: 'two answers are not an answer' };
    return admitAnalysis(calls[0].input);
  } catch (err) {
    logAskDiagnostic({ stage: 'structured_inference', refusal: 'exception', model,
      cause: sanitizeCause(err), requestId: requestIdOf(err) });
    return { ok: false, refusal: 'unreachable' };
  }
}

/** A — source only. ⛔ Takes no request, no candidate, no history: it cannot receive them. */
export const analyzeSource = (source: string, model = DEFAULT_MODEL) => analyze(source, model);

/** C — candidate only. ⛔ Takes no source and no expectation: it cannot receive them. */
export const analyzeCandidate = (candidate: string, model = DEFAULT_MODEL) => analyze(candidate, model);
