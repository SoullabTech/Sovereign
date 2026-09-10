/**
 * RC-GEN-01 · step 2 — the tool envelope.
 *
 * `toolChoice: {type:'tool'}` asks the provider for a tool call. It does not
 * GUARANTEE the geometry, and a caller that assumes it does will one day take the
 * first of two answers and call it the answer. So the geometry is enforced here,
 * on the blocks that actually arrived.
 *
 * ```
 *   zero revision_outcome calls   -> no_answer
 *   more than one                 -> malformed   ⛔ never "take the first"
 *   wrong tool name               -> malformed
 *   exactly one                   -> admitRevisionOutcome(...)
 * ```
 *
 * ⭐ WL-2 IN A NEW PLACE. Choosing among several structured answers is a resolver,
 * and a resolver that silently picks one has decided something nobody authorized
 * it to decide. Multiple proposals belong INSIDE one tool call, where the contract
 * can see them; two calls are two answers, and two answers are not an answer.
 *
 * ⛔ TEXT BLOCKS HAVE ZERO EVIDENTIARY WEIGHT. They may exist as provider
 * material. They are never promoted to an answer, never merged with one, and
 * never used to repair a malformed tool input.
 *
 * ⛔ NO VENDOR TERMINATION VOCABULARY. Nothing here reads `stop_reason` or its
 * equivalents. The semantic fact is the structured block that arrived; a
 * provider's word for how it stopped is not evidence about what it said.
 */

import type { StructuredBlock } from '../../ai/structured/types';
import { admitRevisionOutcome, REVISION_TOOL_NAME, type RevisionResult } from './outcome';

export function admitToolEnvelope(
  blocks: readonly StructuredBlock[],
  authorizedSectionIds: readonly string[],
): RevisionResult {
  const calls = blocks.filter(
    (b): b is Extract<StructuredBlock, { type: 'tool_use' }> => b.type === 'tool_use',
  );

  if (calls.length === 0) {
    /* Text-only is not an answer under a forced tool contract. It is the shape a
       model produces when it declined the contract, and admitting it would let
       prose become a proposal. */
    return { ok: false, refusal: 'no_answer', detail: 'no tool call in the completion' };
  }

  const named = calls.filter((c) => c.name === REVISION_TOOL_NAME);

  if (named.length === 0) {
    return {
      ok: false,
      refusal: 'malformed',
      detail: `tool call(s) present but none named ${REVISION_TOOL_NAME}`,
    };
  }

  if (named.length > 1) {
    return {
      ok: false,
      refusal: 'malformed',
      detail: `${named.length} ${REVISION_TOOL_NAME} calls: two answers are not an answer`,
    };
  }

  /* A call to some OTHER tool alongside the one we asked for is also two answers:
     we forced one contract, and something else was invoked under the same turn. */
  if (calls.length > named.length) {
    return {
      ok: false,
      refusal: 'malformed',
      detail: 'an unexpected tool was called alongside the revision outcome',
    };
  }

  return admitRevisionOutcome(named[0].input, authorizedSectionIds);
}
