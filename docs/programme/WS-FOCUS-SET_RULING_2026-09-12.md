# FOCUS SET — the governing object

**Founder ruling · 2026-09-12.** ⭐ **Retires "single contiguous range" as the FOCUS data model** and
**resolves U4**, the structural decision the Surface Contract's gate was blocked on.

> ⭐⭐ **What is being built is not highlighting. It is SHARED ATTENTION MADE SPATIALLY VISIBLE
> INSIDE THE WORK.**

---

## 1 · The object

```text
FOCUS SET        a writer-defined set of one or more places in the Work that
                 MAIA and the writer are jointly attending to
MEMBER           one place · one contiguous span
ACTIVE TARGET    exactly one member — where the current action is occurring
```

⭐⭐ **FOCUS MEMBERSHIP AND EDIT TARGET ARE SEPARATE CONCEPTS.** That is the architectural gain, and
it is what makes the loop unambiguous:

```text
Focus · recurring campfire
  F1  §45  first campfire
  F2  §56  second telling      ← ACTIVE
  F3  §57  threshold sentence
  F4  §62  embers
```

MAIA understands the issue **spans all four**. *"Rewrite this one so it doesn't repeat the first"*
carries **no ambiguity about which text she may propose changing.**

### 1.1 ⚠️ THIS IS NOT "PRIMARY + RELATED"

**All members belong equally to the writer's declared Focus.** One is simply where the action is.
⛔ The earlier framing ranked one member above the others; this does not, and the difference matters
— a "related" member implies MAIA may treat it as context rather than as declared attention.

### 1.2 ⭐ WHY DISTRIBUTED ANCHORS, NOT CONTIGUITY

**Developmental writing problems very often exist across distance:** motif · voice · repetition ·
concept introduction · arc · terminology · character development · argument structure. **A model
that can only hold one contiguous span cannot represent the problem the writer actually has.**

## 2 · ⭐ WHAT THE RECOVERED CODE ALREADY GIVES, AND WHAT CHANGES

`app/writers-studio/field/heldFocus.ts` — recovered in Step 1:

```ts
interface HeldFocus {
  scale: 'selection' | 'paragraph' | 'section' | 'work';
  sectionIds: string[];   // document order; many only for 'work'
  start: number;          // into the FIRST section's body
  end: number;            // into the LAST section's body
  capturedText: string;   // ⭐ the focus's own witness
}
```

⭐ **`HeldFocus` is one contiguous span — so the ruling retires it as the GOVERNING object, and
promotes it to the MEMBER type.** Nothing recovered is wasted:

```text
textOf · isValid · capture · label · quote · covers     operate on a MEMBER — unchanged
widen · narrow                                           operate on the ACTIVE member's ladder
FocusStrip · FocusOverlay · focusPaint                   render a member; the set renders many
NEW                                                      FocusSet { label, members[], activeIndex }
```

⭐⭐ **`capturedText` becomes MORE valuable in a set, not less** — distributed anchors go stale
**independently**, and the member's own witness is what makes invalidation a comparison rather than
a guess, per member.

## 3 · The visible treatment — brackets, not highlighting

⛔ **No broad yellow-marker highlighting.** *"It will turn a beautiful writing field into an
annotation tool."*

```text
│  The world slowly becomes increasingly
│  quiet, still, and calm.
│
└─ F3  Refrain
```

**Thin margin brackets. The prose remains the visual centre.** Clicking a bracket makes that member
**active without losing the others.**

### 3.1 ⭐ FOUR OBJECTS ON THE CANVAS, VISUALLY DISTINCT

| object | meaning |
|---|---|
| **Focus bracket** | we are attending to this |
| **Active focus** | this is where we are currently discussing or editing |
| **MAIA proposal** | a possible change — ⛔ not yet the Work |
| **Accepted text** | this is now the manuscript |

> ⭐⭐ **A writer should be able to tell which state they are looking at WITHOUT READING A
> DISCLAIMER.**

## 4 · How a Focus Set is created — three gestures, one object

