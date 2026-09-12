# WS-REVISION-RELATIONSHIP-01 — the target, restated

**Founder ruling · 2026-09-12.** Supersedes the working goal *"connect Focus to canonical MAIA"*,
which is technically correct and **product-wise insufficient**.

> ⭐⭐ **Build a continuous, writer-controlled revision relationship between the Work and MAIA.**
>
> ⭐⭐ **MAIA shouldn't merely tell you what she sees in the Work. She should be able to work on the
> Work with you — while you remain the author and final authority.**

---

## 1 · The loop

```text
WRITER selects a section/passage → FOCUS becomes explicit
  → discuss what is working / not working
  → MAIA offers: insight · convention · structural option · alternate phrasing
                 cut/move/expand/combine · concrete revision
  → writer questions / modifies / rejects / combines
  → an AGREED CHANGE emerges
  → MAIA STAGES the exact manuscript edit
  → writer sees exact before/after diff
  → Accept · Edit · Reject
  → approved change becomes a new manuscript revision
  → ⭐ MAIA REREADS THE CURRENT SECTION
  → continue refining
```

⭐ **The last step is load-bearing: MAIA must always work from the manuscript as it exists now, not
from what she read three turns ago.** Otherwise the LLM-reset problem is recreated inside the Studio.

## 2 · ⭐⭐ THE EPISTEMIC RULING THIS CONTAINS — a proposal is not a finding

**The defect the founder names precisely:** MAIA *"stops just before becoming useful."* She diagnoses
the repeated campfire scene correctly and then says nothing about what could be done.

**The cause is a vocabulary with one act in it.** The developmental reader's contract is built for
**claims about what the evidence establishes** — `doesNotEstablish`, the eight non-conclusions,
`author intent` barred. That discipline is right and stays. ⛔ **But it was never a discipline about
PROPOSALS, and it must not be allowed to become one.**

> ⭐⭐ **A finding asserts what the Work IS. A proposal offers what the Work COULD BECOME. The
> discipline that governs the first must not silence the second.**

⭐ **And the two compose, which is the whole point:**

```text
FINDING     "The evidence does not establish that this was your intention."
            ⭐ rigorous, and correct to refuse
WRITER      "The intention is the campfire as a phenomenological focal point."
PROPOSAL    "Then I wouldn't remove the recurring campfire. I'd make the recurrence
             INTENTIONAL — right now the repeated language reads as duplicated
             rather than ritualized."
            ⭐ generative, and no longer a claim about what the evidence shows
```

**MAIA's acts inside a Focus, as ruled:**

| act | meaning |
|---|---|
| **Notice** | something she sees in the current writing |
| **Question** | something she needs to understand about the writer's intention |
| **Option** | a possible way to handle it |
| **Recommendation** | what she thinks would work best, and why |
| **Revision** | actual proposed language or structure |
| **Action** | cut · move · combine · expand · rewrite · insert · split |

⭐ **Only `Notice` is a claim about the Work.** The rest are offers, and they carry the writer's
stated intention as their premise — which is why they may be confident where a finding may not.

## 3 · The authority model

```text
READ     MAIA may read the writer-authorized Focus and lawful wider context.
ADVISE   MAIA may freely offer analysis, possibilities, conventions, recommendations.
STAGE    MAIA may create an exact proposed manuscript change.
WRITE    MAIA may alter the manuscript ONLY after an explicit writer approval.
```

> ⭐ **"Yes, do that" is the transition from proposal to STAGED edit — not permission for invisible
> editing.** The diff is still shown. **Accept Changes** is the write authority.

⭐ **This does NOT breach the authorship boundary, and the existing substrate already proves the
shape.** `structure/proposals/[id]/adopt` carries **no content**; `saveSection()` is the only write
path; `prose_in_payload: 422` stops a proposal becoming text by arriving as text. **A revision
proposal must be stored server-side when minted and adopted BY ID** — so the adopt call still
carries no prose, and the law holds unchanged while the writer's experience is *"MAIA made the
edit."*

## 4 · `RevisionProposal` — a first-class object, not chat text

```text
focus        manuscript · section · optional character range
basis        the manuscript revision MAIA read      ⭐ what makes staleness detectable
intent       what the writer told MAIA he is trying to accomplish
diagnosis    what MAIA sees
operation    replace | insert | delete | move | combine | split
patch        the exact changes
rationale    why
status       proposed · discussing · staged · accepted · rejected · superseded
```

