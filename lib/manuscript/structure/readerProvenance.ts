/**
 * WS2-05B-5½ — attribution of a reading, as a type of its own.
 *
 * SEPARATE FROM THE READER ON PURPOSE. The proposal store needs this shape, and
 * the store is imported by HTTP routes. Reaching into `maiaReader` for it - even
 * as a type-only import, which erases - leaves a line in the store that reads
 * like a dependency on the Anthropic SDK, and the day someone drops the `type`
 * keyword it becomes one. The store must be able to describe who read a Work
 * without being able to reach the thing that reads.
 */

export const READER_PROVIDERS = ['anthropic', 'ollama'] as const;
export type ReaderProvider = typeof READER_PROVIDERS[number];

export function isReaderProvider(value: unknown): value is ReaderProvider {
  return typeof value === 'string' && (READER_PROVIDERS as readonly string[]).includes(value);
}

export interface ReaderProvenance {
  /** The provider that actually served the structured reading. */
  provider: ReaderProvider;
  /** The resolved model string actually sent, never the default's name. */
  model: string;
  /** SHA-256 over the system prompt and the tool contract, together. */
  promptHash: string;
  readerVersion: string;
  /** ISO-8601, stamped by the store at the write. */
  frozenAt: string;
}

/** What a caller supplies; the store stamps `frozenAt`. */
export type ReaderIdentity = Omit<ReaderProvenance, 'frozenAt'>;
