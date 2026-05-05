'use client';

/**
 * Render Print PDF — generates the print-ready PDF and reports
 * final page count.
 *
 * Calls POST /api/book-studio/render. The render takes 60–120s for
 * a full book (Paged.js paginates 60k words in headless Chromium).
 *
 * Spine note: do not lock cover spine until this report's pageCount
 * is final.
 */

import { useState } from 'react';

type Status = 'idle' | 'rendering' | 'complete' | 'error';

interface RenderResult {
  ok: boolean;
  pdfUrl?: string;
  epubUrl?: string;
  pageCount?: number;
  sizeKB?: number;
  generatedAt?: string;
  error?: string;
  step?: string;
  details?: string;
}

export default function RenderPage() {
  const [pdfStatus, setPdfStatus] = useState<Status>('idle');
  const [pdfResult, setPdfResult] = useState<RenderResult | null>(null);
  const [epubStatus, setEpubStatus] = useState<Status>('idle');
  const [epubResult, setEpubResult] = useState<RenderResult | null>(null);

  const status = pdfStatus;
  const result = pdfResult;

  const handleRender = async () => {
    setPdfStatus('rendering');
    setPdfResult(null);
    try {
      const res = await fetch('/api/book-studio/render', { method: 'POST' });
      const data: RenderResult = await res.json();
      setPdfResult(data);
      setPdfStatus(res.ok && data.ok ? 'complete' : 'error');
    } catch (err) {
      setPdfResult({ ok: false, error: err instanceof Error ? err.message : String(err) });
      setPdfStatus('error');
    }
  };

  const handleEpubRender = async () => {
    setEpubStatus('rendering');
    setEpubResult(null);
    try {
      const res = await fetch('/api/book-studio/render/epub', { method: 'POST' });
      const data: RenderResult = await res.json();
      setEpubResult(data);
      setEpubStatus(res.ok && data.ok ? 'complete' : 'error');
    } catch (err) {
      setEpubResult({ ok: false, error: err instanceof Error ? err.message : String(err) });
      setEpubStatus('error');
    }
  };

  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Render Print PDF
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          Generate the print-ready PDF and resolve final page count.
        </p>
      </header>

      <section className="space-y-8 max-w-2xl">
        {/* Pipeline summary */}
        <div className="border border-amber-200/10 rounded-md p-6 bg-amber-300/[0.02]">
          <p className="text-amber-200/55 text-[11px] tracking-[0.25em] uppercase mb-3">
            Pipeline
          </p>
          <ul className="text-amber-50/75 text-sm font-light space-y-1.5 leading-relaxed">
            <li>Source: <code className="text-amber-300/70">docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md</code></li>
            <li>Stylesheet: <code className="text-amber-300/70">lib/manuscript/render/print-book.css</code></li>
            <li>Engine: pandoc → Paged.js → Puppeteer (headless Chromium)</li>
            <li>Output: <code className="text-amber-300/70">public/exports/elemental-alchemy-print.pdf</code></li>
          </ul>
        </div>

        {/* Trigger button + status */}
        <div>
          <button
            type="button"
            onClick={handleRender}
            disabled={status === 'rendering'}
            className={[
              'text-sm tracking-wide px-5 py-2 rounded-md transition-colors duration-300',
              'border',
              status === 'rendering'
                ? 'text-amber-200/40 border-amber-200/15 cursor-wait'
                : 'text-amber-200/80 hover:text-amber-100 border-amber-200/25 hover:border-amber-200/45',
              'disabled:opacity-60',
            ].join(' ')}
          >
            {status === 'rendering' ? 'Rendering… (60–120s)' : 'Render Print PDF'}
          </button>

          {status === 'rendering' && (
            <p className="mt-4 text-amber-200/55 text-sm font-light italic">
              Pagination in progress. Headless Chromium is rendering ~60k words
              through Paged.js. Don't navigate away.
            </p>
          )}
        </div>

        {/* Result — success */}
        {status === 'complete' && result?.ok && (
          <div className="border border-amber-300/20 rounded-md p-6 bg-amber-300/[0.04]">
            <p className="text-amber-200/55 text-[11px] tracking-[0.25em] uppercase mb-4">
              Complete
            </p>

            <dl className="grid grid-cols-[10rem,1fr] gap-y-2 text-sm">
              <dt className="text-amber-200/55 font-light">Final page count</dt>
              <dd className="text-amber-100/95 font-light">
                {result.pageCount} pages
              </dd>

              <dt className="text-amber-200/55 font-light">File size</dt>
              <dd className="text-amber-100/85 font-light">
                {result.sizeKB ? `${(result.sizeKB / 1024).toFixed(1)} MB` : '—'}
              </dd>

              <dt className="text-amber-200/55 font-light">Generated</dt>
              <dd className="text-amber-100/85 font-light">
                {result.generatedAt
                  ? new Date(result.generatedAt).toLocaleString()
                  : '—'}
              </dd>
            </dl>

            <div className="mt-6">
              <a
                href={result.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200/85 hover:text-amber-100 text-sm tracking-wide underline decoration-amber-300/30 hover:decoration-amber-300/70 underline-offset-4 transition-colors duration-300"
              >
                Download PDF →
              </a>
            </div>

            {/* Spine working note */}
            <div className="mt-6 pt-5 border-t border-amber-200/10">
              <p className="text-amber-200/45 text-[11px] tracking-[0.25em] uppercase mb-2">
                Spine note
              </p>
              <p className="text-amber-50/75 text-sm font-light italic leading-relaxed">
                Use this final page count to calculate spine width. Do not lock
                the cover before this report is final.
              </p>
              {result.pageCount ? (
                <p className="text-amber-200/55 text-sm font-light mt-3 leading-relaxed">
                  Working spine math: {result.pageCount} pages ÷ PPI =
                  {' '}
                  <span className="text-amber-100/85">
                    ~{(result.pageCount / 444).toFixed(2)}″
                  </span>{' '}
                  on 55# white,
                  {' '}
                  <span className="text-amber-100/85">
                    ~{(result.pageCount / 360).toFixed(2)}″
                  </span>{' '}
                  on 50# cream.
                  {' '}<span className="text-amber-200/45 italic">
                    Confirm PPI with printer before final cover.
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Result — error (PDF) */}
        {status === 'error' && result && (
          <div className="border border-red-400/30 rounded-md p-6 bg-red-400/[0.04]">
            <p className="text-red-300/85 text-[11px] tracking-[0.25em] uppercase mb-3">
              Render failed
            </p>
            <p className="text-amber-50/85 text-sm font-light leading-relaxed">
              {result.step ? <span className="text-amber-200/55 italic">{result.step}: </span> : null}
              {result.error || 'Unknown error'}
            </p>
            {result.details && (
              <p className="mt-3 text-amber-200/55 text-xs font-light italic leading-relaxed">
                {result.details}
              </p>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────
            EPUB — working draft (separate from print)
            ──────────────────────────────────────────────────────────── */}
        <div className="border-t border-amber-200/10 pt-10 mt-10">
          <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-3">
            EPUB — working draft
          </p>
          <p className="text-amber-50/65 text-sm font-light italic leading-relaxed mb-5 max-w-xl">
            Reflowable, regeneratable on each manuscript update. Useful for
            early readers and the cover designer. Not yet production-ready
            (no cover image, no embedded illustrations, no ISBN).
          </p>

          <button
            type="button"
            onClick={handleEpubRender}
            disabled={epubStatus === 'rendering'}
            className={[
              'text-sm tracking-wide px-5 py-2 rounded-md transition-colors duration-300 border',
              epubStatus === 'rendering'
                ? 'text-amber-200/40 border-amber-200/15 cursor-wait'
                : 'text-amber-200/80 hover:text-amber-100 border-amber-200/25 hover:border-amber-200/45',
              'disabled:opacity-60',
            ].join(' ')}
          >
            {epubStatus === 'rendering' ? 'Building EPUB…' : 'Build EPUB (draft)'}
          </button>

          {/* EPUB success */}
          {epubStatus === 'complete' && epubResult?.ok && (
            <div className="mt-6 border border-amber-300/20 rounded-md p-5 bg-amber-300/[0.04] max-w-xl">
              <p className="text-amber-200/55 text-[11px] tracking-[0.25em] uppercase mb-3">
                EPUB ready
              </p>
              <dl className="grid grid-cols-[8rem,1fr] gap-y-1.5 text-sm mb-4">
                <dt className="text-amber-200/55 font-light">File size</dt>
                <dd className="text-amber-100/85 font-light">
                  {epubResult.sizeKB
                    ? epubResult.sizeKB > 1024
                      ? `${(epubResult.sizeKB / 1024).toFixed(1)} MB`
                      : `${epubResult.sizeKB} KB`
                    : '—'}
                </dd>
                <dt className="text-amber-200/55 font-light">Generated</dt>
                <dd className="text-amber-100/85 font-light">
                  {epubResult.generatedAt
                    ? new Date(epubResult.generatedAt).toLocaleString()
                    : '—'}
                </dd>
              </dl>
              <a
                href={epubResult.epubUrl}
                className="text-amber-200/85 hover:text-amber-100 text-sm tracking-wide underline decoration-amber-300/30 hover:decoration-amber-300/70 underline-offset-4 transition-colors duration-300"
              >
                Download EPUB →
              </a>
            </div>
          )}

          {/* EPUB error */}
          {epubStatus === 'error' && epubResult && (
            <div className="mt-6 border border-red-400/30 rounded-md p-5 bg-red-400/[0.04] max-w-xl">
              <p className="text-red-300/85 text-[11px] tracking-[0.25em] uppercase mb-2">
                EPUB build failed
              </p>
              <p className="text-amber-50/85 text-sm font-light">
                {epubResult.step ? (
                  <span className="text-amber-200/55 italic">{epubResult.step}: </span>
                ) : null}
                {epubResult.error || 'Unknown error'}
              </p>
              {epubResult.details && (
                <p className="mt-2 text-amber-200/55 text-xs italic leading-relaxed">
                  {epubResult.details}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
