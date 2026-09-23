# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R4-F1R3
## Closed-Record Exactness — Successor Witness

**Date:** 2026-09-22 · **Act:** founder authorization `J1R4-F1R3` (closed-record exactness only)
**Status:** ⭐ **MATRIX LETHAL + DISCRIMINATING · 63/63** · ⛔ **J1R4 REMAINS CANDIDATE, NOT
RATIFIED** · ⛔ **J2 SHUT** · ⛔ **SUITE NOT FROZEN**

```text
F1     valid partial evidence
F1R1   fixed Score.scale and construction-exactness fidelity
F1R2   fixed question-shape and response-value fidelity
F1R3   closes closed-record exactness
```

⛔ **None of F1, F1R1 or F1R2 is relabelled false, and none of those files was modified.**
Each stands within its demonstrated scope.

---

## 1 · §I PINS — verified, preserved

| | |
|---|---|
| J1R4 contract blob | `98eb6cf16223b83b4768e46e1ae253e7881ae5f5` — **unmodified**, verified |
| J0 blob (canonical) | `494cd61973ed02c4453067716657631f3f9143e9` ✅ |
| J5 TaskShape blob (canonical) | `e840d705c9c1059667379d321cc7b5c802045754` ✅ |
| F1 / F1R1 / F1R2 witnesses | **unmodified**, verified by `git diff --quiet` |
| Canonical at act close | `239eba62c8a60db602c4151c4f5a65c95e371f1b` (unmoved during this act) |

## 2 · ⭐⭐ THE DEFECT — a closed record parsed as an open one

`J1R2` ratified **"Judgment shapes — exactly three, closed."** `J1R4` carried that forward and
never reopened it. The executable reference recognized a shape by **required-member
PRESENCE**:

```ts
export const isAbstainShaped = (v: unknown): boolean =>
  has(v, 'question_id') && has(v, 'reason');
```

So a response with everything the contract declares **and one member it does not** was
admitted as lawful, and the undeclared member was silently dropped on the way into the
record. Executed against the F1R2 reference, recorded verbatim:

```text
1 ProviderAbstain + trace_index -> {"question_id":"Q_RISK","reason":"REFUSED"}
2 Score + note                  -> {"question_id":"Q_DEPTH","scale":{"min":0,"max":1},"score":0.8,"confidence":0.9}
3 YesNo + metadata              -> {"question_id":"Q_RISK","answer":true,"confidence":0.9}
4 scale {min,max,meaning}       -> {"question_id":"Q_DEPTH","scale":{"min":0,"max":1},"score":0.8,"confidence":0.9}
5 change_scope member visibility-> DC-EXTRA-MEMBER sees only:
   ["packet_version","question_id","task_shape","contains_sensitive",
    "requires_external_info","change_scope"]
```

⭐ Every one is an **admission**, and in each the forbidden part is simply gone from the
record — case 4 most starkly: the provider's `scale` is discarded and replaced with the
contract's own, so the response reads as perfectly conforming afterwards.

⭐ **This is the `confidence` case of F1R2, generalized.** F1R2 fixed one forbidden member by
name. The general law — *the record is closed* — was still not enforced, so every other
undeclared member kept the behaviour F1R2 had just refused for `confidence`.

⛔ **A parser does not make an illegal response lawful by throwing away the part the contract
forbade.** That applies to `confidence`, and it applies equally to every undeclared member of
a closed record.

⚠️ **Case 5 is the one the suite was structurally blind to.** `DC-EXTRA-MEMBER` inspects the
packet's **top-level** keys only, so an undeclared member nested inside `change_scope` was
invisible to every F1/F1R1/F1R2 law. ⭐ *A class-legal primitive does not make an undeclared
nested member packet-legal* — `7` is a perfectly eligible value of the parent capability class
and is still not a member of `change_scope`.

## 3 · §II REPAIRS TO THE MODEL (⛔ not to the contract)

1. **Exact member sets declared** for every closed record:
   `Score{question_id, scale, score, confidence}` · `Scale{min, max}` ·
   `YesNo{question_id, answer, confidence}` · `ProviderAbstain{question_id, reason}` ·
   `AdmittedAbstain{question_id, reason}` · `ChangeScope{file_count, migration, auth, production}`.
