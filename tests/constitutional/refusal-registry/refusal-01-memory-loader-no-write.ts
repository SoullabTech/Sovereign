import type { RefusalCheck } from './harness';

/**
 * Refusal 01 — The memory read path does not write.
 *
 * IMPORTANT correction surfaced by this harness (2026-07-01): the four memory
 * read modules are NOT uniform in grade.
 *   - conversationalRecallBlock / memoryOrchestrator / memoryHealth import no db
 *     handle at all → Grade A (structurally cannot write).
 *   - memoryAtomsLoader imports `query` from @/lib/db/postgres (a write-capable
 *     handle) and is prevented from writing only by the ABSENCE of a write
 *     statement → Grade A-minus (behavioural absence, not structural incapacity).
 * The Registry row is graded to the weakest link accordingly.
 */

const SQL_WRITE = /\bINSERT\s+INTO\b|\bDELETE\s+FROM\b|\bUPDATE\s+[\w."]+\s+SET\b/i;
const DB_IMPORT = /from\s+['"](@\/lib\/db\/postgres|pg)['"]/;

const STRUCTURAL = [
  'lib/maia/conversationalRecallBlock.ts',
  'lib/maia/memoryOrchestrator.ts',
  'lib/maia/memoryHealth.ts',
];

const LOADER = 'lib/maia/memoryAtomsLoader.ts';

export const check: RefusalCheck = {
  id: 'R01',
  refusal: 'The memory read path does not write member data',
  grade: 'A-minus',
  enforcedBy: 'Absence of any SQL write in lib/maia/memory*; three of four modules import no db handle',
  evidence: 'memoryAtomsLoader.ts (SELECT only, :264-275), conversationalRecallBlock.ts, memoryOrchestrator.ts, memoryHealth.ts',
  violationAttempted: 'find a db-write import or an INSERT/UPDATE/DELETE statement in any memory read module',
  passingAuthorizes: 'the memory read path performs no writes',
  passingDoesNotAuthorize: 'that memoryAtomsLoader is STRUCTURALLY incapable of writing — it holds a write-capable query() handle; the guarantee there is behavioural absence, not structural incapacity',
  hostileForkMustChange: 'add a db-write import (3 modules) or a write statement to a memory module — visible diff',

  run(io) {
    for (const f of STRUCTURAL) {
      const src = io.read(f);
      if (DB_IMPORT.test(src)) {
        io.fail(`${f} imports a db handle`, 'Grade-A structural write-incapacity broken');
      } else {
        io.pass(`${f} imports no db handle`, 'structurally cannot write');
      }
      if (SQL_WRITE.test(src)) io.fail(`${f} contains a SQL write statement`);
    }

    const loader = io.read(LOADER);
    if (SQL_WRITE.test(loader)) {
      io.fail(`${LOADER} contains a SQL write statement`, 'refusal falsified');
    } else {
      io.pass(`${LOADER} contains no SQL write statement`);
    }
    if (DB_IMPORT.test(loader)) {
      io.note(
        `${LOADER} imports a write-capable query() handle`,
        'refusal is behavioural-absence → graded A-minus, not A; a one-line write would defeat it without a new import',
      );
    }
  },
};
