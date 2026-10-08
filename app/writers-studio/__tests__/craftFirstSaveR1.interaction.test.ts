/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import { savedCraftSnapshot, hasUnsavedCraftWork } from '@/lib/writersStudio/craftSaveR1';
import type { CraftTablePort } from '@/lib/writersStudio/craftFocusR1';

const original = 'A first movement.\n\nA second movement.';
const own = '🜂 A writer’s own movement.\n\nThe exact spaces stay.  ';
const held = { draftSectionId: 'section', start: 0, end: Array.from(original).length, text: original, revisionNumber: 2 };
const member = { id: 'member-version', author: 'member' as const, wording: own, supersedes: null, rationale: null };
const thread = { threadId: 'thread', chainId: 'chain', targetSectionId: 'section', sectionLabel: 'Section',
  locusText: original, legacyLocus: false, turns: [], versions: [member], headVersionId: member.id };

describe('Writer-first Save on the actual table', () => {
  let host: HTMLDivElement, root: Root, props: CraftsmansTableR1Props, port: CraftTablePort | null, working: string;
  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
    working = ''; port = null;
    props = { sections: [{ draftSectionId: 'section', sourceSectionId: null, heading: 'Section', headingDepth: 2,
      headingSignal: null, position: 0, editable: true, body: original }], bodyOf: () => original,
      held, thread: null, version: null, appliedVersionId: null, busy: false,
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onSaveWorking: jest.fn(async () => true), onApply: jest.fn(),
      onReceipt: jest.fn(), onConnect: p => { port = p; }, onWorkingTextChange: t => { working = t; } };
    await render();
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); sessionStorage.clear(); });
  async function render(patch: Partial<CraftsmansTableR1Props> = {}) {
    props = { ...props, ...patch }; await act(async () => root.render(React.createElement(Table, props)));
  }
  async function click(label: string) {
    const b = [...host.querySelectorAll('button')].find(b => b.textContent?.trim() === label);
    if (!b) throw new Error('No button ' + label); await act(async () => b.click());
  }
  async function write(text: string) {
    await click('Write here'); const field = host.querySelector('textarea')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, text);
      field.dispatchEvent(new Event('input', { bubbles: true })); });
    await click('Use this as my working copy');
  }
  it.each([own, ''])('saves exact writer-created wording without a thread, proposal or model (%j)', async text => {
    await write(text); await click('Save my version');
    expect(props.onSaveWorking).toHaveBeenCalledWith({ held, threadId: null, supersedes: null, text, kept: [] });
    expect(props.onSend).not.toHaveBeenCalled(); expect(props.onSaveMember).not.toHaveBeenCalled(); expect(props.onApply).not.toHaveBeenCalled();
    expect(working).toBe(text);
  });
  it('saves a writer/MAIA hybrid with the exact proposal predecessor, not a new root', async () => {
    const proposal = { id: 'maia-version', author: 'maia' as const, wording: original.replace('first', 'new'), supersedes: null, rationale: 'A proposed word.' };
    await render({ thread: { ...thread, versions: [proposal], headVersionId: proposal.id }, version: proposal });
    await act(async () => (host.querySelector('ins[data-edit-id]') as HTMLElement).click());
    await click('Use this');
    expect(working).toBe(proposal.wording);
    await click('Close');
    await write(proposal.wording + ' My own ending.');
    await click('Save my version');
    expect(props.onSaveWorking).toHaveBeenCalledWith({ held, threadId: 'thread', supersedes: 'maia-version', text: proposal.wording + ' My own ending.', kept: [] });
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('does not call an unfinished composition a saved draft', async () => {
    await click('Write here');
    expect(host.querySelector('.p4r1-craft-r1-footer')?.textContent).toContain('Editing a local draft');
    expect(props.onSaveWorking).not.toHaveBeenCalled();
  });
  it('keeps exact text on a failed Save and does not announce success', async () => {
    await render({ onSaveWorking: jest.fn(async () => false) }); await write(own); await click('Save my version');
    expect(working).toBe(own);
    expect(host.textContent).toContain('save could not be confirmed');
    expect(hasUnsavedCraftWork(port!.snapshot()!)).toBe(true);
  });
  it('recognizes a verified writer version and disables duplicate Save', async () => {
    await write(own); await click('Save my version'); await render({ thread, version: member });
    expect(working).toBe(own);
    expect(host.querySelector('.p4r1-craft-r1-footer')?.textContent).toContain('Your working version is saved.');
    const save = [...host.querySelectorAll('button')].find(b => b.textContent === 'Save my version')!;
    expect(save.disabled).toBe(true); expect(hasUnsavedCraftWork(port!.snapshot()!)).toBe(false);
    expect(props.onApply).not.toHaveBeenCalled();
  });
  it('a new table opened from the server-read member version recovers the same text for MAIA', async () => {
    await act(async () => root.unmount()); root = createRoot(host);
    await render({ thread, version: member });
    expect(working).toBe(own); expect(port!.snapshot()!.workingText).toBe(own);
    expect(host.textContent).toContain('Your working version is saved.');
  });
  it('explicit saved-version return works at the same focus and survives Preview', async () => {
    await render({ thread, version: member, restoreSnapshot: savedCraftSnapshot(held, member) });
    expect(working).toBe(own); await click('Preview');
    expect(host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe(own);
    expect(props.onApply).not.toHaveBeenCalled();
  });
  it('saves an explicitly kept decision even when the wording is unchanged, and restores it from server metadata', async () => {
    await act(async () => { port!.keepOriginal('first'); });
    const kept = [{ start: 2, end: 7, text: 'first' }];
    expect(working).toBe(original);
    expect(hasUnsavedCraftWork(port!.snapshot()!)).toBe(true);
    await click('Save my version');
    expect(props.onSaveWorking).toHaveBeenCalledWith({ held, threadId: null, supersedes: null, text: original, kept });
    const saved = { ...member, wording: original, craftKept: kept };
    await act(async () => root.unmount()); root = createRoot(host);
    await render({ thread: { ...thread, versions: [saved] }, version: saved, restoreSnapshot: savedCraftSnapshot(held, saved) });
    expect(port!.snapshot()!.kept).toEqual(kept);
    expect(host.querySelector('[data-craft-settled-choices]')?.textContent).toContain('first');
    expect(working).toBe(original); expect(hasUnsavedCraftWork(port!.snapshot()!)).toBe(false);
    await click('Reopen');
    expect(port!.snapshot()!.kept).toEqual([]);
    expect(hasUnsavedCraftWork(port!.snapshot()!)).toBe(true);
    await click('Save my version');
    expect(props.onSaveWorking).toHaveBeenLastCalledWith({ held, threadId: 'thread', supersedes: saved.id, text: original, kept: [] });
    expect(props.onSend).not.toHaveBeenCalled(); expect(props.onApply).not.toHaveBeenCalled();
  });

  it('keeps Undo visible and renders actual applied text after retargeting without pending edit marks', async () => {
    const undo = jest.fn();
    await render({ held: { ...held, end: Array.from(own).length, text: own, revisionNumber: 3 },
      bodyOf: () => own, thread: { ...thread, application: { authorizationId: 'auth', versionId: member.id, resultingVersion: 3, undone: false, canUndo: true } },
      version: member, appliedVersionId: member.id, onUndo: undo });
    expect(host.querySelector('.p4r1-craft-r1-locus')?.textContent).toBe(own);
    expect(host.querySelector('.p4r1-craft-r1-footer')?.textContent).toContain('Applied to the manuscript.');
    expect(host.querySelector('del[data-edit-id],ins[data-edit-id]')).toBeNull();
    await click('Undo'); expect(undo).toHaveBeenCalledTimes(1);
    expect(props.onApply).not.toHaveBeenCalled();
  });
  it('keeps Undo reachable when an applied deletion has no remaining focus text', async () => {
    const empty = { ...member, wording: '' }, undo = jest.fn();
    await render({ held: null, bodyOf: () => '', thread: { ...thread, versions: [empty] },
      version: empty, appliedVersionId: empty.id, onUndo: undo });
    await click('Undo'); expect(undo).toHaveBeenCalledTimes(1);
  });



});
