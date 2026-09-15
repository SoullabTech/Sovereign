# AUTH-EXPOSURE-01 — Custody / Census Record (first return)

**Lane**: AUTH-EXPOSURE-01 · Member / Practitioner Authorization Boundary
**Act**: FIRST — bounded census, **READ-ONLY**
**Date**: 2026-09-15
**Subject SHA**: `1a555430` (HEAD of `claude/peaceful-archimedes-ehdddx` at census time)
**Standing**: census COMPLETE · **0 witnesses run** · **NO repair** · **PRODUCTION UNTOUCHED**

---

## 1. Custody

- Repository truth **only**. No live database, no shadow database, no production read,
  no HTTP request issued against any running system.
- No member content, real or synthetic, was read. No member identifier appears in
  this record.
- Instrument: `scripts`-free shell + node run from the scratchpad; the classification
  it produced is reproduced verbatim in Appendix A. It is a **signal scanner**, not a
  prover — §7 states what it cannot do.
- **P1-07 untouched.** No P1 branch, worker, or record was read or written.

## 2. Implicated route families (how the set was drawn)

Mechanical, not judgment: every `route.ts` under
`app/api/practitioner/**`, `app/api/practitioners/**`, `app/api/member/**`,
`app/api/members/**`, **plus** every route anywhere under `app/api` carrying a
`[clientId] | [memberId] | [userId] | [practitionerId]` segment.

**114 routes.** (`practitioner` as a bare token appears in 333 route files; that
larger set is mention, not implication, and is NOT the census subject.)

## 3. Question 6 first, because it governs every other answer

**Does middleware explicitly refuse the route, or does it pass as unmapped/default-permissive?**

`middleware.ts` runs in the **Node** runtime over effectively all paths and calls
`checkAccess()` from `config/accessMatrix.ts`. `matchRule()` resolves exact → prefix →
regex. On **no rule match** the behaviour is chosen by mode
(`config/accessMatrix.ts:726-729`):

```ts
return process.env.ACCESS_CONTROL_MODE === 'strict' ? 'strict' : 'permissive';
```

- `strict` (Mode B) → unmapped route **denied 404** (`middleware.ts:392-403`).
- `permissive` (Mode A, **the default**) → unmapped route **allowed**, flagged only.

