# WRITERS-STUDIO-CONVERGENCE-01 · SUPERSESSION RECORD — PR #1455 LINEAGE DISPOSITION · 2026-09-22

**Status:** DOCUMENTARY ONLY · READ-ONLY CENSUS · NO RUNTIME / SCHEMA / UI CHANGE
**Opened by:** founder act, 2026-09-22
**Subject:** PR #1455 — *Writer's Studio: converge manuscript-first editorial loop and three-level support*
**Subject head:** `4f4fc3f7f4e54ea457644abc15eeec0279efbc8e` · branch `feature/ws-convergence-current-canonical-20260921`
**Merge-base with canonical:** `65bcb76bb38d4f57e816253fdbec0ea036d6c166`
**Canonical at census:** `7c58ad533`
**PR state at census:** OPEN · DRAFT · UNMERGED · NOT MERGEABLE

> ⛔ **This record does not close PR #1455.** It exists so that a later closure has something to point at.
> ⛔ It does not re-adjudicate the branch's 45 commits, and it authorizes no repair.

---

## I. The one question this record answers

> **Where did each substantive class of PR #1455 end up?**

Not *was the work good*, not *should it have merged*. Only: for each class of content on that branch, what is its present canonical disposition, and by which lineage.

## II. Method

Read-only, mechanical, and stated so its limits are visible.

1. Enumerate every path changed by #1455 against its merge-base — **69 paths** (43 added, 26 modified).
2. For each path, compare the **blob at #1455's head** against the **blob at canonical's head**. Three outcomes: `IDENTICAL`, `DIFFERS`, `ABSENT_IN_CANONICAL`.
3. For every `DIFFERS` path, read the canonical-side commits since the merge-base to name the lineage that produced canonical's version, and establish **direction** — is canonical later, or is #1455 holding something canonical lacks?
4. For the one path where #1455 proved to be ahead, scan **all 1,855 remote refs** for the exact blob to determine whether any other branch carries it.

**What this method establishes:** whether the *bytes* of a path are present in canonical, and by which commits.
**What it does not establish:** that a class of work is *behaviourally* intact in canonical, that any test passes, or that any runtime is correct. No test was executed — this container has no `node_modules`. Every behavioural statement below is a **source reading**, and is labelled as one.

## III. Headline result

**`ABSENT_IN_CANONICAL` is empty.** All 69 paths of PR #1455 exist in canonical, the migration included.

**60 of 69 are byte-identical.** Nine differ. Of those nine, **eight are canonical-later** — canonical carries a subsequent governed repair. **One is #1455-ahead**, and is recorded as a finding in §VI.

## IV. Disposition by content class

