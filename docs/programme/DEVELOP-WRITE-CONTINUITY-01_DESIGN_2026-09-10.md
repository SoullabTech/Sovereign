# DEVELOP ↔ WRITE continuity — design

**Lane:** `DEVELOP-WRITE-CONTINUITY-01` · **Date:** 2026-09-10
**Status:** DESIGN — awaiting founder ruling before implementation.

## The one thing being built

> MAIA notices something → you understand it → *"yes, let's work on that"* →
> you edit the book → **MAIA remains with the same thought.**

Nothing else. `D9 Canvas architecture KEEP · S3 authority architecture KEEP ·
another redesign NO.`

## What already exists, and is not rebuilt

| | |
|---|---|
| **The durable conversation** | `ask_threads` — a real row, addressed by manuscript + anchor (`{on:'observation', readingId, observationKey}`), append-only turns. DEVELOP already resumes rather than multiplies. |
| **The protocol that continues it** | `POST /api/sovereign/manuscripts/[id]/ask` with `threadId`. Resume keeps the anchor and reading it was opened on; neither is re-read from the request. |
| **The permission machinery** | S3 P1, closed at Step 7. |
| **The WRITE surface** | D9 Field/Orbit. Manuscript central, panels orbit, focus originates with the writer. |

**The conversation does not need to be made durable. It already is — on the
DEVELOP side.** WRITE is the side that cannot host one.

## The defect being repaired

`canvas/page.tsx:389` — `const [conversationId] = useState(mintStudioConversationId)`.

The page mints `writers-studio-<uuid>` on mount and hands it to
`StudioConversation`, which uses it as `sessionId` against
`/api/sovereign/app/maia/list` and never loads anything back. **Every visit to the
canvas starts a new conversation; none is addressable afterwards.**

⛔ That is why the bridge cannot be a parameter change: the component's model is
*"I mint my own on arrival."*

## THE INVARIANT (founder-ruled)

> **Receiving an existing conversation must not turn `StudioConversation` into its
> owner. The conversation already exists. WRITE is giving it a place to continue.**

Design consequence: two modes, and the hosted one **cannot mint**.

```
OWNED    (today, unchanged)     WRITE mints, owns, ends with the page
HOSTED   (new)                  WRITE renders and continues a thread it did not
                                create, does not own, and cannot end
```

⛔ Not a flag on one code path. The minting call must be **unreachable** in hosted
mode, so a future edit cannot reintroduce ownership by accident.

## The gesture

`WORK ON THIS`, in the Develop conversation, beside MAIA's answer.

```
CARRIES                          NEVER CARRIES
manuscript identity              may_cross authority
section identity (orientation)   body permission
observation identity             pendingAskRef
reading identity                 consumed actId
thread identity                  standing consent
                                 prose copied as a handoff
                                 automatic heldFocus
```

⭐ **Orientation is not attention.** Landing the writer at section 87 is
orientation. Setting `heldFocus` for them is a claim about what they chose to
attend to, and `heldFocus` must still originate in the writer's own focusing act.
The two look identical in a screenshot and are opposite in principle.

⭐ **No authority survives the crossing.** A pending authorization is not carried,
resumed, or re-presented. If the writer's next question in WRITE needs prose, that
is a **new** requirement, answered by a **new** act.

## The consequence to rule on

Hosting the thread means the WRITE orbit continues it **through the S3 Ask route on
its anchor** — not through `maia/list`. Anything else is a restatement into a
different conversation, which the ruling forbids.

Therefore: **if a question asked in WRITE needs prose MAIA has not been given,
`BODY_AUTHORITY_REQUIRED` appears in WRITE.**

By the ruling that is correct — *"when MAIA genuinely needs additional manuscript
prose, that moment belongs visibly in the conversation, because the writer has a
real decision to make."* But it means the authorization surface is **no longer
Develop-only**, and `BodyAuthorizationPanel` must render in the WRITE orbit too.

⚠️ **This is the design's one non-obvious consequence and it needs an explicit
founder ruling before implementation.**

## Shape of the work

1. **Thread hosting in `StudioConversation`** — an optional hosted-thread input;
   when present it renders the thread's existing turns and continues them via the
   Ask route. Minting unreachable in that mode.
2. **`WORK ON THIS`** in the Develop conversation — carries the five identities,
   nothing else.
3. **Arrival** — WRITE opens on the manuscript, oriented to the section. No focus
   is set.
4. **Authorization in the orbit** — `BodyAuthorizationPanel` renders where the
   conversation is, pending the ruling above.

## Remediated alongside, not as a separate lane

```
F1  duplicate observation render      bug
F2  writer's turn buried              composition
F3  DOES NOT ESTABLISH wall           governance copy leak
HS-1 "passage in section N"           terminology
```

Per ruling: fixed as part of making this flow coherent, not as a Develop
beautification lane.

## Standing

```
D9 Canvas architecture      KEEP
S3 authority architecture   KEEP
conversation continuity     THE WORK
another Canvas redesign     NO
another architecture reset  NO

DESIGN                      written
BODY_AUTHORITY in WRITE     NEEDS RULING
IMPLEMENTATION              NOT STARTED
MERGE                       NOT YET
PRODUCTION                  UNTOUCHED
```
