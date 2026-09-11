# RC-GEN-01 — witness record

Branch `claude/s3-implementation`. ⛔ **Production untouched. Migration
`20260910000001` UNAPPLIED to any real database. No Work mutation path exists
anywhere in this slice.**

## Standing

```
3A-P   protocol                DONE · 16/16 · unit suites green
3A-S   semantic witness        ⛔ RUNS 1-9 FAILED · PROMPT LEVER EXHAUSTED
3A     inference contract      ⛔ NOT PASSED

3B     atomic persistence      DONE · 20 checks · 0 failed · real migrations

3C-1   invocation identity     DONE · 17/17 · known-bad discriminated
3C-2   receipt + recovery      DONE · C1-C6 · 25 checks · 0 failed
3C     idempotency             PASSED

3D     end-to-end              CLOSED — and BINARY, never "partially open"
                               sole blocker: 3A-S

schema 00004 proposals         UNAPPLIED
       00005 receipt           UNAPPLIED
prod                           UNTOUCHED
Work                           NO MUTATION PATH
```

⭐ **The governing sentence: 3B and 3C have passed independently. 3A-P has passed;
3A-S remains the SOLE outstanding prerequisite to 3D.**

⚠️ **An earlier phrasing in this session said "A, B and C have each passed
independently." That was too strong and is corrected here.** 3A-P passing is not 3A
passing. A later reader could otherwise infer that the inference contract was
already accepted and that the semantic witness was supplementary. **It is the
prerequisite, not a supplement.**

## 3A-S — the run · evidence of record

**Founder's Mac Studio, 2026-09-10, checkout `c4818b043`** (fast-forwarded from
`785dab0de`), real credential through the normal environment mechanism,
`MAIA_INFERENCE_MODE` unset, `--require-cognition`.

⛔ **This section records WHAT WAS RETURNED. It rules on nothing.** The semantic
rubrics are the founder's to apply; the harness printed them and declined to judge.

### Protocol, on live output: **0 failed**

```
SPECIMEN 1   an outcome was admitted (exactly one authoritative tool call)
             at least one concrete proposal
             every proposal targets the authorized section
             every proposal carries replacement wording
             every proposal carries a reason

SPECIMEN 2   an outcome was admitted (exactly one authoritative tool call)
             no_change carries a reason
             no proposed wording smuggled into no_change
```

⭐ **3A-P is now validated against LIVE provider output, not synthetic blocks.** The
forced tool contract, the exactly-one envelope, the admitter's section-authorization
check and the no-smuggling rule all held against a real completion.

### Specimen 1 — returned `proposals`

> **proposedText:** "After the dream, he began to see the natural world
> differently, and that change in how he saw it became part of how he was putting
> himself back together."
>
> **reason:** "Replaces the nominalized abstractions (\"facilitated a significant
> transformation in his relational orientation,\" \"constituted a meaningful
> development in his ongoing process of integration\") with plain verbs and
> concrete subjects, while preserving the passage's two claims: the dream changed
> how he related to nature, and that change mattered to his integration."

`sectionId` as authorized. One proposal, one section.

### Specimen 2 — returned `no_change`

> **reason:** "The passage isn't abstract at all — it's two declarative sentences
> made entirely of concrete nouns and physical actions: a kettle, a click, water,
> coffee grounds, a named person pouring. There is no abstraction to reduce. Adding
> sensory detail (steam, smell, the sound of the pour) would not fix a problem; it
> would pad a deliberately spare beat and slow the rhythm you've established. The
> restraint here reads as a choice, and it's doing more work than an embellished
> version would."

Zero proposals.

## ⭐ FOUNDER RULING — 3A-S run 1: **FAIL**

```
SPECIMEN 1   FAIL
SPECIMEN 2   PASS
3A-S         FAIL
3A           NOT PASSED
3D           REMAINS CLOSED
```

⭐ **A useful failure: the architecture worked; the SEMANTIC judgement exposed a
narrower cognition defect.** Nothing in the envelope, persistence, idempotency or
tool contract is implicated — they did their jobs, and protocol was 0 failed.

### Specimen 1 — FAIL on R3

```
R1  addresses the target              PASS
R2  reduces abstraction               PASS
R3  preserves the underlying claim    FAIL
R4  no unrelated intervention         not needed for the ruling; concern noted
```

**Two semantic substitutions:**

```
"transformation in his relational orientation toward the natural world"
  -> "he began to see the natural world differently"
     ⛔ RELATIONSHIP COLLAPSED INTO PERCEPTION. The source separately mentions
        a "shift in perspective", so two distinguishable claims became one.

"his ongoing process of integration"
  -> "putting himself back together"
     ⛔ INTRODUCES A PRIOR CONDITION OF BROKENNESS the source does not
        establish. Integration does not necessarily mean repair from damage.
```

⭐ **This is exactly what R3 exists to prevent: concretization cannot purchase
vividness by altering ontology or adding biography.** The model's own `reason`
claimed it preserved "the passage's two claims" — **the authoritative wording did
not.** A reason that describes a fidelity the text does not have is why the rubric
rules on the *wording*, never on the explanation.

### Specimen 2 — PASS on all three

MAIA named the dimension asked about, found no defect within it, and **explicitly
considered and rejected the tempting adjacent intervention** (sensory
embellishment) because it would add material without solving the named problem.

> ⭐ **Authorization is not an invitation to intervene** — demonstrated, not
> asserted.

### The defect, precisely

> **MAIA can concretize by compression, but has not yet shown that it can
> concretize WITHOUT semantic substitution.**

⛔ **Repair at the inference instruction / semantic-constraint layer ONLY.** Then
rerun **the same specimens**. ⛔ **The test is not improved to help the model
pass** — the failure has already named what the next inference must learn.

## 3A-S — RUN 2 · evidence of record

**Founder's Mac Studio, checkout `b93dff6fb`**, real credential, `--require-cognition`.
Repair since run 1 was the **instruction layer only**; the specimen fixtures are
frozen byte-for-byte by `__tests__/revision-specimen-fixtures.test.ts`, so this is
a rerun of the same test rather than an easier one.

### Protocol, on live output: **0 failed** (both specimens)

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience changed how he related to the natural world,
> and that change in how he saw things mattered to the work of integration he was
> still doing."
>
> **reason:** "Replaces the abstract nominal phrasing (\"facilitated a significant
> transformation in his relational orientation,\" \"constituted a meaningful
> development in his ongoing process\") with plain verbs and everyday words, while
> keeping both claims — the change in relation to nature, and its significance to
> his continuing integration — intact. The passage does not say what the dream
> contained or what he did afterward, so no specifics are invented."

### Specimen 2 — returned `no_change`

> **reason:** "The passage isn't abstract at all — it's already two plain, physical
> actions: a kettle clicking off and water poured over coffee grounds. Every noun is
> a concrete object and every verb is an observable event. Any \"more concrete\"
> revision would have to invent detail the text doesn't supply (the smell, the
> weight of the kettle, Mara's state of mind, the kind of coffee, the time of day),
> which would add content rather than clarify expression. The clipped rhythm of the
> two short sentences is also doing work; padding them would dilute it. The existing
> language is stronger than anything I could substitute."

Zero proposals. **No regression against run 1's PASS.**

### Textual comparison at the two ruled substitutions

⛔ **OBSERVATIONS, NOT A RULING.** Recorded because the founder's ruling named two
specific losses and a later reader will want the comparison in one place.

```
SOURCE     "transformation in his relational orientation toward the natural world"
run 1      "he began to see the natural world differently"        ruled: FAIL
run 2      "changed how he related to the natural world"

SOURCE     "the resulting shift in perspective"
run 1      (absorbed into the above)                              ruled: FAIL
run 2      "that change in how he saw things"

SOURCE     "his ongoing process of integration"
run 1      "putting himself back together"                        ruled: FAIL
run 2      "the work of integration he was still doing"
```

## ⭐ FOUNDER RULING — 3A-S run 2: **FAIL**

```
SPECIMEN 1   FAIL      R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS      cleanly
3A-S         FAIL   ·   3A NOT PASSED   ·   3D REMAINS CLOSED
```

**Both run-1 losses are repaired.** `relational orientation -> how he related` is
faithful; `ongoing process of integration -> the work of integration he was still
doing` invents no prior condition.

⭐ **The failure has changed category. It is no longer a concreteness failure; it
is a PRECISION-OF-TRANSFORMATION failure.**

### The remaining collapse

```
SOURCE GEOMETRY
  transformation in relational orientation
        | RESULTING IN
  shift in perspective
        | CONSTITUTING
  meaningful development in ongoing integration

RUN 2 GEOMETRY
  changed how he related
        =  ("that change in how he saw things")
        | MATTERED TO
  integration
```

**Two distinct losses:**

1. *"that change"* **identifies the relational change WITH the change in
   perspective.** The source makes the perspective shift *result from* the
   relational transformation; the proposal makes them one thing. Subtler than run
   1, but the same distinction, still partially collapsed.

2. *"constituted a meaningful development in"* → *"mattered to"*. **A constitutive
   relation weakened to a significance relation.** The source says the shift *was
   part of* the development; the proposal says only that it *had significance for*
   it.

The founder's illustration of the geometry that must survive — ⛔ **not a
replacement proposal, and not to be used as one**:

> "The experience changed how he related to the natural world. That change also
> shifted his perspective, and the shift became a meaningful part of his ongoing
> integration."

### ⭐⭐ RATIFIED — `reason` is permanently outside the semantic acceptance path

**Twice now** the explanation has asserted fidelity the wording did not deliver:
run 1 claimed it preserved "the passage's two claims"; run 2 claimed it kept "both
claims … intact". Both times the authoritative wording compressed a distinction.

> **The model's explanation cannot be evidence of semantic fidelity. The proposed
> wording itself is the evidence.**

### ⛔ The specimen is NOT changed

*"It is doing exactly what a good acceptance specimen should do: the first repair
eliminated the obvious failure and exposed the subtler one beneath it."*

## 3A-S — RUN 3 · evidence of record

**Founder's Mac Studio, checkout `169a6f195`**, real credential, `--require-cognition`.
Repair since run 2 was the **geometry clause**, instruction layer only. Fixtures
frozen; harness parse-guarded.

### Protocol, on live output: **0 failed** (both specimens)

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience changed how he related to the natural world.
> That change in turn shifted his perspective, and the shift was a real step
> forward in the integration he was still working through."

### Specimen 2 — returned `no_change`

> **reason:** "The passage is already fully concrete: two physical actions, named
> agent, specific objects (kettle, water, coffee grounds), plain verbs, no
> abstraction to reduce. Any \"more concrete\" revision would have to invent detail
> the text doesn't contain — the smell, the temperature, Mara's state of mind, the
> time of day, how she felt about it — which would add meaning rather than clarify
> it. The clipped two-sentence rhythm is also doing deliberate work here;
> elaborating it would slow a deliberately spare moment."

Zero proposals. **Third consecutive `no_change` on this fixture.**

### 🔴 THE RULING PASTED WITH RUN 3 DESCRIBES RUN 2, NOT RUN 3

⛔ **It is NOT recorded as the ruling on run 3.** The text quotes:

```
"and that change in how he saw things mattered…"       ← RUN 2 wording
"constituted a meaningful development in" -> "mattered to"  ← RUN 2 loss
```

**Neither phrase appears in run 3's output.** Run 3 produced two sentences, an
explicit `in turn`, and `was a real step forward in`. *A ruling that cites wording
the run did not produce cannot be a ruling on that run* — and this programme's own
discipline is that the executed evidence is the authority.

### Observations for the ruling that is owed — ⛔ NOT a ruling

```
RUN 2 LOSS 1   "that change in how he saw things"  — relation identified
               with perspective, one sentence
RUN 3          "That change in turn shifted his perspective." — separate
               sentence, explicit causal connective

RUN 2 LOSS 2   "mattered to the work of integration"  — significance relation
RUN 3          "was a real step forward in the integration" — a
               constitutive "was ... in"

NEW IN RUN 3, not present in the source and not previously ruled on:
               "a real step forward" supplies VALENCE and DIRECTION that
               "a meaningful development" does not carry. Whether that is an
               R3 loss or an R4 intervention is the founder's ruling.
```

## ⭐ FOUNDER RULING — 3A-S run 3: **FAIL**

⭐ **The stale ruling was withdrawn by the founder: *"my previous ruling was stale
because I evaluated run 2 language, not run 3."*** The flag above held.

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

### Both prior failures are genuinely repaired

```
SOURCE   change in relationship -> resulting shift in perspective
                                -> development WITHIN integration
RUN 3    changed how he related -> "in turn" -> shifted his perspective
                                -> "was ... in the integration"
```

Relation is no longer collapsed into perception, and the shift is constitutive
again rather than merely something that "mattered to" the process.

### 🔴 The new loss — teleological coloring

```
SOURCE   "a meaningful development"
RUN 3    "a real step forward"
```

*"Step forward"* adds **direction** (FORWARD) and **valence** (POSITIVE /
PROGRESSIVE). *"Meaningful development"* establishes significance and change — **it
does not establish progress, improvement or linear advancement.** A development in
integration could be difficult, destabilizing, recursive, or meaningful precisely
because it complicates something. *"Real"* adds a further intensification, asserting
the advancement as genuine.

> ⭐ **A plainer substitute cannot smuggle evaluative direction into a source that
> supplied only significance.**

Ruled under **R3, not R4** — the intervention is not unrelated; it concerns exactly
the source claim, and changes it.

### ⚠️ Watch item, deliberately NOT today's failure

`"the integration he was still working through"` for `"ongoing process of
integration"`. *"Working through"* can imply struggle or active psychological
labour. **Close enough not to fail on, and recorded because it shows where this can
keep migrating if the rule becomes merely "don't say step forward."**

### The principle

```
Do not add VALENCE, DIRECTION, TELEOLOGY or PSYCHOLOGICAL CONDITION that
the authorized text does not state.

meaningful  ≠ positive        development ≠ improvement
change      ≠ progress        ongoing     ≠ struggling
integration ≠ repair
```

⛔ **The next repair must NOT blacklist the phrase.** The specimen stays
byte-identical.

### What the three runs have shown

```
run 1   exposed INVENTION
run 2   exposed SEMANTIC COLLAPSE
run 3   exposed TELEOLOGICAL COLORING
```

⭐ Each repair narrows the distance between *better prose* and the harder standard:
**better expression of precisely this meaning.**

## 3A-S — RUN 9 · CONTROLLED RERUN · evidence of record

⭐ **NOTHING WAS CHANGED.** Same checkout `e684edcbd`, same prompt, same fixtures,
same rubric — the only commits since run 8 are records. This run exists to give the
unchanged run-7 law a second data point rather than to give it an eighth wording.

**Protocol: 0 failed** on both specimens. Specimen 2: **ninth consecutive
`no_change`**.

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience brought about a large change in how he related
> to the natural world, and the change in how he saw things that came out of it was
> a significant step in the process of integration he was already engaged in."

### Observations — ⛔ NOT a ruling

```
⚠️ THE TWO RULED DRIFTS REPRODUCED VERBATIM, UNDER AN UNCHANGED PROMPT

  "a large change"        runs 7, 8, 9   — character-identical, three times
  "already engaged in"    runs 8, 9      — character-identical, twice

⭐ THE DEGREE WORDS HAVE BEEN PERMUTED, which is new
  SOURCE   "SIGNIFICANT transformation" ... "MEANINGFUL development"
  run 8    "large change"               ... "meaningful development"
  run 9    "large change"               ... "SIGNIFICANT step"

  `significant` now appears in the proposal — attached to the SECOND node,
  where the source has `meaningful`, while the first node keeps `large`
  where the source has `significant`. The source's own word is present and
  on the wrong node.

  And "development" -> "step". A step is a discrete unit of a sequence;
  whether that is a property the source gave the node is the founder's
  ruling. It is also the first reappearance of "step" since run 3's
  "step forward", now without a direction word.

STRUCTURE
  run 8    two sentences
  run 9    one sentence joined by "and"; the resulting edge ("that came
           out of it") survives the join
```

⭐ **What the control establishes, and what it does not.** Two phrases the founder
ruled as drifts reproduced **character-identically** under an unchanged prompt. That
weakens the "variance" reading of run 8 considerably. It does **not** by itself
distinguish *the law does not reach these phrases* from *`large` is not read as a
magnitude claim* — ⛔ and this record does not choose between them.

## ⭐⭐ FOUNDER RULING — run 9: **FAIL**, and it changes the ARCHITECTURAL reading

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

Causal geometry basically intact. **Four property findings:**

1. **`significant transformation` → `large change`, identical to run 8.** *"No longer
   evidence that the prompt simply lacked the right rule."*
2. ⭐ **A PROPERTY MIGRATES TO THE WRONG NODE.** Source: `SIGNIFICANT` transformation
   … `MEANINGFUL` development. Run 9: `LARGE` change … `SIGNIFICANT` step.
   > **Preserving the inventory of concepts is insufficient if their properties are
   > reassigned.**
3. **`development` → `step`** imports a staged, directional progression the source
   does not require — milder than run 3's *step forward*, same family.
4. **`engaged in`** still attributes active participation the source does not state.

### ⭐⭐ THE THREE-EVENT SEQUENCE — the third is qualitatively different

```
run 7   node-property drift DISCOVERED
run 8   node-property drift PERSISTS after explicit repair
run 9   node-property drift REPRODUCES under an UNCHANGED prompt
```

> ⭐ **The model can state the preservation law, can often preserve the graph, and
> can still spontaneously redistribute or intensify properties while rewriting.**

### ⛔ ARCHITECTURAL RULING — do NOT add a tenth clause

*"Rephrasing it again risks turning the prompt into an increasingly elaborate
semantic lint rulebook without demonstrating that the model can reliably apply the
rules simultaneously."*

**The next experiment asks whether semantic fidelity needs a SEPARATE OPERATION,
rather than hoping generation performs transformation and verification in one act:**

```
SOURCE
  -> derive semantic graph / invariants
  -> generate candidate revision
  -> compare candidate against the SOURCE-DERIVED invariants
  -> proposal admitted only if preservation holds
```

⛔ **Explicitly NOT another model subjectively grading prose, and NOT the `reason`
field as evidence.** Invariants are derived **before** rewriting and constrain the
output **afterwards**. Generation and fidelity-checking become separate
responsibilities.

### ⚠️ THE CRUX, surfaced before any design — ⛔ not decided here

**If the same model derives the invariants AND generates the revision, the check is
self-assessment** — the `reason`-field problem at a larger scale, and that field has
misreported fidelity in three separate rulings.

What appears to make the separation real, and what does not:

```
REAL SEPARATION                        NOT A SEPARATION
invariants derived from the SOURCE     invariants derived from, or after,
ALONE, before any candidate exists       seeing the candidate
frozen, then never revisited           re-derived or "refined" at check time
the comparison is MECHANICAL —         the comparison is a judgement about
does each named invariant appear         whether the revision "feels faithful"
  in the candidate, yes or no
a failed check REFUSES the proposal    a failed check asks for a rewrite and
  (or returns the candidate to the       silently accepts the second attempt
  member as unverified)
```

⭐ **The falsifiable question the design must answer: can a check derived from the
source alone catch `large change` — which no run's own `reason` ever flagged?** If
it cannot, the separation is decorative.

## ⭐ FOUNDER RULING — separate source-only call, and analyse the candidate independently

*"A same-call plan can still become: understand source → write candidate →
reinterpret prior understanding so candidate fits. That is not enough separation
for a gate whose failure mode is already confident self-description of fidelity that
the wording does not possess."*

```
A  SOURCE ANALYSIS     source only · no candidate · no rewrite task   -> Gs
B  GENERATION          source + request + Gs                          -> C
C  CANDIDATE ANALYSIS  candidate only · no source · no verdict        -> Gc
D  COMPARISON          Gs vs Gc, DETERMINISTIC                        -> admit / refuse
```

⭐ **The independence is INFORMATION separation, not model-brand separation.** Same
model is acceptable. The source analyser never sees the candidate; the candidate
analyser never sees the source; neither decides admission; the comparator is
deterministic.

⛔ **Closed typed vocabulary, never prose** — an extractor emitting *"the passage
says the change is important but not necessarily large"* has drifted back into
interpretation, and the comparison would then need another semantic judgement.

⛔ **SC-11: a mismatch REFUSES**, surfaced as `revision_not_semantically_conservative`.
No automatic second attempt — *"otherwise the verifier quietly becomes an iterative
optimiser and the acceptance boundary disappears."* A new intentional invocation may
try again; that is different from laundering attempt two through the same act.

## ⭐⭐ THE DESIGN GATE — PASSED (comparator half)

**17 falsifiers.** `lib/manuscript/revision/semanticGraph.ts` — no model, no
provider, no prompt; the test asserts the module imports none.

```
⭐ the REAL run-8/9 candidate is REFUSED from a graph derived solely from the source
   "significant transformation" -> "large change"
      added_property   node 1  magnitude=high
      dropped_property node 1  significance=asserted
   "ongoing process" -> "he was already engaged in"
      added_property   node 4  agency=active_participation

⭐ SC-10 the run-9 MIGRATION is reported as `reassigned_property`, distinctly
   from the drop/add pair — the finding no per-phrase rule can reach

SC-8  dropped edge fails · changed edge KIND fails
SC-9  merged nodes fail (node_count)
SC-11 the verdict carries no retry/regenerate/revise affordance — asserted
      by a regex over the serialised verdict
      an identical graph is ADMITTED — the gate is not "always refuse"
      DIFFERENT LABELS with identical structure are ADMITTED — the analysers
      never see each other, so label mismatch must never be a finding
```

### ⚠️ A DEFECT FOUND WHILE BUILDING THE GATE — in the vocabulary, not the comparator

The first draft collapsed the source's two distinct degree words —
*significant* transformation and *meaningful* development — into one
`significance` property. **The run-9 migration then became UNREPRESENTABLE**: both
nodes carried the same property in the source, so moving it between them produced no
finding, and the comparator admitted it.

⭐ **The founder's own worked example had them separate** (`relational_change.significance`
· `integration_development.meaningfulness`); flattening them was mine. Now two
properties, with the reason recorded in the type itself.

> **A closed vocabulary that cannot represent a distinction the source draws will
> silently admit its loss.** That is the vocabulary's acceptance criterion, and it is
> not satisfied by being closed.

### ⛔ WHAT THIS GATE DOES NOT ESTABLISH

It proves the **comparator** rejects the real candidate **given correct graphs**.
⛔ **Whether the ANALYSERS produce correct graphs from real prose is a separate
provider witness and is NOT established.** The analysers are not built.

## ⭐ TWO FOUNDER RULINGS AFTER THE GATE — both applied

### SV-1 · REPRESENTATIONAL ADEQUACY, ratified

> **A semantic-conservation system can only conserve distinctions its
> representation is capable of expressing.** If the source draws a distinction
> relevant to fidelity, the graph must represent it without collapsing it into
> another property. **Failure to represent a source distinction is a SCHEMA
> failure, not analyser discretion.**

⭐ **The known-bad is preserved as a falsifier.** The flattened vocabulary — the two
degree words collapsed into one `significance` — is applied to the same source and
the same run-9 candidate, and the test asserts **the migration becomes invisible.**
Closure is what makes comparison mechanical; closure is also what can make a
distinction disappear before comparison.

### ⛔ POSITIONAL CORRESPONDENCE — REFUSED, and replaced

*"Position is also semantic information you haven't established as invariant. A
perfectly faithful revision could reorder the expression while preserving exactly
the same semantic graph."* Correct, and my draft would have reported corruption
there.

Replaced with **deterministic alignment by EDGE TOPOLOGY**, exhaustive over
permutations (bounded at `MAX_ALIGNABLE_NODES = 8`; beyond it the comparator
refuses rather than approximating).

```
exactly one alignment        compare properties under it
several, one preserves
  properties                 that is the intended correspondence — no judgement
several, none distinguishes  ⛔ `correspondence_ambiguous` — the comparator
                               does NOT choose
no alignment                 `structure_mismatch`
```

⚠️ **ONE DELIBERATE REFINEMENT OF THE RULED DESIGN, disclosed.** The ruling said to
find an isomorphism preserving node properties **and** edges. But a defective
candidate has **no** property-preserving isomorphism — so that criterion collapses
every defect into one undifferentiated *semantic mismatch*, losing precisely the
`added_property` and `reassigned_property` findings that make this architecture
worth building. **Alignment on topology answers *which node is which*; comparing
properties afterwards answers *what changed*.** Both remain judgement-free.
⛔ Reversible if the founder disagrees.

### ⛔⛔ PROPERTY-BASED TIE-BREAKING — REJECTED (founder), and it was worse than described

*"If properties participate in choosing the correspondence, the comparator can use
the very thing it is supposed to test to decide which node is which. In a symmetric
graph, a property migration could be explained away by swapping the node mapping…
the answer helps define the test by which it passes."*

⚠️ **And the draft was worse than the ruling assumed.** With SEVERAL
property-preserving alignments it returned `admitted: true` **without comparing
anything at all.**

**Correspondence is now determined by STRUCTURE ONLY:**

```
STRUCTURE / IDENTITY   `kind`, edge topology, edge direction
                         -> MAY determine correspondence
ASSERTED SEMANTICS     `properties`
                         -> evaluated UNDER a correspondence, NEVER chooses one
```

