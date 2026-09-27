# JARVIS-WRITERS-STUDIO-FULL-REDESIGN-01 · PC3-S2 — Evidence Record
## Home / Arrival visual family

**Standing:** PC3-S2 → founder **REVISE** (`PC3_S2_FOUNDER_ADJUDICATION_2026-09-24.md`) → **PC3-S2R1 CANDIDATE** (§9) · STOP BEFORE MERGE · FOUNDER VISUAL REVIEW — PC3-S2R1
**Authority:** isolated non-production fixture implementation only
**Packet:** JARVIS `control-room/writers-studio/PC3_S2_CC_EXECUTION_PACKET.md` (control room `e0a0156119aabab1664e9d3561453b4d19d88565`)
**Visual base:** founder-accepted S1 `9995c785b3ec417c0906b4ad4bc26bef5d64474b` (PC3-S1 PASS recorded in `PC3_S1_FOUNDER_ADJUDICATION_2026-09-24.md`)
**Canonical at start:** `e88688841` (refreshed for awareness; the accepted PC3 lineage was not rebased)
**Branch:** `feature/ws-full-redesign-pc3-s2-home-20260924`

---

## 1. References

| role | file | SHA-256 |
|---|---|---|
| governing family | `original-27/Soullab Writers Studio Visual Canon.png` (frame 1 · Home) | `e5a72601548ee0f19e490a0f3c6f99d66694b2333217d6c341e64e9a37c44b25` |
| supporting history only | `writer-studio-reference-pack/references/01-work-home.png` | `27da50dff5773b89bd4ea0e875b1940f648b2671f35b4c90b64c5dfbed8542b7` |
| Work image source | `original-27/Soullab Literary Review Dashboard.png` — The River Between’s own Work card | custody `c0f4bca2` |

Written law read in full or by cited extraction: First Arrival + Onboarding, Home Arrival + Observation Address ruling
(read in full), Work Navigation + Discovery, Intent-First Entry, Flagship Experience canons; PC1 ratified; PC2 final.
The live Home (`app/writers-studio/HomeView.tsx`, `lib/writersStudio/deleteWork.ts`) was read, never modified, for its
exact copy and truth semantics.

## 2. What was built

- `app/writers-studio/full-redesign/HomeRoom.tsx` — reusable Home room, four states, local UI state only (title search,
  remove-or-delete panel, add-to-work chooser). Fetches nothing; every act is reported through `onAct`.
- `Shell.tsx` — the manuscript and MAIA regions became **optional**; with neither supplied the shell renders one room
  (Home). `workTitle` became optional (H1 has no Work, so no picker). With both regions supplied — every S1 state — the
  output is unchanged (proven byte-identical below).
- `types.ts` / `tokens.ts` / `fixtures.ts` — additive: `HomeStateId`, `ReviewStateId`, `HOME_GEOMETRY`, Home fixtures,
  The River Between’s Work image.
- Founder-review harness — the four Home states; Home in the spine now opens Return; Write still reports that it is a
  later state.

### States
| state | premise | primary act |
|---|---|---|
| `home-begin` | no Work, no writing | **Begin a new work** (+ Import writing · Bring notes & sources) |
| `home-return` | declared Work with durable return place | **Return to this work** |
| `home-unclaimed-writing` | writing no Work has claimed | **Open writing** (+ Make this a work · Add to a work) |
| `home-many-works` | enough Works that title search helps | **Return to this work** (compact), title-only search |

## 3. Gates

| gate | result |
|---|---|
| S1 fidelity (accepted contract) | ✅ **55/55** |
| S1 drift −0.6 / −0.3 / +0.3 / +0.6 px | ✅ **55/55** each |
| S1 maia-drop mutant | ✅ **49/55 RED** (only MAIA-right @1100/@1024) |
| S1 captures regenerated after the shared change | ✅ **all 12 byte-identical** to the accepted candidate’s |
| `jest fullRedesignShell.test.ts` | ✅ 13/13 |
| `jest fullRedesignHome.test.ts` | ✅ 16/16 |
| S2 Home fidelity | ✅ **60/60** |
| S2 mutants: resident-maia · urgency · bar-shift | ✅ RED each (56/60 · 56/60 · 44/60), on the intended laws |
| `npm run check:design-canon` | ✅ 2 Experience Contracts cover the change |
| `npm run typecheck` | ✅ no TypeScript regressions |
| `npm run check:no-supabase` | ✅ |

**Suite mutation-tested (all reverted byte-identical):** “Continue where you left off” on Begin → killed (no-false-resume);
unclaimed writing labelled Work → killed (H3 law); Library in the spine → killed (2 laws); a manuscript region at Home →
killed (one-room law); a network call in HomeRoom → killed (no-network law).

