'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { COVER_EDITIONS, type CoverAssetMetadata, type CoverEdition } from '@/lib/manuscript/coverAssets/types';

const RULE = '#4A4238';
const ACCENT = '#C9A227';

type CoverState = Record<CoverEdition, CoverAssetMetadata | null>;
type BusyState = CoverEdition | null;

const empty: CoverState = { paperback: null, hardcover: null };
const label = (edition: CoverEdition) => edition === 'paperback' ? 'Paperback cover' : 'Hardcover cover';
const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const inches = (points: number) => `${(points / 72).toFixed(2)} in`;

export default function BookCoverAssets({ manuscriptId }: { manuscriptId: string }) {
  const [covers, setCovers] = useState<CoverState>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyState>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(COVER_EDITIONS.map(async (edition) => {
        const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/covers/${edition}`, { method: 'GET' });
        if (!res.ok) throw new Error(String(res.status));
        const body = await res.json() as { cover: CoverAssetMetadata | null };
        return [edition, body.cover] as const;
      }));
      setCovers(Object.fromEntries(results) as CoverState);
    } catch {
      setError('Cover details could not be reached just now. Your cover files were not changed.');
    } finally {
      setLoading(false);
    }
  }, [manuscriptId]);

  useEffect(() => { void load(); }, [load]);

  const upload = async (edition: CoverEdition, file: File) => {
    setBusy(edition);
    setError(null);
    try {
      const form = new FormData();
      form.append('cover', file);
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/covers/${edition}`, {
        method: 'POST', body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? 'Could not save that cover.');
      }
      const body = await res.json() as { cover: CoverAssetMetadata };
      setCovers((current) => ({ ...current, [edition]: body.cover }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save that cover.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (edition: CoverEdition) => {
    setBusy(edition);
    setError(null);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/covers/${edition}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not remove that cover.');
      setCovers((current) => ({ ...current, [edition]: null }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not remove that cover.');
    } finally {
      setBusy(null);
    }
  };

  const downloadOriginal = async (edition: CoverEdition, cover: CoverAssetMetadata) => {
    setBusy(edition);
    setError(null);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/covers/${edition}/bytes`, { method: 'GET' });
      if (!res.ok) throw new Error('Could not open that cover.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cover.originalFilename || `${edition}-cover.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open that cover.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mb-10" data-book-cover-assets>
      <p className="text-[10.5px] tracking-[0.28em] uppercase opacity-45 mb-2">Cover art</p>
      <p className="text-[13px] opacity-55 leading-relaxed mb-5 max-w-2xl">
        Paperback and hardcover wraps are separate publication assets. Upload preserves the exact PDF; print geometry is certified later against the finished interior, spine, trim, and bleed.
      </p>
      {loading ? <p className="text-[12.5px] opacity-45 mb-4">Reading cover custody…</p> : null}
      {error ? <p className="text-[12.5px] opacity-70 mb-4">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COVER_EDITIONS.map((edition) => {
          const cover = covers[edition];
          const working = busy === edition;
          return (
            <div key={edition} className="border p-5" style={{ borderColor: RULE }} data-cover-edition={edition}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-[17px] mb-1">{label(edition)}</h3>
                  <p className="text-[11px] tracking-wide uppercase" style={{ color: cover ? ACCENT : undefined }}>
                    {cover ? 'Artwork in custody' : 'No cover uploaded'}
                  </p>
                </div>
                {cover ? <span className="text-[11px] opacity-45">1-page PDF</span> : null}
              </div>

              {cover ? (
                <div className="space-y-2 mb-5 text-[12.5px] leading-relaxed">
                  <p className="break-all">{cover.originalFilename ?? `${edition}-cover.pdf`}</p>
                  <p className="opacity-55">
                    {mb(cover.byteSize)} · {inches(cover.pageWidthPt)} × {inches(cover.pageHeightPt)}
                  </p>
                  <p className="opacity-55">SHA-256 <span className="font-mono">{cover.sha256.slice(0, 16)}…</span></p>
                  <p className="text-[12px] opacity-65">Print geometry not yet certified.</p>
                </div>
              ) : (
                <p className="text-[12.5px] opacity-45 mb-5">Upload the complete one-page PDF wrap for this edition.</p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center justify-center px-4 py-2 min-h-[40px] border text-[12.5px] cursor-pointer" style={{ borderColor: RULE }}>
                  {working ? 'Working…' : cover ? 'Replace PDF' : 'Upload PDF'}
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    disabled={working}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.currentTarget.value = '';
                      if (file) void upload(edition, file);
                    }}
                  />
                </label>
                {cover ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void downloadOriginal(edition, cover)}
                      disabled={working}
                      className="text-[12px] underline underline-offset-4 opacity-60 hover:opacity-100 disabled:opacity-25"
                    >
                      Download original
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(edition)}
                      disabled={working}
                      className="text-[12px] underline underline-offset-4 opacity-45 hover:opacity-100 disabled:opacity-25"
                    >
                      Remove
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
