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
import { authorizeEditorialProcessing } from '@/lib/writersStudio/rebuild/editorialDisclosure';
import { useCallback, useEffect, useRef, useState } from 'react';
/* ⭐ WS-EDITORIAL-SCOPE-01 · the same control and the same defaults as the desk.
   ⛔ Not a second implementation: this surface calls the same route, and a
   surface that sends no latitude gets the protective default — correct, but it
   left the writer with no way to widen it. */
import EditingLatitude, { useEditingLatitude } from '../insight/EditingLatitude';
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
  /** ⭐ Server-derived, so the per-Work setting is keyed by the Work. */
  workId: string;
  locusText: string;
  /** ⭐ Server-derived. ⛔ The browser never names the place a change belongs. */
  targetSectionId: string | null;
  sectionLabel: string | null;
  /** ⚠️ Pre-alignment locus: readable and comparable, ⛔ never adoptable. */
  legacyLocus: boolean;
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

/**
 * ⭐⭐ WHICH AUTHORED WORDING THE WRITER IS LOOKING AT — frozen by their click,
 * exactly as `ComposerTarget` is, and for the same reason.
 *
 * ⛔ NEVER `headVersionId`, ⛔ never `versions[versions.length - 1]`, ⛔ never
 * `composerTarget`. Those answer different questions, and a comparison that
 * followed the head would silently change what the writer is reading while they
 * are reading it.
 *
 * ⛔ AND IT IS NOT A DECISION. Comparison shows two immutable facts and carries
 * no authority consequence: no Keep, no Adopt, no Apply, no write of any kind.
 */
interface ComparisonTarget {
  versionId: string;
  author: 'maia' | 'member';
  ordinal: number;
}

/* ══ ADOPTION-01 · PHASE B ══════════════════════════════════════════════════
   ⭐⭐ THE OUTCOME, AS THE SERVER REPORTED IT. ⛔ Not reconstructed, not
   summarised into a boolean, and ⛔ `permission` is never dropped: it is the
   difference between *you never authorized this* and *you authorized it and it
   could not run*. */
interface AdoptionPermission {
  established: boolean;
  authorizationId?: string;
  authorizedAt?: string;
}
interface AdoptionOutcome {
  kind: 'applied' | 'work_moved' | 'system_refusal' | 'relationship_refusal';
  permission?: AdoptionPermission;
  reason?: string;
  resultingVersion?: number;
  acceptedAt?: string;
  byThisGesture?: boolean;
}

/**
 * ⭐⭐ WHICH EXACT VERSION THE WRITER IS ADOPTING — frozen by their click, the
 * same law `ComposerTarget` and `ComparisonTarget` hold.
 *
 * ⛔ NEVER `headVersionId`, ⛔ never `versions[versions.length - 1]`. An
 * adoption that followed the head would change what the writer permitted
 * between reading it and confirming it, which is the one thing adoption may
 * never do.
 */
interface AdoptionTarget {
  versionId: string;
  author: 'maia' | 'member';
  ordinal: number;
}

const authorLabel = (a: 'maia' | 'member') => (a === 'maia' ? 'MAIA' : 'Your version');

/** ⭐ Where the change belongs, in the writer's own words — or plainly. */
const placeLabel = (label: string | null) => (label && label.trim().length > 0 ? label : 'this passage');

/**
 * ⭐⭐ THREE OUTCOME FAMILIES, KEPT VISIBLY DISTINCT.
 *
 *     applied         something changed, and it says what
 *     work_moved      ⭐ a TRUE fact about her manuscript — ⛔ and it never
 *                     implies the authorization did not happen
 *     system_refusal  ⛔ SYSTEM LANGUAGE. A write the Studio could not perform
 *                     is not anthropomorphized into a claim about the book.
 *
 * The source obligation, from the Phase B ruling:
 *
 *     manuscript-state refusal  ≠  system failure
 */
