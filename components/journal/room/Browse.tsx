'use client';

/**
 * Journal Room — Browse.
 *
 * BROWSE CONTINUITY (founder ruling, 2026-08-11). Cutover replaces a `/journal`
 * that already gave members Search · Captures · Scribe · Changes · Decisions.
 * Acceptance of the room does not authorize deleting those capabilities, so they
 * are preserved HERE — one level deeper than the front door.
 *
 *   arrival / writing / return   ← classification never returns to this level
 *            ↓
 *          Browse                ← writing is the default view
 *            ↓
 *   Writing · Captures · Scribe · Changes · Decisions
 *            ↓
 *   Search across what is reachable here
 *
 * ⛔ NOT category tabs. The room earned its writing-first architecture; the other
 * materials sit quietly beneath the member's writing, one gesture away, and never
 * appear on arrival.
 *
 * PROVENANCE IS LOAD-BEARING. "Unified stream" was a presentation behaviour of the
 * old view, not an ontology. These are five different kinds of thing and the room
 * must not imply otherwise:
 *   · the member's WRITING renders in their own hand — serif, primary ink, no label
 *   · everything else is labelled by kind and set in the quieter register
 * A Capture is not authored Journal writing, and system- or MAIA-generated material
 * never receives the same visual authorship as the member's own words.
 *
 * No new storage model. No change to any source. Each list reads its existing API.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { type JournalEntry } from './EntryReader';
import { type, color, space, focus, hit, hitBlock, quiet, quietGroup, srOnly } from './tokens';

/** The five materials, kept distinct on purpose. */
type MaterialId = 'writing' | 'captures' | 'scribe' | 'changes' | 'decisions';

/** One row, normalised for display only — the sources are never merged. */
interface Item {
  id: string;
  material: MaterialId;
  /** What the member sees. Their own words for writing; a title otherwise. */
  line: string;
  at: string;
  /** Shown for everything except the member's own writing. */
  kind: string | null;
}

const MATERIALS: { id: MaterialId; label: string; kind: string | null }[] = [
  { id: 'writing', label: 'Writing', kind: null },
  { id: 'captures', label: 'Captures', kind: 'Capture' },
  { id: 'scribe', label: 'Scribe', kind: 'Scribe session' },
  { id: 'changes', label: 'Changes', kind: 'Change' },
  { id: 'decisions', label: 'Decisions', kind: 'Decision' },
];

const firstLine = (s: string, max = 90) => {
  const line = (s ?? '').replace(/\s+/g, ' ').trim();
  return line.length > max ? `${line.slice(0, max).trimEnd()}…` : line;
};

const livedDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
};

/**
 * Each material reads its own existing endpoint and keeps its own shape.
 * Failures are per-material and silent: one unreachable source must not take the
 * member's writing down with it.
 */
async function fetchMaterial(id: MaterialId): Promise<Item[]> {
  const get = async (path: string) => {
    const res = await apiFetch(path);
    return res.json().catch(() => null);
  };
  try {
    switch (id) {
      case 'writing': {
        const j = await get('/api/journal/quick/list?limit=100');
        return (j?.entries ?? []).map((e: JournalEntry) => ({
          id: e.id, material: 'writing' as const, line: firstLine(e.content),
          at: e.created_at, kind: null,
        }));
      }
      case 'captures': {
        const j = await get('/api/capsules?archived=false');
        return (j?.capsules ?? [])
          // ⚠️ FOUND during Slice 2 build (2026-08-11): /api/journal/quick/list
          // fire-and-forget bridges EVERY kept journal entry into a capsule
          // (sourceType: 'journal', title `Journal: <first line>` —
          // app/api/journal/quick/list/route.ts bridgeToCapsule). Verified
          // against a real member: 6/6 capsules traced to sourceType 'journal'.
          // Without this filter, "Captures" would show the member's own
          // writing back to them a second time under a different provenance
          // label — exactly what the founder ruling forbids: "do not pretend
          // a Capture is authored Journal writing." This filter is the
          // ontology boundary, not the API call.
          .filter((c: { sourceType?: string }) => c.sourceType !== 'journal')
          .map((c: { id: string; title?: string; summary?: string; createdAt?: string; created_at?: string }) => ({
            id: c.id, material: 'captures' as const,
            line: firstLine(c.title || c.summary || 'Untitled capture'),
            at: c.createdAt ?? c.created_at ?? '', kind: 'Capture',
          }));
      }
      case 'scribe': {
        const j = await get('/api/scribe/sessions');
        return (j?.sessions ?? []).map((s: { id: string; title?: string; started_at?: string; startedAt?: string }) => ({
          id: s.id, material: 'scribe' as const,
          line: firstLine(s.title || 'Untitled session'),
          at: s.started_at ?? s.startedAt ?? '', kind: 'Scribe session',
        }));
      }
      case 'changes': {
        const j = await get('/api/changes');
        return (j?.changes ?? []).map((c: { id: string; title?: string; createdAt?: string; created_at?: string }) => ({
          id: c.id, material: 'changes' as const, line: firstLine(c.title || 'Untitled'),
          at: c.createdAt ?? c.created_at ?? '', kind: 'Change',
        }));
      }
      case 'decisions': {
        const j = await get('/api/studio/decisions');
        return (j?.decisions ?? []).map((d: { id: string; title?: string; createdAt?: string; created_at?: string }) => ({
          id: d.id, material: 'decisions' as const, line: firstLine(d.title || 'Untitled'),
          at: d.createdAt ?? d.created_at ?? '', kind: 'Decision',
        }));
      }
    }
  } catch {
    return [];
  }
}

