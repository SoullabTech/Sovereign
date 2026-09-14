# PROPOSAL-AUTHORIZATION-MIGRATION-STATE-01 — the environment state matrix

**Sublane of** `PROPOSAL-AUTHORIZATION-SEPARATION-01`, branch
`claude/proposal-authorization-separation`, from `a6f573537`.
**Status** READ-ONLY CENSUS. ⭐ **PRODUCTION READ 2026-09-14T13:24:37Z** (addendum 1).
**Status** ⛔ Nothing mutated. No DDL, no DML, no repair, no
retirement, no rename, no forward migration.

**Instrument** `scripts/witness/proposal-authorization-migration-state.sql` —
145 lines, **zero mutating statements**, catalog reads and two row counts only.
⛔ Reads no manuscript prose and no proposal content.

---

## ⭐⭐ THE MATRIX

```
                        10000004  13000002  13000003  14000001   shape        rows
fresh replay              ✓        FAIL      FAIL       —      collaborative   n/a
walk · maia_consciousness ABSENT   ABSENT    ABSENT   ABSENT      ABSENT       n/a
fw   · focus_witness      ABSENT   ABSENT    ABSENT   ABSENT      ABSENT       n/a
production                ABSENT   ABSENT    ABSENT   ABSENT      ABSENT       n/a
maia_focus_witness (Mac)  ABSENT   ABSENT    ABSENT   ABSENT   ⭐AUTHORIZATION  4 · 2 accepted
maia_07a_witness (Mac)    ABSENT   ABSENT    ABSENT   ABSENT      ABSENT       n/a
```

⭐⭐ **THE MATRIX IS CLOSED, AND THE LAST ROW CONTRADICTS ITS OWN LEDGER.** In
`maia_focus_witness` all four migrations are **ABSENT from `schema_migrations`**
while the authorization table **is fully present, with every EW-F1a constraint
and two accepted rows.** See addendum 3.

⭐⭐ **PRODUCTION READ 2026-09-14T13:24:37Z** by the founder, this instrument
unmodified, through `docker exec maia-postgres psql -U soullab
maia_consciousness`. See addendum 1 for the verbatim result and the two
instrument defects that run exposed.

⭐ **THE HEADLINE: in both databases this session can actually read, the
collision has never been reached — and each stops immediately before it.**

```
walk · maia_consciousness   625 tables · 464 ledger rows
                            high-water mark 20260910000003_pending_ask_consuming_act.sql
                            ⭐ ONE MIGRATION SHORT of 20260910000004.

fw   · focus_witness        716 tables · 528 ledger rows
                            high-water mark 20260909000001_context_disclosure_receipts.sql
```

⛔ Both are substantially-migrated real databases, **not empty scratch** — that
is why their `ABSENT` verdicts carry information. `manuscript_revision_proposals`
exists in neither, under any schema; the only `%revision%` tables in
`focus_witness` are `field_program_revisions`, `practice_field_revisions`,
`story_revisions`, `working_draft_revisions`.

⚠️ **Two other local databases were found and are reported as non-evidence:**
`empty_control` (0 tables, no ledger) and `dbg` (3 tables, no ledger). Neither
is part of this programme.

⚠️ **`focus_witness` is NOT the `maia_focus_witness` in which EW-F1a was
witnessed.** Its ledger ends 2026-09-10, three days before
`20260913000003` existed, so the EW-F1a constraints
(`mrp_execution_authority_vocabulary`, `mrp_inspection_only_never_accepted`)
cannot be in it and are not. ⛔ **The database that carried that witness is on
the founder's machine and is not reachable from here.** Reporting this one under
that name would have been the 2026-09-07 error repeated — *a witness is a
reading at a time, and of a named thing.*

---

## ⛔ PRODUCTION IS UNREACHABLE, AND THAT IS A RESULT, NOT A GAP TO FILL

```
ssh binary            ABSENT from this container
minisforum            getaddrinfo: Name or service not known
192.168.0.104:22      no route
DATABASE_URL / creds  none in this environment
```

