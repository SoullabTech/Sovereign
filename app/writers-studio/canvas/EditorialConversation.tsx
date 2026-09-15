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
 * ⛔ IT CARRIES NO CHROME OF ITS OWN. No title bar, no close — `StudioPanel`
 * owns the band label and the dismiss control, and a panel is chrome around
 * content (WS-EDITORIAL-UI-01B).
 *
 * ⛔ AND IT DOES NOT OPEN ONE. The relationship is opened by the member's
 * Conversations gesture in the room, and its identity lives in the URL. This
 * component is handed a `threadId` and can do nothing but read and speak into
 * it — see WS-EDITORIAL-UI-01A.
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
/**
 * ⭐ One formulation in the authored succession.
 *
 * ⛔ NOT A TURN. `turns` is conversation order; `versions` is authored
 * succession, and a version written in the composer has no turn at all. ⛔ The
 * two are never merged into one timestamped feed.
 */
interface ThreadVersion {
  id: string;
  author: 'maia' | 'member';
  wording: string;
  supersedes: string | null;
  rationale: string | null;
}
interface ThreadView {
  threadId: string;
  chainId: string;
  locusText: string;
  turns: ThreadTurn[];
  versions: ThreadVersion[];
  headVersionId: string | null;
}

/**
 * ⭐⭐ WHAT THE WRITER CLICKED — frozen at the click and held until they are
 * done. ⛔ NEVER DERIVED FROM `headVersionId`.
 *
 * This is the load-bearing law of the cut. If a newer version lands while they
 * are writing, the lineage head moves and THIS DOES NOT. Their submission then
 * carries the predecessor they actually answered, and the store truthfully
 * refuses it as `not_successor_of_head`. ⛔ No retarget, ⛔ no retry, ⛔ no
 * rebase, ⛔ no cleared draft: the machine's timing may judge their
 * relationship stale, but it may not rewrite which wording they answered.
 */
interface ComposerTarget {
  versionId: string;
  author: 'maia' | 'member';
  ordinal: number;
}

const authorLabel = (a: 'maia' | 'member') => (a === 'maia' ? 'MAIA' : 'Your version');

/** Plain, and never reassuring: the exchange really did move. */
function refusalCopy(reason: string): string {
  switch (reason) {
    case 'not_successor_of_head':
      return 'A newer version was added while you were writing, so this no longer '
        + 'follows the version you answered. Your words are kept below.';
    case 'simultaneous_append':
      return 'Another version landed at the same moment. Your words are kept below.';
    case 'version_exists':
      return 'That version already exists. Your words are kept below.';
    default:
      return 'This version could not be added. Your words are kept below.';
  }
}

export interface EditorialConversationProps {
  /**
   * ⭐⭐ THE EXACT RELATIONSHIP THIS PANEL IS SHOWING. Required, and the
   * component never invents one.
   *
   * ⛔ UI-01 let this be absent and opened a relationship from the mount
   * effect. That was wrong twice over: a RE-RENDER IS NOT AN AUTHORED REQUEST
   * to create a durable editorial relationship, and holding the only copy of
   * the identity in React state meant a remount could not find its way back to
   * what it had made. Opening is a member gesture and belongs to the room; the
   * address belongs to the URL. This component owns neither.
   */
  threadId: string;
}

