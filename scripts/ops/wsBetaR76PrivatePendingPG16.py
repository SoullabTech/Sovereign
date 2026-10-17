#!/usr/bin/env python3
"""R76: test-only encrypted pending candidate against actual disposable PG16.
No production, member, model, key service, GitHub or deployment access.
"""
import os,json,subprocess,secrets,time,shutil,re,hashlib,tempfile
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
E=Path(os.environ.get("R76_EVIDENCE_DIR",
 "/Volumes/T7 Shield/ws-beta-r76-pending-evidence-default-20261017"))
NAME="ws-r76-pending-"+secrets.token_hex(6)
MEMBER="11111111-1111-4111-8111-111111111111"
OTHER="22222222-2222-4222-8222-222222222222"
NOTICE=("FICTIONAL ONLY: Writer beta confidential candidate acceptance. "
 "No actual member, consent, manuscript, model call or provider is involved.")
NOTICE_HASH=hashlib.sha256(NOTICE.encode()).hexdigest()
POLICY_VERSION="r76-fictional-notice-v1"
LOG=E/"R76_FICTIONAL_PG16_JEST.log"
REPORT=E/"R76_PRIVATE_PENDING_PG16.json"

def sh(argv,timeout=40,check=True,env=None):
 r=subprocess.run(argv,cwd=ROOT,env=env,capture_output=True,text=True,
  timeout=timeout)
 if check and r.returncode:
  raise RuntimeError("r76_command_failed_"+str(argv[0])+"_rc_"+str(r.returncode))
 return r
def dock(*args,**kwargs):
 return sh(["docker",*args],**kwargs)
def sql(statement,check=True):
 return dock("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
  "-U","fict","-d","ws_atomic","-c",statement,
  timeout=35,check=check)
def migrate(name,fixture=False):
 base=ROOT/("scripts/ops/fixtures" if fixture else "database/migrations")
 file=base/name
 if not file.is_file():raise RuntimeError("r76_missing_migration")
 dock("cp",str(file),NAME+":/tmp/"+name)
 dock("exec",NAME,"psql","-XAtq","-v","ON_ERROR_STOP=1",
  "-U","fict","-d","ws_atomic","-f","/tmp/"+name,timeout=45)

