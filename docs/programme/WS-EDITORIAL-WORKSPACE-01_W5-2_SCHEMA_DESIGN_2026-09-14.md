# `W5-2` — SCHEMA DESIGN · DESIGN RECORD ONLY

**Status:** DESIGN RETURNED · ⛔ **NO EXECUTABLE MIGRATION · NO STORE · NO RUNTIME · NO UI**
**Branch:** `claude/w5-ontology-census` (record-only continuation) · ⛔ the executable schema act starts on a **fresh** branch
**Governed by:** the W5-1 / W5-1.1 / W5-1.2 contract (`lib/manuscript/editorialWorkspace/ontology.ts`)

> **The persistence rule over all of it:** the database must be able to prove **what kind of
> editorial act this is**, **who authored it**, **which chain it belongs to**, and — where
> another object is referenced — **that the relationship stays inside the same editorial
> subject.** ⛔ No convenience relation may recreate a collapse the ontology has already removed.

⭐ Every fact below was **read from the migrations at this tip**, not recalled.

---

## 1. Discourse — the thread owns the chain relationship

⭐ **RULED (founder): a nullable typed parent column on `ask_threads`. ⛔ Not a separate
binding table.**

```
ask_threads
    proposal_chain_id  uuid  NULL
```

with ONE composite relationship proving three facts together:

```
(member_id, manuscript_id, proposal_chain_id)
        ↓  REFERENCES
proposal_chains (member_id, work_id, id)
```

⭐ **Same member · same Work · exact chain — and no application-side reconciliation earns any
part of it.** ⛔ A relation proving only `thread.member_id = chain.member_id` would admit
*Kelly's thread about Work X bound to Kelly's chain about Work Y* — the 01A.1 wrong-Work
substitution reopened in persistence, underneath the mount three cutover acts just cleaned.

### 1.1 ⚠️ THE NULL SEMANTICS ARE LOAD-BEARING AND SUBTLE — `MATCH SIMPLE`, deliberately

Verified at this tip: `ask_threads.member_id` and `.manuscript_id` are **`NOT NULL`**;
`proposal_chain_id` would be nullable. Under PostgreSQL's default **`MATCH SIMPLE`**, a
composite foreign key is **not checked at all when any column is NULL** — so an unbound thread
(`proposal_chain_id IS NULL`) is admitted without consulting `proposal_chains`, which is exactly
the behaviour S1 requires.

⛔ **`MATCH FULL` would be wrong and must not be written**: it rejects a partially-NULL key, so
every existing unbound thread would become unrepresentable. ⭐ The schema act must state
`MATCH SIMPLE` explicitly rather than inheriting it silently, because a reader who does not know
this rule will assume the FK is enforced on every row.

### 1.2 The FK target constraint

`proposal_chains` already carries `UNIQUE (member_id, id)` (`20260914000003`). The three-fact FK
needs `UNIQUE (member_id, work_id, id)` as its target.

⛔ **It is an FK TARGET and nothing else.** `id` is already the primary key and therefore
globally unique, so this constraint **adds no new chain identity and no new row-level
restriction** — it exists so the referencing side can name all three columns. That is the same
reasoning `20260914000003` recorded for `UNIQUE (member_id, id)`, and it must be recorded again
rather than assumed.

### 1.3 Lifecycle — bound at open, or never

⭐ `proposal_chain_id` joins the **existing freeze**. Verified: `ask_threads_freeze()` behind the
`ask_threads_no_repoint` trigger already refuses changes to ownership, anchor, reading reference
and canonical baseline. Adding this column to it yields:

```
thread opens unbound   → unbound forever
thread opens bound C   → bound to C forever
```

⛔ **No "attach this old conversation to the chain" later.** That would manufacture history — a
conversation would acquire a subject it was not about when it was spoken.

- **Existing rows stay `NULL`. ⛔ No backfill.** A historical thread's absent relationship IS the
  evidence that it predates the editorial object, exactly as a pre-`BUILD-07E` reading's missing
  discriminant is the evidence of its contract.
