# D5 — Shared Studio Process → Authored Revision / Proposal / Lineage · 2026-09-09

**Status**: **D5 COMPLETE · GATE D5 PASS.** Both founder rulings received 2026-09-09 (§6A, §5A ratified).
**Continues**: D4 PASS at `c93ec7c5d`. Architecture only — no UI, schema, routes, migration, proposal generation or editing behaviour implemented.

### Superseding interpretation — the historical flow is not rewritten

```text
OLD FRAME        Development -> Authored Revision Crossing
OPTION-C FRAME   Shared Studio Process -> Authored Revision / Proposal / Lineage
```

**There is no Develop-room-to-Write-room transition under Option C.** D4's `WORK` movement already contains direct editing, compositional or developmental, undeclared either way. D5's real question:

> **How does the shared Studio process lawfully touch the manuscript — direct editing, MAIA-proposed language, explicit adoption, reversibility, rereading and lineage — without MAIA acquiring the pen?**

---

## 1 · ⭐ The needed architecture already exists, one domain over

`structure/proposals/[proposalId]/adopt` is **exactly the shape D5 requires**, already built, already lawful:

```text
authorStructureFromProposal(manuscriptId, memberId, proposalId, expectedReviewRevision)

  · carries the MEMBER ID           the act is the writer's
  · carries NO CONTENT              its own header: "No tree, no section ids,
                                    no titles, no ranges, no provenance keys"
  · requires expectedReviewRevision optimistic concurrency
  · refuses stale_revision      409
  · refuses already_adopted     409 — "rather than quietly succeeding"
  · returns adoptedReviewRevision
```

⭐ **The contract's deepest property: the adoption call carries no content of its own.** The proposal already holds the language; adoption is **purely the authorization**. That is the machine form of *the writer holds the pen* — MAIA can compose a proposal all day and **nothing enters the Work until a member id authorizes a named proposal against a named revision.**

**And prose is excluded by a deliberate, named refusal** — `prose_in_payload: 422`. Not an oversight. **The only thing between this pattern and D5 is a refusal someone placed on purpose.**

## 2 · The revision store — append-only, member-attributed

```sql
working_draft_revisions (
  id, draft_id, revision_number CHECK (> 0),
  content, saved_by → members(id) ON DELETE RESTRICT,
  note, created_at, UNIQUE(draft_id, revision_number)
)
-- Append-only against modification: UPDATE refused structurally.
-- Restore writes a NEW revision carrying restored content — history is never rewritten.
```

**Reversibility (act 5) and lineage (act 8) are already satisfied.** `saved_by` attributes every revision to a member. Restore-as-new-revision means **no adopted proposal can destroy what preceded it.**

## 3 · The twelve acts against the substrate

| # | Act | Substrate | Status |
|---|---|---|---|
| 1 | exact locus from question/conversation/observation | reading evidence refs exist; **no crossing carries them** (D1 F-D1-1) | **ABSENT** |
| 2 | writer edits canonical draft directly | `saveSection(id, memberId, sectionId, body, baseVersion)` | **PRESENT** |
| 3 | writer commissions MAIA for language | `AskMaia`: *"nothing here changes the book"* | **ABSENT** |
| 4 | MAIA language exists first as a proposal | proposal store exists; **prose refused 422** | **PATTERN PRESENT · PROSE EXCLUDED** |
| 5 | proposal visibly provisional and reversible | proposals are separate objects; revisions append-only | **PRESENT** |
| 6 | writer adopts / modifies / rejects | adopt route; refuses `already_adopted` | **PRESENT (structure only)** |
| 7 | only the writer's act mutates the Work | adopt carries `memberId`, no content | **PRESENT** — the authorization model; see §5A.1 on scope |
| 8 | revision enters existing lineage | `working_draft_revisions`, `saved_by`, append-only | **PRESENT** |
| 9 | MAIA-seeded language expressible in provenance | **see §6** | ⛔ **BLOCKED** |
| 10 | question/observation context reachable, not a task | threads and standing persist | **PARTIAL** |
| 11 | MAIA rereads only when addressed | no reread path from an edit | **ABSENT** |
| 12 | iteration continues until the writer stops | nothing terminal in the substrate | **PRESENT by absence** |

