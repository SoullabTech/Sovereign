#!/usr/bin/env python3
"""R20 fictional PostgreSQL 16.13 + vault two-target witness; NOT Soullab production R20."""
import gzip, hashlib, hmac, io, json, os, pathlib, re, secrets, subprocess, sys, tarfile, tempfile

IMAGE="postgres:16.13-bookworm"
NAME=os.environ.get("R20_PG_DOCKER_CONTAINER","")
IDS={"dead_m":"fictional-manuscript-deleted","dead_w":"fictional-work-deleted",
     "good_m":"fictional-manuscript-surviving","good_w":"fictional-work-surviving",
     "dead_s":"fictional-session-deleted","good_s":"fictional-session-surviving"}

def refuse(code): raise RuntimeError(code)
def cmd(args,data=None,ok=True):
    r=subprocess.run(args,input=data,capture_output=True,timeout=70)
    if ok and r.returncode:refuse("FICTIONAL_COMMAND_REFUSED")
    return r.stdout if ok else r.returncode

def pg(db,sql,ok=True):
    a=["docker","exec","-i",NAME,"psql","-X","-q","-A","-t","-v","ON_ERROR_STOP=1","-U","postgres","-d",db]
    v=cmd(a,sql.encode(),ok)
    return v.decode().strip() if ok else v

def pg_denies(db,sql,expected_marker):
    """A failed command is accepted only if PostgreSQL emitted our own refusal."""
    if expected_marker not in {"fictional_erasure_refusal","fictional_scope_refusal"}:
        refuse("FICTIONAL_EXPECTED_POLICY_MARKER_INVALID")
    args=["docker","exec","-i",NAME,"psql","-X","-q","-A","-t","-v","ON_ERROR_STOP=1","-U","postgres","-d",db]
    r=subprocess.run(args,input=sql.encode(),capture_output=True,timeout=70)
    if r.returncode==0 or expected_marker.encode() not in r.stderr:
        refuse("FICTIONAL_POLICY_DENIAL_NOT_PROVEN")

def restore_dump(db,dump):
    cmd(["docker","exec","-i",NAME,"psql","-X","-q","-v","ON_ERROR_STOP=1","-U","postgres","-d",db],dump)
def createdb(name):cmd(["docker","exec",NAME,"createdb","-U","postgres",name])
def sqlq(v):
    if not re.fullmatch(r"[a-z0-9_-]{1,80}",v):refuse("FICTIONAL_ID_INVALID")
    return "'"+v+"'"
def packed(o):return json.dumps(o,sort_keys=True,separators=(",", ":")).encode()
def sig(o,k):return {"data":o,"mac":hmac.new(k,packed(o),hashlib.sha256).hexdigest()}
def check(envelope,k):
    if not isinstance(envelope,dict) or set(envelope)!={"data","mac"}:refuse("FICTIONAL_ENVELOPE_INVALID")
    if not hmac.compare_digest(envelope["mac"],hmac.new(k,packed(envelope["data"]),hashlib.sha256).hexdigest()):
        refuse("FICTIONAL_SIGNATURE_INVALID")
    return envelope["data"]

def check_caller_pinned_head(ledger_envelope,checkpoint_envelope,key,anchor):
    """Fixture-only comparison to an assumed fresh, caller-supplied authority pin.

    The test runner controls BOTH key and pin. This is NOT independent custody.
    A rolled-back pin supplied by an attacker defeats this model.
    """
    if (not isinstance(anchor,dict) or set(anchor)!={"generation","ledger_sha256","signer_key_sha256"}
        or type(anchor["generation"]) is not int or anchor["generation"]<1
        or not all(isinstance(anchor[k],str) and re.fullmatch(r"[0-9a-f]{64}",anchor[k])
                    for k in ("ledger_sha256","signer_key_sha256"))):
        refuse("FICTIONAL_CURRENT_ANCHOR_MISSING_OR_INVALID")
    if not isinstance(key,bytes) or hashlib.sha256(key).hexdigest()!=anchor["signer_key_sha256"]:
        refuse("FICTIONAL_CURRENT_SIGNER_MISMATCH")
    ledger=check(ledger_envelope,key)
    checkpoint=check(checkpoint_envelope,key)
    digest=hashlib.sha256(packed(ledger_envelope)).hexdigest()
    if (not isinstance(ledger,dict) or type(ledger.get("generation")) is not int
        or not isinstance(checkpoint,dict) or type(checkpoint.get("min_generation")) is not int
        or ledger["generation"]!=anchor["generation"]
        or checkpoint["min_generation"]!=anchor["generation"]
        or checkpoint.get("ledger_sha256")!=digest
        or anchor["ledger_sha256"]!=digest):
        refuse("FICTIONAL_OLD_OR_CONFLICTING_AUTHORITY")
    return ledger

