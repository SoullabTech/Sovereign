# NW-R01 — FLOURISHING RESEARCH RECONCILIATION

**Programme**: Now What? — Product, Flourishing & Coaching Experience Reconciliation
**Unit**: NW-R01 · **Date**: 2026-08-26 · **Precedes**: NW-R02

---

## UNIT

NW-R01 — Flourishing Research Reconciliation.

## STATUS

COMPLETE. Awaiting ruling before NW-R02.

## CANONICAL START

The census (NW-D00) plus the founder-supplied primary sources. Frameworks are treated as
**lenses**, never as product doctrine (§III).

**Provenance limit, stated plainly**: this unit performed **no new literature retrieval**. The
frameworks below are described from established knowledge of the primary literature and from the
sources the founder supplied. Every claim here is at the level of *what the model asserts and
what it omits* — structural claims that are stable across the literature. **No effect size,
psychometric coefficient, population statistic, or licensing term should be quoted from this
document.** Where a decision would turn on such a figure, that is marked as a research gap, not
answered.

## OBJECTIVE

Determine, for each serious flourishing model: what it sees, what it misses, whether it is
descriptive or prescriptive, what is measurable, **what must never become a member-facing
score**, and what genuinely belongs in Now What?.

---

## ⚠️ CORRECTED BY NW-D01 (2026-08-26) — READ FIRST

**The central finding of this unit is substantially wrong and should not be relied on as
written.** NW-D01 established from `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md`
§3a that the six shipped domains **are Larry's own six** — Relationships · Meaning and Purpose ·
**Time Affluence** · Presence · **Health and Energy** · Contribution — all six matching what
ships today.

I measured them against VanderWeele and called them an *"unattributed hybrid"* that *"adds Time
(no research pedigree)"*. That was the wrong yardstick: they were never meant to be VanderWeele,
and "Time" is **Time Affluence, Larry's own dimension**. The audit also records that the drift it
found (invented *"Attention"*, dropped Time Affluence and Health & Energy) was **repaired in the
runtime path** on 2026-08-05.

**What survives from this unit's finding:** the domains remain **unvalidated** (the one attempt —
Charter Workbook PART III — was a leading instrument whose answers are compromised) and
**unlicensed** (agreement unsigned, Attachment A nonexistent). R01-F2 (they ship as fixed
architecture against ruling D-D) stands. The observation about material stability stands too, but
as a **question for Larry about his own framework**, not as a defect.

The framework reconciliation below (rulings on VanderWeele, Ryff, PERMA, SDT, Keyes, Capabilities,
Diener) is unaffected — none of it depended on the domain provenance claim.

---

## THE FINDING THAT DRIVES THIS UNIT

Now What? **already ships a flourishing taxonomy**, and it is not any of the models under
review.

`app/now-what/work/page.tsx:48` hardcodes six domains:

| # | Shipped domain | Facets as written |
|---|---|---|
| 1 | Relationships | connection · belonging · love |
| 2 | Meaning & purpose | what your life is for |
| 3 | Presence | experiencing the life you built |
| 4 | Health & energy | movement · sleep · vitality |
| 5 | Contribution | what you give beyond yourself |
| 6 | Time | enough of it for what matters |

Mapped against VanderWeele's flourishing domains — the closest published relative:

| VanderWeele | Now What? counterpart |
|---|---|
| Close social relationships | **Relationships** ✓ |
| Meaning & purpose | **Meaning & purpose** ✓ |
| Mental & physical health | **Health & energy** ✓ |
| Happiness & life satisfaction | **Presence** — *partial and different*: an experiential-quality construct (savoring, being-here) rather than an evaluative judgment of one's life |
| Character & virtue | **Contribution** — *partial and different*: outward giving, not moral formation |
| Financial / material stability | **absent** |
| — | **Time** — no counterpart in any reviewed model |

**Two omissions and one addition, and all three encode a population assumption.**

- **Dropping material stability** presumes the member's material security is solved. That is a
  defensible design choice for a coaching practice serving executives, and an indefensible one
  for a product the founder has now said should be *"larger than executive life."*
