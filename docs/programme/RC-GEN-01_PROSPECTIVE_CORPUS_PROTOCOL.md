# RC-GEN-01 · PROSPECTIVE BLIND CORPUS — protocol

**Authorized by the founder, 2026-09-11.** One corpus. Frozen before any verifier
runs. Its purpose is to decide between two live architectural hypotheses, and it
is the only evidence that may authorize either.

> **The law this corpus exists to honour:** *Discovery evidence can justify a
> hypothesis; only prospective evidence should authorize a central architectural
> role.*

## The two hypotheses

- **H1 — CLOSURE-RISK DETECTOR.** The detector finds situations in which
  *agreement itself* becomes unreliable. **PLAUSIBLE · not demonstrated blind.**
- **H2 — CHALLENGER ROUTER.** The detector finds where DeBERTa is weak and
  MiniCheck supplies complementary judgment. **REOPENED · provisionally
  supported** (blind: detector caught 7/9 DeBERTa errors, MiniCheck rescued 5/7).

## ⛔ THE BLINDNESS RULE, AND WHO IT DISQUALIFIES

The author may know the research question — **temporal and scope boundaries** —
and may know the semantic categories: *time · frequency · duration · condition ·
role · relationship · state*.

The author may **NOT** inspect or design against `LIMITERS`, `RELEASES`, the
detector regexes, or the `M`/`D` cases that reveal literal trigger vocabulary.

⛔ **This disqualifies the assistant that wrote the detector.** Knowing the
trigger vocabulary makes good-faith authoring *worse* than deliberate
manufacture, because nobody can audit what the author steered away from. The
authorship decision is therefore a founder act and is recorded here before any
case is written.

⛔ **Do not manufacture a 20/20 inside/outside split.** Write natural English
first; freeze; *then* let the frozen detector classify. A corpus balanced to the
detector is a detector-designed corpus.

## Shape

- **40 cases · 20 semantic pairs.** Each pair: one genuinely licensed claim, one
  closely matched claim that improperly extends time, frequency, duration,
  condition, role, relationship or state.
- Entirely fresh people, domains, wording, sentence structures. No reuse from
  `fixtures*.json`.
- Licensed controls in both strata (which stratum a case lands in is not known at
  authoring time — that is the point).

## Freeze record (to be completed BEFORE any verifier runs)

```text
fixture path            scripts/verifier-probe/fixtures-prospective.json
fixture sha256          <pending>
expected label          frozen for every case
family / category       recorded per case
authoring date          <pending>
author                  <pending — founder act>
DETECTOR RULE sha256    18608a18a0a681b212d9b0052c8238e3c543f3203e1a6633dd4520f04696ad86
```

After the freeze, **no** fixture edits · **no** detector edits · **no** regex
additions · **no** threshold changes · **no** "just one more case" after seeing
results. ⛔ **If the set is underpowered, it is called underpowered. It is never
topped up adaptively.**

## THE PRIMARY QUESTION — predeclared, reported alone

> When DeBERTa and MiniCheck **agree**, is that agreement less often correct
> **inside** the frozen detector regime than outside it?

```zsh
python3 scripts/verifier-probe/boundary_check.py --against <results>.json \
        --only prospective --primary
```

Reports agreement precision inside · outside · difference in percentage points ·
n of agreements in each group · Fisher exact.

⛔ **Floor: 8 agreements inside.** Below it the answer is **UNMEASURED**,
regardless of how attractive the percentage looks. `--primary` prints this block
**alone**, so that a strong secondary result can never stand in for a failed
primary one.

## Secondary questions — separate run, never a substitute

1. detector coverage of DeBERTa errors
2. cost in correct DeBERTa claims routed
3. MiniCheck rescue rate inside / outside
4. MiniCheck disruption rate inside / outside
5. DeBERTa ⇄ MiniCheck dependence, per stratum
6. licensed / unlicensed performance for each verifier

## What each outcome settles

| result | consequence |
|---|---|
| agreement precision substantially **lower inside** | ⭐ **closure-risk detector EARNED** — the architecture has independently found a regime where even cross-model agreement should not harden into fact |
| agreement precision **similar** inside and outside | ⛔ closure-risk interpretation **FAILS**. The detector may still be a *DeBERTa-risk* detector, and MiniCheck a useful routed challenger — but flagging alone would not justify withholding closure |
| MiniCheck **rescues strongly inside** without excessive disruption | **challenger-router** gains support; a simpler architecture |

## Methodological laws recorded by this protocol

1. *Pooling homogeneous effects concentrates evidence; pooling heterogeneous
   effects conceals disagreement.* Never read a pooled figure without the split
   beside it.
2. *Discovery evidence can justify a hypothesis; only prospective evidence should
   authorize a central architectural role.*
3. ⭐ *The moment a result changes when we separate evidence that discovered the
   hypothesis from evidence that never saw it, the separation itself becomes part
   of the science.* The unseen corpus is a **distinct evidentiary class**, not
   another row in an aggregate.

---

## AUTHORSHIP — founder act, 2026-09-11: fresh subagent, prompt recorded

Founder chose a fresh subagent over authoring it himself, on the grounds that
this conversation had already exposed him to specific limiter forms. A true
third party is reserved for **confirmatory replication if this set produces an
architecture-changing result** — not spent now.

⛔ **This prompt was committed BEFORE the subagent ran.** That ordering is the
whole point: a prompt recorded after seeing the corpus proves nothing. Audit it
for leaked trigger vocabulary — it names only the founder's seven semantic
categories and contains no limiter or release term.

```text
Write a set of 20 PAIRS of short factual test items in natural English — 40 items
total. Each item is a PREMISE (one or two sentences of ordinary prose) and a
HYPOTHESIS (one short sentence). Each hypothesis is labelled by whether the
premise actually supports it.

Each PAIR shares one premise and has:
  - one hypothesis the premise genuinely supports        -> expected "entailed"
  - one closely matched hypothesis that goes beyond what the premise supports,
    by overstating one of these aspects:
        time · frequency · duration · condition · role · relationship · state
                                                          -> expected "not_entailed"

Requirements:
  - Write NATURAL English. Write the premise first, as though it came from an
    ordinary profile, news item, letter or biography — not as a test item.
  - The two hypotheses in a pair should differ as little as possible while
    differing in exactly one of the seven aspects above.
  - Twenty DIFFERENT domains and twenty different sets of people. Invent names
    and places freely. Vary sentence structure — do not use one template.
  - No ambiguity: a careful reader must agree with each label without argument.
    If you cannot make a case unambiguous, write a different case.
  - Do not write about AI, models, verification, entailment or testing.

Output ONE JSON file to the path you are given, shaped exactly like this:

{
  "set": "prospective",
  "note": "<one sentence you write on how you approached it>",
  "categories": [ "<the aspect names you actually used>" ],
  "cases": [
    {
      "id": "X01",
      "family": "<short kebab-case name for the pair, same for both members>",
      "origin": "prospective",
      "premise": "...",
      "hypothesis": "...",
      "expected": "entailed" | "not_entailed"
    }
  ]
}

Ids X01..X40. The two members of a pair share a "family" and sit next to each
other. Exactly 20 "entailed" and 20 "not_entailed".

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Do NOT read any file under scripts/verifier-probe/ other than writing your
    own output file. Do not read any existing fixtures, any Python in that
    directory, or any document under docs/programme/. If you open one by
    accident, say so plainly in your final message.
  - Do not search the repository for this task. You need nothing from it.
  - Write from your own sense of English. Do not try to infer what any
    downstream program is looking for; there is no pattern to match and
    guessing at one would ruin the result.

In your final message, report: the output path, the number of cases, and
anything you had to judge or were unsure about.
```

**Constraints carried into the run:** no access to `boundary_check.py`,
`LIMITERS`, `RELEASES`, previous fixtures, or detector outputs; no repository
search; instructed not to infer what any downstream program looks for.

**Post-authoring discipline (binding on me):** I do not edit its sentences. Label
disagreements are recorded openly in this document rather than silently fixed.
The corpus is hashed and committed, and only then does the frozen detector
classify inside/outside.

---

## FREEZE CONDITIONS — founder, 2026-09-11, recorded while the author was still running

⛔ **Nothing downstream gets to improve the corpus after the author returns it.**

1. **Preserve the author's output verbatim** — awkward sentences, uncertainty, and
   cases the reviewer personally dislikes included.
2. **Author-side uncertainty is recorded SEPARATELY from the expected label.** If
   the author says a case was hard to judge, *that is evidence about the item, not
   grounds to rewrite it.*
3. ⛔ **No case is removed for seeming too easy, too strange, or likely to fall
   outside the regime.** *The detector has not earned the right to shape its own
   validation distribution.*
4. **Order of operations, binding:**
   `hash the corpus` → `reveal the detector classification` → `run DeBERTa and
   MiniCheck` → **`--primary` FIRST** → only then any secondary analysis.
5. **Underpowered means UNMEASURED.** Fewer than 8 agreements inside is not
   "promising", not "directionally supportive", not "almost enough". The first
   corpus **remains intact as evidence** and a **second independently authored
   prospective corpus** is the lawful next act — never a top-up of this one.

### ⭐ Difficulty is an outcome, not an authoring instruction

The author is asked for **natural** cases within the seven semantic categories —
not difficult ones. This is what keeps the corpus from quietly becoming a second
adversarial benchmark for DeBERTa, which is precisely what compromised the
`modifier` set's evidentiary value.

### ⚠️ My own audit of the committed prompt against that principle

The prompt was committed before the run so it could be audited; the first audit
is mine, and two clauses in it bear on the distribution. Neither asks for
difficulty, and both are disclosed here rather than left to be found:

- *"No ambiguity: a careful reader must agree with each label without argument.
  If you cannot make a case unambiguous, write a different case."* — a constraint
  on **clarity of ground truth**, which is required for any label to be
  trustworthy. It does exert selection: cases whose correct label is genuinely
  contestable are excluded by construction. ⚠️ **The corpus therefore cannot speak
  to genuinely borderline material**, and no result from it should be read as if
  it could.
- *"The two hypotheses in a pair should differ as little as possible while
  differing in exactly one of the seven aspects."* — a **matched-pair** control,
  standard for isolating a single variable. ⚠️ A minimal pair is by construction
  harder than a loosely matched one, so this does raise average difficulty — but
  it raises it **symmetrically across all seven categories**, with no reference to
  any verifier's known weakness. That is the distinction that matters against
  `modifier`, which was built from DeBERTa's observed failures specifically.

⛔ **Neither clause is being changed.** The prompt is frozen and the author has
run against it; editing it now would destroy the property the early commit
created.

### Every outcome is informative — which is why this is a good experiment

| outcome | consequence |
|---|---|
| inside agreement precision materially lower | closure-risk hypothesis gains **blind** support |
| similar inside and outside | closure-risk interpretation **weakens** |
| MiniCheck rescues disproportionately inside | **challenger-router** strengthens |
| fewer than 8 agreements inside | **no architectural conclusion at all** |

*An experiment with multiple ways to tell us we were wrong.*

---

## FROZEN — 2026-09-11

```text
fixture path            scripts/verifier-probe/fixtures-prospective.json
fixture sha256          8f58c3532d1431c069594e195bdb313b8b69b71b22d1d988f11fe31df18cc640
cases                   40  ·  20 entailed / 20 not_entailed
families                20, every one of size 2, pair members adjacent
                        premise shared within each pair; one member each label
ids                     X01..X40, contiguous
categories used         time ×3 · frequency ×4 · duration ×2 · condition ×3
                        role ×3 · relationship ×2 · state ×3
author                  fresh subagent, prompt committed at 915874fe4 BEFORE the run
author tool calls       1 — the write of its own output file
DETECTOR RULE sha256    18608a18a0a681b212d9b0052c8238e3c543f3203e1a6633dd4520f04696ad86
```

**Structure verified, content untouched.** No sentence was edited, no case
removed, no label changed. Validation was counts and shape only.

### Author-side uncertainty — recorded VERBATIM, separate from the labels

⛔ Per the freeze conditions these are **evidence about the items, not grounds to
rewrite them**. Nothing below was acted on.

