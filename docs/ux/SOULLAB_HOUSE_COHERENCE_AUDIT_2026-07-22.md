# Soullab House Coherence Audit — Phase 1

**Date:** 2026-07-22 · **Status:** audit only, no code approved · **Standard:** *family resemblance, not uniformity*

Supersedes `HOUSE_DESTINATION_COHERENCE_AUDIT_2026-07-22.md` (narrower, same day).

Method: full code inventory of all 13 House destinations resolved from the real registry
(`lib/navigation/maiaNav.ts`) + **live authenticated walk** on `localhost:3000` as the seeded
`demo.practitioner` member, desktop 800×455 and mobile 375×812. Screenshots captured in session.

---

## 0. The headline finding

**The design system you are asking me to propose already exists, is ratified canon, and is
essentially unadopted.**

`docs/canon/SOULLAB_THEME.md` (Soullab Core) already specifies the four-layer field hierarchy
(void → field → surface → signal), the palette, the prohibitions, and — critically — **§4 "Variation
by function, not by identity"** and the `data-domain` mechanism: *same field, different signal.*
That is precisely "distinct rooms, one world," already written down.

The primitives to implement it were built on 2026-04-10 and sit in `components/core/`:

| Component | Purpose | Maps to your ask |
|---|---|---|
| `CorePage` | field container, `depth`/`atmosphere`/`domain`/`layer` props | `SoullabRoomShell` |
| `CoreCard` | tonal-lift surface | `RoomSurface` |
| `CoreSection` | spacing rhythm | `RoomSection` |
| `DomainProvider` | accent shift, field continuous | room personality without a new theme |

**Adoption, measured across 1,413 `.tsx` files in `app/` + `components/`:**

| Token / primitive | Files using it |
|---|---|
| `bg-field-core` | **1** |
| `bg-field-depth` | **1** |
| `data-domain` | **3** |
| `sl-atmosphere` | **3** |
| `bg-soullab-canvas` | **0** |
| `maia-navy-*` | 63 |

So the fragmentation is not a missing system. It is **an unenforced one.** That reframes the whole
remediation: this is an *adoption* project with three small additions, not a design-system invention
project. It also means the roadmap is far cheaper and far more reversible than it looks.

---

## 1. Destination inventory

`†` = route reachable only through a middleware/cookie gate; not walkable with localStorage identity
alone, so its live state is code-read, not eye-read.

| # | Room | Route | Entry | Shell | Header grammar | Field colour | Type | Classification |
|---|---|---|---|---|---|---|---|---|
| 1 | **MAIA** | `/maia` | `app/maia/page.tsx` (2118) | `MaiaShell` | House pill L · MAIA wordmark + avatar R | `#1a1a2e` indigo + plum bloom | Inter, no display serif | **Coherent** (the bar) |
| 2 | Living Field | `/maia/living-field` | page (97) | none | none (added `MaiaReturn`) | `stone-950` | sans | **Fragmented** |
| 3 | Journal † | `/labtools/journal` | page (893) | `MaiaBoundaryLayout` | in-page | **light** + 12 pastel accents | sans | **Legacy** |
| 4 | Anchor | `/maia/anchor` | page (208) | none | `←` browser-back + caps title | **`#f8f7f5` white** | sans | **Legacy** |
| 5 | Ideas | `/maia/ideas` | page (282) | none | `← MAIA` text | `#0b0f1c` | **Spectral serif** ✓ | **Partially coherent** |
| 6 | Wisdom | `/wisdom-keepers/wisdom` | page (484) | none | `← Back` text | `stone-950` + `black` + `white` | bold sans | **Fragmented** |
| 7 | Pro Studio | `/studio` | page (339) | `MaiaBoundaryLayout` + own 670-line nav | dual nav | `#1a1a2e`/`#16162a` | sans | **Partially coherent** |
| 8 | Book Studio | `/book-studio` | page (162) | own layout (59) | own amber nav | `#0f0d0b` espresso | sans | **Partially coherent** |
| 9 | Circles | `/commons/circles` | page (216) | `MaiaBoundaryLayout` | none | `maia-navy-*` ✓ **tokenised** | sans | **Partially coherent** |
| 10 | Astrology | `/astrology` | page (1800) | `MaiaBoundaryLayout` | none | navy + stars ✓ | bold sans | **Partially coherent** |
| 11 | Lab Tools † | `/labtools` | page (269) | `MaiaBoundaryLayout` | in-page | **white** + gradients | sans | **Legacy** |
| 12 | Community Library | `/maia/community/library` | `CommunityLibrary` (1168) | own layout | none | **white + bright teal** | bold sans | **Legacy — canon violation** |
| 13 | Vision Studio | `/maia/vision-studio` | page (85) | none | tab bar | `stone-950` | sans | **Fragmented** |

