# WS2-08 · HIERARCHICAL MANUSCRIPT STRUCTURE — lane record

```text
LANE        WS2-08-HIERARCHICAL-MANUSCRIPT-STRUCTURE-01
OPENED BY   founder message, 2026-09-06 (verbatim requirement carried in §1)
POSITION    after #1228 (merge / deploy / Keep a version / partition witness /
            ceiling_exceeded witness) — #1228 is NOT touched by this lane
STATUS      BUILD-08A ACCEPTED AS CANDIDATE CUT (founder, 2026-09-06) on branch
            claude/manuscript-chapter-segmentation-jlwnlj — FROZEN for its isolated
            PR / gates / merge / migration / production-witness cycle. NOT CLOSED.
            08B code HOLD · 08C code HOLD · 08D, 08E unbuilt.
FOLLOWS     WS2-05A structure tree · WS2-06A AuthorStructureCommand ·
            WS2-07 BUILD-07A frozen readState (structureContext inline)
PRECEDES    LONG-WORK SCOPED DEVELOPMENTAL READING (scope planner respects
            authored boundaries; 185/185 Elemental Alchemy acceptance)
```

---

## 1 · The requirement (founder, 2026-09-06)

> Writer Studio must not force the member to choose between one giant manuscript and hundreds
> of undifferentiated fragments. A Work may be addressable at fine-grained section level while
> remaining coherently organized as chapters and subchapters authored or confirmed by the member.

Segmentation and hierarchy are **related but distinct**. Sections with stable ids remain the
atomic writable/readable substrate. Hierarchy says how those sections belong together.

```text
WORK
├── Chapter 1                    depth 1
│   ├── Opening                  depth 2
│   ├── The First Movement       depth 2
│   │   ├── A smaller passage    depth 3
│   │   └── Another passage      depth 3
│   └── Closing                  depth 2
├── Chapter 2                    depth 1
└── Back Matter
```

Doctrine, unchanged: **MAIA may carry structure the author supplied; it may not author the
book's structure by guessing.**

---

## 2 · What the census found (2026-09-06, against `c84bf2d9`)

| Seam | State | Consequence |
|---|---|---|
| `lib/manuscript/ingest/segment.ts` | matched `#`/`##`/`###`, `Chapter N`, ALL-CAPS — then stripped the `#` count and returned only `position · heading · body` | **structure received, then flattened** |
| `app/api/sovereign/manuscripts/route.ts` | persisted `position · heading · body` only | depth never reached Source |
| `lib/manuscript/ingest/parseUpload.ts` | DOCX → Markdown keeps Word Heading 1/2 as `#`/`##` on purpose | the author's structure survives extraction and dies one step later |
| `manuscript_structure_units` (WS2-05A) | nested tree by `parent_id`; **no `level` column by ruling**; `kind` free text; `origin ∈ {member, imported, proposed}` | nesting substrate exists; `imported` is admitted by the CHECK and **produced by nothing** |
| `lib/manuscript/structure/review.ts` + `authorStructure.ts` (WS2-06A) | `ReviewedUnit{from,to,children}` validated whole-tree; member act writes units into an empty canonical structure | the confirm path exists for proposals; imported structure can ride it |
| `lib/manuscript/development/readState.ts` (BUILD-07A) | freezes `structureContext` inline + `structureFingerprint` | the reader already pins structure of the revision it read (§6) |
| `lib/manuscript/draftSections.ts` | `topology_change_requires_explicit_command` typed refusal | **no command anywhere splits, merges, inserts or reorders a draft section after ingest** |
| `app/writers-studio/canvas/StructuredOutline.tsx` | nested outline by authored divisions when structure exists | outline can draw hierarchy; nothing feeds it from an import |
| `app/writers-studio/develop/DevelopRoom.tsx` | no section navigator; divisions appear only as labels in evidence | DEVELOP is structurally blind |
| `lib/manuscript/structure/detect.ts` | WS2-05B ground material, imported by nothing, own record of failing on a real book | stays unwired; this lane does not need it |

The gap is not the tree. The gap is that **explicit depth is discarded at the door**, that no
path produces `imported` units, and that WRITE has no section-topology commands.

---

## 3 · The model — reconciled with WS2-05A

