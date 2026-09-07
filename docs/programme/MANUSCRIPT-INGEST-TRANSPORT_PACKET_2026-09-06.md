# MANUSCRIPT-INGEST-TRANSPORT — design packet

```text
STATUS     AUTHORIZED 2026-09-07 · IMPLEMENTED · amended during build (§ Amendment)
CLASS      B — touches middleware and the access matrix
SCOPE      one route: /api/sovereign/manuscripts/ingest
NOT THIS   NAV-01 · 08B · 07G · DEVELOP · widening supported formats
```

## Observed

```text
a multipart POST to /api/sovereign/manuscripts/ingest can fail before route
code executes; the route's own logging never appears, so EMPTY APPLICATION LOGS
ARE PART OF THE SIGNATURE, not an absence of evidence
```

Evidence in hand, and its limits:

```text
HAVE  the same class of failure documented in middleware.ts for
      /api/voice/transcribe-simple, with a named mechanism:
      the matcher matched → Next buffered the body so middleware could run →
      it rebuilt a Request from an already-consumed Node stream → construction
      threw before any application code ran
HAVE  a 6-hour production log window with zero [press/manuscripts/ingest]
      entries across an upload that was definitely attempted
HAVE  the transport shape: FormData multipart POST (page.tsx:405-407),
      on a path the matcher covers (it excludes only _next/static,
      _next/image, favicon.ico, api/voice/transcribe-simple)

DO NOT HAVE  a failure rate for THIS route. The "roughly half of multipart
             POSTs" figure was measured on the voice route and MUST NOT be
             restated as if it applied here.
DO NOT HAVE  a reproduction. The defect is inferred from signature and
             mechanism, not yet observed under instrumentation.
```

## Candidate repair — AMENDED 2026-09-07

```text
1  MATCHER   exclude exactly /api/sovereign/manuscripts/ingest
2  REFUSE    forgedIdentityHeaders(request.headers) → 401
             every client-assertable name EXCEPT x-member-id, which is the
             only one with a real sender (apiFetch, iOS). x-maia-member-id is
             refused: no client sends it and no gate inspects it.
3  AUTHORITY — ORIGINAL REQUEST
   deriveVerifiedAccess(request)
   → checkAccess('/api/sovereign/manuscripts/ingest', verified.tier,
                 verified.roles, verified.authenticated)
   → reproduce API denial semantics in-route
4  IDENTITY  getMemberIdFromRequest(request) → 401
             the ordinary member gate, RETAINED. Not verified.memberId:
             deriveVerifiedAccess also accepts a ?_t= query token, and
             adopting it here would widen what counts as a credential on an
             upload path. Narrower wins; a disagreement between the two
             resolvers refuses.
5  SANITIZE — SAME REQUEST
   only AFTER authority and identity have inspected the caller's claims,
   delete every CLIENT_ASSERTABLE_IDENTITY_HEADERS entry
   from request.headers IN PLACE
   DO NOT construct a second Request / NextRequest
6  INGEST    request.formData() on that same request → parse → custody
```

The order is the contract, and it is not interchangeable. Authority and identity
must read the caller's claims — `deriveVerifiedAccess` compares `x-member-id` against the
session and denies a mismatch as impersonation, so sanitising first would blind
the impersonation check. Nothing downstream of authority may read them.
Sanitisation is IN PLACE because a second `Request` carrying sanitized headers
would consume the body, which is the exact failure the exclusion exists to
avoid. `x-session-token` is outside the strip list, so the credential survives.

**Invariant.** *Untrusted assertions may be inspected by the authority boundary;
they may not survive beyond it as ambient request context.* Verification is a
reason to admit a claim, never a reason to leave it standing: `x-member-id` is
checked against the session and then deleted like every other name.

### Amendment · the packet named the wrong half as the hard one

Reading the middleware before building showed that `checkAccess` is not the only
thing it does for a matched request, and is close to the *easier* half:

**Access turned out to be nearly vacuous here.** `{ prefix: '/api/sovereign',
minTier: 'free' }` carries no `rolesAnyOf`, and `TIER_RANK.free` is `0` — the
lowest — so `tierSatisfies` admits every tier. The rule's only real effect on
this path is *authenticated*. That is a statement about today, not a licence to
encode it: the route calls `checkAccess` with the path so the rule's future
shape reaches the excluded path too.

**Sanitisation is the half that mattered, and the packet did not name it.** Every
matched request is forwarded through `stripClientIdentityAssertions()`, whose
stated guarantee is that *"a handler reading `x-access-roles` reads our answer or
nothing at all — never the caller's."* A bare matcher exclusion silently revokes
that for this route. Nothing on this path trusts those headers today; after the
exclusion, this becomes the one route where `x-access-tier` is attacker-controlled
with no signpost for whoever adds the next helper.

**Removed, not refused — and not hardcoded.** A first pass refused any request
carrying middleware-derived headers and read identity via
`getMemberIdFromRequest()` alone. Both halves were wrong in the same way: they
encoded *today's* answer. Refusal is a rule about which names are currently
middleware-only, and it would go on protecting nothing the day one of them
becomes legitimate; resolving identity without `checkAccess` freezes today's
matrix semantics into the exception, so a `/api/sovereign` rule that later
acquires a role or a higher tier would be enforced everywhere EXCEPT here. The
route therefore calls the MATRIX for authority and DELETES the whole
`CLIENT_ASSERTABLE_IDENTITY_HEADERS` list from the request afterwards. Deletion
breaks no honest sender either: `x-member-id`, which `apiFetch()` does send on
iOS where a SameSite cookie cannot cross origins, is read by authority first and
removed only once it has been checked against the session.

