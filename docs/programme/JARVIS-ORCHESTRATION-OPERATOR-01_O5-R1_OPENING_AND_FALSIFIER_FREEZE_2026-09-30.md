# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R1 — Opening Ruling + Falsifier Freeze

**Date:** 2026-09-30
**Opening canonical:** `04005ca7c65c8cdc1420d482710a50ea0c3b8f68`
**Instrument commit (freeze_commit):** `af2f0203d38fd3249260aebd0082de90b81b5334`
**Predecessor:** `SOULLAB-JARVIS-015_ORCHESTRATION_DELEGATION_RECOVERY_CROSSWALK_2026-09-30.md`
**Class:** B — Structural Risk
**Standing:** O5 OPEN · R1 FALSIFIERS FROZEN · ⛔ NO O5 IMPLEMENTATION

## 1. Founder ruling (verbatim)

> **RULING — OPEN O5**
>
> O5 is opened for Execution Continuity & Recovery.
>
> O5-R1 is limited to:
> checkpoint/resume, failure-cause classification, `finding` and `proposal` ledger evidence, and non-authoritative cross-lane consequence findings.
>
> Existing O0–O4 and W0–W5 vocabulary remains canonical. R1 must extend those structures rather than parallel or rename them.
>
> Executor-generated proposals have evidentiary standing only. They may enter O1 as candidate operator intent; only the founder/operator may convert them into work or authority.
>
> No O7 founder-inbox behavior and no O8 semantic-merge behavior are admitted by this opening.

**Boundary:** *O5 does not introduce a new orchestration model. It makes the existing
authorized execution substrate survivable across interruption, classifiable in
failure, and capable of returning evidence without silently acquiring authority.*

**Governing sentence:** ⭐ ***Recovery preserves lawful consequence, not merely computational position.***

## 2. The instrument

`tests/constitutional/jarvis-o5-r1/` · plain Node ESM, no dependencies, runs anywhere Node 22 runs.

| File | Role | Frozen |
|---|---|---|
| `contract.mjs` | vocabulary only: O0 gates (reused), `EFFECT_PHASES`, `CAUSES` + `CAUSE_RESPONSE`, evidence kinds, the closed consequence-finding field set, the `ContinuityDecisions` seam | ✅ |
| `substrate.mjs` | deterministic simulated world: one authorized unit, N steps, one external effect per step with world-issued receipts; four crash points; faithful plan application; a deliberately naive downstream consumer | ✅ |
| `falsifiers.mjs` | F1…F8 | ✅ |
| `reference.mjs` | conforming test double (⛔ never a seed) | ✅ |
| `candidates.mjs` | DC-1…DC-9 | ✅ |
| `matrix.mjs` | runner: lethality + classification | ⛔ deliberately not |
| `reference-cause-map.mjs` | illustrative code→cause map | ⛔ deliberately not (§5) |

Commands: `npm run matrix:jarvis-o5-r1` · `npm run verify:jarvis-o5-r1-freeze`.

### Idempotence boundary (the only new state vocabulary)

The founder's sequence *intended → authorized → dispatched → effect witnessed → ledgered*
has no existing per-effect equivalent in W2/W4 (W2 governs the unit, W4 records
after the fact), so R1 adds it as a checkpoint axis. *Intended* lives in O1/O2 and
is not a checkpoint phase. `dispatched` is written **before** the effect is sent:
it means *may have happened*. A resume may re-send an effect only when a probe
proves it **ABSENT**; **UNKNOWN** gates to `BLOCKED_BY_EVIDENCE`.

## 3. Falsifiers

