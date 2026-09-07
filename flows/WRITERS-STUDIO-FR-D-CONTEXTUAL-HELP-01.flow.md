# WRITERS-STUDIO-FR-D-CONTEXTUAL-HELP-01

```text
KIND     bounded Writer's Studio flow — NOT a new product lane
PARENT   JARVIS-WRITER-ONBOARDING-PRODUCTIZATION-01
OPENED   2026-09-07 (founder)
GATE     census + proposal AUTHORIZED · CODE STOPS AT §7
```

> **Founder intent:** *"This is about quality, an emotional connection to the
> work, and the field UI/UX."*

Authored by the founder. Recorded here verbatim as the flow of record so it
survives this session.

---

## WRITER'S STUDIO — FR-D CONTEXTUAL HELP PRODUCTIZATION

### MISSION

Turn the founder-witness findings about missing semantic help into a coherent,
minimal contextual-help architecture for Writer's Studio.

This is not a documentation project.
This is not a product tour.
This is not permission to explain every control.

The governing question is:

> What is the minimum help architecture that lets a writer understand an
> unfamiliar act before committing to it, without making explanation compete
> with writing?

The governing principle is:

> Help should live as close as possible to the unfamiliar act, appear when
> meaning is sought, and answer only what the writer needs to know before
> choosing that act.

### 0 · AUTHORITY / CURRENT STATE

Begin by reconciling the live repository against the current Writer's Studio
programme record.

```text
FR-B   CLOSED
FR-C   RULED · C
FR-D   CURRENT SUBJECT
FR-F   follows FR-D
FR-E   belongs to WS2-07 sequencing, not this flow
BUILD  not authorized until FR-D is constituted / rule-recorded
```

FR-C governing sentence: *A Studio may reveal its larger architecture before
every room is usable, but it must distinguish intentional incompleteness from
malfunction or lack of access.*

FR-C consequence: **visible + unavailable → state must be said, not merely
implied.**

Candidate language only: `"Not available yet"` · `"Planned — not available yet"`.
Rejected: `"Coming soon"` where it implies a delivery promise.

Important FR-C finding: *"Very few options are present and useful"* is the
**correct reading of the rendering** — not founder misperception, and not
evidence that destinations should disappear.

Known reconciliation: `studioMap.ts` contains a NO ROADMAP LEAKAGE rationale
that may appear to contradict FR-C. It currently governs `visibleDestinations`,
which has no member-facing consumer. **Do not silently preserve contradictory
guidance.** Reconcile the comment/rationale in the same implementation act that
implements FR-C.

### 1 · FR-D PURPOSE

Writer's Studio must answer threshold questions when a writer needs meaning:

1. What is this?
2. Why would I use it?
3. What does this act enable or change?
4. Where consequential: what happens if I do it?

The founder's first unaided gesture was hover-for-meaning. Treat that as evidence
that the writer expected **the object itself to explain itself**.

⛔ Do NOT interpret this as "put tooltips everywhere."

### 2 · HELP ARCHITECTURE

Progressive disclosure. The smallest surface capable of carrying the required
meaning wins.

```text
1  clear label
2  short inline descriptor where meaning must remain continuously visible
3  object-local contextual explanation
4  contextual help affordance where more explanation is genuinely required
5  larger guidance only where the smaller surfaces cannot carry the meaning
```

Input methods must be equivalent:

```text
pointer   → hover / intentional click
keyboard  → focus
touch     → tap / accessible contextual affordance
```

⛔ Hover-only help is not acceptable.

### 3 · HELP ≠ STATE

```text
HELP    may be progressively disclosed
STATE   must be directly perceptible where the writer needs it to interpret
        the control correctly
```

Example:

```text
Notes
Not available yet
```

⛔ Do not hide constitutionally important state, consent, refusal,
unavailability, or consequential effects behind hover/help UI.

### 4 · ORIENTATION ≠ INSTRUCTION

Studio orients before it instructs. Before entry into a destination, answer only
enough to understand *what is this* and *why might I want it*. After the writer
chooses the destination, local guidance may explain the specific acts there.

⛔ Do not teach the entire workflow at the House / rail / mode-choice layer.
**The writer came to write, not to learn software.**

### 5 · DISCOVER BEFORE BUILDING

Inspect the actual implementation before proposing a component system.

