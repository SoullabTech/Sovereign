# LANE B · B5 — FOUNDER RULING: DELETE THE HISTORICAL POPULATION

**Ruled 2026-09-09, on the authoritative B4 witness (174,662 rows · 860 distinct
sessions).** ⛔ No code, no migration, no production contact in this document.

---

## 1 · ⭐ THE WORD, CORRECTED FIRST

```text
NOT   unowned records
YES   unattributable records
```

⭐ **They almost certainly belong to real people. The system lost the evidence of
which person owns which row.** "Unowned" would be an excuse dressed as a fact,
and it would make retention sound easier to justify. The truth runs the other
way: **not knowing whose words these are makes keeping them harder to defend, not
easier.**

## 2 · The ruling

```text
historical population      DELETE
ownership inference        ⛔ FORBIDDEN
learning salvage           ⛔ FORBIDDEN
content backup retained    ⛔ NO
non-content audit record   ✅ YES
future-safe B3 schema      deploy only AFTER remediation is qualified
```

### 2.1 The reasoning, as ruled

```text
the text came from members
the copy was derivative, not the authoritative conversation
its learning value is secondary
member identity was not preserved
individual deletion rights therefore cannot be honored
continued retention preserves the BENEFIT for the system
while preserving the RISK for the member
```

⭐ **That distribution is upside-down relative to everything MAIA is built
around.** *If the system cannot fulfil the obligations attached to possessing a
copy, the copy has not earned continued custody.*

⛔ **Not retained because it may be useful.** Usefulness was never the test.

## 3 · What is preserved — the history, not the content

Delete the content; keep the record that this happened.

```text
historical maia_turns population
174,662 rows
860 distinct session identifiers
member attribution unavailable
creation path contained
historical corpus destroyed on <date>
future identity/deletion controls installed
```

⛔ **No text. No session identifiers. No hashes of member text. No reconstructed
ownership map.** The institutional lesson needs none of them, and each would
re-create in the audit record the exact exposure the deletion exists to remove.

## 4 · ⚠️ What the deletion design must still answer — NOT decided here

The values question is settled. The mechanics are not, and three obstacles are
already known from the earlier censuses.

### 4.1 The delete would ERROR today

`expansion_events → maia_turns` is **NO ACTION** in production, confirmed live by
B4's own drift check. A `DELETE` of any referenced row **raises a foreign-key
violation**. So remediation cannot begin with the delete.

### 4.2 ⭐⭐ THE ORDERING PROBLEM THIS RULING EXPOSES

The anti-resurrection mechanism and the deletion are currently in the same
migration, and the ruling puts them on opposite sides of a gate:

```text
the tombstone trigger on maia_turns   ships in the B3 migration
B3 deploy                             ruled: only AFTER remediation is qualified
a deletion without tombstones         can be undone by any restore
```

⛔ **Delete first and the corpus can quietly return from a backup. Deploy B3
first and we have deployed ahead of the ruling.**

Two candidate resolutions, **neither chosen here**:

```text
(a) SPLIT the migration — the FK repair and tombstone attachment deploy as
    REMEDIATION infrastructure; the identity gate follows later, after
    remediation is qualified. The gate is what B3 is really about; the
    protections are not.

(b) USE the existing manifest substrate — deletion_manifest_scopes can scope a
    window without the per-row tombstone trigger, if it covers this table.
    ⛔ Whether it does is UNVERIFIED and must be traced before being relied on.
```

⭐ **This is a real finding, not a formality: the deletion's safety depends on
machinery that today rides along with the thing the ruling holds back.**

### 4.3 The cascade must be counted, not assumed

Deleting 174,662 rows cascades into five child families and sets
`deliberations.turn_id` null. Those children are derivative-of-derivative and
their removal is correct — but the remediation must **count what it destroyed**
and record those counts in the audit row, rather than discovering the blast
radius afterwards.

## 5 · Falsifiers the remediation must pass — before production

```text
R1  after remediation, ZERO rows remain in maia_turns
R2  proven by post-delete ABSENCE, never by a DELETE statement having run
R3  no ownership was inferred — no session_id join anywhere in the act
R4  no content backup, export, dump or salvage copy was produced
R5  the audit record contains no text, no session identifier, no hash of
    member content
R6  a restore cannot resurrect the population
R7  the expansion_events obstruction is resolved BEFORE the delete, not
    discovered during it
R8  child-family destruction is counted and recorded
R9  both B1 creation guards still stand afterwards
```

⛔ **R6 is the one that decides §4.2**, and it cannot be satisfied by a delete
alone.

## 6 · Standing

```text
B4                  ✅ AUTHORITATIVE · 174,662 · 860
B5 values ruling    ✅ DELETE — recorded here
B5 mechanics        ⛔ NOT DESIGNED · NOT AUTHORIZED · no production contact
B3 production       ⛔ HOLD — deploy only after remediation is qualified
B1 containment      ✅ holding — the population cannot grow while this waits

Focus disclosure    ⛔ outranked
#1275               frozen @ 18d8c7004
```

⭐ **Nothing degrades while this waits.** Both creation paths are closed, so the
population is static — which is the whole reason the ruling can be taken
carefully rather than urgently.

---

*The system kept a copy it could not answer for. Keeping the record of that is
the part with value; keeping the words is the part with risk.*
