/** Physical PostgreSQL 16 acceptance — FICTIONAL ONLY, explicit runner opt-in. */
import { Client } from 'pg';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { closePool } from '@/lib/db/postgres';
import { saveWorkingEditorialVersion } from '../workingSave';
import { readCurrentEditorialThread } from '../thread';

const active=process.env.WS_WORKING_SAVE_PG16==='fictional-only';
const physical=active?describe:describe.skip;
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='99999999-9999-4999-8999-999999999999';
const WORK='22222222-2222-4222-8222-222222222222';
const MANUSCRIPT='33333333-3333-4333-8333-333333333333';
const DECL='44444444-4444-4444-8444-444444444444';
const REL='55555555-5555-4555-8555-555555555555';
const DRAFT='66666666-6666-4666-8666-666666666666';
const SECTION='77777777-7777-4777-8777-777777777777';
const KEY1='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const KEY2='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const KEY3='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const identity={status:'verified' as const,memberId:MEMBER};
const posture=TurnPosture.resolve({sanctuary:false});
const base={relationshipId:REL,sectionId:SECTION,range:{start:0,end:13},revisionNumber:7,
 threadId:null,supersedes:null,replacementText:'My exact words',sanctuary:false,kept:[]};
let db:Client;
const root=process.cwd();
const migration=(rel:string)=>readFileSync(path.join(root,rel),'utf8');
const query=async<T=unknown>(sql:string,args:unknown[]=[])=>(await db.query<T>(sql,args));

