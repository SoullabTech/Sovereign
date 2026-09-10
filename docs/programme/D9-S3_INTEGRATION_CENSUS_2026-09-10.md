# D9 ⇄ S3 · read-only integration census

```text
D9      origin/claude/d9-write-integration
S3      claude/s3-implementation @ 0ede87083
PRIOR   claude/two-day-integration-census — read first, not rediscovered
MODE    READ-ONLY · no merge · no cherry-pick · no wiring · no UI edit
```

⚠️ **Two hard-stop conditions are engaged. Both are reported, neither is fixed.**

---

## ⭐⭐ THE KEY FINDING — "FOCUS" NAMES TWO DIFFERENT THINGS

```text
D9 Focus      ATTENTION
              which passage the writer is looking at
              scale-adjustable: selection · paragraph · section · work
              client-side · sends nothing · invalidated when the text moves

Server Focus  DISCLOSURE AUTHORITY
              whether the Work may cross into cognition
              minted per invocation · unforgeable · spent on use
```

⛔ **They are not the same concept and must not be unified because they share a
word.** `heldFocus` is not *"dangerously close to authority"* — it is close to its
**opposite**: an object whose entire discipline is that it never crosses
anything. Its own header says so, and the canvas repeats it at the call site:

> *"EXPLICIT ONLY, AND IT SENDS NOTHING. The gesture opens her and leaves the
> focus standing beside the conversation. Carrying it across a boundary is
> FOCUS-PRODUCER's lane."*

⭐ **That is why the two halves can meet at all.** D9 built the attention model
and deliberately stopped at the boundary; S3 built the boundary. Neither
duplicated the other.

---

## The six questions

### 1 · Who owns the human gesture?

```text
useHeldFocus     CAPTURES it — listens for selection events bubbling out of the
                 Work, reads WHICH SECTION and WHICH OFFSETS
heldFocus.ts     MODELS it — pure; scale ladder, validity, label, quote
FocusStrip       RENDERS it and offers `onAsk`
canvas/page.tsx  WIRES it — `onAsk={openMaia}`
FieldRoom        NOTHING — "holds no manuscript state, performs no fetch, and
                 owns no navigation"
```

⭐ The gesture is owned, and **the network act is not**, because there is no
network act.

### 2 · What does `heldFocus` actually represent?

```text
{ scale, sectionIds[], start, end, capturedText }
```

**A live client-side selection carrying its own witness.** `capturedText` is what
the coordinates named at capture, so invalidation is a **comparison rather than a
guess** — *"a focus that quietly moved would be the system deciding what the
writer meant to be looking at."*

```text
selection identity   ✅ YES
visual state         ✅ YES (paint/overlay derive from it)
disclosure intent    ⛔ NO
authority            ⛔ NO — and structurally so: zero network calls
```

⚠️ `capturedText` is authored prose **held in the writer's own browser**. That is
not a disclosure. ⛔ It must never be sent: `C2` refuses caller-supplied Work text
and the route rejects a `focusText` field outright.

### 3 · What happens on the member's press?

```text
onAsk → openMaia
```

**Purely local.** Measured across the whole `field/` directory:

```text
FieldRoom · FocusOverlay · FocusStrip · useHeldFocus · heldFocus ·
focusPaint · fieldTreatments · fieldAperture     0 network calls
```

⛔ **No `actId`-equivalent exists anywhere in D9.** Nothing mints, holds or reuses
an act identity, because nothing sends anything.

### 4 · Where should `BODY_AUTHORITY_REQUIRED` appear?

⭐ **In the MAIA conversation that `openMaia` already opens.** It is the reply to
an Ask, and D9's gesture already ends there.

```text
⛔ NOT FocusStrip   it governs ATTENTION SCALE — Wider / Narrower / Release.
                   Putting a disclosure decision on it would fuse two different
                   questions onto one control.
⛔ NOT FocusOverlay it is inert by construction: aria-hidden, pointer-events
                   none, no handlers, "holds no state, saves nothing, captures
                   nothing".
⛔ NOT a new surface — no new destination, per the ratified contract.
```

