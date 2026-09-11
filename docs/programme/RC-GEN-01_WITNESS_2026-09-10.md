# RC-GEN-01 — witness record

Branch `claude/s3-implementation`. ⛔ **Production untouched. Migration
`20260910000001` UNAPPLIED to any real database. No Work mutation path exists
anywhere in this slice.**

## Standing

```
3A-P   protocol                DONE · 16/16 · unit suites green
3A-S   semantic witness        ⛔ RUNS 1-4 FAILED (run 4 = REGRESSION)
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
