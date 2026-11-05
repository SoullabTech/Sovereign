/** @jest-environment jsdom */
import fs from 'fs';
import path from 'path';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import IsolatedEditorialRoom from '@/app/dev/writers-studio-pc3-live/IsolatedEditorialRoom';
import EditorialDancePanel from '@/app/dev/writers-studio-pc3-live/EditorialDancePanel';
import { pausedSendOptions } from '@/lib/writersStudio/revisionPause';
import { passageActQuestion, passageActInstruction } from '@/lib/writersStudio/passageActs';

/** Conversation-first step 5b: Next passage and Pause revisions in Focus; the separate room retired. */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('pause rule', () => {
  it('while paused every Focus request is reply-only and requests no wording', () => {
    expect(pausedSendOptions({ proposalPolicy: 'allow', proposalRequested: true, passageAct: 'revise' }, true))
      .toEqual({ proposalPolicy: 'reply_only', passageAct: 'revise' });
    expect(pausedSendOptions(undefined, true)).toEqual({ proposalPolicy: 'reply_only' });
  });
  it('not paused, options pass through unchanged', () => {
    const o = { proposalPolicy: 'allow' as const, proposalRequested: true };
    expect(pausedSendOptions(o, false)).toBe(o);
  });
});

describe('Focus room controls', () => {
  function renderRoom(extra: Record<string, unknown>) {
    act(() => root.render(React.createElement(IsolatedEditorialRoom, {
      appearance: 'evening', title: 'Fire', currentText: 'x', sectionBody: 'x', busy: false,
      editingLatitude: 2, onEditingLatitude: jest.fn(), mayRemoveParagraphs: false, onMayRemoveParagraphs: jest.fn(),
      mayProposeImmediately: false, onMayProposeImmediately: jest.fn(), onClose: jest.fn(),
      children: React.createElement('div'), ...extra,
    } as any)));
  }
  it('Next passage menu offers the next paragraph and Ask MAIA where next', () => {
    const onNextPassage = jest.fn(); const onAskWhereNext = jest.fn();
    renderRoom({ onNextPassage, nextPassageLabel: '“Others deepen as…”', onAskWhereNext });
    const menu = host.querySelector('[data-next-passage-menu]')!;
    expect(menu.querySelector('summary')!.textContent).toBe('Next passage');
    const [go, ask] = Array.from(menu.querySelectorAll('button'));
    expect(go!.textContent).toContain('“Others deepen as…”');
    act(() => go!.click()); act(() => ask!.click());
    expect(onNextPassage).toHaveBeenCalled(); expect(onAskWhereNext).toHaveBeenCalled();
  });
  it('Pause MAIA’s revisions is in Preferences and reports the writer’s choice', () => {
    const onPauseRevisions = jest.fn();
    renderRoom({ revisionsPaused: false, onPauseRevisions });
    const box = host.querySelector<HTMLInputElement>('[data-pause-revisions] input')!;
    expect(box.closest('.p4r1-isolated-preferences')).not.toBeNull();
    act(() => box.click());
    expect(onPauseRevisions).toHaveBeenCalledWith(true);
  });
  it('without handlers the room shows neither (unchanged)', () => {
    renderRoom({});
    expect(host.querySelector('[data-next-passage-menu]')).toBeNull();
    expect(host.querySelector('[data-pause-revisions]')).toBeNull();
  });
});

describe('paused Focus panel', () => {
  it('disables the wording buttons and says why; talking stays available', () => {
    act(() => root.render(React.createElement(EditorialDancePanel, {
      manuscriptTitle: 'T', currentText: 'Original words.', sectionBody: 'Original words.',
      thread: null, version: null, lastMaiaTurn: null, appliedVersionId: null, busy: false, message: null, undoMessage: null,
      sessionPosture: { resolved: true, sanctuary: false }, onChooseSessionPosture: jest.fn(), onSelectVersion: jest.fn(),
      onSend: jest.fn(), onSaveMember: jest.fn(async () => true), onApply: jest.fn(), onUndo: jest.fn(), onKeep: jest.fn(), onDepth: jest.fn(),
      revisionsPaused: true,
    } as any)));
    const card = (label: string) => Array.from(host.querySelectorAll('button')).find((b) => b.querySelector('b')?.textContent === label)!;
    expect(card('Show edit options').disabled).toBe(true);
    expect(card('Discuss what’s happening').disabled).toBe(false);
    expect(card('Teach me about the writing').disabled).toBe(false);
  });
});

describe('Craftsman’s Table is a door again (founder, 2026-11-04) and Where next is server-owned', () => {
  // ⚠️ SUPERSEDED IN PART by the Doors ruling (founder, 2026-11-05): the selection menu no
  // longer carries a Craftsman's Table entry (one door: own words or three choices). The
  // Table stays reachable through MAIA, as "Change it" in the conversation and as her offer.
  it('Craftsman’s Table is reached through MAIA, not as its own selection-menu door', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    expect(view).not.toContain('data-open-craftsmans-table');
    expect(view).toContain("if (id === 'craftsmans-table')");
    expect(view.match(/openCraftOnHeld\(\)/g)?.length).toBe(1);
    expect(read('lib/writersStudio/studioActions.ts')).toContain("id: 'craftsmans-table'");
    expect(read('lib/writersStudio/studioGuide.ts')).toContain("label: 'Craftsman\\'s Table'");
  });
  it('Ask MAIA where next stores only the writer’s words', () => {
    expect(passageActQuestion('where-next')).toBe('Which passage should I work on next?');
    expect(passageActInstruction('where-next')).toContain('Do not move focus or propose a revision.');
    expect(read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'))
      .toContain("focusSend(passageActQuestion('where-next'), { proposalPolicy: 'reply_only', passageAct: 'where-next' })");
  });
});
