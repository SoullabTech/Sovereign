#!/usr/bin/env node
import {
  mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { bundleExternalContext } from '../external-context.mjs';

let passed = 0;
let failed = 0;
const assert = (name, condition, detail = '') => {
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};
const refusal = (name, fn, code) => {
  let got = '';
  try { fn(); } catch (e) { got = e.message; }
  assert(name, got === code, got);
};

const root = mkdtempSync(path.join(os.tmpdir(), 'jarvis-external-context-'));
mkdirSync(path.join(root, 'src'));
writeFileSync(path.join(root, 'src', 'allowed.ts'), 'export const allowed = true;\n');
writeFileSync(path.join(root, 'src', 'secret.ts'), 'DO NOT SEND\n');
writeFileSync(path.join(root, '.env'), 'SECRET=value\n');
writeFileSync(path.join(root, 'large.txt'), 'x'.repeat(129 * 1024));
symlinkSync(path.join(root, 'src', 'secret.ts'), path.join(root, 'src', 'link.ts'));

console.log('\n=== C1: exact allowlist only ===');
{
  const bundle = bundleExternalContext({
    packet: { allowed_files: ['src/allowed.ts'] },
    worktree: root,
  });
  assert('allowed file is bundled', bundle.includes('export const allowed = true;'));
  assert('unlisted file is absent', !bundle.includes('DO NOT SEND'));
  assert('bundle states evidence authority', bundle.includes('JARVIS selected exactly these files'));
}

console.log('\n=== C2: no-file sentinel emits no repository content ===');
{
  const bundle = bundleExternalContext({
    packet: { allowed_files: ['NO FILES — synthetic provider witness only'] },
    worktree: root,
  });
  assert('NO FILES sentinel returns empty bundle', bundle === '');
}

console.log('\n=== C3: hostile paths fail closed ===');
refusal('path escape refused',
  () => bundleExternalContext({ packet: { allowed_files: ['../outside'] }, worktree: root }),
  'PATH_ESCAPE_REFUSED');
refusal('glob path refused',
  () => bundleExternalContext({ packet: { allowed_files: ['src/*.ts'] }, worktree: root }),
  'GLOB_PATH_REFUSED');
refusal('secret path refused',
  () => bundleExternalContext({ packet: { allowed_files: ['.env'] }, worktree: root }),
  'SENSITIVE_PATH_REFUSED');
refusal('symlink refused',
  () => bundleExternalContext({ packet: { allowed_files: ['src/link.ts'] }, worktree: root }),
  'SYMLINK_REFUSED');
refusal('oversize file refused',
  () => bundleExternalContext({ packet: { allowed_files: ['large.txt'] }, worktree: root }),
  'FILE_TOO_LARGE');

rmSync(root, { recursive: true, force: true });
console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
