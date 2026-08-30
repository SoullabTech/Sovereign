'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { GROUND, INK, MAIA_ACCENT, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText, typeStyle } from '../studio/StudioType';
import { useMemberIdentity } from '../useMemberIdentity';
import { useManuscriptKeeps } from '../useManuscriptKeeps';
import { handoffToMaia } from '../workContext';
import type { LivingWork } from '../useLivingWorks';

/**
 * WS2-03D — mini MAIA. A companion at the writer's table.
 *
 * ── WHY NOT OracleConversation ─────────────────────────────────────────────
 *
 * It was tried, and the runtime witness settled it. That component is built to
 * own a viewport in two independent ways:
 *
 *   1. Its presence layers are `position: fixed` (OracleConversation.tsx:7960,
 *      8144, 9069, 9099), so they resolve against the WINDOW and escape any
 *      column or card they are placed in. Containment can trap them —
 *      `transform` / `contain: paint` — but that only shrinks the takeover.
 *   2. More decisively, its pre-conversation state IS the full presence field:
 *      the guard is `(shouldRenderArrival || (!hasActivated && ...))`, so a
 *      fresh exchange always opens as the holoflower with "TAP TO SPEAK". No
 *      prop suppresses it; it is the component's design, and a correct one for
 *      the room it was built for.
 *
 * The founder's ruling is that the manuscript stays the primary surface and
 * MAIA sits beside it — present, responsive, subordinate to the writing. A
 * contained holoflower is still a holoflower. So this pane is presentation,
 * built to that rank.
 *
 * ── WHAT IS AND IS NOT SHARED ──────────────────────────────────────────────
 *
 * Stated plainly rather than glossed, because "no second conversation model"
 * is a real constraint and this is close to its edge.
 *
 *   SHARED — everything that decides what MAIA is:
 *     the canonical endpoint /api/sovereign/app/maia/list
 *     the same request contract, including workContext: { workId }
 *     server-side Work resolution from the member's own row
 *     the prompt path, memory, provenance
 *     SITUATED-WORK-DEEP-01 containment, because it is the same route
 *
 *   NOT SHARED — the client presentation:
 *     this pane keeps its own message list and composer
 *
 * That is a second CLIENT rendering of the loop, not a second runtime. The
 * precedent is in-repo: components/academy/AcademySheet.tsx posts to the same
 * endpoint with its own compact surface. Nothing about the exchange is decided
 * here; every decision still happens server-side on the canonical route.
 *
 * ── KEEPS: HOW MAIA COMES TO HOLD ANY OF THE WRITING ───────────────────────
 *
 * She is given the Work's identity and never its text. That is the D-019 line
 * and it holds: nothing here reaches into the manuscript.
 *
 * A Keep is the exception the member makes themselves. It is verbatim text the
 * writer already chose to set aside, and bringing one into the conversation is
 * their gesture — the crossing IS the consent event, exactly as it is for
 * Materials entering a Work.
 *
 * So a chosen Keep lands in the COMPOSER, not in the transcript. It is not
 * sent on the member's behalf: they see the passage, add whatever they want to
 * ask about it, and send it as their own turn. The difference matters. Sending
 * it automatically would make the button a disclosure; putting it in the
 * composer makes it a quotation the writer is choosing to read aloud.
 *
 * ── CONSENT ────────────────────────────────────────────────────────────────
 *
 * Text only. There is no microphone code in this file and no voice component
 * beneath it — not "voice disabled", voice ABSENT. Opening a conversation is
 * an invitation to converse, never permission to listen. A future explicit
 * "Talk with MAIA" control would be the consent-bearing gesture; it is not
 * this unit's, and it may not be added by accident.
 */

export const MINI_MAIA_PLACEHOLDER = 'Ask MAIA about this work…';

interface Turn {
  role: 'member' | 'maia';
  text: string;
}

export interface StudioConversationProps {
  work: LivingWork;
  manuscriptId: string;
  /** Minted by the Studio, stable for the life of this page. */
  conversationId: string;
  /**
   * Put MAIA away. Closing does NOT end or erase the exchange — the pane is
   * hidden by the caller, not unmounted, so reopening during this page session
   * returns to the same conversation exactly where it was left.
   */
  onClose: () => void;
}

