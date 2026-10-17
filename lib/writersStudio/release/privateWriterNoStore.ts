/**
 * Ordinary Writer's Studio beta: member-owned manuscript and editorial reads
 * MUST NOT be stored by browsers, shared caches or intermediaries.
 * This is HTTP containment only, not data-at-rest encryption or member auth.
 */
export const PRIVATE_WRITER_CACHE_CONTROL = 'private, no-store, max-age=0';

export function privateWriterNoStore<T extends Response>(response: T): T {
  response.headers.set('Cache-Control', PRIVATE_WRITER_CACHE_CONTROL);
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
