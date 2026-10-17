# Reflect E010 — R2 operator-qualification handoff (source review only)

**Date:** October 17, 2026
**Disposition:** REVIEW-ONLY / NO LIVE OPERATOR / REFLECT OFF / PRODUCTION HOLD

## Why R2 exists

R1 defined three precise actions but deliberately withheld the production backend:
`FOUNDER_ON`, `NORMAL_OFF`, and `EMERGENCY_QUARANTINE`.
Its `execute()` permanently raises `NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND`.
The source review and isolated Caddy tests do not grant operator privileges.

This R2 creates the *handoff contract* for an independently reviewed and
separately permitted production operator. It makes the remaining evidence
explicit and immutable **without creating a path to execute a live change**.

The user's "continue" is authorization for this isolated, review-only
development work. It is **not** authority to repeat or route around the earlier
blocked production activation, merge this branch, reload Caddy, edit environment
settings, collect private account identifiers, or deploy to beta.

## Source custody and hard bounds

- Base: merged source-review branch commit
  `95b5c548fbb4379a22f1cd12a95051dbdf80b304` (PR #1841).
- Frozen E010 reader source:
  `e010c0977320ea3cceb7424e84a5cf5c58770cc2`.
- Exact existing E010 reader image:
  `sha256:ed8272ad08d00aea1616907b0cdd38047e6e88439c32af4bbea481501603c30a`.
- Preserved previous image:
  `sha256:d6bc2e06c01534b5e7792feae3f6d38cedf59f68f34fa60a0d358f27eb574c48`.
- Normal ON/OFF only: `PRO_STUDIO_REFLECT_BETA_ENABLED` and
  `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS`, exactly ONE privately verified account,
  existing `maia-sovereign` reader only, governed `.deploy.lock`, no
  build/pull/dependency restart. **60 GiB free-space minimum.**
- Emergency ingress quarantine modifies neither Reflect environment setting
  and is NOT proof of runtime OFF.

R2 adds two isolated files under `scripts/` and this document. It modifies
no application, Caddyfile, deployment, database, account, or protected source.

## New R2 contract

`scripts/reflect_e010_operator_qualification.py` exports an immutable
`OperatorHandoff` and an explicit list of **unverified** release gates.
Its builder accepts *no caller-supplied evidence or booleans*; its verifier
rejects amended release identity, altered gate order, extra environment keys,
multiple members/containers, relaxed disk requirements, or claimed approval.

`public_review_summary()` exposes only policy, image hashes, key **names**,
count and missing proof requirements. It never stores a founder UUID, session,
password, configuration value, private signing token, or secret.

`execute()` always refuses with
`NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND`. Direct CLI invocation returns
exit status **2** and `HOLD_REVIEW_ONLY`. It has no file writer, SSH, Docker,
HTTP, network, privileged request, access-token verifier or deployment hook.

A malicious caller cannot turn this module into a production permit by passing
`user_approved=True`, `permit_token`, or a forged evidence record. There
is deliberately no trust anchor for live authority in this module.

## Who must supply what before any permitted live operation

| Gate | Independent evidence needed | Result now |
| --- | --- | --- |
| Human authority | Founder exact-SHA decision, current private member-session proof, separate *permitted* production action channel | HOLD |
| Release custody | Approved operator, existing release lock, exact deployed E010 image and rollback, no competing release, protected config backup with authenticated recovery | HOLD |
| Emergency before ON | Independently permitted edge denial that works if reader cannot restart or disk falls below 60 GiB; live host/alias, RSC/Flight/prefetch, direct-origin and cache denial witness | HOLD |
| Founder ON acceptance | Verified one-member admission on desktop and physical iPhone Safari, other-member and guest denial, no sensitive content leakage | HOLD |
| OFF and incident | Exact config restoration, reader-only recreation, former founder actively denied in runtime, intact Studio/MAIA, emergency quarantine never misreported as true OFF | HOLD |
| Observation | 30-minute post-operation observation, unchanged migrations and rollback custody | HOLD |

A separate authorised operator service/provider must authenticate, preserve,
and independently attest these facts. **This file cannot supply that service,
human approval, or the permission needed to access the production control plane.**
An optional operator implementation cannot be "plugged in" to R2 to bypass an
existing execution refusal.

## Independent acceptance checklist

1. Verify exact source/image/rollback, that only the R2 review files were
   added, and that the existing R1 live-action refusal remains unchanged.
2. Verify that a fake signed permit or user-provided authority boolean cannot
   satisfy a gate, and no member identity can appear in public receipts.
3. Verify all mandatory external evidence gates (especially disk-below-floor,
   RSC/Flight, caches/origins, and real runtime revocation) remain unverified.
4. Inspect test results and the governance checks **without equating CI with
   production approval**.
5. Record the human authorization decision and qualified control channel
   outside this review code, on the exact future candidate SHA.
6. Preserve Reflect OFF until an independently approved emergency capability
   and permitted operator both exist.

**Source-only outcome:** R2 supports an independent implementation review;
it does **not** advance the live one-founder canary to GO. The issue owner
remains `@Soullab` in
[PRO-STUDIO-REFLECT-01 #1816](https://github.com/SoullabTech/Sovereign/issues/1816).
