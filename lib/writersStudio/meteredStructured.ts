/**
 * The structured seam, as Writer's Studio readers call it: the seam's own `runStructured`, UNCHANGED, followed by a
 * usage report to the shadow MAIA meter (./maiaMeter.ts).
 *
 * Same one argument, same outcome, same refusals: this adds no mode, provider or model choice, and returns exactly what
 * the seam returned. The report happens after the outcome exists, carries only token counts and the pinned model, and
 * is a no-op unless the request is inside a metered Writer route with the meter in 'shadow'.
 */
import { runStructured as seamRunStructured } from '@/lib/ai/structured/router';
import type { StructuredOutcome, StructuredRequest } from '@/lib/ai/structured/types';
import { reportMaiaUsage } from './maiaMeter';

export async function runStructured(req: StructuredRequest): Promise<StructuredOutcome> {
  const outcome = await seamRunStructured(req);
  try {
    const usage = outcome.ok ? outcome.result?.usage : undefined;
    if (usage) reportMaiaUsage({ inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, model: req.model });
  } catch {
    // Reporting can never change or break the outcome.
  }
  return outcome;
}
