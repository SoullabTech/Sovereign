#!/usr/bin/env python3
"""
Reflect E010 — founder-only canary control, FICTIONAL ACCEPTANCE CANDIDATE.

This module models the precise allowed transition and fail-closed restoration.
It deliberately has NO production filesystem, SSH, Docker, HTTP, or DB adapter.
An independently reviewed release-operator integration is required before use
on production. Never turn the fixture backend into a generic command runner.

Run: python3 -m unittest discover -s scripts -p 'test_reflect_e010_canary_control.py'
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import re
from typing import Dict, List, Optional, Set, Tuple

SOURCE_SHA = "e010c0977320ea3cceb7424e84a5cf5c58770cc2"
IMAGE_ID = "sha256:ed8272ad08d00aea1616907b0cdd38047e6e88439c32af4bbea481501603c30a"
# Compare against the exact independently preserved previous-reader image.
PREVIOUS_IMAGE = "sha256:d6bc2e06c01534b5e7792feae3f6d38cedf59f68f34fa60a0d358f27eb574c48"
MIN_AVAILABLE_BYTES = 60 * 1024 ** 3
FLAG = "PRO_STUDIO_REFLECT_BETA_ENABLED"
ALLOW = "PRO_STUDIO_REFLECT_BETA_MEMBER_IDS"
REQUIRED_SERVICES = ("maia-sovereign", "maia-api", "maia-postgres", "maia-summary-worker")
MEMBER_UUID = re.compile(r"^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$")
FLAG_LINE = re.compile(rb"(?m)^[ \t]*(?:export[ \t]+)?PRO_STUDIO_REFLECT_BETA_ENABLED[ \t]*=")
ALLOW_LINE = re.compile(rb"(?m)^[ \t]*(?:export[ \t]+)?PRO_STUDIO_REFLECT_BETA_MEMBER_IDS[ \t]*=")


class CanaryHold(Exception):
    """Fixed-code refusal. Never include raw identity, env, or command output."""


class CanaryIncident(CanaryHold):
    """An attempted recovery failed; require separately governed intervention."""


@dataclass(frozen=True, repr=False)
class PrivateIdentityWitness:
    """Fixture analogue of a PRIVATE, same-origin, user-mediated session witness."""
    member_id: str
    approved_member_hash: str
    own_session_verified: bool
    founder_identity_verified: bool
    consented: bool
    verified_utc: datetime


@dataclass(frozen=True)
class Receipt:
    """Safe-to-report operational metadata: no member identifiers or credentials."""
    phase: str
    source_sha: str = SOURCE_SHA
    image_id: str = IMAGE_ID
    allowlist_count: int = 0
    unchanged_studio_containers: int = 35
    reader_only_recreation: bool = False
    rollback_custody_verified: bool = False


@dataclass(repr=False)
class FictionalRuntime:
    """
    Explicit, self-contained fictional backend; it CANNOT execute commands.
    Every state change is in-memory. A later, separately approved backend must
    implement independent identity, filesystem, image and consent attestation.
    """
    source_sha: str = SOURCE_SHA
    reader_image: str = IMAGE_ID
    prod_image: str = IMAGE_ID
    current_image: str = IMAGE_ID
    candidate_image: str = IMAGE_ID
    previous_image: str = PREVIOUS_IMAGE
    prepared_manifest_ok: bool = True
    migration_pending_count: int = 0
    available_bytes: int = 63 * 1024 ** 3
    service_health: Dict[str, bool] = field(
        default_factory=lambda: {name: True for name in REQUIRED_SERVICES})
    studio_count: int = 35
    studio_restarting: int = 0
    active_builders: int = 0
    competing_release_lock: bool = False
    config: bytes = b"NODE_ENV=production\nUNRELATED_SETTING=preserve\n"
    runtime_env: Dict[str, str] = field(
        default_factory=lambda: {"NODE_ENV": "production", "UNRELATED_SETTING": "preserve"})
    backups: Dict[str, Tuple[bytes, int]] = field(default_factory=dict)
    calls: List[str] = field(default_factory=list)
    recreate_attempts: int = 0
    fail_recreate_on: Set[int] = field(default_factory=set)
    inject_extra_runtime_key: bool = False
    mutate_config_after_recreation: bool = False
    locked: bool = False

    def acquire(self) -> None:
        if self.competing_release_lock or self.locked:
            raise CanaryHold("RELEASE_LOCK_BUSY")
        self.locked = True
        self.calls.append("acquire_release_lock")

    def release(self) -> None:
        self.locked = False
        self.calls.append("release_release_lock")

    def read_config(self) -> bytes:
        return bytes(self.config)

    def backup(self, content: bytes) -> str:
        if not self.locked:
            raise CanaryHold("RELEASE_LOCK_REQUIRED")
        token = "private-fixture-backup-" + str(len(self.backups) + 1)
        self.backups[token] = (bytes(content), 0o600)
        self.calls.append("backup_0600")
        return token

    def restore_backup(self, token: str) -> bytes:
        if token not in self.backups:
            raise CanaryHold("BACKUP_MISSING")
        contents, mode = self.backups[token]
        if mode != 0o600:
            raise CanaryHold("BACKUP_PERMISSIONS")
        return contents

    def write_config_atomically(self, content: bytes) -> None:
        if not self.locked:
            raise CanaryHold("RELEASE_LOCK_REQUIRED")
        self.config = bytes(content)
        self.calls.append("atomic_config_write_0600")

    def recreate_reader(self, exact_image: str, *, no_build: bool, no_pull: bool,
                        no_dependencies: bool) -> None:
        if not self.locked:
            raise CanaryHold("RELEASE_LOCK_REQUIRED")
        if (exact_image != IMAGE_ID or not no_build or not no_pull
                or not no_dependencies or self.reader_image != IMAGE_ID):
            raise CanaryHold("UNAUTHORIZED_RECREATE_SCOPE")
        self.recreate_attempts += 1
        self.calls.append("recreate_maia_reader_only_no_build_no_pull")
        if self.recreate_attempts in self.fail_recreate_on:
            raise CanaryHold("RECREATE_FAILED")
        # Mimic ONLY the two approved environmental changes on reader restart.
        env = {k: v for k, v in self.runtime_env.items() if k not in (FLAG, ALLOW)}
        for line in self.config.splitlines():
            if line.startswith((FLAG + "=").encode()):
                env[FLAG] = line.split(b"=", 1)[1].decode("utf-8")
            if line.startswith((ALLOW + "=").encode()):
                env[ALLOW] = line.split(b"=", 1)[1].decode("utf-8")
        if self.inject_extra_runtime_key:
            env["UNAPPROVED_VAR"] = "changed"
        self.runtime_env = env
        if self.mutate_config_after_recreation:
            self.config += b"UNEXPECTED_CONCURRENT_CHANGE=yes\n"


@dataclass(frozen=True, repr=False)
class ActiveCanary:
    """Opaque to logs; held in private operator process memory only."""
    backup_token: str
    authorized_config_hash: str
    private_member_id: str
    baseline_env: Dict[str, str]


def _digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _is_flag_present(config: bytes) -> bool:
    return bool(FLAG_LINE.search(config) or ALLOW_LINE.search(config))


def _validate_witness(w: PrivateIdentityWitness, now: datetime) -> None:
    if not MEMBER_UUID.fullmatch(w.member_id):
        raise CanaryHold("FOUNDERSHIP_ID_FORMAT")
    if now.tzinfo is None or w.verified_utc.tzinfo is None:
        raise CanaryHold("IDENTITY_TIMEZONE_MISSING")
    age = now - w.verified_utc
    if age < timedelta(seconds=0) or age > timedelta(minutes=15):
        raise CanaryHold("IDENTITY_WITNESS_STALE")
    if not (w.own_session_verified and w.founder_identity_verified and w.consented):
        raise CanaryHold("IDENTITY_OR_CONSENT_UNVERIFIED")
    actual = _digest(w.member_id.lower().encode("ascii"))
    if not re.fullmatch("[0-9a-fA-F]{64}", w.approved_member_hash):
        raise CanaryHold("IDENTITY_FINGERPRINT_INVALID")
    if not hmac.compare_digest(actual, w.approved_member_hash.lower()):
        raise CanaryHold("IDENTITY_FINGERPRINT_MISMATCH")


class FounderCanaryControl:
    """State machine for a single E010 founder, without a production adapter."""

    def __init__(self, runtime: FictionalRuntime):
        if not isinstance(runtime, FictionalRuntime):
            raise CanaryHold("ONLY_FICTIONAL_BACKEND_AVAILABLE")
        self.runtime = runtime

    def _preflight(self) -> None:
        r = self.runtime
        if r.source_sha != SOURCE_SHA or not r.prepared_manifest_ok:
            raise CanaryHold("SOURCE_OR_PREPARED_RECORD_DRIFT")
        if not (r.reader_image == r.prod_image == r.current_image ==
                r.candidate_image == IMAGE_ID and r.previous_image == PREVIOUS_IMAGE):
            raise CanaryHold("READER_IMAGE_CUSTODY_DRIFT")
        if r.migration_pending_count != 0:
            raise CanaryHold("PENDING_SCHEMA_MIGRATIONS")
        if r.available_bytes < MIN_AVAILABLE_BYTES:
            raise CanaryHold("DISK_BELOW_60_GIB")
        if r.studio_count != 35 or r.studio_restarting != 0:
            raise CanaryHold("WRITERS_STUDIO_HEALTH_DRIFT")
        if r.active_builders != 0:
            raise CanaryHold("COMPETING_BUILD")
        if not all(r.service_health.get(service) is True for service in REQUIRED_SERVICES):
            raise CanaryHold("CORE_SERVICE_HEALTH")

    @staticmethod
    def _ensure_unchanged_env(before: Dict[str, str], after: Dict[str, str]) -> None:
        unrelated_before = {k: v for k, v in before.items() if k not in (FLAG, ALLOW)}
        unrelated_after = {k: v for k, v in after.items() if k not in (FLAG, ALLOW)}
        if unrelated_before != unrelated_after:
            raise CanaryHold("UNRELATED_RUNTIME_ENV_CHANGED")

    def activate(self, witness: PrivateIdentityWitness, now: datetime) -> Tuple[ActiveCanary, Receipt]:
        _validate_witness(witness, now)
        r = self.runtime
        r.acquire()
        original: Optional[bytes] = None
        new_config: Optional[bytes] = None
        baseline_env: Dict[str, str] = {}
        backup_token: Optional[str] = None
        try:
            self._preflight()
            original = r.read_config()
            baseline_env = dict(r.runtime_env)
            if not original or b"\x00" in original or len(original) > 1024 * 1024:
                raise CanaryHold("CONFIG_FORMAT_OR_SIZE")
            if _is_flag_present(original) or FLAG in baseline_env or ALLOW in baseline_env:
                raise CanaryHold("REFLECT_ALREADY_CONFIGURED")
            backup_token = r.backup(original)
            if r.restore_backup(backup_token) != original:
                raise CanaryHold("BACKUP_INTEGRITY")
            prefix = b"" if original.endswith(b"\n") else b"\n"
            new_config = (original + prefix + (FLAG + "=true\n").encode()
                          + (ALLOW + "=" + witness.member_id.lower() + "\n").encode())
            r.write_config_atomically(new_config)
            r.recreate_reader(IMAGE_ID, no_build=True, no_pull=True, no_dependencies=True)
            self._preflight()
            if (r.runtime_env.get(FLAG) != "true"
                    or r.runtime_env.get(ALLOW) != witness.member_id.lower()):
                raise CanaryHold("EXACT_FOUNDER_FLAG_NOT_VERIFIED")
            if r.read_config() != new_config:
                raise CanaryHold("CONCURRENT_CONFIG_DRIFT")
            self._ensure_unchanged_env(baseline_env, r.runtime_env)
            return (ActiveCanary(backup_token, _digest(new_config),
                                 witness.member_id.lower(), baseline_env),
                    Receipt(phase="FICTIONAL_FOUNDER_ENABLED",
                            allowlist_count=1, reader_only_recreation=True,
                            rollback_custody_verified=True))
        except Exception as error:
            label = error.args[0] if isinstance(error, CanaryHold) else "UNEXPECTED_FAILURE"
            # An atomic rename may have committed even if its caller reported
            # an error before returning. Inspect disk BEFORE deciding to recover.
            # Never overwrite an unknown concurrent configuration change.
            if original is not None and backup_token is not None and new_config is not None:
                try:
                    observed = r.read_config()
                except Exception:
                    raise CanaryIncident("CONFIG_STATE_UNKNOWN_MANUAL_RECOVERY_REQUIRED")
                if observed not in (original, new_config):
                    raise CanaryIncident("CONFIG_DRIFT_MANUAL_RECOVERY_REQUIRED")
                need_recovery = (observed == new_config or
                                 FLAG in r.runtime_env or ALLOW in r.runtime_env)
                if need_recovery:
                    try:
                        if observed != original:
                            try:
                                r.write_config_atomically(original)
                            except Exception:
                                # A successful rename followed by an error is
                                # safe to continue ONLY when original is visible.
                                if r.read_config() != original:
                                    raise CanaryIncident("RECOVERY_WRITE_UNCERTAIN")
                        r.recreate_reader(IMAGE_ID, no_build=True, no_pull=True, no_dependencies=True)
                        if (r.read_config() != original or FLAG in r.runtime_env
                                or ALLOW in r.runtime_env):
                            raise CanaryIncident("RECOVERY_FLAG_OFF_UNVERIFIED")
                        self._ensure_unchanged_env(baseline_env, r.runtime_env)
                    except Exception:
                        raise CanaryIncident("RECOVERY_FAILED_STOP_AND_ESCALATE")
            raise CanaryHold(str(label))
        finally:
            r.release()

    def disable(self, active: ActiveCanary) -> Receipt:
        r = self.runtime
        r.acquire()
        try:
            self._preflight()
            current = r.read_config()
            if not hmac.compare_digest(_digest(current), active.authorized_config_hash):
                raise CanaryHold("CONFIG_DRIFT_REFUSE_RESTORE")
            if r.runtime_env.get(FLAG) != "true" or r.runtime_env.get(ALLOW) != active.private_member_id:
                raise CanaryHold("RUNTIME_IDENTITY_DRIFT")
            original = r.restore_backup(active.backup_token)
            if _is_flag_present(original):
                raise CanaryHold("BACKUP_NOT_REFLECT_OFF")
            try:
                r.write_config_atomically(original)
            except Exception:
                # If rename completed before the reported error, continue with
                # reader-only OFF recreation; otherwise stop as an incident.
                try:
                    if r.read_config() != original:
                        raise CanaryIncident("REVOKE_CONFIG_NOT_RESTORED")
                except Exception:
                    raise CanaryIncident("REVOKE_CONFIG_WRITE_UNCERTAIN")
            try:
                r.recreate_reader(IMAGE_ID, no_build=True, no_pull=True, no_dependencies=True)
                if (r.read_config() != original or FLAG in r.runtime_env
                        or ALLOW in r.runtime_env):
                    raise CanaryIncident("FLAG_OFF_UNVERIFIED")
                self._ensure_unchanged_env(active.baseline_env, r.runtime_env)
                self._preflight()
                return Receipt(phase="FICTIONAL_FOUNDER_DISABLED",
                               allowlist_count=0, reader_only_recreation=True,
                               rollback_custody_verified=True)
            except Exception:
                raise CanaryIncident("REVOKE_RECREATE_FAILED_STOP_AND_ESCALATE")
        finally:
            r.release()


def _fictional_smoke() -> None:
    """No network, Docker, HTTP, production paths, or personal information."""
    uuid = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
    now = datetime.now(timezone.utc)
    proof = PrivateIdentityWitness(
        member_id=uuid, approved_member_hash=_digest(uuid.encode()),
        own_session_verified=True, founder_identity_verified=True,
        consented=True, verified_utc=now)
    runtime = FictionalRuntime()
    ctrl = FounderCanaryControl(runtime)
    active, on = ctrl.activate(proof, now)
    off = ctrl.disable(active)
    assert on.allowlist_count == 1 and off.allowlist_count == 0
    assert runtime.config == b"NODE_ENV=production\nUNRELATED_SETTING=preserve\n"
    print("REFLECT_E010_FICTIONAL_ENABLE_DISABLE=PASS")
    print("PRODUCTION_ACTIONS=ZERO")


if __name__ == "__main__":
    import sys
    if sys.argv[1:] != ["--fictional-self-test"]:
        print("HOLD: Fictional-only control. Production activation is not implemented.")
        sys.exit(2)
    _fictional_smoke()
