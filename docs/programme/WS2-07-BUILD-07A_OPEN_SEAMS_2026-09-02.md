# WS2-07 · BUILD-07A — the two open seams

```text
LANE       JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
UNIT       BUILD-07A · DEVELOPMENTAL EVIDENCE
STATUS     RULED 2026-09-02 · both seams · BUILT AND WITNESSED (see §5)
DATE       2026-09-02
```

⛔ **This document decides nothing.** It records two questions the substrate cannot
currently answer, so that neither is discovered later as a surprise and neither acquires a
convenient implementation in the meantime. Both are BUILD-07A work. Neither is Stage 8.

---

## 1 · What is proven, so the open parts are legible against it

```text
textual INV-7b      PROVEN as a mechanism, against the real custody substrate
                    22 checks, PostgreSQL 16 from an empty database
                    scripts/ws2-07-build-07a-inv7b-witness.ts
falsifier 4         PROVEN against real structure rows — 16 checks
                    scripts/ws2-07-build-07a-f4-witness.ts
falsifiers 1,2,3,5–10  passing in the pure substrate
outcomes            0 / 6 demonstrated
```

**A mechanism is not an outcome.** `resolveHistorical` proves a conditional:

```text
IF an exact frozen revision N exists
→ the evidence a reading rested on is recoverable from it
```

The two seams below are both about the antecedent.

---

## 2 · SEAM A — the exact-state capture rule

**The question.** How does a developmental read obtain an immutable revision that EXACTLY
matches the live Work it actually read?

**Why it is open.** `working_draft_revisions` rows are appended on checkpoints, not on
ordinary saves. Verified against the code rather than assumed — every writer of that table
is a create, a member-initiated checkpoint, a restore, or a blank-manuscript
initialization. A section-native autosave updates the live draft and appends nothing.

So a member who has been writing since their last checkpoint has a live draft that matches
no revision. A reading taken now would rest on a state no immutable row holds.

**⛔ Three answers that must not be reached for.**

```text
read the latest checkpoint instead   the reading would rest on prose the member has
                                     already moved past, while claiming to describe
                                     their Work — evidence for a claim never made
                                     about the current Work (INV-19, from the
                                     other direction)

copy the read prose somewhere        the second durable prose store the recoverability
                                     ruling rejected, arriving through a side door

make "Ask MAIA to read" append a     a read gesture that writes to the Work. Reading
revision as a side effect            must not mutate what it reads, and a revision the
                                     member did not ask for is a revision they did not
                                     author
```

**What would settle it.** A capture rule under which the state read IS an immutable
revision, with the member's authorship of that revision intact. Naming that rule is
BUILD-07A work and is not attempted here.

---

## 3 · SEAM B — the structural analogue of `FrozenSectionState`

**The question.** What immutable object lets us recover the exact authored structure as it
stood when a reading happened?

**Why it is open.** DECIDE ruled it directly: `structureFingerprint` detects change, but
unless the structure context is itself frozen or points at a durable immutable snapshot, a
superseded structure-dependent observation cannot show the author the structure it actually
reasoned from.

The substrate now says this out loud rather than papering over it:

```text
FrozenStructure          topologyFingerprint + per-unit fingerprints
                         → makes SUPERSESSION scoped (falsifier 8)
                         → does NOT make structure recoverable
resolveEvidence(...)     refuses structural evidence with
                         `structure_not_historically_recoverable`
```

**⛔ Per-unit digests are not a partial answer.** They make supersession precise; no number
of digests recovers a structure. Adding more granularity would look like progress on this
seam while being progress on a different one.

**What would settle it.** A durable address to an exact authored-structure snapshot,
alongside the fingerprint — the structural counterpart of what
`working_draft_revisions.section_partition` did for prose, and subject to the same
constraint: no second custody domain for the member's own declarations.

---

## 4 · The line this document exists to hold

⛔ **Do not build the reader, the Develop surface, developmental observations, or revision
machinery because the substrate has become interesting.** Everything proven so far is
mechanical and model-free, and the value of that is precisely that it decided nothing about
what MAIA may say.

