/**
 * GANESHA–PRO G2-2 — bounded, read-only continuity over independently verified
 * member ownership and one (optional) exact Personal Studio compatibility ID.
 *
 * This DOES NOT migrate records, create professional standing, make decisions
 * about the member's meaning, or authorize any practitioner, client, or team.
 * The Personal Field is not a practitioner CRM.
 */
import { query } from '@/lib/db/postgres';
import type { IndividualContext } from '@/lib/auth/individualContext';

const PAGE_SIZE = 25;

type TitleRow = {
  id: string;
  title: string;
  status: string;
  created_at: string | Date;
};
type ProcessRow = TitleRow & { type: string };
type NoteRow = { id: string; section: string; body: string; created_at: string | Date };
type AttentionRow = {
  id: string;
  field: 'important' | 'attention' | 'emerging';
  kind: 'note' | 'change' | 'decision';
  label: string;
  created_at: string | Date;
};

export const PERSONAL_DECISIONS_SQL = `
  SELECT d.id, d.title, d.status, d.created_at
    FROM studio_decisions d
   WHERE d.decision_scope = 'personal'
     AND d.personal_member_id = $1
     AND d.practitioner_id IS NULL
     AND d.client_id IS NULL
     AND d.team_id IS NULL
   ORDER BY d.created_at DESC, d.id DESC
   LIMIT $2
`;

// The member's own process items may have an old Personal Studio adapter.
// A professional UUID is never a fallback for personal visibility.
export const PERSONAL_PROCESS_SQL = `
  SELECT pi.id, pi.title, pi.type, pi.status, pi.created_at
    FROM process_items pi
   WHERE pi.member_id = $1
     AND (
       pi.practitioner_id IS NULL OR (
         pi.practitioner_id = $2::uuid
         AND EXISTS (
           SELECT 1 FROM practitioners personal_adapter
            WHERE personal_adapter.id = $2::uuid
              AND personal_adapter.member_id = $1
              AND personal_adapter.portal_type = 'personal'
              AND personal_adapter.status = 'active'
         )
       )
     )
   ORDER BY pi.created_at DESC, pi.id DESC
   LIMIT $3
`;

// Explicit member ownership OR a NULL-member legacy row linked to the ONE
// authenticated, active personal compatibility record. Both require no
// client or team. A conflicting non-NULL member ID is never overridden.
export const PERSONAL_CHANGES_SCOPE = `
  c.client_id IS NULL AND c.team_id IS NULL
  AND (
    (c.member_id = $1 AND c.practitioner_id IS NULL)
    OR (
      c.practitioner_id = $2::uuid
      AND (c.member_id = $1 OR c.member_id IS NULL)
      AND EXISTS (
        SELECT 1 FROM practitioners personal_adapter
         WHERE personal_adapter.id = $2::uuid
           AND personal_adapter.member_id = $1
           AND personal_adapter.portal_type = 'personal'
           AND personal_adapter.status = 'active'
      )
    )
  )
`;

export const PERSONAL_CHANGES_SQL = `
  SELECT c.id, c.title, c.status, c.created_at
    FROM studio_changes c
   WHERE ${PERSONAL_CHANGES_SCOPE}
   ORDER BY c.created_at DESC, c.id DESC
   LIMIT $3
`;

// Historical notes have no member FK yet. Only an exact active
// portal_type=personal row selected from the signed-in member is admissible.
export const PERSONAL_LEGACY_NOTES_SQL = `
  SELECT n.id, n.section, n.body, n.created_at
    FROM field_notes n
    JOIN practitioners personal_adapter
      ON personal_adapter.id = n.practitioner_id
     AND personal_adapter.id = $2::uuid
     AND personal_adapter.member_id = $1
     AND personal_adapter.portal_type = 'personal'
     AND personal_adapter.status = 'active'
   WHERE n.team_id IS NULL
   ORDER BY n.created_at DESC, n.id DESC
   LIMIT $3
`;

