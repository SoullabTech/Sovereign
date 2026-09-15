# JR-01 · Corpus v0 — answer-key provenance and construction record

**Class: RESEARCH INSTRUMENT + RECORD. ⛔ No lane opened. ⛔ No product source changed.
⛔ Nothing measured yet — no model has seen a single stimulus.**
Frozen 2026-09-15 against `3909be96`. Corpus `jr01-v0`.

Artifacts
- `tests/research/jr-01/corpusContract.ts` — typed contract `jr01-c1`, the six laws as types
- `tests/research/jr-01/corpus.v0.ts` — 12 operators · 48 pairs · 96 stimuli
- `tests/research/jr-01/validate.mjs` — the six laws as gates that fire
- `tsconfig.jr01-research.json` · `npm run typecheck:jr01` · `npm run validate:jr01`

Validator, this session: **`0 failed · 0 warned`** · 48 pairs · order 24 AB / 24 BA ·
10 same-surface pairs.
⚠️ `typecheck:jr01` was **NOT run** — this container has no `node_modules`. ⛔ Not
reported as a pass; the founder's run is the evidence of record.

---

## 1 · The question, stated narrowly

⛔ Not *does MAIA have relational geometry.* ⛔ Not *does a model reason relationally.*

> **When the lexical payload is held constant and one load-bearing relation changes,
> does the answer move in the direction the repository's own rule requires — and does
> it stay put when only the wording changes?**

⭐ Geometry is a **later explanatory question**. Rungs 1–2 of the evidence staircase
need no activations, no partner, and no model internals. Nothing in the corpus
presumes an internal representation exists, and ⛔ **no corpus result is ever evidence
about one.**

## 2 · Scope decision taken

The twelve are the **implemented** distinctions. ⛔ The Authority × Time material is
excluded: `valid_from` appears in **zero** TypeScript files, so there is no rule from
which to derive an answer key (L3). It returns when it is built, not before.

---

## 3 · The answer key, verified against code

Each row was read at source before a stimulus was written. `grounding` is the
**weakest** citation on the operator — the validator recomputes it and fails if the
operator claims better standing than its weakest source.

| ID | Distinction | Where the rule lives | Grounding |
|---|---|---|---|
| R01 | kept back by a restraint ≠ never admissible | `adjudicate.ts` exclusion branches all `continue` before the first restraint branch; `participationDisposition.ts` closed disjoint reason families | contract_only |
| R02 | placed by the person ≠ fetched by the system | `PARTICIPATION_CLASS` separates `placed`/`retrieved`; admitted-reason read off the class, not the text | contract_only |
| R03 | situating context ≠ derived proposition | the `AUTHORITY` axis (`situate`·`compute`·`infer`); the inference cap counting admitted `infer` producers | contract_only |
| R04 | authorship ≠ mechanism of arrival | `AUTHORED_BY` and `PARTICIPATION_CLASS` as separate axes; `axesOf` copies all three onto every entry | contract_only |
| R05 | historically recoverable ≠ presently current | `recoverEvidence` (digest-verified) declared separately from `locateCurrent`; `readState` freezes (revision, range, digest) | harness_exercised |
| R06 | unmeasured ≠ current | `CurrentLocation` is a **three**-member union; `LiveWork` fields nullable so an unloadable Work cannot read as agreement | harness_exercised |
| R07 | never supplied ≠ ran and found nothing | `MemoryBundleState` separates `absent` from `present_empty` | contract_only |
| R08 | nothing arrived ≠ deliberately kept out | `suppressed_sanctuary` a distinct member of both `MemoryBundleState` and `FallbackReason`; the sanctuary branch records a withholding | contract_only |
| R09 | begun ≠ completed | receipts inserted `attempted` **before** any passage; `MintOutcome` returns `existing` + prior state, never a fresh permission | **runtime_witnessed** |
| R10 | the identity gate | the identity branch compares encounter status to the producer's declared requirement | contract_only |
| R11 | standing preference keeps back; does not delete | the recall-preference branch withholds and explicitly does not exclude | contract_only |
| R12 | admissibility is a property of the encounter | the three room branches — policy, member-about, practitioner-authored — all **exclude** | **declared_unemitted** |

### 3.1 ⚠️ What the grounding manifest actually says

```
runtime_witnessed    R09
harness_exercised    R05 R06
contract_only        R01 R02 R03 R04 R07 R08 R10 R11
declared_unemitted   R12
```

⭐⭐ **Eight of twelve are compiler-enforced type distinctions and nothing more.**
That is L6 doing its job, and it is the most important line in this record. ⛔ It must
not be softened into "the architecture makes these distinctions" — the architecture
*declares* them; two are exercised by a harness; one is witnessed against a real route;
one is emitted by nothing at all.

⚠️ R01–R04, R08, R10–R12 are marked `contract_only` even though `adjudicate.ts` is
`shadow_executed`, because every one of them also rests on a `contract_only` citation
and the weakest source governs. `shadow_executed` itself means: **runs in production on
live turns and does not produce the member's response.** CMT-01 M3 is unauthorized;
legacy assembly still speaks.

---

## 4 · Three findings the verification produced

### 4.1 ⭐ The ordering law R01 actually rests on

`adjudicate.ts` evaluates **every admissibility branch before the first restraint
branch**, each with a `continue`:

