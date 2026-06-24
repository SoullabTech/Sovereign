# MAIA in Zen Browser

Zen is an open-source, privacy-focused fork of Firefox with an Arc-style **web panel** —
a persistent app pinned into the sidebar. MAIA fits this surface naturally: a sovereign
companion that stays present alongside your browsing without taking over a tab.

This page covers the **sidebar companion**, which is the only Zen integration shipped in
the first pass. A Zen Mod (theme) and a Firefox extension are possible later layers, noted
at the bottom — neither is built yet.

## Add MAIA as a Zen web panel

Zen's web-panel UI changes quickly, so these steps are intentionally general. See the
[Zen user manual](https://docs.zen-browser.app/user-manual) for the current exact flow.

1. Open Zen's sidebar (the vertical panel beside your tabs).
2. Add a new **web panel** and give it this URL:

   ```
   https://soullab.life/companion
   ```

3. Pin it. MAIA now lives in your sidebar, one click away on any page.

The `/companion` route is a narrow-width surface (tuned for ~400px) that renders the **same
live MAIA** as the full app — not a cut-down demo. It shares your daily session thread, so a
conversation you start in the sidebar continues in the full app and vice versa.

### Signing in

If the panel shows "Sign in to begin," use the **Sign in** button (or sign in once in a
normal Zen tab). Identity is shared across the same browser profile, so the panel picks it up
automatically — you should not need to sign in twice.

### Opening the full app

The expand icon (top-right of the panel) opens the full MAIA app in a new tab when you want
the complete surface (journal, library, settings, voice controls, and so on).

## Sovereignty boundary — MAIA does not read your browsing

This is a hard rule, not a default that can be loosened:

> **MAIA may only receive page context when you deliberately send it.**

- **Sidebar MAIA has no page access.** It only ever sees what you type into it, exactly like
  the web app. It cannot see the tabs you have open, the pages you visit, or anything you
  haven't explicitly written to it.
- **No ambient tab-reading.** There is no silent browsing awareness and no background
  observation of your activity.
- **Future extension (not yet built):** if a Firefox extension is ever added to let you
  "Reflect with MAIA" on highlighted text or share the current page, that will require
  **explicit, per-use consent** each time, will be Sanctuary-aware, and will never read pages
  in the background.

This keeps the Zen integration aligned with MAIA's canon: consent for memory, Sanctuary Mode,
and no surveillance. (See `docs/canon/MAIA_CANON_v1.1.md` and the Sanctuary Mode invariants in
`CLAUDE.md`.)

## Why Zen specifically

Zen is open-source, Firefox-based (not Chromium/Google), and privacy-first — values aligned
with MAIA's sovereignty posture. The web-panel surface is also entirely ours to control: no
external review pipeline stands between a member and adding MAIA to their sidebar.

## Future layers (not yet shipped)

- **Zen Mod** — an official CSS theme published to Zen's Mods registry so Soullab/MAIA has a
  presence in the ecosystem. Cosmetic only; no data access.
- **Firefox extension** — a toolbar button to summon MAIA and an explicit-consent
  "Reflect with MAIA on this selection" action. Works on all Firefox-based browsers, touches
  the consent canon, and would go through Mozilla AMO review. Must honor the page-context rule
  above.
