# CMC-001 · Unit 2.5 · TOPOLOGY AMENDMENTS

Three clarifications arising from Unit 2.5 evidence, ruled by founder act 2026-08-12.

These are **corrections to the census topology**, not a new investigative direction and not a mandate amendment. The frozen mandate (`8374f1e9…`) is unchanged; per its own terms any amendment would require a new reviewed object and a new freeze act. These are recorded here, in the evidence ledger, and bind subsequent units.

Referent: `origin/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc`

---

## A-1 · New `route_status` value: `REFUSED_DISABLED`

§VII's `route_status` enum gains:

**`REFUSED_DISABLED`** — code exists and is URL-addressable, but the executable route intentionally terminates before its legacy implementation can run.

Distinct from `REGISTERED_DORMANT`, which means registered-but-unused. A refused lane is *reached* and *declines*. The distinction matters because a dormant route's machinery could still execute; a refused lane's cannot.

First and only instance at this referent: `app/api/oracle/conversation/route.ts`, hard 410 as the first executable statement of `POST` (`:433-453`), per Sanctuary S2 / ruling K4 (2026-07-17), proven first-in-order by refusal `R19`.

Consequence: the ~20 memory-substrate entries below the refusal (`memoryPalaceOrchestrator`, `sessionMemoryServicePostgres`, `getRelationshipAnamnesis`, spiral state, `logMaiaTurn`, `storeCMLayerSignal`) are **unreachable from HTTP** and are not a live parallel memory architecture. They remain in-tree pending an S5 delete-vs-revive decision.

---

## A-2 · Admit attempted-ingress topology

Admitted into the evidence topology:

```
app/maia/page.tsx:1653  →  WeekZeroOnboarding  →  POST /api/oracle/conversation  →  410
```

This proves **attempted ingress** by a member-facing surface, even though it never successfully reaches MAIA. Gated at `app/maia/page.tsx:588` for first-time named members.

Also attempting the refused lane: `components/masters/FieldMaiaCompanion.tsx:173` (via `app/fields/[field]/maia/page.tsx`), `app/partners/onboarding/prelude/page.tsx:556`, and two `/labtools` pages.

Attempted ingress is topology. A census that records only successful ingress cannot see a surface that is trying to reach MAIA and failing.

---

## A-3 · Split the registry claim into two statements

§I recorded one registry sentence — *"Primary sovereign chat ingress — all production surfaces"* — that was doing the work of two claims. They are now separated:

**Successful-ingress claim.** `/list` is the canonical route through which production surfaces successfully reach `getMaiaResponse`.
Status: **SURVIVES** at this referent. `MAIA_ROUTE_REGISTRY`'s own docblock scopes it to `getMaiaResponse()` callers, so the Oracle lane's absence from the registry is in-scope-correct, not an omission.

**Attempt claim.** No other client surface attempts another ingress.
Status: **FALSIFIED.** Five client surfaces attempt the refused Oracle lane.

Forcing one sentence to carry both meanings is what made the Oracle route look like either a registry failure or a hidden architecture. It is neither.

### Stale supporting surfaces — recorded, not corrected (§XIX)

| Surface | Condition |
|---|---|
| `lib/maia/maiaRuntimeContext.ts:61-63` | Rationale comment *"every production surface routes here"* (2026-05-23) is stale as a code claim. `SURFACE_SUBSTITUTION` risk for any future reader. |
| `docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md:194-208` | Still classifies the Oracle lane `dormant`, contradicting the same document's Status Key, where `disabled` = "Returns error code; intentionally closed." |

Neither is repaired. Both are evidence that documentation drift, not architecture, produced the apparent contradiction.

---

## Effect on Units 1–2

**None.** Units 1 and 2 remain valid. They describe the successful-ingress architecture, which is the whole of what successfully reaches MAIA at this referent.

## Effect on Unit 3

**Unblocked.** The refused lane is classified and is not a second live memory architecture. Unit 3 proceeds with its original scope: CORE prompt survival, DEEP continuity survival, profile semantics.
