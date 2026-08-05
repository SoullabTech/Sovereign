'use client';

/**
 * Vision Studio Room — Living Field genesis experience.
 *
 * A practitioner-facilitated Spiralogic Interview in which the participant
 * begins developing their Living Field before the formal in-person session.
 * Evidence accumulates by explicit authorship gesture; MAIA proposes, the
 * participant is always the author.
 *
 * Phases: arrival (Opening frame) → conversation → proposal → closed
 *
 * Governance invariants (inherited, load-bearing):
 *   - Nothing persists without explicit member gesture.
 *   - No sorting, typing, or identity modeling.
 *   - MAIA proposes; participant authors. Proposing nothing is faithful.
 *   - can_be_shown_to_practitioner defaults FALSE; set only by an explicit per-thread member gesture ("Share with your practitioner"). Carrying a thread is private to the member's field; sharing is a separate choice.
 *
 * Room recomposition (founder feedback — the room the member can talk to,
 * bring insights into, and type within):
 *   - The holoflower is the room's center, not a header badge. Motion states
 *     are interaction-reactive only — idle stays still ("recognition is
 *     earned; silence is a successful outcome").
 *   - Voice input (browser SpeechRecognition, local only, never auto-sends),
 *     optional spoken replies (window.speechSynthesis, session-only, off by
 *     default), and a "bring an insight" affordance (client-side FileReader
 *     or paste, never uploaded) all feed the SAME draft the member reviews
 *     and sends themselves. None of this adds persistence — R13 (no
 *     elemental persistence path) and R05 (no implicit practitioner share)
 *     are unaffected: no new state here ever reaches carry()/collectPayload()
 *     or localStorage.
 */

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import { RoomHoloflower, type RoomMotionState, type SpiralElement } from '@/components/maia/vision-studio/RoomHoloflower';
import { RoomTrustCopy } from '@/components/now-what/RoomTrustCopy';

// — Threshold staging (Now What?) —
// The arrival surfaces are staged, not listed: a display serif for the room's
// spoken lines (ui-serif → New York on Apple devices, Georgia elsewhere — no
// font dependency added), and a slow staggered entrance. Presentation only;
// no interaction logic lives here. The entrance uses CSS animations rather
// than framer-motion: CSS is clock-based, so it completes correctly even in
// rAF-throttled background tabs (framer's ticks freeze there, leaving the
// threshold stuck at opacity 0).
const SERIF = { fontFamily: "ui-serif, 'New York', Georgia, 'Times New Roman', serif" } as const;
const fadeUpStyle = (delay: number): CSSProperties => ({
  opacity: 0,
  animation: `nwFadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`,
});
const NW_FADE_KEYFRAMES = `@keyframes nwFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }`;

type Role = 'user' | 'assistant';
interface Turn { role: Role; content: string; }
type ThreadKind = 'theme' | 'question' | 'practice' | 'open';
interface ProposedThread { title: string; reflection: string; groundedIn: string; kind?: ThreadKind; }
type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface AuthoredThread { title: string; origin: 'maia_proposed' | 'member_authored'; }
interface CarryPayload {
  proposals: { title: string; decision: Decision; revisedTitle?: string; children?: string[]; shareWithPractitioner?: boolean; kind?: ThreadKind }[];
  created: { title: string; shareWithPractitioner: boolean; kind?: 'question' }[];
}
interface CellCandidate {
  element: SpiralElement;
  phase: 1 | 2 | 3;
  confidence: number;
  source: 'system_inferred';
}

// Spoken in FELT language, never element names — the frame directive for this
// field: MAIA may think in elements; she speaks in how flourishing moves.
// A client who has never heard of Spiralogic must recognize themselves in the
// phrase. The element mapping underneath (Holoflower, confirmations) is unchanged.
const ELEMENT_FEELING_LABEL: Record<SpiralElement, string> = {
  Fire: 'new energy trying to move',
  Water: 'something deeper finding its flow',
  Earth: 'something taking solid shape',
  Air: 'a clearer way of seeing arriving',
  Aether: 'things weaving together',
};

const ALL_ELEMENTS: SpiralElement[] = ['Fire', 'Water', 'Earth', 'Air', 'Aether'];

// 'practice' and 'offering' are the Now What? workshop-loop steps: one committed
// practice ("Now what will you actually live?"), then an optional offering.
type RoomPhase = 'arrival' | 'conversation' | 'proposal' | 'practice' | 'offering' | 'closed';

const THREAD_KIND_HEADINGS: { kind: ThreadKind; heading: string }[] = [
  { kind: 'theme', heading: 'Themes that emerged' },
  { kind: 'question', heading: 'Questions still alive' },
  { kind: 'practice', heading: 'Practices available' },
  { kind: 'open', heading: 'What remains open' },
];

const OPENING_FRAME = `Before we begin, I'd like to frame what we're doing together.

This isn't an intake interview.

It isn't an assessment.

It isn't a process of gathering information about you.

Think of this as the beginning of a Living Field.

Everything we explore here becomes part of a shared developmental context that continues to support the work over time.

The field develops.

You participate in it.

That distinction matters.

We're not trying to build a profile of who you are.

We're creating a place where the work you're doing can continue to unfold.

Some ideas will become clearer.

Some questions will remain open.

Some practices may emerge.

Nothing needs to be finished today.

Our purpose isn't to reach conclusions.

It's to begin a field that can continue to hold what is becoming possible.

If something doesn't feel true, we'll leave it as an observation rather than forcing an interpretation.

The authority for meaning stays with you.

The field will remember the work.

You remain the author of its meaning.

One thing to name clearly: Kelly can accompany this field as your facilitating practitioner. What you author here is yours and enters your own Living Field — private by default. Sharing any thread with Kelly is a separate choice you make thread by thread; nothing is shared unless you choose it. Never the conversation, never a record of who you are — only what you explicitly choose to share.

This is an early beta, and part of what you are helping us learn is how this kind of field can support your own recognition without turning you into a profile.`;

const PHASE_LABELS: Record<string, string> = {
  fire_1: 'Fire I — Vision',
  fire_2: 'Fire II — Expression',
  fire_3: 'Fire III — Illumination',
  water_1: 'Water I — Feeling',
  water_2: 'Water II — Transformation',
  water_3: 'Water III — Inner Wisdom',
  earth_1: 'Earth I — Grounding',
  earth_2: 'Earth II — Building',
  earth_3: 'Earth III — Embodiment',
  air_1: 'Air I — Understanding',
  air_2: 'Air II — Dialogue',
  air_3: 'Air III — Contribution',
};

const PHASE_OPENING_QUESTIONS: Record<string, string> = {
  fire_1: "When you imagine the world your work is trying to call into being — not what you're doing to get there, but the world itself — what do you see?",
  fire_2: "Tell me about a specific moment — a conversation, an encounter, someone you worked with — when the vision actually landed. What happened?",
  fire_3: "After years of living inside this work, what does it keep teaching you that you couldn't have learned any other way?",
  water_1: "What is the original wound or beauty that gave birth to this work — not the idea, but the experience?",
  water_2: "What have you had to give up, let go of, or be changed by in order to keep doing this work?",
  water_3: "What do you know about this — about human beings, about change — that you couldn't teach someone else directly, that they'd have to live into?",
};

const CLOSURE_QUESTION = 'Before we pause — what surprised you in what you just said? Is there anything you want to name before we stop?';

interface Props {
  phase?: string;
  fieldContext?: string;
  /** Program door within the field (catalog spec) — scopes the position block only. */
  program?: string;
  /**
   * Which Home door the member came through. Frames the arrival — it never
   * seeds content, never sends anything, and the member's words remain the
   * only input. question | cultivate | prepare | think (default).
   */
  entry?: string;
  /** Opaque thread id for entry=question — resolved member-scoped from the
   *  room's own load; the member's text never rides the URL. */
  entryThread?: string;
  /** Flourishing dimension slug for entry=cultivate — static copy only. */
  entryDimension?: string;
}

/*
 * Static entry copy for the cultivate door — mirrors the Home's researched
 * flourishing domains (CLIENT_FIELD_TALK_ALIGNMENT_2026-08-05.md). The
 * member chose the dimension by clicking it; that click is the gesture the
 * framing keys on. No member data enters this map.
 */
