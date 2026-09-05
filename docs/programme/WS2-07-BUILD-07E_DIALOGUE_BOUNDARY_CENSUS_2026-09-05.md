# WS2-07 · BUILD-07E — DEVELOPMENTAL DIALOGUE · opening act + boundary census

> **BUILD-07E is OPEN (founder act, 2026-09-05), following the closure of BUILD-07D at
> `5c57e27f0`. This document opens the unit and bounds it. It authorises no implementation
> commit on its own and changes no runtime bytes.**

```text
UNIT               BUILD-07E  DEVELOPMENTAL DIALOGUE
STATE              OPEN — boundary census recorded, contract stated, not yet built
OPENED BY          founder act, 2026-09-05
BOUND CLOSURE      BUILD-07D CLOSED / ACCEPTED at 5c57e27f0
FOUNDER DIRECTION  "Do not redesign the architecture; build from the developmental reading
                   that is now proven in production."
BUILD-07F–H        UNAUTHORISED. 07F opens only by its own act.
```

The question this unit answers, in the founder's words:

> Can the writer actually enter into dialogue with MAIA about what she noticed, while the Work
> remains sovereign?

## 0 · The finding that shapes this unit

**A developmental-dialogue spine already exists in canonical, and it is pointed at a different
frozen object.** Read canonical before designing: this unit is an *extension of a built
subsystem*, not a new surface. Building 07E as greenfield would produce a second conversation
model over the same Work — the exact failure the ask subsystem's own header commentary was
written to prevent.

Established by reading canonical at `dc742fe43`, not by inference:

```text
BUILT AND MOUNTED — the anchored ask, on the STRUCTURE PROPOSAL
  lib/manuscript/ask/anchor.ts        AskAnchor union · checkAnchor coherence law
  lib/manuscript/ask/askReader.ts     MAIA answering about a reading she already made
  lib/manuscript/ask/frozenReading.ts what she is shown of the reading
  lib/manuscript/ask/staleness.ts     five independent three-state dimensions
  lib/manuscript/ask/threadStore.ts   ask_threads + ask_turns, append-only
  lib/manuscript/ask/retry.ts
  lib/writersStudio/askClient.ts
  app/writers-studio/canvas/AskMaia.tsx      mounted by canvas/StructureReview.tsx:944
  app/api/sovereign/manuscripts/[id]/ask/route.ts
  database/migrations/20260901000001_ask_threads.sql
  lineage: WS2-05B-8B-02c-2

NOT PRESENT — the developmental address
  `readingId` and `observationKey` appear ZERO times anywhere under lib/manuscript/ask/.
  ReadingIdentity in threadStore.ts is the STRUCTURE reading:
      { proposalId, interpretationInputHash, sectionTopologyHash, reviewRevision,
        readerProvenance }
  The DevelopmentalReading is a different object, addressed as (readingId, observationKey)
  per DECIDE INV-2, and no anchor member can currently name it.

NOT MOUNTED IN THE DEVELOP ROOM
  app/writers-studio/develop/DevelopRoom.tsx has no ask surface. Its only act is
  commissioning a reading.
```

The discipline 07E needs is therefore **already implemented once, correctly, for the other
object** — and should be extended rather than restated:

- `askReader.ts` has **no tools and no read budget**. Not "budget zero" — the capability is
  absent from the request, so no manuscript body can reach the model. She answers from the frozen
  reading or says she cannot.
- She is explicitly instructed **not to defend the reading**. She may conclude she was wrong;
  she may conclude it still holds. Performed self-doubt is named as the same failure in better
  manners.
- **She cannot act.** No tool, no operation, no apply path in the module or anything it imports.
  "Do it" is answered with what the gesture would be and where the author makes it.
- `ask_threads` is immutable in ownership, anchor, reading reference and canonical baseline —
  enforced by a database trigger, not by types. A thread cannot be re-pointed at a reading it was
  not about.
- `ask_turns` refuses `UPDATE` outright at the row.
- No prose of the Work is stored in either table.

