# Living Field #1539 — Real-Stack Re-witness

**Witnessed:** 2026-10-01
**Canonical witnessed:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Origin witnessed:** `http://127.0.0.1:3139`
**Standing:** **PASS — 29/29, 0 failures**

## Purpose

Close the outstanding real-stack obligation left by #1539 after the original walk
stopped at the Current Questions detail boundary.

The earlier #1539-head walk reached the Living Field but
`GET /api/maia/living-field/current_questions` returned HTTP 400
`{"error":"Valid memberId required"}`.

That failure was inherited auth-posture convergence debt rather than a #1539
regression. PR #1545 replaced the retired Phase-0 identity probe with verified
session-backed identity and corrected current Next dynamic-route params.
Two later canonical changes touched this same member journey and were therefore
included before closure:

- #1564 corrected the Living Field return surface;
- #1554 made MAIA entry inside a dimension explicitly member-chosen.

The final witness was therefore rerun after both had entered canonical.

## Witness environment

The walk used a detached worktree at the exact canonical SHA above.

- one Next development server bound only to `127.0.0.1:3139`;
- normal `/signin` email-code authentication on that same origin;
- the repository's documented `EMAIL_PROVIDER=memory` development transport;
- a disposable PostgreSQL database rebuilt from canonical baseline + all migrations;
- one synthetic witness member and synthetic Current Questions history only;
- no production credentials, cookies, member content, or production database rows;
- EARLY-FIELD enabled locally only for the synthetic member;
- H1 disabled in this witness environment;
- no request interception or fixture API responses.
The in-memory email provider is explicitly a development transport and is refused
by the provider selector in production. The generated one-time code was read only
from the disposable database to complete the ordinary sign-in UI.

## Origin-preservation finding

A preliminary attempt considered the development-only `/api/auth/dev-login`
path. Direct inspection showed that a request on `127.0.0.1:3139` emitted:

`Location: http://localhost:3139/maia/living-field?from=house`

That violates this witness's origin law, so the dev-login route was not used.
The final successful walk used the normal `/signin` flow and never crossed from
`127.0.0.1` to `localhost` or another port.

## Result

The final browser witness completed **29 checks with 29 passes and 0 failures**.
No browser page errors were emitted.
## Repaired dimension boundary

The request that originally failed now passed:

- `GET /api/maia/living-field/current_questions` → **200**
- no “Couldn’t open this dimension just now” failure copy
- **Development History** reachable
- **Written by you** provenance visible
- **MAIA candidate, accepted** provenance visible

The route therefore receives member identity through the verified session
boundary rather than depending on a stripped caller identity claim.

## Explicit MAIA-entry consent

Current canonical now preserves the field before the encounter:

- opening Current Questions changed encounter count **0 → 0**;
- **Enter this dimension with MAIA** was present;
- Development History and provenance remained inspectable before MAIA entry;
- choosing the explicit MAIA gesture started exactly one encounter, **0 → 1**;
- `POST /api/maia/living-field/current_questions/encounter` → **200**.
## Instrument and room continuity

The locally admitted R1R3 instrument also passed its live interaction path:

1. the instrument rendered and accepted pointer input;
2. Fire opened;
3. Creation opened;
4. Expression opened as a leaf;
5. Wider returned correctly to Creation.

Authenticated browser requests also returned HTTP 200 from:

- `/api/early-field/admission`
- `/api/maia/living-field`
- `/api/maia/living-constellation`
- `/api/house/facet-flows`
- `/api/members/me`
- `/api/maia/living-field/current_questions`
- `/api/maia/living-field/current_questions/gathering`
- `POST /api/maia/living-field/current_questions/encounter`
## Same-origin return

Arrival settled at:

`http://127.0.0.1:3139/maia/living-field?from=house`

The canonical Return Home control landed at:

`http://127.0.0.1:3139/home`

No successful-witness navigation crossed to `localhost`, another port, or
another origin.

## Ruling

This closes the #1539 real-stack prerequisite on canonical `975a208b8`.

It also satisfies the EARLY-FIELD-01 criterion requiring the #1539 real-stack
walk to pass on current canonical code. It does **not** by itself authorize
cohort widening or any production environment change.
## Evidence

- `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/REAL-STACK-3139-current-canonical-pass-975a208b8.json`
- `docs/programme/evidence/living-field-reconcile-walk-2026-09-30/REAL-STACK-3139-current-canonical-pass-975a208b8.png`

The disposable database, server, and local witness scripts are not canonical
evidence and are removed after the walk.
