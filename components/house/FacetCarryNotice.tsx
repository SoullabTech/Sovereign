'use client';

import { useEffect, useRef, useState } from 'react';

type SourceFacet = 'journal' | 'reflections';
type TargetFacet = 'changes' | 'decisions';

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
}: {
  targetFacet: TargetFacet;
  sourceRef: FacetCarryRef;
  onResolved?: (source: CarrySource | null) => void;
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

  if (failed) {
    return (
      <div className="border-l border-stone-600/60 pl-4 py-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Source unavailable</p>
        <p className="text-xs text-stone-500 mt-1">
          Nothing has crossed. Return to the source and try again.
        </p>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="border-l border-stone-700/60 pl-4 py-1" aria-label="Loading carried source">
        <p className="text-xs text-stone-500">Carrying the source with you…</p>
      </div>
    );
  }

  return (
    <aside className="border-l border-amber-700/35 pl-4 py-1" aria-label="Carried source">
      <p className="text-[10px] uppercase tracking-[0.18em] text-amber-500/65">
        Came with you from {source.facet === 'journal' ? 'Journal' : 'Reflections'}
      </p>
      <p className="text-sm text-stone-300 mt-1">{source.label}</p>
      {source.excerpt ? (
        <p className="text-xs leading-relaxed text-stone-500 mt-2 line-clamp-3">{source.excerpt}</p>
      ) : null}
      <a
        href={source.returnHref}
        className="inline-block mt-2 text-[11px] text-amber-500/65 hover:text-amber-400"
      >
        Return to source →
      </a>
      <p className="text-[11px] text-stone-600 mt-3">
        The source stays where it is. You decide what belongs here.
      </p>
    </aside>
  );
}