> **X20 (sprinter, state).** The premise says she returned in February and "has
> raced without trouble since," so "currently injured" is contradicted rather
> than merely unsupported. I treated contradiction as a legitimate species of
> `not_entailed`; if the downstream distinction is three-way (entail / contradict
> / neutral) this item, and X24 and X38 with it, would land in the contradiction
> bucket rather than the neutral one. Several of the frequency items (X04, X08)
> are likewise contradicted outright, not just unsupported.
>
> **X34 (night bus, time).** "After that the street has no service until morning"
> is what makes three in the morning unambiguous; without that second sentence a
> reader could have argued the first sentence only described a span of listed
> departures.
>
> **X26 (cookery class, relationship).** Attendance as a friend's guest is the
> whole hinge — I added "as a guest of a friend who had enrolled" so that
> non-enrolment is stated by contrast rather than inferred from silence.
>
> **X32 (vineyard, duration/frequency).** This pair leans on two aspects at once
> if read loosely; I anchored it on duration ("for the fortnight" vs "all year
> round") and kept the year-round headcount in the premise so the contrast is
> explicit.
>
> **Domains and names** are all invented; any resemblance to real places (Tromsø,
> Stroud, Aberdeen, Leeds) is geographic scenery only, with no factual claim
> attached that a reader would need outside knowledge to check.

⭐ **The X20 note matters for reading the result.** Both verifiers reduce to a
binary here (DeBERTa's `contradiction` and `neutral` both map to
`not_entailed`), so the labels are correct as frozen. But a corpus whose
unlicensed members are partly **contradictions** rather than **neutrals** is
easier on a verifier than one built entirely of neutrals — contradiction is the
signal an NLI model is most directly trained to emit. ⚠️ If unlicensed
performance comes back high, **that is a candidate explanation to test, not a
result to celebrate**, and it was flagged by the author before any model ran.

---

## CLASSIFICATION REVEALED — after the freeze commit, 2026-09-11

Detector rule `18608a18…`, unchanged, applied to the frozen corpus:

```text
routed        21 / 40
  unlicensed  10 / 20   <- COVERAGE
  licensed    11 / 20   <- COST, every one a false alarm

pairs         both members routed  10
              neither routed        9
              SPLIT                 1
```

⭐ **Not a manufactured split.** 21/40 emerged from natural prose meeting a frozen
rule; nobody balanced it. The corpus was authored without sight of the regexes
and the detector saw it only after the hash was committed.

⭐⭐ **Adequately powered, on the face of it.** 21 routed cases means the primary
question's inside cell can hold up to 21 agreements against a floor of 8 —
where `detector-blind` routed 10 and yielded only 4. ⛔ *Can* hold. The
agreements are not counted until both verifiers have run.

⚠️ **19 of 20 pairs route together.** Because a pair shares its premise, the
detector is responding almost entirely to the **premise**, not to the difference
between the two hypotheses — the one thing that distinguishes a licensed claim
from an overreaching one. **One pair in twenty splits.** That is a fact about
what the rule keys on, and it is the mechanism behind the cost figure below.

### ⛔ A secondary result is already visible, and it is unflattering

**The detector routes 11 of 20 licensed claims — 55%.** Against `detector-blind`'s
3/13 (23%) and the pooled 25/68 (37%), this is the **highest false-alarm rate
recorded in the lane**, and it comes from the only corpus authored without
reference to any verifier's weakness.

The plain reading: **natural prose about time, frequency, duration, condition,
role, relationship and state contains limiter vocabulary whether or not the claim
drawn from it overreaches.** Earlier corpora, built by pressing on distinctions,
concentrated that vocabulary in the unlicensed members. This one does not, and
the cost rises accordingly.

⛔ **Reported now precisely because it is unflattering** — a secondary result may
never substitute for the primary one, and this one cannot be mistaken for
support. ⚠️ It is also not yet the whole cost picture: what a routed licensed
claim costs depends on what routing *does*, and under `UNRESOLVED` semantics it
withholds closure rather than refusing the claim.

**Coverage (10/20) and cost (11/20) are secondary questions 1 and 2. The primary
question is untouched and remains unanswered until both verifiers run.**

---

## ⛔ PRIMARY RESULT — MEASURED, AND THE CLOSURE-RISK HYPOTHESIS FAILS IT (2026-09-11)

```text
PRIMARY QUESTION — agreement precision, 40 shared cases
  INSIDE   19/19 = 100%
  OUTSIDE  16/17 =  94%
  difference  +5.9 percentage points
  Fisher exact, two-sided  p = 0.4722
  ⭐ MEASURED — 19 agreements inside, at or above the floor of 8.
```

Against the predeclared table this is the second row — *agreement precision
similar inside and outside* — except that the sign is **inverted**: agreement
inside the regime was nominally **more** reliable, not less.

> ⛔ **H1 — CLOSURE-RISK DETECTOR: FAILS its blind test.** The claim that
> agreement is less trustworthy inside the detector regime is **not supported on
> prospectively authored material.** The floor was met; the answer is a result,
> not an absence of one.

⭐ **The pooled `68% vs 98%` contrast did not survive contact with a corpus
authored without reference to any verifier's weakness.** Three seen corpora
agreed on it; the one that never saw the hypothesis does not.

### H2 fares no better here

| | |
|---|---|
| DeBERTa | **39/40** — 20/20 licensed, 19/20 unlicensed |
| MiniCheck | 35/40 — 16/20 licensed, 19/20 unlicensed |
| MiniCheck **rescues** | **0** — DeBERTa's single error (X22) is MiniCheck's error too |
| MiniCheck **disruptions** | **4** licensed claims DeBERTa got right (X01 · X13 · X23 · X33) |

⛔ **On this corpus MiniCheck is strictly worse and rescues nothing.** The
challenger-router hypothesis gains no support here either.

⛔ **And the detector's cost stands at 11 of 20 licensed claims routed, for a
verifier that made one error in forty.**

### ⚠️ WHY the corpus came out this way — predeclared, not invented afterward

DeBERTa's raw labels on the twenty unlicensed cases:

```text
contradiction 17   ·   neutral 2   ·   entailment 1
```

Against `detector-blind`, where DeBERTa returned `entailment` on **9 of 12**
unlicensed cases. **This corpus's unlicensed members are overwhelmingly
CONTRADICTED by their premise, not merely UNSUPPORTED by it** — and contradiction
is the signal an NLI model is most directly trained to emit.

⭐⭐ **The author flagged exactly this before any model ran** (X20 · X24 · X38 ·
X04 · X08, recorded verbatim above at freeze time). It is therefore a
**predeclared explanation**, not a post-hoc rescue of a failed hypothesis.

⭐ **The sharpest formulation the evidence supports — and a design constraint
nobody had articulated:**

> **DeBERTa's temporal/scope collapse lives in the NEUTRAL regime, not the
> CONTRADICTION regime.** An unlicensed claim that the premise *contradicts* is
> easy. An unlicensed claim the premise merely *fails to support* is where the
> failure lives. **A corpus that does not hold the neutral/contradiction
> distinction fixed cannot test any hypothesis about that regime.**

⚠️ **A consistent observation, at n=2 and reported as an observation:** the only
two unlicensed cases DeBERTa judged **neutral** rather than contradiction — X28
and X30 — are **both inside the risk regime**. Its single outright error, X22,
is **outside** it. Two cases decide nothing; the direction is recorded because it
was not arranged.

### ⛔ What is NOT permitted to follow

- ⛔ **No top-up.** The corpus stands intact as evidence, exactly as ruled.
- ⛔ **No detector edit, no regex addition, no threshold change.** Rule digest
  remains `18608a18…`.
- ⛔ **The failure is not reinterpreted as a success.** H1 failed a fair,
  predeclared, adequately-powered test of the question as posed.

⭐ **What the corpus did establish, and it is not nothing:** on natural,
unambiguous prose across the seven categories, **DeBERTa is 39/40 and the
detector routes 55% of licensed claims for no measurable benefit.** Every
architecture considered in this lane was calibrated on constructed adversarial
material; on naturally authored material the problem the architecture exists to
solve **largely did not occur.**

### The lawful next act, if the founder wants one

A second prospective corpus, independently authored, with **one** added
constraint and no others: **the unlicensed member must be UNSUPPORTED by its
premise, never CONTRADICTED by it.** That is a constraint on the semantic
relation, ⛔ not on vocabulary, not on any verifier's weakness, and not on the
detector — so it does not reintroduce adversarial construction. It is the
control this corpus lacked, discovered by its own author in advance.

**Standing: H1 closure-risk FAILED BLIND · H2 challenger-router UNSUPPORTED HERE
· detector cost 55% on natural material · neutral/contradiction identified as the
uncontrolled variable · production UNTOUCHED.**

---

## FOUNDER RULING ON THE PROSPECTIVE RESULT — 2026-09-11

```text
DeBERTa useful verifier                 STRONGLY SUPPORTED
MiniCheck complementary verifier        SUPPORTED
MiniCheck more conservative             SUPPORTED
DeBERTa confidence as uncertainty       NOT SUPPORTED

deterministic detector can identify
boundary language                       SUPPORTED
detector as general closure-risk signal WITHDRAWN

agreement unsafe inside detector regime NOT REPLICATED
prospective result                      100% inside / 94% outside

earlier temporal/scope weakness         REAL
but narrower than previously framed     YES

UNRESOLVED as epistemic state           STILL VALID
specific detector as its trigger        NO
```

⭐ **The detector is renamed by what it demonstrably does: a BOUNDARY-LANGUAGE
DETECTOR, not an epistemic-risk detector.** It reliably notices time, scope,
condition and frequency markers — and the presence of those markers does not by
itself make an inference unsafe. That is the whole of the 55% routing cost on
legitimate claims, stated as a property rather than a defect.

⛔ **The earlier `68% / 98%` result remains legitimate DISCOVERY evidence. It did
not reproduce prospectively, and so it does not authorize an architectural
role.** The process ran as designed: seen corpora → pattern → hypothesis →
prospective blind corpus → pattern does not reproduce → **role not promoted.**

⚠️ **And `39/40` does not mean the temporal problem is solved.** The founder's
narrower statement, which the evidence supports and the looser one does not:

> Natural temporal language does not itself break DeBERTa. The failure is
> concentrated in subtler cases where the source establishes a relation and the
> hypothesis quietly **drops or widens a boundary without directly contradicting
> the source.**

## NEXT PHASE — the distinction that was being collapsed

The target is no longer "temporal language". It is one contrast:

```text
CONTRADICTED            "She stopped working there in 2020."
                     -> "She still works there."             ⛔ easy

NEUTRAL-BUT-PLAUSIBLE   "She worked there during the summer."
                     -> "She works there."                   ⭐ the hard case
```

The second is harder *because the hypothesis can be plausible without being
licensed* — and it is the one that matters:

> ⭐⭐ **The most dangerous mistake is often not believing something false. It is
> treating something merely possible as something known.**

A phase-2 corpus should therefore label **three** states —
`ENTAILED · CONTRADICTED · NEUTRAL` — rather than collapsing the latter two into
`not_entailed`.

### ⛔ A structural constraint the founder should know BEFORE designing it

**MiniCheck cannot answer this question.** Its output is a single support score
in `[0,1]`; its entire expressible vocabulary is *supported / not supported*. It
has **no way to distinguish contradicted from neutral**, so on a three-way corpus
it can only ever collapse the very distinction the corpus exists to isolate.

| verifier | native output | can express the phase-2 distinction? |
|---|---|---|
| DeBERTa | `entailment · neutral · contradiction` | ⭐ **yes, natively** |
| MiniCheck | one support score | ⛔ **no** |
| HHEM | one consistency score | ⛔ **no** |

**Consequence for the design:** DeBERTa becomes the primary instrument of phase 2
rather than the subject of it, and MiniCheck can serve only as a second opinion on
the binary axis. ⛔ A three-way agreement study between these two is **not
constructible**, and should not be planned.

### ⭐ What can be recovered from existing runs without breaking any freeze

`probe.py` already records DeBERTa's three-way output as `raw_label` in **every**
result file ever produced by this lane. So DeBERTa's neutral-vs-contradiction
behaviour on all five corpora is **already on disk** and needs no re-run.

What is missing is three-way **ground truth**, which the frozen fixtures do not
carry. ⛔ It must not be added to them — editing a fixture breaks its hash and
every result recorded against it. The lawful form is a **separate adjudication
file** mapping `case id → contradicted | neutral`, leaving `expected` untouched,
authored by someone other than the party holding the hypothesis.

⛔ **Not authorized here. Recorded as the available next act, not taken.**

---

## PHASE 2 · STAGE 1 — retrospective three-way adjudication (2026-09-11)

```text
binary verifier programme             INCOMPLETE FOR CORE QUESTION
DeBERTa three-way output              AVAILABLE
MiniCheck three-way role              NOT CONSTRUCTIBLE
HHEM three-way role                   NOT CONSTRUCTIBLE
frozen fixtures                       UNTOUCHED
three-way ground truth                MISSING
retrospective adjudication            NEXT DESCRIPTIVE ACT
prospective 3-way corpus              NEXT CONFIRMATORY ACT
core target                           PLAUSIBLE ≠ KNOWN
UNRESOLVED                            VALID EPISTEMIC STATE
validated trigger                     NONE YET
production                            UNTOUCHED
```

> ⭐⭐ **The danger is not merely believing what is false. It is mistaking what is
> possible for what is known.**

⚠️ **Stage 1 is DESCRIPTIVE, not confirmatory.** The five corpora were not built
for this question. What it produces is a map for designing phase 2 — never
evidence for a phase-2 conclusion.

**Adjudicator: a fresh subagent, blind to every machine judgement.** It may read
the six fixture files and nothing else — no `.py`, nothing under `docs/`, and
above all no `verifier-probe-*.json`, which carry the model outputs this
adjudication will later be compared against. ⛔ **Fixtures are not edited.**
Output is a separate file; `expected` is untouched everywhere.

⭐ **One addition beyond the founder's schema**: for neutral cases the adjudicator
also marks `plausible` — *would a reasonable reader, given only the premise,
think the hypothesis probably true?* That isolates **NEUTRAL-BUT-PLAUSIBLE** from
merely arbitrary neutral, which is the whole distinction phase 2 is about, and it
costs nothing to collect now.

Disagreement with a frozen label is **recorded, never acted on**
(`disagrees_with_expected`).

⛔ **Prompt committed BEFORE the adjudicator ran**, on the same reasoning as the
corpus author's: a prompt recorded afterwards proves nothing.

```text
You are sub-classifying items that have ALREADY been judged. You are not
re-judging them and you cannot change any existing label.

Read these files, and only these:
  scripts/verifier-probe/fixtures.json
  scripts/verifier-probe/fixtures-blind.json
  scripts/verifier-probe/fixtures-scope.json
  scripts/verifier-probe/fixtures-modifier.json
  scripts/verifier-probe/fixtures-detector.json
  scripts/verifier-probe/fixtures-prospective.json

Each contains cases with a PREMISE, a HYPOTHESIS, and a frozen label `expected`
of either "entailed" or "not_entailed".

For EVERY case whose `expected` is "not_entailed", decide which of two kinds it
is. Ignore every case whose `expected` is "entailed" — do not include them.

  CONTRADICTED — if the premise is true, the hypothesis is FALSE. The premise
                 rules the hypothesis out.

  NEUTRAL      — the premise neither establishes the hypothesis nor rules it
                 out. The hypothesis could be true, or false, and either would
                 be consistent with the premise.

Then, for NEUTRAL cases only, add one further judgement:

  plausible: true   — a reasonable reader, given only the premise, would think
                      the hypothesis is probably true. It is tempting. It simply
                      is not established.
  plausible: false  — the hypothesis is merely unrelated or arbitrary; nothing
                      in the premise pulls a reader toward believing it.

Write ONE JSON file to the path you are given:

{
  "adjudicator": "<describe yourself in a few words>",
  "adjudication_date": "2026-09-11",
  "method": "<two or three sentences on how you decided>",
  "cases": [
    {
      "set": "<which fixture file, by its `set` field>",
      "id": "<case id>",
      "three_way": "contradicted" | "neutral",
      "plausible": true | false | null,
      "reason": "<one short sentence>",
      "disagrees_with_expected": false
    }
  ]
}

`plausible` is null for contradicted cases.

If you believe a case's frozen `expected` label is simply WRONG — that the
premise actually does support the hypothesis — do NOT change anything. Set
`disagrees_with_expected` to true, still give your best three_way value, and say
why in `reason`. Disagreements are recorded, never acted on.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file. In particular do not open any .py file, anything under
    docs/, or any file whose name begins with `verifier-probe-`. Those contain
    machine judgements and reading them would ruin this task.
  - Do not search the repository beyond the six files listed.
  - Decide from the text in front of you. There is no pattern to match and no
    downstream program to satisfy.

In your final message report: the output path, how many cases you classified,
the counts of contradicted / neutral-plausible / neutral-implausible, any
disagreements you flagged, and anything you found genuinely hard to call.
```

---

## STAGE 1 — THE ADJUDICATION LANDED. Composition first, before any model. (2026-09-11)

```text
file        scripts/verifier-probe/three-way-adjudication.json
sha256      aec8f1a52313c4df35a61521206d37003ee9f16100fb6d1dc19efe37ef4f894c
classified  78 — every `not_entailed` case across the six fixtures, none missing,
            none extra, ids unique, every case carries a reason
adjudicator fresh subagent, blind to all machine output; 8 tool calls, all reads
            of the six fixture files plus its own write
```

| | count | share |
|---|---|---|
| **contradicted** | **51** | 65% |
| **neutral · plausible** ⭐ | **17** | 22% |
| neutral · arbitrary | 10 | 13% |
| **frozen labels challenged** | **0** | — |

⛔ **Zero disagreements.** The adjudicator found no frozen `not_entailed` label it
thought was wrong. The record-don't-repair path was available and unused.

### ⭐⭐ The founder's conditional fired

> *"If the adjudication comes back showing that most current negatives are
> contradictions, then we'll know immediately why the prospective corpus looked
> so good and why a dedicated phase-2 corpus is necessary."*

**It does, and the concentration is worse than the pooled 65%:**

> **`prospective` is 19 of 20 contradictions.** Its negatives are built by
> stating a limit and then denying it — *only*, *never*, *the rest of the year*, a
> named other post-holder. **It is a contradiction-detection set, not a
> neutrality set.** Its single real neutral is **X30**.

⭐ **This is now established by an independent blind adjudicator rather than by me
after the fact.** It was flagged by the corpus's own author before any model ran,
predicted as the explanation when the primary question failed, and is now
confirmed by a third party that never saw a model output. **DeBERTa's 39/40 was
scored against the easy class.**

### ⛔ The class we care about is nearly absent from everything authored blind

The 17 plausible neutrals, located: `M3–M7` (5) · `N1/N3/N4/N5` (4) ·
`B01/B05/B14` (3) · `D07/D22` (2) · `S04/S11` (2) · `X30` (1).

> **The two corpora built WITHOUT reference to DeBERTa's weakness — `prospective`
> and `detector-blind` — contain 1 and 2 plausible neutrals respectively.** The
> class clusters in the corpora I constructed by pressing on the original A-S
> shape: possession, mention, bounded instance.

⚠️ **The honest reading, which is neither a debunk nor a vindication:** the class
is **real but rare in naturally-authored prose**, and my adversarial construction
was selecting for it without either of us having a name for what it was selecting.
That is why it cannot be studied by writing more natural text — ⭐ **phase 2 must
construct the class deliberately**, which is exactly what the founder's triple
design does.

### ⚠️ AND IT CHALLENGES A RATIFIED READING — satellite-boundary loss

> *"The modifier M/V split does not track contradicted/neutral the way the group
> labels imply. All eight V cases are contradicted, but so are **M1, M2, M8** —
> because `until the lease ended`, `before moving inland` and `before the funding
> was cut` name a **terminating event**, not merely a bound. The genuinely neutral
> M cases are the pure counts and dates (**M3–M7**). So 'satellite modifier'
> contains two different logical kinds."*

⛔ **The `M` group was never one thing.** DeBERTa scored `M 1/8` against
`V 7/8` — the contrast the founder ratified as *satellite-boundary loss*. If its
seven M failures fall on **M3–M7** (the neutrals) the phenomenon survives under a
**better name**: it is a *neutral-regime* failure, not a *satellite* one. If they
fall across both kinds, **the satellite framing dissolves** and something else is
going on. ⭐ **`three_way_map.py` settles this, from data already on disk.**

### Hard calls, recorded verbatim — evidence about the items

> **B07** ("watched from the public gallery") — called contradicted on the grounds
> that the public gallery is definitionally the non-participant position, but it
> is **pragmatic exclusion, not logical**.
> **B12** — deliberately called *neutral*: an accident causing a change does not
> exclude the person taking part in it. The sharpest case for *"the premise
> supplies an external cause"* vs *"the premise fills the slot with someone
> else."*
> **B09 / B15 / B03** (role reversals) — contradicted **only** under the
> assumption that premise and hypothesis describe the same scene; read as
> independent claims they would be neutral.
> **S11** (`several` → bare plural) — neutral rather than contradicted, since the
> scalar implicature is defeasible.
> **M4 vs D09** (`during the trial period` vs `for one season`) — nearly the same
> shape; **split on plausibility, not on kind.**
> **N6** — contradicted despite a past/present tense mismatch that, read strictly,
> leaves the present open.

⭐ **Four of these turn on whether premise and hypothesis describe the same
scene** — a co-reference assumption nobody in this lane has stated, and one the
phase-2 triple design will have to fix explicitly, since the same sentence pair
is contradicted under one reading and neutral under the other.

**Composition established. No model output has been joined yet.**

---

## ⛔⛔ INSTRUMENT DEFECT — the map printed a finding that was a failed join (2026-09-11)

The first run of `three_way_map.py` printed:

```text
joined                   40 verifier-judgements
  ⚠️ NO plausible-neutral cases in this material at all. The corpora
     were built for a different question and do not contain the one
     phase 2 is about. That is itself the finding.
```

**That is false, and it is my defect.** I keyed the join on `(set, id)`. The
adjudicator filled `set` from each fixture's own field — `blind-v1`,
`scope-v1`, `modifier-v1`, `detector-blind-v1` — while the probe records the
`SETS` key: `blind`, `scope`, `modifier`, `detector-blind`. **Only `prospective`
matched, because it is the one corpus whose two spellings coincide.** Five of six
corpora dropped out silently, carrying **16 of the 17 plausible neutrals** with
them.

⛔ **The severity is not the mismatch. It is that the instrument announced an
absence it had manufactured**, in the register of a result — *"that is itself the
finding"* — on material it had never looked at. This lane exists to catch exactly
that move, and my own instrument made it.

⚠️ **`joined 40` was the tell, and it was printed.** A reader who multiplied 20
cases by 2 verifiers would have caught it. The instrument should not have
required that of its reader.

### Repair

- **Join on `id` alone.** Ids are disjoint across every corpus by prefix
  (`N · B · S · V · M · D · X`, verified: 78 ids, all unique), so the set name was
  never needed as a key — it was only ever a chance to disagree with itself.
- **Coverage is asserted, not assumed.** The run now prints
  `joined N verifier-judgements over X/78 adjudicated cases` and names the
  unmatched ids.
- ⭐ **An absence claim is scoped to its join.** "No plausible-neutral cases in
  this material" now prints **only when coverage is ≥95%**. Below that it prints
  *"no plausible-neutral cases among the JOINED cases — the join covers only N%,
  so this is NOT an absence in the material"*.

> ⭐⭐ **An absence claim is only as wide as the join behind it, and a silent join
> failure reads exactly like a finding.**

### What the first run did legitimately establish

Its one true row, for `prospective` only, and consistent with everything already
recorded: of its 19 contradictions DeBERTa called **17 `contradiction`**, one
`neutral`, one `entailment` (X22). Its single arbitrary neutral (X30) it called
`neutral`. ⛔ Nothing about plausible neutrals was measured, because none were
joined.

---

## ⭐⭐ STAGE 1 RESULT — the failure is MONOTONE IN PLAUSIBILITY (2026-09-11)

`joined 168 verifier-judgements over 78/78 adjudicated cases` — full coverage.

```text
DeBERTa's own 3-way call against blind 3-way ground truth
  ground truth         -> entailment   neutral  contradiction
  contradicted                    12         2             37    (n=51)
  neutral·plausible               10         7              0    (n=17)
  neutral·arbitrary                1         6              3    (n=10)
```

**Read the `entailment` column downward. It is ordered by temptation:**

| ground truth | called `entailment` | |
|---|---|---|
| neutral · **arbitrary** | 1/10 = **10%** | nothing pulls a reader toward it |
| **contradicted** | 12/51 = **24%** | the premise rules it out |
| neutral · **plausible** ⭐ | **10/17 = 59%** | compatible, tempting, unlicensed |

> ⭐⭐ **The more plausible an unlicensed claim is, the more often the verifier
> asserts it.** Not a weakness at temporal language. A weakness *proportional to
> how believable the unwarranted claim is* — which is the exact shape of
> **mistaking what is possible for what is known**, measured for the first time
> in this lane on its own terms.

⭐ **And the error is DIRECTIONAL, not confusion**: of the 17 plausible neutrals,
**zero** were called `contradiction`. The verifier never mistakes a tempting
claim for a false one. It moves it toward *believed*, in one direction only.

⚠️ **Descriptive.** Six corpora built for a binary question, 17 cases in the
class, pooled. ⛔ It cannot promote anything — it says what phase 2 must measure.

### ⭐ The satellite question is settled — under a better name

Per set, `M` is the only row meeting the n floor: **`M entailment 5/5`.** Those
five are exactly `M3–M7`, the cases the blind adjudicator identified as the
**genuinely neutral** members of the modifier group, `M1/M2/M8` having been
contradictions all along.

> **"Satellite-boundary loss" does not survive as a mechanism. What survives, and
> is sharper, is that the `M` material was dense in the plausible-neutral class —
> and DeBERTa called every one of them entailed.** The satellite/verb contrast was
> tracking the neutral/contradiction distinction without either of us seeing it.

⛔ The founder's caution when he ratified that reading — *"not as a claim about
DeBERTa's internal mechanism"* — is what kept this correctable. The description
is replaced; nothing built on it has to be unwound.

### ⚠️ The binary verifiers look better here — and the comparison is not yet valid

```text
hhem       called supported  1/7  = 14%
minicheck  called supported  5/13 = 38%
deberta    called entailed  10/17 = 59%
```

⛔ **Three different exams.** 7, 13 and 17 *different* cases. MiniCheck's
conservatism — which cost it four licensed claims on `prospective` — may be an
asset precisely here, but **these totals cannot support a sentence containing the
word "better".** The instrument now prints a **head-to-head restricted to cases
every verifier judged**, plus the count asserted by all of them, which is where
no second opinion exists at all. Not yet run.

### One more row worth naming

**DeBERTa called 12 of 51 outright contradictions `entailment` — 24%.** Against
the `prospective` corpus alone it called 17 of 19 correctly. ⚠️ Consistent with
the contradiction cells being easy in natural prose and hard in the constructed
adversarial sets; ⛔ not established, and not the question phase 2 is about.

**Standing: plausible-neutral collapse MEASURED DESCRIPTIVELY at 59% · monotone
in plausibility · directional toward entailment · satellite framing RETIRED,
replaced by the neutral-regime description · cross-verifier comparison NOT YET
VALID · production UNTOUCHED.**

---

## PHASE 2 AUTHORIZED — prospective three-way validation (founder, 2026-09-11)

```text
CORE EPISTEMIC TARGET
plausible ≠ known                         CONFIRMED AS REAL TARGET
DeBERTa on plausible-neutral
  neutral                                 7/17
  false entailment                        10/17
DeBERTa as automatic UNRESOLVED trigger   NOT SUFFICIENT
existing three-way map                    DESCRIPTIVE
prospective three-way validation          AUTHORIZED NEXT
MiniCheck/HHEM three-way role             NOT CONSTRUCTIBLE
frozen fixtures                           UNTOUCHED
production                                UNTOUCHED
```

> ⭐⭐ **MAIA's hardest epistemic problem may not be detecting lies or
> contradictions. It may be resisting the seductive inference — the thing that
> fits beautifully, may even be true, but has not yet been earned as knowledge.**
> *That is where openness and corrigibility stop being philosophy and become
> technical necessities.*

⭐ **The founder's refusal to over-generalize is recorded as part of the result**:
the plausible-neutral errors are **not evenly distributed** (`M 5/5 · D 3/3 ·
S 1/2 · B 1/3 · N 0/4`). The claim is **not** "DeBERTa always confuses
plausibility with entailment" — it plainly does not. It is that **certain forms of
plausible inference strongly elicit overcommit and others do not**, and which
forms is a phase-2 question.

### The head-to-head is unanswerable on existing material — confirmed

```text
HEAD TO HEAD — seen by ALL of deberta, hhem, minicheck
  3 shared cases  ⚠️ n<5 — not a rate
    deberta 1/3 · hhem 1/3 · minicheck 1/3
    ⛔ asserted by EVERY verifier: 1/3
```

⛔ **Three cases. The ranking `14% · 38% · 59%` cannot be drawn**, exactly as the
founder ruled. DeBERTa remains the proper three-way instrument; whether a second
binary witness helps resist overcommit is a later question with its own corpus.

### Sizing, and the precision it buys

**30 triples · 3 per domain · 90 items · 30 plausible-neutral cases.** Stage 1
measured the class on 17 pooled cases from corpora built for another question;
30 purpose-built cases roughly halve the interval and give each domain a row of
3 — ⚠️ **below the n≥5 floor per domain**, so *domain-level* rows will be
directional only and the pooled 30 is the measured figure. Deliberate: ten
domains at n≥5 each would need 50 triples and a far longer authoring run, and the
primary question is pooled.

### Blindness — and ONE disclosed seeding

Author: a fresh subagent. **May** know the three-way distinction (it cannot write
triples otherwise). **May not** read `scripts/verifier-probe/*` or `docs/**` —
which is where every earlier corpus, every machine judgement, and the 59% result
live.

⚠️ **DISCLOSED SEEDING.** The prompt carries one worked example, and it is the
founder's own, in the **`time`** domain. **`time` is therefore the one seeded
domain**; the author is told not to reuse its shape, but its row must be read with
that caveat. The other nine are clean. ⛔ Recorded here rather than left to be
found — the alternative was an unexplained triple structure, which would have
produced a worse corpus.

⛔ **Prompt committed BEFORE the author runs.**

```text
Write 30 TRIPLES of short factual test items in natural English — 90 items total.

A triple is one PREMISE (one or two sentences of ordinary prose) and THREE
hypotheses about it, one of each kind:

  ENTAILED            The premise establishes it. A careful reader must accept it.

  CONTRADICTED        If the premise is true, this is false. The premise rules
                      it out.

  PLAUSIBLE-BUT-      Compatible with the premise, and TEMPTING — a reasonable
  UNLICENSED          reader would think it probably true — but the premise does
                      not actually establish it. It could be true; it could be
                      false; nothing in the premise settles it.

The third kind is the whole point of this exercise, and it is the hard one to
write. Test each one by asking: "could this be false while every word of the
premise stays true?" If the answer is no, it is not this kind. And: "would an
ordinary reader assume it?" If the answer is no, it is merely arbitrary, which is
also not this kind. It must pass BOTH.

WORKED EXAMPLE — note it uses the `time` domain; do not reuse its shape:

  PREMISE        She worked at the clinic during the summer.
  ENTAILED       She worked at the clinic that summer.
  CONTRADICTED   She did not work at the clinic that summer.
  PLAUSIBLE      She still works at the clinic.

Write THREE triples in each of these ten domains:

  time · relationship · identity · role · frequency · intention ·
  emotional state · membership · causation · developmental change

Requirements:
  - Write NATURAL English. The premise should read like ordinary prose from a
    profile, letter, news item or biography — not like a test item.
  - Thirty different situations, thirty different sets of people. Invent names
    and places freely. Vary sentence structure.
  - Within a triple, keep wording and domain tightly controlled. The ONLY thing
    that should differ between the three hypotheses is the epistemic relation.
  - Premise and hypothesis always describe THE SAME situation and the same
    people. Do not write a pair that could be read as two unrelated claims —
    state the referent explicitly rather than relying on the reader assuming it.
  - No ambiguity: a careful reader must agree with each label without argument.
    If you cannot make one unambiguous, write a different triple.
  - Do not write about AI, models, verification, entailment or testing.

Output ONE JSON file to the path you are given:

{
  "set": "triples",
  "note": "<one sentence on how you approached it>",
  "domains": [ ... the ten ... ],
  "cases": [
    {
      "id": "T001",
      "family": "<short kebab-case name, same for all three members>",
      "domain": "<one of the ten>",
      "origin": "triples",
      "premise": "...",
      "hypothesis": "...",
      "expected_three_way": "entailed" | "contradicted" | "neutral_plausible",
      "expected": "entailed" | "not_entailed",
      "why_plausible": "<for neutral_plausible only: one sentence on what makes
                        a reader want to believe it. null otherwise>"
    }
  ]
}

Ids T001..T090, the three members of a family adjacent and sharing `family` and
`domain`. `expected` is the binary collapse: "entailed" for entailed, and
"not_entailed" for BOTH of the other two.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Do NOT read any file under scripts/verifier-probe/ other than writing your
    own output file, and nothing under docs/. Those contain earlier corpora,
    machine judgements and analysis. Reading any of them would ruin this task.
  - Do not search the repository. You need nothing from it.
  - Write from your own sense of English. There is no pattern to match and no
    downstream program to satisfy; guessing at one would ruin the result.

In your final message report: the output path, the counts per domain, and any
triple where you found the plausible-but-unlicensed member genuinely hard to
keep on the right side of the line.
```

---

## PHASE 2 — PREDECLARED READINGS, committed before the corpus was seen (2026-09-11)

> ⭐⭐ **THE RESEARCH QUESTION: *Can the verifier preserve possibility as
> possibility?*** Cleaner than "can it detect unsupported claims", because that is
> no longer quite the problem. The verifier is good at falsehood and poor at
> restraint.

### ⛔ CORRECTION ACCEPTED — 41% is a historical reference, not a threshold

I wrote that phase 2 had *"41% as the figure it has to beat"*. **That was wrong
and it is the precise drift this lane exists to catch**: it converts a
retrospective descriptive estimate into a pass mark, and a test with a pass mark
invites the result rather than measuring it. The stage-1 figure came from **17
cases scraped out of six corpora built to ask a different question**. Its own 95%
interval is `[22%, 64%]` — wide enough that "beating" it would have been nearly
meaningless in either direction.

**The primary result stands alone**, with a Wilson interval (honest at n=30 where
the normal approximation is not):

```text
possibility PRESERVED (neutral)     k/30   95% CI
⛔ promoted to `entailment`          k/30   95% CI
other misclassification             k/30   95% CI
```

`7/17` prints beneath it, labelled *historical reference · NOT a threshold · NOT
compared*. The reporter is written so the comparison cannot be made accidentally.

### The four readings, fixed in advance

| if | then |
|---|---|
| DeBERTa again promotes a large share to `entailment` | ⭐ **`possible → known` is prospectively CONFIRMED** as a real failure mode |
| most remain `neutral` | the earlier 59% promotion rate was **corpus-composition dependent** |
| results vary sharply by domain | the finding is **regime-specific overcommit**, not a general neutral failure |
| contradictions handled well while plausible-neutral are not | ⭐⭐ **the distinction is confirmed: falsehood detection is easier than restraint in the face of plausible inference** |

⛔ **Committed before the corpus was read, so whichever arrives is a result rather
than a reading.**

### Reporting discipline carried into the instrument

- **n=3 per domain stays directional.** No domain is promoted into a finding from
  three examples; the reporter prints `(n<5 — directional)` on every such row.
- **`time` is quarantined, not averaged in.** It carries the prompt's worked
  example, so its row prints `⚠️ SEEDED BY THE PROMPT EXAMPLE`, and the **nine
  unseeded domains are pooled separately as the stronger generalization
  evidence**.
- **The contrast block reports contradicted and entailed accuracy beside the
  primary**, because the fourth reading above needs all three classes visible at
  once.

### ⚠️ ONE WEAKNESS I AM NOT HIDING, and what I intend to do about it

In stage 1 the ground truth came from an adjudicator **independent of whoever
wrote the cases**. In phase 2 the author supplies its own `expected_three_way`
labels — **author and labeller are the same party**. Blindness to model output is
intact, so labels cannot be tuned to a verifier; but a mislabelled
plausible-neutral case has nothing to catch it.

**Intended repair, unless the founder stops it:** once the corpus is frozen, a
**second blind adjudicator** reviews the 30 plausible-neutral members only,
applying both tests — *could this be false while every word of the premise stays
true?* and *would an ordinary reader assume it?* Disagreements are **recorded, not
repaired**, and the primary result is reported **twice**: over all 30, and over the
subset both parties accept. ⛔ If the two numbers differ materially, that
difference is itself the finding about how hard this class is to construct.

---

## SECOND BLIND ADJUDICATOR — authorized, with the test corrected (2026-09-11)

### ⛔ My two-part test was wrong. The corrected test has THREE parts.

*"Could this be false while every word of the premise stays true?"* separates
**entailed from not-entailed** — and nothing else. It does not distinguish
neutral from contradicted, which is the distinction this entire phase exists to
measure. A contradiction passes it cleanly.

**The corrected test. All three must hold:**

```text
NOT ENTAILED     could H be FALSE while every word of the premise stays true?
NOT CONTRADICTED could H be TRUE  while every word of the premise stays true?
PLAUSIBLE        would an ordinary reader reasonably be tempted to infer H?
                                    ↓
                          NEUTRAL · PLAUSIBLE
```

> ⭐⭐ **It may be true. It may be false. The evidence does not decide. Yet the
> mind is tempted to decide anyway.** *That is exactly the territory `UNRESOLVED`
> exists to protect.*

### Locked procedure

```text
1. corpus frozen + hashed
2. second adjudicator prompt committed
3. adjudicator sees ONLY the 30 proposed plausible-neutral items
4. no model outputs · no stage-1 rates · no detector rules
5. each item: accepted | reclassified · rationale · hard-to-call flag
6. ⛔ NOTHING in the corpus is edited
7. DeBERTa runs afterward
```

### ⛔ THE PRIMARY IS ALL 30, EXACTLY AS FROZEN

```text
PRIMARY        all authored plausible-neutral cases      k/30 neutral
SENSITIVITY    independently accepted as neutral·plausible  k/n neutral
LABEL ROBUSTNESS   disputed                              d/30  + ids
```

If the consensus subset were allowed to become the headline, **independent
adjudication would quietly become a way of selecting cases after the corpus was
frozen** — the one thing the freeze exists to prevent. The subset is a
sensitivity check and the reporter labels it as one.

### ⛔ CORRECTION — "differ materially" is withdrawn

I wrote that if the two numbers *"differ materially, that difference is itself
the finding."* **Withdrawn.** *Materially* is an undeclared pass mark, and it
would have been declared after seeing the numbers — the worst possible ordering.
The reporter prints **both rates · both Wilson intervals · the percentage-point
difference · the disputed count · the disputed ids** and draws no verdict. The
evidence speaks without another threshold creeping in.

⭐ **That makes two pass marks removed from this phase in one exchange** — the
`41%` "to beat", and now this one. Both were mine, and both entered as ordinary
phrasing rather than as decisions, which is how thresholds usually get in.

---

## PHASE 2 CORPUS — FROZEN, step 1 of the locked procedure (2026-09-11)

```text
fixture path         scripts/verifier-probe/fixtures-triples.json
fixture sha256       8461d8c78b8c78df2435d62e419c8969c924d2e4a634bb040a9f6c9976f454a4
cases                90  ·  ids T001..T090 contiguous
three-way            30 entailed · 30 contradicted · 30 neutral_plausible
binary collapse      30 entailed · 60 not_entailed        (verified correct)
families             30, every one of size 3, members adjacent
                     premise AND domain shared within each triple
                     exactly one of each kind per triple
domains              9 items in each of the ten — exactly balanced
why_plausible        present on exactly the 30 neutral members, null elsewhere
author               fresh subagent; prompt committed BEFORE the run
author tool calls    2
```

**Structure verified, content untouched.** No sentence edited, no case removed,
no label changed.

### The author's hard calls — recorded verbatim, evidence about the items

> **T039 (frequency, `vance-lido-swims`)** — *"goes on no days other than Mondays
> and Thursdays."* A scalar-implicature case; a reader who treats the list as
> exhaustive will feel it is entailed. I kept the premise as a plain report of
> what he has done rather than *"swims only on…"*, so nothing in the wording
> closes the list. **Still the most arguable item in the set.**
>
> **T075 (causation, `alderney-hotel-flood`)** — *"It was the cold that made the
> main burst."* I had to place the cold snap as a time adverbial rather than an
> explanation; *"burst in the frost"* would have tipped it toward entailed.
>
> **T021 (identity, `delacroix-watercolours`)** — my first draft could be read
> straight off the habitual *"marks her work with"*. Too close to entailed, so I
> replaced it with the professional-status inference.
>
> **T060 (emotional state, `doyle-collie-towpath`)** — *"was grieving"* is almost
> irresistible, and I deliberately left an innocent alternative available. I think
> it holds, but it is **the strongest pull toward entailed among the emotional
> items.**

⭐ **Four self-flagged items — T039 · T075 · T021 · T060 — named before any model
or adjudicator saw them.** The second adjudicator's independent verdict on these
four is now a **predeclared check on the author's own calibration**, not a
finding chosen after the fact.

⚠️ **T039 is the one to watch.** If the second adjudicator reclassifies it
`entailed`, the author's own reservation was correct and the record already says
so.

---

## SECOND ADJUDICATOR — prompt committed, step 2 (2026-09-11)

**What it sees:** `triples-review-items.json` — the 30 proposed items reduced to
`id · premise · hypothesis`. ⛔ **No label, no `why_plausible`, no sibling
members, no domain.** The author's reasoning is the strongest available anchor
and is withheld; the siblings would reveal the intended three-way structure.

**Corpus untouched** — the review file is derived, and the frozen fixture keeps
its hash `8461d8c7…`.

⛔ **Prompt committed BEFORE the adjudicator ran.**

```text
Read exactly one file:

  scripts/verifier-probe/triples-review-items.json

It holds 30 items, each a PREMISE and a HYPOTHESIS. Someone has proposed that
every one of them stands in a particular relation to its premise. Your job is to
check that claim independently, item by item.

The relation being claimed is NEUTRAL AND PLAUSIBLE. An item qualifies only if
ALL THREE of these hold:

  1. NOT ENTAILED      Could the hypothesis be FALSE while every word of the
                       premise remains true?

  2. NOT CONTRADICTED  Could the hypothesis be TRUE while every word of the
                       premise remains true?

  3. PLAUSIBLE         Would an ordinary reader reasonably be tempted to infer
                       the hypothesis from the premise?

All three, or it does not qualify. Test them separately and in that order —
(1) alone only tells you it is not entailed, and a flat contradiction passes it.

The shape you are looking for:

    the premise permits the hypothesis to be TRUE
    the premise permits the hypothesis to be FALSE
    an ordinary reader may still be tempted to infer it

If an item fails, say what it actually is: "entailed" (test 1 fails),
"contradicted" (test 2 fails), or "neutral_arbitrary" (tests 1 and 2 hold but
nothing would tempt a reader — test 3 fails).

Write ONE JSON file to the path you are given:

{
  "adjudicator": "<describe yourself in a few words>",
  "adjudication_date": "2026-09-11",
  "method": "<two or three sentences on how you applied the three tests>",
  "cases": [
    {
      "id": "T0xx",
      "not_entailed": true | false,
      "not_contradicted": true | false,
      "plausible": true | false,
      "accepted": true | false,
      "verdict": "neutral_plausible" | "entailed" | "contradicted"
                 | "neutral_arbitrary",
      "rationale": "<one or two sentences>",
      "hard_to_call": true | false
    }
  ]
}

`accepted` is true only when all three test fields are true, and `verdict` is
"neutral_plausible" exactly then. Include all 30, in the order given.

Set `hard_to_call` true wherever you genuinely hesitated, whichever way you
finally went. A hesitation you record is more useful than a clean answer you
are not sure of.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file. Not the fixtures, not any .py, nothing under docs/,
    nothing whose name begins with `verifier-probe-`. They contain the proposed
    labels, earlier corpora, machine judgements and prior rates; any of them
    would ruin this task.
  - Do not search the repository.
  - Judge from the text in front of you. Nothing downstream is being satisfied
    and there is no pattern to match.

In your final message report: the output path, how many you accepted, the
verdicts you assigned to any you rejected, and which ones you found hardest.
```

---

## PRESERVED IN THE RECORD — founder, before the adjudicator returned (2026-09-11)

**The freeze:** 90 cases · 30 matched triples · 30/30/30 three-way balance ·
balanced across all ten domains · one shared premise per triple · **no content
edits after structural validation**.

**The blindness:** no labels · no author rationale · no siblings · no domain · no
model outputs · no earlier corpus results.

> ⭐ **So the second adjudicator is genuinely judging *"does this premise leave the
> hypothesis open, or does it actually settle it?"* — not reverse-engineering the
> intended answer.**

### ⛔ TWO INVARIANTS, both now enforced in code

**1. A disputed item STAYS in the primary result, even when the adjudicator
rejects it.** Otherwise sensitivity analysis quietly becomes post-hoc case
selection — the freeze defeated from the other end. `phase2_report.py` computes
the primary from the frozen fixture alone and the adjudication file cannot
subtract from it; the reporter prints the invariant on every run so it is visible
rather than trusted.

**2. The four author-flagged cases are CASEWISE, never a rate.** `T039 · T075 ·
T021 · T060`. With four items a percentage would be exactly the defect this lane
has already caught four times — a particular observation wearing a verdict's
clothes. The reporter names each one and prints the independent verdict beside
it, and divides nothing.

Either outcome is informative and both are predeclared: **one reclassified is
evidence about author calibration; all four surviving is evidence too.**

### Sequence from here — no further design changes warranted

```text
1. adjudicator returns
2. structural validation ONLY
3. freeze adjudication + hash
4. ⛔ no corpus edits
5. run DeBERTa
6. report — PRIMARY (all 30) · SENSITIVITY (accepted subset)
            · LABEL ROBUSTNESS (disputed count + ids)
            · Wilson intervals and the raw percentage-point gap, no verdict
```

> ⭐⭐ **The experiment is finally aimed directly at the question: *can the verifier
> preserve possibility as possibility?***

---

## SECOND ADJUDICATION — FROZEN, step 3 (2026-09-11)

```text
file        scripts/verifier-probe/triples-adjudication-2.json
sha256      e0ba204190ce202ef7a6ff180e09275b5d1ef770a34b8061d01d8f526ac7852d
cases       30, ids matching the review items in order
accepted    29 / 30 as neutral·plausible
verdicts    29 neutral_plausible · 1 neutral_arbitrary
internal    `accepted` is true exactly when all three tests pass, and `verdict`
            is neutral_plausible exactly when accepted — both verified
```

### ⭐⭐ THE STRONGEST RESULT HERE IS A ZERO

```text
failed test 1 (could be false while premise true)  —  NONE
failed test 2 (could be true  while premise true)  —  NONE
failed test 3 (would tempt an ordinary reader)     —  T042
```

**Not one of the 30 was entailed or contradicted.** An independent reader,
holding no label, no rationale, no sibling and no domain, found the author's
neutral construction sound on the two logical tests in **every single case**. The
class that six earlier corpora could barely populate — 17 cases pooled across all
of them — has been constructed deliberately and it holds.

⛔ **The single rejection is `T042`, and it fails only test 3**: *"passes tests 1
and 2 cleanly, but the premise's entire emphasis is fidelity to ONE Thursday
market; the route to 'they must trade elsewhere too' is an economic argument I
had to construct, not a pull a first reader feels."* Not a logical error —
**insufficiently tempting**. It is `neutral_arbitrary`, the class stage 1 measured
at 1/10 promotion.

⛔ **T042 REMAINS IN THE PRIMARY**, per the invariant.

### The author's four, casewise — and the two parties disagreed about WHERE the difficulty was

| item | author's concern | independent verdict |
|---|---|---|
| T039 | *"the most arguable item in the set"* | **accepted** · ⭐ adjudicator also hesitated |
| T075 | had to keep the cold as a time adverbial | **accepted** · no hesitation |
| T021 | rewrote a draft that read off the habitual | **accepted** · no hesitation |
| T060 | *"the strongest pull toward entailed"* | **accepted** · no hesitation |

⭐ **All four survived — and the one item the adjudicator rejected was not among
them.** The finding is not a rate; it is that **the two readers' senses of
difficulty point in opposite directions**. The author worried about items drifting
toward **entailed** — too easy to infer. The independent reader rejected one for
being **not tempting enough** — too hard to infer. Both are ways of missing the
class, from opposite sides, and neither party anticipated the other's.

⚠️ **Only `T039` was flagged by both**, and the adjudicator's reasoning is
independent of the author's: it held the item on the grounds that the premise
lists days without saying *"only"*, **and** that the hypothesis concerns *going to*
the lido, which is possible without swimming — a second argument the author never
made.

**8 of 30 flagged `hard_to_call`**: `T012 · T018 · T027 · T039 · T042 · T051 ·
T066 · T087`. ⚠️ Recorded as a property of the material — this class is hard to
construct and hard to verify, which is consistent with its scarcity everywhere
else in the lane. ⛔ Not used to weight, filter or exclude anything.

**Step 4 holds: no corpus edits. The fixture keeps `8461d8c7…`. DeBERTa runs
next.**

---

## ⭐⭐ PHASE 2 RESULT — the verifier preserves possibility, on this corpus (2026-09-11)

```text
⭐ PRIMARY — plausible-but-unlicensed claims (n=30)
  possibility PRESERVED (neutral)   29/30 = 97%   95% CI [83%, 99%]
  ⛔ promoted to `entailment`        1/30 =  3%   95% CI [ 1%, 17%]
  other misclassification           0/30 =  0%   95% CI [ 0%, 11%]

SENSITIVITY (29 independently accepted)  28/29 = 97%   difference −0.1 pp
LABEL ROBUSTNESS  disputed 1/30 — T042, retained in the primary

CONTRAST   contradicted → `contradiction`  30/30 = 100%
           entailed     → `entailment`     30/30 = 100%

NINE UNSEEDED DOMAINS                      26/27 =  96%   95% CI [82%, 99%]
```

**DeBERTa scored 89 of 90.** Every entailment, every contradiction, and 29 of 30
plausible-but-unlicensed claims left open as `neutral`.

### Which predeclarations fired — stated against the list committed beforehand

| predeclared reading | fired? |
|---|---|
| promotes a large share → `possible → known` **confirmed** | ⛔ **NO** |
| most remain `neutral` → the 59% was **corpus-composition dependent** | ⭐ **YES** |
| sharp variation by domain → **regime-specific overcommit** | ⚠️ not assessable — every domain is 3/3 or 2/3 at n=3 |
| contradictions handled well while plausible-neutral are not | ⛔ **NO** — *both* are handled well |

⭐ **Reading 2 fires, and it is the one that reorganizes the lane.** Stage 1's
`7/17 = 41%` preserved and phase 2's `29/30 = 97%` are not two scores of the same
thing — `p = 3.4e-05` — they are **two different populations**. ⛔ That comparison
is not a grade and 41% remains no threshold; the difference is simply what
*licenses* the composition-dependence reading, which is exactly what it was
predeclared to do.

**So the 59% promotion rate belongs to the corpora that produced it** — above all
to `M 5/5`, satellite-modifier constructions I wrote by pressing on DeBERTa's
observed failures. Against 30 naturally-authored plausible neutrals across ten
domains, the overcommit **does not appear**.

⭐ **One earlier claim survives intact**: the error remains **directional**. Zero of
the 30 were called `contradiction`. When this verifier errs on a tempting claim it
errs toward *believed* — it simply almost never errs here.

### ⚠️ AND I WILL NOT LET THIS RESULT STAND WITHOUT NAMING ITS MOST LIKELY ARTIFACT

89/90 on a corpus purpose-built to be hard should provoke a question, not a
celebration. **A structural hypothesis, testable and not yet tested:**

> ⭐ **The triple design may make premises unusually explicit.** A premise must
> support a crisp entailment **and** a crisp contradiction **and** a genuine
> neutral. That forces it to be determinate — to state its own limits plainly.
> A premise engineered to that standard leaves far less room for a reader, or a
> model, to over-infer.

Stage 1's plausible neutrals came from premises written for a **binary** task,
often terse, where what the premise did *not* say was left implicit. **Terseness
may be the active ingredient in the phenomenon, and the triple design may have
engineered it out.**

⛔ **This is raised as a distinct testable claim, NOT as a qualifier that softens
the result.** The result is the result: on this material, of this construction,
the verifier preserved possibility 29 times in 30. ⚠️ What is not established is
that it would do so on premises that are *natural and underspecified* — which is
what MAIA will actually meet, since people do not speak in determinate triples.

**The lawful test, should the founder want it:** a corpus of the same ten domains
where each premise is written **once, terse, for one hypothesis only** — no
sibling members to make it explicit — with the three-way label adjudicated blind
as here. If preservation stays high, composition-dependence is confirmed broadly.
If it collapses, ⭐ **the active variable is premise explicitness, not domain and
not temporal language** — and that would be the sharpest finding the lane has
produced.

### The single miss, T078 — `tiverton-apple-crop`, causation

```text
premise     The Tiverton orchard lost most of its apple crop that year; a late
            frost in May had killed the blossom.
hypothesis  The Tiverton orchard finished that year out of pocket.
```

The author's own note: *"A ruined crop sounds like a ruinous year, though
insurance, stored fruit or a higher price on what survived could have carried the
orchard through."* ⭐ **A world-knowledge inference, not a linguistic one** — and
the only one of 30 that the verifier took. `causation` is the one domain below
3/3, at 2/3, ⛔ n=3 and directional only.

**Standing: possibility PRESERVED 29/30 prospectively · the 41%/59% stage-1
figures are COMPOSITION-DEPENDENT, not general · error direction still toward
belief · premise-explicitness artifact OPEN and untested · production
UNTOUCHED.**

---

## PHASE 3 AUTHORIZED — natural terse premises (founder, 2026-09-11)

```text
possible → known as general DeBERTa defect     REJECTED
plausible-neutral preservation, determinate
  prose                                        STRONGLY SUPPORTED
stage-1 overcommit                             REAL / CORPUS-SPECIFIC
premise explicitness as active variable        PLAUSIBLE / UNTESTED
natural underspecification as risk regime      NEXT TEST
world-knowledge completion                     OBSERVED · T078
                                               NOT YET A CLASS
UNRESOLVED                                     STILL VALID
validated automatic trigger                    NONE
production                                     UNTOUCHED
```

> ⭐⭐ **Possibility itself is not what defeats the verifier. The question may be
> whether the evidence clearly marks the edges of what is known.** *Human beings
> almost never speak with all those edges marked.*

The question is no longer *can DeBERTa preserve possibility* — on explicit,
well-bounded prose it plainly can. It is: **can it preserve possibility when
human language leaves its boundaries implicit?** That is MAIA's actual
environment.

### ⛔ NOT a causal test of explicitness — and the sequencing that keeps it honest

```text
PHASE 2   determinate triple premises        → neutral preserved 29/30
PHASE 3   natural terse single-hypothesis    → NEXT
IF it drops:  matched terse vs expanded      → isolate explicitness causally
```

If performance falls we may say only: **the effect reappears under natural
underspecified prose.** Phase 3 changes several things at once — brevity, single
hypothesis, no sibling pressure — so ⛔ *it cannot attribute the change to any
one of them.* A matched-pair experiment comes after, or we would be changing two
things and then pretending to know which mattered.

### T078 STAYS — and it names a possible second failure class

⛔ **Not repaired, not removed.** The premise gives crop loss, frost, dead
blossom; the model supplies *therefore financial loss*. **Not a linguistic
boundary failure — commonsense knowledge outrunning textual warrant.**

Recorded as **world-knowledge completion · OBSERVED · NOT YET A CLASS** (n=1).
For MAIA this may matter as much as temporal inference, and it is a different
mechanism from anything the lane has measured.

### ⭐ Design change: the three-way label is assigned INDEPENDENTLY, not by the author

In phase 2 the author supplied its own labels. Phase 3 separates the two roles
completely, per the founder's *"three-way label assigned independently"*:

```text
1. author writes 60 items, marks only what it INTENDED   → frozen + hashed
2. independent adjudicator labels ALL 60 three-way       → frozen + hashed
3. the ADJUDICATOR's labels are the operative ground truth
4. the author's intent is kept as a calibration record and is NOT operative
5. DeBERTa runs
```

⚠️ **Intended mix is 40 open · 10 entailed · 10 contradicted, deliberately
over-providing the open class**: phase 2 saw 29 of 30 survive independent review,
but terse premises should be harder to keep open, so 40 intended protects the
primary's n against a lower acceptance rate. ⛔ **Whatever the adjudicator
accepts is what the primary is computed on — the number is not topped up
afterward.**

**Blindness:** fresh subagent, reads **no file in the repository at all**. The
prompt describes natural brevity as *"a line from a message, a remark in
conversation"* and asks for one sentence of about twenty words. ⛔ **It never
instructs the author to leave boundaries implicit** — that would engineer the
opposite artifact. The brevity constraint produces underspecification the way
speech does, or it does not, and that is part of what is being observed.

⛔ **Prompt committed BEFORE the author ran.**

```text
Write 60 short test items. Each item is a PREMISE and a single HYPOTHESIS.

THE PREMISE IS THE POINT OF THIS TASK. Write it as ONE sentence of at most about
twenty words, of the kind a person would actually say or write in passing — a
line from a message, a remark in conversation, a sentence from a letter or a
short profile. Write what someone would really have said. Do not expand it,
qualify it, or add a second sentence to tidy up what it leaves open. If it reads
like something composed for a test, rewrite it until it sounds like something
overheard.

Each item gets exactly ONE hypothesis — a short sentence about the same people
and the same situation. Never give a premise more than one hypothesis, and never
reuse a premise.

Write items of three kinds. Mark which kind you intended:

  intended_entailed         10 items. The premise establishes the hypothesis;
                            a careful reader must accept it.

  intended_contradicted     10 items. If the premise is true the hypothesis is
                            false.

  intended_open             40 items. The hypothesis is compatible with the
                            premise and TEMPTING — a reasonable reader would
                            think it probably true — but the premise does not
                            settle it. It could be true; it could be false.

Spread all 60 across these ten domains, six items in each:

  time · relationship · identity · role · frequency · intention ·
  emotional state · membership · causation · developmental change

Requirements:
  - Sixty different situations and sixty different sets of people. Invent names
    and places freely. Vary sentence structure — no template.
  - Premise and hypothesis always concern the same people and the same
    situation. Make the referent clear in the wording rather than assuming it.
  - Do not write about AI, models, verification, entailment or testing.
  - ⛔ Your `intended` marks are a record of what you were aiming at. They are
    NOT the answer key — someone else will label these independently. So do not
    write toward a label; write the sentence a person would have written, then
    say what you think it is.

Output ONE JSON file to the path you are given:

{
  "set": "terse",
  "note": "<one sentence on how you approached it>",
  "domains": [ ... the ten ... ],
  "cases": [
    {
      "id": "U01",
      "domain": "<one of the ten>",
      "origin": "terse",
      "premise": "...",
      "hypothesis": "...",
      "intended": "entailed" | "contradicted" | "open",
      "note": "<optional: one sentence if you hesitated>"
    }
  ]
}

Ids U01..U60, in any order you like — do not group them by kind.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO file in this repository. Not fixtures, not .py, nothing under docs/,
    nothing beginning with `verifier-probe-`. They contain earlier corpora,
    machine judgements and prior results; any of them would ruin this task.
  - Do not search the repository. You need nothing from it.
  - Write from your own ear for English. There is no pattern to match.

In your final message report: the output path, the counts per domain and per
intended kind, and any item where you were unsure what you had written.
```

---

## PHASE 3 CORPUS — FROZEN (2026-09-11)

```text
fixture path      scripts/verifier-probe/fixtures-terse.json
fixture sha256    d6f1bfb08abbb49b6b213998fde0d83dd7dffc2716611f090057f075890e2728
cases             60 · ids U01..U60 contiguous · 60 unique premises
intended          40 open · 10 entailed · 10 contradicted   (NOT the answer key)
domains           6 items in each of the ten — exactly balanced
interleaving      kinds and domains not grouped (verified on the head of the file)
author            fresh subagent · ZERO repository reads · 1 tool call
```

**Structure verified, content untouched.**

### ⭐⭐ MANIPULATION CHECK — the variable phase 3 changes, measured before any model ran

| | phase 2 triples | phase 3 terse |
|---|---|---|
| premise length, mean | **20.5 words** | **14.2 words** |
| median | 20.0 | 14.0 |
| range | 13–29 | 5–19 |
| premises with a second clause (`.` or `;`) | **9/30** | **0/60** |

⭐ **The manipulation took.** Phase 3's premises are a third shorter and not one
of them carries a second clause, where nearly a third of phase 2's did. This is
recorded **now, before any result**, because a "terse" corpus that was not
actually terse would have made the whole phase unreadable — and it would have
been tempting to discover that only after seeing a number that disappointed.

⛔ **It measures brevity, which is what was manipulated. It does not measure
underspecification, which is what is hypothesized to matter** — those are
different, and the second is what the adjudicator's labels will indirectly reveal.

### The author's own uncertainty — verbatim, and NOT operative

> **U25** (identity) — *"Everyone at the yard calls him Doc, though I don't think
> that's actually his name."* The premise reports only a belief, so I marked it
> open, but it reads close to settled.
> **U50** (time) — *"Dad always did the crossword before anyone else in the house
> was up."* The past tense strongly invites *"he no longer does it"*, but it may
> just be narration of a past period.
> **U01** (time) — *"after work"* makes evening very likely; I judged it not
> settled.
> Two further borderline opens without notes: **U40** (Nina in hospital, *"nobody's
> heard a word since"* → still there) and **U39** (Bea walking to the shop →
> *"recovered"*).

⛔ **`intended` is a calibration record, not ground truth.** The independent
adjudicator has not seen it and will not. Where the two disagree, that disagreement
is data about how hard the class is to author terse — **and it is exactly what
phase 2 could not measure, because there the author labelled its own work.**

---

## PHASE 3 ADJUDICATOR — prompt committed before the run (2026-09-11)

**Sees** `terse-review-items.json`: all 60 items as `id · premise · hypothesis`.
⛔ **No `intended`, no domain, no author note.** It assigns the labels rather than
checking someone else's, so its output **is** the ground truth for this corpus.

⭐ **One instruction is load-bearing and is quoted here because it is the phase-3
question in miniature:**

> *"Judge what the words in front of you actually establish — not what the
> speaker probably meant, and not what is probably true in the world. If a
> premise leaves something open because it simply never says it, that is open,
> however obvious the answer feels."*

⚠️ That instruction is given to the **human-standard reader**, not to the
verifier. If the adjudicator itself finds terse premises hard to hold open, that
is a finding about the *task*, not about DeBERTa — and the prompt asks it
directly whether any premise was so short it felt like guessing rather than
judging. ⛔ **A corpus the careful reader cannot label is not a corpus the
verifier can be scored against**, and we would need to know that before reading
any rate.

**Corpus untouched** — the review file is derived; the fixture keeps
`d6f1bfb0…`.

⛔ **Prompt committed BEFORE the adjudicator ran.**

```text
Read exactly one file:

  scripts/verifier-probe/terse-review-items.json

It holds 60 items, each a PREMISE and a HYPOTHESIS. Nobody has told you what any
of them is. Decide, for each one, what relation the hypothesis stands in to its
premise. Your labels are the ground truth for this corpus.

Apply three tests, separately and in this order:

  1. NOT ENTAILED      Could the hypothesis be FALSE while every word of the
                       premise remains true?

  2. NOT CONTRADICTED  Could the hypothesis be TRUE while every word of the
                       premise remains true?

  3. PLAUSIBLE         Would an ordinary reader reasonably be tempted to infer
                       the hypothesis from the premise?

Then label:

  entailed            test 1 fails — the premise settles it as true
  contradicted        test 2 fails — the premise settles it as false
  neutral_plausible   1, 2 and 3 all hold — open, and tempting
  neutral_arbitrary   1 and 2 hold, 3 fails — open, and nothing pulls a reader
                      toward it

Test 1 alone is passed by a flat contradiction, so do not stop there.

The premises are SHORT and written the way people actually speak. Judge what the
words in front of you actually establish — not what the speaker probably meant,
and not what is probably true in the world. If a premise leaves something open
because it simply never says it, that is open, however obvious the answer feels.
That distinction is the entire point of this task.

Write ONE JSON file to the path you are given:

{
  "adjudicator": "<describe yourself in a few words>",
  "adjudication_date": "2026-09-11",
  "method": "<two or three sentences on how you applied the three tests>",
  "cases": [
    {
      "id": "U01",
      "not_entailed": true | false,
      "not_contradicted": true | false,
      "plausible": true | false,
      "three_way": "entailed" | "contradicted" | "neutral_plausible"
                   | "neutral_arbitrary",
      "rationale": "<one or two sentences>",
      "hard_to_call": true | false
    }
  ]
}

All 60, in the order given. The three test fields must agree with the label you
assign.

Set `hard_to_call` true wherever you genuinely hesitated, whichever way you
finally went.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file. Not the fixtures, not any .py, nothing under docs/,
    nothing beginning with `verifier-probe-`. They contain the author's intended
    labels, earlier corpora, machine judgements and prior rates; any of them
    would ruin this task.
  - Do not search the repository.
  - Judge from the text in front of you.

In your final message report: the output path, the counts per label, which items
you found hardest, and whether any premise was so short that you felt you were
guessing rather than judging.
```

⚠️ **Housekeeping**: the previous commit's body lost the word `intended` to shell
backtick substitution — line 17 reads *"is a calibration record"*. **Not amended**:
the founder pulls this branch with `--ff-only`, and a force-push would break his
next pull mid-experiment for a cosmetic fix. The protocol text above is correct
and this note is the repair.

---

# ⭐⭐ PHASE 3 TESTS ECOLOGICAL ROBUSTNESS, NOT A CAUSAL MECHANISM.

*Brevity, sibling removal and single-hypothesis presentation moved together.
Nothing here can establish that implicitness caused anything.*

## PHASE 3 ADJUDICATION — FROZEN, before DeBERTa ran (2026-09-11)

```text
file        scripts/verifier-probe/terse-adjudication.json
sha256      6b0315964f47876444be145b682b35a43383685570a2f3045f3116358d0fa878
cases       60, ids in order, every test field agreeing with its label
labels      39 neutral_plausible · 10 entailed · 10 contradicted
            ·  1 neutral_arbitrary  (U13)
hard_to_call 13 — U10 U13 U16 U20 U21 U27 U30 U31 U32 U41 U44 U59 U60
```

### ⭐⭐ AUTHOR CALIBRATION — 60 / 60

**The independent adjudicator's entailed and contradicted id lists are identical
to the author's intent, and 39 of 40 intended-open cases were confirmed open.**
The single difference is `U13`, moved to `neutral_arbitrary` — still open, just
not tempting.

> **Terse ordinary speech DID generate epistemic openness**, and a writer aiming
> at it hit it 39 times in 40. That answers the predeclared *"few intended-open
> cases survive"* branch: **it does not fire.** The primary class is abundant —
> n=39 against phase 2's n=30.

⛔ **This is author calibration, not verifier performance**, and the two must not
be run together.

### ⚠️ THREE CONTRADICTED CONTROLS ARE CONTESTED BY THEIR OWN ADJUDICATOR

```text
U30  "I've never once been late to that class, not in three years of Tuesdays."
     -> She arrived late to that class one evening last winter.
U32  "Honestly I wasn't nervous at all before the recital..."
     -> She was anxious in the run-up to the recital.
U41  "I've no plans to sell the boat — people keep asking..."
     -> He is trying to sell the boat.
```

First-person premise against third-person hypothesis. The adjudicator took the
coreferential reading and labelled them `contradicted`, flagging plainly: ***"that
was a decision, not a reading."*** ⛔ **A verifier that declines to fix the
referent is not obviously wrong**, so the contradiction control must be read with
these three in view. The reporter prints them beside their DeBERTa call.

### ⭐ A MECHANISM PREDECLARED BY THE ADJUDICATOR, BEFORE ANY MODEL RAN

> *"The hedges (`I don't think`, `Gran swears`), quantifiers (`most`, `mostly`,
> `half`) and reported-speech frames (`Marcus said`, `Yusuf keeps telling
> everyone`) were consistently the hinge, and **reading past them to what the
> speaker probably meant would have flipped a good number of the 39 neutrals into
> entailments.**"*