export default function StudioConversation({
  work,
  manuscriptId,
  conversationId,
  onClose,
}: StudioConversationProps) {
  const identity = useMemberIdentity();
  const { keeps } = useManuscriptKeeps(manuscriptId);
  const [showKeeps, setShowKeeps] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns, sending]);

  const send = async () => {
    const message = draft.trim();
    if (!message || sending || !identity.memberId) return;
    setDraft('');
    setFailed(false);
    setTurns((t) => [...t, { role: 'member', text: message }]);
    setSending(true);
    try {
      const res = await apiFetch('/api/sovereign/app/maia/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: conversationId,
          userId: identity.memberId,
          conversationHistory: turns.map((t) => ({
            role: t.role === 'maia' ? 'assistant' : 'user',
            content: t.text,
          })),
          /* The Work, by id only. Title and purpose are re-read server-side
             from the member's own row — the URL and this body are claims. */
          workContext: { workId: work.id },
          surface: 'maia',
        }),
      });
      if (!res.ok) throw new Error('not ok');
      const data = await res.json();
      setTurns((t) => [
        ...t,
        { role: 'maia', text: data.message || data.text || 'I’m here with you.' },
      ]);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* ── The Work this exchange is in, where the member can see it. ── */}
      <div
        data-studio-conversation="situated"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: SPACE.snug,
          paddingBottom: SPACE.snug,
          marginBottom: SPACE.base,
          borderBottom: `1px solid ${RULE.soft}`,
          flexWrap: 'wrap',
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

      {/* ── The exchange ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: SPACE.tight }}>
        {turns.length === 0 && (
          <StudioText role="metadata" style={{ opacity: 0.7, maxWidth: '34ch' }}>
            She has your Work in view. She has not been given its text —
            {keeps.length > 0
              ? ' bring a Keep if you want her to read a passage.'
              : ' a Keep is how you would hand her one.'}
          </StudioText>
        )}
        {turns.map((t, i) => (
          <div key={i} style={{ marginBottom: SPACE.base }}>
            <StudioText role="metadata" tone="quiet" style={{ marginBottom: SPACE.hairline }}>
              {t.role === 'maia' ? 'MAIA' : 'You'}
            </StudioText>
            <StudioText
              role="maiaReading"
              style={t.role === 'maia' ? { color: MAIA_ACCENT.voice } : { color: INK.secondary }}
            >
              {t.text}
            </StudioText>
          </div>
        ))}
        {sending && <StudioText role="metadata">…</StudioText>}
        {failed && (
          <StudioText role="metadata">
            That didn’t reach her. Nothing was lost — try again.
          </StudioText>
        )}
        <div ref={endRef} />
      </div>

      {/* ── The member's kept passages, offered rather than inserted. ── */}
      {showKeeps && (
        <div
          data-keeps-chooser="true"
          style={{
            maxHeight: '38%',
            overflowY: 'auto',
            border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.sm,
            padding: SPACE.snug,
            marginBottom: SPACE.snug,
            background: GROUND.base,
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
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${RULE.quiet}`,
                  padding: `${SPACE.snug}px ${SPACE.tight}px`,
                  cursor: 'pointer',
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
          placeholder={MINI_MAIA_PLACEHOLDER}
          rows={3}
          aria-label="Message MAIA"
          style={{
            ...typeStyle('maiaReading'),
            width: '100%',
            resize: 'none',
            background: GROUND.base,
            color: INK.primary,
            border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.sm,
            padding: SPACE.snug,
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.base, marginTop: SPACE.snug }}>
          {/* Immersion, by choice. Carries the Work, the way back, and this
              exact exchange, so full MAIA continues it rather than starting
              another — and voice lives there, where it was designed for. */}
          <button
            type="button"
            data-keeps-toggle="true"
            aria-expanded={showKeeps}
            onClick={() => setShowKeeps((v) => !v)}
            style={{
              background: showKeeps ? GROUND.active : 'transparent',
              border: `1px solid ${RULE.soft}`,
              borderRadius: RADIUS.sm,
              padding: `${SPACE.tight}px ${SPACE.snug}px`,
              cursor: 'pointer',
              color: INK.secondary,
            }}
          >
            <StudioText role="metadata" as="span">
              Keeps{keeps.length > 0 ? ` ${keeps.length}` : ''}
            </StudioText>
          </button>
          <Link
            href={handoffToMaia('/maia', { workId: work.id, manuscriptId, conversationId })}
            data-open-in-maia="true"
            style={{ textDecoration: 'none' }}
          >
            <StudioText role="metadata" as="span">Open in MAIA →</StudioText>
          </Link>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || draft.trim() === ''}
            style={{
              background: GROUND.active,
              border: `1px solid ${RULE.soft}`,
              borderRadius: RADIUS.sm,
              padding: `${SPACE.tight}px ${SPACE.base}px`,
              cursor: sending || draft.trim() === '' ? 'default' : 'pointer',
              opacity: sending || draft.trim() === '' ? 0.4 : 1,
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