⛔ **No inference is offered about production's state.** Not from migration
filenames, not from the fresh-replay result, not from the two local databases.
The 2026-09-07 drift incident is the precedent for why: production carried three
migrations nobody had recorded, and every reading that guessed was wrong twice
before the image timestamps settled it.

⭐ **The instrument is written to be run by the founder, unmodified, against
production** — it is safe there by construction:

```bash
ssh soullab@minisforum 'docker exec -i maia-postgres \
  psql -U soullab maia_consciousness' \
  < scripts/witness/proposal-authorization-migration-state.sql
```

and against the Mac Studio's witness database:

```bash
psql "$MAIA_FOCUS_WITNESS_URL" \
  -f scripts/witness/proposal-authorization-migration-state.sql
```

⚠️ **Sections 1a, 3 and 7 are the ones that decide the ruling**: the ledger's own
shape, the mechanical shape verdict, and whether any environment carries
**accepted** authorization rows (§8).

---

## The fresh-replay row, restated precisely

Reproduced on a disposable database with minimal stubs (`members`,
`member_manuscripts`, `manuscript_working_drafts`, `manuscript_draft_sections`,
`ask_threads`, `ask_turns`), migrations applied in filename order:

```
20260910000004   applied · 0 errors · creates the COLLABORATIVE shape
20260913000002   NOTICE: relation already exists, skipping
                 ERROR:  column "work_id" does not exist
20260913000003   ERROR:  column "accepted_at" does not exist
```

⛔ **And the runner stops on the first failure, each migration in its own
transaction. So on a fresh database, "afterward" is unreachable** — a later
reconciliation migration can never run. **That is why this is a bootstrap
defect and not a naming collision.**

---

## ⚠️ Two instrument defects, found and repaired during the run

**The census assumed the ledger's column name.** The first draft joined on
`schema_migrations.version`; the real column is `filename`. ⛔ *An instrument
that assumes the shape of the thing it is censusing is not censusing it* — the
same class as Finding 0 itself, where filenames and resulting shape disagree.
Repaired: the identifier column is resolved from the catalog and the real query
is generated with `\gexec`, matching by substring so a stored path or a stripped
`.sql` both hit.

**An XML-based ledger probe was written, failed to parse, and was deleted rather
than patched.** It was cleverer than the problem.

⚠️ **What this session did to the environment, stated plainly:** four stopped
local clusters (`walk`, `fw`, `07f`, `16`) carried stale pidfiles from a previous
container life. Three were **started** to be read (`16/main` has no
`postgresql.conf` and did not start). ⛔ **Starting a stopped local cluster is
the only way to read it; no statement issued to any of them writes.** Production
was not touched because it cannot be reached.

---

## ⛔ Standing

```
state matrix            PARTIAL — 2 of 4 named environments read
production              UNREAD · UNREACHABLE from this session
maia_focus_witness      UNREAD · UNREACHABLE from this session
fresh replay            ⛔ COLLISION CONFIRMED · bootstrap defect

migration ruling        ⛔ BLOCKED until production and maia_focus_witness are read
retirement / rename /
amendment / forward
migration               ⛔ NONE AUTHORIZED, NONE PERFORMED
production              UNTOUCHED
```

⭐ **What the two readable rows already narrow.** If production and the Mac
witness also stop before `20260910000004`, then **no protected database has
executed any of the four**, and the repository's own precedent applies directly:
*correcting the executable migration history before it can execute is safer than
letting the bad state land and repairing it after.* ⛔ **If either has executed
them — especially if §8 reports accepted rows — that path closes and the ruling
is a different one.** Neither branch is chosen here.

---

# Addendum 1 — production, read 2026-09-14T13:24:37Z

**Founder-run, this instrument unmodified.** PostgreSQL 16.13 (Debian),
`maia_consciousness` on `maia-postgres`.

