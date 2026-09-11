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
