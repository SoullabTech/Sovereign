#!/usr/bin/env python3
"""Isolated PG16 migration-prefix witness. NEVER run against a production DB.

The only database reachable by this script is the exact empty schema-only
restore created on Mac Studio's local Docker postgres. No member data was
copied. Tests all four ordered prefixes and SQL defeat candidates, including
old constraint restoration after a lock-timeout rollback.
"""
import datetime
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import time
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[2]
DB = 'maia_ws_migration_witness_20261012'
CONTAINER = 'maia-postgres'
FILES = [
    '20261002000002_writer_studio_chapter_overview_lens.sql',
    '20261005000001_writer_studio_work_directives.sql',
    '20261006000001_writer_studio_completion_checks.sql',
    '20261007000001_craft_version_choices.sql',
]
OUT = pathlib.Path('/Users/soullab/.maia-release-authority/ws-migration-compat-20261012')
PSQL = ['docker', 'exec', '-i', CONTAINER, 'psql',
        '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-U', 'soullab',
        '-d', DB, '-f', '-']
proofs = {}

def sql(code: str, success=True, reason=None) -> str:
    result = subprocess.run(PSQL, input=code, text=True, capture_output=True,
                            timeout=55)
    if success and result.returncode:
        raise RuntimeError(f'EXPECTED PASS, got {result.returncode}: {result.stderr[:400]}')
    if not success and not result.returncode:
        raise RuntimeError('EXPECTED REJECTION, but SQL succeeded')
    if reason and reason.lower() not in result.stderr.lower():
        raise RuntimeError(f'EXPECTED {reason!r}; got {result.stderr[:350]}')
    return result.stdout.strip()

def check(name: str, assertion: bool, detail='PASS'):
    if not assertion:
        raise RuntimeError('STOP: '+name)
    proofs[name] = detail
    print('PASS', name, flush=True)

def scalar(code: str) -> str:
    lines=sql(code).splitlines()
    return lines[-1].strip() if lines else ''

def refused(name: str, stmt: str, error='ERROR:'):
    sql(stmt,success=False,reason=error)
    check(name,True)

def table_exists(name: str) -> bool:
    return scalar(f"SELECT CASE WHEN to_regclass('public.{name}') IS NULL THEN 'no' ELSE 'yes' END;")=='yes'

def stage(filename: str):
    target=ROOT/'database/migrations'/filename
    digest=hashlib.sha256(target.read_bytes()).hexdigest()
    sql(target.read_text())
    check('applied_'+filename,True,digest)

