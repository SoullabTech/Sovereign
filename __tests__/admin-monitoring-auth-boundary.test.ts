/**
 * ADMIN MONITORING AUTHORIZATION — containment pins (R5, 2026-08-16)
 *
 * Founder ruling R5 (docs/governance/FRONT_DOOR_FOUNDER_RULINGS_2026-08-16.md):
 * "Middleware may decide where a request goes. It may not decide who the person
 *  is or what they are authorized to do." Every sensitive route must verify a
 *  session server-side; a bare `x-member-id` header is a client claim, never
 *  authority.
 *
 * These three /api/admin/monitoring routes previously authenticated on the mere
 * PRESENCE of an `x-member-id` header (`const memberId = req.headers.get(...)`;
 * `if (!memberId) 401`). Anyone sending any value passed. They were repaired to
 * verify an admin session via `checkAdminAuth` (which validates against
 * auth_sessions and checks members.admin_role, refusing bare x-member-id).
 *
 * These are static pins, not a runtime exploit test: they freeze the repaired
 * boundary so a regression to header-presence auth fails loudly here.
 *
 * If a pin fails: do NOT relax it. It means an admin route went back to trusting
 * a client-supplied identity claim. Route it through checkAdminAuth instead.
 */

import { readFileSync } from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');

const MONITORING_ROUTES = [
  'app/api/admin/monitoring/route.ts',
  'app/api/admin/monitoring/system/route.ts',
  'app/api/admin/monitoring/run-checks/route.ts',
];

const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), 'utf8');

describe('R5 — admin monitoring routes verify a session, not a header claim', () => {
  for (const rel of MONITORING_ROUTES) {
    describe(rel, () => {
      it('does NOT authenticate on the bare presence of x-member-id', () => {
        const src = read(rel);
        // The exact defeated pattern: read the header into an id, then only
        // guard on its truthiness. If both appear, authority rests on a claim.
        const readsHeaderAsId = /const\s+memberId\s*=\s*[^;]*headers\.get\(\s*['"]x-member-id['"]\s*\)/.test(src);
        const guardsOnPresence = /if\s*\(\s*!\s*memberId\s*\)/.test(src);
        expect(readsHeaderAsId && guardsOnPresence).toBe(false);
      });

      it('verifies via checkAdminAuth and denies with adminUnauthorized', () => {
        const src = read(rel);
        expect(src).toMatch(/checkAdminAuth\s*\(/);
        expect(src).toMatch(/adminUnauthorized\s*\(/);
      });
    });
  }
});
