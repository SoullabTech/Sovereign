/**
 * BUILD-07B — the reader contract, falsified without a model.
 *
 * Every falsifier below PASSES with the seam refusing or absent (contract §3):
 * validation, rendering, parsing and binding are pure, and the post-seam path
 * is exercised through `resultFromBlocks` with fixture blocks. F14 runs the
 * real host loop under `sovereign` mode and proves the adapter is never even
 * loaded. A live-model witness is Gate B — a separate, later act against a
 * pinned candidate SHA.
 */

import { evidenceAtRev1, liveDraft, revisionOf } from '../../development/__tests__/fixture';
import { recoverEvidence } from '../../development/resolve';
import { freezeReadState, type DevelopmentalEvidence } from '../../development/readState';
import type { StructuredBlock } from '../../../ai/structured/types';
import {
  DEVELOPMENTAL_LENSES, DEVELOPMENTAL_NON_CONCLUSIONS, DEVELOPMENTAL_READ_CEILING_CODE_POINTS,
  type DevelopmentalReaderRequest, type RecoveredBody,
} from '../contract';
import {
  codePointLength, promptContractHash, READER_SYSTEM, READER_VERSION, readerTool, renderRequest,
  renderedRequestDigest, TOOL_NAME,
} from '../render';
import { validateRequest } from '../validate';
import { parseReaderBlocks } from '../parse';
import { readDevelopmentally, readerIdentity, resultFromBlocks } from '../read';

/* ── fixture plumbing ────────────────────────────────────────────────────── */

function recoveredFor(evidence: DevelopmentalEvidence, revisionContent: string): RecoveredBody[] {
  return Object.entries(evidence.coverage.sections)
    .filter(([, depth]) => depth === 'body')
    .map(([sectionId]) => {
      const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, revisionContent);
      if (!r.ok || r.value.kind !== 'text') throw new Error(`fixture recover failed: ${JSON.stringify(r)}`);
      return r.value;
    });
}

function request(opts: { bodyScope?: readonly string[]; withStructure?: boolean; lens?: string } = {}) {
  const { revision, evidence } = evidenceAtRev1({ bodyScope: opts.bodyScope, withStructure: opts.withStructure });
  const req: DevelopmentalReaderRequest = {
    commissionedLens: (opts.lens ?? 'development') as DevelopmentalReaderRequest['commissionedLens'],
    evidence,
    recovered: recoveredFor(evidence, revision.content),
  };
  return { req, revision, evidence };
}

const IDENTITY = readerIdentity('claude-test-model');

const call = (input: unknown, name = TOOL_NAME): StructuredBlock =>
  ({ type: 'tool_use', id: 't1', name, input });

const goodClaim = (over: Record<string, unknown> = {}) => ({
  text: 'The lantern introduced in s0 returns in s3 with nothing between.',
  refs: [{ kind: 'section', sectionId: 's0' }, { kind: 'section', sectionId: 's1' }],
  doesNotEstablish: ['across-unread-span', 'author-intent'],
  ...over,
});

/* ── F4 · lens ───────────────────────────────────────────────────────────── */

describe('F4 · exactly one canonical lens', () => {
  it('accepts each canonical lens and refuses anything else before the seam', () => {
    for (const lens of DEVELOPMENTAL_LENSES) {
      expect(validateRequest(request({ lens }).req).ok).toBe(true);
    }
    for (const bad of ['Development', 'tone', '', undefined, null, ['development']]) {
      const { req } = request();
      const v = validateRequest({ ...req, commissionedLens: bad as never });
      expect(v.ok ? 'ok' : v.refusal).toBe('invalid_lens');
    }
  });

  it('a claim carrying a lens is refused as a foreign field', () => {
    const { req } = request();
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [goodClaim({ lens: 'development' })] })], req, IDENTITY);
    expect(r.outcome === 'refused' ? r.refusal : r.outcome).toBe('foreign_field');
  });
});

/* ── F5 · ceiling ────────────────────────────────────────────────────────── */

