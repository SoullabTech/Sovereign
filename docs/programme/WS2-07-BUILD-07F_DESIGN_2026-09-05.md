# WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · design record

> **Design ACCEPTED (founder adjudication, 2026-09-05), written from canonical `b98676de3`.
> This record fixes the design and its falsifiers. It authorises no migration, no route, no
> surface and no runtime work. No runtime bytes are changed by it.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
CANONICAL        b98676de3
CENSUS           WS2-07-BUILD-07F_STANDING_CENSUS_2026-09-05.md          (canonical)
ADJUDICATION     WS2-07-BUILD-07F_ADJUDICATION_2026-09-05.md             (canonical)
STATE            DESIGN ACCEPTED · IMPLEMENTATION NOT AUTHORISED
```

The lane's sequence, and where this sits: **census → adjudication → design → falsification →
build.** Each act is its own record and none amends its predecessor.

---

## 1 · Shape: append-only standing events, current derived

```text
developmental_observation_standing_events

  id                uuid          DB-minted event identity
  member_id         uuid          the writer whose standing this is
  reading_id        uuid          the exact frozen developmental reading
  observation_key   text          the exact observation inside that reading
  event_index       integer       monotonic within the identity triple
  standing          text          keep | dismiss | unresolved
  recorded_at       timestamptz   DB-stamped

  UNIQUE (member_id, reading_id, observation_key, event_index)
```

**Why B and not "current row + immutable history".** Both can be made transactional. Only one
stores the fact once. A current row plus a history table stores the same fact twice and creates a
permanent synchronisation invariant that every future writer must honour; an event stream makes
history *the thing stored* and "current" merely its latest projection.

The consequence that matters:

> **D3 and D7 stop being two invariants that must be kept in agreement and become consequences of
> one representation.**

Absent by construction, each for a reason:

```text
unset value            UNSET is zero events (§2). A value would make it writable.
default standing       there is no default; the governed default is NO ROW.
NULL-standing event    same — absence is not a value.
investigate            a different axis (adjudication Q4), not a standing.
is_current flag        derivable state that can drift from the stream.
cleared_at             clearing is not an operation (§7).
successor observation  standing never transfers (§6).
actor column           there is no system actor to record (§8).
generic anchor jsonb   normalised columns make `concern` unrepresentable here (§5).
```

---

## 2 · UNSET is zero events

```text
zero events   UNSET       no member act has occurred
one or more   the writer has acted
latest event  the current standing
```

**UNSET can never be written**, and a writer cannot return to it. Allowing a return would make
*"I have never taken a position"* indistinguishable from *"I took positions and erased that
history"*. A writer who no longer wishes to rule takes the explicit standing `unresolved`.

```text
UNSET        the absence of a member act
UNRESOLVED   a member act
```

**Accepted consequence, named here rather than discovered later.** The historical event is
permanent; its **current effect is not**. An accidental standing may be changed by taking a later
one, and the earlier recorded act is not erased — what cannot be done is returning to *never
having ruled*. That is the correct reading of Q1: the record holds what the writer did, and the
surface should not imply a standing can be withdrawn (§10).

---

## 3 · Current standing

For one exact identity `(member_id, reading_id, observation_key)`, current is the row with the
unique greatest `event_index`. Uniqueness within the triple guarantees exactly one such row.

The event `id` matters independently of the projection: **Stage 8 should eventually reference the
exact standing event that informed a revision**, rather than reconstructing it from timestamps or
from whatever is current later.

---

## 4 · Concurrency

The write contract:

```text
{ observationKey, standing, expectedCurrentEventId }

  field absent   malformed request
  null           the caller is acting from an observed UNSET
  uuid           the caller is acting from this exact current event
```

Sequence allocation and the expected-current test happen **inside the same database statement**,
carrying the `ask_turns` precedent, where the next index is computed within the INSERT and the key
refuses a concurrent collision rather than permitting an overwrite.

### Why BOTH the unique constraint and the CAS token

Recorded because they look redundant and are not. **They catch different failures**, and deleting
either leaves a real hole:

```text
SIMULTANEITY — caught by the unique constraint
  A and B both read event 4; both attempt event 5.
  One is accepted; the other violates the constraint and is told.

STALENESS — caught by the CAS token, NOT by the constraint
  A reads event 4. B writes event 5. A then writes: it computes index 6,
  collides with nothing, and is accepted — silently superseding B's act
  from state A never saw.
