import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import WorkCard from '../WorkCard';
import CanvasPage from '../canvas/page';
import type { LivingWork } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';

/**
 * The entry gesture — render contract proof.
 *
 * These tests exist because the defect they guard was invisible to every
 * suite that passed while it shipped: a member could see a named project and
 * had no way into it. `studioMap` and `shellIdentity` were green throughout.
 * Pure-logic coverage cannot witness a missing door.
 *
 * WHAT IS ASSERTED HERE is only what a member can read and click: the words
 * on the control, which title heads the room, whether the belonging sentence
 * is the member's declaration or the system's inference, and where the
 * primary href actually points.
 *
 * DELIBERATELY NOT IMPORTED: canvasFor(), WRITE_HREF, STAGES or anything else
 * from studioMap/shellIdentity. Hrefs are asserted as literal strings. A test
 * that built its expectation from the same helper the component calls would
 * prove only that the helper agrees with itself, and would stay green through
 * a rename that broke every link in the product.
 *
 * WHAT THIS SUITE CANNOT PROVE, and does not claim: that navigation feels
 * continuous; that no intermediate filing experience is perceived; anything
 * about timing, loading transitions or geometry; and above all whether the
 * writer experiences *beginning inside a project* rather than making a loose
 * manuscript that is filed afterwards. jsdom has no layout, does not follow a
 * location assignment, and cannot report a felt relationship. Those remain
 * gated on the authenticated browser walk. A green run here is not acceptance.
 */

const NOW = '2026-08-06T12:00:00.000Z';

const work = (over: Partial<LivingWork> = {}): LivingWork => ({
  id: 'work-1',
  title: 'Inner Guide Meditation',
  purpose: null,
  form: null,
  stage: null,
  createdAt: NOW,
  updatedAt: NOW,
  expressions: [],
  materials: [],
  ...over,
});

const manuscript = (over: Partial<CurrentManuscript> = {}): CurrentManuscript => ({
  id: 'ms-1',
  title: 'Chapter One',
  createdAt: NOW,
  sectionCount: 1,
  charCount: 10,
  keepCount: 0,
  ...over,
});

const placement = (expressionId: string) => ({
  expressionType: 'manuscript',
  expressionId,
  declaredAt: NOW,
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const text = () => container.textContent ?? '';
const links = () => Array.from(container.querySelectorAll('a'));
const buttons = () => Array.from(container.querySelectorAll('button'));

// ---------------------------------------------------------------------------
// The card: is there a door, and where does it point?
// ---------------------------------------------------------------------------

describe('WorkCard — the way into a project', () => {
  const mountCard = (w: LivingWork, ms: CurrentManuscript[]) =>
    act(() => {
      root.render(<WorkCard work={w} manuscripts={ms} reload={async () => {}} />);
    });

  it('1. an empty project offers Start writing, not a dead-state sentence', () => {
    mountCard(work(), []);

    const start = buttons().find((b) => b.textContent?.trim() === 'Start writing');
    expect(start).toBeDefined();
    expect(start!.disabled).toBe(false);

    // The old surface said only this, with nothing to act on. The sentence may
    // survive as context, but it may never again BE the whole offer.
    const deadStateOnly =
      text().includes('Nothing placed here yet') &&
      !buttons().some((b) => b.textContent?.trim() === 'Start writing');
    expect(deadStateOnly).toBe(false);
  });

  it('2. the primary door resolves to the Canvas route for that exact page', () => {
    const ms = manuscript({ id: 'ms-abc' });
    mountCard(work({ expressions: [placement('ms-abc')] }), [ms]);

    const primary = links().find((a) => a.textContent?.trim() === 'Continue Developing');
    expect(primary).toBeDefined();
    // Literal, on purpose — see the header note.
    expect(primary!.getAttribute('href')).toBe('/writers-studio/canvas?m=ms-abc');
  });

  it('3. Canvas is primary and Working Draft is subordinate, in that order', () => {
    mountCard(work({ expressions: [placement('ms-1')] }), [manuscript()]);

    const primary = links().find((a) => a.textContent?.trim() === 'Continue Developing')!;
    const secondary = links().find((a) => a.textContent?.trim() === 'Working Draft')!;
    expect(primary).toBeDefined();
    expect(secondary).toBeDefined();

    // Primary carries the filled control treatment; the subordinate view is a
    // plain underlined link. This is the visual hierarchy a member reads.
    expect(primary.style.background).not.toBe('');
    expect(secondary.style.background).toBe('');

    // Document order: the room comes before the view inside it.
    expect(primary.compareDocumentPosition(secondary) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();

    // And the subordinate link still genuinely reaches the draft surface.
    expect(secondary.getAttribute('href')).toBe('/press/manuscript?tab=draft&m=ms-1');
  });

  it('4. a placed page is itself a door into the room', () => {
    mountCard(work({ expressions: [placement('ms-1')] }), [manuscript({ title: 'Chapter One' })]);

    const piece = links().find((a) => a.textContent?.trim() === 'Chapter One');
    expect(piece).toBeDefined();
    expect(piece!.getAttribute('href')).toBe('/writers-studio/canvas?m=ms-1');
  });
});

// ---------------------------------------------------------------------------
// The room: what does it say it is holding?
// ---------------------------------------------------------------------------

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { apiFetch } = require('@/lib/http/apiBase') as { apiFetch: jest.Mock };

const respond = (works: LivingWork[], manuscripts: CurrentManuscript[]) => {
  apiFetch.mockImplementation(async (url: string) => {
    if (url.startsWith('/api/sovereign/living-works')) {
      return { ok: true, status: 200, json: async () => ({ works }) };
    }
    if (url.startsWith('/api/sovereign/manuscripts')) {
      return { ok: true, status: 200, json: async () => ({ manuscripts }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  });
};

describe('Writer Canvas — what heads the room', () => {
  const mountCanvas = async (works: LivingWork[], ms: CurrentManuscript[], requested: string) => {
    window.history.replaceState({}, '', `/writers-studio/canvas?m=${requested}`);
    respond(works, ms);
    await act(async () => {
      root.render(<CanvasPage />);
    });
    // let the two mount fetches settle
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  it('5. with the member’s placement, the PROJECT titles the room', async () => {
    await mountCanvas(
      [work({ title: 'Inner Guide Meditation', expressions: [placement('ms-1')] })],
      [manuscript({ id: 'ms-1', title: 'Chapter One' })],
      'ms-1'
    );

    const h1 = container.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Inner Guide Meditation');
  });

  it('6. the belonging is stated as the member’s own declaration', async () => {
    await mountCanvas(
      [work({ title: 'Inner Guide Meditation', expressions: [placement('ms-1')] })],
      [manuscript({ id: 'ms-1', title: 'Chapter One' })],
      'ms-1'
    );

    // Authored relationship language — attributed to the member, not filing.
    expect(text()).toContain('On the table: Chapter One — a form of this work, declared by you.');
    expect(text()).not.toMatch(/filed|added to|assigned|categoriz/i);
  });

  it('7. without a placement row the room falls back honestly to the page', async () => {
    await mountCanvas(
      [work({ title: 'Inner Guide Meditation', expressions: [] })],
      [manuscript({ id: 'ms-1', title: 'Chapter One' })],
      'ms-1'
    );

    const h1 = container.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Chapter One');
    // No belonging may be asserted where the member declared none.
    expect(text()).not.toContain('a form of this work, declared by you');
  });
});