describe('F5 · 60,000 code points, refused whole, never trimmed', () => {
  function bigRequest(bodyCodePoints: number) {
    /* Astral on purpose: 😀 is ONE code point and TWO UTF-16 units. */
    const big = '😀'.repeat(bodyCodePoints);
    const draft = liveDraft({ s0: big, s1: '', s2: 'x', s3: 'y' });
    const revision = revisionOf(draft);
    const r = freezeReadState({ draft, revision, bodyScope: ['s0', 's1'] });
    if (!r.ok) throw new Error(r.refusal);
    const req: DevelopmentalReaderRequest = {
      commissionedLens: 'voice', evidence: r.value, recovered: recoveredFor(r.value, revision.content),
    };
    return req;
  }

  it('exactly the ceiling passes; one more code point is refused; the measure is code points, not UTF-16 units', () => {
    const at = bigRequest(DEVELOPMENTAL_READ_CEILING_CODE_POINTS);
    const v = validateRequest(at);
    expect(v.ok && v.bodyCodePoints).toBe(DEVELOPMENTAL_READ_CEILING_CODE_POINTS);
    expect(at.recovered[0].text.length).toBe(2 * DEVELOPMENTAL_READ_CEILING_CODE_POINTS); // UTF-16 would refuse

    const over = validateRequest(bigRequest(DEVELOPMENTAL_READ_CEILING_CODE_POINTS + 1));
    expect(over.ok ? 'ok' : over.refusal).toBe('ceiling_exceeded');
    expect(over.ok ? '' : over.detail).toMatch(/refused whole, nothing trimmed/);
  });

  it('the host loop refuses over-ceiling before reaching the seam', async () => {
    const r = await readDevelopmentally(bigRequest(DEVELOPMENTAL_READ_CEILING_CODE_POINTS + 1));
    expect(r.outcome === 'refused' ? r.refusal : r.outcome).toBe('ceiling_exceeded');
  });
});

/* ── F1 · F6 · prose provenance ──────────────────────────────────────────── */

describe('F1 · F6 · prose enters only as whole sections recovered under this frozen state', () => {
  it('a valid request validates and renders every body-depth section exactly once', () => {
    const { req } = request();
    expect(validateRequest(req).ok).toBe(true);
    const rendered = renderRequest(req);
    expect(rendered).toContain('=== SECTION s0 ·');
    expect(rendered).toContain('=== SECTION s1 ·');
    expect(rendered).not.toContain('=== SECTION s2 ·');
    expect(rendered).toContain('2. s2 · POSITION');
  });

  it('one altered code point in recovered text is an integrity failure', () => {
    const { req } = request();
    const tampered = req.recovered.map((r, i) => i === 0 ? { ...r, text: r.text.replace('lantern', 'lamp') } : r);
    const v = validateRequest({ ...req, recovered: tampered });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_integrity_failure');
  });

  it('text supplied from the live draft (a different revision) is refused by digest', () => {
    const { req } = request();
    const changed = liveDraft({ s0: 'The First Movement 😀 — rewritten since the reading.\n\n' });
    const fromLive = req.recovered.map((r) => r.sectionId === 's0'
      ? { ...r, text: changed.sections[0].text } : r);
    const v = validateRequest({ ...req, recovered: fromLive });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_integrity_failure');
  });

  it('a section at position depth cannot be supplied as prose', () => {
    const { req, revision, evidence } = request();
    const s2 = recoverEvidence({ kind: 'section', sectionId: 's2' }, evidence.readState, revision.content);
    if (!s2.ok || s2.value.kind !== 'text') throw new Error('fixture');
    const v = validateRequest({ ...req, recovered: [...req.recovered, s2.value] });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_not_body_coverage');
  });

  it('a section the frozen state does not hold is refused', () => {
    const { req } = request();
    const v = validateRequest({ ...req, recovered: [...req.recovered, { ...req.recovered[0], sectionId: 'ghost' }] });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_not_in_read_state');
  });

  it('a passage of a section is not a whole section', () => {
    const { req, revision, evidence } = request();
    const part = recoverEvidence({ kind: 'passage', sectionId: 's0', range: { start: 0, end: 5 } }, evidence.readState, revision.content);
    if (!part.ok || part.value.kind !== 'text') throw new Error('fixture');
    const v = validateRequest({ ...req, recovered: [part.value, req.recovered[1]] });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_integrity_failure');
  });

  it('coverage that says body for a section with no recovered text is refused — the model would see less than coverage claims', () => {
    const { req } = request();
    const v = validateRequest({ ...req, recovered: req.recovered.slice(1) });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_integrity_failure');
  });

  it('recovered text from a different evidence object is refused by digest, never by trust', () => {
    const a = request({ bodyScope: ['s0', 's1'] });
    const other = liveDraft({ s1: 'The Second Movement\n\nEntirely other words 𝔘𝔫.\n\n' });
    const otherRev = revisionOf(other, 2);
    const fr = freezeReadState({ draft: other, revision: otherRev, bodyScope: ['s0', 's1'] });
    if (!fr.ok) throw new Error(fr.refusal);
    const foreignS1 = recoverEvidence({ kind: 'section', sectionId: 's1' }, fr.value.readState, otherRev.content);
    if (!foreignS1.ok || foreignS1.value.kind !== 'text') throw new Error('fixture');
    const v = validateRequest({ ...a.req, recovered: [a.req.recovered[0], foreignS1.value] });
    expect(v.ok ? 'ok' : v.refusal).toBe('recovered_integrity_failure');
  });
});