```

**Ordering requirement: the expected-current test runs BEFORE the same-value no-op (§5).**
Otherwise a caller holding a stale token whose *value* happens to match the current standing
succeeds silently and is taught that its token was current. Staleness first; no-op second.

**No automatic retry on conflict.** Retrying the loser would make machine scheduling the ordering
authority over two member acts. The writer refetches the now-current standing and may act again,
deliberately.

---

## 5 · The address, and where coherence is enforced

Normalised `reading_id` + `observation_key`, never a generic `anchor jsonb`. This makes `concern`
and every other Ask anchor **literally unrepresentable** in this object rather than merely
unexpected.

The 07E developmental anchor already refuses a mismatched reading or an unresolvable observation
rather than repairing it to a nearby one. **That coherence must not live only in the surface or
the HTTP route.** The standing write boundary must independently establish that the exact
observation exists in the exact frozen reading before accepting an event, so that a future
internal caller cannot manufacture `reading R + imaginary o27` by bypassing the surface.

**An asymmetry to state honestly:** `reading_id` can be foreign-keyed; `observation_key` cannot —
observations live inside the reading's jsonb and there is no row to reference. So the observation
half of the address is guarded by the write boundary, not by a constraint. That is why §5's
requirement is a design obligation rather than a schema note.

---

## 6 · Supersession

```text
reading A / o1 / KEEP
        │  the Work changes
        ▼
reading A / o1 / KEEP        the historical observation keeps its standing

reading B / o1
        ▼
UNSET                        a different object; no standing has been taken
```

No clearing, no transfer, no copy. The same textual key across two readings is irrelevant:
`(readingId, observationKey)` is the object, and 07E already established that `o1` is stable only
*within* one reading.

---

## 7 · Deletion semantics — the founder ruling

> **Standing history is immutable while the Work exists. Deleting the Work deletes the standing
> history with it.**

This does not violate D3. D3 protects history against **rewriting, auto-reversion, clearing,
housekeeping and replacement**. It does not require Soullab to retain a writer's judgments after
the writer has deliberately deleted the containing Work.

The distinction is already native to the lane: frozen developmental readings are insert-only and
retained, yet cascade when the member deletes the manuscript; `ask_turns` refuses UPDATE while
allowing the author's deletion of the containing thread. **Append-only is not a claim that
member-owned records must survive a sovereign deletion act.**

```text
CHANGE standing              append a new event
REPEAT same standing         no-op (§5 ordering applies)
CLEAR standing               NOT A VALID OPERATION
DELETE one historical event  NOT A VALID OPERATION
SYSTEM prune / auto-revert   FORBIDDEN
OBSERVATION superseded       events remain
NEW observation              UNSET
DELETE the whole Work        the standing stream cascades away
```

> **Deletion of the containing member-owned Work is not retroactive falsification of its history;
> it is deletion of the record as a whole.**

### The structural requirement this ruling creates

The two sides of the ruling must BOTH be proved, not one proved and the other merely omitted:

```text
per-event erasure        must be structurally REFUSED or unreachable while the Work exists
whole-Work cascade       must remain permitted
```

**Absence of an HTTP DELETE route does not satisfy D3.** `UPDATE` refusal in this lane is
structural — the database refuses it at the row — and single-event deletion must be held to the
same standard rather than described as "not a valid operation" and left to the absence of a
button. The chosen mechanism is an implementation decision, but it must permit the ruled
whole-Work cascade while refusing the deletion of an individual event, and the falsifier for D3
(§11) must exercise both directions.

Orphaned `keep` / `dismiss` / `unresolved` judgments must **not** be retained after their Work is
gone — that would turn provenance into detached behavioural data, the exact pressure Q1 exists to
resist.

⛔ A later sovereign act such as *"forget my developmental judgments while keeping the Work"* would
be a new product and ontology decision. It must not be smuggled into this schema as
`DELETE /standing/:id`.

---

## 8 · Ownership

`member_id` is physically present in the identity even though it is redundant under today's
single-member Work model. **Authentication supplies it; the request never does.**

Authorization today may prove the member owns the Work. The persistence model must **not** derive
the standing owner from the reading owner — those are different claims, and the second breaks the
day legitimate sharing arrives. Reads filter on the event's own `member_id` inside the SQL
predicate, following the existing member-scoped discipline where ownership is part of the query
rather than a filter applied after another member's row has already been returned.

**Where D6 actually rests.** The absent `actor` column makes a system-written standing
*unsayable*, not *unwritable* — it is not evidence about who wrote a row. D6's guarantee is the
module graph (§9), and this record states that rather than letting the schema imply a property it
does not have.

---

## 9 · MAIA and standing — the boundary in both directions

Standing stays entirely outside ambient MAIA cognition. `DevelopmentalAskContext` today carries
the frozen observation, its verified evidence and its measured location — and no standing.
Preserve that **structurally**.

```text
standing        ──X──►  MAIA cognition        D5
MAIA / system   ──X──►  the standing writer   D6
```

D5 protects what MAIA sees. D6 protects who may create the writer's stance. They are two
directions of one boundary and both are **module-graph assertions**, following 07E's gate-7
method: strip comments, walk the actual imports, and refuse the capability rather than trusting
prose.

The standing store must not be reachable from:

```text
the developmental reader / commission path
DevelopmentalAskContext assembly
the developmental Ask reader
the Ask route
07G synthesis, when it exists
```

When 07G arrives, its synthesis root is added to the same gate. A future founder ruling permitting
standing into a writer-initiated conversation would then require a deliberate architectural
change rather than one convenient import.

---

## 10 · Surface and API

**API — a sibling resource, never folded into the reading payload:**

```text
GET   …/readings/:readingId/standings     current projection + currentEventId, per member
POST  …/readings/:readingId/standings     the closed three-field envelope of §4
```

The GET **must return `currentEventId`**, not only the standing value — the CAS token is otherwise
unobtainable, since a client cannot send a token it was never given.

07F retains history but does **not** expose it: no history browser, no change-frequency view, no
reversal count, no standing analytics. Retaining a record and rendering it are different
capabilities, and only the first was ruled.

No `memberId` in the body, no generic anchor, no `investigate`, no PUT/PATCH of an event, no
clear or delete operation.

**Surface — a separate member-owned axis beneath the observation:**

```text
MAIA noticed
  [her frozen observation]
  Rests on …
  Does not establish …

