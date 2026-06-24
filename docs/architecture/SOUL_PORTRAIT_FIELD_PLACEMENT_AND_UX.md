# Soul Portrait — Field Placement & UX (DRAFT)

> **Status:** DRAFT design, 2026-06-23 (Kelly asked: where does the member-facing
> Soul Portrait live across Studio / Lab / Colab, and what's the UX?). Builds on
> [SOUL_PORTRAIT_GENERATOR_SPEC.md](./SOUL_PORTRAIT_GENERATOR_SPEC.md) (the engine +
> generator) and the constitutional disciplines from this session. **The generator
> (Slice 2) is not built yet — this is the placement/UX it plugs into when it is.**

## The governing invariant

> **Every artifact MAIA creates should return agency to the member by inviting deeper
> authorship of their own life.**

Authorship is the *form agency takes* within MAIA — its primary **mechanism**, not its
sole **measure**. The distinction is load-bearing: there are seasons (grief, trauma,
depression, exhaustion) when a person cannot author much at all, yet the system must
still move agency *toward* them, not away. Naming **agency as the genus and authorship as
one mature expression** is what resolves the monotonic-growth worry cleanly — *the
direction is constant even when the expression varies.* (This supersedes the earlier
"directional, not monotonic" phrasing below: it is not authorship that is directional —
it is *agency*; authorship is the variable surface it shows.)

The deeper progression is not artifact → field but **gift → authorship**: the Portrait
is *given*, the member's response is *authored*, and everything after grows from that
authorship. So the architecture is not fundamentally about memory or personalization —
it is about **progressively increasing the member's authorship.** MAIA makes *artifacts
that deepen relationship, not artifacts that conclude interpretation* — the first place
a member feels it is the Soul Portrait: not a thing that *analyzes* them, but a thing
that *hands authorship back.*

What makes this an **invariant and not an aspiration is that it can reject designs:**

- a feature that encourages dependency — **fails**
- a feature that silently classifies the person — **fails**
- a feature that accumulates interpretations instead of returning authorship — **fails**
- a feature that invites the member into deeper participation — **succeeds**

It is sharper than "human-centered AI" (which dependency-increasing systems also claim).
The test is **directional**: *which way is agency flowing — toward the member, or toward
the system?* The [garden](#the-living-field-is-a-garden-not-an-archive) has fallow
seasons, so the invariant **rejects agency pooling in the system**; it never demands
constant visible empowerment — that would itself be a project *for* the person, the very
thing §1.4 forbids. **The objective lives on MAIA's side of the line:** return-of-agency
is a property of what MAIA *does and refuses*, never a target imposed on the person's
trajectory. The moment the target moves to the member's *measured growth* (or their
*reduced usage*), MAIA has acquired a project for them — paternalism rebuilt — which is
the precise thing the whole architecture exists to refuse.

This is the **Power/Restraint principle made directional** — the constitutional sovereign
stated as a production rule. By the project's own promotion doctrine it pays rent (it
constrains; it says no), so it is **canon-worthy in form.** But per validity-vs-
legitimacy it earns ratification only when it has **rejected a real design at real
cost** — not by being declared. Held here as the leading candidate invariant; ratified
the day it kills something we wanted to ship.

Its measurement is the open question, and it is the same one the constitution already
named: **"who is becoming the author over time?"** is exactly the variable the §5
capability instrument must observe — *measure becoming without violating the
sovereignty becoming requires.* The invariant is the **test**; the instrument is the
**measurement**; they are two halves of one thing.

### What MAIA optimizes for (objective · gate · ladder · north star)

Most systems optimize for **correctness**, **efficiency**, or **engagement.** The
objective implied by everything above is none of those: it is **the return of agency to
the person.** Two disciplines keep that honest:

- **It is a *Designed* objective, not yet a *Live* one.** Nothing in the runtime measures
  agency-return today (that is the §5 instrument, unbuilt) — so "MAIA optimizes for
  agency" names the *design target*, not an operational objective function. It becomes
  Live only when there is something to measure it with. Saying more would be the
  inflation drift.
