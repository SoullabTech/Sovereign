# PR 1 — House Navigation Contract · Acceptance Matrix

**Branch:** `feat/house-native-dispatch` (off `clean-main-no-secrets`)
**Ruling:** Kelly, 2026-07-27. Scope = navigation contract only. No page rewrites, no
Studio redesign, no expanded member access, no `/maia/*` bundling (that is PR 2).

## What changed

- `lib/navigation/types.ts` — `houseGroup?: 'worlds' | 'rooms' | 'record'` on `MaiaRailItem`; `decisions`/`changes` added to `BoundaryId`.
- `lib/navigation/maiaNav.ts` — `houseGroup` assigned to every House place; `DECISIONS_RAIL_ITEM` + `CHANGES_RAIL_ITEM` + `MAIA_RECORD` (founder-only, kept out of `MAIA_BOUNDARIES` so boundary detection is untouched); `getHousePlaces()`, `getVisibleRecord()`, and `isNativeBundled()` (mirrors `capacitor-patch-routes.sh`).
- `components/maia/MaiaHouseSheet.tsx` — native-aware `enter()`; web-only rows carry an `ExternalLink` indicator; Worlds/Rooms/Record groups; Settings moved into Rooms.
- `lib/navigation/__tests__/houseNavContract.test.ts` — 11 tests (classification, dispatch, audience). All pass; full typecheck clean; 53 existing nav/route-guard tests still pass.

## Route mode per House item (native)

`✅ in-app` = survives the native bundle → `router.push`. `🌐 bridge` = web-only → `/open-web?to=…` (Safari), with the external indicator.

| Group | Item | Route | Native mode | Audience |
|-------|------|-------|:-----------:|----------|
| Your Center | MAIA | `/maia` | ✅ in-app | all |
| Worlds | Living Field | `/maia/living-field` | 🌐 bridge | all |
| Worlds | Wisdom | `/wisdom-keepers/wisdom` | 🌐 bridge | all |
| Worlds | Astrology | `/astrology` | 🌐 bridge | all |
| Worlds | Community Library | `/maia/community/library` | 🌐 bridge | all |
| Worlds | Co-lab | `/team/for-you` | 🌐 bridge | conditional |
| Worlds | Pro Studio | `/studio` | 🌐 bridge | founder |
| Worlds | Book Studio | `/book-studio` | 🌐 bridge | founder ‡ |
| Worlds | Circles | `/commons/circles` | 🌐 bridge | founder ‡ |
| Worlds | Lab Tools | `/labtools` | 🌐 bridge | founder ‡ |
| Worlds | Vision Studio | `/maia/vision-studio` | 🌐 bridge | founder ‡ |
| Rooms | Journal | `/labtools/journal` | ✅ in-app | all |
| Rooms | Anchor | `/maia/anchor` | 🌐 bridge | all |
| Rooms | Ideas | `/maia/ideas` | 🌐 bridge | all |
| Rooms | Keeps | `/maia/keep-capture` | 🌐 bridge | all |
| Rooms | Settings | `/account/settings` | ✅ in-app | all |
| Record | Decisions | `DecisionsSheet` (in-app) | 🪟 sheet | **founder** |
| Record | Changes | `ChangesSheet` (in-app) | 🪟 sheet | **founder** |

‡ **Assumption flagged for Kelly:** Book Studio, Circles, Lab Tools, Vision Studio were in the
web-only dispatch list but not placed in any group in the ruling. They are founder-gated, so
this only affects the founder view. Defaulted to **Worlds** to avoid silently dropping them
(that would regress founder access). Confirm placement or say to hide them.

Anchor/Ideas/Keeps/Living Field are on the **bridge** in PR 1 because they are not yet in the
native bundle. **PR 2 flips them to ✅ in-app** by adding them to `MOBILE_MAIA_KEEP` *and*
`NATIVE_MAIA_KEEP` in the same change (the classifier comment enforces this).

## Acceptance standard (PR 1)

| Requirement | How PR 1 satisfies it |
|-------------|------------------------|
| Tap response | Every visible row is a real button with a handler — no inert rows. |
| Destination | Bundled → the page; web-only → the `/open-web` gate for that exact `?to=` route. |
| Route mode | `isNativeBundled(route)` (mirrors the build allowlist) chooses in-app vs bridge; asserted by tests. |
| Authentication | In-app routes keep the native session (`x-member-id`). The bridge opens `soullab.life` in Safari (its own web session). |
| Return | In-app → House Presence / back to MAIA. Bridge → the gate's "Go back" returns to the still-running app; MAIA restores from session on return to `/maia` — same as any House navigation today. |
| Conversation | Unchanged from existing House nav: navigating to any place leaves `/maia`; the transcript restores from session on return. The bridge introduces no new loss. |
| Keep | **Out of PR 1 scope** (ruling): no Keep change unless a reproduced transition proves a shared mechanism. Tracked as native-device thread 4. |
| Failure handling | No web-only route dead-taps: it lands on the gate, never a blank stripped route. The classifier is total (returns a boolean for every route). |

## Not verified here (needs the native build + device walk — Kelly)

- On-device confirmation that each ✅ opens in-app and each 🌐 opens the gate → Safari.
- Conversation restore on return from the gate (expected: same as today's House nav).
- The external indicator reads as intentional, not broken.

## Open item outside PR 1

Kelly's closing line — *"include Decisions, changes, ideas, journals, and practical free
functions in Home field"* — is ambiguous against this ruling (which gates Decisions/Changes to
founders in Record). Needs clarification on whether "Home field" = The House (already covered)
or the Arrival/home screen (a separate surface, and member exposure of Decisions/Changes would
contradict the founder-only gate). Held pending Kelly.
