# JOP-03 — Packaging & Distribution Witness Mandate

**Status:** ⭐ **ISSUED** — founder ruling 2026-08-16.
**Confers** the bounded authority described below, and nothing beyond it.

⛔ **JOP-03 execution does not begin merely because this file exists or was moved.** Execution begins
when the named lane (⬥C) takes the unit under the rulings below.

---

## 0 · Objective

Package a canonical descendant of `89d72e9c0` containing the JOP-02 remediation repair, **prove the
packaged artifact**, and — **only if ⬥B is granted** — replace the installed `/Applications/JARVIS.app`
with that exact accepted artifact and witness the installed result.

The four owed states must be deliberately produced **on the artifact rung required by the obligation
being discharged**. ⛔ No packaged observation may be promoted to installed evidence.

## 1 · Standing this inherits

```text
SOURCE CLOSURE            ESTABLISHED @ 89d72e9c0
DISTRIBUTION CLOSURE      NOT ESTABLISHED
INSTALLED LIVING SPIRAL   FAILED / REPAIR REQUIRED
CURRENT INSTALLED         58d4915f4 — contains the repaired defect
JOP-01 packaged witness    PARTIAL PASS — closure NOT established
```

⛔ Merging a repair never discharged a distribution obligation.
⛔ `packaged ≠ installed ≠ running ≠ witnessed`.

## 2 · Bounded mandate

| | |
|---|---|
| **Scope** | build · packaged acceptance · **install if authorized under ⬥B** · installed witness · record |
| **Exclusions** | ⛔ no source changes to fix what the witness finds — a defect **ends the unit** and opens a repair unit. ⛔ no MAIA/production deploy. ⛔ no `.ain` claim authored to satisfy a gate. |
| **Authority** | this issued mandate, incl. ⬥A, ⬥B, ⬥C |
| **Stopping condition** | all obligations in scope closed with negative controls, **or** first blocking finding |
| **Evidence required** | full identity chain (§6) · per-state records (§5) · screenshots |
| **Not authorized** | ⛔ opening JOP-05A · ⛔ binding a temporal source · ⛔ altering the semantic contract · ⛔ writing another lane's worktree · ⛔ mutating the founder's ordinary JARVIS state |

## 3 · Issued rulings

### ⬥A — Source referent

```text
0ee76cf4cf96c8dc562f7c68508e096fc4e3e479

Verified current `clean-main-no-secrets` at issuance.
Verified descendant of 89d72e9c0.
```

**Runtime/package delta census REQUIRED before build:**

```text
Compare 89d72e9c0..0ee76cf4cf96c8dc562f7c68508e096fc4e3e479
Enumerate every path in that range that can enter the JARVIS runtime/package.

  no later JARVIS-runtime changes   → record that fact
  later changes exist               → enumerate them before proceeding;
                                      the witness is for the SELECTED ARTIFACT AS A WHOLE
                                      and may NOT be attributed solely to the JOP-02 repair

⛔ Do not discover the effective runtime bundle after acceptance.
```

### ⬥A — Byte identity

```text
REQUIRED:
  SHA-256 final distributable artifact
  SHA-256 final inner JARVIS.app bundle
  SHA-256 installed JARVIS.app bundle
  running build stamp + executable path
```

Digests are measured **after all byte-changing packaging / signing / notarization steps** and
**before packaged acceptance**.

```text
SOURCE SHA → FINAL PACKAGE DIGEST → PACKAGED JARVIS.app DIGEST
           → INSTALLED JARVIS.app DIGEST → RUNNING EXECUTABLE PATH + BUILD STAMP
```

⚠️ The failure this closes: accept artifact A from the named SHA → signing/notarization rewrites bytes
→ install artifact B → B carries A's source stamp → the witness is attributed to A.

### ⬥B — Install authority

**GRANTED, artifact-specific.** `/Applications/JARVIS.app` may be replaced **ONLY** with the exact
artifact that passes packaged acceptance under this mandate.

```text
Preconditions:
  outgoing artifact identity recorded
  rollback preserved
  no running JARVIS referent
  no rebuild/repackage after acceptance

Authority EXPIRES if the source SHA or the accepted artifact digest changes.
```

```text
After replacement:
  prove the launched executable is under /Applications/JARVIS.app
  and is NOT the packaged-acceptance copy or a surviving old process
```

⛔ Without a passing packaged acceptance the unit ends at **packaged, not installed** — a legitimate
completion state, not a failure. Install authority never survives the artifact it was granted for.

### ⬥C — Lane owner

```text
jop-03-packaging-witness-2026-08-16
```

Exactly one session owns this unit and its worktree. ⛔ **No second lane may share or continue it
implicitly.**

## 4 · Sequence

