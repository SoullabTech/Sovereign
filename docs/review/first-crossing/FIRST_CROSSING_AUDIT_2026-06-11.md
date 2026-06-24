# First-Crossing Audit — "Add your first person" → client exists

**2026-06-11 · READ-ONLY (no code changed). Goal: make the first crossing effortless.**

Traces the deployed practitioner first-crossing from the reveal's "Add your first person" CTA to a
client existing in My People. Screenshots captured at iPhone width (390×844). Code refs valid on
`clean-main-no-secrets` (= production).

## Journey map — 5 taps

1. `/studio` zero-state → tap **"Add your first person"** → routes to `/studio/clients`
   (`app/studio/page.tsx:88`).
2. `/studio/clients` renders a **clients list** (empty: "No clients found"), **not** the modal. The
   **"Add Client" button is clipped off the right edge** on mobile (screenshot 2). Tap it → opens the
   modal (`app/studio/clients/page.tsx:165`; `showNewClientModal` defaults `false` at `:65`).
3. Modal opens. Fill **Name\*** + **Email\*** (required; `:447`/`:461`).
4. **Scroll the modal to reach the submit** — on a real iPhone this fails (device-confirmed).
5. Tap **"Add Client"** submit (`:553`) → `POST /api/studio/clients` → on success the new client is
   **prepended to the list + the modal closes** (`:103-105`) → appears in My People. *(Success
   feedback is genuinely good.)*

## Friction, ranked

| Severity | Issue | Cause |
|---|---|---|
| **BLOCKING** | Submit button unreachable on real iPhone | Modal card `max-h-[90vh] overflow-y-auto` (`clients/page.tsx:436`) uses **static `vh`** (≠ Safari's smaller *visual* viewport); footer **not pinned** (the header is `sticky top-0` `:438`, the actions row `:551` is not); bottom-nav `sticky bottom-0 z-50` (`app/studio/layout.tsx:337`) sits at the **same z-index** as the modal overlay (`:426`) and paints over its lower edge; **no `env(safe-area-inset-bottom)`** anywhere. |
| **HIGH** | "Add Client" primary action **clipped off-screen** on the clients list | The header row (Import + Add Client) and the filter tabs overflow 390px; the action button runs off the right edge (screenshot 2) — the practitioner's main action is half-hidden *before* the modal. |
| **MEDIUM** | Extra tap — the CTA lands on the **list**, not the modal | No `?new=1` / auto-open; 5 taps where 4 would do. |
| **LOW** | Silent disabled submit (no "why"); `alert()` on error (`:107`) | polish. |

## Honest caveat on the screenshots

The headless capture (no Safari chrome) is **optimistic** — frame 4 shows the submit *does* appear
after scrolling at 390×844. A real iPhone is worse: Safari's dynamic toolbar + home-indicator
safe-area + the `90vh`-vs-visual-viewport gap + the sticky `z-50` nav keep the submit under the
chrome, and the modal "doesn't scroll up" to it (device report). **The fix targets the real-device
failure, which headless can't fully reproduce.**

## Recommended smallest fix

1. **The blocker (must):** in the modal card (`clients/page.tsx:436`) — `max-h-[90vh]` →
   `max-h-[100dvh]`; make the form body the scroll region; **pin the footer** (wrap actions `:551` in
   `sticky bottom-0` + bg + `pb-[env(safe-area-inset-bottom)]` + bottom-nav clearance); raise the
   overlay to `z-[60]` (above the `z-50` tab bar). → submit always visible, any device.
2. **Header overflow (should):** let the clients header wrap/shrink on mobile (flex-wrap / responsive
   button sizing / icon-only on narrow) so "Add Client" is fully visible and tappable.
3. **Save a tap (optional):** CTA passes `?new=1`; `/studio/clients` reads it via `useSearchParams`
   and auto-opens the modal → 4 taps. (Net-new param.)

**Blast radius:** #1 + #2 are CSS/layout-only, scoped to `app/studio/clients/page.tsx` (+ maybe a
shared modal/footer class). No schema, no API, no reveal changes. #3 adds a tiny param read.

## Answers to the 6 audit questions

1. **CTA route:** → `/studio/clients` (a list; not the modal). 2. **Reachable on mobile?** Page yes;
**completion no** — submit hidden (blocking). 3. **Taps:** 5 (4 if auto-open). 4. **Dead ends:**
hidden submit (blocking); silently-disabled submit; `alert()` errors. 5. **Completable cold?** Partly
— trigger/fields/success are clear, but the unreachable submit + clipped button defeat it on iPhone.
6. **Smallest fix:** above.

## Screenshots (390×844, captured this audit; uncommitted review artifacts)

- `1-reveal-cta.png` — the invitation
- `2-clients-list.png` — **the clipped "Add Client" button + overflowing filter tabs**
- `3-modal-top.png` — modal opened (form)
- `4-modal-scrolled.png` — submit area (headless-optimistic; real device hides it)

*No code changed (read-only). Authorize and I'll implement #1 (+#2) on a scoped branch, verify
against dvh/safe-area constraints, and open a PR — same discipline as #401.*
