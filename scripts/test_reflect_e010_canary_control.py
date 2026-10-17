#!/usr/bin/env python3
"""Network-free, fictional-only negative/positive acceptance of Reflect E010."""
from datetime import datetime, timedelta, timezone
import contextlib
import hashlib
import io
import unittest
from dataclasses import replace

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, MIN_AVAILABLE_BYTES, PREVIOUS_IMAGE, SOURCE_SHA,
    ActiveCanary, CanaryHold, CanaryIncident, FictionalRuntime,
    FounderCanaryControl, PrivateIdentityWitness, _fictional_smoke
)

FICTIONAL_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
SECOND_FICTIONAL_ID = "11111111-2222-4333-8444-555555555555"


class FounderCanaryFixtureTest(unittest.TestCase):
    def setUp(self):
        self.runtime = FictionalRuntime()
        self.control = FounderCanaryControl(self.runtime)
        self.now = datetime(2026, 10, 17, 15, tzinfo=timezone.utc)
        self.proof = PrivateIdentityWitness(
            member_id=FICTIONAL_ID,
            approved_member_hash=hashlib.sha256(FICTIONAL_ID.encode()).hexdigest(),
            own_session_verified=True,
            founder_identity_verified=True,
            consented=True,
            verified_utc=self.now,
        )
        self.original = bytes(self.runtime.config)

    def activate(self):
        return self.control.activate(self.proof, self.now)

    def assert_untouched(self):
        self.assertEqual(self.runtime.config, self.original)
        self.assertNotIn(FLAG, self.runtime.runtime_env)
        self.assertNotIn(ALLOW, self.runtime.runtime_env)
        self.assertEqual(self.runtime.recreate_attempts, 0)
        self.assertFalse(self.runtime.locked)

    def test_exact_founder_activation_and_reversible_disable(self):
        active, receipt = self.activate()
        self.assertEqual(receipt.phase, "FICTIONAL_FOUNDER_ENABLED")
        self.assertEqual(receipt.allowlist_count, 1)
        self.assertEqual(receipt.image_id, IMAGE_ID)
        self.assertEqual(receipt.source_sha, SOURCE_SHA)
        self.assertTrue(receipt.rollback_custody_verified)
        self.assertEqual(self.runtime.runtime_env[ALLOW], FICTIONAL_ID)
        self.assertEqual(self.runtime.runtime_env[FLAG], "true")
        self.assertIn(b"UNRELATED_SETTING=preserve", self.runtime.config)
        self.assertEqual(self.runtime.backups[active.backup_token][1], 0o600)
        self.assertEqual(self.runtime.backups[active.backup_token][0], self.original)
        disabled = self.control.disable(active)
        self.assertEqual(disabled.phase, "FICTIONAL_FOUNDER_DISABLED")
        self.assertEqual(disabled.allowlist_count, 0)
        self.assertEqual(self.runtime.config, self.original)
        self.assertNotIn(ALLOW, self.runtime.runtime_env)
        self.assertNotIn(FLAG, self.runtime.runtime_env)
        self.assertEqual(self.runtime.recreate_attempts, 2)
        self.assertFalse(self.runtime.locked)
        self.assertEqual(self.runtime.calls.count("recreate_maia_reader_only_no_build_no_pull"), 2)

    def test_private_objects_cannot_reveal_id_through_repr(self):
        active, _ = self.activate()
        self.assertNotIn(FICTIONAL_ID, repr(self.proof))
        self.assertNotIn(FICTIONAL_ID, repr(active))
        self.assertNotIn(FICTIONAL_ID, repr(self.runtime))

    def test_wrong_backend_is_rejected_even_for_fictional_witness(self):
        with self.assertRaisesRegex(CanaryHold, "ONLY_FICTIONAL_BACKEND_AVAILABLE"):
            FounderCanaryControl(object())

    def test_disabled_runtime_remains_closed_until_explicit_activation(self):
        self.assertNotIn(FLAG, self.runtime.runtime_env)
        self.assertNotIn(ALLOW, self.runtime.runtime_env)
        self.assertEqual(self.runtime.calls, [])

    def test_receipt_does_not_contain_id_or_account_data(self):
        _, receipt = self.activate()
        printable = str(receipt)
        self.assertNotIn(FICTIONAL_ID, printable)
        self.assertNotIn("member_id", printable)
        self.assertNotIn("email", printable.lower())

    def test_expired_identity_refused(self):
        self.proof = replace(self.proof, verified_utc=self.now-timedelta(minutes=16))
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_WITNESS_STALE"):
            self.activate()
        self.assert_untouched()

    def test_future_identity_refused(self):
        self.proof = replace(self.proof, verified_utc=self.now+timedelta(seconds=1))
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_WITNESS_STALE"):
            self.activate()
        self.assert_untouched()

    def test_unverified_session_refused(self):
        self.proof = replace(self.proof, own_session_verified=False)
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_OR_CONSENT_UNVERIFIED"):
            self.activate()
        self.assert_untouched()

    def test_unverified_founder_identity_refused(self):
        self.proof = replace(self.proof, founder_identity_verified=False)
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_OR_CONSENT_UNVERIFIED"):
            self.activate()
        self.assert_untouched()

    def test_missing_consent_refused(self):
        self.proof = replace(self.proof, consented=False)
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_OR_CONSENT_UNVERIFIED"):
            self.activate()
        self.assert_untouched()

    def test_nonmatching_member_id_fingerprint_refused(self):
        self.proof = replace(self.proof, member_id=SECOND_FICTIONAL_ID)
        with self.assertRaisesRegex(CanaryHold, "IDENTITY_FINGERPRINT_MISMATCH"):
            self.activate()
        self.assert_untouched()

    def test_unusable_member_identifier_refused(self):
        self.proof = replace(self.proof, member_id="*")
        with self.assertRaisesRegex(CanaryHold, "FOUNDERSHIP_ID_FORMAT"):
            self.activate()
        self.assert_untouched()

    def test_source_sha_drift_refused(self):
        self.runtime.source_sha = "0"*40
        with self.assertRaisesRegex(CanaryHold, "SOURCE_OR_PREPARED_RECORD_DRIFT"):
            self.activate()
        self.assert_untouched()

    def test_missing_prepared_custody_refused(self):
        self.runtime.prepared_manifest_ok = False
        with self.assertRaisesRegex(CanaryHold, "SOURCE_OR_PREPARED_RECORD_DRIFT"):
            self.activate()
        self.assert_untouched()

    def test_wrong_current_image_refused(self):
        self.runtime.current_image = PREVIOUS_IMAGE
        with self.assertRaisesRegex(CanaryHold, "READER_IMAGE_CUSTODY_DRIFT"):
            self.activate()
        self.assert_untouched()

    def test_wrong_rollback_image_refused(self):
        self.runtime.previous_image = IMAGE_ID
        with self.assertRaisesRegex(CanaryHold, "READER_IMAGE_CUSTODY_DRIFT"):
            self.activate()
        self.assert_untouched()

    def test_pending_migrations_refused(self):
        self.runtime.migration_pending_count = 1
        with self.assertRaisesRegex(CanaryHold, "PENDING_SCHEMA_MIGRATIONS"):
            self.activate()
        self.assert_untouched()

    def test_below_sixty_gib_refused(self):
        self.runtime.available_bytes = MIN_AVAILABLE_BYTES-1
        with self.assertRaisesRegex(CanaryHold, "DISK_BELOW_60_GIB"):
            self.activate()
        self.assert_untouched()

    def test_exact_sixty_gib_is_numerically_allowed(self):
        self.runtime.available_bytes = MIN_AVAILABLE_BYTES
        active, _ = self.activate()
        self.assertEqual(self.control.disable(active).allowlist_count, 0)

    def test_writer_count_drift_refused(self):
        self.runtime.studio_count = 34
        with self.assertRaisesRegex(CanaryHold, "WRITERS_STUDIO_HEALTH_DRIFT"):
            self.activate()
        self.assert_untouched()

    def test_writer_restarting_refused(self):
        self.runtime.studio_restarting = 1
        with self.assertRaisesRegex(CanaryHold, "WRITERS_STUDIO_HEALTH_DRIFT"):
            self.activate()
        self.assert_untouched()

    def test_unhealthy_database_refused(self):
        self.runtime.service_health["maia-postgres"] = False
        with self.assertRaisesRegex(CanaryHold, "CORE_SERVICE_HEALTH"):
            self.activate()
        self.assert_untouched()

    def test_active_builder_refused(self):
        self.runtime.active_builders = 1
        with self.assertRaisesRegex(CanaryHold, "COMPETING_BUILD"):
            self.activate()
        self.assert_untouched()

    def test_existing_lock_refused(self):
        self.runtime.competing_release_lock = True
        with self.assertRaisesRegex(CanaryHold, "RELEASE_LOCK_BUSY"):
            self.activate()
        self.assert_untouched()

    def test_existing_key_refused(self):
        self.runtime.config += b"PRO_STUDIO_REFLECT_BETA_ENABLED=false\n"
        self.original = bytes(self.runtime.config)
        with self.assertRaisesRegex(CanaryHold, "REFLECT_ALREADY_CONFIGURED"):
            self.activate()
        self.assert_untouched()

    def test_existing_exported_allowlist_refused(self):
        self.runtime.config += b" export PRO_STUDIO_REFLECT_BETA_MEMBER_IDS=fiction\n"
        self.original = bytes(self.runtime.config)
        with self.assertRaisesRegex(CanaryHold, "REFLECT_ALREADY_CONFIGURED"):
            self.activate()
        self.assert_untouched()

    def test_existing_runtime_allowlist_refused(self):
        self.runtime.runtime_env[ALLOW] = SECOND_FICTIONAL_ID
        with self.assertRaisesRegex(CanaryHold, "REFLECT_ALREADY_CONFIGURED"):
            self.activate()
        self.assertEqual(self.runtime.config, self.original)
        self.assertEqual(self.runtime.recreate_attempts, 0)
        self.assertFalse(self.runtime.locked)

    def test_first_recreate_failure_restores_off(self):
        self.runtime.fail_recreate_on.add(1)
        with self.assertRaisesRegex(CanaryHold, "RECREATE_FAILED"):
            self.activate()
        self.assertEqual(self.runtime.config, self.original)
        self.assertNotIn(FLAG, self.runtime.runtime_env)
        self.assertNotIn(ALLOW, self.runtime.runtime_env)
        self.assertEqual(self.runtime.recreate_attempts, 2)
        self.assertFalse(self.runtime.locked)

    def test_failed_recovery_escalates(self):
        self.runtime.fail_recreate_on.update({1,2})
        with self.assertRaisesRegex(CanaryIncident, "RECOVERY_FAILED_STOP_AND_ESCALATE"):
            self.activate()
        self.assertEqual(self.runtime.config, self.original)
        self.assertFalse(self.runtime.locked)

    def test_unexpected_runtime_env_change_triggers_recovery(self):
        self.runtime.inject_extra_runtime_key = True
        with self.assertRaises(CanaryIncident):
            self.activate()
        self.assertEqual(self.runtime.config, self.original)

    def test_concurrent_config_change_refuses_clobber_and_escalates(self):
        self.runtime.mutate_config_after_recreation = True
        with self.assertRaisesRegex(CanaryIncident, "CONFIG_DRIFT_MANUAL_RECOVERY_REQUIRED"):
            self.activate()
        self.assertIn(b"UNEXPECTED_CONCURRENT_CHANGE=yes", self.runtime.config)
        self.assertIn(FLAG, self.runtime.runtime_env)
        self.assertFalse(self.runtime.locked)

    def test_revoke_refuses_unrelated_config_changes(self):
        active, _ = self.activate()
        self.runtime.config += b"UNRELATED_ADMIN_SETTING=yes\n"
        with self.assertRaisesRegex(CanaryHold, "CONFIG_DRIFT_REFUSE_RESTORE"):
            self.control.disable(active)
        self.assertIn(ALLOW, self.runtime.runtime_env)
        self.assertFalse(self.runtime.locked)

    def test_revoke_refuses_wrong_member_runtime(self):
        active, _ = self.activate()
        self.runtime.runtime_env[ALLOW] = SECOND_FICTIONAL_ID
        with self.assertRaisesRegex(CanaryHold, "RUNTIME_IDENTITY_DRIFT"):
            self.control.disable(active)

    def test_revoke_refuses_missing_backup(self):
        active, _ = self.activate()
        del self.runtime.backups[active.backup_token]
        with self.assertRaisesRegex(CanaryHold, "BACKUP_MISSING"):
            self.control.disable(active)

    def test_revoke_restart_failure_requires_incident(self):
        active, _ = self.activate()
        self.runtime.fail_recreate_on.add(2)
        with self.assertRaisesRegex(CanaryIncident, "REVOKE_RECREATE_FAILED_STOP_AND_ESCALATE"):
            self.control.disable(active)

    def test_fictional_cli_smoke_discloses_no_member_id(self):
        output=io.StringIO()
        with contextlib.redirect_stdout(output):
            _fictional_smoke()
        self.assertIn("FICTIONAL_ENABLE_DISABLE=PASS", output.getvalue())
        self.assertIn("PRODUCTION_ACTIONS=ZERO", output.getvalue())
        self.assertNotIn(FICTIONAL_ID, output.getvalue())


if __name__ == "__main__":
    unittest.main()
