# COVERAGE-DERIVED ADMISSION OF NON-CONCLUSIONS — design

**Founder ruling 2026-09-11 · ⭐ AUTHORIZED FOR DESIGN · ⛔ REPAIR NOT IMPLEMENTED.**
Lane: `WS2-07B` developmental reader · branch `claude/s3-implementation` · no code changed by this
record.

> ⭐⭐ **Do not state an epistemic limitation whose prerequisite condition is known not to exist.**

---

## 1 · The ruling, recorded

```text
o8 observation                     RETAINED
across-unread-span limitation      REFUSED / INAPPLICABLE
coverage-derived admission law     AUTHORIZED FOR DESIGN
repair                             NOT YET IMPLEMENTED
```

**The founder's law, verbatim:**

```text
model proposes non-conclusion
        ↓
system checks applicable epistemic condition
        ↓
applicable      → admit
inapplicable    → refuse that non-conclusion
```

⛔ **Not rewrite it. Not substitute another disclaimer.**

⭐ **And the reason it is a runtime law rather than a prompt instruction:** *coverage is system fact,
not interpretation.* The model should not be choosing this at all when the runtime already knows.

### 1.1 · The family this belongs to

```text
Repair 3   (2026-09-10)  do not normalize ABSENCE into UNCERTAINTY
O-3        (ratified)    an unknown cause is named as unknown
THIS       (2026-09-11)  do not state a LIMITATION whose PREREQUISITE is known absent
```

⭐ **All three are the same discipline at different seams:** the system must not manufacture an
epistemic posture the evidence does not support — **in either direction.** O-3 forbids hiding a real
unknown; this forbids asserting a fictional one. ⚠️ *An over-cautious falsehood is still a falsehood
about the conditions of the reading.*

---

## 2 · ⭐⭐ THE LOAD-BEARING FINDING — the predicate already exists, exact, and is already tested

⛔ **No new computation is required for `across-unread-span`.**

`lib/manuscript/development/bind.ts:171` — `unreadSpan(bound, evidence)` returns *the sections an
observation spans but did not read at body depth (INV-9)*. Its own header states the discipline this
design depends on:

> *Derived, never stored: storing it would let it disagree with the coverage it summarises.*

```text
empty array   → no unread interval exists within this claim's span
non-empty     → an unread interval exists, and it is named
```

**Current callers:** `lib/manuscript/development/__tests__/bind.test.ts` (3 cases) and
`scripts/ws2-07a-evidence-witness.ts`. ⛔ **Nothing in the reader pipeline calls it.** The runtime
computes the fact in tests and throws it away in production.

### 2.1 ⭐ IT IS PER-CLAIM, WHICH IS STRICTLY STRONGER THAN THE COVERAGE TEST

The ruling was stated at reading scope — *coverage = 262/262 in full → inadmissible.* `unreadSpan`
answers at **claim** scope, and subsumes it:

```text
coverage 262/262 body        → EVERY claim's span is empty  → the ruling's case, exactly
coverage partial, claim
  wholly inside read material → that claim's span is empty   → ⭐ also inadmissible
coverage partial, claim
  spanning a position-only
  section                     → that claim's span is NON-EMPTY, and names it → ADMIT
```

⭐ **The per-claim test yields the founder's ruling as a special case and is correct in the partial
case the reading-scope test would get wrong in both directions** — it would wrongly admit the
disclaimer on a claim that spans only read material, and could not distinguish which claim earned it.

⛔ **Recommendation, stated once and not repeated: the check is per claim.** The reading-scope form
is available and worse.

---

## 3 · ⚠️ THE GENERAL LAW DOES NOT GENERALIZE MECHANICALLY — the census

The law is stated for all non-conclusions. **Applying it to all eight requires an applicability
predicate for each, and the eight are not alike.** Audited against
`lib/manuscript/developmentalReader/contract.ts:92-121`:

