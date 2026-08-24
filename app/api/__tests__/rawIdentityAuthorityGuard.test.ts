/**
 * AUTH-01-D — RAW IDENTITY AUTHORITY GUARD · defense in depth.
 *
 * ⛔ NOT the primary proof. `authorityContainment.test.ts` is. This is a
 * source-structural guard, same evidence class as
 * `app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts`: it exists so
 * a future route cannot CASUALLY reintroduce a caller-controlled identifier as
 * authentication authority, and so the one route whose transitive imports make
 * handler-level testing impractical is still covered.
 *
 * ⚠️ WHY THE SHADOW CHECK EXISTS — a defect in the AUTH-01-C census.
 * That census built its population as "reads x-member-id AND does not contain the
 * string getMemberFromRequest". 14 practitioner routes each define their OWN local
 * function *named* `getMemberFromRequest`:
 *
 *     async function getMemberFromRequest(request: NextRequest) {
 *       const memberId = request.headers.get('x-member-id');
 *       if (!memberId) return null;
 *       const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
 *       return result.rows.length > 0 ? { id: memberId } : null;
 *     }
 *
 * That is verbatim the existence-check impersonation pattern
 * `lib/auth/getMemberFromRequest.ts:19-22` documents as fixed — and the name collision
 * with the hardened module is exactly what excluded them from the census. The
 * population of 27 was reproducible and UNDER-INCLUSIVE.
 *
 * ⛔ Those 14 are NOT repaired by AUTH-01-D. Repairing them would breach the unit's
 * authorized scope ("scope expands beyond those 27 routes" is a STOP condition), so
 * they are quarantined here — visible in code, unable to grow — pending founder
 * authorization. A shadow resolver on any OTHER path fails this suite immediately.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');
const apiRoot = path.join(repoRoot, 'app/api');

const RAW_IDENTITY_READS: Array<{ pattern: RegExp; what: string }> = [
  { pattern: /headers\s*\.?\s*get\(\s*['"]x-member-id['"]\s*\)/, what: 'x-member-id header' },
];

/** Permitted x-member-id reads. Every entry cites its AUTH-01-C classification. */
const ALLOWED: Record<string, string> = {
  'app/api/auth/native-biometry/verify/route.ts':
    'CLAIM CROSS-CHECKED — verified against trusted_devices (id + member_id) with expiry before a session is minted.',
  'app/api/auth/native-biometry/enable/route.ts':
    'CLAIM CROSS-CHECKED — same trusted_devices predicate on both the POST and the GET.',
  'app/api/telemetry/client/route.ts':
    'NON-AUTHORITY USE — a label on a bounded, allow-listed telemetry event. Grants no read, write, or access decision.',
};

/**
 * ⛔ KNOWN UNSAFE, NOT YET AUTHORIZED FOR REPAIR. Discovered during AUTH-01-D;
 * outside its scope. Each defines a local `getMemberFromRequest` that treats a bare
 * `x-member-id` as identity after an existence check. Owned by the follow-up unit.
 * This list must SHRINK, never grow.
 */
// ✅ EMPTIED BY AUTH-01-D3. All 14 practitioner routes that defined a route-local
// existence-check resolver now use the canonical resolver under its own name. This list
// must stay empty; the assertions below make a new one impossible to add quietly.
const KNOWN_UNREPAIRED_SHADOW_RESOLVER: string[] = [];

/**
 * `?memberId=` is a second caller-controlled identity channel that the AUTH-01-C
 * population never looked at — it censused header reads only. 29 routes read it.
 * Pinned so the surface cannot grow while the follow-up census decides which of them
 * cross-check it against a verified session and which do not.
 */
const QUERY_PARAM_IDENTITY_ROUTE_COUNT = 29;

function routeFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) routeFiles(full, acc);
    else if (entry === 'route.ts') acc.push(path.relative(repoRoot, full));
  }
  return acc;
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
}