**Why the voice precedent does not transfer unmodified.** That route was safe to
drop from the matcher because *no rule in `config/accessMatrix.ts` matched it*, so
middleware was already waving it through and nothing was lost. This route is
covered by `{ prefix: '/api/sovereign', minTier: 'free' }`. Excluding it without
replacing that check would remove access enforcement from a member-data write
path in order to fix a request-parsing bug. **The exclusion is only admissible
paired with the in-route check.**

## Falsifiers — required before build

```text
F1  an unauthenticated upload is REFUSED
F2  a valid member cannot cause artifact custody to be attributed to another
    member by supplying x-member-id / x-maia-member-id or forged x-access-*
    context
F3  a valid member upload SUCCEEDS
F4  the multipart body reaches the route intact (the defect is actually fixed,
    not merely made quieter)
F5  .docx / .md / .txt / .pdf all cross the SAME authorization boundary —
    no format is privileged by the repair
F6  the matcher exclusion does not widen /api/sovereign generally:
    a sibling sovereign route remains matched and enforced
F7  client assertions cannot survive the excluded boundary: given a valid
    session plus forged x-access-tier: pro, x-access-roles: admin,
    x-access-member-id: <other>, x-member-id: <claim> — authority derives from
    the validated session; a mismatched identity claim is refused before
    sanitisation; after access succeeds every name in
    CLIENT_ASSERTABLE_IDENTITY_HEADERS is absent from the SAME NextRequest
    before formData / parsing / custody; x-session-token remains available
    (ADDED by the amendment — the falsifier for the half the packet missed)
```

F6 is the one that matters most and is easiest to get wrong: a prefix-shaped
exclusion would silently remove future routes from the matcher as they are added.
The voice note says exactly this about its own scope, and the same discipline
applies — **this one path only**, asserted by a regression test so it fails rather
than rots.

## Two open questions the build should answer, not assume

```text
1  is the failure intermittent, and on what? size, concurrency, client, none
   of these? No rate is claimed here because none has been measured on this
   route.
2  does the same failure reach any other multipart route in the app? The repair
   should not be shaped as one-off if the class is broader.
```

## Not to be conflated with NAV-01

The fresh `.md` traversed ingest successfully and produced a 262-section Work.
Its missing "Confirm section breaks" button is therefore a **separate**
write-state finding and must not be explained by this defect. Two findings, two
lanes.

## Implementation — 2026-09-07

```text
middleware.ts                      matcher excludes the path, ANCHORED with $
                                   + the rationale block records both halves
lib/auth/identityAssertions.ts     CLIENT_SENT_IDENTITY_CLAIM_HEADERS =
                                   ['x-member-id'] — the one exemption, argued
                                   NEVER_CLIENT_SENT_IDENTITY_HEADERS = the rest,
                                   DERIVED from the stripped list so the two
                                   cannot drift
ingest/route.ts                    refuse forged → deriveVerifiedAccess →
                                   checkAccess(path) → middleware's API denial
                                   semantics → getMemberIdFromRequest →
                                   in-place deletion → formData on the same
                                   request
transportBoundary.test.ts          F1–F7, 33 assertions
```

**Two corrections the first two passes needed.**

*Access.* The first pass encoded today's matrix answer ("free + no roles,
therefore auth-only"). A test asserting that is a tripwire, not enforcement, and
it makes this route a fork of the central policy authority. The route now calls
`checkAccess` with the path, so a rule that later acquires a role or a higher
tier reaches the excluded path too. The extra indexed lookup is the right price
on a low-frequency upload route.

*`x-maia-member-id`.* The second pass exempted it alongside `x-member-id` on the
assumption that both were client-sent claims. They are not the same:
`getMemberIdFromRequest()` verifies `x-member-id` against the session and does
not inspect the alias at all, and `grep` finds no sender for it anywhere in this
repo — every occurrence is a server-side reader or a test. Exempting it left a
valid session plus `x-maia-member-id: someone-else` passing the forged check and
sitting ambient in the handler. It is refused. The exemption list is now one name
long, with `lib/http/apiBase.ts` cited as its sender.

**Class L — the mechanism, exercised.** A real `NextRequest` carrying a multipart
body: every `CLIENT_ASSERTABLE_IDENTITY_HEADERS` name deletes in place and reads
back absent, `x-session-token` survives, `bodyUsed` stays `false`, and
`formData()` then yields the file with its bytes intact.

**Class L — the consequence, behavioural.** F7 runs the handler with `formData()`
intercepted, reading back the request's own headers at the moment the body is
reached — whatever is present there is what parsing, custody, and any future
helper could see. A matching `x-member-id` is accepted and the upload returns 200
with custody under the session member; no client-assertable name is present at
that boundary; `x-session-token` still is; a mismatched `x-member-id`, an
`x-maia-member-id`, forged `x-access-*`, and no credential at all each return 401
without the body being reached.

*Falsified, not merely passing.* With the deletion loop disabled, five assertions
fail — including the header-absence check and the 200 itself, because the
survivor guard is fail-closed.

Gates on this head: `typecheck` — no regressions (230 errors vs 239 baseline);
`check:no-supabase` clean; `lib/auth` + `middleware-transcribe-exclusion` — 13
suites / 240 tests pass; `manuscript` — 2 failed suites / 14 failed tests,
identical before and after (pre-existing).

**Not yet class R.** Nothing here is a production witness. The defect was observed
in production; the repair has not been.

## Interim guidance, until repaired

```text
if a file upload fails, retry once; pasting the manuscript avoids the
multipart path entirely
```

No rate is quoted, because none has been measured here.
