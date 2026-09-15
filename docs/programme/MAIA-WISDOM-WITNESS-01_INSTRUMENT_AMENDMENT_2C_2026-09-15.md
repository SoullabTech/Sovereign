# MAIA-WISDOM-WITNESS-01 · Instrument Amendment 2C

**Status: CANDIDATE · ⛔ FINAL INSTRUMENT RE-ACCEPTANCE OWED · ⛔ PART A RUN #2 NOT PERFORMED.**
**Date:** 2026-09-15 · Structural completeness. `8fffa6ad` / Amendment 2B **re-accepted**.

---

## 1. The last fail-open path

Amendment 2 split four counters. 2A and 2B governed the two **content** channels. The two
**structural** channels were still only reported.

Verified in source before repair:

| | |
|---|---|
| `walk()` `:~136` | catches a readdir error, `readdirFailures += 1`, **returns** |
| `files.push(full)` `:150` | populates `files[]` **before** any `lstat` |
| records loop `:284` | `catch { lstatFailures += 1; continue; }` |
| census `:384` | `files: files.length` |

⛔ **Two completed-but-partial censuses were therefore possible:**

```
readdir failure  →  an entire subtree vanishes from files[]  →  CENSUS COMPLETE
lstat failure    →  path counted in files.length, excluded from size, extension,
                    hashing and every record  →  denominator and measured
                    population diverge silently  →  CENSUS COMPLETE
```

⭐ **The second is the worse one**, and it is the founder's observation: the total says 5,131
while the tables describe fewer, and nothing in the report says so.

## 2. ⭐⭐ Why exact, not 95%

> **A content-read failure has a principled denominator — we know how many files we tried to
> read. A structural failure does not.** A failed `readdir` could hide one file or ten thousand;
> there is no fraction to compute.

So the instrument now carries **two different shapes of completeness**, deliberately:

```
STRUCTURAL     readdir  0 failures required   (exact)
               lstat    0 failures required   (exact)

CONTENT        text     ≥ 95% required        (thresholded)
               hash     ≥ 95% required        (thresholded)

REPORT         only if both layers pass
```

⭐ *You may tolerate a declared small fraction of unreadable files. You may not tolerate an
unread directory, because you cannot say what fraction it represents.*

Structural refusal uses a **distinct code, `exit 6`**, and names the failing channel.

## 3. Stale prose corrected

The content refusal said failures *"would be reported as findings while measuring nothing."*
⛔ **False for partial failure** — at 90% something was measured, just not enough. Now:
*"would be reported from incomplete observation."*

## 4. Acceptance witness

| | Test | Result |
|---|---|---|
| **A** | `node --check` | ⭐ OK |
| **B** | all 2B fixtures | ⭐ unchanged (below) |
| **C** | **readdir failure** — unreadable subdirectory | ⭐ `exit 6`, no report — `readdir failures: 1 … number of objects omitted is unknowable` |
| **D** | **lstat failure** — directory readable but not searchable (`r`, no `x`) | ⭐ `exit 6`, no report — `lstat failures: 1 — paths counted in the file total but absent from … every derived table` |
| **E** | clean structure → content gates decide normally | ⭐ clean `exit 0` · hash 95% `exit 0` · hash 90% `exit 5` · text 95% `exit 0` · text 90% `exit 5` |
| **F** | `--out` inside `--root` | ⭐ `exit 3` |
| **G** | startup mass-read failure | ⭐ `exit 4` |
| **H** | real corpus untouched, no Run #2 | ⭐ fixture unchanged |

⭐ **The D fixture was probed for viability before being trusted.** A directory with `r` and no
`x` was tested to confirm `readdir` succeeds while child `lstat` returns `EACCES` on this host —
`readdir: OK ["inner.md"] · lstat: FAILS — EACCES — fixture usable`. ⛔ Had it not been
constructible, the test would have been recorded unexecuted rather than manufactured.

**Exit-code map, now distinct per refusal class:**

```
2  usage        3  output inside root      4  startup mass-read failure
5  content channel below 95%               6  structural observation incomplete
```

**Unchanged:** text/hash trust from 2B · startup probe · traversal · AppleDouble and `.backup`
exclusions · hashing and text semantics · output containment · read-only behaviour · threshold
value.

## 5. Standing

```
Amendment 1     ✅ accepted        Amendment 2B    ✅ RE-ACCEPTED (8fffa6ad)
Amendment 2     ✅ accepted        Amendment 2C    ⚠️ CANDIDATE
Amendment 2A    ✅ accepted        Instrument      ⛔ final re-acceptance owed

Materialization ⏳ owed — container still 432K, errno 60
Part A Run #1   ⛔ inadmissible     Part A Run #2   ⛔ not authorized
Part B          ✅ complete
```

> *Five amendments. The first three asked whether the files could be read; the last two asked
> whether the tree had been seen at all. A census that cannot answer the second question has no
> standing to answer the first.*
