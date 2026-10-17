#!/usr/bin/env python3
"""
Crash/restart-safe FICTIONAL Reflect E010 canary journal.

Only accepts FictionalDiskRuntime rooted in a new 0700, marked OS-temp fixture.
There is NO network, Docker, SSH, production backend, or real member identity.
A fresh interpreter can load a durable INTENT and safely finish OFF; it never
silently resumes a live grant. A corrupt journal or unrelated drift is HOLD.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import tempfile
from typing import Dict, Optional

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, PREVIOUS_IMAGE, SOURCE_SHA,
    CanaryHold, CanaryIncident, FounderCanaryControl, PrivateIdentityWitness,
    Receipt, _digest, _is_flag_present, _validate_witness,
)
from reflect_e010_disk_fixture import (
    FictionalDiskRuntime, _sync_dir, _write_new_0600,
)

JOURNAL = ".fictional-canary-journal.json"
PHASES = frozenset({"INTENT", "ON_VERIFIED", "OFF_INTENT", "OFF_VERIFIED"})
BODY_KEYS = frozenset({
    "version", "phase", "source_sha", "image_id", "previous_image",
    "original_config_sha", "enabled_config_sha", "founder_id_sha",
    "baseline_env_sha", "backup_token",
})
HASH = re.compile(r"^[a-f0-9]{64}$")
TOKEN = re.compile(r"^private-fixture-backup-[0-9]+$")


class SimulatedPowerLoss(BaseException):
    """A test-only process interruption that bypasses ordinary error recovery."""


class DurableFictionalCanary:
    """
    Persistent OFF-recovery witness, deliberately NOT a deployable controller.

    A journal records *only* hashes and a private backup token. No member ID,
    cookie, email, raw configuration, credential or bearer token is journaled.
    """
    def __init__(self, runtime: FictionalDiskRuntime, crash_at: Optional[str] = None):
        if type(runtime) is not FictionalDiskRuntime:
            raise CanaryHold("ONLY_FICTIONAL_DISK_BACKEND")
        runtime._verify_root()
        self.r = runtime
        self.ctrl = FounderCanaryControl(runtime)
        self.file = runtime.root / JOURNAL
        self.crash_at = crash_at

    @staticmethod
    def _canonical(payload: Dict[str, object]) -> bytes:
        return (json.dumps(payload, sort_keys=True, separators=(",", ":")) + "\n").encode()

    @staticmethod
    def _baseline_hash(env: Dict[str, str]) -> str:
        clean = {k: v for k, v in env.items() if k not in (FLAG, ALLOW)}
        return _digest(DurableFictionalCanary._canonical(clean))

    def _checkpoint(self, phase: str) -> None:
        if self.crash_at == phase:
            raise SimulatedPowerLoss(phase)

    @staticmethod
    def _encoded_record(body: Dict[str, object]) -> bytes:
        if set(body) != BODY_KEYS:
            raise CanaryHold("JOURNAL_FIELDS_INVALID")
        return DurableFictionalCanary._canonical({
            **body, "checksum": _digest(DurableFictionalCanary._canonical(body))
        })

    def _read_journal(self) -> Optional[Dict[str, object]]:
        self.r._verify_root()
        if not self.file.exists() and not self.file.is_symlink():
            return None
        raw = self.r._secure_read(self.file)
        try:
            doc = json.loads(raw)
            if not isinstance(doc, dict) or set(doc) != BODY_KEYS | {"checksum"}:
                raise ValueError("shape")
            body = {k: doc[k] for k in BODY_KEYS}
            if not isinstance(doc["checksum"], str) or not hmac.compare_digest(
                    doc["checksum"], _digest(self._canonical(body))):
                raise ValueError("checksum")
            if doc["version"] != 1 or doc["phase"] not in PHASES:
                raise ValueError("phase")
            if (doc["source_sha"] != SOURCE_SHA or doc["image_id"] != IMAGE_ID
                    or doc["previous_image"] != PREVIOUS_IMAGE):
                raise ValueError("release")
            if any(not isinstance(doc[k], str) or not HASH.fullmatch(doc[k])
                   for k in ("original_config_sha", "enabled_config_sha",
                             "founder_id_sha", "baseline_env_sha")):
                raise ValueError("sha")
            if not isinstance(doc["backup_token"], str) or not TOKEN.fullmatch(
                    doc["backup_token"]):
                raise ValueError("backup token")
            if self._encoded_record(body) != raw:
                raise ValueError("not-canonical")
            return body
        except (ValueError, TypeError, KeyError):
            raise CanaryIncident("DURABLE_JOURNAL_CORRUPT_MANUAL_HOLD")

    def _store(self, body: Dict[str, object], *, previous=None) -> None:
        if not self.r.locked or self.r.lock_fd is None:
            raise CanaryHold("RELEASE_LOCK_REQUIRED")
        if set(body) != BODY_KEYS:
            raise CanaryHold("JOURNAL_FIELDS_INVALID")
        current = self._read_journal()
        if current != previous:
            raise CanaryIncident("DURABLE_JOURNAL_CONCURRENT_CHANGE")
        data = self._encoded_record(body)
        if previous is None:
            if self.file.exists() or self.file.is_symlink():
                raise CanaryIncident("DURABLE_JOURNAL_ALREADY_EXISTS")
            _write_new_0600(self.file, data)
            _sync_dir(self.r.root)
            return
        fd, name = tempfile.mkstemp(prefix=".fictional-journal-write-",
                                   dir=str(self.r.root))
        try:
            os.fchmod(fd, 0o600)
            with os.fdopen(fd, "wb") as f:
                f.write(data)
                f.flush()
                os.fsync(f.fileno())
            if self._read_journal() != previous:
                raise CanaryIncident("DURABLE_JOURNAL_CONCURRENT_CHANGE")
            os.replace(name, str(self.file))
            _sync_dir(self.r.root)
        finally:
            if os.path.exists(name):
                os.unlink(name)

    def _runtime_boundary(self, journal: Dict[str, object]) -> str:
        """Accept only baseline OFF or the one hashed fictional founder ON."""
        env = self.r.runtime_env
        if self._baseline_hash(env) != journal["baseline_env_sha"]:
            raise CanaryIncident("UNRELATED_RUNTIME_ENV_DRIFT")
        enabled = FLAG in env or ALLOW in env
        if not enabled:
            return "OFF"
        if (env.get(FLAG) != "true"
                or not isinstance(env.get(ALLOW), str)
                or not re.fullmatch(
                    r"^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$",
                    env.get(ALLOW, ""))
                or not hmac.compare_digest(
                    _digest(env[ALLOW].lower().encode()), journal["founder_id_sha"])):
            raise CanaryIncident("UNKNOWN_RUNTIME_ALLOWLIST_MANUAL_HOLD")
        return "ON"

    def _check_disk_state(self, journal: Dict[str, object], original: bytes) -> str:
        if _is_flag_present(original):
            raise CanaryIncident("DURABLE_BACKUP_CONTAINS_REFLECT_KEYS")
        if _digest(original) != journal["original_config_sha"]:
            raise CanaryIncident("DURABLE_BACKUP_INTEGRITY_FAILURE")
        current = self.r.read_config()
        actual = _digest(current)
        if actual == journal["original_config_sha"]:
            return "OFF"
        if actual == journal["enabled_config_sha"]:
            return "ON"
        raise CanaryIncident("UNKNOWN_CONFIG_DRIFT_MANUAL_HOLD")

    def _recover_locked(self) -> Receipt:
        self.ctrl._preflight()
        record = self._read_journal()
        if record is None:
            raise CanaryHold("NO_DURABLE_INTENT")
        original = self.r.restore_backup(record["backup_token"])
        disk = self._check_disk_state(record, original)
        reader = self._runtime_boundary(record)
        if record["phase"] == "OFF_VERIFIED":
            if disk != "OFF" or reader != "OFF":
                raise CanaryIncident("DURABLE_OFF_RECEIPT_CONTRADICTED")
            return Receipt(phase="FICTIONAL_DURABLE_OFF_VERIFIED",
                           allowlist_count=0, rollback_custody_verified=True)
        if record["phase"] != "OFF_INTENT":
            next_record = {**record, "phase": "OFF_INTENT"}
            self._store(next_record, previous=record)
            record = next_record
        self._checkpoint("off_intent")
        if disk == "ON":
            self.r.write_config_atomically(original)
        self._checkpoint("config_off")
        # Even if config was restored before an interruption, the prior reader
        # could still have ON env; recreate ONLY the fictional E010 reader.
        self.r.recreate_reader(IMAGE_ID, no_build=True, no_pull=True,
                               no_dependencies=True)
        self._checkpoint("reader_off")
        if self._check_disk_state(record, original) != "OFF":
            raise CanaryIncident("DURABLE_CONFIG_NOT_OFF")
        if self._runtime_boundary(record) != "OFF":
            raise CanaryIncident("DURABLE_READER_NOT_OFF")
        self.ctrl._preflight()
        closed = {**record, "phase": "OFF_VERIFIED"}
        self._store(closed, previous=record)
        self._checkpoint("off_verified")
        return Receipt(phase="FICTIONAL_DURABLE_OFF_VERIFIED",
                       allowlist_count=0, reader_only_recreation=True,
                       rollback_custody_verified=True)

    def recover_off(self) -> Receipt:
        """One fixed act: verify and force OFF, never reactivate after restart."""
        self.r.acquire()
        try:
            return self._recover_locked()
        finally:
            self.r.release()

    def activate(self, witness: PrivateIdentityWitness, now) -> Receipt:
        _validate_witness(witness, now)
        r = self.r
        r.acquire()
        intent_saved = False
        try:
            self.ctrl._preflight()
            if self._read_journal() is not None:
                raise CanaryHold("SINGLE_CANARY_ALREADY_STARTED")
            original = r.read_config()
            if (not original or b"\0" in original or len(original) > 1024 * 1024
                    or _is_flag_present(original) or
                    FLAG in r.runtime_env or ALLOW in r.runtime_env):
                raise CanaryHold("CANARY_BASELINE_NOT_CLOSED")
            baseline = self._baseline_hash(r.runtime_env)
            token = r.backup(original)
            if r.restore_backup(token) != original:
                raise CanaryIncident("INITIAL_BACKUP_MISMATCH")
            on_config = (original + (b"" if original.endswith(b"\n") else b"\n")
                         + (FLAG + "=true\n").encode()
                         + (ALLOW + "=" + witness.member_id.lower() + "\n").encode())
            journal = {
                "version": 1, "phase": "INTENT", "source_sha": SOURCE_SHA,
                "image_id": IMAGE_ID, "previous_image": PREVIOUS_IMAGE,
                "original_config_sha": _digest(original),
                "enabled_config_sha": _digest(on_config),
                "founder_id_sha": _digest(witness.member_id.lower().encode()),
                "baseline_env_sha": baseline, "backup_token": token,
            }
            self._store(journal)
            intent_saved = True
            self._checkpoint("intent")
            r.write_config_atomically(on_config)
            self._checkpoint("config_on")
            r.recreate_reader(IMAGE_ID, no_build=True, no_pull=True,
                               no_dependencies=True)
            self._checkpoint("reader_on")
            if self._check_disk_state(journal, original) != "ON":
                raise CanaryIncident("ENABLE_CONFIG_NOT_VERIFIED")
            if self._runtime_boundary(journal) != "ON":
                raise CanaryIncident("ENABLE_READER_NOT_VERIFIED")
            self.ctrl._preflight()
            new = {**journal, "phase": "ON_VERIFIED"}
            self._store(new, previous=journal)
            self._checkpoint("on_verified")
            return Receipt(phase="FICTIONAL_DURABLE_FOUNDER_ENABLED",
                           allowlist_count=1, reader_only_recreation=True,
                           rollback_custody_verified=True)
        except Exception as error:
            if intent_saved:
                try:
                    self._recover_locked()
                except Exception:
                    raise CanaryIncident("ACTIVATION_FAILED_RECOVERY_INCOMPLETE")
            if isinstance(error, CanaryHold):
                raise
            raise CanaryHold("ACTIVATION_FAILED_OFF_RECOVERED")
        finally:
            r.release()


if __name__ == "__main__":
    import sys
    print("HOLD: Fictional journal only. No production activation entrypoint.")
    sys.exit(2)