⭐ **`basis` is the quiet requirement that makes the loop safe**: a proposal minted against revision
N is knowably stale once the writer has written revision N+1, and can say so instead of silently
patching text that no longer exists.

⭐ **`status: discussing` is what lets the conversation evolve without anything touching the Work** —
*"keep the first two sentences"* modifies the proposal; *"move that paragraph later instead"*
modifies it again; nothing is written until Accept.

## 5 · Structural editing is in scope, and topology is safer than rewriting

⛔ **Not limited to sentences.** *"Cut this paragraph" · "these two sections belong together" ·
"move this explanation after the example" · "this concept appears 40 pages before you define it" ·
"don't rewrite this — move it."*

```text
MOVE  section 56 paragraphs 4–6  →  after section 58 paragraph 2
```

⭐ **Far safer than asking a model to rewrite a chapter in order to accomplish a move** — the patch
names an operation on topology, and the prose is carried, not regenerated.

## 6 · The Focus conversation survives while the Focus exists

⚠️ **This AMENDS a previous assumption and the amendment is deliberate.** The prototype record said
*"Encounter continuity only. Persistence across a fresh arrival is NOT authorized"* (§20.2).

**Ruled now:** the writer must be able to work on a section, ask, revise, keep discussing, leave,
return, and **resume knowing why they changed what they changed.**

⭐ **The §11 taxonomy accommodates this without being broken**: a live Focus conversation is not
*inherited tool state* (a panel someone left open) — it is closer to **standing authority**, the
writer's own act still in force. ⛔ It is not yet ruled whether it persists past release.

## 7 · The revision record carries what, how and why

```text
⛔ NOT        Revision 37  ·  +241 −183

⭐ BUT        Revision 37
              Focus:      Chapter 3 opening
              Intent:     make the recurring campfire function as a phenomenological
                          focal point without the scenes feeling repetitive
              Decision:   keep the recurring fire image, differentiate each occurrence
                          through the narrator's perceptual state
              Changes:    removed duplicated descriptive passage · retained recurring
                          ember image · moved dampness reflection earlier · added
                          transition into spiritual-distraction theme
              Conversation available
```

> ⭐ **That is extraordinarily useful months later, and it is the developmental history of the Work
> rather than a changelog of bytes.**

## 8 · MAIA learns the writer's choices — corrigibly

```text
⭐ LAWFUL    "Last time you wanted recurrence treated as ritual structure.
              Is that still what you're doing here?"
⛔ UNLAWFUL  "Kelly always writes this way."
```

⚠️ **Every example the founder gave is a CRAFT marker** — recurrence as ritual structure, no
compression for its own sake, phenomenology before metaphysics. `D9_CREATIVE_LEARNING §5.2` holds
craft markers may be **observed and offered**, while personal markers may only be recognized when the
writer names them. **This ruling sits on the lawful side of that line and does not decide it.**

---

## 9 · V1 — the six capabilities

```text
1  FOCUS      a section or passage
2  DISCUSS    with MAIA, who understands relevant wider context
3  OFFER      insights · options · conventions · recommendations · exact revisions
4  CONVERGE   on an agreed RevisionProposal
5  STAGE      an exact manuscript patch, shown as a diff
6  DECIDE     accept · edit · reject — after which MAIA works from the NEW state
```

⭐ **That V1 is the process the founder expected two days ago.** Later: structural moves ·
multi-section Focus · revision provenance · comparison · deeper developmental memory.

## 10 · What exists tonight, measured

