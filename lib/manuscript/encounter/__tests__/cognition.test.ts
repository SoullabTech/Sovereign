/**
 * WS2-ENCOUNTER-01 · E2-C — G1–G10, and the E-series added after the first live
 * witness.
 *
 * The gate is not "does the model produce text?" It is:
 *
 *   Can actual cognition perceive under Encounter's epistemology while remaining
 *   structurally unable to become DEVELOPMENT?
 *
 * G8 added the second question, and the live run answered it badly:
 *
 *   Does the evidence a notice cites actually correspond to the notice?
 *
 * The model quoted accurately and located falsely. So the E-series (E1–E10)
 * exists to pin the repair: the model reproduces evidence verbatim, the server
 * establishes where it is, and every way of softening that is a failing test.
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { bindExcerpt, bindProposals } from '../bind';
import { parseNoticeBlocks } from '../parse';
import { renderWindowRequest, ENCOUNTER_SYSTEM, encounterModel, RESULT_TOOL_NAME } from '../render';
import { traverseWhole } from '../traversal';
import { screenCandidate } from '../vocabulary';
import { SEMANTIC_EAR_CORPUS } from '../semanticEar';
import type { EncounterSnapshot } from '../contract';
import type { NoticeGenerator } from '../read';
import type { StructuredBlock } from '@/lib/ai/structured/types';

const REPO = join(__dirname, '../../../..');
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

const TEXT = 'The house stood at the edge of the water. Every threshold in the book is wet.';
const CITED = 'Every threshold in the book is wet.';
const SNAP: EncounterSnapshot = {
  draftId: 'd', manuscriptId: 'm', revisionNumber: 1,
  wholeDraftDigest: sha256(TEXT), length: Array.from(TEXT).length,
};

/** Long enough to traverse into several windows, and unique at every position. */
const longText = (sentences: number) =>
  Array.from({ length: sentences }, (_, i) => `Sentence ${i} sits here with a number of its own. `).join('');

const toolUse = (input: unknown): StructuredBlock => ({ type: 'tool_use', id: 't', name: RESULT_TOOL_NAME, input });
/** One closed envelope carrying one notice. Evidence is VERBATIM Work material. */
const proposal = (excerpts: string[], assertion = 'Water recurs at thresholds.') =>
  toolUse({
    outcome: 'notices',
    notices: [{ family: 'recurrence', assertion, evidence: excerpts.map((excerpt) => ({ excerpt })) }],
  });
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

describe('G1 · the model may point, it may not certify — or locate — the pointing', () => {
  it('the SERVER computes the range and the digest — nothing the model said reaches them', () => {
    const parsed = parseNoticeBlocks([proposal([CITED])]);
    expect(parsed.ok && parsed.proposals[0]).not.toHaveProperty('spanDigest');
    expect(parsed.ok && parsed.proposals[0]).not.toHaveProperty('startCodePoint');
    const bound = bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT));
    expect(bound[0].anchors[0]).toEqual({
      startCodePoint: TEXT.indexOf(CITED),
      endCodePoint: TEXT.indexOf(CITED) + Array.from(CITED).length,
      spanDigest: sha256(CITED),
    });
  });

  it('the tool schema has no field through which evidence could be certified', () => {
    expect(JSON.stringify(require('../render').resultTool)).not.toMatch(/digest|hash|sha/i);
  });

  it('⛔ a fabricated excerpt does not bind', () => {
    const parsed = parseNoticeBlocks([proposal(['The house burned down at dawn.'])]);
    expect(bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT))).toEqual([]);
  });

  it('⛔ one unbindable excerpt discards the whole proposal', () => {
    /* An observation half of whose evidence does not exist is not half true. */
    const parsed = parseNoticeBlocks([proposal([CITED, 'a sentence never written'])]);
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

  it('⛔ G3 a foreign tool name is a failure, not an empty answer', () => {
    expect(parseNoticeBlocks([{ type: 'tool_use', id: 't', name: 'develop', input: { outcome: 'none' } }]))
      .toEqual({ ok: false, reason: 'malformed_tool_input' });
  });
});

