# B5-M1 · ANTI-RESURRECTION CENSUS

**Class A · READ-ONLY.** Source census on canonical. ⛔ No code change, no
migration, no production contact, no attribution, no content read or hashed.

**The question:** can the existing deletion-manifest / restore substrate satisfy
**R6** for the historical population **without** depending on B3's identity
machinery?

## ⭐ ANSWER: YES — for the governed restore path. Do NOT split B3.

---

## Q1 · What `s5_refuse_tombstoned()` actually matches

Two durable objects, either of which refuses a reinsertion:

```text
provenance_tombstones      object_kind = <table>  AND  object_id = NEW.id::text
deletion_manifest_scopes   table_name  = <table>
                           AND (session_id IS NULL OR = NEW.session_id)
                           AND window_start/window_end contain NEW.created_at
                           AND (session_id IS NOT NULL OR window_start IS NOT NULL)
```

It reads `to_jsonb(NEW)` for `id`, `session_id`, `created_at`. ⭐ **`maia_turns`
has all three**, so both arms resolve against it.

## Q2 · 🔴 Who creates the obligation — NOBODY, AUTOMATICALLY

```text
writers of provenance_tombstones / deletion_manifests / deletion_manifest_scopes
  database/migrations/20260718000001_s5_provenance_substrate.sql   ← the original
                                                                    incident's own seed
  scripts/witness/maia-turns-custody-falsifier.sql                 ← a test fixture
```

⛔ **Deleting rows creates NO obligation.** There is no trigger, no hook, no
application path that mints a manifest on delete.

⭐ **So remediation must write the manifest and scope DELIBERATELY, as a named
step of the act — not as a byproduct of it.** A remediation that deleted and
assumed protection would leave the corpus restorable.

## Q3 · Can a scope describe these rows without inventing ownership? — YES

```sql
CHECK (session_id IS NOT NULL OR member_id IS NOT NULL OR window_start IS NOT NULL)
```

A **table + time-window** scope satisfies the CHECK on `window_start` alone, and
satisfies both the trigger's predicate and the sweep's. **No member attribution,
no session join, no content, no hashes.**

⚠️ **ONE CONSTRAINT, AND IT IS EASY TO GET WRONG.** `window_end` **must be set to
the moment of deletion.** An open-ended scope (`window_end IS NULL`) matches
every row with `created_at >= window_start` — **forever** — so it would refuse and
sweep every *future* legitimate `maia_turns` row as well. ⛔ **The scope must
close behind the historical population, not in front of the table.**

## Q4 · What restore actually does — R6a answered

`scripts/restore-governed.sh` is **THE** restore path; its own header states a
raw `psql`/`pg_restore` of a dump is *"an ungoverned operation and is refused by
policy (R20)"*.

```text
1  PRESERVES manifests / scopes / tombstones across the restore
2  restores the dump   --data-only --column-inserts  → ORDINARY INSERTS, triggers fire
3  RE-APPLIES the preserved manifests / scopes / tombstones
4  SWEEPS restored rows that are tombstoned or fall inside a scope
5  reports counts only
```

⭐⭐ **THE SWEEP IS FULLY GENERIC — no fixed table list.**

```text
FOR ts IN SELECT DISTINCT object_kind FROM provenance_tombstones LOOP
  EXECUTE format('DELETE FROM %I t USING provenance_tombstones p …')

FOR scope IN SELECT * FROM deletion_manifest_scopes LOOP
  EXECUTE format('DELETE FROM %I WHERE … session_id … created_at …')
```

**So `maia_turns` is covered the moment a scope names it — with no code change,
no trigger attachment, and no B3 dependency.** The sweep's predicate needs the
target table to have `session_id` and `created_at`; `maia_turns` has both.

⛔ **No `--disable-triggers`, no `session_replication_role`, no `DISABLE TRIGGER`
anywhere in any backup or restore script.** The bypass R6a was written to catch
does not exist in the tree.

### Q4.1 ⚠️ Where the protection is POLICY, not mechanism

A raw `psql < dump.sql` is *refused by policy*, not by machinery. On that
ungoverned path the sweep never runs, and the **only** defence is the in-database
trigger — **which is not attached to `maia_turns` today.**

```text
governed restore    protected by the sweep          ✅ no change needed
ungoverned restore  protected only by the trigger   ⛔ not attached to maia_turns
```

⭐ **This is the honest boundary of the YES.** It inverts the founder's concern in
a useful way: *"the trigger exists"* was rightly not enough — and here the sweep
is enough for the governed path, while the trigger is precisely what would cover
the path policy merely forbids.

## Q5 · Minimum pre-delete schema change

```text
REQUIRED   expansion_events → maia_turns    NO ACTION → ON DELETE SET NULL
           (without it the delete raises a foreign-key violation)

NOT REQUIRED for R6 on the governed path
           attaching s5_refuse_tombstoned to maia_turns

OPTIONAL, and the only thing that would close Q4.1
           attaching that trigger — a one-statement addition, independent of
           member_id, the identity gate, the FK and the index
```

⛔ **`member_id`, its FK, its index and the insert-time identity gate are NOT
needed for remediation** and stay behind B5 completion, exactly as ruled.

## Q6 · What disappears with the parent population

Verified against the real schema in a disposable cluster:

```text
maia_engine_comparisons   CASCADE
maia_misattunements       CASCADE
maia_turn_feedback        CASCADE
maia_voice_feedback       CASCADE
maia_voice_turns          CASCADE
deliberations.turn_id     SET NULL     (row survives, link cleared)
expansion_events.turn_id  NO ACTION → to become SET NULL  (row survives)
```

Evidence is **count-only**, before and after, per family. ⛔ No content
inspection, no sampling, no identifiers.

---

## DECISION LAW — applied

```text
IF the existing manifest substrate can prove R6
AND actual restore paths are governed by it
  → do NOT split B3                                          ✅ APPLIES
  → B5 pre-delete infrastructure = only what is missing
      → the expansion_events FK repair                        ✅ that, and only that
  → qualify remediation on disposable fixtures
  → only then touch production
```

⛔ **One qualification carried forward, not waved away:** the YES holds for the
*governed* restore path. Whether the founder wants Q4.1 closed as well — by
attaching the trigger — is a separate, one-statement decision, and it is **not
taken here**.

## Standing

```text
B4              ✅ AUTHORITATIVE · 174,662 · 860
B5 values       ✅ DELETE
B5-M1 census    ✅ COMPLETE — do not split B3
B5 mechanics    ⛔ NOT DESIGNED — next act, on disposable fixtures
B5 mutation     ⛔ NOT AUTHORIZED
B3 production   ⛔ BLOCKED
Focus           ⛔ OUTRANKED
#1275           frozen @ 18d8c7004
```

---

*The restore machinery was asked which repair it needed. It answered: one foreign
key — and it already knew how to forget the rest.*
