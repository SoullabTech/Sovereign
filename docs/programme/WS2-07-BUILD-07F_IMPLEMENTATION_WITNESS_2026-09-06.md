# WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · implementation witness

> **Written from the branch candidate, bound to canonical `d8fc2082d`. This record reports what was
> built and what was observed. It closes nothing: BUILD-07F is NOT CLOSED, no PR is open, nothing
> is deployed, and no production database has been touched.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
CANONICAL        d8fc2082d
REVIEW 1         founder, 2026-09-06 — HOLD on dc48528d7: R1 delete path ·
                 R2 async identity · R3 graph coverage · conflict copy (§5)
REVIEW 2         founder, 2026-09-06 — HOLD on b3e3ff7c8: R1 PASS · R2 success
                 path PASS · R3 PASS · conflict copy PASS; two blockers remain —
                 R2 LATE CONFLICT and the D5/D6 RAW-SQL BYPASS (§6)
SOURCE           ACCEPTED (founder, 2026-09-06) on 96db26f62
INTEGRATION      merged forward to canonical 2732706b6 (§7), then df9594592
                 (§7.1), then c84bf2d93 (§7.2) — gates bound to each head
BRANCH           claude/writer-author-studios-roadmap-b2tqf5
CENSUS           WS2-07-BUILD-07F_STANDING_CENSUS_2026-09-05.md       (canonical)
ADJUDICATION     WS2-07-BUILD-07F_ADJUDICATION_2026-09-05.md          (canonical)
DESIGN           WS2-07-BUILD-07F_DESIGN_2026-09-05.md                (canonical, accepted)
STATE            IMPLEMENTED ON BRANCH · FALSIFIED · NOT CLOSED · NO PR · NO DEPLOY
```

The lane's sequence: **census → adjudication → design → falsification → build.** This record is the
fourth and fifth acts. It does not amend the design; where the two differ, the design governs and
the difference is reported here.

---

## 1 · What was built

```text
A  persistence     database/migrations/20260906000001_developmental_observation_standing.sql
                   — incl. the BEFORE DELETE guard on `developmental_readings` (R1)
B  write boundary  lib/manuscript/standing/{contract,store}.ts
C  resource        app/api/sovereign/manuscripts/[id]/readings/[readingId]/standings/route.ts
D  module graph    lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts
E  surface         lib/writersStudio/{observationStanding,standingClient}.ts
                   app/writers-studio/develop/DevelopRoom.tsx  (the "Your standing" axis)
