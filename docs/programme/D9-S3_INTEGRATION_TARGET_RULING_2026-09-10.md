# D9 / S3 integration — target ruling

**Date:** 2026-09-10 · **Founder ruling** · Supersedes the earlier integration
acceptance scope.

## What changed the target

The earlier acceptance asked whether attention and authority could coexist
without contaminating each other. The census answered that before any walk ran:
the two branches change **zero files in common**, `merge-tree` reports a clean
merge, and `heldFocus` carries no authority state (`scale`, `sectionIds`,
`start`, `end`, `capturedText` — coordinates and a witness, nothing that could be
mistaken for permission). `pendingAskRef`, `selectedSectionIds` and S3's `actId`
appear **nowhere** on the D9 branch. There is no second owner and never was.

So "do the branches merge?" is settled and is no longer the question.

The real finding came from the founder using the Develop room on their own
manuscript, before the planned witness was spent.

## PRE-INTEGRATION PHENOMENOLOGY FINDING

> The writer could encounter and discuss the observation, but could not continue
> naturally into revision. The interface changed the writer's task from **"work on
> my book"** to **"operate the developmental reading apparatus."**

**BLOCKS D9/S3 integration acceptance.**

⛔ This is **not** `D9-PHENOMENOLOGY-WITNESS-01`. That witness remains **UNSPENT**.
Calling it spent against an integrated subject that did not yet exist would
falsify the record. The formal witness is now *more* stringent, not redundant:
after remediation it tests whether this finding is actually gone.

## The ruling

**DEVELOP must be able to hand the writer directly into working on what was
noticed, without leaving the Work or losing the conversation.**

`DevelopRoom`'s existing doctrine — *it encounters; it does not author* — stands.
No revision control is added there. What is missing is the **member-controlled
transition** from encounter to authorship.

```
DEVELOP
MAIA notices something
      ↓
writer talks with her about it
      ↓
writer: "let's work on this"
      ↓
explicit WORK ON THIS gesture
      ↓
WRITE — same Work, relevant section
      + same MAIA conversation remains with them
      ↓
writer edits
```

⛔ Explicitly refused:

```
DEVELOP gains its own editor          NO
DEVELOP automatically changes text    NO
MAIA manufactures a revision          NO
WRITE + DEVELOP collapse into one     NO
```

**The distinction to protect hardest: Develop may INITIATE work; WRITE remains
where writing happens.** That gives continuity without creating two manuscript
editors.

## What may cross the transition

```
MAY CROSS                        MAY NOT CROSS
manuscript identity              may_cross authority
section identity / location      body permission
observation identity             pendingAskRef
conversation / thread identity   actId
                                 consent
                                 prose copied as a handoff
                                 automatic heldFocus
```

⭐ **`heldFocus` must still originate in the writer's own focusing act.** The
observation is MAIA's reading, not necessarily the writer's chosen attention.
"Work on this" may take them to the relevant section; it must not quietly claim
*this is now the text you chose to focus on.*

## The conversation survives

If the writer asks *"how do we edit this?"*, switching to WRITE and opening a
fresh generic MAIA conversation still fractures the experience.

> The developmental conversation the writer was already having remains the
> conversation beside the Work when WRITE opens.

No restatement. No second thread. No "Open in MAIA." No new destination. This does
**not** mean forcing every `StudioConversation` through developmental S3 — it means
the WRITE MAIA orbit must be **capable of carrying an already-existing anchored
developmental conversation** when that is what brought the writer there.

**That is the integration seam worth designing.**

## The four Develop findings, bound

```
F1  duplicate observation      BUG — remove the second verbatim rendering
                               DevelopRoom prints the observation; ObservationDialogue
                               reprints it under TALKING ABOUT, word for word

F2  apparatus before writer    EXPERIENCE DEFECT — reorder
                               ~400 words of system accounting above the writer's turn

F3  DOES NOT ESTABLISH         GOVERNANCE COPY LEAK — remove from the primary
                               reading surface; the discipline stays, the audit
                               record stops sitting between observation and reply

F4  insight → revision absent  ARCHITECTURAL FINDING — BLOCKS acceptance
```

⛔ **Do not spend time polishing F1–F3 as an isolated Develop beautification lane.**
Fix them as part of making this flow coherent. The intended surface is closer to:

```
MAIA'S OBSERVATION
[what she noticed]
[Talk with MAIA immediately]
…conversation…
                              Work on this →
```

The safeguards still operate. They stop demanding the writer read the audit record
before speaking.

⭐ **`BODY_AUTHORITY_REQUIRED` remains the important exception.** When MAIA
genuinely needs additional manuscript prose, that moment belongs **visibly in the
conversation**, because the writer has a real decision to make. That is member
agency, not compliance copy.

## Revised acceptance walk

> Can a writer move from MAIA noticing → talking → authorizing needed reading →
> working on the manuscript, without ever experiencing a second place or a break
> in the relationship with the Work?

```
DEVELOP observation appears ONCE
→ writer can speak immediately
→ MAIA conversation continues
→ if body needed, authorization occurs there
→ answer returns there
→ writer presses WORK ON THIS
→ same shell changes to WRITE
→ same manuscript / relevant section is present
→ same conversation remains in MAIA orbit
→ no automatic body authority survives
→ no automatic heldFocus is manufactured
→ writer edits normally
→ Work geometry / position remain lawful
```

## Also open

**HS-1 — still open.** `heldFocus.label()` on the D9 branch returns
`passage in section 3`. Lower case does not resolve the semantic collision: the
writer-facing attention label must not make *passage* look like the disclosure
scope when the authorization that follows is *section*. `FocusScale` keeps
`'paragraph'` internally; the label becomes attention language. An earlier reading
of this session — that the absence of the uppercase string `PASSAGE IN SECTION`
meant the ruling had been satisfied — was wrong and is corrected here.

**A second disclosure model in a second surface.** The WRITE canvas MAIA panel says
*"She has not been given its text — a Keep is how you would hand her one."* That is
a different account of how MAIA comes to read the writer's prose than S3's body
authorization. They do not collide today; a writer moving between WRITE and DEVELOP
meets two explanations of one act. Belongs in the same ruling family as HS-1.

## Standing

```
STEP 7                          CLOSED
S3 P1                           ACCEPTED

D9/S3 textual merge             CLEAN — zero files in common
old integration acceptance      SUPERSEDED
PRE-INTEGRATION PHENOMENOLOGY   FINDING
Develop → revision continuity   ABSENT

DEVELOP becomes second editor   NO
WRITE/DEVELOP collapse          NO
REQUIRED                        encounter → conversation → work
                                one Work, one continuity

HS-1                            OPEN
NEXT                            DESIGN that transition
MERGE                           NOT YET
FORMAL PHENOMENOLOGY WITNESS    UNSPENT
PRODUCTION PREFLIGHT            NOT STARTED
PRODUCTION                      UNTOUCHED
```
