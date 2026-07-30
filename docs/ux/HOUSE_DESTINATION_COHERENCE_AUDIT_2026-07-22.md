# House Destination Coherence Audit — 2026-07-22

Scope: every place reachable from `MaiaHouseSheet` (`components/maia/MaiaHouseSheet.tsx`),
routes resolved from the real registry `lib/navigation/maiaNav.ts`.
Two questions: **(A) can you get back to MAIA?** and **(B) does it look like the same house?**

Canonical reference: `docs/canon/SOULLAB_THEME.md` + `tailwind.config.js` `colors.maia.*`
(navy `#0A1628` primary canvas · ink · gold `#B8860B` · spice). Brand rule on file:
**Cosmos = deep navy is the field. Espresso = Press only. Plum = atmosphere only.**

---

## A. Return-to-MAIA affordance

| # | Place | Route | Return mechanism | Verdict |
|---|-------|-------|------------------|---------|
| 1 | MAIA | `/maia` | is the center | — |
| 2 | Living Field | `/maia/living-field` | **none** | ❌ dead end |
| 3 | Journal | `/labtools/journal` | `push('/maia')` :664 + labtools rail | ✅ |
| 4 | Anchor | `/maia/anchor` | `router.back()` :119 only | ⚠️ history-dependent |
| 5 | Ideas | `/maia/ideas` | ArrowLeft → `push('/maia')` :122 | ✅ |
| 6 | Wisdom | `/wisdom-keepers/wisdom` | `href="/maia"` :227 | ✅ |
| 7 | Pro Studio | `/studio` | `MaiaBoundaryLayout` rail | ✅ (rail) |
| 8 | Book Studio | `/book-studio` | **none** — own amber header | ❌ dead end |
| 9 | Circles | `/commons/circles` | `MaiaBoundaryLayout` rail | ✅ (rail) |
| 10 | Astrology | `/astrology` | `MaiaBoundaryLayout` rail | ✅ (rail) |
| 11 | Lab Tools | `/labtools` | rail + `push('/maia')` :32 | ✅ |
| 12 | Community Library | `/maia/community/library` | **none** (only in-page "Back to Library") | ❌ dead end |
| 13 | Vision Studio | `/maia/vision-studio` | tab bar → Living Field only | ❌ dead end |

**Root cause — the inversion.** There is no `app/maia/layout.tsx`. The *outer boundary rooms*
(`/studio`, `/astrology`, `/labtools`, `/commons/circles`) each declare a layout that wraps them
in `MaiaBoundaryLayout` → `MaiaLeftRail` → MAIA. The member's *own inner Worlds* under `/maia/*`
get no shared chrome at all. The house is better connected to its outbuildings than to its rooms.

Note: the rail is `fixed w-14` with **no responsive hiding** — on mobile it permanently occupies
56px of a 375px viewport on boundary routes, and is absent everywhere else. Neither state is designed.

---

## B. Palette coherence — four incompatible systems

| System | Where | Values |
|---|---|---|
| **Navy (canonical)** | House sheet, Circles, signin | `#0B1A30`/`#071426` gradient; `maia-navy-850/900` |
| **Espresso (Press-only per brand rule)** | `MaiaLeftRail`, `MaiaBoundaryLayout`, Book Studio | `bg-[#0f0d0b]`, `border-[#3a2a1f]`, accent `#D4B896` |
| **Stone / charcoal** | Living Field, Vision Studio, Ideas | `bg-stone-950`, `bg-stone-900` |
| **Light mode** | Anchor, Journal, Wisdom, Lab Tools, Community Library | `#f8f7f5` gradient; 26× `bg-white`; `bg-stone-50/100` |
| **Pure black** | Astrology | 50× `bg-black` |

Sharpest breaks, in order of felt severity:

1. **Dark → white flash.** The House is navy. Tapping *Anchor* or *Journal* drops the member onto a
   near-white surface. Same for Wisdom, Lab Tools, Community Library. This reads as leaving the product.
2. **Espresso chrome around navy content.** Circles is correctly tokenised navy — but
   `MaiaBoundaryLayout` wraps it in `bg-[#0f0d0b]` with a warm-brown rail. Two brands, one screen.
   The rail is the single most persistent element in the app and it is off-canon.
3. **Three darks that are not the same dark.** navy `#0B1A30` · espresso `#0f0d0b` ·
   stone `#0c0a09` · black `#000`. All "dark", none matching.
4. **Two golds.** House icons `#c9a54e` @ 18px strokeWidth 1.5; rail icons `#D4B896` @ 20px
   default weight; canon says `#B8860B`. Same icons, three treatments.
5. **Hard-coded hexes over tokens.** The House sheet itself does not use `maia-navy-*`.

---

## C. Remediation

**Applied now (functional defects, not design opinions):** a shared `MaiaReturn` control giving the
four dead-end surfaces a direct gold icon link home — see `components/maia/MaiaReturn.tsx`.

**Held for founder ruling (design changes):**

- **R1** — Retire espresso from `MaiaLeftRail` + `MaiaBoundaryLayout`; re-tone to `maia-navy-900/850`,
  icons to `maia-gold`. Confines espresso to Book Studio / Press, per the brand rule.
- **R2** — Convert the light surfaces (Anchor, Journal, Wisdom, Lab Tools, Community Library) to the
  navy field. Largest change; Anchor's light gradient may be a deliberate contemplative choice — ask first.
- **R3** — Introduce `app/maia/layout.tsx` so Worlds inherit shared chrome, and give the rail a
  responsive treatment (drawer under `md`) instead of permanently eating 56px on phones.
- **R4** — Replace hard-coded hexes in `MaiaHouseSheet` with `maia-navy-*` / `maia-gold` tokens.
- **R5** — One icon spec: size, stroke weight, and gold, applied to House + rail together.

R1–R5 are sequenced: R4 first (cheap, makes the canon legible), then R1, then R3, then R5, then R2.
