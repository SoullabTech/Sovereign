---
room: Sound Studio / Review conversation
human_activity: a named beta reviewer gives a professional review of a Sound Studio work in their own words, in a short conversation with a clearly named review guide, then checks, edits and chooses what is saved
surfaces:
  - app/listen/SoundStudioReview.tsx
change_class: experiential
principles:
  - MAIA_SOVEREIGNTY_INVARIANTS — consent for memory, no stealth memory; nothing is saved until the reviewer confirms the summary lines, the full conversation only on opt-in, and every saved review is reviewer-deletable
  - LISTEN-01 hybrid ruling (2026-11-09) — the guide is not MAIA; it is visibly named, has no memory, and never reads or writes MAIA's memory
  - Invariant 14 (cultural sovereignty) — the guide keeps the reviewer's own professional vocabulary rather than translating it into Soullab language
  - MARKETING_CLAIM_DISCIPLINE — no health, healing or brainwave questions or claims
  - INHABITABLE_ARCHITECTURE_STANDARD — one bounded human act inside the existing field; it opens only on the reviewer's request and never during playback
  - SOULLAB_THEME — the same contained field, restrained gold signal and editorial serif as the Sound Studio field
reference_surfaces:
  - docs/design/contracts/sound-studio-field.md — the room this act lives in; reuses its panel, smallcaps, ghost and danger controls
  - docs/design/contracts/daily-anchor.md — a bounded human act with restrained continuity and no optimization pressure
  - app/listen/ListenRoom.tsx "What did you notice?" — the existing private reflection, which this deliberately does not replace
shared_with_house: deep contained field, editorial serif hierarchy, restrained signal colour, human-language gestures, explicit exits (Not now, Discard and close, Discard everything)
distinct_to_room: a second named voice ("Sound Studio review · NOT MAIA"), a confirm-before-save summary where each line is labelled as heard, felt or a change, and an explicit choice to keep or discard the conversation itself
screenshot_desktop: docs/design/contracts/screenshots/sound-studio-review-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/sound-studio-review-mobile.png
experience_verification: >
  2026-11-09 ISOLATED FIXTURE WITNESS ONLY — not an authenticated live walk. tests/listening/sound_studio_review_fixture_witness.cjs
  compiles the real component with its real scoped listen.module.css, replaces the session fetch with fictional
  responses (no Next, session, database, model call or member data), and walks consent → talk → summary in local
  Chrome at 1440×1000 and 390×844. 8/8 checks pass: the consent discloses that words are sent to Claude (Anthropic);
  the summary shows three editable lines; keeping the transcript is unchecked by default; no page errors. Screens were
  viewed: a textarea overflow and monospace font at phone width were found and fixed before capture. OWED before any
  reviewer sees it: an authenticated walk on a deployed build with the flag on and a founder session, real guide
  replies, keyboard and screen-reader pass, and iPhone Safari.
---

# Sound Studio — review conversation

The review guide is a separate, named voice inside the Sound Studio field. It asks one open question at a time about
the work just heard, then offers a summary the reviewer edits and confirms. Only confirmed lines are saved. See
`docs/programme/LISTEN-01_SOUND_STUDIO_REVIEW_CONVERSATION_DESIGN_DRAFT_2026-11-09.md`.
