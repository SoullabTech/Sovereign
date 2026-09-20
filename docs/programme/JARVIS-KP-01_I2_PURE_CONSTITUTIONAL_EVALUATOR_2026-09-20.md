# JARVIS-KP-01 · I2 — PURE CONSTITUTIONAL EPISTEMIC JOIN EVALUATOR

**Programme:** JARVIS-KP-01 — Shared Operational Knowledge Plane
**Act:** I2 — Pure Constitutional Epistemic Join Evaluator
**Date:** 2026-09-20
**Status:** IMPLEMENTATION CANDIDATE · CONSTITUTIONAL COMPUTATION ONLY · NO PERSISTENCE, REPRESENTATION, OR RUNTIME AUTHORITY
**Immutable upstream:** canonical ACT 10 → ACT 11 → ACT 12 → ACT 11A → ACT 12A → I1

> **NO SEMANTIC JOIN WITHOUT A WARRANT.**

> `REFERENCE → REPORT/MOVE → COMPARE/JUXTAPOSE → HYPOTHESIZE → WARRANTED JOIN → PROMOTE/DISCHARGE`

---

## 0 · Candidate base — one correction to the authorization, recorded rather than absorbed

The I2 authorization named the canonical base as `981b741b24924af7fc7e82d73a158be58fbff7d3` and described it as
"exact current `clean-main-no-secrets` canonical". **That was true when the authorization was written and is no longer
current.** At the opening of this act `origin/clean-main-no-secrets` is `700b6d52470a7a45c825a57be21f2fe422cec6c8`, and
`981b741b` is its ancestor.

The candidate is therefore opened from `700b6d52`, not from `981b741b`, and the reason is recorded mechanically rather
than asserted:

| Check | Result |
|---|---|
| `981b741b` is an ancestor of `origin/clean-main-no-secrets` | YES |
| Files changed `981b741b..700b6d52` | 6 — three programme records, `lib/maia/teaching/*`, one teaching test |
| Any path under `lib/ain/` or matching `epistemic` touched | **NONE** |
| I1 architecture blob `…I1_EPISTEMIC_JOIN_IMPLEMENTATION_ARCHITECTURE_2026-09-19.md` | **IDENTICAL** `380b9ace491f22cfc544abb71bc895e56311d521` |
| I1 work unit blob `…I1_WORK_UNIT_2026-09-19.json` | **IDENTICAL** `7d4a6478dfd80ca4a6e7d54ce05764290b0ca8af` |
| ACT 11A blob | **IDENTICAL** `096ac18ab300c043470d58b02135d96f0b797fc0` |
| ACT 12A blob | **IDENTICAL** `5542d1136f7928937a996d4d2738a3897a05931b` |

Building from `981b741b` would have produced a candidate deliberately behind canonical for no epistemic reason, and the
freshness reconciliation would have been owed later anyway. Building from `700b6d52` preserves I1 byte-identically and
carries the intervening MAIA Teaching work without touching it. **The lineage through
`ACT 10 → ACT 11 → ACT 12 → ACT 11A → ACT 12A → I1` is unchanged in meaning and unchanged in bytes.**

⚠️ This is a base-selection judgment, not an authorization to widen scope. If the Founder requires the candidate to sit
exactly on `981b741b`, it can be replayed there: nothing in the candidate depends on the five intervening commits.

---

## 1 · What was built

One module boundary, exactly where I1 §2.1 placed it:

```
lib/ain/epistemic-join/
  types.ts       closed constitutional vocabularies, envelope, warrant, acts, result
  standing.ts    append-only standing derivation (no mutable standing authority)
  composite.ts   composite-warrant validation (ACT 11A §1)
  adoption.ts    component-scoped, jurisdiction-bounded adoption (ACT 11A §2)
  evaluate.ts    the pure admission evaluator (I1 §5 pipeline)
  index.ts       barrel
  __tests__/     fixtures + falsifiers + invariant witnesses + purity guards
```

**Deliberately absent, not present-and-disabled:** `store.ts` and `projection.ts`. I1 §2.1 lists both as later seams.
A disabled writer is still a writer waiting for a flag, so neither file exists; a guard asserts the module's file
inventory is exactly the six above.

