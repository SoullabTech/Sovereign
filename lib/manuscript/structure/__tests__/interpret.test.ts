/**
 * WS2-05B step 2 - the seven acceptance cases, and what the host refuses.
 *
 * The reader is injected, so every outcome is provable without a model. That is
 * the point of making the reading a protocol rather than a call: the shape of
 * an answer can be tested even when the thing producing it cannot be.
 *
 * NOTE ON ELEMENTAL ALCHEMY. There is deliberately no test asserting
 * "Fire = 42-69". Encoding an answer we already know would test the fixture,
 * not the contract, and would quietly become a target to fit. What is tested
 * here is that the protocol can carry each kind of reading, ask for what it
 * needs, and refuse what is malformed.
 */

import {
  interpretStructure, interpretationInputHash, observeSuppliedBodies,
  type ProposedUnit, type ReaderOutput, type StructureReader,
} from '../interpret';
import { gatherEvidence, resetEvidenceIds, type HeadedSection } from '../evidence';

const sections: HeadedSection[] = Array.from({ length: 12 }, (_, i) => ({
  id: `s${i}`, position: i, heading: `HEADING ${'ABCDEFGHIJKL'[i]}`,
}));

beforeEach(() => resetEvidenceIds());
const evidence = () => gatherEvidence('m', sections);

const unit = (from: number, to: number, over: Partial<ProposedUnit> = {}): ProposedUnit => ({
  title: `Unit ${from}`, kind: null,
  fromSectionId: `s${from}`, toSectionId: `s${to}`,
  children: [], rationale: 'because', evidenceRefs: [], uncertainty: [],
  ...over,
});

const reads = (out: ReaderOutput): StructureReader => async () => out;
const noBodies = { fetchBodies: async () => new Map<string, string>() };

const run = (r: StructureReader, opts = {}) =>
  interpretStructure(evidence(), sections, r, { ...noBodies, ...opts });

describe('the seven acceptance cases', () => {
  it('clear nested organization -> stable', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'stable', account: 'Two parts, each holding chapters.',
      units: [unit(0, 5, { children: [unit(0, 2), unit(3, 5)] }), unit(6, 11)],
    } }));
    expect(r.status === 'ok' && r.interpretation.form).toBe('stable');
    expect(r.status === 'ok' && r.interpretation.unaccountedSectionIds).toEqual([]);
  });

  it('flat peer sequence -> flat', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'flat', account: 'A sequence of essays with no larger grouping.',
      units: [unit(0, 3), unit(4, 7), unit(8, 11)],
    } }));
    expect(r.status === 'ok' && r.interpretation.form).toBe('flat');
  });

  it('mixed organizing grammars -> mixed, and siblings may differ in kind', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'mixed', account: 'A part of chapters, then letters and a vignette.',
      units: [
        unit(0, 5, { kind: 'Part', children: [unit(0, 2, { kind: 'Chapter' })] }),
        unit(6, 8, { kind: 'Letter' }),
        unit(9, 11, { kind: 'Vignette' }),
      ],
    } }));
    expect(r.status === 'ok' && r.interpretation.form).toBe('mixed');
    /* Irregular is not malformed. */
    const kinds = r.status === 'ok' && 'units' in r.interpretation
      ? r.interpretation.units.map((u) => u.kind) : [];
    expect(new Set(kinds).size).toBeGreaterThan(1);
  });

  it('clear regions plus unresolved -> partial, and the host derives what is left', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'partial', account: 'The opening reads clearly; the rest does not.',
      units: [unit(0, 3)],
      uncertainRegions: [{ fromSectionId: 's8', toSectionId: 's11', why: 'looks like a contents list' }],
    } }));
    expect(r.status === 'ok' && r.interpretation.form).toBe('partial');
    /* NOT taken from the reader: computed from what the units actually cover. */
    expect(r.status === 'ok' && r.interpretation.unaccountedSectionIds)
      .toEqual(['s4', 's5', 's6', 's7', 's8', 's9', 's10', 's11']);
    expect(r.status === 'ok' && r.interpretation.uncertainRegions).toHaveLength(1);
  });

  it('two defensible readings -> ambiguous, with no winner chosen', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'ambiguous', account: 'Two readings remain plausible.',
      alternatives: [
        { label: 'by movement', units: [unit(0, 5), unit(6, 11)], why: 'a' },
        { label: 'by voice', units: [unit(0, 3), unit(4, 11)], why: 'b' },
      ],
    } }));
    expect(r.status === 'ok' && r.interpretation.form).toBe('ambiguous');
    /* The type has no `units` field at all, so nothing can be rendered as
       "the" structure, and nothing is accounted for. */
    expect(r.status === 'ok' && 'units' in r.interpretation).toBe(false);
    expect(r.status === 'ok' && r.interpretation.unaccountedSectionIds).toHaveLength(12);
  });

  it('nothing stable -> none, with no units field and no synthetic root', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'none', account: 'No stable larger structure is evident yet.',
    } }));
    expect(r.status === 'ok' && r.interpretation.form).toBe('none');
    expect(r.status === 'ok' && 'units' in r.interpretation).toBe(false);
    expect(r.status === 'ok' && 'alternatives' in r.interpretation).toBe(false);
    /* Every section is visibly unexplained rather than swept into a root. */
    expect(r.status === 'ok' && r.interpretation.unaccountedSectionIds).toHaveLength(12);
  });

  it('needs more text -> a typed read request, and the host supplies exactly it', async () => {
    const asked: string[][] = [];
    let pass = 0;
    const reader: StructureReader = async (input) => {
      pass = input.pass;
      if (input.pass === 1) {
        expect(input.bodies.size).toBe(0);
        return { status: 'read-request', sectionIds: ['s3', 's4'], why: 'the boundary is unmarked' };
      }
      /* Exactly what was asked for, and nothing else. */
      expect([...input.bodies.keys()].sort()).toEqual(['s3', 's4']);
      expect(input.previousRequest?.why).toBe('the boundary is unmarked');
      return { status: 'interpreted', reading: {
        form: 'stable', account: 'Resolved once the boundary was read.',
        units: [unit(0, 11)],
      } };
    };
    const r = await interpretStructure(evidence(), sections, reader, {
      fetchBodies: async (ids) => {
        asked.push([...ids]);
        return new Map(ids.map((id) => [id, `body of ${id}`]));
      },
    });
    expect(r.status).toBe('ok');
    expect(pass).toBe(2);
    expect(asked).toEqual([['s3', 's4']]);
    /* Coverage is what the host handed over, not what the reader claimed. */
    expect(r.status === 'ok' && r.interpretation.coverage.bodies)
      .toEqual({ mode: 'selected', sectionIds: ['s3', 's4'] });
    expect(r.status === 'ok' && r.interpretation.coverage.passes).toBe(2);
  });
});

