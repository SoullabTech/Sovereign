# PRODUCTION-DEPLOYMENT-CONTRACT-01

**Status:** RATIFIED OPERATIONAL CONTRACT
**Purpose:** Keep production deployment evidence compact, repeatable, and recovery-first.

This contract does not replace the existing immutable-SHA deploy lane, deploy lock,
rollback tagging, or migration-compatibility gates. It tells those mechanisms what a
production deployment must prove and record.

## Core deployment law

> Deployment verifies environment compatibility, not code worthiness.
>
> Code worthiness is established before canonical merge. Deployment proves that the
> admitted canonical can **build → start → connect → answer → replace → roll back**.

Every deployment record MUST identify:

1. **Authorized reader SHA** — the exact immutable commit intended for production.
2. **Previous known-good reader SHA** — the reader currently serving production.
3. **Migration drift** — zero, expansion, or contraction.
4. **Rollback target** — exact known-good reader/artifact to restore if cutover fails.
5. **Rollback floor** — when one exists, the oldest reader generation lawful against
   the current schema.
6. **Health checks** — version identity, application health, database health, and
   representative core member journeys.
7. **Observation windows** — immediate and extended.
8. **SLIs/SLOs watched during cutover**.
9. **Hard invariants** that bypass the error budget and trigger immediate response.
10. **Final production reader SHA** after deployment closure.

## Release classes

### Zero database drift

> Change the reader, not the world beneath it.

- Do not run migrations.
- Preserve the current production reader as rollback target.
- Build the new image from the exact authorized SHA.
- Start/prove the new reader before traffic cutover where the lane supports it.
- Swap traffic only after health/version/DB proof.
- Roll back by restoring traffic to the previous known-good reader.

### Backward-compatible expansion

Use:

> **expand → deploy → observe**

The old and new readers must both remain safe against the expanded schema during the
compatibility window. Application rollback MUST NOT require database rollback.

### Destructive contraction

Use:

> **expand → deploy → observe → contract**

Contraction is a separate governed act. It establishes a new rollback floor.

> No destructive schema contraction occurs while a pre-floor reader remains part of
> the rollback plan.

## PRODUCTION-OBSERVATION-LAW-01

1. Every production cutover has an immediate observation window.
2. For a zero-drift major-runtime release, immediate observation is **30 minutes**.
3. Extended observation is **4 hours**.
4. The previous production artifact remains recoverable for **48 hours** unless a
   stricter retention requirement applies.
5. Systemic failure causes immediate rollback; the clock never justifies waiting.
6. Deployment closure means sustained healthy operation, not merely successful startup.

## SLI-SLO-LAW-01

- **SLI** = what production actually measures.
- **SLO** = the required level of that measurement over a defined window.
- **Error budget** = the tolerated ordinary failure implied by the SLO.
- **Paging** = response to dangerous error-budget burn or a hard-invariant violation.

SLIs should reflect member-facing outcomes rather than arbitrary machine activity.

### Initial production SLO set

| Service indicator (SLI) | Objective (SLO) |
| --- | --- |
| Core web/API successful eligible requests | **99.9% / rolling 30 days** |
| Authentication/session entry success | **99.95% / rolling 30 days** |
| Database connectivity for production requests | **99.95% / rolling 30 days** |
| Durable member write success | **99.99% / rolling 30 days** |
| General API server-error rate | **< 0.5% normal operating level** |
| Normal API latency | **p95 < 2 s** |
| MAIA request completion | **99.5% / rolling 30 days** |
| MAIA time-to-first-response | **p95 < 8 s** initially |
| Auth-email provider acceptance | **>= 99%** |

These are initial operational objectives and may be revised when enough real production
telemetry exists to establish representative baselines.

## ERROR-BUDGET-LAW-01

An SLO defines acceptable unreliability over its measurement window.

For a 99.9% availability SLO, the allowed ordinary failure rate is 0.1%. Over 30 days
that is approximately **43.2 minutes** of equivalent unavailability.

