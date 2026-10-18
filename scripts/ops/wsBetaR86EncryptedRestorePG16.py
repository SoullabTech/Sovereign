#!/usr/bin/env python3
"""
R86 test-only genuine Postgres16 pg_dump --> GPG public key encryption -->
independent ephemeral private-keyring --> brand-new PG16 pg_restore.
No production containers/DB/NAS/timers/accounts/backup directories touched.
No plaintext backup on disk; only fictional SQL written to an ephemeral
Postgres tmpfs and streamed through pipes, encrypted archive on founder T7.
"""
import hashlib
import json
import os
import pathlib
import re
import secrets
import shutil
import subprocess
import tempfile
import time
from datetime import datetime, timezone

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=pathlib.Path(os.environ.get("WS_R86_EVIDENCE_DIR",""))
SOURCE_SCRIPT=ROOT/"scripts/ops/wsBetaR86FixtureEncryptedPgDump.sh"
TAG=secrets.token_hex(4)
SRC="ws-r86-src-"+TAG
DST="ws-r86-rest-"+TAG
FIXTURE_MARKER="R86_FICTIONAL_WRITER_SOURCE_"+secrets.token_hex(5)
BASEDIR=None
created=[]
metrics={}
checks={}
def require(condition,label):
 checks[label]=bool(condition)
 if not condition:raise RuntimeError("R86_REFUSED_"+label)
def subprocess_run(args,timeout=45,check=True,input_bytes=None,env=None):
 p=subprocess.run(args,cwd=ROOT,capture_output=True,input=input_bytes,
    timeout=timeout,check=False,env=env)
 if check and p.returncode:
  raise RuntimeError("R86_COMMAND_"+pathlib.Path(args[0]).name+"_EXIT_"+str(p.returncode)+
                     "_"+p.stderr.decode(errors="replace")[:130])
 return p
