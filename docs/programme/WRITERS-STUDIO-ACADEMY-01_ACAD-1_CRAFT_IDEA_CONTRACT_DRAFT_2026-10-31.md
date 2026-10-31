# WRITERS-STUDIO-ACADEMY-01 · ACAD-1 · Craft-idea contract (DRAFT)

```
STATUS:      DRAFT. Contract only. No store, no code, no content, no wiring.
AUTHORIZED:  ACAD-1 started on the founder's "Start ACAD-1", 2026-10-31.
NOT:         ACAD-2 (falsifiers), ACAD-3 (content), ACAD-4 (wiring), the cohort
             invitation, the four Door 2 line lifts.
BOUND TO:    canonical eb3394749b8f3806eabdf6f82354508585a36664 (git ls-remote, 2026-10-31)
PARENT:      docs/programme/WRITERS-STUDIO-ACADEMY-01_CENSUS_AND_SCOPE_DRAFT_2026-10-31.md (§6, §12, §13, §14)
```

## 0. What this is

The unit the Academy is made of, and the link between its two tiers. It states
what a craft idea **is**, what it may never carry, and how a teaching moment
shows where it came from. Per the founder's direction (§12), Tier 1 (in the
Work) and Tier 2 (the room) are **connected, not the same**.

Per the TESTING-01 §0 / S3 Class-B practice, the contract types **observable
semantics, not storage**: nothing here names a table, column, or file format.

## 1. Referents checked (names are not identity)

| Name | What it is | Relation |
|---|---|---|
| Learning facet "Teach me" acts (`app/writers-studio/flagship/flagshipTokens.ts`) | Existing writer-facing acts; census §2 | The consumer of Tier 1 at ACAD-4. Not changed here. |
| `docs/design/author-studio/WRITING_CRAFT_CAPABILITY_RECORD_2026-08-05.md` | Canvas **formatting grammar** (rich text, quotes, citations, tables). Read at its head only. | Different object despite "craft". Not this contract's substrate. |
| `academy_*` tables / Inner Lands | Soullab Academy (practitioner path) | Excluded (census Shape C). |
| `lib/learning/claude-teacher-service.ts` | Unrelated learning service; not read | Not assumed to relate. |

No existing craft-idea object was found at the bound SHA by filename search.
That is a statement about the search, not yet about the world.

## 2. The unit

A **CraftIdea** is an authored, reviewed statement that **describes a technique**
and shows where in a writer's own text that technique can be seen. Fields, as
observable properties (names illustrative, representation unconstrained):

| Property | Meaning | Rule |
|---|---|---|
| `ideaId` | Opaque, stable identity | Never derived from text; survives edits; one idea, one id. |
| `tier` | `in-work` or `room` | A fact about reach, not quality or level. |
| `technique` | Plain description of what the technique does | Describes; never evaluates (see §3). |
| `anchorRequirement` | What the writer's own passage must show for the idea to be offered | Required and non-empty. An idea with no way to anchor cannot be offered at all. |
| `source` | Authorship and basis: who wrote it, from what craft tradition or reasoning, in plain words | Required. Visible to the writer at the teaching moment. |
| `linkedIdeaIds` | Ids of counterparts in the other tier | Declared, never inferred from similarity. May be empty. |
| `review` | Reviewer records (§5) | Required to be offered; absence means not offered. |

### Fields that must not exist anywhere in the type
`level`, `difficulty`, `skill`, `competence`, `rank`, `score`, `severity`,
`priority`, `recommended`, `quality`, `good`, `bad`, `progress`, `completed`,
`streak`, `certificate`, `prerequisite`. No field may encode who the idea is
for. (Facet parity: FACETS-01. No member classification: L6c/L6e.)

## 3. No-quality-claim rule (the contract's centre)

`technique` states what a move **does or how it works**, never that it is good,
required, expected, or better than another. Test of the law in words:

- Allowed shape: *"A withheld ending leaves the question open for the reader."*
- Not allowed: *"Strong endings answer the question."* (prescribes quality)
- Not allowed: *"Good writers vary sentence length."* (imports an external ideal;
  breaches Invariant 14 and the voice-lens rule that the manuscript is the reference)

