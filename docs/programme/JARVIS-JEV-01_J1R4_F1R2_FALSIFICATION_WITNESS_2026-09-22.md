# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R4-F1R2
## Question-Shape + Response-Value Fidelity — Successor Witness

**Date:** 2026-09-22 · **Act:** founder authorization `J1R4-F1R2` (response-admission fidelity only)
**Status:** ⭐ **MATRIX LETHAL + DISCRIMINATING · 57/57** · ⛔ **J1R4 REMAINS CANDIDATE, NOT
RATIFIED** · ⛔ **J2 SHUT** · ⛔ **SUITE NOT FROZEN**

```text
F1     valid partial evidence
F1R1   fixed Score.scale and construction-exactness fidelity
       valid within demonstrated scope
F1R2   closes remaining discovered response-admission fidelity gaps
```

⛔ **Neither F1 nor F1R1 is relabelled false, and neither file was modified.**

---

## 1 · §1 PINS — preserved

| | |
|---|---|
| J1R4 contract blob | `98eb6cf16223b83b4768e46e1ae253e7881ae5f5` — **unmodified**, verified |
| J0 blob (canonical) | `494cd61973ed02c4453067716657631f3f9143e9` ✅ |
| J5 TaskShape blob (canonical) | `e840d705c9c1059667379d321cc7b5c802045754` ✅ |
| F1 / F1R1 witnesses | **unmodified**, verified by `git diff --quiet` |
| Canonical | `239eba62c8a60db602c4151c4f5a65c95e371f1b` (Writer's Studio only; J0/J5 intact) |

## 2 · ⭐⭐ THE DEFECTS — all five reproduced against the F1R1 reference before repair

J1R4 §7.1 requires **three** conditions before admitting a Score or YesNo. F1R1 verified the
first and third. ⛔ **It did not verify the second:**

```text
∧ shape = the shape declared for packet.question_id in §6
```

Executed against the F1R1 reference, recorded verbatim:

```text
1 Score for Q_RISK     -> {"question_id":"Q_RISK","scale":{...},"score":0.8,"confidence":0.9}
2 YesNo for Q_DEPTH    -> {"question_id":"Q_DEPTH","answer":true,"confidence":0.9}
3 Abstain + confidence -> {"question_id":"Q_RISK","reason":"REFUSED"}       ← confidence dropped
4 score = NaN          -> admitted as a Score
5 confidence = NaN     -> admitted as a YesNo
```

⭐ **Defect 3 is the subtlest.** The abstention was admitted *and the inadmissible
`confidence` was silently discarded* — reintroducing exactly the semantic surface J1R4 §6.1
prohibits: *"it abstained, but with 0.9 confidence."* ⛔ Dropping a forbidden field is not
the same as refusing the response that carried it.

⭐ **Defect 4/5 is a JavaScript trap, not a typo.** `typeof NaN === 'number'`, `NaN < 0` is
`false`, `NaN > 1` is `false` — so a bare range comparison admits `NaN` and `±Infinity`
while appearing to bound the value. J1R4 says **`Real in [0,1]`**.

## 3 · §2–§4 REPAIRS TO THE MODEL (⛔ not to the contract)

1. **`DECLARED_SHAPE`** added — `Q_DEPTH → Score`; `Q_RISK`, `Q_SUFFICIENT`,
   `Q_LLM_NEEDED → YesNo`. ⭐ `ProviderAbstain` is lawful for **every** question and is
   therefore deliberately **not** in the table.
2. **Recognized structure + matching question + wrong declared shape → `OUT_OF_RANGE`.**
   ⛔ Not `UNKNOWN_SHAPE`: both are recognized structures.
3. **`isLawfulProviderAbstainShape`** — a lawful abstention is **exactly**
   `{ question_id, reason }`. A `confidence` member makes it a recognized Abstain structure
   with an inadmissible field → `OUT_OF_RANGE`. ⛔ No confidence value survives into
   `ProviderAbstain` or `AdmittedAbstain`.
4. **`inUnitInterval`** — `Number.isFinite(v) && v >= 0 && v <= 1`, applied to `score` and to
   **every** response `confidence`. The packet's `Number.isInteger` law is preserved.

**After repair, the same five probes:**

```text
1 Score for Q_RISK     -> OUT_OF_RANGE
2 YesNo for Q_DEPTH    -> OUT_OF_RANGE
3 Abstain + confidence -> OUT_OF_RANGE
4 score = NaN          -> OUT_OF_RANGE
5 confidence = NaN     -> OUT_OF_RANGE
```

## 4 · §6 PRECEDENCE — preserved and verified

⭐ A wrong question still yields `MISMATCHED_QUESTION` **before** the host asks whether the
shape is lawful for that question. Verified directly:

```text
packet Q_DEPTH + { question_id: Q_RISK, answer: true, confidence: .9 }
    -> {"question_id":"Q_DEPTH","reason":"MISMATCHED_QUESTION"}      ⛔ not OUT_OF_RANGE
```

Full order unchanged: `TIMEOUT · NO_RESPONSE · PARSE_FAILURE · UNKNOWN_SHAPE ·
MISMATCHED_QUESTION · OUT_OF_RANGE · model-supplied lawful abstention`.

## 5 · §5 NEW DEFEAT CANDIDATES — five, all killed

| Candidate | Required outcome |
|---|---|
| `DC-SCORE-FOR-YESNO-QUESTION` | `OUT_OF_RANGE` for every YesNo-declaring question |
| `DC-YESNO-FOR-SCORE-QUESTION` | `OUT_OF_RANGE` for every Score-declaring question |
| `DC-ABSTAIN-CONFIDENCE-ACCEPTED` | `OUT_OF_RANGE`; ⛔ confidence must not survive into the record |
| `DC-SCORE-NAN-ACCEPTED` | `OUT_OF_RANGE` for `NaN`, `+Infinity`, `-Infinity` |
| `DC-CONFIDENCE-NAN-ACCEPTED` | `OUT_OF_RANGE` for all three, on **Score confidence AND YesNo confidence** |

⭐ **The shared-mechanism convenience was used without hiding an untested branch**, as the act
required: the NaN-confidence candidate embodies one loose bound, and its falsifier exercises
**both** response shapes explicitly.

## 6 · §7 FULL RERUN — collateral recomputed from scratch

```text
corpus           57 falsifiers · 57 candidates   (46 F1 + 6 F1R1 + 5 F1R2)
REFERENCE        passes all 57                            ✅
LETHALITY        57/57 named kills                        ✅
DISCRIMINATION   73 collateral kills, 0 unclassified      ✅
STALE-COLLATERAL 0                                        ✅
SURVIVOR LAW     0 survivors                              ✅
typecheck exit 0 · matrix exit 0
```

⚠️ **An instrument defect was found and repaired during this act, recorded rather than
smoothed over.** The first F1R2 run reported **10 unclassified collateral**. Inspection showed
the cause was candidate **over-reach**, not new law: the NaN and scale candidates each
skipped *several* checks rather than the one they name. Tightened so each loosens exactly one
decision — collateral fell from 81 to 73 and unclassified from 10 to **2**, both then
classified as irreducible:

- `DC-ABSTAIN-REJECTED → DC-ABSTAIN-CONFIDENCE-ACCEPTED` — refusing every lawful abstention
  necessarily mishandles the abstain-with-confidence case too.
- `DC-MODEL-REASON-WINS → DC-ABSTAIN-CONFIDENCE-ACCEPTED` — consulting the model's
  self-report before the host's structural checks is *precisely* what lets an abstention
  carrying confidence be accepted.

⭐ *This is the third time the matrix has exposed a defect in the instrument rather than in a
candidate. That is the instrument working.*

## 7 · §8 SELF-WITNESS — five valid mutations

Each: verified present → typecheck **exit 0** (kill is **semantic**) → matrix **RED** →
baseline restored **byte-exact** (`sha256sum -c`, 4/4 OK) → full green.

| # | Mutation | Observed RED |
|---|---|---|
| 1 | Jev may remove an authorized act | `DC-REMOVES-AUTHORIZED-ACT` + 2 |
| 2 | trust a provider-originated `HostFailureReason` | `DC-MODEL-FORGES-HOST-REASON` + 2 |
| 3 | clamp an unrepresentable `file_count` | §5 overflow family (7) |
| 4 | admit a Score with missing / altered `scale` | `DC-SCORE-SCALE-OMITTED`, `DC-SCORE-SCALE-ALTERED` |
| ⭐ 5 | **remove the declared-shape law** | `DC-SCORE-FOR-YESNO-QUESTION`, `DC-YESNO-FOR-SCORE-QUESTION` |

⭐ Mutation 5 rolls the reference back into the F1R1 blind spot and the new laws catch it —
the same proof pattern mutation 4 gave for `scale`.

## 8 · SUITE POPULATION — F1R2 blob identities

| File | Blob |
|---|---|
| `contract-model.ts` | `d29be1d905f8ebe44fa002f92bfd13e3edd13a65` |
| `falsifiers.ts` | `26ef97b983e3f578c9441847dd555c72c08972f6` |
| `candidates.ts` | `374bb3a7b7e1efa63f1264cd972f123f03b0c073` |
| `matrix.ts` | `65c02619e519af89a771279934e797c7a2df8560` |
| `tsconfig.jarvis-jev-j1.json` | `2fd52a305287392c7b7c706c5ba941a73af3e538` (unchanged since F1) |

## 9 · ⚠️ NOT RUN

⛔ **Repo toolchain NOT resolvable** (no project `node_modules`). Run with **TypeScript 5.6.3
and tsx 4.23.15 from a scratchpad**, against the project's own tsconfig. The suite imports
nothing from the project — ⚠️ **but it is not the repo toolchain, and the founder's run
remains the evidence of record.**
⛔ `npm run typecheck` / `check:no-supabase` / Co-Lab gate — **NOT RUN**.
⛔ **No provider or network execution.** The suite consults only local git for pins.

## 10 · §X HONEST NEGATIVE RESULTS

⭐ All 57 obligations are falsifiable and killed; ⛔ none recorded **UNFALSIFIABLE BY THIS
INSTRUMENT**. ⛔ No contradiction in J1R4 was exposed, so no contract return is owed.

⚠️⚠️ **The standing caveat, now three times demonstrated and stated plainly:** a green matrix
measures the distance between candidate and reference. It measures **nothing** about the
distance between **reference and contract**. Three separate contract→reference gaps
(`scale`, construction exactness, declared shape) were found by **independent human
cross-read**, never by the matrix — and the matrix was green before each one.
⛔ **The absence of a fourth finding is not evidence that none exists.** ⭐ *Only the
cross-read licenses ratification; the matrix only makes the cross-read's conclusions
enforceable afterwards.*

## 11 · §10 STOP

⛔ No J1 ratification · ⛔ no J2 · ⛔ no freeze · ⛔ no J0/J1R4 edit · ⛔ no capability-table
change · ⛔ no provider registration · ⛔ no adapter · ⛔ no external inference · ⛔ no PR ·
⛔ no merge · ⛔ no deploy · ⛔ no production mutation. The 2026-09-20 dev-lane hold stands.

## 12 · STANDING

```text
J0                   RATIFIED · CANONICAL · IMMUTABLE @ 494cd619
J1R4                 CANDIDATE · NOT RATIFIED @ 98eb6cf1 (unchanged)
F1     @ 218c2504    valid partial evidence · 46/46
F1R1   @ e712f951    valid successor evidence · 52/52
F1R2   (this)        successor evidence · 57/57 · 0 survivors · ⛔ NOT FROZEN
J2                   NOT OPEN
ADAPTER              NOT AUTHORIZED
PROVIDER EXECUTION   NOT OPENED
```

**Next boundary:** final founder adjudication of **unchanged** J1R4 `98eb6cf1…` with
**F1 + F1R1 + F1R2** together.

⭐ *The reference now knows what a Score is, and which question is allowed to receive one.*
