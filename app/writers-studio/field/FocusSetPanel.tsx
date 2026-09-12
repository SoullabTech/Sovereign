'use client';

/**
 * THE FOCUS SET, as the writer meets it.
 *
 *   FOCUS · recurrence · from a reading of version 7
 *
 *   §45  ┐
 *   §56  │   five places
 *   §57  │   active target — none yet
 *   §58  │
 *   §62  ┘
 *
 * ⭐ U4 MADE VISIBLE. Five places are declared; none of them is the edit
 * target until the writer says which. The panel's most important sentence is
 * the one it says before they choose: "no place chosen yet — click one".
 *
 * ⛔ THIS PANEL CHANGES NO TEXT. Choosing a member sets local state. Asking
 * MAIA sends identities to `/api/writers-studio/focus` and reads back what she
 * said. Nothing here writes to the manuscript, and nothing here may.
 *
 * ⛔ IT DOES NOT REPAIR A MEMBER. A stale or missing place is reported in the
 * writer's language and left alone. The panel has no "fix" control because the
 * system has no standing to decide where a moved passage went.
 *
 * ── ⭐⭐ ASK MAIA ──────────────────────────────────────────────────────────
 *
 *   Focus membership is visible independently from what MAIA is presently
 *   allowed to read.
 *
 * The readiness line says `5 places in focus · 3 ready for MAIA · 2 need
 * confirmation` BEFORE the writer spends the act. A button implying five bodies
 * would be read when three can cross would make the sovereignty invisible at
 * exactly the moment it matters — the moment the writer decides.
 *
 * ⛔ AND NONE OF IT NEEDS VOCABULARY. A writer never has to understand
 * disclosure receipts, currency state or act provenance to know what MAIA can
 * see. `3 ready · 2 need confirmation` is the whole of it.
 *
 * ⛔ THE CROSSING IS STILL THE SERVER'S. This panel names places; the server
 * establishes the lawful bodies itself. `ready` here is presentation, and if
 * server truth disagrees it wins or it refuses — no stale UI state authorizes
 * a manuscript disclosure.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS } from '../pressTheme';
import { activeMember, withActive, type FocusMember, type FocusSet } from './focusSet';
import {
  IDLE, askReadiness, askReducer, askRequestBody, currencyDescribes, focusMembersOf,
  isReady, readinessLine, sawLine,
  type AskAnswer, type AskPhase, type FocusCurrencyView,
} from './focusAskAct';
import type { MemberCurrency } from '@/lib/writers-studio/focusCurrency';

/**
 * ⭐ ONE GLYPH PER STATE, and the founder's UI finding repaired: `!` used to
 * mean BOTH "needs confirmation" and "no longer here", which weakened exactly
 * the distinction the architecture works to preserve underneath.
 */
const MARK: Record<MemberCurrency | 'checking', string> = {
  ready: '✓', needs_confirmation: '?', unavailable: '×',
  not_yet_known: '…', checking: '…',
};
const TONE: Record<MemberCurrency | 'checking', number> = {
  ready: 1, needs_confirmation: 0.75, unavailable: 0.45,
  not_yet_known: 0.55, checking: 0.55,
};
/** ⛔ Plain words. A writer never has to learn "currency state". */
const NOTE: Record<MemberCurrency | 'checking', string> = {
  ready: 'MAIA can read this',
  needs_confirmation: 'this part of the work has changed — confirm it before MAIA reads it',
  unavailable: 'this section is no longer in the work',
  not_yet_known: 'MAIA could not check this one just now',
  checking: 'checking…',
};

function memberName(m: FocusMember): string {
  const where = m.position === null ? 'a section no longer here' : `Section ${m.position}`;
  const named = m.heading ? `${where} · “${m.heading}”` : where;
  return m.anchor.kind === 'passage' ? `${named}, a passage` : named;
}

