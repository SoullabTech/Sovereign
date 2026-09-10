#!/usr/bin/env node
'use strict';

/**
 * scripts/witness/typehealth-identity-discrimination.js
 *
 * Falsifier for the type-health gate's diagnostic identity (2026-09-10).
 *
 * The repair it guards makes union member ORDER irrelevant to identity. An
 * instrument that cannot fail when the governed behaviour is wrong has not
 * tested that behaviour, so this witness is written to go RED against the two
 * ways the repair could be wrong:
 *
 *   too weak  — a permuted union still reads as a new error (the original
 *               defect: three unchanged errors reported as both fixed and NEW)
 *   too broad — sorting also swallows a real change (a member added, removed
 *               or altered), or reorders text that is not a union at all
 *
 * T1  same union, different member order  → SAME identity, no new/gone
 * T2  member ADDED                        → DIFFERENT identity, gate RED
 * T3  member REMOVED                      → DIFFERENT identity, gate RED
 * T4  member VALUE changed                → DIFFERENT identity, gate RED
 * T5  TS error code changes               → DIFFERENT identity, gate RED
 * T6  ordinary non-union text changes     → DIFFERENT identity, gate RED
 * T7  unrelated "|" in prose or inside a string-literal type → NOT reordered
 *
 * Run: node scripts/witness/typehealth-identity-discrimination.js
 */

const { canonicalizeMessage, identityKey } = require('../lib/typehealth-identity');
const { compare, keyOf } = require('../check-typehealth-baseline');

let passed = 0;
let failed = 0;
const failures = [];

function check(label, ok, detail) {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    failures.push(label);
    console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
  }
}

const F = 'components/focus/InboxTriage.tsx';
const k = (msg, code = 'TS2322', file = F) => identityKey(file, code, msg);

const same = (label, a, b) => check(label, k(a) === k(b), `${k(a)}\n        !==\n        ${k(b)}`);
const differ = (label, a, b) => check(label, k(a) !== k(b), `both canonicalize to: ${k(a)}`);

// ------------------------------------------------------------------ T1

console.log('\nT1  same union, different member order → SAME identity');

// The two messages actually observed. Baseline order vs post-repair order.
const REAL_A_BASE =
  'Type \'"contemplative"\' is not assignable to type \'"gentle" | "direct" | "exploratory" | "supportive" | undefined\'.';
const REAL_A_NOW =
  'Type \'"contemplative"\' is not assignable to type \'"direct" | "supportive" | "gentle" | "exploratory" | undefined\'.';
const REAL_B_BASE =
  'Type \'null\' is not assignable to type \'{ threshold: "none" | "pause" | "invitation" | "acknowledgment"; weeklyWeight: number; projectedWeight: number; tier: string; } | undefined\'.';
const REAL_B_NOW =
  'Type \'null\' is not assignable to type \'{ threshold: "none" | "invitation" | "pause" | "acknowledgment"; weeklyWeight: number; projectedWeight: number; tier: string; } | undefined\'.';

same('T1a  observed sacred-texts permutation', REAL_A_BASE, REAL_A_NOW);
same('T1b  observed focus permutation (union nested in an object type)', REAL_B_BASE, REAL_B_NOW);
same(
  'T1c  reversed union',
  "Type 'X' is not assignable to type '\"a\" | \"b\" | \"c\"'.",
  "Type 'X' is not assignable to type '\"c\" | \"b\" | \"a\"'."
);
same(
  'T1d  union of named types',
  "Argument of type 'Q' is not assignable to parameter of type 'Alpha | Beta | null'.",
  "Argument of type 'Q' is not assignable to parameter of type 'null | Beta | Alpha'."
);
same(
  'T1e  union inside a generic',
  "Type 'X' is not assignable to type 'Array<\"a\" | \"b\">'.",
  "Type 'X' is not assignable to type 'Array<\"b\" | \"a\">'."
);
check(
  'T1f  canonicalization is idempotent',
  canonicalizeMessage(canonicalizeMessage(REAL_B_NOW)) === canonicalizeMessage(REAL_B_NOW)
);

// ------------------------------------------------------------------ T2

