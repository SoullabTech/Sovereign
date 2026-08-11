'use client';

/**
 * Journal Room — Slice 1.
 *
 * The five approved reference states and the transitions between them.
 *
 *   arrival ──"Begin writing"──▶ writing ──"Keep this"──▶ reading
 *      │                                                     │
 *      ├──"Or note something"──▶ note ──"Keep this"───────────┤
 *      │                                            "Reflect with MAIA"
 *      ├──"Browse"──▶ browsing ──▶ reading                    ▼
 *      │                                                  reflection
 *      └──Return piece──▶ reading            "Write from here" ⟳ / "Let it go" ⟳
 *
 * IMPLEMENTATION LINEAGE: NEW. Built from the approved experiential reference;
 * no prior code lineage was recoverable. This is not a reconstruction.
 *
 * @see docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
 * @see docs/design/references/JOURNAL_SLICE1_IMPLEMENTATION_CONTRACT.md
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Arrival } from './Arrival';
import { WritingSurface, type EntryType } from './WritingSurface';
import { EntryReader, type JournalEntry } from './EntryReader';
import { Reflection } from './Reflection';
import { Browse } from './Browse';
import { type ReturnPiece, type ReturnableRow } from './Return';
import { pickReturn } from '@/lib/journal/return';
import { roomVars } from './tokens';

type RoomState =
  | { name: 'arrival' }
  | { name: 'writing'; variant: 'writing' | 'note'; fromQuestion?: string }
  | { name: 'reading'; entry: JournalEntry; reflecting: boolean }
  | { name: 'browsing' };

export function JournalRoom() {
  const [state, setState] = useState<RoomState>({ name: 'arrival' });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [returnPiece, setReturnPiece] = useState<ReturnPiece | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/journal/quick/list?limit=100');
      const json = await res.json().catch(() => null);
      const rows: JournalEntry[] = json?.success && Array.isArray(json.entries) ? json.entries : [];
      setEntries(rows);
      // Selection lives in lib/journal/return.ts and nowhere else (founder
      // ruling, 2026-08-10). The rows are widened with `createdAt` because that
      // is the field the selector reads; nothing else about them is touched.
      const selectable: ReturnableRow[] = rows.map((r) => ({ ...r, createdAt: r.created_at }));
      setReturnPiece(pickReturn(selectable));
    } catch {
      // A journal that cannot reach the server still opens; it simply has
      // nothing older to show. Writing remains possible.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const keep = useCallback(
    async (content: string, entryType: EntryType) => {
      const res = await apiFetch('/api/journal/quick/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryType, content, source: 'journal_room' }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success || !json.entryId) throw new Error('keep failed');

      // Read the kept entry straight back so the reading state shows exactly
      // what was stored, rather than a local echo of it.
      const entry: JournalEntry = {
        id: json.entryId,
        content,
        created_at: json.createdAt ?? new Date().toISOString(),
      };
      setState({ name: 'reading', entry, reflecting: false });
      void load();
    },
    [load],
  );

  const openEntry = useCallback(
    (entryId: string) => {
      const entry = entries.find((e) => e.id === entryId);
      if (entry) setState({ name: 'reading', entry, reflecting: false });
    },
    [entries],
  );

  // The room's material is applied once, here, and inherited by every state.
  // Scoped to this element — no House token is touched (founder ruling 2026-08-11).
  const inRoom = (surface: React.ReactNode) => <div style={roomVars}>{surface}</div>;

  switch (state.name) {
    case 'writing':
      return inRoom(
        <WritingSurface
          variant={state.variant}
          fromQuestion={state.fromQuestion}
          onKeep={keep}
          onLeave={() => setState({ name: 'arrival' })}
        />,
      );

    case 'reading':
      return inRoom(
        <EntryReader
          entry={state.entry}
          reflecting={state.reflecting}
          onReflect={() => setState({ ...state, reflecting: true })}
          onLeave={() => setState({ name: 'arrival' })}
        >
          {state.reflecting && (
            <Reflection
              entryId={state.entry.id}
              onWriteFromHere={(question) =>
                setState({ name: 'writing', variant: 'writing', fromQuestion: question })
              }
              // Transient: dropping the component drops the reflection. Nothing persists.
              onLetItGo={() => setState({ ...state, reflecting: false })}
            />
          )}
        </EntryReader>,
      );

    case 'browsing':
      return inRoom(
        <Browse
          entries={entries}
          onOpen={openEntry}
          onLeave={() => setState({ name: 'arrival' })}
        />,
      );

    default:
      return inRoom(
        <Arrival
          ready={ready}
          returnPiece={returnPiece}
          onBeginWriting={() => setState({ name: 'writing', variant: 'writing' })}
          onNoteSomething={() => setState({ name: 'writing', variant: 'note' })}
          onBrowse={() => setState({ name: 'browsing' })}
          onOpenReturn={openEntry}
        />,
      );
  }
}
