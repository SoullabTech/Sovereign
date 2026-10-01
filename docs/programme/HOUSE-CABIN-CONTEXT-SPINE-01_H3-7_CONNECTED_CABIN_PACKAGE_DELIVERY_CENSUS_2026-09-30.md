# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.7 — Connected Cabin Package Delivery

## Gate question

How does a member explicitly carry the already-assembled Cabin Context Package from the connected Soullab environment onto the member's own machine without giving JARVIS, the browser, or the server a new source-selection authority?

## Ruling

The connected Soullab session owns the export act. JARVIS does not.

H3.4 requires authenticated member identity and explicit Work / Relationship / Memory selection. JARVIS has neither the connected member session nor the member's selection. Inventing either inside JARVIS would create a second authority path.

Therefore H3.7 is a member-authenticated HTTP delivery seam:

    connected House / future Cabin control
              ↓
       explicit selection
              ↓
             H3.4
              ↓
             H3.5
              ↓
     short-lived server temp artifact
              ↓
        HTTP attachment
              ↓
       member's local machine
              ↓
        explicit local placement
              ↓
             H3.2

The HTTP response is transport only. It does not become a new persistent source, sync mechanism, or Cabin store.

## Request contract

POST /api/cabin/export

Body contains exactly:

    {
      workIds: string[],
      relationshipIds: string[],
      memoryIds: string[]
    }

No member id is accepted. The member id comes only from the authenticated session.

No package path is accepted. The server chooses a short-lived absolute temporary path for H3.5 and removes the temporary artifact after reading it.

## Security / custody

The route MUST:

1. require an authenticated member;
2. reject offline Cabin mode;
3. require JSON;
4. reject unknown body keys;
5. reject malformed selections;
6. enforce same-origin or an explicit session-token request;
7. assemble through H3.4;
8. write through H3.5;
9. return only the resulting package bytes;
10. use private, no-store response headers;
11. use Content-Disposition: attachment;
12. remove the server temporary artifact in finally;
13. never log package content, member id, or selected ids.

## Falsifiers

### F1 — identity substitution

Defeat candidate: request body supplies memberId.

Death: route rejects it and never calls H3.4.

### F2 — hidden selection

Defeat candidate: route discovers current/recent Work, Relationship, or Memory when arrays are empty.

Death: empty arrays reach H3.4 unchanged and produce an empty package.

### F3 — writer bypass

Defeat candidate: route serializes package bytes directly.

Death: H3.5 is the only writer path.

### F4 — persistent server copy

Defeat candidate: exported artifact remains in server filesystem.

Death: temporary artifact is removed after response construction, including failure paths.

### F5 — cross-origin export

Defeat candidate: arbitrary Origin can trigger export.

Death: request is refused before H3.4.

### F6 — package content in logs

Defeat candidate: route logs body, package, member id, or selected ids.

Death: source contains no logging of those values.

### F7 — content caching

Defeat candidate: browser/proxy may cache the package.

Death: response is private and no-store.

### F8 — partial export

Defeat candidate: one invalid selected object still produces a download.

Death: H3.4 rejection occurs before H3.5 writer invocation.

### F9 — JARVIS authority expansion

Defeat candidate: JARVIS receives a new privileged export IPC channel.

Death: H3.7 adds no JARVIS IPC.

## Acceptance

H3.7 passes when an authenticated member can explicitly request a package from the connected platform, receive exactly the H3.4/H3.5-governed bytes, and leave no persistent server artifact or new JARVIS authority.

## Implementation witness

Implemented as:

- `app/api/cabin/export/route.ts`
- `app/api/cabin/export/__tests__/route.test.ts`
- `docs/design/contracts/connected-cabin-package-delivery.md`

The route authenticates the member from the existing connected session and
accepts only the three explicit selection arrays.

It rejects member identity in the body, hidden query selection, malformed or
duplicate IDs, cross-origin requests, non-JSON requests, and oversized input.

Successful delivery uses the exact H3.4 → H3.5 pipeline, reads the resulting
temporary artifact, returns it as a private no-store attachment, and removes
the server temporary path in `finally`.

Focused H3.7 route suite: **14/14 PASS**.

Combined Cabin + H3.7 delivery suite: **115/115 PASS**.

Design canon: **PASS**.

No JARVIS IPC, UI, sync, watcher, remount, MAIA cognition, Grokker ingestion,
or production deployment was introduced.

**H3.7 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

## Explicit stop boundary

H3.7 does NOT add:

- JARVIS export authority;
- automatic export;
- automatic download initiation;
- automatic local placement;
- sync;
- watcher;
- remount;
- MAIA cognition;
- Grokker ingestion;
- UI;
- production deployment.

## Architectural correction

The earlier idea of a JARVIS-owned H3.7 export action is rejected at this boundary.

JARVIS may observe the resulting local artifact through H3.6. It does not own the connected member's selection or identity.

That preserves one source-selection authority: the member's authenticated connected session.


## Implementation witness

The delivery route is implemented at:

- `app/api/cabin/export/route.ts`
- `app/api/cabin/export/__tests__/route.test.ts`

The route:

- derives identity only from `requireMemberId()`;
- refuses offline Cabin mode;
- accepts exactly the three explicit selection arrays;
- rejects member identity, query parameters, malformed ids, duplicates, wrong content type, and cross-origin requests;
- delegates source assembly/export to H3.4/H3.5;
- chooses its own short-lived server temp artifact path;
- returns only the resulting package bytes as an attachment;
- sets private/no-store response headers;
- removes the temporary server artifact in `finally`;
- does not log member id, selection, or package content;
- adds no JARVIS IPC or authority.

Focused delivery + Cabin suite: **114/114 PASS**.

Typehealth: **223 errors vs 239 baseline**; the only new diagnostic is the
pre-existing unrelated Stripe API-version mismatch at
`lib/stripe/config.ts:23`.

One H3.4 typing defect surfaced when this route caused the connected assembly
to enter the ship typecheck population. It was repaired by making the
canonical `crossing_allowed === false` invariant explicit before constructing
the Cabin memory candidate. The repair adds a falsifier for a true crossing flag.

## Standing

**H3.7 CONNECTED CABIN PACKAGE DELIVERY — IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

This is the member-authenticated connected delivery boundary.

JARVIS remains observation-only.

The earlier JARVIS-owned H3.7 request PR was closed as superseded and remains
on its separate branch as a rejected candidate.

No production deployment has occurred.
