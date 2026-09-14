# WS-PROPOSAL-AUTHORSHIP-01 — Census (six owed items), read-only

**Date:** 2026-09-14 · **Branch:** `claude/bold-bohr-pmtynu`
**Authorized by:** charter §5 ("CENSUS AUTHORIZED — six owed items against the running subject")
**Standing:** ⛔ **CENSUS ONLY.** `DESIGN ⛔ NOT OPENED · SCHEMA ⛔ NOT AUTHORIZED · CODE ⛔ NOT AUTHORIZED`

---

## 0 · Subject and evidence class

```text
HEAD   dd7059b495943479df17e5086da6aafcb48d175e      (377d811d is an ancestor)
repo   /Users/soullab/MAIA-SOVEREIGN · `next dev -p 3100`
DB     maia_focus_witness  (the database actually used by the running process,
                            identified without exposing its connection string)
```

```text
FOUNDER-READ     everything in §1–§6 below — the live schema, the route, the components,
                 their tests, proposalWork.ts, and the founder-walk history
JARVIS-VERIFIED  nothing in this document
```

⭐ The subject is **not present in this checkout** (charter §0 established that, and it remains
true at `dd7059b4`). Every finding here is **founder-read evidence of record**. This census
records it; it does not restate it as independently verified.

⛔ No design follows from this document. Where a finding names a gap, the gap is **named**, not
filled.

---

## 1 · The running `manuscript_revision_proposals` schema (charter owed item 1)

Live table, **14 columns**:

```text
id · member_id · work_id · draft_id · base_version · operation · target_section_id
expected_text · replacement_text · decision_chain_id · created_at · accepted_at
resulting_version · execution_authority
```

**F6 confirmed and extended.** The charter's F6 listed thirteen; the live table carries a
fourteenth:

```text
execution_authority   ∈ { inspection_only , member_acceptance }
                      IMMUTABLE — enforced by trigger, not by convention
```

⛔ **No proposal-succession columns exist.** There is no successor chain, no successor id, no
staged-wording column, no per-successor authorship column.

### ⚠️⚠️ F6′ · The migration ledger does not account for the live schema

```text
three relevant migration files present in source
zero corresponding rows in schema_migrations
```

⭐ This is **A2's opposite failure, confirmed live.** The charter's amendment 2 warned that
solving the old-migration lie by building only against the runtime would produce *"a production
schema nobody can reconstruct."* The census finds that condition **already present**:

> **The live schema is evidentially real but not reconciled with the migration ledger.** The
> runtime is not being falsely described by the old same-named Sep-10 migration — ⛔ but neither
> can its present schema be reconstructed from the recorded migration history.

⛔ This is recorded as a **finding**, not a repair instruction. Reconciliation is owed **before**
any schema change (A2), and is not authorized here.

---

## 2 · `decision_chain_id` semantics (charter owed item 2)

```text
present on the row        YES
foreign key               NONE
populated live            0 of 4 proposals
who writes it             nothing in the proposal path
```

⭐ **An unused optional provenance door.** It is a column that *could* carry lineage and currently
carries none.

⛔ The charter's predicate table already refused to reuse it on an assumed meaning
(*"unknown to this charter — its current semantics are owed before reuse"*). The census resolves
the question in the only honest direction available: **its current semantics are `none in
practice`.** ⛔ An unused column is not a free design surface — adopting it would be **authoring**
a meaning, not **reusing** one, and that is a design act.

---

## 3 · The acceptance path's exact verification set (charter owed item 3)

```text
a 10-step verification set, plus mutation protections
ALL on ONE transaction client
request body EMPTY — no prose, no member_id from the browser
```

⭐ **F4 and F5 confirmed at the level of the actual code, not its summary.** The browser supplies
a selector; every fact the mutation relies on is loaded server-side inside the same transaction.

⭐⭐ The design consequence, stated as a constraint rather than a design:

> Any successor selector added later must be resolved **inside the same transaction, from durable
> state**, and must **not remove or weaken any of the ten checks.** A successor makes the selector
> more specific; it may not make it more trusted.

---

## 4 · The Step-3 note in `proposalWork.ts`, read in full (charter owed item 4)