describe('G4 · partial cognition may not masquerade as whole-Work attention', () => {
  it('⛔ one failing window refuses the whole Encounter, discarding earlier notices', async () => {
    const long = longText(700);
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    mockRun
      .mockResolvedValueOnce(ok([proposal(['Sentence 1 sits here with a number of its own.'])]))
      .mockResolvedValueOnce(ok([silence()]))
      .mockResolvedValueOnce({ ok: false, refusal: 'provider_unavailable', detail: 'W3' });
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toEqual({ ok: false, refusal: 'cognition_unavailable' });
  });

  it('every planned window is processed on a successful Encounter', async () => {
    const long = longText(700);
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
      proposal([CITED], 'The opening is underdeveloped and could be stronger.'),
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

  it('the Work and the contract — nothing else (C8)', () => {
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

  it('and no coordinates — the model is handed no number it could count back to', () => {
    /* The live witness showed the model estimating positions from exactly this
       framing. Withholding the numbers removes the invitation. */
    const preamble = (req.messages[0].content as string).replace(TEXT, '');
    expect(preamble).not.toMatch(/\d/);
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
      const parsed = parseNoticeBlocks([proposal([CITED], e.text)]);
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

/* ══════════════════════════════════════════════════════════════════════════
   E1–E10 · the exact-excerpt evidence primitive.

   Founder ruling 2026-09-08, after G8 FAILED on grounding:

     The cognition identifies the evidence by reproducing it.
     The server establishes where that evidence actually is.

     The server may establish an EXACT correspondence.
     It may never infer an INTENDED correspondence.
   ══════════════════════════════════════════════════════════════════════════ */

/** A fixture Work with the awkward cases built in, not sanded off. */
const WORK = [
  'A rune: 𝔊 stands here.',                                    // astral: UTF-16 ≠ code points
  'The house stood at the edge of the water.',
  'She said it wasn’t hers.',                                  // curly apostrophe
  'There is no clear theme here, and the reader loses orientation.', // the WORK's own words
  'The door opened.',
  'A while later, the wind turned.',
  'The door opened.',                                          // deliberate repetition
].join('\n');
const WORK_WHOLE = WHOLE(WORK);
const bindOne = (excerpt: string) => bindExcerpt(WORK, WORK_WHOLE, excerpt);

describe('E1 · an exact, unique excerpt binds — in CODE POINTS', () => {
  it('binds, and the anchor addresses the same characters the model quoted', () => {
    const excerpt = 'She said it wasn’t hers.';
    const b = bindOne(excerpt);
    expect(b.ok).toBe(true);
    if (!b.ok) return;
    expect(b.boundText).toBe(excerpt);
    /* The astral rune earlier in the Work makes UTF-16 and code-point indices
       disagree; the anchor must be right in code points, which is the contract. */
    expect(Array.from(WORK).slice(b.anchor.startCodePoint, b.anchor.endCodePoint).join('')).toBe(excerpt);
    expect(b.anchor.startCodePoint).not.toBe(WORK.indexOf(excerpt)); // UTF-16 index would be wrong
    expect(b.anchor.spanDigest).toBe(sha256(excerpt));
  });
});

describe('E2 · a fabricated excerpt does not bind', () => {
  it('⛔ not_found — never the nearest plausible text', () => {
    expect(bindOne('She said it was never hers at all.')).toEqual({ ok: false, reason: 'not_found' });
  });
});

describe('E3 · a repeated excerpt does not bind', () => {
  it('⛔ ambiguous — with two occurrences the server chooses NOTHING', () => {
    expect(bindOne('The door opened.')).toEqual({ ok: false, reason: 'ambiguous' });
  });

  it('extending the quotation until it is unique is the lawful remedy', () => {
    /* The model's own move, not the server's: quote more, do not guess which. */
    expect(bindOne('The door opened.\nA while later').ok).toBe(true);
  });
});

describe('E4 · exactness means exactness', () => {
  const cases: Array<[string, string]> = [
    ['straight apostrophe for curly', "She said it wasn't hers."],
    ['case folded', 'she said it wasn’t hers.'],
    ['whitespace normalized', 'She said  it wasn’t hers.'],
    ['newline collapsed to a space', 'The door opened. A while later, the wind turned.'],
    ['punctuation added', 'She said, it wasn’t hers.'],
  ];
  it.each(cases)('⛔ %s does not bind', (_label, excerpt) => {
    /* No normalization, no folding, no fuzzy match, no edit distance. This will
       suppress some lawful observations. Measure that later rather than hide it
       behind a forgiving matcher. */
    expect(bindOne(excerpt).ok).toBe(false);
  });

  it('a SHORTER exact substring binds, and that is correct, not leniency', () => {
    /* Dropping the closing period leaves an exact substring, so it binds — to
       the shorter span it actually names. The rule is exact correspondence, not
       whole-sentence quotation: the server certifies what the model quoted, no
       more and no less. */
    const b = bindOne('She said it wasn’t hers');
    expect(b.ok).toBe(true);
    if (b.ok) expect(b.boundText).toBe('She said it wasn’t hers');
  });

  it('and the matcher contains no normalization machinery at all', () => {
    const src = readFileSync(join(REPO, 'lib/manuscript/encounter/bind.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(src).not.toMatch(/toLowerCase|normalize|replace\(|trim\(|levenshtein|fuzzy|similar/i);
  });
});

describe('E5 · the model has no field in which to make a location claim', () => {
  const schema = JSON.stringify(require('../render').resultTool);

  it('⛔ no coordinate, digest or unit field exists anywhere in the tool schema', () => {
    for (const forbidden of [
      'startCodePoint', 'endCodePoint', 'spanDigest', 'unitId', 'paragraph',
      'section', 'offset', 'index', 'position', 'line',
    ]) {
      expect(schema).not.toContain(forbidden);
    }
  });

  it('the notice carries exactly family, assertion and evidence; evidence exactly an excerpt', () => {
    const notice = (require('../render').resultTool.inputSchema as any).properties.notices.items;
    expect(Object.keys(notice.properties).sort()).toEqual(['assertion', 'evidence', 'family']);
    expect(Object.keys(notice.properties.evidence.items.properties)).toEqual(['excerpt']);
  });

  it('⛔ and a coordinate the model volunteers anyway is REFUSED, not ignored', () => {
    for (const rogue of [
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED }], spans: [{ startCodePoint: 0 }] }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED, startCodePoint: 41 }] }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED, spanDigest: 'forged' }] }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED }], confidence: 0.9 }] },
      { outcome: 'none', digest: 'deadbeef' },
    ]) {
      expect(parseNoticeBlocks([toolUse(rogue)]).ok).toBe(false);
    }
  });
});