- **Replacing character & virtue with contribution** converts the most morally loaded domain in
  the flourishing literature into an output measure.
- **Adding Time** is genuinely responsive to the population — time scarcity is the executive's
  lived constraint — and has no research pedigree in any reviewed model. It is practice wisdom,
  not a research domain, and should be labelled as such rather than sitting flush alongside five
  research-derived ones.

The six are therefore an **unattributed hybrid**, and the repository already knew: commit
`bdac224ab` is titled *"IP posture on the flourishing domains — unattributed pending Larry's
validation"*, and `daa3c54fa` marks the six-domain comment *"pending Larry validation"*. That
validation has not occurred.

**And they shipped as architecture, not as an offering.** The recovered ontology ruling (D-D)
recommended option (b) — *six domains as offered starting vocabulary, member may rename or
discard*. What shipped is option (c): six fixed domains, no rename, no discard. The ruling
document states the test its own D-D exists to satisfy:

> *"Can someone say 'this is not the lens I use' and still belong in the room? If yes, it is an
> offering. If no, it has become architecture."*

As shipped, a member cannot say that. **This is a live Invariant 14 (cultural sovereignty)
exposure that the ruling anticipated and the build did not honor.** It is the single most
consequential flourishing finding in this unit, and it is a defect in the product today — not a
question about future research.

---

## FRAMEWORK RECONCILIATION

### 1. VanderWeele / Harvard Human Flourishing

**Origin / evidence basis**: Public-health epidemiology; a deliberately multidimensional
construct built to resist collapsing wellbeing into happiness. Paired with a short self-report
measure.

**What it explains**: That a life can go well or badly along several partly-independent axes at
once, and that a person can be doing well on some while failing on others. Its inclusion of
**material stability** and **character & virtue** is its real contribution — most wellbeing
models quietly omit both, the first because it is uncomfortable and the second because it is
hard to measure without moralizing.

**What it does not explain**: Change. It is a **cross-sectional description of a state**, with
no account of transition, no mechanism, and no theory of how a person moves. It says nothing
about *what to do*.

**Useful to Now What?**: **PARTIAL.**

**Potential role**: **Underlying intelligence and coverage audit — never a member-facing
structure.** Its best use is negative: a check that the environment has not silently dropped a
region of life. That is exactly the check the shipped six failed.

**Risks**: The measure's existence exerts constant pull toward scoring. Domain labels imported
whole become an imposed vocabulary (Invariant 14). Its population and normative assumptions are
not universal.

**RULING**: **KEEP AS LENS** — specifically as the *coverage audit* against which any Now What?
domain vocabulary is checked for silent omission. **REJECT** its measure as a member-facing
instrument.

---

### 2. Ryff Psychological Well-Being

**Origin / evidence basis**: Developmental and eudaimonic psychology; six dimensions —
self-acceptance, positive relations, autonomy, environmental mastery, purpose in life, personal
growth.

**What it explains**: **Development**, which VanderWeele does not. Autonomy, environmental
mastery and personal growth are *developmental capacities*, not life conditions. This is the
model closest to what a coaching relationship actually works on, and the only reviewed model
whose dimensions name **the member's growing capability** rather than their circumstances.

**What it does not explain**: Situation and context. It is thoroughly intrapsychic — relational,
material, structural and cultural conditions barely appear. It also carries a culturally
specific ideal of the mature person (autonomous, self-accepting, in mastery of environment) that
does not travel neutrally.

**Useful to Now What?**: **PARTIAL — and more so than its current absence suggests.**

**Potential role**: **Underlying intelligence.** Ryff's dimensions are the best available
articulation of *what the member is becoming more capable of* — which is precisely the claim
"My Story" is built to hold. Nothing in the shipped six domains names a developmental capacity.

**Risks**: Psychometric heritage invites scoring. Its maturity ideal, if made visible, becomes a
prescription for who the member should be — a direct Invariant 14 and non-guru-stance violation.

**RULING**: **KEEP AS LENS** for the developmental layer (NW-D02). **REFERENCE ONLY** as
vocabulary — its dimension names must not reach a member surface.

---

### 3. PERMA

