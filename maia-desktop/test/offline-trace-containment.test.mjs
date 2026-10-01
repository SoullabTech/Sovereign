import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const uploadRoute = fs.readFileSync(
  path.join(repoRoot, 'app/api/supervision/upload/route.ts'),
  'utf8',
);
const verifyPackage = fs.readFileSync(
  path.join(repoRoot, 'maia-desktop/scripts/verify-package.mjs'),
  'utf8',
);

test('supervision upload storage path does not make NFT trace the repository root', () => {
  assert.doesNotMatch(uploadRoute, /path\.join\(process\.cwd\(\),\s*STORAGE_DIR/);
  assert.match(uploadRoute, /path\.join\(process\.cwd\(\),\s*'storage',\s*'supervision'\)/);
  assert.match(uploadRoute, /path\.join\(STORAGE_DIR,\s*session\.id\)/);
});

test('external beta verifier fails closed on unexpected Cabin root entries', () => {
  assert.match(verifyPackage, /allowedCabinRootEntries/);
  assert.match(verifyPackage, /unexpected cabin-runtime root entry/);
  assert.match(verifyPackage, /\.git/);
});
