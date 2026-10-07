/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import { parseCraftCanvasCommand, type CraftTablePort } from '@/lib/writersStudio/craftFocusR1';

const original = 'Water begins with Being. It asks us to become present with what we are actually feeling.';

describe('Explicit conversational restoration is an action, not a new model proposal', () => {
  it.each([
    ['yes put become back', 'become'], ['Yes, put “become” back.', 'become'],
    ['Please put "become present" back in my working copy.', 'become present'],
    ['Restore become.', 'become'], ['Restore “become”.', 'become'],
    ['Put become back and leave the rest as it is.', 'become'],
  ])('recognizes only the writer command %s', (text, word) => {
    expect(parseCraftCanvasCommand(text)).toEqual({ kind: 'restore', word });
  });
  it.each([
    'yes', 'Put it back.', 'Restore that.', 'Should we put become back?',
    'Yes, put become back?', 'Put become back if it fits.', 'Put become back later.',
    'Put become back only after I approve.', 'Do not put become back.',
    'Explain why I should put become back.', 'She said "put become back".',
    '"put become back"', '> put become back', 'Put become back and rewrite everything.',
    'Restore become and apply it to the manuscript.', 'Put “become" back.',
  ])('does not execute uncertainty, quotation, deferral, ambiguous pronouns or extra acts: %s', text => {
    expect(parseCraftCanvasCommand(text)).toBeNull();
  });

  let host: HTMLDivElement; let root: Root; let port: CraftTablePort | null;
  let props: CraftsmansTableR1Props; let working: string;
  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
    port = null; working = '';
    const version = { id: 'proposal', author: 'maia' as const,
      wording: original.replace('become', 'be'), supersedes: null, rationale: 'A proposed change.' };
    props = { sections: [{ draftSectionId: 'water', sourceSectionId: null, position: 0,
      heading: 'Water', headingDepth: 2, headingSignal: null, body: original, editable: true }],
      bodyOf: () => original,
      held: { draftSectionId: 'water', start: 0, end: original.length, text: original, revisionNumber: 2 },
      thread: { threadId: 'thread', chainId: 'chain', targetSectionId: 'water', sectionLabel: 'Water',
        locusText: original, legacyLocus: false, turns: [], versions: [version], headVersionId: version.id },
      version, appliedVersionId: null, busy: false, onSend: jest.fn(), onApply: jest.fn(),
      onSaveMember: jest.fn(async () => true), onWorkingTextChange: text => { working = text; },
      onConnect: p => { port = p; }, onReceipt: jest.fn() };
    await render();
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); window.sessionStorage.clear(); });
  async function render(patch: Partial<CraftsmansTableR1Props> = {}) {
    props = { ...props, ...patch }; await act(async () => root.render(React.createElement(Table, props)));
  }
  async function click(label: string) {
    const button = [...host.querySelectorAll('button')].find(b => b.textContent?.trim() === label);
    if (!button) throw new Error('Missing button: ' + label);
    await act(async () => button.click());
  }
  async function acceptSuggestion() {
    await act(async () => (host.querySelector('del[data-edit-id]') as HTMLElement).click());
    await click('Use this');
    expect(working).toBe(original.replace('become', 'be'));
  }
  async function restore() {
    const command = parseCraftCanvasCommand('yes put become back');
    if (!command || command.kind !== 'restore') throw new Error('The request did not become a canvas action');
    await act(async () => { expect(port!.keepOriginal(command.word, 'restore').ok).toBe(true); });
  }
  it('restores a chosen replacement immediately in working text and Preview, without model, save or Apply', async () => {
    await acceptSuggestion(); await restore();
    expect(working).toBe(original);
    expect(host.querySelector('[data-craft-settled-choices]')?.textContent).toContain('become');
    expect(host.querySelector('ins[data-edit-id],del[data-edit-id]')).toBeNull();
    expect(props.onReceipt).toHaveBeenLastCalledWith(expect.objectContaining({ ok: true,
      message: '“become” restored in your working copy and kept for this pass. Not applied to the manuscript.' }));
    await click('Preview'); expect(host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe(original);
    expect(props.onSend).not.toHaveBeenCalled(); expect(props.onApply).not.toHaveBeenCalled();
    expect(props.onSaveMember).not.toHaveBeenCalled();
  });
  it('keeps an unrelated writer alteration while restoring only the requested original word', async () => {
    await acceptSuggestion();
    await act(async () => { expect(port!.replaceWorking('actually', 'directly').ok).toBe(true); });
    await restore(); expect(working).toBe(original.replace('actually', 'directly'));
    expect(props.onApply).not.toHaveBeenCalled();
  });
  it('reports a repeat as already present rather than claiming a second text change', async () => {
    await acceptSuggestion(); await restore(); await restore();
    expect(working).toBe(original);
    expect(props.onReceipt).toHaveBeenLastCalledWith(expect.objectContaining({ ok: true,
      message: '“become” is already in your working copy; kept for this pass. Manuscript unchanged.' }));
  });
  it('refuses a word outside the focus instead of performing a global replacement', async () => {
    await act(async () => { expect(port!.keepOriginal('Amplifying', 'restore').ok).toBe(false); });
    expect(working).toBe(original); expect(props.onSend).not.toHaveBeenCalled();
  });
  it('will not restore under a stale canonical locus', async () => {
    await acceptSuggestion(); await render({ bodyOf: () => original.replace('Being', 'Attention') });
    await act(async () => { expect(port!.keepOriginal('become', 'restore').ok).toBe(false); });
    expect(working).toBe(original.replace('become', 'be')); expect(props.onApply).not.toHaveBeenCalled();
  });
});
