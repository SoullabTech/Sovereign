# Client Field Phase 1 — Participant Encounter Instrument

**Status:** ⛔ **PRE-REGISTERED · NOT AUTHORIZED TO RUN.**
**Gate:** **D9 — client research recruitment authority.** Unruled. Until D9 is ruled, this
document is an instrument, **not** an encounter.
**Pre-registered:** 2026-08-03, *before* any participant sat down. Criteria fixed at
authoring time and **may not be revised after the encounter begins.**

> **Architecture readiness does not imply participant access.** The Phase 1 branch gives us
> a thing to evaluate. It does not give us permission to evaluate it with another person.

```
Phase 1 build → D9 authorization → Participant encounter → Evidence packet
              → Decision: retain / revise / reject
```

---

## 1. Referent — what exactly is being encountered

Naming this precisely prevents the common failure where someone later says *"the member
tested the new Home"* after the tested object has changed.

```
Artifact:      Client Field Phase 1
SHA:           78358f979
Branch:        feature/my-work-field-phase-1
Base:          trunk 1ea54e57a
Environment:   localhost:3413  (dev server, Phase 1 tree)
Purpose:       arrival comprehension test
NOT:           production acceptance test
```

**Production is unchanged.** `soullab.life` still serves the six-section Home at
`95b21ce42`. This walk says nothing about production and may not be cited as if it did.

If the tree moves, **the walk's referent does not follow it.** A new SHA is a new encounter.

---

## 2. Instrument — the four questions

Asked in order, verbatim:

1. **What is this?**
2. **What would you do here?**
3. **Where would you go next?**
4. **What feels missing?**

### The binding constraint

> **Do not explain the architecture before or during the first interpretation.**

The first response **is** the evidence. A corrected understanding obtained after explanation
is not evidence of anything except that explanation works.

If the participant says *"this looks like a coaching dashboard,"* **that is a more valuable
result than a corrected understanding.** Record it. Do not repair it in the moment.

---

## 3. Evaluation criteria — fixed before the encounter

**Do not ask "do you like it?"** That invites preference, and preference is not what this
walk is for. Four criteria only:

| Criterion | The question it answers |
|---|---|
| **Recognition** | Can they understand **what this place is**? |
| **Agency** | Can they understand **what they can do**? |
| **Orientation** | Can they identify **where they would begin**? |
| **Trust** | Do they understand **what belongs to them** versus what comes from the practitioner? |

Trust is the criterion most likely to be scored generously by an observer who already knows
the answer. It is satisfied only if the participant distinguishes the two sources
**unprompted**.

---

## 4. The CEO lens

Given the positioning, the encounter tests whether the field reads as an **executive
development environment** rather than as a homework tracker, coaching portal, content
library, or task manager.

**The key observation: do they naturally describe it in terms of their own leadership work?**

| ✅ Desired language | ⛔ Failure language |
|---|---|
| *"This is where I keep track of what I'm working on as a leader."* | *"This is where my coach gives me assignments."* |
| *"This helps me continue my coaching between sessions."* | *"This is where I do my homework."* |
| | *"This is my progress tracker."* |

Record the participant's **actual words**. Do not paraphrase into our vocabulary — a
paraphrase into our language destroys the exact signal this criterion exists to catch.

---

## 5. Recording protocol

- **Record behaviour and words. Never assign meaning to them.** Interpretation belongs to the
  participant.
- Verbatim capture over summary. Hesitations, misreadings and wrong turns are data.
- Confusion is an **observation, not a verdict.** An unexpected mental model is a finding
  about the design, not a failure by the participant.
- **Claude may record what was said and done. Claude may not produce interpretation-class
  findings** — that authority sits with the participant and the founder.
- Telemetry is not experience evidence. Nothing here is satisfied by logs.

---

## 6. Evidence packet

Immutable, assembled at the close of the encounter:

- The referent block (§1) verbatim, including SHA
- Verbatim responses to the four questions
- The participant's own description of the field (§4)
- Anything they tried that did not work
- What they said was missing
- **Declared role overlaps** — see below

### Role overlap declaration

Executor, observer and acceptance authority must each be named. Where one person holds more
than one role, **the overlap is declared on the packet itself**, not resolved silently. If
the founder both runs and records the encounter, that is a further overlap and is logged as
one.

**No acceptance may be inferred from execution.** Running the walk is not accepting its
result.

---

## 7. Outcome space

The walk resolves to exactly one of: **retain · revise · reject.**

A walk that produces "mostly positive" and no decision has not been run properly.

**The walk may produce a FINDING. It may not produce a CHANGE.** No fix is made during or
immediately after the encounter — including fixes that seem obvious. Findings return to the
governance lane and are ruled there.

---

## 8. Preconditions before anyone sits down

- [ ] **D9 ruled** — client research recruitment authority. **Hard blocker.**
- [ ] Referent re-verified: the running tree still reports `78358f979`
- [ ] An authenticated member account exists on the walk environment with a **known** field
      state (the arrival case is the most valuable and the least arranged-for)
- [ ] Executor, observer and acceptance authority named; overlaps declared in advance
- [ ] This document read in full by the executor, unchanged since pre-registration

---

## 9. What this instrument does not authorize

- ⛔ Recruiting or approaching any participant. **That is D9.**
- ⛔ Any claim about production.
- ⛔ Any change to Phase 1 arising from the encounter without a ruling.
- ⛔ Revising these criteria after the encounter has begun.
