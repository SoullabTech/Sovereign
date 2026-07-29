# Layer 2 · C2 — States must remain distinguishable

**Opened:** 2026-07-29
**Status:** PARTIALLY RULED — **Decision 0 = NECESSARY PROPERTY** (2026-07-29T20:27:10Z).
Decisions 1 (vocabulary), 2 (`candidate`), 3 (`living`) remain **OPEN**.
**Upstream:** L1 AFFIRMED `448cb7eda` · L2 gate RULED `500b37f6f` · C1 AFFIRMED `78d9fb388`
**Gate disposition carried in:** C2 = **property candidate; state set UNRESOLVED**
**Authority:** Kelly only. Claude may open the slot and give an evidentiary read; Claude may not rule.

---

## The question

> **What states must remain distinguishable for the lifecycle transition to be valid?**

Not *"are these words useful?"* — but *does the evidence establish them as distinct lifecycle states?*

⭐ **A state is not vocabulary. It creates a condition later systems must preserve.** Admitting a state
creates an obligation; that is why the bar is evidence, not usefulness.

---

## Excluded from this room

C3 (verification referent) · C4 (failure-class validation) · Layer 3 (instrument) · directory structure
· any mechanism, ledger, or automation. Index compaction is unrelated housekeeping.

---

## Evidence, verified on canonical 2026-07-29 (not carried from memory)

### ⚠️⚠️ FINDING 1 — the candidate list mis-states the ruled word

The Layer 1 ruling on canonical reads, verbatim:

```
ratified → recorded → verifiable
```

The C2 candidate list carries **`Verified`**. These are **not the same object**:

- **`verifiable`** — a *property/capability*. The state can be checked. This is what L1 ruled.
- **`verified`** — a *completed act*. Someone checked it.

⚠️ Substituting the second for the first converts a capability into an event and would create an
obligation L1 never established (someone must perform verification). **This slippage entered by
transcription, not by decision** — the same failure class as `Living` and C3's third option. It must be
ruled, not absorbed.

### Tier A — established by the Layer 1 finding
`ratified` · `recorded` · `verifiable` — all three appear in the ruled transition at `448cb7eda`.

### Tier B — established by repository practice, NOT by the Layer 1 finding
`candidate` — 15 paths on canonical carry `candidate`, including `docs/governance/candidates/THE_HOUSE_CANDIDATE.md`.
⚠️ *Different evidence source.* Live convention is real evidence, but it is not the L1 finding. Whether
practice alone can admit a lifecycle state is itself part of this ruling.

### Tier C — not established
`living` — **zero occurrences** as a governance state anywhere in `docs/governance/` or `docs/canon/` on
canonical. Introduced at the Layer 2 opening with no upstream basis.
⭐ The test (Kelly's own formulation): *did the lifecycle evidence establish a state transition beyond
`verifiable`, or was `Living` an intuitive extension?* On this evidence: no instance exists.

---

## RULING

**Ruling order (Kelly, 2026-07-29) — Decision 0 first:**

```
0. Is distinguishability itself required?
        ↓
1. Decide the vocabulary
        ↓
2/3. Decide the authority source for any additional states
```

Two layers that must not be fused: **what states exist** ⊥ **must a mechanism preserve distinction
between them**. A system could hold a correct list and still fail by letting states collapse; a
mechanism could preserve distinctions while the vocabulary remains unsettled.

⚠️ **Dependency:** if Decision 0 returns *useful preference* or *not independent of Layer 1*, admitting
a state in Decisions 2/3 creates a weaker obligation than under *necessary property*. The dispositions
below should be read against whatever Decision 0 returns.

⚠️⚠️ **Scope caution on Decision 2.** The framing *"what can create a lifecycle state?"* is **broader
than C2**. Deciding whether `candidate` qualifies is narrow; ruling in general on what may create a
lifecycle state would bind every future state proposal from inside a slot convened to resolve one list.
Recommend answering the narrow form — *does repository practice suffice for `candidate`?* — and leaving
the general question named-but-unruled unless deliberately opened.

### ⚠️ Decision 0 — C2 itself (flagged as missing from the three-decision cut)

The Layer 2 gate typed C2 as **"property candidate; state set unresolved."** The three decisions below
resolve the *state set*. They do **not** resolve C2 **as a property** — which still carries the same
three-way disposition C1 received:

| | Disposition | Meaning |
|---|---|---|
| ☑ | **NECESSARY PROPERTY** ✅ **RULED** | Any valid mechanism must keep lifecycle states distinguishable. |
| ☐ | Useful preference | Desirable but optional. |
| ☐ | Not independent of Layer 1 | Already carried by `ratified → recorded → verifiable`. |

> **Any valid mechanism addressing the lifecycle gap must preserve the distinction between lifecycle
> states.**

**Scope (as ruled):** *state distinguishability is required; this does not yet define the state
vocabulary, the instrument, or the workflow.*

**Reasoning as ruled:** Layer 1 establishes that `ratified`, `recorded`, and `verifiable` are not the
same condition, and the defect exists because a state can advance without the transition being visible.
A mechanism that closes the gap while collapsing those distinctions would make the very failure it is
meant to expose **invisible**. Not merely neat bookkeeping — and not covered by Layer 1, which
establishes the transition but does not require a responding mechanism to preserve the states'
separateness.

**Ruled by:** Kelly Nezat  **Timestamp (UTC):** 2026-07-29T20:27:10Z

⛔ **Decisions 1, 2, and 3 are NOT ruled by this act.** They remain open and are to be read against this
disposition.

⭐ *Naming the state set is not the same act as requiring a mechanism to keep the states
distinguishable.* Ruling only the set would leave C2's own type unresolved after the slot closes.

### Decision 1 — state vocabulary correction

`verified` → **`verifiable`**, unless a separate ruling creates `verified`.

| Term | Type | Implied obligation |
|---|---|---|
| `verifiable` | property | the state has an inspectable referent |
| `verified` | act / state transition | someone performed a verification action |

⛔ *`verified` may be desirable, but it cannot enter by inheritance. It needs its own basis.*

**Disposition:** _______________________________________

### Decision 2 — `candidate` (Tier B, practice only)

**Disposition** — necessary · optional · not established: _______________________________________

**Sub-question this turns on:** *Is repository usage sufficient evidence of a lifecycle state, or must a
state have governance authorization?*

⚠️ C1 (`78d9fb388`) established **location cannot create authority**. It did **not** establish
**convention cannot create state**. Related, distinct, unresolved.

**Sub-ruling:** _______________________________________

### Decision 3 — `living` (Tier C, no instance)

**Disposition** — necessary · optional · not established: _______________________________________

### Tier A — `ratified` · `recorded` · `verifiable`

Named by the L1 ruling. Their *distinguishability requirement* is Decision 0, not a separate act.

---

**Claude's evidentiary read (not a ruling):** the evidence supports only `ratified`, `recorded`, and
`verifiable` as established lifecycle states.

**Ruled by:** _______________  **Timestamp (UTC):** _______________

**Recorded to canonical (merge SHA):** _______________ ⬅ *unfilled until Kelly merges*

---

## Next

C3 opens only after C2 is ruled and merged. C4 remains a validation-test candidate. Layer 3 closed.