def guarded_container():
    if not re.fullmatch(r"r20-pg16-fictional-[0-9a-z-]{1,44}",NAME):refuse("WRONG_TEST_CONTAINER_NAME")
    x=json.loads(cmd(["docker","inspect",NAME]))[0]
    h=x["HostConfig"]
    if (x["Config"]["Image"]!=IMAGE or h["NetworkMode"]!="none" or x["Mounts"]
        or h["PortBindings"] or not h["Tmpfs"].get("/var/lib/postgresql/data")
        or not h["Tmpfs"].get("/tmp")):refuse("FICTIONAL_CONTAINER_NOT_ISOLATED")
    if not pg("postgres","SHOW server_version;").startswith("16.13"):
        refuse("PG16_13_REQUIRED")

def archive_fixture(folder):
    archive=folder/"OLD_FICTIONAL_VAULT.tar.gz"
    fake={"writer/dead.txt":b"fictional doomed vault bytes","writer/keep.txt":b"fictional survivor bytes"}
    with tarfile.open(archive,"w:gz") as t:
        info=tarfile.TarInfo("writer/");info.type=tarfile.DIRTYPE;info.mode=0o700;t.addfile(info)
        for name,data in fake.items():
            info=tarfile.TarInfo(name);info.mode=0o600;info.size=len(data);t.addfile(info,io.BytesIO(data))
    return archive,fake

def staged_vault(archive,parent):
    vault=parent/"vault";vault.mkdir(mode=0o700)
    # Fixture-only whitelist: this is deliberately NOT a general TAR extractor.
    with tarfile.open(archive,"r:gz") as t:
        members=t.getmembers()
        if [m.name for m in members]!=["writer","writer/dead.txt","writer/keep.txt"]:
            refuse("FICTIONAL_ARCHIVE_ENTRY_SET_UNEXPECTED")
        for m in members:
            if not (m.isdir() or m.isfile()) or m.issym() or m.islnk() or m.size>1024:
                refuse("FICTIONAL_UNSAFE_TAR_MEMBER")
            if m.isdir() and m.name=="writer":(vault/"writer").mkdir(mode=0o700);continue
            fd=os.open(vault,os.O_DIRECTORY|os.O_RDONLY|os.O_NOFOLLOW)
            try:
                child=os.open("writer",os.O_DIRECTORY|os.O_RDONLY|os.O_NOFOLLOW,dir_fd=fd)
                try:
                    out=os.open(m.name.split("/")[-1],os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=child)
                    try:
                        with os.fdopen(out,"wb",closefd=False) as dest:dest.write(t.extractfile(m).read())
                    finally:os.close(out)
                finally:os.close(child)
            finally:os.close(fd)
    return vault

