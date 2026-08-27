/**
 * AUTH-BOUNDARY-01 — `getAccessContext()` must not read authority from any
 * request header.
 *
 * SCOPE HONESTY: this module has ZERO callers today (no `route.ts` imports
 * `security/requireAccess`). These cases therefore guard a LATENT vector, not a
 * live one. They exist because the module is a ready-made guard that reads as
 * safe — the next route to adopt it would have inherited:
 *
 *   x-access-tier / x-access-roles   preferred above every other source
 *   x-maia-tier / x-maia-roles       client headers, read as entitlements
 *   x-member-id                      presence = authenticated, value = identity
 *
 * `x-access-*` is the sharpest of these. Middleware stamps those names onto the
 * RESPONSE, never onto the forwarded request, so the only way one arrives here
 * is from the caller — and the preserved Caddy containment
 * (EDGE-SECURITY-CUSTODY-01) stripped `X-Maia-*` but never `x-access-*`. The
 * edge would not have covered it even while enforced.
 */
import { NextRequest } from 'next/server';
import { getAccessContext } from '../requireAccess';

function request(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('https://soullab.life/api/anything', {
    headers: { host: 'soullab.life', ...headers },
  });
}

describe('getAccessContext · headers carry no authority', () => {
  it('does not treat a bare x-member-id as authentication or identity', () => {
    const ctx = getAccessContext(request({ 'x-member-id': '88099bb1-977c-4c1e-9f3a-000000000000' }));
    expect(ctx.authenticated).toBe(false);
    expect(ctx.memberId).toBeNull();
  });

  it('ignores x-access-roles / x-access-tier from the request', () => {
    const ctx = getAccessContext(request({ 'x-access-roles': 'admin', 'x-access-tier': 'pro' }));
    expect(ctx.roles).toEqual(['member']);
    expect(ctx.tier).toBe('free');
  });

  it('ignores x-maia-roles / x-maia-tier from the request', () => {
    const ctx = getAccessContext(request({ 'x-maia-roles': 'admin,steward', 'x-maia-tier': 'pro' }));
    expect(ctx.roles).toEqual(['member']);
    expect(ctx.tier).toBe('free');
  });

  it('still reads the server-issued cookies, so adopting it loses nothing', () => {
    // Named limit, not a claim of sufficiency: a cookie is server-ISSUED but not
    // server-VERIFIED on arrival. `httpOnly` stops browser JS, not a non-browser
    // client sending its own `Cookie:` line. Signing the context is the other
    // half of this repair and is not claimed here.
    const ctx = getAccessContext(
      request({ cookie: `maia_session=server-issued; maia_roles=${encodeURIComponent('["admin"]')}; maia_tier=pro` })
    );
    expect(ctx.authenticated).toBe(true);
    expect(ctx.roles).toEqual(['admin']);
    expect(ctx.tier).toBe('pro');
  });
});
