# MEDIA-PRACTITIONER-AUTHORIZATION-01 · F1
## Local synthetic falsification witness

**Date:** 2026-09-23
**Disposition:** **F1 PASS · SOURCE-LEVEL AUTHORIZATION COLLAPSE ESTABLISHED · REPAIR UNOPENED**

⛔ **This witness does not repair the defect.** It admits only source census and local synthetic falsification evidence against the frozen F1 population.

## 1 · Exact custody

```text
canonical base          a7b7825ec3e58904856280a5b10d8f48bbe6bf8c
finding commit          408738810bbf9f0f22b501fa933d7e77b537b36e
finding blob            d9d3b5d84f93c92782b26019948761c2f46e5bb6
falsifier commit        9a3e1c66b9d5b6bc4db217ebb5d215380da2e71d
falsifier blob          f9d132ec012307c4f75b4b68a55f6b2420241d8d
```

The finding commit precedes the falsifier commit. No production route code moved between those two commits.

## 2 · Frozen population

```text
media route files   12 / 12
HTTP handlers       17 / 17
auth present        12 / 12
fixed authority     12 / 12
```

The falsifier enumerates the complete `app/api/media/**/route.ts` population and fails if any route is added, removed, or omitted from the frozen set.

The exact handler population is:

- projects: GET, POST;
- project detail: GET, PATCH, DELETE;
- upload: POST;
- chunk upload: POST;
- assets: GET;
- asset serve: GET;
- transcript: GET;
- transcribe: POST;
- jobs: GET;
- integrations: GET, POST;
- exports: GET, POST;
- export download: GET.

## 3 · Two-actor synthetic witness

Two distinct synthetic verified-member identities were carried through the source-authority model:

```text
actor A     11111111-1111-4111-8111-111111111111
actor B     22222222-2222-4222-8222-222222222222
authority   0a93962d-55a2-4deb-ad46-5268ee19be54
```

For every one of the twelve route files, the source-level practitioner authority produced for actor A and actor B is identical: the fixed UUID above.

This is not a claim that either synthetic UUID can authenticate in production. The synthetic identities stand for two already-verified members so the falsifier isolates the authorization step after authentication.

## 4 · Defeat controls

Six defeat candidates were required to be lethal:

```text
population-minus-one                         KILLED
authentication-removed                       KILLED
member-derived-resolver-introduced           KILLED
fixed-authority-literal-removed              KILLED
decorative-helper-production-arm-repaired    KILLED
same-authority-ternary-repaired              KILLED
```

**6/6 defeat controls are lethal.**

## 5 · What F1 establishes

F1 establishes, against exact canonical `a7b7825ec…`:

- media authentication is present and derives a verified member identity from a real session credential;
- the verified member identity does not remain the tenancy key at the media practitioner-authorization boundary;
- all twelve media route files collapse practitioner authorization onto one fixed UUID;
- the collapse reaches all seventeen handlers in the frozen population;
- both read and mutation surfaces participate in the collapsed authority;
- the detector discriminates this defect from a member-derived resolver and from repaired helper/ternary shapes.

The committed falsifier was rerun after its own commit and returned the same result.

## 6 · What F1 does not establish

F1 does not establish:

- production reachability of any route;
- existence or ownership population of the fixed UUID in production;
- a successful cross-account request using real users;
- production filesystem or network permissions;
- which existing practitioner resolver should become media law;
- whether one authenticated member may legitimately hold multiple practitioner records;
- a schema change, migration need, or final repair shape.

Those questions belong to later adjudication/design, not to this finding witness.

## 7 · Existing substrate observation preserved

Canonical already contains multiple member → practitioner translation mechanisms. F1 records their existence without selecting one.

The schema census found an index and foreign key on `practitioners.member_id`, but no uniqueness constraint. One canonical helper selects an active row with `LIMIT 1`; another canonical identity module refuses when one member maps to more than one practitioner record.

That policy disagreement is not resolved by F1.

## 8 · Standing after F1

```text
MEDIA-PRACTITIONER-AUTHORIZATION-01 / F1

finding                  ESTABLISHED
source census            PASS
route population         12 / 12
handler population       17 / 17
two-actor collapse       PASS
defeat controls          6 / 6 lethal
production impact        UNWITNESSED
repair                    UNOPENED
schema / migration        UNOPENED
deployment                UNAUTHORIZED
production                UNTOUCHED
```

## 9 · Exact next boundary

> **FOUNDER ADJUDICATION — `MEDIA-PRACTITIONER-AUTHORIZATION-01 / F1` SOURCE FINDING + LOCAL FALSIFICATION ONLY**

No repair, route mutation, schema work, migration, deployment, or production request follows without a new authority-bearing act.

**STOP.**
