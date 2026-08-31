# WS2-05B-CUSTODY-01 — Canonical Custody of 05A + 05B-5a/5b/5c · Unit Definition

> **Custody A AUTHORIZED. Custody B HOLD.** Founder ruling, 2026-08-31. This unit takes custody of
> completed work. ⛔ **It does not redesign it, and it does not build 5½ inside itself.**

## Founder ruling — 2026-08-31

> *"Custody A is lawful under the freeze. Custody B is not. The freeze closes BUILD MODE. It does
> not require canonical to remain ignorant of already-completed, behaviorally inert substrate."*

Custody A is not new product work. It is custody of already-built 05-series substrate whose
provenance is known, whose closure is established, and whose landing changes zero existing files —
consistent with the programme rule that **canonical custody is what makes something a real
programme entry** (§A3.1).

```text
CUSTODY A
  canonical landing        AUTHORIZED
  29 additions             REQUIRED
  existing modifications   0
  Canvas files             0
  redesign                 0
  acceptance-state change  0

DEPLOY                     NOT AUTHORIZED
MIGRATION APPLICATION      NOT AUTHORIZED
5½ IMPLEMENTATION          NOT AUTHORIZED
CUSTODY B                  BLOCKED BY GATE B
```

### The inertness correction — recorded, because the first rationale was too loose

⛔ **"29 additions nothing imports" is not by itself sufficient to say nothing is reachable.**
The set includes three `app/api/**` routes and three migrations. Those become **potentially live
on deploy**, with or without an importer. Inertness is therefore established by **deployment not
occurring**, never by importer count.

**Precondition, checked before landing:** *if merging to canonical automatically deploys or
automatically applies migrations, Custody A must HOLD before merge.*

**Checked 2026-08-31 — it does not:**

| Evidence | Finding |
|---|---|
| `.github/workflows/deploy.yml` | the only workflow carrying migration/ssh steps; triggers on `push: [main, production]`, `tags: v*`, `pull_request: [main]`, `workflow_dispatch` — **not** `clean-main-no-secrets`. Per `canonical-pr-quality.yml`'s own header, `main` has not moved since 2026-04-10 |
| workflows triggered by a canonical push | `sovereignty-gate` · `jarvis-epistemic-guard` · `canonical-pr-quality` — quality/admission gates, **no deploy, no migrate** |
| production deploy path | `scripts/deploy-production.sh` / `pre-deploy-gate.sh` on minisforum, behind the deploy-lane `flock` and an explicit SHA argument — **a manual, separately governed act** |

**Therefore canonical custody may proceed, and deployment remains a separate governed act.**
The migrations land as **files**; they are applied only by a future authorized deploy.

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

### The decisive statement

> **The resulting canonical diff is exactly the identified 05A/05B substrate closure: 29 added
> files, zero modified files, zero deleted files, zero Canvas files, and no unrelated programme
> state change.**

### Source provenance — preserved explicitly

```text
source:
origin/claude/writers-studio-ws2-03b-qf49hj
845adb884...
```

⛔ **The files are not recreated from memory.** The exact artifacts are transferred
(`git checkout <source-ref> -- <paths>`) and equivalence is proved blob-by-blob against the source
tree.

### Six criteria. Each is evidence, not narration.

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

---

## 7. Custody A — execution record · 2026-08-31

Executed on `claude/writers-studio-maia-roadmap-vnby0k`. ⛔ The merge to canonical is a separate
act, not taken here.

### Precondition cleared before transfer

```text
merging to canonical auto-deploys?          NO   deploy.yml triggers main/production/tags only
merging to canonical auto-applies migrations? NO  no migration step on any canonical-push workflow
                                                  (sovereignty-gate · jarvis-epistemic-guard ·
                                                   canonical-pr-quality are gates)
```

### The decisive statement — met

```text
added     29        modified   0        deleted   0
Canvas    0         redesign   0        acceptance-state change   0
```

### Criterion-by-criterion