`evaluateJoin(request)` answers one question — *does this explicitly supplied proposed semantic relation have
sufficient epistemic warrant for this standing in this jurisdiction?* — and stops.

---

## 2 · The constitutional behaviour, as implemented

### 2.1 No semantic join without a warrant

Absence, insufficiency, ambiguity, or jurisdictional mismatch of warrant **fails closed for standing elevation**. With
no warrant offered and elevation requested, the evaluator emits `no_warrant_offered`; where two relied-upon endpoints
are themselves WARRANTED or PROMOTED it additionally emits `endpoint_evidence_offered_as_relation_evidence`, because
`evidence(A) + evidence(B) ≠ evidence(A —R→ B)`.

⭐ **One distinction the implementation forced into the open.** A hypothesis needs no warrant *to be a hypothesis*. An
early draft floored the ceiling at `NONE_UNASSERTED` when no warrant was present, which silently made INV-13 —
hypothesis viability — unreachable: a lawful MAIA proposal evaluated to nothing at all. The ceiling is now floored at
`CANDIDATE_UNESTABLISHED` and then capped by operation stage, so *proposing* is admissible without warrant and
*asserting* is not. Fail-closed applies to elevation, never to inquiry.

### 2.2 Reference is not reliance

`DependenceMode` is declared per endpoint and per support entry, never inferred from the fact of mention. Both
directions of the error are refused: a reference-only endpoint offered as relied-upon support
(`reference_offered_as_reliance`), and relied-upon material missing from the reliance record
(`reliance_not_declared`). Only relied-upon material contributes boundary inheritance — a reference-only endpoint's
boundary is verifiably *not* carried, because reference is not dependence.

### 2.3 Support sets are not composite warrants

The ceiling across several warrants is the **maximum** of individual ceilings, never their sum — so N individually
insufficient warrants cannot reach a standing none of them licenses. Asking for that is *named*
(`support_set_offered_as_composite_warrant`) rather than silently downgraded.

A composite warrant carries all eleven ACT 11A §1.2 fields. `CompositionMethod` names the four non-methods —
`mere_agreement`, `source_count`, `source_prestige`, `restatement` — **so they can be refused**: a bundle relabelled
"composite" fails on its own declared method. Shared origin among relied-upon entries defeats a claim of independence
(`composite_pseudo_independence`); an unresolved dependence account refuses outright; circular and nested support are
walked, and a nested child's ceiling travels upward so a parent cannot outrun it.

⭐ **Both halves of the ACT 12A §7 double constraint hold.** A governed `convergent_independent_measurement` composite
over three individually partial sources earns PROVISIONAL standing with zero refusals. Accumulation cannot become
warrant, *and* genuine triangulation is not forbidden for being multi-source.

Method also caps semantics: a correlation-capable method that declares causation is refused
(`composite_method_does_not_license_semantics`); explanatory coherence does not become empirical truth.

### 2.4 Standing is derived

There is **no mutable standing authority anywhere in the module**. `resolveStanding` walks append-only succession
chains — the pattern already canonical in `scripts/research/structural-standing/claim-standing.ts` (I1 §1.5) — and a
`StandingAct`'s `claimedStanding` is a *request* that the evaluator caps by what warrants license. A standing act
claiming PROMOTED against a PROVISIONAL-ceiling warrant is admitted at PROVISIONAL, with
`standing_exceeds_warrant_ceiling` recorded.

Ordering comes from declared succession, never from a timestamp — which is simultaneously the determinism guarantee
and the reason no clock is needed.

⚠️ **Ambiguous history is malformed, not weaker.** Duplicate act ids, two acts claiming one predecessor, an unknown
predecessor, cross-subject succession, two roots for one subject, and a rootless chain all raise
`EpistemicJoinMalformed` rather than resolving to a lower standing. *A history the module cannot honestly read is not a
quieter claim; it is an input it must refuse.* This is the one place I2 throws: a **refusal** is a lawful verdict on a
well-formed object that did not earn standing; **malformation** means the input cannot be evaluated without the
evaluator inventing something.

