/**
 * WS2-05B-5½ — the reader's boundary, provable without a key.
 *
 * Two things are testable offline and both are load-bearing:
 *
 *   WHAT LEAVES THE MACHINE. `buildRequest` is pure, so "no prose on pass 1"
 *   and "exactly the bodies the host supplied, and no others" are assertions
 *   rather than intentions written in a comment.
 *
 *   WHAT COMES BACK. `parseReaderOutput` is the model boundary. A model is not
 *   a TypeScript caller; everything it returns is checked, and a malformed
 *   answer raises rather than becoming a finding.
 *
 * What is NOT testable here is whether the reading is any good. That is 05B-8,
 * and it needs a person and a real book.
 */

import {
  buildRequest, parseReaderOutput, renderObservation, boundedFetcher,
  StructureReaderError, readerTools, READER_SYSTEM,
  promptContractHash, createMaiaStructureReader, READER_VERSION,
} from '../maiaReader';
import { gatherEvidence } from '../evidence';
import { interpretStructure, type ReaderInput } from '../interpret';
import { DEFAULT_READ_SCOPE } from '../readScope';
import type { HeadedSection } from '../evidence';

const sections: HeadedSection[] = [
  { id: 'sec-a', position: 0, heading: 'CHAPTER ONE' },
  { id: 'sec-b', position: 1, heading: 'CHAPTER TWO' },
  { id: 'sec-c', position: 2, heading: 'CHAPTER THREE' },
  { id: 'sec-d', position: 3, heading: null },
];

const input = (over: Partial<ReaderInput> = {}): ReaderInput => ({
  pass: 1,
  evidence: gatherEvidence('m1', sections),
  sections,
  bodies: new Map(),
  ...over,
});

/* ── what leaves the machine ─────────────────────────────────────────────── */

describe('the request carries only what the host decided to send', () => {
  it('sends headings and ids, never positions alone', () => {
    const text = buildRequest(input());
    expect(text).toContain('sec-a');
    expect(text).toContain('CHAPTER ONE');
    expect(text).toContain('(no heading)');
  });

  /* THE PRIVACY INVARIANT. Pass 1 is headings + mechanics. A member's prose has
     not left their machine at this point and must not. */
  it('sends NO body on pass 1', () => {
    const text = buildRequest(input());
    expect(text).not.toContain('SECTIONS YOU REQUESTED');
    expect(text).not.toContain('The unmistakable body text of section A.');
  });

  it('sends exactly the bodies supplied, and no others', () => {
    const text = buildRequest(input({
      pass: 2,
      bodies: new Map([['sec-b', 'BODY-OF-B']]),
      previousRequest: { sectionIds: ['sec-b'], why: 'the turn at two' },
    }));
    expect(text).toContain('BODY-OF-B');
    expect(text).toContain('the turn at two');
    expect(text).toContain('SECTIONS YOU REQUESTED, IN FULL (1)');
    expect(text).not.toContain('BODY-OF-A');
  });

  it('carries each observation with what it does not establish', () => {
    const text = buildRequest(input());
    expect(text).toContain('DOES NOT ESTABLISH');
    const [first] = gatherEvidence('m1', sections).observations;
    expect(renderObservation(first)).toContain('DOES NOT ESTABLISH');
  });

  /* An empty scan is information, not an absence to paper over. */
  it('says so plainly when the mechanics found nothing', () => {
    const bare: HeadedSection[] = [{ id: 'x', position: 0, heading: 'A quiet morning' }];
    const text = buildRequest({ pass: 1, evidence: gatherEvidence('m1', bare),
      sections: bare, bodies: new Map() });
    expect(text).toContain('None. The deterministic scan found nothing');
  });

  it('narrows a fetcher to exactly the ids requested', async () => {
    const greedy = async () => new Map([['sec-a', 'A'], ['sec-b', 'B'], ['sec-c', 'C']]);
    const got = await boundedFetcher(greedy)(['sec-b']);
    expect([...got.keys()]).toEqual(['sec-b']);
  });
});

describe('the prompt keeps all six answers available', () => {
  it('names none as a complete answer rather than a failure', () => {
    expect(READER_SYSTEM).toContain('"none" is a COMPLETE ANSWER');
  });

  it('offers exactly two tools, and a form enum of exactly six', () => {
    const tools = readerTools();
    expect(tools.map((t) => t.name)).toEqual(['propose_structure', 'request_sections']);
    const form = (tools[0].input_schema as { properties: Record<string, { enum?: string[] }> })
      .properties.form;
    expect(form.enum).toEqual(['stable', 'partial', 'flat', 'mixed', 'ambiguous', 'none']);
  });
});

