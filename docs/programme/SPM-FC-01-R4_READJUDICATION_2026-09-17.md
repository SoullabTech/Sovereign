# SPM-FC-01-R4 — BOUNDED RE-ADJUDICATION

**R3 predecessor:** `9d0539b3f813aeed947d6fb83b49aefd76c19e3b`

**R3 adversarial return:** `8bc78b9b5`

**R4 candidate:** `ea422fa4d` · correction blob `987e93107e38840df3145a29a1b5f73f2d0aab04`

**Composed constitutional object:**

```text
R3 corrected base blob   a4dabcecd7a43c57ca5432b50921421fba6ce129
R2 overlay blob          f3af4e3de0613f3858a72a674b11e546ec32bd78
R4 overlay blob          987e93107e38840df3145a29a1b5f73f2d0aab04
```

**Date:** 2026-09-17

---

## 0 · RULING

```text
CUSTODY / COMPOSITION                 PASS
ANTI-LAUNDERING                       PASS
SIX-FIELD FORM                        PASS · 4/4 clauses · 24/24 fields
IMPLEMENTATION DELTA                  NONE

I-12                                  PASS
I-14                                  PASS
I-15                                  PASS
I-17                                  PASS

I-12 × I-9 / B6                       PASS
I-14 × B7                             PASS
I-15 × B8 / positive control          PASS
I-17 × B5b / D9-C §7.1                PASS
R3 closing-synthesis deletion         PASS
CLASSIFICATION / COUNT                PASS

SPM-FC-01-R4                           PASS
R4                                     RATIFIABLE
RATIFICATION                           ⛔ NOT TAKEN HERE
IMPLEMENTATION                         CLOSED
```

R4 satisfies the four-clause return. It removes the remaining evidence overclaims without closing
an unresolved D9 question, inventing an implementation, or weakening legitimate member acts.

---

## 1 · CUSTODY / ANTI-LAUNDERING — PASS

R4 is linear over the committed R3 object. The independent review was rebound onto R3 before the
correction was authored, so the record no longer relies on a floating staged predecessor.

No source provenance changed:

- D9 remains read from its separately custodied records at `a5834c94`;
- F5 remains on its own evidence/adjudication chain;
- F5-R1 remains quantitative reconciliation only;
- R2 remains byte-identical to the object already re-adjudicated;
- R3's only base-object change remains deletion of the unsupported closing synthesis;
- R4 adds no new evidence source and claims no new proof.

Repository delta from R3 contains only programme documentation. No implementation locus changed.

---

## 2 · I-12 — PASS

### Corrected law

Withdrawal may remove **present standing or authority, as applicable**, while preserving the
historical fact that the prior state, claim, or act existed. It is not universally classified as a
warrant-side act.

### Why this survives

D9A's founder correction establishes present standing as non-monotonic. `valid_to`,
`withdrawn_by_member`, `'revoked'`, and `'held_lightly'` all carry the historical/present split.
D9-B B6 is decisive against the prior wording: the vector fallback is classified as a
**material-validity failure, not a warrant failure**. F5-A's tombstone specimen independently shows
that withdrawal can destroy current content while retaining the fact of the act.

R4 originally included `participation` among the possible withdrawal axes. The bounded attack found
that participation is independently evidenced as an axis but not established at these withdrawal
specimens. That word was removed before this adjudication. The final law therefore names only the
two axes the evidence actually reaches: present standing and authority.

### Adversarial result

```text
current assertion withdrawn     → historical assertion remains · present standing can end
use/crossing authority revoked   → historical act remains · authority can end
one axis silently substituted    → FAIL
historical record destroyed      → FAIL
```

**I-12: PASS.**

---

## 3 · I-14 — PASS

### Corrected law

System repetition may affect salience or ranking. It does not thereby become member confirmation,
adoption, statement, or standing.

### Why this survives

The numerical inversion remains real inside the measured scorer: system `recall_count` can
contribute about 4.4 times the maximum contribution of `confirmed_by_user`. But D9-B B7 explicitly
narrows the consequence: no path was found by which the increased score becomes member standing.
The result is a **ranking defect, not an authority defect**, on the evidence available.

R4 no longer repeats the base contract's false sentence that retrieval conferring standing is the
"current measured condition." Instead it makes that transition a falsifier whose occurrence would
be new evidence.

### Adversarial result

```text
system repetition ↑   → salience/ranking may change
member confirmation   → unchanged absent member act
member attribution    → unchanged absent member act
member standing       → unchanged on present evidence
```

**I-14: PASS.**

---

## 4 · I-15 — PASS

### Corrected law

Persistence **alone** does not imply adoption. Persistence may be fused with a member's return,
surfacing, or adoption disposition when that disposition is actually part of the same member act.
Material persisted pending a later decision receives no unstated adoption merely by being stored.

### Why this survives

D9-B B8 explicitly rejects `persistence ≠ adoption` as a universal property and refuses to normalize
the two live subsystems:

- Writer's Studio persists proposals pending a separate authorization;
- conversational memory writes `return_preference` at keep time, so the keep gesture itself carries
  the surfacing disposition.