### 2.5 Adoption is component-scoped

`MEMBER_AUTHORITATIVE_KINDS` is closed by law. A member adoption act names exact component ids and reaches only
member experience, meaning, values, preferences, intentions, and interpretations. It does not reach external motive,
external intention, external causal mechanism, diagnosis, science, history, metaphysics, or universal law — those keep
whatever standing their own warrants support, and may reach WARRANTED on an independent warrant with no adoption at all.

⭐ The ACT 11A §2.4 worked example is a passing test: one envelope, four components, **two admitted WARRANTED and two
admitted NONE_UNASSERTED from a single whole-sentence confirmation.**

⭐ **Refusing an out-of-jurisdiction adoption is not treated as an error by the member.** It is the *absence of
authority*: the component simply has no ceiling to be raised to. Only the member's own components are affected, and no
agent role can adopt at all.

### 2.6 Jurisdiction is mandatory

A warrant licenses its own declared jurisdiction. Transfer must be declared by the warrant itself
(`licensesTransferInto`); otherwise the evaluator emits `jurisdiction_mismatch` **and**
`cross_jurisdiction_transfer_undeclared` and leaves `admittedJurisdiction` null. There is no silent hierarchy among
jurisdictions and no implicit ordering in which one covers another.

### 2.7 Lower-standing hypotheses remain representable

`lowerStandingRepresentationPermitted` and `permittedLowerStandingOperation` are part of every result. A refused
promotion returns `HYPOTHESIZE`, not silence.

⭐ **Ceiling refusals narrow; defects fail closed.** ACT 11 §6 requires uncertainty to narrow standing rather than
disappear — *"when uncertain, lower standing before deleting meaning."* Three refusal codes
(`uncertainty_blocks_elevation`, `standing_exceeds_warrant_ceiling`, `operation_stage_below_requested_standing`) say
only *too strong* and therefore admit the licensed ceiling. Every other refusal — missing warrant, unlicensed
semantics, jurisdiction jump, dropped boundary, reliance error, composed authorship, accumulation, lost provenance —
is an epistemic **defect** and collapses to CANDIDATE. An earlier draft treated all refusals alike and thereby deleted
a lawful PROVISIONAL standing in order to refuse a PROMOTED request; that was an overcorrection against ACT 11 §6 and
was repaired.

**Corrigibility is never gated by warrant.** A requested DISCHARGED or SUPERSEDED standing is always admitted, with no
warrant required, and the prior standing stays recoverable in the chain. Re-elevating an already-discharged relation is
separately refused (`terminal_standing_not_re_elevable`).

### 2.8 Admission is not representation

`downstreamRepresentationAuthorized` is typed as the **literal `false`**, and `representationAuthority` as the literal
`'closed'`. This is not a runtime decision: there is no input for which either differs, and a type-level test with
`@ts-expect-error` asserts the field cannot be assigned `true`. **Representation authority is closed structurally, not
by discipline.**

---

## 3 · Purity

Deterministic for identical inputs. The module depends on no database, network, provider, clock, randomness,
environment, filesystem, or module-level mutable state; its only imports are relative paths inside itself. All of this
is asserted by executable guards, not by this paragraph.

⚠️ **Method note, and it is load-bearing:** every source scan **strips comments first**. The module documents the very
prohibitions it must not violate, so a raw-source scan would fail these files *because they state what they refuse to
do* — the C21 instrument defect from the Circles lane, applied here before it could bite rather than after.

---

## 4 · Evidence

| Instrument | Command | Result |
|---|---|---|
| Module typecheck | `npm run typecheck:epistemic-join` | **EXIT 0** — strict · `noUncheckedIndexedAccess` · `exactOptionalPropertyTypes` |
| Falsification suite | `npm run test:epistemic-join` | **100 passed · 0 failed · 3 suites** |
| Lethality matrix | scratchpad instrument, §5 below | **34/34 mutations killed** |
| Repository no-regression gate | `npm run typecheck` | **229 errors vs baseline 239 · 0 regressions · EXIT 0** |
| Protected seam blobs | `git hash-object` vs I1 work unit | **7/7 IDENTICAL** |
| Production call sites | repository grep | **NONE** |

