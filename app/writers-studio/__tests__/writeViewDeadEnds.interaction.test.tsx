/** @jest-environment jsdom */
/**
 * Dead-end regressions on the mounted Write view (2026-11-03 investigation):
 *  - "Suggest an edit" must tell the server the writer asked for wording.
 *  - Passage actions with no Living Work must say why instead of doing nothing.
 *  - Passage actions while a gate is open are HELD, never dropped or sent early.
 * Actual canonical Write-view integration, fictional Work and inert providers.
 * Child Shell/WriteRoom UI frames are stubs only; Craft, focus and MAIA
 * components are real. This is NOT an authenticated app/server witness.
 */
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { P4R1Pc3WriteEditView, type Pc3HeldPassage, type P4R1Pc3WriteEditViewProps } from '@/app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView';

jest.mock('@/app/writers-studio/full-redesign/Shell', () => ({
  Shell: ({ mode, work, maia }: { mode: string; work: React.ReactNode; maia?: React.ReactNode }) =>
    <div data-fiction-shell data-fiction-studio-mode={mode}><main data-fiction-work>{work}</main><aside data-fiction-maia>{maia}</aside></div>,
}));
jest.mock('@/app/writers-studio/full-redesign/WriteRoom', () => ({
  WriteRoom: ({ fixture }: { fixture: { currentChapterId: string; paragraphs: string[] } }) =>
    <div data-write-editor data-section-id={fixture.currentChapterId}>
      {fixture.paragraphs.join('\n\n')}
    </div>,
  WriteManuscriptRail: () => <div data-fiction-rail>Fictional manuscript rail</div>,
}));
jest.mock('@/app/writers-studio/canvas/WorkConversation', () => ({
  __esModule: true, default: () => <p>Fictional conversation disabled</p>,
}));
jest.mock('@/app/writers-studio/insight/RevisionDesk', () => ({
  __esModule: true, default: () => null,
}));
jest.mock('@/app/writers-studio/insight/InsightReadings', () => ({
  __esModule: true, default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/IsolatedEditorialRoom', () => ({
  __esModule: true, default: ({ children }: { children: React.ReactNode }) =>
    <section data-fiction-isolated>{children}</section>,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1FocusMaterials', () => ({
  __esModule: true, default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1BlankWritingArrival', () => ({
  __esModule: true, default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/EditorialDancePanel', () => ({
  __esModule: true,
  default: (p: { requestedAct?: { label: string } | null }) =>
    <div data-fiction-dance data-held-act={p.requestedAct?.label ?? ''} />,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/ObservationManuscriptLayer', () => ({
  __esModule: true, default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/RevisionManuscriptLayer', () => ({
  __esModule: true, default: () => null,
}));

const original = 'The old red boat rests near the quiet river.';
const second = 'The next fictional passage waits beyond the bridge.';
const manuscript = original + '\n\n' + second;
const section = {
  draftSectionId: 'fiction-section',
  sourceSectionId: null,
  position: 0,
  heading: 'Fictional chapter',
  headingDepth: 1,
  headingSignal: null,
  body: manuscript,
  editable: true,
};
const proposal = {
  id: 'fiction-version',
  author: 'maia' as const,
  wording: 'The new blue ship rests near the quiet river.',
  supersedes: null,
  rationale: 'A made-up craft suggestion.',
};
const thread = {
  threadId: 'fiction-thread',
  chainId: 'fiction-chain',
  locusText: original,
  targetSectionId: section.draftSectionId,
  sectionLabel: 'Fictional chapter',
  legacyLocus: false,
  turns: [],
  versions: [proposal],
  headVersionId: proposal.id,
};
const fictionalWork = {
  id: 'fiction-work', title: 'Fictional manuscript', purpose: null,
  form: 'Book', stage: 'writing' as const, manuscriptState: 'partial-manuscript' as const,
  createdAt: '2026-10-19T12:00:00Z', updatedAt: '2026-10-19T12:00:00Z',
  expressions: [], materials: [],
};


type Overrides = Partial<{
  work: unknown; maiaRelationship: unknown; sessionPosture: { resolved: boolean; sanctuary: boolean }; onMode: unknown;
}>;

