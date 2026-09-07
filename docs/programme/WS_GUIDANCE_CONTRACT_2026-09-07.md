# Writer's Studio Guidance Contract — design packet

**Status:** DESIGN ONLY · authorizes no build · drafted by an agent, ruled by the founder
**Drafted:** 2026-09-07 · source `3027ceaff`
**Inputs:** `WS_LAUNCH_CENSUS_2026-09-07.md` (A/B/C/D), `WS-LAUNCH-READINESS-01` flow

## The problem it solves

Find helps a writer locate their writing. Guidance helps them understand the
Studio. A tester who lands and thinks *"what do I do?"* should not have to hunt
for documentation, and should not have been expected to remember a wizard they
saw twenty minutes ago. **The Studio should teach itself while the writer works.**

## The governing constraint

The census question, applied to speech:

> What claim is the interface making right now, under this exact state, and is
> that claim true?

A guidance layer is a **new place MAIA can be wrong**, and wrong with her voice
behind it. A stale tooltip misleads; a confident MAIA telling a member their
Studio can do something it cannot is a claim failure with authority attached.

## §1 · Availability is DERIVED, never authored

**The single most important rule in this contract.**

Guidance must compute availability from the same source the rail uses —
`STUDIO_MAP` through `shellDestinations()` — never from prose in a registry.

```text
FORBIDDEN   registry entry: "Find isn't available yet"
REQUIRED    registry entry: concept meaning only
            availability: resolved at answer time from the live map
```

Reason: a hand-written availability string is a second source of truth. The day
Find ships, the rail becomes right and MAIA becomes wrong, and nothing fails
loudly. Derivation makes that drift structurally impossible.

The A/B/C/D classes translate directly into what MAIA may say:

```text
A LIVE          "You can do this here." — name the door
B CONTEXT       "Not until X." — name the PREREQUISITE, not the absence
C UNBUILT       "That isn't in Writer's Studio yet." — no date, no promise
D CLAIM FAILURE MAIA must not paper over a defect. Report, don't reassure.
```

## §2 · One vocabulary, two surfaces

A single canonical guidance registry, keyed by concept:

```text
Work · Source · Working Draft · Section · Structure · Materials
Keep a version · Develop · Lens · Reading · Observation
Rests on · Does not establish · Conversation · Standing · Export
```

Each entry carries:

```text
short        1-3 sentences · hover / focus / TAP
full         conversational form for Ask MAIA
prerequisite what must be true first (a concept, not a status string)
```

**Two surfaces, one meaning.** Tooltip copy and MAIA guidance maintained
separately WILL drift; that is not a risk, it is a certainty.

Reuse the language already in the room. `LENS_MEANING`, `INVOCATION_SENTENCE`,
the Goals copy, and the dialogue bounds line are already the strongest
explanatory writing in the Studio — distributed across invocation, preparation
and refusal moments rather than organised as arrival guidance. **Promote, do not
re-author.**

Each entry answers three questions and stops:

```text
What is this?   Why would I use it?   What happens if I do?
```

*Keep a version* — "Sets down the current state of your writing so MAIA can
distinguish what you kept from what changed later. It does not publish or freeze
your work."

## §3 · Ask MAIA is not a destination

It opens **in place**, inside the current Studio context. It never navigates the
writer away from their Work.

That is the lesson already paid for: Conversations sent the writer to `/maia`,
and `situatedHrefs` in `studioMap.ts` exists precisely because a link that opens
an unsituated chat is a promise the room cannot keep.

## §4 · The Studio Context Envelope

What MAIA receives. Facts the shell actually counted — never inferred.

```text
room               Home | Write | Develop
work               declared Work, or NOT DECLARED
manuscript         current manuscript, or NONE
section            current section, if one is open
studio state       source · draft · versions kept · materials · reading exists
current object     observation | reading | material, if open
available actions  DERIVED (§1), with class per action
```

**Not the manuscript.** Not its text, unless the question requires it and the
member's question authorizes it.

