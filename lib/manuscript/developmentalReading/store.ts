/**
 * BUILD-07C — DEVELOPMENTAL READING · persistence, minimal.
 *
 * WHAT THE STORE DOES. Mints the reading's identity (INV-1) and stamps
 * `frozenAt` (INV-25) at the write — never accepted from a caller, because a
 * caller-supplied id or timestamp is a claim, not a record. Writes the reading
 * and its observations in one transaction. Reads them back by identity, scoped
 * to the member who owns the manuscript.
 *
 * WHAT IT NEVER DOES. UPDATE or DELETE. A frozen reading is never corrected in
 * place (INV-4); a superseded reading is retained (INV-22). The database
 * enforces the first with a trigger (migration 20260904000001); this module
 * simply has no such statement, and the module-graph gate asserts that.
 *
 * NO PROSE. `read_state` and `coverage` are the 07A objects — ids, offsets,
 * digests, topology, frozen structure labels — and `assertNoProseKeys` refuses
 * a payload that grew a text-bearing key. The observation column holds MAIA's
 * claim text, which is hers, not the Work's.
 */

import { query, transaction } from '../../db/postgres';
import type { NonEmptyArray } from '../development/evidenceRef';
import type {
  DevelopmentalObservation, DevelopmentalReading, DevelopmentalReadingProvenance, ReadingToFreeze,
} from './contract';

const FORBIDDEN_KEYS = /^(text|content|body|bodies|prose|excerpt|excerpts|passage|prompt|messages?)$/i;

/** Refuse a state payload carrying the Work rather than a description of it. Recurses; keys only. */
export function assertNoProseKeys(payload: unknown, path = '$'): string | null {
  if (Array.isArray(payload)) {
    for (const [i, v] of payload.entries()) {
      const hit = assertNoProseKeys(v, `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (payload && typeof payload === 'object') {
    for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.test(k) && (typeof v === 'string' || (Array.isArray(v) && v.some((x) => typeof x === 'string')))) {
        return `${path}.${k}`;
      }
      const hit = assertNoProseKeys(v, `${path}.${k}`);
      if (hit) return hit;
    }
  }
  return null;
}

export type StoreRefusal = 'prose_in_state' | 'member_mismatch';

export type FreezeAndStoreResult =
  | { ok: true; id: string; frozenAt: string }
  | { ok: false; refusal: StoreRefusal; detail: string };

/**
 * Mint and write. The reading row and every observation row land in one
 * transaction, or none do. `member_id` is the member whose evidence was
 * captured — the caller's verified identity — and every read is scoped by it.
 */
export async function freezeAndStore(memberId: string, reading: ReadingToFreeze): Promise<FreezeAndStoreResult> {
  const prose = assertNoProseKeys({ readState: reading.readState, coverage: reading.coverage });
  if (prose) return { ok: false, refusal: 'prose_in_state', detail: `${prose} holds text; the read state must carry none` };

  return transaction(async (tx) => {
    const r = await tx.query(
      `INSERT INTO developmental_readings
         (manuscript_id, member_id, draft_id, revision_number, commissioned_lens, scope,
          read_state, coverage, input_fingerprint, outcome, provenance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, frozen_at`,
      [reading.manuscriptId, memberId, reading.readState.draftId, reading.readState.revisionNumber,
       reading.scope.commissionedLens, JSON.stringify(reading.scope),
       JSON.stringify(reading.readState), JSON.stringify(reading.coverage),
       reading.readState.inputFingerprint, reading.outcome,
       JSON.stringify(reading.provenance)]);
    const id = r.rows[0].id as string;
    const frozenAt = (r.rows[0].frozen_at as Date).toISOString();

    for (const [i, o] of reading.observations.entries()) {
      await tx.query(
        `INSERT INTO developmental_observations
           (reading_id, observation_key, position, lens, phenomenon, evidence_refs,
            observation, does_not_establish, structure_dependency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, o.key, i, o.lens, o.phenomenon, JSON.stringify(o.evidenceRefs),
         o.observation, JSON.stringify(o.doesNotEstablish), o.structureDependency.kind]);
    }
    return { ok: true as const, id, frozenAt };
  });
}