def main():
    check('mac_pg16_container_identity',
          subprocess.check_output(['docker','inspect','--format',
            '{{index .Config.Labels "com.docker.compose.service"}}',CONTAINER],text=True).strip()=='postgres')
    check('exact_disposable_database',scalar('SELECT current_database();')==DB)
    check('postgres_major_16',scalar('SHOW server_version_num;').startswith('16'))
    check('no_preexisting_new_tables',all(not table_exists(t) for t in [
        'writer_studio_work_directives','writer_studio_completion_checks',
        'writer_craft_version_choices']))
    check('pre_migration_eight_lens_constraint',
        'overview' not in scalar("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='developmental_readings'::regclass AND conname='developmental_readings_commissioned_lens_check';"))
    check('old_reader_baseline_can_read',scalar("SELECT count(*) FROM developmental_readings;")=='0')

    # Lock denial must rollback: hold an AccessShareLock on the real restored
    # developmental_readings while the pending ALTER seeks AccessExclusiveLock.
    holder=subprocess.Popen(
        ['docker','exec',CONTAINER,'psql','-X','-q','-U','soullab','-d',DB,
         '-v','ON_ERROR_STOP=1','-c',
         'BEGIN; SELECT count(*) FROM developmental_readings; SELECT pg_sleep(13); ROLLBACK;'],
        stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    try:
        locked=False
        for _ in range(35):
            count=int(scalar("SELECT count(*) FROM pg_locks WHERE relation='developmental_readings'::regclass AND mode='AccessShareLock' AND granted AND pid <>pg_backend_pid();") or '0')
            if count>0:
                locked=True
                break
            time.sleep(.2)
        check('holder_acquired_old_reader_lock',locked)
        sql((ROOT/'database/migrations'/FILES[0]).read_text(),success=False,
            reason='lock timeout')
        check('lock_timeout_aborted_first_migration',True)
        still_old=scalar("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='developmental_readings'::regclass AND conname='developmental_readings_commissioned_lens_check';")
        check('timeout_rollback_preserved_eight_lenses','overview' not in still_old)
    finally:
        try:
            holder.wait(timeout=20)
        except subprocess.TimeoutExpired:
            holder.terminate()
            holder.wait(timeout=5)
    check('old_reader_lock_released',holder.returncode==0)

    stage(FILES[0])
    constraint=scalar("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='developmental_readings'::regclass AND conname='developmental_readings_commissioned_lens_check';")
    check('overview_constraint_added','overview' in constraint and all(
          x in constraint for x in ['structure','development','reader']))
    admits_overview=scalar("SELECT (position('overview' in pg_get_functiondef('public.developmental_readings_observations_check()'::regprocedure))>0 AND position('canonical nine' in pg_get_functiondef('public.developmental_readings_observations_check()'::regprocedure))>0)::text;")
    check('overview_function_added',admits_overview=='true')
    check('old_reader_select_still_works_after_overview',scalar('SELECT count(*) FROM developmental_readings;')=='0')

    stage(FILES[1])
    fkey=scalar("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='writer_studio_work_directives'::regclass AND conname='ws_work_directive_work_owner_fkey';")
    check('database_owner_composite_fk',
          'FOREIGN KEY (living_work_id, member_id)' in fkey and
          'REFERENCES living_works(id, member_id)' in fkey)
    a,b=[str(uuid.uuid4()) for _ in range(2)]
    w1,w2=[str(uuid.uuid4()) for _ in range(2)]
    m1,m2=[str(uuid.uuid4()) for _ in range(2)]
    direct=str(uuid.uuid4())
    name='ws-migration-witness-20261012-'
    sql(f"""INSERT INTO members (id,passkey,username,password_hash,name)
           VALUES ('{a}','fake-{a}','{name}a','fake-hash','Synthetic A'),
                  ('{b}','fake-{b}','{name}b','fake-hash','Synthetic B');
           INSERT INTO living_works(id,member_id,title)
           VALUES ('{w1}','{a}','Synthetic A Work'),('{w2}','{b}','Synthetic B Work');""")
    check('two_synthetic_members_and_works_created',True)
    sql(f"""INSERT INTO writer_studio_work_directives
        (id,member_id,living_work_id,kind,initial_text)
        VALUES ('{direct}','{a}','{w1}','protect','Preserve writer voice');""")
    refused('foreign_member_work_directive_denied',
        f"INSERT INTO writer_studio_work_directives(member_id,living_work_id,kind,initial_text) VALUES ('{b}','{w1}','decision','wrong owner');",'foreign key constraint')
    refused('direct_work_directive_update_denied',
        f"UPDATE writer_studio_work_directives SET initial_text='overwritten' WHERE id='{direct}';",'append-only')
    refused('direct_work_directive_delete_denied',
        f"DELETE FROM writer_studio_work_directives WHERE id='{direct}';",'custody cascade')
    sql(f"""INSERT INTO writer_studio_work_directive_events (directive_id,member_id,event_type,text)
          VALUES ('{direct}','{a}','revise','More precise protection');""")
    refused('cross_member_directive_event_denied',
        f"INSERT INTO writer_studio_work_directive_events(directive_id,member_id,event_type,text) VALUES ('{direct}','{b}','revise','wrong owner');",'foreign key constraint')
    refused('direct_directive_event_delete_denied',
        f"DELETE FROM writer_studio_work_directive_events WHERE directive_id='{direct}';",'custody cascade')
    refused('directive_history_truncate_denied',
        'TRUNCATE TABLE writer_studio_work_directives,writer_studio_work_directive_events;','TRUNCATE refused')
    sql(f"DELETE FROM living_works WHERE id='{w1}' AND member_id='{a}';")
    check('lawful_work_parent_cascade_removes_directive',
          scalar(f"SELECT count(*) FROM writer_studio_work_directives WHERE id='{direct}';")=='0')
    check('lawful_work_parent_cascade_removes_events',
          scalar(f"SELECT count(*) FROM writer_studio_work_directive_events WHERE directive_id='{direct}';")=='0')
    check('old_reader_select_still_works_after_directives',scalar('SELECT count(*) FROM developmental_readings;')=='0')

    stage(FILES[2])
    sql(f"""INSERT INTO member_manuscripts(id,member_id,title)
          VALUES ('{m1}','{a}','Synthetic A Manuscript'),('{m2}','{b}','Synthetic B Manuscript');""")
    completion=str(uuid.uuid4())
    sql(f"""INSERT INTO writer_studio_completion_checks
          (id,member_id,manuscript_id,dimension,standing,note)
          VALUES ('{completion}','{a}','{m1}','recovery','open','Synthetic review note');""")
    refused('cross_member_completion_denied',
        f"INSERT INTO writer_studio_completion_checks(member_id,manuscript_id,dimension,standing) VALUES ('{b}','{m1}','recovery','clear');",'foreign key constraint')
    refused('completion_update_denied',
        f"UPDATE writer_studio_completion_checks SET standing='clear' WHERE id='{completion}';",'append-only')
    refused('completion_direct_delete_denied',
        f"DELETE FROM writer_studio_completion_checks WHERE id='{completion}';",'custody cascade')
    refused('completion_truncate_denied',
        'TRUNCATE TABLE writer_studio_completion_checks;','TRUNCATE refused')
    sql(f"DELETE FROM member_manuscripts WHERE id='{m1}' AND member_id='{a}';")
    check('lawful_manuscript_parent_cascade_removes_completion',
          scalar(f"SELECT count(*) FROM writer_studio_completion_checks WHERE id='{completion}';")=='0')
    check('old_reader_select_still_works_after_completion',scalar('SELECT count(*) FROM developmental_readings;')=='0')

    stage(FILES[3])
    refused('missing_proposal_version_denied',
        f"INSERT INTO writer_craft_version_choices(version_id,kept) VALUES ('{uuid.uuid4()}','[]'::jsonb);",'foreign key constraint')
    chain,version=[str(uuid.uuid4()) for _ in range(2)]
    sql(f"""INSERT INTO proposal_chains(id,member_id,work_id,draft_id,base_version,target_section_id,expected_text,locus_scope_kind)
          VALUES ('{chain}','{a}','{w2}','{uuid.uuid4()}',0,'{uuid.uuid4()}','Synthetic text','section');
          INSERT INTO proposal_versions(id,chain_id,author,formulation)
          VALUES ('{version}','{chain}','member','Synthetic writer version');
          INSERT INTO writer_craft_version_choices(version_id,kept)
          VALUES ('{version}','[]'::jsonb);""")
    check('member_version_choice_saved',
          scalar(f"SELECT count(*) FROM writer_craft_version_choices WHERE version_id='{version}';")=='1')
    refused('malformed_choice_json_denied',
        f"INSERT INTO writer_craft_version_choices(version_id,kept) VALUES ('{uuid.uuid4()}','{{}}'::jsonb);",'violates check constraint')
    check('old_reader_select_still_works_after_all_four',scalar('SELECT count(*) FROM developmental_readings;')=='0')
    # Transaction-rollback witness, not a production rollback promise.
    sql("BEGIN; CREATE TABLE ws_migration_ephemeral_rollback_probe AS SELECT 1 AS sample; ROLLBACK;")
    check('isolated_ddl_transaction_rollback',
          not table_exists('ws_migration_ephemeral_rollback_probe'))
    info={
        'stamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'db':DB,'container':CONTAINER,'pg_major':'16',
        'source_schema':'Linux production schema-only, no member rows',
        'migration_files':FILES,'proofs':proofs,'pass_count':len(proofs),
        'production_mutations':0,
        'limits':['No real old-reader application binary exercised',
                  'No real production member data copied',
                  'No production schema or migration ledger updated',
                  'Full physical restore and crash recovery not certified']
    }
    OUT.mkdir(parents=True,exist_ok=True)
    receipt=OUT/'prefix-rehearsal.json'
    receipt.write_text(json.dumps(info,indent=2)+'\n')
    os.chmod(receipt,0o600)
    print('WITNESS_PASSED',len(proofs),'RECEIPT',receipt)
    return 0

if __name__=='__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        print('WITNESS_STOP',type(exc).__name__,str(exc)[:500],file=sys.stderr)
        sys.exit(1)
