# Gate 0 — Foundation Pre-Check: Evidence Packet

**Date:** 2026-08-03 · **Authorized scope:** foundation pre-check only.
**Explicitly NOT authorized and NOT done:** participant recruitment · human observation ·
implementation · acceptance decision.

> ⚠️ **This does NOT discharge the Gate 0 precondition on human observation.** Roughly half of
> Gate 0 asserts against surfaces Slice 0 has not built. Those are recorded **Not evaluable**, not
> Pass and not Fail. *Gate condition does not exist yet ≠ gate condition failed.*

---

## 1. Method integrity

| | |
|---|---|
| **Referent (product)** | `origin/clean-main-no-secrets` @ **`136f580a0`** |
| **Worktree** | `/tmp/gate0-precheck`, detached at that SHA (isolated; shared checkout untouched) |
| **Database** | **`maia_gate0_precheck`** — branch-owned, created for this run, preserved for reproduction |
| **Instrument** | `scripts/verify-coach-field-boundaries.ts` **at the referent SHA** (not a reimplementation) |
| **Observation status** | Read + machine-executed. **No human walked anything.** |
| **Evidence class** | A (direct) except where marked B |

### 1.1 Referent match — established before any assertion

```
trunk migration 20260802000003 declares : 10 coach_* tables
maia_gate0_precheck contains            : 10 coach_* tables
set difference                          : none  ✅ REFERENT MATCH
```

### 1.2 ⛔ The shared dev DB is contaminated — do not measure against it

`maia_consciousness` holds **22** `coach_*` tables including **10 deferred content tables**
(`coach_authored_notes`, `coach_client_personal_notes`, `coach_work_items`, …). That is the
**reverted #898 schema**, still resident in the shared dev database.

Running gate `1d` there would report **FAIL** — and the failure would describe a stale dev DB, not
trunk. This is the standing shared-dev-DB trap in live form. **Any future coach-field verification
must use a branch-owned DB.** Clean DBs observed: `maia_coachfield_integration`,
`maia_cf_amend_004`, `maia_cf_amend_004_transition` (10 each).

### 1.3 Environment failure encountered and repaired, not bypassed