def main():
    if sys.argv[1:]!=["--fictional-only"]:refuse("FICTIONAL_ONLY_ACK_REQUIRED")
    guarded_container()
    with tempfile.TemporaryDirectory(prefix="r20-pg16-fictional-ci-") as td:
        p=pathlib.Path(td);old=p/"old_snapshot";old.mkdir(mode=0o700)
        authority=p/"newer_authority";authority.mkdir(mode=0o700)
        archive,fake=archive_fixture(old)
        createdb("r20fictsource")
        source="r20fictsource"
        pg(source,"""CREATE TABLE member_manuscripts(id text primary key, text_content text);
CREATE TABLE living_works(id text primary key, manuscript_id text);
CREATE TABLE synthetic_fragments(id text primary key, session_id text);
CREATE TABLE provenance_tombstones(object_kind text,object_id text, primary key(object_kind,object_id));
CREATE TABLE deletion_scopes(session_id text primary key);""")
        pg(source,"INSERT INTO member_manuscripts VALUES ('%s','FICTITIOUS'),('%s','FICTITIOUS');"%(IDS["dead_m"],IDS["good_m"]))
        pg(source,"INSERT INTO living_works VALUES ('%s','%s'),('%s','%s');"%(IDS["dead_w"],IDS["dead_m"],IDS["good_w"],IDS["good_m"]))
        pg(source,"INSERT INTO synthetic_fragments VALUES ('fragment-dead','%s'),('fragment-good','%s');"%(IDS["dead_s"],IDS["good_s"]))
        dump=cmd(["docker","exec",NAME,"pg_dump","-Fp","-U","postgres","-d",source])
        if b"PostgreSQL database dump" not in dump[:1000]:refuse("FICTIONAL_PGDUMP_INVALID")
        # The fictional deletion happens AFTER the snapshot.
        pg(source,"DELETE FROM member_manuscripts WHERE id=%s;"%sqlq(IDS["dead_m"]))
        pg(source,"DELETE FROM living_works WHERE id=%s;"%sqlq(IDS["dead_w"]))
        pg(source,"DELETE FROM synthetic_fragments WHERE session_id=%s;"%sqlq(IDS["dead_s"]))
        # The independent ledger is sealed only after the older SQL dump.
        key=secrets.token_bytes(32)
        ledger=dict(generation=2,deleted=[IDS["dead_m"],IDS["dead_w"]],session=IDS["dead_s"],vault=["writer/dead.txt"])
        newer=authority/"ledger.json";newer.write_bytes(packed(sig(ledger,key)))
        high=authority/"highwater.json";high.write_bytes(packed(sig({"min_generation":2,"ledger_sha256":hashlib.sha256(newer.read_bytes()).hexdigest()},key)))
        if old in newer.parents or old in high.parents or newer.is_symlink() or high.is_symlink() or newer.stat().st_nlink!=1 or high.stat().st_nlink!=1:
            refuse("AUTHORITY_NOT_INDEPENDENT")
        signed=check(json.loads(newer.read_text()),key)
        seal=check(json.loads(high.read_text()),key)
        if (set(signed)!={"generation","deleted","session","vault"} or
            signed["generation"]!=2 or signed["deleted"]!=[IDS["dead_m"],IDS["dead_w"]] or
            signed["session"]!=IDS["dead_s"] or signed["vault"]!=["writer/dead.txt"]):
            refuse("FICTIONAL_LEDGER_SCOPE_NOT_AUTHORIZED")
        if signed["generation"]<seal["min_generation"] or seal["ledger_sha256"]!=hashlib.sha256(newer.read_bytes()).hexdigest():
            refuse("FICTIONAL_LEDGER_ROLLBACK")
        tampered=json.loads(newer.read_text());tampered["data"]["generation"]=0
        try:check(tampered,key)
        except RuntimeError:pass
        else:refuse("TAMPERED_LEDGER_ACCEPTED")
        changed_high=json.loads(high.read_text());changed_high["data"]["min_generation"]=3
        try:check(changed_high,key)
        except RuntimeError:pass
        else:refuse("TAMPERED_HIGHWATER_ACCEPTED")
        # All following work still runs under ONE CI account; the purported
        # external anchor is a caller-supplied logical contract, not a real AEA.
        newest_envelope=json.loads(newer.read_text())
        checkpoint_envelope=json.loads(high.read_text())
        pinned=dict(generation=2,
                    ledger_sha256=hashlib.sha256(newer.read_bytes()).hexdigest(),
                    signer_key_sha256=hashlib.sha256(key).hexdigest())

        # Recreating an OLD signer + signed head + old ledger can pass local HMAC.
        # This is an intentional unsafe witness if the caller also rolls back pin.
        old_key=secrets.token_bytes(32)
        older_envelope=sig(dict(generation=1,deleted=[],session="",vault=[]),old_key)
        old_checksum=hashlib.sha256(packed(older_envelope)).hexdigest()
        older_checkpoint=sig(dict(min_generation=1,ledger_sha256=old_checksum),old_key)
        rolled_back_pin=dict(generation=1,ledger_sha256=old_checksum,
                             signer_key_sha256=hashlib.sha256(old_key).hexdigest())
        if check_caller_pinned_head(older_envelope,older_checkpoint,old_key,rolled_back_pin)["generation"]!=1:
            refuse("FICTIONAL_OLD_SIGNER_ROLLBACK_WITNESS_MISSING")
        for attempted in (
            (older_envelope,older_checkpoint,old_key,pinned),
            (newest_envelope,checkpoint_envelope,key,None),
            (newest_envelope,checkpoint_envelope,key,rolled_back_pin),
        ):
            try:check_caller_pinned_head(*attempted)
            except RuntimeError:pass
            else:refuse("FICTIONAL_ANCHOR_ROLLBACK_OR_OUTAGE_ADMITTED")

        # Refusals above occur BEFORE either replacement database exists.
        nonexistent=pg("postgres","SELECT count(*) FROM pg_database WHERE datname IN ('r20ficttarget1','r20ficttarget2');")
        if nonexistent!="0":refuse("FICTIONAL_TARGET_CREATED_BEFORE_AUTHORITY")
        if check_caller_pinned_head(newest_envelope,checkpoint_envelope,key,pinned)!=signed:
            refuse("FICTIONAL_CURRENT_AUTHORITY_DISAGREES")

        for i in (1,2):
            db="r20ficttarget"+str(i)
            createdb(db)
            empty=pg(db,"SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','S');")
            if empty!="0":refuse("REPLACEMENT_TARGET_NOT_EMPTY")
            restore_dump(db,dump)
            before_erasure=pg(db,"SELECT (SELECT count(*) FROM member_manuscripts)||','||(SELECT count(*) FROM living_works)||','||(SELECT count(*) FROM synthetic_fragments);")
            if before_erasure!="2,2,2":refuse("OLD_FICTIONAL_PGDUMP_REPLAY_INCOMPLETE")
            pg(db,"""BEGIN;
INSERT INTO provenance_tombstones VALUES ('member_manuscripts',%s),('living_works',%s);
INSERT INTO deletion_scopes VALUES (%s);
DELETE FROM member_manuscripts WHERE id=%s;
DELETE FROM living_works WHERE id=%s;
DELETE FROM synthetic_fragments WHERE session_id=%s;
CREATE FUNCTION fictional_r20_object_guard() RETURNS trigger LANGUAGE plpgsql AS $g$
BEGIN
 IF EXISTS (SELECT 1 FROM provenance_tombstones WHERE object_kind=TG_TABLE_NAME AND object_id=NEW.id) THEN
   RAISE EXCEPTION 'fictional_erasure_refusal' USING ERRCODE='23514'; END IF;
 IF TG_TABLE_NAME='living_works' THEN
   IF EXISTS (SELECT 1 FROM provenance_tombstones WHERE object_kind='member_manuscripts' AND object_id=NEW.manuscript_id) THEN
     RAISE EXCEPTION 'fictional_erasure_refusal' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $g$;
CREATE FUNCTION fictional_r20_session_guard() RETURNS trigger LANGUAGE plpgsql AS $g$
BEGIN
 IF EXISTS(SELECT 1 FROM deletion_scopes WHERE session_id=NEW.session_id) THEN
   RAISE EXCEPTION 'fictional_scope_refusal' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $g$;
CREATE TRIGGER deny_manuscripts BEFORE INSERT OR UPDATE ON member_manuscripts FOR EACH ROW EXECUTE FUNCTION fictional_r20_object_guard();
CREATE TRIGGER deny_works BEFORE INSERT OR UPDATE ON living_works FOR EACH ROW EXECUTE FUNCTION fictional_r20_object_guard();
CREATE TRIGGER deny_fragments BEFORE INSERT OR UPDATE ON synthetic_fragments FOR EACH ROW EXECUTE FUNCTION fictional_r20_session_guard();
COMMIT;"""%(sqlq(signed["deleted"][0]),sqlq(signed["deleted"][1]),sqlq(signed["session"]),sqlq(signed["deleted"][0]),sqlq(signed["deleted"][1]),sqlq(signed["session"])))
            counts=pg(db,"SELECT (SELECT count(*) FROM member_manuscripts)||','||(SELECT count(*) FROM living_works)||','||(SELECT count(*) FROM synthetic_fragments)||','||(SELECT count(*) FROM provenance_tombstones)||','||(SELECT count(*) FROM deletion_scopes);")
            if counts!="1,1,1,2,1":refuse("FICTIONAL_ERASURE_COUNTS_INVALID")
            # All rejection receipts must match this witness's own PostgreSQL guard.
            pg_denies(db,"INSERT INTO member_manuscripts VALUES (%s,'FICTITIOUS');"%sqlq(signed["deleted"][0]),"fictional_erasure_refusal")
            pg_denies(db,"INSERT INTO living_works VALUES (%s,%s);"%(sqlq(signed["deleted"][1]),sqlq(signed["deleted"][0])),"fictional_erasure_refusal")
            pg_denies(db,"INSERT INTO synthetic_fragments VALUES ('reused',%s);"%sqlq(signed["session"]),"fictional_scope_refusal")
            pg_denies(db,"UPDATE member_manuscripts SET id=%s WHERE id=%s;"%(sqlq(signed["deleted"][0]),sqlq(IDS["good_m"])),"fictional_erasure_refusal")
            pg_denies(db,"UPDATE living_works SET id=%s WHERE id=%s;"%(sqlq(signed["deleted"][1]),sqlq(IDS["good_w"])),"fictional_erasure_refusal")
            pg_denies(db,"UPDATE synthetic_fragments SET session_id=%s WHERE id='fragment-good';"%sqlq(signed["session"]),"fictional_scope_refusal")
            pg_denies(db,"INSERT INTO living_works VALUES ('fictional-new-work',%s);"%sqlq(signed["deleted"][0]),"fictional_erasure_refusal")
            pg_denies(db,"UPDATE living_works SET manuscript_id=%s WHERE id=%s;"%(sqlq(signed["deleted"][0]),sqlq(IDS["good_w"])),"fictional_erasure_refusal")
            survivors=pg(db,"SELECT (SELECT text_content FROM member_manuscripts WHERE id=%s)||','||(SELECT manuscript_id FROM living_works WHERE id=%s)||','||(SELECT session_id FROM synthetic_fragments WHERE id='fragment-good');"%(sqlq(IDS["good_m"]),sqlq(IDS["good_w"])))
            if survivors!="FICTITIOUS,"+IDS["good_m"]+","+IDS["good_s"]:
                refuse("FICTIONAL_SURVIVOR_IDENTITY_OR_REFERENCE_CHANGED")
            after_denials=pg(db,"SELECT (SELECT count(*) FROM member_manuscripts)||','||(SELECT count(*) FROM living_works)||','||(SELECT count(*) FROM synthetic_fragments)||','||(SELECT count(*) FROM provenance_tombstones)||','||(SELECT count(*) FROM deletion_scopes);")
            if after_denials!="1,1,1,2,1":refuse("FICTIONAL_DENIAL_POSTCONDITIONS_FAILED")
            # UNSAFE PHYSICAL COUNTEREXAMPLE: PostgreSQL superuser can disable
            # table triggers for the transaction. This proves the trigger layer
            # alone cannot fence a restored legacy image/DB-root.
            superuser_bypass=pg(db,"BEGIN; SET LOCAL session_replication_role=replica; "
                                   "INSERT INTO member_manuscripts VALUES (%s,'FICTIONAL-PRIVILEGED-RESTORE'); "
                                   "SELECT count(*) FROM member_manuscripts WHERE id=%s; "
                                   "ROLLBACK;"%(sqlq(signed["deleted"][0]),sqlq(signed["deleted"][0])))
            if superuser_bypass!="1":refuse("FICTIONAL_SUPERUSER_BYPASS_WITNESS_NOT_SEEN")
            # The bypass was rolled back: the fictional restoration result
            # still contains ONLY the unaffected Work and deletion markers.
            if pg(db,"SELECT count(*) FROM member_manuscripts WHERE id=%s;"%sqlq(signed["deleted"][0]))!="0":
                refuse("FICTIONAL_SUPERUSER_ROLLBACK_LEFT_DELETED_ROW")
            after_bypass=pg(db,"SELECT (SELECT count(*) FROM member_manuscripts)||','||(SELECT count(*) FROM living_works)||','||(SELECT count(*) FROM synthetic_fragments)||','||(SELECT count(*) FROM provenance_tombstones)||','||(SELECT count(*) FROM deletion_scopes);")
            if after_bypass!="1,1,1,2,1":refuse("FICTIONAL_SUPERUSER_ROLLBACK_CHANGED_SURVIVORS")
            target=p/("replacement"+str(i));target.mkdir(mode=0o700)
            vault=staged_vault(archive,target)
            # Deletion target comes from the independently authenticated ledger.
            for rel in signed["vault"]:
                parentfd=os.open(vault,os.O_DIRECTORY|os.O_RDONLY|os.O_NOFOLLOW)
                try:
                    child=os.open("writer",os.O_DIRECTORY|os.O_RDONLY|os.O_NOFOLLOW,dir_fd=parentfd)
                    try:os.unlink(rel.split("/")[-1],dir_fd=child)
                    finally:os.close(child)
                finally:os.close(parentfd)
            if (vault/"writer/dead.txt").exists() or (vault/"writer/keep.txt").read_bytes()!=fake["writer/keep.txt"]:
                refuse("FICTIONAL_VAULT_POSTCONDITION_FAILED")
        # UNSAFE HISTORICAL-COPY COUNTEREXAMPLE: removing the doomed
        # bytes from both staged vaults does not remove original archived
        # bytes; the pre-deletion SQL dump also still contains deleted Works.
        if IDS["dead_m"].encode() not in dump or IDS["dead_w"].encode() not in dump:
            refuse("FICTIONAL_HISTORIC_SQL_NO_LONGER_RECONSTRUCTIVE")
        with tarfile.open(archive,"r:gz") as historical:
            old_member=historical.extractfile("writer/dead.txt")
            if old_member is None or old_member.read()!=fake["writer/dead.txt"]:
                refuse("FICTIONAL_HISTORIC_VAULT_NO_LONGER_RECONSTRUCTIVE")
        print(json.dumps({"result":"PASS","engine":"PostgreSQL 16.13","isolated":True,
           "replacement_databases":2,"erased_records_refused":True,"doomed_vault_entries_absent":True,"revoked_identity_updates_refused":True,
           "revoked_manuscript_references_refused":True,
           "bystanders_preserved":True,
           "historical_sql_and_vault_archives_reconstructive":True,
           "privileged_postgres_trigger_bypass_observed":True,
           "independent_egress_fence_proven":False,
           "caller_pinned_fictional_head_checked":True,
           "old_bundle_with_rolled_back_anchor_accepted":True,"real_independent_authority_proven":False,
           "actual_soullab_r20_recovery":False,"release_authorized":False},sort_keys=True))

if __name__=="__main__":
    try:main()
    except Exception as e:
        print(json.dumps({"result":"REFUSED","reason":type(e).__name__,"release_authorized":False}),file=sys.stderr)
        sys.exit(1)