def go():
 global BASEDIR
 require(os.environ.get("WS_R86_TEST_MODE")=="fictional-only","explicit_fictional_mode")
 require(str(OUT).startswith("/Volumes/T7 Shield/ws-beta-r86-"),
         "test_only_evidence_path")
 require(not OUT.exists(),"exclusive_new_evidence_dir")
 require(shutil.which("gpg") is not None and shutil.which("docker") is not None,
         "crypto_and_docker_present")
 require(SOURCE_SCRIPT.exists(),"accepted_source_script_exists")
 OUT.mkdir(mode=0o700,parents=True)
 archive_dir=OUT/"encrypted-archives"
 archive_dir.mkdir(mode=0o700)
 BASEDIR=pathlib.Path(tempfile.mkdtemp(prefix="ws-r86-fict-independent-key-"))
 restore_home=BASEDIR/"independent_restore"
 writer_home=BASEDIR/"public_writer"
 restore_home.mkdir(mode=0o700)
 writer_home.mkdir(mode=0o700)
 # False admission must fail before any key or container access.
 initial=subprocess_run(["/bin/bash",str(SOURCE_SCRIPT)],check=False,timeout=8)
 require(initial.returncode!=0 and b"DEFAULT_OFF" in initial.stderr,
         "fixture_writer_default_off")
 # Ephemeral RSA encryption identity: private key NEVER imported into writer
 # homedir and is deleted after the independent restore test.
 uid="R86 Fictional Independent Backup Restore <r86-fixture.invalid>"
 key=subprocess_run(["gpg","--batch","--homedir",str(restore_home),
  "--pinentry-mode","loopback","--passphrase","",
  "--quick-generate-key",uid,"rsa2048","encr","0"],timeout=50)
 listing=subprocess_run(["gpg","--batch","--homedir",str(restore_home),
  "--with-colons","--list-keys",uid],timeout=10)
 # GPG colon format places the fingerprint at field 10 (index 9).
 # Do not guess how many empty fields precede it.
 fps=[parts[9] for line in listing.stdout.decode().splitlines()
      if (parts:=line.split(":"))[0]=="fpr" and len(parts)>9
      and re.fullmatch(r"[A-F0-9]{40}",parts[9])]
 require(len(fps)==1,"one_independent_public_fingerprint")
 fpr=fps[0]
 pub=subprocess_run(["gpg","--batch","--homedir",str(restore_home),
   "--export",fpr],timeout=15).stdout
 require(len(pub)>200,"public_key_material_not_empty")
 imported=subprocess_run(["gpg","--batch","--homedir",str(writer_home),
  "--import"],input_bytes=pub,timeout=15)
 # This checks actual absence of any decrypt-capable PRIVATE key in writer.
 writer_secret=subprocess_run(["gpg","--batch","--homedir",str(writer_home),
  "--with-colons","--list-secret-keys"],timeout=10)
 require(b"sec:" not in writer_secret.stdout,
         "backup_writer_has_only_public_key")
 # Nonmatching fingerprint must refuse (before filesystem archive).
 bad_env=dict(os.environ,WS_R86_MODE="fictional-only",
  WS_R86_CONTAINER=SRC,WS_R86_BACKUP_DIR=str(archive_dir),
  WS_R86_RECIPIENT_FINGERPRINT="0"*40,GNUPGHOME=str(writer_home))
 denied=subprocess_run(["/bin/bash",str(SOURCE_SCRIPT)],
   timeout=10,check=False,env=bad_env)
 require(denied.returncode!=0 and not list(archive_dir.iterdir()),
         "fake_key_refused_without_archive")

 def start_container(name):
  args=["docker","run","--pull","never","--detach","--rm",
   "--name",name,"--network","none",
   "--memory","512m","--cpus","1","--pids-limit","128",
   "--security-opt","no-new-privileges",
   "--tmpfs","/var/lib/postgresql/data:rw,nosuid,size=256m",
   "-e","POSTGRES_USER=fict","-e","POSTGRES_DB=ws_fixture",
   "-e","POSTGRES_HOST_AUTH_METHOD=trust",
   "postgres:16.13"]
  subprocess_run(args,timeout=50)
  created.append(name)
  for _ in range(40):
   up=subprocess_run(["docker","exec",name,"pg_isready","-U","fict","-d",
        "ws_fixture"],timeout=5,check=False)
   if up.returncode==0:break
   time.sleep(.4)
  else:raise RuntimeError("R86_POSTGRES16_NOT_READY")
  inspect=subprocess_run(["docker","inspect","--format",
    "{{.HostConfig.NetworkMode}}|{{len .Mounts}}",name],timeout=8)
  require(inspect.stdout.strip()==b"none|0",
          "no_container_network_or_host_file_mounts")
 start_container(SRC)
 # One source DB holds fictional data ONLY; WAL and storage are ephemeral
 # within a Docker tmpfs, no real member or backup data accessed.
 sql=("CREATE TABLE writer_fixture (id integer PRIMARY KEY, body text NOT NULL);"
      "INSERT INTO writer_fixture VALUES "
      "(1,'"+FIXTURE_MARKER+"'),(2,'R86_FICTIONAL_SECOND_ROW');")
 seeded=subprocess_run(["docker","exec",SRC,"psql","-v","ON_ERROR_STOP=1",
   "-U","fict","-d","ws_fixture","-c",sql],timeout=25)
 assert b"INSERT 0 2" in seeded.stdout
 metrics["seeded_rows"]=2
 run_env=dict(os.environ,WS_R86_MODE="fictional-only",WS_R86_CONTAINER=SRC,
   WS_R86_BACKUP_DIR=str(archive_dir),
   WS_R86_RECIPIENT_FINGERPRINT=fpr,GNUPGHOME=str(writer_home))
 archived=subprocess_run(["/bin/bash",str(SOURCE_SCRIPT)],
   timeout=90,env=run_env)
 require(b"R86_FICTIONAL_ENCRYPTED_BACKUP_PUBLISHED" in archived.stdout,
         "encrypted_stream_published")
 files=list(archive_dir.iterdir())
 require(len(files)==1 and files[0].name.endswith(".pgdump.gpg"),
         "one_complete_ciphertext_no_sql_or_pending")
 archive=files[0];encrypted=archive.read_bytes()
 # A compressed custom-format dump with only two fake rows may be ~1 KiB.
 # Validate through independent decryption/restore, not a fabricated minimum.
 require(len(encrypted)>500,"nonempty_encrypted_fixture_archive")
 require(not encrypted.startswith(b"PGDMP") and not
   encrypted.startswith(b"\x1f\x8b") and
   FIXTURE_MARKER.encode() not in encrypted,
   "no_plain_or_gzip_database_bytes_on_disk")
 metrics["encrypted_archive_bytes"]=len(encrypted)
 metrics["encrypted_ciphertext_sha256"]=hashlib.sha256(encrypted).hexdigest()
 require(metrics["encrypted_ciphertext_sha256"].encode() in archived.stdout,
         "archive_integrity_digest_in_receipt")
 # Prove decryption by the backup writer is impossible despite writer
 # owning the archive and the public key.
 denied_decrypt=subprocess_run(["gpg","--batch","--homedir",
    str(writer_home),"--decrypt",str(archive)],
    check=False,timeout=12)
 require(denied_decrypt.returncode!=0 and denied_decrypt.stdout==b"",
         "public_backup_writer_cannot_decrypt")
 # Remove the SOURCE container BEFORE independent cold restore.
 subprocess_run(["docker","rm","-f","-v",SRC],timeout=20)
 created.remove(SRC)
 require(subprocess_run(["docker","ps","-aq","--filter",
    "name=^/"+SRC+"$"],timeout=8).stdout.strip()==b"",
    "source_database_destroyed_before_restore")
 start_container(DST)
 # No SQL plaintext temp file: gpg decrypt stdout streams directly into
 # postgres custom-format pg_restore stdin in the independent container.
 dec=subprocess.Popen(["gpg","--batch","--no-tty","--homedir",
    str(restore_home),"--decrypt",str(archive)],
    stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 restored=subprocess.Popen(["docker","exec","-i",DST,"pg_restore",
    "--exit-on-error","-U","fict","-d","ws_fixture"],
    stdin=dec.stdout,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 assert dec.stdout is not None
 dec.stdout.close()
 _,restore_err=restored.communicate(timeout=55)
 decrypted=dec.wait(timeout=15)
 require(decrypted==0 and restored.returncode==0,
    "independent_restore_without_plaintext_tempfile")
 validated=subprocess_run(["docker","exec",DST,"psql",
    "-At","-U","fict","-d","ws_fixture","-c",
    "SELECT count(*) = 2 AND "
    "count(*) FILTER (WHERE body LIKE 'R86_FICTIONAL_%') = 2 "
    "FROM writer_fixture;"],timeout=18)
 require(validated.stdout.strip()==b"t","independent_restored_fictional_rows_verified")
 require(not any(f.name.endswith((".sql",".sql.gz",".dump",".partial"))
    for f in archive_dir.iterdir()),"no_plaintext_database_archive_created")
 metrics["restore_rows"]=2
 metrics["independent_key_location"]="ephemeral separate GPG home"
 metrics["production_backups_accessed"]=0
 metrics["real_members_accessed"]=0
 return True

def main():
 status="R86_FICTIONAL_ENCRYPTED_PGDUMP_COLD_RESTORE_HELD"
 error=None
 try:go();status="R86_FICTIONAL_GPG_ENCRYPTED_PGDUMP_COLD_RESTORE_PASS_BETA_HOLD"
 except Exception as e:
  error=type(e).__name__+":"+str(e)[:260]
 finally:
  for container in list(created):
   subprocess_run(["docker","rm","-f","-v",container],
      timeout=25,check=False)
  if BASEDIR is not None and BASEDIR.exists():
   shutil.rmtree(BASEDIR,ignore_errors=True)
  checks["ephemeral_private_key_deleted"]=BASEDIR is not None and not BASEDIR.exists()
  checks["no_test_containers_left"]=all(
    subprocess_run(["docker","ps","-aq","--filter","name=^/"+name+"$"],
      timeout=7,check=False).stdout.strip()==b""
    for name in [SRC,DST])
  if status.endswith("PASS_BETA_HOLD") and not all(checks.values()):
   status="R86_FICTIONAL_RESTORE_CLEANUP_FAILED_BETA_HOLD"
  report={
   "protocol":"soullab.ws.beta.r86.encrypted-postgres-real-pg16-fixture.v1",
   "date":datetime.now(timezone.utc).isoformat(),
   "status":status,
   "sourceHead":subprocess_run(["git","rev-parse","HEAD"]).stdout.decode().strip(),
   "checks":checks,"metrics":metrics,"error":error,
   "dataScope":"FICTIONAL_POSTGRES16_ONLY",
   "encryptedProductionBackupProven":False,
   "realNASOrDatabaseTouched":False,
   "realMembersOrKeysRead":False,
   "productionRestoreApproved":False,
   "offsiteKeyCustodyCertified":False,
   "fullDBWalAndVaultConsistencyProven":False,
   "productionBetaReleased":False,
   "createdKeyringsDestroyed":checks["ephemeral_private_key_deleted"],
   "testContainersDisposed":checks["no_test_containers_left"]
  }
  if OUT.is_dir():
   receipt=OUT/"R86_FICTIONAL_STREAMING_ENCRYPTED_COLD_RESTORE.json"
   with receipt.open("x") as f:json.dump(report,f,indent=2);f.write("\n")
   os.chmod(receipt,0o600)
  print(json.dumps({"status":status,"checksPassed":sum(bool(x) for x in checks.values()),
    "checksTotal":len(checks),"metrics":metrics,
    "error":error,"evidence":str(OUT)}))
  return 0 if status.endswith("PASS_BETA_HOLD") else 2

if __name__=="__main__":
 raise SystemExit(main())
