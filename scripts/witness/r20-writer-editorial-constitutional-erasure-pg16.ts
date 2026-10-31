/** FICTIONAL ONLY: physical PostgreSQL witness for R20 Writer editorial erasure. */
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

type Check = { name: string; pass: boolean; detail?: unknown };
const checks: Check[] = [];
function check(name: string, pass: boolean, detail?: unknown): void {
  checks.push({ name, pass, ...(detail === undefined ? {} : { detail }) });
  if (!pass) throw new Error(`CHECK_FAILED:${name}`);
}
async function expectedError(name: string, pattern: RegExp, fn: () => Promise<unknown>): Promise<void> {
  let observed = '';
  try { await fn(); } catch (error) { observed = error instanceof Error ? error.message : String(error); }
  check(name, pattern.test(observed), { pattern: String(pattern), observed });
}
const qid = (n: number) => `${String(n).padStart(8,'0')}-1111-4111-8111-${String(n).padStart(12,'0')}`;

const A = {
  member: qid(1), manuscript: qid(2), chain: qid(3), root: qid(4), head: qid(5),
  thread: qid(6), relationship: qid(7), offer: qid(8), direction: qid(9), insight: qid(10),
  auth: qid(11), origin: qid(12), receipt: qid(13), manifest: qid(14), recovery: qid(15),
};
const B = {
  member: qid(101), manuscript: qid(102), chain: qid(103), root: qid(104),
  thread: qid(106), relationship: qid(107), offer: qid(108), direction: qid(109), insight: qid(110),
  auth: qid(111), origin: qid(112), receipt: qid(113), manifest: qid(114), recovery: qid(115),
};
const E = {
  member: qid(201), manuscript: qid(202), chain: qid(203), root: qid(204),
  thread: qid(206), relationship: qid(207), offer: qid(208), direction: qid(209), insight: qid(210),
  auth: qid(211), origin: qid(212), receipt: qid(213), manifest: qid(214), recovery: qid(215),
};

