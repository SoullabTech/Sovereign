import type { NextRequest } from 'next/server';

/**
 * Shared admin gate for the monitoring surface (/admin/monitor and its APIs).
 *
 * Same boundary the rest of /admin already trusts: a password held in
 * LABTOOLS_ADMIN_PASSWORD, presented via the `x-admin-password` header (or
 * `Authorization: Bearer <pw>`). No DB lookup, no member-role table — this
 * mirrors checkAdminAuth() in app/api/admin/research/overview/route.ts so the
 * monitor field inherits the established admin contract rather than inventing
 * a new one.
 *
 * Returns false (deny) when the env var is unset, so a misconfigured server
 * fails closed.
 */
export function isAdminRequest(req: NextRequest): boolean {
  const adminPassword = process.env.LABTOOLS_ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const authHeader = req.headers.get('x-admin-password') ?? req.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  return token === adminPassword;
}
