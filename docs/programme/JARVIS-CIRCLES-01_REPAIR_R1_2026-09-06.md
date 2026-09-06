# CIRCLE-04 · R1 — B-01 access containment

**Status:** IMPLEMENTED · ⛔ **NOT VERIFIED — a founder verifier run is required before R2 begins.**

## The defect

`app/commons/circles/layout.tsx` called `requireFounder()`, so the **pages** were closed.
**A Next.js layout does not run for route handlers.** `config/accessMatrix.ts` declared the whole
`/api/circles` prefix at `minTier: 'free'`, and all 16 routes resolved identity with
`getMemberIdFromRequest()` alone. **The API was open to any authenticated free-tier member while
the UI told them Circles were closed for v1.**

Not an inter-Circle data leak — the first production run confirmed membership scoping holds under
real principals. **A declared-vs-enforced mismatch:** the sentence *"Circles is not open for v1"*
described the UI only.

## The repair

**New:** `lib/circles/circleAccess.ts` — `requireCircleAccess(request)`.
**Changed:** all **16 route files / 18 call sites** now go through it. Zero residual
`getMemberIdFromRequest` references under `app/api/circles/`.

```
401  no valid session
403  authenticated, but Circles are not open to this member
```

Three deliberate choices:

1. **Same authority the UI gate uses** — `isFounderMemberId()`, not a new allowlist. A named cohort
   authority (`CIRCLE_ACCESS_MEMBER_IDS`, on the `lib/access/labAccess.ts` pattern) belongs to
   INVOKE, **which is not authorized.** Adding one now would be the access redesign the founder
   forbade.
2. **Identity still resolves via `getMemberIdFromRequest()`, not `requireFounder()`** — the latter
   is cookie-only via `getCurrentSession()`, which would have broken the iOS `x-session-token`
   transport for a founder. The gate is layered on verified identity, never replacing it.
3. **Membership scoping untouched.** `getCircleWithMembership()` still scopes every read and write.
   R1 adds a door; it does not touch the rooms.

⛔ Recorded in the module: **do not add anyone to `FOUNDER_MEMBER_IDS` to get them into a Circle** —
that hands over the founder console, Book Studio drafts and the render pipeline as a side effect,
the exact misclassification the 2026-09-04 Lab Tools ruling forbade.

**Access matrix annotated** rather than silently diverging: both entries now state DECLARED free /
ENFORCED founder-only, following the existing `/book-studio/*` and `/labtools` precedent. The tier
is left at `free` deliberately — the tier system is not the authority here, and declaring a tier the
founder allowlist does not correspond to would be a second fiction.

**Note:** `/commons/join` stays a public page, but its submit target `/api/circles/join` is now
gated. A non-founder following an invite link reaches the page and receives 403 on submit. That is
the correct posture while Circles are closed; it becomes a real UX question at INVOKE.

## Verifier: R1 is now falsifiable

R1 would otherwise have landed **unverifiable** — the verifier calls services directly and never
exercises an HTTP route, so nothing in the existing 22 assertions could detect a re-opened API.

**Added C13** (Group C, static): every file under `app/api/circles/` must import
`requireCircleAccess` and **must not** reference `getMemberIdFromRequest` — a direct call is exactly
how the gap existed. **23 assertions now.**

## Expected next run

```text
18 passed · 5 failed        (was 17 passed · 5 failed)
```

- **C13 → PASS** (new).
- **S4 → still FAIL**, with its corrected message: `FR-03/FR-11 lifecycle/plurality boundary is not
  representable`. ⛔ Not softened; R3 closes it.
- C6 · C7 · C8 · T3 → **unchanged FAIL**. R1 touches none of them.
- **No previously-passing assertion may weaken.** If any does, R1 regressed and must be reverted
  before R2.

⚠️ **This is an expectation, not evidence.** No `DATABASE_URL` and no `node_modules` in a remote
session.

```bash
docker exec maia-sovereign sh -c \
  'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-circles.ts'
```

## What R1 does not do

Does not lift the founder gate · does not open cohorts · does not build discovery · does not change
membership scoping, consent, or revocation · does not touch production.
**B-01 is not CLOSED until a run shows C13 passing with no regression.**
