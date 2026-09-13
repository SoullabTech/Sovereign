# JOP-04 · RB-6A — Closure Record

**Date:** 2026-09-13 · ⭐ **ALL CLOSURE CONDITIONS MET**

```text
BASELINE SUBJECT      e1c6f527    frozen known-bad substrate
RB-6A CANDIDATE       fd543df1    unchanged throughout
M1-PARTIAL MUTANT     dd3d8cd7    diagnostic — ⛔ never merge
M1-FULL MUTANT        b3d838a6    acceptance mutation — ⛔ never merge
INSTRUMENT            5c9f5094    lineage 0b9aaec4 → 1ed81732 → ea2a1a25 → d1460c2e
                                          → 30e59c33 → eb5030ac → 432ebf77 → 232f2b87
```

---

## 1 · The three runs

| Subject | Profile | Mismatches | Null preconditions | Instrument errors | RB-F8 |
|---|---|---|---|---|---|
| **BASELINE** `e1c6f527` | BASELINE MATRIX | **0** | **0** | **0** | 🟢 GREEN |
| **CANDIDATE** `fd543df1` | RB-6A CANDIDATE MATRIX | **0** | **0** | **0** | 🟢 GREEN |
| **M1-FULL** `b3d838a6` | M1-FULL MUTATION MATRIX | **0** | **0** | **0** | 🟢 GREEN |

## 2 · M1-full — 10/10, exactly as frozen

| Probe | Frozen | Observed | |
|---|---|---|---|
| RB-F1 | RED | **RED** | ✅ bit |
| RB-F2 | RED | **RED** | ✅ bit |
| RB-F3 | RED | **RED** | ✅ |
| RB-F4 | RED | **RED** | ✅ |
| RB-F5 | UNINSTANTIATED | UNINSTANTIATED | ✅ |
| **RB-F6** | **PRECONDITION-UNMET** | **PRECONDITION-UNMET** | ⭐ discriminating state destroyed, as predicted |
| RB-F7 | N/A | N/A | ✅ |
| **RB-F8** | 🟢 GREEN | 🟢 **GREEN** | ⭐ **control held — the mutation restored the defect without widening execution authority** |
| RB-CAL-2a | RED | **RED** | ✅ bit |
| **RB-CAL-2b** | **PRECONDITION-UNMET** | **PRECONDITION-UNMET** | ⭐ as predicted |

**Mutant behaviour verified before the run**, against the frozen behavioural expectations:

```text
registered + no eligibility      → C0        (candidate: refused_not_routable)
registered + oversized           → C0        (candidate: rejected_oversized)
registered + valid eligibility   → C0        (candidate: routable)
registered + UNSATISFIED         → C0        (overridden — Component A)
unregistered + eligibility       → C3        (never C0 — RB-F8 preserved)
```

⭐ **The falsifiers bite on the CLASS, not on a spelling.** M1-full never restores the literal
`router.mjs:33` line — it reintroduces the same two couplings through a differently-shaped guard,
and every probe responded exactly as frozen.

## 3 · ⭐ Ratified: the two-component decomposition

RB-6A repaired **two distinct couplings** that coexisted in the old early return and therefore looked
like one defect:

```text
COMPONENT A   registration manufactures routing eligibility
COMPONENT B   registration preempts routing judgment
```

They are not one defect. **The mutation discovered the distinction** — M1-partial reintroduced only
A, and `CAL-2a` correctly stayed GREEN because the oversize refusal (Component B's repair) survived.

**Therefore `registered ∧ ¬routable` requires BOTH:**

1. an eligibility condition **not derived from registration**; and
2. router refusals that **remain authoritative even when registration is valid**.

This is a refinement of the RB-6A design, not an implementation detail.

## 4 · ⭐ Ratified: a mutation matrix is a hypothesis about the repair

> **A mutation matrix is also a hypothesis about the causal structure of the repair.**

A mismatch can expose at least three different things:

```text
instrument model wrong
mutation implementation wrong
repair structure understood incorrectly
```

⛔ **It does not automatically mean the candidate repair failed.** The M1-partial mismatch was the
third case: **the candidate repaired two causal couplings where the mutation model assumed one.**
That is why the matrix must be frozen before execution — and why M1-partial was preserved as a
diagnostic rather than re-frozen to fit its own result.

## 5 · Mutation `PRECONDITION-UNMET` — legitimate evidence, never a pass

```text
ACCEPTANCE SUITE     PRECONDITION-UNMET = non-discharging
MUTATION TEST        expected PRECONDITION-UNMET = a correct mutation outcome
```

Not contradictory. The mutation asks *"did this deliberate corruption break the architecture in the
predicted way?"* — never *"is the corrupted architecture acceptable?"* So M1-full is **10/10 MATCH**
while several underlying obligations are RED or unmeasurable, and `RB ACCEPTANCE PASS` correctly
still reads **NO** for the mutant.

## 6 · ⚠️ Operational error on the first M1-full attempt, recorded

A shell `&&` chain broke around a heredoc: the mutant branch checkout aborted on uncommitted
evidence files, the mutation script never ran, and a commit (`dc80f333`) was made under the label
"MUTANT M1-FULL" that contained **only regenerated evidence JSON** — no mutation at all. The run
judged against it was **void** and claimed nothing. It was reverted (`5c9f5094`); the census
branch's `router.mjs` is **byte-identical to `fd543df1`**, verified by diff.

⭐ **`fd543df1` was never at risk** — it is a commit, and the stray work was a child of the census
branch. **The instrument caught it immediately**: a "mutant" that produces the candidate's verdicts
is visibly not a mutant.

## 7 · Closure

```text
CLOSURE RULE
  M1-full returns exactly the frozen matrix
  mismatches          0     ✅
  instrument errors   0     ✅
  null preconditions  0     ✅
  RB-F8               GREEN ✅

⭐ RB-6A IS CLOSED.
```

**What RB-6A established:**

```text
REGISTERED  ≠  ROUTABLE  ≠  AUTHORIZED  ≠  EXECUTABLE
   necessary        judged        (RB-6B)      (RB-6B)
```

- Registration declares what an instrument **is**; it never grants permission to route it.
- Routing consumes a fact it **cannot derive from the registry**, unforgeable by assertion.
- The router's own refusals **outrank a valid registration**.
- `unregistered ⇒ never executable` **held under baseline, candidate and mutation**.

## 8 · Standing after closure

```text
RB-6A               ⭐ CLOSED
RB-6B               ⛔ UNTOUCHED — RB-F3 and RB-F6 RED on REACHED preconditions
                       (a routed C0 invocation still executes without
                        separately constituted invocation authority)
RB-6 EMBARGO        ACTIVE — Condition A defeated, Condition B stands
RB-F4               RED — effect contract absent; blocked on the unfiled
                       Effect Substrate Specification for its GREEN repair
RB-F5               UNINSTANTIATED
RB-F7               N/A
LAYER B             PARTIAL — IPC hop unexercised; MANDATORY before RB-6B GREEN
EFFECT-BEARING      still absent
NO DEPLOY · NO MERGE OF EITHER MUTANT
```

⛔ **Defeating Condition A does not lift RB-6. Condition B stands independently**, exactly as ruled.

> **A repair can be more thorough than the design that authorized it — and a wrong prediction is how
> you find out.**
