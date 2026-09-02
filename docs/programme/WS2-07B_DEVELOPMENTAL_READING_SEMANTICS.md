# WS2-07B · Developmental Reading Semantics

```text
LANE        JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 · 07B UNDERSTAND
INPUT       WS2-07A census, canonical @ cc9788e4f
AUTHORITY   docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
            docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md
AUTHORIZES  nothing to be built
DATE        2026-09-02
```

⛔ **No schema, table, route, prompt, surface, reader, or lens code is defined here, and no 07A
finding is repaired.** This document resolves meaning so that 07C can define one object without
settling five unrelated questions by accident.

---

## 1 · What a developmental reading is

The lane fixes six epistemic layers and forbids their collapse. This section says what each one
**is**, what makes a claim belong to it, and what it costs to get it wrong.

```text
WORK                      the authored text and the member's declared structure
 ↓
MECHANICAL EVIDENCE       recoverable, re-derivable, no reader required
 ↓
DEVELOPMENTAL OBSERVATION what the evidence shows, stated without consequence
 ↓
INTERPRETATION            what it may mean for the Work
 ↓
QUESTION / POSSIBILITY    what the author might consider
 ↓
AUTHOR JUDGMENT           what the author decides — not MAIA's layer at all
```

### The test that assigns a claim to a layer

Not the wording. **What would have to be true for the claim to be false.**

| Layer | Epistemic status |
|---|---|
| Evidence | **mechanically falsifiable** — re-run the measurement |
| Observation | **falsifiable against evidence** — point at the record and show it does not say that |
| Interpretation | **contestable; not mechanically settled** |
| Possibility | **proposes rather than asserts** |
| Judgment | **belongs to the author** |

The line that matters sits between **observation** and **interpretation**: it is where a claim
stops being settled by the manuscript. A system that blurs it makes the author argue with a
measurement.

⛔ **Contestable is not the same as author-falsified.** The author has final authority over what
the Work means to them and over what they do about it — but they are not the sole possible knower
of reader effect. *"This may make a first-time reader lose orientation"* is not proven false
because the author says no. The author may **reject or adjudicate** an interpretation; that is a
different act from disproving it, and conflating the two would make the reading either servile or
argumentative depending on which way the conflation ran.

### The four claims, distinguished

Using the lane's worked example:

```text
EVIDENCE       X is introduced in sections 18-21 and does not reappear until 47
               ── re-derivable from the Work; no reader needed

OBSERVATION    the thread disappears for a substantial stretch
               ── "substantial" is the only added judgment, and it is scalar,
                  not evaluative. It does not say this is bad

INTERPRETATION this may weaken the reader's sense that X remains active
               ── the first claim the author can simply refuse

POSSIBILITY    you might echo it earlier — or decide the disappearance is intentional
               ── must offer at least one option that is "change nothing"
```

**The possibility layer carries a specific obligation, and it is structural rather than
lexical.** A set of possibilities must preserve no-change as a legitimate author choice, and must
never imply that intervention is required. Where the only options offered are ways of changing
the Work, the set is a recommendation wearing a question mark.

⛔ This is **not** a requirement that every sentence append "or leave it". A rule satisfied by a
ritual phrase produces ritual hedging, which reads as evasion and teaches the author to skip the
last clause. The obligation is on the option set, not on the wording.

### Downward silence

Authority moves upward only. **An interpretation may never manufacture the evidence it needs.**
The operational form: a developmental reading is assembled bottom-up, and no layer may be
authored before the layer beneath it exists. This is `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY`
applied to a manuscript, and it is why the object model (07C) will need evidence to be structural
rather than conventional — the 05B `evidenceRefs` non-empty-by-type constraint is the precedent.

### An observation with no interpretation is a complete reading

Inherited from the reviewed-structure object, and restated because developmental reading is where
it will be under most pressure: **`interpretation` is optional.** A reading that reports what it
saw and stops is honest and finished. MAIA does not owe the author a meaning, and a schema that
requires one manufactures interpretation to fill a field.

Likewise `none` — *"I read this and found no developmental observation worth your attention"* —
is a complete answer, not an empty result. The structure reader already holds this line.

---

## 2 · What MAIA may read

### The finding this resolves

07A F3: two incompatible context regimes exist today.

```text
STRUCTURE READER   headings + mechanical observations; then FULL BODIES for at
                   most 8 sections / 60,000 chars, hard-refused past the ceiling
ASK RUNTIME        headings and positions only. "Never bodies."
```

