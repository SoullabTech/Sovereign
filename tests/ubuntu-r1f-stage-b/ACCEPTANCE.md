# Ubuntu R1F Stage B — isolated preparation

Status: PREPARED-ONLY / NO POSTGRESQL EXECUTION / NO SERVICE TEST / NO MERGE.
Authorization: founder approved preparation of an isolated branch and disposable fictional test environment, not access to real Circle databases or member accounts.

## Provenance

Repository: SoullabTech/Sovereign. New branch is pinned to canonical source commit
81ae1edfe592fedac43e458245944e4dd33e9a41, NOT the moving default branch.
Ubuntu article was merged in PR #1851 but is not separately ratified.
Circle synthesis acceptance issue #1853 and constitutional custody #1854 remain open.
The separate Map-Stacking PR #1856 is not within this source scope.

Pinned source Git blobs:
- lib/circles/circleAccess.ts: b5c786068fff63feb716c79636ce3dafe663dfb5
- lib/circles/inquiryService.ts: 7d61d9fb563ae248a5873451d4e643fd35d83292
- scripts/verify-constitution-circles.ts: 83310de0ba371ab90feaf9045d2e9278da7c83bf
- app/api/circles/[circleId]/inquiries/[inquiryId]/close/route.ts: 8c09243738b17b8b335369c15473f0ae2a98f0db
- lib/circles/sharingService.ts: b178306dfc755c4cdc6d20462c712cbaf1007caf
- lib/circles/consentService.ts: 2d882dea50f827a67b504ce00480eb5ecf0e4301
- 20260907000001_circle_inquiry_response_withdrawal.sql: d40ad6ec7c4e84b9165d369f9cb8c83fb94a7d74

## Prepared items

- preflight.mjs — pure configuration refusal; no DB, DNS, app imports or network.
- preflight.test.mjs — named negative safety tests using Node's built-in test framework.
- compose.preparation.yaml — static preflight only, with network_mode:none, no database service/dependency, and one read-only file mount.
- compose.db-proposal.yaml — separate unexecuted PostgreSQL plan with a different profile, internal-only network, no published ports, tmpfs and required image digest.
- compose.policy.test.py — offline structural YAML and adversarial-mutation safety checks; no Docker, sockets, SQL or source service.
- init/01-fixture-attestation.sql — unexecuted fictional fixture identity and restricted test role.
- acceptance.manifest.json — separate source/fixture expected outcomes.

Important: Docker, PostgreSQL and app dependencies are not available in the preparing workspace. Both Compose files are DESIGN/READY-TO-REVIEW candidates, not proof images ran, tmpfs was mounted, airgap was enforced, or the server became reachable. Static environment strings and a SQL attestation row cannot themselves prove a disposable network. Image digests, volumes, UID permissions, Docker network, DB host, actual schema and cleanup require an independent witness BEFORE connection or testing.

## Existing verifier is NOT an execution recipe

scripts/verify-constitution-circles.ts defaults DATABASE_URL to a local potentially real database.
Its Group S enumerates actual active Circle memberships and attempts an application write
outside the rolled-back Group T transaction. DO NOT RUN THAT SCRIPT IN THIS PREPARATION.
Do not point any test at localhost, production, staging-real, NAS, backups, or a real member database.

## Required source-service Stage B tests (not yet run)

B01 Nonmember/founder gate: source remains founder-only until separately ruled.
B02 Fictional 3+ members with distinct perceptions; one dissent, one silence.
B03 While open, independent response visibility and membership scoping.
B04 After close, silent-member visibility is POLICY OPEN, not secretly modified.
B05 not_now blocks personal artifact share; typed inquiry response is a separate consent question.
B06 Close with no synthesis writes NULL.
B07 EXPECTED RED: direct POST of non-null fieldSynthesis is accepted by baseline.
B08 EXPECTED RED: withdrawing text does not by itself invalidate a separately stored synthesis.
B09 Both listInquiries and getInquiryWithResponses must suppress revoked derivatives under a future separately approved corrected contract; baseline is not known to satisfy this.
B10 Leave/removal cascade, no cross-Circle leakage.
B11 Named coverage floor: missing/warn/skip/fail must fail.
B12 Confirm cleanup, image/source provenance and zero real host or vendor side effects.

Red baseline observations MUST NOT be reported as passing safety tests. No automated fix to production, dynamic reinterpretation of existing Circle Doctrine, or real member pilot is part of this branch.

## Separate authority still required

Actual PostgreSQL container creation/pull/build; migrations; source-service tests; code patches; network access; member beta admission; canonical merge; constitutional ratification; release. Each requires a specifically bounded founder decision and appropriate review/rollback/erasure custody. A general “continue” or a passing STATIC preflight is not enough.

## Safety correction — separate static preflight from future PostgreSQL

The prior preparation YAML declared PostgreSQL and preflight in the same profile and included a `depends_on: pg-fixture` dependency. Running the preflight Compose profile could therefore start a PostgreSQL service despite preflight-only authority. It also mounted the whole repository read-only, potentially exposing unrelated local `.env` material; read-only does NOT provide confidentiality.

The static preflight now lives alone in `compose.preparation.yaml`, has `network_mode: none`, has no `depends_on`, and mounts ONLY `preflight.mjs`. The future PostgreSQL plan is a separate `compose.db-proposal.yaml` file with an unrelated profile. Neither Docker profile has been started; runtime image digests, UID compatibility, network isolation and data cleanup remain unverified.

Offline reproducibility: `node --test tests/ubuntu-r1f-stage-b/preflight.test.mjs` and `python3 tests/ubuntu-r1f-stage-b/compose.policy.test.py` (the latter uses PyYAML). Both are static preparation, not actual Circle behavior. Do not claim that a parsed Compose file proves any Docker or PostgreSQL isolation property.

Do not start either Compose profile, source service, or database without independent, exact-scope execution authority.