// Cached attention labels can point at a professional Decision or Change.
// Recheck the referenced object's personal owner in SQL rather than
// trusting kind + ref_id + the label cached on a legacy note.
export const PERSONAL_LEGACY_ATTENTION_SQL = `
  SELECT a.id, a.field, a.kind,
         CASE
           WHEN a.kind = 'note' THEN a.label
           WHEN a.kind = 'decision' THEN d.title
           WHEN a.kind = 'change' THEN c.title
         END AS label,
         a.created_at
    FROM field_attention a
    JOIN practitioners personal_adapter
      ON personal_adapter.id = a.practitioner_id
     AND personal_adapter.id = $2::uuid
     AND personal_adapter.member_id = $1
     AND personal_adapter.portal_type = 'personal'
     AND personal_adapter.status = 'active'
    LEFT JOIN studio_decisions d
      ON a.kind = 'decision' AND d.id = a.ref_id
     AND d.decision_scope = 'personal'
     AND d.personal_member_id = $1
     AND d.practitioner_id IS NULL
     AND d.client_id IS NULL
     AND d.team_id IS NULL
    LEFT JOIN studio_changes c
      ON a.kind = 'change' AND c.id = a.ref_id
     AND ${PERSONAL_CHANGES_SCOPE}
   WHERE a.team_id IS NULL
     AND (
       (a.kind = 'note' AND a.ref_id IS NULL)
       OR (a.kind = 'decision' AND d.id IS NOT NULL)
       OR (a.kind = 'change' AND c.id IS NOT NULL)
     )
   ORDER BY a.created_at DESC, a.id DESC
   LIMIT $3
`;

const toTitle = (r: TitleRow) => ({
  id: r.id, title: r.title, status: r.status, createdAt: r.created_at,
});
const toProcess = (r: ProcessRow) => ({
  ...toTitle(r), type: r.type,
});
const toNote = (r: NoteRow) => ({
  id: r.id, section: r.section, body: r.body, createdAt: r.created_at,
});
const toAttention = (r: AttentionRow) => ({
  id: r.id, field: r.field, kind: r.kind, label: r.label, createdAt: r.created_at,
});

export async function readPersonalFieldContinuity(context: IndividualContext) {
  // Never derive authority from a caller-selected practitioner ID. G2-1
  // withholds it for zero/suspended/ambiguous personal histories.
  const memberId = context.memberId;
  const personalRef = context.legacyPersonalStatus === 'active'
    ? context.legacyPersonalPractitionerId
    : null;

  const decisions = await query<TitleRow>(PERSONAL_DECISIONS_SQL, [
    memberId, PAGE_SIZE,
  ]);
  const process = await query<ProcessRow>(PERSONAL_PROCESS_SQL, [
    memberId, personalRef, PAGE_SIZE,
  ]);
  const changes = await query<TitleRow>(PERSONAL_CHANGES_SQL, [
    memberId, personalRef, PAGE_SIZE,
  ]);

  // Never query practitioner-keyed historical material with NULL, an
  // arbitrary active Professional row, or an ambiguous/suspended reference.
  const notes = personalRef
    ? await query<NoteRow>(PERSONAL_LEGACY_NOTES_SQL,
      [memberId, personalRef, PAGE_SIZE])
    : { rows: [] as NoteRow[] };
  const attention = personalRef
    ? await query<AttentionRow>(PERSONAL_LEGACY_ATTENTION_SQL,
      [memberId, personalRef, PAGE_SIZE])
    : { rows: [] as AttentionRow[] };

  return {
    owner: 'member' as const,
    access: 'bounded_read_only' as const,
    coverage: 'personal_records_with_verified_provenance_only' as const,
    legacyPersonal: {
      status: context.legacyPersonalStatus,
      referenced: Boolean(personalRef),
    },
    // Up to PAGE_SIZE per section; absence does not prove no historical
    // material. Legacy personal rows and unknown provenance remain intact.
    limitPerSection: PAGE_SIZE,
    records: {
      decisions: decisions.rows.map(toTitle),
      processItems: process.rows.map(toProcess),
      changes: changes.rows.map(toTitle),
      notes: notes.rows.map(toNote),
      attention: attention.rows.map(toAttention),
    },
  };
}
