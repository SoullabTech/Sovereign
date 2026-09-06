/**
 * NAV-03 — the first session after an import must become navigable without a
 * manual reload.
 *
 * Observed in production 2026-09-06, on a fresh 262-section .md import: the
 * parent read write-state as `no_draft`, mounted Worktable, Worktable created a
 * draft the server stamped section-addressable at birth, and the parent never
 * re-read. The page said "This Work is not yet navigable" over a Work the
 * server already called section_aware. A reload fixed it; nothing else did.
 *
 * These are unit + structural assertions over the wiring. Clicking a real row
 * without reloading is the production witness, not something this suite claims.
 */
import fs from 'fs';
import path from 'path';
import { chooseMount, type WriteState } from '../writeStateClient';

const REPO = path.resolve(__dirname, '../../..');
const read = (p: string) => fs.readFileSync(path.join(REPO, p), 'utf8');
const worktable = () => read('app/writers-studio/canvas/Worktable.tsx');
const canvas = () => read('app/writers-studio/canvas/page.tsx');

describe('the state transition the defect lives in', () => {
  it('no_draft mounts worktable — the room that creates the draft', () => {
    expect(chooseMount('ready', { mode: 'no_draft' }).mount).toBe('worktable');
  });

  it('section_aware mounts the navigable engine — so a re-read is all that is needed', () => {
    const after: WriteState = {
      mode: 'section_aware', version: 1,
      rows: [{ id: 's1', heading: 'Chapter 1', position: 0 }] as never,
      sections: [] as never,
    } as WriteState;
    expect(chooseMount('ready', after).mount).toBe('sections');
  });

  it('the two states differ, so a stale parent shows the wrong engine', () => {
    const before = chooseMount('ready', { mode: 'no_draft' });
    const after = chooseMount('ready', {
      mode: 'section_aware', version: 1, rows: [] as never, sections: [] as never,
    } as WriteState);
    expect(before.mount).not.toBe(after.mount);
  });
});

describe('Worktable reports the change and interprets nothing', () => {
  it('emits onDraftBegun after a successful creation', () => {
    const src = worktable();
    expect(src).toMatch(/onDraftBegun\?\.\(\)/);
  });

  it('emits ONLY on a true creation, never on `exists`', () => {
    const src = worktable();
    const okBranch = src.slice(src.indexOf("if (begun.kind === 'ok')"), src.indexOf("if (begun.kind === 'exists')"));
    expect(okBranch).toMatch(/onDraftBegun\?\.\(\)/);
    const existsBranch = src.slice(src.indexOf("if (begun.kind === 'exists')"));
    expect(existsBranch).not.toMatch(/onDraftBegun/);
  });

  it('carries no payload — the parent decides which engine mounts', () => {
    expect(worktable()).toMatch(/onDraftBegun\?:\s*\(\)\s*=>\s*void/);
  });

  it('settles its own room before notifying, so an unmount cannot strand it', () => {
    const src = worktable();
    const i = src.indexOf('settle(begun);');
    const j = src.indexOf('onDraftBegun?.()');
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(i);
  });
});

describe('the parent re-reads through the one existing path', () => {
  it('has a single write-state re-read used by both triggers', () => {
    const src = canvas();
    expect(src).toMatch(/const refreshWriteState = useCallback/);
    // conversion and draft-creation both go through it
    expect(src).toMatch(/await refreshWriteState\(\)/);
    expect(src).toMatch(/onDraftBegun=\{refreshWriteState\}/);
  });

  it('re-reads rather than assuming — fetchWriteState, not a local guess', () => {
    const src = canvas();
    const fn = src.slice(src.indexOf('const refreshWriteState'), src.indexOf('const onConfirmSectionBreaks'));
    expect(fn).toMatch(/fetchWriteState\(/);
    expect(fn).toMatch(/setWriteState\(refreshed\.state\)/);
    expect(fn).not.toMatch(/section_aware/); // the parent never fabricates the answer
  });

  it('passes the callback down the existing prop chain to Worktable', () => {
    const src = canvas();
    expect(src).toMatch(/onDraftBegun: \(\) => void;/);
    expect(src).toMatch(/<Worktable[\s\S]{0,200}onDraftBegun=\{onDraftBegun\}/);
  });
});

describe('scope — the repair touches nothing it was told not to', () => {
  it('does not alter conversion behaviour', () => {
    // the NAV-01 act still exists, still gated on the write state
    expect(canvas()).toMatch(/writeState\?\.mode === 'continuous' && \(\s*<button/);
    expect(canvas()).toMatch(/data-action="confirm-section-breaks"/);
  });

  it('adds no second navigation path — sections still mount through chooseMount', () => {
    const src = canvas();
    expect(src).toMatch(/writeMount\.mount === 'sections'/);
  });
});
