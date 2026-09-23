# MEDIA-PRACTITIONER-AUTHORIZATION-01 · F1
## Authenticated identity → practitioner authorization collapse — source finding

**Date:** 2026-09-23
**Act:** `MEDIA-PRACTITIONER-AUTHORIZATION-01 / F1 — AUTHENTICATED IDENTITY-TO-PRACTITIONER AUTHORIZATION CENSUS + LOCAL FALSIFICATION ONLY`
**Disposition:** **SOURCE FINDING ESTABLISHED · REPAIR UNOPENED**

⛔ **This record finds. It does not repair.** No route, auth helper, schema, migration, deployment, or production surface is changed by this act.

## 1 · Exact custody

```text
authorized starting canonical   bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9
current canonical census base   a7b7825ec3e58904856280a5b10d8f48bbe6bf8c
media-surface drift bb114→a7b   ZERO
route files                     12
HTTP handlers                   17
```

Canonical advanced after the act was named. Before rebinding, the complete `app/api/media/**` and `lib/media/**` surface was diffed from `bb1142863…` to `a7b7825ec…`; no path changed. F1 therefore binds to exact current canonical `a7b7825ec…` without semantic substitution.

## 2 · Finding

Every authenticated media route resolves authorization against the same fixed practitioner UUID:

```text
0a93962d-55a2-4deb-ad46-5268ee19be54
```

Authentication remains present. The routes call `getMemberIdFromRequest()`, which resolves a verified member identity from an `auth_sessions`-backed credential and rejects an unauthenticated request.

The defect occurs **after authentication**: the authenticated `memberId` is not translated into that member's practitioner identity for media authorization. Instead, all twelve media route files use the fixed UUID above, either directly or through a helper whose development and non-development branches both return the same constant.

Therefore, at source level:

```text
verified member A ─┐
                   ├─> fixed practitioner authority 0a93962d…
verified member B ─┘
```

This is an **authorization collapse**, not an authentication bypass.

## 3 · Frozen route population

| Route | Handlers | Auth present | Authorization identity |
|---|---|---:|---|
| `projects/route.ts` | GET, POST | yes | fixed via `getPractitionerId` |
| `projects/[projectId]/route.ts` | GET, PATCH, DELETE | yes | fixed via `getPractitionerId` |
| `projects/[projectId]/upload/route.ts` | POST | yes | fixed direct assignment |
| `projects/[projectId]/upload-chunk/route.ts` | POST | yes | fixed direct assignment |
| `projects/[projectId]/assets/route.ts` | GET | yes | fixed query parameter |
| `projects/[projectId]/assets/[assetId]/serve/route.ts` | GET | yes | fixed query parameter |
| `projects/[projectId]/transcript/route.ts` | GET | yes | fixed query parameter |
| `projects/[projectId]/transcribe/route.ts` | POST | yes | fixed query parameter |
| `projects/[projectId]/jobs/route.ts` | GET | yes | fixed query parameter |
| `projects/[projectId]/integrations/route.ts` | GET, POST | yes | fixed query parameter |
| `projects/[projectId]/exports/route.ts` | GET, POST | yes | fixed query parameter |
| `projects/[projectId]/exports/[exportId]/download/route.ts` | GET | yes | fixed query parameter |

**Population invariant:** 12 route files · 17 handlers · 12/12 authenticate · 12/12 bind ownership to the same fixed practitioner identity.

## 4 · Two collapse forms

### A. Decorative environment gate

Both collection and project-detail routes define a local resolver with the same result on both branches:

```ts
if (process.env.NODE_ENV === 'development') return DEV_PRACTITIONER_ID;
return DEV_PRACTITIONER_ID;
```

The authenticated `memberId` argument is therefore semantically unused for practitioner authorization.

The single-file upload route carries the same defect inline:

```ts
process.env.NODE_ENV === 'development'
  ? DEV_PRACTITIONER_ID
  : DEV_PRACTITIONER_ID
```

### B. Direct fixed authority

The remaining media routes place `DEV_PRACTITIONER_ID` directly into the practitioner ownership predicate or assign it to `practitionerId` after authentication. No member-derived practitioner resolver is present anywhere in the twelve-route media population.

## 5 · Supported consequences

The source proves the following:

- two distinct **verified** member identities are not kept distinct at the media practitioner-authorization boundary;
- list/create and project-scoped reads and mutations all derive practitioner ownership from the same constant rather than from the authenticated member;
- ownership predicates such as `WHERE ... practitioner_id = $N` therefore protect the fixed practitioner's namespace, not the authenticated member's own practitioner namespace;
- authenticated identity is a gate for entering the media routes, but it is not the tenancy key used by those routes.

The source does **not** by itself establish:

- that the fixed practitioner UUID exists in the current production database;
- that it owns any particular production media project;
- that two real production members can currently reach one another's media;
- that every media route is deployed and reachable in production;
- production filesystem permissions, network reachability, or actual affected-row population.

No production exploit attempt is authorized or needed for F1.

## 6 · Read and mutation reach

The collapsed authority participates in both read and mutation surfaces: project listing/detail, asset listing/serving, transcript/jobs/integrations/exports reads; project creation/update/archive; upload/chunk upload; transcription; integration creation; and export creation.

## 7 · Existing identity substrates — observation only

Canonical already contains member-derived practitioner identity mechanisms outside media:

- `lib/studio/getPractitionerIdForMember.ts` queries active `practitioners` rows by `member_id`;
- `lib/auth/getCurrentPractitioner.ts` resolves a verified request member into a practitioner identity;
- `lib/coachField/identity.ts` explicitly translates `members.id → practitioners.id` and refuses ambiguous multi-practice resolution.

These are **available-substrate observations, not a selected repair**.

The current schema evidence shows an index and foreign key for `practitioners.member_id`, but the F1 census located no uniqueness constraint on that column. Canonical itself therefore contains two different policy shapes: one resolver selects an active row with `LIMIT 1`, while the Coach Field resolver treats multiple practitioner rows for one member as ambiguous and refuses to choose.

That ambiguity is load-bearing for any later repair design. F1 does not decide it.

## 8 · Exact F1 boundary

Authorized in this act:

```text
source census                 YES
population freeze             YES
local synthetic falsification YES
repair                        NO
schema / migration            NO
route mutation                NO
production request            NO
deployment                    NO
```

## 9 · Next evidence act inside F1

The next and only remaining F1 act is a local synthetic falsifier that:

1. freezes the exact twelve-route / seventeen-handler population;
2. uses two distinct synthetic verified-member identities;
3. proves whether each route maps both identities to the same practitioner authority;
4. fails if a route leaves the population, drops authentication, or gains a member-derived practitioner resolver;
5. distinguishes source-proven collapse from unestablished production impact.

The falsifier must not edit production code.

## 10 · Standing

```text
MEDIA-PRACTITIONER-AUTHORIZATION-01 / F1

source finding            ESTABLISHED
authentication            PRESENT
verified member identity  PRESENT
practitioner authorization COLLAPSED TO FIXED UUID
route population          12 files
handler population        17 handlers
production impact         NOT ESTABLISHED
repair                    UNOPENED
deployment                UNAUTHORIZED
production                UNTOUCHED
```

Finding recorded before falsifier code moves.

**STOP before repair.**
