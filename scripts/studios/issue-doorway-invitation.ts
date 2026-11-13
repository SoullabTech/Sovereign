#!/usr/bin/env tsx
/**
 * Issue a Studio doorway invitation code (STUDIO-A-LA-CARTE-01 Phase 3). Operator-only.
 *
 *   npx tsx scripts/studios/issue-doorway-invitation.ts --studio writer --email person@example.com --by kelly [--days 30] [--note "..."]
 *
 * Prints the code ONCE; only SHA-256 hashes of the code and of the invited email are stored. The invitation is bound to
 * that email: registration must use the same address, so a code cannot be used to claim someone else's email. The invitation lets the person create an account at the
 * Studio's door. It does NOT admit them into the Studio: add them to that Studio's own roster / allowlist / grant as well.
 */
import { query, closePool } from '@/lib/db/postgres';
import { doorwayById } from '@/lib/studios/doorways';
import { generateInvitationCode, hashInvitationCode, hashInvitedEmail } from '@/lib/studios/doorwayInvitations';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const doorway = doorwayById(arg('studio'));
  const by = arg('by');
  const email = (arg('email') ?? '').trim();
  const uses = Number(arg('uses') ?? '1');
  const days = Number(arg('days') ?? '30');
  const note = arg('note') ?? null;
  if (!doorway || !by || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isInteger(uses) || uses < 1 || uses > 500 || !(days > 0 && days <= 365)) {
    console.error('Usage: --studio writer|sound|guide|astrology --email <invited address> --by <issuer> [--uses 1..500] [--days 1..365] [--note text]');
    process.exit(2);
  }
  const code = generateInvitationCode(doorway.id);
  const res = await query<{ id: string; expires_at: Date }>(
    `INSERT INTO studio_doorway_invitations (studio, code_hash, email_sha256, max_uses, expires_at, issued_by, note)
     VALUES ($1, $2, $3, $4, now() + make_interval(days => $5), $6, $7)
     RETURNING id, expires_at`,
    [doorway.id, hashInvitationCode(code), hashInvitedEmail(email), uses, days, by, note],
  );
  console.log(`${doorway.studioName} invitation #${res.rows[0].id}`);
  console.log(`  code:    ${code}   (shown once; not stored)`);
  console.log(`  for:     the address given with --email (only its hash is stored)`);
  console.log(`  uses:    ${uses}`);
  console.log(`  expires: ${res.rows[0].expires_at.toISOString()}`);
  console.log(`  join at: https://${doorway.subdomain}.soullab.life/join`);
  console.log('  Reminder: this does not admit them into the Studio — use that Studio’s own roster/allowlist/grant.');
}

main()
  .catch((e) => { console.error('Failed:', e?.message ?? e); process.exitCode = 1; })
  .finally(() => closePool().catch(() => {}));
