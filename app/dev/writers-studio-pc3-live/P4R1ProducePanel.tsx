'use client';

import { useCallback, useEffect, useState } from 'react';
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

type Props = {
  manuscriptId: string;
  onClose: () => void;
};

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

export default function P4R1ProducePanel({ manuscriptId, onClose }: Props) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [making, setMaking] = useState<'pdf' | 'epub' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
        setMessage(typeof body?.error === 'string'
          ? body.error
          : 'Could not make your book file just now.');
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
      setMessage(`${format.toUpperCase()} made from your current writing.`);
    } catch {
      setMessage('Could not make your book file just now.');
    } finally {
      setMaking(null);
    }
  }, [making, manuscriptId, preflight]);

  return (
    <section className="p4r1-produce" data-produce-panel>
      <header>
        <div>
          <span className="p4r1-eyebrow">Finish / Produce</span>
          <h3>Make a book file from your current writing.</h3>
        </div>
        <button type="button" className="p4r1-produce-close" onClick={onClose}>Close</button>
      </header>

      {phase === 'loading' ? (
        <p className="p4r1-produce-opening">Checking the current writing…</p>
      ) : null}

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
                  ? 'This uses the writing currently held in Writer’s Studio.'
                  : 'There is no section-addressable working draft, so this uses the current manuscript source.'}
              </p>
              <details className="p4r1-produce-details">
                <summary>Production details</summary>
                <p>
                  Source: {preflight.sourceAuthority === 'working_draft' ? 'working draft' : 'manuscript source'}
                  {preflight.sourceRevision ? ' · revision ' + preflight.sourceRevision : ''}
                </p>
              </details>
            </div>
          </section>

          {preflight.issues.length > 0 ? (
            <section className="p4r1-produce-step p4r1-produce-issues">
              <span className="p4r1-eyebrow">2 · Needs attention</span>
              <h4>There are a few things to settle before making a final file.</h4>
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
                <span className="p4r1-eyebrow">2 · Ready</span>
                <h4>Your current writing can be made into a book file.</h4>
                <p>No production blocker is standing in the way of creating a file from this version.</p>
              </section>

              <section className="p4r1-produce-step p4r1-produce-make">
                <span className="p4r1-eyebrow">3 · Choose a file</span>
                <div className="p4r1-produce-actions">
                  <button type="button" disabled={Boolean(making)} onClick={() => void make('pdf')}>
                    <b>{making === 'pdf' ? 'Making PDF…' : 'Make PDF'}</b>
                    <span>Fixed-layout file for proofing, printing, and compatible print workflows.</span>
                  </button>
                  <button type="button" disabled={Boolean(making)} onClick={() => void make('epub')}>
                    <b>{making === 'epub' ? 'Making EPUB…' : 'Make EPUB'}</b>
                    <span>Reflowable ebook file for compatible readers and publishing platforms.</span>
                  </button>
                </div>
              </section>

              <section className="p4r1-produce-step p4r1-produce-next">
                <span className="p4r1-eyebrow">4 · What happens next</span>
                <ol>
                  <li><b>Open the file and proof it.</b><span>Look at the book as a reader will encounter it.</span></li>
                  <li><b>Return here if you want to revise anything.</b><span>Make changes in Writer’s Studio, then create a fresh file.</span></li>
                  <li><b>Publish or distribute when you decide it is ready.</b><span>Use the publisher, printer, retailer, repository, or other destination you choose.</span></li>
                </ol>
              </section>
            </>
          )}

          <p className="p4r1-produce-boundary">{preflight.publicationBoundary}</p>
        </>
      ) : null}

      {message && phase === 'ready' ? <p className="p4r1-produce-status" role="status">{message}</p> : null}
    </section>
  );
}