**The instrument corrected its own first definition.** The first S2 run compared the Home bar to the S1 bar with
*Develop* current; the bold current item widens its label, so items after it shifted 3 px. The accepted S1 bar does
exactly the same between its own states. The reference was corrected to the S1 bar with *Home* current — equality stays
exact, no tolerance was added.

## 4. What the S2 instrument checks

Family: bar/brand/nav×4/avatar boxes equal to the live S1 bar (Home current) at 1536, 1280, 1024 · Light default ·
Newsreader headings / Inter chrome · ground / panel / title colours · one room (topbar + work only).
Truth: one primary act per state · H1 Begin with no Works · H2 declared Work + place + Return · H3 writing chips never
“Work” · H4 `data-search-scope="title"` + visible “Searches titles only” · spine Home·Write·Develop·Review with Home
current · no false-resume or elapsed-time copy · zero business network requests.
Responsive: no horizontal overflow and primary act present at 1280 · 1024 · 390.

## 5. Screenshots (`docs/design/contracts/screenshots/full-redesign-pc3-s2/`)

- `home-begin-{1536x1024,1280x800,1024x768,390x844}.png`
- `home-return-{1536x1024,1280x800,1024x768,390x844}.png` · `home-return-night-1536x1024.png`
- `home-unclaimed-writing-1536x1024.png` · `home-many-works-1536x1024.png`
- founder-review boards `board-home-{begin,return,unclaimed-writing,many-works}.jpg` — governing family (Visual Canon
  frame 1) and supporting August Home as context beside the actual render, with the derivation note

## 6. Known differences / open points

1. **No single Home board exists** in the later corpus; Home is composed from the Visual Canon frame-1 *family*, not
   matched to a pixel target (packet §11). The boards show the derivation.
2. **Canon tension, recorded not resolved:** the earlier Home ruling (§2, §4) and the Navigation canon (NAV 65–68, 375,
   D-N10) held Home and Search back until real. PC2 (ratified later) sets the spine with Home over the existing real Home
   destination, and the packet requires the existing title-only search — both are followed, with the tension named in the
   S2 Experience Contract’s `deviation`/`authority`.
3. **Fixture Works** other than The River Between are invented titles with thumbnails cropped from founder originals;
   History, kept line and dates are fixture.
4. **“Your writing space” card** reuses the #11 misty-lake crop (low source resolution, upscaled ≈1.4×).
5. **Remove or delete** opens an inline panel with the live Studio’s exact copy for each act; the buttons are fixture.
6. **Work image chooser** (“What is this image to you?”) and **kept-line creation** exist in the live Home but are not
   drawn in S2 — preserved for PC5/PC9 per function-preservation; not dropped.
7. **Mobile:** the writing-space quote wraps to a short second line at 390.

## 7. Negative visual evidence (NV required use)

1. *Old workbench?* No — one open light room, no rails, no tool chrome.
2. *Generic SaaS / Office / dashboard?* No dashboard grid, goals, insights feed or productivity chrome; whether it
   *feels* generic is founder judgment.
3. *Real function lost?* No — the live Home is untouched; every live Home act has a drawn entry point here except the
   image chooser and kept-line creation (item 6), which remain live and are carried forward.
4. *Mock capability shown as live?* No — `/dev/` route, “Founder review · fixture data” outside the frame, zero network.
5. *Compared against the original?* Yes — Visual Canon frame 1 from custody, hash-checked, on every board.
6. *Founder judgment:* atmosphere, warmth, whether Home feels like arriving, PC4.

## 8. Proven / not proven

**Proven:** four truthful Home states exist in the accepted family; the product bar is the accepted S1 bar; no resident
MAIA or rail at Home; truth laws hold and die when broken; zero network; the accepted S1 candidate is unchanged in
fidelity, drift, mutant behaviour and screenshot bytes; production untouched.

**Not proven:** founder visual acceptance; live Home data; Work creation, declaration, search or deletion behaviour;
first-arrival flows beyond the Home surface; final mobile (PC10).

**STOP: FOUNDER VISUAL REVIEW — PC3-S2.**

---

## 9. PC3-S2R1 — Home field containment + professional framing repair

**Packet:** JARVIS `control-room/writers-studio/PC3_S2R1_HOME_FIELD_CONTAINMENT_REPAIR.md` (control room `0b9e65b2c24611fa5222de248907135cba2b5d41`)
**Parent:** `c01d1908507c8d31d4e882156867113faea1f5d8` · **Branch:** `feature/ws-full-redesign-pc3-s2r1-home-field-20260924`
**Founder finding:** Home is clean and truthful but lacks framing, field containment and a professional spatial hierarchy — content floated on the ground as separate cards.

### Cause
S2 laid every block directly on the shell ground, each with its own panel, border and shadow. With no containing plane and no tonal hierarchy, the eye had no room to be in and no anchor to return to; the current Work was one card among cards. The Many Works metadata carried a separator that, once the facts were stacked, fell onto a line of its own (a `display:block` rule outranked the rule hiding the dot).

