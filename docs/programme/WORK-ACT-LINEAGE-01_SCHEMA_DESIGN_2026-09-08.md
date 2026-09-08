# WORK-ACT-LINEAGE-01 — SCHEMA DESIGN (for ratification)

```
STATUS        SCHEMA DESIGN · brought back for founder ratification
MIGRATION     NOT AUTHORIZED
BUILD         NOT AUTHORIZED
MERGE/DEPLOY  HOLD
```

Date: 2026-09-08 · Under **RW-B1..B4 · RW-C1..C6**.
Predecessors: `REMOVE-WORK-METADATA-01_DISCOVER_2026-09-08.md` ·
`WORK-ACT-LINEAGE-01_DESIGN_2026-09-08.md`.

> **A history is immutable while the system is authorized to remember it.
> Erasure withdraws that authority.**

> **Act-time context may be retained only to the degree necessary to account
> for the act; a history ledger must not become an alternate store of the Work.**

---

## 1. The shape, and why not the alternatives

**One table, explicitly enumerated narrow columns, no generic bucket.**

⛔ Rejected: `detail TEXT · note TEXT · metadata JSONB`. The founder's law
names the failure directly — a generic bucket becomes a convenient place to
copy manuscript prose, and nothing in the schema can then say which rows hold
member content. Erasure ownership must be legible **per column**, which a
JSONB blob cannot be.

⛔ Rejected: one table per act kind. C's core requirement is a single ordered
account of acts; six tables would rebuild the `UNION ALL` that produced the
current defect, and each new act kind would need a new table before it could
be recorded.

✅ Chosen: one table, every column named and classified, and a **per-kind
population contract enforced by CHECK constraints** so a kind cannot quietly
acquire a field it has no license to carry.

---

## 2. Table

```sql
member_studio_acts
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
  member_id         UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT
  kind              TEXT NOT NULL          -- closed vocabulary, CHECK-enforced
  occurred_at       TIMESTAMPTZ NOT NULL   -- act time, supplied by the act
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT now()

  -- REFERENCES — identifiers, never relationships. ⛔ NO FK to living_works.
  work_ref          UUID
  manuscript_ref    UUID
  expression_kind   TEXT                   -- 'manuscript' | 'material' | …

  -- ACT-TIME SNAPSHOTS — ⚠️ MEMBER CONTENT. See §4.
  work_name_at_act        TEXT
  manuscript_name_at_act  TEXT
  heading_at_act          TEXT
  member_note             TEXT

  -- INERT PARTICULARS — not content.
  revision_number   INTEGER
```

`member_id` keeps `ON DELETE RESTRICT` — a member's departure is its own
ontology and must not silently shred history as a side effect.

⛔ `occurred_at` is supplied by the act, not defaulted to `now()`. `recorded_at`
is separate so a later-recorded act cannot misrepresent when it happened. The
two are distinct axes, consistent with the temporal-memory direction
(`occurred_at` vs transaction time).

---

## 3. Kind vocabulary and the population contract

```
KIND                   REQUIRED                    PERMITTED SNAPSHOT
work_begun             work_ref                    —
work_named             work_ref                    work_name_at_act
work_renamed           work_ref                    work_name_at_act
work_removed           work_ref                    work_name_at_act
expression_declared    work_ref, manuscript_ref,   work_name_at_act
                       expression_kind
expression_withdrawn   work_ref, manuscript_ref,   work_name_at_act
                       expression_kind
material_declared      work_ref, expression_kind   work_name_at_act, member_note
```

⛔ **Columns not listed for a kind must be NULL, by CHECK.** A `work_begun` row
cannot carry a heading. This is the structural form of *"minimum context
only"* — it is not left to the caller's discipline.

⭐ `work_begun` carries **no name**, because at creation there may be none
(D-16: naming is a separate act, possibly later). `work_named` is the act that
records it. This keeps the ledger honest about a Work begun unnamed.

