/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import CraftsmansTableR1, { type CraftsmansTableR1Props } from '@/app/dev/writers-studio-pc3-live/CraftsmansTableR1';
import type { CraftTableSnapshot } from '@/lib/writersStudio/craftFocusR1';

const source = 'The old fictional lantern glowed beside a dark river.';
const privateDraft = 'FICTIONAL PRIVATE DRAFT FROM A DIFFERENT ACCOUNT';
const focusKey = JSON.stringify(['section', 0, Array.from(source).length, source]);
const legacyKey = 'ws-craft-focus-recovery:shared-fictional-thread';

const staleSnapshot: CraftTableSnapshot = {
  key: focusKey, candidateVersion: null, decisions: [],
  manualText: privateDraft, manualFromVersionId: null,
  directDraft: '', directEditing: false,
  customDraft: '', customEditId: null, writerHasActed: true,
  activeEditId: null, view: 'preview', notation: 'guided',
  kept: [], workingText: privateDraft, original: source,
};

describe('JARVIS P0 — local editor snapshots must not bypass verified account ownership', () => {
  let host: HTMLDivElement;
  let root: Root;
  let onWorkingTextChange: jest.Mock;
  let onApply: jest.Mock;
  let props: CraftsmansTableR1Props;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    window.sessionStorage.clear();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    onWorkingTextChange = jest.fn();
    onApply = jest.fn();
    props = {
      sections: [{ draftSectionId: 'section', sourceSectionId: null,
        position: 0, heading: 'Fictional chapter', headingDepth: 1,
        headingSignal: null, body: source, editable: true }],
      bodyOf: () => source,
      held: { draftSectionId: 'section', start: 0,
        end: Array.from(source).length, text: source, revisionNumber: 1 },
      thread: { threadId: 'shared-fictional-thread', chainId: 'chain',
        locusText: source, targetSectionId: 'section', sectionLabel: 'Fiction',
        legacyLocus: false, turns: [], versions: [], headVersionId: null },
      version: null, busy: false, appliedVersionId: null,
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true),
      onApply, onWorkingTextChange,
    };
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    window.sessionStorage.clear();
  });

  function mount(extra: Partial<CraftsmansTableR1Props> = {}) {
    act(() => root.render(React.createElement(CraftsmansTableR1, { ...props, ...extra })));
  }

  it('rejects a matching legacy thread-only snapshot after a fictional account switch', () => {
    const raw = JSON.stringify(staleSnapshot);
    window.sessionStorage.setItem(legacyKey, raw);
    mount();
    expect(host.textContent).not.toContain(privateDraft);
    expect(onWorkingTextChange.mock.calls.flat().join('')).not.toContain(privateDraft);
    expect(onApply).not.toHaveBeenCalled();
    // Never silently consume or trust unowned local author drafts.
    expect(window.sessionStorage.getItem(legacyKey)).toBe(raw);
  });

  it('does not read arbitrary unverified legacy storage to determine current text', () => {
    window.sessionStorage.setItem(legacyKey, JSON.stringify(staleSnapshot));
    const spy = jest.spyOn(Storage.prototype, 'getItem');
    try {
      mount();
      expect(spy.mock.calls.some(call => call[0] === legacyKey)).toBe(false);
      expect(host.textContent).not.toContain(privateDraft);
    } finally {
      spy.mockRestore();
    }
  });

  it('retains the explicitly carried current-session snapshot contract', () => {
    // The trusted caller must separately establish member/Work identity.
    // This test only verifies that removing automatic storage fallback does
    // not delete in-memory writer-directed return within the same open Work.
    mount({ restoreSnapshot: staleSnapshot });
    expect(host.textContent).toContain(privateDraft);
    expect(onApply).not.toHaveBeenCalled();
  });
});
