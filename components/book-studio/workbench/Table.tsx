'use client';

/**
 * Table — the arrangement surface.
 *
 * Holds named Groups, each containing ordered card pointers. v0 ships
 * with vertical-list-inside-named-groups; richer layouts (2D placement,
 * nested groups) wait for lived contact.
 */

import { Group } from './Group';
import type { CardPointer } from '@/lib/workbench/sources/types';
import type { ResolvedTable } from './Room';

interface TableProps {
  table: ResolvedTable | null;
  onAddGroup: () => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onRemoveCard: (groupId: string, cardId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDropOnGroup: (groupId: string, pointer: CardPointer) => void;
  onGraduate: (groupId: string) => void;
  /** False on the member surface — graduation is not in the first member slice. */
  canGraduate?: boolean;
}

export function Table({
  table,
  onAddGroup,
  onRenameGroup,
  onRemoveCard,
  onDeleteGroup,
  onDropOnGroup,
  onGraduate,
  canGraduate = true,
}: TableProps) {
  if (!table) {
    return (
      <p className="text-amber-200/35 text-sm font-light italic">Loading table…</p>
    );
  }

  const groups = table.layout.groups ?? [];

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
          + New group
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-amber-200/35 text-sm font-light italic py-8 text-center">
          No groups yet. Create one to begin arranging.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Group
              key={g.id}
              group={g}
              onDrop={onDropOnGroup}
              onRename={onRenameGroup}
              onRemoveCard={onRemoveCard}
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
