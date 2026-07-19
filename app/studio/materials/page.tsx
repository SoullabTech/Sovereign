'use client';

// ─────────────────────────────────────────────────────────────────────────────
// MATERIALS — the practitioner's library, in one simple place.
//
// Upload a file or add a link; see everything with a plain status; ratify what
// MAIA may draw on. Nothing here reaches MAIA or clients until the
// practitioner's own ratify gesture — AI never advances state.
//
// Spec: docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md
// Studio dark classes are UNCONDITIONAL (never `dark:` variants) per repo rule.
// YPO-grade copy rule applies: function words lead every label.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, ShieldCheck, Loader2, Link2, Upload, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Material {
  id: string;
  title: string;
  description: string | null;
  type: string;
  review_status: 'uploaded' | 'processed' | 'reviewed' | 'ratified' | 'archived';
  external_url: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<Material['review_status'], { label: string; cls: string; plain: string }> = {
  uploaded: { label: 'Uploaded', cls: 'text-neutral-300 border-neutral-600', plain: 'just arrived — not yet reviewed' },
  processed: { label: 'Processed', cls: 'text-neutral-300 border-neutral-600', plain: 'text extracted — ready for your review' },
  reviewed: { label: 'Reviewed', cls: 'text-sky-300 border-sky-800', plain: 'you have read it — ratify to let MAIA draw on it' },
  ratified: { label: 'Ratified', cls: 'text-emerald-300 border-emerald-800', plain: 'MAIA may draw on this in your field' },
  archived: { label: 'Archived', cls: 'text-neutral-500 border-neutral-700', plain: 'retired — the original is kept' },
};

// Forward gestures a practitioner can take from each status.
const NEXT_ACTIONS: Record<Material['review_status'], { to: Material['review_status']; label: string }[]> = {
  uploaded: [{ to: 'reviewed', label: 'Mark reviewed' }, { to: 'archived', label: 'Archive' }],
  processed: [{ to: 'reviewed', label: 'Mark reviewed' }, { to: 'archived', label: 'Archive' }],
  reviewed: [{ to: 'ratified', label: 'Ratify — let MAIA draw on it' }, { to: 'archived', label: 'Archive' }],
  ratified: [{ to: 'reviewed', label: 'Withdraw from MAIA' }, { to: 'archived', label: 'Archive' }],
  archived: [{ to: 'reviewed', label: 'Restore' }],
};

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/practitioner/materials');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not open your materials.');
      setMaterials(data.materials ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = useCallback(async (fn: () => Promise<Response>, okNotice?: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not complete that.');
      if (okNotice) setNotice(okNotice);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [load]);

  const addLink = () =>
    act(
      () => apiFetch('/api/practitioner/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: linkTitle, url: linkUrl, type: 'link' }),
      }),
      'Link added — mark it reviewed when you have read it.',
    ).then(() => { setLinkTitle(''); setLinkUrl(''); });

  const uploadFile = (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return act(
      () => apiFetch('/api/practitioner/materials', { method: 'POST', body: form }),
      'Uploaded — the original is kept unchanged.',
    );
  };

  const setStatus = (m: Material, to: Material['review_status']) =>
    act(() => apiFetch(`/api/practitioner/materials/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: to }),
    }));

  if (materials === null && !error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-semibold">Materials</h1>
        </div>
        <p className="text-neutral-400 mb-6">
          Your writings, recordings, and worksheets — in one place. Upload or link
          them here, then decide what MAIA may draw on.
        </p>

        <div className="flex gap-3 items-start bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-300">
            Everything here is private to your studio until <span className="text-neutral-100 font-medium">you ratify it</span>.
            Originals are never altered, and nothing you change erases what came before.
          </p>
        </div>

        {/* ── Add ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
            <Upload className="w-4 h-4 text-amber-400" /> Add a file
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm,.mp3,.wav,.m4a"
            className="block w-full text-sm text-neutral-400 file:mr-3 file:rounded-lg file:border file:border-neutral-700 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-sm file:text-neutral-200 file:cursor-pointer hover:file:bg-neutral-700"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f).finally(() => { if (fileRef.current) fileRef.current.value = ''; });
            }}
          />
          <p className="text-xs text-neutral-500">PDF, Word, text, image, audio, or video — up to 100MB. The original is stored untouched.</p>

          <div className="border-t border-neutral-800 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-200 mb-3">
              <Link2 className="w-4 h-4 text-amber-400" /> Add a link
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input className={inputCls} placeholder="Title" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
              <input className={inputCls} placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              <button
                onClick={addLink}
                disabled={busy || !linkTitle.trim() || !linkUrl.trim()}
                className="shrink-0 rounded-lg border border-amber-500/50 text-amber-300 px-4 py-2 text-sm hover:bg-amber-500/10 disabled:opacity-40 transition-colors"
              >
                Add link
              </button>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>}
        {notice && (
          <p className="flex items-center gap-2 text-emerald-300 text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" /> {notice}
          </p>
        )}

        {/* ── The library ── */}
        {materials !== null && materials.length === 0 && (
          <p className="text-neutral-500 text-sm">
            Your library is empty. Add your first file or link above — it stays private until you ratify it.
          </p>
        )}

        <ul className="space-y-3">
          {(materials ?? []).map((m) => {
            const s = STATUS_LABEL[m.review_status];
            return (
              <li key={m.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-neutral-100 text-sm font-medium">{m.title}</span>
                  <span className="text-neutral-500 text-xs uppercase tracking-wider">{m.type}</span>
                  <span className={`text-xs border rounded-full px-2.5 py-0.5 ${s.cls}`}>{s.label}</span>
                  <span className="flex-1" />
                  {NEXT_ACTIONS[m.review_status].map((a) => (
                    <button
                      key={a.to}
                      onClick={() => setStatus(m, a.to)}
                      disabled={busy}
                      className={`text-xs rounded-lg border px-3 py-1.5 transition-colors disabled:opacity-40 ${
                        a.to === 'ratified'
                          ? 'border-emerald-700 text-emerald-300 hover:bg-emerald-500/10'
                          : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <p className="text-neutral-500 text-xs mt-2">{s.plain}</p>
                {m.external_url && (
                  <a href={m.external_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 text-xs underline underline-offset-2 mt-1 inline-block">
                    {m.external_url}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
