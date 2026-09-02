# WS2-07A · Developmental Intelligence Census

```text
LANE        JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 · 07A FIND
CANONICAL   clean-main-no-secrets @ 2f8d97297
METHOD      read-only. Nothing was repaired, wired, renamed or deleted.
DATE        2026-09-02
```

⛔ **A defect found here is recorded in its row and left alone.** Several rows below name real
problems. None of them is authorized to be fixed by this document, and 07B–07H remain
unauthorized.

**What a row means.** `EXISTS` is production code with live callers. `PARTIAL` works for a
narrower case than its name suggests. `MISSING` was looked for and not found. `DO NOT REUSE`
is present in the tree and must not be built on.

---

## 1 · The ten questions

**1 · What developmental-editor functionality already exists?**
None. There is **structural** intelligence — MAIA perceives how a Work divides — and there is
**conversational** intelligence anchored to that reading. Neither is developmental: nothing
observes arc, continuity, repetition, coherence, voice, or reader orientation. The seven lenses in
`DEVELOPMENTAL_EDITOR_CAPABILITY.md` have no implementation anywhere in the tree.

**2 · What is production code versus experiment/fixture?**
Production: `evidence · interpret · maiaReader · readScope · readerProvenance · review ·
reviewOperationParser · proposalStore · structureService · tree · authorStructure ·
canonicalFingerprint`, the five structure routes, and the whole `lib/manuscript/ask/` runtime.
Fixture: `fixtures.ts` (3 callers, all tests and one witness script). Neither: `detect.ts`, which
is imported by nothing and says so itself.

**3 · What manuscript context can MAIA currently receive?**
Two different answers for two different paths, and the difference is the most consequential
finding in this census.

```text
STRUCTURE READER   headings for every section, plus mechanical observations;
(structure/read)   then, on request, FULL BODIES of at most 8 sections /
                   60,000 chars, hard-refused past the ceiling, never truncated

ASK MAIA           headings and positions only. AskContext.sections is
(ask)              documented "Never bodies." She receives the frozen
                   interpretation, its evidence and coverage, the member's
                   reviewed tree, and staleness — but no prose at all
```

So MAIA can read up to eight sections of a Work once, when producing a structural reading, and
can read none of it when talking about that reading afterwards.

**4 · Can MAIA address a whole authored division?**
**No.** `AskAnchor` has `{on: 'division', proposalId, unitId}`, but that `unitId` is
proposal-internal (`p1`, `p3`, `m1`) inside a reviewed tree. After 6A, an *authored* division is a
row in `manuscript_structure_units` with a uuid. **No anchor addresses it**, and no MAIA module
imports `loadStructure` or reads `manuscript_structure_units` — verified by grep across
`lib/manuscript/ask/` and the reader modules. 6A gave the Work a canonical structure that MAIA
cannot currently see.

**5 · Can she address the whole Work?**
**Partially, and only in the weak sense.** `AskAnchor` has `{on: 'work'}`, so she can be *anchored*
on the Work — but with headings only, and with the structural reading bounded to 8 sections, she
cannot *read* it. Whole-Work perception, which the capability spec calls "the requirement, not a
nicety", has no substrate today.

**6 · What evidence types already exist?**
Six mechanical observation types in `evidence.ts` — `StructuralLabel`, `NumberingPattern`,
`LexicalDensity`, `RepeatedForm`, `SuspectedScaffold`, `Transition` — with `EvidenceCoverage`,
`EvidenceMethod` and `EvidenceNonConclusion`. All operate on headings and per-section aggregates.
`observeTransitions` is implemented but deliberately excluded from `gatherEvidence` (a detector
that fired at 59% of boundaries). **No evidence type reads prose for developmental signal.**

