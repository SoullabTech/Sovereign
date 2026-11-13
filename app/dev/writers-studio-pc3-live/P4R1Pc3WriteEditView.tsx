'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { WriteManuscriptRail, WriteRoom, isWriteRoomReadbackCurrent, type WriteBlock, type WriteRoomReadback } from '@/app/writers-studio/full-redesign/WriteRoom';
import { WRITE_COPY } from '@/app/writers-studio/full-redesign/fixtures';
import { WRITE_GEOMETRY, appearanceVars } from '@/app/writers-studio/full-redesign/tokens';
import { EditorialLetterPanel, type PassIssueTarget } from './EditorialLetterPanel';
import { CoverageLine } from './CoverageLine';

export const UNDO_RESTORED_MESSAGES = {
  complete: 'Undone. Your own wording is back.',
  historyPending: 'Undone. Your own wording is back, but I couldn’t refresh our conversation just now.',
} as const;

export function undoMessageForVisibleDraft(
  message: string | null,
  readback: WriteRoomReadback | null,
  sectionId: string | null,
  body: string,
): string | null {
  const claimsRestoration = message === UNDO_RESTORED_MESSAGES.complete
    || message === UNDO_RESTORED_MESSAGES.historyPending;
  return claimsRestoration && !isWriteRoomReadbackCurrent(readback, sectionId, body)
    ? 'The words on this page have not been confirmed against the saved draft. Your current writing remains visible.'
    : message;
}

