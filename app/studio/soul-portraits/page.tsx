'use client';

/**
 * Studio — "Your Soul Portraits" (the pilot's RETURN surface).
 *
 * A practitioner's own body of portrait drafts, newest first — the "Where was I?" view.
 * Owner-scoped by the API (GET /api/soul-portrait/mine → listOwnedPortraitsWithSubject;
 * owner_member_id = caller). No client access, no delivery, no consent surface — this is
 * a practitioner-private workspace, not a client-facing page.
 *
 * Dark-themed to match the Studio shell (see docs: Studio pages use unconditional dark
 * classes, never `dark:` variants).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MinePortrait {
  id: string;
  slug: string;
  subjectName: string | null;
  subjectPersonId: string | null;
  consentState: string;
  published: boolean;
  createdAt: string;
  previewUrl: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function StudioSoulPortraitsPage() {
  const [portraits, setPortraits] = useState<MinePortrait[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/soul-portrait/mine', { credentials: 'include' });
        if (res.status === 401) {
          setError('Please sign in.');
          setPortraits([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setPortraits(Array.isArray(data?.portraits) ? data.portraits : []);
      } catch {
        setError('Could not load your portraits.');
        setPortraits([]);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-2xl font-semibold">Your Soul Portraits</h1>
          <Link
            href="/soul-portrait/generate"
            className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-3 py-2 rounded-lg text-sm font-medium"
          >
            New portrait
          </Link>
        </div>
        <p className="text-slate-400 text-sm mb-7">
          Your portraits, newest first. Drafts stay private until you send them.
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {portraits === null && <p className="text-slate-400">Loading…</p>}

        {portraits !== null && portraits.length === 0 && !error && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <p className="text-slate-200 m-0">No portraits yet.</p>
            <p className="text-slate-400 text-sm mt-1.5 mb-0">
              Create your first —{' '}
              <Link href="/soul-portrait/generate" className="text-amber-300">
                generate a portrait
              </Link>
              .
            </p>
          </div>
        )}

        {portraits &&
          portraits.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 mb-3 flex items-baseline justify-between gap-3"
            >
              <div>
                <div className="text-base font-semibold text-slate-100">
                  {p.subjectName || 'Untitled portrait'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {p.published ? <span className="text-emerald-400">Sent</span> : 'Draft'} · {formatDate(p.createdAt)}
                </div>
              </div>
              <div className="flex gap-4 shrink-0 text-sm">
                <Link href={p.previewUrl} className="text-amber-300">
                  Open
                </Link>
                {p.subjectPersonId && (
                  <Link href={`/soul-portrait/generate?personId=${p.subjectPersonId}`} className="text-amber-300">
                    Regenerate
                  </Link>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
