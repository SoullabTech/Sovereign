# SEL-0 redesignation + Writer's Studio developmental-selector product contract

**Founder ruling, 2026-09-08** — recorded verbatim, then the DESIGN act it opens.

---

## 1 · Founder ruling — SEL-0 redesignated

> SEL-0 is hereby redesignated as a pre-build acceptance standard for Writer's Studio
> developmental selection.
>
> Writer's Studio presently lacks the required capability: MAIA cannot yet decide which
> lawful developmental observation is most useful to raise now. That remains an open
> product gap until an actual Writer's Studio runtime path implements the capability and
> passes SEL-0.
>
> SEL-0 may define the acceptance standard before implementation, but the benchmark
> evaluator is not the product capability. No evaluation-only ranking prompt, script,
> agent, or offline scorer may be treated as satisfying the gap.
>
> The capability is satisfied only when a named Writer's Studio runtime component performs
> developmental selection under the same substantive contract that SEL-0 evaluates.
>
> The existing exact-key behavior remains valid for member-addressed observations. When the
> writer explicitly names an observation, the system resolves exactly that observation and
> does not substitute another. Developmental selection is a separate capability governing
> what MAIA may choose to raise when the writer has not already chosen the observation.
>
> SEL-0's acceptance rules must be frozen before the selector is implemented or tuned
> against the frozen corpus.
>
> After the acceptance standard is frozen, the smallest real Studio selector may be
> implemented on a branch. It must be part of the actual Writer's Studio developmental
> path, not a benchmark-only path.
>
> The selector implementation must then be locked before founder ranking or selector
> measurement is revealed to its implementer. SEL-0 is run once against that locked
> implementation.
>
> Passing SEL-0 establishes acceptance eligibility for the developmental-selection
> capability. It does not itself authorize merge or deploy.
>
> Failing SEL-0 leaves the product gap open. The acceptance threshold may not be weakened
> to accommodate the implementation.

### Manifest C reclassified

```text
BEFORE     native surface available to the deployed selector
DISCOVERY  deployed selector DOES NOT EXIST
NOW        frozen candidate production-surface evidence
           NOT YET the selector input contract
```

The new selector's input contract is specified as product design first. Manifest C is then
checked structurally — without exposing stimulus — for exact or superset match. Match →
benchmark input derived deterministically from frozen C, no production re-read. No match →
STOP and resolve the fixture explicitly. *The benchmark fixture does not get to define the
product architecture by accident.*

### Two kinds of selection, permanently separate

```text
WRITER SELECTS   "I want to discuss o7."
                 exact-key resolution · no substitution · writer authority governs

MAIA SELECTS     "What is most useful to raise now?"
                 developmental selector · lawful candidates only
                 writer intention + scope + Work evidence govern
```

`"Never a nearest match"` survives untouched. The selector never overrides an explicit address.

### Frozen sequence

```text
1  record redesignation                      ← this document
2  specify selector PRODUCT CONTRACT         ← §2 below, PROPOSED
3  freeze SEL-0 instrument  R1 · R2 · R3 · response-format symmetry
4  verify fixture against contract, no stimulus exposure
5  lock acceptance standard — NO threshold changes after this point
6  implement smallest REAL Studio selector — actual path, no benchmark substitute
7  lock selector implementation + model/config
8  founder opens Manifest B for the first time · ranks · locks
9  run locked selector once against frozen lawful native fixture
10 compare against frozen SEL-0 rule

PASS → gap eligible to close → proceed to F-7
FAIL → gap remains open · diagnose implementation · the benchmark does not move
```

---

## 2 · PROPOSED product contract — Writer's Studio developmental selector

**Status: PROPOSED. Not ratified, not implemented, not frozen.** Product architecture, not
benchmark convenience.

### 2.1 Invocation condition

Selection is permitted **only** when all hold:

```text
a  a frozen developmental reading is open in the Develop room
b  the reading holds >= 2 lawful observations
c  the writer has NOT named an observation in this act
d  the writer has performed an act that opens conversational space
```

⛔ Never on load, never on a timer, never as ambient suggestion. The existing room reads on
member act only; selection inherits that discipline rather than introducing polling.

### 2.2 Writer-selected-observation precedence — absolute

```text
if anchor.observationKey is present  ->  selectObservation() resolves it exactly
                                         the selector IS NOT INVOKED
```

Precedence is structural, not advisory: the selector is not consulted and cannot be
consulted on that path. This preserves `parseDevelopmentalAnchor`'s boundary unchanged.

### 2.3 Lawful candidate-set boundary

```text
INCLUDED   observations in the open frozen reading
           F-7 eligible only
           standing != 'dismiss'

EXCLUDED   F-7 ineligible (ineligible, not low-ranked)
           observations the writer has dismissed
           observations from any other reading
           anything not in the frozen reading
```

Superseded observations stay visible in the room (07D product rule) — whether they are
*selectable* is **open question Q3**.

