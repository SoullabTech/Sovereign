/**
 * BUILD-07C — DEVELOPMENTAL READING · persistence: one additive table.
 *
 * WHAT THE STORE DOES. Mints the reading's identity (INV-1) and stamps
 * `frozenAt` (INV-25) at the write — never accepted from a caller, because a
 * caller-supplied id or timestamp is a claim, not a record. Writes the whole
 * reading, observations inside it, in one INSERT. Reads it back by identity,
 * scoped to the member who owns the manuscript.
 *
 * WHAT IT NEVER DOES. UPDATE or DELETE. A frozen reading is never corrected in
 * place (INV-4); a superseded reading is retained (INV-22). The database
 * enforces the first with a trigger (migration 20260904000001); this module
 * simply has no such statement, and the module-graph gate asserts that.
 *
 * NO MANUSCRIPT PROSE. `read_state` and `coverage` are the 07A objects — ids,
 * offsets, digests, topology, frozen structure labels — and `assertNoProseKeys`
 * refuses a payload that grew a text-bearing key. The observations column
 * holds MAIA's observation text, which is hers, not the Work's, and must
 * survive: it is the durable thing a writer will encounter.
 *
 * TWO PARTICIPANTS, APART. `reader_provenance` (who produced the words) and
 * `classifier_provenance` (who classified them) are separate columns, so it is
 * answerable later which intelligence did which.
 */

import { query, transaction } from '../../db/postgres';
import type { NonEmptyArray } from '../development/evidenceRef';
import type { DevelopmentalObservation, DevelopmentalReading, ReadingToFreeze } from './contract';

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

export type StoreRefusal = 'prose_in_state';

export type FreezeAndStoreResult =
  | { ok: true; id: string; frozenAt: string }
  | { ok: false; refusal: StoreRefusal; detail: string };

/**
 * Mint and write. One row, one INSERT; the database validates the observation
 * shape and the outcome ⇔ observations relation before the row exists.
 * `member_id` is the member whose evidence was captured — the caller's
 * verified identity — and every read is scoped by it.
 */
export async function freezeAndStore(memberId: string, reading: ReadingToFreeze): Promise<FreezeAndStoreResult> {
  const prose = assertNoProseKeys({ readState: reading.readState, coverage: reading.coverage });
  if (prose) return { ok: false, refusal: 'prose_in_state', detail: `${prose} holds text; the read state must carry none` };

  return transaction(async (tx) => {
    const r = await tx.query(
      `INSERT INTO developmental_readings
         (manuscript_id, member_id, draft_id, revision_number, commissioned_lens, scope,
          read_state, coverage, input_fingerprint, outcome, observations,
          reader_provenance, classifier_provenance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, frozen_at`,
      [reading.manuscriptId, memberId, reading.readState.draftId, reading.readState.revisionNumber,
       reading.scope.commissionedLens, JSON.stringify(reading.scope),
       JSON.stringify(reading.readState), JSON.stringify(reading.coverage),
       reading.readState.inputFingerprint, reading.outcome,
       JSON.stringify(reading.observations),
       JSON.stringify(reading.provenance.reader),
       reading.provenance.classifier === null ? null : JSON.stringify(reading.provenance.classifier)]);
    return { ok: true as const, id: r.rows[0].id as string, frozenAt: (r.rows[0].frozen_at as Date).toISOString() };
  });
}

interface ReadingRow {
  id: string; manuscript_id: string; scope: unknown; read_state: unknown; coverage: unknown;
  outcome: 'reading' | 'none'; observations: unknown; reader_provenance: unknown;
  classifier_provenance: unknown | null; frozen_at: Date;
}

function hydrate(row: ReadingRow): DevelopmentalReading {
  const common = {
    id: row.id,
    manuscriptId: row.manuscript_id,
    scope: row.scope as DevelopmentalReading['scope'],
    readState: row.read_state as DevelopmentalReading['readState'],
    coverage: row.coverage as DevelopmentalReading['coverage'],
    provenance: {
      reader: row.reader_provenance as DevelopmentalReading['provenance']['reader'],
      classifier: (row.classifier_provenance ?? null) as DevelopmentalReading['provenance']['classifier'],
      frozenAt: row.frozen_at.toISOString(),
    },
  };
  if (row.outcome === 'none') return { ...common, outcome: 'none', observations: [] };
  return {
    ...common, outcome: 'reading',
    observations: row.observations as NonEmptyArray<DevelopmentalObservation>,
  };
}

const COLUMNS = `id, manuscript_id, scope, read_state, coverage, outcome, observations,
                 reader_provenance, classifier_provenance, frozen_at`;

/** By identity, scoped to the member. Null when absent — not distinguished from "not yours". */
export async function loadReading(id: string, memberId: string): Promise<DevelopmentalReading | null> {
  const r = await query<ReadingRow>(
    `SELECT ${COLUMNS} FROM developmental_readings WHERE id = $1 AND member_id = $2`, [id, memberId]);
  return r.rows.length === 0 ? null : hydrate(r.rows[0]);
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
  const r = await query<{ id: string; outcome: 'reading' | 'none'; commissioned_lens: string; frozen_at: Date; n: number }>(
    `SELECT id, outcome, commissioned_lens, frozen_at, jsonb_array_length(observations) AS n
       FROM developmental_readings
      WHERE manuscript_id = $1 AND member_id = $2
      ORDER BY frozen_at DESC`, [manuscriptId, memberId]);
  return r.rows.map((row) => ({
    id: row.id, outcome: row.outcome, commissionedLens: row.commissioned_lens,
    frozenAt: row.frozen_at.toISOString(), observationCount: Number(row.n),
  }));
}
