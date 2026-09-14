# P1-03 · FREEZE TAXONOMY · AND THE ADJUDICATION OF SLICE 05 (D/E/F)

```text
RULED BY   founder, 2026-09-14 (taxonomy) · adjudicated by Jarvis against the pre-written gate
TYPE       RECORD ONLY
```

---

## 1 · ⭐ Three freeze categories, ratified

```text
INTERMEDIATE      frozen · unsignalled · unjudged · SUPERSEDABLE
FINAL             signalled · frozen · ELIGIBLE for checks 1–6
ADJUDICATED       final · checked · PASS or FAIL recorded
```

⭐ **An unsignalled freeze is CUSTODY evidence, not ACCEPTANCE evidence.** `eadda439` and
`c0682dca` presently establish only *"this artifact existed in this exact state at this point in
the worker's production history"* — ⛔ **nothing about compliance with checks 1–6.**

### 1a · The supersession rule

When a worker later signals, its final state is frozen as a **new immutable commit** and the
earlier snapshot is marked:

```text
SUPERSEDED AS INTERMEDIATE — never adjudicated
```

⛔ The intermediate is **never** described as *failed*, *incomplete*, or *non-conformant* — those
are judgements the gate never made. ⛔ And the final is **never** described as a *repair* of the
intermediate; it is simply the worker's later authored state.

### 1b · ⛔ No semantic comparison before final freeze

⛔ Do not compare an intermediate and a final **semantically** before the final is frozen —
*otherwise the lane operator starts forming expectations about what the gate ought to find.*
After final freeze a diff may be retained as provenance, but **the acceptance judgement runs
against the final artifact itself.**

⭐ Line count is **provenance metadata**, ⛔ never evidence of completeness. (The earlier refusal
to read anything into 932 vs 333 lines stands.)

### 1c · Status correction

The founder's status table recorded slice 05 as `RUNNING`; it was written before the handback.
**Slice 05 signalled, was frozen as FINAL at `cd094d39`, and is adjudicated below.** Recorded as a
correction rather than silently updated.

---

## 2 · Slice 05 — `05_ladder_D_E_F.md`, frozen FINAL at `cd094d39`

```text
111 rows parsed  ·  46 positions recovered  ·  65 UNKNOWN
```

| # | Check | Result | Evidence |
|---|---|---|---|
| **1** | every recovered position carries its exact record quote | ✅ **PASS** | **0 of 46** recovered positions lack a quoted `BASIS` (parsed mechanically, not read for impression) |
| **2** | no monotonic ladder inference | ✅ **PASS** | no row carries a `DECIDES→CONTRIBUTES→CONSIDERS→KNOWS` chain; `KNOWS` and `CONSIDERS` assigned **0 times** — the rungs a monotonic slip would have populated are empty |
| **3** | every applicable `INF-6` restraint recorded explicitly | ✅ **PASS** | **8** prevention lines · **17** `INF-6` references · a **12-row** `EFFECT-WITHOUT-LOCATED-AUTHORIZATION` inventory, as named rows |
| **4** | `NONE LOCATED` and `UNKNOWN` remain distinct | ✅ **PASS** | `NONE LOCATED` 88 · `UNKNOWN` 124, separately counted · **`ABSENT` written 0 times** |
| **5** | contradictions carried, not resolved | ✅ **PASS** | `X-DEF-1` ×5 · `X-DEF-2` ×11 · `RECORDS DISAGREE` ×7 · 10 rows `UNKNOWN` **on disagreement** |
| **6** | no source or code reread | ⚠️ **PASS — with a declared evidentiary limit** | see §2a |

**`HAS AUTHORITY` assigned: 0 times.** The word *"unauthorized"* appears 4 times, **all four inside
prohibition statements**, never as a verdict.

### 2a · ⚠️ Check 6 carries the lane's own distinction, applied to the gate

⛔ **A negative cannot be proved from the artifact.** What was located:

- every citation in the file resolves to a **P1-02 record** (18 record citations);
- the worker declared records-only method at the head of the file;
- the repository shows **no source change** at any point in the pass.

So the honest reading — by **this lane's own rule** — is:

```text
⛔ NOT   ABSENT (no reread occurred)
✅ IS    NONE LOCATED (no evidence of a reread was found in the permitted evidence)
```

⭐ *The gate is subject to the same epistemic discipline as the census it judges.* Check 6 passes
at that standard and ⛔ not at a stronger one.

---

## 3 · ⭐⭐ The finding the pass produced: `INF-6` fired against this lane's own record

Row **`P3-D-06`** (`enforceFieldSafety`). The record establishes the effect in its own words —
*"it **DECIDES**, and its text **replaces** MAIA's"*, returned *"before the turn reaches a model"* —
and its §7 records that **no ratified source authorizing realm-based refusal was located**, adding
that the in-source commentary *"is a citation, not a located source."*

⚠️ **And one sentence after describing the effect, the P1-02 record itself made the prohibited
promotion:** *"(e) is the only object in Domain D at HAS AUTHORITY."*

⭐ The ladder worker **quoted that sentence, preserved it as evidence, and did not carry it**,
writing the restraint into the row instead:

```text
DECIDES established · HAS AUTHORITY not established · INF-6 prevents promotion
```

⭐⭐ **`INF-6` was not a hypothetical guard against a careless future worker. It fired against
evidence this lane itself produced, eight hours earlier, under its own instrument.** The
prohibition earned its place by catching its author.

⭐ And the opposite case is recorded beside it: a P1-02 record that **already refused** the same
promotion — *"authentication establishes PARTICIPATES, not HAS AUTHORITY."* One record made the
collapse; another refused it; the pass carries both.

### 3a · Other results worth preserving

- ⭐ **Amendment 3's third combination appears in the wild** — one row is `PARTICIPATION UNKNOWN`
  + `AUTHORITY GOVERNED`. The state the single-hierarchy schema could not have expressed is real.
- **Domain D lost two of its three explicit `CONTRIBUTES`** to disagreement (`X-DEF-1`, `X-DEF-2`);
  both sides quoted, neither derived across.
- ⭐ Two `X-DEF-2`-dependent rows **did** recover a position **on a stated independent basis**, and
  the independence is **written out rather than assumed**.
- **Domain E** contains no ladder vocabulary anywhere; ⛔ nothing was manufactured — 12 positions
  came from E's own prose.
- **Domain F** kept `KNOW`/`SAY`/`CONCLUDE` strictly off the ladder in a dedicated 18-row
  `F-POWER` section, and left the `CONCLUDE` count **unsettled** with all three incompatible
  enumerations reproduced.

---

## 4 · Standing

```text
05 D/E/F   ✅ ADJUDICATED — 6/6 PASS (check 6 at NONE LOCATED standard) · frozen cd094d39
04 A/B/C   🔒 INTERMEDIATE · unsignalled · unjudged · supersedable
06 G/H/I   🔒 INTERMEDIATE · unsignalled · unjudged · supersedable

P1-03 CLOSE   ⏸ requires all three ADJUDICATED
P1-04 / P1-05 ⏸
AUTH-EXPOSURE-01   🟠 independent
```

⛔ One gate spent, two to go. ⛔ P1-03 does not close on a partial pass.