The founder's sketch put `structure_level 1|2|3|null` and `structure_source` on the section.
WS2-05A ruled against a `level` integer on the **structure tree** (depth is the tree; `kind`
is the member's word). Both hold, because they describe different things:

```text
manuscript_sections (SOURCE, immutable custody)        ← WS2-08A adds:
  heading_depth    1 | 2 | 3 | NULL     the depth the DOCUMENT stated
  heading_signal   markdown | chapter | caps | member | NULL
                                         the mechanical rule that produced the boundary

manuscript_structure_units (WORKING structure, WS2-05A) ← unchanged
  parent_id / position / kind / title / origin
```

Mapping to the founder's vocabulary:

| founder | here |
|---|---|
| `explicit` | `heading_depth IS NOT NULL` (signal `markdown` or `chapter`) |
| `member` | `heading_signal = 'member'` at Source; `origin = 'member'` on a unit |
| `unclassified` | `heading_depth IS NULL` — ALL-CAPS boundary, member cut, untitled, pre-migration |
| level 1/2/3 | tree depth of an `origin = 'imported'` unit, derived from `heading_depth` |

Classification table (implemented in `segment.ts`):

```text
# Heading          → depth 1     markdown
## Heading         → depth 2     markdown
### Heading        → depth 3     markdown
Word Heading 1/2   → depth 1/2   (already `#`/`##` after DOCX extraction)
Chapter N …        → depth 1     chapter   (from the document's wording; "CHAPTER ONE" too —
                                            wording is explicit even when set in caps)
ALL CAPS           → boundary,   caps      depth NULL — never a chapter by default
member cut         → boundary,   member    depth NULL until the member assigns one
```

**`heading_signal` is one value by precedence, not exhaustive provenance** (founder precision,
2026-09-06). `# CHAPTER ONE` carries markdown, chapter wording and caps at once; the field
records the classifier that decided the depth, in the fixed order markdown > chapter > caps.
It never claims the other signals were absent; they are re-derivable from the verbatim heading.

**`heading_depth`, not `structure_level`** (founder ruling). It records what the source supplied
or explicitly signalled, never the eventual canonical depth of a structure unit.

**`CHAPTER ONE` is a chapter signal in any case** (founder ruling). Explicit lexical authorship
outranks the generic caps heuristic: the author named the unit a chapter.

**Source remains untouched by WRITE.** Source records the arrival; the working draft's
structure is the WS2-05A tree over draft sections. A member reorganising in WRITE never
rewrites `heading_depth`.

---

## 4 · Build units

```text
BUILD-08A  preserve explicit heading depth at ingest            ← THIS BRANCH
           segment() classifies · preview carries · confirm persists ·
           GET /manuscripts/[id] returns · pure fold to ReviewedUnit tree
BUILD-08B  member-confirmed imported hierarchy
           a surface that shows the WHOLE derived tree, then one member act writes
           units with origin='imported' via the WS2-06A plan path (validateReviewed +
           writePlan); refuses into a non-empty canonical structure, as 06A does
BUILD-08C  section topology commands (the missing counterpart of
           topology_change_requires_explicit_command)
           split here · merge with previous · rename heading — on draft sections,
           byte-identical flattening proven before and after, revision recorded
BUILD-08D  nested WRITE outline gestures
           chapter / subchapter / section (assign depth by reparent) · promote · demote ·
           collapse/expand — over existing structureService gestures; drag/reorder deferred
           (moves prose; a stronger act)
BUILD-08E  structure revision binding (see §6)
```

08A is the founder's first named sub-step and the only one built here. **08B–08E open on a
separate founder act each**; nothing in this record is implementation authority for them.

### Sequencing correction (founder act, 2026-09-06)

08B precedes 08C, **and no mutating topology command may exist before a minimum structure
revision/digest binding does.** Either 08B creates the first structure digest/revision binding
when it writes imported units, or the thin part of 08E that establishes it lands before 08C.
Otherwise the first split/merge/reorder acts against a tree whose prior state cannot later be
identified precisely, and a ledger added afterwards documents the future while leaving the
first mutations historically ambiguous.

```text
08A  preserve arrived hierarchy evidence                       ← this branch
 ↓
08B  explicit member confirmation → imported canonical structure
 ↓
     minimum structure revision / digest binding
 ↓
08C  split / merge / rename / reorder
 ↓
08D  nested WRITE gestures
 ↓
08E  complete revision-ledger machinery
```

### 08B boundary, fixed now so the hold is not a vacuum

- The folded imported tree is a **proposal until the member's explicit confirm act**. No
  `origin = 'imported'` canonical unit exists merely because the system can derive one.
- Confirmation is **replay-safe**: a second confirm must not duplicate the tree. (06A's
  refusal into a non-empty canonical structure is the existing shape of that guarantee.)

### 08A isolation (founder act)

```text
→ PR containing 08A only        SoullabTech/Sovereign#1230 (opened 2026-09-06)
→ CI green
→ F6a production pre-state captured        ← BEFORE merge; cannot be recovered after
→ merge
→ migration executes
→ F1  DOCX H1/H2 + decisive signal
  F2  mixed caps/chapter precedence fixture
  F3  member cut → member / NULL
  F6b compare against frozen F6a
→ all PASS → 08A CLOSED → founder act opens 08B
```

**Branch freeze (founder, 2026-09-06): no further branch changes unless CI or review produces
evidence requiring one.** The commit carrying this sequence is docs-only; see the SHA binding
in §5.

08A carries an additive migration with its own production falsifiers; adding 08B before the
migration is witnessed would prove the combined system rather than this substrate cut.

---

## 5 · BUILD-08A — what landed on this branch

| File | Change |
|---|---|
| `lib/manuscript/ingest/segment.ts` | `HeadingDepth`, `HeadingSignal`; `classifyHeading()`; `SectionInput` gains optional `headingDepth` / `headingSignal` (additive — every existing constructor stays valid); carried orphans keep their own depth |
| `lib/manuscript/ingest/__tests__/segment.test.ts` | six falsifiers (markdown depth; Chapter wording; caps = null; preamble/blob = null; orphan keeps depth; mixed signals) |
| `database/migrations/20260906000001_manuscript_section_heading_depth.sql` | two nullable additive columns + CHECKs; `depth_requires_heading` constraint; pre-existing rows read as unclassified, which is true |
| `app/api/sovereign/manuscripts/route.ts` | confirm step coerces depth fields (never refuses the save over them); INSERT persists them |
| `app/api/sovereign/manuscripts/[id]/route.ts` | sections carry `headingDepth` / `headingSignal` on read |
| `app/press/manuscript/page.tsx` | preview shows arrived depth (indent + H1/H2/H3 tag only when explicit); a member cut is `signal = member`, depth null |
| `lib/manuscript/structure/importedStructure.ts` | `deriveImportedStructure()` — pure, deterministic fold of depths into `ReviewedUnit[]`; unclassified boundaries never open a unit; `validateImportedStructure()` proves the fold against the 06A validator |
| `lib/manuscript/structure/__tests__/importedStructure.test.ts` | five falsifiers incl. **185 ALL-CAPS cuts → 0 units, 185 unplaced** |

Zero-character property: no change here reads or rewrites a member's text. Depth is metadata
on the arrival; the fold holds sections by reference.

### Falsifiers for 08A closure (prospective)

```text
F1  DOCX Heading 1 / Heading 2 arrive on Source as heading_depth 1 / 2, each with the
    corresponding decisive signal (markdown — DOCX extraction renders them as #/##)
F2  GENERIC CAPS DO NOT MANUFACTURE HIERARCHY. An ALL-CAPS manuscript whose boundary
    headings carry no markdown depth and no recognised chapter wording persists them as
    heading_signal = 'caps', heading_depth = NULL. Explicit chapter wording, INCLUDING
    when uppercase, is classified 'chapter' at depth 1. The production fixture holds
    both cases so the precedence rule itself is witnessed, not one side of it:
        PART ONE             → caps    / NULL
        CHAPTER ONE          → chapter / 1
        THE HOUSE AT NIGHT   → caps    / NULL
        CHAPTER TWO          → chapter / 1
F3  a member-drawn cut at confirm persists heading_signal = 'member', heading_depth = NULL —
    unless the member explicitly assigns hierarchy through a later confirmation act
    (not designed here)
F4  deriveImportedStructure on F1 validates under validateReviewed with no refusal
F5  deriveImportedStructure on a caps-only manuscript (no chapter wording) yields zero
    units — no chapter is invented; on the F2 fixture it yields exactly two units
    (CHAPTER ONE, CHAPTER TWO), PART ONE unplaced, THE HOUSE AT NIGHT inside CHAPTER ONE
F6  pre-existing rows are NOT REWRITTEN by the migration and read as unclassified. "Old
    rows are NULL" and "the migration did not rewrite old rows" are different claims, and
    the second cannot be established after the fact — so F6 is two acts:

    F6a PRE-MIGRATION BASELINE (captured on production BEFORE merge/migration)
        the whole manuscript_sections population, projected as
          row count · id · manuscript_id · position · heading · sha256(body)
        bound to: production host · capture timestamp · running GIT_COMMIT ·
        migration ledger state (last applied migration)
        stored where the witness can read it back unchanged (a file with its own digest)

    F6b POST-MIGRATION COMPARISON (same projection, after the migration ran)
        same row count · same ids · same positions · same headings · same body digests
        AND heading_depth IS NULL and heading_signal IS NULL on every F6a row
        Any difference in the projection is a FAIL; a NULL-only observation without
        F6a is not F6.
F7  segment() output for any text is unchanged in position · heading · body (omission
    control still lossless)
```

### F6a — production baseline RECORDED (2026-09-06)

Captured on minisforum by the founder, from the exact scripts delivered on custody branch
`claude/ws2-08a-witness-custody-01` @ `cd6da64a02271cce14ea52502c054f7aa16e3cc8`
(`scripts/witness/ws2-08a-f6a-baseline.sh`, `scripts/witness/ws2-08a-f6b-compare.sh`), hashes
verified on the Mac Studio and again after transfer to minisforum. Read-only against production;
no database write; merge and migration untouched.

```text
directory            /home/soullab/ws2-08a-witness/f6a-20260906T122035Z
host / captured UTC  minisforum · 2026-09-06T12:20:35Z
running GIT_COMMIT   66da58b4c
snapshot             324263:324263:        (single REPEATABLE READ READ ONLY transaction)
server_encoding      UTF8

population           manuscript_sections · 810 rows (811 physical CSV lines incl. header)
  csv sha256         fc98b19a2584cd878ca64c7d9f1300cc5227f82cbae45d8c0042db7b7f9d884d
migration ledger     schema_migrations · 517 rows, whole ledger as JSON lines
  ledger sha256      5db847c6ed7221f4f69da6ad11e9bdfa4daa976a24b7eb24dd86d2aa2aa9aec8
manifest sha256      db85c5cb721f2a2011df04130ff3649133fb250b5cadee8462e5c40c8a827e5b
instrument           F6a script sha256 fd2d6a3f0d8115d7b132233435c2f56ae0b853707f9ac6dec7c0e8ed40c79eeb
                     F6b script sha256 f74abf0c1cb721514cc20a8be037283dc8058ebbb2f43204d2ca7dcb4d48759f

write-boundary counters at baseline (pg_stat_user_tables · manuscript_sections)
  n_tup_ins 812 · n_tup_upd 0 · n_tup_del 2 · n_tup_hot_upd 0 · stats_reset never
  (baseline values only — not a claim about history; F6b requires upd / del / hot_upd and
   the stats_reset epoch unchanged across the interval)
```

Founder adjudication of the capture: script custody PASS · pre-migration guard PASS ·
single-snapshot F6a PASS · raw baseline retained PASS · artifact custody PASS (manifest sidecar
equals the manifest digest; CSV and ledger digests equal the values embedded in the manifest,
independently rehashed after capture).

**Evidentiary ceiling of the write-boundary evidence (founder ruling, 2026-09-06).** The DML
counters OBSERVE updates and deletes; they do not prevent them. The claim F6b can make is:

```text
baseline equality + unchanged DML counters + unchanged stats-reset epoch
    = NO DETECTED INTERVENING MUTATION
```

not that the database was physically incapable of receiving one. An actual maintenance /
write freeze across the interval would upgrade this to the stronger claim. The F6a script's
own comments still say "positive guarantee"; the script bytes are custody-bound and are not
edited — this paragraph is the governing wording, and the manifest records the actual
counters and the comparison rule.

Standing after F6a:

```text
PR #1230 merge     HOLD — released only after this record is adjudicated
migration          NOT RUN
08B                HOLD
```

F2's wording was corrected 2026-09-06 (founder): the earlier "NULL depth on every row" contradicted
the ruling that `CHAPTER ONE` in caps is chapter wording. F2's fixture and F5's second half are
also pinned as unit tests on this branch. F4–F5, F7 are unit-tested; **F1–F3, F6 need a production
witness after migration**, run exactly as written above.

### Test counts on this branch (one truth, two scopes)

| scope | suites | tests |
|---|---|---|
| targeted subset — segment · parseUpload · sourceCustody · importedStructure | 4 | 52 |
| touched-suite gate — the subset **plus** `review.test.ts`, the validator the fold must satisfy | 5 | 88 |

Both pass. The 52 are the tests this cut adds or directly exercises; the 88 are the gate run
before push. (Earlier reports said 85/50 then 86/50: one test was added for the caps
`CHAPTER ONE` ruling, then two for the corrected F2 fixture.) `npm run typecheck`: no
regressions against baseline.

**SHA binding — historical transition (amended once, 2026-09-06, founder ruling).**

```text
685e205b   original tested 08A code head. 52 / 88 suites + typecheck gate first taken here.
           Commits after it up to 167dc002 were docs-only (empty non-docs diff, verified).
66da58b4c  production / base parent — the running GIT_COMMIT witnessed by F6a.
4cd79e947  INTEGRATION CANDIDATE = merge of 66da58b4c into 167dc002, made after F6a capture.
           parents: 167dc002330ee9597b82e96f688320497bdac049 · 66da58b4c4a4979240db460c045dd9daf1cd47d3
```

Verified on `4cd79e947`:

- PR diff against `clean-main-no-secrets` is exactly the 08A surface (eight code/test/migration
  files + the docs, board and session anchor). No unrelated base work entered the diff.
- All eight 08A files are **blob-identical** to their `685e205b` versions (`git rev-parse
  685e205b:<f>` equals `4cd79e947:<f>` for each).
- Re-run on the merged tree: targeted subset **52 / 52**, touched-suite gate **88 / 88**,
  `npm run typecheck` no regressions, `check:no-supabase` clean. Lockfile unchanged since
  `685e205b`, so the installed dependency set is the same.
- CI on `4cd79e947`: sovereignty, check-diagrams, TypeScript no-regression gate, covenant-gates,
  Empty database reconstruction, Axis 1 adjudication, auto-label green; Docker build in
  progress at the time of this record.

The relationship F6a → candidate is therefore clean: the baseline is bound to the production
parent of the candidate, and F6a is **not** recaptured.

```text
production baseline witnessed   66da58b4c
                                 |
                                 +---- 08A line (685e205b … 167dc002)
                                          |
                                     4cd79e947   candidate
```

Any commit after `4cd79e947` on this branch must show an empty non-docs diff against it:

```bash
git diff --stat 4cd79e947..<head> -- . ':!docs' ':!CLAUDE.md'   # must print nothing
```

A push that makes that diff non-empty inherits nothing from this standing; it re-runs both
scopes and re-records.

### F6a — production baseline RECORDED (2026-09-06)

Captured on minisforum by the founder, from the exact scripts delivered on custody branch
`claude/ws2-08a-witness-custody-01` @ `cd6da64a02271cce14ea52502c054f7aa16e3cc8`
(`scripts/witness/ws2-08a-f6a-baseline.sh`, `scripts/witness/ws2-08a-f6b-compare.sh`), hashes
verified on the Mac Studio and again after transfer to minisforum. Read-only against production;
no database write; merge and migration untouched.

```text
directory            /home/soullab/ws2-08a-witness/f6a-20260906T122035Z
host / captured UTC  minisforum · 2026-09-06T12:20:35Z
running GIT_COMMIT   66da58b4c
snapshot             324263:324263:        (single REPEATABLE READ READ ONLY transaction)
server_encoding      UTF8

population           manuscript_sections · 810 rows (811 physical CSV lines incl. header)
  csv sha256         fc98b19a2584cd878ca64c7d9f1300cc5227f82cbae45d8c0042db7b7f9d884d
migration ledger     schema_migrations · 517 rows, whole ledger as JSON lines
  ledger sha256      5db847c6ed7221f4f69da6ad11e9bdfa4daa976a24b7eb24dd86d2aa2aa9aec8
manifest sha256      db85c5cb721f2a2011df04130ff3649133fb250b5cadee8462e5c40c8a827e5b
instrument           F6a script sha256 fd2d6a3f0d8115d7b132233435c2f56ae0b853707f9ac6dec7c0e8ed40c79eeb
                     F6b script sha256 f74abf0c1cb721514cc20a8be037283dc8058ebbb2f43204d2ca7dcb4d48759f

write-boundary counters at baseline (pg_stat_user_tables · manuscript_sections)
  n_tup_ins 812 · n_tup_upd 0 · n_tup_del 2 · n_tup_hot_upd 0 · stats_reset never
  (baseline values only — not a claim about history; F6b requires upd / del / hot_upd and
   the stats_reset epoch unchanged across the interval)
```

Founder adjudication of the capture: script custody PASS · pre-migration guard PASS ·
single-snapshot F6a PASS · raw baseline retained PASS · artifact custody PASS (manifest sidecar
equals the manifest digest; CSV and ledger digests equal the values embedded in the manifest,
independently rehashed after capture).

**Evidentiary ceiling of the write-boundary evidence (founder ruling, 2026-09-06).** The DML
counters OBSERVE updates and deletes; they do not prevent them. The claim F6b can make is:

```text
baseline equality + unchanged DML counters + unchanged stats-reset epoch
    = NO DETECTED INTERVENING MUTATION
```

not that the database was physically incapable of receiving one. An actual maintenance /
write freeze across the interval would upgrade this to the stronger claim. The F6a script's
own comments still say "positive guarantee"; the script bytes are custody-bound and are not
edited — this paragraph is the governing wording, and the manifest records the actual
counters and the comparison rule.

Standing after F6a:

```text
PR #1230 merge     HOLD — released only after this record is adjudicated
migration          NOT RUN
08B                HOLD
```

F2's wording was corrected 2026-09-06 (founder): the earlier "NULL depth on every row" contradicted
the ruling that `CHAPTER ONE` in caps is chapter wording. F2's fixture and F5's second half are
also pinned as unit tests on this branch. F4–F5, F7 are unit-tested; **F1–F3, F6 need a production
witness after migration**, run exactly as written above.

### Test counts on this branch (one truth, two scopes)

| scope | suites | tests |
|---|---|---|
| targeted subset — segment · parseUpload · sourceCustody · importedStructure | 4 | 52 |
| touched-suite gate — the subset **plus** `review.test.ts`, the validator the fold must satisfy | 5 | 88 |

Both pass. The 52 are the tests this cut adds or directly exercises; the 88 are the gate run
before push. (Earlier reports said 85/50 then 86/50: one test was added for the caps
`CHAPTER ONE` ruling, then two for the corrected F2 fixture.) `npm run typecheck`: no
regressions against baseline.

**SHA binding.** These counts and the typecheck result were taken on **`685e205b`**, the last
commit on the branch that touches code or tests. Every later commit on the branch is
docs-only, verifiable as an empty diff:

```bash
git diff --stat 685e205b..<head> -- . ':!docs' ':!CLAUDE.md'   # must print nothing
```

The production witness (F1, F2, F3, F6a/F6b) binds to the merged code tree of `685e205b`
likewise. An intervening push that makes that diff non-empty inherits nothing from this
standing; it re-runs both scopes and re-records.

---

## 6 · The deeper requirement — structure is revision-bound

The whole-Work reader pins one revision, so it must pin that revision's structure. Otherwise:

```text
revision bytes unchanged
Chapter 4 promoted / demoted while a whole-Work run is active
→ text digest still matches
→ scopes now name a different book
```

**Already true on the reading side (BUILD-07A):** `DevelopmentalReadState` freezes
`structureContext` inline and carries `structureFingerprint`; a later structural change
mismatches the fingerprint and the reading reports it.

**Not yet true on the writing side:** `manuscript_structure_units` is mutable in place and has
no revision store (readState.ts says so, and freezes inline for exactly that reason). A
structural change is an authored state change even when no character moved. BUILD-08E must
give structure its own append-only ledger, or fold a structure digest into the working-draft
revision record, so that "the Work at revision N" names bytes **and** tree. Which of the two
is a design decision for that unit, not this one.

---

## 7 · What DEVELOP gets from this

Scope vocabulary already exists in `EvidenceRef` (section · section-run · structure-unit ·
structure-units · structure-topology). Once 08B produces units, "develop this chapter /
subchapter / section" is a scope over an existing ref kind. The long-work planner (next lane)
then yields the machine ceiling to authored boundaries:

```text
chapter fits under the ceiling      → one scope
chapter exceeds it                  → divide at its subchapter boundaries
subchapter exceeds it               → divide at explicit section boundaries
one atomic section exceeds it       → explicit refusal / member re-segments
```

Blind packing (sections 1–31, 32–67, …) is the fallback only where no authored boundary exists.

---

## 8 · Sovereignty checks (answered, not passed)

- **Uncertainty preserved:** unclassified depth is stored as NULL, shown as a boundary without
  a level, and never resolved by the system. The member assigns or leaves it.
- **Provenance:** `heading_signal` names the rule that produced every boundary; imported unit ids
  are minted from the section whose heading opened them; units carry `origin = 'imported'`.
- **New responsibility:** the confirm surface (08B) must show the whole derived tree before the
  act, as 06A requires for proposals. Auto-adopting the derived tree on ingest is refused by
  this record.
- **Invariant 14:** `kind` stays NULL on imported units; the vocabulary of divisions is the
  member's. "H1/H2/H3" appears only on the confirm-cuts surface as a description of the
  arriving markup, not as a name for the division.