describe('the host refuses a reading it cannot trust', () => {
  it('a section this draft does not hold', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'stable', account: 'a', units: [{ ...unit(0, 1), toSectionId: 'ghost' }],
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('unknown-section');
  });

  it('a range that runs backwards', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'stable', account: 'a', units: [unit(5, 2)],
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('inverted-range');
  });

  it('siblings that overlap', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'stable', account: 'a', units: [unit(0, 5), unit(4, 9)],
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('overlapping-siblings');
  });

  it('a child reaching outside its parent', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'stable', account: 'a', units: [unit(0, 4, { children: [unit(3, 8)] })],
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('child-outside-parent');
  });

  it('a citation to evidence that was never gathered', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'stable', account: 'a', units: [unit(0, 5, { evidenceRefs: ['invented-9'] })],
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('unknown-evidence-ref');
  });

  it('an ambiguous reading carrying only one alternative', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'ambiguous', account: 'a',
      alternatives: [{ label: 'only', units: [unit(0, 5)], why: 'x' }],
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('ambiguous-without-alternatives');
  });

  it('a reading with no account of the Work', async () => {
    const r = await run(reads({ status: 'interpreted', reading: {
      form: 'none', account: '   ',
    } }));
    expect(r.status === 'refused' && r.refusal).toBe('empty-account');
  });

  it('a request for a section that is not in this draft', async () => {
    const r = await run(reads({ status: 'read-request', sectionIds: ['ghost'], why: 'w' }));
    expect(r.status === 'refused' && r.refusal).toBe('unknown-section');
  });

  it('endless asking, rather than fabricating an answer', async () => {
    let calls = 0;
    const r = await interpretStructure(evidence(), sections,
      async () => { calls++; return { status: 'read-request', sectionIds: ['s1'], why: 'more' }; },
      { fetchBodies: async (ids) => new Map(ids.map((id) => [id, 'x'])) });
    expect(r.status === 'refused' && r.refusal).toBe('read-request-exhausted');
    expect(calls).toBe(3);
  });
});

describe('interpretationInputHash', () => {
  const bodies = new Map([['s1', 'the original text']]);

  it('changes when a heading MAIA read changes', () => {
    const edited = sections.map((s) => s.id === 's4' ? { ...s, heading: 'REWRITTEN' } : s);
    expect(interpretationInputHash(sections, bodies))
      .not.toEqual(interpretationInputHash(edited, bodies));
  });

  it('changes when a body MAIA read changes', () => {
    expect(interpretationInputHash(sections, bodies))
      .not.toEqual(interpretationInputHash(sections, new Map([['s1', 'rewritten entirely']])));
  });

  it('is unchanged by prose MAIA never read', () => {
    /* s7 was never supplied, so editing it cannot make this reading stale. */
    expect(interpretationInputHash(sections, bodies))
      .toEqual(interpretationInputHash(sections, new Map([['s1', 'the original text']])));
  });
});

describe('body observations stay evidence', () => {
  it('carry their own limits even though they happened in the interpreter loop', () => {
    const many: HeadedSection[] = Array.from({ length: 14 }, (_, i) => ({
      id: `b${i}`, position: i, heading: 'H',
    }));
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const w = (n: number) => A[n % 26] + A[Math.floor(n / 26) % 26] + A[Math.floor(n / 676) % 26];
    const bodies = new Map(many.map((s, i) => [s.id, `${w(i)} ${w(i + 500)} ${w(i + 1000)}`]));
    const obs = observeSuppliedBodies(many, bodies);
    for (const o of obs) expect(o.doesNotEstablish.length).toBeGreaterThan(0);
  });

  it('produce nothing when too little was read to measure anything', () => {
    expect(observeSuppliedBodies(sections, new Map([['s1', 'one body']]))).toEqual([]);
  });
});