| # | Kills | How it is observed |
|---|---|---|
| **F1** Restart-from-zero | interruption discards lawful completed progress | clean-boundary crash must RESUME; every effect sent exactly once, every step ledgered exactly once |
| **F2** Blind resume | trusting checkpoint over live authority | six cases must GATE and send/ledger nothing: core re-scoped · unit withdrawn · canonical tip moved · checkpoint claims a **wider** core (validly resealed) · seal broken · foreign unit |
| **F3** Dead checkpoint | written, never consumed | resume must read the checkpoint |
| **F4** Error flattening | cause replaces the specific code | every live `failure_class` code (**47**, parsed from the three runtime sources — ⚠️ **SUPERSEDED 2026-09-30 by the O5-R2 census §5.1: the true live count is 63; the extractor misses 16 routed through `DELEGATE_EXIT_FAILURES` and thrown `error.code`. The law stands; the instrument's reach was narrower than claimed.**) keeps its code, maps to one of seven causes with the lawful response, carries no authority; an unknown code **fails closed** (`cause: null · STOP`) |
| **F5** Evidence escalation | proposal/finding becomes O2 work or O3 authority | O2 and O3 digests unchanged; ledgered as `proposal`/`finding`; a proposal surfaces as exactly one O1 `CANDIDATE` with empty grants; a finding never does |
| **F6** Cross-lane write leakage | a finding carries mutation into another lane | 16 forbidden fields + one unlisted field each **explicitly refused**; lawful finding admitted with a closed field set and reaches the lane's inbox; the naive consumer writes nothing |
| **F7** Cosmetic recovery | reads the checkpoint, reconstructs from the original unit | continuation state must equal the lawful pre-interruption history, across two independent histories (salts) and two crash depths |
| **F8** Effect repetition | resume from "step N" repeats a completed consequence | (a) witnessed-not-ledgered → recorded once with the **witnessed** receipt · (b) sent/PRESENT → recorded, not re-sent · (c) sent/UNKNOWN → GATED, not re-sent · (d) never-sent → sent once · (e) sent but proven ABSENT → lawful re-send, lands once |

⭐ **F3 vs F7, as ruled**: F3 proves the checkpoint is *read at all*; F7 proves it is
*constitutive of continuation*. DC-4 passes F3 (it reads) and dies only on F7.

⭐ **F8 is its own falsifier rather than folded into F1**, because DC-8 (step-N
resume) passes F1 at a clean boundary and dies only when interrupted between
effect and ledger — the classic recovery hazard checkpointing alone does not solve.

⭐ **F8 (d) and (e) are positive controls** so the suite cannot be satisfied by
never re-sending anything, and **DC-9** proves the safety falsifiers cannot be
satisfied by refusing to recover at all.

## 4. Matrix result (run in-session, Node v22.22.0, exit 0)

```
Reference double: F1…F8 all PASS
DC-1 restart-from-zero      → KILLED on F1  (+F7, +F8 CLASSIFIED)
DC-2 blind resume           → KILLED on F2
DC-3 dead checkpoint        → KILLED on F3  (+F2, +F8 CLASSIFIED)
DC-4 cosmetic recovery      → KILLED on F7
DC-5 error flattening       → KILLED on F4
DC-6 evidence escalation    → KILLED on F5
DC-7 cross-lane leakage     → KILLED on F6
DC-8 step-N resume          → KILLED on F8
DC-9 inert caution          → KILLED on F1  (+F7, +F8 CLASSIFIED)
MATRIX LETHAL + DISCRIMINATING
```

Every falsifier is the named killer of at least one candidate. Six of nine
candidates die on exactly one falsifier. The three with collateral are
**irreducible** (removing the collateral would un-make the candidate's error):

- **DC-1**: restarting necessarily reconstructs state from the origin (F7) and re-sends the in-flight effect (F8).
- **DC-3**: a checkpoint never read cannot be found corrupt, foreign or over-wide (F2); the ledger cannot see an effect sent-but-not-ledgered, which is exactly what the checkpoint carries (F8).
- **DC-9**: a supervisor that never continues carries no state forward (F7) and leaves a witnessed effect permanently unrecorded — consequence lost (F8).

### Anti-vacuity checks (disposable probes, run in-session, ⛔ not the record)

- The code inventory includes the two ternary-emitted codes (`WORKER_TIMEOUT`, `TRANSPORT_UNREACHABLE`) and `RUNTIME_STOPPED_MID_RUN`, and **excludes** lifecycle words (`FAILED`, `VERIFIED`) that share lines with `failure_class`.
- Each crash point leaves exactly the intended phase (`before-dispatch→authorized · after-dispatch→dispatched · after-witness→effect_witnessed · after-ledger→ledgered`) with the expected send count.
- Each candidate dies for its **stated reason**, not by throwing (e.g. DC-8: `effect e1 sent 2×`; DC-4: continuation missing the pre-crash receipts).
- Removing one code from the cause map turns F4 red (`WORKER_TIMEOUT: cause null not one of the seven`) — completeness bites.

### Freeze guard proven lethal both ways

`INTACT → exit 0` · a comment line appended to `falsifiers.mjs` → `FREEZE VIOLATED (1) → exit 1` · restored → `exit 0`.

## 5. Two deliberate choices, stated

1. **The cause map is not law.** F4 freezes totality, preservation, fail-closed
   unknowns and the cause→response table — ⛔ not which cause any one code has.
   The map lives outside the frozen set so that a **new runtime failure code**
   (which turns the matrix red until mapped, by design) is answered additively.
2. **Lethality is decision-level**, ⛔ not implementation-independent. Every
   candidate is the reference with one decision replaced on an identical
   substrate — the review-custody precedent, and the narrower claim on purpose.

## 6. Known limits (carried, not resolved)

- **The integrity seal detects corruption, not an adversary** who can write the
  store. F2's "wider core, validly resealed" case is caught by comparison with the
  **live W2 guard**, not by the seal — which is the point: authority is re-derived,
  never read back.
- **F6 is structural.** `reason` is free text; no mechanical test can prove prose
  carries no *implied* instruction. The guarantee is that nothing executable
  crosses and the admitted field set is closed. Whether a free-text instruction
  is ever acted on downstream is ⚠️ **unknown — requires human witness**.
- **Probe semantics are assumed.** The substrate's probe is authoritative
  (PRESENT/ABSENT/UNKNOWN). Real effects (git push, provider call, file write)
  need a per-effect probe whose truthfulness is itself evidence the
  implementation must earn; an effect with no probe must be treated as UNKNOWN.
- **Concurrency is not modelled.** One resumer at a time is assumed. Two
  resumers racing one checkpoint is an implementation obligation (the deploy
  lane's flock and S3's atomic-claim precedent are the prior art) — ⛔ not proved here.

## 7. Owed next — ⛔ not started

- O5-R1 implementation written **to** this frozen suite: the conforming decisions
  must be wired into the real runtime (~~`reconcileOrphanedRuns()` is F1's DC-1 in
  production today~~ — ⚠️ **SUPERSEDED by O5-R2 census §1: it has no caller; the live behaviour is a silent orphan, and even if called it would be DC-9-like, not DC-1**), W4 gains `finding`/`proposal`, and the matrix must run
  against the real decisions, not the double.
- A real-effect probe inventory (§6).

**Standing: O5 OPEN · R1 SCOPE = 4 GAPS · FALSIFIERS F1–F8 FROZEN @ `af2f0203` ·
MATRIX LETHAL + DISCRIMINATING · FREEZE GUARD PROVEN · ⛔ NO IMPLEMENTATION ·
⛔ O7/O8 NOT ADMITTED · ⛔ NO RUNTIME FILE MODIFIED · PRODUCTION UNTOUCHED.**
