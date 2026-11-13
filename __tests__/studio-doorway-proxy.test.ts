/**
 * STUDIO-A-LA-CARTE-01 Phase 4 — doorway hosts through the REAL proxy.
 * Off = today's behaviour (a doorway subdomain is still treated as a Field slug). On = `/` and `/join` rewrite to
 * public routes only; every other path keeps the normal boundary.
 */
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';
import { deriveVerifiedAccess } from '../lib/auth/verifiedAccess';

jest.mock('../lib/auth/verifiedAccess', () => ({ deriveVerifiedAccess: jest.fn() }));
const verified = deriveVerifiedAccess as jest.MockedFunction<typeof deriveVerifiedAccess>;

function request(host: string, pathname: string): NextRequest {
  return new NextRequest(`https://${host}${pathname}`, { headers: { host } });
}
const rewriteOf = (r: Response) => {
  const v = r.headers.get('x-middleware-rewrite');
  return v ? new URL(v).pathname : null;
};

const saved = process.env.STUDIO_DOORWAYS_ENABLED;
beforeEach(() => {
  jest.resetAllMocks();
  verified.mockResolvedValue({ authenticated: false } as never);
});
afterAll(() => {
  if (saved === undefined) delete process.env.STUDIO_DOORWAYS_ENABLED;
  else process.env.STUDIO_DOORWAYS_ENABLED = saved;
});

describe('switch off (default)', () => {
  beforeEach(() => { delete process.env.STUDIO_DOORWAYS_ENABLED; });
  it('⭐ behaves exactly as before: writer.soullab.life/ is a Field page rewrite', async () => {
    expect(rewriteOf(await proxy(request('writer.soullab.life', '/')))).toBe('/fields/writer');
  });
  it('/join is not a doorway', async () => {
    expect(rewriteOf(await proxy(request('sound.soullab.life', '/join')))).toBe('/fields/sound/join');
  });
});

describe('switch on', () => {
  beforeEach(() => { process.env.STUDIO_DOORWAYS_ENABLED = 'true'; });

  it('/ lands on each Studio’s public preview', async () => {
    expect(rewriteOf(await proxy(request('writer.soullab.life', '/')))).toBe('/explore/writers-studio');
    expect(rewriteOf(await proxy(request('sound.soullab.life', '/')))).toBe('/explore/sound-resonance');
    expect(rewriteOf(await proxy(request('guide.soullab.life', '/')))).toBe('/explore/pro-studio');
    expect(rewriteOf(await proxy(request('astrology.soullab.life', '/')))).toBe('/explore/astrology-pro');
  });

  it('/join opens the invitation sign-up', async () => {
    expect(rewriteOf(await proxy(request('guide.soullab.life', '/join')))).toBe('/doorway/guide');
  });

  it('⭐ a doorway host is never a Field page, and gated paths stay gated', async () => {
    const res = await proxy(request('writer.soullab.life', '/writers-studio'));
    expect(rewriteOf(res)).toBeNull();
    expect(res.status).not.toBe(200);
  });

  it('Field subdomains are unchanged', async () => {
    expect(rewriteOf(await proxy(request('jondi.soullab.life', '/')))).toBe('/fields/jondi');
  });
});
