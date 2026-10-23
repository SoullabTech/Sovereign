#!/usr/bin/env node
/**
 * ASTROLOGY-BETA-RELEASE-PROBE — zero-credential, read-only acceptance checks.
 *
 * Usage: node scripts/ops/astrology-beta-release-probe.mjs
 * Optional: ASTROLOGY_BASE_URL=https://staging.soullab.life
 *
 * Does not log body content, use member credentials, create records, or
 * infer authenticated Free/Pro acceptance. That requires an approved
 * two-member browser walkthrough after the source and release gates.
 */
const baseUrl = new URL(process.env.ASTROLOGY_BASE_URL || 'https://soullab.life');
const betaOrigin = 'https://beta.soullab.life';
const hostileOrigin = 'https://not-soullab.example';
if (baseUrl.protocol !== 'https:' && !(baseUrl.protocol === 'http:' && ['localhost','127.0.0.1'].includes(baseUrl.hostname))) {
  throw new Error('Require HTTPS origin (or explicit loopback test server)');
}
if (baseUrl.pathname !== '/' || baseUrl.search || baseUrl.hash || baseUrl.username || baseUrl.password) {
  throw new Error('ASTROLOGY_BASE_URL must be a bare origin');
}

const tests = [
  {
    title: 'Astrology page delivered',
    path: '/astrology',
    status: 200,
    contentType: /text\/html/,
  },
  {
    title: 'Profile denies anonymous identity',
    path: '/api/members/profile',
    status: 401,
    contentType: /application\/json/,
  },
  {
    title: 'Identity-free natal calculator route reachable',
    path: '/api/astrology/birth-chart',
    status: 200,
    contentType: /application\/json/,
  },
  {
    title: 'Saved relationship analyses deny anonymous identity',
    path: '/api/astrology/synastry/saved',
    status: 401,
  },
  {
    title: 'Individual relationship analyses deny anonymous identity',
    path: '/api/astrology/synastry/list?analysisId=00000000-0000-4000-8000-000000000000',
    status: 401,
  },
  {
    title: 'Vedic workstation API denies anonymous identity',
    path: '/api/astrology/vedic/list',
    status: 401,
  },
  ...[
    '/api/members/profile',
    '/api/astrology/birth-chart',
    '/api/astrology/synastry/list',
    '/api/astrology/synastry/save',
  ].map(path => ({
    title: 'Beta Origin preflight ' + path,
    path,
    status: 204,
    method: 'OPTIONS',
    origin: betaOrigin,
    expectedCors: betaOrigin,
  })),
  {
    title: 'Hostile Origin cannot obtain credentialed CORS permission',
    path: '/api/astrology/synastry/save',
    status: 403,
    method: 'OPTIONS',
    origin: hostileOrigin,
    forbiddenCors: hostileOrigin,
  },
];

let failed = 0;
for (const test of tests) {
  const headers = test.method === 'OPTIONS' ? {
    Origin: test.origin,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,x-session-token',
  } : {};
  let result = '';
  let ok = false;
  try {
    const response = await fetch(new URL(test.path, baseUrl), {
      method: test.method || 'GET',
      headers,
      credentials: 'omit',
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    const allowOrigin = response.headers.get('access-control-allow-origin');
    const credentials = response.headers.get('access-control-allow-credentials');
    const ctype = response.headers.get('content-type') || '';
    ok = response.status === test.status &&
      (!test.contentType || test.contentType.test(ctype)) &&
      (!test.expectedCors || (allowOrigin === test.expectedCors && credentials === 'true')) &&
      (!test.forbiddenCors || (allowOrigin !== test.forbiddenCors && allowOrigin !== '*'));
    result = 'HTTP ' + response.status;
    if (test.expectedCors) result += ', beta CORS ' + (allowOrigin === betaOrigin ? 'present' : 'missing');
  } catch (error) {
    result = error instanceof Error ? error.name : 'request-failed';
  }
  if (!ok) failed++;
  process.stdout.write((ok ? 'PASS ' : 'FAIL ') + test.title + ' — ' + result + '\n');
}
process.stdout.write('Astrology read-only checks: ' + (tests.length - failed) + '/' + tests.length + ' passed\n');
if (failed) {
  process.stderr.write('Release smoke did not pass. Do not declare beta access repaired.\n');
  process.exitCode = 1;
}
