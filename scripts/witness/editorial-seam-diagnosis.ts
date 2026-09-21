/**
 * WS-EDITORIAL — WHY DOES THE EDITORIAL TURN REFUSE?
 *
 * ⭐ ONE PROBE, THE REAL SEAM, SYNTHETIC WORDS.
 *
 * The walkthrough refused and the refusal CLASS was never captured, so the
 * cause has been guessed at rather than read. This sends the editorial turn's
 * own request shape — its model, its tool, its schema, its tool choice — through
 * `runStructured`, and prints what comes back.
 *
 * ⛔ WHAT IT DOES NOT DO, deliberately:
 *   · no member prose. The passage below is written for this file. ⛔ Never point
 *     it at a Work; that would be a crossing, and a crossing needs authority.
 *   · no disclosure receipt is minted or confirmed. Synthetic words are not the
 *     author's, so no boundary is at stake and none is claimed.
 *   · no database read, no turn persisted, no thread touched. It never reaches
 *     `runEditorialTurn`.
 *
 * ⚠️ IT DOES MAKE A REAL EXTERNAL CALL in `primary` mode. That is the point —
 * an offline probe can only tell you what the code would do, and the question is
 * what the provider actually does.
 *
 * ⭐ The constants are IMPORTED, never retyped. A probe that spells its own
 * model or its own schema measures itself.
 *
 *   npx tsx scripts/witness/editorial-seam-diagnosis.ts
 */

import { runStructured } from '@/lib/ai/structured/router';
import { resolveStructuredMode } from '@/lib/ai/structured/policy';
import type { StructuredRequest } from '@/lib/ai/structured/types';
import { EDITORIAL_MODEL } from '@/lib/manuscript/editorialRuntime/turn';
import {
  admitEditorialToolEnvelope, EDITORIAL_TOOL_NAME, editorialToolSchemaForKinds,
} from '@/lib/manuscript/editorialDiscourse/contract';
import { availableOutcomeKinds } from '@/lib/manuscript/editorialScope/sequence';

/* ⭐ SYNTHETIC. Written here, by nobody's hand but this file's. */
const SYNTHETIC_PASSAGE =
  'The kettle had been boiling for some time before she noticed it, and by then '
  + 'the window had gone white and the street below was only a rumour of itself.';
const SYNTHETIC_ASK = 'This sentence runs long. What is it doing, and is the length earning anything?';

function line(k: string, v: unknown): void {
  console.log(`${k.padEnd(18)} ${String(v)}`);
}

async function main(): Promise<void> {
  console.log('── editorial seam diagnosis ─────────────────────────────');

  /* 1 · WHAT POLICY SAYS, before anything is sent. A refusal here is a
     configuration answer, ⛔ never a provider answer, and the two have been
     confused. */
  const policy = resolveStructuredMode();
  line('MAIA_INFERENCE_MODE', process.env.MAIA_INFERENCE_MODE ?? '(unset → primary)');
  line('resolved mode', policy.ok ? policy.mode : `REFUSED ${policy.refusal}`);
  line('ANTHROPIC_API_KEY', process.env.ANTHROPIC_API_KEY ? 'present' : 'ABSENT');
  line('requested model', EDITORIAL_MODEL);
  console.log('');

  /* 2 · THE TURN'S OWN REQUEST, ungated (both outcome kinds available), so the
     schema is the widest the runtime ever sends. */
  const request: StructuredRequest = {
    model: EDITORIAL_MODEL,
    system: 'You are helping a writer think about one sentence of their own draft. '
      + 'Answer only through the editorial_outcome tool.',
    messages: [{ role: 'user', content: `${SYNTHETIC_ASK}\n\nPassage: ${SYNTHETIC_PASSAGE}` }],
    maxTokens: 1024,
    tools: [{
      name: EDITORIAL_TOOL_NAME,
      inputSchema: editorialToolSchemaForKinds(availableOutcomeKinds(false)),
      schemaEnforcement: 'required',
      description: 'Return exactly one editorial outcome.',
    }],
    toolChoice: { type: 'tool', name: EDITORIAL_TOOL_NAME },
  };

  const outcome = await runStructured(request);

  if (!outcome.ok) {
    /* ⭐ THE THING THAT WAS NEVER CAPTURED. */
    console.log('OUTCOME: REFUSED');
    line('refusal', outcome.refusal);
    line('dispatch', outcome.dispatch ?? '(absent — not applicable)');
    line('detail', outcome.detail ?? '(none)');
    console.log('');
    console.log('READING: `structured_inference_unavailable` is policy, not the provider.');
    console.log('         `not_configured` means the adapter module would not load.');
    console.log('         `provider_unavailable` + dispatch=no_response_observed means');
    console.log('         nothing left the process; dispatch=response_observed means the');
    console.log('         provider answered and the answer was an error.');
    process.exitCode = 1;
    return;
  }

  console.log('OUTCOME: RESULT RETURNED');
  const p = outcome.result.provenance;
  line('reportedModel', p.reportedModel ?? '(null — unreported)');
  line('modelAgreement', p.modelAgreement);
  line('stopReason', outcome.result.stopReason);
  line('latencyMs', p.latencyMs);
  line('block types', outcome.result.content.map((b) => b.type).join(', ') || '(none)');
  console.log('');

  /* 3 · THE TWO GATES THE RUNTIME APPLIES AFTER A RESULT, in the runtime's own
     order, so a refusal ABOVE the seam is distinguishable from one at it. */
  const attributable = p.reportedModel !== null && p.modelAgreement === 'agreed';
  line('attribution gate', attributable ? 'PASS' : 'WOULD REFUSE model_unattributable');
  if (!attributable) {
    console.log(`  requested=${p.model} reported=${p.reportedModel ?? 'none'} agreement=${p.modelAgreement}`);
    console.log('  ⚠️ Aliases are deliberately not normalized. A dated snapshot id answering');
    console.log('     an alias request reads as `differs`, and every editorial turn refuses.');
  }

  const admission = admitEditorialToolEnvelope(outcome.result.content);
  line('envelope gate', admission.ok ? `PASS (${admission.outcome.kind})` : `WOULD REFUSE ${admission.reason}`);

  process.exitCode = attributable && admission.ok ? 0 : 1;
}

main().catch((err) => {
  /* ⛔ An exception here is INSTRUMENT FAILURE, never a finding about the seam. */
  console.error('INSTRUMENT FAILURE — the probe itself threw, no evidence produced:');
  console.error(err);
  process.exitCode = 2;
});
