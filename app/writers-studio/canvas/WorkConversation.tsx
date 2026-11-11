'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import ReadScopeControl from './ReadScopeControl';
import SettledDecisions from './SettledDecisions';
import { declaredSanctuaryPosture, readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { parseStudioActions, showLabel, SHOW_PLACES, type ShowPlace } from '@/lib/writersStudio/studioActions';
import { readingProgressText } from '@/lib/writersStudio/readingProgress';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import Link from 'next/link';
import { GROUND, INK, MAIA_ACCENT, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText, typeStyle } from '../studio/StudioType';
import { useMemberIdentity } from '../useMemberIdentity';
import { useManuscriptKeeps } from '../useManuscriptKeeps';
import { handoffToMaia } from '../workContext';
import {
  ask,
  askLivingWork,
  loadThread,
  loadLivingWorkAskThread,
  threadsOn,
  threadsOnLivingWorkAsk,
  type AskThreadView,
} from '@/lib/writersStudio/askClient';
import {
  resumeDecision, sendMode, threadChoiceLabel,
  type ResumeDecision, type ThreadDiscovery,
} from '@/lib/writersStudio/observationDialogueResume';
import type { LivingWork } from '../useLivingWorks';
import { createWriterCorrection } from '@/lib/writersStudio/writerCorrectionsClient';
import { readWorkingStyle, writeWorkingStyle } from '@/lib/writersStudio/workingStyle';
import { teachingQuestion, type TeachingAnchor } from '@/lib/writersStudio/teachingTurn';
import {
  proposePresentationRequest, writeStudioPresentation,
  type SafePresentationProposal,
} from '@/lib/writersStudio/presentationRequests';
import { setStudioReadingSize } from '@/lib/writersStudio/readingSizePreference';
import { CONVERSATION_DEPARTURE_EVENT, requestConversationDeparture } from '@/lib/writersStudio/conversationDeparture';
import { WRITER_CORRECTION_KINDS, WRITER_CORRECTION_LABEL, type WriterCorrectionKind } from '@/lib/writersStudio/writerCorrections';

/**
 * MAIA-CONVERGENCE-01 · CANVAS — MAIA's ordinary conversation about the Work,
 * held by the server.
 *
 * ⭐⭐ WHAT REPLACED WHAT, STATED PLAINLY. This is `StudioConversation`'s
 * presentation on `ASK-WORK-ANCHOR-01`'s spine. ⛔ It is not a new conversation
 * model and it introduces no architecture: every mechanism below was built,
 * witnessed and merged before this component existed.
 *
 * ── ⛔ THE FOUR THINGS THAT ARE GONE, AND WHY EACH ONE HAD TO GO ───────────
 *
 * The predecessor was not lying and was not broken. Its own suite recorded the
 * design honestly — *"conversation identity is minted, never discovered"* — and
 * that was correct for a room with no durable spine. It has one now.
 *
 *   ⛔ `mintStudioConversationId()`   a conversation whose identity is minted in
 *                                    a tab is a conversation that ends with the
 *                                    tab
 *   ⛔ `conversationHistory: [...]`   ⭐⭐ THIS WAS THE CONTINUITY MECHANISM, and
 *                                    there was no other: reload emptied the
 *                                    array, so the next question arrived with
 *                                    MAIA having been told nothing happened
 *   ⛔ `userId: identity.memberId`    the member is established from the request,
 *                                    never from the body that the request carries
 *   ⛔ `sessionId: conversationId`    a browser-minted value in the identity seat
 *
 * ⭐⭐ THE PERMANENT LAW, AND THE ONE THIS FILE EXISTS TO HOLD:
 *
 *     No ordinary Canvas conversation may be durable solely because the browser
 *     replayed it.
 *
 * So the transcript below is `thread.turns` — the server's record — and there is
 * no local array it could be assembled from. The in-flight question is rendered
 * as a PENDING question and marked as one; it is not a turn, it never becomes a
 * turn client-side, and it disappears when the server's record returns with it
 * already in place.
 *
 * ── ⭐ IDENTITY AND LOCUS ARE TWO DIFFERENT THINGS ────────────────────────
 *
 *     the Work anchor `{ on: 'work' }`  = WHO this conversation belongs to
 *     `sectionId`                        = WHERE she presently is
 *
 * Discovery runs on the Work and on nothing else, so moving between passages
 * changes what MAIA has in view and changes neither the thread nor the decision
 * that found it. ⛔ `sectionId` is deliberately absent from the discovery
 * effect's dependencies: re-discovering on scroll would make the locus an input
 * to identity by the back door.
 *
 * ── ⛔ THE ROOM DOES NOT CHOOSE, AND ARRAY POSITION IS NOT A RANKING ──────
 *
 * `resumeDecision` holds the four-state law — `fresh · resume · choose ·
 * unavailable` — including the state that refuses to round *could not find out*
 * to *there are none*, because that rounding WRITES: the next question would
 * post an anchor and open a second thread beside the one it was about to resume.
 *
 * With several threads the writer picks. ⛔ NO THREAD IS PRIVILEGED BY POSITION.
 * `threadsOnAnchor` returns `opened_at DESC`, and that ordering may be used as
 * presentation order and for nothing else — no `threads[0]`, no "current", no
 * pre-selection, no expanded-by-default. It is the tempting shortcut and it is
 * the one that would quietly make one conversation canonical while stranding the
 * rest, so the room would LOOK like it remembered, having picked.
 *
 * ⭐ Exactly one is adopted on arrival, and that is not the room choosing: with
 * one relationship there is nothing to choose between, and `loadThread` is a
 * GET. Nothing is written by arriving.
 *
 * ── PRESERVED FROM THE PREDECESSOR, DELIBERATELY ─────────────────────────
 *
 * The rank — the manuscript is the primary surface and MAIA sits beside it. The
 * situated header. The empty state that says she has the Work in view and has
 * not been given its text. Text only: there is no capture API in this file and
 * no voice component beneath it — not "voice disabled", voice ABSENT, because
 * opening a conversation is an invitation to converse and never permission to
 * listen. The three identity phases, failing closed.
 *
 * ⭐ AND KEEPS, WITH ITS RULE INTACT. A chosen Keep lands in the COMPOSER, never
 * in the exchange. Sending it automatically would make the button a disclosure;
 * putting it in the composer makes it a quotation the writer is choosing to read
 * aloud.
 *
 * ⚠️ ONE THING DID NOT SURVIVE INTACT, AND IT IS NAMED RATHER THAN QUIETLY
 * DROPPED: `Open in MAIA` no longer carries a conversation id. It used to carry
 * the browser-minted one, which full MAIA consumed as a `sessionId`. This
 * room's thread is an `ask_threads` row, and handing that id to a surface that
 * would read it as a session identity would conflate two identity spaces to
 * preserve an appearance of continuity that does not exist across them.
 * `handoffToMaia` already omits the parameter when there is nothing to continue.
 */

export const WORK_CONVERSATION_PLACEHOLDER = 'Ask MAIA about this work…';

/** Offer-only: phrasings that suggest the writer may mean the whole book. It NEVER sets the scope (D1); it only shows the offer. */
export const WHOLE_BOOK_OFFER = /\b(whole|entire|this)\s+(book|manuscript)\b|\bthroughout\b|\boverall\b|\bfundamentally\b|\bfrom (the )?(start|beginning) to (the )?end\b/i;

const WORK_ANCHOR = { on: 'work' } as const;

const REORIENTATION_PROMPT = [
  'Help me reorient before we do anything else.',
  'From only this conversation and the Work context you actually have, tell me briefly:',
  'where we are, what question or concern brought us here if that is established, what has changed, what remains untouched, and how I can return to the larger Work.',
  'If any of that is unknown, say so. Do not introduce a new interpretation yet.',
].join('\n');

/* Review (2026-11-09): a failed Teach me never touched the box, so it must not say the question is still there. */
const TEACH_NOT_ANSWERED = 'MAIA couldn’t answer the Teach me this time. Nothing you wrote was changed; press it again when you’re ready.';
const REFUSAL_SAYS: Record<string, string> = {
  unreachable: 'That didn’t reach her. Nothing was lost — try again.',
  empty_answer: 'MAIA returned nothing. Try asking again.',
  /* WS-ASK-ANSWER-TRUNCATION: she ran out of room before finishing, so the cut answer was not kept or shown. */
  answer_incomplete: 'MAIA ran out of room before she finished, so that answer wasn’t kept. Nothing you wrote was lost — ask again, or ask about a narrower part of the book.',
  question_too_long: 'That is longer than a question this room can carry.',
  unauthenticated: 'You are signed out. Sign in and your question will go through.',
  not_found: 'This Work could not be opened for conversation.',
  /* Any other failure after the question arrived (e.g. the AI service refused or failed). Said plainly; never shown as one of her answers. */
  not_answered: 'MAIA couldn’t answer this time. Nothing you wrote was lost — your question is still in the box; send it again when you’re ready.',
};

const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'earlier' : d.toLocaleDateString();
};

