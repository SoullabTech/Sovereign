'use client';

/**
 * Group — a named pile of cards on the Table.
 *
 * Every member act on a card is reachable two ways:
 *   - by dragging (desktop)
 *   - by an explicit control (everywhere, including touch)
 *
 * The second path is not a fallback. HTML5 drag-and-drop does not fire on iOS
 * Safari at all, so on a phone the controls ARE the interface. A verb that only
 * exists as a drag is a verb a member on a phone does not have.
 *
 * Dropping ONTO a card inserts before that card; dropping on the pile's empty
 * space appends. Holding Alt while dropping duplicates instead of moving.
 */

import { useState } from 'react';
import { Card } from './Card';
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

/** What a drop carries. `cardId`/`fromGroupId` present ⇒ it came off the table. */
export interface DragPayload {
  source: string;
  ref: string;
  cardId?: string;
  fromGroupId?: string;
}

function readPayload(e: React.DragEvent): DragPayload | null {
  try {
    const p = JSON.parse(e.dataTransfer.getData('application/json'));
    if (p && typeof p.source === 'string' && typeof p.ref === 'string') return p as DragPayload;
  } catch {
    // Ignore malformed payloads.
  }
  return null;
}

interface GroupProps {
  group: ResolvedGroup;
  /** Every pile on the table, for the Move/Copy pickers. */
  allGroups: { id: string; name: string }[];
  onGather: (groupId: string, pointer: { source: string; ref: string }, toIndex?: number) => void;
  onMove: (cardId: string, fromGroupId: string, toGroupId: string, toIndex?: number) => void;
  onDuplicate: (cardId: string, fromGroupId: string, toGroupId: string) => void;
  onReorder: (groupId: string, cardId: string, toIndex: number) => void;
  onReturnToShelf: (groupId: string, cardId: string) => void;
  onRename: (groupId: string, newName: string) => void;
  onDelete: (groupId: string) => void;
  onGraduate: (groupId: string) => void;
  /** False on the member surface — graduation is not in the first member slice. */
  canGraduate?: boolean;
}

export function Group({
  group,
  allGroups,
  onGather,
  onMove,
  onDuplicate,
  onReorder,
  onReturnToShelf,
  onRename,
  onDelete,
  onGraduate,
  canGraduate = true,
}: GroupProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(group.name);
  const [isDragOver, setIsDragOver] = useState(false);

  /** One drop handler for both acts — the payload shape decides which. */
  const applyDrop = (payload: DragPayload, toIndex: number | undefined, alt: boolean) => {
    if (payload.cardId && payload.fromGroupId) {
      if (alt) {
        onDuplicate(payload.cardId, payload.fromGroupId, group.id);
      } else {
        onMove(payload.cardId, payload.fromGroupId, group.id, toIndex);
      }
      return;
    }
    onGather(group.id, { source: payload.source, ref: payload.ref }, toIndex);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const payload = readPayload(e);
    if (payload) applyDrop(payload, undefined, e.altKey);
  };

  const handleDropOnCard = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const payload = readPayload(e);
    if (!payload) return;
    // Reordering inside this pile is a move whose source and target are the same.
    if (payload.cardId && payload.fromGroupId === group.id && !e.altKey) {
      onReorder(group.id, payload.cardId, index);
      return;
    }
    applyDrop(payload, index, e.altKey);
  };

  const commitRename = () => {
    setRenaming(false);
    if (draftName.trim() && draftName.trim() !== group.name) {
      onRename(group.id, draftName.trim());
    } else {
      setDraftName(group.name);
    }
  };

  const otherGroups = allGroups.filter((g) => g.id !== group.id);

  /**
   * Tap targets are 44px, the documented minimum for a reliable finger press.
   * Measured during the walk at 375px: without this the ↑/↓ arrows render at
   * 10×16px — present, visible, and effectively untappable. A control a member
   * cannot reliably hit is the same as a control they do not have, which is the
   * exact failure the explicit-control path exists to prevent.
   *
   * The visual weight stays low because the targets are transparent; only the
   * hit area grows.
   */
  const TAP = 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center';
  const controlClass =
    `${TAP} text-amber-200/40 hover:text-amber-200/90 disabled:text-amber-200/15 ` +
    'disabled:cursor-not-allowed text-xs font-light transition-colors';
  const pickerClass =
    'bg-transparent text-amber-200/40 hover:text-amber-200/90 text-xs font-light ' +
    'border-none outline-none cursor-pointer transition-colors min-h-[44px]';

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
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
            className={`${controlClass} tracking-wide shrink-0`}
            title="Graduate this group to a Book Studio draft"
          >
            Graduate →
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(group.id)}
          className="text-amber-200/25 hover:text-amber-200/60 text-xs px-1 transition-colors shrink-0"
          aria-label="Delete pile"
          title="Delete pile"
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
          {group.cards.map((card, index) => (
            <div
              key={card.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => handleDropOnCard(e, index)}
            >
              <Card
                card={{
                  source: card.source,
                  ref: card.ref,
                  title: cardTitle(card),
                  preview: card.resolved
                    ? card.resolved.content.slice(0, 140)
                    : '(unresolved or sanctuary)',
                }}
                draggable
                dragPayload={{
                  source: card.source,
                  ref: card.ref,
                  cardId: card.id,
                  fromGroupId: group.id,
                }}
                controls={
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onReorder(group.id, card.id, index - 1)}
                      disabled={index === 0}
                      className={controlClass}
                      aria-label="Move up in pile"
                      title="Move up in pile"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorder(group.id, card.id, index + 1)}
                      disabled={index === group.cards.length - 1}
                      className={controlClass}
                      aria-label="Move down in pile"
                      title="Move down in pile"
                    >
                      ↓
                    </button>

                    {otherGroups.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) onMove(card.id, group.id, e.target.value);
                        }}
                        className={pickerClass}
                        aria-label="Move to another pile"
                        title="Move to another pile"
                      >
                        <option value="">Move to…</option>
                        {otherGroups.map((g) => (
                          <option key={g.id} value={g.id} className="bg-neutral-900">
                            {g.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) onDuplicate(card.id, group.id, e.target.value);
                      }}
                      className={pickerClass}
                      aria-label="Also place in a pile"
                      title="Place this same card in another pile as well"
                    >
                      <option value="">Also place in…</option>
                      {allGroups.map((g) => (
                        <option key={g.id} value={g.id} className="bg-neutral-900">
                          {g.name}
                          {g.id === group.id ? ' (this pile)' : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onReturnToShelf(group.id, card.id)}
                      className={`${controlClass} ml-auto`}
                      title="Take this card off the table. The capture stays on the Shelf."
                    >
                      Return to Shelf
                    </button>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
