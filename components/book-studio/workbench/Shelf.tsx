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
  /**
   * Piles currently on the table, for the "Place in…" control.
   *
   * Gather must be reachable without dragging for the same reason the other
   * verbs are: HTML5 drag-and-drop does not fire on iOS Safari. Gather is the
   * FIRST act — without a control here, a member on a phone cannot put anything
   * on the table at all, and every other verb is unreachable behind it.
   */
  groups?: { id: string; name: string }[];
  onGather?: (groupId: string, pointer: { source: string; ref: string }) => void;
}

export function Shelf({
  cards,
  query,
  onQueryChange,
  onReturnToShelf,
  groups = [],
  onGather,
}: ShelfProps) {
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
            <Card
              key={`${card.source}:${card.ref}`}
              card={card}
              draggable
              controls={
                onGather && groups.length > 0 ? (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onGather(e.target.value, { source: card.source, ref: card.ref });
                      }
                    }}
                    className="bg-transparent text-amber-200/40 hover:text-amber-200/90 text-xs font-light border-none outline-none cursor-pointer transition-colors min-h-[44px]"
                    aria-label={`Place "${card.title}" in a pile`}
                  >
                    <option value="">Place in…</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id} className="bg-neutral-900">
                        {g.name}
                      </option>
                    ))}
                  </select>
                ) : undefined
              }
            />
          ))
        )}
      </div>
    </section>
  );
}