describe('E6 · existence is not exposure — still true of excerpts (B2)', () => {
  const long = longText(600);
  const windows = traverseWhole(long).windows;
  const sentence = (i: number) => `Sentence ${i} sits here with a number of its own.`;
  /** The first whole sentence lying entirely inside [lo, hi). ASCII, so UTF-16
      indices and code points coincide in this fixture only. */
  const pick = (lo: number, hi: number) => {
    for (let i = 0; i < 600; i += 1) {
      const s = sentence(i);
      const at = long.indexOf(s);
      if (at >= lo && at + s.length <= hi) return s;
    }
    throw new Error('fixture has no sentence in that range');
  };

  it('⛔ an excerpt genuinely in the Work but shown to ANOTHER call does not bind', async () => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    /* Real bytes, genuinely in the Work, that window 2 never saw. Binding them
       would prove evidence for the WORK rather than evidence for the CLAIM. */
    mockRun
      .mockResolvedValueOnce(ok([silence()]))
      .mockResolvedValueOnce(ok([proposal([sentence(0)])]))
      .mockResolvedValue(ok([silence()]));
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r).toMatchObject({ ok: true, notices: [] });
  });

  it('an excerpt inside the call’s own visible range binds', () => {
    const w = windows[1];
    const own = pick(w.startCodePoint, w.endCodePoint);
    const parsed = parseNoticeBlocks([proposal([own])]);
    const bound = bindProposals(long, parsed.ok ? parsed.proposals : [], {
      visibleStart: w.contextStartCodePoint, visibleEnd: w.endCodePoint,
    });
    expect(bound).toHaveLength(1);
  });

  it('overlap is lawful, because overlap was genuinely shown', () => {
    const w = windows[1];
    const inOverlap = pick(w.contextStartCodePoint, w.startCodePoint);
    const parsed = parseNoticeBlocks([proposal([inOverlap])]);
    const bound = bindProposals(long, parsed.ok ? parsed.proposals : [], {
      visibleStart: w.contextStartCodePoint, visibleEnd: w.endCodePoint,
    });
    expect(bound).toHaveLength(1);
  });
});

