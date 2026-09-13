# JOP-04 · RB-6A — M1 Mutation Run · ⛔ **RB-6A DOES NOT CLOSE**

**Run:** 2026-09-13 · **Disposition:** the mutation **bit, but not exactly where predeclared.**

```text
BASELINE SUBJECT          e1c6f527
RB-6A CANDIDATE           fd543df1   (UNCHANGED)
PRECONDITION AMENDMENT    eb5030ac
M1 MATRIX FROZEN AT       432ebf77   (before the mutant existed)
M1 MUTANT                 dd3d8cd7   (disposable · branch `jop04-m1-mutant` · ⛔ NEVER MERGE)
```

---

## 1 · The prerequisite runs were clean

| | Baseline `e1c6f527` | Candidate `fd543df1` |
|---|---|---|
| Profile | BASELINE MATRIX | RB-6A CANDIDATE MATRIX |
| Mismatches | **0** | **0** |
| Null preconditions | **0** | **0** |
| Instrument errors | **0** | **0** |

**Candidate observed exactly as frozen:** `F1 GREEN · F2 GREEN · F3 RED · F4 RED ·
F5 UNINSTANTIATED · F6 RED · F7 N/A · F8 GREEN · CAL-2a GREEN · CAL-2b GREEN.`

⭐ **RB-F4 came back RED on a reached precondition**, exactly as ruled: *"an otherwise-eligible
invocation executed with NO effect declaration — absence was accepted as sufficient."* Your
correction was right — **F4 needed no effect vocabulary to witness the current RED.**

⭐ **The enforcement caught its own author first.** On the run before this one, `RB-F3` and `RB-F6`
returned `INSTRUMENT_ERROR` because I had written their precondition records in the pre-ruling shape.
The runner refused them rather than accepting a malformed contract. **That is Ruling 1 working on the
person implementing Ruling 1.**

## 2 · M1 result — 8/10 match, 2 mismatches

| Probe | M1 predicted | Observed | |
|---|---|---|---|
| RB-F1 | RED | **RED** | ✅ bit |
| RB-F2 | RED | **RED** | ✅ bit |
| RB-F3 | RED | **RED** | ✅ unchanged |
| RB-F4 | RED | **RED** | ✅ unchanged |
| RB-F5 | UNINSTANTIATED | UNINSTANTIATED | ✅ |
| RB-F6 | PRECONDITION-UNMET | **PRECONDITION-UNMET** | ✅ as reasoned |
| RB-F7 | N/A | N/A | ✅ |
| RB-F8 | 🟢 GREEN | 🟢 **GREEN** | ✅ **control held — the mutation did not widen execution authority** |
| **RB-CAL-2a** | RED | 🔴 **GREEN** | ⛔ **MISMATCH** |
| **RB-CAL-2b** | NOT-REACHED | 🔴 **RED** | ⛔ **MISMATCH** |

## 3 · ⛔ The mismatch is MY PREDICTION ERROR, not an instrument failure

**CAL-2a came back GREEN because one arm is still non-routable:**

```text
oversized input_chars  →  rejected_oversized     ← still reachable under M1
```

⭐ **M1 counterfeits the routing *eligibility*. It does not restore registration's *preemption* of
routing judgment.** Those are **two separate components** of `registered → routable`, and RB-6A
repaired both:

```text
COMPONENT 1   registration manufactures the routing fact     ← M1 reintroduces this
COMPONENT 2   registration preempts the router's own refusals ← M1 leaves REPAIRED
```

So `registered ∧ ¬routable` remains reachable through the oversize path, and CAL-2a correctly
reports GREEN. **My frozen prediction assumed M1 reintroduced both components. It reintroduces one.**

**CAL-2b then RAN — and caught the counterfeit:**

```text
⛔ the routing condition can be manufactured — forgery accepted,
   or both states not shown, or the caller derives it from CAPABILITIES
```

⭐ **This is CAL-2b doing precisely the job it was built for.** The declared-unsatisfied arm was
overridden by the mutation, so both states could not be shown for one capability, and the
anti-tautology check returned RED. It could only do that *because* CAL-2a was GREEN — my prediction
of `NOT-REACHED` presupposed a CAL-2a RED that did not occur.

## 4 · ⛔ RB-6A does not close

> *"If that mutation bites exactly where predeclared, RB-6A can finally close."*

**It did not bite exactly where predeclared.** Two verdicts moved differently than frozen, and a
matrix may not be retrofitted after its result is seen. ⛔ **I have not edited the M1 matrix.**

**What the run does establish, on the record:**

- The falsifier set **detects the counterfeit class**: F1, F2 and CAL-2b all fire on a mutation that
  never restores the literal `router.mjs:33` line.
- **RB-F8 held GREEN** under mutation — the control did its job.
- The precondition law held across three subjects with **zero nulls and zero instrument errors**.

## 5 · Owed as a ruling

1. **Adjudicate the M1 prediction error.** The mutation design named one behaviour; the architecture
   has two components. Either (a) re-freeze an M1 matrix that matches the mutation as built, or
   (b) build **M1-full** — counterfeit eligibility **and** restore preemption — and freeze its matrix
   before running. ⭐ **(b) is the stronger test**, because it asks whether the falsifiers bite on the
   whole class rather than half of it.
2. ⭐ **A methodological finding worth keeping:** *a mutation matrix is a claim about the repair's
   internal structure, not only about the falsifiers.* Predicting M1 wrongly revealed that RB-6A
   repaired **two** couplings where the design named one. That is information about the substrate,
   obtained from a failed prediction about the instrument.
3. The mutant `dd3d8cd7` on `jop04-m1-mutant` is **disposable and must never merge**. Retained only
   as the evidence referent for this record.

## 6 · Standing

```text
fd543df1        UNCHANGED · candidate matrix matched 10/10
PRECONDITION    enforced · 0 nulls · 0 instrument errors across 3 subjects
RB-F8           GREEN under baseline, candidate AND mutation
M1              8/10 — bit on F1, F2, CAL-2b; 2 predictions wrong
RB-6A           ⛔ NOT CLOSED
RB-6B           UNTOUCHED · F3 and F6 RED on reached preconditions
RB-6 EMBARGO    ACTIVE
```

> **A repair can be more thorough than the design that authorized it — and a wrong prediction is how
> you find out.**
