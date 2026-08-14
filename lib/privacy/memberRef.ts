/**
 * Privacy-safe member correlation reference for logs.
 *
 * WHY THIS EXISTS
 *   Member identifiers were being interpolated raw into container stdout on the memory path.
 *   Container stdout is captured by the Docker log driver and readable by anyone with host or
 *   `docker logs` access, and a member id is a durable join key across every table in the system.
 *
 * WHAT THIS IS — AND IS NOT
 *   `memberRef()` is **pseudonymous and correlatable. It is NOT anonymous data.**
 *   The same member yields the same token, which is the point: operators can follow one member
 *   through a log window without the identifier being present. That same property means a token
 *   is still member-linked data — it must be treated as such in retention, export, and disclosure.
 *   Do not describe logs carrying memberRef as "anonymised".
 *
 * WHY NOT `.slice(0, 8)`
 *   A truncated UUID is a fragment of the source identifier, not a derivation of it. It remains
 *   directly matchable against the real value and leaks the id's own prefix. Truncation is not
 *   the target standard here even though it is better than printing the whole thing.
 *
 * PREFERENCE ORDER
 *   1. Emit no identifier at all, when correlation is not actually needed.
 *   2. Emit `memberRef(id)` when correlation genuinely is needed.
 *   3. Never emit the raw identifier or a slice of it.
 *
 * SCHEME
 *   Truncated SHA-256, matching the convention already used by CC-A memory-provenance telemetry
 *   (`lib/memory/provenance/turnMemoryProvenance.ts` `digest()`), so a log line and a provenance
 *   record describing the same member agree on the token.
 */

import { createHash } from 'crypto';

/** Length of the emitted token, in hex characters. Matches CC-A telemetry. */
const REF_LENGTH = 12;

/**
 * One-way, stable, correlatable reference for a member identifier.
 *
 * Returns `'anonymous'` for absent identifiers so call sites do not have to branch, and so an
 * absent id is visibly different from a present one rather than rendering as `undefined`.
 */
export function memberRef(id: string | null | undefined): string {
  if (id === null || id === undefined || id === '') return 'anonymous';
  return createHash('sha256').update(id).digest('hex').slice(0, REF_LENGTH);
}
