# WRITER'S STUDIO — Repository → Reference Field Map

The first action of the target-implementation charter: **what already exists
underneath the current interface**, resolved against the five target fields.

Not a concept document. Every row was checked in the repository on 2026-08-27.

```text
REUSE AS-IS        works, and the target uses it unchanged
REUSE + RECOMPOSE  the capability is real; its presentation or vocabulary moves
EXTEND             a real substrate that does not yet reach the target's scope
NEW                nothing underneath it
```

---

## §0 — The reference images are under repository custody

**Corrected 2026-08-28.** This section previously stated the opposite. The pack
landed in `1493c28c0` (2026-08-27) at `docs/design/writer-studio/references/`,
`DESIGN-CONTRACT.md` §0 is **FROZEN**, and **WS2-00 is CLOSED**. The earlier
text was accurate when written and stale thereafter; it is replaced rather than
annotated, because a reconstruction source that argues with itself is worse than
one that is merely out of date.

```text
reference pack        IN CUSTODY
custody commit        1493c28c0
DESIGN-CONTRACT       FROZEN
WS2-00                CLOSED
canonical WS-WRITE    04-writing-field-wide.png
03 / 06 / 07          one duplicated reference state (md5-verified)
```

This map never depended on custody: placement and capability are resolvable from
the repository; composition is not. What changes is that composition is now
resolvable too — visual acceptance compares against an image.

The canonical readings recorded here stand, with one correction carried from
DESIGN-CONTRACT §0.1: the **Writing Field with the Materials strip along the
bottom** is `08-writing-field-compact.png`, and it is the **secondary**
reference. `04-writing-field-wide.png` is canonical for WS-WRITE because only 04
carries the five-mode navigation the whole programme is built around. The
**Developmental Review with finding-disposition controls visible** stands as
read.

---

## §1 — WS-WRITE — Writing Field

| Target capability | Substrate | Class |
|---|---|---|
| manuscript draft read / autosave / checkpoint | `[id]/draft` | REUSE AS-IS |
| chapter navigation (Parts → Chapters) | `manuscriptMap.ts` + `manuscript_sections` | REUSE + RECOMPOSE |
| chapter framing / splice-safe editing | `frameForRegion`, `spliceFrame` | REUSE AS-IS |
| writing surface | `WritingSurface.tsx` — plain `<textarea>` | EXTEND (rich text) |
| MAIA companion, adjacent | `Companion.tsx`, `studio/companion` | REUSE + RECOMPOSE |
| Reflect · Question · Notice · Connect | `Companion.tsx` | REUSE AS-IS |
| Materials strip along the bottom | `MaterialsDrawer.tsx`, `studio/materials` | REUSE + RECOMPOSE |
| Versions accessible without leaving | `VersionsPanel.tsx`, `draft/revisions` | REUSE + RECOMPOSE |
| find in chapter / find in manuscript | `findInDraft`, `manuscriptTools.ts` | REUSE AS-IS |
| focus mode | present in `Worktable.tsx` | REUSE AS-IS |
| word count / saved state | present | REUSE AS-IS |
| Goals strip | — | **NEW** |
| formatting toolbar (B / I / U / lists / link / image / table) | — | **NEW** (follows rich text) |

## §2 — WS-GATHER — Materials Studio

| Target capability | Substrate | Class |
|---|---|---|
| materials list / create | `studio/materials` | REUSE AS-IS |
| one material + file bytes | `studio/materials/[id]`, `/file` | REUSE AS-IS |
| kinds: document · note · transcript · audio · image · link | `MATERIAL_KINDS` | REUSE AS-IS |
| provenance / custody of the arriving artifact | `lib/manuscript/source/`, `recordArtifactArrival` | REUSE AS-IS |
| SOURCE → MATERIAL → WORK model | `materials/kinds.ts` claim model | REUSE + RECOMPOSE |
| relationship-to-work (Core / Supporting / Background / Reference / Peripheral / Exclude) | the writer's sentence exists; the **scale does not** | EXTEND |
| tags | — | **NEW** |
| collections | `manuscripts/[id]/collections` | EXTEND (manuscript-scoped, not material-scoped) |
| preview · details · provenance · connections tabs | provenance exists; the rest | EXTEND |
| audio player + transcript preview | transcript kind exists; no player | **NEW** |
| MAIA Gather — What Belongs / Connections / Patterns | `companionStance`, `patternInquiryProtocol` | EXTEND |
| import intake | `manuscripts/ingest` — **repaired 2026-08-27** | REUSE AS-IS |

## §3 — WS-STRUCTURE — Structure & Versions

| Target capability | Substrate | Class |
|---|---|---|
| Parts / Chapters outline | `manuscriptMap.ts` | REUSE + RECOMPOSE |
| chapter boundaries (subheads nested, not promoted) | `segment.ts` — **repaired 2026-08-27** | REUSE AS-IS |
| drift + doorless parts reported honestly | `DraftMap.adrift` / `.unnamed` | REUSE AS-IS |
| version history list | `draft/revisions` | REUSE AS-IS |
| restore a version | `draft/revisions/[revision]` | REUSE AS-IS |
| compare two versions | `lib/studio/diff.ts` | REUSE + RECOMPOSE |
| version notes | `working_draft_revisions.note` — column exists, no UI | EXTEND |
| Structure Map (the visual whole-form view) | — | **NEW** |
| Timeline · Threads · Flow · Table views | — | **NEW** |
| Movements | `developmental/lenses.ts` has a `movement` lens | EXTEND |
| Themes & Threads ribbon | — | **NEW** |
| branch a version | — | **NEW** |
| MAIA structural observations | `RoomFacts` carries **no structure** | EXTEND (see §6) |

