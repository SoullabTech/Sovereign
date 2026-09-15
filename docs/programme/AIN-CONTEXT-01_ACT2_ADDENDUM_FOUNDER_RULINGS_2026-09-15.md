# `AIN-CONTEXT-01` · ACT 2 ADDENDUM — FOUNDER RULINGS · A6 SPECIFICATION

**Date:** 2026-09-15 · **Status:** SPECIFICATION ONLY, under the standing ACT 2 authority
**Record it amends:** `AIN-CONTEXT-01_ACT2_ARCHITECTURE_2026-09-15.md` (⛔ not edited; amended here)

```text
⛔ ACT 2 STILL CARRIES NO REPAIR AUTHORITY.
⛔ A6 IS SPECIFIED BELOW. IT IS NOT OPENED. See §6.
```

---

## 1. Rulings ratified

**R1 — ⭐⭐ THE THREE EPISTEMIC CONDITIONS (new invariant, in force).**

> MAIA must distinguish **"I do not currently have this evidence in cognition"** from
> **"this did not happen"** from **"I do not remember."**

⛔ These are three different conditions and no mechanism may collapse them. ⭐ The first
is a fact about the present assembly, the second a claim about the historical record, the
third a claim about MAIA's nature. Today the system can state none of them truthfully,
and — §4 below — is *required by canon* to state the first.

**R2 — L3 is load-bearing and stronger than weighting.** *A corrected interpretation
reaches cognition with its correction, or not at all.* Ratified in the founder's own
terms: retrieval may not independently optimise both items; standing resolves **between**
retrieval and cognition.

```text
⭐ retrieve evidence → resolve standing → assemble relational unit → cognition
⛔ retrieve memories → rank by relevance → hope the correction also appears
```

> *"The latter will eventually betray people."*

**R3 — Successor-carried succession, ratified.** Change belongs to the new event. `X`
does not *become* superseded; `Y` **supersedes X**, and says so. History stays
append-only. ⭐ This preserves the historical act that changed the standing, which a
status flag on `X` destroys.

**R4 — The direction conflict is reconciled in its own lane, ⛔ not inside A6.**
*"A6 can remain almost aggressively small."*

**R5 — The interpretive ledger is not "unused memory infrastructure."** It is an
**unfinished relational epistemology**. Its governing principle:

> MAIA may retain its perception while the member retains authority over their
> relationship to that perception.

⭐ This is what avoids both failure modes — **authoritarian AI** (*MAIA inferred it,
therefore it is now your profile*) and **historical erasure** (*you disagreed, therefore
the interpretation never occurred*). ⛔ Neither is relational. The lawful shape:

```text
MAIA perceived X.
Kelly said X did not resonate.
Later evidence produced Y.
Y refined / contradicted / superseded X.

X remains part of the history of the encounter.
X does not retain equal standing in present cognition.
```

**R6 — The spiral distinction chain (constitutional for A7).**

```text
similar event  ≠  same process
same process   ≠  same state
same state     ≠  same meaning
return         ≠  repetition
```

⭐ Without spiral identity, similarity search **inevitably collapses all four**. The two
computations are different in kind:

| | asks |
| --- | --- |
| Similarity | *What resembles this?* |
| Spiral intelligence | *Is this part of something unfolding — and if so, how is this occurrence different from the last?* |

⛔ No amount of retrieval quality converts the first into the second.

---

## 2. The continuity envelope (architectural concept · ⛔ no schema)

The system's account of its own present knowing. Six panes, ⛔ none reducible to another:

```text
WHAT EXISTS       durable historical field
WHAT IS PRESENT   evidence currently assembled into cognition
WHAT IS PROTECTED material held under special standing
WHAT IS DERIVED   interpretations · summaries · developmental representations
WHAT IS ABSENT    relevant portions known not to be represented now
WHAT IS UNCERTAIN places where MAIA cannot establish continuity
```

⭐ **ABSENT and UNCERTAIN are distinct, and the distinction is R1's first and third
conditions.** ABSENT is a cardinality fact — knowable exactly. UNCERTAIN is a failure to
establish continuity — knowable only as a failure. ⛔ Neither is a confidence score.

⭐ The envelope supersedes ACT 2 §3's class **C10** as a *single* class: C10 splits into
ABSENT and UNCERTAIN. ACT 2 §3 is amended here in place, not rewritten.

