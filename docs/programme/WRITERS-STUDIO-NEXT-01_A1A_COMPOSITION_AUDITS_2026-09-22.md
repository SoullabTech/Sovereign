# WRITERS-STUDIO-NEXT-01 · A1A — MANUSCRIPT-CANVAS COMPOSITION AUDITS · 2026-09-22

**Status:** AUDIT PACKET · READ-ONLY · DOCUMENTARY ONLY · ⛔ NO IMPLEMENTATION
**Opened by:** founder act, 2026-09-22 — *three audits only*
**Canonical:** `6f11edcc29ea2de6efa025ecffd3ac3a948bc590`

> ⛔ **This packet answers three evidentiary questions. It takes no ruling, changes no layout, removes no control, and implements no provenance.**

---

## 0 · Opening-integrity gate — PASSED

Run before any output was authored, as part of the authorization:

| Check | Result |
| --- | --- |
| canonical fetched | ✅ |
| canonical == `6f11edcc2` | ✅ exact |
| canonical A1A audit record already exists | ✅ none |
| open PR / branch carrying this act | ✅ none |

⚠️ **Adjacent lane observed, ⛔ untouched:** PR **#1478** — `EDITORIAL-READING-01 / A2 primitive + warrant contract`, on this same canonical, from another session, self-marked not admission-ready. **Not touched by this act.**

⚠️ **Second observation, reported not acted on:** PR **#1470** — *"EDITORIAL-READING-01 A1 — existing-substrate census"* — is still **open** on stale base `578e5ee1`, although that act obtained canonical custody through **#1472**. That is a third account of one act sitting open. ⛔ Outside this authorization; named for disposition.

---

## 1 · AUDIT 1 — E1 live-room width

### The finding

**`RebuildStudioClient.tsx:1383` allocates the room:**

```js
gridTemplateColumns: canvasExpanded ? 'minmax(0, 1fr)'
  : workspaceOpen ? '250px minmax(0, 1fr)'
  : '286px minmax(520px, 1fr) 390px'
```

⭐⭐ **The manuscript column is a REMAINDER — `1fr` — in every state.** The side columns are fixed pixels (286 · 390 · 250); the writing field receives whatever is left.

⚠️ **But it is a BOUNDED remainder, and the distinction matters.** Three constraints ride on it:

- a **floor**: `minmax(520px, 1fr)` in the default three-column state;
- a **measure cap**: `article { maxWidth: workspaceOpen ? 1040 : canvasExpanded ? 840 : 760 }` (`:1534`);
- **responsive padding**: `clamp(34px, 7vw, 100px)` / `clamp(40px, 14vw, 220px)` (`:1533`).

So the live room is ⛔ **not** the naive unbounded-remainder failure. It is a floored, capped remainder.

### What the ratified law requires

`studioTheme.ts:447` — `writingFieldLayout()` — is the E1 enforcement, and its own contract states the law:

> *"Every column is returned explicitly — the writing field is a computed width, **not a `flex: 1` remainder**, so what renders is what was measured."*

It allocates `GUTTER_FRACTION = 0.058` first, then divides the remainder in the measured `COLUMN_FRACTION` ratio, with `LAYOUT_TOLERANCE = 0.015` *"stated as a tolerance and tested rather than left as an impression."* It is exercised at `studioTheme.ts:914` and tested in `__tests__/studioPrimitives.test.ts:236`.

### Verdict

**E1 · DEFICIENT in the live room — and narrowly so.**

The live room violates the letter of the ratified rule (the field *is* a remainder) while substantially honouring its intent (floor + cap + responsive gutter). ⚠️ The failure mode the law targets — *the manuscript absorbing every pixel the fixed panels do not want* — **is live**: at shrinking viewports the fixed 286px and 390px columns are held and the manuscript alone pays, until the 520px floor, after which the layout must overflow.

### Minimum composition seam

⭐ **`writingFieldLayout()` already exists, is tested, and is not imported by the live room.** The seam is one import and one `gridTemplateColumns` derived from its return — ⛔ not a new component, not a new geometry system, and not a rewrite of either room.

---

