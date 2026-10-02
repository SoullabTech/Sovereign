import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CABIN_ENTRY_PATH,
  CABIN_HOST,
  DEFAULT_CABIN_PORT,
  resolveCabinPort,
  cabinOrigin,
  cabinEntryUrl,
  cabinHealthUrl,
  resolveCabinContextPackagePath,
  offlineRuntimeSpec,
  isCabinMode,
} from '../src/cabin-runtime-policy.js';

test('Cabin chooses a bounded loopback port', () => {
  assert.equal(resolveCabinPort(), DEFAULT_CABIN_PORT);
  assert.equal(resolveCabinPort('43130'), 43130);
  assert.throws(() => resolveCabinPort('not-a-port'), /integer from 1 to 65535/);
  assert.throws(() => resolveCabinPort('70000'), /integer from 1 to 65535/);
});

test('Cabin binds only to loopback', () => {
  assert.equal(CABIN_HOST, '127.0.0.1');
  assert.equal(cabinOrigin(43121), 'http://127.0.0.1:43121');
  assert.equal(cabinEntryUrl(43121), 'http://127.0.0.1:43121' + CABIN_ENTRY_PATH);
  assert.equal(cabinHealthUrl(43121), 'http://127.0.0.1:43121/api/cabin/health');
  assert.throws(() => cabinOrigin(43121, '0.0.0.0'), /loopback/);
});

test('Cabin resolves one explicit absolute context package path', () => {
  assert.equal(
    resolveCabinContextPackagePath(undefined, '/tmp/cabin/cabin.sqlite'),
    '/tmp/cabin/context-package.json',
  );
  assert.equal(
    resolveCabinContextPackagePath(
      '/tmp/explicit/context-package.json',
      '/tmp/cabin/cabin.sqlite',
    ),
    '/tmp/explicit/context-package.json',
  );
  assert.throws(
    () => resolveCabinContextPackagePath('context-package.json', '/tmp/cabin/cabin.sqlite'),
    /absolute/i,
  );
});

test('Cabin runtime spec is offline by construction', () => {
  const spec = offlineRuntimeSpec({
    port: 43121,
    entrypoint: '/runtime/server.js',
    runtimeRoot: '/runtime',
  });

  assert.equal(spec.command, process.execPath);
  assert.deepEqual(spec.args, ['/runtime/server.js']);
  assert.equal(spec.cwd, '/runtime');
  assert.equal(spec.env.PORT, '43121');
  assert.equal(spec.env.HOSTNAME, '127.0.0.1');
  assert.equal(spec.env.MAIA_CABIN_MODE, 'offline');
  assert.equal(spec.env.NEXT_PUBLIC_BUILD_MODE, 'desktop-cabin');
  assert.equal(spec.env.MAIA_BASE_URL, undefined);
});

test('Cabin mode vocabulary stays explicit', () => {
  assert.equal(isCabinMode('offline'), true);
  assert.equal(isCabinMode('connected'), true);
  assert.equal(isCabinMode('remote'), false);
});
