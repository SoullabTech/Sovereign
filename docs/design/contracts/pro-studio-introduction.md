---
room: Pro Studio — introduction
human_activity: understanding what Pro Studio is and deciding whether it is for me, without being enrolled, sold to, or made into a practitioner

surfaces:
  - app/pro-studio/page.tsx
  - components/pro-studio/LearnAndTryView.tsx

change_class: experiential

principles:
  - INHABITABLE_ARCHITECTURE — a threshold names where you are, what is here, and where you can begin; it is not a funnel or a dashboard
  - MARKETING_CLAIM_DISCIPLINE — every sentence is Live; nothing unbuilt is stated or implied (Failure Test)
  - Sanctuary Economy — no price, tier, trial or pressure; no member pays to be known
  - Sovereignty Invariants — the member decides what, if anything, to carry forward

reference_surfaces:
  - components/pro-studio/ReflectArrivalView.tsx (the sibling Pro Studio arrival; same paper ground, type scale, spacing and one-action card)
  - docs/programme/HOUSE-ENTRANCE-01_LEARN_AND_TRY_PAGE_DESIGN_2026-10-30.md (the founder-reviewed brief this page implements)

shared_with_house: type hierarchy, quiet single-action card, plain declarative voice, and the provenance of "what you can do" matching what is actually reachable. Same family as the Reflect arrival, so the two Pro Studio pages read as one house.
distinct_to_room: it is explanatory rather than conversational. It lists what the full studio holds (from the product's own module definitions) and states plainly that those are not open from here; the only action is one real conversation with MAIA. Without the label a member could tell it from Reflect because it names the studio's parts and ends in an honest "not set yet".

screenshot_desktop: docs/design/contracts/screenshots/pro-studio-introduction-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/pro-studio-introduction-mobile.png
experience_verification: >-
  2026-10-30. The REAL component markup (renderToStaticMarkup of LearnAndTryView with the real module groups)
  was captured with headless Chrome at 1280px wide (signed-in state) and in a true 390px viewport
  (signed-out state, inside an iframe, because headless Chrome will not go below ~500px window width).
  Styling is Tailwind via the CDN, standing in for the app's Tailwind build; the Next.js app itself was NOT
  run, so fonts and global CSS in production may differ slightly. Read top to bottom at both widths:
  the arrival sentence is first; nothing is clickable except the return link and the one action; no price,
  tier or enrollment appears; the module list wraps cleanly at 390px with no horizontal scroll; the sign-in
  and MAIA-conversation variants each show their single action. NOT YET DONE: a walk through the live
  app with a real session — owed before release.
---

# Pro Studio introduction — Experience Contract

## What this room is for

A threshold for someone who is curious about Pro Studio and may or may not be a practitioner. It says what the studio is, shows what the full studio holds, separates it clearly from the member's own space with MAIA, and offers the one thing that is real today: a conversation with MAIA about their practice.

## Arrival

> **A workspace for the work you do with others.**

Where am I (an introduction to Pro Studio) · what is this for (understanding it, not joining it) · what is here now (the studio's parts, none open) · where can I begin (talk with MAIA).

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Primary (signed in) | "Talk with MAIA about your practice" | A conversation, not a conversion; opens the existing free encounter |
| Primary (signed out) | "Sign in to talk with MAIA" | Honest about the one precondition |
| Secondary (signed in) | "Already have a Pro Studio? Open it." | Navigation only; `/studio` keeps its own guards |
| Return | "Return to Soullab" | Always a way back |

## Forbidden here

- enrollment, signup, waitlist or any form
- a price, tier name, trial length or feature limit
- a link to or mention of Reflect, a sample studio, or any unbuilt layer
- creating or selecting a practitioner identity
- reading the member's tier, practitioner row or studio mode

## The two brand tests

**Same house?** Yes — same paper ground, type scale and single-action card as the Reflect arrival, per the screenshots.

**Distinct room?** Yes — it carries the studio's parts and the honest "not set yet" footer, neither of which the Reflect arrival has.