- **The target sits on *MAIA's* side.** It optimizes for *structuring every artifact to
  hand capability back* and for *refusing to accrue agency to itself* — never for the
  member's measured growth-curve. Optimizing for the person's trajectory is the
  paternalism trap at the scale of the objective function.

**A four-question feature gate** (the existing Power/Restraint check, made explicit):

| Question | Pass |
|---|---|
| Does it increase understanding? | yes |
| Does it increase relationship? | yes |
| Does it increase agency? | yes |
| Does it increase dependence on MAIA? | ideally no — and if it does, there must be a clear path that **returns** the capability to the member |

The first three restate the constitutional review. The **fourth is the novel and most
operational one**: most products celebrate repeated reliance; this architecture is
*suspicious* of it and treats unreturned dependence as a smell to instrument — the
inverse of the engagement metric. (It is CLAUDE.md's *transferable capacity* made into a
gate: capability that is exercisable when MAIA isn't there.)

**A developmental ladder** — `Information → Understanding → Meaning → Agency →
Authorship` — where **agency, not authorship, is the goal**; authorship is one mature
expression of it. This lets the architecture meet a person at their rung and move them
member-ward without demanding everyone become an active creator at once. Read it as a
**locator** (where someone is — which may differ by domain and season; the spiral, not a
universal staircase climbed once), never a conveyor; collapsing a person onto a single
rung would violate the no-single-narrative restraint.

**The design north star** (Kelly's — and *correctly* held as a design direction, not a
constitutional primitive):

> **MAIA succeeds when it gradually becomes less necessary because the member becomes
> more capable.**

This is the Sovereignty Invariant's *"reduce the system's psychological centrality over
time"* stated as a success metric. Its honest measure is **transferable capacity** —
what the member can do when MAIA isn't there — **not reduced usage.** "Less necessary"
means the *kind* of necessity changes (structure / guidance → mirror / witness /
accompany) as the member carries more of what MAIA once held; it does **not** mean
engineering one's own abandonment (that would just be the engagement metric flipped, and
a target imposed on the person again). The system stays **indifferent to whether the
member then stays or departs** (§1.4); it is responsible only for keeping what it holds
*transferable.* Every new feature should make it easier for the member to stand on their
own feet, not harder — *that* is the deepest thread.

### Three levels of governance: Constitution · Architecture · Artifacts

A separation worth making explicit, because it answers *why* the invariant above is **not
constitutional canon** — and retires the recurring "should this go in the Oath?":

| Level | Question | Governs | Verb |
|---|---|---|---|
| **Constitution** | What must never be violated? | the **person** (boundaries) | **protects** sovereignty |
| **Architecture** | How should the system be organized? | the **movement of capability** | **returns** agency |
| **Artifacts** | What should each feature accomplish? | individual **experiences** | **invites** authorship |

Each level governs a *different object*. So "every artifact should invite deeper
authorship" isn't constitutional material — it protects no boundary; it **directs
production.** It is *architectural.* That is the structural reason it's held out of the
Oath, sharper than "we're being cautious": it simply lives at a different level. The name
for the whole — **an agency architecture**, defined by what it *produces* rather than the
technologies it uses — is an honest description of *intent* (outward, claim-disciplined:
a *Designed* descriptor until the §5 instrument shows agency is actually returned).

**Refinement — the levels are nested, not peers.** Constitution bounds Architecture
bounds Artifacts; at conflict the higher wins. An artifact may never invite authorship by
crossing a vow; the architecture may never return agency by violating Sanctuary (already
canon: *the person's sovereignty, not the relationship's survival, is the value*). Read
the table as concentric. It also shows CLAUDE.md's single "constitutional review" was
bundling three reviews against three objects — this decomposes them.

### Capability is not capacity

The distinction that makes "keep the objective on MAIA's side" *operational*:

> **AI can supply capability. Only a person can develop capacity.**

A calculator supplies the capability to compute; it doesn't grow mathematical capacity.
An AI can supply the capability to draft a reflection, name a pattern, sketch a plan —
with the person's own capacity unchanged. So every feature asks: **am I merely supplying
capability, or cultivating capacity?** The Portrait *supplies* a capability (a reflective
mirror); the **reception moment** begins *cultivating* capacity (it asks the member to
discern, choose, respond); Practices cultivate capacity when they internalize and **no
longer need the system.**

