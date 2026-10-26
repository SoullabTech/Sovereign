'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  inches,
  kdpPaperbackCoverGeometry,
  type KdpPaperbackPaper,
} from '@/lib/writersStudio/publish/kdpCoverGeometry';
import {
  readLocalReviewManuscript,
  type LocalReviewManuscript,
} from '@/lib/writersStudio/localReviewManuscript';

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
  sourceAuthority: 'working_draft' | 'source' | 'local_review';
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
  artifactHash: string | null;
  sizeBytes: number | null;
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

function artifactBytes(response: Response): number | null {
  const raw = response.headers.get('x-soullab-artifact-bytes')
    ?? response.headers.get('content-length');
  if (!raw || !/^\d+$/.test(raw)) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function formatBytes(value: number | null): string | null {
  if (value === null) return null;
  if (value < 1024) return `${value} bytes`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * A book-publishing preview for the small beta. File exports are OFF unless
 * explicitly enabled by a separately certified caller. This is a presentation
 * boundary, not server entitlement: the existing member-owned render API keeps
 * its independent authorization and production consumers.
 */
export default function P4R1ProducePanel({
  manuscriptId,
  onClose,
  exportsCertified = false,
  localReviewArtifacts = false,
}: {
  manuscriptId: string;
  onClose: () => void;
  /** Only after PDF/EPUB end-to-end acceptance at the exact release build. */
  exportsCertified?: boolean;
  /** Loopback-only physical artifact review; never a member export grant. */
  localReviewArtifacts?: boolean;
}) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [targetId, setTargetId] = useState<PublicationPath>('kdp-paperback');
  const [making, setMaking] = useState<'pdf' | 'epub' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<ArtifactMeta | null>(null);
  const [pressOpen, setPressOpen] = useState(false);
  const [paper, setPaper] = useState<KdpPaperbackPaper>('cream');

  const target = useMemo(
    () => TARGETS.find((candidate) => candidate.id === targetId) ?? TARGETS[0],
    [targetId],
  );
  const filesAvailable = exportsCertified || localReviewArtifacts;
  const localSource = useCallback((): LocalReviewManuscript | null => (
    localReviewArtifacts ? readLocalReviewManuscript(manuscriptId) : null
  ), [localReviewArtifacts, manuscriptId]);

  const load = useCallback(async () => {
    setPhase('loading');
    setMessage(null);
    setPreflight(null);
    setArtifact(null);
    try {
      const local = localSource();
      if (localReviewArtifacts && !local) {
        setMessage('This local manuscript is no longer in the review session. Import it again to review edition files.');
        setPhase('error');
        return;
      }
      const response = localReviewArtifacts
        ? await apiFetch('/api/writers-studio/local-review/render', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              action: 'inspect',
              title: local!.title,
              author: local!.author,
              sections: local!.sections,
            }),
          })
        : await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/render`, {
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
  }, [localReviewArtifacts, localSource, manuscriptId]);

  useEffect(() => {
    // Initial preflight is the purpose of mounting this bounded Publish panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const make = useCallback(async (format: 'pdf' | 'epub') => {
    if (!filesAvailable || !preflight?.ready || making) return;
    setMaking(format);
    setMessage(null);
    try {
      const local = localSource();
      if (localReviewArtifacts && !local) {
        setPreflight(null);
        setArtifact(null);
        setPhase('error');
        setMessage('This local manuscript is no longer in the review session. Import it again before making a file.');
        return;
      }
      const response = localReviewArtifacts
        ? await apiFetch('/api/writers-studio/local-review/render', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              action: 'render',
              format,
              title: local!.title,
              author: local!.author,
              sections: local!.sections,
              expectedSourceHash: preflight.sourceRevision,
            }),
          })
        : await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/render`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              format,
              expectedSourceAuthority: preflight.sourceAuthority,
              expectedSourceRevision: preflight.sourceRevision,
            }),
          });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 409) {
          // The author may have edited another room after the last preflight.
          // Never present the previous proof or cover measurements as current.
          setPreflight(null);
          setArtifact(null);
          setPhase('error');
          setMessage('Your writing changed since the production check. Check again before preparing a file.');
          return;
        }
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
        artifactHash: response.headers.get('x-soullab-artifact-sha256') || null,
        sizeBytes: artifactBytes(response),
      });
      setMessage(localReviewArtifacts
        ? `${format.toUpperCase()} made on this Mac for artifact review. It is not a certified publication file.`
        : `${format.toUpperCase()} prepared for ${target.short} from your current writing.`);
    } catch {
      setMessage('Could not make your book file just now.');
    } finally {
      setMaking(null);
    }
  }, [filesAvailable, localReviewArtifacts, localSource, making, manuscriptId, preflight, target.short]);

  const renderedPageCount = artifact?.format === 'pdf' && artifact.pageCount
    ? Number.parseInt(artifact.pageCount, 10)
    : null;
  const paperbackCover = target.id === 'kdp-paperback' && renderedPageCount && Number.isInteger(renderedPageCount)
    ? kdpPaperbackCoverGeometry(renderedPageCount, paper)
    : null;

  return (
    <section className="p4r1-produce p4r1-publish" data-produce-panel data-publish-panel>
      <header>
        <div>
          <span className="p4r1-eyebrow">
            Publish · {localReviewArtifacts ? 'Local artifact review' : exportsCertified ? 'Book preparation' : 'Beta preview'}
          </span>
          <h3>Explore where this Work could go.</h3>
          <p className="p4r1-publish-lede">
            Choose a possible publishing path, inspect preliminary book requirements, and see what your Work may still need.
            Book editions are our first publishing form; other kinds of writing will receive their own pathways.
          </p>
          <p className="p4r1-publish-beta-state"
            data-publish-availability={localReviewArtifacts ? 'local-review' : exportsCertified ? 'exports-enabled' : 'preview-only'}>
            {localReviewArtifacts
              ? 'This Mac can now generate temporary PDF and EPUB artifacts for physical review. They are not certified publication files, retained editions, or submissions.'
              : exportsCertified
                ? 'File preparation is available in this certified environment. You still decide whether and where to submit your Work.'
                : 'This is a preview. PDF and EPUB downloads are still being verified, and no publishing or submission occurs here.'}
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
                {preflight.sourceAuthority === 'local_review'
                  ? 'The confirmed manuscript held in this browser session is the source for this local artifact review.'
                  : preflight.sourceAuthority === 'working_draft'
                    ? 'Your current working draft is the source identified for a possible edition.'
                    : 'No section-addressable working draft was found. This preview reads the current manuscript source.'}
              </p>
              <details className="p4r1-produce-details">
                <summary>Source and production details</summary>
                <p>
                  Source: {preflight.sourceAuthority === 'local_review'
                    ? 'ephemeral local review manuscript'
                    : preflight.sourceAuthority === 'working_draft' ? 'working draft' : 'manuscript source'}
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
                <b>Planned KDP interior profile · not a KDP approval</b>
                <ul>
                  <li data-state="planned">Target: 6 × 9 interior geometry</li>
                  <li data-state="planned">Target: mirrored print margins</li>
                  <li data-state="planned">Target: embedded production typography</li>
                  <li data-state="open">Generated pages, fonts and numbering still require proofing</li>
                  <li data-state="open">Paper and color choices are made separately in KDP</li>
                  <li data-state="open">{target.id === 'kdp-paperback' ? 'Paperback cover' : 'Hardcover case-wrap cover'} requires a separate production file</li>
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
                <h4>No structural blockers found in these preliminary checks.</h4>
                <p>This checks the manuscript structure available today. It does not certify the final PDF or EPUB, proof the pages, or establish retailer acceptance.</p>
              </section>

              <section className="p4r1-produce-step p4r1-produce-make">
                <span className="p4r1-eyebrow">5 · Edition files</span>
                {!filesAvailable ? (
                  <>
                    <h4>File downloads are awaiting final verification.</h4>
                    <p>Here is what will become possible. These controls are intentionally unavailable during the preview; exploring Publish does not change your writing.</p>
                  </>
                ) : localReviewArtifacts ? (
                  <>
                    <h4>Make a temporary artifact for physical review.</h4>
                    <p>The real renderer runs on this Mac. The downloaded file is labeled LOCAL REVIEW and receives no production certification or publisher submission.</p>
                  </>
                ) : null}
                <div className="p4r1-produce-actions">
                  {(target.format === 'pdf' || target.format === 'both') ? (
                    <button type="button" disabled={!filesAvailable || Boolean(making)}
                      data-publish-export={localReviewArtifacts ? 'local-review' : exportsCertified ? 'enabled' : 'held'}
                      onClick={() => void make('pdf')}>
                      <b>{!filesAvailable
                        ? 'Interior PDF · in verification'
                        : making === 'pdf' ? 'Preparing interior PDF…'
                          : localReviewArtifacts ? 'Create local review PDF'
                            : target.id.startsWith('kdp-') ? 'Create KDP interior PDF' : 'Create print interior PDF'}</b>
                      <span>6 × 9 fixed-layout interior · no bleed · page proof required before submission.</span>
                    </button>
                  ) : null}
                  {(target.format === 'epub' || target.format === 'both') ? (
                    <button type="button" disabled={!filesAvailable || Boolean(making)}
                      data-publish-export={localReviewArtifacts ? 'local-review' : exportsCertified ? 'enabled' : 'held'}
                      onClick={() => void make('epub')}>
                      <b>{!filesAvailable ? 'EPUB3 · in verification'
                        : making === 'epub' ? 'Preparing EPUB…'
                          : localReviewArtifacts ? 'Create local review EPUB' : 'Create EPUB'}</b>
                      <span>Reflowable EPUB3 · reading-device proof required before submission.</span>
                    </button>
                  ) : null}
                </div>
              </section>

              {artifact ? (
                <section className="p4r1-produce-step p4r1-publish-artifact" data-publish-artifact>
                  <span className="p4r1-eyebrow">6 · File made</span>
                  <h4>{localReviewArtifacts
                    ? `${artifact.format.toUpperCase()} local review artifact made from this exact writing.`
                    : `${artifact.format.toUpperCase()} prepared from this exact writing.`}</h4>
                  <dl>
                    <div><dt>Target</dt><dd>{target.name}</dd></div>
                    <div><dt>File</dt><dd>{artifact.format.toUpperCase()}</dd></div>
                    {artifact.format === 'pdf' ? <div><dt>Interior</dt><dd>{profileLabel(artifact.productionProfile)}</dd></div> : null}
                    {artifact.pageCount ? <div><dt>Rendered pages</dt><dd>{artifact.pageCount}</dd></div> : null}
                    {formatBytes(artifact.sizeBytes) ? <div><dt>File size</dt><dd>{formatBytes(artifact.sizeBytes)}</dd></div> : null}
                    {artifact.sourceHash ? <div><dt>Source witness</dt><dd>{artifact.sourceHash.slice(0, 12)}</dd></div> : null}
                    {artifact.artifactHash ? (
                      <div data-artifact-sha256={artifact.artifactHash}>
                        <dt>Artifact SHA-256</dt>
                        <dd style={{ overflowWrap: 'anywhere', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {artifact.artifactHash}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {paperbackCover ? (
                <section className="p4r1-produce-step p4r1-cover-planner" data-cover-planner>
                  <span className="p4r1-eyebrow">7 · Paperback cover &amp; spine</span>
                  <div className="p4r1-cover-head">
                    <div>
                      <h4>Build the cover around the actual book.</h4>
                      <p>
                        These measurements use the rendered {paperbackCover.pageCount}-page interior,
                        KDP’s 6 × 9 paperback formulas, and the paper stock you choose.
                      </p>
                    </div>
                    <span>{paperbackCover.pageCount} pages</span>
                  </div>

                  <fieldset className="p4r1-cover-paper">
                    <legend>Paper stock</legend>
                    <label>
                      <input
                        type="radio"
                        name="publish-paper"
                        value="cream"
                        checked={paper === 'cream'}
                        onChange={() => setPaper('cream')}
                      />
                      <span><b>Cream</b><small>Common for text-heavy books</small></span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="publish-paper"
                        value="white"
                        checked={paper === 'white'}
                        onChange={() => setPaper('white')}
                      />
                      <span><b>White</b><small>Slightly thinner spine at the same page count</small></span>
                    </label>
                  </fieldset>

                  <div className="p4r1-cover-visual" aria-label="Paperback cover geometry">
                    <div className="p4r1-cover-back">
                      <span>Back cover</span>
                      <small>6 × 9</small>
                    </div>
                    <div
                      className="p4r1-cover-spine"
                      style={{ width: `${Math.max(30, Math.min(68, paperbackCover.spineWidthIn * 88))}px` }}
                    >
                      <span>Spine</span>
                      <small>{inches(paperbackCover.spineWidthIn, 4)}″</small>
                    </div>
                    <div className="p4r1-cover-front">
                      <span>Front cover</span>
                      <small>6 × 9</small>
                    </div>
                  </div>

                  <dl className="p4r1-cover-facts">
                    <div><dt>Trim</dt><dd>6 × 9 in</dd></div>
                    <div><dt>Cover bleed</dt><dd>0.125 in on each outer edge</dd></div>
                    <div><dt>Spine width</dt><dd>{inches(paperbackCover.spineWidthIn, 4)} in</dd></div>
                    <div><dt>Full cover width</dt><dd>{inches(paperbackCover.fullWidthIn, 4)} in</dd></div>
                    <div><dt>Full cover height</dt><dd>{inches(paperbackCover.fullHeightIn, 4)} in</dd></div>
                    <div>
                      <dt>Spine text</dt>
                      <dd>{paperbackCover.spineTextEligible ? 'Eligible at this page count' : 'Not eligible at this page count'}</dd>
                    </div>
                  </dl>

                  <div className="p4r1-cover-actions">
                    <a href="https://kdp.amazon.com/cover-calculator" target="_blank" rel="noreferrer">
                      Open KDP cover calculator &amp; template
                    </a>
                    <p>
                      Use KDP’s generated PDF/PNG template as the final guide layer before exporting the cover.
                      Studio is calculating the same paperback geometry here so you can plan the edition before leaving.
                    </p>
                  </div>
                </section>
              ) : null}

              {artifact?.format === 'pdf' && target.id === 'kdp-hardcover' ? (
                <section className="p4r1-produce-step p4r1-cover-planner p4r1-cover-hardcover" data-cover-planner>
                  <span className="p4r1-eyebrow">7 · Hardcover case-wrap</span>
                  <h4>Use KDP’s exact hardcover template for this rendered page count.</h4>
                  <p>
                    Hardcover case-wrap geometry is different from paperback geometry. Studio will not approximate it.
                    Generate the exact template from KDP using {artifact.pageCount || 'the rendered'} pages and the 6 × 9 trim.
                  </p>
                  <div className="p4r1-cover-actions">
                    <a href="https://kdp.amazon.com/cover-calculator" target="_blank" rel="noreferrer">
                      Open KDP hardcover template generator
                    </a>
                  </div>
                </section>
              ) : null}

              <section className="p4r1-produce-step p4r1-produce-next">
                <span className="p4r1-eyebrow">{paperbackCover || (artifact?.format === 'pdf' && target.id === 'kdp-hardcover') ? '8' : artifact ? '7' : '6'} · What happens next</span>
                <ol>
                  {!filesAvailable ? (
                    <>
                      <li><b>Keep developing the Work.</b><span>Use Write, Develop and Review to refine what the reader will receive.</span></li>
                      <li><b>Consider the publication path.</b><span>Use these preliminary requirements to plan the edition, cover and intended readers.</span></li>
                      <li><b>Return for export when verified.</b><span>Once file preparation is certified, generate and proof an edition before submitting it anywhere.</span></li>
                    </>
                  ) : localReviewArtifacts ? (
                    <>
                      <li><b>Proof the local artifact.</b><span>Read the PDF pages or open the EPUB in a reading application and record what still needs work.</span></li>
                      <li><b>Return to the manuscript.</b><span>Any correction belongs in Write, followed by a fresh source check and a newly rendered review file.</span></li>
                      <li><b>Keep certification separate.</b><span>A successful local render does not enable member export or authorize submission.</span></li>
                    </>
                  ) : (
                    <>
                      <li><b>Proof the edition.</b><span>Read the rendered pages as a reader will encounter them.</span></li>
                      <li><b>Prepare the cover separately.</b><span>Trim, page count, binding, and paper choice inform the final cover/spine geometry.</span></li>
                    </>
                  )}
                  {target.id === 'soullab-press' ? (
                    <li><b>Choose whether to approach Soullab Press.</b><span>The Press pathway begins only if you explicitly choose it.</span></li>
                  ) : exportsCertified ? (
                    <li><b>Submit only when ready.</b><span>Studio prepares the file; submission to the publisher or retailer remains your act.</span></li>
                  ) : null}
                </ol>
              </section>
            </>
          )}

          <p className="p4r1-produce-boundary">
            {localReviewArtifacts
              ? preflight.publicationBoundary + ' Production export remains held.'
              : exportsCertified
                ? preflight.publicationBoundary
                : 'This preview makes no publication file and submits nothing.'}
            {' '}Exploring Soullab Press here is not an application, acceptance, publishing agreement, or transfer of rights.
          </p>
        </>
      ) : null}

      {message && phase === 'ready' ? <p className="p4r1-produce-status" role="status">{message}</p> : null}
    </section>
  );
}
