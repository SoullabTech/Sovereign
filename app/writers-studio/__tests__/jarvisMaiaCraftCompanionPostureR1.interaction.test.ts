/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import MaiaCraftCompanionR1, { type MaiaCraftCompanionR1Props } from '@/app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1';

type Posture = MaiaCraftCompanionR1Props['sessionPosture'];
const ordinary: Posture = { resolved: true, sanctuary: false };
const sanctuary: Posture = { resolved: true, sanctuary: true };
const unresolved: Posture = { resolved: false, reason: 'no_live_settings' };

describe('JARVIS MAIA Craft companion — fictional privacy and intent boundary', () => {
  let host: HTMLDivElement;
  let root: Root;
  let props: MaiaCraftCompanionR1Props;
  let onSend: jest.Mock;
  let onChooseSessionPosture: jest.Mock;

  function show(next: Partial<MaiaCraftCompanionR1Props> = {}) {
    props = { ...props, ...next };
    act(() => root.render(React.createElement(MaiaCraftCompanionR1, props)));
  }
  function typeDraft(text: string) {
    const field = host.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Talk with MAIA about the writing"]',
    );
    expect(field).not.toBeNull();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!
        .set!.call(field, text);
      field!.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  function click(label: string) {
    const b = Array.from(host.querySelectorAll('button'))
      .find(x => x.textContent?.trim() === label);
    expect(b).toBeDefined();
    act(() => b!.click());
  }

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true;
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/writers-studio?m=fictional-work');
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    onSend = jest.fn();
    onChooseSessionPosture = jest.fn();
    props = {
      title: 'The Lantern',
      thread: null,
      version: null,
      lastMaiaTurn: null,
      busy: false,
      message: null,
      activity: null,
      dialogue: [],
      editLatitude: 1,
      mayRemoveParagraphs: false,
      mayProposeImmediately: false,
      sessionPosture: ordinary,
      onChooseSessionPosture,
      onSend,
      onDepth: jest.fn(),
      onEditLatitude: jest.fn(),
      onMayRemoveParagraphs: jest.fn(),
      onMayProposeImmediately: jest.fn(),
      onReturn: jest.fn(),
    };
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    window.sessionStorage.clear();
  });

  it('never hydrates an unsent composer from a legacy URL-indexed draft key', () => {
    window.sessionStorage.setItem(
      'ws-craft-composer-recovery:fictional-work', 'FICTIONAL PRIVATE TEXT FROM ANOTHER MEMBER',
    );
    const get = jest.spyOn(Storage.prototype, 'getItem');
    try {
      show();
      const field = host.querySelector<HTMLTextAreaElement>(
        'textarea[aria-label="Talk with MAIA about the writing"]',
      );
      expect(field?.value).toBe('');
      expect(host.textContent).not.toContain('FICTIONAL PRIVATE TEXT');
      expect(get.mock.calls.some(args =>
        String(args[0]).startsWith('ws-craft-composer-recovery:'))).toBe(false);
      expect(onSend).not.toHaveBeenCalled();
    } finally {
      get.mockRestore();
    }
  });

  it('holds MAIA actions until a resolved Ordinary posture is selected', () => {
    show({ sessionPosture: unresolved });
    expect(host.querySelector('textarea')).toBeNull();
    expect(host.textContent).toContain('held while you choose');
    expect(onSend).not.toHaveBeenCalled();
    click('Ordinary');
    expect(onChooseSessionPosture).toHaveBeenCalledWith(false);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send proposals in Sanctuary, even with old draft keys present', () => {
    window.sessionStorage.setItem(
      'ws-craft-composer-recovery:fictional-work', 'FICTIONAL STALE READER SECRET',
    );
    show({ sessionPosture: sanctuary });
    expect(host.querySelector('textarea')).toBeNull();
    expect(host.textContent).toContain('Sanctuary is on');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('explicit Discuss is reply-only; it cannot automatically Apply to author text', () => {
    show();
    click('Ways to work');
    click('Discuss');
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0]?.[1]).toMatchObject({
      proposalPolicy: 'reply_only',
    });
    expect(onChooseSessionPosture).not.toHaveBeenCalled();
  });

  it('clears in-progress wording on a change of selected Work focus', () => {
    show({ currentFocus: {
      sectionId: 'fiction-section-a', start: 0, end: 12, text: 'Lantern glows',
      revisionNumber: 1, label: 'Lantern glows', sectionLabel: 'The Lantern',
      source: 'writer',
    } });
    typeDraft('FICTIONAL PRIVATE DRAFT THAT MUST NOT FOLLOW FOCUS');
    expect(host.querySelector<HTMLTextAreaElement>('textarea')?.value)
      .toContain('PRIVATE DRAFT');
    show({ currentFocus: {
      sectionId: 'fiction-section-b', start: 0, end: 11, text: 'River speaks',
      revisionNumber: 1, label: 'River speaks', sectionLabel: 'The River',
      source: 'writer',
    } });
    expect(host.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('');
    expect(onSend).not.toHaveBeenCalled();
  });
});
