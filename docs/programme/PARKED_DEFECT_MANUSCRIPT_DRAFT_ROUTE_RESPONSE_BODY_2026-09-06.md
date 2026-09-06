# PARKED DEFECT — manuscript draft route: "Response body object should not be disturbed or locked"

```text
status        TRIAGED 2026-09-06 · MECHANISM IDENTIFIED · NOT FIXED
recorded      2026-09-06 (founder instruction: record separately now, do not investigate yet)
lane          none — this is a defect record, not an execution lane, and not part of WS2-08 / 08A
```

## Exact error (verbatim from production logs)

```text
⨯ TypeError: Response body object should not be disturbed or locked
    at new i (.next/server/chunks/95873.js:15:2021)
    at l.fromNodeNextRequest (.next/server/chunks/95873.js:1:4614)
    at x (.next/server/app/api/sovereign/manuscripts/[id]/draft/route.js:11:3993)
```

Four occurrences in the window read. Each was immediately preceded by a slow-query warning on
the manuscripts listing query (`SELECT m.id, m.title, m.created_at, (SELECT count(*) FROM
manuscript_sections s WHERE …`, 193 ms) — adjacency only, no causal claim.

## Where observed

```text
route / source   app/api/sovereign/manuscripts/[id]/draft/route.ts
                 (compiled: .next/server/app/api/sovereign/manuscripts/[id]/draft/route.js)
host             minisforum · container maia-sovereign
how              ssh soullab@minisforum 'docker logs maia-sovereign --since 45m 2>&1 | tail -150'
production SHA   66da58b4c — GIT_COMMIT of the running container at the time of the read
                 (the read happened after the 66da58b4c full deploy and before the
                 1116f7813 full deploy in the same terminal session)
```

## Evidence that it predates 08A

- Observed on `66da58b4c`, which is the base parent of the 08A candidate and contains no 08A
  commit. 08A's migration had not run (it runs only with the deploy of the merge commit
  `03e9d89a`).
- 08A's merged diff against `66da58b4c` does not touch the draft route directory:
  `git diff --stat 66da58b4c..41e86e2b -- 'app/api/sovereign/manuscripts/[id]/draft'` is empty.
- The last commit on the route file at the base tip is `71faa382` (WS2 liveness, section-revision
  relation), unrelated to WS2-08.

## Not yet established (deliberately)

- Which request shape triggers it (the stack frame points at request construction inside Next's
  Node adapter, which is consistent with a request body being read twice, but that is a reading
  of the frame, not a finding).
- Whether a member-facing draft save or restore failed, or whether the error surfaced only in
  logs.
- Whether it reproduces on `1116f7813` or later.

## Since recording

- 2026-09-06: #1233 (`fix/ws2-bodyless-checkpoint`, merged as `d07f20a0`) added a sibling route
  `app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts`. It did not modify
  `draft/route.ts`, where this error originates. Not a fix, not an explanation. Status unchanged.
- 2026-09-06: WS2-08 BUILD-08A CLOSED / ACCEPTED. The reopening condition below is now met on
  the 08A side; triage still requires a founder act.

## Reopening

Triage opens only after WS2-08 BUILD-08A is CLOSED (F1–F3, F6b and the exact-filename ledger
witness all PASS, founder-adjudicated) and only by a founder act. First step then: reproduce
against the current production SHA and read the route source at that SHA.


---

## Triage — 2026-09-06 (mechanism identified, no fix applied)

**The same failure is already documented in `middleware.ts`**, for a different route. Because the
middleware matcher matched the path, Next buffered the request body so middleware could run, then
rebuilt a Request for the route handler from the same Node stream; when that stream was already
consumed, construction threw before any application code ran. That is why the route's own logging
never appears in the observed occurrences. Precedent and full measurement:
`middleware.ts` (matcher note) and `docs/ops/TRANSCRIBE_BODY_DISTURBED_2026-08-27.md`.

**Ruled out as the cause:** a double body read inside one handler. `POST` reads `request.text()`
(line ~117) and `PUT` reads `request.json()` (line ~373); they are different handlers, and
`getMemberIdFromRequest()` does not touch the body.

**The precedent's fix does NOT transfer.** `/api/voice/transcribe-simple` was removed from the
middleware matcher, and that was safe only because no rule in `config/accessMatrix.ts` matched it,
so middleware was already waving it through. This route is covered by
`{ prefix: '/api/sovereign', minTier: 'free' }`. Excluding it from the matcher would remove
access-matrix enforcement from a member-data write path in order to fix a request-parsing bug.

```text
DO NOT      copy the matcher exclusion to this path
NEEDS       a fix that keeps middleware enforcement — e.g. avoiding body
            consumption in the middleware path for this route, or a matcher
            exclusion paired with an equivalent server-side access check
STATUS      still unfixed · a real fix needs its own authorization and review
```

**Beta relevance:** this is on the working-draft save path. Occurrences were intermittent (four in
one window); the analogous voice route failed on roughly half of requests. Frequency here is
unmeasured.
