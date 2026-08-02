'use client';

/**
 * Shelf — retrieval surface.
 *
 * Search + filtered list across the sources enabled for this arranger. Cards
 * are draggable onto piles. The Shelf is search-on-demand — no ambient
 * surfacing, no "captures you might want" suggestions.
 *
 * The Shelf is also a drop target, which is how Return to Shelf reads as a
 * gesture rather than a deletion. Dropping here removes an arrangement fact;
 * it stores nothing. The Shelf is not a second location — everything already
 * on it stays on it whether or not it is also on the table.
 */

import { useState } from 'react';
import { Card } from './Card';
import type { WorkbenchCardRef } from '@/lib/workbench/sources/types';

interface ShelfProps {
  cards: WorkbenchCardRef[];
  query: string;
  onQueryChange: (q: string) => void;
  /** Called when a card is dragged off the table and dropped here. */
  onReturnToShelf?: (groupId: string, cardId: string) => void;
}

export function Shelf({ cards, query, onQueryChange, onReturnToShelf }: ShelfProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!onReturnToShelf) return;
    try {
      const p = JSON.parse(e.dataTransfer.getData('application/json'));
      // Only a card that came off the table can be returned to the Shelf.
      if (p && typeof p.cardId === 'string' && typeof p.fromGroupId === 'string') {
        onReturnToShelf(p.fromGroupId, p.cardId);
      }
    } catch {
      // Ignore malformed payloads.
    }
  };

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={[
        'space-y-3 rounded p-2 -m-2 border transition-colors',
        isDragOver ? 'border-amber-200/30 bg-amber-200/[0.03]' : 'border-transparent',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase">
          Shelf
        </h2>
        <span className="text-amber-200/35 text-xs font-light italic">
          {isDragOver && onReturnToShelf
            ? 'Release to return'
            : `${cards.length} ${cards.length === 1 ? 'card' : 'cards'}`}
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
              : 'Nothing on the Shelf yet.'}
          </p>
        ) : (
          cards.map((card) => (
            <Card key={`${card.source}:${card.ref}`} card={card} draggable />
          ))
        )}
      </div>
    </section>
  );
}
