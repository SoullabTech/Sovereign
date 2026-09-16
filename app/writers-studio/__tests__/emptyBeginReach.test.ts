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
  it('has one shared beginning implementation rather than two forms', () => {
    expect(CODE.match(/id="work-name"/g)?.length).toBe(1);
    expect(CODE).toContain('function BeginAndImport(');
    expect(CODE.match(/<BeginAndImport/g)?.length).toBe(2);
    expect(CODE).toContain('() => onBegin(draftName.trim())');
  });

  it('the shared component sends a first writer straight through and names later works', () => {
    const start = CODE.indexOf('function BeginAndImport(');
    const end = CODE.indexOf('export default function HomeView', start);
    const shared = CODE.slice(start, end);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(shared).toContain('beginning && !primary ? (');
    expect(shared).toContain('onClick={primary ? onSubmit : onOpen}');
    expect(shared).toContain('onClick={onSubmit}');
  });

  it('the empty-Studio hero reaches that shared beginning implementation', () => {
    const start = CODE.indexOf("kind === 'begin' ? (");
    const end = CODE.indexOf('{searchable ? (', start);
    const emptyHome = CODE.slice(start, end);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(emptyHome).toContain('<BeginAndImport');
    expect(emptyHome).toContain('primary');
    expect(emptyHome).toContain('beginning={beginning}');
    expect(emptyHome).toContain("onSubmit={() => void run(() => onBegin(''), BEGIN_FAILED)}");
  });

  it('the established Studio reaches the same beginning implementation', () => {
    expect(CODE).toMatch(/kind !== 'begin'[\s\S]*?<BeginAndImport[\s\S]*?primary=\{false\}[\s\S]*?beginning=\{beginning\}/);
  });
});
