import {
  AuthOriginError,
  isSameOriginAuthMutation,
  normalizeReturnDestination,
  requireSameOriginAuthMutation,
} from '../returnDestination';

function request(origin: string | null, site: string | null = 'same-origin', url = 'https://soullab.life/signup') {
  const headers = new Map<string, string>();
  if (origin !== null) headers.set('origin', origin);
  if (site !== null) headers.set('sec-fetch-site', site);
  return {
    url,
    nextUrl: { origin: new URL(url).origin },
    headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null },
  };
}

describe('AUTH-RETURN-01 return destination', () => {
  test.each([
    ['/writers-studio?work=fiction#write', '/writers-studio?work=fiction#write'],
    ['/home', '/home'],
    ['https://evil.invalid/take-me', '/home'],
    ['//evil.invalid/take-me', '/home'],
    ['/\\evil.invalid', '/home'],
    ['/%2f%2fevil.invalid', '/home'],
    ['/home\u0000evil', '/home'],
    ['', '/home'],
    [null, '/home'],
  ])('normalizes %p', (candidate, expected) => {
    expect(normalizeReturnDestination(candidate)).toBe(expected);
  });

  it('uses only a safe fallback', () => {
    expect(normalizeReturnDestination('nope', '//evil.invalid')).toBe('/home');
  });
});

describe('AUTH-RETURN-01 mutation origin', () => {
  beforeEach(() => { delete process.env.AUTH_ALLOWED_ORIGINS; });

  it('accepts the exact request origin', () => {
    expect(isSameOriginAuthMutation(request('https://soullab.life'))).toBe(true);
  });

  it('refuses cross-origin and opaque browser origins', () => {
    expect(isSameOriginAuthMutation(request('https://evil.invalid'))).toBe(false);
    expect(isSameOriginAuthMutation(request('null'))).toBe(false);
  });

  it('refuses Fetch Metadata cross-site even without Origin', () => {
    expect(isSameOriginAuthMutation(request(null, 'cross-site'))).toBe(false);
  });

  it('allows a native/server caller with no Origin and no cross-site declaration', () => {
    expect(isSameOriginAuthMutation(request(null, null))).toBe(true);
  });

  it('admits an explicitly configured additional origin only', () => {
    process.env.AUTH_ALLOWED_ORIGINS = 'https://app.soullab.life, malformed';
    expect(isSameOriginAuthMutation(request('https://app.soullab.life'))).toBe(true);
    expect(isSameOriginAuthMutation(request('https://other.soullab.life'))).toBe(false);
  });

  it('throws a stable refusal type', () => {
    expect(() => requireSameOriginAuthMutation(request('https://evil.invalid'))).toThrow(AuthOriginError);
  });
});
