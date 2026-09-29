#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const backendPkg = JSON.parse(read('app/api/_backend/package.json'));
const backendLock = JSON.parse(read('app/api/_backend/package-lock.json'));

const eq = (actual: unknown, expected: unknown, label: string) => {
  if (actual !== expected) throw new Error(`${label}: ${String(actual)} != ${String(expected)}`);
};

eq(pkg.dependencies.uuid, '14.0.2', 'root UUID declaration');
eq(lock.packages?.['node_modules/uuid']?.version, '14.0.2', 'root locked UUID');
eq(backendPkg.dependencies?.uuid, undefined, 'backend direct UUID dependency');
eq(backendPkg.devDependencies?.['@types/uuid'], undefined, 'backend UUID type dependency');
eq(backendPkg.overrides?.uuid, '11.1.1', 'backend transitive UUID override');
eq(backendLock.packages?.['']?.dependencies?.uuid, undefined, 'backend lock root UUID dependency');
eq(backendLock.packages?.['node_modules/uuid']?.version, '11.1.1', 'backend transitive UUID lock');

const backendRoot = path.join(ROOT, 'app/api/_backend/src');
const backendFiles = fs.readdirSync(backendRoot, { recursive: true })
  .filter((x): x is string => typeof x === 'string')
  .filter((rel) => /\.(ts|tsx|js|jsx)$/.test(rel));
for (const rel of backendFiles) {
  if (rel.includes('.backup.')) continue;
  const full = path.join(backendRoot, rel);
  if (!fs.statSync(full).isFile()) continue;
  const source = fs.readFileSync(full, 'utf8');
  if (/from\s+['"]uuid['"]|require\(\s*['"]uuid['"]\s*\)/.test(source))
    throw new Error('backend UUID package reference remains: ' + rel);
}

const sourceRoots = ['app', 'lib', 'scripts', 'packages', 'components'];
let esmImports = 0;
for (const rootRel of sourceRoots) {
  const abs = path.join(ROOT, rootRel);
  if (!fs.existsSync(abs)) continue;
  for (const rel of fs.readdirSync(abs, { recursive: true }).filter((x): x is string => typeof x === 'string')) {
    const full = path.join(abs, rel);
    if (!fs.statSync(full).isFile() || !/\.(ts|tsx|js|jsx)$/.test(rel)) continue;
    if (rel.includes('node_modules/') || rel.includes('.next/')) continue;
    if (rel.includes('.backup.')) continue;
    if (rel.includes('/dist/') || rel.includes('/dist-minimal/')) continue;
    const source = fs.readFileSync(full, 'utf8');
    if (/require\(\s*['"]uuid['"]\s*\)/.test(source))
      throw new Error('CommonJS UUID require remains: ' + rootRel + '/' + rel);
    if (/from\s+['"]uuid['"]/.test(source)) esmImports++;
  }
}
if (esmImports < 1) throw new Error('expected active ESM UUID imports');
if (pkg.dependencies.next !== '16.3.6') throw new Error('Next drift');
if (pkg.dependencies['@langchain/core'] !== '1.2.13') throw new Error('LangChain Core drift');
if (pkg.dependencies['@langchain/openai'] !== '1.6.0') throw new Error('LangChain OpenAI drift');
if (pkg.dependencies['capacitor-voice-recorder'] !== '^7.0.6') throw new Error('voice-recorder drift');

console.log('UUID14 CONFORMANCE: PASS');
console.log('  root direct UUID = 14.0.2 ESM');
console.log('  backend direct UUID dependency removed');
console.log('  backend source uses native Node randomUUID');
console.log('  no CommonJS require("uuid") remains in governed source');
console.log('  Next / LangChain / voice-recorder boundaries preserved');