describe('Write view dead ends', () => {
  let node: HTMLDivElement;
  let root: Root;
  let onSend: jest.Mock;
  let overrides: Overrides;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ x: 120, y: 100, width: 260, height: 20,
        left: 120, right: 380, top: 100, bottom: 120, toJSON: () => ({}) }),
    });
    window.sessionStorage.clear();
    node = document.createElement('div');
    document.body.appendChild(node);
    root = createRoot(node);
    onSend = jest.fn();
    overrides = {};
  });
  afterEach(() => {
    act(() => root.unmount());
    node.remove();
    window.getSelection()?.removeAllRanges();
  });

  function Fixture() {
    const [held, setHeld] = useState<Pc3HeldPassage | null>(null);
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const writing = {
      sections: [section], activeId: section.draftSectionId, active: section,
      activeBody: manuscript, statusOf: () => 'saved' as const,
      edit: jest.fn(), editSection: jest.fn(), captureForUnmount: () => true,
      bodyOf: () => manuscript, goToSection: jest.fn(),
      hasUnsavedWork: () => false, currentRevisionId: () => 1,
      flushPending: jest.fn(),
    };
    const props = {
      context: { manuscriptId: 'fiction-manuscript', title: 'Fictional', version: 1, sections: [section] },
      writing, work: 'work' in overrides ? overrides.work : fictionalWork,
      appearance: 'day', pathname: '/writers-studio',
      initialSearch: '?m=fiction-work', initial: section.draftSectionId,
      focusId: section.draftSectionId, held,
      onFocusSection: jest.fn(),
      onHoldPassage: (s: typeof section, start: number, end: number, text: string) => setHeld({
        draftSectionId: s.draftSectionId, start, end, text, revisionNumber: 1,
      }),
      onMode: (overrides.onMode as never) ?? jest.fn(), workspaceOpen,
      carriedInsight: null, carriedInsightReturnMode: null, attentionReturnItemId: null,
      lineageReturnChapterId: null, lineageReturnCandidateId: null, workspaceInsight: null,
      editorialThread: { ...thread }, relationshipChoices: [],
      maiaRelationship: 'maiaRelationship' in overrides ? overrides.maiaRelationship : { id: 'rel-1' },
      maiaRelationshipChoices: [], maiaRelationshipPhase: 'ready', maiaRelationshipBusy: false,
      maiaRelationshipMessage: null, carrySourceAvailable: false,
      carryChooser: { kind: 'closed' }, selectedCarrySource: null,
      suggestedVersion: proposal, appliedVersionId: null, editorialDraft: '',
      editorialDepth: 'direct', editLatitude: 1,
      mayRemoveParagraphs: false, mayProposeImmediately: false,
      voiceNotice: null, sessionPosture: overrides.sessionPosture ?? { resolved: true, sanctuary: false },
      onChooseSessionPosture: jest.fn(), editorialBusy: false,
      adoptionBusy: false, memberVersionBusy: false, editorialFailure: null,
      adoptionOutcome: null, undoMessage: null, lastMaiaEditorialTurn: null,
      onOpenWorkspace: () => setWorkspaceOpen(true),
      onDismissCarriedInsight: jest.fn(),
      onCloseWorkspace: () => setWorkspaceOpen(false),
      onReturnToStartingPassage: jest.fn(), canReturnToStartingPassage: false,
      onDepth: jest.fn(), onInstruction: jest.fn(), onSendEditorial: onSend,
      onSelectVersion: jest.fn(), onApply: jest.fn(), onUndo: jest.fn(),
      onSaveMember: async () => true,
      onKeep: jest.fn(), onLatitude: jest.fn(), onMayRemoveParagraphs: jest.fn(),
      onMayProposeImmediately: jest.fn(), onReviseInsight: jest.fn(),
      onChoosePassage: jest.fn(), onChooseRelationship: jest.fn(),
      onBeginMaiaRelationship: jest.fn(), onChooseMaiaRelationship: jest.fn(),
      onLeaveMaiaRelationship: jest.fn(), onOpenCarryChooser: jest.fn(),
      onCloseCarryChooser: jest.fn(), onSelectCarrySource: jest.fn(),
      onRemoveCarrySource: jest.fn(),
    } as unknown as P4R1Pc3WriteEditViewProps;
    return <P4R1Pc3WriteEditView {...props} />;
  }
  function mount(next: Overrides = {}) {
    overrides = next;
    act(() => root.render(<Fixture />));
  }
  function selectExactPassage() {
    const editor = node.querySelector('[data-write-editor]')!;
    const text = editor.firstChild!;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, original.length);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    act(() => document.dispatchEvent(new Event('selectionchange')));
  }
  function clickButton(fragment: string) {
    const button = Array.from(node.querySelectorAll('button')).find(el =>
      el.textContent?.includes(fragment));
    expect(button).toBeDefined();
    act(() => button!.click());
  }
  function openMenu() {
    selectExactPassage();
    clickButton('Work with passage');
  }

  // The Craftsman's Table menu entry (and its in-table "Suggest an edit") was
  // folded into Focus and retired in #2093/#2095, so the two cases that drove it
  // are gone with it. "Show edit options" in Focus carries proposalRequested
  // itself (EditorialDancePanel), and Revise below pins the same flag.

  it.each([
    ['Focus'], ['Discuss'], ['Teach me about this'],
  ])('%s with no Living Work says why instead of doing nothing', (label) => {
    mount({ work: null });
    openMenu();
    clickButton(label);
    expect(node.querySelector('.p4r1-selection-notice')?.textContent).toContain('Living Work');
    expect(onSend).not.toHaveBeenCalled();
    // The menu stays open so the writer can read the reason.
    expect(node.querySelector('.p4r1-selection-menu')).not.toBeNull();
  });

  it('the no-Living-Work reason carries an action that goes to Home, where a Work is declared', () => {
    const onMode = jest.fn();
    mount({ work: null, onMode });
    openMenu();
    clickButton('Focus');
    const go = node.querySelector('[data-open-home-to-declare]') as HTMLButtonElement | null;
    expect(go).not.toBeNull();
    expect(onSend).not.toHaveBeenCalled();
    act(() => go!.click());
    expect(onMode).toHaveBeenCalledWith('home');
  });

  it('Revise and Go deeper with no Living Work also explain themselves', () => {
    mount({ work: null });
    openMenu();
    clickButton('More ways to work');
    clickButton('Revise');
    expect(node.querySelector('.p4r1-selection-notice')?.textContent).toContain('Living Work');
    clickButton('Go deeper');
    expect(node.querySelector('.p4r1-selection-notice')?.textContent).toContain('Living Work');
    expect(onSend).not.toHaveBeenCalled();
  });

  it.each([
    ['Discuss'], ['Teach me about this'],
  ])('%s is HELD, not dropped or sent early, while the MAIA relationship is not begun', (label) => {
    mount({ maiaRelationship: null });
    openMenu();
    clickButton(label);
    expect(onSend).not.toHaveBeenCalled();
    expect(node.querySelector('[data-fiction-dance]')?.getAttribute('data-held-act')).toBe(label);
  });

  it('Discuss is HELD while the privacy posture is unanswered', () => {
    mount({ sessionPosture: { resolved: false, sanctuary: false } });
    openMenu();
    clickButton('Discuss');
    expect(onSend).not.toHaveBeenCalled();
    expect(node.querySelector('[data-fiction-dance]')?.getAttribute('data-held-act')).toBe('Discuss');
  });

  it('Discuss sends exactly once when every gate is open', () => {
    mount();
    openMenu();
    clickButton('Discuss');
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][1]).toMatchObject({ passageAct: 'discuss', proposalPolicy: 'reply_only' });
  });

  it('Revise sends exactly once when every gate is open', () => {
    mount();
    openMenu();
    clickButton('More ways to work');
    clickButton('Revise');
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][1]).toMatchObject({ passageAct: 'revise', proposalPolicy: 'allow', proposalRequested: true });
  });

  it('Go deeper sends exactly once when every gate is open', () => {
    mount();
    openMenu();
    clickButton('More ways to work');
    clickButton('Go deeper');
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][1]).toMatchObject({ passageAct: 'deeper', proposalPolicy: 'reply_only' });
  });
});
