# LANE B · B3 — future-safe schema and its falsifier

**Class A, test-first.** Authored and exercised **only against a disposable
PostgreSQL 16 cluster**, built by applying the real
`database/baseline/0001_baseline_2026-09-01.sql` (702 tables, 0 errors) and then
the new migration. ⛔ **No production contact. The cluster was destroyed.**

```text
9 obligations · 9 PASS · 0 FAIL      fixtures ROLLED BACK
B1 guards      both still standing   containment suite 10/10
```

---

## 1 · ⭐ WHAT TEST-FIRST FOUND BEFORE THE MIGRATION EXISTED

**Two facts the earlier census got wrong, both found by reading the real schema
into a real database rather than by reasoning about it.**

### 1.1 Seven references, not five

```text
maia_engine_comparisons  CASCADE      maia_voice_feedback  CASCADE
maia_misattunements      CASCADE      maia_voice_turns     CASCADE
maia_turn_feedback       CASCADE
deliberations            SET NULL
expansion_events         ⛔ NO ACTION
```

### 1.2 🔴 Deletion was not merely uncovered — it was BLOCKED

`expansion_events.turn_id` referenced `maia_turns` with **NO ACTION**. Deleting a
referenced turn would have **raised a foreign-key violation**, so an account
deletion touching such a member would have *errored* rather than silently
skipping.

⭐ **A deletion that cannot run is worse than one that is merely absent: the
absent one is a known gap, and the blocked one looks like a bug in whatever ran
last.**

`turn_id` is nullable and `expansion_events` carries **its own `member_id`** — so
it has its own deletion obligation and must be **unlinked, never destroyed by
another table's deletion**. The migration sets that FK to **`SET NULL`**, not
`CASCADE`.

⭐ **And `expansion_events.member_id UUID` is a precedent**: the column shape B2
designed already exists elsewhere in this schema. B3 follows convention rather
than inventing one.

## 2 · The migration — `20260909000001_maia_turns_member_identity.sql`

```text
member_id UUID          NULLABLE · FK → members(id) ON DELETE CASCADE
insert gate             a trigger refuses a NEW row with NULL member_id
expansion_events FK     NO ACTION → SET NULL   (unlink, don't destroy)
s5_refuse_tombstoned    attached to maia_turns
index                   on member_id
```

### 2.1 Amendment 1 — the two populations coexist honestly

⛔ **The column is NULLABLE and there is no table-wide `NOT NULL`.** A table-wide
constraint could only be satisfied by failing on historical rows or by
backfilling attribution nobody earned. Historical NULLs remain representable and
**unattributed**; promotion to `NOT NULL` is possible only after the historical
adjudication, never as a side effect of this migration.

### 2.2 Amendment 2 — the database claims only what it can prove

```text
DATABASE   refuses missing identity · enforces referential integrity
           enforces deletion and tombstone law
SERVER     derives member identity from the verified session
           never trusts a body-supplied id
```

⛔ The migration says in terms that it **does NOT prove the supplied id came from
the authenticated actor** — this connection carries no actor context a trigger
could inspect. An assertion in the containment suite holds that wording, so the
claim cannot drift upward later.

### 2.3 ⚠️ FOR RATIFICATION — this is stricter than `conversation_turns`

`conversation_turns.user_id` is **TEXT with no FK**, so it admits non-member
identities (explorer / anonymous). A UUID FK on `maia_turns` **refuses them** —
meaning such turns could not be copied into the training derivative at all.

⭐ **That is a narrowing of what may be DERIVED, not only of what may be
DELETED.** It is arguably correct for a training table, and it is named here
rather than smuggled in. ⛔ Founder's call.

## 3 · The falsifier — `scripts/witness/maia-turns-custody-falsifier.sql`

| Obligation | Result |
|---|---|
| 1 historical NULL ownership representable, no attribution invented | **PASS** |
| 2 a new row without member identity is rejected by the database | **PASS** |
| 3 a new row with invalid member identity is rejected | **PASS** |
| 4 zero `maia_turns` rows remain for A after deletion | **PASS** |
| 4 every cascading child family empty for A | **PASS** |
| 4 `expansion_events` **unlinked, not destroyed** | **PASS** |
| 5 member B untouched | **PASS** |
| 6 absence is the evidence — the text itself is gone | **PASS** |
| 7 a tombstoned row cannot be restored | **PASS** |

Obligation 7 is witnessed by the trigger's own log line:

```text
WARNING: [PROVENANCE] restore refused — reason=tombstone table=maia_turns
         id_prefix=9003 manifest=348193b9… txid=5370
```

⭐ **Obligation 6 is asserted as the founder framed it**: not that a `DELETE`
ran, but that **no row containing the member's words remains**. The check
searches the text, not the foreign key.

⛔ **Obligation 8 — neither B1 guard is removed.** Both still stand, asserted in
the containment suite, which now also holds the falsifier itself to being
rollback-only and disposable-only, so its necessary exemption cannot become a way
in.

## 4 · How account deletion reaches it now

`app/api/members/delete-account:260` deletes the `members` row, and the new FK
cascades. Deletion is therefore **structural** rather than dependent on an
application remembering this table.

⚠️ **A legibility gap, recorded not fixed:** the route's 44-table governed list
still does not *name* `maia_turns`, so an auditor reading the route will not see
it. The mechanism is sound; the record of it is implicit.

## 5 · Standing

```text
B1 containment      ✅ standing · 10/10
B2 design           ✅ ratified, both amendments implemented
B3 schema+falsifier ✅ 9/9 on a disposable cluster · fixtures rolled back
B4 occupancy        ⛔ NOT WITNESSED — no production contact
B5 remediation      ⛔ NOT BEGUN

migration           AUTHORED · ⛔ NOT DEPLOYED · ⛔ NOT AUTHORIZED FOR PRODUCTION
historical rows     still unattributed, deliberately
UUID-FK narrowing   ⚠️ awaiting ratification
#1275               frozen @ 18d8c7004
Focus disclosure    ⛔ NOT AUTHORIZED
production          ⛔ NO CONTACT
```

---

*Deletion that cannot run is not a gap. It is a trap — and the only reason we
know it was there is that the test was written before the schema.*