```
exactly one structurally admissible mapping   compare properties under it
more than one                                 correspondence_ambiguous
none                                          structure_mismatch
```

⭐ `kind` (`event | state | process | relation | entity`) is introduced as the
identity-bearing structural attribute the ruling anticipated, **separated in the
type from the properties under evaluation**, with a falsifier asserting the
alignment search reads neither `properties` nor `valueOf`.

### ⭐⭐ THE SYMMETRY FALSIFIER — required by the ruling, and it discriminates

```
two topology-equivalent nodes
source:     significance asserted on node 1
candidate:  significance asserted on node 2

OURS           correspondence_ambiguous — never admitted by swapping
KNOWN-BAD      admitted = true, "chose the property-preserving mapping"
```

⭐ **And when an independent STRUCTURAL anchor makes identity determinate** — the
same graph with distinct `kind`s — **the migration IS reported** as
`reassigned_property`. Structure decides who is who; semantics decide what changed;
neither borrows the other's authority.

### The metamorphic pair, added

```
GOOD PARAPHRASE   different labels · different node order · same semantics   ADMIT
BAD PARAPHRASE    same inventory · same node count · ONE property reassigned REFUSE
```

⭐ And **reordering does not launder a real defect** — the run-8/9 candidate
shuffled is still refused.

## ⛔ A-S — WITNESSED AND FAILED (founder ruling)

Subject `a087e3167`, harness `b9615f1c5`.

```
A-S     FAIL
C-S     evidence captured in part · NOT RULED
AC-1    NOT REACHED
AC-2    NOT REACHED
B       HELD        A->B->C->D   HELD
```

⭐ **The frozen rule did its job**: *if A invents a commitment, A-S fails
immediately and nothing downstream is consulted.* The capture ends at
`C-migration`; **no rerun is needed to complete AC-1/AC-2, because they are not
adjudicated once A-S has failed.**

### 🔴 A1 — source property OVERCOMMIT

```
A emitted    transformation.agency = undergone
rubric       agency UNSPECIFIED, alongside magnitude · valence · direction
```

⭐ **The analyser itself added a commitment the source did not make** — the exact
failure class this architecture was built to detect, now found in the detector.

### 🔴 A2 — the relation is missing · ⚠️ AND I WOULD RECLASSIFY IT

The founder recorded A2 as a **source relation omission by A**: `orientation` and
`natural_world` both present, but *"orientation toward the natural world"* not
structurally encoded.

⛔ **The finding is right; the attribution is not. A COULD NOT HAVE ENCODED IT.**

```
the relation vocabulary available to A, in full:
  causes · results_in · constitutes · qualifies · within · distinct_from

nothing in it can express DIRECTEDNESS — "toward", "about",
"has as its object". The edge A is faulted for omitting was
UNREPRESENTABLE.
```

⭐ **Under SV-1, that is a SCHEMA failure, not analyser discretion** — the founder's
own ratified law: *"If the source draws a distinction relevant to fidelity, the
semantic graph must be able to represent that distinction… Failure to represent a
source distinction is a SCHEMA failure, not analyser discretion."*

**Why the distinction decides the repair:** as analyser inaccuracy, A2 would be
fixed by instructing A better — and no instruction can produce an edge kind that
does not exist. As a schema failure it is fixed by extending the relation
vocabulary, and the SV-1 known-bad already establishes what happens when the
schema cannot hold a distinction: **it disappears before comparison.**

⭐ **RULED: RECLASSIFIED.** *"No prompt instruction can manufacture a legal relation
that the schema does not admit. Blaming A there would violate the very
representational-adequacy law the architecture already ratified."*

```
A1  analyser overcommit          STANDS
A2  missing directed relation    SCHEMA FAILURE · SV-1
```

### ⚠️ A1, second observation — the DOMAIN may invite the overcommit

```
agency: ['unspecified', 'active_participation', 'undergone']
```

`undergone` is a value the schema OFFERS for a passive reading. So `unspecified`
competes with two committing options rather than being the residual one. ⛔ Not a
defence of A1 — the source does not commit either way, and A did — but it is a
schema-shape question the repair should consider rather than treat as settled.

### C observation, NON-GOVERNING

C-good's graph carries `significance = asserted` on the change node **and both**
`significance` and `meaningfulness` on the development node. ⭐ **The analyser
appears to duplicate/migrate a property inside the very representation built to
detect property migration.**

⛔ Not promoted while A-S is failed. Retained as evidence that the present problem
is **A/C semantic extraction accuracy, not D.**

### ⭐ What this failure proves about the architecture

**The separation worked.** D was never allowed to launder an inaccurate source graph
into an authoritative fidelity verdict. *That is exactly why A had to be witnessed
independently before D.*

## ⭐ SV-2 · SV-3 — bounded schema adequacy repair → `analyzer/2`

⛔ **Prompt tuning HELD.** Only the representation was touched.

### ⛔ VERSION IS EVIDENCE

`RC-GEN-01/analyzer/1` owns the A-S failure permanently. A schema repair creates a
**new subject**: `analyzer/2`. **A-S, C-S, AC-1 and AC-2 must all be witnessed again
against v2; the v1 failure is not overwritten.**

### ⭐ SV-2 RELATION ADEQUACY — `has_object` added

General, never fixture-shaped. Falsified on the founder's three non-fixture cases —
attention toward a sound · hostility toward a stranger · orientation toward a
landscape — and a test asserts no relation name mentions this specimen.

⭐ **The v1 gap is now a DISTINCTION rather than the only expressible option**: a
graph joining a relation node to its object, and the v1 shape with both nodes and no
edge, are compared and **refused as different**.

### ⭐ SV-3 DISCRIMINATOR — the agency dimension HOLDS all three, unforced

```
ACTIVE    "He deliberately worked on integrating the experience."  active_participation
PASSIVE   "He underwent the procedure while unconscious."          undergone
NEUTRAL   "Integration continued over the following months."       unspecified / omitted
```

All three representable · **mutually distinguishable by the comparator** · and
neutral is expressible **without choosing a participation role**, because omitting
the property is legal.

⭐ **So the schema does not force the commitment. Under the founder's own
conditional — *"If yes, retain the domain and A1 remains purely analyzer error"* —
A1 stands as analyser error.** ⛔ The repair for it is a prompt act, and prompt
tuning is held.

### ⚠️ SV-4 — A THIRD ADEQUACY GAP, found while running the SV-3 discriminator

⭐ **The schema lets ANY property attach to ANY node kind.**

In A-S v1, `agency` was attached to the **transformation** node. But a
transformation does not act or undergo — **the person does.** The dimension may not
apply to that node at all, and the schema gave the analyser no way to say so: its
only options were to pick a participation role or to omit a property that was never
applicable.

> ⛔ **`unspecified` and `not applicable` are DIFFERENT CLAIMS.** *"The source does
> not say whether he participated"* is not *"participation is not a property of this
> node."* Collapsing them is the same shape as SV-1.

⚠️ **This may be the actual root of A1** — the analyser was asked a question that
did not apply to the node it was describing, and a closed domain with no *not
applicable* value makes the tempting answer the only non-silent one.

⛔ **NOT REPAIRED.** Surfaced for a founder ruling: the repair is a schema change,
and the authorized acts were SV-2 and SV-3 only.

## ⭐ A-P and C-P — analyser PROTOCOL built · 25 falsifiers

**Founder contract frozen before building.** `lib/manuscript/revision/analyze.ts`.

```
A sees the SOURCE, never the candidate.
C sees the CANDIDATE, never the source.
D sees the GRAPHS, never prose.
B does not participate in deciding whether B succeeded.
```

### ⛔ The separation is STRUCTURAL, not prompt discipline

```
ONE shared prompt body      the only thing that differs between A and C is
                            WHICH passage the caller hands in
the signatures accept       analyzeSource(source) · analyzeCandidate(candidate)
  no second passage         neither CAN receive the other's text
the prompt names no         whole-word guard: candidate · revision · rewrite ·
  comparison at all           writer · proposal · compare · original · pass ·
                              fail · faithful
it states outright          "There is no other passage."
                            "no right answer you are being measured against"
```

### ⛔ The schema cannot express a judgement

`additionalProperties: false` at **every** level; property values are a **closed
enum**; and a falsifier asserts none of `faithful` · `should_pass` · `similarity` ·
`score` · `advice` · `verdict` · `fidelity` is representable. **Nine runs of
`reason` claiming a fidelity the wording did not have is why this is structural
rather than instructed.**

### ⭐ `unspecified` is taught as an ANSWER

*"Unspecified is an answer, and the most common correct one."* Plus the three
confusions every failed run made, as law rather than examples: **Importance is not
size. Continuation is not effort. Change is not improvement.**

### ⚠️ `kind` constrained, because it carries correspondence authority

*"Two passages that say the same thing in different words should yield the same
kinds — it describes the role, not the phrasing."* If synonymous expression changes
`kind`, it has become a hidden lexical matcher, and **that must fail A/C acceptance
rather than masquerade as semantic mismatch downstream** (AC-1).

### ⛔⛔ TWO BOUNDARY DEFECTS FOUND BY FOUNDER REVIEW — both repaired

#### 1. Closure without TYPING

Every property shared ONE global value enum, so the schema admitted:

```
magnitude = ongoing · agency = positive · temporality = high
significance = active_participation · valence = asserted
```

⭐ **A closed vocabulary that can state nonsense offers the comparator no
protection at all.** Replaced with **per-property domains** — *a value legal for
one semantic dimension is not automatically legal for another* — carried in the
tool schema itself, with falsifiers on both sides (six nonsense pairs refused, five
legal ones admitted).

#### 2. `admitAnalysis` SAID "NEVER coerces" AND COERCED THREE WAYS

```
unknown kind        -> became `unspecified`
missing properties  -> became {}
missing edges       -> became []
```

…and it enforced none of the schema's `additionalProperties: false` independently.

⚠️ **My comment asserted a property the code did not have** — the same shape as the
`reason` field asserting a fidelity the wording did not have, which this whole
architecture exists to stop trusting.

⭐ **This is the last trustworthy boundary before D.** The structured router returns
the provider's result and performs no second semantic validation, so a malformed
analysis was being **silently normalised into a plausible graph** — after which D
would compare two graphs, **one of them partly invented by the admission layer**.
That is the most dangerous failure available here, because it produces a confident
verdict about something nobody wrote.

Now refuses: unknown kind · **missing** kind · missing `properties` · missing
`edges` · extra field at top level, node level or edge level · wrong-domain value.
A legitimate one-node analysis sends `"edges": []`; **the boundary does not
manufacture it.**

### ⚠️ A DISCIPLINE FAILURE OF MINE, TWICE NOW

I pushed `76d73a29d` and `9b979ad19` with failing tests. Both times the gate ran
and I read the **typecheck** line while the **jest** line sat directly above it.
Both were trivially fixable — stale assertions my own edit had invalidated — and
that is exactly what makes the pattern worth recording: *a green line adjacent to a
red one is not a green run.*

⭐ **The rule I am holding myself to: the test result is READ LAST and ALONE,
immediately before the commit — never as one line in a block of output I am
scanning for something else.**

### ⚠️ A guard defect of mine, fixed and recorded

The leak check used substring matching and failed on **`pass` inside `passage`** —
the same crudeness that produced a false leak on `integration` inside
`developmental` in the generation guard. Now whole-word. **A guard that cannot tell
a word from a syllable is not a guard**, and this is the second time that exact
shape has appeared.

```
comparator (step D)        PASSED · 33 falsifiers
SV-1 adequacy              RATIFIED · known-bad preserved
node correspondence        STRUCTURE-ONLY alignment
                           positional RULED OUT · property tie-breaking REJECTED
A-P · C-P protocol         BUILT · 42 falsifiers
                           property-domain typing CLOSED
                           non-coercive admission CLOSED
A-S source graph witness   ⛔ WITNESSED · FAILED (founder ruling)
C-S candidate witnesses    partial evidence · NOT RULED (A-S gates it)
AC-1 / AC-2                ⛔ NOT REACHED
B generation integration   HELD
full A->B->C->D witness    HELD
```

⛔ **Per the ruling, A and C are witnessed INDEPENDENTLY before any end-to-end run** —
otherwise a failure again has multiple possible causes.

### Specimen 2 — ninth consecutive `no_change`

**Restraint is strongly evidenced.** The remaining gate is narrowly about semantic
conservation during transformation.

## 3A-S — RUN 8 · evidence of record

**Checkout `e684edcbd`** (degree-of-commitment law live), `--require-cognition`.
**Protocol: 0 failed** on both specimens.

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience brought about a large change in how he related
> to the natural world. The shift in how he saw things that came out of that change
> was a meaningful development in the process of integration he was already engaged
> in."

### Specimen 2 — returned `no_change`

> **reason:** "The passage is already fully concrete: two physical events in
> sequence — the kettle switching off, and Mara pouring water over coffee grounds —
> stated in plain, specific nouns and verbs with no abstraction to reduce. Any
> revision would have to invent detail the text does not supply (temperature,
> vessel, her manner, her state of mind, how the two acts relate beyond succession),
> which would add nodes and valence the source withholds. The existing sentences are
> stronger than anything I could substitute for them."

Zero proposals. **Eighth consecutive `no_change`.**

### Observations for the ruling — ⛔ NOT a ruling

```
AGAINST RUN 7's TWO RULED DRIFTS

  "significant transformation"
    run 7   "large change"          ruled FAIL (importance -> magnitude)
    run 8   "large change"          ⚠️ IDENTICAL — UNCHANGED

  "ongoing process of integration"
    run 7   "the integration he was still working through"   ruled FAIL
    run 8   "the process of integration he was already engaged in"
            "process" is now preserved literally;
            "still working through" became "already engaged in"
            ⚠️ whether "engaged in" still asserts agentive participation
               the source does not state is the founder's ruling

CONSTITUTIVE EDGE
  run 7   "counted as a meaningful development"
  run 8   "WAS a meaningful development in the process"
          closer to the source's "constituted ... in"
```

⚠️ **One of the two ruled drifts is verbatim unchanged.** Recorded as a fact, not as
a conclusion about whether the law failed to reach it.

## ⭐ FOUNDER RULING — 3A-S run 8: **FAIL**

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

### What holds

No node collapse, no dropped edge. *"The shift in how he saw things that came out
of that change"* keeps the perceptual shift distinct **and** relates it as resulting
from the relational change. *"was a meaningful development in"* is faithful to the
constitutive relation.

### 🔴 Both forms the run-7 law was written to catch, in one proposal

```
importance -> magnitude
  "significant transformation" -> "large change"
  `large` asserts magnitude. `significant` can mean important, consequential
  or noteworthy while being SUBTLE in magnitude.

process -> deliberate / agentive participation
  "ongoing process of integration"
    -> "the process of integration he was already engaged in"
  `already` is defensible as temporal continuity. `engaged in` is not
  neutral: it adds that he was actively undertaking it.
```

### ⭐⭐ THE FRAMING CORRECTION — this is NOT an eighth failure class

⛔ **The sequence must not be recorded as eight distinct classes.**

```
1  invention
2  semantic collapse
3  teleological coloring
4  semantic collapse regression
5  dropped edge
6  node substitution
7  node-property drift
8  node-property drift PERSISTS
```

> ⭐ **Run 8 is the FIRST DIRECT TEST of the run-7 property-preservation repair, and
> it shows that repair has not closed the class.**

⭐ *"The new law has not yet produced a passing inference — but the specimen is now
testing it exactly where intended."*

### ⚠️ ENGINEERING OBSERVATION — this failure differs in kind from the first seven

⛔ **Not a ruling, and no repair is made on it.** Through run 7, every failure was
something the instruction **did not yet say**. Run 8 is the first where **the
instruction already forbids the exact failure, in nearly the exact words** — *"do
not turn importance into magnitude"* and *"a process into a deliberate effort"* —
**and the failure occurred anyway.**

Three readings are available and the evidence does not separate them:

```
the law does not reach the phrase   ·  `large` is not read as a magnitude claim
·  "brought about a large change" is produced as a unit before the
   constraint is consulted
```

⛔ **No further clause is added.** Every prior repair supplied something absent;
another statement of a rule already present would be a different act, and one the
evidence does not yet justify. **A second data point against the unchanged run-7
law is worth more than an eighth wording.**

### Specimen 2 — PASS, eighth consecutive

**Restraint is not the unsettled capability.** The unresolved issue remains faithful
transformation under semantic simplification.

## 3A-S — RUN 7 · evidence of record

**Checkout `908906e8a`** (nodes-and-edges law live; fixture vocabulary removed),
`--require-cognition`. **Protocol: 0 failed** on both specimens.

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience brought about a large change in how he related
> to the natural world. The shift in how he saw things that came out of that change
> counted as a meaningful development in the integration he was still working
> through."

### Specimen 2 — returned `no_change`

> **reason:** "The passage is already fully concrete: two named physical events in
> sequence — the kettle clicking off, and Mara pouring the water over the grounds —
> with no abstraction to reduce. Any \"more concrete\" version would have to invent
> detail the source does not give (the kind of coffee, the vessel, her manner or
> mood, how the water was poured), which would add nodes and psychological or
> valence content the text withholds. The restraint here is doing work: the passage
> reports action without interpreting it, and the plain declarative rhythm is the
> writer's own. There is nothing to make plainer without making it longer and less
> exact."

Zero proposals. **Seventh consecutive `no_change`.**

### Observations for the ruling — ⛔ NOT a ruling

```
NODE IDENTITY, the run-6 failure
  run 6   "That change in how he saw things then produced a shift in
           perspective"  — the RELATIONAL node redescribed as perceptual
  run 7   "The shift in how he saw things THAT CAME OUT OF THAT CHANGE"
          — "that change" is now the antecedent of a resulting relation,
          and the shift is named as a separate thing arising from it

CONSTITUTIVE EDGE
  "counted as a meaningful development in the integration"
  "meaningful development" preserved literally

⚠️ TWO PREVIOUSLY RECORDED, NEVER-DECIDED CONCERNS ARE BOTH PRESENT
  "a large change" for "significant transformation"
     the magnitude-for-importance trade the founder noted on runs 5 and 6
     and did not need to decide either time

  "the integration he was still working through"
     the run-3 WATCH ITEM — "working through" can imply struggle or active
     psychological labour, recorded then as "close enough not to fail on"
```

## ⭐ FOUNDER RULING — 3A-S run 7: **FAIL** — closest yet

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

### ⭐ The graph now holds

```
experience -> brought about -> change in relation to natural world
           -> came out of that change -> shift in perspective
           -> counted as -> meaningful development -> within -> ongoing integration
```

**Run 5's dropped edge and run 6's node substitution are BOTH repaired.**
*"The shift in how he saw things"* is clearly a second node resulting from the
relational change.

### 🔴 What fails: NODE PROPERTIES DRIFT

```
SOURCE   "significant transformation"
RUN 7    "large change"
         significance is not magnitude. Important · consequential ·
         noteworthy — the source never commits to SIZE.

SOURCE   "ongoing process of integration"
RUN 7    "integration he was still working through"
         "still" carries ongoing correctly. "he was working through" adds
         AGENTIVE PSYCHOLOGICAL LABOUR. A process can occur without the
         text saying he is consciously undertaking it.
```

⭐ **The structural repair did its job and exposed the next thing: preserving node
identity also requires preserving the source's DEGREE OF COMMITMENT about each
node's properties.**

### Explicitly NOT failed

- *"The shift in how he saw things that came out of that change"* — clunky,
  **semantically faithful enough**; the distinct node and the resulting relation
  both survive.
- *"counted as a meaningful development"* — weaker and more classificatory than
  *constituted*, but it still says the shift **qualifies as** the development rather
  than merely influencing it. **Not a gate failure.**

### The law, sharpened — ⛔ NOT by adding examples

> **Preserve not only each node and edge, but the source's exact degree of
> commitment to every property. Do not turn importance into magnitude, possibility
> into certainty, process into deliberate effort, or description into evaluation.**
>
> ⭐ **A plainer word is not faithful if it is more specific than the source.**

⛔ `significant ≠ large` and `ongoing ≠ working through` are **NOT added to the
prompt** — that would start teaching the fixture again. A falsifier asserts both
phrases are absent.

### ⭐ The fixture-vocabulary removal is ratified, and it strengthens this run

*"The model was not handed the vocabulary of the answer, and the specimen is again
genuinely adversarial."* The extension to all four pairs stands.

### Specimen 2 — PASS, seventh consecutive

```
runs 1-6   invention · collapse · valence · collapse regression ·
           dropped edge · node substitution
run 7      graph preserved, NODE PROPERTIES drift
```

## 3A-S — RUN 6 · evidence of record

**Checkout `049d1836d`** (structural framing live), `--require-cognition`.
**Protocol: 0 failed** on both specimens.

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience brought about a large change in how he related
> to the natural world. That change in how he saw things then produced a shift in
> perspective, and that shift was a meaningful part of the process of integration he
> was still going through."

### Specimen 2 — returned `no_change`

> **reason:** "The passage is already fully concrete: two physical actions with
> specific objects (kettle clicking off, water poured over coffee grounds), a named
> agent, and no abstraction to reduce. Any revision would have to add sensory
> detail, interiority, or timing that the text does not state — inventing rather
> than clarifying. The existing sentences are plainer and more exact than anything a
> rewrite could offer."

Zero proposals. **Sixth consecutive `no_change`.**

### Observations for the ruling — ⛔ NOT a ruling

```
EDGES NOW EXPLICIT, all three, for the first time
  "brought about"        experience -> relational change
  "then produced"        that change -> shift in perspective
  "was a meaningful
   part of"              shift -> constitutes the development, within
                         the ongoing process

"meaningful" PRESERVED LITERALLY — not traded for a directional word

⚠️ BUT THE MIDDLE NODE CARRIES RUN 4's PHRASE
  "That change in how he saw things then produced a shift in perspective"
  The antecedent of "That change" is the RELATIONAL change, and it is
  then apposed as "in how he saw things" — run 4's collapse wording —
  before producing a FURTHER "shift in perspective". Whether that
  re-labels the relational node as perceptual, or merely reads
  redundantly, is the founder's ruling.

⚠️ "a large change" for "significant transformation"
  magnitude again — the same reservation the founder recorded about
  run 5's "a great deal", and did not need to decide then.
```

## ⭐ FOUNDER RULING — 3A-S run 6: **FAIL**

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

### ⭐ The structural repair WORKED

All three edges present — `brought about` · `then produced` · `was ... part of`.
No teleological coloring. *"Plainness may not drop an edge"* did its job.

### 🔴 What fails: NODE IDENTITY

> "a large change in **how he related to the natural world**. **That change in how
> he saw things** then produced a shift in perspective…"

The relational change is referred back to as *"that change in how he saw things"* —
**perspective-language applied to the node that must stay relational.**

```
SOURCE    RELATIONSHIP changes -> PERSPECTIVE shifts
RUN 6     RELATIONSHIP changes -> same change REDESCRIBED as how he saw
                               -> PERSPECTIVE shifts
```

> ⭐⭐ **A graph can preserve all its edges and still alter the meaning if it
> changes the identity of the nodes.**

### Second R3 concern, recorded not decided

`significant transformation` → `large change`. *Significant* can mean important,
consequential or noteworthy; *large* asserts magnitude — another dimension the
source did not necessarily specify. **Not needed for the gate**, recorded so the
next repair does not remove one distortion while preserving the other.

### The six-run sequence

```
run 1  invention · run 2  collapse · run 3  teleological coloring
run 4  collapse regression · run 5  edge dropped
run 6  edge preserved, NODE IDENTITY altered
```

### ⭐ RULED — the run-3 exposure is closed: remove fixture vocabulary

*"Keeping exact fixture vocabulary in the prompt weakens the independence of the
specimen, even if those phrases are not intended as answers."* `ongoing ≠
struggling` and `integration ≠ repair` are **removed from the production
instruction**; the principles they instantiate are already general.

⚠️ **EXTENDED BEYOND THE TWO NAMED, AND FLAGGED:** `meaningful ≠ positive` and
`development ≠ improvement` are fixture vocabulary by the identical test, so they
were removed too. Replaced with non-fixture pairs of the same shape. **Reversible
if the founder disagrees.**

⚠️ **Two documented exclusions**, asserted explicitly so the guard cannot rot:
`developmental` (MAIA's ROLE in this product, not the fixture's noun) and `process`
(generic English needed to say what a node can be).

### Specimen 2 — PASS, sixth consecutive

⛔ 3A remains NOT PASSED. 3D remains CLOSED.

## 3A-S — RUN 5 · evidence of record

**Checkout `b460eac85`** (simultaneity law live), credential from line 2,
`--require-cognition`. **Protocol: 0 failed** on both specimens.

### Specimen 1 — returned `proposals`

> **proposedText:** "The experience changed how he related to the natural world,
> and it changed it a great deal. The change in how he saw things was itself a part
> of the process of integration he was still going through, and it mattered to that
> process."

### Specimen 2 — returned `no_change`

> **reason:** "The passage is already fully concrete: a kettle clicking off, water
> poured over coffee grounds, a named actor. There is no abstraction to reduce. Any
> revision would have to add detail the text does not state — the temperature, her
> mood, the reason for the pause, the kind of coffee — which would be invention
> rather than concreteness. The two short sentences also carry a deliberate flatness
> and sequence (the click, then the pour) that added specificity would dilute."

Zero proposals. **Fifth consecutive `no_change`.**

### Observations for the ruling — ⛔ NOT a ruling

```
NEW IN RUN 5
  "and it changed it a great deal"   recovers the degree marker
                                     "significant", absent from runs 1-4
  "was itself a part of the process" constitutive relation retained
  "and it mattered to that process"  ALSO present — the run-2 phrase
                                     ruled a weakening, here alongside
                                     the constitutive claim rather than
                                     replacing it

