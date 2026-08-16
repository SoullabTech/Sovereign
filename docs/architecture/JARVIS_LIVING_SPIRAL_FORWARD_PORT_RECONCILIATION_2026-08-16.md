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

✅ **REPAIRED under founder authorization 2026-08-16** — erratum E1, provenance claim only. See
§Erratum E1 below. The two *(CANDIDATE)* entries were left alone: a candidate that does not yet
exist is a coherent proposal, not a false assertion.

### 1b · Escalation guard — status only, no conclusion drawn

```text
scripts/governance/escalation-guard.py     ABSENT ON CANONICAL
CLAIM OF MECHANICAL ENFORCEMENT BY PATH    NOT ESTABLISHED
EQUIVALENT ENFORCEMENT ELSEWHERE           NOT YET DETERMINED
LIVING SPIRAL ADMISSION DEPENDENCY         NO
```

⚠️ **Correction to an earlier draft of this record.** A prior revision stated that "prose escalation
discipline currently has no executable enforcement on `a059264ea`." That overreached: absence of
that **path** was proved; absence of **enforcement** was not. Whether this is stale documentation,
renamed or relocated enforcement, equivalent hook enforcement elsewhere, or a genuinely missing
constitutional guard is **undetermined** and requires a separate read-only trace.

⛔ Do not recreate `escalation-guard.py` from the stale branch merely because the project anchor
names it. ⛔ Do not assert the escalation contract *is* mechanically enforced by that file until a
trace establishes what actually enforces it.

### 2 · `JOP` jurisdiction standing — corrected

Founder correction, 2026-08-16. An earlier instruction described "now-canonical JOP-01/JOP-05A
rules"; `JOP-05A` is not canonical. The correct standing is:

```text
JOP-01     CANONICAL
JOP-05A    PLANNED / NOT YET BOUND
JOP-02     Living Spiral forward-port — in admission (this lane)
```

A full-tree search of `a059264ea` finds only `JOP-00` and `JOP-01`. ⛔ `JOP-01` was **not** treated
as satisfying `JOP-05A`. Names are not identity.

**No correction was needed in the recovered corpus.** `JOP-05A` appears in **none** of the 14
forward-ported files — the only occurrences are in this reconciliation record. A jurisdiction ruling
may legitimately state requirements a future `JOP-05A` must satisfy; it may not speak as though
`JOP-05A` already exists. Nothing in the recovered files does so.

### 3 · Suite accounting — corrected

The figure "188" was used loosely as "JOP-00". It was an **aggregate assertion/regression count
across several Desktop suites**, not the measured size of JOP-00. It is not an architectural fact
and must not be used as an acceptance threshold. Measured on this reconstruction:

```text
jop-00-negative-controls     14 tests   14 pass   0 fail
jop-01-legibility            36 tests   36 pass   0 fail
c1-evidence-containment       1 test     1 pass   0 fail
wire-local-native            15 tests   15 pass   0 fail
                             ─────────────────────────────
TOTAL                        66 tests   66 pass   0 fail
```

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

## Erratum E1 — exactly which bytes changed, and why

Founder-authorized 2026-08-16: **factual/provenance corrections only, no semantic reopening.**

```text
OLD ACCEPTED CONTRACT HASH   ebfebb5aa6f496e8ce8023b030c7a3576d598448954620c303ffb6b2f626fbfe
                             34,755 B · 624 lines  → now the HISTORICAL PRE-ERRATUM referent
OLD CLAIM (verbatim)         "(inherited from `scripts/builder/orient.mjs`, where this rule is
                             already executable)"
REASON FOR AMENDMENT         referent absent on canonical a059264ea
SEMANTIC CHANGE              NONE
PROVENANCE CLAIM CHANGE      YES — canonical executable inheritance withdrawn
NEW CONTRACT HASH            7193d1236cc231191d57f07347ac87bce167fae00c81f13e39b217fe82f5d46c
                             37,904 B · 677 lines
```

⛔ `ebfebb5a…` must no longer be advertised as the contract's current byte identity.

**Two files amended. Twelve unchanged.**

| path | standing |
|---|---|
| `JARVIS_LIVING_SPIRAL_SEMANTIC_CONTRACT_2026-08-16.md` | **AMENDED** — E1 erratum + rule sentence |
| `evidence/living-spiral-prototype/WITNESS_MANIFEST.md` | **AMENDED** — pre/post-erratum standing |
| 9 frames · `living-spiral-prototype.html` · `capture-witness.js` · founder ruling | **byte-identical to source** |

⚠️ **The prototype HTML still cites `ebfebb5a…` and was deliberately left untouched.** It is frozen
evidence: the nine frames were rendered against that text, and its own identity `2acf9367…` is
declared in the manifest. Editing it would break that identity, invalidate all nine frames, and
destroy custody of the corpus awaiting founder witness. The citation is **correct for that
artifact** — it records what the prototype was rendered against, not what the contract now says.

### Re-proof after the amendment

```text
WITNESS MANIFEST         11/11 verify · 0 fail · 0 absent  (manifest declares no self-hash,
                         so amending it cannot disturb its own result)
SABOTAGE CONTROL         mutated prototype html → f0b048e77375 ≠ 2acf93678627 — check can go red
UNAMENDED PATHS          12/12 byte-identical to source at 90fb1c98a
JARVIS DESKTOP SUITES    66/66 pass, 0 fail — unchanged by the amendment
```

## Explicitly not done

- ⛔ the other 62 branch-local commits were not imported
- ⛔ the PHI comparator and `check-phi-inventory-ratchet.FAILED-RECONSTRUCTED.sh` were not carried
- ⛔ the 571-path dirty root checkout was not mutated
- ⛔ the running `jarvis-runtime.mjs` process was not touched
- ⛔ `/Applications/JARVIS.app` was not built, replaced, or read for acceptance
- ⛔ no merge, no PR, no packaging
- ⛔ no code was written; this lane is documents and evidence only
