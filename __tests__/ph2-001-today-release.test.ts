/**
 * PH2-001 TODAY RELEASE — proof tests
 *
 * Base: c2d8f0f043fcb6bb71ca41e1ef82a833dcaafe39
 *
 * Behavioural tests run the real exported helper. The remaining proofs are
 * source-level: they assert the shipped statements, because the alternative
 * needs a live database and this release must be verifiable without one.
 *
 * Run standalone:  npx tsx __tests__/ph2-001-today-release.test.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
// NOTE: maiaService is NOT imported. Importing it constructs a module-scope postgres
// pool at load time (lib/db/postgres.ts), which hangs without a reachable database —
// the import-time capability acquisition COR-B identified. The helper is extracted from
// source and evaluated in isolation instead, so this suite needs no database and no
// module resolution.

const ROOT = join(__dirname, '..');
const svc = readFileSync(join(ROOT, 'lib/sovereign/maiaService.ts'), 'utf8');
const store = readFileSync(join(ROOT, 'lib/memory/stores/PreferenceConfirmationStore.ts'), 'utf8');
const stale = readFileSync(join(ROOT, 'app/api/memory/stale-preferences/route.ts'), 'utf8');
const feedback = readFileSync(join(ROOT, 'app/api/memory/patterns/[patternId]/feedback/route.ts'), 'utf8');

// Extract pairCrossSessionTurns from source and evaluate it standalone.
const fnMatch = svc.match(/export function pairCrossSessionTurns\([\s\S]*?\n\}/);
if (!fnMatch) throw new Error('pairCrossSessionTurns not found in maiaService source');
const jsSrc = fnMatch[0]
  .replace('export function', 'function')
  .replace(/:\s*Array<\{[^}]*\}>\s*\|\s*null\s*\|\s*undefined/g, '')
  .replace(/:\s*Array<\{[^}]*\}>/g, '')
  .replace(/const pairs[^=]*=/, 'const pairs =');
// eslint-disable-next-line no-new-func
const pairCrossSessionTurns = new Function(`${jsSrc}; return pairCrossSessionTurns;`)() as
  (t: any) => Array<{ userMessage: string; maiaResponse: string; timestamp: unknown }>;

let pass = 0, fail = 0;
function check(name: string, fn: () => void) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e: any) { fail++; console.log(`  ✗ ${name}\n      ${e?.message ?? e}`); }
}
function assert(cond: any, msg: string) { if (!cond) throw new Error(msg); }

const U = (c: string) => ({ role: 'user', content: c, createdAt: 't' });
const A = (c: string) => ({ role: 'assistant', content: c, createdAt: 't' });

console.log('\nPH2-001 TODAY release\n');

// ── ITEM 1 — a leading orphan no longer destroys all recall ──────────────────
console.log('[1] tolerant cross-session pairing');

check('aligned sequence pairs normally', () => {
  const p = pairCrossSessionTurns([U('u1'), A('a1'), U('u2'), A('a2')]);
  assert(p.length === 2, `expected 2 pairs, got ${p.length}`);
  assert(p[0].userMessage === 'u1' && p[0].maiaResponse === 'a1', 'pair 0 wrong');
});

check('LEADING ASSISTANT TURN no longer zeroes recall (the L7 defect)', () => {
  const turns = [A('orphan'), U('u1'), A('a1'), U('u2'), A('a2')];
  // Old behaviour: i+=2 stride → (orphan,u1) and (a1,u2) both fail the role check → 0 pairs, silently.
  const p = pairCrossSessionTurns(turns);
  assert(p.length === 2, `leading orphan still destroys recall: got ${p.length} pairs`);
  assert(p[0].userMessage === 'u1', 'wrong first pair after leading orphan');
});

check('mid-sequence orphan does not destroy everything after it', () => {
  const p = pairCrossSessionTurns([U('u1'), A('a1'), A('stray'), U('u2'), A('a2')]);
  assert(p.length === 2, `mid-sequence orphan lost pairs: got ${p.length}`);
  assert(p[1].userMessage === 'u2', 'pair after stray assistant is wrong');
});

check('trailing user turn with no reply is dropped, not fatal', () => {
  const p = pairCrossSessionTurns([U('u1'), A('a1'), U('unanswered')]);
  assert(p.length === 1, `expected 1 pair, got ${p.length}`);
});

check('consecutive user turns pair the most recent with the reply', () => {
  const p = pairCrossSessionTurns([U('early'), U('actual'), A('a1')]);
  assert(p.length === 1 && p[0].userMessage === 'actual', 'wrong user turn paired');
});

check('empty / null input is safe', () => {
  assert(pairCrossSessionTurns([]).length === 0, 'empty not handled');
  assert(pairCrossSessionTurns(null).length === 0, 'null not handled');
  assert(pairCrossSessionTurns(undefined).length === 0, 'undefined not handled');
});

check('the fixed i+=2 stride is gone from both call sites', () => {
  assert(!/for \(let i = 0; i < crossSessionTurns\.length - 1; i \+= 2\)/.test(svc),
    'a fixed-stride pairing loop still exists');
});

// ── ITEM 2 — zero usable pairs is visible, not silent ────────────────────────
console.log('\n[2] absence is logged');

check('CORE logs ABSENT when turns fetched but zero pairs', () => {
  assert(/Cross-Session Recall CORE\] ABSENT/.test(svc), 'CORE absence log missing');
});
check('DEEP logs ABSENT when turns fetched but zero pairs', () => {
  assert(/Cross-Session Recall DEEP\] ABSENT/.test(svc), 'DEEP absence log missing');
});
check('the absence log is NOT inside the pairs.length > 0 branch', () => {
  // Each ABSENT log must be preceded by an `else {` — i.e. it is the zero-pair arm.
  for (const tier of ['CORE', 'DEEP']) {
    const idx = svc.indexOf(`Cross-Session Recall ${tier}] ABSENT`);
    assert(idx > -1, `${tier} ABSENT log missing`);
    const before = svc.slice(Math.max(0, idx - 400), idx);
    assert(/\}\s*else\s*\{/.test(before), `${tier} ABSENT log is not in the else branch`);
  }
});

// ── ITEM 3 — four injected exchanges are not called "1 turns" ────────────────
console.log('\n[3] summary counts what was injected');

check('summary uses effectiveHistory, not conversationHistory', () => {
  assert(/summary: `Conversation: \$\{conversationContext\.profile\.dominantElement\} element, \$\{effectiveHistory\.length \+ 1\} turns`/.test(svc),
    'summary still counts conversationHistory');
  assert(!/element, \$\{conversationHistory\.length \+ 1\} turns/.test(svc),
    'a conversationHistory-based turn count remains');
});

// ── ITEM 4 — cross-member mutation is refused ───────────────────────────────
console.log('\n[4] stale-preferences proves ownership');

check('ownership SELECT binds id AND user_id', () => {
  assert(/SELECT id FROM developmental_memories WHERE id = \$1 AND user_id = \$2/.test(stale),
    'no id+user_id ownership query');
});
check('ownership check precedes the mutation', () => {
  const own = stale.indexOf('AND user_id = $2');
  const rec = stale.indexOf('PreferenceConfirmationStore.record');
  assert(own > -1 && rec > -1 && own < rec, 'ownership check does not precede record()');
});
check('a non-owned memoryId returns 404 before mutating', () => {
  assert(/ownership\.rows\.length === 0[\s\S]{0,200}status: 404/.test(stale),
    'no 404 on ownership failure');
});

// ── ITEM 5 — yielded state cannot be silently restored ──────────────────────
console.log('\n[5] no resurrection of a withdrawn record');

check("the 'confirmed' UPDATE carries a validity predicate", () => {
  const i = store.indexOf('confirmed_by_user = true');
  assert(i > -1, "confirmed branch not found");
  const seg = store.slice(i, i + 800);
  assert(/AND \(valid_to IS NULL OR valid_to > NOW\(\)\)/.test(seg),
    'confirmed can still clear valid_to on a withdrawn row');
});
check("the 'expired' branch is unchanged (member may still yield)", () => {
  assert(/SET valid_to = NOW\(\)\s*\n\s*WHERE id = \$1/.test(store), 'expired branch altered');
});
check("'restored' remains unreachable from any route whitelist", () => {
  assert(!/'restored'/.test(stale), "stale-preferences now accepts 'restored'");
});

// ── L2 — DROPPED. Superseded upstream by PBR-002 (939ca9b4a), which reports
// `availableButNotComposed` rather than merely suppressing the flags, and by the
// R23 constitutional refusal at 52b00bd39. Two lanes derived the same correction;
// the canonical version is retained because it is more complete and properly
// housed — not because convergence grants authority.

// ── ITEM 5b — the refusal is truthful, not silent ───────────────────────────
console.log('\n[5b] refused confirmation is reported, not silently successful');

check('record() reports whether standing actually changed', () => {
  assert(/standingChanged: boolean/.test(store), 'no standingChanged in the result type');
  assert(/if \(\(applied\.rowCount \?\? 0\) === 0\)/.test(store),
    'rowCount of the confirmed UPDATE is not inspected');
  assert(/standingChanged = false/.test(store), 'refusal never sets standingChanged=false');
  assert(/refusedReason = 'withdrawn_by_member'/.test(store), 'no refusal reason recorded');
});

check('the audit INSERT still fires on a refused confirmation', () => {
  const ins = store.indexOf('INSERT INTO preference_confirmations');
  const upd = store.indexOf('confirmed_by_user = true');
  assert(ins > -1 && upd > -1 && ins < upd,
    'audit INSERT no longer precedes the standing UPDATE');
});

check('stale-preferences reports applied:false on refusal', () => {
  assert(/if \(!outcome\.standingChanged\)/.test(stale), 'stale-preferences ignores the outcome');
  assert(/applied: false/.test(stale), 'no applied:false branch');
  assert(/standing unchanged/.test(stale), 'refusal is not explained to the caller');
});

check('feedback route reports applied truthfully too (same seam)', () => {
  assert(/applied: confirmationOutcome\.standingChanged/.test(feedback),
    'feedback route still returns undifferentiated success');
  assert(/standing unchanged/.test(feedback), 'feedback route does not explain refusal');
});

check('neither route claims plain success on a refused confirmation', () => {
  for (const [name, src] of [['stale-preferences', stale], ['feedback', feedback]] as const) {
    assert(/applied/.test(src), `${name} has no applied flag at all`);
  }
});

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