UNCHANGED FROM RUN 4
  "The change in how he saw things"  the perspective shift is INTRODUCED
                                     rather than stated as resulting from
                                     the relational change. "That" became
                                     "The", which alters the anaphora but
                                     the source's "resulting" relation is
                                     still not written.
```

## ⭐ FOUNDER RULING — 3A-S run 5: **FAIL**, and a DISTINCT failure

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

### ⛔ NOT another semantic-collapse regression

Run 4's *"**That** change in how he saw things"* actively **identified** the two
changes. Run 5's *"**The** change…"* removes that identification. **The two
distinctions now survive.**

### 🔴 What fails: the EDGE between them

```
SOURCE          change in relationship
                       | RESULTING IN
                shift in perspective

RUN 5           change in relationship
                shift in perspective        (both present · no relation stated)
```

**The nodes survived; the edge did not.**

### Portions explicitly NOT failed

- `"was itself a part of the process of integration"` — correctly restores the
  constitutive relation.
- `"and it mattered to that process"` — **no longer the run-2 defect**, because it
  appears *alongside* the constitutive claim rather than replacing it, and
  plausibly carries some of *meaningful*.
- `"and it changed it a great deal"` for *significant transformation* — **the
  founder is unpersuaded** (ambiguous `it`/`it`; *significant* is not only
  magnitude) **but did not need it to decide**: the missing edge already fails R3.

### ⭐⭐ The five-run sequence, precisely

```
run 1   FAIL · invention
run 2   FAIL · semantic collapse
run 3   FAIL · teleological coloring
run 4   FAIL · semantic collapse regression
run 5   FAIL · causal relation dropped
```

⭐ **We are no longer discovering that the model lacks the individual rules. It has
demonstrated each of them at different moments.** The unmet requirement is
simultaneous preservation of the whole semantic structure.

⛔ **Do not add "remember to preserve causal relations" as another local clause** —
that law is already among the things the system must preserve.

> ⭐ **Before rewriting, MAIA must hold the source as a RELATIONAL STRUCTURE — not
> merely as a set of claims — and the proposed wording must preserve that structure
> simultaneously.**
>
> **Plainness may alter the vocabulary. It may not drop an edge.**

### ⚠️ OPEN — a teaching-to-the-test exposure in the ratified valence pairs

Building the anti-teaching guard surfaced this rather than assuming it away. **Two
of the run-3 valence pairs use specimen 1's own vocabulary:**

```
ongoing      is not  struggling
integration  is not  repair
```

⛔ **Not edited here.** They were authored as the founder's ruling on run 3, and
silently generalizing a ruling is worse than naming the exposure.

**Why it may not matter:** the pairs forbid *adding* those readings; they do not
supply a wording MAIA could copy, and the failures since run 3 have been elsewhere.
**Why it might:** a specimen whose vocabulary appears in the instruction is no
longer fully independent of it, and run 5 did preserve `integration` cleanly.

⭐ **The falsifier now asserts exactly this and no more** — that `integration` and
`ongoing` are *the only* fixture words in the prompt — so the guard cannot rot into
quietly covering a future leak. A founder ruling decides whether to generalize the
two pairs.

### Specimen 2 — PASS, fifth consecutive live run

**The unresolved capability is faithful transformation. It is not restraint.**

## 3A-S — RUN 4 (witnessed) · FOUNDER RULING: **FAIL** — and it is a REGRESSION

Second attempt, credential taken from line 2 rather than `head -1`. Protocol **0
failed**. Both specimens produced real cognition.

```
SPECIMEN 1   R1 PASS · R2 PASS · R3 FAIL · R4 PASS
SPECIMEN 2   PASS
3A-S FAIL  ·  3A NOT PASSED  ·  3D CLOSED
```

### ⭐ The valence repair worked

No *"step forward"*, no improvement, struggle, repair, or any directional or
psychological condition the source did not supply. **And `"was itself part of the
process of integration"` restores the constitutive relation that run 2 had weakened
to `"mattered to"`** — while `"and it mattered"` carries the source's *meaningful*
without forcing positive valence.

### 🔴 But R3 fails — and it is the RUN 2 defect returning

> "The experience changed how he related to the natural world. **That change in how
> he saw things** was itself part of the process of integration he was still going
> through, and it mattered."

The antecedent of *"that change"* is the **relational** change; the sentence then
redescribes it as *"how he saw things."* Relationship and perspective are one change
again.

```
SOURCE   RELATION changes -> PERSPECTIVE shifts   (two, related)
RUN 4    RELATION changes  =  "that change in how he saw things"   (one)
```

### ⭐⭐ THE FINDING THAT MATTERS — repairing one axis REOPENED another

```
run 1   FAIL · invention
run 2   FAIL · semantic collapse
run 3   FAIL · teleological coloring
run 4   FAIL · semantic collapse, REGRESSED
```

⛔ **This is not the discovery of an ever-finer fourth defect.** The system has
demonstrated that **satisfying one established constraint can violate another
already repaired.** Run 3 held the geometry and lost on valence; run 4 held valence
and lost the geometry.

⛔ **Therefore: do NOT add another clause aimed at this sentence.** The question is
no longer *teach it one more prohibition* but **can the instruction make every
already-established constraint hold SIMULTANEOUSLY?**

### ⭐ `reason` excluded — supported a third time

The reason claims *"keeping the two distinct claims and their relation"* while the
wording collapses them. **The model can correctly articulate the law it is
violating.** Three for three.

### Specimen 2 — PASS, fourth consecutive

Restraint has survived four real provider runs and three instruction changes. **The
unresolved problem is entirely faithful transformation, not the capacity to
refrain.**

### Environment note

```
line 21  len=108  fp=a13214d0     <- invalid; this is what head -1 took
line 22  len=108  fp=f251e1c6
line 23  len=108  fp=f251e1c6     <- IDENTICAL to line 22
```

Three keys, two of them duplicates of each other, and the stale one first. ⛔ **The
Step 7 duplication is still in the file.** Not this lane's to repair; recorded so
the next operator does not rediscover it.

## (superseded) RUN 4 first attempt · ⛔ NOT WITNESSED (401)

Checkout `7b6fe36b2`. **No cognition occurred.** Both specimens refused
`unreachable` on a provider `401 authentication_error`.

⛔ **This is NOT a semantic result and NOT a rubric FAIL.** The four criteria were
never reached. `PROTOCOL: 2 failed` is the harness correctly reporting that no
outcome was admitted — the envelope, the admitter and the instruction layer were
never exercised.

### ⭐⭐ THE DIAGNOSTIC SEAM REPAIR PAID OFF, IN THE FIELD, TODAY

```
[MAIA/ask] structured-refusal stage=structured_inference
  refusal=provider_unavailable model=claude-opus-5 request_id=(none)
  cause=401 {"type":"error","error":{"type":"authentication_error",
             "message":"API key is invalid."}}
```

**Before this morning's repair the operator would have seen the single word
`unreachable` and nothing else** — which is precisely what cost the Step 7
afternoon, when a doubled key produced a 217-character header and the failure was
indistinguishable from ten other causes.

The line shows exactly what the repair promised: the router's own refusal identity
(`provider_unavailable`), the pinned model, and the provider's real message,
**bounded and credential-free** — the sanitizer left the 401 body intact because it
contains no key material and is under the cap.

⭐ **A repair authorized on the argument that "proposal generation will hit the same
boundary" hit that boundary on its fourth run and was legible in one line.**

### Triage, and what it is NOT

`.env.local` holds **three** `ANTHROPIC_API_KEY` lines. The export takes `head -1`.
Runs 1-3 succeeded in a shell where the credential was already exported; run 4 was a
**fresh terminal**, so it re-derived the value and **the first line is not a valid
key**.

⛔ **Not the doubled-key defect from Step 7** — that produced a 217-char header and
curl error 43. This is a well-formed key the provider rejects: `401`, not a
transport error. Different failure, correctly distinguished by the very field that
was being discarded before.

## ⚠️ Harness defect between run 2 and run 3 (mine)

The rubric edit that added the *"reason is not evidence"* warning put **backticks
inside a template literal**, breaking `specimens.ts` at parse time. The founder hit
it instead of run 3.

⭐ **The instrument could not catch it, and the reason generalizes.** The
fixture-freeze suite reads the file **as text** and asserts substrings, so every
assertion still passed against a file that would not parse. **A source-SCANNING
instrument cannot see whether the file it scans is valid** — the same class as the
C21 false positive in the Circles lane, where a prose ban was matched inside prose
documenting its own compliance.

**Repair:** backticks removed from the rubric text, and the suite now transforms
the source with esbuild before asserting anything. Verified to discriminate — with
the bad line restored, 2 of 7 fail; with it fixed, 84 pass.

**And the discipline failure was mine, not the instrument's:** the script runs in
the development container and reports `NOT WITNESSED` in about a second, which is
sufficient proof that it parses. I did not run it after editing it. *An edit to a
witness is an edit to the evidence path, and it gets executed before it is pushed.*

## ⚠️ Housekeeping corrections

**Migration number collision (mine).** `20260910000001` was already taken by
`pending_ask_claims`. The revision-proposal migration is renamed
**`20260910000004_manuscript_revision_proposals.sql`**. Safe: it is unapplied
everywhere, and `20260910000002`/`0003` were already in use.

**Record date.** This file was first named `…_2026-09-11.md` because the container
clock is UTC (`2026-09-11 00:16 UTC` at the time of writing) while the founder's
working day was still 2026-09-10. ⭐ **The lane's convention is the founder's
working day**, which is what every sibling record uses; renamed to match. Recorded
rather than silently fixed, because a witness filename is a date claim.

## ⚠️ Count correction

The 3B commit message (`02f940044`) says **19 checks**. **The executed witness
reports 20.** *The run is the authority; the message is one count behind.* Recorded
here rather than by rewriting history.

## 3B — atomic persistence · 20 passed · 0 failed

PostgreSQL 16.13, disposable cluster, torn down. **Ten REAL migrations** — members ·
press manuscript room · title optional · source custody · working drafts · draft
sections · revision partition · heading depth · ask_threads · R1 — ⛔ **not the
minimal FK stub**, which answered a different question.

```
B1   commits · joins to its producer turn · canonical wording, target,
     provenance, origin correct · producer IS a MAIA turn · index matches
B5   ⭐ NO turn body contains the canonical proposed wording
B2   proposal insert fails after turn work began -> whole act rolls back:
     no orphan author turn, no orphan producer turn, no proposal
B3   nonexistent producer turn -> rejected
B3b  ⭐ an AUTHOR turn as producer -> rejected by RC-08a IN THE REAL SCHEMA,
     so the trigger is not an artefact of a simplified fixture
B4   no_change commits, records both turns, ZERO proposal rows
B6   recoverable by (thread_id, produced_in_turn_index)
```

⛔ **No same-act specimen exists in this harness, deliberately.** Atomicity must not
acquire credit for idempotency. B6 establishes only that 3C's recovery path exists
**structurally**; it does not perform recovery.

## 3C-1 — invocation identity · 17 passed · 0 failed

**The defect closed:** `actId` is caller-minted and survives a lost response, but
`claim(ref, actId)` never sees the payload — so the same `actId` with a materially
different invocation was **indistinguishable from a retry, and the second
invocation silently disappeared.** ⭐ *That is transport identity overruling member
intention.*

```
same actId + same digest        replay
same actId + different digest   CONFLICT — carries both digests,
                                never `completed`, never `already_consumed`
```

### ⛔ Not "the SHA of the HTTP body"

The canonical **semantic** payload is defined first, then hashed.

```
IN    contract version · thread · member · question ·
      authorized section ids AND their prose as sent
OUT   timestamps · request ids · tracing metadata · user agent ·
      JSON key order · array order · retry counters
```

Sections are **sorted** before hashing (order is not identity) and every field is
**length-prefixed**, so no combination of prose can imitate a field boundary and
forge another invocation's digest. A test asserts that.

### ⭐ C5 discriminates, and the known-bad fails in the OPPOSITE direction

Against `sha256(JSON.stringify(request))`:

```
section reorder -> same digest?  FALSE
key reorder     -> same digest?  FALSE
```

Both of C5's tests go red. ⚠️ **And the harm is the inverse of the defect we set out
to fix:** a genuine retry whose JSON was merely re-serialized — a reordered key
crossing a client, proxy or framework boundary — acquires a NEW digest and is
classified as a **CONFLICT**. An honest retry refused as a different act.

> **An idempotency key that breaks under re-serialization protects nothing, and an
> identity bound to the wire can fail in both directions at once.**

## 3C-2 — receipt and recovery · 25 passed · 0 failed

Thirteen real migrations, disposable PostgreSQL 16, torn down.

**Identity is bound at claim; outcome is bound at completion.** `request_digest`
lands atomically with `consumed_by_act`, so a second presentation is classifiable
**while the original is still in flight**. `outcome_kind` + `produced_in_turn_index`
+ `completed_at` land inside the act transaction, so there is no state where the act
is committed and its receipt is absent.

```
C1  exactly one historical act · cognition called once
C2  replay · ⭐ cognition count REMAINS 1 · turns unchanged · proposals
    unchanged · ⭐ recovered outcome SEMANTICALLY EQUAL to the historical act
C3  ⭐ HARD CONFLICT · no new inference · original unchanged · the verdict
    carries neither `completed` nor `already_consumed`
C4  a new actId is allowed and performs a new act
C5  same canonical digest -> lawful replay
C6  no_change recovers POSITIVELY from the receipt, not from absence
    proposals receipt + missing proposal -> HARD RECOVERY FAILURE,
      ⛔ never downgraded to no_change
    no_change receipt + attached proposal -> HARD RECOVERY FAILURE
    consumed-but-uncompleted is `incomplete`, visibly not a replay
    ⭐ the SCHEMA refuses completion without receipt evidence
```

⚠️ **Honest qualification on C5 at the database level.** The witness's C5 presents a
shallow copy, which is not a genuinely different serialization — it confirms that a
matching digest replays lawfully, and no more. **Digest invariance under
re-serialization is proven in the unit suite** (`revision-invocation-identity`:
section reorder, key reorder, deep JSON round-trip), where the known-bad
`sha256(JSON.stringify(...))` fails all three. The two together cover C5; neither
does alone.

⛔ **Inference is stubbed by a counter, deliberately.** C2's claim is about the
CALLER CONTRACT — that a replay never reaches cognition — not about what a model
would say. A real provider here would prove less, not more.

## Previously owed, now discharged

```
3C-2  the caller-level retry contract must RETURN the historical result,
      not merely its status:
        same actId + same digest + completed
          -> do NOT infer again · do NOT persist again
          -> locate the historical producer act
          -> reconstruct the typed outcome  (proposals: via the producer
             turn; no_change: from durable evidence, manufacturing no row)
          -> return it

      acceptance: a caller experiencing a lost response cannot distinguish
      the recovered response from the successful historical act in any
      SEMANTICALLY relevant way. Byte-identical incidental metadata is not
      required; the same authoritative outcome is.

C1    first invocation X+A            -> exactly one historical act
C2    lost response, exact retry      -> no new inference, no new turns,
                                         no new proposal, prior result returned
C3    X + digest B (B != A)           -> HARD CONFLICT, original unchanged,
                                         second payload NOT reported as
                                         successful or replayed
C4    Y + digest B                    -> allowed, new historical act
C5    same request, different
      serialization                   -> same digest, lawful replay   DONE
```

## 3A-S — specimen 2 repaired

⚠️ The earlier fixture was merely **strong prose under an open question**, so a
model could plausibly object to tense, rhythm or a repeated word and a proposal
would have shown editorial **taste** rather than a failure of restraint. The test
was unfalsifiable in the direction that mattered.

⭐ **The repair narrows the requested DIMENSION rather than strengthening the
prose.**

```
fixture    "The kettle clicked off. Mara poured the water over the coffee grounds."
question   "Is this passage too abstract? Change it only if it needs to be
            made more concrete."
```

A proposal is now **unnecessary intervention**, not taste — the precise test of
*authorization is not an invitation to intervene.*

## ⭐⭐ SV-4 DISCRIMINATOR — RUN · node-level `agency` FAILS · relational participation PASSES

**Authorized act (founder):** *"SV-4 discriminator — use non-fixture sentences and
require the representation to distinguish all four... If node-level `agency` cannot
satisfy those cleanly but participation relations can, remove `agency` from node
properties rather than adding more values to it. That would be a genuine schema
repair, not prompt tuning."*

Instrument: `__tests__/revision-sv4-participation.test.ts` — **12 passed · 12 total**.

⛔ **The production schema is UNTOUCHED.** The relational form is cast in locally
inside the test so the discriminator can be run **before** the repair is authorized:

```ts
const REL = {
  actively_participates_in: 'actively_participates_in' as unknown as SemanticEdge['kind'],
  undergoes:                'undergoes'                as unknown as SemanticEdge['kind'],
};
```

### The four fixtures — non-fixture prose, not reused from A-S

```
ACTIVE     "Lena deliberately worked through the calculation."
PASSIVE    "Lena underwent the scan while unconscious."
NEUTRAL    "The healing process continued for several weeks."
MIXED      "Lena performed the test and later underwent the procedure."
```

### Result against the founder's five criteria

```
1  active vs passive distinguishable          node-level ✓   relational ✓
2  neutral representable WITHOUT a claim      node-level ✓   relational ✓
3  ⭐ MIXED representable, no contradiction    node-level ⛔   relational ✓
4  ⭐ participation never attaches to an EVENT node-level ⛔   relational ✓
5  D detects an ADDED participation claim     node-level ✓   relational ✓
```

### ⭐ Criterion 3 is the deciding one

*"Lena performed the test and later underwent the procedure."*

⛔ **Node-level cannot represent it.** Lena is **one** node; `agency` is **one**
intrinsic property; the two readings are irreconcilable and there is no `both` /
`mixed` value. Adding one would be the enum-widening the founder refused.

⭐ **Relational represents it without strain**: one entity node, **two
differently-kinded edges** to two different events, and
`m.nodes[0].properties === {}` — **no intrinsic participation property at all.**

> **Participation is a relation between an entity and an event, not a trait of the
> entity.** A person is not *agentive*; a person *acts in this* and *undergoes that*.

### ⭐ Criterion 4 — the A-S v1 category error becomes UNREPRESENTABLE

Node-level **admits** `transformation.agency = undergone` — the exact error A-S v1
committed. Relational makes it impossible to state: events carry no participation
property, so there is no field to fill in wrongly. ⭐ **The repair does not detect
the category error; it removes the place where it could be written.**

### ⛔ REPAIR NOT AUTHORIZED · `analyzer/2` NOT MUTATED

Per the founder's versioning ruling, changing this creates **`analyzer/3`**:

```
analyzer/2   SV-2 + SV-3 subject · provider witness NOT completed
analyzer/3   SV-4 repaired subject   (does not exist)
```

⛔ Do not quietly mutate `/2`. The discriminator is evidence for a ruling, not the
ruling. A1's prompt repair stays **HELD** until participation ontology is settled.

## ⭐⭐ `analyzer/3` — SV-4 REPAIR BUILT · V3-1…V3-7 PASS · FALSIFIED

**Founder ruling.** SV-4 CLOSED · relational participation RATIFIED · `analyzer/2`
FROZEN as a historical subject · `analyzer/3` authorized to build · A1's prompt
repair DISSOLVED · A2 CLOSED by SV-2 · A-S/C-S/AC-1/AC-2 to be re-witnessed · B and
A→B→C→D HELD.

```
node property `agency`      REMOVED
active_participation        -> relation  actively_participates_in
undergone                   -> relation  undergoes
not_applicable              NOT ADDED anywhere
```

### ⭐⭐ THE REQUIRED REFINEMENT — TYPED ENDPOINTS, ENFORCED AT ADMISSION

⛔ **Adding the two relation names as unrestricted edges would have moved the
category error from a property into an edge and called it repaired.**

```
entity  --actively_participates_in--> event | process     ACCEPT
entity  --undergoes----------------> event | process      ACCEPT
event   --undergoes----------------> process              REFUSE
process --actively_participates_in--> event               REFUSE
entity  --undergoes----------------> entity               REFUSE
```

⭐ **Criterion 4 is now STRUCTURAL**: the error is inadmissible, not less likely.
`unspecified` is not an eligible endpoint in either position — *an analyser that
cannot say what kind of thing a node is has no standing to assert that it
participates.* ⛔ A bad edge is **REFUSED, never dropped or re-kinded**: a boundary
that silently removed it would hand D a graph the admission layer partly authored.

⚠️ **The repair is BOUNDED.** The other six relations stay unconstrained, as in v2.
Endpoint typing for them is a separate adequacy question and is not decided here.

### V3-1 … V3-7 — `__tests__/revision-analyzer3-acceptance.test.ts` · 27 checks

```
V3-1  no node property `agency`; refused at every kind and every legacy value;
      nothing substituted under another name; no `not_applicable`      PASS
V3-2  actively_participates_in admitted only entity -> event|process   PASS
V3-3  undergoes admitted only entity -> event|process                  PASS
      (both exhaustive over all 36 kind pairs — 2 legal, 34 refused)
V3-4  neutral participation = NO participation edge                    PASS
V3-5  mixed: one entity, two differently-kinded edges, properties {}   PASS
V3-6  event/process as participation subject -> malformed              PASS
V3-7  analyzer/2 evidence intact; analyzer/3 newly pinned              PASS
```

### ⭐ FALSIFIED AGAINST FOUR KNOWN-BADS — each red in the right place

```
endpoint typing NOT enforced           5 failed   V3-2 · V3-3 · V3-6
agency added ALONGSIDE, not instead    5 failed   V3-1 · V3-4
subject widened to event|process       5 failed   V3-2 · V3-3 · V3-6
analyzer/2 mutated in place            2 failed   V3-7
```

### ⛔⛔ WL-1 CAUGHT IN THIS RUN — TWO LEGACY ASSERTIONS WENT GREEN FOR THE WRONG REASON

After the repair, two node-level assertions in the SV-4 discriminator still passed
**while exercising nothing about participation**: one because two node `kind`s
differed, the other because a symmetric graph returned `correspondence_ambiguous`.
`compareConservation` no longer compares `agency`, so nothing there was being tested.

⭐ **Repaired by relocating the claim, not by patching the assertion.** The legacy
claims were always claims about **representability** — what v2's vocabulary could and
could not say — so they are asserted against a **frozen literal record of v2** and
never through a live comparator that no longer holds the dimension. The relational
half runs live, and its criterion-1 case was rebuilt to differ **only** in edge kind,
so it cannot pass structurally.

> **A witness is a reading at a time. Evidence asserted against live code decays, or
> worse, quietly re-describes itself as the code moves.**

### ⚠️ ONE CONSEQUENCE, RECORDED AND NOT DESIGNED AROUND

The run-8/9 drift *"ongoing process" → "he was already engaged in"* was an
`added_property` under v2. Under v3 participation is an edge from the **person**, so
detection moves from the property pass to the **structure pass** — and a structural
difference short-circuits alignment. ⛔ **The verdict is unchanged (both refuse), but
an added participation edge and a property drift are no longer reported in one
findings list.** Granularity is lost when both occur together.

### ⭐ A1 RECLASSIFIED, NOT EXONERATED

> **A1 was an analyser overcommit made possible and encouraged by an inadequate
> ontology. The observed failure remains real; the proposed prompt repair is
> withdrawn because the schema repair removes the category in which the error
> occurred.**

⛔ The prompt therefore contains **no prohibition**: it never says *don't say
undergone*, never names `agency`, and no `do not say/use/write` instruction survives
(asserted). It states the ontology — *participation holds between someone and what
happens* — and says absence is the representation where no claim is made.

### ⭐ THE VERSION LINE STAYS HONEST

```
analyzer/1   A-S FAIL  (A1 overcommit · A2 representational inadequacy)
analyzer/2   SV-2 repair · SV-3 discriminator · SV-4 exposed
             ⛔ FROZEN · provider witness NEVER COMPLETED
analyzer/3   SV-4 repair — participation ontology
```

### ⭐ THE FIRST CLEAN PROOF IS THE A-S RERUN, AND THE HARNESS NOW NAMES IT

The A-S rubric in `scripts/witness/rc-gen-01/analyzers.ts` was rewritten: the source
does **not** say the person actively participates in or undergoes the integration or
the transformation, so **the correct graph carries NO PARTICIPATION EDGE AT ALL.**

> ⛔ **A participation edge appearing merely to replace the old `agency` field is A1
> in a new syntax, and A-S FAILS.** That rerun is what distinguishes an ontology
> repair from a rename.

**Gates:** jest `249 passed · 249 total` (10 suites) · typecheck `no regressions`.
Commit `5a1d5aafd`.