### The unknown rule — D-01's lesson, generalized

Every envelope field is three-state:

```text
KNOWN PRESENT   the fact
KNOWN ABSENT    "there is no draft yet"
UNKNOWN         "I could not find out"
```

**Never round UNKNOWN to ABSENT.** `observationDialogueResume.ts` already refuses
exactly this rounding, and says why: *"`fresh` here would be a transient GET
failure silently authoring a duplicate thread."* The guidance layer's version is
worse — MAIA would tell a member they have no kept versions when the truth is she
could not check. That is `Versions 0` (D-01) spoken aloud.

## §5 · What "what should I do next?" may mean

The constitutionally dangerous question, and the one testers will ask first.

`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY`: *MAIA never moves a person through it —
it protects the boundaries within which the person's own development occurs.*

```text
PERMITTED    name the doors that are open, and what each leads to
             state a condition the writer may act on
FORBIDDEN    rank the doors by what the writer SHOULD do
             score, urge, or imply a correct order
             act, or offer to act, for the writer
```

May say: *"You have changed the draft since the last kept version. If you want
Development to read this state as something you deliberately set down, keep a
version first."*

May not say: *"I recommend you keep a version now."* — absent a member-owned
reason the writer supplied.

**Posture:** orient · explain · point · clarify · offer the next available door.
Never: direct · score · decide · edit · act for the writer.

This is the product expression of *the writer remains author*.

## §6 · Refusal is the load-bearing behaviour

MAIA must never invent an available action.

```text
Find not built     "Search isn't available in Writer's Studio yet."
Standing dark      "You can discuss this observation with me, but there isn't
                   currently a control here for recording Keep, Dismiss or
                   Unresolved."
No draft           "There isn't a Working Draft yet. You can begin one from
                   your manuscript."
State unknown      "I couldn't check that just now."
```

Claim discipline becomes guidance discipline: **an advertised capability the
system cannot honour is a claim failure, and MAIA's mouth is an interface.**

## §7 · Default prompts

The panel opens with doors, not an empty box:

```text
Where am I?          What can I do here?          What should I do next?
```

Plus, when an object is open: *Explain what I'm looking at.*

These are the founder-walk questions turned into product affordances.

## §8 · Arrival, not a tutorial

```text
ARRIVAL      short: what the Studio is · what a Work is · where writing lives ·
             MAIA is available whenever orientation is needed
CONTEXTUAL   hover / focus / tap at key concepts
ASK MAIA     persistent, Studio-aware, in place
SMALL        introduce a concept only when the writer reaches its threshold
```

No ten-screen wizard.

## §9 · Falsifiers (predeclared, for whenever this is built)

```text
G1  a C-class action is never described as available
G2  availability in an answer matches shellDestinations() for the same state
G3  UNKNOWN state never renders as ABSENT in an answer
G4  tooltip short-form and MAIA full-form resolve to the SAME registry entry
G5  "what should I do next?" produces doors, never a ranking
G6  Ask MAIA never navigates away from the current Work
G7  MAIA never reports an action as done that she did not perform
G8  when the envelope cannot be built, MAIA says so and answers nothing about state
```

G2 is the one that catches drift, and it is only checkable because §1 forbids
authored availability.

## Related repair, ruled separately

**D-02 CONFIRMED** (founder, 2026-09-07) — low-severity copy defect. Replace
*"Nothing was lost — your question is held here"* with *"MAIA could not be
reached. Your question is still in the box and was not sent."* Copy, not a
persistence subsystem.

## Launch scope this contract serves

```text
P0  Ask MAIA — persistent, Studio-aware guidance
P0  Contextual explanations — load-bearing terms
P0  Find — locate writing in large Works
P1  D-01 Versions truthfulness repair
P1  D-02 dialogue copy repair
P1  Arrival orientation — short, not a tutorial
P2  everything honestly unavailable stays unavailable
```

## What this document does not do

It authorizes no build, defines no component, and writes no registry entries. It
is the contract a build would have to satisfy.
