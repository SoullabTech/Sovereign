/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';

const before = 'A possibility opens before us, inviting attention toward a different\nway of participating in ordinary life.';
const original = 'The possibility gathers energy as we bring it into conversation with\nother people, try something unfamiliar, and listen to what changes.\nSome ideas grow clearer in a real encounter.';
const after = 'Eventually, something that began as a possibility takes a place in our\nordinary actions and changes the way we participate in the world.';
const body = before + '\n' + original + '\n' + after;
const cp = (text: string) => Array.from(text).length;

describe('Selecting a Craft passage keeps the prose and opens actual editing tools', () => {
  let host: HTMLDivElement, root: Root, props: CraftsmansTableR1Props, working: string;
  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
    working = '';
    props = {
      sections: [{ draftSectionId: 'section', sourceSectionId: null, heading: 'A movement', headingDepth: 2,
        headingSignal: null, position: 0, editable: true, body }],
      bodyOf: () => body,
      held: { draftSectionId: 'section', start: cp(before + '\n'), end: cp(before + '\n' + original), text: original, revisionNumber: 1 },
      thread: null, version: null, appliedVersionId: null, busy: false,
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(),
      onWorkingTextChange: text => { working = text; },
    };
    await render();
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
  async function render(patch: Partial<CraftsmansTableR1Props> = {}) {
    props = { ...props, ...patch };
    await act(async () => root.render(React.createElement(Table, props)));
  }
  async function click(label: string) {
    const button = [...host.querySelectorAll('button')].find(b => b.textContent?.trim() === label);
    if (!button) throw new Error('Missing action: ' + label);
    await act(async () => button.click());
  }

  it('renders normal before/focus/after paragraphs with a focus bracket and no invented edit', () => {
    expect(host.querySelector('[data-craft-focus-bracket]')).not.toBeNull();
    const contexts = [...host.querySelectorAll('.p4r1-craft-r1-context p')].map(p => p.textContent);
    expect(contexts).toContain(before);
    expect(contexts).toContain(after);
    expect(host.querySelector('.p4r1-craft-r1-active-paragraph')?.getAttribute('data-prose-reflow')).toBe('true');
    expect(host.querySelector('.p4r1-craft-r1-locus')?.textContent).toBe(original);
    expect(host.querySelector('ins[data-edit-id],del[data-edit-id]')).toBeNull();
    expect(host.querySelector('.p4r1-craft-r1-margin')).toBeNull();
    expect(host.querySelector('[data-craft-focus-actions]')?.textContent).toContain('Passage selected · no proposed edits yet.');
    expect(props.onSend).not.toHaveBeenCalled();
    expect(working).toBe(original);
  });

  it('makes Suggest an edit a single explicit marked-proposal request, not Apply', async () => {
    await click('Suggest an edit');
    expect(props.onSend).toHaveBeenCalledTimes(1);
    expect(props.onSend).toHaveBeenCalledWith(expect.stringContaining('exact focused passage'), expect.objectContaining({
      proposalPolicy: 'require', proposalRequested: true, displayText: 'Suggest one small edit to this focused passage.',
    }));
    expect(working).toBe(original);
    expect(props.onSaveMember).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('keeps Discuss read-only and tied to the same selected text', async () => {
    await click('Discuss');
    expect(props.onSend).toHaveBeenCalledWith(expect.stringContaining('Do not draft or change any wording'), expect.objectContaining({ proposalPolicy: 'reply_only' }));
    expect(working).toBe(original);
  });

  it('opens Write here immediately with exact writer text, not an earlier proposal', async () => {
    await click('Write here');
    expect(host.querySelector<HTMLTextAreaElement>('.p4r1-craft-r1-direct')?.value).toBe(original);
    expect(host.querySelector('.p4r1-craft-r1-direct-actions')?.textContent).toContain('Use this as my working copy');
    expect(props.onSend).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('renders actual replacement marks only when a candidate is supplied', async () => {
    const v = { id: 'proposal', author: 'maia' as const, wording: original.replace('gathers', 'gains'), supersedes: null, rationale: 'One local verb.' };
    await render({ version: v });
    expect(host.querySelector('del[data-edit-id]')?.textContent).toBe('gathers');
    expect(host.querySelector('ins[data-edit-id]')?.textContent).toBe('gains');
    expect(working).toBe(original);
    await click('Preview');
    expect(host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe(original);
  });

  it('keeps distinct paragraph gaps for a focus spanning more than one paragraph', async () => {
    const text = 'A first paragraph.\n\nA second paragraph.';
    await render({ bodyOf: () => text, held: { draftSectionId: 'section', start: 0, end: cp(text), text, revisionNumber: 1 } });
    expect(host.querySelector('.p4r1-craft-r1-locus')?.textContent).toBe(text);
    expect(host.querySelectorAll('[data-craft-paragraph-break]')).toHaveLength(1);
    await click('Preview');
    expect(host.querySelector('.p4r1-craft-r1-preview')?.textContent).toBe(text);
    expect(working).toBe(text);
  });

  it('shows an inserted paragraph break without changing the source or existing paragraph gaps', async () => {
    const base = 'A first movement.';
    const v = { id: 'paragraph-proposal', author: 'maia' as const, wording: base + '\n\nAnother movement follows.', supersedes: null, rationale: 'Two paragraphs.' };
    await render({ bodyOf: () => base, held: { draftSectionId: 'section', start: 0, end: cp(base), text: base, revisionNumber: 1 }, version: v });
    expect(host.querySelector('ins [data-craft-paragraph-break]')).not.toBeNull();
    expect(working).toBe(base);
  });

  it('blocks action dispatch while another request is in progress', async () => {
    await render({ busy: true });
    await click('Suggest an edit');
    await click('Discuss');
    await click('Write here');
    expect(props.onSend).not.toHaveBeenCalled();
    expect(host.querySelector('textarea')).toBeNull();
  });
});
