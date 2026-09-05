import { lineOf, requireLine, type RefusalCheck } from './harness';

/**
 * Refusal 19 — The legacy oracle conversation lane cannot write content.
 *
 * Sanctuary S2 (Kelly ruling K4, 2026-07-17): this lane persisted full
 * conversation content (storeSessionPattern: full messages array;
 * storeCMLayerSignal: message excerpt) with no Sanctuary handling anywhere in
 * the route. Production evidence showed zero traffic in 60 days and no live
 * dependency. Ruling: hard-refuse the lane — do not patch it with a
 * client-asserted boolean. Re-enabling requires the S5 governed write context.
 */

const ROUTE = 'app/api/oracle/conversation/route.ts';

export const check: RefusalCheck = {
  id: 'R19',
  refusal: 'The legacy oracle conversation lane refuses all requests before reading the body',
  grade: 'A',
  enforcedBy: `Hard 410 refusal as the first executable statement of POST in ${ROUTE}`,
  evidence: 'Disabled 2026-07-17 (S2). Zero traffic in 60 days of agent_runs.origin_route / runtime_events.route_id.',
  violationAttempted: 'find a code path in the lane that reaches body parsing or a content writer before the refusal',
  passingAuthorizes: 'the ungated content writers in this lane (storeSessionPattern, storeCMLayerSignal) are unreachable from HTTP',
  passingDoesNotAuthorize: 'that the writers are themselves governed (they are not — S5), or that the file should be kept long-term (delete-vs-revive is an S5 decision)',
  hostileForkMustChange: 'remove or reorder the 410 refusal block so the handler reads the request body — visible diff',

  run(io) {
    // lineOf/requireLine are shared (harness.ts): -1 only for a genuinely absent
    // anchor, never NaN. A grep line that cannot be parsed raises DetectorDefect.
    const marker = io.grep('LANE DISABLED — Sanctuary S2', [ROUTE]);
    const refusal = io.grep('status: 410', [ROUTE]);
    if (marker.length > 0 && refusal.length > 0) {
      io.pass('Disable marker and 410 refusal present');
    } else {
      io.fail('Lane disable refusal missing', `marker=${marker.length} 410=${refusal.length}`);
    }

    const handler = io.grep('export async function POST', [ROUTE]);
    const bodyRead = io.grep('request\\.json\\(', [ROUTE]);
    const writers = io.grep('storeSessionPattern\\(|storeCMLayerSignal\\(', [ROUTE]).filter((l) => !/import /.test(l));
    const refusalLine = lineOf(refusal);
    // The POST signature is a landmark, not a guard: if it is gone the ordering
    // assertion is unanchored (DetectorDefect), which is not the same claim as
    // "the body is readable before the refusal".
    const handlerLine = requireLine(handler, `"export async function POST" in ${ROUTE}`);

    if (handlerLine > 0 && refusalLine > handlerLine && (bodyRead.length === 0 || refusalLine < lineOf(bodyRead))) {
      io.pass('Refusal precedes any request-body read');
    } else {
      io.fail('Body is readable before the refusal', `refusal@${refusalLine} bodyRead@${lineOf(bodyRead)}`);
    }

    if (writers.length === 0) {
      io.note('Content writers removed from lane entirely');
    } else if (refusalLine > 0 && refusalLine < lineOf(writers)) {
      io.pass('Content writers sit below the refusal (unreachable from HTTP)', `${writers.length} writer refs`);
    } else {
      io.fail('A content writer precedes the refusal', writers[0]);
    }

    const log = io.grep('\\[ORACLE-LANE\\] refused', [ROUTE]);
    if (log.length > 0) {
      io.pass('Discoverable refusal log marker present ([ORACLE-LANE] refused)');
    } else {
      io.warn('No refusal log marker', 'production verification will need another signal');
    }
  },
};
