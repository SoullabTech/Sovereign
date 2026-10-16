#!/usr/bin/env python3
"""R20 PostgreSQL 16 deny-only writer role, fictional/offline fixture.

NO production.  Creates one private random Docker container with --network none,
no bind ports/mounts, no actual writer, no credentials or real key material.
"""
import json
import os
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/Volumes/T7 Shield/ws-beta-r20-restricted-db-role-20261016")
SQL = ROOT / "docs/ops/WS_R20_RESTRICTED_ROLE_REVIEW_ONLY.sql"
R16 = ROOT / "docs/ops/WS_R16_HELD_PAIRED_STORE_REVIEW_ONLY.sql"
OUT = Path("/Volumes/T7 Shield/ws-beta-release-r9-build-20261015/R20_PG16_DENY_WRITER_ROLE_20261016.json")
NAME = "ws-r20-no-network-" + str(uuid.uuid4())[:12]
ROLE = "ws_beta_r20_held_restricted"
FIELDS = [
    ("manuscript_source_arrivals", "source_text"),
    ("manuscript_source_arrivals", "original_filename"),
    ("manuscript_sections", "body"),
    ("manuscript_working_drafts", "content"),
    ("manuscript_draft_sections", "text"),
    ("manuscript_revision_offers", "proposed_text"),
    ("manuscript_revision_authorizations", "expected_text"),
]
receipt = {
    "status": "HOLD",
    "pg16": False,
    "noNetwork": False,
    "publishedPorts": 0,
    "checks": [],
    "negativeControls": [],
    "realMembers": False,
    "realKeys": False,
    "prodTouched": False,
    "realWriterAdmission": "HOLD",
    "testContainerRemoved": False,
    "error": None,
}
container_created = False


def cmd(*a, input_text=None, timeout=35, check=True):
    p = subprocess.run(
        list(a), input=input_text, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout,
    )
    if check and p.returncode:
        raise RuntimeError(f"process failed {a[0]} {a[1] if len(a)>1 else ''}: {p.stderr[-250:]}")
    return p


def check(ok, msg):
    if not ok:
        raise RuntimeError("R20_CHECK_FAILED: " + msg)
    receipt["checks"].append(msg)


def psql(sql, *, as_role=False, should_fail=False):
    prefix = f"SET ROLE {ROLE}; " if as_role else ""
    p = cmd("docker", "exec", NAME, "psql", "-XAtq", "-v",
            "ON_ERROR_STOP=1", "-U", "fictional_owner", "-d",
            "fictional_writer", "-c", prefix + sql, timeout=12, check=False)
    if should_fail:
        check(p.returncode != 0 and "permission denied" in p.stderr.lower(),
              "denied SQL operation by locked-down role")
        return None
    if p.returncode:
        raise RuntimeError("Unexpected SQL failure: " + p.stderr[-230:])
    return p.stdout.strip()


def setup_tables():
    schema = """
    CREATE TABLE members(id uuid PRIMARY KEY);
    CREATE TABLE member_manuscripts(
      id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id));
    CREATE TABLE manuscript_source_arrivals(
      id uuid PRIMARY KEY,member_id uuid NOT NULL REFERENCES members(id),
      manuscript_id uuid REFERENCES member_manuscripts(id),
      source_text text NOT NULL DEFAULT '',original_filename text);
    CREATE TABLE manuscript_sections(
      id uuid PRIMARY KEY,body text NOT NULL DEFAULT '');
    CREATE TABLE manuscript_working_drafts(
      id uuid PRIMARY KEY,content text NOT NULL DEFAULT '');
    CREATE TABLE manuscript_draft_sections(
      id uuid PRIMARY KEY,text text NOT NULL DEFAULT '');
    CREATE TABLE manuscript_revision_offers(
      id uuid PRIMARY KEY,proposed_text text NOT NULL DEFAULT '');
    CREATE TABLE manuscript_revision_authorizations(
      id uuid PRIMARY KEY,expected_text text NOT NULL DEFAULT '');
    INSERT INTO members VALUES ('11111111-1111-4111-8111-111111111111');
    INSERT INTO member_manuscripts VALUES
      ('22222222-2222-4222-8222-222222222222',
       '11111111-1111-4111-8111-111111111111');
    INSERT INTO manuscript_source_arrivals
      (id,member_id,manuscript_id,source_text,original_filename)
    VALUES ('33333333-3333-4333-8333-333333333333',
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      'FICTIONAL_R20_TEXT_ONLY','FICTIONAL_R20_SOURCE_ONLY.docx');
    """
    psql(schema)
    cmd("docker", "cp", str(R16), NAME + ":/tmp/r16_review.sql")
    cmd("docker", "exec", NAME, "psql", "-XAtq", "-v", "ON_ERROR_STOP=1",
        "-U", "fictional_owner", "-d", "fictional_writer",
        "-f", "/tmp/r16_review.sql")
    cmd("docker", "cp", str(SQL), NAME + ":/tmp/r20_review.sql")
    cmd("docker", "exec", NAME, "psql", "-XAtq", "-v", "ON_ERROR_STOP=1",
        "-U", "fictional_owner", "-d", "fictional_writer",
        "-f", "/tmp/r20_review.sql")
    check(psql("SELECT count(*) FROM manuscript_source_arrivals") == "1",
          "fictional original remains intact for owner/read recovery")
    check(psql("SELECT count(*) FROM writers_studio_r16_held_pairs") == "0",
          "encrypted-pair table remains held and empty")


