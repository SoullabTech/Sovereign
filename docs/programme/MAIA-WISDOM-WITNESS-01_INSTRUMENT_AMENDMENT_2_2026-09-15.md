# MAIA-WISDOM-WITNESS-01 · Instrument Amendment 2

**Status: CANDIDATE · ⛔ NOT RE-ACCEPTED · ⛔ PART A RUN #2 NOT PERFORMED.**
**Date:** 2026-09-15 · Instrument repair, ⛔ not an architectural act.

---

## 1. Host diagnosis — SETTLED, and it is not Full Disk Access

```
$ ls -lO ".../AIN Consciousness Intelligence System 1/00-Context-Map.md"
-rw-r--r--@ 1 soullab staff  compressed,dataless  13950 Nov 28 2025
```

⭐⭐ **`dataless`.** macOS file-provider eviction: iCloud removes the CONTENT and
leaves name, size and metadata intact. `readdir` and `lstat` succeed; `open()` succeeds;
`read()` fails. `head` said *"Error reading"*, ⛔ not *"Permission denied"* — a TCC denial
is `EPERM` at `open()`, a different shape.

**48 of 50** sampled `.md` files blocked. `brctl download` failed correctly: it addresses the
**iCloud Drive** container, ⛔ not third-party provider containers such as Obsidian's.

⛔ **THE PREFLIGHT THAT FAILED WAS MINE.** I proposed `find -name '*.icloud'` as the decisive
eviction check and told the founder `0` meant clear. `.icloud` placeholders are a **legacy
convention**; dataless files create none. ⭐ **The design error is the general one: I probed a
proxy instead of the operation the census depends on.** Amendment 2 replaces the proxy with
the operation.

## 2. Amendments (founder ruling, adopted verbatim)

**(a) Per-stage measurement counters.** The aggregate `unreadable` counter is removed. It was
unusable as a witness metric: one file could increment it at several stages, and — the real
defect — **a failed read left `fmPresent = null`, `domains = []`, `soullab = false`, which are
indistinguishable from a successful read that found nothing.** Failure was recorded as absence.

Now counted separately: `readdir_failures` · `lstat_failures` · `hash_attempts/successes/failures`
· `text_read_attempts/successes/failures` · `content_findings_trustworthy`. **The report states
what was measured, not what was attempted.**

**(b) `*.backup` excluded and counted** — 1,361 files, 26.5% of the located tree — on the same
footing as AppleDouble sidecars. ⛔ Nothing deleted, modified, moved or inspected. They remain
custody and hygiene evidence, ⛔ not corpus objects. *(This supersedes my earlier
report-but-don't-exclude proposal; the founder ruled.)*

**(c) Startup read-probe → `exit 4`.** Samples up to 40 immediately-readable files and refuses
if more than half fail, naming dataless eviction and the Finder remedy.

**(d) Fail-closed → `exit 5`.** If content reads were attempted and **zero** succeeded, no
report is written.

## 3. Acceptance witness

| | Test | Result |
|---|---|---|
| **A** | diff | `scripts/witness/ain-corpus-census.mjs` only |
| **B** | `node --check` | ⭐ syntax OK |
| **C** | fixture: `real.md` · `second.md` · `._real.md` · `.DS_Store` · `real.md.backup` | ⭐ **2 corpus files · 1 AppleDouble · 1 backup · text reads 2/2 · trustworthy true** |
| **D** | `--out` inside `--root` | ⭐ **exit 3**, refusal message unchanged |
| **E** | corpus untouched | ⭐ fixture unchanged; output written outside root |
| **F** | read-probe | ⭐ **exit 4** — `REFUSED: 40 of 40 sampled files could not be read` |

⚠️ **Run as an unprivileged user for (F).** A first attempt used `chmod 000` while running as
root, which root ignores — ⛔ **that was an invalid test, not a passing one**, and is recorded
rather than quietly re-run.

⭐⭐ **The fixture caught a real bug before the corpus run.** `textSuccesses` was declared in
the fail-closed block but referenced by the census object built above it — a temporal-dead-zone
`ReferenceError` that would have crashed Part A Run #2 outright. **That is what the founder's
acceptance-witness requirement bought.**

⚠️ **Not tested: `exit 5`.** Its condition — reads attempted, zero succeeded — is one the
startup probe should already have caught, so it is a backstop I could not construct a case for.
⛔ Recorded as untested rather than claimed.

## 4. Preserved unchanged

read-only by construction · no writes inside the corpus · symlinks never followed ·
output-outside-root containment (`exit 3`) · no network · no model or provider calls ·
no ingestion, indexing or classification · frontmatter, domain and authorship semantics.

## 5. Standing on the first run, and one interpretive correction

**PART A RUN #1: ⛔ NOT ADMITTED — instrument failure, no corpus evidence.**

⭐ Surviving as **custody observations**, ⛔ not as a corpus census: root exists and is
traversable · `.icloud` placeholders 0 (⚠️ now known to be uninformative) · 5,131 filesystem
entries · 35 MB logical · 3,765 `.md` · 1,361 `.backup` · 55 zero-byte · 0 symlinks.

⛔ **VOID:** frontmatter standing · domain signals · authorship signal · content hashes ·
duplication. All derived from zero bytes.

⚠️ **PART B IS UNAFFECTED.** Its production facts remain load-bearing.

### ⛔ Interpretive correction

I said in conversation that `ain_knowledge_chunks` being empty *"isn't neglect — it's the canon
working."* ⛔ **That overclaimed a causal link** and is withdrawn. It reached no committed
record; it is corrected here so it cannot be adopted later. The defensible statement is the
founder's:

> **The located AIN source tree has the characteristics and custody location of the Working
> state that canon marks never-indexed; production `ain_knowledge_chunks` is empty. The evidence
> is consistent with the no-index rule having been preserved, but does not establish that the
> rule caused the empty table.**

⭐ And the same discipline governs the location finding: **the tree has the characteristics of
State 1 Working material and must not be treated as retrieval-eligible merely because it has now
been located.** Location establishes custody. ⛔ It establishes neither epistemic standing nor
retrieval eligibility.

## 6. Standing

**INSTRUMENT AMENDMENT 2 CANDIDATE · ⛔ AWAITING FOUNDER RE-ACCEPTANCE · ⛔ PART A RUN #2 NOT
PERFORMED · ⚠️ CORPUS STILL DATALESS — MATERIALIZATION OWED BEFORE ANY RE-RUN · PART A RUN #1
NOT ADMITTED · PART B UNAFFECTED · CORPUS UNTOUCHED.**

> *The instrument now refuses to mistake silence for an answer. It could not do that this
> morning, which is why it gave one.*
