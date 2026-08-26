import {
  carryFindings,
  lineageOf,
  noLongerObserved,
  planPasses,
  segmentHash,
  type PriorFinding,
  type PriorPass,
} from '../incremental';

const LENSES = ['whole_work', 'threads'] as const;

const seg = (label: string, text: string, start: number) => ({
  label,
  text,
  start,
  end: start + text.length,
});

const CH1 = 'Air is the unseen matrix in which all movement and thought arise.';
const CH2 = 'We do not always notice the air, and yet without it nothing moves.';
const CH3 = 'To work with air is to become conscious of the space life unfolds in.';

describe('segmentHash — identity of text, not of its position', () => {
  it('is stable for the same text', () => {
    expect(segmentHash(CH1)).toBe(segmentHash(CH1));
  });

  it('ignores re-wrapping, which is not a change worth re-reading a chapter for', () => {
    expect(segmentHash('one two\nthree')).toBe(segmentHash('one   two\n\n  three  '));
  });

  it('changes when the words change', () => {
    expect(segmentHash(CH1)).not.toBe(segmentHash(`${CH1} And more.`));
  });
});

describe('planPasses', () => {
  const segments = [seg('One', CH1, 0), seg('Two', CH2, 100), seg('Three', CH3, 200)];

  const priorFor = (segs: typeof segments): PriorPass[] =>
    LENSES.flatMap((lens) =>
      segs.map((s) => ({
        id: `${lens}:${s.label}`,
        lens,
        segmentLabel: s.label,
        segmentHash: segmentHash(s.text),
        status: 'done',
      })),
    );

  it('reads everything on a first review', () => {
    const plan = planPasses(LENSES, segments, []);
    expect(plan.toRead).toBe(6);
    expect(plan.reused).toBe(0);
  });

  it('reads nothing when nothing changed', () => {
    const plan = planPasses(LENSES, segments, priorFor(segments));
    expect(plan.toRead).toBe(0);
    expect(plan.reused).toBe(6);
  });

  it('re-reads ONLY the chapter that changed', () => {
    const edited = [segments[0], seg('Two', `${CH2} A new sentence.`, 100), segments[2]];
    const plan = planPasses(LENSES, edited, priorFor(segments));
    // One segment changed, across both lenses.
    expect(plan.toRead).toBe(2);
    expect(plan.reused).toBe(4);
    expect(plan.passes.filter((p) => p.action === 'read').every((p) => p.segmentLabel === 'Two')).toBe(
      true,
    );
  });

  it('does not invalidate later chapters when an earlier one grows', () => {
    // The insertion pushes every later offset and index along. Matching on
    // position would re-read the whole book.
    const grown = [
      seg('One', `${CH1} Inserted.`, 0),
      seg('Two', CH2, 200),
      seg('Three', CH3, 300),
    ];
    const plan = planPasses(LENSES, grown, priorFor(segments));
    expect(plan.toRead).toBe(2);
    expect(plan.passes.filter((p) => p.action === 'read').every((p) => p.segmentLabel === 'One')).toBe(
      true,
    );
  });

  it('re-reads a pass that failed last time', () => {
    const prior = priorFor(segments).map((p) =>
      p.segmentLabel === 'Two' ? { ...p, status: 'failed' } : p,
    );
    const plan = planPasses(LENSES, segments, prior);
    expect(plan.toRead).toBe(2);
  });

  it('re-reads a lens that is new since the last reading', () => {
    const plan = planPasses([...LENSES, 'continuity'], segments, priorFor(segments));
    expect(plan.toRead).toBe(3);
    expect(plan.passes.filter((p) => p.action === 'read').every((p) => p.lens === 'continuity')).toBe(
      true,
    );
  });

  it('carries the current offsets, not the ones the pass was first read at', () => {
    const moved = [seg('One', CH1, 500)];
    const plan = planPasses(['threads'], moved, priorFor([seg('One', CH1, 0)]));
    expect(plan.passes[0].action).toBe('reuse');
    expect(plan.passes[0].start).toBe(500);
  });
});

