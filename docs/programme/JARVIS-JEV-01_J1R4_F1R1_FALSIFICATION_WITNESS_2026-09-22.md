# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R4-F1R1
## Reference Fidelity + Missing Exactness Falsifiers — Successor Witness

**Date:** 2026-09-22 · **Act:** founder authorization `J1R4-F1R1` (instrument fidelity only)
**Status:** ⭐ **MATRIX LETHAL + DISCRIMINATING · 52/52** · ⛔ **J1R4 REMAINS CANDIDATE, NOT
RATIFIED** · ⛔ **J2 REMAINS SHUT** · ⛔ **SUITE NOT FROZEN**

```text
F1    valid PARTIAL lethality evidence
      RETURNED because the executable reference omitted contract-required Score.scale
      and did not falsify several explicit construction-exactness laws

F1R1  successor evidence
```

⛔ **F1 is not relabelled false.** Its 46 named kills, zero survivors, 70 classified
collateral and three mutation witnesses stand **within their demonstrated scope**. What it
did not do is be a complete executable image of J1R4.

---

## 1 · §I AUTHORITY PRESERVED

| | |
|---|---|
| J1R4 contract blob | `98eb6cf16223b83b4768e46e1ae253e7881ae5f5` — **byte-for-byte preserved**, verified unmodified |
| J0 blob (canonical) | `494cd61973ed02c4453067716657631f3f9143e9` ✅ |
| J5 TaskShape blob (canonical) | `e840d705c9c1059667379d321cc7b5c802045754` ✅ |
| F1 evidence commit | `218c2504ca253d767c84b2c08d9d95bb3c18e7a4` — preserved |
| F1 witness | **UNMODIFIED**, verified by `git diff --quiet` |
| Canonical at act close | `239eba62c8a60db602c4151c4f5a65c95e371f1b` |

⚠️ Canonical advanced during the act (`32e677d3…` → `239eba62…`). **The J0 and J5 blobs are
unchanged**, which is the condition §I names, so the act proceeded. ⛔ J1R4 was not edited.

## 2 · ⭐⭐ THE DEFECT — confirmed against the contract text, not inferred

J1R4 §6.1 requires:

```text
Score := { question_id, scale: { min: 0, max: 1 }, score: Real in [0,1], confidence: Real in [0,1] }
```

The F1 executable model defined `Score` as `{ kind, question_id, score, confidence }` and its
`isScoreShaped` predicate tested only `question_id + score`.

⭐ **A mechanical check confirmed the finding exactly: the string `scale` occurred ZERO times
in all four F1 suite files.** A response `{ question_id, score, confidence }` — non-conforming
under J1R4 — was admitted as a valid Score, and `scale: { min: 0, max: 100 }` was not
falsified by anything.

⚠️ **The matrix was genuinely lethal against the model it built. The model was weaker than the
contract it claimed to witness.** ⭐ *A green matrix certifies the reference, not the
contract, unless the reference is a faithful image of the contract — and nothing inside the
matrix could have detected the difference.*

## 3 · §II REPAIRS TO THE EXECUTABLE MODEL (⛔ not to the contract)

1. **`scale` is now contract-required** in `ScoreJudgment`, in the structural shape
   predicate, in admission, and in the admitted record.
2. **§IV precedence made exact:**

   ```text
   not structurally Score-shaped                     → UNKNOWN_SHAPE
   Score-shaped + wrong question                     → MISMATCHED_QUESTION
   Score-shaped + matching question + bad scale/value → OUT_OF_RANGE
   ```

   ⭐ A response missing `scale` is **not Score-shaped**, so it lands on `UNKNOWN_SHAPE`;
   a present-but-altered `scale` is a **value** failure and lands on `OUT_OF_RANGE`.
   ⭐ Question mismatch continues to outrank value invalidity, per §7.2.
3. **A valid admitted Score preserves the contract-required scale.**
4. ⭐ **The harness tag `kind` is REMOVED from the contract value.** `AdmittedJudgment` is now
   the bare `{ question_id, … }` object and discrimination is **structural**
   (`isScoreValue` / `isYesNoValue` / `isAbstainValue`). ⛔ A test-only discriminator no
   longer travels inside the modeled value.