```
1a  ledger shape        schema_migrations (filename, applied_at, checksum)

1b  20260910000004_manuscript_revision_proposals          ABSENT
    20260913000002_manuscript_revision_proposals          ABSENT
    20260913000003_revision_proposal_execution_authority  ABSENT
    20260914000001_proposal_succession                    ABSENT

2   manuscript_revision_proposals  ABSENT
    proposal_chains                ABSENT
    proposal_versions              ABSENT

3   collaborative_markers 0 · authorization_markers 0 · columns 0 · ABSENT

4·5·6  no constraints, no indexes, no triggers   (0 rows each)
7      all three ABSENT
8      accepted_rows: table ABSENT
```

⭐⭐ **NOT ONE OF THE FOUR MIGRATIONS HAS EXECUTED IN PRODUCTION, AND NEITHER
ONTOLOGY EXISTS THERE.** No `manuscript_revision_proposals` in any shape, no
succession tables, and therefore **no authorization-shaped rows and no accepted
authorizations anywhere in production.**

⚠️ **The `20260914000001_proposal_succession` ABSENT is the expected and correct
reading, not a finding** — Step 1's migration was landed on a programme branch
under an explicitly non-production authorization and was never deployed. ⭐ **It
says so, and production agrees.**

---

## ⚠️ TWO INSTRUMENT DEFECTS THIS RUN EXPOSED — BOTH MINE

### ⛔⛔ The read-only guard passed vacuously on a file that did not exist

The first attempt ran `git fetch` / `git show` from `~`, which is not a
repository. Both failed — **and the shell redirect still created
`/tmp/mig-state.sql`, empty.** The safety check then reported:

```
grep -icE '^\s*(insert|update|delete|alter|...)' /tmp/mig-state.sql   →   0
```

⭐ **`0` on an empty file is indistinguishable from `0` on a safe script.** The
guard that existed to prove the file only reads instead proved nothing, and
`psql` went on to execute an empty file against production — harmless by luck,
not by design.

⛔ **This is the `IF NOT EXISTS` class exactly** — Finding 0 of the identity
census. A guard written to answer *"does this contain something forbidden?"*
cannot answer *"is there anything here at all?"*, and silence from an absent
subject reads as a pass.

**Repair: the check is POSITIVE.** Two assertions that a script actually
arrived, before the one that it only reads:

```
wc -l < /tmp/mig-state.sql          non-zero
grep -c 'SHAPE VERDICT' …           1
grep -icE '(insert|update|…)' …     0
```

### ⚠️ And the line-count expectation I published was STALE

I told the founder to expect `145` lines and to stop if any of the three checks
differed. The real file is **167** — it grew when the ledger discovery was
repaired, and I quoted the pre-repair number.

⛔ **A gate I supplied would have blocked a correct run.** The founder proceeded,
rightly: the two load-bearing checks (`SHAPE VERDICT` present, mutating
statements `0`) both held. ⭐ **But an exact expected line count is the wrong
assertion for a file under active repair** — it fails on every legitimate edit
and teaches whoever runs it to ignore the gate. The record keeps `non-zero`, not
a number.

---

## ⛔ Standing after addendum 1

```
production              ⭐ READ — all four migrations ABSENT · both ontologies
                        ABSENT · no accepted authorization rows
walk · maia_consciousness  READ — ABSENT, stops one migration short
fw   · focus_witness       READ — ABSENT, and NOT the EW-F1a witness database
maia_focus_witness (Mac)   ⛔ UNREAD — the one row still owed

migration ruling        ⛔ STILL BLOCKED on that row
retirement / rename /
amendment / forward
migration               ⛔ NONE AUTHORIZED, NONE PERFORMED
production              UNTOUCHED — the run wrote nothing
```

⭐ **Three of four rows now agree, and they agree in the direction that keeps
every repair strategy open**: no protected database has executed any of the
four, so the repository's own precedent applies — *correcting the executable
migration history before it can execute is safer than letting the bad state land
and repairing it afterwards.*

⛔ **The ruling is still not made here.** One environment is unread, and the
question it answers is the decisive one: **§8, whether any accepted
authorization rows exist anywhere.** If `maia_focus_witness` carries the EW-F1a
constraints — and the EW-F1a witness says something did — then that database has
executed `20260913000002` and `20260913000003`, and the shape of the repair
changes.

---

