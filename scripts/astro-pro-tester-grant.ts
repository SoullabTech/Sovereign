/**
 * ASTRO-PRO-04 (#1893) — founder-only Pro tester grants.
 *
 *   npx tsx scripts/astro-pro-tester-grant.ts --list
 *   npx tsx scripts/astro-pro-tester-grant.ts --grant  <username> --reason "..."
 *   npx tsx scripts/astro-pro-tester-grant.ts --revoke <username> --reason "..."
 *
 * Every grant and revoke is recorded in the append-only
 * astro_pro_tester_grant_events log, attributed to the founder
 * (ASTRO_PRO_FOUNDER_MEMBER_ID); without that identity the command refuses.
 * A grant admits no one until ASTRO_PRO_ACCESS_PHASE='tester-grant'.
 */
import { query } from '@/lib/db/postgres';
import {
  listProTesterStandings,
  recordProTesterGrantEvent,
  type ProTesterGrantAction,
} from '@/lib/astrology/proTesterGrants';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  if (process.argv.includes('--list')) {
    const standings = await listProTesterStandings();
    if (standings.length === 0) console.log('No Pro tester grant events.');
    for (const s of standings) console.log(`${s.username ?? '(no username)'}\t${s.action}\t${s.occurredAt}`);
    console.log(`Phase: ${process.env.ASTRO_PRO_ACCESS_PHASE ?? '(unset)'} — grants admit testers only in 'tester-grant'.`);
    return;
  }

  const action: ProTesterGrantAction | undefined =
    arg('--grant') ? 'grant' : arg('--revoke') ? 'revoke' : undefined;
  const username = arg('--grant') ?? arg('--revoke');
  if (!action || !username) {
    throw new Error('Usage: --list | --grant <username> --reason "..." | --revoke <username> --reason "..."');
  }

  const founder = process.env.ASTRO_PRO_FOUNDER_MEMBER_ID;
  if (!founder || !UUID.test(founder)) {
    throw new Error('Refused: ASTRO_PRO_FOUNDER_MEMBER_ID is not a valid founder identity; grants are founder-only.');
  }

  const member = await query<{ id: string }>('SELECT id FROM members WHERE username = $1', [username]);
  if (member.rows.length !== 1) throw new Error(`Refused: expected exactly one member with username ${username}.`);
  const memberId = member.rows[0].id;
  if (memberId === founder) throw new Error('Refused: the founder needs no grant.');

  await recordProTesterGrantEvent({ memberId, action, actorMemberId: founder, reason: arg('--reason') ?? null });
  console.log(`Recorded ${action} for ${username}.`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
