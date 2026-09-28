# Practitioner Inference Containment — 2026-08-06

**Status:** ✅ **CONTAINMENT EXECUTED.** Founder ruling 2026-08-06, implemented same day.
**Scope:** ⛔ **Containment only. This is NOT the authority model.** It closes live read paths; it
rules nothing about what the boundary should ultimately be.
**Implemented at:** `f5c5b7ab9` (branch `feature/labtools-redesign`) · ⛔ **not yet merged, not deployed.**

---

## The principle this enforces

> ⭐ **Visibility, acknowledgment, confidence, recurrence, and professional role never create
> authorship or permission.**

> ⭐ **Everything crossing from a person's sovereign field into a shared developmental commitment
> must be an explicit declaration by that person — never an observation, inference, score, pattern,
> telemetry event, or system-authored claim.**

---

## What was contained

### 1. Pattern Ledger practitioner read path — **fail-closed**

The live path, before:

```
system inference (lib/patterns/PatternDetectionService.ts)
  → pattern_ledger  (status: emerging | offered | confirmed | partial | active)
  → GET /api/studio/clients/[id]/pattern-ledger   WHERE member_id = $1
      weightedScore = avgSig*0.4 + maxSig*0.2 + log(count+1)*0.25 + recency*0.15
  → PatternLedgerEvolutionPanel  ("Growth Edge", recurrence counts, score badges)
  → app/studio/clients/[id]/page.tsx   ← the practitioner's client page
```

Simultaneous violations: declaration-not-observation · member authority over recognition · no
practitioner access to system-inferred developmental claims · no scoring or ranking of development ·
practitioner may not sit upstream of the member's recognition. The `status='emerging'` rows made the
last one literal — the system was telling the practitioner something about the member **before the
member had been offered the recognition at all.**

**Containment ruling applied:** no `pattern_ledger` row may render on a practitioner-facing client
surface unless the member has explicitly declared that exact object into the shared commitment. No
such crossing mechanism exists, so **the honest immediate state is absence.**

**[O] Implementation** — [`route.ts`](app/api/studio/clients/[id]/pattern-ledger/route.ts): the
guard returns `{ patterns: [], containment }` **before the query runs**. No read, no scoring, no
row leaves the database. The query body is left in place, unreachable, so the shape of what was
being surfaced stays legible for the ruling.

⛔ Labels were **not** softened. Scores were **not** hidden while keeping the claims. **No data was
deleted** — the substrate is preserved for investigation.

### 2. Panel no longer reports containment as emptiness

**[O]** The panel's empty state said *"No patterns recorded yet."* Under containment that asserts
something we have not established and can no longer see. A separate branch now renders the
containment reason. ⛔ Pinned against collapsing the two branches.

### 3. `studio_field_signals` barred from consultation composition

Both `POST /api/studio/changes/[id]/consult` and `.../decisions/[id]/consult` were loading the whole
table into `DecisionInputBundle` → `consultChangeCouncil` → `buildChangeQuestion`.

**Interim invariant:** a field signal may not enter practitioner consultation unless it is
practitioner-**authored** and practitioner-private.

| `source` | Disposition | Why |
|---|---|---|
| `'client'` | ⛔ refused **categorically** | member material crossing without declaration |
| `'maia'` | ⛔ refused **categorically** | system-authored claim; acknowledgment ≠ authorship |
| `'practitioner'` | ⛔ refused **for now** | `source` is a *category*, not a *provenance* |

The third row is the subtle one and the reason the filter returns empty rather than filtering:
**no column establishes that a `'practitioner'` row was authored BY the practitioner rather than
attributed TO them by the system.** Existing rows are therefore ambiguous, and the ruling is
explicit — ambiguous rows must not be reinterpreted as safe.

**[O] Implementation** — [`inferenceContainment.ts`](lib/studio/containment/inferenceContainment.ts).
`admitFieldSignalsForConsult()` is kept as a function rather than deleting the call sites, so the
admission rule has one home when the authority model lands and the refusal stays visible at every
call site. `isCategoricallyRefusedSource()` records that `client`/`maia` stay refused *even after*
a provenance column re-opens `practitioner`.

**Practitioner observations are unaffected.** `studio_practitioner_observations` is
practitioner-authored, practitioner-private, no system authorship, no score — it still reaches the
council. That is the substrate the ruling found healthy.

### 4. Observation substrates NOT merged

Per the ruling: the missing bridge between `studio_practitioner_observations` (pre-crossing) and
`member_memory_atoms` + facilitator provenance (post-crossing) **may be the correct boundary.** No
automatic bridge until a declared crossing gesture exists. ⛔ Their separation is protective; do not
reconcile by merging.

---

## Evidence

**[O]** `__tests__/practitioner-authority-boundaries.test.ts` — **23 pins, all green.**

| Pin | Holds |
|---|---|
| **1** | `/api/caseload` is not a MAIA context source (4 assertions, clean) |
| **2** | `practitioner_growth` quarantined — 2 files, no generator, no UI |
| **3** | member private material does not reach practitioner-development surfaces |
| **4** | `pattern_ledger` crossing recorded — one baselined violation, may shrink, never grow |
| **5** | the containment is **in force** — fail-closed before read; both consult routes filtered; module admits nothing; `client`/`maia` categorically refused; panel does not report containment as emptiness |

```bash
npx jest __tests__/practitioner-authority-boundaries.test.ts
```

⚠️ PIN 4's suite is green *because one violation is baselined*, not because the tree is clean.
⛔ Never resolve a failure by editing an allowlist.

---

## What is NOT done

- ⚠️ **[I] Production data unverified.** Schema, routes and UI were read; live `pattern_ledger` row
  counts were not. `SELECT status, count(*) FROM pattern_ledger GROUP BY 1;`
- ⛔ **Not merged, not deployed.** The violation is closed on this branch only. Production still
  renders the panel until this ships.
- ⛔ **§7 not ruled.** The four-part crossing rule and the three MAIA-awareness classes (A: state of
  Larry's own offering · B: member declaration about an offered object · C: pattern claim about the
  member) are stated in the founder's message and not yet written into canon.
- ⛔ **Supervision unruled** — a fourth party with its own relationship, disclosure boundary, and
  possibly regulated obligations. ⛔ Must not be modelled as `practitioner_role + extra read access`.
- ⛔ **No crossing mechanism designed.** Deliberately. The gesture that changes authority state is
  defined *after* §7 is ruled, not before.
- ⛔ **No Wisdom-room design.** Explicitly deferred behind all of the above.

---

## Preserved for the ruling

Nothing was deleted. Available as evidence when §7 is ruled:

- `pattern_ledger` rows, and the unreachable query showing exactly what was surfaced
- `studio_field_signals` rows, including `source='maia'` entries and their `intensity` scores
- `practitioner_growth` schema + endpoint (quarantined, no generator)
- `session_insights.insight_type` values `blind_spot` / `growth_edge` / `strength_spotted` / `practitioner_pattern`
- `member_memory_atoms.epistemological_status = 'inferred'` — permitted by the column, unused by the only writer