try:
    if os.environ.get("R20_ROLE_FIXTURE") != "fictional-only":
        raise RuntimeError("R20_EXACT_FICTIONAL_ONLY_OPT_IN_REQUIRED")
    check(SQL.is_file() and R16.is_file(), "review-only role and R16 table files exist")
    run = cmd("docker", "run", "--pull", "never", "-d",
              "--name", NAME, "--network", "none",
              "-e", "POSTGRES_HOST_AUTH_METHOD=trust",
              "-e", "POSTGRES_USER=fictional_owner",
              "-e", "POSTGRES_DB=fictional_writer",
              "postgres:16.13", timeout=80)
    container_created = bool(run.stdout.strip())
    check(container_created, "unique disposable local PG16 container created")
    for _ in range(65):
        ready = cmd("docker", "exec", NAME, "pg_isready", "-U",
                    "fictional_owner", "-d", "fictional_writer",
                    check=False, timeout=5)
        if ready.returncode == 0:
            probe = cmd("docker", "exec", NAME, "psql", "-XAtq", "-v",
                        "ON_ERROR_STOP=1", "-U", "fictional_owner",
                        "-d", "fictional_writer", "-c", "SHOW server_version_num",
                        check=False, timeout=5)
            if probe.returncode == 0 and probe.stdout.strip().startswith("160"):
                break
        import time
        time.sleep(0.25)
    else:
        raise RuntimeError("R20_PG16_NOT_READY")
    ver = psql("SHOW server_version_num")
    receipt["pg16"] = ver.startswith("160")
    check(receipt["pg16"], "actual PostgreSQL 16 running in ephemeral fixture")
    inspected = json.loads(cmd("docker", "inspect", NAME).stdout)[0]
    receipt["noNetwork"] = inspected["HostConfig"]["NetworkMode"] == "none"
    receipt["publishedPorts"] = len(inspected["HostConfig"].get("PortBindings") or {})
    mounts = inspected.get("Mounts") or []
    # PostgreSQL image declares one isolated anonymous data volume; it must
    # be removed with docker rm -v. No host bind or external named volume.
    image_only_volume = (len(mounts) == 1
        and mounts[0].get("Type") == "volume"
        and mounts[0].get("Destination") == "/var/lib/postgresql/data"
        and not inspected["HostConfig"].get("Binds"))
    check(receipt["noNetwork"] and receipt["publishedPorts"] == 0
          and image_only_volume,
          "isolated PG16 has no network, published port or host-bound volume")
    setup_tables()
    role_flags = psql("SELECT rolcanlogin::text || ',' || rolsuper::text || ','"
                      " || rolcreatedb::text || ',' || rolcreaterole::text "
                      f"FROM pg_roles WHERE rolname='{ROLE}'")
    check(role_flags == "false,false,false,false",
          "writer role is NOLOGIN, non-superuser, no CREATE privileges")
    for table, field in FIELDS:
        psql(f"SELECT {field} FROM {table} LIMIT 1",
             as_role=True, should_fail=True)
        receipt["negativeControls"].append(f"DENY_READ:{table}.{field}")
        psql(f"INSERT INTO {table} DEFAULT VALUES",
             as_role=True, should_fail=True)
        psql(f"UPDATE {table} SET {field} = {field} WHERE false",
             as_role=True, should_fail=True)
        psql(f"DELETE FROM {table} WHERE false",
             as_role=True, should_fail=True)
    psql("SELECT * FROM writers_studio_r16_held_pairs",
         as_role=True, should_fail=True)
    psql("INSERT INTO writers_studio_r16_held_pairs DEFAULT VALUES",
         as_role=True, should_fail=True)
    receipt["negativeControls"].append("DENY_HELD_CIPHERTEXT_DIRECT_READ_WRITE")
    psql("CREATE TABLE r20_privilege_escalation_refused(x integer)",
         as_role=True, should_fail=True)
    receipt["negativeControls"].append("DENY_CREATE")
    check(psql("SELECT original_filename FROM manuscript_source_arrivals")
          == "FICTIONAL_R20_SOURCE_ONLY.docx",
          "owner's existing fictional original survived all negative probes")
    receipt["status"] = "R20_PG16_RESTRICTED_ROLE_DENY_ONLY_PASS_REAL_BETA_HOLD"
except Exception as exc:
    receipt["status"] = "R20_PG16_ROLE_FIXTURE_HOLD"
    receipt["error"] = str(exc)[-450:]
    sys.exit(2)
finally:
    if container_created:
        removed = cmd("docker", "rm", "-f", "-v", NAME,
                      check=False, timeout=40)
        receipt["testContainerRemoved"] = removed.returncode == 0
    if not receipt["testContainerRemoved"] and container_created:
        receipt["status"] = "R20_CLEANUP_HOLD"
        receipt["error"] = (receipt["error"] or "") + " cleanup did not complete"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(receipt, indent=2) + "\n")
    os.chmod(OUT, 0o600)
    print(json.dumps({
        "status": receipt["status"],
        "checks": len(receipt["checks"]),
        "negativeControls": len(receipt["negativeControls"]),
        "cleanup": receipt["testContainerRemoved"],
        "error": receipt["error"],
        "realBeta": "HOLD",
    }))
    if receipt["status"] != "R20_PG16_RESTRICTED_ROLE_DENY_ONLY_PASS_REAL_BETA_HOLD":
        sys.exit(2)
