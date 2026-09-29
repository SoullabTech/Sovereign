'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { WriteManuscriptRail, WriteRoom } from '@/app/writers-studio/full-redesign/WriteRoom';
import { WRITE_COPY } from '@/app/writers-studio/full-redesign/fixtures';
import { WRITE_GEOMETRY, appearanceVars } from '@/app/writers-studio/full-redesign/tokens';
import { projectPc3LiveWrite } from '@/app/writers-studio/full-redesign/liveWriteAdapter';
import WorkConversation from '@/app/writers-studio/canvas/WorkConversation';
import RevisionDesk, { type MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import InsightReadings from '@/app/writers-studio/insight/InsightReadings';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { locateUniquePassage, type AdoptionWireOutcome, type RebuildEditorialRelationship, type RebuildEditorialThread } from '@/lib/writersStudio/rebuild/editorialCollaboration';
import ObservationManuscriptLayer from './ObservationManuscriptLayer';
import RevisionManuscriptLayer, { type RevisionEdit } from './RevisionManuscriptLayer';
import EditorialDancePanel from './EditorialDancePanel';
import IsolatedEditorialRoom from './IsolatedEditorialRoom';
import P4R1FocusMaterials from './P4R1FocusMaterials';
import P4R1BlankWritingArrival from './P4R1BlankWritingArrival';
import { composeSelected, editorialSegments } from '@/lib/writersStudio/editorialDiff';
import type { CanvasInsight } from '@/lib/writersStudio/insightCanvas';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { EditorialLatitude } from '@/lib/manuscript/editorialScope/contract';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';

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
  onMode: (mode: 'home' | 'write' | 'develop' | 'review') => void;

  workspaceOpen: boolean;
  carriedInsight: CanvasInsight | null;
  carriedInsightReturnMode: 'develop' | 'review' | null;
  attentionReturnItemId: string | null;
  lineageReturnChapterId: string | null;
  lineageReturnCandidateId: string | null;
  workspaceInsight: { readingId: string; key: string } | null;
  editorialThread: RebuildEditorialThread | null;
  relationshipChoices: readonly RebuildEditorialRelationship[];
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
  onSendEditorial: (text?: string) => void;
  onSelectVersion: (id: string) => void;
  onApply: () => void;
  onUndo?: () => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  onKeep: () => void;
  onLatitude: (v: EditorialLatitude) => void;
  onMayRemoveParagraphs: (v: boolean) => void;
  onMayProposeImmediately: (v: boolean) => void;
  onReviseInsight: NonNullable<Parameters<typeof InsightReadings>[0]['onRevise']>;
  onChoosePassage: NonNullable<Parameters<typeof InsightReadings>[0]['onChoosePassage']>;
  onChooseRelationship: (threadId: string) => void;
};

