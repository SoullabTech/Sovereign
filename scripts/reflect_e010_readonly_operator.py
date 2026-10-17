#!/usr/bin/env python3
"""E010 read-only production preflight; no activation or write capability.

An explicit, operator-selected SSH destination is REQUIRED. The only SSH
payload is a fixed, audited metadata-only Python probe. It never reads
member/session records, prints environment values, calls providers or writes
files. It cannot mutate production regardless of its command-line options.

An OFF/ON adapter is NOT implemented or authorized by this module.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import json
import re
import subprocess
import sys
from typing import Callable, Dict, Tuple

from reflect_e010_canary_control import (
    IMAGE_ID, MIN_AVAILABLE_BYTES, PREVIOUS_IMAGE, SOURCE_SHA,
)

# Fixed, exclusively metadata-oriented remote script.
# Avoid retrieving IDs, member tables, tokens, session cookies, env values.
REMOTE_PROBE = r"""
import json, os, pathlib, subprocess, sys
from datetime import datetime, timezone

REPO = pathlib.Path("/home/soullab/MAIA-SOVEREIGN")
SHA = "e010c0977320ea3cceb7424e84a5cf5c58770cc2"
FIELDS = ("target_full_sha", "target_short_sha", "candidate_tag",
          "candidate_image_id", "baseline_live_image_id", "baseline_live_sha")
REFLECT_KEYS = ("PRO_STUDIO_REFLECT_BETA_ENABLED",
                "PRO_STUDIO_REFLECT_BETA_MEMBER_IDS")
SERVICES = ("maia-sovereign", "maia-api", "maia-postgres", "maia-summary-worker")

def call(args, timeout=12):
    r = subprocess.run(args, cwd=str(REPO), capture_output=True, text=True,
                       timeout=timeout, check=False)
    if r.returncode:
        raise RuntimeError("PROBE_DEPENDENCY_FAILED")
    return r.stdout.strip()

def docker_fmt(obj, fmt, kind="container"):
    args = (["docker", "image", "inspect"] if kind == "image"
            else ["docker", "inspect"])
    return call(args + [obj, "--format", fmt])

try:
    stat = os.statvfs("/")
    free_kib = (stat.f_bavail * stat.f_frsize) // 1024
    df = call(["df", "-Pk", "/"]).splitlines()
    if len(df) != 2 or not df[1].split():
        raise RuntimeError("FILESYSTEM_UNVERIFIABLE")
    root_fs = df[1].split()[0]
    host = os.uname().nodename
    image_roles = {
        role: docker_fmt("maia-sovereign:" + role, "{{.Id}}", "image")
        for role in ("current", "prod", "previous", "candidate-e010c0977")
    }
    image_arch = docker_fmt("maia-sovereign:candidate-e010c0977",
                            "{{.Os}}/{{.Architecture}}", "image")
    reader_id = docker_fmt("maia-sovereign", "{{.Image}}")
    reader_stamp = docker_fmt("maia-sovereign",
                             '{{range .Config.Env}}{{println .}}{{end}}')
    reader_stamp = next((s.partition("=")[2] for s in reader_stamp.splitlines()
                         if s.startswith("GIT_COMMIT=")), "")
    # Only Boolean presence is returned; values never leave production.
    reader_env = json.loads(docker_fmt("maia-sovereign", "{{json .Config.Env}}"))
    runtime_key_present = {
        key: any(isinstance(item, str) and item.startswith(key + "=")
                 for item in reader_env) for key in REFLECT_KEYS
    }
    env_path = REPO / ".env.production"
    # Read only *presence*. Never disclose or copy any environment value.
    config_key_present = {key: False for key in REFLECT_KEYS}
    with env_path.open("r") as handle:
        for line in handle:
            stripped = line.strip()
            for key in REFLECT_KEYS:
                if stripped.startswith(key + "=") or stripped.startswith("export " + key + "="):
                    config_key_present[key] = True
    service_health = {
        n: docker_fmt(n,
             "{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}undefined{{end}}|{{.RestartCount}}")
        for n in SERVICES
    }
    names = call(["docker", "ps", "--format", "{{.Names}}"]).splitlines()
    restarting = call([
        "docker", "ps", "-a", "--filter", "status=restarting",
        "--format", "{{.Names}}"
    ]).splitlines()
    studio_count = sum(n.startswith("ws") for n in names)
    studio_restarting = sum(n.startswith("ws") for n in restarting)
    active_builders = sum(n.startswith("buildx_buildkit_") for n in names)
    lock = subprocess.run(["fuser", str(REPO / ".deploy.lock")],
                          stdout=subprocess.DEVNULL,
                          stderr=subprocess.DEVNULL, timeout=6)
    # fuser 0 = held; 1 = no holder; other error code = unknown HOLD.
    lock_clear = True if lock.returncode == 1 else False if lock.returncode == 0 else None
    manifest = {}
    for line in (REPO / ".deploy-prepared-maia").read_text().splitlines():
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k in FIELDS:
            manifest[k] = v
    actual_source = call(["git", "rev-parse", "--verify", SHA + "^{commit}"])
    source_files = {
        p.partition("database/migrations/")[2]
        for p in call([
            "git", "ls-tree", "-r", "--name-only", SHA, "database/migrations"
        ]).splitlines() if p.endswith(".sql")
    }
    sql = ("BEGIN TRANSACTION READ ONLY; SELECT filename FROM "
           "schema_migrations WHERE filename IS NOT NULL ORDER BY filename; COMMIT;")
    installed = {
        s.strip() for s in call([
            "docker", "exec", "maia-postgres", "psql", "-X", "-q", "-A",
            "-t", "-v", "ON_ERROR_STOP=1", "-U", "soullab",
            "-d", "maia_consciousness", "-c", sql
        ]).splitlines() if s.strip() not in ("BEGIN", "COMMIT")
    }
    data = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "host": host,
        "root_fs": root_fs,
        "source": actual_source,
        "free_kib": free_kib,
        "reader_id": reader_id,
        "reader_stamp": reader_stamp,
        "image_roles": image_roles,
        "candidate_arch": image_arch,
        "services": service_health,
        "studio_count": studio_count,
        "studio_restarting": studio_restarting,
        "active_builders": active_builders,
        "lock_clear": lock_clear,
        "runtime_key_present": runtime_key_present,
        "config_key_present": config_key_present,
        "manifest": manifest,
        "migration_source_count": len(source_files),
        "migration_installed_count": len(installed),
        "migration_pending_count": len(source_files - installed),
    }
    print(json.dumps(data, sort_keys=True))
