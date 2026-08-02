'use client';

/**
 * Group — a named cluster of cards on the Table.
 *
 * Drop target for cards dragged from the Shelf. Has an editable name
 * (click to rename) and a graduate button that triggers the from-group
 * pipe → Book Studio draft.
 */

import { useState } from 'react';
import { Card } from './Card';
import type { CardPointer } from '@/lib/workbench/sources/types';
import type { ResolvedCard, ResolvedGroup } from './Room';

/**
 * Each adapter names its display field for what the object actually is:
 * `title` for a Keep atom, `originalName` for an uploaded file. Fall through
 * both rather than forcing one adapter's vocabulary onto the other.
 */
function cardTitle(card: ResolvedCard): string {
  const meta = card.resolved?.meta;
  if (meta) {
    if (typeof meta.title === 'string' && meta.title.trim()) return meta.title;
    if (typeof meta.originalName === 'string' && meta.originalName.trim()) {
      return meta.originalName;
    }
  }
  return `${card.source}:${card.ref.slice(0, 8)}…`;
}

interface GroupProps {
  group: ResolvedGroup;
  onDrop: (groupId: string, pointer: CardPointer) => void;
  onRename: (groupId: string, newName: string) => void;
  onRemoveCard: (groupId: string, cardId: string) => void;
  onDelete: (groupId: string) => void;
  onGraduate: (groupId: string) => void;
  /** False on the member surface — graduation is not in the first member slice. */
  canGraduate?: boolean;
}

export function Group({
  group,
  onDrop,
  onRename,
  onRemoveCard,
  onDelete,
  onGraduate,
  canGraduate = true,
}: GroupProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(group.name);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const payload = JSON.parse(e.dataTransfer.getData('application/json'));
      if (payload && typeof payload.source === 'string' && typeof payload.ref === 'string') {
        onDrop(group.id, payload as CardPointer);
      }
    } catch {
      // Ignore malformed payloads
    }
  };

  const commitRename = () => {
    setRenaming(false);
    if (draftName.trim() && draftName.trim() !== group.name) {
      onRename(group.id, draftName.trim());
    } else {
      setDraftName(group.name);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'rounded border p-4 transition-colors',
        isDragOver
          ? 'border-amber-200/40 bg-amber-200/[0.05]'
          : 'border-amber-200/15 bg-amber-200/[0.015]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-3 gap-3">
        {renaming ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setDraftName(group.name);
                setRenaming(false);
              }
            }}
            className="flex-1 bg-transparent border-b border-amber-200/30 outline-none text-amber-100/90 text-sm font-light"
          />
        ) : (
          <button
            type="button"
            onClick={() => setRenaming(true)}
            className="flex-1 text-left text-amber-100/85 text-sm font-light hover:text-amber-100 transition-colors"
            title="Click to rename"
          >
            {group.name}
          </button>
        )}
        <span className="text-amber-200/35 text-xs font-light italic shrink-0">
          {group.cards.length}
        </span>
        {canGraduate && (
          <button
            type="button"
            onClick={() => onGraduate(group.id)}
            disabled={group.cards.length === 0}
            className="text-amber-200/50 hover:text-amber-200/90 disabled:text-amber-200/15 disabled:cursor-not-allowed text-xs font-light tracking-wide transition-colors shrink-0"
            title="Graduate this group to a Book Studio draft"
          >
            Graduate →
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(group.id)}
          className="text-amber-200/25 hover:text-amber-200/60 text-xs px-1 transition-colors shrink-0"
          aria-label="Delete group"
          title="Delete group"
        >
          ×
        </button>
      </div>

      {group.cards.length === 0 ? (
        <p className="text-amber-200/30 text-xs font-light italic py-3 text-center">
          Drop cards here
        </p>
      ) : (
        <div className="space-y-1">
          {group.cards.map((card) => (
            <Card
              key={card.id}
              card={{
                source: card.source,
                ref: card.ref,
                title: cardTitle(card),
                preview: card.resolved
                  ? card.resolved.content.slice(0, 140)
                  : '(unresolved or sanctuary)',
              }}
              onRemove={() => onRemoveCard(group.id, card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
