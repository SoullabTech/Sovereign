# JARVIS — WRITER'S STUDIO FLAGSHIP FLOW 01
# B-I Independent Adjudication + F7/F8 Next Boundaries v1

Programme: `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01`

Reviewed B-I candidate:
`3a6f7de09ec466d6267617d814183c3340efc24f`

Reported canonical:
`origin/clean-main-no-secrets @ b23ae2d7f`

This record does not authorize F5 persistence implementation, schema, migration, merge, deployment, or production mutation.

---

# I. Independent B-I Review

The B-I architecture is substantively sound:

- two-resolver separation is preserved;
- v1 resolution states are type-limited to:
  - `EXACT`
  - `CHANGED`
  - `MISSING_HISTORICAL_ONLY`;
- marked text is stored conceptually for future compatibility but not consulted by v1 resolution;
- member provenance is invariant;
- observation identity is opaque;
- retrieval is member + Work scoped;
- resume does not select a Work on cold start;
- Sanctuary is store-boundary law;
- refusal evidence is content-free by intended contract;
- the reference is explicitly a test double, not a seed.

However, B-I is **NOT YET ADMISSIBLE**.

---

# II. Independent Finding — Explicit Member Confirmation Is Not Enforced

The contract includes:

```ts
memberConfirmed: boolean
```

with the stated meaning:

> the member explicitly chose `Keep with this passage`.

But `ReferenceSubstrate.admit()` currently checks only:

```text
posture unresolved
Sanctuary posture
```

and then persists.

It does **not** refuse:

```text
standard posture
+ memberConfirmed = false
```

Therefore the current conforming reference permits a durable member observation without the member's explicit persistence gesture.

This is a product-authority breach hidden inside an otherwise green law matrix.

---

# III. Why This Matters

The intended boundary is:

```text
member composes observation
        ↓
EPHEMERAL
        ↓
member explicitly chooses "Keep with this passage"
        ↓
DURABLE
```

Not:

```text
observation reaches store
        ↓
ordinary posture
        ↓
DURABLE
```

Sanctuary law and member-confirmation law are separate.

A write must satisfy both:

```text
posture permits persistence
AND
member explicitly authorized persistence
```

---

# IV. Exact B-I Repair Boundary

> **FOUNDER AUTHORIZATION — `OBSERVATION-ADDRESS-01 / B-IR1 — EXPLICIT MEMBER-CONFIRMATION LAW REPAIR` ONLY**

Against exact B-I candidate `3a6f7de09`, subject to act-opening freshness verification.

Authorize only the minimum law/reference repair needed to establish:

> **No durable member observation exists without explicit member confirmation, even under ordinary posture.**

Required changes:

## 1. Refusal contract

Add a content-free refusal category equivalent to:

```text
member_confirmation_required
```

Exact identifier is implementation-owned.

## 2. Reference behavior

For standard posture:

```text
memberConfirmed = false
→ REFUSE
→ zero durable observations
```

## 3. New reference law

Add:

### `MA-F16` — explicit confirmation required

Given:
- standard posture;
- lawful Work/address;
- valid member;
- `memberConfirmed = false`.

Expected:
- refusal;
- zero persisted observations.

## 4. New defeat candidate

Add a candidate equivalent to:

> **MA-D14 / UNCONFIRMED_STANDARD_WRITE**

It behaves lawfully for Sanctuary but writes under standard posture without confirmation.

It must die specifically on MA-F16.

## 5. Confirmation is not a Sanctuary override

Retain:
- MA-S1;
- MA-S2;
- MA-S3;
- MA-S4;
- MA-S5.

MA-S4 proves:
> standard + explicit confirmation may persist.

MA-F16 proves:
> standard + no confirmation may not persist.

Both are needed.

---

# V. B-IR1 Scope

Allowed:
- B-I contract;
- B-I reference;
- B-I laws;
- B-I defeat candidates;
- B-I matrix;
- B-I evidence record/package script only if required by the new law.

Forbidden:
- table;
- migration;
- API;
- runtime store;
- UI;
- resume implementation;
- AskAnchor implementation;
- F5;
- production.

Required result:

```text
reference        21/21 PASS
defeat population includes unconfirmed-standard-write and all candidates dead
```

Exact counts may be higher only if the repair itself reveals another required law; do not expand opportunistically.

Then STOP for B-I admission.

---

# VI. B-I Evidence Standing Before Repair

Current:

```text
B-I contract        E1 CANDIDATE
matrix               GREEN
independent review   REVISE
F5                   SHUT
```

Do not describe B-I as admitted until B-IR1 returns green and is re-adjudicated.

---

# VII. Sanctuary Ruling — `manuscript_keeps`

Separate finding:
`docs/programme/SANCTUARY_BOUNDARY_FINDING_MANUSCRIPT_KEEPS_2026-09-22.md`

Founder ruling:

> **YES — `manuscript_keeps` inherits the Sanctuary persistence boundary.**

