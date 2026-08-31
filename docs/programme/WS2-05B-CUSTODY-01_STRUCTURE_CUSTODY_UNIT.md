# WS2-05B-CUSTODY-01 — Canonical Custody of 05A + 05B-5a/5b/5c · Unit Definition

> **Scope established. Not executed.** In the WS-01 pattern: *"Do not implement that repair until
> its scope is established."* This unit takes custody of completed work. ⛔ **It does not redesign
> it, and it does not build 5½ inside itself.**

| Field | Value |
|---|---|
| **Unit ID** | `WS2-05B-CUSTODY-01` |
| **Objective** | Bring the completed 05A + 05B-5a/5b/5c work onto canonical, without redesign. Nothing else. |
| **Source located** | `origin/claude/writers-studio-ws2-03b-qf49hj` @ **`845adb88`** · 2026-08-31 · *"WS2 roadmap: the governing boundary and the strict ordering"* |
| **Target** | canonical `55021771` (`clean-main-no-secrets`, 2026-08-30) |
| **Gate it clears** | **Gate A** of `WS2-05B-5HALF_MAIA_STRUCTURE_READER_LANE.md` §2 |
| **Gate it does not clear** | **Gate B** — BUILD MODE remains CLOSED; that is a founder/programme act |
| **Stop condition** | 05A + 05B substrate on canonical, tests meaning what they claim. **Then stop.** |

---

## 1. The work exists, and it is good

The census of 2026-08-31 reported these symbols at **0 files on canonical**. That reading stands —
and the work is not lost. It is on the branch above, complete, with tests:

```text
lib/manuscript/structure/
  evidence.ts               425 LOC   mechanical perception — StructureEvidence
  interpret.ts              394 LOC   the reader seam + the host loop
  review.ts                 523 LOC   member review of a proposal
  structureService.ts       470 LOC   05A — the ONLY writer of manuscript_structure_units
  detect.ts                 336 LOC
  tree.ts                   249 LOC
  proposalStore.ts          256 LOC
  reviewOperationParser.ts  160 LOC
  fixtures.ts
  __tests__/                6 files · 111 cases
    evidence 11 · interpret 21 · proposalGuard 5 · review 28 · reviewOperationParser 19 · tree 27

app/api/sovereign/manuscripts/[id]/structure/route.ts
app/api/sovereign/manuscripts/[id]/structure/proposals/route.ts
app/api/sovereign/manuscripts/[id]/structure/proposals/[proposalId]/route.ts

database/migrations/
  20260830000002_manuscript_structure.sql              manuscript_structure_units · _members
  20260830000003_manuscript_structure_contiguity.sql
  20260830000005_manuscript_structure_proposals.sql    manuscript_structure_proposals

scripts/ws2-05a-structure-witness.ts · ws2-05b-proposal-witness.ts · ws2-05b-review-witness.ts
```

**The seam 5½ attaches to already exists, and is exactly as narrow as the charter assumed:**

```ts
export type StructureReader = (input: ReaderInput) => Promise<ReaderOutput>;

export async function interpretStructure(
  evidence: StructureEvidence,
  sections: readonly HeadedSection[],
  reader: StructureReader,
  opts: InterpretOptions,
): Promise<InterpretResult>
```

⛔ **This unit does not touch these files' contents.** They are taken as they are.

---

## 2. The split — and why it matters more than it looks

Custody is **not** one act. Comparing the lane branch against canonical across the Writer's Studio
surface — 117 files censused — gives:

```text
83 absent on canonical  ·  28 identical  ·  6 divergent
```

The six divergent files are the decisive finding:

```text
app/writers-studio/canvas/page.tsx
app/writers-studio/canvas/Worktable.tsx
app/writers-studio/canvasIdentity.ts
app/writers-studio/studioMap.ts
app/writers-studio/__tests__/canvasParamPin.test.ts
app/writers-studio/__tests__/studioMap.test.ts
```

**Every one is a Canvas file, and Canvas is frozen.** A single custody act would land the 05
substrate *and* a Canvas-surface generation *and* thirteen absent `app/writers-studio/studio/**`
design modules under a binding freeze. That is not custody; it is a release.

So the unit splits, and the split is load-bearing:

### 2.1 Custody A — substrate · **29 files · executable under the freeze**

Import closure verified. Its only dependencies outside itself are already on canonical:

```text
@/lib/db/postgres  ·  @/lib/auth/getMemberFromRequest  ·  @/lib/http/apiBase
```

