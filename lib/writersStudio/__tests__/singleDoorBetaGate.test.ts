import {
  isSingleDoorBetaEnabled,
  isSingleDoorPublicAsset,
  isSingleDoorBootstrap,
} from '../singleDoorBetaGate';

describe('WS single-door closed beta — fail-closed public bootstrap', () => {
  it('requires both independent server-side flags', () => {
    expect(isSingleDoorBetaEnabled('true', 'true')).toBe(true);
    for (const [restricted, door] of [
      [undefined, 'true'], ['true', undefined], ['false', 'true'],
      ['true', 'false'], ['TRUE', 'true'], ['', 'true'],
    ]) expect(isSingleDoorBetaEnabled(restricted, door)).toBe(false);
  });

  it.each([
    ['/signin', 'GET'], ['/signin', 'HEAD'],
    ['/writers-studio/beta-limited', 'GET'],
    ['/api/members/signin', 'POST'], ['/api/members/signout', 'POST'],
  ])('allows just the public bootstrap %s %s', (path, method) => {
    expect(isSingleDoorBootstrap(path, method)).toBe(true);
  });

  it.each([
    ['/signup', 'GET'], ['/home', 'GET'], ['/', 'GET'],
    ['/api/members/register', 'POST'], ['/api/members/register-email', 'POST'],
    ['/api/members/email-code', 'POST'], ['/api/members/lookup-email', 'POST'],
    ['/api/now-what/register', 'POST'], ['/api/invites', 'POST'],
    ['/api/auth/google', 'GET'], ['/api/members/session', 'GET'],
    ['/api/members/signin', 'GET'], ['/signin', 'POST'],
    ['/writers-studio', 'GET'], ['/writers-studio/a', 'GET'],
    ['/api/writers-studio/data', 'GET'], ['/api/sovereign/manuscripts/ingest', 'POST'],
    ['/api/sovereign/writers-studio/beta-access', 'GET'],
    ['/api/open/room', 'GET'], ['/api/config.js', 'GET'],
    ['/api/writers-studio/private.json', 'GET'], ['/api/members/recover', 'POST'],
    ['/admin', 'GET'], ['/api/health', 'GET'],
  ])('rejects anonymous access to %s %s', (path, method) => {
    expect(isSingleDoorBootstrap(path, method)).toBe(false);
    expect(isSingleDoorPublicAsset(path)).toBe(false);
  });

  it.each([
    '/_next/static/chunk.js', '/_next/image',
    '/favicon.ico', '/images/soullab.png', '/assets/icon.svg',
    '/fonts/serif.woff2', '/icons/maia.svg',
  ])('permits static asset %s', (path) => {
    expect(isSingleDoorPublicAsset(path)).toBe(true);
  });

  it.each([
    '/api/test.js', '/api/sovereign/private.png',
    '/api/users/avatar.svg', '/api/secret.json', '/private.docx',
    '/manifest.json', '/api/members/signin',
  ])('does not interpret endpoint as a public asset %s', (path) => {
    expect(isSingleDoorPublicAsset(path)).toBe(false);
  });
});
