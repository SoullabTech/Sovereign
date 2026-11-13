#!/usr/bin/env tsx
/**
 * Issue a Studio doorway invitation code (STUDIO-A-LA-CARTE-01 Phase 3). Operator-only.
 *
 *   npx tsx scripts/studios/issue-doorway-invitation.ts --studio writer --email person@example.com --by kelly [--days 30] [--note "..."]
 *       [--beta-until YYYY-MM-DD --issuer <founder/CTO member uuid> [--cohort beta-2026]]   (Writer's Studio only)
 *       [--studio-access --issuer <founder/CTO member uuid>]   (Writer's Studio only: sign-up also adds the person to
 *        the Writer's Studio beta roster, audited with the issuer as actor; works in WS_BETA_GRANT_MODE 'legacy')
 *
 * Prints the code ONCE; only SHA-256 hashes of the code and of the invited email are stored. The invitation is bound to
 * that email: registration must use the same address, so a code cannot be used to claim someone else's email. The invitation lets the person create an account at the
 * Studio's door. By itself it does NOT admit them into the Studio. For Writer's Studio, --beta-until attaches the dated
 * one-year beta grant (founder choice 2026-11-13): redeeming the invitation then writes that grant in the same step, and
 * the member is admitted (with Pro) at writer.soullab.life and from soullab.life Home alike. Takes effect only while
 * WS_BETA_GRANT_MODE is 'transition' or 'dated'. Other Studios: use that Studio's own roster / allowlist / grant.
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
  const betaUntilRaw = arg('beta-until');
  const issuer = arg('issuer');
  const cohort = arg('cohort') ?? null;
  const studioAccess = process.argv.includes('--studio-access');
  if (!doorway || !by || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isInteger(uses) || uses < 1 || uses > 500 || !(days > 0 && days <= 365)) {
    console.error('Usage: --studio writer|sound|guide|astrology --email <invited address> --by <issuer> [--uses 1..500] [--days 1..365] [--note text]');
    process.exit(2);
  }
  let betaUntil: Date | null = null;
  if (betaUntilRaw) {
    if (doorway.id !== 'writer') { console.error('--beta-until is for Writer’s Studio invitations only'); process.exit(2); }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(betaUntilRaw)) { console.error('--beta-until must be YYYY-MM-DD'); process.exit(2); }
    betaUntil = new Date(`${betaUntilRaw}T23:59:59Z`);
    if (!(betaUntil.getTime() > Date.now()) || betaUntil.getTime() > Date.now() + 2 * 366 * 86_400_000) {
      console.error('--beta-until must be in the future and within two years'); process.exit(2);
    }
    if (!issuer || !/^[0-9a-f-]{36}$/i.test(issuer)) { console.error('--issuer <founder/CTO member uuid> is required with --beta-until'); process.exit(2); }
    const owner = await query(`SELECT 1 FROM members WHERE id = $1 AND admin_role IN ('founder','cto')`, [issuer]);
    if (owner.rows.length !== 1) { console.error('--issuer must be the member id of a founder or CTO'); process.exit(2); }
    if (cohort && !/^[a-z0-9][a-z0-9-]{0,39}$/.test(cohort)) { console.error('--cohort must be lower-case letters, digits and dashes'); process.exit(2); }
  }
  if (studioAccess) {
    if (doorway.id !== 'writer') { console.error('--studio-access is for Writer’s Studio invitations only'); process.exit(2); }
    if (!issuer || !/^[0-9a-f-]{36}$/i.test(issuer)) { console.error('--issuer <founder/CTO member uuid> is required with --studio-access'); process.exit(2); }
    const owner = await query(`SELECT 1 FROM members WHERE id = $1 AND admin_role IN ('founder','cto')`, [issuer]);
    if (owner.rows.length !== 1) { console.error('--issuer must be the member id of a founder or CTO'); process.exit(2); }
  }
  const code = generateInvitationCode(doorway.id);
  const res = await query<{ id: string; expires_at: Date }>(
    `INSERT INTO studio_doorway_invitations
       (studio, code_hash, email_sha256, max_uses, expires_at, issued_by, note, beta_grant_until, beta_grant_cohort, issuer_member_id, grants_writers_studio)
     VALUES ($1, $2, $3, $4, now() + make_interval(days => $5), $6, $7, $8, $9, $10, $11)
     RETURNING id, expires_at`,
    [doorway.id, hashInvitationCode(code), hashInvitedEmail(email), uses, days, by, note,
     betaUntil, betaUntil ? cohort : null, (betaUntil || studioAccess) ? issuer : null, studioAccess],
  );
  console.log(`${doorway.studioName} invitation #${res.rows[0].id}`);
  console.log(`  code:    ${code}   (shown once; not stored)`);
  console.log(`  for:     the address given with --email (only its hash is stored)`);
  console.log(`  uses:    ${uses}`);
  console.log(`  expires: ${res.rows[0].expires_at.toISOString()}`);
  console.log(`  join at: https://${doorway.subdomain}.soullab.life/join`);
  if (betaUntil) {
    console.log(`  carries: Writer’s Studio beta grant until ${betaUntil.toISOString()}${cohort ? ` (cohort ${cohort})` : ''}`);
    console.log('  The grant admits only while WS_BETA_GRANT_MODE is transition or dated.');
  } else if (studioAccess) {
    console.log('  carries: Writer’s Studio access (beta roster, audited as the issuer) applied at sign-up.');
  } else {
    console.log('  Reminder: this does not admit them into the Studio — use that Studio’s own roster/allowlist/grant.');
  }
}

main()
  .catch((e) => { console.error('Failed:', e?.message ?? e); process.exitCode = 1; })
  .finally(() => closePool().catch(() => {}));
