# WRITER'S STUDIO — LIVING VOICE · 01
## FOUNDER RULINGS

**Ruled** 2026-09-08 on `…_RECOVER_DISCOVER_2026-09-08.md` **Standing** OPERATIVE

> ## THE GOVERNING CONTRACT
>
> **Living Voice helps the writer encounter more possibilities in their own
> writing. It does not determine what the writing should become.**
>
> **MAIA notices from the Work, invites without judgement, and returns the act
> of writing to the writer.**

---

## LV-0 · LIVING VOICE IS NOT AN APPEARANCE THEME — structural

The DISCOVER proposed making Living Voice an atmosphere within the existing
engine. **Corrected.** That would collapse two different things:

```text
APPEARANCE      How the room looks.
LIVING VOICE    What kind of creative attention the writer explicitly invites.
```

Living Voice **may** use the existing `atmosphere/` primitives for visual
coherence. It **may not** become a value in the appearance engine.

> ⛔ **Selecting parchment, charcoal, or any appearance must never silently
> change MAIA's behaviour. That separation is structural.**

## LV-A · SELECTION IS THE SUBJECT, NOT THE OCCASION

A writer selects text constantly while editing. If selection invited creative
guidance, **Living Voice would become ambient interruption.**

```text
select passage                              → establishes "this"
select + explicit Living Voice gesture      → creates the occasion
```

> ⛔ **No model call merely because text is highlighted.**

The Goals lesson, holding in a new place: **state is not invitation.**

## LV-B · ENTERING LIVING VOICE IS A GRANT, NOT AN OCCASION

Entering means *"I am open to this kind of creative attention while I am
here."* It does **not** mean *"speak whenever you have something."*

```text
ENTER LIVING VOICE              → grant / context
SELECT PASSAGE                  → subject
CHOOSE A LENS / INVOKE          → occasion
```

**grant ≠ subject ≠ occasion.** FR-14 separated two terms; Living Voice needs
three, because the thing being attended to is now a specific piece of the
writer's own text.

> **Living Voice stays beautifully quiet until the writer asks it to meet
> something.**

## LV-C · NO DURABLE INFERRED VOICE PROFILE — ruled hardest

The existing contract is kept exactly:

> *The established voice OF THIS WORK is the reference.*

⛔ **It may not evolve into** *"Kelly's voice is lyrical, mystical,
image-heavy…"* — **that is the person-classification already prohibited, even
when it sounds complimentary.**

```text
MAIA MAY        compare a selected passage with other passages in this Work
                notice how voice behaves within this Work
                cite evidence from the Work
                e.g. "Elsewhere in this manuscript your sentences become
                      more spare and direct."

MAIA MAY NOT    persist a writer personality or voice type
                score voice
                infer "your natural writing style" as a personal trait
                carry a voice characterization from one Work to another
```

### VOICE ANCHORS — where durability is lawful

```text
INFERRED VOICE PROFILE     MAIA defines who the writer is          → NO
VOICE ANCHOR               writer says "this sounds like the
                           Work I want"                            → YES
```

Writer-chosen passages, in this Work. **Authored, not inferred.** Not built in
v1; recorded because it is the lawful shape durability would take.

## LV-E · "MAKE IT MORE ALIVE" IS NOT THE CAPABILITY'S NAME

The objection is valid: **as the system's framing it asserts the passage is
insufficiently alive** — an evaluation smuggled into a verb.

```text
⛔ MAIA presents      "Make this more alive"
                      → she has determined the passage lacks life

✅ writer chooses     "I want to make this more alive"
                      → the writer naming their own intention
```

**Default interface: `Explore this passage` / `Creative lenses`.** No prior
claim that the writing is deficient — the writer is simply asking *what other
possibilities are available here?*

## LV-F · THE LENSES, CORRECTED

```text
SEE IT          give the reader something they can picture
FEEL IT         let the feeling live in something concrete
HEAR IT         listen to the rhythm of the sentence
GO CLOSER       is there something you're circling that you want to
                approach more directly?
CLARIFY IT      does the writing know what it is doing?
```

**`SIMPLIFY` → `CLARIFY`.** *"Simple" can accidentally privilege plainness over
poetic complexity. A dense, strange, lyrical sentence may be exactly right.*
Clarify asks whether the writing knows what it is doing **without implying that
complexity is bad.**

**`RISK IT` → `GO CLOSER`**, and the boundary is the point: **creative courage,
never pressure to disclose.** ⛔ Not *"tell me the trauma."*