/* ── F7 · structure only from the frozen context ─────────────────────────── */

describe('F7 · structure reaches the prompt only from the frozen context', () => {
  it('renders the frozen authored units, with the member\'s words, and never the proposed row', () => {
    const { req } = request({ withStructure: true });
    const rendered = renderRequest(req);
    expect(rendered).toContain('AUTHORED STRUCTURE (the member\'s own');
    expect(rendered).toContain('unit u1 ·');
    expect(rendered).toContain('"chapter · One"');
    expect(rendered).not.toContain('p9');
    expect(rendered).not.toContain('MAIA thought so');
  });

  it('with no structure supplied, the prompt says so and a structural claim refuses the whole result', () => {
    const { req } = request({ withStructure: false });
    expect(renderRequest(req)).toContain('AUTHORED STRUCTURE: none was supplied');
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [
      goodClaim(),
      goodClaim({ refs: [{ kind: 'structure-unit', unitId: 'u1' }] }),
    ] })], req, IDENTITY);
    expect(r.outcome === 'refused' ? `${r.refusal}:${r.index}` : r.outcome).toBe('claim_unbindable:1');
    expect(r.outcome === 'refused' ? r.detail : '').toMatch(/structure_not_supplied/);
  });

  it('the request type has no structure field and no headings field', () => {
    const { req } = request();
    expect(Object.keys(req).sort()).toEqual(['commissionedLens', 'evidence', 'recovered']);
  });
});

/* ── F8 · F9 · claim accountability ──────────────────────────────────────── */

describe('F8 · every ref of every claim binds, or the whole result refuses', () => {
  it('claims whose refs all bind come back bound, in order, with their non-conclusions', () => {
    const { req } = request({ withStructure: true });
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [
      goodClaim(),
      goodClaim({ refs: [{ kind: 'passage', sectionId: 's0', range: { start: 0, end: 18 } }], doesNotEstablish: ['reader-effect'] }),
      goodClaim({ refs: [{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }, { kind: 'structure-topology' }] }),
    ] })], req, IDENTITY);
    expect(r.outcome).toBe('claims');
    if (r.outcome !== 'claims') return;
    expect(r.claims).toHaveLength(3);
    expect(r.claims[1].refs[0]).toEqual({ kind: 'passage', sectionId: 's0', range: { start: 0, end: 18 } });
    expect(r.claims[1].doesNotEstablish).toEqual(['reader-effect']);
    expect(r.reader).toEqual(IDENTITY);
  });

  it('one unbindable ref anywhere refuses everything — never the bindable subset', () => {
    const { req } = request();
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [
      goodClaim(),
      goodClaim({ refs: [{ kind: 'section', sectionId: 's3' }] }),   // s3 is position depth
    ] })], req, IDENTITY);
    expect(r.outcome === 'refused' ? `${r.refusal}:${r.index}` : r.outcome).toBe('claim_unbindable:1');
    expect(r.outcome === 'refused' ? r.detail : '').toMatch(/body_not_read/);
  });

  it('empty refs, a malformed ref, and an unknown section are each the bind refusal they are', () => {
    const { req } = request();
    for (const [refs, expected] of [
      [[], 'no_evidence'],
      [[{ kind: 'sectionish', sectionId: 's0' }], 'malformed_ref'],
      [[{ kind: 'section', sectionId: 'nope' }], 'unknown_section'],
      [[{ kind: 'section-run', sectionIds: ['s0', 's2'] }], 'run_not_as_read'],
    ] as const) {
      const r = resultFromBlocks([call({ outcome: 'claims', claims: [goodClaim({ refs })] })], req, IDENTITY);
      expect(r.outcome === 'refused' ? `${r.refusal} ${r.detail}` : r.outcome).toMatch(new RegExp(`^claim_unbindable .*${expected}`));
    }
  });
});