**Seven of twelve are already lawful.** The missing ones are the crossing (1), commissioned prose (3, 4), reread (11), and provenance (9).

## 4 · F-D2-4 — provenance describes acts, never posture

⛔ **No provenance class keyed to `Writing` or `Develop`.** Option C provides no lawful observable boundary for such a class: one uninterrupted act may change posture without declaration or inference, so a posture-keyed class **would have to be guessed** — reintroducing the mode inference Option C removed.

Provenance therefore describes **observable acts and language ancestry**:

```text
AUTHORSHIP / CONTENT ORIGIN
  writer_direct                the writer changed the Work directly
  maia_proposal                MAIA generated language under explicit
                               commission — NOT manuscript text
  writer_adopted_proposal      the writer caused proposed language to enter
  writer_modified_proposal     adopted in changed form, where the system can
                               TRUTHFULLY establish that lineage

PROCESS CONTEXT (separate axis)
  live question · thread id · observation id if one participated ·
  exact section/range · before revision · after revision · proposal id ·
  writer adoption act
```

**The separation is what makes truthful statements possible:**

```text
LAWFUL     "This revision followed a conversation about the chapter ending."
UNLAWFUL   "This was a Develop edit."

LAWFUL     "MAIA proposed this language; you adopted and modified it."
UNLAWFUL   "MAIA authored your paragraph."
```

### 4.1 · Influence is not textual ancestry

MAIA says *"the bridge may be the problem."* The writer independently rewrites three paragraphs. **The conversation belongs in process context; the paragraphs are `writer_direct`.** Prose is not MAIA-authored because an observation influenced it.

MAIA says *"try: 'The fifth element does not arrive after the four…'"* and the writer inserts or modifies that line. **Now there is proposal ancestry worth preserving.**

⭐ **D5 must prevent overclaiming in both directions** — crediting MAIA for influence she did not author, and erasing ancestry she did.

> This is the operative form of close item 9. It also resolves the *"MAIA seeded → writer developed"* relationship without the `joint-origin` naming the founder declined: it is `writer_modified_proposal` — **a lineage relation between a proposal and a revision, not a co-author.**

## 5 · The lawful shape

```text
LIVE QUESTION / CONVERSATION / OBSERVATION if any
                    |
             EXACT WORK LOCUS
          +---------+---------+
          |                   |
  WRITER EDITS DIRECTLY   ASKS MAIA  (explicit commission)
          |                   |
          |          MAIA GENERATES PROPOSAL(S)
          |          proposal is NOT the Work
          |                   |
          |     writer edits / adopts / rejects / combines
          +---------+---------+
                    |
            CANONICAL REVISION      (only a member id authorizes)
                    |
             LINEAGE RECORDED       (acts + context, never posture)
                    |
     reread on request / continue / change / leave
```

**No observation is resolved. No posture is recorded as a truth about the writer.**

---

## 5A · ⚠️ BOUNDARY CORRECTION — founder ruling, 2026-09-09

> **Do not confuse substantial editorial intervention with ghostwriting. MAIA may edit deeply. The protected boundary is authorship authority and voice — not a prohibition on MAIA contributing prose.**

**The programme has been guarding against ghostwriting so carefully that it risked under-authorizing real editing.** A serious human editor legitimately rewrites sentences, tightens and expands, moves material, restructures sections, repairs logic and transitions, cuts, proposes connective language, offers alternatives, and sometimes rewrites a difficult passage substantially so the author can see what stronger prose could do. **All of that is editing** when done in service of the author's Work, meaning, intention and voice.

```text
FALSE       EDITOR never writes words  ·  GHOSTWRITER writes words

TRUE        EDITORIAL HELP   MAIA works on MY Work, toward what MY Work is
                             trying to become, and I retain authorship
                             authority over what stays
            GHOSTWRITING     MAIA takes over deciding what I mean, what I
                             want to say, or what the book should become,
                             and produces the Work in my place
```

