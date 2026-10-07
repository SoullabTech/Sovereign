import { StructuredDispatchError, dispatchOf } from './dispatch';

/** A displayable category, not a retry/fallback policy. No SDK import. */
export function originalStructuredError(error: unknown): unknown {
  return error instanceof StructuredDispatchError ? error.original : error;
}

export function structuredProviderRefusal(error: unknown): 'provider_unavailable' | 'provider_billing_required' {
  const original = originalStructuredError(error);
  if (!original || typeof original !== 'object') return 'provider_unavailable';
  const value = original as { status?: unknown; message?: unknown };
  const observed = dispatchOf(error) === 'response_observed' || typeof value.status === 'number';
  // Only an actual HTTP rejection with the known balance message establishes
  // this category. A timeout, rate limit, or arbitrary local message does not.
  if (observed && (value.status === 400 || value.status === 402)
    && typeof value.message === 'string'
    && /\bcredit balance is too low\b/iu.test(value.message)) {
    return 'provider_billing_required';
  }
  return 'provider_unavailable';
}
