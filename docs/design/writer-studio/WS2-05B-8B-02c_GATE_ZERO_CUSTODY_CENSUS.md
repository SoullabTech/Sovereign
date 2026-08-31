# WS2-05B-8B-02c · GATE ZERO — Custody Census & Convergence Ruling

**Status:** Gate Zero adjudicated. No 02c implementation performed.
**Method:** direct tree-to-tree blob comparison. No three-dot / merge-base-relative
status was used as evidence of what canonical lacks.

## 0 · Pinned evidence

```
CANONICAL                 7ed38723ee3cbc02a10be57006136d21b4fce7d4
FOUNDER-WITNESSED 02a     eeb452dcbc61f9e655004595f5103d6320f2a25a
merge-base                717d01d1b51ab8f018dc7073221072a33fce1006  (2026-08-28)
custody source            845adb88472268ec5a7c276b56046661ec5e80db
```

Divergence from merge-base: **canonical +45 commits · lane +128 commits.**
Repo-wide blob census (11,179 paths): 11,003 IDENTICAL · 16 CANONICAL-AHEAD ·
11 LANE-AHEAD · 14 TRUE-DIVERGENCE · 21 CANONICAL-ONLY · 114 LANE-ONLY.

## 1 · The decisive finding

Canonical is **not** behind the lane on the 05A/05B substrate. Commit
`03fe90d8 WS2-05B-CUSTODY-01` already performed a deliberate canonical-first
custody transfer from `845adb884` — an earlier point of this same lane —
explicitly excluding the reader and the surface.

Verified mechanically: `git diff 845adb884 7ed38723 -- lib/manuscript/structure
lib/writersStudio app/api/sovereign/manuscripts/[id]/structure` reports **no
change** to any transferred file. Canonical's structure core, its three structure
routes, `structureClient/outlineOrder/reviewPresentation`, the three
`20260830*` structure migrations and the three `ws2-05*` witness scripts are
**byte-identical** to their lane source.

Consequence: the 14 TRUE-DIVERGENCE rows under `lib/manuscript/structure/**`
and `scripts/ws2-05*` are an **artifact of the merge base**, not real conflicts.
Those files simply did not exist at `717d01d1`; both sides "added" them. Measured
against the real seam (`845adb884`) they are **LANE-AHEAD** — a clean
fast-forward, with no canonical work to lose.

## 2 · CANONICAL HAS

- Full 05A/05B structure substrate — `detect · evidence · fixtures · interpret ·
  proposalStore · review · reviewOperationParser · structureService · tree` + 6 test files
- Structure + proposal routes (all three, identical to lane)
- `lib/writersStudio/{structureClient,outlineOrder,reviewPresentation}.ts` + 2 tests
- Structure migrations `20260830000002 / 000003 / 000005`
- Witness scripts `ws2-05a-structure`, `ws2-05b-proposal`, `ws2-05b-review`

## 3 · 02c REQUIRES / MISSING FROM CANONICAL

**Reader substrate** (all LANE-ONLY, authored *after* custody — clean adds):
`maiaReader.ts` (764) · `readScope.ts` (60) · `readerProvenance.ts` (24) ·
`canonicalFingerprint.ts` (45) · `__tests__/maiaReader.test.ts` (903) ·
`__tests__/fixtures.test.ts` (85) · migration
`20260831000001_structure_proposal_reader_provenance.sql`

**Structure-core fast-forward** (LANE-AHEAD over byte-identical canonical bytes;
2,514 insertions / **43 deletions** total — overwhelmingly additive):
`interpret.ts` +221 · `fixtures.ts` +179 · `review.ts` +47 · `evidence.ts` +44 ·
`proposalStore.ts` +34, plus their tests.

**Reading surface** (LANE-ONLY): `StructureReview.tsx` · `StructuredOutline.tsx` ·
`studioTheme.ts` · `studio/*` primitives · `lib/writersStudio/reviewClient.ts` ·
`outlineRows.ts` · `app/writers-studio/review/page.tsx`

**Real-book evidence:** the real `e6cab…` proposal path exists only in lane
witness docs (`WS2-05B-8B-02a/02b` witnesses, `WS2_ROADMAP.md`). Canonical has none.

## 4 · TRUE DIVERGENCES (only two, both bidirectional)

| File | Canonical | Lane | Ruling |
|---|---|---|---|
| `app/writers-studio/canvas/Worktable.tsx` | `1ff2d422` #1162 expired-session repair | `3c49aab3` WS2-03B Studio restructure | **Canonical wins. Do not take lane's.** |
| `components/OracleConversation.tsx` | `2edc18d5` VOICE-CANONICAL-CONVERGENCE-02 | `dd89c181` WS2-03C `workContext` (**+18 lines, purely additive**) | **Canonical wins.** Lane's 18 lines are re-appliable *only* if 02c routes through it, and only with `__tests__/voice-non-degradation.test.ts` re-verified. |