**Origin / evidence basis**: Positive psychology — positive emotion, engagement, relationships,
meaning, accomplishment.

**What it explains**: Provides accessible everyday vocabulary, and correctly separates
*engagement* (absorption in activity) from *positive emotion* — a distinction the shipped
"Presence" domain gestures at without naming.

**What it does not explain**: Adversity, constraint, material conditions, injustice, and loss.
Its construct validity as a five-factor model is contested in the literature. **Accomplishment**
is the reviewed literature's single closest neighbor to productivity semantics, and is the most
dangerous element to bring into a product the founder has ruled must carry no scores or
milestones.

**Useful to Now What?**: **NO, as architecture. PARTIAL, as one contributed distinction.**

**Potential role**: The engagement/positive-emotion distinction is worth carrying into how
"Presence" is defined, if Presence survives NW-D01. Nothing else.

**Risks**: The most score-prone of all reviewed models; "PERMA profile" dashboards are its
common commercial expression, and are precisely the drift the vision-reference disposition
already ruled against.

**RULING**: **REFERENCE ONLY.** Explicitly **not** the platform architecture, consistent with the
founder's own framing.

---

### 4. Self-Determination Theory

**Origin / evidence basis**: Motivation theory — autonomy, competence, relatedness as basic
psychological needs; the intrinsic/extrinsic and autonomy-supportive/controlling distinctions.

**What it explains**: **Why a design either strengthens or erodes agency** — the mechanism, not
just the value. It is the only reviewed model that gives a *testable account of how an
intervention can help someone in the short run while making them less capable of self-direction
in the long run.* That is the exact failure mode Now What?'s sovereignty invariants exist to
prevent, and SDT explains it where the invariants only forbid it.

**What it does not explain**: Content. It tells you nothing about what a good life contains,
what has changed, or what to do next.

**Useful to Now What?**: **YES — the strongest yes in this unit.**

**Potential role**: **Design test, not content.** §IX already proposes exactly this. SDT belongs
where the sovereignty invariant check already sits in `CLAUDE.md` — as a question asked of every
feature — and it materially sharpens the existing check. Note the alignment: the project's
existing invariant *"does this reduce the system's psychological centrality over time?"* is an
autonomy-support question in SDT's terms.

**Risks**: Low, and mostly of over-application — SDT is a lens on *design*, and turning
autonomy/competence/relatedness into three member-facing categories or a needs-satisfaction
score would invert it completely.

**RULING**: **ADAPT** — into the feature test at §IX. Never member-facing, never measured.

---

### 5. Keyes — Flourishing / Languishing continuum

**Origin / evidence basis**: Sociology of mental health; mental health as a continuum
(languishing → moderate → flourishing) *distinct from* the presence or absence of mental
illness.

**What it explains**: The state Now What? is arguably built for. **Languishing** — not ill, not
well, "blah", stalled — is the closest research construct to the "Now What?" moment as the
founder describes it: *something no longer fits, and the person cannot name what.* It is also
the state most likely to be invisible to any model that only measures positive functioning.

**What it does not explain**: Cause, and what to do. Purely descriptive.

**Useful to Now What?**: **PARTIAL — materially, and currently absent from the record.**

**Potential role**: **Research only, and as a boundary-setting concept for §XX.** Its
categorical language ("you are languishing") must never reach a member; but the *distinction*
between languishing and clinical illness is directly load-bearing for the clinical-boundary
work, which the safety trace found has no substrate at all.

**Risks**: Highest labelling risk of any reviewed model — the categories are stigmatizing when
applied to a person, and are the kind of system-voiced finding the adaptation boundary forbids
by name.

**RULING**: **REFERENCE ONLY**, carried into NW-R02 as an input to the clinical-boundary
definition. **Never a category applied to a member.**

---

### 6. Capabilities Approach (Sen / Nussbaum)

**Origin / evidence basis**: Development economics and political philosophy — wellbeing as
**real freedom to do and be what one has reason to value**, not as a mental state.

