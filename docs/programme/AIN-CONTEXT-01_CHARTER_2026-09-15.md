# `AIN-CONTEXT-01` — LONGITUDINAL CONTINUITY ARCHITECTURE

**Opened:** 2026-09-15 · founder act
**Status at authoring:** ACT 1 authorized and run. ACT 2 specified, NOT OPENED.
**Status now (2026-09-15, later the same day):** ⭐ **ACT 2 OPENED by founder act and run as a
specification and architecture act, with no repair authority.** Its scope is the founder's
ACT 2 §§1–15, which supersede the narrower ACT 2 sketch in §5 below. Record:
`docs/programme/AIN-CONTEXT-01_ACT2_ARCHITECTURE_2026-09-15.md`. §5 is kept verbatim as what
the lane expected ACT 2 to be, ⛔ never edited to read as if it had always said otherwise —
the reproduction harness it describes is now proposed act **A3**, downstream of the
standing architecture rather than first.
**Branch:** `claude/hopeful-faraday-6pcwm2`

---

## 1. Why this lane exists

MAIA has historically lost important material during sufficiently long conversations.
That is a *phenomenological* fact reported from lived use, not a hypothesis derived
from code.

This lane exists to explain that fact architecturally, and then to hold whatever is
built afterwards to a standard that the explanation makes measurable.

⛔ **This lane is not the voice thread and does not extend `JARVIS-KP-01`.** The
long-conversation loss is a different architectural problem and is given its own lane
precisely so it is not absorbed into a thread whose acceptance law was written for
something else.

---

## 2. The invariant (in force from lane opening)

> **Conversation length may alter the representation of prior experience; it may not,
> by itself, make significant relational history irrecoverable.**

And beneath it:

> **Leaving working context is not forgetting.**

This is the core architectural distinction the lane is built on:

```text
MEMORY          what remains recoverable
CONTEXT         what is presently brought forward
EPISTEMOLOGY    what standing it has when it arrives
```

Three different systems. ⛔ The failure mode this lane guards against is the
flattening of any one of them into another — most dangerously, **context loss
reported as memory**, or **retrieval presented without standing**.

---

## 3. What "explaining the failure" may not mean

⛔ **"Context windows are finite" is not an explanation.** We already know context
windows are finite. The question this lane answers is:

> **What does AIN do when material falls out of working context?**

An account that terminates at the finiteness of the window has answered a question
nobody asked.

---

## 4. ACT 1 — Longitudinal continuity failure census (AUTHORIZED · RUN)

**Purpose.** Determine exactly how MAIA currently constructs context across long
conversations, where earlier conversational material becomes unavailable, and whether
that material remains recoverable elsewhere.

**Census only. ⛔ No repair, no redesign, no new summarizer, no context-assembler
implementation.**

Trace the actual production paths from conversation storage through retrieval, memory,
summarization, prompt assembly and model invocation.

For every relevant context carrier, establish:

- where the original conversational material is stored;
- whether the raw source survives;
- what crosses turn boundaries;
- what crosses session boundaries;
- where truncation/windowing occurs;
- whether summaries are created;
- whether summaries supplement or replace source material;
- whether summaries are recursively summarized;
- what retrieval mechanisms can recover dropped material;
- what actually reaches the final model request;
- the epistemic standing/provenance carried with retrieved material;
- whether corrections/rejections travel with the thing they correct;
- whether any path can make historically important conversation permanently
  inaccessible to MAIA.

⛔ **Do not infer reachability from the existence of a table, function or service.**
Demonstrate write → read → selection → prompt reachability, or mark it `UNVERIFIED`.

**Edge classification** — every edge in the flow carries exactly one of:

```text
LIVE          demonstrated write → read → selection → prompt
DORMANT       code exists, no reachable caller on the serving path
UNREACHABLE   a reader exists but a structural predicate excludes the writer's rows
UNVERIFIED    reachability requires runtime or production evidence not held
```

**Carrier record** — every context carrier is described on nine axes:

