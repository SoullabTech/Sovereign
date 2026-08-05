# Nomenclature and World Alignment Principle
## (Experiential Sovereignty)

> **STATUS: DRAFT — CANDIDATE CANON. Not ratified.** Founder-proposed 2026-08-05. Ratification is a
> governed act; this document does not carry canon authority until Kelly rules it in. Until then it
> may inform design conversation but may not be cited as a gate.
>
> **Founder review 2026-08-05 (same day): classified "high-value candidate canon"** — valuable
> not because it tells the system what to build, but because it prevents the system from building
> the wrong thing. Still unratified; one scope question added below before ratification.
>
> **What the principle structurally prevents (founder close, 2026-08-05) — three drifts:**
> 1. **Platform drift** — internal architecture dictating the user's experience.
> 2. **Product drift** — a beautiful prototype quietly becoming an authorized build.
> 3. **Domain drift** — one practitioner's worldview becoming the platform's worldview.
>
> Governing design questions per environment: Author Studio — *does this help the person remain
> in relationship with the emerging work?* · Now What? — *does this help the member remain the
> author of their own development?*

---

## The principle

**The system must enter the client's world before asking the client to enter the system.**

Every implementation must align its language, metaphors, interaction patterns, and visible
structures with the lived world of the practitioner, organization, or community it serves.

The platform provides the underlying capabilities.
The client provides the meaning system.

## Constitutional rule

**The platform architecture is universal. The experience vocabulary is contextual.**

A capability may be shared across domains, but it must be expressed through the nomenclature,
expectations, and worldview of the environment in which it is deployed. The system must not impose
its internal architecture onto the user's world.

## Relationship to existing canon (this principle generalizes, it does not invent)

This principle unifies three already-ratified fragments:

1. **Invariant 14 — cultural sovereignty** (`MAIA_SOVEREIGNTY_INVARIANTS.md`): never assume
   "self," "growth," "healing," "family," "spirit" mean the same everywhere; preserve the member's
   language.
2. **CF-D5b — vocabulary resolves at READ time** (Client Field ruling, 2026-08-03): a lens may
   never become the owner's name for the experience. The field is never the practitioner's.
3. **The Member's World is Primary** (standing constitutional feedback): speak from the member's
   world, not the platform's.

What is new here: elevation from member-level language preservation to **world-level surface
ontology** — each deployment context (executive coaching, therapy, spiritual direction, authorship)
gets its own vocabulary over one shared architecture.

## Translation requirement

Before building any client-facing experience, identify:

1. **The client's world** — who they serve, what transformation they create, what language they
   naturally use, what concepts carry meaning and trust.
2. **The client's nomenclature** — what they call their process, progress, reflection, growth,
   practice, relationship, outcomes.
3. **The client's boundaries** — what would feel authentic vs. imported; which concepts belong to
   their work vs. the platform.

## Examples (read-time mappings, not schema forks)

| Platform capability   | Executive coaching    | Therapy              | Spiritual direction     | Author                     |
| --------------------- | --------------------- | -------------------- | ----------------------- | -------------------------- |
| Reflection space      | Leadership reflection | Processing space     | Contemplative practice  | Writing room               |
| Saved insight         | Leadership takeaway   | Integration note     | Discernment             | Passage                    |
| Relationship context  | Coaching relationship | Therapeutic alliance | Spiritual accompaniment | Reader/mentor relationship |
| Development over time | Leadership growth     | Treatment journey    | Spiritual formation     | Creative evolution         |

The capability is shared. The meaning is not.

## Structural riders (added at drafting — close two gaps in the original proposal)

### Rider 1 — Surface ontology is a rendering layer, never a storage layer

Per CF-D5b, vocabulary resolves at **read time**. World-specific nomenclature lives in the
translation/rendering layer only. The stored object keeps one canonical platform name; no
per-world schema forks, no per-world data models. This is what keeps the "deep common
architecture" real rather than aspirational: the moment a world's vocabulary is written into
storage, the architecture has forked and the member's data is captive to one world's ontology.

### Rider 2 — Precedence when worlds collide

