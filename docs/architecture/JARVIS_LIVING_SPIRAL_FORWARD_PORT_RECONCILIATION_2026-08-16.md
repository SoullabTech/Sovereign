# Living Spiral — Forward-Port Reconciliation onto Current Canonical

**Date:** 2026-08-16
**Classification:** ⭐ **CUSTODY RECORD** — records a relocation and its proofs. Authorizes nothing.
**Authority:** founder authorization 2026-08-16, Living Spiral recovery/reconciliation lane.

```text
CANONICAL BASE               a059264ea  (PR #1055, JOP-01 operator legibility merge)
RECONSTRUCTION BRANCH        chore/living-spiral-forward-port-2026-08-16
METHOD                       bounded cherry-pick of 5 contiguous commits, -x provenance
IMPORTED FROM OTHER LANES    none
IMPLEMENTATION AUTHORITY     NONE
MERGE                        NOT YET — proof first
PACKAGING / APP REPLACEMENT  NOT AUTHORIZED
```

## Why a forward-port and not a rebase

The source lane `chore/jarvis-epistemic-custody-2026-08-16` measured **49 ahead / 0 behind** against
the **local** `clean-main-no-secrets` ref (`f9a7326f1`). That ref was stale. Against
`origin/clean-main-no-secrets` (`a059264ea`) the same lane is **67 ahead and 561 behind**.

> ⚠️ **A branch name is not a commit.** The stale local ref did not fail — it answered, with a
> coherent and entirely misleading ahead/behind count. Every downstream plan built on "49 ahead /
> 0 behind" inherited that error.

Replaying the lane would have carried 62 unrelated branch-local commits, and the root checkout
carried **571 uncommitted paths**, so it was not a promotion base. The Living Spiral was therefore
recovered narrowly onto current canonical.

## What was carried

Five contiguous commits (`7d48e2ff7^..90fb1c98a`), touching **14 paths, all under `docs/`**, all
**absent on canonical** — an additive port with zero conflicts and no source-code changes.

| reconstructed | source | subject |
|---|---|---|
| `a4997da36` | `7d48e2ff7` | record Living Spiral contract return-for-amendment ruling |
| `f3a13a846` | `a798627c9` | amend semantic contract per six founder corrections |
| `4db1ccc0b` | `21db7685c` | M4 decay is temporal-axis motion, completing A4 |
| `407b92db8` | `155646778` | stamp semantic contract ACCEPTED; prototype gate opens |
| `caa285c8c` | `90fb1c98a` | preserve Living Spiral synthetic prototype witness |

## Proofs performed

```text
CONTENT IDENTITY        14/14 paths byte-identical to source (blob-SHA compare + empty diff)
ACCEPTED SEMANTICS      sha256 ebfebb5aa6f496e8… MATCH at 4db1ccc0b · 34,755 B · 624 lines
PROTOTYPE SOURCE        sha256 2acf9367862734c8… MATCH
WITNESS MANIFEST        11/11 declared hashes verify · 0 fail · 0 absent
SABOTAGE CONTROL        mutated frame yields a different digest — the check can go red
JARVIS DESKTOP SUITES   jop-00 14/14 · jop-01 36/36 · c1-evidence-containment 1/1 ·
                        wire-local-native 15/15 — 66 tests, 0 failures, on the reconstruction
```

The nine frames were **moved, never regenerated** — per the manifest, a re-render would be a
successor artifact, not custody of the evidence awaiting witness.

## Findings that survive the port — open, not resolved here

### 1 · Three cited referents do not exist on canonical

| cited path | standing on `a059264ea` |
|---|---|
| `scripts/builder/orient.mjs` | **MISSING** |
| `scripts/builder/epistemic-guard.mjs` | **MISSING** |
| `scripts/governance/escalation-guard.py` | **MISSING** |

Severity differs by claim type:

- Two are listed as ***(CANDIDATE)*** admissible evidence (§ Phenomenon table). A candidate that
  does not yet exist is coherent — it is a proposal, not an assertion.
- **`orient.mjs` is different.** The contract states the no-inference rule is *"inherited from
  `scripts/builder/orient.mjs`, **where this rule is already executable**."* That is an existence
  **and behaviour** claim, and it is **false on current canonical**. It was true only on the source
  lane, which is not canonical and is not being promoted.

⛔ Not repaired here. Amending an `ACCEPTED` contract's semantic content is a governance act, not a
reconciliation act. The defect is recorded so it cannot be inherited silently.

⚠️ Wider implication, outside this lane: `scripts/governance/escalation-guard.py` is described in
the project anchor as the mechanical `PreToolUse` enforcement of the founder-escalation contract.
It is absent from canonical. **Prose escalation discipline currently has no executable enforcement
on `a059264ea`.** Reported only; no repair attempted.

### 2 · `JOP-05A` has no referent on canonical

A full-tree search of `a059264ea` finds only **`JOP-00`** and **`JOP-01`**. No `JOP-05` or `JOP-05A`
identifier exists in any tracked file. The jurisdiction rules named under that label cannot be
bound, applied, or verified until the referent is established.

⛔ `JOP-01` was **not** treated as satisfying `JOP-05A`. Names are not identity.

### 3 · Suite counts differ from the figures carried in planning prose

Planning prose referenced "36 JOP-01" and "188 JOP-00". The first matches. The second does not:
`jop-00-negative-controls.test.mjs` reports **14 tests across 3 suites**, not 188. The counts above
are the measured current totals; the prose figure should not be used as an acceptance threshold.

### 4 · The contract forbids what a deployment plan would assume

The contract's own header, carried across unchanged, states:

```text
SYNTHETIC PROTOTYPE      AUTHORIZED AS NEXT GATE
IMPLEMENTATION           NOT AUTHORIZED
LIVE TELEMETRY           NOT AUTHORIZED
RUN/ASSERTION SUBSTRATE  NOT CREATED OR AUTHORIZED HERE
```

The next gate is **founder pixel witness of the synthetic prototype**, not implementation. Any plan
that proceeds from acceptance directly to building the surface skips that gate.

## Explicitly not done

- ⛔ the other 62 branch-local commits were not imported
- ⛔ the PHI comparator and `check-phi-inventory-ratchet.FAILED-RECONSTRUCTED.sh` were not carried
- ⛔ the 571-path dirty root checkout was not mutated
- ⛔ the running `jarvis-runtime.mjs` process was not touched
- ⛔ `/Applications/JARVIS.app` was not built, replaced, or read for acceptance
- ⛔ no merge, no PR, no packaging
- ⛔ no code was written; this lane is documents and evidence only