| # | Criterion | Result |
|---|---|---|
| 1 | Located | `origin/claude/writers-studio-ws2-03b-qf49hj` @ `845adb884…` |
| 2 | Provenance exact | transferred with `git checkout <source-ref> -- <paths>`; **29/29 blobs identical** to the source tree, 0 mismatched. ⛔ Nothing recreated from memory |
| 3 | Compared to canonical | all 29 confirmed absent before landing; diff is `29 A`, no `M`, no `D` |
| 4 | Tests mean what they claim | **145 passed / 145** across 8 suites (111 in the six `lib/manuscript/structure/__tests__` files + 34 in the two `lib/writersStudio` tests) — and **shown capable of failing**, see probes below |
| 5 | Invariant holds | `structureService.ts` is the **only** writer of `manuscript_structure_units`; the two other mentions (`proposalStore.ts`, `review.ts`) are **header comments declaring the invariant**, not SQL. `structureService` has exactly two importers: `structure/route.ts` (05A) and the 05A witness script. ⛔ Neither `interpretStructure` nor either proposals route reaches it |
| 6 | No redesign | 0 modified files, 0 renames |

### Controlled probes — the gates can fail

Both mutations were reverted and blob-equivalence re-verified; the suite returned to 145/145.

| Probe | Mutation | Result |
|---|---|---|
| **1 · sovereignty guard** | `assertNoProse`'s `FORBIDDEN` field pattern neutered | **3 of 5 failed** — and the two *permits* cases correctly still passed, so the guard discriminates rather than merely throwing |
| **2 · refusal path** | `ambiguous && alternatives.length < 2` → `< 0` | **1 failed** — *"an ambiguous reading carrying only one alternative"*. The no-fake-choice protection is real |

### Boundary held

```text
migration executed        NO   files only; applied by a future authorized deploy
route deployed            NO   no deploy attempted, no container touched
5½ implemented            NO   no StructureReader exists anywhere
Custody B landed          NO   0 Canvas files, 0 app/writers-studio/studio/** files
Board BUILD MODE          CLOSED — unchanged
Board acceptance states   unchanged (WS-01 still IN ACCEPTANCE, P0-D still owed)
```

### Dependency isolation

Every local import in the 29 files resolves against canonical. Zero references to any of the six
divergent Canvas files, and zero to `StructureReview` · `StructuredOutline` · `ManuscriptOutline` ·
`studioTheme` · `studio/StudioType` — the Custody B surface. **The substrate does not reach for it.**


---

## 8. Custody A — canonical submission · 2026-08-31

Founder ruling: ⛔ **do not fast-forward canonical directly; let the canonical PR gates witness the
custody transfer**, and ⛔ do not submit from the roadmap branch, whose programme/charter changes are
a separate artifact and must not be smuggled through Gate A.

### Correction — `dcf4c009` was not a pure custody commit

The execution commit on `claude/writers-studio-maia-roadmap-vnby0k` was **29 A + 2 M**: it carried
the 29 substrate files *and* edits to this unit definition and the 5½ charter. A cherry-pick of it
would therefore have landed `29 added / 2 modified`, failing the decisive acceptance condition.

The pure commit was constructed instead: a branch cut fresh from canonical, with only the 29
substrate paths applied from the source tree and blob-equivalence re-proved.

```text
branch  feature/ws2-05b-custody-01   (from origin/clean-main-no-secrets @ 55021771)
commit  1 · 29 added · 0 modified · 0 deleted · 0 Canvas · 0 docs · 6,771 insertions
source  origin/claude/writers-studio-ws2-03b-qf49hj @ 845adb884…   29/29 blobs identical
PR      SoullabTech/Sovereign#1158 → clean-main-no-secrets
```

### Verified on the submitted branch

```text
jest       145 passed / 145 · 8 suites
probes     assertNoProse neutered → 3 of 5 failed (both "permits" cases still passed)
           ambiguous < 2 → < 0    → 1 failed
           both reverted; blob-equivalence re-verified; suite back to 145/145
typecheck  green — "No TypeScript regressions" (231 errors vs 239 baseline,
           4,094 program files vs 3,965). ⛔ Baseline deliberately NOT re-recorded
check:phi-gate      pass   (one advisory on a pre-existing January migration)
check:no-supabase   pass
```

### ⛔ Standing constraint while the PR is open

A CI failure on this PR **may not be fixed by patching the substrate.** Any edit to the 29 files, or
any added file, breaks the `29 added / 0 modified` condition that is the unit's whole acceptance.
If a gate fails, the correct act is to **report the failure and stop** — a failing gate on unmodified
custody is a finding about canonical or about the gate, and it belongs to a ruling, not to a patch.

### After merge

```text
Gate A substrate custody   COMPLETE
Gate B                     still CLOSED
5½                         still NOT AUTHORIZED
Custody B                  still HOLD
```
