#!/usr/bin/env python3
"""R20-R6: read-only, content-minimal manuscript Source/backup custody census.

Run locally with --self-test. To inspect the authorized production host, stream
the source through an already authenticated, host-key-pinned SSH connection:
    ssh ... soullab@<verified-host> python3 - --live-readonly < this_script.py

Never print manuscript content, file names, member IDs, exact artifact refs,
original names, hashes of member bytes, SQL rows, or credential values.
Does not create files or modify Docker, database, keys, NAS, cron, or content.
"""
import collections
import datetime as dt
import hashlib
import json
import os
import pathlib
import posixpath
import re
import socket
import stat
import subprocess
import sys

EXPECTED_HOST = "soullab"
VAULT = "maia-sovereign_vault_data"
SOURCE_NS = "/app/data/vault/manuscript-sources"
LOCAL_SQL = "/home/soullab/MAIA-SOVEREIGN/database/backups"
NAS_SQL = "/mnt/ds225/maia-backups/postgres"
SCAN_COLUMNS = {"artifact_ref", "vault_path", "storage_path", "storage_key", "file_ref", "file_path", "object_ref"}
IDENTIFIER = re.compile(r"^[a-z_][a-z0-9_]*$")
NO_MEMBER_OUTPUT = "NO_FILE_NAMES_NO_MEMBER_IDS_NO_TEXT_NO_MEMBER_HASHES"
DATE = dt.timezone.utc

def fail(message):
    raise RuntimeError("R20_R6_REFUSED:" + message)

def call(args, timeout=12):
    p = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                       timeout=timeout, check=False)
    if p.returncode != 0:
        fail("read_only_subprocess_failed:" + str(args[0]) + ":" + str(p.returncode))
    return p.stdout

def docker(*args, timeout=12):
    return call(["docker", *args], timeout=timeout)

def psql(sql):
    if not sql.strip().upper().startswith("SELECT "):
        fail("non_select_sql")
    # A new connection, forced read-only and time-bounded. Never ask for
    # passwords; the database container supplies its own configured user/db.
    pgopts="-c default_transaction_read_only=on -c statement_timeout=4000"
    return docker("exec", "-e", "PGOPTIONS=" + pgopts, "maia-postgres",
                  "sh", "-c",
                  'exec psql -X -qAt -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$1"',
                  "sh", sql, timeout=12).decode("utf-8", "strict")

def hex_values(sql):
    values = set()
    for line in psql(sql).splitlines():
        if not line:
            continue
        if not re.fullmatch("[0-9a-f]+", line) or len(line)%2:
            fail("invalid_hex_value")
        values.add(bytes.fromhex(line).decode("utf-8", "surrogateescape"))
    return values

def in_source_namespace(ref):
    if not isinstance(ref,str) or "\x00" in ref or "\\" in ref:
        return None
    # Both historically used vault-relative and absolute app-mount formats.
    if ref.startswith("/app/data/vault/"):
        ref=ref[len("/app/data/vault/"):]
    if not ref.startswith("manuscript-sources/"):
        return None
    tail=ref[len("manuscript-sources/"):]
    if not tail or "/" in tail or tail in (".","..") or posixpath.normpath(tail)!=tail:
        return None
    return tail

def stat_backup_dir(name, directory):
    p=pathlib.Path(directory)
    if not p.is_dir() or p.is_symlink():
        return {"name":name,"standing":"NOT_OBSERVED","archive_count":None}
    count=bytes_total=0
    dates=[]
    perms=collections.Counter()
    skipped=0
    for item in p.iterdir():
        try:
            st=item.lstat()
        except OSError:
            skipped+=1
            continue
        if not item.name.endswith(".sql.gz"):
            continue
        if not stat.S_ISREG(st.st_mode):
            skipped+=1
            continue
        count+=1
        bytes_total+=st.st_size
        dates.append(st.st_mtime)
        perms[format(stat.S_IMODE(st.st_mode),"04o")]+=1
    return {
        "name":name,"standing":"PARTIAL" if skipped else "METADATA_ONLY",
        "archive_count":count,"archive_bytes":bytes_total,
        "oldest_utc_date":dt.datetime.fromtimestamp(min(dates),DATE).date().isoformat() if dates else None,
        "newest_utc_date":dt.datetime.fromtimestamp(max(dates),DATE).date().isoformat() if dates else None,
        "mode_counts":dict(sorted(perms.items())),"inaccessible_entries":skipped,
        "archive_integrity_proved":False,"deletion_compatible":False
    }

