'use client';

import { useEffect, useMemo, useState } from 'react';

type SpiralStateResponse =
  | { exists: false }
  | {
      exists: true;
      currentElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' | string;
      phase: number | null;
      motion: 'ascending' | 'stuck' | 'breakthrough' | null;
      autonomyStreak: number | null;
      updatedAt: string | null;
    };

const elementMeta: Record<
  string,
  {
    glyph: string;
    label: string;
    glyphClass: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
  }
> = {
  fire: {
    glyph: '△',
    label: 'Fire',
    glyphClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-100',
  },
  water: {
    glyph: '▽',
    label: 'Water',
    glyphClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-100',
  },
  earth: {
    glyph: '◇',
    label: 'Earth',
    glyphClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-100',
  },
  air: {
    glyph: '○',
    label: 'Air',
    glyphClass: 'text-indigo-300',
    borderClass: 'border-indigo-400/30',
    bgClass: 'bg-indigo-400/10',
    textClass: 'text-indigo-100',
  },
  aether: {
    glyph: '✦',
    label: 'Aether',
    glyphClass: 'text-violet-300',
    borderClass: 'border-violet-400/30',
    bgClass: 'bg-violet-400/10',
    textClass: 'text-violet-100',
  },
};

const motionLabels: Record<string, string> = {
  ascending: 'ascending',
  stuck: 'tending',
  breakthrough: 'breakthrough',
};

function formatRelativeTime(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

function ContinuitySkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function ContinuityView() {
  const [data, setData] = useState<SpiralStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadState() {
      try {
        setLoading(true);
        setHasError(false);

        const response = await fetch('/api/members/spiral-state', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const json = (await response.json()) as SpiralStateResponse;

        if (isMounted) {
          setData(json);
        }
      } catch (error) {
        console.error('Failed to load continuity view:', error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadState();

    return () => {
      isMounted = false;
    };
  }, []);

  const meta = useMemo(() => {
    if (!data || !data.exists) return null;
    return (
      elementMeta[data.currentElement] ?? {
        glyph: '◈',
        label: data.currentElement,
        glyphClass: 'text-white',
        borderClass: 'border-white/20',
        bgClass: 'bg-white/5',
        textClass: 'text-white',
      }
    );
  }, [data]);

  if (loading) {
    return <ContinuitySkeleton />;
  }

  if (hasError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Unable to load your current register right now.
      </div>
    );
  }

  if (!data || !data.exists) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">
          No sessions yet. Your current register will appear here after your first conversation.
        </p>
      </div>
    );
  }

  const motionLabel = data.motion ? (motionLabels[data.motion] ?? data.motion) : null;
  const relativeTime = formatRelativeTime(data.updatedAt);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${meta?.borderClass} ${meta?.bgClass}`}
          aria-hidden="true"
        >
          <span className={`text-3xl leading-none ${meta?.glyphClass}`}>{meta?.glyph}</span>
        </div>

        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-white/40">Current register</div>
          <div className={`text-lg font-medium ${meta?.textClass}`}>{meta?.label}</div>

          {data.phase != null && (
            <div className="mt-1 text-sm text-white/80">Phase {data.phase}</div>
          )}

          {motionLabel && (
            <div className="mt-1 text-sm text-white/60">Motion: {motionLabel}</div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="text-white/75">
          Autonomy streak:{' '}
          <span className="text-white">
            {data.autonomyStreak ?? 0} session{data.autonomyStreak === 1 ? '' : 's'}
          </span>
        </div>

        {relativeTime && (
          <div className="text-white/50">
            Orientated: <span className="text-white/70">{relativeTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