describe('F9 · at least one closed non-conclusion on every claim', () => {
  it('empty is missing; a value outside the eight is unknown; prose in the field is unknown', () => {
    const { req } = request();
    for (const [dne, expected] of [
      [[], 'non_conclusion_missing'],
      [['not-sure'], 'non_conclusion_unknown'],
      [['author-intent', 'I am unsure whether this matters'], 'non_conclusion_unknown'],
      [undefined, 'non_conclusion_missing'],
    ] as const) {
      const r = resultFromBlocks([call({ outcome: 'claims', claims: [goodClaim({ doesNotEstablish: dne })] })], req, IDENTITY);
      expect(r.outcome === 'refused' ? r.refusal : r.outcome).toBe(expected);
    }
  });

  it('the vocabulary is exactly the eight ratified values, in the tool schema verbatim', () => {
    expect([...DEVELOPMENTAL_NON_CONCLUSIONS]).toEqual([
      'outside-coverage', 'across-unread-span', 'whole-work-pattern', 'authored-structure-relation',
      'chronology', 'author-intent', 'reader-effect', 'editorial-consequence',
    ]);
    const schema = JSON.stringify(readerTool().input_schema);
    for (const v of DEVELOPMENTAL_NON_CONCLUSIONS) expect(schema).toContain(`"${v}"`);
    for (const v of DEVELOPMENTAL_NON_CONCLUSIONS) expect(READER_SYSTEM).toContain(v);
  });
});

/* ── F10 · F11 · F12 · F13 · nothing 07C-shaped, three outcomes, no read-request ── */

describe('F10 · nothing 07C-shaped exists in the schema or survives the parser', () => {
  const FORBIDDEN = ['id', 'observationKey', 'phenomenon', 'interpretation', 'questions', 'possibilities',
    'uncertainty', 'severity', 'priority', 'score', 'confidence', 'rank', 'lens'];

  it('the tool schema names none of them and closes additional properties at every level', () => {
    const schema = readerTool().input_schema as { properties: Record<string, unknown>; additionalProperties: boolean };
    expect(schema.additionalProperties).toBe(false);
    expect(Object.keys(schema.properties).sort()).toEqual(['claims', 'outcome']);
    const claimSchema = (schema.properties.claims as { items: { properties: Record<string, unknown>; additionalProperties: boolean } }).items;
    expect(claimSchema.additionalProperties).toBe(false);
    expect(Object.keys(claimSchema.properties).sort()).toEqual(['doesNotEstablish', 'refs', 'text']);
    const text = JSON.stringify(schema);
    for (const f of FORBIDDEN) expect(text).not.toMatch(new RegExp(`"${f}"\\s*:`));
  });

  it('a model output carrying any of them, on a claim or at the top level, is refused as foreign', () => {
    const { req } = request();
    for (const f of FORBIDDEN) {
      const onClaim = resultFromBlocks([call({ outcome: 'claims', claims: [goodClaim({ [f]: 'x' })] })], req, IDENTITY);
      expect(onClaim.outcome === 'refused' ? onClaim.refusal : onClaim.outcome).toBe('foreign_field');
      const onTop = resultFromBlocks([call({ outcome: 'claims', claims: [goodClaim()], [f]: 'x' })], req, IDENTITY);
      expect(onTop.outcome === 'refused' ? onTop.refusal : onTop.outcome).toBe('foreign_field');
    }
  });
});