### The ruling

**Neither regime is adopted, and neither is the model.** Both were designed for a *bounded,
member-initiated act on a specific question*. Developmental reading is a different shape — the
capability spec calls whole-Work awareness "the requirement, not a nicety" — and a regime built
for one shape must not be inherited by the other because it is the one that already exists.

What is settled here is the **principle that governs whichever regime 07C proposes**:

> **MAIA may read what she must, may hold only what she is reading, and may never be given more
> because more would be convenient.**

Three consequences, each stated so 07C can be checked against them:

**1 · Read scope is per-question, not per-session.** A developmental reading is commissioned for
a purpose, and its scope is derived from that purpose. There is no standing grant, and no
accumulation across turns: the Ask runtime's frozen reading is the pattern — what she reasoned
from is fixed at the time of reasoning and does not silently grow.

**2 · Coverage is a first-class field and it means what was actually read.** Already true in
`EvidenceCoverage`. For developmental reading it becomes sharper, because the failure is worse: a
structural reading of 40% of a chapter that says so is trustworthy, but a *developmental* reading
of 40% that presents itself as whole is a claim about a Work the reader never saw. **Coverage
must be reported at the granularity the claim is made at.** An observation spanning sections 18
to 47 must say whether it read 18 to 47 or read 18, 19 and 47.

**3 · The ceiling is a finding, not a knob.** `readScope.ts` already rules that if a bounded
reading cannot settle a Work, that is evidence about the protocol and not a reason to raise the
ceiling. This holds for developmental reading, and it holds harder: the questions are larger, so
the temptation is larger.

### What is explicitly NOT settled here

```text
whether developmental reading may read bodies at all, and under what ceiling
whether it may read neighbouring sections for context
whether whole-Work structural context is prose, structure, or a digest
what "coverage" is measured in for a claim spanning many sections
whether a reading is one pass or several
```

These are 07C's, and each requires the object to exist before it can be answered honestly.

---

## 3 · What object she is reading

### The finding this resolves

07A F2: 6A gave the Work a canonical authored structure, and no MAIA path can consume it.

### Three objects, and they are not interchangeable

```text
MAIA-PROPOSED STRUCTURE     what MAIA perceived. Frozen at creation, immutable
                            by database trigger. Hers, and never the Work's

REVIEWED PROPOSAL           what the member made of that perception. Mutable,
                            revisioned. Theirs — but still a claim ABOUT the
                            Work, not part of it

MEMBER-AUTHORED STRUCTURE   what the member declared the Work to BE. Canonical,
                            origin = 'member', reached only through an explicit
                            act. Part of the Work
```

### The ruling

> **A developmental reading is a reading of the Work. Where it reasons about structure, the
> structure it reasons about is the member-authored one.**

Three reasons, in descending order of how much they would cost to get wrong:

**Constitutional.** The capability spec's authority gradient states that continuity, sequencing
and reader-knowledge lenses *require authoritative Work Structure* — and that the Editor's
authority to assert rises only as the writer's own declarations rise. Reasoning about sequence
from a structure the member never adopted asserts more than the member has declared. It is the
same violation 6A exists to prevent, arriving one layer up.

**Epistemic.** A proposal is MAIA's own perception. A developmental reading built on it is MAIA
reasoning about her own earlier output and calling the result a reading of the book. The
manuscript stops being the reference.

**Practical.** A proposal can be superseded, revised, or never adopted. An observation anchored
to one inherits its staleness and can outlive the perception it depended on.

### The consequence, stated plainly

**Structure-aware developmental reading requires an authored structure to exist**, and for many
Works it will not. That is not a defect to engineer around. The capability spec already answers
it: *"parts of it can arrive before structure exists, and must, because that is where most
writing begins."*

So the resolution is a split, not a blocker:

```text
STRUCTURE-INDEPENDENT   available whenever there is text
                        reads the Work as a sequence of sections
STRUCTURE-AWARE         available only where the member has authored structure
                        may reason about divisions, sequence, and position
```

⛔ **Where authored structure does not exist, the structure-aware half is ABSENT, not
degraded.** It may not fall back to the proposal, and it may not silently reason about section
order as though the member had declared it to be the Work's order. Section order is a fact about
the draft; division order is a member's declaration. The two must not be quietly equated.

⛔ **A reading may not be re-anchored.** An observation made against authored structure does not
survive that structure changing by being re-pointed at the new one. What happens then is 07C's
question; that it cannot be done silently is settled here.

