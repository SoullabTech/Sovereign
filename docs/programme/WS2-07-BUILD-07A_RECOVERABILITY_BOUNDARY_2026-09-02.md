# WS2-07 · BUILD-07A — recoverability boundary, reported before any schema

```text
LANE       JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 · BUILD-07A
STATUS     STOPPED AT THE AUTHORITY BOUNDARY · founder decision required
CANONICAL  clean-main-no-secrets @ 838eabfd8
DATE       2026-09-02
```

BUILD-07A's authorization draws one line: *"If satisfying exact recoverability requires creating a
second durable store of manuscript prose, stop and report before adding that schema. That is a
manuscript-custody decision, not an implementation detail."*

**The line is reached.** Read-only investigation, no schema written, no persistence chosen.

---

## 1 · What the existing substrate actually holds

```text
working_draft_revisions        WHOLE-DRAFT content, append-only, one row per revision.
                               UPDATE refused structurally. This is real prose history.

manuscript_working_drafts      current content + revision_count
                               + section_addressable_at, section_conversion_version

manuscript_draft_sections      the section-addressable partition: id, position, text
                               mutable in place (has updated_at). NO history table.
```

## 2 · Three findings, in ascending order of consequence

**B1 · The draft write path never touches sections.**
`app/api/sovereign/manuscripts/[id]/draft/route.ts` writes `working_draft_revisions` and
`manuscript_working_drafts.content`. It contains no statement touching
`manuscript_draft_sections`. So a draft that *were* section-addressable would have its sections go
stale against its own content on the next save, with no re-partition recorded.

**B2 · No per-section history exists anywhere.**
Revisions store the whole draft as one `content` text. `manuscript_draft_sections.text` is mutable
with no shadow table. There is no stored mapping from any revision's content to section ids, so
"what did section X contain at revision N" is not answerable from what is stored — re-partitioning
an older revision yields boundaries with **no id continuity** to the sections that exist now.

**B3 · No production code path converts a draft to section-addressable.**
Only three witness scripts set `section_addressable_at`:
`ws2-05a-structure-witness.ts`, `ws2-05b-proposal-witness.ts`, `ws2-05b-review-witness.ts`.
Migration `20260830000001` states it plainly: *"NULL means the draft has never been converted,
which is every production draft today."*

⛔ **Scope of B3, stated exactly.** What is verified is that **no code in this repository**
converts a draft outside those witness scripts. Whether production currently holds any converted
draft is not verifiable from here and is **not** claimed.

---

## 3 · Why this blocks BUILD-07A specifically

DECIDE's **INV-7b** requires that `SectionState` *resolve to* the exact immutable state read, not
merely detect that it changed. Four ways to satisfy it:

```text
(a) per-section immutable snapshot captured at read time
    → a SECOND DURABLE STORE OF MANUSCRIPT PROSE            ⛔ STOP CONDITION

(b) per-section revision history table
    → also a second durable store of prose                  ⛔ STOP CONDITION

(c) reconstruct by re-partitioning an old revision
    → FAILS. Section ids are assigned at conversion; re-partitioning
      a different revision produces boundaries with no id continuity

(d) freeze (revisionNumber, charRange) into working_draft_revisions.content
    → NO new prose store. Reuses an existing immutable, append-only source,
      which BUILD-07A's authorization explicitly permits
```

**(d) is the only option that stays inside BUILD-07A authority** — and it is not currently
available, because of B1 and B2: nothing relates a section id to a range within any revision's
content, and nothing maintains that relation across saves.

Note that (d) does **not** violate INV-5's prohibition on character offsets. That prohibition is
on offsets into **live** prose; an offset into an immutable append-only revision is stable by
construction. The distinction is the whole difference between the two.

---

## 4 · The decision required

**This is a manuscript-custody question, not an implementation detail**, which is why it is
reported rather than resolved:

```text
1 · Authorize a second durable store of manuscript prose
    per-section snapshots or per-section history. Answers INV-7b directly.
    COST: the Work's prose exists in a second place, with its own retention,
    deletion-cascade and Sanctuary implications

2 · Establish the section↔revision relation instead
    make the draft write path maintain the partition, so (d) becomes available
    and no prose is stored twice.
    COST: touches the draft write path, which is outside BUILD-07A's scope
    and serves every writing session

3 · Narrow BUILD-07A
    build the typed evidence vocabulary, coverage validation and structural
    evidence now; defer INV-7b recoverability to its own authorized unit.
    COST: the substrate would satisfy 4 of its 6 required outcomes, and the
    recoverability falsifiers (1 and 2) could not yet be demonstrated
```

⛔ **I am not choosing between these.** Each has a different blast radius, and two of the three
reach outside BUILD-07A.

---

## 5 · Also worth your attention, separately from the decision

B3 means the entire structure path — 05A, 05B, and the 6A AuthorStructureCommand merged today —
operates only on drafts a **witness script** converted. `authorStructureFromProposal` refuses when
`section_addressable_at IS NULL`, which by B3 is the state of every draft no script has touched.

That does not undo 6A: its walk was witnessed against a real converted draft in scratch Postgres,
and the mechanics hold. What it means is that **a member cannot reach that threshold today**,
because no member-facing path converts their draft. This was not visible from FIND, which
censused what exists rather than what is reachable.

Recorded here because it was found while investigating something else, and because it bears on
what "Stage 6 COMPLETE" means for a member as opposed to for the code. **It is not repaired here,
and no repair is proposed.**
