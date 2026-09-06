# Reflections — a gentler threshold into conversation

**Status: authorized scope, not yet built. 2026-09-06.**

## The Reflections-native reason

Not *"Journal is cleaner, therefore Reflections should become transient."* That
would be the mirror of the error the two-specimen method exists to prevent.

The reason is native to this room:

> **Reflections needs a gentler threshold into conversation, not less conversation.**

Journal revealed a quality of relational arrival — MAIA meets the member's
material by noticing, rather than by presenting an empty conversational surface.
That quality belongs in Reflections. The room's defining activity does not change:
*carrying a reflection into conversation with MAIA*. Only **how that conversation
begins** changes.

## Shape

```text
member opens kept reflection
        v
Discuss with MAIA
        v
MAIA's first canonical response appears quietly
in relation to the reflection:

    MAIA noticed   ...
    MAIA asked     ...

        v
Continue with MAIA
        v
contained canonical conversation
same thread - same response - no regeneration
```

## Load-bearing constraint

> **One exchange, two presentations.**

```text
DO NOT
  transient noticing  ->  generate again when Continue is pressed

DO
  one canonical exchange  ->  two presentations of the same exchange
  quiet first presence    ->  expanded continuing conversation
```

The first noticing **is already the canonical MAIA response in the thread**.
`Continue with MAIA` changes presentation depth, nothing else. Presentation
changes; ontology does not.

This yields:

- Journal's intimacy and restraint
- Reflections' continuing relationship
- no duplicated cognition
- no second MAIA identity
- no second generation
- **no retroactive persistence problem** — nothing transient is later smuggled
  into persistence, because nothing here was ever transient
- **no change to B's status** in the extraction

## Why B survives this change

```text
Journal      transient noticing        (nothing persists)
Reflections  persistent conversation   (the noticing is canonical from birth)

B  canonical thread continuity  ->  still ROOM-SPECIFIC
```

`MAIA_PRESENT_WITHOUT_BECOMING_THE_PLACE.md` (9915cc6e) remains true. The rooms
still diverge on B; they now converge on the *manner of arrival*, which is the
cross-field familiarity layer, not an invariant.

## Sharper principle this establishes

> **Conversation does not have to announce itself as conversation immediately.**

MAIA can first meet the member's material with restraint, and let the member
decide whether to deepen into the full conversational space.

## Ruling — Reflections-local composition, NOT a CMT-01 change (2026-09-06)

```text
CMT-01
  -> what constitutes the canonical turn
  -> identity, inputs, authority, candidates, gates, cognition path

REFLECTIONS OPENING
  -> how the already-canonical cognition is asked to compose its first reply
     for this room-specific threshold
```

**Do not touch:** `lib/maia/canonical-turn/**` - the producer registry - MIPA/M3 -
canonical candidate construction - canonical gates - turn identity.

### Verified precondition — the separation already exists and is enforced

Statically confirmed in `app/api/sovereign/app/maia/list/route.ts`. The route
constructs the canonical-turn **shadow** separately from the live
`getMaiaResponse` call, and the live call's `meta` object carries the
**PROMPT-AUTHORITY INVARIANT (PBR-001, 2026-08-12)**: the client request-body
rest-spread sits at the TOP of `meta` precisely so that *client-carried metadata
may not override server-authored context that enters MAIA's system prompt*. That
placement was chosen to fix the whole class at once rather than field by field,
after the same authority inversion was closed on `depthConfig` (SECREM-001).
`placeAddendum` is already a server-authored field in that class.

**Consequence:** `reflection_opening_v1` joins that class and is structurally
incapable of being supplied or overridden by a caller. The scope rests on an
invariant that exists, not on a convention.

## What to build

A **server-authored response-form contract** for the first handoff turn:

```text
responseForm = reflection_opening_v1

produce:
  noticed: one concise observation grounded in the reflection
  asked:   one genuine question arising from that observation
```

### Direction of authority

