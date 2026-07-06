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

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import { RoomHoloflower, type RoomMotionState, type SpiralElement } from '@/components/maia/vision-studio/RoomHoloflower';

type Role = 'user' | 'assistant';
interface Turn { role: Role; content: string; }
type ThreadKind = 'theme' | 'question' | 'practice' | 'open';
interface ProposedThread { title: string; reflection: string; groundedIn: string; kind?: ThreadKind; }
type Decision = 'keep' | 'revise' | 'discard' | 'split';
interface AuthoredThread { title: string; origin: 'maia_proposed' | 'member_authored'; }
interface CarryPayload {
  proposals: { title: string; decision: Decision; revisedTitle?: string; children?: string[]; shareWithPractitioner?: boolean }[];
  created: { title: string; shareWithPractitioner: boolean }[];
}
interface CellCandidate {
  element: SpiralElement;
  phase: 1 | 2 | 3;
  confidence: number;
  source: 'system_inferred';
}

const ELEMENT_FEELING_LABEL: Record<SpiralElement, string> = {
  Fire: 'Fire awakening',
  Water: 'Water moving',
  Earth: 'Earth settling',
  Air: 'Air clarifying',
  Aether: 'something wider gathering',
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
}

/**
 * Isolated reference embodiment (founder direction 2026-07-06): the Now What?
 * client experience lives in its own namespace and does not modify framework
 * surfaces. It may earn its way into shared architecture through observation.
 */