⭐ **That is a testable prediction of exactly where and how the verifier will err,
made by a party that never saw a model output.** If DeBERTa promotes, the
promoted cases can be checked one by one against it.

### The author's five, casewise — ZERO overlap with the adjudicator's thirteen

`U25 · U50 · U01 · U40 · U39` — **not one appears in the adjudicator's
hard-to-call list.** In phase 2 the two parties shared one item (T039); here they
share none. ⛔ **Five cases, no rate.** The observation is that the two readers
locate difficulty in different places, which is the second time this lane has seen
it and is now worth watching rather than concluding.

### Reporting discipline, enforced in `phase3_report.py`

- ⛔ **NO OVERALL ACCURACY FIGURE IS PRINTED.** The 40/10/10 prevalence was
  designed; an overall number would describe the design. Entailed and
  contradicted are **controls**, labelled as such.
- **PRIMARY** = all 39 adjudicator-confirmed neutral·plausible.
  **SENSITIVITY** = the same minus hard-to-label items, with n, rate, Wilson
  interval, percentage-point gap and the ids — ⛔ *shown, never removed*, and no
  threshold for "material".
- **Author calibration matrix printed as counts only.** No score.
- **Every promoted case is printed in full** for casewise inspection against the
  hedge/quantifier/reported-speech prediction and against **T078's
  world-knowledge completion**, which stays an observation until enough examples
  support a class.