export interface WorkConversationProps {
  work: LivingWork;
  /** Null before a manuscript exists; the conversation then belongs directly to the Living Work. */
  manuscriptId: string | null;
  /**
   * ⭐ The passage the writer is presently in, or null. CONTEXT, NOT IDENTITY —
   * it is handed to the server on each turn and it is not part of the anchor.
   */
  sectionId: string | null;
  /** Optional member-facing starter held in the composer. Never auto-sent. */
  initialDraft?: string;
  /** Design 1B: open a Develop place MAIA offered (navigation only). Absent → no such button. */
  onStudioPlace?: (place: 'develop-overview' | 'editorial-pass') => void;
  /** The Develop stage keeps MAIA's holdings (reading permission, what you have settled) in its own column, so the conversation stays a conversation. */
  hideHoldings?: boolean;
  /** Develop stage: the secondary controls (Where are we?, new conversation, Focus, close, Keeps, Open in MAIA) sit behind one quiet “More”. */
  quiet?: boolean;
  /** Which saved sections MAIA was handed for the answer just received (ids + headings only). */
  onRead?: (read: readonly { sectionId: string; label: string | null }[]) => void;
  /** G4: MAIA offered "Read this chapter" and the writer clicked it. Absent → no such button. Only the click starts a reading. */
  onReadChapter?: (lens: DevelopmentalLens) => Promise<{ ok: true; label: string } | { ok: false; message: string }>;
  /** Design 1B amendment 2: the acting controls MAIA may offer (grant reading, make a plan, note a decision, open the desk). Absent →
   *  no such buttons. ONLY the writer's click performs one; the host refuses in Sanctuary and says so. */
  onStudioAct?: (act: StudioAct) => Promise<{ ok: true; text: string } | { ok: false; message: string }>;
  /** The heading of a chapter id MAIA named, if it is in this Work; null → no "go to chapter" button. */
  chapterLabel?: (sectionId: string) => string | null;
  onClose: () => void;
}

export type StudioAct =
  | { id: 'grant-reading'; level: 'chapter' | 'work' }
  | { id: 'make-plan'; ask: string }
  | { id: 'note-settled'; words: string }
  | { id: 'open-desk'; words: string | null }
  | { id: 'show'; place: ShowPlace }
  | { id: 'go-chapter'; sectionId: string };

/* Offers the host performs (absent host → no button). The conversation's own controls (keeps, focus, close, open in MAIA) it does itself. */
const ACTING = new Set(['grant-reading', 'make-plan', 'note-settled', 'open-desk', 'show', 'go-chapter']);
const NAVIGATES = new Set(['show', 'go-chapter']);   // navigation within Develop: nothing is written, so no posture gate
/** The writer's own words in their latest question, minus the "About “…”:" frame the stage places for a selection. */
export function latestAuthorWords(turns: readonly { speaker: string; body: string }[]): { question: string; passage: string | null } {
  const last = [...turns].reverse().find((t) => t.speaker === 'author')?.body ?? '';
  const m = /^About “([\s\S]+?)”:\s*/.exec(last);
  return { question: last.trim(), passage: m ? m[1] : null };
}

export default function WorkConversation(props: WorkConversationProps) {
  const identity = useMemberIdentity();
  // A retained room must not carry one member's or Work's unsent text and
  // loaded conversation into another. Section changes keep this same scope.
  return <ScopedWorkConversation
    key={JSON.stringify([identity.memberId ?? identity.phase, props.work.id, props.manuscriptId])}
    {...props}
    identity={identity}
  />;
}

