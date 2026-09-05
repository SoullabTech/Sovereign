/**
 * BUILD-07E — the developmental reading an Ask conversation reasons from, read-only.
 *
 * WHY THIS EXISTS RATHER THAN `developmentalReading/store.loadReading`.
 *
 * The very reason `frozenReading.ts` exists, one object over. That store
 * exports `freezeAndStore`, which INSERTs; importing it for a reader would put
 * a writer in the Ask module graph, one dropped `type` keyword away from being
 * reachable. `__tests__/askRuntimeCannotWrite.test.ts` walks this directory and
 * asserts the property rather than trusting the intent.
 *
 * SO EVERY STATEMENT IN THIS FILE IS A SELECT, over exactly one table.
 *
 * WHAT ABOUT THE REVISION CONTENT? Recovering evidence needs it, and this
 * module does NOT load it — `development/capture.ts` already owns that read
 * (`loadRevisionContent`, `loadLiveWork`), is read-only by construction, and
 * has its own standing gate in `development/__tests__/evidenceCannotAct.test.ts`
 * asserting that the whole directory contains no INSERT, UPDATE or DELETE.
 * Writing a second SQL path here would be a second thing to keep true.
 */

import { query } from '@/lib/db/postgres';
import type { NonEmptyArray } from '../development/evidenceRef';
import type {
  DevelopmentalObservation, DevelopmentalReading,
} from '../developmentalReading/contract';

interface ReadingRow {
  id: string;
  manuscript_id: string;
  scope: unknown;
  read_state: unknown;
  coverage: unknown;
  outcome: 'reading' | 'none';
  observations: unknown;
  reader_provenance: unknown;
  classifier_provenance: unknown | null;
  frozen_at: Date;
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
      /* `readingContractVersion` is NOT selected because it is not a column.
         The v1/v2 distinction lives in the observation shape itself — whether
         `phenomenon` may be absent — and a hydrator that invented the field
         would be asserting a provenance the row does not carry. */
      frozenAt: row.frozen_at.toISOString(),
    },
  };
  if (row.outcome === 'none') return { ...common, outcome: 'none', observations: [] };
  return {
    ...common,
    outcome: 'reading',
    observations: row.observations as NonEmptyArray<DevelopmentalObservation>,
  };
}

/**
 * Load one frozen reading, scoped to the member who owns the Work.
 *
 * The member scope is in the SQL rather than checked afterwards: a query that
 * can return another member's reading has already leaked it, whatever the
 * caller does with the row next. Null does not distinguish "absent" from "not
 * yours", deliberately.
 */
export async function loadFrozenDevelopmentalReading(
  manuscriptId: string, readingId: string, memberId: string,
): Promise<DevelopmentalReading | null> {
  const r = await query<ReadingRow>(
    `SELECT id, manuscript_id, scope, read_state, coverage, outcome, observations,
            reader_provenance, classifier_provenance, frozen_at
       FROM developmental_readings
      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3
      LIMIT 1`,
    [readingId, manuscriptId, memberId]);
  const row = r.rows[0];
  return row ? hydrate(row) : null;
}
