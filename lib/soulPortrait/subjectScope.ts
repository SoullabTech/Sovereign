/**
 * Soul Portrait — subject-linkage scope gate (a Stage-1-adjacent refusal).
 *
 * A portrait's subject may be linked to a `studio_people` record (`subject_person_id`).
 * studio_people is Co-Lab-scoped: "a member list belongs to a Co-Lab, not the whole
 * platform." So a practitioner may only link a subject that lives in THEIR OWN active
 * Co-Lab. Without this gate, a raw id in the generate request could link — and later
 * name-leak, via the Studio index's LEFT JOIN — a person from another practitioner's
 * Co-Lab.
 *
 * This is the write-time half of Constitutional Completion for subject linkage: the
 * capability (link a subject) ships with its refusal (only your own Co-Lab's people).
 *
 *   Verifier: __tests__/soul-portrait-subject-colab-scope.test.ts
 */

import { queryOne } from '@/lib/db/postgres';

/**
 * True iff `subjectPersonId` is a studio_people record inside `teamId` (the caller's
 * active Co-Lab). Fails closed: a null/empty team, or a person outside it, → false.
 */
export async function subjectIsInColab(
  subjectPersonId: string,
  teamId: string | null,
): Promise<boolean> {
  if (!teamId) return false;
  const row = await queryOne<{ one: number }>(
    `SELECT 1 AS one FROM studio_people WHERE id = $1 AND team_id = $2`,
    [subjectPersonId, teamId],
  );
  return row != null;
}