interface ReadingRow {
  id: string; manuscript_id: string; member_id: string; scope: unknown; read_state: unknown;
  coverage: unknown; outcome: 'reading' | 'none'; provenance: unknown; frozen_at: Date;
}
interface ObservationRow {
  observation_key: string; position: number; lens: string; phenomenon: string; evidence_refs: unknown;
  observation: string; does_not_establish: unknown; structure_dependency: 'independent' | 'authored-structure';
}

function hydrate(row: ReadingRow, obs: ObservationRow[]): DevelopmentalReading {
  const provenance = row.provenance as Omit<DevelopmentalReadingProvenance, 'frozenAt'>;
  const common = {
    id: row.id,
    manuscriptId: row.manuscript_id,
    scope: row.scope as DevelopmentalReading['scope'],
    readState: row.read_state as DevelopmentalReading['readState'],
    coverage: row.coverage as DevelopmentalReading['coverage'],
    provenance: { ...provenance, frozenAt: row.frozen_at.toISOString() },
  };
  if (row.outcome === 'none') return { ...common, outcome: 'none', observations: [] };
  const observations = obs
    .sort((a, b) => a.position - b.position)
    .map((o): DevelopmentalObservation => ({
      key: o.observation_key,
      lens: o.lens as DevelopmentalObservation['lens'],
      phenomenon: o.phenomenon as DevelopmentalObservation['phenomenon'],
      evidenceRefs: o.evidence_refs as DevelopmentalObservation['evidenceRefs'],
      observation: o.observation,
      doesNotEstablish: o.does_not_establish as DevelopmentalObservation['doesNotEstablish'],
      structureDependency: { kind: o.structure_dependency },
    }));
  return { ...common, outcome: 'reading', observations: observations as unknown as NonEmptyArray<DevelopmentalObservation> };
}

/** By identity, scoped to the member. Null when absent — not distinguished from "not yours". */
export async function loadReading(id: string, memberId: string): Promise<DevelopmentalReading | null> {
  const r = await query<ReadingRow>(
    `SELECT id, manuscript_id, member_id, scope, read_state, coverage, outcome, provenance, frozen_at
       FROM developmental_readings WHERE id = $1 AND member_id = $2`, [id, memberId]);
  if (r.rows.length === 0) return null;
  const obs = await query<ObservationRow>(
    `SELECT observation_key, position, lens, phenomenon, evidence_refs, observation,
            does_not_establish, structure_dependency
       FROM developmental_observations WHERE reading_id = $1 ORDER BY position`, [id]);
  return hydrate(r.rows[0], obs.rows);
}

export interface ReadingSummary {
  id: string;
  outcome: 'reading' | 'none';
  commissionedLens: string;
  frozenAt: string;
  observationCount: number;
}

/** Newest first. Summaries only — no state, no observations. */
export async function listReadings(manuscriptId: string, memberId: string): Promise<ReadingSummary[]> {
  const r = await query<{ id: string; outcome: 'reading' | 'none'; commissioned_lens: string; frozen_at: Date; n: string }>(
    `SELECT r.id, r.outcome, r.commissioned_lens, r.frozen_at,
            (SELECT count(*) FROM developmental_observations o WHERE o.reading_id = r.id)::text AS n
       FROM developmental_readings r
      WHERE r.manuscript_id = $1 AND r.member_id = $2
      ORDER BY r.frozen_at DESC`, [manuscriptId, memberId]);
  return r.rows.map((row) => ({
    id: row.id, outcome: row.outcome, commissionedLens: row.commissioned_lens,
    frozenAt: row.frozen_at.toISOString(), observationCount: Number(row.n),
  }));
}
