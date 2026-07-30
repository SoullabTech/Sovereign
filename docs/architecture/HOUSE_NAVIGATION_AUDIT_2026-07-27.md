# House Navigation Audit — 2026-07-27

**Assignment (Kelly):** *"Audit and complete the House as the persistent navigation shell."*
Treat the House as the persistent operating-system menu for AIN, not an Arrival artifact.
Inventory first; code only after.

**Lineage audited:** `clean-main-no-secrets` (the device's actual lineage). The working checkout
`chore/e2e-layout-invariants` is 308 behind with a different, uncommitted impl — **not** audited.

**Sources of truth**
- Registry: `lib/navigation/maiaNav.ts` (`MAIA_WORLDS`, `MAIA_BOUNDARIES`, `MAIA_UTILITIES`)
- Renderer: `components/maia/MaiaHouseSheet.tsx` (groups: **Worlds**, **Rooms**, + Account/Settings/Help)
- Native bundle filter: `scripts/capacitor-patch-routes.sh`
- Native web bridge (exists, unused by House): `app/open-web/page.tsx`

---

## The headline

**Every House destination page exists. Almost none resolve on the native device.**

`MOBILE_TOP_LEVEL` in `capacitor-patch-routes.sh` is an **allowlist** — only listed roots survive the
iOS static export. `maia`, `labtools`, `account` are kept; `studio`, `astrology`, `wisdom-keepers`,
`commons`, `team`, `book-studio` are **absent entirely**. And `MOBILE_MAIA_KEEP=()` strips **every**
`/maia/*` sub-route. So on device, of 16 House destinations, only **Journal** and **Settings** (routes)
plus **Account** and **Help** (in-app sheets) actually work. The rest `router.push()` into routes that
were moved to `.capacitor-mobile-backup/` at build time → dead.

`MaiaHouseSheet` calls `router.push(route)` for everything with **no native/`open-web` awareness**. The
`/open-web?to=<path>` bridge (opens `soullab.life` in Safari) exists but the House never uses it. That
single gap — not any individual broken link — is why "the House has no active connections" on device.

---

## Inventory

Legend — **Native:** ✅ bundled (works in-app today) · 🌐 web-only (page exists, stripped from native
bundle) · 🪟 in-app sheet. **Wired** = present in the nav registry and rendered by the House.

### Group: Worlds (`MAIA_WORLDS`, minus `maia`)

| Item | Route | Page | Wired | Native | Return | Audience |
|------|-------|:----:|:-----:|:------:|--------|----------|
| Living Field | `/maia/living-field` | ✓ | ✓ | 🌐 | House Presence doorway¹ | all |
| Journal | `/labtools/journal` | ✓ | ✓ | ✅ | ¹ | all |
| Anchor | `/maia/anchor` | ✓ | ✓ | 🌐 | House Presence doorway¹ | all |
| Ideas | `/maia/ideas` | ✓ | ✓ | 🌐 | ¹ | all |
| Wisdom | `/wisdom-keepers/wisdom` | ✓ | ✓ | 🌐 | ¹ | all |

### Group: Rooms (`MAIA_BOUNDARIES` via `getVisibleBoundaries`)

| Item | Route | Page | Wired | Native | Return | Audience |
|------|-------|:----:|:-----:|:------:|--------|----------|
| Pro Studio | `/studio` | ✓ | ✓ | 🌐 | separate shell² | founder |
| Book Studio | `/book-studio` | ✓ | ✓ | 🌐 | separate shell² | founder |
| Circles | `/commons/circles` | ✓ | ✓ | 🌐 | separate shell² | founder |
| Astrology | `/astrology` | ✓ | ✓ | 🌐 | ¹ | **all** |
| Lab Tools | `/labtools` | ✓ | ✓ | 🌐 | ¹ | founder |
| Community Library | `/maia/community/library` | ✓ | ✓ | 🌐 | ¹ | **all** |
| Vision Studio | `/maia/vision-studio` | ✓ | ✓ | 🌐 | ¹ | founder |
| Keeps | `/maia/keep-capture` | ✓ | ✓ | 🌐 | ¹ | all |
| Co-lab | `/team/for-you` | ✓ | ✓ | 🌐 | separate shell² | conditional³ |

### Footer utilities (rendered directly by the sheet)

| Item | Target | Page | Wired | Native | Return |
|------|--------|:----:|:-----:|:------:|--------|
| Account | `open-account` action | — | ✓ | 🪟 | closes sheet |
| Settings | `/account/settings` | ✓ | ✓ | ✅ | ¹ |
| Help | `open-help` action | — | ✓ | 🪟 | closes sheet |

### Requested by Kelly but NOT in the House registry

| Item | Existing page | In registry | Native | Notes |
|------|---------------|:-----------:|:------:|-------|
| Decisions | `/studio/decisions` | ✗ | 🌐 | Page exists under the founder Studio boundary. `MaiaShell` already has an `onOpenDecisions` prop. Needs a registry entry + placement/audience ruling. "What was decided." |
| Changes | `/studio/changes` | ✗ | 🌐 | Page exists under Studio. `onOpenChanges` prop exists. Distinct from Decisions: "what changed." Needs registry entry + ruling. |

**Notes**
¹ *Return not individually verified in this pass.* `/maia/*` destinations are covered by the deployed
House Presence doorway system; others need a per-page confirm (Phase 2 below).
² Boundary transitions are separate shells (own back-nav on web; on native, opened in Safari → Safari
back / app switch).
³ Co-lab visibility is conditional (founder/practitioner **or** a pending count), not audience-based.

Also intentionally **absent** (ruling, Kelly 2026-07-22): **Now What?** (`/now-what`) — a client build on
AIN OS, not a native room of MAIA. Its absence is a correctness condition, asserted in the House
verification harness, not an oversight.

---

## What "complete the House" means (one coherent pass, not per-link patches)

1. **Native routing model — the load-bearing fix.** Give `MaiaHouseSheet` native awareness. For each
   destination decide *bundle-in-app* vs *open-in-web*, then:
   `Capacitor.isNativePlatform() && isWebOnly(route)` → `/open-web?to=<route>` (Safari); else
   `router.push`. This alone turns 14 dead links into working ones (in Safari) with no page rewrites.

2. **Bundle the few that should feel native.** Candidates that belong *inside* the app (e.g. Anchor,
   Ideas, Keeps, Living Field): add to `MOBILE_MAIA_KEEP` **and** make each static-export-safe
   (`x-member-id`/`apiFetch`, no `force-dynamic`/`cookies()` literals). Each carries a real cost — do
   only the ones worth it; the rest ride the `open-web` bridge.

3. **Register Decisions & Changes.** Add both to `maiaNav.ts` with defined purpose; ruling needed on
   group (new "Record"/"Governance" group vs under Rooms) and audience (founder-only today).

4. **Return audit (Phase 2).** Confirm each destination has a back-to-House/MAIA affordance on native —
   House Presence doorway for `/maia/*`, Safari/app-switch for `open-web`, explicit for boundary shells.

5. **The original three, now scoped as shell work:** holoflower vertical clearance (safe-area), Keep
   button placement + native auth-race, and whether returning members land on the Arrival surface at all
   (`shouldRenderArrival`). See `project_native_device_walk_ledger` threads 2–4.

---

## Decisions needed before code

- **Bundle vs open-web, per destination** — which House items open *in-app* vs *in Safari* on native.
- **Decisions / Changes placement** — which group, and founder-only or all members.
- **Delivery** — small clean-main PRs per concern vs one navigation-pass PR. All on **clean-main**.