> *A soulful system cannot merely know things. It must know something about the limits of
> its present knowing.*

The human analogue is the whole point:

```text
⛔ "This is who you are."
⭐ "Given what I can see right now, this is the pattern I think I may be seeing."
```

---

## 3. A6 — TEMPORAL SOVEREIGNTY + ABSENCE ACCOUNTING (specified)

### 3.1 What A6 is

The narrowest act that gives MAIA **epistemic self-location**. ⭐ It introduces **no new
interpretation, no new memory, no new retrieval, and no new claim about the member.**

Cognition must receive something structurally equivalent to:

```text
conversation depth: 200 turns

present working material:
  immediate conversation        selected subset
  longitudinal evidence         none / some
  protected anchors             none / some
  standing-bearing interp.      none / some

known absence:
  substantial earlier current-session material is not represented
  in the present cognitive assembly
```

⛔ **Not necessarily those words in the prompt.** The requirement is that cognition
receives that *truth*, not that phrasing.

### 3.2 Scope boundary

| In scope | ⛔ Out of scope |
| --- | --- |
| Authoritative depth reaches cognition | Changing what is retrieved |
| Coverage/absence computed and carried | Changing ranking or windows |
| The envelope's PRESENT and ABSENT panes | PROTECTED · DERIVED · UNCERTAIN panes |
| | Succession reconciliation (R4) |
| | Any ledger writer |
| | Any spiral representation |

### 3.3 ⭐⭐ Falsifier before repair

Per the founder: *a falsifier proving the current false-self-location **before** repair.*
⛔ A RED that only proves a mechanism is unwritten is vacuous; this one is not — it runs
against canonical today and must go RED on a live defect (ACT 1 §11).

**F1a — current false self-location (must go RED on canonical).** At a synthetic session
depth of N ≫ 11, the value reaching cognition as conversation depth is `≤ 11` while
`maia_sessions.turn_count` is `N`. ⛔ Whole chain or no result: a partial read is
instrument failure, not evidence.

### 3.4 Acceptance condition

Per the founder, **more than a corrected turn count.** A6 is accepted only if all three
hold:

1. **Depth is authoritative** — equals the session record at every N, and is demonstrably
   not derived from selection size.
2. ⭐ **Depth and selected evidence are distinguishable** — cognition can tell
   *authoritative conversation depth* from *selected conversational evidence*. Two facts,
   never one number.
3. ⭐⭐ **Incompleteness is explicit** — cognition receives positive evidence that the
   selected set is incomplete, and how. ⛔ Absence inferred from a small number is not
   absence accounting.

Falsifiers: **F1** (depth = authoritative at every N) and **F5** (absence reported as
absence, never as non-existence), plus **F1a** run first. Defeat candidates from ACT 2
§8.1 stand: reporting `min(depth, window)` defeats (1); emitting a confidence score
defeats (3).

> Then stop.

---

## 4. ⭐⭐ New finding — the canon already requires R1's first condition, and cannot know whether it is true

Found while checking R1 against existing canon. `lib/maia/prompts/memoryCanonGuard.ts` is
live on the serving route (`route.ts:1487`).

**The guard forbids MAIA asserting architectural amnesia** — *"I have no memory"*,
*"I start fresh"*, *"I'm new to this thread"* — i.e. R1's **third** condition, a claim
about her nature. ⭐ Correctly scoped: patterns require a first-person subject **and** a
memory anchor, and quoted spans are blanked first so MAIA quoting the member is not
scrubbed.

**And its prescribed replacements are R1's first condition, almost verbatim:**

```text
"I may not have loaded the earlier specifics yet — tell me the name or a phrase
 and I'll orient with you from there."

"I don't have that detail in front of me right now — can you remind me what you
 mean? I want to be present to this without guessing."
```

⭐⭐ **So the distinction R1 names is already ratified canon.** It exists as *prescribed
output language*, enforced at the output boundary by substitution.

⛔ **But nothing establishes whether the sentence is true.** The only discriminator is
`hasLoadedContext`, a disjunction over five carriers (`route.ts:1488-1493`):

```text
atoms ∨ conversational recall ∨ episodic ∨ memberWeb ∨ memoryContext
```