2. **`exactMembers` / `undeclaredMembers`** added. ⛔ Neither replaces the structural
   predicates — see §4.
3. **Recognized shape + matching question + undeclared member → `OUT_OF_RANGE`**, and the
   undeclared member **never reaches the admitted record**. ⛔ Never silently stripped and the
   remainder admitted.
4. **`Scale` closed as its own nested record**, so `{min:0, max:1, meaning:"0 to 1"}` is
   refused although its min and max are correct.
5. **`change_scope` closed**, asserted both on the constructed packet and on the wire.

**After repair, the same four response probes:**

```text
1 ProviderAbstain + trace_index -> {"question_id":"Q_RISK","reason":"OUT_OF_RANGE"}
2 Score + note                  -> {"question_id":"Q_DEPTH","reason":"OUT_OF_RANGE"}
3 YesNo + metadata              -> {"question_id":"Q_RISK","reason":"OUT_OF_RANGE"}
4 scale {min,max,meaning}       -> {"question_id":"Q_DEPTH","reason":"OUT_OF_RANGE"}
```

## 4 · ⭐ §II/§III THE DISTINCTION THAT KEEPS PRECEDENCE INTACT

Recognition and lawful membership are **different questions**, and collapsing them would have
broken §7.2:

```text
required structural member MISSING        -> UNKNOWN_SHAPE        (recognition)
recognized + wrong question               -> MISMATCHED_QUESTION  (identity)
recognized + right question + extra member-> OUT_OF_RANGE         (admissibility)
```

⭐ Structural recognition still orders §7.2. Exact membership is an **admissibility test
applied only after the question has matched**, so an extra member can never outrank
`MISMATCHED_QUESTION`. Verified directly against the repaired reference:

```text
packet Q_DEPTH + { question_id: Q_RISK, answer: true, confidence: .9, extra: 1 }
    -> {"question_id":"Q_DEPTH","reason":"MISMATCHED_QUESTION"}      ⛔ not OUT_OF_RANGE
```

Full order unchanged: `TIMEOUT · NO_RESPONSE · PARSE_FAILURE · UNKNOWN_SHAPE ·
MISMATCHED_QUESTION · OUT_OF_RANGE · model-supplied lawful abstention`.

## 5 · §V NEW DEFEAT CANDIDATES — six, all killed

| Candidate | Concrete response | Required outcome |
|---|---|---|
| `DC-PROVIDER-ABSTAIN-EXTRA-MEMBER` | `{question_id, reason:'REFUSED', trace_index:7}` | `OUT_OF_RANGE`; ⛔ never lawful `REFUSED` |
| `DC-SCORE-EXTRA-MEMBER` | `Score + note:'x'` | `OUT_OF_RANGE`; extra must not reach the record |
| `DC-YESNO-EXTRA-MEMBER` | `YesNo + metadata:7` | `OUT_OF_RANGE`; extra must not reach the record |
| `DC-SCALE-EXTRA-MEMBER` | `scale {min:0,max:1,meaning:'0 to 1'}` | `OUT_OF_RANGE` — the **nested** record |
| `DC-ADMITTED-EXTRA-MEMBER` | host enriches the admitted record on the way out | admitted record carries no undeclared member |
| `DC-CHANGE-SCOPE-EXTRA-MEMBER` | `change_scope + trace_index:7` | `change_scope` exactly its four members |

⭐ Each candidate **discards the forbidden part and admits the remainder** — the precise error
the act names — and each loosens exactly one decision, so every one of the six died on its
named falsifier with **zero collateral**.

⚠️ **Four existing candidates were NARROWED** so the new laws could be isolated, each still
embodying its own error and each still dying on its own falsifier:

- `DC-ABSTAIN-CONFIDENCE-ACCEPTED` — now perturbs only the `confidence` path.
- `DC-SCORE-SCALE-ALTERED` — now accepts an *exactly-membered* scale without judging min/max,
  so it no longer stands in for `DC-SCALE-EXTRA-MEMBER`.