export default function EditorialConversation({ threadId }: EditorialConversationProps) {
  /* ⭐ Disposable presentation state. Losing it costs a refetch and nothing
     else, because the conversation itself is server state. */
  const [view, setView] = useState<ThreadView | null>(null);
  const [draft, setDraft] = useState('');
  /* ⭐⭐ THE MEMBER DECLARES THE ACT. ⛔ Never classified from their wording. */
  const [actKind, setActKind] = useState<'discourse' | 'direction'>('discourse');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  /* ⭐⭐ CREATED BY THE WRITER'S CLICK, and nothing else may set it. */
  const [composerTarget, setComposerTarget] = useState<ComposerTarget | null>(null);
  const [wording, setWording] = useState('');
  const [wordingBusy, setWordingBusy] = useState(false);
  const [wordingRefusal, setWordingRefusal] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  /* ⭐ THE ONLY SOURCE OF WHAT IS SHOWN. */
  const reload = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/writers-studio/editorial/thread?threadId=${encodeURIComponent(id)}`);
    if (!res.ok) { setFailure('This conversation could not be read.'); return; }
    setView(await res.json());
  }, []);

  /* ⛔ READ ONLY. This effect cannot create anything. */
  useEffect(() => { void reload(threadId); }, [threadId, reload]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [view, busy]);

  const send = async () => {
    const text = draft;
    if (text.trim().length === 0 || busy) return;
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

  /* ⭐ THE WRITER'S OWN FORMULATION. */
  const addMyVersion = async () => {
    if (!composerTarget || wordingBusy) return;
    setWordingBusy(true); setWordingRefusal(null);
    try {
      const res = await apiFetch('/api/writers-studio/editorial/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* ⛔ `supersedes` IS THE FROZEN TARGET, carried exactly. ⛔ Not
           `view.headVersionId`, which may have moved while they wrote. */
        body: JSON.stringify({
          threadId,
          supersedes: composerTarget.versionId,
          replacementText: wording,
        }),
      });
      if (res.status === 201) {
        /* ⭐ THE SCREEN AGREES WITH STORAGE. ⛔ The submitted text is never
           spliced into the visible lineage — it is re-read from the server. */
        await reload(threadId);
        setComposerTarget(null); setWording('');
        return;
      }
      const body = await res.json().catch(() => null);
      setWordingRefusal(typeof body?.error === 'string' ? body.error : 'unknown');
      /* ⭐ Re-read so they can SEE what moved — ⛔ while their draft and their
         frozen target both survive it. */
      await reload(threadId);
    } catch {
      setWordingRefusal('unknown');
    } finally { setWordingBusy(false); }
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
      {/* ⭐ The writer's own wording, as the relationship froze it. It is what
          the conversation is ABOUT, and it is never replaced by a candidate.

          ⭐⭐ "This passage" is CONTENT, not a second title bar. The two labels
          answer different questions and both are worth keeping:

              MAIA · conversation   what region am I in?     (StudioPanel)
              This passage          what is this about?      (here)

          ⛔ And there is no close here. StudioPanel's contract owns the band
          label, whether the panel is dismissible, and the dismiss control —
          "a panel is chrome around content", so a second exit gesture inside
          the content was this component answering a question it was not
          asked. */}
      {view && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.tight }}>
          <StudioText role="panelLabel" style={{ color: INK.muted }}>This passage</StudioText>
          <blockquote style={{
            ...typeStyle('maiaReading'), margin: 0, color: INK.secondary,
            borderLeft: `2px solid ${RULE.soft}`, paddingLeft: SPACE.snug,
          }}>
            {view.locusText}
          </blockquote>
        </div>
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

      {/* ══ THE AUTHORED SUCCESSION ═══════════════════════════════════════
          ⛔ NOT THE TRANSCRIPT. This is wording, in the order it supersedes —
          the chain's own validated lineage, read from the server. */}
      {view && view.versions.length > 0 && (
        <section aria-label="Wording in this exchange"
          style={{ borderTop: `1px solid ${RULE.soft}`, paddingTop: SPACE.base,
                   display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          <StudioText role="panelLabel" style={{ color: INK.muted }}>
            Wording in this exchange
          </StudioText>
          {view.versions.map((v, i) => (
            <div key={v.id} data-version={v.id} data-version-author={v.author}
              style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
              <StudioText role="panelLabel"
                style={{ color: v.author === 'maia' ? MAIA_ACCENT.voice : INK.muted }}>
                {`${authorLabel(v.author)} · Version ${i + 1}`}
              </StudioText>
              <StudioText role="maiaReading" style={{ whiteSpace: 'pre-wrap' }}>{v.wording}</StudioText>
              {/* ⭐⭐ THE PREDECESSOR IS CHOSEN EXPLICITLY, on a particular
                  version. ⛔ The composer never opens against "the latest". */}
              <button type="button"
                onClick={() => {
                  setComposerTarget({ versionId: v.id, author: v.author, ordinal: i + 1 });
                  /* ⛔ AND THE FIELD STARTS EMPTY. Never prefilled with the
                     target's wording: authoring identical text is lawful, but
                     the system must not manufacture that authorship. */
                  setWording(''); setWordingRefusal(null);
                }}
                style={{ ...typeStyle('panelLabel'), alignSelf: 'flex-start', marginTop: SPACE.tight,
                         background: 'none', border: `1px solid ${RULE.soft}`,
                         borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.snug}px`,
                         color: INK.secondary, cursor: 'pointer' }}>
                Write my version from this
              </button>
            </div>
          ))}
          {/* ⭐ THE STANDING SENTENCE. ⛔ No Keep / Revise / Adopt controls in
              this cut — the writer may answer in wording, and nothing more. */}
          <StudioText role="metadata" style={{ color: INK.quiet }}>
            Nothing changes until you explicitly adopt a version.
          </StudioText>
        </section>
      )}

      {/* ══ YOUR VERSION ══════════════════════════════════════════════════ */}
      {composerTarget && (
        <section aria-label="Your version"
          style={{ borderTop: `1px solid ${RULE.soft}`, paddingTop: SPACE.base,
                   display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
          <StudioText role="panelLabel">Your version</StudioText>
          {/* ⭐ The label says what the act IS. That is the whole protection:
              there is no classifier guessing whether a sentence "sounds like" a
              question, because a guess would refuse real prose. */}
          <StudioText role="metadata" style={{ color: INK.muted }}>
            Write the wording you would put in the manuscript.
          </StudioText>
          <textarea
            value={wording}
            onChange={(e) => setWording(e.target.value)}
            rows={4}
            spellCheck
            aria-label="Write your version of this passage"
            style={{
              ...typeStyle('maiaReading'), width: '100%', resize: 'vertical',
              background: GROUND.base, color: INK.primary,
              border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
              padding: SPACE.snug, outline: 'none',
            }}
          />
          {/* ⭐ The relationship is STATED before submission, not discovered
              after — and it names the frozen target, never the head. */}
          <StudioText role="metadata" style={{ color: INK.muted }} data-composer-target={composerTarget.versionId}>
            {`Your version follows: ${authorLabel(composerTarget.author)} · Version ${composerTarget.ordinal}`}
          </StudioText>
          {wordingRefusal !== null && (
            <StudioText role="metadata" style={{ color: INK.secondary }}>
              {refusalCopy(wordingRefusal)}
            </StudioText>
          )}
          <div style={{ display: 'flex', gap: SPACE.snug }}>
            <button type="button" onClick={() => void addMyVersion()} disabled={wordingBusy}
              style={{ ...typeStyle('panelLabel'), background: 'none',
                       border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                       padding: `${SPACE.tight}px ${SPACE.snug}px`, color: INK.primary, cursor: 'pointer' }}>
              Add my version
            </button>
            <button type="button"
              onClick={() => { setComposerTarget(null); setWording(''); setWordingRefusal(null); }}
              style={{ ...typeStyle('panelLabel'), background: 'none', border: 'none',
                       color: INK.muted, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </section>
      )}

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
          <button type="button" onClick={() => void send()} disabled={busy}
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