| non-conclusion | prerequisite condition | decidable from runtime fact? |
|---|---|---|
| **`across-unread-span`** | an unread interval exists in the claim's span | ⭐ **YES — `unreadSpan()`, exact, existing, tested** |
| `outside-coverage` | material relevant to the claim was not read | ⚠️ **needs a ruling on what "coverage" is bounded by** — at 262/262 of *this Work*, material outside the Work is still unread |
| `authored-structure-relation` | frozen member-authored structure was **not** supplied | ⚠️ mechanically visible (`readState.structureContext === undefined`) but the wording is a *conditional* — supplying structure makes it vacuous, not false |
| `whole-work-pattern` | the evidence is local or partial | 🔴 **NO — this is an epistemic ruling.** Refusing it at full coverage would mean MAIA *may* assert whole-Work patterns there |
| `chronology` | position-only inference **or** incomplete coverage | ⚠️ compound; the first disjunct is not a runtime fact |
| `author-intent` | — | ⭐ **always applicable**, never refusable |
| `reader-effect` | — | ⭐ **always applicable**, never refusable |
| `editorial-consequence` | — | ⭐ **always applicable**, never refusable |

> ⭐⭐ **Exactly one of the eight has a mechanically decidable prerequisite that the runtime already
> computes. Three are structurally always-applicable. Four need epistemic rulings, not code.**

⛔ **And inventing predicates for the other four would be the very error this law prohibits**:
asserting an applicability condition on grounds that do not exist. ⚠️ *A law against fictional
limitations, implemented by fictional predicates, would falsify itself in its own implementation.*

⭐ **Therefore the narrow repair is available now and the general law is not.** The narrow repair
needs no ruling beyond the one given; the general form needs four.

---

## 4 · THE SEAM — where the check goes

**Pipeline** (`lib/manuscript/developmentalReader/read.ts:4`):

```text
validate → render → runStructured → parse → bind → Result
                                              ↑
                                     ⭐ HERE — the check requires BoundEvidence,
                                       which exists only after this step
```

`read.ts:93-99` already loops per claim and already holds `bound.value` and `request.evidence`. The
check is one call on values in hand:

```text
for each claim i:
    bound = bindEvidence(c.refs, request.evidence)
    ⛔ existing: unbindable → refuse('claim_unbindable', …, i)
    ⭐ new:      if c.doesNotEstablish includes 'across-unread-span'
                 and unreadSpan(bound.value, request.evidence).length === 0
                 → the non-conclusion is INAPPLICABLE
```

⛔ **No new data flow. No new state. No prompt change.**

### 4.1 ⛔ THE PROMPT MUST NOT BE TAUGHT THIS

⭐ **The founder's ruling is specifically that this is not the model's choice.** So
`render.ts` must **not** gain a line like *"do not use across-unread-span when coverage is full."*

⚠️ **That would look like a cheaper fix and would be the wrong one in two ways:** it moves a system
fact back into interpretation, and it is unfalsifiable — a model that complies and a model that
happens not to emit the tag are indistinguishable. **The runtime check is visible in tests and logs;
a prompt instruction is visible nowhere.**

⛔ **Also not authorized: touching the `DEVELOPMENTAL_NON_CONCLUSIONS` vocabulary or the
`NON_CONCLUSION_MEANING` wording.** The tag is not wrong; its application was.

---

## 5 · 🔴 THE ONE REAL FORK — what "refuse that non-conclusion" does to the output

⚠️ **`doesNotEstablish` is required non-empty** (`parse.ts:109`, refusal `non_conclusion_missing`).
So if `across-unread-span` is a claim's **only** non-conclusion and it is refused, the claim has
none. **The ruling says refuse the non-conclusion; it does not say what becomes of the claim.**

**Three dispositions. ⛔ Not chosen here.**

```text
A · REFUSE THE OUTPUT
    new refusal `non_conclusion_inapplicable`, symmetric with the existing
    `non_conclusion_unknown`; names the claim index and the tag; the reading
    is re-commissioned.
    ⭐ FOR   it is what the codebase already does everywhere. `foreign_field`
             refuses rather than drops; harness identity keys are "refused
             rather than ignored" because ⭐ a dropped key is invisible and a
             refused key is visible in tests and logs. Dropping a tag is the
             system EDITING MAIA's epistemic statement — the "rewrite it" the
             ruling forbids.
    ⛔ COST  a sound observation is lost to one over-cautious tag, and the
             whole reading is re-run.

B · REFUSE THE CLAIM
    drop that claim, keep the rest, record the refusal against its index.
    ⭐ FOR   proportionate; the defect is claim-local and so is the loss.
    ⛔ COST  NEW MACHINERY. Every refusal in this pipeline currently aborts
             the whole result; claim-level partial admission does not exist
             and would be a second result shape to reason about.

C · REFUSE THE TAG, KEEP THE CLAIM
    strip the tag; admit the claim if other non-conclusions remain.
    ⛔ AGAINST  this is the system silently editing the model's stated
             epistemic position. It is invisible downstream, and it is the
             shape the ruling named and excluded.
```

