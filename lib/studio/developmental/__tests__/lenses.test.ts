import {
  buildLensPrompt,
  deriveReach,
  FORM_FAMILIES,
  FORM_LENSES,
  formFamily,
  lensesFor,
  materialExcerpt,
  MATERIAL_EXCERPT_CHARS,
  buildOverviewPrompt,
  formGuidance,
  LENSES,
  lensById,
  locateQuote,
  MIN_QUOTE_CHARS,
  parseJsonAnswer,
  segment,
  SEGMENT_TARGET_CHARS,
  validateFindings,
} from '../lenses';

const BOOK = [
  'Air is the unseen matrix in which all movement, communication and thought arise.',
  '',
  'We do not always notice the air. It is the most subtle of the elements, yet without it nothing moves.',
  '',
  'To work with air is to become conscious of the space in which life unfolds.',
].join('\n');

describe('lenses', () => {
  it('offers exactly the five v1 lenses, each with an ask', () => {
    expect(LENSES.map((l) => l.id)).toEqual([
      'whole_work',
      'movement',
      'threads',
      'continuity',
      'reader',
    ]);
    for (const l of LENSES) expect(l.ask.length).toBeGreaterThan(40);
  });

  it('does not resolve a lens it does not offer', () => {
    expect(lensById('three_act')).toBeNull();
  });
});

describe('formGuidance — form sensitivity without imposing a schema', () => {
  it('asks rather than assuming when the writer declared nothing', () => {
    const g = formGuidance(null);
    expect(g).toContain('HAS NOT DECLARED');
    expect(g).toContain('Do not assume');
  });

  it('never introduces beats for a work of philosophy', () => {
    const g = formGuidance('Elemental philosophy');
    expect(g).not.toMatch(/beat|three-act|inciting/i);
    expect(g).toContain('not a narrative');
  });

  it('refuses a beat sheet even for fiction unless asked by name', () => {
    expect(formGuidance('Novel')).toContain('Do NOT check it against a beat sheet');
  });

  it('reads a dissertation as an argument, not a story', () => {
    expect(formGuidance('PhD dissertation')).toContain('argument');
  });

  it('carries an unfamiliar form through in the writer’s own words', () => {
    expect(formGuidance('a grimoire for grief')).toContain('a grimoire for grief');
  });
});

describe('segment', () => {
  it('uses the parts the member carried in as the seams', () => {
    const parts = [
      { label: 'One', start: 0, end: 40 },
      { label: 'Two', start: 40, end: BOOK.length },
    ];
    const segs = segment(BOOK, parts);
    expect(segs.map((s) => s.label)).toEqual(['One', 'Two']);
    expect(segs[0].text).toBe(BOOK.slice(0, 40));
  });

  it('treats an unparted manuscript as one segment', () => {
    expect(segment(BOOK, [])).toHaveLength(1);
  });

  it('labels a split part as a continuation rather than renumbering it', () => {
    const long = 'x'.repeat(SEGMENT_TARGET_CHARS * 2 + 100);
    const segs = segment(long, [{ label: 'Chapter 7', start: 0, end: long.length }]);
    expect(segs.length).toBeGreaterThan(1);
    expect(segs[0].label).toBe('Chapter 7');
    expect(segs[1].label).toContain('continued');
  });

  it('covers the text without gaps or overlaps', () => {
    const long = 'para. '.repeat(8000);
    const segs = segment(long, [{ label: 'All', start: 0, end: long.length }]);
    expect(segs[0].start).toBe(0);
    expect(segs[segs.length - 1].end).toBe(long.length);
    for (let i = 1; i < segs.length; i += 1) expect(segs[i].start).toBe(segs[i - 1].end);
  });
});

describe('locateQuote — the anti-fabrication gate', () => {
  it('finds an exact quote and returns its real offsets', () => {
    const q = 'It is the most subtle of the elements';
    const hit = locateQuote(BOOK, q)!;
    expect(BOOK.slice(hit.start, hit.end)).toBe(q);
  });

  it('tolerates a re-wrapped quote, which is formatting and not fabrication', () => {
    const hit = locateQuote(BOOK, 'Air  is the\n  unseen matrix in which all movement')!;
    expect(hit).not.toBeNull();
    expect(BOOK.slice(hit.start, hit.end)).toContain('unseen matrix');
  });

  it('refuses a paraphrase', () => {
    expect(locateQuote(BOOK, 'Air is the invisible medium through which thought travels')).toBeNull();
  });

  it('refuses a quote short enough to match anywhere', () => {
    expect('the air'.length).toBeLessThan(MIN_QUOTE_CHARS);
    expect(locateQuote(BOOK, 'the air')).toBeNull();
  });

  it('refuses a composite stitched from two places', () => {
    expect(
      locateQuote(BOOK, 'Air is the unseen matrix in which life unfolds without noticing'),
    ).toBeNull();
  });
});