function selectionInPc3Editor(): { sectionId: string; text: string; rect: DOMRect } | null {
  if (typeof window === 'undefined') return null;
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

export function P4R1Pc3WriteEditView(props: P4R1Pc3WriteEditViewProps) {
  const [canvas, setCanvas] = useState(false);
  const [workConversationOpen, setWorkConversationOpen] = useState(false);
  const [workConversationStarter, setWorkConversationStarter] = useState('');
  const [blankArrivalDismissed, setBlankArrivalDismissed] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedRevisionEdits, setSelectedRevisionEdits] = useState<ReadonlySet<number>>(new Set());
  const [selectionMenuOpen, setSelectionMenuOpen] = useState(false);
  const [isolatedEditorial, setIsolatedEditorial] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setBlankArrivalDismissed(false);
    setWorkConversationStarter('');
  }, [props.focusId]);

  useEffect(() => {
    if (!props.workspaceOpen && isolatedEditorial) {
      setIsolatedEditorial(false);
      return;
    }
    /* A substantial editorial act on an exact held passage owns the Focus room.
       Never let the full editorial dance float over the manuscript. */
    if (props.workspaceOpen && props.held && !isolatedEditorial) {
      setIsolatedEditorial(true);
    }
  }, [props.workspaceOpen, props.held, isolatedEditorial]);

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

  const go = useCallback((sectionId: string | null) => {
    if (!sectionId || sectionId === props.writing.activeId) return;
    props.writing.goToSection(sectionId);
    props.onFocusSection(sectionId);
  }, [props]);

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

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('.fr-workpick') || !props.work) return;
      setWorkConversationOpen((open) => !open);
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [props.work]);

  if (!projection) {
    return <main className="fr-root"><div style={{ padding: 32 }}>This manuscript has no editable place to open.</div></main>;
  }

  const busy = props.editorialBusy || props.adoptionBusy || props.memberVersionBusy;
  const currentBody = props.focusId ? props.writing.bodyOf(props.focusId) : '';
  const currentText = props.held?.draftSectionId === props.focusId
    ? props.held.text
    : currentBody;

  const focusRealEditor = () => {
    setBlankArrivalDismissed(true);
    const sectionId = props.focusId;
    window.requestAnimationFrame(() => {
      const selector = sectionId
        ? `[data-write-editor][data-section-id="${CSS.escape(sectionId)}"]`
        : '[data-write-editor]';
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
    });
  };

  const openWorkConversation = (starter = '') => {
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

  const contextualActions = selectionRect && props.held && !isolatedEditorial ? (
    <div
      className="p4r1-selection-affordance"
      style={{
        ...appearanceVars(props.appearance),
        left: Math.max(18, Math.min(selectionRect.right - 150, window.innerWidth - 220)),
        top: Math.max(72, selectionRect.bottom + 12),
      } as CSSProperties}
      data-p4r1-selection-affordance
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="p4r1-selection-trigger"
        aria-expanded={selectionMenuOpen}
        onClick={() => setSelectionMenuOpen((open) => !open)}
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
        </div>
      ) : null}
    </div>
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
        message={props.editorialFailure ?? (props.adoptionOutcome && props.appliedVersionId === props.suggestedVersion?.id
          ? props.adoptionOutcome.kind === 'applied' ? null : 'The Work could not accept this revision. Nothing was changed.'
          : null)}
        undoMessage={props.undoMessage}
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
          undoMessage={props.undoMessage}
          latitude={props.editLatitude}
          onLatitude={props.onLatitude}
          mayRemoveParagraphs={props.mayRemoveParagraphs}
          onMayRemoveParagraphs={props.onMayRemoveParagraphs}
          mayProposeImmediately={props.mayProposeImmediately}
          onMayProposeImmediately={props.onMayProposeImmediately}
          voiceNotice={props.voiceNotice}
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
      copy={WRITE_COPY}
      canvas={canvas}
      onCanvasChange={setCanvas}
      live={{
        saveState: projection.data.saveState,
        onEditBody: props.writing.edit,
        onPrevious: () => go(projection.previousId),
        onNext: () => go(projection.nextId),
        onOpenChapter: go,
      }}
    />
  );

  const baseWorkSurface = blankArrival ? (
    <div className="p4r1-blank-write-host">
      {writeRoom}
      {blankArrival}
    </div>
  ) : writeRoom;

  const lineageReturnActive = Boolean(
    props.lineageReturnChapterId && props.lineageReturnCandidateId,
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
            <button type="button" onClick={() => props.onMode('develop')}>Return to Attention Map</button>
          </>
        ) : (
          <>
            <span><b>From intellectual lineage</b> · this is one manuscript locus behind the provenance question.</span>
            <button type="button" onClick={() => props.onMode('develop')}>Return to lineage</button>
          </>
        )}
      </div>
      {baseWorkSurface}
    </div>
  ) : baseWorkSurface;

  const isolatedRoom = props.workspaceOpen && isolatedEditorial ? (
    <IsolatedEditorialRoom
      appearance={props.appearance}
      title={props.context.sections.find((s) => s.draftSectionId === props.focusId)?.heading ?? 'Selected passage'}
      currentText={currentText}
      sectionBody={currentBody}
      busy={busy}
      onClose={() => setIsolatedEditorial(false)}
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
                onClick={() => props.onMode(props.carriedInsightReturnMode!)}
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
        message={props.editorialFailure ?? (props.adoptionOutcome && props.appliedVersionId === props.suggestedVersion?.id
          ? props.adoptionOutcome.kind === 'applied' ? null : 'The Work could not accept this revision. Nothing was changed.'
          : null)}
        undoMessage={props.undoMessage}
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
      <Shell
          mode="write"
          appearance={props.appearance}
          geometry={WRITE_GEOMETRY}
          workTitle={props.work?.title ?? undefined}
          memberInitial=""
          onSelectMode={props.onMode}
          canvas={canvas}
          manuscript={<WriteManuscriptRail fixture={projection.data} onOpenChapter={go} />}
          work={workSurface}
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
          {workConversation}
          {editorial}
        </>
      ) : null}
    </>
  );
}
