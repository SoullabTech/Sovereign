/**
 * AUTH-BOUNDARY-01B — signed access context, crypto-level adversarial proof.
 *
 * The invariant: a caller must not be able to manufacture `sub`, `roles`, `tier`
 * or `exp`. Every case below tampers with exactly one of those and asserts the
 * context is refused — and refused for the RIGHT reason, so a test cannot pass
 * because something unrelated broke.
 */
import {
  signAccessContext,
  verifyAccessContext,
  ACCESS_CONTEXT_VERSION,
  compatWindowOpen,
} from '../accessContext';

const SECRET = 'test-secret-at-least-32-characters-long!!';
const OTHER_SECRET = 'a-completely-different-secret-32-chars!!!';

const b64url = {
  enc: (s: string) => Buffer.from(s, 'utf8').toString('base64url'),
  dec: (s: string) => Buffer.from(s, 'base64url').toString('utf8'),
};

/** Rewrite the payload of a signed token WITHOUT re-signing it. */
function tamper(token: string, mutate: (p: Record<string, unknown>) => void): string {
  const [body, sig] = token.split('.');
  const payload = JSON.parse(b64url.dec(body));
  mutate(payload);
  return `${b64url.enc(JSON.stringify(payload))}.${sig}`;
}

beforeEach(() => {
  process.env.AUTH_CONTEXT_SECRET = SECRET;
  delete process.env.AUTH_CONTEXT_COMPAT_UNTIL;
});

describe('signed access context · legitimate path', () => {
  it('round-trips a server-issued context', async () => {
    const token = await signAccessContext({ sub: 'member-1', roles: ['admin'], tier: 'pro' });
    expect(token).toBeTruthy();
    const result = await verifyAccessContext(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.sub).toBe('member-1');
      expect(result.payload.roles).toEqual(['admin']);
      expect(result.payload.tier).toBe('pro');
      expect(result.payload.ver).toBe(ACCESS_CONTEXT_VERSION);
      expect(result.payload.exp).toBeGreaterThan(result.payload.iat);
    }
  });

  it('defaults empty roles to member rather than to nothing', async () => {
    const token = await signAccessContext({ sub: 'm', roles: [], tier: '' });
    const result = await verifyAccessContext(token);
    expect(result.ok && result.payload.roles).toEqual(['member']);
    expect(result.ok && result.payload.tier).toBe('free');
  });
});

describe('signed access context · tampering is refused', () => {
  it('refuses a payload whose roles were modified', async () => {
    const token = (await signAccessContext({ sub: 'm', roles: ['member'], tier: 'free' }))!;
    const forged = tamper(token, (p) => { p.roles = ['admin']; });
    expect(await verifyAccessContext(forged)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('refuses a payload whose tier was modified', async () => {
    const token = (await signAccessContext({ sub: 'm', roles: ['member'], tier: 'free' }))!;
    const forged = tamper(token, (p) => { p.tier = 'pro'; });
    expect(await verifyAccessContext(forged)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('refuses a payload whose sub was modified — no impersonation by edit', async () => {
    const token = (await signAccessContext({ sub: 'me', roles: ['member'], tier: 'free' }))!;
    const forged = tamper(token, (p) => { p.sub = 'someone-else'; });
    expect(await verifyAccessContext(forged)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('refuses an extended exp — a forged expiry cannot buy a longer life', async () => {
    const token = (await signAccessContext({ sub: 'm', roles: ['member'], tier: 'free' }))!;
    const forged = tamper(token, (p) => { p.exp = Math.floor(Date.now() / 1000) + 99999999; });
    expect(await verifyAccessContext(forged)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('refuses a wholly fabricated token', async () => {
    const fabricated = `${b64url.enc(JSON.stringify({
      sub: 'm', roles: ['admin'], tier: 'pro',
      iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
      ver: ACCESS_CONTEXT_VERSION,
    }))}.${b64url.enc('not-a-real-signature')}`;
    expect(await verifyAccessContext(fabricated)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('refuses a context signed with a different secret', async () => {
    process.env.AUTH_CONTEXT_SECRET = OTHER_SECRET;
    const foreign = (await signAccessContext({ sub: 'm', roles: ['admin'], tier: 'pro' }))!;
    process.env.AUTH_CONTEXT_SECRET = SECRET;
    expect(await verifyAccessContext(foreign)).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('refuses an expired context', async () => {
    const token = (await signAccessContext({ sub: 'm', roles: ['admin'], tier: 'pro', ttlSeconds: -1 }))!;
    expect(await verifyAccessContext(token)).toEqual({ ok: false, reason: 'expired' });
  });

  it('refuses a version the server no longer issues', async () => {
    // Signed properly at a stale version: signature is valid, context is not.
    // Proves `ver` is a real kill switch and not decoration.
    const token = (await signAccessContext({ sub: 'm', roles: ['admin'], tier: 'pro' }))!;
    const [body] = token.split('.');
    const payload = JSON.parse(b64url.dec(body));
    payload.ver = ACCESS_CONTEXT_VERSION + 1;
    const rebody = b64url.enc(JSON.stringify(payload));
    // Re-sign so ONLY the version is wrong.
    const { subtle } = globalThis.crypto;
    const key = await subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = new Uint8Array(await subtle.sign('HMAC', key, new TextEncoder().encode(rebody)));
    const resigned = `${rebody}.${Buffer.from(sig).toString('base64url')}`;
    expect(await verifyAccessContext(resigned)).toEqual({ ok: false, reason: 'wrong_version' });
  });

  it('refuses malformed input rather than throwing', async () => {
    expect(await verifyAccessContext('')).toEqual({ ok: false, reason: 'absent' });
    expect(await verifyAccessContext(null)).toEqual({ ok: false, reason: 'absent' });
    expect(await verifyAccessContext('no-dot')).toEqual({ ok: false, reason: 'malformed' });
    expect(await verifyAccessContext('.leadingdot')).toEqual({ ok: false, reason: 'malformed' });
    expect(await verifyAccessContext('trailingdot.')).toEqual({ ok: false, reason: 'malformed' });
  });
});

describe('signed access context · secret handling fails closed', () => {
  it('issues nothing when no secret is configured', async () => {
    delete process.env.AUTH_CONTEXT_SECRET;
    expect(await signAccessContext({ sub: 'm', roles: ['admin'], tier: 'pro' })).toBeNull();
  });

  it('treats a short secret as no secret — a short secret is not a secret', async () => {
    process.env.AUTH_CONTEXT_SECRET = 'too-short';
    expect(await signAccessContext({ sub: 'm', roles: ['admin'], tier: 'pro' })).toBeNull();
  });

  it('verifies nothing when no secret is configured, even a genuine token', async () => {
    const token = (await signAccessContext({ sub: 'm', roles: ['member'], tier: 'free' }))!;
    delete process.env.AUTH_CONTEXT_SECRET;
    expect(await verifyAccessContext(token)).toEqual({ ok: false, reason: 'no_secret' });
  });
});

describe('compatibility window is bounded', () => {
  it('is open before the retirement instant and closed after', () => {
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = '2030-01-01T00:00:00Z';
    expect(compatWindowOpen(new Date('2029-12-31T00:00:00Z'))).toBe(true);
    expect(compatWindowOpen(new Date('2030-01-02T00:00:00Z'))).toBe(false);
  });

  it('treats an unparseable retirement date as CLOSED, never as forever', () => {
    process.env.AUTH_CONTEXT_COMPAT_UNTIL = 'whenever';
    expect(compatWindowOpen(new Date('2026-01-01T00:00:00Z'))).toBe(false);
  });
});
