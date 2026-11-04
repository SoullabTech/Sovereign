'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EDITORIAL_APPROACHES,
  approachNote,
  alternativeLabel,
  passageContext,
} from '@/lib/writersStudio/editorialApproaches';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import { EDITORIAL_PACKET_LABELS } from '@/lib/writersStudio/editorialIntelligence';
import { teachingQuestion, type TeachingAnchor } from '@/lib/writersStudio/teachingTurn';
import type { TurnShape } from '@/lib/writersStudio/conversationTurn';
import { passageActQuestion, type PassageAct as PassageActId } from '@/lib/writersStudio/passageActs';
import { parseStudioActions, type StudioActionId } from '@/lib/writersStudio/studioActions';
import FocusConversation from './FocusConversation';
import P4R1VoiceCapture from './P4R1VoiceCapture';

/** A passage act the writer chose: plain data, so a held act runs with the
 *  panel's current props rather than those from before the gates were met. */
export interface PassageAct {
  label: string;
  prompt: string;
  depth?: EditorialDepth;
  options?: { proposalPolicy?: 'allow' | 'reply_only'; proposalRequested?: boolean; teachingAnchor?: TeachingAnchor; passageAct?: PassageActId };
}

export interface EditorialDancePanelProps {
  manuscriptTitle: string;
  showOriginal?: boolean;
  origin?: {
    source: 'develop' | 'review';
    label: string;
    state: string;
    observation: string;
    coverage: string;
  } | null;
  currentText: string;
  sectionBody: string;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  lastMaiaTurn: RebuildEditorialThread['turns'][number] | null;
  appliedVersionId: string | null;
  busy: boolean;
  message: string | null;
  /** Informational, never a failure: e.g. an older conversation was left untouched. */
  notice?: string | null;
  /** When present, passage work needs a MAIA relationship for this Work; the
   * writer begins or continues one here. Absent means no such gate applies. */
  maiaRelationship?: {
    active: boolean;
    busy: boolean;
    choices: readonly { id: string; createdAt: string }[];
    message: string | null;
    onBegin: () => void;
    onChoose: (relationshipId: string) => void;
  } | null;
  undoMessage: string | null;
  sessionPosture: CurrentPostureRead;
  onChooseSessionPosture: (sanctuary: boolean) => void;

  onSelectVersion: (id: string) => void;
  /** Design 1B: the writer clicked a control MAIA offered. Navigation only. */
  onStudioAction?: (id: StudioActionId) => void;
  onSend: (text?: string, options?: { proposalPolicy?: 'allow' | 'reply_only'; proposalRequested?: boolean; teachingAnchor?: TeachingAnchor; turnShape?: TurnShape; passageAct?: PassageActId }) => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  onApply: () => void;
  onUndo?: () => void;
  onKeep: () => void;
  /** Conversation-first step 3: save MAIA's option as the writer's version and apply it, in one act. */
  onUseVersion?: (draft: MemberRevisionDraft) => Promise<boolean>;
  /** Conversation-first step 3: the writer's just-sent words while MAIA answers. */
  pendingQuestion?: string | null;
  onDepth: (depth: EditorialDepth) => void;
  /** An act the writer asked for from outside the panel (the Write menu's
   *  "Teach me about this"). It goes through the same gates as a card. */
  requestedAct?: (PassageAct & { key: number }) | null;
  onRequestedActTaken?: () => void;
}

function latestMaiaVersions(thread: RebuildEditorialThread | null): RebuildEditorialVersion[] {
  return distinctMaiaVersions(thread);
}

function distinctMaiaVersions(thread: RebuildEditorialThread | null): RebuildEditorialVersion[] {
  if (!thread) return [];
  const seenPurpose = new Set<string>();
  const seenWording = new Set<string>();
  const out: RebuildEditorialVersion[] = [];

  for (const candidate of thread.versions.filter((version) => version.author === 'maia').slice().reverse()) {
    const purpose = purposeOf(candidate, thread.versions.findIndex((version) => version.id === candidate.id))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const wording = candidate.wording.toLowerCase().replace(/\s+/g, ' ').trim();
    if ((purpose && seenPurpose.has(purpose)) || seenWording.has(wording)) continue;
    if (purpose) seenPurpose.add(purpose);
    seenWording.add(wording);
    out.push(candidate);
  }

  return out.reverse();
}

/** Step 3: about a sentence of the surrounding text on each side of the option. */
function aroundBefore(text: string): string {
  return (text.length > 140 ? '…' : '') + text.slice(-140);
}
function aroundAfter(text: string): string {
  return text.slice(0, 140) + (text.length > 140 ? '…' : '');
}

function purposeOf(version: RebuildEditorialVersion, index: number): string {
  return alternativeLabel(version, index).replace(/ · v\d+$/, '');
}

function firstUsefulSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^([\s\S]{1,240}?[.!?])(?:\s|$)/);
  return (match?.[1] ?? trimmed.slice(0, 240)).trim();
}

type DiffPart = { kind: 'same' | 'remove' | 'add'; text: string };