describe('E7 · quoting the Work does not make MAIA the author of it', () => {
  it('the Work’s own forbidden language, quoted as evidence, does not trip the screen', () => {
    /* This is the second G8 finding. A Work is entitled to contain sentences
       MAIA may never assert; the boundary is the SHAPE, not quotation marks. */
    const quoted = 'There is no clear theme here, and the reader loses orientation.';
    const parsed = parseNoticeBlocks([
      proposal([quoted], 'This sentence runs longer than the ones around it.'),
    ]);
    const bound = bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE);
    expect(bound).toHaveLength(1);
    expect(screenCandidate(bound[0])).toEqual([]);
  });
});

describe('E8 · evidence is not a second, unscreened assertion channel', () => {
  it('the bound notice carries the assertion ONLY — the excerpt never travels in it', () => {
    const quoted = 'There is no clear theme here, and the reader loses orientation.';
    const assertion = 'This sentence runs longer than the ones around it.';
    const parsed = parseNoticeBlocks([proposal([quoted], assertion)]);
    const bound = bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE);
    expect(bound[0].text).toBe(assertion);
    expect(bound[0].text).not.toContain(quoted);
    /* All the evidence becomes is coordinates and a digest. There is no field on
       a CandidateNotice through which model-authored prose could ride along —
       `scope` is server-derived and carries no model input at all. */
    expect(Object.keys(bound[0]).sort()).toEqual(['anchors', 'family', 'scope', 'text']);
  });

  it('⛔ a diagnosis smuggled into `evidence` cannot reach the writer — it is not in the Work', () => {
    const parsed = parseNoticeBlocks([
      proposal(['The ending is underdeveloped and needs work.'], 'The final line is short.'),
    ]);
    /* Evidence must be Work material. Anything MAIA composed is, by definition,
       not present in the Work, so it does not bind, and the notice dies with it. */
    expect(bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE)).toEqual([]);
  });
});

describe('E9 · the assertion is still screened, exactly as before', () => {
  it('⛔ MAIA’s own deficit language is caught even when the evidence is impeccable', () => {
    const parsed = parseNoticeBlocks([
      proposal(['The door opened.\nA while later'], 'The middle is underdeveloped and the reader loses orientation.'),
    ]);
    const bound = bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE);
    expect(bound).toHaveLength(1);
    expect(screenCandidate(bound[0])).toEqual(
      expect.arrayContaining(['deficit_lexicon', 'reader_effect']),
    );
  });
});

describe('E10 · one failed evidence member invalidates the whole notice', () => {
  it('⛔ good excerpt + fabricated excerpt = no notice', () => {
    const parsed = parseNoticeBlocks([
      proposal(['She said it wasn’t hers.', 'and then she left the house forever'], 'Two moments sit together.'),
    ]);
    expect(bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE)).toEqual([]);
  });

  it('⛔ good excerpt + ambiguous excerpt = no notice', () => {
    const parsed = parseNoticeBlocks([
      proposal(['She said it wasn’t hers.', 'The door opened.'], 'Two moments sit together.'),
    ]);
    expect(bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE)).toEqual([]);
  });

  it('and a notice whose evidence all binds survives, with one anchor per excerpt', () => {
    const parsed = parseNoticeBlocks([
      proposal(['She said it wasn’t hers.', 'A while later, the wind turned.'], 'Two moments sit together.'),
    ]);
    const bound = bindProposals(WORK, parsed.ok ? parsed.proposals : [], WORK_WHOLE);
    expect(bound).toHaveLength(1);
    expect(bound[0].anchors).toHaveLength(2);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   S1–S7 · scope honesty.

   Founder ruling 2026-09-08, after the second live witness falsified F-2:

     A cognition may not assert more than the evidence field it was actually
     permitted to perceive.

     Encounter scope is server-owned provenance. Every MAIA observation must
     carry the exact perceptual scope from which it arose. A window-local
     cognition may never emerge wearing whole-Work authority.

   Two notices in that witness claimed non-return across a 386,031-code-point
   Work from a call shown 12,000. The wording was the symptom; the defect was
   that the record could not tell — window was transport on the way in and
   vanished as authority on the way out.
   ══════════════════════════════════════════════════════════════════════════ */

describe('S1 · scope is derived from the window the call was actually made from', () => {
  it('and is the same range the evidence was bound in — one value, so they cannot disagree', () => {
    const long = longText(600);
    const w = traverseWhole(long).windows[1];
    const sentence = (i: number) => `Sentence ${i} sits here with a number of its own.`;
    let own = '';
    for (let i = 0; i < 600 && !own; i += 1) {
      const at = long.indexOf(sentence(i));
      if (at >= w.startCodePoint && at + sentence(i).length <= w.endCodePoint) own = sentence(i);
    }
    const parsed = parseNoticeBlocks([proposal([own], 'The numbering advances steadily here.')]);
    const bound = bindProposals(long, parsed.ok ? parsed.proposals : [], {
      visibleStart: w.contextStartCodePoint, visibleEnd: w.endCodePoint,
    });
    expect(bound[0].scope).toEqual({
      kind: 'visible_window',
      startCodePoint: w.contextStartCodePoint,
      endCodePoint: w.endCodePoint,
    });
    /* Including the overlap: the context prefix was genuinely shown, so it is
       genuinely inside what may be claimed. */
    expect(bound[0].scope.startCodePoint).toBe(w.contextStartCodePoint);
  });

  it('a Work small enough to be one window is scoped to the whole draft — truthfully', () => {
    const parsed = parseNoticeBlocks([proposal([CITED])]);
    const bound = bindProposals(TEXT, parsed.ok ? parsed.proposals : [], WHOLE(TEXT));
    expect(bound[0].scope).toEqual({
      kind: 'visible_window', startCodePoint: 0, endCodePoint: Array.from(TEXT).length,
    });
  });
});

describe('S2 · the model has no say in its own scope', () => {
  it('⛔ there is no scope field anywhere in the tool schema', () => {
    const schema = JSON.stringify(require('../render').resultTool);
    for (const forbidden of ['scope', 'window', 'visible', 'whole', 'range']) {
      expect(schema.toLowerCase()).not.toContain(forbidden);
    }
  });

  it('⛔ a volunteered scope is REFUSED, not ignored and not honoured', () => {
    for (const rogue of [
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED }], scope: { kind: 'whole_work' } }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED, scope: 'whole' }] }] },
    ]) {
      expect(parseNoticeBlocks([toolUse(rogue)]).ok).toBe(false);
    }
  });

  it('the parsed proposal carries no scope at all — there is nothing to honour', () => {
    const parsed = parseNoticeBlocks([proposal([CITED])]);
    expect(parsed.ok && parsed.proposals[0]).not.toHaveProperty('scope');
  });
});

