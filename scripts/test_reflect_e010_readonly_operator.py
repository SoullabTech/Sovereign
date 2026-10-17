#!/usr/bin/env python3
"""No-host E010 operator preflight contract tests: faux SSH, no network."""
from datetime import datetime, timedelta, timezone
import copy
import json
import subprocess
import unittest

from reflect_e010_canary_control import IMAGE_ID, PREVIOUS_IMAGE, SOURCE_SHA
from reflect_e010_readonly_operator import (
    KEYS, MANIFEST, ProbeHold, REMOTE_PROBE, SSH_DESTINATION,
    inspect, main, validate_metadata,
)

DEST = "soullab@100.119.226.84"
SAFE = {
    "utc": "",
    "host": "soullab",
    "root_fs": "/dev/nvme0n1p2",
    "source": SOURCE_SHA,
    "free_kib": 66_108_968,
    "reader_id": IMAGE_ID,
    "reader_stamp": "e010c0977",
    "image_roles": {
        "current": IMAGE_ID, "prod": IMAGE_ID, "previous": PREVIOUS_IMAGE,
        "candidate-e010c0977": IMAGE_ID,
    },
    "candidate_arch": "linux/amd64",
    "services": {
        "maia-sovereign": "running|healthy|0",
        "maia-api": "running|healthy|0",
        "maia-postgres": "running|healthy|0",
        "maia-summary-worker": "running|healthy|0",
    },
    "studio_count": 35,
    "studio_restarting": 0,
    "active_builders": 0,
    "lock_clear": True,
    "runtime_key_present": {k: False for k in KEYS},
    "config_key_present": {k: False for k in KEYS},
    "manifest": MANIFEST,
    "migration_source_count": 518,
    "migration_installed_count": 570,
    "migration_pending_count": 0,
}


class FakeRunner:
    def __init__(self, data, *, exit_code=0):
        self.data = data
        self.exit_code = exit_code
        self.calls = []

    def __call__(self, argv, **kwargs):
        self.calls.append((argv, kwargs))
        assert argv[0] == "ssh"
        assert argv[-2:] == ["python3", "-"]
        assert "-T" in argv and "BatchMode=yes" in argv
        assert "StrictHostKeyChecking=yes" in argv
        assert argv[-3] == DEST
        assert kwargs["input"] == REMOTE_PROBE
        assert kwargs["timeout"] <= 45
        return subprocess.CompletedProcess(
            argv, self.exit_code, stdout=json.dumps(self.data), stderr=""
        )


