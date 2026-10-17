#!/usr/bin/env python3
"""Isolated PG16 actual Next manuscript POST: fictional, loopback, no real data.
Requires explicit opt-in, a cached postgres image, no bind mounts, and
no provider/secret forwarding. No production SQL or member account access.
"""
import json, os, secrets, re, subprocess, time
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
E=Path(os.environ.get("R63_EVIDENCE_DIR",
 "/Volumes/T7 Shield/ws-beta-r63-standard-import-fixture-20261017"))
NAME="ws-r63-standard-"+secrets.token_hex(6)
RECEIPT=E/"R63_REAL_CONVENTIONAL_IMPORT_PG16.json"
INITIAL=E/"R63_ACTUAL_NEXT_IMPORT_JEST.log"
COLD=E/"R63_FRESH_PROCESS_READBACK_JEST.log"
R65_INITIAL=E/"R65_ACTUAL_NEXT_CONFIRM_PASTE_JEST.log"
R65_COLD=E/"R65_FRESH_PROCESS_CONFIRM_RECEIPT_JEST.log"
A="11111111-1111-4111-8111-111111111111"
B="22222222-2222-4222-8222-222222222222"

def run(args,timeout=40,check=True,env=None):
 r=subprocess.run(args,cwd=ROOT,env=env,capture_output=True,
                  text=True,timeout=timeout)
 if check and r.returncode:
  # Errors are synthetic. Do not serialize production stdout or credentials.
  raise RuntimeError("R63_TEST_COMMAND_FAILED_"+str(args[0])+
                     "_"+str(r.returncode)+":"+r.stderr[-450:])
 return r

def docker(*args,**kwargs):return run(["docker",*args],**kwargs)

def sql(query):
 return docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
               "-U","fict","-d","ws_atomic","-c",query,timeout=30).stdout.strip()

def wait():
 for _ in range(90):
  r=docker("exec",NAME,"psql","-XAtq","-U","fict","-d",
           "ws_atomic","-c","SELECT 1",check=False,timeout=7)
  if r.returncode==0 and r.stdout.strip()=="1":return
  time.sleep(.17)
 raise RuntimeError("DISPOSABLE_PG16_NOT_READY")

def migrate(name):
 file=ROOT/"database"/"migrations"/name
 if not file.is_file():raise RuntimeError("MISSING_REAL_SCHEMA_"+name)
 dst="/tmp/"+name
 docker("cp",str(file),NAME+":"+dst)
 docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
        "-U","fict","-d","ws_atomic","-f",dst,timeout=35)

