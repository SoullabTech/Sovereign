import type { RefusalCheck } from './harness';

/**
 * Refusal 04 — sacred_protected atoms never surface in ambient recall.
 *
 * The atoms loader's SELECT carries an explicit SQL predicate excluding the
 * 'sacred_protected' register. The exclusion is structural (in the query), not
 * a post-filter that could be bypassed by a caller.
 */

const LOADER = 'lib/maia/memoryAtomsLoader.ts';
const EXCLUSION = /NOT\s*\(\s*'sacred_protected'\s*=\s*ANY\s*\(\s*registers\s*\)\s*\)/;

export const check: RefusalCheck = {
  id: 'R04',
  refusal: 'sacred_protected atoms never surface in ambient recall',
  grade: 'A',
  enforcedBy: 'SQL predicate in the atoms loader SELECT',
  evidence: "memoryAtomsLoader.ts:271 — AND NOT ('sacred_protected' = ANY(registers))",
  violationAttempted: 'find the exclusion predicate missing or weakened in the loader query',
  passingAuthorizes: 'sacred_protected atoms are excluded from ambient prompt surfacing at the SQL layer',
  passingDoesNotAuthorize: 'that sacred_protected is unreadable by ALL code paths — only that THIS loader\'s ambient query excludes it',
  hostileForkMustChange: 'remove or weaken the SQL exclusion predicate in the loader — visible diff',

  run(io) {
    const src = io.read(LOADER);
    if (EXCLUSION.test(src)) {
      io.pass('SQL excludes sacred_protected from ambient surfacing', 'predicate present in loader query');
    } else {
      io.fail('sacred_protected exclusion predicate missing or altered', 'refusal falsified');
    }
  },
};
