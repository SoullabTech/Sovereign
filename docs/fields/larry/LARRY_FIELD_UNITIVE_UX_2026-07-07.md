# Larry Field — Unitive UX/UX Plan

**Status:** CANDIDATE design plan (design-reasoning standard — not liveness). 2026-07-07. Answers the 8-part design task; companion to [Field Spec](./LARRY_FIELD_SPEC_2026-07-07.md), [UI Simplicity Rules](./UI_SIMPLICITY_RULES_2026-07-07.md), [Journey Composition Guide](../methodology/JOURNEY_COMPOSITION_GUIDE_2026-07-07.md).

## Frame — unitive, not all-in-one

*A practitioner's world should not be fragmented.* Not "everything in one place" (that invites CRM comparison) but **"everything that belongs to the developmental relationship lives together."** The criterion for any capability: *does it deepen the developmental world?* (Video: yes. Messaging: yes. Accounting: no.)

**Spatial architecture — each constitutional layer gets one home:**

```
                 Larry's Field
  Outer  Field Commons   (events · community · resources · comms)      [Vision]
  Middle Co-Labs          (encounters · shared practice · video)        [CANDIDATE — Gate-blocked]
  Inner  Personal Portal (Person) ·  Pro Studio (Practitioner)          [Portal/Studio views: Live]
                    Co-Lab = Relationship
```

Person → Personal Portal · **Relationship → Co-Lab** · Practitioner → Pro Studio.

## Two governing principles (adopted into UI Simplicity Rules)

- The participant **never experiences platform capabilities** — they experience a continuous developmental relationship.
- The practitioner **never experiences platform management** — they experience stewardship of their practice.
- **Failure tests:** if a participant must ask *"which module do I open?"* → failed. If Larry feels he's *managing software* → failed. If the system claims *who the client is becoming* instead of presenting what they *chose to share* → failed.

## 1. Client/student journey (moments, not modules)

`Return → Reflect (MAIA) → Practice → Reach out → Schedule → Meet → Continue`. On return: one gentle line — *"Welcome back. How has this week's practice been unfolding?"* — opening from the thread they're living (the Live return branch). MAIA helps them *notice*, never tells them what it means. They revisit a Larry practice, optionally share a reflection, write Larry a note, schedule, enter the encounter, and the practice continues. No dashboard, no visible "uploads/messaging/video" — those exist underneath.

## 2. Larry's Pro Studio journey

`Review shared → Prepare → Respond → Publish/evolve`. He opens his Field and sees *"Sarah shared a reflection"* — the consent-scoped view (**only what the participant chose to share**), lessons/practices/transcripts/questions in context. He responds with guidance, prepares from where the work actually is, publishes or refines practices, and his body of work matures over time. He never navigates modules.

## 3. Facilitator journey + permission boundaries

Facilitators enter **only the Co-Labs they are explicitly invited into** (a cohort, a specific participant, a retreat). They see **only consented shared material** — never the participant's private Portal, never Larry's private Studio. Permissions are Co-Lab-scoped, gated by the **Co-Lab Release Gate (31/31)** + the three practitioner-privacy invariants.

## 4. Co-Lab surface — what lives here / what must never appear

**Lives here (only what was intentionally brought into the relationship):** practices Larry assigned · reflections the participant chose to share · questions for the next session · encounter summaries both can reference · resources Larry recommended · agreed goals.
**Must never appear:** the participant's private journal/memory · Larry's private notes · activity telemetry · any system interpretation of the participant's development. *A shared table, not a workspace full of tools* — people bring things, work with them, return to their own worlds.

## 5. MAIA behavior rules inside Larry's Field

- MAIA remembers the **curriculum of the relationship** (what Larry introduced, practices suggested, resources explored, what the participant reflected on) — and offers continuity: *"Would it help to revisit the breathing practice Larry introduced last week?"*
- It speaks the **thread we've been living**, never a verdict: *"You've returned several times to the question of belonging — want to keep exploring it?"* (fact about their own choices) — **not** *"You've learned X"* / *"You're in Stage 3."*
- **Never impersonates Larry**; may serve his teachings and refer back to him (*"you may want to bring this to Larry"*).
- **Learning Journey guard:** MAIA may use Larry's offered map to *orient the journey*, never to *classify the person*. Reflect the participant's own recurring language/choices as facts; never synthesize a theme label they did not author.

## 6. Minimal screen/component map

