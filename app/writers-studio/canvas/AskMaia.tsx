'use client';

/**
 * WS2-05B-8B-02c-2 · ANCHORED ASK MAIA — the conversation, where the mark was.
 *
 * NOT A CHAT WINDOW. It opens under the thing the writer pointed at, carrying
 * that anchor, and it says at the top what it is about. A generic composer
 * floating beside the reading would make the writer restate what they had
 * already indicated by clicking.
 *
 * IT SAYS WHAT IT CANNOT DO, ONCE, PLAINLY. Not as a disclaimer band but as the
 * one line that makes the room safe to speak in: nothing here changes the book.
 *
 * UNKNOWN IS SHOWN AS UNKNOWN. Where a staleness dimension could not be
 * measured the line says so, rather than the room implying freshness it never
 * established. In this slice `inputMoved` is always unmeasured — measuring it
 * needs the section bodies and this slice reads none — so the writer is told
 * that she is speaking about what she saw.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { ask, type AskThreadView } from '@/lib/writersStudio/askClient';
import type { AskAnchor } from '@/lib/manuscript/ask/anchor';
import type { StalenessState } from '@/lib/manuscript/ask/staleness';

const REFUSAL_SAYS: Record<string, string> = {
  unreachable: 'MAIA could not be reached. Nothing was lost — your question is held here.',
  empty_answer: 'MAIA returned nothing. Try asking again.',
  no_reading: 'There is no reading here to talk about yet.',
  anchor_requires_reading: 'This needs a reading to talk about, and there is not one.',
  anchor_reading_mismatch: 'This points at a different reading than the one open.',
  anchor_unresolved: 'That part of the reading could not be found.',
  question_too_long: 'That is longer than a question this room can carry.',
  unauthenticated: 'You are signed out. Sign in and your question will go through.',
};

/**
 * What she could not verify, said in the writer's terms.
 *
 * Returns null when everything measured is unchanged — a room that narrates its
 * own freshness on every turn is noise, and the absence of a line IS the
 * "nothing moved" answer.
 */
function stalenessLine(s: StalenessState | null): string | null {
  if (!s) return null;
  const said: string[] = [];
  if (s.inputMoved.state === 'changed') said.push('your text has changed since she read it');
  if (s.inputMoved.state === 'unmeasured') said.push('she cannot check whether your text changed since she read it');
  if (s.topologyMoved.state === 'changed') said.push('the sections have moved since she read');
  if (s.reviewMoved.state === 'changed') said.push(`you have edited your structure since (${s.reviewMoved.was} → ${s.reviewMoved.now})`);
  if (s.readingSuperseded.state === 'superseded') said.push('there is a newer reading of this Work');
  if (s.canonicalMoved.state === 'changed') said.push('your structure changed while this was open');
  if (said.length === 0) return null;
  return `She is speaking about what she saw — ${said.join('; ')}.`;
}

export default function AskMaia({
  manuscriptId, anchor, about, onClose,
}: {
  manuscriptId: string;
  anchor: AskAnchor;
  /** What the writer pointed at, in her words. Shown so the room is anchored. */
  about: string;
  onClose: () => void;
}) {
  const [thread, setThread] = useState<AskThreadView | null>(null);
  const [staleness, setStaleness] = useState<StalenessState | null>(null);
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
      ...(thread ? { threadId: thread.id } : { anchor }),
    });
    if (r.ok) {
      setThread(r.thread);
      setStaleness(r.staleness);
      setDraft('');
    } else {
      /* THE QUESTION IS NOT CLEARED ON A REFUSAL. The words are the writer's and
         the room does not eat them because the wire failed. */
      setRefusal(r.refusal);
    }
    setBusy(false);
  }, [draft, busy, manuscriptId, anchor, thread]);

  const line = stalenessLine(staleness);

  return (
    <div data-ask-maia
      style={{
        marginTop: SPACE.base, padding: SPACE.base,
        background: GROUND.raised, borderRadius: RADIUS.panel,
        border: `1px solid ${RULE.quiet}`,
      }}>
      <StudioText role="panelLabel" style={{ display: 'block' }}>
        talking with MAIA about
      </StudioText>
      <StudioText role="navItem" style={{ display: 'block', marginTop: SPACE.hairline }}>
        {about}
      </StudioText>

      {/* SAID ONCE, AT THE TOP. The writer needs to know before they speak, not
          after they have asked for something. */}
      <StudioText role="metadata" tone="quiet"
        style={{ display: 'block', marginTop: SPACE.tight }}>
        Nothing said here changes your book, your structure, or her reading.
      </StudioText>

      {thread && thread.turns.length > 0 && (
        <div data-ask-turns style={{ marginTop: SPACE.base }}>
          {thread.turns.map((t) => (
            <div key={t.index} data-ask-turn={t.speaker}
              style={{ marginTop: SPACE.snug }}>
              <StudioText role="metadata" tone="quiet" style={{ display: 'block' }}>
                {t.speaker === 'author' ? 'you' : 'MAIA'}
              </StudioText>
              <StudioText role={t.speaker === 'author' ? 'prose' : 'maiaReading'}
                style={{ display: 'block', whiteSpace: 'pre-wrap' }}>
                {t.body}
              </StudioText>
            </div>
          ))}
        </div>
      )}

      {line && (
        <StudioText role="metadata" tone="quiet" data-ask-staleness
          style={{ display: 'block', marginTop: SPACE.snug }}>
          {line}
        </StudioText>
      )}

      {refusal && (
        <StudioText role="metadata" data-ask-refusal
          style={{ display: 'block', marginTop: SPACE.snug, color: INK.secondary }}>
          {REFUSAL_SAYS[refusal] ?? `That did not go through (${refusal}).`}
        </StudioText>
      )}

      <textarea
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); }
        }}
        placeholder={thread ? 'say more…' : 'Why are you unsure about this?'}
        rows={3}
        aria-label="ask MAIA about this"
        style={{
          width: '100%', marginTop: SPACE.snug, padding: SPACE.tight,
          background: GROUND.active, color: INK.secondary,
          border: `1px solid ${RULE.quiet}`, borderRadius: RADIUS.panel,
          font: 'inherit', resize: 'vertical',
        }}
      />

      <div style={{ marginTop: SPACE.tight, display: 'flex', gap: SPACE.snug }}>
        <button type="button" onClick={() => void send()} disabled={busy || !draft.trim()}
          data-ask-send
          style={{ background: 'none', border: `1px solid ${RULE.quiet}`,
            borderRadius: RADIUS.panel, padding: `${SPACE.hairline}px ${SPACE.snug}px`,
            cursor: busy || !draft.trim() ? 'default' : 'pointer',
            opacity: busy || !draft.trim() ? 0.4 : 1 }}>
          <StudioText role="metadata" as="span">
            {busy ? 'asking…' : 'ask'}
          </StudioText>
        </button>
        <button type="button" onClick={onClose} data-ask-close
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <StudioText role="metadata" tone="quiet" as="span">done</StudioText>
        </button>
      </div>
    </div>
  );
}
