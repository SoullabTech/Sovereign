# WS-02 · ACT 1 — SURFACE CENSUS

**Starting canonical** `b22945ac8` · **READ-ONLY** · ⛔ no KEEP/CONVERGE/RETIRE judgments here.

---

## 0 · The headline number

> **How many different places must a writer understand to work on one manuscript?**

**FOUR ADDRESSES, and about EIGHT distinct working surfaces inside them.**

```
/writers-studio            Home — choose or declare the Work
/writers-studio/canvas     the writing room (≈6 surfaces inside it)
/writers-studio/develop    MAIA's frozen developmental readings
/press/manuscript          SEVEN tabs — reached only by deep link, for two
                           jobs named something else
```

⭐⭐ **Two of the four are not presented as places at all.** The rail's *Export*
item is `href: '/press/manuscript?tab=export'` and *Import* is
`'/press/manuscript?import=1'`. So a writer reaches a seven-tab surface —
manuscript · draft · keeps · collections · emerging · export · book — through
two links labelled with the names of two of its tabs. **Five of the seven tabs
have no inbound link anywhere in the application.**

⛔ Not a judgment, an observation: the Studio's declared map has sixteen
destinations, **three of which are `available`** (Home · Manuscript · Export).

---

## 1 · Member-visible surfaces

| Surface | Member job | Reachable now? | Reads | Writes | MAIA / context | Overlaps | State |
|---|---|---|---|---|---|---|---|
| `/writers-studio` | choose / declare the Work, see history | **yes** — 8 inbound | living-works, manuscripts, marked lines, studio history | declarations | none | — | **active** |
| `/writers-studio/canvas` | write the manuscript | **yes** — rail *Manuscript* | draft, sections, write-state, structure, works, revisions | section saves, checkpoints, structure confirm | 3 different MAIA surfaces (below) | — | **active** |
| ├ Section writing surface | write one section | yes | `write-state` → `section_aware` | `sections/[sectionId]` | — | Whole view | active |
| ├ Whole manuscript surface | read/write the book continuously | yes (tab) | draft | draft | — | Section view | active |
| ├ Worktable | the pre-conversion continuous draft | yes, when `mount: worktable` | draft | draft | — | Whole view | active (legacy path) |
| ├ StructureReview | confirm imported section breaks | yes, conditional | structure proposals | `structure/proposals/adopt` | — | outline | active |
| ├ MaterialsDrawer / WorkDrawer | declared belongings of the Work | yes | living-works materials | declarations | — | Library, Materials rail item (`later`) | active |
| ├ StudioLowerBand | outline · threads · timeline · word-web | yes | — | — | — | outline panel | **partial** — 4 tabs, most inert |
| `/writers-studio/develop` | encounter frozen developmental readings | **linked once**, from `studioMap` | `readings`, `readings/[id]`, `standings` | standings | reading = MAIA output, frozen | editorial conversation | **active, thinly reached** |
| `/writers-studio/review` | look at one structure proposal | ⚠️ **no UI link** — only named in a route's JSON | one proposal | — | — | StructureReview (in-canvas) | **orphaned witness surface** |
| `/writers-studio/lab/maia` | MAIA cognition harness | ⚠️ no inbound link | — | — | harness | — | **experimental / founder harness** |
| `/press/manuscript` | import · draft · keeps · collections · emerging · export · book | **deep link only**, 2 of 7 tabs | manuscripts, draft, keeps, collections, candidates, render | ingest, keeps, render | — | canvas draft, Library | **active but disconnected** |
| `/press` | public Soullab Press landing | yes | — | — | — | — | active (marketing) |
| `/press/studio` | — | **redirects → `/writers-studio`** | — | — | — | — | **retired address** |
| `/book-studio/*` (10 pages) | visual page layout, workbench, render, passages, illustrations, epub | **founder-gated** | own tables, uploads, docx import | own | — | press render/export, ingest | **gated / parallel lineage** |
| `/library`, `/maia/library`, `/oracle/library` | wisdom files, articles, search | yes | library corpus | — | ask-jeeves search | Materials, research | **adjacent, not Work-scoped** |

---

## 2 · Where MAIA enters — three different doors, in one room