async function seedLineage(db: Client, x: typeof A, twoVersions = false): Promise<void> {
  await db.query('INSERT INTO members(id) VALUES($1)', [x.member]);
  await db.query('INSERT INTO member_manuscripts(id,member_id) VALUES($1,$2)', [x.manuscript,x.member]);
  await db.query('INSERT INTO proposal_chains(id,member_id,work_id) VALUES($1,$2,$3)', [x.chain,x.member,x.manuscript]);
  await db.query("INSERT INTO proposal_versions(id,chain_id,author,formulation,supersedes) VALUES($1,$2,'member','fictional-root',NULL)", [x.root,x.chain]);
  if (twoVersions) {
    await db.query("INSERT INTO proposal_versions(id,chain_id,author,formulation,supersedes) VALUES($1,$2,'member','fictional-head',$3)", [x.head,x.chain,x.root]);
  }
  const version = twoVersions ? x.head : x.root;
  await db.query('INSERT INTO ask_threads(id,manuscript_id,member_id,proposal_chain_id) VALUES($1,$2,$3,$4)', [x.thread,x.manuscript,x.member,x.chain]);
  await db.query('INSERT INTO manuscript_revision_offers(id,manuscript_id) VALUES($1,$2)', [x.offer,x.manuscript]);
  await db.query('INSERT INTO writer_editorial_relationships(id,manuscript_id) VALUES($1,$2)', [x.relationship,x.manuscript]);
  await db.query("INSERT INTO proposal_chain_insights(id,member_id,proposal_chain_id,author,observation) VALUES($1,$2,$3,'maia','fictional-insight')", [x.insight,x.member,x.chain]);
  await db.query("INSERT INTO proposal_chain_directions(id,member_id,proposal_chain_id,author,instruction,refers_to_version_id) VALUES($1,$2,$3,'member','fictional-direction',$4)", [x.direction,x.member,x.chain,version]);
  await db.query('INSERT INTO manuscript_revision_authorizations(id,member_id,proposal_chain_id,proposal_version_id) VALUES($1,$2,$3,$4)', [x.auth,x.member,x.chain,version]);
  await db.query("INSERT INTO manuscript_application_recovery(authorization_id,before_body,after_body) VALUES($1,'before','after')", [x.auth]);
  await db.query('INSERT INTO writer_editorial_chain_origins(proposal_chain_id,member_id,manuscript_id) VALUES($1,$2,$3)', [x.chain,x.member,x.manuscript]);
  await db.query('INSERT INTO writer_editorial_thread_origins(id,thread_id,proposal_chain_id,member_id,manuscript_id) VALUES($1,$2,$3,$4,$5)', [x.origin,x.thread,x.chain,x.member,x.manuscript]);
  await db.query('INSERT INTO writer_editorial_save_receipts(member_id,idempotency_key,relationship_id,thread_id,proposal_chain_id,proposal_version_id) VALUES($1,$2,$3,$4,$5,$6)', [x.member,x.receipt,x.relationship,x.thread,x.chain,version]);
  await db.query("INSERT INTO editorial_turn_bindings(thread_id,turn_index,proposal_chain_id,version_id) VALUES($1,0,$2,$3)", [x.thread,x.chain,version]);
}
async function authorize(db: Client, x: typeof A): Promise<void> {
  await db.query("INSERT INTO deletion_manifests(id,reason_class,authorized_by,executed_at) VALUES($1,'member_deletion','fictional-member',now())", [x.manifest]);
  await db.query("INSERT INTO provenance_tombstones(manifest_id,object_kind,object_id) VALUES($1,'member_manuscripts',$2)", [x.manifest,x.manuscript]);
}
async function triggerStates(db: Client): Promise<Record<string,string>> {
  const names = [
    'application_recovery_immutable','mra_identity_immutable','proposal_chain_insights_no_delete',
    'proposal_chain_directions_no_delete','proposal_versions_immutable','proposal_chains_immutable','weco_preserve',
  ];
  const rows = await db.query<{tgname:string;tgenabled:string}>(
    'SELECT tgname,tgenabled FROM pg_trigger WHERE tgname = ANY($1::text[]) ORDER BY tgname',[names]);
  return Object.fromEntries(rows.rows.map(r=>[r.tgname,r.tgenabled]));
}
async function lineageCounts(db: Client, chain: string): Promise<Record<string,number>> {
  const r=await db.query(`SELECT
    (SELECT count(*)::int FROM proposal_chains WHERE id=$1) chains,
    (SELECT count(*)::int FROM proposal_versions WHERE chain_id=$1) versions,
    (SELECT count(*)::int FROM proposal_chain_insights WHERE proposal_chain_id=$1) insights,
    (SELECT count(*)::int FROM proposal_chain_directions WHERE proposal_chain_id=$1) directions,
    (SELECT count(*)::int FROM manuscript_revision_authorizations WHERE proposal_chain_id=$1) authorizations,
    (SELECT count(*)::int FROM writer_editorial_chain_origins WHERE proposal_chain_id=$1) chain_origins,
    (SELECT count(*)::int FROM writer_editorial_thread_origins WHERE proposal_chain_id=$1) thread_origins,
    (SELECT count(*)::int FROM writer_editorial_save_receipts WHERE proposal_chain_id=$1) receipts,
    (SELECT count(*)::int FROM editorial_turn_bindings WHERE proposal_chain_id=$1) bindings`,[chain]);
  return r.rows[0] as Record<string,number>;
}

