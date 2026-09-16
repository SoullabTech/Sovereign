/**
 * WS-EMPTY-BEGIN-REACH-01 — a first-time writer can actually begin.
 *
 * Production beta finding, 2026-09-16: the empty-Studio hero set
 * `beginning = true`, but the only form that consumed that state was rendered
 * behind `kind !== 'begin'`. The click therefore changed state and showed
 * nothing. This is structural on purpose: reachability is the thing that failed.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(join(__dirname, '..', 'HomeView.tsx'), 'utf8');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('WS-EMPTY-BEGIN-REACH-01 — empty Studio beginning is reachable', () => {
  it('has one shared beginning form rather than two implementations', () => {
    expect(CODE.match(/id="work-name"/g)?.length).toBe(1);
    expect(CODE).toContain('const beginForm = (');
    expect(CODE).toContain('() => onBegin(draftName.trim())');
  });

  it('the empty-Studio hero consumes the beginning state', () => {
    const start = CODE.indexOf("kind === 'begin' ? (");
    const end = CODE.indexOf('{searchable ? (', start);
    const emptyHome = CODE.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(emptyHome).toContain('beginning ? (');
    expect(emptyHome).toContain('beginForm');
    expect(emptyHome).toContain('setBeginning(true)');
  });

  it('the established Studio uses the same beginning form', () => {
    expect(CODE.match(/beginForm/g)?.length).toBeGreaterThanOrEqual(3);
    expect(CODE).toMatch(/kind !== 'begin'[\s\S]*?beginning \? \([\s\S]*?beginForm/);
  });
});
