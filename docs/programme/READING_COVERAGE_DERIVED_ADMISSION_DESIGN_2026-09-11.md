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

## 7 · IMPLEMENTED — founder ruling on the fork, 2026-09-11

**⚖️ RULED: REFUSE THE WHOLE OUTPUT (disposition A).**

> **`across-unread-span` may be admitted only when the claim's derived unread span is non-empty.**
> **Not reading-wide coverage. Not prompt instruction. Not model discretion.**

⛔ **Excluded by the same ruling:** silently stripping the tag · substituting another non-conclusion ·
dropping only the claim · weakening the non-empty `doesNotEstablish` invariant.

⭐ **Founder's reasoning on claim-level partial refusal — NOT YET, not never:** *it is proportionate,
but introduces a new partial-admission semantic where some claims of a reading disappear while the
reading survives. That is a real architectural mechanism and needs its own design, provenance and
witness. It should not hitchhike on this repair.*

### 7.1 ⭐ THE DISPOSITION WAS ALREADY WRITTEN INTO THE MODULE

`read.ts`'s own header carried the reasoning before the ruling was made:

> *ONE UNPROVABLE REF REFUSES THE WHOLE RESULT. A result is never returned with the bindable subset
> (F8): a reading whose claims were quietly thinned is a different reading from the one the model
> made, under the same name.*

⭐ **The repair is F8 at the other end** — F8 forbids thinning the claims; this forbids thinning what
a claim says it does not establish. ⚠️ **And the asymmetry that makes this one worse is worth
stating: a dropped ref is detectable downstream; a dropped limitation is not.**

### 7.2 · What landed

| file | change |
|---|---|
| `lib/manuscript/developmentalReader/contract.ts` | `non_conclusion_inapplicable` added to `DevelopmentalReaderRefusal`, and to `AFFIRMATIVE_VIOLATIONS` — truncation removes text, it cannot ADD a limitation the evidence does not license, so a cut-off response carrying an inapplicable tag carried it before it was cut |
| `lib/manuscript/developmentalReader/read.ts` | the check, inside the existing per-claim bind loop; `unreadSpan` imported; the F8 note extended |
| `lib/manuscript/developmentalReader/__tests__/coverageAdmission.test.ts` | **new** — N1–N8 plus the fixture's own premises and the R-1 attribution case · **17 checks** |
| `lib/manuscript/developmentalReading/__tests__/refusalTruth.test.ts` | the new refusal added to the affirmative-violation enumeration |
| `scripts/ws2-07b-reader-gate-a.ts` | fixture re-pointed; **F9b** and **F9c** added |

⛔ **Untouched, and asserted by N6/N7/N8:** `render.ts` · `READER_SYSTEM` · the tool schema ·
`DEVELOPMENTAL_NON_CONCLUSIONS` · `NON_CONCLUSION_MEANING` · `unreadSpan()` itself.

### 7.3 ⭐⭐ THE FINDING THE REPAIR PRODUCED — the defect was in TWO instruments, not in `o8`

**Both test fixtures carried the very untruth the law catches.** Each defined a default claim with
refs `[s0, s1]`, under a scope that reads both at body depth, carrying `across-unread-span`:

```text
lib/manuscript/developmentalReader/__tests__/contract.test.ts   goodClaim()
scripts/ws2-07b-reader-gate-a.ts                                claim()
```

⚠️ **The jest fixture carried a second untruth beside it**: its prose read *"The lantern introduced
in s0 returns in s3 with nothing between"* — a claim spanning s0..s3 whose refs reached only
s0..s1. **A span claim without a spanning ref, disclaiming a span it never covered.**

> ⭐⭐ **So the defect the founder found in `o8` was never only in `o8`. Two independent instruments
> had been asserting the same false limitation, and 233 passing tests did not see it — because
> nothing was checking whether the limitation was TRUE, only whether it was SPELLED correctly.**

⛔ **Both were RE-POINTED, not loosened.** `author-intent` is structurally always applicable and is
now the default; the unread-span tag is exercised where it is lawful, over refs that genuinely span
unread material (`spanningClaim()` / `spanning()`). ⭐ **No assertion was weakened to make the repair
pass** — the standing rule from §24.5 of the prototype record, applied.

