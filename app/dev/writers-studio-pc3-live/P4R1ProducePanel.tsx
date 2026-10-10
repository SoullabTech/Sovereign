'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type ProductionIssue = {
  code: string;
  severity: 'blocker';
  sectionIndexes: number[];
  message: string;
};

type Preflight = {
  ready: boolean;
  title: string;
  sectionCount: number;
  sourceAuthority: 'working_draft' | 'source';
  sourceRevision: string | null;
  issues: ProductionIssue[];
  publicationBoundary: string;
};

type PublicationPath =
  | 'kdp-paperback'
  | 'kdp-hardcover'
  | 'kindle'
  | 'print-pdf'
  | 'soullab-press';

type Target = {
  id: PublicationPath;
  name: string;
  short: string;
  description: string;
  format: 'pdf' | 'epub' | 'both';
};

type ArtifactMeta = {
  format: 'pdf' | 'epub';
  pageCount: string | null;
  productionProfile: string | null;
  sourceHash: string | null;
};

const TARGETS: readonly Target[] = [
  {
    id: 'kdp-paperback',
    name: 'Amazon KDP · Paperback',
    short: 'KDP Paperback',
    description: 'Prepare the 6 × 9 no-bleed interior PDF for a paperback edition.',
    format: 'pdf',
  },
  {
    id: 'kdp-hardcover',
    name: 'Amazon KDP · Hardcover',
    short: 'KDP Hardcover',
    description: 'Prepare the 6 × 9 no-bleed interior PDF. The case-wrap cover remains a separate production file.',
    format: 'pdf',
  },
  {
    id: 'kindle',
    name: 'Kindle / EPUB',
    short: 'Kindle / EPUB',
    description: 'Prepare a reflowable EPUB3 with chapter structure and contents.',
    format: 'epub',
  },
  {
    id: 'print-pdf',
    name: 'Print-ready PDF',
    short: 'Print PDF',
    description: 'Prepare the current 6 × 9 print interior for another printer, reviewer, or production workflow.',
    format: 'pdf',
  },
  {
    id: 'soullab-press',
    name: 'Soullab Press',
    short: 'Soullab Press',
    description: 'Prepare the book and explore an optional human publishing pathway with Soullab Press.',
    format: 'both',
  },
] as const;

function issueCopy(issue: ProductionIssue): { title: string; body: string } {
  if (issue.code === 'duplicate_copyright_statements') {
    return {
      title: 'Choose one copyright page',
      body: 'More than one section contains copyright language. Keep one canonical copyright section before making a final book file.',
    };
  }
  if (issue.code === 'copyright_not_governed') {
    return {
      title: 'Make the copyright page explicit',
      body: 'Copyright language exists, but Studio cannot identify exactly one governed Copyright or Copyright Notice section yet.',
    };
  }
  return { title: 'This needs your attention', body: issue.message };
}

function filenameFrom(response: Response, fallback: string): string {
  const disposition = response.headers.get('content-disposition') ?? '';
  const utf = disposition.match(/filename*=UTF-8''([^;]+)/i)?.[1];
  if (utf) {
    try { return decodeURIComponent(utf); } catch { /* use fallback */ }
  }
  const simple = disposition.match(/filename="([^"]+)"/i)?.[1];
  return simple || fallback;
}

function profileLabel(profile: string | null): string {
  if (profile === 'hallmark-6x9-v1') return '6 × 9 in · no bleed · mirrored print margins';
  return profile || '6 × 9 in · no bleed';
}

