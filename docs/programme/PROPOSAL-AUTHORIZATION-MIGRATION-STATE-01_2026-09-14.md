# PROPOSAL-AUTHORIZATION-MIGRATION-STATE-01 — the environment state matrix

**Sublane of** `PROPOSAL-AUTHORIZATION-SEPARATION-01`, branch
`claude/proposal-authorization-separation`, from `a6f573537`.
**Status** READ-ONLY CENSUS. ⛔ Nothing mutated. No DDL, no DML, no repair, no
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
production                   ⛔ U N R E A C H A B L E   F R O M   T H I S   S E S S I O N
maia_focus_witness (Mac)     ⛔ U N R E A C H A B L E   F R O M   T H I S   S E S S I O N
```

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
