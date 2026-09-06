# MANUSCRIPT-INGEST-TRANSPORT — design packet

```text
STATUS     DESIGN ONLY · implementation NOT AUTHORIZED
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

## Candidate repair

```text
exclude this exact multipart route from the body-disturbing matcher
  + reproduce the equivalent access enforcement INSIDE the route
  + prove no authorization regression
```

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
F2  a member cannot write to another member's Work through this route
F3  a valid member upload SUCCEEDS
F4  the multipart body reaches the route intact (the defect is actually fixed,
    not merely made quieter)
F5  .docx / .md / .txt / .pdf all cross the SAME authorization boundary —
    no format is privileged by the repair
F6  the matcher exclusion does not widen /api/sovereign generally:
    a sibling sovereign route remains matched and enforced
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

## Interim guidance, until repaired

```text
if a file upload fails, retry once; pasting the manuscript avoids the
multipart path entirely
```

No rate is quoted, because none has been measured here.