### Repair (visual only)
- **Level 1 · room field** — one `data-field="room"` plane per state: new role `--fr-field` over the unchanged ground, one hairline edge (`--fr-field-line`), 20 px radius, no shadow, max-width 1376 px. H1’s room is centred in the viewport as a threshold, sized to its content, not the viewport.
- **Level 2 · anchor field** — one `data-field="anchor"` per state, raised on `--fr-panel` with the S1 shadow: H2 welcome + place + Work image and name + Return + kept line + History in ONE field (arrival → recognition → re-entry); H4 a compact return field; H3 the lead writing (dashed edge kept); H1 the threshold (unraised).
- **Level 3 · regions + band** — Also written / Your Works / Your Writing as `data-field="support"` regions on new role `--fr-recess` holding paper items; Begin / Import / Bring notes as one `data-field="band"` on the room’s edge. The writing space lost its card frame and is room atmosphere.
- **Alignment** — every block the room lays out starts on the room’s inner edge or on the second column line; the band spans the inner width exactly.
- **Orphan separator** — stacked facts carry no separator; inline facts, the compact return line and the kept-line caption glue the dot to the words after it (`.fr-home-nowrap`).
- **Tokens** — three roles added to both appearances (`field`, `fieldLine`, `recess`); no S1 region reads them. Light: ground `#F3F3F3` → field `#F9F8F5` → raised `#FEFEFE`, recess `#F2F1ED`. Night: ground `#0F1422` → field `#131A2A` → raised `#171E30`, recess `#10172A`.

### Gates
| gate | result |
|---|---|
| S1 fidelity · drift ±0.3/±0.6 | ✅ 55/55 · 55/55 each |
| S1 maia-drop mutant | ✅ 49/55 RED |
| S1 captures regenerated | ✅ all 12 byte-identical (zero git diff) |
| Jest `fullRedesignShell` + `fullRedesignHome` | ✅ 34/34 (13 + 21; 5 new R1 containment laws) |
| Jest R1 laws mutation-tested | ✅ room field removed · dot back in stacked facts · anchor demoted · dot unglued — each killed, file restored byte-identical |
| S2R1 Home fidelity | ✅ **91/91** (containment checks added, S2 checks kept) |
| mutants | ✅ resident-maia 87/91 · urgency 87/91 · bar-shift 75/91 · **no-room-field 63/91 · flat-tones 76/91 · heavy-chrome 87/91 · orphan-sep 87/91** — each RED on its intended law |
| `check:design-canon` · `typecheck` · `check:no-supabase` | ✅ · ✅ no regressions · ✅ |
| business network | ✅ zero requests, every state |

### New mechanical assertions (packet §16)
`C-room-field` one room field on its own tone with an edge · `C-two-tone` ΔE ≥ 3 ground→field, field→anchor, field→each region · `C-anchor` one anchor holding the primary; H2/H4 anchor names the Work and Return; H2 anchor outranks every region in area · `C-boundaries` ≤ 2 left alignment lines, rightmost block and band on the room’s inner edge · `C-no-orphan-sep` no metadata line holding only a separator (per-character line measurement, every width) · `C-no-heavy-chrome` no border > 2 px, no shadow blur > 30 px or alpha > .3 · `C-night=light` identical field boxes · plus the S2 no-MAIA, zero-network and no-overflow laws.

### Evidence
Renders: H1 1536 / 1280 / 1024 / 390 · H2 1536 / 1280 / 1024 / 390 / Night 1536 · H3 1536 · H4 1536 / 1024.
Before/after boards: `board-s2r1-{home-begin,home-return,home-return-night,home-unclaimed-writing,home-many-works}.jpg` — the parent’s committed render (read with `git show c01d1908`) beside the repaired render, with the containment note. The Visual Canon reference boards `board-home-*.jpg` were regenerated with the new renders.

### Known differences
1. The writing-space image remains the upscaled #11 crop (now ≈1.23× at H2, ≈1.4× at H1).
2. H3 and H1 rooms end above the fold at 1536×1024, leaving ground below — the room sizes to its content rather than inventing height.
3. The H4 shelf at 1024 has uneven title wrapping inside equal-height cards.
4. Night recess (`#10172A`) sits close to the ground; regions read by their hairline and the paper items inside them.

### Proven / not proven
**Proven:** one room field, one anchor and tonal regions in every Home state, at every width, in both appearances with identical geometry; the orphan separator cannot recur without failing two instruments; the S1 shell is unchanged in fidelity, drift, mutant behaviour and bytes; zero network; production untouched.
**Not proven:** whether Home now feels like a professionally composed room that holds the writer, and whether the structure is trusted enough to disappear — founder judgment.

**STOP: FOUNDER VISUAL REVIEW — PC3-S2R1.**
