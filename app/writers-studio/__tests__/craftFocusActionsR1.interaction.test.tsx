/** @jest-environment jsdom */
/**
 * Craftsman focus actions: Suggest an edit / Discuss / Write here, on the real mounted Write view.
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
  __esModule: true, default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/ObservationManuscriptLayer', () => ({
  __esModule: true, default: () => null,
}));
jest.mock('@/app/dev/writers-studio-pc3-live/RevisionManuscriptLayer', () => ({
  __esModule: true, default: () => null,
}));

const onBegin = jest.fn();
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

describe('JARVIS: canonical Write -> explicitly chosen Craftsman and MAIA', () => {
  let node: HTMLDivElement;
  let root: Root;
  let onSend: jest.Mock;
  let onSave: jest.Mock;
  let onApply: jest.Mock;
  let onUndo: jest.Mock;
  let currentRevision: number;
  let switchWork: ((nextId: string) => void) | null;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    // JSDOM omits Range geometry. The real browser supplies this natively;
    // give the fictional selection an inert, deterministic visible rectangle.
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ x: 120, y: 100, width: 260, height: 20,
        left: 120, right: 380, top: 100, bottom: 120, toJSON: () => ({}) }),
    });
    window.sessionStorage.clear();
    currentRevision = 1;
    switchWork = null;
    node = document.createElement('div');
    document.body.appendChild(node);
    root = createRoot(node);
    onSend = jest.fn();
    onSave = jest.fn(async () => true);
    onApply = jest.fn();
    onUndo = jest.fn();
    window.sessionStorage.setItem('ws-craft-composer-recovery:fiction-work',
      'FICTIONAL STALE COMPOSER FROM ANOTHER ACCOUNT');
  });
  afterEach(() => {
    act(() => root.unmount());
    node.remove();
    window.sessionStorage.clear();
    window.getSelection()?.removeAllRanges();
  });

  function Fixture() {
    const [held, setHeld] = useState<Pc3HeldPassage | null>(null);
    const [workspaceOpen, setWorkspaceOpen] = useState(false);
    const [visibleVersion, setVisibleVersion] = useState<typeof proposal | {
      id: string; author: 'member'; wording: string; supersedes: string;
      rationale: string;
    }>(proposal);
    const [appliedId, setAppliedId] = useState<string | null>(null);
    const [workId, setWorkId] = useState(fictionalWork.id);
    switchWork = setWorkId;
    const writing = {
      sections: [section], activeId: section.draftSectionId, active: section,
      activeBody: manuscript, statusOf: () => 'saved' as const,
      edit: jest.fn(), editSection: jest.fn(), captureForUnmount: () => true,
      bodyOf: () => manuscript, goToSection: jest.fn(),
      hasUnsavedWork: () => false, currentRevisionId: () => currentRevision,
      flushPending: jest.fn(),
    };
    const props: P4R1Pc3WriteEditViewProps = {
      context: { manuscriptId: 'fiction-manuscript', title: 'Fictional', version: 1, sections: [section] },
      writing, work: { ...fictionalWork, id: workId }, appearance: 'day', pathname: '/writers-studio',
      initialSearch: '?m=fiction-work', initial: section.draftSectionId,
      focusId: section.draftSectionId, held,
      onFocusSection: jest.fn(),
      onHoldPassage: (s, start, end, text) => setHeld({
        draftSectionId: s.draftSectionId, start, end, text, revisionNumber: 1,
      }),
      onMode: jest.fn(), workspaceOpen,
      carriedInsight: null, carriedInsightReturnMode: null, attentionReturnItemId: null,
      lineageReturnChapterId: null, lineageReturnCandidateId: null, workspaceInsight: null,
      editorialThread: { ...thread, headVersionId: visibleVersion.id,
        versions: [visibleVersion] }, relationshipChoices: [], maiaRelationship: null,
      maiaRelationshipChoices: [], maiaRelationshipPhase: 'ready', maiaRelationshipBusy: false,
      maiaRelationshipMessage: null, carrySourceAvailable: false,
      carryChooser: { kind: 'closed' }, selectedCarrySource: null,
      suggestedVersion: visibleVersion, appliedVersionId: appliedId, editorialDraft: '',
      editorialDepth: 'direct', editLatitude: 1,
      mayRemoveParagraphs: false, mayProposeImmediately: false,
      voiceNotice: null, sessionPosture: { resolved: true, sanctuary: false },
      onChooseSessionPosture: jest.fn(), editorialBusy: false,
      adoptionBusy: false, memberVersionBusy: false, editorialFailure: null,
      adoptionOutcome: null, undoMessage: null, lastMaiaEditorialTurn: null,
      onOpenWorkspace: () => setWorkspaceOpen(true),
      onDismissCarriedInsight: jest.fn(),
      onCloseWorkspace: () => setWorkspaceOpen(false),
      onReturnToStartingPassage: jest.fn(), canReturnToStartingPassage: false,
      onDepth: jest.fn(), onInstruction: jest.fn(), onSendEditorial: onSend,
      onSelectVersion: jest.fn(),
      onApply: () => { onApply(); setAppliedId(visibleVersion.id); },
      onUndo: () => { onUndo(); setAppliedId(null); },
      onSaveMember: async (draft) => {
        const ok = await onSave(draft);
        if (ok) setVisibleVersion({
          id: 'fiction-member-saved-version', author: 'member',
          wording: draft.text, supersedes: visibleVersion.id,
          rationale: 'Fictional author-owned version for UI acceptance.',
        });
        return ok;
      },
      onKeep: jest.fn(), onLatitude: jest.fn(), onMayRemoveParagraphs: jest.fn(),
      onMayProposeImmediately: jest.fn(), onReviseInsight: jest.fn(),
      onChoosePassage: jest.fn(), onChooseRelationship: jest.fn(),
      onBeginMaiaRelationship: onBegin, onChooseMaiaRelationship: jest.fn(),
      onLeaveMaiaRelationship: jest.fn(), onOpenCarryChooser: jest.fn(),
      onCloseCarryChooser: jest.fn(), onSelectCarrySource: jest.fn(),
      onRemoveCarrySource: jest.fn(),
    } as unknown as P4R1Pc3WriteEditViewProps;
    return <P4R1Pc3WriteEditView {...props} />;
  }

  function mount() {
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

  function enterCraft() {
    mount();
    selectExactPassage();
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    expect(node.querySelector('[data-craftsmans-table-r1]')).not.toBeNull();
  }
  const focusButton = (label: string) =>
    Array.from(node.querySelectorAll<HTMLButtonElement>('[data-craft-focus-actions] button'))
      .find(b => b.textContent?.trim() === label);

  it('Suggest an edit: is reachable and sends a bounded, apply-nothing request', () => {
    enterCraft();
    const b = focusButton('Suggest an edit');
    expect(b).toBeDefined();
    expect(b!.disabled).toBe(false);
    act(() => b!.click());
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][0]).toContain('Show one small, useful edit');
    expect(onSend.mock.calls[0][1]).toMatchObject({ proposalPolicy: 'allow' });
    expect(onApply).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('Discuss: is reachable and sends a reply-only request', () => {
    enterCraft();
    const b = focusButton('Discuss');
    expect(b).toBeDefined();
    expect(b!.disabled).toBe(false);
    act(() => b!.click());
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][0]).toContain('Do not draft or change any wording');
    expect(onSend.mock.calls[0][1]).toMatchObject({ proposalPolicy: 'reply_only' });
    expect(onApply).not.toHaveBeenCalled();
  });

  it('Write here: opens the writer-owned composer without sending anything', () => {
    enterCraft();
    const b = focusButton('Write here');
    expect(b).toBeDefined();
    expect(b!.disabled).toBe(false);
    act(() => b!.click());
    expect(node.querySelector('textarea[aria-label="Edit your working passage"]')).not.toBeNull();
    expect(onSend).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('does not claim a suggestion was requested before the controller accepts it', () => {
    enterCraft();
    act(() => focusButton('Suggest an edit')!.click());
    expect(node.textContent).not.toContain('A bounded suggestion was requested');
  });

  it('asks the writer a plain question', () => {
    enterCraft();
    expect(node.textContent).toContain('What would you like to change or look at in this passage?');
    expect(node.textContent).not.toContain('bring alive');
  });

  it('offers a plain way to begin with MAIA when no relationship exists yet', () => {
    onBegin.mockClear();
    enterCraft();
    const invite = node.querySelector('[data-craft-begin-with-maia]');
    expect(invite).not.toBeNull();
    expect(invite!.textContent).toContain("MAIA isn't sitting with this book yet");
    const b = Array.from(invite!.querySelectorAll('button')).find(x => x.textContent === 'Begin with MAIA');
    expect(b).toBeDefined();
    act(() => b!.click());
    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('lets the writer choose how much MAIA may change, beside Suggest an edit', () => {
    enterCraft();
    const select = node.querySelector<HTMLSelectElement>('[data-craft-edit-strength] select');
    expect(select).not.toBeNull();
    const labels = Array.from(select!.options).map(o => o.textContent);
    expect(labels[0]).toBe('Keep my words and structure');
    expect(labels[4]).toBe('Rewrite fully if it helps');
    expect(select!.value).toBe('1');
    expect(onSend).not.toHaveBeenCalled();
  });
});
