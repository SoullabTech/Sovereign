/**
 * R9 PostgreSQL16 reviewer-only proof: a DISTINCT application read account
 * cannot execute beta grant writes. Uses only the exact fictional 127.0.0.1
 * R2/R9 database AFTER its fixture migration, never a live Soullab account.
 *
 * A separate SQL ROLE is NOT an R20 signer or WORM proof. Real production
 * database roles and connection identities still require independent review.
 */
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';

const raw = process.env.WS_PILOT_TEST_DATABASE_URL;
if (!raw || raw !== process.env.DATABASE_URL) {
  throw new Error('R9_refused_nonfictional_db');
}
const parsed = new URL(raw);
if (parsed.protocol !== 'postgresql:' || parsed.hostname !== '127.0.0.1'
  || parsed.port !== '55439' || parsed.pathname !== '/postgres'
  || parsed.username !== 'postgres' || process.env.NODE_ENV === 'production') {
  throw new Error('R9_refused_nonfictional_db');
}
const founder = '11111111-1111-4111-8111-111111111111';
const targetWriter = '33333333-3333-4333-8333-333333333333';

async function main() {
  const admin = new Client({ connectionString: raw });
  await admin.connect();
  let checks = 0;
  const prove = (description: string, condition: boolean) => {
    assert.equal(condition, true, description);
    checks += 1;
    process.stdout.write('PASS ' + String(checks).padStart(2, '0') + ' ' + description + '\n');
  };
  let readonly: Client | null = null;
  try {
    const model = await admin.query<{founder_member_id: string; issued_seats: number}>(
      'SELECT founder_member_id::text, issued_seats FROM writer_studio_pilot_admission_control WHERE singleton=TRUE',
    );
    if (model.rows[0]?.founder_member_id !== founder
      || model.rows[0]?.issued_seats !== 2) {
      throw new Error('R9_refused_unrecognized_fictional_pilot');
    }
    prove('exact founder-bound and two-seat fictional database recognized', true);
    const role = 'writer_r9_fixture_reader';
    const password = randomBytes(32).toString('hex');
    const checkExisting = await admin.query<{count: number}>(
      'SELECT count(*)::int AS count FROM pg_roles WHERE rolname=$1', [role],
    );
    if (checkExisting.rows[0]?.count !== 0) {
      throw new Error('R9_fixture_role_already_exists');
    }
    // Fixed unguessable role name, randomly generated throwaway credentials.
    // No stored token or password is placed in source/Git.
    await admin.query(`CREATE ROLE writer_r9_fixture_reader LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
    await admin.query('GRANT USAGE ON SCHEMA public TO writer_r9_fixture_reader');
    await admin.query(
      'GRANT SELECT ON writer_studio_beta_grants, writer_studio_pilot_admission_control TO writer_r9_fixture_reader',
    );
    readonly = new Client({
      host: '127.0.0.1', port: 55439, database: 'postgres',
      user: role, password,
    });
    await readonly.connect();
    const protectedState = await readonly.query<{count: number}>(
      'SELECT count(*)::int AS count FROM writer_studio_beta_grants',
    );
    prove('independent fictional read-only LOGIN can read grants',
      protectedState.rows[0]?.count === 1);
    const roles = await readonly.query<{superuser: string}>(
      "SELECT current_setting('is_superuser') AS superuser",
    );
    prove('independent grant read account does not have superuser rights',
      roles.rows[0]?.superuser === 'off');

    async function denied(statement: string, args: string[] = []): Promise<boolean> {
      try {
        await readonly!.query(statement, args);
        return false;
      } catch (e) {
        return (e as {code?: string})?.code === '42501';
      }
    }
    prove('read-only account cannot INSERT a writer grant',
      await denied(
        'INSERT INTO writer_studio_beta_grants(member_id,approved_by) VALUES($1,$2)',
        [targetWriter, founder],
      ));
    prove('read-only account cannot UPDATE accepted/revoked beta grants',
      await denied(
        "UPDATE writer_studio_beta_grants SET grant_state='revoked' WHERE member_id=$1",
        [targetWriter],
      ));
    prove('read-only account cannot DELETE current writer grants',
      await denied('DELETE FROM writer_studio_beta_grants WHERE member_id=$1', [targetWriter]));
    prove('read-only account cannot UPDATE canary issued_seats or founder binding',
      await denied(
        'UPDATE writer_studio_pilot_admission_control SET issued_seats=0 WHERE singleton=TRUE',
      ));
    prove('read-only LOGIN cannot grant itself owner permissions or switch to postgres',
      await denied('SET ROLE postgres'));
    const after = await admin.query<{count: number;issued_seats: number}>(
      `SELECT
         (SELECT COUNT(*)::int FROM writer_studio_beta_grants) AS count,
         (SELECT issued_seats FROM writer_studio_pilot_admission_control
           WHERE singleton=TRUE) AS issued_seats`,
    );
    prove('all refused writes left both grant rows and canary count unchanged',
      after.rows[0]?.count === 1 && after.rows[0]?.issued_seats === 2);
    process.stdout.write('RESULT: ' + checks + '/' + checks +
      ' separate SQL role privilege-boundary checks PASS\n');
  } finally {
    if (readonly) await readonly.end();
    await admin.end();
  }
}
main().catch((error) => {
  process.stderr.write('R9 fixture role proof FAILED (' + (error as Error).name + ')\n');
  process.exitCode = 1;
});
