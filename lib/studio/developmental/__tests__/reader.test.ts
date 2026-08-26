import {
  buildReaderPrompt,
  checkpointsFor,
  phenomenonById,
  PREFIX_BUDGET_CHARS,
  preparePrefix,
  prefixFor,
  READER_PHENOMENA,
  UNPARTED_CHECKPOINTS,
  validateReaderFindings,
} from '../reader';

const EARLY = 'Maya arrives at the river without knowing why she has come.';
const LATE = 'Aether is the field in which the other four elements are held together.';
const WORK = `${EARLY}\n\n${'ordinary prose. '.repeat(20)}\n\n${LATE}`;
const CHECKPOINT_EARLY = { label: 'through Chapter One', offset: WORK.indexOf(LATE), index: 0 };

describe('the five phenomena', () => {
  it('offers exactly the five READER-01 was bounded to', () => {
    expect(READER_PHENOMENA.map((p) => p.id)).toEqual([
      'knowledge',
      'referents',
      'dependencies',
      'promises',
      'openness',
    ]);
  });

  it('has no phenomenon that asks how a reader feels', () => {
    for (const p of READER_PHENOMENA) {
      expect(`${p.ask} ${p.blurb}`).not.toMatch(
        /\b(bored|engaged|invested|hooked|drop-?off|interest)\b/i,
      );
    }
  });

  it('says plainly that an open promise is not automatically a defect', () => {
    expect(phenomenonById('promises')!.ask).toContain('NOT automatically a defect');
  });

  it('does not resolve a phenomenon it does not offer', () => {
    expect(phenomenonById('engagement')).toBeNull();
    expect(phenomenonById('first_time_reader')).toBeNull();
  });
});

describe('checkpoints — position without asserting structure', () => {
  const parts = [
    { label: 'Chapter One', start: 0, end: 100 },
    { label: 'Chapter Two', start: 100, end: 250 },
  ];

  it('lands on the parts the member carried in', () => {
    const points = checkpointsFor(250, parts);
    expect(points.map((c) => c.label)).toEqual(['through Chapter One', 'through Chapter Two']);
    expect(points.map((c) => c.offset)).toEqual([100, 250]);
  });

  it('never invents a movement or act for an unparted draft', () => {
    const points = checkpointsFor(4000, []);
    expect(points).toHaveLength(UNPARTED_CHECKPOINTS);
    for (const c of points) {
      expect(c.label).toContain('% of the draft');
      expect(c.label).not.toMatch(/movement|act|part/i);
    }
  });

  it('never runs past the end of the Work', () => {
    for (const c of checkpointsFor(4000, [])) expect(c.offset).toBeLessThanOrEqual(4000);
    for (const c of checkpointsFor(120, parts)) expect(c.offset).toBeLessThanOrEqual(120);
  });

  it('has nothing to check in an empty Work', () => {
    expect(checkpointsFor(0, [])).toEqual([]);
  });
});

describe('the prefix — Law 2, enforced by what MAIA is given', () => {
  it('contains everything up to the checkpoint and nothing after it', () => {
    const prefix = prefixFor(WORK, CHECKPOINT_EARLY);
    expect(prefix).toContain(EARLY);
    expect(prefix).not.toContain(LATE);
  });

  it('passes a short prefix through whole', () => {
    const p = preparePrefix(WORK, CHECKPOINT_EARLY);
    expect(p.elided).toBe(false);
    expect(p.text).toBe(prefixFor(WORK, CHECKPOINT_EARLY));
  });

  it('elides the middle of a very long prefix, and says so', () => {
    const long = `${EARLY}${'x'.repeat(PREFIX_BUDGET_CHARS * 2)}${LATE}`;
    const p = preparePrefix(long, { label: 'l', offset: long.length, index: 0 });
    expect(p.elided).toBe(true);
    expect(p.text).toContain('you have not been shown');
    expect(p.text).toContain(EARLY);
    expect(p.text).toContain(LATE);
  });
});