def main():
 if os.environ.get("R63_STANDARD_IMPORT_PG16")!="fictional-only":
  print("R63 default off; fictional-only explicit opt-in required")
  return 3
 expected=os.environ.get("R63_EXPECTED_HEAD")
 if expected:
  if run(["git","rev-parse","HEAD"]).stdout.strip()!=expected:
   print("R63 exact HEAD changed: HOLD")
   return 4
  if run(["git","status","--porcelain"]).stdout.strip():
   print("R63 exact committed source dirty: HOLD")
   return 4
 if not str(E).startswith("/Volumes/T7 Shield/ws-beta-") or E.exists():
  print("R63 evidence path must be NEW and founder T7 local")
  return 5
 E.mkdir(parents=True,mode=0o700)
 checks={x:False for x in (
  "cachedPG16","loopbackBindingOnly","noHostBinds",
  "actualManuscriptMigration","actualSourceMigration","actualHeadingMigration",
  "inventedMembersAndSessions","realActualNextImportTest",
  "failingSecondSectionRolledBack","sourceArrivalsIntact",
  "freshProcessManuscriptReopened","noRealMemberCredentialsOrProviderEnv",
  "noFictionalProseInErrorLogs",
  "r65AdditiveConfirmationMigration","r65ActualNextOnceOnly",
  "r65DeletedConfirmationTombstone","r65DeletedPayloadFingerprintGone",
  "r65ColdProcessReceipt","r65NoFictionalProseInErrorLogs",
  "disposableContainerRemoved",
 )}
 started=False;error=None
 try:
  docker("image","inspect","postgres:16.13",timeout=15)
  docker("run","--pull","never","-d","--name",NAME,
   "--network","bridge","--memory","512m","--cpus","1",
   "--pids-limit","128","--security-opt","no-new-privileges",
   "--tmpfs","/var/lib/postgresql/data:rw,nosuid,size=256m",
   "-p","127.0.0.1::5432",
   "-e","POSTGRES_USER=fict","-e","POSTGRES_DB=ws_atomic",
   "-e","POSTGRES_HOST_AUTH_METHOD=trust",
   "postgres:16.13",timeout=60)
  started=True
  wait()
  checks["cachedPG16"]=sql("SHOW server_version_num").startswith("160")
  config=json.loads(docker("inspect",NAME,"--format",
                           "{{json .HostConfig}}").stdout)
  binds=config.get("PortBindings",{}).get("5432/tcp") or []
  checks["loopbackBindingOnly"]=(
   len(binds)==1 and binds[0].get("HostIp")=="127.0.0.1")
  checks["noHostBinds"]=config.get("Binds") is None
  if not all(checks[k] for k in
   ("cachedPG16","loopbackBindingOnly","noHostBinds")):
   raise RuntimeError("R63_UNSAFE_PG_CONTAINER_BOUNDARY")
  bindport=docker("port",NAME,"5432/tcp").stdout.strip()
  match=re.fullmatch(r"127[.]0[.]0[.]1:([0-9]+)",bindport)
  if not match:raise RuntimeError("R63_NON_LOOPBACK_PORT")
  sql("""CREATE TABLE members(id uuid PRIMARY KEY);
   CREATE TABLE auth_sessions(
    session_token text PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES members(id),
    revoked boolean NOT NULL DEFAULT false,
    expires_at timestamptz NOT NULL);
   """)
  sql("""INSERT INTO members(id)
   VALUES ('"""+A+"""'),('"""+B+"""');
   INSERT INTO auth_sessions(session_token,member_id,revoked,expires_at)
   VALUES
   ('r63-fictional-auth-a','"""+A+"""',false,NOW()+INTERVAL '1 day'),
   ('r63-fictional-auth-b','"""+B+"""',false,NOW()+INTERVAL '1 day');
   """)
  checks["inventedMembersAndSessions"]=sql(
   "SELECT count(*) FROM auth_sessions")=="2"
  migrate("20260721000003_press_manuscript_room.sql")
  checks["actualManuscriptMigration"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name IN ('member_manuscripts','manuscript_sections')")=="2"
  migrate("20260824000001_manuscript_source_custody.sql")
  checks["actualSourceMigration"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name='manuscript_source_arrivals'")=="1"
  migrate("20260906000001_manuscript_section_heading_depth.sql")
  checks["actualHeadingMigration"]=sql(
   "SELECT count(*) FROM information_schema.columns "
   "WHERE table_name='manuscript_sections' "
   "AND column_name IN ('heading_depth','heading_signal')")=="2"
  migrate("20261017000001_manuscript_import_confirmation_receipts.sql")
  checks["r65AdditiveConfirmationMigration"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name IN ('manuscript_import_confirmations',"
   "'manuscript_import_active_payloads')")=="2"
  if not all(checks[k] for k in (
   "actualManuscriptMigration","actualSourceMigration",
   "actualHeadingMigration","inventedMembersAndSessions")):
   raise RuntimeError("R63_SOURCE_TABLES_UNQUALIFIED")
  # All credentials and secrets are fictional and no real env keys forwarded.
  env={k:os.environ[k] for k in
       ("PATH","HOME","TMPDIR","LANG") if k in os.environ}
  env.update({
   "R63_STANDARD_IMPORT_PG16":"fictional-only",
   "R65_CONFIRMED_PASTE_PG16":"fictional-only",
   "DATABASE_URL":"postgresql://fict@127.0.0.1:"+match.group(1)+"/ws_atomic",
   "CAPACITOR_BUILD":"",
   "MAIA_CABIN_MODE":"",
   "CI":"1",
   "NODE_ENV":"test",
  })
  checks["noRealMemberCredentialsOrProviderEnv"]=not any(
   k in env for k in ("OPENAI_API_KEY","ANTHROPIC_API_KEY",
                     "AWS_SECRET_ACCESS_KEY","RESEND_API_KEY"))
  initial=run(["./node_modules/.bin/jest","--runInBand","--no-coverage",
   "--runTestsByPath","scripts/ops/__tests__/r63StandardImportPG16.test.ts"],
   timeout=135,check=False,env=env)
  INITIAL.write_text(initial.stdout+"\n"+initial.stderr)
  # A PostgreSQL error may include a rejected row. The actual route and pool
  # must emit structural error metadata, never a member's attempted prose.
  logs=INITIAL.read_text(errors="replace")
  checks["noFictionalProseInErrorLogs"]=not any(part in logs for part in (
   "First fictional section.","Second fictional section.",
   "R63_FICTIONAL_CONSTRAINT_FAILURE",
  ))
  if initial.returncode!=0:raise RuntimeError("R63_ACTUAL_NEXT_PG16_JEST_REFUSED")
  checks["realActualNextImportTest"]="7 passed, 7 total" in (
   initial.stdout+initial.stderr)
  checks["failingSecondSectionRolledBack"]=sql(
   "SELECT count(*) FROM member_manuscripts")=="1" and sql(
   "SELECT count(*) FROM manuscript_sections")=="2"
  checks["sourceArrivalsIntact"]=sql(
   "SELECT count(*) FROM manuscript_source_arrivals")=="1"
  cold=run(["./node_modules/.bin/jest","--runInBand","--no-coverage",
   "--runTestsByPath","scripts/ops/__tests__/r63StandardImportColdPG16.test.ts"],
   timeout=100,check=False,env=env)
  COLD.write_text(cold.stdout+"\n"+cold.stderr)
  checks["freshProcessManuscriptReopened"]=(
   cold.returncode==0 and "2 passed, 2 total" in
   cold.stdout+cold.stderr)

  # AFTER the original R63 cold reader, exercise a new canonical
  # confirmation UUID against genuine PG16 uniqueness, concurrent requests,
  # Source-in-one-transaction, rollback, distinct members and deletion.
  r65=run(["./node_modules/.bin/jest","--runInBand","--no-coverage",
   "--runTestsByPath","scripts/ops/__tests__/r65ConfirmedPastePG16.test.ts"],
   timeout=150,check=False,env=env)
  R65_INITIAL.write_text(r65.stdout+"\n"+r65.stderr)
  if r65.returncode!=0:raise RuntimeError("R65_REAL_PG16_CONFIRMATION_REFUSED")
  checks["r65ActualNextOnceOnly"]="9 passed, 9 total" in (
   r65.stdout+r65.stderr)
  checks["r65DeletedConfirmationTombstone"]=sql(
   "SELECT count(*) FROM manuscript_import_confirmations "
   "WHERE manuscript_id IS NULL")=="1"
  checks["r65DeletedPayloadFingerprintGone"]=sql(
   "SELECT count(*) FROM manuscript_import_active_payloads p "
   "JOIN manuscript_import_confirmations c "
   "ON c.member_id=p.member_id AND c.confirmation_id=p.confirmation_id "
   "WHERE c.manuscript_id IS NULL")=="0"
  r65logs=R65_INITIAL.read_text(errors="replace")
  checks["r65NoFictionalProseInErrorLogs"]=not any(s in r65logs for s in (
   "Exact fictional Source 🌱","Exact fictional authored passage.",
   "R65_SOURCE_INSERT_FAILURE_FICTIONAL",
  ))
  rcold=run(["./node_modules/.bin/jest","--runInBand","--no-coverage",
   "--runTestsByPath","scripts/ops/__tests__/r65ConfirmedPasteColdPG16.test.ts"],
   timeout=90,check=False,env=env)
  R65_COLD.write_text(rcold.stdout+"\n"+rcold.stderr)
  checks["r65ColdProcessReceipt"]=(
   rcold.returncode==0 and "2 passed, 2 total" in
   rcold.stdout+rcold.stderr)

  if not all(v for k,v in checks.items() if k!="disposableContainerRemoved"):
   raise RuntimeError("R63_FICTIONAL_IMPORT_CHECK_FAILED")
 except Exception as exc:
  error=type(exc).__name__+":"+str(exc)[:420]
 finally:
  if started:
   outcome=docker("rm","-f","-v",NAME,check=False,timeout=25)
   checks["disposableContainerRemoved"]=outcome.returncode==0
  if started and not checks["disposableContainerRemoved"]:
   error=(error or "")+";R63_CONTAINER_REMOVAL_FAILED"
 passed=error is None and all(checks.values())
 status=("R63_ACTUAL_NEXT_MANUSCRIPT_IMPORT_ATOMIC_PG16_PASS_RELEASE_HOLD"
         if passed else "R63_ACTUAL_NEXT_MANUSCRIPT_IMPORT_PG16_HELD")
 report={
  "protocol":"soullab.ws.beta.actual-next-standard-import.pg16.v1",
  "status":status,
  "sourceHead":run(["git","rev-parse","HEAD"]).stdout.strip(),
  "checks":checks,"error":error,
  "dataClassification":"fictional-only",
  "productionChanged":False,"realMemberTouched":False,
  "actualLiveWriterEnabled":False,"externalKeyOrProviderCalls":0,
  "disposableContainerRemoved":checks["disposableContainerRemoved"],
  "time":datetime.now(timezone.utc).isoformat(),
 }
 RECEIPT.write_text(json.dumps(report,indent=2))
 print(json.dumps(report))
 return 0 if passed else 2

if __name__=="__main__":
 raise SystemExit(main())
