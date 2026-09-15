'use client';
/**
 * WS-EDITORIAL-UI-01 · THE VISIBLE EDITORIAL CONVERSATION.
 *
 * ⭐⭐ THE CONVERSATION IS SERVER STATE. This component holds no transcript.
 *
 * ⛔ It replaces the mini-MAIA illusion, which kept its own `Turn[]`, posted to
 * `/api/sovereign/app/maia/list` with a client-minted `sessionId` and a
 * client-supplied `userId`, and sent its own local history back up as context.
 * Every one of those is now a server fact, and the surface cannot hold an
 * opinion about any of them.
 *
 * ⭐ What it renders comes from `GET /api/writers-studio/editorial/thread`,
 * which reads `ask_turns` and the turn↔act bindings. That is why closing the
 * pane, reopening it, or navigating away changes nothing: there is no component
 * memory to lose.
 *
 * ⛔ NOT IN THIS CUT: voice (no microphone exists on this surface), Adopt,
 * comparison, and a member VersionComposer. An adjunct is DISPLAYED here; it is
 * never authored from prose by this component or any other.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { GROUND, INK, MAIA_ACCENT, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText, typeStyle } from '../studio/StudioType';

export const EDITORIAL_PLACEHOLDER = 'Say what you are working on…';

type Adjunct =
  | null
  | { kind: 'direction'; id: string; instruction: string; refersTo: string | null }
  | { kind: 'version'; id: string; wording: string; supersedes: string | null };

interface ThreadTurn {
  turnIndex: number;
  speaker: 'author' | 'maia';
  body: string;
  at: string;
  adjunct: Adjunct;
}
interface ThreadView {
  threadId: string;
  chainId: string;
  locusText: string;
  turns: ThreadTurn[];
}

export interface EditorialConversationProps {
  /**
   * ⭐ An existing relationship, if the Work already carries one. When absent,
   * `sectionId` opens one — ⛔ and the client names ONLY the section; work,
   * draft, base version and expected text are derived server-side.
   */
  threadId?: string;
  sectionId?: string;
  onOpened?: (threadId: string) => void;
  onClose: () => void;
}

