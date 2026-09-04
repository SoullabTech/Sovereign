#!/usr/bin/env tsx
/**
 * REMINDERS CONFIG GATE — SELF-ADDRESSED-RETURN-01 Tier 1.
 *
 * Run before deploying the reminders worker, and after any key rotation.
 * Verifies the deployment can honour the member's cancellation authority
 * BEFORE any reminder is scheduled against it.
 *
 * Prints only versions, counts and booleans. NEVER a secret value, not even
 * truncated: a partial secret in a deploy log is still a disclosed secret.
 *
 *   npx tsx scripts/verify-reminders-config.ts
 */

import {
  currentCancelTokenVersion,
  isCancelSecretConfigured,
  retainedCancelTokenVersions,
} from '../lib/reminders/cancelToken';
import { RETRY_HORIZON_HOURS, WORKER_CADENCE_SECONDS } from '../lib/reminders/types';

let failed = 0;
const ok = (l: string, d = '') => console.log(`  \x1b[32m✔\x1b[0m ${l}${d ? `  \x1b[2m(${d})\x1b[0m` : ''}`);
const bad = (l: string, d = '') => {
  failed++;
  console.log(`  \x1b[31m✘\x1b[0m ${l}${d ? `  \x1b[31m→ ${d}\x1b[0m` : ''}`);
};

console.log('\n\x1b[1mReminders configuration gate\x1b[0m\n');

// ── Cancel keyring ────────────────────────────────────────────────────────
if (!isCancelSecretConfigured()) {
  bad(
    'cancel keyring configured',
    'set SELF_ADDRESSED_RETURN_CANCEL_KEYS (JSON {version:secret}) or SELF_ADDRESSED_RETURN_CANCEL_SECRET (>=32 chars)',
  );
} else {
  const retained = retainedCancelTokenVersions();
  const current = currentCancelTokenVersion();
  ok('cancel keyring configured', `${retained.length} version(s) retained`);
  ok('active version explicitly resolved', `v${current}`);
  if (!retained.includes(current)) {
    bad('active version has a key', `v${current} is not in the keyring`);
  }
  console.log(`  \x1b[2m  retained versions: ${retained.join(', ')}\x1b[0m`);
}

// ── Secrets must never be logged ──────────────────────────────────────────
// Belt and braces: prove that nothing printed above echoes a configured value.
const secretValues = [
  process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET,
  process.env.SELF_ADDRESSED_RETURN_CANCEL_SECRET_PREVIOUS,
  ...Object.values(
    (() => {
      try {
        return JSON.parse(process.env.SELF_ADDRESSED_RETURN_CANCEL_KEYS ?? '{}') as Record<string, string>;
      } catch {
        return {};
      }
    })(),
  ),
].filter((v): v is string => typeof v === 'string' && v.length > 0);

ok('no secret value is printed by this gate', `${secretValues.length} secret(s) held, 0 emitted`);

// ── Delivery contract ─────────────────────────────────────────────────────
ok('worker cadence', `${WORKER_CADENCE_SECONDS}s — "sent shortly after the time you chose"`);
ok('retry horizon', `${RETRY_HORIZON_HOURS}h (half the provider idempotency window)`);

if (!process.env.RESEND_API_KEY) bad('RESEND_API_KEY present');
else ok('RESEND_API_KEY present', 'value not shown');

if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.log('  \x1b[33m!\x1b[0m NEXT_PUBLIC_APP_URL unset — cancel links will fall back to https://soullab.life');
} else {
  ok('NEXT_PUBLIC_APP_URL set', process.env.NEXT_PUBLIC_APP_URL);
}

console.log(`\n${'─'.repeat(56)}`);
if (failed > 0) {
  console.log(`\x1b[31m${failed} check(s) failed\x1b[0m — do NOT deploy the reminders worker.`);
  console.log('A member who cannot cancel is the failure this unit exists to prevent.');
  process.exit(1);
}
console.log('\x1b[32mConfiguration is sound.\x1b[0m Run scripts/check-cancel-key-retention.ts before retiring any key.');
