/**
 * WS2-ENCOUNTER-01 · E2-C — G1–G9.
 *
 * The gate is not "does the model produce text?" It is:
 *
 *   Can actual cognition perceive under Encounter's epistemology while remaining
 *   structurally unable to become DEVELOPMENT?
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { bindProposals } from '../bind';
import { parseNoticeBlocks } from '../parse';
import { renderWindowRequest, ENCOUNTER_SYSTEM, encounterModel, RESULT_TOOL_NAME } from '../render';
import { traverseWhole } from '../traversal';
import { screenCandidate } from '../vocabulary';
import { SEMANTIC_EAR_CORPUS } from '../semanticEar';
import type { EncounterSnapshot } from '../contract';
import type { StructuredBlock } from '@/lib/ai/structured/types';

const REPO = join(__dirname, '../../../..');
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

const TEXT = 'The house stood at the edge of the water. Every threshold in the book is wet.';
const SNAP: EncounterSnapshot = {
  draftId: 'd', manuscriptId: 'm', revisionNumber: 1,
  wholeDraftDigest: sha256(TEXT), length: Array.from(TEXT).length,
};

const toolUse = (input: unknown): StructuredBlock => ({ type: 'tool_use', id: 't', name: RESULT_TOOL_NAME, input });
/** One closed envelope carrying one notice. */
const proposal = (spans: { startCodePoint: number; endCodePoint: number }[], text = 'Water recurs at thresholds.') =>
  toolUse({ outcome: 'notices', notices: [{ family: 'recurrence', text, spans }] });
const silence = () => toolUse({ outcome: 'none' });
const WHOLE = (t: string) => ({ visibleStart: 0, visibleEnd: Array.from(t).length });

/* The seam is mocked so cognition outcomes can be driven; nothing calls a model. */
const mockRun = jest.fn();
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: (...a: unknown[]) => mockRun(...a) }));
const { structuredGenerator, CognitionUnavailable } = require('../structuredGenerator');
const { encounter } = require('../read');
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const { query } = require('@/lib/db/postgres');

const ok = (blocks: StructuredBlock[]) => ({ ok: true, result: { content: blocks, stopReason: 'end_turn' } });
beforeEach(() => {
  mockRun.mockReset();
  (query as jest.Mock).mockReset().mockResolvedValue({ rows: [{ id: 'd', content: TEXT, version: '1' }] });
});

describe('G1 · the model may point, it may not certify the pointing', () => {
  it('the SERVER computes the digest — nothing the model said reaches it', () => {
    const parsed = parseNoticeBlocks([proposal([{ startCodePoint: 41, endCodePoint: 76 }])]);
    expect(parsed.ok && parsed.proposals[0]).not.toHaveProperty('spanDigest');
    const bound = bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT));
    expect(bound[0].anchors[0].spanDigest).toBe(
      sha256(Array.from(TEXT).slice(41, 76).join('')),
    );
  });

  it('the tool schema has no field through which evidence could be certified', () => {
    const props = Object.keys(
      (require('../render').resultTool.inputSchema as any).properties.notices.items.properties.spans.items.properties,
    );
    expect(props.sort()).toEqual(['endCodePoint', 'startCodePoint']);
    expect(JSON.stringify(require('../render').resultTool)).not.toMatch(/digest|hash|sha/i);
  });

  it('⛔ an invented, inverted or out-of-range span does not bind', () => {
    const parsed = parseNoticeBlocks([
      proposal([{ startCodePoint: 5000, endCodePoint: 5010 }]),
      proposal([{ startCodePoint: 40, endCodePoint: 10 }]),
      proposal([{ startCodePoint: -3, endCodePoint: 10 }]),
    ]);
    expect(bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT))).toEqual([]);
  });

  it('⛔ one unbindable span discards the whole proposal', () => {
    /* An observation half of whose evidence does not exist is not half true. */
    const parsed = parseNoticeBlocks([proposal([
      { startCodePoint: 0, endCodePoint: 10 },
      { startCodePoint: 9000, endCodePoint: 9001 },
    ])]);
    expect(bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT))).toEqual([]);
  });
});

