'use client';

/**
 * Studio — the Now What? support desk. The practitioner's Admin field.
 *
 * Kelly directive 2026-07-30: "a backend Admin field for practitioner
 * development and support." Three panels, studio register:
 *
 *   1. Shared with you — the receiving surface for the member share gesture
 *      (only what each client explicitly handed over, item by item).
 *   2. Your doors — every program with its copyable invitation link
 *      (the door link IS the client's front door; no send machinery here).
 *   3. Build & tend — the authoring surfaces (#613 platform + environment map).
 *
 * Doctrine held: entry ≠ visibility. This desk shows what was handed to the
 * practitioner and what he authored — never member activity, positions,
 * or anything unshared. No aggregation, no engagement data, ever.
 */

import { useEffect, useState } from 'react';

interface SharedItem {
  id: string;
  title: string;
  content: string;
  kind: string | null;
  sharedBy: string;
  createdAt: string;
}
interface Program {
  programSlug: string;
  title: string;
  kind: string;
}

const CARD = 'bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5';

function doorLink(fieldSlug: string, programSlug?: string) {
  const base = `https://soullab.life/now-what/room?fieldContext=${encodeURIComponent(fieldSlug)}`;
  return programSlug ? `${base}&program=${encodeURIComponent(programSlug)}` : base;
}

export default function NowWhatSupportDesk() {
  const [shared, setShared] = useState<SharedItem[] | null>(null);
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [fieldSlug, setFieldSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/studio/now-what/shared'),
          fetch('/api/practitioner/programs'),
        ]);
        const sJson = await sRes.json().catch(() => ({}));
        const pJson = await pRes.json().catch(() => ({}));
        if (!sRes.ok) throw new Error(sJson?.error || 'Could not open the desk.');
        if (cancelled) return;
        setShared(sJson.items ?? []);
        setFieldSlug(sJson.fieldSlug ?? pJson.fieldSlug ?? null);
        setPrograms(
          (pJson.programs ?? []).map((p: any) => ({
            programSlug: p.programSlug ?? p.program_slug,
            title: p.title,
            kind: p.kind,
          }))
        );
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function copy(link: string, key: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-slate-200">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-1">Now What? · support desk</p>
        <h1 className="text-2xl font-light text-slate-100">Your practice, between sessions.</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-prose">
          Only what each client chose to hand you appears here — item by item, by
          their own gesture. Nothing else about their work is visible, by design.
        </p>
      </header>

      {error && (
        <div className={CARD}>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 1 — Shared with you */}
      <section className={CARD} aria-label="Shared with you">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-4">Shared with you</h2>
        {shared === null && !error && <p className="text-slate-500 text-sm">Opening…</p>}
        {shared !== null && shared.length === 0 && (
          <p className="text-slate-400 text-sm">
            Nothing yet. When a client chooses “Share with your practitioner” on
            something they kept, it appears here in their words.
          </p>
        )}
        <ul className="space-y-4">
          {(shared ?? []).map((item) => (
            <li key={item.id} className="border-l-2 border-amber-500/40 pl-4">
              <p className="text-slate-100 text-sm">{item.title}</p>
              {item.content && item.content !== item.title && (
                <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{item.content}</p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                {item.sharedBy} · {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {item.kind && <span className="ml-2 text-amber-400/70">{item.kind}</span>}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 2 — Your doors */}
      <section className={CARD} aria-label="Your doors">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-4">Your doors</h2>
        <p className="text-slate-400 text-sm mb-4 max-w-prose">
          Each program has a door. Send a client its link and they arrive in your
          space — invited, oriented, and returned to the same door every time.
        </p>
        {fieldSlug && (
          <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/60">
            <div>
              <p className="text-slate-100 text-sm">General door</p>
              <p className="text-slate-500 text-xs">Your field, no specific program</p>
            </div>
            <button
              onClick={() => copy(doorLink(fieldSlug), 'general')}
              className="text-xs rounded-full border border-amber-500/40 text-amber-400 px-4 py-1.5 hover:bg-amber-500/10 transition-colors whitespace-nowrap"
            >
              {copied === 'general' ? 'Copied' : 'Copy link'}
            </button>
          </div>
        )}
        {(programs ?? []).map((p) => (
          <div key={p.programSlug} className="flex items-center justify-between gap-3 py-2 border-b border-slate-800/60 last:border-0">
            <div>
              <p className="text-slate-100 text-sm">{p.title}</p>
              <p className="text-slate-500 text-xs">{p.kind}</p>
            </div>
            <button
              onClick={() => fieldSlug && copy(doorLink(fieldSlug, p.programSlug), p.programSlug)}
              className="text-xs rounded-full border border-amber-500/40 text-amber-400 px-4 py-1.5 hover:bg-amber-500/10 transition-colors whitespace-nowrap"
            >
              {copied === p.programSlug ? 'Copied' : 'Copy link'}
            </button>
          </div>
        ))}
        {programs !== null && programs.length === 0 && (
          <p className="text-slate-500 text-sm">
            No programs yet — author one in <a href="/studio/programs" className="text-amber-400 underline underline-offset-2">Programs</a> and its door appears here.
          </p>
        )}
      </section>

      {/* 3 — Build & tend */}
      <section className={CARD} aria-label="Build and tend">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-4">Build &amp; tend</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <a href="/studio/programs" className="rounded-lg border border-slate-700 p-4 hover:border-amber-500/40 transition-colors">
            <p className="text-slate-100 text-sm mb-1">Programs</p>
            <p className="text-slate-500 text-xs">Author what each door opens onto</p>
          </a>
          <a href="/studio/materials" className="rounded-lg border border-slate-700 p-4 hover:border-amber-500/40 transition-colors">
            <p className="text-slate-100 text-sm mb-1">Materials</p>
            <p className="text-slate-500 text-xs">Your library, ratified by you</p>
          </a>
          <a href="/studio/environment" className="rounded-lg border border-slate-700 p-4 hover:border-amber-500/40 transition-colors">
            <p className="text-slate-100 text-sm mb-1">Environment</p>
            <p className="text-slate-500 text-xs">The building your clients walk</p>
          </a>
        </div>
      </section>
    </div>
  );
}