**7 · What is already persisted?**
```text
member_manuscripts · manuscript_sections · manuscript_working_drafts
manuscript_draft_sections · manuscript_source_arrivals
manuscript_structure_proposals   frozen evidence/interpretation/coverage/hashes
                                 + mutable reviewed + review_revision + adoption
manuscript_structure_units       canonical, origin, adopted_from_proposal_id
manuscript_structure_members     one authored home per section
ask_threads · ask_turns          conversation, with provenance
manuscript_keeps · collections · collection_items · renders
```
Nothing developmental is persisted. There is no observation, reading, finding, or lens table.

**8 · What existing Review/Develop surfaces should own the result?**
There is no Develop room. `studioMap` declares `home`, `current-book` (canvas · write · source)
and `threshold` (import) — no Develop, Explore, Review or Publish room exists. The one review
surface, `StructureReview.tsx`, is mounted at `/writers-studio/review`, a route deliberately
outside the map because "the machine harness needs to open a proposal directly". **This census
does not choose an owner** — that is 07D's question, and choosing here would be architecture.

**9 · Are there duplicate or legacy developmental paths?**
No duplicates. `maiaReader` and `askReader` each define their own version constant, prompt hash
and provenance record, which is a **parallel pattern, not a duplicated one** — they answer
different questions and the parallel is worth keeping. One legacy artifact: `detect.ts`.

**10 · What would silently make MAIA an author rather than a reader?**
Recorded as a standing hazard list, since every item is reachable by an ordinary-looking design
decision:

- **Making `interpretation` required** on a developmental observation. It is optional by design in
  the reviewed-structure object precisely so MAIA never has to manufacture one.
- **A "Reframe" or "Develop" verb that returns prose.** The capability spec already excludes
  Rewrite; the risk is that Reframe becomes Rewrite by degrees.
- **Raising `ReadScope` toward "send the book."** The ruling is explicit that a bounded reading
  failing is a *finding about the protocol*, not a reason to raise the ceiling.
- **Giving a developmental path write access to canonical structure.** Currently prevented
  structurally by `askRuntimeCannotWrite.test.ts`, which names `structure/authorStructure` and both
  command symbols.
- **Inferring a relationship between an observation and a revision** from textual similarity or
  temporal proximity — already frozen against in the lane's §3.
- **Presenting a developmental reading where authored structure renders.** The 05B rule that
  `proposed` units are filtered out of the authored tree exists for exactly this reason.

---

## 2 · The census

### EXISTS

| Thing | Where | Note |
|---|---|---|
| Structural evidence gathering | `structure/evidence.ts` | 6 observation types · coverage · non-conclusion |
| Structure reader | `structure/maiaReader.ts` | `REAL-STRUCTURE-READER-01`, two-pass, `promptContractHash()` |
| Read scope ceiling | `structure/readScope.ts` | 4 ids/request · 8 sections · 60k chars · refuses, never truncates |
| Reader provenance | `structure/readerProvenance.ts` | identity + version, stored on the proposal |
| Interpretation types | `structure/interpret.ts` | ProposedUnit · UncertainRegion · EditorialQuestion · EditorialSynthesis |
| Proposal persistence | `manuscript_structure_proposals` | frozen half enforced by an immutability trigger |
| Reviewed structure + operations | `structure/review.ts`, `reviewOperationParser.ts` | `validateReviewed` types 5 structural refusals |
| Authored structure | `manuscript_structure_units/_members`, `structureService.ts`, `authorStructure.ts` | canonical, member-authored, provenance-bearing |
| Ask MAIA runtime | `lib/manuscript/ask/*`, `ask_threads`, `ask_turns` | 7 anchor kinds · three-state staleness · frozen reading |
| MAIA-cannot-write guard | `ask/__tests__/askRuntimeCannotWrite.test.ts` | module-graph + symbol, negative-control verified |
| Canonical fingerprint | `structure/canonicalFingerprint.ts` | before/after digest of the whole authored structure |
| Working-draft revisions | `draft/revisions/route.ts` | append-only; restore writes a NEW revision |
| Experience Contracts | `contracts/writer-canvas-structure.md`, `structure-review.md` | both ratified, both carry evidence |

