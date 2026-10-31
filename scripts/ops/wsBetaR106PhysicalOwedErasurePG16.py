#!/usr/bin/env python3
"""R106 fictional-only PostgreSQL16 + real Mac vault erasure recovery.

A separate disposable timer revisits an owed deletion after its own restart,
while actual fileVault unlink refuses a hardlinked fake original. No production
DB, member path, R20 key, app media-worker or cron is accessed/changed.
"""
from pathlib import Path
from datetime import datetime,timezone
import json,os,re,secrets,shutil,stat,subprocess,sys,time,select,hashlib

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=Path(os.environ.get("WS_R106_EVIDENCE_DIR","/forbidden"))
PIN=os.environ.get("WS_R106_EXPECTED_HEAD","")
nonce=secrets.token_hex(4)
CONTAINER="ws-r106-pg-"+nonce
FOLDER=Path("/private/tmp/ws-r106-fictional-"+nonce)
VAULT=FOLDER/"vault"
MARK=FOLDER/"R106_FICTIONAL_ONLY.marker"
created=False
supervisor=None
checks={}
traces=[]
secret="R106_FICTIONAL_ONLY_ERASURE"
def proof(name,yes):
    checks[name]=bool(yes)
    if not yes:raise RuntimeError("R106_HELD_"+name)
