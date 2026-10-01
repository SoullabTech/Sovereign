/**
 * MEMBER-ADULT-ACK-01: reading and recording a member's own acknowledgments.
 *
 * Rows are append-only (database triggers refuse UPDATE, direct DELETE and
 * TRUNCATE). Recording the same (member, kind, version) twice is idempotent:
 * the original row and its timestamp are kept.
 */
import { query, type TransactionClient } from '@/lib/db/postgres';
import { ADULT_ACK_KIND, ADULT_ACK_VERSION } from './adultConfirmation';

export type AcknowledgmentKind = 'adult_18_plus' | 'maia_not_monitored';
export type AcknowledgmentSource = 'registration' | 'sign_in_prompt';

/** The acknowledgments a member must hold today, with their current versions.
 *  `maia_not_monitored` is reserved and joins this list once its copy is ratified. */
export const REQUIRED_ACKNOWLEDGMENTS: ReadonlyArray<{ kind: AcknowledgmentKind; version: number }> = [
  { kind: ADULT_ACK_KIND, version: ADULT_ACK_VERSION },
];

const INSERT_SQL = `
  INSERT INTO member_acknowledgments (member_id, kind, version, source)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (member_id, kind, version) DO NOTHING`;

export async function recordAcknowledgment(
  memberId: string,
  kind: AcknowledgmentKind,
  version: number,
  source: AcknowledgmentSource,
  client?: TransactionClient,
): Promise<void> {
  const params = [memberId, kind, version, source];
  if (client) await client.query(INSERT_SQL, params);
  else await query(INSERT_SQL, params);
}

/** Required acknowledgments this member has NOT yet given (at the current version). */
export async function missingAcknowledgments(
  memberId: string,
): Promise<Array<{ kind: AcknowledgmentKind; version: number }>> {
  const result = await query<{ kind: AcknowledgmentKind; version: number }>(
    `SELECT kind, version FROM member_acknowledgments WHERE member_id = $1`,
    [memberId],
  );
  const held = new Set(result.rows.map((r) => `${r.kind}@${r.version}`));
  return REQUIRED_ACKNOWLEDGMENTS.filter((r) => !held.has(`${r.kind}@${r.version}`));
}
