'use client';

/**
 * Table — the arrangement surface.
 *
 * Holds named piles, each containing ordered placements. Still a vertical list
 * inside named piles; 2D placement and nested piles wait for lived contact.
 */

import { Group } from './Group';
import type { ResolvedTable } from './Room';

interface TableProps {
  table: ResolvedTable | null;
  onAddGroup: () => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onGather: (groupId: string, pointer: { source: string; ref: string }, toIndex?: number) => void;
  onMove: (cardId: string, fromGroupId: string, toGroupId: string, toIndex?: number) => void;
  onDuplicate: (cardId: string, fromGroupId: string, toGroupId: string) => void;
  onReorder: (groupId: string, cardId: string, toIndex: number) => void;
  onReturnToShelf: (groupId: string, cardId: string) => void;
  onGraduate: (groupId: string) => void;
  /** False on the member surface — graduation is not in the first member slice. */
  canGraduate?: boolean;
}

export function Table({
  table,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onGather,
  onMove,
  onDuplicate,
  onReorder,
  onReturnToShelf,
  onGraduate,
  canGraduate = true,
}: TableProps) {
  if (!table) {
    return (
      <p className="text-amber-200/35 text-sm font-light italic">Loading table…</p>
    );
  }

  const groups = table.layout.groups ?? [];
  const groupIndex = groups.map((g) => ({ id: g.id, name: g.name }));

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase">
          Table — {table.name}
        </h2>
        <button
          type="button"
          onClick={onAddGroup}
          className="text-amber-200/55 hover:text-amber-100 text-xs font-light tracking-wide transition-colors"
        >
          + New pile
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-amber-200/35 text-sm font-light italic py-8 text-center">
          No piles yet. Create one to begin arranging.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Group
              key={g.id}
              group={g}
              allGroups={groupIndex}
              onGather={onGather}
              onMove={onMove}
              onDuplicate={onDuplicate}
              onReorder={onReorder}
              onReturnToShelf={onReturnToShelf}
              onRename={onRenameGroup}
              onDelete={onDeleteGroup}
              onGraduate={onGraduate}
              canGraduate={canGraduate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
