# Arrival Threshold — exploration

**Status:** ⛔ non-authoritative drafts. Nothing here is adopted, approved, or implemented.
**Opened:** 2026-08-28, step 3 of the authorized cinematic-lane sequence.
**Ruled:** 2026-08-28 — A rejected as final, B rejected, C retained as structural donor.
Treatment **D** built from that ruling. See
[`RULING_2026-08-28_TREATMENT_SELECTION.md`](./RULING_2026-08-28_TREATMENT_SELECTION.md), which
also records two corrections to the material below: the filled gold button in A and B was an
invention of these mockups (the shipped primary is navy `#1E3A5F`), and A/B/C all under-showed the
door — the real `/signin` carries five ways in, which only D renders.

| File | Status |
|---|---|
| [`treatment-d-resolve.html`](./treatment-d-resolve.html) | current candidate — C-derived, one settling gesture, real action set |
| [`reference-shipped.html`](./reference-shipped.html) | static **reproduction** of the shipped arrival for comparison — not a capture |
| `treatment-a/b/c-*.html` | superseded; kept as the record the ruling was formed against |

Renders for D and the reference at 390 · 768 · 1440 · 1728 are in [`shots-d/`](./shots-d/).

Open [`index.html`](./index.html) in a browser. Treatments A, B and C are self-contained files.

## Why these live here and not in `app/`

`scripts/check-design-canon.ts` scopes to `^(app|components)/.*\.tsx$`. Exploration under
`docs/design/**` is therefore **gate-free by design** — the same precedent as
`docs/design/author-studio/phase-b/*.html`. Exploring costs nothing; **adopting** pays the full
Experience Contract price. That asymmetry is deliberate: it buys wide looking and narrow shipping.

## What is fixed across all three

Not variables, so the comparison is about the threshold and not about brand drift:

- Soullab Core palette from `docs/canon/SOULLAB_THEME.md` (navy foundation, gold as signal only).
- The shipped arrival ground — navy cosmos with the plum bloom — as it exists today in
  `components/auth/UnifiedAuth.tsx`.
- The real content of the front door: emailed code primary, biometric return, password recovery,
  "New to Soullab? Begin Journey".
- **The orientation floor** (`SOULLAB_MOTION_GRAMMAR §3`) — the email field is present and legible
  in the first painted frame in all three. No introduction is gated.
- **One reduced-motion switch per file**, set on the shared token, never per call site
  (`§5.1`, the measured lesson from `components/journal/room/tokens.ts`).

## What varies — one motion meaning each

| | Primary gesture | Meaning claimed (`§2`) |
|---|---|---|
| **A · Threshold** | ambient light rises; the surface resolves out of the dark | attention + transformation |
| **B · Living Field** | three depth planes separate under the pointer; surface advances on entry | depth + relationship |
| **C · Quiet Arrival** | the mark answers focus; nothing else moves at all | relationship |

C exists to keep the canon honest. `§2` says that when a surface has nothing to say in the four
registers, *the correct amount of motion is none*. A lane that produced only cinematic options
would have quietly repealed that clause on its first outing.

## Rendered, and what the renders showed

Rendered 2026-08-28 in Chromium at 1440×900, 390×844, and again with
`prefers-reduced-motion: reduce`, at 2× — see [`shots/`](./shots/). No console errors; no
horizontal overflow at any viewport. **These are exploration renders, not contract evidence.**
Step-6 witness lives in `docs/design/contracts/screenshots/` and is taken of the real implemented
surface; nothing here can be promoted into that slot.

Three observations from looking at them, offered as findings rather than recommendations —
step 4 is the founder's:

1. **B does not survive its own still frame.** Side by side, B's desktop render is nearly
   indistinguishable from A's: its meaning is depth, depth is carried by parallax, and parallax
   does not exist in a screenshot. Under `reduce` it collapses to A with the light switched off.
   That is `SOULLAB_MOTION_GRAMMAR §3.2` — *no motion is load-bearing for comprehension* — brushing
   against the exploration that was meant to demonstrate it. B is not disqualified; a threshold
   may legitimately have a quality only present in use. But it must be judged in a browser with a
   pointer, never from these images, and it is the weakest of the three on the floor it must meet.
2. **C reads better on the phone than on the desktop.** At 390px the left-aligned column, the
   ruled input and the serif line compose as one editorial page. At 1440px the same column floats
   in a large empty field with the mark stranded above it. If C is chosen, the desktop composition
   is unfinished work, not a detail.
3. **The filled gold button in A and B is loud.** `SOULLAB_THEME §3` permits accent on a primary
   action — it is signal, not decoration — but a full-width `#D4AF37` fill is the brightest thing
   on a surface whose first principle is *containment before stimulation* (§1). C's outlined
   variant holds the same signal at a fraction of the volume. Worth resolving whichever treatment
   wins.

## Known limits of these drafts

- The Holoflower is a 12-petal SVG stand-in, not `components/ui/Holoflower.tsx`. Judge composition
  and motion here; judge the mark itself in the real component.
- Static markup: no auth, no code entry, no error states, no returning-member path. The full
  threshold has states these files do not show.
- Fonts fall back to system serif/sans — Spectral is referenced, not loaded, so the rendered
  headings are Georgia/system serif rather than the real face.
- Rendered in headless Chromium only. Not seen on a physical phone, on cellular, in Safari, or in
  the iOS WebView — where the Capacitor traps in `CLAUDE.md` live.

## What happens next

Step 4 is the founder's: choose one, choose a hybrid, or reject all three. Only after that does
anything reach `app/` or `components/` — and when it does, `arrival-threshold.md` requires desktop
and mobile witness on disk plus a recorded experiential verification before the commit can land.
