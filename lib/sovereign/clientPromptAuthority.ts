/**
 * PROMPT-AUTHORITY-02 (extends PBR-001, 2026-10-01).
 *
 * `meta` arrives as the client's request-body rest-spread. PBR-001 moved that
 * spread ABOVE the server-authored fields so a client could not override them.
 * That closed collisions only. Prompt-bearing keys the server never sets on a
 * route (`maiaModeAddendum`, `governorAddendum`, `teenSupportContext`, …) still
 * flowed from the request body straight into MAIA's system prompt: any caller
 * could write text into it.
 *
 * Law: a client field never reaches the prompt unless explicitly allowed.
 * `withoutClientPromptAuthority` removes every prompt-bearing key from client
 * meta. Server-authored values are added AFTER it at the call site, as before.
 * `__tests__/clientPromptAuthority.test.ts` pins the law against what
 * maiaService actually reads, so a new prompt-bearing key cannot slip through.
 */

/** Prompt-bearing keys that do not end in "Addendum". */
const EXPLICIT_PROMPT_KEYS = new Set<string>([
  'selfletContext',
  'ainKnowledgeContext',
  'atlasContext',
  'conversationContext',
  'selfletPromptBlock',
  'recentContext',
  'teenSupportContext',
  'memoryContext',
  'memoryBundle',
  'crisisSafetyAddendum',
  'systemPrompt',
  'systemPromptModifier',
]);

/** True for a meta key whose value can reach MAIA's system prompt. */
export function isPromptBearingKey(key: string): boolean {
  return /Addendum$/.test(key) || EXPLICIT_PROMPT_KEYS.has(key);
}

/** Client meta with every prompt-bearing key removed. Never mutates its input. */
export function withoutClientPromptAuthority<T extends Record<string, unknown>>(meta: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta ?? {})) {
    if (!isPromptBearingKey(k)) out[k] = v;
  }
  return out;
}
