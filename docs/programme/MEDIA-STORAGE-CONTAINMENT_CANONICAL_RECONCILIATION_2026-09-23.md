# MEDIA PATH-CONTAINMENT — CURRENT-CANONICAL RECONCILIATION

**Verdict**: `CURRENT-CANONICAL RECONCILIATION PASS`
**Date**: 2026-09-23 · admission preparation only — ⛔ no merge, no push to canonical, no deploy, no production mutation

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Identities

```
source repair          66c0ee6666b54c6ca517bd4a9bc48515ddfcdbb8
current canonical      840194ba859bd5a497fc939c94329ee972ca3f80
reconciled candidate   60126fd159f5bf299610c8a353303191fc2a946c
```

⭐ **The admission object is the ISOLATED REPAIR COMMIT, ⛔ never a merge of the
development lane.** A whole-lineage merge conflicts on `CLAUDE.md` and `package.json` —
earlier lane commits, ⛔ not the repair surface. That distinction is durable: merging the
branch would drag unrelated lane work into a security admission.

## 2. Drift — ZERO across the repair surface

| path | repair base | current canonical | |
|---|---|---|---|
| `lib/media/storage.ts` | `fce51bb54` | `fce51bb54` | **NO DRIFT** |
| `lib/media/pathContainment.ts` | ABSENT | ABSENT | new in repair |
| three test files | ABSENT | ABSENT | new in repair |

⚠️ **A self-correction that preceded any disposition**: the first drift probe reported four
false DRIFT rows, because `git rev-parse rev:path` **echoes its argument** instead of
failing on a missing path, so absence read as a differing blob. Recomputed with
`git cat-file -e`. The controlling result is zero drift.

**Canonical evolution does not touch the containment contract.** Across ~120 commits
(`fa5274fd..840194ba`) the only `media|storage` matches are
`docs/ops/WORKSTATION_STORAGE_RELIEF_*` and `scripts/ops/workstation-storage-census.sh`
— workstation disk census, matched on the word "storage".

## 3. Semantics preserved exactly

Clean cherry-pick. Changed population vs canonical: **exactly the 5 files**.

```
reconciled lib/media/storage.ts = 0e322fe0e74e247e0aed097d4203d18ef65bb135
witnessed  lib/media/storage.ts = 0e322fe0e74e247e0aed097d4203d18ef65bb135   ← MATCH
```

## 4. Witnesses on the reconciled tree

- containment **18/18 PASS**
- regression **4/4 PASS** (real patched `storeFile`/`storeChunk`)

## 5. Typecheck on the reconciled tree — GREEN

```
TypeScript no-regression gate — tsconfig.ship.json
  program files : 4425 (baseline 3965)
  errors        : 226  (baseline 239)
  13 fixed · 11 identities gone · 0 NEW IDENTITIES
  467 new file(s) entered · 7 baselined file(s) deleted
  ✅ No TypeScript regressions.        exit 0
```

**Inherited vs candidate-introduced, kept apart:**

- **Candidate-introduced: NONE.** 0 new identities.
- ⭐ `pathContainment.ts` contributes zero diagnostics — **ENTAILED** from the gate's
  semantics (a new file with errors would be a new identity), ⛔ not separately witnessed.
- ⚠️ The shift from the lane-branch run (`4419 / 229`) to the reconciled run
  (`4425 / 226`) is **+6 files, −3 errors** — **inherited** from the ~120 canonical
  commits, ⛔ not the candidate's: its population is the same five files in both trees.
- ⚠️ `+467 / −7` against the baseline remains inherited canonical drift. **The baseline is
  stale relative to canonical.** The gate printed its re-baseline suggestion; ⛔ **not
  taken** — re-baselining is a governed act.

## 6. Reconciliation observations — ⛔ NOT additional mutation scope

⭐ **`app/api/media/projects/[projectId]/exports/[exportId]/download/route.ts` —
PREVIOUSLY UNENUMERATED CONSUMER.** A fourth read sink (`fileExists` ·
`getFileSizeSync` · `getFileStream` on a DB `storage_path`), reached by the
already-witnessed containment authority.

⛔ It does **not** widen the five-file act, and the original finding `d1c57a45` is **NOT**
rewritten as though this route had been in its original enumeration. The finding said
what it said.

- `lib/media/processors.ts` — containment-only sinks with hard-coded filenames
  (`'thumbnail.jpg'` · `'waveform.png'` · `'audio.wav'`), fully server-derived. No new
  hostile-input surface.
- ⚠️ `lib/workbench/intake.ts` is **NOT** a media-storage caller — an earlier grep
  included `from './storage'` and matched a different workbench module. A
  **witness-classification correction**, ⛔ not a contract defect.

## 7. Standing

```
repair-surface drift     ZERO
blob identity            MATCH
changed population       EXACTLY 5 FILES
containment              PASS · 18/18
regression               PASS · 4/4
typecheck                PASS · 0 new identities
re-baseline              NOT TAKEN

canonical merge          NONE
canonical push           NONE
deployment               NONE
production mutation      NONE
Finding #1               UNTOUCHED
filename-collision watch OPEN · OUT OF SCOPE
production reachability  UNWITNESSED
HTTP route witness       UNWITNESSED
```

`CURRENT-CANONICAL RECONCILIATION PASS` — `60126fd1` is eligible for Founder admission
adjudication. ⛔ **Admission is not granted by this reconciliation.**