```

Shape B as accepted: append-only events, current derived as the unique greatest `event_index` per
`(member_id, reading_id, observation_key)`. UNSET is zero events and has no value anywhere in the
program — not in the enum, not in the schema, not in the parser, not on the surface.

---

## 2 · Falsification — the guards, observed RED before they were accepted

Two harnesses. Each derives its DEFICIENT VARIANTS from the real source at run time by one named
excision; **an excision that changes nothing aborts the run**, so no variant can silently become a
no-op that reports a red it never caused. Under every variant, all other probes must still pass —
otherwise the red is not attributable and the harness says so.

### 2.1 Persistence — `scripts/ws2-07f/falsify-standing-persistence.ts`

| Variant | Guard observed RED |
|---|---|
| `D3-NO-UPDATE-GUARD` | `update-refused` — the UPDATE was accepted |
| `D3-NO-DELETE-GUARD` | `single-delete-refused` — per-event DELETE accepted |
| `D3-DELETE-GUARD-UNCONDITIONAL` | `work-cascade-permitted` — the member's own deletion of the Work refused |
| `D7-NO-UNIQUE` | `simultaneous-write-refused` — both concurrent writes accepted |
| `D2-UNSET-VALUE-WRITABLE` | `standing-values-closed` — `'unset'` accepted |
| `D2-NULL-STANDING-WRITABLE` | `null-standing-refused` — a NULL standing accepted |
| `D3-NO-READING-DELETE-GUARD` | `reading-delete-refused` — **a reading deleted while its Work existed** (R1) |
| `D3-READING-DELETE-GUARD-UNCONDITIONAL` | `work-cascade-permitted` — the member's deletion of their Work refused two levels down |

`D3-DELETE-GUARD-UNCONDITIONAL` exists because the deletion ruling has two sides. Without it, a
guard that over-refuses — one that would block the writer's own deletion of their Work — looks
identical to a correct one.

The positive D3 witness now deletes the **manuscript** and walks the real two-hop path
`member_manuscripts → developmental_readings → standing events`; the scaffold applies the canonical
07C migration rather than a reading surrogate. See §5.1.

**Migration as written: `15 checks · 0 failures`.**

### 2.2 Write boundary — `scripts/ws2-07f/falsify-standing-store.ts`

| Variant | Guard observed RED |
|---|---|
| `D1-NO-MEMBER-SCOPE-READ` | `read-is-member-scoped` — member B read member A's standing |
| `D1-NO-MEMBER-SCOPE-WRITE` | `write-is-member-scoped` — member B's write appended |
| `D4-KEY-ONLY-IDENTITY` | `standing-does-not-transfer` — a standing appeared under a different reading |
| `D7-NO-CAS` | `stale-expectation-refused` — the stale write appended |
| `D7-NOOP-BEFORE-CAS` | `staleness-tested-before-noop` — a stale caller was told "unchanged" |
| `SEC5-NO-COHERENCE-GATE` | `address-must-resolve` — a standing on an imaginary observation appended |

**Store as written: `14 checks · 0 failures`.**

The room's own two failures are falsified in `lib/writersStudio/__tests__/observationStanding.test.ts`
as pure state transitions — including the full R2 sequence (A in flight → switch to B → B settles →
A completes late → **B/o1 still UNSET**) — because the state at issue lives above the keyed subtree
and cannot be reached by a rendering assertion.

### 2.3 Module graph — D5 and D6

`standingOutsideCognition.test.ts` walks the actual imports (comments stripped) from each cognition
root named in design §9 and asserts standing is unreachable; and asserts that the ONLY module
reaching the standing store is the authenticated member route.

The gate is falsified in the same file, over an **overlay reader** — the real tree with one file
replaced in memory, so no deficient module is ever written to disk:

```text
a cognition module given the forbidden import        → the walk reports it
a violation reached TRANSITIVELY, not directly       → the walk reports it
a background module reaching the writer (D6)         → the importer scan reports it

EVERY MODULE-LOADING FORM, one falsifier each (R3):
  from '…'   ·   import('…')   ·   require('…')   ·   import '…'   ·   export * from '…'
```

R3's point, kept: the claim is not *"a static import cannot reach standing"* but that standing is
unreachable. A form the walker cannot see is a form the gate does not cover, so each form the
repository permits is proved visible — on both directions of the boundary.

The D6 allowlist assertion was **also observed red for real**: before the route existed it reported
`[]` against an expected `[the standings route]`. `37 checks · 0 failures` after the route landed and the walker was hardened.

### 2.4 Two apparatus defects found and repaired — reported, not hidden

1. **A non-deterministic race probe.** The first simultaneity probe let both writers allocate their
   index inside the INSERT and relied on event-loop ordering for the interleaving. It reported the
   real migration RED, and the diagnosis was the probe: node-pg had dispatched the second write
   after the first committed, so the two writers legitimately allocated different indices. The probe
   now reads both indices explicitly before either commits and **aborts as inconclusive** if they
   differ — a fortunate interleaving can no longer be recorded as a pass.
2. **A non-minimal variant.** `SEC5-NO-COHERENCE-GATE` originally removed the whole
   `addressResolves` call, which carries TWO protections; the member-scope probe broke as well and
   the harness correctly refused to attribute the red. The variant now drops only the observation
   half and keeps the ownership refusal.

Both are recorded because a harness that is quietly corrected until it is green is not evidence.

### 2.5 The laboratory

An ephemeral PostgreSQL 16 cluster (`initdb … -E UTF8 --locale=C`, unix socket, `listen_addresses=''`),
created for this lane. Both harnesses refuse a non-loopback host, create their own throwaway
databases and drop them. **Production is not the laboratory for deliberately deficient variants**,
and no deficient schema or module was applied anywhere else.

Before the delete trigger was written, the discriminator it rests on was **established empirically**
against that cluster rather than assumed from documentation: inside a `BEFORE DELETE` trigger the
parent reading is already gone during a cascade and still present during a direct delete.

---

## 3 · Where each ruling landed

```text
Q1 provenance not interpretation   no actor column, no inference, no analytics; history retained,
                                   not rendered
