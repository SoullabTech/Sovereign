# Living Field #1539 — Real-Stack Witness

**Date:** 2026-09-30 / 2026-10-01 UTC  
**Witnessed head:** `2640ec28e66024d69f672ea04cfc357b4b35cbb8`  
**Origin:** `http://127.0.0.1:3139`  
**Standing:** **STOP — dimension-open boundary still fails on the real stack.**

## Purpose

This record closes the outstanding real-stack question left by the fixture rewalk for
Living Field / Grokker reconciliation. It does not reopen #1539 and does not authorize
an auth repair inside that merged lane.

The witness was run against the exact merged #1539 head, from its existing worktree,
with a fresh development session established on the same `127.0.0.1:3139` origin.
No request interception or fixture API responses were used for the happy path.

## What passed before the stop

- final page remained on `http://127.0.0.1:3139/maia/living-field?from=house`;
- no redirect crossed to `localhost` or another port;
- `GET /api/maia/living-field` → **200**;
- `GET /api/maia/living-constellation` → **200**;
- `GET /api/house/facet-flows?limit=8` → **200**;
- `GET /api/members/me` → **200**;
- the Living Field, Wider Field, threads, emotional weather and dimension cards rendered.
## Decisive failure

Opening **Current Questions** made the real request:

`GET /api/maia/living-field/current_questions`

The response was:

```json
{"error":"Valid memberId required"}
```

with HTTP **400**.

The member-facing surface then showed:

> Couldn’t open this dimension just now. Try again.

Development History was therefore not reachable. The walk stops here; later checks must not
be promoted as real-stack evidence around an unreachable prerequisite.

Evidence:
- `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/REAL-STACK-3139-dimension-open-fail.json`
- `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/REAL-STACK-3139-dimension-open-fail.png`
## Classification

This failure is **inherited auth-posture convergence debt, not a #1539 regression**.

The detail route still resolves member identity through `probeAuthPosture(request)`.
That helper is explicitly Phase-0 observability scaffolding and returns only the bare
`x-member-id` header. The current auth boundary strips caller-supplied identity claims
before forwarding, so a valid authenticated session does not make that helper return a member id.

The route then rejects the missing value as `Valid memberId required`.

Provenance supports the classification:
- `probeAuthPosture` entered this route in commit `af14ea1ff`;
- #1539 head `2640ec28e` changes neither this route nor `authPostureProbe.ts`;
- current canonical at record authoring, `71859c3a3`, still carries the same seam.

No auth code is changed by this witness record.

## Release consequence

The fixture evidence remains valid for the behavior it actually exercised, but it cannot establish
real-stack dimension opening. The small-cohort rollout remains **held at this prerequisite** until
the auth-posture convergence is repaired in its own governed lane and this exact real-stack boundary
is re-witnessed.

H1 admission is a separate result and is not withdrawn by this finding.