5. ⭐⭐ **`WorkUnitState` boolean positions are now typed `unknown`, not `boolean`.** In F1 the
   compiler made "a non-boolean in a boolean position" **unbuildable**, and that was mistaken
   for enforcement. ⛔ *TypeScript must not make the bad implementation impossible to express
   and then be called constitutional enforcement.*
6. `constructPacket` accepts `QuestionId | string`, so an invalid selector is expressible.

## 4 · §III NEW DEFEAT CANDIDATES — six, all killed

| Candidate | Embodies | Required outcome |
|---|---|---|
| `DC-SCORE-SCALE-OMITTED` | admits `{question_id, score}` as a Score | not admitted as Score; `UNKNOWN_SHAPE` |
| `DC-SCORE-SCALE-ALTERED` | accepts `scale {min:0,max:100}` | `OUT_OF_RANGE` |
| `DC-SCORE-SCALE-DROPPED` | admits a valid Score but drops `scale` from the record | admitted record must carry `{min:0,max:1}` |
| `DC-NONBOOLEAN-CONSTRUCTS` | coerces non-booleans in boolean positions | **NO** representation constructed |
| `DC-INVALID-QUESTION-CONSTRUCTS` | substitutes a default for an invalid selector | **NO** representation constructed |
| `DC-PACKET-VERSION-DRIFT` | constructs with `packet_version: "jev-4"` | `packet_version` must be exactly `"jev-3"` |

## 5 · §V FULL MATRIX RESULT

```text
corpus           52 falsifiers · 52 candidates  (46 original + 6 F1R1)
REFERENCE        passes all 52                          ✅
LETHALITY        52/52 named kills                      ✅
DISCRIMINATION   71 collateral kills, 0 unclassified    ✅
STALE-COLLATERAL 0                                      ✅
SURVIVOR LAW     0 survivors                            ✅

typecheck  exit 0
matrix     exit 0
```

⭐ **The prior 70 collateral declarations were NOT inherited mechanically** — the matrix
re-verified every one against the repaired instrument and reported **0 stale**. One new
collateral appeared and was classified: `DC-PACKET-VERSION-DRIFT → DC-FREE-STRING`, because
an off-contract version string is by construction not class-eligible; narrowing it would
require a drifted version that is nonetheless class-legal, i.e. not embodying the drift.

## 6 · §VI SELF-WITNESS — four valid mutations

Each: mutation verified present → typecheck **exit 0** (kill is **semantic**) → matrix **RED**
→ baseline restored **byte-exact** (`sha256sum -c`, 4/4 OK) → full green re-run.

| # | Mutation | Observed RED |
|---|---|---|
| 1 | permit Jev to remove an authorized act | `DC-REMOVES-AUTHORIZED-ACT`, `DC-ABSTAIN-MOVES-AUTHORITY`, `DC-LLM-TRUE-GRANTS` |
| 2 | trust a provider-originated `HostFailureReason` | `DC-MODEL-FORGES-HOST-REASON`, `DC-HOST-REASON-PASSTHROUGH`, `DC-FORGERY-DISCARDED` |
| 3 | clamp an unrepresentable `file_count` | the whole §5 overflow family (7) |
| ⭐ 4 | **admit a Score with missing / altered `scale`** | `DC-SCORE-SCALE-OMITTED`, `DC-SCORE-SCALE-ALTERED` |

⭐⭐ **Mutation 4 reproduces the exact F1 defect, and the new laws catch it.** That is the
strongest available demonstration that the repair is real rather than asserted: the
instrument was rolled back into its own former blind spot and went red.

⚠️ Mutations 1–3 were **re-run against the repaired baseline**, not carried over — the
instrument changed, so the old witnesses could not stand. Mutation 1's blast radius is wider
here (3 falsifiers rather than 1) because it was written as an unconditional removal; ⛔ that
is a property of this mutation, not a change in the laws.

## 7 · SUITE POPULATION — F1R1 blob identities