### PARTIAL

| Thing | Works for | Does not |
|---|---|---|
| Whole-Work anchor | being *anchored* on the Work | reading it — headings only, 8-section ceiling |
| Division anchor | a **reviewed** unit inside a proposal | an **authored** unit in `manuscript_structure_units` |
| Evidence types | heading and per-section aggregates | any prose-level developmental signal |
| Transition detection | implemented in `evidence.ts` | excluded from `gatherEvidence` — fired at 59% of boundaries |
| Review surface reachability | direct route, harness-openable | not in `studioMap`, whose stated invariant is that a built destination always carries a link |

### MISSING

```text
Develop room                          no room in studioMap; Explore/Review/Publish likewise absent
all seven lenses                      Structure · Development · Continuity · Arc · Voice ·
                                      Coherence · Reader — no implementation in the tree
passage workflow                      Keep / Reframe / Move / Cut / Develop / Discuss
developmental observation object      no type, no table, no route
developmental reading                 no equivalent of StructureInterpretation for development
chronology across the Work            the Continuity lens requires it; nothing computes it
MAIA ↔ authored structure             no module reads manuscript_structure_units into any prompt
whole-Work body access                bounded by ruling to 8 sections / 60k chars
```

### DUPLICATE

None found. The two reader paths are parallel by design, not duplicated.

### LEGACY

| Thing | State |
|---|---|
| `structure/detect.ts` (336 LOC) | Self-declared "NOT AUTHORIZED, NOT WIRED, NOT SHIPPED". Imported by nothing. Its header records its first run on Elemental Alchemy proposing "Healing 75-84" and missing Fire, Water, Earth, Air and Aether entirely. |

### DO NOT REUSE

| Thing | Why |
|---|---|
| `structure/detect.ts` keyword-run rule | Wrong by construction for a Work that revisits its themes: a word recurring across the book makes its run span most of the manuscript, and the run is discarded. |
| `structure/fixtures.ts` as production input | Test and witness material only (3 callers, all tests/scripts). It must not become a source of member-facing readings. |
| `adopted_from_id` on structure units | Deprecated in place by 6A; belongs to an abandoned model. Retained only because `canonicalFingerprint` selects it. |

---

## 3 · Findings recorded, not repaired

**F1 · Stale claim on a live surface.** `app/writers-studio/review/page.tsx` still states
*"Nothing reachable from here can author canonical structure; there is no adoption endpoint to
reach."* Since 6A that is false: the adopt endpoint exists and the crossing is on that surface.
The file's comment is stale, not the boundary — the boundary held and was witnessed.

**F2 · The gap 6A opened.** 6A gave the Work a canonical authored structure, and no MAIA path can
see it. Every reading MAIA can currently give is anchored to a *proposal*, not to what the member
actually authored. This is the single largest structural fact facing Stage 7, and naming it is not
the same as deciding what to do about it.

**F3 · Two context regimes, one system.** The structure reader may read bodies under a ruled
ceiling; the Ask runtime may read none. Any developmental capability will have to sit in one
regime or the other, and the choice is a sovereignty decision rather than a technical one.

**F4 · The capability spec's dependency note is already load-bearing.** It says whole-Work
knowledge is *Work Structure* — member-declared — and that this is a dependency of the
structure-aware lenses **only**. With 6A merged, member-declared structure now exists for the
first time. Which lenses actually need it is an 07B/07C question.

---

## 4 · What this census does not do

- does not repair F1, or anything else
- does not propose an architecture, an object model, a schema, a route, or a prompt
- does not choose which surface owns a developmental result
- does not rank the lenses or select a first one
- does not authorize 07B or anything beyond it

The next legitimate act is **UNDERSTAND** — defining what "developmental reading" means for this
system — and it opens on its own authorization, not because this census exists.