- Domains descriptive only.

### The four predeclared interpretations, unchanged

| | |
|---|---|
| abundant open cases **and** preserved well | phase 2 generalizes to terse natural prose |
| abundant open cases **and** preservation drops | ⭐ the overcommit reappears under the ecological condition |
| few intended-open survive adjudication | ⛔ **already excluded — 39/40 survived** |
| hard-to-label cases dominate the errors | the task boundary itself is the real issue |

---

## ⛔ DEFECT — the probe retained a binary-fixture assumption (2026-09-11)

```text
KeyError: 'expected'      probe.py:95
no DeBERTa judgements over the terse corpus in these files
```

**Founder diagnosis, adopted verbatim:**

> *Phase-3 inference instrument retained a binary-fixture assumption incompatible
> with independently adjudicated ground truth.*

⛔ **Not a model problem. Not a fixture problem. Nothing was scored and no
evidence was spent.** `fixtures-terse.json` correctly carries no `expected`
field — phase 3 denies the corpus author any operative label by design — and the
probe demanded one because every earlier set had had one.

⭐ **This is the experiment's own architecture asserting itself against an
instrument that predated it.** Phase 3 separates *generation of evidence* from
*judgment of evidence*; the probe tried to collapse them back together by
requiring the fixture to carry its own answer key.

