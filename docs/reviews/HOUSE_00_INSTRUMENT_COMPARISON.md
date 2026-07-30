# Instrument comparison — Review Charter vs. Environmental Field Study method

**Written 2026-07-29, before Pass 2, at Kelly's instruction:** read `/field-study`
and compare against the charter rather than assuming equivalence — *"if it differs,
those differences themselves become evidence about which instrument is actually
governing the walk."*

## 0. Collision notice

Two review instruments were authored the same day by different lanes:

| | This charter | Field Study method |
|---|---|---|
| Artifact | `docs/reviews/ECOSYSTEM_EXPERIENTIAL_REVIEW_CHARTER_2026-07-29.md` | `docs/specs/developmental-environment/FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md` (338 lines) + `.claude/skills/field-study/SKILL.md` + `scripts/field-study-scaffold.sh` |
| Status | Candidate, uncommitted | Candidate, **open as PR #810** |
| Tracked | no | yes |

**PR #810 was not in the open-PR list when this sitting surveyed it.** It appeared
mid-sitting. Per `reference-concurrent-lanes-contradictory-rulings`, this is surfaced,
not resolved.

## 1. Where they agree

Both are no-build; both refuse recommendations (*"a study that recommends is quietly
legislating"* ≈ *"no implementation until rulings are made"*); both defer founder
decisions rather than resolving them; both hold architectural convergence as Cat 1 by
default; both classify every statement by evidence.

## 2. Where the Field Study method is STRONGER — gaps in this charter

### 2a. The confabulation guard — charter has nothing equivalent

> *"'This screen feels anxious' is a literary performance wearing the costume of
> evidence — and downstream it will be read as though a human reported it."*

**This is a defect in the charter, not a difference.** Charter §7 Pass 2 asks the walk
to answer *"Does the House orient a member without turning into a product menu?"* —
phrasing that invites exactly the performance the guard forbids. The required form keeps
the claim in the interface characteristic and defers the felt state explicitly.

**Consequence: charter Pass 2 questions must be rewritten before any walk.**

### 2b. Study ethics — charter constrains the product, not the study

Charter has a *visibility and consent map* as a deliverable, but imposes no constraint
on the study itself. Field Study does: structural telemetry permitted; member
reflections, transcripts, journal entries **not permitted without explicit consent**;
**Sanctuary content categorically excluded, research is not an exception**; where member
data would be the best evidence, log *Needs consent* and **stop**.

> *"Studying whether an environment protects sovereignty cannot be done by violating it."*

**Consequence: the charter is missing a governing constraint on its own conduct.**

### 2c. Gravity map before narrative

Four gravities measured independently — visual · interaction · temporal · relational —
**"the finding is the disagreement."** Produced *before* any narrative sentence, because
it reveals what the environment actually organizes around versus what it claims to.

The charter's *primary relationship map* is adjacent but not equivalent: it is not
measured on four independent axes, and it does not treat divergence between axes as the
primary finding.

### 2d. Build pinning — `--verify` at close

*"One sitting, one build."* Record whether the build changed under the sitting.
*"Fixed on trunk is not live in production."*

The charter has **no build pinning at all**. Acutely relevant here: this sitting's
working tree is **427 commits behind trunk**, so any Pass 2 walk would observe a build
that is not what members use.

### 2e. Richer evidence classes

| Charter | Field Study |
|---|---|
| Observed · Inferred · Hypothesis | A Direct · B Structural inference · C Experiential prediction · D Metaphorical · E Constitutional consistency |

Field Study's are stricter and more discriminating: **C may not support rulings until
human observation**; **D never alone**; **E** (implementation vs. ratified principle) has
no charter equivalent at all — and E is precisely the class most of Pass 1's B3
"implemented but never ruled" findings belong to.

### 2f. Instrument independence — empirically confirmed by Pass 1

> *"Discovery maximizes independence… run instruments as separate agents that do not
> read each other's output. The separation is the point: it stops the strongest
> narrative from absorbing contradictory evidence."*

Pass 1 did this accidentally — five isolated extraction agents — and it is *why* the
merge surfaced cross-source contradictions no single extract named. **Independent
support for the method's rule, arrived at from the other direction.**

## 3. Where this charter adds something the Field Study method lacks

**The Standing Record.** The Field Study method constrains the *observer's* knowledge
before observation. The charter constrains observation against the *existing record*.
These are complementary, not competing — and Pass 1 demonstrated the charter's necessity:
without reconciliation first, the walk would have inherited a falsified branch-protection
premise, two incompatible definitions of "coherence", and 23 superseded findings
presented as current.

Also charter-only: **Evidence Delta** · **Scope tags** (Local / Shared Pattern /
Constitutional Candidate) · **provenance axis** (Command-verified / Reconciliation output
/ Retracted) · the **cross-ecosystem synthesis** (§8).

## 4. The direct conflict

| | Says |
|---|---|
| Charter §2 | Sequence begins with **House** |
| Field Study §Calibration | *"Now What? is the calibration field.* Run one complete study, notice where the method breaks down, revise, run a second field." |

The method is **Candidate, not ratified** — *"Ratification is earned by repeated use
across multiple fields, not by this document."*

So applying it to the House would (a) use an uncalibrated instrument on (b) a field
other than the one named for its calibration. Running House first under this method
means the method's first calibration data comes from the wrong field.

**Unresolved. This is a founder question, not a reviewer's call.**

## 5. What this comparison is evidence of

> **Independent governance artifacts emerged before a governance relationship between
> them had been established.** (Kelly's phrasing, 2026-07-29 — adopted in place of an
> earlier formulation that implied one artifact was premature. Neither was.)

## 6. Ruling on the comparison (Kelly, 2026-07-29)

**The four differences are structural capabilities, not stylistic preferences** — each
changes what the instrument is *capable of concluding*:

| Difference | What it constrains |
|---|---|
| Confabulation guard | what may be **said** — admissibility of observations |
| Study ethics | what may be **observed** — evidence that may be collected |
| Build pinning | what **instance** is studied — reproducibility |
| Evidence class E | what observations are **evaluated against** — comparison target |

The Standing Record occupies a **different dimension**: it constrains the relationship
between the current sitting and prior work. Orthogonal to constraints on observation
itself.

> "I would not think of the two documents as competing. They currently cover different
> failure modes."

**Process ruling — no instrument is selected yet:**

1. Preserve both candidate instruments **unchanged**
2. Treat this comparison as **evidence, not an implicit merger**
3. Make an **explicit instrument-selection decision**
4. Only then begin the next review program under the chosen governing method

> "That avoids an accidental outcome where one candidate instrument becomes canonical
> simply because it happened to be the one used next."

### Binding consequence for this sitting

The charter defects named in §2a–§2e are **recorded, not repaired.** Fixing them now
would make the charter quietly absorb the method's constraints — the accidental merger
step 2 forbids. They stay open as evidence until selection.

Recorded, not resolved.

---

*No recommendation. Nothing here authorizes a build or selects an instrument.*
