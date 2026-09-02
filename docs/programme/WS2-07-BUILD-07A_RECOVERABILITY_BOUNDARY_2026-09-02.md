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

**B1 · Once converted, a draft cannot be changed through the current save route.**
`app/api/sovereign/manuscripts/[id]/draft/route.ts` writes `working_draft_revisions` and
`manuscript_working_drafts.content`, and contains no statement touching
`manuscript_draft_sections`.

**Corrected 2026-09-02, founder.** The first draft of this finding said sections would "go stale
against content" — they would not. `20260830000001` installs **two deferred constraint triggers**,
one on each side, and both raise when a section-addressable draft's content is not the exact
flattening of its sections:

```text
manuscript_draft_sections_round_trip_check     AFTER INSERT/UPDATE/DELETE on sections
manuscript_working_drafts_round_trip_check     AFTER INSERT/UPDATE on drafts
```

So a content-only save against a converted draft **fails at commit**. The committed state is never
inconsistent. **This is a safety result and a sharper liveness defect than the one first
reported:** the substrate does not decay, it becomes unwritable through the only save route that
exists.

The migration anticipated exactly this. Conversion was deliberately withheld until a section-aware
WRITE path existed, because converting sooner would have created two writable truths.

⛔ **A content-only request against an addressable draft would today surface as a database
exception, not a typed refusal** — a generic 500 rather than a statement of what the caller must
supply.

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

**RULED 2026-09-02.** Recorded here beneath the options as they were put, so the reasoning that
produced the ruling survives alongside it.

```text
1 · second durable prose store           REJECTED
2 · establish section↔revision relation  AUTHORIZED, as a prerequisite that
                                         completes the section-addressable write path
3 · narrow BUILD-07A                     REJECTED
4 · B3 as a reachability finding         ACCEPTED — correct the programme state,
                                         do not reopen 6A
```

**Why (1) was rejected.** A per-section snapshot or history table would duplicate manuscript prose
into a second custody domain, requiring its own deletion, retention, export and Sanctuary
guarantees — while still not solving B3 and still not making the writing route capable of
maintaining sections. The highest sovereignty cost, paid to leave the substrate unfinished.

**Why (3) was rejected.** Recoverability is not an optional fifth feature; it is what lets an
author inspect what MAIA reasoned from after the Work changes. Typed references and coverage
without exact recovery would produce an evidence object that *appears* trustworthy and cannot
support its own claims — worse than an explicit block.

**BUILD-07A remains open and pauses.** INV-7b stays binding. No partial closure at 4 of 6
outcomes.

---

## 4 · The decision, as it was put

**This is a manuscript-custody question, not an implementation detail**, which is why it was
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

⛔ **This session did not choose between these.** Each has a different blast radius, and two of
the three reach outside BUILD-07A. The ruling above is the founder's.

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
what "Stage 6 COMPLETE" means for a member as opposed to for the code.

**RULED: accepted as a reachability finding.** 6A is not reopened — its command, provenance,
non-consent boundary and founder witness remain valid. What changes is that the *unit* and the
*member capability* are stated apart:

```text
6A AuthorStructureCommand    CLOSED · mechanically and experientially verified
                             against a real converted substrate

Stage 6 member capability    PARTIAL · not ordinarily reachable
                             BLOCKED ON section-addressable draft liveness
```

*"Stage 6 COMPLETE"* without that qualification is no longer an honest product-state claim. It is
the distinction this programme keeps needing: **built and witnessed on a valid substrate ≠
reachable through the ordinary member journey.**