### 5A.1 · "The writer holds the pen" is superseded

⛔ That phrase served as an authority metaphor and **becomes too restrictive when read literally.** Replaced:

> **The writer holds authorship authority. MAIA may take up the editorial pen when commissioned.**

MAIA may perform substantive editorial work **at any scale** when commissioned — sentence, paragraph, section, chapter, structure, logic, continuity, clarity, rhythm, developmental revision — including rewriting existing prose, reorganizing, cutting, expanding, bridging and restructuring. **Contributing words does not constitute ghostwriting.** Every intervention remains **inspectable, reversible, contestable**, and subject to acceptance, alteration or rejection.

⭐ **This matters most for a writer who is not a trained editor.** They should not need the craft vocabulary to name the operation before they can get help. They know *"this chapter doesn't feel right"*; MAIA may know the argument arrives before its grounding, three paragraphs repeat one function, the transition skips a conceptual step, the ending introduces rather than resolves. **Her value is partly that she knows the craft they don't need to know** — and §10's relational register is what turns that into help rather than a vocabulary lesson.

### 5A.2 · The higher standard

```text
NOT   make this professionally written
BUT   make this stronger while preserving the particular person writing it
```

**An editor can make prose technically stronger while quietly making it less yours.** That is the failure MAIA must beat, not merely match.

### 5A.3 · ⭐ Craft defect vs authorial particularity

```text
CRAFT DEFECT              awkward syntax · unclear antecedent · repetition ·
                          weak transition · structural imbalance
AUTHORIAL PARTICULARITY   unusual rhythm · intentional repetition ·
                          idiosyncratic phrase · spiritual vocabulary ·
                          long cadence · nonstandard but meaningful construction
```

⚠️ **The same surface feature can be either, and the text alone does not say which.** Repetition is a defect or a device. Long cadence is flab or breath. A nonstandard construction is an error or a signature.

**Operational heuristic, grounded in evidence MAIA actually has** — she has read the Work:

```text
CONSISTENT across the Work   -> treat as particularity until the writer says otherwise
LOCAL and isolated           -> may be a defect
UNCERTAIN                    -> ASK. Never flatten to resolve doubt.
```

⭐ **The error costs are asymmetric, and this is why uncertainty resolves toward asking.** A defect left standing is **visible** and correctable later. A flattened signature is **invisible** — the writer may never notice it is gone. That is precisely the Sourati finding's shape: content preserved, style narrowed, and the loss undetectable from the output. **Bias toward asking follows from the asymmetry, not from timidity.**

### 5A.4 · Deep editing requires the diff

If MAIA reorders paragraphs, cuts repetition, rewrites a transition and tightens four sentences, she must **show what she changed and why.** Reversibility without visibility is technically true and practically useless: **the writer cannot contest what they cannot see.** Under deep editing, the diff is not a nicety — it is the mechanism by which authorship authority is actually exercised.

### 5A.5 · The revised model

```text
WRITER WORKS DIRECTLY
        |
MAIA ADVISES
        |
MAIA PROPOSES OPTIONS
        |
MAIA EDITS UNDER COMMISSION
        |
WRITER REVIEWS / REWRITES / REJECTS / KEEPS
        |
MAIA REREADS
        |
repeat until the writer is satisfied
```

Replacing the thinner `writer edits OR MAIA proposes` fork at §5. *"Yes, except this sounds too much like you"* is a lawful and expected turn in this loop.

### 5A.6 · Provenance is transparency, never an ownership claim

The classes at §4 record **how language entered the Work**. They do not adjudicate who authored the book.

```text
LAWFUL     "MAIA proposed this language; you adopted and modified it."
BARRED     "MAIA contributed 23% of this chapter."
```

⛔ **No derived statistic over provenance** — no percentages, no contribution scores, no *"MAIA-assisted"* badge on the Work. **A heavily edited paragraph is still the writer's paragraph and the writer's book.** Provenance exists for transparency and reversibility; aggregating it into a metric converts a safeguard into a claim about authorship, which is the thing it was built to protect.