Q4 different axes                  `investigate` is absent from the enum, the parser, the route and
                                   the surface — three coherent combinations are not made exclusive
standing ⇢ MAIA                    D5 module-graph gate, from every cognition root in design §9
MAIA ⇢ standing writer             D6 module-graph gate; the route is the only permitted importer
deletion                           per-event DELETE refused at the row while the Work exists;
                                   the READING likewise refused while its Work exists (R1);
                                   whole-Work cascade permitted through both hops — every
                                   direction exercised, none left to the absence of a route
UNSET                              zero events; no value exists to write; a failed lookup renders
                                   UNKNOWN, never "no standing taken"
CAS + UNIQUE                       both present, catching staleness and simultaneity respectively;
                                   the expected-current test runs BEFORE the same-value no-op
```

Two decisions the design left to implementation, recorded so they are reviewable rather than
discovered later:

- **A refusal carries no fresh token.** The design forbids automatic retry; returning the new
  current with a 409 would hand a client everything it needs to retry in a loop the member never
  authored. The writer refetches through `GET` deliberately.
- **`readingIsAddressable` is a route-level identity check** (a reading is not addressable beneath a
  different Work, as the 07D reading route already holds). It does **not** replace the store's own
  `addressResolves`, which the write boundary performs independently — design §5's obligation.

---

## 4 · Adjacent facts observed, not acted on

- **`lib/manuscript/development/__tests__/evidenceCannotAct.test.ts`** guards that no new migration
  matching `develop|evidence|reading|observation` appears without being named. 07F's migration was
  named in its allowlist with the reason. The claim it makes — *the evidence substrate has no table
  of its own* — is unchanged.
- **14 pre-existing test failures** in `app/api/sovereign/manuscripts/[id]/draft/**` (`draft/route`
  and `draft/revisions/route`). Verified identical at canonical `d8fc2082d` with this branch's work
  stashed: **not this unit's, and not repaired here.** For the parked ledger.

Gates on this branch: `npm run typecheck` — no regressions (230 errors vs 239 baseline, none new);
`npm run check:no-supabase` — clean; `lib/manuscript` + `lib/writersStudio` — 1053 passed, 0 failed.

---

## 5 · Founder review 2026-09-06 — HOLD, and what each repair invalidated

The review found two blockers, one gate-coverage defect and one epistemic repair on candidate
`dc48528d7`. None required a design change; all four are repaired on this branch. Recorded here
with what each finding **took away from the earlier evidence**, because a witness that quietly
becomes green is not a witness.

### 5.1 R1 — D3 was not enforced against deletion of the frozen reading · BLOCKER

The standing guard permits a child deletion exactly when its reading is already gone, reading that
absence as *"the member deleted their Work"*. Canonical 07C never made that inference true: it
refuses UPDATE, but a **direct** `DELETE FROM developmental_readings` while the manuscript stood was
legal — and it cascaded the standing stream away. The accepted ruling was therefore not enforced.

Repaired by a `BEFORE DELETE` guard on `developmental_readings` in the 07F migration, using the same
discriminator one level up: refuse while the manuscript exists, permit once it is gone. It adds no
column and takes nothing from 07C; the INSERT-only reading and its retention are unchanged. No
runtime anywhere in the repository issues `DELETE FROM developmental_readings`, so the guard blocks
nothing that exists.

**What this invalidated.** The first harness labelled its positive probe `work-cascade-permitted`
while the statement it ran was a direct reading delete, against a scaffold with **no
`member_manuscripts` at all** — so the apparatus called the hole its own proof. That probe is
withdrawn, not amended into silence: the scaffold now applies the canonical 07C migration, the
positive witness deletes the **manuscript**, and `reading-delete-refused` was observed red under
`D3-NO-READING-DELETE-GUARD` before the guard was accepted.

### 5.2 R2 — reading A could leak its standing into reading B on a late completion · BLOCKER

The compound React keys were correct and irrelevant: the state lives in `DevelopRoom`, **above** the
keyed subtree, and a `StandingWire` names an observation key but no reading — so the room could not
detect a mismatch even in principle.

Repaired by making the state itself reading-addressed (`{ state, readingId, … }`) and routing every
completion through a transition that refuses to apply a result to a reading the room has left:
`settleLookup` for lookups, `adoptInto` for recorded events, and `standingView(lookup, readingId,
key)` for reads — where another reading's lookup is **UNKNOWN**, never UNSET and never its value.

**What this invalidated.** The earlier D4 evidence proved only that the rendered component carried a
compound key and that `standingSurfaceKey(A,o1) ≠ standingSurfaceKey(B,o1)`. Neither exercised an
asynchronous completion, and both are now bounded by tests that do — the full sequence is written
out as a falsifier so the dangerous ordering is directly represented rather than argued.

### 5.3 R3 — the graph gate recognised one loading form · REPAIRED BEFORE PR

The walker matched `from '…'` only, so `import()`, `require()`, a side-effect import or a re-export
would have walked past it. That made D5/D6 a convention about syntax rather than the module-graph
architecture they were accepted as. The walker now recognises each form the repository permits, and
each is falsified separately on both directions of the boundary.

Stated exactly: this was **apparatus hardening, not a discovered leak** — no such import existed.

### 5.4 The conflict copy — a small epistemic repair

The row said *"here it is as it now stands"* the moment a conflict returned, and only then began
refetching; if that refetch failed the row went UNAVAILABLE while still claiming to show current
state. `standingRowSentence` now lets the ordinary unknown truth win over any refusal message: a
conflict explains what did **not** happen and never establishes what is. While the refresh is in
flight the row says *"Nothing was overwritten. Reading your standing…"*; if it fails, *"Nothing was
overwritten. Your standing could not be reached."*

### 5.5 Gates after the repairs

```text
persistence falsification    15 checks · 0 failures   (8 deficient variants)
write-boundary falsification 14 checks · 0 failures   (6 deficient variants)
standing gates + contract    37 checks · 0 failures
lib/ + app/ jest             identical failure set to canonical d8fc2082d, verified by stash
npm run typecheck            no regressions (230 vs 239 baseline)
npm run check:no-supabase    clean
```

---

## 6 · Second review 2026-09-06 — the two remaining holes

### 6.1 R2, the late CONFLICT path · BLOCKER

The first repair addressed a late SUCCESS: `adoptInto` refuses an event from a reading the room has
left. It did not address the late REFUSAL. `loadStandings(readingId)` began with an unconditional
`beginLookup(readingId)`, so a stale `stale_expectation` returning from an unmounted A component put
the room into `loading(A)`:

```text
B current and loaded
old A conflict returns → loadStandings(A) → loading(A)
  → B reads UNKNOWN(other-reading)
  → B's own in-flight completion is discarded
  → A settles into the room
```

A could no longer inject its VALUE into B, but it could still take B's state away. The beginning of
a refresh is now reading-addressed exactly as its completion is (`beginRefresh`), and refuses to
start over a different reading; the stale fetch still runs and is discarded by `settleLookup`, which
costs one request and cannot corrupt a state. `beginLookup` remains the transition for a
**deliberate** change of reading, where the room is the one changing it.

Falsified both as a transition (`beginRefresh(heldB, A) === heldB`) and as the full sequence, with a
companion check that a refresh of the CURRENT reading still starts — so the repair cannot be a
refusal to refresh at all.

**What this invalidated.** The earlier R2 evidence covered one of two paths and read as though it
covered the failure. It is now two named falsifiers, success and refusal.

### 6.2 D5/D6 could be bypassed without importing the store · BLOCKER

The import allowlist proved **who may reach `standing/store.ts`**. It did not prove standing was
unreachable: any module could import the generic `query` and name the table itself.

```text
D5  a MAIA helper     → generic query → SELECT … FROM the standing table
D6  a background job  → generic query → INSERT INTO the standing table
```

Neither needs the store, and the accepted claim is stronger than "nobody imports this writer" — it
is that *standing has no ambient route into cognition and the system cannot set it*.

The companion invariant is now stated over the TABLE NAME in executable `app/` + `lib/` (tests
excluded, since they are not the running program and the gates must be able to say the name): only
`lib/manuscript/standing/store.ts` may name it. Both directions are falsified with modules that
import only `query` — and **each falsifier also asserts that the import gate would NOT have seen
it**, so the two gates are recorded as complementary rather than redundant.

---

## 7 · Integration — brought forward to canonical `2732706b6`

Canonical moved during review, and one of its changes is in the same file (`DevelopRoom.tsx`:
BUILD-07D's preparation state, disclosure and member gesture). Merged forward rather than assumed to
compose.

```text
CONFLICT   one hunk, both sides adding room state — kept both
COMPOSED   preparation governs whether the ASK is offered, in the list column;
           standing is a per-observation axis inside an already frozen reading.
           Independent surfaces, independent state, no shared transition.
SCHEMA     canonical touched no migration, no lib/db, no standing module
```

A preparation act changes the LIVE Work, which can move a reading's measured state — that is 07D's
three-state assessment doing its job, and it does not touch standing: a standing is addressed to the
frozen `(readingId, observationKey)` and does not transfer (§3, D4).

Gates on the MERGED program — not the branch alone, per this lane's own lesson that each program is
its own evidence class:

```text
persistence falsification    15 checks · 0 failures
write-boundary falsification 14 checks · 0 failures
standing gates + surface     76 checks · 0 failures
npm run typecheck            no regressions (230 vs 239 baseline)
npm run check:no-supabase    clean
lib/ + app/ jest             failure set IDENTICAL to canonical 2732706b6,
                             measured in a separate worktree at that commit
```

An earlier attempt at that last comparison was invalid — the baseline checkout failed on an
unresolved merge index and both sides were measured from the same tree. It was rerun in a detached
worktree at `2732706b6`. Recorded because a comparison that silently measures itself is worse than
none.

### 7.1 Freshness bring-forward to `df9594592`

Canonical moved again after source acceptance. The intervening delta is one unrelated file:

```text
2732706b6 → df9594592   app/accounted-for/page.tsx   +5 / −5
```

No 07F file, migration, standing module, Develop room or database code is touched, so this is
custody rather than review: merged forward (never rebased — the evidence history is the record of
what was falsified and when), and verified on the resulting head.

```text
GATED TREE        238c9dd47                        (the merge commit itself)
PARENTS           96db26f62  ·  df9594592          (exact, both)
BRANCH HEAD       one further commit — THIS record and the board line, two
                  markdown files, no source or schema byte. A commit cannot
                  name its own SHA; the diff from the gated tree to the head is
                  exactly those two documents, and that is checkable.
07F NET DIFF      16 files against df9594592        (the intended set, unchanged)
NEWLY INCORPORATED app/accounted-for/page.tsx only  (96db26f62 → HEAD)

persistence falsification    15 checks · 0 failures
write-boundary falsification 14 checks · 0 failures
standing gates + surface + evidence gate   254 checks · 0 failures
npm run typecheck            no regressions (230 vs 239 baseline)
npm run check:no-supabase    clean
lib/ + app/ jest             failure set identical to the canonical baseline
                             (measured at 2732706b6; the one-file delta since
                             touches no suite in that set)
```

### 7.2 Freshness bring-forward to `c84bf2d93`

Canonical moved once more. The incoming content is one unrelated document — the fonts sovereignty
acceptance, a lane this unit has never touched and does not import:

```text
df9594592 → c84bf2d93   docs/ops/MAIA_LOCAL_FONTS_SOVEREIGNTY_ACCEPTANCE_2026-09-05.md   +147 / −1
```

No 07F source, schema, Develop surface, database code or programme record moved. Merged forward,
never rebased, and — unlike §7.1 — **this record's own update is inside the merge commit**, so the
gated tree and the branch head are the same object rather than one commit apart.

```text
PARENTS           the §7.1 head  ·  c84bf2d936468bba7fe8f4a1e961f9b1b67c6c07  (exact)
07F NET DIFF      16 files against c84bf2d93        (the intended set, unchanged)
07F SOURCE/SCHEMA untouched by the bring-forward — the merge's only content
                  change is the fonts document above, plus these lines
```

Gates on that head are recorded in the merge commit; the 07F falsifiers and the standing gates were
rerun rather than assumed to carry over from §7.1.

---

## 8 · What this record does not do

```text
no PR · no merge · no deploy · no production migration · no promotion
no closure of BUILD-07F — the founder closes a unit, not a session
no opening of BUILD-07G or 07H
nothing absorbed from the parked ledger
no re-adjudication of Shape B, values, identity, CAS semantics, deletion semantics or D1–D7
```

**The next act is founder review of the integration candidate. PR remains unauthorized until that act.**
