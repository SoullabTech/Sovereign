'use client';

import { useEffect, useState } from 'react';
import { SymbolicCarryNotice } from '@/components/house/SymbolicCarryNotice';
import { readability } from '@/lib/house/readability';

type TargetFacet = 'changes' | 'decisions' | 'journal' | 'anchor' | 'reflections';

type Origin = {
  crossingId: string;
  crossedAt: string;
  source: {
    facet: 'journal' | 'reflections' | 'ideas' | 'relationships' | 'changes' | 'decisions' | 'divination' | 'astrology';
    refId: string;
    label: string;
    excerpt: string;
    createdAt: string | null;
    returnHref: string;
  } | null;
};

export function FacetOriginTrail({
  targetFacet,
  targetRefId,
  className = '',
  tone = 'dark',
}: {
  targetFacet: TargetFacet;
  targetRefId: string;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  const [origins, setOrigins] = useState<Origin[]>([]);

  useEffect(() => {
    let live = true;
    const params = new URLSearchParams({ targetFacet, targetRefId });
    void fetch('/api/house/crossings?' + params.toString(), { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('crossings unavailable');
        const data = await res.json();
        if (live) setOrigins(Array.isArray(data?.crossings) ? data.crossings : []);
      })
      .catch(() => {
        if (live) setOrigins([]);
      });
    return () => {
      live = false;
    };
  }, [targetFacet, targetRefId]);

  if (origins.length === 0) return null;

  const headingTone = tone === 'light' ? 'text-stone-500' : 'text-stone-500';
  const sourceTone = tone === 'light' ? 'text-stone-500' : 'text-stone-500';
  const labelTone = tone === 'light' ? 'text-stone-700' : 'text-stone-300';
  const missingTone = tone === 'light' ? 'text-stone-500' : 'text-stone-500';

  return (
    <section className={className} aria-label="Where this began">
      <p className={`${readability.marker} mb-2 ${headingTone}`}>
        Where this began
      </p>
      <div className="space-y-3">
        {origins.map((origin) => (
          <div
            key={origin.crossingId + ':' + (origin.source?.refId || origin.crossedAt)}
            className="border-l border-amber-700/30 pl-4"
          >
            {origin.source ? (
              origin.source.facet === 'divination' && targetFacet === 'journal' ? (
                <SymbolicCarryNotice
                  sourceRefId={origin.source.refId}
                  mode="origin"
                />
              ) : (
              <>
                <p className={`${readability.metadata} ${sourceTone}`}>
                  {origin.source.facet === 'journal'
                    ? 'Journal'
                    : origin.source.facet === 'divination'
                      ? 'Divination'
                      : origin.source.facet === 'ideas'
                        ? 'Idea'
                        : origin.source.facet === 'relationships'
                          ? 'Relationship'
                          : origin.source.facet === 'changes'
                            ? 'Change'
                            : origin.source.facet === 'decisions'
                              ? 'Decision'
                              : origin.source.facet === 'astrology'
                                ? 'Astrology'
                                : 'Reflection'}
                </p>
                <p className={`${readability.itemTitle} mt-1 ${labelTone}`}>{origin.source.label}</p>
                <a
                  href={origin.source.returnHref}
                  className={`${readability.action} inline-flex min-h-11 items-center mt-1 text-amber-500/70 hover:text-amber-400`}
                >
                  Return to source →
                </a>
              </>
              )
            ) : (
              <p className={`${readability.body} ${missingTone}`}>
                The original source is no longer available. This {
                  targetFacet === 'changes' ? 'Change' : targetFacet === 'decisions' ? 'Decision' : targetFacet === 'anchor' ? 'Daily Anchor' : 'Reflection'
                } remains.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