except Exception:
    print(json.dumps({"error": "READ_ONLY_PROBE_FAILED"}))
    sys.exit(2)
"""

SSH_DESTINATION = re.compile(r"^soullab@100(?:\.[0-9]{1,3}){3}$")
KEYS = ("PRO_STUDIO_REFLECT_BETA_ENABLED", "PRO_STUDIO_REFLECT_BETA_MEMBER_IDS")
MANIFEST = {
    "target_full_sha": SOURCE_SHA,
    "target_short_sha": "e010c0977",
    "candidate_tag": "maia-sovereign:candidate-e010c0977",
    "candidate_image_id": IMAGE_ID,
    "baseline_live_image_id": PREVIOUS_IMAGE,
    "baseline_live_sha": "c9e4f7f7e",
}
EXPECTED = frozenset({
    "utc", "host", "root_fs", "source", "free_kib", "reader_id", "reader_stamp", "image_roles",
    "candidate_arch", "services", "studio_count", "studio_restarting",
    "active_builders", "lock_clear", "runtime_key_present",
    "config_key_present", "manifest", "migration_source_count",
    "migration_installed_count", "migration_pending_count",
})


class ProbeHold(Exception):
    """Nonsecret refusal identifier; no arbitrary error text is surfaced."""


def _ensure(ok: bool, label: str) -> None:
    if not ok:
        raise ProbeHold(label)


def validate_metadata(obj: Dict[str, object]) -> Dict[str, object]:
    """Check a structured, content-free preflight receipt. Never accept partial."""
    _ensure(type(obj) is dict and frozenset(obj.keys()) == EXPECTED, "RECEIPT_SHAPE")
    _ensure(isinstance(obj["utc"], str) and len(obj["utc"]) <= 64,
            "OBSERVATION_TIMESTAMP")
    try:
        observed = datetime.fromisoformat(obj["utc"])
        _ensure(observed.tzinfo is not None, "STALE_OBSERVATION")
        age = datetime.now(timezone.utc) - observed
        _ensure(timedelta(seconds=-5) <= age <= timedelta(minutes=2),
                "STALE_OBSERVATION")
    except (ValueError, TypeError, OverflowError):
        raise ProbeHold("OBSERVATION_TIMESTAMP")
    _ensure(obj["host"] == "soullab" and obj["root_fs"] == "/dev/nvme0n1p2",
            "PRODUCTION_HOST_IDENTITY")
    _ensure(obj["source"] == SOURCE_SHA, "SOURCE_IDENTITY")
    _ensure(type(obj["free_kib"]) is int and
            obj["free_kib"] * 1024 >= MIN_AVAILABLE_BYTES, "DISK_FLOOR")
    _ensure(obj["reader_id"] == IMAGE_ID and obj["reader_stamp"] == "e010c0977",
            "READER_CUSTODY")
    roles = obj["image_roles"]
    _ensure(type(roles) is dict and roles == {
        "current": IMAGE_ID, "prod": IMAGE_ID,
        "candidate-e010c0977": IMAGE_ID, "previous": PREVIOUS_IMAGE
    }, "ROLE_CUSTODY")
    _ensure(obj["candidate_arch"] == "linux/amd64", "IMAGE_ARCHITECTURE")
    services = obj["services"]
    _ensure(type(services) is dict and set(services) == {
        "maia-sovereign", "maia-api", "maia-postgres", "maia-summary-worker"
    }, "SERVICES_SHAPE")
    _ensure(all(services[name] == "running|healthy|0" for name in services),
            "SERVICE_HEALTH_OR_RESTARTS")
    _ensure(type(obj["studio_count"]) is int and obj["studio_count"] == 35 and
            type(obj["studio_restarting"]) is int and obj["studio_restarting"] == 0,
            "STUDIO_COUNT_OR_RESTARTS")
    _ensure(type(obj["active_builders"]) is int and obj["active_builders"] == 0,
            "COMPETING_BUILDER")
    _ensure(obj["lock_clear"] is True, "DEPLOY_LOCK_BUSY_OR_UNKNOWN")
    _ensure(obj["manifest"] == MANIFEST, "PREPARED_MANIFEST")
    for key in ("runtime_key_present", "config_key_present"):
        present = obj[key]
        _ensure(type(present) is dict and set(present) == set(KEYS)
                and all(present[k] is False for k in KEYS), "REFLECT_NOT_OFF")
    _ensure(type(obj["migration_source_count"]) is int and
            obj["migration_source_count"] > 0 and
            type(obj["migration_installed_count"]) is int and
            obj["migration_installed_count"] > 0 and
            type(obj["migration_pending_count"]) is int and
            obj["migration_pending_count"] == 0, "MIGRATION_PARITY")
    # Never return secrets, raw env, private member identities, Docker labels.
    return {
        "verdict": "PASS_READ_ONLY",
        "utc": obj["utc"],
        "source": SOURCE_SHA,
        "image": IMAGE_ID,
        "free_kib": obj["free_kib"],
        "studio_count": 35,
        "migration_pending_count": 0,
        "flag_off": True,
        "reader_healthy": True,
        "rollback_preserved": True,
    }


def inspect(target: str, runner: Callable = subprocess.run) -> Dict[str, object]:
    """Exact SSH read-only probe; no edit, restart, token, or deploy argument."""
    _ensure(type(target) is str and SSH_DESTINATION.fullmatch(target) is not None,
            "TARGET_NOT_APPROVED_TAILSCALE_SHAPE")
    command = [
        "ssh", "-T", "-o", "BatchMode=yes", "-o", "ConnectTimeout=8",
        "-o", "StrictHostKeyChecking=yes", target, "python3", "-"
    ]
    try:
        res = runner(command, input=REMOTE_PROBE, text=True, capture_output=True,
                     timeout=45, check=False)
    except Exception:
        raise ProbeHold("READ_ONLY_TRANSPORT_FAILED")
    _ensure(res.returncode == 0 and len(res.stdout) <= 8192,
            "READ_ONLY_REMOTE_HOLD")
    try:
        obj = json.loads(res.stdout)
    except (ValueError, TypeError):
        raise ProbeHold("UNPARSABLE_READ_ONLY_METADATA")
    return validate_metadata(obj)


def main(argv=None) -> int:
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--inspect-only", action="store_true")
    args.add_argument("--target")
    ns = args.parse_args(argv)
    if not ns.inspect_only or not ns.target:
        print("HOLD: Read-only preflight requires explicit target and inspection mode.")
        return 2
    try:
        receipt = inspect(ns.target)
        print(json.dumps(receipt, sort_keys=True))
        return 0
    except ProbeHold as e:
        print("REFLECT_E010_READONLY_PREFLIGHT=HOLD_" + str(e))
        return 2


if __name__ == "__main__":
    sys.exit(main())
