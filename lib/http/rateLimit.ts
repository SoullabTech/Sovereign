/**
 * Per-process sliding-window rate limiter (single prod container, v1).
 *
 * In-memory, not durable, not multi-instance — revisit with a DB/Redis limiter if the deployment
 * scales out (note for the deploy gate). Extracted from the LiveKit room-token route so the
 * guest-reachable /api/open/session-room/* endpoints reuse the same proven shape rather than
 * re-implementing anti-abuse logic per route.
 *
 * createRateLimiter returns a closure with its OWN bucket map, so each call site is throttled
 * independently — turn-credentials and signal do not share a budget.
 */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function limited(key: string, now: number): boolean {
    // Opportunistic prune so the map can't grow unbounded with stale keys; the sweep only runs
    // once the map is non-trivially large. Single-instance / in-memory by design.
    if (hits.size > 256) {
      for (const [k, v] of hits) {
        if (v.every((t) => now - t >= windowMs)) hits.delete(k);
      }
    }
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    return false;
  };
}

/**
 * Best-effort client IP for rate-limit keying. Behind our own Caddy reverse proxy X-Forwarded-For
 * is set by the proxy (the app is not directly internet-facing), so the left-most hop is the
 * client. Falls back to a single shared bucket ('unknown') if no forwarding header is present —
 * acceptable for a single-proxy self-hosted deployment.
 */
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
