/**
 * Workbench source adapter for Keeps.
 *
 * The constitutional selection law now lives in
 * `lib/psyche/personalKeepsRead.ts`. This adapter owns only Workbench
 * presentation: mapping a qualifying Personal Keep into a card and resolving
 * that card back into Workbench's generic `ResolvedCard` shape.
 *
 * "Atom" and "Keep" remain different claims. The canonical selector admits
 * only Personal Field / Portfolio Keeps with member-authored Keep provenance;
 * this adapter must never recreate or weaken that predicate locally.
 *
 * ── Why the atom is the ref ──────────────────────────────────────────────
 * ARCHITECTURE §5 defines `ref` as the "source-native id". The 2026-05-26
 * Keep/Capture ruling defines the atom as the canonical continuity anchor and
 * the source row as detail. For Keep — and only for Keep — these coincide:
 * the atom IS the object the gesture created, so `member_memory_atoms.id` is
 * simultaneously source-native and atom-canonical. No reconciliation needed.
 *
 * Ideas / journals / decisions do NOT have this property (their atom and their
 * source row are different objects) and are deliberately not implemented here.
 *
 * ── What this adapter must never do ──────────────────────────────────────
 *   - add a second Personal Keep eligibility predicate
 *   - write return preference, status, surfacing metadata, or any atom column
 *   - surface another member's atoms, or team/client/encounter-scoped ones
 */

import {
  searchPersonalKeeps,
  resolvePersonalKeep,
} from '@/lib/psyche/personalKeepsRead';
import type {
  WorkbenchSource,
  WorkbenchCardRef,
  WorkbenchSourceQuery,
  ResolvedCard,
} from './types';

export const keepSource: WorkbenchSource = {
  kind: 'keep',

  async search(q: WorkbenchSourceQuery): Promise<WorkbenchCardRef[]> {
    const rows = await searchPersonalKeeps({
      memberId: q.arrangerId,
      text: q.text,
      from: q.from,
      to: q.to,
    });

    return rows.map((row) => ({
      source: 'keep' as const,
      ref: row.id,
      title: row.title,
      preview: (row.body ?? '').slice(0, 140),
      createdAt: row.kept_at.toISOString(),
    }));
  },

  async resolve(ref: string, arrangerId: string): Promise<ResolvedCard | null> {
    const row = await resolvePersonalKeep({ memberId: arrangerId, keepId: ref });
    if (!row) return null;

    return {
      content: row.body ?? '',
      meta: {
        // `title` is what the card renders. Named plainly rather than reusing
        // the uploaded adapter's `originalName`, which means something else.
        title: row.title,
        sourceType: row.source_type,
        status: row.status,
        isBreakthrough: row.is_breakthrough ?? false,
        keptAt: row.kept_at.toISOString(),
      },
    };
  },
};
