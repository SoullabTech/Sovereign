'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { editorialSegments } from '@/lib/writersStudio/editorialDiff';
import {
  composeCraftWorkingCopy,
  craftWorkingEdits,
  decisionCount,
  initialCraftDecisions,
  type CraftDecision,
  type CraftWorkingEdit,
} from '@/lib/writersStudio/craftWorkingCopy';
import { professionalMarkFor } from '@/lib/writersStudio/craftProfessionalMarks';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import { typesetProseBlocks } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';
import type { CraftSendOptions } from '@/lib/writersStudio/craftDialogueR1';
import { splitActiveParagraph, craftProseBlocks, craftProseBreaks, craftTypographyChunks, craftInsertedBreaks, type CraftProseBreak } from '@/lib/writersStudio/craftProseLayoutR1';
import type { WriteBlock } from '@/app/writers-studio/full-redesign/WriteRoom';
import { craftTargetKey, type CraftTableSnapshot, type CraftTablePort, type CraftKeptSpan, type CraftCanvasReceipt } from '@/lib/writersStudio/craftFocusR1';
import { locateUniquePresentationPassage } from '@/lib/writersStudio/rebuild/editorialCollaboration';

export type CraftHeldPassage = {
  draftSectionId: string;
  start: number;
  end: number;
  text: string;
  revisionNumber: number;
};

export type CraftsmansTableR1Props = {
  sections: readonly RebuildSection[];
  bodyOf: (sectionId: string) => string;
  held: CraftHeldPassage | null;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  busy: boolean;
  onSend: (text?: string, options?: CraftSendOptions) => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  onApply: () => void;
  appliedVersionId: string | null;
  onUndo?: () => void;
  /** The exact writer-owned working state, before Save or Apply. */
  onWorkingTextChange?: (text: string) => void;
  focusTools?: ReactNode;
  restoreSnapshot?: CraftTableSnapshot | null;
  onConnect?: (port: CraftTablePort | null) => void;
  onReceipt?: (receipt: CraftCanvasReceipt) => void;
};

function editKind(edit: CraftWorkingEdit): 'Insert' | 'Delete' | 'Replace' {
  if (edit.from && edit.to) return 'Replace';
  if (edit.from) return 'Delete';
  return 'Insert';
}

function decisionFor(
  decisions: ReadonlyMap<number, CraftDecision>,
  id: number,
): CraftDecision {
  return decisions.get(id) ?? { mode: 'original' };
}

function visibleBlockText(text: string): string {
  const trimmed = text.trim();
  const wrapped = /^(\*|_)([\s\S]+)\1$/.exec(trimmed);
  return wrapped ? wrapped[2]!.trim() : trimmed;
}

function CraftContextBlocks({ text = '', blocks: suppliedBlocks, muted = false }: { text?: string; blocks?: readonly WriteBlock[]; muted?: boolean }) {
  if (!text.trim() && !suppliedBlocks?.length) return null;
  const blocks = suppliedBlocks ?? typesetProseBlocks(text);
  return (
    <div className={muted ? 'p4r1-craft-r1-context p4r1-craft-r1-context-muted' : 'p4r1-craft-r1-context'}>
      {blocks.map((block, index) => {
        const shown = visibleBlockText(block.text);
        if (!shown) return null;
        if (block.kind === 'epigraph') {
          return <blockquote key={index}>{shown}</blockquote>;
        }
        if (block.kind === 'subhead') {
          return <h4 key={index}>{shown}</h4>;
        }
        if (block.kind === 'list') {
          return (
            <div key={index} className="p4r1-craft-r1-list">
              {shown.split('\n').filter(Boolean).map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}
            </div>
          );
        }
        return <p key={index}>{shown}</p>;
      })}
    </div>
  );
}

function CraftTypography({ text, breaks, offset = 0 }: { text: string; breaks: readonly CraftProseBreak[]; offset?: number }) {
  return <>{craftTypographyChunks(text, breaks, offset).map((chunk, index) =>
    chunk.paragraphBreak
      ? <span key={index} className="p4r1-craft-r1-paragraph-break" data-craft-paragraph-break aria-hidden="true">{chunk.text}</span>
      : <span key={index}>{chunk.text}</span>
  )}</>;
}

function compactRationale(text: string | null | undefined): string | null {
  const clean = text?.replace(/\s+/g, ' ').trim() ?? '';
  if (!clean) return null;
  return clean.length <= 360 ? clean : clean.slice(0, 357).trimEnd() + '…';
}