This gives a measure that **avoids paternalism**: you don't evaluate whether the *member*
has grown (a judgment about the person) — you evaluate whether the **artifact is designed
to cultivate capacity rather than merely deliver capability**, which stays on MAIA's
side. (Same axis as the fourth gate-question — dependence with no path of return — seen
from the design side.) Two riders keep it from inverting:

- **Cultivate conditions, not a curriculum (§1.4).** "Cultivating capacity" turns
  paternalistic the moment MAIA decides *which* capacities the person *should* develop. It
  tends the *conditions* for the general capacities of agency — perceive, choose, relate,
  author — and stays indifferent to which the person grows, or whether.
- **Capability is not the enemy.** The failure isn't supplying capability; it's supplying
  capability that *substitutes* for capacity indefinitely. Withholding useful capability
  to *force* growth is its own paternalism (and crueler). The test: does the capability
  **open** capacity or **foreclose** it? The calculator is fine; the calculator that
  atrophies estimation is not.

It joins the two distinctions already running through the work — a coherent philosophy of
restraint, *what the system can provide* vs. *what belongs to the person*:

- **Representation ↔ Relationship** — *may represent, but not replace*
- **Agency ↔ Authorship** — *may return, but not author*
- **Capability ↔ Capacity** — *may supply, but not substitute; may cultivate, but not claim*

