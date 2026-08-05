# Author Studio Build Sprint Charter — Experimental

> **Status: EXPERIMENTAL** (three-label model: Constitutional / Experimental / Productized,
> founder-adopted 2026-08-05).
>
> **This charter is not a ratification document.** The Nomenclature & World Alignment canon
> draft (`docs/canon/NOMENCLATURE_AND_WORLD_ALIGNMENT_PRINCIPLE_2026-08-05.md`, DRAFT) defines
> the *lens* by which naming/alignment decisions are judged. This charter defines only the
> *bounded experiment currently permitted under that lens*. Nothing in this sprint's execution
> ratifies canon, establishes product identity, or promotes any capability.

## Purpose

Generate evidence for a promotion decision — **not** establish a new product identity.

## Promotion question

> Does this implementation help a real writer enter and continue their own writing world —
> or does it merely make the system more operable?

## Evidence required

Evidence comes from:

- actual writers using the environment;
- observed behavior and language;
- whether users recognize their own work and process;
- whether the system disappears into the act of writing.

**Not evidence:**

- internal elegance;
- developer confidence;
- feature completeness;
- architectural coherence.

## Producers of truth

The producers are the people encountering the system in its intended use.

- The **build team** produces: implementation, observations, hypotheses.
- The **users** produce: recognition, rejection, adoption signals.

## Failure condition

**Operable but foreign.**

The sprint fails if users can technically complete tasks but experience the environment as
belonging to the system rather than to their own creative process.

Concrete negative signals (from the founder's sprint-gate ruling):

- writers orient toward administration instead of creation;
- writers ask where the actual writing happens;
- the tool increases cognitive load.

If there is no possible negative result, it is not a test.

## Authorized scope

**Included:**

- R1 writing room
- Canvas spike
- persistence prototype

**Bounded by:**

- Source remains immutable.
- Working Draft remains the editable space.
- Suggestions remain proposals.
- Author remains the adopting authority.

**Explicitly not authorized** (spike ⊥ adoption ruling, 2026-08-05):

- declaring Canvas the Author Studio architecture;
- moving domain boundaries;
- changing product ontology.

## Standing holds

### `keepSource()`

Held pending ownership-semantics resolution. The question:

> Is preservation a technical implementation detail, or does it encode a claim about
> authorship and provenance?

No promotion until answered. (See `docs/reviews/AUTHOR_STUDIO_FIRST_CROSSING_WALK_INSTRUMENT.md`,
pinned referent `fa4ba27ed`.)

### Adoption claims

No claim that:

- the system understands the author;
- the system improves writing;
- the system becomes a co-author;
- the system has earned authority.

The only claim under examination: **does the environment support the writer's own relationship
with their work?**

## Sunset condition (stopping rule — not a failure condition)

The sprint ends when the promotion question has sufficient evidence to decide whether the
experiment **advances**, **changes direction**, or **is retired**.

This prevents the *Experimental* label from quietly becoming a permanent permission slip.

## Sequence

1. ✅ Re-pin #963 to `fa4ba27ed` (done — commit `58aed1814` on this branch).
2. Commit this charter (this commit).
3. Conduct the writing walk (instrument: `AUTHOR_STUDIO_FIRST_CROSSING_WALK_INSTRUMENT.md`,
   referent `fa4ba27ed`).
4. Collect evidence.
5. Return to the promotion question.

⛔ No architecture expansion before the evidence arrives.
