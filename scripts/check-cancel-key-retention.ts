#!/usr/bin/env tsx
/**
 * CANCEL-KEY RETENTION GUARD — SELF-ADDRESSED-RETURN-01 Tier 1.
 *
 * THE RULE (founder ruling, 2026-09-04):
 *
 *     A cancel key may be retired only when no live reminder depends on
 *     that version.
 *
 * Member cancellation authority decides when a key may disappear — not
 * infrastructure hygiene, not a rotation calendar. Cancellation is part of the
 * member's continuing authority over an act they authored, so the key that can
 * derive their link outlives our convenience.
 *
 * A "live" reminder is one that has not yet been delivered, cancelled, or
 * failed: its cancel link is still ahead of it, so retiring its key would
 * strand the member's only way to stop it.
 *
 * Run BEFORE retiring any key, and in the deploy gate after a rotation:
 *
 *     npx tsx scripts/check-cancel-key-retention.ts
 *
 * Exit 0 = every live reminder's version is retained. Exit 1 = retiring
 * already stranded someone, or is about to.
 */

import { query, closePool } from '../lib/db/postgres';
import { retainedCancelTokenVersions } from '../lib/reminders/cancelToken';

async function main() {
  const retained = retainedCancelTokenVersions();
  if (retained.length === 0) {
    console.error('✗ no cancel keys configured — cannot verify retention');
    process.exit(1);
  }

  // Which versions do live reminders still depend on? Deliberately reads only
  // the reminder's own lifecycle columns — no member, no session, no activity.
  const res = await query<{ cancel_token_version: number; live: string; earliest: Date; latest: Date }>(
    `SELECT cancel_token_version,
            count(*)::text AS live,
            min(delivery_at) AS earliest,
            max(delivery_at) AS latest
       FROM member_reminders
      WHERE delivered_at IS NULL
        AND cancelled_at IS NULL
        AND failed_at IS NULL
      GROUP BY cancel_token_version
      ORDER BY cancel_token_version`,
  );

  console.log(`retained key versions : ${retained.join(', ')}`);
  if (res.rows.length === 0) {
    console.log('live reminders        : none');
    console.log('\n✅ No live reminder depends on any key. Any version may be retired.');
    return;
  }

  const stranded: number[] = [];
  for (const row of res.rows) {
    const held = retained.includes(row.cancel_token_version);
    const mark = held ? '✓' : '✗';
    console.log(
      `  ${mark} v${row.cancel_token_version}: ${row.live} live · due ${row.earliest.toISOString()} → ${row.latest.toISOString()}`,
    );
    if (!held) stranded.push(row.cancel_token_version);
  }

  if (stranded.length > 0) {
    console.error(
      `\n❌ ${stranded.length} key version(s) retired while live reminders still depend on them: v${stranded.join(', v')}`,
    );
    console.error('   Those members cannot cancel. Restore the key(s) before the reminders come due.');
    console.error('   The worker will refuse to send them (cancel_secret_unavailable) rather than');
    console.error('   deliver a message the member has no way to stop.');
    process.exit(1);
  }

  const required = res.rows.map((r) => r.cancel_token_version);
  const retirable = retained.filter((v) => !required.includes(v));
  console.log('\n✅ Every live reminder’s key is retained.');
  console.log(
    retirable.length > 0
      ? `   Safe to retire now: v${retirable.join(', v')}`
      : '   No version is safe to retire yet.',
  );
}

main()
  .catch((err) => {
    console.error('retention check failed', err);
    process.exit(1);
  })
  .finally(() => closePool());