describe('validateFindings', () => {
  const good = {
    title: 'Air is introduced twice',
    observation: 'The element is named as matrix and again as subtlety.',
    why: 'Two openings do similar work.',
    confidence: 'high',
    priority: 'medium',
    quotes: ['Air is the unseen matrix in which all movement, communication and thought arise.'],
  };

  it('keeps a finding whose quote is genuinely in the text', () => {
    const { findings, dropped } = validateFindings([good], BOOK, 'threads');
    expect(findings).toHaveLength(1);
    expect(dropped).toHaveLength(0);
    expect(findings[0].lens).toBe('threads');
    expect(BOOK.slice(findings[0].evidence[0].start, findings[0].evidence[0].end)).toContain(
      'unseen matrix',
    );
  });

  it('DROPS a finding whose quote is not in the text, and says why', () => {
    const { findings, dropped } = validateFindings(
      [{ ...good, quotes: ['Air is the breath of the gods and the mother of speech.'] }],
      BOOK,
      'threads',
    );
    expect(findings).toHaveLength(0);
    expect(dropped[0].reason).toContain('no quote');
  });

  it('drops a finding with no quotes at all', () => {
    const { findings } = validateFindings([{ ...good, quotes: [] }], BOOK, 'threads');
    expect(findings).toHaveLength(0);
  });

  it('drops a finding that says nothing', () => {
    const { dropped } = validateFindings([{ ...good, observation: '  ' }], BOOK, 'threads');
    expect(dropped[0].reason).toBe('no observation');
  });

  it('keeps the locatable quotes and discards the invented ones', () => {
    const { findings } = validateFindings(
      [{ ...good, quotes: ['not in the book at all, invented wholesale', ...good.quotes] }],
      BOOK,
      'threads',
    );
    expect(findings[0].evidence).toHaveLength(1);
  });

  it('counts the same passage cited twice as one piece of evidence', () => {
    const { findings } = validateFindings(
      [{ ...good, quotes: [good.quotes[0], good.quotes[0]] }],
      BOOK,
      'threads',
    );
    expect(findings[0].evidence).toHaveLength(1);
  });

  it('orders evidence by where it appears in the Work', () => {
    const { findings } = validateFindings(
      [
        {
          ...good,
          quotes: [
            'To work with air is to become conscious of the space in which life unfolds.',
            'Air is the unseen matrix in which all movement, communication and thought arise.',
          ],
        },
      ],
      BOOK,
      'threads',
    );
    expect(findings[0].evidence[0].start).toBeLessThan(findings[0].evidence[1].start);
  });

  it('falls back to medium confidence rather than trusting an unknown rank', () => {
    const { findings } = validateFindings(
      [{ ...good, confidence: 'certain', priority: 'urgent' }],
      BOOK,
      'threads',
    );
    expect(findings[0].confidence).toBe('medium');
  });

  it('never carries a priority field through from the model', () => {
    const { findings } = validateFindings([{ ...good, priority: 'urgent' }], BOOK, 'threads');
    expect('priority' in findings[0]).toBe(false);
  });

  it('returns nothing for a non-list answer instead of throwing', () => {
    expect(validateFindings(null, BOOK, 'threads').findings).toEqual([]);
    expect(validateFindings({ findings: [] }, BOOK, 'threads').findings).toEqual([]);
  });
});

describe('prompts', () => {
  const prompt = buildLensPrompt({
    lens: 'movement',
    declaredForm: null,
    workTitle: 'Elemental Alchemy',
    workPurpose: null,
    materials: [],
  });

  it('forbids rewriting and forbids scoring', () => {
    expect(prompt).toContain('will not rewrite');
    expect(prompt).toContain('There is no percentage anywhere');
  });

  it('forbids inventing a quote', () => {
    expect(prompt).toContain('NEVER invent, paraphrase, reconstruct, or compose a quote');
  });

  it('allows an empty answer as legitimate', () => {
    expect(prompt).toContain('"findings":[]');
    expect(prompt).toContain('legitimate answer');
  });

  it('carries the writer’s own name for the Work', () => {
    expect(prompt).toContain('Elemental Alchemy');
  });

  it('the overview asks for prose, not a scoreboard', () => {
    const o = buildOverviewPrompt(null);
    expect(o).toContain('no percentages');
    expect(o).toContain('what you noticed, not what the Work is');
  });
});

