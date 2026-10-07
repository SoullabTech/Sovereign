/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import FocusTools from '@/app/dev/writers-studio-pc3-live/CraftFocusToolsR1';
import { makeCraftTarget, type CraftTablePort } from '@/lib/writersStudio/craftFocusR1';

const original = 'Fire awakens. We notice a spark.';
const amplifying = 'Fire then moves into Amplifying. We encounter other people.';
const body = original + '\n\n' + amplifying;

describe('Focus gate on actual mounted Craft components', () => {
  let host: HTMLDivElement; let root: Root; let port: CraftTablePort | null;
  let props: CraftsmansTableR1Props; let working: string;
  const section = { draftSectionId: 'fire', sourceSectionId: null, position: 0,
    heading: 'Fire', headingDepth: 2 as const, headingSignal: null, body, editable: true };
  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
    port = null; working = '';
    const v = { id: 'v1', author: 'maia' as const, wording: original.replace('notice', 'feel'), supersedes: null, rationale: 'Test one verb.' };
    props = { sections: [section], bodyOf: () => body,
      held: { draftSectionId: 'fire', start: 0, end: original.length, text: original, revisionNumber: 1 },
      thread: { threadId: 'thread', chainId: 'chain', targetSectionId: 'fire', sectionLabel: 'Fire', locusText: original,
        legacyLocus: false, turns: [], versions: [v], headVersionId: v.id },
      version: v, appliedVersionId: null, busy: false, onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(),
      onWorkingTextChange: text => { working = text; }, onConnect: value => { port = value; }, onReceipt: jest.fn(),
    };
    await render();
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); window.sessionStorage.clear(); });
  async function render(patch: Partial<CraftsmansTableR1Props> = {}) {
    props = { ...props, ...patch };
    await act(async () => root.render(React.createElement(Table, props)));
  }
  async function click(text: string) {
    const b = [...host.querySelectorAll('button')].find(b => b.textContent?.trim() === text);
    if (!b) throw new Error('Button absent: ' + text);
    await act(async () => b.click());
  }
  async function type(text: string) {
    const field = host.querySelector('textarea')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, text);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  it('settles the original visibly and reports a fact, without saving or applying', async () => {
    await act(async () => { expect(port!.keepOriginal('notice').ok).toBe(true); });
    expect(working).toBe(original);
    expect(host.querySelector('[data-craft-settled-choices]')?.textContent).toContain('notice');
    expect(host.querySelector('.p4r1-craft-r1-locus del')).toBeNull();
    expect(host.querySelector('.p4r1-craft-r1-locus ins')).toBeNull();
    expect(props.onReceipt).toHaveBeenCalledWith(expect.objectContaining({ ok: true, message: '“notice” kept for this pass. Manuscript unchanged.' }));
    expect(props.onApply).not.toHaveBeenCalled(); expect(props.onSaveMember).not.toHaveBeenCalled();
  });
  it('retains an unfinished author draft and its editor when focus returns', async () => {
    await click('Write from mine');
    await type(original + ' My own addition.');
    const held = port!.snapshot()!;
    const target = makeCraftTarget(section, body, amplifying, 1, 'writer')!;
    await render({ held: { draftSectionId: 'fire', ...target }, thread: null, version: null, restoreSnapshot: null });
    expect(working).toBe(amplifying);
    await render({ held: { draftSectionId: 'fire', start: 0, end: original.length, text: original, revisionNumber: 1 },
      thread: null, version: null, restoreSnapshot: held });
    expect(host.querySelector<HTMLTextAreaElement>('.p4r1-craft-r1-direct')?.value).toBe(original + ' My own addition.');
    expect(working).toBe(original + ' My own addition.');
    expect(props.onApply).not.toHaveBeenCalled(); expect(props.onSaveMember).not.toHaveBeenCalled();
  });
  it('uses exact literal conversation replacements only in working copy', async () => {
    await act(async () => { expect(port!.replaceWorking('notice', 'sense').ok).toBe(true); });
    expect(working).toBe(original.replace('notice', 'sense'));
    expect(body).toContain('notice');
    expect(props.onApply).not.toHaveBeenCalled(); expect(props.onSaveMember).not.toHaveBeenCalled();
    expect(props.onReceipt).toHaveBeenCalledWith({ ok: true, message: 'Working copy updated. Not applied to the manuscript.' });
  });
  it('will not use a stale target as authority for an editing command', async () => {
    await render({ bodyOf: () => body.replace('notice', 'feel') });
    await act(async () => { expect(port!.keepOriginal('notice').ok).toBe(false); });
    expect(props.onApply).not.toHaveBeenCalled();
  });
  it('selects words on the manuscript and requires Work here before moving', async () => {
    const onMove = jest.fn(() => true);
    const target = makeCraftTarget(section, body, original, 1, 'writer')!;
    await render({ focusTools: React.createElement(FocusTools, { sections: [section], bodyOf: () => body,
      revisionNumber: 1, current: target, busy: false, receipt: null, onMove, onStay: jest.fn(), onAsk: jest.fn() }) });
    const paragraph = [...host.querySelectorAll('.p4r1-craft-r1-context p')].find(p => p.textContent === amplifying)!;
    expect(paragraph).toBeTruthy();
    const range = document.createRange(); range.selectNodeContents(paragraph);
    await act(async () => {
      window.getSelection()!.removeAllRanges(); window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });
    expect(onMove).not.toHaveBeenCalled();
    expect(host.querySelector('[data-craft-selection-candidate]')?.textContent).toContain('Amplifying');
    await click('Work here');
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ sectionId: 'fire', text: amplifying, start: original.length + 2 }));
  });
  it('restores chosen mark decisions when the original editorial thread returns with the focus', async () => {
    const initialThread = props.thread; const initialVersion = props.version;
    await act(async () => (host.querySelector('ins[data-edit-id]') as HTMLElement).click());
    await click('Use this');
    expect(working).toBe(original.replace('notice', 'feel'));
    const saved = port!.snapshot()!;
    const target = makeCraftTarget(section, body, amplifying, 1, 'writer')!;
    await render({ held: { draftSectionId: 'fire', ...target }, thread: null, version: null, restoreSnapshot: null });
    await render({ held: { draftSectionId: 'fire', start: 0, end: original.length, text: original, revisionNumber: 1 },
      thread: initialThread, version: initialVersion, restoreSnapshot: saved });
    expect(working).toBe(original.replace('notice', 'feel'));
    expect(props.onApply).not.toHaveBeenCalled();
  });

});
