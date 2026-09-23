---
room: Soullab Studio — flagship Write · Develop · Review composition
human_activity: writing directly in the Work while MAIA stays at the writer's exact place; holding a passage; asking MAIA one question about the held passage and reading her reply without leaving the manuscript; walking findings back into the manuscript without losing place
surfaces:
  - app/writers-studio/flagship/**
  - app/writers-studio/rebuild/FlagshipWriteHost.tsx
  # EC1, 2026-09-23 — the shared authorship substrate is mounted by the
  # flagship host. Naming it here gives the live route one current composition
  # authority while preserving its existing save/authorship law unchanged.
  - app/writers-studio/rebuild/RebuildWritingBoundary.tsx
  - app/writers-studio/rebuild/RebuildAuthoredBody.tsx
  - app/writers-studio/rebuild/flagshipWriteHost.css
  - app/writers-studio/rebuild/DiscussLayer.tsx
  - app/writers-studio/rebuild/discussAct.ts
  # R1-1C, 2026-09-23 — Review navigation succession: the pure navigation law and the reading chooser.
  - app/writers-studio/rebuild/reviewNavigation.ts
  # R1-2, 2026-09-23 — exact Review → manuscript section return as data, and the live read-only Review mount (R1-1B) it navigates from.
  - app/writers-studio/rebuild/reviewReturn.ts
  - app/writers-studio/rebuild/LiveReviewView.tsx
  - app/writers-studio/rebuild/ReviewChooser.tsx
  - app/writers-studio/rebuild/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — one Studio shell, three member-facing modes, never three products
  - VISUAL_SYSTEM_CANON_v1 — roles are law, names are implementation; warm Work, cool lucid system, restrained gold
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — the flagship composes; it never mints identity, save authority, or a model commission
  - MAIA_SOVEREIGNTY_INVARIANTS — MAIA is an anchored, dismissible layer above the manuscript, never a permanent pane
  - CAPABILITY HONESTY — a live surface renders only destinations and actions with real substrate; absence renders as absence
reference_surfaces:
  - docs/design/writers-studio/flagship/FLAGSHIP_FLOW_01.md
  - docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_C0_HOST_COMPOSITION_CENSUS_2026-09-22.md
  - docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_C1A_PURE_WRITE_FRAME_2026-09-22.md
  - docs/design/contracts/writers-studio-rebuild.md
  - docs/design/contracts/screenshots/flagship-b2/witness.json
  - docs/design/contracts/screenshots/flagship-c1c1/flag-on__2-answered.png
  - docs/design/contracts/screenshots/flagship-c1c1/flag-on__3-stale.png
  - docs/design/contracts/screenshots/flagship-c1c1/flag-on__4-mobile-390.png
shared_with_house: the `.fs-tokens` semantic token root (ground · text · action · accent-warm · maia · status · measure · provenance · rail · atmosphere) declared once in flagship.css · Press serif for the Work, system sans for the chrome · restrained gold as warm attention only · human-language gestures · the proven authorship substrate (RebuildWritingBoundary → useSectionWriting → makeSectionSave) hosted unchanged
distinct_to_room: the manuscript is a centred column in normal flow and MAIA is an absolute layer above it, so opening her never shifts the prose; alternatives are unranked peers; the applied receipt always carries Undo; the live Write host exposes Write alone as non-interactive orientation, supplies status only from the writing session's own state, and draws no control that lacks a lawful action; when the server has enabled the editorial layer and a passage is held, ONE action (Ask MAIA) opens a one-shot composer whose Submit is the commissioning act — the member's own words, one passage-bound thread, one MAIA reply, Discuss as the only tab, Release (never cancel), a late result bound to its gesture, and a stale disclosure rather than a re-anchor when the passage has since been edited
screenshot_desktop: docs/design/contracts/screenshots/flagship-c1b/flagship__1-open.png
screenshot_mobile: docs/design/contracts/screenshots/flagship-c1b/flagship__5-mobile-390.png
experience_verification: >-
  CONTROLLED-COMPONENT WITNESS (scripts/witness/flagship/render.tsx): eleven acceptance states at 1920 · 1440 · 1180 · 390, V9 legacy-shape and F13 falsifiers green, 44/44; identical before and after the C1A extraction and the C1B shell affordances (result file and all 44 captures byte-identical). LIVE CANDIDATE WALK (scripts/witness/flagship/c1b-live-write-walk.ts), 2026-09-22, against a disposable full-schema shadow database and a real next dev server at /writers-studio/rebuild with a real authenticated session: manuscript opened by identity; two real authored bodies rendered inside the flagship manuscript geometry; typing did not shift the column; status read "Unsaved" while typing and "Saved · v2" after the existing save path advanced the draft version 1→2 through exactly one section save lane; reload returned the exact saved text; selecting authored text held the exact passage at code-point address 21:29; zero buttons, zero legacy Develop/Review links, no static paragraphs, no fixture status phrase, no invented kind or organisation. 22/22. ⛔ Candidate evidence, not production evidence and not a member walk; V10 remains the founder's.
  C1C1 DISCUSS WALK (scripts/witness/flagship/c1c1-discuss-walk.ts), 2026-09-23, same shadow discipline, the editorial flag carried only by the witness next dev process, the browser carrying an explicit ordinary Sanctuary posture, and MAIA's reply supplied by a labelled controlled loopback at the structured seam (scripts/witness/flagship/c1c1-loopback-inference.ts — ⛔ not MAIA's cognition): flag off → no Ask MAIA, no panel, no editorial request, zero rows, 6/6; flag on → selection commissions nothing, the composer opens with no request, Submit settled the dirty section through the existing save lane BEFORE the passage opened at the exact held range with the post-settlement revision and the gesture posture, exactly one discourse turn under latitude 1 / no removal / no immediate proposal, one chain · one thread · two turns · zero proposal versions, manuscript bytes unchanged, the panel showing the exact ask and the last admitted MAIA turn under a single Discuss tab, Release with zero vertical movement and no cancellation vocabulary, a slow reply not attaching after a section move, an edited locus rendering the stale disclosure with no highlight and no re-read, two synchronous submits producing one open and one turn, Sanctuary and unresolved posture refused locally with no POST, the phone sheet carrying the held passage, 24/24. C1B walk re-run on the mounted host with the flag off: 22/22. ⛔ Candidate evidence; the crumb bar now holds one 49px height in every state so the action's presence or absence cannot move the Work.
---

# Soullab Studio — flagship composition

## Current route authority — EC1, 2026-09-23

This is the **sole current Experience Contract for the composition mounted at `/writers-studio/rebuild`**.

Its standing composition law is unchanged: the manuscript is primary; MAIA is contextual, anchored, and dismissible; MAIA is **not a permanent pane**. The shared `RebuildWritingBoundary` and `RebuildAuthoredBody` are named in this contract because the live flagship host mounts them as its existing authorship substrate; EC1 changes none of their save or writing authority.

The 2026-09-16 legacy rebuild contract remains historical evidence for the composition it witnessed and for the legacy surfaces it still names. It is not a second current composition authority for this route.

## What this room is for

The writer is inside the Work. Write is the room; Develop and Review are modes of the same shell, reached only when they are real. MAIA arrives at the writer's exact place, above the manuscript, and leaves without moving it.

## What the live Write host asserts (C1B)

- The manuscript surface is the proven `RebuildAuthoredBody`, bound to the one writing session the boundary creates. Nothing about saving, version concurrency, stale-base refusal or capture-before-unmount is re-implemented in flagship code.
- Status is the session's own state: Unsaved · Saving… · Saved · v{n} · Save unavailable · Needs attention. The controlled witness's fixture phrase never reaches the live runtime.
- Navigation names Write and Review (R1-1C succession, 2026-09-23 — the C1B statement "only Write, as orientation" is the predecessor state, superseded and not deleted). Develop is not named until it exists in the flagship runtime. No link to the legacy rooms.
- The Work name and its form appear only when the member declared them; a missing fact is omitted, never invented.
- Aa · voice note · Comment · More · facet · Pure Canvas are not drawn: each keeps its substrate behind its own route and returns to this room only with a lawful action behind it.

## URL state and navigation law (R1-1C — Review navigation succession)

The flagship route carries exactly three kinds of state in its URL, and nothing else decides where the writer is:

- `m=<manuscript/Work identity>` — which Work.
- `s=<draft-section id>` — the place within the Work (WS2-05A: identity, not position; replaced, never pushed).
- `reading=<explicitly selected durable reading>` — Review of exactly that reading, through the R1-1B runtime (member-owned ledger → the one reading → the R1-0 mapper → `ready`, or one calm unavailable state).

Visible navigation names **Write** and **Review** on both orientation surfaces (rail and mobile), the current destination as non-interactive orientation, the other with its lawful action behind it. Nothing else is named: no Develop until it exists, no legacy room, no second shell, no second state store.

- **Absence of `reading` is not implicit permission to select a reading.** Choosing Review with no reading selected enters the reading chooser: the member-owned ledger's own metadata (lens, day frozen, observation count), in the ledger's own order, nothing pre-chosen, nothing from inside any reading. The member's explicit choice becomes `reading=<exact id>`; R1-1B takes over. Never newest, first, latest, best, nearest, latest-per-lens or "current". A ledger row that produced no reading is shown as that fact and is not a link. An empty ledger is one sentence, never an offer to commission.
- A direct `reading=<id>` link never passes through the chooser. An unavailable, foreign, stale or unknown reading is the R1-1B unavailable state; navigation adds no fallback.
- Choosing Write from Review removes only `reading`; `m` and `s` are preserved. Nothing about the Work or the member changes by moving between Write and Review.
- Ordinary Write makes no reading request. The ledger is read only when the chooser is open; the reading only when `reading` is present.
- The R1-1A read-only capability set (Ask MAIA · Discuss · Explore · commission · acknowledge · own observation · navigate · facet all withheld) is unchanged by navigation; lens tabs filter already-loaded material and commission nothing.

## Review → manuscript section navigation (R1-2)

A mounted finding returns the writer to the manuscript at exactly its durable section: `reading` removed, `m` kept, `s=<that section>` — the R1-1C composer then the WS2-05A composer, nothing else. Plain Write mounts at that section; no trail, no banner, no held passage, no selection, no highlight, no member state. Browser Back returns to the exact prior Review through ordinary history.

- The address is the finding's durable `returnTo.sectionId`, already proved present in the current context before the reading mounted. Never a displayed position, an index, the nearest section, the section in focus, a heading, the finding's text or any similarity. A control without an exact durable section address is absent, never a guess.
- `navigate` is the one read-only capability that moved (true); Ask MAIA · Discuss · Explore · commission · acknowledge · own observation · facet stay withheld.
- Of the controls the shared `navigate` capability governs, three classes carry exact addresses and navigate in the live host: the finding's *Go to passage*, the context pane's *Go to passage* (the selected finding's own section), and continuity-map cells whose address is an exact section of the mounted context. The coverage line's *What MAIA read*, the stale reading's *previous reading* and *Open the full manuscript* name no section and are absent under live navigation. The R1-0 mapper builds no continuity map for real readings, so map cells are presentation-law only until a mapper act supplies addresses.
- Writer-facing copy never shows an identifier or a parameter name.

## What the live Write host asserts (C1C1 — Discuss-only contextual MAIA)

- The editorial flag is read once on the server by `page.tsx` and handed down as presentation state. Off: nothing of this section is drawn and no editorial route is ever called. The client never infers the flag.
- Selection is not a commission. Holding a passage only exposes Ask MAIA; opening the composer calls nothing and stores nothing. Submit of the member's own text is the commissioning act.
- At Submit, in order: a synchronous in-flight guard; the member's current Sanctuary posture read at the gesture (unresolved or Sanctuary → refused locally, nothing sent, and the copy says so); the existing writing session settled through its own flush and status; the revision read only after settlement; the passage relationship opened at the exact held range; exactly one discourse turn under the withholding scope. Never a manufactured ask, never a retry.
- The panel is the pure contextual seam the controlled witness also renders: the held passage echoed on a phone, the exact ask, the last admitted MAIA turn as speech, one tab (Discuss), Release. No Observation / Reasoning / Teaching is manufactured from a reply; no Apply · Undo · Revise · Reason · Teach · coverage · second composer is drawn.
- A response attaches only to the gesture that commissioned it, on the section still in focus; moving sections or releasing lets the server act finish on its thread without it ever rendering here.
- Before an answered response renders as attached, its locus must occur exactly once in the live body; otherwise the panel discloses that the response belongs to the passage before the latest edit, the highlight is withheld, and nothing is re-read or re-anchored.
- Release hides. It never claims to cancel, because nothing in flight is stopped.