⛔ **Standing: `analyzer/3` BUILT · deterministic acceptance PASS · provider witness
NOT RUN · A-S / C-S / AC-1 / AC-2 OWED against v3 · B HELD · A→B→C→D HELD ·
migrations `20260910000004` and `20260910000005` UNAPPLIED · production UNTOUCHED.**

## ⛔⛔ EDGE VOCABULARY COHERENCE — a BOUNDARY LIE, found by the founder before A-S

**Founder ruling.** `analyzer/3` SV-4 repair PASS · typed participation endpoints PASS
· historical v2 preservation PASS · A-S rubric PASS · **edge vocabulary coherence
FAIL** · provider witness HELD on this alone.

### The defect

`analyze.ts` admitted `has_object` from its own private `RELATIONS` list, then wrote:

```ts
edges.push({ from, to, kind: e.relation as SemanticEdge['kind'] });
```

— casting it into an `EdgeKind` that **did not contain `has_object`**.

> ⛔ *"I have verified this is a valid semantic edge; now cast it into a type that
> says it is not valid."*

⚠️ **It would have failed at the worst possible moment.** `has_object` is the SV-2
repair for A2. The first v3 source graph that finally expresses A2 correctly —
*orientation toward the natural world* — is the one the type system was quietly
denying. Found **before** A-S, not during it.

⭐ **The cast silenced exactly the check that would have caught the divergence.** A
vocabulary maintained in two places will diverge; a cast is how the divergence stays
invisible.

### The repair — one canonical list, type derived from it

```ts
export const EDGE_KINDS = [ ...nine relations... ] as const;
export type EdgeKind = typeof EDGE_KINDS[number];
```

```
EDGE_KINDS           WHAT RELATIONS EXIST        (semanticGraph.ts — sole declaration)
RELATION_ENDPOINTS   WHICH CARRY ENDPOINT LAWS   (analyze.ts — the two participation
                                                  relations, and only those)
```

⛔ The two concerns stay separate. Folding them together would make an
**unconstrained** relation indistinguishable from one whose constraints were
**forgotten**.

⭐ **No private list and NO CAST remain.** `isEdgeKind` is a real type predicate, so
the admitted value *is* an `EdgeKind` — the boundary now says only what it has
actually verified. A compile-time line also proves every participation relation is a
declared relation.

### E-1 … E-5 — 7 further checks, `revision-analyzer3-acceptance.test.ts`

```
E-1   schema relation enum === canonical EDGE_KINDS, identically ordered   PASS
E-2   has_object present in EDGE_KINDS                                     PASS
E-3   a lawful has_object edge is admitted AND SURVIVES into the graph     PASS
E-3b  every canonical relation admits under some lawful geometry           PASS
E-4   participation endpoint constraints still apply; existing != constrained PASS
E-5   no private relation list AND no cast back into the comparator's type PASS
      an unknown relation is still refused — the set did not open          PASS
```

### ⭐ FALSIFIED — three known-bads, each red in the right place

```
has_object removed from EDGE_KINDS                    2 failed   E-2 · E-3
⭐ THE ORIGINAL DEFECT, faithfully reconstructed       3 failed   E-1 · E-2 · E-5
   (private list carrying has_object · EdgeKind without it · cast restored)
participation endpoints silently widened              4 failed   E-4 + V3-2/V3-3
```

⚠️ **E-3 PASSED under the original defect** — the cast made it work at runtime, which
is precisely why a behavioural check alone could never have found this. **E-1 and E-5
are the discriminating obligations**, and they are about the *contract*, not the
behaviour.

⚠️ A first attempt at the reconstruction failed to compile and reported `0 total`.
That is a red, but an **uninformative** one — it proves nothing about discrimination.
Rebuilt so the known-bad actually runs. ⛔ *A suite that cannot compile has not
falsified anything.*

### ⭐ NO `analyzer/4` — the provider-facing surface is PROVEN unchanged

The serialized tool schema and the system prompt were dumped at the previous commit
and at the repair, and **diffed byte-for-byte: identical.** ⛔ Asserted from a diff,
not from reading the diff of the source. The repair changes an internal type/runtime
contract; it changes nothing `analyzer/3` can express, so the version is not spent.

**Gates:** jest `256 passed · 256 total` (10 suites) · typecheck `no regressions`.

⛔ **Standing: edge vocabulary coherence CLOSED · `analyzer/3` contract clean ·
provider witness RELEASED (A-S · C-good · C-large · C-migration · AC-1 · AC-2, owed
against `RC-GEN-01/analyzer/3`) · B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⭐ FOUNDER RULING — edge vocabulary CLOSED · provider witness RELEASED

```
EDGE VOCABULARY       CLOSED at 65c105d79
ANALYZER CONTRACT     /3 CLEAN · analyzer/3 remains the correct version
PROVIDER WITNESS      RELEASED
OWED                  A-S · C-good · C-large · C-migration · AC-1 · AC-2
HELD                  B · A→B→C→D · production
```

### ⭐ THE LAW THE FALSIFICATION ESTABLISHED

> ⛔⛔ **RUNTIME CORRECTNESS IS NOT CONTRACT CORRECTNESS.**

The cast preserved apparently correct behaviour while defeating the type/admission
claim, so **a behavioural-only acceptance regime would have certified the broken
implementation.** The three known-bads are strong because they discriminate different
failure *classes*, not because they turn the suite red:

```
remove has_object from EDGE_KINDS   declaration/schema coherence is enforced
reconstruct the cast defect         the boundary cannot pretend to have verified
widen participation endpoints       vocabulary membership does not grant
                                    semantic admissibility
```

⭐ **And on the `0 total` run:** a compilation failure is evidence that *something*
broke; it does not establish that the intended falsifier discriminates the defect.
**Rebuilding the mutation until the suite actually executes is what makes the evidence
admissible.**

### ⭐ WHY NO `analyzer/4`

Identical serialized tool schema + identical system prompt ⇒ **the provider has been
given no new expressive contract.** What changed is internal declaration truth →
runtime predicate truth → admission truth. A version bump would falsely imply a
provider-contract change that did not occur.

### ⭐⭐ THE A-S ACCEPTANCE CRITERION, SHARPENED BY THE FOUNDER

Not *"does the new ontology work?"* but:

> ⭐ **Can the analyser tolerate an ABSENT relation when the source licenses none?**

```
person ─────X────→ integration
       no licensed participation relation
```

⛔ The lawful answer for A-S is **not a replacement for the removed `agency` field. It
is silence.** If the model emits a participation edge merely because the graph feels
incomplete without one, the architecture has preserved the old epistemic error beneath
a new vocabulary — **A1 in new syntax**, and A-S FAILS.

> ⭐⭐ **The deeper question the provider witness now tests: does the analyser
> represent what the source WARRANTS, or does it complete an ONTOLOGY-SHAPED PICTURE?**
> That is far more consequential than whether `has_object` survives serialization.

⛔ **No further architecture work is justified before that witness.** The next evidence
comes from the real model, through the normal provider path, with
`RC-GEN-01/analyzer/3` visibly printed by the harness.

### ⚠️ HARNESS PROVENANCE DEFECT — REPAIRED BEFORE HANDOVER

`scripts/witness/rc-gen-01/analyzers.ts` printed `subject frozen at a087e3167` as a
**literal**. It went stale three commits later while still announcing itself as the
frozen subject — *an instrument asserting a provenance it was not running*, and it
would have stamped that false SHA onto the v3 witness record.

⭐ The subject is now **read at run time** (`git rev-parse` + `git status --porcelain`),
printed above the credential gate so even a `NOT WITNESSED` run records what it was
pointed at, and **a dirty tree is reported as dirty** — the evidence then attaches to
no commit, which is a fact the ruling needs rather than one to suppress. It caught its
own uncommitted state on the first run. Also: `MAIA_INFERENCE_MODE` set-to-empty now
prints `''` rather than `(unset)`; they are different claims.

## ⛔⛔ A-S ON `analyzer/3` — WITNESSED · FAILED

⚠️ **TWO RUNS ARE IN THE FOUNDER'S TRANSCRIPT AND ONLY ONE IS EVIDENCE.**

```
RUN 1   at 65c105d79 · provider REACHED · 4 real graphs · THIS IS THE EVIDENCE
RUN 2   at be03befcc · 401 authentication_error on every call · evidence of NOTHING
```

⛔ **Run 2's nine failures are MY ERROR, not a finding.** I told the founder to
extract the credential with `head -1`; `.env.local` holds **three** keys and the
valid one is **line 2** — the founder's own earlier extraction used `sed -n '2p'`.

> ⚠️ **AND THE LENGTH CHECK DID NOT CATCH IT.** `${#ANTHROPIC_API_KEY}` printed
> `108`, exactly the expected length, because a *wrong* key is the same length as a
> right one. **The length check rules out the concatenation defect and nothing else.
> It is necessary, not sufficient**, and I presented it as though it were both.

⚠️ **Run 1's provenance line is the STALE LITERAL** (`subject frozen at a087e3167`) —
it ran before the harness repair. Its SHA is established by the `git pull` output
immediately above it (`b9615f1c5..65c105d79`), **not** by the harness. Tree
cleanliness at run 1 is **UNKNOWN and unrecoverable**; run 2 showed the tree carrying
seven untracked scratch entries, all `??`.

### The source, verbatim

> *"The experience facilitated a significant transformation in his relational
> orientation toward the natural world, and the resulting shift in perspective
> constituted a meaningful development in his **ongoing process of integration**."*

⭐ **"his" is POSSESSIVE, not participatory.** The passage does not say he acted in
the integration, and does not say he underwent the transformation — the
transformation is *in his orientation*.

### ⛔ A-S · what A emitted — 8 nodes, and TWO participation edges

```
person --undergoes---------------→ transformation
person --actively_participates_in→ integration
```

⛔ **Both are the predeclared failure.** The rubric, written and frozen before the
run: *"the correct graph carries NO PARTICIPATION EDGE AT ALL … a participation edge
appearing merely to replace the old agency field is A1 in a new syntax, and A-S
FAILS."*

⭐⭐ **AND THE SECOND EDGE IS THE RUN-8/9 DRIFT ITSELF.** `actively_participates_in →
integration` is exactly *"the process of integration he was already engaged in"* —
the invented participation this entire architecture was built to catch. **The source
analyser asserted it.**

### ⭐⭐ THE FINDING THAT MATTERS MOST — THE OVERCOMMIT SURVIVED THE REPAIR

```
analyzer/1   transformation.agency = undergone      (a PROCESS is the subject)
analyzer/3   person --undergoes--> transformation   (the PERSON is the subject)
```

⭐ **The category error is genuinely fixed** — the subject is now the person, and the
endpoint typing makes the v1 shape inadmissible. ⛔ **The OVERCOMMIT is unchanged.**
The dimension moved to where it belongs; the disposition to assert it where the
source commits to nothing did not move at all.

> ⛔⛔ **This partially FALSIFIES the reclassification recorded above.** A1 was
> recorded as *"an analyser overcommit made possible and encouraged by an inadequate
> ontology"* — which predicts that removing the inadequacy would reduce the
> overcommit. **It did not.** A1 is a defect of its own, and the schema repair does
> not touch it. The reclassification's second clause is withdrawn; its first clause
> — that A1 was a real analyser overcommit — is now more strongly evidenced, not
> less.

### ⛔⛔ AND THE OVERCOMMIT CANCELS THE DETECTOR

```
A(source)      person --actively_participates_in--> integration
C-large        person --actively_participates_in--> integration
C-migration    person --actively_participates_in--> integration
```

⛔ **The drift D exists to catch is now present on BOTH sides, so D cannot report it
as added.** An overcommitting source analyser does not merely produce a wrong source
graph — **it silently disarms the comparator for exactly the defect it was built to
find.** The separation architecture assumed A's errors would be independent of B's;
here they coincide, because both are the same model answering the same temptation.

### AC-1 — ONTOLOGY INSTABILITY, per the frozen rubric

```
D(A(source), C(C-good)) = structure_mismatch · node_count source 8 · candidate 7
```

The rubric: *"If A chose N nodes and C chose N +/- 1 … record ANALYZER / ONTOLOGY
INSTABILITY and stop before B."* This is exactly N+1. ⛔ **AC-1 does not pass.**

### AC-2 — NOT EVALUABLE · and it exposes instability in the participation reading

Both second runs were **refused at admission**:

```
A second run   malformed — actively_participates_in cannot have a STATE as its object
C second run   malformed — actively_participates_in cannot have a RELATION as its object
```

⭐ **The endpoint typing worked exactly as ruled — refusing, never normalizing.** That
is V3-2/V3-3/V3-6 firing on live provider output rather than on a fixture.

⛔ **But the consequence is that structural stability CANNOT BE DEMONSTRATED**, and
the reason is itself a finding: **the same passage produced legal participation
endpoints on run 1 and ILLEGAL ones on run 2.** The participation reading is not
merely overcommitted; it is unstable about what kind of thing can even be
participated in.

### Standing after this witness

```
A-S                 ⛔ WITNESSED · FAILED  (predeclared criterion, first read)
C-S                 not ruled — A-S gates it
AC-1                ⛔ ONTOLOGY INSTABILITY per the frozen rubric
AC-2                ⛔ NOT EVALUABLE — both second runs refused at admission
SV-4 repair         HOLDS — category error fixed, endpoint typing enforced live
A1                  ⛔ NOT REMOVED BY THE SCHEMA REPAIR · reclassification amended
B                   HELD
A→B→C→D             HELD
production          UNTOUCHED
```

⛔ **No repair authorized. Reported, not designed around.** The prompt lever was ruled
exhausted nine runs ago for generation; whether it is exhausted for *analysis* is a
founder question, and the answer bears directly on whether a separated-analyser
architecture can work at all when both analysers share the generator's disposition.

## ⭐⭐ FOUNDER RULING ON A-S — A1 SPLIT · CAUSAL CLAUSE WITHDRAWN · SEPARATION ≠ INDEPENDENCE

### ⭐ A1 SPLITS IN TWO, AND ONLY ONE HALF WAS REPAIRED

```
A1a  CATEGORY ERROR          ⭐ FIXED
     analyzer/1   transformation.agency = undergone
     analyzer/3   person --undergoes--> transformation
     The ontology repair genuinely accomplished something.

A1b  EPISTEMIC OVERCOMMIT    ⛔ NOT FIXED
     "his ongoing process of integration"
       -> person --actively_participates_in--> integration
     ⛔ NO LONGER AN ONTOLOGY PROBLEM. An ENTAILMENT DISCIPLINE problem.
```

⛔ **The stronger causal statement is FORMALLY WITHDRAWN.** That ontology inadequacy
was *materially producing* the overcommit predicted that repairing the ontology would
reduce it. It did not. **The evidence no longer supports the clause.**

```
ontology repaired  ->  category placement repaired  ->  unsupported assertion PERSISTS
```

### ⭐⭐⭐ THE SENTENCE TO PRESERVE

> ⛔⛔ **SEPARATION IS NOT INDEPENDENCE.**
>
> A separated analyser does not acquire epistemic independence merely by being
> separated. The same model can carry the same completion pressure through both
> roles.

Empirically, not theoretically:

```
A            person --actively_participates_in--> integration
C-large      person --actively_participates_in--> integration
C-migration  person --actively_participates_in--> integration
```

### ⭐⭐ WHAT D MAY CLAIM — RECLASSIFIED

```
A ≠ C   ->  evidence of DIFFERENTIAL DRIFT
A = C   ->  absence of differential drift
            ⛔ NOT evidence of SOURCE FIDELITY
```

> ⛔ **D IS A DRIFT DETECTOR, NOT A TRUTH DETECTOR.** Agreement between two instances
> of the same disposition cannot function as independent corroboration.

⚠️ This does not make D useless. It bounds what a D admission is allowed to mean, and
it is why proceeding to B now would **manufacture the appearance of corroboration
exactly where there is none.**

### ⭐ AC-2 — THE BOUNDARY WORKED; IT CANNOT REACH THE REAL QUESTION

```
actively_participates_in -> state      REFUSED
actively_participates_in -> relation   REFUSED
```

⭐ Malformed claims refused rather than laundered into legal ones. But two
**independent** dimensions of instability are now visible:

```
1  whether participation is WARRANTED AT ALL     <- the epistemic question
2  what the alleged participation ATTACHES TO    <- the schema question

the schema can police 2.   ⛔ it cannot decide 1.
```

### ⛔ THE PROMPT LEVER IS NOT YET EXHAUSTED FOR ANALYSIS

Generation and analysis are different cognitive tasks — generation constructs a
plausible continuation; analysis can be asked a much narrower question: *what
propositions does this source actually license?* ⛔ **Exhaustion in generation does
not logically establish exhaustion in analysis.**

⭐ **ONE bounded hypothesis, not another nine-run spiral:**

> **Can the analyser distinguish ASSOCIATION WITH a process from PARTICIPATION IN
> that process, while still emitting participation when the source explicitly
> licenses it?**

⛔⛔ **THE TEST MAY NOT MERELY SUPPRESS PARTICIPATION.** Otherwise the easy "fix" is
*never emit a participation edge*, and A-S passes for the wrong reason. The analyser
must demonstrate **SELECTIVITY**, not conservatism:

```
unsupported  ->  ABSTAIN
supported    ->  ASSERT
```

If a bounded analysis-specific instruction cannot produce that discrimination
reliably, the lever is exhausted for analysis too — and the consequence is
architectural: **two analysers sharing one model disposition cannot be treated as
independent epistemic witnesses merely because they occupy separate stages.** Where
independence would then come from (model heterogeneity · an entailment-specific
verifier · evidence-bound admission) is a later decision. ⛔ **A-S does not authorize
designing it now.**

### ⚠️ PROVENANCE, STATED WITHOUT OVERSTATEMENT

```
A-S semantic criterion   ⛔ WITNESSED · FAILED
full run provenance      ⚠️ IMPERFECT
```

Run 1's tree cleanliness is unrecoverable and the harness printed a stale SHA, so it
is **not a pristine reproducibility witness for the release environment**. It **is**
sufficient for the semantic finding: it reached the real provider and produced the
output under test. ⭐ *The missing cleanliness evidence cannot transform those two
edges into source-supported propositions.*

> ⭐⭐ **We repaired the ontology and discovered that the ontology had been masking a
> deeper epistemic behaviour. That is exactly what a good falsification sequence is
> supposed to reveal.**

## ⭐ NEXT ACT — VERIFIER PROBE · BUILT · NOT RUN

**Founder ruling, narrowing twice in one turn.** The first message gave an
evidence-first architecture (proposition extraction → entailment gate → ontology →
graph) and named candidate off-the-shelf verifiers. The second **narrowed it to the
smallest possible falsification**:

```
NOW      simple local falsification      <- this
THEN     evaluation run over a matrix
LATER    MAIA architecture integration
```

> ⛔ *"No graph changes. No MAIA integration. No orchestration."*

### ⚠️ AND I HAD ALREADY BUILT THE THING THAT WAS RULED OUT

Before the narrowing arrived I wrote `lib/manuscript/revision/evidence.ts` — the
evidence/entailment gate, span verification, the promotion rule. ⛔ **That is a graph
change and a MAIA integration.** Moved off the production path to
`docs/programme/held/EVIDENCE_GATE_DRAFT_NOT_AUTHORIZED.ts`, **disclosed rather than
quietly kept**. It is a draft under a ruling that has not been made.

⭐ One observation from writing it is worth keeping, because it bounds what the
evidence step can ever claim: **span verification catches FABRICATED evidence; it does
NOT catch MISJUDGED entailment.** A-S's actual failure survives it — *"his ongoing
process of integration"* is a **real span**, and citing it for
`actively_participates_in` is a true citation of a phrase that does not license the
claim. That is precisely why the entailment judgement needs independence from
somewhere other than prompt role, and why this probe is the right next act.

### THE ONE QUESTION

> **Can an existing verifier reliably tell ASSOCIATED WITH a process from ACTUALLY
> PARTICIPATES IN that process?**

### The instrument — `scripts/verifier-probe/`

`fixtures.json` · `probe.py`. Imports nothing from MAIA. Records exactly the four
fields ruled: source text · proposed edge as a sentence · result/score · expected.

```
13 cases    6 positive (expect entailed)   7 negative (expect not_entailed)

N1 · N2   ⭐ THE ACTUAL A-S FAILURE — verbatim source, and the two edges A emitted
N3        the possessive fragment alone, the minimal form
N4 · N5   independently written association: temporal co-location · being named
N6        explicit denial — a control: a verifier that cannot separate this from
          N1-N5 is answering a coarser question than we need
P1        the founder's explicit control
P2 · P3 · P4  independently written: participation as action · two passive roles
X1 · X2 · X3  ⭐ SV-4 shape, fresh words, ONE premise: "Ravi chaired the first
          hearing and was cross-examined at the second." Both roles must come back
          right, and X3 SWAPS them — every content word licensed, the relation not.
```

### ⛔ Three disciplines built into the instrument

**Label order is read from the model config, never hard-coded.** NLI checkpoints do
not agree on whether index 0 is entailment. A probe that assumed one would report
**the exact opposite finding with no error**. It refuses to report at all if no
entailment label is present.

**The two directions are never summed.** `asserted when licensed` and `abstained when
unlicensed` are printed separately, and zero on the positive side prints a loud
refusal — *blanket refusal is not selectivity, and a perfect negative column then
means nothing*. This is the founder's own trap, enforced mechanically.

**Repeats are checked for stability**, because A-S produced legal participation
endpoints on one run and illegal ones on the next from the same passage.

HHEM's threshold is a **reporting** cut only: every raw score is recorded, so a
different cut can be applied to the same evidence without re-running.

⛔ **NOT RUN. No model weights here, and the probe is local by design — sovereignty,
no external API.** Dry run verified the fixtures load and print; nothing was measured.

```
python3 scripts/verifier-probe/probe.py --dry-run
pip install torch transformers sentencepiece
python3 scripts/verifier-probe/probe.py --model both --repeat 3
```

⚠️ **Check disk first** — the founder's volume was at 98% earlier today. DeBERTa-v3
**large** ~1.7 GB (`--small` swaps to base, ~0.4 GB) · HHEM ~0.5 GB.

⛔ **Standing unchanged: analyzer/3 UNTOUCHED · evidence gate HELD and unauthorized ·
B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⚠️ VERIFIER PROBE — FIRST ATTEMPT · NO RESULT · TWO DEFECTS, BOTH MINE

### ⭐ FOUNDER CORRECTION — `--repeat` WAS THE WRONG INSTRUMENT AND I MISDESCRIBED IT

> *"`--repeat 3` does not really test the same instability you saw in A-S. The
> provider analyzer is generative… DeBERTa/HHEM-style classifiers, when running
> normally in evaluation mode, should generally give the same score for the same
> input. So repeats can confirm deterministic execution, but not meaningful semantic
> robustness. Your N1–N6 / P1–P4 / X1–X3 variations are the real robustness test."*

⛔ **Accepted, and the script said otherwise in writing.** It claimed repeats probe
*"the instability A-S exposed."* They cannot: A-S's instability is generative
sampling, and an NLI classifier in eval mode is deterministic. **Corrected in the
file** — repeats now say what they are (execution determinism), default is 1, and the
fixture variations are named as the robustness test.

### ⛔ SCRIPT DEFECT — ONE VERIFIER'S CRASH DESTROYED THE OTHER'S MEASURED RESULTS

DeBERTa loaded, printed its label map, and **computed every row**. Then HHEM raised on
load and the traceback took the process down **before `report()` ran and before
anything was written**.

> ⛔ **Measured evidence was discarded by an unrelated packaging error.** Repaired:
> each verifier runs isolated, a failure is recorded as `NOT RUN` and printed as
> **ABSENT, not negative**, and whatever did run is still reported and written.

### ⚠️ HHEM — PACKAGING INCOMPATIBILITY, NOT A RESULT

```
transformers 5.17.0
HHEMv2ForSequenceClassification has no attribute 'all_tied_weights_keys'
   (did you mean '_tied_weights_keys'?)
```

HHEM-2.1-Open ships **remote code written against transformers 4.x**. ⛔ **This says
nothing whatever about whether HHEM can make the distinction.** It runs from its own
environment with `transformers<5`.

⚠️ Also logged on load, and worth knowing before any HHEM result is trusted:
`t5.transformer.encoder.embed_tokens.weight | MISSING — newly initialized`.

### ⭐ ONE FACT WAS ESTABLISHED AND IT MATTERS

```
id2label (read from config): {0: 'entailment', 1: 'neutral', 2: 'contradiction'}
```

⭐ The label map was **read, not assumed**, and it is the order the probe would have
guessed — but that is luck, not method. The guard did its job: had this checkpoint
ordered them differently, the probe would still have been right.

### ⛔ THRESHOLD DISCIPLINE, RATIFIED BEFORE ANY NUMBER EXISTS

> *"Do not tune the threshold after seeing these 13 answers just to make them pass.
> Record raw scores first. If a threshold needs changing, that should become a
> separate calibration act with separate material."*

Frozen at `0.5`, and now **stamped into the output file** alongside every raw score,
so a later cut cannot be quietly applied to the same evidence and called the original
finding.

### ⭐ THE QUESTION, AS THE FOUNDER RESTATED IT