describe('S3 · promotion preserves scope unchanged', () => {
  it('the MaiaNotice carries the candidate’s scope, never the whole draft', async () => {
    const long = longText(600);
    const windows = traverseWhole(long).windows;
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    const w = windows[1];
    const sentence = (i: number) => `Sentence ${i} sits here with a number of its own.`;
    let own = '';
    for (let i = 0; i < 600 && !own; i += 1) {
      const at = long.indexOf(sentence(i));
      if (at >= w.startCodePoint && at + sentence(i).length <= w.endCodePoint) own = sentence(i);
    }
    mockRun
      .mockResolvedValueOnce(ok([silence()]))
      .mockResolvedValueOnce(ok([proposal([own], 'The numbering advances steadily here.')]))
      .mockResolvedValue(ok([silence()]));
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r.ok).toBe(true);
    expect(r.notices).toHaveLength(1);
    expect(r.notices[0].scope).toEqual({
      kind: 'visible_window',
      startCodePoint: w.contextStartCodePoint,
      endCodePoint: w.endCodePoint,
    });
    /* ⛔ The defect this repair exists to prevent: a window-local observation
       emerging with the authority of the whole Work. */
    expect(r.notices[0].scope.endCodePoint).toBeLessThan(Array.from(long).length);
  });
});

describe('S4 · each notice carries its OWN field, and inherits no other', () => {
  it('two windows produce two different scopes in one Encounter', async () => {
    const long = longText(600);
    const windows = traverseWhole(long).windows;
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: long, version: '1' }] });
    const sentence = (i: number) => `Sentence ${i} sits here with a number of its own.`;
    const pickIn = (w: typeof windows[number]) => {
      for (let i = 0; i < 600; i += 1) {
        const at = long.indexOf(sentence(i));
        if (at >= w.startCodePoint && at + sentence(i).length <= w.endCodePoint) return sentence(i);
      }
      throw new Error('no sentence in window');
    };
    mockRun
      .mockResolvedValueOnce(ok([proposal([pickIn(windows[0])], 'The numbering advances steadily here.')]))
      .mockResolvedValueOnce(ok([proposal([pickIn(windows[1])], 'The numbering continues in this stretch.')]))
      .mockResolvedValue(ok([silence()]));
    const r = await encounter('m', 'mem', structuredGenerator());
    expect(r.ok && r.notices).toHaveLength(2);
    const [a, b] = r.notices;
    expect(a.scope).not.toEqual(b.scope);
    expect(a.scope.endCodePoint).toBe(windows[0].endCodePoint);
    expect(b.scope.startCodePoint).toBe(windows[1].contextStartCodePoint);
  });
});

