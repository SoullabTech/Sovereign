# WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · founder adjudication + design boundary

> **Founder rulings on the four questions left open by the census (founder act, 2026-09-05).
> This document is the DECISION act; the census is the OBSERVATION act and is not amended by it.
> It authorises DESIGN only. Implementation — schema, routes, surfaces, types — is NOT
> authorised.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
CANONICAL        adc3b4e9f  (census merged, PR #1219)
CENSUS           WS2-07-BUILD-07F_STANDING_CENSUS_2026-09-05.md — §8 left Q1–Q4 open
STATE            rulings fixed · DESIGN authorised · IMPLEMENTATION not authorised
```

**Why this is a separate document.** The census records what was found before anyone decided
anything, including what it could not settle. Folding these answers back into it would blur two
different acts and destroy the only record of the state at the end of the census. Observation and
decision stay apart.

---

## Q1 — HISTORY: standing history is RETAINED

```text
RULING   YES
```

A current mutable row with no history would make Stage 8 provenance **false** the moment the
writer changed their mind. If a revision was made while an observation stood at `keep`, and the
writer later moved it to `dismiss`, Stage 8 must still be able to establish what standing existed
**when that revision act occurred**. Without history, the chain records what the writer thinks
now, not what informed what they did then.

The sovereignty distinction that makes this a gain rather than a cost:

> **Preserve the history of the member's explicit acts; do not turn that history into inferred
> psychology.**

History establishes facts of the form *standing changed from X to Y at time T*. It is **not**
permission to derive motives, score indecision, measure how often someone reverses themselves, or
feed any behavioural profile.

> **Provenance of an act is not interpretation of the person.**

That sentence is the one a future implementer needs when someone asks for standing-change
analytics. It resolves the apparent tension with surveillance: recording that an act happened is
not the same as reading the person who performed it.

---

## Q2 — SUPERSESSION: standing survives with the observation it addressed

```text
RULING   YES — survives, attached to the frozen observation
         NO  — does not transfer to a successor or current observation
```

A superseded observation is still the historical observation MAIA actually made. 07E already
established that it remains discussable **as superseded**. The writer's standing toward that
historical observation stays attached to it.

```text
old observation + KEEP
        │  the Work changes
        ▼
old observation [SUPERSEDED] + KEEP        ← unchanged, both sides

new / current observation
        ▼
UNSET                                       ← no standing has been taken
```

**No automatic clearing. No auto-revert. No migration of a standing onto whatever comes next.**

Both sovereignties are preserved by the same rule: MAIA's past observation is not rewritten, and
the writer's past judgment is not rewritten either. The writer may of course change their standing
toward the old observation later — the relation is mutable — but it remains a relation to *that
exact frozen observation*.

---

## Q3 — MAIA VISIBILITY: standing is NOT part of MAIA's cognitive context

```text
RULING   NO — and structurally, not as prompt policy
```

> **Standing belongs to the writer and has no ambient route into MAIA cognition.**

This is an architecture ruling, not "we won't put it in the prompt yet". It must not become an
invisible weighting term in what MAIA notices, synthesises, or reports.

```text
MAIA observations ──────────► developmental synthesis
                                   ▲
                                   │
writer standing ───────────────────X
```

- A writer **dismissing** something cannot make MAIA stop seeing the pattern.
- A writer **keeping** something cannot make MAIA preferentially "discover" more evidence for it.

**This gives BUILD-07G its structural rule rather than a disciplinary one.** 07G's epistemic
constraint — *synthesis may organise existing evidence; it may not manufacture observations that
were never made* — does not have to be enforced by 07G's own care if there is no route from
standing into cognition to begin with. Weighting by standing would not manufacture an observation,
but it is the same failure in better manners: the writer's judgment quietly editing what MAIA
perceives.

A later, **explicitly writer-initiated** act — *"talk with me about why I dismissed this"* — could
authorise standing as conversational context. That would be a separate act with an explicit
boundary, and a member act travelling into a conversation is the opposite authority direction from
ambient model context. **It must never be ambient.**

This is also why the census's PDC-1 distinction matters: system cognition and member disposition
stay in opposite authority directions, and nothing may quietly connect them.

---

## Q4 — VOCABULARY: three standings, not four

```text
RULING   keep · dismiss · unresolved      — mutually exclusive
         investigate                       — NOT a standing
```

The census flagged `unresolved` and `investigate` as possibly indistinguishable *to a writer*.
That was the weaker reading. The founder's diagnosis is the correct one and it changes the remedy:
**they are not competing values on the same axis at all.**

```text
KEEP          judgment
DISMISS       judgment
UNRESOLVED    deliberate withholding of judgment
—————
INVESTIGATE   intention / next act
```

All of these are coherent at once:

```text
keep this AND investigate it further
dismiss this AND investigate why MAIA saw it
unresolved AND investigate it
```

Putting `investigate` into the standing enum would therefore make **mutually compatible states
falsely exclusive** — and a database `CHECK` constraint would have made that expensive to
discover later. Finding it before a schema existed is what the census was for.

### The v1 standing set

```text
UNSET         no member act has occurred
KEEP          the writer retains the observation as meaningful / useful
DISMISS       the writer does not take the observation as meaningful / useful
UNRESOLVED    the writer has explicitly withheld judgment
```

**`UNSET` ≠ `UNRESOLVED`, and the distinction is load-bearing.** The former means no member act
has occurred; the latter *is* a member act. A design that cannot tell them apart has silently
decided that never having considered something is the same as having considered it and declined to
rule — which is precisely the rounding 07E was built to refuse.

`investigate` stays **outside** the standing object. Its eventual persistence shape does not have
to be decided in 07F merely because the distinction surfaced here.

---

## The three governing sentences

These carry more than wording. Each one protects a ruling from a later, well-meant
"simplification", and each should survive verbatim into any design or implementation record that
descends from this document.

```text
Q1   Provenance of an act is not interpretation of the person.

Q4   Different axes must not be compressed into one enum merely because the
     interface wants one row of buttons.

Q3   Standing belongs to the writer and has no ambient route into MAIA cognition.
```

**What each one stops.** The first stops retained history from becoming behavioural analysis —
the request will arrive phrased as insight. The second stops a four-button row in a UI mock from
becoming a four-value `CHECK` constraint, which is how a compatible pair becomes falsely exclusive
and expensive to unwind. The third stops "just pass the standing through, it's already loaded"
— the cheapest possible edit, and the one that would silently let a writer's judgment edit what
MAIA perceives.

## The companion invariant

07E established: **unknown never rounds to the convenient answer.**

07F adds its companion:

> **Different axes must not be compressed into one enum merely because the interface wants one row
> of buttons.**

Both are failures of representation rather than of logic, and both are cheap to prevent and
expensive to unwind.

---

## The 07F ontology, as now fixed

```text
OBSERVATION
  MAIA's frozen claim. Never amended by anything in this unit.

STANDING
  the member's mutable judgment about that observation
  identity   memberId + readingId + observationKey
  values     keep | dismiss | unresolved
  absence    unset — a distinct state, not a missing value
  history    retained
  ownership  the member's; the system never sets or reverts it

INVESTIGATE
  not a standing · different axis · no 07F persistence ruling

MAIA
  cannot automatically see standing
```

### The mutation boundary

```text
standing may change
frozen observation may NOT           enforced today by a DB trigger on developmental_readings
reading may NOT                      same trigger
another member's standing may NOT    NOTHING enforces this yet — it does not exist yet
```

The third line is the only one with no existing enforcement to inherit, and it is the one the
design must answer for.

---

## What the design must demonstrate

Design is authorised. It must show how the new durable object makes these properties
**structural** — unrepresentable-if-wrong, per the bias inherited from 07E — rather than promised
by a service or a surface:

```text
D1  MEMBER OWNERSHIP        a standing cannot be written for, or read as, another member's
D2  UNSET                   representable and distinguishable from all three values, and from
                            UNRESOLVED in particular
D3  IMMUTABLE HISTORY       a prior standing cannot be rewritten or silently discarded
D4  SUPERSESSION            no path transfers a standing to a successor observation, and none
                            clears one when its observation is superseded
D5  NO ROUTE TO COGNITION   no path exists by which standing reaches MAIA's context — asserted
                            over the module graph, as 07E's gate-7 is, not asserted in prose
D6  SYSTEM CANNOT SET       nothing but a member act writes a standing; no auto-revert of the
                            kind member_memory_atoms carries (census §4)
D7  ONE STANDING            unique per (memberId, readingId, observationKey), by constraint
                            rather than by convention
```

**The design bias, stated once:** make an incorrect ownership, identity, or default state
*unrepresentable* — not merely something the UI promises not to do.

---

## Sequence

```text
CENSUS              COMPLETE · merged at adc3b4e9f
FOUNDER RULINGS     FIXED · this document
07F DESIGN          AUTHORISED — must satisfy D1–D7 before schema or runtime work
07F IMPLEMENTATION  NOT AUTHORISED
07G / 07H           UNOPENED
```

## What this document does not do

```text
no schema · no route · no surface · no types · no implementation
no amendment to the census
no persistence ruling for `investigate`
no opening of 07G or 07H
nothing absorbed from the parked ledger
```