- `DC-SCORE-NAN-ACCEPTED` / `DC-CONFIDENCE-NAN-ACCEPTED` — membership is enforced; only the
  bare range comparison stays loose.

⛔ No falsifier was weakened to accommodate a candidate. The narrowing is on the **candidates**,
which is the lawful direction.

## 6 · §VI FULL RERUN — collateral recomputed from scratch

```text
corpus           63 falsifiers · 63 candidates   (46 F1 + 6 F1R1 + 5 F1R2 + 6 F1R3)
REFERENCE        passes all 63                            ✅
LETHALITY        63/63 named kills                        ✅
DISCRIMINATION   75 collateral kills, 0 unclassified      ✅
STALE-COLLATERAL 0                                        ✅
SURVIVOR LAW     0 survivors                              ✅
typecheck exit 0 · matrix exit 0
```

The first full run reported **exactly two unclassified collateral**, both predicted and both
against the same new law; they were adjudicated, not papered over:

- `DC-ABSTAIN-REJECTED → DC-PROVIDER-ABSTAIN-EXTRA-MEMBER` — the candidate classifies **every**
  model-reason abstention `UNKNOWN_SHAPE`, so one carrying an undeclared member is refused for
  the wrong reason. Narrowing would mean admitting lawful abstentions, i.e. ceasing to embody
  the error. **IRREDUCIBLE.**
- `DC-MODEL-REASON-WINS → DC-PROVIDER-ABSTAIN-EXTRA-MEMBER` — consulting the model self-report
  **before** the host's own structural and membership checks is exactly what lets an abstention
  carrying an undeclared member be accepted as lawful. The closed-record law and the confidence
  law police the same single ordering decision. **IRREDUCIBLE.**

⭐ Both mirror classifications F1R2 already made for the `confidence` law against the same two
candidates — the same mechanism, now visible from a second side. ⛔ **No F1R2 classification was
removed or rewritten**; the two entries are additions.

## 7 · §VII SELF-WITNESS — six valid mutations

Each: mutation verified applied → typecheck **exit 0** (the kill is **semantic**, never a
compile error) → matrix **RED** on the named laws → baseline restored **byte-exact**
(`sha256sum -c`, 4/4 OK) → full green.

| # | Mutation | Observed RED |
|---|---|---|
| 1 | Jev may remove an authorized act | `DC-REMOVES-AUTHORIZED-ACT` + 3 |
| 2 | trust a provider-originated `HostFailureReason` | `DC-MODEL-FORGES-HOST-REASON` + 2 |
| 3 | clamp an unrepresentable `file_count` | the §5 overflow family (7) |
| 4 | admit a Score with missing / altered `scale` | `DC-SCORE-SCALE-OMITTED`, `DC-SCORE-SCALE-ALTERED`, `DC-SCALE-EXTRA-MEMBER` |
| 5 | remove the declared-shape law | `DC-SCORE-FOR-YESNO-QUESTION`, `DC-YESNO-FOR-SCORE-QUESTION` |
| ⭐ 6 | **accept an otherwise-lawful response carrying one undeclared member** | `DC-PROVIDER-ABSTAIN-EXTRA-MEMBER`, `DC-SCORE-EXTRA-MEMBER`, `DC-YESNO-EXTRA-MEMBER` |

⭐ **Mutation 6 rolls the reference back into the F1R2 blind spot and the new laws catch it** —
the same proof pattern mutation 4 gave for `scale` and mutation 5 for declared shape.

⭐ **Mutation 4's blast radius GREW, and that is informative rather than untidy:** removing the
scale judgment now also kills `DC-SCALE-EXTRA-MEMBER`, because the nested record's membership
is judged in the same expression. ⛔ A property of that mutation, not a change in the laws.

