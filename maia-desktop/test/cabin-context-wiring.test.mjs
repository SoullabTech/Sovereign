import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.basename(process.cwd()) === 'maia-desktop'
  ? path.join(process.cwd(), '..')
  : process.cwd();

function read(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), 'utf8');
}

test('Desktop passes the Context Package artifact path into the local runtime', () => {
  const source = read('maia-desktop/src/main.js');

  assert.match(source, /MAIA_CABIN_CONTEXT_PACKAGE_PATH/);
  assert.match(source, /resolveCabinContextPackagePath/);
  assert.match(source, /cabinContextPackagePath/);
});

test('Cabin health makes Context Package custody part of runtime readiness', () => {
  const source = read('app/api/cabin/health/route.ts');

  assert.match(source, /initializeCabinContextMount/);
  assert.match(source, /cabin_context_unavailable/);
  assert.match(source, /context: context\.state/);
});

test('Context endpoint is offline-only and requires an existing Cabin session', () => {
  const source = read('app/api/cabin/context/route.ts');

  assert.match(source, /MAIA_CABIN_MODE !== 'offline'/);
  assert.match(source, /resolveSession/);
  assert.match(source, /cabin_session_required/);
  assert.match(source, /cabinContextSnapshot/);
  assert.doesNotMatch(source, /setCabinSessionCookie/);
});

test('Context runtime never writes the package artifact or browser storage', () => {
  const source = read('lib/cabin/contextRuntime.ts');

  assert.doesNotMatch(source, /writeFile|writeFileSync|appendFile|unlink|rmSync/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/);
});

test('Cabin health and context have explicit Proxy access-matrix entries', () => {
  const source = read('config/accessMatrix.ts');

  assert.match(source, /exact: '\/api\/cabin\/health'/);
  assert.match(source, /exact: '\/api\/cabin\/context'/);
  assert.match(source, /maia_cabin_session/);
});