/* ── what comes back ─────────────────────────────────────────────────────── */

const unit = (from: string, to: string, over: Record<string, unknown> = {}) => ({
  title: 'One', kind: 'Chapter', fromSectionId: from, toSectionId: to,
  rationale: 'it holds', evidenceRefs: [], uncertainty: [], ...over,
});

describe('parsing a reading', () => {
  it('takes a tree-bearing form', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'stable', account: 'Two movements.', units: [unit('sec-a', 'sec-b')],
    });
    expect(out.status).toBe('interpreted');
    if (out.status === 'interpreted' && 'units' in out.reading) {
      expect(out.reading.units[0].fromSectionId).toBe('sec-a');
      expect(out.reading.units[0].children).toEqual([]);
    }
  });

  it('takes none with no units field at all', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'none', account: 'It reads as one continuous body.',
    });
    expect(out.status).toBe('interpreted');
    if (out.status === 'interpreted') {
      expect(out.reading.form).toBe('none');
      expect('units' in out.reading).toBe(false);
    }
  });

  it('takes ambiguous with its alternatives', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'ambiguous', account: 'Two readings hold.',
      alternatives: [
        { label: 'by movement', why: 'turns at two', units: [unit('sec-a', 'sec-b')] },
        { label: 'by voice', why: 'address changes', units: [unit('sec-a', 'sec-c')] },
      ],
    });
    if (out.status === 'interpreted' && out.reading.form === 'ambiguous') {
      expect(out.reading.alternatives).toHaveLength(2);
    } else { throw new Error('expected an ambiguous reading'); }
  });

  it('reads nested children', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'mixed', account: 'A part holding chapters.',
      units: [unit('sec-a', 'sec-c', {
        kind: 'Part', children: [unit('sec-a', 'sec-b'), unit('sec-c', 'sec-c')],
      })],
    });
    if (out.status === 'interpreted' && 'units' in out.reading) {
      expect(out.reading.units[0].children).toHaveLength(2);
    } else { throw new Error('expected units'); }
  });

  it('keeps the uncertainty tags a reading actually gave', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'flat', account: 'Essays.',
      units: [unit('sec-a', 'sec-b', { uncertainty: ['start-boundary', 'kind'] })],
    });
    if (out.status === 'interpreted' && 'units' in out.reading) {
      expect(out.reading.units[0].uncertainty).toEqual(['start-boundary', 'kind']);
    } else { throw new Error('expected units'); }
  });

  it('takes a read request', () => {
    const out = parseReaderOutput('request_sections',
      { sectionIds: ['sec-b', 'sec-c'], why: 'the boundary could sit either side' });
    expect(out).toEqual({ status: 'read-request', sectionIds: ['sec-b', 'sec-c'],
      why: 'the boundary could sit either side' });
  });
});

describe('a malformed answer raises rather than becoming a finding', () => {
  const bad = (tool: string, v: unknown) => {
    try { parseReaderOutput(tool, v); } catch (e) {
      if (e instanceof StructureReaderError) return e.reason;
      throw e;
    }
    throw new Error('expected a StructureReaderError');
  };

  /* THE ONE THAT MATTERS MOST. A form that claims a tree and carries none is a
     machine fault. Rewriting it to `none` would publish "no structure is
     evident" under MAIA's name for a Work she never finished reading. */
  it('refuses a tree-bearing form with no tree, rather than downgrading it to none', () => {
    expect(bad('propose_structure', { form: 'stable', account: 'a', units: [] }))
      .toBe('form-claims-units-but-has-none');
    expect(bad('propose_structure', { form: 'partial', account: 'a' }))
      .toBe('form-claims-units-but-has-none');
  });

  it('refuses an empty account', () => {
    expect(bad('propose_structure', { form: 'none', account: '   ' }))
      .toBe('reading-missing-account');
  });

  it('refuses a form nobody defined', () => {
    expect(bad('propose_structure', { form: 'chapters', account: 'a' })).toBe('unknown-form');
  });

  it('refuses ambiguous with fewer than two readings', () => {
    expect(bad('propose_structure', { form: 'ambiguous', account: 'a',
      alternatives: [{ label: 'one', why: 'w', units: [unit('sec-a', 'sec-b')] }] }))
      .toBe('ambiguous-without-alternatives');
  });

  it('refuses a unit with no range', () => {
    expect(bad('propose_structure', { form: 'flat', account: 'a', units: [{ title: 'x' }] }))
      .toBe('unit-missing-range');
  });

  it('refuses a request for nothing, or with no reason', () => {
    expect(bad('request_sections', { sectionIds: [], why: 'w' })).toBe('request-asks-for-nothing');
    expect(bad('request_sections', { sectionIds: ['sec-a'], why: '' }))
      .toBe('request-missing-why');
  });

  it('refuses a tool it does not implement', () => {
    expect(bad('author_structure', { anything: true })).toBe('unknown-tool');
  });
});