# Addendum 2 — the focus-witness row: THREE ATTEMPTS, STILL UNREAD

⛔ **FOUNDER RULING, 2026-09-14: `maia_focus_witness` STILL UNREAD. No census
claim may be made from any of the runs below.**

## Two distinct failure modes, kept apart because they fail differently

```
attempt 1   psql "$MAIA_FOCUS_WITNESS_URL" -f /tmp/mig-state.sql
            env var UNSET → psql defaulted to database "soullab" → FATAL
            never connected · failed LOUDLY · no output to misread

attempt 2   FW=$(… WHERE datname ~ 'focus|witness' … ORDER BY 1 LIMIT 1)
            CONNECTED — to maia_07a_witness
            failed QUIETLY · produced a complete, clean-looking 82-line census
            of the WRONG database
```

⭐⭐ **ATTEMPT 2 IS THE DANGEROUS ONE, AND IT IS THE INSTRUMENT'S DEFECT, NOT THE
OPERATOR'S.** The regex `focus|witness` matched `maia_07a_witness`; `ORDER BY 1
LIMIT 1` then chose one of **24 local databases** and said nothing about having
chosen. The three real candidates sat three rows further down:

```
maia_focus_witness
maia_focus_witness_20260910
maia_focus_witness_c44238e51
```

⛔ **A NAME MATCH IS NOT IDENTIFICATION** — the same error this whole census
exists to prevent (§3 classifies from the table, never from the filename), and I
wrote it into my own helper. Had that output been accepted as "the focus witness
row", the matrix would have carried a **false entry that looked clean**.

⚠️ **Loud failure is cheap; quiet failure is what costs.** Attempt 1 produced one
line of error and nothing to misread. Attempt 2 produced eighty-two lines of
correct-looking evidence about something nobody asked about.

## The procedure that actually names its target (founder)

⭐ Stricter than mine in three ways that matter: `-X` ignores any `psqlrc`,
`-Atc` **proves the target before the read**, and `ON_ERROR_STOP=1` refuses to
continue past a failure.

```bash
psql -X "postgresql://soullab@localhost:5432/maia_focus_witness" \
  -Atc "SELECT current_database(), current_user;"
```

⛔ **The first field must read `maia_focus_witness` or nothing proceeds.**

Then the file itself, before psql is allowed to read it:

```
line count       > 0            ⛔ not an exact number — see addendum 1
SHAPE VERDICT    present
mutating SQL     0
```

Then the read:

```bash
psql -X "postgresql://soullab@localhost:5432/maia_focus_witness" \
  -v ON_ERROR_STOP=1 -f /tmp/mig-state.sql > /tmp/mig-state-focus.txt 2>&1
```

⛔ **AND IF THAT DATABASE IS ABSENT, NOTHING IS CREATED.** The object of this
census is the historical witness that already existed; a fresh database of the
same name would answer a question nobody asked, in a way indistinguishable from
an answer.

## ⭐ An extra row, recorded honestly under its own name

Attempt 2's output is valid evidence — **about `maia_07a_witness`**, the
BUILD-07A evidence witness (PostgreSQL 17.7, Homebrew, aarch64):

```
maia_07a_witness    all four migrations ABSENT · all three tables ABSENT
                    shape ABSENT · accepted_rows: table ABSENT
```

⚠️ It is entered under that name, and it is **not** the focus-witness row.

## ⛔ The row still owed, and why it is the decisive one

The EW-F1a witness reports `mrp_inspection_only_never_accepted` and
`mrp_execution_authority_vocabulary` **refusing by name** — so
`20260913000002` and `20260913000003` executed **somewhere**. Nothing read so
far carries them: not production, not the walk database, not `focus_witness`
(container-local), not `maia_07a_witness`.

⛔ **If the three `maia_focus_witness*` databases do not carry them either, the
honest matrix entry is `UNLOCATED`, not a guess** — and the question becomes
which of the 24 local databases ran them. The list itself is suggestive
(`maia_i05_shadow_321cb1536`, `maia_containment_walk_95e7f5fdf`,
`maia_cutover_test`, `maia_bring_forward`), ⛔ but suggestive is not read.

---

# Addendum 3 — `maia_focus_witness` READ. The matrix is closed.

**Founder-run 2026-09-14T09:34:11-04:00**, PostgreSQL 17.7 (Homebrew), target
proven first (`current_database() = maia_focus_witness`), `-X`,
`ON_ERROR_STOP=1`. File verified at 167 lines · `SHAPE VERDICT` present ·
mutating SQL `0`.

```
1b  20260910000004   ABSENT      20260913000002   ABSENT
    20260913000003   ABSENT      20260914000001   ABSENT

