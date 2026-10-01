# EARLY-FIELD-01 — Controlled Cohort Admission

**Date:** 2026-09-30 · **Base:** canonical `7ec42ce6f` (includes #1538, #1539) ·
**Branch:** `feat/early-field-01-cohort-gate-20260930` · **Kind:** rollout infrastructure,
not Living Field product logic.

> **A member must not meet an early field merely because the client knows that the field
> exists. Admission is decided server-side. The UI may reflect that decision; it must never
> create it.**

⛔ Not admitted · ⛔ no PR yet · ⛔ no deploy · ⛔ no migration.

---

## 1 · R1 census (read-only, before building)

| Question | Finding |
|---|---|
| Is the Living Field new? | **No.** `/maia/living-field`, 9 API routes under `/api/maia/living-field/**`, and the dashboard predate #1539 and are **live for every member in production** (runtime `04005ca7c`). |
| What did #1539 add that a member can see? | One component, **`LivingFieldInstrument`** (312 lines), mounted once in `PersonalLivingFieldDashboard.tsx`, plus shared copy changes (loading, failure and sign-in wording). The instrument has **no props and makes no data calls**: it draws the static `FIELD_TREE` (`livingFieldHierarchy.ts`). |
| Physics / Grokker prototypes | `components/maia/living-field/physics/*` are mounted by **no** app route. They are corpus, not member-visible. |
| Doorways to the Living Field | House "See the larger whole" link (`app/house/page.tsx`) · House place card (`lib/house/catalog.ts`) · `houseDestinations` · `maiaNav` · `MaiaLeftRail` · Vision Studio tab · `LivingConstellationPanel`. |
| Direct entry | `/maia/living-field` has **no rule in `config/accessMatrix.ts`** (allowed as unmapped). The page is `'use client'` with a client-side identity check; the APIs authenticate through `getMemberIdFromRequest`. |
| Existing access pattern | `lib/access/labAccess.ts` (and `circleAccess.ts`): an environment allowlist checked against the server session, failing closed, whose membership confers nothing beyond its door. Borrowed as a pattern; **not** reused as an authority. |
| Kill-switch convention | Environment flags (e.g. `MAIA_ANCHOR_CONTEXT_ENABLED`), read at runtime; a restart applies them. |
| Existing feature-flag system? | None general. This lane does not create one. |

**⚠️ The census corrected the lane's premise.** The lane was opened as though the Living Field
were new. Gating `/maia/living-field` would have **taken an existing feature away from every
member outside the cohort**, which is a production regression, not a rollout boundary. Stopped
and returned for a ruling.

## 2 · Founder ruling (2026-09-30)

- **Gate only `LivingFieldInstrument` exposure.**
- **Not gated:** the Living Field route, its APIs, the House doorway, the Vision / Practice
  Field circulation, and #1539's shared copy changes. Members outside the cohort keep the
  Living Field they already have; cohort members additionally see the instrument.
- `EARLY_FIELD_ENABLED=false` closes **only** the instrument.
- ⚠️ *Precision:* the dialog label "#1539's additions" was broader than the ruling. The
  governed object is specifically the exposure of `LivingFieldInstrument`; the copy changes
  stay universal.

## 3 · What was built

| Piece | Where | Law it carries |
|---|---|---|
| One authoritative decision | `lib/access/earlyFieldAccess.ts` → `decideEarlyField(sessionMemberId, config)` / `canEnterEarlyField(sessionMemberId)` | Pure. It has no parameter through which a client claim could arrive. |
| Server answer | `GET /api/early-field/admission` → `{ admitted: boolean }` | The member is whoever the **session** says (`getMemberIdFromRequest`, which rejects a disagreeing `x-member-id` / `maia_member_id` claim). Nothing is read from the query, body or headers. The answer is a boolean only, with no ids, no cohort size and no reason. `cache-control: no-store`. |
| Access matrix | `config/accessMatrix.ts` | `exact: '/api/early-field/admission'`, `minTier: 'free'`: authenticated members only, enforced at the proxy as well. |
| UI reflection | `useEarlyFieldAdmission()` + `PersonalLivingFieldDashboard` | Starts **closed**; opens only on an explicit `admitted === true`. Loading, a non-200, a network failure or a malformed body all stay closed. One render path: `{earlyFieldAdmitted && <LivingFieldInstrument />}`. |

**Configuration (production env, minisforum):**

```
EARLY_FIELD_ENABLED=true                         # anything else is CLOSED
EARLY_FIELD_MEMBER_IDS=<uuid>,<uuid>             # explicit cohort
```

**Fails closed on:** a missing switch · a switch not exactly `true` (so `TRUE`, `1` and
`yes` are closed) · a missing or empty list · **any** malformed entry (the whole list is then
untrusted, not partially honoured) · no authenticated member.

**Documented default:** `.env.example` ships `EARLY_FIELD_ENABLED=false`, so production starts closed.

**Separate authority:** not lab access and not founder status. Founders are **not** admitted
implicitly (unlike `labAccess`): cohort membership is explicit, and the founder is listed like
anyone else. The module imports neither `labAccess` nor `founderAuth`.

**R5 rollback:** set `EARLY_FIELD_ENABLED=false` (or unset it) and recreate the `maia`
container through the lane. No migration and no source edit. The instrument disappears for
the entire cohort; nothing else changes.

**R6, no persistence contamination:** the gate reads the environment and the session. It
writes nothing: no member rows, no Work or Living Field data, no cohort flag on
member-generated content. Admission is asked for on each visit, not remembered.

### A limit stated, not hidden

The instrument is **static client code**. The server decides whether it *renders*, but its
code ships in the page bundle, so a member who edits client state could draw it locally. That
exposes **no member data** (it has none) and grants no server capability. The hard,
server-authoritative boundary sits where authority actually matters: **the admission
decision itself, and any data or route**. There is no route to the instrument to gate: the
census test proves it has no other mount or route.

## 4 · R7 tests that wrong versions must fail

`lib/access/__tests__/earlyFieldAccess.test.ts`: **7 rules, 8 wrong versions, 5 source
checks, 4 source mutations. All pass; every wrong version fails its named rule; every rule
catches one.**

| Your defeat candidate | How it is killed |
|---|---|
| 1 · client-only gate | **DC1** (instrument rendered unconditionally) and **DC1b** (admission derived from a URL flag): real sources mutated, caught by the dashboard and hook checks · plus the check that the instrument has no other mount or route |
| 2 · fail-open configuration | **DC2** → E2 (8 untrusted configurations, all closed) |
| 3 · identity confusion | **DC3** (a claimed id beats the session) → E3 · **DC3b**: the route mutated to trust `x-member-id`, caught by the route check |
| 4 · shared lab authority | **DC4** → E4 · plus a source check that the module imports no lab or founder authority |
| 5 · rollback cosmetic only | **DC5** (switch ignored) → E5 · **DC5b**: a second, ungated render path, caught by the single-render-path check |
| 6 · broad exposure | **DC6** (any authenticated member) → E6 |
| + anonymous admitted | **DC7** → E7 |
| + admits nobody (the gate must also open) | **DC8** → E1 |

**Verification:** access and Living Field suites 5/5, 48/48. Neighbouring house, navigation
and config suites: 21/25. The 4 failing suites (5 tests) are **identical at canonical
`7ec42ce6f` without this change**: `houseNavDrift` and `journalReachability` (known), plus
**3 LOF-01 / LOF-02 failures in `facetFlowLens` and `lifeFacetFlowProjection`**, which are
red on canonical now. Routed separately, not repaired here. An isolated `tsc` over the five
touched files reports **0 diagnostics**. `check:no-supabase` passes.

## 5 · R8 observation contract (what the cohort is for)

The cohort exists to produce **witness evidence** about the instrument in ordinary use:
House → Living Field arrival; identity continuity; threshold behaviour; evidence loading and
failure states; movement among the instrument's dimensions; return circulation back into
the House; whether context survives without accidental persistence; whether the member-facing
language holds without developer explanation; and any errors, hangs or ambiguous states.

**No new telemetry.** Evidence comes from existing operational logs plus explicit witness
reports from cohort members. Adding instrumentation would need its own justification.

## 6 · R9 widening criteria (not "no one complained")

1. The real-stack walk passes on current canonical code (the #1539 walk on 3139 is still
   owed; see §8).
2. This gate passes its test suite on the PR head, and CI is green.
3. **Direct exclusion witnessed:** a signed-in member outside the cohort sees the Living Field
   without the instrument, and the admission endpoint answers `false`.
4. **Rollback witnessed:** with `EARLY_FIELD_ENABLED=false`, a cohort member no longer sees
   the instrument, and nothing else about their Living Field changed.
5. No identity leakage or cross-member context contamination.
6. No unresolved Class A defect.
7. Cohort members complete the intended circulation without developer intervention.
8. Every defect found during the cohort has an explicit disposition.

**Widening remains a founder/governance decision** after that evidence exists. Widening is an
environment change (open the list, or remove the gate in a follow-up), never implied by time
passing.

## 7 · R10 deployment law

Until EARLY-FIELD-01 is admitted, **current canon is merged but not cleared for broad
production deployment.** The next production rollout is **canonical + EARLY-FIELD-01**, not
the canonical head alone. Separately, **H1 is still merged but not admitted** (#1540 and the
browser witness are pending). A deploy must not run ahead of either.

## 8 · Parallel witness (independent of this lane)

The #1539 real-stack walk on port **3139** is still owed. Its merge did not satisfy it. Run it
with the non-sensitive test member against the canonical-equivalent Living Field code and
record the result on #1539's own evidence record.

⚠️ **Environment note, learned on the H1 walk today:** ports 3100 and 3139 share `localhost`
cookies but use different databases, where the member has different UUIDs. That makes the
Studio's API reject requests as possible impersonation. Walk **one port at a time** and clear
`localhost` site data when switching.

## 9 · Stop conditions checked

- An existing canonical rollout authority that should own this? **None found.**
- Does gating need a broader auth-contract change? **No.** It reuses `getMemberIdFromRequest`
  unchanged.
- Does the member-id configuration conflict with identity law? **No.** Ids are compared only
  against the session's own member and never accepted from the client.
- A new persistence layer? **No.**
- Becoming a general feature-flag platform? **No.** It covers one component, one variable and
  one switch.

## 10 · Duplicate lane resolved

A parallel session opened **#1541** (`claude/modest-maxwell-8vtlsn`) implementing the same
ruling by adding `early_field.instrument` to the existing `/api/maia/living-field` response.
The founder ruled this branch authoritative, preferring **admission on its own narrow server
endpoint** so the established room's API is untouched. #1541 was closed as superseded. Its
`.env.example` documentation (default closed) was carried over. No second implementation
exists.

## 11 · Merge-bar item 6: access-matrix protection, verified in code and pinned by test

The chain, each link read in source:
1. The `proxy.ts` matcher runs on every path except static assets and two named upload routes.
   `/api/early-field/admission` is covered.
2. `matchRule` checks exact rules before prefix rules, so
   `{ exact: '/api/early-field/admission', minTier: 'free' }` decides the route and no broader
   prefix can shadow it. It is not `public`.
3. For a non-public rule, `checkAccess` requires `isAuthenticated`, which the proxy derives
   server-side through `deriveVerifiedAccess` (the session token is validated against
   `auth_sessions`, unrevoked and unexpired). An unauthenticated API caller gets **401 JSON**
   before the handler runs.
4. The handler checks again through `getMemberIdFromRequest`, which verifies the session and
   rejects a conflicting `x-member-id` claim.

**Pinned by test** (`earlyFieldAccess.test.ts`): the route resolves to its own exact,
non-public `free` rule; `checkAccess(…, unauthenticated)` is refused with `unauthenticated`;
an authenticated member may ask; and a matrix mutated to mark the route `public` is detected.
Access and Living Field suites: **52/52**.
