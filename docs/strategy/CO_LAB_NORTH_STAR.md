# CO-LAB NORTH STAR — Companionship in Service

**Date**: 2026-06-10
**Register**: **Vision / governing design filter** (Cat 1 — *preserved direction*, per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`). This is the *Designed/Vision* horizon, not a *Live* claim and not a build authorization.
**Companion to**: [`CO_LAB_REVEAL_AUDIT.md`](./CO_LAB_REVEAL_AUDIT.md) (the present-state, what's-already-built record).
**Part of a larger pattern**: [`PLATFORM_CENTER_OF_GRAVITY.md`](./PLATFORM_CENTER_OF_GRAVITY.md) — accompaniment as the connective center across Self · Care · Community · Continuity.
**Status**: **Deferred.** Nothing here ships until Studio (#401) lands and real practitioner behavior is observed. This document exists so the *next* move is earned by need, not invented from theory.

> The claim discipline polices the **claim** (*is* vs *becoming*), never the **reach**. This is held vision — protected, named, not yet incarnated. Read it as the cathedral, not the first stone.

---

## The center

Co-Lab's problem was never channels. It was never notifications. It was never even consultation.

It is that **helpers carry immense responsibility in relative isolation.** A therapist, a coach, a healer, a spiritual director, a pastor, a guide, a teacher — many spend their days holding complexity, grief, uncertainty, ethical tension, and hope *for other people*, then close the laptop and sit with it alone.

The profession teaches: *be present, be steady, be ethical, be boundaried.* All true. What gets lost is: **be accompanied.**

*"We need better communication." "We need a community platform." "We need channels." Those are solutions searching for a problem. The problem is **accompaniment** — name it correctly and the rest follows. Co-Lab does not exist because helpers lack a place to type; it exists because helpers carry other people's lives in isolation.*

So the strongest future of Co-Lab is not *community*, and not *collaboration*. It is **companionship in service** — a place where helpers remember they are not the only one carrying.

Notice how different that is from Slack:

| Slack asks | Co-Lab can ask |
|---|---|
| What project are we working on? | **What are we carrying?** |

Most collaboration tools are built around *"how do we help people work together?"* Co-Lab has the chance to be built around a rarer question: **"how do we help helpers not carry the work alone?"**

---

## The same move Studio made

```
Studio:   tasks · agents · operations · systems   →   people · sessions · care · continuity
Co-Lab:   channels · messages · threads · notifs   →   companionship · consultation · support · wisdom
```

The infrastructure underneath barely changes at first. **The meaning changes completely.**

- Studio's question: *"Who needs me today?"*
- Co-Lab's question: *"Who is carrying something today?"* / *"How can we help each other care well?"*

The visible experience begins with **human need**, not communication mechanics. Channels, permissions, notifications, routing — those become *infrastructure underneath* the experience, not the experience itself.

---

## The five needs (the north star)

Every Co-Lab feature should answer one of five needs:

1. **I need perspective.** — *Help me think about this client / situation. Help me see it better.*
2. **I need support.** — *Can someone sit with me in this? I'm carrying something after a session.*
3. **I need a referral.** — *Who is better suited to help this person?*
4. **I want to contribute.** — *I can help someone. Something beautiful happened today.*
5. **I want to belong.** — *I am part of a community of care, not practicing alone.*

These are profoundly human acts:

```
Consultation  →  "Help me think about this."
Support       →  "Can someone sit with me in this?"
Referral      →  "Who is better suited to help?"
Celebration   →  "Something beautiful happened today."
```

---

## The compass (adoptable now — the one thing that doesn't have to wait)

For every Co-Lab feature, present and future:

> **Does this help a helper care for someone — or help a helper be cared for?**

If it does neither, it is Slack. The *design filter* can govern immediately, even while the IA and features below remain deferred. (This is the same filter that produced the Studio reveal; it has already proven its value once.)

---

## Need-first information architecture (deferred vision)

The future left rail may not be organized around topics at all. It may be organized around **human need**:

```
For You
  Need Perspective
  Need Support
  Need a Referral
  Need Collaboration

Community
  Celebrations
  Introductions
  Announcements
```

The existing channels still exist **underneath** — as infrastructure, not as the front door. The visible message of the whole surface becomes: **You're not alone in this.**

(Mapping note: "I want to contribute" and "I want to belong" surface as *Collaboration* + *Community* / *Celebrations*. Hold the five needs as the compass; treat any specific IA as one expression of them, not a spec.)

---

## The bridge — the killer feature

The act that makes Co-Lab more than chat is the one that connects **care → collective wisdom**:

```
From Studio / Session Room:
   "I need perspective on this."
        ↓
   Create a de-identified consultation request in Co-Lab.
        ↓
   The right people respond.  →  Useful response.  →  Retained wisdom.
```

This is the through-line of the whole five-surface sequence: a moment of carrying inside the work becomes accompaniment from the community, without the helper ever leaving the flow of care.

---

## The de-identification ritual (canon-critical, not optional)

Practitioners must be able to discuss situations **without exposing a person.** Before any consultation post:

```
Remove names, locations, identifying details.
Share the pattern, not the person.
```

MAIA can help convert raw practitioner language into a safer consultation prompt. This is the same boundary the existing referral backend already encodes by default (de-identified fields, explicit consent to share name/contact — see audit §7). **Channel/thread messages do NOT yet carry this discipline** (audit §6 flag): a "difficult client" thread would put client material into shared storage unprotected. *Consultation about real people is gated on de-identification.* This is a sovereignty invariant, not a later refinement.

---

## Smallest useful v1 — a thin layer, not a redesign

Your explicit scoping, preserved: **do not redesign the channels.** Build one thin layer on top.

**The first question is not "what features should Co-Lab have?"** It is: *"What is the smallest unmistakable sign that a helper is reaching the edge of carrying something alone?"* — because that signal **is** the doorway, not channels or groups or consultation workflows. If Studio's central gesture is **"Who needs me today?"**, Co-Lab's first real gesture may be just: **"Would it help to carry this with someone?"** — dramatically smaller than a redesign, and potentially far more powerful.

```
New action:  "Ask Co-Lab"
        ↓
   • Ask for Consultation   (lightly structured: kind of support · urgency · context ·
                             what you've tried · what response would help)
   • Request Referral       (filters: modality · location/virtual · population ·
                             availability · sliding scale · fit)
   • Offer Support
        ↓
   Route the request into the right existing channel/type underneath.
```

What it stands on, **already built** (per audit — *surface, don't rebuild*):
- **Consultation** → threads + `message_kind='request'` → `attention_items.kind='request'` (the "ask the room" loop exists end-to-end).
- **Referral** → `practitioner_directory_profiles` + `referral_requests` + search API (BUILT, consent-grounded, **zero UI** — the crown jewel is invisible, not absent).
- **De-identification** → the consent/de-identification posture already modeled in the referral stack.

---

## What I would NOT do yet (your guardrails, preserved)

- **Do not** redesign all channels immediately.
- **Do not** build the full need-first IA yet.
- **Do not** invent demand. Let Studio ship and observe first.
- Let the need emerge from **behavior**, not theory.

### The observation gate

Before Co-Lab's evolution earns the right to begin, watch for these after #401 lands:

1. Do practitioners enter **Studio** more often?
2. Do they click **Prepare Me**?
3. Do they enter **Session Room** from Studio?
4. **Do they then seek support from others?**

**Watch signals, not volume.** The metric is *not* "how many messages were sent." It is the moments a practitioner reaches the edge of individual capacity and turns toward others:

- *"I wish I could ask someone about this."*
- *"Has anyone seen something like this?"*
- *"Who would be good for this referral?"*
- *"I'm carrying something difficult after today's session."*

**When #4 starts happening — when those signals recur — the next evolution becomes obvious**, because it will have emerged from real practitioner need. And the discovery underneath it would be simple and powerful: **care naturally seeks companionship.** At that point Co-Lab stops being a messaging system and becomes the place where care becomes collective.

The first move then is **not a redesign**. It is a single doorway — **"Need Perspective"** / **"Ask Co-Lab"** — because the simplest expression of the north star is still the strongest: *you're not alone in this.* Until those signals appear, this document waits.

---

## Where Co-Lab sits in the whole

Five surfaces, five distinct purposes — *three dimensions of one life, not three apps*:

```
Personal Portal     →  What is alive in me?       (What is happening in me?)
Studio              →  Who needs me today?
Session Room        →  How do I meet them well?
Co-Lab              →  Who can help me carry this?
Relationship Memory →  What must not be lost?
```

**The danger is collapse** — each surface dissolving into another:

- Studio becoming Co-Lab
- **Co-Lab becoming chat**
- MAIA becoming Studio
- Session Room becoming a dashboard

The Studio reveal succeeded because it gave each thing a proper place. Co-Lab's distinct place is **companionship in service** — and its specific collapse-risk is becoming a Slack clone. Guard that boundary.

---

## North-star brief (for whoever builds this, when the gate opens)

> Co-Lab is not a messaging product. **Co-Lab is the place where helpers discover they are not alone.**
>
> Every feature answers one of five needs: *perspective · support · referral · contribute · belong.*
>
> Existing channels, messages, notifications, and permissions are **infrastructure**. The visible experience begins with **human need**, not communication mechanics.
>
> The design question for every screen: **"Does this help a helper care for someone, or help a helper be cared for?"**
>
> The same insight that transformed Studio can transform Co-Lab — by revealing the human purpose already hiding underneath the infrastructure. Reveal, don't rebuild.