export default function EditorialConversation({
  threadId: given, sectionId, onOpened, onClose,
}: EditorialConversationProps) {
  const [threadId, setThreadId] = useState<string | undefined>(given);
  const [view, setView] = useState<ThreadView | null>(null);
  const [draft, setDraft] = useState('');
  /* ⭐⭐ THE MEMBER DECLARES THE ACT. ⛔ Never classified from their wording. */
  const [actKind, setActKind] = useState<'discourse' | 'direction'>('discourse');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  /* ⭐ THE ONLY SOURCE OF WHAT IS SHOWN. */
  const reload = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/writers-studio/editorial/thread?threadId=${encodeURIComponent(id)}`);
    if (!res.ok) { setFailure('This conversation could not be read.'); return; }
    setView(await res.json());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (threadId) { await reload(threadId); return; }
      if (!sectionId) return;
      const res = await apiFetch('/api/writers-studio/editorial/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId }),
      });
      if (!res.ok) { setFailure('This passage could not be opened.'); return; }
      const { threadId: opened } = await res.json();
      if (cancelled) return;
      setThreadId(opened); onOpened?.(opened); await reload(opened);
    })();
    return () => { cancelled = true; };
  }, [threadId, sectionId, reload, onOpened]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [view, busy]);

  const send = async () => {
    const text = draft;
    if (text.trim().length === 0 || busy || !threadId) return;
    setBusy(true); setFailure(null);
    try {
      const res = await apiFetch('/api/writers-studio/editorial/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* ⛔ THE MEMBER'S TEXT, EXACTLY. No trim — the server stores what they
           wrote, and a Direction's instruction IS the turn body. */
        body: JSON.stringify({ threadId, act: { act: actKind, text, refersTo: null } }),
      });
      /* ⭐ Reload either way: on a MAIA-side failure the member's turn STILL
         persisted, and the surface must show that rather than pretend the
         exchange never happened. */
      await reload(threadId);
      if (res.ok) { setDraft(''); setActKind('discourse'); }
      else setFailure('Your words are saved. MAIA could not answer this time.');
    } catch {
      setFailure('Your words may be saved. MAIA could not answer this time.');
      await reload(threadId);
    } finally { setBusy(false); }
  };

  return (
    <section
      aria-label="Editorial conversation"
      style={{
        display: 'flex', flexDirection: 'column', gap: SPACE.base,
        background: GROUND.raised, border: `1px solid ${RULE.soft}`,
        borderRadius: RADIUS.panel, padding: SPACE.base, minHeight: 0,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <StudioText as="h2" role="panelLabel">This passage</StudioText>
        <button type="button" onClick={onClose} aria-label="Put MAIA away"
          style={{ ...typeStyle('panelLabel'), background: 'none', border: 'none', color: INK.muted, cursor: 'pointer' }}>
          Close
        </button>
      </header>

      {/* ⭐ The writer's own wording, as the relationship froze it. It is what
          the conversation is ABOUT, and it is never replaced by a candidate. */}
      {view && (
        <blockquote style={{
          ...typeStyle('maiaReading'), margin: 0, color: INK.secondary,
          borderLeft: `2px solid ${RULE.soft}`, paddingLeft: SPACE.snug,
        }}>
          {view.locusText}
        </blockquote>
      )}

      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: SPACE.base, minHeight: 0 }}>
        {view?.turns.map((t) => (
          <article key={t.turnIndex} style={{ display: 'flex', flexDirection: 'column', gap: SPACE.tight }}>
            <StudioText role="panelLabel" style={{ color: t.speaker === 'maia' ? MAIA_ACCENT.voice : INK.muted }}>
              {t.speaker === 'maia' ? 'MAIA' : 'You'}
            </StudioText>
            <StudioText role="maiaReading" style={{ whiteSpace: 'pre-wrap' }}>{t.body}</StudioText>

            {/* ⭐⭐ THE ADJUNCT IS SHOWN BECAUSE A BINDING NAMES IT — ⛔ never
                because the text reads like one. */}
            {t.adjunct?.kind === 'direction' && (
              <StudioText role="panelLabel" style={{ color: INK.muted }}>
                — said as a Direction
              </StudioText>
            )}
            {t.adjunct?.kind === 'version' && (
              <div style={{
                border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                padding: SPACE.snug, background: GROUND.base,
              }}>
                {/* ⛔ AUTHORSHIP STAYS VISIBLE. This is MAIA's wording, offered;
                    it is not the writer's text and it has not replaced it. */}
                <StudioText role="panelLabel" style={{ color: MAIA_ACCENT.voice }}>
                  MAIA&rsquo;s wording — offered, not applied
                </StudioText>
                <StudioText role="maiaReading" style={{ whiteSpace: 'pre-wrap' }}>
                  {t.adjunct.wording}
                </StudioText>
              </div>
            )}
          </article>
        ))}
        {busy && <StudioText role="panelLabel" style={{ color: INK.muted }}>MAIA is reading…</StudioText>}
        {failure && <StudioText role="panelLabel" style={{ color: INK.muted }}>{failure}</StudioText>}
        <div ref={endRef} />
      </div>

      {/* ── Composer. Text only; no microphone exists on this surface. ── */}
      <div style={{ borderTop: `1px solid ${RULE.soft}`, paddingTop: SPACE.base }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
          }}
          placeholder={EDITORIAL_PLACEHOLDER}
          rows={3}
          aria-label="Say something about this passage"
          style={{
            ...typeStyle('maiaReading'), width: '100%', resize: 'none',
            background: GROUND.base, color: INK.primary,
            border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
            padding: SPACE.snug, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.base, marginTop: SPACE.snug }}>
          {/* ⭐⭐ THE DECLARATION IS THE MEMBER'S, AND IT IS EXPLICIT. Nothing
              infers a Direction from how the sentence sounds. */}
          <label style={{ ...typeStyle('panelLabel'), color: INK.muted, display: 'flex', gap: SPACE.tight }}>
            <input
              type="checkbox"
              checked={actKind === 'direction'}
              onChange={(e) => setActKind(e.target.checked ? 'direction' : 'discourse')}
            />
            Say this as a Direction
          </label>
          <button type="button" onClick={() => void send()} disabled={busy || !threadId}
            style={{ ...typeStyle('panelLabel'), marginLeft: 'auto', background: 'none',
                     border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                     padding: `${SPACE.tight}px ${SPACE.snug}px`, color: INK.primary, cursor: 'pointer' }}>
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
