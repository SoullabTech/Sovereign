# WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · implementation witness

> **Written from the branch candidate, bound to canonical `d8fc2082d`. This record reports what was
> built and what was observed. It closes nothing: BUILD-07F is NOT CLOSED, no PR is open, nothing
> is deployed, and no production database has been touched.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
CANONICAL        d8fc2082d
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

`D3-DELETE-GUARD-UNCONDITIONAL` exists because the deletion ruling has two sides. Without it, a
guard that over-refuses — one that would block the writer's own deletion of their Work — looks
identical to a correct one.

**Migration as written: `12 checks · 0 failures`.**

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
```

The D6 allowlist assertion was **also observed red for real**: before the route existed it reported
`[]` against an expected `[the standings route]`. `31 checks · 0 failures` after the route landed.

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
                                   whole-Work cascade permitted — both directions exercised
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

## 5 · What this record does not do

```text
no PR · no merge · no deploy · no production migration · no promotion
no closure of BUILD-07F — the founder closes a unit, not a session
no opening of BUILD-07G or 07H
nothing absorbed from the parked ledger
no re-adjudication of Shape B, values, identity, CAS semantics, deletion semantics or D1–D7
```

**The next act is founder review of this record and of the branch candidate.**