| File | Blob |
|---|---|
| `tests/constitutional/jarvis-jev-j1/contract-model.ts` | `cb6723e000510e9705dc5e6047f8f9ce629cb146` |
| `tests/constitutional/jarvis-jev-j1/falsifiers.ts` | `e392f325db8b897e58176724643ae5dc547a84e4` |
| `tests/constitutional/jarvis-jev-j1/candidates.ts` | `41feffee0ab19823bc930cba857a657edb8a540b` |
| `tests/constitutional/jarvis-jev-j1/matrix.ts` | `a5d9a968beb059159e98fc36d2c49ec6edd55045` |
| `tsconfig.jarvis-jev-j1.json` | `2fd52a305287392c7b7c706c5ba941a73af3e538` (unchanged from F1) |

⭐ `scale` now occurs **26 times** across the suite (12 model · 7 falsifiers · 7 candidates),
against **0** in F1.

## 8 · ⚠️ NOT RUN — toolchain standing as observed at run time

⛔ **The repo toolchain was NOT resolvable.** No project `node_modules`; no local
`typescript`/`tsx`. Run with **TypeScript 5.6.3 and tsx 4.23.15 installed into a scratchpad**,
against the project's own `tsconfig.jarvis-jev-j1.json`. The suite imports nothing from the
project (only `node:child_process`), so the same code is exercised — ⚠️ **but it is not the
repo toolchain, and the founder's own run remains the evidence of record.**

⛔ `npm run typecheck` / `check:no-supabase` / Co-Lab release gate — **NOT RUN**.
⛔ **No provider or network execution of any kind.** The suite consults only local git for pins.

## 9 · §X HONEST NEGATIVE RESULTS

⭐ All 52 obligations are falsifiable and killed; ⛔ none recorded **UNFALSIFIABLE BY THIS
INSTRUMENT**.

⚠️ **Carried from F1 and still true:** `DC-TASKSHAPE-DRIFT` and `DC-SELF-STANDING` are only
falsifiable because `taskShapes()` and `questionIds()` are exposed on the model interface.
Asserting over module constants alone would have made them unfalsifiable.

⭐ **No contradiction in J1R4 was exposed**, so ⛔ no contract return is owed from F1R1. The
`scale` finding is a defect in the **instrument**, not in the contract.

⚠️ **The general lesson, recorded because it outlives this lane:** the F1 matrix could not
have found this itself. Lethality measures the distance between a candidate and the
reference; it says nothing about the distance between the **reference and the contract**.
⭐ *That gap is closed only by reading the contract against the model — by a party other than
the one that wrote both.*

## 10 · COMMANDS

```text
npx tsc -p tsconfig.jarvis-jev-j1.json                 → exit 0
npx tsx tests/constitutional/jarvis-jev-j1/matrix.ts   → exit 0
```

## 11 · §VIII STOP BOUNDARY

⛔ No J1 ratification · ⛔ no J2 opening · ⛔ no suite freeze · ⛔ no J0 or J1R4 edit · ⛔ no
capability-table change · ⛔ no provider registration · ⛔ no adapter · ⛔ no external
inference · ⛔ no PR · ⛔ no merge · ⛔ no deploy · ⛔ no production mutation.

⛔ The 2026-09-20 dev-lane interim hold remains operative, both lift conditions undischarged.

## 12 · STANDING

```text
J0 Constitution      RATIFIED · CANONICAL · IMMUTABLE @ blob 494cd619
J1R1 · J1R2 · J1R3   RETURNED · historical
J1R4                 CANDIDATE · NOT RATIFIED @ blob 98eb6cf1 (unchanged)
F1                   VALID PARTIAL EVIDENCE @ 218c2504 · historical · not relabelled
F1R1                 SUCCESSOR EVIDENCE · 52/52 · 0 survivors · ⛔ NOT FROZEN
J2                   NOT OPEN
ADAPTER              NOT AUTHORIZED
PROVIDER EXECUTION   NOT OPENED
```

**Next boundary:** founder adjudication of **unchanged** J1R4 blob `98eb6cf1…` together with
exact **F1 + F1R1** evidence.

⭐ *A green matrix proves the candidates die against the reference. Only reading the contract
against the reference proves the reference was the contract.*