## 5 · CANONICAL-ONLY BEHAVIOR THAT MUST SURVIVE

Proven present in canonical and **absent from the lane** (lane tip 18:10Z
predates the repair at 22:49Z):

- **#1162 expired-session save repair** (`1ff2d422`) — all 6 files INTACT at
  canonical HEAD. Lane carries 4 `unauthorized` markers vs canonical's 8–11 in
  `Worktable.tsx` / `WritingSurface.tsx`; `workingDraftClient.ts` and
  `WorkingDraftEditor.tsx` differ. A wholesale lane merge **regresses this defect.**
- **Voice non-degradation** — `__tests__/voice-non-degradation.test.ts`,
  `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`,
  `lib/voice/{transcribeResponse,desktopUtteranceLimits}.ts` + 4 test files,
  `androidVoiceFallback.ts`, `voiceDiagnostics.ts`, `ContinuousConversation.tsx`.
  Governed by the Deep-Intelligence Gate: divergence here is **RED**.
- **Living-works additions** — `considerations/` route + 2 tests,
  `materials/` route + test, `lib/livingWork/materialRelationship.ts`,
  migration `20260828000001_living_work_material_considerations.sql`.
- **Concurrency/substrate witness** — `scripts/verify-ws2-substrate-01-concurrency.ts`.
- **Canonical-only gates/docs** — `.github/workflows/canonical-pr-quality.yml`,
  `scripts/check-design-canon.ts`, design-canon exemption test, `CLAUDE.md`,
  `FIELD_NOTE_003`, PR-1145 governance record.
- `app/writers-studio/canvas/WritingSurface.tsx` — CANONICAL-AHEAD; lane sits at
  the base blob. Take canonical's, discard the lane's.

## 6 · RECOMMENDED 02c BASE

```
7ed38723ee3cbc02a10be57006136d21b4fce7d4   (current canonical, unmodified)
```

Canonical-first is viable **because** the substrate already holds custody here.
The old 03b branch is **not** merged, wholesale or otherwise.

## 7 · SMALLEST SAFE CONVERGENCE SET

The 02c entry surface has a tightly bounded import closure. `review/page.tsx` →
`StructureReview` → `{StudioType, studioTheme, interpret, review, outlineOrder,
reviewClient, reviewPresentation}`. Every external dependency
(`pressTheme`, `apiBase`, `evidence`, `interpret`, `review`,
`reviewPresentation`, `@anthropic-ai/sdk`) is **already on canonical**.

**Tier A — reader substrate (required)**
```
lib/manuscript/structure/maiaReader.ts            (new)
lib/manuscript/structure/readScope.ts             (new)
lib/manuscript/structure/readerProvenance.ts      (new)
lib/manuscript/structure/canonicalFingerprint.ts  (new)
lib/manuscript/structure/__tests__/maiaReader.test.ts, fixtures.test.ts (new)
fast-forward: interpret.ts, review.ts, evidence.ts, proposalStore.ts, fixtures.ts + tests
database/migrations/20260831000001_structure_proposal_reader_provenance.sql
```
No migration-timestamp collision: canonical's only new migration is `20260828000001`.

**Tier B — the reading to talk from (required)**
```
app/writers-studio/studioTheme.ts
app/writers-studio/studio/{StudioType,StudioPanel,StudioSurface,StudioIcon,
                           StudioInsightChip,StudioScrollbars,index}.tsx
app/writers-studio/canvas/StructureReview.tsx
app/writers-studio/canvas/StructuredOutline.tsx
app/writers-studio/review/page.tsx
lib/writersStudio/reviewClient.ts
lib/writersStudio/outlineRows.ts
```

**Tier C — explicitly NOT in the seam**
```
app/writers-studio/canvas/page.tsx   <-- pulls Worktable + StudioConversation +
                                         SectionWriting*; re-opens both hazards
app/writers-studio/canvas/Worktable.tsx        (hazard H1 — #1162)
components/OracleConversation.tsx              (hazard H2 — voice gate)
app/writers-studio/canvas/WritingSurface.tsx   (canonical-ahead)
lib/manuscript/sections/**, sections/write-state routes, draft-sections migration
   — needed only for 02c-4 section-level ask; defer to that slice.
```

Taking Tier A + Tier B reaches the 02c entry surface as a **standalone
`/writers-studio/review` route** that touches **none** of the three hazard files.

## 8 · Stop rule

The stop rule is **not** triggered. A small canonical-first seam exists and is
identified above. Gate Zero returns for adjudication; no 02c code is written.
