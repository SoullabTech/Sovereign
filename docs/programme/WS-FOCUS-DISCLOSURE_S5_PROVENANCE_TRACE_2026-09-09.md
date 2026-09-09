# LANE A · S5 PROVENANCE-CONSUMER TRACE

**Read-only.** Canonical `5b133abcd`. No code change, no model call, no member
text, no production contact. ⛔ **No receipt is proposed.**

**The question, as narrowed by the founder:** not *"does any `conversation_turns`
query select provenance?"* — the matrix answered that — but *once S5 provenance is
minted or read, where can that JSON travel?*

---

## 1 · The producer, and its blast radius

```text
TurnsStore.ts:18   mintTurnProvenance()   ⛔ module-local, NOT exported
                   → Provenance.mint(posture, {…}, 'TurnsStore')
                   → provenance.toJson()  → SQL bind
```

⭐ **The `Provenance` class has exactly one non-test importer in the entire tree:
`TurnsStore`.** Four other modules import from `lib/provenance/` — `maiaOrchestrator`,
`maia/translate`, `voice/persist`, `conversation/turns` — and **every one of them
imports `recordConsentState` from `consentState.ts`, not `Provenance`.** The
minted object is constructed and serialized inside one function and never
returned to a caller.

`provenanceJson()` is exported from `lib/provenance/provenance.ts` and has **zero
callers**.

## 2 · Readers — there ARE two, and neither is a carrier

⛔ **No SQL anywhere in the tree selects the `provenance` column.** The only
`SELECT … provenance` match is a comment in an unrelated migration about
`member_memory_atoms`.

The real readers are in the database, at write time:

| Reader | Reads | Emits | Carries onward? |
|---|---|---|---|
| `s5_require_minted_provenance()` | `NEW.provenance` — presence of six constitutional keys | accept / hard-fail | ⛔ no |
| `s5_refuse_tombstoned()` | `to_jsonb(NEW)` → `id`, `session_id`, `created_at` | accept / `RETURN NULL` + a WARNING | ⛔ no |

⭐ **The second one is the founder's transitive mechanism, found in the wild.**
`to_jsonb(NEW)` **is** a whole-row serialization — exactly the pattern that
defeats a column-by-column assumption. It is safe here for a reason that must be
stated rather than assumed: it extracts **three scalars into local variables**,
and its log line is content-free by construction (`manifest`, table,
`left(row_id, 12)`, txid, timestamp). ⛔ **It is safe by what it does with the
serialization, not by not having made one.**

## 3 · The constraint a receipt would inherit

The mint gate refuses any `conversation_turns` INSERT whose provenance lacks
`createdBy`, `generatedBy`, `postureAtCreation`, `sourceContainer`, `source`,
`persistencePolicy`. ⭐ **A receipt placed in `provenance` must be additive to
that object and may not disturb those six keys** — the column is not free space,
it is a constitutional object with a database-enforced shape.

## 4 · VERDICT

```text
PROVENANCE CONTAINMENT — application tier

CLEARED   for onward carriage among all traced consumers:
          one non-test importer · zero callers of the JSON helper ·
          zero SQL readers · two DB readers, both write-time validators
          that carry nothing to another tier
```

⚠️ **Two boundaries this verdict does NOT cover, named rather than implied:**

1. **Backup and restore.** `pg_dump` carries every column regardless of what
   application code selects. That tier is not ungoverned — the tombstone and
   `deletion_manifest_scopes` machinery exists precisely to refuse resurrection
   on restore — but it is a different tier from the one traced here.
2. **`meta`, not `provenance`.** A receipt in `meta` would land where
   `meaningTraceDigest` already sweeps. That column is **NOT cleared** and the
   distinction must not blur.

⛔ **Cleared containment is not authorization.** It removes one objection to a
receipt in `provenance`; it does not settle the receipt's shape, and it does not
settle whether a new disclosure path may open at all — which, per the founder's
ordering, waits on Lane B.
