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
 * WHAT THIS SUITE IS. Unit assertions over `chooseMount`, plus STRUCTURAL
 * assertions that read the source and check the wiring. It is a regression
 * guard, NOT a behavioural reproduction of the defect: nothing here mounts a
 * component or observes a re-render. The decisive acceptance is the production
 * walk — fresh import, no manual reload, a middle section opens.
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
  it('notifies after creating the draft', () => {
    const src = worktable();
    const ok = src.slice(src.indexOf("if (begun.kind === 'ok')"), src.indexOf("if (begun.kind === 'exists')"));
    expect(ok).toMatch(/onWriteAuthorityChanged\?\.\(\)/);
  });

  /* R1 — the race that reproduced the defect through the other branch.
     Two tabs both read no_draft; A creates the draft, B gets 409 -> `exists`,
     B loads the draft successfully and settles. B's parent still holds
     no_draft. An earlier draft asserted the callback must NEVER fire here,
     on the reasoning that B "is not stale on our account" — but staleness is
     not about authorship. B's successful load is proof the parent's answer is
     obsolete. */
  it('ALSO notifies when another session created it first and the load succeeds', () => {
    const src = worktable();
    const exists = src.slice(src.indexOf("if (begun.kind === 'exists')"));
    const untilNextBranch = exists.slice(0, exists.indexOf("if (begun.kind === 'unreadable')"));
    expect(untilNextBranch).toMatch(/settle\(again\);[\s\S]{0,120}onWriteAuthorityChanged\?\.\(\)/);
  });

  it('does NOT notify when the draft could not be established', () => {
    const src = worktable();
    const exists = src.slice(src.indexOf("if (begun.kind === 'exists')"));
    const failurePaths = exists.slice(exists.indexOf("if (again.kind === 'unreadable')"), exists.indexOf("if (begun.kind === 'unreadable')"));
    expect(failurePaths).not.toMatch(/onWriteAuthorityChanged/);
  });

  it('is named for what it means — read again, not what happened here', () => {
    expect(worktable()).toMatch(/onWriteAuthorityChanged\?:\s*\(\)\s*=>\s*void/);
  });

  it('carries no payload — the parent decides which engine mounts', () => {
    const src = worktable();
    expect(src).not.toMatch(/onWriteAuthorityChanged\?\.\([^)]+\)/);
  });

  it('settles its own room before notifying, so an unmount cannot strand it', () => {
    const src = worktable();
    const i = src.indexOf('settle(begun);');
    const j = src.indexOf('onWriteAuthorityChanged?.()');
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
    expect(src).toMatch(/onWriteAuthorityChanged=\{refreshWriteState\}/);
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
    expect(src).toMatch(/onWriteAuthorityChanged: \(\) => void;/);
    expect(src).toMatch(/<Worktable[\s\S]{0,240}onWriteAuthorityChanged=\{onWriteAuthorityChanged\}/);
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
