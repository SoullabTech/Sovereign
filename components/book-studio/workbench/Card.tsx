'use client';

/**
 * Card — a single capture pointer rendered on the Shelf or inside a pile.
 *
 * Cards carry a JSON drag payload. The payload's SHAPE is what tells a drop
 * target which act is being performed:
 *
 *   { source, ref }                       — from the Shelf   → gather
 *   { source, ref, cardId, fromGroupId }  — from a pile      → move / return
 *
 * A card on the table is a PLACEMENT, and two placements may point at the same
 * capture. So a card's React key must be its placement id, never {source, ref}.
 *
 * The `controls` slot is composed by the caller rather than driven by a growing
 * list of callback props — the Shelf renders none, a pile renders the full verb
 * set. Controls are always in the DOM (not hover-gated) so they remain usable
 * on touch, where drag-and-drop does not exist.
 */

import type { ReactNode } from 'react';

interface CardProps {
  card: { source: string; ref: string; title?: string; preview?: string };
  draggable?: boolean;
  /** Serialized to `application/json` on dragstart. */
  dragPayload?: Record<string, unknown>;
  controls?: ReactNode;
}

export function Card({ card, draggable = false, dragPayload, controls }: CardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify(dragPayload ?? { source: card.source, ref: card.ref }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      className={[
        'group/card relative px-3 py-2 rounded border border-amber-200/10 bg-amber-200/[0.02]',
        'hover:border-amber-200/25 hover:bg-amber-200/[0.04] transition-colors',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
      ].join(' ')}
    >
      <div className="text-amber-100/85 text-sm font-light truncate">
        {card.title || `${card.source}:${card.ref.slice(0, 8)}…`}
      </div>
      {card.preview && (
        <div className="text-amber-200/45 text-xs font-light mt-1 line-clamp-2">
          {card.preview}
        </div>
      )}
      {controls && <div className="mt-2">{controls}</div>}
    </div>
  );
}