describe('parseJsonAnswer', () => {
  it('reads plain JSON', () => {
    expect(parseJsonAnswer('{"findings":[]}')).toEqual({ findings: [] });
  });

  it('reads JSON a model fenced anyway', () => {
    expect(parseJsonAnswer('```json\n{"findings":[]}\n```')).toEqual({ findings: [] });
  });

  it('reads JSON a model wrapped in a sentence', () => {
    expect(parseJsonAnswer('Here you go: {"findings":[]} hope that helps')).toEqual({
      findings: [],
    });
  });

  it('returns null rather than throwing on unreadable output', () => {
    expect(parseJsonAnswer('I could not read the manuscript.')).toBeNull();
  });
});

describe('deriveReach — a fact about evidence, never an importance', () => {
  const PARTS = [
    { label: 'One', start: 0, end: 100 },
    { label: 'Two', start: 100, end: 200 },
    { label: 'Three', start: 200, end: 300 },
    { label: 'Four', start: 300, end: 400 },
  ];
  const at = (start: number) => ({ start, end: start + 30, quote: 'x' });

  it('calls evidence spanning three parts wide', () => {
    const { reach, reachBasis } = deriveReach([at(10), at(110), at(210)], PARTS);
    expect(reach).toBe('wide');
    expect(reachBasis).toBe('3 passages across 3 parts');
  });

  it('calls dense evidence inside one part wide', () => {
    const many = [0, 10, 20, 30, 40, 50].map((n) => at(n));
    expect(deriveReach(many, PARTS).reach).toBe('wide');
  });

  it('calls a single passage in a single part narrow', () => {
    expect(deriveReach([at(10)], PARTS).reach).toBe('narrow');
  });

  it('calls two parts moderate', () => {
    expect(deriveReach([at(10), at(110)], PARTS).reach).toBe('moderate');
  });

  it('states the arithmetic so the label can be inspected', () => {
    expect(deriveReach([at(10)], PARTS).reachBasis).toBe('1 passage across 1 part');
  });

  it('does not claim narrow reach means unimportant — it reports the span only', () => {
    const { reach, reachBasis } = deriveReach([at(10)], PARTS);
    expect(reach).toBe('narrow');
    expect(reachBasis).not.toMatch(/priority|important|minor|low/i);
  });

  it('ignores whatever MAIA claimed the importance was', () => {
    const BOOK2 = 'Air is the unseen matrix in which all movement and thought arise.';
    const { findings } = validateFindings(
      [
        {
          title: 't',
          observation: 'o',
          priority: 'high',
          quotes: ['Air is the unseen matrix in which all movement and thought arise.'],
        },
      ],
      BOOK2,
      'threads',
      [{ label: 'All', start: 0, end: BOOK2.length }],
    );
    expect(findings[0].reach).toBe('narrow');
    expect(findings[0].reachBasis).toBe('1 passage across 1 part');
  });
});

// ── DE-02 ────────────────────────────────────────────────────────────────

describe('form-sensitive lenses — additional, never a replacement', () => {
  it('gives an undeclared Work the five universal lenses and nothing else', () => {
    expect(lensesFor(null).map((l) => l.id)).toEqual(LENSES.map((l) => l.id));
    expect(lensesFor('  ')).toHaveLength(5);
  });

  it('never drops a universal lens for a declared form', () => {
    for (const form of ['Novel', 'Memoir', 'PhD dissertation', 'Elemental philosophy']) {
      const ids = lensesFor(form).map((l) => l.id);
      for (const universal of LENSES) expect(ids).toContain(universal.id);
    }
  });

  it('reads a dissertation for argument and evidence', () => {
    const ids = lensesFor('PhD dissertation').map((l) => l.id);
    expect(ids).toContain('argument');
    expect(ids).toContain('evidence');
  });

  it('reads a therapist’s book for ground and care, not for plot', () => {
    const ids = lensesFor('a book for therapists from my practice').map((l) => l.id);
    expect(ids).toContain('client_ground');
    expect(ids).toContain('care');
    expect(ids).not.toContain('stakes');
    expect(ids).not.toContain('scene');
  });

  it('reads philosophy for concept-and-experience, never for scenes', () => {
    const ids = lensesFor('spiritual teaching').map((l) => l.id);
    expect(ids).toContain('concept_experience');
    expect(ids).toContain('language');
    expect(ids).not.toContain('character');
  });

  it('only gives fiction its own lenses', () => {
    const ids = lensesFor('Novel').map((l) => l.id);
    expect(ids).toContain('character');
    expect(ids).toContain('scene');
  });

  it('does not guess a family for an unfamiliar form', () => {
    expect(formFamily('a grimoire for grief')).toBeNull();
    expect(lensesFor('a grimoire for grief')).toHaveLength(5);
  });

  it('no form-specific lens ever asks for a beat sheet', () => {
    for (const family of FORM_FAMILIES) {
      for (const lens of FORM_LENSES[family]) {
        expect(lens.ask).not.toMatch(/inciting incident|beat sheet|three-act|midpoint/i);
      }
    }
  });

  it('resolves a form lens by id, and still refuses one it does not offer', () => {
    expect(lensById('argument')!.label).toBe('Argument');
    expect(lensById('three_act')).toBeNull();
  });
});

