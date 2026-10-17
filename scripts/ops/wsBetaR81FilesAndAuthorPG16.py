#!/usr/bin/env python3
"""Isolated PG16 actual Next manuscript POST: fictional, loopback, no real data.
Requires explicit opt-in, a cached postgres image, no bind mounts, and
no provider/secret forwarding. No production SQL or member account access.
"""
import json, os, secrets, re, subprocess, time, signal, socket, tempfile, shutil, hashlib
from pathlib import Path
from datetime import datetime,timezone
from urllib.request import urlopen

ROOT=Path(__file__).resolve().parents[2]
E=Path(os.environ.get("R63_EVIDENCE_DIR",
 "/Volumes/T7 Shield/ws-beta-r81-converged-file-author-evidence-20261017"))
NAME="ws-r66-press-"+secrets.token_hex(6)
NEXT_BIN="/Users/soullab/.nvm/versions/node/v22.22.3/bin"
next_proc=None
testroot=None
NEXT_LOG=None
RECEIPT=E/"R81_FOUR_FILE_AND_AUTHOR_WEBKIT_PG16.json"
BROWSER_LOG=E/"R66_ACTUAL_NEXT_PRESS_WEBKIT_BROWSER.log"
SCREEN=E/"R66_FICTIONAL_PRESS_PREVIEW.png"
INITIAL=E/"R63_ACTUAL_NEXT_IMPORT_JEST.log"
COLD=E/"R63_FRESH_PROCESS_READBACK_JEST.log"
R65_INITIAL=E/"R65_ACTUAL_NEXT_CONFIRM_PASTE_JEST.log"
R65_COLD=E/"R65_FRESH_PROCESS_CONFIRM_RECEIPT_JEST.log"
A="11111111-1111-4111-8111-111111111111"
B="22222222-2222-4222-8222-222222222222"
FAKE_NOTICE="FICTIONAL ONLY: R72 Writer's Studio consent rehearsal. No real member, personal writing, MAIA model or third-party provider is involved in this isolated test."
POLICY_VERSION="r72-fictional-notice-v1"
POLICY_HASH=hashlib.sha256(FAKE_NOTICE.encode("utf-8")).hexdigest()

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

def migrate_fixture():
 # This schema is intentionally NOT in database/migrations and can never
 # enter an ordinary shipping migration sweep.
 name="wsR71FictionalApproval.sql"
 file=ROOT/"scripts"/"ops"/"fixtures"/name
 if not file.is_file():raise RuntimeError("R71_MISSING_FICTIONAL_ONLY_SQL")
 dst="/tmp/"+name
 docker("cp",str(file),NAME+":"+dst)
 docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
        "-U","fict","-d","ws_atomic","-f",dst,timeout=35)

def migrate_r77p_fixture():
 name="wsR76PrivateCandidate.sql"
 file=ROOT/"scripts"/"ops"/"fixtures"/name
 if not file.is_file():raise RuntimeError("R77P_MISSING_FICTIONAL_SEALED_SCHEMA")
 dst="/tmp/"+name
 docker("cp",str(file),NAME+":"+dst)
 docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
        "-U","fict","-d","ws_atomic","-f",dst,timeout=35)

def migrate_r79_fixture():
 name="wsR79PrivatePassageBinding.sql"
 file=ROOT/"scripts"/"ops"/"fixtures"/name
 if not file.is_file():raise RuntimeError("R79_MISSING_FICTIONAL_PASSAGE_BINDING")
 dst="/tmp/"+name
 docker("cp",str(file),NAME+":"+dst)
 docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
        "-U","fict","-d","ws_atomic","-f",dst,timeout=35)

def mint_synthetic_runtime_keys():
 # Keys are NEW for each disposable physical test run. Never printed or
 # written into a receipt, command line, repository or browser response.
 js=("const c=require('node:crypto');"
     "const keys=c.generateKeyPairSync('ed25519');"
     "process.stdout.write(JSON.stringify({"
     "workKeyId:c.randomUUID(),workKeyHex:c.randomBytes(32).toString('hex'),"
     "contentHex:c.randomBytes(32).toString('hex'),"
     "privatePEMB64:Buffer.from(keys.privateKey.export({format:'pem',type:'pkcs8'})).toString('base64'),"
     "publicPEMB64:Buffer.from(keys.publicKey.export({format:'pem',type:'spki'})).toString('base64')"
     "}));")
 clean={k:os.environ[k] for k in ("PATH","LANG","HOME","TMPDIR")
        if k in os.environ}
 r=run([NEXT_BIN+"/node","-e",js],timeout=12,env=clean)
 keys=json.loads(r.stdout)
 if len(keys.get("workKeyHex",""))!=64 or len(keys.get("contentHex",""))!=64:
  raise RuntimeError("R77P_SYNTHETIC_KEY_MINT_REFUSED")
 return keys

