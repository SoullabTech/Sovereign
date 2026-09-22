# MEDIA STORAGE CONTAINMENT — INDEPENDENT ADMISSION WITNESS

**Verdict**: `ADMISSION EVIDENCE GREEN`
**Date**: 2026-09-22 · verification only — ⛔ no repair, amendment, merge, deploy, or Finding #1 work

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Custody — GREEN

```
d1c57a4518de81e83ba099199743553235c751a4   finding   2026-09-22 16:07:50 +0000
66c0ee6666b54c6ca517bd4a9bc48515ddfcdbb8   repair    2026-09-22 16:12:22 +0000
parent(66c0ee66) = d1c57a4518de81e83ba099199743553235c751a4     ← exact
```

Both resolve on `origin/claude/magical-dirac-6rcn5k` and are ancestors of it. **The
finding was committed 4m32s before repair code moved.** Changed-path population:
`d1c57a45` = **1 file** (the record alone); `66c0ee66` = **5 files**
(`lib/media/pathContainment.ts`, `lib/media/storage.ts`, three test files),
**zero `app/` files**, no unrelated changes.

⚠️ The commits did not resolve from `/Users/soullab/MAIA-SOVEREIGN` because that
checkout had not fetched the branch — ⛔ **not** a custody failure. `git fetch origin
claude/magical-dirac-6rcn5k` makes them resolvable there.

## 2. Source witness — GREEN, 9/9

| # | property | evidence |
|---|---|---|
| 1,3 | containment central; no unguarded composition | **0** bare `join(MEDIA_STORAGE_BASE, …)` remain |
| 2 | all compositions routed | 12 `containedPath` · 5 `safeId` · 2 `safeFilename` · 2 `safeSubdir` |
| 4 | no sink escapes the root | all **11** verified (`storeFile`·`storeStream`·`getChunkDir`·`storeChunk`·`getFileStream`·`getAbsolutePath`·`getFileStats`·`fileExists`·`getFileSizeSync`·`deleteFile`·`deleteProjectDir`) |
| 5 | ids **refused**, not repaired | C11–C13 → `MEDIA_ID_REFUSED` |
| 6 | ordinary names survive | C9/C10/R4 |
| 7 | mkdir from the contained destination | `mkdir(dirname(absolutePath))` ×2; **0** independently recomposed |
| 8 | persisted escaped path fails closed | C16 → `MEDIA_PATH_ESCAPES_BASE` |
| 9 | no route-level duplication | 0 `app/` files changed |

## 3. Falsification — GREEN

**18/18** containment · **4/4** regression against the real patched `storeFile`/`storeChunk`:
original cross-project payload (victim **byte-identical**, write landed at
`proj-A/original/victim.txt`) · base escape dead with the **persisted** `relativePath`
contained · hostile `uploadId` refused · ordinary upload succeeds.

⭐ Re-run a second time with dependencies installed, against the **real**
`lib/media/types.ts` instead of the harness stub: **4/4 again.** The stub was masking
nothing. Candidate bytes untouched.

## 4. Project typecheck — GREEN, and the discrimination the act required

```
TypeScript no-regression gate — tsconfig.ship.json
  program files : 4419 (baseline 3965)
  errors        : 229  (baseline 239)
  10 error(s) fixed since the baseline · 0 new identities
  461 new file(s) entered the program
  7 baselined file(s) deleted from disk (not a regression)
  ✅ No TypeScript regressions.          exit 0
```

**Inherited debt vs candidate regression, kept apart:**

- **Candidate regression: NONE.** 229 < 239, **zero new identities**.
- ⭐ **`pathContainment.ts` contributes zero diagnostics — ENTAILED, not separately
  witnessed.** It is a brand-new file; any error in it would be a *new identity* and the
  gate would have failed. It passed, so there are none. Stated as entailment because
  that is what it is.
- ⚠️ **+461 program files and −7 baselined files are INHERITED canonical drift**, ⛔ not
  the candidate's: `66c0ee66` adds one TS file and modifies one, and its three test
  files sit outside `tsconfig.ship.json`. The baseline is **stale relative to the
  branch**. Recorded as an observation; ⛔ re-baselining is a governed act and is **not**
  taken here.

## 5. ⚠️ Watch item — CONFIRMED, and narrower than it sounds

**Nothing generates a unique storage name.** `upload/route.ts:86` passes `file.name`
straight through; no UUID, timestamp or asset-id naming exists in the route.

- **Pre-existing**: two uploads of `report.pdf` already overwrote each other **before**
  this candidate.
- **Widened, not created**: sanitization additionally collapses `a b.txt` and `a_b.txt`
  onto one name.
- Same project · authenticated only · ⛔ **not** the escape vulnerability.

⛔ Deliberately not widened into this act. The remedy is the server-generated storage
name (client filename → metadata only) — a separate decision.

## 6. Remaining unvalidated assumptions

- ⛔ **Production reachability and filesystem permissions NEVER ESTABLISHED.** No
  production was read or touched at any point.
- ⛔ The patched sink was exercised by **direct invocation only** — never through an HTTP
  route. Route-level reachability of the original defect remains unwitnessed.
- ⛔ **Finding #1 untouched**: the decorative `NODE_ENV` guard in the media practitioner
  lookup is unchanged. No fail-closed behaviour introduced, no ownership resolution
  altered, no route authorization changed.
- ⛔ No merge, no deploy, no production configuration change.

## 7. Verdict

`ADMISSION EVIDENCE GREEN` — `66c0ee66` is ready for Founder adjudication.
⛔ Adjudication is not granted by this witness.
