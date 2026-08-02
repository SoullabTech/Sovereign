/**
 * Workbench source adapter for Keeps.
 *
 * Reads `member_memory_atoms` — but NOT all of them. "Atom" and "Keep" are not
 * the same claim: the atom is the canonical continuity anchor, while a Keep is
 * an atom whose origin is a member-authored keep gesture. Some atoms have other
 * origins (`inference`, `synthesis`, `derivation`, `practitioner-observation`
 * are all valid `generated_by` values), so the Shelf must discriminate.
 *
 * `generated_by = 'member-gesture'` is that discriminator. keepSource()
 * (lib/psyche/portfolio.ts) hardcodes `'normal', 'member-gesture'` on INSERT
 * and is the only writer that stamps it; a CHECK constraint bounds the value
 * set and s5_require_atom_attestation() refuses unattributed mints.
 *
 * Consequence, recorded so it is not mistaken for a bug: every atom in
 * production today is `unattributed-historical` (backfilled before provenance
 * stamping existed), so this filter surfaces NOTHING until a member performs a
 * real Keep. That is correct. An unprovable Keep is not shown as one.
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
 *   - filter by return_preference (a private atom is private FROM MAIA; it is
 *     still the member's own to see and place)
 *   - write return_preference, status, last_touched_at, surface_count, or any
 *     other atom column. This adapter is read-only. Placement lives entirely
 *     in workbench_tables.layout.
 *   - surface another member's atoms, or team/client/encounter-scoped ones.
 */

import { query } from '@/lib/db/postgres';
import type {
  WorkbenchSource,
  WorkbenchCardRef,
  WorkbenchSourceQuery,
  ResolvedCard,
} from './types';

interface AtomRow {
  id: string;
  title: string;
  body: string | null;
  source_type: string;
  status: string;
  kept_at: Date;
  is_breakthrough: boolean | null;
}

/**
 * Guards applied identically in search() and resolve().
 *
 *   member_id          — the member's own atoms only
 *   status             — active / still_alive, per the slice
 *   memory_scope       — 'personal' only. Excludes team / client / encounter
 *                        scoped atoms, which belong to Co-Lab boundaries and
 *                        are not this member's private material to arrange.
 *   practitioner guard — mirrors PRACTITIONER_ATTRIBUTION_GUARD in the atoms
 *                        loader: an unattributed 'practitioner_observation'
 *                        atom must not surface. keepSource() rejects writing
 *                        these at all; the 12 that exist in production are
 *                        historical rows that predate that rejection.
 *
 *   sanctuary          — atoms DO carry a sanctuary marker:
 *                        `posture_at_creation ∈ {normal, sanctuary,
 *                        unknown-historical}`. Today the
 *                        s5_require_atom_attestation() trigger refuses to mint
 *                        anything but 'normal', so no sanctuary atom can be
 *                        created — but historical rows and any future writable
 *                        lane could carry it, so this is filtered here rather
 *                        than assumed away.
 */
const ATOM_GUARDS = `
  member_id = $1
  AND generated_by = 'member-gesture'
  AND status IN ('active', 'still_alive')
  AND memory_scope = 'personal'
  AND posture_at_creation IS DISTINCT FROM 'sanctuary'
  AND NOT (source_type = 'practitioner_observation' AND facilitator_id IS NULL)
`;

export const keepSource: WorkbenchSource = {
  kind: 'keep',

  async search(q: WorkbenchSourceQuery): Promise<WorkbenchCardRef[]> {
    const clauses: string[] = [ATOM_GUARDS];
    const params: unknown[] = [q.arrangerId];

    if (q.text && q.text.trim()) {
      params.push(`%${q.text.trim()}%`);
      clauses.push(`(title ILIKE $${params.length} OR body ILIKE $${params.length})`);
    }
    if (q.from) {
      params.push(q.from);
      clauses.push(`kept_at >= $${params.length}`);
    }
    if (q.to) {
      params.push(q.to);
      clauses.push(`kept_at <= $${params.length}`);
    }

    const result = await query<AtomRow>(
      `SELECT id, title, body, source_type, status, kept_at, is_breakthrough
       FROM member_memory_atoms
       WHERE ${clauses.join(' AND ')}
       ORDER BY kept_at DESC
       LIMIT 200`,
      params,
    );

    return result.rows.map((row) => ({
      source: 'keep' as const,
      ref: row.id,
      title: row.title,
      preview: (row.body ?? '').slice(0, 140),
      createdAt: row.kept_at.toISOString(),
    }));
  },

  async resolve(ref: string, arrangerId: string): Promise<ResolvedCard | null> {
    const result = await query<AtomRow>(
      `SELECT id, title, body, source_type, status, kept_at, is_breakthrough
       FROM member_memory_atoms
       WHERE ${ATOM_GUARDS} AND id = $2`,
      [arrangerId, ref],
    );
    const row = result.rows[0];
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