/* ── variant-incompatible fields fail closed ─────────────────────────────── */

describe('a field that does not belong to the variant is a refusal', () => {
  const bad = (v: unknown) => {
    try { parseReaderOutput('propose_structure', v); } catch (e) {
      if (e instanceof StructureReaderError) return e.reason;
      throw e;
    }
    throw new Error('expected a StructureReaderError');
  };

  /**
   * THE FALSIFIER.
   *
   * `none` has no `units` field in the type, so a shape that cannot hold a tree
   * cannot be filled with one. The first parser discarded the units and returned
   * a clean `none` - handing the member "no structure is evident" from a model
   * that had just proposed some, and reopening by hand the contradiction the
   * type design had closed.
   */
  it('refuses none carrying units, and never publishes it as a none finding', () => {
    expect(bad({
      form: 'none', account: 'No stable larger structure is evident yet.',
      units: [unit('sec-a', 'sec-b')],
    })).toBe('form-carries-a-field-it-cannot-have');
  });

  it('refuses none carrying alternatives', () => {
    expect(bad({ form: 'none', account: 'a', alternatives: [] }))
      .toBe('form-carries-a-field-it-cannot-have');
  });

  it('refuses ambiguous carrying a canonical tree', () => {
    expect(bad({
      form: 'ambiguous', account: 'a', units: [unit('sec-a', 'sec-b')],
      alternatives: [
        { label: 'x', why: 'w', units: [unit('sec-a', 'sec-a')] },
        { label: 'y', why: 'w', units: [unit('sec-b', 'sec-b')] },
      ],
    })).toBe('form-carries-a-field-it-cannot-have');
  });

  it('refuses a tree-bearing form carrying alternatives', () => {
    expect(bad({ form: 'stable', account: 'a', units: [unit('sec-a', 'sec-b')],
      alternatives: [] })).toBe('form-carries-a-field-it-cannot-have');
  });
});

describe('malformed detail is refused, not quietly tidied', () => {
  const bad = (v: unknown) => {
    try { parseReaderOutput('propose_structure', v); } catch (e) {
      if (e instanceof StructureReaderError) return e.reason;
      throw e;
    }
    throw new Error('expected a StructureReaderError');
  };
  const flat = (over: Record<string, unknown>) =>
    ({ form: 'flat', account: 'a', units: [unit('sec-a', 'sec-b', over)] });

  /* Dropping an unrenderable caveat silently UPGRADES the reading's confidence.
     The member would meet a division presented as more settled than MAIA left
     it, with nothing on screen to say a limit had been lost. */
  it('refuses an uncertainty tag outside the closed set', () => {
    expect(bad(flat({ uncertainty: ['start-boundary', 'vibes'] })))
      .toBe('unit-unknown-uncertainty');
    expect(bad(flat({ uncertainty: 'start-boundary' }))).toBe('unit-bad-uncertainty');
  });

  it('refuses a rationale that is not text', () => {
    expect(bad(flat({ rationale: { because: true } }))).toBe('unit-bad-rationale');
  });

  it('refuses evidence refs that are not ids', () => {
    expect(bad(flat({ evidenceRefs: [1, 2] }))).toBe('unit-bad-evidence-refs');
  });

  it('refuses a malformed uncertain region rather than dropping it', () => {
    expect(bad({ form: 'none', account: 'a',
      uncertainRegions: [{ fromSectionId: 'sec-a', why: 'no end given' }] }))
      .toBe('region-incomplete');
    expect(bad({ form: 'none', account: 'a', uncertainRegions: 'later' }))
      .toBe('regions-not-an-array');
  });

  it('still treats an absent optional field as absent', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'flat', account: 'a',
      units: [{ title: null, kind: null, fromSectionId: 'sec-a', toSectionId: 'sec-b' }],
    });
    if (out.status === 'interpreted' && 'units' in out.reading) {
      expect(out.reading.units[0]).toMatchObject({
        rationale: '', evidenceRefs: [], uncertainty: [], children: [] });
    } else { throw new Error('expected units'); }
  });
});