- **Many threads per chain stay lawful. ⛔ No unique constraint on `proposal_chain_id`.**
- ⭐ **`DiscourseBinding.boundAt` = `ask_threads.opened_at`.** ⛔ Do NOT add a second `bound_at`
  column saying the same thing: the relationship is established only at open, so a separate
  timestamp could only ever agree or lie.
- **Chain-side FK action: `RESTRICT` / `NO ACTION`.** ⛔ Never `CASCADE`, never `SET NULL`.
  `SET NULL` is the quiet one to refuse — it would silently unbind a live conversation and leave
  it looking like a thread that was never about the chain.
- Deleting the thread deletes its turns (existing cascade) and removes the relationship
  **naturally, because the relationship lives on the thread**. ⛔ Nothing reaches the chain.

---

## 2. Insight and Direction — two physically distinct subjects

⛔ **NO `editorial_events(kind, body, …)` AND NO ONE-TABLE POLYMORPHISM.** A shared table would
put the distinctions this programme just earned back behind CHECK constraints and optional
columns — *the collapse, re-encoded as convenience.*

```
proposal_chain_insights                  proposal_chain_directions
  id                                       id
  member_id                                member_id
  proposal_chain_id                        proposal_chain_id
  author      CHECK (author = 'maia')      author  CHECK (author IN ('maia','member'))
  observation                              instruction
  authored_at                              refers_to_version_id  NULL
                                           authored_at
```

⭐ **Authorship is persisted explicitly, with NO DEFAULT on either table.** ⛔ The database must
not assign MAIA's name merely because an insert reached the Insight table — a default would mean
a row could be authored by nobody and still carry her name.

Both prove chain ownership through the established
`(member_id, proposal_chain_id) → proposal_chains(member_id, id)`.

### 2.1 Insight — the absence is the feature

⛔ **NO VERSION FOREIGN KEY, and that absence is load-bearing:**

```
chain
  └── Insight
versions = zero            ⭐ lawful
```

⭐ That is precisely how *"I noticed this, and I would leave it"* exists **without manufacturing
a Suggestion.** ⭐ And it needs no change to succession law: `validateChain` returns `yes` at
zero versions, verified in the W5-0 census.

`observation` is non-empty authored text. ⛔ No `replacement_text`, `operation`, `expected_text`,
range, authorization id or execution field — any one of them would make an Insight a Suggestion
wearing another name.

### 2.2 Direction — a reference that cannot leave the subject

`refers_to_version_id` is optional. ⭐ When present, **the database proves the referenced version
belongs to THIS chain**:

```
(proposal_chain_id, refers_to_version_id) → proposal_versions (chain_id, id)
```

⭐ `proposal_versions` **already carries `UNIQUE (chain_id, id)`** (`20260914000001`), so this FK
target exists today and needs nothing added.

```
Direction on chain C → refers to C/v1     ⭐ lawful
Direction on chain C → refers to D/v7     ⛔ UNREPRESENTABLE
```

⛔ And still: **`refers_to_version_id` ≠ `supersedes`.** There is **no succession column on
Direction** and there must never be one. ⛔ No `answered_at`, `spent`, `status`, `resolved_at`,
`satisfied_by` — W4 has not earned an answer relationship.

---

## 3. ⭐⭐ LIFECYCLE RULING — append, never rewrite

**Insight and Direction are authored editorial records. Ordinary lifecycle may APPEND them; it
may not REWRITE or DELETE them.** The schema act specifies **database-enforced UPDATE and DELETE
refusal** on both, in the manner `ask_turns_append_only()` already demonstrates.

```
Insight           authored MAIA observation      append-only
Direction         authored steering act          append-only
ProposalVersion   authored formulation           append-only
────────────────────────────────────────────────────────────
Discourse         a conversation                 ⭐ withdrawable, already ruled
```