## LV-G · THE ELEMENTAL LAYER IS DEFERRED

⛔ **Not exposed as mandatory writing categories in v1.** Later, an optional
second presentation of the same lenses. The mapping is recorded, not built:

```text
FIRE     voice / impulse            AIR      clarity / shape
WATER    feeling / image            AETHER   meaning / relationship
EARTH    sensory specificity
```

> **Elemental language should deepen an already useful practice, not become
> vocabulary someone has to learn before they can write.**

First prove that Voice · Image · Rhythm · Specificity · Meaning · Courage
actually help writers.

## THE INTERACTION

```text
writer enters Living Voice
        ↓
writer selects passage
        ↓
writer explicitly asks to explore it
        ↓
MAIA offers one or a few lenses
        ↓
writer chooses
        ↓
MAIA notices / asks / points
        ↓
WRITER WRITES
```

```text
no automatic rewrite · no score · no persona
no "this isn't alive enough" · no unsolicited craft critique
```

## AUTHORIZED NEXT

```text
CONSTITUTE   these rulings          ← this document
DESIGN       the minimum Living Voice interaction
⛔ NOT       the entire programme
```

Then a prototype of **one** experience, tested on **three very different pieces
of writing** — lyrical/poetic · memoir/personal · teaching/practitioner.

> ⭐ **Not three writer types. Three Works.**

## ACCEPTANCE QUESTION

> **Did this help me hear more possibilities in my own writing without making
> me feel corrected, graded, or rewritten?**

*If yes, Living Voice has found its center.*

---

# ADDENDUM — LV-I and LV-J · founder rulings, 2026-09-08

Both were held open deliberately during the build, on the founder's instruction
to *"keep those two decisions open until you have implementation evidence."*
They are ruled here, on that evidence, after the prototype existed.

## LV-I · PASSAGE BOUND — **RULED**

> ⭐ **The relationship is constitutional. The literal implementation number is
> not.**

```text
LV-I

constitutional:
  passage-scale
  writer-selected
  whole selection or refusal
  never truncated
  never auto-expanded

implementation v1:
  LIVING_VOICE_PASSAGE_MAX_CODE_POINTS = 2_000
  provisional
```

⛔ **`2_000` MUST NOT BE ELEVATED INTO LAW.** It is a provisional implementation
constant for the first prototype, expected to move once real writers meet it.
Changing it is an ordinary tuning; changing any of the four properties above is
a constitutional amendment.

The law it expresses:

> Living Voice receives a **passage**, not an arbitrarily large region of the
> Work. The writer chooses the passage; the system never truncates or enlarges
> it.

**No sizing study was conducted, deliberately.** Ruled: *"I would not delay the
first witness to conduct a sizing study. Use 2,000, see whether real writers
naturally hit it, then adjust the implementation constant from evidence."*

### The threshold tells the truth before the writer crosses it

```text
selection within bound   →  Explore this passage
selection over bound     →  Choose a shorter passage to explore
```

No truncation. **No network request.** Making the writer press the control,
enter the encounter, and only then meet a wall stages an invitation the system
has already decided to decline.

⛔ **CLIENT ENFORCEMENT IS NOT CUSTODY.** The route calls `checkPassage`
independently and refuses on its own authority. Deleting `canOfferPassage()`
would degrade the experience; deleting the server check would remove the bound.
The test `the door check and the custody check agree, and neither truncates`
pins that they are two checks rather than one.

## LV-J · DISCLOSURE MEMORY — **RULED**

```text
LV-J

DISCLOSURE SEEN      device-local UI state
PASSAGE AUTHORITY    never remembered · freshly given on every encounter
```

A versioned browser-local flag, `living_voice_disclosure_seen_v1`.

| may live in | ⛔ may not live in |
|---|---|
| `localStorage` on this browser | a member DB attribute · MAIA memory · Work metadata · analytics · a voice profile · a cross-device preference |

Cleared storage, a private window, or another device means the writer sees the
disclosure again. **That is the correct outcome, not a defect.**

> ⭐ **Remembering that the disclosure was shown is not remembering permission.**

The stored flag suppresses repetitive explanatory copy. It authorizes nothing.
Every encounter still requires both acts, every time:

```text
select passage  +  explicitly press "Explore this passage"
```

That pair is the authority. A writer who has seen the disclosure a hundred
times has granted nothing by having seen it. **If the disclosure materially
changes, increment `DISCLOSURE_VERSION` and every writer sees it again** — a
silent edit under an old key would let changed text ride on an
acknowledgement of the previous text.