⚠️ **One honest limitation about the gate.** `tsconfig.ship.json` **excludes `lib/ain/**`**, confirmed by
`tsc --listFiles` returning **0** epistemic-join files in the ship program. The repository no-regression gate therefore
says nothing about this module, and its green result is evidence only that the module regressed nothing *else*. The
dedicated `tsconfig.epistemic-join.json` is the actual instrument. Adding `lib/ain/**` to the ship include list would
be a governed coverage change to the enforced baseline and is **not taken here**.

### Protected seams — byte-identical to the SHAs I1 recorded

```
14e0d7cf…  database/migrations/20260120000001_relational_ledger.sql
a60190bc…  database/migrations/20260214100001_wisdom_graph_foundation.sql
4c15e3a0…  database/migrations/20260521000001_member_memory_atoms.sql
8d514242…  lib/maia/living-constellation/types.ts
dec478bf…  lib/maia/living-constellation/projection.ts
f7b3e9e6…  scripts/research/structural-standing/claim-standing.ts
e06fa7c7…  .ain/epistemic-ledger.jsonl
```

`member_memory_atoms.crossing_allowed` remains `BOOLEAN NOT NULL DEFAULT FALSE` under
`CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE)`. I2 neither lifts, bypasses, mutates, nor
reinterprets it.

---

## 5 · Lethality — the falsifiers were tested against wrong evaluators

A falsifier that cannot kill a wrong implementation is decoration. Thirty-four mutations were applied one at a time to
the candidate, each the smallest edit that defeats one named law, with the suite run against each:

**34/34 KILLED.**

⭐ **The matrix earned its place by finding two real gaps rather than confirming a hope.** On its first run two
mutations were not killed:

1. **Agent authorship impersonation survived.** A mutation letting a JARVIS-introduced relation present itself as
   member-authored passed the entire suite. ACT 11 INV-03/INV-11 and ACT 11 falsifiers 5–6 require that refusal and the
   suite did not test it. Four tests were added; the mutation now dies.
2. **The orphan-standing-act guard survived, and the first test written for it did not reach it** — the case threw
   `cross_subject_supersession` earlier in the function, so the test passed for the wrong reason. Replaced with a
   rootless mutually-superseding pair, which is the only shape that reaches the guard. *A test that passes before
   reaching the code it names is a false witness, and only the mutation exposed it.*

One further mutation reported `ANCHOR_MISSING` on the first run — an anchor string with wrong indentation, i.e. an
instrument defect that would have been silently scored as coverage had it not been reported as its own class.

Full table: `docs/programme/evidence/JARVIS-KP-01/I2/LETHALITY_MATRIX_2026-09-20.md`.

⚠️ **The matrix is session evidence, not a committed instrument.** It ran by in-place mutate-and-restore from the
scratchpad; the module was afterwards verified byte-identical to its pre-matrix state by `diff -r`. A committed,
non-destructive lethality instrument — disposable wrong-implementation candidates in the S3 B-ii/B-iii style rather
than mutation of real source — is **owed if the Founder wants the lethality claim independently re-runnable.** It is
not built here: a committed script that rewrites `lib/` files is a hazard this lane should not introduce casually.

---

## 6 · Falsification coverage against the authorization's sixteen required cases

