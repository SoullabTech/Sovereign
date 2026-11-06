# LISTEN-79 — "Listen to someone": performer shelf, slice 1 (web, no database, empty catalog)

**Status:** review candidate · slice 1 of 5 (two commits: logic and tests, then UI with its contract) · **production HOLD** · behind the existing `SOULLAB_LISTEN_REVIEW_ENABLED` flag (unchanged, off)
**Stacked on:** `feature/listen-native-audio-session-20261030` @ `f970d347b` (= `fix/listen-1999-reconcile-20261106`; the #1999 work, merged within the stack, **not** on `clean-main-no-secrets`)
**Owner lane:** LISTEN-01 #1979 · supporting authority AUDIO-PLATFORM-01 #1984. No second owner, lane or release train is created: this is a reviewable child branch (`feature/listen-performer-shelf-20261106`) whose PR, if opened, targets the stack — **never** `clean-main-no-secrets`.
**Founder direction:** 2026-11-06 — build resumed; **no performer is contacted or invited until the feature has been beta-tested safely.** Design notes and decisions live in the founder's untracked drafts (`docs/programme/LISTEN-01_*_DRAFT_2026-11-06.md` in the main checkout); this record covers only what this branch changes.

## What it adds

| File | Role |
|---|---|
| `lib/listening/performerCatalog.ts` | The catalog types and a **fail-closed gate** made of named single-decision rules (`PERFORMER_RULES`). Unknown rights, a missing or non-human signer, an overdue check, Soullab-hosted media, copied provider fields, a claim in Soullab's voice, a bad link or embed, lineage-held music as a spotlight, a Tier 2 card without its grant — each **hides** the entry. |
| `lib/listening/performerCatalogData.ts` | The shipped catalog: **a bare empty list.** |
| `lib/listening/performerPlaybackPolicy.ts` | Pure decisions: pause on a refused lease or MAIA speaking, on other outputs' preflight/focus, on interruption/route loss/backgrounding; "interruption ended" and coming back to the foreground do **nothing**. Reuses `platformAudioPolicy`; **no play/resume decision exists.** |
| `lib/listening/performerEmbedLoaders.ts` | Browser-only loaders for the YouTube and Spotify players, run only after "Play here"; adapters expose `pause()` and `destroy()` only; the YouTube player is not offered inside the native app (error 153). |
| `components/listening/PerformerEmbed.tsx` | One platform player. Takes the shared audio lease when sound starts, pauses and releases on every other state, obeys the shared bus/focus/session-end. |
| `components/listening/PerformerShelf.tsx` + `.module.css` | The "Listen to someone" section, the card (credit, Soullab's words, "In their own words" for Tier 2, "Where to find more of their work"), and the **non-interactive "In preparation" row** shown while nothing is approved. |
| `app/listen/SoundStudioNow.tsx` (+1 line, +1 type member) | The row on the Now view; `StudioView` gains `'people'`. |
| `app/listen/ListenRoom.tsx` (+2 lines, +1 import) | Renders the shelf for `view==='people'`; `'people'` maps to the Now tab so **the mobile tab bar is unchanged (still five)**. |
| `docs/design/contracts/sound-studio-listen-to-someone.md` + 4 screenshots | The Experience Contract the design-canon pre-commit gate requires for the three member-facing files. It states plainly what was and was not verified: a **static render** of the real room components in headless Chrome (desktop and 390px mobile emulation) — **not** a walk through the authenticated `/listen`. Two screenshots show the shipped state (only the "In preparation" row); two show **fictional fixtures** that do not ship. |
| `tests/listening/listen79…81` | Gate + policy with lethality matrices; source guards; jsdom behaviour witness. |

## What it deliberately does not do

No database or migration · no native code · no deploy, merge to canonical or flag flip · no performer, member or provider data (the catalog is empty and fixtures are fictional) · no provider OAuth or Web API · no Soullab-hosted audio or video · no provider artwork or metadata · no counts, rankings or listening records (nothing stored, sent or shown, to MAIA or anyone) · no Members shelf, suggestion form, Mixes, Helper Fund path or invitation (later slices, each needing its own go).

## Laws and their witnesses

| Law | Witness |
|---|---|
| The shipped catalog names no one | `listen79` asserts the list is empty (a signer's act changes it, with a deliberate test edit) |
| Every rule has a falsifier **and a defeat candidate** that dies on it | `listen79` — 19 rules and 27 falsifiers, each "gate minus one rule" killed by its own falsifier; 10 policy falsifiers and 10 flipped-decision candidates, each killed |
| Soullab never starts a performer's sound | `listen80` source guards (no `play`/`resume`/`playVideo`/`loadVideoById`/`autoplay:1`/own audio element) **and** `listen81`'s fake player has *no play method*, so any call would throw |
| The lease is taken before sound is kept; refused ⇒ pause | `listen80` ordering guard; `listen81` busy-lock and no-Web-Locks cases |
| MAIA speech, Reader, Writer, other music ⇒ pause and free the lease | `listen81` (preflight from another tab, focus event, MAIA speech lease) |
| Nothing restarts by itself | `listen81` (no sound after a pause until the member presses play) |
| Nothing is requested from a platform before "Play here"; no network in the shelf | `listen80` + `listen81` |
| No listening data is stored, sent or shown; nothing reaches MAIA or its memory | `listen80` import/API guards |
| The empty state is plain text — no link, button, player, image or script | `listen81` |
| Mutation checks | Breaking the component two ways (refused lease keeps playing; bus ignored) fails 5 and 2 witness tests respectively; a hostile `playVideo` line fails the guard |

## Evidence

- `node --experimental-strip-types --experimental-loader ./tests/listening/ts_resolution_loader.mjs --test tests/listening/listen79_performer_catalog.test.mjs tests/listening/listen80_performer_shelf_guards.test.mjs tests/listening/listen81_performer_shelf_render.test.mjs` → **34 pass · 0 fail** (11 + 11 + 12), clean exit.
- Strict standalone typecheck (`strict` + `noUncheckedIndexedAccess`) of the new files and the two edited room files: **0 diagnostics in any new or edited file**; 10 diagnostics remain in **untouched** neighbours (`FocusSoundPicker`, `SoundStudioField`, `PersistentListening*`, `focusFieldGuide`, `soundStudioExperience`), pre-existing under that flag.
- Project gate `npm run typecheck` (run on the exact `package-lock.json` dependencies via `npm ci --ignore-scripts`): **FAILS identically on the untouched base and with this slice** — **268 errors vs the recorded baseline of 239, 46 "new" diagnostics, in both runs**; the two diagnostic lists are identical, none is in a file this slice touches, and **this slice adds 0 diagnostics.** The stack's `typecheck-baseline.json` is stale relative to the stack's code; fixing it is **not** part of this slice and was **not** done (the baseline must not be re-recorded to absorb errors). *(An earlier run on dependencies borrowed from another checkout showed one extra Stripe-version diagnostic; that was an environment artifact and is gone with the locked install.)*
- `npm ci --ignore-scripts` leaves a real, git-ignored `node_modules` in the worktree.

## Not witnessed — owed before any entry is shown to a member

1. **A real-browser witness** (Chrome and WebKit) against the real YouTube/Spotify players. `listen81` is **jsdom with a fake player**, not a browser. A separate Safari-simulator and iPhone test of the *platform players* (outside this repo, 2026-11-06) showed pause control works and that the standard YouTube embed **fails inside the Capacitor shell** — hence the native-app link-out here.
2. **`useAudioCoordinator` reconciliation.** AUDIO-PLATFORM-01 requires the shared core to be reconciled with `lib/hooks/useAudioCoordinator.ts` and forbids a Listening-only priority stack. This slice uses the existing LISTEN-14 lease and preflight channel exactly as `PersistentListeningProvider` does; **`useAudioCoordinator` has not been read here.**
3. **Independent Class A/R20 review.** The author cannot be the independent reviewer of its own work.
4. Counsel on embedding in a members-only app; the rights registry (#1979 §4) as the single home for signer sign-off; the founder's decision on whether `'people'` should become a sixth tab (it is not: it hangs off Now).
5. Slices S2–S5 (native sheet, Members shelf and suggestion form, Mixes, invitation/Helper Fund path) — separate go-aheads.

## Reversal

Delete the ten new files (and this record) and revert the two small hunks (`StudioView` member + one row in `SoundStudioNow.tsx`; one import, one mapping and one render line in `ListenRoom.tsx`). No data, schema, flag or configuration changes need undoing.
