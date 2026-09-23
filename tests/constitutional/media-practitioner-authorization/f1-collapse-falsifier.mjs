#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FIXED = '0a93962d-55a2-4deb-ad46-5268ee19be54';
const ACTOR_A = '11111111-1111-4111-8111-111111111111';
const ACTOR_B = '22222222-2222-4222-8222-222222222222';

const SPECS = [
  ['app/api/media/projects/route.ts', ['GET', 'POST'], 'helper'],
  ['app/api/media/projects/[projectId]/route.ts', ['GET', 'PATCH', 'DELETE'], 'helper'],
  ['app/api/media/projects/[projectId]/upload/route.ts', ['POST'], 'ternary'],
  ['app/api/media/projects/[projectId]/upload-chunk/route.ts', ['POST'], 'direct'],
  ['app/api/media/projects/[projectId]/assets/route.ts', ['GET'], 'direct'],
  ['app/api/media/projects/[projectId]/assets/[assetId]/serve/route.ts', ['GET'], 'direct'],
  ['app/api/media/projects/[projectId]/transcript/route.ts', ['GET'], 'direct'],
  ['app/api/media/projects/[projectId]/transcribe/route.ts', ['POST'], 'direct'],
  ['app/api/media/projects/[projectId]/jobs/route.ts', ['GET'], 'direct'],
  ['app/api/media/projects/[projectId]/integrations/route.ts', ['GET', 'POST'], 'direct'],
  ['app/api/media/projects/[projectId]/exports/route.ts', ['GET', 'POST'], 'direct'],
  ['app/api/media/projects/[projectId]/exports/[exportId]/download/route.ts', ['GET'], 'direct'],
].map(([file, methods, mode]) => ({ file, methods, mode }));

const MEMBER_RESOLVERS = [
  'getPractitionerIdForMember',
  'getCurrentPractitioner',
  'resolvePractitionerRecordFromMember',
  'requirePractitioner',
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function methods(source) {
  return [...source.matchAll(/export async function (GET|POST|PATCH|DELETE|PUT)\b/g)]
    .map((m) => m[1]);
}

function allRouteFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...allRouteFiles(p));
    else if (ent.isFile() && ent.name === 'route.ts') {
      out.push(path.relative(ROOT, p));
    }
  }
  return out.sort();
}