2   manuscript_revision_proposals  ⭐ PRESENT
    proposal_chains                   ABSENT
    proposal_versions                 ABSENT

3   collaborative 0 · authorization 5 · columns 14 · ⭐ AUTHORIZATION

7   manuscript_revision_proposals    4 rows
8   accepted_rows                    ⭐⭐ 2
```

## ⭐⭐ THE FINDING: THE LEDGER AND THE SCHEMA DISAGREE

**All four migrations are ABSENT from `schema_migrations`. The authorization
table is fully present** — all 14 columns of the `20260913000002` shape, the
`execution_authority` column and default from `20260913000003`, and every
constraint those two migrations create:

```
manuscript_revision_proposals_expected_text_check
manuscript_revision_proposals_operation_check
mrp_acceptance_whole
mrp_execution_authority_vocabulary          ← 20260913000003
mrp_inspection_only_never_accepted          ← 20260913000003
mrp_execution_authority_immutable  (trigger) ← 20260913000003
```

⛔ **So this schema arrived by an act the ledger does not record.** Applied by
hand, or by a script that did not write its row. **The migrations did not
"execute" here in any sense the ledger can attest.**

⭐⭐ **THIS IS EXACTLY WHY THE RULING SAID *"do not classify from migration
filenames — classify from the table"*.** §1b alone reports this database as
clean. §3 reports the truth. **An instrument that had trusted the ledger would
have closed the matrix with a false all-clear on the one environment that
matters.**

⚠️ **And it is the 2026-09-07 class again**: schema reaching an environment
without a recorded authorizing act. ⛔ Local witness database, not production —
the exposure is nil and must not be inflated — **but the mechanism is the same,
and the record is again the thing that broke.**

## ⭐ Two accepted authorizations exist, and they are already known

`accepted_rows = 2`, in a database of 4 proposals. ⚠️ These are consistent with
the two acceptances the anchor already records for 2026-09-13 — *"twice a
proposal staged for inspection was accepted and the manuscript moved; the second
has no authorial act anywhere in the record"* — and with the standing v35/v36
finding (`system acceptance REAL · authorial ratification UNRESOLVED`).

⛔ **Consistent with, not proven to be.** This census read counts, never
content. Establishing that these two rows ARE those two acceptances is a
separate reading, and is not performed here.

## ⛔ What this does and does not unblock

```
no PROTECTED database has executed any of the four
  production                ABSENT · ledger and schema agree
  walk · maia_consciousness ABSENT · stops one migration short

the authorization shape exists in exactly ONE place read so far
  maia_focus_witness · local Mac witness · created OUTSIDE the ledger
  4 rows · 2 accepted

therefore
  ⭐ the executable migration history is STILL CORRECTABLE — the repository's
     precedent applies: correct it BEFORE it can execute, rather than let the
     bad state land and repair afterwards
  ⛔ but "these migrations have never run anywhere" is FALSE, and must not be
     written. Their effect exists, by an unrecorded act, with accepted rows
     under it
```

⛔ **The ruling is still the founder's to make, and this census makes none.**
What it hands over is the distinction the ruling turns on: **the protected
environments are clean and the executable history can still be corrected; the
one environment carrying the authorization shape got it outside the ledger, and
already holds two accepted authorizations.**

⚠️ **One question is now open that was not open before**: if the EW-F1a schema
reached `maia_focus_witness` without a ledger row, **what else in that database
arrived the same way** — and is its ledger a reliable account of it at all?
⛔ Not this lane's question, and not asked here.