describe('the structure boundary — DE-02 may not assert a shape nobody declared', () => {
  const prompt = buildLensPrompt({
    lens: 'movement',
    declaredForm: null,
    workTitle: null,
    workPurpose: null,
    materials: [],
  });

  it('permits describing what is actually present', () => {
    expect(prompt).toContain('across the six parts represented in this draft');
  });

  it('forbids speaking of movements or acts the writer did not declare', () => {
    expect(prompt).toContain('You may NOT speak of the Work');
    expect(prompt).toContain('asserts a shape nobody gave you');
  });
});

describe('material-aware reading', () => {
  const withMaterial = (excerpt: string | null) =>
    buildLensPrompt({
      lens: 'threads',
      declaredForm: null,
      workTitle: null,
      workPurpose: null,
      materials: [
        { kind: 'transcript', label: 'Larry interview', sentence: 'the lived example', excerpt },
      ],
    });

  it('marks material as not the manuscript', () => {
    expect(withMaterial(null)).toContain('NOT the manuscript');
    expect(withMaterial(null)).toContain('no reader will see it');
  });

  it('carries the writer’s own sentence about how it belongs', () => {
    expect(withMaterial(null)).toContain('the lived example');
  });

  it('includes the excerpt inside its own markers when one is given', () => {
    const p = withMaterial('we were talking about breath');
    expect(p).toContain('<<<MATERIAL');
    expect(p).toContain('we were talking about breath');
  });

  it('forbids treating the Work as deficient for lacking what material holds', () => {
    expect(withMaterial(null)).toContain('never suggest the Work is missing something');
  });

  it('bounds an excerpt so a corpus cannot arrive as context', () => {
    const long = 'x'.repeat(MATERIAL_EXCERPT_CHARS * 3);
    const excerpt = materialExcerpt(long)!;
    expect(excerpt.length).toBe(MATERIAL_EXCERPT_CHARS + 1);
  });

  it('has nothing to say about a material with no text', () => {
    expect(materialExcerpt(null)).toBeNull();
    expect(materialExcerpt('   ')).toBeNull();
  });
});

// ── DE-02A ───────────────────────────────────────────────────────────────

describe('the gate validates against what MAIA was GIVEN, not the whole book', () => {
  const CH2 = 'The second chapter opens on the river at first light, quite alone.';
  const CH9 = 'By the ninth chapter the river has become something else entirely.';
  const BOOK = `${CH2}\n\n${'filler prose. '.repeat(50)}\n\n${CH9}`;

  const finding = (quote: string) => [
    { title: 'The river', observation: 'It recurs here.', quotes: [quote] },
  ];

  it('keeps a finding quoting the segment it was shown', () => {
    const { findings } = validateFindings(finding(CH2), CH2, 'threads');
    expect(findings).toHaveLength(1);
  });

  it('DROPS a quote that exists elsewhere in the book but not in this segment', () => {
    // The control that the pre-DE-02A implementation fails: validating against
    // the whole snapshot let a chapter-9 sentence evidence a chapter-2 pass.
    const { findings, dropped } = validateFindings(finding(CH9), CH2, 'threads');
    expect(findings).toHaveLength(0);
    expect(dropped[0].reason).toContain('MAIA read');
    // ...and it is genuinely present in the book, which is the whole point.
    expect(BOOK).toContain(CH9);
  });

  it('translates a located offset into snapshot coordinates', () => {
    const start = BOOK.indexOf(CH2);
    const { findings } = validateFindings(finding(CH2), CH2, 'threads', [], start);
    const ev = findings[0].evidence[0];
    expect(BOOK.slice(ev.start, ev.end)).toBe(CH2);
  });

  it('leaves offsets alone when the visible text IS the whole snapshot', () => {
    const { findings } = validateFindings(finding(CH2), BOOK, 'threads');
    const ev = findings[0].evidence[0];
    expect(ev.start).toBe(BOOK.indexOf(CH2));
  });
});