`ACCESS_CONTROL_MODE` is set **nowhere in the repository** — not in compose files,
Dockerfiles, deploy scripts, or committed env material (searched at the subject).
Four prior records independently state that production leaves it unset:
`docs/reviews/HOUSE_00_STANDING_RECORD.md` (SR-56, F-14, issue #732),
`docs/reviews/TIER_ENFORCEMENT_AUDIT_2026-07-30.md`,
`docs/reviews/LAYER2_REACHABILITY_SCREENING_2026-07-30.md`,
`docs/architecture/HOUSE_MAP_RECONCILIATION_2026-07-23.md`.

⚠️ **This lane did not read the production environment** (not authorized, and the act
is read-only). The mode's production value is therefore **WIRED-BUT-UNOBSERVED by this
lane**, corroborated by four prior records. It is the single fact on which most of the
classification below turns, and a later witness should establish it first.

**Census result against the matrix:**

| middleware standing | routes |
|---|---:|
| UNMAPPED (permissive pass-through) | **79** |
| `tier=pro, roles=[practitioner, admin]` | 23 |
| PUBLIC (declared) | 6 |
| `tier=free` (authed only) | 5 |
| `tier=pro` (no role requirement) | 1 |

**69% of the implicated surface carries no access-matrix rule.** For those 79 routes
middleware contributes nothing to authorization; the handler is the only authority.

Two adjacent facts recorded, neither pursued:
- `middleware.ts:344-374` — on `insufficient-tier`, if the rule declares no
  `rolesAnyOf` or the caller satisfies it, the request is **forwarded** with a logged
  `Tier gate bypassed`. Tier is advisory on those paths. Out of this lane's subject.
- `middleware.ts:170-184` — a **dev bypass** forwards `x-access-roles: practitioner`,
  `x-access-tier: pro`, `x-access-authed: true` for `/api/stellium/*` and
  `/api/notifications/*` when `NODE_ENV === 'development'`. Production is unaffected by
  its own guard; recorded because `/api/stellium/chart/[clientId]` is a census finding
  (F-05) and this is the one path where its gate evaporates.

## 4. What the boundary already holds (stated first, because it is load-bearing)

A prior lane — **AUTH-BOUNDARY-01 / 01B** — closed the identity-header hole, and the
census confirms it intact at the subject:

- `lib/auth/identityAssertions.ts` names the client-forgeable identity headers in one
  place (`x-member-id`, `x-maia-member-id`, `x-maia-roles`, `x-maia-tier`, and every
  `x-access-*` middleware-derived name) and middleware **strips all of them inbound**
  before any handler runs (`forwardSanitized`, `middleware.ts:99-109`).
- `lib/auth/getMemberFromRequest.ts` resolves identity from an `auth_sessions`-backed
  credential (`maia_session` cookie, or `x-session-token`), and treats `x-member-id` /
  `maia_member_id` as **claims**: honored only when they match the session-resolved
  member, rejected as impersonation on mismatch.
- **92 of 114** implicated routes (81%) derive actor identity through a named session
  resolver — `getMemberIdFromRequest` (33), `requireMemberId` (30),
  `getCurrentSession` (15), `getAuthenticatedMember` (10), and the
  `getMemberIdIfAuthenticated` fallbacks.
- **22 of 114** additionally call a relationship verifier from
  `lib/practitioner/auth` (`verifyPracticeOwnership`, `verifyContainerAccess`,
  `verifyTaskAccess`, `verifySessionAccess`).

**The exposure question at this subject is not "is there an authority boundary".
There is one, and most of the surface uses it. The question is whether the paths that
do not use it can be reached and what crosses when they are.**

## 5. Findings — the paths where actor identity is not session-derived

Every row below is classified **`WIRED-BUT-UNOBSERVED`**. No witness was run; none is
authorized by this act. Severity language is deliberately absent — an implementation
reading is not an exploitability claim.

### F-01 · `POST /api/practitioners/create` — practitioner status for an arbitrary member
*(answers Q8 directly)*

- Actor identity: middleware only — rule is `{ exact: '/api/practitioners/create', minTier: 'pro' }`,
  **no `rolesAnyOf`**. The handler derives no actor.
- Target: `memberId` from the **request body** (`route.ts:47`).
- Effect: inserts a `practitioners` row for that member and runs
  `UPDATE members SET is_practitioner = true … WHERE id = $1` (`route.ts:161`).
- Relationship check: none. Consent check: none.
- Reading: an authenticated **pro-tier** caller can elevate a member identifier they
  have no relationship to. The caller is authenticated; **the target is not the actor**.
- Crossing: practitioner status + practice slug/name; member name is read (`SELECT id, name`).

### F-02 · `POST|GET /api/members/migrate-data` — cross-identity row reassignment
- UNMAPPED. No session resolver.
- Both identifiers come from the body / query (`oldUserId`, and the GET variant reads
  `searchParams.get('oldUserId')`).
- Effect: enumerates tables carrying a `user_id` column from `information_schema` and
  runs `UPDATE ${table} SET user_id = $1 WHERE user_id = $2` across them.
- Relationship check: none. Consent check: none.
- Crossing: **ownership of member rows across arbitrary tables**, plus per-table row
  counts for a supplied identifier on the GET path.

### F-03 · `POST|GET /api/members/progress`
- UNMAPPED. No session resolver. `memberId` from body (POST) and
  `searchParams.get('memberId')` (GET).
- Effect: `UPDATE members SET onboarding_step`, `SET youth_onboarded = true`;
  GET returns `onboarded, onboarding_step` for the supplied identifier.
- Crossing: onboarding state of an arbitrary member; **`youth_onboarded` is a
  minority-status flag**, recorded as metadata whose crossing is not neutral.

### F-04 · `POST /api/members/preferred-name`
- UNMAPPED. No session resolver. `userId` from body.
- Effect: `UPDATE members SET preferred_name = $1 WHERE id = $2`.
- Reading: **the name MAIA calls a member by is writable by a caller who is not that
  member.** Recorded in this lane as an authorization finding; its relational weight is
  named, not adjudicated.

### F-05 · `GET /api/stellium/chart/[clientId]` — relationship checked against an assertion
- Middleware: `{ prefix: '/api/stellium', minTier: 'pro', rolesAnyOf: ['practitioner','admin'] }`
  — a real gate, and the strongest one in this finding set.
- Actor identity: **`practitionerId` from the query string** (`route.ts:56`).
  `clientId` from the URL.
- The route then calls `getClient(practitionerId, clientId)` — so a
  practitioner↔client relationship **is** checked, but **keyed on a caller-supplied
  practitioner identifier rather than the authenticated one**.
- Crossing on match: `client.birth_date`, `client.birth_time`, derived chart and transits.
- ⭐ This is the census's clearest instance of the lane's own thesis: *the gate exists
  and is checked; what it is checked against is not authority.*
- Compounding: this prefix is one of the two **dev-bypass** paths (§3).

### F-06 · `GET|POST /api/practitioners/onboarding`
- UNMAPPED. No session resolver. `practitionerId` from `searchParams` (GET) and body (POST).
- Effect: reads a practitioner + joined member row; `UPDATE practitioners … WHERE id = $1 AND status = 'onboarding'`.
- The `status = 'onboarding'` predicate narrows the window; it is not an actor check.

### F-07 · `POST /api/practitioners/verify-passcode` — a grant keyed on someone else's credential
- UNMAPPED, but the handler **does** derive the actor (`getAuthenticatedMember`, refuses without it).
- Branch: if the submitted passcode starts with `SOULLAB-`, the route asks
  `SELECT id FROM members WHERE passkey = $1` — i.e. **does this passcode belong to
  any member** — and on a hit grants `portal_access = true` **to the caller**
  (`route.ts:47-58`).
- Reading: the credential presented need not be the caller's own. Authenticated
  self-elevation on a shared-secret check that is not bound to the actor.

### F-08 · `GET /api/sovereignty/my-data-summary/[userId]` — shape only
- Mapped `tier=free`. Actor identity comes **entirely from the URL segment**.
- ⛔ **No member data crosses.** The handler returns a hard-coded constant payload and
  echoes the supplied `userId`. Recorded because the *shape* is the finding; the
  boundary has nothing behind it to yield. Any later repair pass must not report this
  as a data exposure.

### Paths examined and found to refuse
- `app/api/practitioner/clients/[clientId]/{prep,messages,digest,emergency,policy,spiralogic-report}`
  — `requireMemberId()` then a library call scoped by `practitioner_id`; a miss returns
  **403 rather than 404, deliberately, so existence does not leak**. This is the pattern
  the rest of the surface should be measured against.
- `app/api/practitioner/practices` — session via `getMemberIdIfAuthenticated` fallback,
  rows scoped `WHERE owner_user_id = $1`; the file's own comment names the defeated
  error (*"UUIDs are exposed to clients, so 'the row exists' was never evidence that the
  caller is that member"*).
- `app/api/members/change-password` — origin/referer check, then `maia_session` cookie
  validated against `auth_sessions` **inline in raw SQL**. It scans as `NOSIGNAL`; it is
  not ungated. See §7.
- The remaining 14 `NOSIGNAL` routes under `app/api/members/**` are
  **credential-establishing** (signin, signout, register\*, recover, magic-link,
  email-code, reset-password, verify-email, enter, session, lookup-email,
  send-verification). They are pre-authentication by construction; whether each
  correctly establishes a credential is a **different lane's question**, and this lane
  does not open it.

## 6. Answers to the nine questions, in one place

| # | Question | Census answer |
|---|---|---|
| 1 | Who is the authenticated caller? | Session-derived on **92/114**; on F-01…F-06 the handler asks no such question |
| 2 | Where does actor identity come from? | **session 92** · no named resolver **22**, of which: body 1 (F-04) · query 1 (F-06) · query+body 1 (F-03) · URL+query 1 (F-05) · and **18** carrying no identifier-source token, hand-resolved as 14 credential-establishing routes + `change-password` (session in raw SQL) + `migrate-data` (F-02) + `my-data-summary` (F-08) + `practitioners/check` (public existence check). F-01 has no handler-side derivation at all |
| 3 | Whose member identifier controls the resource? | On every F-row: **an identifier supplied by the caller** |
| 4 | Relationship checked? | 22/114 call a named verifier; F-05 checks one against an assertion; F-01…F-04, F-06 check none |
| 5 | Consent checked? | `consent` appears in 11/114, all on session-derived paths; **no F-row consults consent** |
| 6 | Middleware refuse, or pass unmapped? | **Passes** — 79/114 unmapped, permissive default, `ACCESS_CONTROL_MODE` unset (§3) |
| 7 | What can cross? | practitioner status (F-01) · row ownership across tables (F-02) · onboarding + `youth_onboarded` (F-03) · preferred name — write (F-04) · **birth date/time + chart** (F-05) · practitioner + joined member row (F-06) · portal access (F-07) · nothing (F-08) |
| 8 | `is_practitioner` elevation without an authorized actor? | **F-01: at implementation level, yes** — body-supplied target, pro tier the only gate. The other two writers (`studio/personal/enter`, `team/members/[memberId]`) derive the member from the session and are self-scoped |
| 9 | Reachable at the subject? | **Statically yes** — all F-row files exist and export the named handlers at `1a555430`. **Runtime reachability is unwitnessed** and gated on §3's unread environment value |

## 7. What this instrument cannot do — stated so it is not mistaken for proof

1. **It scans for a named vocabulary.** `members/change-password` authenticates in raw
   SQL and scanned as `NOSIGNAL` on the first pass; the vocabulary was widened twice
   (adding `getAuthenticatedMember`, `getCurrentSession`, `getMemberIdIfAuthenticated`,
   `getMemberIdWithFallback`) and each widening moved routes out of the suspect set.
   **A gate written outside the vocabulary reads as silence.** `NONE LOCATED` is not
   `ABSENT`.
2. **It reasons about matched rules, not served requests.** The access-matrix matching
   in Appendix A reimplements `matchRule()` over the rule literals; dynamic segments
   were substituted with a placeholder, which is sound for `prefix` rules and cannot
   match an `exact` rule. A rule declared in a form the extractor did not parse would
   show as UNMAPPED.
3. **No witness was run.** Nothing here is `PROVED EXPOSURE`. An implementation that
   reads as open may be unreachable behind a shell, a client that never calls it, a
   proxy rule, or a runtime error on the first line.
4. **The production value of `ACCESS_CONTROL_MODE` was not read.**

## 8. Unresolved unknowns (carried, not closed)

- **U-1** Production `ACCESS_CONTROL_MODE`. Decides whether 79 unmapped routes are
  reachable at all. **The first thing any witness act should establish.**
- **U-2** Whether an unauthenticated request actually reaches these handlers in
  production, or is refused earlier by Caddy, the shell, or a route-level export
  the scanner did not model.
- **U-3** Whether the `practitioners` / `rl_practices` / `portal_passcodes` tables
  hold live rows. Absent that, several findings are shape without substance (as F-08
  demonstrably is).
- **U-4** Whether any client in the repository calls F-01…F-06 with a non-self
  identifier — i.e. whether the body/query identifier is a *design* or a *residue*.
- **U-5** The P1-02 Domain I record itself (§0 of the charter). Not located here.

## 9. Standing

**AUTH-EXPOSURE-01 · FIRST ACT COMPLETE · census READ-ONLY · 114 routes classified ·
8 findings, all `WIRED-BUT-UNOBSERVED` · 0 `PROVED EXPOSURE` · 0 `PROVED REFUSAL` by
witness · WITNESS NOT AUTHORIZED · REPAIR NOT AUTHORIZED · SCHEMA UNTOUCHED ·
SOURCE UNCHANGED · PRODUCTION UNTOUCHED · P1-07 UNDISTURBED.**

**STOP before repair.**

---

## Appendix A — full classification table (114 routes)

`middleware gate` is the rule `matchRule()` resolves; `handler signals` are the
scanner's tokens: `SESSION` (named resolver) · `RELGATE` (named relationship
verifier) · `PARAM|QUERY|BODY` (identifier taken from that source) · `CONSENT?`
(the token `consent` appears) · `NOSIGNAL` (none of the above — see §7.1).

| middleware gate | handler signals | path |
|---|---|---|
| PUBLIC | NOSIGNAL | `/api/members/register-email` |
| PUBLIC | NOSIGNAL | `/api/members/signin` |
| PUBLIC | NOSIGNAL | `/api/practitioners/check` |
| PUBLIC | SESSION | `/api/members/check` |
| PUBLIC | SESSION | `/api/members/register` |
| PUBLIC | SESSION | `/api/practitioner/X/pricing` |
| UNMAPPED | BODY | `/api/members/preferred-name` |
| UNMAPPED | NOSIGNAL | `/api/members/change-password` |
| UNMAPPED | NOSIGNAL | `/api/members/email-code` |
| UNMAPPED | NOSIGNAL | `/api/members/email-code/verify` |
| UNMAPPED | NOSIGNAL | `/api/members/enter` |
| UNMAPPED | NOSIGNAL | `/api/members/lookup-email` |
| UNMAPPED | NOSIGNAL | `/api/members/magic-link` |
| UNMAPPED | NOSIGNAL | `/api/members/migrate-data` |
| UNMAPPED | NOSIGNAL | `/api/members/recover` |
| UNMAPPED | NOSIGNAL | `/api/members/register-local` |
| UNMAPPED | NOSIGNAL | `/api/members/reset-password` |
| UNMAPPED | NOSIGNAL | `/api/members/send-verification` |
| UNMAPPED | NOSIGNAL | `/api/members/session` |
| UNMAPPED | NOSIGNAL | `/api/members/signout` |
| UNMAPPED | NOSIGNAL | `/api/members/verify-email` |
| UNMAPPED | QUERY BODY | `/api/members/progress` |
| UNMAPPED | QUERY | `/api/practitioners/onboarding` |
| UNMAPPED | SESSION CONSENT? | `/api/member/memory-contracts` |
| UNMAPPED | SESSION CONSENT? | `/api/member/portal` |
| UNMAPPED | SESSION CONSENT? | `/api/members/bazi-profile` |
| UNMAPPED | SESSION CONSENT? | `/api/members/export-data` |
| UNMAPPED | SESSION CONSENT? | `/api/members/profile` |
| UNMAPPED | SESSION CONSENT? | `/api/practitioner/practice-field/draft` |
| UNMAPPED | SESSION CONSENT? | `/api/practitioner/practice-field/invite` |
| UNMAPPED | SESSION CONSENT? | `/api/practitioner/referrals/requests/X/consent` |
| UNMAPPED | SESSION PARAM | `/api/practitioner/clients/X/digest` |
| UNMAPPED | SESSION PARAM | `/api/practitioner/clients/X/emergency` |
| UNMAPPED | SESSION PARAM | `/api/practitioner/clients/X/messages` |
| UNMAPPED | SESSION PARAM | `/api/practitioner/clients/X/policy` |
| UNMAPPED | SESSION PARAM | `/api/practitioner/clients/X/prep` |
| UNMAPPED | SESSION PARAM | `/api/practitioner/clients/X/spiralogic-report` |
| UNMAPPED | SESSION QUERY CONSENT? | `/api/members/recall-preferences` |
| UNMAPPED | SESSION QUERY CONSENT? | `/api/members/settings` |
| UNMAPPED | SESSION QUERY | `/api/practitioner/X/client/subscribe` |
| UNMAPPED | SESSION RELGATE | `/api/practitioner/tasks/X` |
| UNMAPPED | SESSION | `/api/members/active-protocol` |
| UNMAPPED | SESSION | `/api/members/beads` |
| UNMAPPED | SESSION | `/api/members/delete-account` |
| UNMAPPED | SESSION | `/api/members/entitlements` |
| UNMAPPED | SESSION | `/api/members/ledger` |
| UNMAPPED | SESSION | `/api/members/ledger/annotate` |
| UNMAPPED | SESSION | `/api/members/me` |
| UNMAPPED | SESSION | `/api/members/password` |
| UNMAPPED | SESSION | `/api/members/patterns` |
| UNMAPPED | SESSION | `/api/members/patterns/X/label` |
| UNMAPPED | SESSION | `/api/members/patterns/X/response` |
| UNMAPPED | SESSION | `/api/members/spiral-state` |
| UNMAPPED | SESSION | `/api/members/tester` |
| UNMAPPED | SESSION | `/api/members/themes` |
| UNMAPPED | SESSION | `/api/practitioner/maia-guidance` |
| UNMAPPED | SESSION | `/api/practitioner/materials` |
| UNMAPPED | SESSION | `/api/practitioner/materials/X` |
| UNMAPPED | SESSION | `/api/practitioner/messages` |
| UNMAPPED | SESSION | `/api/practitioner/messages/X` |
| UNMAPPED | SESSION | `/api/practitioner/messages/X/reply` |
| UNMAPPED | SESSION | `/api/practitioner/policies` |
| UNMAPPED | SESSION | `/api/practitioner/practice-field` |
| UNMAPPED | SESSION | `/api/practitioner/practice-field/X/containment` |
| UNMAPPED | SESSION | `/api/practitioner/programs` |
| UNMAPPED | SESSION | `/api/practitioner/programs/X` |
| UNMAPPED | SESSION | `/api/practitioner/projects` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/connections` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/connections/X/block` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/connections/X/respond` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/connections/request` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/directory` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/profile` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/requests` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/requests/X` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/requests/X/close` |
| UNMAPPED | SESSION | `/api/practitioner/referrals/requests/X/send` |
| UNMAPPED | SESSION | `/api/practitioner/safety/X` |
| UNMAPPED | SESSION | `/api/practitioner/sliding-scale/awards` |
| UNMAPPED | SESSION | `/api/practitioner/sliding-scale/awards/X/end` |
| UNMAPPED | SESSION | `/api/practitioner/sliding-scale/policy` |
| UNMAPPED | SESSION | `/api/practitioner/sliding-scale/requests` |
| UNMAPPED | SESSION | `/api/practitioner/sliding-scale/requests/X` |
| UNMAPPED | SESSION | `/api/practitioner/sliding-scale/requests/X/decide` |
| UNMAPPED | SESSION | `/api/practitioners/verify-passcode` |
| tier=free | NOSIGNAL | `/api/sovereignty/my-data-summary/X` |
| tier=free | SESSION PARAM | `/api/circles/X/members/X/remove` |
| tier=free | SESSION PARAM | `/api/team/admin/members/X` |
| tier=free | SESSION PARAM | `/api/team/members/X` |
| tier=free | SESSION | `/api/studio/teams/X/members/X` |
| tier=pro,roles=practitioner,admin | PARAM QUERY | `/api/stellium/chart/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE CONSENT? | `/api/practitioner/sessions/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/containers/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/containers/X/sessions` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/containers/X/transition` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/containers` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/dashboard` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/dashboard` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/meetings` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/meetings/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/meetings/X/action-items` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/network` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/network/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/opportunities` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/opportunities/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/people/X/timeline` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/pipeline` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/ventures` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/labtools/ventures/X` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/people` |
| tier=pro,roles=practitioner,admin | SESSION RELGATE | `/api/practitioner/practices/X/tasks` |
| tier=pro,roles=practitioner,admin | SESSION | `/api/practitioner/practices` |
| tier=pro | SESSION | `/api/practitioners/create` |