describe('carryFindings — offsets are re-located, never carried', () => {
  const prior: PriorFinding[] = [
    { id: 'f1', lens: 'threads', title: 'Air recurs', observation: 'It opens twice.', quotes: [CH1] },
  ];

  it('re-locates a quote in the new snapshot', () => {
    const next = `A new opening paragraph was added.\n\n${CH1}`;
    const { carried, lost } = carryFindings(prior, next);
    expect(lost).toHaveLength(0);
    const ev = carried[0].evidence[0];
    expect(next.slice(ev.start, ev.end)).toBe(CH1);
    expect(ev.start).toBeGreaterThan(0);
  });

  it('reports a finding whose passages are gone rather than dropping it silently', () => {
    const { carried, lost } = carryFindings(prior, 'The book was rewritten entirely.');
    expect(carried).toHaveLength(0);
    expect(lost[0].priorId).toBe('f1');
    expect(lost[0].reason).toContain('no longer in the draft');
  });

  it('keeps the quotes that survived and drops the ones that did not', () => {
    const two: PriorFinding[] = [{ ...prior[0], quotes: [CH1, CH3] }];
    const { carried } = carryFindings(two, CH1);
    expect(carried[0].evidence).toHaveLength(1);
  });

  it('orders re-located evidence by where it now appears', () => {
    const two: PriorFinding[] = [{ ...prior[0], quotes: [CH3, CH1] }];
    const { carried } = carryFindings(two, `${CH1}\n\n${CH3}`);
    expect(carried[0].evidence[0].start).toBeLessThan(carried[0].evidence[1].start);
  });
});

describe('lineageOf — a fact about readings, never about the Work', () => {
  const prior: PriorFinding[] = [
    {
      id: 'f1',
      lens: 'threads',
      title: 'Air recurs',
      observation: 'It opens twice.',
      quotes: [CH1],
    },
  ];

  it('calls an identical observation persists, and names its ancestor', () => {
    expect(
      lineageOf({ lens: 'threads', title: 'Air recurs', observation: 'It opens twice.' }, prior),
    ).toEqual({ lineage: 'persists', ancestorId: 'f1' });
  });

  it('ignores punctuation and casing when comparing', () => {
    expect(
      lineageOf({ lens: 'threads', title: 'air, recurs', observation: 'It opens TWICE!' }, prior)
        .lineage,
    ).toBe('persists');
  });

  it('calls the same finding said differently changed', () => {
    expect(
      lineageOf(
        { lens: 'threads', title: 'Air recurs', observation: 'It opens three times now.' },
        prior,
      ),
    ).toEqual({ lineage: 'changed', ancestorId: 'f1' });
  });

  it('does not match across lenses', () => {
    expect(
      lineageOf({ lens: 'continuity', title: 'Air recurs', observation: 'It opens twice.' }, prior)
        .lineage,
    ).toBe('newly_observed');
  });

  it('calls something with no ancestor newly observed', () => {
    expect(
      lineageOf({ lens: 'threads', title: 'The river is dropped', observation: 'x' }, prior),
    ).toEqual({ lineage: 'newly_observed', ancestorId: null });
  });

  it('never returns a disposition', () => {
    const verdict = lineageOf({ lens: 'threads', title: 'Air recurs', observation: 'x' }, prior);
    expect(['persists', 'changed', 'newly_observed']).toContain(verdict.lineage);
    expect(verdict).not.toHaveProperty('disposition');
  });
});

describe('noLongerObserved — and emphatically not "resolved"', () => {
  const prior: PriorFinding[] = [
    { id: 'f1', lens: 'threads', title: 'Air recurs', observation: 'a', quotes: [] },
    { id: 'f2', lens: 'threads', title: 'The river is dropped', observation: 'b', quotes: [] },
  ];

  it('names what did not come back', () => {
    const now = [{ lens: 'threads', title: 'Air recurs', observation: 'a' }];
    expect(noLongerObserved(prior, now).map((f) => f.id)).toEqual(['f2']);
  });

  it('returns nothing when everything came back', () => {
    const now = prior.map((p) => ({ lens: p.lens, title: p.title, observation: p.observation }));
    expect(noLongerObserved(prior, now)).toEqual([]);
  });

  it('returns findings, not verdicts — the caller may not read this as resolution', () => {
    const gone = noLongerObserved(prior, []);
    expect(gone).toHaveLength(2);
    for (const f of gone) {
      expect(f).not.toHaveProperty('disposition');
      expect(f).not.toHaveProperty('resolved');
    }
  });

  it('a finding seen only under a different lens still counts as not seen', () => {
    const now = [{ lens: 'continuity', title: 'Air recurs', observation: 'a' }];
    expect(noLongerObserved(prior, now).map((f) => f.id)).toEqual(['f1', 'f2']);
  });
});

