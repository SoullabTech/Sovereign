# AUTH-01-C — Raw `x-member-id` Authority Census

**Act class:** C0 deterministic inspection. ⛔ **No mutation.** No fix, no refactor, no PR, no
middleware change. No request was sent to production or anywhere else.
**Authority:** founder authorization, 2026-08-24.
**Date:** 2026-08-24

## §0 Referent binding

```
repository   SoullabTech/Sovereign
origin       https://github.com/SoullabTech/Sovereign
branch       claude/signin-form-field-order-c5h4u1
HEAD         e67332a1c24c1e673c1673a2bfa707a2204db6c2
worktree     clean — 0 modified, 0 untracked
clone        ⚠️ SHALLOW — 167 commits
```

⚠️ The shallow clone bounds history claims. Nothing here asserts what a route *used to* do.

## §1 Population — reproducible

Two structurally different methods, agreeing exactly:

```bash
# M1 — filesystem walk
for f in $(grep -rl "x-member-id" --include=route.ts app/api); do
  grep -q "getMemberFromRequest" "$f" || echo "$f"; done            → 27

# M2 — git index (tracked-at-HEAD), set difference
comm -23 <(git grep -l "x-member-id"          -- 'app/api/**/route.ts' | sort) \
         <(git grep -l "getMemberFromRequest" -- 'app/api/**/route.ts' | sort)  → 27
```

`diff` of the two result sets: **empty**. Population is exactly reproducible at 27. ✅ STOP
condition not triggered.

## §2 Evidence class — read this before acting on §4

Every classification below is derived from **source inspection**. The composition test
(*unauthenticated request + arbitrary `x-member-id`*) was evaluated **by reading the code path**,
not by executing it. No request was issued.

```
CLASSIFICATION EVIDENCE   source-read      ✅ executed (grep/read, deterministic)
RUNTIME EXPLOITATION      ⛔ NOT ATTEMPTED, NOT WITNESSED
```

⭐ A source-read `UNSAFE AUTHORITY` verdict is a **statement about the code path**, not a witnessed
exploit. It is strong enough to act on and it is not the same claim. Do not upgrade it in retelling.

## §3 Middleware reachability — measured, not assumed

The founder asked whether middleware presence checks materially change reachability. **They do
not.** Three findings, each cited:

1. **`isAuthenticated()` accepts the attacker's own header.** `middleware.ts:87-88` — any non-empty
   `x-member-id` returns `true`. The caller supplies the header the gate checks.
2. **Unmapped API routes are ALLOWED by default.** `config/accessMatrix.ts:643-645` —
   `getAccessMode()` returns `'permissive'` unless `ACCESS_CONTROL_MODE === 'strict'`.
   `checkAccess():673-686` allows any unmapped path in permissive mode. Of the 27, only
   `/api/sovereign/*`, `/api/studio/*` and `/api/practitioner/practices` match a rule at all.
3. **Tier and role come from caller-controlled cookies.** `middleware.ts:34,56` read `maia_tier`
   and `maia_roles` from cookies. So even the rule that *does* match `/api/practitioner/practices`
   (`minTier: 'pro'`, `rolesAnyOf: ['practitioner','admin']`) is satisfiable by setting a cookie.

**Conclusion:** middleware neither blocks nor materially narrows any route in this population. It
is a gate whose key the requester holds.

## §4 The matrix

`role` = what `x-member-id` (or an equivalent caller-controlled field) does in the route.