class ReadOnlyOperatorAcceptance(unittest.TestCase):
    def setUp(self):
        self.safe = copy.deepcopy(SAFE)
        self.safe["utc"] = datetime.now(timezone.utc).isoformat()

    def assert_refusal(self, code, edit):
        state = copy.deepcopy(self.safe)
        edit(state)
        with self.assertRaisesRegex(ProbeHold, code):
            validate_metadata(state)

    def test_realistic_metadata_pass(self):
        value = validate_metadata(self.safe)
        self.assertEqual(value["verdict"], "PASS_READ_ONLY")
        self.assertTrue(value["flag_off"])
        self.assertTrue(value["rollback_preserved"])
        self.assertNotIn("runtime_key_present", value)

    def test_fake_ssh_runs_only_fixed_readonly_probe(self):
        fake = FakeRunner(self.safe)
        receipt = inspect(DEST, runner=fake)
        self.assertEqual(receipt["verdict"], "PASS_READ_ONLY")
        self.assertEqual(len(fake.calls), 1)

    def test_refuses_missing_explicit_target(self):
        with self.assertRaisesRegex(ProbeHold, "TARGET_NOT_APPROVED"):
            inspect("", runner=FakeRunner(self.safe))

    def test_refuses_wrong_ssh_identity(self):
        with self.assertRaisesRegex(ProbeHold, "TARGET_NOT_APPROVED"):
            inspect("root@100.119.226.84", runner=FakeRunner(self.safe))

    def test_refuses_another_tailscale_ip_even_with_same_username(self):
        with self.assertRaisesRegex(ProbeHold, "TARGET_NOT_APPROVED"):
            inspect("soullab@100.120.100.90", runner=FakeRunner(self.safe))

    def test_refuses_non_tailscale_hostname(self):
        with self.assertRaisesRegex(ProbeHold, "TARGET_NOT_APPROVED"):
            inspect("soullab@example.com", runner=FakeRunner(self.safe))

    def test_refuses_remote_command_failed(self):
        with self.assertRaisesRegex(ProbeHold, "READ_ONLY_REMOTE_HOLD"):
            inspect(DEST, runner=FakeRunner(self.safe, exit_code=2))

    def test_refuses_invalid_json(self):
        def fake(argv, **kw):
            return subprocess.CompletedProcess(argv, 0, stdout="this-is-not-json", stderr="")
        with self.assertRaisesRegex(ProbeHold, "UNPARSABLE"):
            inspect(DEST, runner=fake)

    def test_refuses_extra_fields_including_potential_secrets(self):
        self.assert_refusal("RECEIPT_SHAPE",
                            lambda s: s.update({"member_id": "fictional"}))

    def test_refuses_missing_fields(self):
        self.assert_refusal("RECEIPT_SHAPE",
                            lambda s: s.pop("lock_clear"))

    def test_refuses_stale_observation(self):
        self.assert_refusal("STALE_OBSERVATION",
                            lambda s: s.update(utc=(datetime.now(timezone.utc) -
                                timedelta(minutes=3)).isoformat()))

    def test_refuses_missing_timezone(self):
        self.assert_refusal("STALE_OBSERVATION",
                            lambda s: s.update(utc=datetime.now().isoformat()))

    def test_refuses_wrong_host_hostname(self):
        self.assert_refusal("PRODUCTION_HOST_IDENTITY",
                            lambda s: s.update(host="unrelated-production"))

    def test_refuses_wrong_root_filesystem(self):
        self.assert_refusal("PRODUCTION_HOST_IDENTITY",
                            lambda s: s.update(root_fs="/dev/loop0"))

    def test_refuses_wrong_commit(self):
        self.assert_refusal("SOURCE_IDENTITY", lambda s: s.update(source="0"*40))

    def test_refuses_one_kib_below_sixty_gib(self):
        self.assert_refusal("DISK_FLOOR",
                            lambda s: s.update(free_kib=60*1024*1024-1))

    def test_exact_sixty_gib_is_hard_floor_and_ninety_is_advisory(self):
        self.safe["free_kib"] = 60*1024*1024
        self.assertEqual(validate_metadata(self.safe)["verdict"], "PASS_READ_ONLY")

    def test_refuses_wrong_running_image(self):
        self.assert_refusal("READER_CUSTODY",
                            lambda s: s.update(reader_id=PREVIOUS_IMAGE))

    def test_refuses_wrong_current_alias(self):
        self.assert_refusal("ROLE_CUSTODY",
                            lambda s: s["image_roles"].update(current=PREVIOUS_IMAGE))

    def test_refuses_wrong_previous_alias(self):
        self.assert_refusal("ROLE_CUSTODY",
                            lambda s: s["image_roles"].update(previous=IMAGE_ID))

    def test_refuses_wrong_architecture(self):
        self.assert_refusal("IMAGE_ARCHITECTURE",
                            lambda s: s.update(candidate_arch="linux/arm64"))

    def test_refuses_reader_restarting(self):
        self.assert_refusal("SERVICE_HEALTH_OR_RESTARTS",
                            lambda s: s["services"].update({"maia-sovereign": "running|healthy|1"}))

    def test_refuses_postgres_unhealthy(self):
        self.assert_refusal("SERVICE_HEALTH_OR_RESTARTS",
                            lambda s: s["services"].update({"maia-postgres": "running|unhealthy|0"}))

    def test_refuses_studio_count_drift(self):
        self.assert_refusal("STUDIO_COUNT_OR_RESTARTS",
                            lambda s: s.update(studio_count=34))

    def test_refuses_studio_restarting(self):
        self.assert_refusal("STUDIO_COUNT_OR_RESTARTS",
                            lambda s: s.update(studio_restarting=1))

    def test_refuses_active_buildkit(self):
        self.assert_refusal("COMPETING_BUILDER",
                            lambda s: s.update(active_builders=1))

    def test_refuses_locked_deploy(self):
        self.assert_refusal("DEPLOY_LOCK_BUSY",
                            lambda s: s.update(lock_clear=False))

    def test_refuses_unknown_lock_status(self):
        self.assert_refusal("DEPLOY_LOCK_BUSY",
                            lambda s: s.update(lock_clear=None))

    def test_refuses_existing_reflect_flag_in_config(self):
        self.assert_refusal("REFLECT_NOT_OFF",
                            lambda s: s["config_key_present"].update({
                                "PRO_STUDIO_REFLECT_BETA_ENABLED": True}))

    def test_refuses_existing_reflect_id_in_runtime(self):
        self.assert_refusal("REFLECT_NOT_OFF",
                            lambda s: s["runtime_key_present"].update({
                                "PRO_STUDIO_REFLECT_BETA_MEMBER_IDS": True}))

    def test_refuses_malformed_reflect_key_map(self):
        self.assert_refusal("REFLECT_NOT_OFF",
                            lambda s: s["config_key_present"].update({"EXTRA": False}))

    def test_refuses_wrong_manifest(self):
        self.assert_refusal("PREPARED_MANIFEST",
                            lambda s: s["manifest"].update(target_short_sha="WRONG"))

    def test_refuses_pending_migration(self):
        self.assert_refusal("MIGRATION_PARITY",
                            lambda s: s.update(migration_pending_count=1))

    def test_refuses_empty_migration_counts(self):
        self.assert_refusal("MIGRATION_PARITY",
                            lambda s: s.update(migration_source_count=0))

    def test_default_program_does_not_probe(self):
        self.assertEqual(main([]), 2)
        self.assertEqual(main(["--inspect-only"]), 2)

    def test_no_remote_mutation_tokens(self):
        # Exact script has no filesystem-changing, Docker create/restart,
        # account lookup or launch instruction. Plaintext env values are never
        # copied into the returned receipt.
        s = REMOTE_PROBE.lower()
        for action in (
            "docker rm", "docker tag", "docker run", "docker create",
            "docker compose", "git checkout", "git pull", "docker prune",
            "schema_migrations set", "update members", "delete from",
            "os.replace", "write_bytes", "open(\"w", "open('w",
        ):
            self.assertNotIn(action, s)


if __name__ == "__main__":
    unittest.main()