### 7.4 · Mutation proof — the instrument can fail, and it locates rather than reacts

| mutation | verdict | which falsifiers |
|---|---|---|
| ⭐ **reading-scope check** (`every section is body`) instead of per-claim | **2 failed** | **N3 only** — and **N1 PASSES**, exactly as the design predicted |
| ⭐ **strip the tag** instead of refusing (the excluded disposition C) | **4 failed** | N1 · N3 |
| ⭐ **delete the tag from the vocabulary** (passes N1 by destroying a true limitation) | **9 failed** | N2 · N3 · N5 · N6 · N7 |
| unmutated | **17 passed · 0 failed** | — |

⭐⭐ **The first row is the one that matters.** The reading-scope impostor passes N1 and fails only
N3, both of N3's cases and nothing else — *the instrument names the defect instead of merely
reacting to it.* ⚠️ **And it confirms the design's warning: N1 alone would have certified the wrong
implementation.**

### 7.5 · Gates

```text
coverageAdmission (N1–N8 + premises + attribution)   17 passed · 0 failed
3 mutations red · unmutated green                    proved
manuscript · writersStudio · disclosure ·
  writers-studio                                     1,668 passed · 1 failed
    ⚠️ the 1 failure is lib/manuscript/ask/bodyGate/__tests__/canonicalFidelity.test.ts,
       a different lane. VERIFIED IDENTICAL on the pre-change tree — pre-existing,
       not caused here, and not repaired here.
ws2-07b-reader-gate-a                                38 checks · 2 failures
    ⚠️ BOTH PRE-EXISTING and verified identical on the pre-change tree
       (before: 36 checks · 2 failures; the 2 added are F9b/F9c, both green).
       Both are STALE INSTRUMENT assertions predating ratified rulings:
         F5  asserts the 60,000 code-point ceiling — raised to 500,000 (founder, 2026-09-07)
         F17 asserts DEVELOPMENTAL-READER-01 — the reader is READER-05
       ⛔ REPORTED, NOT FIXED. Re-pointing them would certify rulings this lane
          was not asked to certify.
ws2-07c / ws2-07d                                    NOT RUN — require a DATABASE_URL
                                                     scratch database; none available here
typecheck                                            229 vs baseline 239 · 0 regressions
check:no-supabase                                    clean
```

⛔ **NOT RUN, and owed before any claim about live behaviour:** a reading against a real model. Every
falsifier above is post-seam and pure. ⭐ *An admission law verified only against fixture blocks is a
claim about the host loop, not about what a reader emits.*

---

## 8 · ⭐⭐ THE METHODOLOGICAL FINDING — preserved by founder ruling, 2026-09-11

> ⭐⭐ **Tests can enforce vocabulary correctness while carrying false examples of the very epistemic
> condition they claim to test.**

**Both instruments passed every check they had, because nothing was checking whether the limitation
was TRUE — only whether it was SPELLED correctly.** 233 tests and a 36-check gate script stood over
two fixtures that each asserted an unread-span limitation across a span with no unread section in it.

⭐ **The `s0..s3` prose with refs reaching only `s1` is the instructive half**, and it is not stale
wording:

```text
claim span   ≠   evidence span
```

> ⭐⭐ **A disclaimer about unread material cannot be trusted merely because the prose sounds
> span-like.** The limitation is a statement about the EVIDENCE, and the evidence is the refs.

⭐ **The law has therefore already paid for itself twice, before any live turn.**

---

## 9 · THE LIVE-MODEL WITNESS — BUILT, ⛔ NOT RUN

**Founder ruling: three witnesses, and the third is not optional.**
Instrument: `scripts/witness/coverage-admission-witness.ts`.

```text
A  FULL COVERAGE · tag emitted · claim's unreadSpan EMPTY
   → EXPECTED: the whole reading refused. Not silently repaired.

B  PARTIAL COVERAGE · tag emitted · claim's unreadSpan NON-EMPTY
   → EXPECTED: reading ADMITTED and the limitation RETAINED
   ⭐ The second half is the half that matters. Without it we have shown
     only that the new law can REJECT.

C  FULL COVERAGE · an unaffected non-conclusion
   → EXPECTED: admitted unchanged — proving full coverage became neither
     blanket permission nor blanket refusal.
```

