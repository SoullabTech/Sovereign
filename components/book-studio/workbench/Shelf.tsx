'use client';

/**
 * Shelf — retrieval surface.
 *
 * Search + filtered list across enabled sources (Slice 1: uploaded only).
 * Cards are draggable onto Table groups. The Shelf is search-on-demand —
 * no ambient surfacing, no "captures you might want" suggestions.
 */

import { Card } from './Card';
import type { WorkbenchCardRef } from '@/lib/workbench/sources/types';

interface ShelfProps {
  cards: WorkbenchCardRef[];
  query: string;
  onQueryChange: (q: string) => void;
}

export function Shelf({ cards, query, onQueryChange }: ShelfProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase">
          Shelf
        </h2>
        <span className="text-amber-200/35 text-xs font-light italic">
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </span>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search reviewed captures…"
        className="w-full bg-transparent border-b border-amber-200/15 focus:border-amber-200/40 outline-none py-2 text-amber-50/85 text-sm font-light placeholder:text-amber-200/30 transition-colors"
      />

      <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
        {cards.length === 0 ? (
          <p className="text-amber-200/35 text-sm font-light italic py-4">
            {query
              ? 'No captures match this search.'
              : 'No reviewed captures yet. Upload a file to begin.'}
          </p>
        ) : (
          cards.map((card) => <Card key={`${card.source}:${card.ref}`} card={card} draggable />)
        )}
      </div>
    </section>
  );
}