| # | Path | Credential source | `x-member-id` role | MW dep | Downstream privileged op | Class |
|---|---|---|---|---|---|---|
| 1 | `admin/monitoring/route.ts` | **none** | sole gate (`:7`) | none | service status + incident history | 🔴 UNSAFE |
| 2 | `admin/monitoring/run-checks/route.ts` | **none** | sole gate (`:7`) | none | **POST — runs all system checks** | 🔴 UNSAFE |
| 3 | `admin/monitoring/system/route.ts` | **none** | sole gate (`:85`) | none | host memory, loadavg, disk, containers, deploy age, ollama models | 🔴 UNSAFE |
| 4 | `admin/security/sessions/route.ts` | `isAdminRequest()` (`:24`) | ⛔ refused by design | none | session revoke | ✅ VERIFIED CREDENTIAL |
| 5 | `astrology/spiralogic-report/route.ts` | `requireMemberId()` (`:27,:63`) | delegated to the helper | none | report generation | ✅ VERIFIED CREDENTIAL |
| 6 | `auth/native-biometry/enable/route.ts` | `trusted_devices WHERE id=$1 AND member_id=$2` (`:54-59`) | claim, cross-checked | none | enable biometry on a device | ✅ CLAIM CROSS-CHECKED |
| 7 | `auth/native-biometry/verify/route.ts` | same + expiry (`:70-93`) | claim, cross-checked | none | **creates a session** | ✅ CLAIM CROSS-CHECKED |
| 8 | `auth/whoami/route.ts` | **existence check only** (`:113-120`) | becomes identity | none | **returns `authed: true` + username, name, tier, is_practitioner** | 🔴 UNSAFE |
| 9 | `content/posts/route.ts` | **none** | `WHERE member_id = $1` (`:7,:32,:61`) | none | read **and write** member content posts | 🔴 UNSAFE |
| 10 | `field-analytics/report/route.ts` | **none** | `getEntitlements(memberId)` (`:30-36`) | none | entitlement decision → analytics | 🔴 UNSAFE |
| 11 | `members/me/route.ts` | session first, else header (`:105`), else **`?id=` query param** (`:115`) | becomes identity — **no existence check** | none | full member profile | 🔴 UNSAFE |
| 12 | `members/register-local/route.ts` | mints a real session (`:131-133`) | ⛔ comment only — names the header as forgeable | none | — | ⚪ NON-AUTHORITY |
| 13 | `members/register/route.ts` | mints a real session (`:252-256`) | ⛔ comment only — same | none | — | ⚪ NON-AUTHORITY |
| 14 | `portal/[slug]/auth/route.ts` | cookie `member_id` **or** header (`:61-66`) | becomes identity | none | practitioner record incl. **`m.email`** | 🔴 UNSAFE |
| 15 | `portal/[slug]/client/status/route.ts` | **none** | becomes identity (`:26`) | none | discloses practitioner↔client relationship | 🔴 UNSAFE |
| 16 | `portal/[slug]/invites/create/route.ts` | cookie or header (`:30`) | becomes identity | none | **creates portal invites** | 🔴 UNSAFE |
| 17 | `practitioner/practice-field/draft/route.ts` | **none** | sole gate (`:42`) | none | **Anthropic API call** — cost/abuse surface | 🔴 UNSAFE |
| 18 | `practitioner/practices/route.ts` | session first, else header + UUID + **existence check** (`:29-38`) | becomes identity on fallback | rule exists but cookie-satisfiable (§3.3) | practice management | 🔴 UNSAFE |
| 19 | `practitioner/projects/route.ts` | **none** | becomes identity (`:16`) | none | practitioner business record | 🔴 UNSAFE |
| 20 | `pricing/check-prompt/route.ts` | **none** | `SELECT … FROM members WHERE id=$1` (`:25,:94`) | none | read tier; **write** prompt records | 🔴 UNSAFE |
| 21 | `pricing/helper-fund/apply/route.ts` | **none** | becomes identity (`:14,:80`) | none | **submits a hardship application as another member**; discloses pending-application status | 🔴 UNSAFE |
| 22 | `pricing/helper-fund/contribute/route.ts` | **none** | becomes identity (`:18,:101`) | none | **records a financial contribution** | 🔴 UNSAFE |
| 23 | `reader/ask/route.ts` | **none** | sole gate (`:8`) | none | member-scoped read + **LLM call** | 🔴 UNSAFE |
| 24 | `reader/moments/route.ts` | **none** | `WHERE rm.member_id = $1` (`:12,:49`) | none | read **and write** member reading moments | 🔴 UNSAFE |
| 25 | `sovereign/app/maia/route.ts` | **none** | **`userId` from the request BODY** (`:97,:102`); header as fallback (`:367`) | rule `/api/sovereign` minTier free — satisfied by §3.1 | **reads developmental memories + theme signals; WRITES `relationship_entries`** | 🔴 UNSAFE |
| 26 | `studio/integrations/route.ts` | **none** | **`?memberId=` query param** or header (`:18`) | rule `/api/studio` minTier free — satisfied by §3.1 | discloses connected Google/Microsoft **calendar email addresses** | 🔴 UNSAFE |
| 27 | `telemetry/client/route.ts` | n/a | label on a bounded, allow-listed event (`:88-90`) | none | none — no read, write, or access decision | ⚪ NON-AUTHORITY |

## §5 Counts

