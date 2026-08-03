# AIN OS — Entry Architecture

**Date:** 2026-08-03 · **Status:** ⛔ **DESIGN + FINDINGS. No ruling, no build authority.**

> **The constitutional test: does the first thing a person encounters match the reason they arrived?**

The finding this answers is a **category error, not a long onboarding**: the system introduces the
platform before it introduces the relationship. For Larry's client the first question is not *what is
MAIA* — it is *where is Larry, and how do I continue the work we started.*

**AIN OS should not have one front door. It should be one house with doors appropriate to each
person's relationship to it.**

---

## 1. Entry types

| Entry | Person's intent | First experience | Substrate today |
|---|---|---|---|
| **Explorer** | *"What is this?"* | MAIA orientation — the current flow, correctly aimed | ✅ built (`/begin` → … → `/onboarding`) |
| **Client invite** | *"Continue my work"* | The practitioner relationship | ◐ `createPendingRelationship` / `acceptInvitation` exist; **no distinct entry** |
| **Practitioner** | *"Support my clients"* | The practice workspace | ◐ foundation only |
| **Author** | *"Write my book"* | The writing environment | ◐ Author Studio deployed and member-reachable |

⚠️ **The existing onboarding is not wrong. Its entry condition is wrong.** It is well designed for the
Explorer and is currently applied to everyone.

## 2. The constraint that keeps this from fragmenting

> **Doors may differ in vocabulary and sequence. They may never differ in authority.**

Every entrant inherits the same Tier 1 boundaries — human meaning stays human-owned, privacy is
structural, authorship is visible, MAIA is a resident. A door is a *translation*, never a *variant
constitution*. This is the same constraint that governs the charter tree: audience-level rules live
in the constitution and are not re-expressible per surface.

## 3. 🔴 Correction to my own earlier recommendation

Last turn I proposed the cheapest repair to the front door was *"Sign in to continue your work with
Larry."* **That has a privacy cost I did not flag.**

An unauthenticated page naming the practitioner **discloses the practitioner–client relationship to
whoever holds the link** — and invitation links are forwarded, left in inboxes, and screenshotted.
For coaching, and anywhere adjacent to health or personal difficulty, the existence of the
relationship is itself sensitive.

Three options, none ruled:

1. **Name the practice, not the person** — *"Continue your work in the Now What? practice."* Loses
   most of the warmth.
2. **Name Larry only after authentication** — the door stays neutral; the first authenticated screen
   says *"your work with Larry."* Costs one screen, keeps the disclosure behind the key.
3. **Accept it** — the recipient opened a link addressed to them; the practitioner's name is arguably
   already in the email that carried it.

⭐ **The general form is worth keeping:** *a door personalized before authentication is a disclosure.*
That applies to every entry type in §1, not just this one.

## 4. The two layers

**Layer 1 — the functional surface.** What the person sees: upcoming session · calendar · program ·
stage · messages · resources · agreements · actions · history. Larry should look at this and say
*yes, this is how I run my practice.*

**Layer 2 — the relational architecture.** Underneath every function: who authored this · who owns
it · who can see it · what relationship it serves.

Same function, different relationship:

| Ordinary platform | AIN OS |
|---|---|
| `Task: Complete leadership exercise` | `Larry shared: Leadership reflection exercise`<br>`Connected to: Leadership Transition Program`<br>`Your response remains yours until you choose to share it.` |

⚠️ That card needs `coach_work_items` and `coach_resource_recommendations` — both deferred to the
encrypted lane. **The pattern is right and the substrate is not there**; it is a Stage 3 card, not a
Stage 1 card.

> **The outside should feel familiar. The inside should be different.**
> The philosophy shapes the behaviour underneath; it does not need to be visible on the surface.

## 5. Repositioning the existing threshold — not removing it

The current welcome page carries the constitutional heart of Now What?:

> *"You set the rhythm." · "You decide what deserves your attention." · "Nothing here measures you or
> grades your progress." · "The only growth that matters is the growth you recognize in your own
> life."*

**None of that is wrong.** It is a strong opening — for the wrong room. The page is currently trying
to be threshold, home, reflection space, MAIA introduction, and philosophy at once, which is the
clearest evidence that the rooms want separating.

**Recommendation: it becomes the Reflect room entrance**, where it is excellent, and the threshold
becomes the relationship. The philosophy is not deleted; it is met at the moment it becomes relevant,
which is when the person is about to do the private work it describes.

> For Larry: *"The first version created a beautiful doorway into the inner work. Now we are building
> the house around it. Clients first need to know where they are in their relationship with you —
> then the reflective environment becomes powerful."*

## 6. The entry acceptance test

Within ten seconds of arriving, a new client should be able to answer:

**Functional — if these fail, the design fails**
1. Where am I?
2. What am I doing?
3. What is next?
4. How do I reach Larry?

**Relational — if these fail, AIN OS fails**
5. What belongs to me?
6. What belongs to Larry?
7. What do we share?

⭐ Note the asymmetry, and keep it: 1–4 must be **answerable**; 5–7 must be **felt**. If 5–7 require
reading an explanation, the environment has made governance complexity into user complexity — which
is the failure the simplicity principle names.

## 7. What must be ruled

| Item | Kind |
|---|---|
| Whether AIN OS admits multiple entry thresholds over one architecture | ⚖️ **ratification** — the current flow is documented as universal with "no shortcuts" |
| Practitioner disclosure at an unauthenticated door (§3) | ⚖️ ruling — small, but it is a disclosure |
| Repositioning the welcome page from threshold to Reflect entrance | 🔧 implementation choice, once (1) is ruled |
| Door copy, ordering, visual treatment | 🔧 implementation choice |

## 8. Convergence

Three separate lines of work arrived at the same architecture from different directions:

- **The House model** solved *navigation*.
- **The user journeys** solved *arrival*.
- **The onboarding finding** solved *the threshold*.

All three point at: **one house, doors appropriate to the relationship.** When independent lines
converge, the structure is more likely to be discovered than invented — which is the standard this
lane holds itself to.

## 9. What this does not do

No code, no screens. The Journey-1 onboarding finding remains **verified against project
documentation, not an authenticated walk** — walk it before ruling. Nothing here resolves the pending
constitution or BD referents, or authorizes the encrypted lane.
