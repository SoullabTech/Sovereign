# Elemental Alchemy Circle — Observation Pilot

**Type:** Observation pilot (NOT an MVP, NOT a feature launch).
**Date:** 2026-07-08
**Decision:** Option 2 (founder-hosted pilot), run as **2a — internal / founder-allowlisted cohort**.
**Governs nothing / authorizes nothing.** No code change, no schema, no boundary change.
**Grounds in:** `docs/canon/CIRCLE_FIELD_DOCTRINE.md` §4 (Observation Protocol — *"observations will come from the Soullab Dream Team circle"*); candidate spec `docs/specs/SHARED_WORK_CONFIGURATION_FOR_CIRCLE_CANDIDATE_2026-07-08.md`; memory `project_circle_place_book_club_specialization`.

---

## Purpose

Answer one architectural question with real usage, not argument:

> **Does a book-focused Circle disappear naturally into the existing Circle model, or does it push on the boundaries of the place?**

This is the evidence the candidate spec says should determine what comes next. The pilot is not trying to prove Book Club works. It is trying to see what the shared work reveals.

## What this pilot is NOT

- Not a Book Club feature build.
- Not the `focus_type`/`focus_id` schema extension (still deferred — the book is bound informally via the circle's name/description).
- Not tester-facing. **Do NOT add Andrea (or any tester) to `FOUNDER_MEMBER_IDS`** — that env var gates all founder-private surfaces (`/founder` console, verdicts, notes), not just circles. Circle access has only a founder gate today; opening it to testers is Option 1, a separate governed decision.
- Not a new MAIA behavior. MAIA stays a steward of coherence; `field_synthesis` remains human-written.

## Setup (zero code)

1. A founder (on the `FOUNDER_MEMBER_IDS` allowlist) creates a Circle named for the shared work (e.g. *"Elemental Alchemy — reading circle"*); description carries the book reference. Creator becomes `helper` (can open inquiries).
2. Participants = the founder-allowlisted cohort (Soullab Dream Team). Invite via existing token invite (`inviteService`).
3. Reading proceeds by the existing Circle mechanics, unchanged: one inquiry open at a time (a reading question per chapter/section), one response per member, responses hidden until contributed, close with a human-authored `field_synthesis`.

## Andrea's place in this

Andrea Fagan's interest in leading an Elemental Alchemy book club is the **motivating use-case** and the first candidate for a real, leadable club — delivered by Option 1 *after* this pilot validates the model. She does not lead (or access) during 2a. If live tester participation is wanted sooner, that is the Option 1 access build, done properly (decouple circle access from `founderAuth`, add a beta/member gate, cover in `verify-colab-boundaries`).

## Observation questions (the actual output)

Per the founder's framing + doctrine §4. Record qualitatively; do not instrument with counts/scores (doctrine forbids it).

1. **Does the conversation naturally organize around the shared work?** Or does the book feel bolted onto a generic circle?
2. **Does MAIA's limited role ("safeguard coherence, not generate meaning") feel sufficient** in a book context — or is there felt pull toward summary/synthesis/teaching?
3. **What does a facilitator actually need** that the current Circle doesn't already provide? (This is the empirical input to the still-open facilitator constitutional question — observe, don't pre-answer.)
4. **Does anything force a change to Circle itself, or only to the configured focus?** This is the decisive signal: focus-only change → configuration confirmed; Circle-itself change → missing primitive / incomplete doctrine (see memory `feedback_configuration_vs_primitive_diagnostic`).

Doctrine §4 watch-points to fold in: where do people speed up (performance pressure), get confused (orientation failure), perform rather than participate (social-media gravity), and where does the field actually deepen (it's working).

## Exit criteria — what the pilot decides

- **Configuration confirmed** (focus-only pressure, MAIA's role sufficient, facilitator needs are mechanical) → proceed to Option 1 (open a narrow circle-access path for testers) + optionally build the small `focus_type`/`focus_id` extension if informal binding proved insufficient. Andrea gets her club.
- **Boundary pressure** (repeated need to change Circle itself, MAIA-role feels insufficient, facilitator needs are interpretive) → the candidate spec's falsifier has fired; stop, do the facilitator constitutional pass, and revisit before opening anything.

---

_This document records an observation, not a plan to build. Its only deliverable is evidence._