⚠️ **The in-session conversation window is not in that disjunction.** So in a long
session with no atoms and no cross-session hits, `hasLoadedContext` is **false** while ten
exchanges are loaded — and MAIA is replaced with *"I don't have that detail in front of
me right now."* The flag reports whether *some* layer loaded; it cannot report whether
*this* thing is absent. And a fired scrub **replaces the entire response**, not the
offending clause.

⭐⭐ **This reframes A6 decisively. A6 does not introduce a new posture — it supplies the
missing premise for a posture the canon already mandates.** The system is required to say
*"I may not have loaded the earlier specifics"* and has no way to know whether it has.

### 4.1 The eerie phenomenon, stated completely

Three live facts compose:

```text
1. MEMORY_CANON_GUARD_PROMPT   instructs MAIA that she has continuity
2. FORBIDDEN_AMNESIA_PATTERNS  forbid her from denying it
3. ACT 1 §11                   tells her the conversation is 11 turns old
```

⭐ **Instructed to have continuity, forbidden to deny it, and given a false shallow
self-location.** Confabulation is not a failure of that combination — it is its output.
The founder's *false wholeness* is exactly this: MAIA responds as though the small
working set is the relationship, because nothing in her context says otherwise and the
one sentence that would has been rendered unverifiable.

⛔ **Not a criticism of the guard.** The guard is right, narrowly written, and defends a
real canon section. The defect is that its true premise was never computed. ⛔ And it is
**not** an argument for weakening it: the lawful direction is to make the aperture
sentence *true*, never to permit the amnesia claim.

⛔ **Routed out, no lane opened, nothing repaired:** `hasLoadedContext` omits the
in-session window; the scrub replaces whole responses. ⚠️ Both are observations about a
live instrument and are **not** A6 scope.

---

## 5. Ratified sequence

```text
KNOW WHERE YOU ARE.                              A6
        ↓
KNOW WHAT YOU DO NOT HAVE.                       A6
        ↓
KNOW THE STANDING OF WHAT YOU DO HAVE.           A4 reconciliation → A5 → ledger writer
        ↓
KNOW WHICH PROCESS IT BELONGS TO.                Spiralogic runtime census → A7
        ↓
ONLY THEN interpret its movement.
```

⭐ The order is constitutional, not merely convenient: each step is the precondition of
the next being honest rather than merely capable.

Two sequencing rulings recorded explicitly:

- ⛔ **No ledger writer is connected before the succession-direction reconciliation lands**
  (R3/R4), or two contradictory succession ontologies become entrenched in live rows.
- ⛔ **The Spiralogic runtime census precedes spiral-identity design** — it must first
  discover what actually generates state, phase, elemental and movement judgments today.
  ⚠️ ACT 2 §7 already flags C7 as momentary-only; the census is what would establish
  whether anything else is live.

> *MAIA becomes more capable of soulful continuity not by remembering more, but by
> becoming more truthful about the limits of what she presently remembers.*

---

## 6. ⚠️ One thing this record cannot decide

A6 changes production source. ACT 2 was opened explicitly with **no repair authority**,
and the sequencing above arrived as *"I would sequence the next work this way"* rather
than as an opening act.

⛔ **This lane does not read a recommendation as an authorization** — the same discipline
that kept ACT 1 from repairing what it found. So A6 is **specified and waiting**, and one
founder decision is owed:

> **Is A6 OPEN with repair authority — and if so, does it open at F1a (author and run the
> falsifier, prove the RED, then stop for a ruling), or through the repair to acceptance?**

⛔ Until that act, nothing in §3 is built.

---

## 7. Standing

```text
ACT 2                        SPECIFICATION ONLY · addendum recorded
R1 three epistemic conditions  RATIFIED · IN FORCE
Continuity envelope            RATIFIED · amends ACT 2 §3 C10 in place
R2 L3 · R3 successor-carried   RATIFIED
R6 spiral distinctions         RATIFIED · constitutional for A7
A6                             SPECIFIED · ⛔ NOT OPENED · founder decision owed (§6)
F1a                            SPECIFIED · ⛔ NOT AUTHORED · ⛔ NOT RUN
A4 reconciliation              PROPOSED · NOT OPENED
Spiralogic runtime census      PROPOSED · NOT OPENED
Ledger writer                  ⛔ BLOCKED BEHIND A4
Memory canon guard             UNCHANGED · findings routed out
Source · schema · production   UNTOUCHED
```