def census_recycle_tree():
    """Metadata-only, bounded walk of the visible CIFS recycle directory."""
    root=pathlib.Path("/mnt/ds225/#recycle")
    if not root.is_dir() or root.is_symlink():
        return {"standing":"NOT_VISIBLE","file_count":None,"sql_gzip_count":None}
    count=total=sql_files=sql_bytes=0
    errors=0
    partial=False
    for current,dirs,files in os.walk(root,topdown=True,followlinks=False):
        depth=len(pathlib.Path(current).relative_to(root).parts)
        if depth>=5:
            if dirs:
                partial=True
            dirs.clear()
        dirs[:]=[name for name in dirs
                 if not pathlib.Path(current,name).is_symlink()]
        for name in files:
            if count>=2000:
                partial=True
                break
            p=pathlib.Path(current,name)
            try:
                st=p.lstat()
            except OSError:
                errors+=1
                continue
            if not stat.S_ISREG(st.st_mode):
                continue
            count+=1
            total+=st.st_size
            if name.endswith(".sql.gz"):
                sql_files+=1
                sql_bytes+=st.st_size
        if count>=2000:
            partial=True
            break
    return {"standing":"PARTIAL" if partial or errors else "METADATA_ONLY",
            "file_count":count,"bytes":total,"sql_gzip_count":sql_files,
            "sql_gzip_bytes":sql_bytes,"read_errors":errors,
            "no_member_file_names_or_data_read":True}

def parse_find_output(b):
    files={}
    unsafe_names=non_files=0
    for entry in b.split(b"\0"):
        if not entry:
            continue
        parts=entry.decode("utf-8","surrogateescape").split("\t")
        if len(parts)!=6:
            fail("unexpected_file_metadata_format")
        kind,name,size,stamp,owner,mode=parts
        if "/" in name or name in (".","..") or "\n" in name or "\r" in name:
            unsafe_names+=1
            continue
        if kind!="f":
            non_files+=1
            continue
        if name in files:
            fail("duplicate_vault_entry")
        files[name]={"size":int(size),"mtime":float(stamp),"mode":mode,"owner":owner}
    return files,unsafe_names,non_files

def get_file_meta():
    mount=docker("inspect","maia-sovereign","--format",
                 '{{range .Mounts}}{{if eq .Destination "/app/data/vault"}}{{.Type}}:{{.Name}}{{end}}{{end}}')
    if mount.decode().strip() != "volume:" + VAULT:
        fail("wrong_docker_vault_volume")
    raw=docker("exec","maia-sovereign","find",SOURCE_NS,"-maxdepth","1",
               "-mindepth","1","-printf",r"%y\t%f\t%s\t%T@\t%u\t%m\0")
    return parse_find_output(raw)

def inspect_registry_refs(orphans):
    # Restrict this probe to explicit path/reference columns; a path match is
    # useful evidence but never proof of legal ownership or retention authority.
    query=(
        "SELECT table_name || '|' || column_name FROM information_schema.columns "
        "WHERE table_schema = 'public' AND column_name IN "
        "('artifact_ref','vault_path','storage_path','storage_key','file_ref','file_path','object_ref') "
        "ORDER BY table_name,column_name"
    )
    rows=psql(query).splitlines()
    if len(rows)>60:
        fail("registry_scan_too_broad")
    hits={}
    missed=[]
    for row in rows:
        if "|" not in row:
            fail("invalid_catalog_row")
        table,col=row.split("|",1)
        if not IDENTIFIER.fullmatch(table) or col not in SCAN_COLUMNS:
            fail("unsafe_catalog_identifier")
        if table in ("manuscript_source_arrivals","vault_erasure_queue"):
            continue
        q=(f'SELECT encode(convert_to("{col}"::text,\'UTF8\'),\'hex\') '
           f'FROM public."{table}" WHERE "{col}" IS NOT NULL LIMIT 30001')
        try:
            found=hex_values(q)
        except Exception:
            missed.append(table+"."+col)
            continue
        if len(found)>=30001:
            missed.append(table+"."+col+":bounded")
            continue
        present={in_source_namespace(v) for v in found}
        overlap=len(orphans.intersection(present))
        if overlap:
            hits[table+"."+col]=overlap
    return {"inspected_columns":max(0,len(rows)-2),
            "matched_other_registry_columns":hits,
            "unverified_columns":sorted(set(missed)),
            "negative_match_not_ownership_proof":True}

