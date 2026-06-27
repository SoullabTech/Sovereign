/**
 * Runnable proof mirror for the governed-retrieval acceptance suite.
 *
 * The jest toolchain is not installed in this environment, so this .mts is the
 * proof-in-this-env (same pattern as scripts/repro/honored_proof.mts for the
 * conversational-recall consent gate). It imports the REAL governance module
 * and asserts Kelly's six acceptance criteria + privacy.
 *
 * Run:  npx tsx scripts/repro/governed_retrieval_proof.mts
 */

// Dynamic import with ESM/CJS interop fallback — tsx transpiles the .ts module to
// CJS, so under this .mts (ESM) context the named exports arrive on `default`.
// Exercises the REAL governance module either way.
const _mod: any = await import('../../lib/library/governedRetrieval');
const GR: any = typeof _mod.isAdmitted === 'function' ? _mod : (_mod.default ?? _mod);
const isAdmitted = GR.isAdmitted;
const DEFAULT_USAGE_AUTHORITY = GR.DEFAULT_USAGE_AUTHORITY;

const VIEWER = 'member-aaaa';
const OTHER = 'member-bbbb';
const PURPOSES = ['guidance', 'reflection', 'explicit_recall'] as const;
const AUTHORITIES = ['store_only', 'only_when_i_ask', 'reflect_with_me', 'use_in_guidance'] as const;

const member = (a: string, ownerId = VIEWER) => ({ scope: 'member' as const, ownerId, usageAuthority: a });
const platform = { scope: 'platform' as const };

let failures = 0;
function check(name: string, got: boolean, want: boolean) {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}  (got ${got}, want ${want})`);
}

console.log('\nAdmission matrix (member items owned by viewer) — T = admitted\n');
console.log('  authority \\ purpose   | guidance | reflection | explicit_recall');
console.log('  ----------------------|----------|------------|----------------');
for (const a of AUTHORITIES) {
  const row = PURPOSES.map((p) => (isAdmitted(member(a), { viewerId: VIEWER, purpose: p }) ? 'T' : 'F'));
  console.log(`  ${a.padEnd(21)} |    ${row[0]}     |     ${row[1]}      |       ${row[2]}`);
}

console.log('\nKelly\'s six acceptance criteria:\n');

// 1. default only_when_i_ask
check('1: kept item defaults to only_when_i_ask', DEFAULT_USAGE_AUTHORITY === 'only_when_i_ask', true);

// 2. store_only never surfaced (any purpose)
for (const p of PURPOSES) check(`2: store_only excluded in ${p}`, isAdmitted(member('store_only'), { viewerId: VIEWER, purpose: p }), false);

// 3. explicit recall retrieves only_when_i_ask (and ordinary guidance/reflection do not)
check('3: only_when_i_ask in explicit_recall', isAdmitted(member('only_when_i_ask'), { viewerId: VIEWER, purpose: 'explicit_recall' }), true);
check('3: only_when_i_ask NOT in guidance', isAdmitted(member('only_when_i_ask'), { viewerId: VIEWER, purpose: 'guidance' }), false);
check('3: only_when_i_ask NOT in reflection', isAdmitted(member('only_when_i_ask'), { viewerId: VIEWER, purpose: 'reflection' }), false);

// 4. reflect available in reflection, never proactively in guidance
check('4: reflect in reflection', isAdmitted(member('reflect_with_me'), { viewerId: VIEWER, purpose: 'reflection' }), true);
check('4: reflect NOT in guidance', isAdmitted(member('reflect_with_me'), { viewerId: VIEWER, purpose: 'guidance' }), false);

// 5. use_in_guidance eligible for ordinary guidance
check('5: use_in_guidance in guidance', isAdmitted(member('use_in_guidance'), { viewerId: VIEWER, purpose: 'guidance' }), true);

// 6. platform unchanged (admitted everywhere, even anonymous)
for (const p of PURPOSES) check(`6: platform admitted in ${p}`, isAdmitted(platform, { viewerId: VIEWER, purpose: p }), true);
check('6: platform admitted for anonymous', isAdmitted(platform, { viewerId: undefined, purpose: 'guidance' }), true);

// privacy (constitutional, beyond the six)
check('privacy: other-owner member item excluded', isAdmitted(member('use_in_guidance', OTHER), { viewerId: VIEWER, purpose: 'explicit_recall' }), false);
check('privacy: anonymous viewer sees no member item', isAdmitted(member('use_in_guidance'), { viewerId: undefined, purpose: 'explicit_recall' }), false);

console.log(`\n${failures === 0 ? 'ALL GREEN' : failures + ' FAILURE(S)'}\n`);
process.exit(failures === 0 ? 0 : 1);