function coalesceDiff(parts: DiffPart[]): DiffPart[] {
  const out: DiffPart[] = [];
  for (const part of parts) {
    if (!part.text) continue;
    const last = out[out.length - 1];
    if (last?.kind === part.kind) last.text += part.text;
    else out.push({ ...part });
  }
  return out;
}

function wordDiff(original: string, edited: string): DiffPart[] {
  if (original === edited) return [{ kind: 'same', text: original }];
  const a = original.split(/(\s+)/).filter(Boolean);
  const b = edited.split(/(\s+)/).filter(Boolean);
  if (a.length * b.length > 160000) {
    return [
      { kind: 'remove', text: original },
      { kind: 'add', text: edited },
    ];
  }
  const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      dp[i]![j] = a[i] === b[j]
        ? dp[i + 1]![j + 1]! + 1
        : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const parts: DiffPart[] = [];
  let i = 0; let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { parts.push({ kind: 'same', text: a[i]! }); i += 1; j += 1; }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) { parts.push({ kind: 'remove', text: a[i]! }); i += 1; }
    else { parts.push({ kind: 'add', text: b[j]! }); j += 1; }
  }
  while (i < a.length) { parts.push({ kind: 'remove', text: a[i++]! }); }
  while (j < b.length) { parts.push({ kind: 'add', text: b[j++]! }); }
  return coalesceDiff(parts);
}

type EditorialSummary = {
  preserve: string | null;
  friction: string | null;
  tryNext: string | null;
  changed: string | null;
  why: string | null;
  readerEffect: string | null;
  protected: string | null;
};