/* ── provenance ──────────────────────────────────────────────────────────── */

describe('the reader carries its own attribution', () => {
  it('reports the model it will actually send, not the default name', () => {
    const m = createMaiaStructureReader({ model: 'claude-opus-5-pinned-for-this-test' });
    expect(m.provenance).toMatchObject({
      provider: 'anthropic',
      model: 'claude-opus-5-pinned-for-this-test',
      readerVersion: READER_VERSION,
    });
    expect(m.provenance.promptHash).toMatch(/^[0-9a-f]{64}$/);
    /* Bound to the reader, so the two cannot drift apart. */
    expect(typeof m.read).toBe('function');
  });

  /* The schema is half the instruction: changing the form enum or a field
     description changes what MAIA can say as surely as editing the prose, and a
     hash of the prompt alone would report two different readers as identical. */
  it('hashes the tool contract as well as the prompt', () => {
    const withContract = promptContractHash();
    const promptOnly = require('crypto').createHash('sha256')
      .update(READER_SYSTEM, 'utf8').digest('hex');
    expect(withContract).not.toBe(promptOnly);
    expect(withContract).toBe(promptContractHash());
  });

  it('does not carry the prompt itself into what gets stored', () => {
    const m = createMaiaStructureReader();
    expect(JSON.stringify(m.provenance)).not.toContain('You are reading');
  });
});

/* ── composition: a simulated model through the real host loop ───────────── */

describe('a reading reaches the host loop the same way a real one will', () => {
  /* The model is stubbed; parseReaderOutput and interpretStructure are the real
     ones. This is the seam 5½ closes, exercised end to end without a key. */
  const readerFrom = (turns: { tool: string; input: unknown }[]) => {
    let i = 0;
    return async (_in: ReaderInput) => {
      const t = turns[Math.min(i++, turns.length - 1)];
      return parseReaderOutput(t.tool, t.input);
    };
  };

  it('completes a headings-only reading in one pass', async () => {
    const r = await interpretStructure(
      gatherEvidence('m1', sections), sections,
      readerFrom([{ tool: 'propose_structure', input: {
        form: 'partial', account: 'The first three organise; the last does not.',
        units: [unit('sec-a', 'sec-c', { kind: 'Part' })],
      } }]),
      { fetchBodies: async () => new Map() });

    expect(r.status).toBe('ok');
    if (r.status !== 'ok') return;
    expect(r.interpretation.form).toBe('partial');
    /* Derived by the host. The reader never says what it failed to explain. */
    expect(r.interpretation.unaccountedSectionIds).toEqual(['sec-d']);
    expect(r.interpretation.coverage.bodies.mode).toBe('none');
    if ('units' in r.interpretation) expect(r.interpretation.units[0].id).toBe('p1');
  });

  it('asks for bodies, gets exactly those, and records them as coverage', async () => {
    const asked: string[][] = [];
    const r = await interpretStructure(
      gatherEvidence('m1', sections), sections,
      readerFrom([
        { tool: 'request_sections', input: { sectionIds: ['sec-d'], why: 'is it writing?' } },
        { tool: 'propose_structure', input: {
          form: 'none', account: 'No stable larger structure is evident yet.' } },
      ]),
      { fetchBodies: async (ids) => { asked.push([...ids]); return new Map([['sec-d', 'x']]); } });

    expect(asked).toEqual([['sec-d']]);
    if (r.status !== 'ok') throw new Error(`refused: ${r.refusal}`);
    expect(r.interpretation.form).toBe('none');
    expect(r.interpretation.coverage.bodies.sectionIds).toEqual(['sec-d']);
    expect(r.interpretation.unaccountedSectionIds).toHaveLength(sections.length);
  });

  /* The host already refused this; 5½ does not get to weaken it by supplying a
     reader that asks for sections the Work does not hold. */
  it('is refused by the host when it names a section this draft has not got', async () => {
    const r = await interpretStructure(
      gatherEvidence('m1', sections), sections,
      readerFrom([{ tool: 'request_sections',
        input: { sectionIds: ['sec-zzz'], why: 'curious' } }]),
      { fetchBodies: async () => new Map() });
    expect(r.status).toBe('refused');
    if (r.status === 'refused') expect(r.refusal).toBe('unknown-section');
  });

  it('is refused by the host when a proposed range runs backwards', async () => {
    const r = await interpretStructure(
      gatherEvidence('m1', sections), sections,
      readerFrom([{ tool: 'propose_structure', input: {
        form: 'stable', account: 'backwards', units: [unit('sec-c', 'sec-a')] } }]),
      { fetchBodies: async () => new Map() });
    expect(r.status).toBe('refused');
    if (r.status === 'refused') expect(r.refusal).toBe('inverted-range');
  });
});