console.log('\nT2  member ADDED → DIFFERENT identity');
differ(
  'T2a  extra member appended',
  "Type 'X' is not assignable to type '\"a\" | \"b\"'.",
  "Type 'X' is not assignable to type '\"a\" | \"b\" | \"c\"'."
);
differ(
  'T2b  extra member inserted first',
  "Type 'X' is not assignable to type '\"b\" | \"c\"'.",
  "Type 'X' is not assignable to type '\"a\" | \"b\" | \"c\"'."
);
differ(
  'T2c  duplicate member added — sort must not deduplicate',
  "Type 'X' is not assignable to type '\"a\" | \"b\"'.",
  "Type 'X' is not assignable to type '\"a\" | \"a\" | \"b\"'."
);
differ(
  'T2d  member added inside a nested object union',
  REAL_B_BASE,
  REAL_B_BASE.replace('"acknowledgment"', '"acknowledgment" | "deferred"')
);

// ------------------------------------------------------------------ T3

console.log('\nT3  member REMOVED → DIFFERENT identity');
differ(
  'T3a  member dropped',
  "Type 'X' is not assignable to type '\"a\" | \"b\" | \"c\"'.",
  "Type 'X' is not assignable to type '\"a\" | \"c\"'."
);
differ('T3b  undefined dropped from the observed union', REAL_A_BASE, REAL_A_BASE.replace(' | undefined', ''));
differ(
  'T3c  member dropped inside a nested object union',
  REAL_B_BASE,
  REAL_B_BASE.replace('"none" | "pause" | ', '"none" | ')
);

// ------------------------------------------------------------------ T4

console.log('\nT4  member VALUE changed → DIFFERENT identity');
differ(
  'T4a  one literal renamed',
  "Type 'X' is not assignable to type '\"a\" | \"b\"'.",
  "Type 'X' is not assignable to type '\"a\" | \"z\"'."
);
differ(
  'T4b  literal renamed inside the observed union',
  REAL_A_BASE,
  REAL_A_BASE.replace('"exploratory"', '"exploratative"')
);
differ(
  'T4c  the SUBJECT of the assignment changed, union identical',
  REAL_A_BASE,
  REAL_A_BASE.replace('"contemplative"', '"ruminative"')
);
differ(
  'T4d  property name changed, union identical',
  REAL_B_BASE,
  REAL_B_BASE.replace('threshold:', 'thresholds:')
);
differ(
  'T4e  a non-union property type changed',
  REAL_B_BASE,
  REAL_B_BASE.replace('weeklyWeight: number', 'weeklyWeight: string')
);

// ------------------------------------------------------------------ T5

console.log('\nT5  TS error code changes → DIFFERENT identity');
check(
  'T5a  same message, different code',
  identityKey(F, 'TS2322', REAL_A_BASE) !== identityKey(F, 'TS2345', REAL_A_BASE)
);
check(
  'T5b  same message and code, different file',
  identityKey('components/focus/A.tsx', 'TS2322', REAL_A_BASE) !==
    identityKey('components/focus/B.tsx', 'TS2322', REAL_A_BASE)
);

// ------------------------------------------------------------------ T6

console.log('\nT6  ordinary non-union diagnostic text changes → DIFFERENT identity');
differ("T6a  Cannot find name 'foo' vs 'bar'", "Cannot find name 'foo'.", "Cannot find name 'bar'.");
differ(
  'T6b  missing property name changed',
  "Property 'x' does not exist on type 'Widget'.",
  "Property 'z' does not exist on type 'Widget'."
);
differ('T6c  arity message changed', 'Expected 2 arguments, but got 1.', 'Expected 3 arguments, but got 1.');
check(
  'T6d  a message with no quoted type region is returned untouched',
  canonicalizeMessage('Expected 2 arguments, but got 1.') === 'Expected 2 arguments, but got 1.'
);

// ------------------------------------------------------------------ T7

console.log('\nT7  unrelated "|" is never treated as a union separator');
const PROSE = 'Cannot write file a|b.ts because it would overwrite input file.';
check('T7a  prose outside a type region is untouched', canonicalizeMessage(PROSE) === PROSE, canonicalizeMessage(PROSE));
differ(
  'T7b  "|" inside a string-literal type is not a separator',
  'Type \'"b|a"\' is not assignable to type \'"a|b"\'.',
  'Type \'"a|b"\' is not assignable to type \'"b|a"\'.'
);
check(
  'T7c  a string-literal type containing "|" is left byte-identical',
  canonicalizeMessage('Type \'"a|b"\' is not assignable to type \'string\'.') ===
    'Type \'"a|b"\' is not assignable to type \'string\'.'
);
differ(
  'T7d  a union OF literals that themselves contain "|"',
  'Type \'X\' is not assignable to type \'"a|b" | "c|d"\'.',
  'Type \'X\' is not assignable to type \'"a|c" | "b|d"\'.'
);
same(
  'T7e  …but permuting those same literals is still the same identity',
  'Type \'X\' is not assignable to type \'"a|b" | "c|d"\'.',
  'Type \'X\' is not assignable to type \'"c|d" | "a|b"\'.'
);

