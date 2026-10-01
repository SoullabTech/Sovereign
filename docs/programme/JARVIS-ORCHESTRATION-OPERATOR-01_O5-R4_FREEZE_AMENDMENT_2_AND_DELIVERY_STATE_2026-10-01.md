# JARVIS O5-R4 — Freeze Amendment 2 (E9 discrimination) · Production delivery state

**Date:** 2026-10-01 · **Base:** canonical `9c608128361eadd2e6ba2c6c1371353bdb0d7ebe`
**Standing:** Amendment 2 recorded · laws R4-E1…E9 unchanged · ⚠️ **no affected lane receives any consequence finding in the running system** · ⛔ runtime delivery not authorized · ⛔ durable lane inbox not authorized

---

## 1. Why this amendment exists

Amendment 1 added R4-E9: *a lawful consequence finding projects as evidence to exactly its affected lane and nowhere else.* It recorded one defeat candidate, DC-E9, which never projects at all.

R4-E9 already rejected four other wrong designs, but only a disposable probe from a single session showed it. Because nothing on record exercised the clause "exactly … and nowhere else", the following weakening would have kept the recorded matrix green:

> R4-E9′ — *a projection was returned* (something was sent)

**Demonstrated, not argued.** I placed a copy of the suite beside the real one, replaced R4-E9 with R4-E9′, ran the matrix, and deleted the copy. Results:

| Candidate | Under R4-E9 (frozen) | Under R4-E9′ (weakened) |
|---|---|---|
| DC-E9 no projection | KILLED | KILLED |
| DC-E9b wrong lane (`lane-c`) | KILLED: `target lane-c != lane-b` | **SURVIVED** |
| DC-E9c broadcast (`*`) | KILLED: `target * != lane-b` | **SURVIVED** |
| DC-E9d authority field beside evidence (`grant`) | KILLED: `projection carries grant` | **SURVIVED** |
| DC-E9e ordinary finding projected cross-lane | KILLED: `ordinary finding projected cross-lane` | **SURVIVED** |

The weakened run also reported an R4-E8 failure. That failure is unrelated to E9. E8 runs a repo-relative caller scan, and the copy ran from a different working directory.

With the four candidates committed, any edit that weakens E9 toward "something was sent" now turns the matrix red.

## 2. What changed

- `tests/constitutional/jarvis-o5-r4/candidates.mjs`: DC-E9b, DC-E9c, DC-E9d and DC-E9e were added. Each one wraps the reference projection and introduces exactly one error.
- `tests/constitutional/jarvis-o5-r4/FREEZE.json`: Amendment 2 records the previous and new candidates hashes, `2acd245a…` → `c822a9d3…`. Amendment 1's text is byte-identical.

**Unchanged:** `contract.mjs`, `substrate.mjs`, `reference.mjs`, `falsifiers.mjs` (so laws R4-E1…E9 are unchanged), and every runtime file.

## 3. Verification

- `node tests/constitutional/jarvis-o5-r4/matrix.mjs` → 9/9 reference PASS · 13/13 candidates KILLED · **LETHAL + DISCRIMINATING**
- `node scripts/verify-jarvis-o5-r4-freeze.mjs` → **FREEZE INTACT**. Lethal both ways: appending one line to candidates gives `exit 1`; restoring it gives INTACT.

## 4. Production delivery state

This is a gap, and the green checks above do not cover it, so it is stated here plainly.

- `scripts/builder/o5-consequence-finding-projection-v1.mjs` (`projectConsequenceFindingV1`) is a pure function. **It has no runtime caller.** Its only importer is `jarvis-desktop/test/o5-r4-evidence-return.test.mjs`.
- R1-F6 and R4-E9 both prove delivery only into synthetic lane maps (`makeWorld()` / `makeLaneWorld()`).
- **So in the running system, an admitted consequence finding is recorded in W4 and reaches no affected lane.** Nobody receives it.

This is lawful, because no frozen law demands runtime delivery. It is not a capability. "Implementation canonical" means a lawful projection exists and is uncalled. It does not mean findings are delivered.

### 4a. Nothing produces a consequence finding either

A follow-up census on canonical `8f8ba73b83397c716722c7c9f5835c02d131cae8` searched for runtime producers. In `jarvis-desktop/src`, `scripts`, `lib` and `app`, outside tests, **no code appends a W4 `finding` of any shape.** The only runtime callers of `appendLedgerRecordV2` write `model_identity`, `artifact`, `test_result` and `verifier_result`.

So the non-delivery is total in both directions. Production has no consequence findings, so none are undelivered today. The admission path and the projection are law-complete and unused.

### 4b. Could a projectable finding be safety-relevant?

This is asked so that a lane finding that means "a member could be harmed" is not left in a channel that delivers to no one, which is the crisis-pipeline pattern.

- **By domain, no.** `affected_lane` names a JARVIS programme lane: development Work Units orchestrated on the founder's workstation. The W4 ledger lives in the delegation home, not in MAIA's database. A finding is evidence about development work, for example "identity resolution now differs". It is not a member's state.
- **By current fact, vacuously no.** Nothing produces findings (§4a).
- **⚠️ By enforcement, nothing excludes it.** `reason` is free text, and `urgency` admits `high`. The schema cannot stop a future producer from writing "this change would expose member data" into a channel that reaches no one. So "not safety-relevant" holds by domain and by absence, not by construction.

## 5. Open founder question (not answered here)

> Is it acceptable, for now, that findings about a lane reach no one in production?

- **If yes:** this record stands as the declared known non-delivery state, and the durable inbox stays unauthorized.
- **If no:** the next act is a runtime caller with an **ephemeral** delivery path, scoped by its own law and falsifiers. That law has to stop the path from becoming the durable inbox by accretion, for example through persistence or retention across restarts.

Until the founder rules, nothing is wired and the non-delivery state in §4 is the current truth.

A recommended condition for **yes**, not ruled: consequence findings are not a safety channel. A concern about member harm must go through a path that delivers to a human, never only into a W4 finding. Recording that rule keeps the domain argument in §4b true once producers exist.

This state is line 5 of `docs/ops/NON_DELIVERY_REGISTER.md`.