```text
CENSUS
  StudioShellRail · StudioModeBar · Studio Home · studioMap.ts
  existing labels / descriptors
  existing hover / focus behaviour
  existing tooltips / popovers / help primitives
  mobile / touch behaviour
  preparation copy · refusal copy · onboarding / guidance copy already present
  disabled / unavailable destination rendering

PER RELEVANT ACT, RECORD ONLY
  CONTROL / DESTINATION
  current label
  current state communication
  existing help, if any
  threshold question left unanswered
  smallest form capable of answering it
```

⛔ Do not produce a generic UX inventory.

### 6 · HARVEST BEFORE INVENTING

Reuse existing product language and interaction primitives wherever they already
answer the threshold question.

⛔ Do not create: a second help system · a parallel Studio navigation grammar ·
a new product tour framework · a documentation center · a help ontology · a
tooltip registry merely because one could exist.

If an existing primitive is adequate, use it.

### 7 · FR-D RULING GATE

Before implementation, produce ONE decision-ready FR-D proposal containing:

```text
A  governing sentence
B  help / state distinction
C  progressive-disclosure hierarchy
D  cross-input behaviour: pointer / keyboard / touch
E  where help must remain visible rather than requested
F  explicit exclusions
G  examples using ACTUAL Writer's Studio controls
```

**The proposal must be capable of failing against the founder walk.**

⛔ Do not authorize yourself to build from your own proposal. **STOP for founder
ruling.**

### 8 · IMPLEMENTATION — ONLY AFTER FOUNDER AUTHORIZATION

```text
A  implement FR-C and FR-D coherently
B  reconcile the NO ROADMAP LEAKAGE comment / rationale
C  preserve destination architecture
D  add explicit unavailable state where required
E  add contextual meaning only where the census establishes a threshold gap
F  preserve touch, pointer and keyboard access
G  avoid explanatory clutter
H  do not alter Writer's Studio capability semantics
```

### 9 · PROOF

Prove with actual rendered Writer's Studio surfaces, not component assertions.

```text
DESKTOP                 pointer user can obtain meaning before committing
KEYBOARD                equivalent meaning reachable by focus / navigation
TOUCH                   equivalent meaning available without hover
UNAVAILABLE DESTINATION writer can tell "not available yet" from broken /
                        empty / unauthorized
KNOWN DESTINATION       no unnecessary help clutter is introduced
WRITING FLOW            contextual help does not compete visually with writing
FIRST-USE               writer understands what unfamiliar acts are for without
                        consulting external documentation
```

### 10 · ANTI-OVERBUILD TEST

For every help element added, ask:

> If this disappeared, would a reasonable writer still know enough to choose
> correctly?

```text
YES  → remove it, unless another ratified requirement requires it
NO   → keep it, at the smallest adequate layer
```

### 11 · CATEGORY GUARDRAIL

```text
surface change     → repair / design
behavioral power   → constitutional inquiry
```

This flow may change presentation and contextual explanation. It may **NOT**
change: authorship authority · writing authority · memory behaviour ·
provenance · access rights · destination capability · mode semantics · refusal
authority · any constitutional boundary.

⛔ If the proposed UX requires changing what Writer's Studio is permitted to do,
**STOP.** That is no longer FR-D.

### 12 · BRANCH / CUSTODY

```text
fetch current canonical
establish current branch / head / tree
create or use the explicitly designated bounded branch
inspect before editing
harvest existing work
implement only after ruling
prove
open PR
rebase / reconcile near merge if canonical moved
re-prove
founder authorizes merge
update programme records only when operational state actually changes
```

⛔ Do not merge without founder authorization.

### 13 · STOP CONDITIONS

```text
STOP if
  canonical / branch identity is uncertain
  the live Studio differs materially from the recorded FR-C subject
  implementation would require new behavioral authority
  existing help infrastructure conflicts with the proposed form
  touch cannot receive equivalent meaning
  FR-C and FR-D cannot be implemented without reopening a prior ruling
  a new architecture duplicates an existing one
  evidence contradicts the FR-D proposal
```

Surface the contradiction. **Do not resolve it silently.**

### 14 · SUCCESS TEST

> FR-D succeeds when a writer can encounter an unfamiliar Studio act and,
> without leaving the immediate context, understand enough to decide whether to
> use it — while the Studio remains primarily a place for writing rather than a
> place for learning the software.

> **The strongest implementation will feel like the Studio simply knows when
> something needs explaining. It should not feel like Help has been added.**
