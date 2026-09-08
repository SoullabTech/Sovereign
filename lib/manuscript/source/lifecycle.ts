/**
 * PT-3 — the governed Source lifecycle seam.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 (§II, §IV, §V, §VI).
 *
 * Every function here is a thin, honest wrapper over one database seam function. The authority is
 * the database's, not this module's: `maia_app` holds no INSERT on `manuscript_sections`, no
 * UPDATE or DELETE on either protected tier, and no INSERT on `source_lifecycle_acts`. If this
 * file were deleted, the boundary would still hold — which is the point. A seam whose refusal
 * lives only in TypeScript is a convention.
 *
 * WHAT EACH ACT IS (§V), kept distinct because a later reader must be able to tell them apart:
 *
 *   extract     the first representation of an arrival
 *   reExtract   a NEW representation from the SAME Historical Source; the previous one is left
 *               byte-identical and merely ceases to be operative
 *   replace     a NEW Historical Source lineage becomes operative; the former stays historical
 *   withdraw    ceases to be operative WITHOUT being destroyed
 *   erase       explicitly commissioned destruction
 *
 * None of these is a generic "inactive". §V forbids collapsing them, because a system that cannot
 * distinguish withdrawal from erasure cannot tell a member what happened to their own work.
 *
 * CURRENCY IS DERIVED, NEVER STORED (§IV). `operativeRepresentation` and `operativeArrival` read
 * the append-only act history. Before this, "which arrival is operative" was decided by
 * `verifyCustody`'s `ORDER BY created_at ASC` — an implementation contingency standing in for a
 * law.
 */
import { query, type TransactionClient } from '@/lib/db/postgres';

/** A section of a Source Representation, as the seam accepts it. */
export interface RepresentationSection {
  heading: string | null;
  body: string;
  heading_depth: number | null;
  heading_signal: string | null;
}

type Client = Pick<TransactionClient, 'query'> | null;

async function run<T extends Record<string, unknown>>(
  client: Client, sql: string, params: unknown[],
): Promise<T[]> {
  const res = client ? await client.query<T>(sql, params) : await query<T>(sql, params);
  return res.rows as T[];
}

/**
 * EXTRACTION — create the first Source Representation of an arrival.
 *
 * Atomic by construction (§II): the seam establishes custody FIRST and refuses the whole act if
 * the claim yields no row, so a representation cannot come into being in an uncustodied or
 * ambiguous default state. This replaces the import route's earlier ordering, where sections were
 * written before a claim that was allowed to fail.
 */
export async function extractRepresentation(
  manuscriptId: string, memberId: string, arrivalId: string,
  sections: readonly RepresentationSection[], client: Client = null,
): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `SELECT source_extract($1,$2,$3,$4::jsonb) AS id`,
    [manuscriptId, memberId, arrivalId, JSON.stringify(sections)]);
  return rows[0].id;
}

/** RE-EXTRACTION — a new representation from the same Historical Source (§V). */
export async function reExtractRepresentation(
  manuscriptId: string, memberId: string, arrivalId: string,
  sections: readonly RepresentationSection[], reason: string | null = null, client: Client = null,
): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `SELECT source_re_extract($1,$2,$3,$4::jsonb,$5) AS id`,
    [manuscriptId, memberId, arrivalId, JSON.stringify(sections), reason]);
  return rows[0].id;
}

/** REPLACEMENT — a new Historical Source lineage becomes operative (§V). */
export async function replaceSourceLineage(
  manuscriptId: string, memberId: string, newArrivalId: string,
  sections: readonly RepresentationSection[], reason: string | null = null, client: Client = null,
): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `SELECT source_replace_lineage($1,$2,$3,$4::jsonb,$5) AS id`,
    [manuscriptId, memberId, newArrivalId, JSON.stringify(sections), reason]);
  return rows[0].id;
}

/** WITHDRAWAL — ceases to be operative without being destroyed (§V). */
export async function withdrawRepresentation(
  manuscriptId: string, memberId: string, representationId: string,
  reason: string | null = null, client: Client = null,
): Promise<void> {
  await run(client, `SELECT source_withdraw_representation($1,$2,$3,$4)`,
    [manuscriptId, memberId, representationId, reason]);
}

/**
 * ERASURE — commission destruction, explicitly and by name (§II).
 *
 * Records the erasure acts and opens a **transaction-local** window the refusal trigger honours.
 * The window closes with the transaction, so nothing later inherits erasure authority, and a
 * cascade with no act named is still refused. Call this inside the same transaction as the delete
 * it authorizes; calling it on the pool authorizes nothing.
 */
export async function commissionErasure(
  manuscriptId: string, memberId: string, reason: string | null = null, client: Client = null,
): Promise<void> {
  await run(client, `SELECT source_commission_erasure($1,$2,$3)`, [manuscriptId, memberId, reason]);
}

/** Which representation is operative now — derived from the act history, never stored (§IV). */
export async function operativeRepresentation(
  manuscriptId: string, client: Client = null,
): Promise<string | null> {
  const rows = await run<{ id: string | null }>(client,
    `SELECT source_operative_representation($1) AS id`, [manuscriptId]);
  return rows[0]?.id ?? null;
}

/** Which Historical Source lineage is operative now — derived, never stored (§IV). */
export async function operativeArrival(
  manuscriptId: string, client: Client = null,
): Promise<string | null> {
  const rows = await run<{ id: string | null }>(client,
    `SELECT source_operative_arrival($1) AS id`, [manuscriptId]);
  return rows[0]?.id ?? null;
}

export interface LifecycleAct {
  id: string;
  act: 'arrival' | 'extraction' | 're_extraction' | 'replacement' | 'withdrawal' | 'erasure';
  arrival_id: string | null;
  representation_id: string | null;
  operative: boolean;
  occurred_at: Date;
  actor_member_id: string;
  reason: string | null;
}

/**
 * The Work's Source history, oldest first.
 *
 * This is what makes the §XI return-gate question answerable — which lineage was operative, when
 * it changed, why, what remains historical, what was withdrawn, what was erased — without reading
 * any protected content.
 */
export async function sourceHistory(
  manuscriptId: string, client: Client = null,
): Promise<LifecycleAct[]> {
  return run<LifecycleAct & Record<string, unknown>>(client,
    `SELECT id, act, arrival_id, representation_id, operative, occurred_at, actor_member_id, reason
       FROM source_lifecycle_acts WHERE manuscript_id = $1
      ORDER BY occurred_at ASC, id ASC`, [manuscriptId]) as Promise<LifecycleAct[]>;
}
