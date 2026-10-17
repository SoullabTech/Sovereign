#!/usr/bin/env python3
"""Nonexecuting production-action scope / emergency review tests."""
from dataclasses import replace
import ast
from pathlib import Path
import subprocess
import sys
import unittest

from reflect_e010_canary_control import ALLOW, FLAG, IMAGE_ID, MIN_AVAILABLE_BYTES, PREVIOUS_IMAGE, SOURCE_SHA
from reflect_e010_production_action_review import (
    Acceptance, ActionHold, MUTABLE_KEYS, ONE_READER, Operation, ReviewStep,
    STEPS, ScenarioReadiness, assert_review_plan, emergency_policy_status,
    execute, is_exact_private_single_member, review_plan,
)

FICTIONAL_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
OTHER_ID = "11111111-2222-4333-8444-555555555555"


class ProductionActionReviewTests(unittest.TestCase):
    def test_exact_source_and_immutable_review_only_scope(self):
        for op in Operation:
            p = review_plan(op)
            self.assertEqual(p.source_sha, SOURCE_SHA)
            self.assertEqual(p.reader_image, IMAGE_ID)
            self.assertEqual(p.rollback_image, PREVIOUS_IMAGE)
            self.assertEqual(p.acceptance, Acceptance.BLOCKED_PENDING_INDEPENDENT_OPERATOR)
            self.assertFalse(p.permitted_live_execution)
            self.assertEqual(p.max_member_count, 1)
            self.assertEqual(p.planned_steps, STEPS[op])
            self.assertEqual(p.disk_release_floor_bytes, MIN_AVAILABLE_BYTES)
            self.assertTrue(p.requires_emergency_off_proof)
            self.assertTrue(p.requires_independent_operator)
            self.assertTrue(p.no_build and p.no_pull and p.no_dependency_recreate)
            assert_review_plan(p)

    def test_single_founder_on_requires_private_witness_backup_first(self):
        p = review_plan(Operation.FOUNDER_ON)
        self.assertEqual(p.configured_keys, frozenset((FLAG, ALLOW)))
        self.assertEqual(p.affected_containers, ("maia-sovereign",))
        self.assertIn(ReviewStep.REVALIDATE_FOUNDER_PRIVATELY, p.planned_steps)
        self.assertIn(ReviewStep.CONFIRM_EMERGENCY_SHUTOFF_PREAPPROVED, p.planned_steps)
        self.assertLess(p.planned_steps.index(ReviewStep.SNAPSHOT_RESTRICTED_ORIGINAL_CONFIG),
                        p.planned_steps.index(ReviewStep.ATOMICALLY_CONFIGURE_EXACT_ONE_FOUNDER))
        self.assertLess(p.planned_steps.index(ReviewStep.RECREATE_E010_MAIA_ONLY),
                        p.planned_steps.index(ReviewStep.VERIFY_FOUNDER_SAFARI_AND_OUTSIDER_DENIAL))

    def test_normal_off_never_grants_access(self):
        p = review_plan(Operation.NORMAL_OFF)
        self.assertEqual(p.configured_keys, MUTABLE_KEYS)
        self.assertEqual(p.affected_containers, ONE_READER)
        self.assertNotIn(ReviewStep.ATOMICALLY_CONFIGURE_EXACT_ONE_FOUNDER, p.planned_steps)
        self.assertLess(p.planned_steps.index(ReviewStep.RESTORE_PRIVATELY_CUSTODIED_CONFIG),
                        p.planned_steps.index(ReviewStep.RECREATE_E010_MAIA_ONLY))
        self.assertLess(p.planned_steps.index(ReviewStep.RECREATE_E010_MAIA_ONLY),
                        p.planned_steps.index(ReviewStep.VERIFY_READER_ENV_OFF_AND_AUTHENTICATED_DENIAL))

    def test_emergency_quarantine_does_not_claim_runtime_off(self):
        p = review_plan(Operation.EMERGENCY_QUARANTINE)
        self.assertEqual(p.configured_keys, frozenset())
        self.assertEqual(p.affected_containers, ())
        self.assertIn(ReviewStep.VERIFY_EMERGENCY_SSR_RSC_CONTENT_DENIAL, p.planned_steps)
        self.assertIn(ReviewStep.VERIFY_QUARANTINE_SURVIVES_READER_FAILURE, p.planned_steps)
        self.assertNotIn(ReviewStep.RECREATE_E010_MAIA_ONLY, p.planned_steps)

    def test_refuses_unrecognized_action(self):
        with self.assertRaisesRegex(ActionHold, "UNRECOGNIZED_OPERATION"):
            review_plan("FOUNDER_ON")

    def test_refuses_changed_image_or_source(self):
        p = review_plan(Operation.FOUNDER_ON)
        for changes in ({"source_sha": "0"*40}, {"reader_image": PREVIOUS_IMAGE},
                        {"rollback_image": IMAGE_ID}):
            with self.assertRaisesRegex(ActionHold, "IMMUTABLE_RELEASE_DRIFT"):
                assert_review_plan(replace(p, **changes))

    def test_refuses_unreviewed_order_or_broader_changes(self):
        p = review_plan(Operation.FOUNDER_ON)
        with self.assertRaisesRegex(ActionHold, "UNEXPECTED_OPERATION_ORDER"):
            assert_review_plan(replace(p, planned_steps=p.planned_steps[:-1]))
        for changes in ({"affected_containers": ("maia-sovereign", "maia-postgres")},
                        {"configured_keys": frozenset((FLAG, ALLOW, "DATABASE_URL"))}):
            with self.assertRaisesRegex(ActionHold, "UNAUTHORIZED_CHANGE_SCOPE"):
                assert_review_plan(replace(p, **changes))

    def test_refuses_expanded_cardinality_or_downgraded_gate(self):
        p = review_plan(Operation.FOUNDER_ON)
        for changes in ({"max_member_count": 2}, {"release_lock": "other.lock"},
                        {"disk_release_floor_bytes": 0}):
            with self.assertRaisesRegex(ActionHold, "AUTHORITY_OR_DISK_POLICY_DRIFT"):
                assert_review_plan(replace(p, **changes))
        for flag in ("no_build", "no_pull", "no_dependency_recreate",
                     "requires_independent_operator", "requires_emergency_off_proof"):
            with self.assertRaisesRegex(ActionHold, "MISSING_RELEASE_SAFEGUARD"):
                assert_review_plan(replace(p, **{flag: False}))
        with self.assertRaisesRegex(ActionHold, "UNAUTHORIZED_EXECUTION_STATUS"):
            assert_review_plan(replace(p, permitted_live_execution=True))

    def test_private_exact_one_uuid_only(self):
        self.assertTrue(is_exact_private_single_member(FICTIONAL_ID, FICTIONAL_ID))
        for bad in (OTHER_ID, "*", "", FICTIONAL_ID+","+OTHER_ID,
                    OTHER_ID+","+FICTIONAL_ID, " "+FICTIONAL_ID,
                    FICTIONAL_ID+" ", FICTIONAL_ID.upper(), "not-a-uuid"):
            with self.subTest(fake_prefix=bad[:4]):
                self.assertFalse(is_exact_private_single_member(FICTIONAL_ID, bad))

    def test_low_disk_breakglass_requires_all_separate_capabilities(self):
        base = dict(separately_approved_below_floor_denial=True,
                    independent_qualified_operator=True,
                    verified_emergency_ingress_and_rsc_coverage=True,
                    evidence_of_actual_running_reader_off=False)
        for key in ("separately_approved_below_floor_denial",
                    "independent_qualified_operator",
                    "verified_emergency_ingress_and_rsc_coverage"):
            opts = dict(base)
            opts[key] = False
            with self.assertRaisesRegex(ActionHold, "EMERGENCY_BELOW_FLOOR"):
                emergency_policy_status(MIN_AVAILABLE_BYTES-1, **opts)

    def test_emergency_matrix_includes_rsc_origin_and_browser_caches(self):
        p = review_plan(Operation.EMERGENCY_QUARANTINE)
        scope = p.mandatory_emergency_denial_review
        self.assertIn("next_rsc_flight_and_prefetch_requests", scope)
        self.assertIn("direct_origin_bypass_and_existing_cdn_cache", scope)
        self.assertIn("no_store_including_browser_back_navigation", scope)
        self.assertIn("sustains_denial_if_maia_reader_stays_on_or_fails", scope)

    def test_emergency_matrix_cannot_be_relaxed(self):
        p = review_plan(Operation.EMERGENCY_QUARANTINE)
        with self.assertRaisesRegex(ActionHold, "EMERGENCY_INGRESS_COVERAGE_DRIFT"):
            assert_review_plan(replace(p, mandatory_emergency_denial_review=(
                "only_top_level_get",)))

    def test_no_actual_off_result_from_hypothetical_booleans(self):
        opts = dict(separately_approved_below_floor_denial=True,
                    independent_qualified_operator=True,
                    verified_emergency_ingress_and_rsc_coverage=True)
        self.assertEqual(emergency_policy_status(
            MIN_AVAILABLE_BYTES-1, evidence_of_actual_running_reader_off=False,
            **opts), ScenarioReadiness.EMERGENCY_QUARANTINE_REVIEW_CANDIDATE)
        self.assertEqual(emergency_policy_status(
            MIN_AVAILABLE_BYTES-1, evidence_of_actual_running_reader_off=True,
            **opts), ScenarioReadiness.EMERGENCY_FULL_OFF_REVIEW_CANDIDATE)
        self.assertEqual(emergency_policy_status(
            MIN_AVAILABLE_BYTES, evidence_of_actual_running_reader_off=False,
            **opts), ScenarioReadiness.NORMAL_OFF_PLAN_ONLY)
        self.assertFalse(hasattr(ScenarioReadiness, "OFF_VERIFIED"))

    def test_negative_or_boolean_disk_refused(self):
        opts = dict(separately_approved_below_floor_denial=True,
                    independent_qualified_operator=True,
                    verified_emergency_ingress_and_rsc_coverage=True,
                    evidence_of_actual_running_reader_off=False)
        for bad in (-1, True, False, None, "0"):
            with self.assertRaisesRegex(ActionHold, "DISK_OBSERVATION_INVALID"):
                emergency_policy_status(bad, **opts)

    def test_execute_never_accepts_any_plan(self):
        for op in Operation:
            with self.assertRaisesRegex(ActionHold, "NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND"):
                execute(review_plan(op))

    def test_default_cli_refuses(self):
        child = subprocess.run(
            [sys.executable, str(Path(__file__).with_name("reflect_e010_production_action_review.py"))],
            capture_output=True, text=True, timeout=8)
        self.assertEqual(child.returncode, 2)
        self.assertIn("REVIEW_ONLY_NO_EXECUTION", child.stdout)
        self.assertNotIn(FICTIONAL_ID, child.stdout + child.stderr)

    def test_no_ssh_docker_filesystem_or_network_imports(self):
        code = Path(__file__).with_name("reflect_e010_production_action_review.py")
        imports = set()
        for n in ast.walk(ast.parse(code.read_text())):
            if isinstance(n, ast.Import):
                imports.update(x.name.split(".")[0] for x in n.names)
            elif isinstance(n, ast.ImportFrom) and n.module:
                imports.add(n.module.split(".")[0])
        self.assertFalse(imports & {"subprocess", "os", "socket", "requests", "docker",
                                    "pathlib", "paramiko", "httpx", "urllib"})


if __name__ == "__main__":
    unittest.main()
