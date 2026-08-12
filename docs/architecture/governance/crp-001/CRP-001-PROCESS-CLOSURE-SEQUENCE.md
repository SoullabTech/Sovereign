# CRP-001 — PROCESS CLOSURE SEQUENCE

**Authored:** 2026-08-12 by Founder
**Status:** step 1 done; steps 2–6 open
**Standing instruction:** **Do not repair MAIA yet.** The process closes
before the product is touched.

---

## The sequence

**Revised by founder 2026-08-12.** Custody and the chain registry were
promoted out of "enforcement" into steps of their own, because each is a
prerequisite the validator cannot be written without.

| # | Step | Owner | State |
| --- | --- | --- | --- |
| 1 | Freeze `CRP-001-UNIT-RETURN-SCHEMA-v1` as candidate house schema | assistant | **DONE** — sha256 `fac499a6…`, `CRP-001-SCHEMA-FREEZE-RECORD.md` |
| 2 | Founder rulings **C1–C4** | founder | **CLOSED 2026-08-12** — `CRP-001-STEP2-RULINGS.md` (C1=D2, C2=N/A, C3=F1 bound prospectively, C4=G2) |
| 3 | Rule canonical custody / home for CRP governance objects | **founder** | **NEXT — everything blocks here** |
| 4 | Define + freeze the **chain registry** | — | OPEN, blocked on 3 |
| 5 | Implement validator / enforcement | — | OPEN, blocked on 4 |
| 6 | Run adversarial conformance suite | — | OPEN, blocked on 5 |
| — | First MAIA repair unit | — | BLOCKED on 1–6 |

Step 2 carries three attached items:

- the **evidence-window principle** — ACCEPTED, house law;
- the **longitudinal minima** — PROVISIONAL, to be ruled or revised;
- **C4 moved forward** — it now precedes witness design, not follows it.

---

## Step 3 — enforcement rejects a unit lacking

- referent;
- instrument / version;
- positive control;
- negative control;
- well-formed adjacent crossing;
- non-empty `does_not_establish`;
- non-empty counterevidence;
- any downstream crossing (no skipping);
- **evidence window meeting the crossing's minimum** (schema §2.6).

The last is new with §2.6 and is what makes step 5's seventh test case
mechanically decidable.

## Step 4 — auto-derivation, with the constraint it carries

The validator derives the required `does_not_establish` crossings from the
declared proven crossing, so the executor is not relying on memory for all
five. Correct, and it removes the most likely honest omission.

**Constraint:** auto-derivation needs a **chain registry**, not one hardcoded
chain. The §2.4 nine-state chain is not the only one — mandate §9 declares the
correction chain (`OLD CLAIM → MEMBER CORRECTION → CORRECTION EVENT → …`), and
§2.3 permits a unit to declare a substrate chain in its own IDENTITY. A
validator that knows only the §2.4 chain will either reject valid correction
units as malformed, or pass them without deriving anything.

So step 4 has a prerequisite: **the set of declarable chains must be
enumerated and frozen** the way the stage vocabulary was. Unit-declared
substrate chains (§2.3) then need a rule — registered in advance, or declared
per unit and validated structurally.

**Unruled.**

## Step 5 — the conformance suite

Each must be rejected mechanically, not by a reader noticing:

1. skipped `ASSEMBLED`
2. `FINAL PROMPT` alias
3. missing negative control
4. `counterevidence: none`
5. `RETRIEVED → FINAL MODEL REQUEST` (non-adjacent)
6. unbound referent
7. claim of experienced continuity from one exchange

These are the protocol's own positive/negative controls. The suite tests the
validator, not MAIA — the same admissibility question §16 asks of every
instrument, turned on the process itself: *can it detect a known-bad return
and pass a known-good one?* A validator that has not been shown to do both is
INADMISSIBLE, and enforcement is not closed.

---

## The methodology's first demand on the product

The first MAIA build is **the witness**, not a ranking tweak.

```text
candidate identity
      ↓
RETRIEVED
      ↓
SELECTED
      ↓
ASSEMBLED
      ↓
FINAL MODEL REQUEST
```

— with candidate and provenance identity preserved unbroken across every
boundary.

This is forced, not chosen. Schema §2.4's candidate-bound participation makes
`ASSEMBLED → FINAL MODEL REQUEST` provable only if candidate identity survives
into the request. Without it there is no negative control for that crossing,
so it is INADMISSIBLE TO TEST, so every crossing downstream of it is
unreachable — `USED`, `OBSERVABLE IN RESPONSE`, and `EXPERIENCED CONTINUITY`
all sit behind it.

Mandate §5 already ordered the witness first. What has changed is that it is
now *derived* rather than asserted: the return schema will not permit the
downstream claims until the witness exists.

> The methodology is telling us what instrumentation must exist before it
> permits us to repair the product.

Note the ordering consequence for C4: the witness is the first build, and C4
(may the witness run on member traffic, or founder/synthetic only?) governs
what it may observe. **C4 is not a later question. It scopes step 6's first
unit.**

---

## Definition of operational

When C1–C4 are settled and enforcement passes its own conformance suite, the
JARVIS repair process is **operational**. MAIA is then repaired through it,
crossing by crossing, with no broad claim permitted to outrun its evidence.

Not before.
