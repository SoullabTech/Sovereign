/**
 * USER-TERMINAL MESSAGE GUARD
 *
 * Claude rejects a messages array that ends on an assistant turn — the
 * last-assistant-turn "prefill" returns 400 ("the conversation must end with a
 * user message") on Sonnet/Opus 4.6+ (and Fable 5). Trim trailing assistant
 * turns so every call is user-terminal.
 *
 * Pure and dependency-free on purpose: it can be unit-proven without loading the
 * Anthropic SDK (see scripts/repro/fieldlab_user_terminal_proof.mts). Returns the
 * same array reference when already user-terminal, else a trimmed copy. An empty
 * result means the history had no user turn at all — the caller must handle that
 * case (the FieldLab route maps it to a 400; the provider throws).
 */
export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export function ensureUserTerminal<T extends ChatTurn>(messages: T[]): T[] {
  let end = messages.length;
  while (end > 0 && messages[end - 1].role === 'assistant') end--;
  return end === messages.length ? messages : messages.slice(0, end);
}