| | |
|---|---|
| the visible Field + Focus surface | ⭐ **BUILT** — `claude/ws-field-substrate-integration`, 8 files, 1,349 lines, 7 test files, 6 commits, only 40 behind canonical. `FocusStrip` has `Wider · Narrower · Release · Ask MAIA` |
| governed crossing to canonical MAIA | ⭐ **BUILT + MERGED** — `/api/writers-studio/focus`, `performFocusCrossing`, disclosure receipt, room policy, producers (#1276) |
| **the join** | 🔴 **MISSING** — `FieldRoom.tsx:16` says its Ask MAIA *"reaches the EXISTING Canvas conversation path, unchanged and unimproved"* |
| MAIA reading the CURRENT text | ⭐ free — the server reads the Work at crossing time |
| the six MAIA acts as distinct kinds | ⛔ not built — the route returns `response: string` |
| `RevisionProposal` | ⛔ does not exist |
| diff review · accept/edit/reject | ⛔ not built |
| prose adopt path | ⛔ does not exist (structure adopt exists and bars prose) |

## 11 · ⚠️ FOUR PLACES THIS MEETS RATIFIED LAW — named, not glossed

**1 · Iterated-proposal provenance — `D9_SHARED_FOCUS §5.3`, a ruling the charter says is owed
BEFORE build.** The loop is explicitly iterative. *What is the content ancestry of the adopted line —
modified from WHICH proposal? Are refused proposals part of the record, or deliberately not?*
⚠️ Keeping the chain makes the writer's rejections durable, which is a surveillance shape; discarding
it loses the reasoning that produced the kept line. ⛔ **Still owed.**

**2 · Freeze vs. current.** `freezeReadState` exists so a developmental *reading* is recoverable
exactly as read. ⛔ **Do not "fix" the freeze to make proposals current.** These are two objects: a
reading is frozen evidence; a proposal carries `basis` and is checked against the live revision.

**3 · Structural operations touch `WS2-08`.** 08C (split/merge/rename commands) needs its own founder
act, and `topology_change_requires_explicit_command` has no counterpart in code yet.

**4 · Focus-conversation persistence** amends prototype §20.2, as §6 above records. Persistence past
**release** is not ruled.

---

## 13 · ⭐⭐ THE FIVE EPISTEMIC LAYERS — founder, 2026-09-12

**Sharper than §2, and it is the architecture.** The campfire exchange produced each of these in
order, and collapsing any two would destroy the thing that made the exchange good:

```text
DEVELOPMENTAL OBSERVATION   immutable, evidence-bound reading
                            ⭐ "This is what I saw when I read version 7."
AUTHOR INTENT               new information supplied by the writer
                            ⛔ does NOT mutate o1, and is never retroactive evidence
CRAFT REASONING             MAIA's contestable professional judgment
                            ⛔ never becomes "what the reading established"
REVISION PROPOSAL           a proposed intervention, not a fact
MANUSCRIPT CHANGE           a writer-authorized act
```

⭐ **MAIA did three sophisticated things right in that exchange and then hit an artificial wall.**
She preserved the original reading rather than pretending the later intention had been known; she
accepted new intent without rewriting history; and she shifted into craft reasoning explicitly,
giving a real principle — *a recurring focal point earns its recurrence through what stays fixed and
what moves.* **Then: "I can't make any of these changes — that's yours to do."** ⛔ **That wall is
the product defect. It is not rigor; rigor is the part above it.**

## 14 · 🔴 THE ARCHITECTURAL WARNING — founder, 2026-09-12

> ⛔ **Do NOT simply give `DEVELOPMENTAL-READER-05` write access. That would collapse several
> valuable boundaries.**

```text
DEVELOP    sees and names patterns · evidence-bound · the historical reading stays FROZEN
   ↓ Work with this
FOCUS      current Work + the observation + writer intent
           discussion · teaching · options · recommendations
   ↓ agreed proposal
REVISION   exact staged transformation · diff + rationale + provenance
   ↓ explicit approval
WORK       new current revision
   ↓
           ⭐ MAIA rereads what actually exists NOW
```

⭐ **That structure buys both things most systems trade against each other: epistemic rigor AND
creative usefulness.**

## 15 · ⭐ "WORK WITH THIS" — the missing gesture, on the observation

```text
Ask MAIA           help me understand this finding
Work with this     I want to REVISE the Work in relation to this finding
```

The observation is carried as **origin**, not as current evidence:

```text
Working from
  o1 · recurrence · Developmental Reading · Version 7 · Sections 45, 56, 57, 58, 62
```

⭐ **And before proposing language MAIA rereads the current manuscript, because the observation may
now be stale.** That answers the reading's own closing line — *"whether the chapters can each carry
a distinct fire is something only a fresh reading of the Work could tell you."* **So let her reread
it.**

## 16 · ⭐⭐ TWO APPROVALS, NOT ONE

```text
1  "Yes, make that change."     authorizes MAIA to PREPARE the edit
2  "Accept changes."            authorizes the edit to become part of the Work
```

⭐ **The second step shows exactly what will happen before anything is committed.** Between them sits
`Review proposed changes` → the real manuscript diff → `Accept changes · Edit proposal · Reject ·
Ask MAIA`. *"Keep the first paragraph, but make the other changes"* regenerates the staged edit.
**Nothing has touched the Work.**

## 17 · The eight operations — MAIA performs editorial work, not commentary

```text
REPLACE   rewrite a sentence / paragraph / section
INSERT    add a transition, example, scene, explanation, heading
DELETE    remove redundancy or agreed material
MOVE      relocate a paragraph or section
SPLIT     divide a paragraph or section
MERGE     combine material
REORDER   change structural sequence
RETAIN    ⭐ explicitly preserve material while revising around it
```

⭐ **`RETAIN` is the one that is easy to miss and matters most** — *"keep my paragraph about the
rain"* is an instruction, and a system with no way to represent it will quietly lose the thing the
writer asked to keep.

## 18 · 🔴 THE HARD INVARIANT

> ⭐⭐ **MAIA may never silently alter authored material.**

```text
READ      with lawful context
ADVISE    freely
PROPOSE   freely
STAGE     after agreement
WRITE     only after explicit member approval
```

**Every applied change preserves:** what text changed · what MAIA proposed · what the member
actually approved · what version it was based on · why · the resulting new revision · **the ability
to restore the previous version.**

⭐ **That is collaborative editing without an autonomous ghostwriter.**

## 19 · ⭐⭐ THE V1 ACCEPTANCE SPECIMEN — the campfire case, end to end

**Pre-authored, before anything is built, so the result has nothing to negotiate with:**

> **Starting from `o1`, can Kelly explain the artistic intention, learn something useful about
> recurrence, negotiate a solution with MAIA, have MAIA stage the corresponding changes in the real
> manuscript, approve them, and then continue the conversation against the newly revised Work —
> without the original developmental observation ever being rewritten or misrepresented?**

⛔ **Success is NOT "MAIA gives good advice."** Success is that the Work changes by an authorized act
and **the next MAIA turn reads the changed manuscript.**

⭐ **And the reciprocal half is part of it.** When the writer says *"actually that exact sentence is
the one I want repeated every time,"* MAIA revises her recommendation — *let that sentence be the
ritual threshold and make the material around it more distinct* — and what she has learned is
`PROJECT INTENT: an exact sentence is a deliberate recurring threshold`, ⛔ **never
`Kelly accidentally repeats sentences`.**

## 20 · The decision record, as the founder wrote it

```text
WHY WE CHANGED IT
  Intent           recurring campfire as phenomenological threshold
  Problem          large blocks of repeated description obscured experiential difference
  Craft principle  keep the ritual invariant small enough for the changing
                   experience to remain perceptible
  Decision         preserve one exact threshold sentence; differentiate the sensory
                   and phenomenological material around it
  Writer judgment  the recurrence should feel ritual, not merely familiar
```

> ⭐⭐ **Vastly richer than a Git-style revision history. It is the history of the Work becoming
> itself.**

---

## 21 · STEP 1 — DONE

```text
branch        claude/ws-field-focus-recovery
base          origin/clean-main-no-secrets (e1c6f527b)
recovered     6 commits · 18 files · all clean, no conflicts
scroll rule   revealWithin carried · 4 call sites · 0 scrollIntoView
guard         navigationPreserved re-pointed UNDER THE SCROLL LANE'S AUTHORITY,
              exactly as its own header instructs — never by the recovery lane
gates         524 tests · 0 failed · typecheck no regressions · no-supabase clean
not done      onAsk not repointed · flag untouched · not redesigned · not deployed
```

---

## 22 · ⛔ STANDING

```text
target                          RULED — continuous writer-controlled revision relationship
V1 six capabilities             RULED
authority model R/A/S/W         RULED
proposal ≠ finding              RULED
RevisionProposal shape          RULED as a shape · ⛔ no schema authored
#1275 recovery (Step 1)         ⭐ DONE — claude/ws-field-focus-recovery
Step 2 join (onAsk)             ⛔ NOT YET AUTHORIZED
RevisionProposal build          ⛔ NOT AUTHORIZED
§5.3 provenance ruling          ⛔ OWED, gates capability 4–6
deploy                          HELD
```
