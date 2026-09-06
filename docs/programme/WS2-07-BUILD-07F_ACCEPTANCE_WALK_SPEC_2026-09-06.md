# WS2-07 · BUILD-07F — production acceptance walk · SPEC

> **The claims are fixed HERE, before deployment. That is the point of the document: a walk whose
> claims are written while it is being walked can only confirm what it finds. Nothing below has been
> executed; production promotion is not authorized and this walk has not started.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
CANONICAL        cb557b8fb057a8c5944abd1e1e9b479aa66091ef
PROMOTION        docs/ops/WS2-07F_PRODUCTION_PROMOTION_RUNBOOK_2026-09-06.md
STATE            PRODUCTION ACCEPTANCE NOT STARTED
```

---

## 1 · Evidence classes — what each witness can and cannot establish

07E's lesson, carried: local gates measure the branch program, PR CI measures the merge program, the
walk measures the deployed runtime, and **none substitutes for the next**. 07F adds a fourth:

```text
L  ephemeral laboratory   deliberately deficient variants, destructive paths, race interleavings
M  merge program (CI)     8/8 on exact head 54776ed5d
R  deployed runtime       this walk
```

Every claim below is labelled with the class that establishes it. A claim carried by **L** is not
weaker for being carried there — it is carried there because reproducing it in **R** would require
destroying a member's Work.

Two witness kinds inside **R**, kept apart because they fail differently:

```text
[B]  BROWSER / MEMBER   what a signed-in writer sees and does in the Develop room
[D]  DATABASE / PROVENANCE   what the row, the trigger and the container report
```

A `[B]` observation is never accepted as proof of persistence, and a `[D]` row is never accepted as
proof that the member was shown the truth. Where both matter, the claim names both.

---

## 2 · Preconditions

```text
the runbook's §6 verification passed — GIT_COMMIT = cb557b8f, migration recorded, objects present
one authenticated founder member session in a browser
at least one existing frozen developmental reading with ≥ 2 observations
  (or one commissioned during W0 — a commissioning act, not a standing act)
