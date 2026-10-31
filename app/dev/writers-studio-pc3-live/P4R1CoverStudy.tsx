'use client';

/**
 * Soullab Press → Publish: author-controlled, in-session COVER COMPOSITION.
 * NO server edition custody, asset uploads, ISBN synthesis, KDP PDF export, or
 * user-facing claim that this study will survive a reload.
 * The owner must explicitly open this study; GET obtains only verified member
 * manuscript metadata. Never look at or transmit Source prose.
 */
import { useEffect, useReducer, useRef, useState } from 'react';
import { activeCoverEdition, coverSessionReducer, EMPTY_COVER_SESSION } from '@/lib/writersStudio/publish/coverDesignSession';
import { apiFetch } from '@/lib/http/apiBase';

type Proof = { title: string; authority: 'working_draft' | 'source'; revision: string | null };

function readProof(value: unknown, workTitle?: string | null): Proof | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.title !== 'string' || entry.title.trim().length === 0) return null;
  if (entry.sourceAuthority !== 'working_draft' && entry.sourceAuthority !== 'source') return null;
  if (entry.sourceAuthority === 'working_draft'
    ? (typeof entry.sourceRevision !== 'string' || !entry.sourceRevision)
    : entry.sourceRevision !== null) return null;
  // The raw title distinguishes an unnamed expression from an author who
  // deliberately called their manuscript “Your writing”. Never guess from a
  // display placeholder or overwrite an authored expression title.
  if ('manuscriptTitle' in entry && entry.manuscriptTitle !== null
    && typeof entry.manuscriptTitle !== 'string') return null;
  const title = 'manuscriptTitle' in entry
    ? (entry.manuscriptTitle as string | null)?.trim() || workTitle?.trim() || entry.title.trim()
    : entry.title.trim();
  return {
    title,
    authority: entry.sourceAuthority,
    revision: entry.sourceRevision as string | null,
  };
}

