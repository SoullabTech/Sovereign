# WS2-08 · HIERARCHICAL MANUSCRIPT STRUCTURE — lane record

```text
LANE        WS2-08-HIERARCHICAL-MANUSCRIPT-STRUCTURE-01
OPENED BY   founder message, 2026-09-06 (verbatim requirement carried in §1)
POSITION    after #1228 (merge / deploy / Keep a version / partition witness /
            ceiling_exceeded witness) — #1228 is NOT touched by this lane
STATUS      BUILD-08A CLOSED / ACCEPTED (founder act, 2026-09-06).
            Acceptance basis F1 · F2 · F3 · SC-1 PASS, all class R.
            F6b remains FAIL · R5 permanently; SC-1 is a narrower successor
            claim (migration nonmutation of the 810 baseline rows), does not
            repair F6b, and is not outcome-blind.
            Closure authorizes nothing downstream.
            08B HOLD · UNOPENED · 08C code HOLD · 08D, 08E unauthorized.
            record: WS2-08-BUILD-08A_HEADING_DEPTH_CLOSURE_2026-09-06.md §1
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

### Merge, ledger-presence supplement, and closure standing (2026-09-06, after F6a)

**Merge RELEASED and executed.** Founder ruling: all current-head checks on `41e86e2b` completed
green, the Docker Build Check and the Canonical PR Quality Gate included; the base having moved
to `1116f7813` does not revoke the release and does not justify a freshness refresh. GitHub
accepted the merge without an up-to-date requirement, so no branch update was needed.

```text
PR #1230        MERGED 2026-09-06 (merge commit, not squash, not rebase)
merge commit    03e9d89a9aae9025b35bc59756be28cc44c00e6b
parents         1116f7813 (clean-main-no-secrets tip)  ·  41e86e2b (08A head, released)
08A code        blob-identical to 685e205b through the merge (no non-docs commit after 4cd79e947)
```

**Migration-prefix collision, bounded.** The base merged into the candidate carried
`20260906000001_developmental_observation_standing.sql`, which shares 08A's numeric prefix and
was applied on production at **11:36:34Z by the `66da58b4c` full deploy — before F6a was
captured at 12:20:35Z**, so that ledger row is *inside* F6a's 517-row baseline. (An earlier
revision of this paragraph placed it after F6a, with the `1116f7813` deploy; the ledger's
`applied_at` corrects that — chronology below.) The production runner (`scripts/apply-migrations.sh`) keys the ledger on the full
filename (`schema_migrations.filename` PRIMARY KEY), skips only exact filename matches, and
records the exact filename after application; ordering is a plain lexical glob, so the
developmental file runs first and `20260906000001_manuscript_section_heading_depth.sql` second.
The two touch different tables. The migration itself is unaffected. The checksum column exists
but this runner does not populate it.

What the collision does affect is F6b's **R6 presence test**, which matches the ledger on the
prefix substring (`LIKE '%20260906000001%'`): the developmental row already satisfies it, so
R6-present can read `>= 1` whether or not 08A's migration ran. Ruling (founder, 2026-09-06):
**F6b stays byte-identical** (custody digest `f74abf0c…8759f` unchanged); its R6 prefix test is
historically imperfect but bounded here; R6's other half (every F6a ledger row still present)
and R1–R5 are unaffected. The **decisive presence witness** is an exact-filename query run and
preserved after the deploy, because `filename` is the ledger identity:

```bash
docker exec maia-postgres psql -U soullab -d maia_consciousness -X -v ON_ERROR_STOP=1 -c \
"SELECT filename, applied_at
 FROM schema_migrations
 WHERE filename = '20260906000001_manuscript_section_heading_depth.sql';"
```

PASS = exactly one row. Zero rows or more than one row = FAIL, and 08A does not close.

**F6a stands.** Production moved from `66da58b4c` (F6a's witnessed commit) to `1116f7813` before
08A's migration. F6a is not recaptured (founder ruling); the wider interval is exactly what
F6b's equality checks and the DML counters / `stats_reset` epoch now do real work across. The
claim F6b can make is unchanged: no *detected* intervening mutation.

**Standing after merge** (superseded the same day by the deploy record below):

```text
PR #1230              MERGED · 03e9d89a
F6a                   PASS · retained (bound to 66da58b4c)
migration             NOT RUN at the time of this standing
08B                   HOLD
```

### Deploy of 03e9d89a — ESTABLISHED BY STATE EVIDENCE (2026-09-06, founder ruling)

Three deploy attempts of `03e9d89a` are known. The first ran on the **Mac Studio** by mistake
(lock at `/Users/soullab/…`, macOS temp dir) and exited at the dependency-audit step before
building anything: corepack's `pnpm` refused to run in an npm-pinned project and the script
reported the non-zero exit as "vulnerable packages detected" (pre-existing script defect, not a
vulnerability finding; `command -v pnpm` on minisforum → absent, so the step skips there). The
second, over ssh, was **refused by the deploy-lane lock** (holder: `pre-deploy-gate.sh
deploy-maia 50302f5d9`, started 13:58:56Z). The third — the one that actually ran, at ~13:34Z on
minisforum — has **no recovered transcript**: neither the founder nor this session can name the
terminal or session that ran it, and no provenance is manufactured for it.

Founder ruling: **state evidence is sufficient.** The transcript's purpose was to establish
facts; the durable post-state establishes them independently and, for migration identity, more
strongly than console prose:

```text
image          maia-sovereign:03e9d89a9 = 811a1b484ce3   built 13:34:08Z
container      Created 13:35:32Z from that image · DEPLOY_LANE=deploy-lane · GIT_COMMIT=03e9d89a9
ledger         20260906000001_manuscript_section_heading_depth.sql   applied_at 13:36:01.629937+00
               (29 s after the swap — the full-deploy ordering swap → verify → migrate)