Until Seam A and Seam B are answered:

```text
structural EvidenceRef   typed · guarded · NOT historically recoverable
heading EvidenceRef      HELD UNAVAILABLE — no authoritative boundary exists
                         (manuscript_draft_sections stores `text` and nothing else)
BUILD-07B–H              unauthorized
Stage 8                  untouched
```

---

## 5 · RULED AND WITNESSED — 2026-09-02

Recorded beneath the findings, not in place of them.

### The governing ruling

```text
A developmental reading may reason only from an explicitly FROZEN Work state,
addressed durably and never copied:

    PROSE      → an existing member-authored immutable working-draft revision
    STRUCTURE  → an immutable manuscript-owned structure snapshot
```

**The constitutional floor, in one line:** *MAIA does not freeze the Work. The member freezes
a version; MAIA is later allowed to read that frozen version.*

### Seam A — closed

`proveExactReadRevision` admits a reading only against a revision the Work EXACTLY equals.
Exactness is about the STATE, not the version number: a writer may change a sentence and
restore it, and the Work is then again the one that was frozen. And it is about the
PARTITION as well as the text — identical prose cut at different boundaries is a different
input, because evidence addressed to a section id would recover a different passage.

Refusals are typed and write nothing: `checkpoint_required`, `partition_mismatch`,
`partition_not_recorded`. The first is named for what the member would do about it, not for
what the system noticed.

### Seam B — closed

`manuscript_structure_snapshots` (migration `20260902000004`) — manuscript-owned, append-only,
no prose. Units and direct memberships by reference, frozen as structural SEMANTICS rather
than as whatever columns the table happens to carry.

Capture is serialized under the manuscript row's lock: a series of unlocked selects while
another structural gesture moved the tree would freeze a state that never existed — units
from before a move, memberships from after it.

`FrozenStructure` therefore changes character:

```text
before   fingerprints only              → comparison
after    snapshotId + fingerprints      → historical recovery + scoped currentness
```

### Evidence

```text
scripts/ws2-07-build-07a-seams-witness.ts — 21 checks, 0 failures,
PostgreSQL 16 from an EMPTY database, astral prose throughout.

SEAM A   exact match → admissible · Work moved on → checkpoint_required, with
         NOTHING written to make it admissible · prose restored by hand →
         admissible again though the version moved twice · identical prose cut
         differently → partition_mismatch · no recorded partition → refused
SEAM B   captured with a durable address · holds no manuscript prose · holds no
         proposal, whose id is a uuid like any unit's · freezes semantics not
         schema trivia · after a rename, the snapshot shows the title AS IT
         STOOD while the Work says otherwise · the renamed division's evidence
         supersedes while the untouched division's stays CURRENT · the snapshot
         cannot be rewritten · another member cannot load it
migration applies from empty · idempotent · rollback clean · re-apply clean
```

### One defect the witness found in the implementation

When several revisions hold the same exact prose and none survives the whole proof, the
reported refusal originally depended on **iteration order** — a member could have seen
`partition_not_recorded` one day and `partition_mismatch` the next without touching their
Work. Precedence is now frozen to the most recent candidate. Same discipline the
section-save contract froze for its own refusals, and the same reason: a client cannot map
an order-dependent refusal to member-facing behaviour.

### ⛔ What is still NOT done

Structural INV-7b is now **mechanically demonstrable**, and that is not the same as
demonstrated end-to-end through an `EvidenceRef`: the snapshot recovers, and wiring
`FrozenStructure.snapshotId` through `resolveEvidence` so structural evidence stops
returning `structure_not_historically_recoverable` is the next step, not a finished one.

The board does not move.

```text
BUILD-07A          ON TARGET
textual INV-7b     PROVEN
F4                 PROVEN
Seam A             RULED · proof delivered
structural INV-7b  RULED · recovery mechanism delivered; evidence path not yet wired
outcomes           0 / 6
BUILD-07B–H · Stage 8   untouched
```