### 9.1 ⛔ THE PROMPT IS NOT TOUCHED AND NOTHING IS ASKED OF THE MODEL

**The script chooses COVERAGE — a system fact — and reads what comes back.** ⛔ Steering a reading
toward emitting the tag would manufacture the observation the witness exists to find, and the result
would be *a fixture wearing a live model's clothes*.

### 9.2 ⭐ CONSEQUENCE: WITNESS A IS OPPORTUNISTIC AND MAY NOT BE OBTAINABLE

⚠️ **If no full-coverage reading emits the tag, A returns `NOT EXERCISED`** — a first-class result,
never a pass and never a skip; the run exits `3`. ⭐ **The founder's own `o8` shows the emission
occurs. It does not follow that it occurs on demand.**

⭐ **C, by contrast, is nearly automatic and that is a property of the contract, not luck**:
`doesNotEstablish` is required non-empty, so any admitted full-coverage reading necessarily carries
at least one non-conclusion, and at full coverage it cannot be the tag.

### 9.2a 🔴 DEFECT FOUND BY THE FOUNDER'S PRE-RUN CONDITION — emission was being INFERRED

**Founder, 2026-09-11, before the run was spent:** *A must have either access to the pre-admission
model output, or a refusal result that explicitly identifies `across-unread-span` as the violated
condition. It may not infer emission merely because the reading was refused.*

⭐ **The instrument was keying A on the refusal CODE**, `non_conclusion_inapplicable`. That code is
raised in exactly one place today, inside the `across-unread-span` branch, **so the two coincide and
the check would have passed.**

> ⚠️ **But that coincidence is a fact about today's implementation, not a law.** The moment a second
> inapplicable predicate is ruled — and §3 names four candidates — the refusal code would stop
> identifying the tag, and the witness would begin **over-claiming silently, with no test failing.**

⭐ **Repaired before the run**: the refusal's own `detail` names the tag verbatim
(`claims[i] carries "across-unread-span" but spans no unread section`), and A now requires that
string. A fourth verdict was added rather than folded into the others:

```text
FIRED           refused AND the detail names the tag        → emission PROVEN
INDETERMINATE   refused as inapplicable, detail does NOT
                name the tag                                → emission UNPROVEN;
                                                              ⛔ NOT an A pass
NOT EXERCISED   no full-coverage reading emitted the tag
VIOLATED        empty span ADMITTED carrying the tag
```

⭐ **Why this matters beyond the bug: once the law fires, the offending claim never becomes an
admitted result** — the refusal is the only surviving trace of what the model said. **An instrument
that reads that trace loosely is guessing about the very emission it exists to observe.**

### 9.2b ⭐⭐ THE RE-RUN LEDGER — founder ruling

**A and B depend on what a live model happens to emit, so repeated attempts are legitimate.**
⛔ **Reporting only the attempt that worked is not.**

```text
attempt 1  NOT EXERCISED
attempt 2  NOT EXERCISED
attempt 3  EXERCISED · PASS
```

> ⭐ **That preserves the difference between the EXISTENCE of lawful composition and the FREQUENCY of
> the model behaviour that exercises it.** One exercised run in nine is still a pass for A — *and it
> is also a fact about how rarely the condition arises, which a single reported run would erase.*

**Built:** an append-only JSONL ledger (`WITNESS_LEDGER`, default
`docs/programme/witness/coverage-admission-attempts.jsonl`), one line per attempt plus one per
verdict, each stamped with a run id. ⛔ **A ledger that cannot be written stops the run** — an
unrecorded attempt is exactly what the discipline exists to prevent.

⛔ **Forbidden by the same ruling, and none of it is in the script:** changing the prompt to elicit
the tag · rewriting the Work between attempts to encourage it · discarding non-exercised runs.

### 9.2c ⭐⭐ THE ACCEPTANCE HIERARCHY — founder ruling, 2026-09-11

**The three witnesses are NOT equal**, and collapsing them into *"all green"* would let an
**unobtainable negative block a positive that was actually obtained.**