def command(argv,timeout=30,env=None,input=None,allow=False):
    r=subprocess.run(argv,cwd=ROOT,env=env,input=input,
       stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
    if not allow and r.returncode:
        raise RuntimeError("R106_SUBPROCESS_HELD_"+Path(argv[0]).name)
    return r
def docker(*argv,timeout=20,allow=False,input=None):
    return command(["docker",*argv],timeout=timeout,allow=allow,input=input)
def sql(query):
    return docker("exec","-i",CONTAINER,"psql","-h","127.0.0.1",
      "-XAtq","-v","ON_ERROR_STOP=1","-U","fict","-d","ws_r106",
      input=query.encode(),timeout=15)
def env_for(role,port):
    # Process env intentionally excludes inherited R20/KMS/production secrets.
    base={k:os.environ[k] for k in ("PATH","LANG","HOME","TMPDIR")
      if k in os.environ}
    base.update({
      "NODE_ENV":"test",
      "WS_R106_ERASURE_FIXTURE":"fictional-only",
      "DATABASE_URL":f"postgresql://{role}@127.0.0.1:{port}/ws_r106",
      "FILE_STORAGE_PATH":str(VAULT),
    })
    return base
def run_probe(stage,port,role="ws_r106_eraser"):
    r=command([str(ROOT/"node_modules/.bin/tsx"),
     "scripts/ops/wsBetaR106FictionalErasureProbe.ts",stage],
     env=env_for(role,port),timeout=20)
    # The existing PostgreSQL connector prints a content-free close marker
    # after the fixture JSON; select ONLY our protocol-tagged JSON receipt.
    candidates=[]
    for line in r.stdout.decode("utf8","replace").splitlines():
        if line.startswith('{"protocol":"r106.fixture.v1"'):
            candidates.append(json.loads(line))
    proof("exactly_one_fake_probe_receipt",len(candidates)==1)
    result=candidates[0]
    proof("probe_"+stage,result.get("phase")==stage and
      result.get("productionApproved") is False)
    return result
def await_marker(p,marker,timeout=16):
    end=time.monotonic()+timeout
    while time.monotonic()<end:
        ready,_,_=select.select([p.stdout],[],[],min(.5,max(.1,end-time.monotonic())))
        if ready:
            data=p.stdout.readline().decode("utf8","replace").strip()
            if data==marker:return True
            if data.startswith("R106_FICTIONAL_"):traces.append(data)
        if p.poll() is not None:return False
    return False
def end_supervisor():
    global supervisor
    if supervisor is not None:
        if supervisor.poll() is None:
            supervisor.terminate()
            try:supervisor.wait(timeout=5)
            except subprocess.TimeoutExpired:
                supervisor.kill();supervisor.wait(timeout=3)
        supervisor=None
def start_supervisor(port):
    global supervisor
    proof("no_parallel_supervisor",supervisor is None)
    supervisor=subprocess.Popen(["node",
      "scripts/ops/wsBetaR106FictionalPeriodicConsumer.cjs"],
      cwd=ROOT,env=env_for("ws_r106_eraser",port),
      stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,
      stderr=subprocess.DEVNULL,start_new_session=True)
    proof("fresh_independent_scheduler_os_process",supervisor.poll() is None)
def preparation():
    global created
    proof("explicit_fake_only",os.environ.get("WS_R106_ERASURE_FIXTURE")=="fictional-only")
    proof("source_owned_fixture",ROOT==Path("/Volumes/T7 Shield/ProjectCache/WS-RC1-174-ADMIT-20261025"))
    head=command(["git","rev-parse","HEAD"]).stdout.decode().strip()
    proof("pinned_admitted_writer_parent",head==PIN)
    proof("expected_head_is_explicit",bool(re.fullmatch(r"[a-f0-9]{40}",PIN)))
    proof("pinned_exact_candidate_commit",head==PIN)
    proof("clean_exact_candidate_worktree",
      command(["git","status","--porcelain=v1","--untracked-files=all"]).stdout==b"")
    critical={
      "scripts/restore-governed.sh":"48d891e72d67f7e5b374538e4d3a1511f64c5322541e8c8789a2a2e96e88f222",
      "lib/storage/fileVault.ts":"fcee783aa5a9b7ed6087f6cc6246cbb0f02ed25b0481e2f91439b9473fed9f11",
      "lib/manuscript/source/arrivals.ts":"6864c81aa0c2ef33b5041f42d04890545f5a36e45e07410055c82d6671df04ac",
      "lib/manuscript/source/eraseManuscript.ts":"ce3ebdf4b8fdcab3120848a222f5a3fad9ccc69c4c100f25bda9849a5a4ae35f",
      "lib/recovery/r20DeletionLedger.ts":"c6760b3138a47059c6857daef74bdd0ff16f4f62292d4784484db4da1fdca121",
      "lib/manuscript/source/vaultErasureSafeLogR105.ts":"4a72ce58a4e7e4044ddcf94c5736dc857db88ccd9412fcb16364e0a7dfded541",
      "scripts/ops/sweep-vault-erasure-queue.ts":"717c5763419de9af5c0bcf0f6fdedc9bd6528f6643c88449b9c5578d814ffe1a",
      "scripts/run-media-worker.ts":"da34c81b6097c1b785d2f3d5640b4fb001acf15887f897ea20b33d2e60800db8",
    }
    for rel,want in critical.items():
        got=hashlib.sha256((ROOT/rel).read_bytes()).hexdigest()
        proof("critical_source_"+Path(rel).name.replace(".","_"),got==want)
    proof("release_hold_not_bypassed",not any(k in os.environ for k in
       ("DATABASE_URL","FILE_STORAGE_PATH","WS_R20_PRIVATE_KEY","PGPASSWORD")))
    proof("new_bounded_receipt_path",EVIDENCE.parent==Path("/Volumes/T7 Shield") and
       re.fullmatch(r"ws-beta-r106-erasure-[a-f0-9]{8}",EVIDENCE.name) and
       not EVIDENCE.exists())
    proof("test_Docker_absent",docker("ps","-a","--filter",
       "name=^/"+CONTAINER+"$","--format","{{.Names}}").stdout==b"")
    proof("cached_PG16",docker("image","inspect","postgres:16.13",
       "--format","{{.Id}}").stdout.startswith(b"sha256:"))
    os.umask(0o077)
    EVIDENCE.mkdir(mode=0o700)
    FOLDER.mkdir(mode=0o700)
    VAULT.mkdir(mode=0o700)
    MARK.write_text("R106_FICTIONAL_ONLY\n")
    MARK.chmod(0o600)
    r=docker("run","-d","--rm","--pull=never","--name",CONTAINER,
       "--label","soullab.fixture=r106","--network","bridge",
       "--memory","512m","--cpus","1","--pids-limit","128",
       "--security-opt","no-new-privileges",
       "--tmpfs","/var/lib/postgresql/data:rw,nosuid,size=256m",
       "-p","127.0.0.1::5432",
       "-e","POSTGRES_USER=fict","-e","POSTGRES_DB=ws_r106",
       "-e","POSTGRES_HOST_AUTH_METHOD=trust","postgres:16.13",timeout=60)
    created=bool(r.stdout.strip())
    proof("fake_pg_container_created",created)
    ready=False
    for _ in range(90):
        test=docker("exec",CONTAINER,"psql","-h","127.0.0.1",
         "-XAtq","-U","fict","-d","ws_r106","-c","SELECT 1",
         allow=True,timeout=5)
        if test.returncode==0 and test.stdout.strip()==b"1":
            ready=True;break
        time.sleep(.15)
    proof("real_pg16_accepts_client",ready)
    port_line=docker("port",CONTAINER,"5432/tcp").stdout.decode().strip()
    proof("only_loopback_db",bool(re.fullmatch(r"127\.0\.0\.1:\d{2,5}",port_line)))
    port=int(port_line.rsplit(":",1)[1])
    migration=(ROOT/"database/migrations/20260907000001_vault_erasure_queue.sql")
    proof("canonical_queue_migration_present",migration.is_file())
    sql(migration.read_text())
    sql("""
      CREATE TABLE r106_other_fake_files(id int PRIMARY KEY, content text);
      INSERT INTO r106_other_fake_files VALUES(1,'R106_FAKE_STAY_PRIVATE');
      CREATE ROLE ws_r106_eraser LOGIN INHERIT NOSUPERUSER
        NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
      GRANT SELECT, DELETE ON vault_erasure_queue TO ws_r106_eraser;
      GRANT UPDATE (attempts,last_attempt_at,last_error)
        ON vault_erasure_queue TO ws_r106_eraser;
    """)
    def denied(statement):
        test=docker("exec",CONTAINER,"psql","-h","127.0.0.1","-XAtq",
          "-v","ON_ERROR_STOP=1","-U","ws_r106_eraser","-d","ws_r106",
          "-c",statement,allow=True)
        return test.returncode!=0
    proof("worker_cannot_insert_owed_rows",denied(
      "INSERT INTO vault_erasure_queue (artifact_ref) VALUES ('new')"))
    proof("worker_cannot_read_unrelated_data",denied(
      "SELECT content FROM r106_other_fake_files"))
    proof("worker_cannot_elevate_to_DB_owner",denied("SET ROLE fict"))
    proof("worker_cannot_change_schema",denied("CREATE TABLE r106_forbidden(x int)"))
    return port

def execute(port):
    # Public writer login seeds one synthetic deletion obligation, but the
    # independent narrow erasure worker owns no Work/Source rows and no keys.
    staged=run_probe("stage",port,role="fict")
    proof("staged_owed_fake_original",
       staged.get("queueCommitted") is True and
       staged.get("fakeHardlinkObstructsDeletion") is True)
    eraser_env=env_for("ws_r106_eraser",port)
    first=command([str(ROOT/"node_modules/.bin/tsx"),
      "scripts/ops/sweep-vault-erasure-queue.ts","--quiet"],
      env=eraser_env,timeout=25,allow=True)
    proof("physical_first_attempt_refuses_unsafe_hardlink",
       first.returncode==1 and b"errno=UNKNOWN" in first.stderr)
    for raw in (first.stdout,first.stderr):
        proof("no_fake_path_or_prose_in_worker_logs",
          b"fake-original.txt" not in raw and
          secret.encode() not in raw and
          str(VAULT).encode() not in raw)
    failed=run_probe("failed",port)
    proof("owed_record_survives_real_filesystem_refusal",
      failed.get("failedAttemptRetained") is True and
      failed.get("errnoOnly") is True)

    # First independent automatic scheduler attempts, gets a refusal, then
    # we intentionally terminate it to simulate a supervisor crash/restart.
    start_supervisor(port)
    proof("first_autonomous_attempt_surfaces_owed_refusal",
      await_marker(supervisor,"R106_FICTIONAL_ERASURE_STILL_OWED",20))
    end_supervisor()
    proof("first_scheduler_stopped_without_member_retry",supervisor is None)
    persisted=run_probe("failed",port)
    proof("unfinished_erasure_persists_across_scheduler_restart",
      persisted.get("retryCount",0)>=2)

    # The SECOND scheduler is a newly started OS process that will keep
    # retrying; we clear only the synthetic obstruction and never call
    # the erasure worker manually a second time.
    start_supervisor(port)
    proof("second_autonomous_scheduler_still_sees_owed_row",
      await_marker(supervisor,"R106_FICTIONAL_ERASURE_STILL_OWED",20))
    repaired=run_probe("repair",port)
    proof("test_only_hardlink_obstruction_removed",
      repaired.get("testObstructionCleared") is True)
    proof("new_scheduler_clears_owed_queue_without_http_retry",
      await_marker(supervisor,"R106_FICTIONAL_AUTONOMOUS_CLEAR",24))
    code=supervisor.wait(timeout=5)
    proof("new_scheduler_exited_successfully",code==0)
    end_supervisor()
    recovered=run_probe("recovered",port)
    proof("actual_original_bytes_gone",recovered.get("originalBytesGone") is True)
    proof("actual_owed_queue_row_gone",recovered.get("owedRecordGone") is True)
    proof("unrelated_file_preserved",recovered.get("unrelatedSentinelPreserved") is True)
    empty=command([str(ROOT/"node_modules/.bin/tsx"),
      "scripts/ops/sweep-vault-erasure-queue.ts","--quiet"],
      env=eraser_env,timeout=25,allow=True)
    proof("idempotent_independent_empty_sweep",empty.returncode==0)
    proof("no_private_path_in_empty_sweep_output",
      b"fake-original.txt" not in empty.stdout+empty.stderr and
      secret.encode() not in empty.stdout+empty.stderr)

def main():
    error=None
    try:
        execute(preparation())
    except Exception as e:
        error=(str(e) if isinstance(e,RuntimeError) and
           str(e).startswith(("R106_HELD_","R106_SUBPROCESS_HELD_"))
           else type(e).__name__)
    finally:
        end_supervisor()
        if created:
            docker("rm","-f","-v",CONTAINER,timeout=25,allow=True)
        try:
            gone=docker("ps","-a","--filter","name=^/"+CONTAINER+"$",
                 "--format","{{.Names}}").stdout.strip()==b""
        except Exception:gone=False
        checks["owned_pg16_removed"]=gone
        if FOLDER.exists():
            # Never attempt to remove a symlinked or unmarked non-test root.
            if (not FOLDER.is_symlink() and MARK.is_file() and
                MARK.read_text()=="R106_FICTIONAL_ONLY\n" and
                FOLDER.parent==Path("/private/tmp") and
                re.fullmatch(r"ws-r106-fictional-[a-f0-9]{8}",FOLDER.name)):
                shutil.rmtree(FOLDER)
            else:
                error="R106_HELD_CLEANUP_OWNERSHIP_UNTRUSTED"
        checks["all_owned_synthetic_vault_bytes_removed"]=not FOLDER.exists()
        approved=(error is None and all(v is True for v in checks.values())
            and len(checks)>=29)
        receipt={
          "protocol":"soullab.ws.r106.fictional-owed-erasure-physical-pg16.v1",
          "date_utc":datetime.now(timezone.utc).isoformat(),
          "status":"R106_FICTIONAL_AUTONOMOUS_RETRY_PASS_BETA_HOLD"
            if approved else "R106_PHYSICAL_ERASURE_REVIEW_HOLD",
          "source_parent":PIN,
          "source_commit":command(["git","rev-parse","HEAD"]).stdout.decode().strip(),
          "allDataFictional":True,
          "productionReadOrWrite":False,
          "realMemberDataAccess":False,
          "realR20KeyMounted":False,
          "actualProductionAutonomousSchedulerProven":False,
          "fictionalIndependentTimerUsed":True,
          "fictionalPostgresHostAuthentication":"trust_local_only",
          "fictionalPostgresRoleScopedToErasureQueue":True,
          "testDockerContainerRemoved":gone,
          "fixtureVaultRemoved":not FOLDER.exists(),
          "released":False,
          "checks":checks,
          "attemptStatusLabels":traces,
          "reasonClass":error,
        }
        if EVIDENCE.is_dir():
            target=EVIDENCE/"R106_FICTIONAL_ERASURE_RESTART_PG16.json"
            with target.open("x") as handle:
                json.dump(receipt,handle,indent=2,sort_keys=True)
                handle.write("\n")
            target.chmod(0o600)
        print(json.dumps({
          "status":receipt["status"],
          "passed":sum(x is True for x in checks.values()),
          "total":len(checks),
          "testDockerRemoved":gone,
          "syntheticVaultRemoved":not FOLDER.exists(),
          "reasonClass":error,
          "releaseApproved":False,
        },sort_keys=True))
    return 0 if approved else 2
if __name__=="__main__":
    sys.exit(main())
