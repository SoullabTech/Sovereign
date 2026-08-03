# Now What? — The Rooms in the House

**Date:** 2026-08-03 · **Status:** ⛔ **DESIGN EXPLORATION. No ruling. No build authority.**
**Scope: the delta only.** This is not a Client Home IA — one already exists (§0).

---

## 0. ⚠️ Near-collision — most of the requested deliverables already exist

A collision check before writing found two prior artifacts covering four of the seven requested
deliverables. **This would have been the third duplicate-referent collision in two days.**

| Requested | Already exists |
|---|---|
| Client Home information architecture | `docs/product/NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN_2026-08-02.md` — five bands (*What you are carrying · What you're working with · From Larry · Yours · Another way in*), surface definitions, five Home states, prohibitions |
| First screen concepts | same, §1 *"the first thirty seconds"* |
| Larry practitioner home | `docs/product/walks/NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01.md` — governing pattern *"same nouns, different behaviour"*, Larry's first 60 seconds, the client's first 60 seconds, prohibited affordances |
| Slice 0 spec | Experience Design §8, *"now fully specified"* |

**Those remain canonical. This document does not restate or replace them.** What is genuinely new in
the request is a different question:

> The existing design describes **one Home with bands.** The new question is **a house with rooms** —
> Calendar, Program, Sessions, Messages, Resources — and how a person moves between them.

That, plus group/cohort communication and the proposed simplicity principle, is all this document
covers.

## 1. Evidence from the live surface

`https://soullab.life/now-what/room` redirects unauthenticated visitors to the root door. I could not
see the room itself — it is gated, and entering credentials is out of bounds. What the door says is
visible and is itself evidence:

> **NOW WHAT?** · Welcome back. · *Sign in to continue. If someone invited you to a new field, open
> the link they sent — it carries what this door needs to set up a key.*
> *Your key is yours. Signing in is how the room knows whose field to hold.*

⚠️ **This is the exact problem, at the front door.** A client of Larry's arriving here meets *field*,
*key*, and *room* before meeting Larry. The copy is careful and honest — and it is written in AIN
vocabulary. Someone who has never heard of AIN OS cannot tell what a *field* is or why a *room* would
*hold* one.

**The first repair is a sentence, not an architecture:** the door should say who they are here to
work with. *"Sign in to continue your work with Larry."* Everything else can stay.

## 2. The false opposition — and the principle that dissolves it

The design conversation risked a false choice between *simple, familiar, practical* and *deep,
sovereign, relational*. That was never the choice. The constitution does not say **make the
interface mysterious so the philosophy survives.** It says **do not create false authority, false
meaning, or false visibility.**

A client should absolutely have calendar, appointments, program overview, stages, communication,
resources, session continuity, group spaces, and clear next actions. **None of those are violations.
They are the environment in which the relationship happens.**

### Proposed principle — Human simplicity is a constitutional requirement

> The system may carry complexity internally so that the human experience remains direct,
> understandable, and natural. **Governance complexity must never become user complexity.**

This closes an open item rather than opening one: *"complexity belongs underneath"* was dropped from
the principle list between drafts while continuing to operate in the prose, which was flagged twice
as the least governable form it could take. This is that principle, elevated and better argued —
**it is not a permission to hide things, it is an obligation to absorb them.**

⚠️ **Note the drift it corrects.** This is the third time the same correction has been needed —
*not anti-data*, *the boundary is not a gap*, and now *not anti-functionality*. **Sovereignty
language drifts toward austerity unless actively corrected.** Worth treating as a standing
failure mode of this design discipline, not three separate notes.

### The line, in examples

| ⛔ Do not show | Why | ✅ Do show | Why |
|---|---|---|---|
| *"MAIA detected a pattern of avoidance."* | assigns meaning | *"Your next conversation is August 14."* | practical fact |
| *"Development score: 72%"* | artificial judgment | *"Stage: Integration"* | shared program structure Larry authored |
| *"Larry has been waiting for you to complete this."* | pressure + surveillance | *"Larry shared a practice for this stage."* | an authored offering |

## 3. The rooms

Named for what a person does there, not for what the system stores.

| Room | What it is | Substrate | Buildable now? |
|---|---|---|---|
| **Home** | *your work with Larry* — the five bands already designed | relationship + program + stage + kept material | ✅ yes — this is Slice 0 territory |
| **Program** | the shared map: stages, what each stage is about | `coach_program_definitions`, `coach_program_stages`, `coach_program_enrollments` | ✅ yes |
| **Sessions** | continuity points, not an archive | `coach_sessions` | ◐ partly — the *record* exists; session content does not |
| **Calendar** | time connected to relationship | `coach_sessions` + `coach_important_dates` ⛔ | ◐ partly |
| **Messages** | practitioner ↔ client, and groups | `coach_note_publications` ⛔ · cohorts ✅ | ⛔ **no — see §4** |
| **Resources** | things Larry shared, connected to a stage | `coach_resource_recommendations` ⛔ | ⛔ **no — see §4** |
| **Reflect** | the person's own material, and MAIA as one door | member-owned primitives ✅ | ✅ yes |

### Stages — the shared map, not a measurement

```
✓ Orientation      ✓ Awareness      → Integration      ○ Action      ○ Embodiment
```

Admissible, with one wording constraint. The checkmark records **an authored act by Larry** — he
moved the stage; the client never moves their own. It must therefore read as *we have moved past
this together*, never *you completed this*. The moment a ✓ implies the person's achievement rather
than the program's position, it becomes the score the design refuses.

*"Current focus: building your next chapter"* is admissible **on the client's own Home** — it is
theirs. The same words on Larry's view are the boundary violation flagged earlier; the phrase is not
portable between the two surfaces.

### Calendar as continuity

```
August 14 · Coaching Conversation
Before:  What would you like to explore?
During:  Session notes
After:   What are you carrying forward?
```

Before/After are the client's own material and stay theirs unless shared. *During* is the room where
practitioner notes live — and practitioner session notes are PHI in plaintext today, which is a known
open security item, not a design question.

## 4. ⛔ The finding that governs the build order

**Messages and Resources cannot be built in a UI lane. Not for effort reasons — by construction.**

The eleven missing `coach_*` content tables are a **protected boundary, not a gap** (Q-C, resolved by
evidence). The boundary gate `verify-coach-field-boundaries.ts` check `1d` **asserts their absence**,
with the failure message *"these exist unencrypted."* They are destined for `lib/security/phiAccessors/*`.

> **Creating them in a UI lane fails the gate by construction.** A design that assumes Messages and
> Resources rooms is a design that assumes the encrypted lane has shipped.

This is the honest sequencing, and it is not a disappointment — it is the architecture working:

```
Rooms available now          Home · Program · Reflect · (Sessions, Calendar in part)
Rooms behind encrypted lane  Messages · Resources · practitioner notes · commitments
```

**Group/cohort spaces carry a further gate.** `coach_cohorts` and `coach_cohort_memberships` exist,
but a shared space introduces **third-party consent** — what one member says in a group is visible to
people who are not their practitioner. That is a new consent surface, not a new screen, and it is
unruled.

## 5. The six questions, answered

**1 · First 10 seconds for a client.** Who they work with, what they are working on, when they next
speak, and one obvious way in. No vocabulary they have not already met from Larry.

**2 · What Larry sees.** The relationship, the program and stage he placed, sessions, what he
offered and which of it was affirmed, and whatever the client elected to share.

**3 · What must never appear on Larry's view.** The client's private focus, their reflections, any
MAIA observation about their material, any activity signal, and **any trace of a withdrawal**. The
formal property: *a practitioner's view is a function only of shared material* — his view must not
vary with the client's private state, provable by rendering two fixtures that differ only in private
material and diffing.

**4 · Ownership.** Person-only: focus, reflections, personal notes, their own Field. Practitioner-
only: private notes, unpublished plans. Shared by relationship: program, stage, sessions, offers,
affirmations. Group: only what a member posts into it — and that is a **separate consent object**,
never a visibility flag.

**5 · Simple without hiding function.** Familiar room names; the room's purpose stated in the
person's language; nothing appears that cannot say why it appeared. **Simplicity comes from
removing system concepts, never from removing capability.**

**6 · Neither CRM nor chatbot.** Not a CRM because the person is not a record and part of them is
structurally out of reach. Not a chatbot because MAIA is a door in every room and the centre of none.

## 6. Ratification vs implementation choice

| Item | Kind |
|---|---|
| **Human simplicity as a constitutional principle** | ⚖️ **ratification** — it is a new article |
| Third-party consent for group spaces | ⚖️ **ratification** — a new consent surface |
| Whether the Home is one page with bands or a house with rooms | ⚖️ **ratification-adjacent** — it changes what "Home" refers to in every prior artifact |
| Stage checkmark semantics (*we moved past* vs *you completed*) | ⚖️ ruling — small, but it is the score boundary |
| Room names, ordering, navigation pattern, visual treatment | 🔧 implementation choice |
| Door copy naming Larry instead of *field* | 🔧 implementation choice — and the cheapest repair on this page |

## 7. What this does not do

No code. No components. No schema assumptions beyond what Phase 0 recorded as existing on trunk.
It does not supersede the Experience Design or the Larry Walk, does not resolve the pending
constitution and BD referents, and does not authorize the encrypted lane it repeatedly points at.
