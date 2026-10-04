'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type Preflight = {
  ready: boolean;
  title: string;
  sectionCount: number;
  sourceAuthority: 'working_draft' | 'source';
  sourceRevision: string | null;
  issues: Array<{ code: string; severity: string; message: string }>;
  publicationBoundary: string;
};

type ProofMeta = {
  sourceHash: string;
  sourceAuthority: string;
  sourceRevision: string;
  sectionCount: string;
  pageCount: string;
  productionProfile: string;
};

const shortHash = (value: string) => value ? value.slice(0, 12) : 'unavailable';

export default function P4R1ProofView({
  manuscriptId,
  workTitle,
}: {
  manuscriptId: string;
  workTitle: string;
}) {
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [preflightError, setPreflightError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofMeta, setProofMeta] = useState<ProofMeta | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setPreflight(null);
    setPreflightError(null);
    void apiFetch(`/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/render`, {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      const body = await response.json().catch(() => null) as Preflight | null;
      if (!live) return;
      if (!response.ok || !body) {
        setPreflightError('This proof could not be prepared from the current manuscript just now.');
        return;
      }
      setPreflight(body);
    }).catch(() => {
      if (live) setPreflightError('This proof could not be prepared from the current manuscript just now.');
    });
    return () => { live = false; };
  }, [manuscriptId]);

  useEffect(() => () => {
    if (proofUrl) URL.revokeObjectURL(proofUrl);
  }, [proofUrl]);

  const makeProof = async () => {
    if (busy) return;
    setBusy(true);
    setRenderError(null);
    try {
      const response = await apiFetch(
        `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/render`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: 'pdf' }),
        },
      );
      if (!response.ok) {
        setRenderError('The current manuscript could not be rendered as pages. Nothing about your Work changed.');
        return;
      }
      const blob = await response.blob();
      if (blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
        setRenderError('The proof returned in an unexpected format. Nothing about your Work changed.');
        return;
      }
      const next = URL.createObjectURL(blob);
      setProofUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return next;
      });
      setProofMeta({
        sourceHash: response.headers.get('x-soullab-source-hash') ?? '',
        sourceAuthority: response.headers.get('x-soullab-source-authority') ?? '',
        sourceRevision: response.headers.get('x-soullab-source-revision') ?? '',
        sectionCount: response.headers.get('x-soullab-section-count') ?? '',
        pageCount: response.headers.get('x-soullab-page-count') ?? '',
        productionProfile: response.headers.get('x-soullab-production-profile') ?? '',
      });
    } catch {
      setRenderError('The current manuscript could not be rendered as pages. Nothing about your Work changed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="p4r1-proof" data-review-proof>
      <header className="p4r1-proof-head">
        <div>
          <span className="p4r1-eyebrow">Reading proof</span>
          <h2>Read the Work as pages</h2>
          <p>
            This is the same current manuscript set as a book. Text remains the semantic source;
            the pages let you witness rhythm, density, headings, page turns, and physical reading flow.
          </p>
        </div>
        <div className="p4r1-proof-boundary">
          <b>Proof, not publication</b>
          <span>Making a proof does not publish, distribute, or edit the Work.</span>
        </div>
      </header>

      {preflightError ? <p className="p4r1-error" role="status">{preflightError}</p> : null}

      {preflight ? (
        <div className="p4r1-proof-status" data-proof-preflight>
          <span>
            <b>{preflight.sourceAuthority === 'working_draft' ? 'Current working draft' : 'Source manuscript'}</b>
            {preflight.sourceRevision ? ` · revision ${preflight.sourceRevision}` : ''}
          </span>
          <span>{preflight.sectionCount} section{preflight.sectionCount === 1 ? '' : 's'}</span>
          {preflight.issues.length ? (
            <span className="p4r1-proof-warning">
              {preflight.issues.length} production question{preflight.issues.length === 1 ? '' : 's'} remain visible
            </span>
          ) : (
            <span>No production blockers found by the current preflight</span>
          )}
        </div>
      ) : null}

      {preflight?.issues.length ? (
        <div className="p4r1-proof-issues" data-proof-issues>
          {preflight.issues.map((issue) => (
            <p key={issue.code}><b>{issue.code.replaceAll('_', ' ')}</b> — {issue.message}</p>
          ))}
        </div>
      ) : null}

      {!proofUrl ? (
        <div className="p4r1-proof-empty">
          <div className="p4r1-proof-page-ghost" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <h3>Make a reading proof</h3>
            <p>
              Writer’s Studio will typeset the exact current manuscript into a temporary PDF
              and show it here. The server does not keep the rendered PDF.
            </p>
            <button type="button" disabled={busy || !preflight} onClick={() => void makeProof()}>
              {busy ? 'Making the proof…' : 'Make proof'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p4r1-proof-toolbar">
            <div>
              <b>{workTitle}</b>
              <span>
                {proofMeta?.pageCount ? `${proofMeta.pageCount} pages` : 'Page count unavailable'}
                {proofMeta?.productionProfile ? ` · ${proofMeta.productionProfile}` : ''}
              </span>
            </div>
            <div>
              <a href={proofUrl} target="_blank" rel="noreferrer">Open proof</a>
              <a href={proofUrl} download={`${workTitle || 'manuscript'}-proof.pdf`}>Save a copy</a>
            </div>
          </div>
          <div className="p4r1-proof-frame">
            <iframe src={proofUrl} title={`${workTitle} reading proof`} />
          </div>
          <div className="p4r1-proof-provenance" data-proof-provenance>
            <span>Source {shortHash(proofMeta?.sourceHash ?? '')}</span>
            <span>{proofMeta?.sourceAuthority || 'source authority unavailable'}</span>
            {proofMeta?.sourceRevision ? <span>revision {proofMeta.sourceRevision}</span> : null}
            {proofMeta?.sectionCount ? <span>{proofMeta.sectionCount} sections</span> : null}
          </div>
          <p className="p4r1-proof-next">
            MAIA is not visually interpreting these pages in this first slice. Page-aware observations
            come only after rendered-page identity can be tied back to exact manuscript sections.
          </p>
        </>
      )}

      {renderError ? <p className="p4r1-error" role="status">{renderError}</p> : null}
    </section>
  );
}