schema         manuscript_sections.heading_depth · manuscript_sections.heading_signal   PRESENT
migrate-only   ruled out as the path: the shared checkout sat at 2d7873c86 (#1182), which does
               not carry the 08A migration file; only `deploy <SHA>` runs migrations from the snapshot
```

```text
03e9d89a DEPLOY        ESTABLISHED BY STATE EVIDENCE
migration              APPLIED · exact filename established by the ledger's own key
historical transcript  NOT RECOVERED · desirable · NON-BLOCKING
```

**Not preserved, stated explicitly** (the four log-level observations the transcript gate asked
for): the `DEPLOY TARGET (immutable): 03e9d89a` line; the per-file exact-filename verdicts
(`↪︎ Skipping` for the developmental file, `➡️ Applying… ✅ Applied` for 08A's); the dual
post-swap provenance verify (printenv == Config.Env == asserted); the historical smoke result.
The record does not claim that gate passed. It claims what the state shows.

**Migration chronology (from `schema_migrations.applied_at`, corrected):**

```text
11:36:34Z   20260906000001_developmental_observation_standing.sql   applied (66da58b4c deploy)
12:20:35Z   F6a baseline captured — the row above is INSIDE the 517-row ledger baseline
13:36:01Z   20260906000001_manuscript_section_heading_depth.sql     applied (03e9d89a deploy)
```

R6's prefix-only comparison therefore could never distinguish the two migrations; the
exact-filename ledger query is what closes that evidentiary weakness.

**Column gap that did not open.** The in-flight `deploy-maia 50302f5d` (image built 14:03:56Z)
swaps the app without running migrations. 08A's routes read and write the two columns
unconditionally, so had 08A reached production first by that path, manuscript reads and imports
would have failed until the migration ran. The migration was already in at 13:36:01Z; the
window never existed.

**Witness subject is now the current runtime, `50302f5d`.** Acceptance runs against whatever
container is live when the witnesses run. 08A's relation to it is inherited from `03e9d89a`:
the six blobs the witnesses depend on are identical at both commits and must remain so —

```text
473a6482a044  lib/manuscript/ingest/segment.ts
a3e7f8869ddc  lib/manuscript/structure/importedStructure.ts
de99485a007f  app/api/sovereign/manuscripts/route.ts
2b948e697d63  app/api/sovereign/manuscripts/[id]/route.ts
a06938c3ee4b  app/press/manuscript/page.tsx
f6d1dedc1f6e  database/migrations/20260906000001_manuscript_section_heading_depth.sql
```

(`git rev-parse <sha>:<path>` at `03e9d89a` and `50302f5d`.) Canonical still records WS2-08 as
not closed and names the 08A migration and fields.

**Witness order (founder-approved, reordered from the PR body):** F6b precedes anything that can
create cleanup deletes or updates, because its R5 compares the update / delete / hot-update
counters against F6a and an avoidable delete would fail it for a reason unrelated to the
migration. F1–F3 import manuscripts (inserts, informational under R4) and may clean up (deletes).

```text
1  current-runtime provenance + smoke on 50302f5d     ADMISSIBILITY of the subject
2  F6b                                                 PENDING
3  exact-filename ledger query (R6 supplement)         PENDING (output preserved)
4  F1                                                  PENDING
5  F2                                                  PENDING
6  F3                                                  PENDING
all PASS → BUILD-08A CLOSED → 08B still does not begin without a founder act
```

### Production witness results — steps 1–3 (2026-09-06, founder-adjudicated)

**Step 1 — runtime `50302f5d` ADMISSIBLE.** Container created 14:05:07Z from image
`76d5e7d377a2` (tag `50302f5d9`); `printenv GIT_COMMIT` = `Config.Env` = `/api/health.version`
= `50302f5d9`; `DEPLOY_LANE=deploy-lane`; health `ok`, database `ok`. Co-Lab gate **PASS
33 / 0 / 0** from the real instrument `scripts/verify-constitution-colab.ts` (run read-only by the
founder). The filename the session anchor and `docs/ops/COLAB_RELEASE_GATE.md` give,
`scripts/verify-colab-boundaries.ts`, has never existed on any branch (`git log --all` empty),
and the real script's own header repeats the wrong name — a documentation defect, tracked as a
separate task card, not this lane's. `pre-deploy-gate.sh` and the deploy smoke call the real
file.

> **POST-FAILURE CORRECTION — current authority.** The section below preserves the earlier
> 13:46 F6b interpretation as historical evidence; it is **not** the current F6b verdict.
> After the later R5 failure was adjudicated, `F6b = FAIL · R5` was fixed as a permanent
> historical result. SC-1 is a separately frozen, narrower successor criterion proving only
> migration nonmutation of the 810 baseline rows; it does not repair, supersede or reclassify
> F6b, and it is not outcome-blind. See
> `WS2-08A_POST_FAILURE_ADJUDICATION_2026-09-06.md` and the BUILD-08A closure record.

**Historical earlier ruling — overtaken:**

**Step 2 — F6b PASS, run of record `f6b-20260906T134621Z`.** Three F6b runs exist; the sealed
instrument's verdicts are kept exactly as each run printed them, never relabelled:

```text
run                        runtime     R1 R2 R3   R4    R5                   digest      verdict
f6b-20260906T134621Z       03e9d89a9    0  0  0   12    OK (ins 824 del 2)   == F6a      PASS   ← of record
f6b-20260906T141001Z       —            0  0  0    0    del 2→14             == F6a      FAIL
f6b-20260906T143816Z       50302f5d9    0  0  0    0    del 2→14             == F6a      FAIL
```

The 13:46 run is the one that answers F6: it ran on the released subject `03e9d89a`, ten
minutes after the migration was applied (13:36:01Z), with every baseline row present, old
fields identical, both new columns NULL on all 810 baseline ids, the reprojection digest
byte-identical to F6a (`fc98b19a…d884d`), the ledger preserved, and **no update or delete
detected across the interval**. The two later runs fail only R5, and the three snapshots bound
that failure exactly:

```text
12:20  F6a        ins 812 · del 2    baseline 810
13:46  F6b PASS   ins 824 · del 2    R4 = 12 post-baseline rows present
14:10  F6b FAIL   ins 824 · del 14   R4 = 0
14:38  F6b FAIL   ins 824 · del 14   R4 = 0
```

Between 13:46 and 14:10: no inserts, exactly twelve deletes, exactly the twelve post-baseline
rows gone, all 810 baseline rows intact and byte-identical. Ruling: the twelve deletes are
**attributed to cleanup of the twelve transient post-F6a rows** (two `/tmp/ws2-08a-f123-witness*.ts`
instruments were created on minisforum at 13:44Z, immediately before the 13:46 snapshot showed
those rows — strong circumstantial evidence they were 08A F1–F3 witness attempts); the **exact
cleanup process / operator is NOT RECOVERED**. #1233 is ruled out: its checkpoint route never
writes `manuscript_sections`. The later runs stay in custody as FAIL, labelled *expected cleanup
contamination*, and are not the F6b of record. `n_live_tup` (848) is a planner estimate;
`count(*)` = 810 is the population.

**Step 3 — exact-filename ledger query PASS.** Exactly one row:
`20260906000001_manuscript_section_heading_depth.sql · 2026-09-06 13:36:01.629937+00`, preserved
under `~/ws2-08a-witness/` with its own checksum (paired with the 13:46 F6b artifact and again
at 14:38 via `r6-exact-filename-*.txt`).

**Instrument notes for the F-checks.** The manuscripts table is `member_manuscripts` (not
`manuscripts`); `pg_stat_user_tables` has no `stats_reset` column on this cluster (it is in
`pg_stat_database`); witness titles generated by the founder's instrument are
`WS2-08A F<n> <timestamp>` — verify by the emitted manuscript id, not by title.

```text
DEPLOY / MIGRATION     ESTABLISHED
runtime 50302f5d       ADMISSIBLE · health PASS · Co-Lab PASS 33/0/0
F6a                    PASS
F6b                    HISTORICAL 13:46 PASS INTERPRETATION · OVERTAKEN; current verdict FAIL · R5 permanent
exact ledger           PASS
F1 · F2 · F3           still need an ACCEPTED production result
08A                    OPEN
08B                    HOLD
```

### F1 · F2 · F3 — PASS on production (2026-09-06T15:05:57Z) · BUILD-08A CLOSED / ACCEPTED

Run by the founder under an authenticated member against runtime `50302f5d9`, through the
ordinary ingest path (`/api/sovereign/manuscripts/ingest` → preview → confirm → Source). F1 took
the **stronger path**: a real generated `.docx` was uploaded, so the witness covers Word Heading
extraction and downstream classification, not only the classifier on pre-marked text. The
verification rows were sealed by an independent SQL read before any cleanup.

```text
instrument     /tmp/ws2-08a-f123-witness-v2.ts   (bytes not in git — digest is the custody)
sha256         8453343a997fda9ea9d32495929b753428527fda0a28c5eedbf7b763b42638d6
exit 0 · verdict PASS · failures=0

artifacts      /home/soullab/ws2-08a-witness/f123-20260906T150557Z
run.log                 af52438efbebc8274c0589ed9ba668e141cf5c23d7342d132c837af1e8586227
verification-rows.txt   6445356493421630dfb165ba520344ae20289e51d845cd24fae361152fe3f9ee
```

```text
F1  PASS   member_manuscripts ee2cd894-15e7-4c6c-a3bf-04b6b05a6c82   (real .docx, Heading 1 / Heading 2)
           0  F1 CHAPTER    1     markdown
           1  F1 SECTION    2     markdown
           run also witnessed: upload status · DOCX extraction preserved H1/H2 markers ·
           preview lossless · preview classified H1/H2 · confirmed save · Source persistence

F2  PASS   member_manuscripts a783d01a-f60f-4f5e-8b02-b743e8765b8a   (frozen fixture)
           0  PART ONE             NULL  caps
           1  CHAPTER ONE          1     chapter
           2  THE HOUSE AT NIGHT   NULL  caps
           3  CHAPTER TWO          1     chapter
           — exactly the precedence rule: caps never manufactures hierarchy; chapter wording,
             uppercase included, is depth 1

F3  PASS   member_manuscripts 367debc2-d7e1-4eea-be30-9f5f84daa077   (member-drawn cut)
           0  MEMBER CUT           NULL  member
```

**F6 artifacts, bound:**

```text
f6b-20260906T134621Z   run of record · PASS       manifest.sha256 5ef6b105156f4f1cc2d2eb07c49d0b357ce67114831fb43a16ada32fce1f7545
f6b-20260906T134621Z.exact-ledger.txt   paired     sha256          4c3ac12b731a554712c4586237366a0ee8032e6d0caec51b199e996ddfd3a6fb
f6b-20260906T141001Z   FAIL · R5 (cleanup)        manifest.sha256 49d159dfafd5076be888f146cd0d18c81ef33910bc3e95b66dce821e1cf21398
f6b-20260906T143816Z   FAIL · R5 (cleanup)        manifest in directory (14:38 listing above)
```

**Historical closure basis recorded before the post-failure adjudication — overtaken in its
F6b interpretation. BUILD-08A closure itself remains in force under the later founder act and
the F1 · F2 · F3 · SC-1 basis recorded at the top of this lane.**

```text
migration       PASS        F1              PASS · real DOCX production path
provenance      PASS        F2              PASS
health          PASS        F3              PASS
Co-Lab          PASS 33/0/0 F6a             PASS
                            F6b             HISTORICAL 13:46 PASS INTERPRETATION · OVERTAKEN
                            exact ledger    PASS

BUILD-08A       CLOSED / ACCEPTED
WS2-08          STILL OPEN — 08A closing clears the way for 08B; it does not close the lane
08B             HOLD — awaits an explicit founder act
08C             not before a minimum structure revision / digest binding
#1228           untouched throughout
```

The three test manuscripts remain on production under the ids above until the founder removes
them; their removal after this record is ordinary member data hygiene, not witness contamination
(the F6b of record is sealed).

**Parked, unchanged:** the draft-route `Response body … disturbed or locked` defect
(`PARKED_DEFECT_MANUSCRIPT_DRAFT_ROUTE_RESPONSE_BODY_2026-09-06.md`). #1233 added a sibling
`draft/checkpoint/route.ts` and did not modify `draft/route.ts`, so it neither fixes nor explains
it. Triage still opens only by founder act.

**Unrelated defect parked, not investigated.** While reading production logs during the
`66da58b4c` window the founder observed
`TypeError: Response body object should not be disturbed or locked` from
`app/api/sovereign/manuscripts/[id]/draft/route`. It predates 08A's migration and touches no
08A file. Recorded separately as
`docs/programme/PARKED_DEFECT_MANUSCRIPT_DRAFT_ROUTE_RESPONSE_BODY_2026-09-06.md`, status
UNTRIAGED · PARKED UNTIL 08A CLOSES. It is not a lane and is not part of 08A.

**Record hygiene.** An earlier revision of this file carried a second, stale copy of the F6a and
test-count sections (pre-amendment `685e205b`-only binding) below the amended one. That copy was
removed in this revision; the amended binding above is the only one that stands.

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
