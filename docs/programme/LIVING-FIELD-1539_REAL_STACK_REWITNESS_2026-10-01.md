# Living Field #1539 — Real-Stack Re-witness

**Witnessed:** 2026-10-01  
**Canonical witnessed:** `dbc3036f2ff498779c56b91152d1d79f5e30fde8`  
**Origin witnessed:** `http://127.0.0.1:3139`  
**Standing:** **PASS — 31/31, 0 failures**

## Purpose

Close the real-stack obligation left by #1539 after the original walk stopped at the
Current Questions detail boundary.

The earlier walk on #1539 head `2640ec28e` reached the Living Field successfully but
`GET /api/maia/living-field/current_questions` returned HTTP 400
`{"error":"Valid memberId required"}`. That failure was classified as inherited
auth-posture convergence debt rather than a #1539 regression.

PR #1545 repaired that seam by replacing the retired Phase-0
`probeAuthPosture()` identity reads with verified session-backed
`getMemberIdFromRequest()`, and by unwrapping current Next dynamic-route params.
#1545 subsequently merged to canonical before this re-witness.
## Witness environment

The re-witness used the exact canonical SHA above on the Mac Studio.

- one Next development server bound only to `127.0.0.1:3139`;
- normal email-code sign-in flow on that same origin;
- a fresh disposable PostgreSQL database rebuilt from the canonical baseline plus all migrations;
- one synthetic witness member and synthetic Living Field history only;
- no production credentials, browser cookies, member content, or production database rows;
- EARLY-FIELD enabled locally only for the synthetic member;
- H1 disabled in this witness environment;
- no request interception or fixture API responses.

The witness was rerun after #1564 merged because that PR changed the Living Field
House-return surface. The final evidence therefore includes the new return behavior as well
as the #1545 auth repair.

## Result

The browser witness completed **31 checks with 31 passes and 0 failures**.
No browser page errors were emitted.
## Decisive repaired boundary

The exact request that failed previously now passed:

- `GET /api/maia/living-field/current_questions` → **200**
- no member-facing “Couldn’t open this dimension just now” failure copy
- **Development History** reachable
- **Written by you** provenance visible
- **MAIA candidate, accepted** provenance visible

The repaired route therefore receives member identity through the verified session boundary
rather than depending on a stripped caller identity claim.

## Same-origin and return continuity

The complete sign-in and Living Field journey remained on
`http://127.0.0.1:3139`.

Arrival settled at:

`http://127.0.0.1:3139/maia/living-field?from=house`

The canonical Return Home control then landed at:

`http://127.0.0.1:3139/home`

No redirect crossed to `localhost`, another port, or another origin.
## Instrument interaction

The locally admitted R1R3 instrument also passed its live interaction path:

1. root rendered the five elemental regions: Fire, Water, Earth, Air, Aether;
2. Fire opened and exposed only Beginning, Vision, Creation;
3. Creation opened and exposed only Prototype, Expression, Experiment;
4. Expression opened as a leaf without a duplicate SVG label;
5. Wider returned correctly to Creation;
6. the instrument SVG accepted pointer interaction.

This confirms the current canonical instrument interaction while preserving the separate law
that Living Field itself is never cohort-gated.

## API observations

The authenticated browser observed HTTP 200 from:

- `/api/early-field/admission`
- `/api/maia/living-field`
- `/api/maia/living-constellation`
- `/api/house/facet-flows`
- `/api/members/me`
- `/api/maia/living-field/current_questions`
- `/api/maia/living-field/current_questions/gathering`
- `POST /api/maia/living-field/current_questions/encounter`
## Scope and remaining governance

Current canonical still contains the pre-#1554 behavior in which opening a dimension can
immediately open the MAIA encounter. This re-witness records that behavior but does not
ratify or reject it. PR #1554 governs explicit MAIA-entry consent separately and remains
outside this admission claim.

This witness closes the #1539 real-stack prerequisite and satisfies the EARLY-FIELD-01
criterion requiring the #1539 real-stack walk to pass on current canonical code.

It does **not** by itself authorize cohort widening, alter production configuration, or replace
the separate production non-cohort exclusion witness.

## Evidence

- `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/REAL-STACK-3139-auth-convergence-pass-dbc3036f2.json`
- `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/REAL-STACK-3139-auth-convergence-pass-dbc3036f2.png`

The disposable database and local witness scripts are not part of canonical evidence and are
removed after the walk.