### What is NOT settled here

Whether MAIA reads authored structure as a tree, a flat list, or a digest; what identity an
observation uses to reference a division; whether the proposal remains readable *as provenance*
alongside authored structure. All 07C.

---

## 4 · The lens vocabulary, reconciled

### The finding this resolves

07A F5: the capability spec names seven lenses; the lane's provisional v1 names eight, under a
different decomposition, and two mismatches are substantive.

### The diagnosis

The two lists are **not two namings of one taxonomy**. They are cut along different axes.

```text
CAPABILITY SPEC     cut by EDITORIAL FUNCTION — what question is being asked
LANE v1             cut by OBSERVABLE PHENOMENON — what pattern is being seen
```

That is why *Development* has no counterpart in the lane list: it is a function, not a phenomenon.
And why *Repetition* and *Unresolved Threads* have none in the spec: they are phenomena that the
spec distributes across two functions.

Neither cut is wrong. **Collapsing them into one list is what would be wrong**, because it would
force a phenomenon to belong to exactly one function or a function to own exactly one phenomenon,
and neither is true.

### The ruling

> **A lens is an editorial function. A phenomenon is what evidence shows. One phenomenon may be
> seen through more than one lens, and one lens may draw on more than one phenomenon.**

They are two independent lists, and the relation between them is many-to-many. Set out as two
columns they would read as a mapping, so they are set out apart:

```text
PHENOMENA — what the reading notices
  recurrence
  unresolved thread
  register shift
  prospective reference
  re-explanation / first-mention
  movement
  term drift
  positional asymmetry

LENSES — what is being asked
  Structure     does this belong here
  Development   is this developed
  Continuity    does time hold
  Arc           what journey
  Voice         is this the Work's voice
  Coherence     does it hold together
  Reader        what does the reader already know
```

The relation is what carries the meaning, and it is a **crossing**, not a lookup:

```text
recurrence       × Structure     → does this repetition belong here?
recurrence       × Development   → does this repetition advance the idea?
unresolved thread × Reader       → what is the reader still waiting for?
unresolved thread × Development  → has this idea stopped developing?
register shift   × Voice         → has the Work's voice changed here?
register shift   × Arc           → is this a movement, or a lapse?
```

Same phenomenon, different lens, different question, and often different answers. Neither column
is derivable from the other.

### Where "phenomenon" sits epistemically

⛔ **Phenomenon is a classification of developmental observation. It is not a new epistemic
layer.** The six layers of §1 are unchanged, and nothing sits between evidence and observation.

Saying "recurrence" is saying what *kind* of observation this is; it adds no claim the observation
did not already make. If 07C were to make `Phenomenon` an object between `Evidence` and
`Observation`, it would create a layer with nothing to falsify it — the failure §1 exists to
prevent.

The right-hand column is the capability spec's seven, unchanged. **The seven stand.** The lane's
v1 list is reclassified: it was naming phenomena, and it is preserved as an input to the
phenomenon layer rather than as a competing lens set.

### The four questions, answered

**Is Development a lens?** **Yes**, and it is the one the spec describes most fully:
underdeveloped · sufficiently developed · overexplained · introduced too late · abandoned ·
repeated without advancing. Its absence from the lane's list is explained by the axis difference,
not by a disagreement about whether it belongs.

**Is Repetition its own lens, or evidence seen through Structure/Development?** **A phenomenon,
not a lens** — and the reason is decisive. "What repeats?" through the *Structure* lens asks
whether the repetition is misplaced. The same repetition through *Development* asks whether it
advances. Same evidence, two different editorial questions, two different answers. Making
Repetition a lens would force a choice between them and lose one.

**Is Unresolved Threads distinct from "abandoned"?** **They are the same phenomenon named at two
different layers**, and both names are legitimate where they belong:

```text
OBSERVABLE          the thread is introduced and not subsequently developed
                    → "unresolved" · "no further development observed"

INTERPRETATION      the thread appears to have been abandoned

AUTHOR JUDGMENT     yes, I abandoned that thread
```

So **`unresolved` is the phenomenon name** — it is what the evidence supports — while
**`abandoned` remains valid at the interpretation and judgment layers**, which is exactly where
the capability spec uses it, under *Development*. Nothing in the spec is edited by this document;
the term is placed rather than replaced.

The distinction is not pedantry. *Abandoned* says the author gave up, and a thread may be
deliberately left open — only the author knows which, and that is the difference between an
observation and an interpretation falling on a single word.

