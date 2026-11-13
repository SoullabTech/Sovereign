import { createHash } from 'crypto';
import { evidenceAtRev1, S, TEXTS } from '../../manuscript/development/__tests__/fixture';
import { buildCanvasInsight, insightWriteHref, passageWindow } from '../insightCanvas';
import { comparisonSpan } from '../insightComparison';
import type { ReadingPayload } from '../developClient';
import type { RebuildSection } from '../rebuild/model';
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
const digest = async (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const sections: RebuildSection[] = S.map((id, i) => ({ draftSectionId: id, body: TEXTS[id],
  sourceSectionId: null, position: i, heading: id, headingDepth: null, headingSignal: null, editable: true }));
function payload(): ReadingPayload {
  const { evidence } = evidenceAtRev1({ bodyScope: S });
  return {
    reading: { id: 'r1', manuscriptId: 'm1', readState: evidence.readState, coverage: evidence.coverage,
      scope: { commissionedLens: 'development', bodyScope: S, withStructure: true },
      provenance: { frozenAt: '2026-09-17T00:00:00Z',
        reader: { provider: 'test', model: 'test', promptHash: 'h', readerVersion: 'test' },
        classifier: { provider: 'test', model: 'test', promptHash: 'h', classifierVersion: 'test' } },
      outcome: 'reading', observations: [{ key: 'o1', lens: 'development', phenomenon: 'recurrence',
        evidenceRefs: [{ kind: 'passage', sectionId: 's0', range: { start: 19, end: 24 } },
          { kind: 'section', sectionId: 's1' }, { kind: 'section-run', sectionIds: ['s2', 's3'] }],
        observation: '  Repeated image.\n', doesNotEstablish: ['across-unread-span'],
        structureDependency: { kind: 'independent' } }] },
    assessment: { reading: { state: 'current' }, observations: { o1: { state: 'current' } } },
    sections: S.map(id => ({ id, heading: id })),
  };
}
test('keeps all named places and verbatim observation; hashes exact text before range use', async () => {
  const out = await buildCanvasInsight('m1', payload(), sections, 'o1', digest);
  expect(out?.observation.observation).toBe('  Repeated image.\n');
  expect(out?.passages.map(p => p.sectionId)).toEqual(S);
  expect(out?.passages.every(p => p.verified)).toBe(true);
  expect(out?.passages[0].range).toEqual({ start: 19, end: 24 });
  expect(out?.passages[1].range).toBeNull();
});
test('a current assessment cannot mark changed text from a racing context read', async () => {
  const out = await buildCanvasInsight('m1', payload(), sections.map((s, i) => i ? s : { ...s, body: 'Changed' }), 'o1', digest);
  expect(out?.passages[0]).toMatchObject({ verified: false, range: null });
  expect(out?.passages[1].verified).toBe(true);
});
test.each(['superseded', 'unmeasured'] as const)('%s never receives current offsets', async state => {
  const p = payload();
  p.assessment.observations.o1 = state === 'superseded' ? { state, moved: [] } : { state };
  const out = await buildCanvasInsight('m1', p, sections, 'o1', digest);
  expect(out?.passages.every(p => !p.verified && p.range === null)).toBe(true);
});
test('missing section, position-only body and unavailable digest stay unverified', async () => {
  const p = payload(); p.reading.coverage = { sections: { s0: 'position', s1: 'body' } };
  const out = await buildCanvasInsight('m1', p, sections.filter(s => s.draftSectionId !== 's1'), 'o1', digest);
  expect(out?.passages.every(p => !p.verified)).toBe(true);
  const failed = await buildCanvasInsight('m1', payload(), sections, 'o1', async () => { throw Error('unavailable'); });
  expect(failed?.passages.every(p => !p.verified)).toBe(true);
});
test('foreign manuscript and absent observation cannot be resolved', async () => {
  expect(await buildCanvasInsight('foreign', payload(), sections, 'o1', digest)).toBeNull();
  expect(await buildCanvasInsight('m1', payload(), sections, 'o2', digest)).toBeNull();
});
test('fractional and out-of-bounds passage ranges cannot be selected', async () => {
  for (const range of [{ start: .5, end: 8 }, { start: 0, end: 999 }, { start: 2, end: 2 }]) {
    const p = payload();
    if (p.reading.outcome === 'reading') p.reading.observations[0].evidenceRefs = [{ kind: 'passage', sectionId: 's0', range }];
    expect((await buildCanvasInsight('m1', p, sections, 'o1', digest))?.passages[0].verified).toBe(false);
  }
});
test('context windows preserve astral evidence and never change the selected span', () => {
  const text = 'First.\n\nA 😀 fire story.\n\nAfter.\n\nLater.';
  const start = Array.from('First.\n\n').length, end = Array.from('First.\n\nA 😀 fire story.').length;
  for (const n of [0, 1, 2, 3]) expect(passageWindow(text, { start, end }, n).selected).toBe('A 😀 fire story.');
  expect(passageWindow(text, { start, end }, 0).before).toBe('');
  expect(passageWindow(text, null, 0).selected).toBe(text);
});
test('handoff carries identities only and uses the canonical section parameter', () => {
  const url = new URL(insightWriteHref('m&1', 'r1', 'o1', 's😀'), 'https://example.test');
  expect(url.searchParams.get('m')).toBe('m&1');
  expect(url.searchParams.get('s')).toBe('s😀');
  expect(url.searchParams.get('insightObservation')).toBe('o1');
  expect([...url.searchParams.keys()]).toHaveLength(4);
});
test.each([['A 😀 story', 'A 🔥 story'], ['abc', ''], ['', 'abc'], ['same', 'same']])('diff reconstructs both exact versions: %s -> %s', (a, b) => {
  const d = comparisonSpan(a, b);
  expect(d.before + d.removed + d.after).toBe(a);
  expect(d.before + d.added + d.after).toBe(b);
});

test('verifies stored heading bytes and translates exact Unicode offsets to the editable body', async () => {
  const p = payload();
  const headingPrefix = '🔥 A heading\n\n';
  const body = 'Before.\n\nA 😀 lived story.\n\nAfter.';
  const start = Array.from(headingPrefix + 'Before.\n\n').length;
  const end = start + Array.from('A 😀 lived story.').length;
  p.reading.readState.sections.s0.digest = await digest(headingPrefix + body);
  p.reading.observations[0].evidenceRefs = [{ kind: 'passage', sectionId: 's0', range: { start, end } }];
  const row = { ...sections[0], heading: '🔥 A heading', headingPrefix, body };
  const out = await buildCanvasInsight('m1', p, [row], 'o1', digest);
  expect(out?.passages[0].verified).toBe(true);
  expect(passageWindow(body, out!.passages[0].range, 0).selected).toBe('A 😀 lived story.');
  const changedHeading = await buildCanvasInsight('m1', p, [{ ...row, headingPrefix: 'Other heading\n\n' }], 'o1', digest);
  expect(changedHeading?.passages[0]).toMatchObject({ verified: false, range: null });
  const missingPrefix = await buildCanvasInsight('m1', p, [{ ...row, headingPrefix: undefined }], 'o1', digest);
  expect(missingPrefix?.passages[0].verified).toBe(false);
  p.reading.observations[0].evidenceRefs = [{ kind: 'passage', sectionId: 's0', range: { start: 0, end } }];
  expect((await buildCanvasInsight('m1', p, [row], 'o1', digest))?.passages[0]).toMatchObject({ verified: false, range: null });
});

/* Founder walk 2026-11-12: the "embedded URL" place cited a range ~660 code points before the URL, the desk held other words (mid-word),
   and every edit MAIA proposed was refused as quote_not_in_text. */
import { anchorHeldRange, quotedWords, pickDeskPassage } from '../insightCanvas';
describe('the desk holds the words the observation is about', () => {
  const body = 'First paragraph about wisdom and all creativity.\n\nThe children splash abouthttps://example.org/x?m=1 in the streams 😀.\n\nLast paragraph.';
  const points = (s: string) => Array.from(s).length;
  const slice = (r: { start: number; end: number }) => Array.from(body).slice(r.start, r.end).join('');
  it('quoted words, split at an ellipsis, become anchors', () => {
    expect(quotedWords('A web address is fused: "splash abouthttps://example.org/x?m=... in the streams." Also “short”.')).toEqual(['splash abouthttps://example.org/x?m=', 'in the streams']);
  });
  it('⭐ MUST FAIL IF a drifted cited range is held instead of the quoted words', () => {
    const drifted = { start: 6, end: 30 }; // inside the first paragraph, mid-word
    const held = anchorHeldRange(body, drifted, ['splash abouthttps://example.org/x?m=']);
    expect(held.by).toBe('quoted_words');
    expect(slice(held.range)).toBe('The children splash abouthttps://example.org/x?m=1 in the streams 😀.');
  });
  it('⭐ MUST FAIL IF a held passage begins or ends inside a word when no quoted words are found', () => {
    const held = anchorHeldRange(body, { start: 6, end: 30 }, ['words that are not in the text']);
    expect(held.by).toBe('cited_range');
    expect(slice(held.range)).toBe('First paragraph about wisdom and all creativity.');
  });
  it('the occurrence nearest the cited range wins, and offsets are code points', () => {
    const twice = 'Echo line here now.\n\n😀 middle.\n\nEcho line here now.';
    const near = anchorHeldRange(twice, { start: points(twice) - 3, end: points(twice) }, ['Echo line here now']);
    expect(near.range).toEqual({ start: points('Echo line here now.\n\n😀 middle.\n\n'), end: points(twice) });
  });
  it('the reader’s evidence range itself is unchanged; holdRange is separate', async () => {
    const out = await buildCanvasInsight('m1', payload(), sections, 'o1', digest);
    expect(out?.passages[0].range).toEqual({ start: 19, end: 24 });
    expect(out?.passages[0].heldBy).toBe('cited_range');
    expect(out?.passages[1]).toMatchObject({ range: null, holdRange: null, heldBy: null });
  });
  it('Show me options opens on the place’s own section, quoted words first', () => {
    const a = { p: { sectionId: 'other', heldBy: 'quoted_words' as const } };
    const b = { p: { sectionId: 'mine', heldBy: 'cited_range' as const } };
    const c = { p: { sectionId: 'mine', heldBy: 'quoted_words' as const } };
    expect(pickDeskPassage([a, b, c], 'mine')).toBe(c);
    expect(pickDeskPassage([a, b], 'mine')).toBe(b);
    expect(pickDeskPassage([], 'mine')).toBeNull();
  });
  it('the Write arrival holds holdRange, not the raw range', () => {
    const src = require('fs').readFileSync(require('path').join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'), 'utf8');
    expect(src).toMatch(/const range = passage\.holdRange \?\? passage\.range \?\?/);
  });
});
