# AIN Member Auth Edge — adjudication

**Status:** read-only trace COMPLETE · runtime falsification NOT PERFORMED.
**Authority:** founder ruling 2026-08-16 — adjudication AUTHORIZED, ⛔ **repair NOT authorized.**
**Subject:** `/Users/soullab/MAIA-SOVEREIGN` @ `8d0b41163`, root commit `d0a99cabc…`.
**Origin:** the `DIVERGENT` verdict from [Slice 1](./JARVIS_LIVING_SPIRAL_SLICE1_COMPLETION_2026-08-16.md).

> **Question.** Can an unauthenticated request carrying only a client-controlled `x-member-id` cross
> a consequential authorization boundary before a downstream component independently verifies identity?

## ⭐ Answer, and an attribution correction

**Yes — but not by the route I originally named.** The edge defect is real and is *not* the load-bearing
cause. Attributing the exposure to `middleware.ts` would have repaired the wrong component.

```text
CLASSIFICATION

  EDGE DEFECT              ESTABLISHED   (middleware.ts, and it is NOT the cause)
  AUTHORIZATION BYPASS     ESTABLISHED   (by source read, on unmapped routes)
  RUNTIME EXPLOITATION     UNWITNESSED   (no request was ever issued)
  SECURITY REMEDIATION     REQUIRED
  REPAIR                   NOT AUTHORIZED — this document opens no repair
```

## §1 What middleware actually permits

`middleware.ts:81-99` `isAuthenticated()` grants on **presence alone**, for four independent
credentials, none verified — `maia_session` cookie · `x-member-id` header · `x-session-token` header ·
`_t`/`_m` query param. It carries `TODO: Replace with actual implementation`. `authed` additionally
drives `tier` and `roles`, read from the unsigned `maia_tier` / `maia_roles` cookies.

⚠️ But middleware only decides **reachability**. It never binds an identity that downstream code
consumes. So a presence-check pass is not, by itself, access to anyone's data.

## §2 The authoritative resolver is hardened — this is the good news

`lib/auth/getMemberFromRequest.ts:30-71` resolves identity **only** from an `auth_sessions`-backed
token (`maia_session` cookie or `x-session-token`), explicitly refuses a bare `x-member-id`, and
rejects a mismatched claim as an impersonation attempt. Its own comment records that a previous
version trusted the header after a mere existence check and that the vector was removed.

**385 of 920 `app/api` routes call an authoritative verifier.** For every one of those, a bare
`x-member-id` yields `null` and the route denies. The edge defect is contained there.

## §3 Where it is not contained — the actual chain

The bypass does not run through middleware at all:

```text
config/accessMatrix.ts:634   getAccessMode() -> 'permissive' unless ACCESS_CONTROL_MODE === 'strict'
ACCESS_CONTROL_MODE          NOT SET in docker-compose*.yml, Dockerfile, or .env.example
checkAccess()                unmapped route + permissive  ->  { allowed: true }
                             ⛔ the auth check is never reached
route handler                self-resolves identity from client-controlled input
                             ⛔ no session, no verifier
```

Two confirmed instances, both **unmapped** in `accessMatrix.ts` and therefore allowed before any
auth question is asked:

| Route | Identity intake | Verifier | Member-scoped access |
|---|---|---|---|
| `app/api/maia/field/route.ts:12` | `?memberId=` query param — **UUID *format* validated, ownership never checked** | none | reads relationship context: `preferred_name`, `communication_style`, … |
| `app/api/members/beads/route.ts:208,255` | `x-member-id` header, `if (!memberId) 401` | none | `SELECT … FROM members WHERE id = $1`; lists sent beads incl. `recipient_name`, `recipient_email`; **writes** |

`/api/maia/field` is the cleanest case: a plain IDOR. Any caller holding a member UUID — and member
UUIDs are exposed to clients — reads that member's field. No credential of any kind is required.

## §4 Matrix method and population

Reproducible over all 920 `app/api/**/route.ts`: classify each by (a) calls an authoritative
verifier, (b) reads client-controlled identity, (c) touches member-scoped columns, (d) writes.
Candidate exposure = **(b) ∧ (c) ∧ ¬(a)**.

```text
total routes                            920
call an authoritative verifier          385
read client-controlled identity         114
touch member-scoped data                590
CANDIDATE EXPOSURE                       67   (46 of them execute SQL; 27 write)
```

⚠️ **`67` is a static upper bound, not a finding.** A first pass produced `79` purely because the
verifier set was incomplete — `getCurrentSession` and `requireSelfScopedMember` were missing, which
falsely implicated `members/settings`, `members/me`, and `caseload/list`. All three are correctly
verified. **The remaining 65 unread candidates are `DISCOVERED`, not confirmed**; only the two in §3
were read and confirmed. Reading them is the next unit of this adjudication, not a conclusion of it.

## §5 What was NOT done

⛔ **The falsification control was not run.** No request was issued — with or without credentials,
against any environment. The founder-specified adversarial condition remains outstanding:

```text
NO maia_session · NO x-session-token · x-member-id: <syntactically valid member id>
```

**Therefore not claimable:** that the bypass is exploitable in production · that production runs
`permissive` (the variable is absent from repo config; the deployed environment was never read) ·
that any member's data has been accessed · that the 65 unread candidates are or are not exposed.

Everything in §1–§4 is a **source read** of one tree at one SHA.

## §6 Disposition

```text
ADJUDICATION (read-only leg)     COMPLETE
RUNTIME FALSIFICATION            OUTSTANDING — needs authority + a non-production target
65 UNREAD CANDIDATES             DISCOVERED — reading them is the next unit
REPAIR                           NOT AUTHORIZED
```

**Recommended ruling, carrying its reasoning.** Open the repair unit for `/api/maia/field` and
`/api/members/beads` on the source evidence alone, without waiting for the runtime probe. The founder
rule was *don't fix an edge smell before knowing whether it is merely misleading or actually
authoritative* — that condition is now discharged: these two routes are authoritative over member
data and hold no credential at all. ⚠️ Repair them at the **route** (require a verified session),
⛔ not by adding an accessMatrix entry — mapping the route would leave identity still client-supplied
and would convert a visible defect into a hidden one.

⚠️ Treat `ACCESS_CONTROL_MODE` and the unmapped-permissive default as a **separate architectural
question**. Flipping it to `strict` is not a repair for §3 and could deny live traffic across 920
routes; it needs its own unit with its own evidence.

⛔ **Nothing in this document authorizes a code change, a config change, or a deploy.**
