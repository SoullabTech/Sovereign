'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';

interface SavedSynastryItem {
  analysisId: string;
  createdAt: string;
  savedAt: string;
  chartA: { sunSign: string; moonSign: string } | null;
  chartB: { sunSign: string; moonSign: string } | null;
  scores: { attraction: number; harmony: number; friction: number; growth: number } | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SynastryCard({ item, onUnsave }: { item: SavedSynastryItem; onUnsave: () => void }) {
  const [unsaving, setUnsaving] = useState(false);

  async function handleUnsave() {
    const memberId = getOrCreateExplorerId();
    if (!memberId || unsaving) return;

    setUnsaving(true);
    try {
      const res = await fetch('/api/astrology/synastry/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: item.analysisId,
          memberId,
          saved: false,
        }),
      });
      const json = await res.json();
      if (json?.success) {
        onUnsave();
      }
    } finally {
      setUnsaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm text-white/80">
            {item.chartA?.sunSign ?? '?'} + {item.chartB?.sunSign ?? '?'}
          </div>
          <div className="text-xs text-white/50">
            Saved {formatDate(item.savedAt)}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/astrology/synastry/${item.analysisId}`}
            className="rounded-lg border border-violet-500/30 bg-violet-500/20 px-3 py-1.5 text-xs text-violet-200 hover:bg-violet-500/30"
          >
            Open
          </Link>
          <button
            onClick={handleUnsave}
            disabled={unsaving}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 disabled:opacity-50"
          >
            {unsaving ? '...' : 'Remove'}
          </button>
        </div>
      </div>

      {item.scores && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-pink-500/10 p-2">
            <div className="text-sm font-medium text-pink-200">{item.scores.attraction}</div>
            <div className="text-[9px] text-pink-300/60">Attraction</div>
          </div>
          <div className="rounded-lg bg-green-500/10 p-2">
            <div className="text-sm font-medium text-green-200">{item.scores.harmony}</div>
            <div className="text-[9px] text-green-300/60">Harmony</div>
          </div>
          <div className="rounded-lg bg-orange-500/10 p-2">
            <div className="text-sm font-medium text-orange-200">{item.scores.friction}</div>
            <div className="text-[9px] text-orange-300/60">Friction</div>
          </div>
          <div className="rounded-lg bg-violet-500/10 p-2">
            <div className="text-sm font-medium text-violet-200">{item.scores.growth}</div>
            <div className="text-[9px] text-violet-300/60">Growth</div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-white/30">
        Created {formatDate(item.createdAt)}
      </div>
    </div>
  );
}

export default function SavedSynastryPage() {
  const [items, setItems] = useState<SavedSynastryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const memberId = getOrCreateExplorerId();
      if (!memberId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/astrology/synastry/saved?memberId=${encodeURIComponent(memberId)}`);
        const json = await res.json();

        if (!json?.success) {
          throw new Error(json?.error ?? 'Failed to load saved synastry');
        }

        setItems(json.items ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleUnsave(analysisId: string) {
    setItems((prev) => prev.filter((i) => i.analysisId !== analysisId));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">Saved Synastry</h1>
            <p className="text-sm text-white/60">
              Your saved chart comparisons
            </p>
          </div>
          <Link
            href="/astrology/synastry"
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
          >
            New Synastry
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/50">Loading...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-white/50">No saved synastry analyses yet.</div>
            <Link
              href="/astrology/synastry"
              className="inline-block rounded-lg border border-violet-500/30 bg-violet-500/20 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/30"
            >
              Create Your First
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <SynastryCard
                key={item.analysisId}
                item={item}
                onUnsave={() => handleUnsave(item.analysisId)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