// ------------------------------------------- end-to-end, through compare()

console.log('\nE  the real comparison, not a reimplementation of it');

const A_FILE = 'app/wisdom-keepers/sacred-texts/page.tsx';
const B_FILE = 'components/focus/InboxTriage.tsx';

const mkBaseline = (diags) => ({
  version: 1,
  totalErrors: diags.reduce((n, d) => n + d.count, 0),
  diagnostics: diags,
  coverage: [A_FILE, B_FILE],
});
const mkCurrent = (diags) => ({
  byKey: new Map(diags.map((d) => [keyOf(d), d])),
  total: diags.reduce((n, d) => n + d.count, 0),
  programPaths: new Set([A_FILE, B_FILE]),
});

const BASE = [
  { file: A_FILE, code: 'TS2322', message: REAL_A_BASE, count: 1, lines: [207] },
  { file: B_FILE, code: 'TS2322', message: REAL_B_BASE, count: 1, lines: [131] },
];

// E1 — the observed defect: identical errors, permuted print order.
{
  const cur = [
    { file: A_FILE, code: 'TS2322', message: REAL_A_NOW, count: 1, lines: [207] },
    { file: B_FILE, code: 'TS2322', message: REAL_B_NOW, count: 1, lines: [131] },
  ];
  const r = compare(mkCurrent(cur), mkBaseline(BASE));
  check(
    'E1  permuted unions → 0 introduced, 0 fixed (gate GREEN)',
    r.introduced.length === 0 && r.fixed.length === 0 && r.increased.length === 0,
    `introduced=${r.introduced.length} fixed=${r.fixed.length} increased=${r.increased.length}`
  );
}

// E2 — a genuine regression hiding behind a permutation must still be caught.
{
  const cur = [
    { file: A_FILE, code: 'TS2322', message: REAL_A_NOW, count: 1, lines: [207] },
    {
      file: B_FILE,
      code: 'TS2322',
      message: REAL_B_NOW.replace('"acknowledgment"', '"acknowledgment" | "deferred"'),
      count: 1,
      lines: [131],
    },
  ];
  const r = compare(mkCurrent(cur), mkBaseline(BASE));
  check(
    'E2  one permuted + one genuinely changed union → 1 introduced (gate RED)',
    r.introduced.length === 1 && r.introduced[0].file === B_FILE,
    `introduced=${r.introduced.length}`
  );
}

// E3 — a brand-new error is still a regression.
{
  const cur = [
    { file: A_FILE, code: 'TS2322', message: REAL_A_NOW, count: 1, lines: [207] },
    { file: B_FILE, code: 'TS2322', message: REAL_B_NOW, count: 1, lines: [131] },
    { file: B_FILE, code: 'TS2554', message: 'Expected 2 arguments, but got 1.', count: 1, lines: [688] },
  ];
  const r = compare(mkCurrent(cur), mkBaseline(BASE));
  check('E3  new unrelated diagnostic → 1 introduced (gate RED)', r.introduced.length === 1);
}

// E4 — counts are untouched by canonicalization.
{
  const cur = [
    { file: A_FILE, code: 'TS2322', message: REAL_A_NOW, count: 3, lines: [207, 209, 211] },
    { file: B_FILE, code: 'TS2322', message: REAL_B_NOW, count: 1, lines: [131] },
  ];
  const r = compare(mkCurrent(cur), mkBaseline(BASE));
  check(
    'E4  same identity occurring more often → 1 increased (gate RED)',
    r.increased.length === 1 && r.increased[0].count === 3 && r.increased[0].baselineCount === 1
  );
}

// E5 — a real fix is still reported as a fix.
{
  const cur = [{ file: B_FILE, code: 'TS2322', message: REAL_B_NOW, count: 1, lines: [131] }];
  const r = compare(mkCurrent(cur), mkBaseline(BASE));
  check('E5  an error genuinely gone → 1 fixed, 0 introduced', r.fixed.length === 1 && r.introduced.length === 0);
}

// ------------------------------------------------------------------ result

console.log(`\n${passed} passed · ${failed} failed`);
if (failed) {
  console.log(`\nFAILED: ${failures.join(', ')}`);
  process.exit(1);
}
process.exit(0);