function adoptionCopy(o: AdoptionOutcome, place: string): string {
  switch (o.kind) {
    case 'applied':
      return o.byThisGesture === false
        /* ⭐ *"Nothing was changed"* would be FALSE here: the version is in the
           Work and the receipt is real — this click simply was not the write. */
        ? `This version was already adopted into ${place}.`
        : `Adopted into ${place}.`;
    case 'work_moved':
      return 'You\u2019ve written here since this version was made. Nothing was changed.';
    case 'system_refusal':
      return 'The Studio couldn\u2019t apply this version. Nothing was changed.';
    case 'relationship_refusal':
      return 'This exchange could not be read. Nothing was changed.';
  }
}

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
  const {
    latitude, setLatitude, mayRemoveParagraphs, setMayRemoveParagraphs,
    mayProposeImmediately, setMayProposeImmediately,
  } = useEditingLatitude(view?.workId ?? '');
  /* ⭐⭐ THE MEMBER DECLARES THE ACT. ⛔ Never classified from their wording. */
  const [actKind, setActKind] = useState<'discourse' | 'direction'>('discourse');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  /* ⭐⭐ CREATED BY THE WRITER'S CLICK, and nothing else may set it. */
  const [composerTarget, setComposerTarget] = useState<ComposerTarget | null>(null);
  const [wording, setWording] = useState('');
  const [wordingBusy, setWordingBusy] = useState(false);
  const [wordingRefusal, setWordingRefusal] = useState<string | null>(null);
  /* ⭐ Presentation state, set ONLY by an explicit gesture on one version.
     ⛔ Nothing derives it, and `reload()` does not touch it. */
  const [comparisonTarget, setComparisonTarget] = useState<ComparisonTarget | null>(null);
  /* ⭐⭐ ADOPTION — frozen by the writer's click, and set by nothing else.
     ⛔ `reload()` does not touch it: a version landing while she is reading the
     confirmation must not change what she is about to permit. */
  const [adoptionTarget, setAdoptionTarget] = useState<AdoptionTarget | null>(null);
  const [adoptionBusy, setAdoptionBusy] = useState(false);
  const [adoptionOutcome, setAdoptionOutcome] = useState<AdoptionOutcome | null>(null);
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
    const externalProcessing = authorizeEditorialProcessing();
    if (!externalProcessing) return;
    setBusy(true); setFailure(null);
    try {
      const res = await apiFetch('/api/writers-studio/editorial/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* ⛔ THE MEMBER'S TEXT, EXACTLY. No trim — the server stores what they
           wrote, and a Direction's instruction IS the turn body. */
        body: JSON.stringify({
          threadId, externalProcessing, act: { act: actKind, text, refersTo: null },
          /* ⭐ The writer's declared editing latitude for this exchange. */
          scope: { latitude, mayRemoveParagraphs, mayProposeImmediately },
        }),
      });
      /* ⭐ Reload either way: on a MAIA-side failure the member's turn STILL
         persisted, and the surface must show that rather than pretend the
         exchange never happened. */
      await reload(threadId);
      if (res.ok) { setDraft(''); setActKind('discourse'); }
      else {
        /* ⭐⭐ A SCOPE REFUSAL IS A RESULT, NOT A FAULT. The writer set a
           latitude and the system held it. ⛔ Never reported as *MAIA could not
           answer* — she could, and what she produced went further than the
           writer allowed. Saying which is how the writer learns the control. */
        const why = await res.json().catch(() => null);
        setFailure(res.status === 409 && typeof why?.detail === 'string'
          ? `Your words are saved. ${why.detail}`
          : 'Your words are saved. MAIA could not answer this time.');
      }
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

  /**
   * ⭐⭐ ONE GESTURE, TWO LEGAL ACTS BEHIND IT.
   *
   * She clicks once. The server authorizes the exact version she named and then
   * immediately attempts execution under a fresh fit check. ⛔ This function
   * sends TWO IDS and nothing else: no base version, no range, no expected
   * text, no idempotency token. Every other fact is the server's.
   *
   * ⛔ AND IT NEVER RETRIES. A refusal is an outcome to report, never a
   * condition to work around — a second automatic attempt would be this surface
   * deciding that the manuscript's answer was inconvenient.
   */
  const adopt = async () => {
    if (!adoptionTarget || adoptionBusy) return;
    setAdoptionBusy(true); setAdoptionOutcome(null);
    try {
      const res = await apiFetch('/api/writers-studio/editorial/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* ⛔ THE FROZEN TARGET, EXACTLY. Never `view.headVersionId`. */
        body: JSON.stringify({ threadId, versionId: adoptionTarget.versionId }),
      });
      const body = await res.json().catch(() => null);
      setAdoptionOutcome(
        body && typeof body.kind === 'string'
          ? (body as AdoptionOutcome)
          /* ⛔ An unreadable response is a SYSTEM refusal, never a claim that
             the manuscript moved. The two families must not borrow each
             other's language when the surface is uncertain. */
          : { kind: 'system_refusal', reason: 'unreadable_response' });
      /* ⭐ The screen agrees with storage either way. */
      await reload(threadId);
    } catch {
      setAdoptionOutcome({ kind: 'system_refusal', reason: 'unreachable' });
    } finally { setAdoptionBusy(false); }
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
              <div style={{ display: 'flex', gap: SPACE.snug, marginTop: SPACE.tight }}>
              {/* ⭐ COMPARISON IS ITS OWN EXPLICIT GESTURE, on this version. */}
              <button type="button"
                data-compare={v.id}
                onClick={() => setComparisonTarget(
                  { versionId: v.id, author: v.author, ordinal: i + 1 })}
                style={{ ...typeStyle('panelLabel'), alignSelf: 'flex-start',
                         background: 'none', border: `1px solid ${RULE.soft}`,
                         borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.snug}px`,
                         color: INK.secondary, cursor: 'pointer' }}>
                Compare with passage
              </button>
              <button type="button"
                onClick={() => {
                  setComposerTarget({ versionId: v.id, author: v.author, ordinal: i + 1 });
                  /* ⛔ AND THE FIELD STARTS EMPTY. Never prefilled with the
                     target's wording: authoring identical text is lawful, but
                     the system must not manufacture that authorship. */
                  setWording(''); setWordingRefusal(null);
                }}
                style={{ ...typeStyle('panelLabel'), alignSelf: 'flex-start',
                         background: 'none', border: `1px solid ${RULE.soft}`,
                         borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.snug}px`,
                         color: INK.secondary, cursor: 'pointer' }}>
                Write my version from this
              </button>
              </div>
            </div>
          ))}
          {/* ⭐ THE STANDING SENTENCE. ⛔ No Keep / Revise / Adopt controls in
              this cut — the writer may answer in wording, and nothing more. */}
          <StudioText role="metadata" style={{ color: INK.quiet }}>
            Nothing changes until you explicitly adopt a version.
          </StudioText>
        </section>
      )}

      {/* ══ COMPARE ═══════════════════════════════════════════════════════
          ⭐⭐ TWO IMMUTABLE FACTS, SIDE BY SIDE. ⛔ No authority consequence:
          this reads what is already on screen and writes nothing anywhere. */}
      {comparisonTarget && view && (() => {
        /* ⭐ Looked up BY THE FROZEN ID. Versions are immutable, so this shows
           what the server says about the version the writer chose — ⛔ never
           whichever version happens to be current. */
        const shown = view.versions.find((v) => v.id === comparisonTarget.versionId);
        if (!shown) return null;
        return (
          <section aria-label="Compare"
            style={{ borderTop: `1px solid ${RULE.soft}`, paddingTop: SPACE.base,
                     display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.snug }}>
              <StudioText role="panelLabel">Compare</StudioText>
              <button type="button" onClick={() => setComparisonTarget(null)}
                style={{ ...typeStyle('panelLabel'), marginLeft: 'auto', background: 'none',
                         border: 'none', color: INK.muted, cursor: 'pointer' }}>
                Done comparing
              </button>
            </div>
            {/* Side by side where there is room, stacked where there is not.
                ⛔ No character diff: full exact wording is already truthful, and
                a diff engine is another interpretation surface. */}
            <div style={{ display: 'grid', gap: SPACE.base,
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div data-compare-side="passage"
                style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
                {/* ⭐ NOT "Original". `locusText` is the chain's HISTORICAL
                    provenance — the passage as this relationship opened — and
                    the Work may have moved since. "Original" would be read as
                    "what the manuscript says now". */}
                <StudioText role="panelLabel" style={{ color: INK.muted }}>
                  Passage when this exchange opened
                </StudioText>
                <StudioText role="maiaReading" style={{ whiteSpace: 'pre-wrap' }}>
                  {view.locusText}
                </StudioText>
              </div>
              <div data-compare-side="version" data-compare-version={shown.id}
                style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
                {/* ⭐ Authorship stays visible on the side that has an author. */}
                <StudioText role="panelLabel"
                  style={{ color: shown.author === 'maia' ? MAIA_ACCENT.voice : INK.muted }}>
                  {`${authorLabel(shown.author)} · Version ${comparisonTarget.ordinal}`}
                </StudioText>
                <StudioText role="maiaReading" style={{ whiteSpace: 'pre-wrap' }}>
                  {shown.wording}
                </StudioText>
              </div>
            </div>
            {/* ⚠️ UI-03 said *no decision lives here*, and ADOPTION-01 · Phase B
                deliberately changes that: the ruled flow is COMPARE → ADOPT, so
                the decision belongs beside the two facts it is made from. ⛔ The
                sentence is corrected rather than left standing while false.

                ⭐ What has NOT changed: comparison still shows two immutable
                facts, and the adoption acts on the SAME frozen version the
                writer opened — ⛔ never the head. */}
            {/* ⚠️⚠️ A RELATIONSHIP FROM BEFORE THE LOCUS ALIGNMENT.
                ⭐ SYSTEM AND HISTORICAL LANGUAGE, deliberately. ⛔ Never "you
                changed the text", ⛔ never "conversion failed", and ⛔ never a
                suggestion that the exchange is corrupt or lost — it is neither.
                Only adoption is withheld. */}
            {view.legacyLocus ? (
              <StudioText role="metadata" style={{ color: INK.secondary }}
                data-adopt-unavailable="legacy_locus">
                This older editorial relationship can&rsquo;t be safely adopted
                into the manuscript. You can still read and compare it.
              </StudioText>
            ) : adoptionTarget?.versionId === shown.id ? (
              <div data-adopt-confirm={shown.id}
                style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug,
                         border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                         padding: SPACE.snug, background: GROUND.base }}>
                {/* ⭐⭐ THE PLACE IS THE SERVER'S. ⛔ The browser does not search
                    the manuscript to say where this belongs, and it shows no
                    offsets it did not receive. */}
                <StudioText role="panelLabel">
                  {`Adopt this version into ${placeLabel(view.sectionLabel)}?`}
                </StudioText>
                <StudioText role="metadata" style={{ color: INK.muted }}>
                  This replaces the passage at the location the manuscript
                  identifies with the version you selected.
                </StudioText>
                <div style={{ display: 'flex', gap: SPACE.snug }}>
                  <button type="button" data-adopt-confirm-commit={shown.id}
                    onClick={() => void adopt()} disabled={adoptionBusy}
                    style={{ ...typeStyle('panelLabel'), background: 'none',
                             border: `1px solid ${RULE.soft}`, borderRadius: RADIUS.sm,
                             padding: `${SPACE.tight}px ${SPACE.snug}px`,
                             color: INK.primary, cursor: 'pointer' }}>
                    {adoptionBusy ? 'Adopting\u2026' : 'Adopt this version'}
                  </button>
                  <button type="button"
                    onClick={() => { setAdoptionTarget(null); setAdoptionOutcome(null); }}
                    style={{ ...typeStyle('panelLabel'), background: 'none', border: 'none',
                             color: INK.muted, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button"
                data-adopt={shown.id}
                onClick={() => {
                  /* ⛔ FROZEN FROM THE COMPARISON SHE OPENED, not from the
                     lineage as it stands at click time. */
                  setAdoptionTarget({
                    versionId: comparisonTarget.versionId,
                    author: comparisonTarget.author,
                    ordinal: comparisonTarget.ordinal,
                  });
                  setAdoptionOutcome(null);
                }}
                style={{ ...typeStyle('panelLabel'), alignSelf: 'flex-start',
                         background: 'none', border: `1px solid ${RULE.soft}`,
                         borderRadius: RADIUS.sm, padding: `${SPACE.tight}px ${SPACE.snug}px`,
                         color: INK.primary, cursor: 'pointer' }}>
                Adopt this version&hellip;
              </button>
            )}

            {/* ══ THE OUTCOME ══════════════════════════════════════════════
                ⭐⭐ THREE FAMILIES, NEVER COLLAPSED. And where a permission was
                established it is SAID SO — an execution that refused does not
                erase the authorization that preceded it. */}
            {adoptionOutcome && (
              <div data-adopt-outcome={adoptionOutcome.kind}
                style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
                <StudioText role="metadata" style={{ color: INK.secondary }}>
                  {adoptionCopy(adoptionOutcome, placeLabel(view.sectionLabel))}
                </StudioText>
                {adoptionOutcome.kind === 'applied'
                  && typeof adoptionOutcome.resultingVersion === 'number' && (
                  <StudioText role="metadata" style={{ color: INK.quiet }}
                    data-adopt-resulting-version={adoptionOutcome.resultingVersion}>
                    {`Your manuscript is at version ${adoptionOutcome.resultingVersion}.`}
                  </StudioText>
                )}
                {/* ⭐⭐ THE HALF THE RULING INSISTS ON: an authorize-then-refuse
                    must never read as though nothing was permitted. */}
                {adoptionOutcome.kind !== 'applied'
                  && adoptionOutcome.permission?.established === true && (
                  <StudioText role="metadata" style={{ color: INK.quiet }}
                    data-adopt-permission="established">
                    Your permission to adopt this version is on record. Nothing
                    was written.
                  </StudioText>
                )}
                {/* ⛔ A SUPPORT CODE, NOT AN EXPLANATION. She is never asked to
                    understand an internal failure name, and it is shown only
                    for the system family — a manuscript fact needs no code. */}
                {adoptionOutcome.kind === 'system_refusal' && adoptionOutcome.reason && (
                  <StudioText role="metadata" style={{ color: INK.quiet }}
                    data-adopt-reason={adoptionOutcome.reason}>
                    {`Reference: ${adoptionOutcome.reason}`}
                  </StudioText>
                )}
              </div>
            )}
          </section>
        );
      })()}

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

      {/* ── ⭐ The writer's editing latitude, beside the composer, because it
             governs the message about to be sent. ⛔ Not in a settings panel:
             a control the writer has to go looking for is one they discover by
             being shown their own paragraphs struck through. ── */}
      <EditingLatitude
        latitude={latitude} onLatitude={setLatitude}
        mayRemoveParagraphs={mayRemoveParagraphs}
        onMayRemoveParagraphs={setMayRemoveParagraphs}
        mayProposeImmediately={mayProposeImmediately}
        onMayProposeImmediately={setMayProposeImmediately}
        disabled={busy} />

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