def live():
    if socket.gethostname().lower()!=EXPECTED_HOST:
        fail("wrong_host_identity")
    files,unsafe,non_files=get_file_meta()
    refs=hex_values(
        "SELECT encode(convert_to(artifact_ref,'UTF8'),'hex') "
        "FROM manuscript_source_arrivals WHERE artifact_ref IS NOT NULL")
    names={in_source_namespace(r) for r in refs}
    invalid=sum(x is None for x in names)
    names.discard(None)
    queued=hex_values(
        "SELECT encode(convert_to(artifact_ref,'UTF8'),'hex') FROM vault_erasure_queue")
    queued_names={in_source_namespace(x) for x in queued}
    queued_names.discard(None)
    orphan=set(files)-names
    missing=names-set(files)
    origin_distribution=collections.Counter()
    for n in orphan:
        x=files[n]
        date=dt.datetime.fromtimestamp(x["mtime"],DATE).date().isoformat()
        origin_distribution[(x["size"],date,x["owner"],x["mode"])]+=1
    types=psql(
        "SELECT source_kind || '|' || (manuscript_id IS NULL)::text || '|' || count(*)::text "
        "FROM manuscript_source_arrivals GROUP BY source_kind, manuscript_id IS NULL "
        "ORDER BY source_kind, manuscript_id IS NULL").splitlines()
    records=[]
    for line in types:
        parts=line.split("|")
        if len(parts)!=3 or not parts[2].isdigit():
            fail("source_classification_schema_mismatch")
        if parts[1] not in ("t","f","true","false"):
            fail("unclaimed_boolean_format")
        records.append({"kind":parts[0],"unclaimed":parts[1] in ("t","true"),"count":int(parts[2])})
    result={
        "schema":"soullab.ws.r20.r6.contentfree.census.v1",
        "scope":NO_MEMBER_OUTPUT,
        "host_identity":"PINNED_SSH_HOST_VERIFIED_BY_CALLER",
        "script_mode":"READ_ONLY_METADATA_ONLY",
        "source_arrival_records":sum(r["count"] for r in records),
        "source_arrivals_by_class":records,
        "source_artifact_references":len(refs),
        "valid_vault_namespace_references":len(names),
        "invalid_or_outside_namespace_refs":invalid,
        "vault_regular_files":len(files),
        "vault_non_file_entries":non_files,
        "vault_unsafe_file_names":unsafe,
        "referenced_files_present":len(set(files).intersection(names)),
        "referenced_files_missing":len(missing),
        "unreferenced_files":len(orphan),
        "unreferenced_also_erasure_queued":len(orphan.intersection(queued_names)),
        "erasure_queue_refs_total":len(queued),
        "unreferenced_metadata_histogram":[
            {"bytes":size,"utc_date":date,"owner":owner,"mode":mode,"count":count}
            for (size,date,owner,mode),count in sorted(origin_distribution.items())
        ],
        "other_registry_references":inspect_registry_refs(orphan),
        "backups":[stat_backup_dir("local_sql_only",LOCAL_SQL),
                   stat_backup_dir("nas_sql_only",NAS_SQL)],
        "nas_server_acl":"NOT_VERIFIED",
        "nas_recycle_visible_metadata":census_recycle_tree(),
        "nas_server_side_recycle_history":"NOT_VERIFIED",
        "offsite_copy_inventory":"NOT_VERIFIED",
        "all_replica_erasure_certified":False,
        "full_source_and_sql_recovery_certified":False,
        "release_admitted":False,
    }
    return result

def self_test():
    assert in_source_namespace("manuscript-sources/a.docx")=="a.docx"
    assert in_source_namespace("/app/data/vault/manuscript-sources/one")=="one"
    for bad in ("", "other/file", "manuscript-sources/../bad",
                "manuscript-sources/a/b", "manuscript-sources/",
                "manuscript-sources/..", "manuscript-sources/a\\b"):
        assert in_source_namespace(bad) is None, bad
    files,unsafe,nonfiles=parse_find_output(
        b"f\ta\t2380\t1780000000\tnode\t644\0"
        b"f\tb\t2380\t1780000001\tnode\t644\0")
    assert len(files)==2 and unsafe==0 and nonfiles==0
    assert set(files)-{"a"}=={"b"}
    return {"fixture_tests":"PASS","production_checked":False}

if __name__=="__main__":
    try:
        if sys.argv[1:]==["--self-test"]:
            outcome=self_test()
        elif sys.argv[1:]==["--live-readonly"]:
            outcome=live()
        else:
            fail("explicit_mode_required")
        print(json.dumps(outcome,sort_keys=True,separators=(",",":")))
    except Exception as exc:
        # Do NOT accidentally render source paths, user data or SQL values from
        # external exceptions into operational logs.
        if isinstance(exc,RuntimeError) and str(exc).startswith("R20_R6_REFUSED:"):
            print(json.dumps({"error":str(exc)}))
        else:
            print(json.dumps({"error":"R20_R6_REFUSED:unexpected_readonly_failure"}))
        sys.exit(2)