## 2 · AUDIT 2 — E4 authorship provenance

### The lifecycle, traced

```
proposal chain  →  proposal_versions  →  authorization  →  adoption  →  persisted revision  →  reload
```

### ⭐⭐ The census understated what exists

The census recorded E4's attribution clause as *"guaranteed by nothing."* **That was wrong, and the correction is material.**

`lib/manuscript/proposalChain/contract.ts` carries **durable, typed authorship on every authored formulation**:

```ts
export type VersionAuthor = 'maia' | 'member';      // :52
readonly author: VersionAuthor;                      // :124
readonly authoredAt: string;                         // :125
```

And the contract states the governing laws in its own header:

> *"One proposal version = one authored formulation for one exact target."*
> *"⛔ There is no `system` and no `unknown`. A version nobody authored is not a [version]."*
> ⭐⭐ *"A member accepting MAIA's wording unchanged binds an authorization to **HER** version; it does not author one of their own."*

That last clause is exactly E4's hardest distinction, already ratified: **adopting MAIA's wording whole does not convert it into member-authored prose.** The record keeps it as MAIA's.

### ⚠️ Where it stops — and this is the real E4 gap

**Provenance is complete on the CHAIN and is not carried onto the PASSAGE.**

`editorialRuntime/adoption.ts` reads `proposal_chain_id` from the thread (`:254`) and the `formulation` from `proposal_versions` (`:310`) — so at adoption time the author is knowable. But the durable link runs **thread → chain**, not **persisted manuscript revision → version**. Nothing observed writes a version or authorization reference onto the manuscript section or working-draft revision.

⭐ **So the three states E4 asks to distinguish resolve as:**

| State | Durable evidence | Where |
| --- | --- | --- |
| writer-authored prose | ✅ `author: 'member'` | on the version, in the chain |
| MAIA-proposed, adopted whole | ✅ `author: 'maia'` | on the version, in the chain |
| writer's subset / modification | ✅ a distinct member-authored version | on the version, in the chain |
| **any of the three, read back from the manuscript** | ⚠️ **reachable only by chain traversal, if a thread still links it** | — |

### Verdict

**E4 · PARTIAL — and better than the census claimed.**

⭐ Authorship provenance **exists, is typed, is durable, and already encodes the subtlest rule**. ⚠️ What is absent is **passage-level provenance**: given a span of the current manuscript, there is no direct answer to *how much of this did MAIA write* without traversing back through a thread and chain that the passage itself does not reference.

⛔ **The founder's warning was correct and is upheld in a second sense:** C6R2-11 distinguishes adoption *paths*, and that is not passage provenance — but neither is the chain's `VersionAuthor`, which is **formulation** provenance. E4's NEW clause asks for a property of the *text as it now stands*, and that is the thing that does not exist.

---

## 3 · AUDIT 3 — E6 machinery exposure

### Inventory (live room, by reference density)

| Control | References | Classification |
| --- | --- | --- |
| **`reviewLens`** + `DEVELOPMENTAL_LENSES` + `data-review-lenses` · `data-review-lens-state` | **32 + 5 + 2** | ⛔ **SYSTEM MACHINERY** |
| **`canvasExpanded`** (expand/contract the room) | 20 | ✅ **WRITER RETAINS** — a presence choice about their own room |
| **`setWorkspaceOpen`** (open the workspace column) | 6 | ✅ **WRITER RETAINS** |
| **`selectSection`** (choose place in the Work) | 6 | ✅ **WRITER RETAINS** — this is *place*, not machinery |
| **`manifest`** (chapter-review manifest load/save) | 6 | ⛔ **SYSTEM MACHINERY** |
| **`editorialDepth`** / `DEPTH_CHOICES` (GUIDED · LEARNING · DIRECT) | 5 | ⚠️ **AMBIGUOUS** |
| `data-workbench-scope` | 1 | ⚠️ **AMBIGUOUS** |
| `data-revision-desk` · `data-suggested-revision` | 2 + 1 | ✅ **WRITER RETAINS** — authorship acts |
| `data-write-work-on-canvas` · `data-review-work-on-canvas` | 2 | ✅ **WRITER RETAINS** — movement |