⛔ **STRUCTURAL SEPARATION, PINNED BY TEST.** The flag lives in its own module
(`lib/writersStudio/livingVoiceDisclosure.ts`), and the test *"having seen the
disclosure authorizes nothing"* asserts that neither the encounter core
(`livingVoice.ts`), nor the hook, nor the route imports or names it. If the flag
could reach the send path, *seen* would have quietly become *permitted*.

## CUSTODY CORRECTION — what `cc6846fb6` actually is

Founder correction, recorded because it matters for custody: `cc6846fb6` is
**prototype-complete on the sectioned Canvas path**, not Living Voice v1
complete across WRITE.

```text
SectionWritingSurface   ✅ Living Voice reachable
Worktable               ⛔ no Living Voice entrance yet
```

Ruled: **no second product ruling is needed.** Once the prototype is witnessed
and accepted, the same Living Voice core is made reachable from `Worktable` —
**no second implementation, no different semantics.** Parity does **not** block
the first witness: *"the point of the prototype is to hear whether the
relationship works."*

## STANDING

```text
LV-I       RULED · 2,000 provisional for prototype
LV-J       RULED · disclosure memory device-local only
LV-H       RATIFIED
PROTOTYPE  built on sectioned Canvas
WORKTABLE  parity owed after prototype acceptance
MERGE      HOLD
DEPLOY     HOLD

NEXT       founder Living Voice witness
```

## THE WITNESS

A real passage from a real Work, several very different lenses.

| lens | the question it must survive |
|---|---|
| **See it** | Does MAIA help you notice where an abstraction might become perceivable — **without telling you the passage is deficient**? |
| **Hear it** | Does she invite attention to rhythm **without becoming a copy editor**? |
| **Go closer** | Does she invite creative courage **without pressuring intimate disclosure**? |
| **Clarify it** | Does she help expose what the sentence is trying to carry **without privileging plainness over poetry**? |

And **deliberately decline one invitation**. Declining should feel like nothing
happened, not like you disappointed the system.

### Acceptance

> **Did Living Voice help me hear another possibility in my own words while
> leaving me more — not less — in possession of the writing?**

Companion:

> **Did I feel invited to experiment, or subtly informed that my writing was
> inadequate?**

*If those pass, Living Voice has found its center.*

---

## ACCEPTANCE DISCRIMINATOR — recorded 2026-09-08, before the first witness

Placed here, in the witness and acceptance section, and **deliberately not in
the falsifier contract.** Where it is written is part of what it says.

> ⭐ **Living Voice acceptance discriminator:**
>
> **Did MAIA open possibility, or quietly establish a preferred direction?**
>
> A response may satisfy every mechanical prohibition and still fail Living
> Voice if its overall stance leaves the writer feeling gently managed,
> corrected, or steered toward what MAIA prefers.
>
> That failure is **relational, not lexical**. Its remedy belongs in the Living
> Voice system prompt, lens framing, or interaction stance — **not** by
> continuously enlarging `checkLivingVoiceResponse` until lawful language
> becomes impossible.

Companion, and the two are kept together:

> **Do I hear more possibilities in my own writing, or do I become more aware
> of what MAIA wants from it?**

### ⛔ WHY THIS MUST NOT BECOME A FALSIFIER

`checkLivingVoiceResponse` detects **moves** — evaluation, diagnosis, rewriting
offered as the answer, disclosure pressure, classification, unlawful claims
about the Work, reaching past the passage. Each is a discrete act, present or
absent in a sentence, and that is exactly why it can be checked.

**Warmth that functions as instruction is not a move the checker missed.** It
is a property of the whole response — stance, not vocabulary. Every regex that
could catch it would also fire on lawful responses, because the words a gently
steering response uses are the same words an opening one uses. An instrument
enlarged until it caught this would not have become stricter; it would have
made honest speech unavailable, and Living Voice would go silent for reasons
that have nothing to do with its constitution.

> *The checker can detect prohibited moves. It cannot detect warmth that
> functions as instruction — and it is not supposed to.*

So this criterion is answered by a **writer**, in a witness, and by nothing
else. If the witness returns *"too teacherly"* or *"it wanted something from
me"*, the repair is to the relationship — the system prompt, the lens framing,
the interaction stance. ⛔ **Do not translate an experiential failure into
another regex.** That instinct is named here in advance precisely because it
will be strongest at the moment a bad reading arrives.
