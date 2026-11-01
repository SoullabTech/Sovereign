'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { WriteManuscriptRail, WriteRoom, isWriteRoomReadbackCurrent, type WriteBlock, type WriteRoomReadback } from '@/app/writers-studio/full-redesign/WriteRoom';
import { WRITE_COPY } from '@/app/writers-studio/full-redesign/fixtures';
import { WRITE_GEOMETRY, appearanceVars } from '@/app/writers-studio/full-redesign/tokens';

export const UNDO_RESTORED_MESSAGES = {
  complete: 'That application was undone. The original passage is restored.',
  historyPending: 'The original passage is restored. Its editorial history could not be refreshed just now.',
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
import { locateUniquePassage, type AdoptionWireOutcome, type RebuildEditorialRelationship, type RebuildEditorialThread } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import ObservationManuscriptLayer from './ObservationManuscriptLayer';
import RevisionManuscriptLayer, { type RevisionEdit } from './RevisionManuscriptLayer';
import EditorialDancePanel from './EditorialDancePanel';
import IsolatedEditorialRoom from './IsolatedEditorialRoom';
import P4R1FocusMaterials from './P4R1FocusMaterials';
import P4R1BlankWritingArrival from './P4R1BlankWritingArrival';
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
import type { A2RelationshipSummary, EligibleCarrySource } from '@/lib/writersStudio/rebuild/relationshipOrchestration';
import type { CraftWorkingSaveDraft } from '@/lib/writersStudio/craftSaveContractR1';

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
    sections: RebuildSection[];
  };
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
  relationshipChoices: readonly RebuildEditorialRelationship[];
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
  }) => void;
  /** Retire pending visible editorial result after an author STOP. */
  onStopEditorial: () => void;
  onSelectVersion: (id: string) => void;
  onApply: () => void;
  onUndo?: () => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  onSaveWorking: (draft: CraftWorkingSaveDraft) => Promise<boolean>;
  onKeep: () => void;
  onLatitude: (v: EditorialLatitude) => void;
  onMayRemoveParagraphs: (v: boolean) => void;
  onMayProposeImmediately: (v: boolean) => void;
  onReviseInsight: NonNullable<Parameters<typeof InsightReadings>[0]['onRevise']>;
  onChoosePassage: NonNullable<Parameters<typeof InsightReadings>[0]['onChoosePassage']>;
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
  return Math.max(72, Math.min(rect.bottom + 12, window.innerHeight - 254));
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
  const [morePassageOptions, setMorePassageOptions] = useState(false);
  const [selectedRevisionEdits, setSelectedRevisionEdits] = useState<ReadonlySet<number>>(new Set());
  const [selectionMenuOpen, setSelectionMenuOpen] = useState(false);
  const [isolatedEditorial, setIsolatedEditorial] = useState(false);
  // Craftsman's Table is entered only by an author's explicit passage action.
  // Default Write and its already-authorized editorial room remain unchanged.
  const [craftOpen, setCraftOpen] = useState(false);
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
    /* Same section is an attention gesture, not a destructive transition. */
    if (sectionId === props.writing.activeId) { setRailSelectionId(sectionId); return; }
    requestCraftDeparture('Move to another manuscript section', () => {
      // Revalidate section membership and editability at the author gesture.
      if (!props.context.sections.some(section => section.draftSectionId === sectionId)) return;
      setRailSelectionId(sectionId);
      props.writing.goToSection(sectionId);
      props.onFocusSection(sectionId);
    });
  }, [props, craftOpen]);

  useEffect(() => {
    const inspect = () => {
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

  const busy = props.editorialBusy || props.adoptionBusy || props.memberVersionBusy;
  const currentBody = props.focusId ? props.writing.bodyOf(props.focusId) : '';
  const visibleUndoMessage = undoMessageForVisibleDraft(props.undoMessage, writeReadback, props.focusId, currentBody);
  const currentText = props.held?.draftSectionId === props.focusId
    ? props.held.text
    : currentBody;

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
    props.onSendEditorial(
      `Why did you change ${edit.from ? `"${edit.from.trim()}" to "${edit.to.trim()}"` : `by adding "${edit.to.trim()}"`}? Show me the evidence in my sentence and make the strongest case for keeping mine. Do not propose new wording in this answer.`,
    );
  };

  const teachRevisionEdit = (edit: RevisionEdit) => {
    props.onDepth('learning');
    props.onOpenWorkspace();
    props.onSendEditorial(
      `Teach me the writing technique involved in changing ${edit.from ? `"${edit.from.trim()}" to "${edit.to.trim()}"` : `by adding "${edit.to.trim()}"`}. Explain what the move does, what it may cost, and when my original would be the better choice. Do not propose new wording.`,
    );
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
        onClick={() => setSelectionMenuOpen((open) => { if (!open) setMorePassageOptions(false); return !open; })}
      >
        Work with passage <span aria-hidden="true">›</span>
      </button>

      {selectionMenuOpen ? (
        <div className="p4r1-selection-menu" role="menu">
          <button type="button" role="menuitem" className="p4r1-selection-menu-primary" onClick={() => {
            setSelectionMenuOpen(false);
            props.onOpenWorkspace();
            setIsolatedEditorial(true);
          }}>
            <b>Focus</b>
            <span>Open the passage in the dedicated editorial room.</span>
          </button>

          <button type="button" role="menuitem" data-open-craftsmans-table onClick={() => {
            if (!requestConversationDeparture()) return;
            setSelectionMenuOpen(false);
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
          }}>
            <b>Craftsman's Table</b>
            <span>Work on these exact words with visible changes and MAIA beside the writing.</span>
          </button>

          <button type="button" role="menuitem" onClick={() => {
            setSelectionMenuOpen(false);
            props.onOpenWorkspace();
            props.onSendEditorial([
              'Discuss what is happening in this exact passage with me before proposing any edits.',
              'Reflect what you notice in plain language and ask me one useful question about what I am trying to do.',
              'Do not propose replacement wording unless I ask.',
            ].join('\n\n'));
          }}>
            <b>Discuss</b>
            <span>Talk about the passage before changing anything.</span>
          </button>


          <button
            type="button"
            role="menuitem"
            className="p4r1-passage-more"
            aria-expanded={morePassageOptions}
            onClick={() => setMorePassageOptions((open) => !open)}
          >
            <b>{morePassageOptions ? 'Fewer ways' : 'More ways to work'}</b>
            <span>Revision, learning, and deeper editorial reasoning, when you want them.</span>
          </button>
          {morePassageOptions ? (
            <>
          <button type="button" role="menuitem" onClick={() => {
            setSelectionMenuOpen(false);
            props.onOpenWorkspace();
            setIsolatedEditorial(true);
            props.onSendEditorial([
              'Help me revise this exact passage.',
              'Start with exactly these three short lines in plain language:',
              '"What I’d preserve: …"',
              '"Friction I notice: …" — support this from the exact words; do not grade or diagnose the writing.',
              '"What I’d try: …" — name the editorial move and why you would try it.',
              'Then, if a revision is warranted, offer one possible revision. Preserve my voice, intention, subject, and intentional ambiguity.',
              'Begin the rationale with "Editorial purpose: <short descriptive direction>". Separate meaning changes from style changes, treat reader effects as hypotheses, and say what could be lost.',
              'Nothing is to be applied automatically.',
            ].join('\n\n'));
          }}>
            <b>Revise</b>
            <span>Ask MAIA for one useful editorial move.</span>
          </button>

          <button type="button" role="menuitem" onClick={() => {
            setSelectionMenuOpen(false);
            props.onDepth('learning');
            props.onOpenWorkspace();
            props.onSendEditorial('Teach me what is happening in this passage as writing. Use my own words as the example. Do not propose replacement wording unless I ask.');
          }}>
            <b>Teach me</b>
            <span>Explain the craft already at work here.</span>
          </button>

          <button type="button" role="menuitem" onClick={() => {
            setSelectionMenuOpen(false);
            props.onDepth('direct');
            props.onOpenWorkspace();
            props.onSendEditorial('Show me the editorial reasoning you can support from this exact passage. Distinguish evidence from interpretation. Do not propose replacement wording unless I ask.');
          }}>
            <b>Go deeper</b>
            <span>Open the technical reasoning, evidence, and tradeoffs.</span>
          </button>
            </>
          ) : null}
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
        onClose={() => {
          setWorkConversationOpen(false);
          setWorkConversationStarter('');
        }}
      />
    </div>
  ) : null;

  const editorial = props.workspaceOpen && !isolatedEditorial && !props.held ? (
    <div className="p4r1-context-card p4r1-editorial" data-p4r1-editorial>
      <header className="p4r1-context-head">
        <div>
          <span>In relation to this passage</span>
          <strong>{props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'Selected passage'}</strong>
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
        onSend={props.onSendEditorial}
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

      {props.relationshipChoices.length > 1 ? (
        <div className="p4r1-relationships" aria-label="Choose revision conversation">
          {props.relationshipChoices.map((choice, index) => (
            <button key={choice.threadId} type="button" disabled={props.editorialBusy}
              onClick={() => props.onChooseRelationship(choice.threadId)}>
              Conversation {index + 1} · {choice.turnCount} turns
            </button>
          ))}
        </div>
      ) : null}
    </div>
  ) : null;

  const railSection = props.context.sections.find(
    (section) => section.draftSectionId === (railSelectionId ?? props.focusId),
  ) ?? null;
  const railLabel = railSection
    ? railSection.heading?.trim() || `Section ${railSection.position + 1}`
    : 'this section';

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
        {workConversationOpen ? (
          workConversation
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
            <div className="fr-say">
              <p>
                Choose a chapter or section at left and I’ll orient to that place immediately.
                Or select exact words in the manuscript for passage-level work.
              </p>
            </div>
            <button type="button" className="p4r1-talk" onClick={() => openWorkConversation('')}>
              Talk with MAIA
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

  const modeSwitch = proseAvailable && !canvas ? (
    <div className="p4r1-write-view-switch" aria-label="Writing view">
      <button type="button" aria-pressed={proseView} onClick={() => {
        wholeEditRef.current?.captureMountedBeforeLeave();
        setProseView(true);
      }}>Prose</button>
      <button type="button" aria-pressed={!proseView} onClick={() => setProseView(false)}>Edit</button>
    </div>
  ) : null;

  const proseRoom = proseAvailable ? (
    <div className="p4r1-prose-host">
      {modeSwitch}
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
    if (!craftVisible || !craftTarget || !props.workspaceOpen || busy || !text?.trim()) return;
    if (!props.sessionPosture.resolved || props.sessionPosture.sanctuary) {
      setCraftNotice('Choose an available Ordinary editorial session first. No request was sent.');
      return;
    }
    // The existing service supports allow/reply_only, not "require".
    // A requested suggestion is permitted but never assumed to exist.
    setCraftNotice(options?.proposalPolicy === 'require'
      ? 'A bounded suggestion was requested. MAIA may decline; nothing is applied automatically.'
      : null);
    props.onSendEditorial(text, {
      proposalPolicy: options?.proposalPolicy === 'reply_only' ? 'reply_only' : 'allow',
      // Distinct author-authored display payload. The larger prompt remains
      // internal; the controller must not confuse this with stored author
      // transcript custody or a server acknowledgement.
      ...(options?.displayText !== undefined ? { displayText: options.displayText } : {}),
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
      {craftNotice ? <p role="status" className="p4r1-craft-notice">{craftNotice}</p> : null}
      {craftDiscardOffer ? (
        <div className="p4r1-craft-discard-confirm" role="group" aria-label="Confirm leaving unsaved Craft work" data-craft-discard-confirm>
          <p><b>{craftDiscardOffer}</b> would discard any unsaved working copy, unsent MAIA wording, or session-only marks for this passage.</p>
          <button type="button" disabled={busy} onClick={confirmCraftDiscard}>Discard local changes and continue</button>
          <button type="button" onClick={() => { clearPendingDeparture(); setCraftNotice('Staying with your existing working copy. Nothing was discarded.'); }}>Stay and keep writing</button>
        </div>
      ) : null}
      <CraftsmansTableR1
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
          onAskMaia: () => sendCraft('Which one or two exact passages should I consider next? Use only the text already authorized in this conversation. If that is insufficient, ask me to choose. Do not move focus or propose a revision.', { proposalPolicy: 'reply_only' }),
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
      title={props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'Selected passage'}
      currentText={currentText}
      sectionBody={currentBody}
      busy={busy}
      editingLatitude={props.editLatitude}
      onEditingLatitude={props.onLatitude}
      mayRemoveParagraphs={props.mayRemoveParagraphs}
      onMayRemoveParagraphs={props.onMayRemoveParagraphs}
      mayProposeImmediately={props.mayProposeImmediately}
      onMayProposeImmediately={props.onMayProposeImmediately}
      onClose={props.onCloseWorkspace}
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
        manuscriptTitle={props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'this passage'}
        showOriginal={false}
        origin={props.carriedInsight && props.carriedInsightReturnMode ? {
          source: props.carriedInsightReturnMode,
          label: props.carriedInsight.observation.phenomenonLabel ?? 'Observation',
          state: props.carriedInsight.observation.stateLabel,
          observation: props.carriedInsight.observation.observation,
          coverage: props.carriedInsight.coverage,
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
        onSend={props.onSendEditorial}
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
          geometry={craftVisible || railSelectionId || workConversationOpen ? WRITE_RELATIONAL_GEOMETRY : WRITE_GEOMETRY}
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
          ) : craftVisible ? craftWork : workSurface}
          maia={craftScopeChanged ? undefined : craftVisible ? craftMaia : (railSelectionId || workConversationOpen ? writeMaia : undefined)}
        />

      {isolatedRoom}

      {mounted && !canvas && !isolatedEditorial ? (
        <>
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
        </>
      ) : null}
    </>
  );
}
