# LC-02 — Read-Only Living Constellation Projection Implementation Witness

**Date:** 2026-09-18
**Authority:** Founder adjudication — Living Constellation LC-00 / LC-01 / LC-01A
**Authorized UX candidate:** `87c311c5217debe9bb2e181d71bc9eac23e70b3a`
**Implementation base:** current canonical `8c8525eae316f21eeb844ba7af4af7ab1476f461`
**Branch:** `feature/living-constellation-lc02-20260918`
**Class:** bounded read-only projection implementation
**Boundary:** no schema · no migration · no cross-domain copy · no automatic promotion · no durable relation writes · no MAIA-generated edges · no consent/sharing mutation · no prompt-authority expansion · no deploy

### Freshness reconciliation

LC-02 was first implemented on canonical `caddb904c7...`. Before candidate freeze, canonical advanced to `8c8525eae...` through PR #1393. The intervening delta adds four RGR-01 research-package documents only and touches no Living Constellation, Living Field, Vision Studio, Practice Field, auth, schema, or projection surface. The candidate was rebased onto exact current canonical `8c8525eae...` before this witness was finalized.

---

## 1. What LC-02 built

LC-02 adds one authenticated read-only projection endpoint:

`GET /api/maia/living-constellation`

One shared projection service:

- `lib/maia/living-constellation/projection.ts`
- `lib/maia/living-constellation/types.ts`

One shared member-facing component:

- `components/maia/living-constellation/LivingConstellationPanel.tsx`

and mounts that exact component in all three rooms with only foreground changing:

- Living Field → `focus="living"`
- Vision Studio → `focus="vision"`
- Practice Field → `focus="practice"`

No room receives its own competing constellation model.

---

## 2. Exact initial source population

### Living Field

Reads only authenticated-member rows from `personal_living_fields` with a non-empty current expression.

Projects:

- source id;
- canonical dimension label;
- current-expression excerpt;
- field status;
- latest developmental-version authorship;
- timestamps.

Maximum: 12 most recently updated.

No gathered Keep becomes a separate LC-02 node.

### Vision Studio

Reads only authenticated-member `member_field_note_threads` where:

- `released_at IS NULL`;
- `member_confirmed = TRUE`;
- `source_session_ref LIKE 'vs-%'`.

Projects:

- thread title;
- source authorship / member-confirmed standing;
- member decision;
- Spiralogic phase;
- field context;
- practitioner visibility;
- stored `center` value as honest metadata only;
- timestamps.

LC-02 does not trust `center='project'` as admission because LC-01A established that current Vision Studio center provenance is non-conforming.

No ephemeral conversation turn, unconfirmed proposal, discarded proposal, or released thread is projected.

### Practice Field

Reads at most one `practice_fields` row where:

`practitioner_member_id = authenticated member`.

Projects:

- one Practice Field source node;
- current active-field excerpt, falling back to about-practice;
- readiness;
- containment;
- identity-ratification presence;
- timestamps.

No client Relationship Space or client material is projected.

---

## 3. Authority / provenance shape

Every projected durable node carries:

- projection id;
- source domain;
- source type;
- source id;
- label / excerpt;
- authorship;
- standing;
- privacy;
- created / updated timestamps;
- source table;
- source surface;
- bounded source details.

The synthetic `YOU` center is explicitly:

`kind: orientation_only`

and is not a persisted member model.

The UI retains visible authority labels such as:

- `you authored`;
- `you confirmed`;
- `MAIA candidate`;
- explicit practitioner sharing where present.

Domain placement remains visible through the three separately named room clusters.

---

## 4. Privacy / jurisdiction

The API accepts no member-id parameter.

Identity is derived through canonical `getMemberIdFromRequest()`, which resolves only a verified `auth_sessions` credential and rejects mismatching bare identity claims.

Every adapter independently scopes by that verified member:

- `personal_living_fields.member_id = $1`;
- `member_field_note_threads.member_id = $1`;
- `practice_fields.practitioner_member_id = $1`.

The projection broadens no underlying sharing permission.

Private Vision Studio threads remain member-visible/private; explicitly shared threads retain that label.

Practice Field is visible only to its practitioner owner through this projection.

---

## 5. Visual semantics

The first constellation renders:

- a central `YOU` orientation point;
- Living Field;
- Vision Studio;
- Practice Field;
- selected already-real source nodes inside their source-domain clusters.

The current room is foregrounded but the other two remain present.

The visual explicitly says:

> These lines show where something currently lives in Soullab. They do not claim that the things themselves are psychologically or semantically connected.

Therefore LC-02 creates **zero semantic edges**.

No connect gesture exists in this gate.

---

## 6. Empty / partial behavior

- Empty domains remain visible.
- Empty domains say: `Nothing authored here yet.`
- An entirely empty projection still renders the three-domain orientation around `YOU`.
- Source adapters are loaded through `Promise.allSettled`.
- One adapter failure does not erase successful domains.
- Any adapter failure sets `partial=true` and renders an explicit partial-field notice.
- Total client read failure says the wider field is unavailable and explicitly states that nothing has been changed.