physical('MAIA-independent first-author Save on actual PostgreSQL 16',()=>{
 beforeAll(async()=>{
  if(!process.env.DATABASE_URL)throw Error('FICTIONAL_PG16_DATABASE_URL_REQUIRED');
  db=new Client({connectionString:process.env.DATABASE_URL,application_name:'ws_first_save_fictional_only'});
  await db.connect();
  const id=await db.query("select current_database() db,current_user usr,current_setting('server_version') ver");
  if(id.rows[0]?.db!=='ws_save_fictional'||id.rows[0]?.usr!=='fict')throw Error('REFUSE_WRONG_DATABASE_IDENTITY');
  await db.query(`
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE members(id UUID PRIMARY KEY);
CREATE TABLE member_manuscripts(id UUID PRIMARY KEY,member_id UUID NOT NULL REFERENCES members(id));
CREATE TABLE manuscript_working_drafts(id UUID PRIMARY KEY,member_id UUID NOT NULL,manuscript_id UUID NOT NULL,version BIGINT NOT NULL,revision_count INTEGER NOT NULL);
CREATE TABLE manuscript_sections(id UUID PRIMARY KEY,heading TEXT);
CREATE TABLE manuscript_draft_sections(id UUID PRIMARY KEY,draft_id UUID NOT NULL,source_section_id UUID,text TEXT NOT NULL);
CREATE TABLE proposal_chains(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),member_id UUID NOT NULL,work_id UUID NOT NULL,draft_id UUID NOT NULL,base_version BIGINT NOT NULL,target_section_id UUID NOT NULL,expected_text TEXT NOT NULL,decision_chain_id UUID,opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(member_id,id));
CREATE TABLE proposal_versions(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),chain_id UUID NOT NULL,author TEXT NOT NULL,formulation TEXT NOT NULL,supersedes UUID,rationale TEXT,authored_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(chain_id,id));
CREATE TABLE ask_threads(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),member_id UUID NOT NULL,manuscript_id UUID,anchor JSONB,reading_identity JSONB,canonical_at_open TEXT,initiated_by TEXT,opened_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE ask_turns(thread_id UUID NOT NULL,turn_index INTEGER NOT NULL,speaker TEXT NOT NULL,body TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(thread_id,turn_index));
CREATE TABLE manuscript_revision_authorizations(id UUID PRIMARY KEY,proposal_chain_id UUID,member_id UUID,accepted_at TIMESTAMPTZ,resulting_version BIGINT,draft_id UUID,proposal_version_id UUID,target_section_id UUID);
CREATE TABLE manuscript_application_recovery(authorization_id UUID PRIMARY KEY,before_body TEXT,after_body TEXT,undone_at TIMESTAMPTZ,resulting_version BIGINT);
`);
  for(const rel of [
   'database/migrations/20260801000001_living_works.sql',
   'database/migrations/20260914000005_editorial_ontology.sql',
   'database/migrations/20260929000003_ask_threads_living_work_subject.sql',
   'database/migrations/20260925000005_writer_editorial_relationship_custody.sql',
   'database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql',
  ]){
   try{await db.query(migration(rel));}
   catch(error){throw new Error(`fixture migration ${rel} refused: ${error instanceof Error?error.message:String(error)}`);}
  }
  await db.query(`ALTER TABLE ask_threads
    ADD CONSTRAINT ask_threads_id_chain_key UNIQUE(id,proposal_chain_id);
    CREATE TABLE editorial_turn_bindings(
      thread_id UUID NOT NULL,turn_index INTEGER NOT NULL,direction_id UUID,version_id UUID);
  `);
  await db.query('CREATE TRIGGER ask_threads_existing_freeze BEFORE UPDATE ON ask_threads FOR EACH ROW EXECUTE FUNCTION ask_threads_freeze()');
  await db.query(migration('database/migrations/20261020000001_writer_editorial_thread_origins.sql'));
  await db.query('INSERT INTO members VALUES($1),($2)',[MEMBER,FOREIGN]);
  await db.query('INSERT INTO member_manuscripts VALUES($1,$2)',[MANUSCRIPT,MEMBER]);
  await db.query("INSERT INTO living_works(id,member_id,title) VALUES($1,$2,'Fictional Work')",[WORK,MEMBER]);
  await db.query("INSERT INTO living_work_expressions(id,living_work_id,expression_type,expression_id,declared_by) VALUES($1,$2,'manuscript',$3,$4)",[DECL,WORK,MANUSCRIPT,MEMBER]);
  await db.query("INSERT INTO writer_editorial_relationships(id,member_id,living_work_id,manuscript_id,creation_expression_id,contract_version) VALUES($1,$2,$3,$4,$5,'A2-1')",[REL,MEMBER,WORK,MANUSCRIPT,DECL]);
  await db.query('INSERT INTO manuscript_working_drafts VALUES($1,$2,$3,7,3)',[DRAFT,MEMBER,MANUSCRIPT]);
  await db.query('INSERT INTO manuscript_sections VALUES($1,NULL)',[SECTION]);
  await db.query("INSERT INTO manuscript_draft_sections VALUES($1,$2,$1,'Original line')",[SECTION,DRAFT]);
 });
 afterAll(async()=>{
  await db.end();
  await closePool();
 });

 it('commits chain, thread, immutable origin, member root and receipt together with no MAIA turn',async()=>{
  const saved=await saveWorkingEditorialVersion({identity,posture,request:{...base,idempotencyKey:KEY1}});
  expect(saved.ok).toBe(true);
  if(!saved.ok)return;
  expect(saved.replayed).toBe(false);
  const counts=await query<{chains:string;threads:string;origins:string;parents:string;versions:string;receipts:string;turns:string}>(`
   SELECT (SELECT count(*) FROM proposal_chains)::text chains,
          (SELECT count(*) FROM ask_threads WHERE proposal_chain_id IS NOT NULL)::text threads,
          (SELECT count(*) FROM writer_editorial_thread_origins)::text origins,
          (SELECT count(*) FROM writer_editorial_chain_origins)::text parents,
          (SELECT count(*) FROM proposal_versions)::text versions,
          (SELECT count(*) FROM writer_editorial_save_receipts)::text receipts,
          (SELECT count(*) FROM ask_turns)::text turns`);
  expect(counts.rows[0]).toEqual({chains:'1',threads:'1',origins:'1',parents:'1',versions:'1',receipts:'1',turns:'0'});
  const view=await readCurrentEditorialThread(identity,REL,saved.threadId);
  expect(view.ok).toBe(true);
  if(view.ok){expect(view.view.versions).toHaveLength(1);expect(view.view.versions[0]?.wording).toBe('My exact words');expect(view.view.turns).toHaveLength(0);}
 });

 it('replays the same key exactly and refuses a changed payload',async()=>{
  const first=await saveWorkingEditorialVersion({identity,posture,request:{...base,idempotencyKey:KEY1}});
  expect(first).toMatchObject({ok:true,replayed:true});
  const changed=await saveWorkingEditorialVersion({identity,posture,request:{...base,idempotencyKey:KEY1,replacementText:'Different words'}});
  expect(changed).toEqual({ok:false,reason:'idempotency_conflict'});
  expect((await query<{n:string}>('SELECT count(*)::text n FROM proposal_versions')).rows[0]?.n).toBe('1');
 });

 it('two concurrent identical first-Save requests converge on one version and one receipt',async()=>{
  const request={...base,idempotencyKey:KEY2,replacementText:'Concurrent exact words'};
  const [a,b]=await Promise.all([
   saveWorkingEditorialVersion({identity,posture,request}),
   saveWorkingEditorialVersion({identity,posture,request}),
  ]);
  expect(a.ok&&b.ok).toBe(true);
  if(a.ok&&b.ok){expect(a.versionId).toBe(b.versionId);expect([a.replayed,b.replayed].sort()).toEqual([false,true]);}
  const rows=await query<{receipts:string;versions:string}>(`SELECT
   (SELECT count(*) FROM writer_editorial_save_receipts WHERE idempotency_key=$1)::text receipts,
   (SELECT count(*) FROM proposal_versions v JOIN writer_editorial_save_receipts r ON r.proposal_version_id=v.id WHERE r.idempotency_key=$1)::text versions`,[KEY2]);
  expect(rows.rows[0]).toEqual({receipts:'1',versions:'1'});
 });

 it('a receipt failure rolls back chain, thread, origin, version and parent',async()=>{
  await db.query(`CREATE FUNCTION fixture_refuse_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.idempotency_key='${KEY3}'::uuid THEN RAISE EXCEPTION 'fictional receipt refusal'; END IF; RETURN NEW; END $$;
CREATE TRIGGER fixture_refuse_receipt BEFORE INSERT ON writer_editorial_save_receipts FOR EACH ROW EXECUTE FUNCTION fixture_refuse_receipt();`);
  const before=(await query<{c:string}>('SELECT count(*)::text c FROM proposal_chains')).rows[0]!.c;
  await expect(saveWorkingEditorialVersion({identity,posture,request:{...base,idempotencyKey:KEY3,replacementText:'Rollback words'}})).rejects.toThrow('fictional receipt refusal');
  expect((await query<{c:string}>('SELECT count(*)::text c FROM proposal_chains')).rows[0]!.c).toBe(before);
  expect((await query<{c:string}>('SELECT count(*)::text c FROM writer_editorial_save_receipts WHERE idempotency_key=$1',[KEY3])).rows[0]!.c).toBe('0');
  await db.query('DROP TRIGGER fixture_refuse_receipt ON writer_editorial_save_receipts; DROP FUNCTION fixture_refuse_receipt();');
 });

 it('withdrawal preserves history but makes replay and readback refuse current authority',async()=>{
  const saved=await saveWorkingEditorialVersion({identity,posture,request:{...base,idempotencyKey:KEY1}});
  expect(saved.ok).toBe(true);
  await db.query('DELETE FROM living_work_expressions WHERE id=$1',[DECL]);
  expect(await saveWorkingEditorialVersion({identity,posture,request:{...base,idempotencyKey:KEY1}})).toEqual({ok:false,reason:'origin_unavailable'});
  if(saved.ok)expect(await readCurrentEditorialThread(identity,REL,saved.threadId)).toEqual({ok:false,reason:'origin_unavailable'});
  expect((await query<{n:string}>('SELECT count(*)::text n FROM writer_editorial_save_receipts')).rows[0]!.n).toBe('2');
 });
});
