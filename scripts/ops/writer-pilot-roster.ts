/**
 * WRITER PILOT ROSTER — admit named beta writers so that signing in takes them
 * straight into the Studio instead of the invitation page.
 *
 *   DATABASE_URL=… npx tsx scripts/ops/writer-pilot-roster.ts <roster.csv>            dry run (default)
 *   DATABASE_URL=… npx tsx scripts/ops/writer-pilot-roster.ts <roster.csv> --apply    write
 *   …against a NON-LOCAL database, --apply also needs --confirm-host=<the host printed>
 *
 * <roster.csv> has a header `name,email`. ⛔ Keep it OUTSIDE the repository: it holds
 * people's addresses and this tool never commits, logs or prints them in full.
 *
 * WHAT IT DOES: for each row it links (or creates) the ops_contacts roster entry so
 * that the Studio's admission check — see lib/writersStudio/betaAccessServer.ts — is
 * true for that person's account. Re-run it after a writer registers: a row with no
 * account yet is recorded as WAITING_FOR_SIGNUP and admits nobody until then.
 *
 * WHAT IT WILL NOT DO: grant admin_role · open the Studio to anyone not listed ·
 * treat an email match as authority (it is a candidate for YOU to confirm by running
 * this) · reclassify a practitioner/partner/press contact · reactivate a churned one ·
 * guess between two accounts or two contacts. Those rows say NEEDS_A_PERSON and stay
 * untouched. Everything it writes happens in ONE transaction or not at all.
 */
import { readFileSync } from 'node:fs';
import pg from 'pg';
import {
  maskEmail, parseRosterCsv, planRosterRow,
  type ContactRef, type MemberRef, type RosterInput, type RosterPlan,
} from '../../lib/writersStudio/pilotRoster';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const apply = args.includes('--apply');
const confirmHost = args.find((a) => a.startsWith('--confirm-host='))?.slice('--confirm-host='.length);

function fail(message: string, code = 2): never {
  console.error(message);
  process.exit(code);
}

async function load(client: pg.Client, rows: RosterInput[]) {
  const emails = rows.map((r) => r.email);
  const members = (await client.query<MemberRef>(
    'SELECT id::text AS id, email FROM members WHERE lower(trim(email)) = ANY($1)', [emails])).rows;
  const contacts = (await client.query<ContactRef>(
    `SELECT id::text AS id, email, member_id::text AS member_id, contact_type, pipeline_stage,
            metadata, deleted_at::text AS deleted_at
       FROM ops_contacts
      WHERE deleted_at IS NULL AND (lower(trim(email)) = ANY($1) OR member_id::text = ANY($2))`,
    [emails, members.map((m) => m.id)])).rows;
  return rows.map((row) => ({ row, plan: planRosterRow(row, members, contacts) }));
}

const describe = (p: RosterPlan): string => {
  if (p.status === 'NEEDS_A_PERSON') return `NEEDS_A_PERSON (${p.reason})`;
  if (p.status === 'ADMITTED') return 'ADMITTED';
  return `${p.status} (${p.action})`;
};

(async () => {
  if (!file) fail('usage: writer-pilot-roster.ts <roster.csv> [--apply] [--confirm-host=<host>]');
  const url = process.env.DATABASE_URL;
  if (!url) fail('DATABASE_URL is required');
  const target = new URL(url);
  const host = target.hostname;
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
  console.log(`database: ${host}:${target.port || '5432'}${target.pathname}   mode: ${apply ? 'APPLY' : 'dry run (nothing is written)'}`);

  const rows = parseRosterCsv(readFileSync(file, 'utf8'));
  if (rows.length === 0) fail('roster is empty');
  if (apply && !isLocal && confirmHost !== host) {
    fail(`REFUSED: this is not a local database. Re-run with --confirm-host=${host} if that is the one you mean.`, 3);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const planned = await load(client, rows);
    const counts: Record<string, number> = {};
    for (const { row, plan } of planned) {
      counts[plan.status] = (counts[plan.status] ?? 0) + 1;
      console.log(`  ${maskEmail(row.email).padEnd(30)} ${describe(plan)}`);
    }
    console.log('summary:', counts);

    if (!apply) {
      console.log('\nDry run only. Add --apply to write the WOULD_ADMIT and WAITING_FOR_SIGNUP rows above.');
      return;
    }

    await client.query('BEGIN');
    let written = 0;
    for (const { row, plan } of planned) {
      if (plan.status === 'WOULD_ADMIT' || plan.status === 'WAITING_FOR_SIGNUP') {
        const memberId = plan.status === 'WOULD_ADMIT' ? plan.memberId : null;
        if (plan.action === 'create_contact') {
          await client.query(
            `INSERT INTO ops_contacts (name, email, contact_type, pipeline_stage, source, member_id, metadata)
             VALUES ($1, $2, 'beta_tester', 'active', 'writer_pilot_roster', $3, '{"writers_studio_beta": true}'::jsonb)`,
            [row.name, row.email, memberId]);
          written += 1;
        } else if (plan.action === 'update_contact') {
          await client.query(
            `UPDATE ops_contacts
                SET contact_type = 'beta_tester', pipeline_stage = 'active',
                    member_id = COALESCE($2::uuid, member_id), email = COALESCE(email, $3),
                    metadata = COALESCE(metadata, '{}'::jsonb) || '{"writers_studio_beta": true}'::jsonb,
                    updated_at = now()
              WHERE id = $1::uuid AND deleted_at IS NULL`,
            [plan.contactId, memberId, row.email]);
          written += 1;
        }
      }
    }
    await client.query('COMMIT');
    console.log(`\nwritten: ${written} row(s), one transaction.`);

    const after = await load(client, rows);
    const admitted = after.filter((a) => a.plan.status === 'ADMITTED').length;
    const waiting = after.filter((a) => a.plan.status === 'WAITING_FOR_SIGNUP').length;
    const person = after.filter((a) => a.plan.status === 'NEEDS_A_PERSON').length;
    console.log(`verified after write: ${admitted} admitted · ${waiting} waiting for sign-up · ${person} need a person`);
    console.log('\nSend each admitted writer this link, which takes them from sign-in straight into the Studio:');
    console.log('  https://soullab.life/signin?next=/writers-studio');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error('ROSTER FAILED:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
