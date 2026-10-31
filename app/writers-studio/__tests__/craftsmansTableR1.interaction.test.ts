/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import type { RebuildEditorialVersion } from '@/lib/writersStudio/rebuild/editorialCollaboration';

// Mount the real component with synthetic text and inert service callbacks.
// These are interaction tests, not source-string assertions or model-quality tests.
const original = 'The old red boat rests near the quiet river.';
const proposed = 'The new blue ship rests beside the living water.';
const version = (id: string, wording: string, author: 'maia' | 'member' = 'maia'): RebuildEditorialVersion => ({
  id, wording, author, supersedes: null, rationale: 'A synthetic edit for testing.',
});

describe('Craftsman Table R1 real component interactions', () => {
  let host: HTMLDivElement;
  let root: Root;
  let props: CraftsmansTableR1Props;
  let current: string;

  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    current = '';
    const v = version('v1', proposed);
    props = {
      sections: [{ draftSectionId: 'section', sourceSectionId: null, position: 0,
        heading: 'Chapter 1: Test', headingDepth: 1, headingSignal: null, body: original, editable: true }],
      bodyOf: () => original,
      held: { draftSectionId: 'section', start: 0, end: Array.from(original).length, text: original, revisionNumber: 1 },
      thread: { threadId: 'thread', chainId: 'chain', locusText: original, targetSectionId: 'section',
        sectionLabel: 'Test', legacyLocus: false, turns: [], versions: [v], headVersionId: v.id },
      version: v, busy: false, appliedVersionId: null,
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(),
      onWorkingTextChange: text => { current = text; },
    };
    await render();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
  });

  async function render(patch: Partial<CraftsmansTableR1Props> = {}) {
    props = { ...props, ...patch };
    await act(async () => { root.render(React.createElement(Table, props)); });
  }
  function button(label: string): HTMLButtonElement {
    const result = [...host.querySelectorAll('button')].find(el => el.textContent?.trim() === label);
    if (!result) throw new Error(`Missing button: ${label}`);
    return result;
  }
  async function click(label: string) {
    await act(async () => { button(label).click(); });
  }
  async function mark() {
    const target = host.querySelector<HTMLElement>('ins[data-edit-id]');
    if (!target) throw new Error('No inserted text to work with');
    await act(async () => { target.click(); });
  }
  async function type(text: string) {
    const target = host.querySelector<HTMLTextAreaElement>('textarea');
    if (!target) throw new Error('No working-copy editor');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(target, text);
      target.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('keeps the writer-selected hybrid when a newer MAIA alternative arrives', async () => {
    await mark();
    await click('Use this');
    const hybrid = current;
    expect(hybrid).toBe('The new blue ship rests near the quiet river.');
    await render({ version: version('v2', 'The weathered brown canoe rests near the quiet river.') });
    expect(current).toBe(hybrid);
    await click('Preview');
    expect(host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe(hybrid);
  });

  it('preserves locally authored wording across a new MAIA alternative', async () => {
    await mark();
    await click('Write it');
    await type('weathered blue boat');
    await click('Use my wording');
    expect(current).toBe('The weathered blue boat rests near the quiet river.');
    await render({ version: version('v2', 'The slender white canoe rests beside the living water.') });
    expect(current).toBe('The weathered blue boat rests near the quiet river.');
  });

  it('does not apply an older saved version while a different working copy is visible', async () => {
    await render({ version: version('member-v1', proposed, 'member') });
    expect(button('Apply my version').disabled).toBe(false);
    await click('Edit current hybrid');
    await type('My own newly written passage.');
    expect(button('Apply my version').disabled).toBe(true);
    await click('Use this as my working copy');
    expect(button('Apply my version').disabled).toBe(true);
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('saves the exact author-shaped copy and applies only after its saved identity matches', async () => {
    await mark();
    await click('Use this');
    const hybrid = current;
    await click('Save my version');
    expect(props.onSaveMember).toHaveBeenCalledWith(expect.objectContaining({
      threadId: 'thread', sectionId: 'section', text: hybrid,
    }));
    expect(props.onApply).not.toHaveBeenCalled();
    await render({ version: version('saved-hybrid', hybrid, 'member') });
    expect(current).toBe(hybrid);
    expect(button('Apply my version').disabled).toBe(false);
    await click('Apply my version');
    expect(props.onApply).toHaveBeenCalledTimes(1);
  });

  it('keeps original after an explicit Stet even when a fresh candidate arrives', async () => {
    await mark();
    await click('Keep mine');
    await render({ version: version('v2', 'A substantially different new candidate.') });
    expect(current).toBe(original);
    expect(props.onSaveMember).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('previews an intentional empty working copy without restoring the original', async () => {
    await click('Write from mine');
    await type('');
    await click('Use this as my working copy');
    expect(current).toBe('');
    expect(host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe('');
  });

  it('refuses saving or applying against a changed canonical passage', async () => {
    await render({ version: version('member-v1', proposed, 'member'), bodyOf: () => 'A changed canonical passage.' });
    expect(button('Apply my version').disabled).toBe(true);
    expect(button('Save my version').disabled).toBe(true);
  });

  it('keeps author-chosen wording and refuses implicit Apply after a rejected Save acknowledgment', async () => {
    await mark();
    await click('Use this');
    const chosen = current;
    const rejected = jest.fn(async () => { throw new Error('fictional Save connection lost'); });
    await render({ onSaveMember: rejected });
    await click('Save my version');
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(current).toBe(chosen);
    expect(host.textContent).toContain('Your save could not be confirmed. Your wording and choices remain here.');
    expect(button('Save my version').disabled).toBe(false);
    expect(props.onApply).not.toHaveBeenCalled();
    expect(rejected).toHaveBeenCalledTimes(1); // no automatic retry
  });

  it('keeps original author-first wording after an unconfirmed future Save callback', async () => {
    const rejected = jest.fn(async () => { throw new Error('fictional unconfirmed first save'); });
    await render({ thread: null, version: null, onSaveWorking: rejected });
    await click('Write from mine');
    await type('FICTIONAL AUTHOR FORMULATION 🜂 WITHOUT A MODEL PROPOSAL.');
    await click('Use this as my working copy');
    const composed = current;
    await click('Save my version');
    expect(rejected).toHaveBeenCalledWith(expect.objectContaining({
      threadId: null, supersedes: null, text: composed,
    }));
    expect(current).toBe(composed);
    expect(host.textContent).toContain('Your save could not be confirmed. Your wording and choices remain here.');
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('allows only one in-flight Save even when two clicks occur before React renders busy state', async () => {
    await mark();
    await click('Use this');
    let release!: (result: boolean) => void;
    const held = new Promise<boolean>(resolve => { release = resolve; });
    const callback = jest.fn(() => held);
    await render({ onSaveMember: callback });
    await act(async () => {
      const save = button('Save my version');
      save.click();
      save.click(); // same event loop, before the disabled state can render
    });
    const attemptsBeforeAck = callback.mock.calls.length;
    await act(async () => { release(false); await held; });
    expect(attemptsBeforeAck).toBe(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('keeps an uncommitted composition when switching Markup and Preview', async () => {
    await click('Write from mine');
    await type('A new draft that must not disappear.');
    await click('Markup');
    await click('Preview');
    const field = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Edit your working passage"]');
    expect(field?.value ?? host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe('A new draft that must not disappear.');
  });
});