/* ── the body-scope ruling, falsified ────────────────────────────────────── */

describe('how much of the Work may leave the machine', () => {
  const many: HeadedSection[] = Array.from({ length: 20 }, (_, i) => ({
    id: `s${i}`, position: i, heading: `H${i}`,
  }));

  /** A reader that keeps asking, so the ceilings are what stop it. */
  const asker = (batches: string[][]) => {
    let i = 0;
    return async (): Promise<Awaited<ReturnType<typeof parseReaderOutput>>> => {
      const ids = batches[Math.min(i++, batches.length - 1)];
      return { status: 'read-request', sectionIds: ids, why: 'settling a boundary' };
    };
  };
  const run = (batches: string[][], body: (id: string) => string, maxPasses: 1 | 2 | 3 = 3) =>
    interpretStructure(gatherEvidence('m', many), many, asker(batches), {
      fetchBodies: async (ids) => new Map(ids.map((id) => [id, body(id)])),
      maxPasses,
    });

  it('is ruled at 4 per request, 8 sections, 60,000 characters', () => {
    expect(DEFAULT_READ_SCOPE).toEqual({
      maxIdsPerRequest: 4, maxSections: 8, maxChars: 60_000 });
  });

  /* Refused WHOLE, not trimmed to the first four: silently returning fewer
     sections than were asked for is the same lie as truncating one. */
  it('refuses a request naming more ids than the per-request ceiling', async () => {
    const r = await run([['s0', 's1', 's2', 's3', 's4']], () => 'x');
    expect(r.status).toBe('refused');
    if (r.status !== 'refused') return;
    expect(r.refusal).toBe('read-scope-exceeded');
    expect(r.scope).toMatchObject({
      requestedIds: ['s0', 's1', 's2', 's3', 's4'],
      alreadySuppliedCount: 0,
      limitSections: 8,
      limitChars: 60_000,
    });
  });

  /**
   * The total-sections ceiling, falsified with a scope small enough to reach it.
   *
   * WHY A CUSTOM SCOPE. Under the ruled policy the ceiling is guarded TWICE and
   * the other guard binds first: three passes allow at most two read requests,
   * four ids each, so eight is the most that can ever be supplied even with the
   * section ceiling removed. That is a pleasant accident of two independent
   * limits agreeing, not a reason to leave the ceiling untested - the pass
   * budget is a property of the loop and could change without anyone thinking
   * about prose. So the mechanism is proven here, and the arithmetic is stated
   * in the test below.
   */
  it('refuses the request that would cross the total-sections ceiling', async () => {
    const r = await interpretStructure(gatherEvidence('m', many), many,
      asker([['s0', 's1', 's2'], ['s3', 's4']]), {
        fetchBodies: async (ids) => new Map(ids.map((id) => [id, 'x'])),
        readScope: { maxIdsPerRequest: 4, maxSections: 4, maxChars: 60_000 },
      });
    expect(r.status).toBe('refused');
    if (r.status !== 'refused') return;
    expect(r.refusal).toBe('read-scope-exceeded');
    /* Three were already in hand and legitimate; the request taking it to five
       is what is refused - whole, not trimmed to the one that would fit. */
    expect(r.scope).toMatchObject({
      alreadySuppliedCount: 3, requestedTotalCount: 5, requestedIds: ['s3', 's4'],
      limitSections: 4 });
  });

  /**
   * And under the RULED policy, the ninth section is refused by the ceiling.
   *
   * The scope checks run before the pass budget, deliberately: "the reading did
   * not settle" and "the reading asked for more than it may have" are different
   * facts, and the pass budget running out must not absorb the second. Two
   * guards do bind at the same number here - three passes allow two requests of
   * four - but the one that speaks is the one about the member's prose.
   */
  it('refuses the ninth section under the ruled policy, by the ceiling', async () => {
    expect(DEFAULT_READ_SCOPE.maxIdsPerRequest * 2).toBe(DEFAULT_READ_SCOPE.maxSections);
    const r = await run([['s0', 's1', 's2', 's3'], ['s4', 's5', 's6', 's7'], ['s8']],
      () => 'x');
    expect(r.status).toBe('refused');
    if (r.status !== 'refused') return;
    expect(r.refusal).toBe('read-scope-exceeded');
    expect(r.scope).toMatchObject({
      alreadySuppliedCount: 8, requestedTotalCount: 9, requestedIds: ['s8'] });
  });

  it('refuses the request that would cross the character ceiling', async () => {
    const big = 'x'.repeat(20_000);
    const r = await run([['s0', 's1', 's2'], ['s3']], () => big);
    expect(r.status).toBe('refused');
    if (r.status !== 'refused') return;
    expect(r.refusal).toBe('read-scope-exceeded');
    expect(r.scope).toMatchObject({
      alreadySuppliedChars: 60_000, prospectiveTotalChars: 80_000, limitChars: 60_000 });
  });

  /* NO TRUNCATION. The prose that would have crossed the ceiling is not stored,
     not shortened, and not partially counted - the whole request is refused. */
  it('never stores a shortened body to fit', async () => {
    const big = 'x'.repeat(70_000);
    const r = await run([['s0']], () => big);
    expect(r.status).toBe('refused');
    if (r.status !== 'refused') return;
    expect(r.scope).toMatchObject({
      alreadySuppliedCount: 0, alreadySuppliedChars: 0, prospectiveTotalChars: 70_000 });
  });

  /* The diagnostic travels into logs. It must not become the leak. */
  it('reports counts and ids only, never a word of the Work', async () => {
    const r = await run([['s0', 's1', 's2', 's3', 's4']], () => 'THE-MEMBERS-PROSE');
    if (r.status !== 'refused') throw new Error('expected a refusal');
    expect(JSON.stringify(r.scope)).not.toContain('THE-MEMBERS-PROSE');
    expect(Object.keys(r.scope ?? {}).sort()).toEqual([
      'alreadySuppliedChars', 'alreadySuppliedCount', 'limitChars', 'limitSections',
      'prospectiveTotalChars', 'requestedIds', 'requestedTotalCount',
    ]);
  });

  it('permits a reading that stays inside every ceiling', async () => {
    let turn = 0;
    const r = await interpretStructure(gatherEvidence('m', many), many, async () => {
      if (turn++ === 0) {
        return { status: 'read-request', sectionIds: ['s0', 's1'], why: 'the turn' };
      }
      return parseReaderOutput('propose_structure', {
        form: 'flat', account: 'A sequence.',
        units: [{ title: null, kind: null, fromSectionId: 's0', toSectionId: 's19' }],
      });
    }, { fetchBodies: async (ids) => new Map(ids.map((id) => [id, 'y'.repeat(100)])) });

    if (r.status !== 'ok') throw new Error(`refused: ${r.refusal}`);
    /* Coverage says WHAT was read and UNDER WHAT POLICY - "two sections" means
       something different under a ceiling of eight than under no ceiling. */
    expect(r.interpretation.coverage.bodies).toEqual({
      mode: 'requested-full',
      sectionIds: ['s0', 's1'],
      totalChars: 200,
      truncated: false,
      sectionLimit: 8,
      charLimit: 60_000,
    });
  });

  it('records a headings-only reading as none, with the ceilings still stated', async () => {
    const r = await interpretStructure(gatherEvidence('m', many), many,
      async () => parseReaderOutput('propose_structure',
        { form: 'none', account: 'Nothing larger is evident.' }),
      { fetchBodies: async () => new Map() });
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(r.interpretation.coverage.bodies).toEqual({
      mode: 'none', sectionIds: [], totalChars: 0, truncated: false,
      sectionLimit: 8, charLimit: 60_000,
    });
  });
});

describe('the prompt states the same ceilings the host enforces', () => {
  it('interpolates them from the one constant', () => {
    expect(READER_SYSTEM).toContain('at most 4 section ids');
    expect(READER_SYSTEM).toContain('at most 8 distinct sections');
    expect(READER_SYSTEM).toContain('at most 60,000 characters');
  });

  it('tells her Materials are not hers to read', () => {
    expect(READER_SYSTEM).toContain('no access to notes, uploads, source material');
  });

  it('caps the request schema at the same number', () => {
    const t = readerTools()[1].input_schema as
      { properties: { sectionIds: { maxItems?: number } } };
    expect(t.properties.sectionIds.maxItems).toBe(DEFAULT_READ_SCOPE.maxIdsPerRequest);
  });
});