export default function P4R1CoverStudy({ manuscriptId, workTitle }: { manuscriptId: string; workTitle?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [proof, setProof] = useState<Proof | null>(null);
  const [status, setStatus] = useState<'closed' | 'loading' | 'held' | 'ready'>('closed');
  const [design, dispatch] = useReducer(coverSessionReducer, EMPTY_COVER_SESSION);
  const workTitleRef = useRef(workTitle);
  useEffect(() => { workTitleRef.current = workTitle; }, [workTitle]);

  useEffect(() => {
    if (!expanded) {
      // The author was told these cover options are NOT saved. Clear private
      // preview text when the study is closed; don't retain after deletion.
      setProof(null);
      dispatch({ type: 'clear' });
      setStatus('closed');
      return;
    }
    const controller = new AbortController();
    let live = true;
    setStatus('loading');
    setProof(null);
    dispatch({ type: 'clear' });
    const url = '/api/sovereign/manuscripts/' + encodeURIComponent(manuscriptId) + '/render';
    void (async () => {
      try {
        const response = await apiFetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('unavailable');
        const envelope: unknown = await response.json();
        const current = readProof(envelope, workTitleRef.current);
        if (!live) return;
        if (!current) {
          setStatus('held');
          return;
        }
        setProof(current);
        dispatch({ type: 'start', title: current.title });
        setStatus('ready');
      } catch {
        if (live) setStatus('held');
      }
    })();
    return () => {
      live = false;
      controller.abort();
    };
  }, [expanded, manuscriptId]);

  const hasUnsavedCoverEdits = expanded && design.past.length > 0;
  useEffect(() => {
    if (!hasUnsavedCoverEdits) return;
    const protectDraft = (event: BeforeUnloadEvent) => {
      // This session study has no lawful server custody yet; never imply the
      // author can simply reload and recover its cover text/layer decisions.
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [hasUnsavedCoverEdits]);

  const preflightVersion = proof?.authority === 'working_draft'
    ? 'Working Draft · revision ' + proof.revision : 'Original Source';
  const currentDesign = design.present;
  const edition = currentDesign ? activeCoverEdition(currentDesign) : null;
  const target = currentDesign?.selected ?? 'paperback';
  const palette = edition?.palette ?? 'forest';
  const title = edition?.title ?? '';
  const subtitle = edition?.subtitle ?? '';
  const byline = edition?.byline ?? '';
  const backText = edition?.backText ?? '';
  const isPrint = target !== 'kindle';

  return (
    <details className="p4r1-cover-study" data-governed-cover-study
      data-cover-status={status}
      onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary onClick={(event) => {
        if (expanded && design.past.length > 0 &&
            !window.confirm('This cover study has unsaved edits. Closing it discards the session-only design. Close anyway?')) {
          event.preventDefault();
        }
      }}>
        <span>
          <b>Cover · compose a direction</b>
          <small>Front, back, Kindle · no save, no file export, no KDP approval</small>
        </span>
        <span className="p4r1-cover-chip">Design study</span>
      </summary>
      <div className="p4r1-cover-work">
        <p className="p4r1-cover-constraint">
          Explore composition using your book’s verified title. This is session-only:
          closing or leaving loses these choices. No artwork is uploaded, and
          your manuscript, design files, publishing rights, and ISBN are unchanged.
        </p>
        {status === 'loading' ? <p role="status">Checking this Work’s cover context…</p> : null}
        {status === 'held' ? <p role="alert" data-cover-held>
          Cover design needs a confirmed member-owned manuscript and current version.
          Return to Write if this Work is unavailable.
        </p> : null}
        {status === 'ready' && proof ? (
          <>
            <header className="p4r1-cover-context">
              <strong>{proof.title}</strong>
              <span>{preflightVersion} · design not saved</span>
            </header>
            <div className="p4r1-cover-controls">
              <fieldset>
                <legend>Edition exploration</legend>
                {(['paperback','hardcover','kindle'] as const).map(choice => (
                  <label key={choice}>
                    <input type="radio" name={'cover-edition-' + manuscriptId}
                      checked={target === choice} onChange={() => dispatch({ type: 'target', value: choice })} />
                    {choice === 'kindle' ? 'Kindle cover' : choice === 'hardcover' ? 'Hardcover' : 'Paperback'}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Color field</legend>
                {(['forest','ink','paper'] as const).map(choice => (
                  <button type="button" key={choice} aria-pressed={palette === choice}
                    onClick={() => dispatch({ type: 'palette', value: choice })}>{choice}</button>
                ))}
              </fieldset>
              <div className="p4r1-cover-fields">
                <label>Book title
                  <input aria-label="Cover title" maxLength={170} value={title} onChange={e => dispatch({ type: 'text', field: 'title', value: e.target.value })} />
                </label>
                <label>Subtitle (optional)
                  <input aria-label="Cover subtitle" maxLength={240} value={subtitle} onChange={e => dispatch({ type: 'text', field: 'subtitle', value: e.target.value })} />
                </label>
                <label>Author / byline
                  <input aria-label="Cover author" maxLength={130} value={byline} onChange={e => dispatch({ type: 'text', field: 'byline', value: e.target.value })} />
                </label>
                {isPrint ? <label>Back-cover description
                  <textarea aria-label="Back cover description" maxLength={850} value={backText}
                    onChange={e => dispatch({ type: 'text', field: 'backText', value: e.target.value })} rows={4} />
                </label> : null}
              </div>
              <fieldset style={{ gridColumn: '1 / -1' }}>
                <legend>Reversible cover edits · this session only</legend>
                <button type="button" disabled={design.past.length === 0}
                  data-cover-undo={design.past.length}
                  onClick={() => dispatch({ type: 'undo' })}>Undo cover edit</button>
                <button type="button" disabled={design.future.length === 0}
                  data-cover-redo={design.future.length}
                  onClick={() => dispatch({ type: 'redo' })}>Redo cover edit</button>
                <button type="button" disabled={(edition?.titleOffsetPx ?? 0) <= -48}
                  aria-label="Move cover title higher"
                  onClick={() => dispatch({ type: 'moveTitle', delta: -12 })}>Title ↑</button>
                <button type="button" disabled={(edition?.titleOffsetPx ?? 0) >= 48}
                  aria-label="Move cover title lower"
                  onClick={() => dispatch({ type: 'moveTitle', delta: 12 })}>Title ↓</button>
              </fieldset>
            </div>

            <section className="p4r1-cover-display" data-cover-palette={palette} data-cover-target={target}
              aria-label="In-session book cover composition">
              {isPrint ? (
                <article className="p4r1-cover-back-panel">
                  <span>Back</span>
                  <p data-cover-back-copy>{backText || 'Back-cover description belongs here.'}</p>
                  <small>ISBN / barcode reserved · geometry not certified</small>
                </article>
              ) : null}
              {isPrint ? (
                <div className="p4r1-cover-spine-panel" aria-label="Spine dimensions pending measured interior">
                  <span>Spine pending verified PDF</span>
                </div>
              ) : null}
              <article className="p4r1-cover-front-panel">
                <span>Front</span>
                <h4 data-cover-front-title
                  data-cover-title-offset={edition?.titleOffsetPx ?? 0}
                  style={{ transform: `translateY(${edition?.titleOffsetPx ?? 0}px)` }}>
                  {title || 'Untitled Work'}
                </h4>
                {subtitle ? <p data-cover-front-subtitle>{subtitle}</p> : null}
                <strong data-cover-front-author>{byline || 'Author name'}</strong>
              </article>
            </section>
            <p className="p4r1-cover-footnote">
              {target === 'hardcover'
                ? 'Hardcover case-wrap requires its own official template, hinges, wrap, and safe zones. No paperback spine formula is reused.'
                : target === 'paperback'
                ? 'Paperback spine width needs the exact accepted interior page count and paper stock. No provisional dimension is presented as printable.'
                : 'Kindle uses a separate front-cover image; this session view is not an approved image file.'}
              Full-resolution artwork, licensed font embedding, author-owned saved layers,
              barcode safety and a validated production PDF/image are still required.
            </p>
          </>
        ) : null}
      </div>
    </details>
  );
}
