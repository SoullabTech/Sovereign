'use client';

/**
 * Card — a single capture pointer rendered on the Shelf or inside a Group.
 *
 * Shelf cards are draggable (carry a JSON-encoded { source, ref } via
 * DataTransfer). Group cards are not draggable in v0 (reorder-within-group
 * waits for lived contact to confirm it's needed).
 */

import type { WorkbenchCardRef } from '@/lib/workbench/sources/types';

interface CardProps {
  card: WorkbenchCardRef | { source: string; ref: string; title?: string; preview?: string };
  draggable?: boolean;
  onRemove?: () => void;
}

export function Card({ card, draggable = false, onRemove }: CardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ source: card.source, ref: card.ref }),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      className={[
        'group relative px-3 py-2 rounded border border-amber-200/10 bg-amber-200/[0.02]',
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
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 text-amber-200/30 hover:text-amber-200/70 text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove from group"
        >
          ×
        </button>
      )}
    </div>
  );
}