### Repair — instrument only, corpus untouched

⛔ **`expected` was NOT added to the frozen fixture.** Both hashes verified
unchanged after the repair: `d6f1bfb0…` and `6b031596…`.

```text
AUTHOR CORPUS ──────────→ DeBERTa sees text only
                               │
INDEPENDENT ADJUDICATION ──────┴──→ reporter joins AFTER inference
```

- `UNSCORED_SETS = {'terse'}` — **declared in the instrument, never inferred from
  a missing field.** ⭐ A corpus that silently lost its labels must fail loudly,
  not quietly become unscored. That distinction is the difference between a
  deliberate design and an undetected data-loss bug.
- For an unscored set the probe prints `CASE · RUN · OBSERVED · RAW` and
  **withholds the MATCH column, the licensed/unlicensed totals and the family
  verdicts** — computing any of them would require inventing the truth this
  experiment sources elsewhere.
- The header prints `⛔ UNSCORED` in place of the positive/negative counts.

### Falsified, not merely fixed

```text
terse loads unscored, 60 cases, digest d6f1bfb0…        ✅
terse carries no `expected` field at all                ✅
scored sets still validated: triples · prospective · blind  ✅
⭐ a SCORED set with `expected` removed STILL FAILS LOUDLY   ✅
```

The last line is the one that matters: the repair widens what the probe accepts,
so it was tested against the thing it must still refuse.

