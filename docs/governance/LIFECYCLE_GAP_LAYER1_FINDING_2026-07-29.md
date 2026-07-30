# Layer 1 — Finding slot: governance lifecycle closure

**Opened:** 2026-07-29
**Status:** RULED — AFFIRMED 2026-07-29T18:04:22Z (see RULING below)
**Authority:** Kelly only. Claude may open the slot and state the cases; Claude may not rule.

---

## The question (this slot answers this and nothing else)

> **Does the project have a governance lifecycle gap in which a ratified state can exist without
> becoming recorded and verifiable?**

This is a **normative** question, not a factual one. The facts are not in dispute. What is being
decided is whether those facts constitute a **defect in the lifecycle** or a set of **execution
lapses under a lifecycle that is already sufficient**.

---

## Excluded from this room (downstream — do not admit)

- The classification ledger (`GOVERNANCE_ARTIFACT_CLASSIFICATION_LEDGER_2026-07-29.md`) — Layer 3 mechanism.
- The Drift Audit Pass 1 packet's remaining items — separate ballot.
- The Arrival Constitutional Principles disposition — an *instance*, not the finding.
- Instrument selection (D1), theme scope (D5), any queue sequencing.
- "What should we build to fix it" — Layer 3.

Admitting any of these before the Layer 1 ruling re-opens the analysis loop this slot exists to close.

---

## Facts on the record (established; not re-derived here)

1. Content has been treated as ratified while having no trace on any line of record.
2. Verification of ratified state has required reconstruction from conversations, working branches,
   or local files rather than from the canonical repository.
3. `untracked` → `pushed branch` → `canonical` are three distinct states, and a governance artifact
   can sit in the first two indefinitely without anything in the process objecting.
4. An untracked governance file cannot distinguish a founder's act from a draft of one
   (*durable ⊥ attributable*).
5. The condition was already **named** on 2026-07-21 as Finding #0 — *"system of record not on any
   line of record"* — a remedy was proposed, **the ruling never occurred**, and instances continued
   to accumulate afterward (Arrival, 07-22, and subsequently).

Fact 5 is the load-bearing one: this is not a discovery. It is a **named but unruled** condition.

### ⛔ Excised from the basis (Kelly, 2026-07-29)

**Representation drift** — memory/session representations diverging from their referents — is **not**
part of this finding's evidentiary basis. It is a distinct failure: the referent existed and was on
the record; the representation went stale against it. That can occur inside a *complete* lifecycle,
and it is already governed by ratified discipline (*representation must remain bound to referent*).

Reason for the excision: including it would enlarge the defect class unnecessarily, and an over-broad
Layer 1 finding produces an over-broad Layer 2 capability set, which produces an over-built Layer 3
instrument. The basis is items 1, 2, 4 above — the *durable* half (1, 2) and the *verifiable* half (4).

### The deciding distinction

Both cases below turn on a single point, and it is the one to rule on:

> Is merge-to-canonical an **explicit required state transition**, or a **possible action that people
> are expected to remember to perform**?

A process step that can be skipped **without the lifecycle declaring the object incomplete** is not
the same thing as a required transition.

---

## The affirmation case

The process permits a ratification to exist without durable representation. Nothing in the lifecycle
requires or checks the transition from *decided* to *recorded*. Because no such transition is defined,
no individual is failing to perform it — which is why instances kept accumulating **after** the
condition was named. A defect that reproduces itself after being identified is structural, not
personal. Therefore the lifecycle is incomplete.

## The rejection case

The lifecycle already contains a closure transition (merge to canonical), and every instance cited is
someone failing to perform a step that already exists. The remedy is discipline, not a new governance
state. Adding a state transition would formalize bookkeeping that the repository already enforces at
merge time, and would create a new obligation without a new capability.

---

## The smallest available ruling

Not *"we need a ledger."* That is Layer 3.

> **"The governance lifecycle requires an explicit `ratified → recorded → verifiable` transition."**

Affirming this names a missing state transition. It selects **no mechanism**, authorizes **no build**,
and rules on **no instance**.

---

## RULING

**Decision: AFFIRM.**

> The governance lifecycle requires an explicit `ratified → recorded → verifiable` transition. This
> ruling establishes the lifecycle requirement only; it selects no instrument, authorizes no
> implementation, and rules on no individual artifact.

**What this establishes:** the transition is a **required lifecycle state**, not merely an available
administrative action. A constitutional object that has not made the transition is not in a completed
lifecycle state.

**What this does not establish:** how the transition occurs · who maintains it · what instrument
implements it · the disposition of any existing artifact (Arrival, the Drift Packet items, the
closure commits off canonical). All remain open.

**Ruled by:** Kelly Nezat  **Timestamp (UTC):** 2026-07-29T18:04:22Z

> **Scope guard.** The doctrine *"No constitutional object is fully closed until it exists on the line
> of record"* is **Layer 2** — a property a solution must have. It is not carried by this ruling and
> must not arrive as a rider on it.

**Recorded to canonical (merge SHA):** _______________ ⬅ *unfilled until Kelly merges*

> A ruling written here while this file is untracked is *preserved*, not *durable*, and not
> *attributable*. Closure of this finding requires: commit on a named branch → PR → **merge SHA on
> `clean-main-no-secrets`**. Anything short of that reproduces the very condition being ruled on.

---

## Next (only after the ruling above is filled and merged)

- **Layer 2** — what properties must any solution have?
- **Layer 3** — what mechanism satisfies them?

Do not open Layer 2 in the same sitting as Layer 1 unless Kelly directs it.