**What do Arc and Movement mean?** **Arc is the lens; movement is the phenomenon.** Arc asks what
journey a chapter takes a reader through and what journey the whole Work has taken. Movement is
the observable: where intensity, orientation or register shifts. Arc reasons about movements;
movement is not itself an editorial question. **Arc is scope-sensitive, not uniformly structure-aware.** An editorial function is not available
or unavailable as a whole; its availability follows the scope of the claim:

```text
local movement / local arc   structure-INDEPENDENT — a bounded passage has a
                             shape whether or not the Work has declared divisions
division / chapter arc       requires authored DIVISION IDENTITY — "this chapter"
                             presupposes the member has said what a chapter is
whole-Work arc               requires authoritative Work Structure
```

Stated this way because the alternative makes an entire editorial function unavailable to early
Works, which contradicts the capability spec's maturity gradient — *"parts of it can arrive before
structure exists, and must, because that is where most writing begins."* The gradient constrains
what may be **asserted at a given scope**, not which lenses exist.

### What is NOT settled here

The phenomenon list is **not** frozen — the left column above is illustrative, drawn from the two
existing documents, and 07C decides which phenomena are actually detectable and worth naming. No
`DevelopmentLens` enum is defined here. Which lenses are structure-aware is stated for Arc only,
because §3 forced it; the rest is 07C's.

---

## 5 · What MAIA may claim

The four epistemic acts of §1, restated as a rule that can be checked against an implementation.

| Act | Form | Must carry | May never |
|---|---|---|---|
| **Evidence** | "X appears at 18–21 and at 47" | a recoverable reference | evaluate |
| **Observation** | "X is absent for 26 sections" | the evidence it rests on | say whether that is good |
| **Interpretation** | "this may weaken continuity" | hedged modality, and the observation | assert a defect as fact |
| **Possibility** | "you might echo it earlier" | a set in which no-change stays legitimate | recommend, rank, prefer, or imply intervention is required |

### Five prohibitions

⛔ **No verdict vocabulary.** *weak · flawed · broken · needs work · should* assert defect. What
is available is: what is there, what is absent, where, and what that might do to a reader.

⛔ **The developmental reading itself generates no replacement prose.** The moment a reading
emits a sentence in the author's register that could be dropped into the Work, it has authored.
This is a constraint on the *reading*, not a prohibition on the capability spec's `Reframe`: any
later Reframe is a separate, author-invoked act, working from the writer's existing language, and
it is neither authorized nor defined by 07B.

⛔ **No confidence scoring of the Work.** Uncertainty about MAIA's own reading is honest and
required. A number attached to the manuscript's quality is a verdict with a decimal point.

⛔ **No ranking.** "The three biggest problems" is a judgment about what matters in someone
else's book. Observations may be ordered by position in the Work; not by importance.

⛔ **No aggregate health claim.** No score, no readiness, no percentage complete. Nothing that
answers "is my book good yet" — a question the system must decline to have an opinion about.

### The single test

> **Could the author read this and reasonably say "no, that is not what it does" — and would the
> system then have been wrong about a fact, or wrong about a meaning?**

**Wrong about a fact** → the claim was evidence or observation. A defect, unambiguously.

**Wrong about a meaning** → **not automatically a defect, and not automatically fine.** The claim
was an interpretation, and interpretations are contestable by §1. Three things still have to hold,
and a bad interpretation does not become good merely because it was labelled correctly:

```text
evidence-grounded   it rests on an observation that rests on evidence
scoped              it claims only at the scope its reading covered
explicitly framed   it presents itself as interpretation, not as finding
```

An interpretation that fails any of these is a defect even though the author "merely disagreed" —
and one that holds all three is the reading working correctly, with the author doing exactly what
the reading is for.

---

## 6 · What this document does not do

```text
no schema · no table · no migration
no route · no prompt · no surface
no reader implementation · no lens code
no DevelopmentLens enum · no frozen phenomenon list
no repair of 07A F1, F2 or F3
no authorization of 07C
```

Two of the three findings it resolves stay open as *engineering* problems: F2 and F3 are answered
here as questions of meaning only. Nothing above makes authored structure reachable from a MAIA
path, and nothing above defines a context regime.

**07C DECIDE opens on its own authorization**, and its job is one object: the smallest
`DevelopmentalReading` that satisfies §1's layering, §3's object ruling, and §5's claim
discipline.