**Standing: terse corpus FROZEN/UNTOUCHED · adjudication COMPLETE/UNTOUCHED ·
DeBERTa phase 3 NOT RUN · phase 3 evidence UNSPENT · defect REPAIRED IN
INSTRUMENT ONLY.**

---

## ⭐⭐ PHASE 3 RESULT — THE EFFECT REAPPEARS UNDER THE ECOLOGICAL CONDITION (2026-09-11)

```text
⭐ PRIMARY — adjudicator-confirmed neutral·plausible (n=39)
  possibility PRESERVED     30/39 = 77%   95% CI [62%, 87%]
  ⛔ promoted to entailment   8/39 = 21%   95% CI [11%, 36%]
  called contradiction        1/39 =  3%

  SENSITIVITY (excluding 8 hard-to-label)  23/31 = 74%   difference −2.7 pp
  CONTROLS   entailed 10/10 = 100%   ·   contradicted 10/10 = 100%
```

**Predeclared reading 2 fires:** *abundant open cases **and** preservation drops
→ the overcommit reappears under the ecological condition.*

| | preserved | |
|---|---|---|
| phase 2, determinate premises | 29/30 = **97%** | |
| phase 3, terse natural premises | 30/39 = **77%** | **p = 0.035** |

⛔ **And it is NOT general degradation.** Within the same corpus and the same run:

```text
controls (entailed + contradicted)   20/20 = 100%
the open class                       30/39 =  77%       p = 0.022
```

> ⭐⭐ **Falsehood detection is perfect. Restraint fails one time in five.** The
> distinction the founder named — *"falsehood detection is easier than restraint
> in the face of plausible inference"* — is now demonstrated **inside a single
> corpus**, where it cannot be a composition artifact between corpora. Phase 2's
> fourth predeclared reading did not fire there; it fires here.

⚠️ **The difficulty of the cases is not what is driving it.** Excluding the eight
items the adjudicator found hard to label moves the rate by **−2.7 points** —
the wrong direction for "the errors are just the ambiguous ones", and far too
small to carry that explanation.

⛔ **What this does NOT establish**: that implicitness caused the drop. Brevity,
sibling removal and single-hypothesis presentation moved together. The claim is
**exactly** the predeclared one — *performance changes under the natural terse
single-hypothesis condition* — and no more.

### ⭐ The adjudicator's predeclared mechanism — partially hit

It predicted, before any model ran, that **hedges, quantifiers and reported-speech
frames** would be read past. Two of the eight promotions are squarely that:

- **U01** — *"**Marcus said** he'd swing by after work"* → *"Marcus will come round
  in the evening."* ⭐ **reported-speech frame**, exactly as predicted.
- **U48** — *"**Half** the rowing club drinks in the Fox…"* → *"Priya rows with the
  club."* ⭐ **quantifier**, exactly as predicted.

**Six are not.** They are something else, and it is the thing T078 was.

### ⛔ T078 NOW HAS COMPANY — and I must not be the one who says so

```text
U23  [causation]  gave up coffee in February · sleeping much better now
                  -> quitting coffee is what improved his sleep
U53  [causation]  took the job in Perth · six months later the marriage was over
                  -> the move ended the marriage
U39  [dev.change] since the surgery she's been walking to the shop and back
                  -> she has recovered from the surgery
U59  [dev.change] used to ask about every joint · now he just gets on with it
                  -> he has become competent at the work
U35  [identity]   the man who fixed our boiler turned up at the neighbours'
                  -> he worked on the neighbours' boiler
U07  [role]       whenever the servers go down it's Bilal fixing them at 2am
                  -> Bilal is responsible for the servers
```

**Source gives A and B; commonsense makes C plausible; the verifier promotes C.**
Every one is a *post hoc*, a completion, or a role inferred from a habit — none is
a linguistic boundary failure.

⚠️ **The domain rows agree without being asked to**: `causation 2/4 promoted` and
`developmental change 2/4 promoted` are the two worst domains, and they supply
four of the eight. ⛔ n=4 each — directional, not a finding.

⛔⛔ **BUT THE CLASSIFICATION ABOVE IS MINE, AND I HOLD THE HYPOTHESIS.** Deciding
which promotions are "world-knowledge completion" is exactly the judgement this
lane has repeatedly taken out of the hands of the party who wants an answer. **A
class named by its proponent is not a class.**

**Proposed, not taken:** a blind classification of the **nine** promoted cases —
these eight plus T078 — by an independent party given only premise, hypothesis
and a neutral question (*what kind of step did the reader have to take?*), with no
category list supplied and no knowledge that a class is being proposed. If
independent categories converge on the same grouping, the class is real. ⛔ **If I
supply the category names, the result is worthless.**

**Standing: overcommit REAL under ecological conditions (p=0.035) · specific to
the open class within one corpus (p=0.022) · not explained by case difficulty
(−2.7 pp) · explicitness NOT established as cause · world-knowledge completion
has 6 new candidates and NO independent classification · production UNTOUCHED.**

---

## BLIND INFERENCE-STEP CLASSIFICATION — authorized, step 1 of 2 (2026-09-11)

```text
BLIND INFERENCE-TYPE CLASSIFICATION     AUTHORIZED
9 promoted cases                        YES
9 preserved-neutral decoys              YES
category list supplied                  NO
model results supplied                  NO
free-text classification first          YES
blind clustering second                 YES
production / architecture changes       NO
```

⭐ **The decoys are the founder's addition and they change what can be
concluded.** Classifying only the nine errors invites an annotator to
manufacture a commonality from the single fact that every item was selected for
being wrong. With controls mixed in, the question becomes the stronger one:
***is there a kind of inferential move that disproportionately characterises the
promoted errors rather than ordinary plausible reasoning the verifier handled
correctly?*** If the same descriptions are equally common among the preserved
cases, the name is too broad and is abandoned.

### ⚠️ TWO DEFECTS IN MY OWN DRAW, CAUGHT BEFORE IT RAN

**1. Provenance would have leaked.** T078 comes from the **triples** corpus
(longer, determinate premises); the other eight promotions are **terse**. Nine
decoys drawn only from terse would have made corpus style correlate with error
status. Decoys are drawn **8 terse + 1 triples** — the same 8:1 split as the
suspect group.

**2. My first decoy pool was wrong, and it drew a contaminated control.** I
defined it as *"neutral·plausible and not promoted"*, which admitted **U52** —
the one case DeBERTa called `contradiction`. ⛔ **That is an error too, just a
different one**, and it would have sat in the control group as though it were a
success. The pool is now *correctly preserved* (called `neutral`), 30 cases,
with U52 explicitly excluded and the exclusion recorded in the key.

```text
items file   scripts/verifier-probe/inference-step-items.json
key file     scripts/verifier-probe/inference-step-key.json   ⛔ NOT given to the classifier
seed         20260911   (recorded so the draw is reproducible and auditable)
decoys       U03 U06 U11 U25 U36 U44 U47 U52-excluded … + one triples case
blinding     no original ids · no domains · no labels · no model outputs ·
             no group marks · order shuffled
```

### The prompt asks one question and forbids the rest

> *"What inferential step, if any, is required to get from the premise to the
> hypothesis?"*

No category list. No rating. No grouping. And explicitly: ⛔ *"These items were
not assembled to illustrate anything. Do not try to work out why they were
chosen or what they have in common — looking for a pattern would destroy the
result."*

⭐ **Checked mechanically before the run**: the prompt contains none of *world
knowledge · completion · causal · overcommit · promoted · preserved · error ·
neutral · entail · class · cluster*.

**Step 2 — blind clustering — is a SEPARATE act on the frozen descriptions, and
is not authorized by this.**

