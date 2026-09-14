# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-03 · CLOSE

```text
STEP     P1-03 · COMMON EVIDENCE SCHEMA — normalize without interpreting
RESULT   ✅ CLOSED — 3 / 3 slices ADJUDICATED · 18 / 18 checks PASS
GATE     fixed at 8adb72db, before any of this evidence existed
```

| Slice | Frozen | Rows | Recovered | UNKNOWN | Result |
|---|---|---|---|---|---|
| 04 A/B/C | `e988bbc8` | 62 | 50 | 12 | ✅ 6/6 |
| 05 D/E/F | `cd094d39` | 111 | 46 | 65 | ✅ 6/6 |
| 06 G/H/I | `3f904afb` | 48 | 48 | 0 | ✅ 6/6 |
| **total** | | **221** | **144** | **77** | |

⚠️ **Custody nuance on slice 06, recorded rather than smoothed:** its content did not change
between the last intermediate freeze and the worker's signal. **The tree at `3f904afb` is the
final artifact; the signal upgraded its STANDING, not its CONTENT.** ⛔ No new freeze commit was
manufactured to make the sequence look tidier.

⚠️ **Status correction:** the founder's last table recorded 04 and 06 as unsignalled
intermediates. Both signalled and were adjudicated. Recorded as a correction, ⛔ not silently
updated.

---

## 1 · ⭐ Check 2's rationale, tightened (founder) — ⛔ the PASS is unchanged

Empty `KNOWS` / `CONSIDERS` rungs are **corroborating evidence**, ⛔ not the decisive basis. A
monotonic error could occur as `DECIDES → inferred CONTRIBUTES` without ever touching them.

The **operative basis** for check 2, on all three slices:

```text
every recovered position has a direct record quote
+ no recovered position appears unless ITS OWN quoted basis establishes it
+ no lower rung supplied merely because a higher rung exists
```

Then `KNOWS = 0` / `CONSIDERS = 0` is **supporting evidence that the worker resisted the
hierarchy**, ⛔ never the proof by itself. This applies retroactively to the 04 and 05
adjudications; ⛔ neither PASS changes.

### 1a · ⚠️ One qualification on slice 06, stated so it cannot be misread

`EXISTS` is recovered on **48 of 48** rows. Its basis is a **slice-level shared quote** — the three
records' own §0 subject-verification statements — ⛔ not a per-row quote. Every **other** rung on
every row carries its own separate quote.

⭐ The worker flagged this itself and reported it separately *"so it is not read as coverage"*,
and gave the honest reading: **above `EXISTS`, 41 participate, 25 determine an outcome, 1 has a
located governing source.** ✅ Check 2 passes; ⛔ the qualification travels with it.

---

## 2 · ⭐⭐ `X-DEF-3` — the census catching an inference defect in its own output

Routed to **P1-05**. ⛔ **The P1-02 source record is NOT corrected.** The defect and the later
refusal are preserved side by side.

```text
X-DEF-3   EFFECT / AUTHORITY AXIS COLLAPSE

  P1-02 record            effect establishes DECIDES
  P1-02 §7, same record   no ratified authorizing source located
  P1-02 §6, same record   nevertheless promotes the object to HAS AUTHORITY
  P1-03 bounded pass      preserves that sentence as evidence
                          refuses the promotion under INF-6
```

⭐⭐ **This is not a missing source, and not a disagreement between documents. It is a
contradiction introduced by the census process itself** — which makes it the most valuable thing
P1-05 has to adjudicate.

⭐ And the counter-example stands beside it in the same corpus: another P1-02 record had already
refused the same promotion — *"authentication establishes `PARTICIPATES`, not `HAS AUTHORITY`."*

---

## 3 · ⭐⭐ The register's principal product

```text
EFFECT-WITHOUT-LOCATED-AUTHORIZATION       62 of 221 rows
   slice 04  18   ·   slice 05  12   ·   slice 06  32
```

⛔ **Not** *"62 unauthorized capabilities."* What is established, exactly:

```text
effect                  OBSERVED
authorization located   NO
authorization status    NONE LOCATED / UNKNOWN
```

⭐ Per Amendment 4 these survive as **named rows**, ⛔ never reduced to this count. The count is
navigation; **the rows are the finding.**

**Authority standing across the register:** `GOVERNED` is reached on a **single-digit** number of
rows in each slice — 2, 4 and 1 respectively. ⛔ `ABSENT` was written **0 times** in all three
slices.

### 3a · Three results that constrain what P1-04 may draw

- ⭐ **`PARTICIPATES` is EMPTY across A, B and C** — a **corpus gap** at the vocabulary level,
  ⛔ not a finding that nothing participates. P1-04 must not draw the layer for those domains.
- ⭐ **`CONSIDERS` is ZERO across G, H and I** — and the one place the question is posed is an
  **explicit negative**: a model selector *"never reads an awareness level."* `KNOWS` without
  `CONSIDERS`.
- ⭐⭐ **Two rows reach `GOVERNED` and still authorize no position**: what is governed is the
  **shape of the record, not the act.** A governed shape is not a governed action, and P1-04 must
  keep that visible at the node.

### 3b · Carried forward unresolved

`X-DEF-1` · `X-DEF-2` · `X-DEF-3` · the symbolic `CONCLUDE` count (three incompatible
enumerations) · **17 named `UNKNOWN` sub-questions** withheld by slice 06 · and one **declared,
auditable deviation** where slice 04 reads `NONE LOCATED` on 54 rows against the register's 51 —
⛔ **both numbers carried, not averaged**, because `GOVERNING SOURCE` and `AUTHORITY STANDING` are
different fields on different axes.

⚠️ ⭐ **`X-DEF-2` is NOT RESOLVABLE from slice 06** — no `X-DEF` label appears in its inputs, so
its route and six dependent rows are unidentified there. Declared `UNKNOWN BY SCOPE`, ⛔ not guessed.

---

## 4 · Check 6 across all three — PASS at the declared standard

```text
worker declaration      records-only, declared in-file on all three
citations               resolve only to P1-02 records (70 · 18 · 48)
source-tree mutation    none, at any point in the pass
contrary evidence       NONE LOCATED
```

⛔ Calling this absolute proof would violate the discipline the gate exists to check. ⭐ *The gate
applying its own `NONE LOCATED ≠ ABSENT` rule to itself is the strongest available evidence that
the method is coherent.*

---

## 5 · Standing

```text
P1-00 ✅   P1-01 ✅ G1 PASS   P1-02 ✅ 9/9   P1-03 ✅ CLOSED — 18/18 checks

P1-04   🟢 MAY OPEN — sparse graphs · two independent axes · SYN-1…SYN-4
        ⛔ no interpolation · ⛔ no unknown edges · ⛔ INF-6 rows never reduced to a count
P1-05   ⏸ X-DEF-1 · X-DEF-2 · X-DEF-3 · CONCLUDE count · preserve genuine UNKNOWNs

AUTH-EXPOSURE-01   🟠 independent · ⛔ not cited, awaited or answered anywhere in P1-03
REPOSITORY SOURCE  UNCHANGED      PRODUCTION  UNTOUCHED
```