const WRITE_RELATIONAL_GEOMETRY = {
  ...WRITE_GEOMETRY,
  padRight: 9,
  maiaWidth: 360,
  maiaFloor: 300,
  gapRight: 13,
};
import { projectPc3LiveWrite } from '@/app/writers-studio/full-redesign/liveWriteAdapter';
import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';
import { WholeManuscriptSurface, type WholeManuscriptSurfaceHandle } from '@/app/writers-studio/canvas/WholeManuscriptSurface';
import { requestConversationDeparture } from '@/lib/writersStudio/conversationDeparture';
import RevisionDesk, { type CarryChooserPresentation, type MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import InsightReadings from '@/app/writers-studio/insight/InsightReadings';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { typesetManuscriptBody } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';
import { passagePlaceLabel } from '@/lib/writersStudio/passagePlace';
import { locateUniquePassage, type AdoptionWireOutcome, type RebuildEditorialRelationship, type RebuildEditorialThread } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import ObservationManuscriptLayer from './ObservationManuscriptLayer';
import RevisionManuscriptLayer, { type RevisionEdit } from './RevisionManuscriptLayer';
import EditorialDancePanel, { type PassageAct } from './EditorialDancePanel';
import IsolatedEditorialRoom from './IsolatedEditorialRoom';
import P4R1FocusMaterials from './P4R1FocusMaterials';
import P4R1BlankWritingArrival from './P4R1BlankWritingArrival';
import StudioFirstPageMaia from './StudioFirstPageMaia';
import { firstPageEligible, letterOfferVisible } from '@/lib/writersStudio/inspirationOpening';
import CraftsmansTableR1 from './CraftsmansTableR1';
import CraftFocusToolsR1 from './CraftFocusToolsR1';
import MaiaCraftCompanionR1, { type MaiaCraftComposerPort, type MaiaCraftComposerSnapshot } from './MaiaCraftCompanionR1';
import { adjacentCraftTarget, craftParagraphLabel, craftTargetKey, paragraphTargets, targetStillMatches, type CraftFocusTarget, type CraftTablePort, type CraftTableSnapshot } from '@/lib/writersStudio/craftFocusR1';
import { craftMaiaDialogueTurn, type CraftSendOptions } from '@/lib/writersStudio/craftDialogueR1';
import { assessCraftNavigation, craftNavigationRefusal } from '@/lib/writersStudio/craftNavigationGuardR1';
import { composeSelected, editorialSegments } from '@/lib/writersStudio/editorialDiff';
import type { CanvasInsight } from '@/lib/writersStudio/insightCanvas';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { EditorialLatitude } from '@/lib/manuscript/editorialScope/contract';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';
import { focusPassageShown } from '@/lib/writersStudio/heldPassageContinuity';
import { resolveEditorialReturnBinding, type A2RelationshipSummary, type EligibleCarrySource } from '@/lib/writersStudio/rebuild/relationshipOrchestration';
import type { CraftWorkingSaveDraft } from '@/lib/writersStudio/craftSaveContractR1';
import { teachingQuestion, type TeachingAnchor } from '@/lib/writersStudio/teachingTurn';
import type { TurnShape } from '@/lib/writersStudio/conversationTurn';
import { passageActQuestion, type PassageAct as PassageActId } from '@/lib/writersStudio/passageActs';
import type { ArrivalOriginRef } from '@/lib/writersStudio/arrivalOrigin';
import { pausedSendOptions } from '@/lib/writersStudio/revisionPause';
import type { StudioActionId } from '@/lib/writersStudio/studioActions';

export type Pc3HeldPassage = {
  draftSectionId: string;
  start: number;
  end: number;
  text: string;
  revisionNumber: number;
};

export type P4R1Pc3WriteEditViewProps = {
  context: {
    manuscriptId: string;
    title: string | null;
    version: number;
    /** the current draft's revision number (the one MAIA's readings are frozen against); null/absent = not established */
    draftRevision?: number | null;
    sections: RebuildSection[];
  };
  /** the writer chose "Show me options" on a place in MAIA's letter: open the passage desk on those exact, verified words */
  onOpenPassIssue?: (target: PassIssueTarget) => void;
  /** "Show me where" on a place in the letter: hold and mark its words in the centre */
  onShowPassIssue?: (target: PassIssueTarget) => void;
  /** "Talk about it" on a place in the letter: the centre desk opens on its words; nothing is asked of MAIA until the writer writes */
  onTalkPassIssue?: (target: PassIssueTarget) => void;
  writing: SectionWriting;
  work: LivingWork | null;
  appearance: Appearance;
  pathname: string;
  initialSearch: string;
  initial: string;

  focusId: string | null;
  held: Pc3HeldPassage | null;
  onFocusSection: (id: string) => void;
  onHoldPassage: (section: RebuildSection, start: number, end: number, text: string) => void;
  onMode: (mode: 'home' | 'write' | 'develop' | 'review' | 'publish' | 'listen') => void;

  workspaceOpen: boolean;
  carriedInsight: CanvasInsight | null;
  carriedInsightReturnMode: 'develop' | 'review' | null;
  attentionReturnItemId: string | null;
  lineageReturnChapterId: string | null;
  lineageReturnCandidateId: string | null;
  workspaceInsight: { readingId: string; key: string } | null;
  editorialThread: RebuildEditorialThread | null;
  /** Conversation Stage: the conversation still holding an undoable edit after Use this. */
  earlierEditorialThread?: RebuildEditorialThread | null;
  relationshipChoices: readonly RebuildEditorialRelationship[];
  /** Several of this Work's conversations on the passage; the writer chooses (2026-11-05). */
  conversationChoices?: readonly RebuildEditorialThread[];
  onChooseConversation?: (threadId: string) => void;
  onStartNewFromChoice?: () => void;
  maiaRelationship: A2RelationshipSummary | null;
  maiaRelationshipChoices: readonly A2RelationshipSummary[];
  maiaRelationshipPhase: 'idle' | 'loading' | 'ready' | 'unavailable';
  maiaRelationshipBusy: boolean;
  maiaRelationshipMessage: string | null;
  carrySourceAvailable: boolean;
  carryChooser: CarryChooserPresentation;
  selectedCarrySource: EligibleCarrySource | null;
  suggestedVersion: RebuildEditorialThread['versions'][number] | null;
  appliedVersionId: string | null;
  editorialDraft: string;
  editorialDepth: EditorialDepth;
  editLatitude: EditorialLatitude;
  mayRemoveParagraphs: boolean;
  mayProposeImmediately: boolean;
  voiceNotice: string | null;
  sessionPosture: CurrentPostureRead;
  onChooseSessionPosture: (sanctuary: boolean) => void;
  editorialBusy: boolean;
  adoptionBusy: boolean;
  memberVersionBusy: boolean;
  editorialFailure: string | null;
  /** A plan-step hand-off that was refused, said where the writer is. */
  planHandoffNotice?: string | null;
  onDismissPlanHandoffNotice?: () => void;
  editorialNotice: string | null;
  adoptionOutcome: AdoptionWireOutcome | null;
  undoMessage: string | null;
  lastMaiaEditorialTurn: RebuildEditorialThread['turns'][number] | null;
  onOpenWorkspace: (insight?: { readingId: string; key: string }) => void;
  onDismissCarriedInsight: () => void;
  onCloseWorkspace: () => void;
  onReturnToStartingPassage: () => void;
  canReturnToStartingPassage: boolean;
  onDepth: (depth: EditorialDepth) => void;
  onInstruction: (text: string) => void;
  onSendEditorial: (text?: string, options?: {
    proposalPolicy?: 'allow' | 'reply_only';
    proposalRequested?: boolean;
    /** Safe local presentation only; never a durable author turn or permission. */
    displayText?: string;
    /** The teaching button pressed (F1). The server owns the answer's shape. */
    teachingAnchor?: TeachingAnchor;
    /** The free Ask box (Design 3C); the server owns the answer's shape. */
    turnShape?: TurnShape;
    /** The card pressed (conversation-first Focus, step 1); the server owns its instruction. */
    passageAct?: PassageActId;
    /** Where the writer arrived from (F1): identities only; the server loads the observation. */
    origin?: ArrivalOriginRef;
  }) => void;
  /** Retire pending visible editorial result after an author STOP. */
  onStopEditorial: () => void;
  /** R2 "MAIA opens": ask MAIA to speak first in a new conversation. The controller owns the laws. */
  onOpenWithMaia?: () => void | Promise<boolean>;
  openingFailure?: string | null;
  onSelectVersion: (id: string) => void;
  onApply: () => void;
  onUndo?: () => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  /** Step 3: "Use this" saves MAIA's wording as the writer's version and applies it. */
  onUseVersion?: (draft: MemberRevisionDraft) => Promise<boolean>;
  /** Step 3: the writer's just-sent words while MAIA answers (display only). */
  pendingEditorialText?: string | null;
  onSaveWorking: (draft: CraftWorkingSaveDraft) => Promise<boolean>;
  onKeep: () => void;
  onLatitude: (v: EditorialLatitude) => void;
  onMayRemoveParagraphs: (v: boolean) => void;
  onMayProposeImmediately: (v: boolean) => void;
  onReviseInsight: NonNullable<Parameters<typeof InsightReadings>[0]['onRevise']>;
  onChoosePassage: NonNullable<Parameters<typeof InsightReadings>[0]['onChoosePassage']>;
  onStartFreshConversation?: () => void;
  /** Design 1B: open a Develop place for this Work (navigation only). */
  onStudioPlace?: (place: 'develop-overview' | 'editorial-pass') => void;
  onChooseRelationship: (threadId: string) => void;
  onBeginMaiaRelationship: () => void;
  onChooseMaiaRelationship: (relationshipId: string) => void;
  onLeaveMaiaRelationship: () => void;
  onOpenCarryChooser: () => void;
  onCloseCarryChooser: () => void;
  onSelectCarrySource: (source: EligibleCarrySource) => void;
  onRemoveCarrySource: () => void;
};

/* Below the selection, but never so low that the menu (trigger 38px + at
   least 200px of items + 16px margin) would leave the window. */
function selectionMenuTop(rect: DOMRect): number {
  /* Leave room for the whole menu (Focus, Craftsman's Table, Discuss, more). */
  return Math.max(72, Math.min(rect.bottom + 12, window.innerHeight - 420));
}

function selectionInPc3Editor(): { sectionId: string; text: string; rect: DOMRect } | null {
  if (typeof window === 'undefined') return null;

  /* Whole-chapter Edit uses virtualized textareas rather than the legacy
     data-write-editor surface. Text-control selections do not appear in
     window.getSelection(), so read the active textarea directly and preserve
     its owning section id from the always-mounted manuscript shell. */
  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement) {
    const shell = active.closest<HTMLElement>('[data-whole-manuscript-section]');
    const sectionId = shell?.dataset.wholeManuscriptSection;
    const start = active.selectionStart;
    const end = active.selectionEnd;
    const text = start !== end ? active.value.slice(Math.min(start, end), Math.max(start, end)) : '';
    if (sectionId && text.trim()) {
      return { sectionId, text, rect: active.getBoundingClientRect() };
    }
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
  const end = range.endContainer instanceof Element ? range.endContainer : range.endContainer.parentElement;
  const editor = start?.closest<HTMLElement>('[data-write-editor]');
  if (!editor || !end || !editor.contains(end)) return null;
  const sectionId = editor.dataset.sectionId;
  const text = range.toString();
  if (!sectionId || !text.trim()) return null;
  return { sectionId, text, rect: range.getBoundingClientRect() };
}

function cleanProseBlockText(block: WriteBlock): string {
  const text = block.text.trim();
  const wrapped = /^(\*|_)([\s\S]+)\1$/.exec(text);
  return wrapped ? wrapped[2]!.trim() : text;
}

function ChapterProseSurface({ sections, activeId, bodyOf, onEdit }: {
  sections: readonly RebuildSection[];
  activeId: string | null;
  bodyOf: (sectionId: string) => string;
  onEdit: (sectionId: string) => void;
}) {
  const root = sections[0] ?? null;
  if (!root) return null;
  return (
    <div className="p4r1-prose-view" data-prose-view>
      <article className="p4r1-prose-page">
        <h1>{root.heading?.trim() || 'Untitled chapter'}</h1>
        {sections.map((section, index) => {
          const blocks = typesetManuscriptBody(bodyOf(section.draftSectionId));
          const Heading = section.headingDepth === 2 ? 'h2' : 'h3';
          return (
            <section key={section.draftSectionId} className="p4r1-prose-section" data-current={section.draftSectionId === activeId ? 'true' : undefined}>
              {index > 0 && section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
              {blocks.map((block, blockIndex) => {
                if (block.kind === 'folio') return null;
                const text = cleanProseBlockText(block);
                if (block.kind === 'epigraph') return <blockquote key={blockIndex}>{text}</blockquote>;
                if (block.kind === 'subhead') return <h3 key={blockIndex}>{text}</h3>;
                if (block.kind === 'list') return <p key={blockIndex} className="p4r1-prose-list">{text}</p>;
                return <p key={blockIndex}>{text}</p>;
              })}
              <button type="button" className="p4r1-prose-edit" onClick={() => onEdit(section.draftSectionId)}>Edit this section</button>
            </section>
          );
        })}
      </article>
    </div>
  );
}

export function P4R1Pc3WriteEditView(props: P4R1Pc3WriteEditViewProps) {
  const [canvas, setCanvas] = useState(false);
  const [writeReadback, setWriteReadback] = useState<WriteRoomReadback | null>(null);
  const onWriteReadback = useCallback((next: WriteRoomReadback) => {
    setWriteReadback((previous) => previous?.sectionId === next.sectionId
      && previous.requestedBody === next.requestedBody && previous.visibleBody === next.visibleBody
      && previous.state === next.state ? previous : next);
  }, []);
  const workConversationScope = JSON.stringify([props.work?.id ?? null, props.context.manuscriptId]);
  const [workConversationState, setWorkConversationState] = useState(() => ({
    scope: workConversationScope, open: false, starter: '',
  }));
  // Scope is checked during render: a new Work must never receive even one
  // frame of the previous Work's starter or open conversation state.
  const workConversationOpen = workConversationState.scope === workConversationScope && workConversationState.open;
  const workConversationStarter = workConversationState.scope === workConversationScope ? workConversationState.starter : '';
  const setWorkConversationOpen = (open: boolean) => setWorkConversationState(previous => ({
    scope: workConversationScope, open,
    starter: previous.scope === workConversationScope ? previous.starter : '',
  }));
  const setWorkConversationStarter = (starter: string) => setWorkConversationState(previous => ({
    scope: workConversationScope,
    open: previous.scope === workConversationScope && previous.open, starter,
  }));
  useEffect(() => {
    setWorkConversationState(previous => previous.scope === workConversationScope
      ? previous : { scope: workConversationScope, open: false, starter: '' });
  }, [workConversationScope]);
  const [maiaRelationshipChooserOpen, setMaiaRelationshipChooserOpen] = useState(false);
  const [blankArrivalDismissed, setBlankArrivalDismissed] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [passageAsk, setPassageAsk] = useState('');
  const [selectedRevisionEdits, setSelectedRevisionEdits] = useState<ReadonlySet<number>>(new Set());
  const [selectionMenuOpen, setSelectionMenuOpen] = useState(false);
  const [passageNotice, setPassageNotice] = useState<string | null>(null);
  const [requestedPassageAct, setRequestedPassageAct] = useState<(PassageAct & { key: number }) | null>(null);
  const [isolatedEditorial, setIsolatedEditorial] = useState(false);
  // Craftsman's Table is entered only by an author's explicit passage action.
  // Default Write and its already-authorized editorial room remain unchanged.
  const [craftOpen, setCraftOpen] = useState(false);
  // Step 5b: which held passage has MAIA's revisions paused (per passage, presentation only).
  const [pausedPassageKey, setPausedPassageKey] = useState<string | null>(null);
  // Presentation custody is scoped to the Work/manuscript in which the
  // writer explicitly opened Craft. It is NOT a substitute for server auth.
  const [craftOwnerScope, setCraftOwnerScope] = useState<string | null>(null);
  const currentCraftScope = props.work?.id && props.context.manuscriptId
    ? JSON.stringify([props.work.id, props.context.manuscriptId]) : null;
  const craftVisible = craftOpen && currentCraftScope !== null
    && craftOwnerScope === currentCraftScope;
  const craftScopeChanged = craftOpen && !craftVisible;
  const [craftPickerRequest, setCraftPickerRequest] = useState(0);
  const [craftNotice, setCraftNotice] = useState<string | null>(null);
  const craftPort = useRef<CraftTablePort | null>(null);
  const maiaComposerPort = useRef<MaiaCraftComposerPort | null>(null);
  // This is a local, exact-passage gate, not a new durable author preference.
  const craftRevisionPauseRef = useRef(false);
  const pendingCraftDeparture = useRef<{ action: () => void; proof: string; label: string } | null>(null);
  const [craftDiscardOffer, setCraftDiscardOffer] = useState<string | null>(null);
  const [railSelectionId, setRailSelectionId] = useState<string | null>(null);
  const [proseView, setProseView] = useState(() => !props.held && !props.carriedInsight);
  const wholeEditRef = useRef<WholeManuscriptSurfaceHandle | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (props.held || props.carriedInsight || props.workspaceOpen || isolatedEditorial) setProseView(false);
  }, [props.held, props.carriedInsight, props.workspaceOpen, isolatedEditorial]);

  useEffect(() => {
    setBlankArrivalDismissed(false);
  }, [props.focusId]);

  useEffect(() => {
    if (!props.workspaceOpen) {
      if (isolatedEditorial) setIsolatedEditorial(false);
      if (craftOpen) setCraftOpen(false);
      if (craftOwnerScope !== null) setCraftOwnerScope(null);
      return;
    }
    /* Ordinary Focus remains the default. A deliberate Craftsman entry owns
       the separate manuscript workbench and must not be overridden by Focus. */
    if (props.workspaceOpen && props.held && !isolatedEditorial && !craftOpen) {
      setIsolatedEditorial(true);
    }
  }, [props.workspaceOpen, props.held, isolatedEditorial, craftOpen, craftOwnerScope]);

  useEffect(() => {
    craftRevisionPauseRef.current = false;
  }, [currentCraftScope]);

  useEffect(() => {
    if (!craftScopeChanged) return;
    // A retained React shell may change Works without unmounting. Never let
    // another Work see the previous Work's unsent local text or MAIA composer.
    craftPort.current = null;
    maiaComposerPort.current = null;
    pendingCraftDeparture.current = null;
    setCraftDiscardOffer(null);
    setCraftOpen(false);
    setCraftOwnerScope(null);
    setCraftNotice(null);
    setIsolatedEditorial(false);
  }, [craftScopeChanged]);

  useEffect(() => {
    if (!craftVisible) return;
    // Best-effort browser exit warning, never an assertion of durable recovery.
    // The currently mounted author's Table holds the only trusted local draft.
    // Browsers can suppress confirmation dialogs and SPA/sign-out transitions
    // do not emit beforeunload; those require separate authenticated controls.
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      const maia = maiaComposerPort.current?.snapshot();
      if (assessCraftNavigation(craftPort.current?.snapshot() ?? null).allowed
        && !maia?.text.length) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [craftVisible]);

  useEffect(() => {
    setSelectedRevisionEdits(new Set());
  }, [
    props.suggestedVersion?.id,
    props.held?.draftSectionId,
    props.held?.start,
    props.held?.end,
    props.held?.text,
  ]);

  const projection = projectPc3LiveWrite({
    sections: props.context.sections,
    activeId: props.writing.activeId,
    bodyOf: props.writing.bodyOf,
    statusOf: props.writing.statusOf,
    workTitle: props.work?.title ?? null,
    manuscriptTitle: props.context.title,
  });
  const proseSections = props.focusId
    ? (chapterSpanFor(props.context.sections, props.focusId)?.sections
      ?? props.context.sections.filter((section) => section.draftSectionId === props.focusId))
    : [];
  const proseAvailable = proseSections.length > 1;
  const chapterWriting = useMemo<SectionWriting>(() => {
    const ids = new Set(proseSections.map((section) => section.draftSectionId));
    const sections = props.writing.sections.filter((section) => ids.has(section.id));
    const active = sections.find((section) => section.id === props.writing.activeId) ?? sections[0] ?? null;
    return {
      ...props.writing,
      sections,
      activeId: active?.id ?? null,
      active,
      activeBody: active ? props.writing.bodyOf(active.id) : '',
    };
  }, [props.writing, proseSections]);

  // One departure boundary for every Craft navigation action. Draft authority
  // stays inside the mounted author-owned Table; no URL/local storage recovery.
  const discardProof = (snapshot: CraftTableSnapshot, maia: MaiaCraftComposerSnapshot) => JSON.stringify({
    snapshot, maia,
    workId: props.work?.id ?? null,
    sectionId: props.focusId,
    revision: props.writing.currentRevisionId(),
    held: props.held,
  });
  const clearPendingDeparture = () => {
    pendingCraftDeparture.current = null;
    setCraftDiscardOffer(null);
  };
  const requestCraftDeparture = (label: string, action: () => void): boolean => {
    if (craftScopeChanged) {
      clearPendingDeparture();
      setCraftNotice('The Work changed. This Craft session is no longer available. Nothing moved.');
      return false;
    }
    if (!craftOpen) { action(); return true; }
    if (!props.workspaceOpen || props.editorialBusy || props.adoptionBusy || props.memberVersionBusy) {
      setCraftNotice('This Craft session is busy or unavailable. Nothing was moved.');
      return false;
    }
    const snapshot = craftPort.current?.snapshot();
    const maiaDraft = maiaComposerPort.current?.snapshot();
    const held = props.held;
    const expectedKey = held ? craftTargetKey({
      sectionId: held.draftSectionId, start: held.start, end: held.end, text: held.text,
    }) : null;
    const currentBody = held ? props.writing.bodyOf(held.draftSectionId) : '';
    const aligned = held && held.draftSectionId === props.focusId
      && held.revisionNumber === props.writing.currentRevisionId()
      && Array.from(currentBody).slice(held.start, held.end).join('') === held.text;
    if (!snapshot || !maiaDraft || !expectedKey || snapshot.key !== expectedKey
      || maiaDraft.focusKey !== expectedKey
      || snapshot.original !== held?.text || !aligned || !props.work?.id) {
      clearPendingDeparture();
      setCraftNotice('The author-owned Craft draft or passage could not be verified. Nothing was moved.');
      return false;
    }
    // One pure policy now governs the adjacent passage tools, room switches,
    // manuscript rail and explicit Next Focus. Current version storage carries
    // wording, not kept marks: do not classify session-only decisions as saved.
    const decision = assessCraftNavigation(snapshot);
    if (!decision.allowed) {
      if (decision.reason === 'unsaved') {
        pendingCraftDeparture.current = { action, proof: discardProof(snapshot, maiaDraft), label };
        setCraftDiscardOffer(label);
      } else {
        clearPendingDeparture();
      }
      setCraftNotice(craftNavigationRefusal(decision.reason));
      return false;
    }
    // The manuscript working copy and the MAIA composer are separate author
    // intentions. Neither may be silently dropped during a Focus transition.
    if (maiaDraft.text.length > 0) {
      pendingCraftDeparture.current = { action, proof: discardProof(snapshot, maiaDraft), label };
      setCraftDiscardOffer(label);
      setCraftNotice('Your MAIA wording has not been confirmed as delivered. Stay and keep it, or explicitly discard it before moving. Nothing was saved, sent or applied by this navigation.');
      return false;
    }
    clearPendingDeparture();
    action();
    return true;
  };
  const confirmCraftDiscard = () => {
    const pending = pendingCraftDeparture.current;
    const snapshot = craftPort.current?.snapshot();
    const maiaDraft = maiaComposerPort.current?.snapshot();
    const held = props.held;
    const expectedKey = held ? craftTargetKey({
      sectionId: held.draftSectionId, start: held.start, end: held.end, text: held.text,
    }) : null;
    if (!pending || !snapshot || !maiaDraft || !expectedKey || !held
      || maiaDraft.focusKey !== expectedKey || snapshot.key !== expectedKey
      || snapshot.directEditing || snapshot.customEditId !== null
      || pending.proof !== discardProof(snapshot, maiaDraft)
      || held.draftSectionId !== props.focusId
      || held.revisionNumber !== props.writing.currentRevisionId()
      || Array.from(props.writing.bodyOf(held.draftSectionId)).slice(held.start, held.end).join('') !== held.text) {
      clearPendingDeparture();
      setCraftNotice('The draft or Source changed since the discard request. Nothing was discarded or moved.');
      return;
    }
    clearPendingDeparture();
    pending.action();
  };

  useEffect(() => {
    pendingCraftDeparture.current = null;
    setCraftDiscardOffer(null);
  }, [craftOpen, props.work?.id, props.focusId, props.held?.draftSectionId, props.held?.start, props.held?.end]);

  const go = useCallback((sectionId: string | null) => {
    if (!sectionId) return;
    /* With the conversation in the centre, going to a place brings the manuscript back there (the conversation is kept as a thread;
       only an unsent draft is asked about). */
    if (workConversationOpen) {
      if (!requestConversationDeparture()) return;
      setWorkConversationOpen(false);
      setWorkConversationStarter('');
    }
    /* Same section is an attention gesture, not a destructive transition. */
    if (sectionId === props.writing.activeId) { setRailSelectionId(sectionId); return; }
    requestCraftDeparture('Move to another manuscript section', () => {
      // Revalidate section membership and editability at the author gesture.
      if (!props.context.sections.some(section => section.draftSectionId === sectionId)) return;
      setRailSelectionId(sectionId);
      props.writing.goToSection(sectionId);
      props.onFocusSection(sectionId);
    });
  }, [props, craftOpen, workConversationOpen]);

  useEffect(() => {
    const inspect = () => {
      // Typing to MAIA in the door moves focus out of the manuscript, which drops the
      // browser's text selection. The passage is already held; the door must stay open.
      if (typeof document !== 'undefined'
        && document.activeElement?.closest?.('[data-p4r1-selection-affordance]')) return;
      const picked = selectionInPc3Editor();
      if (!picked) {
        setSelectionRect(null);
        setSelectionMenuOpen(false);
        return;
      }
      const section = props.context.sections.find((candidate) => candidate.draftSectionId === picked.sectionId);
      const live = section ? props.writing.bodyOf(section.draftSectionId) : '';
      const located = locateUniquePassage(live, picked.text);
      if (!section || !located) {
        setSelectionRect(null);
        setSelectionMenuOpen(false);
        return;
      }
      props.onHoldPassage(section, located.start, located.end, picked.text);
      setSelectionRect(picked.rect);
    };

    document.addEventListener('selectionchange', inspect);
    return () => document.removeEventListener('selectionchange', inspect);
  }, [props.context.sections, props.writing, props.onHoldPassage]);

  if (!projection) {
    return <main className="fr-root"><div style={{ padding: 32 }}>This manuscript has no editable place to open.</div></main>;
  }

  /* While MAIA waits for the writer to choose which conversation, nothing is being worked
     on: the writer must be free to leave (which cancels the waiting request). */
  const awaitingConversationChoice = (props.conversationChoices?.length ?? 0) > 1;
  const busy = (props.editorialBusy && !awaitingConversationChoice) || props.adoptionBusy || props.memberVersionBusy;
  const currentBody = props.focusId ? props.writing.bodyOf(props.focusId) : '';
  const visibleUndoMessage = undoMessageForVisibleDraft(props.undoMessage, writeReadback, props.focusId, currentBody);
  const currentText = props.held?.draftSectionId === props.focusId
    ? props.held.text
    : currentBody;
  /* Focus's "Your passage" panel shows the passage as it stands. After the writer's own
     apply rewrites it, the held text is the old wording; the conversation's live
     application locates the new words (Undo puts the held text back in place). */
  const heldStillLive = props.held?.draftSectionId === props.focusId
    && Array.from(currentBody).slice(props.held.start, props.held.end).join('') === props.held.text;
  const appliedPassage = !heldStillLive && props.editorialThread
    ? resolveEditorialReturnBinding(props.editorialThread, currentBody)
    : null;
  const passageShown = focusPassageShown({ currentText, heldStillLive, binding: appliedPassage });

  const focusRealEditor = () => {
    setBlankArrivalDismissed(true);
    const sectionId = props.focusId;
    const reveal = () => {
      const selector = sectionId
        ? `[data-write-editor][data-section-id="${CSS.escape(sectionId)}"]`
        : '[data-write-editor]';
      const editor = document.querySelector<HTMLElement>(selector);
      if (!editor) return false;
      editor.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      editor.focus({ preventScroll: true });
      if (document.activeElement !== editor) return false;
      // A focused EMPTY contentEditable div can have no insertion range in
      // Chromium, even though activeElement is correct. Put the caret in its
      // already-rendered empty paragraph; do not seed or modify any author text.
      // If the writer has already begun typing in the two frames before this
      // runs, the browser has placed the caret correctly: leave it alone.
      const alreadyBegun = (editor.textContent ?? '').length > 0;
      const selection = window.getSelection();
      if (selection && !alreadyBegun) {
        const firstLine = editor.querySelector('p') ?? editor;
        const insertion = document.createRange();
        insertion.selectNodeContents(firstLine);
        insertion.collapse(true);
        selection.removeAllRanges();
        selection.addRange(insertion);
      }
      return true;
    };
    // The arrival overlay and editor share the same room. Give React one paint
    // to remove the overlay, then reveal the already-mounted editor. A short
    // fallback covers slower Safari layout without minting another editor.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!reveal()) window.setTimeout(reveal, 80);
      });
    });
  };

  const navigateMode: P4R1Pc3WriteEditViewProps['onMode'] = (mode) => {
    if (!requestConversationDeparture()) return;
    requestCraftDeparture('Switch Studio room', () => props.onMode(mode));
  };

  const openWorkConversation = (starter = '') => {
    if (workConversationOpen && starter !== workConversationStarter && !requestConversationDeparture()) return;
    setWorkConversationStarter(starter);
    setWorkConversationOpen(true);
  };

  const blankArrivalVisible = Boolean(
    props.work
    && props.focusId
    && currentBody.trim().length === 0
    && !blankArrivalDismissed
    && !workConversationOpen
    && !props.workspaceOpen
    && !isolatedEditorial
    && !canvas,
  );

  const proposalMarkable = Boolean(
    props.editorialThread
    && props.suggestedVersion
    && props.held
    && props.focusId
    && props.held.draftSectionId === props.focusId
    && props.editorialThread.targetSectionId === props.focusId
    && props.editorialThread.locusText === props.held.text
    && props.suggestedVersion.wording !== props.held.text
  );

  const toggleRevisionEdit = (editId: number) => {
    setSelectedRevisionEdits((previous) => {
      const next = new Set(previous);
      if (next.has(editId)) next.delete(editId);
      else next.add(editId);
      return next;
    });
  };

  const whyRevisionEdit = (edit: RevisionEdit) => {
    props.onOpenWorkspace();
    // F1: only the writer's words are stored; how MAIA answers is the server-owned
    // change-why act, the same one Craftsman's Table's "Why?" sends.
    props.onSendEditorial(passageActQuestion(
      'change-why',
      edit.from ? `the change from "${edit.from.trim()}" to "${edit.to.trim()}"` : `adding "${edit.to.trim()}"`,
    ), { proposalPolicy: 'reply_only', passageAct: 'change-why' });
  };

  const teachRevisionEdit = (edit: RevisionEdit) => {
    props.onDepth('learning');
    props.onOpenWorkspace();
    props.onSendEditorial(teachingQuestion(
      'change',
      edit.from ? `changing "${edit.from.trim()}" to "${edit.to.trim()}"` : `adding "${edit.to.trim()}"`,
    ), { teachingAnchor: 'change' });
  };

  const changeRevisionEdit = (edit: RevisionEdit) => {
    props.onOpenWorkspace();
    props.onInstruction(
      edit.from
        ? `I want a different direction for "${edit.from.trim()}". Keep my intention and voice, but show me another possibility.`
        : `I want a different direction for this proposed addition: "${edit.to.trim()}". Keep my intention and voice.`,
    );
  };

  const saveSelectedRevision = async () => {
    if (!props.editorialThread || !props.suggestedVersion || !props.held || selectedRevisionEdits.size === 0) return;
    const text = composeSelected(
      editorialSegments(props.held.text, props.suggestedVersion.wording),
      selectedRevisionEdits,
    );
    const ok = await props.onSaveMember({
      threadId: props.editorialThread.threadId,
      sectionId: props.held.draftSectionId,
      supersedes: props.suggestedVersion.id,
      text,
      purpose: 'Member-selected changes from MAIA proposal',
    });
    if (ok) setSelectedRevisionEdits(new Set());
  };


  /* Design 1B: a control MAIA offered and the writer clicked. Each one only
     takes the writer somewhere; nothing is sent, read, saved or applied. */
  // Craftsman's Table on the held passage, only if its words are still exactly
  // the ones held. Shared by the passage menu and MAIA's offered control (1B).
  const openCraftOnHeld = () => {
    if (!props.held || !currentCraftScope) return;
    const body = props.writing.bodyOf(props.held.draftSectionId);
    const exact = Array.from(body).slice(props.held.start, props.held.end).join('');
    if (exact !== props.held.text
      || props.held.revisionNumber !== props.writing.currentRevisionId()) {
      setCraftNotice('The passage changed. Select its current words again; nothing was applied.');
      return;
    }
    setCraftNotice(null);
    setCanvas(false);
    setIsolatedEditorial(false);
    setCraftOwnerScope(currentCraftScope);
    setCraftOpen(true);
    props.onOpenWorkspace();
  };

  const onStudioAction = (id: StudioActionId) => {
    if (id === 'craftsmans-table') {
      if (!requestConversationDeparture()) return;
      openCraftOnHeld();
      return;
    }
    if (id === 'develop-overview' || id === 'editorial-pass') {
      requestCraftDeparture('Switch Studio room', () => props.onStudioPlace?.(id));
      return;
    }
    props.onStartFreshConversation?.();
  };

  // Every passage action needs a Living Work. Without one the MAIA panel (where
  // refusals are normally shown) is not on screen, so an action used to do
  // nothing at all. Say why, here, where the writer just clicked.
  const NO_WORK_NOTICE = 'MAIA works inside a Living Work. This manuscript is not in exactly one declared Work yet, so nothing was sent. Declare it as a Work (or choose one Work if several include it), then try again.';
  const requireWork = (): boolean => {
    if (props.work) { setPassageNotice(null); return true; }
    setPassageNotice(NO_WORK_NOTICE);
    return false;
  };
  const passageGatesOpen = () => props.sessionPosture.resolved && !props.sessionPosture.sanctuary
    && Boolean(props.maiaRelationship);
  // One path for every MAIA-backed passage act. If a gate (privacy posture, MAIA
  // relationship) is still open the act is HELD and continues once the writer has
  // answered it, never sent early and never dropped. Under Sanctuary it never runs.
  const runPassageAct = (act: PassageAct, isolate = false) => {
    if (!requireWork()) return;
    setSelectionMenuOpen(false);
    if (passageGatesOpen()) {
      if (act.depth) props.onDepth(act.depth);
      props.onOpenWorkspace();
      if (isolate) setIsolatedEditorial(true);
      props.onSendEditorial(act.prompt, act.options);
      return;
    }
    setRequestedPassageAct({ key: Date.now(), ...act });
    props.onOpenWorkspace();
    if (isolate) setIsolatedEditorial(true);
  };

  // Craftsman's Table has its own passage controls; the selection pill would
  // float over MAIA's panel there with nothing selected.
  const contextualActions = selectionRect && props.held && !isolatedEditorial && !craftVisible ? (
    <div
      className="p4r1-selection-affordance"
      style={{
        ...appearanceVars(props.appearance),
        left: Math.max(14, Math.min(selectionRect.right - 150, window.innerWidth - Math.min(310, window.innerWidth - 28) - 14)),
        top: selectionMenuTop(selectionRect),
        '--p4r1-menu-room': `${window.innerHeight - selectionMenuTop(selectionRect) - 54}px`,
      } as CSSProperties}
      data-p4r1-selection-affordance
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="p4r1-selection-trigger"
        aria-expanded={selectionMenuOpen}
        onClick={() => setSelectionMenuOpen((open) => { if (!open) { setPassageAsk(''); setPassageNotice(null); } return !open; })}
      >
        Talk with MAIA <span aria-hidden="true">›</span>
      </button>

      {selectionMenuOpen ? (
        <div className="p4r1-selection-menu" role="menu">
          {passageNotice ? (
            <div role="status" className="p4r1-selection-notice" style={{ margin: '6px 10px', fontSize: '0.85em', lineHeight: 1.4 }}>
              <p style={{ margin: 0 }}>{passageNotice}</p>
              {passageNotice === NO_WORK_NOTICE ? (
                <button type="button" data-open-home-to-declare onClick={() => { setSelectionMenuOpen(false); props.onMode('home'); }}>
                  Open Home to declare this Work
                </button>
              ) : null}
            </div>
          ) : null}
          {/* Doors ruling (founder, 2026-11-05): ONE door. A writer who knows what they want
              says it in their own words; one who doesn't picks a plain choice and MAIA offers
              options. Every path opens the same conversation. Kept small on purpose:
              overwhelm is easy to reach. */}
          <form
            className="p4r1-selection-ask"
            data-passage-ask
            onSubmit={(event) => {
              event.preventDefault();
              const words = passageAsk.trim();
              if (!words) return;
              setPassageAsk('');
              runPassageAct({ label: words, prompt: words, options: { turnShape: 'conversation' } }, true);
            }}
          >
            <input
              aria-label="Tell MAIA what you want"
              placeholder="Tell MAIA what you want…"
              value={passageAsk}
              onChange={(event) => setPassageAsk(event.target.value)}
              autoFocus
            />
          </form>
          <p className="p4r1-selection-or">or let MAIA offer</p>
          <button type="button" role="menuitem" data-passage-choice="discuss" onClick={() => runPassageAct({
            label: 'What’s happening here?',
            prompt: passageActQuestion('discuss'),
            options: { proposalPolicy: 'reply_only', passageAct: 'discuss' },
          }, true)}>
            What’s happening here?
          </button>
          <button type="button" role="menuitem" data-passage-choice="revise" onClick={() => runPassageAct({
            label: 'Show me an edit',
            prompt: passageActQuestion('revise'),
            options: { proposalPolicy: 'allow', proposalRequested: true, passageAct: 'revise' },
          }, true)}>
            Show me an edit
          </button>
          {/* The implicit Academy's front door: one step from a selected passage
              (SEMANTIC-FIELD-01 teaching plan, 2026-11-01). */}
          <button type="button" role="menuitem" data-passage-choice="teach" data-teach-me-entry onClick={() => runPassageAct({
            label: 'Teach me the craft',
            prompt: teachingQuestion('passage'),
            depth: 'learning',
            options: { proposalPolicy: 'reply_only', teachingAnchor: 'passage' },
          }, true)}>
            Teach me the craft
          </button>
        </div>
      ) : null}
    </div>
  ) : null;


  const maiaRelationshipCard = props.work && !canvas ? (
    <section
      className="p4r1-context-card p4r1-maia-relationship"
      data-p4r1-maia-relationship
      aria-label="Relationship with MAIA"
    >
      <header className="p4r1-context-head">
        <div>
          <span>Relationship with MAIA</span>
          <strong>
            {props.maiaRelationship
              ? 'Continuing one relationship across this Work'
              : 'Choose whether this Work should carry a continuing MAIA relationship'}
          </strong>
        </div>
        {props.maiaRelationship ? (
          <button
            type="button"
            disabled={props.maiaRelationshipBusy}
            onClick={() => setMaiaRelationshipChooserOpen((open) => !open)}
          >
            {maiaRelationshipChooserOpen ? 'Close' : 'Change'}
          </button>
        ) : null}
      </header>

      {props.maiaRelationshipPhase === 'loading' ? (
        <p className="p4r1-empty">Restoring your relationship with MAIA…</p>
      ) : props.maiaRelationshipPhase === 'unavailable' ? (
        <p className="p4r1-empty">
          {props.maiaRelationshipMessage ?? 'Your MAIA relationships are unavailable just now. Nothing was changed.'}
        </p>
      ) : props.maiaRelationship ? (
        <div>
          <p className="p4r1-empty">
            Editorial acts can carry this relationship without merging distinct passages or Review findings.
          </p>
          <p className="p4r1-empty">
            Started {new Date(props.maiaRelationship.createdAt).toLocaleString()} · {props.maiaRelationship.episodeCount} carried act{props.maiaRelationship.episodeCount === 1 ? '' : 's'}
          </p>
          {maiaRelationshipChooserOpen ? (
            <div className="p4r1-relationships" data-p4r1-maia-relationship-chooser>
              {props.maiaRelationshipChoices
                .filter((choice) => choice.id !== props.maiaRelationship?.id)
                .map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={props.maiaRelationshipBusy}
                    onClick={() => {
                      props.onChooseMaiaRelationship(choice.id);
                      setMaiaRelationshipChooserOpen(false);
                    }}
                  >
                    Continue relationship · {new Date(choice.createdAt).toLocaleDateString()}
                  </button>
                ))}
              <button
                type="button"
                disabled={props.maiaRelationshipBusy}
                onClick={() => {
                  props.onBeginMaiaRelationship();
                  setMaiaRelationshipChooserOpen(false);
                }}
              >
                Begin another relationship
              </button>
              <button
                type="button"
                disabled={props.maiaRelationshipBusy}
                onClick={() => {
                  props.onLeaveMaiaRelationship();
                  setMaiaRelationshipChooserOpen(false);
                }}
              >
                Leave relationship · nothing is deleted
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="p4r1-empty">
            No continuing MAIA relationship is selected. Ordinary writing remains fully available.
          </p>
          <div className="p4r1-relationships">
            <button
              type="button"
              disabled={props.maiaRelationshipBusy}
              onClick={props.onBeginMaiaRelationship}
            >
              {props.maiaRelationshipBusy ? 'Beginning…' : 'Begin relationship with MAIA'}
            </button>
            {props.maiaRelationshipChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                disabled={props.maiaRelationshipBusy}
                onClick={() => props.onChooseMaiaRelationship(choice.id)}
              >
                Continue relationship · {new Date(choice.createdAt).toLocaleDateString()}
              </button>
            ))}
          </div>
          {props.maiaRelationshipMessage ? (
            <p className="p4r1-empty" role="status">{props.maiaRelationshipMessage}</p>
          ) : null}
        </div>
      )}
    </section>
  ) : null;

  const workConversation = props.work && workConversationOpen ? (
    <div className="p4r1-context-card p4r1-work-conversation" data-p4r1-work-conversation>
      <WorkConversation
        key={`${props.work.id}:${workConversationStarter}`}
        work={props.work}
        manuscriptId={props.context.manuscriptId}
        sectionId={props.focusId}
        initialDraft={workConversationStarter}
        onStudioPlace={props.onStudioPlace}
        onClose={() => {
          setWorkConversationOpen(false);
          setWorkConversationStarter('');
        }}
      />
    </div>
  ) : null;

  /* The conversation about the Work, in the centre (founder direction 2026-11-12). The manuscript is one click away. */
  const workCentre = workConversation ? (
    <div className="p4r1-work-conversation-centre" data-write-centre-conversation="true" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 24px', height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span className="p4r1-eyebrow">Talking with MAIA · {props.work?.title || 'this Work'}</span>
        <button type="button" data-write-centre-back="true" onClick={() => { if (!requestConversationDeparture()) return; setWorkConversationOpen(false); setWorkConversationStarter(''); }}
          style={{ font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'inherit', background: 'none', border: '1px solid color-mix(in srgb, currentColor 22%, transparent)', borderRadius: 999, padding: '3px 11px' }}>
          Back to the page
        </button>
      </div>
      {workConversation}
    </div>
  ) : null;

  const craftRevision = props.writing.currentRevisionId();
  const craftSection = props.held
    ? props.context.sections.find(section => section.draftSectionId === props.held!.draftSectionId) ?? null
    : null;
  const craftBody = props.held ? props.writing.bodyOf(props.held.draftSectionId) : '';
  const craftAligned = Boolean(props.held && craftSection && craftSection.editable
    && props.held.draftSectionId === props.focusId
    && craftRevision === props.held.revisionNumber
    && Array.from(craftBody).slice(props.held.start, props.held.end).join('') === props.held.text);
  const craftTarget: CraftFocusTarget | null = craftAligned && props.held && craftSection ? {
    sectionId: props.held.draftSectionId,
    start: props.held.start,
    end: props.held.end,
    text: props.held.text,
    revisionNumber: props.held.revisionNumber,
    label: craftParagraphLabel(props.held.text),
    sectionLabel: craftSection.heading || 'Untitled section',
    source: 'writer',
  } : null;
  const craftThread = craftTarget && props.editorialThread
    && props.editorialThread.targetSectionId === craftTarget.sectionId
    && props.editorialThread.locusText === craftTarget.text
    ? props.editorialThread : null;
  const craftVersion = craftThread && props.suggestedVersion
    && craftThread.versions.some(version => version.id === props.suggestedVersion?.id)
    ? props.suggestedVersion : null;
  const craftTargets = craftTarget
    ? paragraphTargets(props.context.sections, props.writing.bodyOf, craftRevision)
    : [];
  const nextCraft = adjacentCraftTarget(craftTargets, craftTarget, 'next');

  /* Conversation-first step 5b: pausing MAIA's revisions is per passage. While paused,
     every Focus request asks for a reply only (no new wording); talking continues. */
  const heldKey = props.held
    ? JSON.stringify([props.held.draftSectionId, props.held.start, props.held.end, props.held.text])
    : null;
  const passageRevisionsPaused = heldKey !== null && pausedPassageKey === heldKey;
  /* Work-wide "MAIA asks, never rewrites" (ledger #1938, 2026-11-13). The writer's own
     durable setting on the Work, saved through the member's Work PATCH; the server
     enforces it on every editorial turn whatever this view sends. Here it only keeps
     the controls honest: while it is on, every passage behaves as paused. */
  const [workRevisionsPaused, setWorkRevisionsPaused] = useState(props.work?.maiaRevisionsPaused === true);
  const [workPauseSaving, setWorkPauseSaving] = useState(false);
  const [workPauseError, setWorkPauseError] = useState<string | null>(null);
  useEffect(() => {
    setWorkRevisionsPaused(props.work?.maiaRevisionsPaused === true);
    setWorkPauseError(null);
  }, [props.work?.id, props.work?.maiaRevisionsPaused]);
  const saveWorkRevisionsPaused = useCallback(async (paused: boolean) => {
    const workId = props.work?.id;
    if (!workId) return;
    setWorkPauseSaving(true);
    setWorkPauseError(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maiaRevisionsPaused: paused }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setWorkRevisionsPaused(paused);
    } catch {
      setWorkPauseError('Could not save that just now. Nothing changed.');
    } finally {
      setWorkPauseSaving(false);
    }
  }, [props.work?.id]);
  const revisionsPaused = passageRevisionsPaused || workRevisionsPaused;
  const focusSend: P4R1Pc3WriteEditViewProps['onSendEditorial'] = (text, options) => {
    props.onSendEditorial(text, pausedSendOptions(options, revisionsPaused));
  };
  // Step 5b: the next paragraph, from Craftsman's Table's own passage logic. Moving
  // opens that passage's own conversation; nothing is saved or applied by moving.
  const focusNextPassage = nextCraft && props.workspaceOpen ? () => {
    if (busy || !targetStillMatches(nextCraft, props.writing.bodyOf(nextCraft.sectionId), craftRevision)) return;
    const section = props.context.sections.find((s) => s.draftSectionId === nextCraft.sectionId);
    if (!section?.editable || !requestConversationDeparture()) return;
    if (nextCraft.sectionId !== props.focusId) {
      props.writing.goToSection(nextCraft.sectionId);
      props.onFocusSection(nextCraft.sectionId);
    }
    props.onHoldPassage(section, nextCraft.start, nextCraft.end, nextCraft.text);
  } : undefined;
  const focusAskWhereNext = props.held ? () => {
    if (busy) return;
    focusSend(passageActQuestion('where-next'), { proposalPolicy: 'reply_only', passageAct: 'where-next' });
  } : undefined;

  /* Conversation-first step 5 (founder adoption 2026-11-03): Craftsman's Table's
     change-by-change mode lives inside Focus, opened by Adjust on the option card.
     Same component and the same save/apply props; its sends go into this conversation. */
  const focusDeeper = props.held && props.editorialThread ? (
    <CraftsmansTableR1
      compact
      sections={props.context.sections}
      bodyOf={props.writing.bodyOf}
      held={props.held}
      thread={props.editorialThread}
      version={props.suggestedVersion ?? null}
      busy={busy}
      onSend={(text, options) => {
        if (!text?.trim() || busy) return;
        focusSend(text, {
          proposalPolicy: options?.proposalPolicy === 'reply_only' ? 'reply_only' : 'allow',
          ...(options?.proposalRequested ? { proposalRequested: true } : {}),
          ...(options?.teachingAnchor ? { teachingAnchor: options.teachingAnchor } : {}),
          ...(options?.passageAct ? { passageAct: options.passageAct } : {}),
        });
      }}
      onSaveMember={props.onSaveMember}
      onSaveWorking={props.onSaveWorking}
      onApply={props.onApply}
      appliedVersionId={props.appliedVersionId}
      onUndo={props.onUndo}
    />
  ) : undefined;

  const editorial = props.workspaceOpen && !isolatedEditorial && !props.held ? (
    <div className="p4r1-context-card p4r1-editorial" data-p4r1-editorial>
      <header className="p4r1-context-head">
        <div>
          <span>In relation to this passage</span>
          <strong>{passagePlaceLabel(
            props.context.sections.find((s) => s.draftSectionId === props.focusId),
            currentBody,
            null,
          )}</strong>
        </div>
        <div>
          <button type="button" disabled={busy} onClick={() => setIsolatedEditorial(true)}>Isolate passage</button>
          {props.canReturnToStartingPassage ? (
            <button type="button" disabled={busy} onClick={props.onReturnToStartingPassage}>Return</button>
          ) : null}
          <button type="button" disabled={busy} onClick={props.onCloseWorkspace}>Close</button>
        </div>
      </header>

      <EditorialDancePanel
        stage
        conversationChoices={props.conversationChoices ?? []}
        onChooseConversation={props.onChooseConversation}
        onStartNewConversation={props.onStartNewFromChoice}
        earlierThread={props.earlierEditorialThread ?? null}
        onStudioAction={onStudioAction}
        onUseVersion={props.onUseVersion}
        deeper={focusDeeper}
        revisionsPaused={revisionsPaused}
        pendingQuestion={props.pendingEditorialText ?? null}
        manuscriptTitle={props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'this passage'}
        currentText={currentText}
        sectionBody={currentBody}
        thread={props.editorialThread}
        version={props.suggestedVersion}
        lastMaiaTurn={props.lastMaiaEditorialTurn}
        appliedVersionId={props.appliedVersionId}
        busy={busy}
        sessionPosture={props.sessionPosture}
        onChooseSessionPosture={props.onChooseSessionPosture}
        notice={props.editorialNotice}
        maiaRelationship={props.work ? {
          active: Boolean(props.maiaRelationship),
          busy: props.maiaRelationshipBusy,
          choices: props.maiaRelationshipChoices,
          message: props.maiaRelationshipMessage,
          onBegin: props.onBeginMaiaRelationship,
          onChoose: props.onChooseMaiaRelationship,
        } : null}
        message={props.editorialFailure ?? (props.adoptionOutcome && props.appliedVersionId === props.suggestedVersion?.id
          ? props.adoptionOutcome.kind === 'applied' ? null : 'The Work could not accept this revision. Nothing was changed.'
          : null)}
        undoMessage={visibleUndoMessage}
        onSelectVersion={props.onSelectVersion}
        onSend={focusSend}
        requestedAct={requestedPassageAct}
        onRequestedActTaken={() => setRequestedPassageAct(null)}
        onSaveMember={props.onSaveMember}
        onApply={props.onApply}
        onUndo={props.onUndo}
        onKeep={props.onKeep}
        onDepth={props.onDepth}
      />

      <details className="p4r1-editorial-deeper">
        <summary>More editorial controls</summary>
        <RevisionDesk
          active
          inline={false}
          depth={props.editorialDepth}
          onDepth={props.onDepth}
          showInspiration={!props.workspaceInsight}
          scopeKey={JSON.stringify([props.context.manuscriptId, props.focusId, currentText])}
          manuscriptId={props.context.manuscriptId}
          title={props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'this passage'}
          currentText={currentText}
          sectionBody={currentBody}
          thread={props.editorialThread}
          version={props.suggestedVersion}
          instruction={props.editorialDraft}
          onInstruction={props.onInstruction}
          onSend={props.onSendEditorial}
          onSelectVersion={props.onSelectVersion}
          onApply={props.onApply}
          onSaveMember={props.onSaveMember}
          busy={busy}
          message={props.editorialFailure ?? (props.adoptionOutcome && props.appliedVersionId === props.suggestedVersion?.id
            ? props.adoptionOutcome.kind === 'applied' ? null : 'The Work could not accept this revision. Nothing was changed.'
            : null)}
          response={props.lastMaiaEditorialTurn?.body ?? null}
          onKeep={props.onKeep}
          appliedVersionId={props.appliedVersionId}
          onUndo={props.onUndo}
          undoMessage={visibleUndoMessage}
          latitude={props.editLatitude}
          onLatitude={props.onLatitude}
          mayRemoveParagraphs={props.mayRemoveParagraphs}
          onMayRemoveParagraphs={props.onMayRemoveParagraphs}
          mayProposeImmediately={props.mayProposeImmediately}
          onMayProposeImmediately={props.onMayProposeImmediately}
          voiceNotice={props.voiceNotice}
          carrySourceAvailable={props.carrySourceAvailable}
          carryChooser={props.carryChooser}
          selectedCarrySource={props.selectedCarrySource}
          onOpenCarryChooser={props.onOpenCarryChooser}
          onCloseCarryChooser={props.onCloseCarryChooser}
          onSelectCarrySource={props.onSelectCarrySource}
          onRemoveCarrySource={props.onRemoveCarrySource}
        />
      </details>

      {props.workspaceInsight ? (
        <details className="p4r1-related" open={!props.suggestedVersion}>
          <summary>{props.suggestedVersion ? 'Reading behind these edits' : 'Observation and related passages'}</summary>
          <InsightReadings
            key={props.context.manuscriptId}
            refreshKey={props.context.version}
            manuscriptId={props.context.manuscriptId}
            readingId={props.workspaceInsight.readingId}
            observationKey={props.workspaceInsight.key}
            onRevise={props.onReviseInsight}
            onChoosePassage={props.onChoosePassage}
            proposalActive={Boolean(props.suggestedVersion)}
            busy={busy}
          />
        </details>
      ) : null}

    </div>
  ) : null;

  const railSection = props.context.sections.find(
    (section) => section.draftSectionId === (railSelectionId ?? props.focusId),
  ) ?? null;
  const railLabel = railSection
    ? railSection.heading?.trim() || `Section ${railSection.position + 1}`
    : 'this section';

  const [coverageEpoch, setCoverageEpoch] = useState(0);
  const writeMaia = props.work ? (
    <div className="fr-maia-inner p4r1-write-maia">
      <div className="fr-maia-head">
        <div className="fr-orb" aria-hidden="true" />
        <div className="fr-maia-name">
          <h2>MAIA</h2>
          <span>{railSelectionId ? `In relation to ${railLabel}` : 'In relation to this writing place'}</span>
        </div>
        <span className="fr-dots" aria-hidden="true">•••</span>
      </div>
      <div className="fr-mbody">
        {/* What she has read of this draft, always first, never a guess (WS-RELATIONAL-ARCHITECTURE step 1). */}
        <div data-write-coverage="true" style={{ marginBottom: 10 }}>
          <CoverageLine
            manuscriptId={props.context.manuscriptId}
            refreshKey={`${props.context.draftRevision ?? 'x'}:${coverageEpoch}`}
            labelOf={(id) => { const sec = props.context.sections.find((x) => x.draftSectionId === id); return sec ? (sec.heading?.trim() || `Section ${sec.position + 1}`) : 'a section'; }}
          />
        </div>
        {/* MAIA's letter and the walk: beside the manuscript, never instead of it. It stays mounted while the writer talks with
            MAIA, so the place they were on in the walk is still theirs when they come back. */}
        {/* S5 (F16): no "Read my book" when there is no book yet; on a first page, B's "Show MAIA this page" is the offer.
            Not mounted at all then, so reading by herself (when switched on) cannot start on an empty Work or a first page. */}
        {letterOfferVisible({
          sections: props.context.sections.length,
          bodies: props.context.sections.map((section) => props.writing.bodyOf(section.draftSectionId)),
        }) ? (
          <div data-write-letter="true" style={{ marginBottom: 12 }}>
            <EditorialLetterPanel
              manuscriptId={props.context.manuscriptId}
              sections={props.context.sections}
              draftRevision={props.context.draftRevision ?? null}
              onShowSection={go}
              onEditOptions={(target) => props.onOpenPassIssue?.(target)}
              onShowPassage={props.onShowPassIssue ? (target) => props.onShowPassIssue!(target) : undefined}
              onTalk={(words) => openWorkConversation(words)}
              onTalkPassage={props.onTalkPassIssue ? (target) => props.onTalkPassIssue!(target) : undefined}
              onRead={() => setCoverageEpoch((n) => n + 1)}
            />
          </div>
        ) : null}
        {/* Founder direction 2026-11-12: the conversation is the creative process, so it happens in the centre (workCentre below).
            This column stays the guide and dashboard: what she has read, the letter and its places, decisions, relationship. */}
        {workConversationOpen ? (
          <p className="fr-say" data-write-conversation-in-centre="true" style={{ fontSize: 12, opacity: .8 }}>We’re talking in the middle of the page.</p>
        ) : railSelectionId && railSection ? (
          <div className="p4r1-locus-support" data-write-locus-support={railSection.draftSectionId}>
            <span className="p4r1-eyebrow">You selected</span>
            <h3>{railLabel}</h3>
            <p>
              I’m with this exact place now. You do not need to hunt through another panel
              before we can work with it.
            </p>
              <button
                type="button"
                className="p4r1-talk"
                onClick={() => openWorkConversation([
                  `I selected “${railLabel}” and want to work with this place directly.`,
                  'Start with what is happening here and ask me one useful question about what I want from it.',
                  'Do not rewrite anything unless I ask.',
                ].join('\n\n'))}
              >
                Talk about this place
              </button>
            <details className="p4r1-locus-more">
              <summary>More ways to work here</summary>
              <div>
                <button type="button" onClick={() => navigateMode('develop')}>Develop this place</button>
                <button type="button" onClick={() => navigateMode('review')}>Review this place</button>
              </div>
            </details>
            <p className="fr-also">Select exact words in the manuscript for passage-level revision.</p>
          </div>
        ) : (
          <>
            {/* B · The First Page: on a Work's first page, MAIA waits to be shown it (S3). */}
            {firstPageEligible({ sections: props.context.sections.length, body: currentBody }) ? (
              <StudioFirstPageMaia
                page={currentBody}
                sanctuary={!props.sessionPosture.resolved || props.sessionPosture.sanctuary}
                onAnswer={(starter) => openWorkConversation(starter)}
              />
            ) : null}
            <div className="fr-say">
              <p>
                Choose a chapter or section at left and I’ll orient to that place immediately.
                Or select exact words in the manuscript for passage-level work.
              </p>
            </div>
            {/* Named for what it opens (the conversation about the whole Work), so it is never confused with the passage door's
                "Talk with MAIA" now that this column is always beside the manuscript. */}
            <button type="button" className="p4r1-talk" data-write-talk-book="true" onClick={() => openWorkConversation('')}>
              Talk about the whole book
            </button>
          </>
        )}
        {maiaRelationshipCard}
      </div>
      <div className="fr-foot">The manuscript stays primary; support follows your attention.</div>
    </div>
  ) : undefined;

  const blankArrival = blankArrivalVisible && props.work ? (
    <P4R1BlankWritingArrival
      work={props.work}
      onStartWriting={focusRealEditor}
      onTalkWithMaia={() => openWorkConversation('')}
      onHelpBegin={() => openWorkConversation([
        'I have a blank writing place for this Work and I want help finding a beginning.',
        'Please begin by helping me clarify what I want to say, not by writing the opening for me.',
        'Nothing feeding this Work has been handed to you automatically. Do not assume you have read any Idea or Source unless I explicitly bring words from it into this conversation.',
        'Ask me one useful question to help me begin in my own words.',
      ].join('\n\n'))}
    />
  ) : null;

  const writeRoom = (
    <WriteRoom
      fixture={projection.data}
      copy={{ ...WRITE_COPY, editorLabel: projection.data.title }}
      canvas={canvas}
      onCanvasChange={setCanvas}
      live={{
        saveState: projection.data.saveState,
        canonicalBody: projection.canonicalBody,
        onEditBody: props.writing.edit,
        onReadback: onWriteReadback,
        onPrevious: () => go(projection.previousId),
        onNext: () => go(projection.nextId),
        onOpenChapter: go,
      }}
    />
  );

  /* A refusal (e.g. a plan step that no longer fits) must be visible where the writer is, not only inside the desk. */
  const pageNotice = props.planHandoffNotice
    ? <p role="status" data-write-page-notice style={{ margin: '8px 0', fontSize: '0.9em' }}>{props.planHandoffNotice}{' '}
        <button type="button" onClick={props.onDismissPlanHandoffNotice} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>OK</button></p>
    : null;
  const modeSwitch = proseAvailable && !canvas ? (
    <div className="p4r1-write-view-switch" aria-label="Writing view">
      <button type="button" aria-pressed={proseView} onClick={() => {
        wholeEditRef.current?.captureMountedBeforeLeave();
        setProseView(true);
      }}>Prose</button>
      <button type="button" aria-pressed={!proseView} onClick={() => setProseView(false)}>Edit</button>
      {proseView ? <span className="p4r1-write-view-hint" style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: 10 }}>To work with a passage, press Edit and select the words.</span> : null}
    </div>
  ) : null;

  const proseRoom = proseAvailable ? (
    <div className="p4r1-prose-host">
      {modeSwitch}
      {pageNotice}
      <ChapterProseSurface
        sections={proseSections}
        activeId={props.focusId}
        bodyOf={props.writing.bodyOf}
        onEdit={(sectionId) => {
          go(sectionId);
          setProseView(false);
        }}
      />
    </div>
  ) : null;

  const exactRoom = (
    <div className="p4r1-edit-host">
      {modeSwitch}
      {pageNotice}
      {proseAvailable ? (
        <div className="p4r1-chapter-edit" data-chapter-edit>
          <WholeManuscriptSurface
            ref={wholeEditRef}
            writing={chapterWriting}
            initialOpenAt={props.focusId}
            showHeadings
          />
        </div>
      ) : writeRoom}
    </div>
  );

  const baseWorkSurface = proseView && proseRoom ? proseRoom : blankArrival ? (
    <div className="p4r1-blank-write-host">
      {exactRoom}
      {blankArrival}
    </div>
  ) : exactRoom;

  const lineageReturnActive = Boolean(
    props.lineageReturnChapterId && props.lineageReturnCandidateId,
  );
  /* Arrived from an observation whose evidence names THIS section, but none of
     it verifies against the current text: the marking layer draws nothing, so
     say why instead of landing the writer with no orientation at all. */
  const insightEvidenceChanged = Boolean(
    props.carriedInsight && !props.workspaceOpen && !isolatedEditorial
    && props.carriedInsight.passages.some((passage) => passage.sectionId === props.focusId)
    && !props.carriedInsight.passages.some((passage) =>
      passage.sectionId === props.focusId && passage.verified && passage.range),
  );
  const workSurface = (props.attentionReturnItemId || lineageReturnActive) && !canvas ? (
    <div
      className="p4r1-attention-write-return"
      data-attention-return={props.attentionReturnItemId ?? undefined}
      data-lineage-return={lineageReturnActive ? props.lineageReturnCandidateId ?? undefined : undefined}
    >
      <div className="p4r1-attention-write-return-bar">
        {props.attentionReturnItemId ? (
          <>
            <span><b>From Attention Map</b> · this is one exact place behind the synthesis.</span>
            <button type="button" onClick={() => navigateMode('develop')}>Return to Attention Map</button>
          </>
        ) : (
          <>
            <span><b>From intellectual lineage</b> · this is one manuscript locus behind the provenance question.</span>
            <button type="button" onClick={() => navigateMode('develop')}>Return to lineage</button>
          </>
        )}
      </div>
      {baseWorkSurface}
    </div>
  ) : insightEvidenceChanged && !canvas ? (
    <div className="p4r1-attention-write-return" data-insight-evidence-changed>
      <div className="p4r1-attention-write-return-bar" role="status">
        <span>
          <b>From {props.carriedInsightReturnMode === 'review' ? 'Review' : 'Develop'} · {props.carriedInsight!.observation.phenomenonLabel}</b>
          {' · '}this section has changed since MAIA read it, so her evidence can’t be marked here. Nothing was changed.
        </span>
        {props.carriedInsightReturnMode ? (
          <button type="button" onClick={() => navigateMode(props.carriedInsightReturnMode!)}>
            Return to {props.carriedInsightReturnMode === 'review' ? 'Review' : 'Develop'}
          </button>
        ) : null}
        <button type="button" onClick={props.onDismissCarriedInsight}>Dismiss</button>
      </div>
      {baseWorkSurface}
    </div>
  ) : baseWorkSurface;

  /* An explicitly chosen Craft session gets its own passage-bound manuscript
     workbench. No Source, version or member identity is inferred from a URL. */
  const craftDialogue = craftThread
    ? craftThread.turns.flatMap(turn => {
        const mapped = craftMaiaDialogueTurn(craftThread.threadId, turn);
        return mapped ? [mapped] : [];
      })
    : [];

  const moveCraftFocus = (target: CraftFocusTarget): boolean => {
    if (!craftVisible || busy || !props.workspaceOpen
      || !targetStillMatches(target, props.writing.bodyOf(target.sectionId), craftRevision)) return false;
    const section = props.context.sections.find(s => s.draftSectionId === target.sectionId);
    if (!section?.editable) return false;
    return requestCraftDeparture('Move to another passage', () => {
      if (!targetStillMatches(target, props.writing.bodyOf(target.sectionId), props.writing.currentRevisionId())) return;
      if (target.sectionId !== props.focusId) {
        props.writing.goToSection(target.sectionId);
        props.onFocusSection(target.sectionId);
      }
      props.onHoldPassage(section, target.start, target.end, target.text);
      setCraftNotice('Focus moved by your choice. Nothing was saved or applied.');
    });
  };

  const sendCraft = (text?: string, options?: CraftSendOptions) => {
    if (craftRevisionPauseRef.current) {
      setCraftNotice('You paused MAIA revisions in this passage. Resume them explicitly before making another request. Your words remain untouched.');
      return;
    }
    if (busy || !text?.trim()) return;
    if (!craftVisible || !craftTarget || !props.workspaceOpen) {
      setCraftNotice('This passage is no longer held at the Craftsman\'s Table. Select it again. Nothing was sent.');
      return;
    }
    if (!props.sessionPosture.resolved || props.sessionPosture.sanctuary) {
      setCraftNotice('Choose an available Ordinary editorial session first. No request was sent.');
      return;
    }
    // The existing service supports allow/reply_only, not "require".
    // A requested suggestion is permitted but never assumed to exist.
    // Never claim the request went out: the controller may refuse it (for
    // example, no MAIA relationship for this Work yet) and says so itself.
    setCraftNotice(null);
    props.onSendEditorial(text, {
      proposalPolicy: options?.proposalPolicy === 'reply_only' ? 'reply_only' : 'allow',
      // The writer pressed a control that explicitly asks for wording ("Suggest
      // an edit", "Try wording", "Another way"). That press is the visible act that
      // releases the discuss-first gate for this one turn; dropping it left the
      // button unable to produce an edit on a first request at the default latitude.
      ...(options?.proposalRequested === true ? { proposalRequested: true } : {}),
      // Distinct author-authored display payload. The larger prompt remains
      // internal; the controller must not confuse this with stored author
      // transcript custody or a server acknowledgement.
      ...(options?.displayText !== undefined ? { displayText: options.displayText } : {}),
      ...(options?.teachingAnchor ? { teachingAnchor: options.teachingAnchor } : {}),
      ...(options?.passageAct ? { passageAct: options.passageAct } : {}),
    });
  };

  const exitCraft = () => {
    if (busy) return;
    requestCraftDeparture('Return to Focus', () => {
      setCraftOpen(false);
      setCraftOwnerScope(null);
      setIsolatedEditorial(true);
      setCraftNotice(null);
    });
  };

  const craftWork = craftVisible && craftTarget ? (
    <div className="p4r1-craft-work-host" data-live-craft-work>
      <div className="p4r1-craft-return-row">
        <span>Craft is a working copy, not a manuscript change.</span>
        <button type="button" disabled={busy} onClick={exitCraft}>Back to Focus</button>
      </div>
      {craftNotice || props.editorialFailure ? <p role="status" className="p4r1-craft-notice">{craftNotice ?? props.editorialFailure}</p> : null}
      {props.work && !props.maiaRelationship && props.maiaRelationshipPhase === 'ready' ? (
        <div className="p4r1-craft-notice" role="group" aria-label="Begin with MAIA" data-craft-begin-with-maia>
          <p>MAIA isn't sitting with this book yet. Start a conversation about it and MAIA can talk this passage through with you and suggest edits. You can keep writing here either way.</p>
          <button type="button" disabled={busy || props.maiaRelationshipBusy} onClick={props.onBeginMaiaRelationship}>
            {props.maiaRelationshipBusy ? 'Starting…' : 'Begin with MAIA'}
          </button>
          {props.maiaRelationshipMessage ? <p role="status">{props.maiaRelationshipMessage}</p> : null}
        </div>
      ) : null}
      {craftDiscardOffer ? (
        <div className="p4r1-craft-discard-confirm" role="group" aria-label="Confirm leaving unsaved Craft work" data-craft-discard-confirm>
          <p><b>{craftDiscardOffer}</b> would discard any unsaved working copy, unsent MAIA wording, or session-only marks for this passage.</p>
          <button type="button" disabled={busy} onClick={confirmCraftDiscard}>Discard local changes and continue</button>
          <button type="button" onClick={() => { clearPendingDeparture(); setCraftNotice('Staying with your existing working copy. Nothing was discarded.'); }}>Stay and keep writing</button>
        </div>
      ) : null}
      <CraftsmansTableR1
        editLatitude={props.editLatitude}
        onEditLatitude={props.onLatitude}
        sections={props.context.sections}
        bodyOf={props.writing.bodyOf}
        held={props.held}
        thread={craftThread}
        version={craftVersion}
        busy={busy}
        onSend={sendCraft}
        onSaveMember={props.onSaveMember}
        onSaveWorking={props.onSaveWorking}
        onApply={props.onApply}
        appliedVersionId={props.appliedVersionId}
        onUndo={props.onUndo}
        onConnect={port => { craftPort.current = port; }}
        focusTools={<CraftFocusToolsR1
          sections={props.context.sections}
          bodyOf={props.writing.bodyOf}
          revisionNumber={craftRevision}
          current={craftTarget}
          pickerRequest={craftPickerRequest}
          busy={busy}
          receipt={craftNotice}
          onMove={moveCraftFocus}
          onStay={() => { clearPendingDeparture(); setCraftNotice('Staying with this passage. Nothing was applied.'); }}
          onAsk={() => sendCraft('Suggest one or two passages for a next focus, only if grounded in words I have already authorized in this conversation. Do not move focus or revise anything.', { proposalPolicy: 'reply_only' })}
        />}
        nextFocus={{
          nextLabel: nextCraft?.label ?? null,
          onContinue: () => nextCraft ? moveCraftFocus(nextCraft) : false,
          onChoose: () => setCraftPickerRequest(value => value + 1),
          // G-5 (founder: "Yes, route it", 2026-11-09): the writer's words, with the server-owned act.
          onAskMaia: () => sendCraft(passageActQuestion('where-next'), { proposalPolicy: 'reply_only', passageAct: 'where-next' }),
        }}
      />
    </div>
  ) : craftVisible ? (
    <div className="p4r1-craft-work-host" role="alert">
      This passage changed or is no longer editable. Select its current words again.
      Nothing was saved or applied.
      <button type="button" onClick={exitCraft}>Back to Focus</button>
    </div>
  ) : null;

  const craftMaia = craftVisible && craftTarget && props.work ? (
    <MaiaCraftCompanionR1
      title={craftTarget.sectionLabel}
      thread={craftThread}
      version={craftVersion}
      lastMaiaTurn={props.lastMaiaEditorialTurn}
      busy={busy}
      message={props.editorialFailure}
      activity={null}
      currentFocus={craftTarget}
      dialogue={craftDialogue}
      editLatitude={props.editLatitude}
      onEditLatitude={props.onLatitude}
      mayRemoveParagraphs={props.mayRemoveParagraphs}
      onMayRemoveParagraphs={props.onMayRemoveParagraphs}
      mayProposeImmediately={props.mayProposeImmediately}
      onMayProposeImmediately={props.onMayProposeImmediately}
      sessionPosture={props.sessionPosture}
      onChooseSessionPosture={props.onChooseSessionPosture}
      onSend={sendCraft}
      onStopRevisions={() => {
        craftRevisionPauseRef.current = true;
        props.onStopEditorial();
        setCraftNotice('You asked MAIA to stop. No more editorial requests in this selected passage until you resume.');
      }}
      onResumeRevisions={() => {
        craftRevisionPauseRef.current = false;
        setCraftNotice(null);
      }}
      onKeepExactWords={(phrase) => {
        if (!craftVisible || !craftTarget || !props.workspaceOpen
          || !targetStillMatches(craftTarget, props.writing.bodyOf(craftTarget.sectionId), craftRevision)
          || !craftPort.current) {
          return { ok: false, message: 'The current exact passage could not be verified for this mark. Nothing was protected or changed.' };
        }
        // Existing Craft author-owned Keep/STET API. No Source or manuscript
        // mutation; the author must separately save a working version.
        const receipt = craftPort.current.keepOriginal(phrase);
        if (receipt.ok) setCraftNotice(receipt.message);
        return receipt;
      }}
      onConnect={port => { maiaComposerPort.current = port; }}
      onDepth={props.onDepth}
      onReturn={exitCraft}
    />
  ) : undefined;

  const isolatedRoom = props.workspaceOpen && isolatedEditorial && !craftVisible && !craftScopeChanged ? (
    <IsolatedEditorialRoom
      appearance={props.appearance}
      title={passagePlaceLabel(
        props.context.sections.find((s) => s.draftSectionId === props.focusId),
        currentBody,
        props.held?.draftSectionId === props.focusId ? props.held : null,
      )}
      currentText={passageShown}
      sectionBody={currentBody}
      busy={busy}
      editingLatitude={props.editLatitude}
      onEditingLatitude={props.onLatitude}
      mayRemoveParagraphs={props.mayRemoveParagraphs}
      onMayRemoveParagraphs={props.onMayRemoveParagraphs}
      mayProposeImmediately={props.mayProposeImmediately}
      onMayProposeImmediately={props.onMayProposeImmediately}
      stage
      onClose={props.onCloseWorkspace}
      onStartFresh={props.editorialThread ? props.onStartFreshConversation : undefined}
      onNextPassage={focusNextPassage}
      nextPassageLabel={nextCraft?.label ?? null}
      onAskWhereNext={focusAskWhereNext}
      revisionsPaused={passageRevisionsPaused}
      onPauseRevisions={heldKey && !workRevisionsPaused ? (paused) => setPausedPassageKey(paused ? heldKey : null) : undefined}
      workRevisionsPaused={workRevisionsPaused}
      onPauseWorkRevisions={props.work?.id ? (paused) => { void saveWorkRevisionsPaused(paused); } : undefined}
      workPauseSaving={workPauseSaving}
      workPauseError={workPauseError}
    >
      {props.carriedInsight ? (
        <section className="p4r1-focus-origin" data-focus-origin>
          <div>
            <span className="p4r1-eyebrow">
              {props.attentionReturnItemId
                ? 'From Attention Map'
                : props.carriedInsightReturnMode === 'review'
                  ? 'From Review'
                  : 'From MAIA’s reading'}
            </span>
            <b>{props.carriedInsight.observation.phenomenonLabel}</b>
            <small>{props.carriedInsight.observation.stateLabel}</small>
          </div>
          <p>{props.carriedInsight.observation.observation}</p>
          <footer>
            <span>{props.carriedInsight.coverage}</span>
            {props.carriedInsightReturnMode ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => navigateMode(props.carriedInsightReturnMode!)}
              >
                {props.attentionReturnItemId
                  ? 'Return to Attention Map'
                  : `Return to ${props.carriedInsightReturnMode === 'review' ? 'Review' : 'Develop'}`}
              </button>
            ) : null}
          </footer>
        </section>
      ) : null}

      <P4R1FocusMaterials
        work={props.work}
        onUseWithMaia={(context) => props.onSendEditorial(context)}
      />

      <EditorialDancePanel
        stage
        conversationChoices={props.conversationChoices ?? []}
        onChooseConversation={props.onChooseConversation}
        onStartNewConversation={props.onStartNewFromChoice}
        autoOpenWithMaia
        onOpenWithMaia={props.onOpenWithMaia}
        openingFailure={props.openingFailure ?? null}
        earlierThread={props.earlierEditorialThread ?? null}
        onBackToPage={props.onCloseWorkspace}
        onStudioAction={onStudioAction}
        onUseVersion={props.onUseVersion}
        deeper={focusDeeper}
        revisionsPaused={revisionsPaused}
        pendingQuestion={props.pendingEditorialText ?? null}
        manuscriptTitle={props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'this passage'}
        showOriginal={false}
        origin={props.carriedInsight && props.carriedInsightReturnMode ? {
          source: props.carriedInsightReturnMode,
          readingId: props.carriedInsight.readingId,
          observationKey: props.carriedInsight.observation.key,
        } : null}
        currentText={currentText}
        sectionBody={currentBody}
        thread={props.editorialThread}
        version={props.suggestedVersion}
        lastMaiaTurn={props.lastMaiaEditorialTurn}
        appliedVersionId={props.appliedVersionId}
        busy={busy}
        sessionPosture={props.sessionPosture}
        onChooseSessionPosture={props.onChooseSessionPosture}
        notice={props.editorialNotice}
        maiaRelationship={props.work ? {
          active: Boolean(props.maiaRelationship),
          busy: props.maiaRelationshipBusy,
          choices: props.maiaRelationshipChoices,
          message: props.maiaRelationshipMessage,
          onBegin: props.onBeginMaiaRelationship,
          onChoose: props.onChooseMaiaRelationship,
        } : null}
        message={props.editorialFailure ?? (props.adoptionOutcome && props.appliedVersionId === props.suggestedVersion?.id
          ? props.adoptionOutcome.kind === 'applied' ? null : 'The Work could not accept this revision. Nothing was changed.'
          : null)}
        undoMessage={visibleUndoMessage}
        onSelectVersion={props.onSelectVersion}
        onSend={focusSend}
        requestedAct={requestedPassageAct}
        onRequestedActTaken={() => setRequestedPassageAct(null)}
        onSaveMember={props.onSaveMember}
        onApply={props.onApply}
        onUndo={props.onUndo}
        onKeep={props.onKeep}
        onDepth={props.onDepth}
      />
    </IsolatedEditorialRoom>
  ) : null;

  return (
    <>
      {/* Craft stays inside Write and its existing author-owned panel layout. */}
      <Shell
          mode="write"
          appearance={props.appearance}
          geometry={craftVisible || railSelectionId || workConversationOpen || props.work ? WRITE_RELATIONAL_GEOMETRY : WRITE_GEOMETRY}
          workTitle={props.work?.title ?? undefined}
          memberInitial=""
          onSelectMode={mode => { requestCraftDeparture('Switch Studio room', () => props.onMode(mode)); }}
          canvas={craftVisible || craftScopeChanged ? false : canvas}
          manuscript={<WriteManuscriptRail fixture={projection.data} onOpenChapter={go} />}
          work={craftScopeChanged ? (
            <div role="alert" data-craft-scope-refusal className="p4r1-craft-notice">
              The Work changed. The previous Craft session is closed; unsent wording was not restored.
              Select a passage in your current authorized Work to begin again.
            </div>
          ) : craftVisible ? craftWork : workCentre ?? workSurface}
          maia={craftScopeChanged ? undefined : craftVisible ? craftMaia : writeMaia}
        />

      {isolatedRoom}

      {mounted && !canvas && !isolatedEditorial ? (
        /* These layers render outside the Shell, which is where the theme
           variables live. Carry them here, as the selection affordance does,
           or the popovers resolve var(--fr-panel) to transparent. */
        <div
          style={{ display: 'contents', ...appearanceVars(props.appearance) } as CSSProperties}
          data-p4r1-manuscript-overlays
        >
          {props.carriedInsight && !props.workspaceOpen ? (
            <ObservationManuscriptLayer
              insight={props.carriedInsight}
              activeSectionId={props.focusId}
              onRevise={(passage) => props.onReviseInsight(passage)}
              onClose={props.onDismissCarriedInsight}
            />
          ) : null}

          {proposalMarkable && props.held && props.suggestedVersion ? (
            <RevisionManuscriptLayer
              sectionId={props.held.draftSectionId}
              passageStart={props.held.start}
              original={props.held.text}
              proposed={props.suggestedVersion.wording}
              rationale={props.suggestedVersion.rationale}
              selected={selectedRevisionEdits}
              busy={busy}
              onToggle={toggleRevisionEdit}
              onWhy={whyRevisionEdit}
              onTeach={teachRevisionEdit}
              onChange={changeRevisionEdit}
              onSaveSelected={() => void saveSelectedRevision()}
            />
          ) : null}

          {contextualActions}
          {editorial}
        </div>
      ) : null}
    </>
  );
}