### Reasoning on the three contested entries

⭐⭐ **Lenses are the clearest E6 breach, and the count says why.** `reviewLens` is the single densest control in the room — **32 references**, a 2×2 lens grid, an `all` state, per-lens counts. The writer is asked to choose *which developmental lens MAIA reads through*. That is MAIA's burden under E6 and under `chapterReview`'s own design, which already commissions **seven lenses on one member gesture**. ⭐ *The room exposes a selector for something the substrate beneath it was built to decide.*

⛔ **Manifests are machinery by definition.** `loadChapterReviewManifest` / `saveChapterReviewManifest` are persistence bookkeeping. No writer should meet them.

⚠️ **Depth is genuinely ambiguous and must not be ruled here.** `editorialDepth` is member-declared by ratified law (`C6R4-8 depth-is-declared-not-assigned`; FACETS-01 L6c — ⛔ MAIA assigning a facet would be *MAIA grading the writer*). So it **cannot** be moved to system-carry. But E6 asks whether the writer should have to *operate* it. ⭐ **Both can be true:** the writer must own the choice, and the room may still be exposing it as a control rather than as a relationship. **Amendment 1's unruled mechanism — depth as default disclosure depth rather than a selector — is exactly this question, and it remains unruled.** ⛔ Founder or human-experience ruling.

### Verdict

**E6 · 2 breaches · 5 retain · 2 ambiguous.** ⛔ No control removed by this act.

---

## 4 · Decision table

```text
E1   live room DEFICIENT (bounded remainder, not computed width)
     seam exists, tested, unimported          →  composition, not authoring

E4   provenance PARTIAL
     formulation-level: EXISTS, typed, durable
     passage-level:     ABSENT                →  a real gap, narrower than the census said

E6   lenses            SYSTEM-CARRY (breach)
     manifests         SYSTEM-CARRY (breach)
     depth             UNRESOLVED — founder / human-experience ruling
     scope             UNRESOLVED
     place · expand · workspace · revision · movement   RETAIN
```

## 5 · What these findings imply for the host-room ruling — ⛔ RULING NOT TAKEN

⭐ **All three audits point the same way: choosing `rebuild/` commits to composition, not reconstruction.**

- **E1** is the *cheapest* obligation, not the heaviest: the enforcement function already exists, is tested, and simply is not imported by the live room. ⛔ Choosing `rebuild/` does **not** commit to rebuilding `canvas/`'s geometry — it commits to importing it.
- **E4** is **host-independent**. Passage-level provenance is a substrate gap beneath both rooms; neither choice makes it better or worse. ⛔ It should not weigh in the host ruling at all, and ⭐ it is its own act.
- **E6** is where choosing `rebuild/` carries real cost: the lens selector and the manifest controls are **in the live room**, and they are the two clearest breaches. ⚠️ Choosing `rebuild/` as host means inheriting them and owing their removal.

⭐⭐ **The sharpest thing this packet establishes:** the host-room question is **not** *which room is closer to the ratified law* — it is *which room's deficiencies are cheaper to compose away*. On that framing `rebuild/` looks favourable (one import for E1; two control removals for E6) — ⛔ **but that is an inference from three audits, not a ruling, and it is not taken here.**

⚠️ **One thing the packet cannot answer and does not pretend to:** whether `rebuild/`'s bounded remainder is *experientially* deficient. E1's verdict is a source reading. Whether a writer at 1280px feels the manuscript squeezed is a human witness question.

## 6 · Standing

> **`WRITERS-STUDIO-NEXT-01 / A1A` · THREE AUDITS COMPLETE · E1 DEFICIENT · E4 PARTIAL · E6 2 BREACHES + 2 UNRESOLVED · ⛔ HOST-ROOM RULING NOT TAKEN · ⛔ NO LAYOUT CHANGE · ⛔ NO CONTROL REMOVED · ⛔ NO PROVENANCE IMPLEMENTATION · ⛔ NO TESTS AUTHORED · ⛔ #1478 UNTOUCHED · PRODUCTION UNTOUCHED**
