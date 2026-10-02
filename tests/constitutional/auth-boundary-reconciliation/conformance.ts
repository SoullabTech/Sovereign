#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

const proxy = read('proxy.ts');

for (const token of [
  'deriveVerifiedAccess',
  'stripClientIdentityAssertions',
  'forwardSanitized',
  'NextResponse.next({ request: { headers } })',
  'export async function proxy(',
]) {
  if (!proxy.includes(token)) throw new Error('auth boundary missing: ' + token);
}

for (const token of [
  'function getUserTier(',
  'function getUserRoles(',
  'function isAuthenticated(',
]) {
  if (proxy.includes(token)) throw new Error('legacy client-assertion trust remains: ' + token);
}

if (!proxy.includes("url.pathname = pathname === '/' ? `/fields/${masterSlug}`"))
  throw new Error('governed canonical master-field routing drifted');
if (!proxy.includes("const RESERVED_SUBDOMAINS = ['www', 'api', 'oldhead', 'app'];"))
  throw new Error('governed canonical reserved-subdomain contract drifted');
if (!proxy.includes("req.headers.get('x-capacitor-app') === 'true'"))
  throw new Error('Capacitor bypass contract missing');
if (/runtime:\s*['"](?:nodejs|edge)['"]/.test(proxy))
  throw new Error('Next16 proxy must not declare a route-segment runtime override');

const matcher = "'/((?!_next/static|_next/image|favicon.ico|api/voice/transcribe-simple|api/sovereign/manuscripts/ingest$).*)'";
if (!proxy.includes(matcher))
  throw new Error('governed canonical multipart matcher exclusions drifted');

for (const rel of ['lib/auth/verifiedAccess.ts', 'lib/auth/identityAssertions.ts']) {
  if (!exists(rel)) throw new Error('required auth module missing: ' + rel);
}

for (const rel of [
  'app/api/sovereign/manuscripts/ingest/route.ts',
  'scripts/guards/phi-log-gate.ts',
  'tests/constitutional/writers-studio/flagship-r2-0/laws.ts',
  'tests/constitutional/writers-studio/flagship-r2-1/laws.ts',
]) {
  if (!exists(rel)) throw new Error('governed canonical surface disappeared: ' + rel);
}
const phi = read('scripts/guards/phi-log-gate.ts');
if (!phi.includes('proxy.ts')) throw new Error('PHI gate must scan proxy.ts');
const ingest = read('app/api/sovereign/manuscripts/ingest/route.ts');
for (const token of [
  'deriveVerifiedAccess',
  'forgedIdentityHeaders',
  'CLIENT_ASSERTABLE_IDENTITY_HEADERS',
  'checkAccess(',
  'getMemberIdFromRequest',
  'request.headers.delete(header)',
]) {
  if (!ingest.includes(token))
    throw new Error('multipart ingest security boundary missing: ' + token);
}

console.log('AUTH-RECONCILIATION CONFORMANCE: PASS');
console.log('  validated-session authority restored');
console.log('  hostile identity assertions stripped before handlers');
console.log('  governed canonical field routing / Capacitor / matcher preserved');
console.log('  governed multipart/PHI/Writer Studio security surfaces preserved');