describe('G2 / G3 · silence and failure are different answers', () => {
  it('G2 zero proposals is lawful silence — a success', async () => {
    mockRun.mockResolvedValue(ok([silence()]));
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toMatchObject({ ok: true, notices: [] });
  });

  it('⛔ G3 provider unavailable → cognition_unavailable, NEVER notices: []', async () => {
    mockRun.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', detail: 'boom' });
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('⛔ G3 sovereignty outranks Encounter availability — refusal, not a substitute', async () => {
    /* A model that cannot honour the structured contract would be a DIFFERENT
       cognitive act. A sovereign deployment gets an honest refusal. */
    mockRun.mockResolvedValue({ ok: false, refusal: 'structured_inference_unavailable', detail: 'mode=sovereign' });
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('⛔ G3 a malformed structured response is a failure, not silence', async () => {
    mockRun.mockResolvedValue(ok([toolUse({ outcome: 'notices' })]));
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('⛔ G3 a foreign tool name is a failure, not an empty answer', async () => {
    expect(parseNoticeBlocks([{ type: 'tool_use', id: 't', name: 'develop', input: { outcome: 'none' } }]))
      .toEqual({ ok: false, reason: 'malformed_tool_input' });
  });
});

describe('G4 · partial cognition may not masquerade as whole-Work attention', () => {
  it('⛔ one failing window refuses the whole Encounter, discarding earlier notices', async () => {
    const long = 'x'.repeat(30_000);
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    mockRun
      .mockResolvedValueOnce(ok([proposal([{ startCodePoint: 0, endCodePoint: 10 }])]))
      .mockResolvedValueOnce(ok([proposal([{ startCodePoint: 20, endCodePoint: 30 }])]))
      .mockResolvedValueOnce({ ok: false, refusal: 'provider_unavailable', detail: 'W3' });
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('every planned window is processed on a successful Encounter', async () => {
    const long = 'y'.repeat(30_000);
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    mockRun.mockResolvedValue(ok([silence()]));
    const counters = { planned: 0, actual: 0 };
    await encounter('m', 'mem', structuredGenerator(counters));
    expect(counters.planned).toBe(traverseWhole(long).windows.length);
    expect(counters.actual).toBe(counters.planned);
  });
});

describe('G5 · rejection creates no retry', () => {
  it('⛔ every proposal failing the vocabulary screen still costs exactly the planned calls', async () => {
    const counters = { planned: 0, actual: 0 };
    mockRun.mockResolvedValue(ok([
      proposal([{ startCodePoint: 0, endCodePoint: 10 }], 'The opening is underdeveloped and could be stronger.'),
    ]));
    const r = await encounter('m', 'mem', structuredGenerator(counters));
    /* Screened out downstream → silence. Not a second attempt. */
    expect(r).toMatchObject({ ok: true, notices: [] });
    expect(counters.actual).toBe(counters.planned);
    expect(mockRun).toHaveBeenCalledTimes(counters.planned);
  });

  it('there is no retry, backoff or regeneration path in the generator', () => {
    const src = readFileSync(join(REPO, 'lib/manuscript/encounter/structuredGenerator.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ');
    expect(src).not.toMatch(/retry|attempt\s*[<>=]|regenerat|while\s*\(/i);
  });

  it('no unconstituted synthesis pass exists', () => {
    /* Window-local cognition may miss a distant recurrence. Missing a possible
       notice is lawful; inventing a synthesis stage is not. */
    const src = readFileSync(join(REPO, 'lib/manuscript/encounter/structuredGenerator.ts'), 'utf8');
    expect(src.match(/runStructured\(/g) ?? []).toHaveLength(1);
  });
});

describe('G6 · the request carries only authorized evidence and context', () => {
  const req = renderWindowRequest(SNAP, traverseWhole(TEXT).windows[0]);

  it('the Work, the contract, and coordinates — nothing else (C8)', () => {
    const wire = JSON.stringify(req);
    for (const forbidden of [
      'memory', 'profile', 'prior encounter', 'previous reading', 'developmental',
      'lens', 'other work', 'literary standard',
    ]) {
      expect(wire.toLowerCase()).not.toContain(forbidden);
    }
    expect(req.messages).toHaveLength(1);
    expect(req.messages[0].content).toContain(TEXT);
  });

  it('the contract tells the model that nothing to say is a complete answer', () => {
    expect(ENCOUNTER_SYSTEM).toMatch(/HAVING NOTHING TO SAY IS A COMPLETE ANSWER/);
    expect(ENCOUNTER_SYSTEM).toMatch(/Do not fill the five acts of attention/);
  });

  it('and forbids the moves the screen also forbids — the two agree', () => {
    for (const rule of [/wants, waits for, needs/i, /Never mention a reader/i, /Never rank, compare, praise/i]) {
      expect(ENCOUNTER_SYSTEM).toMatch(rule);
    }
  });
});

describe('G7 · Encounter is not DEVELOP', () => {
  /* Comments stripped — the ratified C21 discipline, and it bit again here: the
     first version of this test failed because render.ts NAMES `READER_SYSTEM` in
     a comment explaining that it is not used. A prose ban must never read as the
     banned behaviour returning. */
  const strip = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

  it('no DEVELOP imports or symbols anywhere in the module', () => {
    const dir = join(REPO, 'lib/manuscript/encounter');
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
      const src = strip(readFileSync(join(dir, f), 'utf8'));
      expect(src).not.toMatch(/from '[^']*developmentalRead(er|ing)/);
      expect(src).not.toMatch(/READER_SYSTEM|readerTool|commissionReading/);
    }
  });

  it('the contract asks no developmental question', () => {
    /* The lens QUESTIONS are the epistemology, so those are what must be absent. */
    const wire = `${ENCOUNTER_SYSTEM} ${JSON.stringify(require('../render').resultTool)}`.toLowerCase();
    for (const question of [
      'what is missing', 'does this belong here', 'does the sequence work',
      'what repeats', 'sufficiently developed', 'introduced too late',
      'what journey', 'established voice', 'internally consistent',
      'lose orientation', 'lens',
    ]) {
      expect(wire).not.toContain(question);
    }
  });

  it('and where a developmental word appears, it appears only as a PROHIBITION', () => {
    /* The second failure this test caught in itself: the contract legitimately
       names "underdeveloped" in order to forbid it. A scan that banned the word
       outright would forbid the instruction that protects the writer. So the
       assertion is on the SHAPE — every occurrence must sit in a sentence that
       forbids it. */
    for (const word of ['underdeveloped', 'abandoned', 'unresolved', 'missing']) {
      const sentences = ENCOUNTER_SYSTEM.split(/(?<=[.\n])/).filter((x) => x.toLowerCase().includes(word));
      for (const sentence of sentences) {
        expect(sentence).toMatch(/never|not\b|do not/i);
      }
    }
  });
});

describe('G9 · model choice cannot originate from the member gesture', () => {
  it('the route names no model, and the request body cannot carry one', () => {
    const route = readFileSync(join(REPO, 'app/api/sovereign/manuscripts/[id]/encounter/route.ts'), 'utf8');
    expect(route).not.toMatch(/model/i);
    /* Any key at all is already refused as foreign_field — including `model`. */
    expect(route).toMatch(/foreign_field/);
  });

  it('the model is server-side cognition configuration', () => {
    const prev = process.env.MAIA_ENCOUNTER_MODEL;
    process.env.MAIA_ENCOUNTER_MODEL = 'pinned-for-this-act';
    expect(encounterModel()).toBe('pinned-for-this-act');
    process.env.MAIA_ENCOUNTER_MODEL = prev;
    expect(renderWindowRequest(SNAP, traverseWhole(TEXT).windows[0]).model).toBe(encounterModel());
  });

  it('the generator accepts no model, provider or mode argument', () => {
    const src = readFileSync(join(REPO, 'lib/manuscript/encounter/structuredGenerator.ts'), 'utf8');
    expect(src).not.toMatch(/mode\s*[:?]|provider\s*[:?]|model\s*[:?]\s*string/);
  });
});

describe('G8 · the semantic ear, run through the real pipeline', () => {
  it('every corpus entry travels parse → bind → screen as a real proposal would', () => {
    for (const e of SEMANTIC_EAR_CORPUS) {
      const parsed = parseNoticeBlocks([proposal([{ startCodePoint: 0, endCodePoint: 20 }], e.text)]);
      expect(parsed.ok).toBe(true);
      const bound = bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT));
      expect(bound).toHaveLength(1);
      const violations = screenCandidate(bound[0]);
      if (e.verdict === 'lawful') expect(violations).toEqual([]);
      else if (e.structurallyCaught) expect(violations.length).toBeGreaterThan(0);
      else expect(violations).toEqual([]); // the honest residue
    }
  });

  it('⚠ adjudication against LIVE model output is owed and has NOT been performed', () => {
    /* This suite drives the seam with fixtures, so it proves the pipeline, not
       the model's ear. G8 is not complete until a person adjudicates real
       generated candidates. Recorded here so the gap cannot be mistaken for
       coverage — and it is not a second judge model, which would need its own
       constitution and its own negative controls first. */
    expect(SEMANTIC_EAR_CORPUS.some((e) => e.verdict === 'unlawful' && !e.structurallyCaught)).toBe(true);
  });
});

describe('G10 · the production act crosses cognition (B1)', () => {
  it('⛔ encounter() has NO default generator — cognition cannot be skipped', () => {
    const src = readFileSync(join(REPO, 'lib/manuscript/encounter/read.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ');
    /* "Silence is lawful" must never come to mean "cognition is optional". */
    expect(src).not.toMatch(/generate\s*:\s*NoticeGenerator\s*=/);
  });

  it('the route invokes the structured generator, not a silent one', () => {
    const route = readFileSync(join(REPO, 'app/api/sovereign/manuscripts/[id]/encounter/route.ts'), 'utf8');
    expect(route).toMatch(/encounter\(id, memberId, structuredGenerator\(\)\)/);
    expect(route).not.toMatch(/silentGenerator/);
  });

  it('the generator binds against the captured text the traversal came from', () => {
    /* No re-read, no second snapshot: the text arrives from the act itself. */
    const gen = readFileSync(join(REPO, 'lib/manuscript/encounter/structuredGenerator.ts'), 'utf8');
    expect(gen).toMatch(/\{\s*snapshot,\s*windows,\s*text\s*\}/);
    expect(gen).not.toMatch(/captureDraft|SELECT/);
  });
});

describe('G1B · existence is not exposure (B2)', () => {
  const long = 'A'.repeat(12_000) + 'B'.repeat(12_000);
  const windows = traverseWhole(long).windows;

  it('⛔ a span valid in the manuscript but wholly inside ANOTHER window does not bind', async () => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    /* Window 2 answers with coordinates 100..150 — real bytes, genuinely in the
       Work, that this call never saw. Certifying them would prove evidence for
       the WORK rather than evidence for the CLAIM. */
    mockRun
      .mockResolvedValueOnce(ok([silence()]))
      .mockResolvedValueOnce(ok([proposal([{ startCodePoint: 100, endCodePoint: 150 }])]));
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toMatchObject({ ok: true, notices: [] });
  });

  it('a span inside the call’s own visible range binds', () => {
    const w = windows[1];
    const parsed = parseNoticeBlocks([proposal([
      { startCodePoint: w.startCodePoint + 5, endCodePoint: w.startCodePoint + 25 },
    ])]);
    const bound = bindProposals(long, parsed.ok ? parsed.proposals : [], {
      visibleStart: w.contextStartCodePoint, visibleEnd: w.endCodePoint,
    });
    expect(bound).toHaveLength(1);
  });

  it('overlap is lawful, because overlap was genuinely shown', () => {
    const w = windows[1];
    /* Inside the context prefix: earlier in the Work, but this call saw it. */
    const inOverlap = { startCodePoint: w.contextStartCodePoint + 1, endCodePoint: w.startCodePoint - 1 };
    const parsed = parseNoticeBlocks([proposal([inOverlap])]);
    const bound = bindProposals(long, parsed.ok ? parsed.proposals : [], {
      visibleStart: w.contextStartCodePoint, visibleEnd: w.endCodePoint,
    });
    expect(bound).toHaveLength(1);
  });
});

describe('B3 · silence is something the model SAYS', () => {
  const run = async (blocks: StructuredBlock[]) => {
    mockRun.mockResolvedValue(ok(blocks));
    return encounter('m', 'mem', structuredGenerator());
  };

  it('an explicit structured `none` is lawful silence', async () => {
    expect(await run([silence()])).toMatchObject({ ok: true, notices: [] });
  });

  it('⛔ a prose-only answer REFUSES — it is not contemplative silence', async () => {
    /* The ambiguity B3 removes: "nothing to add" and "I notice the ending wants
       resolution" both used to read as lawful silence. The second is an
       unscreened diagnosis. */
    expect(await run([{ type: 'text', text: 'I notice the ending wants resolution.' }]))
      .toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('⛔ zero structured results refuses', async () => {
    expect(await run([])).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('⛔ two envelopes refuse — the contract is one answer', async () => {
    expect(await run([silence(), silence()])).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('⛔ inconsistent outcomes refuse', async () => {
    expect(parseNoticeBlocks([toolUse({ outcome: 'none', notices: [] })]).ok).toBe(false);
    expect(parseNoticeBlocks([toolUse({ outcome: 'notices', notices: [] })]).ok).toBe(false);
    expect(parseNoticeBlocks([toolUse({ outcome: 'maybe' })]).ok).toBe(false);
  });

  it('⛔ undeclared fields refuse rather than acquiring meaning', async () => {
    /* A field the model invented must not mean anything merely because the
       provider tolerated it — least of all one that looks like evidence proof. */
    for (const rogue of [
      { outcome: 'none', digest: 'deadbeef' },
      { outcome: 'notices', notices: [{ family: 'recurrence', text: 'x', spans: [{ startCodePoint: 0, endCodePoint: 5 }], confidence: 0.9 }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', text: 'x', spans: [{ startCodePoint: 0, endCodePoint: 5, spanDigest: 'forged' }] }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', text: 'x', spans: [{ startCodePoint: 0, endCodePoint: 5 }], severity: 'high' }] },
    ]) {
      expect(parseNoticeBlocks([toolUse(rogue)]).ok).toBe(false);
    }
  });

  it('the contract requires the tool — prose is not an answer', () => {
    const req = renderWindowRequest(SNAP, traverseWhole(TEXT).windows[0]);
    expect(req.toolChoice).toEqual({ type: 'tool', name: RESULT_TOOL_NAME });
    expect(JSON.stringify(req.tools)).toContain('"additionalProperties":false');
  });
});