⭐ **Corrections are new records.** ⛔ And this is *different from* Discourse, whose whole-thread
withdrawal is expressly lawful — the asymmetry is the ruling, not an oversight.

⛔ **Constitutional erasure, if it ever applies, is a SEPARATE AUTHORITY with an explicit
deletion order. It must not be smuggled in as `ON DELETE CASCADE`** — a cascade is ordinary
lifecycle wearing the costume of a sovereign act.

---

## 4. ⛔ NO CROSS-OBJECT CHRONOLOGY IS INVENTED

The schema act adds **none** of:

```
event_index · editorial_sequence · global_turn_number · current_direction · current_insight
```

⛔ **There is no ruled global event stream** across Insight, Direction, discourse turns and
versions. Each object keeps its own structural law:

```
ProposalVersion   succession via `supersedes`
ask_turn          order via `turn_index`
Insight           an authored record
Direction         an authored record + an optional reference
```

⭐ `authored_at` is **provenance and presentation metadata. ⛔ It is not a new ordering
authority** — the same discipline that keeps `lineage()` structural rather than chronological.

If W4 needs a precise answer/reply relationship across objects, **W4 earns it.**

---

## 5. The schema matrix — future database obligations, stated now

```
S1  existing ask_thread, proposal_chain_id NULL        → lawful (MATCH SIMPLE, §1.1)
S2  thread M/Work X + chain M/X                        → admitted
S3  thread M/Work X + chain M/Y                        → ⛔ DATABASE refuses
S4  thread M + chain owned by N                        → ⛔ DATABASE refuses
S5  proposal_chain_id changed after open               → ⛔ DATABASE refuses (freeze)
S6  thread deleted → turns gone · chain, versions, authorizations REMAIN

I1  zero-version chain + Insight                       → lawful
I2  Insight author other than 'maia'                   → ⛔ DATABASE refuses
I3  Insight UPDATE or DELETE                           → ⛔ DATABASE refuses

D1  Direction authored by member or MAIA               → lawful
D2  Direction refers to a version in the same chain    → lawful
D3  Direction refers to a version in another chain     → ⛔ DATABASE refuses
D4  Direction with no reference                        → lawful
D5  Direction UPDATE or DELETE                         → ⛔ DATABASE refuses

A1  none of the new objects carries candidate-wording fields
A2  none has any relationship to revision authorization
A3  `authorizeVersion` is unchanged
```

⭐ **And the anti-collapse structural check, inspectable FROM THE SCHEMA rather than from
comments:**

> Among `proposal_chain_insights`, `proposal_chain_directions`, `ask_turns` and
> `proposal_versions`, **only `proposal_versions` carries a formulation column.**

⛔ A catalogue query must be able to establish that. A comment asserting it is not evidence — the
whole programme's rule about prose and enforcement.

---

## 6. ⛔ WHAT W5-2 DELIBERATELY LEAVES OPEN

**How an Insight or a Direction relates to an exact `ask_turn` is NOT decided.**

⛔ The schema act must not pre-build `produced_in_turn`, `answered_by_turn`, `direction_turn_id`
or `insight_turn_id` merely because the revision-offer substrate has an exact-turn relation.
⭐ **W4 is where MAIA actually speaks inside this object**, and it may establish that a Direction
spoken in discourse and a typed Direction record have an exact provenance relationship — or find
a better shape. Building it now would be **designing W4 before W4 has a contract.**

---

## 7. Branch custody

⭐ This record stays on `claude/w5-ontology-census`. The executable schema act starts on a
**fresh** branch (e.g. `claude/w5-editorial-ontology-schema`) — ⛔ because **adding migration
files changes the pending migration set merely by being merged**, which is the 2026-09-07
branch-gate defect and is controlling here.

⛔ **Acceptance of this design authorizes no merge, no deployment and no execution.**

**Held:** W5-3 schema implementation · schema merge · migration execution · W4 · W6 · W7.
**Production UNTOUCHED. `maia_focus_witness` FROZEN.**
