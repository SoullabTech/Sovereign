#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel));
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));

const eq = (actual: unknown, expected: unknown, label: string) => {
  if (actual !== expected) throw new Error(`${label}: ${String(actual)} != ${String(expected)}`);
};

eq(pkg.dependencies.next, '16.3.6', 'Next declaration');
eq(pkg.dependencies['@next/bundle-analyzer'], '16.3.6', 'bundle analyzer declaration');
eq(pkg.dependencies.react, '^19.1.1', 'React declaration drift');
eq(pkg.dependencies['react-dom'], '^19.1.1', 'ReactDOM declaration drift');
eq(pkg.devDependencies.eslint, '9.39.5', 'ESLint support major');
eq(pkg.devDependencies['eslint-config-next'], '16.3.6', 'eslint-config-next declaration');
eq(pkg.scripts?.lint, 'eslint .', 'Next16 lint command');
if (!exists('eslint.config.mjs')) throw new Error('Next16 flat ESLint config missing');
if (read('eslint.config.mjs').includes('next lint')) throw new Error('retired next lint command leaked into config');
eq(lock.packages?.['node_modules/next']?.version, '16.3.6', 'locked Next');
eq(lock.packages?.['node_modules/react']?.version, '19.2.3', 'locked React');

if (exists('middleware.ts')) throw new Error('retired middleware.ts still exists');
if (!exists('proxy.ts')) throw new Error('Next16 proxy.ts missing');
const proxy = read('proxy.ts');
if (!proxy.includes('export async function proxy(')) throw new Error('proxy export missing');

const nextConfig = read('next.config.js');
if (!nextConfig.includes('proxyClientMaxBodySize: 30 * 1024 * 1024'))
  throw new Error('proxy upload-size contract missing');
if (nextConfig.includes('middlewareClientMaxBodySize'))
  throw new Error('retired middleware size setting remains');

const appFiles = fs.readdirSync(path.join(ROOT, 'app'), { recursive: true })
  .filter((x): x is string => typeof x === 'string');
for (const rel of appFiles) {
  const full = path.join(ROOT, 'app', rel);
  if (!fs.statSync(full).isFile()) continue;
  if (!/\.(ts|tsx|js|jsx)$/.test(rel)) continue;
  if (fs.readFileSync(full, 'utf8').includes('export const instant = false'))
    throw new Error('unratified Cache Components opt-out remains: app/' + rel);
}

for (const key of ['build', 'build:docker']) {
  const script = String(pkg.scripts?.[key] ?? '');
  if (!script.startsWith('export NODE_OPTIONS=--max-old-space-size=8192;'))
    throw new Error(key + ' does not export 8GB heap across full chain');
  if (!script.includes('next build --webpack'))
    throw new Error(key + ' does not preserve Webpack build semantics');
}
const capBuild = read('scripts/build-capacitor.sh');
const capPatch = read('scripts/capacitor-patch-routes.sh');
if (capBuild.includes('middleware.ts') || capPatch.includes('middleware.ts'))
  throw new Error('Capacitor tooling still targets retired middleware.ts');
if (!capBuild.includes('proxy.ts') || !capPatch.includes('proxy.ts'))
  throw new Error('Capacitor tooling does not protect proxy.ts');
if (!capPatch.includes('export function proxy()'))
  throw new Error('Capacitor static-export stub does not export proxy()');
if (capPatch.includes('export function middleware()'))
  throw new Error('Capacitor static-export stub still exports retired middleware()');

if (exists('scripts/guards/phi-log-gate.ts')) {
  const phi = read('scripts/guards/phi-log-gate.ts');
  if (!phi.includes('proxy.ts')) throw new Error('existing PHI gate does not scan proxy.ts');
}

for (const rel of ['app/faq/page.tsx', 'app/resume/page.tsx']) {
  const source = read(rel);
  if (source.includes("@/lib/onboarding/telemetry'")) {
    throw new Error(rel + ' imports server-only onboarding telemetry into a client bundle');
  }
  if (!source.includes("@/lib/onboarding/telemetryClient'")) {
    throw new Error(rel + ' does not use the client telemetry boundary');
  }
}
if (!exists('app/api/onboarding/telemetry/route.ts'))
  throw new Error('onboarding telemetry server endpoint missing');

for (const rel of ['components/stellium/MessageInbox.tsx', 'components/stellium/MessageThread.tsx']) {
  const source = read(rel);
  if (/from ['"]@\/lib\/practitioner\/messages['"]/.test(source) &&
      !source.includes('import type')) {
    throw new Error(rel + ' has a runtime import from server-only practitioner/messages');
  }
  if (!source.includes('@/lib/practitioner/messagePresentation')) {
    throw new Error(rel + ' does not use the browser-safe message presentation boundary');
  }
}
const oracle = read('components/OracleConversation.tsx');
if (oracle.includes('getConversationMemory,'))
  throw new Error('OracleConversation must not instantiate server-backed conversation memory in the client');
if (!oracle.includes('import type {') || !oracle.includes('ConversationContext'))
  throw new Error('OracleConversation must retain type-only memory contracts');

const preservedMajors: Record<string,string> = {
  '@langchain/core': '1.2.13',
  '@langchain/openai': '1.6.0',
  uuid: '14.0.2',
  'capacitor-voice-recorder': '^7.0.6',
};
for (const [name, expected] of Object.entries(preservedMajors)) {
  eq(pkg.dependencies?.[name], expected, 'major boundary ' + name);
}
eq(pkg.dependencies?.langchain, undefined, 'unused direct langchain dependency');
eq(pkg.dependencies?.['@langchain/community'], undefined, 'unused direct community dependency');

console.log('NEXT16 CONFORMANCE: PASS');
console.log('  Next family = 16.3.6; React runtime remains locked 19.2.3');
console.log('  access boundary migrated middleware.ts → proxy.ts');
console.log('  Webpack + 8GB heap contract preserved');
console.log('  Cache Components / Turbopack not adopted');
console.log('  LangChain1 exact state preserved; UUID / voice-recorder majors unchanged');
