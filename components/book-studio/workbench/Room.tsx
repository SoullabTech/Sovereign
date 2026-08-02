'use client';

/**
 * Workbench Room — the two-pane arrangement surface.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ Header + UploadDropzone                                  │
 *   ├──────────────────────────┬───────────────────────────────┤
 *   │ Shelf                    │ Table                         │
 *   │ - search                 │ - piles (named)               │
 *   │ - card list (draggable)  │   - placements (drop here)    │
 *   │ - drop here to return    │ - graduate pile → draft       │
 *   └──────────────────────────┴───────────────────────────────┘
 *
 * Native HTML5 drag-and-drop (no library dep), plus an explicit control for
 * every verb so the whole surface remains operable without dragging.
 *
 * This component does no layout arithmetic. Every member act is a pure
 * transform in `lib/workbench/arrange`, and this file only decides what to do
 * with the result: save it, or show why it could not be applied. That split is
 * what makes the verbs testable without a browser.
 *
 * No MAIA voice present in this room. Retrieval and arrangement only — nothing
 * here interprets, groups, names, or summarizes on the member's behalf.
 */

import { useCallback, useEffect, useState } from 'react';
import { Shelf } from './Shelf';
import { Table } from './Table';
import { UploadDropzone } from './UploadDropzone';
import {
  gather,
  movePlacement,
  reorderPlacement,
  duplicatePlacement,
  returnToShelf,
  stripLayout,
  newPlacementId,
  describeFailure,
  type ArrangeResult,
} from '@/lib/workbench/arrange';
import type {
  WorkbenchCardRef,
  CardPointer,
  TableLayout,
  TableGroup,
} from '@/lib/workbench/sources/types';

interface RoomProps {
  tableId: string;
  /**
   * Founder-only affordances. Both default true so the founder Workbench
   * renders exactly as it did before the member surface existed.
   *
   * The member surface passes false for both. That is presentation only —
   * the server is the real boundary: uploads/* and drafts/from-group are
   * still requireFounder(), so a member cannot reach either even if the
   * control were somehow rendered.
   */
  canUpload?: boolean;
  canGraduate?: boolean;
  title?: string;
  subtitle?: string;
}

export interface ResolvedCard extends CardPointer {
  resolved: { content: string; meta: Record<string, unknown> } | null;
}

export interface ResolvedGroup extends Omit<TableGroup, 'cards'> {
  cards: ResolvedCard[];
}

export interface ResolvedTable {
  id: string;
  name: string;
  layout: { groups: ResolvedGroup[] };
}

