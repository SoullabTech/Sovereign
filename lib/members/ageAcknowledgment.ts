/**
 * MEMBER-ACK-01 / TEEN-CLOSED-01 (founder ruling 2026-10-01): every registration
 * that creates a member must carry the person's own "I'm 18 or older"
 * confirmation, recorded in `member_acknowledgments`.
 *
 * Self-attestation is weak, and it is the standard: the record is the person's
 * own statement, not an inference about them.
 *
 * How a registration proves the confirmation:
 *   - a JSON body flag `ageConfirmed: true` (email signup, legacy register,
 *     native Google / Apple), or
 *   - the short-lived `maia_age_ack` cookie, set by the signup page when the box
 *     is ticked, for the web OAuth redirect flows (the callback is a fresh
 *     request with no body from us).
 *
 * The acknowledgment row is written in the SAME SQL statement as the member row
 * (`withAgeAcknowledgment`), so a member can never exist without it.
 */

export const AGE_ACK_KIND = 'age_18_plus';
/** Bump when the confirmation wording changes: the row records which words were agreed to. */
export const AGE_ACK_COPY_VERSION = '2026-10-01';
export const AGE_ACK_LABEL = "I'm 18 or older";
export const AGE_ACK_COOKIE = 'maia_age_ack';
export const AGE_ACK_REQUIRED_MESSAGE = "Please confirm you're 18 or older to create an account.";

/** True when this request carries the person's 18+ confirmation. */
export function hasAgeConfirmation(body: unknown, cookieValue: string | undefined | null): boolean {
  const flag = body && typeof body === 'object' ? (body as { ageConfirmed?: unknown }).ageConfirmed : undefined;
  return flag === true || cookieValue === AGE_ACK_COPY_VERSION;
}

/**
 * Wrap a member INSERT … RETURNING (which must return `id`) so the age
 * acknowledgment is written in the same statement. Returns the SQL and the
 * params to append. The result rows are the member rows, unchanged.
 */
export function withAgeAcknowledgment(
  insertMemberSql: string,
  params: unknown[],
  source: string,
): { sql: string; params: unknown[] } {
  const n = params.length;
  return {
    sql: `WITH m AS (${insertMemberSql}),
a AS (
  INSERT INTO member_acknowledgments (member_id, kind, copy_version, source)
  SELECT id, $${n + 1}, $${n + 2}, $${n + 3} FROM m
  ON CONFLICT (member_id, kind, copy_version) DO NOTHING
)
SELECT * FROM m`,
    params: [...params, AGE_ACK_KIND, AGE_ACK_COPY_VERSION, source],
  };
}
