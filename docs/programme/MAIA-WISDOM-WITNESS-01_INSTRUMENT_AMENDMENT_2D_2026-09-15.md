# MAIA-WISDOM-WITNESS-01 · Instrument Amendment 2D

**Status: CANDIDATE · ⛔ FINAL INSTRUMENT RE-ACCEPTANCE OWED · ⛔ PART A RUN #2 NOT PERFORMED.**
**Date:** 2026-09-15 · **Unknown must remain unknown.** 2C re-accepted at `10868ff7`.

---

## 1. The defect inside the tolerance

2C closed structural fail-open. But the **tolerated 5%** was still being converted into findings.

When a text read failed, the code left `fmPresent = null`, `domains = []`, `soullab = false` —
and those defaults were then aggregated **identically to a successful read that found nothing**:

```
file unread  →  counted in "Absent frontmatter"        ← a false negative
             →  contributes 0 to every domain count    ← a false negative
             →  contributes 0 to the authorship count  ← a false negative
             →  no hash, so absent from every cluster  ← reported as exact
```

⭐ **So an admitted run at 95% would have published up to 5% of its corpus as evidence of
absence — of frontmatter it never looked for, of domains it never searched, of authorship it
never checked.** The instrument's own tolerance was its remaining source of false findings.

## 2. The repair

**Observation is now tracked per file and never collapses into absence.**

| Surface | Before | After |
|---|---|---|
| Frontmatter | `complete · partial · absent` | `complete · partial · **absent (read, none found)** · ⛔ **unknown (eligible but unread)**` |
| Domain signal | counts over "immediately-readable files" | counts over **files whose content was actually read**, with the unread count stated |
| Authorship | `N files (x%)` | `N of the M files read`, with unread explicitly **not** counted as lacking |
| Duplication | clusters presented as exact | ⭐ **exact** at 100% hash coverage; ⛔ **observed lower bound** below it, naming the unhashed count |
| Per record | `domain_signal: []`, `soullab: false` | `content_observed: bool`; signals **`null`** when unobserved |

New `observation_scope` block in `census.json`: `files_whose_content_was_read` ·
`files_eligible_but_unread` · `domain_and_authorship_denominator` · `duplication_coverage` ·
`duplication_counts_are` · `files_unhashed`.

⭐ The duplication caveat states the reasoning, not just the number: *an unhashed file cannot be
shown to duplicate anything, and its absence from a cluster is not evidence that it is unique.*

## 3. Acceptance witness

| | Test | Result |
|---|---|---|
| **A** | `node --check` | ⭐ OK |
| **B** | every prior gate | ⭐ text `0`/`5` · hash `0`/`5` · readdir `6` · lstat `6` · containment `3` · probe `4` |
| **C** | clean run | ⭐ `Unknown 0` · `Hash coverage complete` · `duplication: complete — exact` |
| **D** | ⭐⭐ **19/20 text at 95% — admitted** | ⭐ `absent (read, none found): 19` · **`unknown (unread): 1`** · `domain denominator: 19 of 20` |
| **E** | hash 95% — admitted | ⭐ `OBSERVED LOWER BOUND` · `unhashed: 1` |
| **F** | real corpus untouched, no Run #2 | ⭐ fixture unchanged |

⭐⭐ **D is the case.** That run is *admitted* — it passes every gate. Under `10868ff7` its
report would have said **20 files absent frontmatter**. It now says **19 absent, 1 unknown**, and
computes domain and authorship over 19. **One file, correctly not counted as evidence.**

## 4. The law, complete

```
STRUCTURE        readdir  0 failures        exact
                 lstat    0 failures        exact

CONTENT          text     ≥ 95%             thresholded
                 hash     ≥ 95%             thresholded

WITHIN TOLERANCE unobserved files stay UNKNOWN
                 — never counted as absence
                 — never counted in a denominator
                 — duplication becomes a lower bound
```

> **Structure must be fully observed. Content may be partially observed within the admitted
> threshold, but unobserved content may not be converted into evidence of absence.**

## 5. Standing

```
Amendment 1   ✅   2   ✅   2A  ✅   2B  ✅   2C  ✅ (10868ff7)
Amendment 2D  ⚠️ CANDIDATE — awaiting final instrument re-acceptance

Materialization ⏳ owed — container still 432K, errno 60
Part A Run #1   ⛔ inadmissible     Part A Run #2  ⛔ not authorized
Part B          ✅ complete
```

> *Six amendments. The first asked what to exclude, the next three whether the files could be
> read, the fifth whether the tree had been seen — and the last one whether silence had been
> quietly written down as an answer.*
