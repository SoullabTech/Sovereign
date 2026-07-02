import type { RefusalCheck } from './harness';

/**
 * Refusal 02 — The Corpus Callosum `integration_passes` log has no readers.
 *
 * The feared "center-capture seam" (MAIA synthesising its own voices and
 * surfacing that synthesis as member meaning) cannot exist here because nothing
 * in app/ or lib/ reads the table. It is write-only telemetry.
 *
 * The check also confirms a WRITER exists — "no readers" is only meaningful if
 * the table is actually written; an entirely-unused table would pass vacuously.
 */

// A reader = any FROM/JOIN against the table, or a SELECT naming it.
const READER = 'FROM\\s+integration_passes|JOIN\\s+integration_passes|SELECT[^;]*\\bintegration_passes\\b';
const WRITER = 'INSERT\\s+INTO\\s+integration_passes';

export const check: RefusalCheck = {
  id: 'R02',
  refusal: 'The integration_passes log is write-only (no readers)',
  grade: 'A',
  enforcedBy: 'Absence of any consumer of the table across app/ and lib/',
  evidence: 'Writer: lib/services/corpusCallosumService.ts:167 (INSERT). Readers: none.',
  violationAttempted: 'find any FROM/JOIN/SELECT reader of integration_passes in app/ or lib/',
  passingAuthorizes: 'Corpus Callosum integration logs are never surfaced to members or fed back into prompts',
  passingDoesNotAuthorize: 'that the underlying multi-agent synthesis is itself governed — only that this LOG has no readers',
  hostileForkMustChange: 'add a reader that pipes integration_passes rows into a prompt or member surface — visible diff',

  run(io) {
    const allRefs = io.grep('integration_passes', ['app', 'lib']);
    const readers = io
      .grep(READER, ['app', 'lib'])
      .filter((line) => !/INSERT\s+INTO\s+integration_passes/i.test(line));

    if (readers.length === 0) {
      io.pass('No readers of integration_passes in app/ or lib/', `${allRefs.length} total refs, all non-reading`);
    } else {
      io.fail('integration_passes has reader(s)', readers.join(' | '));
    }

    const writers = io.grep(WRITER, ['lib']);
    if (writers.length > 0) {
      io.pass('Writer present — "no readers" is non-vacuous', writers[0].split(':').slice(0, 2).join(':'));
    } else {
      io.warn('No writer found — "no readers" may be vacuous', 'table may be entirely unused');
    }
  },
};
