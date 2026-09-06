# WS2-08 · BUILD-08A HEADING DEPTH — CLOSURE RECORD

```text
UNIT        BUILD-08A · preserve explicit heading depth at ingest
LANE        WS2-08-HIERARCHICAL-MANUSCRIPT-STRUCTURE-01
CANDIDATE   branch claude/manuscript-chapter-segmentation-jlwnlj · PR #1230
            migration 20260906000001_manuscript_section_heading_depth.sql
SC-1 FROZEN a75f4543227ff82ecbfec3c80bd9e9490a26576a
STATUS      CLOSED / ACCEPTED (founder, 2026-09-06) — §1
```

---

## 1 · Founder closure act — 2026-09-06

*Verbatim. This is the act. Everything below it is record.*

> I close and accept WS2-08A. F1, F2, F3 and SC-1 pass. F6b remains FAIL · R5 permanently;
> SC-1 is a narrower successor claim and does not repair F6b, and it is not outcome-blind.
> This closure authorizes nothing downstream. 08B remains HOLD · UNOPENED.

The slot stood empty in draft until the founder adopted and issued this sentence. Its wording
was supplied in-session by the assistant; the authority comes from the founder’s explicit
adoption and closure act, not from authorship of the wording. The record was not placed in
the repository before that act.

Not added: a `Verified by Mentor:` line. No Mentor verification occurred. The prior closure
pattern distinguishes the founder act from the evidence record rather than manufacturing an
authority label, and that distinction is kept here.

---

## 2 · Acceptance basis

*Evidence adjudication, 2026-09-06, verbatim as supplied to this session. This section is an
adjudication of evidence. It is not the closure act; §1 is.*

```text
Acceptance basis

F1  PASS
    DOCX Heading 1 / Heading 2 persisted on Source as depth 1 / 2,
    decisive signal markdown.

F2  PASS
    generic ALL-CAPS persisted as caps / NULL; uppercase CHAPTER wording
    persisted as chapter / 1.

F3  PASS
    a member-drawn cut persisted on Source as member / NULL.

SC-1  PASS
      fresh post-freeze acceptance reading under the criterion frozen at
      a75f4543227ff82ecbfec3c80bd9e9490a26576a.

F6b  FAIL · R5 · PERMANENT HISTORICAL RESULT.

SC-1 does not repair, supersede, or reclassify F6b. F6b asked whether the
write boundary remained quiet across the migration interval; that claim failed.
SC-1 establishes only the narrower successor claim: the WS2-08A migration did
not mutate any of the 810 pre-existing manuscript_sections rows, using tuple
lineage relative to the migration transaction.

SC-1 is explicitly not outcome-blind. Its corrected predicate was observed
during review before freeze. That observation was inadmissible as the acceptance
witness; the fresh post-freeze reading is the acceptance reading, not an
independent blind replication.

Closure of BUILD-08A authorizes nothing downstream.
BUILD-08B remains HOLD · UNOPENED and requires a separate founder act.
BUILD-08C–08E remain unauthorized.
BUILD-07F is untouched and remains parked behind re-freeze followed by a
genuine subject-bound §2.2 act.
```

---

## 3 · Where the evidence lives

```text
F6b · FAIL · R5      WS2-08A_POST_FAILURE_ADJUDICATION_2026-09-06.md
SC-1 criterion       WS2-08A_POST_FAILURE_ADJUDICATION_2026-09-06.md §§1–6
                     frozen at a75f4543227ff82ecbfec3c80bd9e9490a26576a;
                     no wording or instrument change after that point
                     inherits the freeze
F1 · F2 · F3         production readings taken by the founder against the
                     deployed program; fixture Works remain inert in production
lane record          WS2-08_HIERARCHICAL_MANUSCRIPT_STRUCTURE_DECIDE_2026-09-06.md
```

All four PASS results are class **R** — the deployed program's runtime. F6b is likewise class
R. No laboratory or merge-program result substitutes for any of them.

---

## 4 · What this closure does not do

```text
does not reclassify F6b — FAIL · R5 is permanent and is not reopened by SC-1
does not claim the write boundary was demonstrated — it was not
does not claim SC-1 is an independent blind replication — it is not
does not open BUILD-08B, 08C, 08D or 08E
does not touch BUILD-07F, its freeze, or its ungiven §2.2 act
does not change code, schema, migrations, or any runtime surface
does not assert Mentor verification
```

BUILD-08A is closed. The lane is not.