Your standing
  Keep · Dismiss · Unresolved

talk with MAIA about this
```

Standing must not hide, fade, reorder, strike through, suppress or otherwise alter what MAIA
observed. A dismissal changes the member-labelled row and nothing else. The control must not imply
that a standing can be deselected once taken (§2).

**Unknown is not UNSET — a hard acceptance condition.**

```text
available + no event   →  "No standing taken"
failed / unavailable   →  standing could not be reached; the act is disabled
```

A failed lookup may never render as UNSET. This is 07E's discovery repair in its 07F form:
*absence of evidence from the instrument is not evidence of absence in the object.*

The surface inherits the compound `(readingId, observationKey)` identity 07E established, for the
same reason: `o1` state must not leak from reading A into reading B.

---

## 11 · D1–D7 — mechanisms and falsifiers

| Gate | Structural mechanism | Falsifier |
|---|---|---|
| **D1** ownership | `member_id` in the identity, supplied by session; member-scoped SQL predicate | Member B cannot read or create A's standing even knowing A's reading id and event id |
| **D2** UNSET | zero events; enum holds only the three explicit values; surface separates available-empty from unavailable | A read failure never renders UNSET; `unresolved` creates an event; no path writes UNSET |
| **D3** history | append-only events; no current row to overwrite; UPDATE refused at the row; single-event deletion structurally refused (§7) | `keep → dismiss` leaves both events with the first unchanged; deleting ONE event is refused at the row, not merely unrouted; deleting the whole Work still cascades the stream away |
| **D4** supersession | events address only the exact frozen `(reading_id, observation_key)`; no successor, copy or clear field | A superseded observation keeps its standing; the successor reading's `o1` is UNSET |
| **D5** cognition | standing modules excluded from the MAIA cognitive module graph | The static gate fails on any value-import of standing into reader, context, Ask route or 07G synthesis |
| **D6** system cannot set | write path reachable only through the authenticated member route; no actor, default or revert | No background or MAIA-side module can value-import or invoke the writer; no auto-revert of the `member_memory_atoms` kind exists |
| **D7** one current | current = unique greatest `event_index`; no `is_current`; CAS token plus in-statement allocation | Two concurrent writes from one prior state cannot both be accepted; a stale-token write is refused, not applied |

**Falsification discipline for the build:** each guard must be run against code lacking its repair
and observed to fail, per the standard this lane set in 07E. A guard that has never failed against
the code it guards is a tautology.

---

## 12 · Canonical kin

`docs/canon/CLAIM_STATE_AUTHORITY.md` is **kin, not governing authority** over this unit.

Its asymmetry runs in the same direction — *evidence may license an outward claim but cannot compel
Soullab to make it; authority may withhold, but may not manufacture warrant* — and 07F's shape
rhymes with it: **MAIA may make an observation but cannot compel a writer's standing, and the
writer may always withhold via `unresolved`.**

The resemblance is constitutional, not jurisdictional. That canon governs what Soullab claims
publicly; it does not govern member standing, and this record does not extend its jurisdiction by
citing it.

---

## 13 · What this record does not do

```text
no migration · no route · no surface · no types · no implementation
no exposure of standing history — retained is not rendered
no persistence ruling for `investigate`
no "forget my judgments while keeping the Work" act
no opening of BUILD-07G or 07H
nothing absorbed from the parked ledger
```

**IMPLEMENTATION IS NOT AUTHORISED.** The next act is founder review of this record.
