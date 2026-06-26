/**
 * Release service — Recognition without retention (Recognition domain).
 *
 * Records the ACT of a member releasing an authored artifact. Stores ONLY the
 * artifact type + the member's optional note + a timestamp — NEVER the released
 * content, and no reference to the deleted artifact. See migration
 * 20260626000002_released_artifacts.sql; the non-reconstructability guarantee is
 * enforced by the schema (no content column; capped note), not by this code.
 *
 * Beta-gated by callers via the `labs.preview` entitlement; recognition is always
 * the member's explicit choice. Remembering an act is not retaining its object.
 */

import { query } from '@/lib/db/postgres';

/** Artifact types that may be released with recognition. Grows as surfaces adopt it. */
export type ReleasableArtifactType = 'journal_entry';

const MAX_NOTE_LEN = 500;

/**
 * Record that `memberId` chose to release an artifact of `artifactType`.
 * `note` is the member's OWN optional words (a reflection on letting go) — it is
 * trimmed and capped, and is explicitly not the released content. Records nothing
 * but the act; never the object.
 */
export async function recordRelease(
  memberId: string,
  artifactType: ReleasableArtifactType,
  note?: string | null,
): Promise<void> {
  const trimmed = note && note.trim() ? note.trim().slice(0, MAX_NOTE_LEN) : null;
  await query(
    `INSERT INTO released_artifacts (member_id, artifact_type, note)
     VALUES ($1, $2, $3)`,
    [memberId, artifactType, trimmed],
  );
}
