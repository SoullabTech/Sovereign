'use client';

/**
 * Soullab Press → modern Publish: first governed interior-reading bridge.
 *
 * Reuses the verified Writer context read route and the original Book Studio's
 * page/typographic thinking WITHOUT admitting its browser-local project store.
 *
 * This is NOT printed pagination, a PDF proof, an edition save, or an export.
 * Only the current member-owned, section-addressable Working Draft can appear.
 * The author explicitly opens the view; private prose is never prefetched.
 */
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type PageStyle = 'literary' | 'classic' | 'plain';
type Phase = 'closed' | 'loading' | 'ready' | 'held' | 'error';
type DraftSection = {
  draftSectionId: string;
  position: number;
  heading: string | null;
  body: string;
  editable: boolean;
};
type CurrentDraft = {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  sections: DraftSection[];
};

function readCurrentOwnedDraft(value: unknown, manuscriptId: string): CurrentDraft | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (entry.state !== 'section_aware' || entry.manuscriptId !== manuscriptId ||
      typeof entry.version !== 'number' || !Number.isSafeInteger(entry.version) ||
      !Array.isArray(entry.sections) || entry.sections.length === 0 ||
      (entry.title !== null && typeof entry.title !== 'string')) return null;

  const sections: DraftSection[] = [];
  for (const section of entry.sections) {
    if (!section || typeof section !== 'object' || Array.isArray(section)) return null;
    const part = section as Record<string, unknown>;
    if (typeof part.draftSectionId !== 'string' || !part.draftSectionId ||
        typeof part.position !== 'number' || !Number.isSafeInteger(part.position) ||
        (part.heading !== null && typeof part.heading !== 'string') ||
        typeof part.body !== 'string' || typeof part.editable !== 'boolean') return null;
    sections.push({
      draftSectionId: part.draftSectionId,
      position: part.position,
      heading: part.heading,
      body: part.body,
      editable: part.editable,
    });
  }
  return {
    state: 'section_aware',
    manuscriptId,
    title: entry.title as string | null,
    version: entry.version,
    sections,
  };
}

const STYLE_OPTIONS: { id: PageStyle; label: string }[] = [
  { id: 'literary', label: 'Literary' },
  { id: 'classic', label: 'Classic' },
  { id: 'plain', label: 'Contemporary' },
];

export default function P4R1InteriorProof({ manuscriptId }: { manuscriptId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [revision, setRevision] = useState<CurrentDraft | null>(null);
  const [phase, setPhase] = useState<Phase>('closed');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pageStyle, setPageStyle] = useState<PageStyle>('literary');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!expanded) {
      setRevision(null);
      setPhase('closed');
      return;
    }
    const controller = new AbortController();
    let current = true;
    setRevision(null);
    setSelectedIndex(0);
    setPhase('loading');

    void (async () => {
      try {
        const url = '/api/writers-studio/rebuild/context?manuscriptId=' +
          encodeURIComponent(manuscriptId);
        const response = await apiFetch(url, {
          method: 'GET', cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('No confirmed access to the current manuscript.');
        const data: unknown = await response.json();
        if (!current) return;
        const draft = readCurrentOwnedDraft(data, manuscriptId);
        if (!draft) {
          // A legacy/unconverted draft is not silently replaced with old Source.
          setPhase('held');
          return;
        }
        setRevision(draft);
        setPhase('ready');
      } catch {
        if (!current) return;
        setRevision(null);
        setPhase('error');
      }
    })();

    return () => {
      current = false;
      controller.abort();
    };
  }, [expanded, manuscriptId, retry]);

  const pages = revision?.manuscriptId === manuscriptId ? revision.sections : null;
  const chosen = useMemo(
    () => pages?.[Math.min(selectedIndex, pages.length - 1)] ?? null,
    [pages, selectedIndex],
  );
  const title = revision?.title?.trim() || 'Untitled Work';
  const index = pages && chosen ? pages.indexOf(chosen) : 0;

  return (
    <details
      className="p4r1-interior-study"
      data-governed-interior-study
      data-interior-status={phase}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary className="p4r1-interior-summary">
        <span>
          <b>Interior · see your writing on a page</b>
          <small>Original Pro Canvas principles · current Work · no changes saved</small>
        </span>
        <span className="p4r1-interior-preview-chip">Layout study</span>
      </summary>
      <div className="p4r1-interior-content">
        <p className="p4r1-interior-boundary">
          This is a private reading and typography study of your current Working Draft,
          not measured pagination or a certified book proof. Your words, Source, and design files are not changed.
        </p>
        {phase === 'loading' ? <p role="status">Opening the current writing…</p> : null}
        {phase === 'held' ? (
          <p role="status" data-interior-held>
            A section-addressable Working Draft is needed for this preview.
            Return to Write to prepare the current manuscript; no older Source was substituted.
          </p>
        ) : null}
        {phase === 'error' ? (
          <div role="alert">
            <p>The current manuscript could not be verified for page viewing.</p>
            <button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button>
          </div>
        ) : null}
        {phase === 'ready' && revision && pages && chosen ? (
          <>
            <header className="p4r1-interior-toolbar">
              <div>
                <strong>{title}</strong>
                <span>Working Draft · revision {revision.version} · {pages.length} sections</span>
              </div>
              <nav className="p4r1-interior-nav" aria-label="Interior manuscript sections">
                <button type="button" disabled={index === 0}
                  onClick={() => setSelectedIndex(Math.max(0, index - 1))}>
                  Earlier section
                </button>
                <span aria-live="polite">{index + 1} of {pages.length}</span>
                <button type="button" disabled={index === pages.length - 1}
                  onClick={() => setSelectedIndex(Math.min(pages.length - 1, index + 1))}>
                  Later section
                </button>
              </nav>
            </header>
            <fieldset className="p4r1-interior-typography">
              <legend>Typography study · not saved</legend>
              {STYLE_OPTIONS.map((option) => (
                <button key={option.id} type="button"
                  aria-pressed={pageStyle === option.id}
                  onClick={() => setPageStyle(option.id)}>
                  {option.label}
                </button>
              ))}
            </fieldset>
            <div className="p4r1-interior-stage">
              <article className="p4r1-interior-page"
                data-interior-page
                data-layout-style={pageStyle}
                data-source-revision={revision.version}
                aria-label="Current manuscript section layout study">
                <header>
                  <p>{title}</p>
                  <h4>{chosen.heading || 'Untitled section'}</h4>
                </header>
                <div className="p4r1-interior-prose" data-authored-interior-body>{chosen.body}</div>
                <footer>Section {index + 1} · layout study only · pagination not measured</footer>
              </article>
            </div>
            <p className="p4r1-interior-bottom-note">
              A final page proof must come from the exact generated interior PDF,
              with verified page count, margins, fonts, images, and edition design.
              Nothing in this view is exported or kept in browser storage.
            </p>
          </>
        ) : null}
      </div>
    </details>
  );
}
