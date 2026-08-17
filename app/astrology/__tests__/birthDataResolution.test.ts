import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Astrology birth-data resolution — identity contract guard.
 *
 * THE DEFECT THIS GUARDS AGAINST (2026-08-16):
 * `/astrology` performed its server-authoritative profile lookup only when a
 * CLIENT-derived member id existed in `localStorage.beta_user`:
 *
 *     const memberId = storedUser ? JSON.parse(storedUser)?.id : null;
 *     if (memberId) { fetch(apiUrl(`/api/members/profile?id=${memberId}`)) }
 *
 * `/api/members/profile` resolves the member from a verified session credential
 * (`maia_session` cookie / `x-session-token`, validated against `auth_sessions`)
 * and IGNORES the `?id=` param entirely. So the client value had NO authority
 * over the answer — only over whether the question was asked. A missing or stale
 * `beta_user` therefore suppressed the authoritative lookup and presented an
 * authenticated member with birth data as "no birth data".
 *
 * This is a SOURCE-CONTRACT test, in the idiom of
 * `lib/navigation/__tests__/houseNavDrift.test.ts`: the surface is a ~1500-line
 * client page with no extracted resolver, so the invariant is asserted against
 * the source rather than by rendering. It is deliberately narrow — it encodes
 * the identity contract, not the page's behaviour.
 *
 * SERVER-SIDE cases are covered elsewhere and are NOT duplicated here:
 *   - divergent claim rejected, no substitution
 *       → lib/auth/__tests__/getMemberFromRequest.test.ts
 *         'valid session + mismatched x-member-id claim is rejected'
 *   - session/token transport resolves the member
 *       → same file, 'LEGIT WEB' / 'LEGIT iOS/Safari'
 *   - body-supplied identity never trusted
 *       → app/api/sovereign/app/maia/list/__tests__/resolveIdentity.test.ts
 */

const PAGE = readFileSync(join(process.cwd(), 'app/astrology/page.tsx'), 'utf8');

/**
 * Page source with `//` line comments stripped.
 *
 * Ordering assertions MUST run against this, not against PAGE: the comments
 * explaining these guards legitimately name the very tokens being guarded
 * (e.g. a comment reading "...caches (beta_user.birthData, birthChartData)"
 * contains the substring `user.birthData`), so an index comparison over raw
 * source measures prose position, not code position.
 */
const CODE = PAGE.replace(/^\s*\/\/.*$/gm, '');