```
not registered for room  → EXCLUDED not_registered_for_room
room policy              → EXCLUDED room_forbids
identity mismatch        → EXCLUDED no_verified_member
member-about barred      → EXCLUDED room_forbids
practitioner + no field  → EXCLUDED room_forbids
───────────── admissibility ends, restraint begins ─────────────
sanctuary                → HELD sanctuary
recall preference off    → HELD recall_pref_off
nothing rendered         → HELD no_material
inference cap reached    → HELD inference_cap
otherwise                → ADMITTED
```

⭐ This yields a **conjunction case the twelve do not yet contain**: material that is
both barred by the setting *and* restrained by the person's own posture must come out
**not admissible**, never withheld — the restraint branch is unreachable. That is a
sharper test than either R01 or R12 alone, because a model that has learned "a person's
own privacy setting wins" gets it backwards. ⛔ Not added to v0; recorded as the first
candidate for v1.

### 4.2 ⚠️ `room_policy` is declared and emitted by nothing

`HELD_REASONS` contains `room_policy`. Every room branch in the adjudicator emits the
**excluding** reason instead. A repository-wide grep finds the string in exactly one
file — its own declaration.

⛔ The corpus does **not** resolve which family a room constraint should belong to.
R12's key follows what the adjudicator *does*, and the divergence is carried as a
`declared_unemitted` citation so the corpus cannot silently inherit a vocabulary item
no code path supports. ⭐ Whether the vocabulary or the adjudicator is wrong is a
founder question; naming it is not authorization to change either.

### 4.3 ⚠️ R07 and R08 are the corpus's own hardest honesty test

`turnMemoryProvenance.ts` states, in its own header, that `absent` and `present_empty`
**collapse into one falsy check at the fork and are indistinguishable in the logs
today.** So the answer key for R07 is a rule about what *should* be recorded, not a
witness of what is.

⭐ That does not disqualify them — they are among the best specimens in the corpus,
because the observable payload is the empty string in both cases. But a correct model
answer on R07 establishes **nothing whatever about MAIA's runtime**, and the operator
says so in its own `doesNotEstablish` field.

---

## 5 · The instrument defect, and why repairing it was not a concession

The first validator run failed **32 checks**, twenty of them real corpus defects
(vocabulary leaks; identity-control pairs that paraphrased instead of restating; one
perturbation pair where too much moved). All twenty were repaired **in the corpus**.

⭐⭐ Twelve were the instrument's fault, and the pattern gave it away: `generalization`
failed for **all twelve operators**, always for being internally minimal. The check
compared A to B inside the pair. But in that cell A and B differ in *both* wording and
relation, which any two unrelated sentences satisfy — the constraint was checking
nothing while appearing strict. What the cell is for is carrying the same relational
contrast into a surface the perturbation cell never used, so the comparison with teeth
is **the pair against this operator's `relational_perturbation` pair**.

⛔ The replacement is **stricter than no check and stricter than the one it replaced**;
the within-pair minimality it stopped demanding was never a property the law asked for.
⚠️ Stated explicitly because the move *looks* like the forbidden one — reinterpreting a
contract so an artifact passes. The discriminator: the law's meaning was recovered from
the law, and the new check can still fail (it does, on a pair that reuses its own
domain). A repair that made every generalization pair pass unconditionally would have
been the other thing.

---

## 6 · What the corpus can and cannot carry

**Can, with no model internals:**
- **Rung 1 · recurrence** — does a model distinguish many novel instances of one relation?
- **Rung 2 · vocabulary invariance** — does the distinction survive when every trace of
  repository vocabulary is gone? L2 makes this the default condition, not a later step:
  no stimulus contains an answer word.
- The **controls** that stop a flip rate being read as competence. ⭐ A model that changes
  its answer whenever *any* word changes scores well on perturbation alone and **dies on
  `paraphrase_control`.** Both numbers must be reported or neither means anything.
- The **10 same-surface pairs**, where A and B are byte-identical downstream. ⭐⭐ These
  carry the law the census forced: **identical output is not relational equivalence.**
  R07's perturbation pair is the cleanest — the payload is the empty string either way.

**Cannot:**
- Rungs 3–5 (discriminability, selective impairment, cross-model generalization). All
  three need representational access this repository does not have and this corpus does
  not pretend to supply.
- Any claim that a type-level distinction corresponds to a representational one. ⛔ That
  correspondence is the open empirical question; **having built the types is not partial
  evidence for it.**

---

## 7 · Standing

```
JR-01 CORPUS v0 ............... AUTHORED · FROZEN @ 3909be96
VALIDATOR ..................... 0 failed · 0 warned (this session)
typecheck:jr01 ................ ⛔ NOT RUN (no node_modules here) — founder run owed
GROUNDING ..................... 1 witnessed · 2 harness · 8 contract · 1 unemitted
MEASUREMENT ................... ⛔ NONE. No model has seen a stimulus.
v1 CANDIDATES ................. the §4.1 conjunction case; a third state for R05
EXTERNAL PARTNER .............. ⛔ not contacted, not required for rungs 1–2
SOURCE PAPER (2026-08-14) ..... ⛔ STILL UNREAD. Its first-unit instruction stands.
PRODUCT SOURCE ................ UNCHANGED   PRODUCTION ..... UNTOUCHED
```

⛔ Nothing above authorizes running the corpus against any model.