⚠️ **An instrument-handling error occurred during this act and is recorded rather than
smoothed over.** The first mutation driver restored the baseline with `git checkout --` while
the F1R3 repair was still **uncommitted**, so the working file was reverted to the F1R2 state
mid-run; every mutation in that first pass consequently reported a compile failure instead of
a semantic kill, and the five witnesses from that pass were **discarded, not reported**. The
repair was reconstructed and then **proved identical to the pre-mutation baseline by
`sha256sum -c` (4/4 OK)** before the witnesses were re-run against a **committed** baseline.
⭐ *The hash manifest taken before the first mutation is what made the loss recoverable and,
more importantly, provable — an asserted restoration would have been worth nothing.*

## 8 · SUITE POPULATION — F1R3 blob identities

| File | Blob |
|---|---|
| `contract-model.ts` | `05272f073f3e6fde84f9b68afdf18457dc837cd6` |
| `falsifiers.ts` | `c47d8d504bd3943452e8304a6156796845a7866f` |
| `candidates.ts` | `281218384db65e296b68cc41c71689118dfed5be` |
| `matrix.ts` | `b19441299d6a4199608304bcd813d148478b6b6d` |
| `tsconfig.jarvis-jev-j1.json` | `2fd52a305287392c7b7c706c5ba941a73af3e538` (unchanged since F1) |

## 9 · ⚠️ NOT RUN — toolchain standing as observed

⛔ **Repo toolchain NOT resolvable** (no project `node_modules`). Run with **TypeScript 5.6.3
and tsx 4.23.15 from a scratchpad**, against the project's own `tsconfig.jarvis-jev-j1.json`,
with `--typeRoots` pointed at the scratchpad's `@types` because the project's own are absent.
The suite imports nothing from the project (only `node:child_process`), so the same code is
exercised — ⚠️ **but it is not the repo toolchain, and the founder's run remains the evidence
of record.**
⛔ `npm run typecheck` / `check:no-supabase` / Co-Lab release gate — **NOT RUN**.
⛔ **No provider or network execution.** The suite consults only local git for pins.

## 10 · §X HONEST NEGATIVE RESULTS

⭐ All 63 obligations are falsifiable and killed; ⛔ none recorded **UNFALSIFIABLE BY THIS
INSTRUMENT**. ⛔ No contradiction in J1R4 was exposed, so no contract return is owed — the gap
was in the **instrument**, as it was in F1R1 and F1R2.

⚠️⚠️ **The standing caveat, now FOUR times demonstrated:** a green matrix measures the distance
between **candidate and reference**. It measures **nothing** about the distance between
**reference and contract**. Four separate contract→reference gaps — `scale`, construction
exactness, declared shape, and closed-record exactness — were each found by **independent human
cross-read**, never by the matrix, and **the matrix was green before each one**.

⛔ **The absence of a fifth finding is not evidence that none exists.** ⭐ *Only the cross-read
licenses ratification; the matrix only makes the cross-read's conclusions enforceable
afterwards.*

## 11 · §IX STOP

⛔ No J1 ratification · ⛔ no J2 · ⛔ no freeze · ⛔ no J0/J1R4 edit · ⛔ no capability-table
change · ⛔ no provider registration · ⛔ no adapter · ⛔ no external inference · ⛔ no PR ·
⛔ no merge · ⛔ no deploy · ⛔ no production mutation.

⛔ The 2026-09-20 dev-lane interim hold remains operative, both lift conditions undischarged.

## 12 · STANDING

```text
J0                   RATIFIED · CANONICAL · IMMUTABLE @ 494cd619
J1R4                 CANDIDATE · NOT RATIFIED @ 98eb6cf1 (unchanged)
F1     @ 218c2504    valid partial evidence · 46/46
F1R1   @ e712f951    valid successor evidence · 52/52
F1R2   @ 3723f47c    valid successor evidence · 57/57
F1R3   (this)        successor evidence · 63/63 · 0 survivors · ⛔ NOT FROZEN
J2                   NOT OPEN
ADAPTER              NOT AUTHORIZED
PROVIDER EXECUTION   NOT OPENED
```

**Next boundary:** final founder adjudication of **unchanged** J1R4 `98eb6cf1…` with
**F1 + F1R1 + F1R2 + F1R3** together.

⭐ *The reference now knows what a Score is, which question may receive one, and that nothing
else may travel alongside it.*