**4.1 Rebind.** Resolve canonical, the named SHA, worktree/branch, dirty state, and every running
JARVIS process. Eliminate the second-referent case **before** building. Run the ⬥A delta census.

**4.2 Build** from the named SHA only. ⛔ Never from a dirty checkout, a feature worktree, or a stale
`dist/`. Build stamp must equal the named SHA.

**4.3 Packaged acceptance** — run the packaged artifact *before* replacing anything installed:
artifact identity · digests · build stamp · Living Spiral loads · single running referent.

**4.4 Install** — only under ⬥B, per its preconditions.

**4.5 Force the four states** (§5) on the rung each obligation requires.

**4.6 Record** (§6). ⛔ Do not collapse the rungs.

## 5 · The four owed states — deliberately forced

```text
1. JARVIS_REPO_ROOT precedence rendering
2. unbound-source rendering
3. one hollow / UNOBSERVED node
4. one licensed edge
```

⛔⛔ A normal launch that happens not to expose these **cannot discharge them.** States 3 and 4 will
not appear on their own.

### Per-state record

```text
SETUP CONDITION      what was done to force it
EXPECTED RENDERING   stated BEFORE looking
ACTUAL RENDERING     what the screen showed
NEGATIVE CONTROL     see rule below
ARTIFACT / RUNG      which digest, and packaged or installed
```

⚠️ Expected rendering is written **before** observation. Writing it afterwards converts a surprise
into a confirmation.

### Negative-control rule

Proof the rendering could have been wrong. **Where practical, the negative control changes exactly
one relevant antecedent and predicts the resulting rendering change before observation.**

```text
positive fixture   condition X present  → expected rendering X
negative control   condition X absent   → rendering X must disappear or change

⛔ NOT: positive fixture in one world, "negative control" in an unrelated world
```

### Fixture rule

All state-forcing fixtures and launch conditions must be: **synthetic** (no member-derived data) ·
**source-preserving** (no application source modification) · **named before observation** ·
**recorded sufficiently to reproduce** · **identity-bound by hash** where a file is involved ·
**isolated from normal JARVIS user state**.

Prefer a dedicated witness profile / user-data directory. ⛔ **Do not clear or mutate the founder's
ordinary JARVIS state to manufacture a witness** — otherwise *"the state appeared because old local
settings happened to contain it"* becomes indistinguishable from a deterministic fixture.

### Closure jurisdiction

```text
A state observed on the PACKAGED artifact is evidence only for obligations whose
contract accepts packaged evidence.

An INSTALLED-acceptance obligation requires the same state on the INSTALLED artifact.

⛔ Never inherit a packaged observation into the installed rung merely because the
   installed artifact is intended to be the same bytes.
```

Byte identity does not prove the installed substrate, launch path, profile, permissions, or runtime
context behaved the same way.

## 6 · Final record

```text
source SHA
runtime delta census result
final package digest
packaged JARVIS.app digest
installed JARVIS.app digest
running executable path
running build stamp
outgoing installed digest + build stamp
rollback artifact/path + digest

four state records (with rung) · screenshots

Living Spiral installed acceptance   CLOSED / NOT CLOSED
JOP-01 distribution witness          CLOSED / NOT CLOSED
known unresolved · explicit non-authorities
```

**Required:** `accepted packaged app digest == installed app digest`, unless the packaging mechanism
is documented to change representation while preserving a separately bound inner bundle.

```text
BUILT · INSTALLED · RUNNING · WITNESSED — four rungs, never collapsed to "deployed"
```

⛔ A witness that finds a defect **cannot simultaneously accept the artifact containing it.**
⛔ *"Closed, minus N unexercised states"* is not closure.

## 7 · Stop conditions

**Canonical movement.**

```text
Before build:
  stop if the named SHA cannot be proven to satisfy the issuance ancestry/custody conditions.

After the named SHA is bound:
  subsequent movement of canonical is RECORDED but does NOT invalidate the witness,
  unless that movement explicitly revokes the selected referent or the mandate
  requires rebinding.

⛔ Never silently substitute the new canonical tip.
```

Binding an immutable SHA exists precisely to remove that dependency; unrelated `main` motion must not
destabilise the lane.

**Otherwise stop and report** if: another lane owns the worktree · build stamp ≠ named SHA · the
artifact digest changes after acceptance · a second JARVIS referent cannot be eliminated · a state
cannot be forced without changing source or mutating the founder's ordinary state · the witness finds
a defect · installation would be required without a passing packaged acceptance · member-derived data
would enter the surface.

---

## Provenance

Drafted by the JOP-02 source lane after that lane closed at `89d72e9c0`; revised once under founder
review (nine substantive corrections, principally the binding of **artifact bytes** rather than
source lineage alone, the runtime delta census, fixture custody, one-variable negative controls, and
the removal of canonical movement as an automatic mid-flight blocker). Issued 2026-08-16.