```text
lib/manuscript/structure/**                            15   (9 impl · 6 test files)
app/api/sovereign/manuscripts/[id]/structure/**         3
lib/writersStudio/{structureClient,outlineOrder,reviewPresentation}.ts   3
lib/writersStudio/__tests__/{outlineOrder,reviewPresentation}.test.ts    2
database/migrations/2026083000000{2,3,5}_*.sql          3
scripts/ws2-05{a,b}-*-witness.ts                        3
                                                       ──
                                                       29   all absent on canonical
```

`reviewPresentation.ts` is in **A**, not B, because `structure/proposals/[proposalId]/route.ts`
imports it server-side. Its own closure — `outlineOrder` → `structureClient` → `@/lib/http/apiBase` —
is complete and Canvas-free.

⛔ **Custody A touches zero Canvas files and modifies zero existing files.** It is 29 additions.
Nothing on canonical imports it, so it lands as substrate with no member-visible change — which is
what makes it lawful under a closed BUILD MODE, and what obliges the Board to record it honestly as
**ZERO-CALLERS** until 5½ and the surface arrive.

### 2.2 Custody B — surface · **BLOCKED by Gate B**

```text
app/writers-studio/canvas/StructureReview.tsx · StructuredOutline.tsx · ManuscriptOutline.tsx
app/writers-studio/studio/**                                          13 absent modules
the 6 divergent Canvas files above
```

⛔ **Not in this unit.** It requires the Canvas freeze to release, and it is a surface decision
about which Canvas generation is the live one — precisely the WS-02 convergence question the
Programme Board already holds.

---

## 3. Consequence for the 5½ lane

**5½ needs Custody A only.** A `StructureReader` is a server-side function behind
`interpretStructure`; it does not need `StructureReview.tsx` to exist. Therefore:

```text
Gate A  =  Custody A     — executable now, under the freeze
Gate B  =  the release   — still required before 5½ BUILDS
Custody B                — rides with the Canvas convergence, not with 5½
```

The two gates are **not** strictly sequential in the way the plan assumed: Gate A's substrate half
can be satisfied while BUILD MODE stays closed, because it adds no reachable behaviour. What Gate B
still governs is whether 5½ may be **built**, and whether any of it may become **visible**.

---

## 4. Acceptance

Six criteria. Each is evidence, not narration.

| # | Criterion | Proof |
|---|---|---|
| 1 | **Located** | source branch + tip SHA recorded; §1 file inventory matches the branch tree |
| 2 | **Provenance exact** | for each of the 29 files, the source blob SHA is recorded, and the file landing on canonical is byte-identical to it |
| 3 | **Compared to canonical** | all 29 confirmed absent on the target ref before landing; ⛔ zero existing files modified |
| 4 | **Tests still mean what they claim** | 111 cases run green on canonical **and** the guards are shown capable of failing — at minimum `assertNoProse` (5 cases) must reject a reading carrying manuscript prose, and `interpretStructure` must refuse `unknown-section`, `child-outside-parent` and `ambiguous-without-alternatives`. A suite that passes because nothing calls it is not proof |
| 5 | **The invariant holds on canonical** | `structureService.ts` is the **only** writer of `manuscript_structure_units`; no path from `interpretStructure` or the proposals routes reaches it. Demonstrated by import graph, not asserted |
| 6 | **Landed without redesign** | the diff is 29 additions and 0 modifications; ⛔ no renames, no "improvements", no lint-driven rewrites |

**Migrations.** The three carry dated filenames from the source lane (`20260830…`). They land
unrenamed — renaming to look newer would manufacture provenance. They are additive
(`CREATE TABLE IF NOT EXISTS`) and are applied through the normal deploy migrate path, never by hand.

---

## 5. Explicitly out of scope

⛔ Do **not**, inside this unit:

```text
build 5½ · implement any StructureReader · wire a route to a live reader
land Custody B · touch a Canvas file · modify any existing file
resolve trigger / bodies / provenance · re-run the 05 design
lift BUILD MODE · declare Gate B satisfied · update the Board's programme mode
```

If any of the 29 files turns out to need a change to land, **stop and report it**. A file that
cannot land unmodified has diverged, and divergence is a finding — it converts this unit into a
bounded reconciliation with its own record. ⛔ It is never a licence to redesign in flight.

---

## 6. Then

```text
WS2-05B-CUSTODY-01           substrate on canonical, zero callers
        ↓
FOUNDER / PROGRAMME ACT      WS-01 ACCEPTED + CANVAS FREEZE RELEASED
                             + NEXT BUILD UNIT AUTHORIZED
        ↓
WS2-05B-5HALF-…-01           the MAIA Structure Reader
        ↓
05B-6                        AuthorStructureCommand — the sovereignty boundary
```

⛔ This unit is not the founder act. It makes the founder act possible to take on evidence.
