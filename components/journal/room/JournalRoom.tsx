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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Arrival } from './Arrival';
import { WritingSurface, type EntryType } from './WritingSurface';
import { EntryReader, type JournalEntry } from './EntryReader';
import { Reflection } from './Reflection';
import { type ReturnPiece, type ReturnableRow } from './Return';
import { pickReturn } from '@/lib/journal/return';
import {
  loadLibrary,
  searchLibrary,
  filterKind,
  KIND_LABEL,
  type LibraryItem,
  type LibraryKind,
} from './library';
import { type, color, space, focus, hit, quiet, quietGroup, hitBlock, srOnly, spine, roomMaterial } from './tokens';

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

  switch (state.name) {
    case 'writing':
      return (
        <WritingSurface
          variant={state.variant}
          fromQuestion={state.fromQuestion}
          onKeep={keep}
          onLeave={() => setState({ name: 'arrival' })}
        />
      );

    case 'reading':
      return (
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
        </EntryReader>
      );

    case 'browsing':
      return (
        <Browse
          entries={entries}
          onOpen={openEntry}
          onLeave={() => setState({ name: 'arrival' })}
        />
      );

    default:
      return (
        <Arrival
          ready={ready}
          returnPiece={returnPiece}
          onBeginWriting={() => setState({ name: 'writing', variant: 'writing' })}
          onNoteSomething={() => setState({ name: 'writing', variant: 'note' })}
          onBrowse={() => setState({ name: 'browsing' })}
          onOpenReturn={openEntry}
        />
      );
  }
}

/**
 * Browse — navigation necessity only (Work Unit §13).
 *
 * The reference names `Browse` as secondary on arrival but specifies no browse
 * surface, so this is kept to the minimum that makes kept writing reachable: the
 * member's own first lines, in time order. Deliberately NOT a listing product —
 * no search, no filters, no categories, no cards, no counts.
 */
function Browse({
  entries,
  onOpen,
  onLeave,
}: {
  entries: JournalEntry[];
  onOpen: (id: string) => void;
  onLeave: () => void;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [kinds, setKinds] = useState<LibraryKind[]>(['journal']);
  const [kind, setKind] = useState<LibraryKind | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Everything the Journal holds, gathered only once the member has chosen to
  // browse. Arrival never pays for this.
  useEffect(() => {
    let live = true;
    void loadLibrary(entries).then(({ items: got, kinds: available }) => {
      if (!live) return;
      setItems(got);
      setKinds(available);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [entries]);

  const shown = useMemo(
    () => searchLibrary(filterKind(items, kind), query),
    [items, kind, query],
  );

  return (
    <main
      className={`min-h-[100dvh] ${color.field} ${space.room} flex flex-col`}
      style={roomMaterial as React.CSSProperties}
      aria-labelledby="journal-browse-heading"
    >
      <h1 id="journal-browse-heading" className={srOnly}>Browse the journal</h1>

      <div className={`${spine} pt-8 sm:pt-10`}>
        <button
          type="button"
          onClick={onLeave}
          className={`${type.marker} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Journal
        </button>
      </div>

      <div className={`flex-1 ${spine} pt-10 sm:pt-14 pb-20`}>
        {/* Search is prominent HERE, where the member came looking — and only
            here. Exact matching on their own words; no semantic guessing. */}
        <label htmlFor="journal-find" className={srOnly}>
          Find in your journal
        </label>
        <input
          id="journal-find"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find in your journal"
          /* min-h: measured 42px, under the 44px target floor. */
          className={`w-full min-h-[44px] bg-transparent border-0 border-b pb-2 outline-none
            ${type.writing} ${color.human} ${color.hairline} placeholder:opacity-40 ${focus}`}
        />

        {/* The kinds the member's Journal actually holds. Quiet text, never a
            filter bar — and never on the arrival surface. */}
        {kinds.length > 1 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-5" role="group" aria-label="What to browse">
            <button
              type="button"
              onClick={() => setKind(null)}
              aria-pressed={kind === null}
              className={`${type.meta} ${focus} ${hit} ${quiet} ${
                kind === null ? color.accent : color.muted
              }`}
            >
              Everything
            </button>
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`${type.meta} ${focus} ${hit} ${quiet} ${
                  kind === k ? color.accent : color.muted
                }`}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {loading && items.length === 0 ? (
            <p className={`${type.meta} ${color.muted}`}>Gathering.</p>
          ) : shown.length === 0 ? (
            <p className={`${type.meta} ${color.muted}`}>
              {query ? 'Nothing here matches that.' : 'Nothing kept yet.'}
            </p>
          ) : (
            <ul className="space-y-8">
              {shown.map((it) => {
                const when = new Date(it.at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year:
                    new Date(it.at).getFullYear() === new Date().getFullYear()
                      ? undefined
                      : 'numeric',
                });
                const meta = it.kind === 'journal' ? when : `${when} · ${KIND_LABEL[it.kind]}`;

                const body = (
                  <>
                    <span className={`${type.writing} ${color.human} ${quietGroup}`}>{it.line}</span>
                    {it.detail && (
                      <span className={`block mt-1 ${type.meta} ${color.secondary}`}>
                        {it.detail.length > 120 ? `${it.detail.slice(0, 120).trimEnd()}…` : it.detail}
                      </span>
                    )}
                    <span className={`block mt-1 ${type.meta} ${color.muted}`}>{meta}</span>
                  </>
                );

                // A row is a doorway only where the member can actually arrive.
                if (it.kind === 'journal') {
                  return (
                    <li key={`${it.kind}-${it.id}`}>
                      <button
                        type="button"
                        onClick={() => onOpen(it.id)}
                        className={`block text-left ${focus} ${hitBlock} group w-full`}
                      >
                        {body}
                      </button>
                    </li>
                  );
                }
                if (it.href) {
                  return (
                    <li key={`${it.kind}-${it.id}`}>
                      <a href={it.href} className={`block text-left ${focus} ${hitBlock} group w-full`}>
                        {body}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={`${it.kind}-${it.id}`} className={hitBlock}>
                    {body}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
