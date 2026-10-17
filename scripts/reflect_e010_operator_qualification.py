#!/usr/bin/env python3
"""Reflect E010 R2: production-operator qualification handoff, REVIEW ONLY.

This is an immutable, non-executable interface for a future *independently
permitted* production operator. It has no authority source, filesystem writer,
shell, network, Docker connector, member identity, or privileged operation.
A checked box, fabricated permit, test result, or approval message cannot
turn this packet into a production capability.

Do not extend this module with a live backend. Qualification and any eventual
implementation must be separately reviewed through an approved release path.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Tuple

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, MIN_AVAILABLE_BYTES, PREVIOUS_IMAGE, SOURCE_SHA,
)
from reflect_e010_production_action_review import (
    Acceptance, ActionHold, Operation, ReviewOnlyPlan,
    assert_review_plan, review_plan,
)


class Phase(str, Enum):
    BEFORE_ON = "BEFORE_ON"
    AFTER_ON = "AFTER_ON"
    REVOCATION = "REVOCATION"
    EMERGENCY = "EMERGENCY"


class Requirement(str, Enum):
    FOUNDER_SESSION_AND_EXPLICIT_CONSENT = "FOUNDER_SESSION_AND_EXPLICIT_CONSENT"
    EXACT_SHA_FOUNDER_REVIEW = "EXACT_SHA_FOUNDER_REVIEW"
    PERMITTED_EXECUTION_CHANNEL = "PERMITTED_EXECUTION_CHANNEL"
    TRUSTED_OPERATOR_AND_RELEASE_LOCK = "TRUSTED_OPERATOR_AND_RELEASE_LOCK"
    E010_IMAGE_ROLLBACK_AND_HEALTH = "E010_IMAGE_ROLLBACK_AND_HEALTH"
    PROTECTED_ORIGINAL_CONFIG_CUSTODY = "PROTECTED_ORIGINAL_CONFIG_CUSTODY"
    PREAPPROVED_LIVE_EMERGENCY_INGRESS = "PREAPPROVED_LIVE_EMERGENCY_INGRESS"
    LIVE_ORIGIN_RSC_FLIGHT_AND_CACHE_DENIAL = "LIVE_ORIGIN_RSC_FLIGHT_AND_CACHE_DENIAL"
    PRIVATE_EXACTLY_ONE_MEMBER = "PRIVATE_EXACTLY_ONE_MEMBER"
    READER_ONLY_NO_BUILD_NO_PULL = "READER_ONLY_NO_BUILD_NO_PULL"
    MAC_AND_PHYSICAL_IPHONE_SAFARI = "MAC_AND_PHYSICAL_IPHONE_SAFARI"
    UNAUTHORIZED_GUEST_AND_RSC_DENIAL = "UNAUTHORIZED_GUEST_AND_RSC_DENIAL"
    RESTORE_ORIGINAL_CONFIG_AND_RECREATE = "RESTORE_ORIGINAL_CONFIG_AND_RECREATE"
    FORMER_FOUNDER_DENIED_AT_RUNTIME = "FORMER_FOUNDER_DENIED_AT_RUNTIME"
    POST_ACTION_OBSERVATION = "POST_ACTION_OBSERVATION"
    LOW_DISK_EDGE_QUARANTINE = "LOW_DISK_EDGE_QUARANTINE"
    QUARANTINE_IS_NOT_RUNTIME_OFF = "QUARANTINE_IS_NOT_RUNTIME_OFF"


@dataclass(frozen=True)
class ReviewGate:
    requirement: Requirement
    phase: Phase


GATES: Tuple[ReviewGate, ...] = (
    ReviewGate(Requirement.FOUNDER_SESSION_AND_EXPLICIT_CONSENT, Phase.BEFORE_ON),
    ReviewGate(Requirement.EXACT_SHA_FOUNDER_REVIEW, Phase.BEFORE_ON),
    ReviewGate(Requirement.PERMITTED_EXECUTION_CHANNEL, Phase.BEFORE_ON),
    ReviewGate(Requirement.TRUSTED_OPERATOR_AND_RELEASE_LOCK, Phase.BEFORE_ON),
    ReviewGate(Requirement.E010_IMAGE_ROLLBACK_AND_HEALTH, Phase.BEFORE_ON),
    ReviewGate(Requirement.PROTECTED_ORIGINAL_CONFIG_CUSTODY, Phase.BEFORE_ON),
    ReviewGate(Requirement.PREAPPROVED_LIVE_EMERGENCY_INGRESS, Phase.BEFORE_ON),
    ReviewGate(Requirement.LIVE_ORIGIN_RSC_FLIGHT_AND_CACHE_DENIAL, Phase.BEFORE_ON),
    ReviewGate(Requirement.PRIVATE_EXACTLY_ONE_MEMBER, Phase.BEFORE_ON),
    ReviewGate(Requirement.READER_ONLY_NO_BUILD_NO_PULL, Phase.AFTER_ON),
    ReviewGate(Requirement.MAC_AND_PHYSICAL_IPHONE_SAFARI, Phase.AFTER_ON),
    ReviewGate(Requirement.UNAUTHORIZED_GUEST_AND_RSC_DENIAL, Phase.AFTER_ON),
    ReviewGate(Requirement.RESTORE_ORIGINAL_CONFIG_AND_RECREATE, Phase.REVOCATION),
    ReviewGate(Requirement.FORMER_FOUNDER_DENIED_AT_RUNTIME, Phase.REVOCATION),
    ReviewGate(Requirement.POST_ACTION_OBSERVATION, Phase.REVOCATION),
    ReviewGate(Requirement.LOW_DISK_EDGE_QUARANTINE, Phase.EMERGENCY),
    ReviewGate(Requirement.QUARANTINE_IS_NOT_RUNTIME_OFF, Phase.EMERGENCY),
)
OPERATIONS = (
    Operation.FOUNDER_ON, Operation.NORMAL_OFF, Operation.EMERGENCY_QUARANTINE
)
KEYS = frozenset((FLAG, ALLOW))
READER = ("maia-sovereign",)


@dataclass(frozen=True)
class OperatorHandoff:
    source_sha: str
    reader_image: str
    rollback_image: str
    keys: frozenset
    reader_containers: Tuple[str, ...]
    member_cardinality: int
    release_floor_bytes: int
    operations: Tuple[ReviewOnlyPlan, ...]
    unverified_gates: Tuple[ReviewGate, ...]
    independent_permit_verified: bool = False
    production_execution_enabled: bool = False
    result: str = "HOLD_NO_PERMITTED_OPERATOR"


def prepare_review_only_handoff() -> OperatorHandoff:
    """Return the exact scope and open obligations; accept NO caller assertions."""
    handoff = OperatorHandoff(
        source_sha=SOURCE_SHA, reader_image=IMAGE_ID,
        rollback_image=PREVIOUS_IMAGE, keys=KEYS,
        reader_containers=READER, member_cardinality=1,
        release_floor_bytes=MIN_AVAILABLE_BYTES,
        operations=tuple(review_plan(op) for op in OPERATIONS),
        unverified_gates=GATES,
    )
    assert_review_only_handoff(handoff)
    return handoff


def assert_review_only_handoff(handoff: OperatorHandoff) -> None:
    """Fail closed on mutation, omitted gates, broader scope, or false approval."""
    if type(handoff) is not OperatorHandoff:
        raise ActionHold("HANDOFF_TYPE_DRIFT")
    if (handoff.source_sha != SOURCE_SHA or handoff.reader_image != IMAGE_ID
            or handoff.rollback_image != PREVIOUS_IMAGE):
        raise ActionHold("IMMUTABLE_RELEASE_DRIFT")
    if (type(handoff.keys) is not frozenset or handoff.keys != KEYS
            or type(handoff.reader_containers) is not tuple
            or handoff.reader_containers != READER
            or type(handoff.member_cardinality) is not int
            or handoff.member_cardinality != 1
            or type(handoff.release_floor_bytes) is not int
            or handoff.release_floor_bytes != MIN_AVAILABLE_BYTES):
        raise ActionHold("OPERATOR_SCOPE_DRIFT")
    if (type(handoff.operations) is not tuple
            or len(handoff.operations) != len(OPERATIONS)):
        raise ActionHold("OPERATIONS_DRIFT")
    for actual, op in zip(handoff.operations, OPERATIONS):
        assert_review_plan(actual)
        if actual != review_plan(op):
            raise ActionHold("OPERATIONS_DRIFT")
        if actual.acceptance != Acceptance.BLOCKED_PENDING_INDEPENDENT_OPERATOR:
            raise ActionHold("UNAUTHORIZED_ACCEPTANCE")
    if (type(handoff.unverified_gates) is not tuple
            or handoff.unverified_gates != GATES):
        raise ActionHold("MISSING_OR_REORDERED_GATE")
    if (handoff.independent_permit_verified is not False
            or handoff.production_execution_enabled is not False
            or handoff.result != "HOLD_NO_PERMITTED_OPERATOR"):
        raise ActionHold("FALSE_RELEASE_AUTHORIZATION")


def public_review_summary(handoff: OperatorHandoff) -> dict:
    """Redacted review summary. No member ID, environment value, or permit."""
    assert_review_only_handoff(handoff)
    return {
        "result": handoff.result,
        "source_sha": SOURCE_SHA,
        "reader_image": IMAGE_ID,
        "rollback_image": PREVIOUS_IMAGE,
        "configured_key_names_only": sorted(KEYS),
        "affected_reader_only": list(READER),
        "max_member_count": 1,
        "disk_floor_gib": 60,
        "operations": [op.value for op in OPERATIONS],
        "requirements_unverified": [
            {"phase": gate.phase.value, "requirement": gate.requirement.value}
            for gate in GATES
        ],
        "production_execution_enabled": False,
        "operator_permit_present": False,
        "emergency_quarantine_does_not_prove_runtime_off": True,
    }


def execute(*_args, **_kwargs) -> None:
    """Intentionally impossible: no permit trust root or mutation backend."""
    raise ActionHold("NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND")


def main() -> int:
    # Deliberately no argument parsing, no host, no shell, no loading any file.
    print("REFLECT_E010_OPERATOR_QUALIFICATION=HOLD_REVIEW_ONLY")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