### 5A.7 · Effect on §6 — the open ruling gets heavier

Deep editing means **far more MAIA-originated language legitimately enters the Work.** The §6 provenance-location question therefore matters more, not less, and **Option 2's failure mode worsens in proportion**: the more MAIA lawfully writes, the more a missing ancestry row silently over-attributes to the writer. ⛔ Still not decided.

## 6 · The founder question — **RULED, see §6A**

**Act 9 cannot be expressed by the existing substrate.**

```sql
working_draft_revisions(id, draft_id, revision_number, content,
                        saved_by, note, created_at)
```

**There is no origin, provenance, or ancestry column, and no migration adds one.** `saveSection` takes `(body, baseVersion)` and records no origin. `note` is free text — a human annotation, not structured provenance; using it would make lineage unqueryable and unverifiable.

**So the revision store records WHAT changed and WHO saved it — never HOW it came to change.**

```text
Today a revision can truthfully say:  content · revision_number · saved_by
It cannot say:                        this content descends from proposal P,
                                      adopted or modified by the writer
```

⛔ **This requires a founder decision, and D5 stops here rather than assuming it.** The question is not *which columns* — it is:

> **Does authored-revision provenance become part of the canonical revision record, or is proposal ancestry held in a separate relation that references revisions without altering them?**

```text
OPTION 1   extend the revision record with origin/ancestry
           lineage is inseparable from the revision it describes
           cost: the append-only record acquires a field about MAIA;
                 every future revision must state an origin

OPTION 2   a separate proposal-ancestry relation referencing
           (draft_id, revision_number, proposal_id, adoption act)
           the revision record stays exactly what it is
           cost: lineage is a join, and absence of a row must be
                 read as writer_direct rather than as unknown
```

⚠️ **Option 2's cost is the sharper one**: if a missing ancestry row means `writer_direct`, then a *failure to write* the row silently attributes MAIA's language to the writer. **A provenance scheme whose failure mode is silent over-attribution to the writer is the wrong failure mode** — it erases exactly what close item 9 exists to preserve.

⛔ **Not decided here. No schema proposed.**

---

## 6A · ⭐ FOUNDER RULING — provenance belongs to the canonical revision

**Option 2 is rejected on exactly the ground D5 identified**: if "no ancestry row" can mean `writer_direct`, then a dropped write, race, migration defect or partial failure **silently erases MAIA's contribution.** That is an unacceptable failure mode.

**Option 1 in principle — with the detail kept normalized.**

```text
working_draft_revision
    id · draft_id · revision_number · content · saved_by · ...
    provenance_state / provenance_id        <- CANONICAL and MANDATORY
              |
revision_provenance
    origin_kind · proposal_id if any · adoption act if any ·
    source revision · exact locus · thread/question context ·
    observation context if applicable
```

> ### Every new revision states what is known about how it came to exist. **Silence is never interpreted as writer authorship.**

**Provenance states** — deliberately not MAIA-specific:

```text
writer_direct · proposal_adopted · proposal_modified · legacy_unmeasured
```

Names refinable; **the semantic rule is what binds.**

```text
ATOMICITY     revision and provenance are recorded together. If provenance
              recording fails, the REVISION ACT FAILS — nothing enters the
              Work carrying false or unknown attribution.

NO BACKFILL   historical revisions without provable ancestry are NOT
              backfilled as writer_direct. They hold an explicit
              legacy_unmeasured state.

NEVER POSTURE Provenance describes observable acts and textual ancestry.
              Writing/Develop posture is never a provenance value.

TWO AXES      process influence stays separate from textual ancestry.
```

**Worked, both directions:**

```text
MAIA: "The bridge may be the problem."  ->  writer rewrites independently
   canonical provenance   writer_direct
   process context        conversation/thread may be linked

Writer: "Rewrite this transition but keep my voice."
   MAIA proposes; writer substantially modifies and adopts
   canonical provenance   proposal_modified
   ancestry               proposal P -> writer adoption/modification -> revision R
```

