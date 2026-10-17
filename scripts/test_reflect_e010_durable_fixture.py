#!/usr/bin/env python3
"""Founder E010 fictional-only journal crash/restart and OFF recovery tests."""
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import unittest

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, PREVIOUS_IMAGE, SOURCE_SHA, CanaryHold,
    CanaryIncident, PrivateIdentityWitness,
)
from reflect_e010_disk_fixture import FictionalDiskRuntime, INITIAL_CONFIG, new_fictional_disk_runtime
from reflect_e010_durable_fixture import (
    DurableFictionalCanary, JOURNAL, SimulatedPowerLoss,
)

ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
OTHER = "11111111-2222-4333-8444-555555555555"
TIME = datetime(2026, 10, 17, 15, 0, tzinfo=timezone.utc)
PROOF = PrivateIdentityWitness(
    member_id=ID, approved_member_hash=hashlib.sha256(ID.encode()).hexdigest(),
    own_session_verified=True, founder_identity_verified=True,
    consented=True, verified_utc=TIME
)


class DurableFictionalTests(unittest.TestCase):
    def setUp(self):
        self.factory = new_fictional_disk_runtime()
        self.r = self.factory.__enter__()
        self.addCleanup(self.factory.__exit__, None, None, None)
        self.root = self.r.root
        self.operator = DurableFictionalCanary(self.r)

    def reload(self):
        return DurableFictionalCanary(FictionalDiskRuntime(self.root))

    def journal(self):
        return self.root / JOURNAL

    def assert_off(self, op):
        self.assertEqual(op.r.read_config(), INITIAL_CONFIG)
        self.assertNotIn(FLAG, op.r.runtime_env)
        self.assertNotIn(ALLOW, op.r.runtime_env)
        self.assertEqual(op.r.reader_image, IMAGE_ID)
        self.assertEqual(op.r.previous_image, PREVIOUS_IMAGE)
        self.assertFalse(op.r.locked)
        self.assertEqual(op._read_journal()["phase"], "OFF_VERIFIED")

    def test_activate_then_fresh_process_recovers_off(self):
        on = self.operator.activate(PROOF, TIME)
        self.assertEqual(on.allowlist_count, 1)
        self.assertIn(FLAG, self.r.runtime_env)
        fresh = self.reload()
        self.assertEqual(fresh.r.runtime_env[ALLOW], ID)
        off = fresh.recover_off()
        self.assertEqual(off.allowlist_count, 0)
        self.assert_off(fresh)
        self.assertEqual(self.reload().recover_off().phase, "FICTIONAL_DURABLE_OFF_VERIFIED")

    def test_private_journal_has_no_member_id_or_original_config(self):
        self.operator.activate(PROOF, TIME)
        raw = self.journal().read_bytes()
        self.assertNotIn(ID.encode(), raw)
        self.assertNotIn(INITIAL_CONFIG, raw)
        self.assertNotIn(b"UNRELATED_SETTING", raw)
        self.assertNotIn(b"true\n", raw)
        self.assertEqual(stat.S_IMODE(self.journal().stat().st_mode), 0o600)
        self.assertEqual(json.loads(raw)["phase"], "ON_VERIFIED")

    def test_duplicate_activation_is_refused_even_on_restart(self):
        self.operator.activate(PROOF, TIME)
        fresh = self.reload()
        with self.assertRaisesRegex(CanaryHold, "SINGLE_CANARY_ALREADY_STARTED"):
            fresh.activate(PROOF, TIME)
        self.assertIn(FLAG, fresh.r.runtime_env)
        fresh.recover_off()
        with self.assertRaisesRegex(CanaryHold, "SINGLE_CANARY_ALREADY_STARTED"):
            self.reload().activate(PROOF, TIME)

    def test_missing_journal_off_recovery_refused(self):
        with self.assertRaisesRegex(CanaryHold, "NO_DURABLE_INTENT"):
            self.operator.recover_off()
        self.assertFalse(self.journal().exists())
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)

    def test_stale_identity_does_not_write_intent(self):
        from dataclasses import replace
        from datetime import timedelta
        stale = replace(PROOF, verified_utc=TIME-timedelta(minutes=30))
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_WITNESS_STALE"):
            self.operator.activate(stale, TIME)
        self.assertFalse(self.journal().exists())

    def test_wrong_founder_never_writes_intent(self):
        from dataclasses import replace
        other = replace(PROOF, member_id=OTHER)
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_FINGERPRINT_MISMATCH"):
            self.operator.activate(other, TIME)
        self.assertFalse(self.journal().exists())

    def test_persistence_after_simulated_crashes_during_enable(self):
        for stage in ("intent", "config_on", "reader_on", "on_verified"):
            with self.subTest(stage=stage), new_fictional_disk_runtime() as r:
                op = DurableFictionalCanary(r, crash_at=stage)
                with self.assertRaises(SimulatedPowerLoss):
                    op.activate(PROOF, TIME)
                recovered = DurableFictionalCanary(FictionalDiskRuntime(r.root))
                off = recovered.recover_off()
                self.assertEqual(off.allowlist_count, 0)
                self.assertEqual(recovered.r.read_config(), INITIAL_CONFIG)
                self.assertNotIn(FLAG, recovered.r.runtime_env)
                self.assertNotIn(ALLOW, recovered.r.runtime_env)
                self.assertEqual(recovered._read_journal()["phase"], "OFF_VERIFIED")

    def test_persistence_after_simulated_crashes_during_disable(self):
        for stage in ("off_intent", "config_off", "reader_off", "off_verified"):
            with self.subTest(stage=stage), new_fictional_disk_runtime() as r:
                DurableFictionalCanary(r).activate(PROOF, TIME)
                op = DurableFictionalCanary(FictionalDiskRuntime(r.root), crash_at=stage)
                with self.assertRaises(SimulatedPowerLoss):
                    op.recover_off()
                final = DurableFictionalCanary(FictionalDiskRuntime(r.root))
                self.assertEqual(final.recover_off().allowlist_count, 0)
                self.assertEqual(final.r.read_config(), INITIAL_CONFIG)
                self.assertNotIn(FLAG, final.r.runtime_env)
                self.assertEqual(final._read_journal()["phase"], "OFF_VERIFIED")

    def test_real_process_exit_during_enable_restored_by_new_interpreter(self):
        # Child exits via os._exit(77), bypassing Python finally handlers.
        # Only a marked, random, owner-only fictional temp path is passed.
        script = (
            "import os,sys,hashlib\n"
            "from datetime import datetime,timezone\n"
            "from pathlib import Path\n"
            "from reflect_e010_canary_control import PrivateIdentityWitness\n"
            "from reflect_e010_disk_fixture import FictionalDiskRuntime\n"
            "from reflect_e010_durable_fixture import DurableFictionalCanary\n"
            "uid='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'\n"
            "proof=PrivateIdentityWitness(uid,hashlib.sha256(uid.encode()).hexdigest(),"
            "True,True,True,datetime(2026,10,17,15,tzinfo=timezone.utc))\n"
            "op=DurableFictionalCanary(FictionalDiskRuntime(Path(sys.argv[1])))\n"
            "def sudden(phase):\n"
            " if phase == sys.argv[2]:os._exit(77)\n"
            "op._checkpoint=sudden\n"
            "op.activate(proof,datetime(2026,10,17,15,tzinfo=timezone.utc))\n"
            "os._exit(0)\n"
        )
        for stage in ("intent", "config_on", "reader_on", "on_verified"):
            with self.subTest(stage=stage), new_fictional_disk_runtime() as r:
                child = subprocess.run(
                    [sys.executable, "-c", script, str(r.root), stage],
                    cwd=str(Path(__file__).parent),
                    env={"PATH": os.environ.get("PATH", ""),
                         "PYTHONPATH": str(Path(__file__).parent)},
                    capture_output=True, text=True, timeout=12,
                )
                self.assertEqual(child.returncode, 77)
                self.assertNotIn(ID, child.stdout + child.stderr)
                recovered = DurableFictionalCanary(FictionalDiskRuntime(r.root))
                self.assertEqual(recovered.recover_off().allowlist_count, 0)
                self.assertEqual(recovered.r.read_config(), INITIAL_CONFIG)
                self.assertNotIn(FLAG, recovered.r.runtime_env)

    def test_real_process_exit_during_disable_restored_by_new_interpreter(self):
        script = (
            "import os,sys\nfrom pathlib import Path\n"
            "from reflect_e010_disk_fixture import FictionalDiskRuntime\n"
            "from reflect_e010_durable_fixture import DurableFictionalCanary\n"
            "op=DurableFictionalCanary(FictionalDiskRuntime(Path(sys.argv[1])))\n"
            "def sudden(phase):\n"
            " if phase == sys.argv[2]:os._exit(77)\n"
            "op._checkpoint=sudden\n"
            "op.recover_off()\n"
            "os._exit(0)\n"
        )
        for stage in ("off_intent", "config_off", "reader_off", "off_verified"):
            with self.subTest(stage=stage), new_fictional_disk_runtime() as r:
                DurableFictionalCanary(r).activate(PROOF, TIME)
                child = subprocess.run(
                    [sys.executable, "-c", script, str(r.root), stage],
                    cwd=str(Path(__file__).parent),
                    env={"PATH": os.environ.get("PATH", ""),
                         "PYTHONPATH": str(Path(__file__).parent)},
                    capture_output=True, text=True, timeout=12,
                )
                self.assertEqual(child.returncode, 77)
                recovered = DurableFictionalCanary(FictionalDiskRuntime(r.root))
                self.assertEqual(recovered.recover_off().allowlist_count, 0)
                self.assertEqual(recovered.r.read_config(), INITIAL_CONFIG)
                self.assertNotIn(FLAG, recovered.r.runtime_env)

    def test_backup_tampering_holds_without_false_recovery(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        rec = r._read_journal()
        (r.r.backup_dir / rec["backup_token"]).write_bytes(b"FICTIONAL_TAMPER\n")
        with self.assertRaisesRegex(CanaryIncident, "DURABLE_BACKUP_INTEGRITY_FAILURE"):
            r.recover_off()
        self.assertIn(FLAG, r.r.runtime_env)

    def test_journal_tampering_holds(self):
        self.operator.activate(PROOF, TIME)
        self.journal().write_text('{"phase":"OFF_VERIFIED"}')
        with self.assertRaisesRegex(CanaryIncident, "DURABLE_JOURNAL_CORRUPT_MANUAL_HOLD"):
            self.reload().recover_off()

    def test_journal_symlink_holds(self):
        self.operator.activate(PROOF, TIME)
        path = self.journal()
        target = self.r.root / "unrelated-file"
        target.write_text(path.read_text())
        path.unlink()
        path.symlink_to(target)
        with self.assertRaises(CanaryHold):
            self.reload().recover_off()

    def test_unknown_config_change_never_overwritten(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        r.r.config_path.write_bytes(r.r.read_config()+b"OTHER_ADMIN_CHANGE=1\n")
        with self.assertRaisesRegex(CanaryIncident, "UNKNOWN_CONFIG_DRIFT_MANUAL_HOLD"):
            r.recover_off()
        self.assertIn(b"OTHER_ADMIN_CHANGE=1", r.r.config_path.read_bytes())

    def test_unknown_runtime_member_never_overwritten(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        r.r.runtime_env[ALLOW] = OTHER
        with self.assertRaisesRegex(CanaryIncident, "UNKNOWN_RUNTIME_ALLOWLIST_MANUAL_HOLD"):
            r.recover_off()
        self.assertEqual(r.r.read_config().count(FLAG.encode()), 1)

    def test_drift_in_other_runtime_env_holds(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        r.r.runtime_env["UNRELATED_SETTING"] = "UNEXPECTED"
        with self.assertRaisesRegex(CanaryIncident, "UNRELATED_RUNTIME_ENV_DRIFT"):
            r.recover_off()

    def test_source_or_image_drift_refused(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        r.r.current_image = PREVIOUS_IMAGE
        with self.assertRaisesRegex(CanaryHold, "READER_IMAGE_CUSTODY_DRIFT"):
            r.recover_off()

    def test_below_floor_during_recovery_holds(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        r.r.available_bytes = 60*1024**3-1
        with self.assertRaisesRegex(CanaryHold, "DISK_BELOW_60_GIB"):
            r.recover_off()

    def test_crash_recovery_rejects_failed_reader_recreate(self):
        self.operator.activate(PROOF, TIME)
        r = self.reload()
        r.r.fail_recreate_on.add(1)
        with self.assertRaisesRegex(CanaryHold, "RECREATE_FAILED"):
            r.recover_off()
        self.assertEqual(r.r.read_config(), INITIAL_CONFIG)
        # Since the fictional reader recreation failed, its persisted runtime
        # remains ON; no false claim that withdrawal succeeded.
        self.assertEqual(r.r.runtime_env[FLAG], "true")
        self.assertEqual(r._read_journal()["phase"], "OFF_INTENT")
        next_process = self.reload()
        self.assertEqual(next_process.recover_off().allowlist_count, 0)
        self.assert_off(next_process)

    def test_atomic_failure_before_replace_is_recoverable(self):
        self.r.fail_atomic_once = "before_replace"
        with self.assertRaisesRegex(CanaryHold, "FICTIONAL_INTERRUPTED_BEFORE_REPLACE"):
            self.operator.activate(PROOF, TIME)
        self.assert_off(self.reload())

    def test_atomic_failure_after_replace_is_recoverable(self):
        self.r.fail_atomic_once = "after_replace"
        with self.assertRaisesRegex(CanaryHold, "FICTIONAL_INTERRUPTED_AFTER_REPLACE"):
            self.operator.activate(PROOF, TIME)
        self.assert_off(self.reload())

    def test_activation_recreate_failure_recovers_off(self):
        self.r.fail_recreate_on.add(1)
        with self.assertRaisesRegex(CanaryHold, "RECREATE_FAILED"):
            self.operator.activate(PROOF, TIME)
        self.assert_off(self.reload())

    def test_failed_activation_and_failed_recovery_resumes_after_restart(self):
        self.r.fail_recreate_on.update({1, 2})
        with self.assertRaisesRegex(CanaryIncident, "ACTIVATION_FAILED_RECOVERY_INCOMPLETE"):
            self.operator.activate(PROOF, TIME)
        self.assertEqual(self.r.read_config(), INITIAL_CONFIG)
        fresh = self.reload()
        self.assertEqual(fresh.recover_off().allowlist_count, 0)
        self.assert_off(fresh)

    def test_journal_bad_permissions_refuse_recovery(self):
        self.operator.activate(PROOF, TIME)
        os.chmod(str(self.journal()), 0o644)
        with self.assertRaisesRegex(CanaryHold, "FIXTURE_FILE_PERMISSIONS"):
            self.reload().recover_off()

    def test_journal_extra_field_even_with_recomputed_digest_refused(self):
        self.operator.activate(PROOF, TIME)
        record = json.loads(self.journal().read_text())
        record["unexpected_addition"] = True
        # Even correct-appearing hash does not allow an unknown journal schema.
        data = (json.dumps(record, sort_keys=True, separators=(",", ":")) + "\n")
        self.journal().write_text(data)
        with self.assertRaisesRegex(CanaryIncident, "DURABLE_JOURNAL_CORRUPT_MANUAL_HOLD"):
            self.reload().recover_off()

    def test_persisted_reader_state_image_drift_fails_restart(self):
        self.operator.activate(PROOF, TIME)
        state = self.r.runtime_state_path
        record = json.loads(state.read_text())
        record["image"] = PREVIOUS_IMAGE
        state.write_text(json.dumps(record, sort_keys=True)+"\n")
        with self.assertRaisesRegex(CanaryHold, "FICTIONAL_READER_STATE_INVALID"):
            FictionalDiskRuntime(self.r.root)

    def test_uncoordinated_reader_state_writer_is_not_overwritten(self):
        # Another actor writes an unexpected reader environment while the
        # cooperative operator is holding its separate fictional release lock.
        state = self.r.runtime_state_path
        self.r.acquire()
        try:
            existing = json.loads(state.read_text())
            existing["env"]["UNRELATED_SETTING"] = "UNEXPECTED"
            state.write_text(json.dumps(existing, sort_keys=True)+"\n")
            self.r.config = self.r.read_config()
            with self.assertRaisesRegex(CanaryHold, "FICTIONAL_READER_CONCURRENT_STATE_DRIFT"):
                self.r.recreate_reader(IMAGE_ID, no_build=True, no_pull=True,
                                       no_dependencies=True)
            self.assertIn("UNEXPECTED", state.read_text())
        finally:
            self.r.release()

    def test_missing_disk_backup_refuses_unsafe_recovery(self):
        self.operator.activate(PROOF, TIME)
        fresh = self.reload()
        record = fresh._read_journal()
        (fresh.r.backup_dir / record["backup_token"]).unlink()
        with self.assertRaisesRegex(CanaryHold, "FIXTURE_SYMLINK_OR_MISSING_FILE"):
            fresh.recover_off()
        self.assertIn(FLAG, fresh.r.runtime_env)

    def test_default_durable_module_cli_refuses_action(self):
        target = str(Path(__file__).with_name("reflect_e010_durable_fixture.py"))
        child = subprocess.run([sys.executable, target],
                               capture_output=True, text=True, timeout=8)
        self.assertEqual(child.returncode, 2)
        self.assertIn("No production activation entrypoint", child.stdout)
        self.assertNotIn(ID, child.stdout + child.stderr)

    def test_receipt_does_not_contain_identity_or_custody_tokens(self):
        on = self.operator.activate(PROOF, TIME)
        self.assertNotIn(ID, repr(on))
        self.assertNotIn("private-fixture-backup", repr(on))
        off = self.reload().recover_off()
        self.assertNotIn(ID, repr(off))
        self.assertNotIn("backup_token", repr(off))


if __name__ == "__main__":
    unittest.main()