describe('validateReaderFindings — a passage after the checkpoint is not evidence', () => {
  const prefix = prefixFor(WORK, CHECKPOINT_EARLY);
  const good = {
    title: 'The river is unexplained',
    observation: 'The Work names the river before establishing what it is.',
    quotes: [EARLY],
  };

  it('keeps a finding evidenced from what the reader has read', () => {
    const { findings } = validateReaderFindings([good], prefix, 'referents');
    expect(findings).toHaveLength(1);
    expect(findings[0].phenomenon).toBe('referents');
  });

  it('DROPS a finding evidenced from text after the checkpoint', () => {
    // The strongest form of Law 2: page 180 cannot excuse page 40, and it
    // cannot evidence page 40 either.
    const { findings, dropped } = validateReaderFindings(
      [{ ...good, quotes: [LATE] }],
      prefix,
      'referents',
    );
    expect(findings).toHaveLength(0);
    expect(dropped[0].reason).toContain('what the reader has read');
  });

  it('DROPS a finding that asserts how a reader feels', () => {
    const { findings, dropped } = validateReaderFindings(
      [{ ...good, observation: 'The reader feels confused by this opening.' }],
      prefix,
      'referents',
    );
    expect(findings).toHaveLength(0);
    expect(dropped[0].reason).toContain('asserts a reader state');
  });

  it('catches the other phrasings of the same claim', () => {
    for (const observation of [
      'A reader will feel lost here.',
      'the reader would feel overwhelmed by the density',
      'Readers become disoriented at this point.',
    ]) {
      const { findings } = validateReaderFindings(
        [{ ...good, observation }],
        prefix,
        'referents',
      );
      expect(findings).toHaveLength(0);
    }
  });

  it('does not refuse a Work whose own characters feel things', () => {
    const { findings } = validateReaderFindings(
      [
        {
          ...good,
          observation: 'Maya is described as lost, but the Work has not said what she lost.',
        },
      ],
      prefix,
      'referents',
    );
    expect(findings).toHaveLength(1);
  });

  it('does not refuse an observation about what the text supplied', () => {
    const { findings } = validateReaderFindings(
      [{ ...good, observation: 'The text has not yet supplied what the river is.' }],
      prefix,
      'referents',
    );
    expect(findings).toHaveLength(1);
  });

  it('returns offsets into the WHOLE Work, not into the prefix', () => {
    const start = 1000;
    const { findings } = validateReaderFindings([good], prefix, 'referents', start);
    expect(findings[0].evidence[0].start).toBe(prefix.indexOf(EARLY) + start);
  });

  it('carries the only-in-material flag only when asked for', () => {
    expect(validateReaderFindings([good], prefix, 'knowledge').findings[0].onlyInMaterial).toBe(
      false,
    );
    expect(
      validateReaderFindings([{ ...good, onlyInMaterial: true }], prefix, 'knowledge').findings[0]
        .onlyInMaterial,
    ).toBe(true);
  });

  it('drops a finding with nothing to point at', () => {
    expect(validateReaderFindings([{ ...good, quotes: [] }], prefix, 'knowledge').findings).toEqual(
      [],
    );
  });

  it('returns nothing for a non-list answer rather than throwing', () => {
    expect(validateReaderFindings(null, prefix, 'knowledge').findings).toEqual([]);
  });
});

describe('the prompt', () => {
  const base = {
    phenomenon: 'dependencies',
    checkpointLabel: 'through Chapter One',
    workTitle: 'Elemental Alchemy',
    declaredForm: null,
    elided: false,
    materials: [],
  };
  const prompt = buildReaderPrompt(base);

  it('forbids claims about how a reader feels', () => {
    expect(prompt).toContain('never say a reader feels');
    expect(prompt).toContain('Any claim about a reader');
  });

  it('states that later text cannot rescue earlier text', () => {
    expect(prompt).toContain('cannot make its opening clear');
    expect(prompt).toContain('That suspicion is not knowledge you have');
  });

  it('forbids scores and advice', () => {
    expect(prompt).toContain('A score, a rating, a percentage');
    expect(prompt).toContain('You are noticing, not correcting');
  });

  it('holds the structure boundary', () => {
    expect(prompt).toContain('by this point in the draft');
    expect(prompt).toContain('unless the writer declared movements');
  });

  it('says where the reader stands', () => {
    expect(prompt).toContain('through Chapter One');
  });

  it('allows an empty answer and calls it a good one', () => {
    expect(prompt).toContain('That is a real answer and a good one');
  });

  it('warns MAIA off false absences when the prefix was elided', () => {
    const p = buildReaderPrompt({ ...base, elided: true });
    expect(p).toContain('Do not report something as unavailable');
    expect(p).toContain('say you cannot tell');
  });
});

describe('material is never secret reader knowledge — the hard boundary', () => {
  const withMaterial = buildReaderPrompt({
    phenomenon: 'dependencies',
    checkpointLabel: 'through Chapter One',
    workTitle: null,
    declaredForm: null,
    elided: false,
    materials: [
      { kind: 'transcript', label: 'Larry interview', excerpt: 'the river is where she was told' },
    ],
  });

  it('says outright that the reader does not have it', () => {
    expect(withMaterial).toContain('THE READER DOES NOT HAVE THIS');
  });

  it('names the one purpose it is there for', () => {
    expect(withMaterial).toContain('makes something clear that the DRAFT has not yet made available');
  });

  it('forbids quoting material as evidence', () => {
    expect(withMaterial).toContain('never quote it as evidence');
  });

  it('frames only-in-material as a statement about the draft, not the reader', () => {
    expect(withMaterial).toContain('a statement about the draft, not about the reader');
  });

  it('says nothing about material when none was declared', () => {
    const none = buildReaderPrompt({
      phenomenon: 'knowledge',
      checkpointLabel: 'x',
      workTitle: null,
      declaredForm: null,
      elided: false,
      materials: [],
    });
    expect(none).not.toContain('SURROUNDING MATERIAL');
  });
});