| # | Required case | Codes exercised | Result |
|---|---|---|---|
| 1 | relation with no warrant | `no_warrant_offered`, `endpoint_evidence_offered_as_relation_evidence` | PASS |
| 2 | referenced source offered as reliance | `reference_offered_as_reliance`, `reliance_not_declared` | PASS |
| 3 | support set treated as composite | `support_set_offered_as_composite_warrant`, `composite_method_is_mere_accumulation` | PASS |
| 4 | jurisdiction mismatch | `jurisdiction_mismatch`, `cross_jurisdiction_transfer_undeclared` | PASS |
| 5 | member confirmation elevating an external fact | `adoption_outside_adopter_jurisdiction` | PASS |
| 6 | member confirmation of a member-authoritative component | none — admitted WARRANTED | PASS |
| 7 | causal claim without causal warrant | `semantics_not_licensed`, `composite_method_does_not_license_semantics` | PASS |
| 8 | motive attribution without warrant | `semantics_not_licensed`, no elevation | PASS |
| 9 | diagnostic claim without warrant | `adoption_outside_adopter_jurisdiction` | PASS |
| 10 | scientific claim outside warrant jurisdiction | `jurisdiction_mismatch`, `semantics_not_licensed` | PASS |
| 11 | composite with incomplete dependence assumptions | `composite_missing_dependence_resolution`, `composite_pseudo_independence`, `composite_circular_support`, `composite_nested_standing_ceiling` | PASS |
| 12 | uncertainty / boundary loss | `boundary_loss`, `uncertainty_blocks_elevation`, `warrant_not_live` | PASS |
| 13 | warrant produces only its licensed semantics | `semantics_not_licensed` naming the exact unlicensed member | PASS |
| 14 | failed promotion remains a hypothesis | `permittedLowerStandingOperation = HYPOTHESIZE` | PASS |
| 15 | standing derived from acts, not mutated | `standing_exceeds_warrant_ceiling`, `terminal_standing_not_re_elevable`, malformation guards | PASS |
| 16 | admission creates no representation authority | literal `false` / `'closed'` on every outcome class | PASS |

Regression witnesses additionally name **ACT 11 INV-01…INV-14**, **ACT 11A A11A-INV-01…A11A-INV-10**, **ACT 12A §6**
human-authority non-regression, **ACT 12A §7** composite double constraint, and **I1 §14** criteria 4, 5, 6, 7, 8, 9,
10 by identity, so a later weakening fails against the invariant's own name.

Synthetic data only. No member, client, clinical, PHI, Sanctuary, production, or private practitioner material.

---

## 7 · What I2 did not do

No schema · no migration · no database write · no persistence · no append-only store · no feature flag · no graph edge ·
no Wisdom Graph semantic authority · no Relational Practice Ledger semantic claim · no Member Memory mutation ·
`crossing_allowed` untouched · no Living Constellation semantic line · no MAIA prompt change · no MAIA behavioural
change · no runtime context injection · no automatic adoption · no provider/model call · no routing change · no CI
enforcement · no production shadow · no production read or write · no deployment · **no production call site exercising
I2 authority** · no PR · no merge · I3 not begun.

---

## 8 · Disposition

The question this candidate answers:

> **Is the constitutional epistemic-join law now executable as a pure function without granting persistence,
> representation, or runtime authority?**

**Answered: YES**, on this evidence — 100 tests, a 34/34 lethal mutation matrix, strict typecheck, structurally closed
representation authority, seven protected seams byte-identical to I1, and no call site anywhere.

Two qualifications the Founder should weigh, neither of which is repaired by asserting it away:

1. **The law is executable over explicitly supplied structure.** The evaluator decides correctly when authorship,
   jurisdiction, component kind, dependence, and reference/reliance are *declared*. Producing those declarations from
   real material is a different problem and remains unsolved — ACT 11A §2.7 and ACT 12A §4 both forbid rescuing it by
   assuming a parser or classifier. **I2 does not narrow that gap, and no result here should be read as evidence that
   it can be closed.**
2. **Standing derivation is proved in memory only.** Append-only succession is modelled over arrays. Whether a real
   append-only store preserves it under concurrency and crash is I3's burden, and I2's green suite is necessary but
   not sufficient for it — the same necessary-not-sufficient boundary the S3 lane drew between a model-level guarantee
   and a database witness.

**Standing: I2 CANDIDATE BUILT · 100 TESTS PASS · MATRIX 34/34 LETHAL · TYPECHECK CLEAN · SEAMS UNCHANGED · NO CALL
SITE · PR ⛔ NOT OPENED · MERGE ⛔ NOT AUTHORIZED · I3 ⛔ NOT BEGUN · PERSISTENCE ⛔ NOT CREATED · FEATURE FLAG ⛔ NOT
ACTIVATED · RUNTIME SURFACES ⛔ NOT CONNECTED · PRODUCTION UNTOUCHED.**

Returns for separate Founder adjudication.