```text
model produces noticed + asked
        v
server returns structured fields
        v
UI labels them

NOT
model produces prose
        v
UI guesses which sentence was "noticed" and which was "asked"
```

This is what closes the attribution problem. A UI that split prose into labels
would assert a structure the cognition never produced — the same defect family as
a paraphrase inside quotation marks. **The labels must be true because the model
produced them, not because the interface arranged them.**

The server composes the canonical assistant text from those generated fields, so
the durable exchange carries the same semantic content the inline page displays.

```text
Discuss with MAIA
  -> one canonical POST
  -> one exchangeId
  -> one generated response
  -> durable member + MAIA turn

inline presentation      -> MAIA noticed / MAIA asked
Continue with MAIA       -> open existing canonical conversation
                         -> restore same exchange
                         -> NO injection, NO regeneration
```

### Ownership

```text
REFLECTIONS              first-response composition contract
                         inline noticing presentation
                         Continue gesture

CANONICAL SERVING ROUTE  validating this is the Reflections handoff seam
                         server-authoring the response-form instruction
                         producing + persisting the single exchange

CMT-01                   unchanged
```

### Escalation boundary — a hard stop, not a guideline

> If implementing `reflection_opening_v1` requires changing
> `constructCanonicalTurn`, the 38-producer registry, canonical candidate/gate
> semantics, or MIPA/M3 — **STOP.** The work has crossed into CMT-01 and needs
> that lane's authority.

**Do not bend that lane to make this feature fit.**

### Naming discipline

This is **not** "use Journal's response schema." Reflections derives its own
`reflection_opening_v1`. It may converge on the same human grammar — *MAIA
noticed / MAIA asked* — because that is becoming recognizable MAIA behaviour
across fields, while the **fate** of the response stays room-specific:

```text
Journal      noticing -> transient
Reflections  noticing -> canonical + continuable
```

Same presence, different posture — the cross-field familiarity layer doing
exactly the work it was separated out to do.

---

## Implementation FROZEN — architectural dependency on CMT-01 (2026-09-06)

The build was carried out under the authorized scope above and stopped at a
governance boundary before commit. **The design is not rejected. It is blocked
on an instrument that cannot yet see it.**

### State reached

```text
COMPLETE + GREEN   lib/maia/reflections/reflectionOpening.ts
                   9 required tests + HARD STOP import test (64/64 in the suite)
                   route seam detection (place=reflections + objectId + signal)
                   server-authored instruction (client sends a signal, never text)
                   truthful failure when noticed/asked cannot be parsed
                   Continue with MAIA -> openMaia() with NO injection
                   openMaiaWith removed (a second send was structurally possible)
                   no file under lib/maia/canonical-turn/** modified
```

### Ship gate — one NEW diagnostic

```text
lib/sovereign/maiaService.ts:1790
TS2561: Object literal may only specify known properties,
        but 'reflectionOpeningAddendum' does not exist in type 'MaiaContext'.
```

Every other diagnostic on the touched routes is pre-existing baselined debt.

### Why the one-line fix was NOT applied

Adding `reflectionOpeningAddendum?: string` beside `placeAddendum?: string` in
`MaiaContext` would make the gate green in seconds. It was refused because the
compiler error is standing in for a constraint the compiler cannot express:

```text
reflection_opening_v1 reaches the FAST prompt as a new addendum.
The canonical shadow does not model it — no producer, no mapping.

lib/maia/canonical-turn/shadow.ts
  LEGACY_META_KEY_TO_PRODUCER = { ... } as const satisfies Record<string, ProducerId>

`satisfies` proves every listed key maps to a real producer.
It does NOT prove the list covers MaiaContext.

=> the allowlist is not exhaustive
=> TypeScript would accept an unmodelled prompt-reaching input
=> the live M2 shadow would keep reporting zeroDiff
   while a real input to the turn sat outside the construction it witnesses
```

