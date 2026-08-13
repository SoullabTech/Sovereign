/**
 * Refusal Registry — falsification harness (runner)
 *
 *   npx tsx tests/constitutional/refusal-registry/index.ts
 *
 * Runs every proof attempt against the Grade-A / A-minus refusals documented in
 * docs/architecture/REFUSAL_REGISTRY.md. Exit code is non-zero if ANY refusal is
 * falsified (FAIL). This is what converts a Registry row's Test status from
 * "None yet" to "demonstrated."
 *
 * Scope (this first wave): the strongest structural refusals.
 *   R01  memory read path does not write
 *   R02  integration_passes log has no readers
 *   R03  request identity never trusted from a client-asserted claim
 *   R04  sacred_protected atoms never surface in ambient recall
 *   R05  Vision Studio field-note has no implicit practitioner-share path
 *   R06  Book Studio surface has no inference/synthesis reader (member-authored only)
 *   R07  A declined practitioner observation never resurfaces (decline = release)
 *   R08  A Daily Anchor never surfaces ambiently without member standing consent
 *   R09  Admin standing can only be granted/revoked by an owner (founder/cto)
 *   R10  The last remaining founder cannot be removed
 *   R-A5 Session Room offers only self-hosted ICE endpoints (no third-party media relay)
 *   R13  Vision Studio cell-candidate reflection (petal warming) has no persistence path
 *   R14  System never authors member identity/becoming at the emission boundary
 *   R15  production-maia ttsRouter selects only Stage-A-qualified local providers
 *   R16  persisted inferred developmental state cannot shape relational stance un-admitted
 *   R17  system-inferred themes cannot reach Circle-visible pulse output
 *   R18  an episodic mark cannot be persisted from a Sanctuary session, nor without
 *        resolvable member-owned source provenance
 *   R19  legacy oracle conversation lane hard-refuses (disabled, S2)
 *   R20  sanctuary content may never survive backup restoration (S5: tombstones +
 *        scope filters + governed restore — grade B, residual named)
 *   R21  sanctuary content refused at the escaped store boundaries (SANC-20260614-01)
 *   R22  no durable object may be written without knowing what governed its
 *        creation (S5 mint gates: DB triggers + server-minted Provenance)
 */

// NOTE: explicit .ts extensions so this runs under both `tsx` and Node's native
// type-stripping (`node --experimental-strip-types`), which does not resolve
// extensionless ESM specifiers. tests/** is excluded from tsconfig, so this does
// not affect `npm run typecheck`.
import { runCheck, type RefusalCheck, type Tally } from './harness.ts';
import { check as r01 } from './refusal-01-memory-loader-no-write.ts';
import { check as r02 } from './refusal-02-integration-passes-no-readers.ts';
import { check as r03 } from './refusal-03-body-userid-not-trusted.ts';
import { check as r04 } from './refusal-04-sacred-protected-not-surfaced.ts';
import { check as r05 } from './refusal-05-vision-studio-no-implicit-practitioner-share.ts';
import { check as r06 } from './refusal-06-book-studio-member-authored-only.ts';
import { check as r07 } from './refusal-07-declined-observation-released.ts';
import { check as r08 } from './refusal-08-anchor-consent-gated-surfacing.ts';
import { check as r09 } from './refusal-09-admin-grant-owner-only.ts';
import { check as r10 } from './refusal-10-last-founder-protected.ts';
import { check as rA5 } from './refusal-11-session-room-ice-self-hosted-only.ts';
import { check as r13 } from './refusal-13-vision-studio-no-elemental-persistence.ts';
import { check as r14 } from './refusal-14-identity-predicate-guard.ts';
import { check as r15 } from './refusal-15-tts-provider-qualification-guard.ts';
import { check as r16 } from './refusal-16-developmental-state-shaping-guard.ts';
import { check as r17 } from './refusal-17-circle-pulse-no-inferred-themes.ts';
import { check as r19 } from './refusal-19-oracle-lane-disabled.ts';
import { check as r18 } from './refusal-18-episodic-mark-sanctuary-guard.ts';
import { check as r20 } from './refusal-20-sanctuary-backup-restoration.ts';
import { check as r21 } from './refusal-21-sanctuary-store-boundary.ts';
import { check as r22 } from './refusal-22-provenance-mint-gate.ts';
import { check as r23 } from './refusal-23-consciousness-policy-influence-only.ts';

const CHECKS: RefusalCheck[] = [r01, r02, r03, r04, r05, r06, r07, r08, r09, r10, rA5, r13, r14, r15, r16, r17, r18, r19, r20, r21, r22, r23];

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

console.log(`${BOLD}Refusal Registry — falsification harness${RESET}`);
console.log(`${DIM}Candidate certification instrument · docs/architecture/REFUSAL_REGISTRY.md${RESET}`);
console.log(`${DIM}Each PASS = a proof attempt that could not falsify the refusal.${RESET}`);

const tally: Tally = { passed: 0, failed: 0, warned: 0 };

for (const check of CHECKS) {
  runCheck(check, tally);
}

console.log(`\n${'─'.repeat(64)}`);
console.log(
  `${BOLD}${tally.passed} passed · ${tally.failed} failed · ${tally.warned} warned${RESET}` +
    `  ${DIM}(${CHECKS.length} refusals)${RESET}`,
);

if (tally.failed > 0) {
  console.log('\n❌ A refusal was falsified. The Registry claim is not currently true in code.');
  process.exit(1);
}
console.log('\n✅ All proof attempts held. These refusals are demonstrated, not assumed.');
process.exit(0);
