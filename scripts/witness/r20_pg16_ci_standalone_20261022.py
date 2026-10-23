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
 RETURN NEW;
END $g$;
CREATE FUNCTION fictional_r20_session_guard() RETURNS trigger LANGUAGE plpgsql AS $g$
BEGIN
 IF EXISTS(SELECT 1 FROM deletion_scopes WHERE session_id=NEW.session_id) THEN
   RAISE EXCEPTION 'fictional_scope_refusal' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $g$;
CREATE TRIGGER deny_manuscripts BEFORE INSERT ON member_manuscripts FOR EACH ROW EXECUTE FUNCTION fictional_r20_object_guard();
CREATE TRIGGER deny_works BEFORE INSERT ON living_works FOR EACH ROW EXECUTE FUNCTION fictional_r20_object_guard();
CREATE TRIGGER deny_fragments BEFORE INSERT ON synthetic_fragments FOR EACH ROW EXECUTE FUNCTION fictional_r20_session_guard();
COMMIT;"""%(sqlq(signed["deleted"][0]),sqlq(signed["deleted"][1]),sqlq(signed["session"]),sqlq(signed["deleted"][0]),sqlq(signed["deleted"][1]),sqlq(signed["session"])))
            counts=pg(db,"SELECT (SELECT count(*) FROM member_manuscripts)||','||(SELECT count(*) FROM living_works)||','||(SELECT count(*) FROM synthetic_fragments)||','||(SELECT count(*) FROM provenance_tombstones)||','||(SELECT count(*) FROM deletion_scopes);")
            if counts!="1,1,1,2,1":refuse("FICTIONAL_ERASURE_COUNTS_INVALID")
            if pg(db,"INSERT INTO member_manuscripts VALUES (%s,'FICTITIOUS');"%sqlq(signed["deleted"][0]),ok=False)==0:
                refuse("DELETED_UUID_REUSED")
            if pg(db,"INSERT INTO living_works VALUES (%s,%s);"%(sqlq(signed["deleted"][1]),sqlq(signed["deleted"][0])),ok=False)==0:
                refuse("DELETED_WORK_ID_REUSED")
            if pg(db,"INSERT INTO synthetic_fragments VALUES ('reused',%s);"%sqlq(signed["session"]),ok=False)==0:
                refuse("DELETED_SESSION_REUSED")
            # Negative PostgreSQL controls: this fixture must reject all attempts to
            # reassign surviving identities/references into the independently revoked set.
            # The first test intentionally fails against the older INSERT-only triggers.
            if pg(db,"UPDATE member_manuscripts SET id=%s WHERE id=%s;"%(sqlq(signed["deleted"][0]),sqlq(IDS["good_m"])),ok=False)==0:
                refuse("REVOKED_MANUSCRIPT_UPDATE_ADMITTED")
            if pg(db,"UPDATE living_works SET id=%s WHERE id=%s;"%(sqlq(signed["deleted"][1]),sqlq(IDS["good_w"])),ok=False)==0:
                refuse("REVOKED_WORK_UPDATE_ADMITTED")
            if pg(db,"UPDATE synthetic_fragments SET session_id=%s WHERE id='fragment-good';"%sqlq(signed["session"]),ok=False)==0:
                refuse("REVOKED_SESSION_UPDATE_ADMITTED")
            if pg(db,"INSERT INTO living_works VALUES ('fictional-new-work',%s);"%sqlq(signed["deleted"][0]),ok=False)==0:
                refuse("REVOKED_MANUSCRIPT_REFERENCE_INSERT_ADMITTED")
            if pg(db,"UPDATE living_works SET manuscript_id=%s WHERE id=%s;"%(sqlq(signed["deleted"][0]),sqlq(IDS["good_w"])),ok=False)==0:
                refuse("REVOKED_MANUSCRIPT_REFERENCE_UPDATE_ADMITTED")
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
        print(json.dumps({"result":"PASS","engine":"PostgreSQL 16.13","isolated":True,
           "replacement_databases":2,"erased_records_refused":True,"vault_erasures_refused":True,
           "bystanders_preserved":True,"independent_fictional_highwater":True,
           "actual_soullab_r20_recovery":False,"release_authorized":False},sort_keys=True))

if __name__=="__main__":
    try:main()
    except Exception as e:
        print(json.dumps({"result":"REFUSED","reason":type(e).__name__,"release_authorized":False}),file=sys.stderr)
        sys.exit(1)
