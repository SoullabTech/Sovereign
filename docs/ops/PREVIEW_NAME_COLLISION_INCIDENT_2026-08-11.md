# Preview Name Collision — Killed Another Lane's Dev Server

**Date:** 2026-08-11 · **Status:** ⛔ **INCIDENT RECORD. Not a defect-family diagnostic — a specific event.**

> A `preview_start({name: "journal-cutover"})` call, intended to start a fresh server
> for this lane's cutover worktree, silently matched a pre-existing `.claude/launch.json`
> entry of the same name belonging to a different lane, serving a different worktree.
> The subsequent `preview_stop` **terminated that other lane's live process.**

---

## 1. What happened, in order

1. This lane created `/Users/soullab/maia-wt-journal-cutover` and needed a preview server.
2. `preview_start({name: "journal-cutover"})` was called, intending to create a new
   config entry for that worktree.
3. `.claude/launch.json` **already contained** an entry named `journal-cutover`,
   added by a different lane earlier in this session (see
   `SHARED_LOCAL_DATABASE_CUSTODY_RACE_2026-08-11.md` §1, which flagged this entry's
   existence and explicitly declined to investigate it further).
4. The tool matched by name and served **their** config — `--prefix
   /private/tmp/claude-501/.../scratchpad/cutover` — not this lane's worktree.
5. A verification walk was run against port 57218, producing text
   (`"Find in your journal"`, `"Browse the journal"`) that traces to **neither** this
   lane's source nor `UnifiedJournalView.tsx` — i.e., evidence from **unknown,
   unverified code**, nearly accepted as this lane's cutover proof.
6. `lsof -p <pid>` confirmed the served process's `cwd` was the foreign scratchpad
   path — caught **before** any result was reported as evidence.
7. `preview_stop` was called to detach from the wrongly-matched server. **This killed
   the process** (`ps -p <pid>` confirmed it no longer exists afterward). It was not a
   detach — it was a termination of another lane's live dev server.

## 2. What was NOT done

- The other lane's worktree, source, or files were not inspected or modified.
- The killed process was **not restarted** by this lane — doing so would assume
  authority over their environment this lane does not have, and risks compounding
  the intrusion rather than correcting it.
- Their `.claude/launch.json` entry was **not removed or altered** — only a
  distinctly-named entry (`journal-cutover-closure-lane`) was added alongside it.

## 3. Root cause

`.claude/launch.json` is a shared, unnamespaced file. Two independent lanes each
picked the same natural name (`journal-cutover`) for their own preview config with no
mechanism to detect or prevent the collision. `preview_start`'s name-match semantics
assume the name uniquely identifies the caller's intended target — an assumption this
shared, first-writer-wins file cannot guarantee.

**This is the same defect family as the three custody-race records
(`SHARED_GIT_HOOK`, `SHARED_CHECKOUT_SOURCE`, `SHARED_LOCAL_DATABASE`), one layer up:
shared tooling configuration, not source or data.** Not written as a fourth formal
defect record here — flagged for whoever owns that family to fold in or extend.

## 4. Consequence for the cutover proof

The proof walk run against port 57218 is **void** — its evidence traces to unverified
code, not this lane's candidate. It was caught before being reported and is not
carried into `JOURNAL_CUTOVER_PROOF_2026-08-11.md`. The walk was redone from
`journal-cutover-closure-lane` (port 3477 / autoPort), with `cwd` verified via `lsof`
before any result was treated as evidence.

## 5. What this lane owes the other one

**This lane killed a process it does not own, has no visibility into the intent or
state of, and cannot safely restart on the other lane's behalf.** If that lane
notices its server is down, this record is the explanation. No message-passing
mechanism was invented to notify them directly, per standing ruling (structural
custody evidence over conversational messages) — this record is the structural
trace.