| | | required? |
|---|---|---|
| **B · LOAD-BEARING** | lawful span · tag emitted · reading **admitted** · tag **survives unchanged** | ⭐ **REQUIRED** for live compositional acceptance |
| **C · SCOPE GUARD** | an unrelated lawful non-conclusion survives at full coverage — proving the repair did not become a blanket filter | ⭐ **REQUIRED** |
| **A · OPPORTUNISTIC** | if exercised, must prove emission from the refusal detail and refuse the whole output | ⛔ **NOT required to occur on demand** |

⭐ **Therefore this is a real, acceptable result and not a partial failure:**

```text
A   NOT EXERCISED
B   ADMITTED_AND_RETAINED
C   ADMITTED
→   live-model composition WITNESSED on its load-bearing positive side,
    with A explicitly remaining UNEXERCISED rather than pretending it passed.
    If A later fires naturally, that closes the negative side too.
```

⚠️ **THE CAUTION THAT APPLIES EQUALLY TO B:** choosing partial coverage makes the tag **lawful**; it
does not **force** the model to use it. A `NOT EXERCISED` B is a **re-run, never a repair** —
⛔ no prompt steering, no manuscript surgery, no helping the witness happen.

⛔ **`INDETERMINATE` blocks even though A is optional.** It means a reading was refused as
inapplicable *without* the detail naming the tag — today unreachable. If it ever happens, the code
has moved under the instrument and **the instrument can no longer tell what it is looking at.** That
state is never waved through.

**Exit codes follow the hierarchy:** `0` required sides met, A may remain unexercised · `1` violated
· `3` a required side not exercised, or indeterminate.

### 9.3 · What the instrument does and does not do

```text
READ-ONLY          captureEvidence — one REPEATABLE READ transaction, ownership
                   in the predicate; loadRevisionContent — one SELECT.
                   ⛔ creates nothing · renames nothing · deletes nothing.
                   ⭐ Deliberately unlike the walk-12 fault injection, which was
                     written for a disposable cluster and wedged a live dev
                     database on 2026-09-10.
NO MEMBER PROSE    section counts · code-point totals · claim counts · tag names ·
                   span lengths · refusal names. ⛔ never a sentence of the Work,
                   never a claim's text.
INDEPENDENT SPAN   admitted tagged claims are RE-BOUND and their span re-derived
                   by the witness, so it measures rather than trusting the code
                   under test to report on itself.
```

**Two 2026-09-10 environment defects made structural rather than remembered:** it reads
`DATABASE_URL` itself and never shells out to `psql` (which reads `PG*`), and it **refuses a
whitespace-bearing `ANTHROPIC_API_KEY` before doing anything** — the two-appended-lines defect that
`grep | cut` glued into a 217-char value and that surfaced twice as the single word `unreachable`.

⛔ **Smoke-tested to its refusal boundaries only** (both preflight paths fire, exit 2). **The
witness itself is NOT RUN**: it needs `ANTHROPIC_API_KEY` through the normal environment mechanism,
and ⛔ **no mock, no provider bypass, and no reuse of an agent or session credential.**

---

## 9.4 ⭐⭐ FIRST LIVE RESULT — WITNESS A **FIRED**, EMISSION PROVEN, ATTEMPT 1

**Founder-run 2026-09-11T20:53:11Z · run `56e9375c` · `maia_consciousness` ·
manuscript `19039a86…` · draft `a8c996f6…` rev 5 · 262 sections · 385,948 code points ·
FULL scope 262/262 at body depth.**

```json
{"runId":"56e9375c","at":"2026-09-11T20:53:11.859Z","kind":"attempt","condition":"FULL",
 "lens":"development","attempt":1,"outcome":"refused",
 "refusal":"non_conclusion_inapplicable","detailNamesTag":true,
 "claims":0,"taggedSpans":[],"otherTags":[]}
```

⭐ **A live model, reading the whole Work at full body-depth coverage, emitted
`across-unread-span` on a claim whose derived span was empty — and the host refused the entire
output.** That is the `o8` defect reproduced under the new law, by the law.