### The three surviving acts stay where they are

`writing_arrived` · `version_kept` · `line_marked` are **not** migrated into
this ledger. Their own tables are append-only and survive removal; duplicating
them would create a second store — and, under §4, a second copy of member
prose (`heading`, `note`) to keep erasable. `heading_at_act` and
`member_note` are therefore reserved in §2 but **populated by no kind in this
design**; they exist because §5's open question may require them, and they are
classified now so the decision cannot smuggle content in later unclassified.

⚠️ **The RW-C2 defect on those three is not fixed by this table.** Their Work
title still comes from the `work_of` live join. §5.

---

## 4. Erasure classification — per column, structural

```
COLUMN                    CLASS              ERASURE REACH
member_id                 identifier         member ontology (out of scope)
kind, occurred_at,
recorded_at, revision_number, expression_kind
                          inert metadata     not content
work_ref, manuscript_ref  identifier         not content (opaque UUID)

work_name_at_act          ⚠️ MEMBER CONTENT   erasable
manuscript_name_at_act    ⚠️ MEMBER CONTENT   erasable
heading_at_act            ⚠️ MEMBER CONTENT   erasable
member_note               ⚠️ MEMBER CONTENT   erasable
```

A Work name is prose the member typed. It is not event metadata that happens
to be a string. Classifying it as content from day one is what stops the ledger
becoming a shadow vault.

⛔ **Erasure deletes rows, not columns.** Nulling the snapshots would leave a
content-free husk asserting *"an act occurred here"* — a tombstone, which the
founder ruled out for this ledger. If Soullab later needs an operational
receipt (`erasure completed at T`), that is a different audit ontology with its
own authority and must not be smuggled in here.

### ⭐ Erasure scope — and the multi-expression edge

Erasure is authorized for a **manuscript**, so the primary scope is
`manuscript_ref = X`. Work-scoped acts (`work_begun`, `work_named`,
`work_renamed`, `work_removed`) carry no `manuscript_ref` and are reached
through the ledger's own `expression_declared` rows.

⛔ **A Work-scoped act may be erased only when the manuscript being erased is
the last expression that Work ever carried.** Otherwise deleting one manuscript
would erase *"Began My Sacred Book"* while a second manuscript of that Work
still exists and still needs its history. The predicate is answerable inside
the ledger:

```
erase work-scoped acts for W  ⟺  no expression_declared row for W
                                  names a manuscript other than X
```

---

## 5. RW-C2 for the three surviving acts — OPEN, one recommendation

Their Work title is resolved by the `work_of` live join and blanks on removal.
Two lawful repairs:

- **(a) resolve from the ledger** at read time by `(manuscript_ref,
  occurred_at)` — the most recent `work_name_at_act` at or before the act.
  One source of truth; no new content copies; costs a lateral join.
- **(b) denormalize a title column onto each of the three tables** — simpler
  query, but creates three more copies of member prose to classify and erase.

⭐ **Recommend (a)**, on the §4 law: it adds no member content anywhere. It
also makes those acts *forward-only* in the same way as the ledger — pre-ledger
acts resolve to nothing, which under RW-C6 is the honest answer rather than a
fabricated one.

---

## 6. Append-only, with a bounded erasure path

```
ORDINARY OPERATION      INSERT only · UPDATE forbidden · DELETE forbidden
AUTHORIZED ERASURE      DELETE permitted, only through the bounded path
```

A trigger that makes deletion physically impossible would itself violate
WS-DELETE-01. So the trigger must carry its own narrow exception:

```sql
-- UPDATE: refused unconditionally. There is no lawful update to an act.
-- DELETE: refused unless the erasure path has declared its scope for this
--         transaction, and the row falls inside that declared scope.
--   erasure declares:  SET LOCAL app.erasure_manuscript = '<uuid>'
--   trigger permits a delete only when that setting is present AND the row
--   is in scope by §4 (manuscript_ref matches, or the work-scoped predicate
--   holds for that manuscript)
```