**What it explains**: The one thing every psychological model above structurally cannot see —
that flourishing depends on **actual options**, and that two people with identical inner states
can have radically different real freedom. It also supplies the cleanest philosophical answer to
the imposition problem: capabilities (what you *could* do) are offered; functionings (what you
*actually* do) are the person's own choice. That is, in academic form, the same distinction the
D-D ruling makes with *"offering vs. architecture."*

**What it does not explain**: Interiority, meaning, motivation, development. Deliberately not a
psychology.

**Useful to Now What?**: **PARTIAL — and it earns its place by solving a demonstrated gap
(§III's own admission criterion).**

**Potential role**: **Underlying doctrine, not content.** It gives the environment a principled
account of *why it offers rather than prescribes* — one that generalizes past the executive
population, which the founder's 2026-08-26 positioning ruling now requires.

**Risks**: Abstract; adds no member-facing vocabulary; can become philosophical decoration if
imported without a job. Its job here is narrow and specific.

**RULING**: **KEEP AS LENS** — as doctrinal grounding for the offering/imposition boundary at
NW-D01, on the explicit condition that it never generates a member-facing structure.

---

### 7. Subjective Wellbeing (Diener et al.)

**Origin / evidence basis**: Life satisfaction plus affect balance; the most-measured construct
in the wellbeing literature.

**What it explains**: How a person evaluates their own life, in their own terms — the most
member-sovereign construct reviewed, since the judgment is entirely the person's.

**What it does not explain**: Almost everything else. Highly reactive to mood and recent events;
famously stable against real life changes; explains no development and no situation.

**Useful to Now What?**: **NO.**

**Potential role**: None on any member surface. Possible longitudinal research instrument only,
far downstream, and only under §XIX's full validity/licensing review.

**Risks**: It is a single number about a life. Everything the founder has ruled out —
*"you are 74% flourishing"* — is one step from a satisfaction scale.

**RULING**: **REJECT** for the product. **REFERENCE ONLY** for NW-D06 research design.

---

## SUMMARY OF RULINGS

| Framework | Ruling | Role if kept |
|---|---|---|
| VanderWeele / Harvard Flourishing | **KEEP AS LENS** | Coverage audit — checks for silently dropped regions of life |
| Ryff Psychological Well-Being | **KEEP AS LENS** | Developmental layer (NW-D02); vocabulary never member-facing |
| PERMA | **REFERENCE ONLY** | One distinction (engagement ≠ positive emotion) |
| Self-Determination Theory | **ADAPT** | The §IX feature test; sharpens the existing sovereignty check |
| Keyes flourishing/languishing | **REFERENCE ONLY** | Input to the §XX clinical boundary (NW-R02) |
| Capabilities Approach | **KEEP AS LENS** | Doctrinal grounding for offering-vs-imposition |
| Subjective Wellbeing | **REJECT** (product) | Research design only |

**Nothing above becomes a visible feature.** Per §IV: no Frankenstein synthesis. Four of seven
never reach a member surface at all; the other three shape *what the system checks itself
against*, not what the member is shown.

---

## FINDINGS

**R01-F1 — ⚠️ CORRECTED BY NW-D01 (see head of document). ~~The shipped six domains are an
unattributed hybrid with an encoded population assumption.~~ They are Larry's own six. What
stands: they are unvalidated and unlicensed.** Original text follows for the record.

~~The shipped six domains are an unattributed hybrid with an encoded population assumption.~~** They are not VanderWeele, Ryff, or PERMA. They drop material stability, convert
character & virtue into contribution, and add Time (no research pedigree, genuine practice
wisdom). The omissions presuppose a materially secure member — which the founder's own
repositioning now contradicts.

**R01-F2 — The domains ship as architecture, against their own ruling.** D-D recommended an
offering the member could rename or discard; option (c) shipped. This fails the ruling's own
test and is a live Invariant 14 exposure.

**R01-F3 — Nothing in the environment names a developmental capacity.** All six shipped domains
name *areas of life*. None names what the member is becoming more able to do. If "My Story" is
to hold becoming, the vocabulary for becoming does not currently exist anywhere in the product.
(Ryff is the reviewed model that supplies it.)

**R01-F4 — The strongest research contribution to Now What? is a test, not a taxonomy.** SDT
earns the clearest YES in this unit, and it produces no member-facing content whatsoever. This
is the shape of the answer generally: **the research belongs in Layer 3** of the founder's
three-layer rule — invisible intelligence — and almost none of it belongs in Layer 1.

**R01-F5 — "Flourishing" is currently a room, and the research does not support that.** No
reviewed model is an information architecture. VanderWeele is a coverage check; Ryff is a
developmental account; SDT is a design test; Capabilities is a doctrine. The founder's own
instinct — *"flourishing probably should not be another top-level tab… it can become a
perspective the system offers"* — is the reading this unit's evidence supports.

## CONFLICTS

**R01-C1 — Positioning still unresolved, and now it has teeth.** The dropped material-stability
domain is only defensible under "executive development environment." Census **C2** must be
settled at NW-D01 before any domain vocabulary is re-ruled.

**R01-C2 — Larry's framework vs. the research taxonomy.** The six domains are marked *pending
Larry validation* and remain unvalidated. Per §XXVII, **Larry wins where this is a
philosophy/product decision.** But the D-D failure is not a philosophy decision — a fixed
vocabulary the member cannot decline is a sovereignty question, and the ruling already decided
it. Larry's framework may supply the six names; it does not authorize their fixity.

## RULINGS (product disposition)

- **KEEP**: nothing new.
- **EVOLVE**: the six flourishing domains — from fixed architecture to declinable offering
  (D-D option (b)), pending Larry validation of the names themselves.
- **REBUILD**: none in this unit.
- **RETIRE**: none in this unit.
- **UNKNOWN**: whether Larry authored the six domains, adapted them, or whether they were
  composed in-house. `bdac224ab` says *unattributed pending validation*; NW-D01 must answer it
  before the names are treated as his.

## DESIGN IMPLICATIONS

1. **No flourishing model becomes a room, a tab, or a set of cards.** Supported by all seven
   reconciliations.
2. **The coverage-audit use of VanderWeele is the one that survives** — run privately, to catch
   what the environment cannot see. It has already caught something.
3. **SDT joins the existing sovereignty invariant check** as a mechanism, not a new gate.
4. **A vocabulary for developmental capacity is missing** and NW-D02 must decide whether to
   supply one — from Larry's practice first, Ryff as lens only.
5. **The word "flourishing" is doing two different jobs** in the product today: a field-context
   slug (`'flourishing'` in `AUTHORIZED_FIELD_CONTEXTS`) and a domain taxonomy inside My Work.
   NW-D03 should not inherit that ambiguity.

## DATA / SOVEREIGNTY IMPLICATIONS

- `flourishing_dimension` is a **CHECK-constrained** column (per the recovered ruling's
  write-loop closure record). Making the six declinable or renameable is therefore a **migration
  and a consent question**, not a UI change — a member-named dimension cannot satisfy a fixed
  CHECK constraint.
- No score, index, or composite exists anywhere in the environment. **That is the correct
  starting state and this unit recommends nothing that would change it.**
- Any future instrument falls under §XIX in full (validity, licensing, population, clinical vs
  non-clinical, commercial permission). Nothing in this unit authorizes one.

## TEST / RESEARCH GAPS

1. **Provenance of the six domains** — unresolved, blocks NW-D01.
2. **No literature retrieval performed** (see provenance limit). Any decision turning on an
   effect size, psychometric property, or licensing term needs a real sourcing pass first.
3. **Licensing/permissions unexamined** for every instrument reviewed — deliberately out of
   scope until §XIX, but it gates any measurement work.
4. **No member has ever been asked** whether the six domains describe their life. The D-D test
   is answerable only by a member, and has never been run.

## NEXT ELIGIBLE UNIT

**NW-R02 — Coaching & Change Research Reconciliation** (ICF, Intentional Change Theory,
Motivational Interviewing, Immunity to Change, ACT, transition theory, action/implementation
models).

Carry into NW-R02: Keyes (clinical-boundary input) and the **safety-inheritance trace**, which
found §XX has no substrate on the conversational path. The clinical-boundary definition is
NW-R02's most load-bearing deliverable.

## STOP
