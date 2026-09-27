---
# ── Identity ────────────────────────────────────────────────────────────────
room: Writer’s Studio — Home / Arrival (PC3-S2)
human_activity: a writer arriving in the Studio and recognizing their Work — beginning one when there is none, returning to it when there is, finding the writing that is not yet a Work, and finding a Work by its title when there are many

surfaces:
  - app/writers-studio/full-redesign/HomeRoom.tsx
  - app/writers-studio/full-redesign/Shell.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - PC1 VS-01 / VS-06 — the Light Shell family is canonical; appearance changes atmosphere, never architecture or authority
  - PC1 VS-17 / PC2 §I — the spine is Home · Write · Develop · Review; no global Search or Library destination until real
  - PC2 §III HOME contract — Home is where a writer recognizes their Work and knows how to begin or return; not a dashboard, inbox, feed, tutorial or AI summary
  - FIRST_ARRIVAL_AND_ONBOARDING_CANON_v1 — the Work before the software; no tour, wizard or permission language; a new Work feels open; one quiet trust line
  - HOME_ARRIVAL_AND_OBSERVATION_ADDRESS_RULING_v1 §9 — “Welcome back to The River Between.” and the current place only where durable evidence supports them; never “You last worked here three days ago” without it
  - WORK_NAVIGATION_AND_DISCOVERY_CANON_v1 — capability honesty; no activity feed; no ranking by importance
  - Live Home truth (app/writers-studio/HomeView.tsx) — a Work is declared; unclaimed writing is opened as itself; dates remember, durations judge; the conditional search searches titles; remove ≠ delete
  - NEGATIVE_VISUAL_EVIDENCE NV-01…NV-07
  - PC3-S2R1 founder REVISE — structure trusted enough to disappear: one room field, one anchor field, supporting regions (JARVIS PC3_S2R1_HOME_FIELD_CONTAINMENT_REPAIR.md)
  - APPEARANCE_DEPTH_LAW_2026-09-24 — two-tone atmospheric depth, one visual world

reference_surfaces:
  - docs/design/writers-studio/founder-reference-corpus/original-27/Soullab Writers Studio Visual Canon.png @ c0f4bca2 · sha256 e5a72601548ee0f19e490a0f3c6f99d66694b2333217d6c341e64e9a37c44b25 — governing family (frame 1 · Home)
  - docs/design/writers-studio/founder-reference-corpus/writer-studio-reference-pack/references/01-work-home.png @ c0f4bca2 · sha256 27da50dff5773b89bd4ea0e875b1940f648b2671f35b4c90b64c5dfbed8542b7 — supporting history only, not the target
  - docs/design/writers-studio/founder-reference-corpus/original-27/Soullab Literary Review Dashboard.png @ c0f4bca2 — source of The River Between’s own Work image
  - docs/design/contracts/writers-studio-full-redesign-pc3-s1.md — accepted S1 shell (founder PASS on 9995c785)

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: the accepted S1 product bar, measured equal element-for-element to the S1 bar; Newsreader for the Work and Inter for labels; the same colour roles, radii and cool action language; restrained gold only for a line the writer kept
distinct_to_room: Home is one room — no manuscript rail and no resident MAIA; since S2R1 it is composed in three levels of containment (one warm room field on the ground, one raised anchor field for what the writer came for, recessed regions and one band of quiet acts), depth by tone rather than chrome; the Work is recognized by its own image and name; unclaimed writing sits on a dashed page edge labelled “Writing”, Works on a solid card labelled “Work”; generous open space so beginning feels possible

# ── Evidence ────────────────────────────────────────────────────────────────
screenshot_desktop: docs/design/contracts/screenshots/full-redesign-pc3-s2/home-return-1536x1024.png
screenshot_mobile: docs/design/contracts/screenshots/full-redesign-pc3-s2/home-return-390x844.png
experience_verification: rendered all four Home states at 1536×1024 and read each against Visual Canon frame 1 on its founder-review board (board-home-*.jpg), with a derivation note naming what came from the Light Shell, the Home canon and the live Home, and what was intentionally not copied; walked H1 and H2 at 1280, 1024 and 390 for recomposition, and H2 in Night. S2R1: every state compared BEFORE (parent c01d1908) / AFTER on board-s2r1-*.jpg, including H2 Night. Mechanical witness: scripts/writers-studio/pc3-s2-home-fidelity.mjs 91/91 GREEN (containment added: one room field, one anchor, region tones, alignment lines, no orphan separator, no heavy chrome, Night = Light geometry), and RED on each of seven known-bad mutants (resident MAIA, urgency copy, bar drift, room field removed, tones flattened, heavy chrome, orphan separator). Whether Home feels like the Studio is founder judgment and is NOT claimed here.

deviation: Home appears in the primary spine although the earlier Home ruling (§2, §4) and the Navigation canon (§NAV 65–68, 375) held Home and Search back until real; the title-only Home search is shown
authority: PC2 master screen/function contract (ratified 2026-09-24) sets the spine as Home · Write · Develop · Review over a real, existing Home destination; PC3-S2 execution packet §5 H4 requires the existing conditional title-only search with its scope stated
---

# Writer’s Studio — Home / Arrival (PC3-S2) — Experience Contract

## What this room is for

Arriving. A writer opens the Studio and should know, before anything else, that their Work is here — or that beginning one is simple. Home is not where work happens; it is where the writer finds their way to it.

## Arrival

> **“Welcome back to The River Between.” · “You’re in Chapter 6 — The Current Changes.”**

With no Work: **“Welcome, writer. You are home.”** and one clear act, **Begin a new work**.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| begin | “Begin a new work” | the live Studio’s own words; an invitation, not a wizard |
| return | “Return to this work” | here when you are ready — not “Continue writing” |
| writing that is not a Work | “Open writing” · “Make this a work” · “Add to a work” | the member declares; nothing is recast silently |
| find | “Find by title…” · “Searches titles only” | the scope is named, so a missing sentence is not mistaken for a lost one |
| let go | “Remove Work” / “Delete Work and writing” | two acts, two consequences, the live Studio’s exact copy |

## Containment (PC3-S2R1)

| level | what | tone |
|---|---|---|
| room field | the whole Home, one hairline edge | `--fr-field` over the shell ground |
| anchor | H1 threshold · H2/H4 current Work (arrival → recognition → re-entry) · H3 the writing | raised paper `--fr-panel` (H1 unraised) |
| regions | Also written · Your Works · Your Writing | `--fr-recess`, paper items inside |
| band | Begin / Import / Bring notes | the room's own edge, no fill |

## Forbidden here

- dashboard grids, goals, progress bars, AI insight feeds, templates (the August Work Home)
- “Continue where you left off”, “You last worked…”, elapsed-time counters, streaks
- a resident MAIA panel or manuscript rail at Home
- global Search or a Library room; Explore / Publish
- unclaimed writing labelled or counted as a Work
- containment by card proliferation, dashboard panels, thick borders, heavy shadows or glass

## The two brand tests

**Same house?** Yes — the bar is the accepted S1 bar, measured equal; type, roles and action language are the S1 family.

**Distinct room?** Yes — one open room, no rails; the Work recognized by its face and name.