First invocation died: `Cannot find module 'pg'` — a fresh worktree has no `node_modules`. That is
an **environment failure, not a gate result**; it was repaired (linked the checkout's modules) and
the gate re-run. No result was reported past a control that failed to execute.

---

## 2. Results

### Runnable now — executed

| # | Assertion | Result | Evidence |
|---|---|---|---|
| **G1** | A practitioner-scoped query cannot reach `coach_client_selected_focus` | ✅ **PASS** | Gate `12g`: `SELECT relationship_id FROM coach_client_selected_focus` → `42703 column "relationship_id" does not exist`. Refusal asserts the matching reason. |
| **G5** | No deferred `coach_*` content table exists | ✅ **PASS** | Gate `1d`; independently confirmed by the 10-table set match (§1.1) |
| **G7** | Cross-scope access refused, with a matching reason | ✅ **PASS** | Gate `12a–12g`, incl. `12a` unrelated member gets no grant; `12e` stage history cannot be rewritten (`P0001` append-only trigger, not service politeness) |
| **G4** | Withdrawal emits no practitioner-visible signal | ✅ **PASS** | Reader census: 5 files touch `member_field_note_events`, **all member surfaces**. Zero practitioner-scoped readers. No notification/email/alert path exists. |
| **G2/G6** *(auditable portion)* | No route improvises the `practitioner_id` translation; scope derives server-side | ✅ **PASS** | Zero callers of `resolvePractitioner*` outside `lib/coachField/`. Zero routes read any `coach_*` table — consistent with *services before UI*. |

**Full gate at the referent SHA: `32 passed · 0 failed`**, fixtures cleared before and after.

### Not evaluable — the asserted surface does not exist

| # | Assertion | Status | Why |
|---|---|---|---|
| **G3** | Focus **absent** (not null-and-hidden) from Larry's client-view payload | ⏸️ **Not evaluable** | No client-view payload exists |
| **G8** | Band ① ordering carries no recency judgment | ⏸️ **Not evaluable** | Band ① not built |
| **G9** | Copy audit — no productivity semantics | ⏸️ **Not evaluable** | No Home copy exists |
| **G2/G6** *(route portion)* | Route-level scope derivation | ⏸️ **Not evaluable** | No routes exist |

---

## 3. Findings

**F1 — ⚠️ My grep printed a PASS label above a non-empty result.** The G4b probe emitted
`^^ empty = PASS` while the match below it was non-empty. A label that does not read its own output
is a dead instrument. Caught here; recorded because the same shape would have silently produced a
false pass. *Never let a hard-coded verdict string stand in for reading the result.*

**F2 — G4b, restated correctly: PASS with a flagged adjacency.** No member-facing copy frames
withdrawal as an act directed at a person. One string does name the practitioner:

```
components/now-what/WithdrawVisibility.tsx:67
  "· withdrawn — your practitioner can no longer see this"
```

Under E-3 as ruled — *"the withdrawal is not a visible event; the resulting state is visible when
appropriate"* — this is a **resulting-state description shown to the member**, which the ruling
permits. It is not *"you withdrew this from Larry."*

**But the Home must not inherit this string uncritically.** In the Home, per the experience design,
the member's register is *my Field changed*. Routed to the **design queue**, not the defect queue.

**F3 — the "40/40 gate" claim does not describe trunk.** The gate at `136f580a0` reports **32**
assertions (28 `expect(` sites, some looped). The 40-assertion version lives on **#920, which is
OPEN and unmerged**. Prior records citing 40/40 describe a PR branch, not the canonical foundation.

**F4 — two grep false positives, resolved (Class B → A).**
`app/api/maia/vision-studio/field-note/route.ts` matched on the word *studio* in its path but is a
**member** surface (Vision Studio) with no practitioner-scoped read — G4 stands.
`withdrew_at` in `app/studio/threshold/*` belongs to `threshold_passages` (withdrawing from a
passage), an unrelated domain — **Not applicable**, not a violation.

---

## 4. What this evidence does and does not support

**Supports:** the structural conditions asserted against the *existing* foundation hold at
`136f580a0`. The client's selected focus is unreachable from a practitioner path **by construction,
not by permission** — there is no column to reach it by.

**Does not support:** any claim that Slice 0 is ready, that the boundary holds in a built Home,
that Larry finds it workable, or that a client feels met. Those remain Class C and unauthorized.

> Observation can advance readiness. It cannot manufacture authority.

---

## 4b. Addendum — do G3/G8/G9 need implementation, or only verification?

Measured at `136f580a0`, so the next authorization boundary rests on evidence rather than estimate.
**The answer splits three ways — only one assertion actually crosses into implementation.**

| # | Lane | Evidence |
|---|---|---|
| **G9** | **Verification — RUN, baseline clean** | Copy audit over `app/now-what/**` + `components/now-what/**`: **0** occurrences of Complete · Progress · Goals · Remaining · Done · Streak · Achievement. The Home would not inherit productivity language from its environment. Full assertion still needs Home copy. |
| **G8** | **Verification of a precondition — RUN, and it found something** | See F5. Evaluable today against the substrate Band ① would compose from. |
| **G3** | **Implementation — requires a new authorization boundary** | No practitioner read path exists on the coach spine. Only `lib/coachField/invitation.ts` touches `coach_client_processes`; zero routes do. The `app/api/portal/**` and `practitionerPortal.routes.ts` surfaces belong to the **older lineage**, not the `practitioner_clients` spine as re-established by #902. A payload that could omit focus does not exist and cannot be audited into existence. |

**F5 — ⚠️ Two findings about ordering, one of them a correction of my own earlier note.**

1. **The nearest existing surface orders by recency today.**
   `app/api/now-what/field-note/route.ts:176` → `ORDER BY created_at DESC`.
   That is exactly the judgment E-2′ prohibits. It governs the current field-note list, not Band ①
   — so G8-as-written remains Not evaluable — but it is the substrate the Home composes from, and
   **the Home must not inherit it.** Recorded as a pre-existing condition, not a Slice 0 defect.

2. **Correction: `member_field_note_center` is not an ordering mechanism.**
   Phase 1 (§3 ①, E-2′) suggested checking it as a possible existing center-order mechanism. It is
   not. The migration adds `center TEXT NOT NULL DEFAULT 'person'` — a **classification** (what the
   note is centered on), not a member-chosen order. It also has **zero readers** in `app/`, `lib/`
   or `components/`.

   **Therefore E-2′ has no existing mechanism at all.** The member's chosen order does not exist
   anywhere in the substrate. E-2′'s fallback — *"otherwise preserve the order of keeping"* — is
   the only implementable half today, and even that is not what the current query does.

**Consequence for the next decision.** Completing Gate 0 does **not** require building the Home.
It requires exactly one new thing: **a practitioner read path on the coach spine** (G3). G8 and G9
are verification items already discharged as far as the current artifact state permits.

---

## 5. Status

```
Gate 0
  Foundation pre-check     ✅ EXECUTED — 5 assertions pass, 32/32 gate
  Slice 0 assertions       ⏸️ pending artifact existence (G3, G8, G9, route audit)
  Human acceptance         ⛔ not authorized

Walk B consent model       ⛔ not selected
Implementation             unchanged
```

Reproduce: worktree any SHA, `psql -U soullab maia_gate0_precheck`, run the gate at that SHA.
