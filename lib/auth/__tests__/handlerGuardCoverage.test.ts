/**
 * Handler-level authorization coverage.
 *
 * Principle (founder ruling 2026-07-28): middleware is routing and UX defence.
 * It is NOT the authorization boundary. Every sensitive handler must reject an
 * unauthorized caller reached directly, independent of what middleware decided.
 *
 * WHAT THIS PROVES: that each protected handler carries its own guard, and that
 * no new unguarded handler can be added to the founder API without failing CI.
 * WHAT IT DOES NOT PROVE: runtime authorization behaviour, session validity, or
 * anything about middleware. Those belong with the request-context work.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ACCESS_RULES } from '@/config/accessMatrix';

const REPO = path.resolve(__dirname, '../../..');

function listFiles(pattern: string): string[] {
  return execSync(`git ls-files '${pattern}'`, { cwd: REPO, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

const HANDLER = /^export async function (GET|POST|PATCH|PUT|DELETE)\b/gm;

/** Split a route file into one chunk per exported handler. */
function handlerBodies(src: string): Array<{ method: string; body: string }> {
  const starts: Array<{ method: string; index: number }> = [];
  for (const m of src.matchAll(HANDLER)) {
    starts.push({ method: m[1], index: m.index ?? 0 });
  }
  return starts.map((s, i) => ({
    method: s.method,
    body: src.slice(s.index, starts[i + 1]?.index ?? src.length),
  }));
}

describe('/api/founder/* — every handler guards itself', () => {
  const routes = listFiles('app/api/founder/**/route.ts');

  it('found the founder API surface', () => {
    expect(routes.length).toBeGreaterThanOrEqual(12);
  });

  it.each(routes)('%s imports the canonical founder guard', (rel) => {
    expect(read(rel)).toMatch(/import\s*\{[^}]*requireFounder[^}]*\}\s*from\s*'@\/lib\/founder\/founderAuth'/);
  });

  it.each(routes)('%s — every exported handler calls requireFounder()', (rel) => {
    const bodies = handlerBodies(read(rel));
    expect(bodies.length).toBeGreaterThan(0);
    for (const h of bodies) {
      expect({ route: rel, method: h.method, guarded: /requireFounder\(\)/.test(h.body) })
        .toEqual({ route: rel, method: h.method, guarded: true });
    }
  });

  it('does not reimplement middleware role logic in handlers', () => {
    // One canonical founder definition. Handlers must not grow a second one.
    for (const rel of routes) {
      const src = read(rel);
      expect(src).not.toMatch(/x-maia-roles|x-maia-tier/i);
      expect(src).not.toMatch(/rolesAnyOf/);
    }
  });
});

/**
 * Coverage ledger for matrix role-gated routes.
 *
 * Every ACCESS_RULES entry carrying `rolesAnyOf` must EITHER have independent
 * handler-level enforcement, or be explicitly classified here with a reason.
 * The classification list is deliberately explicit so that adding a role-gated
 * route silently is not possible — the test fails until it is triaged.
 *
 * Status 2026-07-28: only the founder API has been remediated. The rest are
 * recorded as PENDING with the inventory lane that owns them. PENDING entries
 * are listed, not skipped — this ledger is the inventory.
 */
const TRIAGE: Record<string, 'guarded' | 'pending-inventory'> = {
  '/api/founder': 'guarded',
  '/founder': 'pending-inventory',
  '/admin': 'pending-inventory',
  '/steward': 'pending-inventory',
  '/caseload': 'pending-inventory',
  '/supervision': 'pending-inventory',
  '/partners/': 'pending-inventory',
  '/labtools/admin': 'pending-inventory',
  '/labtools/gifts': 'pending-inventory',
  '/consciousness/portals/admin': 'pending-inventory',
  '/consciousness/portals/analytics': 'pending-inventory',
  '/maia/community/commons/review': 'pending-inventory',
  '/api/practitioner/practices': 'pending-inventory',
  '/api/practitioner/sessions': 'pending-inventory',
  // Surfaced by this test on 2026-07-28 — missed by manual enumeration.
  // The ledger found them, which is the point of having one.
  '/api/practitioner/containers': 'pending-inventory',
  '/api/stellium': 'pending-inventory',
  '/api/notifications': 'pending-inventory',
  '/api/commons/contributions/review-queue': 'pending-inventory',
  '/^\\/api\\/commons\\/contributions\\/[^/]+\\/review$/': 'pending-inventory',
  '/api/admin/beta-testers': 'pending-inventory',
};

describe('access-matrix role-gated routes are triaged', () => {
  const roleGated = ACCESS_RULES.filter((r) => r.rolesAnyOf?.length).map(
    (r) => r.exact ?? r.prefix ?? String(r.regex),
  );

  it('every rolesAnyOf rule is classified', () => {
    const untriaged = roleGated.filter((k) => !(k in TRIAGE));
    expect({ untriaged }).toEqual({ untriaged: [] });
  });

  it('records how many still await the inventory lane', () => {
    const pending = Object.entries(TRIAGE).filter(([, v]) => v === 'pending-inventory');
    // Not an assertion of safety — an explicit, visible count of remaining work.
    expect(pending.length).toBeGreaterThanOrEqual(0);
    console.log(`[access-triage] guarded=1 pending=${pending.length}`);
  });
});