def main():
 if (os.environ.get("R63_STANDARD_IMPORT_PG16")!="fictional-only" or
     os.environ.get("R66_ACTUAL_PRESS_BROWSER")!="fictional-only"):
  print("R66 actual Next/Press browser default off; two explicit fictional-only opt-ins required")
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
 global next_proc,testroot,NEXT_LOG
 origin=""
 webReport=None
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

  if not all(v for k,v in checks.items() if k not in (
   "disposableContainerRemoved","r66ServerStopped","r66TemporaryFilesRemoved",
   "r66ActualDraftCatalogSchema",
  "r66RealNextServerLoopback","r66ActualStudioCompiledBeforeAuthorArrival",
  "r66BrowserActualPress",
   "r66RealServerSaveCommittedBeforeLostReply",
   "r66RealBrowserExactRetryAndStudioHandoff",
   "r81FiveAdditionalWorkAndOriginals",
   "r66NoOffHostBrowserRequests","r66NoOtherMemberWrites",
   "r66BrowserClosed")):
   raise RuntimeError("R63_R65_FICTIONAL_IMPORT_CHECK_FAILED")

  # No external provider, member keys or prod .env. Start the GENUINE Next
  # application on localhost against the SAME disposable fictional PG16.
  if (ROOT/".env").exists() or (ROOT/".env.local").exists():
   raise RuntimeError("R66_REFUSE_PRODUCTION_ENV_FILE_IN_WORKTREE")
  before=tuple(sql("""SELECT (SELECT count(*) FROM member_manuscripts),
      (SELECT count(*) FROM manuscript_sections),
      (SELECT count(*) FROM manuscript_source_arrivals),
      (SELECT count(*) FROM manuscript_import_confirmations),
      (SELECT count(*) FROM manuscript_import_active_payloads)""").split('|'))
  # The ACTUAL Press manuscript catalog includes draft-presence,
  # revision activity, and baseline lineage joins. Reproduce the real
  # repository migration, not a fake mocked GET response.
  migrate("20260727000001_manuscript_working_drafts.sql")
  migrate("20260731000001_draft_concurrency.sql")
  migrate("20260830000001_manuscript_draft_sections.sql")
  migrate("20260902000002_working_draft_revision_partition.sql")
  migrate("20260916000001_writer_studio_chapter_review_runs.sql")
  migrate("20260914000001_proposal_succession.sql")
  migrate("20261015000001_writer_studio_beta_consent_events.sql")
  migrate_fixture()
  migrate_r77p_fixture()
  migrate_r79_fixture()
  checks["r79ActualPrivatePassageSchema"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name='ws_r79_fixture_private_passage'")=="1"
  checks["r77pActualSealedPendingSchema"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name='ws_r76_fixture_pending_private'")=="1"
  checks["r71ActualApprovalSchema"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name='ws_r71_fixture_author_approvals'")=="1"
  checks["r69ActualReviewManifestSchema"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name='writer_studio_chapter_review_runs'")=="1"
  checks["r66ActualDraftCatalogSchema"]=sql(
   "SELECT count(*) FROM information_schema.tables WHERE table_name IN "
   "('manuscript_working_drafts','working_draft_revisions')")=="2"
  if not checks["r66ActualDraftCatalogSchema"]:
   raise RuntimeError("R66_ACTUAL_DRAFT_DEPENDENCIES_MISSING")
  sql("""ALTER TABLE members ADD COLUMN tier text DEFAULT 'pro';
      ALTER TABLE members ADD COLUMN roles jsonb
        DEFAULT '["member","steward"]'::jsonb;
      ALTER TABLE members ADD COLUMN admin_role text;
      CREATE TABLE ops_contacts(member_id uuid REFERENCES members(id),
       contact_type text NOT NULL,pipeline_stage text NOT NULL,
       deleted_at timestamptz);
      INSERT INTO ops_contacts(member_id,contact_type,pipeline_stage)
       VALUES ('"""+A+"""','beta_tester','active');
      INSERT INTO writers_studio_beta_consent_events
        (member_id,actor_member_id,decision,policy_version,policy_sha256)
       VALUES ('"""+A+"""','"""+A+"""','accept','"""+POLICY_VERSION+"""',
        '"""+POLICY_HASH+"""');""")
  checks["r72RealConsentAndProposalSchemas"]=sql(
   "SELECT count(*) FROM information_schema.tables "
   "WHERE table_name IN ('proposal_chains','proposal_versions',"
   "'writers_studio_beta_consent_events')")=="3"
  checks["r72FictionalMemberConsentInitiallyAccepted"]=sql(
   "SELECT count(*) FROM writers_studio_beta_consent_events "
   "WHERE decision='accept'")=="1"
  testroot=Path(tempfile.mkdtemp(prefix="ws-r66-fictional-only-"))
  (testroot/"vault").mkdir(mode=0o700)
  (testroot/"R66_FICTIONAL_ONLY.marker").write_text("fictional only\\n")
  with socket.socket() as sock:
   sock.bind(("127.0.0.1",0))
   port=sock.getsockname()[1]
  origin=f"http://127.0.0.1:{port}"
  synthetic=mint_synthetic_runtime_keys()
  checks["r77pFreshSyntheticServerKeys"]=bool(
   synthetic.get("privatePEMB64") and synthetic.get("publicPEMB64"))
  nextenv={
   "PATH":NEXT_BIN+":/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin",
   "HOME":str(testroot),
   "NODE_ENV":"development","NEXT_TELEMETRY_DISABLED":"1","CI":"1",
   "DATABASE_URL":env["DATABASE_URL"],
   "FILE_STORAGE_PATH":str(testroot/"vault"),
   "NEXT_PUBLIC_WS_BETA_REAL_MEMBER_ENABLED":"false",
   "R71_AUTHOR_EDITORIAL_FIXTURE":"fictional-only",
   "NEXT_PUBLIC_R71_AUTHOR_EDITORIAL_FIXTURE":"fictional-only",
   "R72_MEMBER_PROPOSALS_FIXTURE":"fictional-only",
   "NEXT_PUBLIC_R72_MEMBER_PROPOSALS_FIXTURE":"fictional-only",
   "R76_PENDING_CANDIDATE_FIXTURE":"fictional-only",
   "R77P_LOCAL_REVIEW_FIXTURE":"fictional-only",
   "NEXT_PUBLIC_R77P_LOCAL_REVIEW_FIXTURE":"fictional-only",
   "R79_PRIVATE_AUTHOR_FIXTURE":"fictional-only",
   "NEXT_PUBLIC_R79_PRIVATE_AUTHOR_FIXTURE":"fictional-only",
   "R77P_KEYS_ORIGIN":"synthetic-generated-test-only",
   "R77P_FAKE_WORK_KEY_ID":synthetic["workKeyId"],
   "R77P_FAKE_WORK_KEY_HEX":synthetic["workKeyHex"],
   "R77P_FAKE_CONTENT_SECRET_HEX":synthetic["contentHex"],
   "R77P_FAKE_PRIVATE_PEM_B64":synthetic["privatePEMB64"],
   "R77P_FAKE_PUBLIC_PEM_B64":synthetic["publicPEMB64"],
   "WRITERS_STUDIO_BETA_MEMBER_IDS":A,
   "WRITERS_STUDIO_BETA_CONSENT_VERSION":POLICY_VERSION,
   "WRITERS_STUDIO_BETA_CONSENT_SHA256":POLICY_HASH,
   "WRITERS_STUDIO_BETA_CONSENT_NOTICE":FAKE_NOTICE,
   "PLAYWRIGHT_BROWSERS_PATH":"/Users/soullab/Library/Caches/ms-playwright",
   "CAPACITOR_BUILD":"","MAIA_CABIN_MODE":"",
  }
  NEXT_LOG=E/"R66_ACTUAL_NEXT_WEBPACK_LOCAL.log"
  with NEXT_LOG.open("w") as server_output:
   next_proc=subprocess.Popen([str(ROOT/"node_modules/.bin/next"),
      "dev","--webpack","--hostname","127.0.0.1","-p",str(port)],
      cwd=ROOT,env=nextenv,stdout=server_output,stderr=subprocess.STDOUT,
      start_new_session=True)
  ready=False
  for _ in range(155):
   if next_proc.poll() is not None:break
   try:
    with urlopen(origin+"/signin",timeout=5) as response:
     ready=response.status==200
   except Exception:
    ready=False
   if ready:break
   time.sleep(.7)
  checks["r66RealNextServerLoopback"]=ready and next_proc.poll() is None
  if not checks["r66RealNextServerLoopback"]:
   raise RuntimeError("R66_NEXT_SERVER_NOT_AVAILABLE")
  # Next dev Hot Refresh must not interrupt the writer's first navigation.
  # Warm the genuine canonical Studio Next route using ONLY the same made-up
  # cookie, before the Press browser opens. This is a server GET, never an
  # application write or mocked content response.
  from urllib.request import Request
  try:
   warm=Request(origin+
    "/writers-studio?mode=write&m=33333333-3333-4333-8333-333333333333",
    headers={"Cookie":"maia_session=r63-fictional-auth-a"})
   with urlopen(warm,timeout=65) as response:
    checks["r66ActualStudioCompiledBeforeAuthorArrival"]=response.status==200
  except Exception:
   checks["r66ActualStudioCompiledBeforeAuthorArrival"]=False
  if not checks["r66ActualStudioCompiledBeforeAuthorArrival"]:
   raise RuntimeError("R66_CANONICAL_STUDIO_NOT_COMPILED_WITH_FAKE_SESSION")
  # A nonexistent invented manuscript distinguishes a passed local fixture gate
  # (member-scoped JSON not_found) from a blank 404 before authentication.
  from urllib.error import HTTPError
  body=""
  try:
   probe=Request(origin+
    "/api/writers-studio/r71-fixture-author?mode=state&manuscriptId=33333333-3333-4333-8333-333333333333",
    headers={"Cookie":"maia_session=r63-fictional-auth-a"})
   with urlopen(probe,timeout=70) as response:
    body=response.read(400).decode("utf-8","replace")
  except HTTPError as response:
   body=response.read(400).decode("utf-8","replace")
  except Exception:
   pass
  try:
   checks["r71FixtureLocalGateOpen"]=json.loads(body).get("reason")=="not_found"
  except Exception:
   checks["r71FixtureLocalGateOpen"]=False
  if not checks["r71FixtureLocalGateOpen"]:
   # Probe is a nonexistent fictional manuscript; only a bounded, redacted
   # refusal discriminant is retained (never IDs or prose).
   try:
    discriminant=json.loads(body).get('reason', 'no_refusal_reason')
   except Exception:
    discriminant='empty_or_non_json'
   raise RuntimeError("R71_LOCAL_FAKE_SESSION_GATE_NOT_ESTABLISHED_"+str(discriminant)[:60])

  benv=dict(nextenv)
  benv.update({
   "R66_ACTUAL_PRESS_BROWSER":"fictional-only",
   "R66_PRESS_ORIGIN":origin,
   "R66_SOURCE_SHA":run(["git","rev-parse","HEAD"]).stdout.strip(),
   "R66_DESKTOP_SCREENSHOT":str(SCREEN),
  })
  # Stream progress labels to a fixture-only log; do not emit writer text.
  with BROWSER_LOG.open("w") as browser_output:
   browsed=subprocess.run(
    [NEXT_BIN+"/node","scripts/ops/wsBetaR81FilesAndAuthorWebKit.cjs"],
    cwd=ROOT,env=benv,stdout=browser_output,stderr=subprocess.STDOUT,
    text=True,timeout=300)
  reports=[x.strip() for x in BROWSER_LOG.read_text(errors="replace").splitlines()
   if x.startswith("{") and "soullab.ws.beta.r81" in x]
  if reports:webReport=json.loads(reports[-1])
  checks["r66BrowserActualPress"]=(
   browsed.returncode==0 and webReport is not None and
   webReport.get("status")==
    "R81_REAL_FOUR_FORMATS_AND_PRIVATE_AUTHOR_WEBKIT_PASS_BETA_HOLD")
  checks["r66RealServerSaveCommittedBeforeLostReply"]=bool(
   webReport and webReport.get("firstSaveStatus")==201)
  checks["r66RealBrowserExactRetryAndStudioHandoff"]=bool(
   webReport and webReport.get("confirmationStable") and
   webReport.get("secondSaveStatus")==200 and
   webReport.get("duplicateCount")==1)
  checks["r66NoOffHostBrowserRequests"]=bool(
   webReport and webReport.get("offHostRequestsBlocked")==0)
  checks["r66NoOtherMemberWrites"]=bool(
   webReport is not None and all(
    name=="/api/writers-studio/return/place"
    for name in webReport.get("unexpectedWrites",[])))
  checks["r68ActualWriteVisible"]=bool(
   webReport and webReport.get("actualWriteReady") and
   webReport.get("draftCreateStatuses")==[201] and
   "no_draft" in webReport.get("contextStates",[]) and
   "section_aware" in webReport.get("contextStates",[]))
  checks["r68OneRealWorkingDraft"]=sql(
   "SELECT count(*) FROM manuscript_working_drafts d "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "WHERE m.title='R66 Fictional Author Manuscript'")=="1"
  checks["r68RevisionFromVerbatimSource"]=sql(
   "SELECT count(*) FROM manuscript_working_drafts d "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "JOIN working_draft_revisions r ON r.draft_id=d.id "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND d.section_addressable_at IS NOT NULL AND r.revision_number=1 "
   "AND r.content=d.content AND r.section_partition IS NOT NULL")=="1"
  checks["r69RealReviewAuthorRoundTrip"]=bool(
   webReport and webReport.get("realReviewReady") and
   200 in webReport.get("reviewGetStatuses",[]) and
   0 in webReport.get("reviewRunCounts",[]))
  checks["r69MobileReviewFits"]=bool(
   webReport and webReport.get("mobileReviewReady"))
  checks["r69AllEditorialDefaultOff"]=bool(
   webReport and
   {tuple((row.get("kind"),row.get("status")))
    for row in webReport.get("editorialDefaultOffStatuses",[])}==
   {(route,404) for route in ("thread","turn","version","adoption","undo")})
  checks["r69NoReviewPublication"]=sql(
   "SELECT count(*) FROM writer_studio_chapter_review_runs")=="0"
  checks["r70RealAuthorSaveAndRestore"]=bool(
   webReport and webReport.get("authorEditSaved") and
   webReport.get("restoreCompleted") and
   webReport.get("revisionRestoreIntentVisible") and
   200 in webReport.get("sectionSaveStatuses",[]) and
   200 in webReport.get("revisionRestoreStatuses",[]) and
   webReport.get("checkpointStatuses",[]).count(200)>=2)
  checks["r79TenImmutableRevisions"]=sql(
   "SELECT count(*) FROM working_draft_revisions r "
   "JOIN manuscript_working_drafts d ON d.id=r.draft_id "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND r.section_partition IS NOT NULL")=="10"
  checks["r70HistoryPreservesEditedAndRestoredBytes"]=sql(
   "SELECT count(*) FROM manuscript_working_drafts d "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "JOIN working_draft_revisions original ON original.draft_id=d.id "
   "AND original.revision_number=1 "
   "JOIN working_draft_revisions changed ON changed.draft_id=d.id "
   "AND changed.revision_number=2 "
   "JOIN working_draft_revisions before_restore "
   "ON before_restore.draft_id=d.id "
   "AND before_restore.revision_number=3 "
   "JOIN working_draft_revisions restored ON restored.draft_id=d.id "
   "AND restored.revision_number=4 "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND original.content=d.content AND restored.content=d.content "
   "AND changed.content=before_restore.content "
   "AND changed.content LIKE '%R70 fictional author revision.%' "
   "AND restored.note='Restored from revision 1'")=="1"
  checks["r70SourceNeverModified"]=sql(
   "SELECT count(*) FROM manuscript_sections s "
   "JOIN member_manuscripts m ON m.id=s.manuscript_id "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND s.body LIKE '%R70 fictional author revision.%'")=="0"
  checks["r79FinalWorkingDraftVersion"]=sql(
   "SELECT count(*) FROM manuscript_working_drafts d "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND d.version=9 AND d.revision_count=10")=="1"
  checks["r71ActualApplyUndoGestures"]=bool(
   webReport and webReport.get("r71Applied") and
   webReport.get("r71Undone") and
   {(x.get("kind"),x.get("status")) for x in webReport.get("r71Actions",[])}==
   {("review_exact_passage",200),("apply_reviewed_change",200),
    ("review_last_apply_for_undo",200),("undo_reviewed_change",200)})
  checks["r79TwoSpentAndUndoneApprovals"]=sql(
   "SELECT count(*) FROM ws_r71_fixture_author_approvals "
   "WHERE kind='apply' AND consumed_at IS NOT NULL AND undone_at IS NOT NULL "
   "AND pre_apply_revision=5 AND post_apply_revision=6 "
   "AND resulting_version=6 AND restored_version=7")=="1" and sql(
   "SELECT count(*) FROM ws_r71_fixture_author_approvals "
   "WHERE kind='undo' AND consumed_at IS NOT NULL "
   "AND resulting_version=7 AND parent_apply_id IS NOT NULL")=="1" and sql(
   "SELECT count(*) FROM ws_r71_fixture_author_approvals")=="4" and sql(
   "SELECT count(*) FROM ws_r71_fixture_author_approvals "
   "WHERE kind='apply' AND consumed_at IS NOT NULL AND undone_at IS NOT NULL "
   "AND pre_apply_revision=8 AND post_apply_revision=9 "
   "AND resulting_version=8 AND restored_version=9")=="1" and sql(
   "SELECT count(*) FROM ws_r71_fixture_author_approvals "
   "WHERE kind='undo' AND consumed_at IS NOT NULL "
   "AND resulting_version=9 AND parent_apply_id IS NOT NULL")=="1"
  checks["r71RevisionProof"]=sql(
   "SELECT count(*) FROM manuscript_working_drafts d "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "JOIN working_draft_revisions rfirst ON rfirst.draft_id=d.id "
   "AND rfirst.revision_number=1 "
   "JOIN working_draft_revisions rbefore ON rbefore.draft_id=d.id "
   "AND rbefore.revision_number=5 "
   "JOIN working_draft_revisions applied ON applied.draft_id=d.id "
   "AND applied.revision_number=6 "
   "JOIN working_draft_revisions undone ON undone.draft_id=d.id "
   "AND undone.revision_number=7 "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND rfirst.content=rbefore.content AND rfirst.content=undone.content "
   "AND rfirst.content=d.content "
   "AND applied.content LIKE '%fictional candle%' "
   "AND applied.content NOT LIKE '%fictional lantern.%'")=="1"
  checks["r71SourceNeverChanged"]=sql(
   "SELECT count(*) FROM manuscript_sections s "
   "JOIN member_manuscripts m ON m.id=s.manuscript_id "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND s.body LIKE '%fictional candle%'")=="0"
  checks["r71OneUseSecurityNegatives"]=bool(
   webReport and webReport.get("r71ReplayStatuses")==[409,409]
   and webReport.get("r71ForbiddenOriginStatus")==403)
  checks["r71NoSecondProseStore"]=sql(
   "SELECT count(*) FROM information_schema.columns "
   "WHERE table_name='ws_r71_fixture_author_approvals' "
   "AND column_name IN ('original_text','replacement_text','content',"
   "'body','proposed_passage','old_prose','new_prose')")=="0"
  checks["r72MemberProposalSuccess"]=bool(
   webReport and webReport.get("r72Stage",{}).get("author")=="member" and
   len(webReport.get("r72Stage",{}).get("alternatives",[]))==2 and
   webReport.get("r72ForgedMaiaStatus")==400)
  checks["r72ActualImmutableMemberSuccession"]=sql(
   "SELECT count(*) FROM proposal_versions v "
   "JOIN proposal_chains c ON c.id=v.chain_id "
   "JOIN member_manuscripts m ON m.id=c.work_id "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND c.member_id=m.member_id "
   "AND c.draft_id=(SELECT id FROM manuscript_working_drafts "
   "WHERE manuscript_id=m.id) "
   "AND c.base_version=5 AND c.expected_text='fictional lantern' "
   "AND v.author='member'")=="2" and sql(
   "SELECT count(*) FROM proposal_chains")=="1"
  checks["r72NoForgedMaiaProvenance"]=sql(
   "SELECT count(*) FROM proposal_versions WHERE author='maia'")=="0"
  checks["r77pRealPrivateBrowserReview"]=bool(
   webReport and webReport.get("r77pReadVerified") and
   webReport.get("r77pStageStatuses")==[200,200] and
   webReport.get("r77pReadStatuses")==[200,200])
  checks["r77pPrivateScopeNegatives"]=bool(
   webReport and webReport.get("r77pCrossMemberDenied") and
   webReport.get("r77pForgedRequestDenied") and
   webReport.get("r77pStaleReadDenied") and
   webReport.get("r77pRevokedReadDenied"))
  checks["r79TwoEncryptedUnpublishedCandidates"]=sql(
   "SELECT count(*) FROM ws_r76_fixture_pending_private"
   )=="2" and sql(
   "SELECT count(*) FROM proposal_versions WHERE author='maia'"
   )=="0"
  checks["r77pNoPrivateWordInSQL"]=sql(
   "SELECT count(*) FROM ws_r76_fixture_pending_private "
   "WHERE cipher_envelope::text LIKE '%fictional candle%' "
   "OR server_witness::text LIKE '%fictional candle%'")=="0"

  checks["r79ExactLocusLedgerImmutableAndNoProse"]=sql(
   "SELECT count(*) FROM ws_r79_fixture_private_passage"
   )=="2" and sql(
   "SELECT count(*) FROM information_schema.columns "
   "WHERE table_name='ws_r79_fixture_private_passage' "
   "AND column_name IN ('text','proposed_text','replacement','content',"
   "'body','formulation','original_text')")=="0"
  checks["r79PhysicalLocusTamperRejected"]=(
   docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
     "-U","fict","-d","ws_atomic","-c",
     "UPDATE ws_r79_fixture_private_passage "
     "SET passage_start=passage_start+1",check=False,timeout=25
   ).returncode!=0 and
   docker("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
     "-U","fict","-d","ws_atomic","-c",
     "DELETE FROM ws_r79_fixture_private_passage",
     check=False,timeout=25
   ).returncode!=0 and
   sql("SELECT count(*) FROM ws_r79_fixture_private_passage")=="2")
  checks["r79PrivateAuthorGesturesAndReplays"]=bool(
   webReport and webReport.get("r79SealedApply") and
   webReport.get("r79SeparateUndo") and
   webReport.get("r79NoAutoApply") and
   webReport.get("r79ReplayStatuses")==[409,409] and
   len([x for x in webReport.get("r71Actions",[])
    if x.get("kind")=="review_exact_passage" and x.get("status")==200])==2
   and len([x for x in webReport.get("r71Actions",[])
    if x.get("kind")=="apply_reviewed_change" and x.get("status")==200])==2)
  checks["r79PrivateSectionRevisionsOriginalRecovered"]=sql(
   "SELECT count(*) FROM working_draft_revisions r "
   "JOIN manuscript_working_drafts d ON d.id=r.draft_id "
   "JOIN member_manuscripts m ON m.id=d.manuscript_id "
   "JOIN working_draft_revisions r9 ON r9.draft_id=d.id "
   "AND r9.revision_number=9 "
   "JOIN working_draft_revisions r10 ON r10.draft_id=d.id "
   "AND r10.revision_number=10 "
   "WHERE m.title='R66 Fictional Author Manuscript' "
   "AND r.revision_number=1 AND r.content=r10.content "
   "AND r.content=d.content AND r9.content LIKE '%fictional candle%'"
   )=="1"
  checks["r72CurrentConsentRevocationWins"]=bool(
   webReport and webReport.get("r72Revoked") and
   webReport.get("r72ConsentRefusals")==[403,403] and
   sql("SELECT count(*) FROM writers_studio_beta_consent_events")=="2" and
   sql("SELECT decision FROM writers_studio_beta_consent_events "
       "WHERE member_id='"+A+"' ORDER BY seq DESC LIMIT 1")=="revoke"
  )
  # R81: four REAL file-backed Source custody claims, each verified with
  # physical SQL and a separate Work identity. Never serialize manuscript
  # text, uploaded bytes or private model input to the evidence receipt.
  imported=(webReport or {}).get("r81FileUploads",[])
  expected_formats={"txt","md","docx","pdf"}
  checks["r81FourRealMultipartSaves"]=bool(
   webReport and webReport.get("r81FourFormatSourceCustody") and
   webReport.get("r81FileSavedCount")==4 and len(imported)==4 and
   {x.get("format") for x in imported}==expected_formats and
   all(x.get("uploadStatus")==200 and x.get("previewStatus")==200 and
       x.get("saveStatus")==201 and x.get("reopenStatus")==200 and
       x.get("sourceCustody")=="source_custodied" for x in imported))
  artifacts_ok=bool(checks["r81FourRealMultipartSaves"])
  identities=set()
  for file in imported:
   arrival=file.get("arrivalId","")
   work=file.get("workId","")
   sha=file.get("contentSha256","")
   size=file.get("artifactSize",0)
   if (not re.fullmatch(r"[a-f0-9-]{36}",arrival) or
       not re.fullmatch(r"[a-f0-9-]{36}",work) or
       not re.fullmatch(r"[a-f0-9]{64}",sha) or
       not isinstance(size,int) or size<16 or
       arrival in identities or work in identities):
    artifacts_ok=False
    continue
   identities.add(arrival);identities.add(work)
   result=sql(
    "SELECT a.artifact_hash,a.artifact_size,a.source_kind,"
    "m.source_custody,a.member_id,m.member_id,"
    "a.artifact_ref IS NOT NULL FROM manuscript_source_arrivals a "
    "JOIN member_manuscripts m ON a.manuscript_id=m.id "
    "WHERE a.id='"+arrival+"' AND m.id='"+work+"'"
   )
   row=result.split("|")
   artifacts_ok=artifacts_ok and len(row)==7 and (
    row[0]==sha and int(row[1])==size and
    row[2]=="artifact_extraction" and
    row[3]=="source_custodied" and row[4]==A and row[5]==A and
    row[6]=="t"
   )
  checks["r81FourOriginalArtifactHashesAndOwnedWorks"]=artifacts_ok
  checks["r81ActualDocxFidelityGateInWebKit"]=bool(
   webReport and webReport.get("r81DocxFidelityBrowserPassed") and
   next((x.get("fidelityAcknowledgedInActualWebKit",False)
         for x in imported if x.get("format")=="docx"),False))

  checks["r81ExactlyFourClaimedArtifactsPlusOnePaste"]=(
   sql("SELECT count(*) FROM manuscript_source_arrivals a "
       "JOIN member_manuscripts m ON m.id=a.manuscript_id "
       "WHERE a.source_kind='artifact_extraction' "
       "AND m.title LIKE 'R81 Fictional % Imported Work'"
       )=="4" and
   sql("SELECT count(*) FROM manuscript_source_arrivals a "
       "JOIN member_manuscripts m ON m.id=a.manuscript_id "
       "WHERE a.source_kind='member_supplied_text' "
       "AND m.title='R66 Fictional Author Manuscript'"
       )=="1"
  )
  checks["r66BrowserClosed"]=bool(
   webReport and webReport.get("browserClosed"))
  after=tuple(sql("""SELECT (SELECT count(*) FROM member_manuscripts),
      (SELECT count(*) FROM manuscript_sections),
      (SELECT count(*) FROM manuscript_source_arrivals),
      (SELECT count(*) FROM manuscript_import_confirmations),
      (SELECT count(*) FROM manuscript_import_active_payloads)""").split('|'))
  checks["r81FiveAdditionalWorkAndOriginals"]=bool(
   int(after[0])-int(before[0])==5 and
   int(after[1])-int(before[1])>=1 and
   int(after[2])-int(before[2])==5 and
   int(after[3])-int(before[3])==1 and
   int(after[4])-int(before[4])==1)
  checks["r66NoFictionalProseInWebServerLogs"]=bool(
   NEXT_LOG and NEXT_LOG.is_file() and
   not any(word in NEXT_LOG.read_text(errors="replace") for word in (
    "The river remembers the fictional lantern.",
    "The mountains hold a fictional evening.",
    "R70 fictional author revision.",
    "fictional candle",
    "fictional lantern at dusk",
    "A fictional candle glows beside the remembered river.",
    "R81 fictional TXT source line.",
    "R81 fictional Markdown chapter.",
    "R81 fictional PDF text layer.",
    "The morning came slowly over the hills",
   )))
  if not all(checks[k] for k in (
   "r66BrowserActualPress","r66RealServerSaveCommittedBeforeLostReply",
   "r66RealBrowserExactRetryAndStudioHandoff",
   "r81FiveAdditionalWorkAndOriginals",
   "r81FourRealMultipartSaves",
   "r81FourOriginalArtifactHashesAndOwnedWorks",
   "r81ActualDocxFidelityGateInWebKit",
   "r81ExactlyFourClaimedArtifactsPlusOnePaste",
   "r66NoOffHostBrowserRequests","r66NoOtherMemberWrites",
   "r66BrowserClosed","r66NoFictionalProseInWebServerLogs",
   "r66ActualDraftCatalogSchema",
   "r68ActualWriteVisible","r68OneRealWorkingDraft",
   "r68RevisionFromVerbatimSource",
   "r69ActualReviewManifestSchema","r69RealReviewAuthorRoundTrip",
   "r71ActualApprovalSchema",
   "r69MobileReviewFits","r69AllEditorialDefaultOff",
   "r69NoReviewPublication",
   "r70RealAuthorSaveAndRestore","r79TenImmutableRevisions",
   "r70HistoryPreservesEditedAndRestoredBytes","r70SourceNeverModified",
   "r79FinalWorkingDraftVersion","r71ActualApplyUndoGestures",
   "r79TwoSpentAndUndoneApprovals","r71RevisionProof",
   "r71SourceNeverChanged","r71NoSecondProseStore",
   "r71OneUseSecurityNegatives",
   "r72RealConsentAndProposalSchemas",
   "r72FictionalMemberConsentInitiallyAccepted",
   "r72MemberProposalSuccess","r72ActualImmutableMemberSuccession",
   "r72NoForgedMaiaProvenance","r72CurrentConsentRevocationWins",
   "r77pActualSealedPendingSchema","r77pFreshSyntheticServerKeys",
   "r77pRealPrivateBrowserReview","r77pPrivateScopeNegatives",
   "r79TwoEncryptedUnpublishedCandidates",
   "r77pNoPrivateWordInSQL",
   "r79ActualPrivatePassageSchema",
   "r79ExactLocusLedgerImmutableAndNoProse",
   "r79PhysicalLocusTamperRejected",
   "r79PrivateAuthorGesturesAndReplays",
   "r79PrivateSectionRevisionsOriginalRecovered")):
   raise RuntimeError("R66_ACTUAL_WEBKIT_PRESS_NOT_QUALIFIED:"+
       str(webReport.get("error") if webReport else "browser_no_receipt"))

 except Exception as exc:
  error=type(exc).__name__+":"+str(exc)[:420]
 finally:
  if next_proc and next_proc.poll() is None:
   try:
    os.killpg(next_proc.pid,signal.SIGTERM)
    next_proc.wait(timeout=9)
   except Exception:
    try:
     os.killpg(next_proc.pid,signal.SIGKILL)
     next_proc.wait(timeout=6)
    except Exception:pass
  checks["r66ServerStopped"]=next_proc is not None and next_proc.poll() is not None
  if testroot is not None and testroot.exists():
   try:shutil.rmtree(testroot)
   except Exception:pass
  checks["r66TemporaryFilesRemoved"]=testroot is not None and not testroot.exists()
  if started:
   outcome=docker("rm","-f","-v",NAME,check=False,timeout=25)
   checks["disposableContainerRemoved"]=outcome.returncode==0
  if started and not checks["disposableContainerRemoved"]:
   error=(error or "")+";R63_CONTAINER_REMOVAL_FAILED"
 passed=error is None and all(checks.values())
 status=("R81_FOUR_FORMATS_AND_AUTHOR_ADMISSION_PASS_BETA_HOLD"
         if passed else "R81_FOUR_FORMATS_AND_AUTHOR_ADMISSION_HELD")
 report={
  "protocol":"soullab.ws.beta.r81.four-format-owned-source-and-author-pg16.v1",
  "status":status,
  "sourceHead":run(["git","rev-parse","HEAD"]).stdout.strip(),
  "checks":checks,"error":error, "browser":webReport,
  "dataClassification":"fictional-only",
  "productionChanged":False,"realMemberTouched":False,
  "actualLiveWriterEnabled":False,"externalKeyOrProviderCalls":0,
  "disposableContainerRemoved":checks["disposableContainerRemoved"],
  "time":datetime.now(timezone.utc).isoformat(),
 }
 RECEIPT.write_text(json.dumps(report,indent=2))
 RECEIPT.chmod(0o600)
 print(json.dumps(report))
 return 0 if passed else 2

if __name__=="__main__":
 raise SystemExit(main())