def main():
 if (os.environ.get("R76_PRIVATE_PG16")!="fictional-only" or
     os.environ.get("R63_STANDARD_IMPORT_PG16")!="fictional-only"):
  print("R76_FICTIONAL_ONLY_MARKERS_REQUIRED")
  return 3
 expected=os.environ.get("R76_EXPECTED_HEAD")
 if expected:
  if sh(["git","rev-parse","HEAD"]).stdout.strip()!=expected or sh(
   ["git","status","--porcelain"]).stdout.strip():
   print("R76_EXACT_SOURCE_NOT_CLEAN")
   return 4
 if not str(E).startswith("/Volumes/T7 Shield/ws-beta-") or E.exists():
  print("R76_EXCLUSIVE_NEW_EVIDENCE_PATH_REQUIRED")
  return 5
 if (ROOT/".env").exists() or (ROOT/".env.local").exists():
  print("R76_REFUSE_REAL_APPLICATION_ENV")
  return 6
 E.mkdir(mode=0o700,parents=True)
 active=False;error=None;checks={}
 try:
  dock("image","inspect","postgres:16.13")
  checks["cachedOfflinePG16"]=True
  dock("run","--pull","never","-d","--name",NAME,"--network","bridge",
   "--memory","512m","--cpus","1","--pids-limit","128",
   "--security-opt","no-new-privileges",
   "--tmpfs","/var/lib/postgresql/data:rw,nosuid,size=256m",
   "-p","127.0.0.1::5432",
   "-e","POSTGRES_USER=fict","-e","POSTGRES_DB=ws_atomic",
   "-e","POSTGRES_HOST_AUTH_METHOD=trust","postgres:16.13",timeout=60)
  active=True
  ready=False
  for _ in range(80):
   q=sql("SELECT 1",check=False)
   if q.returncode==0 and q.stdout.strip()=="1":
    ready=True;break
   time.sleep(.16)
  if not ready:raise RuntimeError("r76_disposable_pg_not_ready")
  cfg=json.loads(dock("inspect",NAME,"--format",
    "{{json .HostConfig}}").stdout)
  bindings=cfg.get("PortBindings",{}).get("5432/tcp") or []
  checks["loopbackOnlyNoHostBinds"]=(
   len(bindings)==1 and bindings[0].get("HostIp")=="127.0.0.1"
   and cfg.get("Binds") is None)
  if not checks["loopbackOnlyNoHostBinds"]:
   raise RuntimeError("r76_unsafe_database_network")
  match=re.fullmatch(r"127[.]0[.]0[.]1:([0-9]+)",
   dock("port",NAME,"5432/tcp").stdout.strip())
  if not match:raise RuntimeError("r76_non_loopback_pg")
  url="postgresql://fict@127.0.0.1:"+match.group(1)+"/ws_atomic"
  sql("""CREATE TABLE members(id uuid PRIMARY KEY,admin_role text);
    CREATE TABLE ops_contacts(
     member_id uuid REFERENCES members(id),
     contact_type text,pipeline_stage text,deleted_at timestamptz);
    INSERT INTO members(id) VALUES
     ('"""+MEMBER+"""'),('"""+OTHER+"""');
    INSERT INTO ops_contacts(member_id,contact_type,pipeline_stage)
     VALUES('"""+MEMBER+"""','beta_tester','active');""")
  for m in (
   "20260721000003_press_manuscript_room.sql",
   "20260727000001_manuscript_working_drafts.sql",
   "20260731000001_draft_concurrency.sql",
   "20260830000001_manuscript_draft_sections.sql",
   "20260914000001_proposal_succession.sql",
   "20261015000001_writer_studio_beta_consent_events.sql",
  ):migrate(m)
  migrate("wsR76PrivateCandidate.sql",fixture=True)
  checks["actualSchemaAndFictionalLedger"]=sql(
   "SELECT count(*) FROM information_schema.tables WHERE table_name IN "
   "('member_manuscripts','manuscript_working_drafts',"
   "'manuscript_draft_sections','proposal_versions',"
   "'writers_studio_beta_consent_events',"
   "'ws_r76_fixture_pending_private')").stdout.strip()=="6"
  sql("""INSERT INTO writers_studio_beta_consent_events
   (member_id,actor_member_id,decision,policy_version,policy_sha256)
   VALUES('"""+MEMBER+"""','"""+MEMBER+"""','accept','"""+POLICY_VERSION+
   """','"""+NOTICE_HASH+"""')""")
  checks["realConsentSchemaWithSyntheticAccept"]=sql(
   "SELECT count(*) FROM writers_studio_beta_consent_events "
   "WHERE member_id='"+MEMBER+"' AND decision='accept'"
   ).stdout.strip()=="1"
  env={k:os.environ[k] for k in ("PATH","LANG","HOME","TMPDIR")
       if k in os.environ}
  env.update({
   "DATABASE_URL":url,"NODE_ENV":"test","CI":"1",
   "R76_PENDING_CANDIDATE_FIXTURE":"fictional-only",
   "R72_MEMBER_PROPOSALS_FIXTURE":"fictional-only",
   "NEXT_PUBLIC_R72_MEMBER_PROPOSALS_FIXTURE":"fictional-only",
   "R71_AUTHOR_EDITORIAL_FIXTURE":"fictional-only",
   "WRITERS_STUDIO_BETA_MEMBER_IDS":MEMBER,
   "WRITERS_STUDIO_BETA_CONSENT_VERSION":POLICY_VERSION,
   "WRITERS_STUDIO_BETA_CONSENT_SHA256":NOTICE_HASH,
   "WRITERS_STUDIO_BETA_CONSENT_NOTICE":NOTICE,
  })
  checks["noProviderOrProductionSecretsForwarded"]=not any(
   k in env for k in ["OPENAI_API_KEY","ANTHROPIC_API_KEY",
                      "AWS_SECRET_ACCESS_KEY","RESEND_API_KEY"])
  proc=sh(["./node_modules/.bin/jest","--runInBand","--no-coverage",
   "--runTestsByPath",
   "lib/writersStudio/provenance/__tests__/heldConfidentialCandidateR76.test.ts"],
   timeout=130,check=False,env=env)
  LOG.write_text(proc.stdout+"\n"+proc.stderr)
  checks["actualPg16PrivateCandidateJest"]=(
   proc.returncode==0 and "13 passed, 13 total" in
   proc.stdout+proc.stderr)
  if not checks["actualPg16PrivateCandidateJest"]:
   raise RuntimeError("r76_private_candidate_acceptance_refused")
  checks["noInventedProseInPgErrorLogs"]=not any(s in
   LOG.read_text(errors="replace") for s in (
    "The fictional river holds a softly glowing candle.",
    "The fictional river holds a lantern.",
   ))
  checks["exactOneCiphertextNoReleasedProposal"]=(
   sql("SELECT count(*) FROM ws_r76_fixture_pending_private")
     .stdout.strip()=="1" and
   sql("SELECT count(*) FROM proposal_versions").stdout.strip()=="0")
  checks["consentLaterRevoked"]=sql(
   "SELECT decision FROM writers_studio_beta_consent_events "
   "WHERE member_id='"+MEMBER+"' ORDER BY seq DESC LIMIT 1"
   ).stdout.strip()=="revoke"
  checks["noPlaintextCandidateSchemaColumns"]=(
   sql("SELECT count(*) FROM information_schema.columns "
       "WHERE table_name='ws_r76_fixture_pending_private' "
       "AND column_name IN ('text','plaintext','body','replacement',"
       "'proposed_text','formulation')").stdout.strip()=="0")
  checks["ciphertextNotPlaintextInDb"]=sql(
   "SELECT count(*) FROM ws_r76_fixture_pending_private "
   "WHERE cipher_envelope::text LIKE '%softly glowing candle%'"
   ).stdout.strip()=="0"
  checks["originalSourceImmutable"]=sql(
   "SELECT count(*) FROM manuscript_sections "
   "WHERE body='The fictional river holds a lantern.'"
   ).stdout.strip()=="1"
 except Exception as ex:
  error=type(ex).__name__+":"+str(ex)[:140]
 finally:
  if active:
   rm=dock("rm","-f","-v",NAME,check=False,timeout=30)
   checks["disposablePG16Removed"]=rm.returncode==0
 status=("R76_ENCRYPTED_PENDING_PRIVATE_PG16_PASS_BETA_HOLD"
         if error is None and all(checks.values()) else
         "R76_ENCRYPTED_PENDING_PRIVATE_PG16_HELD")
 report={"protocol":"soullab.ws.r76.encrypted-prepublication-candidate-pg16.v1",
  "sourceCommit":sh(["git","rev-parse","HEAD"]).stdout.strip(),
  "status":status,"checks":checks,"error":error,
  "fictionalOnly":True,"realMemberDataAccessed":False,"producerNetworkCalls":0,
  "productionChanged":False,"operationalKeyProvisioned":False,
  "actualAuthorApplyActivated":False,"releaseApproved":False,
  "time":datetime.now(timezone.utc).isoformat()}
 REPORT.write_text(json.dumps(report,indent=2)+"\n")
 print(json.dumps({"status":status,"checks":sum(checks.values()),"total":len(checks),
   "error":error,"clean":checks.get("disposablePG16Removed",False)}))
 return 0 if status.endswith("PASS_BETA_HOLD") else 2
if __name__=="__main__":
 raise SystemExit(main())
