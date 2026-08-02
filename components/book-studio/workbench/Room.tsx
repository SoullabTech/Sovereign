'use client';

/**
 * Workbench Room — the two-pane arrangement surface.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ Header + UploadDropzone                                  │
 *   ├──────────────────────────┬───────────────────────────────┤
 *   │ Shelf                    │ Table                         │
 *   │ - search                 │ - groups (named)              │
 *   │ - card list (draggable)  │   - cards inside (drop here)  │
 *   │                          │ - graduate group → draft      │
 *   └──────────────────────────┴───────────────────────────────┘
 *
 * Native HTML5 drag-and-drop (no library dep). DataTransfer carries a
 * JSON-encoded { source, ref } pointer when a Shelf card is dragged.
 *
 * No MAIA voice present in this room. Retrieval and arrangement only.
 */

import { useCallback, useEffect, useState } from 'react';
import { Shelf } from './Shelf';
import { Table } from './Table';
import { UploadDropzone } from './UploadDropzone';
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

  const handleDropOnGroup = useCallback(
    async (groupId: string, pointer: CardPointer) => {
      if (!table) return;
      const newCardId = `c_${crypto.randomUUID()}`;
      const newGroups: TableGroup[] = table.layout.groups.map((g) => {
        if (g.id !== groupId) {
          return {
            id: g.id,
            name: g.name,
            cards: g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
          };
        }
        // Skip if pointer already exists in this group
        const exists = g.cards.some(
          (c) => c.source === pointer.source && c.ref === pointer.ref,
        );
        if (exists) {
          return {
            id: g.id,
            name: g.name,
            cards: g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
          };
        }
        return {
          id: g.id,
          name: g.name,
          cards: [
            ...g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
            { id: newCardId, source: pointer.source, ref: pointer.ref },
          ],
        };
      });
      await saveLayout({ groups: newGroups });
    },
    [table, saveLayout],
  );

  const handleAddGroup = useCallback(async () => {
    if (!table) return;
    const newGroup: TableGroup = {
      id: `g_${crypto.randomUUID()}`,
      name: 'New group',
      cards: [],
    };
    const newGroups: TableGroup[] = [
      ...table.layout.groups.map((g) => ({
        id: g.id,
        name: g.name,
        cards: g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
      })),
      newGroup,
    ];
    await saveLayout({ groups: newGroups });
  }, [table, saveLayout]);

  const handleRenameGroup = useCallback(
    async (groupId: string, newName: string) => {
      if (!table) return;
      const trimmed = newName.trim();
      if (!trimmed) return;
      const newGroups: TableGroup[] = table.layout.groups.map((g) => ({
        id: g.id,
        name: g.id === groupId ? trimmed : g.name,
        cards: g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
      }));
      await saveLayout({ groups: newGroups });
    },
    [table, saveLayout],
  );

  const handleRemoveCard = useCallback(
    async (groupId: string, cardId: string) => {
      if (!table) return;
      const newGroups: TableGroup[] = table.layout.groups.map((g) => ({
        id: g.id,
        name: g.name,
        cards:
          g.id === groupId
            ? g.cards.filter((c) => c.id !== cardId).map((c) => ({ id: c.id, source: c.source, ref: c.ref }))
            : g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
      }));
      await saveLayout({ groups: newGroups });
    },
    [table, saveLayout],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      if (!table) return;
      if (!confirm('Delete this group? Cards return to the Shelf (they are pointers, not copies).')) return;
      const newGroups: TableGroup[] = table.layout.groups
        .filter((g) => g.id !== groupId)
        .map((g) => ({
          id: g.id,
          name: g.name,
          cards: g.cards.map((c) => ({ id: c.id, source: c.source, ref: c.ref })),
        }));
      await saveLayout({ groups: newGroups });
    },
    [table, saveLayout],
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
          />
        </div>
        <div className="lg:col-span-3">
          <Table
            table={table}
            onAddGroup={handleAddGroup}
            onRenameGroup={handleRenameGroup}
            onRemoveCard={handleRemoveCard}
            onDeleteGroup={handleDeleteGroup}
            onDropOnGroup={handleDropOnGroup}
            onGraduate={handleGraduate}
            canGraduate={canGraduate}
          />
        </div>
      </div>
    </div>
  );
}