```text
SOURCE · WRITER · READER · PERSISTENCE · SELECTION
TOKEN COST · PROMPT POSITION · PROVENANCE · EPISTEMIC STANDING
```

### 4.1 Two named hunt targets

**(a) Summary-of-summary degradation.** Anything structurally like:

```text
turns 1–40            → summary A
summary A + 41–80     → summary B
summary B + 81–120    → summary C
```

If that exists, important detail can disappear with no explicit deletion. The census
must also establish whether the original turns remain retrievable *after* it happens.

**(b) Corrections.** Trace whether this can occur:

```text
Turn 20    MAIA infers X
Turn 24    member says: "No — X is wrong."
Turn 110   retrieval searches for the related subject
```

What comes back?

```text
A. X
B. rejection of X
C. both, with correct standing
D. nothing
```

**C is the only robust answer.** If semantic retrieval can return the attractive
interpretation but omit its subsequent rejection, context engineering makes MAIA
*more* psychologically dangerous while appearing more intelligent.

**ACT 1 result:** `docs/programme/AIN-CONTEXT-01_ACT1_CENSUS_2026-09-15.md`.

---

## 5. ACT 2 as originally sketched — reproduce the historical failure

⚠️ **SUPERSEDED 2026-09-15 by the founder's ACT 2 opening**, which made ACT 2 an
architecture act and re-sited this harness as proposed act **A3**. Kept verbatim below.

⛔ **Not redesign.** Reproduction.

Build a synthetic long conversation with known planted continuity objects:

```text
turn 12    durable personal fact
turn 18    symbolic image
turn 27    MAIA interpretation
turn 29    MEMBER REJECTS interpretation
turn 42    decision
turn 55    open unresolved question
turn 68    preference
turn 76    correction to earlier fact
turn 91    relational realization
turn 115   callback to turn 12
turn 130   callback to rejected interpretation
```

Test the present system at 25 · 50 · 100 · 150 · 200 turns. For every planted item:

| Measurement | Question |
| --- | --- |
| **Source retained** | Does the original still exist? |
| **Retrievable** | Can the system find it? |
| **Assembled** | Did it enter this prompt? |
| **Used** | Did MAIA employ it correctly? |
| **Standing preserved** | Did MAIA know whether it was fact, hypothesis, rejection, correction? |

That becomes the baseline against which any context-engineering architecture is
eventually judged.

⛔ ACT 2 opens only on an explicit founder act.

---

## 6. Standing

```text
AIN-CONTEXT-01            OPEN
ACT 1 census              COMPLETE · READ-ONLY · corrected in place 2026-09-15
ACT 2 architecture        OPEN · RUN · SPECIFICATION ONLY
ACT 2 addendum            FOUNDER RULINGS R1-R6 RATIFIED
R1 three epistemic cond.  IN FORCE (cognition / record / nature)
Continuity envelope       RATIFIED (six panes)
A6 temporal sovereignty   OPEN THROUGH ACCEPTANCE (founder ruling 2026-09-15 R1-R7)
F1a false self-location   RED · historical · not re-run · not rewritten
A6 implementation         COMPLETE · 4 files · apertures unchanged
F1b acceptance            GREEN · 59/59 · admitted for the executed path
F1c serving reach         6/6 · FAST DELIVERED · DEEP primary NOT REACHED
Project typecheck gate    PASS · 229 vs baseline 239 · 0 regressions · exit 0
A6 coverage               FAST + CORE · DEEP primary EXCLUDED · recorded not absorbed
DEEP addenda divergence   pre-existing II.C · routed out · NOT REPAIRED
Merge · deploy            NOT AUTHORIZED — founder act
A3 reproduction harness   PROPOSED · NOT OPENED
A4-A8                     PROPOSED · NOT OPENED
F1-F8 falsifiers          SPECIFIED · NOT AUTHORED · NOT RUN
Interpretive ledger       DORMANT · WIRING NOT AUTHORIZED
Repair                    NOT AUTHORIZED
New summarizer            NOT AUTHORIZED
Context assembler         NOT AUTHORIZED
Source changed            NONE
Schema changed            NONE
Production                UNTOUCHED
```
