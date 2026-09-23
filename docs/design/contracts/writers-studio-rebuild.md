---
room: Writer’s Studio — Experience Rebuild
human_activity: inhabiting a creative work with MAIA present at the same visible movement, section, scene, passage, stanza, lyric, or other authored locus
surfaces:
  # EC1, 2026-09-23 — CURRENT JURISDICTION NARROWING.
  # The broad rebuild/** claim historically covered the mounted 2026-09-16
  # composition. The current /writers-studio/rebuild route is now flagship-
  # governed, so this contract retains only the unmounted legacy composition
  # artifact and its historical stylesheet inside that directory.
  - app/writers-studio/rebuild/RebuildStudioClient.tsx
  - app/writers-studio/rebuild/rebuild.css
  - app/writers-studio/develop/**
  - app/writers-studio/insight/**
  # Shared by Write and Develop: one continuous manuscript surface. D5 adds an
  # optional read-only evidence highlight; editing behavior remains unchanged.
  - app/writers-studio/canvas/WholeManuscriptSurface.tsx
  # Supporting material belongs to the same Writer's Studio ecology, but it
  # remains source material unless the writer explicitly brings it to a Work.
  - app/writers-studio/canvas/MaterialsDrawer.tsx
  - app/writers-studio/sources/**
  - app/writers-studio/studioMap.ts
  - app/writers-studio/studio/StudioModeBar.tsx
  # Shared orientation chrome used by the rebuild room. B0 repairs existing
  # token references only; these surfaces already serve this room's place and
  # movement awareness and acquire no new interaction or visual language here.
  - app/writers-studio/studio/PlaceInWork.tsx
  - app/writers-studio/studio/StudioMovements.tsx
  - app/writers-studio/workContext.ts
  # WS-EDITORIAL-SCOPE-01, 2026-09-20. The editorial thread conversation on the
  # Canvas was named by NO contract — the canvas contracts name explicit files
  # and this one was not among them, so a member-facing surface where MAIA
  # proposes changes to the writer's words was governed by nothing. It belongs
  # to this room by its own human_activity: MAIA present at the writer's locus.
  - app/writers-studio/canvas/EditorialConversation.tsx
  # SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1, 2026-09-23. The Canvas's own
  # editorial-open gesture lives here and was named by NO contract. E1 makes
  # that gesture read the member's current Sanctuary posture and refuse
  # honestly when it cannot; the gesture belongs to the same room as the
  # conversation it opens.
  - app/writers-studio/canvas/CanvasClient.tsx
  # The mode bar was already named in shared_with_house and was covered by no
  # surface glob, so the room shared a component no contract governed. D1 makes
  # it the bar this room actually renders, which is what surfaced the gap.
  - app/writers-studio/studio/StudioModeBar.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — member attention and explicit acts govern what MAIA may act on
  - MAIA_SOVEREIGNTY_INVARIANTS — member agency outweighs system momentum
  - STUDIO_COPY_VOICE — describe what the writer can do, not implementation taxonomy
  - SOULLAB_THEME §3 — accent marks meaning and live state, not decoration
reference_surfaces:
  - docs/programme/WS-DEVELOP-WORKBENCH-01_DESIGN_CONSTITUTION_2026-09-16.md
  - docs/programme/WRITERS-STUDIO-EXPERIENCE-REBUILD-01_TARGET_STATE_2026-09-16.md
  - docs/programme/WRITERS-STUDIO-EXPERIENCE-REBUILD-01_PACKAGE_2026-09-16.md
  - docs/programme/WS-SOURCE-INTAKE-01_2026-09-16.md
  - docs/design/contracts/writer-worktable-section-native.md
  - docs/design/contracts/studio-home.md
shared_with_house: Soullab atmosphere tokens · Press serif for the writer’s work · restrained gold as state and action · human-language gestures · the Writer’s Studio mode bar
distinct_to_room: three permanent regions — the Work’s own shape, the authored material, and MAIA — organized around one canonical Focus. The current Elemental Alchemy slice renders book language because this Work is a book; the shell may not make book structure the ontology of every creative form. Review and local work are two grains of one relationship, never separate conversation products. The visible authored place and MAIA’s subject must be the same place.
screenshot_desktop: docs/design/contracts/screenshots/writers-studio-rebuild-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writers-studio-rebuild-mobile.png
experience_verification: >-
  LOCAL BROWSER WALK, 2026-09-16, against the rebuilt route with controlled Chapter 10 fixture data shaped from the real Living Work topology. Desktop 1440x900 and mobile 390x844 in Google Chrome. Desktop verified three non-overlapping regions and the visible Review this chapter action. Mobile verified explicit Outline / Manuscript / MAIA navigation and return. REVISION COLLABORATION WITNESS: selected the exact sentence ‘To be human is to move through cycles.’ directly in section II, verified the persistent amber hold, visible passage scope, Suggest flow, MAIA response, Show changes, explicit Apply revision, and continuity address carrying both section and exact editorial thread. Manuscript scrollTop remained 0 before suggestion, after suggestion, and after apply; only the selected text changed and the neighboring section retained the original wording. NATIVE WRITING + PURE CANVAS WITNESS: typed directly in section II through the rebuilt manuscript surface, observed serialized saves advance the same draft v5→v6, entered Pure Canvas with no save or identity fork, continued writing to v7, returned with Escape to the same Workspace and exact body, then typed again and immediately asked MAIA. The witness proved the latest writing saved to v8 before the Focus request crossed to cognition. Mobile repeated the Pure Canvas transition and saved another line to v9; outline, MAIA, global header and mobile navigation were absent while expanded and returned intact with the same Work. Captures: writers-studio-rebuild-revision-desktop.png, writers-studio-rebuild-writing-desktop.png, writers-studio-rebuild-pure-canvas-desktop.png, writers-studio-rebuild-writing-mobile.png, writers-studio-rebuild-pure-canvas-mobile.png. The real production manuscript was separately measured read-only: Chapter 10 is positions 198–221, 24 sections. No production mutation had occurred during these local witnesses.
---

# Writer’s Studio — Experience Rebuild

## Current standing — EC1, 2026-09-23

This contract preserves the **historical legacy witness** and continues to govern only the legacy/unmounted composition and the explicitly named legacy Writer’s Studio surfaces in its frontmatter.

It no longer governs the composition mounted at `/writers-studio/rebuild`. The sole current Experience Contract for that mounted flagship route is:

`docs/design/contracts/flagship-studio.md`

Accordingly, the historical law **“three permanent regions — the Work’s own shape, the authored material, and MAIA”** remains evidence of the composition witnessed on 2026-09-16, but is **superseded for the currently mounted `/writers-studio/rebuild` experience**. Nothing in this reconciliation reinterprets that historical witness as an error or as evidence of the later flagship design.

## What this room is for

The creator comes here to stay inside the Work while MAIA reads and works beside it. The primary activity is not managing Studio machinery; it is entering deep creative presence, sensing the Work as a living whole, moving directly to the part that calls for attention, and developing exact language without losing place. The room must support the structures of nonfiction, fiction, poetry, memoir, plays, screenplays, songs, lyrics and other authored forms without forcing them into book vocabulary.

## Historical canonical cutover — witnessed 2026-09-16

The following standing is preserved verbatim as historical evidence of the legacy composition; it is not the current route-authority statement after EC1:

The rebuilt room is the canonical **Write** destination for Writer's Studio navigation and the return destination from MAIA handoffs. The legacy `/writers-studio/canvas` route remains temporarily available only as a rollback surface; ordinary Studio navigation no longer leads there.

## Arrival

> **You are inside the Work. MAIA is here with you.**

The room names the Work, its current authored place, and the current Focus before any MAIA act. Navigation follows the Work’s own form — chapter, scene, act, movement, stanza, sequence, song section, or another member-authored shape — rather than a numbered database list. Scope is visible and adjustable; it never changes silently.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Read the chapter as a whole | Review this chapter | Names the writer’s intent, not a model invocation |
| Move into a section | Select the section or finding | Direct manipulation; no hidden mode change |
| Write | Click into the Work and type | The manuscript stays the manuscript; persistence is quiet |
| Remove distractions | Pure Canvas | The Work expands while the same writing session, Focus, and save queue remain |
| Return from Pure Canvas | Workspace / Escape | One quiet way back; no mode reconstruction or lost place |
| Work locally with MAIA | Interpret · Suggest · Explore · Ask | Writer verbs, all consuming the same Focus |
| Compare language | Show changes | Reveals difference without changing the Work |
| Change the manuscript | Apply revision | Explicit authority act on the visible passage |
| Return to the larger reading | Back to chapter findings | Preserves continuity rather than opening another room |

## Forbidden here

- a second editorial room or “exact passage mode”
- hidden locus substitution or fallback to another section
- exposing proposal-chain, thread, authorization, or database vocabulary to the writer
- a permanent lower dashboard competing with the manuscript
- fake findings or placeholder intelligence presented as MAIA output
- ghostwriting that silently transfers authorship from creator to system
- false deference that withholds useful critique, edits, direction, education, or craft guidance
- treating chapters and sections as universal creative ontology rather than one Work form
- chrome, motion, or ornament that competes with the Work instead of deepening presence
- silently widening a section/passage act to the whole Work

## The two brand tests

**Same house?** Yes. The rebuild keeps Soullab’s atmosphere system, Writer’s Studio mode language, Press/manuscript typography, restrained accent law, and member-first authority model.

**Distinct room?** Yes. This is the place where a creator inhabits a Work with MAIA continuously present. The authored material remains primary; MAIA’s review, interpretation, suggestions, and revision tools unfold beside the exact material being worked on rather than replacing it. The emotional standard is quiet wonder: generous space, beautiful typography, restrained atmosphere, and enough stillness that the creator notices the Work more deeply rather than noticing the software.

## Extensibility without dilution

The Studio may appear inside classrooms, workshops, cohorts, retreats, coaching practices, schools, and other creative communities. Those contexts wrap the creative room; they do not redefine it.

- **Atmospheres** support state and presence. They are chosen, never inferred, and may vary by creator or host.
- **Classrooms and workshops** may hold prompts, schedules, shared readings, facilitator notes, invitations, and group moments. A participant’s writing relationship with MAIA remains individually centered and private unless they explicitly share work.
- **Host branding / white-label presentation** may change the outer identity of a hosted space — name, logo, welcome copy, palette, selected atmospheres — without changing MAIA’s constitutional behavior, authorship safeguards, memory boundaries, provenance, or member ownership.
- **Creative form remains native.** A workshop for poets does not inherit chapter language; a screenplay room does not inherit prose assumptions; a songwriting room does not become a document editor with different labels.

The expansion test is simple: if adding a host, cohort, theme, or brand makes the creator more aware of the software than of the Work, the extension has gone too far.

## Source intake addendum — evidence boundary

`WS-SOURCE-INTAKE-01` extends this Studio ecology to material that exists before or beside the manuscript: photographed notebook pages, scans, notes, drafts, and references. The governing distinction is **bringing material into a Work does not make it manuscript**. Custody, transcription review, and belonging are separate writer acts. OCR is a draft-producing instrument only; the writer reviews handwritten/scanned transcription before it may cross into a Work, and the Work relationship is always an explicit member gesture.

The screenshots named in this contract predate this source-intake slice and evidence the canonical rebuilt **Write** room only. They are retained because that is the room this slice must remain visually subordinate to; **they are not claimed as a visual witness of `/writers-studio/sources`.** The source-intake room currently has structural tests, route tests, a real local image-OCR witness, and a real scanned-PDF OCR witness. An authenticated desktop/mobile browser walk of the source-intake room remains **OWED before production acceptance**, as does a recognition-quality witness using real handwriting rather than the rasterized text specimen used to prove the local OCR execution path. This contract records that evidence boundary rather than retroactively treating an older screenshot as proof of a new surface.

## The writer’s-guide ethic

MAIA’s purpose here is not to make the writer sound more like MAIA or more statistically fluent. She should help the creator become more fully themselves on the page while making the Work more effective on its own terms.

“Better writing” is therefore evaluated in relation to the creator’s own voice, intention, form, audience, desired effect, and the Work’s established character. Guidance may sharpen craft, clarity, structure, rhythm, dramatic movement, imagery, coherence, accessibility, or reader experience, but it must not silently homogenize style.

The Studio should preserve the conditions in which a person can feel witnessed by their own Work: deep attention, privacy, continuity, authorship, and enough quiet that the act of creating remains human.

## Expanded editorial canvas — 2026-09-17

Work on canvas expands the existing Write/Develop relationship temporarily, preserving the underlying manuscript and place. It is not a second editorial authority. All cited passages may be compared, but only current digest-verified evidence can select a revision. Develop remains manuscript-read-only; Write uses the existing member-version and explicit adoption contracts.

Intention, reader experience, alternatives, proportion, rhythm, examples, and voice guide the exploration. Inspiration uses the declared Work purpose. Gold lines are explicitly chosen owned Keeps with visible provenance. No inference or manuscript write occurs merely by opening the workspace.

Chromium and WebKit controlled-component witnesses cover desktop and 390px mobile, keyboard return, preserved drafts/scroll, exact member-version adoption, stale-predecessor rejection, and multi-passage handoff. These use controlled API fixtures, not production manuscript mutations. The earlier screenshots above remain evidence of the underlying room; the new reproducible witness is scripts/witness/insight-canvas, and its acceptance/evidence record is docs/programme/WS-INSIGHT-CANVAS-01_2026-09-17.md.

Evaluate support through the writer clarifying intention, comparing alternatives, preserving voice, completing a chosen revision, and testing intended effects with readers. Time spent, interaction volume, and accepting MAIA suggestions are not measures of creative success.

## Related-passage comparison repair — 2026-09-17

Comparison cards keep verified excerpts together with the writer’s intention and reader experience. Full sections are explicitly expandable. Unverified references have their own evidence explanation; a current reading label alone never authorizes markers or revision. Exact stored heading prefixes are preserved for verification and removed from evidence coordinates only after verification. Desktop comparison and stacked mobile behavior are covered by the controlled Chromium/WebKit witness. See docs/programme/WS-INSIGHT-COMPARISON-REPAIR-01_2026-09-17.md; production acceptance remains pending.