export default function FocusSetPanel({
  set, onSet, onRelease, sessionId, workRef, readingId, observationKey, draftVersion,
}: {
  set: FocusSet;
  onSet: (next: FocusSet) => void;
  onRelease: () => void;
  /** Absent until the room knows them; the gesture is simply not offered. */
  sessionId?: string | null;
  workRef?: string | null;
  /** ⭐ The origin, so the SERVER can reach the frozen digests. */
  readingId?: string | null;
  observationKey?: string | null;
  /** The draft version the Canvas is showing. ⛔ A preflight against another
   *  version no longer describes the Work, and the panel returns to checking. */
  draftVersion?: number | null;
}) {
  const [openNotes, setOpenNotes] = useState(false);
  const [ask, setAsk] = useState('');
  const [currency, setCurrency] = useState<FocusCurrencyView | null>(null);
  const [phase, setPhase] = useState<AskPhase>(IDLE);
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  /**
   * ⭐ THE CURRENT PHASE, SYNCHRONOUSLY. `setPhase` is asynchronous, so a second
   * press arriving in the same tick would read a stale phase and mint a second
   * act for one human gesture. The ref is the phase the reducer is asked about;
   * React state is only how it renders.
   */
  const phaseRef = useRef<AskPhase>(IDLE);
  const active = activeMember(set);
  /**
   * ⭐⭐ THE PREFLIGHT. A read-only host operation that tells this panel what is
   * true NOW: no MAIA, no receipt, no act, no prose, no digest.
   *
   * ⛔ Its answer is informative, never an authority. The Ask crossing resolves
   * currency again for itself, so a panel holding a stale result cannot cause a
   * disclosure — and a result that no longer describes the current draft is
   * discarded here rather than shown.
   */
  const fresh = currencyDescribes(currency, draftVersion ?? null) ? currency : null;
  const readiness = askReadiness(set, fresh);
  const currencyAt = (i: number): MemberCurrency | undefined =>
    fresh?.members[`f${i + 1}`];
  const usable = readiness.ready;
  const unsure = readiness.needConfirmation + readiness.absent + readiness.checking;

  const membersKey = focusMembersOf(set).map((m) => m.focusMemberId).join(',');
  useEffect(() => {
    if (!workRef || !readingId || !observationKey) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/writers-studio/focus/currency', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            workRef, readingId, observationKey, members: focusMembersOf(set),
          }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json() as {
          resolvedAgainstDraftVersion: number | null;
          members: { focusMemberId: string; currency: MemberCurrency }[];
        };
        setCurrency({
          resolvedAgainstDraftVersion: data.resolvedAgainstDraftVersion,
          members: Object.fromEntries(data.members.map((m) => [m.focusMemberId, m.currency])),
        });
      } catch {
        /* ⛔ A preflight that failed claims nothing. `currency` stays null and
           the panel says it is still checking — never ready, never gone. */
      }
    })();
    return () => { cancelled = true; };
    /* Re-asks when the Work moves: the previous answer described another draft. */
  }, [workRef, readingId, observationKey, membersKey, draftVersion, set]);
  const canAsk = readiness.lawful && !!sessionId && !!workRef && !!readingId && !!observationKey
    && ask.trim().length > 0 && phase.phase !== 'asking';

  const move = useCallback((event: Parameters<typeof askReducer>[1]): AskPhase => {
    const next = askReducer(phaseRef.current, event);
    phaseRef.current = next;
    setPhase(next);
    return next;
  }, []);

  /**
   * ⭐ ONE DELIBERATE ASK, ONE ACT. An identity is minted per press and offered
   * to the reducer, which DISCARDS it while an act is in flight — returning the
   * same phase object, which is how a double click is recognised as the one act
   * the human actually performed. A later deliberate Ask gets a new identity,
   * even when the Focus Set has not changed: asking again is a real second act.
   */
  const send = useCallback(async () => {
    if (!sessionId || !workRef || !readingId || !observationKey) return;
    /* ⛔ Re-checked at the moment of the press, from the SERVER's answer. A
       readiness that has gone stale between render and click sends nothing. */
    if (!askReadiness(set, fresh).lawful) return;
    const before = phaseRef.current;
    const minted = globalThis.crypto?.randomUUID?.() ?? `act-${Date.now()}-${Math.random()}`;
    const started = move({ kind: 'gesture', actId: minted });
    // ⛔ Refused by the reducer — an act is already in flight. One act, one press.
    if (started === before || started.phase !== 'asking') return;
    const { actId } = started;
    setAnswer(null);

    try {
      const res = await apiFetch('/api/writers-studio/focus', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(askRequestBody({
          actId, sessionId, workRef, readingId, observationKey, set, ask: ask.trim(),
        })),
      });
      if (!res.ok) {
        move({ kind: 'refused', why: 'MAIA could not be reached just now. Nothing was sent.' });
        return;
      }
      setAnswer(await res.json() as AskAnswer);
      move({ kind: 'answered' });
    } catch {
      move({ kind: 'refused', why: 'MAIA could not be reached just now. Nothing was sent.' });
    }
  }, [sessionId, workRef, readingId, observationKey, set, ask, move, fresh]);

  return (
    <section
      data-focus-set
      data-focus-set-active={set.activeIndex === null ? 'none' : String(set.activeIndex)}
      className="border-t px-5 py-3 text-[12.5px]"
      style={{ borderColor: PRESS.ruleSoft }}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="uppercase tracking-[0.18em] text-[10.5px]" style={{ color: PRESS.accent }}>
          Focus
        </span>
        <span className="opacity-80">{set.label}</span>
        <span className="opacity-50" data-focus-readiness>{readinessLine(readiness)}</span>
        {/* ⭐ The U4 sentence. It says NONE until the writer says otherwise. */}
        <span className="opacity-60" data-focus-set-target>
          {active
            ? `working on ${memberName(active)}`
            : 'no place chosen yet — click one to work on it'}
        </span>
        <button
          type="button"
          onClick={onRelease}
          data-focus-set-release
          className="ml-auto uppercase tracking-[0.15em] text-[10.5px] opacity-55 hover:opacity-90"
        >
          Release
        </button>
      </div>

      <ol className="mt-2 flex flex-wrap gap-2">
        {set.members.map((m, i) => {
          const chosen = set.activeIndex === i;
          /* ⛔ Choosing an edit target is choosing a place MAIA can be given. */
          const usableMember = isReady(currencyAt(i)) && m.focus !== null;
          return (
            <li key={`${m.anchor.sectionId}-${i}`}>
              <button
                type="button"
                disabled={!usableMember}
                aria-pressed={chosen}
                data-focus-member={String(i)}
                data-focus-member-state={m.state}
                onClick={() => onSet(withActive(set, chosen ? null : i))}
                title={NOTE[currencyAt(i) ?? 'checking']}
                className="border px-2 py-1 rounded-sm"
                style={{
                  borderColor: chosen ? PRESS.accent : PRESS.ruleSoft,
                  opacity: TONE[currencyAt(i) ?? 'checking'],
                  cursor: usableMember ? 'pointer' : 'not-allowed',
                }}
              >
                <span aria-hidden className="mr-1 opacity-70">{MARK[currencyAt(i) ?? 'checking']}</span>
                {memberName(m)}
                {!isReady(currencyAt(i)) && (
                  <span className="sr-only"> — {NOTE[currencyAt(i) ?? 'checking']}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {unsure > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpenNotes((v) => !v)}
            aria-expanded={openNotes}
            data-focus-set-notes
            className="uppercase tracking-[0.15em] text-[10.5px] opacity-55 underline underline-offset-4"
          >
            {unsure} of {set.members.length} cannot be vouched for
          </button>
          {openNotes && (
            <ul className="mt-1 list-disc pl-4 opacity-60">
              {set.members.map((m, i) => (isReady(currencyAt(i)) ? null : (
                <li key={i}>
                  {memberName(m)} — {NOTE[currencyAt(i) ?? 'checking']}
                </li>
              )))}
            </ul>
          )}
        </div>
      )}

      {/* ── Ask MAIA ─────────────────────────────────────────────────────
          ⛔ Offered only where it is lawful. The refusal says what to do about
          it in ordinary words, and never names another place to ask about
          instead — substituting the writer's target is not the panel's to do. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && canAsk) void send(); }}
          placeholder="Ask MAIA about these places…"
          data-focus-ask-input
          /* ⛔ FOUND IN THE FOUNDER WITNESS, 2026-09-12. This carried no `color`,
             and an <input> does not inherit one — browsers apply their own
             default, which is black. On the Press ground (#1A1513) the writer's
             own question was invisible as they typed it: the field looked
             broken, and the only visible trace was Chrome's spellcheck
             underline beneath text nobody could read.
             ⭐ A control that takes the member's words must state its ink. */
          className="flex-1 min-w-[12rem] border px-2 py-1 bg-transparent placeholder:opacity-45"
          style={{ borderColor: PRESS.ruleSoft, color: PRESS.text }}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={!canAsk}
          data-focus-ask
          data-focus-ask-phase={phase.phase}
          className="border px-3 py-1 uppercase tracking-[0.15em] text-[10.5px]"
          style={{
            borderColor: canAsk ? PRESS.accent : PRESS.ruleSoft,
            opacity: canAsk ? 1 : 0.45,
            cursor: canAsk ? 'pointer' : 'not-allowed',
          }}
        >
          {phase.phase === 'asking' ? 'Asking…' : 'Ask MAIA'}
        </button>
      </div>

      {readiness.refusal && (
        <p className="mt-2 opacity-60" data-focus-ask-refusal>{readiness.refusal}</p>
      )}
      {phase.phase === 'refused' && (
        <p className="mt-2 opacity-60" data-focus-ask-refusal>{phase.why}</p>
      )}

      {/* ⭐ P12 · what MAIA ACTUALLY saw, counted by the side that knows. */}
      {answer && (
        <div className="mt-3" data-focus-ask-answer>
          {sawLine(answer) && (
            <p className="opacity-60 mb-1" data-focus-ask-saw>{sawLine(answer)}</p>
          )}
          {answer.response
            ? <p style={{ whiteSpace: 'pre-wrap' }}>{answer.response}</p>
            : <p className="opacity-60">{answer.message ?? 'Nothing came back.'}</p>}
        </div>
      )}

      {usable === 0 && (
        <p className="mt-2 opacity-60">
          None of the places this finding rests on can be shown in the work as it is now.
          The finding is still true about the version it read.
        </p>
      )}
    </section>
  );
}

/** What the room says when it was sent an origin it cannot make sense of. */
export function FocusSetRefused({ why, onRelease }: { why: string; onRelease: () => void }) {
  return (
    <section
      data-focus-set-refused
      className="border-t px-5 py-3 text-[12.5px] opacity-70"
      style={{ borderColor: PRESS.ruleSoft }}
    >
      A finding was sent here from a reading, but {why}. Nothing has been framed, and your
      work is unchanged.{' '}
      <button type="button" onClick={onRelease} className="underline underline-offset-4">
        Dismiss
      </button>
    </section>
  );
}
