# W4-2 · PROTECTED-DATA PREFLIGHT — DISPOSITION

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-15
**Authorized by** founder act — record-only commit of the disposition as adjudicated
**Instrument** `scripts/witness/w4-2-2-protected-preflight.sql`, run **unchanged**
(byte-identical to the sealed original at `2c152e54`; `sha256` begins `2b728796add10400`)
**Carrier** `b52807fa` · **Re-cut** `c640561d`
**Class** ⛔ **RECORD ONLY.** Nothing implemented, executed, merged or deployed.

> ⭐⭐ **THE RESULT IN ONE LINE:** the protected database is not ready for W4,
> because an upstream schema layer has not reached production. ⛔ **That is not
> a W4 failure and not a data problem** — it is W4 correctly discovering a
> prerequisite before anything touched production.

---

## 1. The run

⭐ **Executed by the founder from the Mac Studio**, against the protected
database — not from the lane's container, which has no protected access at all
(verified there: no `DATABASE_URL`/`PG*`, no `ssh` binary, empty `~/.ssh`,
`minisforum` does not resolve, `192.168.0.104:22` unreachable, no local `:5432`).

```
ssh soullab@minisforum → docker exec maia-postgres
database maia_consciousness · READ ONLY transaction · COMMIT
```

⛔ **The lane's earlier `NOT RUN` is WITHDRAWN as the act's result.** It described
the container only, and is superseded by the founder execution. ⛔ It is not
deleted from this record: a `NOT RUN` scoped to an environment is a true
statement about that environment, and remains one.

### ⚠️ Evidence classes, kept separate

| sections | class |
|---|---|
| **§§5–7** | ⭐ **VERBATIM.** Literal terminal output pasted into the lane session and read directly there. |
| **§§1–4** | ⭐ **TERMINAL-WITNESS, FOUNDER-ATTESTED.** The founder recovered the literal scrollback from **Terminal window 2** — database identity, migration ledger, catalogue and invariants — and attests it. ⛔ The literal text was **not** brought into the lane session; what reached it was a prose summary of that reading. |

⛔ **This record does not reproduce §§1–4 and must not be read as doing so.** The
artifact is the scrollback at Terminal window 2. ⭐ The distinction is kept
because this programme's standing rule is that a reading is classed by who read
it, and the honest upgrade is from *prose summary* to *attested literal reading*,
⛔ not to *observed in-lane*.

---

## 2. Disposition, condition by condition

| # | condition | disposition |
|---|---|---|
| 1 | subject — `maia_consciousness`, READ ONLY in effect | ✅ **PASS** |
| 2 | schema readiness — succession / editorial layer present | ⛔ **FAIL · PREREQUISITE ABSENT** |
| 3 | `ask_threads.proposal_chain_id` present | ⛔ **ABSENT** |
| 4 | XOR violations · reading collisions · existing editorial threads | ⚠️ **NOT MEASURABLE** |
| 5 | sizing for the unique-build lock ruling | ✅ **PASS** |
| 6 | required UNIQUE targets not already present · no INVALID indexes | ✅ **PASS** |
| 7 | nothing authorized beyond protected read | ✅ **PASS** |

**Present:** `ask_threads` · `ask_turns`.
**Absent:** `proposal_chain_id` · `proposal_chains` · `proposal_versions` ·
`proposal_chain_directions`.
**Ledger — both prerequisite migrations ABSENT:** `20260914000001_proposal_succession.sql` ·
`20260914000005_editorial_ontology.sql`.

⭐⭐ **`NOT MEASURABLE` IS THE INSTRUMENT WORKING, NOT FAILING.** Its governing
rule — *an absent schema is `NOT MEASURABLE`, never zero* — is the whole
difference between this outcome and the dangerous one, in which a reader sees
`0 violations` and concludes the data is clean when the column was never there
to violate anything.

⭐ **§5 re-earns Option A on today's reading**, satisfying §32's dated caveat
rather than assuming it: `ask_threads` 8192 bytes heap, `ask_turns` 24 kB,
**72 kB total each**. ⚠️ Both `NEVER ANALYZED`, and the instrument correctly
declines to read a missing planner estimate as *empty* — `reltuples = -1` is
**unknown**. ⭐ That is why sizing (`pg_total_relation_size`) and integrity
(`COUNT(*)`) are separate instruments and are not substituted for one another.

⭐ **§6 confirms §32's other prediction**: the two live relations carry only
their primary keys, so none of W4-S2's four UNIQUE targets pre-exists; the other
two target relations do not exist at all. Zero INVALID indexes.

---

## 3. ⭐⭐ The consequence is sharper than "premature"

W4-S1's CHECKs **name `proposal_chain_id`**. Against protected production that
column does not exist, so:

> ⛔ **W4-S1 would not merely fail to validate — it would ERROR on an undefined
> column and create nothing.**

⛔ There is therefore **no W4 data question to ask yet**, and §4 is `NOT
MEASURABLE` **by construction** rather than by circumstance. ⛔ The next
dependency is schema, not repair.

⭐ **Independently corroborated.** Carrier §29 recorded *the entire succession
lane is ABSENT from production*, and §33 named it a prerequisite — from a
different lane, a different instrument, before this run. Two independent
measurements agree.

---

## 4. Standing

```
protected preflight        ✅ EXECUTED  ✅ ADJUDICATED  ⛔ GATE NOT SATISFIED
W4-S1 · W4-S2              ⛔ NOT AUTHORIZED · structurally unable to apply
succession/editorial schema ⛔ UPSTREAM PREREQUISITE · separately custody-held
merge ruling               ⛔ BLOCKED
deployment                 ⛔ NOT AUTHORIZED
protected execution        ⛔ NOT AUTHORIZED beyond the read already spent
production                 UNTOUCHED — read-only, nothing written, no repair
```

⛔⛔ **W4-2 CLOSES BLOCKED-BY-PREREQUISITE, AND DOES NOT INHERIT AUTHORITY TO
RESOLVE THAT PREREQUISITE.** Landing `20260914000001` / `20260914000005` is a
separate custody-held act. ⛔ Discovering a dependency is not permission to
satisfy it — and by the 2026-09-07 finding, merging those migrations to
canonical would itself be latent schema-deploy authorization.

⭐ **When the prerequisite lands, this instrument is re-run UNCHANGED.** ⛔ If it
cannot execute as sealed, that is a finding, not permission to modify it during
the witness.
