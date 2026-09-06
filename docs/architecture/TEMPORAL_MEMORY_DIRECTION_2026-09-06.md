# Temporal Memory Direction

**Status**: Directional architecture document. **Not canon. Not a lane.**
**Date**: 2026-09-06
**Altitude**: three decisions and one audit, recorded so Episodic Phase 2 does not bake in a temporal model that later has to be torn apart.
**Category** (six-category typology): Cat 1 — preserved direction. Held, not authorized.

---

## What this document is

A record of three schema-level decisions and one pre-change audit for MAIA's memory substrate, surfaced 2026-09-06 while reading a published tutorial on "self-repairing agent memory" against the current codebase. The tutorial's implementation choices are not adopted. What transfers is the temporal model underneath it: bitemporal validity, separation of episode from assertion, and a clock-driven attention path that does not depend on a message arriving.

Placed in `docs/architecture/`, not `docs/canon/`, in the same posture as `RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md`: frozen reference, not standing permission. If a future PR cites this document as authority to ship a sweep, a schema, or a decay replacement, that PR has misread it.

## What this document is NOT

- not a "self-healing memory" project
- not authorization to open a lane
- not a build plan for Episodic Phase 2 (that spec is still unauthored)
- not a decision to change `confidenceDecay` behavior

## The governing sentence

> MAIA memory does not repair its beliefs. It preserves the temporal ecology of what was experienced, what was asserted, what was known, and what remains true, under the authority of the person whose life it remembers.

The tutorial's loop is **detect → propose → repair**, with a human gate only for low-confidence repairs. MAIA inverts the exception into the rule: **detect → ask → record**, where only the member's answer creates or closes temporal validity. The system may detect temporal uncertainty. It may not manufacture the correction.

---

## Current state (verified 2026-09-06)

MAIA is **temporally aware but not temporally normalized**. The earlier claim that "valid time does not exist anywhere" was too strong.

| Substrate | What exists | Where |
|---|---|---|
| `developmental_memories` | `valid_from` / `valid_to` columns; non-vector retrieval excludes rows whose `valid_to` has passed | migration `20251231_memory_architecture_enhancements.sql:155-170`; `lib/memory/MemoryBundle.ts:276` |
| `developmental_memories` | Decayed confidence carries **0.40** of the non-vector ranking score; recency 0.35; confirmation 0.15; recall count 0.10; top 12 | `lib/memory/MemoryBundle.ts:264-278` (SQL function `calculate_decayed_confidence`) |
| `developmental_memories` | Vector fallback ranks on similarity 0.50 / significance 0.30 / recency 0.20, top 8, **no `valid_to` condition** | `lib/memory/MemoryBundle.ts:311-325` |
| `member_memory_atoms` | `kept_at` (formation moment) distinct from `created_at` and from source creation time; status is member gesture only; `archived` = out of recall, still preserved; `return_preference`, `last_surfaced_at`, `surface_count` for governed return | `database/migrations/20260521000001_member_memory_atoms.sql` |
| atoms prompt rendering | Relative age ("3 days ago") rendered into the prompt per atom | `lib/maia/memoryAtomsLoader.ts` |
| `confidenceDecay.ts` | Per-type half-lives (preference 365d, event 90d, dream 60d, pattern 180d …); floor 0.3; `shouldPromptForConfirmation()` designed to ask "is this still true?" | `lib/memory/confidenceDecay.ts` |
| `shouldPromptForConfirmation` | **Zero callers.** The ask was designed and never wired. | grep 2026-09-06 |
| `memory_transition_records` | Per-turn available → retrieved → eligible → offered → injected accountability, reasons as sentences | migration `20260804000001` |

What does not exist: a distinct assertion layer with its own validity interval, a `supersedes` relation, an `occurred_at` separate from `recorded_at` on episodes, or any measurement of how much the 0.40 decay weight actually changes which memories reach the prompt.

---

## Decision 1 — Episodic Phase 2 distinguishes event time from valid time

An episode answers *what happened when*. It wants an occurrence time. A proposition discovered inside an episode ("I am working at X", "I prefer Z") answers *during what period was this true*. It wants a validity interval. These are different objects and must not share a row.

```text
EPISODE
  occurred_at        when the thing happened
  recorded_at        when MAIA recorded it
  content, provenance

TEMPORAL ASSERTION (memory claim)
  valid_from         when the proposition became true
  valid_to           when it ceased being true (NULL = still true)
  recorded_at        when MAIA learned it
  closed_at          when MAIA learned it ceased
  supersedes         see Decision 2
  source_episode(s)  provenance back to the episode(s)
```

An episode from March stays an episode from March forever. Its `valid_from`/`valid_to` fields do not exist. The open question for the Phase 2 spec is **where the assertion layer lives**: a new table, an extension of `developmental_memories` (which already carries `valid_from`/`valid_to`), or a typed register on atoms. That is a spec question, not a decision this note makes.

Four things can happen to an assertion, and nothing else: it is **born** (interval opens), **replaced** (closed exactly where a successor opens), **ends** (closed, no successor), or **ages** (open, but past its review horizon). "Replaced" and "ends" must stay distinguishable: a replaced fact hands you the next value, an ended one honestly has none.

## Decision 2 — Succession is carried by the successor, not the predecessor

The custody rule: the actor with authority to declare succession is the successor. So the schema is