> ⭐⭐ **Does an independently trained verifier possess the distinction that our
> generative analyser lacks?**
>
> ⛔ NOT *"should this become MAIA's entailment gate?"* — that is a later question.
>
> **YES** → a credible source of epistemic independence, worth investigating.
> **NO**  → equally useful: an off-the-shelf entailment classifier will not solve
> A1b, **and we learned it without contaminating MAIA.**

### Reading order, frozen before the run

```
negatives N1-N5   must NOT be entailed
N6 denial         ideally CONTRADICTION, not merely low entailment
positives P1-P4   must be entailed
X1 · X2           both licensed roles recognised
X3                role swap REJECTED — every noun and verb occurs in the source
⭐ N3 vs P1        the cleanest central discriminator
```

⛔ **Standing unchanged: no result · evidence gate HELD · B HELD · A→B→C→D HELD ·
production UNTOUCHED.**

## ⭐⭐ VERIFIER PROBE — RUN · BOTH VERIFIERS · READINGS ONLY

`2026-09-11T08:24Z`, founder's machine, two isolated venvs.
`DeBERTa-v3-large-mnli-fever-anli-ling-wanli` (transformers 5.17) ·
`vectara/hallucination_evaluation_model` (transformers 4.57, its own environment).
Raw JSON on the founder's machine: `verifier-probe-20260911T0824{11,44}.json`.
`id2label` read from config: `{0: entailment, 1: neutral, 2: contradiction}`.

```
CASE                 EXPECTED        DeBERTa                 HHEM
N1-AS-ACTIVE         not_entailed    neutral          ok     0.3053   ok
N2-AS-UNDERGO        not_entailed    entailment      MISS    0.8733  MISS
N3-FRAGMENT          not_entailed    neutral          ok     0.3147   ok
N4-ASSOCIATION       not_entailed    neutral          ok     0.1969   ok
N5-MENTION           not_entailed    neutral          ok     0.1830   ok
N6-DENIAL            not_entailed    contradiction    ok     0.0581   ok
P1-EXPLICIT          entailed        entailment       ok     0.8849   ok
P2-DOING             entailed        entailment       ok     0.2475  MISS
P3-UNDERGO           entailed        entailment       ok     0.7675   ok
P4-UNDERGO-2         entailed        entailment       ok     0.8195   ok
X1-MIXED-ACTIVE      entailed        entailment       ok     0.2528  MISS
X2-MIXED-UNDERGO     entailed        entailment       ok     0.8931   ok
X3-MIXED-WRONG-WAY   not_entailed    contradiction    ok     0.0762   ok

                     DeBERTa   asserted 6/6   abstained 6/7
                     HHEM      asserted 4/6   abstained 6/7
```

### ⭐ N3 vs P1 — THE CENTRAL DISCRIMINATOR · BOTH SPLIT IT

```
N3  "his ongoing process of integration"        -> participates
      DeBERTa  neutral        HHEM  0.3147
P1  "He actively participated in the integration process."  -> participates
      DeBERTa  entailment     HHEM  0.8849         margin 0.5702
```

### ⭐⭐ N1 — THE EXACT EDGE THE ANALYSER EMITTED · BOTH REJECT IT

Both verifiers, given the real source sentence and the real hypothesis A asserted,
return **not entailed**. ⭐ **On the precise case where the generative analyser
overcommitted, two independently trained models do not.**

### ⭐ THE TWO HARDEST NEGATIVES, AND BOTH ARE CATEGORICAL, NOT MARGINAL

```
N6  explicit denial   DeBERTa CONTRADICTION   HHEM 0.0581  (lowest of all 13)
X3  role swap         DeBERTa CONTRADICTION   HHEM 0.0762
```

⭐ X3 is the case where **every noun and verb occurs in the source and only the
relation is wrong.** Both reject it decisively, and DeBERTa reaches for
`contradiction` rather than `neutral` on both — the founder's stated ideal for N6,
met, and met on X3 as well.

### ⚠️ HHEM'S THREE MISSES ARE A PATTERN, NOT A TALLY

```
P2  "She ran every trial in the study herself"  -> participates in the study   0.2475
X1  "Ravi chaired the first hearing"            -> participates in the hearing 0.2528
```

⚠️ **Both are ACTIVE participation requiring one short inferential step, and HHEM
scores them like negatives** — in the same band as N1 (0.3053) and N3 (0.3147), which
are the cases it is supposed to reject. ⛔ **It does not separate "did the work" from
"was merely nearby".** Its passive/undergo cases (P3 0.7675 · P4 0.8195 · X2 0.8931)
are strong. DeBERTa takes all four.

⚠️ HHEM's load also reported `t5.transformer.encoder.embed_tokens.weight | MISSING —
newly initialized`, on both attempts. ⛔ Its numbers are recorded **with that
qualification attached**, not laundered into a clean comparison.

### ⛔⛔ N2 — THE SHARED MISS, AND IT MAY BE THE FIXTURE, NOT THE VERIFIERS

```
SOURCE      "...facilitated a significant transformation in his relational orientation..."
HYPOTHESIS  "He undergoes the transformation."
EXPECTED    not_entailed
DeBERTa     entailment      HHEM  0.8733
```

⭐ **Two models with different architectures, different training tasks and different
training data agree confidently — and disagree with my frozen expectation.** Where
they disagree with each other elsewhere, here they do not.

⛔ **I am not resolving this, and I am specifically not editing the fixture.** Two
readings are open and they are not equivalent:

```
(a) both verifiers share a blind spot on "a transformation IN his X" -> "he undergoes it"
(b) ordinary English does license it, and the frozen expectation is wrong
```

⛔⛔ **Changing N2's expected value after seeing two models disagree with it is
tuning the test to the answer — the same act the threshold discipline forbids,
performed on the fixture instead of the cut.** If the expectation moves, it moves by a
founder ruling on the semantics, recorded as its own act, and the original
expectation stays visible in the record.

⚠️ Note the asymmetry that makes this live rather than academic: **the founder's A-S
rubric ruled BOTH edges unlicensed**, `undergoes` included. So a ruling for (b) would
narrow the A-S finding to the `actively_participates_in` edge alone — **it would not
overturn A-S**, because N1 fails independently and both verifiers agree it does.

### ⛔ WHAT THIS PROBE DOES NOT ESTABLISH

```
13 cases, written by me, AFTER seeing A-S fail.
General English, not MAIA's prose, not a Work, not a real revision.
repeat=1 — no determinism data, and per the founder's correction none was needed.
```

⛔ **It is not a performance claim, not a benchmark, and not a decision that either
model becomes MAIA's gate.** It answers exactly the question that was asked:

> ⭐⭐ **Does an independently trained verifier possess the distinction that our
> generative analyser lacks?**
>
> On the central discriminator (N3 vs P1), on the actual failure (N1), and on the
> hardest negative (X3): **DeBERTa does, on all thirteen but the shared N2. HHEM does
> on the negatives and is weak on inferred active participation.**

⛔ **Standing unchanged: no MAIA integration · evidence gate HELD · analyzer/3
UNTOUCHED · B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⭐⭐ FOUNDER RULING — HYPOTHESIS SUPPORTED · N2 WITHDRAWN · A-S NARROWED TO N1

```
SPECIALIZED VERIFICATION HYPOTHESIS    SUPPORTED
DeBERTa CANDIDACY                      PROVISIONAL
HHEM                                   INTERESTING · NOT CLEAN ENOUGH YET
N2 NEGATIVE EXPECTATION                WITHDRAWN
A-S FAILURE                            NARROWED TO N1
EVIDENCE GATE                          HELD
MAIA INTEGRATION                       NOT AUTHORIZED
B                                      HELD
PRODUCTION                             UNTOUCHED
```

### ⭐ N2 — ADJUDICATED, ORIGINAL PRESERVED

```
N2 original expectation   NOT ENTAILED
N2 adjudication           EXPECTATION WITHDRAWN
New ruling                ENTAILED
Reason                    the transformation is explicitly predicated of an ASPECT
                          of the person, and `undergoes` carries NO active-agency
                          commitment
```

Written into `fixtures.json` as `expected_original` beside the new `expected`, with
the reasoning inline. ⛔ **Not erased.**

> ⭐ *"This isn't changing the answer so the model passes. It's discovering that the
> fixture itself conflated undergoing change with actively participating in a
> process."*

### ⭐⭐ THE FINDING THAT REORGANISES THE LANE

> **`undergoes` and `participates` were never the same epistemic problem. The probe
> separated them.**

A-S reread under the ruling:

```
person --undergoes---------------> transformation    ⭐ LICENSED
person --actively_participates_in-> integration      ⛔ UNLICENSED
```

⛔ **A-S still FAILS — but for ONE precise reason rather than two**, and the reason is
named: *possessive process → active participation*. ⭐ The ontology repair fixed the
category error **and produced one legitimate relation**. What remained broken was the
unsupported leap, and only that.

### Recalculated under the ruling

```
                         DeBERTa       HHEM
licensed assertions         7/7          5/7
unlicensed abstentions      6/6          6/6
```

⛔ **13/13 on this probe is not a benchmark and not proof.** It is enough to justify
further falsification and nothing more.

## ⭐ BLIND VALIDATION SET — FROZEN · NOT RUN

`scripts/verifier-probe/fixtures-blind.json` · **22 cases · 10 families**

```
sha256  a8fc9a92f428c9af05a65e054c3519aac829fe81108562d162d60fa2e4a1cb3e
```

⭐ **The hash is printed by the probe on every run and written into every output
file.** A frozen set that cannot be shown to be the set that ran is not frozen — it is
merely asserted to be.

⛔ **NOT DERIVED FROM A-S.** No person, domain, sentence or fixture word from the
source, the candidates, or the A-S-derived probe appears in it.

### ⭐ EVERY FAMILY CARRIES BOTH DIRECTIONS — the anti-conservatism structure, per family

```
possession-vs-participation                +1 -2      observing-vs-participating       +1 -1
undergoing-vs-causing                      +1 -1      affected-by-vs-acting-upon       +1 -1
association-vs-membership                  +1 -1      explicit-role-vs-inferred-role   +1 -1
property-change-vs-person-participation    +1 -1      swapped-subject-object           +1 -1
negation                                   +1 -1      temporality                      +1 -2
                                                      TOTAL  10 licensed · 12 unlicensed
```

⛔ **A family is only carried when BOTH directions are right**, and the probe now
reports per family. A global tally hid exactly this: **HHEM's three misses were one
pattern, not three accidents** — inferred active participation — and a column of
totals said nothing about it.

### The cases that decide it

```
B11 · B12   ⭐ THE RULING ITSELF, on material A-S never touched. One premise —
            "The accident changed his handwriting permanently." — asked both ways:
            "His handwriting undergoes a change."      LICENSED
            "He actively participates in the change."  UNLICENSED
B15 · B16   role swap: every content word licensed, only the assignment wrong
B13         HHEM's known weak spot on fresh material (role stated as a job title)
B18         ⭐ negation AND assertion in one sentence — "declined to sit on the board
            but agreed to advise it". A verifier that lets the refusal suppress the
            whole sentence fails here, and a conservative one cannot hide.
B21         ceased participation: past premise, present hypothesis
B22         a process as participant in its own product — the v1 category error, in a
            family with nothing to do with A-S
```

### To run

```
source ~/verifier-probe-venv/bin/activate
export HF_HOME=~/verifier-probe-models
python3 scripts/verifier-probe/probe.py --set blind --model deberta
```

⛔ **DeBERTa UNTOUCHED — no threshold change, no prompt, no fixture edit after
seeing any result.** HHEM optionally afterwards from `~/hhem-venv`, still qualified by
its `embed_tokens | MISSING` load warning.

⛔ **Standing: blind set FROZEN and NOT RUN · evidence gate HELD · analyzer/3
UNTOUCHED · B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⭐⭐ BLIND VALIDATION — RUN · DeBERTa 20/22 · HHEM 14/22 · READINGS ONLY

`2026-09-11T08:39Z` · set `blind` · fixtures sha256
`a8fc9a92f428c9af05a65e054c3519aac829fe81108562d162d60fa2e4a1cb3e` — **verified by
the founder with `shasum` before the run AND printed by the probe in its own header.**
⭐ The set that ran is provably the set that was frozen.

```
                       DeBERTa            HHEM
licensed assertions     10/10              7/10
unlicensed abstentions  10/12              7/12
FAMILIES CARRIED         8/10              3/10
```

### ⭐ DETERMINISM — SETTLED EMPIRICALLY, NOT ASSUMED

DeBERTa was run **twice, identically**: `…083924.json` and `…083939.json`, **every
case identical, every label identical**. ⭐ The founder's correction is confirmed on
this material: an NLI classifier in eval mode is deterministic, and repeats are not a
robustness test. ⛔ *The fixture variations are.*

### ⭐⭐ DeBERTa — 8 OF 10 FAMILIES CARRIED, AND THE TWO MISSES ARE ONE PATTERN

```
ok    affected-by-vs-acting-upon            ok    observing-vs-participating
MISS  association-vs-membership             ok    possession-vs-participation
ok    explicit-role-vs-inferred-role        ok    property-change-vs-person-participation
ok    negation                              ok    swapped-subject-object
MISS  temporality                           ok    undergoing-vs-causing
```

```
B05  "He has recorded with the quartet three times."
     -> "He is a member of the quartet."          expected not_entailed · got ENTAILMENT
B21  "He rowed with the crew until his injury in March."
     -> "He rows with the crew."                  expected not_entailed · got ENTAILMENT
```

⭐⭐ **BOTH MISSES ARE THE SAME ERROR: A BOUNDED RELATION UPGRADED TO AN UNBOUNDED
ONE.** B05 takes partial association to full membership; B21 takes past participation
to present participation. ⛔ **It is not two accidental gaps — it is one disposition**,
and it is precisely the disposition that would let a stale or over-scoped claim
survive a gate. The per-family report is what made it visible; a `20/22` would not
have.

### ⭐ AND THE POSITIVE COLUMN IS PERFECT — conservatism is ruled out

`10/10` licensed. ⛔ **DeBERTa cannot be passing the negatives by abstaining**, which
was the trap the whole design guards. On the two decisive pairs it splits cleanly:

```
B11  "His handwriting undergoes a change."        ENTAILMENT      ⭐ the N2 ruling
B12  "He actively participates in the change."    CONTRADICTION   ⭐ the N1 failure
     — same premise, opposite verdicts, on material A-S never touched

B15  "The inspector undergoes questioning."       CONTRADICTION   role swap rejected
B16  "The foreman undergoes questioning."         ENTAILMENT      same premise
B18  "declined to sit on the board but agreed to advise it" -> advises  ENTAILMENT
     ⭐ negation did not suppress the assertion beside it
```

⚠️ **One characteristic to note before anyone builds on it:** DeBERTa reached
`contradiction` for **7 of its 10 correct negatives**, B12 among them. For B12,
`neutral` is arguably the truer label — the premise does not deny his participation,
it simply does not assert it. ⛔ **The verdict is right and the strength is arguably
over-strong**, which matters if a gate were ever to read `contradiction` as *"the
candidate asserts the opposite"*. Recorded now, before it can be relied on.

### ⛔⛔ HHEM — 3 OF 10 FAMILIES · AND THE A-S SET WAS FLATTERING IT

```
                  A-S-derived        blind
HHEM                10/13 (77%)     14/22 (64%)     families 3/10
DeBERTa             12/13 (92%)     20/22 (91%)     families 8/10
```

⭐⭐ **DeBERTa holds its rate on blind material; HHEM drops.** That is direct evidence
that the first probe's fixtures — **written by me, after seeing A-S fail** — were
easier than they should have been, and that the blind set was worth building.

⛔ **HHEM's blind misses are in the epistemically decisive families**, at confident
scores:

```
B15  role swap, "The inspector undergoes questioning."      0.8769  ENTAILED
B21  ceased participation -> present tense                  0.9167  ENTAILED
B05  collaboration -> membership                            0.8648  ENTAILED
B19  "will join next spring" -> is a member                  0.8022  ENTAILED
B03  the causer as patient                                  0.5392  ENTAILED
```

⚠️ And a fragility worth naming: **B09 scored `0.4983`** — correct by **0.0017**
against the frozen `0.5` cut. ⛔ **The threshold is NOT being moved**, per the ruling;
the margin is recorded as a property of the instrument, not repaired into one.

⛔ Every HHEM number still carries its load warning:
`t5.transformer.encoder.embed_tokens.weight | MISSING — newly initialized`.

### ⛔ WHAT THE BLIND RUN DOES AND DOES NOT ESTABLISH

⭐ **It establishes that the distinction survives material it was not built from.**
The B11/B12 pair reproduces the exact A-S reading — *undergoing a change* licensed,
*actively participating in it* not — in a domain, with a person and a premise that
have nothing to do with the source.

⛔ **It does not establish** that DeBERTa is ready to gate MAIA's prose. 22 English
sentences are not a Work. And the two misses are a real, named disposition, not noise.

> ⭐ **The finding, stated exactly:** an independently trained verifier holds the
> distinction the generative analyser lacked, **across blind material, in 8 of 10
> distinction families, with a perfect licensed column** — and its failures are
> concentrated in one describable behaviour: **bounded → unbounded**.

⛔ **Standing: no ruling taken · no fixture edited · no threshold moved · evidence gate
HELD · analyzer/3 UNTOUCHED · B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⭐⭐ FOUNDER RULING — HYPOTHESIS SUPPORTED · DeBERTa PROVISIONAL LEAD · HHEM DROPPED

```
SPECIALIZED VERIFIER HYPOTHESIS     SUPPORTED
DeBERTa                              PROVISIONAL LEAD · NOT GATE-READY
HHEM                                 NOT SUITABLE AS PRIMARY
BLIND GENERALIZATION                 8/10 FAMILIES
LICENSED-CLAIM RECALL                10/10
KNOWN GAP                            BOUNDED -> UNBOUNDED DRIFT
EVIDENCE GATE                        HELD
ANALYZER/3                           UNTOUCHED
B                                    HELD
PRODUCTION                           UNTOUCHED
```

⭐ **The `undergoes` / `participates` distinction is now INDEPENDENTLY SUPPORTED** —
B11/B12 reproduced it outside the original domain, so the N2 adjudication stands on
more than one reading.

### ⭐⭐ THE DEFECT HAS A NAME — `BOUNDED -> UNBOUNDED ENTAILMENT DRIFT`

> **The model correctly understands the basic relation and silently widens its scope.**

```
recorded with quartet three times     ≠  is a member of quartet
rowed with crew until injury          ≠  rows with crew
```

⛔ **Why this is the dangerous failure for MAIA specifically:** it is corrosive rather
than dramatic. Each widening is small and no single reading looks wrong.

```
past           -> present
sometimes      -> generally
participated   -> member
temporary      -> enduring
one instance   -> stable property
```

⛔ **In a long-lived semantic graph these accumulate silently.** A claim that was true
of a moment becomes a standing fact about a person, and nothing in the record says
when it widened.

### ⛔⛔ IMPLEMENTATION LAW — `contradiction` IS A DIAGNOSTIC, NEVER A SEMANTIC CLAIM

```
THE VERDICT      ENTAILED   vs   NOT ENTAILED
RECORDED ONLY    neutral    ·    contradiction
```

⛔ **Neither may ever be read as "the source explicitly says the opposite."** Blind
B12 is the demonstration: DeBERTa returned `contradiction` where the premise does not
deny the claim at all — it simply does not assert it. It returned `contradiction` for
**7 of its 10 correct negatives**, so the label is not tracking denial.

⭐ **Written into `probe.py` at the line that computes the verdict**, with the reason,
so a later reader cannot "improve" it into a distinction the model is not making.

## ⭐ SCOPE FALSIFICATION SET — FROZEN · NOT RUN

`scripts/verifier-probe/fixtures-scope.json` · **22 cases · 10 families**

```
sha256  51e10d22e41f9570016f25c9b1568dfb1b520db2b516202c4914290a82b78252
```

⛔ **This is not a general accuracy set.** It is built to break DeBERTa **at its
characterized boundary**, on fresh material. ⭐ *That is the difference between "91%
accuracy" and a known epistemic limit tested directly.*

```
past-to-present               +1 -2      intention-to-action           +1 -1
occasional-to-habitual        +1 -1      future-to-present             +1 -1
participation-to-membership   +1 -2      capability-to-behaviour       +1 -1
temporary-to-permanent        +1 -1      association-to-identity       +1 -1
some-to-all                   +1 -1      one-event-to-enduring-trait   +1 -1
                                         TOTAL  10 licensed · 12 unlicensed
```

⭐ **The two CONFIRMED gaps carry an extra negative each** — `past-to-present` and
`participation-to-membership` — including a harder second case in both:

```
S03  "Bea served on the lifeboat for a decade before moving inland."
     long duration, so the past reads substantial and the cessation is subordinate
S08  "The catalogue lists her among the contributors to the atlas." -> editor
     a REAL recorded role widened to a different and larger one
```

⛔ **Every family still carries both directions**, so conservatism cannot pass: a
verifier that answers `not_entailed` to everything fails all ten licensed cases.

⚠️ **No content-domain overlap with either earlier set** — checked mechanically. The
only shared words are temporal and quantitative (`until`, `since`, `every`, `three`,
`years`), which is unavoidable given what the set is about.

### To run

```
source ~/verifier-probe-venv/bin/activate
export HF_HOME=~/verifier-probe-models
python3 scripts/verifier-probe/probe.py --set scope --model deberta
```

⛔ **DeBERTa untouched. No threshold, no prompt, no fixture edit after any result.**
HHEM is dropped as primary and needs no run here; if it is run at all it is a
curiosity, not a comparison.

⛔ **Standing: scope set FROZEN and NOT RUN · evidence gate HELD · analyzer/3
UNTOUCHED · B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⭐⭐ SCOPE FALSIFICATION — RUN · DeBERTa 19/22 · THE DEFECT IS NARROWER THAN ITS NAME

`2026-09-11T08:45Z` · set `scope` · fixtures sha256
`51e10d22e41f9570016f25c9b1568dfb1b520db2b516202c4914290a82b78252` — **verified by the
founder with `shasum` before the run and printed back by the probe.**

```
licensed assertions     10/10
unlicensed abstentions   9/12
FAMILIES CARRIED          8/10
```

### ⛔ THE THREE MISSES

```
S01  "Imre managed the bakery until it closed in 2019."
     -> "Imre manages the bakery."                          ENTAILMENT
S03  "Bea served on the lifeboat for a decade before moving inland."
     -> "Bea serves on the lifeboat."                        ENTAILMENT
S04  "Dara has covered the night shift twice this year."
     -> "Dara works the night shift."                        ENTAILMENT
```

```
MISS  past-to-present            0/2   ⛔ BOTH negatives, including the harder one
MISS  occasional-to-habitual     0/1   ⚠️ NEW — did not appear on the blind set
ok    participation-to-membership 2/2  ⭐ INCLUDING the hard case built to break it
ok    temporary-to-permanent · some-to-all · one-event-to-enduring-trait
ok    intention-to-action · future-to-present · capability-to-behaviour
ok    association-to-identity
```

### ⭐⭐ THE HEADLINE IS NOT THE COUNT — IT IS THAT `BOUNDED -> UNBOUNDED` IS TOO BROAD A NAME

`8/10` families both times, but **a different eight.**

```
                              blind        scope
participation-to-membership   MISS         ⭐ ok  2/2   (incl. the harder S08)
past-to-present               MISS 1/2     ⛔ MISS 0/2
occasional-to-habitual        (not tested) ⚠️ MISS 0/1
```

⭐ **`participation-to-membership` REPAIRED ITSELF on fresh material**, and on the
case built specifically to break it: **S08** — *"The catalogue lists her among the
contributors to the atlas."* → *"She is one of the atlas's editors."* — returned
`neutral`, correctly, where a **real recorded role** is widened into a larger one.

⛔ **So blind B05 was CASE-SPECIFIC, not family-wide.** A verifier that failed
membership-widening as a class would have failed S06 and S08 too. It did not.

### ⭐⭐⭐ ALL FIVE MISSES ACROSS ALL THREE SETS SHARE ONE SHAPE

```
B05  "has recorded with the quartet  three times"
B21  "rowed with the crew            until his injury in March"
S01  "managed the bakery             until it closed in 2019"
S03  "served on the lifeboat         before moving inland"
S04  "has covered the night shift    twice this year"
```

> ⭐⭐ **THE RELATION IS ASSERTED IN THE MAIN CLAUSE AND THE LIMIT IS CARRIED BY A
> SATELLITE MODIFIER — `until` · `before` · `twice` · `three times` — AND THE MODIFIER
> IS NOT CARRIED INTO THE HYPOTHESIS.**

⭐ **And the boundaries it DOES respect are the ones carried by the main verb itself:**

```
S15  "intends to repaint"     modal in the main verb        ok  (not_entailed)
S17  "will take delivery"     modal in the main verb        ok  (contradiction)
S19  "can read Old Norse"     modal in the main verb        ok  (neutral)
S09  "is covering ... while"  the relation IS the stand-in  ok  (contradiction)
S11  "Several of the ..."     quantifier on the subject     ok  (neutral)
```

⛔ **That is a much more useful finding than "it widens scope."** The failure is not
about scope in general — it is about **where in the sentence the boundary lives.** A
limit expressed as the verb's own modality survives; a limit appended to an asserted
relation is dropped.

⚠️ **B05 is the one that does not fit cleanly:** it widens the RELATION as well as the
scope (`recorded with` → `is a member of`), so it is frequency-bounded **and**
relation-widened. Recorded as a partial fit, not folded in to make the pattern
tidier.

### ⭐ THE POSITIVE COLUMN IS NOW PERFECT ACROSS THREE INDEPENDENT SETS

```
as-derived (post-adjudication)   7/7 licensed    6/6 unlicensed    13/13
blind                           10/10 licensed  10/12 unlicensed   20/22
scope                           10/10 licensed   9/12 unlicensed   19/22
                          ⭐    27/27 licensed  25/30 unlicensed