**Scale note:** these 13 doorways lead to **203 nested pages** (`/studio` 61 · `/labtools` 61 ·
`/maia` 57 · `/book-studio` 11 · `/astrology` 10 · `/wisdom-keepers` 3 · `/commons/circles` 3),
with 15 nested layouts that re-change the shell. Any roadmap must land at the *shell* level, not
per page, or it will never finish.

### Counts

- **Darks in use, none matching:** `#1a1a2e` (MaiaShell) · `#0f0d0b` (rail/topbar/BoundaryLayout/Book Studio) · `#0c0a09` (stone-950) · `#0b0f1c` (Ideas) · `#000` (Astrology/Wisdom) · `#0A1628` (canon — used by almost nobody)
- **Light canvases in core flows:** 5 rooms (Anchor, Journal, Wisdom partial, Lab Tools, Community Library) — SOULLAB_THEME.md §Prohibitions forbids this
- **Named palettes competing:** Soullab Core · `maia.*` · Dune (`dune-amber`, `fremen-azure`, `spice-orange`) · raw Tailwind stone/teal/violet/indigo
- **Golds:** `#c9a54e` (House) · `#D4B896` (rail/topbar) · `#B8860B` (canon) · `amber-500` (many)
- **Holoflower components:** **7 separate implementations** (`components/Holoflower.tsx`, `ui/Holoflower.tsx`, `oracle/holoflower{,-oracle,-simple}.tsx`, `oracle/HoloflowerSurvey.tsx`, `holoflower/MiniHoloflower.tsx`)

---

## 2. Direct-return-to-MAIA audit

| Room | Return affordance | Desktop | Mobile | Verdict |
|---|---|---|---|---|
| MAIA | — center | — | — | — |
| Living Field | *none* → `MaiaReturn` added (uncommitted) | ✓ | ✓ | was **dead end** |
| Journal | `push('/maia')` + rail | ✓ | rail eats 56px | ok |
| Anchor | `router.back()` only | ⚠️ | ⚠️ | **history-dependent** |
| Ideas | `← MAIA` | ✓ | ✓ | ok, but tiny/low-contrast |
| Wisdom | `← Back` — says *Back*, not MAIA | ✓ | ✓ | **wrong label** |
| Pro Studio | rail only | ✓ | rail eats 56px | ok |
| Book Studio | *none* → `MaiaReturn` added (uncommitted) | ✓ | ✓ | was **dead end** |
| Circles | rail only | ✓ | rail eats 56px | ok |
| Astrology | rail only | ✓ | rail eats 56px | ok |
| Lab Tools | `push('/maia')` + rail | ✓ | ✓ | ok |
| Community Library | *none* → `MaiaReturn` added (uncommitted) | ✓ | **clipped behind rail** | was **dead end** |
| Vision Studio | *none* → `MaiaReturn` added (uncommitted) | ✓ | ✓ | was **dead end** |

**Four dead ends. Six distinct return grammars** (rail glyph · `← MAIA` · `← Back` · `←` bare ·
flame+wordmark · nothing).

**Structural cause — the inversion.** There is no `app/maia/layout.tsx`. The *outer* rooms
(`/studio`, `/astrology`, `/labtools`, `/commons/circles`) each declare a layout wrapping them in
`MaiaBoundaryLayout` → `MaiaLeftRail` → MAIA. The member's *own inner Worlds* under `/maia/*`
inherit nothing. **The House is better connected to its outbuildings than to its rooms.**

**Gated states are also dead ends.** Signed out, `/maia/living-field` renders a black void with
"Sign in to enter your Living Field." and no way home; `/labtools/*` bounces to a full sign-in page.
Same product, two unrelated refusals. `MaiaReturn` currently sits only in the authenticated branch —
so the gated state stays trapped even after the fix.

---

