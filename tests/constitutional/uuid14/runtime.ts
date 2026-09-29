#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { v4, validate, version } from 'uuid';

const deterministic = v4({ random: new Uint8Array(16) });
assert.equal(deterministic, '00000000-0000-4000-8000-000000000000');
assert.equal(validate(deterministic), true);
assert.equal(version(deterministic), 4);

const packageIds = Array.from({ length: 128 }, () => v4());
const nativeIds = Array.from({ length: 128 }, () => randomUUID());

for (const id of [...packageIds, ...nativeIds]) {
  assert.equal(validate(id), true, 'valid UUID: ' + id);
  assert.equal(version(id), 4, 'v4 UUID: ' + id);
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
}
assert.equal(new Set(packageIds).size, packageIds.length);
assert.equal(new Set(nativeIds).size, nativeIds.length);

console.log('UUID14 RUNTIME: PASS');
console.log('  deterministic v4 vector preserved');
console.log('  uuid@14 v4 outputs validate/version=4');
console.log('  node:crypto randomUUID outputs validate/version=4');
console.log('  128/128 package IDs unique');
console.log('  128/128 native IDs unique');
