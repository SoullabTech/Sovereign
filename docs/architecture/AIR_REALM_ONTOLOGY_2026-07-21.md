# Air Realm Development — Ontology and Boundary Clarification (Prompt 2) — 2026-07-21

**Status**: Design only. Authorizes nothing. Prompt 2 of the Air Realm Development sequence
(`docs/plans/AIR_REALM_DEVELOPMENT_PROMPT_SEQUENCE_2026-07-21.md`), executed after Kelly's approval
of Prompt 1 with a six-item ontology agenda. Grounded in the two discovery documents
(`AIR_REALM_DISCOVERY_2026-07-21.md`, `AIR_REALM_CAPABILITY_DISCOVERY_2026-07-21.md`).

Everything here is proposed for Kelly's ratification, not declared. Where a ruling is required, the
document says so and recommends one.

> **RULED — Kelly, 2026-07-21: APPROVED, with one explicit deferral: collective adoption ontology
> remains open.** Rulings issued:
> **R1** Understanding ladder RATIFIED; companion sentence added: *"Shared reality cannot be
> imposed, only participated in."*
> **R2** Communication = movement across the ladder; many conflicts are **rung-confusions**
> (solving a meaning problem with information; a shared-meaning problem with assertion;
> coordinating without understanding) — "may become one of the core teachings of Air."
> **R3** Adoption = canonical Air act. Personal: Offer→Keep→Adopt. Collective: Dialogue→Holding→
> Adoption→Decision. Elevated sentence: *"Adoption is the act by which meaning becomes
> consequential."*
> **R4** Decision RATIFIED as an Air object ("adopted shared meaning oriented toward action");
> Decisions ledger recognized as possibly the first true collective Air primitive.
> **R5** Held vs Adopted must remain distinct FOREVER (may become constitutional). Held = meaning
> under active consideration; Adopted = meaning that crossed a legitimate threshold.
> **R6** Dissent is first-class; *"Consensus is not required for shared meaning"* preserved; a
> truthful map of disagreement is a successful collective outcome ("we understand where we
> differ" is itself collective intelligence).
> **R7** Dual-use risk ELEVATED TO GOVERNING INVARIANT (candidate wording: *"Communication
> development must preferentially increase truth, relationship, agency, and shared understanding
> rather than merely influence effectiveness"* / *"Increased communicative power without increased
> relational responsibility constitutes Air distortion"*). Prompt 3 inherits directly.
> **Deferral** Group keep gesture NOT settled: personal adoption canonical; collective adoption
> provisional; **Prompt 9 excludes** collective keep, collective meaning adoption, and council
> intelligence — research territory until evidence exists.
> **Layers** Personal→Relational→Collective→Cultural provisionally ratified; **Prompts 3–4 scope =
> Personal + Relational only**; Collective mostly conceptual; Cultural horizon language.
> **Added ontology sentence**: *"Air Realm Development cultivates the capacities through which
> people understand, articulate, coordinate, and steward shared realities."*

---

## Part I — The ladder: what is understanding? (agenda 5)

The capability depends on distinguishing five things that ordinary language collapses.

*(Register note, added 2026-07-21 after the distance review: the definitions below are candidate
interpretation offered for ratification — not established fact about how humans work. Where the
prose sounds declarative, read it as proposal; the record should not speak with more certainty
than the inquiry. Kelly's R1 ratified the ladder itself; the surrounding explanatory prose
remains interpretive scaffolding.)*

**Information** — difference that can be transmitted without the receiver changing it. A schedule, a
fact, a diagnosis. Transmission is sufficient. Machines do this well; it is the only rung that
"sending" fully accomplishes.

**Understanding** — information integrated into a person's existing world such that they can act on
it, anticipate with it, and restate it in their own words. Understanding cannot be transmitted —
only *occasioned*. It requires the receiver's own structure — which may be why explanation so
often fails: it delivers information and assumes the rest.

**Meaning** — understanding connected to what matters. "I understand what you said" becomes "I know
what this means *for me* / *for us*." Meaning is value-laden placement in a life. It cannot be
assigned from outside — which is why MAIA's meaning-companion-never-authority doctrine
(`THE_CLEARING.md`, `PATTERN_PRIMITIVE.md`) is already the correct constitutional stance for this rung.

**Shared meaning** — two or more people each holding a meaning *and holding that the others hold it*.
Not identical meanings: sufficient overlap, plus mutual awareness of where the overlap ends. Shared
meaning is built, tested, and repaired — never merely announced. This is the rung where dialogue,
disagreement, and repair live.

**Shared reality** — shared meaning made durable enough to structure action without renegotiation:
covenants, charters, cultures, institutions, a team's "how we do things." Shared reality is what a
group can treat as given. It is also where Air shadow concentrates (Part V): a shared reality that
can no longer be revised has become possession.

**What, then, is communication?** Not one of Kelly's four candidates but the practice that moves
things *up this ladder*: transmission (information), occasioning (understanding), meaning-making
(meaning), building/testing/repair (shared meaning), stewardship (shared reality). Each candidate
definition names one rung's mode. A communication capability that only serves the bottom rung is a
messaging tool; one that serves all five is Air Realm Development.

**Development claim**: what develops in a person is the capacity to *notice which rung a moment is
on* and act accordingly — to stop explaining when the problem is meaning, to stop asserting when the
problem is shared meaning, to repair before coordinating. This is the teachable core.

## Part II — Air semantic reconciliation (agenda 1)

Three meanings currently coexist in the codebase; one ruling is proposed:

**Proposed canonical meaning**: *Air is the elemental capacity by which meaning becomes shared
reality* (Kelly's sentence, Part VIII). The ladder in Part I is Air's territory: understanding,
naming, perspective, communication, coordination.

- `lib/maia/spiralogicReference.ts` ("perspective/mind") — **compatible, kept**: perspective/mind is
  Personal Air (the first layer), a correct shorthand at the individual rung. No code change needed
  now; the canon gloss should eventually read "perspective, mind, communication" when next touched
  for other reasons.
- `lib/voice/conductor.ts` cues (clarity/reframe/articulate/discern) — **compatible, unchanged**.
- Onboarding `ElementalOrientation` (air = "WHAT / The Experience") — **genuine misuse**. The
  component borrows element *ids* as slot names for a HOW/WHY/WHO/WHAT/SOUL frame; the air slot's
  copy ("listens deeply, asks good questions") is accidentally Air-flavored but the mapping is not
  elemental. Recommendation: rule the canonical meaning now; file the onboarding fix as a small
  independent item for after S5 (it is a copy/structure fix, not an Air Realm build). Do not let the
  new capability inherit this vocabulary.

**Ruling requested from Kelly**: adopt the canonical meaning; conductor and spiralogicReference
stand; onboarding flagged for later repair.

## Part III — Agreement, alignment, resonance, adoption, consensus, coordination (agenda 6)

Six different Air phenomena, currently undifferentiated in most software and most conversations:

| Phenomenon | What it is | Rung | Commitment created |
|---|---|---|---|
| **Resonance** | Felt recognition — "something in me answers this." Pre-verbal, pre-commitment | Meaning (edge of) | None |
| **Agreement** | The same proposition affirmed by multiple people | Understanding→Shared meaning | Thin — can be verbal only |
| **Alignment** | Compatible directions — able to act together without identical beliefs | Shared meaning | Directional, revisable |
| **Adoption** | An authorship act: taking a meaning as one's own (or a group taking one as its own) | Meaning / Shared meaning | Full — the meaning now belongs to the adopter |
| **Consensus** | The outcome of a group decision *procedure* — all can live with it | Shared meaning (procedural) | Procedural — binds via the procedure, not the heart |
| **Coordination** | Successful joint action | Shared reality (thin or thick) | Behavioral — can exist with almost no shared meaning |

Three consequences:

1. **Adoption is the load-bearing phenomenon for MAIA**, because it is the consent-grammar act. The
   personal keep gesture already implements personal adoption. Everything in the platform's existing
   consent architecture generalizes from adoption, not from agreement or consensus.
2. **Consensus is not required for shared meaning** — a council can hold a meaning it has not
   consensually adopted (Part IV). Conflating the two forces false unanimity, which is itself a
   shadow (false certainty at group scale).
3. **Coordination without understanding is achievable — and is the manipulation shadow.** People can
   be coordinated by pressure, framing, or charisma while sharing nothing. A capability that
   optimizes coordination directly, skipping the ladder, becomes a persuasion engine. This is the
   structural reason the ethical center ("communication that increases truth, relationship, agency,
   and shared understanding") is not decoration: it forbids shortcutting the ladder.

## Part IV — Collective authorship and the group keep gesture (agenda 3)

**Is a Decision fundamentally an Air object?** Yes. A decision is adopted shared meaning oriented
toward action — it lives exactly at the Shared Meaning → Shared Reality transition. The existing
Decisions ledger (team lens + Council lens over `studio_decisions`) is therefore not adjacent to
this capability; it is the platform's first *collective adoption record*. Its current form is a
witnessing object (a ledger of what was decided); the Air capability would be what develops the
*quality* of what enters it. Implications reach governance, councils, and AIN — a council is, in
this ontology, a body that stewards shared meanings, only some of which are consensually adopted.

**The two grammars** (Kelly's framing):

```text
Personal:    Member → Offer → Keep
Collective:  Members → Dialogue → Shared Meaning → Collective Adoption
```

**Provisional answers to the five questions** (each requires eventual ratification; together they
define what a legitimate act of collective authorship is):

1. **Must every member explicitly adopt?** No — but every member's *disposition must be recorded*.
   Proposed grammar: collective adoption is a recorded act performed under the group's own declared
   adoption procedure (itself ratified by the membership); absent a declared procedure, the default
   is unanimity-of-explicit-adopters with named non-adopters. What is forbidden is silent inclusion:
   no member may be counted as adopting by absence of objection.
2. **Can groups keep partially?** Yes, on two axes: partial *scope* (adopt these clauses, not those)
   and partial *membership* (adopted by seven of nine, held open by two). Both must be visible on
   the artifact, not flattened into a false whole.
3. **Can shared meaning remain provisional?** Yes — and this state needs first-class standing:
   **held** (before the group) vs **adopted** (by the group), mirroring the personal
   kept/revised/rejected/open dispositions. Most council work is holding, not adopting. A capability
   that only models adoption will manufacture premature consensus.
4. **Can councils hold meanings without consensus?** Yes — "held by the council" is a real state
   that must never be displayed as "adopted by the members." The label carries the authority
   boundary (Inv 16: authority moves upward through authored experience; a council cannot
   manufacture member-level adoption from above).
5. **How are dissent and minority reports preserved?** As first-class Air artifacts with the same
   provenance dignity as the adopted meaning, permanently attached to it. Adoption never deletes
   dissent; a shared reality that erases its minority reports is on the path to ideological capture
   (Part V). A dissent is not a failure of the process — it is part of the group's actual meaning.

**Constraint inheritance (non-negotiable):** the AIN collective-intelligence boundary
(canon-candidate) holds — collective eligibility defaults to *no* and is minted per-item by a
member's own offering act. A group act cannot launder individual material: each member contribution
inside a shared meaning still requires that member's offering. The Circles-pulse suspension (themes
entering by inference rather than offering) is the standing precedent, not an obstacle.

**Scope consequence** (reaffirmed): collective Air remains out of build scope (Prompt 9) until Kelly
ratifies this grammar. The ontology above is sufficient to *design against* (Prompts 3–7 may
reference it); it is not sufficient to build on.

## Part V — Shadow ontology (agenda 2)

Air's shadow is not bad communication; it is **the ladder inverted** — force applied downward:
meaning imposed rather than made, shared reality enforced rather than built, revision foreclosed.
Nineteen named shadows, organized by mechanism:

**Shadows of excess (too much Air, unmoored):** over-intellectualization · endless analysis ·
story divorced from reality · narrative possession (the story runs the person) · ideological
rigidity · ideological capture (the frame consumes the perceiver) · false certainty.

**Shadows of deficit (Air failing):** confusion · miscommunication · translation failure · meaning
collapse · loss of meaning · inability to revise.

**Shadows of weaponization (Air against others):** persuasion/manipulation (coordination without
understanding — Part III) · projection · polarization · story becoming more important than reality
at group scale · collective fragmentation.

**Classification against existing structure:**

- **Already structurally refused** (existing guardrails): synthesis/false-certainty *about members*
  (anti-synthesis CHECK constraints, proposes-never-keeps, witness-before-interpret) · narrative
  possession *by the system* (`RIGHT_TO_REMAIN_UNPOSSESSED.md` — the shadow already has canon) ·
  engagement manipulation (keep-offer decline-streak governor) · collective laundering (offering-act
  default-no; `integration_passes` no-readers test) · story-vs-reality *in outward claims*
  (`MARKETING_CLAIM_DISCIPLINE.md` — "we do not tell tomorrow's story as if it were today's" is
  Air-shadow discipline already ratified for one domain).
- **Needs design** (nothing currently addresses): the member *becoming more manipulative through
  practice* (the articulation ladder and rehearsal are dual-use — the evidence model in Prompt 3
  must include this) · polarization and false certainty *in the member's own communication* ·
  inability to revise (requires revision-first UX: every adopted articulation stays revisable —
  already the disposition doctrine, must extend to artifacts) · translation failure (the
  audience-translation white space) · meaning collapse (MAIA's own failure mode of explaining
  experience away — voice rules in Prompt 5 must forbid it).
- **The repair curriculum**: the four member-facing supports Kelly named — communication repair,
  perspective expansion, meaning reconstruction, navigating disagreement — are precisely the
  antidotes to the deficit and weaponization groups. Shadow ontology is not a warning label; it
  *is* the syllabus of relational Air.

## Part VI — Voice, Work & World as pathway (agenda 4)

Confirmed placement; the pathway's terms, defined against the ladder:

- **Voice** — layered capacity for one's meaning to be recognizable as one's own: *inner* voice
  (what I actually think — hearing myself), *relational* voice (what I can say to you such that
  contact occurs), *public* voice (what I can say to many without losing myself). Voice is not
  style; style is a residue of voice. Development = the three layers converging without collapsing
  into each other.
- **Work** — the body of contribution through which one's meaning serves others: vocation, practice,
  method, teaching, creative corpus. Not employment, not monetization. Work is meaning made
  serviceable.
- **World** — the shared reality one's work invites others into: its language, values, practices,
  the future it treats as possible. Not brand (an impression managed), not audience (a quantity
  addressed), not market (a demand served). A world is *entered*, not consumed.
- **Stewardship** — responsibility for a shared reality over time: keeping it revisable, keeping its
  boundaries honest, preparing its transmission. Includes succession and legacy; excludes ownership
  of other people's meaning.
- **Development** — what can legitimately grow and be observed growing: the *capacities* (Part I's
  noticing; the seven Air capacities), evidenced in practice artifacts over time. Identity claims
  ("you are now a teacher") are not development observations; they are exactly what MAIA must not
  manufacture.

The pathway's occupational surfaces (Book Studio, founder tools, practitioner program) become
expressions of these capacities, not competitors to the capability.

## Part VII — Boundary tests

Format per case: **may** / **must not** / evidence / consent / authorship.

1. **Healer discovering language for a practice** — may: reflect her recurring language, offer
   naming candidates in her vocabulary. must not: hand her a positioning statement or archetype.
   Evidence: multiple consented encounters. Consent: pathway entered explicitly. Authorship: she
   adopts or the words stay drafts.
2. **Therapist becoming a teacher** — may: name the *observed shift in her language* ("you have been
   describing groups, not clients") with provenance. must not: declare the identity transition or
   push toward it. Evidence: repeated, time-spanned, contradiction-checked. Authorship: the naming
   of the transition is hers to accept, defer, or refuse.
3. **Author finding the book beneath scattered writings** — may: surface recurring themes across her
   kept material; propose candidate through-lines as questions. must not: outline "her" book
   unprompted. Evidence: her own kept/offered writings only. Authorship: through-line adopted
   explicitly before anything builds on it.
4. **Founder articulating a new category** — may: practice the articulation ladder, test
   comprehension at each depth, hold versions over time. must not: optimize for persuasion
   detached from what is true (claim-discipline applies inward). Evidence: adopted articulations.
   Authorship: founder's language marked distinct from MAIA-shaped language.
5. **Artist resisting public identity** — may: serve inner and relational voice indefinitely.
   must not: treat publicness as the goal or nudge toward visibility. Consent: the public rung of
   the ladder simply never opens without her act. Authorship: refusal is a complete outcome.
6. **Elder gathering a lifetime of wisdom** — may: help order, name, and prepare transmission;
   hold legacy artifacts. must not: eulogize, finalize, or extract "lessons" she has not adopted.
   Evidence: her account, her selections. Authorship: the legacy is hers, including its gaps.
7. **Member with no commercial ambition** — may: full capability; Air development is not
   occupational. must not: import mission/work framing she hasn't brought. The Relationship and
   Meaning domains must stand alone without the Mission domain.
8. **Member who changes direction repeatedly** — may: hold each direction as real while it lives;
   reflect the *pattern of changing* only with strong evidence and as a question. must not: treat
   revision as failure or enforce consistency. The disposition grammar (kept/revised/rejected/open)
   is built for exactly this person.
9. **Stated identity conflicts with recurring evidence** — may: place both before her ("you describe
   yourself as X; your kept language keeps saying Y — does this feel true?"). must not: resolve the
   conflict for her, or keep raising it after she declines. Contradiction is data she owns, not an
   error MAIA corrects.
10. **Member who wants copywriting, not accompaniment** — may: serve the narrow request well at the
    articulation rung. must not: withhold help to force depth, or covertly run developmental
    observation she didn't enter. Asked-not-watched cuts both ways: no development without entry, no
    entry as a toll for service.
11. *(added — collective)* **Team wanting shared language for its work** — may: facilitate dialogue,
    hold candidate meanings as *held*, record adoption per the group's grammar with per-member
    dispositions and dissent preserved. must not: synthesize "the team's view" from individual
    material lacking offering acts; display held as adopted. Out of build scope until Part IV is
    ratified.
12. *(added — collective)* **Council in real disagreement** — may: keep the disagreement structured
    and visible; support perspective-taking between positions; preserve minority reports as
    first-class. must not: drive toward consensus, score positions, or let a majority's language
    absorb the minority's. Success is a *truthful* map of the disagreement, not its disappearance.

## Part VIII — Canonical definition, non-definition, object model

**Canonical definition (provisional, for ratification):**
*Air Realm Development concerns the human capacities by which meaning becomes shared reality. It
helps people and groups understand, articulate, coordinate, and steward shared realities through
communication, meaning-making, relationship, and vision — increasing truth, relationship, agency,
and shared understanding, never mere persuasion.*

**Non-definition** — Air Realm Development is **not**: branding or positioning · persuasion or
influence training · a content/copy generator · a personality or communication-style typology · a
messaging platform · a social network · a governance procedure (it informs governance; it does not
enact it) · therapy or conflict mediation (it develops capacity; it does not adjudicate) · a
curriculum with stages to pass.

**Object model recommendation**: **no new canonical objects at this stage.** Mapping for Prompt 6:
personal adoption → existing keep/atoms family (kept/revised/rejected/open dispositions already
correct) · articulation versions → candidate *extension* of atoms or threads (decide at Prompt 6,
not here) · collective adoption → Decisions ledger + the dormant Observation Layer 3 recognitions
(extend, never parallel) · dissent/minority report → decision-typed record attached to its adoption
· "development thread" (sequence vocabulary) → existing `member_field_note_threads` family. The one
genuinely missing object class is the **practice event** (a rehearsal/articulation attempt with
version lineage) — flagged for Prompt 6; not designed here.

---

## Rulings requested from Kelly

1. Canonical Air meaning (Part II) — adopt; onboarding repair filed separately post-S5.
2. The understanding ladder (Part I) as the capability's working spine.
3. The six-phenomena distinction (Part III), and adoption as the load-bearing consent act.
4. The collective authorship grammar (Part IV): recorded-procedure adoption, partial keeping,
   held-vs-adopted, no silent inclusion, dissent as first-class. (Ratification unblocks *design*
   reference only; build stays gated.)
5. Decision ratified as an Air object.
6. The shadow classification (Part V) — with the dual-use rehearsal risk explicitly accepted as a
   Prompt 3 evidence-model requirement.
7. The canonical definition and non-definition (Part VIII).

Next after review: **Prompt 3 — Evidence Model and Developmental Ethics**, which inherits from this
document: the ladder (what kind of claim each rung permits), the dual-use shadow constraint, and the
disposition grammar extended to articulation artifacts.