describe('S5 · an anchor may never sit outside the field its notice claims', () => {
  it('⛔ a hand-built candidate whose anchor escapes its scope is not promoted', async () => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: TEXT, version: '1' }] });
    const points = Array.from(TEXT);
    const start = TEXT.indexOf(CITED);
    const outside: NoticeGenerator = async () => [{
      family: 'recurrence',
      text: 'Water recurs at thresholds.',
      anchors: [{
        startCodePoint: start,
        endCodePoint: start + Array.from(CITED).length,
        spanDigest: createHash('sha256').update(points.slice(start, start + Array.from(CITED).length).join('')).digest('hex'),
      }],
      /* A narrower scope than the evidence it carries: real bytes, honest
         digest, and an authority claim the evidence does not sit inside. */
      scope: { kind: 'visible_window', startCodePoint: 0, endCodePoint: 10 },
    }];
    const r = await encounter('m', 'mem', outside);
    expect(r).toMatchObject({ ok: true, notices: [] });
  });

  it('the same candidate scoped to what it was actually shown IS promoted', async () => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: TEXT, version: '1' }] });
    const points = Array.from(TEXT);
    const start = TEXT.indexOf(CITED);
    const inside: NoticeGenerator = async () => [{
      family: 'recurrence',
      text: 'Water recurs at thresholds.',
      anchors: [{
        startCodePoint: start,
        endCodePoint: start + Array.from(CITED).length,
        spanDigest: createHash('sha256').update(points.slice(start, start + Array.from(CITED).length).join('')).digest('hex'),
      }],
      scope: { kind: 'visible_window', startCodePoint: 0, endCodePoint: points.length },
    }];
    const r = await encounter('m', 'mem', inside);
    expect(r.ok && r.notices).toHaveLength(1);
  });
});

describe('S6 · a notice that cannot say what it was shown says nothing', () => {
  const base = (scope: unknown) => {
    const points = Array.from(TEXT);
    const start = TEXT.indexOf(CITED);
    return {
      family: 'recurrence',
      text: 'Water recurs at thresholds.',
      anchors: [{
        startCodePoint: start,
        endCodePoint: start + Array.from(CITED).length,
        spanDigest: createHash('sha256').update(points.slice(start, start + Array.from(CITED).length).join('')).digest('hex'),
      }],
      scope,
    };
  };

  it.each([
    ['no scope at all', undefined],
    ['a kind this act has not constituted', { kind: 'whole_work', startCodePoint: 0, endCodePoint: 77 }],
    ['an inverted range', { kind: 'visible_window', startCodePoint: 50, endCodePoint: 10 }],
    ['a negative start', { kind: 'visible_window', startCodePoint: -1, endCodePoint: 77 }],
    ['a non-integer bound', { kind: 'visible_window', startCodePoint: 0, endCodePoint: 12.5 }],
  ])('⛔ %s is dropped, not defaulted and not thrown on', async (_label, scope) => {
    (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'd', content: TEXT, version: '1' }] });
    const gen: NoticeGenerator = async () => [base(scope) as never];
    const r = await encounter('m', 'mem', gen);
    /* Fails closed toward silence, exactly like the vocabulary screen. */
    expect(r).toMatchObject({ ok: true, notices: [] });
  });
});