### 5 · Who should own `pendingAskRef` / `selectedSectionIds` / `actId` / in-flight?

⛔ **Nothing in D9 owns any of them today.** The correct owner is adjacent to the
MAIA conversation, **not inside `heldFocus`**: putting an act identity into the
selection model would make a rerender or a re-selection able to mint one, and
would give attention a memory of authorization it must not have.

### 6 · Can D9 consume S3 without changing Work geometry or adding a mode?

⭐ **Yes — and the reason is that the gesture already exists.** `onAsk` is
already there, already explicit, already sends nothing. Adding a protocol beneath
it adds no control, no panel and no geometry. R1's measured Work width is
untouched.

---

## Classification

```text
useHeldFocus      REUSE          right owner of capture; contract complete
heldFocus.ts      KEEP SEPARATE  ⭐ attention, NOT authority. Do not extend it
                                 with pendingAskRef, actId or disclosure state.
FocusStrip        KEEP SEPARATE  attention scale. `onAsk` is the seam; the
                                 protocol lives on the other side of it.
FocusOverlay      REUSE          inert mirror; nothing to change
FieldRoom         REUSE          composes; owns nothing
fieldAperture     REUSE          geometry only
canvas/page.tsx   AMEND          the wiring point — `onAsk={openMaia}` is where
                                 the protocol will eventually be reachable
MAIA conversation AMEND          must learn six protocol states
interaction owner NEW            does not exist in either line
```

⭐ **Nothing is SUPERSEDE.** Neither half replaces a concept in the other.

---

## ⚠️ HARD STOPS ENGAGED

### HS-1 · The D9 surface implies passage authority

```text
heldFocus scale     'selection' | 'paragraph' | 'section' | 'work'
FocusStrip renders  FOCUS · PASSAGE IN SECTION 7
```

⛔ **`passage` is reserved vocabulary, not implemented authority** — Q6, ratified.
A writer who frames a sentence, sees the word *passage*, and is then asked to
authorize a **section** has been shown two different scopes for one act.

⭐ **This is a naming collision, not an authority claim.** D9 never authorizes
anything. But the surface's vocabulary and the protocol's vocabulary must agree
before a member is asked to act on either. ⛔ **Not resolved here.**

### HS-2 · The existing Focus surface represents a different concept

The key finding above **is** a hard-stop condition, stated as one. D9 Focus is
attention; `BODY_AUTHORITY_REQUIRED` is a disclosure decision. They are adjacent
in the interface and **must not be collapsed into one control** merely because a
strip is already on screen when the question arises.

---

## ⭐ Two interop facts worth having

**Same namespace.** D9's `focusSections` are `manuscript_draft_sections` ids, and
so are S3's `requiredSections` (via `sectionIdsOf` over evidence refs). ⭐ The two
halves already speak about the same objects.

**⚠️ And a duplicated display fact.** D9's `focusSections` already carries
`{ id, position, heading }` — headings arrive client-side from `write-state`,
which maps `s.heading` out of `resolveDraftWriteState`. Step 4 derives the same
display fact **server-side** from `manuscript_structure_units.title`.

⛔ **Two sources for one member-facing string, and their provenance may differ.**
If `write-state`'s heading does not come from authored structure, the writer could
be shown one name while authorizing a section the protocol names differently.
⛔ Not resolved here; it decides whether step 4's recognition is the single source
or a second one.

---

## Standing

```text
D9 ⇄ S3 CENSUS        COMPLETE · READ-ONLY
KEY FINDING           "Focus" names two different things · do not unify
HS-1 passage wording  ENGAGED · reported
HS-2 different concept ENGAGED · reported

STEP 5 helper amend   PAUSED
STEP 6 interaction owner  owner identified · ⛔ not built
STEP 7 surface        ⛔ not built

⛔ NO merge · NO cherry-pick · NO wiring · NO UI edit
PRODUCTION            untouched
```

⭐ *D9 stopped exactly where the boundary begins, and said so in its own comments.
The two halves were built to meet; what remains is deciding the vocabulary they
meet in.*
