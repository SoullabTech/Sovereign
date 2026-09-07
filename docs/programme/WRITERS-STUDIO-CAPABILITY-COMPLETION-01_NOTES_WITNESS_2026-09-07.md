# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## NOTES v1 — PRODUCT WITNESS

**Authority** founder ruling: *implementation-complete, but not yet
product-witnessed — one real writer act before Notes is accepted.*
**Served commit** `6cb73ad2d` (clean tree; the exact Notes build)
**Environment** LOCAL ONLY — ephemeral PostgreSQL 16.13, `UTF8`, in this
session's container. ⛔ **Production untouched. No migration applied anywhere
but here.**
**Script** `scripts/witness/notes-v1-witness.mjs`

---

## THE ACT

> *Catch a thought while writing → keep it → leave → return → find it exactly
> where you expect it.*

```text
1. writing on the table, Notes opened beside it — no navigation away
2. anchor offered: "beside “The Nature of Change”"
3. caught it with ⌘↵ · it appeared beside the writing = 1
4. left the room entirely — Studio Home
5. returned · found = true · anchor = live · reads "The Nature of Change"
             · rail row "Notes 1"

WITNESS PASS
```

**The product question is answered.** The thought was caught without leaving the
writing, and it was where the writer would look for it on return.

## WHAT ELSE THE RUNNING SYSTEM SHOWED

**FR-C is visible, not merely asserted.** The rendered rail text:

```text
Goals | not built yet        Insights | in Develop
Discover | not built yet     Structure | 2
Suggestions | not built yet  Versions | 1
Find/Replace | not built yet Statistics | (actionable)
Timeline | not built yet     Word Web | not built yet
```

Real counts, real state lines, and Insights naming where its function already
lives — the D1/D2 repair, working in a browser rather than in a test.

**FR-07 in the row.** With no Work declared, the note was still written and
`living_work_id` is null. A writer with no declared Work can still think.

**FR-08 against the live database and the live render** — not the pinned SQL:

```text
before deleting the section   anchored=true   heading="The Nature of Change"
after  deleting the section   rows=1  anchored=false  heading="The Nature of Change"
as the writer then sees it    anchor kind = former
                              "Previously attached to “The Nature of Change”"
```

The section was deleted; the thought survived, demoted, and said where it had
been — without being reattached to anything.

## ⚠️ THE INSTRUMENT PRODUCED TWO FALSE READINGS BEFORE A TRUE ONE

Recorded rather than quietly corrected, because both were reported mid-run:

1. **"Notes reads `unavailable` in the rail"** — a probe read the rail before
   hydration settled. Not a defect. I said it was one before checking.
2. **"WITNESS FAIL — the note did not appear"** — Playwright's `count()` does
   not auto-wait, so it ran before the notes fetch resolved and returned 0,
   while the auto-waiting assertions on the same page saw the loaded list. The
   note was in the database and rendering correctly the entire time.

> **An instrument that races the thing it measures reports the absence of its
> own patience.** The fix is in the script's header so the next run does not
> repeat it.

Related, and the reason this matters beyond this witness: earlier in this
session `tsc` was run in a container with **no `node_modules`**, exited on
config diagnostics without type-checking, and produced a "clean" reading that
meant nothing. Three false green/red readings in one session, all from
instruments, none from the code.

## STANDING

```text
NOTES v1
build             ✅ 6cb73ad2d
semantics         ✅ FR-07 · FR-08 verified against a live database
tests             ✅ 675/675
migration         ✅ local witness cluster only — NOT production
product witness   ✅ PASS — one writer act, this document

DEPLOY            NOT AUTHORIZED
PRODUCTION        untouched
NEXT              Goals — DECIDE from product meaning, not substrate
```
