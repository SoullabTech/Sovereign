#!/usr/bin/env python3
"""R2 operator-handoff contract: fictional/isolated review, no live backend."""
import ast
from dataclasses import replace
import json
from pathlib import Path
import subprocess
import sys
import unittest

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, MIN_AVAILABLE_BYTES, PREVIOUS_IMAGE, SOURCE_SHA,
)
from reflect_e010_production_action_review import (
    Acceptance, ActionHold, Operation, review_plan,
)
from reflect_e010_operator_qualification import (
    GATES, KEYS, OPERATIONS, READER, OperatorHandoff, Phase, Requirement,
    assert_review_only_handoff, execute, prepare_review_only_handoff,
    public_review_summary,
)


class OperatorQualificationReviewTests(unittest.TestCase):
    def setUp(self):
        self.packet = prepare_review_only_handoff()

    def test_exact_e010_identity(self):
        p = self.packet
        self.assertEqual((p.source_sha, p.reader_image, p.rollback_image),
                         (SOURCE_SHA, IMAGE_ID, PREVIOUS_IMAGE))
        self.assertEqual(p.keys, frozenset((FLAG, ALLOW)))
        self.assertEqual(p.reader_containers, ("maia-sovereign",))
        self.assertEqual(p.release_floor_bytes, MIN_AVAILABLE_BYTES)
        self.assertEqual(p.member_cardinality, 1)
        self.assertEqual(p.result, "HOLD_NO_PERMITTED_OPERATOR")
        assert_review_only_handoff(p)

    def test_exact_three_operations_are_review_only(self):
        self.assertEqual(OPERATIONS, (
            Operation.FOUNDER_ON, Operation.NORMAL_OFF,
            Operation.EMERGENCY_QUARANTINE))
        self.assertEqual(self.packet.operations,
                         tuple(review_plan(op) for op in OPERATIONS))
        self.assertTrue(all(x.acceptance ==
                            Acceptance.BLOCKED_PENDING_INDEPENDENT_OPERATOR
                            for x in self.packet.operations))
        self.assertTrue(all(not x.permitted_live_execution
                            for x in self.packet.operations))

    def test_unverified_requirements_span_pre_on_revocation_and_emergency(self):
        phases = {g.phase for g in GATES}
        self.assertEqual(phases, set(Phase))
        byname = {g.requirement for g in GATES}
        for need in (
                Requirement.FOUNDER_SESSION_AND_EXPLICIT_CONSENT,
                Requirement.PERMITTED_EXECUTION_CHANNEL,
                Requirement.PREAPPROVED_LIVE_EMERGENCY_INGRESS,
                Requirement.LIVE_ORIGIN_RSC_FLIGHT_AND_CACHE_DENIAL,
                Requirement.PROTECTED_ORIGINAL_CONFIG_CUSTODY,
                Requirement.MAC_AND_PHYSICAL_IPHONE_SAFARI,
                Requirement.UNAUTHORIZED_GUEST_AND_RSC_DENIAL,
                Requirement.FORMER_FOUNDER_DENIED_AT_RUNTIME,
                Requirement.LOW_DISK_EDGE_QUARANTINE,
                Requirement.QUARANTINE_IS_NOT_RUNTIME_OFF):
            self.assertIn(need, byname)
        self.assertEqual(len(GATES), len(set(GATES)))

    def test_no_review_packet_can_accept_an_asserted_permit(self):
        for mutations in (
            {"independent_permit_verified": True},
            {"production_execution_enabled": True},
            {"result": "GO"},
            {"result": "OFF_VERIFIED"},
        ):
            with self.subTest(mutations=mutations), self.assertRaisesRegex(
                    ActionHold, "FALSE_RELEASE_AUTHORIZATION"):
                assert_review_only_handoff(replace(self.packet, **mutations))

    def test_missing_or_reordered_external_evidence_gates_refused(self):
        for modified in (GATES[:-1], tuple(reversed(GATES)), tuple(), GATES + GATES[:1]):
            with self.subTest(gates=len(modified)), self.assertRaisesRegex(
                    ActionHold, "MISSING_OR_REORDERED_GATE"):
                assert_review_only_handoff(replace(self.packet,
                                                  unverified_gates=modified))

    def test_unexpected_runtime_scope_and_cardinality_refused(self):
        for field, value in (
            ("keys", frozenset({FLAG, ALLOW, "DATABASE_URL"})),
            ("keys", frozenset({FLAG})),
            ("keys", set((FLAG, ALLOW))),
            ("reader_containers", ("maia-sovereign", "maia-postgres")),
            ("reader_containers", ["maia-sovereign"]),
            ("member_cardinality", 2),
            ("member_cardinality", True),
            ("release_floor_bytes", 0),
            ("release_floor_bytes", True),
        ):
            with self.subTest(field=field, value=str(value)[:16]):
                with self.assertRaisesRegex(ActionHold, "OPERATOR_SCOPE_DRIFT"):
                    assert_review_only_handoff(replace(self.packet, **{field: value}))

    def test_exact_source_and_image_rejected_on_mismatch(self):
        for key, bad in (
            ("source_sha", "0" * 40),
            ("reader_image", PREVIOUS_IMAGE),
            ("rollback_image", IMAGE_ID)
        ):
            with self.subTest(key=key), self.assertRaisesRegex(
                    ActionHold, "IMMUTABLE_RELEASE_DRIFT"):
                assert_review_only_handoff(replace(self.packet, **{key: bad}))

    def test_operations_cannot_change_or_be_skipped(self):
        variations = (
            self.packet.operations[:-1],
            self.packet.operations[::-1],
            (review_plan(Operation.FOUNDER_ON),) * 3,
            "FOUNDER_ON",
        )
        for bad in variations:
            with self.subTest(type=type(bad).__name__), self.assertRaises(ActionHold):
                assert_review_only_handoff(replace(self.packet, operations=bad))

    def test_non_handoff_objects_refused(self):
        with self.assertRaisesRegex(ActionHold, "HANDOFF_TYPE_DRIFT"):
            assert_review_only_handoff({"operator": "trusted"})

    def test_public_summary_has_no_identity_or_env_value(self):
        data = public_review_summary(self.packet)
        encoded = json.dumps(data, sort_keys=True)
        self.assertEqual(data["result"], "HOLD_NO_PERMITTED_OPERATOR")
        self.assertFalse(data["production_execution_enabled"])
        self.assertFalse(data["operator_permit_present"])
        self.assertEqual(data["configured_key_names_only"], sorted((FLAG, ALLOW)))
        self.assertEqual(data["affected_reader_only"], ["maia-sovereign"])
        self.assertEqual(data["max_member_count"], 1)
        self.assertEqual(len(data["requirements_unverified"]), len(GATES))
        for forbidden in ("DATABASE_URL", "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
                          "password=", "permit_token=", "OFF_VERIFIED", '"GO"'):
            self.assertNotIn(forbidden, encoded)

    def test_changed_public_packet_is_refused(self):
        with self.assertRaisesRegex(ActionHold, "FALSE_RELEASE_AUTHORIZATION"):
            public_review_summary(replace(self.packet, production_execution_enabled=True))

    def test_public_contract_never_accepts_caller_evidence(self):
        with self.assertRaises(TypeError):
            prepare_review_only_handoff(user_approved=True)
        with self.assertRaises(TypeError):
            prepare_review_only_handoff(member_id="fictional")
        with self.assertRaises(TypeError):
            prepare_review_only_handoff(operator_permit="self-attested")

    def test_live_execute_always_blocks_even_when_forged(self):
        for op in (None, "FOUNDER_ON", self.packet,
                   {"verified": True, "backend": "prod"}):
            with self.subTest(typ=type(op).__name__), self.assertRaisesRegex(
                    ActionHold, "NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND"):
                execute(op)

    def test_cli_exits_hold_without_accepting_input(self):
        path = Path(__file__).with_name("reflect_e010_operator_qualification.py")
        p = subprocess.run([sys.executable, str(path)],
                           capture_output=True, text=True, timeout=10)
        self.assertEqual(p.returncode, 2)
        self.assertEqual(p.stdout.strip(),
                         "REFLECT_E010_OPERATOR_QUALIFICATION=HOLD_REVIEW_ONLY")
        self.assertEqual(p.stderr, "")

    def test_review_module_imports_no_mutation_or_transport_api(self):
        path = Path(__file__).with_name("reflect_e010_operator_qualification.py")
        tree = ast.parse(path.read_text())
        imports = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.update(x.name.split(".")[0] for x in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module:
                imports.add(node.module.split(".")[0])
        self.assertFalse(imports & {
            "os", "pathlib", "subprocess", "socket", "requests",
            "paramiko", "docker", "httpx", "urllib", "shutil",
        })
        callnames = {n.func.id for n in ast.walk(tree)
                     if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)}
        self.assertFalse(callnames & {"open", "exec", "eval", "compile"})


if __name__ == "__main__":
    unittest.main()