const CULTIVATE_DIMENSIONS: Record<string, { name: string; facets: string }> = {
  relationships: { name: 'Relationships', facets: 'connection · belonging · love' },
  meaning: { name: 'Meaning & purpose', facets: 'what your life is for' },
  presence: { name: 'Presence', facets: 'experiencing the life you built' },
  health: { name: 'Health & energy', facets: 'movement · sleep · vitality' },
  contribution: { name: 'Contribution', facets: 'what you give beyond yourself' },
  time: { name: 'Time', facets: 'enough of it for what matters' },
};

// — Program position (arrival payload; rides the field-note room-load GET) —
interface ArrivalPositionPayload {
  focalPoint: string;
  statedBy: 'member_confirmed' | 'member_stated' | 'practitioner_seeded';
  footing: 'confirmed-current' | 'assumed-from-last-known';
  confirmedAt: string | null;
}
interface ProgramArrivalPayload {
  programSlug: string;
  programTitle: string | null;
  cohortFocalPoint: string | null;
  position: ArrivalPositionPayload | null;
  engagements: { programSlug: string; title: string | null; focalPoint: string }[];
}

/**
 * Isolated reference embodiment (founder direction 2026-07-06): the Now What?
 * client experience lives in its own namespace and does not modify framework
 * surfaces. It may earn its way into shared architecture through observation.
 */