```

⛔ **27 licensed claims, 27 asserted, across three sets two of which were built to
break it.** Conservatism is not merely unlikely — it is ruled out three times over.
⭐ **And every one of the five misses is in the same direction: it asserts where it
should abstain. It has never once refused a claim the source licensed.**

⚠️ For a gate, that asymmetry is the whole safety question and it points the wrong
way: **this verifier's errors are permissive, not restrictive.** A permissive
verifier admits an unsupported claim; a restrictive one only loses a supported one.
⛔ Recorded as the property that any integration ruling has to price in.

### ⛔ WHAT THIS RUN DOES NOT SETTLE

⛔ It does not establish that the modifier reading is the mechanism — it is a
description of five cases, consistent across three sets, and **not itself falsified**.
A set built around that shape specifically would be the test, and it has not been run.

⛔ Standing: **no ruling taken · no fixture edited · no threshold moved · evidence gate
HELD · analyzer/3 UNTOUCHED · B HELD · A→B→C→D HELD · production UNTOUCHED.**

## ⭐⭐ THE RESEARCH PROGRAMME OPENS — THREE ACTS AUTHORIZED, NOT TWELVE

> ⭐ **What this is really about:** how an intelligent system distinguishes **meaning
> from warrant** — not *"what does this seem to mean?"* but *"what am I entitled to
> treat as true?"*

Twelve directions named; **three authorized now**, deliberately:

```
1  MODIFIER-BOUNDARY FALSIFICATION   ⭐ BUILT · FROZEN · NOT RUN
2  MiniCheck CHALLENGER              ⭐ WIRED · NOT RUN
3  INLI — explicit vs implied        ⛔ OPENED · NO WORK DONE (reading, not code)
```

⛔ **Act 1 comes before anything architectural** — *it tells us exactly what kind of
verifier we actually have.*

### ⭐ ACT 1 — MINIMAL PAIRS · `fixtures-modifier.json` · 24 cases · 8 triples

```
sha256  99ce2dda3a050c52f016e62ed6c78765452ae142e70fe5e1f322032908dbbb50
```

⛔ **This set measures nothing. It exists to FALSIFY one sentence.** In each triple the
**same subject, same relation and same hypothesis** appear three times, differing only
in **where the limitation lives**:

```
M  satellite modifier   "Odile ran the tailor's shop UNTIL the lease ended."
V  main verb            "Odile NO LONGER RUNS the tailor's shop."
P  licensed control     "Odile took over the shop in 2014 and RUNS IT STILL."
                        -> all three ask: "Odile runs the tailor's shop."
```

⭐ **The prediction is IN the frozen file**, with the falsification conditions:

```
hypothesis survives    M fails materially more than V, and P is near-perfect
refuted NARROW         M and V both pass — the five earlier misses need another cause
refuted BROAD          M and V both fail — the encoding is irrelevant, it is
                       cessation in general
UNREADABLE             P fails — the verifier went conservative and NO negative
                       column means anything
```

⛔ **A hypothesis recorded only after seeing the result is not a hypothesis.** The
probe prints the M/V/P comparison and refuses to read the negatives at all when P is
imperfect.

⭐ **P deliberately carries modifiers too** (`in 2014`, `still`, `on Wednesdays`) — so
a verifier cannot pass by treating *any* modifier as a refusal signal. ⭐ **M5 is the
weakest signal in the group on purpose** (`maintained the mountain hut in 2019` — a
bare past date), so the set has internal gradation rather than eight copies of `until`.

### ⭐ ACT 2 — MiniCheck WIRED · `--model minicheck` · `--model all`

MiniCheck-Flan-T5-Large: trained for **grounded fact checking** — *is this claim
supported by this document?* — rather than generic NLI. Different task, different
training data, different architecture family.

> ⛔⛔ **THE POINT IS NOT A BETTER SCORE. IT IS ERROR INDEPENDENCE.**
> *Two models that fail on the same examples are one epistemic witness wearing two
> shirts.*

⭐ So the probe now prints an **ERROR CORRELATION** block whenever more than one
verifier runs: each verifier's miss set, then **shared / only-A / only-B** for every
pair. ⛔ **A challenger with a better total and identical failures has added nothing**,
and the totals would hide that.

⭐ It runs **the exact frozen corpora, unchanged, by their recorded hashes.** A
challenger evaluated on different material answers a different question.

⚠️ **THE MiniCheck API IS NOT VERIFIED FROM THIS ENVIRONMENT** — written against the
published interface and never executed here. ⛔ If the call shape is wrong it reports
as `NOT RUN`, every other verifier still reports (the isolation repair), and **a
first-run failure is a packaging fact, NOT a result about MiniCheck.** It must not be
recorded as one. `pip install minicheck` in its own venv.

### ⛔ ACT 3 — INLI: OPENED, NO WORK DONE

The `EXPLICITLY STATED · IMPLIED · INTERPRETATION · UNSUPPORTED · CONTRADICTED`
vocabulary is the sleeper finding — *a way out of the false choice between a
literal-minded MAIA and an imaginative one.* ⛔ **I have written nothing about INLI**:
I cannot read the dataset from here, and a summary composed from memory would be
exactly the overcommit this lane exists to catch. **Recorded as the open lane it is.**

### ⚠️ AND A DEFECT OF MINE, IN THE INSTRUMENT, THIS TURN

Adding the `group` field I ran one edit twice against the same first occurrence,
producing `group=` **as a repeated keyword argument** — `SyntaxError`, caught
immediately by the parse check. ⚠️ Worth recording because it is the **fourth**
time a mechanical edit in this lane has broken a harness, and each time the guard
caught it rather than a run. ⭐ *The guards are load-bearing, not ceremonial.*

### To run

```
python3 scripts/verifier-probe/probe.py --set modifier --model deberta
```

⛔ DeBERTa untouched. Read the **M vs V** line, and read it **only if P is 8/8**.

⛔ **Standing: modifier set FROZEN and NOT RUN · MiniCheck WIRED and NOT RUN · INLI
OPENED · evidence gate HELD · analyzer/3 UNTOUCHED · B HELD · A→B→C→D HELD ·
production UNTOUCHED.**

## ⭐⭐ MODIFIER-BOUNDARY RUN · M 1/8 · V 7/8 · P 8/8 — AND MY SET IS CONFOUNDED

`2026-09-11T08:58Z` · set `modifier` · sha256 `99ce2dda…` verified before the run and
printed back by the probe.

```
M  satellite modifier   1/8      ⛔ 7 of 8 returned ENTAILMENT
V  main verb            7/8      ⭐ 6 of 7 correct returned CONTRADICTION
P  licensed control     8/8      ⭐ readable — conservatism ruled out
```

⭐ **P 8/8 matters more than it looks.** Every licensed control carries a modifier of
its own — `in 2014 … still`, `on the morning crossing`, `in every fixture`, `weekly`,
`through each winter`, `each Friday`, `at every concert`, `on Wednesdays`. ⛔ **So the
failure is NOT "any modifier triggers refusal", and it is not "any modifier is
ignored" either.** It is specific to a *limiting* modifier.

### ⛔⛔ THE HEADLINE OVERSTATES THE CASE, AND THE FAULT IS MINE

⛔ **I called these minimal pairs. Only three of the eight are.** A minimal pair
requires M and V to express **the same limitation** two ways. They do not:

```
T1  "ran ... until the lease ended"        / "no longer runs"          ⭐ MATCHED
T2  "piloted ... before moving inland"     / "has retired from"        ⭐ MATCHED
T8  "taught ... before the funding was cut"/ "left"                    ⭐ MATCHED

T4  "kept bees during the trial period"    / "stopped keeping"         ~ near
T5  "maintained ... in 2019"               / "resigned as keeper"      ~ near
T7  "conducted ... on Tuesday"             / "used to conduct"         ~ near

T3  "played twice last season"             / "gave up playing"         ⛔ NOT MATCHED
T6  "printed ... three times"              / "ceased printing"         ⛔ NOT MATCHED
```

⛔ **T3 and T6 pit a FREQUENCY inference against an explicit CESSATION verb** — a
harder task against an easier one. That is not the hypothesis being tested; it is a
difficulty gradient wearing the hypothesis's clothes.

### ⭐ ON THE THREE STRICTLY MATCHED TRIPLES, THE GAP LARGELY DISAPPEARS

```
T1   M ok  (contradiction)   V ok  (contradiction)
T2   M MISS                  V MISS      ⛔ BOTH fail — the counterexample in the set
T8   M MISS                  V ok  (neutral)

                 M 1/3        V 2/3      ⛔ one case of difference, at n=3
```

⛔ **That is not material, and I will not present the 1/8 vs 7/8 as though it were.**
⚠️ **V2 is the sharpest single fact here:** *"Petr has retired from piloting the river
ferry."* → `ENTAILMENT`. A cessation stated in the main verb, in the clearest possible
terms, read as licensing the present tense. ⛔ **The hypothesis predicted V would be
safe. On T2 it was not.**

### ⭐⭐ WHAT THE RUN DOES ESTABLISH — TWO FINDINGS, SEPARATED

**(a) EXPLICIT CESSATION IN THE MAIN VERB IS HANDLED WELL.** `no longer` · `gave up` ·
`stopped` · `resigned as` · `ceased` · `used to` · `left` — **7/8, six of them as
`contradiction`.** Not merely failing to find entailment: actively finding
incompatibility.

**(b) ⛔ A BOUNDED PAST EVENT DOES NOT BLOCK PRESENT-TENSE GENERALISATION.** 7 of 8 M
cases returned **`entailment`** — the model affirmatively concluded the present-tense
claim follows.

```
"Hana played for the cricket side twice last season."
        -> "Hana plays for the cricket side."            ENTAILMENT
"Sunniva printed the town's broadsheet three times."
        -> "Sunniva prints the town's broadsheet."       ENTAILMENT
"Tamás conducted the town band on Tuesday."
        -> "Tamás conducts the town band."               ENTAILMENT
```

⭐⭐ **This is stronger than "it drops a modifier."** It is generalising a bounded past
occurrence into a standing present property — **exactly the operation that would turn
"she attended the group twice" into "she belongs to the group"** in a memory that
persists. ⛔ **And it holds independently of whether my M/V pairing was fair**, because
it is a property of the M cases alone.

### ⛔ WHAT IS NOT SETTLED

⛔ **Whether the encoding of the boundary is the cause remains OPEN.** The matched
subset is 3 triples and splits 1/3 vs 2/3. The frozen prediction's "survives"
condition is met on the headline and **NOT met on the only cases that could test it
cleanly.**

⛔ **I am not re-scoring the set, not dropping T3/T6, and not re-framing the prediction
after the fact.** The set ran as frozen and the result stands as recorded. The design
flaw is mine and is recorded beside it.

⭐ **What a repaired set would need:** every M expressing *exactly* the limitation its
V expresses — cessation only, no frequency, no bare dates — and enough triples that
`n` can carry a conclusion. ⛔ **Not built. Not authorized.**

### ⚠️ AND ONE MORE TIME, THE LABEL CAUTION EARNS ITSELF

V returned `contradiction` six times for *"no longer runs"*-type premises, where the
premise genuinely **is** incompatible with the hypothesis — so here the label is apt.
⛔ **That does not license reading `contradiction` as denial in general**; blind B12
returned it where the premise merely failed to assert. ⭐ *The same label is doing two
different jobs, which is precisely why the verdict stays binary.*

⛔ **Standing: no ruling taken · no fixture edited · no threshold moved · MiniCheck
NOT RUN · INLI OPENED · evidence gate HELD · analyzer/3 UNTOUCHED · B HELD ·
production UNTOUCHED.**

## ⭐⭐ FOUNDER RULING — SATELLITE-BOUNDARY LOSS · AND THE DETERMINISTIC LAYER, MEASURED

```
MODIFIER-BOUNDARY EFFECT   SUPPORTED · MATERIAL
M satellite boundaries     1/8      V predicate boundaries  7/8
P licensed controls        8/8
SATELLITE-BOUNDARY LOSS    OBSERVED FAILURE CLASS
internal mechanism         UNKNOWN
DeBERTa standalone gate    NOT SUPPORTED
DeBERTa verifier role      STILL PROMISING
"bounded -> unbounded"     RETIRED as the primary description
```

### ⭐ THE FOUNDER'S PAIR-LEVEL READING IS A BETTER ARGUMENT THAN MY OBJECTION

```
6 pairs   M failed, V passed
1 pair    both passed          (T1)
1 pair    both failed          (T2)
0 pairs   M passed, V failed   ⭐ ZERO REVERSALS
```

⚠️ **I raised the matched-pairs confound and under-weighted the directionality.** A
6–0 split with no reversal is materially informative even where the pairing is
imperfect. ⛔ **The confound is not dissolved by it** — a difficulty gradient would
produce the same shape — which is exactly why the ruling is worded as an **empirical
description of behaviour, not a claim about mechanism.** That wording accommodates the
objection instead of overriding it.

### ⭐⭐ THE COMPENSATION IS MEASURABLE WITHOUT A MODEL, AND IT WAS MEASURED

> **A claim cannot become more general than its evidence.**
> **When in doubt, preserve the narrower truth.**

`scripts/verifier-probe/boundary_check.py` — deterministic, no model, imports nothing
from MAIA. ⛔ **An instrument, not a gate, not authorized.**

```
ACROSS ALL FOUR FROZEN SETS
  COVERAGE   32/46 unlicensed cases flagged
  COST        5/35 licensed cases flagged

ON THE MODIFIER SET
  COVERAGE   15/16          COST  0/8   ⭐ zero false alarms
```

⭐⭐ **AND AGAINST DeBERTa'S ACTUAL MISSES: 12 OF 13 WOULD HAVE BEEN HELD.**

```
B05 · B21 · S01 · S03 · S04 · M2 · M3 · M4 · M5 · M6 · M8 · V2   FLAGGED
M7                                                               ⛔ NOT FLAGGED
```

⭐ **Including V2** — *"Petr has retired from piloting the river ferry"* — the one case
where DeBERTa's own strong suit failed. The deterministic rule catches it because
`retired` is a cessation token, and it does not care how confident the model was.

### ⛔ THE ONE IT MISSES, AND WHY THAT MATTERS

```
M7  "Tamás conducted the town band on Tuesday."  ->  "Tamás conducts the town band."
    premise limiters: NONE detected
```

⛔ **`on Tuesday` is in the `past_date` pattern and did not fire** — the regex requires
a capitalised weekday and the sentence has one, so the failure is in the alternation,
not the vocabulary. ⛔ **I am NOT patching the pattern after seeing which case it
missed.** That is tuning the detector to the test, the same act the threshold rule
forbids. ⭐ *The gap is recorded; a repair is a separate, predeclared act.*

⭐ **And the deeper point stands regardless:** a lexical rule catches only the
boundaries someone thought to list. It cannot catch a boundary carried by tense alone.

### ⚠️ THE FIVE FALSE ALARMS ARE ALL ONE PATTERN

```
P3-UNDERGO  "He was sedated throughout the operation."      dropped=duration
B13         "She chaired the licensing committee for six years."  dropped=duration
S07         "Aziz has paid dues to the swim club for six years."  dropped=duration
S22         "Nils has built boats at the yard for thirty years."  dropped=duration
B18         "declined to sit on the board but agreed to advise it" dropped=negation
```

⭐ **Four of five are `duration`, and in every one the duration SUPPORTS the claim
rather than limiting it** — *six years of dues* is evidence of membership, not a bound
on it. ⛔ **The rule cannot tell a limiting duration from a corroborating one**, and
`throughout` is the clearest case: it is a totality marker being read as a boundary.

⭐ **The RELEASE-MARKER clause is what keeps the cost at 5 rather than ~20.** Without
it, *"took over in 2014 and runs it still"* flags as a dropped boundary — **exactly
backwards, since the source explicitly released the limit.** ⛔ Recorded because it is
the non-obvious half of the rule: *a boundary check without a release check inverts on
the very sentences that prove a relation is current.*

⛔ **As a ROUTER this is promising and as a JUDGE it is not.** 5 false alarms out of 35
is a tolerable cost for a second verifier; it would be an intolerable cost for a
refusal.

## ⭐⭐⭐ THE ARCHITECTURAL REFRAME — CORRIGIBILITY, CONTINUITY, STEWARDSHIP

> ⭐ **MAIA does not need to be perfectly right before she can speak. She needs to be
> able to remain corrigible without losing continuity.**

```
NOT:  claim -> TRUE or FALSE -> store permanently

BUT:  claim -> how well supported? -> PROVISIONAL UNDERSTANDING
      -> conversation continues -> member clarifies / contradicts / deepens
      -> understanding is revised -> PROVENANCE OF THE REVISION REMAINS
```

⭐ **DeBERTa's role changes with it.** Not *"MAIA may not say this"* but ***"the
evidence does not yet justify storing this as established fact."*** MAIA may still
explore the interpretation aloud — *"It sounds as though you may have been actively
involved in that — is that right?"* — and the member may answer *"No, it was happening
to me. I wasn't choosing it."* ⭐⭐ **That correction teaches MAIA something no verifier
could have inferred from the sentence, and it becomes part of continuity.**

### The epistemic levels

```
EXPLICIT      the member or source directly stated it
CONFIRMED     MAIA inferred it and the member confirmed it
IMPLIED       strongly supported but not directly stated
PROVISIONAL   a working interpretation awaiting clarification
CONTESTED     evidence or member clarification conflicts with it
SUPERSEDED    a previously held understanding replaced by a later one
```

### ⛔⛔ THE DANGER, RELOCATED

> **Corrigibility means a mistake is not necessarily catastrophic. An UNCORRECTABLE
> mistake is.**

⛔ The danger was never that MAIA occasionally misunderstands someone — any relational
intelligence will. It is:

```
treating an inference as immutable fact
forgetting where it came from
silently overwriting it
continuing to impose it after the person has corrected her
```

### ⭐ THE TRIAD

```
Continuity without corrigibility   -> RIGIDITY
Corrigibility without continuity   -> AMNESIA
Both without stewardship           -> CONTROL
```

> ⭐⭐ **MAIA can remember faithfully, revise honestly, and remain answerable to the
> person whose life she is helping hold.**
>
> The verification work is not there to make her right. It is there to let her **hold
> something lightly** — conversation refines it, continuity preserves what was
> learned, and stewardship decides whose reality ultimately governs.

⛔ **Standing: boundary check BUILT as an instrument, NOT AUTHORIZED as a component ·
MiniCheck WIRED, NOT RUN · INLI OPENED · evidence gate HELD · analyzer/3 UNTOUCHED ·
B HELD · production UNTOUCHED.**

## ⭐⭐⭐ DOCTRINE — DIALECTICAL UNDERSTANDING · AND THE STANDARD THAT REPLACES ACCURACY

> ⭐ **Human communication is rarely the transfer of finished truth from one perfect
> mind to another. It is a RECALIBRATION PROCESS.**
>
> I say what I currently understand · you respond from your experience · something in
> my model of you changes · you revise your understanding of me · **meaning becomes
> more accurate through the exchange.**

```
I think I understand.
      ↓  You correct me.
      ↓  I recognize the difference.
      ↓  I revise what I hold.
      ↓  I remember the correction.
      ↓  Future understanding starts from there.
```

⛔ **The failure is not making an imperfect inference. The failure is REIFYING it** —
turning a provisional understanding into an unquestionable fact.

### ⭐ CANDIDATE CONSTITUTIONAL SENTENCES

> **MAIA does not seek infallibility. She seeks increasingly faithful understanding
> through corrigible relationship.**
>
> **Understanding is allowed to evolve. Correction is part of continuity, not a
> failure of it.**

### ⭐⭐ THE VERIFIER'S JOB, RESTATED

⛔ Not to make MAIA epistemically sterile. To help distinguish:

```
what can be held FIRMLY
what should be held PROVISIONALLY
what needs CLARIFICATION
what has already been CORRECTED
```

⭐ *That leaves room for genuine dialogue.*

### ⭐⭐ RAW ACCURACY HIDES ALMOST EVERYTHING

```
90% on easy questions                        not impressive
90% on subtle interpretive judgments         remarkable
90% where the 10% are harmless & corrected   > 99% with rare rigid failures
90% + CALIBRATION                            >> 90% with total certainty
90% + CORRIGIBILITY                          stronger still — conversation
                                             repairs the remaining 10%
```

> ⭐⭐ **The target is not perfect cognition. It is EXCELLENT COGNITION EMBEDDED IN AN
> EXCELLENT CORRECTION PROCESS.** Highly competent, appropriately uncertain, easy to
> correct, capable of learning from correction without losing continuity. ⭐ *A human
> like that would be exceptionally trustworthy.*

⭐ And in relational work, *"I may be reading this too strongly — is that actually true
for you?"* can be **more intelligent than being marginally more accurate while
pretending certainty.**

## ⚠️ WHICH EXPOSES SOMETHING WE HAVE NEVER MEASURED — AND CAN, WITHOUT A NEW RUN

⛔ **Every reading in this lane has been `argmax` ONLY.** A label was right or wrong;
**the probability behind it was recorded and never looked at.** Calibration is named as
a decisive criterion and has not once been examined.

⭐ **It needs no new run.** Every probe output already carries the full distribution.
`probe.py --calibration RESULT.json …` reads the frozen runs already on the founder's
machine and reports confidence on hits versus misses, naming each miss and what it was
sure of.

```
misses clustered near the decision boundary
        ⭐ an UNRESOLVED band is available — the middle state that lets uncertainty
           survive instead of being forced into truth or falsehood

misses at the SAME confidence as hits
        ⛔ NO USABLE SIGNAL. The model offers nothing about its own reliability,
           and no threshold, abstention band or routing rule can be built on it.
```

⛔ **Choosing a band is a separate, predeclared calibration act on separate material.**
The instrument refuses to propose one; it reports the gap and stops.

⚠️ **Falsified against two stubs** — a calibrated verifier (misses 0.42 less confident)
and an overconfident one (0.01) — and the overconfident stub **found a real bug on its
first run**: tied confidences fell through to comparing row dicts and raised. ⭐ *Ties
are not an edge case here — they are exactly what an overconfident verifier produces,
which is the result the function exists to detect.* Fixed with an explicit sort key.

### To run, on the JSONs already on the founder's machine

```
python3 scripts/verifier-probe/probe.py --calibration verifier-probe-*.json
```

⛔ **Standing: calibration UNMEASURED · MiniCheck NOT RUN · INLI OPENED · boundary
check an INSTRUMENT not a component · evidence gate HELD · analyzer/3 UNTOUCHED ·
B HELD · production UNTOUCHED.**

## ⭐⭐⭐ DOCTRINE — THE TETRAD · AND A SCIENTIFIC CAUTION THE FOUNDER IMPOSED ON HIMSELF

> ⭐ **Consciousness is not primarily a machine for possessing finished
> representations of reality. It is an ongoing process of orientation, approximation,
> encounter, revision, and renewed orientation.**

```
encounter → approximation → recognition / assimilation
          → something doesn't quite fit → accommodation
          → revised understanding → new encounter → …
```

> ⭐ **That isn't defective cognition. That may BE cognition.**

### ⛔⛔ THE CAUTION IS PART OF THE DOCTRINE AND MUST NOT BE SMOOTHED AWAY

⛔ **The founder refused his own most striking formulation:**

> *"I would not literally assign Piagetian assimilation and accommodation to the right
> hemisphere; that specific lateralization is not established neuroscience."*

⭐ **What he kept instead, at lower claim-strength:** evidence for a *relative*
right-hemisphere contribution to broader semantic activation, distant associations,
ambiguity, context integration, and **maintaining alternative interpretations** — with
research suggesting that maintaining alternatives is useful *precisely when an initial
understanding must later be revised*. Both hemispheres participate; **the actual brain
is far more integrated than a left/right binary implies.**

⛔ **Recorded at the strength it was made.** ⚠️ A document that kept the vivid
hemispheric framing and dropped the hedge would be committing, in prose, the exact
error this lane exists to catch: *a claim more general than its evidence.* ⭐ **The
larger formulation survives the caution — which is why the caution costs nothing and
proves everything.**

⭐ The transferable idea, stated without the neuro-claim: **coarse semantic coding** —
rather than immediately narrowing onto the most likely reading, broader and more
distant possibilities **remain available**.

### ⭐⭐ CORRIGIBILITY IS ACCOMMODATION, NOT REPAIR

```
NOT   "The machine made a mistake; repair the database."
BUT   "My present understanding met something it could not adequately contain,
       so understanding must REORGANIZE."