```
🔴 UNSAFE AUTHORITY          20
✅ SAFE — VERIFIED CREDENTIAL  2      (#4, #5)
✅ SAFE — CLAIM CROSS-CHECKED  2      (#6, #7)
⚪ NON-AUTHORITY USE           3      (#12, #13, #27)
❓ UNKNOWN                     0
                             ────
                              27
```

Every route resolved. No route depended on an unresolved helper. ✅ No STOP condition triggered.

## §6 Immediate finding — reported, NOT repaired

> **20 of 27 routes let a caller-controlled value become member identity or grant access, with no
> independent credential verification. Middleware does not mitigate this (§3).**

Four warrant naming individually.

### 6.1 `sovereign/app/maia` — identity from the request body, on the primary route

`POST` destructures `userId` from the **JSON body** (`:97,:102`). The handler contains no
`getCurrentSession`, no `requireMemberId`, and no identity 401. `probeAuthPosture(req)` at `:366`
is log-only by its own comment and by `lib/auth/authPostureProbe.ts` (`console.log`, returns).

`userId` then drives `touchActiveSession({memberId: userId})` (`:148`), `getCognitiveProfile`
(`:158`), `loadRecentDevelopmentalMemories(userId, 3)` and `loadRecentThemeSignals(userId, 10)`
(`:226-227`), and `observeRelationalContent(observerMemberId, …)` (`:367-371`) — which the route's
own comment describes as auto-creating a `member_relationships` row and writing
`relationship_entries` containing MAIA's summary of the member's relational material.

By the same comment, this route carries **~99.6% of live conversation traffic**.

⚠️ **Sovereignty consequence, not merely a security one.** A forged `userId` reads one member's
developmental memory into a prompt and writes relational content attributed to them. That is the
Ruling-1 boundary and the Sanctuary boundary, reachable from an unauthenticated request.

### 6.2 `auth/whoami` — the known-bad pattern, in the route that answers "am I authenticated?"

`:113-133` — header present, no cookie → `SELECT … FROM members WHERE id = $1` → on any row,
returns `authed: true` with username, name, tier, `is_practitioner`.

⭐ This is **precisely** the pattern `lib/auth/getMemberFromRequest.ts:19-22` documents as
previously fixed and dangerous: *"A previous version trusted `x-member-id` / `maia_member_id` after
a mere existence check … an attacker could set the header to a known member id and impersonate that
member."* The hardened resolver exists; `whoami` does not use it.

Note `components/auth/UnifiedAuth.tsx:135` calls `/api/auth/whoami` to decide whether to redirect a
visitor into `/maia`.

### 6.3 `members/me` and `studio/integrations` — exploitable by URL alone

Both accept a **query parameter**, so no custom header is needed:
`members/me?id=<uuid>` (`:115`) returns a full member profile; `studio/integrations?memberId=<uuid>`
(`:18`) returns connected Google/Microsoft **calendar email addresses**. `members/me` does not even
perform the existence check that `whoami` does — a well-formed UUID is accepted as identity.

### 6.4 The `pricing/helper-fund/*` pair — dignity, not just data

`apply` (`:14`) submits a **financial-hardship application** in another member's name and discloses
whether a member has one pending. `contribute` (`:18`) records a contribution as another member.
Flagged separately because the harm here is not disclosure of a record; it is a false act
attributed to a person about their own material circumstances.

## §7 What this census did NOT do

⛔ No fix, no refactor, no PR, no middleware change, no schema change. ⛔ No request sent to
production or any environment. ⛔ No exploit attempted or witnessed. ⛔ No route outside the 27
inspected. ⛔ No claim about history (shallow clone). ⛔ AUTH-01-E2 not started, per founder
sequencing.

## §8 Standing

```
POPULATION REPRODUCIBLE   ✅ VERIFIED — two structurally different methods, 27/27
MIDDLEWARE NON-MITIGATION ✅ VERIFIED — three cited mechanisms (§3)
CLASSIFICATIONS           ✅ VERIFIED by source read (§2) — ⛔ NOT runtime-witnessed
EXPLOITABILITY            ⛔ NOT WITNESSED — deliberately not attempted
REPAIR                    ⛔ NOT AUTHORIZED, NOT PERFORMED
```

**F10 in `AUTH_01_IDENTITY_AND_ENTRY_CONTRACT.md` is hereby resolved from `UNKNOWN`:**
20 UNSAFE AUTHORITY · 4 SAFE · 3 NON-AUTHORITY · 0 UNKNOWN.

**NEXT AUTHORIZED ACT:** none. Awaiting founder ruling on remediation sequencing.