**From Develop** — the observation already knows its anchors (`§45 §56 §57 §58 §62`):

```text
ask       work with this       done
```

⛔ **`work with this` does NOT make Develop reread anything.** It opens Write/Focus carrying
`origin: observation o1` + `suggested anchors`, **and the current Work is read afresh there.**

⭐ **That is the gesture the constitution already instructs MAIA to name** — `developmentalAskReader.ts`
line 63: *"If they say 'do it', tell them plainly that you cannot, **and name the gesture they would
make**."* **It had no referent. This is the referent.**

**From Write** — `Focus here` · `Add to Focus` on a selection; `Add section to Focus` from the
outline. **Then move elsewhere in the book and add another.** ⛔ Nothing needs to be contiguous.

## 5 · The rail stays quiet

⛔ **No giant Focus panel.** The left affordance changes state:

```text
FOCUS
  4
```

Opening it shows a narrow overlay — the member list, `+ Add another place`, `Release Focus`. Clicking
an item scrolls the manuscript there.

> ⭐ **The list is navigation. THE BRACKETS ON THE WORK ARE THE TRUTH.**

## 6 · MAIA's side, restrained

```text
Working with
Campfire recurrence · 4 places

Active
§56 · Campfire Metaphor
```

⭐ **She has all four CURRENT places, not stale snapshots** — which is exactly what Develop could not
give her, and exactly why crossing into Focus is the answer rather than loosening Develop.

## 7 · ⭐⭐ SUGGESTION IS NOT ADDITION

MAIA may notice a fifth occurrence in Chapter 8 and say so:

```text
Add to Focus       Not now
```

⛔ **Until the writer says yes, it is not part of the working set.**

> ⭐ **That lets MAIA be intelligent without quietly expanding her authority over the Work.**

## 8 · Proposals render IN THE MANUSCRIPT

⛔ **Do not make the writer read a giant diff in the chat.**

```text
┌ MAIA PROPOSED ─────────────────────────┐
  The damp wood resisted the flame tonight...
└────────────────────────────────────────┘
Review   Accept   Revise with MAIA   Reject
```

The Focus bracket stays around it. *"Keep that first sentence but don't use 'resisted'"* changes the
proposal **on the page** — ⛔ still not the manuscript. **Accept** makes it authored state and creates
a revision.

**Across places, the same way:**

```text
PROPOSAL · 3 places
  §45  retain as the sensory establishment of the motif
  §56  replace repeated setup with new phenomenological encounter
  §57  retain exact threshold sentence as refrain
  §62  remove duplicated "this is the part I love most"

1 of 3 changes    Previous    Next
Accept all   Accept this   Revise proposal   Reject
```

⭐ **That is how structural editing across a 200-page book stays comprehensible.** ⭐ And note `§45
retain` and `§57 retain` — the `RETAIN` operation earning its place immediately.

## 9 · The full path

```text
DEVELOP    MAIA notices recurrence → you supply intention → craft reasoning
   ↓ WORK WITH THIS
FOCUS      current manuscript reread · §45 §56 §57 §62 bracketed as one set
   ↓ explore · teach · recommend
PROPOSAL   appears IN THE MANUSCRIPT · you question and modify it
   ↓ ACCEPT
WORK       revision created · ⭐ Focus REMAINS
   ↓ "What about now?"
MAIA       reads the new current state
```

---

## 10 · ⛔ STANDING

```text
U4 focus data model         ⭐ RULED — FOCUS SET, membership ≠ edit target
single contiguous range     RETIRED as the governing object · RETAINED as the member type
bracket treatment           RULED · ⛔ no broad highlighting
ask · work with this · done RULED
proposals in the manuscript RULED · ⛔ not in chat
suggestion ≠ addition       RULED
Step 1 recovery             DONE — heldFocus becomes the member, nothing wasted
FocusSet implementation     ⛔ NOT AUTHORIZED
U2 · U1 · U6                ⛔ still open
§5.3 iterated provenance    ⛔ still owed
deploy                      HELD
```
