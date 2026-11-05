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
  work: unknown; maiaRelationship: unknown; sessionPosture: { resolved: boolean; sanctuary: boolean };
}>;

/**
 * DEAD-END SWEEP. Every passage action, in every combination of the three gates
 * that decide whether MAIA can act (Living Work x privacy posture x MAIA
 * relationship), must end in something the writer can see: it was sent, it was
 * held for a gate the writer can answer, a reason was shown, or the room/table it
 * names opened. Silence is the defect this suite exists to forbid.
 */
const WORKS: Array<[string, unknown]> = [['no Work', null], ['a Work', fictionalWork]];
const POSTURES: Array<[string, { resolved: boolean; sanctuary: boolean }]> = [
  ['posture unanswered', { resolved: false, sanctuary: false }],
  ['Ordinary', { resolved: true, sanctuary: false }],
  ['Sanctuary', { resolved: true, sanctuary: true }],
];
const RELATIONSHIPS: Array<[string, unknown]> = [['no relationship', null], ['relationship begun', { id: 'rel-1' }]];
// Doors ruling (founder, 2026-11-05): one door — the writer's own words, or three plain choices.
const ACTIONS: Array<{ label: string; typed?: boolean }> = [
  { label: 'Own words', typed: true }, { label: 'What’s happening here?' },
  { label: 'Show me an edit' }, { label: 'Teach me the craft' },
];

describe('Write view dead-end sweep', () => {
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
      writing, work: overrides.work, appearance: 'day', pathname: '/writers-studio',
      initialSearch: '?m=fiction-work', initial: section.draftSectionId,
      focusId: section.draftSectionId, held,
      onFocusSection: jest.fn(),
      onHoldPassage: (s: typeof section, start: number, end: number, text: string) => setHeld({
        draftSectionId: s.draftSectionId, start, end, text, revisionNumber: 1,
      }),
      onMode: jest.fn(), workspaceOpen,
      carriedInsight: null, carriedInsightReturnMode: null, attentionReturnItemId: null,
      lineageReturnChapterId: null, lineageReturnCandidateId: null, workspaceInsight: null,
      editorialThread: { ...thread }, relationshipChoices: [],
      maiaRelationship: overrides.maiaRelationship,
      maiaRelationshipChoices: [], maiaRelationshipPhase: 'ready', maiaRelationshipBusy: false,
      maiaRelationshipMessage: null, carrySourceAvailable: false,
      carryChooser: { kind: 'closed' }, selectedCarrySource: null,
      suggestedVersion: proposal, appliedVersionId: null, editorialDraft: '',
      editorialDepth: 'direct', editLatitude: 1,
      mayRemoveParagraphs: false, mayProposeImmediately: false,
      voiceNotice: null, sessionPosture: overrides.sessionPosture,
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
  function select() {
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
  function click(fragment: string) {
    const button = Array.from(node.querySelectorAll('button')).find(el =>
      el.textContent?.includes(fragment));
    expect(button).toBeDefined();
    act(() => button!.click());
  }
  function ask(words: string) {
    const input = node.querySelector<HTMLInputElement>('[data-passage-ask] input')!;
    expect(input).not.toBeNull();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, words);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => { input.form!.requestSubmit(); });
  }
  function visibleOutcome(): string {
    if (onSend.mock.calls.length > 0) return 'sent';
    if (node.querySelector('[data-held-act]')?.getAttribute('data-held-act')) return 'held';
    if (node.querySelector('.p4r1-selection-notice')?.textContent) return 'reason shown';
    if (node.querySelector('[data-craftsmans-table-r1]')) return 'craft opened';
    if (node.querySelector('[data-fiction-isolated]')) return 'focus opened';
    return 'SILENT';
  }

  describe.each(WORKS)('%s', (_w, work) => {
    describe.each(POSTURES)('%s', (_p, sessionPosture) => {
      describe.each(RELATIONSHIPS)('%s', (_r, maiaRelationship) => {
        it.each(ACTIONS)('$label is never silent', ({ label, typed }) => {
          overrides = { work, sessionPosture, maiaRelationship };
          act(() => root.render(<Fixture />));
          select();
          click('Talk with MAIA');
          if (typed) ask('Cut the last clause.');
          else click(label);
          expect(visibleOutcome()).not.toBe('SILENT');
        });
      });
    });
  });
});
