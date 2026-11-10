/**
 * WS-WORK-CONTINUITY · A2 (editorial turn) — mechanical quote fidelity for the passage desk.
 *
 * Same law as the Work conversation: a long quoted span in MAIA's REPLY must occur in text she was actually
 * given for this turn (everything in the request, which includes the passage, the author's sample and the
 * writer's own words) or in her own proposal in the same response. ⛔ Existence of the quote only; not the truth
 * of her claim about it. ⛔ The whole turn is refused, never repaired (this lane's convention): nothing of hers is
 * kept and nothing is written.
 */
import { checkQuoteFidelity } from '@/lib/manuscript/ask/quoteFidelity';
import type { StructuredRequest } from '@/lib/ai/structured/types';

export interface QuotableOutcome {
  readonly kind: string;
  readonly reply: string;
  readonly proposal?: { readonly replacementText: string; readonly rationale?: string };
  readonly direction?: { readonly instruction: string };
}

export const QUOTE_NOT_IN_TEXT_DETAIL =
  'MAIA quoted wording that is not in the text she was given, so nothing was shown or changed. '
  + 'Your own words are untouched. Try asking again, or point her to the exact passage.';

/** Flatten structured message content to the TEXT it carries, so escaped newlines and quotes cannot make a faithful quote unmatchable. */
const contentOf = (c: unknown): string => {
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map(contentOf).join('\n');
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    if (typeof o.text === 'string') return o.text;
    if (typeof o.content === 'string' || Array.isArray(o.content)) return contentOf(o.content);
    return Object.values(o).map(contentOf).join('\n');
  }
  return c === null || c === undefined ? '' : String(c);
};

export function judgeEditorialQuotes(request: StructuredRequest, outcome: QuotableOutcome): { ok: boolean; ungrounded: readonly string[] } {
  const sources = [
    request.system,
    ...request.messages.map((m) => contentOf((m as { content?: unknown }).content)),
    outcome.proposal?.replacementText ?? '',
    outcome.proposal?.rationale ?? '',
    outcome.direction?.instruction ?? '',
  ];
  return checkQuoteFidelity(outcome.reply, sources);
}