Not mechanically provable. The census (§7) and §X record this as a **human
witness** item; the contract does not pretend a lint settles it. ACAD-2 may add
mechanical *proxies* only if labelled as proxies and never reported as proof.

## 4. Two tiers and the link

- **Tier 1 `in-work`:** short, bounded; offered only through a writer's own
  passage and observation.
- **Tier 2 `room`:** longer-form; offered only inside a Work and passage the
  writer chose (no anchor, no lesson). Lives behind Door 2 (not built).
- **Link:** `linkedIdeaIds`, declared in both directions. Symmetry is a
  contract rule: if A lists B, B lists A. A dangling or one-way link is a defect.
- **Short form:** for a linked pair the Tier 1 text is the short form of the
  Tier 2 entry. Divergence between them is a defect, not a variant. (Condition 2.)
- A Tier 2 idea may have no Tier 1 counterpart; a Tier 1 idea may have no room
  counterpart. Neither is required to.

## 5. Review record (per §13 items 1-6, adopted on the founder's yes)

Each review entry: reviewer (founder or beta writer, by stable pseudonymous
reference), date, tier, verdict (`describes` / `prescribes` / `unclear`), and
**a reference to the passage reviewed against, never a copy of it**.

- Founder **ratifies** admission. A beta writer's verdict **informs**, never admits.
- Founder review alone is not sufficient for admission of the
  `describes`-test: at least one independent beta-writer read is required to
  *offer* an idea. (Proposed reading of §13 item 2; founder to confirm the "at
  least one".)
- Disagreement is stored as disagreement. No tallies, no averages, no ranking.
- A later `prescribes` verdict **reopens** the idea (not offered until
  re-ratified); earlier entries are kept.
- A writer's passage never enters the library, any log, or any prompt beyond
  the review turn, and is used only with their consent.
- Admission state is derived from these facts; no stored "approved" flag may
  exist apart from them.

## 6. The teaching moment (what the writer sees)

For any offered idea the moment carries, visibly:
1. the technique statement;
2. the **source** (§2);
3. the **anchor**: the passage the writer is standing in that shows it;
4. a way to decline, and a way back to the passage.

Declining changes nothing: not what MAIA reads, not what it proposes, not the
Work. Teaching text never flows into a proposal. The idea is offered; the
writer is never graded against it.

## 7. Facet and authorship invariants (carried, not new)

- Same observation, same `ideaId`, in Guided, Learning and Direct; facets vary
  default depth only (FACETS-01, reachability ruling).
- MAIA-authored prose in the Work does not rise because an idea was offered
  (L6b).
- No idea may be selected by writer level, history, or inferred competence.
  Selection is by anchor match only; the cut among several matches is
  non-evaluative (manuscript order or `ideaId` order), never "most useful".

## 8. What ACAD-1 deliberately leaves open

1. **Location** of the eventual typed contract (`lib/manuscript/**` vs
   `lib/livingWork/**`). Not chosen: neither has a craft object, and a
   location chosen now would precede the store ruling. Recommendation:
   `lib/manuscript/` (Learning acts act on manuscript passages), with the
   founder free to override. No file created there.
2. **Whether "at least one" independent beta read** is the right admission bar (§5).
3. **Store shape** (static reviewed file vs table). Contract only here.
4. **Who may author** an idea. The parent draft says I do not author craft
   doctrine unasked; this contract does not authorize authoring.
5. **Tier 2 admission measure** (§12 condition 4): reviewers now named, the
   measure still open.

## 9. Handoff to ACAD-2 (not started)

Falsifiers to author, each paired with a defeat candidate (TESTING-01 §0):
anchor-less idea offered · same observation, different `ideaId` per facet ·
a level/competence field present · one-way or dangling link · divergent linked
pair · teaching moment without visible source · decline altering reading or
proposal · idea admitted on founder review alone · idea text inside a proposal
· admission as a stored flag independent of review facts. A surviving candidate
repairs the suite, never the candidate.

## 10. Standing

ACAD-1 contract DRAFTED, uncommitted, untracked. Nothing built, no `lib/` or
`app/` change. ACAD-2, ACAD-3, ACAD-4 not authorized. Cohort invitation not
authorized. Door 2 line lifts not done. "Describes, not prescribes" for any
curated content remains UNKNOWN pending beta-writer and founder witness.