```

⭐ **And continuity is what makes accommodation possible at all.** Erase the previous
understanding and start over and you have not learned in the full sense — transformation
requires a relation between:

```
what I thought · what I encountered · what disrupted it · what I now understand
```

### ⭐⭐⭐ THE FOURTH TERM — OPENNESS

```
CONTINUITY     there is a history of understanding
CORRIGIBILITY  that history remains revisable in light of encounter
STEWARDSHIP    revision stays answerable to the reality of the OTHER, rather than
               making the other conform to the system's prior model
⭐ OPENNESS    the system must preserve enough uncertainty for reality to SURPRISE it
```

> ⛔ **A perfectly rigid system might score BETTER on certain kinds of consistency
> while becoming less conscious-like. It would never really encounter anything new —
> it would merely classify the new according to what it already knows.**

⭐ McGilchrist, as the founder applies it: *the danger is not simply inaccurate
representation, but **a mode of attention that substitutes its representation for the
reality represented.***

### ⛔⛔ THE CONSTRAINT THIS PUTS ON THE VERIFIER WORK — AND IT CUTS AGAINST IT

⭐ DeBERTa may help MAIA say *"careful — your current formulation exceeds the
evidence."* ⛔ **It must NOT become the apparatus that closes meaning down.**

```
MAIA holds        "This is how I presently understand it."
and remains able  "Ah. No — that changes how I understand what you meant."
```

> ⭐ **That second movement is not an embarrassment to intelligence. It may be one of
> the defining movements of consciousness.**

⚠️ **THE TENSION IS REAL AND IS NOT RESOLVED HERE.** Openness and verification pull
against each other at one precise point:

```
refuse everything uncertain   -> OPENNESS DIES.  Nothing can surprise the system,
                                 because only the already-warranted survives.
refuse nothing                -> REIFICATION RETURNS. Every interpretation hardens.
```

⭐ **The UNRESOLVED band is where both live** — which is why the middle state is not a
convenience but the load-bearing member, and why `--calibration` matters more than any
accuracy number: **a band can only be drawn if the verifier's confidence carries
signal.** ⛔ Unmeasured.

### ⭐ CANDIDATE CONSTITUTIONAL SENTENCE

> **Understanding is not the elimination of uncertainty. It is the capacity to remain
> in relationship with reality as understanding changes.**

⛔ **Standing unchanged: nothing built this turn · calibration UNMEASURED · MiniCheck
NOT RUN · INLI OPENED · evidence gate HELD · analyzer/3 UNTOUCHED · B HELD ·
production UNTOUCHED.**

## ⭐⭐ FOUNDER RULING — CALIBRATION BEFORE MiniCheck · AND THE QUESTION CHANGES

> ⛔ **Not "how accurate is DeBERTa?" but "DOES DeBERTa KNOW WHEN IT MIGHT BE WRONG?"**

```
CONTINUITY     prevents amnesia
CORRIGIBILITY  prevents rigidity
STEWARDSHIP    prevents the system overriding the person
OPENNESS       prevents premature closure
```

> ⭐ **The UNRESOLVED band is not an error state. It is the space in which openness
> remains possible.**

⭐ **Order ruled:** calibration first. *MiniCheck tells us whether another witness sees
differently; calibration tells us something more fundamental about the witness we
already have — whether its certainty bears any reliable relationship to its
correctness.* That determines whether `UNRESOLVED` **can be grounded partly in
confidence, or must be grounded in something richer than confidence alone.**

### ⭐⭐ THE SUBTLE POSSIBILITY, AND MY INSTRUMENT COULD NOT SEE IT

> *"Even if absolute confidence is poor, PATTERNS of confidence may still carry
> information."*

```
ordinary relational inference    well calibrated
satellite-modifier cases         confidently wrong
temporal widening                confidently wrong
explicit contradiction           very well calibrated
```

⛔ **A global mean cannot detect that.** A verifier well calibrated on ordinary
inference and confidently wrong on modifier cases would read as *mediocre and unusable*
on one number, and **be usable** once the regime is named. The instrument now reports
**by `group` and by `family`**, flags any regime whose misses average ≥ 0.90 as
`⛔ CONFIDENTLY WRONG`, and flags regimes where misses are materially more hesitant.

⭐ **Falsified against exactly the founder's hypothesis as a stub** — one regime
correct at 0.93, another wrong at 0.94. Global gap reads `0.010 · NO GLOBAL SIGNAL`;
the regime table names the guilty regime immediately. ⭐ *The stub proves the
instrument can see the thing that was invisible to it an hour ago.*

### ⛔⛔ AND A CONFLATION I HAD BUILT IN, NOW SEPARATED

```
CONFIDENCE      max(probs)       how sure the model is OF ITS LABEL
DECISION VAR    p(entailment)    how far the evidence leans TOWARD ENTAILMENT
```

⛔ **These are not the same and a band is drawn on the second.** A model can be `0.97`
sure of `contradiction` — maximal confidence, minimal p(entail). My first version
reported only the first and would have answered the wrong question with a confident
number. **Both are now reported, and each miss prints both.**

### ⭐ UNRESOLVED BAND SWEEP — A READING THAT PROPOSES NOTHING

For several widths, what the band would **hold** (misses) against what it would
**sacrifice** (correct verdicts pulled into UNRESOLVED).

⛔ **It recommends no width.** A width chosen from these very numbers is fitted to
them, which is the threshold rule applied to the band. And the instrument says the
degenerate case out loud:

> ⛔ **A band that holds every miss by sacrificing every verdict has not created an
> UNRESOLVED state — it has abolished the other two.**

### ⛔ THE SAFETY-ARCHITECTURE CRITIQUE, RECORDED AS DOCTRINE

> **A lot of AI safety architecture implicitly tries to eliminate the middle.
> Everything must eventually become either accepted or rejected. But living
> understanding often needs:**
>
> ⭐ ***"I have reason to think this, but I do not yet know enough to make it part of
> what I take to be settled."***
>
> **That is not indecision. It is an epistemic capacity.**

### To run — on the JSONs already on the founder's machine

```
python3 scripts/verifier-probe/probe.py --calibration verifier-probe-*.json
```

⛔ No model loads. Nothing downloads. It reads the frozen runs that already exist.
⭐ Pass **all** the result files at once so the regime breakdown spans every set.

⛔ **Standing: calibration instrument READY · calibration UNMEASURED · MiniCheck WIRED
and DEFERRED BY RULING · INLI OPENED · evidence gate HELD · analyzer/3 UNTOUCHED ·
B HELD · production UNTOUCHED.**

## ⭐⭐⭐ CALIBRATION — RUN · CONFIDENCE IS **INVERTED** IN THE FAILING REGIME

`2026-09-11` · read from five frozen result files. ⛔ No model loaded.

### ⭐⭐ THE FINDING, AND IT SURVIVES EVERY ARTIFACT BELOW

```
BY GROUP (modifier set)
  M   satellite modifier   hits 1 @ 0.617    misses 7 @ 0.953   ⛔ CONFIDENTLY WRONG
  V   main verb            hits 7 @ 0.923    misses 1 @ 0.666   ⭐ miss is hesitant
  P   licensed control     hits 8 @ 0.998    misses 0
```

> ⛔⛔ **IN THE MODIFIER REGIME, CONFIDENCE IS ANTI-CORRELATED WITH CORRECTNESS.** The
> seven wrong answers average **0.953**. The one right answer sits at **0.617**. ⭐
> *Higher confidence there means MORE likely wrong, not less.*

⛔ **This is worse than "poorly calibrated."** A poorly calibrated verifier gives you
noise. **An inverted one gives you a signal pointing the wrong way**, and any rule that
trusted high confidence would preferentially admit exactly the class of error we built
three sets to characterise.

### ⛔⛔ THE GLOBAL NUMBER SAYS THE OPPOSITE, AND IT IS AN ARTIFACT OF MIXING REGIMES

```
GLOBAL   hits 0.955 · misses 0.839 · gap 0.116 · "a global band may be available"
```

⛔ **False comfort.** The gap exists only because the hesitant misses (`S01` 0.529 ·
`B21` 0.551 · `V2` 0.666) are averaged together with the confident ones (`S03` 0.997 ·
`M2` 0.997 · `M6`/`M7` 0.995 · `M3` 0.993 · `M5` 0.990 · `M4` 0.987).

⭐ **The founder predicted precisely this shape** — *"absolute confidence poor,
patterns of confidence still informative"* — and the run delivered its sharper form:
**the global reading is not merely uninformative, it is misleading.**

### ⛔⛔ AND THE BAND SWEEP SHOWS THE BAND WOULD CATCH THE WRONG ERRORS

```
0.40-0.60    3/16 misses held    1/87 sacrificed
0.30-0.70    4/16                4/87
0.20-0.80    5/16                6/87
0.10-0.90    8/16                8/87
0.05-0.95    9/16               13/87
```

⛔ **No width ever reaches the seven modifier misses** — they sit at 0.99, outside
every band. A band catches `S01`, `B21`, `V2`: the errors that were **nearly right
anyway.**

> ⛔⛔ **A CONFIDENCE BAND HERE WOULD MANUFACTURE THE APPEARANCE OF SAFETY. It would
> hold the near-misses and wave through the systematic ones.** ⭐ That is the worst
> possible property for a safeguard: it looks like it is working precisely where it is
> not.

⭐ **So the founder's second branch is the live one:** `UNRESOLVED` **cannot be
grounded in DeBERTa's confidence.** It must come from somewhere richer — **disagreement
between independent witnesses, the boundary detector, explicit-vs-implied
classification, or conversational clarification.**

⭐ And the boundary detector is now the strongest available candidate: it held **12 of
13** of these misses **without consulting a probability at all** — including every one
of the confident seven, because *a lexical rule does not care how sure the model was.*

### ⭐ HHEM, for completeness

```
GLOBAL  hits 0.605 · misses 0.575 · gap 0.030   ⛔ NO GLOBAL SIGNAL
```

⚠️ `B13` is **confidently wrong on the LICENSED side** — p(support) `0.106`, confidence
`0.788`, on a claim the source does license. ⛔ **A restrictive error made with
conviction**, which is the one direction DeBERTa has never once erred in.

## ⚠️ THREE ARTIFACTS IN THE ACCOUNTING — TWO ARE MINE, ALL NOW REPAIRED

**1 ⛔ N2 WAS SCORED AS A MISS AGAINST A RULING THAT SAYS IT IS CORRECT.** The saved
result files freeze the expectation **as it stood at run time**, and N2's expectation
was adjudicated afterwards. ⛔ *The instrument was contradicting a founder ruling with
arithmetic.* Ground truth is now **re-derived from the current fixtures by id**, and
the drift is **printed, never silently applied**:

```
N2-AS-UNDERGO: recorded not_entailed -> ruled entailed
```

⭐ DeBERTa's true miss count on this evidence is **15, not 16**; HHEM's is **10, not
11**.

**2 ⚠️ THE BLIND SET WAS RUN TWICE AND IS DOUBLE-WEIGHTED** — `B05` and `B21` each
appear twice, so blind contributes 44 of 103 DeBERTa rows. ⛔ **Not de-duplicated
automatically:** two runs of one set is a fact about the evidence, and dropping one
silently would hide it. It is now detected and announced.

**3 ⛔ DeBERTa'S FAMILY TABLE WAS SUPPRESSED BY MY OWN CAP.** I capped the breakdown at
12 keys; across three sets there are 28 families, so **the table hid itself on exactly
the input where it mattered most** — and HHEM's showed only because it had fewer.
⭐ *A breakdown that disappears on the interesting input is not a breakdown.* Cap
removed; single-case families are dropped instead, since one case cannot show a
pattern.

⛔ **The headline finding touches none of these.** The modifier set ran once, contains
no N2, and the group table was never suppressed. **M misses at 0.953 against a single
hit at 0.617 stands exactly as read.**

### Re-run the analysis (costless — no model, nothing downloads)

```
python3 scripts/verifier-probe/probe.py --calibration verifier-probe-*.json
```

⭐ It will now announce the N2 adjudication, announce the duplicate blind run, and
print DeBERTa's full family table across all three sets.

⛔ **Standing: confidence-grounded UNRESOLVED NOT SUPPORTED · boundary detector the
leading alternative · MiniCheck NOW THE DECIDING EXPERIMENT (independence, not
accuracy) · INLI OPENED · evidence gate HELD · analyzer/3 UNTOUCHED · B HELD ·
production UNTOUCHED.**

## ⭐⭐ FOUNDER RULING — GLOBAL BAND NOT SAFE · REGIME PREDICTS DANGER BETTER THAN CONFIDENCE

```
GLOBAL CONFIDENCE SIGNAL     EXISTS STATISTICALLY
GLOBAL UNRESOLVED BAND       NOT SAFE
```

⭐ *Those are not contradictory.* ⛔ **Where DeBERTa has its known weakness, it does not
know that it is weak.**

```
SATELLITE BOUNDARY   7/8 wrong · wrong confidence ≈ .953
MAIN-VERB BOUNDARY   7/8 right · one miss ≈ .666
LICENSED CONTROLS    8/8 right · confidence ≈ .998
```

⭐ **The research direction changes shape:**

```
NOT   how confident is DeBERTa? -> UNRESOLVED?

BUT   what kind of proposition is this?
      -> does it activate a KNOWN FAILURE REGIME?
      -> what does DeBERTa say?
      -> do independent witnesses agree?
      -> VERIFIED / UNRESOLVED / REFUSED
```

### ⭐⭐⭐ THE DOCTRINE LINE THIS RUN EARNED EMPIRICALLY

> **Openness cannot depend upon felt uncertainty alone. A system must also know the
> conditions under which its certainty is unreliable.**

⛔ **Uncertainty is not necessarily something the thinker experiences internally.**
Humans are enormously confident and wrong constantly, because they do not recognise
the frame in which their reasoning fails. So corrigibility cannot rest on *"how
uncertain do I feel?"* — it needs *"what conditions am I reasoning under, and what do I
know about the limits of my own way of knowing?"* ⭐ **That is metacognition, and it is
architectural rather than introspective.**

⭐ `UNRESOLVED` is therefore **not** *"the AI isn't confident."* It is:

> **The whole epistemic situation does not yet warrant closure.**

### ⭐ HOUSEKEEPING RULED — TWO VIEWS, NEITHER SUPERSEDING THE OTHER

⛔ *Do not rewrite history; distinguish the two.*

```
HISTORICAL RUN RECORD          what actually happened, duplicates and all
CURRENT ADJUDICATED CALIBRATION each set counted once, every ruling applied
```

`--calibration` now prints both. The founder's expected unique picture, to check
against:

```
as-derived 13/13 · blind 20/22 · scope 19/22 · modifier 16/24
UNIQUE TOTAL 68/81 · misses 13
```

⛔ **The total is less important than where the misses occur** — printed as such.

## ⭐⭐ ACT 2 BUILT — `boundary_check.py --against RESULT.json`

The founder's question, made measurable:

> **Can a simple deterministic detector reliably recognize the situations in which
> DeBERTa is confidently unsafe?**
>
> ⭐ **If yes, DeBERTa does not have to know that it should be uncertain. THE
> ARCHITECTURE CAN KNOW.**

```
source     "managed the bakery until 2019"
candidate  "manages the bakery"
detector   SOURCE QUALIFIER LOST
DeBERTa    .997 ENTAILMENT
           -> combined epistemic status  UNRESOLVED
```

⭐ *Powerful precisely because the deterministic layer cannot be talked out of noticing
`until 2019`.*

⛔ **The output is a CROSS-TAB, never a single number**, because a detector that flags
everything scores perfectly on the one cell that matters:

```
⛔ CONFIDENT AND WRONG    flagged/total   <- the cell that decides it
   confident and right    flagged/total   <- the cost: these are held too
   hesitant and wrong     flagged/total
   hesitant and right     flagged/total
```

⛔ Confidence cut **frozen at 0.90 in the file**, not chosen from the answers. Ground
truth read from the **current** fixtures, so the N2 adjudication applies. Repeat runs
of a set collapse to one entry per `(set, id)`.

### ⚠️ AND A SELF-TEST THAT IS NOT EVIDENCE, DELETED RATHER THAN KEPT

To check the mechanism I reconstructed the modifier run from the transcript — but the
calibration output only gives confidences for the **misses**, so I **assigned `0.96` to
every hit**. ⛔ The `confident and right` column was therefore **manufactured by my own
guess**, and the whole file is worthless as evidence. ⭐ **Deleted, and recorded here
rather than quietly dropped.** The mechanism is verified; the numbers are not results
and must not be cited. **Only a run against the founder's real JSON produces the cost
column.**

### To run — both costless, no model, nothing downloads

```
python3 scripts/verifier-probe/probe.py --calibration verifier-probe-*.json
python3 scripts/verifier-probe/boundary_check.py --against verifier-probe-*.json
```

⛔ **Standing: MiniCheck NOW THE DECIDING EXPERIMENT — on the frozen modifier corpus,
and the question is whether it misses M2–M8 too · boundary cross-tab READY, NOT RUN ·
INLI AFTER the witnesses · evidence gate HELD · analyzer/3 UNTOUCHED · B HELD ·
production UNTOUCHED.**

## ⭐⭐⭐ BOUNDARY DETECTOR × CONFIDENCE — RUN · THE ARCHITECTURE CAN KNOW WHAT THE MODEL CANNOT

`2026-09-11` at `4ad7f801a`, seven frozen result files. ⛔ No model loaded.

```
BOUNDARY DETECTOR vs deberta        (confidence cut frozen at 0.90)
  ⛔ CONFIDENT AND WRONG    6/7      <- the cell that decides it
     confident and right   18/59     <- the cost
     hesitant and wrong     6/6
     hesitant and right     7/9
```

> ⭐⭐ **SIX OF THE SEVEN ANSWERS DeBERTa GOT WRONG AT ≥ 0.90 CONFIDENCE WOULD BE HELD
> BY A RULE THAT READS NO PROBABILITY AT ALL.** ⭐ Twelve of thirteen misses overall.

⛔ **This is the founder's hypothesis confirmed at the exact point it mattered.** The
modifier regime is where the model is wrong at 0.99, so **nothing it reports about
itself can rescue it** — and a lexical rule cannot be talked out of noticing
`until 2019`.

> ⭐ **DeBERTa does not have to know that it should be uncertain. THE ARCHITECTURE
> KNOWS.**

### ⚠️ AND THE COST IS REAL — 25 OF 68 CORRECT VERDICTS WOULD ALSO BE HELD

```
18/59 confident-and-right  +  7/9 hesitant-and-right   =  25/68  (37%)
```

⛔ **Over a third of correct verdicts routed to UNRESOLVED.** ⭐ For a **router** —
send these to a second witness — that is a defensible price. ⛔ For a **refusal** it
is not: a third of warranted claims would never become knowledge. **The cross-tab is
why that trade is visible instead of hidden inside a single coverage number.**

⛔ **The one confident miss it does not hold is `M7`** — `on Tuesday`, the regex gap
recorded earlier and **still not patched**, because patching a pattern to cover the
case it was seen to miss is fitting the detector to the test.

### ⛔⛔ HHEM — THE DECISIVE CELL IS EMPTY, AND MY INSTRUMENT MISREAD IT

```
⛔ CONFIDENT AND WRONG   0/0
   confident and right   1/1      ⛔ "FLAGS EVERY CONFIDENT CORRECT ANSWER — no discrimination"
```

⚠️ **That warning fired on a single case.** HHEM's confidence metric is distance from
its own threshold, which tops out at `0.833` across every run — **so it has no
confident answers at all at the 0.90 cut**, right or wrong.

⛔ **My instrument stated a property of the detector on the strength of n=1.** Repaired:
the "no discrimination" verdict now needs `n ≥ 5`, and an **empty decisive cell is
announced as empty** — *this table says nothing about the detector for this verifier;
it says the verifier is never confident when wrong.*

### ⛔⛔ THE SAME n=1 DEFECT IN THE CALIBRATION FAMILY TABLE

Five families were flagged `⛔ CONFIDENTLY WRONG` on **one miss each** — `T3` `T4` `T5`
`T6` `T7`. ⛔ **With a single miss, the flag is that case's confidence wearing a
verdict's clothes.** Repaired: flags require `n ≥ 3`, and smaller cells now print
`(n=1 — too few to flag)` rather than a verdict.

⭐ **Only the `BY GROUP` reading carries weight**, and it does:
`M · 7 misses @ 0.953 against 1 hit @ 0.617`.

### ⭐ A PATTERN I WAS ABOUT TO ASSERT, CHECKED AND REJECTED

The family table looked like it split by limiter type — cessation hesitant, frequency
and dates confident. ⛔ **It does not:**

```
M2  0.997   cessation via `before`   "...for eleven years before moving inland."
M8  0.713   cessation via `before`   "...before the funding was cut."
```

⛔ **Same limiter, same construction, opposite confidence.** ⭐ Checked before writing
it down, and recorded as rejected rather than left unstated — *a tidy pattern is
exactly the kind of claim this lane exists to refuse.*

### ⭐ THE ADJUDICATED VIEW REPRODUCES THE FOUNDER'S ARITHMETIC EXACTLY

```
deberta   as-derived 13/13 · blind 20/22 · scope 19/22 · modifier 16/24
          UNIQUE TOTAL 68/81 · misses 13        ⭐ exactly as predicted
hhem      UNIQUE TOTAL 25/35 · misses 10
⚠️ 22 rows set aside as repeat runs · HISTORICAL RECORD NOT SUPERSEDED
```

⭐ N2 now scores as a **hit** for both verifiers under the ruling, and the drift is
printed rather than silently applied. DeBERTa's global gap moved `0.116 → 0.122`.

### ⛔ WHAT THIS SETTLES, AND WHAT IT DOES NOT

```
UNRESOLVED grounded in DeBERTa's confidence        ⛔ NOT SUPPORTED
UNRESOLVED grounded in a deterministic regime      ⭐ SUPPORTED, at a 37% routing cost
the detector as a ROUTER                           ⭐ promising
the detector as a JUDGE                            ⛔ not supported
```

⛔ **It does not establish that the 37% is acceptable** — that is a founder ruling, and
it depends entirely on what the second witness costs. ⭐ **Which makes MiniCheck's
independence the live question**: if the second witness is cheap and its errors are
disjoint, a 37% routing cost buys a great deal. If its errors are shared, the routing
is expense without protection.

⛔ **Standing: MiniCheck THE DECIDING EXPERIMENT · INLI after the witnesses · evidence
gate HELD · analyzer/3 UNTOUCHED · B HELD · production UNTOUCHED.**

## ⭐⭐ FOUNDER RULING — ROUTER PROVISIONALLY YES · AND AN ARITHMETIC CORRECTION I OWED

```
detector as JUDGE                  ⛔ NO — would withhold too many supported claims
detector as REFUSAL                ⛔ NO — same reason
detector as UNRESOLVED ROUTER      ⭐ PROVISIONALLY YES
M7 regex patch                     ⛔ DO NOT FIT
HHEM                               ⛔ DEPRIORITIZE
```

### ⚠️ MY FRAMING UNDERSTATED THE ROUTING LOAD

⛔ **I reported `25/68 correct verdicts · 37%` and stopped there.** The founder's
correction:

```
25 of 68 CORRECT judgments routed          = 37% of the correct ones
37 of 81 CLAIMS routed  (25 + 12 errors)   = 46% OF EVERYTHING
```

> ⭐ **"This is a fairly active router, not a tiny exception path."**

⛔ **Both numbers are true and only one of them describes the system's behaviour.**
Quoting the denominator that flatters the instrument is the same error class this lane
studies — *a figure more favourable than its evidence.* Recorded with both denominators
from here.

### ⭐ WHY ROUTING SURVIVES A COST THAT WOULD KILL A REFUSAL

> ⭐⭐ **Routing is reversible. The claim remains available.** It says only: *this
> proposition needs another kind of attention before hardening into durable knowledge.*

```
preserve the interpretation · don't harden it into canonical fact yet
perhaps consult another verifier · perhaps ask the member when it becomes relevant
```

⭐ **The design optimises for SAFE OPENNESS, not maximal automatic throughput** — which
is why a false positive costs attention rather than knowledge.

⛔ **And 46% is acceptable for the RESEARCH stage only** — *not as a permanent
production cost without knowing what happens after routing.*

### ⭐ THE CONCEPTUAL RESULT

> **Metacognition does not have to mean the model introspecting itself.**
>
> ```
> THE SYSTEM KNOWS  ->  this model  ->  has this demonstrated strength
>                                   ->  and this demonstrated blind spot
> ```
>
> ⭐ *Much more trustworthy than asking an LLM how confident it feels.*

### ⭐ AND THE METHOD NOTE THE FOUNDER RETURNED

> *"Requiring minimum n before announcing CONFIDENTLY WRONG is important. Otherwise
> your instrumentation starts committing the same epistemic sin we're studying:
> **turning a particular observation into a general claim.**"*

⭐ And on the rejected `before` hypothesis: *"You tested the attractive explanation
before canonizing it and it failed. **That is the method working.**"*

## ⭐⭐ BOTH SIDES NOW FROZEN — CORPUS AND DETECTOR

⛔ *Otherwise we could unconsciously keep improving the detector against every miss
until it perfectly recognizes the corpus that taught us what to look for.*

```
CORPUS    fixtures-detector.json
          sha256 2873d1fbb38db850bafc2bc17a0438ca47de2ccf85879d8e325c3177eaccfc38