Absence therefore does not masquerade as biographical truth.

---

## 7. Mechanical falsification

Command:

`npx jest lib/maia/living-constellation/__tests__/projectionContract.test.ts --runInBand`

Result:

```
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

The suite proves:

1. Living Field candidate authority is not flattened.
2. Vision Studio's stored center is reported honestly rather than silently corrected.
3. Explicit Vision practitioner-sharing state survives projection.
4. Practice containment outranks readiness in displayed standing.
5. Projection service contains no source-domain INSERT / UPDATE / DELETE / upsert and route exposes GET only.
6. Every adapter binds to the authenticated member and Vision admission excludes released/unconfirmed/non-Vision rows.
7. All three rooms use the same shared component with different foregrounds.
8. The client component performs GET only and explicitly refuses semantic interpretation of its lines.

---

## 8. Adjacent conformance

Targeted population:

- LC-02 projection suite;
- LF-SCOPE-01 Living Field containment suite;
- Practice Field governance containment;
- Practice Field field-guidance;
- Practice Field corpus-authority gate.

Result:

```
4 suites PASS
1 suite has 1 failure
78 tests PASS / 79 total
```

The one failure is:

`lib/practiceField/__tests__/corpusAuthorityGate.test.ts`

Expected stale identity-layer content that current ratification behavior now withholds.

The identical test was run on untouched current canonical `8c8525eae...` and reproduces the same:

```
1 failed / 7 passed / 8 total
```

Therefore it is **pre-existing and not caused by LC-02**.

LC-02 does not repair or absorb that Practice Field lane.

---

## 9. Type / repository gates

### TypeScript

`npm run typecheck`

```
program files : 4384 (baseline 3965)
errors        : 229 (baseline 239)
10 errors fixed since baseline
0 regressions
PASS
```

### Passed

- `git diff --check origin/clean-main-no-secrets..HEAD` — PASS
- `npm run check:no-supabase` — PASS
- `npm run check:no-direct-anthropic` — PASS
- `npm run check:private-routes` — PASS
- `npm run check:phi-gate` — PASS
- `npm run check:backend-imports` — PASS
- `npm run check:imports` — completes; 44 repository-wide unresolved-import warnings, warn-only
- `npm run check:member-owned-boundary` — PASS
- `npm run check:diagrams` — PASS; generated untracked SVG outputs from the partial worktree were removed after the check
- `npm run check:no-phi-enc` — non-strict check completes with five repository-wide pre-existing warnings outside LC-02

### Pre-existing repository/tooling failures independently controlled

`npm run check:nocheck`

- current canonical: exit 1, **514** violations
- LC-02 candidate: exit 1, **514** violations

No LC-02 source contains `@ts-nocheck`.

`npm run check:sovereignty`

fails before execution on both current canonical and candidate because the package script names missing file:

`scripts/check-maia-sovereignty.ts`

This is a pre-existing tooling mismatch, not an LC-02 regression.

---

## 10. Experience witness

The actual three room surfaces were rendered from the LC-02 worktree at:

- 1280×900;
- 390×844.

Synthetic non-confidential projection fixtures were supplied through browser request interception.

No production or member data was read or written.

Committed evidence:

- `living-constellation-desktop.png`
- `living-constellation-mobile.png`
- `living-constellation-vision-desktop.png`
- `living-constellation-vision-mobile.png`
- `living-constellation-practice-desktop.png`
- `living-constellation-practice-mobile.png`

Across the three surfaces:

- the same shared component rendered;
- `YOU` remained the center;
- all three constitutional centers remained separately named;
- current-room foreground changed without changing source reality;
- authority labels remained attached to projected material;
- empty / partial language remained non-deficit and non-totalizing;
- the visual disclaimer refused semantic/psychological interpretation.

---

## 11. Authorization boundary audit

```
schema / migration ...................... NONE
cross-domain source copy ................ NONE
automatic promotion ..................... NONE
durable semantic relation writes ........ NONE
MAIA-generated edges .................... NONE
consent / sharing mutation .............. NONE
prompt-authority expansion .............. NONE
Vision center repair .................... NONE
Vision crossing-copy repair ............. NONE
production data read/write .............. NONE
deployment .............................. NONE
merge ................................... NONE
```

LC-02 is a read-only projection only.

---

## 12. Standing

The implementation proposition survived its bounded falsifiers:

> Existing Living Field, Vision Studio, and Practice Field objects can be shown together in one member-centered visual projection without changing the identity, provenance, authority, privacy, lifecycle, or jurisdiction of their source objects.

This does **not** establish durable cross-domain semantic relationships.

It establishes only that the existing worlds can be perceived together honestly.

**STOP after candidate commit. Founder review is required before PR, merge, deployment, semantic relation work, or any repair of LC-01A findings.**