function ScopedWorkConversation({
  work, manuscriptId, sectionId, initialDraft = '', onClose, onStudioPlace, hideHoldings = false, quiet = false, onRead, onReadChapter, onStudioAct, chapterLabel, identity,
}: WorkConversationProps & { identity: ReturnType<typeof useMemberIdentity> }) {
  const { keeps } = useManuscriptKeeps(manuscriptId);
  const [showKeeps, setShowKeeps] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const showSecondary = !quiet || moreOpen;
  const [focusMode, setFocusMode] = useState(false);

  const [decision, setDecision] = useState<ResumeDecision | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [thread, setThread] = useState<AskThreadView | null>(null);
  /* Sanctuary exchanges: shown for this moment only, held in this component's memory, never stored anywhere. */
  /* `after` = how many kept turns the conversation had when this exchange happened, so it is shown in its place in time. */
  const [sanctuaryTurns, setSanctuaryTurns] = useState<{ question: string; answer: string; after: number }[]>([]);
  /* ⭐ G4 isolation: every switch of conversation (adopt, start fresh) starts a new generation. An async result from an earlier
     generation — a late thread load, a late reading — is dropped, never applied to the conversation now on screen. */
  const conversationGenRef = useRef(0);
  const nextConversation = () => { conversationGenRef.current += 1; return conversationGenRef.current; };
  /* G4: a chapter reading the writer started from MAIA's offer. Shown here; MAIA is not asked anything until the writer asks. */
  const [chapterReading, setChapterReading] = useState<{ phase: 'running'; startedAt: number; now: number } | { phase: 'done' | 'refused'; text: string } | null>(null);
  useEffect(() => {
    if (chapterReading?.phase !== 'running') return;
    const t = window.setInterval(() => setChapterReading((r) => r?.phase === 'running' ? { ...r, now: Date.now() } : r), 1000);
    return () => window.clearInterval(t);
  }, [chapterReading?.phase]);
  const startChapterReading = useCallback(async (lens: DevelopmentalLens) => {
    if (!onReadChapter) return;
    // Readings are kept (they are how MAIA remembers having read), so Sanctuary — which keeps nothing — never starts one.
    const posture = readCurrentSanctuaryPosture();
    if (posture.resolved && posture.sanctuary) {
      setChapterReading({ phase: 'refused', text: 'Sanctuary is on, and a reading is kept, so MAIA will not read the chapter now. Turn Sanctuary off if you want her to. Nothing was read.' });
      return;
    }
    const startedAt = Date.now();
    const gen = conversationGenRef.current;
    setChapterReading({ phase: 'running', startedAt, now: startedAt });
    const result = await onReadChapter(lens);
    if (gen !== conversationGenRef.current) return;   // the writer moved to another conversation; the reading is kept regardless
    setChapterReading(result.ok
      ? { phase: 'done', text: `MAIA has read ${result.label}. Ask her what she noticed. Nothing in your writing changed.` }
      : { phase: 'refused', text: result.message });
  }, [onReadChapter]);

  /* Amendment 2 · what happened when the writer clicked one of MAIA's acting offers. */
  const [actStatus, setActStatus] = useState<{ busy: boolean; text: string } | null>(null);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const performAct = useCallback(async (act: StudioAct) => {
    if (!onStudioAct) return;
    // Sanctuary keeps nothing and suspends permissions: none of these is performed there (the host refuses too). Navigation writes nothing.
    const posture = readCurrentSanctuaryPosture();
    if (!NAVIGATES.has(act.id) && (!posture.resolved || posture.sanctuary)) {
      setActStatus({ busy: false, text: posture.resolved ? 'Sanctuary is on, so that is not done here. Nothing was changed.' : 'Your Sanctuary setting could not be read on this device, so nothing was done.' });
      return;
    }
    setActStatus({ busy: true, text: act.id === 'make-plan' ? 'MAIA is making a plan…' : 'One moment…' });
    const r = await onStudioAct(act);
    setActStatus({ busy: false, text: r.ok ? r.text : r.message });
  }, [onStudioAct]);

  const [draft, setDraft] = useState(initialDraft);
  /* WS-WHOLE-BOOK-CONVERSATION (founder approval 2026-11-10, D1): the writer DECLARES what a question is about. "where I am" is the
     default; "the whole book" carries her complete account. ⛔ A phrase in the draft may only OFFER the whole book, never switch to it. */
  /* Held in component state only: this surface reads and writes no browser storage (identity-is-server-truth law). It lasts while the
     conversation is open and resets to "where I am" when it is reopened. */
  const [carryScope, setCarryScope] = useState<'here' | 'whole_book'>('here');
  const offerWholeBook = carryScope === 'here' && WHOLE_BOOK_OFFER.test(draft);
  // The Studio's starter, as placed; never sent on its own.
  const [starter] = useState(initialDraft);
  const [reorientationOffered, setReorientationOffered] = useState(false);
  const [presentationConfirmation, setPresentationConfirmation] = useState<SafePresentationProposal | null>(null);
  const [presentationNotice, setPresentationNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [correctingTurn, setCorrectingTurn] = useState<number | null>(null);
  const [correctionKind, setCorrectionKind] = useState<WriterCorrectionKind>('interpretation_rejection');
  const [correctionDraft, setCorrectionDraft] = useState('');
  const [correctionBusy, setCorrectionBusy] = useState(false);
  const [correctionStatus, setCorrectionStatus] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  // A draft belongs to its edit generation, not to text equality.
  const draftRevisionRef = useRef(0);
  // Synchronous fence for two sends before React rerenders.
  const inFlightRef = useRef(false);

  useEffect(() => {
    // Unsent text stays in the mounted conversation. Leaving is an explicit
    // discard; neither browser storage nor a server turn is created for it.
    // A starter the Studio placed in the box is not the writer's text until they
    // change it; counting it trapped every other button behind a discard prompt.
    const writerDraft = draft.length > 0 && draft !== starter;
    const hasUnsentText = writerDraft || correctionDraft.length > 0 || pending !== null;
    if (!hasUnsentText) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const confirmDeparture = (event: Event) => {
      if (event.defaultPrevented) return;
      if (!window.confirm('You have unsent text in this MAIA conversation. Leave and discard that text?')) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    window.addEventListener(CONVERSATION_DEPARTURE_EVENT, confirmDeparture);
    return () => {
      window.removeEventListener('beforeunload', warnBeforeLeaving);
      window.removeEventListener(CONVERSATION_DEPARTURE_EVENT, confirmDeparture);
    };
  }, [draft, starter, correctionDraft, pending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread, pending]);

  const adopt = useCallback(async (id: string) => {
    // A not-kept Sanctuary exchange belongs to the moment it happened in, never to another conversation — cleared BEFORE loading.
    const gen = nextConversation();
    setSanctuaryTurns([]);
    setChapterReading(null);
    const t = manuscriptId
      ? await loadThread(manuscriptId, id)
      : await loadLivingWorkAskThread(work.id, id);
    if (gen !== conversationGenRef.current) return;   // a later choice superseded this one
    setThreadId(id);
    if (t) setThread(t);
  }, [manuscriptId, work.id]);

  /* ⭐ Design 2A (founder ruling 2026-11-02): the writer may set this
     conversation aside and begin again, as in Passage Focus. Nothing is deleted:
     the earlier thread stays on the server and is offered with the others next
     time. `fresh` here is the writer's explicit act after a SUCCESSFUL lookup,
     never a rounded failure, so the next question may lawfully open a thread.
     The composer draft is the writer's and stays; an unsent correction belongs
     to a turn of the old thread, so the control waits until it is sent or cleared.
     It is not shown while a thread is still being adopted (threadId null). */
  const canStartFresh = pending === null && !correctionBusy && correctionDraft.length === 0
    && (threadId !== null || decision?.kind === 'choose');
  const startFresh = () => {
    if (!canStartFresh || inFlightRef.current) return;
    nextConversation();
    setThreadId(null);
    setThread(null);
    setDecision({ kind: 'fresh' });
    setSanctuaryTurns([]);
    setChapterReading(null);
    setRefusal(null);
    setCorrectingTurn(null);
    setCorrectionStatus(null);
  };

  /* ⛔ `sectionId` IS NOT A DEPENDENCY. Discovery is about the Work. */
  useEffect(() => {
    let cancelled = false;
    setDecision(null);
    void (async () => {
      const discovery: ThreadDiscovery = manuscriptId
        ? await threadsOn(manuscriptId, WORK_ANCHOR)
        : await threadsOnLivingWorkAsk(work.id);
      if (cancelled) return;
      const d = resumeDecision(discovery);
      setDecision(d);
      /* ⭐ One relationship is not a choice. Adopting it writes nothing. */
      if (d.kind === 'resume') await adopt(d.threadId);
    })();
    return () => { cancelled = true; };
  }, [manuscriptId, work.id, adopt]);

  const mode = sendMode(decision, threadId);
  // Only a deliberately phrased request is recognized. There is NO model
  // profiling, no MAIA server turn, and no inferred author preference.
  const localPresentationRequest = proposePresentationRequest(draft);
  const displayRequestMaySubmit = Boolean(draft.trim() && (mode.kind !== 'blocked' || localPresentationRequest));
  const approvePresentation = () => {
    if (!presentationConfirmation) return;
    const fresh = proposePresentationRequest(draft, readWorkingStyle());
    if (!fresh || fresh.label !== presentationConfirmation.label) {
      setPresentationConfirmation(null);
      setPresentationNotice('The request changed. Please review it again.');
      return;
    }
    writeWorkingStyle(fresh.style);
    if (fresh.depth) writeStudioPresentation({depth:fresh.depth});
    if (fresh.readingSize) setStudioReadingSize(fresh.readingSize);
    draftRevisionRef.current += 1;
    setDraft('');
    setPresentationConfirmation(null);
    setPresentationNotice('The Studio presentation changed on this device. No manuscript was read or changed, and nothing was sent to MAIA.');
  };

  const addReorientation = () => {
    draftRevisionRef.current += 1;
    setDraft((current) => current.includes(REORIENTATION_PROMPT)
      ? current
      : current ? current + '\n\n' + REORIENTATION_PROMPT : REORIENTATION_PROMPT);
    setReorientationOffered(false);
    setPresentationConfirmation(null);
    setPresentationNotice(null);
  };
  const reorient = () => {
    if (draft.includes(REORIENTATION_PROMPT)) return;
    if (draft.length > 0) {
      setReorientationOffered(true);
      return;
    }
    addReorientation();
  };

  const keepCorrection = async (maiaTurnIndex: number) => {
    if (!threadId || correctionBusy || !correctionDraft.trim()) return;
    setCorrectionBusy(true);
    setCorrectionStatus(null);
    const result = await createWriterCorrection({
      workId: work.id,
      threadId,
      maiaTurnIndex,
      kind: correctionKind,
      correction: correctionDraft.trim(),
    });
    setCorrectionBusy(false);
    if (!result.ok) {
      setCorrectionStatus('That correction was not kept. Nothing else changed.');
      return;
    }
    setCorrectionDraft('');
    setCorrectingTurn(null);
    setCorrectionStatus('Correction kept. MAIA will receive this as the current working understanding for this Work.');
  };

  /* G-3: `teach` is a pressed Teach me (the writer's click on MAIA's offer). Its words are the button's own; the writer's draft is
     neither sent nor cleared. */
  const send = async (teach?: TeachingAnchor) => {
    const question = teach ? teachingQuestion(teach) : draft.trim();
    // Synchronous guard: two send events can fire before pending state renders.
    if (!question || pending !== null || inFlightRef.current) return;
    const requestedPresentation = teach ? null : proposePresentationRequest(question, readWorkingStyle());
    if (requestedPresentation) {
      setPresentationConfirmation(requestedPresentation);
      setPresentationNotice(null);
      return;
    }
    if (mode.kind === 'blocked') return;

    const submittedRevision = draftRevisionRef.current;
    const gen = conversationGenRef.current;
    inFlightRef.current = true;
    setReorientationOffered(false);
    setRefusal(null);
    setPending(question);
    try {
      const r = manuscriptId
        ? await ask({
            manuscriptId,
            question,
            ...(mode.kind === 'resume' ? { threadId: mode.threadId } : { anchor: WORK_ANCHOR }),
            ...(sectionId ? { sectionId } : {}),
            /* G-3: the writer's own working-style preference, as the observation dialogue sends it; and a pressed Teach me. */
            responseStyle: readWorkingStyle().explanation,
            ...(teach ? { teachingAnchor: teach } : {}),
            /* WS-WHOLE-BOOK-CONVERSATION: the writer's declared scope, exactly as the "About" control shows it. */
            ...(carryScope === 'whole_book' ? { carryScope } : {}),
            /* The member's CURRENT posture, read at this gesture. Unresolved ⇒ omitted, and the server then withholds the standing read. */
            ...declaredSanctuaryPosture(),
          })
        : await askLivingWork({
            workId: work.id,
            question,
            ...(mode.kind === 'resume' ? { threadId: mode.threadId } : {}),
          });
      if (gen !== conversationGenRef.current) {
        // The conversation on screen is no longer the one this answer belongs to; its text stays where it was.
        return;
      }
      if (r.ok) {
        // Text can be edited away and retyped identically. Compare edit
        // ownership, not string equality; read the live ref in the updater.
        if (!teach) setDraft((current) => draftRevisionRef.current === submittedRevision ? '' : current);
        if (r.sanctuary) {
          // Not kept: nothing was stored, so there is no thread to reload. Show the exchange here only.
          setSanctuaryTurns((list) => [...list, { question: r.sanctuary!.question, answer: r.sanctuary!.answer, after: thread?.turns.length ?? 0 }]);
          if (r.threadId) { setThreadId(r.threadId); }
          if (r.thread) setThread(r.thread);
          if (onRead && manuscriptId) onRead([]);
          return;
        }
        setThreadId(r.threadId);
        setThread(r.thread);
        if (onRead && manuscriptId) onRead(r.read ?? []);
        return;
      }
      // Refusals must retain literal text and any server-returned thread id.
      if (r.threadId) { setThreadId(r.threadId); void adopt(r.threadId); }
      setRefusal(teach ? TEACH_NOT_ANSWERED : REFUSAL_SAYS[r.refusal] ?? REFUSAL_SAYS.not_answered);
    } catch {
      // A transport error is an ambiguous delivery, never an automatic retry.
      setRefusal(teach ? TEACH_NOT_ANSWERED : REFUSAL_SAYS.unreachable);
    } finally {
      inFlightRef.current = false;
      setPending(null);
    }
  };

  if (identity.phase === 'loading') {
    return <StudioText role="metadata">opening…</StudioText>;
  }
  if (identity.phase === 'unauthorized') {
    return (
      <StudioText role="metadata">
        This conversation is yours, so it opens only to you.{' '}
        <a href="/signin" style={{ textDecoration: 'underline' }}>Sign in</a>.
      </StudioText>
    );
  }
  if (identity.phase === 'error' || !identity.memberId) {
    return (
      <StudioText role="metadata">
        MAIA could not confirm who you are just now, so this conversation has not
        opened. Your work is not affected.
      </StudioText>
    );
  }

  const turns = thread?.turns ?? [];
  /* Not-kept Sanctuary exchanges, each shown in its place in time among the kept turns (G4 isolation). */
  const sanctuaryAt = (pick: (after: number) => boolean) => {
    const items = sanctuaryTurns.filter((entry) => pick(entry.after));
    if (items.length === 0) return null;
    return (
      <div data-sanctuary-turns="true" style={{ borderTop: '1px solid color-mix(in srgb, currentColor 16%, transparent)', paddingTop: SPACE.base, marginBottom: SPACE.base }}>
        <StudioText role="metadata" tone="quiet" style={{ marginBottom: SPACE.base }}>Sanctuary · this exchange is not kept. When you leave, it is gone.</StudioText>
        {items.map((entry, n) => (
          <div key={`s${entry.after}-${n}`} style={{ marginBottom: SPACE.base }} data-sanctuary-turn={entry.after}>
            <StudioText role="metadata" tone="quiet">You</StudioText>
            <StudioText role="maiaReading" style={{ color: INK.secondary, fontSize: '1rem', lineHeight: 1.7, maxWidth: '64ch', whiteSpace: 'pre-wrap' }}>{entry.question}</StudioText>
            <StudioText role="metadata" tone="quiet" style={{ marginTop: SPACE.hairline }}>MAIA</StudioText>
            <StudioText role="maiaReading" style={{ color: MAIA_ACCENT.reading, fontSize: '1rem', lineHeight: 1.7, maxWidth: '64ch', whiteSpace: 'pre-wrap' }}>{parseStudioActions(entry.answer, 'work-conversation').text}</StudioText>
          </div>
        ))}
      </div>
    );
  };
  const latestMaiaIndex = [...turns].reverse().find((x) => x.speaker === 'maia')?.index ?? null;

  return (
    <div
      data-maia-work-conversation="true"
      data-maia-focus={focusMode ? 'true' : 'false'}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      {!hideHoldings && manuscriptId ? <ReadScopeControl manuscriptId={manuscriptId} /> : null}
      {!hideHoldings ? <SettledDecisions workId={work.id} /> : null}
      {/* ── The Work this exchange is in, where the member can see it. ── */}
      {showSecondary && <div
        data-studio-conversation="situated"
        data-work-thread={threadId ?? undefined}
        style={{
          display: 'flex', alignItems: 'baseline', gap: SPACE.snug,
          paddingBottom: SPACE.snug, marginBottom: SPACE.base,
          borderBottom: `1px solid ${RULE.soft}`, flexWrap: 'wrap',
        }}
      >
        <StudioText role="metadata" as="span" tone="quiet">In relation to</StudioText>
        <StudioText role="navItem" as="span" tone="secondary">
          {work.title ?? 'your work'}
        </StudioText>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={reorient}
          data-reorient-work="true"
          style={{
            background: 'transparent', border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.sm, padding: `${SPACE.hairline}px ${SPACE.tight}px`,
            cursor: 'pointer', color: INK.secondary,
          }}
        >
          <StudioText role="metadata" as="span">Where are we?</StudioText>
        </button>
        {(threadId !== null || decision?.kind === 'choose') && (
          <button
            type="button"
            onClick={startFresh}
            disabled={!canStartFresh}
            data-start-fresh-work-conversation="true"
            title="Sets this conversation aside. It stays saved."
            style={{
              background: 'transparent', border: `1px solid ${RULE.soft}`,
              borderRadius: RADIUS.sm, padding: `${SPACE.hairline}px ${SPACE.tight}px`,
              cursor: canStartFresh ? 'pointer' : 'default', color: INK.secondary,
              opacity: canStartFresh ? 1 : 0.5,
            }}
          >
            <StudioText role="metadata" as="span">Start a new conversation</StudioText>
          </button>
        )}
        <button
          type="button"
          onClick={() => setFocusMode((v) => !v)}
          data-maia-focus-toggle="true"
          aria-pressed={focusMode}
          style={{
            background: focusMode ? GROUND.active : 'transparent',
            border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
            padding: `${SPACE.hairline}px ${SPACE.tight}px`, cursor: 'pointer',
            color: INK.secondary,
          }}
        >
          <StudioText role="metadata" as="span">{focusMode ? 'Close focus' : 'Focus'}</StudioText>
        </button>
        <button
          type="button"
          onClick={() => { if (requestConversationDeparture()) onClose(); }}
          aria-label="Close the conversation and return to writing"
          data-close-conversation="true"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, lineHeight: 1, color: INK.quiet,
          }}
        >
          <StudioText role="metadata" as="span">✕</StudioText>
        </button>
      </div>}

      {/* ── The exchange, as the server holds it ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: SPACE.tight }}>
        {decision === null && (
          <StudioText role="metadata" style={{ opacity: 0.7 }} data-discovery="pending">
            Looking for your conversation about this Work…
          </StudioText>
        )}

        {/* ⛔⛔ AND HERE THE ROOM DOES NOT OFFER TO SPEAK. Rounding a failed
            lookup to "there are none" is the rounding that WRITES. */}
        {decision?.kind === 'unavailable' && (
          <StudioText role="maiaReading" style={{ color: INK.muted }} data-discovery="unavailable">
            Your earlier conversation about this Work couldn’t be looked up just
            now, so the Studio won’t start a new one and risk leaving it behind.
            Try again in a moment.
          </StudioText>
        )}

        {/* ⛔ NOTHING IS PRE-SELECTED, EXPANDED OR CALLED CURRENT. Presentation
            order only; selection is the writer's gesture. */}
        {decision?.kind === 'choose' && (
          <div data-discovery="choose" style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
            <StudioText role="maiaReading" style={{ color: INK.muted }}>
              {`You have ${decision.threads.length} conversations about this Work. Choose one to continue, or start a new one. Send waits until you do.`}
            </StudioText>
            {decision.threads.map((t) => (
              <button
                key={t.id}
                type="button"
                data-resume={t.id}
                onClick={() => { setDecision({ kind: 'resume', threadId: t.id }); void adopt(t.id); }}
                style={{
                  ...typeStyle('panelLabel'), textAlign: 'left', background: 'none',
                  border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                  padding: `${SPACE.tight}px ${SPACE.snug}px`,
                  color: INK.primary, cursor: 'pointer',
                }}
              >
                {threadChoiceLabel(t, when)}
              </button>
            ))}
          </div>
        )}

        {decision?.kind === 'fresh' && turns.length === 0 && pending === null && (
          <StudioText role="metadata" style={{ opacity: 0.7, maxWidth: '34ch' }} data-discovery="fresh">
            {/* L8 — the same facts the prompt gives her (askReader workSays). */}
            {sectionId
              ? 'She can read the section you are in, and only that one. She sees the other sections by heading.'
              : 'She has your Work in view by its headings. She has not been given its text —'}
            {sectionId ? null : keeps.length > 0
              ? ' bring a Keep if you want her to read a passage.'
              : ' a Keep is how you would hand her one.'}
          </StudioText>
        )}

        {turns.length > 0 ? sanctuaryAt((after) => after === 0) : null}
        {turns.map((t, position) => (
          <Fragment key={t.index}>
          <div style={{ marginBottom: SPACE.base }} data-turn={t.index}>
            <StudioText role="metadata" tone="quiet" style={{ marginBottom: SPACE.hairline }}>
              {t.speaker === 'maia' ? 'MAIA' : 'You'}
            </StudioText>
            <StudioText
              role="maiaReading"
              style={{
                color: t.speaker === 'maia' ? MAIA_ACCENT.reading : INK.secondary,
                // Readable at conversation distance: body-size text, open leading, a comfortable line length, and the
                // author's own line breaks kept, so a reply that has paragraphs is not squashed into one block.
                fontSize: '1rem', lineHeight: 1.7, maxWidth: '64ch', whiteSpace: 'pre-wrap',
              }}
            >
              {t.speaker === 'maia' ? parseStudioActions(t.body, 'work-conversation').text : t.body}
            </StudioText>
            {(() => {
              /* Design 1B: only MAIA's latest reply may offer a control, and only
                 one this room can honour. Clicking only takes the writer there. */
              if (t.speaker !== 'maia' || t.index !== latestMaiaIndex) return null;
              const parsed = parseStudioActions(t.body, 'work-conversation');
              /* Where the room cannot start a reading itself (no onReadChapter), MAIA's "Read this chapter" offer degrades to the
                 Design 1B navigation that takes the writer to where they can start one — never to a button that silently does nothing. */
              const offered = parsed.action?.id === 'read-chapter' && !onReadChapter
                ? parseStudioActions('[[studio:develop-overview]]', 'work-conversation').action
                : parsed.action;
              if (!offered) return null;
              const place = offered.id === 'develop-overview' || offered.id === 'editorial-pass' ? offered.id : null;
              if (place && !onStudioPlace) return null;
              if (ACTING.has(offered.id) && !onStudioAct) return null;   // a room that cannot honour it shows no button
              const chapterName = offered.id === 'go-chapter' && parsed.target ? chapterLabel?.(parsed.target) ?? null : null;
              if (offered.id === 'go-chapter' && !chapterName) return null;   // ⛔ an id not in this Work is no button
              if ((offered.id === 'show-keeps' || offered.id === 'open-in-maia' || offered.id === 'teach-me') && !manuscriptId) return null;
              if (offered.id === 'teach-me' && !sectionId) return null;   // review: a passage teaching turn needs a passage in view
              const mine = latestAuthorWords(thread?.turns ?? []);
              const run = () => {
                if (offered.id === 'grant-reading') { void performAct({ id: 'grant-reading', level: parsed.level ?? 'chapter' }); return; }
                if (offered.id === 'make-plan') { if (mine.question) void performAct({ id: 'make-plan', ask: mine.question }); return; }
                if (offered.id === 'note-settled') { setNoteDraft(mine.question); setActStatus(null); return; }
                if (offered.id === 'open-desk') { if (requestConversationDeparture()) void performAct({ id: 'open-desk', words: mine.passage }); return; }
                if (offered.id === 'show' && parsed.target) { void performAct({ id: 'show', place: parsed.target as ShowPlace }); return; }
                if (offered.id === 'go-chapter' && parsed.target) { void performAct({ id: 'go-chapter', sectionId: parsed.target }); return; }
                if (offered.id === 'show-keeps') { setMoreOpen(true); setShowKeeps(true); return; }
                if (offered.id === 'focus') { setFocusMode(true); return; }
                if (offered.id === 'close-conversation') { if (requestConversationDeparture()) onClose(); return; }
                if (offered.id === 'open-in-maia') { if (manuscriptId && requestConversationDeparture()) window.location.assign(handoffToMaia('/maia', { workId: work.id, manuscriptId })); return; }
                if (offered.id === 'new-conversation') { startFresh(); return; }
                if (offered.id === 'teach-me') { void send('passage'); return; }
                if (offered.id === 'read-chapter') { void startChapterReading(parsed.lens ?? 'overview'); return; }
                if (place && requestConversationDeparture()) onStudioPlace?.(place);
              };
              const enabled = offered.id === 'new-conversation' ? canStartFresh
                : offered.id === 'read-chapter' ? pending === null && chapterReading?.phase !== 'running'
                : ACTING.has(offered.id) ? pending === null && !actStatus?.busy
                : pending === null;
              return (
                <button
                  type="button"
                  onClick={run}
                  disabled={!enabled}
                  data-studio-action={offered.id}
                  style={{
                    marginTop: SPACE.tight, background: 'transparent', border: `1px solid ${RULE.soft}`,
                    borderRadius: RADIUS.sm, padding: `${SPACE.hairline}px ${SPACE.tight}px`,
                    cursor: enabled ? 'pointer' : 'default', color: INK.secondary, opacity: enabled ? 1 : 0.5,
                  }}
                >
                  <StudioText role="metadata" as="span">{offered.id === 'grant-reading' && parsed.level === 'work' ? 'Let MAIA read my whole saved work' : offered.id === 'grant-reading' ? 'Let MAIA read this saved chapter' : offered.id === 'show' && (SHOW_PLACES as readonly string[]).includes(parsed.target ?? '') ? showLabel(parsed.target as ShowPlace) : offered.id === 'go-chapter' ? `Go to ${chapterName}` : offered.label}</StudioText>
                </button>
              );
            })()}
            {t.speaker === 'maia' && threadId ? (
              <div style={{ marginTop: SPACE.tight }} data-maia-correction={t.index}>
                {correctingTurn !== t.index ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCorrectingTurn(t.index);
                      setCorrectionDraft('');
                      setCorrectionStatus(null);
                    }}
                    style={{
                      background: 'transparent', border: 0, padding: 0,
                      cursor: 'pointer', color: INK.quiet,
                    }}
                  >
                    <StudioText role="metadata" as="span">Correct MAIA</StudioText>
                  </button>
                ) : (
                  <div
                    style={{
                      border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                      padding: SPACE.snug, background: GROUND.base,
                    }}
                  >
                    <StudioText role="metadata" tone="secondary" style={{ marginBottom: SPACE.tight }}>
                      What should MAIA carry forward instead?
                    </StudioText>
                    <select
                      aria-label="Kind of correction"
                      value={correctionKind}
                      onChange={(e) => setCorrectionKind(e.target.value as WriterCorrectionKind)}
                      style={{
                        width: '100%', marginBottom: SPACE.tight, background: GROUND.raised,
                        color: INK.secondary, border: `1px solid ${RULE.soft}`,
                        borderRadius: RADIUS.sm, padding: SPACE.tight,
                      }}
                    >
                      {WRITER_CORRECTION_KINDS.map((kind) => (
                        <option key={kind} value={kind}>{WRITER_CORRECTION_LABEL[kind]}</option>
                      ))}
                    </select>
                    <textarea
                      aria-label="Your correction"
                      rows={6}
                      value={correctionDraft}
                      onChange={(e) => setCorrectionDraft(e.target.value)}
                      placeholder="Say what MAIA should understand differently…"
                      style={{
                        ...typeStyle('maiaReading'), width: '100%', resize: 'vertical',
                        background: GROUND.raised, color: INK.primary,
                        border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                        padding: SPACE.tight, outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: SPACE.tight, marginTop: SPACE.tight }}>
                      <button
                        type="button"
                        onClick={() => void keepCorrection(t.index)}
                        disabled={correctionBusy || !correctionDraft.trim()}
                        style={{
                          background: MAIA_ACCENT.voice, border: `1px solid ${MAIA_ACCENT.voice}`,
                          borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.snug}px`,
                          cursor: 'pointer', color: INK.primary,
                          opacity: correctionBusy || !correctionDraft.trim() ? 0.45 : 1,
                        }}
                      >
                        <StudioText role="metadata" as="span">{correctionBusy ? 'Keeping…' : 'Keep correction'}</StudioText>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCorrectingTurn(null); setCorrectionDraft(''); }}
                        style={{ background: 'transparent', border: 0, cursor: 'pointer', color: INK.muted }}
                      >
                        <StudioText role="metadata" as="span">Cancel</StudioText>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {position + 1 < turns.length ? sanctuaryAt((after) => after === position + 1) : null}
          </Fragment>
        ))}
        {sanctuaryAt((after) => after >= turns.length)}

        {chapterReading ? (
          <div data-chapter-reading={chapterReading.phase} role="status" aria-live="polite" style={{ marginTop: SPACE.tight }}>
            <StudioText role="metadata" tone="secondary">
              {chapterReading.phase === 'running'
                ? readingProgressText('MAIA is reading the chapter', chapterReading.now - chapterReading.startedAt)
                : chapterReading.text}
            </StudioText>
          </div>
        ) : null}

        {noteDraft !== null ? (
          /* A settled decision is the writer's own words: prefilled from what they said, editable, recorded only on "Note it". */
          <div data-note-settled="true" style={{ marginTop: SPACE.tight, display: 'flex', flexDirection: 'column', gap: SPACE.tight }}>
            <label htmlFor="ws-note-settled"><StudioText role="metadata" as="span">In your words, what have you settled about the book?</StudioText></label>
            <textarea id="ws-note-settled" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={3} maxLength={1000}
              style={{ font: 'inherit', fontSize: 14, padding: 8, borderRadius: RADIUS.sm, border: `1px solid ${RULE.soft}`, background: 'transparent', color: INK.primary }} />
            <div style={{ display: 'flex', gap: SPACE.tight }}>
              <button type="button" data-note-settled-confirm="true" disabled={!noteDraft.trim() || Boolean(actStatus?.busy)}
                onClick={() => { const words = noteDraft.trim(); setNoteDraft(null); void performAct({ id: 'note-settled', words }); }}
                style={{ background: 'transparent', border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm, padding: `${SPACE.hairline}px ${SPACE.tight}px`, cursor: 'pointer', color: INK.secondary }}>
                <StudioText role="metadata" as="span">Note it</StudioText>
              </button>
              <button type="button" onClick={() => setNoteDraft(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: INK.quiet }}>
                <StudioText role="metadata" as="span">Not now</StudioText>
              </button>
            </div>
          </div>
        ) : null}
        {actStatus ? (
          <div data-studio-act-status={actStatus.busy ? 'busy' : 'done'} role="status" aria-live="polite" style={{ marginTop: SPACE.tight }}>
            <StudioText role="metadata" tone="secondary">{actStatus.text}</StudioText>
          </div>
        ) : null}

        {correctionStatus ? (
          <StudioText role="metadata" data-correction-status="true">{correctionStatus}</StudioText>
        ) : null}

        {/* ⛔ A PENDING QUESTION IS NOT A TURN. It is shown so the writer can see
            their words went somewhere, and it is replaced by the server's record
            rather than promoted into one. */}
        {pending !== null && (
          <div style={{ marginBottom: SPACE.base }} data-pending-question="true">
            <StudioText role="metadata" tone="quiet" style={{ marginBottom: SPACE.hairline }}>You</StudioText>
            <StudioText role="maiaReading" style={{ color: INK.secondary, opacity: 0.6 }}>
              {pending}
            </StudioText>
            <StudioText role="metadata">…</StudioText>
          </div>
        )}

        {/* A failed answer is unmistakable: never a quiet line the writer can miss. The question stays in the box; nothing is retried by itself. */}
        {refusal && (
          <div role="alert" data-maia-refusal="true"
            style={{ margin: `${SPACE.snug}px 0`, padding: `${SPACE.tight}px ${SPACE.snug}px`, borderRadius: RADIUS.sm,
              border: '1px solid color-mix(in srgb, #c0392b 55%, transparent)', background: 'color-mix(in srgb, #c0392b 10%, transparent)' }}>
            <StudioText role="metadata" as="span">{refusal}</StudioText>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── The member's kept passages, offered rather than inserted. ── */}
      {manuscriptId && showKeeps && (
        <div
          data-keeps-chooser="true"
          style={{
            maxHeight: '38%', overflowY: 'auto',
            border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
            padding: SPACE.snug, marginBottom: SPACE.snug, background: GROUND.base,
          }}
        >
          {keeps.length === 0 ? (
            <StudioText role="metadata" style={{ opacity: 0.75 }}>
              You have not kept any passages yet. Keeps are made in the Source,
              where your sections live.
            </StudioText>
          ) : (
            keeps.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  /* Into the composer — never straight into the exchange. The
                     member decides what to ask about it, and sends it as their
                     own turn. */
                  const quoted = `From ${k.sectionHeading ?? 'my manuscript'}:\n\n“${k.verbatimText}”\n\n`;
                  draftRevisionRef.current += 1;
                  setDraft((d) => (d ? `${quoted}${d}` : quoted));
                  setShowKeeps(false);
                }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${RULE.quiet}`,
                  padding: `${SPACE.snug}px ${SPACE.tight}px`, cursor: 'pointer',
                }}
              >
                <StudioText role="metadata" tone="quiet">
                  {k.sectionHeading ?? 'Untitled section'}
                </StudioText>
                <StudioText role="metadata" tone="secondary" style={{ opacity: 0.9 }}>
                  {k.verbatimText.length > 120
                    ? `${k.verbatimText.slice(0, 120)}…`
                    : k.verbatimText}
                </StudioText>
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Composer. The writer gets a real writing surface, not a utility slot. ── */}
      <div
        data-maia-composer="true"
        style={{
          borderTop: `1px solid ${RULE.soft}`, paddingTop: SPACE.base,
          marginTop: SPACE.snug, background: GROUND.raised,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.snug, marginBottom: SPACE.tight }}>
          <StudioText role="panelLabel" as="span">Ask MAIA</StudioText>
          <StudioText role="metadata" tone="quiet" as="span">Write naturally · Enter sends · Shift+Enter adds a line</StudioText>
        </div>
        {manuscriptId ? (
          <div role="group" aria-label="What this question is about" data-carry-scope={carryScope}
            style={{ display: 'flex', alignItems: 'center', gap: SPACE.tight, flexWrap: 'wrap', marginBottom: SPACE.tight }}>
            <StudioText role="metadata" tone="quiet" as="span">About:</StudioText>
            {(['here', 'whole_book'] as const).map((s) => (
              <button key={s} type="button" aria-pressed={carryScope === s} onClick={() => setCarryScope(s)}
                style={{ fontSize: 12, padding: '2px 8px', borderRadius: RADIUS.sm, cursor: 'pointer',
                  border: `1px solid ${carryScope === s ? INK.primary : RULE.soft}`,
                  background: carryScope === s ? GROUND.base : 'transparent', color: INK.primary,
                  fontWeight: carryScope === s ? 600 : 400 }}>
                {s === 'here' ? 'where I am' : 'the whole book'}
              </button>
            ))}
            {offerWholeBook ? (
              <button type="button" data-whole-book-offer="true" onClick={() => setCarryScope('whole_book')}
                style={{ fontSize: 12, padding: '2px 8px', border: 'none', background: 'transparent', color: INK.secondary, textDecoration: 'underline', cursor: 'pointer' }}>
                Ask about the whole book?
              </button>
            ) : null}
          </div>
        ) : null}
        <textarea
          value={draft}
          onChange={(e) => { draftRevisionRef.current += 1; setDraft(e.target.value); setPresentationConfirmation(null); setPresentationNotice(null); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={WORK_CONVERSATION_PLACEHOLDER}
          rows={3}
          aria-label="Message MAIA"
          data-send-mode={mode.kind === 'blocked' ? `blocked:${mode.why}` : mode.kind}
          style={{
            ...typeStyle('maiaReading'), width: '100%', resize: 'vertical',
            minHeight: focusMode ? 190 : 132, maxHeight: focusMode ? 360 : 260,
            background: GROUND.base, color: INK.primary,
            border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
            padding: SPACE.snug, outline: 'none',
          }}
        />
        {reorientationOffered ? (
          <div data-reorientation-confirm role="group" aria-label="Reorientation prompt"
            style={{ border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm, padding: SPACE.snug, marginTop: SPACE.snug }}>
            <StudioText role="panelLabel" as="strong">Keep your question, then add a prompt</StudioText>
            <p style={{ fontSize: 13, whiteSpace: 'pre-wrap', margin: '8px 0' }}>{REORIENTATION_PROMPT}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE.tight }}>
              <button type="button" onClick={addReorientation}
                style={{ border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm, padding: '8px 12px' }}>
                Add to my draft
              </button>
              <button type="button" onClick={() => setReorientationOffered(false)}
                style={{ border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm, padding: '8px 12px' }}>
                Keep my draft
              </button>
            </div>
          </div>
        ) : null}
        {presentationConfirmation ? (
          <div data-maia-presentation-confirm role="group" aria-label="Review Studio presentation change"
            style={{border:`1px solid ${RULE.soft}`,padding:SPACE.snug,borderRadius:RADIUS.sm,marginTop:SPACE.snug}}>
            <StudioText role="panelLabel" as="strong">{presentationConfirmation.label}</StudioText>
            <p style={{margin:'6px 0',fontSize:13}}>{presentationConfirmation.explanation}</p>
            <p style={{margin:'4px 0',fontSize:12}}>Presentation only. Your words, permissions, and MAIA reading consent remain unchanged.</p>
            <div style={{display:'flex',gap:10,marginTop:10}}>
              <button type="button" onClick={approvePresentation}
                style={{border:`1px solid ${RULE.soft}`,borderRadius:RADIUS.sm,padding:'8px 12px'}}>
                Apply display change
              </button>
              <button type="button" onClick={() => setPresentationConfirmation(null)}
                style={{border:`1px solid ${RULE.soft}`,borderRadius:RADIUS.sm,padding:'8px 12px'}}>
                Keep current view
              </button>
            </div>
          </div>
        ) : null}
        {presentationNotice ? <p role="status" data-maia-presentation-notice
          style={{fontSize:12,margin:'8px 0'}}>{presentationNotice}</p> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.base, marginTop: SPACE.snug }}>
          {manuscriptId && showSecondary ? (
            <button
              type="button"
              data-keeps-toggle="true"
              aria-expanded={showKeeps}
              onClick={() => setShowKeeps((v) => !v)}
              style={{
                background: showKeeps ? GROUND.active : 'transparent',
                border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                padding: `${SPACE.tight}px ${SPACE.snug}px`,
                cursor: 'pointer', color: INK.secondary,
              }}
            >
              <StudioText role="metadata" as="span">
                Keeps{keeps.length > 0 ? ` ${keeps.length}` : ''}
              </StudioText>
            </button>
          ) : null}
          {/* ⚠️ Cross-surface handoff still requires a manuscript return contract. */}
          {manuscriptId && showSecondary ? (
            <Link
              href={handoffToMaia('/maia', { workId: work.id, manuscriptId })}
              data-open-in-maia="true"
              onClick={(event) => { if (!requestConversationDeparture()) event.preventDefault(); }}
              style={{ textDecoration: 'none' }}
            >
              <StudioText role="metadata" as="span">Open in MAIA →</StudioText>
            </Link>
          ) : null}
          {quiet && decision?.kind === 'choose' && !moreOpen ? (
            /* The room is asking which conversation to continue: starting a new one must not hide behind More (walk 2026-11-09). */
            <button type="button" data-start-fresh-quiet="true" onClick={startFresh} disabled={!canStartFresh}
              style={{ background: 'transparent', border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm, padding: `${SPACE.hairline}px ${SPACE.tight}px`, cursor: 'pointer', color: INK.secondary }}>
              <StudioText role="metadata" as="span">Start a new conversation</StudioText>
            </button>
          ) : null}
          {quiet ? (
            <button type="button" data-conversation-more="true" aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: INK.secondary, padding: 0 }}>
              <StudioText role="metadata" as="span">{moreOpen ? 'Fewer options' : 'More'}</StudioText>
            </button>
          ) : null}
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => void send()}
            disabled={pending !== null || !displayRequestMaySubmit}
            style={{
              background: GROUND.active, border: `1px solid ${RULE.soft}`,
              borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.base}px`,
              cursor: pending !== null || !displayRequestMaySubmit ? 'default' : 'pointer',
              opacity: pending !== null || !displayRequestMaySubmit ? 0.4 : 1,
              color: INK.primary,
            }}
          >
            <StudioText role="metadata" as="span">{localPresentationRequest ? 'Review change' : 'Send'}</StudioText>
          </button>
        </div>
      </div>
    </div>
  );
}
