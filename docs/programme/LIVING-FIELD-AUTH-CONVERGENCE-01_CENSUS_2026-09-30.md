# LIVING-FIELD-AUTH-CONVERGENCE-01 — Census
Date: 2026-09-30
Base: `89f7876e8` (`clean-main-no-secrets`)
Status: census complete; repair lane open; no merge/deploy authority

## Trigger

The post-#1539 real-stack walk on Mac Studio reached the mounted R1R3 Living Field
through the real Next app, real API routes, and a disposable PostgreSQL database.
The top-level Living Field, constellation, and facet-flow routes worked, but
`GET /api/maia/living-field/current_questions` returned 400 before an encounter
could begin.

The server trace showed a valid session credential resolving successfully while
the legacy member-id claim was absent after the auth boundary sanitized the
request. The member saw the truthful existing failure copy:

> “Couldn’t open this dimension just now. Try again.”

This failure is inherited. The relevant detail/encounter/auth transport files are
unchanged between deployed `04005ca7c`, post-H1 canonical `f5cd0211e`, and
the #1539 reconciliation lineage.
## Measured seam

Eight Living Field route files still import the Phase-0 `probeAuthPosture`
helper. Together they contain 13 identity reads:

- `[fieldKey]/route.ts` — GET, PATCH
- `[fieldKey]/gathering/route.ts` — GET
- `[fieldKey]/sources/route.ts` — POST
- `[fieldKey]/refine/route.ts` — POST
- `[fieldKey]/consent/route.ts` — GET, POST, DELETE
- `[fieldKey]/encounter/route.ts` — POST, PATCH
- `states/route.ts` — GET, POST
- `spirals/route.ts` — GET, POST

`probeAuthPosture()` is explicitly log-only scaffolding. It returns only the
raw `x-member-id` claim. The auth boundary now strips that claim before
forwarding the request and forwards only verified access context. The same
request still carries its session credential.

The top-level `/api/maia/living-field` route and the Living Constellation
route already use `getMemberIdFromRequest()`, which resolves identity from
`auth_sessions` and works through the same sanitized boundary.

## Repair law

> A Living Field route may derive member identity only from the verified
> session-backed auth authority; it may not depend on a client identity claim
> surviving the auth boundary.
## Auth repair

The eight route files now use `getMemberIdFromRequest(request)` at every one of
the 13 former probe sites. No route in `app/api/maia/living-field/**` imports
or calls `probeAuthPosture`.

A dedicated falsifier pins that complete seam. Before the repair it failed all
17 assertions; after the repair it passes. The pre-existing LF-SCOPE-01 suite
was moved to the same verified auth mock and now passes with the auth test:
38/38 focused assertions.

`npm run typecheck` on this repair reports the canonical no-regression result:
222 current errors against the 239 baseline, with no introduced regression.

## Real-stack witness after auth repair

On a fresh disposable PostgreSQL database, a real browser session reached the
dynamic field route through the sanitized proxy. The detail request changed
from the pre-repair auth refusal to HTTP 200, proving that session-backed
identity now survives the boundary correctly.

That witness exposed a second, independent inherited blocker: the dynamic
Living Field routes still read `params.fieldKey` synchronously. Under the
current Next runtime, `params` is a Promise. The route therefore receives an
undefined field key, causing writes to fail and the encounter open to fail
after authentication has already succeeded.

That runtime-param defect is not folded into the auth commit. It is the next
separate repair act required before cohort exposure.
