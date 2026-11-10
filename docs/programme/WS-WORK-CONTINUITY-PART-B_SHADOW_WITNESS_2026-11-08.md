# WS-WORK-CONTINUITY · Part B — disposable-database witness (2026-11-08)

Candidate: branch `feature/ws-work-continuity-part-a-suite` (PR #2188, draft). Run by Claude Code on the Mac Studio against a
throwaway loopback PostgreSQL 16 cluster, fictional data only, destroyed afterwards. Production untouched. Migration NOT applied anywhere real.

## What ran
The real migration chain (living_works → ask_threads → context_disclosure_receipts → three boundary/gesture widenings →
`20261108000001_work_reading_scope`) applied cleanly, then `tests/constitutional/ws-work-read-scope/dynamic/scope.probe.test.ts`
ran the REAL store and receipt code against it: **6 / 6 pass**.

## Established (physical)
- No events ⇒ no grant; another member cannot write events on a Work they do not own; another member never sees them.
- Grant → revoke → re-grant derive from events, latest wins.
- The database itself refuses UPDATE, TRUNCATE and direct DELETE of events, and a level on revoke / none on grant.
- A standing receipt requires its scope event; a non-standing receipt may not carry one; `scope_event_id` is immutable; confirm works.
- `ask_turn_reads` records per-turn digests, latest wins, member-scoped on read AND write, append-only.
- Removing the Work removes its events (the only lawful deletion).

## NOT established
- Stubs stood in for `members`, `member_manuscripts`, `runtime_consent_state`, `provenance_tombstones` (their own migrations were not applied).
- The Ask ROUTE, the model, section selection against real manuscripts, Sanctuary signalling from the client, and any UI were not exercised.
- Concurrency (two Asks racing a revoke) was not exercised; revocation is checked at the start of each Ask, so an Ask already past that check completes.
- Not a founder walk. MAIA's behaviour with this scope is UNKNOWN until the fictional-manuscript walk.

Run: provision a loopback database, apply the migrations above plus the stubs, then
`WS_READ_SCOPE_DYNAMIC=fictional-only DATABASE_URL=postgresql://…@127.0.0.1:PORT/db npx jest tests/constitutional/ws-work-read-scope/dynamic`.
