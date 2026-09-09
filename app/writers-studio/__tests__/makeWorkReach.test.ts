/**
 * WS-MAKE-WORK-REACH-01 — where the doorway is rendered.
 *
 * The arrival facts are asserted in homeState.test.ts. This asserts the other
 * half: that the action is offered on UNCLAIMED WRITING and on nothing else.
 *
 * ⛔ Structural, by design. A card only a browser can see is exactly how this
 * defect survived — the capability was wired and tested, and unreachable.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(join(__dirname, '..', 'HomeView.tsx'), 'utf8');
/* Comments explain the rule; only rendered JSX implements it. The C21 lesson:
   prose about an action must never read as the action being offered. */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Every `<Card …/>` element in the file, as source blocks. */
const cards = (): string[] =>
  [...CODE.matchAll(/<Card\b[\s\S]*?\/>/g)].map((m) => m[0]);

describe('WS-MAKE-WORK-REACH-01 — "Make this a work" is offered where writing lives', () => {
  it('the action exists and calls the already-wired handler', () => {
    expect(CODE).toContain('Make this a work');
    expect(CODE).toContain('onMakeWork(makeWorkFrom.id, makeWorkFrom.title)');
  });

  it('⭐ EVERY unclaimed-writing card offers it', () => {
    const writingCards = cards().filter((c) => c.includes('workId: null'));
    expect(writingCards.length).toBeGreaterThan(0);
    for (const c of writingCards) expect(c).toContain('makeWorkFrom=');
  });

  it('⛔ NO Work card offers it — a Work is not made out of a Work', () => {
    const workCards = cards().filter((c) => !c.includes('workId: null'));
    for (const c of workCards) expect(c).not.toContain('makeWorkFrom=');
  });

  it('⛔ it is not reachable through the Link — a button inside an anchor is invalid, and would open the writing instead', () => {
    const btn = CODE.indexOf('Make this a work');
    const linkClose = CODE.lastIndexOf('</Link>', btn);
    const linkOpen = CODE.lastIndexOf('<Link', btn);
    expect(linkClose).toBeGreaterThan(linkOpen);
  });
});