(These are tempting to formalize into a grid against the three levels. That temptation is
exactly what earns suspicion — elegance is not rent. Held as three distinctions, not built
into a matrix, until one rejects a design the flat list wouldn't.)

## The one decision that organizes everything: it's not one surface, it's three jobs

The three surfaces already have distinct audiences. So the Soul Portrait isn't placed
in *one* of them — it maps to all three **by who is doing what**:

| Surface | Audience (today) | The Soul Portrait job it carries |
|---------|------------------|----------------------------------|
| **Lab** — the member's chart/elemental space (live today as `/astrology`, "The Blueprint") | **Members** | **Create your own.** The portrait is the *literary layer on top of the chart a member already explores here.* This is the home for "create this for themselves." |
| **Studio** — the practitioner command center (`/studio/*`) | **Practitioners** | **Create for clients, at scale.** A `portrait` module that drafts via the existing **Ask-MAIA propose → human-approves** pattern; review, curate, send. |
| **Colab** — the team/collaborative space (`/team/*`, "Co-lab") | **Members in a group** | **Share / hold.** Bring a portrait into a shared space; "invite others to hold the field." Secondary — not where creation lives. |

Plus a **cross-cutting gift/invite layer** (magic-links + consent gate) that turns a
self-portrait into an invitation — and lands the recipient in **their own Lab**, never
captured. (*A portrait may be given; a relationship must be chosen.*)

**Headline:** **Lab = make your own. Studio = make for clients. Colab + gift-layer = share & invite.**

## Why Lab is the member home (not Studio)

`/astrology` ("The Blueprint") already has exactly the front half of the flow: a
`BirthChartCalculator` (date / time / place input), the computed chart, elemental
balance, the house wheel. The Soul Portrait is the *next layer* on that same chart —
so a member who's already looking at their Blueprint taps **"Create your Soul
Portrait"** and the literary reading grows out of the chart they're standing in.
Putting member self-creation in Studio would be a category error (Studio is the
practitioner's operating room).

## The member self-creation flow (the core UX)

1. **Entry** — in the Blueprint/Lab, a quiet card: *"Create your Soul Portrait."* (Pure
   invitation, not a nag — Attention Doctrine.)
2. **Birth data** — reuse `BirthChartCalculator` (date · exact time · place). One care
   carried from this session: **timezone is load-bearing and must be verified**, not
   guessed from longitude (the Heather 1963→1969 / CDT lesson). The step names it.
3. **Confirm the chart** — *"Here's your chart — does this look right?"* Show the
   computed chart (the Blueprint already renders it) with the rising sign and a
   plain-language summary, and let them confirm or correct (especially time/tz). This
   is the **two-key / authoritative-source checkpoint** before any prose is written.
4. **Generate** — *"Reading your chart…"* The generator (Claude + the encoded standards
   + the chart signatures) drafts the literary portrait.
5. **Read — and the reception moment (the most important interaction in the whole
   flow).** The portrait renders through the existing renderer, but it must **not**
   open with *"Your portrait is ready."* MAIA invites instead, and the **order is
   deliberate**: first *"What in this portrait wants to stay with you?"* — then *"Is
   there anything that doesn't feel like you?"* The first **gathers what has living
   energy**; the second **protects sovereignty.** Asking what wants to *live* before
   what is *wrong* changes the whole emotional posture — and note it asks what wants to
   stay, not *"is this true?"*: it moves from **editorial** (validate the claim) to
   **generative** (what do you want to keep?), which is the deeper handoff of
   authorship. *Your experience matters more than any interpretation.* This single
   moment teaches the whole relationship: the portrait is an **invitation, not an
   answer.** Three things are load-bearing here:
   - It is the **hinge** where the stable Portrait becomes a Living Field: the
     member's response — what lands, what surprises, what doesn't fit — is **the first
     thing they author.** The relationship begins with *their* words, not the system's
     capture (*a portrait may be given; a relationship must be chosen*).
   - "Doesn't resonate yet" is **received, never defended.** If a chapter doesn't land,
     the system honors that as sovereign and records it as theirs; it never re-argues
     the chart ("but your Mercury…"). This is the authorship guard, as UX.
   - Light editorial refinement is allowed; it's theirs.
6. **Keep · Gift · Invite** —
   - **Keep** — private by default (unlisted, noindex), it's theirs.
   - **Gift** — make a portrait *for someone else* → enters the consent gate (below).
   - **Invite** — send someone a link to make *their own* in their Lab (magic-link).

## The consent & sovereignty architecture (the constitutional layer)

This is where the session's whole discipline lands — the feature ships *with* its
restraints, not after them:

- **Self-portrait:** low-stakes — own data, own portrait. Default private.
- **Creating *for* others (Path B — the real frontier):** needing their birth data is a
  *partial* consent signal, not the whole. A portrait of another person routes through
  an explicit **reception/consent gate**, and a **minor** gets the strictest posture
  (Mentor OFF, memory OFF, noindex, unlisted) — exactly as the hand-built minor
  portraits already do.
- **Two-key release:** nothing auto-sends. The maker approves; for a portrait *of*
  another adult, the recipient ideally receives-and-consents before it's "theirs."
- **Gift ≠ funnel:** the portrait is complete in itself; going deeper into MAIA is the
  recipient's free choice, surfaced softly, never a capture mechanism.
- **Chart is a gift, not an assessment instrument:** framed as self-understanding,
  never evaluation of a person (the line from the hiring-resonance discussion).
- **Provenance on every generated portrait** (`PORTRAIT_PROVENANCE.md` convention):
  source, **tz verified**, chart/portrait version — so data errors don't propagate.
- **Power/Restraint check:** the capability (infer/generate a portrait) ships with the
  restraints that return authorship (private-by-default, editable, the go-deeper-is-
  yours door). It deepens self-recognition rather than displaying system cleverness.

## The Soul Portrait is the doorway, not the endpoint

The portrait is not the destination — it is the **first living artifact in a person's
field**, and the **narrative doorway** into everything else. Someone with no interest
in aspects or developmental models can begin with a beautifully written portrait, and
from there discover the Blueprint beneath it and the Living Field beside it. Less a
feature than the **opening movement** of the MAIA experience. The progression it opens:

`Blueprint → Soul Portrait → Member Response → Living Conversation → Practices → Reflections → Life Episodes → Field`

**Ownership changes at each step, and that is the whole point.** Blueprint is
*discovered*; the Portrait is *given*; the **Member Response is *authored*** — and
everything after is *co-created.* So **the first genuinely owned artifact in the system
is not the portrait — it is the member's response to it.** Concrete design implication:
the response is a **first-class artifact** (the seed of the field, stored as theirs),
**never "feedback on the portrait."** The portrait is the gift; their response is the
first thing that is *theirs.*

As a pillar of the Blueprint/Lab: `Natal Chart · Soul Portrait · Elemental Orientation ·
Journey Timeline · Living Field · Conversations with MAIA`.

### The Portrait vs. the Living Field — the integrity-giving distinction

Two different *kinds* of artifact; conflating them damages both. This is the
**representation / relationship boundary** (the three-layer architecture) applied here:

| | The Portrait | The Living Field |
|---|---|---|
| Kind | a crafted **representation** | an ongoing **relationship** |
| Stability | **stable** — revised only on birth-data change or deliberate regeneration; doesn't morph weekly | **evolving** — through conversation, practice, journals, transits, the member's reflection |
| Governance | provenance + versioning + two-key release | consent + memory gates + Sanctuary; member-authored |
| Given or chosen | **given** (a gift) | **chosen** (the relationship the person elects) |

Keeping them separate gives each its integrity: the portrait stays a finished,
trustworthy gift; the field stays a living, consented, member-authored thing. The
**reception moment** (step 5) is the seam between them.

### The Living Field is a garden, not an archive

It should *not* be modeled as memory — an ever-growing archive of everything. It is a
**garden**: things are planted, some take root, some wither, some are pruned, some
return each spring. That reframe carries real architectural weight: **forgetting is not
failure, silence is not a gap, dormancy is not absence** — they are healthy properties
of a living system. An archive that never forgets is a panopticon; a garden that forgets
protects sovereignty.

And a garden has a **gardener**: the member. They author not only what *enters* the
field but what *stays*, what is *pruned*, and what is *allowed to wither* — so a
stewardship can be **released by completion**, not only lost by neglect. The system's
job is to **tend the conditions**, never to **accumulate** (the §1.4 *tend-don't-produce*
guard, applied to the field's lifecycle). This is a truer model than "perfect recall"
of the accompaniment the work is reaching for.

So the precise name is not *"a garden"* but a **cultivated place of authorship** — the
garden is the metaphor; **authorship is the constitutional purpose.** A gardener does
not make plants grow; she creates the conditions under which growth becomes possible.
That is MAIA's role exactly: cultivate the conditions in which transformation becomes
more likely, and leave ownership with the member. The metaphor names the *feel*;
authorship names the *function* — metaphor after the mechanism, never before it.

### Earn-before-name: a doorway today, a direction beyond

The honest line, because this is exactly the territory the project guards against
inflating: of that progression, **only the front is live or near** — Blueprint
(exists), Soul Portrait (generator = Slice 2), Conversations (exist). **Reflections →
Practices → Life Events → Living Field are the held/frozen layers** (episodic + field
memory, under freeze per the Anchor; Cat 1–5, not Cat 6). So the doorway is real and
buildable now — but it must **open onto what is actually live**, with the rest shown as
honest direction it points toward, **never rendered as if present.** The Living Field
earns its pillar by being built, not by being named.

## What it builds on (little is new infrastructure)

- **Birth-data input + chart:** `BirthChartCalculator` + `/astrology` (exists).
- **Rendering:** `/soul-portrait/[slug]` renderer + the `LiterarySoulPortrait` schema
  (exists; "ready to become generator-driven without touching this route").
- **Practitioner drafting:** the `AskMaia` propose→approve component + `surface:
  'soul-portrait'` profile (pattern exists).
- **Invite/gift:** `/api/members/magic-link` + a new `gift:soul-portrait` purpose code.
- **New:** the generator pipeline (Slice 2), the consent/Path-B gate, the member
  "Create your Soul Portrait" entry, and the gift/invite UI.

## Sequenced build

1. **Slice 2 — generator** (chart signatures → Claude + standards → `LiterarySoulPortrait`).
2. **Member self-flow in Lab** (entry → birth data → confirm → generate → read → keep).
3. **Gift/Invite + consent gate** (Path B; magic-link `gift:soul-portrait`).
4. **Studio practitioner module** (for-clients, via Ask-MAIA).
5. **Colab share/hold** (secondary).
