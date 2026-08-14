# Manuscript Room — identity contradiction, surfaced not reconciled

> ```text
> STATUS ............... STOP — founder ruling required
> DECISION STATE ....... AWAITING_AUTHORITY
> RAISED BY ............ the authorized Experience Contract unit, 2026-08-14
> CONTRACT 2 ........... CANNOT BE WRITTEN until this is ruled
> CONTRACT 1 ........... unaffected; proceeds
> ```
>
> The founder's authorization of the Experience Contract unit said: *"If existing sources
> conflict about the identity or purpose of either room, do not reconcile by inference.
> Surface the contradiction and STOP for founder ruling."* This is that stop.

## The contradiction

An Experience Contract's first required field after `room` is **`human_activity`** — *the
human activity this room serves*. Its first required section is **"What this room is for."**
The gate's own error text states why: *"A UI change without a contract cannot say which room
it belongs to, what human activity it serves."*

For `/press/manuscript` there are now **two governed answers, and they are incompatible.**

### Source A — the Three-Layer Ruling (2026-07-30, ratified canon)

| Layer | Name | What it does | Route |
|---|---|---|---|
| 3 | **Manuscript Room** | *supports close work inside one manuscript* | `/press/manuscript` |

**Layer 3 owns**: Manuscript · Working Draft · Keeps · Collections · Emerging Books ·
Export · Your Book · editor tabs · manuscript-local states and actions.

Under this ruling the room's human activity is **close work inside one manuscript** —
composition and production together, in one place.

### Source B — the Writer Canvas ⊥ Press Editor division (2026-08-05, founder ruling, canonical since `81f5b75ae`)

> **Writer Canvas helps the work become itself.
> Press Editor helps the work become an edition.**

And on what each needs:

> *Writer Canvas needs natural writing conventions only… **Advanced production structure
> belongs to Press Editor.*** · *"The desks differ because the objects differ."*

Under this ruling those are **two fields, deliberately separated so one canvas is not forced
to be both sanctuary and typesetting machine.**

### Why they cannot both be true of one room

The Manuscript Room's own contents **straddle the division line**:

| Layer 3 owns… | Which ruled field does it belong to? |
|---|---|
| Working Draft | **Writer Canvas** — it is the living manuscript |
| Manuscript (Source) | **Writer Canvas** — the composition object |
| Keeps, Collections | Writer Canvas (composition-adjacent) |
| **Export, Your Book** | **Press Editor** — edition production |
| Emerging Books | ⚠️ genuinely unclear |

So `/press/manuscript` is not one room with one human activity. It is **the pre-division room**
— assembled on 2026-07-30, before the boundary that now runs through its middle was drawn on
2026-08-05.

A contract written today would have to declare *one* human activity for a surface that
currently serves two, and whichever it declared would be false about half the room.

## What this is not

⛔ **Not** a request to rule the Book Studio boundary. That is `DEFERRED / NONBLOCKING` and
untouched here.

⛔ **Not** a naming question. C1 settled naming. This is about **what the room is for** — the
field an Experience Contract exists to fix, and the one thing that cannot be inferred.

⛔ **Not** an argument to build anything. No implementation is proposed, and the copy
correction remains `AUTHORIZED / BLOCKED_ON_GATE`.

⛔ **Not** reconcilable by picking the newer document. The 08-05 division does not mention
`/press/manuscript` and does not repeal Layer 3; the 07-30 ruling is ratified canon and was
never superseded. Neither text yields to the other on its own terms.

## The bounded decision

**What human activity does `/press/manuscript` serve?**

Three shapes are available. Each is coherent; they lead to materially different contracts,
and to different Phase 5 implementations.

**Option 1 — Manuscript Room *is* the Press Editor.** Its human activity is *making an
edition*. The Working Draft moves out to the Canvas; Export and Your Book stay.
*Cost*: the Working Draft engine and its tests live here today; moving it is Phase 2 scope,
not contract scope. The contract would describe a room that does not yet exist.

**Option 2 — Manuscript Room *is* a Writer Canvas working surface.** Its human activity is
*close work inside one manuscript*, per Layer 3 as ratified. Export/Your Book move out to a
future Press Editor.
*Cost*: the room keeps production tabs it is no longer for, until Phase 5 removes them. The
contract describes the room's ruled purpose while its surface still contradicts it.

**Option 3 — Manuscript Room is transitional and gets a `structural`-scoped contract now.**
It is honestly named as the pre-division room, with a contract that governs it *as it is*
and is explicitly superseded when Phase 5 splits it.
*Cost*: `change_class: structural` requires `structural_rationale` asserting the change is
not experiential — which would be **false** for any real member-facing edit here. This
option is only available if the founder rules the room's contract may be written as
transitional under `experiential` class with the division named as a known future
supersession.

**Recommended**: **Option 2.** The Layer 3 ruling is ratified canon and states the room's
purpose plainly — *close work inside one manuscript*. The 08-05 division does not repeal it;
it describes where production **belongs**, which is a statement about Press Editor's future
scope, not a retroactive redefinition of an existing room. Writing the contract to the ruled
purpose keeps the record honest, and the tabs that contradict it become Phase 5's explicit
work rather than a silent inconsistency. It also matches the sequencing the programme
already ruled: Press Editor is Phase 5, and no contract should describe a room that Phase 5
has not yet built.

⛔ Declining to rule leaves this `AWAITING_AUTHORITY`. Contract 2 stays unwritten and
`/press/manuscript` stays blocked for member-facing changes; Contract 1 and the Writer Canvas
surfaces are unaffected.
