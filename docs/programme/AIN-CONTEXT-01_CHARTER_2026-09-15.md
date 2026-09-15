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
A6 ACCEPTANCE HOLD        LIFTED (founder ruling 2026-09-15)
A6 coverage               ACCEPTED for FAST + CORE · DEEP primary EXCLUDED
DEEP addenda divergence   pre-existing II.C · routed out · NOT REPAIRED
PR                        AUTHORIZED TO OPEN
Merge · deploy            NOT AUTHORIZED                                   ⛔ SUPERSEDED 2026-09-15 → §A
Production                UNTOUCHED BY A6 (running f190f8992 = PR #1297)   ⛔ SUPERSEDED 2026-09-15 → §A
A3 reproduction harness   PROPOSED · NOT OPENED
A4-A8                     PROPOSED · NOT OPENED
F1-F8 falsifiers          SPECIFIED · NOT AUTHORED · NOT RUN
Interpretive ledger       DORMANT · WIRING NOT AUTHORIZED
Repair                    NOT AUTHORIZED
New summarizer            NOT AUTHORIZED
Context assembler         NOT AUTHORIZED
Source changed            NONE
Schema changed            NONE
Production                UNTOUCHED                                       ⛔ SUPERSEDED 2026-09-15 → §A
```

---

# §A · DATED STATUS CORRECTION · 2026-09-15 (evening)

⛔ **RECORD-ONLY ACT.** Authorized by founder ruling as a documentary correction.
⛔ No architectural reinterpretation · no repair · no production or code change · no new
authority taken.

## A.1 What was stale

Three lines in the standing block above, marked `⛔ SUPERSEDED` **in place rather than
rewritten**:

```text
Merge · deploy            NOT AUTHORIZED
Production                UNTOUCHED BY A6 (running f190f8992 = PR #1297)
Production                UNTOUCHED
```

⭐ **Every one of them was ACCURATE WHEN WRITTEN.** At the time of this charter, A6 had been
implemented and accepted but neither merged nor deployed, and production was serving
`f190f8992`. ⛔ They are preserved verbatim so this record cannot be read as though the charter
always knew A6 was in production. *A witness is a reading at a time; the honest repair is to
date it, not to edit it.*

## A.2 The corrected production fact

**A6 IS PRESENT AND OPERATING IN PRODUCTION**, and has been since the A6 deploy.

```text
A6 in production          ✅ PRESENT · OPERATING · WITNESSED
production runtime        e57ca1baa  (as of 2026-09-15 evening)
A6 deploy commit          c8770709c  — "feat(AIN-CONTEXT-01): A6 authoritative depth
                                       + absence accounting — F1b GREEN"
lineage                   c8770709c IS AN ANCESTOR OF e57ca1baa (verified by
                          `git merge-base --is-ancestor`), so A6 has been continuously
                          present in production across every runtime since
```

**Production evidence, WITNESSED, established in the L1 lane:**

1. ⭐ **The A6 arithmetic closed on MAIA's own words.** On runtime `e57ca1baa`, with depth 40
   and a FAST aperture of 3 plus 3 recovered, A6 reported 6 represented / 34 absent — and MAIA
   said *"34 of our exchanges… aren't in my current view."* ⛔ Not an inference from logs
   alone: the accounting and the member-facing sentence agreed.

2. The unconditional A6 serving line was observed directly in production
   (`docs/programme/C1-BRIDGE-02_W1_PRODUCTION_FAILURE_2026-09-15.md` §2):

```text
🧭 [A6/CORE] session continuity { depth: 41, represented: 7, absent: 34, unit: 'completed exchanges' }
```

⚠️ That particular line was captured on runtime `0f58a7f93`, a build since rolled back. ⛔ It
is cited as evidence that **A6 operates**, never as evidence about the rolled-back bridge, and
A6 itself was unchanged between the two runtimes.

## A.3 ⛔ THE DISTINCTION THIS CORRECTION MUST NOT BLUR

```text
DEPLOY EVENT      branch SHA c8770709c → production
CANONICAL EVENT   b22945ac + accepted subject 9ac0730d → canonical 286e4381
VALIDITY BRIDGE   four A6 runtime blobs verified byte-identical
```

⭐⭐ **Deployment provenance and canonical provenance are INDEPENDENT.** `c8770709c` reached
production directly from the A6 branch, **before** the accepted subject was landed in
canonical. ⛔ The later canonical landing does **not** retroactively become the authority for
that deploy. The live member falsifier is valid because the four runtime blobs were
independently verified byte-identical — ⛔ **not** because the two events are treated as one.

*This correction states that A6 is in production. It does not state that the deploy and the
canonical landing were one act, and nothing here may be cited to that effect.*

## A.4 Scope kept narrow, and one thing flagged rather than taken

⭐ `Merge · deploy NOT AUTHORIZED` was marked superseded because leaving it beside a corrected
production statement would assert the outcome while denying its cause. Both were authorized
later, by **separate founder acts**, each recorded in its own lane. ⛔ This addendum re-rules
nothing and confers no authorization; it records that the authorizations happened elsewhere.

⚠️ **Not corrected here, and deliberately so:** other records in this lane carry point-in-time
production statements (e.g. `AIN-CONTEXT-01_A6_ACCEPTANCE_RULING_2026-09-15.md`,
`Production UNTOUCHED BY A6 (running f190f8992)`). ⛔ Those are **dated rulings and witnesses**,
not living standing, and are left untouched by design. This charter carries the standing; the
witnesses carry their readings at their times.

## A.5 What remains closed

```text
selection-law investigation   ⛔ UNOPENED
rollback primitive repair     ⛔ UNOPENED
W2 / W3 / S                   ⛔ UNSPENT
A3-A8 · F1-F8                 ⛔ UNCHANGED BY THIS ACT
production                    ✅ e57ca1baa — UNCHANGED BY THIS ACT
source · schema               ⛔ UNCHANGED BY THIS ACT
```
