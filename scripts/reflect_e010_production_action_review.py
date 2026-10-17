#!/usr/bin/env python3
"""
Reflect E010 production-action ADAPTER CONTRACT — REVIEW ONLY.

A non-executable, immutable plan for a future independently authorized operator.
No shell, Docker, SSH, HTTP, filesystem write, production ID, or credential API.
Any attempt to execute fails closed. This is NOT a deployment recipe or backend.

The plan binds:
- the specific frozen E010 image and previous rollback image;
- one canonical privately witnessed UUID (never part of a public plan);
- only two environment keys and one reader container;
- the existing governed production release lock;
- separate, evidence-bearing emergency access denial below the disk floor;
- precise ON / emergency quarantine / OFF state distinctions.

No plan can declare production admission-ready until an independent, permitted,
user-present operator and verified emergency OFF procedure are supplied.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import FrozenSet, Optional, Tuple
import re

from reflect_e010_canary_control import (
    ALLOW, FLAG, IMAGE_ID, MIN_AVAILABLE_BYTES, PREVIOUS_IMAGE, SOURCE_SHA
)


class ActionHold(Exception):
    """Safe, fixed-code refusal; do not include real member or config values."""


class Operation(Enum):
    FOUNDER_ON = "FOUNDER_ON"
    NORMAL_OFF = "NORMAL_OFF"
    EMERGENCY_QUARANTINE = "EMERGENCY_QUARANTINE"


class Acceptance(Enum):
    REVIEW_ONLY = "REVIEW_ONLY"
    BLOCKED_PENDING_INDEPENDENT_OPERATOR = "BLOCKED_PENDING_INDEPENDENT_OPERATOR"


class ScenarioReadiness(Enum):
    NORMAL_OFF_PLAN_ONLY = "NORMAL_OFF_PLAN_ONLY"
    EMERGENCY_QUARANTINE_REVIEW_CANDIDATE = "EMERGENCY_QUARANTINE_REVIEW_CANDIDATE"
    EMERGENCY_FULL_OFF_REVIEW_CANDIDATE = "EMERGENCY_FULL_OFF_REVIEW_CANDIDATE"


class ReviewStep(Enum):
    REVALIDATE_FOUNDER_PRIVATELY = "REVALIDATE_FOUNDER_PRIVATELY"
    REVERIFY_E010_AND_ROLLBACK = "REVERIFY_E010_AND_ROLLBACK"
    REVERIFY_NO_RUNNING_RELEASE = "REVERIFY_NO_RUNNING_RELEASE"
    CONFIRM_EMERGENCY_SHUTOFF_PREAPPROVED = "CONFIRM_EMERGENCY_SHUTOFF_PREAPPROVED"
    ACQUIRE_GOVERNED_DEPLOY_LOCK = "ACQUIRE_GOVERNED_DEPLOY_LOCK"
    SNAPSHOT_RESTRICTED_ORIGINAL_CONFIG = "SNAPSHOT_RESTRICTED_ORIGINAL_CONFIG"
    ATOMICALLY_CONFIGURE_EXACT_ONE_FOUNDER = "ATOMICALLY_CONFIGURE_EXACT_ONE_FOUNDER"
    RECREATE_E010_MAIA_ONLY = "RECREATE_E010_MAIA_ONLY"
    VERIFY_FOUNDER_SAFARI_AND_OUTSIDER_DENIAL = "VERIFY_FOUNDER_SAFARI_AND_OUTSIDER_DENIAL"
    BEGIN_VERIFIED_EMERGENCY_INGRESS_QUARANTINE = "BEGIN_VERIFIED_EMERGENCY_INGRESS_QUARANTINE"
    VERIFY_EMERGENCY_SSR_RSC_CONTENT_DENIAL = "VERIFY_EMERGENCY_SSR_RSC_CONTENT_DENIAL"
    VERIFY_QUARANTINE_SURVIVES_READER_FAILURE = "VERIFY_QUARANTINE_SURVIVES_READER_FAILURE"
    RESTORE_PRIVATELY_CUSTODIED_CONFIG = "RESTORE_PRIVATELY_CUSTODIED_CONFIG"
    VERIFY_READER_ENV_OFF_AND_AUTHENTICATED_DENIAL = "VERIFY_READER_ENV_OFF_AND_AUTHENTICATED_DENIAL"
    RELEASE_LOCK_AND_REPORT_REDACTED_RECEIPT = "RELEASE_LOCK_AND_REPORT_REDACTED_RECEIPT"


STEPS = {
    Operation.FOUNDER_ON: (
        ReviewStep.REVALIDATE_FOUNDER_PRIVATELY,
        ReviewStep.REVERIFY_E010_AND_ROLLBACK,
        ReviewStep.REVERIFY_NO_RUNNING_RELEASE,
        ReviewStep.CONFIRM_EMERGENCY_SHUTOFF_PREAPPROVED,
        ReviewStep.ACQUIRE_GOVERNED_DEPLOY_LOCK,
        ReviewStep.SNAPSHOT_RESTRICTED_ORIGINAL_CONFIG,
        ReviewStep.ATOMICALLY_CONFIGURE_EXACT_ONE_FOUNDER,
        ReviewStep.RECREATE_E010_MAIA_ONLY,
        ReviewStep.VERIFY_FOUNDER_SAFARI_AND_OUTSIDER_DENIAL,
        ReviewStep.RELEASE_LOCK_AND_REPORT_REDACTED_RECEIPT,
    ),
    Operation.NORMAL_OFF: (
        ReviewStep.REVERIFY_E010_AND_ROLLBACK,
        ReviewStep.ACQUIRE_GOVERNED_DEPLOY_LOCK,
        ReviewStep.RESTORE_PRIVATELY_CUSTODIED_CONFIG,
        ReviewStep.RECREATE_E010_MAIA_ONLY,
        ReviewStep.VERIFY_READER_ENV_OFF_AND_AUTHENTICATED_DENIAL,
        ReviewStep.RELEASE_LOCK_AND_REPORT_REDACTED_RECEIPT,
    ),
    Operation.EMERGENCY_QUARANTINE: (
        ReviewStep.REVERIFY_E010_AND_ROLLBACK,
        ReviewStep.ACQUIRE_GOVERNED_DEPLOY_LOCK,
        ReviewStep.BEGIN_VERIFIED_EMERGENCY_INGRESS_QUARANTINE,
        ReviewStep.VERIFY_EMERGENCY_SSR_RSC_CONTENT_DENIAL,
        ReviewStep.VERIFY_QUARANTINE_SURVIVES_READER_FAILURE,
        ReviewStep.RELEASE_LOCK_AND_REPORT_REDACTED_RECEIPT,
    ),
}
MUTABLE_KEYS = frozenset((FLAG, ALLOW))
ONE_READER = ("maia-sovereign",)
LOCK_NAME = ".deploy.lock"
# Mandatory negative acceptance matrix for a future proven ingress DENY.
# These are test obligations, NOT an implemented Caddy match or permission.
EDGE_DENIAL_OBLIGATIONS = (
    "canonical_host_soullab.life",
    "www_or_alternate_host_redirects_checked",
    "exact_and_trailing_slash_reflect_path",
    "nested_reflect_path_and_query_parameters",
    "head_get_post_and_unexpected_methods",
    "next_rsc_flight_and_prefetch_requests",
    "direct_origin_bypass_and_existing_cdn_cache",
    "no_reflect_content_or_private_html_in_any_response",
    "no_store_including_browser_back_navigation",
    "sustains_denial_if_maia_reader_stays_on_or_fails",
)
UUID_CANONICAL = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


@dataclass(frozen=True)
class ReviewOnlyPlan:
    operation: Operation
    acceptance: Acceptance
    source_sha: str
    reader_image: str
    rollback_image: str
    planned_steps: Tuple[ReviewStep, ...]
    configured_keys: FrozenSet[str]
    affected_containers: Tuple[str, ...]
    mandatory_emergency_denial_review: Tuple[str, ...]
    release_lock: str
    no_build: bool
    no_pull: bool
    no_dependency_recreate: bool
    max_member_count: int
    disk_release_floor_bytes: int
    requires_independent_operator: bool
    requires_emergency_off_proof: bool
    permitted_live_execution: bool = False


def review_plan(operation: Operation) -> ReviewOnlyPlan:
    if not isinstance(operation, Operation):
        raise ActionHold("UNRECOGNIZED_OPERATION")
    plan = ReviewOnlyPlan(
        operation=operation,
        acceptance=Acceptance.BLOCKED_PENDING_INDEPENDENT_OPERATOR,
        source_sha=SOURCE_SHA,
        reader_image=IMAGE_ID,
        rollback_image=PREVIOUS_IMAGE,
        planned_steps=STEPS[operation],
        configured_keys=MUTABLE_KEYS if operation != Operation.EMERGENCY_QUARANTINE
                        else frozenset(),
        affected_containers=ONE_READER if operation != Operation.EMERGENCY_QUARANTINE
                            else tuple(),
        mandatory_emergency_denial_review=EDGE_DENIAL_OBLIGATIONS,
        release_lock=LOCK_NAME,
        no_build=True,
        no_pull=True,
        no_dependency_recreate=True,
        max_member_count=1,
        disk_release_floor_bytes=MIN_AVAILABLE_BYTES,
        requires_independent_operator=True,
        requires_emergency_off_proof=True,
    )
    assert_review_plan(plan)
    return plan


def assert_review_plan(plan: ReviewOnlyPlan) -> None:
    """Detect drift before a plan is handed to a separate independent reviewer."""
    if not isinstance(plan, ReviewOnlyPlan) or not isinstance(plan.operation, Operation):
        raise ActionHold("MALFORMED_REVIEW_PLAN")
    if (plan.source_sha != SOURCE_SHA or plan.reader_image != IMAGE_ID
            or plan.rollback_image != PREVIOUS_IMAGE):
        raise ActionHold("IMMUTABLE_RELEASE_DRIFT")
    if plan.planned_steps != STEPS[plan.operation]:
        raise ActionHold("UNEXPECTED_OPERATION_ORDER")
    if (plan.configured_keys != (
            MUTABLE_KEYS if plan.operation != Operation.EMERGENCY_QUARANTINE
            else frozenset())
            or plan.affected_containers != (
                ONE_READER if plan.operation != Operation.EMERGENCY_QUARANTINE
                else tuple())):
        raise ActionHold("UNAUTHORIZED_CHANGE_SCOPE")
    if plan.mandatory_emergency_denial_review != EDGE_DENIAL_OBLIGATIONS:
        raise ActionHold("EMERGENCY_INGRESS_COVERAGE_DRIFT")
    if (plan.release_lock != LOCK_NAME or plan.max_member_count != 1
            or plan.disk_release_floor_bytes != MIN_AVAILABLE_BYTES):
        raise ActionHold("AUTHORITY_OR_DISK_POLICY_DRIFT")
    if not (plan.no_build and plan.no_pull and plan.no_dependency_recreate
            and plan.requires_independent_operator
            and plan.requires_emergency_off_proof):
        raise ActionHold("MISSING_RELEASE_SAFEGUARD")
    if (plan.permitted_live_execution is not False
            or plan.acceptance != Acceptance.BLOCKED_PENDING_INDEPENDENT_OPERATOR):
        raise ActionHold("UNAUTHORIZED_EXECUTION_STATUS")


def is_exact_private_single_member(member_id: str, configured_member_ids: str) -> bool:
    """
    Confidential-context comparison ONLY; return a boolean, NEVER an ID.
    An independent authenticated provider must supply member_id. This function
    does not itself establish founder identity or permission.
    """
    return (
        isinstance(member_id, str)
        and isinstance(configured_member_ids, str)
        and UUID_CANONICAL.fullmatch(member_id) is not None
        and UUID_CANONICAL.fullmatch(configured_member_ids) is not None
        and configured_member_ids == member_id
    )


def emergency_policy_status(
    available_bytes: int,
    *,
    separately_approved_below_floor_denial: bool,
    independent_qualified_operator: bool,
    verified_emergency_ingress_and_rsc_coverage: bool,
    evidence_of_actual_running_reader_off: bool,
) -> ScenarioReadiness:
    """
    Hypothetical DOCUMENT review only. Never report an actual quarantine/OFF.
    Caller-provided booleans are NOT trusted security attestations and cannot
    authorize a privileged action or certify observed browser denial.
    """
    if isinstance(available_bytes, bool) or not isinstance(available_bytes, int):
        raise ActionHold("DISK_OBSERVATION_INVALID")
    if available_bytes < 0:
        raise ActionHold("DISK_OBSERVATION_INVALID")
    if available_bytes >= MIN_AVAILABLE_BYTES:
        # Ordinary OFF is still unimplemented; never infer revocation.
        return ScenarioReadiness.NORMAL_OFF_PLAN_ONLY
    if not (separately_approved_below_floor_denial
            and independent_qualified_operator
            and verified_emergency_ingress_and_rsc_coverage):
        raise ActionHold("EMERGENCY_BELOW_FLOOR_NOT_RATIFIED_OR_VERIFIED")
    if not evidence_of_actual_running_reader_off:
        # A proven ingress quarantine is useful but is NOT config/runtime OFF.
        return ScenarioReadiness.EMERGENCY_QUARANTINE_REVIEW_CANDIDATE
    # Still NOT a real OFF witness, even if all caller-provided booleans say so.
    return ScenarioReadiness.EMERGENCY_FULL_OFF_REVIEW_CANDIDATE


def execute(*_args, **_kwargs) -> None:
    """There is intentionally no live backend, local write, or execution path."""
    raise ActionHold("NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND")


def _main() -> int:
    print("REFLECT_E010_PRODUCTION_ACTION=REVIEW_ONLY_NO_EXECUTION")
    return 2


if __name__ == "__main__":
    raise SystemExit(_main())
