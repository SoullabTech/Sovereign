# LANE B · B4 — production occupancy witness · **RUN**

**Class A, read-only.** Executed by the founder from the Mac Studio against
production, from the pinned instrument.

```text
instrument   8c2343a9866202cfcd5983d50da928eb891693a5
             scripts/witness/maia-turns-b4-occupancy.sql
invocation   set -o pipefail · git show <SHA> | ssh … psql -v ON_ERROR_STOP=1
date         2026-09-09
```

---

## 1 · The result, verbatim

```text
Pager usage is off.
BEGIN
SET
 total_rows | distinct_sessions
------------+-------------------
     174662 |               860
(1 row)

ROLLBACK
```

## 2 · What the run establishes

### 2.1 The subject was the qualified one

⭐ **The drift check passed silently, and that is itself evidence.** The witness
refuses mechanically before occupancy; reaching the counts means both conditions
held in production:

```text
maia_turns.member_id                     ABSENT  → production is pre-B3
expansion_events → maia_turns FK          'a'    → still NO ACTION
```

So the counts are counts of the subject that was qualified locally, not of
something else.

### 2.2 🔴 THE HISTORICAL POPULATION EXISTS

```text
total_rows          174,662
distinct_sessions       860
```

⛔ **The conditional is resolved.** Every prior document said *"if the backfill
has ever run"*. It has, or something equivalent to it has: 174,662 rows of
derivative member conversation text (`user_text` + `maia_text`) are sitting in
`maia_turns` right now.

⚠️ **Origin is NOT established by this witness.** The operator backfill is the
only working writer found in source — `/api/maia/log-turn` is schema-invalid and
cannot have produced them — but *"the backfill produced these rows"* is an
inference, not a reading. The witness counted; it did not attribute.

### 2.3 What that means, held to exactly what is known

Those 174,662 rows are, in production, today:

```text
member identity        NONE — no user_id; session_id is bare TEXT, no FK
account deletion       DOES NOT REACH THEM
S5 substrate           NOT COVERED — no mint gate, no tombstone, no manifest scope
deletion path          NONE anywhere in the tree
```

⭐ **This is no longer a design defect. It is a live custody condition.**

### 2.4 ⚠️ And deletion of them is currently BLOCKED, not merely absent

The drift check confirmed `expansion_events → maia_turns` is still **NO ACTION**
in production. So a `DELETE` of any `maia_turns` row that `expansion_events`
references would **raise a foreign-key violation today**. Nothing currently
attempts it — which is the only reason this has never surfaced as an incident.

## 3 · B4 OUTCOME LAW — triggered

```text
total_rows > 0
  → historical population EXISTS          ✅ 174,662
  → B5 OPENS
  → do NOT attribute rows from session_id
  → do NOT deploy B3 until historical custody is adjudicated
```

⛔ **B3 deployment is blocked by this result**, not merely unauthorized.

⭐ **And the restore concern the founder flagged is now live.** The B3 insert
gate makes historical NULLs representable *in place*, but ordinary reinsertion
of such a row would be refused. With 174,662 of them, backup/restore semantics
for this population are part of B5's custody question — not an afterthought, and
not something B3 may be deployed ahead of.

## 4 · ⛔ What this document does NOT do

No remediation is proposed. No attribution is attempted — **860 distinct
sessions is a count, and joining them to members would be exactly the heuristic
attribution ruled out.** No further production query was made; B4 authorized one
witness and one witness ran.

## 5 · Standing

```text
B1 containment      ✅ standing — no new rows can be created by either path
B2 identity design  ✅ ratified
B3 schema+falsifier ✅ qualified locally
B4 occupancy        ✅ RUN — historical population EXISTS (174,662 / 860)
B5 remediation      🔴 OPENS — not begun, scope is a founder act

B3 deploy           ⛔ BLOCKED by B4's result
historical rows     EXIST · unattributed · unreachable by deletion
deletion of them    currently BLOCKED by the expansion_events FK
Focus disclosure    ⛔ NOT AUTHORIZED — this outranks it
#1275               frozen @ 18d8c7004
production          read-only witness only; no mutation
```

---

*The count was the cheapest question in the lane and the only one that could
have closed it. It didn't close it. There are 174,662 rows here that the system
promised it could delete and cannot.*