function editorialSummary(text: string): EditorialSummary {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const pick = (pattern: RegExp) => {
    const hit = lines.find((line) => pattern.test(line));
    return hit ? hit.replace(pattern, '').trim() || null : null;
  };
  const compact = text.replace(/\s+/g, ' ').trim();
  const extract = (label: RegExp): string | null => {
    const labels = '(?:What changed|Why|Reader effect(?: \\(hypothesis only\\))?|What I protected)';
    const source = label.source.replace(/^\^/, '');
    const match = compact.match(new RegExp(`${source}\\s*([\\s\\S]*?)(?=\\s+${labels}\\s*:|$)`, 'i'));
    return match?.[1]?.trim() || null;
  };
  return {
    preserve: pick(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?What I[’']d preserve:\s*/i),
    friction: pick(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?Friction I notice:\s*/i),
    tryNext: pick(/^(?:[-*]\s*)?(?:\d+[.)]\s*)?What I[’']d try:\s*/i),
    changed: extract(/What changed:\s*/i),
    why: extract(/Why:\s*/i),
    readerEffect: extract(/Reader effect(?: \(hypothesis only\))?:\s*/i),
    protected: extract(/What I protected:\s*/i),
  };
}

function teachPassagePrompt(): string {
  return teachingQuestion('passage');
}

export default function EditorialDancePanel(props: EditorialDancePanelProps) {
  const [workingText, setWorkingText] = useState('');
  const [startPrompt, setStartPrompt] = useState('');
  const [workingFromVersionId, setWorkingFromVersionId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState('');
  const [talk, setTalk] = useState('');
  const [reviewedText, setReviewedText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [showDepth, setShowDepth] = useState<'none'|'why'|'teach'|'advanced'>('none');
  // Step 3: the option card's "More" fold and its one-press apply.
  const [moreOpen, setMoreOpen] = useState(false);
  const [using, setUsing] = useState(false);
  const workingRef = useRef<HTMLTextAreaElement | null>(null);
  const [postureNudge, setPostureNudge] = useState(false);
  const postureRef = useRef<HTMLDivElement | null>(null);
  const [relationshipNudge, setRelationshipNudge] = useState(false);
  /* The act the writer asked for while a gate was still open. It continues by
     itself once the writer has answered both gates, and never before. */
  const [heldAct, setHeldAct] = useState<PassageAct | null>(null);
  const relationshipRef = useRef<HTMLDivElement | null>(null);
  const relationshipBlocks = Boolean(props.maiaRelationship && !props.maiaRelationship.active);

  const postureOpen = props.sessionPosture.resolved && !props.sessionPosture.sanctuary;
  useEffect(() => {
    if (postureOpen) setPostureNudge(false);
  }, [postureOpen]);
  useEffect(() => {
    if (!relationshipBlocks) setRelationshipNudge(false);
  }, [relationshipBlocks]);

  const versions = props.thread?.versions ?? [];
  const maiaVersions = useMemo(() => latestMaiaVersions(props.thread), [props.thread]);
  const selectedIndex = props.version
    ? versions.findIndex((candidate) => candidate.id === props.version!.id)
    : -1;
  const selectedLabel = props.version
    ? purposeOf(props.version, Math.max(selectedIndex, 0))
    : 'MAIA’s recommendation';

  const context = passageContext(props.sectionBody, props.currentText);
  const recommendation = props.version?.author === 'maia'
    ? props.version
    : [...maiaVersions].reverse()[0] ?? null;
  // Design 1B: markers are never shown as text; at most one becomes a button.
  const reply = props.lastMaiaTurn?.body ? parseStudioActions(props.lastMaiaTurn.body, 'passage-focus') : null;
  const replyAction = reply?.action && props.onStudioAction ? (
    <button type="button" className="p4r1-studio-action" data-studio-action={reply.action.id}
      disabled={props.busy} onClick={() => props.onStudioAction?.(reply.action!.id)}>
      {reply.action.label}
    </button>
  ) : null;
  const summarySource = reply?.text ?? recommendation?.rationale ?? '';
  const conversation = props.thread?.turns ?? [];
  // Step 3: MAIA's latest turn is shown as the option card, not repeated above it.
  const optionApplied = Boolean(props.appliedVersionId && props.onUndo);
  /* Step 3: "Use this" is one act. The writer's version is MAIA's wording, saved by
     this press, then applied; the controller keeps every gate and read-back. */
  const useThis = async () => {
    if (!props.onUseVersion || !props.thread?.targetSectionId || !recommendation || using) return;
    setUsing(true);
    setLocalMessage(null);
    try {
      const ok = await props.onUseVersion({
        threadId: props.thread.threadId,
        sectionId: props.thread.targetSectionId,
        // The new version replaces whatever is latest in this conversation; after an
        // Undo that is the writer's earlier save, not MAIA's option (else 409).
        supersedes: props.thread.headVersionId ?? recommendation.id,
        text: recommendation.wording,
        purpose: purposeOf(recommendation, versions.findIndex((v) => v.id === recommendation.id)).slice(0, 80),
      });
      if (!ok) setLocalMessage('That could not be applied just now. Your manuscript is unchanged.');
    } finally {
      setUsing(false);
    }
  };
  // "Adjust" opens the writer's own working version, under More.
  const adjustOwn = () => {
    setMoreOpen(true);
    setTimeout(() => workingRef.current?.focus(), 0);
  };
  const conversationBeforeOption = conversation.length > 0 && conversation[conversation.length - 1]!.speaker === 'maia'
    ? conversation.slice(0, -1)
    : conversation;
  const summary = editorialSummary(summarySource);
  const hasStructuredSummary = Boolean(summary.preserve || summary.friction || summary.tryNext);
  const changeSummary = editorialSummary(props.version?.rationale ?? recommendation?.rationale ?? '');
  const hasChangeSummary = Boolean(
    changeSummary.changed || changeSummary.why || changeSummary.readerEffect || changeSummary.protected,
  );
  const changedWords = useMemo(
    () => wordDiff(props.currentText, props.version?.wording ?? recommendation?.wording ?? props.currentText),
    [props.currentText, props.version?.wording, recommendation?.wording],
  );

  useEffect(() => {
    if (!props.version) return;
    if (workingFromVersionId === props.version.id) return;

    const sameWords = workingText === props.version.wording;
    setWorkingFromVersionId(props.version.id);
    setWorkingText(props.version.wording);
    setPurpose(purposeOf(props.version, Math.max(selectedIndex, 0)));

    /* Saving the exact words the writer already reviewed in context changes
       durable identity, not the reviewed wording. Preserve that review only
       when the text is byte-for-byte the same. */
    if (!sameWords) {
      setReviewedText(null);
      setShowContext(false);
    }
    setLocalMessage(null);
  }, [props.version?.id]);

  const memberVersionMatchingDraft = props.thread?.versions.find((candidate) =>
    candidate.author === 'member' && candidate.wording === workingText,
  ) ?? null;

  const reviewedCurrentDraft = reviewedText === workingText;
  const applyReady = Boolean(
    memberVersionMatchingDraft
    && props.version?.id === memberVersionMatchingDraft.id
    && reviewedCurrentDraft
    && props.appliedVersionId !== memberVersionMatchingDraft.id,
  );

  const chooseVersion = (candidate: RebuildEditorialVersion) => {
    props.onSelectVersion(candidate.id);
    setWorkingFromVersionId(candidate.id);
    setWorkingText(candidate.wording);
    setPurpose(purposeOf(candidate, versions.findIndex((v) => v.id === candidate.id)));
    setReviewedText(null);
    setShowContext(false);
    setLocalMessage(null);
  };

  const requestDirection = (id: typeof EDITORIAL_APPROACHES[number]['id']) => {
    const approach = EDITORIAL_APPROACHES.find((candidate) => candidate.id === id)!;
    props.onSend([
      approachNote(id),
      'Offer one possible revision of this exact passage in that direction.',
      'Begin the rationale with "Editorial purpose: ' + approach.label + '".',
      'Then include four short rationale lines: "What changed: …", "Why: …", "Reader effect: …", and "What I protected: …".',
      'Preserve my stated intention and voice. Separate meaning changes from style changes.',
      'Treat any reader effect as a hypothesis. Do not invent personal experience, quotations, sources, or unseen evidence.',
      'Nothing is to be applied automatically.',
    ].join('\n\n'), { proposalPolicy: 'allow', proposalRequested: true });
  };

  const adjustProposal = (instruction: string) => {
    const selected = props.version?.wording ?? recommendation.wording;
    props.onSend([
      instruction,
      'Original passage:',
      props.currentText,
      '',
      'Currently selected proposal:',
      selected,
      '',
      'Work from these exact two texts. Do not silently broaden the edit or substitute a different locus.',
      'Return at most one new proposal. Preserve my voice, intention, subject, and intentional ambiguity.',
      'The adjusted proposal must differ meaningfully from the currently selected proposal. If no meaningful adjustment in the requested direction is possible, reply without a new proposal and explain why.',
      'In the rationale include: "What changed: …", "Why: …", "Reader effect: …", and "What I protected: …".',
      'Treat reader effect as a hypothesis. Nothing is applied automatically.',
    ].join('\n'), { proposalPolicy: 'allow', proposalRequested: true });
  };

  const sendTalk = () => {
    const q = talk.trim();
    if (!q || !props.thread) return;
    props.onSend([
      'My working revision (not applied):',
      workingText,
      '',
      'What I want from you:',
      q,
      '',
      'Treat my working revision as the wording I am shaping now. Do not silently restore your earlier proposal.',
      'Respond to my intention first. If you suggest wording, explain what it changes and what might be lost. Nothing is to be applied automatically.',
    ].join('\n'));
    setTalk('');
  };

  const saveMemberVersion = async () => {
    if (!props.thread?.targetSectionId || !props.version || saving) return;
    setSaving(true);
    setLocalMessage(null);
    try {
      const ok = await props.onSaveMember({
        threadId: props.thread.threadId,
        sectionId: props.thread.targetSectionId,
        supersedes: props.version.id,
        text: workingText,
        ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
      });
      setLocalMessage(ok
        ? 'Your wording is saved as your version. The manuscript is still unchanged.'
        : 'Your wording could not be saved just now. It is still held here.');
    } finally {
      setSaving(false);
    }
  };

  const withOrigin = (prompt: string): string => {
    if (!props.origin || props.thread) return prompt;
    const source = props.origin.source === 'review' ? 'Review finding' : 'developmental reading';
    return [
      `We arrived at this exact passage from a prior frozen ${source}.`,
      `Observed then · ${props.origin.label} · ${props.origin.state}`,
      props.origin.observation,
      `Reading coverage: ${props.origin.coverage}`,
      '',
      'Treat that as attributed historical context, not a verdict and not an edit instruction.',
      'Use the current passage as the authority for any new editorial claim. If the current words no longer support the prior observation, say so.',
      'Do not silently convert the prior observation into a revision recommendation.',
      '',
      prompt,
    ].join('\n');
  };

  const begin = (
    prompt: string,
    depth?: EditorialDepth,
    options?: { proposalPolicy?: 'allow' | 'reply_only'; proposalRequested?: boolean; teachingAnchor?: TeachingAnchor; passageAct?: PassageActId },
  ) => {
    if (depth) props.onDepth(depth);
    props.onSend(withOrigin(prompt), options);
  };

  const sendOpenPrompt = () => {
    const q = startPrompt.trim();
    if (!q) return;
    if (relationshipBlocks) {
      setRelationshipNudge(true);
      relationshipRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    // Design 3C: only the writer's words are their turn; the conversational
    // shape is server-owned (turnShape), like a Teach-me's (F1).
    props.onSend(withOrigin(q), { turnShape: 'conversation' });
    setStartPrompt('');
  };

  const postureBlocksEditorial = !props.sessionPosture.resolved || props.sessionPosture.sanctuary;
  /* A card chosen before the posture is answered must answer the click: it
     points the writer at the posture choice instead of silently doing nothing,
     and holds the act so it continues once the writer has answered.
     ⛔ It never chooses a posture, never begins a relationship, and never sends
     anything while a gate is open. Under Sanctuary nothing continues. */
  const runAct = (act: PassageAct) => begin(act.prompt, act.depth, act.options);
  const startAct = (act: PassageAct) => {
    if (postureBlocksEditorial) {
      setHeldAct(act);
      setPostureNudge(true);
      postureRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    // Beginning a relationship is the writer's own act; a card never does it.
    if (relationshipBlocks) {
      setHeldAct(act);
      setRelationshipNudge(true);
      relationshipRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    setHeldAct(null);
    runAct(act);
  };
  useEffect(() => {
    if (!heldAct || postureBlocksEditorial || relationshipBlocks || props.busy) return;
    const act = heldAct;
    setHeldAct(null);
    runAct(act);
    // runAct reads current props; the held act itself is plain data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldAct, postureBlocksEditorial, relationshipBlocks, props.busy]);
  useEffect(() => {
    if (!props.requestedAct) return;
    const { key: _key, ...act } = props.requestedAct;
    props.onRequestedActTaken?.();
    // Held, not run here: it continues through the effect above, once both
    // gates are answered and MAIA is not busy.
    setHeldAct(act);
    if (postureBlocksEditorial) setPostureNudge(true);
    else if (relationshipBlocks) setRelationshipNudge(true);
    // Each request is taken once, identified by its key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.requestedAct?.key]);
  const heldNotice = heldAct ? (
    <p className="p4r1-dance-held" role="status" data-held-act>
      When you’ve answered, I’ll continue with “{heldAct.label}”.{' '}
      <button type="button" onClick={() => setHeldAct(null)}>Don’t continue</button>
    </p>
  ) : null;
  const relationshipGate = relationshipBlocks && !postureBlocksEditorial && props.maiaRelationship ? (
    <div
      ref={relationshipRef}
      className={relationshipNudge ? 'p4r1-dance-posture p4r1-dance-posture--nudge' : 'p4r1-dance-posture'}
      role="group"
      aria-label="Relationship with MAIA for this Work"
      data-relationship-gate
    >
      <div>
        <b>MAIA works on passages inside a relationship for this Work.</b>
        <span>None is selected yet. Ordinary writing stays fully available without one.</span>
        {relationshipNudge ? (
          <span role="status" data-relationship-nudge>Begin or continue a relationship first. Nothing has been sent.</span>
        ) : null}
        {props.maiaRelationship.message ? <span role="status">{props.maiaRelationship.message}</span> : null}
      </div>
      <div className="p4r1-dance-posture-actions">
        <button type="button" disabled={props.maiaRelationship.busy} onClick={props.maiaRelationship.onBegin}>
          {props.maiaRelationship.busy ? 'Beginning…' : 'Begin relationship with MAIA'}
        </button>
        {props.maiaRelationship.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={props.maiaRelationship!.busy}
            onClick={() => props.maiaRelationship!.onChoose(choice.id)}
          >
            Continue · {new Date(choice.createdAt).toLocaleDateString()}
          </button>
        ))}
      </div>
    </div>
  ) : null;
  const postureGate = postureBlocksEditorial ? (
    <div
      ref={postureRef}
      className={postureNudge ? 'p4r1-dance-posture p4r1-dance-posture--nudge' : 'p4r1-dance-posture'}
      role="group"
      aria-label="Choose privacy posture for this session"
    >
      {!props.sessionPosture.resolved ? (
        <>
          <div>
            <b>Choose how this session should hold the exchange.</b>
            <span>MAIA will not guess your privacy posture before opening an editorial relationship.</span>
            {postureNudge ? (
              <span role="status" data-posture-nudge>Choose Ordinary or Sanctuary first. Nothing has been sent.</span>
            ) : null}
          </div>
          <div className="p4r1-dance-posture-actions">
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Ordinary</button>
            <button type="button" onClick={() => props.onChooseSessionPosture(true)}>Sanctuary</button>
          </div>
        </>
      ) : (
        <>
          <div>
            <b>Sanctuary is on.</b>
            <span>Persistent editorial collaboration stays unavailable in Sanctuary. Your passage remains unchanged.</span>
            {postureNudge ? (
              <span role="status" data-posture-nudge>Switch to Ordinary to work with MAIA on this passage. Nothing has been sent.</span>
            ) : null}
          </div>
          <div className="p4r1-dance-posture-actions">
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Switch to Ordinary</button>
          </div>
        </>
      )}
    </div>
  ) : null;

  const noticeLine = props.notice
    ? <p className="p4r1-dance-notice" role="note" data-editorial-notice>{props.notice}</p>
    : null;

  /* Conversation-first step 4 (founder adoption 2026-11-03): three starters.
     Examples, ideas and a deeper look are things the writer can simply ask for in
     the box below; MAIA answers in the conversational shape. */
  const entryActions = (
    <div className="p4r1-dance-entry-groups" aria-label="Ways to start with this passage">
      <section>
        <div className="p4r1-dance-start-actions">
          <button type="button" disabled={props.busy} onClick={() => startAct({ label: 'Discuss what’s happening', prompt: passageActQuestion('discuss'), options: { proposalPolicy: 'reply_only', passageAct: 'discuss' } })}>
            <b>Discuss what’s happening</b>
            <span>Talk it through with MAIA before changing anything.</span>
          </button>
          <button
            type="button"
            disabled={props.busy}
            onClick={() => startAct({ label: 'Show edit options', prompt: passageActQuestion('revise'), options: { proposalPolicy: 'allow', proposalRequested: true, passageAct: 'revise' } })}
          >
            <b>Show edit options</b>
            <span>Let MAIA offer a revision direction and other ways this passage could move. Nothing changes until you apply one.</span>
          </button>
          <button type="button" disabled={props.busy} onClick={() => startAct({ label: 'Teach me about the writing', prompt: teachPassagePrompt(), depth: 'learning', options: { proposalPolicy: 'reply_only', teachingAnchor: 'passage' } })}>
            <b>Teach me about the writing</b>
            <span>Help me understand the craft already at work in my own words.</span>
          </button>
        </div>
      </section>
    </div>
  );

  const openPrompt = (
    <div className="p4r1-dance-open-prompt">
      <div className="p4r1-dance-start-prompt">
        <textarea
          value={startPrompt}
          disabled={props.busy || postureBlocksEditorial}
          onChange={(event) => setStartPrompt(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              sendOpenPrompt();
            }
          }}
          placeholder="Ask about this passage: examples, ideas, a deeper look, or to teach you more…"
          aria-label="What do you want to do with this passage?"
        />
        <button type="button" disabled={props.busy || postureBlocksEditorial || !startPrompt.trim()} onClick={sendOpenPrompt}>
          Ask MAIA
        </button>
      </div>

      <P4R1VoiceCapture
        disabled={props.busy || postureBlocksEditorial}
        onAsk={(text) => props.onSend(withOrigin(text), { turnShape: 'conversation' })}
      />
    </div>
  );

  if (!props.thread) {
    return (
      <section className="p4r1-dance p4r1-dance-start" data-editorial-dance>
        <div className="p4r1-dance-empty">
          <span className="p4r1-eyebrow">Work with the passage</span>
          <h3>What would help you here?</h3>
          <p>You can begin with the writing, the idea, the craft, or simply ask MAIA to help you look.</p>
          {postureGate}
          {relationshipGate}
          {heldNotice}
          {props.message ? <p className="p4r1-dance-status" role="status">{props.message}</p> : null}
          {entryActions}
          {openPrompt}
        </div>
      </section>
    );
  }

  if (!recommendation) {
    return (
      <section className="p4r1-dance p4r1-dance-explore" data-editorial-dance>
        {noticeLine}
        <div className="p4r1-dance-response">
          {conversation.length > 0 || props.pendingQuestion ? (
            <>
              {/* Step 2: the whole conversation, oldest first; MAIA's latest turn last. */}
              <span className="p4r1-eyebrow">Your conversation</span>
              <FocusConversation turns={conversation} pending={props.pendingQuestion} latestAction={props.busy || props.message ? null : replyAction} />
              {props.busy ? <p className="p4r1-dance-status" role="status">MAIA is with the passage…</p> : null}
              {props.message ? <p className="p4r1-dance-status" role="status">{props.message}</p> : null}
            </>
          ) : (
            <>
              <span className="p4r1-eyebrow">MAIA</span>
              <h3>{props.busy
                ? 'MAIA is with the passage…'
                : props.message
                  ? 'That turn could not be completed.'
                  : 'Here’s what I’m seeing.'}</h3>
              {props.message ? (
                <p className="p4r1-dance-status" role="status">{props.message}</p>
              ) : reply ? (
                <>
                  <p>{reply.text}</p>
                  {replyAction}
                </>
              ) : (
                <p>I’m staying with the passage and your question. Nothing has been revised or applied.</p>
              )}
            </>
          )}
        </div>

        <div className="p4r1-dance-continue">
          <span className="p4r1-eyebrow">Continue from here</span>
          <div className="p4r1-dance-followup-actions">
            <button type="button" disabled={props.busy} onClick={() => begin(passageActQuestion('revise-after-talk'), undefined, { proposalPolicy: 'allow', proposalRequested: true, passageAct: 'revise-after-talk' })}>
              Show revision options
            </button>
            <button type="button" disabled={props.busy} onClick={() => begin(teachingQuestion('continue'), 'learning', { proposalPolicy: 'reply_only', teachingAnchor: 'continue' })}>
              Teach me more
            </button>
          </div>
          {openPrompt}
        </div>
      </section>
    );
  }

  return (
    <section className="p4r1-dance" data-editorial-dance>
      {noticeLine}
      {props.showOriginal !== false ? (
        <div className="p4r1-dance-original">
          <div>
            <span className="p4r1-eyebrow">Your passage</span>
            <strong>{props.manuscriptTitle}</strong>
          </div>
          <button type="button" disabled={props.busy} onClick={props.onKeep}>Keep mine</button>
          <p>{props.currentText}</p>
        </div>
      ) : null}

      {conversationBeforeOption.length > 0 || props.pendingQuestion ? (
        /* Step 3: the conversation stays on screen; MAIA's option is its latest turn. */
        <div className="p4r1-dance-response" data-option-conversation>
          <span className="p4r1-eyebrow">Your conversation</span>
          <FocusConversation turns={conversationBeforeOption} pending={props.pendingQuestion} />
        </div>
      ) : null}

      <section className="p4r1-option-card" data-option-card aria-label="MAIA’s option">
        <span className="p4r1-eyebrow">MAIA’s option</span>
        <h4>{purposeOf(recommendation, versions.findIndex((v) => v.id === recommendation.id))}</h4>
        <p className="p4r1-option-in-context" data-option-in-context>
          {context?.before ? <span className="p4r1-option-around">{aroundBefore(context.before)}</span> : null}
          {changedWords.map((part, index) => part.kind === 'remove'
            ? <del key={index}>{part.text}</del>
            : part.kind === 'add'
              ? <ins key={index}>{part.text}</ins>
              : <span key={index}>{part.text}</span>)}
          {context?.after ? <span className="p4r1-option-around">{aroundAfter(context.after)}</span> : null}
        </p>
        <div className="p4r1-option-actions">
          {optionApplied ? (
            <>
              <span>Applied to the manuscript.</span>
              <button type="button" disabled={props.busy} onClick={props.onUndo}>Undo this change</button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="p4r1-dance-primary"
                data-option-use
                disabled={props.busy || using || !props.onUseVersion || postureBlocksEditorial}
                onClick={() => void useThis()}
              >
                {using ? 'Applying…' : 'Use this'}
              </button>
              <button type="button" data-option-adjust disabled={props.busy} onClick={adjustOwn}>Adjust</button>
              <button
                type="button"
                data-option-another
                disabled={props.busy || postureBlocksEditorial}
                onClick={() => adjustProposal('Show me one genuinely different option for this same passage. Do not rank it against the current one.')}
              >
                Another
              </button>
            </>
          )}
        </div>
        {(localMessage || props.message || props.undoMessage) ? (
          <p className="p4r1-dance-status" role="status">
            {localMessage ?? props.message}{props.undoMessage ? ' ' + props.undoMessage : ''}
          </p>
        ) : null}
        {replyAction}
      </section>

      <details
        className="p4r1-option-more"
        data-option-more
        open={moreOpen}
        onToggle={(event) => setMoreOpen((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary>More: why, other options, shape it yourself</summary>

      <div className="p4r1-dance-maia">
        <span className="p4r1-eyebrow">MAIA</span>
        {hasStructuredSummary ? (
          <div className="p4r1-dance-summary">
            {summary.preserve ? <div><b>{EDITORIAL_PACKET_LABELS.preserve}</b><p>{summary.preserve}</p></div> : null}
            {summary.friction ? <div><b>{EDITORIAL_PACKET_LABELS.friction}</b><p>{summary.friction}</p></div> : null}
            {summary.tryNext ? <div><b>{EDITORIAL_PACKET_LABELS.possibility}</b><p>{summary.tryNext}</p></div> : null}
          </div>
        ) : reply ? (
          <div className="p4r1-dance-latest-response" data-editorial-latest-response>
            <b>MAIA’s latest response</b>
            <p>{reply.text}</p>
          </div>
        ) : (
          <h3>{firstUsefulSentence(summarySource || 'Here is one direction I would try.')}</h3>
        )}
        {recommendation.rationale ? <p className="p4r1-dance-rationale">{recommendation.rationale}</p> : null}
      </div>

      {postureGate}

      <div className="p4r1-dance-options" aria-label="Revision directions">
        <button
          type="button"
          className={props.version?.id === recommendation.id ? 'is-selected' : ''}
          onClick={() => chooseVersion(recommendation)}
        >
          <span>MAIA’s recommendation</span>
          <b>{purposeOf(recommendation, versions.findIndex((v) => v.id === recommendation.id))}</b>
          <p>{recommendation.wording}</p>
        </button>

        {maiaVersions
          .filter((candidate) => candidate.id !== recommendation.id)
          .slice(-3)
          .reverse()
          .map((candidate) => (
            <button
              type="button"
              key={candidate.id}
              className={props.version?.id === candidate.id ? 'is-selected' : ''}
              onClick={() => chooseVersion(candidate)}
            >
              <span>{purposeOf(candidate, versions.findIndex((v) => v.id === candidate.id))}</span>
              <p>{candidate.wording}</p>
            </button>
          ))}
      </div>

      <section className="p4r1-dance-change-card" aria-label="What changed in this edit">
        <div className="p4r1-dance-change-compare">
          <div>
            <span className="p4r1-eyebrow">Original</span>
            <p>{props.currentText}</p>
          </div>
          <div>
            <span className="p4r1-eyebrow">Edited</span>
            <p>{props.version?.wording ?? recommendation.wording}</p>
          </div>
        </div>
        <div className="p4r1-dance-changed-words" aria-label="Changed words">
          <span className="p4r1-eyebrow">Changed words</span>
          <p>
            {changedWords.map((part, index) => part.kind === 'remove'
              ? <del key={index}>{part.text}</del>
              : part.kind === 'add'
                ? <ins key={index}>{part.text}</ins>
                : <span key={index}>{part.text}</span>)}
          </p>
        </div>
        <div className="p4r1-dance-change-reasoning">
          <div><b>What changed</b><p>{changeSummary.changed ?? 'MAIA can explain the exact editorial move behind this version.'}</p></div>
          <div><b>Why</b><p>{changeSummary.why ?? props.version?.rationale ?? recommendation.rationale ?? 'Open the explanation to see the reasoning behind this change.'}</p></div>
          <div><b>Reader effect</b><p>{changeSummary.readerEffect ?? 'Ask MAIA what this change may make easier, clearer, faster, or more vivid for a reader.'}</p></div>
          <div><b>What I protected</b><p>{changeSummary.protected ?? summary.preserve ?? 'Your meaning, voice, and intentional ambiguity remain the reference.'}</p></div>
        </div>
        {!hasChangeSummary ? (
          <button
            type="button"
            disabled={props.busy || postureBlocksEditorial}
            onClick={() => props.onSend([
              'Explain the currently selected revision without proposing new wording.',
              'Use exactly four short lines: "What changed: …", "Why: …", "Reader effect: …", and "What I protected: …".',
              'Tie every statement to the original and proposed wording. Treat reader effect as a hypothesis.',
            ].join('\n\n'))}
          >
            Explain this change
          </button>
        ) : null}
      </section>

      <div className="p4r1-dance-adjust" aria-label="Adjust this edit">
        <span>Adjust this edit</span>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Make this revision lighter. Restore more of my original wording and change only what is necessary.')}>Make it lighter</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Keep more of my original wording and cadence while preserving the useful editorial gain.')}>Keep more of mine</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Go a little further with the same editorial intention, but do not jump to a major rewrite.')}>Go a little further</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => adjustProposal('Show me one genuinely different option for this same passage. Do not rank it against the current one.')}>Another option</button>
        <button type="button" disabled={props.busy || postureBlocksEditorial} onClick={() => setTalk('Restore this part of my original: ')}>Restore a part</button>
      </div>

      <div className="p4r1-dance-directions">
        <span>Want another direction?</span>
        {EDITORIAL_APPROACHES.map((approach) => (
          <button
            key={approach.id}
            type="button"
            disabled={props.busy}
            onClick={() => requestDirection(approach.id)}
            title={approach.tradeoff}
          >
            {approach.label}
          </button>
        ))}
      </div>

      <div className="p4r1-dance-working">
        <div>
          <span className="p4r1-eyebrow">Your working version</span>
          <h4>{selectedLabel}</h4>
        </div>
        <textarea
          ref={workingRef}
          value={workingText}
          disabled={props.busy || saving}
          onChange={(event) => {
            setWorkingText(event.target.value);
            setReviewedText(null);
            setShowContext(false);
            setLocalMessage(null);
          }}
          aria-label="Edit your working version"
        />
        <p className="p4r1-dance-ownership">
          MAIA offered a direction. You shape the language. The version you apply is yours.
        </p>

        <div className="p4r1-dance-talk">
          <input
            value={talk}
            disabled={props.busy}
            onChange={(event) => setTalk(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendTalk();
              }
            }}
            placeholder="Keep the cadence… combine these… make the ending quieter…"
            aria-label="Tell MAIA how you want to shape this version"
          />
          <button type="button" disabled={props.busy || !talk.trim()} onClick={sendTalk}>Talk it through</button>
        </div>

        <label className="p4r1-dance-name">
          <span>Name this version</span>
          <input
            value={purpose}
            maxLength={80}
            disabled={props.busy || saving}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="More embodied · Quieter ending · Clearer turn"
          />
        </label>

        <div className="p4r1-dance-actions">
          <button
            type="button"
            disabled={!context || props.busy}
            onClick={() => {
              setReviewedText(workingText);
              setShowContext(true);
            }}
          >
            Read my version in context
          </button>
          <button
            type="button"
            disabled={props.busy || saving || !workingText.trim() || workingText === props.currentText}
            onClick={() => void saveMemberVersion()}
          >
            {saving ? 'Saving…' : memberVersionMatchingDraft ? 'Saved as my version' : 'Save my version'}
          </button>
          <button
            type="button"
            className="p4r1-dance-primary"
            disabled={props.busy || !applyReady}
            onClick={props.onApply}
          >
            Apply my version
          </button>
        </div>

        {showContext && context ? (
          <div className="p4r1-dance-context">
            <span className="p4r1-eyebrow">In context · not applied</span>
            <p>{context.before}<mark>{workingText}</mark>{context.after}</p>
          </div>
        ) : null}

      </div>

      <div className="p4r1-dance-depth">
        <span>Want more?</span>
        <button type="button" aria-pressed={showDepth === 'why'} onClick={() => setShowDepth(showDepth === 'why' ? 'none' : 'why')}>Why this works</button>
        <button type="button" aria-pressed={showDepth === 'teach'} onClick={() => {
          const opening = showDepth !== 'teach';
          setShowDepth(opening ? 'teach' : 'none');
          if (opening) {
            props.onDepth('learning');
            props.onSend(teachingQuestion('direction'), { teachingAnchor: 'direction' });
          }
        }}>Teach me why</button>
        <button type="button" aria-pressed={showDepth === 'advanced'} onClick={() => {
          const opening = showDepth !== 'advanced';
          setShowDepth(opening ? 'advanced' : 'none');
          if (opening) {
            props.onDepth('direct');
            props.onSend([
              'Go deeper on this editorial direction.',
              'Use full craft and editorial vocabulary. Separate meaning changes from style changes.',
              'Show the evidence in the supplied wording, the tradeoffs, uncertainty, and any reader-effect hypothesis.',
              'Do not propose replacement wording unless I ask.',
            ].join('\n\n'));
          }
        }}>Advanced view</button>
      </div>

      {showDepth === 'why' ? (
        <div className="p4r1-dance-depth-card">
          <b>Why this direction?</b>
          <p>{props.version?.rationale ?? recommendation.rationale ?? 'Ask MAIA to explain the craft move behind this direction.'}</p>
        </div>
      ) : null}
      {showDepth === 'teach' ? (
        <div className="p4r1-dance-depth-card">
          <b>Teach me why</b>
          <p>{props.busy
            ? 'MAIA is working from this passage and your current direction…'
            : reply?.text ?? 'MAIA will explain the craft principle in plain language using your own words as the example.'}</p>
        </div>
      ) : null}
      {showDepth === 'advanced' ? (
        <div className="p4r1-dance-depth-card">
          <b>Advanced craft view</b>
          <p>{props.busy
            ? 'MAIA is going deeper into the editorial reasoning…'
            : reply?.text ?? 'Full craft vocabulary, meaning/style distinctions, evidence, tradeoffs, uncertainty, and provenance stay available here without changing authority.'}</p>
        </div>
      ) : null}
      </details>
    </section>
  );
}