## 1 · What BUILD-07E is

**Teach the existing anchored-ask spine a second address — the developmental reading — and mount
it in the Develop room.** One extension along four seams:

```text
S1  ANCHOR         AskAnchor gains developmental members addressing DECIDE INV-2:
                     { on: 'observation'; readingId; observationKey }
                     { on: 'reading';     readingId }
                   checkAnchor gains the matching coherence rule. A mismatch is REFUSED,
                   NOT REPAIRED — the same law the structure anchors already hold, for the
                   same reason: preferring either side launders one reading's authority onto
                   another reading's content.

S2  THREAD         ReadingIdentity becomes a DISCRIMINATED UNION over the two frozen objects
                   — structure reading | developmental reading — never a shared record with
                   optional fields. The anchor module's own stated reason applies verbatim:
                   a shape that cannot hold the wrong reference cannot be filled with one by
                   a surface that forgot to check.
                   `anchor` and `reading_identity` are already `jsonb` and already immutable
                   by trigger, so this seam is expected to need NO MIGRATION. That expectation
                   is a falsifier below, not an assumption.

S3  STALENESS      The developmental dimension becomes MEASURED rather than declared unknown.
                   07A already ships the instrument, canonical and closed:
                     lib/manuscript/development/resolve.ts
                       locateCurrent(ref, readState, now)        three-state, per ref
                       observationLocation(refs, readState, now) union over an observation
                   Both are conservative in the right direction — any superseded ref
                   supersedes; unknown never rounds to current. This is the same doctrine
                   staleness.ts already states ("a surface that cannot say 'I do not know'
                   will say 'no'"), so the two subsystems join without either bending.
                   AskMaia today declares `inputMoved` permanently `unmeasured` because its
                   slice reads no bodies; on the developmental anchor it need not.

S4  SURFACE        Mount the ask under the observation in the Develop room, carrying that
                   anchor — under the thing the writer pointed at, not a generic composer
                   beside the reading. AskMaia's existing form is the precedent and should be
                   reused, not re-authored.
```

## 2 · The sovereignty threshold of this unit

The developmental reading is **evidence**. It is frozen, never corrected in place (INV-4), and
its absent-by-construction fields are absent deliberately: interpretation, questions,
possibilities, uncertainty, severity, priority, confidence, score, rank.

Dialogue is the first place in this lane where **interpretation is permitted to exist**. The
threshold is therefore precise, and it is the whole of 07E:

> Interpretation may live in the thread. It may never re-enter the reading.

A conversation about an observation must not become a second, softer channel by which an
observation is amended, re-classified, re-scoped, re-anchored, or given the confidence the
reading contract refused it. The thread is not evidence and must never be readable as evidence.

## 3 · Prohibitions — what 07E must not do

```text
⛔ no write path to any manuscript, section, structure unit, or reading row
⛔ no amendment, re-classification, re-scoping or re-anchoring of a frozen reading
⛔ no phenomenon assigned, changed or removed in conversation. The classifier's decline
   stands; `unclassifiable` remains a refusal condition, never a ninth phenomenon.
⛔ no tool, no read budget, no path by which manuscript prose reaches the model beyond what
   the frozen reading already carries
⛔ no prose of the Work stored in ask_threads or ask_turns
⛔ no second conversation runtime. One client presentation of the canonical loop, as the
   existing precedent establishes; nothing about the exchange is decided client-side.
⛔ no decisions surface — keep / dismiss / unresolved / investigate is BUILD-07F and is
   NOT authorised. If the dialogue needs a decision to be coherent, that is a finding to
   record, not a licence to build 07F inside 07E.
⛔ no revision path. BUILD-07H is a separate sovereignty threshold and is not designed here.
⛔ no automatic refresh, no re-reading, no timer
```

## 4 · Falsifiers — the gate

Stated before implementation, so the unit can fail. To be run against the built candidate, and —
where the guard claims to prevent a shipped fault — demonstrated to FAIL against the code without
the repair, or it is a tautology.