describe('F11 · claims / none / refused are three distinct outcomes', () => {
  it('none is complete and carries the reader identity; none with claims is refused; claims with none is malformed', () => {
    const { req } = request();
    const none = resultFromBlocks([call({ outcome: 'none' })], req, IDENTITY);
    expect(none).toEqual({ outcome: 'none', reader: IDENTITY });
    const noneWith = resultFromBlocks([call({ outcome: 'none', claims: [] })], req, IDENTITY);
    expect(noneWith.outcome === 'refused' ? noneWith.refusal : noneWith.outcome).toBe('foreign_field');
    const empty = resultFromBlocks([call({ outcome: 'claims', claims: [] })], req, IDENTITY);
    expect(empty.outcome === 'refused' ? empty.refusal : empty.outcome).toBe('malformed_output');
    const missing = resultFromBlocks([call({ outcome: 'claims' })], req, IDENTITY);
    expect(missing.outcome === 'refused' ? missing.refusal : missing.outcome).toBe('malformed_output');
  });
});

describe('F12 · no read-request, in any form', () => {
  it('the contract exposes exactly one tool, and it is not a request', () => {
    expect(readerTool().name).toBe(TOOL_NAME);
    expect(JSON.stringify(readerTool())).not.toMatch(/request_sections|sectionIds":\s*\{[^}]*"description":\s*"[^"]*more/);
  });

  it('a call to a second tool that asks for more is read_request_attempted; an unknown tool is malformed', () => {
    const { req } = request();
    const asks = resultFromBlocks([call({ sectionIds: ['s2'] }, 'request_sections')], req, IDENTITY);
    expect(asks.outcome === 'refused' ? asks.refusal : asks.outcome).toBe('read_request_attempted');
    const both = resultFromBlocks([call({ outcome: 'none' }), call({ why: 'more' }, 'read_more')], req, IDENTITY);
    expect(both.outcome === 'refused' ? both.refusal : both.outcome).toBe('read_request_attempted');
    const unknown = resultFromBlocks([call({ outcome: 'none' }, 'propose_structure')], req, IDENTITY);
    expect(unknown.outcome === 'refused' ? unknown.refusal : unknown.outcome).toBe('malformed_output');
  });
});

describe('F13 · malformed output is refused, never coerced into none', () => {
  it('text-only, non-object input, two calls, and an unknown outcome are all malformed_output', () => {
    const { req } = request();
    const cases: StructuredBlock[][] = [
      [{ type: 'text', text: 'I noticed nothing.' }],
      [call('none')],
      [call({ outcome: 'none' }), call({ outcome: 'none' })],
      [call({ outcome: 'maybe' })],
    ];
    for (const blocks of cases) {
      const r = resultFromBlocks(blocks, req, IDENTITY);
      expect(r.outcome === 'refused' ? r.refusal : r.outcome).toBe('malformed_output');
    }
    const p = parseReaderBlocks([call({ outcome: 'claims', claims: [goodClaim({ text: '   ' })] })]);
    expect(p.ok ? 'ok' : p.refusal).toBe('empty_claim_text');
  });
});

/* ── F14 · seam refusals surface unchanged ───────────────────────────────── */

describe('F14 · under sovereign mode the seam refuses and no fallback is attempted', () => {
  const ADAPTER = '../../../ai/structured/anthropicStructuredAdapter';
  let loaded = false;
  beforeAll(() => {
    jest.doMock(ADAPTER, () => { loaded = true; throw new Error('adapter must not load under sovereign mode'); });
  });
  afterAll(() => { jest.dontMock(ADAPTER); });

  it('returns structured_inference_unavailable and never loads the provider', async () => {
    const prev = process.env.MAIA_INFERENCE_MODE;
    process.env.MAIA_INFERENCE_MODE = 'sovereign';
    try {
      const { req } = request();
      const r = await readDevelopmentally(req);
      expect(r.outcome === 'refused' ? r.refusal : r.outcome).toBe('structured_inference_unavailable');
      expect(loaded).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.MAIA_INFERENCE_MODE; else process.env.MAIA_INFERENCE_MODE = prev;
    }
  });

  it('an invalid mode is a refusal, never a default to primary', async () => {
    const prev = process.env.MAIA_INFERENCE_MODE;
    process.env.MAIA_INFERENCE_MODE = 'sovreign';
    try {
      const r = await readDevelopmentally(request().req);
      expect(r.outcome === 'refused' ? r.refusal : r.outcome).toBe('invalid_inference_mode');
    } finally {
      if (prev === undefined) delete process.env.MAIA_INFERENCE_MODE; else process.env.MAIA_INFERENCE_MODE = prev;
    }
  });
});

/* ── F15 · headings ──────────────────────────────────────────────────────── */

describe('F15 · no heading channel', () => {
  it('the rendered request carries ids, positions, and the member\'s frozen labels — no heading of any section', () => {
    const { req } = request({ withStructure: true });
    const rendered = renderRequest(req);
    /* The fixture's section headings live INSIDE the recovered prose (that is
       the member's text and may appear); nothing else may name them. */
    const outsideBodies = rendered.split('SECTION TEXT')[0];
    expect(outsideBodies).not.toMatch(/The First Movement|The Second Movement|The Fourth Movement/);
    expect(outsideBodies).not.toMatch(/heading/i);
  });
});

/* ── F17 · F20 · provenance and determinism ──────────────────────────────── */

describe('F17 · identity, version, prompt-contract hash, resolved model', () => {
  it('the hash is over system + tool contract together and moves when either moves', () => {
    const { createHash } = require('crypto') as typeof import('crypto');
    const expected = createHash('sha256').update(READER_SYSTEM, 'utf8').update('\u0000')
      .update(JSON.stringify(readerTool()), 'utf8').digest('hex');
    expect(promptContractHash()).toBe(expected);
    const perturbedSystem = createHash('sha256').update(READER_SYSTEM + '.', 'utf8').update('\u0000')
      .update(JSON.stringify(readerTool()), 'utf8').digest('hex');
    expect(perturbedSystem).not.toBe(expected);
    const tool = readerTool();
    (tool.input_schema as Record<string, unknown>).properties = { ...(tool.input_schema as { properties: object }).properties, extra: {} };
    const perturbedTool = createHash('sha256').update(READER_SYSTEM, 'utf8').update('\u0000')
      .update(JSON.stringify(tool), 'utf8').digest('hex');
    expect(perturbedTool).not.toBe(expected);
  });

  it('identity carries DEVELOPMENTAL-READER-03, provider anthropic, and the model it was given — the seam supplies the resolved one', () => {
    /* -02 since WS2-07-F1: the lens reached the reader with its ratified meaning
       and the claim boundary moved into the system prompt. -03 since 2026-09-05:
       section ids are confined to the evidence refs and may not appear in claim
       prose. Readings frozen under either version keep the identity they were
       made with — the version is provenance, never a filter. */
    expect(READER_VERSION).toBe('DEVELOPMENTAL-READER-03');
    expect(readerIdentity('m-1')).toEqual({ provider: 'anthropic', model: 'm-1', promptHash: promptContractHash(), readerVersion: 'DEVELOPMENTAL-READER-03' });
    expect(Object.keys(readerIdentity('m-1'))).not.toContain('frozenAt');
  });
});

describe('F20 · rendering is deterministic', () => {
  it('the same request renders byte-identically, regardless of recovered order', () => {
    const { req } = request({ withStructure: true });
    const a = renderRequest(req);
    const b = renderRequest({ ...req, recovered: [...req.recovered].reverse() });
    expect(a).toBe(b);
    expect(renderedRequestDigest(a)).toBe(renderedRequestDigest(b));
    expect(codePointLength('😀a')).toBe(2);
  });
});

/* ── F18 · a draft is not an observation ─────────────────────────────────── */

describe('F18 · a draft cannot stand where an observation will be required', () => {
  it('a bound result exposes refs, not BoundEvidence; re-binding is the only way to obtain the proof', () => {
    const { req } = request();
    const r = resultFromBlocks([call({ outcome: 'claims', claims: [goodClaim()] })], req, IDENTITY);
    if (r.outcome !== 'claims') throw new Error(r.outcome);
    const draft = r.claims[0];
    expect(Object.keys(draft).sort()).toEqual(['doesNotEstablish', 'refs', 'text']);
    /* Type-level: `{ evidence: BoundEvidence }` is not satisfiable by a draft.
       Runtime shadow of that fact — the draft has no `minted`, no `inputFingerprint`. */
    expect((draft as unknown as { evidence?: unknown }).evidence).toBeUndefined();
    expect(JSON.parse(JSON.stringify(draft))).toEqual(draft);
  });
});
