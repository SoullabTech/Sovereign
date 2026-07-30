# Author Writing Walk — Founder, 2026-07-30

**Status**: record awaiting the walk · **Class**: observation only, no-build, doc-only
**Governs nothing.** Q1 (governing experience instrument) is unruled. This artifact does not
rule it, does not compare instruments, and confers no authority. Recommendations are
**not authorized** here — if something fails, the entry is *what happened*, not *what to change*.

---

## A. Observer constraints (verified 2026-07-30 on working tree)

Three known substrate conditions. A failure traceable to one of these is **not an experience
finding** — it is a known gap. Record it as such.

| # | Condition | Evidence | Walk question it can corrupt |
|---|---|---|---|
| C1 | **Imported work is not stored.** `import-docx` writes the upload to `os.tmpdir()`, converts, deletes the temp dir in `finally`, and returns JSON. Nothing persists server-side. | `app/api/book-studio/import-docx/route.ts:58,60,80,87` | "Can you bring work into it?" |
| C2 | **Drafts persist to the container filesystem, not Postgres.** `drafts/from-idea` does `fs.mkdir` + `fs.writeFile` to a drafts dir. In Docker this is container-local — **a rebuild or redeploy erases it.** | `app/api/book-studio/drafts/from-idea/route.ts:40,57` | "Can you leave with confidence?" · "Can you return and feel reconnected?" |
| C3 | **One workbench is reachable; there is no chooser.** `findOrCreateTable` selects `ORDER BY updated_at DESC LIMIT 1`, else inserts. A second table can exist in the DB and be unreachable from the page. | `app/book-studio/workbench/page.tsx:24-40` | "Does the software become the thing you're thinking about?" |

**C2 is the one to hold in mind.** If a deploy happens between leaving and returning, the room
will appear to have forgotten you. That would be the most damaging possible false finding.
Note the time of the walk; note whether a deploy occurred between sessions.

## B. What the founder seat cannot answer

`/book-studio/workbench` calls `requireFounder()` (`app/book-studio/workbench/page.tsx:45`), and
`/press` is public while "the editorial workspace stays founder-gated at `/book-studio`"
(`config/accessMatrix.ts:56`).

So **question 1 — "Can you find the room naturally?" — is structurally unanswerable from this
seat.** The walker both knows where the room is and holds the only credential that opens it.
Record question 1 as **not observable in this walk**. Do not record a pass.

Questions 2–6 are answerable from the founder seat.

## C. The record

Kelly's six questions, verbatim. Observations only.

1. *Can you find the room naturally?* — **NOT OBSERVABLE THIS WALK** (see §B)
2. *Can you bring work into it?* —
3. *Can you begin writing without hesitation?* —
4. *Can you leave with confidence?* —
5. *Can you return and feel reconnected?* —
6. *At any point, does the software become the thing you're thinking about instead of the work?* —

**If one fails, the next line is "What happened?" — nothing else.**

### Session log

- Walk start (date/time):
- Deploy occurred between sessions? (Y/N):
- Return session (date/time):