export function Browse({
  entries,
  onOpen,
  onLeave,
}: {
  entries: JournalEntry[];
  onOpen: (id: string) => void;
  onLeave: () => void;
}) {
  const [material, setMaterial] = useState<MaterialId>('writing');
  const [loaded, setLoaded] = useState<Partial<Record<MaterialId, Item[]>>>({
    // The member's writing is already in hand — Browse never refetches it.
    writing: entries.map((e) => ({
      id: e.id, material: 'writing', line: firstLine(e.content), at: e.created_at, kind: null,
    })),
  });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const searching = query.trim().length > 0;
  const requested = useRef(new Set<MaterialId>(['writing']));

  /** Load on demand only — arriving at Browse costs one request, not five. */
  const need = useCallback(async (ids: MaterialId[]) => {
    const missing = ids.filter((i) => !requested.current.has(i));
    if (missing.length === 0) return;
    missing.forEach((i) => requested.current.add(i));
    setLoading(true);
    const results = await Promise.all(missing.map((i) => fetchMaterial(i).then((r) => [i, r] as const)));
    setLoaded((prev) => ({ ...prev, ...Object.fromEntries(results) }));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (material !== 'writing') void need([material]);
  }, [material, need]);

  // Search spans everything reachable from here, so it must have everything.
  useEffect(() => {
    if (searching) void need(MATERIALS.map((m) => m.id));
  }, [searching, need]);

  const all = MATERIALS.flatMap((m) => loaded[m.id] ?? []);
  const q = query.trim().toLowerCase();
  const rows = (searching ? all.filter((i) => i.line.toLowerCase().includes(q)) : (loaded[material] ?? []))
    .slice()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const current = MATERIALS.find((m) => m.id === material)!;

  return (
    <main
      className={`min-h-[100dvh] ${color.field} ${space.room} flex flex-col`}
      aria-labelledby="journal-browse-heading"
    >
      <h1 id="journal-browse-heading" className={srOnly}>Browse the journal</h1>

      <div className={`${space.axis} pt-8 sm:pt-10`}>
        <button
          type="button"
          onClick={onLeave}
          className={`${type.marker} ${color.muted} ${focus} ${hit} ${quiet}`}
        >
          Journal
        </button>
      </div>

      <div className={`flex-1 ${space.axis} pt-10 sm:pt-14 pb-20`}>
        {/* Search lives inside Browse and nowhere else. A line, not a control. */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search what is here"
          className={`w-full bg-transparent border-0 border-b ${color.hairline} pb-2 outline-none
            ${type.meta} ${color.human} placeholder:opacity-50 focus:border-[var(--jr-ember)]
            transition-colors motion-reduce:transition-none`}
        />

        {searching && (
          <p className={`mt-4 ${type.meta} ${color.muted}`} aria-live="polite">
            {loading ? 'Looking…' : `${rows.length} ${rows.length === 1 ? 'thing' : 'things'} here`}
          </p>
        )}

        <ul className="mt-10 space-y-8">
          {rows.length === 0 && !loading && (
            <li className={`${type.meta} ${color.muted}`}>
              {searching ? 'Nothing here matches that.' : `Nothing in ${current.label.toLowerCase()} yet.`}
            </li>
          )}

          {rows.map((item) => (
            <li key={`${item.material}:${item.id}`}>
              <button
                type="button"
                // Only the member's own writing opens into the reading room. The
                // other materials are reachable, not absorbed — this room does not
                // present someone else's object as if it were the member's entry.
                onClick={item.material === 'writing' ? () => onOpen(item.id) : undefined}
                disabled={item.material !== 'writing'}
                className={`block text-left w-full ${focus} ${hitBlock} group
                  ${item.material === 'writing' ? '' : 'cursor-default'}`}
              >
                {/* Provenance first, and only for what the member did not author. */}
                {item.kind && (
                  <span className={`block ${type.maiaLabel} ${color.muted}`}>{item.kind}</span>
                )}
                <span
                  className={
                    item.material === 'writing'
                      ? `${type.writing} ${color.human} ${quietGroup}`
                      : `${type.meta} ${color.secondary}`
                  }
                >
                  {item.line}
                </span>
                <span className={`block mt-1 ${type.meta} ${color.muted}`}>{livedDate(item.at)}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* The other materials, one gesture away, beneath the member's own writing —
            never across the top, and never on arrival. */}
        {!searching && (
          <nav className={`mt-16 pt-8 border-t ${color.hairline}`} aria-label="Also here">
            <p className={`${type.meta} ${color.muted}`}>Also here</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {MATERIALS.filter((m) => m.id !== material).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMaterial(m.id)}
                  className={`${type.meta} ${color.secondary} ${focus} ${hit} ${quiet}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}
