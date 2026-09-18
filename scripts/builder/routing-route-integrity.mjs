/**
 * JARVIS Routing Route Integrity — canonical pure digest law.
 *
 * R5A boundary:
 * - deterministic canonicalization + SHA-256 only
 * - no filesystem, shell, network, environment, credentials, models, or Work Unit mutation
 */
import { createHash } from 'node:crypto';

export const ROUTE_INTEGRITY_VERSION = 'R5A.v1';
export const ROUTE_SOURCE = 'R2-pure-router';

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

export function canonicalRouteJson(routeRecord) {
  return JSON.stringify(canonicalize(routeRecord));
}

export function routeDigest(routeRecord) {
  return 'sha256:' + createHash('sha256')
    .update(canonicalRouteJson(routeRecord))
    .digest('hex');
}
