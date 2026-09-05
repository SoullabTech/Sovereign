'use client';

/**
 * BUILD-07E — talking with MAIA about ONE thing she noticed.
 *
 * IT OPENS UNDER THE OBSERVATION, carrying that anchor. A generic composer
 * beside the reading would make the writer restate what they already indicated
 * by pointing — the same reason `canvas/AskMaia` exists in the shape it does.
 *
 * THE SPINE IS SHARED, THE WORDS ARE NOT. This posts through the same
 * `askClient.ask` to the same endpoint, and the server keeps the anchor and the
 * reading the thread was opened on. What differs is the epistemic vocabulary:
 * the structure lane reasons in five staleness dimensions, this lane reasons in
 * one three-state answer — current, superseded, unknown — because that is the
 * question a writer actually has about something MAIA noticed. Rendering the
 * structure lane's copy here would say true things about the wrong object.
 *
 * IT SAYS WHAT IT CANNOT DO, ONCE, PLAINLY. Not as a disclaimer band but as the
 * one line that makes the room safe to speak in: nothing here changes the book,
 * and nothing here changes her reading.
 *
 * SUPERSEDED IS SHOWN, NEVER HIDDEN AND NEVER SILENT (founder ruling Q3). The
 * thread opens; the room says the observation was made against an earlier state
 * before the writer speaks, so they are never left thinking it is current.
 *
 * THE ROOM COMPUTES NO EPISTEMIC STATE. `location` arrives from the server,
 * which measured it against frozen digests. A surface that derived it here
 * would be claiming a measurement it has no evidence to make.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ask, type AskThreadView } from '@/lib/writersStudio/askClient';
import type { CurrentLocation } from '@/lib/manuscript/development/resolve';
import { PRESS } from '../pressTheme';

const REFUSAL_SAYS: Record<string, string> = {
  unreachable: 'MAIA could not be reached. Nothing was lost — your question is held here.',
  empty_answer: 'MAIA returned nothing. Try asking again.',
  anchor_requires_reading: 'The reading this observation belongs to could not be found.',
  anchor_reading_mismatch: 'This points at a different reading than the one open.',
  anchor_unresolved: 'That observation could not be found in this reading.',
  question_too_long: 'That is longer than a question this room can carry.',
  canonical_unmeasurable: 'The Work could not be measured just now, so this conversation cannot open yet.',
  unauthenticated: 'You are signed out. Sign in and your question will go through.',
  not_found: 'That reading could not be found.',
};

/**
 * Where this observation stands, in the writer's terms.
 *
 * `current` RETURNS NULL DELIBERATELY. A room that narrates its own freshness
 * every turn is noise, and the absence of a line IS the "nothing moved" answer
 * — the same ruling `AskMaia.stalenessLine` makes.
 */
function locationLine(l: CurrentLocation | null): string | null {
  if (!l) return null;
  if (l.state === 'current') return null;
  if (l.state === 'unmeasured') {
    return 'Whether the material under this observation has changed could not be checked. She is speaking about what she saw.';
  }
  const moved = l.moved.map((m) => {
    switch (m.what) {
      case 'section-text': return 'the text it rests on has changed';
      case 'section-absent': return 'a section it rests on is no longer in the work';
      case 'section-order': return 'the order of those sections has changed';
      case 'structure-unit': return 'a part of your structure it rests on has changed';
      case 'structure-unit-absent': return 'a part of your structure it rests on is gone';
      case 'structure-topology': return 'your structure has changed';
    }
  });
  /* Deduplicated: three moved sections should read as one fact about the Work,
     not as the same sentence three times. */
  const said = [...new Set(moved)].join('; ');
  return `This observation was made against an earlier state of the work — ${said}. You can still talk about it; she has not reread the work.`;
}

