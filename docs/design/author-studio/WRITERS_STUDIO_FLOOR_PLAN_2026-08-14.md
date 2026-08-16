# Writer's Studio — floor plan (relationship between rooms)

**Step 5 of the authorized sequence. Design/contract work only — no implementation authority.**

Scope discipline: this document describes **relationships between rooms**. It does not
redesign any room's interior. Manuscript Room, Writer Canvas, and Press Editor internals appear
here only to define how they connect to Studio Home.

## The place and its rooms

```text
WRITER'S STUDIO — the larger place
│
├── STUDIO HOME          arrive · orient · choose · return
│     the threshold. Not a room you work in; the room you enter from.
│
├── WRITER CANVAS        continue the living Work
│     inhabit and continue a work that is already yours, mid-motion.
│
├── MANUSCRIPT ROOM      work directly with the long-form manuscript
│     one manuscript, at length, in one continuous measure.
│
└── PRESS EDITOR         make an edition
      turn a work into a published artifact.
```

Four rooms, four human activities. **The rooms are distinguished by what the writer is doing,
not by what data they touch or what route tree they live under.**

## The category error this corrects

One contract previously claimed both `app/writers-studio/page.tsx` (arrival) and
`app/writers-studio/canvas/**` (inhabitation). Arrival and inhabitation are different human
activities, so they are different rooms, so they need different contracts — regardless of
shared filesystem ancestry.

The cost of that error was concrete and is on the record: the first authenticated walk failed
at arrival, in the room no contract governed. **The architecture had specified the rooms you
eventually reach while leaving the act of entering undesigned.**

## Movement between rooms

| From | To | The crossing | What must be perceptible |
|---|---|---|---|
| House | Studio Home | entering the studio | you are in your studio, with your work in it |
| Studio Home | Writer Canvas | continuing a Work | arrival at *that* Work, mid-motion |
| Studio Home | Manuscript Room | opening a manuscript | the manuscript, where you left it |
| Studio Home | (bring in) | material entering | the threshold where material enters, consequence stated |
| any room | Studio Home | returning | the way back up is visible from every state |
| Writer Canvas | Press Editor | making an edition | a deliberate crossing, never automatic |

**Every crossing is governed by the door rule.** Door vocabulary requires door behavior — a
perceptible state transition, whether by navigation, drawer, or reveal.

**The way back up must always be visible.** This is ruled property, not preference. Before the
return link existed, arriving in the Manuscript Room from the House was a one-way trip into an
upload form.

## What belongs to the threshold, and what does not

Studio Home answers only arrival questions:

- What is this threshold for?
- What can a writer genuinely do from here?
- What constitutes a real door?
- What happens on Continue / Bring Something In / Begin Something New?
- What does the room reveal at zero, one, and several Works?

Studio Home does **not** host the work itself. The moment a writer is *working*, they are in
another room. A threshold that tries to also be a workspace becomes a warehouse — which is
precisely what the witness found.

## Orientation across the floor plan

The amended provenance rule applies **in every room**, not only at arrival: rich orientation is
allowed; stages, progress and milestones are allowed when provenance is legitimate;
member-authored or member-confirmed state wins; MAIA suggestions remain suggestions until
adopted; support may be intelligent without becoming authoritative.

The distinction that makes this checkable is the teaching pair — *"3 of 12 chapters complete"*
versus *"8 of 12 chapters marked ready"*. Same component. Opposite epistemic claim.

MAIA is present in every room and occupies the centre of none. Folded until invited, as in
Journal. The folded state is a **room affordance**, not relational memory, and not authored
meaning.

## Unresolved, and deliberately not assigned

- **Emerging Books** — not assigned to any room. Assigning it by inference is forbidden; it
  awaits a ruling.
- **`Export` and `Your Book`** in the Manuscript Room — recorded as **legacy edition-production
  occupants**. Their presence does not redefine that room's purpose. No tab movement authorized.

## What this floor plan does not do

No component mapping. No implementation. No repair of the no-op controls. No copy correction.
No change to `/writers-studio`. No contract installed, no gate run. Room internals untouched.

Contracts must be **frozen** before components are mapped. Components map to a frozen contract,
never the reverse — otherwise the surface defines the contract that was supposed to govern it.