That is not a lint failure. It is the witness silently going partially blind
during the exact window it is being trusted to be complete.

### Founder ruling — WAIT

Option 2. Explicitly declined:

- **Option 3** (declare it out of scope of canonical accounting) — *"once it
  enters the prompt and changes what the model is asked to produce, it is still
  an input to the canonical turn."*
- **Option 1** (decree the representation here) — deciding it outside CMT would
  itself be the crossing this document forbids.

> Do not add the one-line `MaiaContext` field merely to make TypeScript green.
> The compiler error is currently doing us a favor: it keeps the unsound state
> from becoming easy to ship.

### The open question CMT must answer

Is **response form**:

```text
(A) content participating in the turn
    -> it needs a ProducerId and must pass through MIPA adjudication

(B) a parameter of the cognition request
    -> it sits alongside mode / requestedDepth / voiceProfile
    -> it shapes what is asked, it is not one of the voices asking
```

Working instinct is **B** — the form of the answer is not itself a claimant on
the answer. But instinct is not authority: CMT-01 owns this, and the ruling
belongs to that lane.

### Unfreeze sequence

```text
finish CMT-01 M2 live shadow witness
  -> unfreeze the CMT lane (currently single-writer)
  -> CMT rules: CognitionRequest parameter OR registered producer
  -> represent response form canonically
  -> resume reflection_opening_v1 against that representation
  -> typecheck + 64 tests + new CMT parity tests
```

### Prohibitions in force until then

1. **Do not widen the open `meta` channel** to slip the addendum through.
2. **Do not invent a producer** outside CMT-01's registry authority.
3. **Do not exempt response form from canonical accounting** because it is
   inconvenient to model.

### Preserved, not lost

> Nothing we learned invalidates the Reflections design — noticing added,
> continuation kept, one exchange, two presentations. We have discovered that
> the requested form itself needs to become visible to the canonical-turn
> instrument before we can ship it. That is an architectural dependency, not a
> rejection of the design.

### Where the frozen code lives — custody, not candidacy

```text
frozen implementation
  branch  frozen/reflection-opening-v1-cmt01
  commit  2b5d153c

status
  preserved, blocked on CMT-01
  ship gate RED at that commit (TS2561)
  no PR / not merge-eligible under current gates
```

The ruling froze the implementation in an uncommitted working tree. That tree
lived in an ephemeral remote container which is reclaimed on inactivity, so
holding it there would have destroyed it rather than preserved it. It was
therefore committed — and then **moved off the active branch**, which stays
documentation-only. The active branch is the governed work surface; the frozen
branch is custody.

**Claim discipline on the strength of this barrier.** An earlier draft of this
record said the commit was *structurally unmergeable* and *cannot become a
merge*. That is stronger than the mechanism earns — a red gate can be worked
around by cherry-picking, by a non-standard promotion path, or by someone making
the type error disappear while leaving the canonical-accounting defect
unresolved. The supportable claim is narrower:

> The commit is not eligible for normal promotion while the required ship gate is
> red, and it is deliberately stored on a non-merge branch.

Two independent barriers, neither of them absolute:

```text
gate barrier       typecheck RED at 2b5d153c (TS2561)
                   -> blocks normal promotion
                   -> defeated by greening the error, which is the
                      forbidden crossing

custody barrier    stored on frozen/reflection-opening-v1-cmt01
                   -> never a merge candidate
                   -> defeated only by a deliberate cherry-pick
```

Greening the gate without the CMT-01 ruling defeats the first barrier while
leaving the actual defect — an unmodelled prompt-reaching input invisible to the
shadow — fully intact. That is the failure mode this record exists to make
legible in advance.

Files carried in the frozen commit:

```text
app/api/sovereign/app/maia/list/route.ts
components/reflections/DiscussWithMaia.tsx
lib/maia/presence/__tests__/injection.test.ts
lib/sovereign/maiaService.ts
lib/maia/reflections/            (new)
```
