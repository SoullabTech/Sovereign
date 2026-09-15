# MAIA-WISDOM-WITNESS-01 · Instrument Amendment 2B

**Status: CANDIDATE · ⛔ NOT RE-ACCEPTED · ⛔ PART A RUN #2 NOT PERFORMED.**
**Date:** 2026-09-15 · Completion of the trust rule across **both** content channels.

---

## 1. The mismatch, found in founder review of `ea56694b`

Amendment 2A unified the threshold for text reads and left hashing **merely counted.** But the
census has **two** content-reading channels feeding **different** findings:

```
readTextHead()  →  frontmatter · domain signal · authorship signal
hashFile()      →  duplicate clusters · redundant-file count
```

⛔ **The guard consumed only `textSuccessRate`.** So this was admissible:

```
text  1000/1000  ✅        content_findings_trustworthy = true
hash   500/1000  ⛔        report written · CENSUS COMPLETE
                           duplication table emitted from half the corpus
```

### ⭐⭐ And it is not hypothetical on this tree — verified in source

| | |
|---|---|
| `readTextHead()` | attempted only for **immediate-readability, non-empty, <16 MB** files (`:309`) |
| `hashFile()` | attempted for **every counted file** (`:298`) |
| startup probe | samples **only immediate-readability** files (`:229`) |

⭐ **So materialized Markdown beside dataless PDFs or media passes the probe, passes a
text-only gate at 100%, and still emits duplication from a partially hashed corpus.** That is
precisely the state the AIN tree will be in *during* materialization — the failure mode was
waiting on the next run.

## 2. The repair

Each channel carries its own rate against the **same** threshold; completion requires **both**:

```js
const TRUST_THRESHOLD = 0.95;
const textFindingsTrustworthy = textSuccessRate >= TRUST_THRESHOLD;
const hashFindingsTrustworthy = hashSuccessRate >= TRUST_THRESHOLD;
const contentFindingsTrustworthy = textFindingsTrustworthy && hashFindingsTrustworthy;

if (textChannelFails || hashChannelFails) { /* refuse, name the failing channel, exit 5 */ }
```

⭐ The refusal **names which channel failed and what it governs**, and stays silent about a
channel that passed. `census.json` and `CENSUS.md` expose both rates and all three booleans.

## 3. Acceptance witness

| | Test | Result |
|---|---|---|
| **A** | `node --check` | ⭐ OK |
| **B** | text 19/20 = 95.0% | ⭐ `exit 0`, report written |
| **C** | text 18/20 = 90.0% | ⭐ `exit 5`, no report |
| **D1** | ⭐ **19 readable `.md` + 1 dataless `.pdf`** → text 19/19 = 100%, **hash 19/20 = 95.0%** | ⭐ `exit 0`, report written |
| **D2** | ⭐ **18 readable `.md` + 2 dataless `.pdf`** → text 18/18 = **100%**, **hash 18/20 = 90.0%** | ⭐ `exit 5`, **no report** — `REFUSED: a content-reading channel fell below 95%. / hash reads: 18/20 (90.0%) — duplication clusters` |
| **E** | `--out` inside `--root` | ⭐ `exit 3` |
| **F** | startup mass-read failure | ⭐ `exit 4` |
| **G** | real corpus untouched, no Run #2 | ⭐ fixture unchanged |
| **H** | no independent threshold recomputation | ⭐ **one literal `0.95`** — the constant; 6 references to `TRUST_THRESHOLD` |

⭐⭐ **D2 is the decisive case: text at 100% and the run still refuses.** Under `ea56694b` it
would have written `CENSUS COMPLETE` with a duplication table built from 90% of the corpus.
⭐ **The fixture is not synthetic** — readable Markdown beside unreadable PDFs is exactly what
partial iCloud materialization produces.

**Unchanged:** hashing · text parsing · traversal · AppleDouble and `.backup` exclusions ·
startup probe · threshold value · corpus semantics · read-only behaviour.

## 4. Standing

```
Amendment 1        ✅ discharged
Amendment 2        ✅ per-stage counters · exclusions · probe · fail-closed
Amendment 2A       ✅ one text-trust authority, threshold witnessed both sides
Amendment 2B       ⚠️ CANDIDATE — dual-channel trust, awaiting re-acceptance
Instrument         ⛔ not re-accepted
Materialization    ⏳ owed — container still 432K, errno 60
Part A Run #1      ⛔ inadmissible
Part A Run #2      ⛔ not authorized
Part B             ✅ complete
```

> *Four amendments, and every one of them closed a way for partial observation to wear the
> label CENSUS COMPLETE. The last was the quietest: a channel nobody was watching, feeding a
> table nobody would have doubted.*