⚠️ **A and B differ only in blast radius; C differs in kind.** ⭐ **The existing discipline points at
A, and A needs no new machinery.** ⛔ **The disposition is the founder's, not this design's.**

### 5.1 ⚠️ A CONSEQUENCE THAT MUST NOT BE MISSTATED

**Under A, the forward law would NOT have produced the founder's `o8` disposition.** It would have
**refused the whole output** and required a re-read. *"Observation retained, limitation refused"* is
an **adjudication of an already-emitted reading**, which only a person can perform.

> ⭐ **The forward law prevents such a reading from being emitted. It does not reproduce the
> after-the-fact repair, and this design does not claim it would.**

⛔ **Under B it would refuse the claim carrying `o8`, which is also not "observation retained".**
⭐ **Only C would retain it — and C is the disposition the ruling excludes.** ⚠️ **Named plainly
because a design that quietly implies otherwise would be selling the founder his own past ruling
back as a future guarantee.**

---

## 6 · FALSIFIERS — predeclared, before any implementation

⭐ **Written now so the instrument cannot be shaped by what the implementation turns out to do.**

```text
N1  full coverage · claim spans read material · tag present
    → INADMISSIBLE. The disposition (A/B/C) fires.

N2  partial coverage · claim's span contains a position-only section · tag present
    → ADMITTED, unchanged. ⭐ THE ANTI-OVERREACH FALSIFIER: a repair that
      refuses the tag whenever global coverage looks high FAILS N2.

N3  partial coverage · claim wholly inside read material · tag present
    → INADMISSIBLE. ⭐ Proves the check is PER CLAIM, not per reading.
      A reading-scope implementation passes N1 and FAILS N3.

N4  tag absent · any coverage
    → untouched. No tag is ever ADDED by this law.

N5  the other seven non-conclusions · any coverage
    → untouched, including at 262/262. ⭐ Proves the narrow scope held and
      that no predicate was invented for `whole-work-pattern` or
      `outside-coverage`.

N6  render.ts / the prompt contract is BYTE-IDENTICAL
    → the model was not taught to self-censor. ⛔ promptContractHash() must
      not move.

N7  DEVELOPMENTAL_NON_CONCLUSIONS and NON_CONCLUSION_MEANING are unchanged
    → the vocabulary was not edited to make the defect unrepresentable.

N8  unreadSpan() itself is unchanged
    → the existing predicate was WIRED, not rewritten to suit its new caller.
      ⭐ A repair that edits the oracle to make the check pass has tested
        nothing.
```

⭐ **N2 and N3 are the pair that matters.** N1 alone is passed by a coverage-scope implementation, by
a prompt instruction, and by deleting the tag from the vocabulary. **N2 + N3 + N6 + N7 + N8 are
passed only by the actual repair.**

---

## 7 · ⛔ STANDING

```text
ruling                              RECORDED (founder, 2026-09-11)
predicate                           EXISTS — unreadSpan(), bind.ts:171, tested, UNCALLED in the pipeline
seam                                IDENTIFIED — read.ts:93-99, inside the existing bind loop
general law across all eight        ⛔ NOT MECHANIZABLE — 1 decidable · 3 always-applicable ·
                                    4 need epistemic rulings
disposition on refusal (A/B/C)      ⛔ FOUNDER'S, NOT CHOSEN HERE
falsifiers                          PREDECLARED, unrun
code                                UNCHANGED — no repair implemented
prompt contract                     UNTOUCHED
vocabulary                          UNTOUCHED
deploy                              NOT AUTHORIZED
```

⛔ **This record authorizes no code.** The repair opens on a disposition ruling for §5.