export function NowWhatRoom({ phase = 'fire_1', fieldContext, program, entry, entryThread, entryDimension }: Props) {
  const nowWhat = true;
  const [roomPhase, setRoomPhase] = useState<RoomPhase>('arrival');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [working, setWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposed, setProposed] = useState<ProposedThread[]>([]);
  const [authored, setAuthored] = useState<AuthoredThread[]>([]);
  const [revising, setRevising] = useState<Record<string, string>>({});
  const [newThread, setNewThread] = useState('');
  // The member's explicit "a question I'm living" gesture on their own thread —
  // mirrors the share checkbox pattern; without it a self-authored question
  // could never reach the "Questions you're living" room (silent-loss bug 2).
  const [newThreadIsQuestion, setNewThreadIsQuestion] = useState(false);
  const [guided, setGuided] = useState(true);
  const [showFrame, setShowFrame] = useState(false);
  // Per-thread sharing consent: keyed by thread title; absent = private (default).
  const [shared, setShared] = useState<Record<string, boolean>>({});
  // Now What? loop state. priorPractice = the practice committed on a previous visit
  // (drives the Return branch); practiceDraft/offeringDraft = this visit's commitments.
  const [priorPractice, setPriorPractice] = useState<string | null>(null);
  // The carried question's title for entry=question — resolved member-scoped
  // from the room's own thread load, never from the URL.
  const [entryThreadTitle, setEntryThreadTitle] = useState<string | null>(null);
  const [arrivalAnswer, setArrivalAnswer] = useState('');
  const [practiceDraft, setPracticeDraft] = useState('');
  const [sharePractice, setSharePractice] = useState(false);
  const [offeringDraft, setOfferingDraft] = useState('');
  const [shareOffering, setShareOffering] = useState(false);
  const [savedPractice, setSavedPractice] = useState<string | null>(null);
  // A parse-degraded 'propose' returns zero threads for a mechanical reason, not
  // because nothing was worth naming — surfaced distinctly so a glitch never reads
  // as "MAIA found nothing in you."
  const [degraded, setDegraded] = useState(false);
  // Welcome gate (first visit only): returnChecked flips true once return-detection
  // resolves, so the threshold never flashes before we know this is a return;
  // entered is the member's "Come in" — the welcome orients, it is never a wall.
  const [returnChecked, setReturnChecked] = useState(false);
  const [entered, setEntered] = useState(false);

  // — Program position (the room shows its anchoring instead of asking to be
  //   trusted). todayProgram = the door they came through, or the engagement
  //   they named at the generic door. Dismissing the arrival line writes
  //   NOTHING — enrollment happens only on affirmation. —
  const [programArrival, setProgramArrival] = useState<ProgramArrivalPayload | null>(null);
  const [todayProgram, setTodayProgram] = useState<string | undefined>(program);
  const [anchorDismissed, setAnchorDismissed] = useState(false);
  const [anchorCorrecting, setAnchorCorrecting] = useState(false);
  const [anchorDraft, setAnchorDraft] = useState('');
  const [anchorBusy, setAnchorBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string>(`vs-${Date.now()}`);

  // — Room holoflower: ambient motion + ephemeral cell-candidate reflection —
  // Nothing here is persisted. Confirmed elements live only in this component's
  // state for the duration of the session; they are never sent to any API and
  // never written to localStorage.
  const [roomMotion, setRoomMotion] = useState<RoomMotionState>('idle');
  const [cellCandidate, setCellCandidate] = useState<CellCandidate | null>(null);
  const [confirmedElements, setConfirmedElements] = useState<SpiralElement[]>([]);
  // Correction teaches restraint: an element the member has declined stays
  // silent for the rest of the session — the room never argues by re-asking.
  const [dismissedElements, setDismissedElements] = useState<SpiralElement[]>([]);
  const [showElementPicker, setShowElementPicker] = useState(false);

  // — Talk to it: browser SpeechRecognition, local only, member authority preserved —
  // Interim + final transcripts stream into the draft; the member always reviews and
  // sends. Nothing here is persisted, nothing leaves the device except the eventual
  // sent turn (identical to a typed one).
  const [micListening, setMicListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const draftBeforeMicRef = useRef('');

  // — Hear the room: optional spoken replies, session-only preference (not persisted) —
  const [speakReplies, setSpeakReplies] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // — Bring an insight: paste or local file, member authors the entry themselves —
  const [showBring, setShowBring] = useState(false);
  const [bringText, setBringText] = useState('');
  const [bringTruncated, setBringTruncated] = useState(false);
  const bringFileInputRef = useRef<HTMLInputElement>(null);
  const BRING_CHAR_CAP = 3500;

  // Desktop ~240px, mobile ~150px — the mandala is the room's center at either size.
  const [mandalaSize, setMandalaSize] = useState(150);

  useEffect(() => {
    setMicSupported(
      typeof window !== 'undefined' &&
        !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    );
    setSpeechSupported(typeof window !== 'undefined' && !!window.speechSynthesis);
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 640px)');
    const applySize = () => setMandalaSize(mq.matches ? 240 : 150);
    applySize();
    mq.addEventListener?.('change', applySize);
    return () => mq.removeEventListener?.('change', applySize);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, working]);

  // Return detection: if a practice was committed on a prior visit in this field
  // context, the room begins from what happened — not from the beginning.
  useEffect(() => {
    if (!nowWhat) return;
    // No field context → nothing to return to; treat as a first visit at once.
    if (!fieldContext) { setReturnChecked(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const programParam = program ? `&program=${encodeURIComponent(program)}` : '';
        const res = await apiFetch(
          `/api/now-what/field-note?fieldContext=${encodeURIComponent(fieldContext)}${programParam}`,
        );
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const threads: { id?: string; title: string; spiralogic_phase: string | null }[] = json?.threads ?? [];
          const practice = threads.find(t => t.spiralogic_phase === 'practice');
          if (practice && !cancelled) setPriorPractice(practice.title);
          // Entry=question: surface the member's own carried question at the
          // threshold. Member-scoped resolution — an id that isn't theirs
          // simply resolves to nothing.
          if (entryThread && !cancelled) {
            const carried = threads.find(t => t.id === entryThread);
            if (carried) setEntryThreadTitle(carried.title);
          }
          // Arrival payload (program position) rides the same load — null when
          // the field declares no anchoring; the line simply does not render.
          if (json?.arrival && !cancelled) setProgramArrival(json.arrival);
        }
      } catch {
        // Quiet fallback: no return context — the room simply begins fresh.
      } finally {
        if (!cancelled) setReturnChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [nowWhat, fieldContext, program]);

  // Re-resolve the arrival payload for an engagement named at the generic door.
  async function loadArrivalFor(programSlug: string) {
    if (!fieldContext) return;
    try {
      const res = await apiFetch(
        `/api/now-what/field-note?fieldContext=${encodeURIComponent(fieldContext)}&program=${encodeURIComponent(programSlug)}`,
      );
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json?.arrival) { setProgramArrival(json.arrival); setAnchorDismissed(false); }
      }
    } catch {
      // Quiet fallback — orientation is a nicety, never a blocker.
    }
  }

  // — Position gestures. Confirm and correct write; dismiss writes NOTHING
  //   (zero residue — a forwarded link opened by a non-participant leaves no
  //   trace). Depart hard-clears; the copy says exactly what it does. —
  async function postPositionGesture(gesture: Record<string, unknown>): Promise<boolean> {
    if (!fieldContext || anchorBusy) return false;
    setAnchorBusy(true);
    try {
      const res = await apiFetch('/api/now-what/program-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldContext,
          ...(todayProgram ? { program: todayProgram } : {}),
          ...gesture,
        }),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setAnchorBusy(false);
    }
  }

  async function confirmPosition() {
    const focalPoint = programArrival?.cohortFocalPoint;
    if (!focalPoint) return;
    const ok = await postPositionGesture({ confirm: true });
    if (ok) {
      setProgramArrival(prev => prev ? {
        ...prev,
        position: { focalPoint, statedBy: 'member_confirmed', footing: 'confirmed-current', confirmedAt: new Date().toISOString() },
      } : prev);
      setAnchorCorrecting(false);
    }
  }

  async function statePosition() {
    const text = anchorDraft.trim().slice(0, 300);
    if (!text) return;
    const ok = await postPositionGesture({ focalPoint: text });
    if (ok) {
      setProgramArrival(prev => prev ? {
        ...prev,
        position: { focalPoint: text, statedBy: 'member_stated', footing: 'confirmed-current', confirmedAt: new Date().toISOString() },
      } : prev);
      setAnchorCorrecting(false);
      setAnchorDraft('');
    }
  }

  async function departPosition() {
    const ok = await postPositionGesture({ depart: true });
    if (ok) {
      const departedSlug = programArrival?.programSlug;
      setProgramArrival(prev => prev ? {
        ...prev,
        position: null,
        engagements: prev.engagements.filter(e => e.programSlug !== departedSlug),
      } : prev);
      setAnchorDismissed(true);
    }
  }

  async function callInterview(history: Turn[], mode: 'turn' | 'propose') {
    const res = await apiFetch('/api/now-what/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        mode,
        phase,
        // The same opaque identifier used for return detection also lets the server
        // compose the practitioner's field into the turn (downstream of MAIA's own).
        ...(fieldContext ? { fieldContext } : {}),
        // Today's program (door-entered or member-named): scopes the position
        // block only — the whole field stays composed either way.
        ...(todayProgram ? { program: todayProgram } : {}),
        ...(priorPractice ? { returningPractice: priorPractice } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || 'Not available right now.');
    return json;
  }

  async function sendTurn(text: string) {
    const content = text.trim();
    if (!content || working) return;
    // Sending always ends an in-progress dictation — the member is moving on.
    if (micListening) stopMic();
    setError(null);
    const newTurn: Turn = { role: 'user', content };
    const updated = [...turns, newTurn];
    setTurns(updated);
    setDraft('');
    setWorking(true);
    setRoomMotion('processing');
    // A new turn arriving fades any unconfirmed candidate from the prior turn —
    // no nagging, no re-ask. Member correction always wins; silence just moves on.
    setCellCandidate(null);
    setShowElementPicker(false);
    try {
      const json = await callInterview(updated, 'turn');
      setTurns(prev => [...prev, { role: 'assistant', content: json.reply }]);
      setRoomMotion('responding');
      speakText(json.reply);
      if (
        json?.cellCandidate &&
        typeof json.cellCandidate === 'object' &&
        !dismissedElements.includes(json.cellCandidate.element) &&
        !confirmedElements.includes(json.cellCandidate.element)
      ) {
        setCellCandidate(json.cellCandidate);
      }
      setTimeout(() => setRoomMotion('idle'), 900);
    } catch (e: any) {
      setError(e.message);
      setRoomMotion('idle');
    } finally {
      setWorking(false);
    }
  }

  // — Hear the room: speak MAIA's reply aloud when the member has opted in. —
  // Cancels any ongoing utterance first; OFF is always silent immediately.
  function speakText(text: string) {
    if (!speakReplies || !speechSupported || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utter);
    } catch {
      // Quiet fallback: speaking is a nicety, never a blocker.
    }
  }

  function toggleSpeakReplies() {
    setSpeakReplies(prev => {
      const next = !prev;
      if (!next) {
        try { window.speechSynthesis?.cancel(); } catch {}
      }
      return next;
    });
  }

  // — Talk to it: start/stop dictation. Appends to whatever is already typed —
  // never overwrites it. The member always reviews before Send; nothing auto-sends.
  function startMic() {
    if (!micSupported || micListening) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition: SpeechRecognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    // Route dictation to whichever draft is active: the arrival answer during
    // the threshold, the conversation draft once inside the room.
    const micArrival = roomPhase === 'arrival';
    const setMicValue = micArrival ? setArrivalAnswer : setDraft;
    draftBeforeMicRef.current = micArrival ? arrivalAnswer : draft;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      if (final) draftBeforeMicRef.current = `${draftBeforeMicRef.current} ${final}`.trim();
      const combined = `${draftBeforeMicRef.current} ${interim}`.trim();
      setMicValue(combined);
      if (!working) setRoomMotion(combined ? 'listening' : 'idle');
    };
    recognition.onerror = (event: any) => {
      setMicListening(false);
      recognitionRef.current = null;
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setError('Microphone access is blocked — enable it in your browser settings to dictate.');
      }
    };
    recognition.onend = () => {
      setMicListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setMicListening(true);
    } catch {
      setMicListening(false);
    }
  }

  function stopMic() {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setMicListening(false);
  }

  function toggleMic() {
    if (micListening) stopMic();
    else startMic();
  }

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  // — Bring an insight: member-authored material, reviewed and edited before send. —
  // Client-side only — pasted text or a local .txt/.md file read via FileReader.
  // Nothing uploads; nothing persists beyond this component's draft state.
  function applyBroughtText(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const truncated = trimmed.length > BRING_CHAR_CAP;
    const capped = truncated ? trimmed.slice(0, BRING_CHAR_CAP) : trimmed;
    setBringTruncated(truncated);
    // In the arrival threshold the brought text IS the answer; inside the room
    // it's framed as brought material appended to the conversation draft.
    if (roomPhase === 'arrival') setArrivalAnswer(capped);
    else setDraft(`Something I'm bringing: ${capped}`);
    setShowBring(false);
    setBringText('');
  }

  function handleBringFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyBroughtText(String(reader.result ?? ''));
    reader.onerror = () => setError("Couldn't read that file — try a plain .txt or .md.");
    reader.readAsText(file);
    e.target.value = '';
  }

  function confirmCandidate() {
    if (!cellCandidate) return;
    setConfirmedElements(prev =>
      prev.includes(cellCandidate.element) ? prev : [...prev, cellCandidate.element],
    );
    setCellCandidate(null);
    setShowElementPicker(false);
  }

  function dismissCandidate() {
    if (cellCandidate) {
      setDismissedElements(prev =>
        prev.includes(cellCandidate.element) ? prev : [...prev, cellCandidate.element],
      );
    }
    setCellCandidate(null);
    setShowElementPicker(false);
  }

  function chooseElementInstead(element: SpiralElement) {
    // The redirect is also a correction of the proposed element — silence it too.
    if (cellCandidate && cellCandidate.element !== element) {
      setDismissedElements(prev =>
        prev.includes(cellCandidate.element) ? prev : [...prev, cellCandidate.element],
      );
    }
    // An explicit member choice outranks any earlier dismissal of that element.
    setDismissedElements(prev => prev.filter(e => e !== element));
    setConfirmedElements(prev => (prev.includes(element) ? prev : [...prev, element]));
    setCellCandidate(null);
    setShowElementPicker(false);
  }

  async function listenBack() {
    if (turns.length < 2 || working) return;
    setError(null);
    setDegraded(false);
    setWorking(true);
    try {
      const json = await callInterview(turns, 'propose');
      setProposed(json.threads ?? []);
      setDegraded(!!json?.degraded);
      setRoomPhase('proposal');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  }

  async function carry(payload: CarryPayload) {
    setSaving(true);
    try {
      const res = await apiFetch('/api/now-what/field-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposals: payload.proposals,
          created: payload.created,
          sessionRef: sessionRef.current,
          spiralogicPhase: phase,
          fieldContext: fieldContext ?? null,
          // The placing gesture: the member entered through a dimension door,
          // so what they keep from this session places itself in that
          // dimension's area of the Flourishing Field.
          ...(entryDimension ? { dimension: entryDimension } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not save.');
      // The Now What? loop continues into the practice step; the generic room closes here.
      setRoomPhase(nowWhat ? 'practice' : 'closed');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Saves a single tagged thread (practice/offering) through the same field-note
  // route and consent model as every other authored thread.
  async function saveTagged(tag: 'practice' | 'offering', title: string, share: boolean) {
    const res = await apiFetch('/api/now-what/field-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposals: [],
        created: [{ title, shareWithPractitioner: share }],
        sessionRef: sessionRef.current,
        spiralogicPhase: tag,
        fieldContext: fieldContext ?? null,
        ...(entryDimension ? { dimension: entryDimension } : {}),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || 'Could not save.');
  }

  async function commitPractice() {
    const title = practiceDraft.trim();
    if (!title || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveTagged('practice', title, sharePractice);
      setSavedPractice(title);
      setRoomPhase('offering');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function commitOffering() {
    const title = offeringDraft.trim();
    if (!title || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveTagged('offering', title, shareOffering);
      setRoomPhase('closed');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDecision(thread: ProposedThread, decision: Decision, revisedTitle?: string) {
    if (decision === 'keep') {
      setAuthored(prev => [...prev, { title: thread.title, origin: 'maia_proposed' }]);
    } else if (decision === 'revise' && revisedTitle) {
      setAuthored(prev => [...prev, { title: revisedTitle, origin: 'member_authored' }]);
    }
  }

  function collectPayload(): CarryPayload {
    const proposals = proposed.map(t => {
      // The kind travels with the member's keep gesture so a question kept
      // under "Questions still alive" persists AS a question (ruling
      // 2026-07-13). The save route stores only kind === 'question'; other
      // kinds stay unpersisted behind their gates.
      const kind = t.kind;
      const rev = revising[t.title];
      if (rev !== undefined) {
        if (rev === '') return { title: t.title, decision: 'discard' as Decision, shareWithPractitioner: false };
        // For a revised thread, the sharing key is the revised title the member chose.
        return { title: t.title, decision: 'revise' as Decision, revisedTitle: rev, shareWithPractitioner: !!shared[rev], kind };
      }
      if (authored.some(a => a.title === t.title)) return { title: t.title, decision: 'keep' as Decision, shareWithPractitioner: !!shared[t.title], kind };
      return { title: t.title, decision: 'discard' as Decision, shareWithPractitioner: false };
    });
    const trimmed = newThread.trim();
    const created = trimmed
      ? [{ title: trimmed, shareWithPractitioner: !!shared[trimmed], ...(newThreadIsQuestion ? { kind: 'question' as const } : {}) }]
      : [];
    return { proposals, created };
  }

  const phaseLabel = PHASE_LABELS[phase] ?? phase;
  const openingQuestion = PHASE_OPENING_QUESTIONS[phase];
  const roomTitle = nowWhat ? 'Now What?' : 'Vision Studio';

  function beginFromThreshold() {
    const answer = arrivalAnswer.trim();
    if (!answer) return;
    setRoomPhase('conversation');
    sendTurn(answer);
  }

  // — Discuss: enter the back-and-forth immediately, without composing a threshold
  //   answer first. "I'm not ready to formulate this — help me talk it through."
  //   The conversation's guided opener does the inviting; nothing is sent yet.
  function beginDiscussion() {
    if (working) return;
    if (micListening) stopMic();
    setGuided(true);
    setRoomPhase('conversation');
  }

  // — Now What? welcome + threshold. First-visit welcome (Larry's standing frame),
  //   then one question. Return visits skip the welcome and begin from what happened. —
  if (roomPhase === 'arrival' && nowWhat) {
    // Hold a quiet beat while return-detection resolves, so a returning member
    // never sees the first-visit welcome flash ahead of the return prompt.
    if (fieldContext && !returnChecked) {
      return (
        <div className="relative min-h-[92vh] flex items-center justify-center px-6 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_38%,rgba(196,164,110,0.08),transparent_65%)]" />
          <RoomHoloflower mono motionState="idle" proposedElement={null} confirmedElements={[]} size={Math.max(mandalaSize, 170)} />
        </div>
      );
    }
    const returning = priorPractice !== null;

    // First visit: Larry's welcome. "Come in" is a threshold, not a wall — the
    // welcome orients and invites; it never measures, and authorship of meaning
    // stays with the member ("the growth you recognize in your own life").
    if (!returning && !entered) {
      return (
        <div key="nw-welcome" className="relative min-h-[92vh] flex items-center justify-center px-6 py-16 overflow-hidden">
          <style>{NW_FADE_KEYFRAMES}</style>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_38%,rgba(196,164,110,0.08),transparent_65%)]" />
          <div className="relative w-full max-w-xl space-y-10">
            <div style={fadeUpStyle(0)} className="flex justify-center">
              <RoomHoloflower mono motionState="idle" proposedElement={null} confirmedElements={[]} size={Math.max(mandalaSize, 170)} />
            </div>
            <div style={fadeUpStyle(0.25)} className="text-center space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-[#c9a35e]">Now What? · with Larry Closs</p>
              <h1 style={SERIF} className="text-4xl sm:text-5xl font-light text-slate-100 tracking-wide">Welcome.</h1>
            </div>
            <div style={fadeUpStyle(0.5)} className="space-y-5 text-slate-300 text-[17px] font-light leading-[1.85]">
              <p>Flourishing is a practice — one you live, day by day, long after a conversation ends.</p>
              <p>This is where that practice continues.</p>
              <p>It's a place to return to between our conversations. A place to notice what you're learning, work with the questions that matter, and bring fresh experience back into the conversation.</p>
              <p style={SERIF} className="text-slate-100 text-lg italic">You set the rhythm.</p>
              <p style={SERIF} className="text-slate-100 text-lg italic">You decide what deserves your attention.</p>
              <p>Nothing here measures you or grades your progress. The only growth that matters is the growth you recognize in your own life.</p>
              <p>Think of this as our coaching continuing — carried into your real, working life, one step at a time.</p>
            </div>
            <div style={fadeUpStyle(0.75)} className="text-center space-y-6 pt-2">
              <p className="text-slate-500 text-sm font-light italic">When you're ready…</p>
              <button
                onClick={() => setEntered(true)}
                className="inline-block border border-[#c9a35e]/30 text-[#c9a35e] hover:border-[#c9a35e]/70 hover:bg-[#c9a35e]/5 rounded-full px-10 py-3.5 text-sm tracking-[0.22em] uppercase font-light transition-all duration-300"
              >
                Come in
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key="nw-arrival" className="relative min-h-[92vh] flex items-center justify-center px-6 py-16 overflow-hidden">
        <style>{NW_FADE_KEYFRAMES}</style>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_38%,rgba(196,164,110,0.08),transparent_65%)]" />
        <div className="relative w-full max-w-xl space-y-10">
          <div style={fadeUpStyle(0)} className="flex justify-center">
            <RoomHoloflower mono motionState="idle" proposedElement={null} confirmedElements={[]} size={Math.max(mandalaSize, 170)} />
          </div>
          <p style={fadeUpStyle(0.2)} className="text-center text-sm uppercase tracking-[0.4em] text-[#c9a35e]">
            Now What?
          </p>

          {/* — The room shows its anchoring instead of asking to be trusted.
              Three outcomes: confirm (writes), correct in own words (writes,
              verbatim), dismiss (writes NOTHING — enrollment only on
              affirmation). Departure is the same gesture in reverse; its copy
              says exactly what it does, no confirmation friction. — */}
          {programArrival && !anchorDismissed && (
            <div style={fadeUpStyle(0.3)} className="space-y-4 text-center border border-slate-800/70 rounded-xl px-5 py-5">
              {programArrival.position?.footing === 'confirmed-current' ? (
                <>
                  <p className="text-slate-400 text-sm font-light leading-relaxed">
                    {programArrival.programTitle ? (
                      <>Working from the <span className="text-slate-200">{programArrival.programTitle}</span> — </>
                    ) : (
                      <>Working from — </>
                    )}
                    <span style={SERIF} className="text-slate-200 italic">{programArrival.position.focalPoint}</span>
                  </p>
                  <button
                    onClick={departPosition}
                    disabled={anchorBusy}
                    className="text-slate-600 hover:text-slate-400 text-xs underline underline-offset-4 transition-colors disabled:opacity-40"
                  >
                    I&apos;ve finished this
                  </button>
                  <p className="text-slate-700 text-[11px] font-light leading-relaxed">
                    This clears your position here; the door is open whenever you return.
                  </p>
                </>
              ) : programArrival.cohortFocalPoint ? (
                <>
                  <p style={SERIF} className="text-slate-300 text-base font-light leading-relaxed">
                    This room holds Larry&apos;s work
                    {programArrival.programTitle ? (
                      <> — you&apos;ve come in through the <span className="text-slate-100">{programArrival.programTitle}</span>,</>
                    ) : (
                      <> —</>
                    )}{' '}
                    current focus: <span className="text-slate-100 italic">{programArrival.cohortFocalPoint}</span>.
                  </p>
                  <p className="text-slate-400 text-sm font-light">Is that where you are?</p>
                  {anchorCorrecting ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        aria-label="Where you actually are, in your own words"
                        className="w-full bg-transparent border-b border-slate-600/70 text-slate-100 text-sm font-light focus:outline-none focus:border-[#c9a35e]/50 placeholder:text-slate-600 py-2 text-center transition-colors"
                        placeholder="Where are you, in your own words…"
                        value={anchorDraft}
                        maxLength={300}
                        onChange={e => setAnchorDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); statePosition(); } }}
                      />
                      <div className="flex items-center justify-center gap-x-4 text-xs font-light">
                        <button
                          onClick={statePosition}
                          disabled={!anchorDraft.trim() || anchorBusy}
                          className="text-[#c9a35e]/80 hover:text-[#c9a35e] transition-colors disabled:opacity-40"
                        >
                          That&apos;s where I am
                        </button>
                        <span aria-hidden className="text-slate-700">·</span>
                        <button
                          onClick={() => { setAnchorCorrecting(false); setAnchorDraft(''); }}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-x-4 text-sm font-light">
                      <button
                        onClick={confirmPosition}
                        disabled={anchorBusy}
                        className="text-[#c9a35e]/80 hover:text-[#c9a35e] transition-colors disabled:opacity-40"
                      >
                        Yes, that&apos;s where I am
                      </button>
                      <span aria-hidden className="text-slate-700">·</span>
                      <button
                        onClick={() => setAnchorCorrecting(true)}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        I&apos;m somewhere else
                      </button>
                      <span aria-hidden className="text-slate-700">·</span>
                      <button
                        onClick={() => setAnchorDismissed(true)}
                        aria-label="Not now — nothing is saved"
                        className="text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        Not now
                      </button>
                    </div>
                  )}
                  {programArrival.position && programArrival.position.footing === 'assumed-from-last-known' && (
                    <p className="text-slate-600 text-xs font-light leading-relaxed">
                      Last time you said: <span className="italic">{programArrival.position.focalPoint}</span>
                    </p>
                  )}
                </>
              ) : null}

              {/* Generic door: offer only what the MEMBER has declared — never
                  the full catalog as an assignment. Listing is not asking. */}
              {!todayProgram && programArrival.engagements.filter(e => e.programSlug !== 'general').length > 0 && (
                <div className="pt-2 space-y-2 border-t border-slate-800/60">
                  <p className="text-slate-500 text-xs font-light leading-relaxed">
                    You&apos;ve been working from{' '}
                    {programArrival.engagements.filter(e => e.programSlug !== 'general').map(e => e.title ?? e.programSlug).join(' and ')}.
                    Which are you bringing today — or something else?
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-light">
                    {programArrival.engagements.filter(e => e.programSlug !== 'general').map(e => (
                      <button
                        key={e.programSlug}
                        onClick={() => { setTodayProgram(e.programSlug); loadArrivalFor(e.programSlug); }}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {e.title ?? e.programSlug}
                      </button>
                    ))}
                    <button
                      onClick={() => setAnchorDismissed(true)}
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      Something else
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* — Entry framing: the door the member came through shapes the
              threshold. Their own carried question, a dimension they chose by
              clicking it, or conversation preparation. The frame orients;
              the member's words remain the only input. — */}
          {entry === 'question' && entryThreadTitle ? (
            <div style={fadeUpStyle(0.4)} className="space-y-5 text-center">
              <p className="text-slate-500 text-sm font-light">You are carrying —</p>
              <p style={SERIF} className="text-slate-300 text-xl font-light italic leading-relaxed">
                &ldquo;{entryThreadTitle}&rdquo;
              </p>
              <p style={SERIF} className="text-slate-100 text-3xl sm:text-4xl font-light leading-snug">
                What&apos;s moving in it now?
              </p>
            </div>
          ) : entry === 'cultivate' && entryDimension && CULTIVATE_DIMENSIONS[entryDimension] ? (
            <div style={fadeUpStyle(0.4)} className="space-y-5 text-center">
              <p className="text-slate-500 text-sm font-light">
                Reflecting through{' '}
                <span className="text-slate-300">{CULTIVATE_DIMENSIONS[entryDimension].name}</span>
                <span className="text-slate-600"> · {CULTIVATE_DIMENSIONS[entryDimension].facets}</span>
              </p>
              <p style={SERIF} className="text-slate-100 text-3xl sm:text-4xl font-light leading-snug">
                What in your life is asking for attention here?
              </p>
            </div>
          ) : entry === 'lived' ? (
            <div style={fadeUpStyle(0.4)} className="space-y-5 text-center">
              {priorPractice ? (
                <>
                  <p className="text-slate-500 text-sm font-light">What you are living —</p>
                  <p style={SERIF} className="text-slate-300 text-xl font-light italic leading-relaxed">
                    {priorPractice}
                  </p>
                  <p style={SERIF} className="text-slate-100 text-3xl sm:text-4xl font-light leading-snug">
                    What happened?
                  </p>
                  <p className="text-slate-500 text-sm font-light">What is life showing you?</p>
                </>
              ) : (
                <>
                  <p style={SERIF} className="text-slate-100 text-3xl sm:text-4xl font-light leading-snug">
                    What are you living right now?
                  </p>
                  <p className="text-slate-500 text-sm font-light">What is life showing you?</p>
                </>
              )}
            </div>
          ) : entry === 'prepare' ? (
            <div style={fadeUpStyle(0.4)} className="space-y-5 text-center">
              <p className="text-slate-500 text-sm font-light">Before your next coaching conversation —</p>
              <p style={SERIF} className="text-slate-100 text-3xl sm:text-4xl font-light leading-snug">
                What do you want to bring forward?
              </p>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                What has shifted? What remains unresolved? What deserves deeper exploration?
              </p>
            </div>
          ) : returning ? (
            <div style={fadeUpStyle(0.4)} className="space-y-5 text-center">
              <p className="text-slate-500 text-sm font-light">Last time you chose this practice:</p>
              <p style={SERIF} className="text-slate-300 text-xl font-light italic leading-relaxed">
                {priorPractice}
              </p>
              <p style={SERIF} className="text-slate-100 text-3xl sm:text-4xl font-light leading-snug">What happened?</p>
            </div>
          ) : (
            <h1 style={{ ...SERIF, ...fadeUpStyle(0.4) }} className="text-center text-slate-100 text-3xl sm:text-[2.75rem] font-light leading-snug">
              Where&apos;s your attention right now?
            </h1>
          )}

          <div style={fadeUpStyle(0.65)} className="space-y-8">
            <textarea
              aria-label={returning ? 'What actually happened' : 'Where your attention is right now'}
              className="w-full bg-transparent border-b border-slate-600/70 text-slate-100 text-lg font-light leading-relaxed resize-none focus:outline-none focus:border-[#c9a35e]/50 placeholder:text-slate-600 py-3 text-center transition-colors"
              rows={2}
              placeholder={
                entry === 'lived' || (returning && !entry)
                  ? 'What actually happened…'
                  : 'In your own words…'
              }
              value={arrivalAnswer}
              onChange={e => setArrivalAnswer(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  beginFromThreshold();
                }
              }}
            />
            <div className="text-center">
              <button
                onClick={beginFromThreshold}
                disabled={!arrivalAnswer.trim() || working}
                className="inline-block border border-[#c9a35e]/30 text-[#c9a35e] hover:border-[#c9a35e]/70 hover:bg-[#c9a35e]/5 rounded-full px-10 py-3.5 text-sm tracking-[0.22em] uppercase font-light transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Begin
              </button>
            </div>

            {/* Three ways in — quiet, equal. Dictate & Upload fill the draft above;
                Discuss skips the draft and starts the conversation directly. */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-x-4 text-sm font-light">
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={!micSupported}
                  aria-pressed={micListening}
                  aria-label="Dictate — speak your answer aloud and it is transcribed into your draft"
                  className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    micListening ? 'text-amber-200' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {micListening ? 'Listening…' : 'Dictate'}
                </button>
                <span aria-hidden className="text-slate-700">·</span>
                <label
                  aria-label="Upload — bring a .txt or .md note into your draft"
                  className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                >
                  Upload
                  <input
                    type="file"
                    accept=".txt,.md,text/plain,text/markdown"
                    onChange={handleBringFile}
                    className="hidden"
                  />
                </label>
                <span aria-hidden className="text-slate-700">·</span>
                <button
                  type="button"
                  onClick={beginDiscussion}
                  aria-label="Discuss — start talking it through with MAIA without composing an answer first"
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Discuss
                </button>
              </div>
              <p className="text-center text-slate-600 text-xs font-light leading-relaxed">
                speak it once · bring a note · talk it through
              </p>
            </div>
            {error && (
              <p role="alert" className="text-center text-red-400 text-xs font-light">{error}</p>
            )}
            {bringTruncated && (
              <p className="text-center text-slate-500 text-xs font-light">Brought in — trimmed to fit.</p>
            )}
          </div>

          <div style={fadeUpStyle(0.9)} className="space-y-3 pt-4 text-center">
            <button
              onClick={() => setShowFrame(v => !v)}
              className="text-slate-600 hover:text-slate-400 text-xs underline underline-offset-4 transition-colors"
            >
              {showFrame ? 'Hide' : 'What is this space?'}
            </button>
            {showFrame && (
              <div className="text-left text-slate-400 text-sm leading-relaxed whitespace-pre-line font-light italic border-l-2 border-slate-800 pl-4">
                {OPENING_FRAME}
              </div>
            )}
            <p className="text-slate-500 text-xs font-light leading-relaxed">
              What you carry stays private in your own field. Sharing with your practitioner is a separate, explicit choice — off by default.
            </p>
            {/* Per-room trust copy (ruling 2026-07-13) — claims scoped to THIS
                environment's store paths, all true by construction of the
                field-note and position routes. */}
            <div className="text-left pt-2">
              <RoomTrustCopy
                holds="A live conversation, and — at its end — only what you explicitly choose to carry into your field: threads, a practice, an offering, a question."
                doesNotHold="Your field receives nothing you didn't choose. No categories, no elemental scores, no grades — and dismissing anything writes nothing at all."
                whoSees="The conversation is yours. What you carry is visible to your practitioner only thread-by-thread, only when you explicitly mark it — never by default."
                control="Keep, revise, discard, or split every proposal. If you're in a program, confirm or restate your position in your own words, or depart — departure erases it entirely."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // — Arrival: Ways to Begin —
  if (roomPhase === 'arrival') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-10">
        <div className="flex justify-center">
          <RoomHoloflower mono motionState="idle" proposedElement={null} confirmedElements={[]} size={mandalaSize} />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400">Vision Studio</p>
          <h1 className="text-lg font-light text-slate-200">{phaseLabel}</h1>
        </div>

        <div className="space-y-1">
          <p className="text-slate-300 text-base font-light leading-relaxed">Every practitioner begins differently.</p>
          <p className="text-slate-500 text-sm font-light leading-relaxed">Choose whatever feels most natural today.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setGuided(false); setRoomPhase('conversation'); }}
            className="w-full text-left border border-slate-800 rounded-lg px-5 py-4 hover:border-slate-600 hover:bg-slate-900/40 transition-colors"
          >
            <p className="text-slate-200 text-sm font-light">Begin in your own words</p>
            <p className="text-slate-500 text-xs font-light mt-1">Just start — no prompt, no structure.</p>
          </button>

          <button
            onClick={() => { setGuided(true); setRoomPhase('conversation'); }}
            className="w-full text-left border border-slate-800 rounded-lg px-5 py-4 hover:border-slate-600 hover:bg-slate-900/40 transition-colors"
          >
            <p className="text-slate-200 text-sm font-light">Begin with a question</p>
            <p className="text-slate-500 text-xs font-light mt-1">A place to start, at your own pace.</p>
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowFrame(v => !v)}
            className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-4 transition-colors"
          >
            {showFrame ? 'Hide' : 'What is this space?'}
          </button>
          {showFrame && (
            <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line font-light italic border-l-2 border-slate-800 pl-4">
              {OPENING_FRAME}
            </div>
          )}
        </div>

        <div className="border-t border-slate-900 pt-4 text-slate-600 text-xs font-light leading-relaxed">
          The authority for meaning stays with you. What you carry stays private in your own field; sharing a thread with your practitioner is a separate, explicit choice — off by default. Never the conversation, never a record of who you are.
        </div>
      </div>
    );
  }

  // — Practice: the heart of the loop. One practice. One experiment. One commitment. —
  if (roomPhase === 'practice') {
    const suggestedPractices = proposed.filter(t => t.kind === 'practice' && !revising[t.title]);
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{roomTitle}</p>
          <h2 className="text-slate-200 text-lg font-light">Now what will you actually live?</h2>
          <p className="text-slate-500 text-sm font-light mt-2">One practice. One experiment. One commitment. Not ten.</p>
        </div>

        {suggestedPractices.length > 0 && (
          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-widest">Practices that surfaced</p>
            {suggestedPractices.map((t, i) => (
              <button
                key={i}
                onClick={() => setPracticeDraft(t.title)}
                className="block w-full text-left text-slate-400 hover:text-slate-200 text-sm font-light border-l-2 border-slate-800 hover:border-slate-600 pl-3 py-1 transition-colors"
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <textarea
            className="w-full bg-transparent border-b border-slate-700 text-slate-200 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-slate-500 placeholder:text-slate-700 py-2"
            rows={2}
            placeholder="In your own words — what will you live between now and next time?"
            value={practiceDraft}
            onChange={e => setPracticeDraft(e.target.value)}
          />
          {practiceDraft.trim() && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sharePractice}
                onChange={e => setSharePractice(e.target.checked)}
                className="accent-slate-300 w-4 h-4"
              />
              <span className="text-slate-300 text-xs font-light">Share with your practitioner</span>
            </label>
          )}
        </div>

        {error && <p role="alert" className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-4">
          <button
            onClick={commitPractice}
            disabled={saving || !practiceDraft.trim()}
            className="text-[#c9a35e] hover:text-[#fff2ab] text-sm underline underline-offset-4 transition-colors disabled:opacity-30"
          >
            {saving ? 'Saving…' : 'Carry this practice'}
          </button>
          <button
            onClick={() => setRoomPhase('offering')}
            disabled={saving}
            className="text-slate-600 hover:text-slate-400 text-sm underline underline-offset-4 transition-colors"
          >
            Not today
          </button>
        </div>

        <p className="text-slate-700 text-xs font-light">
          When you return, the room will begin from this practice — not from the beginning.
        </p>
      </div>
    );
  }

  // — Offering: optional. The movement from flourishing into contribution. —
  if (roomPhase === 'offering') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{roomTitle}</p>
          <p className="text-slate-500 text-sm font-light">One more — only if it feels right. This one is optional.</p>
        </div>

        <p className="text-slate-300 text-base font-light leading-relaxed">
          What would you enjoy making available to others at this point in your life?
        </p>

        <div className="space-y-3">
          <textarea
            className="w-full bg-transparent border-b border-slate-700 text-slate-200 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-slate-500 placeholder:text-slate-700 py-2"
            rows={2}
            placeholder="Nothing is required here…"
            value={offeringDraft}
            onChange={e => setOfferingDraft(e.target.value)}
          />
          {offeringDraft.trim() && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shareOffering}
                onChange={e => setShareOffering(e.target.checked)}
                className="accent-slate-300 w-4 h-4"
              />
              <span className="text-slate-300 text-xs font-light">Share with your practitioner</span>
            </label>
          )}
        </div>

        {error && <p role="alert" className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-4">
          <button
            onClick={commitOffering}
            disabled={saving || !offeringDraft.trim()}
            className="text-[#c9a35e] hover:text-[#fff2ab] text-sm underline underline-offset-4 transition-colors disabled:opacity-30"
          >
            {saving ? 'Saving…' : 'Offer it'}
          </button>
          <button
            onClick={() => setRoomPhase('closed')}
            disabled={saving}
            className="text-slate-600 hover:text-slate-400 text-sm underline underline-offset-4 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // — Closed: session complete —
  if (roomPhase === 'closed') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-6">
        <p className="text-xs uppercase tracking-widest text-slate-400">{roomTitle}</p>
        {savedPractice && (
          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-widest">The practice you chose</p>
            <p className="text-slate-200 text-base font-light border-l-2 border-slate-600 pl-4 leading-relaxed">
              {savedPractice}
            </p>
            <p className="text-slate-500 text-sm font-light">
              When you return, we'll begin from what happened.
            </p>
          </div>
        )}
        {(authored.length > 0 || !savedPractice) && (
          <p className="text-slate-300 font-light text-base leading-relaxed">
            {authored.length > 0
              ? `${authored.length} thread${authored.length === 1 ? '' : 's'} carried into your field.`
              : 'Nothing carried — that is a faithful outcome too.'}
          </p>
        )}
        {authored.length > 0 && (
          <ul className="space-y-2">
            {authored.map((t, i) => (
              <li key={i} className="text-slate-400 text-sm font-light border-l-2 border-slate-700 pl-3">
                {t.title}
              </li>
            ))}
          </ul>
        )}
        {/* The off-ramp is the room's telos: the exit door leads OUT — into the
            member's own field and back into their life — never back into more
            room. ("The room exists to return people to their lives," 2026-07-10.) */}
        <p className="text-slate-500 text-sm font-light">
          Take this back with you. The room will be here when it&apos;s been lived.
        </p>
        <div className="flex items-center gap-6">
          <a
            href={`/now-what/field${fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : ''}`}
            className="text-[#c9a35e] hover:text-[#fff2ab] text-base underline underline-offset-4 transition-colors"
          >
            See your field
          </a>
          <button
            type="button"
            onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
            className="text-slate-600 hover:text-slate-400 text-sm underline underline-offset-4 transition-colors"
          >
            Begin again
          </button>
        </div>
      </div>
    );
  }

  // — Proposal: listen-back + authorship —
  if (roomPhase === 'proposal') {
    // Now What? presents what surfaced in four categories (themes / questions alive /
    // practices / open) — organized as views over what was said, never conclusions.
    const kindRank = (t: ProposedThread) => THREAD_KIND_HEADINGS.findIndex(h => h.kind === (t.kind ?? 'theme'));
    const orderedProposed = nowWhat ? [...proposed].sort((a, b) => kindRank(a) - kindRank(b)) : proposed;
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">{roomTitle}</p>
          <p className="text-slate-400 text-sm font-light">{nowWhat ? 'What surfaced' : `${phaseLabel} — What surfaced`}</p>
        </div>

        <div className="text-slate-400 text-sm font-light leading-relaxed border-l-2 border-slate-700 pl-4">
          {CLOSURE_QUESTION}
        </div>

        {proposed.length === 0 ? (
          degraded ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm font-light italic">
                I couldn&apos;t quite gather that this time — that&apos;s on me, not you. Try listening back again, or name something yourself below.
              </p>
              <button
                type="button"
                onClick={listenBack}
                disabled={working}
                className="text-[#c9a35e] hover:text-[#fff2ab] text-sm underline underline-offset-4 transition-colors disabled:opacity-30"
              >
                {working ? 'Listening…' : 'Try listening back again'}
              </button>
            </div>
          ) : (
            <p className="text-slate-500 text-sm font-light italic">
              Nothing clear enough to propose — that is a faithful outcome. You may name something yourself below.
            </p>
          )
        ) : (
          <div className="space-y-6">
            {!nowWhat && <p className="text-slate-500 text-xs uppercase tracking-widest">Threads MAIA heard returning</p>}
            {orderedProposed.map((t, i, arr) => {
              const rev = revising[t.title];
              const kept = authored.some(a => a.title === t.title);
              const tKind = t.kind ?? 'theme';
              const showHeading = nowWhat && (i === 0 || (arr[i - 1].kind ?? 'theme') !== tKind);
              const kindHeading = THREAD_KIND_HEADINGS.find(h => h.kind === tKind)?.heading ?? '';
              return (
                <div key={i} className="space-y-3">
                  {showHeading && (
                    <p className="text-slate-500 text-xs uppercase tracking-widest pt-1">{kindHeading}</p>
                  )}
                  <div className="space-y-2 border-l-2 border-slate-700 pl-4">
                  {rev !== undefined ? (
                    rev === '' ? (
                      <p className="text-slate-600 text-sm line-through">{t.title}</p>
                    ) : (
                      <input
                        className="bg-transparent border-b border-slate-600 text-slate-200 text-sm w-full focus:outline-none"
                        value={rev}
                        onChange={e => setRevising(r => ({ ...r, [t.title]: e.target.value }))}
                      />
                    )
                  ) : (
                    <p className={`text-sm font-light ${kept ? 'text-slate-200' : 'text-slate-400'}`}>
                      {t.title}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs font-light leading-relaxed">{t.reflection}</p>
                  <div className="flex gap-3 text-xs">
                    {rev === undefined && !kept && (
                      <>
                        <button
                          onClick={() => { handleDecision(t, 'keep'); }}
                          className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
                        >keep</button>
                        <button
                          onClick={() => setRevising(r => ({ ...r, [t.title]: t.title }))}
                          className="text-slate-500 hover:text-slate-300 underline underline-offset-2"
                        >revise</button>
                        <button
                          onClick={() => setRevising(r => ({ ...r, [t.title]: '' }))}
                          className="text-slate-600 hover:text-slate-400 underline underline-offset-2"
                        >leave</button>
                      </>
                    )}
                    {kept && <span className="text-slate-500 italic">kept</span>}
                    {rev === '' && (
                      <button
                        onClick={() => setRevising(r => { const n = { ...r }; delete n[t.title]; return n; })}
                        className="text-slate-600 hover:text-slate-400 underline underline-offset-2"
                      >undo</button>
                    )}
                    {rev !== undefined && rev !== '' && (
                      <button
                        onClick={() => { handleDecision(t, 'revise', rev); }}
                        className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
                      >keep revised</button>
                    )}
                  </div>
                  {/* Share toggle — only shown when thread is carried (kept or carry-revised) */}
                  {(kept || (rev !== undefined && rev !== '' && authored.some(a => a.title === rev))) && (
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={!!shared[rev !== undefined && rev !== '' ? rev : t.title]}
                        onChange={e => {
                          const key = rev !== undefined && rev !== '' ? rev : t.title;
                          setShared(s => ({ ...s, [key]: e.target.checked }));
                        }}
                        className="accent-slate-300 w-4 h-4"
                      />
                      <span className="text-slate-300 text-xs font-light">Share with your practitioner</span>
                    </label>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-slate-500 text-xs uppercase tracking-widest">Something of your own</p>
          <input
            className="bg-transparent border-b border-slate-700 text-slate-300 text-sm w-full focus:outline-none focus:border-slate-500 placeholder:text-slate-700 py-1"
            placeholder="Name a thread that is genuinely yours..."
            value={newThread}
            onChange={e => setNewThread(e.target.value)}
          />
          {newThread.trim() && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newThreadIsQuestion}
                  onChange={e => setNewThreadIsQuestion(e.target.checked)}
                  className="accent-slate-300 w-4 h-4"
                />
                <span className="text-slate-300 text-xs font-light">A question I&rsquo;m living</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!shared[newThread.trim()]}
                  onChange={e => setShared(s => ({ ...s, [newThread.trim()]: e.target.checked }))}
                  className="accent-slate-300 w-4 h-4"
                />
                <span className="text-slate-300 text-xs font-light">Share with your practitioner</span>
              </label>
            </>
          )}
        </div>

        {error && <p role="alert" className="text-red-400 text-xs">{error}</p>}

        <div className="border-t border-slate-900 pt-4 text-slate-600 text-xs font-light leading-relaxed space-y-1">
          <p>What you keep enters your own Living Field — private by default.</p>
          <p>Sharing a thread with your practitioner is a separate choice, per thread; nothing is shared unless you check it.</p>
          <p>Only what you authored or affirmed. Not a record of this conversation. Nothing the system concluded about you.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => carry(collectPayload())}
            disabled={saving}
            className="text-[#c9a35e] hover:text-[#fff2ab] text-sm underline underline-offset-4 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Keep what I chose'}
          </button>
          <button
            onClick={() => carry({ proposals: [], created: [] })}
            className="text-slate-600 hover:text-slate-400 text-sm underline underline-offset-4 transition-colors"
          >
            Leave without keeping
          </button>
        </div>
      </div>
    );
  }

  // — Conversation: the room, recomposed. The mandala anchors the vertical axis; —
  // — the conversation flows beneath it in a comfortable measure. —
  return (
    <div className="relative flex flex-col h-full max-w-[46rem] mx-auto w-full">
      <style>{NW_FADE_KEYFRAMES}</style>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,164,110,0.06),transparent_70%)]" />
      <div className="relative px-4 pt-8 pb-4 flex flex-col items-center gap-3">
        <div className={`relative ${micListening ? 'room-mic-active' : ''}`}>
          <RoomHoloflower

            mono
            motionState={roomMotion}
            proposedElement={cellCandidate?.element ?? null}
            confirmedElements={confirmedElements}
            size={mandalaSize}
          />
        </div>
        <div className="text-center">
          <p className={`text-xs uppercase tracking-[0.35em] ${nowWhat ? 'text-[#c9a35e]/80' : 'text-slate-500'}`}>{roomTitle}</p>
          {!nowWhat && <p className="text-slate-400 text-sm font-light">{phaseLabel}</p>}
        </div>
        {turns.length >= 4 && (
          <button
            onClick={listenBack}
            disabled={working}
            className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2 transition-colors disabled:opacity-40"
          >
            Keep — listen back
          </button>
        )}
        <style jsx>{`
          .room-mic-active::after {
            content: '';
            position: absolute;
            inset: -10px;
            border-radius: 9999px;
            border: 1px solid rgba(251, 191, 36, 0.35);
            animation: room-mic-pulse 1.8s ease-in-out infinite;
            pointer-events: none;
          }
          @keyframes room-mic-pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.04); }
          }
        `}</style>
      </div>

      {guided && turns.length === 0 && (
        <div className="relative px-4 pb-6 border-b border-slate-800/70 text-center">
          <p style={SERIF} className="text-slate-100 text-xl font-light leading-relaxed">
            {openingQuestion || "No need to have it fully formed — what's stirring? We can talk it through."}
          </p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <div
              key={i}
              style={{
                ...(t.role === 'assistant' ? SERIF : {}),
                opacity: 0,
                animation: 'nwFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              }}
              className={
                t.role === 'user'
                  ? 'text-slate-400 text-[15px] leading-relaxed font-light'
                  : 'text-slate-100 text-[17px] leading-[1.85] font-light'
              }
            >
              {t.content}
            </div>
          ))}
          {working && (
            <div
              key="working"
              style={{ ...SERIF, opacity: 0, animation: 'nwFadeUp 0.4s ease forwards' }}
              className="text-slate-400 text-base font-light italic"
              aria-live="polite"
            >
              <span className="sr-only">MAIA is responding…</span>
              <span aria-hidden="true">…</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {cellCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 border-t border-slate-900 space-y-2"
        >
          <p className="text-slate-400 text-sm font-light italic">
            This feels like {ELEMENT_FEELING_LABEL[cellCandidate.element]}. Does that feel true for you?
          </p>
          {!showElementPicker ? (
            <div className="flex gap-4 text-xs">
              <button
                onClick={confirmCandidate}
                className="text-slate-300 hover:text-slate-100 underline underline-offset-2 transition-colors"
              >
                Feels true
              </button>
              <button
                onClick={dismissCandidate}
                className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
              >
                Not quite
              </button>
              <button
                onClick={() => setShowElementPicker(true)}
                className="text-slate-600 hover:text-slate-400 underline underline-offset-2 transition-colors"
              >
                It&apos;s something else
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 text-xs">
              {ALL_ELEMENTS.map(el => (
                <button
                  key={el}
                  onClick={() => chooseElementInstead(el)}
                  className="text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
                >
                  {ELEMENT_FEELING_LABEL[el]}
                </button>
              ))}
            </div>
          )}
          <p className="text-slate-700 text-xs font-light">A lens you can correct — never a verdict.</p>
        </motion.div>
      )}

      {error && (
        <div role="alert" className="px-4 py-2 text-red-400 text-xs">{error}</div>
      )}

      {showBring && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 border-t border-slate-900 space-y-2"
        >
          <p className="text-slate-500 text-xs font-light">
            Bring something with you — a journal page, a note, anything alive.
          </p>
          <textarea
            className="w-full bg-transparent border border-slate-800 rounded-lg text-slate-300 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-slate-600 placeholder:text-slate-700 p-3"
            rows={4}
            placeholder="Paste it here…"
            value={bringText}
            onChange={e => setBringText(e.target.value)}
          />
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => applyBroughtText(bringText)}
              disabled={!bringText.trim()}
              className="text-slate-300 hover:text-slate-100 underline underline-offset-2 transition-colors disabled:opacity-30"
            >
              Bring this in
            </button>
            <button
              onClick={() => bringFileInputRef.current?.click()}
              className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              Choose a .txt or .md file
            </button>
            <button
              onClick={() => { setShowBring(false); setBringText(''); }}
              className="text-slate-600 hover:text-slate-400 underline underline-offset-2 transition-colors"
            >
              Never mind
            </button>
          </div>
          <input
            ref={bringFileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={handleBringFile}
            className="hidden"
          />
          <p className="text-slate-700 text-xs font-light">
            Stays on your device — nothing uploads. You review and edit before it's sent.
          </p>
        </motion.div>
      )}

      {bringTruncated && (
        <div className="px-4 pt-2 text-slate-600 text-xs font-light">
          That was long — I brought in the first {BRING_CHAR_CAP.toLocaleString()} characters. You're welcome to trim or continue it.
        </div>
      )}

      <div className="px-4 py-4 border-t border-slate-800">
        <textarea
          autoFocus
          aria-label="Your message"
          className="w-full bg-transparent text-slate-100 text-base font-light leading-relaxed resize-none focus:outline-none placeholder:text-slate-500"
          placeholder="Say something…"
          rows={3}
          value={draft}
          onChange={e => {
            setDraft(e.target.value);
            if (!working) setRoomMotion(e.target.value ? 'listening' : 'idle');
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendTurn(draft);
            }
          }}
        />
        <div className="flex flex-wrap justify-between items-center mt-3 gap-3">
          <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
            <span className="text-slate-500 text-xs hidden sm:inline pt-0.5">Enter to send · Shift+Enter for newline</span>
            {/* YPO-grade rule (founder, 2026-07-13): a busy CEO understands
                every action in three seconds. Function words lead; the
                doctrine language is flavor, never interface. The captions
                below are the ruling's exact words — do not "clean up" either
                gesture back to the doctrine phrase alone: the founder, twice
                while informed, could not find keeping when it read that way. */}
            <div className="flex flex-col items-start gap-0.5">
              <button
                onClick={() => setShowBring(v => !v)}
                className="text-slate-400 hover:text-slate-200 text-sm underline underline-offset-2 transition-colors"
              >
                Bring something with you
              </button>
              <span className="text-slate-400 text-xs font-light">
                Start this session from a saved thread or a note.
              </span>
            </div>
            {/* Exit symmetric to the entry gesture: the threshold out of the
                conversation and into the keep → practice → life sequence. */}
            {turns.length >= 2 && (
              <div className="flex flex-col items-start gap-0.5">
                <button
                  onClick={listenBack}
                  disabled={working}
                  className="text-slate-400 hover:text-slate-200 text-sm underline underline-offset-2 transition-colors disabled:opacity-30"
                >
                  Keep — take something back with you
                </button>
                <span className="text-slate-400 text-xs font-light">
                  End the session. Save what matters. Pick a practice. Name a question.
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                onClick={toggleSpeakReplies}
                title={speakReplies ? 'Stop speaking replies' : 'Hear the room'}
                aria-pressed={speakReplies}
                className={`rounded-full border px-3 py-1.5 text-sm font-light transition-colors ${
                  speakReplies
                    ? 'border-amber-400/60 text-amber-200 hover:border-amber-300'
                    : 'border-slate-600 text-slate-300 hover:border-slate-400 hover:text-slate-100'
                }`}
              >
                {speakReplies ? 'Speaking' : 'Hear the room'}
              </button>
            )}
            {micSupported && (
              <button
                onClick={toggleMic}
                title="Speak instead of typing"
                aria-pressed={micListening}
                className={`rounded-full border px-3 py-1.5 text-sm font-light transition-colors ${
                  micListening
                    ? 'border-amber-400/60 text-amber-200 hover:border-amber-300'
                    : 'border-slate-600 text-slate-300 hover:border-slate-400 hover:text-slate-100'
                }`}
              >
                {micListening ? 'Listening…' : 'Speak'}
              </button>
            )}
            <button
              onClick={() => sendTurn(draft)}
              disabled={working || !draft.trim()}
              className="rounded-full border border-[#c9a35e]/30 px-6 py-1.5 text-sm tracking-[0.14em] uppercase font-light text-[#c9a35e] transition-all duration-300 hover:border-[#c9a35e]/70 hover:bg-[#c9a35e]/5 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              {working ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