function inspect(spec, source) {
  const failures = [];

  if (!source.includes('getMemberIdFromRequest')) {
    failures.push('verified member authentication helper absent');
  }
  if (!/if\s*\(\s*!memberId\s*\)/.test(source) || !/status:\s*401/.test(source)) {
    failures.push('unauthenticated refusal shape absent');
  }

  const actualMethods = methods(source);
  if (JSON.stringify(actualMethods) !== JSON.stringify(spec.methods)) {
    failures.push(`handler population drift: expected ${spec.methods.join(',')} got ${actualMethods.join(',')}`);
  }

  if (!source.includes(FIXED)) {
    failures.push('fixed practitioner UUID absent');
  }
  const fixedUses = (source.match(/DEV_PRACTITIONER_ID/g) || []).length;
  if (fixedUses < 2) {
    failures.push(`fixed practitioner constant not used as authority (uses=${fixedUses})`);
  }

  for (const resolver of MEMBER_RESOLVERS) {
    if (source.includes(resolver)) failures.push(`member-derived resolver present: ${resolver}`);
  }

  if (!source.includes('practitioner_id')) {
    failures.push('practitioner ownership predicate absent');
  }

  if (spec.mode === 'helper') {
    const devReturn =
      /if\s*\(process\.env\.NODE_ENV\s*===\s*['"]development['"]\)\s*return\s+DEV_PRACTITIONER_ID/.test(source);
    const returns = source.match(/return\s+DEV_PRACTITIONER_ID/g) || [];
    if (!devReturn || returns.length < 2) {
      failures.push('decorative helper collapse not present in both environment branches');
    }
  }

  if (spec.mode === 'ternary') {
    const sameBothSides =
      /process\.env\.NODE_ENV\s*===\s*['"]development['"]\s*\?\s*DEV_PRACTITIONER_ID\s*:\s*DEV_PRACTITIONER_ID/.test(source);
    if (!sameBothSides) failures.push('same-authority environment ternary absent');
  }

  if (spec.mode === 'direct' && fixedUses < 2) {
    failures.push('direct fixed-authority use absent');
  }

  return failures;
}

function sourceAuthority(spec, source, memberId) {
  assert.ok(memberId, 'synthetic actor must be a verified member identity');
  const failures = inspect(spec, source);
  assert.equal(failures.length, 0, `${spec.file}: ${failures.join('; ')}`);
  return FIXED;
}

function expectDefeat(name, fn) {
  let killed = false;
  try {
    fn();
  } catch {
    killed = true;
  }
  assert.equal(killed, true, `defeat candidate survived: ${name}`);
  console.log(`KILL  ${name}`);
}

const actualPopulation = allRouteFiles(path.join(ROOT, 'app/api/media'));
const expectedPopulation = SPECS.map((s) => s.file).sort();
assert.deepEqual(actualPopulation, expectedPopulation, 'media route population drifted');
assert.notEqual(ACTOR_A, ACTOR_B, 'synthetic actors must be distinct');

let handlerCount = 0;
const traces = [];

for (const spec of SPECS) {
  const source = read(spec.file);
  const failures = inspect(spec, source);
  assert.deepEqual(failures, [], `${spec.file}: ${failures.join('; ')}`);

  const authorityA = sourceAuthority(spec, source, ACTOR_A);
  const authorityB = sourceAuthority(spec, source, ACTOR_B);
  assert.equal(authorityA, authorityB, `${spec.file}: actor authority did not collapse`);
  assert.equal(authorityA, FIXED, `${spec.file}: unexpected fixed authority`);

  handlerCount += spec.methods.length;
  traces.push({ ...spec, authorityA, authorityB });
}

assert.equal(SPECS.length, 12, 'frozen route-file count changed');
assert.equal(handlerCount, 17, 'frozen handler count changed');

console.log(`POPULATION  ${SPECS.length}/12 route files · ${handlerCount}/17 handlers`);
console.log(`ACTOR A     ${ACTOR_A}`);
console.log(`ACTOR B     ${ACTOR_B}`);
console.log(`AUTHORITY   ${FIXED}`);
for (const trace of traces) {
  console.log(
    `COLLAPSE  ${trace.methods.join(',').padEnd(16)} ${trace.file} -> ${trace.authorityA}`,
  );
}

const helperSource = read('app/api/media/projects/route.ts');
const ternarySource = read('app/api/media/projects/[projectId]/upload/route.ts');

expectDefeat('population-minus-one', () => {
  assert.deepEqual(actualPopulation, expectedPopulation.slice(1));
});

expectDefeat('authentication-removed', () => {
  const mutated = helperSource.replaceAll('getMemberIdFromRequest', 'removedMemberAuth');
  assert.deepEqual(inspect(SPECS[0], mutated), []);
});

expectDefeat('member-derived-resolver-introduced', () => {
  const mutated = helperSource + '\nvoid getPractitionerIdForMember;\n';
  assert.deepEqual(inspect(SPECS[0], mutated), []);
});

expectDefeat('fixed-authority-literal-removed', () => {
  const mutated = helperSource.replaceAll(FIXED, 'ffffffff-ffff-4fff-8fff-ffffffffffff');
  assert.deepEqual(inspect(SPECS[0], mutated), []);
});

expectDefeat('decorative-helper-production-arm-repaired', () => {
  const mutated = helperSource.replace(
    /return\s+DEV_PRACTITIONER_ID;\s*\/\/ TODO: look up from members\/practitioners/,
    'return memberId; // synthetic defeat candidate',
  );
  assert.deepEqual(inspect(SPECS[0], mutated), []);
});

expectDefeat('same-authority-ternary-repaired', () => {
  const mutated = ternarySource.replace(
    /DEV_PRACTITIONER_ID\s*:\s*DEV_PRACTITIONER_ID/,
    'DEV_PRACTITIONER_ID : memberId',
  );
  assert.deepEqual(inspect(SPECS[2], mutated), []);
});

console.log('DEFEAT CONTROLS  6/6 lethal');
console.log(
  'F1 RESULT  SOURCE-LEVEL AUTHORIZATION COLLAPSE ESTABLISHED · ' +
  '12/12 routes · 17/17 handlers · two distinct verified-member identities -> same practitioner authority',
);
console.log('BOUNDARY   production impact unwitnessed · repair unopened · production untouched');
