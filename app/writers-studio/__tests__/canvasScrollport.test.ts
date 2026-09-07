/**
 * @jest-environment jsdom
 */
/**
 * THE VIEWPORT JUMP — the obligation that its first repair could not fail.
 *
 * Founder report, 2026-09-07: selecting a row in Manuscript moved the whole
 * page. The first repair captured and restored `window.scrollY` around the
 * field's remeasurement. That is the right shape and the WRONG AXIS: this room
 * scrolls `<main>` (`overflow: auto`), so `window.scrollY` is 0 for the whole
 * session. The guard restored a number that never changed, threw no error,
 * and the jump survived looking fixed.
 *
 * ⭐ A guard on the wrong axis is indistinguishable from a working guard until
 * something measures the axis that actually moves. That is what these do.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { preservingScroll, scrollportOf } from '../canvas/scrollport';

const root = join(__dirname, '..');
const code = (p: string) =>
  readFileSync(join(root, p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

/** A scrolling <main> with a tall field inside it — the Canvas's real shape. */
function room() {
  const main = document.createElement('main');
  main.style.overflowY = 'auto';
  Object.defineProperty(main, 'scrollHeight', { value: 4000, configurable: true });
  Object.defineProperty(main, 'clientHeight', { value: 800, configurable: true });
  const field = document.createElement('textarea');
  main.appendChild(field);
  document.body.appendChild(main);
  return { main, field };
}

afterEach(() => { document.body.innerHTML = ''; });

describe('the scrollport is the element, not the document', () => {
  it('finds the scrolling ancestor', () => {
    const { main, field } = room();
    expect(scrollportOf(field)).toBe(main);
  });

  it('returns null rather than falling back to the document', () => {
    const plain = document.createElement('div');
    document.body.appendChild(plain);
    expect(scrollportOf(plain)).toBeNull();
  });

  it('⭐ restores the scrollport when a measurement clamps it', () => {
    const { main, field } = room();
    main.scrollTop = 1200;
    preservingScroll(field, () => {
      /* what `height: auto` does: the content collapses and the browser
         clamps a scroll position that is now past the end. */
      main.scrollTop = 0;
    });
    expect(main.scrollTop).toBe(1200);
  });

  it("never overwrites a scroll the measurement did not move", () => {
    const { main, field } = room();
    main.scrollTop = 1200;
    preservingScroll(field, () => {});
    expect(main.scrollTop).toBe(1200);
  });
});

describe('no component reintroduces the wrong axis or an unscoped reveal', () => {
  it('the sectioned surface guards through the scrollport helper', () => {
    const src = code('canvas/SectionWritingSurface.tsx');
    expect(src).toContain('preservingScroll(');
    expect(src).not.toContain('window.scrollY');
    expect(src).toContain('preventScroll: true');
  });

  it('scrollIntoView is not used to reveal anything in the Canvas', () => {
    for (const f of ['canvas/SectionWritingSurface.tsx', 'canvas/StructuredOutline.tsx']) {
      expect(code(f)).not.toContain('scrollIntoView');
    }
  });

  it('there is exactly ONE definition of scrollportOf', () => {
    for (const f of ['canvas/StructuredOutline.tsx', 'canvas/SectionWritingSurface.tsx']) {
      expect(code(f)).not.toContain('function scrollportOf');
      expect(code(f)).toContain("from './scrollport'");
    }
  });
});