describe('astrology birth-data resolution — identity contract', () => {
  // Case 1 + 2: authenticated member with NO / STALE beta_user.
  // The authoritative request must occur regardless of client cache state.
  it('does not derive a member id from beta_user to gate the profile lookup', () => {
    expect(PAGE).not.toMatch(/const\s+memberId\s*=\s*storedUser\s*\?/);
    expect(PAGE).not.toMatch(/if\s*\(\s*memberId\s*\)\s*\{/);
  });

  it('never sends a client-supplied id to the profile route', () => {
    // The route ignores it; transmitting it invites the reader to believe it
    // selects the member, which it does not.
    expect(PAGE).not.toMatch(/members\/profile\?id=/);
  });

  it('requests the authenticated profile unconditionally', () => {
    expect(PAGE).toContain("apiFetch('/api/members/profile')");
  });

  // Case 5: canonical auth transport. apiFetch attaches x-session-token on
  // Safari/Capacitor, where cookie transport may be unavailable; a plain
  // same-origin fetch would arrive unauthenticated there.
  it('uses the canonical authenticated transport for the member-scoped call', () => {
    expect(PAGE).not.toMatch(/fetch\(\s*apiUrl\(\s*`?\/api\/members\/profile/);
    expect(PAGE).toMatch(/import\s*\{[^}]*\bapiFetch\b[^}]*\}\s*from\s*'@\/lib\/http\/apiBase'/);
  });

  // Case 4 + 6: fallback and ordinary web path must survive. The repair removes
  // the GATE, not the fallback — a member with genuinely absent birth data must
  // still reach the legitimate empty state.
  it('resolves member birth data from the server alone — no cache fallback', () => {
    // Both former fallbacks failed the provenance test: birthChartData carries
    // no member id and survives sign-out; beta_user carries one but cannot be
    // verified against the session without the very call that would answer.
    // The loader must therefore never read either to resolve birth data.
    const loader = CODE.slice(CODE.indexOf('const loadChartData'), CODE.indexOf('const calculateElementalBalance'));
    expect(loader).not.toContain("localStorage.getItem('beta_user')");
    expect(loader).not.toContain("localStorage.getItem('birthChartData')");
    expect(loader).not.toContain('user.birthData');
  });

  // CALCULATOR CONTRACT: /api/astrology/birth-chart and /current-transits carry
  // no identity, auth, or member-scope references — they are deterministic
  // calculators over supplied birthData.
  //
  //   MUST     resolve through apiUrl(), so Capacitor reaches
  //            https://soullab.life/api/... instead of capacitor://localhost
  //            (a relative fetch there returns SPA fallback HTML and res.json()
  //            throws — the defect that opened this repair).
  //   MUST NOT use apiFetch(), which on native attaches x-session-token,
  //            x-member-id and x-maia-anon-id. That would give an identity-free
  //            calculator member/session semantics it has no business holding,
  //            and would couple it to the credential-header CORS problem being
  //            repaired separately under T0-C.
  //
  // Member-scoped and profile calls go the other way: those MUST use apiFetch.
  // This still guards against a later sweep that "makes everything
  // authenticated" — it now also guards the opposite error of leaving a bare
  // relative path that cannot resolve on device.
  it('routes the calculators through apiUrl, never apiFetch', () => {
    expect(PAGE).toMatch(/fetch\(apiUrl\('\/api\/astrology\/birth-chart'\)/);
    expect(PAGE).toMatch(/fetch\(apiUrl\('\/api\/astrology\/current-transits'\)/);
    expect(PAGE).not.toMatch(/apiFetch\('\/api\/astrology\/birth-chart'/);
    expect(PAGE).not.toMatch(/apiFetch\('\/api\/astrology\/current-transits'/);
    // No bare relative calculator call may survive — that is the device defect.
    expect(PAGE).not.toMatch(/fetch\('\/api\/astrology\/(birth-chart|current-transits)'/);
  });
});

/**
 * NEGATIVE CONTROL B — an authoritative identity rejection must not be undone
 * locally.
 *
 * `getMemberIdFromRequest` deliberately HARD-FAILS when a client identity claim
 * diverges from the verified session: it returns null rather than preferring
 * either side, and the route answers 401. That protection is worthless if the
 * client then reads `beta_user.birthData` or the cached `birthChartData` and
 * renders a chart anyway — one member's birth field would appear under another
 * member's session, with the server having explicitly refused to confirm them.
 *
 * The pre-repair page did exactly that: a 401 simply fell out of the
 * `if (profileRes.ok)` block and landed in the localStorage branches.
 *
 * The distinction being enforced is narrow and deliberate:
 *   401 / 403  → the server WILL NOT SAY who you are  → no local identity fallback
 *   network / 503 → the server COULD NOT ANSWER        → cached fallback still allowed
 * Unavailability is not a statement about identity.
 */
describe('astrology birth-data resolution — the authoritative lookup is terminal', () => {
  it('marks the member established ONLY on a positive server answer', () => {
    // Set inside `if (profileRes.ok)`, after parsing — never in the catch, and
    // never on a status-only check.
    expect(CODE).toMatch(/if\s*\(profileRes\.ok\)\s*\{[\s\S]{0,300}?memberEstablished\s*=\s*true/);
    const catchBlock = CODE.slice(CODE.indexOf('} catch (profileErr)'), CODE.indexOf('if (!memberEstablished)'));
    expect(catchBlock).not.toMatch(/memberEstablished\s*=\s*true/);
  });

  it('refuses the unbound local cache whenever the member is not established', () => {
    // Must RETURN, not merely log. Covers 401/403, 5xx, transport failure.
    expect(CODE).toMatch(/if\s*\(!memberEstablished\)\s*\{[\s\S]{0,600}?\breturn;/);
  });

  it('reaches the guard before the loader can return any chart', () => {
    const loader = CODE.slice(CODE.indexOf('const loadChartData'), CODE.indexOf('const calculateElementalBalance'));
    const guard = loader.indexOf('if (!memberEstablished)');
    expect(guard).toBeGreaterThan(-1);
    // Every setChartData in the loader must sit inside the authoritative branch,
    // i.e. BEFORE the guard — nothing after it may produce a chart.
    const afterGuard = loader.slice(guard);
    expect(afterGuard).not.toContain('setChartData(');
    expect(afterGuard).not.toContain('setHasBirthData(true)');
  });

  it('permits the post-render cache read only downstream of an authoritative render', () => {
    // handleHouseSystemChange re-reads birthChartData, but is guarded by
    // `if (!chartData ...) return`, and chartData can now only originate from the
    // authoritative path — which overwrites that cache before rendering. The
    // read is therefore of the established member's own chart, not a stale one.
    const handler = CODE.slice(CODE.indexOf('const handleHouseSystemChange'));
    expect(handler).toMatch(/if\s*\(!chartData[^)]*\)\s*return;/);
  });

  it('treats an established member with no birth data as terminal too', () => {
    // The server naming the member and saying "no birth data" is AUTHORITATIVE
    // and outranks a cache — otherwise a member the server says has none would
    // be shown whatever chart the browser happens to be holding.
    const afterGuard = CODE.slice(CODE.indexOf('if (!memberEstablished)'));
    expect(afterGuard).toMatch(/setHasBirthData\(false\);[\s\S]{0,120}?setLoading\(false\);[\s\S]{0,40}?return;/);
  });

  it('keeps UNAVAILABLE distinct from ABSENT in state and in render', () => {
    expect(CODE).toMatch(/setUnresolvedReason\(/);
    expect(CODE).toMatch(/unresolvedReason\s*\?/); // separate render branch
  });

  it('tells a refused identity apart from an unreachable server', () => {
    // Deterministic (401/403 → sign in) vs transient (5xx/transport → retry).
    // Offering "try again" to a signed-out person makes a permanent state look
    // transient; offering "sign in" on a 503 sends them to fix the wrong thing.
    expect(CODE).toMatch(/profileRes\.status\s*===\s*401\s*\|\|\s*profileRes\.status\s*===\s*403/);
    expect(CODE).toMatch(/authRefused\s*\?\s*'signed-out'\s*:\s*'unreachable'/);
    // The catch (transport failure) must NOT claim the identity was refused.
    const catchBlock = CODE.slice(CODE.indexOf('} catch (profileErr)'), CODE.indexOf('if (!memberEstablished)'));
    expect(catchBlock).not.toMatch(/authRefused\s*=\s*true/);
  });

  it('owns birth entry on the genuine empty state instead of routing away', () => {
    // §13 left the "Enter Birth Details" destination as a separate product
    // ruling. That ruling has since been made: genuine absence stays on
    // /astrology and renders inline birth entry. /journey is a different room,
    // not an onboarding funnel for astrology — bouncing the member there is
    // what made this page a dead end.
    expect(PAGE).not.toContain('href="/journey"');
    expect(PAGE).toContain('<BirthDataForm');
    // Entry must write through the shared save contract, so the chart is drawn
    // only after the member profile has accepted the birth data.
    expect(PAGE).toMatch(/await saveBirthData\(/);
    expect(PAGE).toMatch(/if \(!persisted\) return;/);
  });
});