- **Participant:** one continuous room — *Return card → MAIA thread → Practice panel → Share gesture → Note-to-Larry → Schedule → Encounter*. One surface, sequential moments.
- **Larry:** *Field home (shared reflections in context) → Encounter prep → Response → Practice/resource composer*.
- **Facilitator:** *invited Co-Lab view only*.
- **Shared:** Co-Lab (the shared table). Underneath (not surfaced as modules): video, messaging, scheduling, transcripts, resources, memory.

## 7. Live / Designed / Vision per surface

| Surface | Status | Basis |
|---|---|---|
| Participant return room + reflect + practice + return branch | **Live** | verified 2026-07-07 |
| Consent-scoped Studio view of shared reflections | **Live** | `/studio/fields/<id>` |
| Per-thread share gesture · private-memory boundary | **Live** | `member_field_note_threads.can_be_shown_to_practitioner` |
| Unitive participant loop (return→reflect→practice→share, moments-not-modules) | **Live** | code-map verified 2026-07-07: one component `NowWhatRoom`, in-place `roomPhase` state, no navigation/`Link`/redirects, no nav chrome |
| Co-Lab as relationship room · facilitator scoping | **CANDIDATE** | containers scaffolded; Experience BLOCKED pending Gate |
| Learning Journey primitive | **Designed** | new; authority-direction guard above |
| In-Field video · messaging · scheduling | **Vision** | external today (Zoom/Calendly/Gmail) |
| Field Commons ring · community | **Vision** | — |

## 8. Smallest next loop — FINDING: the participant loop is already unitive (verified 2026-07-07)

A code map of `NowWhatRoom` (return→reflect→practice→share) found **no seams to build**: one component, in-place `roomPhase` transitions, no `useRouter`/`Link`/redirects, no nav chrome, full-screen immersion, per-thread share inline. The participant never crosses a route or context reset. **The unitive thesis is already proven at the code level — manufacturing a "shell" would be inventing work.** Loop #8 as originally scoped is *complete-by-design*, not a build.

**The real next steps:**
1. **The felt walk (true verification).** Code proves no boundary *exists*; only a person confirms it *feels* like one relationship. Walk `michael.demo`'s return with a human (ideally Larry) — the experiential step neither code nor Claude can fake.
2. **One genuine small increment (optional):** an end-of-room **"note to the practitioner"** affordance — explicit-consent, member-authored, reusing the existing `field-note` POST + per-thread share pattern, **staying in-room** (no new route). Brings the journey's "reach out" moment inside the room instead of forcing the participant to leave to email Larry.
3. **Do NOT add scheduling here** — it introduces the one seam (a separate route). Keep it Vision until it can enter without breaking continuity.

**Design standard:** simple · elegant · intuitive · unitive · in harmony with Larry's evolving work.

## 9. The Inhabitation Pilot — constitutional onboarding (CANDIDATE)

The pilot is not technical; it is *inhabitation*. The platform teaches its own ontology through lived experience, not explanation. Sequence: **Arrive → Inhabit → Steward → Invite → Accompany → Return.**

1. **Arrive / Inhabit** — Larry arrives to *one thing*: his own Personal Field. No Studio, no clients, no Co-Lab, no dashboard. *"Welcome, Larry. This is your Personal Field. Before accompanying others, inhabit it yourself."* He begins exactly where every participant begins — a conversation, a reflection, a practice. **Live today** (runs on the verified participant room; no new build). *This is the felt walk, elevated: Larry as the first participant in his own Field.*
2. **Steward** — only after he has lived there is the Studio *entrusted*, not toggled: *"Your work has become a place. This Studio stewards the relationships entrusted to your practice — not separate from your development; it grows from it."* **Designed** — emergence-gating (Studio unlocks from lived inhabitation, not a "Become Practitioner" button) does not yet exist. A toggle would manufacture higher-order standing; emergence recognizes it.
3. **Invite / Accompany** — *"Begin a relationship"* (not "Add Client"). He names a Co-Lab, invites someone; the relationship comes into existence, and only then does the architecture become visible — because it emerged, not because it was explained. **CANDIDATE / Gate-blocked** (Co-Lab Experience BLOCKED pending Co-Lab Release Gate).
4. **Return** — he never leaves; he only gains another perspective.

**The sentence above the whole experience:** *Every practitioner begins as a participant in their own development. Every Studio grows from a Personal Field. Every Co-Lab grows from a relationship freely entered.* Understand that, and schema / permissions / memory / governance are all implementations of one progression — the Direction of Authority as lived onboarding.

**Honest pilot start:** Step 1 is Live and needs no code — begin by having Larry inhabit his own Field. Steps 2–4 are Designed / Gate-blocked and are *earned* later; do not build them to make the liturgy render before inhabitation is felt.
