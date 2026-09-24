# JARVIS-WRITERS-STUDIO-FULL-REDESIGN-01 · PC3-S2 — Evidence Record
## Home / Arrival visual family

**Standing:** CANDIDATE · STOP BEFORE MERGE · FOUNDER VISUAL REVIEW — PC3-S2
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
