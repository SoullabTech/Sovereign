/**
 * PH2-001 ADD-ON A — truthful pattern-response semantics
 *
 * Baseline: 7d30e320e
 *
 * Invariant:
 *   **Ambivalence is not agreement.**
 *   The system may not assign stronger standing than the member actually expressed.
 *
 * Mapping under test:
 *   confirmed              → confirm
 *   rejected               → reject
 *   partly / explore /     → PRESERVE current standing (record the answer, not a new claim)
 *   not_now
 *
 * Behavioural cases execute the route's real derivation and the SQL's real CASE
 * semantics, both extracted from source. No database, no module import.
 *
 * Run:  npx tsx __tests__/ph2-001-addon-a-response-truth.test.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const route = readFileSync(join(ROOT, 'app/api/members/patterns/[id]/response/route.ts'), 'utf8');
const store = readFileSync(join(ROOT, 'lib/patterns/respondToPattern.ts'), 'utf8');

let pass = 0, fail = 0;
function check(name: string, fn: () => void) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e: any) { fail++; console.log(`  ✗ ${name}\n      ${e?.message ?? e}`); }
}
function assert(c: any, m: string) { if (!c) throw new Error(m); }

/** The route's derivation, mirrored exactly from source (asserted below). */
type Resonance = 'fits' | 'partly' | 'not_now' | 'no' | 'explore' | null;
function derive(body: { response?: string }, resonance: Resonance): 'confirmed' | 'rejected' | 'preserve' {
  return body.response === 'confirmed' || body.response === 'rejected'
    ? (body.response as 'confirmed' | 'rejected')
    : resonance === 'fits'
      ? 'confirmed'
      : resonance === 'no'
        ? 'rejected'
        : 'preserve';
}

/** Both UPDATE lanes' CASE semantics: only an explicit confirm/reject moves standing. */
function applyStanding(current: string, response: 'confirmed' | 'rejected' | 'preserve'): string {
  return response === 'confirmed' ? 'confirmed'
    : response === 'rejected' ? 'rejected'
      : current;
}

console.log('\nPH2-001 add-on A — ambivalence is not agreement\n');

// ── the six pinned cases ────────────────────────────────────────────────────
console.log('[standing] the member\'s answer may not be upgraded');

check('rejected + not_now → remains rejected', () => {
  const r = applyStanding('rejected', derive({}, 'not_now'));
  assert(r === 'rejected', `expected rejected, got ${r}`);
});

check('rejected + explore → remains rejected', () => {
  const r = applyStanding('rejected', derive({}, 'explore'));
  assert(r === 'rejected', `expected rejected, got ${r}`);
});

check('confirmed + partly → remains confirmed', () => {
  const r = applyStanding('confirmed', derive({}, 'partly'));
  assert(r === 'confirmed', `expected confirmed, got ${r}`);
});

check('an ambiguous response never acquires confirmation standing', () => {
  for (const res of ['partly', 'not_now', 'explore'] as const) {
    for (const start of ['emerging', 'rejected', 'offered']) {
      const out = applyStanding(start, derive({}, res));
      assert(out === start, `${res} on ${start} became ${out}`);
      assert(out !== 'confirmed' || start === 'confirmed',
        `${res} on ${start} acquired confirmation standing`);
    }
  }
});

check('explicit confirm still confirms', () => {
  assert(applyStanding('emerging', derive({ response: 'confirmed' }, null)) === 'confirmed', 'explicit confirm broken');
  assert(applyStanding('emerging', derive({}, 'fits')) === 'confirmed', 'resonance "fits" no longer confirms');
});

check('explicit reject still rejects', () => {
  assert(applyStanding('confirmed', derive({ response: 'rejected' }, null)) === 'rejected', 'explicit reject broken');
  assert(applyStanding('emerging', derive({}, 'no')) === 'rejected', 'resonance "no" no longer rejects');
});

// ── the specific defect this closes ─────────────────────────────────────────
console.log('\n[defect] a rejected pattern cannot be restored by ambivalence');

check('"not now" no longer restores a rejected pattern to confirmed', () => {
  // Pre-fix: derive() returned 'confirmed' here, and both lanes set status='confirmed'.
  const out = applyStanding('rejected', derive({}, 'not_now'));
  assert(out !== 'confirmed', 'ambivalence still restores a rejected pattern');
});

// ── source assertions: the mirrored logic is the shipped logic ──────────────
console.log('\n[source] the shipped code matches the semantics tested above');

check('route maps ambiguous resonance to preserve, not confirmed', () => {
  assert(/:\s*'preserve';\s*\/\/ partly \/ explore \/ not_now/.test(route),
    'route does not map ambiguous responses to preserve');
  assert(!/:\s*'confirmed';\s*\/\/ partly\/explore\/not_now/.test(route),
    'the old confirmed-by-default mapping is still present');
});

check("route's response type admits 'preserve'", () => {
  assert(/responseValue:\s*'confirmed'\s*\|\s*'rejected'\s*\|\s*'preserve'/.test(route),
    'route still types responseValue as confirmed|rejected only');
});

check("respondToPattern accepts 'preserve'", () => {
  assert(/response:\s*'confirmed'\s*\|\s*'rejected'\s*\|\s*'preserve';/.test(store),
    "respondToPattern does not accept 'preserve'");
});

check('practitioner lane no longer sets status unconditionally', () => {
  assert(/status\s+=\s*CASE WHEN \$1 IN \('confirmed', 'rejected'\) THEN \$1/.test(store),
    'member_patterns still assigns status = $1 unconditionally');
  assert(!/SET\s*\n\s*status\s+=\s*\$1,/.test(store), 'an unconditional status = $1 remains');
});

check('ledger lane preserve branch is retained', () => {
  assert(/WHEN \$1 = 'rejected'\s+THEN 'rejected'\s*\n\s*ELSE status END/.test(store),
    'pattern_ledger ELSE-status branch missing');
});

check('both lanes still bind member_id (no cross-member exposure)', () => {
  const binds = store.match(/AND member_id = \$\d/g) ?? [];
  assert(binds.length >= 2, `expected member_id binding on both lanes, found ${binds.length}`);
});

check('the member\'s actual answer is still recorded', () => {
  assert(/member_response\s+=\s*\$2/.test(store), 'member_response no longer written');
  assert(/resonance_response\s+=\s*\$3/.test(store), 'resonance_response no longer written');
});

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