⭐⭐ **`detailNamesTag: true` is what makes it a PASS rather than an INDETERMINATE.** The refusal's
own detail names the tag, so emission is **proven from the trace** rather than inferred from the
refusal code. *The repair the founder's pre-run condition forced, twelve hours before the run,
is the reason this line means anything.*

### 9.4.1 ⚠️ THE PREDICTION WAS WRONG, AND THE DIRECTION MATTERS

**Recorded because the design said the opposite:** §9.2 called A *opportunistic* and warned it might
never be obtainable; the pre-run note said *"A is the long shot."* **It fired on the first
full-coverage reading.**

> ⭐ **Frequency, as observed and not more: 1 of 1 full-coverage readings emitted the false
> limitation.** ⛔ **n = 1. That is not a rate.** It establishes that the emission is not rare enough
> to need hunting — nothing beyond that, and the minimum-n discipline forbids more.

### 9.4.2 ⛔ B AND C ARE NOT EXERCISED — THE RUN DID NOT COMPLETE

The PARTIAL condition never ran; no verdict block printed. **Under the ratified acceptance
hierarchy, B and C are REQUIRED and A is not.**

```text
A   FIRED (emission proven)          ⭐ the negative side is closed
B   NOT EXERCISED                    ⛔ REQUIRED — the load-bearing positive side
C   NOT EXERCISED                    ⛔ REQUIRED — the scope guard
→   MODEL/HOST COMPOSITION: NOT witnessed on either required side
```

⚠️ **A firing does not carry B.** Without B the law is shown able to **reject** and nothing more —
the founder's own words, and they hold exactly as written now that A has landed. **The run must be
completed**; the ledger is append-only, so this attempt is preserved and a second run adds to it
rather than replacing it.

---

## 10 · ⛔ STANDING

```text
ACROSS-UNREAD-SPAN LAW       RULED
predicate                    existing unreadSpan(bound, evidence)   ⛔ unchanged
granularity                  per claim

inapplicable tag             REFUSES OUTPUT
strip / rewrite              FORBIDDEN
claim-level partial refusal  NOT AUTHORIZED

other non-conclusions        UNCHANGED
general prerequisite system  NOT AUTHORIZED

implementation               ⭐ LANDED · 17 falsifiers green · 3 mutations red
prompt contract              UNTOUCHED
vocabulary                   UNTOUCHED
HOST LAW                     CLOSED
MODEL/HOST COMPOSITION       UNWITNESSED
witness instrument           ACCEPTED (founder, 2026-09-11) · emission-proof defect repaired
                             before the run · append-only attempt ledger built
live-model witness           RUN, INCOMPLETE (run 56e9375c, 2026-09-11T20:53Z)
  A                          ⭐ FIRED · emission PROVEN (detailNamesTag true) · attempt 1
  B                          ⛔ NOT EXERCISED · LOAD-BEARING · REQUIRED
  C                          ⛔ NOT EXERCISED · scope guard · REQUIRED
append-only ledger           REQUIRED — an unwritable ledger stops the run
mock / bypass                FORBIDDEN
prompt steering              FORBIDDEN
three leftovers              REPORTED, NOT ABSORBED — canonicalFidelity (other lane) ·
                             ws2-07b F5/F17 (stale against later ratified rulings;
                             re-pointing would spend a different acceptance question) ·
                             ws2-07c/07d (no scratch DB; absence of execution stays visible)
other four predicates        ⛔ NOT BROADENED — the narrow repair is justified precisely
                             because unreadSpan() already exists as an exact derived fact
deploy                       HELD
```

> ⭐⭐ **The system must not describe an epistemic condition merely because its vocabulary permits
> the description. The condition must actually obtain.** — founder, 2026-09-11
>
> ⭐⭐ **The host may constrain what becomes knowledge without teaching the model to manufacture the
> condition that proves the constraint works.** — founder, 2026-09-11
> *That separation is exactly why this witness is credible.*
>
> ⭐⭐ **When admission destroys the offending object, the refusal trace becomes evidence. A witness
> must prove what that trace says, not infer what probably produced it.** — founder, 2026-09-11
> *Preserved because it will matter again as more epistemic admission laws are added.*

⛔ **Deploy is not authorized by this record.**