Most surfaces serve **two worlds at once**: the practitioner's world and the member's own. The
draft treats "the client's world" as singular; it is not. Precedence order:

1. **The member's own words** — what they actually called it (highest authority; already ruled:
   member language is preserved verbatim, a lens never becomes the owner's name).
2. **The world vocabulary** of the deployment context (e.g., Larry's leadership language) — for
   structure, navigation, and practitioner-facing surfaces.
3. **Platform vocabulary** — internal only; appears on no client-facing surface.

A practitioner's nomenclature may frame the room; it may not rename what the member said inside it.

> Founder review 2026-08-05: this sentence is the one to **protect verbatim** if the principle
> becomes canon.

### Rider 3 — Nomenclature alignment is not capability claiming

Adopting a world's vocabulary can silently manufacture an outward claim. "Treatment journey" and
"therapeutic alliance" are clinical terms; rendering them implies clinical capability and invokes
`MARKETING_CLAIM_DISCIPLINE.md` (Live/Designed/Vision, Failure Test) and the standing rule that
MAIA never recommends treatments. World-aligned language must pass claim discipline in that
world's register — the more regulated the world, the stricter the vocabulary review.

## Anti-pattern

The platform must not say *"Here is our framework. Learn our language."* when entering another
person's practice. That reverses the relationship. The platform is the instrument. The client's
world is the source of meaning.

## Design tests

1. **The recognition test (practitioner):** *Would this person recognize their own work here?*
   If no — the build may be technically functional but it is experientially incorrect.
2. **The member-language test:** *Would the member still find their own words, unrenamed?*
   If a world's vocabulary has overwritten what the member said, Rider 2 is violated.
3. **The fork test (architecture):** *Could a second world be added by changing only the
   rendering layer?* If adding a world requires schema or service changes, Rider 1 is violated.

## Gate declaration (founder-supplied 2026-08-05 — per the four-question doctrine, f9a7326f1)

This principle is a **gate, not a philosophy**. Its declaration:

- **Transition permitted:** a capability may move from *platform primitive* → *client-facing
  experience*.
- **Evidence required:** demonstration that intended users recognize the experience as belonging
  to their practice, organization, or domain.
- **Evidence producer:** the actual practitioners, clients, authors, leaders, or members using
  the experience — never the build team.
- **Failure condition:** users can operate the system but describe it as foreign, confusing,
  imposed, or belonging to another domain.

A build with no possible negative result from this test is not gated — it is ritual.

## Three-label operating model (founder-adopted 2026-08-05)

Every future initiative carries exactly one label:

1. **Constitutional** — cannot violate: member authority, MAIA boundaries, IP sovereignty, data
   ownership.
2. **Experimental** — may be explored: Canvas, UI metaphors, interaction patterns, new workflows.
3. **Productized** — accepted only through declared evidence: live client experience, supported
   capability, official architecture.

⛔ **The dangerous state**: experimental work silently becoming productized because someone liked
the prototype. Promotion from Experimental → Productized always passes a declared gate.

The CEO-language rendering of Now What? is not a replacement for the deeper design language — it
is the client-world translation layer. *Deep architecture may be universal. Surface meaning must
belong to the world being served.*

## Environment typology (founder-supplied 2026-08-05, later same day — the deeper UX rule)

The Now What? vision-reference disposition and the Author Studio image exploration are not
contradictory — they are two cases of this same principle: **the surface must belong to the
world being served.** The distinction that resolves them:

### Creation environments — the person is *making something*

The question the surface answers: **"What is becoming?"**

Examples: Author Studio · Scholar Studio · Teacher Studio · practitioner knowledge creation.
**Primary artifact: the work being created.** The interface may legitimately surface drafts,
manuscripts, fragments, passages, editions, sources, ideas, compositions — the studio's richness
IS the unfolding artifact's presence.

**The danger: turning authorship into optimization** — progress, productivity, writing scores,
completion dashboards. The author must remain in relationship with the emerging work.

### Relationship environments — the person is *living through an ongoing relationship*

The question the surface answers: **"What is continuing?"**

Examples: Now What? · coaching · therapy · spiritual direction.
**Primary artifact: continuity of the relationship and the person's own meaning-making.**
The interface surfaces what the person chose to carry forward, what they want to explore, what
they want their practitioner to know. ⛔ Not scores, progress, stages, recommendations.
The register: **journal · hearth · bridge — never a cockpit.**

**The danger: turning a human relationship into a system** — AI coaching, automated
recommendations, prescribed growth paths, performance tracking. The member must remain the
author of their own development.

The same anti-pattern reads differently per type: an Author Studio may have "Your Manuscripts";
it should not have "Your Progress." A relationship environment may have "what you are carrying";
it should not have a dashboard. Neither becomes a SaaS feature inventory — the entry question is
never *"how many features can this person access?"* but *"does this person immediately feel
their work (or their relationship) has a home here?"*

## Artifact classification: Vision Reference vs Build Specification (founder-adopted 2026-08-05)

The missing governance category the disposition demonstrated:

- **Vision Reference** answers *"what future experience are we aiming toward?"* — kept as
  experience language, mined for borrowable heuristics, never implemented as drawn.
- **Build Specification** answers *"what are we authorized to implement now?"* — carries build
  authority under its gates.

⛔ **Confusing the two is where drift happens.** A mockup is never discarded for crossing ruled
lines — it is *classified*. (First instance:
`docs/design/now-what/NOW_WHAT_VISION_REFERENCE_DISPOSITION_2026-08-05.md`.)

## Borrowable heuristic vs imported worldview (AIN-wide, not Now What?-specific)

The recurring product mistake this category prevents: *seeing a beautiful interface and
importing the worldview behind it.* A useful pattern can always be separated:

| Borrow | Do not import |
| --- | --- |
| calm visual language | dashboard mentality |
| orientation | measurement |
| recognition | algorithmic interpretation |
| progressive disclosure | feature accumulation |
| personal continuity | behavioral tracking |

## The next UX method: Experience Inquiry, not screen design

The next design input for any environment is empirical, not generative — never *"what features
should this page have?"* The inquiry has four parts:

1. **Arrival inquiry** — what does the person need to immediately understand? What reduces
   uncertainty? What creates trust?
2. **Continuity inquiry** — what should still feel alive after the session ends? What does the
   person naturally want to return to?
3. **Ownership inquiry** — what belongs to the member? To the coach? To the platform?
4. **Absence inquiry** — what should intentionally *not* appear? **This question is often where
   the soul of the product is protected.**

First applications:

- **Now What?**: what does Larry understand this room is for in the first 10 seconds?
- **Author Studio**: what does a writer understand this studio is for in the first 10 seconds?

Those answers determine the architecture. The shared AIN principle underneath:
**the platform provides the continuity layer; the human world provides the meaning layer.**

## What ratification must still decide

- Whether this enters canon as a standalone principle or as an amendment extending Invariant 14.
- Whether the precedence order in Rider 2 is ruled as stated.
- Whether existing surfaces (Author Studio, Now What?, practitioner tools) are grandfathered or
  audited against the three design tests.
- **World-formation boundary (founder-flagged 2026-08-05, review pass): who determines when a
  "world" is sufficiently distinct to deserve its own vocabulary layer?** Edge cases named:
  executive coaching vs leadership development · spiritual direction vs contemplative practice ·
  Teacher Studio vs Author Studio · **two coaches with different methods**. The principle is
  right; the boundary conditions for *creating new worlds* are undefined. Without a gate here,
  vocabulary layers could proliferate per-practitioner (each rendering layer is cheap by Rider 1,
  so the pressure will be real). Needs an evidence-bearing criterion, not a taste call —
  candidate shape: a world exists when its *members* (not its practitioner) demonstrably don't
  recognize themselves in the nearest existing vocabulary (same evidence-producer rule as the
  gate declaration above).
- Whether the environment typology (creation ⊥ relationship), the Vision Reference ⊥ Build
  Specification classification, and the four-part Experience Inquiry ratify with the principle
  as one package or separately.
