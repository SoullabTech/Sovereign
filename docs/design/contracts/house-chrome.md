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
experience_verification: Founder ruling 2026-08-11 — a saturated green "Audio enabled" toast (z-index 99999) intrudes on Journal's contemplative writing surface. Residue check (2026-08-11) against the canonical Journal cutover (PR #1020, merged 04c6d6f03) found this correction absent from trunk while six other launch-relevant corrections were already present. Verified live on this tiny follow-up: authenticated session landing at /journal shows the toast suppressed; /maia shows it unchanged. The underlying audio-unlock mechanism runs unconditionally on every route including Journal, since MAIA's voice must still work there — only the visual confirmation is suppressed.
---

# House Chrome — Experience Contract (narrow: audio-unlock toast only)

## What this governs

`app/layout.tsx` mounts a first-interaction audio-unlock script for every route in
the House, ending in a green confirmation toast. **This contract governs only that
toast's suppression on Journal surfaces.** It is not a general House Chrome contract
— the rest of `layout.tsx` remains ungoverned pending its own contract when next
touched.

## Provenance

This correction was proven once already, on a parallel lane's cutover branch, but did
not land when that lane's PR was superseded by the canonical cutover (PR #1020). This
follow-up carries only the missing correction forward, verified fresh against current
trunk — not a resurrection of the superseded branch's other 31 files.

## The correction

> A saturated green `z-index:99999` system notification appearing in the middle of a
> contemplative writing environment is exactly the kind of House-level behavior an
> inhabitable architecture needs to be capable of suppressing contextually.
> — founder ruling, 2026-08-11

The toast is suppressed when `window.location.pathname` begins with `/journal`. The
audio-unlock mechanism itself is untouched and still runs on every route.

## Explicitly not done

No change to the audio-unlock mechanism, the floating MAIA handle, the bug-report
control, or the audio system generally.
