# EDE-005 — Pre-registration (written BEFORE execution)

**Instrument**: Evidence Differential Evaluation (EDE).
**Authorization**: Founder ruling following EDE-004 — *one final falsification before code.*

## 0. Founder rulings carried forward (record, not summary)

> **EDE-004: DISCRIMINATING PASS. EDE-003 CENTRAL INTERPRETATION SUBSTANTIALLY RETRACTED.**
> The surviving unaided defect is **conflict-representation admissibility**, not precedence or
> resolution. Implementation remains unauthorized.

**Candidate ledger — evidentiary history preserved, not silently rewritten:**

| candidate | status |
|---|---|
| `ADJUDICATION_ALLOWED(A,B) only if scope(A) ∩ scope(B) ≠ ∅` | ⛔ **REMAINS RETRACTED.** EDE-004 confirms *adjudication* was the wrong operation |
| `CONFLICT_REPRESENTABLE(A,B) requires scope(A) ∩ scope(B) ≠ ∅` | ⚠️ **NEW candidate**, attached to the operation EDE-004 isolated. ⛔ Not a resurrection of the above |

**Canonical form of the surviving proposition:**

> **Jurisdictionally disjoint claims may disagree in content but cannot constitute an authority
> conflict with one another.**

**B3 (supersession → lineage revision?) is ruled `CANONICALLY UNRESOLVED`** — the evaluator cannot
score disputed admissibility semantics, and briefed-arm agreement cannot settle it when the briefing
partly supplies the interpretation. ⛔ Not scored here.

**Why representation defects matter** (founder): bad representation becomes future evidence. A
stored "conflict" may later influence retrieval, synthesis, contradiction counts, provenance
judgments, or subsequent reasoning even though nothing was resolved at the time.

---

## 1. The single proposition under falsification

> **H-R**: Does jurisdictional disjointness *independently* prevent authority-conflict
> representation — **even under maximal semantic disagreement**?

## 2. Design — 3 × 2, texts fixed across the scope factor

Both claims use parallel general phrasing so each is equally plausible at either scope, and so
**length, register and specificity are not confounds** (they were, in EDE-003/004, where `c-9002`
was much longer).

`c-4471` constant in every cell: `practitioner` @ `practitioner_lens` —
*"Withdrawal after a family call is protective, not avoidant."*

**Factor 1 — semantic disagreement** (`c-9002` text; identical across both scope conditions):

| level | text |
|---|---|
| **D0** concordant | *"Withdrawal after a family call is protective, not avoidant."* — same proposition |
| **D1** moderate | *"Withdrawal after a family call is unclear in character."* |
| **D2** **maximal** | *"Withdrawal after a family call is avoidant, not protective."* — **exact mirror-negation** |

**Factor 2 — scope** (`c-9002` attribution; text untouched):

| condition | |
|---|---|
| **disjoint** | `founder` @ `soullab_lineage` |
| **intersect** | `practitioner` @ `practitioner_lens` |

## 3. Pre-registered expected answers

**Representability requires BOTH intersection AND disagreement** — a conjunctive test.

| cell | scope | content | expected `CONFLICT_REPRESENTABLE` |
|---|---|---|---|
| **C1** | disjoint | D0 concordant | **NO** |
| **C2** | disjoint | D1 moderate | **NO** |
| **C3** ⭐ | disjoint | **D2 maximal** | **NO** ← *the falsification cell* |
| **C4** | intersect | D0 concordant | **NO** (nothing to conflict over) |
| **C5** | intersect | D1 moderate | **YES** |
| **C6** | intersect | D2 maximal | **YES** |

**C3 is the test.** It applies maximal semantic pressure with scopes demonstrably disjoint.
**C4 is the reciprocal control** — it tests that intersection *alone* is insufficient, so a model
answering YES everywhere in the intersect column cannot pass by accident.

## 4. Arms

**WITHHELD**, all six cells, n=3 → 18 runs. **BRIEFED**, C3 only, n=3 → 3 runs. **Total 21.**

## 5. Question — representability ONLY

⛔ The words *precedence · adjudicate · resolve · resolution · discard · withdraw · rank · override ·
supersede* appear **nowhere** in the prompt. EDE-003 established that compressed questions
manufacture findings; EDE-005 asks one thing.

```
CONFLICT_REPRESENTABLE:  YES|NO   may the record represent c-4471 and c-9002 as standing in an
                                  authority conflict with one another?
```
Then a justification under 150 words. Position control: replicate 3 inverts to `NO|YES`.

## 6. Rationale criterion — pre-registered as load-bearing

**PASS** requires jurisdictional overlap — or its absence — to be **load-bearing**:
- `disjoint → NOT REPRESENTABLE` **because scopes do not intersect**;
- `intersecting + disagreement → REPRESENTABLE` **because they do**.

**FAIL**, notwithstanding a correct field, if:
- content disagreement alone is treated as **sufficient** for representability;
- absence or presence of precedence is treated as **relevant** to representability (it is not);
- prestige, corpus weight, length, or authorship seniority is invoked;
- no locatable reasoning.

## 7. Pre-registered classification rules (fixed before data)

- **C3 fails (says YES) while C1/C2 pass** → disagreement *magnitude* drives representability;
  H-R's converse holds; the defect is **threshold-shaped**.
- **C1–C3 all fail** → jurisdiction is simply **not consulted** for representability. Cleanest
  possible reproduction of EDE-004 B2, and the strongest available evidence for the candidate.
- **C1–C3 all pass** → ⛔ H-R holds unaided; **EDE-004 B2 was construction-specific** and the
  candidate loses its evidentiary basis. Report as such.
- **C4 fails (says YES)** → intersection alone is being read as conflict; the conjunctive structure
  is not held, and the C5/C6 passes are uninformative.
- **Correct fields with §6 rationale failures** → **verdict-adequate, admissibility-inadequate.**

## 8. Separately pre-registered forecast (prediction, NOT ground truth)

I expect **C3 to fail** (model answers YES) and C1 to pass, reproducing EDE-004 B2 with a
disagreement gradient — i.e. failures increasing from D0 → D2.

⚠️ **My last three forecasts were all falsified** (EDE-002, EDE-003, EDE-004). Recorded so it cannot
be retro-fitted; it carries no standing.

## 9. Standing constraints

⛔ No code · no `authority_scope` implementation · ⛔ no adjudication gate · ⛔ no
`intersection ⇒ adjudicate` · ⛔ B3's ontology question not scored · no generalized evaluator · no
new proof level · no semantics changed to accommodate observed behaviour · no model prose promoted
to proof · harness disposable · **STOP after this case.**