export default function ObservationDialogue({
  manuscriptId, readingId, observationKey, about, superseded, onClose,
}: {
  manuscriptId: string;
  readingId: string;
  observationKey: string;
  /** What she noticed, in her words. Shown so the room is anchored to it. */
  about: string;
  /** From the reading the room already rendered, so the warning precedes the first turn. */
  superseded: boolean;
  onClose: () => void;
}) {
  const [thread, setThread] = useState<AskThreadView | null>(null);
  /* HELD SEPARATELY FROM `thread`. A failed answer still has a threadId — the
     author's turn was persisted before the model was called — and a retry that
     forgot it would open a SECOND thread holding the same question. */
  const [threadId, setThreadId] = useState<string | null>(null);
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = useCallback(async () => {
    const q = draft.trim();
    if (!q || busy) return;
    setBusy(true);
    setRefusal(null);
    const r = await ask({
      manuscriptId,
      question: q,
      ...(threadId
        ? { threadId }
        : { anchor: { on: 'observation' as const, readingId, observationKey } }),
    });
    if (r.ok) {
      setThreadId(r.threadId);
      setThread(r.thread);
      setLocation(r.location ?? null);
      setDraft('');
    } else {
      /* THE QUESTION IS NOT CLEARED ON A REFUSAL. The words are the writer's and
         the room does not eat them because the wire failed. */
      setRefusal(r.refusal);
      if (r.location) setLocation(r.location);
      if (r.threadId) setThreadId(r.threadId);
    }
    setBusy(false);
  }, [draft, busy, manuscriptId, readingId, observationKey, threadId]);

  /* Before the first turn the room has no measured location, so it falls back to
     what the reading itself already said. Shown as the reading's claim, not as a
     measurement this room made. */
  const line = locationLine(location)
    ?? (superseded && !thread
      ? 'This observation was made against an earlier state of the work. You can still talk about it; she has not reread the work.'
      : null);

  return (
    <div
      data-observation-dialogue={observationKey}
      className="mt-4 border rounded-sm p-4"
      style={{ borderColor: PRESS.ruleSoft }}
    >
      <p className="text-[10.5px] tracking-[0.15em] uppercase opacity-45">talking about</p>
      <p className="text-[13.5px] leading-relaxed opacity-80 mt-1" style={{ whiteSpace: 'pre-wrap' }}>
        {about}
      </p>

      {/* SAID ONCE, AT THE TOP. The writer needs to know before they speak. */}
      <p className="text-[12px] leading-relaxed opacity-55 mt-2" data-dialogue-bounds>
        Nothing said here changes your work or her reading. She is talking about what she noticed
        then, and has not reread the work.
      </p>

      {line && (
        <p className="text-[12px] leading-relaxed opacity-70 mt-2"
          style={{ color: PRESS.accent }} data-dialogue-location>
          {line}
        </p>
      )}

      {thread && thread.turns.length > 0 && (
        <div className="mt-4 space-y-3" data-dialogue-turns>
          {thread.turns.map((t) => (
            <div key={t.index} data-dialogue-turn={t.speaker}>
              <p className="text-[10.5px] tracking-[0.15em] uppercase opacity-40">
                {t.speaker === 'author' ? 'you' : 'MAIA'}
              </p>
              <p className="text-[14.5px] leading-relaxed mt-0.5" style={{ whiteSpace: 'pre-wrap' }}>
                {t.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {refusal && (
        <p className="text-[12px] leading-relaxed mt-3 opacity-80" data-dialogue-refusal>
          {REFUSAL_SAYS[refusal] ?? `That did not go through (${refusal}).`}
        </p>
      )}

      <textarea
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); }
        }}
        placeholder={thread ? 'say more…' : 'What made you notice this?'}
        data-dialogue-resuming={threadId ?? undefined}
        rows={3}
        aria-label="talk with MAIA about this observation"
        className="w-full mt-3 p-2 text-[14px] rounded-sm"
        style={{
          background: 'rgba(0,0,0,0.18)', color: PRESS.text,
          border: `1px solid ${PRESS.ruleSoft}`, font: 'inherit', resize: 'vertical',
        }}
      />

      <div className="mt-2 flex gap-3 items-center">
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || !draft.trim()}
          data-dialogue-send
          className="border rounded-sm px-2 py-[2px] text-[12px]"
          style={{
            borderColor: PRESS.ruleSoft,
            cursor: busy || !draft.trim() ? 'default' : 'pointer',
            opacity: busy || !draft.trim() ? 0.4 : 1,
          }}
        >
          {busy ? 'asking…' : 'ask'}
        </button>
        <button type="button" onClick={onClose} data-dialogue-close
          className="text-[12px] opacity-55" style={{ cursor: 'pointer' }}>
          done
        </button>
      </div>
    </div>
  );
}