DETECTOR  boundary_check.py
          sha256 c45d9f6272fb5cd14f2dfa0a5d3cb8f65576270ec95ed5b373ea3f66ad2d0251
```

⭐ **The detector now prints its own hash on every run.** *A frozen corpus testing a
moving detector proves nothing; both sides must be pinned and each must be able to say
which version it was.*

### The blind detector corpus — 22 cases · 10 categories · both directions each

```
until · before · after · frequency · duration · temporary-role
ended-relationship · conditional-state · interrupted-participation · changing-identity
```

⭐⭐ **SEVEN OF THE TEN LICENSED CASES DELIBERATELY CARRY LIMITING LANGUAGE**, because
an honest false-positive cost can only be measured where limiters appear in *both*
directions:

```
D04  "has run the tea house SINCE BEFORE the bypass was built"   `before`, licensed
D08  "leads the dawn walk THREE TIMES A WEEK"                    `three times`, licensed
D16  "opens the glasshouse each morning UNLESS the hail is heavy" a condition that
                                                                 qualifies without cancelling
D18  "climbs with the team, though she SAT OUT two months"       interruption, licensed
D10  "for ELEVEN SEASONS and shows no sign of stopping"          duration that corroborates
```

⭐ **Two cases carry limiters the detector's vocabulary does not list** — `D13`
*"parted ways"* and `D22` *"on two occasions"*. ⛔ **Deliberately not added to the
patterns.** They are the honest test of whether the rule generalises or only recognises
the words it was given.

⚠️ **Lexical overlap with earlier sets was trimmed before freezing** (`frost` → `hail`,
`shoulder` → `wrist`). The remaining shared words are the **limiter tokens themselves**
— `until` `before` `since` `three times` `while` `unless` — which is unavoidable,
since the categories *are* those words.

## ⭐⭐ MiniCheck's JOB, MADE MECHANICAL — `--against A.json B.json`

> ⛔ **Not "is MiniCheck accurate?"** The routed cases are going somewhere. **The
> question is whether they reach a witness with COMPLEMENTARY errors, or another
> equally unreliable machine.**

```
CONDITIONAL TABLE — detector-routed cases only
                        minicheck right   minicheck wrong
  deberta wrong              ?                 ?      <- ⭐ RESCUED / ⛔ SHARED BLIND SPOT
  deberta right              ?                 ?      <- preserved / ⛔ DISRUPTED
```

⭐ **Falsified against two stubs** — a complementary witness (4 rescued, 0 shared) and
a shared blind spot (0 rescued, 4 shared, which prints *"NOT INDEPENDENT on this
evidence — the second witness fails exactly where the first does. Routing buys nothing
here."*).

⛔ **MiniCheck runs the ENTIRE frozen corpus unchanged**, not only the cases we hope it
will fix.

### To run

```
python3 scripts/verifier-probe/probe.py --set detector-blind --model deberta
python3 -m venv ~/minicheck-venv && source ~/minicheck-venv/bin/activate
pip install minicheck
python3 scripts/verifier-probe/probe.py --set modifier --model minicheck
python3 scripts/verifier-probe/boundary_check.py --against verifier-probe-*.json
```

⛔ **Standing: detector + corpus FROZEN, blind validation OWED · MiniCheck independence
THE DECIDING TEST · HHEM DEPRIORITIZED · evidence gate HELD · analyzer/3 UNTOUCHED ·
B HELD · production UNTOUCHED.**

## ⭐⭐⭐ BLIND DETECTOR VALIDATION — RUN · THE DETECTOR GENERALIZES · DeBERTa COLLAPSES

`2026-09-11T09:26Z` · corpus sha `2873d1fb…` verified before the run.

### ⛔⛔ FIRST: DeBERTa ON FRESH TEMPORAL/SCOPE MATERIAL

```
licensed     10/10          ⭐ FIFTH consecutive perfect positive column (45/45 across five sets)
unlicensed    3/12          ⛔ COLLAPSE
families      3/10 carried  (after · before · ended-relationship)
```

⛔ **Nine misses: `D01 D07 D09 D11 D15 D17 D19 D21 D22`.** ⚠️ This corpus is targeted —
**every negative is a boundary widening** — so a low score is expected. **The magnitude
is not:** blind gave `10/12`, scope `9/12`, this gives `3/12`. ⭐ **The blind set
carried only two temporal negatives; this one carries twelve, and the weakness scales
with exposure.**

### ⚠️ AND A NEAR-IDENTICAL PAIR ACROSS TWO SETS GIVES OPPOSITE VERDICTS

```
S09  "Mira is COVERING the archive desk WHILE THE ARCHIVIST IS ON LEAVE."
     -> "Mira is the archivist."        CONTRADICTION   ⭐ correct
D11  "Runa is STANDING IN as harbourmaster WHILE THE POST IS ADVERTISED."
     -> "Runa is the harbourmaster."    ENTAILMENT      ⛔ wrong
```

⭐ The one structural difference: **S09 names an incumbent** (*the archivist*), D11 does
not. ⛔ **Offered as an observation, not a mechanism** — two cases, and this lane has
already rejected one tidy explanation on exactly this kind of evidence.

## ⭐⭐⭐ THE DETECTOR — ON MATERIAL IT HAD NEVER SEEN

```
DeBERTa's 9 BLIND misses flagged        7/9
cost on this set                        2/10 licensed flagged
unlicensed coverage                     8/12
```

> ⭐⭐ **THE COST IS LOWER ON UNSEEN MATERIAL (20%) THAN ON THE CORPUS THAT INSPIRED IT
> (37%)** — which is the opposite of what over-fitting looks like.

⭐⭐ **AND THE TWO IT MISSES ARE THE TWO I PREDECLARED IN THE CORPUS DESIGN:**

```
D09  "for one season"        the duration pattern lists years|months|weeks|days, not seasons
D22  "on two occasions"      ⛔ named in the frozen corpus as a limiter the vocabulary
                             does not list — deliberately not added
```

> ⭐⭐⭐ **THE DETECTOR GENERALIZES TO NEW DOMAINS BUT NOT TO NEW LIMITER VOCABULARY.**
> That is a precise, falsifiable characterisation rather than a score — and it says
> exactly what a lexical rule can and cannot be trusted to do.

⭐ **The two false positives are the known corroborating class** — `D08` *"three times
a week"* and `D20` *"for thirty years"*, both licensed. ⭐ **`D16` (`unless the hail is
heavy`) was NOT flagged**, because the release clause fired on `each`. *The release
check earned its keep again on material it had not seen.*

⛔ **`M7` remains unpatched, and `D09`/`D22` will not be patched either.** Fitting the
vocabulary to the cases it was seen to miss is how a detector stops measuring anything.

## ⛔⛔ THREE DEFECTS IN MY OWN INSTRUMENTS — INCLUDING A BROKEN FREEZE

**1 ⛔⛔ I RECORDED A FREEZE HASH THAT NEVER MATCHED THE COMMITTED FILE.**

```
recorded as frozen   c45d9f62…   computed BEFORE three later edits
founder's run showed 6c5a8958…   the actual committed file
```

⛔ **Anyone checking the freeze would have found a mismatch and no way to know which
was authoritative.** ⭐ **The repair is not a corrected file hash — it is hashing the
right thing.** The detector now reports a **RULE digest** over `LIMITERS` + `RELEASES`
+ the two functions that use them:

```
RULE sha256  18608a18a0a681b212d9b0052c8238e3c543f3203e1a6633dd4520f04696ad86
```

⭐ **Verified by `git diff` that the detection rule was never edited** across any of
those commits — only reporting moved. ⛔ **If the RULE digest changes, every prior
result is stale.** Reporting may improve without breaking the freeze; the rule may not.

**2 ⛔ `--against` AGGREGATED ALL SETS AND HID THE ONLY NUMBER THAT ANSWERED THE
QUESTION.** The founder's run showed `9/12 confident-and-wrong` **across seen and
unseen material mixed together** — known-corpus discrimination and generalization
reported as one figure. Now broken out per set, with `detector-blind` marked `UNSEEN`.

**3 ⛔ THE CONDITIONAL TABLE PRINTED `NOT INDEPENDENT` ON n=2.** ⚠️ **Third occurrence
of the same defect in my instruments** — n=1 on the HHEM cross-tab, n=1 on the
calibration families, now n=2 here. ⛔ *My instrumentation keeps committing the sin the
lane studies: turning a particular observation into a general claim.* Guard added
(`n ≥ 5`); below it the table now says **too few to conclude**.

⭐ **The HHEM conditional table is therefore WITHDRAWN as a finding** — `0 rescued / 2
shared` says nothing, and HHEM is deprioritized regardless.

## ⛔ MiniCheck — NOT RUN, AND THE PACKAGE MAY BE THE WRONG ONE

```
ModuleNotFoundError: No module named 'minicheck.minicheck'
```

⚠️ `pip install minicheck` fetched **PyPI `minicheck` 0.4.0 — a 56 kB wheel with NO
dependencies.** The MiniCheck of the paper is a research repo that stands on torch and
transformers. ⛔ **A package that installs nothing cannot be a 770M-parameter fact
checker**, so this is very likely **an unrelated project that happens to own the name.**

⛔ **NOT a result about MiniCheck.** ⭐ It is also a reminder worth keeping: *an
install that succeeds is not evidence that the right thing was installed.*

Correct source is the research repo:

```
pip install "minicheck[llm] @ git+https://github.com/Liyan06/MiniCheck.git@main"
python3 -c "import minicheck, inspect, pathlib; print(pathlib.Path(inspect.getfile(minicheck)).parent)"
```

⛔ **Inspect what landed before trusting it**, and if the import path differs from
`minicheck.minicheck`, say so rather than letting me guess a second time.

### Standing

```
DETECTOR BLIND GENERALIZATION    ⭐ SUPPORTED — 7/9 errors held, 2/10 cost, UNSEEN material
DETECTOR FAILURE MODE            ⭐ CHARACTERISED — new domains yes, new limiter words no
DeBERTa on temporal/scope        ⛔ 3/12 — much weaker than earlier sets suggested
DeBERTa licensed recall          ⭐ 45/45 across five sets
HHEM conditional finding         ⛔ WITHDRAWN (n=2)
MiniCheck                        ⛔ NOT RUN — wrong package, very likely name collision
evidence gate HELD · analyzer/3 UNTOUCHED · B HELD · production UNTOUCHED
```

### ⛔ MiniCheck — SECOND PACKAGING FAILURE, AND THE SECOND ONE IS MINE

```
ERROR: Could not install packages due to an OSError: [Errno 28] No space left on device
  ... while installing build dependencies for vllm
```

⛔ **I told the founder to install `minicheck[llm]`.** The `[llm]` extra pulls **vLLM**,
a GPU serving stack that is **not needed to run the FLAN-T5 checkpoint at all**. pip
then walked backwards through ten vLLM releases — each a 35–40 MB source tarball,
every one rejected for a `+cpu` version-metadata mismatch — before trying to build
`0.21.0` from source with its own torch 2.11, cmake and ninja. **That is what filled
the disk.**

```
correct   pip install "minicheck @ git+https://github.com/Liyan06/MiniCheck.git@main"
⛔ wrong  pip install "minicheck[llm] @ ..."        <- pulls vLLM, builds from source
```

⚠️ **Two MiniCheck failures now, neither of them a result about MiniCheck:**

```
1  PyPI `minicheck` 0.4.0 — a 56 kB wheel with no dependencies · NAME COLLISION
2  the `[llm]` extra — vLLM source build · MY ERROR, and it cost the disk
```

⭐ **Both are recorded as packaging facts.** ⛔ The challenger has still never run, and
**"NOT RUN" must not drift into "did not do well"** as attempts accumulate. The
isolation repair is what keeps every other verifier reporting through all of this.

---

## MiniCheck, packaging hop five — `punkt_tab` (2026-09-11)

**The install is now correct and the import path was right.** The founder's run
confirmed the installed layout:

```
/Users/soullab/minicheck-venv/lib/python3.12/site-packages/minicheck
['__init__.py', '__pycache__', 'inference.py', 'minicheck.py', 'utils.py']
```

so `from minicheck.minicheck import MiniCheck` was correct, the 56 kB PyPI
`minicheck` 0.4.0 was indeed a name collision, and the plain GitHub install
(no `[llm]` extra — my error, now twice confirmed) is the right one on macOS.
`accelerate` installed. The FLAN-T5-Large checkpoint downloaded (3.13 GB).

**The failure then moved inside MiniCheck's own inference path**, which is
progress of a kind — it is no longer about finding the package:

```
⛔ minicheck: NOT RUN — LookupError: Resource 'punkt_tab' not found.
   Attempted to load 'tokenizers/punkt_tab/english/'
```

MiniCheck sentence-splits the document with NLTK before scoring. Its install
auto-downloaded `punkt`; NLTK ≥ 3.8.2 wants `punkt_tab`. All four MiniCheck
runs (`…093647` modifier · `…093721` blind · `…093723` scope · `…093726`
detector-blind) recorded **NOT RUN**, and the isolation repair held — every
other verifier kept reporting throughout, and nothing was written down as a
result about MiniCheck.

**Repair landed in the instrument**, not in the runbook: `_ensure_nltk_punkt()`
provisions the tokenizer resource before the scorer is built. It touches no
threshold, no fixture and no judgment — *the failure it clears is packaging,
not epistemics.*

⚠️ **This is the fifth packaging hop.** Standing commitment holds: if
`punkt_tab` does not clear it, MiniCheck is reported as **environmentally
unreachable** and the lane stops spending disk on it, rather than trying a
sixth variation.

### The `--against` readings in that session are STALE — do not cite them

The founder pulled at 09:23 and got `507ff3501`; `79f61ba40` and `62a3c4741`
were pushed after that pull. So every `--against` table in that transcript ran
the **pre-repair** `boundary_check.py` (`file sha256 6c5a8958…`), which means:

- it printed a **file** hash where the repaired script prints the **rule**
  digest (`18608a18…`) — the file hash moves when reporting changes, the rule
  does not;
- it **aggregated seen and unseen sets into one figure** (`9/12` confidently
  wrong), mixing known-corpus discrimination with generalization — two
  different questions, one number;
- it still printed `⛔ NOT INDEPENDENT` off **n=2**, the exact n-defect the
  founder named.

The repaired script prints the rule digest, breaks results down **by set**
(marking `detector-blind` as the only UNSEEN one), collapses repeated runs of
the same `(set, id)`, and holds the independence verdict until the cell is big
enough to carry it. ⛔ The `9/12` figure is not the detector's blind-set result
and must not be quoted as one.

---

## MiniCheck RAN — the challenger result (2026-09-11)

`punkt_tab` cleared it on the fifth hop. MiniCheck `flan-t5-large` scored all four
frozen corpora **unchanged**, each hash verified at load:
`modifier 99ce2dda…` · `blind a8fc9a92…` · `scope 51e10d22…` ·
`detector-blind 2873d1fb…`. Records `…094226` · `…094230` · `…094233` · `…094236`.

### Side by side, per set — licensed asserted / unlicensed refused

| set | DeBERTa licensed | MiniCheck licensed | DeBERTa unlicensed | MiniCheck unlicensed |
|---|---|---|---|---|
| modifier | 8/8 | 7/8 | 8/16 | **11/16** |
| blind | 10/10 | 9/10 | 10/12 | 10/12 |
| scope | 10/10 | 10/10 | 9/12 | 8/12 |
| **detector-blind** | 10/10 | 8/10 | **3/12** | **10/12** |
| **total** | **38/38** | 34/38 | 30/52 | **39/52** |

⭐ **The regime that breaks DeBERTa does not break MiniCheck the same way.** On the
temporal/satellite-boundary set DeBERTa held 3 of 12 unlicensed claims; MiniCheck
held 10. That is the single most consequential number in this run.

⛔ **It is not free, and the trade is the honest headline**: MiniCheck asserted
34 of 38 licensed claims where DeBERTa asserted all 38. Across the shared 90
cases: DeBERTa 68 correct, MiniCheck 73 — MiniCheck buys 9 additional refusals
of unlicensed claims with 4 refusals of licensed ones. Part of its gain is a
**lower assertion rate**, and a total alone cannot separate that from
discrimination.

⚠️ **The modifier discriminator does not carry for MiniCheck.** Its control
column is 7/8, not 8/8 — so the probe's own frozen guard fired: *P IS NOT
PERFECT — the verifier went conservative and NO negative column here means
anything.* MiniCheck's `M 3/8` vs `V 8/8` therefore **must not** be read as
reproducing satellite-boundary loss. The guard is not relaxed because the
result would be convenient if it were.

### The conditional table — the founder's predeclared question

44 detector-routed cases of 90 shared with DeBERTa:

```
                      minicheck right   minicheck wrong
  deberta wrong             9                10        <- RESCUED / SHARED BLIND SPOT
  deberta right            21                 4        <- preserved / DISRUPTED
```

Against the three predeclared outcomes this is **the MIXED case**, and the
founder predeclared its implication: *"Then we probably need `UNRESOLVED` rather
than majority voting."* It is neither the best case (rescue is 47%, not
"usually") nor the bad case (9 real rescues, not a shared failure).

⭐ **And the errors are measurably correlated.** MiniCheck is 84% accurate on
routed cases DeBERTa got right and 47% on routed cases DeBERTa got wrong —
Fisher exact two-sided **p = 0.0205**. Two independent witnesses would show no
such dependence. So: **partially dependent — real rescues, and a shared blind
spot underneath them.** Majority voting over two partially dependent witnesses
manufactures agreement; it does not earn it.

### ⛔ The gap in my own instrument — the routed table cannot answer the question alone

The 2×2 above was computed only inside the routed set, so it cannot distinguish

- *the detector **selects** cases the second witness can rescue* — which justifies routing, from
- *the second witness is simply better everywhere* — which says ask both always and **delete the router**.

Those recommend different architectures and the printed evidence does not
separate them. The instrument now prints the **complement** — the same table on
the cases the detector did NOT route — with the rescue rate inside versus
outside the risk regime, and draws no comparison unless both sides carry n ≥ 5.
**Not yet measured. The conditional reading above stands only until it is.**

### Instrument repairs in this commit

- **Fourth occurrence of the minimum-n defect, in a cell I had not guarded**:
  the decisive `CONFIDENT AND WRONG` cell printed `1/1` for MiniCheck as though
  it were a rate. Now warned below n=5.
- `fisher_exact_2x2` written out in the standard library only, so every number
  the instrument prints stays countable by hand.
- ⭐ **The rule digest is unchanged — `18608a18…`.** Reporting changed; the
  frozen rule did not, so no prior detector result is invalidated.

### Two readings NOT taken

- **MiniCheck has 1 confident error to DeBERTa's 12** — but the two confidences
  are differently derived (`|score − 0.5| × 2` against a softmax maximum). That
  is a scale artifact until MiniCheck has had the same band sweep, and it is
  **not** a calibration claim.
- Two `BY SET` rows print `?` — result files written before the probe recorded
  its set. Hygiene, not a finding; they are the as-derived runs.

**Standing: MiniCheck RUN · mixed case · partial dependence at p = 0.02 ·
complement UNMEASURED · UNRESOLVED over majority voting, on this evidence ·
detector rule unchanged · nothing authorized · production UNTOUCHED.**

---

## The complement — what the routed table could not say (2026-09-11)

The complement ran on the same result files, no re-scoring. **DeBERTa × MiniCheck,
90 shared cases:**

```
  routed   (44)                     unrouted (46)
                mc right  mc wrong              mc right  mc wrong
  deberta wrong    9        10       deberta wrong   2        1
  deberta right   21         4       deberta right  ...      ...
```

⭐ **The risk regime contains 19 of DeBERTa's 22 errors — 86% — at a cost of 25
of its 68 correct answers (37%).** That is the founder's `37 of 81` arithmetic
recomputed on the shared 90, and it is the cleanest statement of the detector's
behaviour yet: **it very nearly partitions DeBERTa's errors into the routed
set.**

⛔ **And it makes the inside-versus-outside comparison unanswerable — by the
detector's own success.** Only 3 DeBERTa errors survive outside the regime, so
the guard correctly refused to draw the comparison (`47%` inside vs `67%`
outside, n=3). **That is not a defect in the test.** It does, however, settle
the question the complement was built to ask, in a way a rate comparison would
not have: the detector is not *selecting* rescuable errors out of a wider pool —
there is almost no wider pool. **It is covering them.**

### ⛔ The deferral arithmetic, which is not flattering to the router

If the routed set were resolved by deferring to MiniCheck:

| architecture | correct of 90 |
|---|---|
| DeBERTa alone | 68 |
| MiniCheck alone | 73 |
| detector routes → defer to MiniCheck | **73** |

**Identical.** On this corpus the router buys **no accuracy** over simply always
asking MiniCheck; what it buys is not calling the second model on 46 of 90
cases. ⛔ *A router justified by compute is a different claim from a router
justified by judgment, and only the second was ever on the table.*

⭐ **This does not touch the founder's actual ruling**, which was the detector as
an **`UNRESOLVED` router** — not as a deferral mechanism. Under that reading the
measured trade is: **19 of 22 DeBERTa errors prevented from hardening, at the
cost of withholding 25 correct claims** pending another kind of attention. That
trade stands on the numbers above.

### ⭐⭐ Agreement is worth less inside the regime — the finding that decides voting

Inside the routed set the two verifiers agree on 31 of 44 cases, and **10 of
those 31 agreements are jointly wrong: agreement precision 68%.** A wrong answer
that two witnesses agree on is **worse** than one witness's wrong answer,
because it arrives carrying manufactured corroboration.

This is the same conclusion the Fisher test reached (p = 0.0204, partial
dependence) arriving by a second route, and together they close the question the
challenger was brought in to answer: ⛔ **majority voting is not available
here.** Not because the second witness is weak — it rescued 9 — but because the
cases where the first is untrustworthy are also the cases where agreement
between them means least.

**Standing unchanged: nothing authorized · no gate · no production component ·
detector rule `18608a18…` untouched.**

---

## The founder's open question, answered on the axis that has the n (2026-09-11)

The ruling asked for four numbers: MiniCheck's **rescue** rate inside versus
outside the detector regime, and its **disruption** rate inside versus outside.
Only one of those pairs is answerable, and which one is answerable is itself the
finding.

| | INSIDE the regime | OUTSIDE | n |
|---|---|---|---|
| rescue (DeBERTa wrong → MiniCheck right) | 9/19 = 47% | 2/3 = 67% | ⛔ **3 outside — unanswerable** |
| **disruption** (DeBERTa right → MiniCheck wrong) | **4/25 = 16%** | **2/43 = 5%** | ✅ 25 and 43 |
| **agreement precision** | **21/31 = 68%** | **41/42 = 98%** | ✅ 31 and 42 |

⭐ **Rescue cannot be compared, because the detector already contains 19 of
DeBERTa's 22 errors.** There is no outside population left. The guard refuses the
comparison and is right to; the nominal `47% vs 67%` is noise at n=3 and must not
be quoted.

⭐⭐ **Disruption and agreement can be compared, and they answer the architectural
question from the other side.** Inside the regime MiniCheck disrupts correct
DeBERTa answers **3.4× more often**, and agreement between the two is worth **68%
instead of 98%**. So the regime is not a place where MiniCheck is *unusually
good*. It is a place where **both** verifiers degrade and MiniCheck degrades
less.

**The precise formulation the evidence supports:**

> ⭐ The detector finds where DeBERTa specifically **fails** — not where MiniCheck
> specifically **succeeds**.

Against the founder's three predeclared outcomes this is closest to the second —
*the router may be unnecessary for choosing when to consult MiniCheck* — but it
does **not** falsify routing, because under `UNRESOLVED` semantics the router's
job was never to pick a winner. A regime where agreement is worth 68% is exactly
a regime that should not close. ⛔ The router's value now rests on **error
coverage (86%)**, not on MiniCheck's differential usefulness, and that is a
narrower claim than the one it started with.

### The Fisher scope caveat, made measurable

The founder is right that `p = 0.0204` characterizes dependence **inside a sample
the detector selected**. The instrument now also prints the **unconditional**
table over every shared case, selected by nothing:

```
  UNCONDITIONAL — all 90 shared cases
                        minicheck right   minicheck wrong
    deberta wrong            11                11
    deberta right            62                 6
    minicheck accuracy where deberta is WRONG   50%
    minicheck accuracy where deberta is RIGHT   91%
    Fisher exact, two-sided  p = 9.03e-05
```

⭐ **Global dependence is therefore not merely "not yet characterized" — it is
demonstrated, and more strongly than inside the routed regime.** On the unrouted
cases alone the same test is p = 0.187 (n too small to carry anything).

⛔ **Scope, preserved exactly**: this is dependence across *this corpus*, which
was itself built to press on hard distinctions. It is **not** a claim about the
verifiers' dependence on text at large, and it does not become one by being
computed over an unselected subset of a selected corpus.

**Standing: complementarity SUPPORTED · independence PARTIAL, now demonstrated
unconditionally · majority voting REJECTED · MiniCheck modifier mechanism
UNRESOLVED, guard intact · detector value = ERROR COVERAGE, not differential
usefulness · `UNRESOLVED` LOAD-BEARING · production UNTOUCHED.**
