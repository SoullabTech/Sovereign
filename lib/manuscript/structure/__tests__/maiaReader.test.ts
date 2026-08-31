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
} from '../maiaReader';
import { gatherEvidence } from '../evidence';
import { interpretStructure, type ReaderInput } from '../interpret';
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

  /* An invented tag would reach the review surface as a caveat nothing renders,
     and the member would meet a blank where a limit should be. */
  it('drops an uncertainty tag outside the closed set', () => {
    const out = parseReaderOutput('propose_structure', {
      form: 'flat', account: 'Essays.',
      units: [unit('sec-a', 'sec-b', { uncertainty: ['start-boundary', 'vibes', 42] })],
    });
    if (out.status === 'interpreted' && 'units' in out.reading) {
      expect(out.reading.units[0].uncertainty).toEqual(['start-boundary']);
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