### 2.4 Permitted selector inputs

```text
the lawful candidate observations themselves
the writer's present turn / stated intention
the commissioned lens + reading scope
the frozen read_state (revision, section topology, coverage)
member-authored standings: keep | dismiss | unresolved
which observations already have open ask_threads
evidentiary strength carried by the observation itself
```

Every one is either the Work, the writer's own act, or the reading's own provenance.

### 2.5 Prohibited inputs

```text
engagement, dwell, retention or any usage-derived signal
inferred member psychology, state, or developmental level
cross-member or aggregate patterns
any signal created by or for the benchmark
anything post-dating the frozen reading's snapshot
the founder's SEL-0 ranking, the threshold, or any benchmark annotation
```

### 2.6 Output form

```text
an ORDERING over the lawful candidate set
ties permitted and meaningful
accompanied by a declared confidence
```

An ordering, not a single pick — the writer must be able to see past the first suggestion,
and an ordering is what SEL-0 can evaluate without inventing structure. **Whether the room
surfaces one item or a short ordered set is a product decision (Q4), not a contract change.**

### 2.7 Authority and uncertainty behaviour

```text
selection is an OFFER, never a redirection of the session
the writer may accept, reject, correct, redirect, deepen, or ignore it
low confidence -> MAIA declines to select and says so
                  declining is a lawful output, never a forced pick
selection is never presented as diagnosis, priority, or instruction
no selection is recorded as authority over the Work
```

### 2.8 Runtime integration point — the actual Studio path

```text
component   lib/manuscript/ask/  (new module, sibling of developmentalAnchor.ts)
invoked by  app/api/sovereign/manuscripts/[id]/ask/route.ts  POST,
            on the branch where anchor.observationKey is ABSENT
consumed by the ask thread's MAIA turn — the same ask_threads / ask_turns
            surface that already carries developmental dialogue
surfaced in app/writers-studio/develop/DevelopRoom.tsx
```

⛔ Not a script, not an agent, not an offline scorer, not a benchmark harness. If the
selector cannot be reached from the ask route, the gap is not closed.

### 2.9 Downstream consumer

The MAIA turn of an ask thread. Selection determines *what MAIA raises*; the existing
developmental dialogue determines *how she raises it*. Nothing else consumes the selection —
no rendering, no ordering, no persisted state is derived from it in v1.

---

## 3 · Genuine founder questions — these need rulings, not defaults

**Q1 · Does the room's existing no-recommendation posture extend to observations?**
`DevelopRoom.tsx:436` carries `⛔ Nothing preselects, recommends, or ranks a place to start.`
Read strictly it governs **where MAIA reads** — the scope range — and not which observation
is raised, so the selector does not literally violate it. But it expresses a posture, and a
developmental selector inverts that posture in an adjacent place. **Is that ⛔
scope-specific, or is it a Studio-wide stance that a selector must be ruled to override?**
This is the single most consequential question here and it should not be answered by
reading the comment narrowly and proceeding.

**Q2 · What opens conversational space?** §2.1(d) is deliberately vague because the room has
no such act today. A "what should I look at?" question is explicit. Is opening the room? Is
finishing a dialogue on another observation? The invocation condition cannot be frozen until
this is named, and naming it wrongly makes selection either never fire or fire ambiently.

**Q3 · Are superseded observations selectable?** They remain visible and marked. Visible and
selectable are different acts, and MAIA raising a superseded observation may be exactly right
or clearly wrong depending on your intent for supersession.

**Q4 · One item or a short ordered set in the room?** Contract-neutral, product-visible. A
single suggestion is calmer; an ordered set is less directive because the writer sees the
alternatives. This bears directly on §2.7's authority posture.

**Q5 · Does `dismiss` exclude permanently?** §2.3 excludes dismissed observations. A writer
may dismiss something in one session that becomes apt three revisions later. Permanent
exclusion is safe and possibly wasteful; re-eligibility needs a rule that is not "MAIA
decides the dismissal expired."

**Q6 · Is declining to select a first-class outcome in SEL-0?** §2.7 permits MAIA to decline
under low confidence. If the acceptance standard cannot represent a decline, the instrument
silently forces a pick and measures something the contract forbids. This must be settled in
R1/R2, before the instrument freezes.

---

## Standing

```text
SEL-0                  PRE-BUILD ACCEPTANCE STANDARD (redesignated)
product gap            OPEN — Studio lacks developmental selection
selector contract      PROPOSED — not ratified
Manifest C             frozen production-surface evidence, NOT the input contract
R1 · R2 · R3           NOT OPENED
threshold              UNSET
founder ranking        NOT STARTED
MAIA ranking           NOT STARTED
Manifest B             NOT OPENED
selector                NOT IMPLEMENTED
```

Nothing was inspected in Manifest B, Manifest C or the source snapshot to produce this
document; no provider was called; nothing was ranked.