```text
valid_from
valid_to
supersedes        → the assertion this one replaces
```

and **`superseded_by` is a derived inverse**, never a stored authoritative field. A closed historical assertion is never reopened and amended because something later became true.

```text
A: "I live in Connecticut"      valid_from 2024-05-01   valid_to 2026-03-14
B: "I live in New Orleans"      valid_from 2026-03-15   valid_to NULL   supersedes A
```

Writes are append-oriented: assertion, transition (member ratifies; `effective_at` vs `recorded_at` preserved separately), successor assertion. The read model derives `A.valid_to`, `A.superseded_by`, `B.valid_from`, and "current". This is the single-writer invariant from the tutorial, translated into a **single authority boundary** that never rewrites the predecessor row.

**Custody, not archival.** Two operations must stay distinct:

- **Supersession**: "this used to be true; preserve that history." Never erase history merely because a later truth supersedes it.
- **Member-directed removal**: "I no longer consent to you holding this." Always available. "Historical integrity" is never a justification for perpetual possession. Sanctuary Mode remains absolute upstream of all of this.

## Decision 3 — Staleness is detected and surfaced; status change requires the member

MAIA may run a **temporal attention sweep** on a clock, with no message triggering it. It may cheaply detect:

```text
age beyond review horizon
explicitly scheduled end reached
source version changed
new assertion apparently contradicts an open one
unresolved temporal ambiguity
```

and it produces **nothing but candidates for attention**. Age alone never means false. A candidate reaches the member only through the existing doorway mechanism: `return_preference` must permit it, and the surface cooldown applies. The member's answer is the only thing that opens or closes an interval. The system never sets `valid_to` from a timer.

The word **repair** is wrong for MAIA and should not appear in any spec that descends from this note.

### Four dimensions the current code conflates

Truth, currentness, age, and relevance are not one axis. `confidenceDecay` currently gives an *event* a 90-day confidence half-life because it becomes "less critical over time". That is salience represented as confidence.

| Dimension | Question | Owner |
|---|---|---|
| Epistemic confidence | How well supported is this assertion? | provenance |
| Temporal validity | During what interval was/is this true? | member (Decisions 1–2) |
| Retrieval salience | How useful is this to the present turn? | selection policy, must be legible |
| Review currentness | How long since a state-like assertion was confirmed? | sweep candidate, member answers |

"My father died in 2012" ages without becoming less true. "I live in Connecticut" may become uncertain as a current state. "I dreamed of a black bird" remains an event indefinitely. A single decay scalar cannot represent these.

---

## The audit that precedes any change

Observation stays ahead of classification. Before anything in Decision 3 is built, and before `confidenceDecay` is touched:

1. **Measure whether decay changes what reaches the prompt.** Using the `memory_transition_records` observability already in place, determine how often the 0.40 decay term changes the top-12 set versus a decay-free ranking for the same members. If it does, evaluate accompanying or replacing invisible weighting with member-legible age information (the atoms renderer already does this for atoms). If it does not, the transparency concern is moot at present and is recorded as such.

2. **Test `valid_to` parity between retrieval paths.** The non-vector path (`MemoryBundle.ts:276`) excludes expired developmental memories; the vector fallback (`MemoryBundle.ts:321-325`) does not. Question: *can an expired or superseded developmental memory become retrievable through the vector fallback after being excluded from the ordinary path?* This is not yet a proven production defect. The fallback fires only when the non-vector query returns zero rows and an embedding exists. It is structurally the kind of defect a temporal model exists to prevent, and it should be either confirmed or ruled out before Decision 1 chooses where the assertion layer lives.

3. **Note the unwired ask.** `shouldPromptForConfirmation` is the designed "is this still true?" gesture with no callers. Whether it is the right shape for the sweep candidate is a Phase 2 question; that it was designed and dropped is a fact worth carrying forward.

---

## Growth-obligation check

- **Uncertainty introduced and preserved**: the sweep produces candidates, never conclusions. Unknown remains a valid state; `valid_to NULL` means "still true as far as the member has said", not "verified current".
- **Provenance and ownership boundaries**: every assertion points to its source episode(s); succession is declared by the successor under member ratification; removal remains a member act.
- **New responsibility**: MAIA now holds a claim about *when* things were true. That responsibility is discharged by never asserting a closure the member did not make, and by making age legible rather than silently weighting it.

## Relationship to the existing sequence

This note does not reorder the sequence in `CLAUDE.md` (fork → toggle → clarify-engagement-shape → verify → episodic → cleanup). It attaches to step 5: when the Episodic Phase 2 spec is authored, Decisions 1–3 are inputs to it and the audit is a precondition. The sweep itself stays Cat 1 with a named gate: member-facing "is this still true?" as a doorway offer, subject to consent and cooldown. It does not open a lane.

## Sources consulted

- Fowler, *Bitemporal History* (valid time vs record time; event-sourced implementation)
- Rasmussen et al., *Zep: A Temporal Knowledge Graph Architecture for Agent Memory* (arXiv 2501.13956): episode/fact separation, `valid_at`/`invalid_at` on derived facts. Its automatic contradiction resolution is explicitly **not** adopted; the temporal shape is.
- Wu et al., *LongMemEval* (ICLR 2025): temporal reasoning and knowledge-update failures over long histories.
- The originating tutorial (datasciencebrain, 2026-09-05): the four-operation table and the clock-driven second path.