```text
E1   a developmental anchor naming a readingId that disagrees with the reading handed to the
     route is REFUSED, not repaired; the caller is told which, and nothing opens
E2   an observationKey that does not resolve inside that frozen reading refuses
     (anchor_unresolved), and does not degrade into a reading-level thread
E3   ReadingIdentity cannot be constructed holding a structure reference and a developmental
     reference at once — unrepresentable, not merely unvalidated
E4   the runtime-cannot-write gate (askRuntimeCannotWrite) extends to the developmental path:
     the only tables written remain ask_threads and ask_turns
E5   no reachable path mutates a frozen DevelopmentalReading row from the ask route
E6   an observation whose evidence has moved reports `superseded`; an unmeasurable one reports
     `unmeasured`; only all-current reports `current` — asserted through observationLocation,
     with the "unknown never rounds to current" case pinned explicitly
E7   the thread's anchor and reading reference survive a re-open unchanged (DB trigger, at the row)
E8   the answer path carries no tool and no read budget on the developmental anchor
E9   a refusal is said honestly in the writer's terms, once, and the room stays usable
E10  S2 needs no migration — if it does, that is a finding to bring back, not a migration to
     write inside this unit
```

## 5 · Growth-obligation answers

Per `CLAUDE.md` and `RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`. Answered, not passed.

**What uncertainty does this introduce, and how is that uncertainty preserved?**
Conversation is where MAIA is asked to go beyond what she established — "what did you mean",
"is this a flaw or a choice". She cannot know, and the reading deliberately holds no confidence
field to borrow. Preserved structurally: her answers live in `ask_turns`, which is append-only at
the row and is never read back as evidence; the reading's absent fields stay absent; staleness is
three-state and says `unmeasured` rather than implying freshness. Her standing instruction not to
defend the reading is what keeps uncertainty from being resolved by rhetoric.

**What provenance and ownership boundaries does this require?**
Every turn is addressed to `(readingId, observationKey)` and to the canonical baseline at open.
The thread is immutable in what it is about. The Work is never copied into the thread. The
writer's words are the writer's; MAIA's answer carries its own provenance and asker version, and
neither is ever promoted into the reading.

**What new responsibility does this capability create?**
Dialogue is the first surface where MAIA is present *with* the writer inside her own noticing
rather than reporting to them. That is the point at which relational pull is real. The
responsibility is that the conversation must remain subordinate to the writer's judgment: it may
not accumulate authority the reading refused, may not become the place the Work is decided, and
must end where the writer's decision begins — which is why 07F is a separate unit and is not
authorised here.

## 6 · Open questions for the founder — not decided in this document

```text
Q1  Is a developmental thread anchored ONLY at the observation, or is a reading-level thread
    ({ on: 'reading' }) also in v1? The census declares both members for coherence, as the
    anchor module already does for unreachable members; whether both are REACHABLE from the
    surface in this slice is a founder call.
Q2  What does MAIA see of the Work in a developmental thread? `frozenReading.ts` already
    answers this for the structure object, host-assembled. The developmental equivalent —
    observation text, doesNotEstablish, evidence — needs the same explicit assembly, and
    whether evidence is recovered for display (07A recoverEvidence, digest-verified) or
    withheld is a boundary decision, not an implementation detail.
Q3  Does a superseded observation still open a thread? Refusing would silence a writer whose
    Work moved under a real question; opening silently would let her speak about a state that
    no longer holds. The honest third option — open, and SAY what moved — is the one this lane's
    doctrine points at, but it is the founder's ruling to make.
```

## 7 · What this document does not do

```text
no implementation · no schema · no route · no surface
no opening of BUILD-07F, 07G or 07H
no claim about the private-beta launch threshold — that is Stage 7 DONE / PROVED plus
   Stage 8 CLOSED / ACCEPTED, and 07E is inside Stage 7
no re-opening of anything parked, and no import of another lane's state
```
