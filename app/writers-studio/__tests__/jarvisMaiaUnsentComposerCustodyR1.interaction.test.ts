/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import MaiaCraftCompanionR1, {
  type MaiaCraftCompanionR1Props,
  type MaiaCraftComposerPort,
} from '@/app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1';

const focus = {
  sectionId: 'fiction-section', start: 0, end: 26,
  text: 'The fictional lantern glows', revisionNumber: 1,
  label: 'The fictional lantern', sectionLabel: 'A fictional work',
  source: 'writer' as const,
};
const intention = 'FICTIONAL PRIVATE UNSENT WRITER INTENTION 🜂';

describe('JARVIS MAIA unsent message custody — actual component, inert services', () => {
  let node: HTMLDivElement;
  let root: Root;
  let props: MaiaCraftCompanionR1Props;
  let port: MaiaCraftComposerPort | null;
  let send: jest.Mock;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    node = document.createElement('div');
    document.body.appendChild(node);
    root = createRoot(node);
    send = jest.fn();
    port = null;
    props = {
      title: 'A fictional work', thread: null, version: null, lastMaiaTurn: null,
      busy: false, message: null, activity: null,
      currentFocus: focus, dialogue: [], editLatitude: 1,
      onEditLatitude: jest.fn(), mayRemoveParagraphs: false,
      onMayRemoveParagraphs: jest.fn(), mayProposeImmediately: false,
      onMayProposeImmediately: jest.fn(),
      sessionPosture: { resolved: true, sanctuary: false },
      onChooseSessionPosture: jest.fn(), onDepth: jest.fn(), onReturn: jest.fn(),
      onSend: send,
      onConnect: next => { port = next; },
    };
  });
  afterEach(() => {
    act(() => root.unmount());
    node.remove();
  });
  function show(patch: Partial<MaiaCraftCompanionR1Props> = {}) {
    props = { ...props, ...patch };
    act(() => root.render(React.createElement(MaiaCraftCompanionR1, props)));
  }
  function type(text: string) {
    const field = node.querySelector<HTMLTextAreaElement>('textarea[aria-label="Talk with MAIA about the writing"]');
    expect(field).not.toBeNull();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, text);
      field!.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  function button(label: string): HTMLButtonElement {
    const b = [...node.querySelectorAll('button')].find(x => x.textContent?.trim() === label);
    if (!b) throw Error('Missing button: ' + label);
    return b;
  }
  function click(label: string) { act(() => button(label).click()); }
  function currentText() {
    return node.querySelector<HTMLTextAreaElement>('textarea[aria-label="Talk with MAIA about the writing"]')?.value;
  }

  it('never clears exact private author words merely because a void send callback ran', () => {
    show(); type(intention);
    click('Work it through');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][1]).toMatchObject({ displayText: intention });
    show({ message: 'FICTIONAL SERVICE REFUSED; NOTHING WAS SENT' });
    expect(currentText()).toBe(intention);
    expect(node.textContent).toContain('FICTIONAL SERVICE REFUSED');
    expect(node.textContent).toContain('delivery is not confirmed');
    expect(port?.snapshot()?.text).toBe(intention);
    expect(port?.snapshot()?.requestUnconfirmed).toBe(true);
    expect(node.querySelector('[data-maia-unsent-send-receipt]')).not.toBeNull();
  });

  it('shows the writer exact literal intention as You without exposing private prompt scaffolding', () => {
    show();
    const literal = '  FICTIONAL AUTHOR LANGUAGE 🜂\n  Keep every written space.  ';
    type(literal);
    click('Work it through');
    const visible = node.querySelector<HTMLElement>('.p4r1-maia-craft-r1-transcript [data-speaker="writer"]');
    expect(visible).not.toBeNull();
    expect(visible?.querySelector('p')?.textContent).toBe(literal);
    expect(visible?.textContent).toContain('Not confirmed');
    expect(visible?.textContent).not.toContain('Keep our conversation in view');
    // R10 relational Craft contract: the prompt scaffolding belongs to the
    // SERVER's system instruction. The client sends only the writer's own
    // words (never the private scaffold) plus a structured plan, so the scaffold
    // cannot leak into author text, the visible transcript or a retry.
    expect(send.mock.calls[0]?.[0]).toBe(literal);
    expect(send.mock.calls[0]?.[0]).not.toContain('Keep our conversation in view');
    expect(send.mock.calls[0]?.[1]).toMatchObject({ displayText: literal });
    expect(currentText()).toBe(literal); // still edit-ready
  });

  it('orders actual MAIA replies around a local unconfirmed You attempt without echoing stored scaffolding', () => {
    const before = { key: 'maia:fiction-thread:0', speaker: 'maia' as const, body: 'FICTIONAL EARLIER MAIA REPLY' };
    const after = { key: 'maia:fiction-thread:2', speaker: 'maia' as const, body: 'FICTIONAL LATER MAIA REPLY' };
    show({ dialogue: [before] });
    type(intention); click('Work it through');
    show({ dialogue: [before, after] });
    const shown = [...node.querySelectorAll<HTMLElement>('.p4r1-maia-craft-r1-transcript [data-speaker]')];
    expect(shown.map(x => x.dataset.speaker)).toEqual(['maia', 'writer', 'maia']);
    expect(shown[1]?.querySelector('p')?.textContent).toBe(intention);
    expect(shown[1]?.textContent).toContain('Not confirmed');
    expect(shown.map(x => x.textContent).join(' ')).not.toContain('Keep our conversation in view');
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('does not resurrect prior locally attempted words after Sanctuary and return to Ordinary', () => {
    show(); type(intention); click('Work it through');
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(1);
    show({ sessionPosture: { resolved: true, sanctuary: true } });
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(0);
    show({ sessionPosture: { resolved: true, sanctuary: false } });
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(0);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('never treats a stored author orchestration template as the writer literal', () => {
    show({
      thread: {
        threadId: 'fiction-thread', chainId: 'fiction-chain', locusText: focus.text,
        targetSectionId: focus.sectionId, sectionLabel: 'Fictional',
        legacyLocus: false, versions: [], headVersionId: null,
        turns: [
          { turnIndex: 0, speaker: 'author',
            body: 'FICTIONAL PRIVATE ORCHESTRATION TEMPLATE NOT AUTHORED AS SHOWN',
            at: '2026-10-20T09:00:00Z' },
          { turnIndex: 1, speaker: 'maia', body: 'FICTIONAL MAIA REPLY',
            at: '2026-10-20T09:00:01Z' },
        ],
      },
      dialogue: [{ key: 'maia:fiction-thread:1', speaker: 'maia', body: 'FICTIONAL MAIA REPLY' }],
    });
    const transcript = node.querySelector('.p4r1-maia-craft-r1-transcript');
    expect(transcript?.textContent).toContain('FICTIONAL MAIA REPLY');
    expect(transcript?.textContent).not.toContain('FICTIONAL PRIVATE ORCHESTRATION TEMPLATE');
    expect(transcript?.querySelectorAll('[data-speaker="writer"]')).toHaveLength(0);
  });

  it('retires a local attempted You bubble when the author explicitly clears their draft', () => {
    show(); type(intention); click('Work it through');
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(1);
    click('Clear draft');
    expect(currentText()).toBe('');
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(0);
  });

  it('never carries a local attempted You bubble across focus identity change', () => {
    show(); type(intention); click('Work it through');
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(1);
    show({ currentFocus: { ...focus, sectionId: 'fiction-other', start: 2, end: 15, text: 'Other fictional words' } });
    expect(currentText()).toBe('');
    expect(node.querySelectorAll('[data-speaker="writer"]')).toHaveLength(0);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('retains unsent wording across a new thread ID because thread creation is not delivery', () => {
    show(); type(intention);
    show({ thread: {
      threadId: 'fiction-thread-new', chainId: 'fiction-chain-new', locusText: focus.text,
      targetSectionId: focus.sectionId, sectionLabel: 'A fictional work',
      legacyLocus: false, turns: [], versions: [], headVersionId: null,
    } });
    expect(currentText()).toBe(intention);
    expect(send).not.toHaveBeenCalled();
    expect(port?.snapshot()?.text).toBe(intention);
  });

  it('holds a focus-bound snapshot until explicit Clear; no thread-indexed storage', () => {
    show(); type(intention);
    expect(port?.snapshot()?.text).toBe(intention);
    click('Clear draft');
    expect(currentText()).toBe('');
    expect(port?.snapshot()?.text).toBe('');
    expect(send).not.toHaveBeenCalled();
  });

  it('refuses a same-task double submit without automatic retries or Apply', () => {
    show(); type(intention);
    const b = button('Work it through');
    act(() => { b.click(); b.click(); });
    expect(send).toHaveBeenCalledTimes(1);
    expect(currentText()).toBe(intention);
    expect(button('Send again (may duplicate)')).toBeDefined();
  });

  it('does not transfer an old private text into a different focus', () => {
    show(); type(intention);
    show({ currentFocus: {
      ...focus, sectionId: 'fiction-other-section', start: 5, end: 23,
      text: 'The other river flows',
    } });
    expect(currentText()).toBe('');
    expect(port?.snapshot()?.text).toBe('');
    expect(send).not.toHaveBeenCalled();
  });

  it('does not read or write old URL-indexed draft storage', () => {
    window.sessionStorage.setItem('ws-craft-composer-recovery:fiction-work', 'FICTIONAL FOREIGN DRAFT');
    const get = jest.spyOn(Storage.prototype, 'getItem');
    const set = jest.spyOn(Storage.prototype, 'setItem');
    try {
      show(); type(intention);
      expect(get.mock.calls.some(([k]) => String(k).includes('ws-craft-composer-recovery:'))).toBe(false);
      expect(set.mock.calls.some(([k]) => String(k).includes('ws-craft-composer-recovery:'))).toBe(false);
      expect(currentText()).toBe(intention);
    } finally {
      get.mockRestore(); set.mockRestore();
      window.sessionStorage.clear();
    }
  });
});
