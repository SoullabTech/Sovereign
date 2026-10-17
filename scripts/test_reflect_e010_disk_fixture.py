#!/usr/bin/env python3
"""Physical tempfile + real flock + atomic-rename acceptance; NO production I/O."""
import ast
from datetime import datetime, timedelta, timezone
import hashlib
import os
from pathlib import Path
import stat
import tempfile
import unittest

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, PREVIOUS_IMAGE, MIN_AVAILABLE_BYTES,
    CanaryHold, CanaryIncident, FounderCanaryControl, PrivateIdentityWitness,
)
from reflect_e010_disk_fixture import (
    MARKER_BYTES, MARKER_NAME, FictionalDiskRuntime, INITIAL_CONFIG,
    new_fictional_disk_runtime,
)

IDENTITY = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"


class FictionalDiskAcceptance(unittest.TestCase):
    def setUp(self):
        self.context = new_fictional_disk_runtime()
        self.r = self.context.__enter__()
        self.addCleanup(self.context.__exit__, None, None, None)
        self.ctrl = FounderCanaryControl(self.r)
        self.now = datetime(2026, 10, 17, 15, 0, tzinfo=timezone.utc)
        self.witness = PrivateIdentityWitness(
            member_id=IDENTITY,
            approved_member_hash=hashlib.sha256(IDENTITY.encode()).hexdigest(),
            own_session_verified=True,
            founder_identity_verified=True,
            consented=True,
            verified_utc=self.now,
        )

    def activate(self):
        return self.ctrl.activate(self.witness, self.now)

    def test_disk_fixture_on_off_original_bytes_restored(self):
        active, on = self.activate()
        self.assertEqual(on.allowlist_count, 1)
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG +
                         ("PRO_STUDIO_REFLECT_BETA_ENABLED=true\n"
                          "PRO_STUDIO_REFLECT_BETA_MEMBER_IDS=" + IDENTITY + "\n").encode())
        self.assertEqual(self.r.runtime_env[ALLOW], IDENTITY)
        self.assertEqual(self.r.runtime_env[FLAG], "true")
        backup = self.r.backup_dir / active.backup_token
        self.assertEqual(backup.read_bytes(), INITIAL_CONFIG)
        self.assertEqual(stat.S_IMODE(backup.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.r.config_path.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.r.backup_dir.stat().st_mode), 0o700)
        off = self.ctrl.disable(active)
        self.assertEqual(off.allowlist_count, 0)
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertNotIn(FLAG, self.r.runtime_env)
        self.assertNotIn(ALLOW, self.r.runtime_env)
        self.assertEqual(self.r.recreate_attempts, 2)
        self.assertEqual(self.r.calls.count("recreate_maia_reader_only_no_build_no_pull"), 2)
        self.assertEqual(self.r.previous_image, PREVIOUS_IMAGE)
        self.assertEqual(self.r.reader_image, IMAGE_ID)
        self.assertFalse(self.r.locked)

    def test_lock_is_real_exclusive_and_not_held_after(self):
        other = FictionalDiskRuntime(self.r.root)
        self.r.acquire()
        try:
            with self.assertRaisesRegex(CanaryHold, "RELEASE_LOCK_BUSY"):
                other.acquire()
        finally:
            self.r.release()
        other.acquire()
        other.release()

    def test_missing_fixture_marker_refused(self):
        (self.r.root / MARKER_NAME).unlink()
        with self.assertRaisesRegex(CanaryHold, "FICTIONAL_MARKER_MISSING"):
            self.activate()
        self.assertEqual(self.r.config_path.read_bytes(), INITIAL_CONFIG)

    def test_unsafe_root_refused(self):
        with tempfile.TemporaryDirectory(prefix="unrelated-") as d:
            with self.assertRaisesRegex(CanaryHold, "NOT_A_DISPOSABLE_FICTIONAL_ROOT"):
                FictionalDiskRuntime(Path(d))

    def test_symlink_config_refused(self):
        original = self.r.read_config()
        actual = self.r.root / "fictional-other"
        actual.write_bytes(original)
        self.r.config_path.unlink()
        self.r.config_path.symlink_to(actual)
        with self.assertRaisesRegex(CanaryHold, "FIXTURE_SYMLINK_OR_MISSING_FILE"):
            self.activate()
        self.assertEqual(actual.read_bytes(), original)

    def test_config_permission_drift_refused(self):
        os.chmod(self.r.config_path, 0o644)
        with self.assertRaisesRegex(CanaryHold, "FIXTURE_FILE_PERMISSIONS"):
            self.activate()

    def test_fixture_hardlinked_config_refused(self):
        other = self.r.root / "second-reference-to-config"
        os.link(str(self.r.config_path), str(other))
        with self.assertRaisesRegex(CanaryHold, "FIXTURE_HARDLINK_REFUSED"):
            self.activate()
        self.assertEqual(other.read_bytes(), INITIAL_CONFIG)

    def test_uncoordinated_disk_change_before_write_refused(self):
        # A noncooperating actor changes the disk after custody backup but
        # before the intended ON atomic swap. The control must not overwrite.
        original_backup = self.r.backup
        def concurrent_writer(content):
            token = original_backup(content)
            self.r.config_path.write_bytes(content + b"UNRELATED_CONCURRENT=1\n")
            return token
        self.r.backup = concurrent_writer
        with self.assertRaisesRegex(CanaryIncident, "CONFIG_DRIFT_MANUAL_RECOVERY_REQUIRED"):
            self.activate()
        self.assertIn(b"UNRELATED_CONCURRENT=1", self.r.read_config())
        self.assertNotIn(FLAG, self.r.runtime_env)
        self.assertFalse(self.r.locked)

    def test_unverified_identity_leaves_disk_untouched(self):
        from dataclasses import replace
        self.witness = replace(self.witness, member_id="11111111-2222-4333-8444-555555555555")
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_FINGERPRINT_MISMATCH"):
            self.activate()
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)

    def test_disk_below_floor_refuses_without_backup(self):
        self.r.available_bytes = MIN_AVAILABLE_BYTES-1
        with self.assertRaisesRegex(CanaryHold, "DISK_BELOW_60_GIB"):
            self.activate()
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertFalse(self.r.backup_dir.exists())

    def test_interruption_before_rename_preserves_original_without_recreate(self):
        self.r.fail_atomic_once = "before_replace"
        with self.assertRaisesRegex(CanaryHold, "FICTIONAL_INTERRUPTED_BEFORE_REPLACE"):
            self.activate()
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertEqual(self.r.recreate_attempts, 0)
        self.assertFalse(self.r.locked)
        self.assertEqual(list(self.r.root.glob(".reflect-fixture-atomic-*")), [])

    def test_interruption_after_rename_recovers_original_and_off(self):
        self.r.fail_atomic_once = "after_replace"
        with self.assertRaisesRegex(CanaryHold, "FICTIONAL_INTERRUPTED_AFTER_REPLACE"):
            self.activate()
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertNotIn(FLAG, self.r.runtime_env)
        self.assertNotIn(ALLOW, self.r.runtime_env)
        self.assertEqual(self.r.recreate_attempts, 1)
        self.assertFalse(self.r.locked)
        self.assertEqual(list(self.r.root.glob(".reflect-fixture-atomic-*")), [])

    def test_initial_reader_failure_restores_disk_and_runtime(self):
        self.r.fail_recreate_on.add(1)
        with self.assertRaisesRegex(CanaryHold, "RECREATE_FAILED"):
            self.activate()
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertNotIn(ALLOW, self.r.runtime_env)
        self.assertEqual(self.r.recreate_attempts, 2)

    def test_failed_recovery_emits_incident_and_preserves_original_disk(self):
        self.r.fail_recreate_on.update({1, 2})
        with self.assertRaisesRegex(CanaryIncident, "RECOVERY_FAILED_STOP_AND_ESCALATE"):
            self.activate()
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertFalse(self.r.locked)

    def test_concurrent_disk_write_during_recreate_refuses_overwrite(self):
        self.r.simulate_concurrent_disk_change = True
        with self.assertRaisesRegex(CanaryIncident, "CONFIG_DRIFT_MANUAL_RECOVERY_REQUIRED"):
            self.activate()
        self.assertIn(b"FICTIONAL_CONCURRENT_CHANGE=1", self.r.read_config())
        self.assertEqual(self.r.runtime_env[FLAG], "true")
        self.assertFalse(self.r.locked)

    def test_revoke_interruption_after_replace_completes_off(self):
        active, _ = self.activate()
        self.r.fail_atomic_once = "after_replace"
        result = self.ctrl.disable(active)
        self.assertEqual(result.phase, "FICTIONAL_FOUNDER_DISABLED")
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertNotIn(FLAG, self.r.runtime_env)

    def test_revoke_interruption_before_replace_requires_incident(self):
        active, _ = self.activate()
        self.r.fail_atomic_once = "before_replace"
        with self.assertRaisesRegex(CanaryIncident, "REVOKE_CONFIG_WRITE_UNCERTAIN"):
            self.ctrl.disable(active)
        self.assertEqual(self.r.runtime_env.get(FLAG), "true")
        self.assertIn(FLAG.encode(), self.r.read_config())
        self.assertFalse(self.r.locked)

    def test_backup_tamper_refuses_revocation_without_silent_success(self):
        active, _ = self.activate()
        b = self.r.backup_dir / active.backup_token
        b.write_bytes(b"FICTIONAL_TAMPER=1\n")
        with self.assertRaisesRegex(CanaryHold, "BACKUP_INTEGRITY"):
            self.ctrl.disable(active)
        self.assertEqual(self.r.runtime_env[FLAG], "true")
        self.assertFalse(self.r.locked)

    def test_missing_backup_requires_hold(self):
        active, _ = self.activate()
        (self.r.backup_dir / active.backup_token).unlink()
        with self.assertRaisesRegex(CanaryHold, "FIXTURE_SYMLINK_OR_MISSING_FILE"):
            self.ctrl.disable(active)
        self.assertEqual(self.r.runtime_env[FLAG], "true")

    def test_revoke_reader_failure_requires_incident(self):
        active, _ = self.activate()
        self.r.fail_recreate_on.add(2)
        with self.assertRaisesRegex(CanaryIncident, "REVOKE_RECREATE_FAILED_STOP_AND_ESCALATE"):
            self.ctrl.disable(active)
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        self.assertEqual(self.r.runtime_env[FLAG], "true")

    def test_fictional_implementation_imports_no_network_or_external_exec(self):
        file = Path(__file__).with_name("reflect_e010_disk_fixture.py")
        tree = ast.parse(file.read_text())
        imports = set()
        for n in ast.walk(tree):
            if isinstance(n, ast.Import):
                imports.update(alias.name.split(".")[0] for alias in n.names)
            if isinstance(n, ast.ImportFrom) and n.module:
                imports.add(n.module.split(".")[0])
        self.assertEqual(imports - {
            "__future__", "contextlib", "fcntl", "hashlib", "hmac", "os",
            "pathlib", "re", "stat", "tempfile", "typing",
            "reflect_e010_canary_control"
        }, set())
        self.assertNotIn("subprocess", file.read_text())
        self.assertNotIn("docker ", file.read_text().lower())
        self.assertNotIn("ssh ", file.read_text().lower())


if __name__ == "__main__":
    unittest.main()