```

No credential is handled by the agent. Every authenticated act is performed by the founder.

---

## 3 · The walk

### W1 · provenance and schema `[D]`

The runbook's §6 checks, re-stated here as the walk's first witness so the walk stands alone:
`GIT_COMMIT = cb557b8f`; `schema_migrations` carries the 07F filename; the events table exists with
its UNIQUE quad and two triggers; `developmental_readings` carries **both**
`developmental_readings_immutable_check` and `developmental_readings_no_orphan_delete_check`.

**Fails if:** any object missing, or 07C's immutability trigger gone.

### W2 · UNSET is what a writer sees before they act `[B]` + `[D]`

Open a reading whose observations have no standing. Each shows **"No standing taken."** and three
enabled controls.

`[D]` `SELECT count(*) … WHERE reading_id = R` → **0**.

**Fails if:** any observation shows a value, or the row count is non-zero, or the controls are
disabled while the lookup succeeded.

### W3 · a standing is taken, and it is an append `[B]` + `[D]`

Choose **Keep** on `o1`. The row reads *"You marked this keep."*

`[D]` exactly one event: `event_index = 0`, `standing = 'keep'`, `member_id` = the founder's id,
`reading_id` = R, `observation_key = 'o1'`, `recorded_at` server-stamped.

**Fails if:** more than one row, an index other than 0, or a `member_id` the request could have supplied.

### W4 · it survives the reload `[B]`

Hard-reload the room. `o1` still reads *keep*; every other observation still reads *No standing taken.*

**Fails if:** the standing is lost, or absence is rendered as anything other than "No standing taken."

### W5 · changing a standing does not rewrite the first act `[B]` + `[D]`

Choose **Dismiss** on the same `o1`. The row reads *dismiss*.

`[D]` **two** rows: `event_index 0 = keep` **unchanged, same `id`, same `recorded_at`**, and
`event_index 1 = dismiss`. Current is the greatest index.

**Fails if:** the first row changed in any field, or was replaced, or the count is still one.

### W6 · repeating a standing writes nothing `[B]` + `[D]`

Choose **Dismiss** again. The row still reads *dismiss*; `[D]` the count is **still two**.

**Fails if:** a third row appears — the no-op is not a no-op.

### W7 · a stale act is refused, and nothing is overwritten `[B]` + `[D]`

Two browser tabs, same member, same reading — no credential leaves the founder's hands and no token
is extracted by the agent:

```text
tab A  loads the room (holds the token for event 1)
tab B  loads the room, chooses Unresolved   → event 2 written
tab A  without reloading, chooses Keep      → REFUSED
```

Tab A must say *"This standing changed elsewhere while you were looking. Nothing was overwritten —
here it is as it now stands."* and then show **unresolved**, not keep.

`[D]` exactly **three** rows; no row with `standing = 'keep'` at index 2; the stream is
`keep → dismiss → unresolved`.

**Fails if:** tab A's write is accepted, or the row count reaches four, or tab A claims to show
current state while the refresh has not landed.

### W8 · unknown is not UNSET `[B]`

With DevTools, block **only** the `GET …/standings` request, then reload the room.

The row must read *"Your standing could not be reached. Nothing has been changed."* and **the three
controls must be disabled.** It must NOT read "No standing taken."

**Fails if:** a failed lookup renders as UNSET, or a control remains clickable while the current
standing is unknown. *(Blocking the GET is a read-path fault only; it writes nothing.)*

### W9 · a new reading starts UNSET, and the old one keeps its standing `[B]` + `[D]`

Commission a second reading of the same Work. In the **new** reading, `o1` reads *No standing taken.*
Return to the first reading: `o1` still reads *unresolved*.

`[D]` all rows still carry the **first** reading's `reading_id`; none was copied, cleared or
re-pointed.

**Fails if:** the standing appears under the new reading, or the old reading's standing changed.

### W10 · the observation is untouched by the standing `[B]`

With `o1` dismissed: MAIA's text is verbatim and unfaded, its position in the list is unchanged, no
strike-through, its "Rests on" and "Does not establish" lists are intact, and no history, count or
timestamp of standings is rendered anywhere.

**Fails if:** any dismissal-driven change to the observation, or any exposure of the stream.

### W11 · MAIA does not see it `[B]`

Open the dialogue on the dismissed `o1` and ask a question about the observation. Her answer must
carry no awareness of the standing — no acknowledgement of dismissal, no adjustment of tone toward
it. Then ask her directly what the writer decided about it.

**Fails if:** any answer reflects the standing. *(D5 is structural — the module-graph and table-name
gates in `M`/`L` — and this witness is corroboration of the running system, not the primary proof.)*

### W12 · ownership `[D]`

`SELECT DISTINCT member_id FROM developmental_observation_standing_events` → exactly the founder's
id. If, and only if, a second real member account already exists, that member's session shows no
standing on this reading.

**Fails if:** any row carries an unexpected member, or a second member can see these standings.

---

## 4 · NOT REPRODUCED IN PRODUCTION — bound to the laboratory

These claims are accepted on **L** and will **not** be walked in **R**. Reproducing them requires
destroying a member's real Work or deliberately deficient code in front of real data. Manufacturing
a production deletion witness would be the opposite of what 07F protects.

| claim | where it is established | probe |
|---|---|---|
| deleting one standing event is refused while the Work exists | **L** — ephemeral PG16 | `single-delete-refused` |
| deleting a reading is refused while its manuscript exists | **L** | `reading-delete-refused` |
| deleting the Work cascades reading → standing away | **L** | `work-cascade-permitted` (two-hop, `DELETE FROM member_manuscripts`) |
| UPDATE of a recorded event is refused at the row | **L** | `update-refused` |
| two simultaneous writers cannot both be accepted | **L** | `simultaneous-write-refused` (deterministic race) |
| `unset` / NULL cannot be stored | **L** | `standing-values-closed`, `null-standing-refused` |
| every deficient variant observed RED before its repair | **L** | 8 persistence + 6 write-boundary variants |

`15 checks · 0 failures` (persistence) and `14 checks · 0 failures` (write boundary), on the tree
that became `54776ed5d`, recorded in the implementation witness.

**W1 is what carries these into production**: the same triggers, verified present on the deployed
database by name. The laboratory establishes *what the guards do*; W1 establishes *that these guards
are there*. Neither alone is the claim.

An offer this spec explicitly declines: creating a throwaway manuscript in production to delete it.
It would witness the cascade on a Work that was never a writer's, in a database that holds writers'
work, for a claim already established where deficient variants are safe.

---

## 5 · Stop rule

Any observation that does not conform **halts the walk for classification** — runtime defect,
instrument defect, or a claim written wrongly here. Nothing is repaired mid-walk, and no later
witness is run to "see if it also fails": the walk's value is that its claims were fixed in advance,
and a walk that edits itself while running has forfeited that.

A halted walk is reported with the exact observation, the class it belongs to, and nothing else
decided.

---

## 6 · What completing this walk does and does not authorize

```text
DOES        establish that the deployed runtime behaves as the accepted design says
DOES NOT    close BUILD-07F — closure is a founder act, taken after the walk, not by it
DOES NOT    authorize BUILD-07G or 07H
DOES NOT    licence any claim beyond what the witnesses above actually observed
```
