# SPM-FC-01-R5 — INDEPENDENT D9-A PROVENANCE SWEEP

```text
TYPE        INDEPENDENT VERIFICATION — the check final ratification was held for
SUBJECT     origin/chore/spm-fc-01-r4-four-clause-20260917 @ fe16036a9
AUTHOR      the agent that authored SPM-FC-01 @ 99d6f918 and identified the failure class
RESULT      PASS — no additional instance found
            2 findings, 1 structural, neither constitutional

⛔ NOT ratification · ⛔ NOT implementation authority · ⛔ no repair performed
```

## 1 · Custody

Branch fetched from origin; tip `fe16036a9` verified; all eleven commits in the reported governing
sequence resolve, `89a3e3a20` included. **`fe16036a9` descends from `99d6f918`** — the R5 line is a
continuation of the contract as committed, not a parallel authorship.

**Containment verified independently:** `git diff --name-only 99d6f918 fe16036a9 -- . ':!docs'` is
**empty**. Thirteen documents, 3154 insertions, zero source, schema or implementation change.

## 2 · The denominator, derived independently

The sweep's validity depends on having enumerated the right clauses. Rather than read their list, I
parsed the **Evidence field of all 33 clauses** at `fe16036a9` and extracted every clause citing
D9-A.

```text
independently derived    I-5 I-6 I-7 I-8 I-9 I-10 I-12 I-13 I-14 I-15 I-16 I-17   (12)
their sweep's set        I-5 I-6 I-7 I-8 I-9 I-10 I-12 I-13 I-14 I-15 I-16 I-17   (12)

in mine, not theirs      NONE
in theirs, not mine      NONE
```

**The class was enumerated correctly.** Their claim that it was mapped rather than sampled is
independently confirmed.

Disposition of all twelve: **5 corrected** (I-8 · I-12 · I-14 · I-15 · I-17, plus the non-clause
closing synthesis) · **3 bounded at R2** (I-7 · I-10 · I-16) · **4 residual PASS**
(I-5 · I-6 · I-9 · I-13). 5 + 3 + 4 = 12.

## 3 · The two verdicts I tested hardest

### 3.1 · I-8 — the correction adopts the evidence's own self-limitation

The replacement law reads: *where a governed crossing requires an authority independent of the
material's standing, no quantity or quality of epistemic standing substitutes for that required
authority.*

D9-C **§7.2**, *"The surviving claim, restated at its exact size"*:

> **Some crossings — including at least one genuine representation crossing to a human audience —
> require authority that is not reducible to the standing of the material being crossed.**

**These are the same proposition.** R5 did not invent a narrowing; it adopted the one the evidence
had already written for itself and that my draft had stepped past. The two explicit non-assertions
built into the Law field — that not every crossing has such an authority, and that standing may
still govern how strongly MAIA speaks — correspond exactly to D9-C §7.1's unevidenced rows and to
D9-B B10's `epistemicFraming` counter-evidence. **Verified PASS.**

Retaining the rejected sentence as historical hypothesis rather than deleting it is the correct
disposition and matches this programme's practice elsewhere.

### 3.2 · I-16 — the residual I judged highest-risk, and it holds

I flagged I-16 privately as the most likely surviving instance: D9-A C1 binds a warrant to *one
exact object*, while D9-C's specimen is a warrant held on the **relationship**, indexed by
**audience**. A clause universalizing exact-object binding would be contradicted by the very
specimen that earned I-18.

R2's replacement handles it, **and in both directions**: it permits a class-, relationship- or
audience-scoped warrant to cover multiple objects to the extent its declared scope says so, and it
adds the inverse prohibition — *relationship warrant exists → its scope silently exceeds the
relationship terms*. That second prohibition is not in my original and is an improvement on it.
**Verified PASS.**

## 4 · Accounting

```text
16 unchanged + 10 R2 + 4 R4 + 1 R5 = 31 local laws
31 local + I-19 (gap, states no law) + I-33 (imported) = 33 clauses
```

Arithmetic holds, and it is **self-consistent across revisions**: R4 reported 17 unchanged, R5
reports 16, the difference being I-8 moving from unchanged to corrected. `8dafd0bfe` performs
exactly that move. **Verified PASS.**

