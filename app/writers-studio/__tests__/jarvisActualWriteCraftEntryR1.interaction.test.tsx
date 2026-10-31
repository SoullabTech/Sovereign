/** @jest-environment jsdom */
/**
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
  __esModule: true, default: () => null,
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
      onBeginMaiaRelationship: jest.fn(), onChooseMaiaRelationship: jest.fn(),
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

  it('does not mount Craft or commission MAIA before the writer chooses it', () => {
    mount();
    expect(node.querySelector('[data-craftsmans-table-r1]')).toBeNull();
    expect(node.querySelector('[data-maia-craft-companion-r1]')).toBeNull();
    expect(onSend).not.toHaveBeenCalled();
    selectExactPassage();
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    expect(node.querySelector('[data-craftsmans-table-r1]')).not.toBeNull();
    expect(node.querySelector('[data-maia-craft-companion-r1]')).not.toBeNull();
    // Craft is a Write workbench, not a switch to Develop or its saved panels.
    expect(node.querySelector('[data-fiction-shell]')?.getAttribute('data-fiction-studio-mode')).toBe('write');
    expect(node.querySelector('del')).not.toBeNull();
    expect(node.querySelector('ins')).not.toBeNull();
    expect(onSend).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
    expect(node.querySelector('textarea[aria-label="Talk with MAIA about the writing"]')?.textContent)
      .not.toContain('FICTIONAL STALE COMPOSER');
  });

  it('keeps Next Focus MAIA request explicitly reply-only and non-mutating', () => {
    mount();
    selectExactPassage();
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    clickButton('Next focus');
    clickButton('Ask MAIA');
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][1]).toEqual({ proposalPolicy: 'reply_only' });
    expect(onApply).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('requires separate writer gestures to Save, Apply and Undo on the mounted Write view', async () => {
    mount();
    selectExactPassage();
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    const insertion = node.querySelector<HTMLElement>('ins[data-edit-id]');
    expect(insertion).not.toBeNull();
    act(() => insertion!.click());
    clickButton('Use this');
    expect(onSave).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
    const save = [...node.querySelectorAll('button')].find(b => b.textContent?.includes('Save my version'));
    expect(save?.disabled).toBe(false);
    await act(async () => { save!.click(); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      threadId: 'fiction-thread', sectionId: 'fiction-section',
      text: expect.stringContaining('new'),
    });
    expect(onApply).not.toHaveBeenCalled();
    const apply = [...node.querySelectorAll('button')].find(b => b.textContent?.includes('Apply my version'));
    expect(apply?.disabled).toBe(false);
    act(() => apply!.click());
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
    clickButton('Undo');
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('warns on browser departure only for unfinished or unsaved local Craft work', () => {
    mount();
    const ordinary = new Event('beforeunload', { cancelable: true });
    act(() => { window.dispatchEvent(ordinary); });
    expect(ordinary.defaultPrevented).toBe(false);

    selectExactPassage();
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    const clean = new Event('beforeunload', { cancelable: true });
    act(() => { window.dispatchEvent(clean); });
    expect(clean.defaultPrevented).toBe(false);

    const compose = node.querySelector<HTMLElement>('.p4r1-craft-r1-compose-menu summary');
    expect(compose).not.toBeNull();
    act(() => compose!.click());
    clickButton('Write from mine');
    const draft = node.querySelector<HTMLTextAreaElement>('textarea[aria-label="Edit your working passage"]');
    expect(draft).not.toBeNull();
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    act(() => {
      setter?.call(draft, 'FICTIONAL UNSENT WORDING UNDER EXIT WARNING');
      draft!.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const unsafe = new Event('beforeunload', { cancelable: true });
    act(() => { window.dispatchEvent(unsafe); });
    expect(unsafe.defaultPrevented).toBe(true);
    expect((draft as HTMLTextAreaElement).value).toBe('FICTIONAL UNSENT WORDING UNDER EXIT WARNING');

    clickButton('Cancel');
    const cancelled = new Event('beforeunload', { cancelable: true });
    act(() => { window.dispatchEvent(cancelled); });
    expect(cancelled.defaultPrevented).toBe(false);
    expect(onSave).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('never exposes an unfinished Craft draft after the mounted Work identity changes', () => {
    mount();
    selectExactPassage();
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    const compose = node.querySelector<HTMLElement>('.p4r1-craft-r1-compose-menu summary');
    expect(compose).not.toBeNull();
    act(() => compose!.click());
    clickButton('Write from mine');
    const draft = node.querySelector<HTMLTextAreaElement>('textarea[aria-label="Edit your working passage"]');
    expect(draft).not.toBeNull();
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    act(() => {
      setter?.call(draft, 'FICTIONAL PRIVATE DRAFT FROM PREVIOUS WORK');
      draft!.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(node.querySelector('[data-craftsmans-table-r1]')).not.toBeNull();
    act(() => switchWork?.('different-work-after-account-change'));
    expect(node.querySelector('[data-craftsmans-table-r1]')).toBeNull();
    expect(node.querySelector('[data-maia-craft-companion-r1]')).toBeNull();
    expect(node.querySelector('textarea[aria-label="Edit your working passage"]')).toBeNull();
    expect(onSave).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not enter Craft after source revision changes under an old selection', () => {
    mount();
    selectExactPassage();
    currentRevision = 2;
    clickButton('Work with passage');
    clickButton("Craftsman's Table");
    expect(node.querySelector('[data-craftsmans-table-r1]')).toBeNull();
    expect(onApply).not.toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });
});