async function main(): Promise<void> {
  if (process.env.WS_R20_EDITORIAL_ERASURE_PG16 !== 'fictional-only') throw new Error('FICTIONAL_OPT_IN_REQUIRED');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL_REQUIRED');
  const db=new Client({connectionString:process.env.DATABASE_URL,application_name:'ws_r20_editorial_erasure_fictional'});
  await db.connect();
  try {
    const identity=await db.query("SELECT current_database() db,current_user usr,current_setting('server_version') ver");
    check('exact disposable database identity', identity.rows[0]?.db==='ws_r20_editorial' && identity.rows[0]?.usr==='fict', identity.rows[0]);
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE ROLE maia_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
      CREATE ROLE outsider LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
      CREATE TABLE members(id uuid PRIMARY KEY);
      CREATE TABLE member_manuscripts(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
      CREATE TABLE deletion_manifests(id uuid PRIMARY KEY,reason_class text NOT NULL,authorized_by text NOT NULL,executed_at timestamptz,created_at timestamptz DEFAULT now(),note text);
      CREATE TABLE provenance_tombstones(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),manifest_id uuid NOT NULL REFERENCES deletion_manifests(id),object_kind text NOT NULL,object_id text NOT NULL,tombstoned_at timestamptz DEFAULT now(),UNIQUE(object_kind,object_id));
      CREATE TABLE proposal_chains(id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id),work_id uuid NOT NULL,UNIQUE(member_id,id),UNIQUE(member_id,work_id,id));
      CREATE TABLE proposal_versions(id uuid PRIMARY KEY,chain_id uuid NOT NULL REFERENCES proposal_chains(id) ON DELETE RESTRICT,author text NOT NULL,formulation text NOT NULL,supersedes uuid,UNIQUE(chain_id,id),UNIQUE(chain_id,id,author),FOREIGN KEY(chain_id,supersedes) REFERENCES proposal_versions(chain_id,id) ON DELETE RESTRICT);
      CREATE TABLE ask_threads(id uuid PRIMARY KEY,manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,member_id uuid NOT NULL REFERENCES members(id),proposal_chain_id uuid REFERENCES proposal_chains(id) ON DELETE RESTRICT,UNIQUE(id,proposal_chain_id));
      CREATE TABLE manuscript_revision_offers(id uuid PRIMARY KEY,manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE);
      CREATE TABLE writer_editorial_relationships(id uuid PRIMARY KEY,manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE);
      CREATE TABLE proposal_chain_insights(id uuid PRIMARY KEY,member_id uuid NOT NULL,proposal_chain_id uuid NOT NULL,author text NOT NULL,observation text NOT NULL,FOREIGN KEY(member_id,proposal_chain_id) REFERENCES proposal_chains(member_id,id) ON DELETE RESTRICT);
      CREATE TABLE proposal_chain_directions(id uuid PRIMARY KEY,member_id uuid NOT NULL,proposal_chain_id uuid NOT NULL,author text NOT NULL,instruction text NOT NULL,refers_to_version_id uuid,UNIQUE(proposal_chain_id,id,author),FOREIGN KEY(member_id,proposal_chain_id) REFERENCES proposal_chains(member_id,id) ON DELETE RESTRICT,FOREIGN KEY(proposal_chain_id,refers_to_version_id) REFERENCES proposal_versions(chain_id,id) ON DELETE RESTRICT);
      CREATE TABLE manuscript_revision_authorizations(id uuid PRIMARY KEY,member_id uuid NOT NULL,proposal_chain_id uuid NOT NULL,proposal_version_id uuid NOT NULL,FOREIGN KEY(member_id,proposal_chain_id) REFERENCES proposal_chains(member_id,id) ON DELETE RESTRICT,FOREIGN KEY(proposal_chain_id,proposal_version_id) REFERENCES proposal_versions(chain_id,id) ON DELETE RESTRICT);
      CREATE TABLE manuscript_application_recovery(authorization_id uuid PRIMARY KEY REFERENCES manuscript_revision_authorizations(id) ON DELETE RESTRICT,before_body text NOT NULL,after_body text NOT NULL);
      CREATE TABLE writer_editorial_chain_origins(proposal_chain_id uuid PRIMARY KEY REFERENCES proposal_chains(id) ON DELETE RESTRICT,member_id uuid NOT NULL,manuscript_id uuid NOT NULL);
      CREATE TABLE writer_editorial_thread_origins(id uuid PRIMARY KEY,thread_id uuid NOT NULL UNIQUE REFERENCES ask_threads(id) ON DELETE CASCADE,proposal_chain_id uuid NOT NULL,member_id uuid NOT NULL,manuscript_id uuid NOT NULL,FOREIGN KEY(proposal_chain_id) REFERENCES writer_editorial_chain_origins(proposal_chain_id) ON DELETE RESTRICT);
      CREATE TABLE writer_editorial_save_receipts(member_id uuid NOT NULL,idempotency_key uuid NOT NULL,relationship_id uuid NOT NULL REFERENCES writer_editorial_relationships(id) ON DELETE CASCADE,thread_id uuid NOT NULL,proposal_chain_id uuid NOT NULL,proposal_version_id uuid NOT NULL,PRIMARY KEY(member_id,idempotency_key),FOREIGN KEY(thread_id,proposal_chain_id) REFERENCES ask_threads(id,proposal_chain_id) ON DELETE CASCADE,FOREIGN KEY(proposal_chain_id,proposal_version_id) REFERENCES proposal_versions(chain_id,id) ON DELETE CASCADE);
      CREATE TABLE editorial_turn_bindings(thread_id uuid NOT NULL REFERENCES ask_threads(id) ON DELETE CASCADE,turn_index int NOT NULL,proposal_chain_id uuid NOT NULL,version_id uuid,PRIMARY KEY(thread_id,turn_index),FOREIGN KEY(proposal_chain_id,version_id) REFERENCES proposal_versions(chain_id,id) ON DELETE RESTRICT);
      CREATE TABLE external_chain_blocker(chain_id uuid PRIMARY KEY REFERENCES proposal_chains(id) ON DELETE RESTRICT);

      CREATE FUNCTION fixture_refuse() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'immutable_fixture'; END $$;
      CREATE FUNCTION fixture_weto_preserve() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF EXISTS(SELECT 1 FROM ask_threads WHERE id=OLD.thread_id) THEN RAISE EXCEPTION 'live_thread_retained'; END IF; RETURN OLD; END $$;
      CREATE TRIGGER proposal_chains_immutable BEFORE UPDATE OR DELETE ON proposal_chains FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER proposal_versions_immutable BEFORE UPDATE OR DELETE ON proposal_versions FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER proposal_chain_insights_no_delete BEFORE DELETE ON proposal_chain_insights FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER proposal_chain_directions_no_delete BEFORE DELETE ON proposal_chain_directions FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER mra_identity_immutable BEFORE UPDATE OR DELETE ON manuscript_revision_authorizations FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER application_recovery_immutable BEFORE UPDATE OR DELETE ON manuscript_application_recovery FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER weco_preserve BEFORE UPDATE OR DELETE ON writer_editorial_chain_origins FOR EACH ROW EXECUTE FUNCTION fixture_refuse();
      CREATE TRIGGER weto_preserve BEFORE UPDATE OR DELETE ON writer_editorial_thread_origins FOR EACH ROW EXECUTE FUNCTION fixture_weto_preserve();
    `);
    const migration=fs.readFileSync(path.join(process.cwd(),'database/migrations/20261025000001_r20_writer_editorial_constitutional_erasure.sql'),'utf8');
    await db.query(migration);
    check('public execution revoked', !(await db.query("SELECT has_function_privilege('outsider','public.r20_erase_writer_editorial_history(uuid,uuid,uuid)','EXECUTE') ok")).rows[0]?.ok);
    check('maia_app execution granted', Boolean((await db.query("SELECT has_function_privilege('maia_app','public.r20_erase_writer_editorial_history(uuid,uuid,uuid)','EXECUTE') ok")).rows[0]?.ok));

    await seedLineage(db,A,true); await seedLineage(db,B,false); await seedLineage(db,E,false);
    await expectedError('ordinary immutable deletion remains refused',/immutable_fixture/,()=>db.query('DELETE FROM proposal_versions WHERE id=$1',[B.root]));
    await expectedError('manuscript must already be absent',/r20_writer_editorial_manuscript_still_present/,()=>db.query('SELECT r20_erase_writer_editorial_history($1,$2,$3)',[B.manifest,B.member,B.manuscript]));

    // A: same transaction ordinary cascade + constitutional erasure.
    await db.query('BEGIN');
    await db.query('DELETE FROM member_manuscripts WHERE id=$1 AND member_id=$2',[A.manuscript,A.member]);
    await authorize(db,A);
    const result=(await db.query<{r:Record<string,number>}>('SELECT r20_erase_writer_editorial_history($1,$2,$3) r',[A.manifest,A.member,A.manuscript])).rows[0]!.r;
    await db.query('COMMIT');
    check('target lineage deleted with head-to-root version count', result.chains===1 && result.versions===2 && result.directions===1 && result.insights===1 && result.authorizations===1 && result.recovery===1 && result.chainOrigins===1, result);
    check('target rows absent', Object.values(await lineageCounts(db,A.chain)).every(n=>n===0), await lineageCounts(db,A.chain));
    check('bystander lineage preserved', Object.values(await lineageCounts(db,B.chain)).every(n=>n===1), await lineageCounts(db,B.chain));
    check('all seven immutable triggers enabled after success', Object.values(await triggerStates(db)).length===7 && Object.values(await triggerStates(db)).every(v=>v==='O'), await triggerStates(db));

    // E: forced FK failure after inner deletions must roll back every row + trigger state.
    await db.query('INSERT INTO external_chain_blocker(chain_id) VALUES($1)',[E.chain]);
    await db.query('BEGIN');
    await db.query('DELETE FROM member_manuscripts WHERE id=$1 AND member_id=$2',[E.manuscript,E.member]);
    await authorize(db,E);
    await expectedError('forced chain blocker aborts constitutional erasure',/external_chain_blocker|foreign key constraint/,()=>db.query('SELECT r20_erase_writer_editorial_history($1,$2,$3)',[E.manifest,E.member,E.manuscript]));
    await db.query('ROLLBACK');
    check('failed function rolls target lineage back', Object.values(await lineageCounts(db,E.chain)).every(n=>n===1), await lineageCounts(db,E.chain));
    check('all seven immutable triggers enabled after failure', Object.values(await triggerStates(db)).length===7 && Object.values(await triggerStates(db)).every(v=>v==='O'), await triggerStates(db));

    // Cross-member bare work-id collision refuses before any trigger change.
    const foreignChain=qid(301), foreignMember=qid(302);
    await db.query('INSERT INTO members(id) VALUES($1)',[foreignMember]);
    await db.query('INSERT INTO proposal_chains(id,member_id,work_id) VALUES($1,$2,$3)',[foreignChain,foreignMember,B.manuscript]);
    await db.query('BEGIN');
    await db.query('DELETE FROM member_manuscripts WHERE id=$1 AND member_id=$2',[B.manuscript,B.member]);
    await authorize(db,B);
    await expectedError('foreign chain collision refuses',/r20_writer_editorial_foreign_chain_refused/,()=>db.query('SELECT r20_erase_writer_editorial_history($1,$2,$3)',[B.manifest,B.member,B.manuscript]));
    await db.query('ROLLBACK');

    // SECURITY DEFINER grants app role only; outsider remains denied.
    const zeroMember=qid(401), zeroManuscript=qid(402), zeroManifest=qid(403);
    await db.query('INSERT INTO members(id) VALUES($1)',[zeroMember]);
    await db.query('INSERT INTO member_manuscripts(id,member_id) VALUES($1,$2)',[zeroManuscript,zeroMember]);
    await db.query('DELETE FROM member_manuscripts WHERE id=$1',[zeroManuscript]);
    await db.query("INSERT INTO deletion_manifests(id,reason_class,authorized_by,executed_at) VALUES($1,'member_deletion','fictional-member',now())",[zeroManifest]);
    await db.query("INSERT INTO provenance_tombstones(manifest_id,object_kind,object_id) VALUES($1,'member_manuscripts',$2)",[zeroManifest,zeroManuscript]);
    await db.query('SET ROLE maia_app');
    const zero=(await db.query<{r:Record<string,number>}>('SELECT public.r20_erase_writer_editorial_history($1,$2,$3) r',[zeroManifest,zeroMember,zeroManuscript])).rows[0]!.r;
    await db.query('RESET ROLE');
    check('maia_app can invoke bounded zero-lineage security-definer function', Object.values(zero).every(n=>n===0), zero);
    await db.query('SET ROLE outsider');
    await expectedError('outsider cannot execute function',/permission denied for function r20_erase_writer_editorial_history/,()=>db.query('SELECT public.r20_erase_writer_editorial_history($1,$2,$3)',[zeroManifest,zeroMember,zeroManuscript]));
    await db.query('RESET ROLE');

    const output={protocol:'soullab.writer.r20.editorial-erasure-pg16.v1',result:checks.every(c=>c.pass)?'PASS':'FAIL',passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,productionDataTouched:false,memberDataTouched:false,release:'HOLD'};
    console.log(JSON.stringify(output,null,2));
    if(output.result!=='PASS')process.exitCode=1;
  } finally { await db.end(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