export function NowWhatRoom({ phase = 'fire_1', fieldContext }: Props) {
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
  const [guided, setGuided] = useState(true);
  const [showFrame, setShowFrame] = useState(false);
  // Per-thread sharing consent: keyed by thread title; absent = private (default).
  const [shared, setShared] = useState<Record<string, boolean>>({});
  // Now What? loop state. priorPractice = the practice committed on a previous visit
  // (drives the Return branch); practiceDraft/offeringDraft = this visit's commitments.
  const [priorPractice, setPriorPractice] = useState<string | null>(null);
  const [arrivalAnswer, setArrivalAnswer] = useState('');
  const [practiceDraft, setPracticeDraft] = useState('');
  const [sharePractice, setSharePractice] = useState(false);
  const [offeringDraft, setOfferingDraft] = useState('');
  const [shareOffering, setShareOffering] = useState(false);
  const [savedPractice, setSavedPractice] = useState<string | null>(null);
  // Welcome gate (first visit only): returnChecked flips true once return-detection
  // resolves, so the threshold never flashes before we know this is a return;
  // entered is the member's "Come in" — the welcome orients, it is never a wall.
  const [returnChecked, setReturnChecked] = useState(false);
  const [entered, setEntered] = useState(false);
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
        const res = await apiFetch(`/api/now-what/field-note?fieldContext=${encodeURIComponent(fieldContext)}`);
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const threads: { title: string; spiralogic_phase: string | null }[] = json?.threads ?? [];
          const practice = threads.find(t => t.spiralogic_phase === 'practice');
          if (practice && !cancelled) setPriorPractice(practice.title);
        }
      } catch {
        // Quiet fallback: no return context — the room simply begins fresh.
      } finally {
        if (!cancelled) setReturnChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [nowWhat, fieldContext]);

  async function callInterview(history: Turn[], mode: 'turn' | 'propose') {
    const res = await apiFetch('/api/now-what/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        mode,
        phase,
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
    draftBeforeMicRef.current = draft;

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
      setDraft(combined);
      if (!working) setRoomMotion(combined ? 'listening' : 'idle');
    };
    recognition.onerror = () => {
      setMicListening(false);
      recognitionRef.current = null;
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
    setDraft(`Something I'm bringing: ${capped}`);
    setShowBring(false);
    setBringText('');
  }

  function handleBringFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyBroughtText(String(reader.result ?? ''));
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
    setWorking(true);
    try {
      const json = await callInterview(turns, 'propose');
      setProposed(json.threads ?? []);
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
      const rev = revising[t.title];
      if (rev !== undefined) {
        if (rev === '') return { title: t.title, decision: 'discard' as Decision, shareWithPractitioner: false };
        // For a revised thread, the sharing key is the revised title the member chose.
        return { title: t.title, decision: 'revise' as Decision, revisedTitle: rev, shareWithPractitioner: !!shared[rev] };
      }
      if (authored.some(a => a.title === t.title)) return { title: t.title, decision: 'keep' as Decision, shareWithPractitioner: !!shared[t.title] };
      return { title: t.title, decision: 'discard' as Decision, shareWithPractitioner: false };
    });
    const trimmed = newThread.trim();
    const created = trimmed ? [{ title: trimmed, shareWithPractitioner: !!shared[trimmed] }] : [];
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

  // — Now What? welcome + threshold. First-visit welcome (Larry's standing frame),
  //   then one question. Return visits skip the welcome and begin from what happened. —
  if (roomPhase === 'arrival' && nowWhat) {
    // Hold a quiet beat while return-detection resolves, so a returning member
    // never sees the first-visit welcome flash ahead of the return prompt.
    if (fieldContext && !returnChecked) {
      return (
        <div className="max-w-prose mx-auto px-4 py-16 flex justify-center">
          <RoomHoloflower motionState="idle" proposedElement={null} confirmedElements={[]} size={mandalaSize} />
        </div>
      );
    }
    const returning = priorPractice !== null;

    // First visit: Larry's welcome. "Come in" is a threshold, not a wall — the
    // welcome orients and invites; it never measures, and authorship of meaning
    // stays with the member ("the growth you recognize in your own life").
    if (!returning && !entered) {
      return (
        <div className="max-w-prose mx-auto px-4 py-16 space-y-6">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Now What? · with Larry Closs</p>
          <h1 className="text-2xl font-light text-stone-100">Welcome.</h1>
          <div className="space-y-4 text-stone-300 text-base font-light leading-relaxed">
            <p>Flourishing isn't a destination. It's a practice — one you live, day by day, long after a conversation ends.</p>
            <p>This is where that practice continues.</p>
            <p>It's a place to return to between our conversations. A place to notice what you're learning, work with the questions that matter, and bring fresh experience back into the conversation.</p>
            <p className="text-stone-200">You set the rhythm.</p>
            <p className="text-stone-200">You decide what deserves your attention.</p>
            <p>Nothing here measures you or grades your progress. The only growth that matters is the growth you recognize in your own life.</p>
            <p>Think of this as our coaching continuing — carried into your real, working life, one step at a time.</p>
          </div>
          <p className="text-stone-500 text-sm font-light italic pt-2">When you're ready…</p>
          <button
            onClick={() => setEntered(true)}
            className="text-stone-100 hover:text-white text-base font-light underline underline-offset-4 transition-colors"
          >
            Come in.
          </button>
          <p className="text-stone-600 text-xs font-light pt-6 border-t border-stone-900">Larry Closs · Now What?</p>
        </div>
      );
    }

    return (
      <div className="max-w-prose mx-auto px-4 py-16 space-y-10">
        <h1 className="text-2xl font-light text-stone-100 tracking-wide">Now What?</h1>

        {returning ? (
          <div className="space-y-4">
            <p className="text-stone-400 text-sm font-light">Last time you chose this practice:</p>
            <p className="text-stone-200 text-base font-light border-l-2 border-stone-600 pl-4 leading-relaxed">
              {priorPractice}
            </p>
            <p className="text-stone-300 text-base font-light">What happened?</p>
          </div>
        ) : (
          <p className="text-stone-300 text-base font-light leading-relaxed">
            How are you entering this room today?
          </p>
        )}

        <div className="space-y-3">
          <textarea
            className="w-full bg-transparent border-b border-stone-700 text-stone-200 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-stone-500 placeholder:text-stone-700 py-2"
            rows={3}
            placeholder={returning ? 'What actually happened…' : 'In your own words…'}
            value={arrivalAnswer}
            onChange={e => setArrivalAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                beginFromThreshold();
              }
            }}
          />
          <button
            onClick={beginFromThreshold}
            disabled={!arrivalAnswer.trim()}
            className="text-stone-300 hover:text-stone-100 text-sm underline underline-offset-4 transition-colors disabled:opacity-30"
          >
            Begin
          </button>
        </div>

        <div className="space-y-3 pt-6">
          <button
            onClick={() => setShowFrame(v => !v)}
            className="text-stone-600 hover:text-stone-400 text-xs underline underline-offset-4 transition-colors"
          >
            {showFrame ? 'Hide' : 'What is this space?'}
          </button>
          {showFrame && (
            <div className="text-stone-400 text-sm leading-relaxed whitespace-pre-line font-light italic border-l-2 border-stone-800 pl-4">
              {OPENING_FRAME}
            </div>
          )}
          <p className="text-stone-700 text-xs font-light leading-relaxed">
            What you carry stays private in your own field. Sharing with your practitioner is a separate, explicit choice — off by default.
          </p>
        </div>
      </div>
    );
  }

  // — Arrival: Ways to Begin —
  if (roomPhase === 'arrival') {
    return (
      <div className="max-w-prose mx-auto px-4 py-12 space-y-10">
        <div className="flex justify-center">
          <RoomHoloflower motionState="idle" proposedElement={null} confirmedElements={[]} size={mandalaSize} />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-widest text-stone-400">Vision Studio</p>
          <h1 className="text-lg font-light text-stone-200">{phaseLabel}</h1>
        </div>

        <div className="space-y-1">
          <p className="text-stone-300 text-base font-light leading-relaxed">Every practitioner begins differently.</p>
          <p className="text-stone-500 text-sm font-light leading-relaxed">Choose whatever feels most natural today.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setGuided(false); setRoomPhase('conversation'); }}
            className="w-full text-left border border-stone-800 rounded-lg px-5 py-4 hover:border-stone-600 hover:bg-stone-900/40 transition-colors"
          >
            <p className="text-stone-200 text-sm font-light">Begin in your own words</p>
            <p className="text-stone-500 text-xs font-light mt-1">Just start — no prompt, no structure.</p>
          </button>

          <button
            onClick={() => { setGuided(true); setRoomPhase('conversation'); }}
            className="w-full text-left border border-stone-800 rounded-lg px-5 py-4 hover:border-stone-600 hover:bg-stone-900/40 transition-colors"
          >
            <p className="text-stone-200 text-sm font-light">Begin with a question</p>
            <p className="text-stone-500 text-xs font-light mt-1">A place to start, at your own pace.</p>
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowFrame(v => !v)}
            className="text-stone-500 hover:text-stone-300 text-xs underline underline-offset-4 transition-colors"
          >
            {showFrame ? 'Hide' : 'What is this space?'}
          </button>
          {showFrame && (
            <div className="text-stone-400 text-sm leading-relaxed whitespace-pre-line font-light italic border-l-2 border-stone-800 pl-4">
              {OPENING_FRAME}
            </div>
          )}
        </div>

        <div className="border-t border-stone-900 pt-4 text-stone-600 text-xs font-light leading-relaxed">
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
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{roomTitle}</p>
          <h2 className="text-stone-200 text-lg font-light">Now what will you actually live?</h2>
          <p className="text-stone-500 text-sm font-light mt-2">One practice. One experiment. One commitment. Not ten.</p>
        </div>

        {suggestedPractices.length > 0 && (
          <div className="space-y-2">
            <p className="text-stone-500 text-xs uppercase tracking-widest">Practices that surfaced</p>
            {suggestedPractices.map((t, i) => (
              <button
                key={i}
                onClick={() => setPracticeDraft(t.title)}
                className="block w-full text-left text-stone-400 hover:text-stone-200 text-sm font-light border-l-2 border-stone-800 hover:border-stone-600 pl-3 py-1 transition-colors"
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <textarea
            className="w-full bg-transparent border-b border-stone-700 text-stone-200 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-stone-500 placeholder:text-stone-700 py-2"
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
                className="accent-stone-500 w-3 h-3"
              />
              <span className="text-stone-600 text-xs font-light">Share with your practitioner</span>
            </label>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-4">
          <button
            onClick={commitPractice}
            disabled={saving || !practiceDraft.trim()}
            className="text-stone-300 hover:text-stone-100 text-sm underline underline-offset-4 transition-colors disabled:opacity-30"
          >
            {saving ? 'Saving…' : 'Carry this practice'}
          </button>
          <button
            onClick={() => setRoomPhase('offering')}
            disabled={saving}
            className="text-stone-600 hover:text-stone-400 text-sm underline underline-offset-4 transition-colors"
          >
            Not today
          </button>
        </div>

        <p className="text-stone-700 text-xs font-light">
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
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{roomTitle}</p>
          <p className="text-stone-500 text-sm font-light">One more — only if it feels right. This one is optional.</p>
        </div>

        <p className="text-stone-300 text-base font-light leading-relaxed">
          What would you enjoy making available to others at this point in your life?
        </p>

        <div className="space-y-3">
          <textarea
            className="w-full bg-transparent border-b border-stone-700 text-stone-200 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-stone-500 placeholder:text-stone-700 py-2"
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
                className="accent-stone-500 w-3 h-3"
              />
              <span className="text-stone-600 text-xs font-light">Share with your practitioner</span>
            </label>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-4">
          <button
            onClick={commitOffering}
            disabled={saving || !offeringDraft.trim()}
            className="text-stone-300 hover:text-stone-100 text-sm underline underline-offset-4 transition-colors disabled:opacity-30"
          >
            {saving ? 'Saving…' : 'Offer it'}
          </button>
          <button
            onClick={() => setRoomPhase('closed')}
            disabled={saving}
            className="text-stone-600 hover:text-stone-400 text-sm underline underline-offset-4 transition-colors"
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
        <p className="text-xs uppercase tracking-widest text-stone-400">{roomTitle}</p>
        {savedPractice && (
          <div className="space-y-2">
            <p className="text-stone-500 text-xs uppercase tracking-widest">The practice you chose</p>
            <p className="text-stone-200 text-base font-light border-l-2 border-stone-600 pl-4 leading-relaxed">
              {savedPractice}
            </p>
            <p className="text-stone-500 text-sm font-light">
              When you return, we'll begin from what happened.
            </p>
          </div>
        )}
        {(authored.length > 0 || !savedPractice) && (
          <p className="text-stone-300 font-light text-base leading-relaxed">
            {authored.length > 0
              ? `${authored.length} thread${authored.length === 1 ? '' : 's'} carried into your field.`
              : 'Nothing carried — that is a faithful outcome too.'}
          </p>
        )}
        {authored.length > 0 && (
          <ul className="space-y-2">
            {authored.map((t, i) => (
              <li key={i} className="text-stone-400 text-sm font-light border-l-2 border-stone-700 pl-3">
                {t.title}
              </li>
            ))}
          </ul>
        )}
        <p className="text-stone-500 text-sm font-light">
          The field holds what you authored. You may return to continue.
        </p>
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
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{roomTitle}</p>
          <p className="text-stone-400 text-sm font-light">{nowWhat ? 'What surfaced' : `${phaseLabel} — What surfaced`}</p>
        </div>

        <div className="text-stone-400 text-sm font-light leading-relaxed border-l-2 border-stone-700 pl-4">
          {CLOSURE_QUESTION}
        </div>

        {proposed.length === 0 ? (
          <p className="text-stone-500 text-sm font-light italic">
            Nothing clear enough to propose — that is a faithful outcome. You may name something yourself below.
          </p>
        ) : (
          <div className="space-y-6">
            {!nowWhat && <p className="text-stone-500 text-xs uppercase tracking-widest">Threads MAIA heard returning</p>}
            {orderedProposed.map((t, i, arr) => {
              const rev = revising[t.title];
              const kept = authored.some(a => a.title === t.title);
              const tKind = t.kind ?? 'theme';
              const showHeading = nowWhat && (i === 0 || (arr[i - 1].kind ?? 'theme') !== tKind);
              const kindHeading = THREAD_KIND_HEADINGS.find(h => h.kind === tKind)?.heading ?? '';
              return (
                <div key={i} className="space-y-3">
                  {showHeading && (
                    <p className="text-stone-500 text-xs uppercase tracking-widest pt-1">{kindHeading}</p>
                  )}
                  <div className="space-y-2 border-l-2 border-stone-700 pl-4">
                  {rev !== undefined ? (
                    rev === '' ? (
                      <p className="text-stone-600 text-sm line-through">{t.title}</p>
                    ) : (
                      <input
                        className="bg-transparent border-b border-stone-600 text-stone-200 text-sm w-full focus:outline-none"
                        value={rev}
                        onChange={e => setRevising(r => ({ ...r, [t.title]: e.target.value }))}
                      />
                    )
                  ) : (
                    <p className={`text-sm font-light ${kept ? 'text-stone-200' : 'text-stone-400'}`}>
                      {t.title}
                    </p>
                  )}
                  <p className="text-stone-500 text-xs font-light leading-relaxed">{t.reflection}</p>
                  <div className="flex gap-3 text-xs">
                    {rev === undefined && !kept && (
                      <>
                        <button
                          onClick={() => { handleDecision(t, 'keep'); }}
                          className="text-stone-400 hover:text-stone-200 underline underline-offset-2"
                        >carry</button>
                        <button
                          onClick={() => setRevising(r => ({ ...r, [t.title]: t.title }))}
                          className="text-stone-500 hover:text-stone-300 underline underline-offset-2"
                        >revise</button>
                        <button
                          onClick={() => setRevising(r => ({ ...r, [t.title]: '' }))}
                          className="text-stone-600 hover:text-stone-400 underline underline-offset-2"
                        >leave</button>
                      </>
                    )}
                    {kept && <span className="text-stone-500 italic">carried</span>}
                    {rev === '' && (
                      <button
                        onClick={() => setRevising(r => { const n = { ...r }; delete n[t.title]; return n; })}
                        className="text-stone-600 hover:text-stone-400 underline underline-offset-2"
                      >undo</button>
                    )}
                    {rev !== undefined && rev !== '' && (
                      <button
                        onClick={() => { handleDecision(t, 'revise', rev); }}
                        className="text-stone-400 hover:text-stone-200 underline underline-offset-2"
                      >carry revised</button>
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
                        className="accent-stone-500 w-3 h-3"
                      />
                      <span className="text-stone-600 text-xs font-light">Share with your practitioner</span>
                    </label>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-stone-500 text-xs uppercase tracking-widest">Something of your own</p>
          <input
            className="bg-transparent border-b border-stone-700 text-stone-300 text-sm w-full focus:outline-none focus:border-stone-500 placeholder:text-stone-700 py-1"
            placeholder="Name a thread that is genuinely yours..."
            value={newThread}
            onChange={e => setNewThread(e.target.value)}
          />
          {newThread.trim() && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!shared[newThread.trim()]}
                onChange={e => setShared(s => ({ ...s, [newThread.trim()]: e.target.checked }))}
                className="accent-stone-500 w-3 h-3"
              />
              <span className="text-stone-600 text-xs font-light">Share with your practitioner</span>
            </label>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="border-t border-stone-900 pt-4 text-stone-600 text-xs font-light leading-relaxed space-y-1">
          <p>What you carry enters your own Living Field — private by default.</p>
          <p>Sharing a thread with your practitioner is a separate choice, per thread; nothing is shared unless you check it.</p>
          <p>Only what you authored or affirmed. Not a record of this conversation. Nothing the system concluded about you.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => carry(collectPayload())}
            disabled={saving}
            className="text-stone-300 hover:text-stone-100 text-sm underline underline-offset-4 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Carry what I chose'}
          </button>
          <button
            onClick={() => carry({ proposals: [], created: [] })}
            className="text-stone-600 hover:text-stone-400 text-sm underline underline-offset-4 transition-colors"
          >
            Leave without carrying
          </button>
        </div>
      </div>
    );
  }

  // — Conversation: the room, recomposed. The mandala anchors the vertical axis; —
  // — the conversation flows beneath it in a comfortable measure. —
  return (
    <div className="flex flex-col h-full max-w-[46rem] mx-auto w-full">
      <div className="px-4 pt-8 pb-4 flex flex-col items-center gap-3">
        <div className={`relative ${micListening ? 'room-mic-active' : ''}`}>
          <RoomHoloflower
            motionState={roomMotion}
            proposedElement={cellCandidate?.element ?? null}
            confirmedElements={confirmedElements}
            size={mandalaSize}
          />
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-stone-500">{roomTitle}</p>
          {!nowWhat && <p className="text-stone-400 text-sm font-light">{phaseLabel}</p>}
        </div>
        {turns.length >= 4 && (
          <button
            onClick={listenBack}
            disabled={working}
            className="text-stone-500 hover:text-stone-300 text-xs underline underline-offset-2 transition-colors disabled:opacity-40"
          >
            Listen back
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

      {guided && openingQuestion && turns.length === 0 && (
        <div className="px-4 pb-6 border-b border-stone-800 text-center">
          <p className="text-stone-300 text-base font-light leading-relaxed">{openingQuestion}</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm leading-relaxed font-light ${t.role === 'user' ? 'text-stone-200' : 'text-stone-400'}`}
            >
              {t.content}
            </motion.div>
          ))}
          {working && (
            <motion.div
              key="working"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-stone-600 text-sm font-light"
            >
              …
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {cellCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 border-t border-stone-900 space-y-2"
        >
          <p className="text-stone-400 text-sm font-light italic">
            This feels like {ELEMENT_FEELING_LABEL[cellCandidate.element]}. Does that feel true for you?
          </p>
          {!showElementPicker ? (
            <div className="flex gap-4 text-xs">
              <button
                onClick={confirmCandidate}
                className="text-stone-300 hover:text-stone-100 underline underline-offset-2 transition-colors"
              >
                Feels true
              </button>
              <button
                onClick={dismissCandidate}
                className="text-stone-500 hover:text-stone-300 underline underline-offset-2 transition-colors"
              >
                Not quite
              </button>
              <button
                onClick={() => setShowElementPicker(true)}
                className="text-stone-600 hover:text-stone-400 underline underline-offset-2 transition-colors"
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
                  className="text-stone-400 hover:text-stone-200 underline underline-offset-2 transition-colors"
                >
                  {el}
                </button>
              ))}
            </div>
          )}
          <p className="text-stone-700 text-xs font-light">A lens you can correct — never a verdict.</p>
        </motion.div>
      )}

      {error && (
        <div className="px-4 py-2 text-red-400 text-xs">{error}</div>
      )}

      {showBring && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 border-t border-stone-900 space-y-2"
        >
          <p className="text-stone-500 text-xs font-light">
            Bring something with you — a journal page, a note, anything alive.
          </p>
          <textarea
            className="w-full bg-transparent border border-stone-800 rounded-lg text-stone-300 text-sm font-light leading-relaxed resize-none focus:outline-none focus:border-stone-600 placeholder:text-stone-700 p-3"
            rows={4}
            placeholder="Paste it here…"
            value={bringText}
            onChange={e => setBringText(e.target.value)}
          />
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => applyBroughtText(bringText)}
              disabled={!bringText.trim()}
              className="text-stone-300 hover:text-stone-100 underline underline-offset-2 transition-colors disabled:opacity-30"
            >
              Bring this in
            </button>
            <button
              onClick={() => bringFileInputRef.current?.click()}
              className="text-stone-500 hover:text-stone-300 underline underline-offset-2 transition-colors"
            >
              Choose a .txt or .md file
            </button>
            <button
              onClick={() => { setShowBring(false); setBringText(''); }}
              className="text-stone-600 hover:text-stone-400 underline underline-offset-2 transition-colors"
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
          <p className="text-stone-700 text-xs font-light">
            Stays on your device — nothing uploads. You review and edit before it's sent.
          </p>
        </motion.div>
      )}

      {bringTruncated && (
        <div className="px-4 pt-2 text-stone-600 text-xs font-light">
          That was long — I brought in the first {BRING_CHAR_CAP.toLocaleString()} characters. You're welcome to trim or continue it.
        </div>
      )}

      <div className="px-4 py-4 border-t border-stone-800">
        <textarea
          className="w-full bg-transparent text-stone-200 text-sm font-light leading-relaxed resize-none focus:outline-none placeholder:text-stone-700"
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
        <div className="flex justify-between items-center mt-2 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-stone-700 text-xs hidden sm:inline">Enter to send · Shift+Enter for newline</span>
            <button
              onClick={() => setShowBring(v => !v)}
              className="text-stone-600 hover:text-stone-400 text-xs underline underline-offset-2 transition-colors"
            >
              Bring something with you
            </button>
          </div>
          <div className="flex items-center gap-3">
            {speechSupported && (
              <button
                onClick={toggleSpeakReplies}
                title={speakReplies ? 'Stop speaking replies' : 'Hear the room'}
                aria-pressed={speakReplies}
                className={`text-xs underline underline-offset-2 transition-colors ${
                  speakReplies ? 'text-amber-300 hover:text-amber-200' : 'text-stone-600 hover:text-stone-400'
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
                className={`text-xs underline underline-offset-2 transition-colors ${
                  micListening ? 'text-amber-300 hover:text-amber-200' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {micListening ? 'Listening…' : 'Speak'}
              </button>
            )}
            <button
              onClick={() => sendTurn(draft)}
              disabled={working || !draft.trim()}
              className="text-stone-400 hover:text-stone-200 text-xs underline underline-offset-2 transition-colors disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
