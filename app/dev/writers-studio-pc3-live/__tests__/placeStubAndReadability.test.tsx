/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { findLongerSibling, aboutWords } from '../stubSibling';
import { PlaceStubNotice } from '../PlaceStubNotice';
import { MAIA_ACCENT, assertMaiaIsVisuallyDistinctFromTheWork, TYPE } from '@/app/writers-studio/studioTheme';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const words = (n: number) => Array.from({ length: n }, (_, i) => 'w' + i).join(' ');
const sec = (id: string, position: number, heading: string | null, n: number) => ({
  draftSectionId: id, sourceSectionId: null, position, heading, headingDepth: 1, headingSignal: 'chapter', body: words(n), editable: true,
}) as any;

describe('a short section that shares its name with a much longer one', () => {
  // The founder's real pattern: the chapter (about 12,000 words) and, in the back matter, a same-named works-cited stub (about 90 words).
  const sections = [sec('long', 24, 'Chapter 10: The Living Spiral', 12000), sec('other', 25, 'FOUR SCALES OF WATER', 150), sec('stub', 52, 'CHAPTER 10: THE LIVING SPIRAL', 90)];
  it('is found when the author selected the stub, ignoring case and punctuation', () => {
    const found = findLongerSibling(sections, 'stub')!;
    expect(found.selected).toMatchObject({ id: 'stub', words: 90 });
    expect(found.longer).toMatchObject({ id: 'long', words: 12000 });
  });
  it('is not raised when the author selected the chapter itself', () => expect(findLongerSibling(sections, 'long')).toBeNull());
  it('is not raised for a differently named short section', () => expect(findLongerSibling(sections, 'other')).toBeNull());
  it('is not raised when both are chapter-sized, or the sibling is not much longer, or there is no heading', () => {
    expect(findLongerSibling([sec('a', 0, 'Same', 500), sec('b', 1, 'Same', 900)], 'a')).toBeNull();
    expect(findLongerSibling([sec('a', 0, 'Same', 400), sec('b', 1, 'Same', 1600)], 'a')).toBeNull(); // 4x, under the 5x bar
    expect(findLongerSibling([sec('a', 0, null, 50), sec('b', 1, null, 9000)], 'a')).toBeNull();
    expect(findLongerSibling(sections, null)).toBeNull();
  });
  it('talks about size as an estimate', () => {
    expect(aboutWords(90)).toBe('about 90 words');
    expect(aboutWords(12034)).toBe('about 12,000 words');
  });
});

describe('PlaceStubNotice', () => {
  let root: Root, container: HTMLDivElement;
  beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
  afterEach(() => { act(() => root.unmount()); container.remove(); });
  it('asks which one she means and hands both answers to the author', () => {
    const onOpenLonger = jest.fn(), onStay = jest.fn();
    act(() => root.render(React.createElement(PlaceStubNotice, { found: findLongerSibling([sec('long', 24, 'Chapter 10: The Living Spiral', 12000), sec('stub', 52, 'CHAPTER 10: THE LIVING SPIRAL', 90)], 'stub')!, onOpenLonger, onStay })));
    expect(container.textContent).toContain('Is the longer one the chapter you mean?');
    expect(container.textContent).toContain('about 90 words');
    const buttons = Array.from(container.querySelectorAll('button'));
    act(() => buttons.find(b => b.textContent === 'Open the longer one')!.click());
    act(() => buttons.find(b => b.textContent === 'Stay with this one')!.click());
    expect(onOpenLonger).toHaveBeenCalledTimes(1); expect(onStay).toHaveBeenCalledTimes(1);
  });
});

describe('Develop wiring', () => {
  const view = readFileSync(join(__dirname, '..', 'P4R1DevelopView.tsx'), 'utf8');
  it('offers the notice only for an explicit rail selection and only until the author says stay', () => {
    expect(view).toMatch(/hasExplicitPlace && railSelectionId \? findLongerSibling\(props\.sections, railSelectionId\)/);
    expect(view).toContain('stubDismissedFor !== stubSibling.selected.id');
    expect(view).toContain('selectManuscriptLocus(stubSibling.longer.id)');
  });
});

describe('MAIA conversation readability', () => {
  const luminance = (hex: string) => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  it('MAIA reading text reaches AA contrast on the panel while the old voice colour did not', () => {
    expect(contrast(MAIA_ACCENT.voice, '#1a1d2e')).toBeLessThan(4.5);
    expect(contrast(MAIA_ACCENT.reading, '#1a1d2e')).toBeGreaterThanOrEqual(4.5);
  });
  it('is still violet and still distinct from the author’s own work (D-019), and the text stays smaller than prose', () => {
    expect(() => assertMaiaIsVisuallyDistinctFromTheWork()).not.toThrow();
    expect(1 /* rem */).toBeLessThan(TYPE.prose.size);
  });
  it('the conversation uses the reading colour at body size with open leading and kept line breaks', () => {
    const src = readFileSync(join(__dirname, '..', '..', '..', 'writers-studio', 'canvas', 'WorkConversation.tsx'), 'utf8');
    expect(src).toContain('MAIA_ACCENT.reading');
    expect(src).toContain("fontSize: '1rem', lineHeight: 1.7");
    expect(src).toContain("whiteSpace: 'pre-wrap'");
  });
});
