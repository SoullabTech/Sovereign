'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  ConstellationDomain,
  ConstellationFocus,
  ConstellationProjectionNode,
  LivingConstellationProjection,
} from '@/lib/maia/living-constellation/types';

interface Props {
  focus: ConstellationFocus;
  className?: string;
}

const DOMAIN_META: Record<ConstellationDomain, {
  title: string;
  subtitle: string;
  href: string;
}> = {
  living_field: {
    title: 'Living Field',
    subtitle: 'what is alive in your life',
    href: '/maia/living-field',
  },
  vision_studio: {
    title: 'Vision Studio',
    subtitle: 'what your work is becoming',
    href: '/maia/vision-studio?tab=vision',
  },
  practice_field: {
    title: 'Practice Field',
    subtitle: 'how your practice meets others',
    href: '/maia/vision-studio?tab=practice',
  },
};
const FOCUS_DOMAIN: Record<ConstellationFocus, ConstellationDomain> = {
  living: 'living_field',
  vision: 'vision_studio',
  practice: 'practice_field',
};

const FOCUS_COPY: Record<ConstellationFocus, string> = {
  living: 'See what is already real across your life, developing work, and practice.',
  vision: 'Your wider field stays visible while you develop the work.',
  practice: 'Your wider field stays visible while you shape how your practice meets others.',
};

function authorityLabel(node: ConstellationProjectionNode): string {
  if (node.authorship === 'maia_candidate') return 'MAIA candidate';
  if (node.authorship === 'member_confirmed') return 'you confirmed';
  return 'you authored';
}

function DomainCluster({
  domain,
  nodes,
  focused,
}: {
  domain: ConstellationDomain;
  nodes: ConstellationProjectionNode[];
  focused: boolean;
}) {
  const meta = DOMAIN_META[domain];
  const visible = nodes.slice(0, 3);
  const more = Math.max(0, nodes.length - visible.length);

  return (
    <div
      className={`relative z-10 rounded-xl border px-4 py-3 min-h-[118px] transition-colors ${
        focused
          ? 'border-amber-700/60 bg-amber-950/10'
          : 'border-stone-800 bg-stone-950/80'
      }`}
    >
      <Link href={meta.href} className="group block">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-xs uppercase tracking-widest ${
            focused ? 'text-amber-400' : 'text-stone-400'
          }`}>
            {meta.title}
          </p>
          <span className="text-stone-700 text-xs group-hover:text-stone-500">open →</span>
        </div>
        <p className="mt-1 text-[11px] text-stone-600">{meta.subtitle}</p>
      </Link>

      <div className="mt-3 space-y-2">
        {visible.length === 0 ? (
          <p className="text-xs text-stone-700 italic">Nothing authored here yet.</p>
        ) : (
          visible.map((node) => (
            <div key={node.projectionId} className="min-w-0">
              <p className="truncate text-xs text-stone-300">{node.label}</p>
              <p className="text-[10px] text-stone-600">
                {authorityLabel(node)}
                {node.privacy === 'member_shared_with_practitioner' ? ' · shared' : ''}
              </p>
            </div>
          ))
        )}
        {more > 0 && <p className="text-[10px] text-stone-600">+ {more} more</p>}
      </div>
    </div>
  );
}
export function LivingConstellationPanel({ focus, className = '' }: Props) {
  const [projection, setProjection] = useState<LivingConstellationProjection | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/maia/living-constellation')
      .then(async (response) => {
        if (!response.ok) throw new Error('projection unavailable');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setProjection(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const empty: Record<ConstellationDomain, ConstellationProjectionNode[]> = {
      living_field: [],
      vision_studio: [],
      practice_field: [],
    };
    for (const node of projection?.nodes ?? []) empty[node.domain].push(node);
    return empty;
  }, [projection]);

  if (failed) {
    return (
      <div className={`rounded-xl border border-stone-900 px-4 py-3 ${className}`}>
        <p className="text-xs text-stone-600">
          Your wider field is unavailable right now. Nothing has been changed.
        </p>
      </div>
    );
  }
  if (!projection) {
    return (
      <div className={`rounded-xl border border-stone-900 px-4 py-5 ${className}`}>
        <p className="text-xs text-stone-700">Gathering your wider field…</p>
      </div>
    );
  }

  const focusedDomain = FOCUS_DOMAIN[focus];

  return (
    <section className={`rounded-2xl border border-stone-800/80 bg-stone-950/60 p-5 ${className}`}>
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Your wider field</p>
        <p className="mt-2 text-sm font-light leading-relaxed text-stone-400">
          {FOCUS_COPY[focus]}
        </p>
      </div>

      {projection.partial && (
        <p className="mt-3 text-xs text-amber-700/80">
          Some parts of your field are temporarily unavailable; what is shown is partial.
        </p>
      )}

      <div className="relative mt-6">
        <svg
          className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="50" y1="67" x2="50" y2="21" stroke="currentColor" className="text-stone-800" strokeWidth="0.5" />
          <line x1="46" y1="70" x2="20" y2="70" stroke="currentColor" className="text-stone-800" strokeWidth="0.5" />
          <line x1="54" y1="70" x2="80" y2="70" stroke="currentColor" className="text-stone-800" strokeWidth="0.5" />
        </svg>
        <div className="relative grid gap-4 sm:grid-cols-[1fr_132px_1fr] sm:grid-rows-[auto_auto] sm:gap-5">
          <div className="sm:col-start-2 sm:row-start-1">
            <DomainCluster
              domain="vision_studio"
              nodes={grouped.vision_studio}
              focused={focusedDomain === 'vision_studio'}
            />
          </div>

          <div className="sm:col-start-1 sm:row-start-2 sm:self-center">
            <DomainCluster
              domain="living_field"
              nodes={grouped.living_field}
              focused={focusedDomain === 'living_field'}
            />
          </div>

          <div className="order-first flex items-center justify-center sm:order-none sm:col-start-2 sm:row-start-2">
            <div className="relative z-20 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-stone-700 bg-stone-950 shadow-lg">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">you</span>
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-stone-500" />
            </div>
          </div>

          <div className="sm:col-start-3 sm:row-start-2 sm:self-center">
            <DomainCluster
              domain="practice_field"
              nodes={grouped.practice_field}
              focused={focusedDomain === 'practice_field'}
            />
          </div>
        </div>
      </div>
      <p className="mt-5 border-t border-stone-900 pt-3 text-[10px] leading-relaxed text-stone-700">
        These lines show where something currently lives in Soullab. They do not claim
        that the things themselves are psychologically or semantically connected.
      </p>
    </section>
  );
}
