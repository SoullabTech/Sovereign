# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-04 · CLOSE

```text
RESULT   ✅ CLOSED — 4 / 4 maps ADJUDICATED · 16 / 16 checks PASS
GATE     fixed at 65fabb4a + f3f758aa, before any map existed
```

| Map | Frozen | Drawn edges | Unclassed | Declined section | Result |
|---|---|---|---|---|---|
| MAP 1 participation | `b744916f` (standing upgrade) | 59 | **0** | present | ✅ 4/4 |
| MAP 2 causal altitude | `b744916f` | 54 | **0** | present | ✅ 4/4 |
| MAP 3 authority | `418798e3` | 58 | **0** | present | ✅ 4/4 |
| MAP 4 contradiction | `418798e3` (successor) | 47 | **0** | present | ✅ 4/4 |

⛔ **MAP 4's failed final at `c190338e` stands preserved and unamended.** Its successor was judged
afresh on all four checks; ⛔ none was carried forward as pre-passed.

---

## 1 · ⚠️ A correction to my own method, recorded

My first check-1 pass reported **3 unclassed edges in MAP 1 and 8 in MAP 2**. ⛔ **That was wrong.**
It matched **physical lines** rather than **edge entries**, and multi-line entries carry their
`SYN` class on a continuation line:

```text
M-10 B-01…B-07 · … · C-08 → O-2   CONSIDERS (prompt entry)
     SYN-1 · the slice's declared discriminator: "material affirmatively traced into a prompt …"
```

Re-checked **per entry**: 59 · 54 · 58 · 47 edge entries, **0 without a `SYN` class** in any map.

⭐⭐ **And the deeper point: requiring same-line placement would have been exactly the rendering
prescription that was refused after MAP 4's failure.** The gate says an edge must *carry an
explicit `SYN` standing* — ⛔ it does not say where. A gate that silently acquires a formatting
rule while checking is no longer the gate that was fixed.

*I nearly failed two maps on a criterion the contract does not contain.*

---

## 2 · Checks 2, 3, 4

**Check 2 — declined edges preserved.** All four carry the section. ⭐ MAP 4 titles it *"EDGES
OMITTED FOR WANT OF A QUOTED RELATION"* rather than *"Edges NOT drawn"*. ⛔ **Not scored as a
failure** — check 2 requires **preservation**, not a heading string, and inventing a naming
requirement would be the same error as §1.

**Check 3 — epistemic labels preserved.** `NONE LOCATED`, `UNKNOWN`, `UNKNOWN BY SCOPE` and
`GOVERNED SCOPE` carried throughout. **`ABSENT` written 0 times as a claim** in all four; its six
occurrences are all inside ⛔ clauses forbidding it. ⭐ **`GOVERNED ACT` is written nowhere in
MAP 3** — its eight occurrences are the vocabulary definition and prohibitions, including the map's
own line: *"`GOVERNED ACT` is written nowhere in this map. No slice's quoted source said it."*

**Check 4 — no claim strengthened by compression.** Zero fused-negative labels. Zero verdicts. The
two *"unauthorized"* occurrences are a quoted record refusing the verdict, and MAP 2 naming and
declining it: ⭐ *"…would come next: that any of this is unauthorized. That is a verdict, ⛔ it is
outside this census."* Headings are structural. MAP 4 disclaims ordering as priority or severity in
terms.

---

## 3 · What the four maps establish

### MAP 3 — the authority picture

```text
183 nodes (of 221 rows)

AUTHORITY    NONE LOCATED                                167
             GOVERNED                                      7
             SPLIT (halves kept apart)                      2
             GOVERNING TEXT LOCATED / IMPL. NONE FOUND      3   ← slice 05's own fourth value,
             UNKNOWN (emitted only where DECIDES/CONTRIBUTES) 4     ⛔ not collapsed

GOVERNED SCOPE   explicit                                   2   both GOVERNED SHAPE
                 SCOPE OF GOVERNANCE — UNKNOWN            181
                 GOVERNED ACT                               0
```

⭐⭐ **Two of 221 rows carry an explicitly-scoped governance, and both govern the SHAPE OF A RECORD
— not an act.** Where a slice stated a scope in words outside the four labels, the words are quoted
and the label stays `UNKNOWN`, ⛔ rather than forcing a fit.

⭐ All **62** `EFFECT-WITHOUT-LOCATED-AUTHORIZATION` rows are individually legible as node blocks
**and** named again with their effect phrase. ⛔ No count replaces a row.

### MAP 1 / MAP 2 — the participation picture

⭐ The `PARTICIPATES` gap is rendered as `PARTICIPATES UNKNOWN · SYN-4` per domain, labelled a
**vocabulary-evidence gap**, ⛔ never as a negative — and the worker extended it to **D and E**,
having found no record there used the rung either. ⚠️ It also flagged that G/H/I's 41-of-48 is
**not comparable** with those zeros, because that slice declared a reading rule the others had none
of.

⭐⭐ **`CONSIDERS = 0` is carried as TWO DIFFERENT KINDS OF ZERO**, kept apart: 47 rows `SYN-4`
(the question was never posed) versus one row `SYN-1 OBSERVED NEGATIVE` (*"never reads an awareness
level"*). ⛔ A single zero would have erased that distinction.

⭐ `EXISTS 48/48` is shown at the layer as a **slice-level shared basis**, ⛔ marked not coverage and
⛔ not comparable with the other slices' `EXISTS`, which mean the opposite.

⭐ **MAP 2 §9 is a dedicated non-monotonic section** — the rows where a lower rung was declined
beneath a higher one, as positive evidence.

### MAP 4 — the contradiction picture

92 item blocks · 47 classed edges · 2 omissions with reasons · `SYN-4` separating *"the sources
conflict"* from *"we cannot tell whether they conflict."*

---

## 4 · ⚠️ Carried into P1-05, ⛔ not resolved here

| | |
|---|---|
| `X-DEF-1` · `X-DEF-2` · `X-DEF-3` | the third being the census catching an inference defect **in its own output** |
| symbolic `CONCLUDE` count | three incompatible enumerations · ⛔ no number settled |
| ⚠️ **a new arithmetic discrepancy** | MAP 3 reports slice 05's summary tallies `NONE LOCATED 46 · UNKNOWN 58` against its own **111 per-row lines** reading `71 · 33`. ⭐ **The map is built from the ROWS**; the discrepancy is recorded and ⛔ no row value was changed |
| the `54 / 51` declared deviation | ⛔ both numbers carried, ⛔ not averaged |
| 17 named `UNKNOWN` sub-questions · vocabulary collisions · anchor-versus-canon divergences · provider-failure plurality | |

---

## 5 · Standing

```text
P1-00 ✅  P1-01 ✅  P1-02 ✅  P1-03 ✅  P1-04 ✅ CLOSED — 16/16

P1-05   🟢 MAY OPEN — contradiction adjudication · ⭐ preserve genuine UNKNOWNs
        ⛔ no architectural repair
AUTH-EXPOSURE-01   🟠 independent · ⛔ not cited, awaited or answered in P1-04
REPOSITORY SOURCE  UNCHANGED      PRODUCTION  UNTOUCHED
```
