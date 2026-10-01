import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CABIN_CONTEXT_PACKAGE_SCHEMA,
  ENV_KEY,
  inspectCabinContextArtifact,
} from '../src/cabin-context-status.js';

function env(path) {
  return { [ENV_KEY]: path };
}

test('H3.6 reports not configured without an artifact path', () => {
  const result = inspectCabinContextArtifact({ env: {} });
  assert.equal(result.state, 'NOT_CONFIGURED');
  assert.equal(result.path, null);
});

test('H3.6 reports a missing explicitly configured artifact', () => {
  const result = inspectCabinContextArtifact({
    env: env('/tmp/missing-context-package.json'),
    exists: () => false,
  });

  assert.equal(result.state, 'MISSING');
  assert.equal(result.path, '/tmp/missing-context-package.json');
});

test('H3.6 reports schema posture without exposing package contents', () => {
  const bytes = Buffer.from(JSON.stringify({
    schema: CABIN_CONTEXT_PACKAGE_SCHEMA,
    scope: 'member',
    works: [{
      work: { title: 'Private manuscript title' },
    }],
  }));

  const result = inspectCabinContextArtifact({
    env: env('/tmp/context-package.json'),
    exists: () => true,
    stat: () => ({ size: bytes.length, mtime: new Date('2026-09-30T21:00:00.000Z') }),
    readFile: () => bytes,
  });

  assert.equal(result.state, 'PRESENT_UNVERIFIED');
  assert.equal(result.schema, CABIN_CONTEXT_PACKAGE_SCHEMA);
  assert.equal(result.bytes, bytes.length);
  assert.match(result.sha256, /^[0-9a-f]{64}$/);
  assert.equal(result.modified_at, '2026-09-30T21:00:00.000Z');

  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /Private manuscript title/);
  assert.doesNotMatch(serialized, /memberId/);
});

test('H3.6 does not claim full H2.5 validity', () => {
  const bytes = Buffer.from(JSON.stringify({
    schema: CABIN_CONTEXT_PACKAGE_SCHEMA,
    unexpected: 'smuggled',
  }));

  const result = inspectCabinContextArtifact({
    env: env('/tmp/context-package.json'),
    exists: () => true,
    stat: () => ({ size: bytes.length, mtime: new Date() }),
    readFile: () => bytes,
  });

  assert.equal(result.state, 'PRESENT_UNVERIFIED');
  assert.equal(result.custody_authority, 'Cabin H2.5 strict parser');
});

test('H3.6 distinguishes malformed JSON', () => {
  const bytes = Buffer.from('{not-json');

  const result = inspectCabinContextArtifact({
    env: env('/tmp/context-package.json'),
    exists: () => true,
    stat: () => ({ size: bytes.length, mtime: new Date() }),
    readFile: () => bytes,
  });

  assert.equal(result.state, 'MALFORMED_JSON');
  assert.equal(result.schema, null);
});

test('H3.6 distinguishes a wrong package schema', () => {
  const bytes = Buffer.from(JSON.stringify({
    schema: 'other.package.v1',
  }));

  const result = inspectCabinContextArtifact({
    env: env('/tmp/context-package.json'),
    exists: () => true,
    stat: () => ({ size: bytes.length, mtime: new Date() }),
    readFile: () => bytes,
  });

  assert.equal(result.state, 'WRONG_SCHEMA');
  assert.equal(result.schema, 'other.package.v1');
});

test('H3.6 rejects relative host paths instead of resolving them implicitly', () => {
  const result = inspectCabinContextArtifact({
    env: env('context-package.json'),
    exists: () => {
      throw new Error('exists must not be called for relative paths');
    },
  });

  assert.equal(result.state, 'NOT_CONFIGURED');
  assert.equal(result.path, null);
});

test('H3.6 has no write, network, watcher, or content-returning seam', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src', 'cabin-context-status.js'),
    'utf8',
  );

  assert.doesNotMatch(source, /writeFile|rename|appendFile|unlink|rmSync/);
  assert.doesNotMatch(source, /fetch\(|https?:\/\//);
  assert.doesNotMatch(source, /watch\(|setInterval|setTimeout/);
  assert.doesNotMatch(source, /body|title|relationships|memories|works\s*:/);
});