The setting is `LOCAL` — transaction-scoped, so authority cannot leak past the
erasure transaction. ⛔ The trigger must not accept a bare "erasure mode" flag
with no scope: an unscoped exception is not an exception, it is a hole.

⚠️ **Ordering obligation for the eventual implementation:** the erasure path
must delete ledger rows **inside the same transaction** as the manuscript
erasure it is authorized by. A separate sweep would leave a window in which
*"nothing is kept"* is false.

---

## 7. B projection (derived, never stored)

For a manuscript with `member_manuscripts.title IS NULL` **and no current
Work**:

```
most recent  expression_declared(manuscript_ref = M)
             for a work W that has a later work_removed(W)
      →      that row's work_name_at_act
```

```
b-rule 1   never consulted when member_manuscripts.title IS NOT NULL   (RW-B4)
b-rule 2   never consulted while the manuscript is in a current Work
b-rule 3   no act found → NO lineage shown · never invented              (b5)
b-rule 4   the surface marks it as prior context, never as the title     (RW-B3)
b-rule 5   nothing is written to member_manuscripts by this projection   (RW-B1)
```

⛔ The projection reads the ledger and writes nothing. It is a display
derivation, not a stored conclusion.

---

## 8. C projection

`work_begun` · `expression_declared` · `material_declared` come from the
ledger, not from `living_works`/`living_work_*`. `work_removed` becomes visible
for the first time (RW-C3). Work titles come from `work_name_at_act`, never a
join (RW-C2). No surface derives current existence from an act (RW-C4).

⚠️ **Cutover is not free and is not designed here.** Until the ledger has
history, switching those three act kinds to read from it would make existing
history *vanish* — the RW-C1 violation, caused by the fix. Under RW-C6 the
gap cannot be backfilled from current rows. **Open: whether C reads the union
of ledger and legacy sources during a transition, and how that union avoids
double-counting.** This is the largest remaining unknown and should be settled
before the migration.

---

## 9. Acceptance contracts (separate, per ruling)

```
B — RECOGNITION
b1  manuscript retained after Work removal is member-recognizable
b2  member_manuscripts.title UNCHANGED across removal (still NULL)
b3  surface marks the name as prior context, never as the title
b4  a member title act sets the title and it takes primacy thereafter
b5  a manuscript never carried by a Work shows no lineage, no invention
b6  ⭐ subject must be a Work removed AFTER the ledger exists (RW-C6)

C — HISTORICAL INTEGRITY
c1  every act visible before removal is still visible after it
c2  each act's work title is the title AS AT the act, across a rename
c3  "removed the Work" appears as its own act
c4  no surface derives current existence from a historical act
c5  history is unchanged by a rename of anything

E — ERASURE (RW-C5)
e1  Delete Work and writing leaves NO ledger row naming that manuscript
e2  no content-bearing tombstone survives
e3  a Work with a second surviving manuscript KEEPS its work-scoped acts
e4  UPDATE on the ledger is refused unconditionally
e5  DELETE outside a declared erasure scope is refused
e6  erasure and ledger deletion are one transaction
```

⛔ B, C and E each need falsifiers capable of failing while the others pass.

---

## 10. For ratification / still open

```
RATIFY?   table shape · kind vocabulary · population CHECKs
RATIFY?   erasure classification per column (§4)
RATIFY?   work-scoped erasure predicate — last-expression rule (§4)
RATIFY?   §5 recommendation (a) resolve-from-ledger
RATIFY?   §6 scoped-DELETE trigger design

OPEN      §8 cutover — ledger/legacy union without double-count or vanish
OPEN      migration-time baseline (current_state_observed_at_migration),
          if wanted later — explicitly NOT historical reconstruction
SEPARATE  Finding A ("No writing yet")
NOT AUTHORIZED   migration · build · merge · deploy
```