I-33's disposition — imported binding dependency, excluded from the local count, source authority
retained in the temporal-memory lane, SPM may cite but not amend — resolves the strikable-clause
question I raised without either smuggling it into the D9/F5 count or losing the distinction
Domain 13 needs. **Verified PASS.**

## 5 · FINDING 1 — STRUCTURAL · the contract does not point to its own corrections

The base document — `SPM-FC-01_COMBINED_D9_F5_FALSIFICATION_CONTRACT_2026-09-17.md`, the file named
*the contract* — is **unamended between `99d6f918` and `fe16036a9` except for the four-line R3
deletion**. It carries no `R2`, `R3`, `R4`, `R5`, *superseded*, *overlay* or *amended* marker
anywhere.

A reader opening it finds **I-8, I-12, I-14, I-15 and I-17 in their original overclaimed forms**,
with nothing indicating that five of its clauses have been corrected and where the governing text
lives. The corrections are real, committed and discoverable by reading the whole programme
directory — but the authoritative-looking document does not route the reader to them.

**This is the failure class this programme keeps catching, in a new location.** It is structurally
the same shape as F5-B §1.1, where a surface was protected by an authority it never declared, and as
F5-C §2.4, where a control was declared and no path read it. Here: **the governing text is real and
the document that appears to govern does not name it.**

⛔ **The fix is not to rewrite the clauses.** This programme's established practice is to mark
supersession in place and never edit a record to read as though it had always said otherwise. The
proportionate act is a supersession header on the base contract plus a per-clause marker on the six
corrected loci naming the governing overlay. **Text preserved; authority made findable.**

**Classification: documentation defect, not constitutional defect.** It does not alter any ruling
and does not block ratification on the merits. It should be closed before any downstream act reads
the contract as its source.

## 6 · FINDING 2 — MINOR · the R3 deletion departed from that same practice

The closing synthesis was **deleted** rather than marked superseded. For a rhetorical synthesis
rather than an evidentiary claim that is defensible — a slogan is not a witness, and the sentence
was wrong in a way that would have kept propagating. Recorded for deliberateness, **not for
reversal**, because the programme elsewhere prefers marking to deletion and the difference should be
a choice rather than an accident.

For the record: that sentence was mine. Its deletion is correct. It collapsed the **PROVENANCE
accrues / PRESENT STANDING non-monotonic** split that D9-A §8.2 had itself established, and it
contradicted my own I-9.

## 7 · One consequence the ratifier should hold consciously

**Not an objection.** Post-R5, I-8 governs *conformance at seams that already require an independent
authority*. It can no longer be cited to establish that a **new** surface requires one — that
question is G1/I-19 and remains unevidenced.

Coverage is not lost by the narrowing: the FA-1 purpose-travel violation is caught by **I-10**
(participation authority indexed by consumer), not by I-8. I checked for a gap opened by the
correction and found none.

The narrow I-8 is close to analytic but is not empty: it forbids a specific substitution a system
could otherwise make — omitting an authorization check because confidence in the material is high.
Its force is conformance-checking rather than design-constraining, and that is the correct size for
the evidence.

## 8 · Verdict

```text
INDEPENDENT D9-A PROVENANCE SWEEP        PASS
denominator independently confirmed      12 of 12, identical set
additional hidden instance               NONE FOUND
I-8 narrow form vs D9-C §7.2             PASS — same proposition
I-16 vs D9-C counter-shape               PASS — improved on the original
accounting 16+10+4+1 = 31                PASS — self-consistent across R4→R5
I-33 disposition                         PASS — resolves the strikable question
containment                              PASS — zero non-docs change

FINDING 1  base contract lacks supersession pointers   DOCUMENTATION, not constitutional
FINDING 2  R3 deleted rather than marked                NOTED, no reversal sought

RATIFICATION        ⛔ NOT TAKEN — founder act, not this agent's
IMPLEMENTATION      ⛔ CLOSED
PRODUCTION          ⛔ UNTOUCHED
```

> *The sweep found what it said it found. The one thing it did not sweep is the document doing the
> governing — which now reads as complete while five of its clauses are governed elsewhere.*