| Surface | Door | State |
|---|---|---|
| `MaiaColumn` | none — renders context, holds no member material | **active** default panel |
| `StudioConversation` | `/api/sovereign/app/maia/list`, client-minted `sessionId` + client `userId`, local `Turn[]` | **active when the editorial flag is off** |
| `EditorialConversation` | `/api/writers-studio/editorial/{thread,turn,version}`, durable server thread | **active when `WRITERS_STUDIO_EDITORIAL_ENABLED=1`** |
| `AskMaia.tsx` (canvas folder) | — | ⚠️ **mounted nowhere.** Not imported by the room |
| `/writers-studio/develop` | `readings` — frozen, evidence-linked | active |

⭐ Two of these are the *same job* under a flag; a third does an adjacent job in
a different room; a fourth exists as a component with no mount.

---

## 3 · Substrate, and what reaches it

| Substrate | Reached by | Note |
|---|---|---|
| `proposalChain/` — chains, versions, succession | editorial routes | **live** |
| `editorialRuntime/` — thread, turn, member act, member version, assembly | editorial routes | **live**, flag-gated |
| `editorialDiscourse/` — the structured envelope | editorial runtime | live |
| `sections/`, `source/`, `ingest/`, `render/`, `structure/` | `/api/sovereign/manuscripts/*` | live |
| `developmentalReader/`, `developmentalReading/` | readings routes + DevelopRoom | live |
| `standing/` | standings route | live |
| `ask/` | `/manuscripts/[id]/ask`, StructureReview | live |
| ⚠️ **`revisionAuthorization/`** — authorize · status · executionFit · **execute** | **ZERO `app/` importers** | ⭐⭐ **built, tested, and unreachable** |
| ⚠️ **`editorialWorkspace/`** — ontology + store | **ZERO `app/` importers** | **built and unreachable** |

⭐⭐ **The Adopt machinery already exists in full** — authorization contract,
status, execution-fit and execution — with **no route and no surface**. This is
the census's most consequential single finding: the capability that would let an
approved version actually reach the manuscript is not missing. It is
**disconnected**.

---

## 4 · Adjacent capability that may belong in the Studio

Ingestion (`manuscripts/ingest`, `book-studio/import-docx`) · render/export
(`manuscripts/[id]/render`, `book-studio/render{,/epub}`, `connectors/obsidian/export`) ·
library search (`library/search`, `library/ask-jeeves`) · materials
(`living-works/[id]/materials`, `practitioner/materials`) · keeps · collections ·
candidates · structure proposals · marked lines · studio history.

---

## 5 · Observations only — ⛔ no recommendation

1. **Two Studios share one manuscript.** Canvas and `/press/manuscript` both
   read and write the working draft, by different routes, with different
   vocabularies (*draft* · *keeps* · *collections* · *emerging*).
2. **Three MAIA presentations in one room**, two of them the same job under a flag.
3. **Two editors** (Section, Whole) plus a third pre-conversion path (Worktable).
4. **The rail declares sixteen destinations and offers three.** Four more are
   satisfied as in-room panels; nine are plainly unavailable.
5. **Feature-gated ≠ absent.** `WRITERS_STUDIO_EDITORIAL_ENABLED` and
   `WRITERS_STUDIO_FOCUS_ENABLED` are both **off by default**, so the newest and
   most coherent editorial capability is invisible in ordinary configuration.
6. **Valuable but disconnected**, in descending order of consequence:
   `revisionAuthorization` (Adopt/execute) · `editorialWorkspace` ·
   five `/press/manuscript` tabs · `AskMaia.tsx` · `/writers-studio/review`.
7. **One retired address** (`/press/studio` → `/writers-studio`) and **one gated
   parallel lineage** (`/book-studio/*`, founder-only, 10 pages, its own
   ingestion and render).
8. **Structure is proposed and adopted in one place** (canvas StructureReview →
   `structure/proposals/adopt`) and **displayed in several** (outline panel,
   lower-band outline, `/writers-studio/review`).

---

## 6 · Standing

**WS-02 · ACT 1 COMPLETE · READ-ONLY · ⛔ NO JUDGMENTS TAKEN · HOLDING FOR
FOUNDER READING BEFORE ACT 2.**