describe('S7 · the prompt asks; the scope is what enforces', () => {
  it('the contract instructs bounded non-return', () => {
    expect(ENCOUNTER_SYSTEM).toMatch(/Every assertion concerns ONLY the continuous stretch shown in this call/);
    expect(ENCOUNTER_SYSTEM).toMatch(/does not recur later/);
    expect(ENCOUNTER_SYSTEM).toMatch(/name the bound/);
  });

  it('⭐ but an assertion that IGNORES the instruction still carries its true scope', () => {
    /* The exact F-2 wording, from a call shown one window. The system does not
       screen it — that is the honest limit — but the record can no longer be
       read as whole-Work authority, because the scope says otherwise. */
    const long = longText(600);
    const w = traverseWhole(long).windows[1];
    const sentence = (i: number) => `Sentence ${i} sits here with a number of its own.`;
    let own = '';
    for (let i = 0; i < 600 && !own; i += 1) {
      const at = long.indexOf(sentence(i));
      if (at >= w.startCodePoint && at + sentence(i).length <= w.endCodePoint) own = sentence(i);
    }
    const parsed = parseNoticeBlocks([
      proposal([own], 'This figure appears here and is not mentioned again in what follows.'),
    ]);
    const bound = bindProposals(long, parsed.ok ? parsed.proposals : [], {
      visibleStart: w.contextStartCodePoint, visibleEnd: w.endCodePoint,
    });
    expect(bound).toHaveLength(1);
    expect(bound[0].scope.endCodePoint).toBeLessThan(Array.from(long).length);
    /* ⛔ Recorded honestly: the wording overreaches and nothing mechanical stops
       it. What changed is that the overreach is now VISIBLE — the notice states
       the field it arose from, so a reader can see the claim exceeds it. That
       residue belongs to the semantic ear, not to a regex. */
  });
});

describe('SC7–SC8 · Encounter requires the guarantee, and still checks anyway', () => {
  it('SC7 the result tool declares provider-enforced schema conformance', () => {
    /* Founder ruling 2026-09-08, after W4: stop asking for schema-invalid
       arguments rather than tolerating them downstream. The requirement is
       neutral seam vocabulary; the adapter owns the mechanism. */
    expect((require('../render').resultTool as { inputSchemaConformance?: string }).inputSchemaConformance)
      .toBe('provider_enforced');
    /* ⛔ and Encounter never names the vendor's term itself. */
    expect(readFileSync(join(REPO, 'lib/manuscript/encounter/render.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')).not.toMatch(/\bstrict\b/);
  });

  it('⛔ SC8 the parser is NOT relaxed — the exact Window 4 shape still refuses', () => {
    /* The failure that opened this amendment: `notices` arrived as a JSON string
       instead of an array. Provider enforcement should make it ungeneratable —
       which is not the same as making it acceptable. A guarantee we did not
       compute is a guarantee taken on trust, and this is the instrument that
       would still catch it if enforcement silently stopped working. */
    const w4 = '[{"family": "preoccupation", "assertion": "x", "evidence": [{"excerpt": "y"}]}]';
    expect(parseNoticeBlocks([toolUse({ outcome: 'notices', notices: w4 })]).ok).toBe(false);
  });

  it('⛔ SC8 and every other parser obligation is untouched by the amendment', () => {
    /* Enforcement is upstream. It buys no leniency anywhere downstream of it. */
    for (const rogue of [
      { outcome: 'notices', notices: '{}' },
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: '[]' }] },
      { outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: CITED }], strict: true }] },
    ]) {
      expect(parseNoticeBlocks([toolUse(rogue)]).ok).toBe(false);
    }
    /* And the lawful shape still parses, so this is a scalpel and not a wall. */
    expect(parseNoticeBlocks([proposal([CITED])]).ok).toBe(true);
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

  it('⛔ inconsistent outcomes refuse', () => {
    expect(parseNoticeBlocks([toolUse({ outcome: 'none', notices: [] })]).ok).toBe(false);
    expect(parseNoticeBlocks([toolUse({ outcome: 'notices', notices: [] })]).ok).toBe(false);
    expect(parseNoticeBlocks([toolUse({ outcome: 'maybe' })]).ok).toBe(false);
  });

  it('⛔ an empty or absent excerpt refuses rather than binding to nothing', () => {
    expect(parseNoticeBlocks([toolUse({ outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [{ excerpt: '' }] }] })]).ok).toBe(false);
    expect(parseNoticeBlocks([toolUse({ outcome: 'notices', notices: [{ family: 'recurrence', assertion: 'x', evidence: [] }] })]).ok).toBe(false);
    expect(parseNoticeBlocks([toolUse({ outcome: 'notices', notices: [{ family: 'recurrence', assertion: '  ', evidence: [{ excerpt: CITED }] }] })]).ok).toBe(false);
  });

  it('the contract requires the tool — prose is not an answer', () => {
    const req = renderWindowRequest(SNAP, traverseWhole(TEXT).windows[0]);
    expect(req.toolChoice).toEqual({ type: 'tool', name: RESULT_TOOL_NAME });
    expect(JSON.stringify(req.tools)).toContain('"additionalProperties":false');
  });
});
