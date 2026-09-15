'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { GROUND, INK, MAIA_ACCENT, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText, typeStyle } from '../studio/StudioType';
import { useMemberIdentity } from '../useMemberIdentity';
import { useManuscriptKeeps } from '../useManuscriptKeeps';
import { handoffToMaia } from '../workContext';
import {
  ask, loadThread, threadsOn, type AskThreadView,
} from '@/lib/writersStudio/askClient';
import {
  resumeDecision, sendMode, threadChoiceLabel,
  type ResumeDecision, type ThreadDiscovery,
} from '@/lib/writersStudio/observationDialogueResume';
import type { LivingWork } from '../useLivingWorks';

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

const WORK_ANCHOR = { on: 'work' } as const;

const REFUSAL_SAYS: Record<string, string> = {
  unreachable: 'That didn’t reach her. Nothing was lost — try again.',
  empty_answer: 'MAIA returned nothing. Try asking again.',
  question_too_long: 'That is longer than a question this room can carry.',
  unauthenticated: 'You are signed out. Sign in and your question will go through.',
  not_found: 'This Work could not be opened for conversation.',
};

const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'earlier' : d.toLocaleDateString();
};

export interface WorkConversationProps {
  work: LivingWork;
  manuscriptId: string;
  /**
   * ⭐ The passage the writer is presently in, or null. CONTEXT, NOT IDENTITY —
   * it is handed to the server on each turn and it is not part of the anchor.
   */
  sectionId: string | null;
  onClose: () => void;
}

export default function WorkConversation({
  work, manuscriptId, sectionId, onClose,
}: WorkConversationProps) {
  const identity = useMemberIdentity();
  const { keeps } = useManuscriptKeeps(manuscriptId);
  const [showKeeps, setShowKeeps] = useState(false);

  const [decision, setDecision] = useState<ResumeDecision | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [thread, setThread] = useState<AskThreadView | null>(null);

  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread, pending]);

  const adopt = useCallback(async (id: string) => {
    const t = await loadThread(manuscriptId, id);
    setThreadId(id);
    if (t) setThread(t);
  }, [manuscriptId]);

  /* ⛔ `sectionId` IS NOT A DEPENDENCY. Discovery is about the Work. */
  useEffect(() => {
    let cancelled = false;
    setDecision(null);
    void (async () => {
      const discovery: ThreadDiscovery = await threadsOn(manuscriptId, WORK_ANCHOR);
      if (cancelled) return;
      const d = resumeDecision(discovery);
      setDecision(d);
      /* ⭐ One relationship is not a choice. Adopting it writes nothing. */
      if (d.kind === 'resume') await adopt(d.threadId);
    })();
    return () => { cancelled = true; };
  }, [manuscriptId, adopt]);

  const mode = sendMode(decision, threadId);

  const send = async () => {
    const question = draft.trim();
    /* ⭐⭐ ONE CALL DECIDES BOTH THE PERMISSION AND THE PAYLOAD. A surface that
       disabled the button from one rule and picked `{anchor}` vs `{threadId}`
       from another would have two chances to disagree, and the disagreement
       writes a row. */
    if (!question || pending !== null || mode.kind === 'blocked') return;
    setDraft('');
    setRefusal(null);
    setPending(question);
    const r = await ask({
      manuscriptId,
      question,
      ...(mode.kind === 'resume' ? { threadId: mode.threadId } : { anchor: WORK_ANCHOR }),
      ...(sectionId ? { sectionId } : {}),
    });
    setPending(null);
    if (r.ok) {
      setThreadId(r.threadId);
      setThread(r.thread);
      return;
    }
    /* The author's turn may already be persisted behind a failed answer; the
       server returns the thread id with the refusal, and holding it is what
       makes "nothing was lost" true rather than reassuring. */
    if (r.threadId) { setThreadId(r.threadId); void adopt(r.threadId); }
    setRefusal(REFUSAL_SAYS[r.refusal] ?? REFUSAL_SAYS.unreachable);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* ── The Work this exchange is in, where the member can see it. ── */}
      <div
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
          onClick={onClose}
          aria-label="Close the conversation and return to writing"
          data-close-conversation="true"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, lineHeight: 1, color: INK.quiet,
          }}
        >
          <StudioText role="metadata" as="span">✕</StudioText>
        </button>
      </div>

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
              {`You have ${decision.threads.length} conversations about this Work.`}
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
            She has your Work in view. She has not been given its text —
            {keeps.length > 0
              ? ' bring a Keep if you want her to read a passage.'
              : ' a Keep is how you would hand her one.'}
          </StudioText>
        )}

        {turns.map((t) => (
          <div key={t.index} style={{ marginBottom: SPACE.base }} data-turn={t.index}>
            <StudioText role="metadata" tone="quiet" style={{ marginBottom: SPACE.hairline }}>
              {t.speaker === 'maia' ? 'MAIA' : 'You'}
            </StudioText>
            <StudioText
              role="maiaReading"
              style={t.speaker === 'maia' ? { color: MAIA_ACCENT.voice } : { color: INK.secondary }}
            >
              {t.body}
            </StudioText>
          </div>
        ))}

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

        {refusal && <StudioText role="metadata">{refusal}</StudioText>}
        <div ref={endRef} />
      </div>

      {/* ── The member's kept passages, offered rather than inserted. ── */}
      {showKeeps && (
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

      {/* ── Composer. Text only; no microphone exists on this surface. ── */}
      <div style={{ borderTop: `1px solid ${RULE.soft}`, paddingTop: SPACE.base }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
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
            ...typeStyle('maiaReading'), width: '100%', resize: 'none',
            background: GROUND.base, color: INK.primary,
            border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
            padding: SPACE.snug, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.base, marginTop: SPACE.snug }}>
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
          {/* ⚠️ No conversation id travels with this. See the header. */}
          <Link
            href={handoffToMaia('/maia', { workId: work.id, manuscriptId })}
            data-open-in-maia="true"
            style={{ textDecoration: 'none' }}
          >
            <StudioText role="metadata" as="span">Open in MAIA →</StudioText>
          </Link>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => void send()}
            disabled={pending !== null || draft.trim() === '' || mode.kind === 'blocked'}
            style={{
              background: GROUND.active, border: `1px solid ${RULE.soft}`,
              borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.base}px`,
              cursor: pending !== null || draft.trim() === '' || mode.kind === 'blocked'
                ? 'default' : 'pointer',
              opacity: pending !== null || draft.trim() === '' || mode.kind === 'blocked'
                ? 0.4 : 1,
              color: INK.primary,
            }}
          >
            <StudioText role="metadata" as="span">Send</StudioText>
          </button>
        </div>
      </div>
    </div>
  );
}
