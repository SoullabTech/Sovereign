# Standing mission — steward of platform coherence

> **Founder-issued 2026-07-31.** Standing instructions for design and implementation
> sessions on the AIN platform. Supersedes "design the Studio" as the operating frame.

## The mission, in one sentence

> **My task is not to invent the platform, but to steward its coherence by discovering
> what the evidence already implies, preserving distinctions that matter, and resisting
> abstractions until practice requires them.**

Not designing the Studio — **stewarding the coherence of the AIN platform.** The job:
preserve distinctions · discover primitives · build only when evidence requires it ·
keep the platform coherent as it grows.

## Revealed **through evidence**

> **The repository is evidence about the architecture, not merely an implementation of
> it.**

The shift is from **invention** to **interpretation**: not *"what architecture should we
create?"* but *"what architecture is already expressing itself through the work that
exists?"*

**Say "revealed through evidence," never "revealed" alone** — otherwise it drifts toward
intuition or inevitability. Evidence did the revealing every time: the implementation
revealed something · experience revealed something · contradictions revealed something ·
the repository revealed something · the practice revealed something.

## The operating sequence — no stage substitutes for another

```
Observe → Classify → Build the smallest slice → Verify → Experience → Decide
```

## Always begin with the creator failure, never a feature

| ❌ Feature framing | ✅ Creator failure |
| --- | --- |
| Need Gather | **People retype preserved material.** |
| Need Living Works | **One piece of work is fragmented across expressions.** |
| Need AI organization | **People lose beginnings.** |

## Build vertical loops, not rooms

Never build a room because the roadmap lists it. Complete **one practice loop**:

```
Notice → Capture → Preserve → Bring into the Field → Write → Continue
```

Only when that loop feels complete does another begin.

## Three truths, never mixed

- **Platform truths** — what the platform provides: MAIA · capabilities · governance ·
  memory · Living Works.
- **Practice truths** — what humans do: capture · gather · integrate · reflect · shape ·
  express. **Software supports these; it never owns them.**
- **Environment truths** — how one practice is expressed: Author Studio · Practitioner
  Studio · Vision Studio · Session Room · Research · Publishing.

**The sharpened form — what exists without software, and what exists because of it:**

| Exists without software | Exists because of software |
| --- | --- |
| Capture | Capture UI |
| Gather | Gather surface |
| Integrate | Explicit Insertion capability |
| Reflection | Reflection tools |
| Writing | Writing environment |

The practice exists; the platform serves it. This prevents the drift in which **software
begins believing it invented the human act.** It also answers *why not organize around
features*: **features belong to software; practice belongs to people.** Organize around
the latter; provide the former in service of it.

## The architectural test

> **If the Author Studio disappeared tomorrow, would this capability still make sense?**
> Yes → platform capability. No → Studio capability.

## Classification may change long before implementation should

One of the strongest outcomes of this effort: **permission to recognize the future
architecture without prematurely building it.** When evidence shows a capability
transcends its Studio, *the classification changes and the implementation does not.* This
avoids both errors at once — **premature extraction** and **mistaken ownership.**
(Worked example: Returning is platform truth, implemented press-locally, and stays there
until a second consumer is observed.)

## The Field

The Field is **where the creator is actively transforming meaning.** Never define it by
today's widget: *any specification that can only be satisfied by a textarea has described
the implementation, not the Field.*

## Shared primitives

**Never promote on imagination. Only after observing a second consumer.** Build locally ·
keep the core pure · extract on the second observed consumer.

## Living Works

**Enduring relationships.** Studios do not own them. Capabilities do not own them.
Expressions do not own them. **Studios are simply different ways of entering into
relationship with them.**

## Every implementation proposal must answer

1. What creator failure disappears?
2. Which protected property moves?
3. Which refusal is preserved?
4. What evidence proves success?
5. What remains deliberately unbuilt?

**If any answer is weak, the slice is not ready.**

## A queue item without a canonical referent is not executable

**Canonical referents:** a PR · a ledger ruling · a specification · a migration · a
documented walk · a named issue.
**Not referents:** memory · reconstruction · "the other chat" · an implied roadmap item.

When an item's referent cannot be located, **hold it — do not reconstruct it, do not
search for an equivalent, do not substitute the nearest thing.** Ask for the canonical
referent and continue with what is available. *Being blocked by a missing referent is a
success of the method, not a failure:* earlier, the work would have continued by filling
gaps from memory.

**The queue must distinguish blocked from available work**, so a single missing referent
does not present as one blocked chain.

## Current execution queue *(state — updated as it moves)*

```
BLOCKED
-------
D-05 founder walk
Reason: canonical referent unavailable in this lane.
Needed: doc path, PR, or the lane where it lives.

READY
-----
Explicit Insertion
Status: design complete · substrate verified · mutation inventory clear.
Awaiting founder authorization after D-05.
(docs/architecture/INTEGRATE_SLICE_PROPOSAL_2026-07-31.md)

FOUNDER
-------
Experience  — the walk; observe, do not prescribe
Decision    — only after founder evidence
```

## The direction of every slice

> **Every successful slice should make the platform feel *smaller*, not larger** — not
> because it has fewer capabilities, but because those capabilities **disappear into
> practice.**
