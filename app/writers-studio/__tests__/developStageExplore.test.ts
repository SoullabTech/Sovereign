/**
 * Founder design 2026-11-11: the ways to explore are in view; MAIA reads the opened chapter while it stays put; her quoted evidence is
 * marked in the writer's own text; beside the conversation she asks what the writer would like to do. Real components, jsdom; not a browser run.
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { createRoot, type Root } from 'react-dom/client';

jest.mock('@/app/writers-studio/canvas/ReadScopeControl', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/writers-studio/canvas/SettledDecisions', () => ({ __esModule: true, default: () => null }));
jest.mock('@/lib/writersStudio/workKindClient', () => ({ setWorkKindClient: jest.fn(async (_w: string, k: unknown) => k) }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { DevelopStage, StageReadingCard, evidenceSpans, markEvidence, chapterWordCount, type StageReading } from '@/app/dev/writers-studio-pc3-live/DevelopStage';

const sections = [
  { draftSectionId: 's1', heading: 'Harbour', body: 'Harbour\n\nMarta held the key by the harbour. It was cold.\n\nThe lantern stayed dark all winter.', position: 0 },
  { draftSectionId: 's2', heading: 'Salt', body: 'Salt\n\nThe nets were heavy that winter.', position: 1 },
];
const item = (id: string, over: Record<string, unknown> = {}) => ({
  id, band: 'begin-here', scale: 'chapter', label: `Item ${id}`, notice: 'Something she noticed.', whyItMatters: 'Because.', uncertainty: null,
  evidence: [], sectionIds: ['s1'], ...over,
}) as any;
const ready = (items: any[]): StageReading => ({ status: 'ready', progress: null, error: null, chapterLabel: 'Harbour', chapterWords: 21, items });

let root: Root; let host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

function stage(over: Record<string, unknown> = {}) {
  const props = { workTitle: 'The Long Harbour', sections, currentId: 's1', onSelect: jest.fn(), starters: [], onStarter: jest.fn(), onOpenWrite: jest.fn(), onMoreWays: jest.fn(), lastRead: null, plan: null, planBusy: false, planNote: null, onMakePlan: jest.fn(), onEditPlan: jest.fn(), onWorkOnStep: jest.fn(), ...over };
  act(() => root.render(React.createElement(DevelopStage as any, props)));
  return props;
}
const q = (sel: string) => host.querySelector(sel) as HTMLElement | null;

describe('evidence is exact, never guessed', () => {
  it('only verbatim quotations of 12+ characters become marks, numbered by the item that quotes them', () => {
    const spans = evidenceSpans([item('a', { notice: 'You write “Marta held the key by the harbour” and it lands.' }), item('b', { notice: 'Short “key” only.' })]);
    expect(spans).toEqual([{ text: 'Marta held the key by the harbour', n: 1 }]);
  });
  it('a near-miss quotation is NOT marked (no loose matching)', () => {
    const pieces = markEvidence('Marta held the key by the harbour. It was cold.', [{ text: 'Marta held a key by the harbour', n: 1 }]);
    expect(pieces.every((p) => p.n === null)).toBe(true);
  });
  it('an exact quotation is marked in place, the rest of the paragraph unchanged', () => {
    const pieces = markEvidence('Marta held the key by the harbour. It was cold.', [{ text: 'Marta held the key by the harbour', n: 2 }]);
    expect(pieces.map((p) => p.text).join('')).toBe('Marta held the key by the harbour. It was cold.');
    expect(pieces.find((p) => p.n === 2)?.text).toBe('Marta held the key by the harbour');
  });
  it('counts the chapter\'s words from the writer\'s own text', () => {
    expect(chapterWordCount(sections, 's1', 's2')).toBe(16 + 6);
    expect(chapterWordCount(sections, 's2', 's1')).toBeNull();
  });
});

describe('the stage: ways in view, reading never moves the chapter', () => {
  it('⭐ the ways to explore and the editorial pass are visible without opening anything', () => {
    stage({ ways: [{ key: 'arc', label: 'Arc' }, { key: 'voice', label: 'Voice' }], onWay: jest.fn(), editorialPass: { status: 'none', progress: null, error: null }, onEditorialPass: jest.fn() });
    expect(q('[data-develop-ways]')).not.toBeNull();
    expect(q('[data-develop-way="arc"]')?.textContent).toBe('Arc');
    expect(q('[data-develop-way="editorial-pass"]')?.textContent).toContain('editorial pass');
    expect(q('[data-develop-more-panel]')).toBeNull();
  });
  it('choosing a way calls it; nothing else happens', () => {
    const onWay = jest.fn();
    stage({ ways: [{ key: 'arc', label: 'Arc' }], onWay });
    act(() => q('[data-develop-way="arc"]')!.click());
    expect(onWay).toHaveBeenCalledWith('arc');
  });
  it('⭐ while MAIA reads, the chapter is still there and says what she is reading', () => {
    stage({ reading: { status: 'reading', progress: null, error: null, chapterLabel: 'Harbour', chapterWords: 21, items: [] }, onReadChapter: jest.fn() });
    expect(q('[data-develop-chapter="s1"]')?.textContent).toContain('Marta held the key');
    expect(q('[data-develop-reading-line="reading"]')?.textContent).toContain('MAIA is reading Harbour · 21 words, all of it');
    expect(q('[data-develop-read-chapter]')).toBeNull();
  });
  it('⭐ when she has read it, her quoted words are marked in the text and the section says which observations come from it', () => {
    stage({ reading: ready([item('a', { notice: 'You write “The lantern stayed dark all winter” and it holds.' }), item('b', { sectionIds: ['s2'] })]), onReadChapter: jest.fn() });
    expect(q('[data-develop-evidence="1"]')?.textContent).toContain('The lantern stayed dark all winter');
    expect(q('[data-develop-cited-here]')?.textContent).toContain('observation 1 comes from this section');
    expect(q('[data-develop-reading-line="ready"]')?.textContent).toContain('all 21 words');
  });
  it('before any reading, the writer can ask for one', () => {
    const onReadChapter = jest.fn();
    stage({ reading: { status: 'idle', progress: null, error: null, chapterLabel: 'Harbour', chapterWords: 21, items: [] }, onReadChapter });
    act(() => q('[data-develop-read-chapter]')!.click());
    expect(onReadChapter).toHaveBeenCalledTimes(1);
  });
});

describe('her reading beside the conversation: she asks; the writer chooses', () => {
  function card(r: StageReading, onWorkTowardRevision = jest.fn()) {
    act(() => root.render(React.createElement(StageReadingCard, { reading: r, onWorkTowardRevision })));
    return onWorkTowardRevision;
  }
  it('⭐ asks what the writer would like to do, and opens nothing by itself', () => {
    card(ready([item('a'), item('b')]));
    expect(host.textContent).toContain('What would you like to do?');
    expect(q('[data-develop-reading-items]')).toBeNull();
    for (const c of ['noticed', 'passage', 'revise', 'rest']) expect(q(`[data-develop-choice="${c}"]`)).not.toBeNull();
  });
  it('"Go through what she noticed" shows every item, in her reading\'s order', () => {
    card(ready([item('a'), item('b'), item('c')]));
    act(() => q('[data-develop-choice="noticed"]')!.click());
    expect(host.querySelectorAll('[data-develop-reading-item]').length).toBe(3);
  });
  it('"Leave it for now" folds it to one line that can be reopened; nothing is dismissed', () => {
    card(ready([item('a')]));
    act(() => q('[data-develop-choice="rest"]')!.click());
    expect(q('[data-develop-reading-card="folded"]')).not.toBeNull();
    act(() => (host.querySelector('[data-develop-reading-card="folded"] button') as HTMLElement).click());
    expect(q('[data-develop-reading-card="open"]')).not.toBeNull();
  });
  it('shows nothing while she is still reading', () => {
    card({ status: 'reading', progress: null, error: null, chapterLabel: 'Harbour', chapterWords: 21, items: [] });
    expect(host.innerHTML).toBe('');
  });
});

describe('wiring (source): automatic reading is gated; the conversation is never reset by the card', () => {
  const VIEW = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');
  const effect = VIEW.slice(VIEW.indexOf('const autoReadAsked'), VIEW.indexOf('const chooseDevelopView'));
  it('⭐ she reads by herself only with the writer\'s standing permission, never in Sanctuary, once per chapter per visit', () => {
    expect(effect).toMatch(/getReadScope\(props\.manuscriptId\)/);
    expect(effect).toMatch(/if \(cancelled \|\| !scope\) return;/);
    expect(effect).toMatch(/if \(!posture\.resolved \|\| posture\.sanctuary\) return;/);
    expect(effect).toMatch(/autoReadAsked\.current\.add\(autoReadKey\)/);
    expect(effect).toMatch(/now\.review \|\| now\.busy \|\| now\.error/);
  });
  it('⭐ "Work toward a revision" makes a plan; it never re-keys (resets) the conversation', () => {
    const cardUse = VIEW.slice(VIEW.indexOf('<StageReadingCard'), VIEW.indexOf('<StageReadingCard') + 400);
    expect(cardUse).toMatch(/onWorkTowardRevision=\{\(\) => makePlan\(/);
    expect(cardUse).not.toMatch(/setAttentionConversationDraft/);
  });
  it('the reading card moves no focus and scrolls nothing', () => {
    const STAGE = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/DevelopStage.tsx'), 'utf8');
    const cardSrc = STAGE.slice(STAGE.indexOf('export function StageReadingCard'));
    expect(cardSrc).not.toMatch(/\.focus\(|scrollIntoView/);
  });
});
