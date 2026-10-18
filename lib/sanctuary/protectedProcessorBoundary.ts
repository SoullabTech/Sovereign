/**
 * RF01 S1-B — pure, client-safe refusal for non-Anthropic protected routes.
 *
 * NO database, Node.js runtime, provider SDK or network dependency. This
 * module is safe to import from shared/offline browser helpers.
 */
/** An Anthropic grant does not approve local, Moonshot, or multi-engine. */
export class UnqualifiedProtectedProcessor extends Error {
  readonly code = 'PROTECTED_PROCESSOR_UNQUALIFIED';
  constructor() {
    super('PROTECTED_PROCESSOR_UNQUALIFIED');
    this.name = 'UnqualifiedProtectedProcessor';
  }
}
export function rejectUnqualifiedProtectedProcessor(meta?: Record<string, unknown>): void {
  if (meta?.sanctuary === true) throw new UnqualifiedProtectedProcessor();
}