export default function P4R1ProducePanel({ manuscriptId, onClose }: {
  manuscriptId: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [targetId, setTargetId] = useState<PublicationPath>('kdp-paperback');
  const [making, setMaking] = useState<'pdf' | 'epub' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<ArtifactMeta | null>(null);
  const [pressOpen, setPressOpen] = useState(false);

  const target = useMemo(
    () => TARGETS.find((candidate) => candidate.id === targetId) ?? TARGETS[0],
    [targetId],
  );

  const load = useCallback(async () => {
    setPhase('loading');
    setMessage(null);
    try {
      const response = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/render`, {
        method: 'GET',
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(typeof body?.error === 'string' ? body.error : 'Could not check this Work for production just now.');
        setPhase('error');
        return;
      }
      setPreflight(body as Preflight);
      setPhase('ready');
    } catch {
      setMessage('Could not check this Work for production just now.');
      setPhase('error');
    }
  }, [manuscriptId]);

  useEffect(() => {
    // Initial preflight is the purpose of mounting this bounded Publish panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const make = useCallback(async (format: 'pdf' | 'epub') => {
    if (!preflight?.ready || making) return;
    setMaking(format);
    setMessage(null);
    try {
      const response = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/render`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ format }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setMessage(typeof body?.error === 'string' ? body.error : 'Could not make your book file just now.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filenameFrom(response, `${preflight.title || 'manuscript'}.${format}`);
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        URL.revokeObjectURL(url);
      }

      setArtifact({
        format,
        pageCount: response.headers.get('x-soullab-page-count') || null,
        productionProfile: response.headers.get('x-soullab-production-profile') || null,
        sourceHash: response.headers.get('x-soullab-source-hash') || null,
      });
      setMessage(`${format.toUpperCase()} prepared for ${target.short} from your current writing.`);
    } catch {
      setMessage('Could not make your book file just now.');
    } finally {
      setMaking(null);
    }
  }, [making, manuscriptId, preflight, target.short]);

  const primaryFormat = target.format === 'epub' ? 'epub' : 'pdf';

  return (
    <section className="p4r1-produce p4r1-publish" data-produce-panel data-publish-panel>
      <header>
        <div>
          <span className="p4r1-eyebrow">Publish</span>
          <h3>Prepare an edition of your book.</h3>
          <p className="p4r1-publish-lede">
            Choose where this Work may go. Studio prepares the edition; you decide when, where, and with whom it is published.
          </p>
        </div>
        <button type="button" className="p4r1-produce-close" onClick={onClose}>Close</button>
      </header>

      {phase === 'loading' ? <p className="p4r1-produce-opening">Checking the current writing…</p> : null}

      {phase === 'error' ? (
        <div className="p4r1-produce-error">
          <p>{message}</p>
          <button type="button" onClick={() => void load()}>Try again</button>
        </div>
      ) : null}

      {phase === 'ready' && preflight ? (
        <>
          <section className="p4r1-produce-step p4r1-produce-current">
            <span className="p4r1-eyebrow">1 · Current writing</span>
            <div className="p4r1-produce-truth">
              <div>
                <b>{preflight.title}</b>
                <span>{preflight.sectionCount} section{preflight.sectionCount === 1 ? '' : 's'}</span>
              </div>
              <p>
                {preflight.sourceAuthority === 'working_draft'
                  ? 'This edition will use the writing currently held in Writer’s Studio.'
                  : 'There is no section-addressable working draft, so this edition will use the current manuscript source.'}
              </p>
              <details className="p4r1-produce-details">
                <summary>Source and production details</summary>
                <p>
                  Source: {preflight.sourceAuthority === 'working_draft' ? 'working draft' : 'manuscript source'}
                  {preflight.sourceRevision ? ' · revision ' + preflight.sourceRevision : ''}
                  {' · '}Current print profile: 6 × 9 in · no bleed
                </p>
              </details>
            </div>
          </section>

          <section className="p4r1-produce-step p4r1-publish-target">
            <span className="p4r1-eyebrow">2 · Publishing path</span>
            <h4>Where might this edition go?</h4>
            <p>This choice changes the preparation guidance. It does not submit the book anywhere.</p>
            <div className="p4r1-publish-targets" role="radiogroup" aria-label="Publishing path">
              {TARGETS.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={targetId === candidate.id}
                  data-selected={targetId === candidate.id ? 'true' : 'false'}
                  onClick={() => {
                    setTargetId(candidate.id);
                    setArtifact(null);
                    setMessage(null);
                    if (candidate.id !== 'soullab-press') setPressOpen(false);
                  }}
                >
                  <b>{candidate.name}</b>
                  <span>{candidate.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="p4r1-produce-step p4r1-publish-setup">
            <span className="p4r1-eyebrow">3 · Edition setup</span>
            <div className="p4r1-publish-edition-head">
              <div>
                <h4>{target.name}</h4>
                <p>{target.description}</p>
              </div>
              <span className="p4r1-publish-edition-badge">
                {target.id === 'kindle' ? 'Reflowable ebook' : target.id === 'soullab-press' ? 'Optional Press pathway' : 'Interior preparation'}
              </span>
            </div>

            {target.id === 'kindle' ? (
              <dl className="p4r1-publish-facts">
                <div><dt>Format</dt><dd>EPUB3</dd></div>
                <div><dt>Layout</dt><dd>Reflowable</dd></div>
                <div><dt>Contents</dt><dd>Included</dd></div>
                <div><dt>Chapter splitting</dt><dd>Heading level 1</dd></div>
              </dl>
            ) : (
              <dl className="p4r1-publish-facts">
                <div><dt>Interior trim</dt><dd>6 × 9 in</dd></div>
                <div><dt>Bleed</dt><dd>No bleed</dd></div>
                <div><dt>Margins</dt><dd>Mirrored · 0.9 in inside / 0.6 in outside</dd></div>
                <div><dt>Page size</dt><dd>Asserted before PDF export</dd></div>
                <div><dt>Cover</dt><dd>Separate production file</dd></div>
              </dl>
            )}

            {(target.id === 'kdp-paperback' || target.id === 'kdp-hardcover') ? (
              <div className="p4r1-publish-preflight">
                <b>Current KDP interior profile</b>
                <ul>
                  <li data-state="ready">6 × 9 interior geometry</li>
                  <li data-state="ready">Mirrored print margins</li>
                  <li data-state="ready">Embedded production typography</li>
                  <li data-state="ready">Page proof and page numbering</li>
                  <li data-state="open">Paper/color choice is made in KDP</li>
                  <li data-state="open">{target.id === 'kdp-paperback' ? 'Paperback cover' : 'Hardcover case-wrap cover'} still needs its own production file</li>
                </ul>
              </div>
            ) : null}

            {target.id === 'soullab-press' ? (
              <div className="p4r1-press-path">
                <div>
                  <span className="p4r1-press-mark" aria-hidden="true">S</span>
                  <div>
                    <b>Soullab Press is a possible path, never an automatic destination.</b>
                    <p>
                      If you choose it, the next step is a human conversation about fit, readiness, editorial relationship,
                      rights, production, and the edition you want to make.
                    </p>
                  </div>
                </div>
                <button type="button" aria-expanded={pressOpen} onClick={() => setPressOpen((value) => !value)}>
                  {pressOpen ? 'Hide Press pathway' : 'Explore the Soullab Press pathway'}
                </button>
                {pressOpen ? (
                  <ol>
                    <li><b>Prepare the Work.</b><span>Proof the current manuscript and settle publication questions.</span></li>
                    <li><b>Choose to bring it to Soullab Press.</b><span>This is an author act, not an automatic submission.</span></li>
                    <li><b>Human editorial / production review.</b><span>Fit, rights, edition form, schedule, and responsibilities are discussed explicitly.</span></li>
                    <li><b>Decide together.</b><span>Only a separate agreement turns the possibility into a Soullab Press edition.</span></li>
                  </ol>
                ) : null}
              </div>
            ) : null}
          </section>

          {preflight.issues.length > 0 ? (
            <section className="p4r1-produce-step p4r1-produce-issues">
              <span className="p4r1-eyebrow">4 · Needs attention</span>
              <h4>Settle these before making the publication file.</h4>
              <ul>
                {preflight.issues.map((issue) => {
                  const copy = issueCopy(issue);
                  return (
                    <li key={issue.code}>
                      <b>{copy.title}</b>
                      <span>{copy.body}</span>
                    </li>
                  );
                })}
              </ul>
              <p>Nothing was changed. Resolve these in the manuscript, then check again.</p>
              <button type="button" onClick={() => void load()}>Check again</button>
            </section>
          ) : (
            <>
              <section className="p4r1-produce-step p4r1-produce-ready">
                <span className="p4r1-eyebrow">4 · Interior readiness</span>
                <h4>The current writing can be made into this edition’s book file.</h4>
                <p>Current preflight found no production blocker in the manuscript structure it checks.</p>
              </section>

              <section className="p4r1-produce-step p4r1-produce-make">
                <span className="p4r1-eyebrow">5 · Create the edition file</span>
                <div className="p4r1-produce-actions">
                  {(target.format === 'pdf' || target.format === 'both') ? (
                    <button type="button" disabled={Boolean(making)} onClick={() => void make('pdf')}>
                      <b>{making === 'pdf' ? 'Preparing interior PDF…' : target.id.startsWith('kdp-') ? 'Create KDP interior PDF' : 'Create print interior PDF'}</b>
                      <span>6 × 9 fixed-layout interior · no bleed · ready for page proof and compatible print workflows.</span>
                    </button>
                  ) : null}
                  {(target.format === 'epub' || target.format === 'both') ? (
                    <button type="button" disabled={Boolean(making)} onClick={() => void make('epub')}>
                      <b>{making === 'epub' ? 'Preparing EPUB…' : 'Create EPUB'}</b>
                      <span>Reflowable EPUB3 for Kindle-compatible and other ebook workflows.</span>
                    </button>
                  ) : null}
                </div>
              </section>

              {artifact ? (
                <section className="p4r1-produce-step p4r1-publish-artifact" data-publish-artifact>
                  <span className="p4r1-eyebrow">6 · File made</span>
                  <h4>{artifact.format.toUpperCase()} prepared from this exact writing.</h4>
                  <dl>
                    <div><dt>Target</dt><dd>{target.name}</dd></div>
                    <div><dt>File</dt><dd>{artifact.format.toUpperCase()}</dd></div>
                    {artifact.format === 'pdf' ? <div><dt>Interior</dt><dd>{profileLabel(artifact.productionProfile)}</dd></div> : null}
                    {artifact.pageCount ? <div><dt>Rendered pages</dt><dd>{artifact.pageCount}</dd></div> : null}
                    {artifact.sourceHash ? <div><dt>Source witness</dt><dd>{artifact.sourceHash.slice(0, 12)}</dd></div> : null}
                  </dl>
                  {artifact.format === 'pdf' && (target.id === 'kdp-paperback' || target.id === 'kdp-hardcover' || target.id === 'soullab-press') ? (
                    <p>
                      Page count is now known. That is one of the inputs a cover/spine production workspace will use.
                      The cover remains separate from this interior file.
                    </p>
                  ) : null}
                </section>
              ) : null}

              <section className="p4r1-produce-step p4r1-produce-next">
                <span className="p4r1-eyebrow">{artifact ? '7' : '6'} · What happens next</span>
                <ol>
                  <li><b>Proof the edition.</b><span>Read the rendered pages as a reader will encounter them.</span></li>
                  <li><b>Prepare the cover separately.</b><span>Trim, page count, binding, and paper choice inform the final cover/spine geometry.</span></li>
                  {target.id === 'soullab-press' ? (
                    <li><b>Choose whether to approach Soullab Press.</b><span>The Press pathway begins only if you explicitly choose it.</span></li>
                  ) : (
                    <li><b>Upload when you decide it is ready.</b><span>Studio prepares the file. Submission to the publisher or retailer remains your act.</span></li>
                  )}
                </ol>
              </section>
            </>
          )}

          <p className="p4r1-produce-boundary">
            {preflight.publicationBoundary} Choosing Soullab Press here expresses interest only; it is not acceptance,
            a publishing agreement, or transfer of rights.
          </p>
        </>
      ) : null}

      {message && phase === 'ready' ? <p className="p4r1-produce-status" role="status">{message}</p> : null}
    </section>
  );
}
