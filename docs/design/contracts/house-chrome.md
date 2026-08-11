---
room: House Chrome
human_activity: ambient, cross-room system behavior — not a room a member arrives in
surfaces:
  - app/layout.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — House chrome must not overwhelm a room's own register
  - SOULLAB_THEME §4 — variation by function; a room may suppress ambient chrome that breaks its register
reference_surfaces:
  - docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
shared_with_house: this contract governs app/layout.tsx narrowly — ONLY the audio-unlock confirmation toast. It does not cover the file's other global behavior (providers, other chrome, other scripts), which remain ungoverned by any contract and will need their own coverage when next changed.
distinct_to_room: n/a — this is a House-level file, not a room. The correction is scoped to a single room's need (Journal), not a redesign of House chrome.
screenshot_desktop: docs/design/contracts/screenshots/house-chrome-toast-suppressed-journal.png
screenshot_mobile: docs/design/contracts/screenshots/house-chrome-toast-shown-elsewhere.png
experience_verification: Founder ruling 2026-08-11 — a saturated green "Audio enabled" toast (z-index 99999) intrudes on Journal's contemplative writing surface. Verified live at /journal and /journal/room (suppressed) and /maia (unchanged, still shown) via a real rendered-DOM check, not a script-source-text match (an earlier check falsely matched the inline script's own source code, since Next.js places this script in <body>; corrected to require an actual visible text node). Confirmed the underlying audio-unlock mechanism (AudioContext + silent Audio element) still runs unconditionally on every route, since MAIA's voice must still work inside Journal — only the visual confirmation toast is suppressed.
---

# House Chrome — Experience Contract (narrow: audio-unlock toast only)

## What this governs

`app/layout.tsx` mounts a first-interaction audio-unlock script for every route in
the House, ending in a green confirmation toast. **This contract governs only that
toast's suppression on Journal surfaces.** It is not a general House Chrome contract
— the rest of `layout.tsx` (providers, the floating MAIA handle, the bug-report
control, any other global script) is explicitly **out of scope** and remains
ungoverned pending its own contract when next touched.

## The correction

> A saturated green `z-index:99999` system notification appearing in the middle of a
> contemplative writing environment is exactly the kind of House-level behavior an
> inhabitable architecture needs to be capable of suppressing contextually.
> — founder ruling, 2026-08-11

The toast is suppressed when `window.location.pathname` begins with `/journal`
(covers both the legacy `UnifiedJournalView` route and the candidate room). The
audio-unlock mechanism itself — AudioContext resume, silent oscillator, warmed Audio
element — is untouched and still runs on every route, Journal included, because
MAIA's voice must still function there.

## Explicitly not done

- No change to the audio-unlock mechanism.
- No change to the floating MAIA handle.
- No change to the bug-report control.
- No redesign of the audio system.

The founder ruling named the toast as *the* demonstrated intrusion and explicitly
declined to turn one finding into a global-chrome redesign.

## The two brand tests

**Same house?** Yes — every other route keeps the toast exactly as before.

**Distinct room?** Irrelevant here; this is House infrastructure, not a room.