export function WorkbenchRoom({
  tableId,
  canUpload = true,
  canGraduate = true,
  title = 'The Workbench',
  subtitle = 'Arrangement surface between captures and form.',
}: RoomProps) {
  const [shelfCards, setShelfCards] = useState<WorkbenchCardRef[]>([]);
  const [shelfQuery, setShelfQuery] = useState('');
  const [table, setTable] = useState<ResolvedTable | null>(null);
  const [status, setStatus] = useState<string>('');

  const loadShelf = useCallback(async () => {
    const params = new URLSearchParams();
    if (shelfQuery.trim()) params.set('text', shelfQuery.trim());
    const res = await fetch(`/api/book-studio/workbench/shelf?${params.toString()}`);
    if (!res.ok) {
      setStatus('Failed to load Shelf');
      return;
    }
    const data = await res.json();
    setShelfCards(data.cards ?? []);
  }, [shelfQuery]);

  const loadTable = useCallback(async () => {
    const res = await fetch(`/api/book-studio/workbench/tables/${tableId}`);
    if (!res.ok) {
      setStatus('Failed to load Table');
      return;
    }
    const data = await res.json();
    setTable(data.table);
  }, [tableId]);

  useEffect(() => {
    void loadShelf();
  }, [loadShelf]);

  useEffect(() => {
    void loadTable();
  }, [loadTable]);

  const saveLayout = useCallback(
    async (newLayout: TableLayout) => {
      const res = await fetch(`/api/book-studio/workbench/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: newLayout }),
      });
      if (!res.ok) {
        setStatus('Failed to save Table');
        return;
      }
      await loadTable();
    },
    [tableId, loadTable],
  );

  /** The current table as pointers only — the shape every verb operates on. */
  const currentLayout = useCallback((): TableLayout | null => {
    if (!table) return null;
    return stripLayout(table.layout.groups);
  }, [table]);

  /**
   * Apply one member act. The verb decides what the layout becomes; this only
   * persists it, or reports why it could not be applied. A failure is never
   * silent — a card that vanished under the member's hands should say so.
   */
  const applyArrange = useCallback(
    async (act: (layout: TableLayout) => ArrangeResult) => {
      const layout = currentLayout();
      if (!layout) return;
      const result = act(layout);
      if (!result.ok) {
        setStatus(describeFailure(result.reason));
        await loadTable();
        return;
      }
      setStatus('');
      await saveLayout(result.layout);
    },
    [currentLayout, saveLayout, loadTable],
  );

  const handleGather = useCallback(
    (groupId: string, pointer: Pick<CardPointer, 'source' | 'ref'>, toIndex?: number) =>
      applyArrange((l) =>
        gather(l, { groupId, pointer, placementId: newPlacementId(), toIndex }),
      ),
    [applyArrange],
  );

  const handleMove = useCallback(
    (cardId: string, fromGroupId: string, toGroupId: string, toIndex?: number) =>
      applyArrange((l) => movePlacement(l, { cardId, fromGroupId, toGroupId, toIndex })),
    [applyArrange],
  );

  const handleReorder = useCallback(
    (groupId: string, cardId: string, toIndex: number) =>
      applyArrange((l) => reorderPlacement(l, { groupId, cardId, toIndex })),
    [applyArrange],
  );

  const handleDuplicate = useCallback(
    (cardId: string, fromGroupId: string, toGroupId: string) =>
      applyArrange((l) =>
        duplicatePlacement(l, {
          cardId,
          fromGroupId,
          toGroupId,
          placementId: newPlacementId(),
        }),
      ),
    [applyArrange],
  );

  const handleReturnToShelf = useCallback(
    (groupId: string, cardId: string) =>
      applyArrange((l) => returnToShelf(l, { groupId, cardId })),
    [applyArrange],
  );

  const handleAddGroup = useCallback(async () => {
    const layout = currentLayout();
    if (!layout) return;
    const newGroup: TableGroup = {
      id: `g_${crypto.randomUUID()}`,
      name: 'New pile',
      cards: [],
    };
    await saveLayout({ groups: [...layout.groups, newGroup] });
  }, [currentLayout, saveLayout]);

  const handleRenameGroup = useCallback(
    async (groupId: string, newName: string) => {
      const layout = currentLayout();
      if (!layout) return;
      const trimmed = newName.trim();
      if (!trimmed) return;
      await saveLayout({
        groups: layout.groups.map((g) => (g.id === groupId ? { ...g, name: trimmed } : g)),
      });
    },
    [currentLayout, saveLayout],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      const layout = currentLayout();
      if (!layout) return;
      const group = layout.groups.find((g) => g.id === groupId);
      const count = group?.cards.length ?? 0;
      const warning =
        count === 0
          ? 'Delete this pile?'
          : `Delete this pile? Its ${count} ${count === 1 ? 'card comes' : 'cards come'} off the table. ` +
            'Nothing is deleted — they are pointers, and the captures stay on the Shelf.';
      if (!confirm(warning)) return;
      await saveLayout({ groups: layout.groups.filter((g) => g.id !== groupId) });
    },
    [currentLayout, saveLayout],
  );

  const handleGraduate = useCallback(
    async (groupId: string) => {
      const res = await fetch('/api/book-studio/drafts/from-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, groupId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(`Graduate failed: ${err.error ?? 'unknown'}`);
        return;
      }
      const data = await res.json();
      setStatus(`Graduated → ${data.studioUrl}`);
    },
    [tableId],
  );

  const handleUploadDone = useCallback(() => {
    void loadShelf();
  }, [loadShelf]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-amber-100/90 text-3xl md:text-4xl font-light tracking-wide leading-tight mb-2">
          {title}
        </h1>
        <p className="text-amber-200/55 text-base font-light italic">
          {subtitle}
        </p>
      </header>

      {canUpload && <UploadDropzone onUploaded={handleUploadDone} setStatus={setStatus} />}

      {status && (
        <div className="mt-4 mb-2 text-amber-200/50 text-sm font-light italic">{status}</div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Shelf
            cards={shelfCards}
            query={shelfQuery}
            onQueryChange={setShelfQuery}
            onReturnToShelf={handleReturnToShelf}
            groups={(table?.layout.groups ?? []).map((g) => ({ id: g.id, name: g.name }))}
            onGather={handleGather}
          />
        </div>
        <div className="lg:col-span-3">
          <Table
            table={table}
            onAddGroup={handleAddGroup}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
            onGather={handleGather}
            onMove={handleMove}
            onDuplicate={handleDuplicate}
            onReorder={handleReorder}
            onReturnToShelf={handleReturnToShelf}
            onGraduate={handleGraduate}
            canGraduate={canGraduate}
          />
        </div>
      </div>
    </div>
  );
}
