'use client';

import { useEffect, useState } from 'react';

type TargetFacet = 'changes' | 'decisions' | 'reflections';

type Origin = {
  crossingId: string;
  crossedAt: string;
  source: {
    facet: 'journal' | 'reflections' | 'divination';
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
      <p className={`text-[10px] uppercase tracking-[0.18em] mb-2 ${headingTone}`}>
        Where this began
      </p>
      <div className="space-y-3">
        {origins.map((origin) => (
          <div
            key={origin.crossingId + ':' + (origin.source?.refId || origin.crossedAt)}
            className="border-l border-amber-700/30 pl-4"
          >
            {origin.source ? (
              <>
                <p className={`text-xs ${sourceTone}`}>
                  {origin.source.facet === 'journal'
                    ? 'Journal'
                    : origin.source.facet === 'divination'
                      ? 'Divination'
                      : 'Reflection'}
                </p>
                <p className={`text-sm mt-1 ${labelTone}`}>{origin.source.label}</p>
                <a
                  href={origin.source.returnHref}
                  className="inline-block mt-1 text-[11px] text-amber-500/65 hover:text-amber-400"
                >
                  Return to source →
                </a>
              </>
            ) : (
              <p className={`text-xs ${missingTone}`}>
                The original source is no longer available. This {
                  targetFacet === 'changes' ? 'Change' : targetFacet === 'decisions' ? 'Decision' : 'Reflection'
                } remains.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
