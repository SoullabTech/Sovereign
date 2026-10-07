/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Table, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';

const before = 'Fire begins as a possibility that invites us into life.';
const original = 'Others deepen as we become increasingly aware of what brings coherence and vitality.';
const after = 'Actualization does not mean perfection. It begins shaping the way we live.';
const body = `${before}\n\n${original}\n\n${after}`;
const proposal = original.replace('increasingly ', '');
const rectangle = (top: number, bottom: number) => ({ x: 0, y: top, top, bottom, left: 0, right: 700,
  width: 700, height: bottom - top, toJSON() { return {}; } }) as DOMRect;

describe('Opening an editorial mark stays at the passage and never accepts it', () => {
  let host: HTMLDivElement, root: Root, props: CraftsmansTableR1Props, working: string;
  beforeEach(async () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    HTMLElement.prototype.scrollIntoView = jest.fn();
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
    working = '';
    props = {
      sections: [{ draftSectionId: 'fire', sourceSectionId: null, position: 0, heading: 'Fire',
        headingDepth: 2, headingSignal: null, editable: true, body }],
      bodyOf: () => body,
      held: { draftSectionId: 'fire', start: before.length + 2, end: before.length + 2 + original.length,
        text: original, revisionNumber: 1 },
      thread: null,
      version: { id: 'proposal', author: 'maia', wording: proposal, supersedes: null, rationale: 'One optional deletion.' },
      busy: false, appliedVersionId: null,
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(),
      onWorkingTextChange: text => { working = text; },
    };
    await act(async () => root.render(React.createElement(Table, props)));
  });
  afterEach(async () => { await act(async () => root.unmount()); host.remove(); jest.restoreAllMocks(); });
  const mark = () => host.querySelector<HTMLElement>('.p4r1-craft-r1-locus del[data-edit-id]')!;
  const controls = () => host.querySelector<HTMLElement>('[data-craft-local-edit]')!;
  async function click(label: string) {
    const button = [...host.querySelectorAll('button')].find(b => b.textContent?.trim() === label);
    if (!button) throw new Error('Missing button: ' + label);
    await act(async () => button.click());
  }
  const isBefore = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

  it('places controls after the focus but before following context, without changing any wording', async () => {
    await act(async () => mark().click());
    const following = [...host.querySelectorAll('.p4r1-craft-r1-context p')].find(p => p.textContent === after)!;
    expect(controls()).not.toBeNull();
    expect(isBefore(mark(), controls())).toBe(true);
    expect(isBefore(controls(), following)).toBe(true);
    expect(controls().textContent).toContain('Use this');
    expect(controls().textContent).toContain('Write it');
    expect(working).toBe(original);
    expect(props.onSend).not.toHaveBeenCalled();
    expect(props.onSaveMember).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it.each(['Enter', ' '])('opens the same controls from keyboard %p', async key => {
    expect(mark().getAttribute('role')).toBe('button');
    expect(mark().tabIndex).toBe(0);
    await act(async () => mark().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
    expect(controls()).not.toBeNull();
    expect(mark().getAttribute('aria-expanded')).toBe('true');
    expect(working).toBe(original);
  });

  it('reveals controls in the manuscript scroll pane even when the same mark is clicked again', async () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      if (this.matches('.p4r1-craft-r1-scroll')) return rectangle(150, 700);
      if (this.matches('.p4r1-craft-r1-footer')) return rectangle(660, 700);
      if (this.matches('[data-craft-local-edit]')) return rectangle(850, 1070);
      return rectangle(0, 0);
    });
    const scroll = host.querySelector<HTMLElement>('.p4r1-craft-r1-scroll')!;
    await act(async () => mark().click());
    expect(scroll.scrollTop).toBeGreaterThan(0);
    scroll.scrollTop = 0;
    await act(async () => mark().click());
    expect(scroll.scrollTop).toBeGreaterThan(0);
    expect(working).toBe(original);
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('closes with Escape and returns focus to the mark without accepting the edit', async () => {
    await act(async () => mark().click());
    await act(async () => controls().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(controls()).toBeNull();
    expect(document.activeElement).toBe(mark());
    expect(working).toBe(original);
  });

  it('Use this remains a separate working-copy choice, never a manuscript Apply', async () => {
    await act(async () => mark().click());
    expect(working).toBe(original);
    await click('Use this');
    expect(working).toBe(proposal);
    expect(props.onSaveMember).not.toHaveBeenCalled();
    expect(props.onApply).not.toHaveBeenCalled();
  });

  it('Write it opens an editable local alternative; no change until Use my wording', async () => {
    await act(async () => mark().click());
    await click('Write it');
    const input = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Write your wording for this edit"]')!;
    expect(input).not.toBeNull();
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, 'more deeply ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(working).toBe(original);
    await click('Use my wording');
    expect(working).toBe(original.replace('increasingly ', 'more deeply '));
    expect(props.onApply).not.toHaveBeenCalled();
  });
});
