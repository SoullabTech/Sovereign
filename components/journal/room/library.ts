/**
 * Journal Room — Browse continuity (Slice 2).
 *
 * WHY THIS EXISTS
 *
 * Walked at 79fd8e911, the room's Browse showed journal entries and nothing
 * else. The Journal it would replace at `/journal` also carries search,
 * Captures, Scribe sessions, Changes and Decisions. Cutting over as-is would
 * have shipped a better-feeling Journal by silently deleting half of the
 * existing one's usefulness — so this is a deployment blocker cleared, not a
 * feature added.
 *
 * THE CONSTRAINT THAT SHAPES IT
 *
 * None of this may return to the front door. Arrival stays "What would you like to Journal?"
 * with Begin writing and Or note something. Everything here lives behind the quiet
 * secondary Browse doorway, in the room's own register — chronological lines of
 * the member's material, not a card wall with a filter bar.
 *
 * EXACT SEARCH ONLY
 *
 * `searchLibrary` is literal substring matching, and deliberately nothing else.
 * The member asked for a word; they get the entries containing that word. No
 * embedding, no ranking, no "did you mean" — a semantic guess dressed as a
 * search result is the same category error as a relevance-scored Return.
 *
 * ONE ENTRY, SHOWN ONCE
 *
 * Keeping a journal entry also writes a bridge capsule (`sourceId` = the entry
 * id) so the oracle context layer holds the raw record. That is a plumbing
 * artifact of the same writing, not a second thing the member made — and
 * measured on the walk it made every entry appear TWICE in Browse, once as
 * itself and once as "Journal: …". A journal that shows your words doubled is
 * not preserving your material, it is misrepresenting it. Captures whose
 * `sourceId` is a journal entry the member already has are therefore dropped.
 *
 * NAVIGATION HONESTY
 *
 * A row only offers to open somewhere a member can actually go. Captures have
 * no member-reachable detail route today — their reader lives under /labtools,
 * behind requireFounder — so a capture shows its material inline and offers no
 * doorway, rather than walking a member into a founder refusal. That was the
 * exact 2026-07-28 defect and it is not being reintroduced here.
 */

import { apiFetch } from '@/lib/http/apiBase';

export type LibraryKind = 'journal' | 'capture' | 'session' | 'change' | 'decision';

export interface LibraryItem {
  id: string;
  kind: LibraryKind;
  /** The line shown — the member's own words wherever they exist. */
  line: string;
  /** A second line of their material, when the source carries one. */
  detail?: string;
  /** ISO timestamp; the list is chronological across every kind. */
  at: string;
  /**
   * Where opening this goes, when a member-reachable destination exists.
   * `undefined` means the row is readable but not a doorway.
   */
  href?: string;
}

/** Labels are nouns for the member's material, never system type names. */
export const KIND_LABEL: Record<LibraryKind, string> = {
  journal: 'Journal',
  capture: 'Captures',
  session: 'Sessions',
  change: 'Changes',
  decision: 'Decisions',
};

const firstLine = (s: string, max = 90) => {
  const line = (s || '').replace(/\s+/g, ' ').trim();
  return line.length > max ? `${line.slice(0, max).trimEnd()}…` : line;
};

/** One source failing must never take the others down with it. */
async function fetchJson(path: string): Promise<any | null> {
  try {
    const res = await apiFetch(path);
    if (!res.ok) return null; // 403 for a member without that surface is normal
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Everything the member's Journal holds beyond today's writing.
 *
 * Journal entries are passed in rather than refetched — the room already has
 * them, and Browse must show exactly what the room shows.
 */
export async function loadLibrary(
  journalEntries: { id: string; content: string; created_at: string }[],
): Promise<{ items: LibraryItem[]; kinds: LibraryKind[] }> {
  const [capsules, sessions, changes, decisions] = await Promise.all([
    fetchJson('/api/capsules?archived=false'),
    fetchJson('/api/scribe/sessions'),
    fetchJson('/api/changes'),
    fetchJson('/api/studio/decisions'),
  ]);

  const items: LibraryItem[] = journalEntries.map((e) => ({
    id: e.id,
    kind: 'journal',
    line: firstLine(e.content),
    at: e.created_at,
  }));

  // A kind is offered only when its source actually answered — a member with no
  // practitioner link should not be shown an empty "Decisions" that implies
  // something is missing.
  const kinds: LibraryKind[] = ['journal'];

  if (capsules) {
    kinds.push('capture');
    // Every entry is already in `items` as itself; its bridge capsule is the
    // same writing wearing another row.
    const journalIds = new Set(journalEntries.map((e) => e.id));
    for (const c of capsules.capsules || []) {
      const bridged = c.sourceId || c.source_id;
      if (bridged && journalIds.has(bridged)) continue;
      items.push({
        id: c.id,
        kind: 'capture',
        line: c.title || 'Untitled capture',
        detail: c.summary || undefined,
        at: c.createdAt || c.created_at,
      });
    }
  }

  if (sessions) {
    kinds.push('session');
    for (const s of sessions.sessions || []) {
      items.push({
        id: s.id,
        kind: 'session',
        line: s.title || 'Untitled session',
        detail: s.summary?.short || undefined,
        at: s.started_at || s.startedAt,
        href: `/sessions/${s.id}`,
      });
    }
  }

  if (changes) {
    kinds.push('change');
    for (const c of changes.changes || []) {
      items.push({
        id: c.id,
        kind: 'change',
        line: c.title,
        detail: c.description || undefined,
        at: c.createdAt || c.created_at,
        href: '/changes',
      });
    }
  }

  if (decisions) {
    kinds.push('decision');
    for (const d of decisions.decisions || []) {
      items.push({
        id: d.id,
        kind: 'decision',
        line: d.title,
        detail: d.context || undefined,
        at: d.createdAt || d.created_at,
        href: '/studio/decisions',
      });
    }
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  // Offer only the kinds that actually have material after de-duplication —
  // an empty "Captures" implies something is missing when nothing is.
  const present = new Set(items.map((i) => i.kind));
  return { items, kinds: kinds.filter((k) => present.has(k)) };
}

/**
 * Exact search. Case-insensitive substring over the member's own words.
 *
 * Not fuzzy, not semantic, not ranked. An empty query returns everything, so
 * the caller never has to special-case "not searching yet".
 */
export function searchLibrary(items: LibraryItem[], query: string): LibraryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (i) =>
      i.line.toLowerCase().includes(q) || (i.detail ? i.detail.toLowerCase().includes(q) : false),
  );
}

/** Narrow to one kind. `null` means every kind. */
export function filterKind(items: LibraryItem[], kind: LibraryKind | null): LibraryItem[] {
  return kind ? items.filter((i) => i.kind === kind) : items;
}