```text
the note is ARCHITECTURAL INTENT ONLY
no successor route          no successor schema
no successor component      no writer-edit mechanism
```

⭐ F3 stands — editable proposals were **anticipated** — but the census narrows what that
anticipation amounts to: it is a **named intention with no implementation behind it anywhere in
the system.**

⛔ Do not let "anticipated by the architecture" read as "partially built." Nothing is partially
built. This lane would build it from zero against an existing intent.

---

## 5 · Founder-walk history of the proposal surface (charter owed item 5)

Preserved, so it is not rebuilt:

```text
FAILED   detached excerpt                 — the change shown away from its place in the Work
FAILED   duplicate Current/Proposed panels — two texts, and the reader made to diff them
SURVIVING LAW   ⭐ THE SYSTEM PERFORMS THE COMPARISON
```

Two further repairs recorded on the surviving surface:

```text
scrollIntoView   → replaced by room-bounded `revealWithin`
reveal guard     → SPLIT into automatic acts vs voluntary acts
```

```text
SHOW CHANGE      remains DELIBERATELY MISLABELED (charter F1) — unchanged, not overlooked
```

⛔ Neither lawful F1 repair (rename · real disclosure behaviour) is chosen by this census.

---

## 6 · Acceptance / authorship semantics (charter owed item 6, founder-added)

### What the existing system and prior rulings already say — they agree

```text
CMT-01 Decision 2            authorship is an AXIS SET, never one scalar
                             (authoredBy · participationClass · authority)
EDITORIAL-DECISION-01        member_authored  ·  member_confirmed_maia_proposal
                             — the two acceptance shapes already distinguished
Charter AMENDMENT 1          acceptance grants AUTHORITY; it does not rewrite AUTHORSHIP
```

⭐ Three independent instruments, authored at different times for different purposes, land on the
same distinction. **A1 was not a new invention; it restated law the system already held.**

### ⚠️ What the live record does NOT preserve

```text
wording_author    ABSENT
accepted_by       ABSENT
acceptance_act    ABSENT
```

And the column that exists is **not** the one that would answer it:

```text
execution_authority = member_acceptance
   MEANS      this proposal is STRUCTURALLY PERMITTED to cross into the Work
   DOES NOT MEAN   a member actually performed the acceptance gesture
```

⭐⭐ **A permission is not an act.** This is precisely the Sep-13 witness precedent, which resolved
as:

```text
SYSTEM ACCEPTANCE RECORD   REAL
AUTHORIAL RATIFICATION     UNRESOLVED
```

### ⭐⭐ The census statement

> **The conceptual model already separates proposal authorship, proposal selection, and manuscript
> authority. The current exact-change record does not yet preserve all three as independently
> recoverable provenance.**

⛔ **That is a census statement, not a schema proposal.** It names a gap between what the
programme's law distinguishes and what the durable record can reconstruct. It proposes no columns,
no tables and no mechanism.

---

## 7 · What any eventual system must be able to answer

Stated as acceptance criteria on the **question**, not as a design:

```text
1  who authored the wording
2  which wording the member selected
3  who granted it authority to enter the Work
```

⭐ Three acts, never collapsed. Today the live record can answer none of the three from its own
columns.

---

## 8 · Standing after this census

```text
LANE          WS-PROPOSAL-AUTHORSHIP-01 — CENSUS COMPLETE
SUBJECT       dd7059b4 (Mac Studio runtime) — NOT present in this checkout
EVIDENCE      founder-read throughout; Jarvis verified nothing here
SIX ITEMS     1 live schema ✓ · 2 decision_chain_id ✓ · 3 verification set ✓
              4 Step-3 note ✓ · 5 founder-walk history ✓ · 6 acceptance semantics ✓
CARRIED       F6′ migration-ledger reconciliation gap (A2, opposite failure — LIVE)
              §6 three-act provenance not independently recoverable
DESIGN        ⛔ NOT OPENED
SCHEMA        ⛔ NOT AUTHORIZED       MIGRATION ⛔ NOT AUTHORIZED
CODE          ⛔ NOT AUTHORIZED       NONE WRITTEN
```

> **The census answers what is. It authorizes nothing about what should be.**
