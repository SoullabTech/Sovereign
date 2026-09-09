# D5 — Shared Studio Process → Authored Revision / Proposal / Lineage · 2026-09-09

**Status**: **D5 ARCHITECTURE SPECIFIED · ⛔ STOPPED AT ONE FOUNDER QUESTION (§6).**
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
| 7 | only the writer's act mutates the Work | adopt carries `memberId`, no content | **PRESENT — and it is the strongest thing here** |
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

## 6 · ⛔ STOP — the one founder question

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

## 7 · Standing

```text
D5 ARCHITECTURE            SPECIFIED
ACTS LAWFUL TODAY          7 of 12
BLOCKED ON FOUNDER RULING  act 9 — provenance location (§6)
STILL ABSENT               crossing (1) · commissioned prose (3,4) · reread (11)
PROVENANCE KEYED TO POSTURE   ⛔ REFUSED — no lawful observable boundary
D5 GATE                    NOT APPLIED — stopped at the ruling first
D6                         NOT OPENED
SEL-0B · selector · F-7 · UI · schema · migration · merge · deploy   NOT TOUCHED
```

**Carried**: F-D2-2 · F-D2-5 (both still open, neither blocking) · F-D2-3 (continuity work).
**F-D2-4**: answered in principle at §4 — provenance describes acts, never posture — **and blocked on §6 for where it lives.**
