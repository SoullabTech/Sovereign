# Now What? Slice 0 — Precondition Audit against the 2026-08-03 authorization

**Status:** ⛔ **RECORD ONLY.** Claude may Record and Draft, never Ratify. Nothing here waives,
grants, or withholds authority. It measures the authorization's own §3 against canonical state.

**Instrument:** the authorization text issued 2026-08-03 (undated in the draft — `Date: [date]`).
**Referent:** `origin/clean-main-no-secrets` @ `136f580a0`, plus named local artifacts.

---

## 1. The §3 preconditions, measured

The authorization lists five preconditions marked ✅. Those marks are **assertions of fact**, not
rulings — so they are checkable. Four do not hold.

| | Precondition (as written) | Measured | Evidence |
|---|---|---|---|
| **P1** | Larry Practice Workspace UI/UX specification reconciled with canonical Larry artifacts | ❌ **NOT MET** | `docs/specs/NOW_WHAT_LARRY_PRACTICE_WORKSPACE_UIUX_SPECIFICATION.md` §Status: *"⛔ DRAFT — NOT RULED. Design specification only. No implementation authorization."* Also **not on trunk** — local, unpushed |
| **P2** | Slice 0 acceptance criteria approved | ❌ **NOT MET** | `docs/reviews/NOW_WHAT_CLIENT_HOME_LARRY_ACCEPTANCE_WALK.md`: *"ACCEPTANCE DESIGN. Not executed. Not authorized. Design lane FROZEN."* **Not on trunk** |
| **P3** | #899 session team scope fix merged or otherwise resolved | ◐ **PARTIAL** | Repaired and committed `12e4787ee` on `fix/session-creation-team-id`; **unpushed, not merged**; `sessionTeamScope` absent from trunk; runtime confirmation unobserved. *"Otherwise resolved"* is a judgment only the founder can close |
| **P4** | No unresolved schema ownership conflicts | ❌ **NOT MET** | **Q-A** (is the client's journey a projection or a co-equal object?) and **Q-B** (Home with no active program) are 📋 *recommended, awaiting ratification*. **Q-B′** (concurrent processes) 🔴 newly surfaced, unruled |
| **P5** | Build references only approved artifacts | ❌ **NOT MET** | `AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md` §12: **"Not ratified"** — *"nothing here governs, and nothing here authorizes build."* `NOW_WHAT_HOUSE_ROOMS` §3a: *"proposed, not ruled"* |

---

## 2. ⭐⭐⭐ The scope discrepancy — the more consequential finding

The authorization §1 reads: *"Implement Slice 0 as defined by the approved Larry Practice Workspace /
Client Home acceptance design."*

That phrase **fuses two objects the canonical spec holds apart**, and the spec anticipates exactly
this fusion. `…UIUX_SPECIFICATION.md` §0b — *"The unit question — must be ruled before anything is
built"*:

> - **Slice 0** is ruled as *a trust-boundary demonstration, **not a homepage*** — services before
>   UI, no migration, **the proof is a negative**.
> - **v1** is *a coherent deployed experience Larry can encounter and evaluate.*
>
> Three possibilities, **none ruled**: v1 **contains** Slice 0 · v1 **supersedes** Slice 0 · they run
> **parallel**.
>
> ⛔ **Do not resolve this by building.** Naming the unit first is the standing rule; **"v1" silently
> absorbing a ruled object is how a ruling is lost.**

The authorization's §2 *Authorized* list — Client Home foundation · relationship orientation · program
visibility · sessions continuity surface · client-owned reflection entry points · required navigation
and empty states — **describes v1, not Slice 0 as ruled.** Slice 0's ruled form needs no UI at all;
its deliverable is the negative assertion *Larry cannot read the client's focus*.

⚠️ This is not a disagreement with the authorization. It is the observation that **§1 and §2 name a
larger unit than the one §1 cites as already ruled**, and the spec explicitly forbids settling that by
building.

---

## 3. Standing gates the authorization does not address

Recorded in `NOW_WHAT_LARRY_PILOT_TEST_PLAN` §0.2 and carried into the Phase 4 readiness pass. These
are lane-opening gates, and none is a Now What? gate:

| | Gate | Effect |
|---|---|---|
| **G-a** | **Phase 1 is failed at W8**; not a finished release object | ⛔ *no new implementation lane opens* until Phase 1 closes |
| **G-b** | **Larry IP one-pager** | gates activation |
| **G-c** | **Correction 3 ratification unissued** | its acceptance path is not yet governed |

---

## 4. What is not in question

- The **authority** to authorize Slice 0 is the founder's, and is not at issue here.
- The **direction** — one evidence-producing slice, not "build the client platform" — matches the
  ruled shape of Slice 0 and the standing method.
- **#899** is independently repaired and is not blocking on its own merits.

## 5. The decisions this audit surfaces

Narrow, and all founder-owned:

1. **The unit** — does this authorization govern *Slice 0 as ruled* (services, negative proof, no UI)
   or *Practice Workspace v1* (a deployed experience)? §0b says name it before building.
2. **P1 / P2 / P4 / P5** — closed by ruling, or **explicitly waived** with the waiver recorded?
3. **P3** — does the committed-but-unmerged #899 repair satisfy *"or otherwise resolved"*?
4. **G-a / G-b / G-c** — lifted, or does Slice 0 wait behind them?

Until these are answered, this document records an authorization whose own §3 is not satisfied.
**Nothing has been implemented.**

---

## 6. Founder classification — 2026-08-03 (recorded, not interpreted)

Issued in response to §1–§5 above. Recorded here as the lane's current state.

### 6.1 The unit — held apart, not merged

> **Do not rename Slice 0 into v1. Keep the distinction.**

The eventual relationship is `Slice 0 → evidence foundation → Practice Workspace v1`. They may relate;
they are **not the same object**. The naming decision itself remains **open and founder-owned**.

### 6.2 Preconditions — classified, not waived

| | Classification | Reason as given |
|---|---|---|
| **P1** | **Not satisfied — awaiting reconciliation** | *"The draft spec was withdrawn and the canonical acceptance container remains WALK_01."* ✅ consistent with measurement: `docs/product/walks/NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01.md` **is on trunk**; the withdrawn `docs/specs/NOW_WHAT_LARRY_PRACTICE_WORKSPACE_UIUX_SPECIFICATION.md` **never was** |
| **P2** | **Not satisfied — awaiting founder approval** | *"The acceptance design exists, but **approval is different from existence**."* |
| **P3** | ~~Technically resolved, release unresolved~~ → **MERGED 2026-08-03** | PR [#934](https://github.com/SoullabTech/Sovereign/pull/934) merged as `945ba197d`. Post-merge verification on trunk: **4/4 `INSERT INTO sessions` carry `team_id`, 0 missing** — invariant holds. ⚠️ **Not deployed; runtime success still unobserved.** See §6.5 |
| **P4** | **Not satisfied — awaiting ruling** | *"Q-A / Q-B / Q-B′ are exactly the type of questions that should not be resolved by schema creation."* |
| **P5** | **Not satisfied — awaiting ratification or explicit waiver** | *"A proposed constitution can guide discussion. It cannot silently become the authority source."* Governance, not implementation |

### 6.3 Gates G-a / G-b / G-c — ⛔ NOT LIFTED

Held deliberately, and the reason is recorded because it is load-bearing:

> **They are not friction gates. They are identity preservation gates.**

```
authorization granted → implementation begins →
implementation defines the object → original ruling disappears
```

Lifting them before the unit is named produces exactly that failure.

### 6.4 Lane state — updated 2026-08-03 after the merge

```
Slice 0                 AUTHORIZED as a trust-boundary demonstration, harness-bounded
                        (may proceed only as a verification/harness lane until a finding
                         demonstrates product code is required)
Practice Workspace v1   design direction: exists · acceptance: NOT approved · implementation: NOT authorized
#899                    MERGED 945ba197d · invariant verified on trunk · NOT deployed, runtime unobserved
```

### 6.5 #899 — post-merge state, stated precisely

**Merged ≠ activated ≠ verified in use.**

| Stage | State |
|---|---|
| Implementation | ✅ complete |
| Static verification (A/B, live instrument) | ✅ fails 4/4 pre-repair, passes 4/4 post |
| Typecheck no-regression | ✅ 239 = baseline |
| **Merged to trunk** | ✅ `945ba197d`; re-verified against the merged tip — 4 SQL inserts, 0 missing `team_id` |
| **Deployed** | ⛔ **NO** |
| **Runtime — a booking INSERT actually succeeding** | ⛔ **NOT OBSERVED** |

No migration is required (the column has existed since `20260630000004`), so activation is a code
deploy rather than a schema change. **Deploying is a separate authorization and has not been given.**

**Next transition — a founder naming decision, not a build decision:**

> *Are we authorizing the trust-boundary proof called Slice 0, or beginning the larger Practice
> Workspace v1 product lane?*

Once that sentence is answered, the remaining gates become straightforward to evaluate.

*The system does not outrun the evidence.*