## 3. Live walk — what the eye actually sees

| Room | Observed |
|---|---|
| **MAIA** | Plum-navy bloom, jewel holoflower breathing, "Good evening" in warm gold display serif, quiet House pill, generous air. **This is the bar.** |
| **Anchor** | **Full off-white page.** Bare `←`. Body text "Could not load." with no recovery. Coming from the hearth this reads as leaving the product entirely. |
| **Community Library** | **White SaaS page, bright teal primary, bold black sans "SOULLAB Community Library".** Reads as a different company. On mobile: espresso rail + gold MAIA link clipped behind it + white teal content = **three brands in one 375px viewport.** |
| **Living Field** | Flat near-black, grey cards in a 3-up grid. Honest content, but it reads as an admin table, not a contemplative garden. |
| **Ideas** | Near-black, Spectral serif title — **typographically the closest room to MAIA.** Contrast is too low to read comfortably. |
| **Vision Studio** | Decent stone room, but the **holoflower renders as a hard white PNG square** on the dark field. Glaring artifact. |
| **Astrology** | **Genuinely good** — navy field, drifting stars, warm gold headline. Closest room to its own brief already. Marred by a `spice-orange` CTA off-palette and a visible seam where the espresso rail meets the navy field. |
| **Wisdom** | Dark, bold-sans headline, `← Back`. Neither MAIA's atmosphere nor its own. |
| **Journal / Lab Tools** | Middleware-gated; bounce to sign-in. Code-read only — light canvas, 12 pastel accent families. |

**The seam is visible in every boundary room:** `MaiaLeftRail` is espresso `#0f0d0b` with warm-brown
borders `#3a2a1f` and `#D4B896` icons. It wraps navy Circles, navy Astrology, indigo Studio. It is
the single most persistent element in the app and it is off-canon — espresso is Press/Book Studio
material, not chrome. It also has **no responsive treatment**: `fixed w-14`, permanently eating 56px
of a 375px phone.

---

## 4. Collection grammar — shared invariants

These are the bones. Adopt from Soullab Core; do not invent.

**Field.** Every room is `CorePage`. Void/field/surface/signal. Never a light canvas in a member
flow. One dark: `#0A1628` canvas, `#060D18` deep. Rooms vary by `data-domain` accent and by
*material* — never by re-choosing the background family.

**Signal.** One gold: `#B8860B` (soft `#D4AF37`). Retire `#c9a54e`, `#D4B896`, bare `amber-500`
from chrome. Accent is meaning, never decoration.

**Type.** Display serif (Spectral) for room titles and MAIA's voice; Inter for controls, metadata,
utilities. One scale. Ideas already does this correctly and can be the reference.

**Return.** One `ReturnToMaia`: flame + "MAIA", upper-left, stable, one tap to `/maia`, label
"Return to MAIA", present in loading / empty / error / gated states too. Room-adapted in
material, never in position or meaning.

**Materials.** Shared radius family, border opacity, tonal-lift elevation. Rooms differ by
*material* — parchment, espresso paper, glass, stone, star-field — inside one craftsmanship
standard.

**Motion.** One pacing. Sheets use the House sheet's spring. No full-theme jumps between rooms.

**Icons.** One family (lucide), one stroke weight (1.5), one size scale. Each room keeps its own
symbol.

---

## 5. Room identity briefs

Derived from each room's actual purpose in the codebase and canon, not imposed.

| Room | Material metaphor | Temperature | Domain accent | Must stay unique |
|---|---|---|---|---|
| **MAIA** | living hearth | warm, present | `maia` gold | the jewel, the plum bloom — **do not touch** |
| **Living Field** | contemplative garden | organic, breathing | `world` violet | dimensional, unforced, low structure |
| **Journal** | private study, candlelight | warm, enclosed | `archive` stone | espresso paper surfaces, writing-first |
| **Anchor** | sanctuary alcove | still, grounded | `maia` gold | radical minimalism — one prompt, nothing else |
| **Ideas** | sketch table | light, generative | `world` violet | fast capture, no ceremony |
| **Wisdom** | scholar's reading room | quiet authority | `archive` stone | navy + parchment, source-forward |
| **Pro Studio** | craftsman's workshop | precise, capable | `practitioner` blue | people-first, session-first |
| **Book Studio** | editorial salon | elegant, literary | `archive` stone | **espresso lives here** — manuscript surfaces |
| **Circles** | gathering hall | relational warmth | `world` violet | shared presence, field pulse |
| **Astrology** | observatory | cosmic depth | `world` violet | the star field — already earned |
| **Lab Tools** | workshop bench | experimental | `admin` bright gold | functional density, still beautiful |
| **Community Library** | great library | collective, quiet | `archive` stone | shelves and stacks — **not a product catalogue** |
| **Vision Studio** | atelier | luminous, developmental | `practitioner` blue | imaginal, phase-aware |

