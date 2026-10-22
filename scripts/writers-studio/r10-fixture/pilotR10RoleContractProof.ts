/**
 * WS-TIERS-R10 -- fictional PostgreSQL16 role/guarded mutation contract.
 * DO NOT connect to any production or staging DB. Only fresh Docker PG16
 * at 127.0.0.1:55439/postgres is allowed; never reuse existing state.
 *
 * This does NOT cryptographically verify an R20 receipt: execution
 * authority is a separate restricted login. The real signer/current-head
 * trust and its credential custody remain UNPROVISIONED and held.
 */
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, statfsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { Client, Pool } from 'pg';

const input = process.env.WS_R10_FIXTURE_DATABASE_URL;
if (!input) throw new Error('R10_explicit_disposable_URL_required');
const parsed = new URL(input);
if (parsed.protocol !== 'postgresql:' || parsed.hostname !== '127.0.0.1'
  || parsed.port !== '55439' || parsed.pathname !== '/postgres'
  || parsed.username !== 'postgres' || process.env.NODE_ENV === 'production') {
  throw new Error('R10_refused_nonfictional_database');
}
const disk = statfsSync(process.cwd());
if ((disk.bavail * disk.bsize) / (1024 ** 3) < 6) {
  throw new Error('R10_refused_insufficient_host_disk');
}
// Pin the EXACT throwaway Docker container, image, tmpfs storage and port.
// An arbitrary empty postgres database listening on this port is NOT proof
// that it is owned by the R10 witness, even if its URL looks correct.
let witnessContainer: {
  Config?: { Image?: string };
  State?: { Running?: boolean };
  HostConfig?: {
    Tmpfs?: Record<string,string>;
    PortBindings?: Record<string, Array<{HostIp?:string;HostPort?:string}>>;
  };
};
try {
  const inspect = JSON.parse(execFileSync('/usr/local/bin/docker', [
    'inspect', 'ws-tiers-r2-fictional-20261022',
  ], { encoding: 'utf8', timeout: 15000 }));
  witnessContainer = inspect[0];
} catch { throw new Error('R10_refused_unverified_test_container'); }
if (witnessContainer.Config?.Image !== 'postgres:16'
  || witnessContainer.State?.Running !== true
  || !witnessContainer.HostConfig?.Tmpfs?.['/var/lib/postgresql/data']?.startsWith('rw,size=384m')
  || !witnessContainer.HostConfig?.Tmpfs?.['/tmp']?.startsWith('rw,size=128m')
  || witnessContainer.HostConfig?.PortBindings?.['5432/tcp']?.[0]?.HostIp !== '127.0.0.1'
  || witnessContainer.HostConfig?.PortBindings?.['5432/tcp']?.[0]?.HostPort !== '55439') {
  throw new Error('R10_refused_unverified_test_container');
}

const founder = '11111111-1111-4111-8111-111111111111';
const writerA = '22222222-2222-4222-8222-222222222222';
const writerB = '33333333-3333-4333-8333-333333333333';
const outsider = '44444444-4444-4444-8444-444444444444';

const applySql =
  'SELECT public.writer_r10_fixture_apply_event($1::uuid,$2::text,$3::uuid,$4::uuid,$5::uuid) AS status';
const makeOp = (action: 'issued' | 'accepted' | 'revoked',
  memberId: string, actorId: string, grantId: string, operationId = randomUUID()) =>
  ({ action, memberId, actorId, grantId, operationId });

type Op = ReturnType<typeof makeOp>;
async function execute(pool: Pool, op: Op): Promise<string> {
  const r = await pool.query<{status: string}>(applySql,
    [op.operationId, op.action, op.memberId, op.actorId, op.grantId]);
  return r.rows[0]?.status ?? 'no_status';
}
async function denied(pool: Pool, sql: string, args: unknown[] = []):
  Promise<boolean> {
  try { await pool.query(sql, args); return false; }
  catch (err) { return (err as {code?: string}).code === '42501'; }
}
async function refused(pool: Pool, op: Op): Promise<boolean> {
  try { await execute(pool, op); return false; }
  catch (err) { return ['P0001', '23505', '23514', '42501'].includes(
    (err as {code?: string}).code ?? '',
  ); }
}