## §4 — WS-DEVELOP — Developmental Review

| Target lens | Substrate | Class |
|---|---|---|
| Whole Work | `LENSES.whole_work` | REUSE AS-IS |
| Continuity | `LENSES.continuity` | REUSE AS-IS |
| Reader Experience | `LENSES.reader` | REUSE + RECOMPOSE (rename) |
| Structure | `LENSES.movement` | REUSE + RECOMPOSE (rename) |
| Themes | `LENSES.threads` — but Threads is a **Structure** concept in the target | EXTEND |
| Questions | — | **NEW** |

| Target capability | Substrate | Class |
|---|---|---|
| review run + progression | `studio/review`, `/[id]/advance` | REUSE AS-IS |
| findings with evidence passages | `studio/review/finding/[id]` | REUSE AS-IS |
| finding disposition, member-controlled | `DISPOSITIONS` set | REUSE + RECOMPOSE |
| grouping / filtering / priority bands | — | **NEW** |
| Discuss-this-finding conversation with MAIA | `Companion.tsx` + finding context | EXTEND |

**⚠ Vocabulary divergence, needs a decision before WS-DEVELOP is built.**
The code's dispositions are `new · discussed · recognized · adopted · rejected ·
unresolved · resolved`. The charter names `Unresolved · Discussed · Keep ·
Adopted · Dismissed`. `Keep`≟`recognized` and `Dismissed`≟`rejected` are not
obviously the same act — *Keep* sounds like the writer holding a finding open on
purpose, *recognized* like the system noting they saw it. Renaming a member's
adjudication vocabulary silently would change what their past dispositions mean.
This must be settled explicitly, not mapped by resemblance.

**⚠ Naming collision.** `lib/studio/reviewLens.ts` is a **different thing** from
`lib/studio/developmental/lenses.ts`. The first is therapeutic modalities —
`cbt`, `jungian`, `ifs`, `family_constellations` — and is what the sidebar calls
**Reader Lenses**. The second is the developmental review's lenses. Two modules
named "lens", two unrelated meanings, one of them member-facing. The target
shows both in the same sidebar. Do not let them merge.

## §5 — WS-HOME — Work Home

| Target capability | Substrate | Class |
|---|---|---|
| current work + Continue Writing | `HomeView.tsx`, `homeState.ts` | REUSE + RECOMPOSE |
| identity-safe opening (emit the id or refuse) | `canvasIdentity.ts` — **D-010, live** | REUSE AS-IS |
| recent works | `useLivingWorks.ts` | REUSE AS-IS |
| recently added materials | `studio/materials` | REUSE AS-IS |
| recent MAIA insights | `studio/companion` | EXTEND |
| active goals | — | **NEW** |
| cover imagery per work | — | **NEW** |
| tools for your path (Map Your Story / Character Studio / Scene Weaver) | — | **NEW** |
| audience shelves (For Therapists / Coaches / …) | — | **NEW** |

## §6 — Shared shell + MAIA

| Target capability | Substrate | Class |
|---|---|---|
| work selector, always present | `WorkDrawer.tsx` | REUSE + RECOMPOSE |
| current manuscript identity, never ambiguous | `canvasIdentity.ts` | REUSE AS-IS |
| saved state / word count in the chrome | present in `Worktable.tsx` | REUSE + RECOMPOSE |
| five-field navigation (WRITE/DEVELOP/EXPLORE/REVIEW/PUBLISH) | — | **NEW** |
| global search | — | **NEW** |
| notifications | — | **NEW** |
| one MAIA, contextual per field | `companionStance.ts` → `RoomFacts` | EXTEND |

**The load-bearing constraint on MAIA.** `RoomFacts` today is `workTitle ·
workPurpose · workForm · workStage · materials[] · manuscriptTitle · draftChars ·
draftExcerpt` — and `DRAFT_EXCERPT_CHARS = 6000`, **the opening only**. No
structure, no revision history, no cursor position, no prior finding.

Every "MAIA observes X" panel in the references — structural observations,
thread continuity, discussing a finding's evidence — requires `RoomFacts` to
carry something it does not carry. That is the single largest EXTEND in this
map, and it is the one that must be done **with exclusion designed in**, never
by handing MAIA the whole manuscript. The honesty scaffolding that exists (the
block states the excerpt is an excerpt; the stance forbids inventing material
not given) must survive intact.

---

## §7 — What is refused, in every field

From DECISIONS D-003 and DESIGN-CONTRACT §4, and visible in the references:

```text
86% Movement Health · 76% Overall Cohesion · Coherence: Strong · Balance: Good
82% / 88% / 87% per movement · High Priority · 87% Complete
```

**None of these ship as measurements.** They are judgments wearing the costume of
measurement. What ships is what MAIA actually noticed, with the passage it
noticed it in, and the writer assigns the importance.

Computable and showable: word count · section count · material count · version
count · finding count · passage count · reading time · goal progress against a
**writer-declared** target.

This is not a WS-DEVELOP detail. The references put these numbers in four of the
five fields.

---

## §8 — The count

```text
REUSE AS-IS         24
REUSE + RECOMPOSE   14
EXTEND              12
NEW                 21
```

The substrate is real: **38 of 71 target capabilities already work**, and the
identity, custody, segmentation and intake repairs from WS2-01 are underneath
all of them. What is missing is mostly *composition* and four genuinely new
surfaces — Structure Map, Goals, global search, and MAIA's reach into structure.

---

LAST UPDATED 2026-08-27