describe('AUTH-01-D · raw identity authority guard', () => {
  const files = routeFiles(apiRoot);

  it('finds the API surface (guard is not vacuously passing)', () => {
    expect(files.length).toBeGreaterThan(500);
  });

  it('no route treats x-member-id as authority outside the allow-list', () => {
    const offenders: string[] = [];
    for (const rel of files) {
      if (rel in ALLOWED) continue;
      if (KNOWN_UNREPAIRED_SHADOW_RESOLVER.includes(rel)) continue;
      const code = stripComments(readFileSync(path.join(repoRoot, rel), 'utf8'));
      for (const { pattern, what } of RAW_IDENTITY_READS) {
        // A read is fine when the hardened resolver is what actually decides identity.
        if (pattern.test(code) && !code.includes("from '@/lib/auth/getMemberFromRequest'")) {
          offenders.push(`${rel} — reads ${what} with no hardened resolver`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no NEW route shadows the hardened resolver name', () => {
    const shadows = files.filter((rel) =>
      /async function getMemberFromRequest/.test(readFileSync(path.join(repoRoot, rel), 'utf8'))
    );
    // Exactly the quarantined set — a name collision must never again hide a route
    // from a census that filters on that name.
    expect(shadows.sort()).toEqual([...KNOWN_UNREPAIRED_SHADOW_RESOLVER].sort());
  });

  it('the shadow quarantine is empty and stays empty', () => {
    expect(KNOWN_UNREPAIRED_SHADOW_RESOLVER).toEqual([]);
  });

  it('no route defines a LOCAL existence-check resolver, under any name', () => {
    // The generalised form of the D3 defect. A route-local helper that reads a
    // caller-controlled identifier and treats "a members row exists" as identity is the
    // primitive, whatever it is called — naming the ban after one function name is what
    // let 14 routes hide from the first census.
    const EXISTENCE_CHECK = /SELECT\s+id\s+FROM\s+members\s+WHERE\s+id\s*=\s*\$1/i;
    const CALLER_READ =
      /headers\s*\.?\s*get\(\s*['"]x-[\w-]*id['"]|searchParams\.get\(\s*['"](memberId|userId|id)['"]/;

    const offenders = files.filter((rel) => {
      const code = stripComments(readFileSync(path.join(repoRoot, rel), 'utf8'));
      return (
        EXISTENCE_CHECK.test(code) &&
        CALLER_READ.test(code) &&
        !code.includes("from '@/lib/auth/getMemberFromRequest'")
      );
    });
    expect(offenders).toEqual([]);
  });

  it('the ?memberId= identity surface does not grow while the follow-up census is pending', () => {
    const qRoutes = files.filter((rel) =>
      /searchParams\.get\(\s*['"]memberId['"]\s*\)/.test(
        stripComments(readFileSync(path.join(repoRoot, rel), 'utf8'))
      )
    );
    expect(qRoutes.length).toBeLessThanOrEqual(QUERY_PARAM_IDENTITY_ROUTE_COUNT);
  });

  it('the allow-list itself stays small and reasoned', () => {
    for (const [p, reason] of Object.entries(ALLOWED)) {
      expect(reason).toMatch(/CLAIM CROSS-CHECKED|NON-AUTHORITY USE/);
      expect(files).toContain(p);
    }
    expect(Object.keys(ALLOWED).length).toBeLessThanOrEqual(5);
  });
});

/**
 * The primary conversation route carries ~99.6% of live traffic and its transitive
 * imports make handler-level testing impractical, so its identity boundary is
 * asserted structurally — the same reasoning as relationalSanctuaryGuard.test.ts.
 */
describe('AUTH-01-D · /api/sovereign/app/maia identity boundary', () => {
  const rel = 'app/api/sovereign/app/maia/route.ts';
  const src = readFileSync(path.join(repoRoot, rel), 'utf8');
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');

  it('resolves identity from the hardened resolver', () => {
    expect(code).toContain('await getMemberIdFromRequest(req)');
  });

  it('refuses when a body userId claim disagrees with the verified session', () => {
    expect(code).toMatch(/claimedUserId !== verifiedMemberId/);
    expect(code).toContain("unauthenticatedResponse('identity_mismatch')");
  });

  it('member developmental memory is gated on the VERIFIED member, not a body field', () => {
    expect(code).toContain('loadRecentDevelopmentalMemories(memberId,');
    expect(code).toContain('loadRecentThemeSignals(memberId,');
    expect(code).toMatch(/if \(!isSanctuary && memberId\)/);
  });

  it('member-attributed relational writes are gated on the verified member only', () => {
    expect(code).toContain('const observerMemberId = memberId;');
    // The old fallback chain must not return in any form.
    expect(code).not.toMatch(/observerMemberId\s*=\s*userId/);
  });

  it('guest cognition uses an EXPLICIT namespace, never a bare caller-supplied id', () => {
    // cognitive_turn_events is keyed by a bare `user_id` string with a namespace-agnostic
    // predicate, and session.id is upserted from the request BODY. Keying a guest read on
    // a bare session.id would be a caller-controlled identity channel by another name.
    expect(code).toContain('const guestKey = `guest:${session.id}`');
    expect(code).toContain('const identityRef: string = memberId ?? guestKey;');
    expect(code).toContain('await getCognitiveProfile(identityRef)');
    // The bare forms must not return.
    expect(code).not.toMatch(/getCognitiveProfile\(\s*session\.id/);
    expect(code).not.toMatch(/getCognitiveProfile\(memberId \?\? session\.id/);
  });

  it('the guest namespace cannot collide with a member id', () => {
    // Member ids are bare UUIDs; the prefix guarantees disjointness by construction.
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuid.test('guest:11111111-1111-4111-8111-111111111111')).toBe(false);
  });

  it('body userId never independently selects a member', () => {
    // `userId` may be destructured (it is a claim) but must not reach a member-scoped call.
    expect(code).not.toMatch(/loadRecent\w+\(userId/);
    expect(code).not.toMatch(/getCognitiveProfile\(userId/);
    expect(code).not.toMatch(/memberId:\s*userId\b/);
  });
});
