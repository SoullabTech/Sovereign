// components/astrology/synastry/SynastryViewerClient.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import SynastryAspectGrid from './SynastryAspectGrid';
import SynastryScores from './SynastryScores';
import SynastryHighlights from './SynastryHighlights';

type Props = {
  analysisId: string;
  persistedAt?: string | null;
  updatedAt?: string | null;
  initialPayload: Record<string, unknown>;
};

type Aspect = {
  aBody: string;
  bBody: string;
  aspect: string;
  orbDeg: number;
  strength: number;
  polarity?: 'harmony' | 'friction' | 'neutral';
  label?: string;
  interpretation?: string;
};

export default function SynastryViewerClient({
  analysisId,
  persistedAt,
  updatedAt,
  initialPayload,
}: Props) {
  const payload = initialPayload ?? {};
  const synastry = payload.synastry as {
    aspects?: Aspect[];
    highlights?: unknown[];
    scores?: Record<string, number>;
  } | undefined;

  const [query, setQuery] = useState('');
  const [aspectFilter, setAspectFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'strength' | 'orb'>('strength');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const aspects = (synastry?.aspects ?? []) as Aspect[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = aspects;

    if (aspectFilter !== 'all') {
      list = list.filter((a) => String(a.aspect) === aspectFilter);
    }

    if (q) {
      list = list.filter((a) => {
        const hay = `${a.aBody} ${a.aspect} ${a.bBody} ${a.label ?? ''} ${a.interpretation ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const dir = sortDir === 'desc' ? -1 : 1;

    list = [...list].sort((x, y) => {
      const ax = sortKey === 'strength' ? Number(x.strength ?? 0) : Number(x.orbDeg ?? 0);
      const ay = sortKey === 'strength' ? Number(y.strength ?? 0) : Number(y.orbDeg ?? 0);
      return (ax - ay) * dir;
    });

    return list;
  }, [aspects, query, aspectFilter, sortKey, sortDir]);

  const chartA = (payload.chartA ?? {}) as { sunSign?: string; moonSign?: string; ascendantSign?: string };
  const chartB = (payload.chartB ?? {}) as { sunSign?: string; moonSign?: string; ascendantSign?: string };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/astrology/synastry"
          className="inline-flex items-center gap-2 text-dune-spice-sand/70 hover:text-dune-spice-orange transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          New Comparison
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dune-dune-amber mb-1">Synastry Analysis</h1>
            <div className="text-sm text-dune-spice-sand/60">
              ID: <span className="text-dune-spice-sand/80 font-mono">{analysisId}</span>
            </div>
            <div className="text-xs text-dune-spice-sand/50 mt-1">
              {persistedAt ? `Saved: ${formatDate(persistedAt)}` : null}
              {updatedAt ? ` • Updated: ${formatDate(updatedAt)}` : null}
            </div>
          </div>

          {/* Big Three summary */}
          <div className="rounded-2xl border border-dune-bene-gesserit-gold/40 bg-black/40 backdrop-blur-md px-5 py-4">
            <div className="text-xs text-dune-spice-sand/60 mb-1">Big Three</div>
            <div className="text-lg">
              <span className="font-semibold text-dune-spice-orange">{chartA.sunSign ?? '—'}</span>
              <span className="text-dune-spice-sand/60"> / {chartA.moonSign ?? '—'} / {chartA.ascendantSign ?? '—'}</span>
              <span className="mx-3 text-dune-spice-sand/30">↔</span>
              <span className="font-semibold text-dune-fremen-azure">{chartB.sunSign ?? '—'}</span>
              <span className="text-dune-spice-sand/60"> / {chartB.moonSign ?? '—'} / {chartB.ascendantSign ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left sidebar: Scores + Highlights */}
          <div className="lg:col-span-4 space-y-6">
            <SynastryScores scores={synastry?.scores ?? {}} />
            <SynastryHighlights highlights={(synastry?.highlights ?? []) as Record<string, unknown>[]} />
          </div>

          {/* Right: Aspect grid with filters */}
          <div className="lg:col-span-8">
            {/* Filter controls */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dune-spice-sand/50" />
                <input
                  className="w-full rounded-xl border border-dune-spice-sand/20 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-dune-dune-amber placeholder-dune-spice-sand/50 focus:border-dune-spice-orange/50 focus:outline-none"
                  placeholder="Search (planet / aspect / text)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                className="rounded-xl border border-dune-spice-sand/20 bg-black/40 px-4 py-2.5 text-sm text-dune-dune-amber focus:border-dune-spice-orange/50 focus:outline-none"
                value={aspectFilter}
                onChange={(e) => setAspectFilter(e.target.value)}
              >
                <option value="all">All aspects</option>
                <option value="conjunction">Conjunction</option>
                <option value="opposition">Opposition</option>
                <option value="trine">Trine</option>
                <option value="square">Square</option>
                <option value="sextile">Sextile</option>
              </select>

              <select
                className="rounded-xl border border-dune-spice-sand/20 bg-black/40 px-4 py-2.5 text-sm text-dune-dune-amber focus:border-dune-spice-orange/50 focus:outline-none"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as 'strength' | 'orb')}
              >
                <option value="strength">Sort: strength</option>
                <option value="orb">Sort: orb</option>
              </select>

              <button
                className="rounded-xl border border-dune-spice-sand/20 bg-black/40 px-4 py-2.5 text-sm text-dune-dune-amber hover:bg-black/60 transition-colors"
                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              >
                {sortDir === 'desc' ? '↓' : '↑'}
              </button>
            </div>

            <SynastryAspectGrid aspects={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
}
