/**
 * G2-3C: member-owned Personal Field authoring, isolated and never activated
 * before independent G2-3A schema/migration and R20 deletion gates.
 *
 * Membership originates only in the session; the member cannot select an owner,
 * practitioner, team or client. This module grants NO professional privileges.
 */
import { query } from '@/lib/db/postgres';

export const VALID_SECTIONS = new Set(['alive', 'asking', 'emerging', 'tending']);
export const VALID_FIELDS = new Set(['important', 'attention', 'emerging']);
export const VALID_KINDS = new Set(['note', 'change', 'decision']);
export const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8a-f][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export const READ_LIMIT = 25;

export const MEMBER_NATIVE_SCHEMA_READY_SQL = `
WITH target_table AS (
  SELECT to_regclass('public.field_notes') AS notes,
         to_regclass('public.field_attention') AS attention
)
SELECT (
  notes IS NOT NULL AND attention IS NOT NULL
  AND (SELECT count(*) FROM pg_attribute a
       WHERE a.attrelid IN (notes, attention)
         AND a.attname = 'personal_member_id' AND NOT a.attisdropped) = 2
  AND (SELECT count(*) FROM pg_attribute a
       WHERE a.attrelid IN (notes, attention)
         AND a.attname = 'practitioner_id' AND NOT a.attisdropped
         AND NOT a.attnotnull) = 2
  AND (SELECT count(*) FROM pg_constraint k
       WHERE k.conrelid IN (notes, attention)
         AND k.conname IN ('field_notes_personal_member_fk',
                          'field_attention_personal_member_fk')
         AND k.contype = 'f') = 2
  AND (SELECT count(*) FROM pg_constraint k
       WHERE k.conrelid IN (notes, attention)
         AND k.conname IN ('field_notes_exactly_one_owner_ck',
                          'field_attention_exactly_one_owner_ck')
         AND k.contype = 'c') = 2
) AS ready
FROM target_table`;

export async function memberNativeSchemaReady(): Promise<boolean> {
  const result = await query<{ready:boolean}>(MEMBER_NATIVE_SCHEMA_READY_SQL);
  // Missing/invalid capability is never interpreted as a successful empty read.
  return result.rows.length === 1 && result.rows[0]?.ready === true;
}

export const MEMBER_NOTES_READ_SQL = `
SELECT id, section, body, created_at
  FROM field_notes
 WHERE personal_member_id = $1::uuid
   AND practitioner_id IS NULL AND team_id IS NULL
 ORDER BY created_at DESC, id DESC LIMIT $2`;

export const MEMBER_NOTES_CREATE_SQL = `
INSERT INTO field_notes
  (personal_member_id, practitioner_id, team_id, section, body)
SELECT m.id, NULL, NULL, $2::text, $3::text FROM members m
 WHERE m.id = $1::uuid
RETURNING id, section, body, created_at`;

export const MEMBER_NOTES_UPDATE_SQL = `
UPDATE field_notes
   SET section = COALESCE($3::text, section),
       body = COALESCE($4::text, body)
 WHERE personal_member_id = $1::uuid
   AND id = $2::uuid
   AND practitioner_id IS NULL AND team_id IS NULL
RETURNING id, section, body, created_at`;

// Member-authored Attention references are only to member-owned, personal
// Decisions or Changes; never clinical/client, practitioner or team sources.
export const OWNED_MEMBER_DECISION = `(
  d.decision_scope = 'personal'
  AND d.personal_member_id = $1::uuid
  AND d.practitioner_id IS NULL
  AND d.client_id IS NULL AND d.team_id IS NULL
)`;

export const OWNED_MEMBER_CHANGE = `(
  c.member_id = $1::uuid
  AND c.practitioner_id IS NULL
  AND c.client_id IS NULL AND c.team_id IS NULL
)`;

export const MEMBER_ATTENTION_READ_SQL = `
SELECT a.id, a.field, a.kind, a.position, a.created_at,
       CASE WHEN a.kind = 'note' THEN a.label
            WHEN a.kind = 'decision' THEN d.title
            WHEN a.kind = 'change' THEN c.title
       END AS resolved,
       (a.kind <> 'note' AND d.id IS NULL AND c.id IS NULL) AS gone,
       CASE WHEN a.kind = 'note' OR (d.id IS NULL AND c.id IS NULL)
            THEN NULL ELSE a.ref_id END AS safe_ref_id
  FROM field_attention a
  LEFT JOIN studio_decisions d
    ON a.kind = 'decision' AND d.id = a.ref_id AND ${OWNED_MEMBER_DECISION}
  LEFT JOIN studio_changes c
    ON a.kind = 'change' AND c.id = a.ref_id AND ${OWNED_MEMBER_CHANGE}
 WHERE a.personal_member_id = $1::uuid
   AND a.practitioner_id IS NULL AND a.team_id IS NULL
 ORDER BY a.position ASC, a.created_at DESC, a.id DESC
 LIMIT $2`;

export const MEMBER_ATTENTION_POSITION_SQL = `
SELECT COALESCE(MIN(position), 0) - 1 AS pos
  FROM field_attention
 WHERE personal_member_id = $1::uuid
   AND practitioner_id IS NULL AND team_id IS NULL
   AND field = $2::text`;

export const MEMBER_ATTENTION_CREATE_SQL = `
INSERT INTO field_attention
  (personal_member_id, practitioner_id, team_id,
   field, kind, ref_id, label, position)
SELECT m.id, NULL, NULL,
       $2::text, $3::text, $4::uuid,
       CASE
         WHEN $3::text = 'note' THEN $5::text
         WHEN $3::text = 'decision' THEN
           (SELECT d.title FROM studio_decisions d
             WHERE d.id = $4::uuid AND ${OWNED_MEMBER_DECISION})
         WHEN $3::text = 'change' THEN
           (SELECT c.title FROM studio_changes c
             WHERE c.id = $4::uuid AND ${OWNED_MEMBER_CHANGE})
       END,
       $6::integer
  FROM members m
 WHERE m.id = $1::uuid
   AND (
      ($3::text = 'note' AND $4::uuid IS NULL)
      OR ($3::text = 'decision' AND EXISTS (
        SELECT 1 FROM studio_decisions d
         WHERE d.id = $4::uuid AND ${OWNED_MEMBER_DECISION}
      ))
      OR ($3::text = 'change' AND EXISTS (
        SELECT 1 FROM studio_changes c
         WHERE c.id = $4::uuid AND ${OWNED_MEMBER_CHANGE}
      ))
   )
RETURNING id, field, kind, ref_id, label, position, created_at`;

export const MEMBER_ATTENTION_MOVE_SQL = `
UPDATE field_attention
   SET field = COALESCE($3::text, field),
       position = COALESCE($4::integer, position)
 WHERE personal_member_id = $1::uuid
   AND id = $2::uuid
   AND practitioner_id IS NULL AND team_id IS NULL
RETURNING id, field, position`;

/**
 * Destructive deletion is deliberately NOT provided until the R20 signed
 * deletion-outbox, checkpoint and zero-resurrection gate has human acceptance.
 * Do not add DELETE endpoints that merely run DELETE FROM ...
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function fieldsMatch(
  value: Record<string,unknown>,
  allowed: readonly string[],
): boolean {
  return Object.keys(value).every(k=>allowed.includes(k));
}