Reason:

A manuscript Keep is:
- a secondary durable object;
- created from content encountered/selected during a session;
- explicitly persisted as a recognition/marking gesture;
- not the canonical manuscript write itself.

Therefore, under Sanctuary:

```text
a member may notice/select a passage ephemerally
but the Keep side-object may not be durably created
```

Explicit member request does not override Sanctuary.

This ruling does **not** say that ordinary manuscript prose editing must be blocked in Sanctuary.

Canonical manuscript authorship and derivative/session persistence remain distinct questions.

---

# VIII. Separate Sanctuary-Keep Lane

The finding remains out of B-I.

Open later as:

> **`SANCTUARY-MANUSCRIPT-KEEP-01 / S0 — POSTURE-WIRING CENSUS + MINIMUM REPAIR PROPOSAL`**

S0 is READ-ONLY.

It must answer:

1. every caller of the manuscript Keep POST;
2. where the current turn/session Sanctuary posture is available;
3. whether the route can receive a server-derived `TurnPosture`;
4. whether a shared protected-store boundary should be introduced or reused;
5. exact zero-write runtime witness;
6. whether GET/DELETE have any Sanctuary implication;
7. smallest repair that does not change manuscript-writing authority.

Do not repair inside F7, F8, B-I, or F5.

---

# IX. Separate Privacy Debt

B-I also surfaced:

`contentWritable()` logs:

```ts
sessionId.slice(0, 12)
```

which can equal the full identifier when the identifier is short.

This is a separate privacy-hardening finding.

It is not repaired in B-IR1.

Record/routable future lane:

> `SANCTUARY-REFUSAL-EVIDENCE-01`

Goal:
replace readable identifier prefixes in refusal telemetry with an opaque privacy-safe reference consistent with existing privacy helpers.

---

# X. F7 and F8 E1 Work May Continue

The B-I repair does not block authoring the independent F7/F8 law matrices.

However they remain **separate acts**.

Do not batch F7 and F8 into one undifferentiated commit/evidence status.

---

# XI. F7 Exact Boundary

> **FOUNDER AUTHORIZATION — `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01 / F7-C1 — INTENT-FIRST CONTRACT + FALSIFIER MATRIX` ONLY**

Purpose:
make the F7 Intent-First contract discriminating.

Allowed:
- test-only contract/reference/state machine;
- I1–I12 laws;
- D-I1…D-I15 defeat population;
- matrix;
- package script;
- documentary evidence.

Forbidden:
- runtime UI;
- reading runtime changes;
- routes;
- persistence;
- provider calls;
- First Arrival implementation.

Required footer:

```text
INTENT-FIRST LAW GREEN
GREEN LAW · INTENT-FIRST CAPABILITY NOT YET IMPLEMENTED
```

Then STOP.

---

# XII. F8 Exact Boundary

After F7-C1 is committed/stopped independently:

> **FOUNDER AUTHORIZATION — `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01 / F8-C1 — FIRST-ARRIVAL / WORK-ROOT CONTRACT + FALSIFIER MATRIX` ONLY**

Purpose:
make First Arrival / Work-root law discriminating.

Allowed:
- test-only contract/reference state machine;
- O1–O15 laws;
- D-O1…D-O15 defeat population;
- matrix;
- package script;
- documentary evidence.

May reuse already-admitted law vocabulary, but must not make F8 depend on F7's runtime implementation.

Forbidden:
- Home route;
- Work-root runtime;
- resume store;
- Work chooser;
- navigation changes;
- persistence;
- First Arrival UI.

Required footer:

```text
FIRST-ARRIVAL LAW GREEN
GREEN LAW · FIRST-ARRIVAL CAPABILITY NOT YET IMPLEMENTED
```

Then STOP.

---

# XIII. Why Separate Commits Matter

F7 and F8 answer different questions:

```text
F7
How does the member express what they are trying to understand?

F8
How does the Studio receive the member into a selected Work?
```

A defect in one should not force adjudication of the other.

Separate candidates preserve:
- evidence lineage;
- admission scope;
- later implementation authority;
- rollback/reconciliation clarity.

---

# XIV. Current Programme Standing

```text
F1 / V10                     PASS · E6
F2                            CLOSED
A0                            CLOSED
F4                            CLOSED
B-I                           E1 CANDIDATE · REVISE (confirmation gap)
B-IR1                         AUTHORIZED
F5                            SHUT

F7-C1                         AUTHORIZED · E1 ONLY
F8-C1                         AUTHORIZED AFTER SEPARATE F7-C1 STOP · E1 ONLY

manuscript Keep Sanctuary     LAW RESOLVED · separate S0 lane owed
production                    UNTOUCHED
```

---

# XV. Governing Principle

> **Sanctuary permission is necessary for persistence, but it is not member consent.**

And:

> **Member consent is necessary for persistence, but it does not override Sanctuary.**

A durable member observation requires both.
