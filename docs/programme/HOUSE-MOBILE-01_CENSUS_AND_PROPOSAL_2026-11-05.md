# HOUSE-MOBILE-01 — House home on phones: census and proposal (2026-11-05)

**Occasion.** Founder iPhone (PWA) walk of soullab.life: "this seems incredibly long for a phone",
"MAIA should be above Astrology", "put Here · Now below the five chosen fields", "a clear Arrange
My House", "collapse Here · Now so it won't appear overwhelming", "clean this up for iPhone and
iPad". The founder asked for a JARVIS flow, done in this session.

**Status.** Founder approved the proposal ("Yes, build it", 2026-11-05): D1–D4 taken as
recommended, wide desktop unchanged. Built on `fix/house-mobile-here-now-20261105`. Local walk
(authenticated test member): iPhone 390×844 **6,778 → 1,736px** (about 2 screens); iPad 820×1180
**5,287 → 1,683px**; desktop 1440 shows the original sections, none of the phone ones. ⛔ Not
deployed; production witness and a real-phone walk are owed.

**iOS app.** The native app is a static export (`capacitor.config.ts`: `webDir: 'out'`, no
`server.url` outside dev). `scripts/capacitor-patch-routes.sh` removes every `force-dynamic`
page from that export, and `/house` and `/house/places` are both `force-dynamic`, so neither is
in the iOS bundle, before or after this change. The installed home-screen web app (soullab.life)
gets this change on deploy. How the native app reaches the House, if at all, is not established
here.

## 1. Authority recovered

- `docs/canon/THE_HOUSE.md`: *"A home for a life, not an application."* MAIA is the host who
  "welcomes, remembers, asks, and opens doors".
- `docs/design/contracts/house-room.md`: the House is **"a place of arrival and orientation, not
  a capability inventory"** (INHABITABLE_ARCHITECTURE_STANDARD); MAIA is "an encounter the member
  chooses to enter"; the House must not open a microphone just because the threshold is visible.
- `house-here-now-holoflowers.md`: Here · Now is "a compact immediacy strip" using the House's
  holoflower identity and catalog tones; placement is member-controlled.
- The **All-places directory** (`HouseDirectory`) arrived in a witness snapshot (`945e0144a`,
  2026-09-26) with **no design ruling attached**, so moving it off the phone home overrides no
  decision.

## 2. Census (local, authenticated test member)

| Block | iPhone 390×844 | iPad 820×1180 |
|---|---|---|
| Header + welcome | 240px | 289px |
| MAIA presence | 451px | 422px |
| Current sky | 319px | 323px |
| "Your spaces" heading + five spaces | 804px | 767px |
| Here · Now (folded, parked patch) | 112px | 54px |
| What's alive | 244px | 244px |
| **All places (directory)** | **3,047px (45%)** | **1,693px (32%)** |
| Life compass | 226px | 198px |
| Grounds + Go live | 718px | 680px |
| **Total** | **6,778px ≈ 8.0 screens** | **5,287px ≈ 4.5 screens** |

Each directory entry carries three controls (Open · Show in center · In Here · Now). That is
arrangement machinery on the arrival page: the "capability inventory" the House contract rules out.

⚠️ To verify on a real phone: the browser pane reported a microphone request around a House load;
it could not be pinned to the House page (it may have come from the previous page). Not a finding.

## 3. Proposal: a phone-first House (≤1200px; wide desktop unchanged)

1. **Welcome**, shorter.
2. **MAIA first**: one card, "Always here when you are ready.", and the speak-or-type box.
3. **Your five spaces**, as compact two-column tiles (name + one short line).
4. **Here · Now folded**: one row, "Here · Now · 18 places ▾", beside a clear **Arrange my House**.
5. **Today**: two one-line rows, "The sky now · Moon in Libra · Sun in Scorpio ›" and "What's alive
   · <Work> · Writing ›". The full sky lives in Astrology.
6. **All places**: one quiet door to its own page: search, plain grouped rows, one tap opens. Show-in-
   center and Here · Now choices move to Arrange my House.
7. **More of the House** (folded): "The house is not the journey", Grounds (People · Gatherings ·
   Offerings).
8. Closing line and **Go live →**.

Estimated height: about **2 screens** on an iPhone (from about 8).

Mock: https://claude.ai/artifact/SQ1VapWWyMkXtNxZgYaKTf (private; two phone screens; Here · Now,
More of the House and the All places link work).

## 4. Founder decisions owed

- **D1.** All places leaves the phone/iPad home for its own page (recommend yes; wide desktop:
  keep as is for now, or move there too?).
- **D2.** The sky panel becomes a one-line "The sky now" row on phones/iPad (recommend yes).
- **D3.** Life compass and Grounds fold under "More of the House" (recommend yes).
- **D4.** The directory's per-place Show in center / Here · Now buttons move into Arrange my House
  (recommend yes, so the catalogue stays a simple list).