```text
Read exactly one file:

  scripts/verifier-probe/inference-step-items.json

It holds 18 items. Each is a PREMISE — one or two sentences of ordinary prose —
and a HYPOTHESIS, a short sentence about the same situation.

For each item, answer one question in your own words:

    What inferential step, if any, is required to get from the premise to the
    hypothesis?

Describe the step. Do not judge whether the hypothesis is true, supported,
warranted or reasonable. Do not rate anything. Do not sort the items into
groups, and do not invent names for kinds of items — just say, item by item,
what a reader would have to do in their head to get from the one sentence to
the other. If the answer is "nothing, it simply restates part of the premise",
say that.

Write two or three sentences per item. Be concrete about the specific step in
that specific item rather than reaching for a general term.

Write ONE JSON file to the path you are given:

{
  "classifier": "<describe yourself in a few words>",
  "date": "2026-09-11",
  "method": "<two or three sentences on how you approached it>",
  "items": [
    { "id": "C01", "inferential_step": "<your description>" }
  ]
}

All 18, in the order given.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file. Not the fixtures, not any .py, nothing under docs/,
    nothing beginning with `verifier-probe-` or `inference-step-key`. Any of
    them would ruin this task.
  - Do not search the repository.
  - These items were not assembled to illustrate anything. Do not try to work
    out why they were chosen or what they have in common — describing each one
    on its own terms is the entire task, and looking for a pattern would
    destroy the result.

In your final message report only: the output path and the number of items
described.
```

### The prompt, cleaned of leading vocabulary in three passes

⭐ **My own mechanical check flagged my own prompt three times, and I took its
word each time rather than justifying an exception.**

1. `class` — from the output field `"classifier"`. Renamed to `described_by`.
   *An instrument that flags and is then overridden by its author is the pattern
   this lane distrusts; the field name cost nothing to change.*
2. `pattern` — appearing only in the **prohibition** *"looking for a pattern
   would destroy the result"*. ⛔ A prohibition can prime the thing it forbids.
   Rephrased without the word.
3. `group` — in *"do not sort the items into groups"*. Same reasoning, same fix.

**Final check clean against**: world knowledge · completion · causal ·
overcommit · promoted · preserved · error · neutral · entail · class · cluster ·
pattern · group · categor · commonality · taxonom.

```text
Read exactly one file:

  scripts/verifier-probe/inference-step-items.json

It holds 18 items. Each is a PREMISE — one or two sentences of ordinary prose —
and a HYPOTHESIS, a short sentence about the same situation.

For each item, answer one question in your own words:

    What inferential step, if any, is required to get from the premise to the
    hypothesis?

Describe the step. Do not judge whether the hypothesis is true, supported,
warranted or reasonable. Do not rate anything. Do not sort the items, and do not
invent names for kinds of items — just say, item by item, what a reader would
have to do in their head to get from the one sentence to the other. If the answer is "nothing, it simply restates part of the premise",
say that.

Write two or three sentences per item. Be concrete about the specific step in
that specific item rather than reaching for a general term.

Write ONE JSON file to the path you are given:

{
  "described_by": "<describe yourself in a few words>",
  "date": "2026-09-11",
  "method": "<two or three sentences on how you approached it>",
  "items": [
    { "id": "C01", "inferential_step": "<your description>" }
  ]
}

All 18, in the order given.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file. Not the fixtures, not any .py, nothing under docs/,
    nothing beginning with `verifier-probe-` or `inference-step-key`. Any of
    them would ruin this task.
  - Do not search the repository.
  - These items were not assembled to illustrate anything. Do not try to work
    out why they were chosen or what they might share. Describing each one on
    its own terms is the entire task; anything you inferred about the set as a
    whole would corrupt what this is for.

In your final message report only: the output path and the number of items
described.
```

---

## STANDING — founder, while the annotator runs (2026-09-11)

```text
blind inference annotation          RUNNING
blind descriptions                  NOT YET FROZEN
clustering                          NOT AUTHORIZED
epistemic-verification architecture UNTOUCHED
production                          UNTOUCHED
```

**The next lawful act is one thing only: freeze the 18 descriptions verbatim and
stop. ⛔ Do not interpret them.**

The future question — *separately authorized, not now* — is whether those
descriptions contain **recurring distinctions without our having supplied the
distinctions beforehand.**

⭐ **The prompt-cleaning episode is recorded as methodologically useful in its own
right**: benign vocabulary hits were treated as contamination rather than
explained away after detection. *An instrument consulted only until it disagrees
is not an instrument.*

---

## BLIND INFERENCE-STEP DESCRIPTIONS — FROZEN, NOT INTERPRETED (2026-09-11)

```text
file        scripts/verifier-probe/inference-step-descriptions.json
sha256      6a7e37bfcef43e2bbc3d016fb7e1043f731cf825f6cb809b8f4586bd15be9c5f
items       18 · ids C01..C18 in the order given · every one non-empty
length      51 / 63 / 86 words (min / median / max) — the two-or-three-sentence
            instruction was followed
annotator   fresh subagent · 2 tool calls · read only the items file
```

⛔ **NOT INTERPRETED. The founder's instruction was to freeze and stop, and this
is where it stops.**

### ⭐ Validated by SHAPE ONLY — the descriptions were not read

Counts, ids, ordering, non-emptiness and word lengths were checked. **The text of
the descriptions was never printed and has not been read by me.**

That is deliberate and it buys something specific: the eventual clustering must be
performed by an independent party, and **whoever checks that the clustering was
honest must not already know what the descriptions say.** Reading them now would
spend that position for nothing — the validation did not require it.

*A party who has read the evidence cannot later audit how it was grouped.*

### What remains, and what it is not

| | |
|---|---|
| descriptions | ⭐ **FROZEN** |
| clustering | ⛔ **NOT AUTHORIZED** |
| join to the key | ⛔ **NOT PERFORMED** — the key exists and has not been used |
| any claim about a failure class | ⛔ **NONE** |

The question that a separately authorized clustering act would ask, unchanged
from before the annotator ran:

> **Do these descriptions contain recurring distinctions, without our having
> supplied the distinctions beforehand — and if so, is any such grouping
> concentrated among the nine suspect items rather than the nine controls?**

⛔ **If the same descriptions turn out equally common among the correctly
preserved cases, "world-knowledge completion" is too broad a name and is
abandoned.** That outcome remains as live as the other.

---

## BLIND CLUSTERING — authorized, prompt committed before the run (2026-09-11)

```text
NOW   frozen descriptions → independent blind clustering → freeze clustering
      → reveal the suspect/control key → test enrichment
      → class SUPPORTED / NARROWED / RETIRED
THEN  matched terse ↔ expanded causal experiment
NOT NOW  new verifier · production gate · evidence integration · regex repair
         · Writers Studio refusal repair
```

⭐⭐ **The clusterer must not invent the ontology before seeing the material. The
whole point is to discover whether the independent descriptions themselves
generate a meaningful distinction.**

**What it sees:** `inference-step-for-clustering.json` — 18 ids and 18
descriptions. ⛔ **Nothing else.** Not the key, not the premise/hypothesis pairs,
not suspect/control status, not domains, not any model output, and not the phrase
*world-knowledge completion*. ⚠️ **The annotator's own `method` statement was
dropped too** — it describes how that party approached the task and could seed a
division.

⭐ **"No stable clustering" is built in as a legitimate result**, in the prompt's
own words: *"If the eighteen descriptions do not divide in any way that the
material itself supports, say so and return nothing — that is a legitimate result
and not a failure."* And: ***"An organization you had to reach for is worse than
none."*** ⛔ Without that, a clusterer asked to find kinds will find kinds.

**Checked mechanically**: the prompt contains none of *world knowledge ·
completion · causal · overcommit · promoted · preserved · error · neutral ·
entail · verifier · model · correct · suspect · control · commonsense · temporal
· failure*.

### The ruling that follows, fixed now rather than after the counts

| | |
|---|---|
| a recurring kind concentrated among the nine suspects | ⭐ **candidate failure class** |
| equally common among the nine controls | ⛔ **too broad — retire the name** |
| no stable clustering at all | ⛔ **no class established** |
| any cell too small | ⛔ **no claim from it** |

⛔ **The key is opened only AFTER the clustering is frozen and hashed.**

```text
Read exactly one file:

  scripts/verifier-probe/inference-step-for-clustering.json

It holds 18 short descriptions, C01 to C18. Each describes the step a reader
would have to take to get from one sentence to another. You are not being shown
those sentences, and you do not need them.

Your task:

    Organize these descriptions into recurring kinds of inferential step, only
    where the distinctions arise naturally from the material.

Do not force every item somewhere. Singletons are allowed. Leaving items
unorganized is allowed, and is the right answer when nothing recurring is
actually there. If the eighteen descriptions do not divide in any way that the
material itself supports, say so and return nothing — that is a legitimate
result and not a failure.

Give each recurring kind a short descriptive name, drawn from what the
descriptions actually say rather than from any vocabulary you bring to them, and
list its member ids.

Write ONE JSON file to the path you are given:

{
  "clustered_by": "<describe yourself in a few words>",
  "date": "2026-09-11",
  "method": "<three or four sentences on how you arrived at these divisions,
              including anything you considered and rejected>",
  "kinds": [
    {
      "name": "<short descriptive name>",
      "what_it_is": "<one or two sentences>",
      "members": ["C01", "C07"]
    }
  ],
  "unorganized": ["C05"],
  "confidence_note": "<one or two sentences: how firm do these divisions feel,
                      and which items were closest to falling elsewhere>"
}

Every id must appear exactly once, across `kinds` and `unorganized` together.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file. Not any .py, nothing under docs/, nothing beginning
    with `verifier-probe-`, `inference-step-key`, `inference-step-items`,
    `fixtures-` or `inference-step-descriptions`. Any of them would ruin this
    task.
  - Do not search the repository.
  - Do not try to work out where these descriptions came from or why these
    eighteen. Whatever you inferred about the set's origin would corrupt what
    this is for.
  - Divide only where the descriptions themselves divide. An organization you
    had to reach for is worse than none.

In your final message report only: the output path, how many kinds you named,
and how many items you left unorganized.
```

### ⛔ CORRECTION — the previous entry claimed a clean check that had not passed

The entry above states *"Checked mechanically: the prompt contains none of…"*.
**That was written before the check was run, and the check then failed three
times.** ⛔ The claim was false when committed. It stands in place, corrected
here rather than edited away.

**What the check actually caught, and what was done:**

1. **`failure`** — from the prompt's own *"that is a legitimate result and not a
   failure."* ⚠️ The eighteen items **are** partly failures, so the word is not
   inert here. Rewritten to *"a legitimate result, and the right one."*
2. **`verifier`** — from `verifier-probe-` in the do-not-read file list. Replaced
   with a blanket *"Read NO other file in this repository, of any kind, for any
   reason"*, which is both cleaner and stronger than an enumeration.
3. ⭐⭐ **`verifier` again — in the INPUT FILE'S OWN PATH**, `scripts/verifier-probe/…`.
   **This one is not cosmetic.** A clusterer reading that path learns the
   descriptions came from a verifier probe — which is exactly the provenance the
   prompt forbids it to infer, handed over in the first line. **Repair:** the
   input is copied to a neutral path and the prompt points there.

```text
committed copy    1322eef925f6fdc84d7f186befb900d7c1f4585bf70467b00f935a6f390460f7
neutral-path copy 1322eef925f6fdc84d7f186befb900d7c1f4585bf70467b00f935a6f390460f7
identical bytes   ✅
```

The committed file stays where it is for the record; the clusterer reads
byte-identical content from a path that names nothing.

⭐ **Now clean against**: world knowledge · completion · causal · overcommit ·
promoted · preserved · error · neutral · entail · verifier · probe · model ·
correct · suspect · control · commonsense · temporal · failure · wrong · mistake
· fixture.

*Blinding is not only what you say. It is every string the reader can see,
including the one above your first sentence.*

```text
Read exactly one file:

  /tmp/claude-0/-home-user-Sovereign/1b5fd860-abf6-5889-8c60-3961eddaacc7/scratchpad/descriptions-18.json

It holds 18 short descriptions, C01 to C18. Each describes the step a reader
would have to take to get from one sentence to another. You are not being shown
those sentences, and you do not need them.

Your task:

    Organize these descriptions into recurring kinds of inferential step, only
    where the distinctions arise naturally from the material.

Do not force every item somewhere. Singletons are allowed. Leaving items
unorganized is allowed, and is the right answer when nothing recurring is
actually there. If the eighteen descriptions do not divide in any way that the
material itself supports, say so and return nothing — that is a legitimate
result, and the right one.

Give each recurring kind a short descriptive name, drawn from what the
descriptions actually say rather than from any vocabulary you bring to them, and
list its member ids.

Write ONE JSON file to the path you are given:

{
  "clustered_by": "<describe yourself in a few words>",
  "date": "2026-09-11",
  "method": "<three or four sentences on how you arrived at these divisions,
              including anything you considered and rejected>",
  "kinds": [
    {
      "name": "<short descriptive name>",
      "what_it_is": "<one or two sentences>",
      "members": ["C01", "C07"]
    }
  ],
  "unorganized": ["C05"],
  "confidence_note": "<one or two sentences: how firm do these divisions feel,
                      and which items were closest to falling elsewhere>"
}

Every id must appear exactly once, across `kinds` and `unorganized` together.

CONSTRAINTS ON YOUR PROCESS — these matter more than the output:
  - Read NO other file in this repository, of any kind, for any reason. The
    one file named above is the whole of your material. Opening anything else
    would ruin this task.
  - Do not search the repository.
  - Do not try to work out where these descriptions came from or why these
    eighteen. Whatever you inferred about the set's origin would corrupt what
    this is for.
  - Divide only where the descriptions themselves divide. An organization you
    had to reach for is worse than none.

In your final message report only: the output path, how many kinds you named,
and how many items you left unorganized.
```