**No co-author claim. No `Develop edit` claim. Facts only.**

### 6A.1 · Division of labour between the two records

```text
THE REVISION RECORD ANSWERS
  What kind of authored act produced this revision, insofar as the
  system can establish it?

THE PROVENANCE RELATION ANSWERS
  What exactly is its ancestry and process context?
```

## 7 · Substantive editorial authority — **RATIFIED**

The §5A boundary correction is **ratified as founder ruling**, not carried as a proposal. MAIA may work at any commissioned editorial scale — sentence · paragraph · passage · section · chapter · structure · logical flow · continuity · clarity · repetition · transitions · cuts · expansion · reordering · substantial rewrite.

The boundary is four questions, none of them *"did MAIA contribute words":*

```text
AUTHORSHIP AUTHORITY   Does the writer still decide what the Work means
                       and becomes?
VOICE                  Is MAIA strengthening THIS writer's Work, rather
                       than normalizing it toward her preferred prose?
ADOPTION               Does the writer inspect / alter / accept / reject?
REVERSIBILITY          Can the writer recover what preceded it?
```

**Not reducible to one-shot prose suggestions** — D4's iterative relationship remains binding: writer and MAIA may work a passage repeatedly until the writer decides it is right.

## 8 · Gate D5

> **Gate D5**: a lifecycle act may never be disguised as editing, and an edit may never be disguised as acceptance of MAIA's interpretation.

### 8.1 · ⚠️ The first half bites the §5A correction — and the substrate already answers it

§7 permits *reordering* and *restructuring* under commission. **Those are lifecycle acts, not edits**, and implementing them as prose saves would be precisely the disguise this gate forbids.

**The existing substrate already draws the line, and D5 adopts it unchanged:**

```text
EDITING        saveSection(id, memberId, sectionId, body, baseVersion)
               changes CONTENT WITHIN one section
               -> reordering paragraphs inside a section is EDITING

LIFECYCLE      structure/proposals -> adopt(memberId, proposalId,
                                            expectedReviewRevision)
               changes the Work's TOPOLOGY
               -> moving material BETWEEN sections, splitting, merging,
                  renaming, reordering sections is a LIFECYCLE ACT
```

⭐ **So §7's permission splits across two mechanisms, and must not be built as one.** A commissioned "restructure this chapter" that silently rewrote section bodies would change topology through the editing path — the exact prohibited disguise. It must surface as a **structure proposal the writer adopts**, which is why `prose_in_payload: 422` was correct all along: **that refusal is what keeps the two paths from collapsing.** WS2-08's `topology_change_requires_explicit_command` is the same rule from the other side.

### 8.2 · The second half is already discharged

An edit may never be disguised as acceptance of MAIA's interpretation:

```text
DECIDE durable state   "the writer worked here after this was raised"
                       NEVER "resolved" · NEVER "correct"
provenance             records the ACT and its ANCESTRY, never agreement
                       and never posture
no terminal state      no `done`, no queue, no observation closed by an edit
```

**Adopting MAIA's language is not agreeing with her reading**, and nothing in the recorded architecture can express that it is.

```text
GATE D5      PASS
```

## 9 · Standing

```text
D5                          COMPLETE · GATE D5 PASS
PROVENANCE LOCATION         RULED — canonical assertion + normalized detail
SUBSTANTIVE EDITING         RATIFIED — any commissioned scale
LIFECYCLE / EDITING LINE    saveSection vs structure-proposal-adopt (§8.1)
IMPLEMENTATION              ⛔ NOT AUTHORIZED — the flow says "specify"
STILL ABSENT IN RUNTIME     crossing (1) · commissioned prose (3,4) · reread (11)
D6                          NOT OPENED — process continuity
SEL-0B · selector · F-7 · schema · migration · routes · UI · merge · deploy
                            NOT TOUCHED
```

**Carried, none blocking**: F-D2-2 · F-D2-5 · F-D2-3 (belongs to D6).
**F-D2-4**: ⭐ **CLOSED** — provenance describes observable acts and textual ancestry (§4), and its location is ruled (§6A).