export default function CraftsmansTableR1(props: CraftsmansTableR1Props) {
  const [view, setView] = useState<'markup' | 'preview'>('markup');
  const [notation, setNotation] = useState<'guided' | 'professional'>('guided');
  const [decisions, setDecisions] = useState<ReadonlyMap<number, CraftDecision>>(new Map());
  // Incoming alternatives and the candidate being shaped have separate identity.
  // A new model reply must never reinterpret old decisions against new edit IDs.
  const [candidateVersion, setCandidateVersion] = useState(props.version);
  const [writerHasActed, setWriterHasActed] = useState(false);
  const [manualText, setManualText] = useState<string | null>(null);
  const [manualFromVersionId, setManualFromVersionId] = useState<string | null>(null);
  const [directDraft, setDirectDraft] = useState('');
  const [directEditing, setDirectEditing] = useState(false);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [customEditId, setCustomEditId] = useState<number | null>(null);
  const [customDraft, setCustomDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [kept, setKept] = useState<readonly CraftKeptSpan[]>([]);
  const locusRef = useRef<HTMLSpanElement | null>(null);
  const editControlsRef = useRef<HTMLDivElement | null>(null);
  const editTriggerRef = useRef<HTMLElement | null>(null);
  const editControlsId = useId();
  const [editRevealRequest, setEditRevealRequest] = useState(0);

  // Opening a mark reveals choices. It never chooses, saves, or applies wording.
  // Increment even for the same mark: the writer may have scrolled away since
  // opening it, and a second click must not become an invisible React no-op.
  const openEditControls = (id: number, trigger: HTMLElement) => {
    editTriggerRef.current = trigger;
    setActiveEditId(id);
    setEditRevealRequest(value => value + 1);
  };
  const closeEditControls = () => {
    setActiveEditId(null);
    editTriggerRef.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    const controls = editControlsRef.current;
    const scroll = controls?.closest<HTMLElement>('.p4r1-craft-r1-scroll');
    if (!controls || !scroll || activeEditId === null || view !== 'markup') return;
    const bounds = scroll.getBoundingClientRect();
    const panel = controls.getBoundingClientRect();
    const footer = scroll.closest('[data-craftsmans-table-r1]')
      ?.querySelector('.p4r1-craft-r1-footer')?.getBoundingClientRect();
    const top = Math.max(0, bounds.top) + 12;
    const bottom = Math.min(window.innerHeight, bounds.bottom,
      footer && footer.top > top ? footer.top : bounds.bottom) - 12;
    if (bottom > top) {
      const delta = panel.height > bottom - top || panel.top < top
        ? panel.top - top
        : panel.bottom > bottom ? panel.bottom - bottom : 0;
      if (delta !== 0) {
        // Scroll only the manuscript pane, never the outer page or MAIA.
        const previous = scroll.style.scrollBehavior;
        scroll.style.scrollBehavior = 'auto';
        scroll.scrollTop += delta;
        scroll.style.scrollBehavior = previous;
      }
    }
    if (customEditId === null) controls.focus({ preventScroll: true });
  }, [activeEditId, editRevealRequest, view, customEditId]);

  const original = props.held?.text ?? '';
  const focusKey = props.held ? craftTargetKey({ sectionId: props.held.draftSectionId, ...props.held }) : '';
  const announce = (receipt: CraftCanvasReceipt): CraftCanvasReceipt => {
    setLocalMessage(receipt.message);
    props.onReceipt?.(receipt);
    return receipt;
  };
  const proposal = candidateVersion?.wording ?? original;
  const proposalEdits = useMemo(
    () => craftWorkingEdits(original, proposal),
    [original, proposal],
  );

  useEffect(() => {
    setCandidateVersion(props.version);
    setWriterHasActed(false);
    setDecisions(initialCraftDecisions(
      craftWorkingEdits(original, props.version?.wording ?? original),
      props.version?.author ?? null,
    ));
    setManualText(null);
    setManualFromVersionId(null);
    setDirectDraft('');
    setDirectEditing(false);
    setActiveEditId(null);
    setCustomEditId(null);
    setCustomDraft('');
    setLocalMessage(null);
    setKept([]);
    let restored = props.restoreSnapshot;
    // One-use recovery of the actual open draft across this candidate's HMR.
    // Never a server write, never an inferred proposal acceptance.
    if (!restored && props.thread && typeof window !== 'undefined') {
      try {
        const key = 'ws-craft-focus-recovery:' + props.thread.threadId;
        const raw = window.sessionStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as CraftTableSnapshot;
          if (parsed.key === focusKey) { restored = parsed; window.sessionStorage.removeItem(key); }
        }
      } catch { /* A recovery failure does not invent a working version. */ }
    }
    if (restored?.key === focusKey && restored.original === original) {
      setCandidateVersion(restored.candidateVersion);
      setWriterHasActed(restored.writerHasActed);
      setDecisions(new Map(restored.decisions));
      setManualText(restored.manualText);
      setManualFromVersionId(restored.manualFromVersionId);
      setDirectDraft(restored.directDraft);
      setDirectEditing(restored.directEditing);
      setActiveEditId(restored.activeEditId);
      setCustomEditId(restored.customEditId);
      setCustomDraft(restored.customDraft);
      setView(restored.view);
      setNotation(restored.notation);
      setKept(restored.kept);
    }
  }, [
    props.held?.draftSectionId,
    props.held?.start,
    props.held?.end,
    original,
  ]);

  useEffect(() => {
    if (!props.thread || !focusKey || writerHasActed || props.restoreSnapshot) return;
    try {
      const key = 'ws-craft-focus-recovery:' + props.thread.threadId;
      const raw = window.sessionStorage.getItem(key);
      if (!raw) return;
      const copy = JSON.parse(raw) as CraftTableSnapshot;
      if (copy.key !== focusKey || copy.original !== original) return;
      setCandidateVersion(copy.candidateVersion);
      setWriterHasActed(copy.writerHasActed);
      setDecisions(new Map(copy.decisions));
      setManualText(copy.manualText);
      setManualFromVersionId(copy.manualFromVersionId);
      setDirectDraft(copy.directDraft);
      setDirectEditing(copy.directEditing);
      setCustomDraft(copy.customDraft);
      setCustomEditId(copy.customEditId);
      setActiveEditId(copy.activeEditId);
      setView(copy.view);
      setNotation(copy.notation);
      setKept(copy.kept);
      window.sessionStorage.removeItem(key);
    } catch { /* No recovery claim on an unreadable snapshot. */ }
  }, [props.thread?.threadId, focusKey]);

  /* An arriving version is an alternative until the writer chooses it. A Save
     acknowledgement may change version identity only for identical working text. */
  useEffect(() => {
    // The focus-restoration effect above owns this render. An incoming thread
    // version must not reset its restored choices using the previous focus's
    // render-time writerHasActed value.
    if (props.restoreSnapshot?.key === focusKey
      && props.restoreSnapshot.original === original
      && props.restoreSnapshot.writerHasActed && !writerHasActed) return;
    if (props.version?.id === candidateVersion?.id
      && props.version?.wording === candidateVersion?.wording) return;
    const heldCopy = manualText ?? composeCraftWorkingCopy(original, proposalEdits, decisions);
    const savedSameCopy = props.version?.author === 'member'
      && props.version.wording === heldCopy
      && !directEditing && customEditId === null;
    if (!savedSameCopy && (writerHasActed || manualText !== null || directEditing || customEditId !== null)) return;

    setCandidateVersion(props.version);
    setDecisions(initialCraftDecisions(
      craftWorkingEdits(original, props.version?.wording ?? original),
      props.version?.author ?? null,
    ));
    if (savedSameCopy) {
      setManualText(null);
      setManualFromVersionId(null);
    }
    setActiveEditId(null);
    setCustomEditId(null);
    setCustomDraft('');
  }, [props.version?.id, props.version?.author, props.version?.wording]);

  const selectedProposalText = useMemo(
    () => composeCraftWorkingCopy(original, proposalEdits, decisions),
    [original, proposalEdits, decisions],
  );

  const workingText = directEditing ? directDraft : manualText ?? selectedProposalText;
  const displayText = manualText ?? proposal;
  const displaySegments = useMemo(
    () => editorialSegments(original, displayText),
    [original, displayText],
  );
  const displayEdits = useMemo(
    () => craftWorkingEdits(original, displayText),
    [original, displayText],
  );
  const displayDecisions = useMemo(
    () => manualText !== null
      ? initialCraftDecisions(displayEdits, 'member')
      : decisions,
    [manualText, displayEdits, decisions],
  );

  const proposalChosenCount = useMemo(
    () => decisionCount(proposalEdits, decisions),
    [proposalEdits, decisions],
  );
  const hasWriterChange = workingText !== original;
  const liveBody = props.held ? props.bodyOf(props.held.draftSectionId) : '';
  const canonicalAligned = Boolean(props.held
    && props.held.start >= 0 && props.held.end >= props.held.start
    && props.held.end <= Array.from(liveBody).length
    && Array.from(liveBody).slice(props.held.start, props.held.end).join('') === original
    && (!props.thread || (props.thread.targetSectionId === props.held.draftSectionId
      && props.thread.locusText === original)));
  const pendingComposition = directEditing || customEditId !== null;
  const canSave = canonicalAligned && Boolean(props.thread && props.version) && hasWriterChange && !pendingComposition && !props.busy && !saving;
  const canApply = canonicalAligned && Boolean(props.thread && props.version) && !pendingComposition && !props.busy && !saving
    && props.version?.author === 'member' && props.version.wording === workingText;

  useEffect(() => {
    props.onWorkingTextChange?.(workingText);
  }, [workingText, props.onWorkingTextChange]);

  useEffect(() => {
    if (!props.held || !locusRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      locusRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [props.held?.draftSectionId, props.held?.start, props.held?.end]);

  const keepOriginal = (word: string): CraftCanvasReceipt => {
    if (!canonicalAligned || props.busy || saving || customEditId !== null) return announce({ ok: false,
      message: 'Finish the current wording action before settling this choice. Nothing was applied.' });
    const span = locateUniquePresentationPassage(original, word);
    if (!span) return announce({ ok: false, message: 'Select the exact original words to keep; this reference is not unique. Nothing changed.' });
    const currentEdits = craftWorkingEdits(original, workingText);
    const overlaps = currentEdits.filter(e => e.start < span.end && e.end > span.start);
    if (overlaps.some(e => e.start < span.start || e.end > span.end || e.protectedSpan)) return announce({ ok: false,
      message: 'Those words are part of a larger draft change. Choose that marked change before settling it.' });
    const nextDecisions = new Map(initialCraftDecisions(currentEdits, 'member'));
    overlaps.forEach(e => nextDecisions.set(e.id, { mode: 'original' }));
    const text = Array.from(original).slice(span.start, span.end).join('');
    const settled = { ...span, text };
    setWriterHasActed(true);
    setManualText(composeCraftWorkingCopy(original, currentEdits, nextDecisions));
    setManualFromVersionId(candidateVersion?.id ?? null);
    setDirectEditing(false);
    setActiveEditId(null);
    setKept(current => [...current.filter(k => k.start !== span.start || k.end !== span.end), settled]);
    return announce({ ok: true, settled, message: `“${text}” kept for this pass. Manuscript unchanged.` });
  };

  const replaceWorking = (from: string, to: string): CraftCanvasReceipt => {
    if (!canonicalAligned || props.busy || saving || customEditId !== null) return announce({ ok: false,
      message: 'Finish the current wording action first. Nothing changed.' });
    const first = workingText.indexOf(from);
    if (!from || first < 0 || workingText.indexOf(from, first + 1) >= 0) return announce({ ok: false,
      message: 'That wording is missing or occurs more than once. Select the exact place first.' });
    if (kept.some(k => from.includes(k.text))) return announce({ ok: false,
      message: 'That choice is settled for this pass. Reopen it on the table before changing it.' });
    setWriterHasActed(true);
    setManualText(workingText.slice(0, first) + to + workingText.slice(first + from.length));
    setDirectEditing(false);
    setActiveEditId(null);
    return announce({ ok: true, message: 'Working copy updated. Not applied to the manuscript.' });
  };

  useEffect(() => {
    if (!props.onConnect) return;
    props.onConnect({
      snapshot: () => props.held ? ({ key: focusKey, candidateVersion, decisions: [...decisions],
        manualText, manualFromVersionId, directDraft, directEditing, customDraft, customEditId,
        writerHasActed, activeEditId, view, notation, kept, workingText, original }) : null,
      keepOriginal,
      replaceWorking,
      setView: next => {
        if (directEditing) { setManualText(directDraft); setDirectEditing(false); }
        setView(next);
        return announce({ ok: true, message: next === 'preview'
          ? 'Preview shows your working copy. Manuscript unchanged.'
          : 'Markup shows proposed and chosen changes. Manuscript unchanged.' });
      },
    });
    return () => props.onConnect?.(null);
  });

  const activeEdit = activeEditId === null
    ? null
    : displayEdits.find((edit) => edit.id === activeEditId) ?? null;

  const applyDisplayDecision = (id: number, decision: CraftDecision) => {
    const edit = displayEdits.find((candidate) => candidate.id === id);
    if (!canonicalAligned || props.busy || !edit || edit.protectedSpan) return;
    if (decision.mode !== 'original' && kept.some(k => k.start < edit.end && k.end > edit.start)) {
      announce({ ok: false, message: 'This choice is settled. Reopen it before revising it.' });
      return;
    }
    setWriterHasActed(true);
    if (decision.mode === 'original') {
      const settled = { start: edit.start, end: edit.end, text: edit.from };
      setKept(current => [...current.filter(k => k.start !== edit.start || k.end !== edit.end), settled]);
      setActiveEditId(null);
      announce({ ok: true, settled, message: edit.from.trim()
        ? `“${edit.from.trim()}” kept for this pass. Manuscript unchanged.`
        : 'Original spacing kept for this pass. Manuscript unchanged.' });
    }
    const next = new Map(manualText === null ? decisions : initialCraftDecisions(displayEdits, 'member'));
    next.set(id, decision);
    if (manualText === null && decision.mode !== 'custom') {
      setDecisions(next);
    } else {
      // A local author-written phrase is now authored working copy, not a
      // rendering substitution into MAIA's independently tokenized proposal.
      setManualText(composeCraftWorkingCopy(original, displayEdits, next));
      setManualFromVersionId(candidateVersion?.id ?? manualFromVersionId);
      setActiveEditId(null);
    }
    if (decision.mode !== 'original') announce({ ok: true, message: 'Working copy updated. Not applied to the manuscript.' });
  };

  const beginCustom = (edit: CraftWorkingEdit) => {
    const current = decisionFor(displayDecisions, edit.id);
    if (!canonicalAligned || props.busy || edit.protectedSpan) return;
    setWriterHasActed(true);
    setCustomEditId(edit.id);
    setCustomDraft(
      current.mode === 'custom'
        ? current.text
        : edit.to || edit.from,
    );
  };

  const commitCustom = (edit: CraftWorkingEdit) => {
    applyDisplayDecision(edit.id, { mode: 'custom', text: customDraft });
    setCustomEditId(null);
    setCustomDraft('');
  };

  const beginDirectComposition = (seed: string, versionId: string | null) => {
    if (props.busy || !canonicalAligned) return;
    setWriterHasActed(true);
    setDirectDraft(seed);
    setDirectEditing(true);
    setManualFromVersionId(versionId);
    setView('preview');
    setLocalMessage(null);
  };

  const commitDirectComposition = () => {
    setManualText(directDraft);
    setDirectEditing(false);
    setActiveEditId(null);
    announce({ ok: true, message: 'Working copy updated. Not applied to the manuscript.' });
  };

  const saveWorkingVersion = async () => {
    if (
      !props.thread
      || !props.held
      || !props.version
      || !canSave
    ) return;
    setSaving(true);
    setLocalMessage(null);
    try {
      const ok = await props.onSaveMember({
        threadId: props.thread.threadId,
        sectionId: props.held.draftSectionId,
        supersedes: props.version.id,
        text: workingText,
        purpose: 'Writer-shaped Craft version',
      });
      setLocalMessage(ok
        ? 'Saved as your version. The manuscript is still unchanged.'
        : 'Your version could not be saved just now. Your wording and choices remain here.');
    } finally {
      setSaving(false);
    }
  };

  const askAbout = (
    edit: CraftWorkingEdit,
    kind: 'another' | 'why' | 'teach',
  ) => {
    const localWorking = manualText !== null
      ? ' This mark is part of the writer’s own current working copy.'
      : decisionFor(decisions, edit.id).mode === 'proposal'
        ? ' The writer currently has this proposed move in the working copy.'
        : ' The writer is currently keeping the original here.';

    const subject = !edit.from
      ? `the insertion "${edit.to.trim()}"`
      : !edit.to
        ? `the deletion "${edit.from.trim()}"`
        : `the change from "${edit.from.trim()}" to "${edit.to.trim()}"`;

    if (kind === 'another') {
      props.onSend([
        `Show me one genuinely different way to handle ${subject}.${localWorking}`,
        'Stay inside this exact local edit. Preserve my intention, voice, cadence, imagery, worldview, and intentional ambiguity.',
        'Do not broaden the rewrite. Return one bounded alternative and explain its tradeoff briefly.',
      ].join('\n'), {
        proposalPolicy: 'allow',
        proposalRequested: true,
        displayText: 'Show me another way for this change.',
      });
      return;
    }
    if (kind === 'why') {
      props.onSend([
        `Explain ${subject}.${localWorking}`,
        'Use evidence from my exact words. Tell me what the move may gain and what it could cost.',
        'Make the strongest case for my original too. Do not propose new wording in this answer.',
      ].join('\n'), {
        proposalPolicy: 'reply_only',
        displayText: 'Why this change?',
      });
      return;
    }
    props.onSend([
      `Teach me the craft involved in ${subject}.${localWorking}`,
      'Use my sentence as the example. Plain language first, then professional terminology if useful.',
      'Do not propose new wording unless I ask.',
    ].join('\n'), {
      proposalPolicy: 'reply_only',
      displayText: 'Teach me what is happening in this change.',
    });
  };

  const insertionIndex = useMemo(() => {
    const first = new Map<number, number>();
    displaySegments.forEach((segment, index) => {
      if (segment.kind === 'ins' && segment.editId !== null && !first.has(segment.editId)) {
        first.set(segment.editId, index);
      }
    });
    return first;
  }, [displaySegments]);

  const firstChangeIndex = useMemo(() => {
    const first = new Map<number, number>();
    displaySegments.forEach((segment, index) => {
      if (segment.kind !== 'same' && segment.editId !== null && !first.has(segment.editId)) {
        first.set(segment.editId, index);
      }
    });
    return first;
  }, [displaySegments]);

  const applied = Boolean(
    props.version?.author === 'member'
    && props.appliedVersionId === props.version.id,
  );

  const newerMaiaAlternative = Boolean(
    (writerHasActed || manualText !== null)
    && props.version?.author === 'maia'
    && props.version.id !== (manualFromVersionId ?? candidateVersion?.id)
    && props.version.wording !== workingText,
  );

  return (
    <section className="p4r1-craft-r1" data-craftsmans-table-r1>
      <header className="p4r1-craft-r1-bar">
        <div>
          <span className="p4r1-eyebrow">Develop · Craftsman's Table</span>
          <strong>The writing is the workbench.</strong>
          <small>Bracket: focused passage. Red strikeouts and blue inserts: proposed edits. Apply remains your choice.</small>
        </div>
        <div className="p4r1-craft-r1-controls">
          <div className="p4r1-craft-r1-view" role="group" aria-label="Craft view">
            <button type="button" aria-pressed={view === 'markup'} onClick={() => {
              if (directEditing) {
                setManualText(directDraft);
                setDirectEditing(false);
                setActiveEditId(null);
              }
              setView('markup');
            }}>Markup</button>
            <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>Preview</button>
          </div>
          <details className="p4r1-craft-r1-notation">
            <summary>{notation === 'professional' ? 'Pro marks' : 'Marks'}</summary>
            <div>
              <button type="button" aria-pressed={notation === 'guided'} onClick={() => setNotation('guided')}>Guided</button>
              <button type="button" aria-pressed={notation === 'professional'} onClick={() => setNotation('professional')}>Professional</button>
            </div>
          </details>
        </div>
      </header>
      {props.focusTools}
      {kept.length > 0 ? <div className="p4r1-craft-kept" data-craft-settled-choices>
        {kept.map(k => <span key={`${k.start}:${k.end}`}>Kept: {k.text.trim() || 'spacing'}
          <button type="button" onClick={() => {
            setKept(current => current.filter(x => x !== k));
            announce({ ok: true, reopened: k, message: 'Choice reopened for this pass. No wording changed.' });
          }}>Reopen</button>
        </span>)}
      </div> : null}

      <div className="p4r1-craft-r1-scroll">
        <article className="p4r1-craft-r1-page">
          {props.sections.map((section) => {
            const body = props.bodyOf(section.draftSectionId);
            const active = props.held?.draftSectionId === section.draftSectionId;
            const Heading = section.headingDepth === 1 ? 'h1' : section.headingDepth === 2 ? 'h2' : 'h3';

            if (!active || !props.held) {
              return (
                <section key={section.draftSectionId} className="p4r1-craft-r1-section p4r1-craft-r1-context-section" data-craft-section-id={section.draftSectionId}>
                  {section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
                  <CraftContextBlocks text={body} muted />
                </section>
              );
            }

            const points = Array.from(body);
            const exact = points.slice(props.held.start, props.held.end).join('');
            const authoritative = exact === props.held.text;
            const activeContext = splitActiveParagraph(body, props.held.start, props.held.end);
            const openEdits = displayEdits.filter(edit => !kept.some(k => k.start === edit.start && k.end === edit.end && k.text === edit.from));
            const marginRationale = manualText === null && openEdits.length ? compactRationale(candidateVersion?.rationale) : null;
            const hasMargin = Boolean(marginRationale || (view === 'markup' && activeEdit));
            const previewBreaks = workingText === original
              ? activeContext.breaks : craftProseBreaks(craftProseBlocks(workingText));
            let sourceOffset = 0;

            return (
              <section
                key={section.draftSectionId}
                className="p4r1-craft-r1-section"
                data-craft-active-section
                data-craft-section-id={section.draftSectionId}
              >
                {section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
                <CraftContextBlocks blocks={activeContext.leadingBlocks} muted />
                <div className="p4r1-craft-r1-workrow" data-editorial-margin={hasMargin ? 'true' : 'false'}>
                  <div className="p4r1-craft-r1-worktext">
                    <div className="p4r1-craft-r1-active-paragraph" data-craft-focus-bracket data-prose-reflow={activeContext.reflow ? 'true' : 'false'}>
                      {activeContext.prefix}
                      <span
                        ref={locusRef}
                        className="p4r1-craft-r1-locus"
                        data-craft-authoritative={authoritative ? 'true' : 'false'}
                      >
                        {directEditing ? (
                          <textarea
                            className="p4r1-craft-r1-direct"
                            value={directDraft}
                            autoFocus
                            rows={Math.max(4, Math.min(14, directDraft.split('\n').length + 2))}
                            aria-label="Edit your working passage"
                            onChange={(event) => setDirectDraft(event.target.value)}
                          />
                        ) : view === 'preview' ? (
                          <span className="p4r1-craft-r1-preview"><CraftTypography text={authoritative ? workingText : exact} breaks={authoritative ? previewBreaks : activeContext.breaks} /></span>
                        ) : authoritative && displaySegments.length > 0 && displayText !== original ? (
                          displaySegments.map((segment, index) => {
                            const offset = sourceOffset;
                            if (segment.kind !== 'ins') sourceOffset += Array.from(segment.text).length;
                            const typeset = <CraftTypography text={segment.text} breaks={activeContext.breaks} offset={offset} />;
                            if (segment.kind === 'same') return <span key={index}>{typeset}</span>;
                            if (segment.editId === null) return <span key={index}>{typeset}</span>;

                            const decision = decisionFor(displayDecisions, segment.editId);
                            const chosen = decision.mode !== 'original';
                            const edit = displayEdits.find((candidate) => candidate.id === segment.editId) ?? null;
                            const settled = edit && kept.some(k => k.start === edit.start && k.end === edit.end && k.text === edit.from);
                            if (settled) return segment.kind === 'del'
                              ? <span key={index} data-craft-settled title="Kept for this pass">{typeset}</span>
                              : null;
                            const proof = edit ? professionalMarkFor(edit, displayEdits, decision) : null;
                            const proofMark = notation === 'professional'
                              && proof
                              && firstChangeIndex.get(segment.editId) === index
                              ? <sup className="p4r1-craft-r1-proofmark" title={proof.label}>{proof.symbol}</sup>
                              : null;
                            const common = {
                              'data-edit-id': segment.editId,
                              'data-selected': chosen ? 'true' : undefined,
                              'data-decision': decision.mode,
                              role: 'button',
                              tabIndex: 0,
                              'aria-expanded': activeEditId === segment.editId,
                              'aria-controls': editControlsId,
                              'aria-label': `Change ${segment.editId} · ${segment.kind === 'del' ? 'deletion' : 'insertion'}: ${segment.text.trim() || 'spacing'}. Open edit options`,
                              onClick: (event: ReactMouseEvent<HTMLElement>) => openEditControls(segment.editId!, event.currentTarget),
                              onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                openEditControls(segment.editId!, event.currentTarget);
                              },
                              title: `Change ${segment.editId} · click to work with this mark`,
                            };

                            if (segment.kind === 'del') {
                              const customWithoutInsertion = decision.mode === 'custom'
                                && edit
                                && !edit.to
                                && decision.text;
                              return (
                                <span key={index} className="p4r1-craft-r1-mark-unit">
                                  {proofMark}
                                  <del {...common}>{typeset}</del>
                                  {customWithoutInsertion ? (
                                    <ins {...common} className="p4r1-craft-r1-custom"><CraftTypography text={decision.text} breaks={craftInsertedBreaks(decision.text)} /></ins>
                                  ) : null}
                                </span>
                              );
                            }

                            const displayed = decision.mode === 'custom'
                              ? insertionIndex.get(segment.editId) === index
                                ? decision.text
                                : ''
                              : segment.text;
                            return displayed ? (
                              <span key={index} className="p4r1-craft-r1-mark-unit">
                                {proofMark}
                                <ins {...common}><CraftTypography text={displayed} breaks={craftInsertedBreaks(displayed)} /></ins>
                              </span>
                            ) : proofMark ? <span key={index}>{proofMark}</span> : null;
                          })
                        ) : (
                          <span className="p4r1-craft-r1-held"><CraftTypography text={exact} breaks={activeContext.breaks} /></span>
                        )}
                      </span>
                      {activeContext.suffix}
                    </div>

                    {directEditing ? (
                      <div className="p4r1-craft-r1-direct-actions">
                        <button type="button" onClick={commitDirectComposition}>Use this as my working copy</button>
                        <button type="button" onClick={() => {
                          setDirectEditing(false);
                          setDirectDraft('');
                        }}>Cancel</button>
                      </div>
                    ) : null}

                    {!directEditing && !(view === 'markup' && activeEdit) ? (
                      <div className="p4r1-craft-r1-focus-actions" data-craft-focus-actions>
                        <span>{props.busy ? 'Working with this passage…' : openEdits.length
                          ? 'Edit marks show proposed or chosen wording. Nothing is applied.'
                          : hasWriterChange ? 'Your working copy. Not applied to the manuscript.'
                          : 'Passage selected · no proposed edits yet.'}</span>
                        <div role="group" aria-label="Work with the focused passage">
                          <button type="button" disabled={props.busy || !canonicalAligned} onClick={() => props.onSend([
                            'Use our carried conversation and the writer-owned current working copy.',
                            'Show one small, useful edit to this exact focused passage directly in the marked copy.',
                            'Preserve the writer’s voice, meaning, imagery, cadence and settled choices. Explain the move briefly. Do not apply anything.',
                          ].join('\n'), { proposalPolicy: 'require', proposalRequested: true, displayText: 'Suggest one small edit to this focused passage.' })}>Suggest an edit</button>
                          <button type="button" disabled={props.busy || !canonicalAligned} onClick={() => props.onSend(
                            'Discuss this exact focused passage in light of our conversation. What is it doing, and what is the most useful question to consider? Do not draft or change any wording.',
                            { proposalPolicy: 'reply_only', displayText: 'Discuss this focused passage without changing the wording.' },
                          )}>Discuss</button>
                          <button type="button" disabled={props.busy || !canonicalAligned} onClick={() => beginDirectComposition(workingText, candidateVersion?.id ?? null)}>Write here</button>
                        </div>
                      </div>
                    ) : null}

                    {!authoritative ? (
                      <p className="p4r1-craft-r1-warning" role="status">
                        This passage changed after Craft opened. Re-anchor before making wording decisions.
                      </p>
                    ) : null}
                  </div>

                  {hasMargin ? <aside className="p4r1-craft-r1-margin" aria-label="Editorial margin">
                    {view === 'markup' && activeEdit ? (
                      <div className="p4r1-craft-r1-local" data-craft-local-edit={activeEdit.id}
                        ref={editControlsRef} id={editControlsId} tabIndex={-1}
                        role="group" aria-label={`Edit options for change ${activeEdit.id}`}
                        onKeyDown={event => {
                          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeEditControls(); }
                        }}
                      >
                        <div>
                          <button type="button" className="p4r1-craft-r1-local-close"
                            aria-label="Close edit options" onClick={closeEditControls}>Close</button>
                          <span>
                            Change {activeEdit.id} · {editKind(activeEdit)}
                            {notation === 'professional'
                              ? ` · ${professionalMarkFor(activeEdit, displayEdits, decisionFor(displayDecisions, activeEdit.id)).symbol}`
                              : ''}
                          </span>
                          <p>
                            {activeEdit.from ? <del>{activeEdit.from.trim()}</del> : null}
                            {activeEdit.from && activeEdit.to ? <span aria-hidden="true"> → </span> : null}
                            {activeEdit.to ? <ins>{activeEdit.to.trim()}</ins> : null}
                          </p>
                        </div>

                        {customEditId === activeEdit.id ? (
                          <div className="p4r1-craft-r1-own-wording">
                            <label>
                              <span>Your wording</span>
                              <textarea
                                value={customDraft}
                                autoFocus
                                rows={3}
                                onChange={(event) => setCustomDraft(event.target.value)}
                                aria-label="Write your wording for this edit"
                              />
                            </label>
                            <div>
                              <button type="button" onClick={() => commitCustom(activeEdit)}>Use my wording</button>
                              <button type="button" onClick={() => {
                                setCustomEditId(null);
                                setCustomDraft('');
                              }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <button
                              type="button"
                              aria-pressed={decisionFor(displayDecisions, activeEdit.id).mode === 'proposal'}
                              onClick={() => applyDisplayDecision(activeEdit.id, { mode: 'proposal' })}
                            >
                              Use this
                            </button>
                            <button
                              type="button"
                              aria-pressed={decisionFor(displayDecisions, activeEdit.id).mode === 'original'}
                              onClick={() => applyDisplayDecision(activeEdit.id, { mode: 'original' })}
                            >
                              {notation === 'professional' ? 'Stet · Keep mine' : 'Keep mine'}
                            </button>
                            <button
                              type="button"
                              aria-pressed={decisionFor(displayDecisions, activeEdit.id).mode === 'custom'}
                              onClick={() => beginCustom(activeEdit)}
                            >
                              Write it
                            </button>
                            <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'another')}>Another way</button>
                            <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'why')}>Why?</button>
                            <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'teach')}>Teach me</button>
                          </div>
                        )}
                      </div>
                    ) : null}
                    {marginRationale ? (
                      <div className="p4r1-craft-r1-margin-note">
                        <span>{candidateVersion?.author === 'maia' ? 'MAIA · craft note' : 'Working version'}</span>
                        <p>{marginRationale}</p>
                      </div>
                    ) : null}

                  </aside> : null}
                </div>
                <CraftContextBlocks blocks={activeContext.trailingBlocks} muted />
              </section>
            );
          })}
        </article>
      </div>

      {props.held ? (
        <footer className="p4r1-craft-r1-footer">
          <span>
            {pendingComposition
              ? 'Editing a local draft. Not applied to the manuscript.'
              : manualText !== null
              ? 'You are shaping your own working copy. Not applied to the manuscript.'
              : proposalChosenCount === 0
                ? 'Your original is still the working version.'
                : `${proposalChosenCount} MAIA move${proposalChosenCount === 1 ? '' : 's'} are in your working version.`}
            {newerMaiaAlternative ? ' MAIA has also offered a newer alternative; your wording has not been replaced.' : ''}
          </span>
          <div className="p4r1-craft-r1-footer-actions">
            <details className="p4r1-craft-r1-compose-menu">
              <summary>Compose</summary>
              <div>
                <button type="button" onClick={() => beginDirectComposition(original, props.version?.id ?? null)}>
                  Write from mine
                </button>
                <button type="button" onClick={() => beginDirectComposition(workingText, props.version?.id ?? null)}>
                  Edit current hybrid
                </button>
                {props.version?.author === 'maia' && props.version.wording !== original ? (
                  <button type="button" onClick={() => beginDirectComposition(props.version!.wording, props.version?.id ?? null)}>
                    Start from MAIA
                  </button>
                ) : null}
              </div>
            </details>
            {hasWriterChange ? (
              <button type="button" disabled={!canSave} onClick={() => void saveWorkingVersion()}>
                {saving ? 'Saving…' : 'Save my version'}
              </button>
            ) : null}
            {props.version?.author === 'member' && !applied ? (
              <button type="button" className="p4r1-craft-r1-primary" disabled={!canApply} onClick={() => { if (canApply) props.onApply(); }}>
                Apply my version
              </button>
            ) : null}
            {applied && props.onUndo ? (
              <button type="button" disabled={props.busy} onClick={props.onUndo}>Undo</button>
            ) : null}
          </div>
          {localMessage ? <small role="status">{localMessage}</small> : null}
        </footer>
      ) : null}
    </section>
  );
}