| #1455 content class | Final disposition | Canonical lineage |
| --- | --- | --- |
| C5/C6 experiential law and witnesses (11 programme records) | **Preserved in canonical.** Byte-identical. | `405660695` C2–C4 work-primary shell convergence; `90dc28117` C5/C6 experiential programme — canonical admission |
| Convergence charter, FACETS-01, §9.7, arrival design candidates | **Preserved in canonical.** Byte-identical. | `1044cdd2b` ratify FACETS-01; `5d8ceb3bc` settle §9.7 + ELEMENTAL-ARRIVAL-01 |
| Manuscript-first editorial loop (`editorialDepth` · `editorialDiff` · `placeCrumb` · shell · rail · studio map) | **Carried into canonical substrate.** Byte-identical but for the four paths at §V. | `405660695`; `2561c8010` C6R1; `5ef0733ef` C6R4; `75e278027` C6R6 |
| Observation identity | **Carried by its own governed lane.** Byte-identical. | `e8f39cfff` I1 — canonical observation identity at the live seam |
| Observation address | **Carried by its own governed lane.** Byte-identical. | `e001cd7e5` A1 — read-only observation address resolver |
| Guided / Learning / Direct support depth | **Canonical, preserved as governed substrate.** Byte-identical. | `5ef0733ef` C6R4 — adapt the communication, not the intelligence |
| Editorial turn observation context | **Preserved, subject to the live custody repair.** | canonical, with `RebuildStudioClient.tsx` under PR #1461 |
| Editing-latitude authority | **Governed by `WS-EDITORIAL-SCOPE-01`.** Adoption seam byte-identical in canonical. | `230ca5fa4` enforce detected-quotation safety at the adoption seam |
| Constitutional suites (`convergenceC2C4` · `C5` · `C6` · identity · address · live matrix · Test A) and their tsconfigs | **Canonical.** Byte-identical but for `convergenceC6.ts` (§V). | `daeffe2d9` C6R5A; `9bc69aefc` C6R5 structural guard; `75e278027` C6R6; `f055271f0` C6R7 |
| **Migration** `20260921000001_developmental_reading_observation_identity_compatibility.sql` | ⭐ **Present in canonical, byte-identical.** Stated as a checked fact, not an inference from the filename. | `7a91d6992` persist canonical observation identity |
| CSS / build-health repair | **Superseded by later canonical build-health lineage.** | `2c43ff1ea` restore canonical build health (via PR #1462 / #1464 / #1465) |
| Theme-token repairs | **Superseded by the same build-health lineage.** | `2c43ff1ea` |
| C6R2–R14 closed-lineage correction | **Carried by the live custody-repair lineage.** ⛔ Not yet canonical. | PR #1461 at `1dbf5949` — OPEN |
| Original PR sequencing / merge role | **Superseded.** #1455 is not the admission vehicle. | admission occurred via `90dc28117` and the lineages above |

## V. The eight canonical-later paths

Canonical carries a subsequent governed change; #1455 is behind. Closing #1455 discards nothing here.

| Path | Canonical is later by |
| --- | --- |
| `app/writers-studio/rebuild/RebuildStudioClient.tsx` | build health `2c43ff1ea`; further repaired by **PR #1461** |
| `app/writers-studio/studio/PlaceInWork.tsx` | `2c43ff1ea`; further repaired by **PR #1461** |
| `app/writers-studio/studio/StudioMovements.tsx` | `2c43ff1ea`; further repaired by **PR #1461** |
| `tests/constitutional/writers-studio/convergenceC6.ts` | `f055271f0` C6R7; further repaired by **PR #1461** |
| `app/writers-studio/insight/RevisionDesk.tsx` | `c094b7f29`, `5ef0733ef`, `f055271f0`, `90dc28117` |
| `docs/design/contracts/writers-studio-rebuild.md` | `2c43ff1ea` |
| `app/writers-studio/insight/insight.css` | `2c43ff1ea` — one blank line |
| `package.json` | unrelated lane: canonical adds two `matrix:serving-disclosure-f2-iq*` scripts |

## VI. ⚠️ Finding — one path where #1455 is ahead, and nothing else carries it

`app/writers-studio/__tests__/guidedEditorialLoop.test.ts`

Both #1455 and canonical contain `7844949d4` *converge guided editorial loop*. #1455 then carries one further commit touching this file — the merge `e9a6034ca` *reconcile convergence with canonical `4c097b4c`* — whose conflict resolution produced a reconciled test. Canonical does not have it.

**The two versions assert opposite behaviour** for the bound response *"Yes, that's what I mean"*:

- **#1455's reconciled version** — the click enters the governed editorial seam: `onRevise` is called with `sectionId` `s20`, and `[data-dialogue-question]` is null. Its inline comment names this: *"⭐ C6 convergence: an exact bound response enters the same governed editorial seam as Talk about it. It no longer opens ObservationDialogue."*
- **Canonical's version** — the click opens `[data-dialogue-question]` and asserts `expect(onRevise).not.toHaveBeenCalled()`.

⭐ **Canonical's source carries the C6 convergence; canonical's test asserts the behaviour that convergence replaced.** `InsightReading.tsx` is **byte-identical** between #1455 and canonical, and canonical's copy reads:

> `// ⭐⭐ C6 — THE OBSERVATION LAYER CONVERGES ONTO THE BOUND EDITORIAL TURN.`
> `if (boundTarget && onRevise) { onRevise(boundTarget, next); return; }`

Canonical's first test renders `InsightReading` **with** `onRevise` supplied, so that early return is on the path the test exercises.

⛔ **This is a source reading, not an executed test result.** No test was run; this container has no `node_modules`. The honest claim is: *canonical's test file and canonical's source file assert contradictory behaviour on the same path.* Which one is right, and whether the suite actually fails, is not established here.

**Reach of the finding:** the reconciled blob `7e5a02085` was searched for across **all 1,855 remote refs** and exists on **`feature/ws-convergence-current-canonical-20260921` alone**. PR #1461's repair touches four files and this is not among them.

⛔ **Not repaired here.** The lane that finds a defect does not thereby own it, and this test governs the guided editorial loop well beyond #1455's disposition. Raised for founder adjudication with three dispositions available, none taken: carry the reconciliation into the live custody-repair lineage; open a bounded act against the contradiction itself; or rule that canonical's assertion is the intended law and the source is what diverged.

## VII. Closure rule

When the founder confirms the disposition, PR #1455 should be closed **without merge**, and the closure should say:

> **PR #1455 is closed without merge because its substantive obligations and implementation were subsequently admitted, replaced, or carried through separately governed canonical lineages enumerated in this record. Closing this PR retires the obsolete admission vehicle; it does not discard the evidence, laws, witnesses, or substrate identified above.**

⛔ Not *"superseded by newer work."* That sentence would retire the evidence along with the vehicle.

⚠️ **Closure is blocked on §VI, not by it.** The one path where #1455 is ahead is carried by that branch alone. Closing the PR does not delete the branch, and the blob survives closure — but the reconciliation would then live only on a closed PR's branch, which is custody by accident. The founder should dispose of §VI before or alongside the close, not after.

## VIII. Standing

> **SUPERSESSION CENSUS COMPLETE · LINEAGE MAPPED · ⚠️ ONE AHEAD-OF-CANONICAL PATH RAISED · ⛔ PR #1455 NOT CLOSED · ⛔ NO REPAIR AUTHORIZED · ⛔ A1 NOT OPENED · PRODUCTION UNTOUCHED**

---

## IX. Post-census custody addendum — 2026-09-22

⚠️ **Appended, not merged into the census above.** §I–VIII are a reading taken at a time and are preserved as they were written. This section records what moved afterwards.

### IX.1 Custody vehicle for the canonical-later paths

At census time **PR #1461** was the live custody-repair vehicle.

Subsequent custody reconciliation produced:

`6de25a4518e562a2003efd65d8c588ccde1ccad7` — *R2R1 current-canonical semantic reconciliation*

which is the current exact **R2R1 semantic candidate** for:

- `app/writers-studio/rebuild/RebuildStudioClient.tsx`
- `tests/constitutional/writers-studio/convergenceC6.ts`

`app/writers-studio/studio/PlaceInWork.tsx`, `app/writers-studio/studio/StudioMovements.tsx` and `app/writers-studio/insight/insight.css` remain satisfied by the already-canonical build-health lineage (`2c43ff1ea`) and are **not re-carried by R2R1**.

⛔ R2R1 is **not admitted** as of this addendum. §V's table names lineage, not admission.

### IX.2 Disposition of the §VI finding

The ahead-of-canonical path `app/writers-studio/__tests__/guidedEditorialLoop.test.ts` has been **adjudicated** by founder act as a **stale-test defect**, not a behavioural ambiguity:

> Canonical runtime behaviour is the existing governed C6 behaviour. The canonical test assertion is stale. No product behaviour change is authorized.

Carried by the bounded act **`WRITERS-STUDIO-CONVERGENCE-01 / TC1`** — PR #1467, branch `fix/ws-convergence-tc1-guided-loop-test-custody-20260922`, candidate `d0ff4f59b`. One test file; four stale assertions in the first test only; `InsightReading.tsx` unmodified; the second test untouched; the #1455 blob **not** copied wholesale.

⛔ **TC1 is not admitted** as of this addendum, and its jest / C5 / C6 / typecheck witness is **owed to a host with dependencies** — the repair's assertions are entailed by a static source read, not witnessed by an executed run.

⚠️ **§VII's closure block is therefore narrowed, not lifted.** Once TC1 is canonically admitted, the reconciliation is no longer stranded on #1455's branch and the §VII blocker is discharged **by TC1, not by this record**. Until then it stands.

### IX.3 Remaining sequence before PR #1455 may be closed

```text
TC1 admitted            (PR #1467)
        ↓
R2R1 admission finished (6de25a451)
        ↓
final custody update to this record
        ↓
documentary PR for this record
        ↓
record admitted canonically
        ↓
close PR #1455 WITHOUT MERGE, pointing at the admitted record
```

⛔ This record is **not** to be opened as a PR before that final custody update: a closure that points at an unadmitted record has pointed at another temporary branch.
