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

test('Cabin startup never runs the PostgreSQL schema witness', () => {
  const source = read('instrumentation.ts');

  assert.match(source, /MAIA_CABIN_MODE === 'offline'/);
  assert.match(source, /PostgreSQL startup check skipped/);
});

test('PostgreSQL schema readiness fails closed in Cabin mode', () => {
  const source = read('lib/db/schemaGate.ts');

  assert.match(source, /MAIA_CABIN_MODE === 'offline'/);
  assert.match(source, /CABIN_POSTGRES_DISABLED/);
});

test('live MAIA cognition cannot silently fall through to PostgreSQL', () => {
  for (const file of [
    'app/api/sovereign/app/maia/route.ts',
    'app/api/sovereign/app/maia/list/route.ts',
  ]) {
    const source = read(file);
    assert.match(source, /MAIA_CABIN_MODE === 'offline'/);
    assert.match(source, /CABIN_COGNITION_NOT_LOCAL/);
  }
});

test('Desktop supplies one durable Cabin data path to the local runtime', () => {
  const source = read('maia-desktop/src/main.js');

  assert.match(source, /MAIA_CABIN_DATA_PATH/);
  assert.match(source, /app\.getPath\('userData'\)/);
  assert.match(source, /cabin.*cabin\.sqlite/);
});

test('the inhabited data routes use the local authority in Cabin mode', () => {
  const routes = [
    'app/api/members/me/route.ts',
    'app/api/members/session/route.ts',
    'app/api/house/preferences/route.ts',
    'app/api/sovereign/living-works/route.ts',
    'app/api/sovereign/living-works/[id]/route.ts',
    'app/api/sovereign/living-works/[id]/expressions/route.ts',
    'app/api/sovereign/manuscripts/route.ts',
    'app/api/sovereign/manuscripts/[id]/route.ts',
  ];

  for (const file of routes) {
    const source = read(file);
    assert.match(source, /MAIA_CABIN_MODE === 'offline'/);

    if (file === 'app/api/members/me/route.ts' || file === 'app/api/members/session/route.ts') {
      assert.match(source, /CabinLocalStore/);
    } else {
      assert.match(source, /cabinStore/);
      assert.match(source, /cabinMemberFromRequest/);
    }
  }
});