// ── DE-02A ───────────────────────────────────────────────────────────────

describe('reuse binds to one named prior pass', () => {
  const A = seg('One', CH1, 0);
  const B = seg('Two', CH2, 100);

  const priorPasses = (segs: { label: string; text: string }[]): PriorPass[] =>
    segs.map((sgm, i) => ({
      id: `prior-${i}`,
      lens: 'threads',
      segmentLabel: sgm.label,
      segmentHash: segmentHash(sgm.text),
      status: 'done',
    }));

  it('names the exact prior pass a reused pass continues', () => {
    const plan = planPasses(['threads'], [A, B], priorPasses([A, B]));
    expect(plan.passes.map((p) => p.supersedesPassId)).toEqual(['prior-0', 'prior-1']);
    expect(plan.passes.every((p) => p.action === 'reuse')).toBe(true);
  });

  it('consumes a prior pass at most ONCE across identical segments', () => {
    // A Work that repeats a section verbatim. Without one-to-one both current
    // passes would carry the same findings, and the copy would look like
    // corroboration.
    const twin = seg('Two', CH1, 100);
    const plan = planPasses(['threads'], [A, twin], priorPasses([A]));
    const consumed = plan.passes.map((p) => p.supersedesPassId).filter(Boolean);
    expect(consumed).toEqual(['prior-0']);
    expect(new Set(consumed).size).toBe(consumed.length);
    expect(plan.reused).toBe(1);
    expect(plan.toRead).toBe(1);
  });

  it('prefers the prior pass with the same label when two share a hash', () => {
    const twin = seg('Two', CH1, 100);
    const plan = planPasses(['threads'], [twin], priorPasses([A, twin]));
    expect(plan.passes[0].supersedesPassId).toBe('prior-1');
  });

  it('names the prior pass for a CHANGED part too, so lineage survives an edit', () => {
    const edited = seg('One', `${CH1} A new sentence.`, 0);
    const plan = planPasses(['threads'], [edited], priorPasses([A]));
    expect(plan.passes[0].action).toBe('read');
    // Without this link every finding in an edited chapter would report as
    // newly observed, and a writer could not tell a restatement from news.
    expect(plan.passes[0].supersedesPassId).toBe('prior-0');
  });

  it('names nothing for a part the previous reading did not have', () => {
    const plan = planPasses(['threads'], [seg('Three', CH3, 0)], priorPasses([A]));
    expect(plan.passes[0].supersedesPassId).toBeNull();
    expect(plan.passes[0].action).toBe('read');
  });

  it('never binds across lenses', () => {
    const plan = planPasses(['continuity'], [A], priorPasses([A]));
    expect(plan.passes[0].supersedesPassId).toBeNull();
  });
});

describe('carryFindings preserves what MAIA actually said', () => {
  it('carries why and confidence rather than manufacturing them', () => {
    // No model ran, so she did not newly become "medium confidence".
    const { carried } = carryFindings(
      [
        {
          id: 'f1',
          lens: 'threads',
          title: 'Air recurs',
          observation: 'It opens twice.',
          why: 'Two openings do similar work.',
          confidence: 'high',
          quotes: [CH1],
        },
      ],
      CH1,
    );
    expect(carried[0].why).toBe('Two openings do similar work.');
    expect(carried[0].confidence).toBe('high');
  });

  it('falls back only where the prior reading recorded nothing', () => {
    const { carried } = carryFindings(
      [{ id: 'f1', lens: 'threads', title: 't', observation: 'o', quotes: [CH1] }],
      CH1,
    );
    expect(carried[0].why).toBeNull();
    expect(carried[0].confidence).toBe('medium');
  });
});