---

## 6. Shared primitives proposal

**Adopt (already built, 0 new code):** `CorePage` · `CoreCard` · `CoreSection` · `DomainProvider`

**Add (three, small):**

1. `ReturnToMaia` — flame + wordmark, one tap to `/maia`, accessible label, works in every state.
   *A candidate exists uncommitted as `components/maia/MaiaReturn.tsx`.*
2. `RoomHeader` — return · room title (display serif) · House access · utility slot. One grammar,
   room-styled.
3. `RoomStates` — shared loading / empty / error / gated. Every one currently one-off; the gated
   state is where members are most likely to be trapped.

**Fix, don't add:** `MaiaLeftRail` — re-tone espresso → navy, single gold, responsive drawer under
`md`. And consolidate **7 holoflower implementations** to one.

---

## 7. Remediation roadmap

### Stage A — Belonging and return · *presentation-only · fully reversible · high impact*
`ReturnToMaia` in all 13 rooms + gated/error states · Wisdom `← Back` → MAIA · Anchor
`router.back()` → MAIA · `app/maia/layout.tsx` so Worlds inherit chrome.
Risk: **low.** Ships the acceptance standard on its own.

### Stage B — Foundation coherence · *presentation-only · reversible · highest impact per file*
Retone `MaiaLeftRail` + `MaiaBoundaryLayout` espresso → navy, one gold, responsive drawer ·
one icon spec · `MaiaHouseSheet` hard hexes → tokens · Vision Studio white-PNG holoflower.
Risk: **low–medium** (rail is shared by 4 rooms + 135 nested pages — that is the leverage).

### Stage C — Room identity passes · *presentation-only, room by room · reversible*
Ordered by how far below the bar they sit: **Community Library → Anchor → Journal → Lab Tools →
Living Field → Wisdom → Vision Studio → Pro Studio → Book Studio → Circles → Astrology.**
Each = wrap in `CorePage domain=…`, delete one-off palette, apply material.
Risk: medium — highest churn, but strictly visual and one room at a time.

### Stage D — Nested and edge states · *structural in places*
15 nested layouts · modals/sheets · tier gates · the two divergent auth refusals ·
mobile safe-area + keyboard.
Risk: medium–high; the auth-posture divergence is the only genuinely structural item and needs
its own ruling.

### Quick wins (hours, visible immediately)
Vision Studio white PNG · Wisdom label · Anchor return · House sheet tokens · rail retone ·
Community Library teal → `archive` domain.

### Deeper refactors (need sequencing)
`app/maia/layout.tsx` without double-railing `/maia` · Community Library 1168-line rewrite ·
Studio's 670-line parallel nav vs the rail · 7 holoflowers → 1 · Journal's 12 pastel families.

### Furthest below the MAIA bar
1. **Community Library** — white + bright teal, explicit canon violation, worst mobile state
2. **Anchor** — full white page, bare error, no MAIA
3. **Journal** — light canvas + 12 unrelated accent families
4. **Lab Tools** — white + gradients
5. **Living Field** — flat grey admin grid where a garden belongs

---

## 8. Constraints honoured

No deploy. No PR. No functional, auth, persistence, routing, or tiering change. No new palette.
MAIA's pulsing jewel untouched. No room forced into a template.

**Outstanding:** `MaiaReturn` + 4 wirings are **uncommitted on the working tree** from earlier today
(Living Field, Book Studio, Community Library, Vision Studio). They are Stage A candidates. Revert
or keep — your call.

## Acceptance standard

> Every room feels individually authored, yet every room clearly belongs to Soullab.

Stage A alone satisfies the return half. Stage B satisfies most of the belonging half, because the
rail is shared. Stage C is where the rooms become *themselves*.