async function main() {
  const admin = new Client({ connectionString: input });
  await admin.connect();
  let reader: Pool | null = null;
  let mutator: Pool | null = null;
  let count = 0;
  const proof = (label: string, good: boolean) => {
    assert.equal(good, true, label);
    count++;
    process.stdout.write('PASS ' + String(count).padStart(2, '0') + ' ' + label + '\n');
  };
  try {
    const pre = await admin.query<{version_num:string;tables:number}>(
      `SELECT current_setting('server_version_num') AS version_num,
        (SELECT count(*)::int FROM pg_tables
          WHERE schemaname='public') AS tables`,
    );
    if (!pre.rows[0]?.version_num.startsWith('16') || pre.rows[0]?.tables !== 0) {
      throw new Error('R10_refused_reused_or_wrong_version_database');
    }
    proof('fresh empty dedicated PostgreSQL16 database', true);
    await admin.query('CREATE TABLE public.members(id UUID PRIMARY KEY, admin_role TEXT)');
    await admin.query(`CREATE TABLE public.ops_contacts (
      member_id UUID REFERENCES public.members(id),
      contact_type TEXT, pipeline_stage TEXT, deleted_at TIMESTAMPTZ
    )`);
    await admin.query(readFileSync(resolve(process.cwd(),
      'database/migrations/20261022000001_writer_studio_pilot_grants_r2.sql'), 'utf8'));
    await admin.query(readFileSync(resolve(process.cwd(),
      'scripts/writers-studio/r10-fixture/pilotRoleContract.sql'), 'utf8'));
    proof('R2/R3 founder + R10 single-function contract installed only in disposable PG', true);
    for (const id of [founder, writerA, writerB, outsider]) {
      await admin.query('INSERT INTO public.members(id,admin_role) VALUES($1,$2)', [
        id, id === founder ? 'founder' : null,
      ]);
      if (id !== founder) {
        await admin.query(`INSERT INTO public.ops_contacts
          (member_id,contact_type,pipeline_stage)
          VALUES($1,'beta_tester','active')`, [id]);
      }
    }
    await admin.query(`UPDATE public.writer_studio_pilot_admission_control
      SET founder_member_id=$1 WHERE singleton=TRUE`, [founder]);
    proof('one fictional founder and three fictional candidates seeded', true);

    const readerRole = 'writer_r10_fixture_reader';
    const mutatorRole = 'writer_r10_fixture_mutator';
    const readerPassword = randomBytes(32).toString('hex');
    const mutatorPassword = randomBytes(32).toString('hex');
    const existingRoles = await admin.query<{names: string[]}>(
      `SELECT ARRAY_AGG(rolname) AS names FROM pg_roles
         WHERE rolname = ANY($1::text[])`, [[readerRole, mutatorRole]],
    );
    if (existingRoles.rows[0]?.names?.length) {
      throw new Error('R10_refused_preexisting_roles');
    }
    await admin.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
    for (const [role,password] of [
      [readerRole,readerPassword], [mutatorRole,mutatorPassword],
    ]) {
      // Identifiers are hardcoded fixtures; passwords are random in memory.
      await admin.query(`CREATE ROLE ${role} LOGIN NOINHERIT NOSUPERUSER
        NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '${password}'`);
      await admin.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
    }
    await admin.query(`GRANT SELECT ON TABLE
      public.writer_studio_beta_grants,
      public.writer_studio_pilot_admission_control
      TO writer_r10_fixture_reader`);
    await admin.query(`GRANT EXECUTE ON FUNCTION
      public.writer_r10_fixture_apply_event(UUID,TEXT,UUID,UUID,UUID)
      TO writer_r10_fixture_mutator`);
    const credentials = (user: string, password: string) => ({
      host: '127.0.0.1', port: 55439, database: 'postgres',
      user, password, max: 12,
    });
    reader = new Pool(credentials(readerRole, readerPassword));
    mutator = new Pool(credentials(mutatorRole, mutatorPassword));

    proof('separate reader and mutator logins can authenticate', (
      await reader.query('SELECT current_user AS role')).rows[0]?.role === readerRole
      && (await mutator.query('SELECT current_user AS role')).rows[0]?.role === mutatorRole);
    const rl = await reader.query<{superuser:string}>(
      "SELECT current_setting('is_superuser') AS superuser",
    );
    const ml = await mutator.query<{superuser:string}>(
      "SELECT current_setting('is_superuser') AS superuser",
    );
    proof('neither login is owner/superuser', rl.rows[0]?.superuser === 'off'
      && ml.rows[0]?.superuser === 'off');

    proof('reader can see member-grant state',
      (await reader.query<{count:number}>(
        'SELECT COUNT(*)::int AS count FROM public.writer_studio_beta_grants',
      )).rows[0]?.count === 0);
    proof('reader cannot execute restricted write function',
      await denied(reader, applySql, [randomUUID(),'issued',writerA,founder,randomUUID()]));
    proof('PUBLIC function EXECUTE was revoked; reader cannot inherit it', (
      await admin.query<{ allowed:boolean }>(`SELECT has_function_privilege(
        $1, 'public.writer_r10_fixture_apply_event(uuid,text,uuid,uuid,uuid)',
        'EXECUTE') AS allowed`, [readerRole])).rows[0]?.allowed === false);

    proof('reader cannot insert grant directly',
      await denied(reader, `INSERT INTO public.writer_studio_beta_grants
        (member_id,grant_id,approved_by) VALUES($1,$2,$3)`,
      [writerA,randomUUID(),founder]));
    proof('reader cannot update grant state',
      await denied(reader,
        `UPDATE public.writer_studio_beta_grants
         SET grant_state='revoked' WHERE member_id=$1`, [writerA]));
    proof('reader cannot delete grant row',
      await denied(reader,
        'DELETE FROM public.writer_studio_beta_grants WHERE member_id=$1', [writerA]));
    proof('reader cannot rewrite two-seat gate',
      await denied(reader, `UPDATE public.writer_studio_pilot_admission_control
        SET issued_seats=0 WHERE singleton=TRUE`));
    proof('reader cannot access mutation operation log',
      await denied(reader, 'SELECT * FROM public.writer_r10_fixture_applied_operations'));
    proof('reader cannot create a replacement public function or table',
      await denied(reader, 'CREATE TABLE public.writer_r10_untrusted_test(id int)'));
    proof('reader cannot elevate to mutator or postgres',
      await denied(reader, 'SET ROLE writer_r10_fixture_mutator')
      && await denied(reader, 'SET ROLE postgres'));

    proof('mutator cannot read raw grant table directly',
      await denied(mutator, 'SELECT * FROM public.writer_studio_beta_grants'));
    proof('mutator cannot INSERT raw grant row',
      await denied(mutator, `INSERT INTO public.writer_studio_beta_grants
        (member_id,grant_id,approved_by) VALUES($1,$2,$3)`,
      [writerA,randomUUID(),founder]));
    proof('mutator cannot directly update grant state',
      await denied(mutator, `UPDATE public.writer_studio_beta_grants
        SET grant_state='accepted' WHERE member_id=$1`, [writerA]));
    proof('mutator cannot directly delete grant row',
      await denied(mutator,
        'DELETE FROM public.writer_studio_beta_grants WHERE member_id=$1', [writerA]));
    proof('mutator cannot rewrite issued-seat counter',
      await denied(mutator, `UPDATE public.writer_studio_pilot_admission_control
        SET issued_seats=0 WHERE singleton=TRUE`));
    proof('mutator cannot inspect protected member or contact data',
      await denied(mutator, 'SELECT * FROM public.members')
      && await denied(mutator, 'SELECT * FROM public.ops_contacts'));
    proof('mutator cannot read/alter its own operation log directly',
      await denied(mutator,'SELECT * FROM public.writer_r10_fixture_applied_operations')
      && await denied(mutator, `DELETE FROM
        public.writer_r10_fixture_applied_operations`));
    proof('mutator cannot CREATE or REPLACE a public function',
      await denied(mutator, `CREATE FUNCTION public.writer_r10_fake()
        RETURNS INT LANGUAGE SQL AS 'SELECT 1'`));
    proof('mutator cannot assume postgres or reader roles',
      await denied(mutator, 'SET ROLE postgres')
      && await denied(mutator, 'SET ROLE writer_r10_fixture_reader'));
    proof('function owner differs from mutator and is not trusted by login role membership', (
      await admin.query<{owner:string}>(`SELECT pg_get_userbyid(p.proowner) AS owner
       FROM pg_proc p WHERE p.oid =
         'public.writer_r10_fixture_apply_event(uuid,text,uuid,uuid,uuid)'::regprocedure`))
       .rows[0]?.owner === 'postgres');

    // REQUIRED NEGATIVE PROOF: a compromised mutator login can submit its
    // OWN invented "issued" input because PostgreSQL does not itself verify
    // an external Ed25519/WORM event. The transaction is rolled back so this
    // negative test consumes NO seat and retains NO fictional grant.
    const unsafe = await mutator.connect();
    let unsealedCanApply = false;
    try {
      await unsafe.query('BEGIN');
      const crafted = makeOp('issued',outsider,founder,randomUUID());
      const r = await unsafe.query<{status:string}>(applySql, [
        crafted.operationId,crafted.action,crafted.memberId,
        crafted.actorId,crafted.grantId,
      ]);
      unsealedCanApply = r.rows[0]?.status === 'applied';
      await unsafe.query('ROLLBACK');
    } finally {
      unsafe.release();
    }
    proof('NEGATIVE: stolen mutator login could forge an issue without R20 signer proof',
      unsealedCanApply);
    proof('forged fixture transaction rolled back with no issued seat or grant',
      (await admin.query<{issued_seats:number}>(`SELECT issued_seats FROM
        public.writer_studio_pilot_admission_control WHERE singleton=TRUE`))
       .rows[0]?.issued_seats === 0 &&
      (await admin.query<{n:number}>(`SELECT count(*)::int AS n FROM
        public.writer_studio_beta_grants`)).rows[0]?.n === 0);

    const idA = randomUUID();
    const idB = randomUUID();
    const issueA = makeOp('issued', writerA, founder, idA);
    const issueB = makeOp('issued', writerB, founder, idB);
    proof('service-only function accepts externally supplied A grant generation',
      await execute(mutator, issueA) === 'applied');
    proof('exact issue A operation replays without another seat',
      await execute(mutator, issueA) === 'replayed');
    proof('same operation ID cannot be rebound to a new member',
      await refused(mutator,{...issueA,memberId:writerB}));
    proof('same operation ID cannot be rebound to a different grant',
      await refused(mutator,{...issueA,grantId:randomUUID()}));
    proof('same member with different operation cannot mint another grant',
      await refused(mutator,makeOp('issued',writerA,founder,randomUUID())));

    const duplicates = await Promise.all(Array.from(
      {length:8},()=>execute(mutator,issueB)));
    proof('8 concurrent B requests yield exactly one applied and 7 replayed',
      duplicates.filter(x=>x==='applied').length===1
      && duplicates.filter(x=>x==='replayed').length===7);
    proof('distinct A/B grant generations are preserved',
      idA!==idB
      && (await admin.query<{grant_id:string}>(`SELECT grant_id::text
        FROM public.writer_studio_beta_grants WHERE member_id=$1`,
      [writerA])).rows[0]?.grant_id === idA
      && (await admin.query<{grant_id:string}>(`SELECT grant_id::text
        FROM public.writer_studio_beta_grants WHERE member_id=$1`,
      [writerB])).rows[0]?.grant_id === idB);
    proof('two issued grants use exactly two irreversible SQL seats',
      (await admin.query<{issued_seats:number}>(`SELECT issued_seats
        FROM public.writer_studio_pilot_admission_control WHERE singleton=TRUE`))
        .rows[0]?.issued_seats===2);
    proof('third eligible writer is denied even through privileged service function',
      await refused(mutator,makeOp('issued',outsider,founder,randomUUID())));

    proof('nonfounder cannot mint a pilot grant even with mutator credential',
      await refused(mutator,makeOp('issued',outsider,outsider,randomUUID())));
    proof('founder cannot enroll their own account as a beta writer',
      await refused(mutator,makeOp('issued',founder,founder,randomUUID())));
    proof('issued A has pending status until author acceptance', (
      await reader.query<{grant_state:string}>(`SELECT grant_state
        FROM public.writer_studio_beta_grants WHERE member_id=$1`,
      [writerA])).rows[0]?.grant_state==='pending');

    const acceptA = makeOp('accepted',writerA,writerA,idA);
    proof('writer-owned A acceptance transitions exactly sealed grant',
      await execute(mutator,acceptA)==='applied');
    proof('A accepted operation can be idempotently retried',
      await execute(mutator,acceptA)==='replayed');
    proof('different writer B cannot accept A grant generation',
      await refused(mutator,makeOp('accepted',writerB,writerB,idA)));
    proof('founder cannot impersonate A acceptance from SQL service routine',
      await refused(mutator,makeOp('accepted',writerA,founder,idA)));
    proof('new accept operation cannot accept already accepted grant twice',
      await refused(mutator,makeOp('accepted',writerA,writerA,idA)));
    proof('writer B can accept B without affecting A',
      await execute(mutator,makeOp('accepted',writerB,writerB,idB))==='applied');
    proof('read-only app sees two accepted grants after service writes', (
      await reader.query<{count:number}>(`SELECT count(*)::int AS count
        FROM public.writer_studio_beta_grants WHERE grant_state='accepted'`))
        .rows[0]?.count === 2);

    const revokeA = makeOp('revoked',writerA,founder,idA);
    proof('founder can apply terminal revoke through separate service-only routine',
      await execute(mutator,revokeA)==='applied');
    proof('terminal revoke returns same operation as replay',
      await execute(mutator,revokeA)==='replayed');
    proof('older issued and accepted operation IDs cannot regain authorization',
      await refused(mutator,issueA) && await refused(mutator,acceptA));
    proof('new issued grant cannot reactivate revoked A',
      await refused(mutator,makeOp('issued',writerA,founder,randomUUID())));
    proof('nonfounder cannot revoke unrelated member B',
      await refused(mutator,makeOp('revoked',writerB,writerB,idB)));
    proof('writer B stays accepted after A revocation', (
      await reader.query<{grant_state:string}>(`SELECT grant_state
        FROM public.writer_studio_beta_grants WHERE member_id=$1`,
      [writerB])).rows[0]?.grant_state==='accepted');

    await admin.query(
      'DELETE FROM public.writer_studio_beta_grants WHERE member_id=$1', [writerA]);
    proof('deleted revoked A row does not replenish two-seat count', (
      await admin.query<{issued_seats:number}>(`SELECT issued_seats
        FROM public.writer_studio_pilot_admission_control WHERE singleton=TRUE`))
        .rows[0]?.issued_seats===2);
    proof('terminal event record survives local grant row deletion', (
      await admin.query<{count:number}>(`SELECT count(*)::int AS count
        FROM public.writer_r10_fixture_applied_operations
        WHERE grant_id=$1 AND action='revoked'`,[idA])).rows[0]?.count===1);
    proof('stale issued and accepted operations stay refused even after cleanup',
      await refused(mutator,issueA) && await refused(mutator,acceptA));
    proof('replayed terminal revoked event stays idempotent after cleanup',
      await execute(mutator,revokeA)==='replayed');
    proof('third writer still denied after revoked-row cleanup',
      await refused(mutator,makeOp('issued',outsider,founder,randomUUID())));
    proof('no previously issued IDs changed and B remains sole local row', (
      await reader.query<{grant_id:string}>(`SELECT grant_id::text
        FROM public.writer_studio_beta_grants WHERE member_id=$1`,
      [writerB])).rows[0]?.grant_id===idB);
    proof('no service privilege escalation after all transitions',
      await denied(mutator,`UPDATE public.writer_studio_pilot_admission_control
        SET issued_seats=0 WHERE singleton=TRUE`)
      && await denied(reader,applySql,
        [randomUUID(),'issued',outsider,founder,randomUUID()]));

    const last = await admin.query<{log_count:number;seats:number;count:number}>(
      `SELECT
       (SELECT count(*)::int FROM public.writer_r10_fixture_applied_operations) AS log_count,
       (SELECT issued_seats FROM public.writer_studio_pilot_admission_control
         WHERE singleton=TRUE) AS seats,
       (SELECT count(*)::int FROM public.writer_studio_beta_grants) AS count`);
    proof('final SQL state contains exactly two issued seats and one remaining grant',
      last.rows[0]?.seats===2 && last.rows[0]?.count===1
      && (last.rows[0]?.log_count??0)>=5);
    process.stdout.write('RESULT: '+count+'/'+count
      +' R10 fictional role-separated PostgreSQL16 checks PASS\n');
  } finally {
    await Promise.all([reader?.end(),mutator?.end()]);
    await admin.end();
  }
}
main().catch((error) => {
  process.stderr.write('R10 fictional privilege proof FAILED ('
    +(error as Error).name+')\n');
  process.exitCode=1;
});