The corrected law preserves both. It therefore passes D9's positive-control requirement: a
sovereignty boundary may not falsely refuse a supported member act merely because two dimensions
were lawfully expressed in one gesture.

### Adversarial result

```text
stored pending later choice        → no adoption inferred
stored with explicit return choice → return disposition may operate
bare persistence treated as choice → FAIL
fused member act refused as invalid→ FAIL
```

**I-15: PASS.**

---

## 5 · I-17 — PASS

### Corrected law

An authorization does not silently expand beyond its **declared scope**. Reading authority therefore
does not prove representation authority merely because the same material is involved. But the
contract does **not** assert that every representation requires a distinct second member act.

### Why this survives

D9-B B4 establishes purpose-bound authority that cannot travel to a different Ask. That earns the
anti-propagation principle. It does not earn a universal two-warrant architecture.

D9-B B5b expressly leaves member-facing representation independently governed **UNRESOLVED**. D9-C
then finds one narrow audience-indexed human representation warrant while preserving the crucial
limits:

```text
MAIA speaking about the member to the member   STILL UNEVIDENCED
MAIA characterizing the member                 STILL UNEVIDENCED
first-person representation                    STILL UNEVIDENCED
```

R4 therefore protects declared scope without closing the MAIA-as-speaker gap by intuition.

### Adversarial result

```text
use B outside declared scope, no new authority  → REFUSE
use B expressly inside declared scope           → MAY PROCEED
contract demands second act solely by category  → FAIL
adjacency silently becomes authority            → FAIL
```

**I-17: PASS.**

---

## 6 · CROSS-CHECKS — PASS

### C1 · I-12 × I-9 × B6

I-9 says standing is not monotonic. Corrected I-12 now gives that non-monotonicity an honest
withdrawal expression without pretending every withdrawal is warrant-side. B6 remains a known
structural defect in enforcement, not a reason to misclassify the axis.

**PASS.**

### C2 · I-14 × B7

The distinction now exactly matches B7: recurrence can alter salience while no current evidence
shows it conferring member standing. The contract no longer inflates a ranking defect into an
observed authority defect.

**PASS.**

### C3 · I-15 × B8 × positive control

The contract now distinguishes **bare persistence** from a persistence gesture that explicitly
carries a downstream disposition. This protects both the Studio's staged-decision model and the
conversational keep-and-return gesture.

No legitimate supported member act is made impossible merely to keep the ontology tidy.

**PASS.**

### C4 · I-17 × B5b × D9-C §7.1

The law prohibits silent scope travel and nothing more. It leaves untouched the still-unanswered
question of MAIA-as-speaker representation and does not turn D9-C's Circles specimen into a general
architecture.

**PASS.**

---

## 7 · R3 CLOSING-SYNTHESIS DELETION — PASS

R3 removed the non-numbered synthesis:

```text
Standing is earned and accumulates. Warrant is granted and is spent.
```

That deletion remains necessary after R4:

- corrected I-12 and I-9 preserve non-monotonic present standing;
- corrected I-17 and R2 I-16 preserve multiple warrant shapes;
- D9-B B3 remains a replay/idempotency case where "nothing is spent";
- D9-B B4 remains a genuine consumable purpose-bound act;
- D9-C remains a relationship/audience warrant whose lifecycle is revocation, not one-use spend.

No replacement slogan is inserted. The plurality of the evidence is allowed to stand.

**PASS.**

---

## 8 · CLASSIFICATION / COUNT — PASS

The final accounting is now:

```text
17 unchanged locally earned laws
10 R2-corrected locally earned laws
 4 R4-corrected locally earned laws
---
31 locally earned D9/F5 laws

 1 declared gap: I-19
 1 imported prior law: I-33
---
33 numbered clauses
```

No clause gains standing merely by numbering. I-19 remains a gap. I-33 remains external to D9/F5
provenance.

---

## 9 · WHAT THIS PASS DOES NOT MEAN

This pass adjudicates the **constitutional contract**, not organism conformance.

It does not assert that current runtime behavior satisfies all 31 local laws. Existing D9/F5
failures and structural possibilities remain exactly where their evidence placed them.

It does not authorize:

```text
SPM runtime or implementation
schema or foreign-key changes
route / middleware / UI changes
erasure repair
migration / backfill
production mutation
```

The original handoff's sequence remains controlling: contract → adversarial adjudication → only
then a separate authority-bearing decision about whether any canonical implementation may open.

---

## 10 · FINAL STANDING

```text
R3 9d0539b3f                         CLOSED AS PREDECESSOR · synthesis deletion retained
R3 ADVERSARIAL REVIEW 8bc78b9b5     CLOSED · RETURN CONDITIONS DEFINED
R4 CORRECTION ea422fa4d              RE-ADJUDICATED · PASS
R4 CONSTITUTIONAL COHERENCE           PASS
R4 PROVENANCE / ANTI-LAUNDERING       PASS
R4                                   RATIFIABLE
RATIFICATION                          ⛔ NOT TAKEN · FOUNDER ACT REQUIRED
IMPLEMENTATION                        CLOSED
```

**NEXT EXACT ACT: founder ratification, rejection, or return of R4.**

No canonical consolidation and no implementation follows before that act.

**STOP.**
