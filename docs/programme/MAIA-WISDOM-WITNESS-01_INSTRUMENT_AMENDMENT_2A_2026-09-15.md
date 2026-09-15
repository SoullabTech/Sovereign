# MAIA-WISDOM-WITNESS-01 · Instrument Amendment 2A

**Status: CANDIDATE · ⛔ NOT RE-ACCEPTED · ⛔ PART A RUN #2 NOT PERFORMED.**
**Date:** 2026-09-15 · Completion of Amendment 2's own stated trust rule, ⛔ not a new ruling.

---

## 1. The contradiction, as found in founder review

The committed candidate `f132edeb` carried **three nearby definitions of "safe enough to
report"** and used the weakest as its guard:

```
startup probe        refuse if > 50% of a sample fails
trust flag           trustworthy only if  >= 95% of text reads succeed
whole-run guard      refuse only if         0% succeed
```

⛔ **So a run at 900/1000 would mark content findings untrustworthy, write `census.json` and
`CENSUS.md` anyway, report frontmatter, domain and authorship values, and close with
`CENSUS COMPLETE`.** And because a failed text read leaves `fmPresent = null`, `domains = []`,
`soullab = false`, those 100 failures would still have been counted downstream **as content
inspected and found absent.**

⭐ **That is the original defect in a narrower form** — the one Amendment 2 exists to fix —
surviving inside the fix.

## 2. The repair

**One derived authority, computed once, consumed everywhere:**

```js
const TRUST_THRESHOLD = 0.95;
const textSuccesses = textAttempts - textFailures;
const textSuccessRate = textAttempts === 0 ? 1 : textSuccesses / textAttempts;
const contentFindingsTrustworthy = textSuccessRate >= TRUST_THRESHOLD;

if (textAttempts > 0 && !contentFindingsTrustworthy) { /* refuse, no report, exit 5 */ }
```

`census.json` and `CENSUS.md` both consume `contentFindingsTrustworthy`. ⭐ **One literal
`0.95` remains in the file — the constant itself.** No independent recomputation survives.

## 3. ⚠️ The repair failed silently on its first attempt, and the fixture caught it

The first edit targeted a string beginning `const textSuccesses = …` immediately above the
guard — a line a **previous** amendment had already hoisted. The replacement matched nothing,
wrote nothing, and reported success.

**The 18/20 fixture then wrote a full report and exited 0.** Without it, `f132edeb`'s
contradiction would have survived an amendment claiming to have removed it.

⭐ **Repaired by asserting rather than assuming:**

```python
assert old in t, "GUARD NOT FOUND — refusing to write a silent no-op"
...
assert "textSuccesses === 0" not in t, "old predicate survived"
```

⚠️ **This is the third time today that a silent no-match produced a confident false
statement** — the pasted `#` read as a comment, `mdfind`'s empty output read as absence, and now
a string-replace that matched nothing. ⭐ **The pattern: an operation that does nothing looks
exactly like an operation that found nothing to do.** Same law the instrument itself now
enforces on reads, applied to edits.

## 4. Acceptance witness

| | Test | Result |
|---|---|---|
| **A** | `node --check` | ⭐ OK |
| **B** | original fixture (2 corpus · 1 AppleDouble · 1 backup) | ⭐ unchanged |
| **C1** | **19/20 = 95.0%** → admissible | ⭐ `exit 0`, report written |
| **C2** | **18/20 = 90.0%** → refused | ⭐ `exit 5`, **no report written**, `REFUSED: 18 of 20 content reads succeeded (90.0%)` |
| **D** | `--out` inside `--root` | ⭐ `exit 3` |
| **E** | startup mass-read failure | ⭐ `exit 4` |
| **F** | corpus untouched | ⭐ fixture unchanged |

⭐ **C1/C2 straddle the threshold exactly** — 95.0% admits, 90.0% refuses — so the boundary is
witnessed rather than assumed. Both run as an unprivileged user; `chmod 000` as root is not a
failure mechanism.

**Unchanged:** startup probe · AppleDouble exclusion · `.backup` exclusion · read-only
behaviour · traversal · domain/frontmatter/authorship semantics · hashing · output containment.

## 5. Host state — diagnosis closed

```
errno: 60 · Operation timed out
ls -lO: compressed,dataless
obsidian container on disk: 432K   (census measured 35 MB logical in one subfolder)
iCloud account: signed in · bird: running
```

⭐ **File-provider eviction with a stalled fetch.** ⛔ Not TCC — `EPERM` never appeared.
iCloud is alive and simply not delivering.

⚠️ **The alternative copies do not substitute.** `~/Documents/AIN/…` reads 20/20 but holds
**205 files**; the corpus holds **5,131**. ⛔ A clean census of a 4% fragment is worse than no
census, because it would read as authority.

⚠️⚠️ **CUSTODY FINDING — founder wording, which corrects mine:**

> **The authoritative AIN source tree is locatable but not locally materialized on the founder
> workstation. Its metadata is present; its content is not reliably readable. It is therefore
> outside the reach of the programme's current local census, local backup verification, rights
> review, and governance instruments.**

⛔ **An earlier draft here said the tree is "not in the founder's possession."** That
overclaimed. The content apparently still exists with the cloud provider; what is absent is a
**locally readable copy under direct filesystem custody.** ⭐ The distinction is load-bearing
for backup and governance claims — *"we cannot read it here"* is supportable, *"it is
unbacked"* is not, and the weaker phrasing would have licensed the second. Corrected in place.

⛔ R4 rights standing still cannot be established for text that cannot be read locally.

## 6. Standing

```
Amendment 1        ✅ discharged (0 sidecars inside the root; the ._ files are in the parent)
Part A Run #1      ⛔ inadmissible — instrument failure, no corpus evidence
Host cause         ✅ dataless eviction + fetch timeout (errno 60)
Amendment 2A       ⚠️ CANDIDATE — awaiting founder re-acceptance
Part A Run #2      ⛔ not authorized
Materialization    ⏳ owed — Optimize Mac Storage off, or open the vault in Obsidian
Part B             ✅ complete and unaffected
```

> *The fixture has now stopped three plausible-looking results from becoming authority: a
> census that read nothing, an amendment that guarded at the wrong threshold, and a repair that
> did nothing at all.*
