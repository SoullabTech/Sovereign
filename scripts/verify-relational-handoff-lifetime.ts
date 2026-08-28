/**
 * Relational Handoff Lifetime & Consent Contract — verification
 *
 * Proves the governing invariant:
 *
 *   If the interface says a relationship has been taken to MAIA, the request transport
 *   must carry that relationship, or the interface must stop saying it.
 *
 * Run:  npx tsx scripts/verify-relational-handoff-lifetime.ts
 *
 * Behavioral proofs (A–G) exercise lib/maia/relationalHandoff.ts directly against a
 * localStorage shim. Structural proofs (C-wire, E-wire, H, I) assert over component and
 * route source, because "the claim and the payload read the same value" is a property of
 * the wiring, not of a function's return.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------- localStorage shim
const store = new Map<string, string>();
(globalThis as any).window = globalThis;
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

import {
  setRelationalHandoff,
  readRelationalHandoff,
  clearRelationalHandoff,
  isHandoffEligible,
  type RelationalHandoff,
} from '../lib/maia/relationalHandoff';

const ROOT = join(__dirname, '..');
const component = readFileSync(join(ROOT, 'components/OracleConversation.tsx'), 'utf8');
const route = readFileSync(join(ROOT, 'app/api/sovereign/app/maia/list/route.ts'), 'utf8');

let passed = 0;
let failed = 0;
function check(label: string, ok: boolean) {
  if (ok) { passed++; console.log(`  ✅ ${label}`); }
  else { failed++; console.log(`  ❌ ${label}`); }
}

const SESSION_A = 'session-aaaa';
const SESSION_B = 'session-bbbb';
const MEMBER_A = 'member-1111';
const MEMBER_B = 'member-2222';
const REL_SAM = 'rel-sam-0001';
const REL_KIT = 'rel-kit-0002';

const handoff = (over: Partial<RelationalHandoff> = {}): RelationalHandoff => ({
  contextId: REL_SAM, label: 'Sam', returnTo: '/relationships/rel-sam-0001',
  sessionId: SESSION_A, userId: MEMBER_A, ...over,
});

// ------------------------------------------------------------------------- A
console.log('\nA — initial handoff');
store.clear();
setRelationalHandoff(handoff());
check('handoff is readable for the session + member that made it',
  readRelationalHandoff(SESSION_A, MEMBER_A)?.contextId === REL_SAM);

// ------------------------------------------------------------------------- B
console.log('\nB — multi-turn continuity');
const turns = [1, 2, 3, 4].map(() => readRelationalHandoff(SESSION_A, MEMBER_A)?.contextId);
check('turns 1–4 all carry the same relationship id',
  turns.every(t => t === REL_SAM));

// ------------------------------------------------------------------------- C
console.log('\nC — remount');
// A remount destroys component state (the old bug: a useRef holding the id). Storage is
// what survives; the commit/rehydrate effect reads it back. Simulated by re-reading after
// discarding all in-memory state.
check('handoff survives remount (storage-backed, not ref-backed)',
  readRelationalHandoff(SESSION_A, MEMBER_A)?.contextId === REL_SAM);
check('the id is no longer held in a useRef',
  !/sessionRelationshipContextId/.test(component));
check('handoff is component STATE rehydrated from the record',
  /const \[relationalHandoff, setRelationalHandoffState\] = useState<RelationalHandoff \| null>/.test(component) &&
  /setRelationalHandoffState\(readRelationalHandoff\(sessionId, userId\)\)/.test(component));
check('rehydrate effect is keyed on the conversation session + member',
  /}, \[sessionId, userId\]\);/.test(component));

// ------------------------------------------------------------------------- D
console.log('\nD — cross-account stale id');
check('a handoff stored by member A is NOT readable as member B',
  readRelationalHandoff(SESSION_A, MEMBER_B) === null);
check('server scopes the relationship read to the authenticated member (unchanged)',
  /getMemberActiveRelationalContext\(/.test(route));

// ------------------------------------------------------------------------- E
console.log('\nE — Sanctuary');
const active = readRelationalHandoff(SESSION_A, MEMBER_A);
check('Sanctuary suppresses eligibility', isHandoffEligible(active, true) === false);
check('non-Sanctuary remains eligible', isHandoffEligible(active, false) === true);
check('Sanctuary suspends rather than destroys the member act',
  readRelationalHandoff(SESSION_A, MEMBER_A)?.contextId === REL_SAM);
check('ONE predicate gates both the visible claim and the payload',
  /\{relationalHandoffActive && relationalHandoff && !showLabDrawer && \(/.test(component) &&
  /\.\.\.\(relationalHandoffActive && relationalHandoff && \{/.test(component));
check('payload gate sees current handoff + Sanctuary (no stale closure)',
  /pendingLensConsent, relationalHandoff, relationalHandoffActive\]\);/.test(component));
check('server still refuses relational context on a Sanctuary turn',
  /!isSanctuary/.test(route));

// ------------------------------------------------------------------------- F
console.log('\nF — new handoff replaces old');
setRelationalHandoff(handoff({ contextId: REL_KIT, label: 'Kit' }));
check('latest explicit handoff wins',
  readRelationalHandoff(SESSION_A, MEMBER_A)?.contextId === REL_KIT);

// ------------------------------------------------------------------------- G
console.log('\nG — termination');
check('a new conversation session ends the handoff',
  readRelationalHandoff(SESSION_B, MEMBER_A) === null);
clearRelationalHandoff();
check('explicit clear ends the handoff',
  readRelationalHandoff(SESSION_A, MEMBER_A) === null);
check('ending clears the claim and the transport in one act',
  /const endRelationalHandoff = useCallback\(\(\) => \{\s*clearRelationalHandoff\(\);\s*setRelationalHandoffState\(null\);/.test(component));
// The return control invokes it inline (it also navigates); the dismiss control passes the
// handler by reference. Both forms must be present — a pill that visually dismissed while
// the id kept riding would be this defect inverted.
check('return control ends the handoff before navigating',
  /endRelationalHandoff\(\);\s*router\.push\(destination\);/.test(component));
check('dismiss control ends the handoff',
  /aria-label="End relationship handoff"\s*\n\s*onClick=\{endRelationalHandoff\}/.test(component));
check('the relational pill is not rendered from the unstamped maia_return_path',
  /Return to \{relationalHandoff\.label \|\| 'Relational Field'\}/.test(component) &&
  /seed\.returnTo && !isRelationalSeed/.test(component));

// ------------------------------------------------------------------------- H
console.log('\nH — server read wire unchanged');
check('route still parses relationshipContextId', /relationshipContextId/.test(route));
check('formatter still used', /formatRelationalContextForPrompt/.test(route));
check('ownership gate intact', /if \(userId && !isSanctuary\)/.test(route));

// ------------------------------------------------------------------------- I
console.log('\nI — no ambient inference');
check('only an explicit relationships:thread seed starts a handoff',
  /seed\.source === 'relationships:thread' && !!seed\.contextId/.test(component));
check('setRelationalHandoff is called from exactly one commit site',
  (component.match(/[^e]setRelationalHandoff\(/g) || []).length === 1);
store.clear();
check('no handoff exists without a member act',
  readRelationalHandoff(SESSION_A, MEMBER_A) === null);

// -------------------------------------------------------------------------
console.log(`\n${passed} passed · ${failed} failed`);
if (failed > 0) {
  console.log('\nFAIL — RELATIONAL HANDOFF UI AND TRANSPORT STATE MAY DIVERGE');
  process.exit(1);
}
console.log('\nPASS — RELATIONAL HANDOFF UI AND TRANSPORT STATE REMAIN TRUTHFULLY ALIGNED');
