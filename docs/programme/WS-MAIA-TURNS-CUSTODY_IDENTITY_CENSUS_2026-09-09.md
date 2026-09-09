# LANE B · `maia_turns` DERIVATIVE CUSTODY — identity census

**Class A.** Read-only source census on canonical `5b133abcd`. ⛔ No production
query, no repair written, no schema change.

**The governing rule:** *a derived copy cannot outlive the member data whose
deletion created the obligation to remove it.* `maia_turns` gets no exemption for
being called learning infrastructure.

---

## 1 · ⚠️ A CORRECTION TO MY OWN PRIOR FINDING

I told the founder: *"`app/api/maia/log-turn` is a live HTTP route that inserts
`maia_turns.content`."* **That was wrong in its load-bearing half, and the
correction narrows the training verdict back toward the founder's original
reading.**

The route does contain:

```sql
INSERT INTO maia_turns (session_id, turn_index, role, content,
                        processing_profile, engine, meta) VALUES (…)
```

**Four of those seven columns do not exist.** Against the authoritative schema:

```text
role      ABSENT      content   ABSENT
engine    ABSENT      meta      ABSENT
user_id   ABSENT
```

The real table carries `user_text` / `maia_text`, and the only `ALTER TABLE`s
since add `deliberation_id` and `origin_route`. **So the route's INSERT is
schema-invalid and cannot succeed as written.**

```text
TRAINING FEED — corrected

route exists                    YES
route reachable over HTTP       YES
route can write maia_turns      ⛔ NO — the INSERT would error
backfill script can write it    YES (operator-run)
automatic feed                  NO EVIDENCE
```

⭐ **The route is not a live writer. It is a broken one** — which is a different
finding, and one that also means the endpoint has almost certainly never
succeeded against this schema.

⛔ **This does not repair the deletion defect.** The *backfill* path is real and
unguarded, and a broken writer is a defect on its own account.

## 2 · Identity model — the census the repair must be built on

```text
maia_turns
  id                 BIGSERIAL PK
  session_id         TEXT NOT NULL     ⛔ no FK; a bare TEXT
  turn_index         INTEGER NOT NULL
  user_text          TEXT NOT NULL     ← member's words
  maia_text          TEXT NOT NULL     ← MAIA's words
  …
  deliberation_id    UUID → deliberations(id) ON DELETE SET NULL
  origin_route       TEXT
```

🔴 **THE FINDING: there is no `user_id`.** Member attribution exists only through
`session_id`, and `session_id` is **`TEXT` with no foreign key** — so the schema
itself cannot prove which member a row belongs to, or that the session it names
still exists.

⭐ **Deletion mechanics must therefore be chosen from the identity that exists,
not manufactured after the fact.** Whether `session_id` joins to `maia_sessions`,
whether that join is total, and whether session ownership is authoritative enough
to delete by are the questions the repair design turns on — and at least one
population is foreseeable that no join can attribute.

## 3 · What flows FROM `maia_turns`

Five child tables cascade from it, so a row's deletion is not isolated:

```text
maia_engine_comparisons   ON DELETE CASCADE
maia_misattunements       ON DELETE CASCADE
maia_turn_feedback        ON DELETE CASCADE
maia_voice_feedback       ON DELETE CASCADE
maia_voice_turns          ON DELETE CASCADE
deliberations.turn_id     ON DELETE SET NULL   (the reverse direction)
lib/database/maia-training-schema.sql:94  a further CASCADE child
```

⭐ Cascades mean the mechanics are already half-built — **downward**. What is
missing is the act that starts them.

## 4 · 🔴 DELETION COVERAGE — the defect, established from source

```text
account deletion (app/api/members/delete-account)
  44 governed tables, refuse-by-default
  conversation_turns   ✅ governed
  member_sessions      ✅ deleted explicitly
  maia_turns           ⛔ ABSENT

S5 constitutional deletion substrate (20260718000001)
  mint gate + tombstone refusal attach to:
    conversation_turns · agent_runs · integration_passes
  maia_turns           ⛔ NOT AMONG THEM
```

⛔ **So `maia_turns` sits outside BOTH deletion mechanisms** — the application's
governed-table list and the database's constitutional substrate. A row copied
there is not tombstoned, not manifest-scoped, and not reached by account
deletion.

**Standing, at exactly the strength the source supports:**

```text
copy path exists             YES  (backfill-training-data.sql)
live writer surface exists   ⛔ NO — corrected in §1; the route is broken
actual external caller       UNWITNESSED
production rows              UNWITNESSED
account deletion coverage    ABSENT
S5 substrate coverage        ABSENT
source-code defect           ✅ ESTABLISHED
historical exposure          UNKNOWN
repair                       REQUIRED BEFORE NEW USE
```

⭐ **The defect is established without any production evidence.** A lawful path
can create derivative copies of member conversation text into a table deletion
does not govern. Whether occupancy is currently zero changes the urgency, not the
verdict.

## 5 · ⛔ What this census does NOT do

No repair is written. Deletion mechanics cannot be chosen until the
`session_id → member` join is traced and its totality established — and rows
that no join can attribute are a **historical-custody adjudication**, not an
occasion for a clever heuristic.

⛔ **No production query.** Occupancy answers a narrowly different question —
*are there historical rows requiring remediation?* — and is not needed to prove
the defect.

## 6 · Consequence for Lane A

⭐ **No new Focus disclosure path may open while this is unresolved.** The Focus
seam intends to keep passage text out of `content`, but this lane has
demonstrated that member text already fans into a durable derivative outside both
deletion mechanisms. **Existing custody obligation first; new disclosure design
second.**

---

*A copy that deletion cannot reach is not storage. It is a promise the system
cannot keep.*