Burn rate is:

> **observed failure rate ÷ allowed failure rate**

Ordinary incidents page on dangerous burn, not on isolated errors.

Initial operational posture:

- **P1 / fast burn:** sustained systemic failure consuming budget at a clearly
  unsustainable rate (for example, roughly 5%+ eligible request failure for 5 minutes).
- **P2 / slow burn:** sustained degradation consuming budget several times faster than
  sustainable for 30–60 minutes.
- Single incidental failures normally log/ticket rather than page.

Exact alert implementation may use multi-window burn-rate alerts; the principle is
more important than any single threshold.

## PRODUCTION-HARD-INVARIANTS-01

The following bypass error budgets and require immediate response on credible evidence:

1. Cross-member data exposure.
2. Unauthorized role/tier/identity elevation.
3. Silent durable member-data loss or corruption.
4. Unknown, partial, or incoherent migration/schema state.
5. Production reader identity differs from the authorized deployment SHA.
6. A contracted schema receives a reader below its rollback floor.
7. Authentication admits uncertain or forged identity rather than failing closed.
8. A required rollback is unavailable or fails during an active production incident.

## SAFE-ROLLBACK-LAW-01

A rollback is safe only when:

1. the rollback reader is a known-good immutable artifact;
2. it remains compatible with current schema and data;
3. it remains compatible with current auth/session/runtime state;
4. restoring it does not weaken a repaired security boundary;
5. restoration does not require rebuilding during the incident;
6. traffic can be redirected quickly;
7. health, version, DB, and representative member journeys are verified immediately
   after restoration.

Operationally:

> **Restore traffic first; diagnose the failed candidate second.**

A rollback artifact may exist yet still be unlawful if the system has crossed its
compatibility boundary.

## ROLLBACK-FLOOR-RECORD-LAW-01

A destructive contraction establishes a rollback floor record containing:

- resulting schema/migration generation;
- minimum compatible reader SHA;
- current known-good reader SHA;
- exact restorable artifact/image digest;
- reason older readers are incompatible;
- irreversible data transformations, if any;
- pre-contraction snapshot/PITR recovery point;
- recovery-point retention/expiry;
- compatibility evidence supporting the floor.

Three concepts remain distinct:

- **rollback target** — the known-good reader we would restore now;
- **rollback floor** — the oldest reader generation still lawful against current state;
- **recovery point** — a database state reserved for disaster recovery.

## Deployment record template

\`\`\`yaml
deployment:
  authorized_sha:
  previous_known_good_sha:
  migration_drift: zero | expansion | contraction

  rollback:
    target_sha:
    artifact_digest:
    floor_sha: null
    recovery_point: null

  pre_cutover:
    image_build: pending
    version_identity: pending
    app_health: pending
    database_health: pending
    representative_routes: pending

  observation:
    immediate: 30m
    extended: 4h
    rollback_artifact_retention: 48h

  slos_watched:
    - core_availability
    - authentication_success
    - database_connectivity
    - durable_write_success
    - server_error_rate
    - latency

  hard_invariants:
    - cross_member_isolation
    - identity_authority
    - durable_data_integrity
    - schema_coherence
    - deployment_identity
    - rollback_legality

  final_production_sha:
  closure_status:
\`\`\`

## Existing structural controls

This contract is executed through, not around, existing production controls:

- \`docs/ops/IMMUTABLE_SHA_DEPLOY.md\`
- \`docs/ops/DEPLOY_LANE_TOKEN.md\`
- \`scripts/deploy-context.sh\`
- \`scripts/deploy-lock.sh\`
- \`scripts/deploy-tag.sh\`
- \`scripts/deploy-reader-artifact.sh\`
- \`scripts/pre-deploy-gate.sh\`
- \`scripts/deploy-production.sh\`
- \`docs/programme/DEPLOYMENT-SAFETY-03_MIGRATION_COMPATIBILITY_CONTRACT_2026-09-21.md\`

No raw compose deployment is authorized by this contract.
