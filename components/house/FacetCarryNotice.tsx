'use client';

import { useEffect, useRef, useState } from 'react';

type SourceFacet = 'journal' | 'reflections' | 'ideas' | 'relationships';
type TargetFacet = 'changes' | 'decisions' | 'journal';

export type FacetCarryRef = {
  crossingId: string;
  sourceFacet: SourceFacet;
  sourceRefId: string;
};

type CarrySource = {
  facet: SourceFacet;
  refId: string;
  label: string;
  excerpt: string;
  createdAt: string | null;
  returnHref: string;
};

export function FacetCarryNotice({
  targetFacet,
  sourceRef,
  onResolved,
  tone = 'dark',
}: {
  targetFacet: TargetFacet;
  sourceRef: FacetCarryRef;
  onResolved?: (source: CarrySource | null) => void;
  tone?: 'dark' | 'light';
}) {
  const [source, setSource] = useState<CarrySource | null>(null);
  const [failed, setFailed] = useState(false);
  const onResolvedRef = useRef(onResolved);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    let live = true;
    const params = new URLSearchParams({
      sourceFacet: sourceRef.sourceFacet,
      sourceRefId: sourceRef.sourceRefId,
      targetFacet,
      crossingId: sourceRef.crossingId,
    });

    void fetch('/api/house/carry-source?' + params.toString(), { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('carry source unavailable');
        const data = await res.json();
        if (!live) return;
        const next = data?.source ?? null;
        setSource(next);
        setFailed(!next);
        onResolvedRef.current?.(next);
      })
      .catch(() => {
        if (!live) return;
        setSource(null);
        setFailed(true);
        onResolvedRef.current?.(null);
      });

    return () => {
      live = false;
    };
  }, [sourceRef.crossingId, sourceRef.sourceFacet, sourceRef.sourceRefId, targetFacet]);

  const paper = tone === 'light';
  const border = paper ? 'border-[#b9aa8f]/45' : 'border-amber-700/35';
  const heading = paper ? 'text-[#8d7350]' : 'text-amber-500/65';
  const label = paper ? 'text-[#4f493f]' : 'text-stone-300';
  const quiet = paper ? 'text-[#7b7163]' : 'text-stone-500';
  const returnTone = paper ? 'text-[#8d7350] hover:text-[#6f5638]' : 'text-amber-500/65 hover:text-amber-400';

  if (failed) {
    return (
      <div className={`border-l pl-4 py-1 ${paper ? 'border-[#b7aa95]/45' : 'border-stone-600/60'}`}>
        <p className={`text-[11px] uppercase tracking-[0.18em] ${quiet}`}>Source unavailable</p>
        <p className={`text-xs mt-1 ${quiet}`}>
          Nothing has crossed. Return to the source and try again.
        </p>
      </div>
    );
  }

  if (!source) {
    return (
      <div className={`border-l pl-4 py-1 ${paper ? 'border-[#c7bba6]/40' : 'border-stone-700/60'}`} aria-label="Loading carried source">
        <p className={`text-xs ${quiet}`}>Carrying the source with you…</p>
      </div>
    );
  }

  return (
    <aside className={`border-l pl-4 py-1 ${border}`} aria-label="Carried source">
      <p className={`text-[10px] uppercase tracking-[0.18em] ${heading}`}>
        Came with you from {source.facet === 'journal' ? 'Journal' : source.facet === 'reflections' ? 'Reflections' : source.facet === 'relationships' ? 'Relationships' : 'Ideas'}
      </p>
      <p className={`text-sm mt-1 ${label}`}>{source.label}</p>
      {source.excerpt ? (
        <p className={`text-xs leading-relaxed mt-2 line-clamp-3 ${quiet}`}>{source.excerpt}</p>
      ) : null}
      <a
        href={source.returnHref}
        className={`inline-block mt-2 text-[11px] ${returnTone}`}
      >
        Return to source →
      </a>
      <p className={`text-[11px] mt-3 ${paper ? 'text-[#8b8173]' : 'text-stone-600'}`}>
        The source stays where it is. You decide what belongs here.
      </p>
    </aside>
  );
}
